require('coffee-script/register');

var fs = require('fs');
var expect = require('chai').expect;
var semver = require('semver');
var version = require('../version').version;

var env = process.env.NODE_ENV;
var request;
if (env === 'production') {
	request = require('supertest')('https://play.duelyst.com/');
} else if (env === 'staging') {
	request = require('supertest')('https://830f78e090fe8aec00891405dfc14.duelyst.com/');
}

// disable the logger for cleaner test output
var Logger = require('../app/common/logger');
Logger.enabled = false;

describe('version check', function() {
	this.timeout(5000);
	it('is newer than the version in ' + env, function(done) {
		request
			.get('version')
			.set('Accept', 'application/json')
			.send()
			.expect(200)
			.end(function(err,res){
				expect(err).to.be.equal(null);
				expect(semver.gt(version,res.body.version)).to.be.true;
				done();
			});
	});
});
