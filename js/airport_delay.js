var delayDataForClustering = d3.map();

function configureCluster(airportID, dateRange) {
    var startDate = dateRange[0].split(',');
    var endDate = dateRange[1].split(',');
    var airportCode;
    var airportData;
    var keys = filteredDataByAirportID.keys();
    var keyLength = keys.length;

    Object.keys(filteredDataByAirportID)
        .sort()
        .forEach(function (airportCode) {
            airportData = filteredDataByAirportID.get(airportCode.substr(1));
            var sum = 0;
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
                            if (yearWiseData.has(month)) {
                                var multipleFlightEntryData = yearWiseData.get(month).entries();
                                for (var flightEntryIndex = 0; flightEntryIndex < multipleFlightEntryData.length; flightEntryIndex++) {
                                    for (var carrierIndex = 0; carrierIndex < multipleFlightEntryData[flightEntryIndex].value.length; carrierIndex++)
                                        sum += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_del15);
                                }
                            } else {

                            }
                        }
                        startYearCalculationDone = true;
                    }
                    else {
                        var yearWiseData = airportData.get(year);
                        for (month = 1; month <= 12; month++) {
                            if (yearWiseData.has(month)) {
                                var multipleFlightEntryData = yearWiseData.get(month).entries();
                                for (flightEntryIndex = 0; flightEntryIndex < multipleFlightEntryData.length; flightEntryIndex++) {
                                    for (var carrierIndex = 0; carrierIndex < multipleFlightEntryData[flightEntryIndex].value.length; carrierIndex++)
                                        sum += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_del15);
                                }
                            }
                            else {

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
                        if (yearWiseData.has(month)) {
                            var multipleFlightEntryData = yearWiseData.get(month).entries();
                            for (flightEntryIndex = 0; flightEntryIndex < multipleFlightEntryData.length; flightEntryIndex++) {
                                for (var carrierIndex = 0; carrierIndex < multipleFlightEntryData[flightEntryIndex].value.length; carrierIndex++)
                                    sum += Number(multipleFlightEntryData[flightEntryIndex].value[carrierIndex].arr_del15);
                            }
                        }
                        else {

                        }
                    }
                }
            }
            delayDataForClustering.set(airportCode, sum);
        });

    kMeansCluster();
}

function kMeansCluster() {
    console.log(delayDataForClustering.entries());
}
