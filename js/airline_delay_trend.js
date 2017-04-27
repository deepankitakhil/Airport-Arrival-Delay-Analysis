function display_airline_delay_trend() {
    var margin = {top: 10, right: 10, bottom: 20, left: 50},
        width = 500 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);
    var y = d3.scaleLinear()
        .range([height, 0]);

    var svg = d3.select("#airline_delay_trend_container").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var data = selectData();

    plotData(data);
}

function plotData(data) {
    var subTitleText = "";
    if (firstCriteria === 'total_delay')
        subTitleText = "Click on the bar to view delay distribution";

    var titleText = " Airlines performance at " + airportNameByAirportID.get(selected_airport);

    var tooltipText = 'minutes';
    if (secondCriteria === 'by_count')
        tooltipText = '%';

    Highcharts.chart('airline_delay_trend_container', {
        chart: {
            type: 'column',
            events: {
                drillup: function (e) {
                    if (e.seriesOptions.name === 'Airlines') {
                        this.setTitle({text: titleText}, {text: subTitleText});
                    }
                },
                drilldown: function (e) {
                    if (e.seriesOptions.name === undefined) {
                        this.setTitle({text: 'Further Breakdown of Delay'}, {text: ''});
                    }
                }
            },
        },
        credits: {
            enabled: false
        },
        xAxis: {
            type: 'category'
        },
        exporting: {enabled: false},
        yAxis: {
            title: {
                text: 'Average Delay'
            },
            min: 0

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y:.2f}'
                }
            }
        },

        tooltip: {
            headerFormat: '<span style="font-size:11px">{}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.fullName}</span>: <b>{point.y:.2f}</b> ' + tooltipText + '<br> ' + '{point.totalEntries} <br/>'
        },

        title: {text: titleText},
        subtitle: {text: subTitleText},
        series: [{
            name: 'Airlines',
            colorByPoint: true,
            visible: true,
            type: 'column',
            drilldown: true,
            data: data.filteredData
        }],

        drilldown: {
            series: data.drillDownData,
            drillUpButton: {
                position: {
                    align: 'right', // by default
                    verticalAlign: 'top', // by default
                    x: -10,
                    y: 10
                },
                relativeTo: 'chart'
            },
        }
    });
}

function selectData() {
    var filteredData;
    if (firstCriteria === 'total_delay' && secondCriteria === 'by_minutes') {
        filteredData = filterEntriesWithDrillDownData(airlineInformationByAirportID.get(selected_airport).entries(), TOTAL, MINUTES);
    }

    else if (firstCriteria === 'total_delay' && secondCriteria === 'by_count') {
        filteredData = filterEntriesWithDrillDownData(airlineInformationByAirportID.get(selected_airport).entries(), TOTAL, COUNT);
    }

    else if (firstCriteria === 'security_delay' && secondCriteria === 'by_minutes')
        filteredData = filterEntriesWithNullDrillDown(airlineInformationByAirportID.get(selected_airport).entries(), SECURITY, MINUTES);

    else if (firstCriteria === 'security_delay' && secondCriteria === 'by_count')
        filteredData = filterEntriesWithNullDrillDown(airlineInformationByAirportID.get(selected_airport).entries(), SECURITY, COUNT);

    else if (firstCriteria === 'nas_delay' && secondCriteria === 'by_minutes')
        filteredData = filterEntriesWithNullDrillDown(airlineInformationByAirportID.get(selected_airport).entries(), NAS, MINUTES);

    else if (firstCriteria === 'nas_delay' && secondCriteria === 'by_count')
        filteredData = filterEntriesWithNullDrillDown(airlineInformationByAirportID.get(selected_airport).entries(), NAS, COUNT);

    else if (firstCriteria === 'weather_delay' && secondCriteria === 'by_minutes')
        filteredData = filterEntriesWithNullDrillDown(airlineInformationByAirportID.get(selected_airport).entries(), WEATHER, MINUTES);

    else if (firstCriteria === 'weather_delay' && secondCriteria === 'by_count')
        filteredData = filterEntriesWithNullDrillDown(airlineInformationByAirportID.get(selected_airport).entries(), WEATHER, COUNT);

    else if (firstCriteria === 'late_aircraft_delay' && secondCriteria === 'by_minutes')
        filteredData = filterEntriesWithNullDrillDown(airlineInformationByAirportID.get(selected_airport).entries(), LATE_AIRCRAFT, MINUTES);

    else if (firstCriteria === 'late_aircraft_delay' && secondCriteria === 'by_count')
        filteredData = filterEntriesWithNullDrillDown(airlineInformationByAirportID.get(selected_airport).entries(), LATE_AIRCRAFT, COUNT);

    else if (firstCriteria === 'carrier_delay' && secondCriteria === 'by_minutes')
        filteredData = filterEntriesWithNullDrillDown(airlineInformationByAirportID.get(selected_airport).entries(), CARRIER, MINUTES);

    else if (firstCriteria === 'carrier_delay' && secondCriteria === 'by_count')
        filteredData = filterEntriesWithNullDrillDown(airlineInformationByAirportID.get(selected_airport).entries(), CARRIER, COUNT);

    return filteredData;
}

