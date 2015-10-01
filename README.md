# px-chart

Element that defines a chart, using sub-elements for axis, series and controls configuration.

## Overview

### px-chart

#### Minimal Usage - 1 series of data

    <px-chart>
      <px-chart-series-line id="hpt-acc-position-cruise" data="{{...}}">
      </px-chart-series-line>
    </px-chart>

```js
// Expected data format
[
  [1397102460000, 11.4403],
  [1397139660000, 13.1913],
  [1397177400000, 12.8485],
  [1397228040000, 10.975],
  [1397248260000, 12.9377],
  [1397291280000, 13.3795],
  [1397318100000, 13.0869],
  [1397342100000, 17.3758]
]
// or
[
  {'x': 1397102460000, 'y': 11.4403},
  {'x': 1397139660000, 'y': 13.1913},
  {'x': 1397177400000, 'y': 12.8485},
  {'x': 1397228040000, 'y': 10.975},
  {'x': 1397248260000, 'y': 12.9377},
  {'x': 1397291280000, 'y': 13.3795},
  {'x': 1397318100000, 'y': 13.0869},
  {'x': 1397342100000, 'y': 17.3758}
]
```

#### Full configuration - multiple series, axis, chart controls

	<px-chart tooltip-type="condensed" series-events-width="1">
	    <px-chart-controls data-controls show-date-range="true"></px-chart-controls>
	    <px-chart-yaxis title='{"text": "Left Axis"}' id="firstAxis" offset="0"></px-chart-yaxis>
	    <px-chart-yaxis title='{"text": "Right Axis"}' id="anotherAxis" opposite="true" offset="-2.5"></px-chart-yaxis>
	    <px-chart-series-line id="delta-egt-cruise" axis-id="firstAxis" upper-threshold="30.5" lower-threshold="6.25" data="{{myData}}">
	    </px-chart-series-line>
	    <px-chart-series-line id="fan-vibration-cruise" axis-id="anotherAxis" data="{{myData2}}">
	    </px-chart-series-line>
	  </px-chart>

#### Different types of series

    <px-chart-series-line>
    <px-chart-series-scatter>
    <px-chart-series-histogram>
    <px-chart-series-bar>

#### Dynamically adding series

      var myChart = document.querySelector("#my-chart");

      fetchMyData().then(function(firstSeries) {
        firstSeries.id = firstSeries.name; // you must have an id (you can just set it equal to the series name)
        myChart.addSeries(firstSeries);
      });

```js
// Sample response
{
  "name": "delta-egt-cruise",
  "series": [
    [1397102460000, 11.4403],
    [1397139660000, 13.1913],
    [1397177400000, 12.8485],
    [1397228040000, 10.975],
    [1397248260000, 12.9377],
    [1397291280000, 13.3795],
    [1397318100000, 13.0869],
    [1397342100000, 17.3758]
  ]
}
```

#### Attributes

##### type

*Type:* **String** - (*Optional*) - *Default:* "line"

Determines that what type of chart to display.  This type influences the series type for the navigator, the x-axis display, etc.

This does NOT affect the type of the series displayed on the graph.  To change the type of series, change the ```<px-chart-series-*>``` web component to line, bar, histogram, etc.

Can only be statically configured (not data-bindable).
     
Accepts values of 'line', 'scatter' or 'bar'.

```
<px-chart
	...
	type="bar">
</px-chart>
```

##### navigatorDisabled

*Type:* **Boolean** - (*Optional*) - *Default:* false

Whether to show the zoom-able / scroll-able area at the bottom of the chart.

Can only be statically configured (not data-bindable).

```
<px-chart
	...
	navigator-disabled>
</px-chart>
```

##### chartState

*Type:* **Object** - (*Optional*) - *Default:* {}

Holds chart state for binding between charts & serialising chart settings.

See the synchronized charts demo (demo-sync.html) for an example.

```
<px-chart
	...
	chart-state="{{chartState}}">
</px-chart>
```

##### dataVisColors

*Type:* **Object** - (*Optional*) - *Default:* same as datavis colors in px-colors-design

Mapping of color name to rgb value for use in datavis (axis, navigator, series, etc. colors)

Can only be statically configured (not data-bindable).

```
<px-chart
	...
	data-vis-colors="{...}">
</px-chart>
```


##### exportServerUrl

*Type:* **String** - (*Optional*) - *Default:* null

URL for the chart export server (converts to image / pdf / etc). Default is null. Can use "http://export.highcharts.com" for demo purposes only...no intellectual property should go through that server.

Can only be statically configured (not data-bindable).

```
<px-chart
	...
	export-server-url="https://my-export-url.ge.com">
</px-chart>
```


