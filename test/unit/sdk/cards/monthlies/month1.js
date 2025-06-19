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
  describe('month 1', () => {
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

    it('expect black locust to summon a fresh copy of itself nearby its movement destination', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const blackLocust = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BlackLocust }, 1, 2, gameSession.getPlayer1Id());

      blackLocust.refreshExhaustion();
      var action = blackLocust.actionMove({ x: 2, y: 2 });
      gameSession.executeAction(action);
      blackLocust.refreshExhaustion();
      var action = blackLocust.actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);

      const locusts = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Neutral.BlackLocust);

      expect(locusts[2].getHP()).to.equal(2);
    });

    it('expect black locust to copy to not retain buffs and damage', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const blackLocust = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BlackLocust }, 1, 2, gameSession.getPlayer1Id());
      blackLocust.setDamage(1);

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.GreaterFortitude }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      blackLocust.refreshExhaustion();
      const action = blackLocust.actionMove({ x: 0, y: 0 });
      gameSession.executeAction(action);

      const locusts = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Neutral.BlackLocust);

      expect(locusts[0].getHP()).to.equal(3);
      expect(locusts[0].getATK()).to.equal(4);
      expect(locusts[1].getHP()).to.equal(2);
      expect(locusts[1].getATK()).to.equal(2);
    });

    it('expect wind runner to give +1/+1 to friendly minions nearby its movement destination', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const windRunner = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.WindRunner }, 1, 2, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 3, 2, gameSession.getPlayer1Id());
      const brightmossGolem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 2, 3, gameSession.getPlayer1Id());

      windRunner.refreshExhaustion();
      const action = windRunner.actionMove({ x: 2, y: 2 });
      gameSession.executeAction(action);

      expect(brightmossGolem.getHP()).to.equal(10);
      expect(brightmossGolem2.getHP()).to.equal(10);
      expect(brightmossGolem.getATK()).to.equal(5);
      expect(brightmossGolem2.getATK()).to.equal(5);
      expect(windRunner.getHP()).to.equal(3);
      expect(windRunner.getATK()).to.equal(3);
    });

    it('expect ghost lynx to move any nearby minion into a random space', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      var brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.GhostLynx }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 1, 2);
      gameSession.executeAction(followupAction);

      var brightmossGolem = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.BrightmossGolem);

      expect(brightmossGolem.getPosition().x !== 1 || brightmossGolem.getPosition().y !== 2).to.equal(true);
    });

    it('expect mogwai to draw a card every time it moves', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const mogwai = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Mogwai }, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.SpectralRevenant }));

      mogwai.refreshExhaustion();
      const action = mogwai.actionMove({ x: 2, y: 2 });
      gameSession.executeAction(action);

      const hand = player1.getDeck().getCardsInHand();
      const cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Faction4.SpectralRevenant);
    });
  });
});
