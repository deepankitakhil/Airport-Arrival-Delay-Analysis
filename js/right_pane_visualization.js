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
    $("#similar_airport tr").remove();
    table = d3.select("#similar_airport").attr("class", "table-title");
    thead = table.append('thead');
    tbody = table.append('tbody');
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
                return {column: column, value: row[column]};
            });
        })
        .enter()
        .append('td')
        .text(function (d) {
            return d.value;
        });

    return table;


}
function displayVisualization() {
    if (selected_airport === undefined) {
        console.log("no airport selected");
    } else {
        var cluster = clusterToAirportMapping.get(airportToClusterMapping.get(selected_airport).get_cluster);
        var maxLength = cluster.length > 5 ? 5 : cluster.length;
        var similar_airports = [];
        for (var index = 0; index < maxLength; index++) {

            similar_airports.push({'Similar Airports': cluster[index].get_airport_name})

        }
        display_time_Series();
        tabulate(similar_airports, ["Similar Airports"]);
    }

}

