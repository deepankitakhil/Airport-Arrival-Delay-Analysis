var NAS = "NAS";
var SECURITY = "SECURITY";
var LATE_AIRCRAFT = "LATE_AIRCRAFT";
var WEATHER = "WEATHER";
var CARRIER = "CARRIER";
var TOTAL = "TOTAL";
var COUNT = "COUNT";
var MINUTES = "MINUTES";
var NUMBER_OF_ENTRIES = "NUMBER_OF_ENTRIES";

var airportDelayDataForClustering;
var nasDelayDataForClustering;
var lateAircraftDelayDataForClustering;
var carrierDelayDataForClustering;
var weatherDelayDataForClustering;
var securityDelayDataForClustering;
var airportDelayCountForClustering;
var nasDelayCountForClustering;
var lateAircraftDelayCountForClustering;
var carrierDelayCountForClustering;
var weatherDelayCountForClustering;
var securityDelayCountForClustering;

var airportDelayDataForTimeSeries = d3.map();
var weatherDelayDataForTimeSeries = d3.map();
var securityDelayDataForTimeSeries = d3.map();
var lateAircraftDelayDataForTimeSeries = d3.map();
var nasDelayDataForTimeSeries = d3.map();
var carrierDelayDataForTimeSeries = d3.map();

var airportDelayCountForTimeSeries = d3.map();
var weatherDelayCountForTimeSeries = d3.map();
var securityDelayCountForTimeSeries = d3.map();
var lateAircraftDelayCountForTimeSeries = d3.map();
var nasDelayCountForTimeSeries = d3.map();
var carrierDelayCountForTimeSeries = d3.map();

var airlineInformationByAirportID = d3.map();

function buildDataForVisualization(dateRange) {
    clearOldEntriesForClustering();
    var startDate = dateRange[0].split(',');
    var endDate = dateRange[1].split(',');
    var airportData;
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
            carrierDelayDataForTimeSeries.set(key, []);

            airportDelayCountForTimeSeries.set(key, []);
            weatherDelayCountForTimeSeries.set(key, []);
            securityDelayCountForTimeSeries.set(key, []);
            lateAircraftDelayCountForTimeSeries.set(key, []);
            nasDelayCountForTimeSeries.set(key, []);
            carrierDelayCountForTimeSeries.set(key, []);

            var airlineInformation = d3.map();
            airlineInformationByAirportID.set(key, airlineInformation);

            var result = {
                delayedFlightCount: 0,
                flightsDelayPerAirport: 0,
                previousMonthlyAirportDelayData: 0,
                previousMonthlyWeatherDelayData: 0,
                previousMonthlySecurityDelayData: 0,
                previousMonthlyLateAircraftDelayData: 0,
                previousMonthlyNASDelayData: 0,
                previousMonthlyCarrierDelayData: 0,
                previousMonthlyAirportDelayCount: 0,
                previousMonthlyWeatherDelayCount: 0,
                previousMonthlySecurityDelayCount: 0,
                previousMonthlyLateAircraftDelayCount: 0,
                previousMonthlyNASDelayCount: 0,
                previousMonthlyCarrierDelayCount: 0
            };

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
                            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
                        buildBarChartData(yearWiseData, airlineInformation, startMonth, 12);
                        startYearCalculationDone = true;
                    }
                    else {
                        var yearWiseData = airportData.get(year);
                        result = buildData(1, 12, yearWiseData, result.delayedFlightCount, result.flightsDelayPerAirport, key, year,
                            result.previousMonthlyAirportDelayData, result.previousMonthlyWeatherDelayData,
                            result.previousMonthlySecurityDelayData, result.previousMonthlyLateAircraftDelayData,
                            result.previousMonthlyNASDelayData, result.previousMonthlyCarrierDelayData,
                            result.previousMonthlyAirportDelayCount, result.previousMonthlyWeatherDelayCount,
                            result.previousMonthlySecurityDelayCount, result.previousMonthlyLateAircraftDelayCount,
                            result.previousMonthlyNASDelayCount, result.previousMonthlyCarrierDelayCount);

                        buildBarChartData(yearWiseData, airlineInformation, 1, 12);

                    }
                } else {
                }
            }
            if (startYearCalculationDone)
                startMonth = 1;

            if (year === endYear) {
                if (airportData.has(year)) {
                    var yearWiseData = airportData.get(year);
                    buildBarChartData(yearWiseData, airlineInformation, startMonth, endMonth);
                    result = buildData(startMonth, endMonth, yearWiseData, result.delayedFlightCount, result.flightsDelayPerAirport, key, year,
                        result.previousMonthlyAirportDelayData, result.previousMonthlyWeatherDelayData,
                        result.previousMonthlySecurityDelayData, result.previousMonthlyLateAircraftDelayData,
                        result.previousMonthlyNASDelayData, result.previousMonthlyCarrierDelayData,
                        result.previousMonthlyAirportDelayCount, result.previousMonthlyWeatherDelayCount,
                        result.previousMonthlySecurityDelayCount, result.previousMonthlyLateAircraftDelayCount,
                        result.previousMonthlyNASDelayCount, result.previousMonthlyCarrierDelayCount);
                }
            }
            airportDelayDataForClustering.push([key, airportNameByID.get(key), result.flightsDelayPerAirport]);
            nasDelayDataForClustering.push([key, airportNameByID.get(key), result.previousMonthlyNASDelayData]);
            lateAircraftDelayDataForClustering.push([key, airportNameByID.get(key), result.previousMonthlyLateAircraftDelayData]);
            carrierDelayDataForClustering.push([key, airportNameByID.get(key), result.previousMonthlyCarrierDelayData]);
            weatherDelayDataForClustering.push([key, airportNameByID.get(key), result.previousMonthlyWeatherDelayData]);
            securityDelayDataForClustering.push([key, airportNameByID.get(key), result.previousMonthlySecurityDelayData]);
            airportDelayCountForClustering.push([key, airportNameByID.get(key), result.previousMonthlyAirportDelayCount]);
            nasDelayCountForClustering.push([key, airportNameByID.get(key), result.previousMonthlyNASDelayCount]);
            lateAircraftDelayCountForClustering.push([key, airportNameByID.get(key), result.previousMonthlyLateAircraftDelayCount]);
            carrierDelayCountForClustering.push([key, airportNameByID.get(key), result.previousMonthlyCarrierDelayCount]);
            weatherDelayCountForClustering.push([key, airportNameByID.get(key), result.previousMonthlyWeatherDelayCount]);
            securityDelayCountForClustering.push([key, airportNameByID.get(key), result.previousMonthlySecurityDelayCount]);
        });
    kMeansCluster();
}

