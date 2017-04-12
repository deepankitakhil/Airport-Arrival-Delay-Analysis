var swarmBeeDataByAirportID = [];
var bee_swarm_svg;
var bee_swarm_margin;
var mean;

function display_bee_swarm() {
    bee_swarm_margin = {top: 40, right: 40, bottom: 40, left: 45};
    width = 845;
    height = 100;

    $('#mean_data').empty();

    bee_swarm_svg = d3.select("#mean_data").append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr("transform","translate("+bee_swarm_margin.left+")");

    displaySwarm(swarmBeeDataByAirportID);
}

function displaySwarm(data) {
    var formatValue = d3.format(",d");
    var x = d3.scaleLog()
        .range([0, width/1.2]);
    var g = bee_swarm_svg.append("g");
    var margin = bee_swarm_margin;

    x.domain(d3.extent(data, function (d) {
        return d.value;
    }));
    var ticks = [];
    var objectArray = [];
    ticks.push(mean);
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
        .attr("class", "axis")
        .attr("transform", "translate(0," + 80 + ")")
        .call(d3.axisBottom(x).scale(x).ticks(3, ".0s").tickValues(ticks).tickFormat('Mean ' + $('#delay_options option:selected').text()));

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
            .polygons(data)).enter().append("g")
        .on("mousemove", function (d) {
            objectArray = [];
            objectArray.push(airportInformationByAirportID.get(d.data.id));
            console.log(objectArray);
            svg.selectAll('.highlighted_cities')
                .data(objectArray)
                .enter()
                .append('path')
                .attr("d", path.pointRadius(function (airport) {
                    tooltip.classed('hidden', false)
                        .attr('style', 'left:' + (300) +
                            'px; top:' + (50) + 'px;right:' + (100) + 'px;')
                        .html(airport.properties.NAME);
                    return airport_radius(airport.properties.TOT_ENP);
                }))
                .attr('class', 'highlighted_cities');
            d3.select(this).style("fill", "red");


        })
        .on("mouseout", function (d) {
            tooltip.classed('hidden', true);
            svg.selectAll('.highlighted_cities').remove();
            d3.select(this).style("fill", "black");
        })
        .on("click", function (d) {
            d3.selectAll(".bee_swarm_cities").remove();

            d3.selectAll(".selected_city_from_table").remove();
            d3.selectAll('.cities').style("fill", "steelblue");
            d3.selectAll('.cities').style("fill-opacity", 0.5);
            window.selected_airport = d.data.id;
            objectArray = [];
            objectArray.push(airportInformationByAirportID.get(d.data.id));
            console.log(objectArray);
            svg.selectAll('.bee_swarm_cities')
                .data(objectArray)
                .enter()
                .append('path')
                .attr("d", path.pointRadius(function (airport) {
                    return airport_radius(airport.properties.TOT_ENP);
                }))
                .attr('class', 'bee_swarm_cities')
                .style('fill', 'black');
            d3.selectAll(".highlighted_cities").remove();
            displayVisualization();
        })

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
            return d.data.id + "\n" + parseFloat(Math.round(d.data.value * 100) / 100).toFixed(2);
        })
        .style("font-size", "50px");

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
    var averageValue = 0;
    var count = 0;
    if (secondCriteria === 'by_count')
        proportionIndex = 100;
    Object.keys(data)
        .sort()
        .forEach(function (airportCode) {
            var key = airportCode.substr(1);
            var airportDelayData = data.get(key);
            var length = airportDelayData.length;
            var totalDelay = 0;
            var index;

            for (index = 0; index < length; index++) {
                totalDelay += Number(airportDelayData[index][1]);
            }
            var computedValue = calculateRatio(totalDelay, index) * proportionIndex;

            averageValue += computedValue;
            count++;
            if (computedValue === "" || computedValue === undefined || Number.isNaN(computedValue) || computedValue === 0) {
                console.log("Average value is 0. Ignoring airport: " + key + " !");
            } else {
                swarmBeeDataByAirportID.push({
                    id: key,
                    value: computedValue
                });
            }
        });
    mean = calculateRatio(averageValue, count);
    display_bee_swarm();
}
