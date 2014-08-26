exports.config = {
	// Do not start a Selenium Standalone sever - only run this using chrome.
	chromeOnly: true,
	chromeDriver: './node_modules/chromedriver/bin/chromedriver',

	// Capabilities to be passed to the webdriver instance.
	capabilities: {
		'browserName': 'chrome'
	},

	// Spec patterns are relative to the current working directly when
	// protractor is called.
	specs: ['e2e/**/*.js'],
	seleniumAddress: 'http://0.0.0.0:4444/wd/hub',

	// Options to be passed to Jasmine-node.
	jasmineNodeOpts: {
		showColors: true,
		defaultTimeoutInterval: 30000
	}
};
