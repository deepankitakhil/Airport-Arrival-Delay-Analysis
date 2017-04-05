function display_airline_delay_trend() {
    var margin = {top: 10, right: 10, bottom: 20, left: 50},
        width = 500 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var y = d3.scaleBand()
        .range([height, 0]);

    var x = d3.scaleSqrt()
        .range([0, width]);

    var svg = d3.select("#airline_delay_trend_container").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var data = selectData();
    console.log(data);

    plotData(x, y, svg, height, data);
}

function plotData(x, y, svg, height, data) {
    x.domain([0, d3.max(data, function(d) { return d.value; })]);
    y.domain(data.map(function(d) { return d.name; })).padding(0.1);

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x",0)
        .attr("height", y.bandwidth())
        .attr("y", function(d) { return y(d.name); })
        .attr("width", function(d) { return x(d.value); })


    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(5).tickFormat(function(d) { return parseInt(d / 1000); }).tickSizeInner([-height]));

    svg.append("g")
        .call(d3.axisLeft(y));

}

function selectData() {
    var filteredData;

    if (firstCriteria === 'total_delay' && secondCriteria === 'by_minutes')
        filteredData = filterEntries(airlineInformationByAirportID.get(selected_airport).entries(), TOTAL, MINUTES);
    else if (firstCriteria === 'total_delay' && secondCriteria === 'by_count')
        filteredData = filterEntries(airlineInformationByAirportID.get(selected_airport).entries(), TOTAL, COUNT);

    else if (firstCriteria === 'security_delay' && secondCriteria === 'by_minutes')
        filteredData = filterEntries(airlineInformationByAirportID.get(selected_airport).entries(), SECURITY, MINUTES);
    else if (firstCriteria === 'security_delay' && secondCriteria === 'by_count')
        filteredData = filterEntries(airlineInformationByAirportID.get(selected_airport).entries(), SECURITY, COUNT);

    else if (firstCriteria === 'nas_delay' && secondCriteria === 'by_minutes')
        filteredData = filterEntries(airlineInformationByAirportID.get(selected_airport).entries(), NAS, MINUTES);

    else if (firstCriteria === 'nas_delay' && secondCriteria === 'by_count')
        filteredData = filterEntries(airlineInformationByAirportID.get(selected_airport).entries(), NAS, COUNT);

    else if (firstCriteria === 'weather_delay' && secondCriteria === 'by_minutes')
        filteredData = filterEntries(airlineInformationByAirportID.get(selected_airport).entries(), WEATHER, MINUTES);

    else if (firstCriteria === 'weather_delay' && secondCriteria === 'by_count')
        filteredData = filterEntries(airlineInformationByAirportID.get(selected_airport).entries(), WEATHER, COUNT);

    else if (firstCriteria === 'late_aircraft_delay' && secondCriteria === 'by_minutes')
        filteredData = filterEntries(airlineInformationByAirportID.get(selected_airport).entries(), LATE_AIRCRAFT, MINUTES);

    else if (firstCriteria === 'late_aircraft_delay' && secondCriteria === 'by_count')
        filteredData = filterEntries(airlineInformationByAirportID.get(selected_airport).entries(), LATE_AIRCRAFT, COUNT);

    else if (firstCriteria === 'carrier_delay' && secondCriteria === 'by_minutes')
        filteredData = filterEntries(airlineInformationByAirportID.get(selected_airport).entries(), CARRIER, MINUTES);

    else if (firstCriteria === 'carrier_delay' && secondCriteria === 'by_count')
        filteredData = filterEntries(airlineInformationByAirportID.get(selected_airport).entries(), CARRIER, COUNT);

    return filteredData;
}

function filterEntries(input, delay_type, option) {
    var data = [];
    var input_length = input.length;

    for (var index = 0; index < input_length; index++) {
        var element = {};
        element["name"] = input[index].key;
        element["value"] = input[index].value.get(option).get(delay_type);
        data.push(element);
    }
    return data;
}