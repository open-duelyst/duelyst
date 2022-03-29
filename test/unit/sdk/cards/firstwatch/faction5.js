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
	describe("faction5", function(){
		beforeEach(function () {
			var player1Deck = [
				{id: SDK.Cards.Faction5.AltGeneral},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction1.General},
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect catalyst quillbeast to deal 1 damage to all minions whenever you cast a spell', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			var quillbeast = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Quillbeast}, 2, 1, gameSession.getPlayer1Id());
			var terradon1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Terradon}, 3, 1, gameSession.getPlayer1Id());
			var terradon2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Terradon}, 3, 4, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 8, 2);
			gameSession.executeAction(playCardFromHandAction1);

			expect(quillbeast.getDamage()).to.equal(1);
			expect(terradon1.getDamage()).to.equal(1);
			expect(terradon2.getDamage()).to.equal(1);
		});
		it('expect vaaths brutality to give +1 attack and stun an enemy minion', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			var terradon2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Terradon}, 3, 4, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.VaathsBrutality}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 3, 4);
			gameSession.executeAction(playCardFromHandAction1);

			expect(terradon2.hasActiveModifierClass(SDK.ModifierStunned)).to.equal(true);
			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(3);
		});
		it('expect blood rage to give a minion +1/+1 for each time damage was dealt this turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			var terradon1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Terradon}, 3, 1, gameSession.getPlayer1Id());
			var terradon2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Terradon}, 1, 1, gameSession.getPlayer2Id());

			var action = gameSession.getGeneralForPlayer1().actionAttack(terradon2);
			gameSession.executeAction(action); // +2 instances of damage

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Tempest}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 3, 4);
			gameSession.executeAction(playCardFromHandAction1); // +4 instances of damage

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.BloodRage}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 3, 1);
			gameSession.executeAction(playCardFromHandAction1);

			expect(terradon1.getATK()).to.equal(8); // 2 base attack + 2 + 4 = 8 attack
			expect(terradon1.getHP()).to.equal(12); // 6 health after Tempest + 2 + 4 = 12
		});
		it('expect omniseer to create a primal flourish tile underneath a nearby friendly minion', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			var terradon1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Terradon}, 1, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction5.Omniseer}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 1, 2);
			gameSession.executeAction(followupAction);

			var primaltile = board.getTileAtPosition({x:1,y:2},true);
			expect(primaltile.getId()).to.equal(SDK.Cards.Tile.PrimalMojo);
		});
		it('expect primal flourish to give grow +2/+2 to friendly minions standing on it', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			var terradon1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Terradon}, 1, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction5.Omniseer}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 1, 2);
			gameSession.executeAction(followupAction);

			var primaltile = board.getTileAtPosition({x:1,y:2},true);
			expect(primaltile.getId()).to.equal(SDK.Cards.Tile.PrimalMojo);

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			expect(terradon1.getATK()).to.equal(4);
			expect(terradon1.getHP()).to.equal(10);
		});
		it('expect primal ballast to dispel a space and give +2/+2 to any minion on that space', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			var terradon1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Terradon}, 1, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction5.Omniseer}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 1, 2);
			gameSession.executeAction(followupAction);

			var primaltile = board.getTileAtPosition({x:1,y:2},true);
			expect(primaltile.getId()).to.equal(SDK.Cards.Tile.PrimalMojo);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.GreaterFortitude}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PrimalBallast}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			var primaltile = board.getTileAtPosition({x:1,y:2},true);
			expect(primaltile).to.not.exist;
			expect(terradon1.getATK()).to.equal(4);
			expect(terradon1.getHP()).to.equal(10);
		});
		it('expect rizen to summon an egg of itself nearby any time the enemy summons a minion', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			var rizen = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Rizen}, 3, 4, gameSession.getPlayer1Id());

			gameSession.executeAction(gameSession.actionEndTurn());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Faction5.Terradon}));
			var playCardFromHandAction = player2.actionPlayCardFromHand(0, 8, 1);
			gameSession.executeAction(playCardFromHandAction);

			var egg = board.getFriendlyEntitiesAroundEntity(rizen);

			expect(egg[0].getId()).to.equal(SDK.Cards.Faction5.Egg);

			gameSession.executeAction(gameSession.actionEndTurn());

			var hatchedEgg = board.getFriendlyEntitiesAroundEntity(rizen);

			expect(hatchedEgg[0].getId()).to.equal(SDK.Cards.Faction5.Rizen);
		});
		it('expect endure the beastlands to create a 2x2 area of primal flourish', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.EndureTheBeastlands}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 0);
			gameSession.executeAction(playCardFromHandAction);

			var primalFlourish1 = board.getTileAtPosition({x:0,y:0},true);
			var primalFlourish2 = board.getTileAtPosition({x:1,y:0},true);
			var primalFlourish3 = board.getTileAtPosition({x:0,y:1},true);
			var primalFlourish4 = board.getTileAtPosition({x:1,y:1},true);

			expect(primalFlourish1.getOwnerId()).to.equal(player1.getPlayerId());
			expect(primalFlourish1.getId()).to.equal(SDK.Cards.Tile.PrimalMojo);
			expect(primalFlourish2.getId()).to.equal(SDK.Cards.Tile.PrimalMojo);
			expect(primalFlourish3.getId()).to.equal(SDK.Cards.Tile.PrimalMojo);
			expect(primalFlourish4.getId()).to.equal(SDK.Cards.Tile.PrimalMojo);
		});
		it('expect verdant fulmination to grow friendly minions on primal flourish and spawn primal flourish under minions who arent standing on it', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			var terradon1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Terradon}, 1, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction5.Omniseer}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 1, 2);
			gameSession.executeAction(followupAction);

			var primaltile = board.getTileAtPosition({x:1,y:2},true);
			expect(primaltile.getId()).to.equal(SDK.Cards.Tile.PrimalMojo);
			var primaltile2 = board.getTileAtPosition({x:1,y:1},true);
			expect(primaltile2).to.not.exist;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.VerdentFulmination}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(terradon1.getATK()).to.equal(4);
			expect(terradon1.getHP()).to.equal(10);
			var primaltile2 = board.getTileAtPosition({x:1,y:1},true);
			expect(primaltile2.getId()).to.equal(SDK.Cards.Tile.PrimalMojo);
		});
		it('expect grandmaster kraigon to give your general forcefield, frenzy, and grow +7/+7', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction5.GrandmasterKraigon}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(gameSession.getGeneralForPlayer1().hasActiveModifierClass(SDK.ModifierFrenzy)).to.equal(true);
			expect(gameSession.getGeneralForPlayer1().hasActiveModifierClass(ModifierForcefield)).to.equal(true);

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(9);
			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(32);

			// kill Kraigon to make sure the buffs are removed

			player1.remainingMana = 9;
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpiralTechnique}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			player1.remainingMana = 9;
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpiralTechnique}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			player1.remainingMana = 9;
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpiralTechnique}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);


			expect(gameSession.getGeneralForPlayer1().hasActiveModifierClass(SDK.ModifierFrenzy)).to.equal(false);
			expect(gameSession.getGeneralForPlayer1().hasActiveModifierClass(ModifierForcefield)).to.equal(false);
			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(9);
			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(32);

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			// double check to make sure we're still not growing
			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(9);
			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(32);
		});
		it('expect evolutionary apex to play all minions from both players hands around their generals', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.EvolutionaryApex}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction5.Terradon}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction5.Terradon}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Faction5.Terradon}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Faction5.Terradon}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			var friendlyMinions = board.getEntitiesAroundEntity(gameSession.getGeneralForPlayer1());
			expect(friendlyMinions[0].getId()).to.equal(SDK.Cards.Faction5.Terradon);
			expect(friendlyMinions[1].getId()).to.equal(SDK.Cards.Faction5.Terradon);
			expect(friendlyMinions[2]).to.not.exist;

			var enemyMinions = board.getEntitiesAroundEntity(gameSession.getGeneralForPlayer2());
			expect(enemyMinions[0].getId()).to.equal(SDK.Cards.Faction5.Terradon);
			expect(enemyMinions[1].getId()).to.equal(SDK.Cards.Faction5.Terradon);
			expect(enemyMinions[2]).to.not.exist;
		});
		it('expect eternal heart to prevent your general from dying', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			gameSession.getGeneralForPlayer1().setDamage(20);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.EternalHeart}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpiralTechnique}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
			gameSession.executeAction(playCardFromHandAction);

			var modifiers = gameSession.getGeneralForPlayer1().getArtifactModifiers();
			expect(modifiers[0].getDurability()).to.equal(2);
			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(1);
		});
	});
});
