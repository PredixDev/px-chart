
var HighChart = {


    is: 'px-timeseries',

    ready: function() {
        this.statusMessage = null;
        this.loadingMessage = 'Loading data from server...';

        var chartConfig = this.buildConfig();
        this.chart = new Highcharts.StockChart(chartConfig);

        this.doSomething([], this.queries);

    },

    buildConfig: function() {
        var self = this;

        this.getRenderEl = this.getRenderEl || function() {
            return this.$.container
        };

        var config = {
            chart: {
                height: 290,
                spacingLeft: 40,
                type: 'line',
                renderTo: this.getRenderEl(),
                zoomType: 'x',
                events: {
                    redraw: function() {
                        var extremes = this.xAxis[0].getExtremes();
                        self.rangeStart = extremes.min;
                        self.rangeEnd = extremes.max;
                    }
                }
            },
            plotOptions: {
                series: {
                    marker: {}
                },
                line: {
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    }
                }
            },
            rangeSelector: {
                inputEnabled: true,
                inputDateFormat: '%H:%M %m/%d/%Y',
                inputEditDateFormat: '%H:%M %m/%d/%Y',
                inputBoxWidth: 110,
                inputPosition: {x: -300, y: 50}
            },
            legend: {
                align: 'left',
                enabled: true
            },
            title: {
                text: this.title,
                enabled: false
            },
            subtitle: {
                text: this.subtitle
            },
            navigator: {
                adaptToUpdatedData: false
            },
            xAxis: {
                type: 'datetime',
                tickPixelInterval: 150,
                title: {
                    text: this.xAxisLabel
                },
                events: {
                    afterSetExtremes: function(event) {
                        self.fire('after-set-extremes', event);
                        self.statusMessage = self.loadingMessage;
                    }
                }
            },
            scrollbar: {
                liveRedraw: false
            },
            yAxis: {
                title: {
                    text: this.yAxisLabel,
                    offset: 40
                },
                labels: {x: -20},
                lineWidth: 0
            },
            series: []
        };
//
//        if (this.showYAxisUnits) {
//          config.yAxis.labels.enabled = true;
//        }
//        else {
//          config.yAxis.labels.enabled = false;
//        }
//
//        if (this.plotType === 'points') {
//          config.plotOptions.series.lineWidth = 0;
//          config.plotOptions.series.marker.enabled = true;
//        }

        return config;
    },
    queriesChanged: function(oldData, newData) {
        this.doSomething(oldData, newData);
    },

    /**
     * Properties block, expose attribute values to the DOM via 'reflect'
     *
     * @property properties
     * @type Object
     */
    properties: {
        queries: {
            type: Array
        }
    },
    doSomething: function(oldData, newData) {
        if (!newData) {
            //First time, angular gives us a empty string
            this.statusMessage = this.loadingMessage;
            return;
        }

        this.statusMessage = null;

        var seriesToShow = this.dataTransform(newData);

        var newIds = _.pluck(seriesToShow, 'name');
        var currentIds = _.pluck(this.chart.series, 'name');
        newIds.push('Navigator'); // HACK: Need 'Navigator' series to exist in the newIds so we do not remove it.

        // Get ids of series that we will be touching
        var idsToUpdate = _.intersection(currentIds, newIds);
        var idsToRemove = _.difference(currentIds, newIds);
        var idsToAdd = _.difference(newIds, currentIds);

        var self = this;

        // Update series that already exist
        _.each(idsToUpdate, function(idToUpdate) {
            _.each(seriesToShow, function(series) {
                if (series.name === idToUpdate) {
                    self.chart.get(idToUpdate).setData(series.data);
                }
            });
        });

        // Remove old ones
        _.each(idsToRemove, function(idToRemove) {
            self.chart.get(idToRemove).remove();
        });

        // Add new series
        _.each(idsToAdd, function(idToAdd) {
            _.each(seriesToShow, function(series) {
                if (series.name === idToAdd) {
                    self.addSeries(idToAdd, series.data);
                }
            });
        });

        this.chart.reflow();
    },
    addSeries: function(seriesId, data) {

        var newseries = {
            id: seriesId,
            name: seriesId,
            data: data
        };

        this.chart.addSeries(newseries);
    },
    dataTransform: function(newData) {
        var highchartSeries = [];
        var self = this;
        if (newData && newData.constructor === Array) {
            //series
            newData.forEach(function(query) {
                if (query.results && query.results.constructor === Array) {
                    query.results.forEach(function(result) {
                        //validate result format
                        if (result.name && result.values && result.values.constructor === Array) {
                            highchartSeries.push({
                                name: result.name,
                                data: result.values
                            });
                        }
                        else {
                            console.warn('Series data is missing name or values property');
                        }
                    });
                }
                else {
                    //TODO : add error and angular.emit at the base Directive level
                    console.error('Invalid time series data format');
                }
            });
        }
        else {
            console.error('Invalid time series data format');
        }

        return highchartSeries;
    }
};

Polymer(HighChart);
