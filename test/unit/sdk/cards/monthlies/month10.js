var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var UtilsSDK = require('test/utils/utils_sdk');
var _ = require('underscore');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("monthlies", function() {
	describe("month 10", function() {
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

		it('expect blistering skorn to deal 1 damage to all minions and generals including self upon summon', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var shiro = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Shiro}, 1, 2, gameSession.getPlayer2Id());
			var maw1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Maw}, 1, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.BlisteringSkorn}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
			gameSession.executeAction(playCardFromHandAction);

			expect(maw1.getDamage()).to.equal(1);
			expect(shiro.getDamage()).to.equal(1);
			expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(1);
			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(1);
			expect(board.getUnitAtPosition({x: 0, y: 3}).getDamage()).to.equal(1);
		});
		it('expect chakkram to cost 2 less if your general took damage last turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();

			player1.remainingMana = 9;
			player2.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Chakkram}));
			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0].getManaCost()).to.equal(5);

			gameSession.executeAction(gameSession.actionEndTurn());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction = player2.actionPlayCardFromHand(0, 0, 2);
			gameSession.executeAction(playCardFromHandAction);

			gameSession.executeAction(gameSession.actionEndTurn());

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0].getManaCost()).to.equal(3);
		});
		it('expect blood tauras cost to be equal to your generals current health', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.BloodTaura}));
			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0].getManaCost()).to.equal(25);

			var damageAction = new SDK.DamageAction(gameSession);
			damageAction.setTarget(gameSession.getGeneralForPlayer1());
			damageAction.setDamageAmount(5);
			UtilsSDK.executeActionWithoutValidation(damageAction);

			var hand = player1.getDeck().getCardsInHand();
			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(20);
			expect(hand[0].getManaCost()).to.equal(20);

			var damageAction = new SDK.DamageAction(gameSession);
			damageAction.setTarget(gameSession.getGeneralForPlayer1());
			damageAction.setDamageAmount(19);
			UtilsSDK.executeActionWithoutValidation(damageAction);

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0].getManaCost()).to.equal(1);

			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
			gameSession.executeAction(playCardFromHandAction);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.IceCage}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
			gameSession.executeAction(playCardFromHandAction);

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0].getManaCost()).to.equal(1);
		});
		it('expect ruby rifter to gain +2 attack whenever your general is damaged', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.RubyRifter}));
			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0].getATK()).to.equal(4);

			var damageAction = new SDK.DamageAction(gameSession);
			damageAction.setTarget(gameSession.getGeneralForPlayer1());
			damageAction.setDamageAmount(5);
			UtilsSDK.executeActionWithoutValidation(damageAction);

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0].getATK()).to.equal(4);

			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
			gameSession.executeAction(playCardFromHandAction);

			var damageAction = new SDK.DamageAction(gameSession);
			damageAction.setTarget(gameSession.getGeneralForPlayer1());
			damageAction.setDamageAmount(5);
			UtilsSDK.executeActionWithoutValidation(damageAction);

			expect(board.getUnitAtPosition({x: 0, y: 3}).getATK()).to.equal(6);
		});
		it('expect ruby rifter to draw a card whenever your general is damaged', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.RubyRifter}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
			gameSession.executeAction(playCardFromHandAction);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));

			var damageAction = new SDK.DamageAction(gameSession);
			damageAction.setTarget(gameSession.getGeneralForPlayer1());
			damageAction.setDamageAmount(5);
			UtilsSDK.executeActionWithoutValidation(damageAction);

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0].getId()).to.equal(SDK.Cards.Spell.PhoenixFire);
			expect(hand[1]).to.not.exist;

			var damageAction = new SDK.DamageAction(gameSession);
			damageAction.setTarget(gameSession.getGeneralForPlayer1());
			damageAction.setDamageAmount(5);
			UtilsSDK.executeActionWithoutValidation(damageAction);

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0].getId()).to.equal(SDK.Cards.Spell.PhoenixFire);
			expect(hand[1].getId()).to.equal(SDK.Cards.Spell.PhoenixFire);
			expect(hand[2]).to.not.exist;
		});
	});
});
