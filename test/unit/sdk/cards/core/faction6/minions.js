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

describe("faction6", function() {
	describe("minions", function(){
		beforeEach(function () {
			var player1Deck = [
				{id: SDK.Cards.Faction6.General},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction2.General},
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect infiltrated effects to activate when on enemys side of board (crystal cloaker)', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var crystalCloaker = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.CrystalCloaker}, 6, 1, gameSession.getPlayer1Id());

			expect(crystalCloaker.getATK()).to.equal(4);
		});
		it('expect infiltrated effects to not activate when on center or own side of board (crystal cloaker)', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var crystalCloaker = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.CrystalCloaker}, 0, 1, gameSession.getPlayer1Id());

			expect(crystalCloaker.getATK()).to.equal(2);
		});
		it('expect snow chaser to return to hand when dying on opponents side of board', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var snowChaser = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.WyrBeast}, 7, 2, gameSession.getPlayer1Id());
			snowChaser.refreshExhaustion();
			var action = snowChaser.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0].getId()).to.equal(SDK.Cards.Faction6.WyrBeast);
		});
		it('expect borean bear to gain +1 attack when you summon vespyr minions', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var boreanBear = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.BoreanBear}, 7, 2, gameSession.getPlayer1Id());
			expect(boreanBear.getATK()).to.equal(1);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction6.WyrBeast}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			expect(boreanBear.getATK()).to.equal(2);
		});
		it('expect crystal wisp to give permanent +1 mana crystal on death', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var crystalWisp = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.CrystalWisp}, 7, 2, gameSession.getPlayer1Id());
			crystalWisp.refreshExhaustion();
			var action = crystalWisp.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			expect(player1.getRemainingMana()).to.equal(4);
		});
		it('expect crystal wisp to not give +1 mana crystal on death if already at 9 mana', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var crystalWisp = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.CrystalWisp}, 7, 2, gameSession.getPlayer1Id());
			crystalWisp.refreshExhaustion();
			var action = crystalWisp.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			expect(player1.getRemainingMana()).to.equal(9);
		});
		it('expect hearth sister to switch places with any minion when summoned', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var crystalWisp = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.CrystalWisp}, 7, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction6.HearthSister}));

			player1.remainingMana = 9;

			var action = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(action);
			var followupCard = action.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 7, 2);
			gameSession.executeAction(followupAction);

			var crystalWisp = board.getUnitAtPosition({x:1,y:1});
			var hearthseeker = board.getUnitAtPosition({x:7,y:2});
			expect(crystalWisp.getId()).to.equal(SDK.Cards.Faction6.CrystalWisp);
			expect(hearthseeker.getId()).to.equal(SDK.Cards.Faction6.HearthSister);
		});
		it('expect fenrir warmaster to leave behind 3/2 ghost wolf on death', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var fenrir = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.FenrirWarmaster}, 7, 2, gameSession.getPlayer1Id());
			fenrir.refreshExhaustion();
			fenrir.setDamage(1);
			var action = fenrir.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);

			var wolf = board.getUnitAtPosition({x:7,y:2});
			expect(wolf.getId()).to.equal(SDK.Cards.Faction6.GhostWolf);
			expect(wolf.getHP()).to.equal(2);
			expect(wolf.getATK()).to.equal(3);
		});
		it('expect glacial elemental to deal 2 damage to a random enemy minion when vespyr summoned', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var snowElemental = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.SnowElemental}, 7, 2, gameSession.getPlayer1Id());
			var arcticDisplacer = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.ArcticDisplacer}, 5, 2, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction6.WyrBeast}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(arcticDisplacer.getDamage()).to.equal(2);
		});
		it('expect razorback to give all friendly minions +2 attack this turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var snowchaser = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.WyrBeast}, 7, 2, gameSession.getPlayer1Id());
			var wall = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.BlazingSpines}, 5, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction6.Razorback}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(snowchaser.getATK()).to.equal(4);
			expect(wall.getATK()).to.equal(5);

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(snowchaser.getATK()).to.equal(2);
			expect(wall.getATK()).to.equal(3);
		});
		it('expect voice of the wind to summon 2/2 vespyr winter in random nearby space when a minion played from action bar', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var voiceoftheWind = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.VoiceoftheWind}, 7, 2, gameSession.getPlayer1Id());
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction6.WyrBeast}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			var unitArray = board.getUnits();
			expect(unitArray[4].getId()).to.equal(SDK.Cards.Faction6.WaterBear);
		});
		it('expect voice of the wind to not summon 2/2 vespyr when using bonechill barrier', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var voiceoftheWind = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.VoiceoftheWind}, 7, 2, gameSession.getPlayer1Id());
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.BonechillBarrier}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 0, 4);
			gameSession.executeAction(followupAction);
			var followupCard2 = followupAction.getCard().getCurrentFollowupCard();
			var followupAction2 = player1.actionPlayFollowup(followupCard2, 1, 4);
			gameSession.executeAction(followupAction2);

			var wraithlingx = 0;
			var wraithlingy = 0;

			for (var xx = 0; xx < 10; xx++) {
				for (var yy = 0; yy < 5; yy++) {
					var wraithling = board.getUnitAtPosition({x: xx, y: yy});
					if (wraithling != null && wraithling.getId() === SDK.Cards.Faction6.WaterBear) {
						wraithlingx = xx;
						wraithlingy = yy;
						break;
					}
				}
			}

			var wraithling = board.getUnitAtPosition({x: wraithlingx, y: wraithlingy});

			expect(wraithling).to.equal(undefined);
		});
		it('expect draugar lord to leave behind 4/8 drake on death', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var draugar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.PrismaticGiant}, 7, 2, gameSession.getPlayer1Id());
			draugar.refreshExhaustion();
			draugar.setDamage(7);
			var action = draugar.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);

			var wolf = board.getUnitAtPosition({x:7,y:2});
			expect(wolf.getId()).to.equal(SDK.Cards.Faction6.IceDrake);
			expect(wolf.getHP()).to.equal(8);
			expect(wolf.getATK()).to.equal(4);
		});
		it('expect ancient grove to give friendly minions dying wish: summon 1/1 treant with provoke', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;
			var arctic = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.ArcticDisplacer}, 7, 2, gameSession.getPlayer1Id());
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction6.AncientGrove}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			arctic.refreshExhaustion();
			arctic.setDamage(3);
			var action = arctic.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);

			var treant = board.getUnitAtPosition({x:7,y:2});
			expect(treant.getId()).to.equal(SDK.Cards.Faction6.Treant);
		});

	});
});