function formatData(dataSet, year, month, monthlyDelayedFlightCount) {
    dataSet.push([Date.parse(year + "-" + month), +monthlyDelayedFlightCount]);
}

function kMeansCluster() {
    var data = null;

    if (firstCriteria === 'total_delay' && secondCriteria === 'by_minutes')
        data = airportDelayDataForClustering;
    else if (firstCriteria === 'total_delay' && secondCriteria === 'by_count')
        data = airportDelayCountForClustering;

    else if (firstCriteria === 'security_delay' && secondCriteria === 'by_minutes')
        data = securityDelayDataForClustering;
    else if (firstCriteria === 'security_delay' && secondCriteria === 'by_count')
        data = securityDelayCountForClustering;

    else if (firstCriteria === 'nas_delay' && secondCriteria === 'by_minutes')
        data = nasDelayDataForClustering;
    else if (firstCriteria === 'nas_delay' && secondCriteria === 'by_count')
        data = nasDelayCountForClustering;

    else if (firstCriteria === 'weather_delay' && secondCriteria === 'by_minutes')
        data = weatherDelayDataForClustering;
    else if (firstCriteria === 'weather_delay' && secondCriteria === 'by_count')
        data = weatherDelayCountForClustering;

    else if (firstCriteria === 'late_aircraft_delay' && secondCriteria === 'by_minutes')
        data = lateAircraftDelayDataForClustering;
    else if (firstCriteria === 'late_aircraft_delay' && secondCriteria === 'by_count')
        data = lateAircraftDelayCountForClustering;

    else if (firstCriteria === 'carrier_delay' && secondCriteria === 'by_minutes')
        data = carrierDelayDataForClustering;
    else if (firstCriteria === 'carrier_delay' && secondCriteria === 'by_count')
        data = carrierDelayCountForClustering;
    run(data);
}

function run(data) {
    var num_clusters = 10;
    var k = initialize(num_clusters, data);
    for (var i = 0; i < 50; i++)
        step(k);
    k.updateClusterInformation();
}

