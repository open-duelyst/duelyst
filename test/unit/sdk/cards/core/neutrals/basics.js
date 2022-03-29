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

describe("core set", function() {
	describe("basics", function() {
		beforeEach(function () {
			var player1Deck = [
				{id: SDK.Cards.Faction6.General},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction1.General},
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect repulsor beast to move an enemy minion anywhere on the board', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var osterix = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Oserix}, 1, 2, gameSession.getPlayer2Id());

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.RepulsionBeast}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 1, 2);
			gameSession.executeAction(followupAction);
			var followupCard2 = followupAction.getCard().getCurrentFollowupCard();
			var followupAction2 = player1.actionPlayFollowup(followupCard2, 3, 3);
			gameSession.executeAction(followupAction2);

			expect(osterix.getPosition().x).to.equal(3);
			expect(osterix.getPosition().y).to.equal(3);
		});
		it('expect bloodtear alchemist to deal 1 damage to any minion or general', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var osterix = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Oserix}, 1, 2, gameSession.getPlayer2Id());

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.BloodtearAlchemist}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			expect(playCardFromHandAction.getIsValid()).to.equal(true);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 1, 2);
			gameSession.executeAction(followupAction);

			expect(osterix.getDamage()).to.equal(1);
		});
		it('expect ephemeral shroud to dispel a nearby space', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var osterix = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Oserix}, 1, 2, gameSession.getPlayer2Id());

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.EphemeralShroud}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			expect(playCardFromHandAction.getIsValid()).to.equal(true);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 1, 2);
			gameSession.executeAction(followupAction);

			expect(osterix.getIsSilenced()).to.equal(true);
		});
		it('expect healing mystic to restore 2 health to a minion or general', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;
			gameSession.getGeneralForPlayer1().setDamage(5);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.HealingMystic}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			expect(playCardFromHandAction.getIsValid()).to.equal(true);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 0, 2);
			gameSession.executeAction(followupAction);

			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(22);
		});
		it('expect necroseer to draw a card when dying', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var necroseer = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Necroseer}, 7, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));

			necroseer.setDamage(3);

			necroseer.refreshExhaustion();
			var action = necroseer.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);

			var hand = player1.getDeck().getCardsInHand();
			var cardDraw = hand[0];
			expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
		});
		it('expect bloodletter to deal double damage to generals', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var bloodletter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Bloodletter}, 7, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));

			bloodletter.refreshExhaustion();
			var action = bloodletter.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);

			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(8);

			bloodletter.refreshExhaustion();

			var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 6, 2, gameSession.getPlayer2Id());

			bloodletter.refreshExhaustion();
			var action = bloodletter.actionAttack(brightmossGolem);
			gameSession.executeAction(action);

			expect(brightmossGolem.getDamage()).to.equal(4);
		});
	});
});
