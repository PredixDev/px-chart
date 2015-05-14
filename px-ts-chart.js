Polymer({

  is: 'px-ts-chart',

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
     * @default rgb(255,255,255)
     */
    backgroundColor: {
      type: String,
      value: 'rgb(255,255,255)'
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
          var tsChart = Polymer.dom(this.renderTo).parentNode.parentNode;

          tsChart.debounce(
            'set-extremes', function() {
              this.rangeStart = extremes.min;
              this.rangeEnd = extremes.max;
            }, 250);
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
      value: [96,40,30,40]
    },

    /**
     * See http://api.highcharts.com/highcharts#chart.plotBorderWidth
     *
     * @default 1
     */
    plotBorderWidth: {
      type: Number,
      value: 1
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
    },

    chartState: {
      type: Object,
      value: function(){
        return {};
      },
      notify: true,
      observer: 'chartStateUpdated'
    }
  },

  defaultYAxis: null,

  chartStateUpdated: function(evt){
     if (this.chart && evt.srcElement){
       var currentChartExtremes = this.chart.xAxis[0].getExtremes();
       if (currentChartExtremes.max !== evt.chartZoom.max || currentChartExtremes.min !== evt.chartZoom.min){
         if (evt.srcElement !== this){
           this.chart.xAxis[0].setExtremes(evt.chartZoom.min, evt.chartZoom.max, true);
         }
       }
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
    if (!axisEls || axisEls.length === 0) {
      this.defaultYAxis = document.createElement("px-chart-yaxis");
      this.chart.addAxis(this.defaultYAxis.buildAxisConfig(this.PXd.gray), /*isX*/false, /*redraw*/false);
      this.addInitialSeries();
    }
    else {
      axisEls.forEach(function(axisEl) {
        axisEl.addEventListener("y-axis-ready", function(evt) {
          var axisConfig = evt.target.buildAxisConfig(_this.PXd.gray);
          _this.chart.addAxis(axisConfig, /*isX*/false, /*redraw*/false);
          axisElsProcessed++;
          if (axisElsProcessed === axisEls.length) {
            _this.addInitialSeries();
          }
        });
      });
    }
  },

  listeners: {
    'after-set-extremes': 'firechartStateUpdated'
  },

  firechartStateUpdated: function(evt){
    var extremes = this.chart.xAxis[0].getExtremes();
    var tsChart = Polymer.dom(this).node;
      tsChart.debounce(
        'set-chart-state', function() {
          this.setPathValue('chartState', {chartZoom: extremes, srcElement: this});
      }, 250);
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
        _this.addOrUpdateSeries(seriesEl.name, seriesEl.data, seriesEl.axisIndex, /*noRedraw*/true);
      }
      seriesEl.addEventListener("data-changed", function(evt) {
        _this.addOrUpdateSeries(seriesEl.name, evt.detail.value, seriesEl.axisIndex, /*noRedraw*/false);
        _this.chart.reflow();
      });
    });
    this.chart.reflow();
    this.chart.redraw();
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
   * Adds or updates a series on the chart
   *
   * @param {String} seriesId
   * @param {Array} data
   * @param {Number} yAxisIndex Optional. The axis index to which the series should be bound. Defaults to 0.
   * @param {Boolean} noRedraw Optional. If true, does not force a chart redraw() after adding or updating the series
   */
  addOrUpdateSeries: function(seriesId, data, yAxisIndex, noRedraw) {
    if (!this.hasSeries(seriesId)) {
      if (yAxisIndex && this.chart.yAxis.length <= yAxisIndex) {//if we are adding to an axis that doesn't exist, add default axis
        this.defaultYAxis = this.defaultYAxis || document.createElement("px-chart-yaxis");
        this.defaultYAxis.offset = this.defaultYAxis.offset + 10;
        yAxisIndex = this.chart.yAxis.length;//make sure we are adding the very next axis, no matter what the dev passed.
        this.chart.addAxis(this.defaultYAxis.buildAxisConfig(yAxisIndex, Highcharts.getOptions().colors), /*isX*/false, /*redraw*/false);
      }
      this.chart.addSeries({
        id: seriesId,
        name: seriesId,
        data: data,
        yAxis: yAxisIndex || 1
      }, !noRedraw);
    }
    else {
      this.chart.get(seriesId).setData(data, !noRedraw);
    }

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
    return (this.chart.get(seriesId) != null);
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
      this.rangeObserver();
    }
  },

  PXd: {
      'red'             : 'rgb(227,37,51)',
      'redLight'        : 'rgb(255,92,92)',
      'redDark'         : 'rgb(132,18,37)',
      'redCircle'       : 'rgb(245,204,207)',
      'blue'            : 'rgb(0,92,185)',
      'blueLight'       : 'rgb(54,147,248)',
      'blueDark'        : 'rgb(0,54,110)',
      'blueCircle'      : 'rgb(200,231,251)',
      'green'           : 'rgb(70,173,0)',
      'greenLight'      : 'rgb(117,216,53)',
      'greenDark'       : 'rgb(29,95,17)',
      'greenCircle'     : 'rgb(226,232,152)',
      'purple'          : 'rgb(134,105,255)',
      'purpleLight'     : 'rgb(156,151,255)',
      'purpleDark'      : 'rgb(89,81,148)',
      'purpleCircle'    : 'rgb(222,209,231)',
      'orange'          : 'rgb(255,152,33)',
      'orangeLight'     : 'rgb(255,187,102)',
      'orangeDark'      : 'rgb(229,92,0)',
      'orangeCircle'    : 'rgb(255,227,156)',
      'yellow'          : 'rgb(255,237,69)',
      'yellowLight'     : 'rgb(255,249,141)',
      'yellowDark'      : 'rgb(255,207,69)',
      'trueBlack'       : 'rgb(0,0,0)',
      'black'           : 'rgb(20,20,20)',
      'grayDarkest'     : 'rgb(43,43,43)',
      'grayDarker'      : 'rgb(65,65,65)',
      'grayDark'        : 'rgb(87,87,87)',
      'gray'            : 'rgb(134,134,134)',
      'grayLight'       : 'rgb(188,188,188)',
      'grayLighter'     : 'rgb(212,212,212)',
      'grayCircle'      : 'rgb(220,220,220)',
      'grayLightest'    : 'rgb(233,233,233)',
      'offWhite'        : 'rgb(245,245,245)',
      'white'           : 'rgb(255,255,255)'
    },

  /**
   * Builds up highcharts config object
   */
  buildConfig: function() {
    var self = this;

    var convertMapToValueArray = function(map){
      var valArray = [];
      for(var key in map) {
        if(map.hasOwnProperty(key)) {
          valArray.push(map[key]);
        }
      }
      return valArray;
    };

    Highcharts.setOptions({
       global: {
          colors: convertMapToValueArray(this.PXd),
       }
    });

    var config = {
      annotationsOptions: {
        enabledButtons: false
      },
      chart: {
        events: this.events,
        height: this.height,
        margin: this.margin,
        plotBorderColor: this.PXd.gray,
        plotBorderWidth: this.plotBorderWidth,
        renderTo: this.$.container,
        spacing: this.spacing,
        style: {
          fontFamily: 'inherit',
          fontSize: 'inherit'
        },
        zoomType: this.zoomType
      },
      credits: {
        enabled: false
      },
      legend: {
        align: 'left',
        enabled: true,
        floating: true,
        itemMarginBottom: 10,
        itemStyle: {
          fontSize: 'inherit',
          fontWeight: 'normal'
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
        outlineColor: this.PXd.gray,
        maskFill: 'rgba(200,231,251,0.3)',
        series: {
          color: 'transparent',
          lineColor: this.PXd.blue,
          lineWidth: 2
        },
        xAxis: {
          gridLineWidth: 0,
          labels: {
            style: {
              fontSize: '0.8rem'
            },
            y: 15
          }
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
        backgroundColor: this.PXd.white,
        borderColor: this.PXd.grayLighter,
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
        lineColor: this.PXd.gray,
        showFirstLabel: false,
        showLastLabel: false,
        startOnTick: true,
        title: {
          text: null
        }
      }
    };

    return config;
  }
});
