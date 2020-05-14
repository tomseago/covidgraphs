const fs = require("fs");
const path = require("path");

const parse = require("csv-parse");

async function writeRecords(outDirname, name, list, single) {
    return new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(path.join(outDirname, `${name}.json`));

        stream.on("err", reject);
        stream.on("close", resolve);

        try {
            if (!single) stream.write("[");
            for (let i = 0; i < list.length; i += 1) {
                const rec = list[i];
                stream.write(JSON.stringify(rec));
                if (i + 1 < list.length) {
                    stream.write(",");
                }
            }
            if (!single) stream.write("]");

            stream.close();
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
}

async function injest(dirname) {

    const hospitalizations = fs.createReadStream(path.join(dirname, "Hospitalization_all_locs.csv"));
    const parser = parse();
    hospitalizations.pipe(parser);

    // Make sure we have an output directory
    const thisVersion = path.basename(dirname);
    const outDirname = path.join("data", thisVersion);
    try {
        fs.mkdirSync(outDirname);
    } catch (e) {
        if (e.code === "EEXIST") {
            // Perhaps nuke all the contents????
        } else {
            // Other issue, blow up
            throw e;
        }
    }

    let currentRegion = "";
    let currentRecs = [];
    let counts = {};

    const outputPromises = [];

    await new Promise((resolve, reject) => {
        parser.on("readable", () => {
            let rec;
            while(rec = parser.read()) {
                // Handle the record
                if (rec[1] !== currentRegion) {
                    if (rec[1] === "location_name") {
                        // It's the first row - special case
                        outputPromises.push(writeRecords(outDirname, "fields", [rec], true));
                        continue;
                    }

                    if (currentRegion) {
                        // Output the data for this current region before
                        // moving to the next one
                        outputPromises.push(writeRecords(outDirname, currentRegion, currentRecs));
                    }

                    console.log("Start of region %s", rec[1]);
                    currentRegion = rec[1];
                    currentRecs = [];
                    counts[currentRegion] = 0;
                }

                counts[currentRegion] += 1;
                currentRecs.push(rec);
            }
        });
        parser.on("error", reject);
        parser.on("end", resolve);
    });

    // Make sure to get the last region
    if (currentRegion) {
        outputPromises.push(writeRecords(outDirname, currentRegion, currentRecs));
    }

    console.log("Completing outputs.... ", outputPromises.length);
    await Promise.all(outputPromises);

    console.log("Counts by region ", counts);

    // Now update the data/versions.json file
    const versions = require("./data/versions.json");

    const exists = versions.find(v => v === thisVersion);
    if (exists) {
        console.log("versions file already has this version");
    } else {
        console.log(`Adding ${thisVersion} to versions.json`);
        versions.push(thisVersion);

        const out = fs.createWriteStream("data/versions.json");
        await new Promise((resolve, reject) => {
            out.on("err", reject);
            out.on("close", resolve);

            out.write(JSON.stringify(versions));
            out.end();
        });
    }

    // Let's make this the counts the latest regions files also so
    // that client's know what is available
    counts._version = thisVersion;
    const out = fs.createWriteStream("data/regions.json");
    await new Promise((resolve, reject) => {
        out.on("err", reject);
        out.on("close", resolve);

        out.write(JSON.stringify(counts));
        out.end();
    });


    console.log("done!");
}


/////////////////

const dirname = process.argv[2];

injest(dirname)
    .then(() => {
        console.log("********* Done *************")
    })
    .catch((e) => {
        console.error(e);
    });
