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
      observer: 'rangeStartObserver'
    },

    /**
     * End time of zoom-ed area shown in the navigator
     *
     * @type {String}
     * @default undefined
     */
    rangeEnd: {
      type: String,
      observer: 'rangeEndObserver'
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
    }
  },

  /**
   * Lifecycle callback to create the Highchart 'chart' object and consume the config / series elements
   */
  ready: function() {
    var chartConfig = this.buildConfig();
    this.chart = new Highcharts.StockChart(chartConfig);

    //find series elements in light dom ("Polymer.dom(this)" vs. "Polymer.dom(this.root)", which would be shadow dom)
    var seriesEls = Polymer.dom(this).querySelectorAll("px-chart-series");

    var _this = this;
    seriesEls.forEach(function (seriesEl) {
      seriesEl.addEventListener("data-changed", function(evt) {
        if (!_this.hasSeries(seriesEl.name)) {
          _this.addSeries(seriesEl.name, evt.detail.value);
          _this.chart.reflow();
        }
        else {
          var allSeries = _this.chart.series.map(function(series) {
            if (series.id === seriesEl.name) {
              series.data = evt.detail.value;
            }
            else {
              return series;
            }
          });
          _this.refreshSeriesDisplay(allSeries);
        }
      });
    })

  },

  /**
   * Sets display string for start range when internal value changes
   */
  rangeStartObserver: function () {
    var m = moment(this.rangeStart);
    this.rangeStartDisplayStr = m.isValid() ? m.format('L') + " " + m.format("hh:ss") : null;
  },

  /**
   * Sets display string for end range when internal value changes
   */
  rangeEndObserver: function () {
    var m = moment(this.rangeEnd);
    this.rangeEndDisplayStr = m.isValid() ? m.format('L') + " " + m.format("hh:ss"): null;
  },

  /**
   * Updates all series on the chart
   *
   * @param {Array} seriesToShow
   */
  refreshSeriesDisplay: function(seriesToShow) {
    var newIds = seriesToShow.map(function(series) {
      return series.name;
    });

    var currentIds = this.chart.series.map(function(series) {
      return series.name;
    });

    newIds.push('Navigator'); // HACK: Need 'Navigator' series to exist in the newIds so we do not remove it.

    // Get ids of series that we will be touching
    var idsToUpdate = currentIds.filter(function(item) {
      return newIds.indexOf(item) > -1;
    });

    var idsToRemove = currentIds.filter(function(item) {
      return newIds.indexOf(item) === -1;
    });

    var idsToAdd = newIds.filter(function(item) {
      return currentIds.indexOf(item) === -1;
    });

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

  /**
   * Adds a series to the chart
   *
   * @param {String} seriesId
   * @param {Array} data
   */
  addSeries: function(seriesId, data) {
    var newseries = {
      id: seriesId,
      name: seriesId,
      data: data
    };

    this.chart.addSeries(newseries);
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
   * @param {Object} evtOrNumMonths Event with a target that has a data-num-months attr or Number of months back from present
   */
  setRangeNumMonthsFromPresent: function (evtOrNumMonths) {
    var numMonths = evtOrNumMonths.target ? evtOrNumMonths.target.getAttribute("data-num-months") : evtOrNumMonths;
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
   * Parses rangeStartDisplayStr and rangeEndDisplayStr and sets actual range based on them
   */
  rangeSetHandler: function () {
    var mStart = moment(this.rangeStartDisplayStr);
    var mEnd = moment(this.rangeEndDisplayStr);
    if (mStart.isValid() && mEnd.isValid()) {
      this.setExtremesIfChanged(mStart.valueOf(), mEnd.valueOf());
    }
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

    var brandkit = {
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

    var defaultChartConfig = {
      chart: {
        margin: [70,20,20,20],
        spacing: [50,20,20,20],
        style: {
          fontFamily: 'inherit',
          fontSize: 'inherit'
        }
      },
      colors: convertMapToValueArray(brandkit.accentPalette),
      credits: {
        enabled: false
      },
      legend: {
        align: 'left',
        itemMarginBottom: 10,
        margin: 0,
        padding: 0,
        symbolPadding: 5,
        symbolWidth: 10,
        verticalAlign: 'top',
        y: -30
      },
      navigation: {
        buttonOptions: {
          enabled: false
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
            align: 'center'
          }
        },
        yAxis: {
          opposite: true,
          tickWidth: 0,
          gridLineWidth: 0,
          labels: {
            x: 15
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
        }
      },
      tooltip: {
        backgroundColor: brandkit.monochromePalette.white,
        borderColor: brandkit.monochromePalette.grayLighter,
        shadow: false,
        style: {
          fontFamily: 'inherit',
          fontSize: 'inherit'
        },
        headerFormat: '<span>{point.key}</span><br/>',
        pointFormat: '<span style="color:{series.color}">{series.name}: {point.y}</span><br/>'
      }
    };

    Highcharts.setOptions(defaultChartConfig);

    var config = {
      chart: {
        events: {
          redraw: function() {
            var extremes = this.xAxis[0].getExtremes();
            self.rangeStart = extremes.min;
            self.rangeEnd = extremes.max;
          }
        },
        height: 400,
        renderTo: this.getRenderEl(),
        zoomType: 'x'
      },
      legend: {
        enabled: true
      },
      navigator: {
        enabled: this.navigatorEnabled,
        adaptToUpdatedData: false
      },
      plotOptions: {
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
      xAxis: {
        title: {
          text: "time"
        },
        events: {
          afterSetExtremes: function(event) {
            self.fire('after-set-extremes', event);
          }
        }
      },
      yAxis: {
        labels: {
        },
        title: {
          text: ""
        }
      }
    };

    config.yAxis.labels.enabled = true;

    return config;
  }

});
