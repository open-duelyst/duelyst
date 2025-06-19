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
  describe('faction4', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction4.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect night fiend to deal 2 damage to each enemy on or near friendly shadow creep', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 8, 0, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ShadowNova }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 0);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.NightFiend }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(2);
      expect(brightmossGolem.getDamage()).to.equal(2);
    });

    it('expect gor to respawn in a corner when it dies', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      var gor = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Gor }, 2, 2, gameSession.getPlayer1Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(playCardFromHandAction);

      var gor = UtilsSDK.getEntityOnBoardById(SDK.Cards.Faction4.Gor);

      expect(gor.getATK()).to.equal(1);
      expect(gor.getHP()).to.equal(1);
    });

    it('expect inkhorn gaze to deal 2 damage to a minion', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 2, 2, gameSession.getPlayer2Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InkhornGaze }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(brightmossGolem.getDamage()).to.equal(2);
    });

    it('expect inkhorn gaze to draw a random f4/neutral battlepet if the minion it targeted died this turn', () => {
      for (let i = 0; i < 50; i++) {
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

        const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 2, 2, gameSession.getPlayer2Id());

        player1.remainingMana = 9;

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InkhornGaze }));
        const playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
        gameSession.executeAction(playCardFromHandAction);
        const hand = player1.getDeck().getCardsInHand();
        expect(hand[0]).to.exist;
        expect(hand[0].getRaceId()).to.equal(SDK.Races.BattlePet);
        expect(hand[0].getFactionId() === SDK.Factions.Faction4 || hand[0].getFactionId() === SDK.Factions.Neutral).to.equal(true);
        expect(hand[0].getBaseCardId()).to.not.equal(SDK.Cards.Faction5.Kin);

        SDK.GameSession.reset();
      }
    });

    /* Test disabled: failing
    it('expect sphere of darkness to turn a space into shadow creep', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SphereOfDarkness}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 0);
      gameSession.executeAction(playCardFromHandAction);

      var shadowCreep1 = board.getTileAtPosition({x:7,y:0},true);

      expect(shadowCreep1.getId()).to.equal(SDK.Cards.Tile.Shadow);
    });
    */

    it('expect sphere of darkness to draw a card', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SphereOfDarkness }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SphereOfDarkness }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 0);
      gameSession.executeAction(playCardFromHandAction);

      const shadowCreep1 = board.getTileAtPosition({ x: 7, y: 0 }, true);

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[0]).to.exist;
      expect(hand[0].getId()).to.equal(SDK.Cards.Spell.SphereOfDarkness);
    });

    it('expect ooz to turn a random enemys tile into shadow creep when damaged', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const ooz = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Ooz }, 2, 2, gameSession.getPlayer2Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InkhornGaze }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(ooz.getDamage()).to.equal(2);
      const creep = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Tile.Shadow);
      expect(creep.length).to.equal(1);
    });

    it('expect blood baronette to double a wraithlings attack and health', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const wraithling = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 1, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AbyssianStrength }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(wraithling.getATK()).to.equal(5);
      expect(wraithling.getHP()).to.equal(5);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.BloodBaronette }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 1, 1);
      gameSession.executeAction(followupAction);

      expect(wraithling.getATK()).to.equal(10);
      expect(wraithling.getHP()).to.equal(10);
    });

    it('expect void steal to give an enemy minion -3 attack and nearby allies +3 attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 5, 2, gameSession.getPlayer2Id());
      const wraithling1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 5, 3, gameSession.getPlayer1Id());
      const wraithling2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 4, 3, gameSession.getPlayer1Id());
      const wraithling3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 6, 3, gameSession.getPlayer1Id());
      const wraithling4 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 5, 1, gameSession.getPlayer1Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.VoidSteal }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 5, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(wraithling1.getATK()).to.equal(4);
      expect(wraithling2.getATK()).to.equal(4);
      expect(wraithling3.getATK()).to.equal(4);
      expect(wraithling4.getATK()).to.equal(4);
      expect(golem.getATK()).to.equal(1);
    });

    it('expect echoing shriek to transform all minions with cost 2 or lower into wraithlings', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      var golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 5, 2, gameSession.getPlayer2Id());
      var wraithling1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.ChakriAvatar }, 5, 3, gameSession.getPlayer2Id());
      var golem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 4, 3, gameSession.getPlayer1Id());
      var wraithling3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 6, 3, gameSession.getPlayer1Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.EchoingShriek }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 5, 2);
      gameSession.executeAction(playCardFromHandAction);

      var wraithling1 = board.getUnitAtPosition({ x: 5, y: 3 });
      var golem = board.getUnitAtPosition({ x: 5, y: 2 });
      var golem2 = board.getUnitAtPosition({ x: 4, y: 3 });
      var wraithling3 = board.getUnitAtPosition({ x: 6, y: 3 });

      expect(wraithling1.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
      expect(wraithling3.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
      expect(golem.getId()).to.equal(SDK.Cards.Neutral.BrightmossGolem);
      expect(golem2.getId()).to.equal(SDK.Cards.Neutral.BrightmossGolem);
    });

    it('expect arcane devourer to lower the mana cost of the next minion cast to 1', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.ArcaneDevourer }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.VorpalReaver }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[1].getManaCost()).to.equal(1);

      var playCardFromHandAction = player1.actionPlayCardFromHand(1, 2, 1);
      gameSession.executeAction(playCardFromHandAction);
      expect(playCardFromHandAction.getIsValid()).to.equal(true);
    });

    /* Test disabled: failing
    it('expect arcane devourer to lower the mana cost of a blood taura to 1', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.ArcaneDevourer}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.BloodTaura}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      var hand = player1.getDeck().getCardsInHand();
      expect(hand[1].getManaCost()).to.equal(1);

      var playCardFromHandAction = player1.actionPlayCardFromHand(1, 2, 1);
      gameSession.executeAction(playCardFromHandAction);
      expect(playCardFromHandAction.getIsValid()).to.equal(true);
    });
    it('expect lurking fear to lower the cost of all minions with dying wish in your hand by 1', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.LurkingFear}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.ReaperNineMoons}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.ReaperNineMoons}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.ReaperNineMoons}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      var hand = player1.getDeck().getCardsInHand();
      expect(hand[1].getManaCostChange()).to.equal(-1);
      expect(hand[2].getManaCostChange()).to.equal(-1);
      expect(hand[3].getManaCostChange()).to.equal(-1);
    });
    */

    it('expect lurking fear to lower the cost of all minions with dying wish in your deck by 1', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.LurkingFear }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.ReaperNineMoons }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.ReaperNineMoons }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.ReaperNineMoons }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      const deck = player1.getDeck().getCardsInDrawPileExcludingMissing();
      expect(deck.length === 3);
      expect(deck[0].getManaCostChange()).to.equal(-1);
      expect(deck[1].getManaCostChange()).to.equal(-1);
      expect(deck[2].getManaCostChange()).to.equal(-1);
    });

    it('expect ghost azalea to give your general +1 attack for every friendly shadow creep on board', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ShadowNova }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 0);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.GhostAzalea }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(6);
    });

    it('expect obliterate deal damage to all enemies equal to the total shadow creep and then remove the creep', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 5, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ShadowNova }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 0);
      gameSession.executeAction(playCardFromHandAction);

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.VeilOfUnraveling }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(4);
      expect(golem.getDamage()).to.equal(4);

      const emptyTile1 = board.getTileAtPosition({ x: 7, y: 0 }, true);
      const emptyTile2 = board.getTileAtPosition({ x: 7, y: 1 }, true);
      const emptyTile3 = board.getTileAtPosition({ x: 8, y: 0 }, true);
      const emptyTile4 = board.getTileAtPosition({ x: 8, y: 1 }, true);

      expect(emptyTile1).to.equal(undefined);
      expect(emptyTile2).to.equal(undefined);
      expect(emptyTile3).to.equal(undefined);
      expect(emptyTile4).to.equal(undefined);
    });

    it('expect klaxon to summon 6 shadow creep spaces when dying', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const klaxon = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Klaxon }, 2, 2, gameSession.getPlayer2Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SpiralTechnique }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(playCardFromHandAction);

      const creep = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Tile.Shadow);
      expect(creep.length).to.equal(6);
    });
  });
});
