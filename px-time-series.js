Polymer({

    is: 'px-time-series',

    initialSeries: null,

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
        showyaxisunits: {
            type: Boolean
        },
        xAxisLabel: {
            type: String
        },
        yAxisLabel: {
            type: String
        }
    },

    ready: function() {
        var chartConfig = this.buildConfig();
        this.chart = new Highcharts.StockChart(chartConfig);
        if(this.initialSeries) {
            this.updateChartSeries(this.initialSeries);
        }
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

        var monochromePalette = {
            'black': '#141414',
            'grayDarkest': '#2b2b2b',
            'grayDarker': '#414141',
            'grayDark': '#575757',
            'gray': '#868686',
            'grayLight': '#bcbcbc',
            'grayLighter': '#d4d4d4',
            'grayLightest': '#e9e9e9',
            'offwhite': '#f5f5f5',
            'white': '#fff'
        };

        var accentPalette = {
            'cyan': '#005CB9',
            'orange': '#ff9821',
            'green': '#46ad00',
            'purple': '#8669ff',
            'red': '#de2533',
            'yellow': '#ffed45',
            'cyanLight': '#3693f8',
            'orangeLight': '#ffbb66',
            'greenLight': '#75d835',
            'purpleLight': '#9c97ff',
            'redLight': '#ff5c5c',
            'yellowDark': '#ffcf45',
            'cyanDark': '#00366e',
            'orangeDark': '#e55c00',
            'greenDark': '#1d5f11',
            'purpleDark': '#595194',
            'redDark': '#b61225',
            'yellowLight': '#fff98d',
            'blue': '#005bb8',
            'blueLight': '#3693f8',
            'blueDark': '#00366e'
        };

        var typography = {
            'sansFontFamily': '"ge-sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
            'serifFontFamily': '"ge-serif", Georgia, serif',
            'monoFontFamily': 'Inconsolata, Consolas, monospace',
            'brandFontFamily': '"ge-inspira", "Helvetica Neue", Helvetica, Arial, sans-serif',
            'baseFontSize': '14px',
            'baseLineHeight': '20px',
            'textColor': monochromePalette.grayDarker
        };

        var brandkit = {
            'accentPalette': accentPalette,
            'monochromePalette': monochromePalette,
            'typography': typography
        };

        var convertMapToValueArray = function(map){
            var valArray = [];
            for(var key in map) {
                if(map.hasOwnProperty(key)) {
                    valArray.push(map[key]);
                }
            }
            return valArray;
        };

        var defaultChartConfig = {
            colors: convertMapToValueArray(brandkit.accentPalette),
            lang: {
                rangeSelectorZoom: ''
            },
            chart: {
                borderWidth: 0,
                plotBackgroundColor: null,
                backgroundColor: null,
                plotShadow: false,
                plotBorderWidth: 0,
                spacingTop: 0,
                spacingLeft: 0,
                spacingRight: 0,
                spacingBottom: 1,
                borderRadius: 0,
                style: {
                    color: brandkit.typography.textColor,
                    fontFamily: brandkit.typography.sansFontFamily,
                    fontSize: brandkit.typography.baseFontSize
                }
            },
            title: {
                text: ' ', // an empty title makes the spacing correct
                x: 0,
                y: 20,
                align: 'left',
                margin: 40,
                style: {
                    color: brandkit.typography.textColor,
                    fontFamily: brandkit.typography.sansFontFamily,
                    fontWeight: 'bold',
                    fontSize: brandkit.typography.baseFontSize
                }
            },
            subtitle: {
                x: 0,
                y: 37,
                align: 'left',
                style: {
                    color: brandkit.typography.textColor,
                    fontFamily: brandkit.typography.sansFontFamily,
                    fontWeight: 'normal',
                    fontSize: parseInt(brandkit.typography.baseFontSize) - 1 + 'px'
                }
            },
            xAxis: {
                gridLineWidth: 0,
                tickWidth: 0,
                lineWidth: 0,
                offset: 10,
                labels: {
                    style: {
                        color: brandkit.monochromePalette.grayDark,
                        fontFamily: brandkit.typography.sansFontFamily,
                        fontSize: parseInt(brandkit.typography.baseFontSize) - 1 + 'px'
                    }
                },
                title: {
                    margin: 20,
                    style: {
                        color: brandkit.typography.textColor,
                        fontFamily: brandkit.typography.sansFontFamily,
                        fontWeight: 'normal',
                        fontSize: parseInt(brandkit.typography.baseFontSize) - 1 + 'px'
                    }
                }
            },
            yAxis: {
                gridLineWidth: 1,
                gridLineColor: brandkit.monochromePalette.grayLight,
                lineWidth: 0,
                tickWidth: 0,
                offset: 10,
                labels: {
                    align: 'right',
                    style: {
                        color: brandkit.monochromePalette.grayDark,
                        fontFamily: brandkit.typography.sansFontFamily,
                        fontSize: parseInt(brandkit.typography.baseFontSize) - 1 + 'px'
                    }
                },
                title: {
                    margin: 20,
                    style: {
                        color: brandkit.typography.textColor,
                        fontFamily: brandkit.typography.sansFontFamily,
                        fontWeight: 'normal',
                        fontSize: parseInt(brandkit.typography.baseFontSize) - 1 + 'px'
                    }
                }
            },
            legend: {
                borderWidth: 0,
                align: 'right',
                verticalAlign: 'top',
                floating: true,
                y: 3,
                style: {
                    color: brandkit.typography.textColor,
                    fontFamily: brandkit.typography.sansFontFamily,
                    fontWeight: 'normal',
                    fontSize: parseInt(brandkit.typography.baseFontSize) - 1 + 'px'
                }
            },
            labels: {
                style: {
                    color: brandkit.typography.textColor,
                    fontFamily: brandkit.typography.sansFontFamily,
                    fontWeight: 'normal',
                    fontSize: parseInt(brandkit.typography.baseFontSize) - 1 + 'px'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(247, 248, 250, 0.85)',
                borderWidth: 1,
                borderColor: brandkit.monochromePalette.grayLighter,
                borderRadius: 3,
                shadow: false,
                style: {
                    color: brandkit.monochromePalette.grayDarker,
                    fontFamily: brandkit.typography.sansFontFamily,
                    fontWeight: 'normal',
                    fontSize: parseInt(brandkit.typography.baseFontSize) - 1 + 'px',
                    padding: '15px'
                },
                headerFormat: '<span>{point.key}</span><br/>',
                pointFormat: '<span style="color:{series.color}">{series.name}: {point.y}</span><br/>'
            },
            plotOptions: {
                series: {
                    animation: false,
                    marker: {
                        radius: 5
                    },
                    dataLabels: {
                        style: {
                            color: brandkit.typography.textColor,
                            fontFamily: brandkit.typography.sansFontFamily,
                            fontWeight: 'normal',
                            fontSize: parseInt(brandkit.typography.baseFontSize) - 1 + 'px'
                        }
                    },
                    shadow: false
                },
                area: {
                    marker: {
                        enabled: false
                    }
                },
                line: {
                    marker: {
                        enabled: false,
                        lineWidth: 1,
                        lineColor: brandkit.monochromePalette.white
                    },
                    lineWidth: 3
                },
                pie: {
                    allowPointSelect: true,
                    dataLabels: {
                        softConnector: false,
                        connectorColor: brandkit.monochromePalette.grayDarker,
                        formatter: function() {
                            return '<b>'+ this.point.name +'</b>: '+ Highcharts.numberFormat(this.percentage, 2, '.') +'%';
                        }
                    },
                    tooltip: {
                        headerFormat: '<span>{point.key}</span><br/>',
                        pointFormat: '<span style="color:{point.color}">{point.percentage}</span><br/>',
                        percentageDecimals: 2,
                        percentageSuffix: '%'
                    }
                },
                spline: {
                    marker: {
                        enabled: false
                    }
                },
                scatter: {
                    marker: {
                        enabled: true
                    }
                },
                candlestick: {
                }
            },
            navigation: {
                buttonOptions: {
                    backgroundColor: {
                        linearGradient: [0, 0, 0, 20],
                        stops: [
                            [0.4, '#606060'],
                            [0.6, '#333333']
                        ]
                    },
                    borderColor: brandkit.monochromePalette.black,
                    symbolStroke: '#C0C0C0',
                    hoverSymbolStroke: brandkit.monochromePalette.white
                }
            },
            exporting: {
                buttons: {
                    exportButton: {
                        symbolFill: '#55BE3B'
                    },
                    printButton: {
                        symbolFill: '#7797BE'
                    }
                }
            },
            rangeSelector: {
                inputEnabled: false,
                labelStyle: {
                    fontFamily: brandkit.typography.sansFontFamily,
                    color: brandkit.typography.textColor,
                    fontSize: parseInt(brandkit.typography.baseFontSize) - 1 + 'px'
                },
                buttonSpacing: 5,
                buttonTheme: {
                    stroke: 'none',
                    fill: {
                        linearGradient: [0, 19, 0, 20],
                        stops: [
                            [0, brandkit.monochromePalette.white],
                            [1, brandkit.monochromePalette.gray]
                        ]
                    },
                    style: {
                        color: brandkit.typography.textColor,
                        fontFamily: brandkit.typography.sansFontFamily,
                        fontSize: '0.9em' // don't resize to px or the month/year buttons
                                          // on the stock chart will visually break
                    },
                    padding: 2,
                    states: {
                        hover: {
                            stroke: 'none',
                            fill: {
                                linearGradient: [0, 19, 0, 20],
                                stops: [
                                    [0, brandkit.monochromePalette.white],
                                    [1, brandkit.monochromePalette.gray]
                                ]
                            },
                            style: {
                                color: brandkit.typography.textColor,
                                fontFamily: brandkit.typography.sansFontFamily,
                                fontSize: parseInt(brandkit.typography.baseFontSize) - 1 + 'px'
                            }
                        },
                        select: {
                            stroke: 'none',
                            fill: {
                                linearGradient: [0, 17, 0, 18],
                                stops: [
                                    [0, brandkit.monochromePalette.white],
                                    [1, brandkit.accentPalette.blue]
                                ]
                            },
                            style: {
                                color: brandkit.typography.textColor,
                                fontFamily: brandkit.typography.sansFontFamily,
                                fontSize: parseInt(brandkit.typography.baseFontSize) - 1 + 'px'
                            }
                        }
                    }
                }
            },
            navigator: {
                handles: {
                    backgroundColor: brandkit.monochromePalette.white,
                    borderColor: brandkit.monochromePalette.grayDarker
                },
                outlineColor: brandkit.monochromePalette.grayDarker,
                maskFill: 'rgba(255, 255, 255, 0.8)',
                series: {
                    color: 'transparent',
                    lineColor: brandkit.accentPalette.blue,
                    lineWidth: 2
                },
                xAxis: {
                    opposite: true,
                    tickWidth: 0,
                    gridLineWidth: 0,
                    labels: {
                        y: 15,
                        align: 'center',
                        style: {
                            color: brandkit.monochromePalette.gray,
                            fontFamily: brandkit.typography.sansFontFamily,
                            fontSize: '0.6em'
                        }
                    }
                },
                yAxis: {
                    opposite: true,
                    tickWidth: 0,
                    gridLineWidth: 0,
                    labels: {
                        x: 15,
                        style: {
                            color: brandkit.typography.textColor,
                            fontFamily: brandkit.typography.sansFontFamily,
                            fontSize: parseInt(brandkit.typography.baseFontSize) - 1 + 'px'
                        }
                    }
                }
            },
            scrollbar: {
                barBackgroundColor: {
                    linearGradient: [0, 0, 0, 16],
                    stops: [
                        [0, brandkit.monochromePalette.white],
                        [1, brandkit.monochromePalette.grayLighter]
                    ]
                },
                barBorderColor: brandkit.monochromePalette.grayDarker,
                buttonArrowColor: brandkit.monochromePalette.grayDarker,
                buttonBackgroundColor: {
                    linearGradient: [0, 0, 0, 16],
                    stops: [
                        [0, brandkit.monochromePalette.white],
                        [1, brandkit.monochromePalette.grayLighter]
                    ]
                },
                buttonBorderColor: brandkit.monochromePalette.grayDarker,
                rifleColor: brandkit.monochromePalette.grayDarker,
                trackBackgroundColor: brandkit.monochromePalette.grayLighter,
                trackBorderWidth: 0
            },
            credits: {
                enabled: false
            }
        };

        Highcharts.setOptions(defaultChartConfig);

        var config = {
            chart: {
                height: 400,
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
            series: []
        };

        if (this.showyaxisunits) {
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

        this.updateChartSeries(seriesToShow);
    },
    updateChartSeries: function(seriesToShow) {
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
