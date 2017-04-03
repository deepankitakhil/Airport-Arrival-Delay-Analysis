var airportDelayCountDataForClustering = [];
var airportDelayDataForClustering = [];


var airportDelayDataForTimeSeries = d3.map();
var weatherDelayDataForTimeSeries = d3.map();
var securityDelayDataForTimeSeries = d3.map();
var lateAircraftDelayDataForTimeSeries = d3.map();

var airportDelayCountForTimeSeries = d3.map();
var weatherDelayCountForTimeSeries = d3.map();
var securityDelayCountForTimeSeries = d3.map();
var lateAircraftDelayCountForTimeSeries = d3.map();

//nas, late_aircraft

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
            securityDelayDataForTimeSeries.set(key, []);
            lateAircraftDelayDataForTimeSeries.set(key, []);

            airportDelayCountForTimeSeries.set(key, []);
            weatherDelayCountForTimeSeries.set(key, []);
            securityDelayCountForTimeSeries.set(key, []);
            lateAircraftDelayCountForTimeSeries.set(key, []);

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
                        result = buildData(startMonth, 12, yearWiseData, delayedFlightCount, flightsDelayPerAirport, key, year,
                            NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN);
                        startYearCalculationDone = true;
                    }
                    else {
                        var yearWiseData = airportData.get(year);
                        result = buildData(1, 12, yearWiseData, result.delayedFlightCount, result.flightsDelayPerAirport, key, year,
                            result.previousMonthlyAirportDelayData, result.previousMonthlyWeatherDelayData,
                            result.previousMonthlySecurityDelayData, result.previousMonthlyLateAircraftDelayData,
                            result.previousMonthlyAirportDelayCount, result.previousMonthlyWeatherDelayCount,
                            result.previousMonthlySecurityDelayCount, result.previousMonthlyLateAircraftDelayCount);
                    }
                } else {
                }
            }
            if (startYearCalculationDone)
                startMonth = 1;

            if (year === endYear) {
                if (airportData.has(year)) {
                    var yearWiseData = airportData.get(year);
                    result = buildData(startMonth, endMonth, yearWiseData, result.delayedFlightCount, result.flightsDelayPerAirport, key, year,
                        result.previousMonthlyAirportDelayData, result.previousMonthlyWeatherDelayData,
                        result.previousMonthlySecurityDelayData, result.previousMonthlyLateAircraftDelayData,
                        result.previousMonthlyAirportDelayCount, result.previousMonthlyWeatherDelayCount,
                        result.previousMonthlySecurityDelayCount, result.previousMonthlyLateAircraftDelayCount);
                }
                else {
                    result = buildData(startMonth, endMonth, yearWiseData, result.delayedFlightCount, result.flightsDelayPerAirport, key, year,
                        result.previousMonthlyAirportDelayData, result.previousMonthlyWeatherDelayData,
                        result.previousMonthlySecurityDelayData, result.previousMonthlyLateAircraftDelayData,
                        result.previousMonthlyAirportDelayCount, result.previousMonthlyWeatherDelayCount,
                        result.previousMonthlySecurityDelayCount, result.previousMonthlyLateAircraftDelayCount);
                }
            }
            airportDelayCountDataForClustering.push([key, airportNameByID.get(key), result.delayedFlightCount]);
            airportDelayDataForClustering.push([key, airportNameByID.get(key), result.flightsDelayPerAirport / result.delayedFlightCount]);
        });

    kMeansCluster();
    debugDelayTrendData();
}

function formatData(dataSet, year, month, monthlyDelayedFlightCount) {
    dataSet.push([Date.parse(year + "-" + month), +monthlyDelayedFlightCount]);
}

function kMeansCluster() {
    run();
}

