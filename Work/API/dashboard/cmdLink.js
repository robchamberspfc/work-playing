
function linkToCMD(locationID, datasetID, body) {
    console.log (locationID, datasetID)

    const domain = "https://api.beta.ons.gov.uk"
    let query =
        '{"dataset":{"id": "' + datasetID + '","edition": "time-series","version": 1},"dimensions": [{"name": "geography","options": ["' + locationID +'"]}, ' + body + ']}'
        console.log (query)
    fetch(domain + '/v1/filters?submitted=true', {
            mode: 'cors',
            method: 'post',
            body: query
        })
        .then(res => res.json())
        .then(function (res) {
            console.log (res)
            filterID = res.filter_id
            console.log (filterID)

            let node = document.createElement("a");
            let textnode = document.createTextNode("Customise this data futher in CMD");
            node.title = "Customise this data futher in CMD";
            node.setAttribute('href', "https://beta.ons.gov.uk/filters/" + filterID + "/dimensions") ;
            node.appendChild(textnode);
            document.getElementById(datasetID).appendChild(node);

        })
    }
