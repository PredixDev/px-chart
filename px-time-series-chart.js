Polymer({

  is: 'px-time-series-chart',

  /**
   * Properties block, expose attribute values to the DOM via 'reflect'
   *
   * @property properties
   * @type Object
   */
  properties: {

    /**
     * Start time of zoom-ed area shown in the navigator
     *
     * @type {String}
     * @default undefined
     */
    rangeStart: {
      type: String,
      observer: 'rangeObserver'
    },

    /**
     * End time of zoom-ed area shown in the navigator
     *
     * @type {String}
     * @default undefined
     */
    rangeEnd: {
      type: String,
      observer: 'rangeObserver'
    },

    /**
     * Whether to show the zoom-able / scroll-able area at the bottom of the chart
     *
     * @type {Boolean}
     * @default true
     */
    navigatorEnabled:{
      type: Boolean,
      value: true
    },

    /**
     * See http://api.highcharts.com/highcharts#chart.backgroundColor
     *
     * @default "transparent"
     */
    backgroundColor: {
      type: String,
      value: "transparent"
    },

    /**
     * See http://api.highcharts.com/highcharts#chart.events
     *
     * @default redraw function()
     */
    events: {
      type: Object,
      value: {
        redraw: function() {
          var extremes = this.xAxis[0].getExtremes();
          self.rangeStart = extremes.min;
          self.rangeEnd = extremes.max;
        }
      }
    },

    /**
     * See http://api.highcharts.com/highcharts#chart.height
     *
     * @default 400
     */
    height: {
      type: Number,
      value: 400
    },

    /**
     * See http://api.highcharts.com/highcharts#chart.margin
     *
     * @default [90,30,30,30]
     */
    margin: {
      type: Array,
      value: [90,30,30,30]
    },

    /**
     * See http://api.highcharts.com/highcharts#chart.plotBorderWidth
     *
     * @default 2
     */
    plotBorderWidth: {
      type: Number,
      value: 2
    },

    /**
     * See http://api.highcharts.com/highcharts#chart.plotBorderWidth
     *
     * @default [0,0,25,0]
     */
    spacing: {
      type: Array,
      value: [0,0,25,0]
    },

    /**
     * See http://api.highcharts.com/highcharts#chart.zoomType
     *
     * @default "x"
     */
    zoomType: {
      type: String,
      value: 'x'
    }
  },

  /**
   * Lifecycle callback to create the Highchart 'chart' object and consume the config / series elements
   */
  ready: function() {
    var chartConfig = this.buildConfig();
    var _this = this;

    this.chart = new Highcharts.StockChart(chartConfig);

    this.chart.yAxis.forEach(function(axis) {
      axis.remove();//since we created the chart without any y-axes, Highcharts created one for us...remove it as our axis config comes next.
    });

    var axisEls = Polymer.dom(this).querySelectorAll("px-chart-yaxis");
    var axisElsProcessed = 0;
    axisEls.forEach(function(axisEl) {
      axisEl.addEventListener("y-axis-ready", function(evt) {
        var axisConfig = evt.target.buildAxisConfig(axisElsProcessed, Highcharts.getOptions().colors);
        _this.chart.addAxis(axisConfig, /*isX*/false, /*redraw*/false);
        axisElsProcessed++;
        if (axisElsProcessed === axisEls.length) {
          _this.addInitialSeries();
        }
          });
      });
  },

  /**
   * Internal callback for Highcharts config ready
   */
  addInitialSeries: function() {
    //find series elements in light dom ("Polymer.dom(this)" vs. "Polymer.dom(this.root)", which would be shadow dom)
    var seriesEls = Polymer.dom(this).querySelectorAll("px-chart-series");
    var _this = this;

    seriesEls.forEach(function (seriesEl) {
      if (seriesEl.data) {
        _this.addOrUpdateSeries(seriesEl.name, seriesEl.data, seriesEl.axisIndex, /*noReflow*/true);
      }
      seriesEl.addEventListener("data-changed", function(evt) {
        _this.addOrUpdateSeries(seriesEl.name, evt.detail.value, seriesEl.axisIndex);
      });
    });
    this.chart.reflow();
  },

  /**
   * Adds or updates a series on the chart
   *
   * @param {String} seriesId
   * @param {Array} data
   * @param {Number} axisIndex Optional. The axis index to which the series should be bound
   * @param {Boolean} noReflow Optional. If true, does not force a chart reflow() after adding or updating the series
   */
  addOrUpdateSeries: function(seriesId, data, axisIndex, noReflow) {
    if (!this.hasSeries(seriesId)) {
      this.addSeries(seriesId, data, axisIndex);
    }
    else {
      this.chart.get(seriesId).setData(data);
    }
    if (!noReflow) {
      this.chart.reflow();
    }
  },

  /**
   * Sets display string for start/end range when internal value changes
   */
  rangeObserver: function () {
    var controlsEl = Polymer.dom(this).querySelector("[data-controls]");
    if (controlsEl && controlsEl.setPathValue) {
      var mStart = moment(this.rangeStart);
      var mEnd = moment(this.rangeEnd);
      controlsEl.setPathValue("rangeStartDisplayStr", mStart.isValid() ? mStart.format('L') + " " + mStart.format("hh:ss") : null);
      controlsEl.setPathValue("rangeEndDisplayStr", mEnd.isValid() ? mEnd.format('L') + " " + mEnd.format("hh:ss") : null);
        }
  },

  /**
   * Adds a series to the chart
   *
   * @param {String} seriesId
   * @param {Array} data
   * @param {Number} yAxisIndex Optional. Defaults to 0.
   */
  addSeries: function(seriesId, data, yAxisIndex) {
    var newseries = {
      id: seriesId,
      name: seriesId,
      data: data,
      yAxis: yAxisIndex
    };

    this.chart.addSeries(newseries);
  },

  /**
   * Removes a series from the chart
   *
   * @param {String} seriesId
   */
  removeSeries: function(seriesId) {
    this.chart.get(seriesId).remove();
  },

  /**
   * Returns true if the chart has a series with the given id
   *
   * @param {String} seriesId
   * @return {Boolean}
   */
  hasSeries: function(seriesId) {
    var hasSeries = false;
    this.chart.series.forEach(function(series) {
      if (series.id === seriesId) {
        hasSeries = true
      }
    });
    return hasSeries;
  },

  /**
   * Returns true of rangeStart / end has changed
   *
   * @param {Number} start Range start time in milliseconds since the epoch
   * @param {Number} end Range end time in milliseconds since the epoch
   * @return {Boolean}
   */
  hasExtremeChanged: function (start, end) {
    var extremes = this.chart.xAxis[0].getExtremes();
    return extremes.min !== start || extremes.max !== end;
  },

  /**
   * Sets the range start / end given number of months back from present
   *
   * @param {Number} numMonths Number of months back from present
   */
  setRangeNumMonthsFromPresent: function (numMonths) {
    var m = moment(this.rangeEnd);
    m.subtract(numMonths, 'months');
    this.rangeStart = m.valueOf();
    this.setExtremesIfChanged(this.rangeStart, this.rangeEnd);
  },

  /**
   * Sets range to current year to date
   */
  setRangeToYTD: function () {
    var m = moment();
    this.rangeEnd = m.valueOf();
    this.rangeStart = m.startOf('year').valueOf();
    this.setExtremesIfChanged(this.rangeStart, this.rangeEnd);
  },

  /**
   * Sets chart extremes to given start and end times
   *
   * @param {Number} startTime Range start time in milliseconds since the epoch
   * @param {Number} endTime Range end time in milliseconds since the epoch
   */
  setExtremesIfChanged: function (startTime, endTime) {
    if (this.hasExtremeChanged(startTime, endTime)) {
      this.rangeStart = startTime;
      this.rangeEnd = endTime;
      this.chart.xAxis[0].setExtremes(this.rangeStart, this.rangeEnd);
    }
    else {
      // always set the visible strings back to a good value
      this.rangeStartObserver();
      this.rangeEndObserver();
    }
  },

  /**
   * Builds up highcharts config object
   */
  buildConfig: function() {
    var self = this;

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

    var PXd = {
      'accentPalette': accentPalette,
      'monochromePalette': monochromePalette
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

    var config = {
      annotationsOptions: {
        enabledButtons: false
      },
      chart: {
        backgroundColor: this.backgroundColor,
        events: this.events,
        height: this.height,
        margin: this.margin,
        plotBorderWidth: this.plotBorderWidth,
        renderTo: this.$.container,
        spacing: this.spacing,
        style: {
          fontFamily: 'inherit',
          fontSize: 'inherit'
        },
        zoomType: this.zoomType
      },
      colors: convertMapToValueArray(PXd.accentPalette),
      credits: {
        enabled: false
      },
      legend: {
        align: 'left',
        enabled: true,
        floating: true,
        itemMarginBottom: 10,
        itemStyle: {
          "fontSize": "inherit",
          "fontWeight": "normal"
        },
        margin: 0,
        padding: 0,
        symbolPadding: 5,
        symbolWidth: 10,
        verticalAlign: 'top'
      },
      navigation: {
        buttonOptions: {
          enabled: false
        }
      },
      navigator: {
        adaptToUpdatedData: false,
        height: 50,
        margin: 15,
        outlineColor: PXd.monochromePalette.gray,
        maskInside: true,
        series: {
          color: 'transparent',
          lineColor: PXd.accentPalette.blue,
          lineWidth: 2
        },
        xAxis: {
          labels: {
            style: {
              fontSize: "0.8rem"
            },
            y: 15
          }
        },
        xAxis: {
          gridLineWidth: 0
          }
      },
      plotOptions: {
        line: {
          lineWidth: 1,
          states: {
            hover: {
              lineWidth: 1
            }
          }
        },
        scatter: {
          marker: {
            enabled: true
      }
          },
        series: {
          marker: {}
        }
      },
      rangeSelector: {
        enabled: false
      },
      series: [],
      scrollbar: {
        enabled: false
      },
      title: {
        text: null
      },
      tooltip: {
        backgroundColor: PXd.monochromePalette.white,
        borderColor: PXd.monochromePalette.grayLighter,
        shadow: false,
        style: {
          fontFamily: 'inherit',
          fontSize: 'inherit'
        },
        headerFormat: '<span>{point.key}</span><br/>',
        pointFormat: '<span style="color:{series.color}">{series.name}: {point.y}</span><br/>'
      },
      xAxis: {
        events: {
          afterSetExtremes: function(event) {
            self.fire('after-set-extremes', event);
          }
      },
        labels: {
          align: "left",
          style: {
            fontSize: '0.8rem'
        },
          x: 3,
          y: 12
        },
        startOnTick: true,
        title: {
          text: null
        }
      }
    };

    return config;
  }
});
