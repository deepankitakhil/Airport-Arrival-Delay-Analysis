/*
 Source : http://www.highcharts.com/demo/line-time-series
 */
function display_time_Series() {
    var data = airportDelayDataForTimeSeries.get(selected_airport);
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
        title: {
            text: 'Airport Arrival Delay over time'
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
                text: 'Airport Delay'
            },
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
            name: 'Airport Delay',
            data: data
        }]
    });
}