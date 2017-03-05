var svg;
var projection;
var path;
var height = 1000;
var width = 1200;

function init() {
    svg = d3.select('body').append('svg')
        .attr('width', width)
        .attr('height', height);

    projection = d3.geoAlbers()
        .scale(1100)
        .translate([(width >> 1), (height >> 1)]);

    path = d3.geoPath()
        .projection(projection);

    queue()
        .defer(d3.json, './data/states.json')
        .defer(d3.json, './data/top200airports.json')
        .await(createMap);

    queue()
        .defer(d3.json, './data/states.json')
        .await(displayConnectedGraph);

    queue()
        .defer(d3.json, './data/top200airports.json')
        .await(configureSearch);
}
function createMap(error, states, airport_data) {

    var airport_length = airport_data.features.length;
    var passenger_traffic = [];
    var tooltip = d3.select('body').append('div')
        .attr('class', 'hidden tooltip');
    for (var index = 0; index < airport_length; index++) {
        var pop = airport_data.features[index].properties.TOT_ENP;
        passenger_traffic.push(Number(pop));
    }

    var min_passenger_value = Math.min.apply(Math, passenger_traffic);
    var max_passenger_value = Math.max.apply(Math, passenger_traffic);

    var airport_radius = d3.scalePow()
        .domain([min_passenger_value, max_passenger_value])
        .range([10, 30]);

    svg.selectAll("path")
        .data(states.features)
        .enter()
        .append('path')
        .attr("d", path)
        .attr("class", "states");

    svg.selectAll('.cities')
        .data(airport_data.features)
        .enter()
        .append('path')
        .attr("d", path.pointRadius(function (airport) {
            return airport_radius(airport.properties.TOT_ENP);
        }))
        .attr('class', 'cities')
        .on("mousemove", function (d) {
            d3.select(this).style("fill-opacity", 1);
            var mouse = d3.mouse(svg.node()).map(function (value) {
                return parseInt(value);
            });
            tooltip.classed('hidden', false)
                .attr('style', 'left:' + (mouse[0] + 15) +
                    'px; top:' + (mouse[1] - 35) + 'px')
                .html(d.properties.NAME);
        })
        .on('mouseout', function () {
            d3.select(this).style("fill-opacity", .5);
            tooltip.classed('hidden', true);
        });

}

function displayConnectedGraph() {
    console.log("inside display connected graph");
}

function configureSearch(error, airports_list) {

}