function initialize(num_clusters, data) {

    var k = new KMeansClusterAlgorithm(num_clusters, data);
    return k;
}

function step(k) {
    k.recalculate_centroids();
    k.update_clusters();
}


function buildData(startMonth, endMonth, yearWiseData, delayedFlightCount, flightsDelayPerAirport, key, year,
                   previousMonthlyAirportDelayData, previousMonthlyWeatherDelayData, previousMonthlySecurityDelayData,
                   previousMonthlyLateAircraftDelayData, previousMonthlyNASDelayData, previousMonthlyCarrierDelayData,
                   previousMonthlyAirportDelayCount, previousMonthlyWeatherDelayCount, previousMonthlySecurityDelayCount,
                   previousMonthlyLateAircraftDelayCount, previousMonthlyNASDelayCount, previousMonthlyCarrierDelayCount) {

    for (var month = startMonth; month <= endMonth; month++) {

        var monthlyAirportDelayData = 0;
        var monthlyWeatherDelayData = 0;
        var monthlySecurityDelayData = 0;
        var monthlyLateAircraftDelayData = 0;
        var monthlyNASDelayData = 0;
        var monthlyCarrierDelayData = 0;

        var monthlyAirportDelayCount = 0;
        var monthlyWeatherDelayCount = 0;
        var monthlySecurityDelayCount = 0;
        var monthlyLateAircraftDelayCount = 0;
        var monthlyNASDelayCount = 0;
        var monthlyCarrierDelayCount = 0;

        var previousMonthlyAirportDelayData = previousMonthlyAirportDelayData;
        var previousMonthlyWeatherDelayData = previousMonthlyWeatherDelayData;
        var previousMonthlySecurityDelayData = previousMonthlySecurityDelayData;
        var previousMonthlyLateAircraftDelayData = previousMonthlyLateAircraftDelayData;
        var previousMonthlyNASDelayData = previousMonthlyNASDelayData;
        var previousMonthlyCarrierDelayData = previousMonthlyCarrierDelayData;

        var previousMonthlyAirportDelayCount = previousMonthlyAirportDelayCount;
        var previousMonthlyWeatherDelayCount = previousMonthlyWeatherDelayCount;
        var previousMonthlySecurityDelayCount = previousMonthlySecurityDelayCount;
        var previousMonthlyLateAircraftDelayCount = previousMonthlyLateAircraftDelayCount;
        var previousMonthlyNASDelayCount = previousMonthlyNASDelayCount;
        var previousMonthlyCarrierDelayCount = previousMonthlyCarrierDelayCount;
        var monthlyTotalCarrierCount = 0;


        if (yearWiseData.has(month)) {

            previousMonthlyAirportDelayData = 0;
            previousMonthlyWeatherDelayData = 0;
            previousMonthlySecurityDelayData = 0;
            previousMonthlyLateAircraftDelayData = 0;
            previousMonthlyNASDelayData = 0;
            previousMonthlyCarrierDelayData = 0;

            previousMonthlyAirportDelayCount = 0;
            previousMonthlyWeatherDelayCount = 0;
            previousMonthlySecurityDelayCount = 0;
            previousMonthlyLateAircraftDelayCount = 0;
            previousMonthlyNASDelayCount = 0;
            previousMonthlyCarrierDelayCount = 0;
            monthlyTotalCarrierCount = 0;

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

                    monthlyCarrierDelayData += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].carrier_delay);

                    monthlyAirportDelayCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_del15);

                    monthlyWeatherDelayCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].weather_ct);

                    monthlySecurityDelayCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].security_ct);

                    monthlyLateAircraftDelayCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].late_aircraft_ct);

                    monthlyNASDelayCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].nas_ct);

                    monthlyCarrierDelayCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].carrier_ct);

                    monthlyTotalCarrierCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_flights);

                    previousMonthlyAirportDelayData = monthlyAirportDelayData;
                    previousMonthlyWeatherDelayData = monthlyWeatherDelayData;
                    previousMonthlySecurityDelayData = monthlySecurityDelayData;
                    previousMonthlyLateAircraftDelayData = monthlyLateAircraftDelayData;
                    previousMonthlyNASDelayData = monthlyNASDelayData;
                    previousMonthlyCarrierDelayData = monthlyCarrierDelayData;

                    previousMonthlyAirportDelayCount = monthlyAirportDelayCount;
                    previousMonthlyWeatherDelayCount = monthlyWeatherDelayCount;
                    previousMonthlySecurityDelayCount = monthlySecurityDelayCount;
                    previousMonthlyLateAircraftDelayCount = monthlyLateAircraftDelayCount;
                    previousMonthlyNASDelayCount = monthlyNASDelayCount;
                    previousMonthlyCarrierDelayCount = monthlyCarrierDelayCount;

                }
            }

            appendDelayData(airportDelayDataForTimeSeries, calculateRatio(monthlyAirportDelayData, monthlyAirportDelayCount), key, year, month);

            appendDelayData(weatherDelayDataForTimeSeries, calculateRatio(monthlyWeatherDelayData, monthlyAirportDelayCount), key, year, month);

            appendDelayData(securityDelayDataForTimeSeries, calculateRatio(monthlySecurityDelayData, monthlyAirportDelayCount), key, year, month);

            appendDelayData(lateAircraftDelayDataForTimeSeries, calculateRatio(monthlyLateAircraftDelayData, monthlyAirportDelayCount), key, year, month);

            appendDelayData(nasDelayDataForTimeSeries, calculateRatio(monthlyNASDelayData, monthlyAirportDelayCount), key, year, month);

            appendDelayData(carrierDelayDataForTimeSeries, calculateRatio(monthlyCarrierDelayData, monthlyAirportDelayCount), key, year, month);

            appendDelayData(airportDelayCountForTimeSeries, calculateRatio(monthlyAirportDelayCount, monthlyTotalCarrierCount), key, year, month);

            appendDelayData(weatherDelayCountForTimeSeries, calculateRatio(monthlyWeatherDelayCount, monthlyTotalCarrierCount), key, year, month);

            appendDelayData(securityDelayCountForTimeSeries, calculateRatio(monthlySecurityDelayCount, monthlyTotalCarrierCount), key, year, month);

            appendDelayData(lateAircraftDelayCountForTimeSeries, calculateRatio(monthlyLateAircraftDelayCount, monthlyTotalCarrierCount), key, year, month);

            appendDelayData(nasDelayCountForTimeSeries, calculateRatio(monthlyNASDelayCount, monthlyTotalCarrierCount), key, year, month);

            appendDelayData(carrierDelayCountForTimeSeries, calculateRatio(monthlyCarrierDelayCount, monthlyTotalCarrierCount), key, year, month);

        } else {

            appendDelayData(airportDelayDataForTimeSeries, calculateRatio(previousMonthlyAirportDelayData, monthlyTotalCarrierCount), key, year, month);

            appendDelayData(weatherDelayDataForTimeSeries, calculateRatio(previousMonthlyWeatherDelayData, monthlyTotalCarrierCount), key, year, month);

            appendDelayData(securityDelayDataForTimeSeries, calculateRatio(previousMonthlySecurityDelayData, monthlyTotalCarrierCount), key, year, month);

            appendDelayData(lateAircraftDelayDataForTimeSeries, calculateRatio(previousMonthlyLateAircraftDelayData, monthlyTotalCarrierCount), key, year, month);

            appendDelayData(nasDelayDataForTimeSeries, calculateRatio(previousMonthlyNASDelayData, monthlyTotalCarrierCount), key, year, month);

            appendDelayData(carrierDelayDataForTimeSeries, calculateRatio(previousMonthlyCarrierDelayData, monthlyTotalCarrierCount), key, year, month);

            appendDelayData(airportDelayCountForTimeSeries, calculateRatio(previousMonthlyAirportDelayCount, monthlyTotalCarrierCount), key, year, month);

            appendDelayData(weatherDelayCountForTimeSeries, calculateRatio(previousMonthlyWeatherDelayCount, monthlyTotalCarrierCount), key, year, month);

            appendDelayData(securityDelayCountForTimeSeries, calculateRatio(previousMonthlySecurityDelayCount, monthlyTotalCarrierCount), key, year, month);

            appendDelayData(lateAircraftDelayCountForTimeSeries, calculateRatio(previousMonthlyLateAircraftDelayCount, monthlyTotalCarrierCount), key, year, month);

            appendDelayData(nasDelayCountForTimeSeries, calculateRatio(previousMonthlyNASDelayCount, monthlyTotalCarrierCount), key, year, month);

            appendDelayData(carrierDelayCountForTimeSeries, calculateRatio(previousMonthlyCarrierDelayCount, monthlyTotalCarrierCount), key, year, month);

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
        previousMonthlyCarrierDelayData,
        previousMonthlyAirportDelayCount,
        previousMonthlyWeatherDelayCount,
        previousMonthlySecurityDelayCount,
        previousMonthlyLateAircraftDelayCount,
        previousMonthlyNASDelayCount,
        previousMonthlyCarrierDelayCount
    };
}

