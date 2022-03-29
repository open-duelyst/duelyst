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

describe("first watch", function() {
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

		it('expect freeblade to switch positions with the first minion your opponent summons', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction6.Freeblade}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Faction4.GloomChaser}));

			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction1);

			gameSession.executeAction(gameSession.actionEndTurn());

			var playCardFromHandAction1 = player2.actionPlayCardFromHand(0, 8, 1);
			gameSession.executeAction(playCardFromHandAction1);

			var freeblade = board.getUnitAtPosition({x:8,y:1});
			var gloomchaser = board.getUnitAtPosition({x:1,y:1});

			expect(freeblade.getId()).to.equal(SDK.Cards.Faction6.Freeblade);
			expect(gloomchaser.getId()).to.equal(SDK.Cards.Faction4.GloomChaser);
		});
		it('expect crystal arbiter to gain +3 attack on your opponents turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			var crystalArbiter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.CrystalArbiter}, 2, 1, gameSession.getPlayer1Id());

			expect(crystalArbiter.getATK()).to.equal(1);

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(crystalArbiter.getATK()).to.equal(4);
		});
		it('expect vespyrian might to give +2/+2 for each friendly vespyr minion on board', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			var crystalArbiter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.CrystalArbiter}, 2, 1, gameSession.getPlayer1Id());
			var crystalArbiter2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.CrystalArbiter}, 3, 1, gameSession.getPlayer1Id());
			var crystalArbiter3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.CrystalArbiter}, 4, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.VespyrianMight}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 2, 1);
			gameSession.executeAction(playCardFromHandAction1);

			expect(crystalArbiter.getATK()).to.equal(7);
			expect(crystalArbiter.getHP()).to.equal(10);
		});
		it('expect blinding snowstorm to deal 1 damage to all enemies and reduce their movement to 1 next turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			var crystalArbiter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.CrystalArbiter}, 2, 1, gameSession.getPlayer2Id());
			var flyer = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FlameWing}, 3, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.BlindingSnowstorm}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 2, 1);
			gameSession.executeAction(playCardFromHandAction1);

			expect(crystalArbiter.getDamage()).to.equal(1);
			expect(flyer.getDamage()).to.equal(1);
			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(1);

			gameSession.executeAction(gameSession.actionEndTurn());

			var action = gameSession.getGeneralForPlayer2().actionMove({ x: 6, y: 2 });
			gameSession.executeAction(action);
			expect(action.getIsValid()).to.equal(false);
			var action = gameSession.getGeneralForPlayer2().actionMove({ x: 7, y: 2 });
			gameSession.executeAction(action);
			expect(action.getIsValid()).to.equal(true);

			var action = crystalArbiter.actionMove({ x: 4, y: 1 });
			gameSession.executeAction(action);
			expect(action.getIsValid()).to.equal(false);
			var action = crystalArbiter.actionMove({ x: 2, y: 2 });
			gameSession.executeAction(action);
			expect(action.getIsValid()).to.equal(true);

			var action = flyer.actionMove({ x: 6, y: 3 });
			gameSession.executeAction(action);
			expect(action.getIsValid()).to.equal(false);
			var action = flyer.actionMove({ x: 3, y: 2 });
			gameSession.executeAction(action);
			expect(action.getIsValid()).to.equal(true);
		});
		it('expect drake dowager to transform when the enemy general attacks and to summon a 4/4 drake when it attacks', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction6.DrakeDowager}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction1);

			gameSession.executeAction(gameSession.actionEndTurn());
			var wraithling = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Wraithling}, 8, 1, gameSession.getPlayer1Id());

			var action = gameSession.getGeneralForPlayer2().actionAttack(wraithling);
			gameSession.executeAction(action);

			var dowager = board.getUnitAtPosition({x:1,y:1});

			gameSession.executeAction(gameSession.actionEndTurn());

			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 0, y: 4 });
			gameSession.executeAction(action);

			expect(dowager.getATK()).to.equal(1);

			var action = dowager.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);

			var drake = board.getEntitiesAroundEntity(dowager);

			expect(drake[0].getId()).to.equal(SDK.Cards.Faction6.AzureDrake);
		});
		it('expect moonlit basilysk to gain +3/+3 when your opponent casts a spell', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction6.MoonlitBasilysk}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.InklingSurge}));

			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction1);

			gameSession.executeAction(gameSession.actionEndTurn());

			var playCardFromHandAction1 = player2.actionPlayCardFromHand(0, 8, 1);
			gameSession.executeAction(playCardFromHandAction1);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.InklingSurge}));
			var playCardFromHandAction1 = player2.actionPlayCardFromHand(0, 8, 3);
			gameSession.executeAction(playCardFromHandAction1);

			expect(board.getUnitAtPosition({x:1,y:1}).getATK()).to.equal(8);
			expect(board.getUnitAtPosition({x:1,y:1}).getHP()).to.equal(8);
		});
		it('expect luminous charge to summon 5 0/1 walls that explode for 2 on death', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;

			var terrodon = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Terradon}, 2, 2, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.LuminousCharge}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 0, 4);
			gameSession.executeAction(followupAction);
			var followupCard2 = followupAction.getCard().getCurrentFollowupCard();
			var followupAction2 = player1.actionPlayFollowup(followupCard2, 1, 4);
			gameSession.executeAction(followupAction2);
			var followupCard3 = followupAction2.getCard().getCurrentFollowupCard();
			var followupAction3 = player1.actionPlayFollowup(followupCard3, 2, 4);
			gameSession.executeAction(followupAction3);
			var followupCard4 = followupAction3.getCard().getCurrentFollowupCard();
			var followupAction4 = player1.actionPlayFollowup(followupCard4, 2, 3);
			gameSession.executeAction(followupAction4);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 3);
			gameSession.executeAction(playCardFromHandAction);

			expect(terrodon.getDamage()).to.equal(2);
		});
		it('expect shivers to give you 1 mana crystal when it attacks infiltrated', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();

			var shivers = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.Shivers}, 8, 3, gameSession.getPlayer1Id());
			shivers.refreshExhaustion();

			var action = shivers.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			expect(player1.getRemainingMana()).to.equal(4);
		});
		it('expect glacial fissure to deal 8 damage to everything in the center column', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;

			var dragonboneGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.DragoneboneGolem}, 4, 3, gameSession.getPlayer1Id());
			var dragonboneGolem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.DragoneboneGolem}, 4, 1, gameSession.getPlayer2Id());

			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
			gameSession.executeAction(action);
			gameSession.getGeneralForPlayer1().refreshExhaustion();
			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
			gameSession.executeAction(action);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.GlacialFissure}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
			gameSession.executeAction(playCardFromHandAction);

			expect(dragonboneGolem.getDamage()).to.equal(8);
			expect(dragonboneGolem2.getDamage()).to.equal(8);
			expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(8);
		});
		it('expect icebreak ambush to summon two snowchasers, a crystal cloaker, and a wolf raven on your opponents side of board', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SnowPatrol}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
			gameSession.executeAction(playCardFromHandAction);

			var snowchasers = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction6.WyrBeast);
			var cloaker = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction6.CrystalCloaker);
			var wolfraven = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction6.WolfRaven);

			expect(snowchasers.length).to.equal(2);
			expect(cloaker.length).to.equal(1);
			expect(wolfraven.length).to.equal(1);

			expect(snowchasers[0].getPosition().x).to.be.above(4);
			expect(snowchasers[1].getPosition().x).to.be.above(4);
			expect(cloaker[0].getPosition().x).to.be.above(4);
			expect(wolfraven[0].getPosition().x).to.be.above(4);
		});
		it('expect matron elveiti to stop minions from attacking your general', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();

			var matron = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.MatronElveiti}, 8, 3, gameSession.getPlayer2Id());
			var snowchaser = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.WyrBeast}, 7, 2, gameSession.getPlayer1Id());
			snowchaser.refreshExhaustion();

			var action = snowchaser.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);

			expect(action.getIsValid()).to.equal(false);
			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(0);
		});
		it('expect flawless reflection to transform all nearby minions into selected minion', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;

			var matron = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.MatronElveiti}, 8, 3, gameSession.getPlayer2Id());
			var snowchaser = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.WyrBeast}, 7, 2, gameSession.getPlayer1Id());
			var snowchaser2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.WyrBeast}, 7, 3, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.FlawlessReflection}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 3);
			gameSession.executeAction(playCardFromHandAction);

			expect(board.getUnitAtPosition({x:7,y:2}).getId()).to.equal(SDK.Cards.Faction6.MatronElveiti);
			expect(board.getUnitAtPosition({x:7,y:3}).getId()).to.equal(SDK.Cards.Faction6.MatronElveiti);
		});
		it('expect the dredger to teleport an enemy to your starting side of the battlefield after you damage an enemy', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;

			var matron = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.MatronElveiti}, 5, 2, gameSession.getPlayer2Id());

			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
			gameSession.executeAction(action);
			gameSession.getGeneralForPlayer1().refreshExhaustion();
			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
			gameSession.executeAction(action);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.TheDredger}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 3);
			gameSession.executeAction(playCardFromHandAction);

			var action = gameSession.getGeneralForPlayer1().actionAttack(matron);
			gameSession.executeAction(action);

			var matron = UtilsSDK.getEntityOnBoardById(SDK.Cards.Faction6.MatronElveiti);

			expect(matron.getPosition().x).to.be.below(4);
		});
	});
});
