/* global require requirejs */

'use strict';

/**
 * This file sets up the basic module libraries you'll need
 * for your application.
 */
requirejs.onError = function (err) {
	console.error(err.requireType);
	if (err.requireType === 'timeout') {
		console.error('modules: ' + err.requireModules);
	}
	throw err;
};
/**
 * RequireJS Config
 * This is configuration for the entire application.
 */
require.config({
	enforceDefine: false,
	xhtml: false,
	config: {
		text: {
			env: 'xhr'
		}
	},
	paths: {
		angular: '../bower_components/angular/angular',
		'angular-mocks': '../bower_components/angular-mocks/angular-mocks',
		brandkit: '../bower_components/iids/dist/iidx/components/brandkit/js/iidx-brandkit',
		charts: '../bower_components/iids/dist/iidx/components/charts/js/charts',
		highstock: '../bower_components/iids/dist/iidx/components/highcharts-amd/js/highstock.src',
		jquery: '../bower_components/iids/dist/iidx/components/jquery/jquery.min',
		'line-chart': '../bower_components/iids/dist/iidx/components/charts/js/charts/line',
        underscore: '../bower_components/iids/dist/iidx/components/underscore-amd/index',
		vruntime: '../bower_components/vruntime/dist/vruntime',
		'widgets-module': 'src/widgets-module',
		text: '../bower_components/requirejs-plugins/lib/text',
		css: '../bower_components/require-css/css'
	},
	priority: [
		'jquery',
		'angular',
		'angular-resource',
		'angular-route',
		'bootstrap'
	],
	shim: {
		vruntime: {
			deps: ['jquery', 'angular']
		},
		'angular': {
			deps: ['jquery'],
			exports: 'angular'
		},
		'angular-mocks': {
			deps: ['angular'],
			exports: 'mock'
		}
	}
});
