[![Build Status](http://alpha.menlo-ci.sw.ge.com:11112/job/px-timeseries/badge/icon)](http://alpha.menlo-ci.sw.ge.com:11112/job/px-timeseries/)

px-time-series
==============

This is the Experience Time Series Widget that abstract HighChart and support KairosDB Time Series Format by default

# Usage

Add directive to the page

```html
<px-timeseries 
  title='title' 
  queries='queries' 
  showYAxisUnits='showYAxisUnits' 
  plotType='plotType' 
  subtitle='subtitle' 
  xAxisLabel='xAxisLabel' 
  yAxisLabel='yAxisLabel' 
  maxNumPoints='maxNumPoints'>
</px-timeseries>
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
  title: 'Time Series Chart',
  queries: timeSeriesData,    // Time series data 
  showYAxisUnits: true,       // Show Y Axis units? true/false
  plotType: 'line',           // Can be: line, scatter, or area
  subtitle: 'subtitle',       // Optional Subtitle of chart
  xAxisLabel: 'xAxisLabel',   // Optional X Axis label
  yAxisLabel: 'yAxisLabel',   // Optional Y Axis label
  maxNumPoints: 500           // Optional Maximum number of points to show
};
```
