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
  describe('faction4', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction4.AltGeneral },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect nightshroud to steal 1 Health per other Arcanyst only if you have an Arcanyst', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      gameSession.getGeneralForPlayer1().setDamage(5);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.Nightshroud }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.Nightshroud }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.Nightshroud }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction1);
      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(20);
      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(25);

      player1.remainingMana = 9;
      const playCardFromHandAction2 = player1.actionPlayCardFromHand(1, 1, 2);
      gameSession.executeAction(playCardFromHandAction2);
      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(21);
      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(24);

      player1.remainingMana = 9;
      const playCardFromHandAction3 = player1.actionPlayCardFromHand(2, 2, 1);
      gameSession.executeAction(playCardFromHandAction3);
      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(23);
      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(22);
    });

    it('expect blood echoes to destroy minions, then resummon them end of turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const bloodtearAlchemist = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BloodtearAlchemist }, 2, 1, gameSession.getPlayer1Id());
      const nocturne = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Nocturne }, 3, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.DeathIncoming }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      expect(bloodtearAlchemist.getIsRemoved()).to.equal(true);
      expect(nocturne.getIsRemoved()).to.equal(true);

      gameSession.executeAction(gameSession.actionEndTurn());

      const bloodtearCheck = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Neutral.BloodtearAlchemist);
      const nocturneCheck = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction4.Nocturne);

      expect(bloodtearCheck[0].getId()).to.equal(SDK.Cards.Neutral.BloodtearAlchemist);
      expect(nocturneCheck[0].getId()).to.equal(SDK.Cards.Faction4.Nocturne);
    });

    it('expect the releaser to resummon a random friendly minion when broken', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const bluetipScorpion = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BluetipScorpion }, 0, 1, gameSession.getPlayer2Id());
      const repulsorBeast = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.RepulsionBeast }, 1, 1, gameSession.getPlayer2Id());
      const bloodtearAlchemist = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BloodtearAlchemist }, 2, 1, gameSession.getPlayer1Id());
      const nocturne = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Nocturne }, 3, 1, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.AngryRebirthAmulet }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      var action = bluetipScorpion.actionAttack(gameSession.getGeneralForPlayer1());
      gameSession.executeAction(action);
      var action = repulsorBeast.actionAttack(gameSession.getGeneralForPlayer1());
      gameSession.executeAction(action);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));

      const released = board.getFriendlyEntitiesAroundEntity(board.getUnitAtPosition({ x: 0, y: 2 }));
      let releasedCheck = false;

      if (released[0].getId() === SDK.Cards.Neutral.BloodtearAlchemist) {
        releasedCheck = true;
      } else if (released[0].getId() === SDK.Cards.Faction4.Nocturne) {
        releasedCheck = true;
      }

      expect(releasedCheck).to.equal(true);
    });

    it('expect the releaser to do nothing if theres nothing to summon', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const bluetipScorpion = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BluetipScorpion }, 0, 1, gameSession.getPlayer2Id());
      const repulsorBeast = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.RepulsionBeast }, 1, 1, gameSession.getPlayer2Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.AngryRebirthAmulet }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      var action = bluetipScorpion.actionAttack(gameSession.getGeneralForPlayer1());
      gameSession.executeAction(action);
      var action = repulsorBeast.actionAttack(gameSession.getGeneralForPlayer1());
      gameSession.executeAction(action);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));

      const released = board.getFriendlyEntitiesAroundEntity(board.getUnitAtPosition({ x: 0, y: 2 }));
      expect(released[0]).to.not.exist;
    });

    it('expect the releaser to not resummon tokens', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const bluetipScorpion = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BluetipScorpion }, 0, 1, gameSession.getPlayer2Id());
      const repulsorBeast = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.RepulsionBeast }, 1, 1, gameSession.getPlayer2Id());
      const illusion = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ArcaneIllusion }, 2, 1, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.AngryRebirthAmulet }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      var action = bluetipScorpion.actionAttack(gameSession.getGeneralForPlayer1());
      gameSession.executeAction(action);
      var action = repulsorBeast.actionAttack(gameSession.getGeneralForPlayer1());
      gameSession.executeAction(action);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));

      const released = board.getFriendlyEntitiesAroundEntity(board.getUnitAtPosition({ x: 0, y: 2 }));
      expect(released[0]).to.not.exist;
    });

    it('expect nocturne to summon wraithlings when making creep', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const nocturne = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Nocturne }, 1, 2, gameSession.getPlayer1Id());
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ShadowNova }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 0);
      gameSession.executeAction(playCardFromHandAction);

      const wraithling1 = board.getUnitAtPosition({ x: 0, y: 0 }, true);
      const wraithling2 = board.getUnitAtPosition({ x: 1, y: 0 }, true);
      const wraithling3 = board.getUnitAtPosition({ x: 0, y: 1 }, true);
      const wraithling4 = board.getUnitAtPosition({ x: 1, y: 1 }, true);

      expect(wraithling1.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
      expect(wraithling2.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
      expect(wraithling3.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
      expect(wraithling4.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
    });

    it('expect nocturne to make creep when summoning wraithlings', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const nocturne = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Nocturne }, 1, 2, gameSession.getPlayer1Id());
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.WraithlingSwarm }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 0, 4);
      gameSession.executeAction(followupAction);
      const followupCard2 = followupAction.getCard().getCurrentFollowupCard();
      const followupAction2 = player1.actionPlayFollowup(followupCard2, 1, 4);
      gameSession.executeAction(followupAction2);

      const shadowCreep1 = board.getTileAtPosition({ x: 0, y: 3 }, true);
      const shadowCreep2 = board.getTileAtPosition({ x: 0, y: 4 }, true);
      const shadowCreep3 = board.getTileAtPosition({ x: 1, y: 4 }, true);

      expect(shadowCreep1.getId()).to.equal(SDK.Cards.Tile.Shadow);
      expect(shadowCreep2.getId()).to.equal(SDK.Cards.Tile.Shadow);
      expect(shadowCreep3.getId()).to.equal(SDK.Cards.Tile.Shadow);
    });

    it('expect death knell to resummon arcanysts nearby when summoned', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const manaforger = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Manaforger }, 1, 1, gameSession.getPlayer1Id());
      const nocturne = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Nocturne }, 1, 2, gameSession.getPlayer1Id());

      player1.remainingMana = 9;
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.CircleOfDesiccation }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      player1.remainingMana = 9;
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.DeathKnell }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      const generalMove = board.getUnitAtPosition({ x: 0, y: 2 });
      generalMove.refreshExhaustion();
      const action = generalMove.actionMove({ x: 0, y: 0 });
      gameSession.executeAction(action);

      const arcanystCheck = board.getFriendlyEntitiesAroundEntity(board.getUnitAtPosition({ x: 1, y: 2 }));
      let arcanystVerify1 = false;
      let arcanystVerify2 = false;

      if (arcanystCheck[0].getId() === SDK.Cards.Neutral.Manaforger || arcanystCheck[0].getId() === SDK.Cards.Faction4.Nocturne) {
        arcanystVerify1 = true;
      }

      if (arcanystCheck[1].getId() === SDK.Cards.Neutral.Manaforger || arcanystCheck[1].getId() === SDK.Cards.Faction4.Nocturne) {
        arcanystVerify2 = true;
      }

      expect(arcanystVerify1).to.equal(true);
      expect(arcanystVerify2).to.equal(true);
    });
  });
});
