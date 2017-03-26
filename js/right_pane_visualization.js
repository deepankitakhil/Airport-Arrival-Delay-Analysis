function right_pane_visualization_init() {
    configureSlider();
    trigger_data_configuration();
    configureCluster(filteredDataByAirportID);
}

function configureSlider() {

    var html5Slider = document.getElementById('slider');
    var dateValues=[];
    function timestamp(str) {
        return new Date(str).getTime();
    }


    var months = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];

    function formatDate(date) {
        return months[date.getMonth()] + ", " + date.getFullYear();
    }

    function toFormat(v) {
        return formatDate(new Date(v));
    }

    noUiSlider.create(html5Slider, {
        format: {to: toFormat, from: Number},
        tooltips: [true, true],
        orientation: "vertical",
        start: [timestamp('2011'), timestamp('2017')],
        connect: true,
        step: 7 * 24 * 60 * 60 * 1000,
        range: {
            min: timestamp('2011-01-01') + 7 * 24 * 60 * 60 * 1000,
            max: timestamp('2016-11-30')

        }
    });
    d3.json('data/float.json', function(data) {
        data = MG.convert.date(data, 'date');

        MG.data_graphic({
            title: "Changing Precision 1",

            data: data,
            decimals: 3,
            width: 600,
            height: 250,
            right: 40,
            xax_count: 4,
            target: '#chart_container'
        });

})
    html5Slider.noUiSlider.on('update', function( values, handle ) {
        dateValues=values;
        console.log(dateValues);
    });


}

