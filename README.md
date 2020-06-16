# covidgraphs
Some graph experiments using covid data

## Build

Run `gulp` from the root. This builds pug files from views and stylus files from stylus into the root directory.

## Running

`yarn start` will start the static webserver via `node server.js` which is super simple and just runs on port 3000.

At the moment the default index.html is lame. You want to go to

    http://localhost:3000/statesSurface.html
    
## Data

All the data that is used sits in static json files in the data/ directory. The `versions.json` file identifies available versions of the data. It is an array of strings naming sub directories. The `regions.json` file identifies regions which will be present in the sub directories.

Inside a version subdirectory there is a json file per each region.

The data is from https://covid19.healthdata.org/
The most recent .zip file can be downloaded from this page: http://www.healthdata.org/covid/data-downloads and should be named ihme-covid19.zip

These data files are CSVs and the zip file will look something like

     creating: 2020_06_13/
    inflating: 2020_06_13/Hospitalization_all_locs.csv  
    inflating: 2020_06_13/IHME_COVID_19_Data_Release_Information_Sheet.pdf  
    inflating: 2020_06_13/Summary_stats_all_locs.csv
    
To create the json files, unzip the file in the root directory and then run the injest.js file supplying the name of the version file. In this case that would look like
 
    node injest.js 2020_06_13   

This will add the new data to the data directory in the proper format.

