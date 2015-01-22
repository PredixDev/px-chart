exports.config = {
	baseUrl: 'http://localhost:9001',
	seleniumAddress: 'http://localhost:4444/wd/hub',
	specs: ['test/e2e/spec/*.js'],
	capabilities: {
		'browserName': 'chrome'
	},
	jasmineNodeOpts: {
		isVerbose: true,
		showColors: true,
		includeStackTrace: true,
		defaultTimeoutInterval: 30000
	},
	params: {
		baseUrl: 'http://localhost:9001'
	},
	onPrepare: function () {

	},
	onComplete: function () {
	}
};
