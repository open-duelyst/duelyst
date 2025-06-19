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

describe('faction2', () => {
  describe('artifacts', () => {
    beforeEach(() => {
      // define test decks.  Spells do not work.  Only add minions and generals this way
      const player1Deck = [
        { id: SDK.Cards.Faction2.General },
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

    it('expect bloodrage mask to deal 1 damage to enemy general on every spell cast', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.MaskOfBloodLeech }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 8, 2));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 8, 2));

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(21);
    });

    it('expect cyclone mask to let general attack from range', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.MaskOfTranscendance }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 8, 2));

      const action = gameSession.getGeneralForPlayer1().actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(23);
    });

    /* Test disabled: failing
    it('expect mask of shadows to give general backstab(4)', function() {
      //unit.setPosition(pos)
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.MaskOfShadows}));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      var action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
      gameSession.executeAction(action);

      var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 1, 2, gameSession.getPlayer2Id());

      var action = gameSession.getGeneralForPlayer1().actionAttack(brightmossGolem);
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(25);
      expect(brightmossGolem.getHP()).to.equal(3);
    });
    */
  }); // end Spells describe
});
