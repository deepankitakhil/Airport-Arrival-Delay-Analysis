var airportDelayCountDataForClustering = [];
var airportDelayDataForClustering = [];


var airportDelayDataForTimeSeries = d3.map();
var weatherDelayDataForTimeSeries = d3.map();

var airportDelayCountForTimeSeries = d3.map();
var weatherDelayCountForTimeSeries = d3.map();

function buildDataForVisualization(dateRange) {
    var startDate = dateRange[0].split(',');
    var endDate = dateRange[1].split(',');
    var airportData;
    airportDelayCountDataForClustering = [];
    Object.keys(filteredDataByAirportID)
        .sort()
        .forEach(function (airportCode) {
            var key = airportCode.substr(1);
            airportData = filteredDataByAirportID.get(key);

            airportDelayDataForTimeSeries.set(key, []);
            weatherDelayDataForTimeSeries.set(key, []);

            airportDelayCountForTimeSeries.set(key, []);
            weatherDelayCountForTimeSeries.set(key, []);

            var result;
            var delayedFlightCount = 0;
            var flightsDelayPerAirport = 0;
            var startMonth = Number(startDate[0].trim());
            var startYear = Number(startDate[1].trim());
            var endMonth = Number(endDate[0].trim());
            var endYear = Number(endDate[1].trim());
            var startYearCalculationDone = false;

            for (var year = startYear; year < endYear; year++) {
                if (airportData.has(year)) {
                    var yearWiseData = airportData.get(year);
                    if (!startYearCalculationDone) {
                        result = buildTimeSeriesData(startMonth, 12, yearWiseData, delayedFlightCount, flightsDelayPerAirport, key, year);
                        startYearCalculationDone = true;
                    }
                    else {
                        var yearWiseData = airportData.get(year);
                        result = buildTimeSeriesData(1, 12, yearWiseData, result.delayedFlightCount, result.flightsDelayPerAirport, key, year);
                    }
                } else {
                }
            }
            if (startYearCalculationDone)
                startMonth = 1;

            if (year === endYear) {
                if (airportData.has(year)) {
                    var yearWiseData = airportData.get(year);
                    result = buildTimeSeriesData(startMonth, endMonth, yearWiseData, result.delayedFlightCount, result.flightsDelayPerAirport, key, year);
                }
            }
            airportDelayCountDataForClustering.push([key, airportNameByID.get(key), result.delayedFlightCount]);
            airportDelayDataForClustering.push([key, airportNameByID.get(key), result.flightsDelayPerAirport / result.delayedFlightCount]);
        });

    kMeansCluster();
    delayTrend();
}

function buildData(dataSet, year, month, monthlyDelayedFlightCount) {
    dataSet.push([Date.parse(year + "-" + month), +monthlyDelayedFlightCount]);
}

function kMeansCluster() {
    run();
}

function delayTrend() {
    console.log(airportDelayDataForTimeSeries);
    console.log(airportDelayCountForTimeSeries);
    console.log(weatherDelayDataForTimeSeries);
    console.log(weatherDelayCountForTimeSeries);
}

function run() {
    var k = initialize();
    for (var i = 0; i < 50; i++)
        step(k);
    k.updateClusterInformation();
}

function initialize() {
    var num_clusters = 15;
    var k = new KMeansClusterAlgorithm(num_clusters, airportDelayCountDataForClustering);
    return k;
}

function step(k) {
    k.recalculate_centroids();
    k.update_clusters();
}


function buildTimeSeriesData(startMonth, endMonth, yearWiseData, delayedFlightCount, flightsDelayPerAirport, key, year) {
    for (var month = startMonth; month <= endMonth; month++) {

        var monthlyAirportDelayData = 0;
        var monthlyWeatherDelayData = 0;

        var monthlyAirportDelayCount = 0;
        var monthlyWeatherDelayCount = 0;

        var previousMonthlyAirportDelayData;
        var previousMonthlyWeatherDelayData;

        var previousMonthlyAirportDelayCount;
        var previousMonthlyWeatherDelayCount;


        if (yearWiseData.has(month)) {

            var previousMonthlyAirportDelayData = 0;
            var previousMonthlyWeatherDelayData = 0;

            var previousMonthlyAirportDelayCount = 0;
            var previousMonthlyWeatherDelayCount = 0;

            var multipleFlightEntryData = yearWiseData.get(month).entries();
            for (var flightEntryIndex = 0; flightEntryIndex < multipleFlightEntryData.length; flightEntryIndex++) {
                for (var carrierIndex = 0; carrierIndex < multipleFlightEntryData[flightEntryIndex].value.length; carrierIndex++) {

                    delayedFlightCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_del15);

                    flightsDelayPerAirport += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_delay);

                    monthlyAirportDelayData += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_delay);

                    monthlyWeatherDelayData += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].weather_delay);

                    monthlyAirportDelayCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_del15);

                    monthlyWeatherDelayCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].weather_ct);

                    previousMonthlyAirportDelayData = monthlyAirportDelayData;
                    previousMonthlyWeatherDelayData = monthlyWeatherDelayData;

                    previousMonthlyAirportDelayCount = monthlyAirportDelayCount;
                    previousMonthlyWeatherDelayCount = monthlyWeatherDelayCount;

                }
            }

            var airportDelayDataSet = airportDelayDataForTimeSeries.get(key);
            buildData(airportDelayDataSet, year, month, monthlyAirportDelayData);
            airportDelayDataForTimeSeries.set(key, airportDelayDataSet);

            var weatherDelayDataSet = weatherDelayDataForTimeSeries.get(key);
            buildData(weatherDelayDataSet, year, month, monthlyWeatherDelayData);
            weatherDelayDataForTimeSeries.set(key, weatherDelayDataSet);

            var airportDelayCountSet = airportDelayCountForTimeSeries.get(key);
            buildData(airportDelayCountSet, year, month, monthlyAirportDelayCount);
            airportDelayCountForTimeSeries.set(key, airportDelayCountSet);

            var weatherDelayCountSet = weatherDelayCountForTimeSeries.get(key);
            buildData(weatherDelayCountSet, year, month, monthlyWeatherDelayCount);
            weatherDelayCountForTimeSeries.set(key, weatherDelayCountSet);

        } else {
            var airportDelayDataSet = airportDelayDataForTimeSeries.get(key);
            buildData(airportDelayDataSet, year, month, previousMonthlyAirportDelayData);
            airportDelayDataForTimeSeries.set(key, airportDelayDataSet);

            var weatherDelayDataSet = weatherDelayDataForTimeSeries.get(key);
            buildData(weatherDelayDataSet, year, month, previousMonthlyWeatherDelayData);
            weatherDelayDataForTimeSeries.set(key, weatherDelayDataSet);

            var airportDelayCountSet = airportDelayCountForTimeSeries.get(key);
            buildData(airportDelayCountSet, year, month, previousMonthlyAirportDelayCount);
            airportDelayCountForTimeSeries.set(key, airportDelayCountSet);

            var weatherDelayCountSet = weatherDelayCountForTimeSeries.get(key);
            buildData(weatherDelayCountSet, year, month, previousMonthlyWeatherDelayCount);
            weatherDelayCountForTimeSeries.set(key, weatherDelayCountSet);
        }
    }
    return {
        delayedFlightCount,
        flightsDelayPerAirport

    };
}
