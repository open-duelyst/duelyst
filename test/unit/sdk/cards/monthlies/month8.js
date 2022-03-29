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

describe("monthlies", function() {
  describe("month 8", function() {
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

    it('expect abjudicator to lower the cost of all spells in your action bar by 1', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Abjudicator}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      var hand = player1.getDeck().getCardsInHand();

      expect(hand[1].getManaCost()).to.equal(1);
      expect(hand[2].getManaCost()).to.equal(1);
      expect(hand[3].getManaCost()).to.equal(1);
    });
    it('expect abjudicator to not lower the cost of spells you replace into after abjudicator is played', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Abjudicator}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Maw}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      var action = player1.actionReplaceCardFromHand(1);
      gameSession.executeAction(action);

      var hand = player1.getDeck().getCardsInHand();

      expect(hand[1].getManaCost()).to.equal(2);
      expect(hand[2].getManaCost()).to.equal(1);
    });
    it('expect bastion to give all other friendly minions +1 health at end of turn', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      var maw = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Maw}, 1, 2, gameSession.getPlayer1Id());
      var bloodtearAlchemist = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BloodtearAlchemist}, 5, 2, gameSession.getPlayer1Id());
      var bastion = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Bastion}, 3, 4, gameSession.getPlayer1Id());
      var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 6, 2, gameSession.getPlayer2Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(maw.getHP()).to.equal(3);
      expect(bloodtearAlchemist.getHP()).to.equal(2);
      expect(bastion.getHP()).to.equal(5);
      expect(brightmossGolem.getHP()).to.equal(9);
    });
    it('expect alter rexx to put a mechaz0r in your hand when mechaz0r is summoned through mechs', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      var alterRexx = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.AlterRexx}, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Mechaz0rHelm}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Mechaz0rHelm}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Mechaz0rHelm}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Mechaz0rHelm}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Mechaz0rHelm}));

      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = player1.actionPlayCardFromHand(1, 2, 1);
      gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = player1.actionPlayCardFromHand(2, 3, 1);
      gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = player1.actionPlayCardFromHand(3, 4, 1);
      gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = player1.actionPlayCardFromHand(4, 5, 1);
      gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = player1.actionPlayFollowup(followupCard, 6, 1);
      gameSession.executeAction(followupAction);

      var hand = player1.getDeck().getCardsInHand();

      expect(hand[0].getId()).to.equal(SDK.Cards.Neutral.Mechaz0r);
    });
    it('expect alter rexx to put a mechaz0r in your hand when mechaz0r is summoned from hand', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      var alterRexx = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.AlterRexx}, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Mechaz0r}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      var hand = player1.getDeck().getCardsInHand();

      expect(hand[0].getId()).to.equal(SDK.Cards.Neutral.Mechaz0r);
    });
  });
});
