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
  describe("month 5", function() {
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

    it('expect bone reaper to deal 2 damage to all nearby enemy minions at end of turn', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var boneReaper = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Bonereaper}, 7, 2, gameSession.getPlayer1Id());
      var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 7, 3, gameSession.getPlayer2Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(brightmossGolem.getDamage()).to.equal(2);
      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(0);
    });
    it('expect hollow grovekeeper to destroy a nearby enemy minion with provoke and gain provoke + frenzy', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      var rockPulverizer = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.RockPulverizer}, 0, 0, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.HollowGrovekeeper}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = player1.actionPlayFollowup(followupCard, 0, 0);
      gameSession.executeAction(followupAction);

      var hollowGrovekeeper = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.HollowGrovekeeper);

      expect(rockPulverizer.getIsRemoved()).to.equal(true);
      expect(hollowGrovekeeper.hasModifierClass(SDK.ModifierProvoke)).to.equal(true);
      expect(hollowGrovekeeper.hasModifierClass(SDK.ModifierFrenzy)).to.equal(true);
    });
    it('expect hollow grovekeeper to destroy a nearby enemy minion with frenzy and gain provoke + frenzy', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      var serpenti = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Serpenti}, 0, 0, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.HollowGrovekeeper}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = player1.actionPlayFollowup(followupCard, 0, 0);
      gameSession.executeAction(followupAction);

      var hollowGrovekeeper = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.HollowGrovekeeper);

      expect(serpenti.getIsRemoved()).to.equal(true);
      expect(hollowGrovekeeper.hasModifierClass(SDK.ModifierProvoke)).to.equal(true);
      expect(hollowGrovekeeper.hasModifierClass(SDK.ModifierFrenzy)).to.equal(true);
    });
    it('expect tethermancer to dispel minions that deal damage to it', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      var valeHunter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ValeHunter}, 0, 0, gameSession.getPlayer2Id());
      var tethermancer = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Tethermancer}, 6, 2, gameSession.getPlayer1Id());

      valeHunter.refreshExhaustion();

      var action = valeHunter.actionAttack(tethermancer);
      gameSession.executeAction(action);

      expect(valeHunter.isRanged()).to.equal(false);
    });
  });
});