function appendDelayData(dataForTimeSeries, monthlyDelayData, key, year, month) {
    var delayDataSet = dataForTimeSeries.get(key);
    formatData(delayDataSet, year, month, monthlyDelayData);
    dataForTimeSeries.set(key, delayDataSet);
}

function buildBarChartData(yearWiseData, airlineInformation, startMonth, endMonth) {
    for (var index = startMonth; index <= endMonth; index++) {
        if (yearWiseData.has(index)) {
            var airlinesCount = yearWiseData.get(index).keys().length;
            for (var airlineIndex = 0; airlineIndex < airlinesCount; airlineIndex++) {
                var airlineCode = yearWiseData.get(index).keys()[airlineIndex];
                var delayData = yearWiseData.get(index).values()[airlineIndex];
                if (airlineInformation.has(airlineCode)) {
                    var airlineDelay = airlineInformation.get(airlineCode);
                    var airlineDelayByCount = airlineDelay.get(COUNT);
                    var airlineDelayByMinutes = airlineDelay.get(MINUTES);
                    var airlineDelay = yearWiseData.get(index).get(airlineCode)[0];

                    airlineDelayByCount.set(NAS, airlineDelayByCount.get(NAS) + calculateRatio(Number(airlineDelay.nas_ct), Number(airlineDelay.arr_flights)));
                    airlineDelayByCount.set(SECURITY, airlineDelayByCount.get(SECURITY) + calculateRatio(Number(airlineDelay.security_ct), Number(airlineDelay.arr_flights)));
                    airlineDelayByCount.set(LATE_AIRCRAFT, airlineDelayByCount.get(LATE_AIRCRAFT) + calculateRatio(Number(airlineDelay.late_aircraft_ct), Number(airlineDelay.arr_flights)));
                    airlineDelayByCount.set(WEATHER, airlineDelayByCount.get(WEATHER) + calculateRatio(Number(airlineDelay.weather_ct), Number(airlineDelay.arr_flights)));
                    airlineDelayByCount.set(TOTAL, airlineDelayByCount.get(TOTAL) + calculateRatio(Number(airlineDelay.arr_del15), Number(airlineDelay.arr_flights)));
                    airlineDelayByCount.set(CARRIER, airlineDelayByCount.get(CARRIER) + calculateRatio(Number(airlineDelay.carrier_ct), Number(airlineDelay.arr_flights)));
                    airlineDelayByCount.set(NUMBER_OF_ENTRIES, airlineDelayByCount.get(NUMBER_OF_ENTRIES) + 1);

                    airlineDelayByMinutes.set(NAS, airlineDelayByMinutes.get(NAS) + calculateRatio(Number(airlineDelay.nas_delay), Number(airlineDelay.arr_del15)));
                    airlineDelayByMinutes.set(SECURITY, airlineDelayByMinutes.get(SECURITY) + calculateRatio(Number(airlineDelay.security_delay), Number(airlineDelay.arr_del15)));
                    airlineDelayByMinutes.set(LATE_AIRCRAFT, airlineDelayByMinutes.get(LATE_AIRCRAFT) + calculateRatio(Number(airlineDelay.late_aircraft_delay), Number(airlineDelay.arr_del15)));
                    airlineDelayByMinutes.set(WEATHER, airlineDelayByMinutes.get(WEATHER) + calculateRatio(Number(airlineDelay.weather_delay), Number(airlineDelay.arr_del15)));
                    airlineDelayByMinutes.set(TOTAL, airlineDelayByMinutes.get(TOTAL) + calculateRatio(Number(airlineDelay.arr_delay), Number(airlineDelay.arr_del15)));
                    airlineDelayByMinutes.set(CARRIER, airlineDelayByMinutes.get(CARRIER) + calculateRatio(Number(airlineDelay.carrier_delay), Number(airlineDelay.arr_del15)));
                    airlineDelayByMinutes.set(NUMBER_OF_ENTRIES, airlineDelayByMinutes.get(NUMBER_OF_ENTRIES) + 1);

                } else {
                    var delayInformation = d3.map();
                    loadDataStructureForBarChart(delayInformation);
                    updateMapEntries(delayInformation, delayData);
                    airlineInformation.set(airlineCode, delayInformation);
                }
            }
        }
    }
}


