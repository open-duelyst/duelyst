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

describe('faction1', () => {
  describe('artifacts', () => {
    beforeEach(() => {
      // define test decks.  Spells do not work.  Only add minions and generals this way
      const player1Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction2.General },
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

    it('expect sunstone bracers to give +1 attack to general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.SunstoneBracers }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(3);
    });

    it('expect skywind glaives to give nearby allied minions +2 attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.IndomitableWill }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      const suntideMaiden = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SuntideMaiden }, 0, 1, gameSession.getPlayer1Id());

      expect(suntideMaiden.getATK()).to.equal(5);
    });

    it('expect skywind glaives to not give far away allied minions +2 attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.IndomitableWill }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      const suntideMaiden = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SuntideMaiden }, 6, 1, gameSession.getPlayer1Id());

      expect(suntideMaiden.getATK()).to.equal(3);
    });

    it('expect arclyte regalia to only prevent first 2 damage in a turn without durability going down', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.ArclyteRegalia }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));

      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(25);
      // CHECK ARTIFACT DURABILITY
      const modifiers = gameSession.getGeneralForPlayer1().getArtifactModifiers();
      expect(modifiers[0].getDurability()).to.equal(3);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));

      expect(modifiers[0].getDurability()).to.equal(2);
      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(23);
    });

    it('expect arclyte regalia to grant +2 attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.ArclyteRegalia }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(4);
    });

    it('expect arclyte regalia to prevent 2 damage from white widow replace ping', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.ArclyteRegalia }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      const whiteWidow = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.WhiteWidow }, 6, 1, gameSession.getPlayer2Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(25);
      // CHECK ARTIFACT DURABILITY
      var modifiers = gameSession.getGeneralForPlayer1().getArtifactModifiers();
      expect(modifiers[0].getDurability()).to.equal(3);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.Metamorphosis }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.GhostLightning }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));

      const action = player2.actionReplaceCardFromHand(0);
      gameSession.executeAction(action);

      var modifiers = gameSession.getGeneralForPlayer1().getArtifactModifiers();
      expect(modifiers[0].getDurability()).to.equal(3);
      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(0);
    });
  });
});
