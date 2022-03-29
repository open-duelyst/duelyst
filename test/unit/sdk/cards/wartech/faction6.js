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
var ModifierTranscendance = require('app/sdk/modifiers/modifierTranscendance');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("wartech", function() {
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

		it('expect cryoblade to deal double damage to stunned enemies', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var cryoblade = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.FrostbladeFiend}, 5, 1, gameSession.getPlayer1Id());
			var blade = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WhistlingBlade}, 6, 1, gameSession.getPlayer2Id());
			cryoblade.refreshExhaustion();

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.FrigidCorona}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 6, 1);
			gameSession.executeAction(playCardFromHandAction1);

			var action = cryoblade.actionAttack(blade);
			gameSession.executeAction(action);

			expect(blade.getDamage()).to.equal(4);
		});
		it('expect aspect of the bear to turn a minion into a 4/5 that cant counterattack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var cryoblade = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.FrostbladeFiend}, 5, 1, gameSession.getPlayer1Id());
			var blade = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WhistlingBlade}, 6, 1, gameSession.getPlayer2Id());
			cryoblade.refreshExhaustion();

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AspectOfBear}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 6, 1);
			gameSession.executeAction(playCardFromHandAction1);

			var ursaplomb = board.getUnitAtPosition({x:6,y:1});
			expect(ursaplomb.getId()).to.equal(SDK.Cards.Faction6.Ursaplomb);

			var action = cryoblade.actionAttack(ursaplomb);
			gameSession.executeAction(action);

			expect(ursaplomb.getDamage()).to.equal(2);
			expect(cryoblade.getDamage()).to.equal(0);
		});
		it('expect shatter to destroy a stunned minion', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var blade = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WhistlingBlade}, 6, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.FrigidCorona}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 6, 1);
			gameSession.executeAction(playCardFromHandAction1);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Shatter}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 6, 1);
			gameSession.executeAction(playCardFromHandAction1);

			expect(blade.getIsRemoved()).to.equal(true);
		});
		it('expect echo deliverant to clone any mech unit you summon nearby', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var echo = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.EchoDeliverant}, 5, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AerialRift}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction1);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction5.Seismoid}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 3, 3);
			gameSession.executeAction(playCardFromHandAction1);

			var mech = board.getUnitAtPosition({x:3, y:3});
			var duplicate = board.getEntitiesAroundEntity(mech);
			expect(duplicate[0].getId()).to.equal(SDK.Cards.Faction5.Seismoid);
		});
		it('expect essence sculpt to put a copy of a stunned minion in your hand', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var blade = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WhistlingBlade}, 6, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.FrigidCorona}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 6, 1);
			gameSession.executeAction(playCardFromHandAction1);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.EssenceSculpt}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 6, 1);
			gameSession.executeAction(playCardFromHandAction1);

			var hand1 = player1.getDeck().getCardsInHand();
			expect(hand1[0].getId()).to.equal(SDK.Cards.Neutral.WhistlingBlade);
		});
		it('expect animus plate to give +2 attack and give all friendly vespyrs +2/+2 when attacking or counterattacking', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.AnimusPlate}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 6, 1);
			gameSession.executeAction(playCardFromHandAction1);

			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(4);

			var cloaker = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.CrystalCloaker}, 0, 0, gameSession.getPlayer1Id());
			var circulus = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.Circulus}, 5, 1, gameSession.getPlayer1Id());
			var golem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WhistlingBlade}, 1, 2, gameSession.getPlayer2Id());

			var action = gameSession.getGeneralForPlayer1().actionAttack(golem);
			gameSession.executeAction(action);

			expect(cloaker.getATK()).to.equal(4);
			expect(cloaker.getHP()).to.equal(5);
			expect(circulus.getATK()).to.equal(1);
			expect(circulus.getHP()).to.equal(1);

			gameSession.executeAction(gameSession.actionEndTurn());

			action = golem.actionAttack(gameSession.getGeneralForPlayer1());
			gameSession.executeAction(action);

			expect(cloaker.getATK()).to.equal(6);
			expect(cloaker.getHP()).to.equal(7);
			expect(circulus.getATK()).to.equal(1);
			expect(circulus.getHP()).to.equal(1);
		});
		it('expect hydrogarm to deal 1 damage to enemy minions in his row and stun them when using bbs', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			// cycle turns until you can use bloodborn spell
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var golem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 2, 3, gameSession.getPlayer2Id());
			var hydrogarm = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.Hydrogarm}, 7, 3, gameSession.getPlayer1Id());

			var action = player1.actionPlaySignatureCard(0, 1);
			gameSession.executeAction(action);

			expect(golem.hasModifierClass(SDK.ModifierStunned)).to.equal(true);
			expect(golem.getDamage()).to.equal(1);
		});
		it('expect crystalline reinforcement to give friendly minions +attack/+health equal to their current bonus attack and health', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.AnimusPlate}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 6, 1);
			gameSession.executeAction(playCardFromHandAction1);

			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(4);

			var cloaker = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.CrystalCloaker}, 0, 0, gameSession.getPlayer1Id());
			var cloaker2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.CrystalCloaker}, 7, 0, gameSession.getPlayer1Id());
			var circulus = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.Circulus}, 5, 1, gameSession.getPlayer1Id());
			var blade = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WhistlingBlade}, 3, 2, gameSession.getPlayer1Id());
			var golem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WhistlingBlade}, 1, 2, gameSession.getPlayer2Id());

			var action = gameSession.getGeneralForPlayer1().actionAttack(golem);
			gameSession.executeAction(action);

			expect(cloaker.getATK()).to.equal(4);
			expect(cloaker.getHP()).to.equal(5);
			expect(cloaker2.getATK()).to.equal(6);
			expect(cloaker2.getHP()).to.equal(5);
			expect(circulus.getATK()).to.equal(1);
			expect(circulus.getHP()).to.equal(1);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.LastingJudgement}));
			playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 3, 2);
			gameSession.executeAction(playCardFromHandAction1);

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.CrystallineReinforcement}));
			playCardFromHandAction1 = player1.actionPlayCardFromHand(1, 6, 1);
			gameSession.executeAction(playCardFromHandAction1);

			expect(cloaker.getATK()).to.equal(6); // no infiltration active buff... 2 base + 2 buff from animus plate.  +2 from crystalline reinforcement
			expect(cloaker.getHP()).to.equal(7);
			expect(cloaker2.getATK()).to.equal(10); // 2 base + (2 from animus plate + 2 from infiltration) + 4 from crystalline reinforcement
			expect(cloaker2.getHP()).to.equal(7);
			expect(circulus.getATK()).to.equal(1);
			expect(circulus.getHP()).to.equal(1);
			expect(blade.getHP()).to.equal(9); // negative lasting judgement buff goes into place
			expect(blade.getATK()).to.equal(8); // but positive lasting judgement buff does... 2 base + 3 from LJ + 3 from crystalline reinforcement
		});
		it('expect wintertide to summon 3 2/2 vespyr winter maerids on a column', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Wintertide}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 4, 2);
			gameSession.executeAction(playCardFromHandAction1);

			var maerid1 = board.getUnitAtPosition({x:4,y:3});
			var maerid2 = board.getUnitAtPosition({x:4,y:2});
			var maerid3 = board.getUnitAtPosition({x:4,y:1});

			expect(maerid1.getId()).to.equal(SDK.Cards.Faction6.WaterBear);
			expect(maerid2.getId()).to.equal(SDK.Cards.Faction6.WaterBear);
			expect(maerid3.getId()).to.equal(SDK.Cards.Faction6.WaterBear);
		});
		it('expect denadoro to make your minions always infiltrated', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var cloaker = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.CrystalCloaker}, 0, 0, gameSession.getPlayer1Id());
			var cloaker2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.CrystalCloaker}, 7, 0, gameSession.getPlayer1Id());

			expect(cloaker.getATK()).to.equal(2);
			expect(cloaker.getHP()).to.equal(3);
			expect(cloaker2.getATK()).to.equal(4);
			expect(cloaker2.getHP()).to.equal(3);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction6.InfiltrateMaster}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction1);

			expect(cloaker.getATK()).to.equal(4);
			expect(cloaker.getHP()).to.equal(3);
			expect(cloaker2.getATK()).to.equal(4);
			expect(cloaker2.getHP()).to.equal(3);
		});
		it('expect draugar eyolith to make enemies only move 1 space while building and while active', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var cloaker2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.CrystalCloaker}, 7, 0, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction6.DraugarEyolith}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction1);

			gameSession.executeAction(gameSession.actionEndTurn());

			var action = gameSession.getGeneralForPlayer2().actionMove({x:6, y:2});
			gameSession.executeAction(action);
			expect(board.getUnitAtPosition({x:6,y:2})).to.equal(undefined);

			action = gameSession.getGeneralForPlayer2().actionMove({x:7, y:2});
			gameSession.executeAction(action);
			expect(board.getUnitAtPosition({x:7,y:2}).getId()).to.equal(SDK.Cards.Faction1.General);

			action = cloaker2.actionMove({x:5, y:0});
			gameSession.executeAction(action);
			expect(board.getUnitAtPosition({x:5,y:0})).to.equal(undefined);

			action = cloaker2.actionMove({x:6, y:0});
			gameSession.executeAction(action);
			expect(board.getUnitAtPosition({x:6,y:0}).getId()).to.equal(SDK.Cards.Faction6.CrystalCloaker);

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var action = gameSession.getGeneralForPlayer2().actionMove({x:5, y:2});
			gameSession.executeAction(action);
			expect(board.getUnitAtPosition({x:5,y:2})).to.equal(undefined);

			action = gameSession.getGeneralForPlayer2().actionMove({x:6, y:2});
			gameSession.executeAction(action);
			expect(board.getUnitAtPosition({x:6,y:2}).getId()).to.equal(SDK.Cards.Faction1.General);

			action = cloaker2.actionMove({x:4, y:0});
			gameSession.executeAction(action);
			expect(board.getUnitAtPosition({x:4,y:0})).to.equal(undefined);

			action = cloaker2.actionMove({x:5, y:0});
			gameSession.executeAction(action);
			expect(board.getUnitAtPosition({x:5,y:0}).getId()).to.equal(SDK.Cards.Faction6.CrystalCloaker);
		});
		it('expect auroraboros to give all friendly minions dying wish: respawn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var cloaker = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.CrystalCloaker}, 3, 0, gameSession.getPlayer1Id());
			var fenrir = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.FenrirWarmaster}, 7, 0, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Auroraboros}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction1);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 7, 0);
			gameSession.executeAction(playCardFromHandAction1);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 3, 0);
			gameSession.executeAction(playCardFromHandAction1);

			expect(board.getUnitAtPosition({x:3,y:0}).getId()).to.equal(SDK.Cards.Faction6.CrystalCloaker);
			expect(board.getUnitAtPosition({x:7,y:0}).getId()).to.equal(SDK.Cards.Faction6.FenrirWarmaster);
		});
	});
});
