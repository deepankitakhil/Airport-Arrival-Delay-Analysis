function configureCluster(filtered_data) {
    console.log(filtered_data);
    var dataLength = filtered_data.size();
    var input = filtered_data.entries();
    var airportWiseDelayData = {};
    var airportIDIndex, year, month, carrier;
    for (airportIDIndex = 0; airportIDIndex < dataLength; airportIDIndex++) {
        airportWiseDelayData[input[airportIDIndex].key] = 0;
        var yearWiseData = input[airportIDIndex].value.values;
        for (year = 0; year < yearWiseData.length; year++) {
            var monthWiseData = yearWiseData[year].values;
            for (month = 0; month < monthWiseData.length; month++) {
                var multipleFlightEntryData = monthWiseData[month].values;
                for (var flightEntryIndex = 0; flightEntryIndex < multipleFlightEntryData.length; flightEntryIndex++) {
                    airportWiseDelayData[input[airportIDIndex].key] += Number(multipleFlightEntryData[flightEntryIndex].arr_del15);
                }
            }
        }
    }
    console.log(airportWiseDelayData);

}

function calculateDelayByYearMonth(sMonth, sYear, eMonth, eYear) {
    var expensesTotalByMonth = {};
    var dataLength = 0;
    var input = filteredDataByAirportID;

    for (var airportIDIndex = 0; airportIDIndex < dataLength; airportIDIndex++) {
        expensesTotalByMonth[input[airportIDIndex].key] = 0;
        var yearWiseData = input[airportIDIndex].value.values;
        var startYear = sYear, endYear = eYear, startMonth = sMonth, endMonth = eMonth;
        var startYearCalculationDone = false;
        while (startYear < endYear) {
            var monthWiseData = yearWiseData[startYear - 2011].values;
            if (monthWiseData.length < endMonth)
                endMonth = monthWiseData.length;
            if (!startYearCalculationDone) {
                for (var month = startMonth; month <= endMonth; month++) {
                    var multipleFlightEntryData = monthWiseData[month - 1].values;
                    for (var flightEntryIndex = 0; flightEntryIndex < multipleFlightEntryData.length; flightEntryIndex++) {
                        expensesTotalByMonth[input[airportIDIndex].key] += Number(multipleFlightEntryData[flightEntryIndex].arr_del15);
                    }
                }
                startYearCalculationDone = true;
                startYear++;
            }
            else {
                var monthWiseData = yearWiseData[startYear - 2011].values;
                for (month = 0; month < monthWiseData.length; month++) {
                    var multipleFlightEntryData = monthWiseData[month].values;
                    for (flightEntryIndex = 0; flightEntryIndex < multipleFlightEntryData.length; flightEntryIndex++) {
                        expensesTotalByMonth[input[airportIDIndex].key] += Number(multipleFlightEntryData[flightEntryIndex].arr_del15);
                    }
                }
                startYear++;
            }
        }
        if (startYearCalculationDone)
            startMonth = 1;

        if (startYear === endYear) {
            var monthWiseData = yearWiseData[startYear - 2011].values;
            if (monthWiseData.length < endMonth)
                endMonth = monthWiseData.length;
            for (month = startMonth; month <= endMonth; month++) {
                var multipleFlightEntryData = monthWiseData[month - 1].values;
                for (flightEntryIndex = 0; flightEntryIndex < multipleFlightEntryData.length; flightEntryIndex++) {
                    expensesTotalByMonth[input[airportIDIndex].key] += Number(multipleFlightEntryData[flightEntryIndex].arr_del15);
                }
            }
            startYear++;
        }
    }
    console.log(expensesTotalByMonth);
}
