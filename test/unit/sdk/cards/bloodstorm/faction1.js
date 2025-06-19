const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../../'));
require('coffeescript/register');
const expect = require('chai').expect;
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const UtilsSDK = require('test/utils/utils_sdk');
const _ = require('underscore');
const ModifierForcefield = require('app/sdk/modifiers/modifierForcefield');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('bloodstorm', () => {
  describe('faction1', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect scintilla to restore 3 health to your general whenever you activate your bbs', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      // cycle turns until you can use bloodborn spell
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      gameSession.getGeneralForPlayer1().setDamage(10);

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer1Id());
      const scintilla = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.Scintilla }, 4, 3, gameSession.getPlayer1Id());

      const action = player1.actionPlaySignatureCard(1, 1);
      gameSession.executeAction(action);

      expect(silverguardSquire.getHP()).to.equal(4);
      expect(silverguardSquire.getATK()).to.equal(3);

      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(7);
    });

    it('expect draining wave to deal 4 damage to a minion and your general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const ironcliffe = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.IroncliffeGuardian }, 3, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.DrainingWave }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 3, 1));

      expect(ironcliffe.getDamage()).to.equal(4);
      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(4);
    });

    it('expect sunbreaker to turn your BBS into tempest', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const signatureCardBefore = player1.getCurrentSignatureCard();
      expect(signatureCardBefore).to.exist;
      expect(signatureCardBefore.getBaseCardId()).to.not.equal(SDK.Cards.Spell.TempestBBS);

      const sunbreaker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.Sunbreaker }, 4, 3, gameSession.getPlayer1Id());

      const signatureCardAfter = player1.getCurrentSignatureCard();
      expect(signatureCardAfter).to.exist;
      expect(signatureCardAfter.getBaseCardId()).to.not.equal(signatureCardBefore.getBaseCardId());
      expect(signatureCardAfter.getBaseCardId()).to.equal(SDK.Cards.Spell.TempestBBS);
    });

    it('expect zir to retain the sunbreaker tempest BBS and return to original generals BBS when sunbreaker dies', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const signatureCardBefore = player1.getCurrentSignatureCard();
      expect(signatureCardBefore).to.exist;
      expect(signatureCardBefore.getBaseCardId()).to.not.equal(SDK.Cards.Spell.TempestBBS);

      const sunbreaker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.Sunbreaker }, 4, 3, gameSession.getPlayer1Id());

      var signatureCardAfter = player1.getCurrentSignatureCard();
      expect(signatureCardAfter).to.exist;
      expect(signatureCardAfter.getBaseCardId()).to.not.equal(signatureCardBefore.getBaseCardId());
      expect(signatureCardAfter.getBaseCardId()).to.equal(SDK.Cards.Spell.TempestBBS);

      const grandmasterZir = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.GrandmasterZir }, 0, 1, gameSession.getPlayer1Id());

      var damageAction = new SDK.DamageAction(gameSession);
      damageAction.setTarget(gameSession.getGeneralForPlayer1());
      damageAction.setDamageAmount(gameSession.getGeneralForPlayer1().getHP());
      UtilsSDK.executeActionWithoutValidation(damageAction);

      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(12);
      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(5);

      var signatureCardAfter = player1.getCurrentSignatureCard();
      expect(signatureCardAfter).to.exist;
      expect(signatureCardAfter.getBaseCardId()).to.not.equal(signatureCardBefore.getBaseCardId());
      expect(signatureCardAfter.getBaseCardId()).to.equal(SDK.Cards.Spell.TempestBBS);

      var damageAction = new SDK.DamageAction(gameSession);
      damageAction.setTarget(sunbreaker);
      damageAction.setDamageAmount(sunbreaker.getHP());
      UtilsSDK.executeActionWithoutValidation(damageAction);
      var damageAction = new SDK.DamageAction(gameSession);
      damageAction.setTarget(sunbreaker);
      damageAction.setDamageAmount(sunbreaker.getHP());
      UtilsSDK.executeActionWithoutValidation(damageAction);

      var signatureCardAfter = player1.getCurrentSignatureCard();
      expect(signatureCardAfter.getBaseCardId()).to.equal(signatureCardBefore.getBaseCardId());
    });

    it('expect prism barrier to give a friendly minion forcefield', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const ironcliffe = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.IroncliffeGuardian }, 3, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PrismBarrier }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 3, 1));

      expect(ironcliffe.hasActiveModifierClass(ModifierForcefield)).to.equal(true);
    });

    it('expect trinity oath to draw 3 cards and restore 3 health to your general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrinityOath }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrinityOath }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrinityOath }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrinityOath }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrinityOath }));

      gameSession.getGeneralForPlayer1().setDamage(5);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrinityOath }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 3, 1));

      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(2);

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[2].getId()).to.equal(SDK.Cards.Spell.TrinityOath);
      expect(hand[1].getId()).to.equal(SDK.Cards.Spell.TrinityOath);
      expect(hand[0].getId()).to.equal(SDK.Cards.Spell.TrinityOath);
      expect(hand[3]).to.not.exist;
    });

    it('expect excelsious to gain +1/+1 from deck whenever anything is healed', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.Excelsious }));

      const ironcliffe = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.IroncliffeGuardian }, 3, 1, gameSession.getPlayer1Id());
      ironcliffe.setDamage(5);
      gameSession.getGeneralForPlayer1().setDamage(5);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SundropElixir }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 3, 1));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SundropElixir }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 2));

      gameSession.executeAction(gameSession.actionEndTurn());

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getId()).to.equal(SDK.Cards.Faction1.Excelsious);
      expect(hand[0].getATK()).to.equal(8);
      expect(hand[0].getHP()).to.equal(8);
    });

    it('expect excelsious to gain +1/+1 from hand whenever anything is healed', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.Excelsious }));

      const ironcliffe = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.IroncliffeGuardian }, 3, 1, gameSession.getPlayer1Id());
      ironcliffe.setDamage(5);
      gameSession.getGeneralForPlayer1().setDamage(5);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SundropElixir }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(1, 3, 1));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SundropElixir }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(1, 0, 2));

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getId()).to.equal(SDK.Cards.Faction1.Excelsious);
      expect(hand[0].getATK()).to.equal(8);
      expect(hand[0].getHP()).to.equal(8);
    });

    it('expect excelsious to gain +1/+1 while in play whenever anything is healed', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const excelsious = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.Excelsious }, 2, 1, gameSession.getPlayer1Id());
      const ironcliffe = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.IroncliffeGuardian }, 3, 1, gameSession.getPlayer1Id());
      ironcliffe.setDamage(5);
      gameSession.getGeneralForPlayer1().setDamage(5);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SundropElixir }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 3, 1));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SundropElixir }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 2));

      expect(excelsious.getATK()).to.equal(8);
      expect(excelsious.getHP()).to.equal(8);
    });
  });
});
