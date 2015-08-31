'use strict';
describe('The timeseries chart', function() {

  px.beforeEachWithFixture(function() {
    $fixture.append('<px-ts></px-time-input>');
  });

  describe('1 series with hardcoded data', function() {

    px.beforeEachWithFixture(function() {
      $fixture.append('<px-ts-chart>' +
      '<px-chart-series id="fan-vibration-cruise" data="[[1397102460000, 121.4403],[1397139660000, 123.1913],[1397177400000, 122.8485],[1397228040000, 10.975],[1397248260000, 12.9377]]">' +
      '</px-chart-series>' +
      '</px-ts-chart>');
    });

    describe('', function() {

      var tsChart, series, legendItems;

      beforeEach(function(done) {
        setTimeout(function() {
          tsChart = document.querySelector('px-ts-chart');
          series = tsChart.querySelectorAll('.highcharts-series');
          legendItems = tsChart.querySelectorAll('div.highcharts-legend-item');
          done();
        }, 500)
      });

      it('graphs 1 series + the navigator', function() {
        expect(series.length).toBe(2);
        expect(series[0].querySelector('path').attributes.d.value.length > 75).toBeTruthy(); // line IS drawn (had to look at svg path line... yuck.)
      });

      it('has 1 series in the legend', function() {
        expect(legendItems.length).toBe(1);
        expect(legendItems[0].textContent).toBe('fan-vibration-cruise');
      });

    });

  });

  describe('setting data for series after the chart loaded (like data-binding)', function() {

    px.beforeEachWithFixture(function() {
      $fixture.append('<px-ts-chart>' +
      '<px-chart-series id="my-series">' +
      '</px-chart-series>' +
      '</px-ts-chart>');
    });

    describe('', function() {

      var tsChart, series, legendItems, pxSeries;

      beforeEach(function(done) {
        setTimeout(function() {
          tsChart = document.querySelector('px-ts-chart');
          series = tsChart.querySelectorAll('.highcharts-series');
          pxSeries = tsChart.querySelector('#my-series');
          legendItems = tsChart.querySelectorAll('div.highcharts-legend-item');
          done();
        }, 500)
      });

      it('graphs 0 series', function() {
        expect(series.length).toBe(2); // the actual series + navigator are on the chart
        expect(series[0].querySelector('path').attributes.d.value.length < 50).toBeTruthy(); // but no line is drawn (had to look at svg path line... yuck.)
        expect(series[1].querySelector('path').attributes.d.value.length < 50).toBeTruthy(); // but no line is drawn (had to look at svg path line... yuck.)
      });

      it('has my-series in the legend', function() {
        expect(legendItems.length).toBe(1);
        expect(legendItems[0].textContent).toBe('my-series');
      });

      describe('when add data', function() {

        beforeEach(function(done) {
          pxSeries.data = [[1397102460000, 121.4403], [1397139660000, 123.1913], [1397177400000, 122.8485], [1397228040000, 10.975], [1397248260000, 12.9377]];
          setTimeout(function() {
            legendItems = tsChart.querySelectorAll('div.highcharts-legend-item');
            series = tsChart.querySelectorAll('.highcharts-series');
            done();
          }, 500);
        });

        it('graphs 1 series + navigator', function() {
          expect(series.length).toBe(2); // the actual series + navigator are on the chart
          expect(series[0].querySelector('path').attributes.d.value.length > 75).toBeTruthy(); // a line IS drawn (had to look at svg path line... yuck.)
          expect(series[1].querySelector('path').attributes.d.value.length > 75).toBeTruthy(); // a line IS drawn (had to look at svg path line... yuck.)
        });
      });

    });

  });

  describe('iron ajax support in series', function() {

    describe('1 series', function() {

      px.beforeEachWithFixture(function() {
        $fixture.append('<px-ts-chart>' +
        '<px-chart-series id="delta-egt-cruise">' +
        '<iron-ajax url="/base/demo-data/aviation/delta-egt-cruise.json" handle-as="json"></iron-ajax>' +
        '</px-chart-series>' +
        '</px-ts-chart>');
      });

      describe('', function() {

        var tsChart, series, legendItems;

        beforeEach(function(done) {
          setTimeout(function() {
            tsChart = document.querySelector('px-ts-chart');
            series = tsChart.querySelectorAll('.highcharts-series');
            legendItems = tsChart.querySelectorAll('div.highcharts-legend-item');
            done();
          }, 500)
        });

        it('graphs 1 series + the navigator', function() {
          expect(series.length).toBe(2);
          expect(series[0].querySelector('path').attributes.d.value.length > 75).toBeTruthy(); // line IS drawn (had to look at svg path line... yuck.)
          expect(series[1].querySelector('path').attributes.d.value.length > 75).toBeTruthy(); // line IS drawn (had to look at svg path line... yuck.)
        });

        it('has only fan-vibration-cruise in the legend', function() {
          expect(legendItems.length).toBe(1);
          expect(legendItems[0].textContent).toBe('delta-egt-cruise');
        });

      });

    });

    describe('multiple series', function() {

      px.beforeEachWithFixture(function() {
        $fixture.append('<px-ts-chart>' +
        '<px-chart-series id="fan-vibration-cruise">' +
        '<iron-ajax url="/base/demo-data/aviation/fan-vibration-cruise.json" handle-as="json"></iron-ajax>' +
        '</px-chart-series>' +
        '<px-chart-series id="delta-egt-cruise">' +
        '<iron-ajax url="/base/demo-data/aviation/delta-egt-cruise.json" handle-as="json"></iron-ajax>' +
        '</px-chart-series>' +
        '</px-ts-chart>');
      });

      describe('', function() {

        var tsChart, series, legendItems;

        beforeEach(function(done) {
          setTimeout(function() {
            tsChart = document.querySelector('px-ts-chart');
            series = tsChart.querySelectorAll('.highcharts-series');
            legendItems = tsChart.querySelectorAll('div.highcharts-legend-item');
            done();
          }, 500)
        });

        it('graphs 2 series + the navigator', function() {
          expect(series.length).toBe(3);
          expect(series[0].querySelector('path').attributes.d.value.length > 75).toBeTruthy(); // line IS drawn (had to look at svg path line... yuck.)
          expect(series[1].querySelector('path').attributes.d.value.length > 75).toBeTruthy(); // line IS drawn (had to look at svg path line... yuck.)
          expect(series[2].querySelector('path').attributes.d.value.length > 75).toBeTruthy(); // line IS drawn (had to look at svg path line... yuck.)
        });

        it('has delta-egt-cruise & fan-vibration-cruise in the legend', function() {
          expect(legendItems.length).toBe(2);
          expect(legendItems[0].textContent).toBe('fan-vibration-cruise');
          expect(legendItems[1].textContent).toBe('delta-egt-cruise');
        });

      });

    });

  });

  describe('series-object set late (like data-binding)', function() {

    px.beforeEachWithFixture(function() {
      $fixture.append('<px-ts-chart>' +
      '<px-chart-series id="my-series" series-obj-name-key="myName" series-obj-data-key="myData">' +
      '</px-chart-series>' +
      '</px-ts-chart>');
    });

    describe('', function() {

      var tsChart, series, legendItems, pxSeries;

      beforeEach(function(done) {
        setTimeout(function() {
          tsChart = document.querySelector('px-ts-chart');
          series = tsChart.querySelectorAll('.highcharts-series');
          pxSeries = tsChart.querySelector('#my-series');
          legendItems = tsChart.querySelectorAll('div.highcharts-legend-item');
          done();
        }, 500)
      });

      it('graphs 0 series', function() {
        expect(series.length).toBe(2); // the actual series + navigator are on the chart
        expect(series[0].querySelector('path').attributes.d.value.length < 50).toBeTruthy(); // but no line is drawn (had to look at svg path line... yuck.)
        expect(series[1].querySelector('path').attributes.d.value.length < 50).toBeTruthy(); // but no line is drawn (had to look at svg path line... yuck.)
      });

      it('does have my series in legend in this case', function() {
        expect(legendItems.length).toBe(1);
        expect(legendItems[0].textContent).toBe('my-series');
      });

      describe('when add data', function() {

        beforeEach(function(done) {
          pxSeries.seriesObj = {
            myData: [
              [1397102460000, 11.4403],
              [1397139660000, 13.1913],
              [1397177400000, 12.8485],
              [1397228040000, 10.975]],
            myName: 'foo'
          };
          setTimeout(function() {
            legendItems = tsChart.querySelectorAll('div.highcharts-legend-item');
            series = tsChart.querySelectorAll('.highcharts-series');
            done();
          }, 500);
        });

        it('has my-series in the legend', function() {
          expect(legendItems.length).toBe(1);
          expect(legendItems[0].textContent).toBe('my-series');
        });

        it('graphs 1 series + navigator', function() {
          expect(series.length).toBe(2); // the actual series + navigator are on the chart
          expect(series[0].querySelector('path').attributes.d.value.length > 75).toBeTruthy(); // a line IS drawn (had to look at svg path line... yuck.)
          expect(series[1].querySelector('path').attributes.d.value.length > 75).toBeTruthy(); // a line IS drawn (had to look at svg path line... yuck.)
        });
      });

    });

  });

});
