var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../'))
require('coffee-script/register')
var expect = require('chai').expect
var DuelystFirebase = require('../../../server/lib/duelyst_firebase_module.coffee')
var Firebase = require('firebase')
var config = require('../../../config/config.js')
var _ = require ('underscore')

describe("duelyst firebase module", function() {

	var firebaseUrl = config.get('firebase')
	var firebaseToken = config.get('firebaseToken')

	describe("get root Firebase reference", function() {

		it('expect an explicit error (promise reject) if authentication fails', function() {
			return DuelystFirebase.connect('https://duelyst-dev.firebaseio.com/foo','notarealtoken').getRootRef()
			.then(function(rootRef){
				expect(rootRef).to.not.exist;
			})
			.error(function(e){
				expect(e).to.exist;
				expect(e).to.be.instanceOf(Error);
			})
		})

		it('expect an implicity error (throw) if given invalid URL', function() {
			return DuelystFirebase.connect('notarealurl', firebaseToken).getRootRef()
			.then(function(rootRef){
				expect(rootRef).to.not.exist;
			})
			.catch(function(e){
				expect(e).to.exist;
				expect(e).to.be.instanceOf(Error);
			})
		})

		it('expect a valid Firebase reference', function() {
			return DuelystFirebase.connect(firebaseUrl, firebaseToken).getRootRef()
			.then(function(rootRef){
				expect(rootRef).to.exist;
				expect(rootRef.root().toString()).to.be.equal(config.get('firebase').replace(/\/$/, ''))
				expect(DuelystFirebase.getNumConnections()).to.be.equal(1)
			})
		})
		it('expect no new connections if given a previously used URL', function() {
			return DuelystFirebase.connect(firebaseUrl, firebaseToken).getRootRef()
			.then(function(rootRef){
				expect(rootRef).to.exist;
				expect(rootRef.root().toString()).to.be.equal(config.get('firebase').replace(/\/$/, ''))
				expect(DuelystFirebase.getNumConnections()).to.be.equal(1)
			})
		})
		it('expect a different root reference is given a sub-URL (ie. /users)', function() {
			return DuelystFirebase.connect(firebaseUrl + 'users', firebaseToken).getRootRef()
			.then(function(rootRef){
				expect(rootRef).to.exist;
				expect(DuelystFirebase.getNumConnections()).to.be.equal(2)
			})
		})
	})

	describe("get root Firebase reference, second try", function() {
		it('expect the same Firebase reference as previous call', function() {
			return DuelystFirebase.connect(firebaseUrl, firebaseToken).getRootRef()
			.then(function(rootRef){
				expect(rootRef).to.exist;
				expect(rootRef.root().toString()).to.be.equal(config.get('firebase').replace(/\/$/, ''))
				expect(DuelystFirebase.getNumConnections()).to.be.equal(2)
			})
		})
	})

	describe("get root Firebase reference, no params specified", function() {
		it('expect a valid Firebase reference', function() {
			return DuelystFirebase.connect().getRootRef()
			.then(function(rootRef){
				expect(rootRef).to.exist;
				expect(rootRef.root().toString()).to.be.equal(config.get('firebase').replace(/\/$/, ''))
				expect(DuelystFirebase.getNumConnections()).to.be.equal(2)
			})
		})
	})

	// describe("get new root Firebase reference", function() {
	// 	it('expect a different root reference if given a different URL', function() {
	// 		return DuelystFirebase.connect(config.get('auth'),config.get('authToken')).getRootRef()
	// 		.then(function(rootRef){
	// 			expect(rootRef).to.exist;
	// 			expect(rootRef.root().toString()).to.be.equal(config.get('auth').replace(/\/$/, ''))
	// 			expect(DuelystFirebase.getNumConnections()).to.be.equal(2)
	// 		})
	// 	})
	// })

})
