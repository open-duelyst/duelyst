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

describe('faction6', () => {
  describe('minions', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction6.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction2.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect infiltrated effects to activate when on enemys side of board (crystal cloaker)', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const crystalCloaker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.CrystalCloaker }, 6, 1, gameSession.getPlayer1Id());

      expect(crystalCloaker.getATK()).to.equal(4);
    });

    it('expect infiltrated effects to not activate when on center or own side of board (crystal cloaker)', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const crystalCloaker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.CrystalCloaker }, 0, 1, gameSession.getPlayer1Id());

      expect(crystalCloaker.getATK()).to.equal(2);
    });

    it('expect snow chaser to return to hand when dying on opponents side of board', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const snowChaser = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.WyrBeast }, 7, 2, gameSession.getPlayer1Id());
      snowChaser.refreshExhaustion();
      const action = snowChaser.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getId()).to.equal(SDK.Cards.Faction6.WyrBeast);
    });

    it('expect borean bear to gain +1 attack when you summon vespyr minions', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const boreanBear = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.BoreanBear }, 7, 2, gameSession.getPlayer1Id());
      expect(boreanBear.getATK()).to.equal(1);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction6.WyrBeast }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      expect(boreanBear.getATK()).to.equal(2);
    });

    it('expect crystal wisp to give permanent +1 mana crystal on death', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const crystalWisp = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.CrystalWisp }, 7, 2, gameSession.getPlayer1Id());
      crystalWisp.refreshExhaustion();
      const action = crystalWisp.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      expect(player1.getRemainingMana()).to.equal(4);
    });

    it('expect crystal wisp to not give +1 mana crystal on death if already at 9 mana', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      const crystalWisp = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.CrystalWisp }, 7, 2, gameSession.getPlayer1Id());
      crystalWisp.refreshExhaustion();
      const action = crystalWisp.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      expect(player1.getRemainingMana()).to.equal(9);
    });

    it('expect hearth sister to switch places with any minion when summoned', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      var crystalWisp = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.CrystalWisp }, 7, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction6.HearthSister }));

      player1.remainingMana = 9;

      const action = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(action);
      const followupCard = action.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 7, 2);
      gameSession.executeAction(followupAction);

      var crystalWisp = board.getUnitAtPosition({ x: 1, y: 1 });
      const hearthseeker = board.getUnitAtPosition({ x: 7, y: 2 });
      expect(crystalWisp.getId()).to.equal(SDK.Cards.Faction6.CrystalWisp);
      expect(hearthseeker.getId()).to.equal(SDK.Cards.Faction6.HearthSister);
    });

    it('expect fenrir warmaster to leave behind 3/2 ghost wolf on death', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const fenrir = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.FenrirWarmaster }, 7, 2, gameSession.getPlayer1Id());
      fenrir.refreshExhaustion();
      fenrir.setDamage(1);
      const action = fenrir.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      const wolf = board.getUnitAtPosition({ x: 7, y: 2 });
      expect(wolf.getId()).to.equal(SDK.Cards.Faction6.GhostWolf);
      expect(wolf.getHP()).to.equal(2);
      expect(wolf.getATK()).to.equal(3);
    });

    it('expect glacial elemental to deal 2 damage to a random enemy minion when vespyr summoned', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const snowElemental = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.SnowElemental }, 7, 2, gameSession.getPlayer1Id());
      const arcticDisplacer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.ArcticDisplacer }, 5, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction6.WyrBeast }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(arcticDisplacer.getDamage()).to.equal(2);
    });

    it('expect razorback to give all friendly minions +2 attack this turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const snowchaser = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.WyrBeast }, 7, 2, gameSession.getPlayer1Id());
      const wall = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.BlazingSpines }, 5, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction6.Razorback }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(snowchaser.getATK()).to.equal(4);
      expect(wall.getATK()).to.equal(5);

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(snowchaser.getATK()).to.equal(2);
      expect(wall.getATK()).to.equal(3);
    });

    it('expect voice of the wind to summon 2/2 vespyr winter in random nearby space when a minion played from action bar', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const voiceoftheWind = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.VoiceoftheWind }, 7, 2, gameSession.getPlayer1Id());
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction6.WyrBeast }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const unitArray = board.getUnits();
      expect(unitArray[4].getId()).to.equal(SDK.Cards.Faction6.WaterBear);
    });

    it('expect voice of the wind to not summon 2/2 vespyr when using bonechill barrier', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const voiceoftheWind = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.VoiceoftheWind }, 7, 2, gameSession.getPlayer1Id());
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.BonechillBarrier }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 0, 4);
      gameSession.executeAction(followupAction);
      const followupCard2 = followupAction.getCard().getCurrentFollowupCard();
      const followupAction2 = player1.actionPlayFollowup(followupCard2, 1, 4);
      gameSession.executeAction(followupAction2);

      let wraithlingx = 0;
      let wraithlingy = 0;

      for (let xx = 0; xx < 10; xx++) {
        for (let yy = 0; yy < 5; yy++) {
          var wraithling = board.getUnitAtPosition({ x: xx, y: yy });
          if (wraithling != null && wraithling.getId() === SDK.Cards.Faction6.WaterBear) {
            wraithlingx = xx;
            wraithlingy = yy;
            break;
          }
        }
      }

      var wraithling = board.getUnitAtPosition({ x: wraithlingx, y: wraithlingy });

      expect(wraithling).to.equal(undefined);
    });

    it('expect draugar lord to leave behind 4/8 drake on death', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const draugar = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.PrismaticGiant }, 7, 2, gameSession.getPlayer1Id());
      draugar.refreshExhaustion();
      draugar.setDamage(7);
      const action = draugar.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      const wolf = board.getUnitAtPosition({ x: 7, y: 2 });
      expect(wolf.getId()).to.equal(SDK.Cards.Faction6.IceDrake);
      expect(wolf.getHP()).to.equal(8);
      expect(wolf.getATK()).to.equal(4);
    });

    it('expect ancient grove to give friendly minions dying wish: summon 1/1 treant with provoke', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;
      const arctic = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.ArcticDisplacer }, 7, 2, gameSession.getPlayer1Id());
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction6.AncientGrove }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      arctic.refreshExhaustion();
      arctic.setDamage(3);
      const action = arctic.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      const treant = board.getUnitAtPosition({ x: 7, y: 2 });
      expect(treant.getId()).to.equal(SDK.Cards.Faction6.Treant);
    });
  });
});
