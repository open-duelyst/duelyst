var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var SDK = require('../../../app/sdk')
var util = require('util');

describe("game serialization", function() {

	describe("action serialization", function() {

		describe("actions with subactions", function() {
			it('expect a deep copy with sub-actions when serialized', function(done) {

				function replacer(key,value) {
					if (key[0] == "_")
						return undefined
					else
						return value
				}

				var action = SDK.GameSession.current().actionEndTurn();
				startTurnAction = SDK.GameSession.current().createActionForType(SDK.StartTurnAction.type)
				startTurnAction.ownerId = SDK.GameSession.current().getNonCurrentPlayerId()
				action.addSubAction(startTurnAction)

				var json = JSON.stringify(action,replacer);
				expect(json).to.exist;
				// Logger.module("UNITTEST").log(json);

				var json3 = SDK.GameSession.current().serializeToJSON(action);
				expect(json3).to.exist;
				// Logger.module("UNITTEST").log(json3);

				expect(json3).to.equal(json);

				done();

			});
		});

	});

});
