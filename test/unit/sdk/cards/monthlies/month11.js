const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../../'));
require('coffeescript/register');
const expect = require('chai').expect;
const ModifierTranscendance = require('app/sdk/modifiers/modifierTranscendance');
const ModifierForcefield = require('app/sdk/modifiers/modifierForcefield');
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const UtilsSDK = require('test/utils/utils_sdk');
const _ = require('underscore');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('monthlies', () => {
  describe('month 11', () => {
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

    it('expect wood-wen to give a friendly minion provoke', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const maw1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Maw }, 1, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.WoodWen }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 0);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 1, 1);
      gameSession.executeAction(followupAction);

      expect(maw1.hasActiveModifierClass(SDK.ModifierProvoke)).to.equal(true);
    });

    /* Test disabled: Slow.
    it('expect elkowl to gain two random abilities', () => {
      for (let i = 0; i < 100; i++) {
        const player1Deck = [
          { id: SDK.Cards.Faction1.General },
        ];

        const player2Deck = [
          { id: SDK.Cards.Faction3.General },
        ];

        // setup test session
        UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

        const gameSession = SDK.GameSession.getInstance();
        const board = gameSession.getBoard();
        const player1 = gameSession.getPlayer1();
        player1.remainingMana = 9;

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Elkowl }));
        const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
        gameSession.executeAction(playCardFromHandAction);

        const elkowl = board.getUnitAtPosition({ x: 1, y: 1 });

        let modifierCount = 0;

        if (elkowl.hasActiveModifierClass(SDK.ModifierProvoke)) { modifierCount++; }
        if (elkowl.hasActiveModifierClass(SDK.ModifierRanged)) { modifierCount++; }
        if (elkowl.hasActiveModifierClass(SDK.ModifierBlastAttack)) { modifierCount++; }
        if (elkowl.hasActiveModifierClass(SDK.ModifierFirstBlood)) { modifierCount++; }
        if (elkowl.hasActiveModifierClass(SDK.ModifierFlying)) { modifierCount++; }
        if (elkowl.hasActiveModifierClass(SDK.ModifierFrenzy)) { modifierCount++; }
        if (elkowl.hasActiveModifierClass(SDK.ModifierRebirth)) { modifierCount++; }
        if (elkowl.hasActiveModifierClass(ModifierTranscendance)) { modifierCount++; }

        expect(modifierCount).to.equal(2);

        SDK.GameSession.reset();
      }
    });
    */

    it('expect grove lion to give your general forcefield', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const groveLion = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.GroveLion }, 1, 1, gameSession.getPlayer1Id());

      expect(gameSession.getGeneralForPlayer1().hasActiveModifierClass(ModifierForcefield)).to.equal(true);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SpiralTechnique }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer1().hasActiveModifierClass(ModifierForcefield)).to.equal(false);
    });

    it('expect dominate will on a grove lion to switch forcefield status between generals', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;

      const groveLion = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.GroveLion }, 1, 2, gameSession.getPlayer2Id());

      expect(groveLion.ownerId).to.equal('player2_id');

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Enslave }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(groveLion.ownerId).to.equal('player1_id');
      expect(gameSession.getGeneralForPlayer2().hasActiveModifierClass(ModifierForcefield)).to.equal(false);
      expect(gameSession.getGeneralForPlayer1().hasActiveModifierClass(ModifierForcefield)).to.equal(true);
    });

    it('expect sphynx to give your opponent a riddle spell', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Sphynx }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const hand = player2.getDeck().getCardsInHand();
      expect(hand[0].getId()).to.equal(SDK.Cards.Spell.Riddle);
    });

    it('expect riddle to not allow you to replace while in your hand', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Riddle }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrueStrike }));

      var action = player1.actionReplaceCardFromHand(1);
      gameSession.executeAction(action);

      var hand = player1.getDeck().getCardsInHand();
      expect(hand[1].getId()).to.equal(SDK.Cards.Spell.PhoenixFire);

      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      var action = player1.actionReplaceCardFromHand(1);
      gameSession.executeAction(action);

      var hand = player1.getDeck().getCardsInHand();
      expect(hand[1].getId()).to.equal(SDK.Cards.Spell.TrueStrike);
    });

    it('expect riddle to be transfered to opponent after being cast', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Riddle }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const hand = player2.getDeck().getCardsInHand();
      expect(hand[0].getId()).to.equal(SDK.Cards.Spell.Riddle);
    });
  });
});
