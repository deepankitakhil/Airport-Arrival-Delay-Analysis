/*
 Source : http://www.highcharts.com/demo/line-time-series
 */
var firstCriteria = 'total_delay';
var secondCriteria = 'by_minutes';

function display_time_Series() {

    var data;
    var meanData;
    if (firstCriteria === 'total_delay' && secondCriteria === 'by_minutes')
        data = airportDelayDataForTimeSeries.get(selected_airport);
    else if (firstCriteria === 'total_delay' && secondCriteria === 'by_count')
        data = airportDelayCountForTimeSeries.get(selected_airport);

    else if (firstCriteria === 'security_delay' && secondCriteria === 'by_minutes')
        data = securityDelayDataForTimeSeries.get(selected_airport);
    else if (firstCriteria === 'security_delay' && secondCriteria === 'by_count')
        data = securityDelayCountForTimeSeries.get(selected_airport);

    else if (firstCriteria === 'nas_delay' && secondCriteria === 'by_minutes')
        data = nasDelayDataForTimeSeries.get(selected_airport);
    else if (firstCriteria === 'nas_delay' && secondCriteria === 'by_count')
        data = nasDelayCountForTimeSeries.get(selected_airport);

    else if (firstCriteria === 'weather_delay' && secondCriteria === 'by_minutes')
        data = weatherDelayDataForTimeSeries.get(selected_airport);
    else if (firstCriteria === 'weather_delay' && secondCriteria === 'by_count')
        data = weatherDelayCountForTimeSeries.get(selected_airport);

    else if (firstCriteria === 'late_aircraft_delay' && secondCriteria === 'by_minutes')
        data = lateAircraftDelayDataForTimeSeries.get(selected_airport);
    else if (firstCriteria === 'late_aircraft_delay' && secondCriteria === 'by_count')
        data = lateAircraftDelayCountForTimeSeries.get(selected_airport);

    else if (firstCriteria === 'carrier_delay' && secondCriteria === 'by_minutes')
        data = carrierDelayDataForTimeSeries.get(selected_airport);
    else if (firstCriteria === 'carrier_delay' && secondCriteria === 'by_count')
        data = carrierDelayCountForTimeSeries.get(selected_airport);

    meanData = meanDelayDataForTimeSeries.get(selected_airport);

    var element = document.getElementById("delay_options");
    var delay_type = element.options[element.selectedIndex].text;
    Highcharts.chart('chart_container', {
        chart: {
            zoomType: 'x',
            resetZoomButton: {
                position: {
                    align: 'right', // by default
                    verticalAlign: 'top', // by default
                    x: -10,
                    y: 10
                },
                relativeTo: 'chart'
            }
        },
        tooltip: {
            xDateFormat: '%b,%Y',
            pointFormat: "Value: {point.y:2f}",
            shared: true
        },
        title: {
            text: 'Airport Arrival Delay at ' + airportNameByAirportID.get(selected_airport)
        },
        exporting: {enabled: false},   // To remove download button
        subtitle: {
            text: document.ontouchstart === undefined ?
                'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
        },
        xAxis: {

            type: 'datetime',
            scrollbar: {
                enabled: true
            }
        },
        yAxis: {
            title: {
                text: 'Average Airport Delay'
            },
            min: 0,
            plotLines: [{
                color: '#10266B',
                width: 2,
                label: {
                    font: 'bold 22 px',
                    text: 'Mean Delay'
                },
                value: meanData
            }],

        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },

        series: [{
            type: 'area',
            name: delay_type,
            data: data
        }]
    });
}