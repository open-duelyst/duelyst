#!/usr/bin/env node
'use strict';
var meow = require('meow');
var gitLatestSemverTag = require('./');

var cli = meow({
  help: [
    'Usage',
    '  git-latest-semver-tag <optional-path>'
  ]
});

var opts = {};
opts.cwd = cli.input[0];

gitLatestSemverTag(opts, function(err, tag) {
  if (err) {
    console.error(err.toString());
    process.exit(1);
  }

  console.log(tag);
});
