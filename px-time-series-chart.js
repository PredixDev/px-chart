Polymer({

  is: 'px-time-series-chart',

  /**
   * Properties block, expose attribute values to the DOM via 'reflect'
   *
   * @property properties
   * @type Object
   */
  properties: {
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

    //find series elements in light dom ("Polymer.dom(this)" vs. "Polymer.dom(this.root)", which would be shadow dom)
    var seriesEls = Polymer.dom(this).querySelectorAll("px-chart-series");

    var _this = this;
    seriesEls.forEach(function (seriesEl) {
      seriesEl.addEventListener("data-changed", function(evt) {
        _this.updateChartSeries([{name: seriesEl.name, data: evt.detail.value}]);
      });
    })

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
          text: this.xAxisLabel
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
          text: this.yAxisLabel
        }
      }
    };

    if (this.showyaxisunits) {
      config.yAxis.labels.enabled = true;
    }
    else {
      config.yAxis.labels.enabled = false;
    }

    return config;
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
    return isValid ? 'text-input' : 'invalid-date text-input';
  },

  isValidDate: function (s, checkForNull) {
    if (!checkForNull && !s) {
      return true;
    }
    var re = /^[012]?\d:[012345]\d\s+(0?[1-9]|1[012])\/(0?[1-9]|[1-2]\d|3[01])\/[12][90]\d\d$/;
    return re.test(s);
  }
});