function debugDelayTrendData() {
    console.log(airportDelayDataForTimeSeries);
    console.log(airportDelayCountForTimeSeries);
    console.log(weatherDelayDataForTimeSeries);
    console.log(lateAircraftDelayDataForTimeSeries);
    console.log(weatherDelayCountForTimeSeries);
    console.log(securityDelayDataForTimeSeries);
    console.log(securityDelayCountForTimeSeries);
    console.log(lateAircraftDelayCountForTimeSeries);
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


function buildData(startMonth, endMonth, yearWiseData, delayedFlightCount, flightsDelayPerAirport, key, year,
                   previousMonthlyAirportDelayData, previousMonthlyWeatherDelayData, previousMonthlySecurityDelayData,
                   previousMonthlyLateAircraftDelayData, previousMonthlyAirportDelayCount, previousMonthlyWeatherDelayCount,
                   previousMonthlySecurityDelayCount, previousMonthlyLateAircraftDelayCount) {
    for (var month = startMonth; month <= endMonth; month++) {

        var monthlyAirportDelayData = 0;
        var monthlyWeatherDelayData = 0;
        var monthlySecurityDelayData = 0;
        var monthlyLateAircraftDelayData = 0;

        var monthlyAirportDelayCount = 0;
        var monthlyWeatherDelayCount = 0;
        var monthlySecurityDelayCount = 0;
        var monthlyLateAircraftDelayCount = 0;

        var previousMonthlyAirportDelayData = previousMonthlyAirportDelayData;
        var previousMonthlyWeatherDelayData = previousMonthlyWeatherDelayData;
        var previousMonthlySecurityDelayData = previousMonthlySecurityDelayData;
        var previousMonthlyLateAircraftDelayData = previousMonthlyLateAircraftDelayData;

        var previousMonthlyAirportDelayCount = previousMonthlyAirportDelayCount;
        var previousMonthlyWeatherDelayCount = previousMonthlyWeatherDelayCount;
        var previousMonthlySecurityDelayCount = previousMonthlySecurityDelayCount;
        var previousMonthlyLateAircraftDelayCount = previousMonthlyLateAircraftDelayCount;


        if (yearWiseData.has(month)) {

            previousMonthlyAirportDelayData = 0;
            previousMonthlyWeatherDelayData = 0;
            previousMonthlySecurityDelayData = 0;
            previousMonthlyLateAircraftDelayData = 0;

            previousMonthlyAirportDelayCount = 0;
            previousMonthlyWeatherDelayCount = 0;
            previousMonthlySecurityDelayCount = 0;
            previousMonthlyLateAircraftDelayCount = 0;

            var multipleFlightEntryData = yearWiseData.get(month).entries();
            for (var flightEntryIndex = 0; flightEntryIndex < multipleFlightEntryData.length; flightEntryIndex++) {
                for (var carrierIndex = 0; carrierIndex < multipleFlightEntryData[flightEntryIndex].value.length; carrierIndex++) {

                    delayedFlightCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_del15);

                    flightsDelayPerAirport += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_delay);

                    monthlyAirportDelayData += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_delay);

                    monthlyWeatherDelayData += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].weather_delay);

                    monthlySecurityDelayData += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].security_delay);

                    monthlyLateAircraftDelayData += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].late_aircraft_delay);

                    monthlyAirportDelayCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_del15);

                    monthlyWeatherDelayCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].weather_ct);

                    monthlySecurityDelayCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].security_ct);

                    monthlyLateAircraftDelayCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].late_aircraft_ct);

                    previousMonthlyAirportDelayData = monthlyAirportDelayData;
                    previousMonthlyWeatherDelayData = monthlyWeatherDelayData;
                    previousMonthlySecurityDelayData = monthlySecurityDelayData;
                    previousMonthlyLateAircraftDelayData = monthlyLateAircraftDelayData;

                    previousMonthlyAirportDelayCount = monthlyAirportDelayCount;
                    previousMonthlyWeatherDelayCount = monthlyWeatherDelayCount;
                    previousMonthlySecurityDelayCount = monthlySecurityDelayCount;
                    previousMonthlyLateAircraftDelayCount = monthlyLateAircraftDelayCount;

                }
            }

            var airportDelayDataSet = airportDelayDataForTimeSeries.get(key);
            formatData(airportDelayDataSet, year, month, monthlyAirportDelayData);
            airportDelayDataForTimeSeries.set(key, airportDelayDataSet);

            var weatherDelayDataSet = weatherDelayDataForTimeSeries.get(key);
            formatData(weatherDelayDataSet, year, month, monthlyWeatherDelayData);
            weatherDelayDataForTimeSeries.set(key, weatherDelayDataSet);

            var securityDelayDataSet = securityDelayDataForTimeSeries.get(key);
            formatData(securityDelayDataSet, year, month, monthlySecurityDelayData);
            securityDelayDataForTimeSeries.set(key, securityDelayDataSet);

            var lateCraftDelayDataSet = lateAircraftDelayDataForTimeSeries.get(key);
            formatData(lateCraftDelayDataSet, year, month, monthlyLateAircraftDelayData);
            lateAircraftDelayDataForTimeSeries.set(key, lateCraftDelayDataSet);

            var airportDelayCountSet = airportDelayCountForTimeSeries.get(key);
            formatData(airportDelayCountSet, year, month, monthlyAirportDelayCount);
            airportDelayCountForTimeSeries.set(key, airportDelayCountSet);

            var weatherDelayCountSet = weatherDelayCountForTimeSeries.get(key);
            formatData(weatherDelayCountSet, year, month, monthlyWeatherDelayCount);
            weatherDelayCountForTimeSeries.set(key, weatherDelayCountSet);

            var securityDelayCountSet = securityDelayCountForTimeSeries.get(key);
            formatData(securityDelayCountSet, year, month, monthlySecurityDelayCount);
            securityDelayCountForTimeSeries.set(key, securityDelayCountSet);

            var lateAircraftDelayCountSet = lateAircraftDelayCountForTimeSeries.get(key);
            formatData(lateAircraftDelayCountSet, year, month, monthlyLateAircraftDelayCount);
            lateAircraftDelayCountForTimeSeries.set(key, lateAircraftDelayCountSet);

        } else {
            var airportDelayDataSet = airportDelayDataForTimeSeries.get(key);
            formatData(airportDelayDataSet, year, month, previousMonthlyAirportDelayData);
            airportDelayDataForTimeSeries.set(key, airportDelayDataSet);

            var weatherDelayDataSet = weatherDelayDataForTimeSeries.get(key);
            formatData(weatherDelayDataSet, year, month, previousMonthlyWeatherDelayData);
            weatherDelayDataForTimeSeries.set(key, weatherDelayDataSet);

            var securityDelayDataSet = securityDelayDataForTimeSeries.get(key);
            formatData(securityDelayDataSet, year, month, previousMonthlySecurityDelayData);
            securityDelayDataForTimeSeries.set(key, securityDelayDataSet);

            var lateCraftDelayDataSet = lateAircraftDelayDataForTimeSeries.get(key);
            formatData(lateCraftDelayDataSet, year, month, previousMonthlyLateAircraftDelayData);
            lateAircraftDelayDataForTimeSeries.set(key, lateCraftDelayDataSet);

            var airportDelayCountSet = airportDelayCountForTimeSeries.get(key);
            formatData(airportDelayCountSet, year, month, previousMonthlyAirportDelayCount);
            airportDelayCountForTimeSeries.set(key, airportDelayCountSet);

            var weatherDelayCountSet = weatherDelayCountForTimeSeries.get(key);
            formatData(weatherDelayCountSet, year, month, previousMonthlyWeatherDelayCount);
            weatherDelayCountForTimeSeries.set(key, weatherDelayCountSet);

            var securityDelayCountSet = securityDelayCountForTimeSeries.get(key);
            formatData(securityDelayCountSet, year, month, previousMonthlySecurityDelayCount);
            securityDelayCountForTimeSeries.set(key, securityDelayCountSet);

            var lateAircraftDelayCountSet = lateAircraftDelayCountForTimeSeries.get(key);
            formatData(lateAircraftDelayCountSet, year, month, previousMonthlyLateAircraftDelayCount);
            lateAircraftDelayCountForTimeSeries.set(key, lateAircraftDelayCountSet);
        }
    }
    return {
        delayedFlightCount,
        flightsDelayPerAirport,
        previousMonthlyAirportDelayData,
        previousMonthlyWeatherDelayData,
        previousMonthlySecurityDelayData,
        previousMonthlyLateAircraftDelayData,
        previousMonthlyAirportDelayCount,
        previousMonthlyWeatherDelayCount,
        previousMonthlySecurityDelayCount,
        previousMonthlyLateAircraftDelayCount
    };
}
