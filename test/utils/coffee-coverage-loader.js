/*

// run with

$ mocha --recursive \
      --compilers coffee:coffee-script/register \
      --require ./test/coffee-coverage-loader.js
      test

// generate report with

$ ./node_modules/.bin/istanbul report

*/


var path = require('path');
var coffeeCoverage = require('coffee-coverage');
var projectRoot = path.resolve(__dirname, "../");
var coverageVar = coffeeCoverage.findIstanbulVariable();
// Only write a coverage report if we're not running inside of Istanbul.
var writeOnExit = (coverageVar == null) ? (projectRoot + '/coverage/coverage-coffee.json') : null;

Logger.module("UNITTEST").log(projectRoot)

coffeeCoverage.register({
    instrumentor: 'istanbul',
    basePath: projectRoot,
    exclude: ['/gulpfile.coffee', '/app', '/scripts', '/.tmp', '/public', '/test', '/node_modules', '/.git'],
    coverageVar: coverageVar,
    writeOnExit: writeOnExit,
    initAll: true
});