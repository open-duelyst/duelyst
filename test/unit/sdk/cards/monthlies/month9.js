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
  describe('month 9', () => {
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

    it('expect shiro puppydragon to give nearby friendly minions +1 attack at end of turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const shiro = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Shiro }, 1, 2, gameSession.getPlayer1Id());
      const maw1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Maw }, 1, 1, gameSession.getPlayer1Id());
      const maw2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Maw }, 2, 2, gameSession.getPlayer1Id());
      const maw3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Maw }, 2, 1, gameSession.getPlayer1Id());
      const maw4 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Maw }, 5, 1, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(maw1.getATK()).to.equal(3);
      expect(maw2.getATK()).to.equal(3);
      expect(maw3.getATK()).to.equal(3);
      expect(maw4.getATK()).to.equal(2);
    });

    /* Test disabled: failing
    it('expect grincher to put a random artifact in your action bar that costs 2 less mana', function() {
      for(var i = 0; i < 50; i++){ // looping through 50 times to make sure every artifact works
        var player1Deck = [
          {id: SDK.Cards.Faction6.General},
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

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Grincher}));
        var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
        gameSession.executeAction(playCardFromHandAction);

        var hand = player1.getDeck().getCardsInHand();
        expect(hand[0].type).to.equal(SDK.CardType.Artifact);
        if(hand[0].getBaseManaCost() <= 2){
          expect(hand[0].getManaCost()).to.equal(0);
        } else {
          expect(hand[0].getManaCostChange()).to.equal(-2);
        }

        SDK.GameSession.reset();
      }
    });
  */

    /* Test disabled: failing
  it('expect grincher to affect the mana cost correctly when the artifact is played', function() {
    for(var i = 0; i < 50; i++) { // looping through 50 times to make sure every artifact works
      var player1Deck = [
        {id: SDK.Cards.Faction6.General},
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

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Grincher}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      player1.remainingMana = 9;

      var hand = player1.getDeck().getCardsInHand();
      expect(hand[0].type).to.equal(SDK.CardType.Artifact);
      if(hand[0].getBaseManaCost() <= 2){
        expect(hand[0].getManaCost()).to.equal(0);
      } else {
        expect(hand[0].getManaCostChange()).to.equal(-2);
      }

      var reducedMana = hand[0].getBaseManaCost() + hand[0].getManaCostChange();
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      var currentMana = 9 - reducedMana;

      expect(player1.remainingMana).to.equal(currentMana);

      SDK.GameSession.reset();
    }
  });
  */

    it('expect the scientist to draw a card when you cast a spell on a friendly minion', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const scientist = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.TheScientist }, 1, 2, gameSession.getPlayer1Id());
      const golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.StormmetalGolem }, 5, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = player1.actionPlayCardFromHand(1, 5, 2);
      gameSession.executeAction(playCardFromHandAction);

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      expect(hand[1]).to.not.exist;
    });

    it('expect envybaer to teleport units damaged by it to a random corner of the board', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const envybaer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Envybaer }, 8, 1, gameSession.getPlayer1Id());
      const golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 8, 0, gameSession.getPlayer2Id());

      envybaer.refreshExhaustion();
      var action = envybaer.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      envybaer.refreshExhaustion();
      var action = envybaer.actionAttack(golem);
      gameSession.executeAction(action);

      let generalInCorner = false;
      let golemInCorner = false;

      const corner1 = board.getUnitAtPosition({ x: 0, y: 0 });
      const corner2 = board.getUnitAtPosition({ x: 0, y: 4 });
      const corner3 = board.getUnitAtPosition({ x: 8, y: 0 });
      const corner4 = board.getUnitAtPosition({ x: 8, y: 4 });

      if (corner1 != null) {
        if (corner1.getId() === SDK.Cards.Neutral.BrightmossGolem) {
          golemInCorner = true;
        }
        if (corner1.getId() === SDK.Cards.Faction1.General) {
          generalInCorner = true;
        }
      }
      if (corner2 != null) {
        if (corner2.getId() === SDK.Cards.Neutral.BrightmossGolem) {
          golemInCorner = true;
        }
        if (corner2.getId() === SDK.Cards.Faction1.General) {
          generalInCorner = true;
        }
      }
      if (corner3 != null) {
        if (corner3.getId() === SDK.Cards.Neutral.BrightmossGolem) {
          golemInCorner = true;
        }
        if (corner3.getId() === SDK.Cards.Faction1.General) {
          generalInCorner = true;
        }
      }
      if (corner4 != null) {
        if (corner4.getId() === SDK.Cards.Neutral.BrightmossGolem) {
          golemInCorner = true;
        }
        if (corner4.getId() === SDK.Cards.Faction1.General) {
          generalInCorner = true;
        }
      }

      expect(golemInCorner).to.equal(true);
      expect(generalInCorner).to.equal(true);
    });
  });
});
