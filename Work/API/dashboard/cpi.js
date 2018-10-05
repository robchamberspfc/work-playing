function loadCPIH() {
    //set dataset ID
    let datasetID = "cpih01"
    let dimensions = "time=*&aggregate=cpih1dim1A0&geography=K02000001"
    //use dataset id to call the dataset api
    fetch(host + "/v1/datasets/" + datasetID, {
            mode: 'cors'
        })
        .then(data => data.json())
        .then(function (data) {
            //get the link to the latest version from the response
            let versionLink = data.links.latest_version.href
            //split the URL to just get dataset, edition and version
            latestVersion = versionLink.split("/datasets/")[1]
            //build the url to use to get the data
            latestVersion = host + "/v1/datasets/" + latestVersion + "/observations?" + dimensions
            //set dataset name as page title
            datasetName = data.title
            let node = document.createElement("H2"); // Create a <h1> node
            let textnode = document.createTextNode(datasetName); // Create a text node
            node.appendChild(textnode); // Append the text to <h1>
            document.getElementById("title").appendChild(node);
            getVersion(latestVersion)
        })
}
//get the data for the latest version and create the chart
function getVersion(latestVersion) {
    //get the observation data from the built url
    fetch(latestVersion, {
            mode: 'cors'
        })
        .then(data => data.json())
        .then(function (data) {
            //create an array to story data
            let timeseries = []
            //build a map of the dimensions
            data.observations.map(function (data) {
                //create a new field from the date to allow it to  be ordered
                sort = new Date("1-" + data.dimensions.time.label)
                //build an array with the 3 values we need and convert the value to a number
                let chartdata = [data.dimensions.time.label, parseFloat(data.observation), sort]
                //add these arrays to the timeseries array
                timeseries.push(chartdata)
            })
            //sort the array on the 'sort' field created earlier
            timeseries = timeseries.sort(orderByDate);
            keyFigure(timeseries)

            //create the chart
            Highcharts.chart('chart', {
                series: [{
                    //add the data to the chart
                    data: timeseries,
                    name: "Index, 2015=100"
                }],
                navigation: {
                    buttonOptions: {
                        enabled: false
                    }
                },
                title: {
                    text: null
                },
                yAxis: {
                    labels: {
                        enabled: false
                    },
                    title: {
                        enabled: false
                    },
                    // min: 0
                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        color: '#3B7A9E'
                    }
                },
                xAxis: {
                    type: "category",
                    crosshair: true,
                    tickInterval: 30
                }
            });
        })
}

function keyFigure(timeseries) {

    let numberOfTimeseires = timeseries.length - 1
    let latestFigure = timeseries[numberOfTimeseires]
    let lastYearFigure = timeseries[numberOfTimeseires - 12]
    let percentageCalc = 100 * (latestFigure[1] - lastYearFigure[1]) / lastYearFigure[1]
    let percentageChange = (percentageCalc.toFixed(1))
    let figure = document.createTextNode(percentageChange + "%");
    let date = document.createTextNode(latestFigure[0]);

    let showFigure = document.createElement("p");
    let showDate = document.createElement("p");
    showFigure.appendChild(figure);
    showDate.appendChild(date);
    document.getElementById("keyCPIHFigure").appendChild(showFigure);
    document.getElementById("keyCPIHFigure").appendChild(showDate);
    showFigure.classList.add("stand-out");
    showDate.classList.add("stand-out--list");


}