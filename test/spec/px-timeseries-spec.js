define(['angular', 'angular-mocks', 'px-timeseries', 'underscore'], function (angular, mocks, PxTimeseries, _) {
    'use strict';

    describe('px-timeseries', function () {

        var scope, $compile, $rootScope;

        beforeEach(module('demoModule'));
        beforeEach(inject(function (_$rootScope_, _$compile_) {
            $rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            $compile = _$compile_;
        }));

        it('is compiled correctly', function () {
            var myDirective = $compile('<px-timeseries data-title=\'ok\' data-series=\'\'></px-timeseries>')(scope);
            $rootScope.$apply();
            expect(myDirective.html()).toContain('class=\"highcharts-container\"');
        });

        describe('should setup error listener', function(){
            var pxTimeseries;

            beforeEach(function(){
                pxTimeseries = new PxTimeseries();
                spyOn(Highcharts, 'StockChart').andReturn({});
                pxTimeseries.vLink(scope);
            });

            it('should listen to datasource-fetch-error event and show message', function(){
                scope.$broadcast('px-dashboard-event', 'datasource-fetch-error', 'Failed to fetch data from datasource', '', {});
                expect(scope.statusMessage).toBe('Failed to fetch data from datasource');
            });

            it('should not respond to other events', function(){
                scope.$broadcast('px-dashboard-event', 'datasource-another-event', 'Failed to fetch data from datasource', '', {});
                expect(scope.statusMessage).toBe(null);
            });
        });

        describe('getDateStr', function () {
            it('formats date correctly', function () {
                var pxTimeseries = new PxTimeseries();
                var aTime = new Date('1/1/2000');
                aTime.setHours(3);
                aTime.setMinutes(33);
                aTime.setSeconds(0);
                var dateStr = pxTimeseries.getDateStr(aTime);
                expect(dateStr).toBe('03:33 1/1/2000');
            });

            it('returns "invalid date" for undefined arg', function () {
                var pxTimeseries = new PxTimeseries(),
                    dateStr = pxTimeseries.getDateStr(undefined);
                expect(dateStr).toBe('');
            });
        });

        describe('header template support functions', function () {
            var pxTimeseries;
            beforeEach(function () {
                pxTimeseries = new PxTimeseries();
            });
            it('isValidDate returns true for valid date', function () {
                expect(pxTimeseries.isValidDate('3:30 3/3/2013')).toBe(true);
                expect(pxTimeseries.isValidDate('3:30 3/3/2013', true)).toBe(true);
            });
            it('isValidDate returns true for undefined', function () {
                expect(pxTimeseries.isValidDate(undefined)).toBe(true);
            });
            it('isValidDate returns false for undefined if checkForNull arg is true', function () {
                expect(pxTimeseries.isValidDate(undefined, true)).toBe(false);
            });
            it('isValidDate returns false for invalid date', function () {
                expect(pxTimeseries.isValidDate('asdf')).toBe(false);
                expect(pxTimeseries.isValidDate('2:2 4/4/2013')).toBe(false);
                expect(pxTimeseries.isValidDate('2:20 4/4/13')).toBe(false);
            });
            it('setMonthsOfRange correctly sets time range', function () {
                var scope = {
                    rangeEnd: new Date('2/1/2000'),
                    submitHandler: function () {
                    }
                };
                pxTimeseries._setMonthsOfRange(1, scope);
                expect(scope.rangeStart.getTime()).toBe(new Date('1/1/2000').getTime());
            });
            it('_setRangeToYTD sets end time to current time', function () {
                var scope = {
                    submitHandler: function () {
                    }
                };
                pxTimeseries._setRangeToYTD(scope);
                expect(scope.rangeEnd.getTime()).toBe(new Date().getTime());
            });
            it('_setRangeToYTD sets start time to start of year', function () {
                var scope = {
                    submitHandler: function () {
                    }
                };
                var fromTime = new Date();
                fromTime.setMonth(0);
                fromTime.setDate(1);
                fromTime.setHours(0);
                fromTime.setMinutes(0);
                fromTime.setSeconds(0);
                pxTimeseries._setRangeToYTD(scope);
                expect(scope.rangeStart.getTime()).toBe(fromTime.getTime());
            });
        });

        describe('Using Highcharts spy', function () {

            var fakeSeries = {
                setData: function () {
                },
                remove: function () {
                }
            };

            beforeEach(function () {
                spyOn(Highcharts, 'StockChart').andReturn({
                    get: function () {
                        return fakeSeries;
                    },
                    reflow: function () {
                    },
                    addSeries: function () {
                    },
                    destroy: function () {
                    },
                    xAxis: [{setExtremes: function(){}, getExtremes: function(){
                        return {min:0, max:1};
                    }}]
                });
            });

            describe('when initialized with only the required parameters and vLink is called', function () {
                var fakeScope = {
                    title: 'This is my AWESOME title',
                    vElement: {
                        remove: function () {
                        },
                        off: function () {
                        },
                        get: function () {
                        }
                    },
                    $watch: function () {
                    },
                    $emit: function () {
                    },
                    $on: function () {

                    },
                    getRenderEl: function () {
                        return 'fakeRenderElement';
                    },
                    submitHandler: function () {
                    }
                };

                beforeEach(function () {
                    spyOn(fakeScope.vElement, 'get').andReturn('thethingfromget');
                    spyOn(fakeScope, '$emit');
                });

                describe('the config object', function () {

                    var config, pxTimeseries;

                    beforeEach(function () {
                        pxTimeseries = new PxTimeseries();
                        config = pxTimeseries.buildConfig(fakeScope);
                    });

                    it('has chart type line', function () {
                        expect(config.chart.type).toBe('line');
                    });

                    it('has renderTo set correctly', function () {
                        expect(config.chart.renderTo).toBe('fakeRenderElement');
                    });

                    it('has title set to scope.title', function () {
                        expect(config.title.text).toBe('This is my AWESOME title');
                    });

                    it('has subtitle set to undefined', function () {
                        expect(config.subtitle.text).toBe(undefined);
                    });

                    it('has xAxis type as datetime', function () {
                        expect(config.xAxis.type).toBe('datetime');
                    });

                    it('has xAxis tickPixelInterval to 150', function () {
                        expect(config.xAxis.tickPixelInterval).toBe(150);
                    });

                    it('has xAxis title to undefined', function () {
                        expect(config.xAxis.title.text).toBe(undefined);
                    });

                    it('has yaxis title as undefined', function () {
                        expect(config.yAxis.title.text).toBe(undefined);
                    });

                    it('has series to empty array', function () {
                        expect(config.series).toEqual([]);
                    });

                    it('has plotOptions set to default', function () {
                        expect(config.plotOptions.series.marker).toEqual({});
                        expect(config.plotOptions.lineWidth).toEqual(undefined);
                    });

                    it('has yaxis labels disabled', function () {
                        expect(config.yAxis.labels.enabled).toBe(false);
                    });
                    it('has an event handle for exteme changes', function () {
                        expect(typeof config.xAxis.events.afterSetExtremes === 'function').toBeTruthy();
                    });
                });

                describe('if the 3m, 1y, etc. buttons are clicked (a different selection than currently) ', function () {
                    var pxTimeseries, config;
                    beforeEach(function () {
                        pxTimeseries = new PxTimeseries();
                        config = pxTimeseries.buildConfig(fakeScope);
                        pxTimeseries.vLink(fakeScope);
                        spyOn(fakeScope, 'submitHandler').andCallThrough();
                        spyOn(fakeScope.chart.xAxis[0],'setExtremes');
                    });

                    it('setsMonthsOfRange sets month correctly, and calls submit handler and set new extremes', function () {
                        fakeScope.rangeStartStr = '10:27 12/19/2014';
                        fakeScope.rangeEndStr = '10:27 3/19/2015';
                        fakeScope.rangeStart = new Date(1419013620000);
                        fakeScope.rangeEnd = new Date(1426786020000);
                        pxTimeseries._setMonthsOfRange(1, fakeScope);
                        expect(fakeScope.rangeStart.getMonth()).toEqual(fakeScope.rangeEnd.getMonth() - 1);
                        expect(fakeScope.submitHandler).toHaveBeenCalled();
                        expect(fakeScope.chart.xAxis[0].setExtremes).toHaveBeenCalledWith(1424370420000,fakeScope.rangeEnd.getTime());
                    });

                    it('setRangeToYTD sets range correctly, and calls submit handler', function () {
                        pxTimeseries._setRangeToYTD(fakeScope);
                        var now = new Date();
                        expect(fakeScope.rangeStart.getMonth()).toEqual(0);
                        expect(fakeScope.rangeStart.getDate()).toEqual(1);
                        expect(fakeScope.rangeEnd.getMonth()).toEqual(now.getMonth());
                        expect(fakeScope.rangeEnd.getDate()).toEqual(now.getDate());
                        expect(fakeScope.rangeEnd.getYear()).toEqual(now.getYear());
                        expect(fakeScope.submitHandler).toHaveBeenCalled();
                        expect(fakeScope.chart.xAxis[0].setExtremes).toHaveBeenCalled();
                    });
                });

                describe('hasExtremeChanged', function () {
                    var pxTimeseries, config;
                    beforeEach(function () {
                        pxTimeseries = new PxTimeseries();
                        config = pxTimeseries.buildConfig(fakeScope);
                        pxTimeseries.vLink(fakeScope);
                        spyOn(fakeScope, 'submitHandler');
                    });

                    it('if xAxis extreme has not changed, hasExtremeChanged should return false', function () {
                        spyOn(fakeScope.chart.xAxis[0], 'getExtremes').andReturn({min: 1419013620000, max: 1426786020000});
                        fakeScope.rangeStartStr = '10:27 12/19/2014';
                        fakeScope.rangeEndStr = '10:27 3/19/2015';
                        fakeScope.rangeStart = new Date(1419013620000);
                        fakeScope.rangeEnd = new Date(1426786020000);
                        expect(pxTimeseries.hasExtremeChanged(fakeScope)).toBe(false);
                    });

                    it('if xAxis extreme has changed, hasExtremeChanged should return true', function () {
                        spyOn(fakeScope.chart.xAxis[0], 'getExtremes').andReturn({min: 1424370473253, max: 1426786073253});
                        fakeScope.rangeStartStr = '10:27 12/19/2014';
                        fakeScope.rangeEndStr = '10:27 3/19/2014';
                        fakeScope.rangeStart = new Date(1424370473253);
                        fakeScope.rangeEnd = new Date(1426786073250);
                        expect(pxTimeseries.hasExtremeChanged(fakeScope)).toBe(true);
                    });

                    it('if the user does not type in a valid start/end string, hasExtremeChanged should return false', function () {
                        spyOn(fakeScope.chart.xAxis[0], 'getExtremes').andReturn({min: 1424370473253, max: 1426786073253});
                        fakeScope.rangeStartStr = '1asdf0:27 12/19/2014';
                        fakeScope.rangeEndStr = '10:27 3/sdfsdf19/2014';
                        fakeScope.rangeStart = new Date(1424370473253);
                        fakeScope.rangeEnd = new Date(1426786073250);
                        expect(pxTimeseries.hasExtremeChanged(fakeScope)).toBe(false);
                    });
                });

                it('initializes Highcharts.Chart', function () {
                    var pxTimeseries = new PxTimeseries();
                    pxTimeseries.vLink(fakeScope);
                    expect(Highcharts.StockChart).toHaveBeenCalled();
                });

                it('destroy and chart and removes the element when vDestroy is called', function () {
                    var pxTimeseries = new PxTimeseries();
                    pxTimeseries.vLink(fakeScope);

                    spyOn(fakeScope.vElement, 'remove');
                    spyOn(fakeScope.chart, 'destroy');

                    pxTimeseries.vDestroy(fakeScope);

                    expect(fakeScope.vElement.remove).toHaveBeenCalled();
                    expect(fakeScope.chart.destroy).toHaveBeenCalled();
                });

                describe('when the x-axis changes', function () {
                    it('fires px-dashboard-event', function () {
                        var pxTimeseries = new PxTimeseries();
                        var config = pxTimeseries.buildConfig(fakeScope);
                        config.xAxis.events.afterSetExtremes({});
                        expect(fakeScope.$emit).toHaveBeenCalledWith('px-dashboard-event', 'after-set-extremes', jasmine.any(Object));
                    });
                });
            });

            describe('when initialized with all the possible parameters', function () {

                describe('the config object', function () {

                    var config;
                    beforeEach(function () {
                        var fakeScope = {
                            title: 'Yay titles!',
                            subtitle: 'my subtitle',
                            xAxisLabel: 'xxx',
                            yAxisLabel: 'yyy',
                            showYAxisUnits: false,
                            plotType: 'points',
                            vElement: {
                                get: function () {
                                }

                            }
                        };
                        spyOn(fakeScope.vElement, 'get').andReturn('thethingfromget');
                        var pxTimeseries = new PxTimeseries();
                        config = pxTimeseries.buildConfig(fakeScope);
                    });

                    it('has title set to scope.title', function () {
                        expect(config.title.text).toBe('Yay titles!');
                    });

                    it('has subtitle set to undefined', function () {
                        expect(config.subtitle.text).toBe('my subtitle');
                    });

                    it('has xAxis title to xxx', function () {
                        expect(config.xAxis.title.text).toBe('xxx');
                    });

                    it('has yaxis title as yyy', function () {
                        expect(config.yAxis.title.text).toBe('yyy');
                    });

                    it('has series to empty array', function () {
                        expect(config.series).toEqual([]);
                    });

                    it('changes the config to show points', function () {
                        expect(config.plotOptions.series.marker.enabled).toBe(true);
                        expect(config.plotOptions.series.lineWidth).toEqual(0);
                    });

                    it('has yaxis labels disabled', function () {
                        expect(config.yAxis.labels.enabled).toBe(false);
                    });
                });

                describe('the config object with different parameters', function () {

                    var config;
                    beforeEach(function () {
                        var fakeScope = {
                            title: 'Yay titles!',
                            subtitle: 'my subtitle',
                            xAxisLabel: 'xxx',
                            yAxisLabel: 'yyy',
                            showYAxisUnits: true,
                            plotType: 'line',
                            vElement: {
                                get: function () {
                                }
                            }
                        };
                        spyOn(fakeScope.vElement, 'get').andReturn('thethingfromget');
                        var pxTimeseries = new PxTimeseries();
                        config = pxTimeseries.buildConfig(fakeScope);
                    });

                    it('changes the config to show line', function () {
                        expect(config.plotOptions.series.marker).toEqual({});
                        expect(config.plotOptions.series.lineWidth).toBeUndefined();
                    });

                    it('has yaxis labels enabled', function () {
                        expect(config.yAxis.labels.enabled).toBe(true);
                    });
                });
            });

            describe('when missing required parameters', function () {

                var fakeScope = {
                    vElement: {
                        get: function () {
                        }
                    }
                };

                spyOn(fakeScope.vElement, 'get').andReturn('thethingfromget');

                var pxTimeseries = new PxTimeseries();
                var config = pxTimeseries.buildConfig(fakeScope);

                describe('the config object', function () {

                    it('has title set to undefined', function () {
                        expect(config.title.text).toBe(undefined);
                    });

                    it('has series to empty array', function () {
                        expect(config.series).toEqual([]);
                    });
                });
            });

            describe('watches the series', function () {

                var pxTimeseries;

                beforeEach(function () {

                    scope.title = 'This is my AWESOME title';
                    scope.vElement = {
                        get: function () {
                        }
                    };

                    spyOn(scope.vElement, 'get').andReturn('thethingfromget');

                    pxTimeseries = new PxTimeseries();
                    pxTimeseries.vLink(scope);

                    spyOn(pxTimeseries, 'dataChanged').andCallThrough();
                    spyOn(scope.chart, 'reflow');
                    spyOn(scope.chart, 'addSeries').andCallThrough();
                    spyOn(pxTimeseries.logger, 'warn').andCallThrough();
                    spyOn(pxTimeseries.logger, 'error').andCallThrough();

                    $rootScope.$apply();
                });

                describe('initially', function () {

                    it('calls dataChanged with an undefined series once', function () {
                        expect(pxTimeseries.dataChanged).toHaveBeenCalledWith(scope, undefined, undefined);
                        expect(pxTimeseries.dataChanged.calls.length).toBe(1);
                        expect(scope.statusMessage).toBe('Loading data from server...');
                    });

                    it('does not call scope.chart methods', function () {
                        expect(scope.chart.reflow).not.toHaveBeenCalled();
                        expect(scope.chart.addSeries).not.toHaveBeenCalled();
                    });

                });

                describe('with the data we say we support', function () {

                    var mySeries = [
                        {
                            'results': [
                                {
                                    'name': 'Tokyo',
                                    'values': [
                                        [
                                            1424970600000,
                                            0
                                        ],
                                        [
                                            1424970660001,
                                            0
                                        ],
                                        [
                                            1424970720001,
                                            0
                                        ],
                                        [
                                            1424970780000,
                                            0
                                        ]
                                    ]
                                }
                            ]
                        },
                        {
                            'results': [
                                {
                                    'name': 'New York',
                                    'values': [
                                        [
                                            1424970600000,
                                            21
                                        ],
                                        [
                                            1424970660001,
                                            21
                                        ],
                                        [
                                            1424970720001,
                                            21
                                        ],
                                        [
                                            1424970780000,
                                            21
                                        ],
                                        [
                                            1424970840000,
                                            21
                                        ]
                                    ]
                                }
                            ]
                        }
                    ];

                    beforeEach(function () {
                        scope.queries = mySeries;
                        scope.$apply();
                    });

                    it('calls dataChanged with the updated series from the $watch', function () {
                        expect(pxTimeseries.dataChanged.calls.length).toBe(2);
                        expect(pxTimeseries.dataChanged).toHaveBeenCalledWith(scope, mySeries, undefined);
                        expect(scope.statusMessage).toBe(null);
                    });

                    it('adds each series', function () {
                        expect(scope.chart.addSeries.calls.length).toBe(2);
                        expect(scope.chart.addSeries.calls[0].args[0]).toEqual({
                            id: 'Tokyo',
                            name: 'Tokyo',
                            data: mySeries[0].results[0].values
                        });
                        expect(scope.chart.addSeries.calls[1].args[0]).toEqual({
                            id: 'New York',
                            name: 'New York',
                            data: mySeries[1].results[0].values
                        });
                    });

                    it('calls reflow', function () {
                        expect(scope.chart.reflow).toHaveBeenCalled();
                    });
                });

                describe('when the series is updated with valid data', function () {

                    var mySeries = [
                        {
                            results: [
                                {
                                    'name': 'Tokyo',
                                    'values': [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
                                }
                            ]
                        },
                        {
                            results: [
                                {
                                    'name': 'New York',
                                    'values': [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
                                }
                            ]
                        },
                        {
                            results: [
                                {
                                    'name': 'Berlin',
                                    'values': [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
                                }
                            ]
                        },
                        {
                            results: [
                                {
                                    'name': 'London',
                                    'values': [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
                                }
                            ]
                        }
                    ];

                    beforeEach(function () {
                        scope.queries = mySeries;
                        scope.$apply();
                    });

                    it('calls dataChanged with the updated series from the $watch', function () {
                        expect(pxTimeseries.dataChanged.calls.length).toBe(2);
                        expect(pxTimeseries.dataChanged).toHaveBeenCalledWith(scope, mySeries, undefined);
                    });

                    it('adds each series', function () {
                        expect(scope.chart.addSeries.calls.length).toBe(4);
                        expect(scope.chart.addSeries.calls[0].args[0]).toEqual({
                            id: 'Tokyo',
                            name: 'Tokyo',
                            data: mySeries[0].results[0].values
                        });
                        expect(scope.chart.addSeries.calls[1].args[0]).toEqual({
                            id: 'New York',
                            name: 'New York',
                            data: mySeries[1].results[0].values
                        });
                        expect(scope.chart.addSeries.calls[2].args[0]).toEqual({
                            id: 'Berlin',
                            name: 'Berlin',
                            data: mySeries[2].results[0].values
                        });

                        expect(scope.chart.addSeries.calls[3].args[0]).toEqual({
                            id: 'London',
                            name: 'London',
                            data: mySeries[3].results[0].values
                        });
                    });

                    it('calls reflow', function () {
                        expect(scope.chart.reflow).toHaveBeenCalled();
                    });

                    describe('when it is updated again with different data', function () {

                        var myUpdatedSeries = [
                            {
                                results: [
                                    {
                                        'name': 'Tokyo',
                                        'values': [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
                                    }
                                ]
                            },
                            {
                                results: [
                                    {
                                        'name': 'London',
                                        'values': [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
                                    }
                                ]
                            },
                            {
                                results: [
                                    {
                                        'name': 'San Ramon',
                                        'values': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                                    }
                                ]
                            }
                        ];

                        beforeEach(function () {
                            scope.chart.addSeries.isSpy = false; // clear the spy to restart it
                            spyOn(scope.chart, 'addSeries').andCallThrough();
                            spyOn(scope.chart, 'get').andReturn(fakeSeries);
                            spyOn(fakeSeries, 'remove');
                            spyOn(fakeSeries, 'setData');

                            scope.chart.series = _.chain(mySeries).pluck('results').flatten(true).value();
                            scope.chart.series.push({name: 'Navigator'}); // add this because the real chart has this
                            scope.queries = myUpdatedSeries;
                            scope.$apply();
                        });

                        it('adds San Ramon', function () {
                            expect(scope.chart.addSeries.calls.length).toBe(1);
                            expect(scope.chart.addSeries.calls[0].args[0]).toEqual({
                                id: 'San Ramon',
                                name: 'San Ramon',
                                data: myUpdatedSeries[2].results[0].values
                            });
                        });

                        it('updates London and Tokyo', function () {
                            expect(scope.chart.get.calls[0].args[0]).toEqual('Tokyo');
                            expect(scope.chart.get.calls[1].args[0]).toEqual('London');
                            expect(fakeSeries.setData.calls.length).toBe(2);
                            expect(fakeSeries.setData.calls[0].args[0]).toEqual(myUpdatedSeries[0].results[0].values);
                            expect(fakeSeries.setData.calls[1].args[0]).toEqual(myUpdatedSeries[1].results[0].values);
                        });

                        it('deletes New York and Berlin', function () {
                            expect(scope.chart.get.calls[2].args[0]).toEqual('New York');
                            expect(scope.chart.get.calls[3].args[0]).toEqual('Berlin');
                            expect(fakeSeries.remove.calls.length).toBe(2);
                        });

                        it('calls reflow', function () {
                            expect(scope.chart.reflow).toHaveBeenCalled();
                        });

                    });

                });

                describe('when the series is updated with bad data', function () {

                    it('writes to logger.error', function () {
                        scope.queries = 'this is not at all right';
                        scope.$apply();
                        expect(pxTimeseries.logger.error).toHaveBeenCalledWith('Invalid time series data format');
                    });

                    it('writes to logger.error', function () {
                        scope.queries = [1, 2, 3];
                        scope.$apply();
                        expect(pxTimeseries.logger.error).toHaveBeenCalledWith('Invalid time series data format');
                    });

                    it('writes to logger.warn', function () {

                        scope.queries = [
                            {
                                results: [
                                    {
                                        'values': [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
                                    }
                                ]
                            },
                            {
                                results: [
                                    {
                                        'values': [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
                                    }
                                ]
                            }
                        ];


                        scope.$apply();
                        expect(pxTimeseries.logger.warn).toHaveBeenCalledWith('Series data is missing name or values property');
                    });

                    it('writes to logger.warn', function () {
                        scope.queries = [
                            {
                                results: [
                                    {
                                        'name': 'Tokyo',
                                        'values': [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
                                    }
                                ]
                            },
                            {
                                results: [
                                    {
                                        'name': 'New York'
                                    }
                                ]
                            },
                            {
                                results: [
                                    {
                                        'name': 'Tokyo',
                                        'values': [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
                                    }
                                ]
                            }
                        ];

                        scope.$apply();
                        expect(pxTimeseries.logger.warn).toHaveBeenCalledWith('Series data is missing name or values property');
                    });
                });


            });
        });
    });
});
