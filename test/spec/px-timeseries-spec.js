// define([ 'jquery', 'angular-mocks', 'text!freshproj.tmpl.html', 'main'], function ($, angular, myWidgetTmpl, myWidget) {
// 	'use strict';

// 	describe('Given a predixApp.freshproj directive', function () {
// 		var $scope = null, $compile, elm, $httpBackend;
	
// 		beforeEach(module('predixApp'));
	
// 		beforeEach(inject(function ($rootScope, $injector) {
// 			$scope = $rootScope.$new();
// 			$scope.myModel = {
// 				title: 'My Widget',
// 				subtitle: 'My Subtitle'
// 			};

// 			$compile = $injector.get('$compile');
// 			$httpBackend = $injector.get('$httpBackend');
// 			$httpBackend.expectGET('freshproj.tmpl.html').respond(200, myWidgetTmpl);

// 			elm = $('<freshproj title="myModel.title" subtitle="myModel.subtitle"></freshproj>');
// 			$compile(elm)($scope);
// 			$scope.$digest();
// 		}));

// 		it('should have a title with correct value', function () {
// 			expect(elm.find('h3').text()).toContain('My Widget');
// 		});
// 	});
// });

define([ 'angular', 'angular-mocks', 'px-timeseries' ], function(angular, mocks, PxTimeseries) {

    describe('px-timeseries', function () {

        var scope, $compile, $rootScope;

        beforeEach(module('predix.dashboard.widgets'));
        beforeEach(inject(function(_$rootScope_, _$compile_) {
            $rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            $compile = _$compile_;
        }));

        describe('when initialized with only the required parameters and vLink is called', function() {

            var fakeScope = {
                title: 'This is my AWESOME title',
                vElement: {
                    find: function() {},
                    remove: function() {},
                    off: function() {}
                },
                $watch: function() {}
            };

            beforeEach(function() {
                spyOn(fakeScope.vElement, 'find').andReturn({
                    get: function() {
                        return "thethingfromget";
                    }
                });
            });

            describe('the config object', function() {

                var config, pxTimeseries;

                beforeEach(function() {
                    pxTimeseries = new PxTimeseries();
                    config = pxTimeseries.buildConfig(fakeScope);
                });

                it('has chart type spline', function() {
                    expect(config.chart.type).toBe('spline');
                });

                it('has renderTo set correctly', function() {
                    expect(config.chart.renderTo).toBe('thethingfromget');
                });

                it('has title set to scope.title', function() {
                    expect(config.title.text).toBe('This is my AWESOME title');
                });

                it('has subtitle set to undefined', function() {
                    expect(config.subtitle.text).toBe(undefined);
                });

                it('has xAxis type as datetime', function() {
                    expect(config.xAxis.type).toBe('datetime');
                });

                it('has xAxis tickPixelInterval to 150', function() {
                    expect(config.xAxis.tickPixelInterval).toBe(150);
                });

                it('has xAxis title to undefined', function() {
                    expect(config.xAxis.title.text).toBe(undefined);
                });

                it('has yaxis title as undefined', function() {
                    expect(config.yAxis.title.text).toBe(undefined);
                });

                it('has series to empty array', function() {
                    expect(config.series).toEqual([]);
                });

                it('has plotOptions set to default', function() {
                    expect(config.plotOptions.series.marker).toEqual({});
                    expect(config.plotOptions.lineWidth).toEqual(undefined);
                });

                it('has yaxis labels disabled', function() {
                    expect(config.yAxis.labels.enabled).toBe(false);
                });
            });

            it('initializes Highcharts.Chart', function() {
                spyOn(Highcharts, 'Chart').andReturn({
                    reflow: function() {},
                    destroy: function() {}
                });
                var pxTimeseries = new PxTimeseries();
                pxTimeseries.vLink(fakeScope);
                expect(Highcharts.Chart).toHaveBeenCalled();
            });

            it('destroy and chart and removes the element when vDestroy is called', function() {
                spyOn(Highcharts, 'Chart').andReturn({
                    reflow: function() {},
                    destroy: function() {}
                });

                var pxTimeseries = new PxTimeseries();
                pxTimeseries.vLink(fakeScope);

                spyOn(fakeScope.vElement, 'remove');
                spyOn(fakeScope.chart, 'destroy');

                pxTimeseries.vDestroy(fakeScope);

                expect(fakeScope.vElement.remove).toHaveBeenCalled();
                expect(fakeScope.chart.destroy).toHaveBeenCalled();
            });
        });

        describe('when initialized with all the possible parameters', function() {

            describe('the config object', function() {

                var config;
                beforeEach(function() {
                    var fakeScope = {
                        title: 'Yay titles!',
                        subtitle: 'my subtitle',
                        xAxisLabel: 'xxx',
                        yAxisLabel: 'yyy',
                        showYAxisUnits: false,
                        plotType: "points",
                        vElement: {
                            find: function() {}
                        }
                    };
                    spyOn(fakeScope.vElement, 'find').andReturn({
                        get: function() {
                            return "thethingfromget";
                        }
                    });
                    var pxTimeseries = new PxTimeseries();
                    config = pxTimeseries.buildConfig(fakeScope);
                });

                it('has title set to scope.title', function() {
                    expect(config.title.text).toBe('Yay titles!');
                });

                it('has subtitle set to undefined', function() {
                    expect(config.subtitle.text).toBe('my subtitle');
                });

                it('has xAxis title to xxx', function() {
                    expect(config.xAxis.title.text).toBe('xxx');
                });

                it('has yaxis title as yyy', function() {
                    expect(config.yAxis.title.text).toBe('yyy');
                });

                it('has series to empty array', function() {
                    expect(config.series).toEqual([]);
                });

                it('changes the config to show points', function() {
                    expect(config.plotOptions.series.marker.enabled).toBe(true);
                    expect(config.plotOptions.series.lineWidth).toEqual(0);
                });

                it('has yaxis labels disabled', function() {
                    expect(config.yAxis.labels.enabled).toBe(false);
                });
            });

            describe('the config object with different parameters', function() {

                var config;
                beforeEach(function() {
                    var fakeScope = {
                        title: 'Yay titles!',
                        subtitle: 'my subtitle',
                        xAxisLabel: 'xxx',
                        yAxisLabel: 'yyy',
                        showYAxisUnits: true,
                        plotType: "line",
                        vElement: {
                            find: function() {}
                        }
                    };
                    spyOn(fakeScope.vElement, 'find').andReturn({
                        get: function() {
                            return "thethingfromget";
                        }
                    });
                    var pxTimeseries = new PxTimeseries();
                    config = pxTimeseries.buildConfig(fakeScope);
                });

                it('changes the config to show line', function() {
                    expect(config.plotOptions.series.marker).toEqual({});
                    expect(config.plotOptions.series.lineWidth).toBeUndefined();
                });

                it('has yaxis labels enabled', function() {
                    expect(config.yAxis.labels.enabled).toBe(true);
                });
            });
        });

        describe('when missing required parameters', function() {

            var fakeScope = {
                vElement: {
                    find: function() {}
                }
            };

            spyOn(fakeScope.vElement, 'find').andReturn({
                get: function() {
                    return "thethingfromget";
                }
            });

            var pxTimeseries = new PxTimeseries();
            var config = pxTimeseries.buildConfig(fakeScope);

            describe('the config object', function() {

                it('has title set to undefined', function() {
                    expect(config.title.text).toBe(undefined);
                });

                it('has series to empty array', function() {
                    expect(config.series).toEqual([]);
                });
            });
        });

        describe('watches the series', function() {

            var pxTimeseries;

            beforeEach(function() {

                scope.title = 'This is my AWESOME title';
                scope.vElement = {
                    find: function() {}
                };

                spyOn(scope.vElement, 'find').andReturn({
                    get: function() {
                        return "thethingfromget";
                    }
                });

                spyOn(Highcharts, 'Chart').andReturn({
                    get: function() {},
                    reflow: function() {},
                    addSeries: function() {},
                    destroy: function() {}
                });

                pxTimeseries = new PxTimeseries();
                pxTimeseries.vLink(scope);

                spyOn(pxTimeseries, 'dataChanged').andCallThrough();
                spyOn(scope.chart, 'reflow');
                spyOn(scope.chart, 'addSeries').andCallThrough();
                spyOn(pxTimeseries.logger, 'warn').andCallThrough();

                $rootScope.$apply();
            });

            describe('initially', function() {

                it('calls dataChanged with an undefined series once', function() {
                    expect(pxTimeseries.dataChanged).toHaveBeenCalledWith(scope, undefined, undefined);
                    expect(pxTimeseries.dataChanged.calls.length).toBe(1);
                });

                it('does not call scope.chart methods', function() {
                    expect(scope.chart.reflow).not.toHaveBeenCalled();
                    expect(scope.chart.addSeries).not.toHaveBeenCalled();
                });

            });

            describe('with the data we say we support', function() {

                var mySeries = [{
                    "name": "Tokyo",
                    "data": [
                        [
                            25833600000,
                            0
                        ],
                        [
                            27043200000,
                            0.6
                        ],
                        [
                            27734400000,
                            0.7
                        ],
                        [
                            28944000000,
                            0.8
                        ],
                        [
                            29548800000,
                            0.6
                        ],
                        [
                            30153600000,
                            0.6
                        ],
                        [
                            31190400000,
                            0.67
                        ],
                        [
                            31536000000,
                            0.81
                        ]
                    ]
                }, {
                    "name": "New York",
                    "data": [
                        [
                            25833600000,
                            17
                        ],
                        [
                            27043200000,
                            18
                        ],
                        [
                            27734400000,
                            19
                        ],
                        [
                            28944000000,
                            29
                        ],
                        [
                            29548800000,
                            27
                        ],
                        [
                            30153600000,
                            24
                        ],
                        [
                            31190400000,
                            22
                        ],
                        [
                            31536000000,
                            27
                        ]
                    ]
                }];

                beforeEach(function() {
                    scope.series = mySeries;
                    scope.$apply();
                });

                it('calls dataChanged with the updated series from the $watch', function() {
                    expect(pxTimeseries.dataChanged.calls.length).toBe(2);
                    expect(pxTimeseries.dataChanged).toHaveBeenCalledWith(scope, mySeries, undefined);
                });

                it('adds each series', function() {
                    expect(scope.chart.addSeries.calls.length).toBe(2);
                    expect(scope.chart.addSeries.calls[0].args[0]).toEqual({
                        id: 'Tokyo',
                        name: "Tokyo",
                        data: mySeries[0].data
                    });
                    expect(scope.chart.addSeries.calls[1].args[0]).toEqual({
                        id: 'New York',
                        name: "New York",
                        data: mySeries[1].data
                    });
                });

                it('calls reflow', function() {
                    expect(scope.chart.reflow).toHaveBeenCalled();
                });

                describe('when series is updated again', function() {

                    it('adds the points to the series and scrolls', function() {
                        var aSeries = {
                            addPoint: function() {}
                        };
                        spyOn(scope.chart, 'get').andReturn(aSeries);
                        spyOn(aSeries, 'addPoint');
                        scope.series = [{
                            "name": "Tokyo",
                            "data": [[1,2],[2,3]]
                        }, {
                            "name": "New York",
                            "data": [[19,20],[21,22]]
                        }];
                        scope.$apply();
                        expect(aSeries.addPoint.calls.length).toBe(4);
                        expect(aSeries.addPoint.calls[0].args[0]).toEqual([1,2]);
                        expect(aSeries.addPoint.calls[0].args[2]).toEqual(true);
                        expect(aSeries.addPoint.calls[1].args[0]).toEqual([2,3]);
                        expect(aSeries.addPoint.calls[1].args[2]).toEqual(true);
                        expect(aSeries.addPoint.calls[2].args[0]).toEqual([19,20]);
                        expect(aSeries.addPoint.calls[2].args[2]).toEqual(true);
                        expect(aSeries.addPoint.calls[3].args[0]).toEqual([21,22]);
                        expect(aSeries.addPoint.calls[3].args[2]).toEqual(true);
                    });

                });

            });

            describe('when the series is updated with valid data', function() {

                var mySeries = [{
                        "name": "Tokyo",
                        "data": [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
                    }, {
                        "name": "New York",
                        "data": [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
                    }, {
                        "name": "Berlin",
                        "data": [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
                    }, {
                        "name": "London",
                        "data": [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
                    }];

                beforeEach(function() {
                    scope.series = mySeries;
                    scope.$apply();
                });

                it('calls dataChanged with the updated series from the $watch', function() {
                    expect(pxTimeseries.dataChanged.calls.length).toBe(2);
                    expect(pxTimeseries.dataChanged).toHaveBeenCalledWith(scope, mySeries, undefined);
                });

                it('adds each series', function() {
                    expect(scope.chart.addSeries.calls.length).toBe(4);
                    expect(scope.chart.addSeries.calls[0].args[0]).toEqual({
                        id: 'Tokyo',
                        name: "Tokyo",
                        data: mySeries[0].data
                    });
                    expect(scope.chart.addSeries.calls[1].args[0]).toEqual({
                        id: 'New York',
                        name: "New York",
                        data: mySeries[1].data
                    });
                    expect(scope.chart.addSeries.calls[2].args[0]).toEqual({
                        id: 'Berlin',
                        name: "Berlin",
                        data: mySeries[2].data
                    });
                    expect(scope.chart.addSeries.calls[3].args[0]).toEqual({
                        id: 'London',
                        name: "London",
                        data: mySeries[3].data
                    });
                });

                it('calls reflow', function() {
                    expect(scope.chart.reflow).toHaveBeenCalled();
                });

                describe('when series is updated again', function() {

                    it('adds the points to the series and scrolls', function() {
                        var aSeries = {
                            addPoint: function() {}
                        };
                        spyOn(scope.chart, 'get').andReturn(aSeries);
                        spyOn(aSeries, 'addPoint');
                        scope.series = [{
                            "name": "Tokyo",
                            "data": [1, 2, 3]
                        }, {
                            "name": "New York",
                            "data": [17, 18, 19]
                        }, {
                            "name": "Berlin",
                            "data": [-1, -2, -3]
                        }];
                        scope.$apply();
                        expect(aSeries.addPoint.calls.length).toBe(9);
                        expect(aSeries.addPoint.calls[0].args[0]).toEqual(1);
                        expect(aSeries.addPoint.calls[0].args[2]).toEqual(true);
                        expect(aSeries.addPoint.calls[1].args[0]).toEqual(2);
                        expect(aSeries.addPoint.calls[1].args[2]).toEqual(true);
                        expect(aSeries.addPoint.calls[2].args[0]).toEqual(3);
                        expect(aSeries.addPoint.calls[2].args[2]).toEqual(true);
                        expect(aSeries.addPoint.calls[3].args[0]).toEqual(17);
                        expect(aSeries.addPoint.calls[4].args[0]).toEqual(18);
                        expect(aSeries.addPoint.calls[5].args[0]).toEqual(19);
                        expect(aSeries.addPoint.calls[6].args[0]).toEqual(-1);
                        expect(aSeries.addPoint.calls[7].args[0]).toEqual(-2);
                        expect(aSeries.addPoint.calls[8].args[0]).toEqual(-3);
                    });

                });

            });

            describe('when the series is updated with repeating series', function() {

                var mySeries = [{
                    "name": "Tokyo",
                    "data": [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
                }, {
                    "name": "New York",
                    "data": [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
                }, {
                    "name": "Tokyo",
                    "data": [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
                }];

                beforeEach(function() {
                    scope.series = mySeries;
                    scope.$apply();
                });

                it('still calls addSeries with all the series (lets highcharts handles as it will)', function() {
                    expect(scope.chart.addSeries.calls.length).toBe(3);
                    expect(scope.chart.addSeries.calls[0].args[0]).toEqual({
                        id: 'Tokyo',
                        name: "Tokyo",
                        data: mySeries[0].data
                    });
                    expect(scope.chart.addSeries.calls[1].args[0]).toEqual({
                        id: 'New York',
                        name: "New York",
                        data: mySeries[1].data
                    });
                    expect(scope.chart.addSeries.calls[2].args[0]).toEqual({
                        id: 'Tokyo',
                        name: "Tokyo",
                        data: mySeries[2].data
                    });
                });
            });

            describe('when the series is updated with bad data', function() {

                it('writes to logger.warn', function() {
                    scope.series = 'this is not at all right';
                    scope.$apply();
                    expect(pxTimeseries.logger.warn).toHaveBeenCalledWith('Series cannot be added - is it formatted properly?');
                });

                it('writes to logger.warn', function() {
                    scope.series = [1, 2, 3];
                    scope.$apply();
                    expect(pxTimeseries.logger.warn).toHaveBeenCalledWith('Series cannot be added - is it formatted properly?');
                });

                it('writes to logger.warn', function() {
                    scope.series = [{
                        "data": [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
                    }, {
                        "data": [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
                    }];
                    scope.$apply();
                    expect(pxTimeseries.logger.warn).toHaveBeenCalledWith('Series cannot be added - is it formatted properly?');
                });

                it('writes to logger.warn', function() {
                    scope.series = [{
                        "name": "Tokyo",
                        "data": [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
                    }, {
                        "name": "New York"
                    }, {
                        "name": "Tokyo",
                        "data": [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
                    }];
                    scope.$apply();
                    expect(pxTimeseries.logger.warn).toHaveBeenCalledWith('Series cannot be added - is it formatted properly?');
                });
            });

        });

        it('is compiled correctly', function() {
                setFixtures(sandbox({
                    id: 'test-container'
                }));
                $testContainer = $("#test-container");
                var myDirective = $compile('<px-timeseries data-title=\"ok\" data-series=\"\"></px-timeseries>')(scope);
                $rootScope.$apply();
                expect(myDirective.html()).toContain('class=\"highcharts-container\"');
        });

    });
});
