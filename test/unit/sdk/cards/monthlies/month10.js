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
  describe('month 10', () => {
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

    it('expect blistering skorn to deal 1 damage to all minions and generals including self upon summon', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const shiro = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Shiro }, 1, 2, gameSession.getPlayer2Id());
      const maw1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Maw }, 1, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.BlisteringSkorn }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
      gameSession.executeAction(playCardFromHandAction);

      expect(maw1.getDamage()).to.equal(1);
      expect(shiro.getDamage()).to.equal(1);
      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(1);
      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(1);
      expect(board.getUnitAtPosition({ x: 0, y: 3 }).getDamage()).to.equal(1);
    });

    it('expect chakkram to cost 2 less if your general took damage last turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      player1.remainingMana = 9;
      player2.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Chakkram }));
      var hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getManaCost()).to.equal(5);

      gameSession.executeAction(gameSession.actionEndTurn());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      const playCardFromHandAction = player2.actionPlayCardFromHand(0, 0, 2);
      gameSession.executeAction(playCardFromHandAction);

      gameSession.executeAction(gameSession.actionEndTurn());

      var hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getManaCost()).to.equal(3);
    });

    it('expect blood tauras cost to be equal to your generals current health', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.BloodTaura }));
      var hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getManaCost()).to.equal(25);

      var damageAction = new SDK.DamageAction(gameSession);
      damageAction.setTarget(gameSession.getGeneralForPlayer1());
      damageAction.setDamageAmount(5);
      UtilsSDK.executeActionWithoutValidation(damageAction);

      var hand = player1.getDeck().getCardsInHand();
      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(20);
      expect(hand[0].getManaCost()).to.equal(20);

      var damageAction = new SDK.DamageAction(gameSession);
      damageAction.setTarget(gameSession.getGeneralForPlayer1());
      damageAction.setDamageAmount(19);
      UtilsSDK.executeActionWithoutValidation(damageAction);

      var hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getManaCost()).to.equal(1);

      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.IceCage }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
      gameSession.executeAction(playCardFromHandAction);

      var hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getManaCost()).to.equal(1);
    });

    it('expect ruby rifter to gain +2 attack whenever your general is damaged', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.RubyRifter }));
      var hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getATK()).to.equal(4);

      var damageAction = new SDK.DamageAction(gameSession);
      damageAction.setTarget(gameSession.getGeneralForPlayer1());
      damageAction.setDamageAmount(5);
      UtilsSDK.executeActionWithoutValidation(damageAction);

      var hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getATK()).to.equal(4);

      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
      gameSession.executeAction(playCardFromHandAction);

      var damageAction = new SDK.DamageAction(gameSession);
      damageAction.setTarget(gameSession.getGeneralForPlayer1());
      damageAction.setDamageAmount(5);
      UtilsSDK.executeActionWithoutValidation(damageAction);

      expect(board.getUnitAtPosition({ x: 0, y: 3 }).getATK()).to.equal(6);
    });

    it('expect ruby rifter to draw a card whenever your general is damaged', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.RubyRifter }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));

      var damageAction = new SDK.DamageAction(gameSession);
      damageAction.setTarget(gameSession.getGeneralForPlayer1());
      damageAction.setDamageAmount(5);
      UtilsSDK.executeActionWithoutValidation(damageAction);

      var hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      expect(hand[1]).to.not.exist;

      var damageAction = new SDK.DamageAction(gameSession);
      damageAction.setTarget(gameSession.getGeneralForPlayer1());
      damageAction.setDamageAmount(5);
      UtilsSDK.executeActionWithoutValidation(damageAction);

      var hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      expect(hand[1].getId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      expect(hand[2]).to.not.exist;
    });
  });
});
