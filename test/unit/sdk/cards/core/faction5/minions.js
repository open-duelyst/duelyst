var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var UtilsSDK = require('test/utils/utils_sdk');
var _ = require('underscore');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("faction5", function() {
	describe("minions", function(){
		beforeEach(function () {
			var player1Deck = [
				{id: SDK.Cards.Faction5.General},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction2.General},
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect kujata to lower all minions costs by 1', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var kujata = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Kujata}, 1, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.KomodoCharger}));
			var komodo = player1.getDeck().getCardInHandAtIndex(0);
			expect(komodo.getManaCostChange()).to.equal(-1);
		});
		it('expect kujata to deal 1 damage to any minion you summon', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var kujata = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Kujata}, 1, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.KomodoCharger}));
			var komodo = player1.getDeck().getCardInHandAtIndex(0);
			var hp = komodo.getHP();
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(komodo.getHP()).to.equal(hp - 1);
		});
		it('expect kujata to swap effects when mind controlled', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();

			player1.remainingMana = 9;

			var kujata = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Kujata}, 7, 2, gameSession.getPlayer1Id());
			expect(kujata.getOwnerId()).to.equal(player1.getPlayerId());

			gameSession.executeAction(gameSession.actionEndTurn());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.Enslave}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Neutral.KomodoCharger}));

			player2.remainingMana = 9;

			var komodo = player2.getDeck().getCardInHandAtIndex(1);
			var hp = komodo.getHP();

			expect(komodo.getManaCostChange()).to.equal(0);

			var playCardFromHandAction = player2.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(kujata.getOwnerId()).to.equal(player2.getPlayerId());
			expect(komodo.getManaCostChange()).to.equal(-1);

			var playCardFromHandAction = player2.actionPlayCardFromHand(1, 8, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(komodo.getHP()).to.equal(hp - 1);
		});
		it('expect rebirth to leave behind an egg on death (young silithar)', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var youngSilithar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.YoungSilithar}, 0, 1, gameSession.getPlayer2Id());
			var abyssalCrawler1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalCrawler}, 1, 1, gameSession.getPlayer1Id());
			abyssalCrawler1.refreshExhaustion();

			youngSilithar.setDamage(2);

			var action = abyssalCrawler1.actionAttack(youngSilithar);
			gameSession.executeAction(action);

			var egg = board.getUnitAtPosition({x:0, y:1});
			expect(egg.getId()).to.equal(SDK.Cards.Faction5.Egg);
			expect(egg.getHP()).to.equal(1);
			expect(egg.getATK()).to.equal(0);
		});
		it('expect egg to hatch back into original unit at end of next turn (young silithar)', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var youngSilithar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.YoungSilithar}, 0, 1, gameSession.getPlayer2Id());
			var abyssalCrawler1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalCrawler}, 1, 1, gameSession.getPlayer1Id());
			abyssalCrawler1.refreshExhaustion();

			youngSilithar.setDamage(2);

			var action = abyssalCrawler1.actionAttack(youngSilithar);
			gameSession.executeAction(action);

			var egg = board.getUnitAtPosition({x:0, y:1});
			expect(egg.getId()).to.equal(SDK.Cards.Faction5.Egg);

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var youngSilithar = board.getUnitAtPosition({x:0, y:1});
			expect(youngSilithar.getHP()).to.equal(3);
			expect(youngSilithar.getATK()).to.equal(2);
		});
		it('expect grow to gain stats at start of every turn (earth walker)', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var earthwalker = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.EarthWalker}, 0, 1, gameSession.getPlayer2Id());

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			expect(earthwalker.getHP()).to.equal(4);
			expect(earthwalker.getATK()).to.equal(4);

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			expect(earthwalker.getHP()).to.equal(5);
			expect(earthwalker.getATK()).to.equal(5);
		});
		it('expect primordial gazer to give friendly nearby minion +2/+2', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;
			var hailstoneGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.HailstoneGolem}, 0, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction5.PrimordialGazer}));
			var action = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(action);
			var followupCard = action.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 0, 1);
			gameSession.executeAction(followupAction);

			expect(followupAction.getIsValid()).to.equal(true);
			expect(hailstoneGolem.getHP()).to.equal(8);
			expect(hailstoneGolem.getATK()).to.equal(6);
		});
		it('expect vindicator to gain +2/+2 whenever opponent draws a card', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var vindicator = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Vindicator}, 0, 0, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.PhaseHound}));
			var action = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(action);

			expect(vindicator.getATK()).to.equal(3);
			expect(vindicator.getHP()).to.equal(5);
		});
		it('expect vindicator to not gain +2/+2 whenever opponent draws a card not from their own deck', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var vindicator = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Vindicator}, 0, 0, gameSession.getPlayer1Id());
			var lanternFox = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.LanternFox}, 0, 1, gameSession.getPlayer2Id());

			var myGeneral = gameSession.getGeneralForPlayer1();
			var action = myGeneral.actionAttack(lanternFox);
			gameSession.executeAction(action);

			expect(vindicator.getATK()).to.equal(1);
			expect(vindicator.getHP()).to.equal(3);
		});
		it('expect elucidator to deal 4 damage to own general when summoned', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction5.Elucidator}));
			var action = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(action);

			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(21);
		});
		it('expect spirit harvester to deal 1 damage to all friendly and enemy minions at end of turn and to not hurt self', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var earthwalker = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.EarthWalker}, 0, 1, gameSession.getPlayer2Id());
			var earthwalker2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.EarthWalker}, 1, 1, gameSession.getPlayer1Id());
			var spiritHarvester = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.SpiritHarvester}, 0, 0, gameSession.getPlayer1Id());

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(earthwalker.getHP()).to.equal(3);
			expect(earthwalker2.getHP()).to.equal(2);
			expect(spiritHarvester.getHP()).to.equal(5);
		});
		it('expect silithar elder to spawn silithar elder egg at end of every turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var silitharElder = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.SilitharElder}, 0, 1, gameSession.getPlayer1Id());

			gameSession.executeAction(gameSession.actionEndTurn());

			var eggx = 0;
			var eggy = 0;

			for (var xx = 0; xx < 10; xx++) {
				for (var yy = 0; yy < 5; yy++) {
					var egg = board.getUnitAtPosition({x: xx, y: yy});
					if (egg != null && egg.getId() === SDK.Cards.Faction5.Egg) {
						eggx = xx;
						eggy = yy;
						break;
					}
				}
			}

			var egg = board.getUnitAtPosition({x: eggx, y: eggy});

			var eggModifier = egg.getActiveModifierByClass(SDK.ModifierEgg);
			expect(eggModifier.cardDataOrIndexToSpawn.id).to.equal(SDK.Cards.Faction5.SilitharElder);

		});
		it('expect unstable leviathan to deal 4 damage to a random minion or general at start of owners turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var unstableLeviathan = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.UnstableLeviathan}, 0, 1, gameSession.getPlayer1Id());
			var hailstoneGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.HailstoneGolem}, 1, 1, gameSession.getPlayer2Id());

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var totalDamage = gameSession.getGeneralForPlayer1().getDamage() + gameSession.getGeneralForPlayer2().getDamage() + unstableLeviathan.getDamage() + hailstoneGolem.getDamage();

			expect(totalDamage).to.equal(4);
		});
	});
});
