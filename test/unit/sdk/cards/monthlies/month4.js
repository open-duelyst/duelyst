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
  describe('month 4', () => {
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

    it('expect white widow to deal 2 damage to a random enemy when you replace', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const aethermaster = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Aethermaster }, 1, 2, gameSession.getPlayer1Id());
      const whiteWidow = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.WhiteWidow }, 2, 2, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 6, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Metamorphosis }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.GhostLightning }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));

      var action = player1.actionReplaceCardFromHand(0);
      gameSession.executeAction(action);
      var action = player1.actionReplaceCardFromHand(0);
      gameSession.executeAction(action);

      const totalDamage = brightmossGolem.getDamage() + gameSession.getGeneralForPlayer2().getDamage();
      expect(totalDamage).to.equal(4);
    });

    /*
    it('expect astral crusader to gain +1/+1 and cost 1 less each time you replace him', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var aethermaster = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Aethermaster}, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.AstralCrusader}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));

      var hand = player1.getDeck().getCardsInHand();
      var cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Neutral.AstralCrusader)
      expect(cardDraw.getManaCost()).to.equal(7);
      expect(cardDraw.getATK()).to.equal(7);
      expect(cardDraw.getHP()).to.equal(6);

      var action = player1.actionReplaceCardFromHand(0);
      gameSession.executeAction(action);
      var action = player1.actionReplaceCardFromHand(0);
      gameSession.executeAction(action);

      var hand = player1.getDeck().getCardsInHand();
      var cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Neutral.AstralCrusader)
      expect(cardDraw.getManaCost()).to.equal(6);
      expect(cardDraw.getATK()).to.equal(8);
      expect(cardDraw.getHP()).to.equal(7);
    });
    */

    it('expect wings of paradise to gain +2 attack until end of turn when you replace a card', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const aethermaster = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Aethermaster }, 1, 2, gameSession.getPlayer1Id());
      const wings = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.WingsOfParadise }, 2, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Metamorphosis }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.GhostLightning }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));

      var action = player1.actionReplaceCardFromHand(0);
      gameSession.executeAction(action);
      var action = player1.actionReplaceCardFromHand(0);
      gameSession.executeAction(action);

      expect(wings.getATK()).to.equal(7);

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(wings.getATK()).to.equal(3);
    });

    it('expect dreamgazer to be summoned into play when replaced and deal 2 damage to own general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Dreamgazer }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));

      const action = player1.actionReplaceCardFromHand(0);
      gameSession.executeAction(action);

      const dreamgazer = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.Dreamgazer);

      expect(dreamgazer.getHP()).to.equal(1);
      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(2);

      const hand = player1.getDeck().getCardsInHand();
      const cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
    });
  });
});
