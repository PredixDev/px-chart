define(['angular'], function (angular) {
	'use strict';
	
    var module = angular.module('demoModule', []);

    module.config(function($compileProvider) {
        module.directive = function(name, factory) {
            $compileProvider.directive(name, factory);
            return( this );
        };
    });

    return module;
});