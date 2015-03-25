[![Build Status](http://alpha.menlo-ci.sw.ge.com:11112/job/px-timeseries/badge/icon)](http://alpha.menlo-ci.sw.ge.com:11112/job/px-timeseries/)

px-time-series
==============

This is the Experience Time Series Widget that abstract HighChart and support KairosDB Time Series Format by default

# Usage
Add bower dependency by pointing to this repo in bower.json

```json
"px-time-series": "git://github.sw.ge.com/PredixWidgetCatalog/px-time-series.git#develop"
```

Add directive to the page

```html
<px-timeseries 
  queries='queries'
  showYAxisUnits='showYAxisUnits' 
  xAxisLabel='xAxisLabel'
  yAxisLabel='yAxisLabel'>
</px-timeseries>
```

Add 'bower_components/px-time-series/src/main' to your controller require js dependency

```js
define(['angular', 'bower_components/px-time-series/src/main'], function(angular) {
  ...
});
```

Add properties on your `$scope`

```js
var timeSeriesData =  [
{
    'results': [
        {
            'name': 'Winter 2007-2008',
            'values': [
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
                ]
            ]
        }
    ]
}];

$scope.timeSeries = {
  queries: timeSeriesData,    // Time series data
  showYAxisUnits: true,       // Show Y Axis units? true/false
  xAxisLabel: 'xAxisLabel',   // Optional X Axis label
  yAxisLabel: 'yAxisLabel'    // Optional Y Axis label
};
```

