define(['vruntime', 'widgets-module', 'text!./timeseries-header.tmpl', 'underscore', 'line-chart', 'css!./chart-header.css'], function (vRuntime, module, headerTemplate, _) {
    'use strict';

    var TimeSeriesChart = vRuntime.widget.BaseDirective.extend({
        replace: true,
        scope: {
            title: '=',
            queries: '=',
            showYAxisUnits: '=',
            plotType: '=',
            subtitle: '=?',
            xAxisLabel: '=?',
            yAxisLabel: '=?',
            maxNumPoints: '=?'
        },
        template: headerTemplate,

        vLink: function (scope, element, attrs) {
            var self = this;
            scope.statusMessage = null;
            this.loadingMessage =  'Loading data from server...';
            this._super(scope, element, attrs);
            this.logger = vRuntime.logger.create('pxTimeseries');

            scope.numPointsDisplayed = {};
            scope.maxNumPoints = scope.maxNumPoints || 10;

            var chartConfig = self.buildConfig(scope);
            scope.chart = new Highcharts.StockChart(chartConfig);

            scope.$watch('queries', function (newData, oldData) {
                self.dataChanged.call(self, scope, newData, oldData);
            }, true);
            // if user changes the text field, we need to change the Date in our model:
            scope.$watch('rangeStartStr', function () {
                scope.rangeStart = new Date(scope.rangeStartStr);
            });
            scope.$watch('rangeEndStr', function () {
                scope.rangeEnd = new Date(scope.rangeEndStr);
            });

            function hasRangeChanged(scope) {
                var extremes = scope.chart.xAxis[0].getExtremes();
                if (self.isValidDate(scope.rangeStartStr, true) && self.isValidDate(scope.rangeEndStr, true)){
                    return extremes.min !== scope.rangeStart.getTime() || extremes.max !== scope.rangeEnd.getTime();
                }
                return false;
            }

            scope.submitHandler = scope.submitHandler || function () {
                if (hasRangeChanged(scope)) {
                    scope.chart.xAxis[0].setExtremes(scope.rangeStart.getTime(), scope.rangeEnd.getTime());
                }
            };

            scope.setMonthsOfRange = function (months) {
                self._setMonthsOfRange(months, scope);
            };
            scope.setRangeToYTD = function () {
                self._setRangeToYTD(scope);
            };

            scope.getRangeClasses = function (s) {
                var isValid = self.isValidDate(s);
                return isValid ? '' : 'invalid-date';
            };

            scope.$on('px-dashboard-event', function(event, name, errorMessage){
                if ('datasource-fetch-error' !== name){
                    return;
                }
                scope.statusMessage = errorMessage;
            });
        },
        getDateStr: function (d) {
            function ensureTwoDigits(s) {
                s = '' + s;
                while (s.length < 2) {
                    s = '0' + s;
                }
                return s;
            }

            if (!d || !d.getHours || isNaN(d.getTime())) {
                return '';
            }
            return (ensureTwoDigits(d.getHours())) + ':' + ensureTwoDigits(d.getMinutes()) +
                ' ' + (d.getMonth() + 1) + '/' + (d.getDate()) + '/' + (d.getFullYear());
        },

        buildConfig: function (scope) {
            var self = this;

            scope.getRenderEl = scope.getRenderEl || function () {
                return $(scope.vElement).find('.time-series-chart').get(0);
            };

            var config = {

                chart: {
                    height: 290,
                    spacingLeft: 40,
                    type: 'line',
                    renderTo: scope.getRenderEl(),
                    zoomType: 'x',
                    events: {
                        redraw: function () {
                            var extremes = this.xAxis[0].getExtremes();
                            scope.rangeStart = new Date(extremes.min);
                            scope.rangeEnd = new Date(extremes.max);
                            scope.rangeStartStr = self.getDateStr(scope.rangeStart);
                            scope.rangeEndStr = self.getDateStr(scope.rangeEnd);
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
                    selected: 0,
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
                    text: scope.title,
                    enabled: false
                },
                subtitle: {
                    text: scope.subtitle
                },
                navigator: {
                    adaptToUpdatedData: false
                },
                xAxis: {
                    type: 'datetime',
                    tickPixelInterval: 150,
                    title: {
                        text: scope.xAxisLabel
                    },
                    events: {
                        afterSetExtremes: function (event) {
                            scope.$emit('px-dashboard-event', 'after-set-extremes', event);
                            scope.statusMessage = self.loadingMessage;
                        }
                    }
                },
                scrollbar: {
                    liveRedraw: false
                },
                yAxis: {
                    title: {
                        text: scope.yAxisLabel,
                        offset: 40
                    },
                    labels: {x: -20},
                    lineWidth: 0
                },
                series: []
            };

            if (scope.showYAxisUnits) {
                config.yAxis.labels.enabled = true;
            }
            else {
                config.yAxis.labels.enabled = false;
            }

            if (scope.plotType === 'points') {
                config.plotOptions.series.lineWidth = 0;
                config.plotOptions.series.marker.enabled = true;
            }

            return config;
        },
        addSeries: function (scope, seriesId, data) {

            var newseries = {
                id: seriesId,
                name: seriesId,
                data: data
            };

            scope.chart.addSeries(newseries);

            // just start scrolling automatically
            scope.numPointsDisplayed[seriesId] = Number.MAX_SAFE_INTEGER;
        },
        dataTransform: function (newData) {
            var highchartSeries = [];
            var self = this;
            if (newData && newData.constructor === Array) {
                //series
                newData.forEach(function (query) {
                    if (query.results && query.results.constructor === Array) {
                        query.results.forEach(function (result) {
                            //validate result format
                            if (result.name && result.values && result.values.constructor === Array) {
                                highchartSeries.push({
                                    name: result.name,
                                    data: result.values
                                });
                            }
                            else {
                                self.logger.warn('Series data is missing name or values property');
                            }
                        });
                    }
                    else {
                        //TODO : add error and angular.emit at the base Directive level
                        self.logger.error('Invalid time series data format');
                    }
                });
            }
            else {
                self.logger.error('Invalid time series data format');
            }

            return highchartSeries;
        },
        /*jshint unused:false */
        dataChanged: function (scope, newData, oldData) {
            
            if (!newData) {
                //First time, angular gives us a empty string
                scope.statusMessage = this.loadingMessage;
                return;
            }

            scope.statusMessage = null;

            var seriesToShow = this.dataTransform(newData);

            var newIds = _.pluck(seriesToShow, 'name');
            var currentIds = _.pluck(scope.chart.series, 'name');
            newIds.push('Navigator'); // HACK: Need 'Navigator' series to exist in the newIds so we do not remove it.

            // Get ids of series that we will be touching
            var idsToUpdate = _.intersection(currentIds, newIds);
            var idsToRemove = _.difference(currentIds, newIds);
            var idsToAdd = _.difference(newIds, currentIds);

            // Update series that already exist
            _.each(idsToUpdate, function (idToUpdate) {
                _.each(seriesToShow, function (series) {
                    if (series.name === idToUpdate) {
                        scope.chart.get(idToUpdate).setData(series.data);
                    }
                });
            });

            // Remove old ones
            _.each(idsToRemove, function (idToRemove) {
                scope.chart.get(idToRemove).remove();
            });

            // Add new series
            var self = this;
            _.each(idsToAdd, function (idToAdd) {
                _.each(seriesToShow, function (series) {
                    if (series.name === idToAdd) {
                        self.addSeries(scope, idToAdd, series.data);
                    }
                });
            });

            scope.chart.reflow();
        },
        _setMonthsOfRange: function (months, scope) {
            var self = this;
            scope.rangeEnd = scope.rangeEnd || new Date();
            scope.rangeStart = new Date(scope.rangeEnd);
            var month = scope.rangeEnd.getMonth() - months;
            scope.rangeStart.setMonth(month);
            scope.rangeStartStr = self.getDateStr(scope.rangeStart);
            scope.submitHandler();
        },
        _setRangeToYTD: function (scope) {
            var self = this;
            scope.rangeEnd = new Date();
            scope.rangeStart = new Date();
            scope.rangeStart.setMonth(0);
            scope.rangeStart.setDate(1);
            scope.rangeStart.setHours(0);
            scope.rangeStart.setMinutes(0);
            scope.rangeStart.setSeconds(0);
            scope.rangeStartStr = self.getDateStr(scope.rangeStart);
            scope.rangeEndStr = self.getDateStr(scope.rangeEnd);
            scope.submitHandler();
        },
        isValidDate: function (s, checkForNull) {
            if (!checkForNull && !s) {
                return true;
            }
            var re = /^[012]?\d:[012345]\d\s+(0?[1-9]|1[012])\/(0?[1-9]|[1-2]\d|3[01])\/[12][90]\d\d$/;
            return re.test(s);
        },
        vDestroy: function (scope) {
            this._super(scope);
            if (scope.chart) {
                scope.chart.destroy();
            }
            scope.vElement.remove();
        }
    });

    module.directive('pxTimeseries', function () {
        return new TimeSeriesChart();
    });

    return TimeSeriesChart;
});
