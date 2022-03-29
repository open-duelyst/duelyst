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
	describe("faction1", function(){
		beforeEach(function () {
			var player1Deck = [
				{id: SDK.Cards.Faction1.General},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction1.General},
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect warblade to give +1/+1 to other friendly minions if you have another golem', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;
			//make squire, then warblade (won't work)
			var silverguardSquire1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 1, 1, gameSession.getPlayer1Id());
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.Warblade}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction1);
			expect(silverguardSquire1.getHP()).to.equal(4);
			expect(board.getUnitAtPosition({x: 1, y: 2}).getHP()).to.equal(4);
			expect(board.getUnitAtPosition({x: 1, y: 2}).getATK()).to.equal(1);

			//make second warblade, check everything
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.Warblade}));
			var playCardFromHandAction2 = player1.actionPlayCardFromHand(0, 2, 1);
			gameSession.executeAction(playCardFromHandAction2);
			expect(silverguardSquire1.getHP()).to.equal(5);
			expect(board.getUnitAtPosition({x: 1, y: 2}).getHP()).to.equal(5);
			expect(board.getUnitAtPosition({x: 1, y: 2}).getATK()).to.equal(2);
		  	expect(board.getUnitAtPosition({x: 2, y: 1}).getHP()).to.equal(4);
			expect(board.getUnitAtPosition({x: 2, y: 1}).getATK()).to.equal(1);
		});

		it('expect tough as nails to double a minions health', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;
			//make squires, tempest the first one, then double both their Health
 			var silverguardSquire1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 1, 1, gameSession.getPlayer1Id());
 			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Tempest}));
 			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));
 			var silverguardSquire2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 1, 2, gameSession.getPlayer1Id());
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.LifeCoil}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.LifeCoil}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 2));
			//check if it worked
			expect(silverguardSquire1.getId()).to.equal(SDK.Cards.Faction1.SilverguardSquire);
			expect(silverguardSquire1.getHP()).to.equal(4);
			expect(silverguardSquire2.getId()).to.equal(SDK.Cards.Faction1.SilverguardSquire);
			expect(silverguardSquire2.getHP()).to.equal(8);
		});

		it('expect gold vitriol to deal 2 damage when a heal occurs', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			// Tempest, give them a brightmoss golem
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Tempest}));
 			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));
			var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 6, 2, gameSession.getPlayer2Id());

			//now get the artifact and heal both players once each
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.GoldVitriol}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.EmeraldRejuvenator}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);
			//check the damage
			var totalDamage = brightmossGolem.getDamage() + gameSession.getGeneralForPlayer2().getDamage();
			expect(totalDamage).to.equal(4);
		});

		it('expect sol pontiff to give +2 attack to golems only if zeal is active', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;
			// check that buff works near general
			var warblade = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.Warblade}, 0, 0, gameSession.getPlayer1Id());
			var solPontiff = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SolPontiff}, 0, 1, gameSession.getPlayer1Id());
			expect(warblade.getATK()).to.equal(3);
			expect(solPontiff.getATK()).to.equal(3);
			// check that buff doesn't with zeal turned off
			solPontiff.refreshExhaustion();
			var action = solPontiff.actionMove({ x: 2, y: 1 });
      		gameSession.executeAction(action);
			expect(warblade.getATK()).to.equal(1);
			expect(solPontiff.getATK()).to.equal(1);
		});
	});
});
