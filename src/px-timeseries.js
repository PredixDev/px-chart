
define(['vruntime', 'widgets-module', 'text!./timeseries-header.tmpl', 'line-chart', 'css!./chart-header.css'], function (vRuntime, module, headerTemplate) {
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
            this._super(scope, element, attrs);

            this.logger = vRuntime.logger.create('pxTimeseries');

            scope.numPointsDisplayed = {};
            scope.maxNumPoints = scope.maxNumPoints || 10;

            var chartConfig = self.buildConfig(scope);
            scope.chart = new Highcharts.StockChart(chartConfig);

            scope.$watch('queries', function (newData, oldData) {
                self.dataChanged.call(self, scope, newData, oldData);
            }, true);

            scope.submitHandler = function(){
                scope.chart.xAxis[0].setExtremes(scope.rangeStart,scope.rangeEnd);
            };

            scope.setMonthsOfRange = function(months){
                scope.rangeEnd = scope.rangeEnd || new Date();
                scope.rangeStart = new Date(scope.rangeEnd);
                var month = scope.rangeEnd.getMonth() - months;
                scope.rangeStart.setMonth(month);
                scope.rangeStartStr = scope.getDateStr(scope.rangeStart);
            };
            scope.setRangeToYTD = function(){
                scope.rangeEnd = new Date();
                scope.rangeStart = new Date();
                scope.rangeStart.setMonth(0);
                scope.rangeStart.setDate(1);
                scope.rangeStart.setHours(0);
                scope.rangeStart.setMinutes(0);
                scope.rangeStart.setSeconds(0);
                scope.rangeStartStr = scope.getDateStr(scope.rangeStart);
                scope.rangeEndStr = scope.getDateStr(scope.rangeEnd);
            };

            scope.isValidDate = function(s){
                var re = /^[012]?\d:[012345]\d\s+(0?[1-9]|1[012])\/(0?[1-9]|[1-2]\d|3[01])\/[12][90]\d\d$/;
                return re.test(s);
            };
            scope.getRangeClasses = function(s){
                var isValid = scope.isValidDate(s);
                return isValid ? '' : 'invalid-date';
            };
            scope.getDateStr = function(d){
                function ensureTwoDigits(s){
                    s = '' + s;
                    while (s.length < 2) {s = '0' + s;}
                    return s;
                }
                if (!d || !d.getHours) { return 'bad date'; }
                return (ensureTwoDigits(d.getHours())) + ':' + ensureTwoDigits(d.getMinutes()) +
                    ' ' + (d.getMonth()+1) + '/' + (d.getDate()) + '/' + (d.getFullYear());
            };
            scope.rangeEnd = new Date();
            scope.rangeEndStr = scope.getDateStr(scope.rangeEnd);
            scope.setMonthsOfRange(3);
        },
        buildConfig: function (scope) {
            var self = this;

            function getRenderEl(){
                return $(scope.vElement).find('.time-series-chart').get(0);
            }

            var config = {


                chart: {
                    spacingLeft : 40,
                    type: 'spline',
                    renderTo: getRenderEl(), //scope.vElement.get(0),
                    zoomType: 'x',
                    events: {
                        redraw: function () {
                            var extremes = this.xAxis[0].getExtremes();
                            scope.rangeStart = new Date(extremes.min);
                            scope.rangeEnd   = new Date(extremes.max);
                            scope.rangeStartStr = scope.getDateStr(scope.rangeStart);
                            scope.rangeEndStr = scope.getDateStr(scope.rangeEnd);
                        }
                    }


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
                    inputBoxWidth: 110,
                    inputPosition: { x : -300, y : 50 }
                },
                legend: {
                    align: 'left',
                    enabled: true
                },
                title: {
                    text: scope.title,
                    enabled : false
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
                            self.showLoading(scope);
                        }
                    }
                },
                scrollbar: {
                    liveRedraw: false
                },
                yAxis: {
                    title: {
                        text: scope.yAxisLabel
                    },
                    labels: { x : -30 },
                    lineWidth : 0 // TODO
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
            scope.chart.hideLoading();

            if (!newData) {
                //First time, angular gives us a empty string
                this.showLoading(scope);
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
                                scope.chart.series[index].setData(newSeries[index].data);
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

            }
            scope.chart.reflow();
        },
        showLoading: function (scope) {
            scope.chart.showLoading('Loading data from server..');
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