##### height

*Type:* **Number** - (*Optional*) - *Default:* 400

See [http://api.highcharts.com/highcharts#chart.height](http://api.highcharts.com/highcharts#chart.height)

Can only be statically configured (not data-bindable).

```
<px-chart
	...
	height="500">
</px-chart>
```


##### legend

*Type:* **Object** - (*Optional*) - *Default:* (has default)

See [http://api.highcharts.com/highcharts#legend](http://api.highcharts.com/highcharts#legend)

Note that a default legend will be enabled but can set this as an override.

Can only be statically configured (not data-bindable).
```
<px-chart 
	...
	legend='{
     "enabled": true,
     "useHTML": true,
     "layout": "vertical",
     "verticalAlign": "middle",
     "y": 44,
     "align": "left",
     "floating": true,
     "itemMarginTop": 5,
     "itemMarginBottom": 5
     }'>
</px-chart>
```


##### legendRight

*Type:* **Boolean** - (*Optional*) - *Default:* false

Whether the legend appears to the right of the chart.

Can only be statically configured (not data-bindable).

```
<px-chart
	...
	legend-right>
</px-chart>
```

##### margin

*Type:* **Array** - (*Optional*) - *Default:* [50,50,30,50] or [100,50,30,50] if zoom buttons exist

See [http://api.highcharts.com/highcharts#chart.margin](http://api.highcharts.com/highcharts#chart.margin)

Can only be statically configured (not data-bindable).
```
<px-chart
	...
	margin="[...]">
</px-chart>
```

##### plotBorderWidth

*Type:* **Number** - (*Optional*) - *Default:* 1

See [http://api.highcharts.com/highcharts#chart.plotBorderWidth](http://api.highcharts.com/highcharts#chart.plotBorderWidth)

Can only be statically configured (not data-bindable).
```
<px-chart
	...
	plot-border-width="3">
</px-chart>
```

##### seriesColorOrder

*Type:* **Array** - (*Optional*) - *Default:* [dv-basic-blue, dv-basic-orange, dv-basic-green, dv-basic-pink, dv-basic-brown, dv-basic-purple, dv-basic-yellow, dv-basic-red, dv-basic-gray, dv-light-blue, dv-light-orange, dv-light-green, dv-light-pink, dv-light-brown, dv-light-purple, dv-light-yellow, dv-light-red, dv-light-gray, dv-dark-blue, dv-dark-orange, dv-dark-green, dv-dark-pink, dv-dark-brown, dv-dark-purple, dv-dark-yellow, dv-dark-red, dv-dark-gray]

Mapping of color names (from dataVisColors map) in the order they should be applied to chart series.

Can only be statically configured (not data-bindable).

```
<px-chart
	...
	series-color-order='[
      "dv-light-pink",
      "dv-light-brown",
      "dv-light-purple",
      "dv-light-yellow"
    ]'>
</px-chart>
```

##### seriesEventsColor

*Type:* **String** - (*Optional*) - *Default:* "rgb(59,59,63)"

The color of the vertical line drawn for series events. Any valid CSS color string is supported.

Can only be statically configured (not data-bindable).

```
<px-chart
	...
	series-events-color="rgb(33,33,22)">
</px-chart>
```
##### seriesEventsWidth

*Type:* **Number** - (*Optional*) - *Default:* 2

The width of the vertical line drawn for series events.

Can only be statically configured (not data-bindable).
```
<px-chart
	...
	series-events-width="5">
</px-chart>
```
##### spacingBottom

*Type:* **Number** - (*Optional*) - *Default:* 20

See [http://api.highcharts.com/highstock#chart.spacingBottom](http://api.highcharts.com/highstock#chart.spacingBottom)

Can only be statically configured (not data-bindable).
```
<px-chart
	...
	spacing-bottom="13">
</px-chart>
```
##### tooltipType

*Type:* **String** - (*Optional*) - *Default:* "normal"

Selects the chart tooltip type

See the charts demo (demo.html) for an example. Can select between normal and condensed.

Can only be statically configured (not data-bindable).
```
<px-chart
	...
	tooltip-type="condensed">
</px-chart>
```
##### zoomType

*Type:* **String** - (*Optional*) - *Default:* "x"

See [http://api.highcharts.com/highcharts#chart.zoomType](http://api.highcharts.com/highcharts#chart.zoomType)

Can only be statically configured (not data-bindable).

```
<px-chart
	...
	zoom-type="xy">
</px-chart>
```

<br />
<hr />

#### Methods
##### addSeries(seriesConfig, noRedraw)

seriesConfig Object
* {String} id
* {Array} data
* {Number} yAxis Optional. The axis index to which the series should be bound. Defaults to 0.
* {Number} lineWidth Optional.
* {Object} marker. Optional. Highcharts marker config
* {Object} tooltip. Optional. Highcharts tooltip config
* {Boolean} noRedraw. Optional. If true, does not force a chart redraw() after adding or updating the series

Adds a series to the chart, adding a yAxis as needed

##### addYAxis(axisConfig, defaultColor, noRedraw)

Add a y-axis with the given config object.

##### hasSeries(seriesId) : Boolean

Returns true if the chart has a series with the given id

##### refreshAllSeries()

Fires one "refresh-series" event for each series on the chart, each event has the id of the series.

##### removeSeries(seriesId)

Removes a series from the chart

##### togglePointMarkers()
Can pass optional list of seriesIds, or if null than toggles all point markers.

Toggles display of points on the chart

##### updateAxisThreshold(seriesConfig, thresholdValue, id)

Threshold lines are optionally bound to series. This function processes threshold values on a given series and applies them on the y-axis that is associated with the given series.

##### updateSeries(seriesId, data, noRedraw)

Updates a series on the chart, adding a default series as needed and redrawing after series is added unless noRedraw specified..

<br />
<hr />

### px-chart-series-*

Element defining a chart series that is displayed as a line.

Can be: px-chart-series-line, px-chart-series-bar, px-chart-series-scatter, or px-chart-series-histogram.

#### Usage

##### Data

    <px-chart-series-line data="{{...}}" id="hpt-acc-position-cruise">
    </px-chart-series-line>

    <px-chart-series-line name="The Display Name" line-width="5" lower-threshold="12" upper-threshold="16" id="hpt-acc-position-cruise" marker='{"enabled": false, "radius": 15}' data="{{...}}">
    </px-chart-series-line>

```js
// Expected data format:
[
  [1397102460000, 11.4403],
  [1397139660000, 13.1913],
  [1397177400000, 12.8485],
  [1397228040000, 10.975]
]
// or
[
  {'x': 1397102460000, 'y': 11.4403},
  {'x': 1397139660000, 'y': 13.1913},
  {'x': 1397177400000, 'y': 12.8485},
  {'x': 1397228040000, 'y': 10.975},
  {'x': 1397248260000, 'y': 12.9377},
  {'x': 1397291280000, 'y': 13.3795},
  {'x': 1397318100000, 'y': 13.0869},
  {'x': 1397342100000, 'y': 17.3758}
]
```

##### Series Object

    <px-chart-series-line id="my-series"
      series-obj-name-key="myName"
      series-obj-data-key="myData">
    </px-chart-series-line>

```js
  document.querySelector('#my-series').seriesObj = {
          myData: [
              [1397102460000, 11.4403],
              [1397139660000, 13.1913],
              [1397177400000, 12.8485],
              [1397228040000, 10.975]],
          myName: 'foo'
      };
  ```

##### Using iron-ajax

    <px-chart-series-line id="..." upper-threshold="0.75" lower-threshold="0.25">
      <iron-ajax
          url="../demo-data/aviation/fan-vibration-cruise.json"
          handleas="json"></iron-ajax>
    </px-chart-series-line>

<br />
<hr />

## Attributes

#### axisId

*Type:* **String** - (*Optional*)

Optional declaration of which y axis id this series should be plotted against, if more than one.

Can only be statically configured (not data-bindable).

```
<px-chart-series-line
	...
	axis-id="first-axis">
</px-chart-series-line>
```

#### data

*Type:* **Array** - (*Optional*)

The data associated with the series, an Array of Arrays with the first value of each inner Array being a unix timestamp and the second value being the value.

Fires a "data-changed" event via the "notify" flag when the data changes, the assumption is that the chart will listen for this event.

```
<px-chart-series-line
	...
	data="{{myData}}">
</px-chart-series-line>
```

#### dataEvents

*Type:* **Array** - (*Optional*)

Events associated with the series, an Array of Objects with the keys:

* "time" {Number}, a unix timestamp of the event time
* "id" {String}, unique id of the event
* "label" {String}, the text label associated with the event

Fires a "dataEvents-changed" event via the "notify" flag when the events changes, the assumption is that the chart will listen for this event.

```
<px-chart-series-line
	...
	data-events="[...]">
</px-chart-series-line>
```

#### id

*Type:* **String** - (*Required:*)

Unique id of this series

Can only be statically configured (not data-bindable).

```
<px-chart-series-line
	...
	id="my-series">
</px-chart-series-line>
```

#### lineWidth

*Type:* **Number** - (*Optional*) - *Default:* 1

The width of the line for this series

Can only be statically configured (not data-bindable).

```
<px-chart-series-line
	...
	line-width="3">
</px-chart-series-line>
```

#### lowerThreshold

*Type:* **Number** - (*Optional*)

Lower value beyond which the data should be shown as "above threshold".

Can only be statically configured (not data-bindable).

```
<px-chart-series-line
	...
	lower-threshold="24">
</px-chart-series-line>
```

#### marker

*Type:* **Object** - (*Optional*) - *Default:* {"enabled": false, "radius": 2}

Config for each plotted point on the line

Can only be statically configured (not data-bindable).

```
<px-chart-series-line
	...
	marker='{"enabled": false, "radius": 15}'>
</px-chart-series-line>
```

#### name

*Type:* **String** - (*Optional*) - *Default:* id

Display name of the series, defaults to id

Can only be statically configured (not data-bindable).

```
<px-chart-series-line
	...
	name="my-series-name">
</px-chart-series-line>
```

#### seriesObj

*Type:* **Object** - (*Optional*) 

Optional object that contains members that map to #name and #data via the seriesObjDataKey and seriesObjNameKey,

e.g. seriesObj[seriesObjDataKey] and seriesObj[seriesObjNameKey]

```
<px-chart-series-line
	...
	series-obj="{{...}}">
</px-chart-series-line>
```

#### seriesObjDataEventsKey

*Type:* **String** - (*Optional*) - *Default:* "events"

Key in the optional seriesObj to be used for #events

Can only be statically configured (not data-bindable)

```
<px-chart-series-line
	...
	series-obj-data-events-key="my-events">
</px-chart-series-line>
```
#### seriesObjDataKey

*Type:* **String** - (*Optional*) - *Default:* "series"

Key in the optional seriesObj to be used for #data

Can only be statically configured (not data-bindable).

```
<px-chart-series-line
	...
	series-obj-data-key="my-data">
</px-chart-series-line>
```
#### seriesObjNameKey

*Type:* **String** - (*Optional*) - *Default:* "name" 

Key in the optional seriesObj to be used for #name

Can only be statically configured (not data-bindable).

```
<px-chart-series-line
	...
	series-obj-name-key="my-series-name">
</px-chart-series-line>
```
#### tooltip

*Type:* **Object** - (*Optional*) - *Default:* {"valueDecimals": 2}

Config for the tooltip for each point

Can only be statically configured (not data-bindable).

```
<px-chart-series-line
	...
	tooltip='{"valueDecimals": 3}'>
</px-chart-series-line>
```
#### upperThreshold

*Type:* **Number** - (*Optional*)

Upper value beyond which the data should be shown as "above threshold".

Can only be statically configured (not data-bindable).

```
<px-chart-series-line
	...
	upper-threshold="250">
</px-chart-series-line>
```

<br />
<hr />












## Usage

### Prerequisites
1. node.js
2. npm
3. bower
4. [webcomponents-lite.js polyfill](https://github.com/webcomponents/webcomponentsjs)

Node, npm and bower are necessary to install the component and dependencies. webcomponents.js adds support for web components and custom elements to your application.

### Getting Started

First, install the component via bower on the command line.

```
bower install https://github.com/PredixDev/px-simple-bar-chart.git --save
```
Second, import the component to your application with the following tag in your head.

```
<link rel="import" href="/bower_components/px-simple-bar-chart/px-simple-bar-chart.html" ></link>
```

Finally, use the component in your application:

```
<px-component></px-component>
```

<br />
<hr />

## Local Development

From the component's directory...

```
$ npm install
$ bower install
$ grunt sass
```

From the component's directory, to start a local server run:

```
$ grunt depserve
```

Navigate to the root of that server (e.g. http://localhost:8080/) in a browser to open the API documentation page, with link to the "Demo" / working examples.

### LiveReload

By default grunt watch is configured to enable LiveReload and will be watching for modifications in your root directory as well as `/css`.

Your browser will also need to have the LiveReload extension installed and enabled. For instructions on how to do this please refer to: [livereload.com/extensions/](http://livereload.com/extensions/).

Disable LiveReload by removing the `livereload` key from the configuration object or explicitly setting it to false.


### DevMode
Devmode runs `grunt depserve` and `grunt watch` concurrently so that when you make a change to your source files and save them, your preview will be updated in any browsers you have opened and turned on LiveReload.
From the component's directory run:

```
$ grunt devmode
```

### GE Coding Style Guide
[GE JS Developer's Guide](https://github.com/GeneralElectric/javascript)

<br />
<hr />

## Known Issues

Please use [Github Issues](https://github.com/PredixDev/COMPONENT/issues) to submit any bugs you might find.