function display_airline_delay_trend() {
    var margin = {top: 10, right: 10, bottom: 20, left: 50},
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

    var data = selectData();
    console.log(data);

    var data = [
        {name: 'First', value: 1000},
        {name: 'Second', value: 2000},
        {name: 'Third', value: 3000},
        {name: 'Fourth', value: 3000},
        {name: 'Fifth', value: 3000},
        {name: 'Sixth', value: 3000},
    ];

    plotData(x, y, svg, height, data);
}

function plotData(x, y, svg, height, data) {
    y.domain([0, d3.max(data, function (d) {
        return d.value;
    })]);

    x.domain(data.map(function (d) {
        return d.name;
    }));

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (delayData) {
            return x(delayData.name);
        })
        .attr("width", x.bandwidth())
        .attr("y", function (delayData) {
            return y(delayData.value);
        })
        .attr("height", function (delayData) {
            return height - y(delayData.value);
        });

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

}

function selectData() {
    var data;

    if (firstCriteria === 'total_delay' && secondCriteria === 'by_minutes')
        data = airportDelayDataForTimeSeries.get(selected_airport);
    else if (firstCriteria === 'total_delay' && secondCriteria === 'by_count')
        data = airportDelayCountForTimeSeries.get(selected_airport);

    else if (firstCriteria === 'security_delay' && secondCriteria === 'by_minutes')
        data = securityDelayDataForTimeSeries.get(selected_airport);
    else if (firstCriteria === 'security_delay' && secondCriteria === 'by_count')
        data = securityDelayCountForTimeSeries.get(selected_airport);

    else if (firstCriteria === 'nas_delay' && secondCriteria === 'by_minutes')
        data = nasDelayDataForTimeSeries.get(selected_airport);
    else if (firstCriteria === 'nas_delay' && secondCriteria === 'by_count')
        data = nasDelayCountForTimeSeries.get(selected_airport);

    else if (firstCriteria === 'weather_delay' && secondCriteria === 'by_minutes')
        data = weatherDelayDataForTimeSeries.get(selected_airport);
    else if (firstCriteria === 'weather_delay' && secondCriteria === 'by_count')
        data = weatherDelayCountForTimeSeries.get(selected_airport);

    else if (firstCriteria === 'late_aircraft_delay' && secondCriteria === 'by_minutes')
        data = lateAircraftDelayDataForTimeSeries.get(selected_airport);
    else if (firstCriteria === 'late_aircraft_delay' && secondCriteria === 'by_count')
        data = lateAircraftDelayCountForTimeSeries.get(selected_airport);

    else if (firstCriteria === 'carrier_delay' && secondCriteria === 'by_minutes')
        data = carrierDelayDataForTimeSeries.get(selected_airport);
    else if (firstCriteria === 'carrier_delay' && secondCriteria === 'by_count')
        data = carrierDelayCountForTimeSeries.get(selected_airport);

    return data;
}