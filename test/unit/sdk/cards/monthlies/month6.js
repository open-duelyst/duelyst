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
  describe('month 6', () => {
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

    it('expect forcefield to prevent the first source of damage each turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const sapphireSeer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SapphireSeer }, 7, 2, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 7, 3, gameSession.getPlayer2Id());

      sapphireSeer.refreshExhaustion();

      const action = sapphireSeer.actionAttack(brightmossGolem);
      gameSession.executeAction(action);

      expect(brightmossGolem.getDamage()).to.equal(2);
      expect(sapphireSeer.getDamage()).to.equal(0);
    });

    it('expect forcefield to not prevent the second source of damage each turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const sapphireSeer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SapphireSeer }, 7, 2, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 7, 3, gameSession.getPlayer2Id());

      player1.remainingMana = 9;
      sapphireSeer.refreshExhaustion();
      const action = sapphireSeer.actionAttack(brightmossGolem);
      gameSession.executeAction(action);

      expect(brightmossGolem.getDamage()).to.equal(2);
      expect(sapphireSeer.getDamage()).to.equal(0);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(sapphireSeer.getIsRemoved()).to.equal(true);
    });

    it('expect expect forcefield to regenerate after your turn ends', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const sapphireSeer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SapphireSeer }, 7, 2, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 7, 3, gameSession.getPlayer2Id());

      sapphireSeer.refreshExhaustion();

      var action = sapphireSeer.actionAttack(brightmossGolem);
      gameSession.executeAction(action);

      expect(brightmossGolem.getDamage()).to.equal(2);
      expect(sapphireSeer.getDamage()).to.equal(0);

      gameSession.executeAction(gameSession.actionEndTurn());

      var action = brightmossGolem.actionAttack(sapphireSeer);
      gameSession.executeAction(action);

      expect(brightmossGolem.getDamage()).to.equal(4);
      expect(sapphireSeer.getDamage()).to.equal(0);
    });

    it('expect sunset paragon to make all nearby minions deal damage to themselves equal to their attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 0, 0, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Tethermancer }, 1, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.SunsetParagon }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(valeHunter.getDamage()).to.equal(valeHunter.getATK());
      expect(brightmossGolem.getDamage()).to.equal(brightmossGolem.getATK());
    });

    it('expect exun to draw a card whenever it attacks or is attacked', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const exun = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.EXun }, 7, 2, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 7, 3, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));

      exun.refreshExhaustion();
      var action = exun.actionAttack(brightmossGolem);
      gameSession.executeAction(action);

      var hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      expect(hand[1]).to.equal(undefined);

      gameSession.executeAction(gameSession.actionEndTurn());

      var action = brightmossGolem.actionAttack(exun);
      gameSession.executeAction(action);

      var hand = player1.getDeck().getCardsInHand();

      expect(hand[0].getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      expect(hand[1].getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      expect(hand[2].getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      expect(hand[3]).to.equal(undefined);
    });
  });
});
