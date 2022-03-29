require('coffee-script/register');

var expect = require('chai').expect;
var	api = require('../../server/express.coffee');
var request = require('supertest')(api);

describe('password reset', function() {

	describe('POST /forgot', function() {
		this.timeout(5000);
		it('returns 200 and sends email if given user exists', function(done) {
			request
				.post('/forgot')
				.set('Accept', 'application/json')
				.send({ email: "unit-test@counterplay.co"})
				.expect(200, done)
		});
	});

	describe('POST /forgot', function() {
		it('returns 400 if email is invalid', function(done) {
			request
				.post('/forgot')
				.set('Accept', 'application/json')
				.send({ email: "NOTEMAIL"})
				.expect(400)
				.end(function(err,res){
					expect(err).to.be.equal(null);
					done();
				});
		});
	});

	describe('POST /forgot', function() {
		it('returns 400 if user does not exist', function(done) {
			request
				.post('/forgot')
				.set('Accept', 'application/json')
				.send({ email: "NOTAREALUSER@FOO.COM"})
				.expect(400)
				.end(function(err,res){
					expect(err).to.be.equal(null);
					done();
				});
		});
	});

})
