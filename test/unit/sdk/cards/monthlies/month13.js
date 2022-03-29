var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var ModifierTranscendance = require('app/sdk/modifiers/modifierTranscendance');
var ModifierForcefield = require('app/sdk/modifiers/modifierForcefield');
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var UtilsSDK = require('test/utils/utils_sdk');
var _ = require('underscore');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("monthlies", function() {
	describe("month 13", function() {
		beforeEach(function () {
			var player1Deck = [
				{id: SDK.Cards.Faction6.General},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction1.General},
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect azure herald to restore 3 health to your general when played', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			gameSession.getGeneralForPlayer1().setDamage(10);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.AzureHerald}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(7);
		});
		it('expect zyx to summon a clone of itself in a nearby space', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Zyx}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			gameSession.getGeneralForPlayer1().refreshExhaustion();
			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 0, y: 4 });
			gameSession.executeAction(action);

			var clone = board.getFriendlyEntitiesAroundEntity(board.getUnitAtPosition({x:1, y: 1}));
			expect(clone[0].getId()).to.equal(SDK.Cards.Neutral.Zyx);
		});
		it('expect zyxs clone to also copy buffs', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.KineticSurge}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Zyx}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			gameSession.getGeneralForPlayer1().refreshExhaustion();
			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 0, y: 4 });
			gameSession.executeAction(action);

			var clone = board.getFriendlyEntitiesAroundEntity(board.getUnitAtPosition({x:1, y: 1}));
			expect(clone[0].getId()).to.equal(SDK.Cards.Neutral.Zyx);
			expect(clone[0].getHP()).to.equal(3);
			expect(clone[0].getATK()).to.equal(2);
		});
		it('expect ironclad to dispel all enemy minions upon death', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var shadowDancer = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.SharianShadowdancer}, 6, 2, gameSession.getPlayer2Id());
			var shadowWatcher = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 5, 2, gameSession.getPlayer2Id());
			var vorpalReaver = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.VorpalReaver}, 4, 2, gameSession.getPlayer2Id());

			var ironclad = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Ironclad}, 7, 2, gameSession.getPlayer1Id());
			ironclad.setDamage(2);
			ironclad.refreshExhaustion();
			var action = ironclad.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);

			expect(shadowDancer.getIsSilenced()).to.equal(true);
			expect(shadowWatcher.getIsSilenced()).to.equal(true);
			expect(vorpalReaver.getIsSilenced()).to.equal(true);
		});
		it('expect decimus to deal 2 damage to the enemy general whenever they draw a card', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var decimus = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Decimus}, 7, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.PhaseHound}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(2);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.PhaseHound}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(4);
		});
	});
});
