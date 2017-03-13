/*
Idea taken from https://bl.ocks.org/mtaptich/7af7a88b73496dc991b3
 */

class KMeansClusterAlgorithm {
    constructor(number_of_cluster, data) {
        this.number_of_cluster = number_of_cluster;
        this.samples = data;
        this.total_data = data.length;
        this.data = [];
        this.centroids = [];
        this.isStillMoving = 1;

        this.initialize_centroids();
        this.initialize_datapoints();
    }

    initialize_centroids() {
        for (var clusterIndex = 0; clusterIndex < this.number_of_cluster; clusterIndex++) {
            var pos = Math.floor(Math.random() * this.total_data);
            var c = new DelayCentroid(this.samples[pos][1]);
            this.centroids.push(c);
        }
    }

    initialize_datapoints() {

        for (var dataIndex = 0; dataIndex < this.total_data; dataIndex++) {
            var newPoint = new FlightDelayDataPoint(this.samples[dataIndex][0], this.samples[dataIndex][1]);

            if (dataIndex <= this.number_of_cluster) {
                newPoint.set_cluster(dataIndex);
            } else {
                newPoint.set_cluster(NaN);
            }

            this.data.push(newPoint);
        }
    }

    static get_distance(dy, cy) {
        return Math.abs(dy - cy);
    }

    fit(max_count) {
        var max_count = max_count || 100;
        var count = 0;
        while (this.isStillMoving == 1 && count < max_count) {
            this.recalculate_centroids();
            this.update_clusters();
            count += 1;
        }
    }

    recalculate_centroids() {
        this.isStillMoving = 0;
        for (var clusterIndex = 0; clusterIndex < this.number_of_cluster; clusterIndex++) {
            var totalY = 0,
                totalInCluster = 0,
                current_position = [this.centroids[clusterIndex].delay];

            for (var dataIndex = 0; dataIndex < this.data.length; dataIndex++) {
                if (this.data[dataIndex].get_cluster == clusterIndex) {
                    totalY += this.data[dataIndex].get_delay;
                    totalInCluster += 1;
                }
            }

            if (totalInCluster > 0) {
                this.centroids[clusterIndex].set_delay(totalY / totalInCluster);
            }


            if (this.centroids[clusterIndex].delay != current_position[0]) {
                this.isStillMoving = 1;
            }
        }
    }

    update_clusters() {
        for (var index = 0; index < this.total_data; index++) {
            var bestMinimum = 1000000,
                currentCluster = 0;

            for (var j = 0; j < this.number_of_cluster; j++) {
                var distance = KMeansClusterAlgorithm.get_distance(this.data[index].get_delay, this.centroids[j].get_delay);

                if (distance < bestMinimum) {
                    bestMinimum = distance;
                    currentCluster = j;
                }
            }

            this.data[index].set_cluster(currentCluster);
        }
    }

    log() {
        for (var clusterIndex = 0; clusterIndex < this.number_of_cluster; clusterIndex++) {
            console.log("Cluster ", clusterIndex, " includes:");
            for (var dataIndex = 0; dataIndex < this.total_data; dataIndex++) {
                if (this.data[dataIndex].get_cluster == clusterIndex) {
                    console.log("(", this.data[dataIndex].get_airport_id, ", ", this.data[dataIndex].get_delay, ")")
                }
                console.log();
            }
        }
    }
}

class FlightDelayDataPoint {
    constructor(airportID, delay) {
        this.airportID = airportID;
        this.delay = delay;
    }

    set_airport_id(airportID) {
        this.airportID = airportID;
    }

    get get_airport_id() {
        return this.airportID;
    }

    set_delay(delay) {
        this.delay = delay;
    }

    get get_delay() {
        return this.delay;
    }

    set_cluster(clusterNumber) {
        this.clusterNumber = clusterNumber;
    }

    get get_cluster() {
        return this.clusterNumber;
    }
}

class DelayCentroid {
    constructor(delay) {
        this.delay = delay;
    }

    set_delay(delay) {
        this.delay = delay;
    }

    get get_delay() {
        return this.delay;
    }
}
