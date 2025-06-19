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

describe('core set', () => {
  describe('epics', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction6.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect aethermaster to allow you to replace 1 extra card per turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const aethermaster = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Aethermaster }, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Metamorphosis }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));

      var action = player1.actionReplaceCardFromHand(0);
      gameSession.executeAction(action);

      var hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);

      var action = player1.actionReplaceCardFromHand(0);
      gameSession.executeAction(action);

      var hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getBaseCardId()).to.equal(SDK.Cards.Spell.Metamorphosis);
    });

    it('expect alcuin loremaster to copy the last spell cast', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.AlcuinLoremaster }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
    });

    it('expect chaos elemental to teleport to a random space when taking damage', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      var chaosElemental = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ChaosElemental }, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      var chaosElemental = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.ChaosElemental);
      const updatedChaosElemental = board.getUnitAtPosition({ x: 1, y: 2 });

      expect(updatedChaosElemental).to.equal(undefined);
      expect(chaosElemental.getHP()).to.equal(1);
    });

    it('expect sworn avenger to gain +1 attack when general is damaged', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const swornAvenger = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SwornAvenger }, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(swornAvenger.getATK()).to.equal(2);
    });

    it('expect syvrel the exile to move minions in front of him', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const syvrel = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SyvrelTheExile }, 1, 2, gameSession.getPlayer1Id());
      var azurehorn = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.AzureHornShaman }, 7, 4, gameSession.getPlayer2Id());

      syvrel.refreshExhaustion();
      const action = syvrel.actionAttack(azurehorn);
      gameSession.executeAction(action);

      var azurehorn = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.AzureHornShaman);

      expect(azurehorn.getPosition().x).to.equal(2);
      expect(azurehorn.getPosition().y).to.equal(2);
    });

    it('expect venom toth to deal 1 damage to the enemy general on minion summon', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const venomtoth = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.VenomToth }, 4, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.AzureHornShaman }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(1);
    });

    it('expect artifact hunter to draw a random artifact from your deck', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.ArclyteRegalia }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.ArtifactHunter }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getBaseCardId()).to.equal(SDK.Cards.Artifact.ArclyteRegalia);
    });
    /* it('expect chassis of mechaz0r to be untargetable', function() {
    var gameSession = SDK.GameSession.getInstance();
    var board = gameSession.getBoard();
    var player1 = gameSession.getPlayer1();
    var player2 = gameSession.getPlayer2();

    var chassis = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Mechaz0rChassis}, 1, 2, gameSession.getPlayer1Id());

    gameSession.executeAction(gameSession.actionEndTurn());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.PhoenixFire}));
    var playCardFromHandAction = player2.actionPlayCardFromHand(0, 1, 2);
    gameSession.executeAction(playCardFromHandAction);

    expect(playCardFromHandAction.getIsValid()).to.equal(false);
    expect(chassis.getHP()).to.equal(4);
    }); */

    /* Test disabled: failing
    it('expect dioltas to leave a 0/10 provoke tombstone near general upon death', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      var dioltas = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Dilotas}, 7, 2, gameSession.getPlayer1Id());
      dioltas.setDamage(1);

      dioltas.refreshExhaustion();
      var action = dioltas.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      var tombstone = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.DilotasTombstone);

      expect(tombstone.getATK()).to.equal(0);
      expect(tombstone.getHP()).to.equal(10);
      expect(tombstone.hasModifierClass(SDK.ModifierProvoke)).to.equal(true);
    });
    */

    it('expect moebius to return to full health at start of next turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const moebius = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Moebius }, 7, 2, gameSession.getPlayer1Id());

      moebius.setDamage(1);

      expect(moebius.getHP()).to.equal(4);
      expect(moebius.getATK()).to.equal(3);

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      expect(moebius.getHP()).to.equal(5);
      expect(moebius.getATK()).to.equal(3);
    });

    it('expect moebius to swap attack and health at start of next turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const moebius = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Moebius }, 7, 2, gameSession.getPlayer1Id());

      expect(moebius.getHP()).to.equal(5);
      expect(moebius.getATK()).to.equal(3);

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      expect(moebius.getHP()).to.equal(3);
      expect(moebius.getATK()).to.equal(5);
    });

    it('expect buffs moebius receives to be swapped', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const moebius = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Moebius }, 7, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PermafrostShield }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(moebius.getHP()).to.equal(5);
      expect(moebius.getATK()).to.equal(6);

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      expect(moebius.getHP()).to.equal(6);
      expect(moebius.getATK()).to.equal(5);
    });

    it('expect purgatos the realmkeeper to deal 3 damage to enemy general or restore 3 health to your general on attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;
      gameSession.getGeneralForPlayer1().setDamage(5);

      const purgatos = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Purgatos }, 7, 2, gameSession.getPlayer1Id());

      purgatos.refreshExhaustion();
      const action = purgatos.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      let damageSpread = 0;
      damageSpread += (gameSession.getGeneralForPlayer1().getHP() - 20); // general heal
      damageSpread += ((gameSession.getGeneralForPlayer2().getHP() - 22) * -1); // enemy general damage

      expect(damageSpread).to.equal(3);
    });

    it('expect captain hank hart to recover health for as much damage he deals', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const hankHart = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HankHart }, 5, 2, gameSession.getPlayer1Id());
      hankHart.setDamage(3);

      hankHart.refreshExhaustion();
      const action = hankHart.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(hankHart.getHP()).to.equal(3);
    });

    it('expect lux ignis to restore 2 health to all damaged friendly minions nearby at the end of turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const hankHart = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HankHart }, 5, 2, gameSession.getPlayer1Id());
      hankHart.setDamage(3);
      const luxIgnis = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.LuxIgnis }, 6, 2, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 7, 2, gameSession.getPlayer1Id());
      brightmossGolem.setDamage(3);

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(hankHart.getHP()).to.equal(3);
      expect(brightmossGolem.getHP()).to.equal(8);
    });

    it('expect sworn defender to be restored to full health when your general takes damage', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const swornDefender = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SwornDefender }, 5, 2, gameSession.getPlayer1Id());
      swornDefender.setDamage(6);
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 1, 2, gameSession.getPlayer2Id());

      const action = gameSession.getGeneralForPlayer1().actionAttack(brightmossGolem);
      gameSession.executeAction(action);

      expect(swornDefender.getHP()).to.equal(7);
    });

    it('expect twilight sorcerer to put a copy of a random spell you cast this game in your hand', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.TwilightMage }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
    });
  });
});
