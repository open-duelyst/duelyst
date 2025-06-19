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

describe('special events', () => {
  describe('seven sisters', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction6.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction3.General },
      ];

      // setup test session
      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect lyonar sister to put True Strike in action bar when allied minion or general healed', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const lyonarSister = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SunSister }, 0, 1, gameSession.getPlayer1Id());

      gameSession.getGeneralForPlayer1().setDamage(2);
      lyonarSister.setDamage(1);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SundropElixir }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SundropElixir }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(1, 0, 1);
      gameSession.executeAction(playCardFromHandAction);

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getBaseCardId()).to.equal(SDK.Cards.Spell.TrueStrike);
      expect(hand[1].getBaseCardId()).to.equal(SDK.Cards.Spell.TrueStrike);
    });

    it('expect lyonar sister to put True Strike in action bar when enemy minion or general healed', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const lyonarSister = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SunSister }, 5, 1, gameSession.getPlayer1Id());
      const ironcliffe = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.IroncliffeGuardian }, 2, 3, gameSession.getPlayer2Id());

      gameSession.getGeneralForPlayer2().setDamage(2);
      ironcliffe.setDamage(1);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.HealingMystic }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = player1.actionPlayFollowup(followupCard, 8, 2);
      gameSession.executeAction(followupAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.HealingMystic }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(1, 2, 1);
      gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = player1.actionPlayFollowup(followupCard, 2, 3);
      gameSession.executeAction(followupAction);

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getBaseCardId()).to.equal(SDK.Cards.Spell.TrueStrike);
      expect(hand[1].getBaseCardId()).to.equal(SDK.Cards.Spell.TrueStrike);
    });

    it('expect songhai sister to increase damage done with spells by 1', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const songhaiSister = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.LightningSister }, 5, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(21);
    });

    it('expect vetruvian sister to increase generals attack by 1', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const vetruvianSister = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.SandSister }, 5, 1, gameSession.getPlayer1Id());

      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(3);
    });

    it('expect abyssian sister to heal general for 1 every time an enemy minion or general is damaged', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const abyssianSister = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.ShadowSister }, 5, 1, gameSession.getPlayer1Id());
      const ironcliffe = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.IroncliffeGuardian }, 2, 1, gameSession.getPlayer2Id());

      gameSession.getGeneralForPlayer1().setDamage(5);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(22);
    });

    it('expect magmar sister to deal equal amount of damage to all nearby enemies when taking damage', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const magmarSister = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.EarthSister }, 7, 2, gameSession.getPlayer1Id());
      const secondSun = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.WindbladeCommander }, 8, 3, gameSession.getPlayer2Id());

      magmarSister.refreshExhaustion();
      const action = magmarSister.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(secondSun.getDamage()).to.equal(2);
      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(5);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(secondSun.getDamage()).to.equal(5);
      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(8);
    });

    it('expect vanar sister to give summoned infiltrate minions +1/+1', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const vanarSister = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.WindSister }, 7, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction6.CrystalCloaker }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const crystalCloaker = board.getUnitAtPosition({ x: 1, y: 1 });
      expect(crystalCloaker.getHP()).to.equal(4);
      expect(crystalCloaker.getATK()).to.equal(3);
    });

    it('expect vanar sister to not give summoned monster without infiltrate a buff', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const vanarSister = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.WindSister }, 7, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction6.WindSister }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const crystalCloaker = board.getUnitAtPosition({ x: 1, y: 1 });
      expect(crystalCloaker.getHP()).to.equal(5);
      expect(crystalCloaker.getATK()).to.equal(4);
    });

    // Test disabled: slow.
    /*
    it('expect neutral sister to add 2 random lyonar cards to your hand when summoned', () => {
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

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.SwornSister }));
        const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
        gameSession.executeAction(playCardFromHandAction);

        const hand = player1.getDeck().getCardsInHand();
        expect(hand[0].getFactionId()).to.equal(SDK.Factions.Faction1);
        expect(hand[1].getFactionId()).to.equal(SDK.Factions.Faction1);
        expect(hand[0].getIsHiddenInCollection()).to.equal(false);
        expect(hand[1].getIsHiddenInCollection()).to.equal(false);
        expect(!(hand[0] instanceof SDK.Entity) || !hand[0].getIsGeneral()).to.equal(true);
        expect(!(hand[1] instanceof SDK.Entity) || !hand[1].getIsGeneral()).to.equal(true);

        SDK.GameSession.reset();
      }
    });
    */

    // Test disabled: slow.
    /*
    it('expect neutral sister to add 2 random songhai cards to your hand when summoned', () => {
      for (let i = 0; i < 100; i++) {
        const player1Deck = [
          { id: SDK.Cards.Faction2.General },
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

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.SwornSister }));
        const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
        gameSession.executeAction(playCardFromHandAction);

        const hand = player1.getDeck().getCardsInHand();
        expect(hand[0].getFactionId()).to.equal(SDK.Factions.Faction2);
        expect(hand[1].getFactionId()).to.equal(SDK.Factions.Faction2);
        expect(hand[0].getIsHiddenInCollection()).to.equal(false);
        expect(hand[1].getIsHiddenInCollection()).to.equal(false);
        expect(!(hand[0] instanceof SDK.Entity) || !hand[0].getIsGeneral()).to.equal(true);
        expect(!(hand[1] instanceof SDK.Entity) || !hand[1].getIsGeneral()).to.equal(true);

        SDK.GameSession.reset();
      }
    });
    */

    // Test disabled: slow.
    /*
    it('expect neutral sister to add 2 random vetruvian cards to your hand when summoned', () => {
      for (let i = 0; i < 100; i++) {
        const player1Deck = [
          { id: SDK.Cards.Faction3.General },
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

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.SwornSister }));
        const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
        gameSession.executeAction(playCardFromHandAction);

        const hand = player1.getDeck().getCardsInHand();
        expect(hand[0].getFactionId()).to.equal(SDK.Factions.Faction3);
        expect(hand[1].getFactionId()).to.equal(SDK.Factions.Faction3);
        expect(hand[0].getIsHiddenInCollection()).to.equal(false);
        expect(hand[1].getIsHiddenInCollection()).to.equal(false);
        expect(!(hand[0] instanceof SDK.Entity) || !hand[0].getIsGeneral()).to.equal(true);
        expect(!(hand[1] instanceof SDK.Entity) || !hand[1].getIsGeneral()).to.equal(true);

        SDK.GameSession.reset();
      }
    });
    */

    /* Test disabled: inconsistently slow
    it('expect neutral sister to add 2 random abyssian cards to your hand when summoned', () => {
      for (let i = 0; i < 100; i++) {
        const player1Deck = [
          { id: SDK.Cards.Faction4.General },
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

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.SwornSister }));
        const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
        gameSession.executeAction(playCardFromHandAction);

        const hand = player1.getDeck().getCardsInHand();
        expect(hand[0].getFactionId()).to.equal(SDK.Factions.Faction4);
        expect(hand[1].getFactionId()).to.equal(SDK.Factions.Faction4);
        expect(hand[0].getIsHiddenInCollection()).to.equal(false);
        expect(hand[1].getIsHiddenInCollection()).to.equal(false);
        expect(!(hand[0] instanceof SDK.Entity) || !hand[0].getIsGeneral()).to.equal(true);
        expect(!(hand[1] instanceof SDK.Entity) || !hand[1].getIsGeneral()).to.equal(true);

        SDK.GameSession.reset();
      }
    });
    */

    /* Test disabled: slow
    it('expect neutral sister to add 2 random magmar cards to your hand when summoned', function() {
      for(var i = 0; i < 100; i++){
        var player1Deck = [
          {id: SDK.Cards.Faction5.General},
        ];

        var player2Deck = [
          {id: SDK.Cards.Faction3.General},
        ];

        // setup test session
        UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

        var gameSession = SDK.GameSession.getInstance();
        var board = gameSession.getBoard();
        var player1 = gameSession.getPlayer1();
        player1.remainingMana = 9;

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.SwornSister}));
        var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
        gameSession.executeAction(playCardFromHandAction);

        var hand = player1.getDeck().getCardsInHand();
        expect(hand[0].getFactionId()).to.equal(SDK.Factions.Faction5);
        expect(hand[1].getFactionId()).to.equal(SDK.Factions.Faction5);
        expect(hand[0].getIsHiddenInCollection()).to.equal(false);
        expect(hand[1].getIsHiddenInCollection()).to.equal(false);
        expect(!(hand[0] instanceof SDK.Entity) || !hand[0].getIsGeneral()).to.equal(true);
        expect(!(hand[1] instanceof SDK.Entity) || !hand[1].getIsGeneral()).to.equal(true);

        SDK.GameSession.reset();
      }
    });
    */

    /* Test disabled: slow
    it('expect neutral sister to add 2 random vanar cards to your hand when summoned', () => {
      for (let i = 0; i < 100; i++) {
        const player1Deck = [
          { id: SDK.Cards.Faction6.General },
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

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.SwornSister }));
        const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
        gameSession.executeAction(playCardFromHandAction);

        const hand = player1.getDeck().getCardsInHand();
        expect(hand[0].getFactionId()).to.equal(SDK.Factions.Faction6);
        expect(hand[1].getFactionId()).to.equal(SDK.Factions.Faction6);
        expect(hand[0].getIsHiddenInCollection()).to.equal(false);
        expect(hand[1].getIsHiddenInCollection()).to.equal(false);
        expect(!(hand[0] instanceof SDK.Entity) || !hand[0].getIsGeneral()).to.equal(true);
        expect(!(hand[1] instanceof SDK.Entity) || !hand[1].getIsGeneral()).to.equal(true);

        SDK.GameSession.reset();
      }
    });
    */
  }); // end 7 sisters describe
});
