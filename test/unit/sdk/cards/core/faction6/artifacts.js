var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var UtilsSDK = require('test/utils/utils_sdk');
var _ = require('underscore');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("faction6", function() {
	describe("artifacts", function(){

		beforeEach(function () {
			// define test decks.  Spells do not work.  Only add minions and generals this way
			var player1Deck = [
				{id: SDK.Cards.Faction6.General},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction1.General},
			];

			// setup test session
			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

			/* // USE THIS TO GET THE CURRENT CARDS IN YOUR HAND
			var deck = player1.getDeck();
			Logger.module("UNITTEST").log(deck.getCardsInHand(1));
			*/
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});


		it('expect coldbiter to deal 2 damage to every nearby enemy minion (and not generals) at end of turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.Frostbiter}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			var abyssalJuggernaut = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalJuggernaut}, 0, 1, gameSession.getPlayer2Id());
			var abyssalJuggernaut2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalJuggernaut}, 0, 3, gameSession.getPlayer2Id());

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(abyssalJuggernaut.getDamage()).to.equal(2);
			expect(abyssalJuggernaut2.getDamage()).to.equal(2);
		});
		it('expect coldbiter + winterblade to stun and deal 2 damage to every nearby enemy at end of turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.Winterblade}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.Frostbiter}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			var abyssalJuggernaut = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalJuggernaut}, 0, 1, gameSession.getPlayer2Id());
			var abyssalJuggernaut2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalJuggernaut}, 0, 3, gameSession.getPlayer2Id());

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(abyssalJuggernaut.getDamage()).to.equal(2);
			expect(abyssalJuggernaut.hasActiveModifierClass(SDK.ModifierStunned)).to.equal(true);
			expect(abyssalJuggernaut2.getDamage()).to.equal(2);
			expect(abyssalJuggernaut2.hasActiveModifierClass(SDK.ModifierStunned)).to.equal(true);
		});
		it('expect snowpiercer to give general +3 attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.Snowpiercer}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(5);
		});
		it('expect winterblade to give general +2 attack and stun enemy minions that you attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.Winterblade}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(4);

			var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 0, 1, gameSession.getPlayer2Id());
			var action = gameSession.getGeneralForPlayer1().actionAttack(brightmossGolem);
			gameSession.executeAction(action);

			expect(brightmossGolem.getDamage()).to.equal(4);
			expect(brightmossGolem.hasActiveModifierClass(SDK.ModifierStunned)).to.equal(true);
		});
	});  //end artifact describe

});
