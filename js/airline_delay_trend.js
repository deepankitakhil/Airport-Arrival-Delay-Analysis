function display_airline_delay_trend() {
    var margin = {top: 10, right: 10, bottom: 20, left: 30},
        width = 500 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);
    var y = d3.scaleLinear()
        .range([height, 0]);

    var svg = d3.select("#airline_delay_trend_container").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("./data/data.csv", function (error, data) {
        if (error) throw error;

        data.forEach(function (d) {
            d.sales = +d.sales;
        });

        x.domain(data.map(function (d) {
            return d.salesperson;
        }));
        y.domain([0, d3.max(data, function (d) {
            return d.sales;
        })]);

        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function (d) {
                return x(d.salesperson);
            })
            .attr("width", x.bandwidth())
            .attr("y", function (d) {
                return y(d.sales);
            })
            .attr("height", function (d) {
                return height - y(d.sales);
            });

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        svg.append("g")
            .call(d3.axisLeft(y));

    });
}