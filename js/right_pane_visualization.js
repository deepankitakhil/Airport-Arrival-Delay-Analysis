var monthToNumber = {
    'January': 1,
    'February': 2,
    'March': 3,
    'April': 4,
    'May': 5,
    'June': 6,
    'July': 7,
    'August': 8,
    'September': 9,
    'October': 10,
    'November': 11,
    'December': 12
};
var airportInformationToHighlightSimilarAirport;
var sparkLineData;

function right_pane_visualization_init() {
    triggerDataConfiguration();
}

function displayLoading(timeLimit) {

    var loadingDiv = document.getElementById("loading"),
        show = function () {
            loadingDiv.style.display = "block";
            setTimeout(hide, timeLimit); // 5 seconds
        },
        hide = function () {
            loadingDiv.style.display = "none";
        };
    show();
}
function configureSlider() {

    var html5Slider = document.getElementById('slider');
    var dateValues = [];

    function timestamp(str) {
        return new Date(str).getTime();
    }


    var months = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];

    function formatDate(date) {
        return months[date.getMonth()] + ", " + date.getFullYear();
    }

    function toFormat(v) {
        return formatDate(new Date(v));
    }

    noUiSlider.create(html5Slider, {
        format: {to: toFormat, from: Number},
        tooltips: [true, true],
        orientation: "vertical",
        start: [timestamp('2011'), timestamp('2017')],
        connect: true,
        step: 7 * 24 * 60 * 60 * 1000,
        range: {
            min: timestamp('2011-01-01') + 7 * 24 * 60 * 60 * 1000,
            max: timestamp('2016-11-30')

        }
    });
    html5Slider.noUiSlider.on('update', function (values, handle) {
        displayLoading(2000);
        dateValues = values;
        var startDate = dateValues[0].split(",");
        var endDate = dateValues[1].split(",");
        var startMonth = monthToNumber[startDate[0].trim()];
        var endMonth = monthToNumber[endDate[0].trim()];
        var dateRange = [startMonth + "," + startDate[1].trim(), endMonth + "," + endDate[1].trim()];
        buildDataForVisualization(dateRange);
        buildDataForBeeSwarm();
        displayVisualization();
    });

}
//Table for Similar Airports
function tabulate(data, columns) {
    $("#similar_airport_container").find("tr").remove();
    var table = d3.select("#similar_airport_container").attr("class", "table-title");
    var thead = table.append('thead');
    var tbody = table.append('tbody');
    thead.append("tr")
        .selectAll('th')
        .data(columns).enter()
        .append('th')
        .text(function (column) {
            return column;
        });
    var rows = tbody.selectAll('tr')
        .data(data)
        .enter()
        .append('tr');
    var cells = rows.selectAll('td')
        .data(function (row) {

            return columns.map(function (column) {
                return {column: column, value: row[column] + ':' + row['Similar Airport ID']};
            });
        })
        .enter()
        .append('td')
        .text(function (d) {
            return d.value.substr(0, d.value.indexOf(':'));
        }).on("click", function (airportName) {
                highlightAirport(airportName.value);
            }
        );


    return table;

}

function buildTableData() {
    var airportIdToHighlightSimilarAirport = [];
    var cluster = clusterToAirportMapping.get(airportToClusterMapping.get(selected_airport).get_cluster);
    var maxLength = cluster.length > 5 ? 5 : cluster.length;
    var similar_airports = [];
    var count = 0;
    for (var index = 0; index < maxLength; index++) {
        if (cluster[index] === undefined) {
            //console.log("outlier found!");
        }
        else {
            if (selected_airport === cluster[index].get_airport_id) {
                maxLength += 1;
            } else {
                var cityStateAirportName = cluster[index].get_airport_name;
                airportIdToHighlightSimilarAirport.push(cluster[index].get_airport_id);
                count++;
                similar_airports.push({
                    'Similar Airports': cityStateAirportName.substring(cityStateAirportName.indexOf(":") + 1),
                    'Similar Airport ID': cluster[index].get_airport_id
                });
            }
        }
    }
    if (count === 0) {
        similar_airports.push({
            'Similar Airports': 'No Similar airport found!',
            'Similar Airport ID': 'No Similar airport found!'
        });
    }
    buildSimilarAirportPlottingInformation(airportIdToHighlightSimilarAirport);
    return similar_airports;
}

