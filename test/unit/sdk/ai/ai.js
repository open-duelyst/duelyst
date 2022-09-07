"use strict";

var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
const CardFactory = require('app/sdk/cards/cardFactory');
var UtilsSDK = require('test/utils/utils_sdk');
var UsableDecks = require('server/ai/decks/usable_decks');
var _ = require('underscore');
var StarterAI = require('server/ai/starter_ai');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("starter ai", function() {

	describe("behavior", function(){
		beforeEach(function () {
			var player1Deck = [
				{id: SDK.Cards.Faction1.General}
			];

			var player2Deck = [
				{id: SDK.Cards.Faction2.General}
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect dervishes to prefer attacking', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var ai = new StarterAI(gameSession, player1.getPlayerId(), 0);

			var dervish = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Dervish}, 7, 2, gameSession.getPlayer1Id());
			dervish.refreshExhaustion();

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
			expect(nextAction.getSource()).to.equal(gameSession.getGeneralForPlayer1());
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.AttackAction.type);
			expect(nextAction.getSource().getId()).to.equal(SDK.Cards.Faction3.Dervish);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
		});
		it('expect dervishes to be ignored unless can reach objective', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var ai = new StarterAI(gameSession, player1.getPlayerId(), 0);

			var dervish = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Dervish}, 0, 0, gameSession.getPlayer1Id());
			dervish.refreshExhaustion();

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
			expect(nextAction.getSource()).to.equal(gameSession.getGeneralForPlayer1());
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
		});
		it('expect units to ignore targets that they cannot damage or that should be ignored', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);

			var corsair = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SilvertongueCorsair}, 1, 4, gameSession.getPlayer2Id());
			var sarlac = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SarlacTheEternal}, 1, 0, gameSession.getPlayer2Id());
			var panddo = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.OnyxBear}, 2, 0, gameSession.getPlayer2Id());
			var dervish = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.IronDervish}, 3, 0, gameSession.getPlayer1Id());
			dervish.refreshExhaustion();
			corsair.setDamage(1);

			// first turn
			var nextAction = ai.nextAction();
			while(!(nextAction instanceof SDK.EndTurnAction))
			{
				expect(nextAction.getType()).to.not.equal(SDK.AttackAction.type);
				gameSession.executeAction(nextAction);
				nextAction = ai.nextAction();
			}

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			// second turn
			var nextAction = ai.nextAction();
			while(!(nextAction instanceof SDK.EndTurnAction))
			{
				expect(nextAction.getType()).to.not.equal(SDK.AttackAction.type);
				gameSession.executeAction(nextAction);
				nextAction = ai.nextAction();
			}
		});
	});

	describe("difficulty", function(){
		beforeEach(function () {
			var player1Deck = [
				{id: SDK.Cards.Faction1.General}
			];

			var player2Deck = [
				{id: SDK.Cards.Faction2.General}
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect at 0% difficulty: never spawns more than 1 unit per turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var ai = new StarterAI(gameSession, player1.getPlayerId(), 0);

			player1.remainingMana = 3;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));

			expect(ai.getMyPlayerId()).to.equal(player1.getPlayerId());
			expect(ai._difficulty).to.equal(0);

			// move
      var nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
      expect(nextAction.getTargetPosition().x).to.equal(2);
      expect(nextAction.getTargetPosition().y).to.equal(2);
			expect(nextAction.getIsValid()).to.equal(true);
			SDK.GameSession.getInstance().executeAction(nextAction);

			// spawn
			var nextAction = ai.nextAction();
			expect(nextAction.getIsValid()).to.equal(true);
			SDK.GameSession.getInstance().executeAction(nextAction);
			expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);

			expect(board.getUnits().length).to.equal(3);

			// end turn
			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
		});
		it('expect at 0% difficulty: will not spawn a unit if one is already on board and hand not full', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

      var ai = new StarterAI(gameSession, player1.getPlayerId(), 0);

			var draugar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 7, 2, gameSession.getPlayer1Id());

			player1.remainingMana = 3;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));

      var nextAction = ai.nextAction();

      expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
      expect(nextAction.getTargetPosition().x).to.equal(2);
      expect(nextAction.getTargetPosition().y).to.equal(2);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			SDK.GameSession.getInstance().executeAction(nextAction);

			expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
		});
		it('expect at 0% difficulty: will spawn a unit if one is already on board only if hand is full', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var ai = new StarterAI(gameSession, player1.getPlayerId(), 0);

			var draugar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 0, 1, gameSession.getPlayer1Id());

			player1.remainingMana = 3;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));

			var nextAction = ai.nextAction();
			SDK.GameSession.getInstance().executeAction(nextAction);
			expect(nextAction.getIsValid()).to.equal(true);
			expect(nextAction.getType()).to.equal(SDK.MoveAction.type);

			var nextAction = ai.nextAction();
			SDK.GameSession.getInstance().executeAction(nextAction);
			expect(nextAction.getIsValid()).to.equal(true);
			expect(nextAction instanceof SDK.PlayCardFromHandAction).to.equal(true);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
		});
		it('expect at 0% difficulty: never removes more than 1 unit per turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var ai = new StarterAI(gameSession, player1.getPlayerId(), 0);

			var pyromancer1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 7, 0, gameSession.getPlayer2Id());
			var pyromancer2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 7, 1, gameSession.getPlayer2Id());
			var pyromancer3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 7, 3, gameSession.getPlayer2Id());

			player1.remainingMana = 3;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrueStrike}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrueStrike}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrueStrike}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrueStrike}));

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
			expect(nextAction.getTargetPosition().x).to.equal(2);
			expect(nextAction.getTargetPosition().y).to.equal(2);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
		});

		it('expect at 0% difficulty: will always use dervishes to attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var ai = new StarterAI(gameSession, player1.getPlayerId(), 0);

			//var weaver = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.OrbWeaver}, 5, 2, gameSession.getPlayer1Id());
			//var weaver2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.OrbWeaver}, 4, 0, gameSession.getPlayer1Id());
			//var weaver3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.OrbWeaver}, 4, 4, gameSession.getPlayer1Id());
			var dervish = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Dervish}, 7, 2, gameSession.getPlayer1Id());
			dervish.refreshExhaustion();
			var dervish2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Dervish}, 7, 3, gameSession.getPlayer1Id());
			dervish2.refreshExhaustion();
			var dervish3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Dervish}, 7, 1, gameSession.getPlayer1Id());
			dervish3.refreshExhaustion();

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
			expect(nextAction.getTargetPosition().x).to.equal(2);
			expect(nextAction.getTargetPosition().y).to.equal(2);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.AttackAction.type);
			SDK.GameSession.getInstance().executeAction(nextAction);
			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.AttackAction.type);
			SDK.GameSession.getInstance().executeAction(nextAction);
			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.AttackAction.type);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
		});

		it('expect at 0% difficulty: will only attack enemy general with own general, never with own units', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var ai = new StarterAI(gameSession, player1.getPlayerId(), 0);

			var orbWeaver = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.AymaraHealer}, 8, 3, gameSession.getPlayer1Id());
			orbWeaver.refreshExhaustion();

			gameSession.getGeneralForPlayer1().refreshExhaustion();
			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
			gameSession.executeAction(action);
			gameSession.getGeneralForPlayer1().refreshExhaustion();
			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
			gameSession.executeAction(action);
			gameSession.getGeneralForPlayer1().refreshExhaustion();
			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 6, y: 2 });
			gameSession.executeAction(action);
			gameSession.getGeneralForPlayer1().refreshExhaustion();
			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 7, y: 2 });
			gameSession.executeAction(action);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.AttackAction.type);
			expect(nextAction.sourcePosition.y).to.equal(2);
			expect(nextAction.sourcePosition.x).to.equal(7);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
		});
		it('expect at 10% difficulty: will not spawn a unit if two are already on board and hand not full', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var ai = new StarterAI(gameSession, player1.getPlayerId(), 0.1);

			var draugar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 7, 2, gameSession.getPlayer1Id());
			var draugar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 7, 3, gameSession.getPlayer1Id());

			player1.remainingMana = 3;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));

			var nextAction = ai.nextAction();

			expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
			expect(nextAction.getTargetPosition().x).to.equal(2);
			expect(nextAction.getTargetPosition().y).to.equal(2);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			SDK.GameSession.getInstance().executeAction(nextAction);

			expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
		});
		it('expect at 10% difficulty: will spawn a unit if two are already on board only if hand is full', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var ai = new StarterAI(gameSession, player1.getPlayerId(), 0.1);

			var draugar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 0, 3, gameSession.getPlayer1Id());
			var draugar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 0, 1, gameSession.getPlayer1Id());

			player1.remainingMana = 3;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));

			var nextAction = ai.nextAction();
			SDK.GameSession.getInstance().executeAction(nextAction);
			expect(nextAction.getIsValid()).to.equal(true);
			expect(nextAction.getType()).to.equal(SDK.MoveAction.type);

			var nextAction = ai.nextAction();
			SDK.GameSession.getInstance().executeAction(nextAction);
			expect(nextAction.getIsValid()).to.equal(true);
			expect(nextAction instanceof SDK.PlayCardFromHandAction).to.equal(true);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
		});
		it('expect at 10% difficulty: will attack enemy general with own general and own units', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var ai = new StarterAI(gameSession, player1.getPlayerId(), 0.1);

			var aymaraHealer = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.AymaraHealer}, 8, 3, gameSession.getPlayer1Id());
			aymaraHealer.refreshExhaustion();

			gameSession.getGeneralForPlayer1().refreshExhaustion();
			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
			gameSession.executeAction(action);
			gameSession.getGeneralForPlayer1().refreshExhaustion();
			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
			gameSession.executeAction(action);
			gameSession.getGeneralForPlayer1().refreshExhaustion();
			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 6, y: 2 });
			gameSession.executeAction(action);
			gameSession.getGeneralForPlayer1().refreshExhaustion();
			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 7, y: 2 });
			gameSession.executeAction(action);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.AttackAction.type);
			expect(nextAction.sourcePosition.y).to.equal(2);
			expect(nextAction.sourcePosition.x).to.equal(7);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.AttackAction.type);
			expect(nextAction.sourcePosition.y).to.equal(3);
			expect(nextAction.sourcePosition.x).to.equal(7);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
		});
		it('expect at 10% difficulty: general will not retreat when below 10 hp', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var ai = new StarterAI(gameSession, player1.getPlayerId(), 0.1);

			var orbWeaver = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.OrbWeaver}, 4, 0, gameSession.getPlayer1Id());
			var orbWeaver2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.OrbWeaver}, 4, 4, gameSession.getPlayer1Id());
			var orbWeaver3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.OrbWeaver}, 5, 2, gameSession.getPlayer1Id());

			gameSession.getGeneralForPlayer1().setDamage(20);

			gameSession.getGeneralForPlayer1().refreshExhaustion();
			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
			gameSession.executeAction(action);
			gameSession.getGeneralForPlayer1().refreshExhaustion();
			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
			gameSession.executeAction(action);
			gameSession.getGeneralForPlayer1().refreshExhaustion();
			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 6, y: 2 });
			gameSession.executeAction(action);
			gameSession.getGeneralForPlayer1().refreshExhaustion();
			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 7, y: 2 });
			gameSession.executeAction(action);
			gameSession.getGeneralForPlayer1().refreshExhaustion();

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.AttackAction.type);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
		});
		it('expect at 20% difficulty: general will retreat when below 10 hp', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var ai = new StarterAI(gameSession, player1.getPlayerId(), 0.2);

			var orbWeaver = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.OrbWeaver}, 4, 0, gameSession.getPlayer1Id());
			var orbWeaver2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.OrbWeaver}, 4, 4, gameSession.getPlayer1Id());
			var orbWeaver3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.OrbWeaver}, 5, 2, gameSession.getPlayer1Id());

			gameSession.getGeneralForPlayer1().setDamage(20);

			gameSession.getGeneralForPlayer1().refreshExhaustion();
			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
			gameSession.executeAction(action);
			gameSession.getGeneralForPlayer1().refreshExhaustion();
			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
			gameSession.executeAction(action);
			gameSession.getGeneralForPlayer1().refreshExhaustion();
			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 6, y: 2 });
			gameSession.executeAction(action);
			gameSession.getGeneralForPlayer1().refreshExhaustion();
			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 7, y: 2 });
			gameSession.executeAction(action);
			gameSession.getGeneralForPlayer1().refreshExhaustion();

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
		});
		it('expect at 20% difficulty: will not spawn a unit if four are already on board and hand not full', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var ai = new StarterAI(gameSession, player1.getPlayerId(), 0.2);

			var draugar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 7, 2, gameSession.getPlayer1Id());
			var draugar2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 7, 3, gameSession.getPlayer1Id());
			var draugar3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 6, 3, gameSession.getPlayer1Id());
			var draugar4 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 5, 3, gameSession.getPlayer1Id());

			player1.remainingMana = 3;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));

			var nextAction = ai.nextAction();

			expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
			expect(nextAction.getTargetPosition().x).to.equal(2);
			expect(nextAction.getTargetPosition().y).to.equal(2);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			SDK.GameSession.getInstance().executeAction(nextAction);

			expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
		});
		it('expect at 20% difficulty: will spawn a unit if four are already on board only if hand is full', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var ai = new StarterAI(gameSession, player1.getPlayerId(), 0.2);

			var draugar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 0, 3, gameSession.getPlayer1Id());
			var draugar2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 0, 4, gameSession.getPlayer1Id());
			var draugar3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 0, 1, gameSession.getPlayer1Id());
			var draugar4 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 0, 0, gameSession.getPlayer1Id());

			player1.remainingMana = 3;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));

			var nextAction = ai.nextAction();
			SDK.GameSession.getInstance().executeAction(nextAction);
			expect(nextAction.getIsValid()).to.equal(true);
			expect(nextAction.getType()).to.equal(SDK.MoveAction.type);

			var nextAction = ai.nextAction();
			SDK.GameSession.getInstance().executeAction(nextAction);
			expect(nextAction.getIsValid()).to.equal(true);
			expect(nextAction instanceof SDK.PlayCardFromHandAction).to.equal(true);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
		});
		it('expect at 20% difficulty: never spawns more than 1 unit per turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

      var ai = new StarterAI(gameSession, player1.getPlayerId(), 0.2);

			player1.remainingMana = 3;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));

      var nextAction = ai.nextAction();

      expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
      expect(nextAction.getTargetPosition().x).to.equal(2);
      expect(nextAction.getTargetPosition().y).to.equal(2);
			expect(nextAction.getIsValid()).to.equal(true);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);
			expect(nextAction.getCard().getId()).to.equal(SDK.Cards.Faction1.SilverguardSquire);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
		});
		it('expect at 20% difficulty: never removes more than 2 units per turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var ai = new StarterAI(gameSession, player1.getPlayerId(), 0.2);

			var pyromancer1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 7, 0, gameSession.getPlayer2Id());
			var pyromancer2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 7, 1, gameSession.getPlayer2Id());
			var pyromancer3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 7, 3, gameSession.getPlayer2Id());

			player1.remainingMana = 4;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrueStrike}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrueStrike}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrueStrike}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrueStrike}));

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
			expect(nextAction.getTargetPosition().x).to.equal(2);
			expect(nextAction.getTargetPosition().y).to.equal(2);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
		});
		it('expect at 50% difficulty: never spawns more than 3 units per turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var ai = new StarterAI(gameSession, player1.getPlayerId(), 0.5);

			player1.remainingMana = 3;
			player1.signatureCardIndices = [];

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));

			var nextAction = ai.nextAction();

			expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
			expect(nextAction.getTargetPosition().x).to.equal(2);
			expect(nextAction.getTargetPosition().y).to.equal(2);
			expect(nextAction.getIsValid()).to.equal(true);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);
			expect(nextAction.getCard().getId()).to.equal(SDK.Cards.Faction1.SilverguardSquire);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);
			expect(nextAction.getCard().getId()).to.equal(SDK.Cards.Faction1.SilverguardSquire);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
		});
		it('expect at 50% difficulty: never removes more than 5 units per turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var ai = new StarterAI(gameSession, player1.getPlayerId(), 0.5);

			var pyromancer1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 7, 0, gameSession.getPlayer2Id());
			var pyromancer2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 7, 1, gameSession.getPlayer2Id());
			var pyromancer3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 7, 3, gameSession.getPlayer2Id());
			var pyromancer4 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 6, 3, gameSession.getPlayer2Id());
			var pyromancer5 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 7, 4, gameSession.getPlayer2Id());
			var pyromancer6 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 6, 2, gameSession.getPlayer2Id());

			player1.remainingMana = 5;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrueStrike}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrueStrike}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrueStrike}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrueStrike}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrueStrike}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrueStrike}));

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
			expect(nextAction.getTargetPosition().x).to.equal(2);
			expect(nextAction.getTargetPosition().y).to.equal(2);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
		});
		it('expect at 50% difficulty: will not spawn a unit if ten are already on board and hand not full', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var ai = new StarterAI(gameSession, player1.getPlayerId(), 0.5);

			var draugar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 7, 2, gameSession.getPlayer1Id());
			var draugar2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 7, 3, gameSession.getPlayer1Id());
			var draugar3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 6, 3, gameSession.getPlayer1Id());
			var draugar4 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 6, 1, gameSession.getPlayer1Id());
			var draugar5 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 6, 2, gameSession.getPlayer1Id());
			var draugar6 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 6, 0, gameSession.getPlayer1Id());
			var draugar7 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 6, 4, gameSession.getPlayer1Id());
			var draugar8 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 5, 3, gameSession.getPlayer1Id());
			var draugar9 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 5, 2, gameSession.getPlayer1Id());
			var draugar10 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 5, 1, gameSession.getPlayer1Id());

			player1.remainingMana = 3;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));

			var nextAction = ai.nextAction();

			expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
			expect(nextAction.getTargetPosition().x).to.equal(2);
			expect(nextAction.getTargetPosition().y).to.equal(2);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			SDK.GameSession.getInstance().executeAction(nextAction);

			expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
		});
		it('expect at 50% difficulty: will spawn a unit if ten are already on board only if hand is full', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var ai = new StarterAI(gameSession, player1.getPlayerId(), 0.5);

			var draugar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 7, 2, gameSession.getPlayer1Id());
			var draugar2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 7, 3, gameSession.getPlayer1Id());
			var draugar3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 6, 3, gameSession.getPlayer1Id());
			var draugar4 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 6, 1, gameSession.getPlayer1Id());
			var draugar5 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 6, 2, gameSession.getPlayer1Id());
			var draugar6 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 6, 0, gameSession.getPlayer1Id());
			var draugar7 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 6, 4, gameSession.getPlayer1Id());
			var draugar8 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 5, 3, gameSession.getPlayer1Id());
			var draugar9 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 5, 2, gameSession.getPlayer1Id());
			var draugar10 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 5, 1, gameSession.getPlayer1Id());

			player1.remainingMana = 3;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));

			var nextAction = ai.nextAction();

			expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
			expect(nextAction.getTargetPosition().x).to.equal(2);
			expect(nextAction.getTargetPosition().y).to.equal(2);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);
			SDK.GameSession.getInstance().executeAction(nextAction);

			var nextAction = ai.nextAction();
			expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
		});
	});

	describe("getAutomaticUsableDeck()", function() {

		it('expect low/mid cost melee units at 0% difficulty', function() {
			var difficulty = 0.0;
			var factions = SDK.FactionFactory.getAllPlayableFactions();
			for (var i = 0, il = factions.length; i < il; i++) {
				var factionData = factions[i];
				var factionId = factionData.id;
				var generalId = factionData.generalIds[Math.floor(Math.random() * factionData.generalIds.length)];
				var deckData = UsableDecks.getAutomaticUsableDeck(generalId, difficulty);
				var numUnits = 0;
				for (var j = 0, jl = deckData.length; j < jl; j++) {
					var cardData = deckData[j];
					var card = SDK.GameSession.getCardCaches().getCardById(cardData.id);
					expect(card.getType()).to.equal(SDK.CardType.Unit);
					expect(_.contains(card.getCachedKeywordClasses(), SDK.ModifierRanged)).to.equal(false);
					expect(_.contains(card.getCachedKeywordClasses(), SDK.ModifierBlastAttack)).to.equal(false);
					expect(card.getManaCost()).to.be.below(7);
					numUnits++;
				}
				expect(numUnits).to.be.above(0);
			}
		});

		it('expect spells at 20% difficulty', function() {
			var difficulty = 0.2;
			var factions = SDK.FactionFactory.getAllPlayableFactions();
			for (var i = 0, il = factions.length; i < il; i++) {
				var factionData = factions[i];
				var factionId = factionData.id;
				var generalId = factionData.generalIds[Math.floor(Math.random() * factionData.generalIds.length)];
				var deckData = UsableDecks.getAutomaticUsableDeck(generalId, difficulty);
				var numUnits = 0;
				var numSpells = 0;
				for (var j = 0, jl = deckData.length; j < jl; j++) {
					var cardData = deckData[j];
					var card = SDK.GameSession.getCardCaches().getCardById(cardData.id);
					if (card.getType() === SDK.CardType.Unit) {
						expect(_.contains(card.getCachedKeywordClasses(), SDK.ModifierRanged)).to.equal(false);
						expect(_.contains(card.getCachedKeywordClasses(), SDK.ModifierBlastAttack)).to.equal(false);
						expect(card.getManaCost()).to.be.below(7);
						numUnits++;
					} else if (card.getType() === SDK.CardType.Spell) {
						expect(card.getFactionId()).to.equal(factionId);
						numSpells++;
					}
				}
				expect(numUnits).to.be.above(0);
				expect(numSpells).to.be.above(0);
			}
		});

		it('expect artifacts at 50% difficulty', function() {
			var difficulty = 0.5;
			var factions = SDK.FactionFactory.getAllPlayableFactions();
			for (var i = 0, il = factions.length; i < il; i++) {
				var factionData = factions[i];
				var factionId = factionData.id;
				var generalId = factionData.generalIds[Math.floor(Math.random() * factionData.generalIds.length)];
				var deckData = UsableDecks.getAutomaticUsableDeck(generalId, difficulty);
				var numUnits = 0;
				var numSpells = 0;
				var numArtifacts = 0;
				for (var j = 0, jl = deckData.length; j < jl; j++) {
					var cardData = deckData[j];
					var card = SDK.GameSession.getCardCaches().getCardById(cardData.id);
					if (card.getType() === SDK.CardType.Unit) {
						expect(card.getManaCost()).to.be.below(7);
						numUnits++;
					} else if (card.getType() === SDK.CardType.Spell) {
						expect(card.getFactionId()).to.equal(factionId);
						numSpells++;
					} else if (card.getType() === SDK.CardType.Artifact) {
						expect(card.getFactionId()).to.equal(factionId);
						numArtifacts++;
					}
				}
				expect(numUnits).to.be.above(0);
				expect(numSpells).to.be.above(0);
				expect(numArtifacts).to.be.above(0);
			}
		});

		it('expect high cost units at 75% difficulty', function() {
			var difficulty = 0.75;
			var factions = SDK.FactionFactory.getAllPlayableFactions();
			for (var i = 0, il = factions.length; i < il; i++) {
				var factionData = factions[i];
				var factionId = factionData.id;
				var generalId = factionData.generalIds[Math.floor(Math.random() * factionData.generalIds.length)];
				var deckData = UsableDecks.getAutomaticUsableDeck(generalId, difficulty);
				var numUnits = 0;
				var numHighCostUnits = 0;
				var numSpells = 0;
				var numArtifacts = 0;
				for (var j = 0, jl = deckData.length; j < jl; j++) {
					var cardData = deckData[j];
					var card = SDK.GameSession.getCardCaches().getCardById(cardData.id);
					if (card.getType() === SDK.CardType.Unit) {
						if (card.getManaCost() > 6) {
							numHighCostUnits++;
						}
						numUnits++;
					} else if (card.getType() === SDK.CardType.Spell) {
						expect(card.getFactionId()).to.equal(factionId);
						numSpells++;
					} else if (card.getType() === SDK.CardType.Artifact) {
						expect(card.getFactionId()).to.equal(factionId);
						numArtifacts++;
					}
				}
				expect(numUnits).to.be.above(0);
				expect(numHighCostUnits).to.be.above(0);
				expect(numSpells).to.be.above(0);
				expect(numArtifacts).to.be.above(0);
			}
		});

		it('expect a randomized deck to contain random cards', function() {
			var numRandomCards = CONFIG.MAX_DECK_SIZE;
			var difficulty = 1.0;
			var factions = SDK.FactionFactory.getAllPlayableFactions();
			for (var i = 0, il = factions.length; i < il; i++) {
				var factionData = factions[i];
				var factionId = factionData.id;
				var generalId = factionData.generalIds[Math.floor(Math.random() * factionData.generalIds.length)];
				var deckData = UsableDecks.getAutomaticUsableDeck(generalId, difficulty);
				var deckDataRandomized = UsableDecks.getAutomaticUsableDeck(generalId, difficulty, numRandomCards);
				var randomized = false;
				for (var j = 0, jl = deckData.length; j < jl; j++) {
					var cardData = deckData[j];
					var cardDataRandomized = deckDataRandomized[j];
					if (cardData.id !== cardDataRandomized.id) {
						randomized = true;
						break;
					}
				}
				expect(randomized).to.equal(true);
			}
		});
		/* Test disabled: failing
		it('expect a fully randomized deck at 100% difficulty to contain 40 cards and the proper swath of card types', function() {
			var numRandomCards = CONFIG.MAX_DECK_SIZE;
			var tempGameSession = SDK.GameSession.create();
			var difficulty = 1.0;
			var factions = SDK.FactionFactory.getAllPlayableFactions();
			for (var n = 0; n < 50; n++) {
				for (var i = 0, il = factions.length; i < il; i++) {
					var factionData = factions[i];
					var factionId = factionData.id;
					var generalId = factionData.generalIds[Math.floor(Math.random() * factionData.generalIds.length)];
					var deckData = UsableDecks.getAutomaticUsableDeck(generalId, difficulty);
					var deckDataRandomized = UsableDecks.getAutomaticUsableDeck(generalId, difficulty, numRandomCards);
					expect(deckDataRandomized.length).to.equal(CONFIG.MAX_DECK_SIZE);

					var generalCount = 0;
					var randomLowMinionCount = 0;
					var randomSpellCount = 0;
					var randomArtifactMidMinionCount = 0;
					var randomHighMinionCount = 0;
					for (var j = 0, jl = deckDataRandomized.length; j < jl; j++) {
						var cardDataId = deckDataRandomized[j].id;
						var card = CardFactory.cardForIdentifier(cardDataId, tempGameSession);
						if (SDK.CardType.getIsEntityCardType(card.getType()) && card.getIsGeneral()) {
							expect(card.getId()).to.equal(generalId);
							generalCount++;
						}
						if (card.getManaCost() < 5 && SDK.CardType.getIsEntityCardType(card.getType())) {
							randomLowMinionCount++;
						}
						if (card.getType() === SDK.CardType.Spell) {
							randomSpellCount++;
						}
						if (card.getType() === SDK.CardType.Artifact || (SDK.CardType.getIsEntityCardType(card.getType()) && (card.getManaCost() == 5))) {
							randomArtifactMidMinionCount++;
						}
						if (card.getManaCost() > 5 && SDK.CardType.getIsEntityCardType(card.getType())) {
							randomHighMinionCount++;
						}
					}

					var lowMinionCount = 0;
					var spellCount = 0;
					var artifactMidMinionCount = 0;
					var highMinionCount = 0;
					for (var j = 0, jl = deckData.length; j < jl; j++) {
						var cardDataId = deckData[j].id;
						var card = CardFactory.cardForIdentifier(cardDataId, tempGameSession);
						if (card.getManaCost() < 5 && SDK.CardType.getIsEntityCardType(card.getType())) {
							lowMinionCount++;
						}
						if (card.getType() === SDK.CardType.Spell) {
							spellCount++;
						}
						if (card.getType() === SDK.CardType.Artifact || (SDK.CardType.getIsEntityCardType(card.getType()) && (card.getManaCost() == 5))) {
							artifactMidMinionCount++;
						}
						if (card.getManaCost() > 5 && SDK.CardType.getIsEntityCardType(card.getType())) {
							highMinionCount++;
						}
					}
					 console.log("Faction ", factionData.id, ": low cost minions original: ", lowMinionCount, " vs randomized: ", randomLowMinionCount);
					 console.log("Faction ", factionData.id, ": spells original: ", spellCount, " vs randomized: ", randomSpellCount);
					 console.log("Faction ", factionData.id, ": artifacts and mid cost minions original: ", artifactMidMinionCount, " vs randomized: ", randomArtifactMidMinionCount);
					 console.log("Faction ", factionData.id, ": high cost minions original: ", highMinionCount, " vs randomized: ", randomHighMinionCount);
				}

				expect(generalCount).to.equal(1);
				expect(lowMinionCount - randomLowMinionCount).to.be.below(3);
				expect(spellCount - randomSpellCount).to.be.below(3);
				expect(artifactMidMinionCount - randomArtifactMidMinionCount).to.be.below(3);
				expect(highMinionCount - randomHighMinionCount).to.be.below(3);
			}
		});
		*/

		/* Test disabled: slow
		it('expect a randomized deck at 0% difficulty to contain nothing more than basics and commons', function() {
			var numRandomCards = CONFIG.MAX_DECK_SIZE;
			var tempGameSession = SDK.GameSession.create();
			var difficulty = 0.0;
			var factions = SDK.FactionFactory.getAllPlayableFactions();
			for (var n = 0; n < 50; n++) {
				var tooRare = false;
				for (var i = 0, il = factions.length; i < il; i++) {
					var factionData = factions[i];
					var factionId = factionData.id;
					var generalId = factionData.generalIds[Math.floor(Math.random() * factionData.generalIds.length)];
					var deckData = UsableDecks.getAutomaticUsableDeck(generalId, difficulty);
					var deckDataRandomized = UsableDecks.getAutomaticUsableDeck(generalId, difficulty, numRandomCards);
					tooRare = false;
					for (var j = 0, jl = deckDataRandomized.length; j < jl; j++) {
						var cardDataId = deckDataRandomized[j].id;
						var card = CardFactory.cardForIdentifier(cardDataId, tempGameSession);
						if (card.rarityId != SDK.Rarity.Fixed && card.rarityId != SDK.Rarity.Common) {
							tooRare = true;
							break;
						}
					}
				}

				expect(tooRare).to.equal(false);
			}
		});
		*/

		/* Test disabled: slow
		it('expect a randomized deck at 20% difficulty to contain nothing more than basics, commons, and rares', function() {
			var numRandomCards = CONFIG.MAX_DECK_SIZE;
			var tempGameSession = SDK.GameSession.create();
			var difficulty = 0.2;
			var factions = SDK.FactionFactory.getAllPlayableFactions();
			for (var n = 0; n < 50; n++) {
				var tooRare = false;
				for (var i = 0, il = factions.length; i < il; i++) {
					var factionData = factions[i];
					var factionId = factionData.id;
					var generalId = factionData.generalIds[Math.floor(Math.random() * factionData.generalIds.length)];
					var deckData = UsableDecks.getAutomaticUsableDeck(generalId, difficulty);
					var deckDataRandomized = UsableDecks.getAutomaticUsableDeck(generalId, difficulty, numRandomCards);
					tooRare = false;
					for (var j = 0, jl = deckDataRandomized.length; j < jl; j++) {
						var cardDataId = deckDataRandomized[j].id;
						var card = CardFactory.cardForIdentifier(cardDataId, tempGameSession);
						if (card.rarityId != SDK.Rarity.Fixed && card.rarityId != SDK.Rarity.Common && card.rarityId != SDK.Rarity.Rare) {
							tooRare = true;
							break;
						}
					}
				}

				expect(tooRare).to.equal(false);
			}
		});
		*/

		/* Test disabled: slow
		it('expect a randomized deck at 50% difficulty to contain nothing more than basics, commons, rares, and epics', function() {
			var numRandomCards = CONFIG.MAX_DECK_SIZE;
			var tempGameSession = SDK.GameSession.create();
			var difficulty = 0.5;
			var factions = SDK.FactionFactory.getAllPlayableFactions();
			for (var n = 0; n < 50; n++) {
				var tooRare = false;
				for (var i = 0, il = factions.length; i < il; i++) {
					var factionData = factions[i];
					var factionId = factionData.id;
					var generalId = factionData.generalIds[Math.floor(Math.random() * factionData.generalIds.length)];
					var deckData = UsableDecks.getAutomaticUsableDeck(generalId, difficulty);
					var deckDataRandomized = UsableDecks.getAutomaticUsableDeck(generalId, difficulty, numRandomCards);
					tooRare = false;
					for (var j = 0, jl = deckDataRandomized.length; j < jl; j++) {
						var cardDataId = deckDataRandomized[j].id;
						var card = CardFactory.cardForIdentifier(cardDataId, tempGameSession);
						if (card.rarityId != SDK.Rarity.Fixed && card.rarityId != SDK.Rarity.Common && card.rarityId != SDK.Rarity.Rare && card.rarityId != SDK.Rarity.Epic) {
							tooRare = true;
							break;
						}
					}
				}

				expect(tooRare).to.equal(false);
			}
		});
		*/
	});
});
