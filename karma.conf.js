// Karma configuration
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: [ 'jasmine', 'requirejs' ],
    files: [
        'src/*.*.html',
        'test/lib/jasmine-jquery.js',
        {pattern: 'requirejs.config.js', included: true},
        {pattern: 'test/test-config.js', included: true},
        {pattern: 'bower_components/**/*.js', included: false},
        {pattern: 'src/*.js', included: false},
        {pattern: 'test/spec/**/*-spec.js', included: false},
        {pattern: 'test/widgets-module.js', included: false}
    ],
	exclude: [
		'test/e2e/*.js',
		'bower_components/**/*-spec.*'
	],
    reporters: ['progress', 'coverage'],
    port: 9090,
    runnerPort: 9100,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
	client: {
		captureConsole: true,
		useIframe: false
	},
    browsers: ['Chrome'],
    captureTimeout: 5000,
    singleRun: true,
    preprocessors: {
    //  '**/*.tmpl.html': ['ng-html2js-define'],
        'src/*.js': ['coverage']
    },
    coverageReporter: {
      type: 'html',
      dir: 'coverage/',
      subdir: function(browser) {
          return browser.toLowerCase().split(/[ /-]/)[0];
        }
    },
	ngHtml2JsDefinePreprocessor: {
		stripPrefix: 'src/',
		prependPrefix: '',
		moduleName: 'predixApp'
	}
  });
};