function filterEntriesWithNullDrillDown(input, delay_type, option) {
    var filteredData = [];
    var drillDownData = [];
    var input_length = input.length;
    var percentageBase = option === COUNT ? 100 : 1;
    var prefixWord = "";
    if (secondCriteria === 'by_count')
        prefixWord = 'Total flights: ';
    else
        prefixWord = 'Delayed flights: ';

    for (var index = 0; index < input_length; index++) {
        var element = {};
        element["name"] = input[index].key;
        element["y"] = calculateRatio(input[index].value.get(option).get(delay_type), input[index].value.get(option).get(NUMBER_OF_ENTRIES)) * percentageBase;
        element["fullName"] = carrierNameByID.get(input[index].key);
        element["totalEntries"] = prefixWord + input[index].value.get(option).get(NUMBER_OF_FLIGHTS);
        element["drilldown"] = null;
        filteredData.push(element);
    }
    return {
        filteredData,
        drillDownData
    };
}

function filterEntriesWithDrillDownData(input, delay_type, option) {
    var drillDownData = [];
    var filteredData = [];
    var input_length = input.length;
    var percentageBase = option === COUNT ? 100 : 1;
    var prefixWord = "";
    if (secondCriteria === 'by_count')
        prefixWord = 'Total flights: ';
    else
        prefixWord = 'Delayed flights: ';

    for (var index = 0; index < input_length; index++) {
        filteredData.push({
            name: input[index].key,
            y: calculateRatio(input[index].value.get(option).get(delay_type), input[index].value.get(option).get(NUMBER_OF_ENTRIES)) * percentageBase,
            fullName: carrierNameByID.get(input[index].key),
            totalEntries: prefixWord + input[index].value.get(option).get(NUMBER_OF_FLIGHTS),
            drilldown: input[index].key
        });

        drillDownData.push({
            id: input[index].key,
            data: [
                ["NAS", calculateRatio(input[index].value.get(option).get(NAS), input[index].value.get(option).get(NUMBER_OF_ENTRIES)) * percentageBase],
                ["Late Aircraft", calculateRatio(input[index].value.get(option).get(LATE_AIRCRAFT), input[index].value.get(option).get(NUMBER_OF_ENTRIES)) * percentageBase],
                ["Security", calculateRatio(input[index].value.get(option).get(SECURITY), input[index].value.get(option).get(NUMBER_OF_ENTRIES)) * percentageBase],
                ["Weather", calculateRatio(input[index].value.get(option).get(WEATHER), input[index].value.get(option).get(NUMBER_OF_ENTRIES)) * percentageBase],
                ["Carrier", calculateRatio(input[index].value.get(option).get(CARRIER), input[index].value.get(option).get(NUMBER_OF_ENTRIES)) * percentageBase]
            ]
        });
    }
    return {
        filteredData,
        drillDownData
    };
}