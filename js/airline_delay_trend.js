//canvas variables

// scale y on canvas from largest number to 0
var y = d3.scaleLinear().range([height, 0]);

var barWidth;
var barPadding = 5;
var oldBarWidth = width;
var depth = 0;

var color = d3.scaleOrdinal()
    .range(["steelblue", "#ccc"]);

var duration = 750,
    delay = 25;

function display_airline_delay_trend() {
//attach SVG to body with canvas variables declared above
    var svg = svg.selectAll("#airline_delay_trend_container")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var divTooltip = d3.select("airline_delay_trend_container").append("div").attr("class", "toolTip");

//attach a rectangle to the entire background for drilling
    svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height)
        .on("click", drillUp);

//append axis to the SVG
    svg.append("g")
        .attr("class", "yaxis");
    svg.append("g")
        .append("line")
        .attr("transform", "translate(0," + height + ")")
        .attr("x1", width)
        .attr("stroke", "black")
        .attr("shape-rendering", "crispEdges");

//import JSON file
    d3.json("./data/delay_trend_data.json", function (error, root) {
        if (error) throw error;

        //declare root of the JSON file
        root = d3.hierarchy(root);
        //add all children in hierarchy and get value for all parents
        root.sum(function (d) {
            return (+d.DieDowntime + (+d.MachineDowntime));
        });
        //scale the 'Y' domain/axis from 0 to root value
        y.domain([0, root.value]).nice();


        //call the drill down function
        drillDown(root, 0);
        drillDown(root.children[3], 3);
    });
}

function drillDown(d, i) {

    if (!d.children) return;

    // get the number of children to parent and calculate barWidth and keep track of depth of drill down.
    numChildNodes = d.children.length;
    barWidth = (width / numChildNodes) - barPadding;
    depth += 1;


    var end = duration + numChildNodes * delay;

    // Mark any currently-displayed bars as exiting.
    var exit = d3.select(".airline_delay_trend_container")
        .attr("class", "exit");

    // Entering nodes immediately obscure the clicked-on bar, so hide it.
    exit.selectAll("rect").filter(function (p) {
        return p === d;
    })
        .style("fill-opacity", 0);

    // Enter the new bars for the clicked-on data.
    // Entering bars are immediately visible.
    var enter = drillDownBars(d)
        .attr("transform", stackDown(i))
        .attr("width", oldBarWidth)
        .style("opacity", 1);


    // Update the y-scale domain.
    y.domain([0, d3.max(d.children, function (d) {
        return d.value;
    })]).nice();

    // Have the text fade-in, even though the bars are visible.
    // Color the bars as parents; they will fade to children if appropriate.
    enter.select("text").style("fill-opacity", 0);
    enter.select("rect").style("fill", color(true));


    // Update the y-axis.
    svg.selectAll(".yaxis").transition()
        .duration(duration)
        .call(d3.axisLeft(y));

    // Transition entering bars to their new position.
    var enterTransition = enter.transition()
        .duration(duration)
        .delay(function (d, i) {
            return i * delay;
        })
        .style("opacity", 1)
        .attr("transform", function (d, i) {
            var transBar = (barWidth + barPadding) * i + barPadding;
            return "translate(" + transBar + ")";
        });

    // Transition entering text.
    enterTransition.select("text")
        .attr("transform", function (d) {
            return "translate(" + (barWidth / 2) + "," + ((height + 5) + 10 * depth) + ")rotate(90)"
        })
        // working   .attr("y", height + 15)
        .style("fill-opacity", 1);

    // Transition entering rects to the new y-scale.
    enterTransition.select("rect")
        .attr("y", function (d) {
            return y(d.value);
        })
        .attr("height", function (d) {
            return height - y(d.value);
        })
        .attr("width", barWidth)
        .style("fill", function (d) {
            return color(!!d.children);
        });

    // Transition exiting bars to fade out.
    var exitTransition = exit.transition()
        .duration(duration)
        .style("opacity", 0)
        .remove();

    // Transition exiting bars to the new y-scale.
    exitTransition.selectAll("rect")
        .attr("y", function (d) {
            return y(d.value);
        })
        .attr("height", function (d) {
            return height - y(d.value);
        });

    // Rebind the current node to the background.
    svg.select(".background")
        .datum(d)
        .transition()
        .duration(end);

    d.index = i;
    oldBarWidth = barWidth;

}

