function populateLocations() {
    //use dataset id to call the dataset api
    fetch("https://api.beta.ons.gov.uk/v1/code-lists/ashe-geography/codes", {
            mode: 'cors'
        })
        .then(data => data.json())
        .then(function (data) {

            data.items.map(function (data) {
                // console.log (data.label)

                places = data.label
                let node = document.createElement("option"); // Create a <h1> node
                let textnode = document.createTextNode(places); // Create a text node
                node.appendChild(textnode); // Append the text to <h1>
                node.value = data.id
                document.getElementById("places").appendChild(node);
                // node.value.add(data.id);

            })



        })
}

function getDataforRegion(value) {
    document.getElementById("hidden").style.display = ""
    let location = document.getElementById("places");
    let locationID = location.value;
    let locationName = location.options[location.selectedIndex].text;

    getPopulation(locationID, locationName)
    getASHE(locationID, locationName)
}

function getPopulation(locationID, locationName) {

    let node = document.createElement("span");
    let textnode = document.createTextNode(locationName + " (2016)");
    node.appendChild(textnode);
    document.getElementById("populationPlace").appendChild(node);



    fetch(host + "/v1/datasets/mid-year-pop-est/editions/time-series/versions/1/observations?time=2016&age=*&sex=0&geography=" + locationID, {
            mode: 'cors'
        })
        .then(data => data.json())
        .then(function (data) {
            let age = 0
            //build a map of the dimensions
            data.observations.map(function (data) {
                //total the ages as no total provided
                age = age + Number(data.observation)
            })

            let node = document.createElement("h5");
            let textnode = document.createTextNode(age);
            node.appendChild(textnode);
            document.getElementById("totalPop").appendChild(node);

        })

        fetch(host + "/v1/datasets/mid-year-pop-est/editions/time-series/versions/1/observations?time=2016&age=*&sex=2&geography=" + locationID, {
            mode: 'cors'
        })
        .then(data => data.json())
        .then(function (data) {
            let age = 0
            //build a map of the dimensions
            data.observations.map(function (data) {
                //total the ages as no total provided
                age = age + Number(data.observation)
            })

            let node = document.createElement("h5");
            let textnode = document.createTextNode(age);
            node.appendChild(textnode);
            document.getElementById("femalePop").appendChild(node);

        })

        fetch(host + "/v1/datasets/mid-year-pop-est/editions/time-series/versions/1/observations?time=2016&age=*&sex=1&geography=" + locationID, {
            mode: 'cors'
        })
        .then(data => data.json())
        .then(function (data) {
            let age = 0
            //build a map of the dimensions
            data.observations.map(function (data) {
                //total the ages as no total provided
                age = age + Number(data.observation)
            })

            let node = document.createElement("h5");
            let textnode = document.createTextNode(age);
            node.appendChild(textnode);
            document.getElementById("malePop").appendChild(node);

        })
}

function getASHE(locationID, locationName) {

    let node = document.createElement("span");
    let textnode = document.createTextNode(locationName);
    node.appendChild(textnode);
    document.getElementById("ashePlace").appendChild(node);

    fetch(host + "/v1/datasets/ashe-table-8-earnings/editions/time-series/versions/1/observations?Time=2017&Earnings=annual-pay-gross&Sex=all&Workingpattern=all&Statistics=median&Geography=" + locationID, {
        mode: 'cors'
    })
    .then(data => data.json())
    .then(function (data) {

        if (data.observations["0"].observation == "") {
            value = data.observations["0"].metadata["Data marking"]
            console.log (value)
        } else {
            value = "£" + data.observations["0"].observation
        }

        let node = document.createElement("h5");
        let textnode = document.createTextNode(value + " (+/- " + data.observations["0"].metadata["Coefficient of variation"] + "%)");
        node.appendChild(textnode);
        document.getElementById("totalEarnings").appendChild(node);

    })

    fetch(host + "/v1/datasets/ashe-table-8-earnings/editions/time-series/versions/1/observations?Time=2017&Earnings=annual-pay-gross&Sex=female&Workingpattern=all&Statistics=median&Geography=" + locationID, {
        mode: 'cors'
    })
    .then(data => data.json())
    .then(function (data) {

        if (data.observations["0"].observation == "") {
            value = data.observations["0"].metadata["Data marking"]
            console.log (value)
        } else {
            value = "£" + data.observations["0"].observation
        }

        let node = document.createElement("h5");
        let textnode = document.createTextNode(value + " (+/- " + data.observations["0"].metadata["Coefficient of variation"] + "%)");
        node.appendChild(textnode);
        document.getElementById("femaleEarnings").appendChild(node);

    })
    
    fetch(host + "/v1/datasets/ashe-table-8-earnings/editions/time-series/versions/1/observations?Time=2017&Earnings=annual-pay-gross&Sex=male&Workingpattern=all&Statistics=median&Geography=" + locationID, {
        mode: 'cors'
    })
    .then(data => data.json())
    .then(function (data) {

        if (data.observations["0"].observation == "") {
            value = data.observations["0"].metadata["Data marking"]
            console.log (value)
        } else {
            value = "£" + data.observations["0"].observation
        }

        let node = document.createElement("h5");
        let textnode = document.createTextNode(value + " (+/- " + data.observations["0"].metadata["Coefficient of variation"] + "%)");
        node.appendChild(textnode);
        document.getElementById("maleEarnings").appendChild(node);

    })

}