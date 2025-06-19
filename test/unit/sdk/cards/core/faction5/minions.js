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

describe('faction5', () => {
  describe('minions', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction5.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction2.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect kujata to lower all minions costs by 1', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const kujata = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.Kujata }, 1, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.KomodoCharger }));
      const komodo = player1.getDeck().getCardInHandAtIndex(0);
      expect(komodo.getManaCostChange()).to.equal(-1);
    });

    it('expect kujata to deal 1 damage to any minion you summon', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const kujata = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.Kujata }, 1, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.KomodoCharger }));
      const komodo = player1.getDeck().getCardInHandAtIndex(0);
      const hp = komodo.getHP();
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(komodo.getHP()).to.equal(hp - 1);
    });

    it('expect kujata to swap effects when mind controlled', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      player1.remainingMana = 9;

      const kujata = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.Kujata }, 7, 2, gameSession.getPlayer1Id());
      expect(kujata.getOwnerId()).to.equal(player1.getPlayerId());

      gameSession.executeAction(gameSession.actionEndTurn());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.Enslave }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Neutral.KomodoCharger }));

      player2.remainingMana = 9;

      const komodo = player2.getDeck().getCardInHandAtIndex(1);
      const hp = komodo.getHP();

      expect(komodo.getManaCostChange()).to.equal(0);

      var playCardFromHandAction = player2.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(kujata.getOwnerId()).to.equal(player2.getPlayerId());
      expect(komodo.getManaCostChange()).to.equal(-1);

      var playCardFromHandAction = player2.actionPlayCardFromHand(1, 8, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(komodo.getHP()).to.equal(hp - 1);
    });

    it('expect rebirth to leave behind an egg on death (young silithar)', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const youngSilithar = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.YoungSilithar }, 0, 1, gameSession.getPlayer2Id());
      const abyssalCrawler1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalCrawler }, 1, 1, gameSession.getPlayer1Id());
      abyssalCrawler1.refreshExhaustion();

      youngSilithar.setDamage(2);

      const action = abyssalCrawler1.actionAttack(youngSilithar);
      gameSession.executeAction(action);

      const egg = board.getUnitAtPosition({ x: 0, y: 1 });
      expect(egg.getId()).to.equal(SDK.Cards.Faction5.Egg);
      expect(egg.getHP()).to.equal(1);
      expect(egg.getATK()).to.equal(0);
    });

    it('expect egg to hatch back into original unit at end of next turn (young silithar)', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      var youngSilithar = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.YoungSilithar }, 0, 1, gameSession.getPlayer2Id());
      const abyssalCrawler1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalCrawler }, 1, 1, gameSession.getPlayer1Id());
      abyssalCrawler1.refreshExhaustion();

      youngSilithar.setDamage(2);

      const action = abyssalCrawler1.actionAttack(youngSilithar);
      gameSession.executeAction(action);

      const egg = board.getUnitAtPosition({ x: 0, y: 1 });
      expect(egg.getId()).to.equal(SDK.Cards.Faction5.Egg);

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      var youngSilithar = board.getUnitAtPosition({ x: 0, y: 1 });
      expect(youngSilithar.getHP()).to.equal(3);
      expect(youngSilithar.getATK()).to.equal(2);
    });

    it('expect grow to gain stats at start of every turn (earth walker)', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const earthwalker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.EarthWalker }, 0, 1, gameSession.getPlayer2Id());

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      expect(earthwalker.getHP()).to.equal(4);
      expect(earthwalker.getATK()).to.equal(4);

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      expect(earthwalker.getHP()).to.equal(5);
      expect(earthwalker.getATK()).to.equal(5);
    });

    it('expect primordial gazer to give friendly nearby minion +2/+2', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;
      const hailstoneGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 0, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction5.PrimordialGazer }));
      const action = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(action);
      const followupCard = action.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 0, 1);
      gameSession.executeAction(followupAction);

      expect(followupAction.getIsValid()).to.equal(true);
      expect(hailstoneGolem.getHP()).to.equal(8);
      expect(hailstoneGolem.getATK()).to.equal(6);
    });

    it('expect vindicator to gain +2/+2 whenever opponent draws a card', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const vindicator = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.Vindicator }, 0, 0, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.PhaseHound }));
      const action = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(action);

      expect(vindicator.getATK()).to.equal(3);
      expect(vindicator.getHP()).to.equal(5);
    });

    it('expect vindicator to not gain +2/+2 whenever opponent draws a card not from their own deck', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const vindicator = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.Vindicator }, 0, 0, gameSession.getPlayer1Id());
      const lanternFox = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.LanternFox }, 0, 1, gameSession.getPlayer2Id());

      const myGeneral = gameSession.getGeneralForPlayer1();
      const action = myGeneral.actionAttack(lanternFox);
      gameSession.executeAction(action);

      expect(vindicator.getATK()).to.equal(1);
      expect(vindicator.getHP()).to.equal(3);
    });

    it('expect elucidator to deal 4 damage to own general when summoned', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction5.Elucidator }));
      const action = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(21);
    });

    it('expect spirit harvester to deal 1 damage to all friendly and enemy minions at end of turn and to not hurt self', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const earthwalker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.EarthWalker }, 0, 1, gameSession.getPlayer2Id());
      const earthwalker2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.EarthWalker }, 1, 1, gameSession.getPlayer1Id());
      const spiritHarvester = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.SpiritHarvester }, 0, 0, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(earthwalker.getHP()).to.equal(3);
      expect(earthwalker2.getHP()).to.equal(2);
      expect(spiritHarvester.getHP()).to.equal(5);
    });

    it('expect silithar elder to spawn silithar elder egg at end of every turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const silitharElder = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.SilitharElder }, 0, 1, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      let eggx = 0;
      let eggy = 0;

      for (let xx = 0; xx < 10; xx++) {
        for (let yy = 0; yy < 5; yy++) {
          var egg = board.getUnitAtPosition({ x: xx, y: yy });
          if (egg != null && egg.getId() === SDK.Cards.Faction5.Egg) {
            eggx = xx;
            eggy = yy;
            break;
          }
        }
      }

      var egg = board.getUnitAtPosition({ x: eggx, y: eggy });

      const eggModifier = egg.getActiveModifierByClass(SDK.ModifierEgg);
      expect(eggModifier.cardDataOrIndexToSpawn.id).to.equal(SDK.Cards.Faction5.SilitharElder);
    });

    it('expect unstable leviathan to deal 4 damage to a random minion or general at start of owners turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const unstableLeviathan = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.UnstableLeviathan }, 0, 1, gameSession.getPlayer1Id());
      const hailstoneGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 1, 1, gameSession.getPlayer2Id());

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      const totalDamage = gameSession.getGeneralForPlayer1().getDamage() + gameSession.getGeneralForPlayer2().getDamage() + unstableLeviathan.getDamage() + hailstoneGolem.getDamage();

      expect(totalDamage).to.equal(4);
    });
  });
});
