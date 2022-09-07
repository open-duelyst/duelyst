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
	describe("faction5", function(){
		beforeEach(function () {
			var player1Deck = [
				{id: SDK.Cards.Faction3.AltGeneral},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction1.General},
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect erratic raptyr to turn into an egg after an attack or counter attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var raptyr1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.ErraticRaptyr}, 5, 1, gameSession.getPlayer1Id());
			var raptyr2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.ErraticRaptyr}, 6, 1, gameSession.getPlayer2Id());
			raptyr1.refreshExhaustion();

			var action = raptyr1.actionAttack(raptyr2);
			gameSession.executeAction(action);

			var egg1 = board.getUnitAtPosition({x:5,y:1});
			var egg2 = board.getUnitAtPosition({x:6,y:1});

			expect(egg1.getId()).to.equal(SDK.Cards.Faction5.Egg);
			expect(egg2.getId()).to.equal(SDK.Cards.Faction5.Egg);
		});
		it('expect embryotic insight to draw you 2 cards if you have an egg', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.BurdenOfKnowledge}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.BurdenOfKnowledge}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.BurdenOfKnowledge}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.BurdenOfKnowledge}));

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.EmbryoticInsight}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(playCardFromHandAction1);

			var hand1 = player1.getDeck().getCardsInHand();
			expect(hand1[0]).to.equal(undefined);

			var raptyr1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.ErraticRaptyr}, 5, 1, gameSession.getPlayer1Id());
			var raptyr2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.ErraticRaptyr}, 6, 1, gameSession.getPlayer2Id());
			raptyr1.refreshExhaustion();
			var action = raptyr1.actionAttack(raptyr2);
			gameSession.executeAction(action);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.EmbryoticInsight}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(playCardFromHandAction1);

			var hand1 = player1.getDeck().getCardsInHand();
			expect(hand1[0].getId()).to.equal(SDK.Cards.Spell.BurdenOfKnowledge);
			expect(hand1[1].getId()).to.equal(SDK.Cards.Spell.BurdenOfKnowledge);
			expect(hand1[2]).to.equal(undefined);
		});
		it('expect seismoid to draw both players a card whenever you summon a mech from your action bar', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;

			var seismond = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Seismoid}, 5, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.BurdenOfKnowledge}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.BurdenOfKnowledge}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.BurdenOfKnowledge}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.BurdenOfKnowledge}));

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction5.Seismoid}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction1);

			var hand1 = player1.getDeck().getCardsInHand();
			var hand2 = player2.getDeck().getCardsInHand();
			expect(hand1[0].getId()).to.equal(SDK.Cards.Spell.BurdenOfKnowledge);
			expect(hand1[1]).to.equal(undefined);
			expect(hand2[0].getId()).to.equal(SDK.Cards.Spell.BurdenOfKnowledge);
			expect(hand2[1]).to.equal(undefined);
		});
		it('expect upper hand to damage a minion equal to the number of cards in opponents action bar', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;

			var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 5, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.BurdenOfKnowledge}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.BurdenOfKnowledge}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.BurdenOfKnowledge}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.BurdenOfKnowledge}));

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.UpperHand}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(playCardFromHandAction1);

			expect(brightmossGolem.getDamage()).to.equal(4);
		});
		it('expect rage reactor to give your general +1 attack and summon a ripper egg on destroyed enemy spaces', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.RageReactor}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(playCardFromHandAction1);

			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(3);

			var dragonlark = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SpottedDragonlark}, 1, 1, gameSession.getPlayer2Id());

			var action = gameSession.getGeneralForPlayer1().actionAttack(dragonlark);
			gameSession.executeAction(action);

			var egg = board.getUnitAtPosition({x:1,y:1});
			expect(egg.getId()).to.equal(SDK.Cards.Faction5.Egg);

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var ripper = board.getUnitAtPosition({x:1,y:1});
			expect(ripper.getId()).to.equal(SDK.Cards.Faction5.Gibblegup);
			expect(ripper.ownerId).to.equal('player1_id')
		});
		it('expect armada to deal 5 damage to the closest enemy when you use your bbs', function() {
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
			var armada = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Armada}, 7, 3, gameSession.getPlayer1Id());

			var action = player1.actionPlaySignatureCard(0, 1);
			gameSession.executeAction(action);

			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(5);
			expect(golem.getDamage()).to.equal(0);
		});
		it('expect pupabomb to destroy a friendly egg and deal 4 damage to enemies around it', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var raptyr1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.ErraticRaptyr}, 7, 1, gameSession.getPlayer1Id());
			var leviathan = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.UnstableLeviathan}, 6, 1, gameSession.getPlayer2Id());
			var leviathan2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.UnstableLeviathan}, 5, 1, gameSession.getPlayer2Id());
			raptyr1.refreshExhaustion();
			var action = raptyr1.actionAttack(leviathan);
			gameSession.executeAction(action);

			var egg1 = board.getUnitAtPosition({x:7,y:1});

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.EggGrenade}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 7, 1);
			gameSession.executeAction(playCardFromHandAction1);

			expect(egg1.getIsRemoved()).to.equal(true);
			expect(leviathan.getDamage()).to.equal(9);
			expect(leviathan2.getDamage()).to.equal(0);
			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(4);
		});
		it('expect homeostatic rebuke to make all minions attack themselves', function() {
			var gameSession = SDK.GameSession.getInstance();
	        var board = gameSession.getBoard();
	        var player1 = gameSession.getPlayer1();

	        player1.remainingMana = 9;

	        var valeHunter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ValeHunter}, 0, 0, gameSession.getPlayer1Id());
	        var tethermancer = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Tethermancer}, 1, 1, gameSession.getPlayer2Id());

	        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.HomeostaticRebuke}));
	        var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
	        gameSession.executeAction(playCardFromHandAction);

	        expect(valeHunter.getDamage()).to.equal(valeHunter.getATK());
	        expect(tethermancer.getDamage()).to.equal(tethermancer.getATK());
		});
		it('expect progenitor to make friendly non-egg minions summon egg copies of themselves behind them', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var valeHunter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ValeHunter}, 0, 0, gameSession.getPlayer1Id()); // should not spawn egg
			var tethermancer = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Tethermancer}, 1, 1, gameSession.getPlayer1Id());
			var tethermancer2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Tethermancer}, 5, 3, gameSession.getPlayer2Id()); // should not spawn egg
			var raptyr1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.ErraticRaptyr}, 5, 1, gameSession.getPlayer1Id()); // should not spawn egg
			var raptyr2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.ErraticRaptyr}, 6, 1, gameSession.getPlayer2Id()); // should not spawn egg
			raptyr1.refreshExhaustion();
			var action = raptyr1.actionAttack(raptyr2);
			gameSession.executeAction(action);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction5.Progenitor}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 3);
			gameSession.executeAction(playCardFromHandAction);

			var nonegg1 = board.getUnitAtPosition({x:4, y:1});
			var nonegg2 = board.getUnitAtPosition({x:6, y:3});
			var egg = board.getUnitAtPosition({x:0, y:1});

			expect(nonegg1).to.equal(undefined);
			expect(nonegg2).to.equal(undefined);
			expect(egg.getId()).to.equal(SDK.Cards.Faction5.Egg);

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			egg = board.getUnitAtPosition({x:0, y:1});

			expect(egg.getId()).to.equal(SDK.Cards.Neutral.Tethermancer);
		});
		it('expect gigaloth to give other friendly minions +3/+3 when it attacks', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var valeHunter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ValeHunter}, 0, 0, gameSession.getPlayer1Id());
			var gigaloth = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Gigaloth}, 5, 1, gameSession.getPlayer1Id()); // should not spawn egg
			var golem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WhistlingBlade}, 6, 1, gameSession.getPlayer2Id()); // should not spawn egg
			gigaloth.refreshExhaustion();
			var action = gigaloth.actionAttack(golem);
			gameSession.executeAction(action);

			expect(valeHunter.getATK()).to.equal(4);
			expect(valeHunter.getHP()).to.equal(5);
			expect(gigaloth.getATK()).to.equal(7);
			expect(gigaloth.getHP()).to.equal(5);
		});

		/* Test disabled: failing
		it('expect saurian finality to stun the enemy general, give your general +2 attack, cause both players to lose 3 mana, and restore 10 health to your general', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();

			player1.maximumMana = 7;
			player1.remainingMana = 7;
			player2.maximumMana = 7;
			gameSession.getGeneralForPlayer1().setDamage(15);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SaurianFinality}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 3);
			gameSession.executeAction(playCardFromHandAction);

			expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(5);
			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(4);
			expect(gameSession.getGeneralForPlayer2().hasModifierClass(SDK.ModifierStunned)).to.equal(true);
			expect(player1.getMaximumMana()).to.equal(4);
			expect(player2.getMaximumMana()).to.equal(4);
		});
		*/
	});
});
