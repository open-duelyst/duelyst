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

describe('shimzar', () => {
  describe('faction3', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect falcius to give your general +2 attack this turn and take no damage', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction3.Falcius }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 2, gameSession.getPlayer2Id());

      const action = gameSession.getGeneralForPlayer1().actionAttack(brightmossGolem);
      gameSession.executeAction(action);

      expect(brightmossGolem.getDamage()).to.equal(4);
      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(0);
    });

    it('expect rae to dispel the nearest enemy minion upon death', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const rae = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Rae }, 1, 2, gameSession.getPlayer1Id());
      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 1, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(valeHunter.getIsSilenced()).to.equal(true);
      expect(valeHunter.isRanged()).to.equal(false);
    });

    /* Test failing: inconsistent
    it('expect astral flood to draw 3 random f3/neutral battle pets', function() {
      for(var i = 0; i < 100; i++){
        var player1Deck = [
          {id: SDK.Cards.Faction3.General}
        ];

        var player2Deck = [
          {id: SDK.Cards.Faction3.General}
        ];

        // setup test session
        UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

        var gameSession = SDK.GameSession.getInstance();
        var board = gameSession.getBoard();
        var player1 = gameSession.getPlayer1();
        player1.remainingMana = 9;

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AstralFlood}));
        var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
        gameSession.executeAction(playCardFromHandAction);

        var hand = player1.getDeck().getCardsInHand();
        expect(hand[0]).to.exist;
        expect(hand[0].getRaceId()).to.equal(SDK.Races.BattlePet);
        expect(hand[0].getFactionId() === SDK.Factions.Faction3 || hand[0].getFactionId() === SDK.Factions.Neutral).to.equal(true);
        expect(hand[1]).to.exist;
        expect(hand[1].getRaceId()).to.equal(SDK.Races.BattlePet);
        expect(hand[1].getFactionId() === SDK.Factions.Faction3 || hand[1].getFactionId() === SDK.Factions.Neutral).to.equal(true);
        expect(hand[2]).to.exist;
        expect(hand[2].getRaceId()).to.equal(SDK.Races.BattlePet);
        expect(hand[2].getFactionId() === SDK.Factions.Faction3 || hand[2].getFactionId() === SDK.Factions.Neutral).to.equal(true);

        expect(hand[0].getBaseCardId()).to.not.equal(SDK.Cards.Faction5.Kin);
        expect(hand[1].getBaseCardId()).to.not.equal(SDK.Cards.Faction5.Kin);
        expect(hand[2].getBaseCardId()).to.not.equal(SDK.Cards.Faction5.Kin);

        SDK.GameSession.reset();
      }
    });
    */

    it('expect whisper of the sands to summon a wind dervish next to each friendly obelysk', () => {
      for (let i = 0; i < 20; i++) {
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

        const obelysk1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.BrazierGoldenFlame }, 0, 0, gameSession.getPlayer1Id());
        const obelysk2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.BrazierDuskWind }, 0, 1, gameSession.getPlayer1Id());
        const obelysk3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.SoulburnObelysk }, 7, 4, gameSession.getPlayer1Id());
        const obelysk4 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.BrazierRedSand }, 7, 0, gameSession.getPlayer1Id());

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.WhisperOfTheSands }));
        const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
        gameSession.executeAction(playCardFromHandAction);

        const units = board.getUnits();
        expect(units.length).to.equal(10);
      }
    });

    it('expect whisper of the sands to summon a wind dervish next to each friendly obelysk even when the obelysk is dispelled', () => {
      for (let i = 0; i < 20; i++) {
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

        const obelysk1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.BrazierGoldenFlame }, 0, 0, gameSession.getPlayer1Id());
        const obelysk2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.BrazierDuskWind }, 0, 1, gameSession.getPlayer1Id());

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SunBloom }));
        var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
        gameSession.executeAction(playCardFromHandAction);

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.WhisperOfTheSands }));
        var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
        gameSession.executeAction(playCardFromHandAction);

        const units = board.getUnits();
        expect(units.length).to.equal(6);
      }
    });

    it('expect whisper of the sands to summon a wind dervish next to each friendly obelysk even if most spaces are blocked (formation 1)', () => {
      for (let i = 0; i < 20; i++) {
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

        const obelysk1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.BrazierGoldenFlame }, 0, 1, gameSession.getPlayer1Id());
        const obelysk2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.BrazierDuskWind }, 1, 0, gameSession.getPlayer1Id());
        const obelysk3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.SoulburnObelysk }, 0, 0, gameSession.getPlayer1Id());
        const block1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.AymaraHealer }, 2, 0, gameSession.getPlayer1Id());
        const block2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.AymaraHealer }, 0, 2, gameSession.getPlayer1Id());

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.WhisperOfTheSands }));
        const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
        gameSession.executeAction(playCardFromHandAction);

        const dervishes = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction3.Dervish);

        expect(dervishes.length).to.equal(3);

        SDK.GameSession.reset();
      }
    });

    it('expect whisper of the sands to summon a wind dervish next to each friendly obelysk even if most spaces are blocked (formation 2)', () => {
      for (let i = 0; i < 20; i++) {
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

        const obelysk1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.BrazierGoldenFlame }, 0, 1, gameSession.getPlayer1Id());
        const obelysk2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.BrazierDuskWind }, 1, 0, gameSession.getPlayer1Id());
        const obelysk3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.SoulburnObelysk }, 1, 1, gameSession.getPlayer1Id());
        const block2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.AymaraHealer }, 2, 2, gameSession.getPlayer1Id());
        const block3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.AymaraHealer }, 2, 1, gameSession.getPlayer1Id());

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.WhisperOfTheSands }));
        const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
        gameSession.executeAction(playCardFromHandAction);

        const dervishes = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction3.Dervish);

        expect(dervishes.length).to.equal(3);

        SDK.GameSession.reset();
      }
    });

    it('expect whisper of the sands to summon a wind dervish next to each friendly obelysk even if most spaces are blocked (formation 3)', () => {
      for (let i = 0; i < 20; i++) {
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

        const obelysk1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.BrazierGoldenFlame }, 0, 1, gameSession.getPlayer1Id());
        const obelysk2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.BrazierDuskWind }, 1, 0, gameSession.getPlayer1Id());
        const obelysk3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.SoulburnObelysk }, 1, 1, gameSession.getPlayer1Id());
        const block3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.AymaraHealer }, 2, 1, gameSession.getPlayer1Id());

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.WhisperOfTheSands }));
        const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
        gameSession.executeAction(playCardFromHandAction);

        const dervishes = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction3.Dervish);

        expect(dervishes.length).to.equal(3);

        SDK.GameSession.reset();
      }
    });

    it('expect whisper of the sands to not crash game if it cannot spawn all dervishes', () => {
      for (let i = 0; i < 20; i++) {
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

        const obelysk1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.BrazierGoldenFlame }, 0, 1, gameSession.getPlayer1Id());
        const obelysk2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.BrazierDuskWind }, 1, 0, gameSession.getPlayer1Id());
        const obelysk3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.SoulburnObelysk }, 1, 1, gameSession.getPlayer1Id());
        const block1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.AymaraHealer }, 0, 2, gameSession.getPlayer1Id());
        const block2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.AymaraHealer }, 2, 2, gameSession.getPlayer1Id());
        const block3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.AymaraHealer }, 2, 1, gameSession.getPlayer1Id());
        const block4 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.AymaraHealer }, 1, 2, gameSession.getPlayer1Id());
        const block5 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.AymaraHealer }, 2, 0, gameSession.getPlayer1Id());

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.WhisperOfTheSands }));
        const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
        gameSession.executeAction(playCardFromHandAction);

        const dervishes = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction3.Dervish);

        expect(dervishes.length).to.equal(1);

        SDK.GameSession.reset();
      }
    });

    /*
    it('expect wind slicer to lower the cost of all structures in your action bar by 1', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction3.WindSlicer}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction3.BrazierGoldenFlame}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction3.BrazierDuskWind}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction3.BrazierRedSand}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction3.SoulburnObelysk}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Bastion}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      var hand = player1.getDeck().getCardsInHand();
      expect(hand[1].getManaCost()).to.equal(2);
      expect(hand[2].getManaCost()).to.equal(2);
      expect(hand[3].getManaCost()).to.equal(1);
      expect(hand[4].getManaCost()).to.equal(2);
      expect(hand[5].getManaCost()).to.equal(2);
    });
    */

    it('expect pax to summon to 2/2 iron dervishes upon death', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const pax = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Pax }, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      const dervishes = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction3.IronDervish);

      expect(dervishes.length).to.equal(2);
    });

    it('expect psychic conduit to take control of an enemy with 2 or less power for a turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 5, 2, gameSession.getPlayer2Id());

      expect(valeHunter.ownerId).to.equal('player2_id');

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PsychicConduit }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 5, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(valeHunter.ownerId).to.equal('player1_id');
    });

    it('expect pantheran to cost 0 if youve cast all 3 scions wish spells', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const dervish = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.IronDervish }, 5, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction3.Pantheran }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction3.Pantheran }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ScionsThirdWish }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(1, 5, 2);
      expect(playCardFromHandAction.getIsValid()).to.equal(true);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ScionsSecondWish }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(1, 5, 2);
      expect(playCardFromHandAction.getIsValid()).to.equal(true);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ScionsFirstWish }));
      expect(playCardFromHandAction.getIsValid()).to.equal(true);
      var playCardFromHandAction = player1.actionPlayCardFromHand(1, 5, 2);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction3.Pantheran }));

      const hand = player1.getDeck().getCardsInHand();
      // Logger.module("UNITTEST").log(hand);
      expect(hand[0].getManaCost()).to.equal(0); // pantheran in hand
      expect(hand[1].getManaCost()).to.equal(0); // pantheran draw from deck
      expect(hand[2].getManaCost()).to.equal(0); // drew from l'kian failing.
    });

    it('expect allomancer to summon a random obelysk upon death', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const allomancer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Allomancer }, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      const obelysk = board.getUnitAtPosition({ x: 1, y: 2 });

      expect(obelysk.getRaceId()).to.equal(SDK.Races.Structure);
    });

    it('expect allomancer to never summon a bloodfire totem upon death', () => {
      for (let i = 0; i < 20; i++) {
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

        const allomancer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Allomancer }, 1, 2, gameSession.getPlayer1Id());

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
        const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
        gameSession.executeAction(playCardFromHandAction);

        const obelysk = board.getUnitAtPosition({ x: 1, y: 2 });

        expect(obelysk.getId()).to.not.equal(SDK.Cards.Faction3.PlagueTotem);
      }
    });

    it('expect corpse combustion to summon friendly minions with dying wish that died last turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      var voidHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.VoidHunter }, 0, 1, gameSession.getPlayer1Id());
      var aymara = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.AymaraHealer }, 1, 1, gameSession.getPlayer1Id());
      var scorpion = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BluetipScorpion }, 2, 1, gameSession.getPlayer1Id());

      voidHunter.setDamage(1);
      aymara.setDamage(4);

      gameSession.executeAction(gameSession.actionEndTurn());

      player2.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.GhostLightning }));
      var action = player2.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      gameSession.executeAction(gameSession.actionEndTurn());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.CorpseCombustion }));
      var action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      var voidHunter = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.VoidHunter);
      var aymara = UtilsSDK.getEntityOnBoardById(SDK.Cards.Faction3.AymaraHealer);
      var scorpion = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.BluetipScorpion);

      expect(scorpion).to.not.exist;
      expect(voidHunter.getOwnerId()).to.equal(gameSession.getPlayer1Id());
      expect(aymara.getOwnerId()).to.equal(gameSession.getPlayer1Id());
    });

    it('expect spinecleaver to grant +1 attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.Spinecleaver }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(3);
    });

    it('expect spinecleaver to turn enemies killed by it into bloodfire totems', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.Spinecleaver }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 1, 2, gameSession.getPlayer2Id());

      const action = gameSession.getGeneralForPlayer1().actionAttack(valeHunter);
      gameSession.executeAction(action);

      const totem = board.getUnitAtPosition({ x: 1, y: 2 });
      expect(totem.getId()).to.equal(SDK.Cards.Faction3.PlagueTotem);
    });

    it('expect bloodfire totems to deal 1 damage to its owner at the end of every turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const totem1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.PlagueTotem }, 1, 2, gameSession.getPlayer1Id());
      const totem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.PlagueTotem }, 2, 2, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(2);

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(4);
    });

    it('expect circle of desiccation to kill all non-structure minions', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const obelysk1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.BrazierDuskWind }, 6, 2, gameSession.getPlayer1Id());
      const hailstoneGolem1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 7, 2, gameSession.getPlayer1Id());
      const obelysk2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.BrazierGoldenFlame }, 1, 2, gameSession.getPlayer2Id());
      const hailstoneGolem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 2, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.CircleOfDesiccation }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(hailstoneGolem1.getIsRemoved()).to.equal(true);
      expect(hailstoneGolem2.getIsRemoved()).to.equal(true);
      expect(obelysk1.getIsRemoved()).to.equal(false);
      expect(obelysk2.getIsRemoved()).to.equal(false);
    });

    it('expect nimbus to summon a soulburn obelysk nearby whenever its damaged', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const nimbus = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Nimbus }, 5, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 5, 2);
      gameSession.executeAction(playCardFromHandAction);

      const obelysk = board.getFriendlyEntitiesAroundEntity(nimbus);

      expect(obelysk[0].getId()).to.equal(SDK.Cards.Faction3.SoulburnObelysk);
    });
  });
});
