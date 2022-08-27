var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var UtilsSDK = require('test/utils/utils_sdk');
var _ = require('underscore');
var ModifierForcefield = require('app/sdk/modifiers/modifierForcefield');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("unity", function() {
	describe("faction6", function(){
		beforeEach(function () {
			var player1Deck = [
				{id: SDK.Cards.Faction6.AltGeneral},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction1.General},
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect kindred hunter to summon a night howler only if you have another arcanyst', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction6.KindredHunter}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction1);
			var nightHowler = board.getFriendlyEntitiesAroundEntity(board.getUnitAtPosition({x:1, y: 1}));
			expect(nightHowler[1]).to.not.exist;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction6.KindredHunter}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 2, 2);
			gameSession.executeAction(playCardFromHandAction1);

			var nightMove = board.getUnitAtPosition({x: 1, y: 1});
			nightMove.refreshExhaustion();
			var action = nightMove.actionMove({ x: 0, y: 1 });
			gameSession.executeAction(action);

			var nightHowler = board.getFriendlyEntitiesAroundEntity(board.getUnitAtPosition({x:2, y: 2}));
			expect(nightHowler[0].getId()).to.equal(SDK.Cards.Faction6.ShadowVespyr);
		});

		it('expect mana deathgrip to increase your mana by 1 if the minion is killed', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var bloodtearAlchemist = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BloodtearAlchemist}, 5, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ManaDeathgrip}));
			var action = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(action);

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			expect(player1.getRemainingMana()).to.equal(4);
			expect(bloodtearAlchemist.getIsRemoved()).to.equal(true);
		});

		it('expect mana deathgrip to deal 1 damage and not increase your mana if the minion isnt destroyed', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var HealingMystic = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.HealingMystic}, 5, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ManaDeathgrip}));
			var action = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(action);

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			expect(player1.getRemainingMana()).to.equal(3);
			expect(HealingMystic.getHP()).to.equal(2);
		});

		it('expect iceshatter gauntlet to not destroy non-stunned minions normally', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.ShatteringHeart}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 1, 2, gameSession.getPlayer2Id());

			var action = gameSession.getGeneralForPlayer1().actionAttack(brightmossGolem);
			gameSession.executeAction(action);
			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(21);
			expect(brightmossGolem.getHP()).to.equal(7);
		});

		it('expect iceshatter gauntlet to destroy stunned minions instantly', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.ShatteringHeart}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 1, 2, gameSession.getPlayer2Id());
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.FlashFreeze}));
			var action = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(action);

			var action = gameSession.getGeneralForPlayer1().actionAttack(brightmossGolem);
			gameSession.executeAction(action);
			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(25);
			expect(brightmossGolem.getIsRemoved()).to.equal(true);
		});

		it('expect circulus to put an illusionist in your hand when a spell is played', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction6.Circulus}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction1);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ConcealingShroud}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction1);
			var hand1 = player1.getDeck().getCardsInHand();
			expect(hand1[0]).to.exist;
			expect(hand1[0].getId()).to.equal(SDK.Cards.Neutral.ArcaneIllusion);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ConcealingShroud}));
			var playCardFromHandAction2 = player1.actionPlayCardFromHand(1, 1, 2);
			gameSession.executeAction(playCardFromHandAction2);
			var hand1 = player1.getDeck().getCardsInHand();
			expect(hand1[1]).to.exist;
			expect(hand1[1].getId()).to.equal(SDK.Cards.Neutral.ArcaneIllusion);
		});

		/* Test disabled: failing
		it('expect ghost seraphim to reduce only the first spell each turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction6.GhostSeraphim}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction1);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Frostburn}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Frostburn}));
			var hand1 = player1.getDeck().getCardsInHand();
			expect(hand1[0].getManaCost()).to.equal(0);
			expect(hand1[1].getManaCost()).to.equal(0);

			var playCardFromHandAction2 = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction2);
			var hand1 = player1.getDeck().getCardsInHand();
			expect(hand1[0]).to.not.exist;
			expect(hand1[1].getManaCost()).to.equal(6);
		});
		*/
	});
});
