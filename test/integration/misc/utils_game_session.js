var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var UtilsGameSession = require('app/common/utils/utils_game_session.coffee');
var SDK = require('app/sdk');
var UtilsSDK = require('test/utils/utils_sdk');
var _ = require('underscore');
var prettyjson = require('prettyjson')

describe("UtilsGameSession", function() {

	describe("scrubGameSessionData / card.isScrubbable", function() {

		beforeEach(function () {

			// define test decks.  Spells do not work.  Only add minions and generals this way
			var player1Deck = [
				{id: SDK.Cards.Faction1.General},
				{id: SDK.Cards.Faction1.SilverguardSquire},
				{id: SDK.Cards.Faction1.SilverguardSquire},
				{id: SDK.Cards.Faction1.SilverguardSquire},
				{id: SDK.Cards.Faction1.WindbladeAdept},
				{id: SDK.Cards.Faction1.WindbladeAdept},
				{id: SDK.Cards.Faction1.WindbladeAdept},
				{id: SDK.Cards.Faction1.SunstoneTemplar},
				{id: SDK.Cards.Faction1.SunstoneTemplar},
				{id: SDK.Cards.Faction1.SunstoneTemplar}
			];

			var player2Deck = [
				{id: SDK.Cards.Faction2.General},
				{id: SDK.Cards.Faction2.Heartseeker},
				{id: SDK.Cards.Faction2.Heartseeker},
				{id: SDK.Cards.Faction2.Heartseeker},
				{id: SDK.Cards.Faction2.Widowmaker},
				{id: SDK.Cards.Faction2.Widowmaker},
				{id: SDK.Cards.Faction2.Widowmaker},
				{id: SDK.Cards.Faction2.KaidoAssassin},
				{id: SDK.Cards.Faction2.KaidoAssassin},
				{id: SDK.Cards.Faction2.KaidoAssassin}
			];

			// setup test session
			UtilsSDK.setupSession(player1Deck, player2Deck, false, false);


			/* // USE THIS TO GET THE CURRENT CARDS IN YOUR HAND
			var deck = player1.getDeck();
			Logger.module("UNITTEST").log(deck.getCardsInHand(1));
			*/
		})

		afterEach(function () {
			SDK.GameSession.reset();
		})

		it('expect that player 1 can see their own deck/hand but not player 2\'s hand or deck', function(done) {
			var data = JSON.parse(SDK.GameSession.current().serializeToJSON(SDK.GameSession.current()))
			data = UtilsGameSession.scrubGameSessionData(SDK.GameSession.current(), data, SDK.GameSession.current().getPlayer1Id(), false)
			var newSession = SDK.GameSession.create()
			newSession.deserializeSessionFromFirebase(data)

			expect(newSession.gameSetupData.players[0].deck[0].id).to.be.above(0)
			expect(newSession.gameSetupData.players[0].startingDrawPile[0].id).to.be.above(0)
			expect(newSession.gameSetupData.players[0].startingHand[0].id).to.be.above(0)

			expect(newSession.gameSetupData.players[1].deck[0].id).to.equal(-1)
			expect(newSession.gameSetupData.players[1].startingDrawPile[0].id).to.equal(-1)
			expect(newSession.gameSetupData.players[1].startingHand[0].id).to.equal(-1)

			expect(newSession.getPlayer1().getDeck().getCardsInHandExcludingMissing().length).to.equal(5)
			expect(newSession.getPlayer2().getDeck().getCardsInHandExcludingMissing().length).to.equal(0)
			expect(newSession.getPlayer1().getDeck().getCardsInDrawPileExcludingMissing().length).to.equal(4)
			expect(newSession.getPlayer2().getDeck().getCardsInDrawPileExcludingMissing().length).to.equal(0)

			done()
		})

		it('expect that a spectator of player 1 can see only the hand of player 1 but not player 2\'s hand or deck', function(done) {
			var data = JSON.parse(SDK.GameSession.current().serializeToJSON(SDK.GameSession.current()))
			data = UtilsGameSession.scrubGameSessionData(SDK.GameSession.current(), data, SDK.GameSession.current().getPlayer1Id(), true)
			var newSession = SDK.GameSession.create()
			newSession.deserializeSessionFromFirebase(data)

			expect(newSession.gameSetupData.players[0].deck[0].id).to.equal(-1)
			expect(newSession.gameSetupData.players[0].startingDrawPile[0].id).to.equal(-1)
			expect(newSession.gameSetupData.players[0].startingHand[0].id).to.be.above(0)

			expect(newSession.gameSetupData.players[1].deck[0].id).to.equal(-1)
			expect(newSession.gameSetupData.players[1].startingDrawPile[0].id).to.equal(-1)
			expect(newSession.gameSetupData.players[1].startingHand[0].id).to.equal(-1)

			expect(newSession.getPlayer1().getDeck().getCardsInHandExcludingMissing().length).to.equal(5)
			expect(newSession.getPlayer2().getDeck().getCardsInHandExcludingMissing().length).to.equal(0)
			expect(newSession.getPlayer1().getDeck().getCardsInDrawPileExcludingMissing().length).to.equal(0)
			expect(newSession.getPlayer2().getDeck().getCardsInDrawPileExcludingMissing().length).to.equal(0)

			done()
		})

		it('expect Card to not be scrubbable if it\'s for the player you are spectating and in the hand', function(done) {
			var isScrubbable = SDK.GameSession.current().getPlayer1().getDeck().getCardsInHandExcludingMissing()[0].isScrubbable(SDK.GameSession.current().getPlayer1Id(), true)
			expect(isScrubbable).to.equal(false)
			done()
		})

		it('expect Card to be scrubbable if it\'s for the player you are spectating but not in the hand', function(done) {
			var isScrubbable = SDK.GameSession.current().getPlayer1().getDeck().getCardsInDrawPileExcludingMissing()[0].isScrubbable(SDK.GameSession.current().getPlayer1Id(), true)
			expect(isScrubbable).to.equal(true)
			done()
		})

		it('expect Card to be scrubbable if it\'s for the opponent', function(done) {
			var isScrubbable = SDK.GameSession.current().getPlayer2().getDeck().getCardsInDrawPileExcludingMissing()[0].isScrubbable(SDK.GameSession.current().getPlayer1Id(), false)
			expect(isScrubbable).to.equal(true)
			done()
		})

		it('expect Card to not be scrubbable if it\'s for you', function(done) {
			var isScrubbable = SDK.GameSession.current().getPlayer1().getDeck().getCardsInDrawPileExcludingMissing()[0].isScrubbable(SDK.GameSession.current().getPlayer1Id(), false)
			expect(isScrubbable).to.equal(false)
			done()
		})

	})

})
