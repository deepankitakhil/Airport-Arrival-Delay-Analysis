function trigger_data_configuration() {
    queue()
        .defer(d3.csv, './data/airport_delay_data.csv')
        .await(createAirportDelayObjectFromNest);
}

function createAirportDelayObjectFromNest(error, airport_delay_data) {

    if (error) throw  error;
    nested_data = d3.nest()
        .key(function (d) {
            return String(d.airport);
        })
        .key(function (d) {
            return d.year;
        })
        .key(function (d) {
            return d.month;
        })
        .entries(airport_delay_data);
    configureCluster(nested_data);
}

function configureCluster(nested_data) {
    console.log(nested_data);

    var expensesTotalByDay = d3.nest()
        .key(function (d) {
            return d.key;
        })
        .rollup(function (v) {
            return d3.sum(v, function (d) {
                return d.key.arr_delay;
            });
        })
        .entries(nested_data);

    console.log(expensesTotalByDay);

    function initialize() {
        var num_clusters = 3;
        var samples1 = d3.range(0, 40).map(function (d) {
            return ['AIRPORT_ID-' + Math.floor(Math.random() * 50), Math.floor(Math.random() * 50)]
        });
        var k = new KMeansClusterAlgorithm(num_clusters, samples1);
        return k;
    }

    function step(k) {
        k.recalculate_centroids();
        k.update_clusters();
    }

    function run() {
        var k = initialize();
        for (var i = 0; i < 50; i++)
            step(k);
        //k.log();
    }

    run();
}
