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

		it('expect ragebinder to heal 3 health to your general only if you have another golem', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;
			gameSession.getGeneralForPlayer1().setDamage(3);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction5.Ragebinder}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction1);
			var hand1 = player1.getDeck().getCardsInHand();
			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(22);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction5.Ragebinder}));
			var playCardFromHandAction2 = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction2);
			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(25);
		});

		it('expect cascading rebirth to destroy a minion and summon a Magmar minion that costs 1 more', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var youngSilithar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.YoungSilithar}, 2, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.MoltenRebirth}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 2, 3);
			gameSession.executeAction(followupAction);
			var cascadeCheck = board.getUnitAtPosition({x:2, y: 3});

			expect(youngSilithar.getIsRemoved()).to.equal(true);
			expect(cascadeCheck.getFactionId()).to.equal(SDK.Factions.Faction5);
			expect(cascadeCheck.getManaCost()).to.equal(3);
		});

		it('expect cascading rebirth get nothing if no magmar minion is of an appropriate cost', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var bloodTaura = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BloodTaura}, 2, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.MoltenRebirth}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 2, 3);
			gameSession.executeAction(followupAction);
			var cascadeCheck = board.getUnitAtPosition({x:2, y: 3});
			expect(cascadeCheck).to.not.exist;
		});

		it('expect godhammer to give minions grow, keep grow buff when broken', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var brightmossGolem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 1, 1, gameSession.getPlayer1Id());
			var brightmossGolem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 1, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.GrowthBangle}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			expect(brightmossGolem1.getHP()).to.equal(10);
			expect(brightmossGolem2.getHP()).to.equal(10);
			expect(brightmossGolem1.getATK()).to.equal(5);
			expect(brightmossGolem2.getATK()).to.equal(5);

			player1.remainingMana = 9;
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Tempest}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Tempest}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Tempest}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));
			expect(brightmossGolem1.getHP()).to.equal(4);
			expect(brightmossGolem2.getHP()).to.equal(4);
			expect(brightmossGolem1.getATK()).to.equal(5);
			expect(brightmossGolem2.getATK()).to.equal(5);
		});

		it('expect lavaslasher to hit a nearby enemy and get hit back when summoned', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var tethermancer = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Tethermancer}, 0, 4, gameSession.getPlayer2Id());
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction5.Lavaslasher}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 0, 4);
			gameSession.executeAction(followupAction);

			var lavaslasher = board.getUnitAtPosition({x: 0, y: 3});

			expect(tethermancer.getHP()).to.equal(2);
			expect(lavaslasher.getHP()).to.equal(8);
			expect(lavaslasher.getIsSilenced()).to.equal(true);
		});

		it('expect juggernaut to summon golem eggs nearby when damaged', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var juggernaut = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Juggernaut}, 2, 2, gameSession.getPlayer1Id());
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Tempest}));
 			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));

			var eggCheck = board.getFriendlyEntitiesAroundEntity(juggernaut);
			expect(eggCheck[0].getId()).to.equal(SDK.Cards.Faction5.Egg);
			expect(eggCheck[1].getId()).to.equal(SDK.Cards.Faction5.Egg);
			expect(eggCheck[2]).to.not.exist;

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var eggCheck = board.getFriendlyEntitiesAroundEntity(juggernaut);
			//raceId 1 = golem
			expect(eggCheck[0].getRaceId()).to.equal(1);
			expect(eggCheck[1].getRaceId()).to.equal(1);
		});
	});
});