function drillUp(d) {

    if (!d.parent || this.__transition__) return;

    numChildNodes = d.parent.children.length;
    barWidth = (width / numChildNodes) - barPadding;
    depth -= 1;

    var end = duration + d.children.length * delay;

    // Mark any currently-displayed bars as exiting.
    var exit = svg.selectAll(".body")
        .attr("class", "exit");


    // Enter the new bars for the clicked-on data's parent.
    var enter = drillUpBars(d.parent)
        .attr("transform", function (d, i) {
            transBarWidth = (barWidth + barPadding) * i + barPadding;
            return "translate(" + transBarWidth + "," + 0 + ")";
        })
        .style("opacity", 0);

    // Color the bars as appropriate.
    // Exiting nodes will obscure the parent bar, so hide it.
    enter.select("rect")
        .style("fill", function (d) {
            return color(!!d.children);
        })
        .filter(function (p) {
            return p === d;
        })
        .style("fill-opacity", 0);


    // Update the y-scale domain.
    y.domain([0, d3.max(d.parent.children, function (d) {
        return d.value;
    })]).nice();

    // Update the y-axis.
    svg.selectAll(".yaxis").transition()
        .duration(duration)
        .call(d3.axisLeft(y));

    // Transition entering bars to fade in over the full duration.
    var enterTransition = enter.transition()
        .duration(end)
        .style("opacity", 1);


    // Transition entering rects to the new y-scale.
    // When the entering parent rect is done, make it visible!
    enterTransition.select("rect")
        .attr("y", function (d) {
            return y(d.value);
        })
        .attr("height", function (d) {
            return height - y(d.value);
        })
        .on("end", function (p) {
            if (p === d) d3.select(this).style("fill-opacity", null);
        });

    // Transition entering text.
    enterTransition.select("text")
        .attr("transform", function (d) {
            return "translate(" + (barWidth / 2) + "," + ((height + 5) + 10 * depth) + ")rotate(90)"
        })
        .style("fill-opacity", 1);

    // Transition exiting bars to the parent's position.
    var exitTransition = exit.selectAll("g").transition()
        .duration(duration)
        .delay(function (d, i) {
            return i * delay;
        })
        .attr("transform", stackUp(d.index));

    // Transition exiting text to fade out.
    exitTransition.select("text")
        .style("fill-opacity", 0);

    // Transition exiting rects to the new scale and fade to parent color.
    exitTransition.select("rect")
        .attr("y", function (d) {
            return y(d.value);
        })
        .attr("height", function (d) {
            return height - y(d.value);
        })
        .attr("width", barWidth)
        .style("fill", color(true));

    // Remove exiting nodes when the last child has finished transitioning.
    exit.transition()
        .duration(end)
        .remove();
    // Rebind the current parent to the background.
    svg.select(".background")
        .datum(d.parent)
        .transition()
        .duration(end);
    oldBarWidth = barWidth;

}

// Creates a set of bars for the given data node, at the specified index.
function drillUpBars(d) {
    var bar = svg.insert("g")
        .attr("class", "enter")
        .selectAll("g")
        .data(d.children)
        .enter().append("g")
        .style("cursor", function (d) {
            return !d.children ? null : "pointer";
        })
        .on("click", drillDown);

    bar.append("text")
        .attr("dx", ".35em")
        .attr("text-anchor", "middle")
        .attr("transform", function (d) {
            return "translate(" + barWidth / 2 + "," + (height + 15) + ") rotate(90)"
        })
        .text(function (d) {
            return d.data.name;
        });

    bar.append("rect")
        .attr("y", function (d) {
            return y(d.value);
        })
        .attr("height", function (d) {
            return height - y(d.value);
        })
        .attr("width", barWidth)
        .attr("stroke-width", 1)
        .attr("stroke", "white");

    return bar;
}

function drillDownBars(d) {
    var bar = svg.insert("g")
        .attr("class", "enter")
        .selectAll("g")
        .data(d.children)
        .enter().append("g")
        .style("cursor", function (d) {
            return !d.children ? null : "pointer";
        })
        .on("click", drillDown)
        .on("mouseover", mouseover)
        .on("mousemove", function (d) {
            divTooltip
                .text(d.data.name + " " + d.value)
                .style("left", (d3.event.pageX - 34) + "px")
                .style("top", (d3.event.pageY - 30) + "px");
        });

    bar.append("text")
        .attr("dx", ".35em")
        .attr("text-anchor", "middle")
        .attr("transform", function (d) {
            return "translate(" + barWidth / 2 + "," + (height + 15 - y(d.value)) + ") rotate(90)"
        })
        .text(function (d) {
            return d.data.name;
        });

    bar.append("rect")
        .attr("height", function (d) {
            return height - y(d.value);
        })
        .attr("width", oldBarWidth)
        .attr("stroke-width", 1)
        .attr("stroke", "white");

    return bar;
}


//Creates a stack of bars
function stackDown(i) {
    var x0 = (oldBarWidth + barPadding) * i + barPadding;
    var y0 = height;
    return function (d) {
        y0 -= height - y(d.value);
        var ty = "translate(" + x0 + "," + y0 + ")";
        return ty;
    };
}

//
function stackUp(i) {
    var x0 = barWidth * i + (barPadding * (i + 1));
    var y0 = 0;
    return function (d) {
        var ty = "translate(" + x0 + "," + y0 + ")";
        y0 -= height - y(d.value);
        return ty;
    };
}

function mouseover() {
    divTooltip.style("display", "inline");
}