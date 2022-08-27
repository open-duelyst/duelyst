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
var ModifierRanged = require('app/sdk/modifiers/modifierRanged');
var ModifierForcefield = require('app/sdk/modifiers/modifierForcefield');
var ModifierFlying = require('app/sdk/modifiers/modifierFlying');
var ModifierTranscendance = require('app/sdk/modifiers/modifierTranscendance');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("bosses", function() {
	beforeEach(function () {

	});

	afterEach(function () {
		SDK.GameSession.reset();
	});
	it('expect bosses to not be dispellable', function() {
		var bosses = SDK.GameSession.getCardCaches().getFaction(SDK.Factions.Boss).getIsGeneral(true).getCards();
		//console.log(bosses[0].id);

		for(var i = 0; i < bosses.length; i++){
			var player1Deck = [
				bosses[i]
			];

			var player2Deck = [
				{id: SDK.Cards.Faction1.General}
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var boss = gameSession.getGeneralForPlayer1();

			player1.remainingMana = 9;
			//console.log(bosses[i].name, " is now being tested");

			var startingModifiers = boss.getModifiers().length;
			//console.log("Starting modifiers: ", boss.getModifiers());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
			gameSession.executeAction(playCardFromHandAction);

			//console.log("Ending modifiers: ", boss.getModifiers());
			var endingModifiers = boss.getModifiers().length;

			expect(startingModifiers + 1).to.equal(endingModifiers);
		}
	});

	it('expect boreal juggernaut to only be able to move 1 space at a time', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss1}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		var action = boss.actionMove({ x: 2, y: 2 });
		gameSession.executeAction(action);
		expect(action.getIsValid()).to.equal(false);
		expect(boss.getPosition().x).to.equal(0);
		expect(boss.getPosition().y).to.equal(2);

		var action = boss.actionMove({ x: 1, y: 2 });
		gameSession.executeAction(action);
		expect(action.getIsValid()).to.equal(true);
		expect(boss.getPosition().x).to.equal(1);
		expect(boss.getPosition().y).to.equal(2);
	});
	it('expect boreal juggernaut to stun enemies hit', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss1}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var boss = gameSession.getGeneralForPlayer1();

		var golem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 1, 1, gameSession.getPlayer2Id());

		player1.remainingMana = 9;
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		var action = boss.actionAttack(golem);
		gameSession.executeAction(action);

		expect(action.getIsValid()).to.equal(true);
		expect(golem.hasActiveModifierClass(SDK.ModifierStunned)).to.equal(true);
	});
	it('expect umbra to spawn a 1 health clone whenever you summon a minion', function() {
		var player1Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		var player2Deck = [
			{id: SDK.Cards.Boss.Boss2}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var boss = gameSession.getGeneralForPlayer1();
		player1.remainingMana = 9;

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
		gameSession.executeAction(playCardFromHandAction);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.IroncliffeGuardian}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
		gameSession.executeAction(playCardFromHandAction);

		var clone = board.getFriendlyEntitiesAroundEntity(gameSession.getGeneralForPlayer2());

		expect(clone[0].getHP()).to.equal(1);
		expect(clone[0].getId()).to.equal(SDK.Cards.Faction1.IroncliffeGuardian);
	});
	it('expect cade to teleport any minion he hits to a random space', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss4}
		];

		var player2Deck = [
			{id: SDK.Cards.Boss.Boss4}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var boss = gameSession.getGeneralForPlayer1();

		var golem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 1, 1, gameSession.getPlayer2Id());

		player1.remainingMana = 9;
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		var action = boss.actionAttack(golem);
		gameSession.executeAction(action);

		expect(action.getIsValid()).to.equal(true);
		var updatedGolem = board.getUnitAtPosition({x:1,y:1});
		expect(updatedGolem).to.equal(undefined);
	});
	it('expect cade to teleport generals he hits to a random space', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss4}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var boss = gameSession.getGeneralForPlayer1();

		var action = boss.actionMove({ x: 2, y: 2 });
		gameSession.executeAction(action);
		boss.refreshExhaustion();
		var action = boss.actionMove({ x: 4, y: 2 });
		gameSession.executeAction(action);
		boss.refreshExhaustion();
		var action = boss.actionMove({ x: 6, y: 2 });
		gameSession.executeAction(action);
		boss.refreshExhaustion();
		var action = boss.actionMove({ x: 7, y: 2 });
		gameSession.executeAction(action);

		var action = boss.actionAttack(gameSession.getGeneralForPlayer2());
		gameSession.executeAction(action);

		expect(action.getIsValid()).to.equal(true);
		var updatedGeneral = board.getUnitAtPosition({x:8,y:2});
		expect(updatedGeneral).to.equal(undefined);
	});
	it('expect cade to teleport your general when you cast spells on it', function() {
		var player1Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		var player2Deck = [
			{id: SDK.Cards.Boss.Boss4}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var boss = gameSession.getGeneralForPlayer1();
		player1.remainingMana = 9;

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
		gameSession.executeAction(playCardFromHandAction);

		var updatedGeneral = board.getUnitAtPosition({x:0,y:2});
		expect(updatedGeneral).to.equal(undefined);
	});
	it('expect shinkage zendo to be unable to move', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss5}
		];

		var player2Deck = [
			{id: SDK.Cards.Boss.Boss5}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var boss = gameSession.getGeneralForPlayer1();

		var action = boss.actionMove({ x: 2, y: 2 });
		gameSession.executeAction(action);
		expect(action.getIsValid()).to.equal(false);
		expect(boss.getPosition().x).to.equal(0);
		expect(boss.getPosition().y).to.equal(2);

		var action = boss.actionMove({ x: 1, y: 2 });
		gameSession.executeAction(action);
		expect(action.getIsValid()).to.equal(false);
		expect(boss.getPosition().x).to.equal(0);
		expect(boss.getPosition().y).to.equal(2);
	});
	it('expect shinkage zendo to be immune to damage if he has minions in play', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss5}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();
		player1.remainingMana = 9;

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.IroncliffeGuardian}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
		gameSession.executeAction(playCardFromHandAction);

		gameSession.executeAction(gameSession.actionEndTurn());

		player2.remainingMana = 9;
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.ChromaticCold}));
		var playCardFromHandAction = player2.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player2.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		expect(boss.getDamage()).to.equal(0);

		player2.remainingMana = 9;

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.DarkTransformation}));
		var playCardFromHandAction = player2.actionPlayCardFromHand(0, 1, 1);
		gameSession.executeAction(playCardFromHandAction);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player2.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		expect(boss.getDamage()).to.equal(3);
	});
	it('expect shinkage zendo to make the enemy general act like a battlepet', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss5}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();
		player1.remainingMana = 9;

		player1.remainingMana = 9;
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		expect(gameSession.getGeneralForPlayer2().getPosition().x == 8 || gameSession.getGeneralForPlayer2().getPosition().y == 2).to.equal(true);

		gameSession.executeAction(gameSession.actionEndTurn());

		expect(gameSession.getGeneralForPlayer2().getPosition().x !== 8 || gameSession.getGeneralForPlayer2().getPosition().y !== 2).to.equal(true);
	});
	it('expect caliber0 to equip artifacts every turn after the second', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss7}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		player1.remainingMana = 9;

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		gameSession.executeAction(gameSession.actionEndTurn());
		gameSession.executeAction(gameSession.actionEndTurn());

		expect(gameSession.getGeneralForPlayer1().getArtifactModifiersGroupedByArtifactCard().length).to.equal(1);
	});
	it('expect monolith guardian to steal enemy units he kills', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss8}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();
		player1.remainingMana = 9;

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		var planarScout = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.PlanarScout}, 0, 1, gameSession.getPlayer2Id());

		var action = boss.actionAttack(planarScout);
		gameSession.executeAction(action);

		var newUnit = board.getFriendlyEntitiesAroundEntity(gameSession.getGeneralForPlayer1());
		expect(newUnit[0].getId()).to.equal(SDK.Cards.Neutral.PlanarScout);
		expect(newUnit[0].ownerId).to.equal('player1_id');
	});
	it('expect monolith guardian to respawn at 4/20 stats when dying for the first time', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss8}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();
		player1.remainingMana = 9;

		boss.setDamage(13);

		expect(boss.getHP()).to.equal(2);
		expect(boss.getATK()).to.equal(2);

		player1.remainingMana = 9;
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		expect(boss.getHP()).to.equal(20);
		expect(boss.getATK()).to.equal(4);
	});
	it('expect monolith guardian to be killable again after he transforms into a 4/20', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss8}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();
		player1.remainingMana = 9;

		boss.setDamage(13);

		expect(boss.getHP()).to.equal(2);
		expect(boss.getATK()).to.equal(2);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		boss.setDamage(18);

		expect(boss.getHP()).to.equal(2);
		expect(boss.getATK()).to.equal(4);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		expect(boss.getHP()).to.equal(0);
		expect(boss.getIsRemoved()).to.equal(true);
	});
	it('expect wujin to spawn 1/5 provoke decoys when he attacks', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss9}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		var action = boss.actionMove({ x: 8, y: 3 });
		gameSession.executeAction(action);
		var action = boss.actionAttack(gameSession.getGeneralForPlayer2());
		gameSession.executeAction(action);

		var newUnit = board.getFriendlyEntitiesAroundEntity(gameSession.getGeneralForPlayer1());
		expect(newUnit[0].getId()).to.equal(SDK.Cards.Boss.Boss9Clone);
		expect(newUnit[0].ownerId).to.equal('player1_id');
		expect(newUnit[0].getHP()).to.equal(5);
		expect(newUnit[0].getATK()).to.equal(1);
		expect(newUnit[0].hasActiveModifierClass(SDK.ModifierProvoke)).to.equal(true);
	});
	it('expect wujin to spawn 1/5 provoke decoys when he is attacked', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss9}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		var valeHunter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ValeHunter}, 5, 1, gameSession.getPlayer2Id());

		gameSession.executeAction(gameSession.actionEndTurn());

		var action = valeHunter.actionAttack(boss);
		gameSession.executeAction(action);

		var newUnit = board.getFriendlyEntitiesAroundEntity(gameSession.getGeneralForPlayer1());
		expect(newUnit[0].getId()).to.equal(SDK.Cards.Boss.Boss9Clone);
		expect(newUnit[0].ownerId).to.equal('player1_id');
		expect(newUnit[0].getHP()).to.equal(5);
		expect(newUnit[0].getATK()).to.equal(1);
		expect(newUnit[0].hasActiveModifierClass(SDK.ModifierProvoke)).to.equal(true);
	});
	it('expect wujin to teleport to a random corner at the end of turn', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss9}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		gameSession.executeAction(gameSession.actionEndTurn());

		var generalInCorner = false;
		var corner1 = board.getUnitAtPosition({x:0, y:0});
		var corner2 = board.getUnitAtPosition({x:0, y:4});
		var corner3 = board.getUnitAtPosition({x:8, y:0});
		var corner4 = board.getUnitAtPosition({x:8, y:4});

		if(corner1 != null){
		  if(corner1.getId() === SDK.Cards.Boss.Boss9){
			generalInCorner = true;
		  }
		}
		if(corner2 != null){
		  if(corner2.getId() === SDK.Cards.Boss.Boss9){
			generalInCorner = true;
		  }
		}
		if(corner3 != null){
		  if(corner3.getId() === SDK.Cards.Boss.Boss9){
			generalInCorner = true;
		  }
		}
		if(corner4 != null){
		  if(corner4.getId() === SDK.Cards.Boss.Boss9){
			generalInCorner = true;
		  }
		}

		expect(generalInCorner).to.equal(true);
	});
	it('expect d3c to transform into d3cepticle when killed', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss6}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		var newBoss = UtilsSDK.getEntityOnBoardById(SDK.Cards.Boss.Boss6Prime);
		expect(newBoss.getId()).to.equal(SDK.Cards.Boss.Boss6Prime);
	});
	it('expect d3c to be immune to damage with a mech peice in play', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss6}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		var mech = UtilsSDK.applyCardToBoard({id: SDK.Cards.Boss.Boss6Helm}, 5, 1, gameSession.getPlayer1Id());

		player1.remainingMana = 9;
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		expect(board.getUnitAtPosition({x:0, y:2}).getHP()).to.equal(1);
	});
	it('expect solfist to reactivate whenever he kills a minion', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss10}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		var valeHunter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ValeHunter}, 1, 1, gameSession.getPlayer2Id());

		player1.remainingMana = 9;
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		var action = boss.actionAttack(valeHunter);
		gameSession.executeAction(action);

		var action = boss.actionMove({ x: 2, y: 2 });
		gameSession.executeAction(action);

		expect(boss.getPosition().x).to.equal(2);
		expect(boss.getPosition().y).to.equal(2);
		expect(valeHunter.getIsRemoved()).to.equal(true);
	});
	it('expect solfist to damage himself and all nearby enemies at the end of each turn', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss10}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		var highHP = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WhistlingBlade}, 1, 1, gameSession.getPlayer2Id());

		player1.remainingMana = 9;
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		gameSession.executeAction(gameSession.actionEndTurn());
		expect(boss.getDamage()).to.equal(1);
		expect(highHP.getDamage()).to.equal(1);

		gameSession.executeAction(gameSession.actionEndTurn());
		gameSession.executeAction(gameSession.actionEndTurn());
		expect(boss.getDamage()).to.equal(3);
		expect(highHP.getDamage()).to.equal(3);

		gameSession.executeAction(gameSession.actionEndTurn());
		gameSession.executeAction(gameSession.actionEndTurn());
		expect(boss.getDamage()).to.equal(7);
		expect(highHP.getDamage()).to.equal(7);
	});
	it('expect automaton 8s ranged attack to damage enemies in an area and take an equal amount himself', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss11}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		var highHP = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WhistlingBlade}, 8, 1, gameSession.getPlayer2Id());
		var highHP2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WhistlingBlade}, 8, 3, gameSession.getPlayer2Id());

		player1.remainingMana = 9;
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		var action = boss.actionAttack(gameSession.getGeneralForPlayer2());
		gameSession.executeAction(action);

		expect(highHP.getDamage()).to.equal(3);
		expect(highHP2.getDamage()).to.equal(3);
		expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(3);
		expect(boss.getDamage()).to.equal(9);
	});
	it('expect orias to gain attack anytime he or his minions are damaged', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss12}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		var highHP = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WhistlingBlade}, 8, 1, gameSession.getPlayer1Id());
		var highHP2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WhistlingBlade}, 8, 3, gameSession.getPlayer1Id());

		player1.remainingMana = 9;
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 1);
		gameSession.executeAction(playCardFromHandAction);

		expect(boss.getATK()).to.equal(2);
	});
	it('expect malyk to let the opponent draw a card whenever they play a minion', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss13}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		gameSession.executeAction(gameSession.actionEndTurn());

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
		var playCardFromHandAction = player2.actionPlayCardFromHand(0, 7, 2);
		gameSession.executeAction(playCardFromHandAction);

		var hand = player2.getDeck().getCardsInHand();
		expect(hand[0].getId()).to.equal(SDK.Cards.Spell.PhoenixFire);
	});
	it('expect malyk to summon a 3/3 ooz whenever the opponent overdraws', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss13}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, false);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		var spelljammer = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Spelljammer}, 8, 1, gameSession.getPlayer1Id());

		gameSession.executeAction(gameSession.actionEndTurn());

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.ChromaticCold}));
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.ChromaticCold}));
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.ChromaticCold}));
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.ChromaticCold}));
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
		var playCardFromHandAction = player2.actionPlayCardFromHand(5, 7, 2);
		gameSession.executeAction(playCardFromHandAction);

		gameSession.executeAction(gameSession.actionEndTurn());

		var ooz = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction4.Ooz);
		expect(ooz[0].getId()).to.equal(SDK.Cards.Faction4.Ooz);
	});
	it('expect archonis to deal damage equal to unspent mana', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss14}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		gameSession.executeAction(gameSession.actionEndTurn());
		gameSession.executeAction(gameSession.actionEndTurn());

		expect(boss.getDamage()).to.equal(7);
		expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(3);
	});
	it('expect paragon of light to gain/lose modifiers at certain HP thresholds', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss15}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;

		expect(boss.hasModifierClass(ModifierRanged)).to.equal(false);
		expect(boss.hasModifierClass(ModifierForcefield)).to.equal(false);
		expect(boss.hasModifierClass(ModifierTranscendance)).to.equal(false);
		expect(boss.hasModifierClass(ModifierFlying)).to.equal(false);

		var damageAction = new SDK.DamageAction(gameSession);
		damageAction.setTarget(boss);
		damageAction.setDamageAmount(5);
		UtilsSDK.executeActionWithoutValidation(damageAction);

		expect(boss.hasModifierClass(ModifierRanged)).to.equal(true);
		expect(boss.hasModifierClass(ModifierForcefield)).to.equal(true);
		expect(boss.hasModifierClass(ModifierTranscendance)).to.equal(false);
		expect(boss.hasModifierClass(ModifierFlying)).to.equal(false);

		var damageAction = new SDK.DamageAction(gameSession);
		damageAction.setTarget(boss);
		damageAction.setDamageAmount(5);
		UtilsSDK.executeActionWithoutValidation(damageAction);

		var damageAction = new SDK.DamageAction(gameSession);
		damageAction.setTarget(boss);
		damageAction.setDamageAmount(5);
		UtilsSDK.executeActionWithoutValidation(damageAction);

		expect(boss.hasModifierClass(ModifierRanged)).to.equal(true);
		expect(boss.hasModifierClass(ModifierForcefield)).to.equal(true);
		expect(boss.hasModifierClass(ModifierTranscendance)).to.equal(true);
		expect(boss.hasModifierClass(ModifierFlying)).to.equal(false);

		var damageAction = new SDK.DamageAction(gameSession);
		damageAction.setTarget(boss);
		damageAction.setDamageAmount(5);
		UtilsSDK.executeActionWithoutValidation(damageAction);

		expect(boss.hasModifierClass(ModifierRanged)).to.equal(true);
		expect(boss.hasModifierClass(ModifierForcefield)).to.equal(true);
		expect(boss.hasModifierClass(ModifierTranscendance)).to.equal(true);
		expect(boss.hasModifierClass(ModifierFlying)).to.equal(true);

		var damageAction = new SDK.HealAction(gameSession);
		damageAction.setTarget(boss);
		damageAction.setHealAmount(5);
		UtilsSDK.executeActionWithoutValidation(damageAction);

		expect(boss.hasModifierClass(ModifierRanged)).to.equal(true);
		expect(boss.hasModifierClass(ModifierForcefield)).to.equal(true);
		expect(boss.hasModifierClass(ModifierTranscendance)).to.equal(true);
		expect(boss.hasModifierClass(ModifierFlying)).to.equal(false);

		var damageAction = new SDK.HealAction(gameSession);
		damageAction.setTarget(boss);
		damageAction.setHealAmount(5);
		UtilsSDK.executeActionWithoutValidation(damageAction);

		expect(boss.hasModifierClass(ModifierRanged)).to.equal(true);
		expect(boss.hasModifierClass(ModifierForcefield)).to.equal(true);
		expect(boss.hasModifierClass(ModifierTranscendance)).to.equal(false);
		expect(boss.hasModifierClass(ModifierFlying)).to.equal(false);

		var damageAction = new SDK.HealAction(gameSession);
		damageAction.setTarget(boss);
		damageAction.setHealAmount(5);
		UtilsSDK.executeActionWithoutValidation(damageAction);

		expect(boss.hasModifierClass(ModifierRanged)).to.equal(true);
		expect(boss.hasModifierClass(ModifierForcefield)).to.equal(false);
		expect(boss.hasModifierClass(ModifierTranscendance)).to.equal(false);
		expect(boss.hasModifierClass(ModifierFlying)).to.equal(false);

		var damageAction = new SDK.HealAction(gameSession);
		damageAction.setTarget(boss);
		damageAction.setHealAmount(5);
		UtilsSDK.executeActionWithoutValidation(damageAction);

		expect(boss.hasModifierClass(ModifierRanged)).to.equal(false);
		expect(boss.hasModifierClass(ModifierForcefield)).to.equal(false);
		expect(boss.hasModifierClass(ModifierTranscendance)).to.equal(false);
		expect(boss.hasModifierClass(ModifierFlying)).to.equal(false);
	});
	it('expect scion of the void to deal double damage on counter attacks', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss16}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;
		var highHP = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WhistlingBlade}, 1, 1, gameSession.getPlayer2Id());

		var action = boss.actionAttack(highHP);
		gameSession.executeAction(action);

		expect(highHP.getDamage()).to.equal(2);

		gameSession.executeAction(gameSession.actionEndTurn());
		var action = highHP.actionAttack(boss);
		gameSession.executeAction(action);

		expect(highHP.getDamage()).to.equal(6);
	});
	it('expect scion of the void to steal health when attacking', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss16}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;
		var highHP = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WhistlingBlade}, 1, 1, gameSession.getPlayer2Id());

		boss.setDamage(10);

		var action = boss.actionAttack(highHP);
		gameSession.executeAction(action);

		expect(boss.getDamage()).to.equal(10);

		gameSession.executeAction(gameSession.actionEndTurn());
		var action = highHP.actionAttack(boss);
		gameSession.executeAction(action);

		expect(boss.getDamage()).to.equal(8);
	});

	/* Test disabled: inconsistent
	it('expect high templar kron to spawn prisoners when killing enemies', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss17}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;
		var mantis = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.PiercingMantis}, 1, 1, gameSession.getPlayer2Id());

		var action = boss.actionAttack(mantis);
		gameSession.executeAction(action);

		var prisoner = board.getUnitAtPosition({x:1, y:1});

		expect(prisoner.getATK()).to.equal(2);
		expect(prisoner.getHP()).to.equal(2);
		expect(prisoner.ownerId).to.equal('player1_id');
	});
	*/

	it('expect high templar kron to have cheaper spells', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss17}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));

		var hand = player1.getDeck().getCardsInHand();
		expect(hand[0].getId()).to.equal(SDK.Cards.Spell.PhoenixFire);

		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
		gameSession.executeAction(playCardFromHandAction);

		expect(player1.getRemainingMana()).to.equal(9);
	});
	it('expect megapenti to make all minions he summons from hand have rebirth: serpenti', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss18}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.PiercingMantis}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
		gameSession.executeAction(playCardFromHandAction);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Tempest}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
		gameSession.executeAction(playCardFromHandAction);

		gameSession.executeAction(gameSession.actionEndTurn());
		gameSession.executeAction(gameSession.actionEndTurn());

		var serpenti = board.getUnitAtPosition({x:1,y:1});
		expect(serpenti.getId()).to.equal(SDK.Cards.Neutral.Serpenti);
	});
	it('expect rin the shadowsworn to spawn wraithlings with grow +1/+1 when taking damage', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss19}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Tempest}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
		gameSession.executeAction(playCardFromHandAction);

		var wraithlings = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction4.Wraithling);
		expect(wraithlings[0].getHP()).to.equal(1);
		expect(wraithlings[0].getATK()).to.equal(1);
		expect(wraithlings[1].getHP()).to.equal(1);
		expect(wraithlings[1].getATK()).to.equal(1);

		gameSession.executeAction(gameSession.actionEndTurn());
		gameSession.executeAction(gameSession.actionEndTurn());

		expect(wraithlings.length).to.equal(2);
		expect(wraithlings[0].getHP()).to.equal(2);
		expect(wraithlings[0].getATK()).to.equal(2);
		expect(wraithlings[1].getHP()).to.equal(2);
		expect(wraithlings[1].getATK()).to.equal(2);
	});
	it('expect skyfall tyrant to equip frost armor at the beginning of every turn that reduces damage by 1 and returns 1 damage to the attacker', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss20}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;

		gameSession.executeAction(gameSession.actionEndTurn());
		gameSession.executeAction(gameSession.actionEndTurn());

		expect(gameSession.getGeneralForPlayer1().getArtifactModifiersGroupedByArtifactCard().length).to.equal(1);

		gameSession.executeAction(gameSession.actionEndTurn());

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player2.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		expect(boss.getDamage()).to.equal(2);
		expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(1);
	});
	it('expect cindera to teleport randomly at the start of every turn', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss21}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;

		gameSession.executeAction(gameSession.actionEndTurn());
		gameSession.executeAction(gameSession.actionEndTurn());

		var oldSpot = board.getUnitAtPosition({x:0, y:2});
		expect(oldSpot).to.equal(undefined);
	});
	it('expect cindera to give all minions summoned dying wish: explode 2 damage to enemies', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss21}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AerialRift}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
		gameSession.executeAction(playCardFromHandAction);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.PiercingMantis}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 1);
		gameSession.executeAction(playCardFromHandAction);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Tempest}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
		gameSession.executeAction(playCardFromHandAction);

		expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(4);
	});
	it('expect crystalline champion to give all minions summoned +2/-2', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss22}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.WhistlingBlade}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
		gameSession.executeAction(playCardFromHandAction);

		var blade = board.getUnitAtPosition({x:1,y:1});

		expect(blade.getHP()).to.equal(13);
		expect(blade.getATK()).to.equal(4);

		gameSession.executeAction(gameSession.actionEndTurn());

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Neutral.Yun}));
		var playCardFromHandAction = player2.actionPlayCardFromHand(0, 8, 1);
		gameSession.executeAction(playCardFromHandAction);

		var yun = board.getUnitAtPosition({x:8,y:1});
		expect(yun.getHP()).to.equal(2);
		expect(yun.getATK()).to.equal(7);
	});
	it('expect xel to damage enemy player at the end of their turn equal to total number of minions they own', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss23}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;

		gameSession.executeAction(gameSession.actionEndTurn());

		var mantis = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.PiercingMantis}, 1, 1, gameSession.getPlayer2Id());
		var mantis2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.PiercingMantis}, 3, 1, gameSession.getPlayer2Id());
		var mantis3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.PiercingMantis}, 4, 1, gameSession.getPlayer2Id());

		gameSession.executeAction(gameSession.actionEndTurn());

		expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(3);
	});
	it('expect xel to have deathwatch: deal 1 damage to enemy general, heal 1 health', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss23}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;

		var youngSilithar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.YoungSilithar}, 0, 1, gameSession.getPlayer2Id());
		var abyssalCrawler1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalCrawler}, 1, 1, gameSession.getPlayer1Id());
		abyssalCrawler1.refreshExhaustion();

		youngSilithar.setDamage(2);
		gameSession.getGeneralForPlayer1().setDamage(5);

		var action = abyssalCrawler1.actionAttack(youngSilithar);
		gameSession.executeAction(action);

		expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(27);
		expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(23);
	});
	it('expect skurge to summon valiant when at 15 health or under and to then be immune to damage until valiant dies', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss24}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;

		boss.setDamage(9);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		var newBoss = UtilsSDK.getEntityOnBoardById(SDK.Cards.Boss.Boss24Valiant);
		expect(newBoss.getId()).to.equal(SDK.Cards.Boss.Boss24Valiant);

		expect(boss.getDamage()).to.equal(12);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		expect(boss.getDamage()).to.equal(12);

		newBoss.setDamage(14);
		var valiantPos = newBoss.getPosition();

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, valiantPos.x, valiantPos.y);
		gameSession.executeAction(playCardFromHandAction);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		expect(boss.getDamage()).to.equal(15);
	});
	it('expect skurge to take 3 damage at the start of its turn and gain +1 attack', function() {
		var player1Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		var player2Deck = [
			{id: SDK.Cards.Boss.Boss24}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer2();

		gameSession.executeAction(gameSession.actionEndTurn());

		expect(boss.getDamage()).to.equal(3);
		expect(boss.getATK()).to.equal(2);
	});
	it('expect shadow lord to give friendly minions +1/+1 when they move', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss25}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;

		boss.setDamage(9);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.SaberspineTiger}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
		gameSession.executeAction(playCardFromHandAction);

		var tiger = board.getUnitAtPosition({x:1, y:1});

		var action = tiger.actionMove({ x: 3, y: 1 });
		gameSession.executeAction(action);
		expect(tiger.getATK()).to.equal(4);
		expect(tiger.getHP()).to.equal(3);
	});
	it('expect shadow lord to summon a kaido assassin behind enemy minions when they move', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss25}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		gameSession.executeAction(gameSession.actionEndTurn());

		player2.remainingMana = 9;

		boss.setDamage(9);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Neutral.SaberspineTiger}));
		var playCardFromHandAction = player2.actionPlayCardFromHand(0, 7, 1);
		gameSession.executeAction(playCardFromHandAction);

		var tiger = board.getUnitAtPosition({x:7, y:1});

		var action = tiger.actionMove({ x: 5, y: 1 });
		gameSession.executeAction(action);

		var kaido = board.getUnitAtPosition({x:6, y:1});
		expect(kaido.getBaseCardId()).to.equal(SDK.Cards.Faction2.KaidoAssassin);
	});
	it('expect archmagus vol to damage all enemy minions when he attacks', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss26}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;

		var golem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 1, 1, gameSession.getPlayer2Id());
		var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 4, 1, gameSession.getPlayer2Id());
		var golem3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 6, 1, gameSession.getPlayer1Id());

		var action = boss.actionAttack(golem);
		gameSession.executeAction(action);

		expect(golem.getDamage()).to.equal(2);
		expect(golem2.getDamage()).to.equal(2);
		expect(golem3.getDamage()).to.equal(0);
	});
	it('expect zane to deal double damage to vol', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss26}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;

		var zane = UtilsSDK.applyCardToBoard({id: SDK.Cards.Boss.Boss26Companion}, 1, 1, gameSession.getPlayer2Id());

		gameSession.executeAction(gameSession.actionEndTurn());

		expect(boss.getDamage()).to.equal(6);
	});
	it('expect zane to die if his attack exceeds 6 and then for zanes general to die', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss26}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;

		var zane = UtilsSDK.applyCardToBoard({id: SDK.Cards.Boss.Boss26Companion}, 1, 1, gameSession.getPlayer2Id());

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.LastingJudgement}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
		gameSession.executeAction(playCardFromHandAction);

		expect(zane.getIsRemoved()).to.equal(false);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.LastingJudgement}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
		gameSession.executeAction(playCardFromHandAction);

		expect(zane.getIsRemoved()).to.equal(true);
		expect(gameSession.getGeneralForPlayer2().getIsRemoved()).to.equal(true);
	});
	it('expect taskmaster beatrix to make both generals unable to move', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss27}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;

		var action = boss.actionMove({ x: 2, y: 2 });
		gameSession.executeAction(action);

		expect(action.getIsValid()).to.equal(false);

		gameSession.executeAction(gameSession.actionEndTurn());

		var action = gameSession.getGeneralForPlayer2().actionMove({ x: 6, y: 2 });
		gameSession.executeAction(action);

		expect(action.getIsValid()).to.equal(false);
	});
	it('expect taskmaster beatrix to make all minions behave like battle pets', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss27}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.RockPulverizer}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
		gameSession.executeAction(playCardFromHandAction);

		var rocky = board.getUnitAtPosition({x:1,y:1});

		gameSession.executeAction(gameSession.actionEndTurn());

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Neutral.RockPulverizer}));
		var playCardFromHandAction = player2.actionPlayCardFromHand(0, 7, 1);
		gameSession.executeAction(playCardFromHandAction);

		var rocky2 = board.getUnitAtPosition({x:7,y:1});

		gameSession.executeAction(gameSession.actionEndTurn());

		expect(rocky.getPosition().x !== 1 || rocky.getPosition().y !== 1).to.equal(true);

		gameSession.executeAction(gameSession.actionEndTurn());

		expect(rocky2.getPosition().x !== 7 || rocky2.getPosition().y !== 1).to.equal(true);
	});
	it('expect grym to deal 3 damage to a random minion and to heal 3 whenever a friendly minion dies', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss28}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;

		var rocky = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.RockPulverizer}, 1, 1, gameSession.getPlayer1Id());
		var rocky2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.RockPulverizer}, 3, 1, gameSession.getPlayer1Id());
		var rocky3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.RockPulverizer}, 5, 1, gameSession.getPlayer2Id());

		boss.setDamage(5);
		rocky.setDamage(3);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
		gameSession.executeAction(playCardFromHandAction);

		var totalDamage = rocky2.getDamage() + rocky3.getDamage();

		expect(totalDamage).to.equal(3);

		expect(boss.getDamage()).to.equal(2);
	});
	it('expect nahlgol to summon a sand tile randomly at the start of their turn', function() {
		var player1Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		var player2Deck = [
			{id: SDK.Cards.Boss.Boss29}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;

		gameSession.executeAction(gameSession.actionEndTurn());

		var sand = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Tile.SandPortal);
		expect(sand.length).to.equal(1);
	});
	it('expect wolfpunch to gain +4 attack on opponents turn and to summon a fox ravager nearby', function() {
		var player1Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		var player2Deck = [
			{id: SDK.Cards.Boss.Boss30}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer2();

		player1.remainingMana = 9;

		expect(boss.getATK()).to.equal(6);

		gameSession.executeAction(gameSession.actionEndTurn());

		expect(boss.getATK()).to.equal(2);

		var fox = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction6.WolfAspect);
		expect(fox.length).to.equal(1);
	});
	it('expect unhallowed to spawn a random haunt whenever she takes damage', function() {
		var player1Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		var player2Deck = [
			{id: SDK.Cards.Boss.Boss31}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer2();

		player1.remainingMana = 9;

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
		gameSession.executeAction(playCardFromHandAction);

		var haunt1 = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Boss.Boss31Haunt1);
		var haunt2 = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Boss.Boss31Haunt2);
		var haunt3 = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Boss.Boss31Haunt3);
		var hauntcount = haunt1.length + haunt2.length + haunt3.length;
		expect(hauntcount).to.equal(1);
	});
	it('expect the first candy panda to give +5 health and draw a card when the general attacks', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss31}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Boss.Boss31Treat1}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
		gameSession.executeAction(playCardFromHandAction);

		var rocky = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.RockPulverizer}, 7, 1, gameSession.getPlayer1Id());

		gameSession.executeAction(gameSession.actionEndTurn());

		gameSession.getGeneralForPlayer2().setDamage(10);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Neutral.RockPulverizer}));

		var action = gameSession.getGeneralForPlayer2().actionAttack(rocky);
		gameSession.executeAction(action);

		var treat = board.getUnitAtPosition({x:1,y:1});

		expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(6);
		expect(treat.getHP()).to.equal(2);
		expect(treat.getATK()).to.equal(3);
		var hand = player2.getDeck().getCardsInHand();
		expect(hand[0].getId()).to.equal(SDK.Cards.Neutral.RockPulverizer);
	});
	it('expect the second candy panda to give +2/+2 to the minion that triggers the flip and to draw a card', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss31}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Boss.Boss31Treat2}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
		gameSession.executeAction(playCardFromHandAction);

		gameSession.executeAction(gameSession.actionEndTurn());

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Neutral.RockPulverizer}));

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Neutral.RockPulverizer}));
		var playCardFromHandAction = player2.actionPlayCardFromHand(0, 7, 1);
		gameSession.executeAction(playCardFromHandAction);

		var treat = board.getUnitAtPosition({x:1,y:1});
		var rocky = board.getUnitAtPosition({x:7,y:1});

		expect(rocky.getHP()).to.equal(6);
		expect(rocky.getATK()).to.equal(3);
		expect(treat.getHP()).to.equal(2);
		expect(treat.getATK()).to.equal(3);
		var hand = player2.getDeck().getCardsInHand();
		expect(hand[0].getId()).to.equal(SDK.Cards.Neutral.RockPulverizer);
	});
	it('expect the third candy panda to refund the mana of the spell that was cast and to draw a card', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss31}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer1();

		player1.remainingMana = 9;

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Boss.Boss31Treat3}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
		gameSession.executeAction(playCardFromHandAction);

		gameSession.executeAction(gameSession.actionEndTurn());
		player2.remainingMana = 9;

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Neutral.RockPulverizer}));

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player2.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		var treat = board.getUnitAtPosition({x:1,y:1});

		expect(player2.getRemainingMana()).to.equal(9);
		expect(treat.getHP()).to.equal(2);
		expect(treat.getATK()).to.equal(3);
		var hand = player2.getDeck().getCardsInHand();
		expect(hand[0].getId()).to.equal(SDK.Cards.Neutral.RockPulverizer);
	});
	it('expect the corporeal haunt to make the enemy generals minions cost 1 more to play and to draw 2 cards on death', function() {
		var player1Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		var player2Deck = [
			{id: SDK.Cards.Boss.Boss31}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer2();

		player1.remainingMana = 9;

		var haunt = UtilsSDK.applyCardToBoard({id: SDK.Cards.Boss.Boss31Haunt1}, 7, 1, gameSession.getPlayer1Id());

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.RockPulverizer}));
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.RockPulverizer}));
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.RockPulverizer}));

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Faction1.WindbladeAdept}));
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Artifact.StaffOfYKir}));

		var hand = player2.getDeck().getCardsInHand();
		expect(hand[0].getManaCost()).to.equal(2);
		expect(hand[1].getManaCost()).to.equal(3);
		expect(hand[2].getManaCost()).to.equal(2);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 1);
		gameSession.executeAction(playCardFromHandAction);

		var hand = player1.getDeck().getCardsInHand();
		expect(hand[0].getBaseCardId()).to.equal(SDK.Cards.Neutral.RockPulverizer);
		expect(hand[1].getBaseCardId()).to.equal(SDK.Cards.Neutral.RockPulverizer);
		expect(hand[2]).to.equal(undefined);
	});
	it('expect the enchanted haunt to make the enemy generals spells cost 1 more to play and to draw 2 cards on death', function() {
		var player1Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		var player2Deck = [
			{id: SDK.Cards.Boss.Boss31}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer2();

		player1.remainingMana = 9;

		var haunt = UtilsSDK.applyCardToBoard({id: SDK.Cards.Boss.Boss31Haunt2}, 7, 1, gameSession.getPlayer1Id());

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.RockPulverizer}));
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.RockPulverizer}));
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.RockPulverizer}));

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Faction1.WindbladeAdept}));
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Artifact.StaffOfYKir}));

		var hand = player2.getDeck().getCardsInHand();
		expect(hand[0].getManaCost()).to.equal(3);
		expect(hand[1].getManaCost()).to.equal(2);
		expect(hand[2].getManaCost()).to.equal(2);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 1);
		gameSession.executeAction(playCardFromHandAction);

		var hand = player1.getDeck().getCardsInHand();
		expect(hand[0].getBaseCardId()).to.equal(SDK.Cards.Neutral.RockPulverizer);
		expect(hand[1].getBaseCardId()).to.equal(SDK.Cards.Neutral.RockPulverizer);
		expect(hand[2]).to.equal(undefined);
	});
	it('expect the material haunt to make the enemy generals artifacts cost 1 more to play and to draw 2 cards on death', function() {
		var player1Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		var player2Deck = [
			{id: SDK.Cards.Boss.Boss31}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer2();

		player1.remainingMana = 9;

		var haunt = UtilsSDK.applyCardToBoard({id: SDK.Cards.Boss.Boss31Haunt3}, 7, 1, gameSession.getPlayer1Id());

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.RockPulverizer}));
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.RockPulverizer}));
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.RockPulverizer}));

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Faction1.WindbladeAdept}));
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Artifact.StaffOfYKir}));

		var hand = player2.getDeck().getCardsInHand();
		expect(hand[0].getManaCost()).to.equal(2);
		expect(hand[1].getManaCost()).to.equal(2);
		expect(hand[2].getManaCost()).to.equal(3);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 1);
		gameSession.executeAction(playCardFromHandAction);

		var hand = player1.getDeck().getCardsInHand();
		expect(hand[0].getBaseCardId()).to.equal(SDK.Cards.Neutral.RockPulverizer);
		expect(hand[1].getBaseCardId()).to.equal(SDK.Cards.Neutral.RockPulverizer);
		expect(hand[2]).to.equal(undefined);
	});
	it('expect santaur to spawn a frostfire elf at the start of his turn and to give the player a present spell when those die', function() {
		var player1Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		var player2Deck = [
			{id: SDK.Cards.Boss.Boss32}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer2();

		gameSession.executeAction(gameSession.actionEndTurn());

		var elf = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Boss.Boss32_2);
		expect(elf.length).to.equal(1);

		gameSession.executeAction(gameSession.actionEndTurn());

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, elf[0].getPosition().x, elf[0].getPosition().y);
		gameSession.executeAction(playCardFromHandAction);

		var hand = player1.getDeck().getCardsInHand();
		expect(hand[0].getBaseCardId()).to.equal(SDK.Cards.BossSpell.HolidayGift);

		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 1);
		gameSession.executeAction(playCardFromHandAction);

		expect(gameSession.getGeneralForPlayer1().getArtifactModifiersGroupedByArtifactCard().length).to.equal(1);
	});
	it('expect jingle bells to give your general flying', function() {
		var player1Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		var player2Deck = [
			{id: SDK.Cards.Boss.Boss32}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer2();

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.BossArtifact.FlyingBells}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 1);
		gameSession.executeAction(playCardFromHandAction);

		expect(gameSession.getGeneralForPlayer1().hasModifierClass(SDK.ModifierFlying)).to.equal(true);
	});
	it('expect lump of coal to block you from casting your bbs', function() {
		var player1Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		var player2Deck = [
			{id: SDK.Cards.Boss.Boss32}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer2();

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.BossArtifact.Coal}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 1);
		gameSession.executeAction(playCardFromHandAction);

		var squire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 1, 1, gameSession.getPlayer1Id());

		// cycle turns until you can use bloodborn spell
		gameSession.executeAction(gameSession.actionEndTurn());
		gameSession.executeAction(gameSession.actionEndTurn());
		gameSession.executeAction(gameSession.actionEndTurn());
		gameSession.executeAction(gameSession.actionEndTurn());

		var action = player1.actionPlaySignatureCard(1, 1);
		gameSession.executeAction(action);
		expect(action.getIsValid()).to.equal(false);

		expect(squire.getHP()).to.equal(4);
		expect(squire.getATK()).to.equal(1);
	});
	it('expect mistletoe to reduce the mana of all cards in your hand by 1', function() {
		var player1Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		var player2Deck = [
			{id: SDK.Cards.Boss.Boss32}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer2();

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.WindbladeAdept}));
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.StaffOfYKir}));

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.BossArtifact.CostReducer}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(3, 7, 1);
		gameSession.executeAction(playCardFromHandAction);

		var hand = player1.getDeck().getCardsInHand();
		expect(hand[0].getManaCost()).to.equal(1);
		expect(hand[1].getManaCost()).to.equal(1);
		expect(hand[2].getManaCost()).to.equal(1);
	});
	it('expect snowball to give your general ranged and -1 attack', function() {
		var player1Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		var player2Deck = [
			{id: SDK.Cards.Boss.Boss32}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer2();

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.BossArtifact.Snowball}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 1);
		gameSession.executeAction(playCardFromHandAction);

		expect(gameSession.getGeneralForPlayer1().hasModifierClass(SDK.ModifierRanged)).to.equal(true);
		expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(1);
	});
	it('expect legion heal clone to heal itself and allies at end of turn for 3', function() {
		var player1Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		var player2Deck = [
			{id: SDK.Cards.Boss.Boss33}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer2();

		var cornerBlock = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 0, 0, gameSession.getPlayer1Id());
		var cornerBlock2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 0, 4, gameSession.getPlayer1Id());
		var cornerBlock3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 8, 0, gameSession.getPlayer1Id());
		var cornerBlock4 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 8, 4, gameSession.getPlayer1Id());
		var clone = UtilsSDK.applyCardToBoard({id: SDK.Cards.Boss.Boss33_2}, 1, 1, gameSession.getPlayer2Id());

		boss.setDamage(7);
		gameSession.executeAction(gameSession.actionEndTurn());
		gameSession.executeAction(gameSession.actionEndTurn());
		expect(boss.getDamage()).to.equal(4);
		boss.setDamage(7);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
		gameSession.executeAction(playCardFromHandAction);

		var healclone = UtilsSDK.applyCardToBoard({id: SDK.Cards.Boss.Boss33_1}, 5, 1, gameSession.getPlayer2Id());
		var clone2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Boss.Boss33_3}, 3, 1, gameSession.getPlayer2Id());

		gameSession.executeAction(gameSession.actionEndTurn());
		gameSession.executeAction(gameSession.actionEndTurn());

		player1.remainingMana = 9;

		healclone.setDamage(6);
		clone.setDamage(6);
		clone2.setDamage(6);
		expect(healclone.getDamage()).to.equal(6);
		expect(clone.getDamage()).to.equal(6);
		gameSession.executeAction(gameSession.actionEndTurn());
		gameSession.executeAction(gameSession.actionEndTurn());
		expect(clone2.getDamage()).to.equal(3); //heal other non-general clone
		expect(clone.getDamage()).to.equal(3); //heal new general
		expect(healclone.getDamage()).to.equal(3); //heal self
	});
	it('expect legion attack clone to give +2 attack to itself and allies (and general control swaps to clone on death)', function() {
		var player1Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		var player2Deck = [
			{id: SDK.Cards.Boss.Boss33}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer2();
		player1.remainingMana = 9;

		var cornerBlock = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 0, 0, gameSession.getPlayer1Id());
		var cornerBlock2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 0, 4, gameSession.getPlayer1Id());
		var cornerBlock3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 8, 0, gameSession.getPlayer1Id());
		var cornerBlock4 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 8, 4, gameSession.getPlayer1Id());
		var clone = UtilsSDK.applyCardToBoard({id: SDK.Cards.Boss.Boss33_2}, 1, 1, gameSession.getPlayer2Id());

		clone.setDamage(7);

		expect(clone.getATK()).to.equal(4);
		expect(boss.getATK()).to.equal(4);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
		gameSession.executeAction(playCardFromHandAction);

		expect(boss.getATK()).to.equal(2);

		var newclone = UtilsSDK.applyCardToBoard({id: SDK.Cards.Boss.Boss33_2}, 1, 1, gameSession.getPlayer2Id());

		expect(newclone.getATK()).to.equal(4);
		expect(boss.getATK()).to.equal(4);

		boss.setDamage(7);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
		gameSession.executeAction(playCardFromHandAction);

		expect(newclone.getATK()).to.equal(4);
		expect(newclone.getIsGeneral()).to.equal(true);
	});
	it('expect legion to resummon its fallen clones in corners at the start of turn', function() {
		var player1Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		var player2Deck = [
			{id: SDK.Cards.Boss.Boss33}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer2();

		gameSession.executeAction(gameSession.actionEndTurn());

		var corner1 = board.getUnitAtPosition({x:0,y:0});
		var corner2 = board.getUnitAtPosition({x:8,y:0});
		var corner3 = board.getUnitAtPosition({x:0,y:4});
		var corner4 = board.getUnitAtPosition({x:8,y:4});

		var totalClones = 0;
		if(corner1 != undefined && (corner1.getBaseCardId() === SDK.Cards.Boss.Boss33_2 || corner1.getBaseCardId() === SDK.Cards.Boss.Boss33_3 || corner1.getBaseCardId() === SDK.Cards.Boss.Boss33_4)){
			totalClones++;
		}
		if(corner2 != undefined && (corner2.getBaseCardId() === SDK.Cards.Boss.Boss33_2 || corner2.getBaseCardId() === SDK.Cards.Boss.Boss33_3 || corner2.getBaseCardId() === SDK.Cards.Boss.Boss33_4)){
			totalClones++;
		}
		if(corner3 != undefined && (corner3.getBaseCardId() === SDK.Cards.Boss.Boss33_2 || corner3.getBaseCardId() === SDK.Cards.Boss.Boss33_3 || corner3.getBaseCardId() === SDK.Cards.Boss.Boss33_4)){
			totalClones++;
		}
		if(corner4 != undefined && (corner4.getBaseCardId() === SDK.Cards.Boss.Boss33_2 || corner4.getBaseCardId() === SDK.Cards.Boss.Boss33_3 || corner4.getBaseCardId() === SDK.Cards.Boss.Boss33_4)){
			totalClones++;
		}

		expect(totalClones).to.equal(3);
	});
	it('expect harmony to make all minions cost 0 mana', function() {
		var player1Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		var player2Deck = [
			{id: SDK.Cards.Boss.Boss34}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer2();
		player1.remainingMana = 9;

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.WindbladeAdept}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
		gameSession.executeAction(playCardFromHandAction);

		expect(player1.getRemainingMana()).to.equal(9);

		gameSession.executeAction(gameSession.actionEndTurn());

		player2.remainingMana = 9;
		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Faction1.WindbladeAdept}));
		var playCardFromHandAction = player2.actionPlayCardFromHand(0, 7, 1);
		gameSession.executeAction(playCardFromHandAction);

		expect(player2.getRemainingMana()).to.equal(9);
	});
	it('expect harmony to become dissonance when killed and to flip all minion allegiances', function() {
		var player1Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		var player2Deck = [
			{id: SDK.Cards.Boss.Boss34}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer2();
		player1.remainingMana = 9;
		boss.setDamage(24);

		var cornerBlock = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 0, 0, gameSession.getPlayer1Id());
		var cornerBlock2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 0, 4, gameSession.getPlayer2Id());

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
		gameSession.executeAction(playCardFromHandAction);

		var dissonance = UtilsSDK.getEntityOnBoardById(SDK.Cards.Boss.Boss34_2);
		expect(cornerBlock.getOwnerId()).to.equal('player2_id');
		expect(cornerBlock2.getOwnerId()).to.equal('player1_id');
	});
	it('expect andromeda to transform all minions you play into random minions of the same cost', function() {
		var player1Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		var player2Deck = [
			{id: SDK.Cards.Boss.Boss35}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer2();

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.WindbladeAdept}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
		gameSession.executeAction(playCardFromHandAction);

		var notWindblade = board.getUnitAtPosition({x:1,y:1});
		expect(notWindblade.getId()).to.not.equal(SDK.Cards.Faction1.WindbladeAdept);
		expect(notWindblade.getManaCost()).to.equal(2);
	});
	it('expect soulstealer to transform the last minion played into your general', function() {
		var player1Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		var player2Deck = [
			{id: SDK.Cards.Boss.Boss37}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer2();

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.WindbladeAdept}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
		gameSession.executeAction(playCardFromHandAction);

		var notWindblade = board.getUnitAtPosition({x:1,y:1});
		expect(notWindblade.getIsGeneral()).to.equal(true);
	});
	it('expect soulstealer to give one of his minions general status whenever he dies', function() {
		var player1Deck = [
			{id: SDK.Cards.Boss.Boss37}
		];

		var player2Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		player1.remainingMana = 9;

		gameSession.getGeneralForPlayer1().setDamage(29);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.WindbladeAdept}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
		gameSession.executeAction(playCardFromHandAction);

		var notWindblade = board.getUnitAtPosition({x:1,y:1});
		expect(notWindblade.getIsGeneral()).to.equal(false);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		gameSession.executeAction(playCardFromHandAction);

		expect(notWindblade.getIsGeneral()).to.equal(true);
	});
	it('expect spell eater to gain a keyword when the enemy casts a spell', function() {
		var player1Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		var player2Deck = [
			{id: SDK.Cards.Boss.Boss38}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer2();

		var startingModifiers = boss.getModifiers().length;

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
		gameSession.executeAction(playCardFromHandAction);

		var endingModifiers = boss.getModifiers().length;

		expect(endingModifiers).to.be.above(startingModifiers);
	});
	it('expect spell eater to give all summoned minions their generals keywords', function() {
		var player1Deck = [
			{id: SDK.Cards.Faction1.General}
		];

		var player2Deck = [
			{id: SDK.Cards.Boss.Boss38}
		];

		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		var gameSession = SDK.GameSession.getInstance();
		var board = gameSession.getBoard();
		var player1 = gameSession.getPlayer1();
		var player2 = gameSession.getPlayer2();
		var boss = gameSession.getGeneralForPlayer2();

		var startingModifiers = boss.getModifiers().length;

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.BossArtifact.FlyingBells}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 1);
		gameSession.executeAction(playCardFromHandAction);

		UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.WindbladeAdept}));
		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
		gameSession.executeAction(playCardFromHandAction);

		var notWindblade = board.getUnitAtPosition({x:1,y:1});

		expect(notWindblade.hasModifierClass(SDK.ModifierFlying)).to.equal(true);
	});
});
