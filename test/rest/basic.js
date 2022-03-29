require('coffee-script/register');

var expect = require('chai').expect;
var	api = require('../../server/express.coffee');
var request = require('supertest')(api);
var version = require("../../version.json").version;

// disable the logger for cleaner test output
var Logger = require('../../app/common/logger');
Logger.enabled = false;

describe('basic route checks', function() {

	describe('/health', function() {
			it('returns 200', function(done) {
					request
							.get('/health')
							.expect(200, done);
			});
	});

	describe('/session', function() {
			it('returns 400 if no client version set', function(done) {
					request
							.get('/session')
							.expect(400, done);
			});
			it('returns 400 if wrong client version set', function(done) {
					request
							.get('/session')
							.set('Client-Version', "wrong")
							.expect(400, done);
			});
			it('returns 401 unauthorized if no token provided', function(done) {
					request
							.get('/session')
							.set('Client-Version', version)
							.expect(401, done);
			});
	});

	describe('/api/me/securetest', function() {
			it('returns 400 if wrong client version set', function(done) {
					request
							.get('/api')
							.set('Client-Version', "wrong")
							.expect(400, done);
			});
			it('returns 401 unauthorized if no token provided', function(done) {
					request
							.get('/api/me/securetest')
							.set('Client-Version', version)
							.expect(401, done);
			});
	});

	describe('/api', function() {
			it('returns 400 if no client version set', function(done) {
					request
							.get('/api')
							.expect(400, done);
			});
			it('returns 400 if wrong client version set', function(done) {
					request
							.get('/api')
							.set('Client-Version', "wrong")
							.expect(400, done);
			});
			it('returns 401 unauthorized if no token provided', function(done) {
					request
							.get('/api')
							.set('Client-Version', version)
							.expect(401, done);
			});
	});

});
