var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var config = require('../../../../config/config.js');
var Promise = require('bluebird');
var Logger = require('../../../../app/common/logger');
var _ = require('underscore');
var SDK = require('../../../../app/sdk');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("faction progression", function() {

	describe("starterDeckForFactionLevel()", function() {

		it('expect 28 cards at level 0', function() {
			expect(SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction1,0).length).to.equal(28);
		});

		it('expect 31 cards at level 1', function() {
			expect(SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction1,1).length).to.equal(31);
		});

		it('expect 34 cards at level 3', function() {
			expect(SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction1,3).length).to.equal(34);
		});

		it('expect 37 cards at level 6', function() {
			expect(SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction1,6).length).to.equal(37);
		});

		it('expect 40 cards at level 9', function() {
			expect(SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction1,9).length).to.equal(40);
		});

		it('expect 12 total unlockable basic cards in starter deck at level 9', function() {
			var unlockableBasicCount = 0;
			var deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction1,9);
			for (var i=0; i<deck.length; i++) {
				var cardData = deck[i];
				var cardId = cardData.id;
				var sdkCard = SDK.CardFactory.cardForIdentifier(cardId,SDK.GameSession.current());
				if (sdkCard.getIsUnlockableBasic())
					unlockableBasicCount++
			}

			expect(unlockableBasicCount).to.equal(12);
		});

	});

});
