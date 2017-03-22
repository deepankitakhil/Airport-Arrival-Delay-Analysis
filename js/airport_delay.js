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
    len=nested_data.length;
    expensesTotalByDay={}
    for(l=0;l<len;l++){
        expensesTotalByDay[nested_data[l].key]=0;
        for(i=0;i<nested_data[l].values.length;i++){  //6

            for(j=0;j<nested_data[l].values[i].values.length;j++){ //12

                for(k=0;k<nested_data[l].values[i].values[j].values.length;k++){

                    expensesTotalByDay[nested_data[l].key]+=Number(nested_data[l].values[i].values[j].values[k].arr_del15);

                }

            }


        }
    }

    /*var expensesTotalByDay = d3.nest()
        .key(function (d) {
            return d.key;
        })
        .rollup(function (d) {
                var c=0;
                for(i=0;i<d.values.length;i++){
                    for(j=0;j<d.values[i].length;j++){
                        for(k=0;k<d.values[i].values.length;k++){
                            c=c+d.values[i].values[j].values[k].arr_delay;
                        }
                    }


                }
                return c;


        })
        .entries(nested_data);*/

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
