define(['vruntime', 'widgets-module', 'line-chart'], function (vRuntime, module) {
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
                maxNumPoints: '=?',
                onXAxisChange: '&'
            },
            template: '<div id="widget-{{$id}}" style="width:100%;margin: 0 auto"><div class="time-series-chart" style="width:100%;margin: 0 auto"></div></div>',
            vLink: function (scope, element, attrs) {
                this._super(scope, element, attrs);

                this.logger = vRuntime.logger.create('pxTimeseries');

                var chartConfig = this.buildConfig(scope);
                scope.maxNumPoints = scope.maxNumPoints || 10;

                var self = this;
                scope.$watch('queries', function (newData, oldData) {
                    self.dataChanged.call(self, scope, newData, oldData);
                }, true);

                scope.chart = new Highcharts.StockChart(chartConfig);
                scope.numPointsDisplayed = {};

                scope.chart.reflow();
            },
            buildConfig: function (scope) {
                var config = {
                    chart: {
                        type: 'spline',
                        renderTo: scope.vElement.find('.time-series-chart').get(0),
                        zoomType: 'x'
                    },
                    plotOptions: {
                        series: {
                            marker: {}
                        }
                    },
                    rangeSelector: {
                        selected: 0,
                        inputEnabled: true,
                        inputDateFormat: '%H:%M %m/%d/%Y',
                        inputEditDateFormat: '%H:%M %m/%d/%Y',
                        inputBoxWidth: 110
                    },
                    legend: {
                        align: 'right',
                        enabled: true
                    },
                    title: {
                        text: scope.title
                    },
                    subtitle: {
                        text: scope.subtitle
                    },
                    xAxis: {
                        type: 'datetime',
                        tickPixelInterval: 150,
                        title: {
                            text: scope.xAxisLabel
                        },
                        events: {
                            afterSetExtremes: function (event) {
                                var chart = $('.time-series-chart').highcharts();
                                chart.showLoading('Loading data from server...');
                                scope.onXAxisChange({event: event}).then(function (data) {
                                    chart.series[0].setData(data);
                                    chart.hideLoading();
                                });
                            }
                        },
                        minRange: 3600 * 1000 // one hour
                    },
                    yAxis: {
                        title: {
                            text: scope.yAxisLabel
                        },
                        labels: {}
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
            addPoint: function (scope, chartSeries, seriesId, point) {
                // usually, 1 point will scroll off the screen when a new one is added
                var isScrolling = true;

                // if there are less points displayed then the max number, then just add the points without scrolling
                if (scope.maxNumPoints > scope.numPointsDisplayed[seriesId]) {
                    isScrolling = false;
                    scope.numPointsDisplayed[seriesId]++;
                }

                chartSeries.addPoint(point, true, isScrolling);
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
                    return;
                }

                var newSeries = this.dataTransform(newData);

                if (newSeries.length !== 0) {

                    var seriesId, chartSeries;

                    for (var index in newSeries) {

                        if (newSeries[index] && newSeries[index].name && newSeries[index].data) {

                            seriesId = newSeries[index].name;

                            if (seriesId !== null) {
                                chartSeries = scope.chart.get(seriesId);
                                if (chartSeries) {
                                    //Add Point to the series
                                    for (var i = 0; i < newSeries[index].data.length; i++) {
                                        this.addPoint(scope, chartSeries, seriesId, newSeries[index].data[i]);
                                    }
                                }
                                else {
                                    this.addSeries(scope, seriesId, newSeries[index].data);
                                }
                            }
                            else {
                                this.logger.warn('seriesId is null');
                            }
                        }
                        else {
                            this.logger.warn('Series data is missing name or data property');
                        }
                    }

                    scope.chart.reflow();
                }

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
})
;