function loadDelayInformationMapWithDefaultValues(map) {
    map.set(TOTAL, 0);
    map.set(SECURITY, 0);
    map.set(WEATHER, 0);
    map.set(NAS, 0);
    map.set(LATE_AIRCRAFT, 0);
    map.set(CARRIER, 0);
    map.set(NUMBER_OF_ENTRIES, 0);
}

function loadDataStructureForBarChart(delayInformation) {
    var delayInformationByCount = d3.map();
    var delayInformationByData = d3.map();

    loadDelayInformationMapWithDefaultValues(delayInformationByCount);
    loadDelayInformationMapWithDefaultValues(delayInformationByData);
    delayInformation.set(COUNT, delayInformationByCount);
    delayInformation.set(MINUTES, delayInformationByData);
}


function clearOldEntriesForClustering() {
    airportDelayDataForClustering = [];
    nasDelayDataForClustering = [];
    lateAircraftDelayDataForClustering = [];
    carrierDelayDataForClustering = [];
    weatherDelayDataForClustering = [];
    securityDelayDataForClustering = [];
    airportDelayCountForClustering = [];
    nasDelayCountForClustering = [];
    lateAircraftDelayCountForClustering = [];
    carrierDelayCountForClustering = [];
    weatherDelayCountForClustering = [];
    securityDelayCountForClustering = [];
}

