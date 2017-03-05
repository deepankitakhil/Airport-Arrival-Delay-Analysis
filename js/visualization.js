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
        .defer(d3.json, '/Airport-Arrival-Delay-Analysis/data/states.json')
        .defer(d3.json, '/Airport-Arrival-Delay-Analysis/data/top200airports.json')
        .await(createMap);

}

function createMap(error, states, airport_data) {

    var airport_length = airport_data.features.length;
    var passenger_traffic = [];
    for (var index = 0; index < airport_length; index++) {
        var pop = airport_data.features[index].properties.TOT_ENP;
        passenger_traffic.push(Number(pop));
    }

    var min_passenger_value = Math.min.apply(Math, passenger_traffic);
    var max_passenger_value = Math.max.apply(Math, passenger_traffic);

    var airport_radius = d3.scaleSqrt()
        .domain([min_passenger_value, max_passenger_value])
        .range([10, 30]);

    svg.selectAll("path")
        .data(states.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", "steelblue");

    svg.selectAll('.cities')
        .data(airport_data.features)
        .enter()
        .append('path')
        .attr("d", path.pointRadius(function (d) {
            return airport_radius(d.properties.TOT_ENP);
        }))
        .attr('class', 'cities');

}