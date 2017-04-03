var airportDelayCountDataForClustering = [];
var airportDelayDataForClustering = [];


var airportDelayDataForTimeSeries = d3.map();
var weatherDelayDataForTimeSeries = d3.map();
var securityDelayDataForTimeSeries = d3.map();
var lateAircraftDelayDataForTimeSeries = d3.map();
var nasDelayDataForTimeSeries = d3.map();

var airportDelayCountForTimeSeries = d3.map();
var weatherDelayCountForTimeSeries = d3.map();
var securityDelayCountForTimeSeries = d3.map();
var lateAircraftDelayCountForTimeSeries = d3.map();
var nasDelayCountForTimeSeries = d3.map();

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
            nasDelayDataForTimeSeries.set(key, []);

            airportDelayCountForTimeSeries.set(key, []);
            weatherDelayCountForTimeSeries.set(key, []);
            securityDelayCountForTimeSeries.set(key, []);
            lateAircraftDelayCountForTimeSeries.set(key, []);
            nasDelayCountForTimeSeries.set(key, []);

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
                            NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN);
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
                        result.previousMonthlyNASDelayData, result.previousMonthlyAirportDelayCount,
                        result.previousMonthlyWeatherDelayCount, result.previousMonthlySecurityDelayCount,
                        result.previousMonthlyLateAircraftDelayCount, result.previousMonthlyNASDelayCount);
                }
                else {
                    result = buildData(startMonth, endMonth, yearWiseData, result.delayedFlightCount, result.flightsDelayPerAirport, key, year,
                        result.previousMonthlyAirportDelayData, result.previousMonthlyWeatherDelayData,
                        result.previousMonthlySecurityDelayData, result.previousMonthlyLateAircraftDelayData,
                        result.previousMonthlyNASDelayData, result.previousMonthlyAirportDelayCount,
                        result.previousMonthlyWeatherDelayCount, result.previousMonthlySecurityDelayCount,
                        result.previousMonthlyLateAircraftDelayCount, result.previousMonthlyNASDelayCount);
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
    console.log(nasDelayDataForTimeSeries);
    console.log(weatherDelayCountForTimeSeries);
    console.log(securityDelayDataForTimeSeries);
    console.log(securityDelayCountForTimeSeries);
    console.log(lateAircraftDelayCountForTimeSeries);
    console.log(nasDelayCountForTimeSeries);
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
                   previousMonthlyLateAircraftDelayData, previousMonthlyNASDelayData,
                   previousMonthlyAirportDelayCount, previousMonthlyWeatherDelayCount, previousMonthlySecurityDelayCount,
                   previousMonthlyLateAircraftDelayCount, previousMonthlyNASDelayCount) {

    for (var month = startMonth; month <= endMonth; month++) {

        var monthlyAirportDelayData = 0;
        var monthlyWeatherDelayData = 0;
        var monthlySecurityDelayData = 0;
        var monthlyLateAircraftDelayData = 0;
        var monthlyNASDelayData = 0;

        var monthlyAirportDelayCount = 0;
        var monthlyWeatherDelayCount = 0;
        var monthlySecurityDelayCount = 0;
        var monthlyLateAircraftDelayCount = 0;
        var monthlyNASDelayCount = 0;

        var previousMonthlyAirportDelayData = previousMonthlyAirportDelayData;
        var previousMonthlyWeatherDelayData = previousMonthlyWeatherDelayData;
        var previousMonthlySecurityDelayData = previousMonthlySecurityDelayData;
        var previousMonthlyLateAircraftDelayData = previousMonthlyLateAircraftDelayData;
        var previousMonthlyNASDelayData = previousMonthlyNASDelayData;

        var previousMonthlyAirportDelayCount = previousMonthlyAirportDelayCount;
        var previousMonthlyWeatherDelayCount = previousMonthlyWeatherDelayCount;
        var previousMonthlySecurityDelayCount = previousMonthlySecurityDelayCount;
        var previousMonthlyLateAircraftDelayCount = previousMonthlyLateAircraftDelayCount;
        var previousMonthlyNASDelayCount = previousMonthlyNASDelayCount;


        if (yearWiseData.has(month)) {

            previousMonthlyAirportDelayData = 0;
            previousMonthlyWeatherDelayData = 0;
            previousMonthlySecurityDelayData = 0;
            previousMonthlyLateAircraftDelayData = 0;
            previousMonthlyNASDelayData = 0;

            previousMonthlyAirportDelayCount = 0;
            previousMonthlyWeatherDelayCount = 0;
            previousMonthlySecurityDelayCount = 0;
            previousMonthlyLateAircraftDelayCount = 0;
            previousMonthlyNASDelayCount = 0;

            var multipleFlightEntryData = yearWiseData.get(month).entries();
            for (var flightEntryIndex = 0; flightEntryIndex < multipleFlightEntryData.length; flightEntryIndex++) {
                for (var carrierIndex = 0; carrierIndex < multipleFlightEntryData[flightEntryIndex].value.length; carrierIndex++) {

                    delayedFlightCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_del15);

                    flightsDelayPerAirport += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_delay);

                    monthlyAirportDelayData += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_delay);

                    monthlyWeatherDelayData += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].weather_delay);

                    monthlySecurityDelayData += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].security_delay);

                    monthlyLateAircraftDelayData += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].late_aircraft_delay);

                    monthlyNASDelayData += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].nas_delay);

                    monthlyAirportDelayCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_del15);

                    monthlyWeatherDelayCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].weather_ct);

                    monthlySecurityDelayCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].security_ct);

                    monthlyLateAircraftDelayCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].late_aircraft_ct);

                    monthlyNASDelayCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].nas_ct);

                    previousMonthlyAirportDelayData = monthlyAirportDelayData;
                    previousMonthlyWeatherDelayData = monthlyWeatherDelayData;
                    previousMonthlySecurityDelayData = monthlySecurityDelayData;
                    previousMonthlyLateAircraftDelayData = monthlyLateAircraftDelayData;
                    previousMonthlyNASDelayData = monthlyNASDelayData;

                    previousMonthlyAirportDelayCount = monthlyAirportDelayCount;
                    previousMonthlyWeatherDelayCount = monthlyWeatherDelayCount;
                    previousMonthlySecurityDelayCount = monthlySecurityDelayCount;
                    previousMonthlyLateAircraftDelayCount = monthlyLateAircraftDelayCount;
                    previousMonthlyNASDelayCount = monthlyNASDelayCount;

                }
            }

            appendDelayData(airportDelayDataForTimeSeries, monthlyAirportDelayData, key, year, month);

            appendDelayData(weatherDelayDataForTimeSeries, monthlyWeatherDelayData, key, year, month);

            appendDelayData(securityDelayDataForTimeSeries, monthlySecurityDelayData, key, year, month);

            appendDelayData(lateAircraftDelayDataForTimeSeries, monthlyLateAircraftDelayData, key, year, month);

            appendDelayData(nasDelayDataForTimeSeries, monthlyNASDelayData, key, year, month);

            appendDelayData(airportDelayCountForTimeSeries, monthlyAirportDelayCount, key, year, month);

            appendDelayData(weatherDelayCountForTimeSeries, monthlyWeatherDelayCount, key, year, month);

            appendDelayData(securityDelayCountForTimeSeries, monthlySecurityDelayCount, key, year, month);

            appendDelayData(lateAircraftDelayCountForTimeSeries, monthlyLateAircraftDelayCount, key, year, month);

            appendDelayData(nasDelayCountForTimeSeries, monthlyNASDelayCount, key, year, month);

        } else {

            appendDelayData(airportDelayDataForTimeSeries, previousMonthlyAirportDelayData, key, year, month);

            appendDelayData(weatherDelayDataForTimeSeries, previousMonthlyWeatherDelayData, key, year, month);

            appendDelayData(securityDelayDataForTimeSeries, previousMonthlySecurityDelayData, key, year, month);

            appendDelayData(lateAircraftDelayDataForTimeSeries, previousMonthlyLateAircraftDelayData, key, year, month);

            appendDelayData(nasDelayDataForTimeSeries, previousMonthlyNASDelayData, key, year, month);

            appendDelayData(airportDelayCountForTimeSeries, previousMonthlyAirportDelayCount, key, year, month);

            appendDelayData(weatherDelayCountForTimeSeries, previousMonthlyWeatherDelayCount, key, year, month);

            appendDelayData(securityDelayCountForTimeSeries, previousMonthlySecurityDelayCount, key, year, month);

            appendDelayData(lateAircraftDelayCountForTimeSeries, previousMonthlyLateAircraftDelayCount, key, year, month);

            appendDelayData(nasDelayCountForTimeSeries, previousMonthlyNASDelayCount, key, year, month);

        }
    }
    return {
        delayedFlightCount,
        flightsDelayPerAirport,
        previousMonthlyAirportDelayData,
        previousMonthlyWeatherDelayData,
        previousMonthlySecurityDelayData,
        previousMonthlyLateAircraftDelayData,
        previousMonthlyNASDelayData,
        previousMonthlyAirportDelayCount,
        previousMonthlyWeatherDelayCount,
        previousMonthlySecurityDelayCount,
        previousMonthlyLateAircraftDelayCount,
        previousMonthlyNASDelayCount
    };
}

function appendDelayData(dataForTimeSeries, monthlyDelayData, key, year, month) {
    var delayDataSet = dataForTimeSeries.get(key);
    formatData(delayDataSet, year, month, monthlyDelayData);
    dataForTimeSeries.set(key, delayDataSet);
}
