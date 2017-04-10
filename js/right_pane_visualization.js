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
function right_pane_visualization_init() {
    triggerDataConfiguration();
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
        dateValues = values;
        var startDate = dateValues[0].split(",");
        var endDate = dateValues[1].split(",");
        var startMonth = monthToNumber[startDate[0].trim()];
        var endMonth = monthToNumber[endDate[0].trim()];
        var dateRange = [startMonth + "," + startDate[1].trim(), endMonth + "," + endDate[1].trim()];
        buildDataForVisualization(dateRange);
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
    var cluster = clusterToAirportMapping.get(airportToClusterMapping.get(selected_airport).get_cluster);
    var maxLength = cluster.length > 5 ? 5 : cluster.length;
    var similar_airports = [];
    var count = 0;
    for (var index = 0; index < maxLength; index++) {
        if (cluster[index] === undefined) {
            console.log("outlier found!");
        }
        else {
            if (selected_airport === cluster[index].get_airport_id) {
                maxLength += 1;
            } else {
                var cityStateAirportName = cluster[index].get_airport_name;
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
    return similar_airports;
}

function displayVisualization() {
    if (selected_airport === undefined) {
    } else {
        display_time_Series();
        display_airline_delay_trend();
        display_table();
        display_bee_swarm();
    }

}

function highlightAirport(airportData) {
    var selectedAirportID = airportData.substr(airportData.indexOf(":") + 1);
    var objectArray = [];
    objectArray.push(airportInformationByAirportID.get(selectedAirportID));
    window.selected_airport = airportInformationByAirportID.get(selectedAirportID).properties.LOCID;
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
    var similar_airports = buildTableData();
    tabulate(similar_airports, ["Similar Airports"]);
}

