var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var loginHelpers = require('../../../server/lib/hash_helpers.coffee');

describe("login helpers", function() {

	var password = 'password';
	var returnedHash;
	var invalidHash = 'thisisainvalidhash';

	describe("node.js callback style", function() {

		describe("generate hash function", function() {
			it('expect a hash when given a password', function(done) {
				loginHelpers.generateHash(password, function(err, hash){
					expect(err).to.be.equal(null);
					expect(hash).to.exist;
					// Save for next test
					returnedHash = hash;
					done();
				});
			});
		});

		describe("compare password function", function() {
			it('expect true when comparing valid password and hash', function(done) {
				loginHelpers.comparePassword(password, returnedHash, function(err, match){
					expect(err).to.be.equal(null);
					expect(match).to.be.true;
					done();
				});
			});

			it('expect false when comparing bad password and hash', function(done) {
				loginHelpers.comparePassword(password, invalidHash, function(err, match){
					expect(err).to.be.equal(null);
					expect(match).to.be.false;
					done();
				});
			});
		});

	});

	describe("promises style", function() {

		describe("generate hash function", function() {
			it('expect a hash when given a password', function() {
				return loginHelpers.generateHash(password).then(function(hash){
					expect(hash).to.exist;
					this.hash = hash;
				});
			});
		});

		describe("compare password function", function() {
			it('expect true when comparing valid password and hash', function() {
				return loginHelpers.comparePassword(password, returnedHash).then(function(match){
					expect(match).to.be.true;
				});
			});

			it('expect false when comparing bad password and hash', function() {
				return loginHelpers.comparePassword(password, invalidHash).then(function(match){
					expect(match).to.be.false;
				});
			});
		});

	});

});
