define(['angular'], function (angular) {
    var module = angular.module('predix.dashboard.widgets', []);

    module.config(function($compileProvider) {
        module.directive = function(name, factory) {
            $compileProvider.directive(name, factory);
            return( this );
        };
    });

    return module;
});