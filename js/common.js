/**
 * Load a json data file of the given name and attach it's
 * contents to the global $data.name.
 *
 * Returns a promise that is resolved when the data is loaded.
 */
async function loadData(version, name) {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();

        req.addEventListener("load", (evt) => {
            // console.log("--load--");
            // console.log("status=", req.status);
            // console.log("responseText=", req.responseText);

            try {
                if (typeof $data === "undefined") {
                    $data = {};
                }

                const data = JSON.parse(req.responseText);
                $data[name] = data;
                resolve(data);
            } catch (e) {
                console.error(e);
                reject(e);
            }
        });

        req.addEventListener("error", (e) => {
            reject(`Failed to load ${name} ${e}`);
        });

        req.addEventListener("abort", () => {
            reject("aborted");
        });

        if (version) {
            req.open("GET", `data/${version}/${name}.json`);
        } else {
            req.open("GET", `data/${name}.json`);
        }

        req.send();
    });
}

async function loadCommon() {
    versions = await loadData(false, "versions");
    versions = versions.sort();
    latestVersion = versions[versions.length-1];

    regions = await loadData( false, "regions");

    fieldNames = await loadData(latestVersion, "fields");
}

stateNamesByAbbr = {
    "AL": "Alabama",
    "AK": "Alaska",
    // "AS": "American Samoa",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "DC": "District of Columbia",
    // "FM": "Federated States of Micronesia",
    "FL": "Florida",
    "GA": "Georgia",
    // "GU": "Guam",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    // "MH": "Marshall Islands",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    // "MP": "Northern Mariana Islands",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    // "PW": "Palau",
    "PA": "Pennsylvania",
    "PR": "Puerto Rico",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    // "VI": "Virgin Islands",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming",
};

stateNames = Object.values(stateNamesByAbbr);
