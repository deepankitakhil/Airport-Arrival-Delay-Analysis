/*
 Source : http://www.highcharts.com/demo/line-time-series
 */
function display_time_Series() {
    var data = delayDataForTrend.get(selected_airport);
    Highcharts.chart('chart_container', {
        chart: {
            zoomType: 'x',
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


        },
        scrollbar: {
            enabled: true
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
                threshold: null,
                scrollbar: {
                    enabled: true
                },
            }
        },

        series: [{
            type: 'area',
            name: 'Airport Delay',
            data: data
        }],
        scrollbar: {
            enabled: true,
            barBackgroundColor: 'gray',
            barBorderRadius: 7,
            barBorderWidth: 0,
            buttonBackgroundColor: 'gray',
            buttonBorderWidth: 0,
            buttonArrowColor: 'yellow',
            buttonBorderRadius: 7,
            rifleColor: 'yellow',
            trackBackgroundColor: 'white',
            trackBorderWidth: 1,
            trackBorderColor: 'silver',
            trackBorderRadius: 7
        }

    });
}