function calculateRatio(inputOne, inputTwo) {
    inputOne = Number(inputOne);
    inputTwo = Number(inputTwo);

    if (inputOne === 0 || inputTwo === 0)
        return 0;
    return inputOne / inputTwo;
}

function updateMapEntries(delayInformation, delayData) {
    var delayInfo;
    if (delayData === undefined) {
        console.log("no data found!");
    }
    else
        for (var index = 0; index < delayData.length; index++) {
            delayInfo = delayData[index];
            var delayInfoByCount = delayInformation.get(COUNT);
            var delayInfoByTotal = delayInformation.get(MINUTES);

            delayInfoByTotal.set(TOTAL, calculateRatio(Number(delayInfo.arr_delay), Number(delayInfo.arr_del15)));
            delayInfoByTotal.set(NAS, calculateRatio(Number(delayInfo.nas_delay), Number(delayInfo.arr_del15)));
            delayInfoByTotal.set(SECURITY, calculateRatio(Number(delayInfo.security_delay), Number(delayInfo.arr_del15)));
            delayInfoByTotal.set(LATE_AIRCRAFT, calculateRatio(Number(delayInfo.late_aircraft_delay), Number(delayInfo.arr_del15)));
            delayInfoByTotal.set(WEATHER, calculateRatio(Number(delayInfo.weather_delay), Number(delayInfo.arr_del15)));
            delayInfoByTotal.set(CARRIER, calculateRatio(Number(delayInfo.carrier_delay), Number(delayInfo.arr_del15)));
            delayInfoByTotal.set(NUMBER_OF_ENTRIES, 1);

            delayInfoByCount.set(TOTAL, calculateRatio(Number(delayInfo.arr_del15), Number(delayInfo.arr_flights)));
            delayInfoByCount.set(NAS, calculateRatio(Number(delayInfo.nas_ct), Number(delayInfo.arr_flights)));
            delayInfoByCount.set(SECURITY, calculateRatio(Number(delayInfo.security_ct), Number(delayInfo.arr_flights)));
            delayInfoByCount.set(LATE_AIRCRAFT, calculateRatio(Number(delayInfo.late_aircraft_ct), Number(delayInfo.arr_flights)));
            delayInfoByCount.set(WEATHER, calculateRatio(Number(delayInfo.weather_ct), Number(delayInfo.arr_flights)));
            delayInfoByCount.set(CARRIER, calculateRatio(Number(delayInfo.carrier_ct), Number(delayInfo.arr_flights)));
            delayInfoByCount.set(NUMBER_OF_ENTRIES, 1);
        }
}
