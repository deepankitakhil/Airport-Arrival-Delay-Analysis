var svg;
var projection;
var path;
var height = 1000;
var width = 1200;
var airport_radius;

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
        .defer(d3.json, './data/top200airports.json')
        .await(configureSearch);

}
function createMap(error, states, airport_data) {

    var airport_length = airport_data.features.length;
    var passenger_traffic = [];
    var tooltip = d3.select('body').append('div')
        .attr('class', 'hidden tooltip');
    for (index = 0; index < airport_length; index++) {
        var pop = airport_data.features[index].properties.TOT_ENP;
        passenger_traffic.push(Number(pop));
    }

    var min_passenger_value = Math.min.apply(Math, passenger_traffic);
    var max_passenger_value = Math.max.apply(Math, passenger_traffic);

    airport_radius = d3.scalePow()
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
        .on("mousemove", function (airport) {

            d3.select(this).style("fill-opacity", 1);
            mouse = d3.mouse(svg.node()).map(function (value) {
                return parseInt(value);
            });
            tooltip.classed('hidden', false)
                .attr('style', 'left:' + (900) +
                    'px; top:' + (200) + 'px;right:' + (100) + 'px;')
                .html(airport.properties.NAME);

        })
        .on('mouseout', function () {
            d3.select(this).style("fill-opacity", .5);
            tooltip.classed('hidden', true);
        });
}

function configureSearch(error, airport_data) {

    var airport_length = airport_data.features.length;
    var airport_name_list = [];
    for (var index = 0; index < airport_length; index++) {
        var airport_name = airport_data.features[index].properties.NAME;
        airport_name_list.push({ID: String(airport_name)});
    }

    d3.select('#filterCriteria').on('keyup', filterResult);

    function filterResult() {

        svg.selectAll('.highlighted_cities').remove();

        var filteredAirportName = [];
        var filterText = document.getElementById('filterCriteria').value;

        if (filterText != null && filterText != "") {
            filteredAirportName.push(airport_name_list.filter(function (airport) {
                return (airport.ID.toLowerCase().indexOf(filterText.toLowerCase()) === 0);
            }));
        }

        if (filteredAirportName.length != 0) {
            var objectArray = [];
            for (var filteredAirportListIndex = 0; filteredAirportListIndex < filteredAirportName[0].length; filteredAirportListIndex++) {
                for (var airportDataListIndex = 0; airportDataListIndex < airport_data.features.length; airportDataListIndex++) {
                    if (airport_data.features[airportDataListIndex].properties.NAME == filteredAirportName[0][filteredAirportListIndex].ID) {
                        objectArray.push(airport_data.features[airportDataListIndex]);
                    }
                }
            }
            svg.selectAll('.highlighted_cities')
                .data(objectArray)
                .enter()
                .append('path')
                .attr("d", path.pointRadius(function (airport) {

                    return airport_radius(airport.properties.TOT_ENP);
                }))
                .attr('class', 'highlighted_cities')
                .on("mousemove", function (filteredAirport) {
                    mouse = d3.mouse(svg.node()).map(function (value) {
                        return parseInt(value);
                    });
                    tooltip.classed('hidden', false)
                        .attr('style', 'left:' + (900) +
                            'px; top:' + (200) + 'px;right:' + (100) + 'px;')
                        .html(filteredAirport.properties.NAME);

                })
                .on('mouseout', function () {
                    tooltip.classed('hidden', true);
                });
        }
    }
}


