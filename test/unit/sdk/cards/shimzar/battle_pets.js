var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var ModifierForcefieldAbsorb = require('app/sdk/modifiers/modifierForcefieldAbsorb');
var UtilsSDK = require('test/utils/utils_sdk');
var _ = require('underscore');
var Promise = require('bluebird');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("battle pets", function() {

		beforeEach(function () {
			// define test decks.
			var player1Deck = [
				{id: SDK.Cards.Faction1.General},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction2.General},
			];

			// setup test session
			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect battle pets to move at the start of its owners turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var yun = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Yun}, 3, 2, gameSession.getPlayer2Id());

			gameSession.executeAction(gameSession.actionEndTurn());

			//yun = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.Yun);
			var oldYun = board.getUnitAtPosition({x: 3, y: 2});

			expect(oldYun).to.equal(undefined);
		});
		it('expect battle pets to not attempt to move if sand trapped', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var yun = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Yun}, 3, 2, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.DrainMorale}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 2);
			gameSession.executeAction(playCardFromHandAction);

			gameSession.executeAction(gameSession.actionEndTurn());

			//yun = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.Yun);
			var oldYun = board.getUnitAtPosition({x: 3, y: 2});
			var currentPlayer = gameSession.getCurrentPlayer();

			expect(currentPlayer).to.equal(gameSession.getPlayer2());
			expect(oldYun.getId()).to.equal(SDK.Cards.Neutral.Yun);
		});
		it('expect battle pets to not attempt to attack if attack is 0', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var amu = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Amu}, 1, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.VoidSteal}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(amu.getATK()).to.equal(0);

			gameSession.executeAction(gameSession.actionEndTurn());

			var currentPlayer = gameSession.getCurrentPlayer();
			expect(currentPlayer).to.equal(gameSession.getPlayer2());

			var player1General = gameSession.getGeneralForPlayer1();
			expect(player1General.getDamage()).to.equal(0);
		});
		it('expect battle pets to move towards its closest enemy', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var yun = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Yun}, 4, 0, gameSession.getPlayer2Id());
			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 8, 0, gameSession.getPlayer1Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 0, 4, gameSession.getPlayer1Id());

			gameSession.executeAction(gameSession.actionEndTurn());

			yun = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.Yun);

			expect(yun.getPosition().x).to.be.above(5);
		});
		it('expect battle pets to immediately attack an enemy if its already in melee range instead of moving first', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var yun = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Yun}, 4, 0, gameSession.getPlayer2Id());
			var kiri = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.DaggerKiri}, 5, 0, gameSession.getPlayer1Id());

			gameSession.executeAction(gameSession.actionEndTurn());

			yun = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.Yun);

			expect(yun.getPosition().x).to.equal(4);
			expect(yun.getPosition().y).to.equal(0);
		});
		it('expect melee battle pets to attack the nearest enemy', function() {
			for(var i = 0; i < 30; i++) {
				var player1Deck = [{id: SDK.Cards.Faction1.General}];
				var player2Deck = [{id: SDK.Cards.Faction3.General}];
				UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

				var gameSession = SDK.GameSession.getInstance();
				var board = gameSession.getBoard();
				var player1 = gameSession.getPlayer1();
				player1.remainingMana = 9;

				var yun = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Yun}, 5, 0, gameSession.getPlayer2Id());
				var damage = yun.getATK();
				var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 8, 0, gameSession.getPlayer1Id());
				var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 0, 0, gameSession.getPlayer1Id());

				gameSession.executeAction(gameSession.actionEndTurn());

				expect(golem1.getDamage()).to.equal(damage);
			}
		});

		/* Test disabled: slow
		it('expect ranged battle pets to attack the nearest enemy', function() {
			for(var i = 0; i < 100; i++) {
				var player1Deck = [{id: SDK.Cards.Faction1.General}];
				var player2Deck = [{id: SDK.Cards.Faction3.General}];
				UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

				var gameSession = SDK.GameSession.getInstance();
				var board = gameSession.getBoard();
				var player1 = gameSession.getPlayer1();
				player1.remainingMana = 9;

				var ion = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Ion}, 8, 0, gameSession.getPlayer2Id());
				var damage = ion.getATK();
				var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 1, 0, gameSession.getPlayer1Id());
				var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 1, 1, gameSession.getPlayer1Id());
				var golem3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 1, 2, gameSession.getPlayer1Id());

				gameSession.executeAction(gameSession.actionEndTurn());

				expect(golem1.getDamage()).to.equal(damage);
			}
		});
		*/

		it('expect flying battle pets to attack the nearest enemy', function() {
			for(var i = 0; i < 30; i++) {
				var player1Deck = [{id: SDK.Cards.Faction1.General}];
				var player2Deck = [{id: SDK.Cards.Faction3.General}];
				UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
				var gameSession = SDK.GameSession.getInstance();
				var board = gameSession.getBoard();
				var player1 = gameSession.getPlayer1();
				var player2 = gameSession.getPlayer2();

				gameSession.executeAction(gameSession.actionEndTurn());

				player2.remainingMana = 9;

				var ubo = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Ubo}, 8, 0, gameSession.getPlayer2Id());
				var damage = ubo.getATK();
				var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 2, 0, gameSession.getPlayer1Id());
				var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 1, 1, gameSession.getPlayer1Id());
				var golem3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 1, 2, gameSession.getPlayer1Id());

				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AstralPhasing}));
				var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 0);
				gameSession.executeAction(playCardFromHandAction);

				gameSession.executeAction(gameSession.actionEndTurn());
				gameSession.executeAction(gameSession.actionEndTurn());

				expect(golem1.getDamage()).to.equal(damage);
			}
		});
		it('expect battle pets to attack the next closest enemy if the closest one is blocked', function() {
			for(var i = 0; i < 30; i++) {
				var player1Deck = [{id: SDK.Cards.Faction1.General}];
				var player2Deck = [{id: SDK.Cards.Faction3.General}];
				UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

				var gameSession = SDK.GameSession.getInstance();
				var board = gameSession.getBoard();
				var player1 = gameSession.getPlayer1();
				player1.remainingMana = 9;

				var yun = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Yun}, 5, 0, gameSession.getPlayer2Id());
				var damage = yun.getATK();
				var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 7, 0, gameSession.getPlayer1Id());
				var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 6, 0, gameSession.getPlayer2Id());
				var golem3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 6, 1, gameSession.getPlayer2Id());
				var golem4 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 2, 0, gameSession.getPlayer1Id());

				gameSession.executeAction(gameSession.actionEndTurn());

				expect(golem4.getDamage()).to.equal(damage);
			}
		});
		it('expect battle pets to always attack a provoking minion when provoked', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var yun = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Yun}, 5, 0, gameSession.getPlayer2Id());
			var damage = yun.getATK();
			var heartseeker1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.Heartseeker}, 5, 1, gameSession.getPlayer1Id());
			var heartseeker2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.Heartseeker}, 6, 0, gameSession.getPlayer1Id());
			var provoke = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.PrimusShieldmaster}, 6, 1, gameSession.getPlayer1Id());
			var heartseeker3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.Heartseeker}, 4, 0, gameSession.getPlayer1Id());
			var heartseeker4 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.Heartseeker}, 4, 1, gameSession.getPlayer1Id());

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(provoke.getDamage()).to.equal(damage);
		});
		it('expect battle pets to always attack a provoking minion when moving into provoke range', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var yun = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Yun}, 4, 1, gameSession.getPlayer2Id());
			var damage = yun.getATK();
			var provoke = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.PrimusShieldmaster}, 6, 0, gameSession.getPlayer1Id());
			var heartseeker1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.Heartseeker}, 6, 1, gameSession.getPlayer1Id());
			var heartseeker2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.Heartseeker}, 6, 2, gameSession.getPlayer1Id());

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(provoke.getDamage()).to.equal(damage);
		});
	it('expect ranged battle pets to always attack a ranged provoking minion when provoked', function() {
		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		player1.remainingMana = 9;

		var ion = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Ion}, 3, 0, gameSession.getPlayer2Id());
		var damage = ion.getATK();
		var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 4, 0, gameSession.getPlayer1Id());
		var provoke = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.PrimusShieldmaster}, 3, 1, gameSession.getPlayer1Id());
		var windstopper = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WindStopper}, 8, 0, gameSession.getPlayer1Id());

		gameSession.executeAction(gameSession.actionEndTurn());

		expect(windstopper.getDamage()).to.equal(damage);
	});
	it('expect ranged battle pets to not attack a provoking minion when out of range', function() {
		for(var i = 0; i < 30; i++) {
			var player1Deck = [{id: SDK.Cards.Faction1.General}];
			var player2Deck = [{id: SDK.Cards.Faction3.General}];
			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var ion = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Ion}, 8, 0, gameSession.getPlayer2Id());
			var damage = ion.getATK();
			var provoke = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.PrimusShieldmaster}, 2, 0, gameSession.getPlayer1Id());
			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 4, 0, gameSession.getPlayer1Id());

			gameSession.executeAction(gameSession.actionEndTurn());
			expect(golem1.getDamage()).to.equal(damage);
		}
	});
		it('expect battle pets to take actions in the order they were summoned', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Yun}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Yun}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 1);
			gameSession.executeAction(playCardFromHandAction);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.HailstoneHowler}, 2, 2, gameSession.getPlayer2Id());
			var yun1 = board.getUnitAtPosition({x:1, y: 1});
			var yun2 = board.getUnitAtPosition({x:2, y: 1});

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			//yun = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.Yun);
			//var oldYun = board.getUnitAtPosition({x: 3, y: 2});

			expect(yun1.getIsRemoved()).to.equal(true);
			expect(yun2.getIsRemoved()).to.equal(false);
		});
		it('expect battle pets to ignore invalid targets', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var yun = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Yun}, 5, 0, gameSession.getPlayer2Id());
			var damage = yun.getATK();
			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 7, 0, gameSession.getPlayer1Id());
			var panddo = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.OnyxBear}, 6, 0, gameSession.getPlayer1Id());

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(golem1.getDamage()).to.equal(damage);
		});
		it('expect battle pets to attack forcefielded targets', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var yun = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Yun}, 6, 0, gameSession.getPlayer2Id());
			var oni = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Oni}, 5, 0, gameSession.getPlayer1Id());
			expect(oni.hasActiveModifierClass(ModifierForcefieldAbsorb)).to.equal(true);

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(oni.getDamage()).to.equal(0);
			expect(oni.hasActiveModifierClass(ModifierForcefieldAbsorb)).to.equal(false);
		});
	});
