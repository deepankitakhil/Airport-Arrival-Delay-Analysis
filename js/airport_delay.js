var delayDataForClustering = [];
var airportDelayDataForTimeSeries = d3.map();
var weatherDelayDataForTimeSeries = d3.map();

function buildDataForVisualization(dateRange) {
    var startDate = dateRange[0].split(',');
    var endDate = dateRange[1].split(',');
    var airportData;
    delayDataForClustering = [];
    Object.keys(filteredDataByAirportID)
        .sort()
        .forEach(function (airportCode) {
            var key = airportCode.substr(1);
            airportData = filteredDataByAirportID.get(key);
            airportDelayDataForTimeSeries.set(key, []);
            weatherDelayDataForTimeSeries.set(key, []);
            var delayedFlightCount = 0;
            var startMonth = Number(startDate[0].trim());
            var startYear = Number(startDate[1].trim());
            var endMonth = Number(endDate[0].trim());
            var endYear = Number(endDate[1].trim());
            var startYearCalculationDone = false;
            for (var year = startYear; year < endYear; year++) {
                if (airportData.has(year)) {
                    var yearWiseData = airportData.get(year);
                    if (!startYearCalculationDone) {
                        for (var month = startMonth; month <= 12; month++) {
                            var monthlyAirportDelayData = 0;
                            var monthlyWeatherDelayData = 0;
                            if (yearWiseData.has(month)) {
                                var previousMonthlyAirportDelayData = 0;
                                var previousMonthlyWeatherDelayData = 0;
                                var multipleFlightEntryData = yearWiseData.get(month).entries();
                                for (var flightEntryIndex = 0; flightEntryIndex < multipleFlightEntryData.length; flightEntryIndex++) {
                                    for (var carrierIndex = 0; carrierIndex < multipleFlightEntryData[flightEntryIndex].value.length; carrierIndex++) {
                                        delayedFlightCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_del15);
                                        monthlyAirportDelayData += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_del15);
                                        monthlyWeatherDelayData += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_del15);
                                        previousMonthlyAirportDelayData = monthlyAirportDelayData;
                                        previousMonthlyWeatherDelayData = monthlyWeatherDelayData;
                                    }
                                }

                                var airportDelayDataSet = airportDelayDataForTimeSeries.get(key);
                                buildData(airportDelayDataSet, year, month, monthlyAirportDelayData);
                                airportDelayDataForTimeSeries.set(key, airportDelayDataSet);

                                var weatherDelayDataSet = weatherDelayDataForTimeSeries.get(key);
                                buildData(weatherDelayDataSet, year, month, monthlyWeatherDelayData);
                                weatherDelayDataForTimeSeries.set(key, weatherDelayDataSet);

                            } else {
                                var airportDelayDataSet = airportDelayDataForTimeSeries.get(key);
                                buildData(airportDelayDataSet, year, month, previousMonthlyAirportDelayData);
                                airportDelayDataForTimeSeries.set(key, airportDelayDataSet);

                                var weatherDelayDataSet = weatherDelayDataForTimeSeries.get(key);
                                buildData(weatherDelayDataSet, year, month, previousMonthlyWeatherDelayData);
                                weatherDelayDataForTimeSeries.set(key, weatherDelayDataSet);
                            }
                        }
                        startYearCalculationDone = true;
                    }
                    else {
                        var yearWiseData = airportData.get(year);
                        for (month = 1; month <= 12; month++) {
                            var monthlyAirportDelayData = 0;
                            var monthlyWeatherDelayData = 0;
                            if (yearWiseData.has(month)) {
                                var previousMonthlyAirportDelayData = 0;
                                var previousMonthlyWeatherDelayData = 0;
                                var multipleFlightEntryData = yearWiseData.get(month).entries();
                                for (flightEntryIndex = 0; flightEntryIndex < multipleFlightEntryData.length; flightEntryIndex++) {
                                    for (var carrierIndex = 0; carrierIndex < multipleFlightEntryData[flightEntryIndex].value.length; carrierIndex++) {
                                        delayedFlightCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_del15);
                                        monthlyAirportDelayData += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_del15);
                                        monthlyWeatherDelayData += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_del15);
                                        previousMonthlyAirportDelayData = monthlyAirportDelayData;
                                        previousMonthlyWeatherDelayData = monthlyWeatherDelayData;
                                    }
                                }
                                var airportDelayDataSet = airportDelayDataForTimeSeries.get(key);
                                buildData(airportDelayDataSet, year, month, monthlyAirportDelayData);
                                airportDelayDataForTimeSeries.set(key, airportDelayDataSet);

                                var weatherDelayDataSet = weatherDelayDataForTimeSeries.get(key);
                                buildData(weatherDelayDataSet, year, month, monthlyWeatherDelayData);
                                weatherDelayDataForTimeSeries.set(key, weatherDelayDataSet);
                            }
                            else {
                                var airportDelayDataSet = airportDelayDataForTimeSeries.get(key);
                                buildData(airportDelayDataSet, year, month, previousMonthlyAirportDelayData);
                                airportDelayDataForTimeSeries.set(key, airportDelayDataSet);

                                var weatherDelayDataSet = weatherDelayDataForTimeSeries.get(key);
                                buildData(weatherDelayDataSet, year, month, previousMonthlyWeatherDelayData);
                                weatherDelayDataForTimeSeries.set(key, weatherDelayDataSet);
                            }
                        }
                    }
                } else {
                }
            }
            if (startYearCalculationDone)
                startMonth = 1;

            if (year === endYear) {
                if (airportData.has(year)) {
                    var yearWiseData = airportData.get(year);
                    for (month = startMonth; month <= endMonth; month++) {
                        var monthlyAirportDelayData = 0;
                        var monthlyWeatherDelayData = 0;
                        if (yearWiseData.has(month)) {
                            var previousMonthlyAirportDelayData = 0;
                            var previousMonthlyWeatherDelayData = 0;
                            var multipleFlightEntryData = yearWiseData.get(month).entries();
                            for (flightEntryIndex = 0; flightEntryIndex < multipleFlightEntryData.length; flightEntryIndex++) {
                                for (var carrierIndex = 0; carrierIndex < multipleFlightEntryData[flightEntryIndex].value.length; carrierIndex++) {
                                    delayedFlightCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_del15);
                                    monthlyAirportDelayData += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_del15);
                                    monthlyWeatherDelayData += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_del15);
                                    previousMonthlyAirportDelayData = monthlyAirportDelayData;
                                    previousMonthlyWeatherDelayData = monthlyWeatherDelayData;
                                }
                            }
                            var airportDelayDataSet = airportDelayDataForTimeSeries.get(key);
                            buildData(airportDelayDataSet, year, month, monthlyAirportDelayData);
                            airportDelayDataForTimeSeries.set(key, airportDelayDataSet);

                            var weatherDelayDataSet = weatherDelayDataForTimeSeries.get(key);
                            buildData(weatherDelayDataSet, year, month, monthlyWeatherDelayData);
                            weatherDelayDataForTimeSeries.set(key, weatherDelayDataSet);
                        }
                        else {
                            var airportDelayDataSet = airportDelayDataForTimeSeries.get(key);
                            buildData(airportDelayDataSet, year, month, previousMonthlyAirportDelayData);
                            airportDelayDataForTimeSeries.set(key, airportDelayDataSet);

                            var weatherDelayDataSet = weatherDelayDataForTimeSeries.get(key);
                            buildData(weatherDelayDataSet, year, month, previousMonthlyWeatherDelayData);
                            weatherDelayDataForTimeSeries.set(key, weatherDelayDataSet);
                        }
                    }
                }
            }
            delayDataForClustering.push([key, airportNameByID.get(key), delayedFlightCount]);
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
    console.log(weatherDelayDataForTimeSeries);
}

function run() {
    var k = initialize();
    for (var i = 0; i < 50; i++)
        step(k);
    k.updateClusterInformation();
}

function initialize() {
    var num_clusters = 15;
    var k = new KMeansClusterAlgorithm(num_clusters, delayDataForClustering);
    return k;
}

function step(k) {
    k.recalculate_centroids();
    k.update_clusters();
}
