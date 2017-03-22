var filteredAirportInformation = d3.map();

function trigger_data_configuration() {
    queue()
        .defer(d3.csv, './data/airport_delay_data.csv')
        .defer(d3.json, './data/filtered_airport_data.json')
        .await(createAirportDelayObjectFromNest);
}

function createAirportDelayObjectFromNest(error, airport_delay_data, filtered_airport_data) {

    if (error) throw  error;
    nested_data = d3.nest()
        .key(function (d) {
            return String(d.airport);
        })
        .key(function (d) {
            return d.year;
        })
        .key(function (d) {
            return d.month;
        })
        .entries(airport_delay_data);

    filterData(nested_data, filtered_airport_data);
    configureCluster(filteredAirportInformation);
}

function filterData(nested_data, filtered_airport_data) {
    var airport_length = filtered_airport_data.features.length;
    var raw_data_length = nested_data.length;
    for (var index = 0; index < airport_length; index++) {
        var airport_name = filtered_airport_data.features[index].properties.LOCID;
        for (var airportDataListIndex = 0; airportDataListIndex < raw_data_length; airportDataListIndex++) {
            if (nested_data[airportDataListIndex].key === filtered_airport_data.features[index].properties.LOCID) {
                filteredAirportInformation.set(airport_name, nested_data[airportDataListIndex]);
            }
        }
    }
}

function configureCluster(nested_data) {
    console.log(nested_data);
    var dataLength = nested_data.size();
    var expensesTotalByDay = {};
    var input = nested_data.entries();
    console.log(input);
    var yearIndex, year, month, flightEntryIndex;
    for (yearIndex = 0; yearIndex < dataLength; yearIndex++) {
        expensesTotalByDay[input[yearIndex].key] = 0;
        var yearWiseData = input[yearIndex].value.values;
        for (year = 0; year < yearWiseData.length; year++) {
            var monthWiseData = yearWiseData[year].values;
            for (month = 0; month < monthWiseData.length; month++) {
                var multipleFlightEntryData = monthWiseData[month].values;
                for (flightEntryIndex = 0; flightEntryIndex < multipleFlightEntryData.length; flightEntryIndex++) {
                    expensesTotalByDay[input[yearIndex].key] += Number(multipleFlightEntryData[flightEntryIndex].arr_del15);
                }
            }
        }
    }

    console.log(expensesTotalByDay);

    function initialize() {
        var num_clusters = 3;
        var samples1 = d3.range(0, 40).map(function (d) {
            return ['AIRPORT_ID-' + Math.floor(Math.random() * 50), Math.floor(Math.random() * 50)]
        });
        var k = new KMeansClusterAlgorithm(num_clusters, samples1);
        return k;
    }

    function step(k) {
        k.recalculate_centroids();
        k.update_clusters();
    }

    function run() {
        var k = initialize();
        for (var i = 0; i < 50; i++)
            step(k);
        //k.log();
    }

    run();
}
