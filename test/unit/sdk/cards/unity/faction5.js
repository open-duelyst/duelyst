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

    it('expect ragebinder to heal 3 health to your general only if you have another golem', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;
      gameSession.getGeneralForPlayer1().setDamage(3);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction5.Ragebinder }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction1);
      const hand1 = player1.getDeck().getCardsInHand();
      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(22);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction5.Ragebinder }));
      const playCardFromHandAction2 = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction2);
      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(25);
    });

    it('expect cascading rebirth to destroy a minion and summon a Magmar minion that costs 1 more', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const youngSilithar = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.YoungSilithar }, 2, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.MoltenRebirth }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 2, 3);
      gameSession.executeAction(followupAction);
      const cascadeCheck = board.getUnitAtPosition({ x: 2, y: 3 });

      expect(youngSilithar.getIsRemoved()).to.equal(true);
      expect(cascadeCheck.getFactionId()).to.equal(SDK.Factions.Faction5);
      expect(cascadeCheck.getManaCost()).to.equal(3);
    });

    it('expect cascading rebirth get nothing if no magmar minion is of an appropriate cost', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const bloodTaura = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BloodTaura }, 2, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.MoltenRebirth }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 2, 3);
      gameSession.executeAction(followupAction);
      const cascadeCheck = board.getUnitAtPosition({ x: 2, y: 3 });
      expect(cascadeCheck).to.not.exist;
    });

    it('expect godhammer to give minions grow, keep grow buff when broken', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const brightmossGolem1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 1, 1, gameSession.getPlayer1Id());
      const brightmossGolem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.GrowthBangle }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      expect(brightmossGolem1.getHP()).to.equal(10);
      expect(brightmossGolem2.getHP()).to.equal(10);
      expect(brightmossGolem1.getATK()).to.equal(5);
      expect(brightmossGolem2.getATK()).to.equal(5);

      player1.remainingMana = 9;
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));
      expect(brightmossGolem1.getHP()).to.equal(4);
      expect(brightmossGolem2.getHP()).to.equal(4);
      expect(brightmossGolem1.getATK()).to.equal(5);
      expect(brightmossGolem2.getATK()).to.equal(5);
    });

    /* Test disabled: failing
    it('expect lavaslasher to hit a nearby enemy and get hit back when summoned', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      var tethermancer = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Tethermancer}, 0, 4, gameSession.getPlayer2Id());
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction5.Lavaslasher}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
      gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = player1.actionPlayFollowup(followupCard, 0, 4);
      gameSession.executeAction(followupAction);

      var lavaslasher = board.getUnitAtPosition({x: 0, y: 3});

      expect(tethermancer.getHP()).to.equal(2);
      expect(lavaslasher.getHP()).to.equal(8);
      expect(lavaslasher.getIsSilenced()).to.equal(true);
    });
    */

    it('expect juggernaut to summon golem eggs nearby when damaged', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const juggernaut = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.Juggernaut }, 2, 2, gameSession.getPlayer1Id());
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));

      var eggCheck = board.getFriendlyEntitiesAroundEntity(juggernaut);
      expect(eggCheck[0].getId()).to.equal(SDK.Cards.Faction5.Egg);
      expect(eggCheck[1].getId()).to.equal(SDK.Cards.Faction5.Egg);
      expect(eggCheck[2]).to.not.exist;

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      var eggCheck = board.getFriendlyEntitiesAroundEntity(juggernaut);
      // raceId 1 = golem
      expect(eggCheck[0].getRaceId()).to.equal(1);
      expect(eggCheck[1].getRaceId()).to.equal(1);
    });
  });
});
