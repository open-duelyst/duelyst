const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../../../'));
require('coffeescript/register');
const expect = require('chai').expect;
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const UtilsSDK = require('test/utils/utils_sdk');
const _ = require('underscore');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('core set', () => {
  describe('basics', () => {
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

    it('expect repulsor beast to move an enemy minion anywhere on the board', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const osterix = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Oserix }, 1, 2, gameSession.getPlayer2Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.RepulsionBeast }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 1, 2);
      gameSession.executeAction(followupAction);
      const followupCard2 = followupAction.getCard().getCurrentFollowupCard();
      const followupAction2 = player1.actionPlayFollowup(followupCard2, 3, 3);
      gameSession.executeAction(followupAction2);

      expect(osterix.getPosition().x).to.equal(3);
      expect(osterix.getPosition().y).to.equal(3);
    });

    it('expect bloodtear alchemist to deal 1 damage to any minion or general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const osterix = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Oserix }, 1, 2, gameSession.getPlayer2Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.BloodtearAlchemist }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      expect(playCardFromHandAction.getIsValid()).to.equal(true);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 1, 2);
      gameSession.executeAction(followupAction);

      expect(osterix.getDamage()).to.equal(1);
    });

    it('expect ephemeral shroud to dispel a nearby space', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const osterix = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Oserix }, 1, 2, gameSession.getPlayer2Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.EphemeralShroud }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      expect(playCardFromHandAction.getIsValid()).to.equal(true);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 1, 2);
      gameSession.executeAction(followupAction);

      expect(osterix.getIsSilenced()).to.equal(true);
    });

    it('expect healing mystic to restore 2 health to a minion or general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;
      gameSession.getGeneralForPlayer1().setDamage(5);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.HealingMystic }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      expect(playCardFromHandAction.getIsValid()).to.equal(true);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 0, 2);
      gameSession.executeAction(followupAction);

      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(22);
    });

    it('expect necroseer to draw a card when dying', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const necroseer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Necroseer }, 7, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));

      necroseer.setDamage(3);

      necroseer.refreshExhaustion();
      const action = necroseer.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      const hand = player1.getDeck().getCardsInHand();
      const cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
    });

    it('expect bloodletter to deal double damage to generals', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const bloodletter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Bloodletter }, 7, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));

      bloodletter.refreshExhaustion();
      var action = bloodletter.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(8);

      bloodletter.refreshExhaustion();

      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 6, 2, gameSession.getPlayer2Id());

      bloodletter.refreshExhaustion();
      var action = bloodletter.actionAttack(brightmossGolem);
      gameSession.executeAction(action);

      expect(brightmossGolem.getDamage()).to.equal(4);
    });
  });
});
