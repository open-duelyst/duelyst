const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../../'));
require('coffeescript/register');
const expect = require('chai').expect;
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const UtilsSDK = require('test/utils/utils_sdk');
const _ = require('underscore');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('monthlies', () => {
  describe('month 5', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction6.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect bone reaper to deal 2 damage to all nearby enemy minions at end of turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const boneReaper = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Bonereaper }, 7, 2, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 7, 3, gameSession.getPlayer2Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(brightmossGolem.getDamage()).to.equal(2);
      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(0);
    });

    it('expect hollow grovekeeper to destroy a nearby enemy minion with provoke and gain provoke + frenzy', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const rockPulverizer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.RockPulverizer }, 0, 0, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.HollowGrovekeeper }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 0, 0);
      gameSession.executeAction(followupAction);

      const hollowGrovekeeper = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.HollowGrovekeeper);

      expect(rockPulverizer.getIsRemoved()).to.equal(true);
      expect(hollowGrovekeeper.hasModifierClass(SDK.ModifierProvoke)).to.equal(true);
      expect(hollowGrovekeeper.hasModifierClass(SDK.ModifierFrenzy)).to.equal(true);
    });

    it('expect hollow grovekeeper to destroy a nearby enemy minion with frenzy and gain provoke + frenzy', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const serpenti = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Serpenti }, 0, 0, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.HollowGrovekeeper }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 0, 0);
      gameSession.executeAction(followupAction);

      const hollowGrovekeeper = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.HollowGrovekeeper);

      expect(serpenti.getIsRemoved()).to.equal(true);
      expect(hollowGrovekeeper.hasModifierClass(SDK.ModifierProvoke)).to.equal(true);
      expect(hollowGrovekeeper.hasModifierClass(SDK.ModifierFrenzy)).to.equal(true);
    });

    it('expect tethermancer to dispel minions that deal damage to it', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 0, 0, gameSession.getPlayer2Id());
      const tethermancer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Tethermancer }, 6, 2, gameSession.getPlayer1Id());

      valeHunter.refreshExhaustion();

      const action = valeHunter.actionAttack(tethermancer);
      gameSession.executeAction(action);

      expect(valeHunter.isRanged()).to.equal(false);
    });
  });
});
