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

describe('faction4', () => {
  describe('minions', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction4.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction2.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect abyssal crawler to spawn 1 shadow creep nearby at the end of turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const abyssalCrawler1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalCrawler }, 0, 0, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      const shadowCreep1 = board.getTileAtPosition({ x: 0, y: 1 }, true);
      const shadowCreep2 = board.getTileAtPosition({ x: 1, y: 0 }, true);
      const shadowCreep3 = board.getTileAtPosition({ x: 1, y: 1 }, true);

      let creepSpawn = 0;
      if (shadowCreep1 != undefined) {
        if (shadowCreep1.getId() == SDK.Cards.Tile.Shadow) {
          creepSpawn++;
        }
      }
      if (shadowCreep2 != undefined) {
        if (shadowCreep2.getId() == SDK.Cards.Tile.Shadow) {
          creepSpawn++;
        }
      }
      if (shadowCreep3 != undefined) {
        if (shadowCreep3.getId() == SDK.Cards.Tile.Shadow) {
          creepSpawn++;
        }
      }

      expect(creepSpawn).to.equal(1);
    });

    it('expect blood siren to give a nearby enemy minion -2 attack until end of turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const youngSilithar = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.YoungSilithar }, 0, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.DarkSiren }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 0, 1);
      gameSession.executeAction(followupAction);

      expect(youngSilithar.getATK()).to.equal(0);

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(youngSilithar.getATK()).to.equal(2);
    });

    it('expect darkspine elemental to double the damage of friendly shadow creep on board', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      gameSession.executeAction(gameSession.actionEndTurn());

      const darkspineElemental = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.DarkspineElemental }, 5, 2, gameSession.getPlayer2Id());

      player2.remainingMana = 9;
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.ShadowNova }));
      var playCardFromHandAction = player2.actionPlayCardFromHand(0, 0, 2);
      gameSession.executeAction(playCardFromHandAction);

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(2);

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ShadowNova }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(playCardFromHandAction);

      const darkspineElemental2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.DarkspineElemental }, 4, 1, gameSession.getPlayer1Id());
      const darkspineElemental3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.DarkspineElemental }, 3, 1, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(4);
    });

    it('expect gloomchaser to summon 1/1 wraithling on random nearby space', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.GloomChaser }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      let wraithlingx = 0;
      let wraithlingy = 0;

      for (let xx = 0; xx < 10; xx++) {
        for (let yy = 0; yy < 5; yy++) {
          var wraithling = board.getUnitAtPosition({ x: xx, y: yy });
          if (wraithling != null && wraithling.getId() === SDK.Cards.Faction4.Wraithling) {
            wraithlingx = xx;
            wraithlingy = yy;
            break;
          }
        }
      }

      var wraithling = board.getUnitAtPosition({ x: wraithlingx, y: wraithlingy });

      expect(wraithling.getHP()).to.equal(1);
      expect(wraithling.getATK()).to.equal(1);
    });

    it('expect nightsorrow assassin to destroy nearby minion with 2 or less attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const windblade = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.WindbladeAdept }, 1, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.NightsorrowAssassin }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 1, 1);
      gameSession.executeAction(followupAction);

      expect(windblade.getIsRemoved()).to.equal(true);
    });

    it('expect nightsorrow assassin to not be able to target minions with more than 2 attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const knight = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.IroncliffeGuardian }, 1, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.NightsorrowAssassin }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();

      expect(followupCard).to.equal(null);

      expect(knight.getIsRemoved()).to.equal(false);
    });

    it('expect shadowwatcher to gain +1/+1 on every allied or enemy minion death', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const shadowwatcher = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.ShadowWatcher }, 3, 1, gameSession.getPlayer1Id());
      const youngSilithar = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.YoungSilithar }, 0, 1, gameSession.getPlayer2Id());
      const abyssalCrawler1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalCrawler }, 1, 1, gameSession.getPlayer1Id());
      abyssalCrawler1.refreshExhaustion();

      youngSilithar.setDamage(2);

      const action = abyssalCrawler1.actionAttack(youngSilithar);
      gameSession.executeAction(action);

      expect(shadowwatcher.getATK()).to.equal(4);
      expect(shadowwatcher.getHP()).to.equal(4);
    });

    it('expect abyssal juggernaut to gain and lose +1/+1 for each friendly shadow creep on board', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      gameSession.executeAction(gameSession.actionEndTurn());

      const abyssalJuggernaut = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalJuggernaut }, 5, 2, gameSession.getPlayer2Id());
      expect(abyssalJuggernaut.getHP()).to.equal(3);
      expect(abyssalJuggernaut.getATK()).to.equal(3);

      player2.remainingMana = 9;
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.ShadowNova }));
      var playCardFromHandAction = player2.actionPlayCardFromHand(0, 0, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(abyssalJuggernaut.getHP()).to.equal(7);
      expect(abyssalJuggernaut.getATK()).to.equal(7);

      gameSession.executeAction(gameSession.actionEndTurn());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SunBloom }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(abyssalJuggernaut.getHP()).to.equal(3);
      expect(abyssalJuggernaut.getATK()).to.equal(3);
    });

    it('expect bloodmoon priestess to summon 1/1 wraithling nearby whenever a friendly or enemy minion dies', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const bloodmoonPriestess = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.BloodmoonPriestess }, 6, 1, gameSession.getPlayer1Id());
      const youngSilithar = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.YoungSilithar }, 0, 1, gameSession.getPlayer2Id());
      const abyssalCrawler1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalCrawler }, 1, 1, gameSession.getPlayer1Id());
      abyssalCrawler1.refreshExhaustion();

      youngSilithar.setDamage(2);

      const action = abyssalCrawler1.actionAttack(youngSilithar);
      gameSession.executeAction(action);

      let wraithlingx = 0;
      let wraithlingy = 0;
      let wraithlingCount = 0;

      for (let xx = 0; xx < 10; xx++) {
        for (let yy = 0; yy < 5; yy++) {
          const wraithling = board.getUnitAtPosition({ x: xx, y: yy });
          if (wraithling != null && wraithling.getId() === SDK.Cards.Faction4.Wraithling) {
            wraithlingx = xx;
            wraithlingy = yy;
            wraithlingCount += 1;
          }
        }
      }

      expect(wraithlingCount).to.equal(2);
    });

    it('expect deepfire devourer to destroy all nearby friendly minions and gain +2/+2 for each minion destroyed', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const youngSilithar = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.YoungSilithar }, 0, 1, gameSession.getPlayer2Id());
      const abyssalCrawler1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalCrawler }, 1, 1, gameSession.getPlayer1Id());
      const abyssalCrawler3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalCrawler }, 1, 3, gameSession.getPlayer1Id());
      const abyssalCrawler4 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalCrawler }, 0, 3, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.DeepfireDevourer }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      const deepfireDevourer = board.getUnitAtPosition({ x: 1, y: 2 });

      expect(deepfireDevourer.getHP()).to.equal(10);
      expect(deepfireDevourer.getATK()).to.equal(10);
    });

    it('expect black solus to gain +2 attack when you summon a wraithling', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const blackSolus = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.BlackSolus }, 1, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.WraithlingSwarm }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 0, 4);
      gameSession.executeAction(followupAction);
      const followupCard2 = followupAction.getCard().getCurrentFollowupCard();
      const followupAction2 = player1.actionPlayFollowup(followupCard2, 1, 4);
      gameSession.executeAction(followupAction2);

      const wraithling1 = board.getUnitAtPosition({ x: 0, y: 3 });
      const wraithling2 = board.getUnitAtPosition({ x: 0, y: 4 });
      const wraithling3 = board.getUnitAtPosition({ x: 1, y: 4 });

      expect(wraithling1.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
      expect(wraithling2.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
      expect(wraithling3.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
      expect(blackSolus.getHP()).to.equal(7);
      expect(blackSolus.getATK()).to.equal(10);
    });

    it('expect reaper of the nine moons to be replaced by a random enemy minion in opponents deck when dying', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Faction5.SilitharElder }));

      const unstableLeviathan = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.UnstableLeviathan }, 0, 1, gameSession.getPlayer2Id());
      const reaper = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.ReaperNineMoons }, 1, 1, gameSession.getPlayer1Id());
      reaper.refreshExhaustion();

      const action = reaper.actionAttack(unstableLeviathan);
      gameSession.executeAction(action);

      const silitharElder = board.getUnitAtPosition({ x: 1, y: 1 });
      expect(silitharElder.getId()).to.equal(SDK.Cards.Faction5.SilitharElder);
      expect(silitharElder.getOwnerId()).to.equal(gameSession.getPlayer1Id());
    });

    it('expect repear of the nine moons to do nothing when dying if there are no minions left in enemy deck', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const unstableLeviathan = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.UnstableLeviathan }, 0, 1, gameSession.getPlayer2Id());
      const reaper = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.ReaperNineMoons }, 1, 1, gameSession.getPlayer1Id());
      reaper.refreshExhaustion();

      const action = reaper.actionAttack(unstableLeviathan);
      gameSession.executeAction(action);

      const silitharElder = board.getUnitAtPosition({ x: 1, y: 1 });
      expect(silitharElder).to.equal(undefined);
    });

    it('expect shadow dancer to deal 1 damage to enemy general and heal allied general 1 every time an enemy or friendly minion dies', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const shadowDancer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.SharianShadowdancer }, 3, 1, gameSession.getPlayer1Id());
      const youngSilithar = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.YoungSilithar }, 0, 1, gameSession.getPlayer2Id());
      const abyssalCrawler1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalCrawler }, 1, 1, gameSession.getPlayer1Id());
      abyssalCrawler1.refreshExhaustion();

      youngSilithar.setDamage(2);
      gameSession.getGeneralForPlayer1().setDamage(5);

      const action = abyssalCrawler1.actionAttack(youngSilithar);
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(22);
      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(23);
    });

    it('expect vorpal reaver to summon six 1/1 wraithlings in random spaces when killed', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const unstableLeviathan = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.UnstableLeviathan }, 0, 1, gameSession.getPlayer2Id());
      const reaver = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.VorpalReaver }, 1, 1, gameSession.getPlayer1Id());
      reaver.refreshExhaustion();

      const action = reaver.actionAttack(unstableLeviathan);
      gameSession.executeAction(action);

      let wraithlingx = 0;
      let wraithlingy = 0;
      let wraithlingCount = 0;

      for (let xx = 0; xx < 10; xx++) {
        for (let yy = 0; yy < 5; yy++) {
          const wraithling = board.getUnitAtPosition({ x: xx, y: yy });
          if (wraithling != null && wraithling.getId() === SDK.Cards.Faction4.Wraithling) {
            wraithlingx = xx;
            wraithlingy = yy;
            wraithlingCount += 1;
          }
        }
      }

      expect(wraithlingCount).to.equal(6);
    });

    it('expect spectral revenant to deal 4 damage to enemy general when attacking an enemy minion', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const unstableLeviathan = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.UnstableLeviathan }, 0, 1, gameSession.getPlayer2Id());
      const revenant = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.SpectralRevenant }, 1, 1, gameSession.getPlayer1Id());
      revenant.refreshExhaustion();

      const action = revenant.actionAttack(unstableLeviathan);
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(21);
    });
  });
});
