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

describe('faction5', () => {
  describe('artifacts', () => {
    beforeEach(() => {
      // define test decks.  Spells do not work.  Only add minions and generals this way
      const player1Deck = [
        { id: SDK.Cards.Faction5.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      // setup test session
      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

      /* // USE THIS TO GET THE CURRENT CARDS IN YOUR HAND
      var deck = player1.getDeck();
      Logger.module("UNITTEST").log(deck.getCardsInHand(1));
      */
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect iridium scale to give general frenzy', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.PristineScale }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      expect(gameSession.getGeneralForPlayer1().hasModifierClass(SDK.ModifierFrenzy)).to.equal(true);
    });

    it('expect adamantite claws to give general +4 attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.AdamantineClaws }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(6);
    });

    it('expect twin fang to give general +2 attack whenever friendly minion or general damaged', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.TwinFang }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      const youngSilithar = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.YoungSilithar }, 0, 1, gameSession.getPlayer2Id());
      const abyssalCrawler1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalCrawler }, 1, 1, gameSession.getPlayer1Id());
      abyssalCrawler1.refreshExhaustion();

      var action = abyssalCrawler1.actionAttack(youngSilithar);
      gameSession.executeAction(action);
      var action = gameSession.getGeneralForPlayer1().actionAttack(youngSilithar);
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(6);
    });
  });
});
