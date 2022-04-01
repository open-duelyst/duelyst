'use strict';
var assert = require('assert');
var gitLatestSemverTag = require('./');
var shell = require('shelljs');
var writeFileSync = require('fs').writeFileSync;

shell.config.silent = true;
shell.rm('-rf', 'tmp');
shell.mkdir('tmp');
shell.cd('tmp');
shell.exec('git init');

it('should error if no commits found', function(done) {
  gitLatestSemverTag(function(err) {
    assert(err);

    writeFileSync('test1', '');
    shell.exec('git add --all && git commit -m"First commit"');
    shell.exec('git tag foo');

    done();
  });
});

it('should get no semver tag', function(done) {
  gitLatestSemverTag(function(err, tag) {
    assert.equal(tag, '');

    writeFileSync('test2', '');
    shell.exec('git add --all && git commit -m"Second commit"');
    shell.exec('git tag v2.0.0');
    writeFileSync('test3', '');
    shell.exec('git add --all && git commit -m"Third commit"');
    shell.exec('git tag va.b.c');

    done();
  });
});

it('should get the latest semver tag', function(done) {
  gitLatestSemverTag(function(err, tag) {
    assert.equal(tag, 'v2.0.0');
    shell.exec('git tag v3.0.0');

    done();
  });
});

it('should get the correct latest semver tag', function(done) {
  gitLatestSemverTag(function(err, tag) {
    assert.equal(tag, 'v3.0.0');

    done();
  });
});

it('should ensure it works if I run it again', function(done) {
  gitLatestSemverTag(function(err, tag) {
    assert.equal(tag, 'v3.0.0');

    done();
  });
});

it('should work if I pass exec options through', function(done) {
  gitLatestSemverTag({cwd: __dirname}, function(err, tag) {
    assert(tag);

    done();
  });
});
