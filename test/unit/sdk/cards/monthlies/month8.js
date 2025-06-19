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
  describe('month 8', () => {
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

    it('expect abjudicator to lower the cost of all spells in your action bar by 1', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Abjudicator }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const hand = player1.getDeck().getCardsInHand();

      expect(hand[1].getManaCost()).to.equal(1);
      expect(hand[2].getManaCost()).to.equal(1);
      expect(hand[3].getManaCost()).to.equal(1);
    });

    it('expect abjudicator to not lower the cost of spells you replace into after abjudicator is played', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Abjudicator }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Maw }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const action = player1.actionReplaceCardFromHand(1);
      gameSession.executeAction(action);

      const hand = player1.getDeck().getCardsInHand();

      expect(hand[1].getManaCost()).to.equal(2);
      expect(hand[2].getManaCost()).to.equal(1);
    });

    it('expect bastion to give all other friendly minions +1 health at end of turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const maw = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Maw }, 1, 2, gameSession.getPlayer1Id());
      const bloodtearAlchemist = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BloodtearAlchemist }, 5, 2, gameSession.getPlayer1Id());
      const bastion = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Bastion }, 3, 4, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 6, 2, gameSession.getPlayer2Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(maw.getHP()).to.equal(3);
      expect(bloodtearAlchemist.getHP()).to.equal(2);
      expect(bastion.getHP()).to.equal(5);
      expect(brightmossGolem.getHP()).to.equal(9);
    });

    it('expect alter rexx to put a mechaz0r in your hand when mechaz0r is summoned through mechs', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const alterRexx = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.AlterRexx }, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Mechaz0rHelm }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Mechaz0rHelm }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Mechaz0rHelm }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Mechaz0rHelm }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Mechaz0rHelm }));

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
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 6, 1);
      gameSession.executeAction(followupAction);

      const hand = player1.getDeck().getCardsInHand();

      expect(hand[0].getId()).to.equal(SDK.Cards.Neutral.Mechaz0r);
    });

    it('expect alter rexx to put a mechaz0r in your hand when mechaz0r is summoned from hand', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const alterRexx = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.AlterRexx }, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Mechaz0r }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const hand = player1.getDeck().getCardsInHand();

      expect(hand[0].getId()).to.equal(SDK.Cards.Neutral.Mechaz0r);
    });
  });
});
