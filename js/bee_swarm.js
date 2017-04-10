var swarmBeeDataByAirportID = [];
var bee_swarm_svg;
var bee_sworm_margin;

function display_bee_swarm() {
    bee_sworm_margin = {top: 40, right: 40, bottom: 40, left: 40},
        width = 845,
        height = 100;

    $('#mean_data').empty();

    bee_swarm_svg = d3.select("#mean_data").append('svg')
        .attr('width', width)
        .attr('height', height);

    displaySwarm(swarmBeeDataByAirportID);
}

function displaySwarm(data) {
    var formatValue = d3.format(",d");
    var x = d3.scaleLog()
        .range([0, width]);
    var g = bee_swarm_svg.append("g");
    var margin = bee_sworm_margin;

    x.domain(d3.extent(data, function (d) {
        return d.value;
    }));

    var simulation = d3.forceSimulation(data)
        .force("x", d3.forceX(function (d) {
            return x(d.value);
        }).strength(1))
        .force("y", d3.forceY(height / 2))
        .force("collide", d3.forceCollide(4))
        .stop();

    for (var i = 0; i < 120; ++i)
        simulation.tick();

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + 80 + ")")
        .call(d3.axisBottom(x).ticks(20, ".0s"));

    var cell = g.append("g")
        .attr("class", "cells")
        .selectAll("g")
        .data(d3.voronoi()
            .extent([[-margin.left, -margin.top], [width + margin.right, height + margin.top]])
            .x(function (d) {
                return d.x;
            })
            .y(function (d) {
                return d.y;
            })
            .polygons(data)).enter().append("g");

    cell.append("circle")
        .attr("r", 3)
        .attr("cx", function (d) {
            return d.data.x;
        })
        .attr("cy", function (d) {
            return d.data.y;
        });

    cell.append("path")
        .attr("d", function (d) {
            return "M" + d.join("L") + "Z";
        });

    cell.append("title")
        .text(function (d) {
            return d.data.id + "\n" + formatValue(d.data.value);
        });

}

function buildDataForBeeSwarm() {
    var data;
    swarmBeeDataByAirportID = [];
    if (firstCriteria === 'total_delay' && secondCriteria === 'by_minutes')
        data = airportDelayDataForTimeSeries;
    else if (firstCriteria === 'total_delay' && secondCriteria === 'by_count')
        data = airportDelayCountForTimeSeries;

    else if (firstCriteria === 'security_delay' && secondCriteria === 'by_minutes')
        data = securityDelayDataForTimeSeries;
    else if (firstCriteria === 'security_delay' && secondCriteria === 'by_count')
        data = securityDelayCountForTimeSeries;

    else if (firstCriteria === 'nas_delay' && secondCriteria === 'by_minutes')
        data = nasDelayDataForTimeSeries;
    else if (firstCriteria === 'nas_delay' && secondCriteria === 'by_count')
        data = nasDelayCountForTimeSeries;

    else if (firstCriteria === 'weather_delay' && secondCriteria === 'by_minutes')
        data = weatherDelayDataForTimeSeries;
    else if (firstCriteria === 'weather_delay' && secondCriteria === 'by_count')
        data = weatherDelayCountForTimeSeries;

    else if (firstCriteria === 'late_aircraft_delay' && secondCriteria === 'by_minutes')
        data = lateAircraftDelayDataForTimeSeries;
    else if (firstCriteria === 'late_aircraft_delay' && secondCriteria === 'by_count')
        data = lateAircraftDelayCountForTimeSeries;

    else if (firstCriteria === 'carrier_delay' && secondCriteria === 'by_minutes')
        data = carrierDelayDataForTimeSeries;
    else if (firstCriteria === 'carrier_delay' && secondCriteria === 'by_count')
        data = carrierDelayCountForTimeSeries;
    calculateAverageForBuildingBeeSwarm(data);
}

function calculateAverageForBuildingBeeSwarm(data) {
    var proportionIndex = 1;
    if (secondCriteria === 'by_count')
        proportionIndex = 100;
    Object.keys(data)
        .sort()
        .forEach(function (airportCode) {
            var key = airportCode.substr(1);
            var airportDelayData = data.get(key);
            var length = airportDelayData.length;
            var totalDelay = 0;
            var index = 0;
            for (index = 0; index < length; index++) {
                totalDelay += airportDelayData[index][1];
            }
            swarmBeeDataByAirportID.push({
                id: key,
                value: calculateRatio(totalDelay, index) * proportionIndex
            });
        });
    console.log(swarmBeeDataByAirportID);
    display_bee_swarm();
}
