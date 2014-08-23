/**
*
* Adapter for Testling-ci
*
**/
jasmine.getEnv().addReporter(new jasmineReporters.TapReporter());

require("test/methods.spec.js");