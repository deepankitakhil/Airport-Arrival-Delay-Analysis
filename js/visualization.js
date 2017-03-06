var svg;
var projection;
var path;
var height = 1000;
var width = 1200;
var linksByOrigin = {},
    countByAirport = {};

var arc={
    type:"MultiLineString"
};

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
        .defer(d3.csv, './data/flights-airport.csv')
        .await(buildConnectedGraph);

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
            //displayConnectedGraph(error, d.properties.NAME);
        })
        .on('mouseout', function () {
            d3.select(this).style("fill-opacity", .5);
            tooltip.classed('hidden', true);
        });

}

function buildConnectedGraph(error, source_destination_list) {

    source_destination_list.forEach(function(flight) {
        var origin = flight.origin,
            destination = flight.destination,
            links = linksByOrigin[origin] || (linksByOrigin[origin] = []);
        links.push({source: origin, target: destination});
        countByAirport[origin] = (countByAirport[origin] || 0) + 1;
        countByAirport[destination] = (countByAirport[destination] || 0) + 1;
    });
    console.log(String(linksByOrigin["JFK"].target));

}

function configureSearch(error, airports_list) {

    var airport_length = airports_list.features.length;
    var airport_name_list = [];
    var airport_code_list = [];
    var div = document.querySelector("#filterCriteria"),
        frag = document.createDocumentFragment(),
        select = document.createElement("select");
    for (var index = 0; index < airport_length; index++) {
        var airport_name = airports_list.features[index].properties.NAME;
        airport_name_list.push({ID: String(airport_name)});
        var airport_code = airports_list.features[index].properties.LOCID;
        airport_code_list.push({ID: String(airport_code)});
    }
    filterResult();

    d3.select('#filterCriteria').on('keyup', filterResult);

    function filterResult() {

        var filterText = d3.select('#filterCriteria').property('value');
        var result;
        filteredAirportName = airport_name_list;
        filteredAirportCode = airport_code_list;
        if (filterText !== "") {
            var filteredAirportName = airport_name_list.filter(function (airport) {
                return (airport.ID.toLowerCase().indexOf(filterText.toLowerCase()) === 0);
            });
        }

        d3.select('#filteredList').html(
            filteredAirportName.map(function (d) {
                return d.ID;
            }).join("<br/>")
        );
    }
}
