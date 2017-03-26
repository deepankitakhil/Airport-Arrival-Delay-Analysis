var dataByAirportID = d3.map();
var filteredDataByAirportID = d3.map();
var monthToNumber = {
    'January': 1,
    'February': 2,
    'March': 3,
    'April': 4,
    'May': 5,
    'June': 6,
    'July': 7,
    'August': 8,
    'September': 9,
    'October': 10,
    'November': 11,
    'December': 12
};

function triggerDataConfiguration() {
    queue()
        .defer(d3.csv, './data/airport_delay_data.csv')
        .defer(d3.json, './data/filtered_airport_data.json')
        .await(createAirportDelayObjectFromCustomMap);
}

function createAirportDelayObjectFromCustomMap(error, airport_delay_data, filtered_airport_data) {

    if (error) throw  error;
    mapDataToKeyValuePair(airport_delay_data);
    filterDataForConsistency(dataByAirportID, filtered_airport_data);
    var dateRange = ["1, 2011", "12, 2016"];
    configureCluster("JFK", dateRange);
}

function mapDataToKeyValuePair(airport_delay_data) {
    var raw_data_length = airport_delay_data.length;

    for (var rowIndex = 0; rowIndex < raw_data_length; rowIndex++) {
        var airportID = airport_delay_data[rowIndex].airport;
        var year = airport_delay_data[rowIndex].year;
        var month = airport_delay_data[rowIndex].month;
        var carrier = airport_delay_data[rowIndex].carrier;
        if (dataByAirportID.has(airportID)) {
            var dataByYear = dataByAirportID.get(airportID);
            if (dataByYear.has(year)) {
                var dataByMonth = dataByYear.get(year);
                if (dataByMonth.has(month)) {
                    var dataByCarrier = dataByMonth.get(month);
                    if (dataByCarrier.has(carrier)) {
                        var dataSet = dataByCarrier.get(carrier);
                        dataSet.push(airport_delay_data[rowIndex]);
                        dataByCarrier.set(carrier, dataSet);
                    } else {
                        var dataSet = [];
                        dataSet.push(airport_delay_data[rowIndex]);
                        dataByCarrier.set(carrier, dataSet);
                    }
                } else {
                    var dataByCarrier = d3.map();
                    var dataSet = [];
                    dataSet.push(airport_delay_data[rowIndex]);
                    dataByCarrier.set(carrier, dataSet);
                    dataByMonth.set(month, dataByCarrier);
                }
            } else {
                dataByYear.set(year, d3.map());
            }
        } else {
            var dataByYear = d3.map();
            var dataByMonth = d3.map();
            var dataByCarrier = d3.map();
            var dataSet = [];
            dataSet.push(airport_delay_data[rowIndex]);
            dataByCarrier.set(carrier, dataSet);
            dataByMonth.set(month, dataByCarrier);
            dataByYear.set(year, dataByMonth);
            dataByAirportID.set(airportID, dataByYear);
        }
    }
}

function filterDataForConsistency(dataByAirportID, filtered_airport_data) {
    var airport_length = filtered_airport_data.features.length;
    for (var index = 0; index < airport_length; index++) {
        var airport_name = filtered_airport_data.features[index].properties.LOCID;
        if (dataByAirportID.has(airport_name)) {
            filteredDataByAirportID.set(airport_name, dataByAirportID.get(airport_name));
        }
    }
}