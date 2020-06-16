let selectedStates = [];

loadCommon()
    .then(() => {
        console.log("Common data loaded");

        // Object.values(stateNamesByAbbr).forEach((v) => {
        //     if (!regions[v]) {
        //         console.log("No region for ", v);
        //     }
        // })
        updateFields();

        const all = [];
        stateNames.forEach((name) => {
            all.push(loadData(latestVersion, name));

            // Also setup a select checkbox for it
            addStateCheckbox(name);
        });

        return Promise.all(all);
    })
    .then(() => {
        return spawnUpdatePlot();
    })
    .catch((e) => {
        console.log(e);
    });


function changeMetric(event) {
    const val = event.target.value;
    console.log("changeMetric(", event, ") val=", val);

    spawnUpdatePlot();
}

function spawnUpdatePlot() {
    return new Promise((resolve, reject) => {
        updatePlot();
        resolve();
    }).catch((e) => {
        console.error(e);
    });
}

async function updatePlot() {
    const selectEl = document.getElementById("metricSelect");

    const metricName = selectEl.value;
    console.log("metricName=",metricName);

    const ix = fieldNames.indexOf(metricName);
    if (ix === -1) {
        console.log(`Could not find ${metricName}`);
        return;
    }

    console.log("ix=",ix);

    // Create the new matrix for this metric
    dataByDay = {};

    const checkedNames = {};
    const els = document.getElementsByClassName("state-cb-input");
    // console.log("els ", els);
    for(let key in els) {
        const el = els[key];

        if (el.checked) {
            checkedNames[el.id.substring(4)] = true;
        }
    }

    // Now order them based on the selected thing
    const sortSelectEl = document.getElementById("sortSelect");
    const ssVal = sortSelectEl.value;
    let allSorted = sortedStateNames[ssVal] || sortedStateNames.alpha;

    selectedStates = [];
    for(let i = 0; i < allSorted.length; i += 1) {
        const name = allSorted[i];

        if (checkedNames[name]) {
            selectedStates.push(name);
        }
    }
    console.log("Sorted by ", ssVal, " => ", selectedStates);

    selectedStates.forEach((state) => {
        const d = $data[state];

        d.forEach((dRow) => {
            const day = dRow[2];
            let row = dataByDay[day];
            if (!row) {
                row = {};
                dataByDay[day] = row;
            }

            row[state] = dRow[ix];
        });
    });

    // I feel like we might want to rotate this data here, but for now
    // don't bother

    updateTable();
    tableToPlotly();
}

function updateTable() {
    dataInRows = [];

    // First row with state names
    // const r = ["Date"];
    // stateNames.forEach(state => r.push(state));
    // dataInRows.push(r);

    // Col labels are stateNames

    rowLabels = [];

    const rowKeys = Object.keys(dataByDay);
    rowKeys.forEach((day) => {

        if (day < "2020-02-01" || day > "2020-07-01") {
            // console.log("Ignoring ", day);
            return;
        }

        rowLabels.push(day);

        const dayData = dataByDay[day];
        const row = [];

        // Now go by states
        selectedStates.forEach((state) => {
            const val = dayData[state] || 0;
            row.push(val);
        })

        dataInRows.push(row);
    });

    // Now output that some how

    // console.table(dataInRows);

}

function tableToPlotly() {
    // For colors https://plotly.com/javascript/colorscales/

    const data = [{
        y: rowLabels,
        x: selectedStates,
        z: dataInRows,
        type: "surface",
        //     // Greys,YlGnBu,Greens,YlOrRd,Bluered,RdBu,Reds,Blues,Picnic,Rainbow,Portland,Jet,Hot,Blackbody,Earth,Electric,Viridis,Cividis.
        // colorscale: "Rainbow",
        colorscale: "Jet",
    }];

    const layout = {
        // width: 1200,
        // height: 900,
        width: window.innerWidth - 200,
        height: window.innerHeight,

        scene: {
            aspectratio: {
                x: 2,
                y: 1,
                z: 1,
            },

            xaxis: {
                tickmode: "auto",
                nticks: 50,
            },
        },

        // autosize: false,
        // // https://plotly.com/javascript/reference/#layout-coloraxis-colorscale
        // coloraxis: {
        //     autocolorscale: false,
        //     colorscale: "rainbow",
        // },
    }

    Plotly.newPlot("plot", data, layout);
    // Plotly.newPlot("plot", data, layout, {responsive: true});
}


function updateFields() {
    const el = document.getElementById("metricSelect")

    fieldNames.forEach((name) => {
        if (name === "V1" || name === "location_name" || name === "date") {
            return;
        }

        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;

        el.appendChild(opt);
    });

}


function addStateCheckbox(name) {
    const field = document.createElement("div");
    field.className = "state-cb"

    const input = document.createElement("input");
    input.type = "checkbox";
    const n = `stcb${name}`;
    input.id = n;
    input.name = n;
    input.checked = true;
    input.className = "state-cb-input";
    input.onchange = stcbChange;

    field.appendChild(input);

    const label = document.createElement("label");
    label.htmlFor = n;
    label.textContent = name;

    field.appendChild(label);

    const list = document.getElementById("stateList");
    list.appendChild(field);
}


function stcbChange(event) {
    console.log("stcbChange for ", event.target.id, " checked=", event.target.checked);

    spawnUpdatePlot();
}

function changeSort(event) {
    console.log("Change sort");
    spawnUpdatePlot();
}

/////////////

function selSome(which) {
    console.log("selSome(",which,")");

    // Get our sorted list
    const sortSelectEl = document.getElementById("sortSelect");
    const ssVal = sortSelectEl.value;
    let allSorted = sortedStateNames[ssVal] || sortedStateNames.alpha;

    const toCheck = {};
    for(let i = 0; i < allSorted.length; i += 1) {
        const name = allSorted[i];

        // Written this way in case we want to make it more complicated
        // in the future
        switch(which) {
        case "top10":
            if (i<10) {
                toCheck[name] = true;
            }
            break;

        case "bot10":
            if (i > allSorted.length - 11) {
                toCheck[name] = true;
            }
            break;

        default: // all
            toCheck[name] = true;
        }
    }

    // Now iterate all the checked elements
    const els = document.getElementsByClassName("state-cb-input");
    for(let i = 0; i < els.length; i += 1) {
        const el = els[i];

        const id = el.id.substring(4);
        // Hopefully this doesn't fire events right?
        el.checked = toCheck[id];
    }

    // Now we do just one event yeah?
    spawnUpdatePlot();
}


///////////////

// Watch resize stuff
window.addEventListener("resize", (event) => {
    console.log("== Resize == ", event);

    // Redo this guy
    tableToPlotly();
});
