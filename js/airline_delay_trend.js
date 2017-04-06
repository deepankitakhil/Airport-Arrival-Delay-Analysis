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

    if (firstCriteria === 'total_delay')
        var text_value = 'Click the columns to total delay distribution.';

    Highcharts.chart('airline_delay_trend_container', {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Delay Information'
        },
        subtitle: {
            text: text_value
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
                text: 'Total Delay'
            }

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y:.1f}'
                }
            }
        },

        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}</b> of total<br/>'
        },

        series: [{
            name: 'Airlines',
            colorByPoint: true,
            visible: true,
            type: 'column',
            drilldown: true,
            data: data.filteredData
        }],

        drilldown: {
            series: data.drillDownData
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

    for (var index = 0; index < input_length; index++) {
        var element = {};
        element["name"] = input[index].key;
        element["y"] = input[index].value.get(option).get(delay_type);
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

    for (var index = 0; index < input_length; index++) {
        filteredData.push({
            name: input[index].key,
            y: input[index].value.get(option).get(delay_type),
            drilldown: input[index].key
        });

        drillDownData.push({
            id: input[index].key,
            data: [
                ["NAS", input[index].value.get(option).get(NAS)],
                ["Late Aircraft", input[index].value.get(option).get(LATE_AIRCRAFT)],
                ["Security", input[index].value.get(option).get(SECURITY)],
                ["Weather", input[index].value.get(option).get(WEATHER)],
                ["Carrier", input[index].value.get(option).get(CARRIER)]
            ]
        });
    }
    return {
        filteredData,
        drillDownData
    };
}