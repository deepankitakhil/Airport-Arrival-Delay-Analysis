function display_bee_swarm() {
    var svg = d3.select("#mean_data").append('svg'),
        margin = {top: 40, right: 40, bottom: 40, left: 40},
        width = 960 - margin.left - margin.right,
        height = 100 - margin.top - margin.bottom;

    var formatValue = d3.format(",d");

    var x = d3.scaleLog()
        .range([0, width]);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("./data/flare.csv", type, function (error, data) {
        if (error) throw error;

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

        for (var i = 0; i < 120; ++i) simulation.tick();


        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")

            //.attr("d", "M" + width + ",0L" + (width + 20) + ",0L" + (width + 20) + ",-5L" + (width + 30) + ",0L"  + (width + 20) + ",5L" + (width + 20) + ",0L")

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
                console.log(d);
                return "M" + d.join("L") + "Z";
            });

        cell.append("title")
            .text(function (d) {
                return d.data.id + "\n" + formatValue(d.data.value);
            });
    });

    function type(d) {
        if (!d.value) return;
        d.value = +d.value;
        return d;
    }
}