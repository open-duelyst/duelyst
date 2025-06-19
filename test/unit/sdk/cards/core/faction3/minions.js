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

describe('faction3', () => {
  describe('minions', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction3.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction2.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect dunecaster give +2/+2 to only dervishes', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const dervish = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Dervish }, 5, 1, gameSession.getPlayer1Id());
      const pyromancer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Pyromancer }, 6, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction3.Dunecaster }));
      const action = player1.actionPlayCardFromHand(0, 4, 1);
      gameSession.executeAction(action);

      // try to play on pyromancer
      var followupCard = action.getCard().getCurrentFollowupCard();
      var followupAction = player1.actionPlayFollowup(followupCard, 6, 1);
      gameSession.executeAction(followupAction);
      expect(followupAction.getIsValid()).to.equal(false);

      // play on dervish
      var followupCard = action.getCard().getCurrentFollowupCard();
      var followupAction = player1.actionPlayFollowup(followupCard, 5, 1);
      gameSession.executeAction(followupAction);
      expect(followupAction.getIsValid()).to.equal(true);

      expect(dervish.getATK()).to.equal(4);
      expect(dervish.getHP()).to.equal(4);
    });

    it('expect dunecaster to make temporary dervishes permanent', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const dervish = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Dervish }, 5, 1, gameSession.getPlayer1Id());
      const pyromancer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Pyromancer }, 6, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction3.Dunecaster }));
      const action = player1.actionPlayCardFromHand(0, 4, 1);
      gameSession.executeAction(action);

      // play on dervish
      const followupCard = action.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 5, 1);
      gameSession.executeAction(followupAction);
      expect(followupAction.getIsValid()).to.equal(true);

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      expect(dervish.getIsRemoved()).to.equal(false);
    });

    it('expect pyromancer to be able to blast everything in a row', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const pyromancer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Pyromancer }, 1, 2, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 6, 2, gameSession.getPlayer2Id());

      pyromancer.refreshExhaustion();
      const action = pyromancer.actionAttack(brightmossGolem);
      gameSession.executeAction(action);

      expect(brightmossGolem.getHP()).to.equal(7);
      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(23);
    });

    it('expect ethereal obelysk to spawn a 2/2 dervish every turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const obelysk = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.BrazierRedSand }, 1, 2, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      const dervish = UtilsSDK.getEntityOnBoardById(SDK.Cards.Faction3.Dervish);

      expect(dervish.getHP()).to.equal(2);
      expect(dervish.getATK()).to.equal(2);
    });

    it('expect obelysks to summon a wind dervish next to each friendly obelysk even if most spaces are blocked (formation 1)', () => {
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

        const p1Obelysks = [
          { cardData: { id: SDK.Cards.Faction3.BrazierRedSand }, position: { x: 0, y: 1 } },
          { cardData: { id: SDK.Cards.Faction3.BrazierRedSand }, position: { x: 1, y: 0 } },
          { cardData: { id: SDK.Cards.Faction3.BrazierRedSand }, position: { x: 0, y: 0 } },
        ];
        for (let j = 0, jl = p1Obelysks.length; j < jl; j++) {
          const obelyskData = p1Obelysks.splice(Math.floor(Math.random() * p1Obelysks.length), 1)[0];
          UtilsSDK.applyCardToBoard(obelyskData.cardData, obelyskData.position.x, obelyskData.position.y, gameSession.getPlayer1Id());
        }
        const block1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.PlanarScout }, 2, 0, gameSession.getPlayer1Id());
        const block2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.PlanarScout }, 0, 2, gameSession.getPlayer1Id());

        gameSession.executeAction(gameSession.actionEndTurn());
        gameSession.executeAction(gameSession.actionEndTurn());

        const dervishes = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction3.Dervish);

        expect(dervishes.length).to.equal(3);

        SDK.GameSession.reset();
      }
    });

    it('expect obelysks to summon a wind dervish next to each friendly obelysk even if most spaces are blocked (formation 2)', () => {
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

        const p1Obelysks = [
          { cardData: { id: SDK.Cards.Faction3.BrazierRedSand }, position: { x: 0, y: 1 } },
          { cardData: { id: SDK.Cards.Faction3.BrazierRedSand }, position: { x: 1, y: 0 } },
          { cardData: { id: SDK.Cards.Faction3.BrazierRedSand }, position: { x: 1, y: 1 } },
        ];
        for (let j = 0, jl = p1Obelysks.length; j < jl; j++) {
          const obelyskData = p1Obelysks.splice(Math.floor(Math.random() * p1Obelysks.length), 1)[0];
          UtilsSDK.applyCardToBoard(obelyskData.cardData, obelyskData.position.x, obelyskData.position.y, gameSession.getPlayer1Id());
        }
        const block2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.PlanarScout }, 2, 2, gameSession.getPlayer1Id());
        const block3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.PlanarScout }, 2, 1, gameSession.getPlayer1Id());

        gameSession.executeAction(gameSession.actionEndTurn());
        gameSession.executeAction(gameSession.actionEndTurn());

        const dervishes = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction3.Dervish);

        expect(dervishes.length).to.equal(3);

        SDK.GameSession.reset();
      }
    });

    it('expect obelysks to summon a wind dervish next to each friendly obelysk even if most spaces are blocked (formation 3)', () => {
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

        const p1Obelysks = [
          { cardData: { id: SDK.Cards.Faction3.BrazierRedSand }, position: { x: 0, y: 1 } },
          { cardData: { id: SDK.Cards.Faction3.BrazierRedSand }, position: { x: 1, y: 0 } },
          { cardData: { id: SDK.Cards.Faction3.BrazierRedSand }, position: { x: 1, y: 1 } },
        ];
        for (let j = 0, jl = p1Obelysks.length; j < jl; j++) {
          const obelyskData = p1Obelysks.splice(Math.floor(Math.random() * p1Obelysks.length), 1)[0];
          UtilsSDK.applyCardToBoard(obelyskData.cardData, obelyskData.position.x, obelyskData.position.y, gameSession.getPlayer1Id());
        }
        const block2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.PlanarScout }, 2, 2, gameSession.getPlayer1Id());

        gameSession.executeAction(gameSession.actionEndTurn());
        gameSession.executeAction(gameSession.actionEndTurn());

        const dervishes = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction3.Dervish);

        expect(dervishes.length).to.equal(3);

        SDK.GameSession.reset();
      }
    });

    /* Test disabled: failing
    it('expect obelysks to summon a wind dervish next to each friendly obelysk even if most spaces are blocked (formation 4)', function() {
      for(var i = 0; i < 20; i++){
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

        var p1Obelysks = [
          {cardData: {id: SDK.Cards.Faction3.BrazierDuskWind}, position: {x: 1, y: 4}},
          {cardData: {id: SDK.Cards.Faction3.BrazierGoldenFlame}, position: {x: 3, y: 4}},
          {cardData: {id: SDK.Cards.Faction3.BrazierGoldenFlame}, position: {x: 2, y: 3}},
          {cardData: {id: SDK.Cards.Faction3.BrazierDuskWind}, position: {x: 3, y: 3}}
        ];
        for (var j = 0, jl = p1Obelysks.length; j < jl; j++) {
          var obelyskData = p1Obelysks.splice(Math.floor(Math.random() * p1Obelysks.length), 1)[0];
          UtilsSDK.applyCardToBoard(obelyskData.cardData, obelyskData.position.x, obelyskData.position.y, gameSession.getPlayer1Id());
        }
        var block2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.BrazierRedSand}, 4, 4, gameSession.getPlayer2Id());
        var block2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.PlanarScout}, 4, 3, gameSession.getPlayer2Id());
        var block2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.BrazierRedSand}, 4, 2, gameSession.getPlayer2Id());
        var block2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.PlanarScout}, 4, 1, gameSession.getPlayer2Id());

        gameSession.executeAction(gameSession.actionEndTurn());
        gameSession.executeAction(gameSession.actionEndTurn());

        var dervishes = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction3.Dervish);

        expect(dervishes.length).to.equal(4);

        SDK.GameSession.reset();
      }
    });
    */

    it('expect obelysks to not crash game if it cannot spawn all dervishes', () => {
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

        const p1Obelysks = [
          { cardData: { id: SDK.Cards.Faction3.BrazierRedSand }, position: { x: 0, y: 1 } },
          { cardData: { id: SDK.Cards.Faction3.BrazierRedSand }, position: { x: 1, y: 0 } },
          { cardData: { id: SDK.Cards.Faction3.BrazierRedSand }, position: { x: 1, y: 1 } },
        ];
        for (let j = 0, jl = p1Obelysks.length; j < jl; j++) {
          const obelyskData = p1Obelysks.splice(Math.floor(Math.random() * p1Obelysks.length), 1)[0];
          UtilsSDK.applyCardToBoard(obelyskData.cardData, obelyskData.position.x, obelyskData.position.y, gameSession.getPlayer1Id());
        }
        const block1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.PlanarScout }, 0, 2, gameSession.getPlayer1Id());
        const block2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.PlanarScout }, 2, 2, gameSession.getPlayer1Id());
        const block3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.PlanarScout }, 2, 1, gameSession.getPlayer1Id());
        const block4 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.PlanarScout }, 1, 2, gameSession.getPlayer1Id());
        const block5 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.PlanarScout }, 2, 0, gameSession.getPlayer1Id());

        gameSession.executeAction(gameSession.actionEndTurn());
        gameSession.executeAction(gameSession.actionEndTurn());

        const dervishes = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction3.Dervish);

        expect(dervishes.length).to.equal(1);

        SDK.GameSession.reset();
      }
    });

    it('expect ethereal obelysk to never be able to move', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const obelysk = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.BrazierRedSand }, 1, 2, gameSession.getPlayer1Id());

      obelysk.refreshExhaustion();
      const action = obelysk.actionMove({ x: 2, y: 2 });
      gameSession.executeAction(action);

      expect(action.getIsValid()).to.equal(false);
    });

    it('expect ethereal obelysk to never be able to attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const obelysk = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.BrazierRedSand }, 1, 2, gameSession.getPlayer1Id());
      const hailstoneGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 2, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ScionsFirstWish }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      obelysk.refreshExhaustion();
      const action = obelysk.actionAttack(hailstoneGolem);
      gameSession.executeAction(action);

      expect(action.getIsValid()).to.equal(false);
    });

    it('expect fireblaze obelysk to give all dervishes +1 attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const obelysk = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.BrazierGoldenFlame }, 1, 2, gameSession.getPlayer1Id());
      const sandHowler = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.SandHowler }, 7, 4, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      const allBoardPositions = SDK.GameSession.getInstance().getBoard().getPositions();

      let dervishx = 0;
      let dervishy = 0;

      // loop through all board positions until I find the dervish
      for (let xx = 0; xx < 10; xx++) {
        for (let yy = 0; yy < 5; yy++) {
          var dervish = board.getUnitAtPosition({ x: xx, y: yy });
          if (dervish != null && dervish.getId() === SDK.Cards.Faction3.Dervish) {
            dervishx = xx;
            dervishy = yy;
            break;
          }
        }
      }

      var dervish = board.getUnitAtPosition({ x: dervishx, y: dervishy });

      expect(dervish.getHP()).to.equal(2);
      expect(dervish.getATK()).to.equal(3);
      expect(sandHowler.getATK()).to.equal(4);
    });

    it('expect imperial mechanyst to restore all artifact durability charges to full', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.StaffOfYKir }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.StaffOfYKir }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));

      var modifiers = gameSession.getGeneralForPlayer1().getArtifactModifiers();
      expect(modifiers[0].getDurability()).to.equal(2);
      expect(modifiers[1].getDurability()).to.equal(2);

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction3.NightfallMechanyst }));
      const action = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(action);

      var modifiers = gameSession.getGeneralForPlayer1().getArtifactModifiers();
      expect(modifiers[0].getDurability()).to.equal(3);
      expect(modifiers[1].getDurability()).to.equal(3);
    });

    it('expect orb weaver to summon a copy of itself in nearby space', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction3.OrbWeaver }));

      player1.remainingMana = 9;

      // play the followup
      const action = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(action);
      const followupCard = action.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 0, 1);
      gameSession.executeAction(followupAction);

      const orbWeaver1 = board.getUnitAtPosition({ x: 1, y: 1 });
      const orbWeaver2 = board.getUnitAtPosition({ x: 0, y: 1 });

      expect(followupAction.getIsValid()).to.equal(true);
      expect(orbWeaver1.getHP()).to.equal(2);
      expect(orbWeaver2.getHP()).to.equal(2);
      expect(orbWeaver1.getATK()).to.equal(2);
      expect(orbWeaver2.getATK()).to.equal(2);
    });

    it('expect portal guardian to gain +1 attack when you summon a minion', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const portalGuardian = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.PortalGuardian }, 3, 2, gameSession.getPlayer1Id());
      expect(portalGuardian.getATK()).to.equal(0);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction3.OrbWeaver }));

      // play the followup
      var action = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(action);
      const followupCard = action.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 0, 1);
      gameSession.executeAction(followupAction);

      expect(portalGuardian.getATK()).to.equal(2);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction3.Pyromancer }));
      var action = player1.actionPlayCardFromHand(0, 3, 3);
      gameSession.executeAction(action);

      expect(portalGuardian.getATK()).to.equal(3);
    });

    it('expect sand howler to not be targetable by spells', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      const sandHowler = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.SandHowler }, 1, 2, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      const playCardFromHandAction = player2.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(playCardFromHandAction.getIsValid()).to.equal(false);
      expect(sandHowler.getHP()).to.equal(3);
    });

    it('expect windstorm obelysk to give all friendly dervishes +1 health', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const obelysk = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.BrazierDuskWind }, 1, 2, gameSession.getPlayer1Id());
      const sandHowler = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.SandHowler }, 7, 4, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      const allBoardPositions = SDK.GameSession.getInstance().getBoard().getPositions();

      let dervishx = 0;
      let dervishy = 0;

      // loop through all board positions until I find the dervish
      for (let xx = 0; xx < 10; xx++) {
        for (let yy = 0; yy < 5; yy++) {
          var dervish = board.getUnitAtPosition({ x: xx, y: yy });
          if (dervish != null && dervish.getBaseCardId() == SDK.Cards.Faction3.Dervish) {
            dervishx = xx;
            dervishy = yy;
            break;
          }
        }
      }

      var dervish = board.getUnitAtPosition({ x: dervishx, y: dervishy });

      expect(dervish.getHP()).to.equal(3);
      expect(dervish.getATK()).to.equal(2);
      expect(sandHowler.getATK()).to.equal(3);
      expect(sandHowler.getHP()).to.equal(4);
    });

    it('expect mirage master to copy enemy unit that has been buffed and has taken damage', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction3.MirrorMaster }));
      const hailstoneGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 1, 2, gameSession.getPlayer2Id()); // 4 / 6
      hailstoneGolem.setDamage(2); // 4/4

      gameSession.executeAction(gameSession.actionEndTurn());

      player2.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.KillingEdge }));
      const playCardFromHandAction = player2.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      // Golem is 8/6

      gameSession.executeAction(gameSession.actionEndTurn());

      player1.remainingMana = 9;

      // play the followup
      const action = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(action);
      const followupCard = action.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 1, 2);
      gameSession.executeAction(followupAction);

      const mirage = board.getUnitAtPosition({ x: 1, y: 1 });

      expect(mirage.getATK()).to.equal(8);
      expect(mirage.getHP()).to.equal(6);
      expect(mirage.getDamage()).to.equal(2);
      expect(hailstoneGolem.getATK()).to.equal(8);
      expect(hailstoneGolem.getHP()).to.equal(6);
    });

    it('expect aymara healer to deal 5 damage on death and heal 5 to own general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const aymara = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.AymaraHealer }, 1, 2, gameSession.getPlayer1Id());
      const hamonBladeseeker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.HamonBlademaster }, 1, 3, gameSession.getPlayer2Id());

      gameSession.getGeneralForPlayer1().setDamage(10);

      aymara.refreshExhaustion();
      const action = aymara.actionAttack(hamonBladeseeker);
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(20);
      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(20);
    });

    it('expect osterix to equip 2 artifacts from your deck on death', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const osterix = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Oserix }, 1, 2, gameSession.getPlayer1Id());
      const hamonBladeseeker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.HamonBlademaster }, 1, 3, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.StaffOfYKir }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.PoisonHexblade }));

      osterix.refreshExhaustion();
      const action = osterix.actionAttack(hamonBladeseeker);
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(7);
    });
  });
});
