
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
        });

        return Promise.all(all);
    })
    .catch((e) => {
        console.log(e);
    });


function changeMetric(event) {
    const val = event.target.value;
    console.log("changeMetric(",event,") val=",val);

    // const metricName = `${val}_mean`;
    const metricName = val;
    
    const ix = fieldNames.indexOf(metricName);
    if (ix === -1) {
        console.log(`Could not find ${metricName}`);
        return;
    }

    console.log("ix=",ix);

    // Create the new matrix for this metric
    dataByDay = {};

    stateNames.forEach((state) => {
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

        if (day < "2020-02-01" || day > "2020-06-01") {
            // console.log("Ignoring ", day);
            return;
        }

        rowLabels.push(day);

        const dayData = dataByDay[day];
        const row = [];

        // Now go by states
        stateNames.forEach((state) => {
            const val = dayData[state] || 0;
            row.push(val);
        })

        dataInRows.push(row);
    });

    // Now output that some how

    // console.table(dataInRows);

}

function tableToPlotly() {
    const data = [{
        y: rowLabels,
        x: stateNames,
        z: dataInRows,
        type: "surface",
    }];

    const layout = {
        width: 1200,
        height: 900,
    }

    Plotly.newPlot("plot", data, layout);
}


function updateFields() {
    const el = document.getElementById("metricSelect")

    fieldNames.forEach((name) => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;

        el.appendChild(opt);
    });

}
