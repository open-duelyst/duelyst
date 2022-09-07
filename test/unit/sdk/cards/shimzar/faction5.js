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

describe("shimzar", function() {
	describe("faction5", function(){
		beforeEach(function () {
			var player1Deck = [
				{id: SDK.Cards.Faction5.General},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction1.General},
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect wild inceptor to hatch a friendly egg', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var silithar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.YoungSilithar}, 1, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction5.WildInceptor}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 1, 1);
			gameSession.executeAction(followupAction);

			var silithar = board.getUnitAtPosition({x:1, y:1});

			expect(silithar.getId()).to.equal(SDK.Cards.Faction5.YoungSilithar);
			expect(silithar.getIsRemoved()).to.equal(false);
		});
		it('expect razor skin to give all friendly minions +1 attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var silverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 1, 1, gameSession.getPlayer1Id());
			var silverguardSquire2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 2, 1, gameSession.getPlayer1Id());
			var silverguardSquire3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 3, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.RazorSkin}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			expect(silverguardSquire.getATK()).to.equal(2);
			expect(silverguardSquire2.getATK()).to.equal(2);
			expect(silverguardSquire3.getATK()).to.equal(2);
		});
		it('expect razor skin to draw a random f5/neutral battlepet', function() {
			for(var i = 0; i < 50; i++){
				var player1Deck = [
					{id: SDK.Cards.Faction1.General}
				];

				var player2Deck = [
					{id: SDK.Cards.Faction3.General}
				];

				// setup test session
				UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

				var gameSession = SDK.GameSession.getInstance();
				var board = gameSession.getBoard();
				var player1 = gameSession.getPlayer1();
				player1.remainingMana = 9;

				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.RazorSkin}));
				var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
				gameSession.executeAction(playCardFromHandAction);

				var hand = player1.getDeck().getCardsInHand();
				expect(hand[0]).to.exist;
				expect(hand[0].getRaceId()).to.equal(SDK.Races.BattlePet);
				expect(hand[0].getFactionId() === SDK.Factions.Faction5 || hand[0].getFactionId() === SDK.Factions.Neutral).to.equal(true);

				expect(hand[0].getBaseCardId()).to.not.equal(SDK.Cards.Faction5.Kin);

				SDK.GameSession.reset();
			}
		});
		it('expect lava lance to deal 2 damage to a minion', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var golem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 5, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.LavaLance}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(golem.getDamage()).to.equal(2);
		});
		it('expect lava lance to deal 4 damage to a minion if you have an egg', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var silithar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.YoungSilithar}, 1, 1, gameSession.getPlayer1Id());
			var golem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 5, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.LavaLance}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(golem.getDamage()).to.equal(4);
		});
		it('expect mandrake to cost 1 less for each minion both players played', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();

			player1.remainingMana = 9;

			// check mandrake created before playing minions
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction5.Mandrake}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(1, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(1, 1, 0);
			gameSession.executeAction(playCardFromHandAction);

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0].getManaCost()).to.equal(10);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(1, 2, 2);
			gameSession.executeAction(playCardFromHandAction);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(1, 2, 3);
			gameSession.executeAction(playCardFromHandAction);

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0].getManaCost()).to.equal(8);

			gameSession.executeAction(gameSession.actionEndTurn());

			player2.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			var playCardFromHandAction = player2.actionPlayCardFromHand(0, 8, 1);
			gameSession.executeAction(playCardFromHandAction);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			var playCardFromHandAction = player2.actionPlayCardFromHand(0, 8, 0);
			gameSession.executeAction(playCardFromHandAction);

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0].getManaCost()).to.equal(6);

			// check mandrake created after playing minions
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction5.Mandrake}));

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[1].getManaCost()).to.equal(6);
		});
		it('expect thumping wave to give a friendly minion +5 attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var golem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 5, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ThumpingWave}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(golem.getATK()).to.equal(9);
		});
		it('expect thumping wave to turn a minion into kin at end of turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var golem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 5, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ThumpingWave}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(playCardFromHandAction);

			gameSession.executeAction(gameSession.actionEndTurn());

			var kin = board.getUnitAtPosition({x:5, y:1});

			expect(kin.getId()).to.equal(SDK.Cards.Faction5.Kin);
		});

		/* Test disabled: failing
		it('expect visionar to gain +1/+1 whenever any player draws a card', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.PhaseHound}));

			var visionar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Visionar}, 5, 1, gameSession.getPlayer1Id());

			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(visionar.getHP()).to.equal(5);
			expect(visionar.getATK()).to.equal(8);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ThumpingWave}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ThumpingWave}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.ThumpingWave}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.ThumpingWave}));

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(visionar.getHP()).to.equal(6);
			expect(visionar.getATK()).to.equal(9);

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(visionar.getHP()).to.equal(7);
			expect(visionar.getATK()).to.equal(10);
		});
		*/

		it('expect moloki huntress make friendly minions grow at the start of both turns', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var huntress = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.MolokiHuntress}, 5, 1, gameSession.getPlayer1Id());

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(huntress.getATK()).to.equal(2);
			expect(huntress.getHP()).to.equal(3);

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(huntress.getATK()).to.equal(3);
			expect(huntress.getHP()).to.equal(4);
		});
		it('expect natures confluence to summon 4 copies of a random f5/neutral battle pet in a 2x2 grid', function() {
			for(var i = 0; i < 50; i++){
				var player1Deck = [
					{id: SDK.Cards.Faction1.General}
				];

				var player2Deck = [
					{id: SDK.Cards.Faction3.General}
				];

				// setup test session
				UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

				var gameSession = SDK.GameSession.getInstance();
				var board = gameSession.getBoard();
				var player1 = gameSession.getPlayer1();
				player1.remainingMana = 9;

				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.NaturesConfluence}));
				var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 0);
				gameSession.executeAction(playCardFromHandAction);

				var battlepet1 = board.getUnitAtPosition({x: 0, y: 0});
				var battlepet2 = board.getUnitAtPosition({x: 1, y: 0});
				var battlepet3 = board.getUnitAtPosition({x: 0, y: 1});
				var battlepet4 = board.getUnitAtPosition({x: 1, y: 1});
				expect(battlepet1.getRaceId()).to.equal(SDK.Races.BattlePet);
				expect(battlepet1.getFactionId() === SDK.Factions.Faction5 || battlepet1.getFactionId() === SDK.Factions.Neutral).to.equal(true);
				expect(battlepet2.getId()).to.equal(battlepet1.getId());
				expect(battlepet3.getId()).to.equal(battlepet1.getId());
				expect(battlepet4.getId()).to.equal(battlepet1.getId());

				expect(battlepet1.getBaseCardId()).to.not.equal(SDK.Cards.Faction5.Kin);

				SDK.GameSession.reset();
			}
		});
		it('expect morin-khur to grant +3 attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.MorinKhur}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(5);
		});
		it('expect morin-khur to hatch friendly eggs when its owners general does damage', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.MorinKhur}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			var huntress = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.MolokiHuntress}, 0, 1, gameSession.getPlayer2Id());
			var silithar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.YoungSilithar}, 1, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			var action = gameSession.getGeneralForPlayer1().actionAttack(huntress);
			gameSession.executeAction(action);

			var silithar = board.getUnitAtPosition({x:1, y:1});

			expect(silithar.getId()).to.equal(SDK.Cards.Faction5.YoungSilithar);
			expect(silithar.getIsRemoved()).to.equal(false);
		});

		/*
		it('expect flaming stampede to deal 5 damage to all non-eggs', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var obelysk1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.BrazierDuskWind}, 6, 2, gameSession.getPlayer1Id());
			var hailstoneGolem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.HailstoneGolem}, 7, 2, gameSession.getPlayer1Id());
			var obelysk2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.BrazierGoldenFlame}, 1, 2, gameSession.getPlayer2Id());
			var hailstoneGolem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.HailstoneGolem}, 2, 2, gameSession.getPlayer2Id());
			var silithar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.YoungSilithar}, 1, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			var silithar = board.getUnitAtPosition({x:1, y:1});

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.FlamingStampede}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(hailstoneGolem1.getDamage()).to.equal(5);
			expect(hailstoneGolem2.getDamage()).to.equal(5);
			expect(obelysk1.getDamage()).to.equal(5);
			expect(obelysk2.getDamage()).to.equal(5);
			expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(5);
			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(5);
			expect(silithar.getDamage()).to.equal(0);
		});
		*/

		it('expect dreadnought to give eggs you summon +2/+2', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var dreadnought = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Dreadnaught}, 0, 1, gameSession.getPlayer1Id());
			var silithar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.YoungSilithar}, 1, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			var silithar = board.getUnitAtPosition({x:1, y:1});

			expect(silithar.getATK()).to.equal(2);
			expect(silithar.getHP()).to.equal(3);
		});
		it('expect dreadnought to not give his own egg +2/+2', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var dreadnought = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Dreadnaught}, 0, 1, gameSession.getPlayer1Id());
			dreadnought.setDamage(5);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
			gameSession.executeAction(playCardFromHandAction);

			var dreadnought = board.getUnitAtPosition({x:0, y:1});

			expect(dreadnought.getATK()).to.equal(0);
			expect(dreadnought.getHP()).to.equal(1);
		});
	});
});
