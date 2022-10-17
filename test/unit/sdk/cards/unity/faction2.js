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

describe('unity', () => {
  describe('faction2', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction2.AltGeneral },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect sparrowhawk to give mist dragon seal if you have another arcanyst', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.Sparrowhawk }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction1);
      var hand1 = player1.getDeck().getCardsInHand();
      expect(hand1[0]).to.not.exist;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.Sparrowhawk }));
      const playCardFromHandAction2 = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction2);
      var hand1 = player1.getDeck().getCardsInHand();
      expect(hand1[0]).to.exist;
      expect(hand1[0].getId()).to.equal(SDK.Cards.Spell.MistDragonSeal);
    });

    it('expect joseki to give both players a card from their opponents deck', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InnerFocus }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.Tempest }));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Joseki }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));

      const hand1 = player1.getDeck().getCardsInHand();
      expect(hand1[0].getId()).to.equal(SDK.Cards.Spell.Tempest);
      const hand2 = player2.getDeck().getCardsInHand();
      expect(hand2[0].getId()).to.equal(SDK.Cards.Spell.InnerFocus);
    });

    it('expect joseki to do nothing if there are no cards in deck', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Joseki }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));

      const hand1 = player1.getDeck().getCardsInHand();
      expect(hand1[0]).to.not.exist;
      const hand2 = player2.getDeck().getCardsInHand();
      expect(hand2[0]).to.not.exist;
    });

    it('expect bangle of blinding strike to give the General Celerity', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.MaskOfTranscendance }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.MaskOfCelerity }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 8, 2));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(1, 8, 2));

      const action = gameSession.getGeneralForPlayer1().actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(21);
    });

    it('expect kindling to give +1 attack to only arcanysts when spells are cast', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const kindling = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Kindling }, 2, 2, gameSession.getPlayer1Id());
      const manaforger = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Manaforger }, 3, 2, gameSession.getPlayer1Id());
      const aethermaster = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Aethermaster }, 4, 2, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 5, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(kindling.getATK()).to.equal(5);
      expect(manaforger.getATK()).to.equal(3);
      expect(aethermaster.getATK()).to.equal(3);
      expect(brightmossGolem.getATK()).to.equal(4);
    });

    it('expect calligrapher to put 3 random songhai spells in action bar', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      // make calligrapher, attack
      const calligrapher1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Calligrapher }, 1, 1, gameSession.getPlayer1Id());
      const brightmossGolem1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 0, 1, gameSession.getPlayer2Id());
      const action = calligrapher1.actionAttack(brightmossGolem1);
      gameSession.executeAction(action);
      // end the turn, check hand
      gameSession.executeAction(gameSession.actionEndTurn());

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[0].type).to.equal(SDK.CardType.Spell);
      expect(hand[1].type).to.equal(SDK.CardType.Spell);
      expect(hand[2].type).to.equal(SDK.CardType.Spell);
      expect(hand[0].getFactionId()).to.equal(SDK.Factions.Faction2);
      expect(hand[1].getFactionId()).to.equal(SDK.Factions.Faction2);
      expect(hand[2].getFactionId()).to.equal(SDK.Factions.Faction2);
    });
  });
});
