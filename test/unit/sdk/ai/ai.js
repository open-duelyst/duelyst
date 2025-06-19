const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../'));
require('coffeescript/register');

const { expect } = require('chai');
const _ = require('underscore');

const UtilsSDK = require('../../../utils/utils_sdk');
const UsableDecks = require('../../../../server/ai/decks/usable_decks');
const StarterAI = require('../../../../server/ai/starter_ai');
const CONFIG = require('../../../../app/common/config');
const Logger = require('../../../../app/common/logger.coffee');
const SDK = require('../../../../app/sdk.coffee');
const CardFactory = require('../../../../app/sdk/cards/cardFactory.coffee');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('starter ai', () => {
  describe('behavior', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction2.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect dervishes to prefer attacking', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const ai = new StarterAI(gameSession, player1.getPlayerId(), 0);

      const dervish = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Dervish }, 7, 2, gameSession.getPlayer1Id());
      dervish.refreshExhaustion();

      let nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
      expect(nextAction.getSource()).to.equal(gameSession.getGeneralForPlayer1());
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.AttackAction.type);
      expect(nextAction.getSource().getId()).to.equal(SDK.Cards.Faction3.Dervish);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
    });

    it('expect dervishes to be ignored unless can reach objective', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const ai = new StarterAI(gameSession, player1.getPlayerId(), 0);

      const dervish = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Dervish }, 0, 0, gameSession.getPlayer1Id());
      dervish.refreshExhaustion();

      let nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
      expect(nextAction.getSource()).to.equal(gameSession.getGeneralForPlayer1());
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
    });

    it('expect units to ignore targets that they cannot damage or that should be ignored', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const ai = new StarterAI(gameSession, player1.getPlayerId(), 1);

      const corsair = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SilvertongueCorsair }, 1, 4, gameSession.getPlayer2Id());
      const sarlac = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SarlacTheEternal }, 1, 0, gameSession.getPlayer2Id());
      const panddo = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.OnyxBear }, 2, 0, gameSession.getPlayer2Id());
      const dervish = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.IronDervish }, 3, 0, gameSession.getPlayer1Id());
      dervish.refreshExhaustion();
      corsair.setDamage(1);

      // first turn
      let nextAction = ai.nextAction();
      while (!(nextAction instanceof SDK.EndTurnAction)) {
        expect(nextAction.getType()).to.not.equal(SDK.AttackAction.type);
        gameSession.executeAction(nextAction);
        nextAction = ai.nextAction();
      }

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      // second turn
      nextAction = ai.nextAction();
      while (!(nextAction instanceof SDK.EndTurnAction)) {
        expect(nextAction.getType()).to.not.equal(SDK.AttackAction.type);
        gameSession.executeAction(nextAction);
        nextAction = ai.nextAction();
      }
    });
  });

  describe('difficulty', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction2.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect at 0% difficulty: never spawns more than 1 unit per turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const ai = new StarterAI(gameSession, player1.getPlayerId(), 0);

      player1.remainingMana = 3;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));

      expect(ai.getMyPlayerId()).to.equal(player1.getPlayerId());
      expect(ai._difficulty).to.equal(0);

      // move
      let nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
      expect(nextAction.getTargetPosition().x).to.equal(2);
      expect(nextAction.getTargetPosition().y).to.equal(2);
      expect(nextAction.getIsValid()).to.equal(true);
      SDK.GameSession.getInstance().executeAction(nextAction);

      // spawn
      nextAction = ai.nextAction();
      expect(nextAction.getIsValid()).to.equal(true);
      SDK.GameSession.getInstance().executeAction(nextAction);
      expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);

      expect(board.getUnits().length).to.equal(3);

      // end turn
      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
    });

    it('expect at 0% difficulty: will not spawn a unit if one is already on board and hand not full', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const ai = new StarterAI(gameSession, player1.getPlayerId(), 0);

      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 7, 2, gameSession.getPlayer1Id());

      player1.remainingMana = 3;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));

      let nextAction = ai.nextAction();

      expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
      expect(nextAction.getTargetPosition().x).to.equal(2);
      expect(nextAction.getTargetPosition().y).to.equal(2);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      SDK.GameSession.getInstance().executeAction(nextAction);

      expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
    });

    it('expect at 0% difficulty: will spawn a unit if one is already on board only if hand is full', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const ai = new StarterAI(gameSession, player1.getPlayerId(), 0);

      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 0, 1, gameSession.getPlayer1Id());

      player1.remainingMana = 3;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));

      let nextAction = ai.nextAction();
      SDK.GameSession.getInstance().executeAction(nextAction);
      expect(nextAction.getIsValid()).to.equal(true);
      expect(nextAction.getType()).to.equal(SDK.MoveAction.type);

      nextAction = ai.nextAction();
      SDK.GameSession.getInstance().executeAction(nextAction);
      expect(nextAction.getIsValid()).to.equal(true);
      expect(nextAction instanceof SDK.PlayCardFromHandAction).to.equal(true);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
    });

    it('expect at 0% difficulty: never removes more than 1 unit per turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const ai = new StarterAI(gameSession, player1.getPlayerId(), 0);

      const pyromancer1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Pyromancer }, 7, 0, gameSession.getPlayer2Id());
      const pyromancer2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Pyromancer }, 7, 1, gameSession.getPlayer2Id());
      const pyromancer3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Pyromancer }, 7, 3, gameSession.getPlayer2Id());

      player1.remainingMana = 3;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrueStrike }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrueStrike }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrueStrike }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrueStrike }));

      let nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
      expect(nextAction.getTargetPosition().x).to.equal(2);
      expect(nextAction.getTargetPosition().y).to.equal(2);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
    });

    it('expect at 0% difficulty: will always use dervishes to attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const ai = new StarterAI(gameSession, player1.getPlayerId(), 0);

      // const weaver = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.OrbWeaver}, 5, 2, gameSession.getPlayer1Id());
      // const weaver2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.OrbWeaver}, 4, 0, gameSession.getPlayer1Id());
      // const weaver3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.OrbWeaver}, 4, 4, gameSession.getPlayer1Id());
      const dervish = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Dervish }, 7, 2, gameSession.getPlayer1Id());
      dervish.refreshExhaustion();
      const dervish2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Dervish }, 7, 3, gameSession.getPlayer1Id());
      dervish2.refreshExhaustion();
      const dervish3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Dervish }, 7, 1, gameSession.getPlayer1Id());
      dervish3.refreshExhaustion();

      let nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
      expect(nextAction.getTargetPosition().x).to.equal(2);
      expect(nextAction.getTargetPosition().y).to.equal(2);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.AttackAction.type);
      SDK.GameSession.getInstance().executeAction(nextAction);
      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.AttackAction.type);
      SDK.GameSession.getInstance().executeAction(nextAction);
      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.AttackAction.type);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
    });

    it('expect at 0% difficulty: will only attack enemy general with own general, never with own units', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const ai = new StarterAI(gameSession, player1.getPlayerId(), 0);

      const orbWeaver = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.AymaraHealer }, 8, 3, gameSession.getPlayer1Id());
      orbWeaver.refreshExhaustion();

      gameSession.getGeneralForPlayer1().refreshExhaustion();
      let action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
      gameSession.executeAction(action);
      gameSession.getGeneralForPlayer1().refreshExhaustion();
      action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      gameSession.getGeneralForPlayer1().refreshExhaustion();
      action = gameSession.getGeneralForPlayer1().actionMove({ x: 6, y: 2 });
      gameSession.executeAction(action);
      gameSession.getGeneralForPlayer1().refreshExhaustion();
      action = gameSession.getGeneralForPlayer1().actionMove({ x: 7, y: 2 });
      gameSession.executeAction(action);

      let nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.AttackAction.type);
      expect(nextAction.sourcePosition.y).to.equal(2);
      expect(nextAction.sourcePosition.x).to.equal(7);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
    });

    it('expect at 10% difficulty: will not spawn a unit if two are already on board and hand not full', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const ai = new StarterAI(gameSession, player1.getPlayerId(), 0.1);

      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 7, 2, gameSession.getPlayer1Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 7, 3, gameSession.getPlayer1Id());

      player1.remainingMana = 3;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));

      let nextAction = ai.nextAction();

      expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
      expect(nextAction.getTargetPosition().x).to.equal(2);
      expect(nextAction.getTargetPosition().y).to.equal(2);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      SDK.GameSession.getInstance().executeAction(nextAction);

      expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
    });

    it('expect at 10% difficulty: will spawn a unit if two are already on board only if hand is full', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const ai = new StarterAI(gameSession, player1.getPlayerId(), 0.1);

      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 0, 3, gameSession.getPlayer1Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 0, 1, gameSession.getPlayer1Id());

      player1.remainingMana = 3;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));

      let nextAction = ai.nextAction();
      SDK.GameSession.getInstance().executeAction(nextAction);
      expect(nextAction.getIsValid()).to.equal(true);
      expect(nextAction.getType()).to.equal(SDK.MoveAction.type);

      nextAction = ai.nextAction();
      SDK.GameSession.getInstance().executeAction(nextAction);
      expect(nextAction.getIsValid()).to.equal(true);
      expect(nextAction instanceof SDK.PlayCardFromHandAction).to.equal(true);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
    });

    it('expect at 10% difficulty: will attack enemy general with own general and own units', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const ai = new StarterAI(gameSession, player1.getPlayerId(), 0.1);

      const aymaraHealer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.AymaraHealer }, 8, 3, gameSession.getPlayer1Id());
      aymaraHealer.refreshExhaustion();

      gameSession.getGeneralForPlayer1().refreshExhaustion();
      let action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
      gameSession.executeAction(action);
      gameSession.getGeneralForPlayer1().refreshExhaustion();
      action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      gameSession.getGeneralForPlayer1().refreshExhaustion();
      action = gameSession.getGeneralForPlayer1().actionMove({ x: 6, y: 2 });
      gameSession.executeAction(action);
      gameSession.getGeneralForPlayer1().refreshExhaustion();
      action = gameSession.getGeneralForPlayer1().actionMove({ x: 7, y: 2 });
      gameSession.executeAction(action);

      let nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.AttackAction.type);
      expect(nextAction.sourcePosition.y).to.equal(2);
      expect(nextAction.sourcePosition.x).to.equal(7);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.AttackAction.type);
      expect(nextAction.sourcePosition.y).to.equal(3);
      expect(nextAction.sourcePosition.x).to.equal(7);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
    });

    it('expect at 10% difficulty: general will not retreat when below 10 hp', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const ai = new StarterAI(gameSession, player1.getPlayerId(), 0.1);

      const orbWeaver = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.OrbWeaver }, 4, 0, gameSession.getPlayer1Id());
      const orbWeaver2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.OrbWeaver }, 4, 4, gameSession.getPlayer1Id());
      const orbWeaver3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.OrbWeaver }, 5, 2, gameSession.getPlayer1Id());

      gameSession.getGeneralForPlayer1().setDamage(20);

      gameSession.getGeneralForPlayer1().refreshExhaustion();
      let action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
      gameSession.executeAction(action);
      gameSession.getGeneralForPlayer1().refreshExhaustion();
      action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      gameSession.getGeneralForPlayer1().refreshExhaustion();
      action = gameSession.getGeneralForPlayer1().actionMove({ x: 6, y: 2 });
      gameSession.executeAction(action);
      gameSession.getGeneralForPlayer1().refreshExhaustion();
      action = gameSession.getGeneralForPlayer1().actionMove({ x: 7, y: 2 });
      gameSession.executeAction(action);
      gameSession.getGeneralForPlayer1().refreshExhaustion();

      let nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.AttackAction.type);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
    });

    it('expect at 20% difficulty: general will retreat when below 10 hp', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const ai = new StarterAI(gameSession, player1.getPlayerId(), 0.2);

      const orbWeaver = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.OrbWeaver }, 4, 0, gameSession.getPlayer1Id());
      const orbWeaver2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.OrbWeaver }, 4, 4, gameSession.getPlayer1Id());
      const orbWeaver3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.OrbWeaver }, 5, 2, gameSession.getPlayer1Id());

      gameSession.getGeneralForPlayer1().setDamage(20);

      gameSession.getGeneralForPlayer1().refreshExhaustion();
      let action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
      gameSession.executeAction(action);
      gameSession.getGeneralForPlayer1().refreshExhaustion();
      action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      gameSession.getGeneralForPlayer1().refreshExhaustion();
      action = gameSession.getGeneralForPlayer1().actionMove({ x: 6, y: 2 });
      gameSession.executeAction(action);
      gameSession.getGeneralForPlayer1().refreshExhaustion();
      action = gameSession.getGeneralForPlayer1().actionMove({ x: 7, y: 2 });
      gameSession.executeAction(action);
      gameSession.getGeneralForPlayer1().refreshExhaustion();

      let nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
    });

    it('expect at 20% difficulty: will not spawn a unit if four are already on board and hand not full', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const ai = new StarterAI(gameSession, player1.getPlayerId(), 0.2);

      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 7, 2, gameSession.getPlayer1Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 7, 3, gameSession.getPlayer1Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 6, 3, gameSession.getPlayer1Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 5, 3, gameSession.getPlayer1Id());

      player1.remainingMana = 3;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));

      let nextAction = ai.nextAction();

      expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
      expect(nextAction.getTargetPosition().x).to.equal(2);
      expect(nextAction.getTargetPosition().y).to.equal(2);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      SDK.GameSession.getInstance().executeAction(nextAction);

      expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
    });

    it('expect at 20% difficulty: will spawn a unit if four are already on board only if hand is full', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const ai = new StarterAI(gameSession, player1.getPlayerId(), 0.2);

      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 0, 3, gameSession.getPlayer1Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 0, 4, gameSession.getPlayer1Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 0, 1, gameSession.getPlayer1Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 0, 0, gameSession.getPlayer1Id());

      player1.remainingMana = 3;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));

      let nextAction = ai.nextAction();
      SDK.GameSession.getInstance().executeAction(nextAction);
      expect(nextAction.getIsValid()).to.equal(true);
      expect(nextAction.getType()).to.equal(SDK.MoveAction.type);

      nextAction = ai.nextAction();
      SDK.GameSession.getInstance().executeAction(nextAction);
      expect(nextAction.getIsValid()).to.equal(true);
      expect(nextAction instanceof SDK.PlayCardFromHandAction).to.equal(true);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
    });

    it('expect at 20% difficulty: never spawns more than 1 unit per turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const ai = new StarterAI(gameSession, player1.getPlayerId(), 0.2);

      player1.remainingMana = 3;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));

      let nextAction = ai.nextAction();

      expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
      expect(nextAction.getTargetPosition().x).to.equal(2);
      expect(nextAction.getTargetPosition().y).to.equal(2);
      expect(nextAction.getIsValid()).to.equal(true);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);
      expect(nextAction.getCard().getId()).to.equal(SDK.Cards.Faction1.SilverguardSquire);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
    });

    it('expect at 20% difficulty: never removes more than 2 units per turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const ai = new StarterAI(gameSession, player1.getPlayerId(), 0.2);

      const pyromancer1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Pyromancer }, 7, 0, gameSession.getPlayer2Id());
      const pyromancer2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Pyromancer }, 7, 1, gameSession.getPlayer2Id());
      const pyromancer3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Pyromancer }, 7, 3, gameSession.getPlayer2Id());

      player1.remainingMana = 4;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrueStrike }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrueStrike }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrueStrike }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrueStrike }));

      let nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
      expect(nextAction.getTargetPosition().x).to.equal(2);
      expect(nextAction.getTargetPosition().y).to.equal(2);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
    });

    it('expect at 50% difficulty: never spawns more than 3 units per turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const ai = new StarterAI(gameSession, player1.getPlayerId(), 0.5);

      player1.remainingMana = 3;
      player1.signatureCardIndices = [];

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));

      let nextAction = ai.nextAction();

      expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
      expect(nextAction.getTargetPosition().x).to.equal(2);
      expect(nextAction.getTargetPosition().y).to.equal(2);
      expect(nextAction.getIsValid()).to.equal(true);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);
      expect(nextAction.getCard().getId()).to.equal(SDK.Cards.Faction1.SilverguardSquire);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);
      expect(nextAction.getCard().getId()).to.equal(SDK.Cards.Faction1.SilverguardSquire);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
    });

    it('expect at 50% difficulty: never removes more than 5 units per turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const ai = new StarterAI(gameSession, player1.getPlayerId(), 0.5);

      const pyromancer1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Pyromancer }, 7, 0, gameSession.getPlayer2Id());
      const pyromancer2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Pyromancer }, 7, 1, gameSession.getPlayer2Id());
      const pyromancer3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Pyromancer }, 7, 3, gameSession.getPlayer2Id());
      const pyromancer4 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Pyromancer }, 6, 3, gameSession.getPlayer2Id());
      const pyromancer5 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Pyromancer }, 7, 4, gameSession.getPlayer2Id());
      const pyromancer6 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Pyromancer }, 6, 2, gameSession.getPlayer2Id());

      player1.remainingMana = 5;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrueStrike }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrueStrike }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrueStrike }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrueStrike }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrueStrike }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrueStrike }));

      let nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
      expect(nextAction.getTargetPosition().x).to.equal(2);
      expect(nextAction.getTargetPosition().y).to.equal(2);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
    });

    it('expect at 50% difficulty: will not spawn a unit if ten are already on board and hand not full', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const ai = new StarterAI(gameSession, player1.getPlayerId(), 0.5);

      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 7, 2, gameSession.getPlayer1Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 7, 3, gameSession.getPlayer1Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 6, 3, gameSession.getPlayer1Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 6, 1, gameSession.getPlayer1Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 6, 2, gameSession.getPlayer1Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 6, 0, gameSession.getPlayer1Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 6, 4, gameSession.getPlayer1Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 5, 3, gameSession.getPlayer1Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 5, 2, gameSession.getPlayer1Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 5, 1, gameSession.getPlayer1Id());

      player1.remainingMana = 3;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));

      let nextAction = ai.nextAction();

      expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
      expect(nextAction.getTargetPosition().x).to.equal(2);
      expect(nextAction.getTargetPosition().y).to.equal(2);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      SDK.GameSession.getInstance().executeAction(nextAction);

      expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
    });

    it('expect at 50% difficulty: will spawn a unit if ten are already on board only if hand is full', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const ai = new StarterAI(gameSession, player1.getPlayerId(), 0.5);

      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 7, 2, gameSession.getPlayer1Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 7, 3, gameSession.getPlayer1Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 6, 3, gameSession.getPlayer1Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 6, 1, gameSession.getPlayer1Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 6, 2, gameSession.getPlayer1Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 6, 0, gameSession.getPlayer1Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 6, 4, gameSession.getPlayer1Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 5, 3, gameSession.getPlayer1Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 5, 2, gameSession.getPlayer1Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 5, 1, gameSession.getPlayer1Id());

      player1.remainingMana = 3;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));

      let nextAction = ai.nextAction();

      expect(nextAction.getType()).to.equal(SDK.MoveAction.type);
      expect(nextAction.getTargetPosition().x).to.equal(2);
      expect(nextAction.getTargetPosition().y).to.equal(2);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.PlayCardFromHandAction.type);
      SDK.GameSession.getInstance().executeAction(nextAction);

      nextAction = ai.nextAction();
      expect(nextAction.getType()).to.equal(SDK.EndTurnAction.type);
    });
  });

  describe('getAutomaticUsableDeck()', () => {
    it('expect low/mid cost melee units at 0% difficulty', () => {
      const difficulty = 0.0;
      const factions = SDK.FactionFactory.getAllPlayableFactions();
      for (let i = 0, il = factions.length; i < il; i++) {
        const factionData = factions[i];
        const factionId = factionData.id;
        const generalId = factionData.generalIds[Math.floor(Math.random() * factionData.generalIds.length)];
        const deckData = UsableDecks.getAutomaticUsableDeck(generalId, difficulty);
        let numUnits = 0;
        for (let j = 0, jl = deckData.length; j < jl; j++) {
          const cardData = deckData[j];
          const card = SDK.GameSession.getCardCaches().getCardById(cardData.id);
          expect(card.getType()).to.equal(SDK.CardType.Unit);
          expect(_.contains(card.getCachedKeywordClasses(), SDK.ModifierRanged)).to.equal(false);
          expect(_.contains(card.getCachedKeywordClasses(), SDK.ModifierBlastAttack)).to.equal(false);
          expect(card.getManaCost()).to.be.below(7);
          numUnits++;
        }
        expect(numUnits).to.be.above(0);
      }
    });

    it('expect spells at 20% difficulty', () => {
      const difficulty = 0.2;
      const factions = SDK.FactionFactory.getAllPlayableFactions();
      for (let i = 0, il = factions.length; i < il; i++) {
        const factionData = factions[i];
        const factionId = factionData.id;
        const generalId = factionData.generalIds[Math.floor(Math.random() * factionData.generalIds.length)];
        const deckData = UsableDecks.getAutomaticUsableDeck(generalId, difficulty);
        let numUnits = 0;
        let numSpells = 0;
        for (let j = 0, jl = deckData.length; j < jl; j++) {
          const cardData = deckData[j];
          const card = SDK.GameSession.getCardCaches().getCardById(cardData.id);
          if (card.getType() === SDK.CardType.Unit) {
            expect(_.contains(card.getCachedKeywordClasses(), SDK.ModifierRanged)).to.equal(false);
            expect(_.contains(card.getCachedKeywordClasses(), SDK.ModifierBlastAttack)).to.equal(false);
            expect(card.getManaCost()).to.be.below(7);
            numUnits++;
          } else if (card.getType() === SDK.CardType.Spell) {
            expect(card.getFactionId()).to.equal(factionId);
            numSpells++;
          }
        }
        expect(numUnits).to.be.above(0);
        expect(numSpells).to.be.above(0);
      }
    });

    it('expect artifacts at 50% difficulty', () => {
      const difficulty = 0.5;
      const factions = SDK.FactionFactory.getAllPlayableFactions();
      for (let i = 0, il = factions.length; i < il; i++) {
        const factionData = factions[i];
        const factionId = factionData.id;
        const generalId = factionData.generalIds[Math.floor(Math.random() * factionData.generalIds.length)];
        const deckData = UsableDecks.getAutomaticUsableDeck(generalId, difficulty);
        let numUnits = 0;
        let numSpells = 0;
        let numArtifacts = 0;
        for (let j = 0, jl = deckData.length; j < jl; j++) {
          const cardData = deckData[j];
          const card = SDK.GameSession.getCardCaches().getCardById(cardData.id);
          if (card.getType() === SDK.CardType.Unit) {
            expect(card.getManaCost()).to.be.below(7);
            numUnits++;
          } else if (card.getType() === SDK.CardType.Spell) {
            expect(card.getFactionId()).to.equal(factionId);
            numSpells++;
          } else if (card.getType() === SDK.CardType.Artifact) {
            expect(card.getFactionId()).to.equal(factionId);
            numArtifacts++;
          }
        }
        expect(numUnits).to.be.above(0);
        expect(numSpells).to.be.above(0);
        expect(numArtifacts).to.be.above(0);
      }
    });

    it('expect high cost units at 75% difficulty', () => {
      const difficulty = 0.75;
      const factions = SDK.FactionFactory.getAllPlayableFactions();
      for (let i = 0, il = factions.length; i < il; i++) {
        const factionData = factions[i];
        const factionId = factionData.id;
        const generalId = factionData.generalIds[Math.floor(Math.random() * factionData.generalIds.length)];
        const deckData = UsableDecks.getAutomaticUsableDeck(generalId, difficulty);
        let numUnits = 0;
        let numHighCostUnits = 0;
        let numSpells = 0;
        let numArtifacts = 0;
        for (let j = 0, jl = deckData.length; j < jl; j++) {
          const cardData = deckData[j];
          const card = SDK.GameSession.getCardCaches().getCardById(cardData.id);
          if (card.getType() === SDK.CardType.Unit) {
            if (card.getManaCost() > 6) {
              numHighCostUnits++;
            }
            numUnits++;
          } else if (card.getType() === SDK.CardType.Spell) {
            expect(card.getFactionId()).to.equal(factionId);
            numSpells++;
          } else if (card.getType() === SDK.CardType.Artifact) {
            expect(card.getFactionId()).to.equal(factionId);
            numArtifacts++;
          }
        }
        expect(numUnits).to.be.above(0);
        expect(numHighCostUnits).to.be.above(0);
        expect(numSpells).to.be.above(0);
        expect(numArtifacts).to.be.above(0);
      }
    });

    /* Test disabled: flaky.
    it('expect a randomized deck to contain random cards', () => {
      const numRandomCards = CONFIG.MAX_DECK_SIZE;
      const difficulty = 1.0;
      const factions = SDK.FactionFactory.getAllPlayableFactions();
      for (let i = 0, il = factions.length; i < il; i++) {
        const factionData = factions[i];
        const factionId = factionData.id;
        const generalId = factionData.generalIds[Math.floor(Math.random() * factionData.generalIds.length)];
        const deckData = UsableDecks.getAutomaticUsableDeck(generalId, difficulty);
        const deckDataRandomized = UsableDecks.getAutomaticUsableDeck(generalId, difficulty, numRandomCards);
        let randomized = false;
        for (let j = 0, jl = deckData.length; j < jl; j++) {
          const cardData = deckData[j];
          const cardDataRandomized = deckDataRandomized[j];
          if (cardData.id !== cardDataRandomized.id) {
            randomized = true;
            break;
          }
        }
        expect(randomized).to.equal(true);
      }
    });
    */

    /* Test disabled: failing
    it('expect a fully randomized deck at 100% difficulty to contain 40 cards and the proper swath of card types', function() {
      const numRandomCards = CONFIG.MAX_DECK_SIZE;
      const tempGameSession = SDK.GameSession.create();
      const difficulty = 1.0;
      const factions = SDK.FactionFactory.getAllPlayableFactions();
      for (var n = 0; n < 50; n++) {
        for (var i = 0, il = factions.length; i < il; i++) {
          const factionData = factions[i];
          const factionId = factionData.id;
          const generalId = factionData.generalIds[Math.floor(Math.random() * factionData.generalIds.length)];
          const deckData = UsableDecks.getAutomaticUsableDeck(generalId, difficulty);
          const deckDataRandomized = UsableDecks.getAutomaticUsableDeck(generalId, difficulty, numRandomCards);
          expect(deckDataRandomized.length).to.equal(CONFIG.MAX_DECK_SIZE);

          const generalCount = 0;
          const randomLowMinionCount = 0;
          const randomSpellCount = 0;
          const randomArtifactMidMinionCount = 0;
          const randomHighMinionCount = 0;
          for (var j = 0, jl = deckDataRandomized.length; j < jl; j++) {
            const cardDataId = deckDataRandomized[j].id;
            const card = CardFactory.cardForIdentifier(cardDataId, tempGameSession);
            if (SDK.CardType.getIsEntityCardType(card.getType()) && card.getIsGeneral()) {
              expect(card.getId()).to.equal(generalId);
              generalCount++;
            }
            if (card.getManaCost() < 5 && SDK.CardType.getIsEntityCardType(card.getType())) {
              randomLowMinionCount++;
            }
            if (card.getType() === SDK.CardType.Spell) {
              randomSpellCount++;
            }
            if (card.getType() === SDK.CardType.Artifact || (SDK.CardType.getIsEntityCardType(card.getType()) && (card.getManaCost() == 5))) {
              randomArtifactMidMinionCount++;
            }
            if (card.getManaCost() > 5 && SDK.CardType.getIsEntityCardType(card.getType())) {
              randomHighMinionCount++;
            }
          }

          const lowMinionCount = 0;
          const spellCount = 0;
          const artifactMidMinionCount = 0;
          const highMinionCount = 0;
          for (var j = 0, jl = deckData.length; j < jl; j++) {
            const cardDataId = deckData[j].id;
            const card = CardFactory.cardForIdentifier(cardDataId, tempGameSession);
            if (card.getManaCost() < 5 && SDK.CardType.getIsEntityCardType(card.getType())) {
              lowMinionCount++;
            }
            if (card.getType() === SDK.CardType.Spell) {
              spellCount++;
            }
            if (card.getType() === SDK.CardType.Artifact || (SDK.CardType.getIsEntityCardType(card.getType()) && (card.getManaCost() == 5))) {
              artifactMidMinionCount++;
            }
            if (card.getManaCost() > 5 && SDK.CardType.getIsEntityCardType(card.getType())) {
              highMinionCount++;
            }
          }
           console.log("Faction ", factionData.id, ": low cost minions original: ", lowMinionCount, " vs randomized: ", randomLowMinionCount);
           console.log("Faction ", factionData.id, ": spells original: ", spellCount, " vs randomized: ", randomSpellCount);
           console.log("Faction ", factionData.id, ": artifacts and mid cost minions original: ", artifactMidMinionCount, " vs randomized: ", randomArtifactMidMinionCount);
           console.log("Faction ", factionData.id, ": high cost minions original: ", highMinionCount, " vs randomized: ", randomHighMinionCount);
        }

        expect(generalCount).to.equal(1);
        expect(lowMinionCount - randomLowMinionCount).to.be.below(3);
        expect(spellCount - randomSpellCount).to.be.below(3);
        expect(artifactMidMinionCount - randomArtifactMidMinionCount).to.be.below(3);
        expect(highMinionCount - randomHighMinionCount).to.be.below(3);
      }
    });
    */

    /* Test disabled: slow
    it('expect a randomized deck at 0% difficulty to contain nothing more than basics and commons', function() {
      const numRandomCards = CONFIG.MAX_DECK_SIZE;
      const tempGameSession = SDK.GameSession.create();
      const difficulty = 0.0;
      const factions = SDK.FactionFactory.getAllPlayableFactions();
      for (var n = 0; n < 50; n++) {
        const tooRare = false;
        for (var i = 0, il = factions.length; i < il; i++) {
          const factionData = factions[i];
          const factionId = factionData.id;
          const generalId = factionData.generalIds[Math.floor(Math.random() * factionData.generalIds.length)];
          const deckData = UsableDecks.getAutomaticUsableDeck(generalId, difficulty);
          const deckDataRandomized = UsableDecks.getAutomaticUsableDeck(generalId, difficulty, numRandomCards);
          tooRare = false;
          for (var j = 0, jl = deckDataRandomized.length; j < jl; j++) {
            const cardDataId = deckDataRandomized[j].id;
            const card = CardFactory.cardForIdentifier(cardDataId, tempGameSession);
            if (card.rarityId != SDK.Rarity.Fixed && card.rarityId != SDK.Rarity.Common) {
              tooRare = true;
              break;
            }
          }
        }

        expect(tooRare).to.equal(false);
      }
    });
    */

    /* Test disabled: slow
    it('expect a randomized deck at 20% difficulty to contain nothing more than basics, commons, and rares', function() {
      const numRandomCards = CONFIG.MAX_DECK_SIZE;
      const tempGameSession = SDK.GameSession.create();
      const difficulty = 0.2;
      const factions = SDK.FactionFactory.getAllPlayableFactions();
      for (var n = 0; n < 50; n++) {
        const tooRare = false;
        for (var i = 0, il = factions.length; i < il; i++) {
          const factionData = factions[i];
          const factionId = factionData.id;
          const generalId = factionData.generalIds[Math.floor(Math.random() * factionData.generalIds.length)];
          const deckData = UsableDecks.getAutomaticUsableDeck(generalId, difficulty);
          const deckDataRandomized = UsableDecks.getAutomaticUsableDeck(generalId, difficulty, numRandomCards);
          tooRare = false;
          for (var j = 0, jl = deckDataRandomized.length; j < jl; j++) {
            const cardDataId = deckDataRandomized[j].id;
            const card = CardFactory.cardForIdentifier(cardDataId, tempGameSession);
            if (card.rarityId != SDK.Rarity.Fixed && card.rarityId != SDK.Rarity.Common && card.rarityId != SDK.Rarity.Rare) {
              tooRare = true;
              break;
            }
          }
        }

        expect(tooRare).to.equal(false);
      }
    });
    */

    /* Test disabled: slow
    it('expect a randomized deck at 50% difficulty to contain nothing more than basics, commons, rares, and epics', function() {
      const numRandomCards = CONFIG.MAX_DECK_SIZE;
      const tempGameSession = SDK.GameSession.create();
      const difficulty = 0.5;
      const factions = SDK.FactionFactory.getAllPlayableFactions();
      for (var n = 0; n < 50; n++) {
        const tooRare = false;
        for (var i = 0, il = factions.length; i < il; i++) {
          const factionData = factions[i];
          const factionId = factionData.id;
          const generalId = factionData.generalIds[Math.floor(Math.random() * factionData.generalIds.length)];
          const deckData = UsableDecks.getAutomaticUsableDeck(generalId, difficulty);
          const deckDataRandomized = UsableDecks.getAutomaticUsableDeck(generalId, difficulty, numRandomCards);
          tooRare = false;
          for (var j = 0, jl = deckDataRandomized.length; j < jl; j++) {
            const cardDataId = deckDataRandomized[j].id;
            const card = CardFactory.cardForIdentifier(cardDataId, tempGameSession);
            if (card.rarityId != SDK.Rarity.Fixed && card.rarityId != SDK.Rarity.Common && card.rarityId != SDK.Rarity.Rare && card.rarityId != SDK.Rarity.Epic) {
              tooRare = true;
              break;
            }
          }
        }

        expect(tooRare).to.equal(false);
      }
    });
    */
  });
});
