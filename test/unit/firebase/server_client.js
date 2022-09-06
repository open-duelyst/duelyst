var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../'))
require('coffee-script/register')
var expect = require('chai').expect
var _ = require('underscore')

var config = require('../../../config/config.js')
var DuelystFirebase = require('../../../server/lib/duelyst_firebase_module.coffee')

describe('Firebase.ServerClient.UnitTests', function() {
	const firebaseUrl = 'https://duelyst-unit-tests.firebaseio.local/'

	describe('#connect()', function() {
		it('should reject on empty firebase.url', function() {
			return DuelystFirebase.connect('').getRootRef()
			.then(function(rootRef) {
				expect(rootRef).to.not.exist;
			})
			.error(function(e) {
				expect(e).to.exist;
				expect(e).to.be.instanceOf(Error);
				expect(e.message).to.eql('firebase.url must be set');
				expect(DuelystFirebase.getNumConnections()).to.be.equal(0);
			});
		});
	});
});
