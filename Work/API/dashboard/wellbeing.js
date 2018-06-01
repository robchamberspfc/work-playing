
function loadWellbeing() {

    fetch("https://api.beta.ons.gov.uk/v1/datasets/wellbeing-year-ending/editions/time-series/versions/1/observations?time=January 2017 - December 2017&geography=K02000001&estimate=*&allmeasuresofwellbeing=anxiety"
        , {
            mode: 'cors'
        })
        .then(data => data.json())
        .then(function (data) {



            chart = []

            data.observations.map(function (data) {
                    if (data.dimensions.estimate.label != "Average (mean)" ) {
                            let chartdata = [data.dimensions.estimate.label, parseFloat(data.observation)]
                            chart.push(chartdata)
                        }
                    }
                    )
  


            Highcharts.chart('anxiety', {
                chart: {
                    type: 'column'
                },
                series: [{
                    data: chart,
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
                },
                legend: {
                    enabled: false
                },
                xAxis: {
                    type: "category",
                    crosshair: true,
                }
            });

        })

        fetch("https://api.beta.ons.gov.uk/v1/datasets/wellbeing-year-ending/editions/time-series/versions/1/observations?time=January 2017 - December 2017&geography=K02000001&estimate=*&allmeasuresofwellbeing=happiness"
        , {
            mode: 'cors'
        })
        .then(data => data.json())
        .then(function (data) {



            chart = []

            data.observations.map(function (data) {
                    if (data.dimensions.estimate.label != "Average (mean)" ) {
                            let chartdata = [data.dimensions.estimate.label, parseFloat(data.observation)]
                            chart.push(chartdata)
                        }
                    }
                    )
  

            Highcharts.chart('happiness', {
                chart: {
                    type: 'column'
                },
                series: [{
                    data: chart,
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
                },
                legend: {
                    enabled: false
                },
                xAxis: {
                    type: "category",
                    crosshair: true,
                }
            });

        })

        fetch("https://api.beta.ons.gov.uk/v1/datasets/wellbeing-year-ending/editions/time-series/versions/1/observations?time=January 2017 - December 2017&geography=K02000001&estimate=*&allmeasuresofwellbeing=worthwhile"
        , {
            mode: 'cors'
        })
        .then(data => data.json())
        .then(function (data) {



            chart = []

            data.observations.map(function (data) {
                    if (data.dimensions.estimate.label != "Average (mean)" ) {
                            let chartdata = [data.dimensions.estimate.label, parseFloat(data.observation)]
                            chart.push(chartdata)
                        }
                    }
                    )
  


            Highcharts.chart('worthwhile', {
                chart: {
                    type: 'column'
                },
                series: [{
                    data: chart,
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
                },
                legend: {
                    enabled: false
                },
                xAxis: {
                    type: "category",
                    crosshair: true,
                }
            });

        })

        fetch("https://api.beta.ons.gov.uk/v1/datasets/wellbeing-year-ending/editions/time-series/versions/1/observations?time=January 2017 - December 2017&geography=K02000001&estimate=*&allmeasuresofwellbeing=life-satisfaction"
        , {
            mode: 'cors'
        })
        .then(data => data.json())
        .then(function (data) {



            chart = []

            data.observations.map(function (data) {
                    if (data.dimensions.estimate.label != "Average (mean)" ) {
                            let chartdata = [data.dimensions.estimate.label, parseFloat(data.observation)]
                            chart.push(chartdata)
                        }
                    }
                    )
 

            Highcharts.chart('life-satisfaction', {
                chart: {
                    type: 'column'
                },
                series: [{
                    data: chart,
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
                },
                legend: {
                    enabled: false
                },
                xAxis: {
                    type: "category",
                    crosshair: true,
                }
            });

        })
        }
