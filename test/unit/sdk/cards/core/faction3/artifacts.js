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

describe("faction3", function() {
	describe("artifacts", function(){

		beforeEach(function () {
			// define test decks.  Spells do not work.  Only add minions and generals this way
			var player1Deck = [
				{id: SDK.Cards.Faction3.General},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction1.General},
			];

			// setup test session
			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

		});

		afterEach(function () {
			SDK.GameSession.reset();
		});


		it('expect staff of ykir to give general +2 attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.StaffOfYKir}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(4);
		});
		it('expect wildfire ankh to give general blast', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.AnkhFireNova}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			expect(gameSession.getGeneralForPlayer1().hasModifierClass(SDK.ModifierBlastAttack)).to.equal(true);
		});
    it('expect hexblade to give general +3 attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.PoisonHexblade}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(5);
		});
    it('expect hexblade to make enemy minion attack to 1 before getting countered', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.PoisonHexblade}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 0, 1, gameSession.getPlayer2Id());

			var action = gameSession.getGeneralForPlayer1().actionAttack(brightmossGolem);
			gameSession.executeAction(action);

			expect(brightmossGolem.getATK()).to.equal(1);
			expect(brightmossGolem.getHP()).to.equal(4);
			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(24);
		});

	});  //end Spells describe

});
