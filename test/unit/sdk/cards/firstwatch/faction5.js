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

describe('first watch', () => {
  describe('faction5', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction5.AltGeneral },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect catalyst quillbeast to deal 1 damage to all minions whenever you cast a spell', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      const quillbeast = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.Quillbeast }, 2, 1, gameSession.getPlayer1Id());
      const terradon1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.Terradon }, 3, 1, gameSession.getPlayer1Id());
      const terradon2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.Terradon }, 3, 4, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction1);

      expect(quillbeast.getDamage()).to.equal(1);
      expect(terradon1.getDamage()).to.equal(1);
      expect(terradon2.getDamage()).to.equal(1);
    });

    it('expect vaaths brutality to give +1 attack and stun an enemy minion', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      const terradon2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.Terradon }, 3, 4, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.VaathsBrutality }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 3, 4);
      gameSession.executeAction(playCardFromHandAction1);

      expect(terradon2.hasActiveModifierClass(SDK.ModifierStunned)).to.equal(true);
      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(3);
    });

    it('expect blood rage to give a minion +1/+1 for each time damage was dealt this turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      const terradon1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.Terradon }, 3, 1, gameSession.getPlayer1Id());
      const terradon2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.Terradon }, 1, 1, gameSession.getPlayer2Id());

      const action = gameSession.getGeneralForPlayer1().actionAttack(terradon2);
      gameSession.executeAction(action); // +2 instances of damage

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
      var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 3, 4);
      gameSession.executeAction(playCardFromHandAction1); // +4 instances of damage

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.BloodRage }));
      var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 3, 1);
      gameSession.executeAction(playCardFromHandAction1);

      expect(terradon1.getATK()).to.equal(8); // 2 base attack + 2 + 4 = 8 attack
      expect(terradon1.getHP()).to.equal(12); // 6 health after Tempest + 2 + 4 = 12
    });

    it('expect omniseer to create a primal flourish tile underneath a nearby friendly minion', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      const terradon1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.Terradon }, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction5.Omniseer }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 1, 2);
      gameSession.executeAction(followupAction);

      const primaltile = board.getTileAtPosition({ x: 1, y: 2 }, true);
      expect(primaltile.getId()).to.equal(SDK.Cards.Tile.PrimalMojo);
    });

    it('expect primal flourish to give grow +2/+2 to friendly minions standing on it', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      const terradon1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.Terradon }, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction5.Omniseer }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 1, 2);
      gameSession.executeAction(followupAction);

      const primaltile = board.getTileAtPosition({ x: 1, y: 2 }, true);
      expect(primaltile.getId()).to.equal(SDK.Cards.Tile.PrimalMojo);

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      expect(terradon1.getATK()).to.equal(4);
      expect(terradon1.getHP()).to.equal(10);
    });

    it('expect primal ballast to dispel a space and give +2/+2 to any minion on that space', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      const terradon1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.Terradon }, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction5.Omniseer }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 1, 2);
      gameSession.executeAction(followupAction);

      var primaltile = board.getTileAtPosition({ x: 1, y: 2 }, true);
      expect(primaltile.getId()).to.equal(SDK.Cards.Tile.PrimalMojo);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.GreaterFortitude }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PrimalBallast }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      var primaltile = board.getTileAtPosition({ x: 1, y: 2 }, true);
      expect(primaltile).to.not.exist;
      expect(terradon1.getATK()).to.equal(4);
      expect(terradon1.getHP()).to.equal(10);
    });

    it('expect rizen to summon an egg of itself nearby any time the enemy summons a minion', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      const rizen = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.Rizen }, 3, 4, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Faction5.Terradon }));
      const playCardFromHandAction = player2.actionPlayCardFromHand(0, 8, 1);
      gameSession.executeAction(playCardFromHandAction);

      const egg = board.getFriendlyEntitiesAroundEntity(rizen);

      expect(egg[0].getId()).to.equal(SDK.Cards.Faction5.Egg);

      gameSession.executeAction(gameSession.actionEndTurn());

      const hatchedEgg = board.getFriendlyEntitiesAroundEntity(rizen);

      expect(hatchedEgg[0].getId()).to.equal(SDK.Cards.Faction5.Rizen);
    });

    it('expect endure the beastlands to create a 2x2 area of primal flourish', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.EndureTheBeastlands }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 0);
      gameSession.executeAction(playCardFromHandAction);

      const primalFlourish1 = board.getTileAtPosition({ x: 0, y: 0 }, true);
      const primalFlourish2 = board.getTileAtPosition({ x: 1, y: 0 }, true);
      const primalFlourish3 = board.getTileAtPosition({ x: 0, y: 1 }, true);
      const primalFlourish4 = board.getTileAtPosition({ x: 1, y: 1 }, true);

      expect(primalFlourish1.getOwnerId()).to.equal(player1.getPlayerId());
      expect(primalFlourish1.getId()).to.equal(SDK.Cards.Tile.PrimalMojo);
      expect(primalFlourish2.getId()).to.equal(SDK.Cards.Tile.PrimalMojo);
      expect(primalFlourish3.getId()).to.equal(SDK.Cards.Tile.PrimalMojo);
      expect(primalFlourish4.getId()).to.equal(SDK.Cards.Tile.PrimalMojo);
    });

    it('expect verdant fulmination to grow friendly minions on primal flourish and spawn primal flourish under minions who arent standing on it', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      const terradon1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.Terradon }, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction5.Omniseer }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 1, 2);
      gameSession.executeAction(followupAction);

      const primaltile = board.getTileAtPosition({ x: 1, y: 2 }, true);
      expect(primaltile.getId()).to.equal(SDK.Cards.Tile.PrimalMojo);
      var primaltile2 = board.getTileAtPosition({ x: 1, y: 1 }, true);
      expect(primaltile2).to.not.exist;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.VerdentFulmination }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(terradon1.getATK()).to.equal(4);
      expect(terradon1.getHP()).to.equal(10);
      var primaltile2 = board.getTileAtPosition({ x: 1, y: 1 }, true);
      expect(primaltile2.getId()).to.equal(SDK.Cards.Tile.PrimalMojo);
    });

    it('expect grandmaster kraigon to give your general forcefield, frenzy, and grow +7/+7', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction5.GrandmasterKraigon }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer1().hasActiveModifierClass(SDK.ModifierFrenzy)).to.equal(true);
      expect(gameSession.getGeneralForPlayer1().hasActiveModifierClass(ModifierForcefield)).to.equal(true);

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(9);
      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(32);

      // kill Kraigon to make sure the buffs are removed

      player1.remainingMana = 9;
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SpiralTechnique }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      player1.remainingMana = 9;
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SpiralTechnique }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      player1.remainingMana = 9;
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SpiralTechnique }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer1().hasActiveModifierClass(SDK.ModifierFrenzy)).to.equal(false);
      expect(gameSession.getGeneralForPlayer1().hasActiveModifierClass(ModifierForcefield)).to.equal(false);
      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(9);
      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(32);

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      // double check to make sure we're still not growing
      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(9);
      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(32);
    });

    it('expect evolutionary apex to play all minions from both players hands around their generals', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.EvolutionaryApex }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction5.Terradon }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction5.Terradon }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Faction5.Terradon }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Faction5.Terradon }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const friendlyMinions = board.getEntitiesAroundEntity(gameSession.getGeneralForPlayer1());
      expect(friendlyMinions[0].getId()).to.equal(SDK.Cards.Faction5.Terradon);
      expect(friendlyMinions[1].getId()).to.equal(SDK.Cards.Faction5.Terradon);
      expect(friendlyMinions[2]).to.not.exist;

      const enemyMinions = board.getEntitiesAroundEntity(gameSession.getGeneralForPlayer2());
      expect(enemyMinions[0].getId()).to.equal(SDK.Cards.Faction5.Terradon);
      expect(enemyMinions[1].getId()).to.equal(SDK.Cards.Faction5.Terradon);
      expect(enemyMinions[2]).to.not.exist;
    });

    it('expect eternal heart to prevent your general from dying', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      gameSession.getGeneralForPlayer1().setDamage(20);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.EternalHeart }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SpiralTechnique }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
      gameSession.executeAction(playCardFromHandAction);

      const modifiers = gameSession.getGeneralForPlayer1().getArtifactModifiers();
      expect(modifiers[0].getDurability()).to.equal(2);
      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(1);
    });
  });
});
