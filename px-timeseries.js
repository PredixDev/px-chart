Polymer({

    is: 'px-timeseries',

    initialSeries: [],

    /**
     * Properties block, expose attribute values to the DOM via 'reflect'
     *
     * @property properties
     * @type Object
     */
    properties: {
        queries: {
            type: Array,
            notify: true,
            observer: 'queriesChanged'
        },
        rangeStart: {
            type: String,
            observer: 'rangeStartUpdated'
        },
        rangeEnd: {
            type: String,
            observer: 'rangeEndUpdated'
        },
        rangeEndStr: {
            type: String
        },
        computeClass2: {
            type: String,
            computed: 'getRangeClasses(rangeEndStr)'
        },
        computeClass: {
            type: String,
            value: 'invalid-date'
        }
    },

    ready: function() {
        var chartConfig = this.buildConfig();
        this.chart = new Highcharts.StockChart(chartConfig);
    },
    rangeStartUpdated: function () {
        this.rangeStartStr = this.getDateStr(this.rangeStart);
    },
    rangeEndUpdated: function () {
        this.rangeEndStr = this.getDateStr(this.rangeEnd);
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
            series: this.initialSeries
        };

        if (this.showYAxisUnits) {
          config.yAxis.labels.enabled = true;
        }
        else {
          config.yAxis.labels.enabled = false;
        }

        return config;
    },
    queriesChanged: function(newData, oldData) {
        if (!newData) {
            return;
        }

        var seriesToShow = this.dataTransform(newData);

        // if the chart is not initialized yet... don't do any of this, just store series for later
        if(this.chart === undefined) {
            this.initialSeries = seriesToShow;
            return;
        }

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
    },
    hasExtremeChanged: function (rangeStart, rangeEnd) {
        var extremes = this.chart.xAxis[0].getExtremes();
        return extremes.min !== rangeStart || extremes.max !== rangeEnd;
    },
    getDateStr: function (d) {
        function ensureTwoDigits(s) {
            s = '' + s;
            while (s.length < 2) {
                s = '0' + s;
            }
            return s;
        }

        var date = new Date(d);

        if (!date || !date.getHours || isNaN(date.getTime())) {
            return '';
        }
        return (ensureTwoDigits(date.getHours())) + ':' + ensureTwoDigits(date.getMinutes()) +
            ' ' + (date.getMonth() + 1) + '/' + (date.getDate()) + '/' + (date.getFullYear());
    },
    setMonthsOfRange: function (event, detail, sender) {
        var months = parseInt(event.target.getAttribute('data-month'));

        this.rangeEnd = this.rangeEnd || Date.now();

        var temp = new Date(this.rangeEnd);
        var month = temp.getMonth() - months;
        temp.setMonth(month);

        this.rangeStart = temp.getTime();

        this.setExtremesIfChanged(this.rangeStart, this.rangeEnd);
    },
    setRangeToYTD: function () {
        this.rangeEnd = Date.now();

        var tempStartDate = new Date();
        tempStartDate.setMonth(0);
        tempStartDate.setDate(1);
        tempStartDate.setHours(0);
        tempStartDate.setMinutes(0);
        tempStartDate.setSeconds(0);

        this.rangeStart = tempStartDate.getTime();
        this.setExtremesIfChanged(this.rangeStart, this.rangeEnd);
    },
    submitHandler: function () {
        if (this.isValidDate(this.rangeStartStr, true) && this.isValidDate(this.rangeEndStr, true)) {
            var startTime = new Date(this.rangeStartStr).getTime();
            var endTime = new Date(this.rangeEndStr).getTime();
            this.setExtremesIfChanged(startTime, endTime);
        }
    },
    setExtremesIfChanged: function (startTime, endTime) {
        if (this.hasExtremeChanged(startTime, endTime)) {
            this.rangeStart = startTime;
            this.rangeEnd = endTime;
            this.chart.xAxis[0].setExtremes(this.rangeStart, this.rangeEnd);
        }

        // always set the visible strings back to a good value
        this.rangeStartStr = this.getDateStr(this.rangeStart);
        this.rangeEndStr = this.getDateStr(this.rangeEnd);
    },
    getRangeClasses: function (s) {
        var isValid = this.isValidDate(s);
        return isValid ? '' : 'invalid-date';
    },
    isValidDate: function (s, checkForNull) {
        if (!checkForNull && !s) {
            return true;
        }
        var re = /^[012]?\d:[012345]\d\s+(0?[1-9]|1[012])\/(0?[1-9]|[1-2]\d|3[01])\/[12][90]\d\d$/;
        return re.test(s);
    }//,
//            vDestroy: function () {
//                if (this.chart) {
//                    this.chart.destroy();
//                }
////                this.vElement.remove();
//            }

});
