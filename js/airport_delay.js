var delayDataForClustering = [];
var delayDataForTrend = d3.map();
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
            delayDataForTrend.set(key, []);
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
                            var monthlyDelayedFlightCount = 0;
                            if (yearWiseData.has(month)) {
                                var previousMonthlySum = 0;
                                var multipleFlightEntryData = yearWiseData.get(month).entries();
                                for (var flightEntryIndex = 0; flightEntryIndex < multipleFlightEntryData.length; flightEntryIndex++) {
                                    for (var carrierIndex = 0; carrierIndex < multipleFlightEntryData[flightEntryIndex].value.length; carrierIndex++) {
                                        delayedFlightCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_del15);
                                        monthlyDelayedFlightCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_del15);
                                        previousMonthlySum = monthlyDelayedFlightCount;
                                    }
                                }
                                var dataSet = delayDataForTrend.get(key);
                                buildData(dataSet, year, month, monthlyDelayedFlightCount);
                                delayDataForTrend.set(key, dataSet);
                            } else {
                                var dataSet = delayDataForTrend.get(key);
                                buildData(dataSet, year, month, previousMonthlySum);
                                delayDataForTrend.set(key, dataSet);
                            }
                        }
                        startYearCalculationDone = true;
                    }
                    else {
                        var yearWiseData = airportData.get(year);
                        for (month = 1; month <= 12; month++) {
                            var monthlyDelayedFlightCount = 0;
                            if (yearWiseData.has(month)) {
                                var previousMonthlySum = 0;
                                var multipleFlightEntryData = yearWiseData.get(month).entries();
                                for (flightEntryIndex = 0; flightEntryIndex < multipleFlightEntryData.length; flightEntryIndex++) {
                                    for (var carrierIndex = 0; carrierIndex < multipleFlightEntryData[flightEntryIndex].value.length; carrierIndex++) {
                                        delayedFlightCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_del15);
                                        monthlyDelayedFlightCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_del15);
                                        previousMonthlySum = monthlyDelayedFlightCount;
                                    }
                                }
                                var dataSet = delayDataForTrend.get(key);
                                buildData(dataSet, year, month, monthlyDelayedFlightCount);
                                delayDataForTrend.set(key, dataSet);
                            }
                            else {
                                var dataSet = delayDataForTrend.get(key);
                                buildData(dataSet, year, month, previousMonthlySum);
                                delayDataForTrend.set(key, dataSet);
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
                        var monthlyDelayedFlightCount = 0;
                        if (yearWiseData.has(month)) {
                            var previousMonthlySum = 0;
                            var multipleFlightEntryData = yearWiseData.get(month).entries();
                            for (flightEntryIndex = 0; flightEntryIndex < multipleFlightEntryData.length; flightEntryIndex++) {
                                for (var carrierIndex = 0; carrierIndex < multipleFlightEntryData[flightEntryIndex].value.length; carrierIndex++) {
                                    delayedFlightCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_del15);
                                    monthlyDelayedFlightCount += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_del15);
                                    previousMonthlySum = monthlyDelayedFlightCount;
                                }
                            }
                            var dataSet = delayDataForTrend.get(key);
                            buildData(dataSet, year, month, monthlyDelayedFlightCount);
                            delayDataForTrend.set(key, dataSet);
                        }
                        else {
                            var dataSet = delayDataForTrend.get(key);
                            buildData(dataSet, year, month, previousMonthlySum);
                            dataSet.push(["year: " + year, "month:" + month, "data:" + previousMonthlySum]);
                            delayDataForTrend.set(key, dataSet);
                        }
                    }
                }
            }
            delayDataForClustering.push([key, delayedFlightCount]);
        });

    kMeansCluster();
    delayTrend();
}

function buildData(dataSet, year, month, monthlyDelayedFlightCount) {
    if (month < 9)
        dataSet.push(["date: " + year + "0" + month, "data:" + monthlyDelayedFlightCount]);
    else
        dataSet.push(["date: " + year + "" + month, "data:" + monthlyDelayedFlightCount]);
}

function kMeansCluster() {
    run();
}

function delayTrend() {
    console.log(delayDataForTrend);
}

function run() {
    var k = initialize();
    for (var i = 0; i < 50; i++)
        step(k);
    k.updateClusterInformation();
}

function initialize() {
    var num_clusters = 10;
    var k = new KMeansClusterAlgorithm(num_clusters, delayDataForClustering);
    return k;
}

function step(k) {
    k.recalculate_centroids();
    k.update_clusters();
}
