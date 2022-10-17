/*
// run with
$ mocha --recursive \
      --compilers coffee:coffeescript/register \
      --require ./test/coffee-coverage-loader.js
      test

// generate report with
$ ./node_modules/.bin/istanbul report
*/

const path = require('path');
const coffeeCoverage = require('coffee-coverage');
const Logger = require('../../app/common/logger.coffee');

const projectRoot = path.resolve(__dirname, '../');
const coverageVar = coffeeCoverage.findIstanbulVariable();
// Only write a coverage report if we're not running inside of Istanbul.
const writeOnExit = (coverageVar == null) ? (`${projectRoot}/coverage/coverage-coffee.json`) : null;

Logger.module('UNITTEST').log(projectRoot);

coffeeCoverage.register({
  instrumentor: 'istanbul',
  basePath: projectRoot,
  exclude: ['/gulpfile.coffee', '/app', '/scripts', '/.tmp', '/public', '/test', '/node_modules', '/.git'],
  coverageVar,
  writeOnExit,
  initAll: true,
});