function displayVisualization() {
    if (selected_airport === undefined) {
    } else {
        display_time_Series();
        display_airline_delay_trend();
        display_table();
    }

}

function highlightAirport(airportData) {
    var selectedAirportID = airportData.substr(airportData.indexOf(":") + 1);
    var objectArray = [];
    objectArray.push(airportInformationByAirportID.get(selectedAirportID));
    window.selected_airport = airportInformationByAirportID.get(selectedAirportID).properties.LOCID;
    d3.selectAll(".bee_swarm_cities").remove();
    d3.selectAll(".highlighted_cities").remove();
    d3.selectAll('.cities').style("fill", "steelblue");
    d3.selectAll('.cities').style("fill-opacity", 0.5);
    svg.selectAll('.selected_city_from_table').remove();
    svg.selectAll('.selected_city_from_table')
        .data(objectArray)
        .enter()
        .append('path')
        .attr("d", path.pointRadius(function (airport) {
            return airport_radius(airport.properties.TOT_ENP);
        }))
        .attr('class', 'selected_city_from_table')
        .on('mousemove', function (airport) {
            d3.mouse(svg.node()).map(function (value) {
                return parseInt(value);
            });
            tooltip.classed('hidden', false)
                .attr('style', 'left:' + (300) +
                    'px; top:' + (50) + 'px;right:' + (100) + 'px;')
                .html(airport.properties.NAME);

        })
        .on('mouseout', function () {
            tooltip.classed('hidden', true);
        });

    displayVisualization();
}

function display_table() {
    kMeansCluster();
    buildSparkLineData();
    var similar_airports = buildTableData();
    tabulate(similar_airports, ["Similar Airports"]);
}

function buildSimilarAirportPlottingInformation(airportIdToHighlightSimilarAirport) {
    airportInformationToHighlightSimilarAirport = [];
    if (airportIdToHighlightSimilarAirport === undefined) {

    } else {
        var length = airportIdToHighlightSimilarAirport.length;
        for (var index = 0; index < length; index++) {
            if (airportInformationByAirportID.has(airportIdToHighlightSimilarAirport[index])) {
                airportInformationToHighlightSimilarAirport.push(
                    [airportInformationByAirportID.get(airportIdToHighlightSimilarAirport[index])]);
            }
        }
    }
}

function buildSparkLineData() {
    var data;
    if (firstCriteria === 'total_delay' && secondCriteria === 'by_minutes')
        data = airportDelayDataForTimeSeries.get(selected_airport);
    else if (firstCriteria === 'total_delay' && secondCriteria === 'by_count')
        data = airportDelayCountForTimeSeries.get(selected_airport);

    else if (firstCriteria === 'security_delay' && secondCriteria === 'by_minutes')
        data = securityDelayDataForTimeSeries.get(selected_airport);
    else if (firstCriteria === 'security_delay' && secondCriteria === 'by_count')
        data = securityDelayCountForTimeSeries.get(selected_airport);

    else if (firstCriteria === 'nas_delay' && secondCriteria === 'by_minutes')
        data = nasDelayDataForTimeSeries.get(selected_airport);
    else if (firstCriteria === 'nas_delay' && secondCriteria === 'by_count')
        data = nasDelayCountForTimeSeries.get(selected_airport);

    else if (firstCriteria === 'weather_delay' && secondCriteria === 'by_minutes')
        data = weatherDelayDataForTimeSeries.get(selected_airport);
    else if (firstCriteria === 'weather_delay' && secondCriteria === 'by_count')
        data = weatherDelayCountForTimeSeries.get(selected_airport);

    else if (firstCriteria === 'late_aircraft_delay' && secondCriteria === 'by_minutes')
        data = lateAircraftDelayDataForTimeSeries.get(selected_airport);
    else if (firstCriteria === 'late_aircraft_delay' && secondCriteria === 'by_count')
        data = lateAircraftDelayCountForTimeSeries.get(selected_airport);

    else if (firstCriteria === 'carrier_delay' && secondCriteria === 'by_minutes')
        data = carrierDelayDataForTimeSeries.get(selected_airport);
    else if (firstCriteria === 'carrier_delay' && secondCriteria === 'by_count')
        data = carrierDelayCountForTimeSeries.get(selected_airport);

    sparkLineData = [];
    if (data === undefined) {
        console.log("No data found for spark line!");
    } else {
        for (var index = 0; index < data.length; index++) {
            sparkLineData.push(Math.round(data[index][1]));
        }
    }
}