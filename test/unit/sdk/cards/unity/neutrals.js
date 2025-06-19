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
  describe('neutrals', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction2.AltGeneral },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect ghoulie to be affected by golem buffs', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const golemVanquisher = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.GolemVanquisher }, 7, 2, gameSession.getPlayer1Id());
      const ghoulie = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Ghoulie }, 4, 2, gameSession.getPlayer1Id());
      const brightmossGolem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 3, 2, gameSession.getPlayer2Id());

      expect(ghoulie.hasModifierClass(SDK.ModifierProvoke)).to.equal(true);
      expect(brightmossGolem2.hasModifierClass(SDK.ModifierProvoke)).to.equal(false);
    });

    it('expect ghoulie to be affected by arcanyst buffs', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const owlbeast = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.OwlbeastSage }, 2, 2, gameSession.getPlayer1Id());
      const manaforger = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Manaforger }, 3, 2, gameSession.getPlayer1Id());
      const ghoulie = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Ghoulie }, 4, 2, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 5, 2, gameSession.getPlayer1Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(owlbeast.getHP()).to.equal(8);
      expect(manaforger.getHP()).to.equal(7);
      expect(ghoulie.getHP()).to.equal(8);
      expect(brightmossGolem.getHP()).to.equal(9);
    });

    it('expect ghoulie to be affected by vespyr buffs', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const ghoulie = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Ghoulie }, 2, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction6.IceDryad }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 2, 2);
      gameSession.executeAction(followupAction);

      expect(ghoulie.hasActiveModifierClass(SDK.ModifierFlying)).to.equal(true);
      expect(ghoulie.getATK()).to.equal(4);
      expect(ghoulie.getHP()).to.equal(5);
    });

    it('expect ghoulie to be affected by dervish buffs', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const ghoulie = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Ghoulie }, 5, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction3.Dunecaster }));
      const action = player1.actionPlayCardFromHand(0, 4, 1);
      gameSession.executeAction(action);

      // play on dervish
      const followupCard = action.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 5, 1);
      gameSession.executeAction(followupAction);
      expect(followupAction.getIsValid()).to.equal(true);

      expect(ghoulie.getATK()).to.equal(5);
      expect(ghoulie.getHP()).to.equal(6);
    });

    it('expect ghoulie to be affected by battle pet buffs', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const ghoulie = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Ghoulie }, 2, 1, gameSession.getPlayer1Id());
      const xho2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Xho }, 5, 1, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 0, 0, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.CrimsonCoil }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 0);
      gameSession.executeAction(playCardFromHandAction);

      expect(brightmossGolem.getDamage()).to.equal(2);

      const action = ghoulie.actionMove({ x: 4, y: 1 });
      gameSession.executeAction(action);
      expect(ghoulie.getPosition().x).to.equal(4);
      expect(ghoulie.getPosition().y).to.equal(1);
      expect(xho2.getPosition().x !== 5 || xho2.getPosition().y !== 1).to.equal(true);
    });

    /* Test disabled: flaky
    it('expect grimes to summon a random minion from a tribe nearby when played', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AerialRift }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 6, 3);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Grimes }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 5, 2);
      gameSession.executeAction(playCardFromHandAction);

      const tribal = board.getFriendlyEntitiesAroundEntity(board.getUnitAtPosition({ x: 5, y: 2 }));

      // neutral race Id = 0.  anything else is a tribal.
      expect(tribal[0].getRaceId()).to.not.equal(0);
    });
    */

    it('expect grimes to summon a random minion from a tribe nearby when dying', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const grimes = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Grimes }, 5, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 5, 2);
      gameSession.executeAction(playCardFromHandAction);

      const tribal = board.getFriendlyEntitiesAroundEntity(grimes);

      // neutral race Id = 0.  anything else is a tribal.
      expect(tribal[0].getRaceId()).to.not.equal(0);
    });

    it('expect loreweaver to not draw an additional copy of a spell not drawn from your deck', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const loreweaver = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Duplicator }, 5, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.Sparrowhawk }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction1);
      const hand1 = player1.getDeck().getCardsInHand();

      expect(hand1[0].getId()).to.equal(SDK.Cards.Spell.MistDragonSeal);
      expect(hand1[1]).to.not.exist;
    });

    it('expect loreweaver to draw an additional copy of a spell drawn from your deck', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const loreweaver = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Duplicator }, 5, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      gameSession.executeAction(gameSession.actionEndTurn());

      const hand1 = player1.getDeck().getCardsInHand();

      expect(hand1[0].getId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      expect(hand1[1].getId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      expect(hand1[2]).to.not.exist;
    });

    it('expect celebrant to create a mana spring nearby', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Celebrant }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 2, 2);
      gameSession.executeAction(followupAction);

      const manatile = board.getTileAtPosition({ x: 2, y: 2 }, true);

      expect(manatile.getId()).to.equal(SDK.Cards.Tile.BonusMana);
    });

    it('expect blue conjurer to put a random arcanyst in your hand whenever you play a spell', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const blueConjurer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BlueConjurer }, 5, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction1);

      const hand1 = player1.getDeck().getCardsInHand();
      expect(hand1[0]).to.exist;
      expect(hand1[0].getRaceId()).to.equal(2); // raceId 2 = arcanyst
    });

    it('expect EMP to dispel everything when played', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Overload }));
      var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction1);

      const shadowDancer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.SharianShadowdancer }, 6, 2, gameSession.getPlayer2Id());
      const shadowWatcher = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.ShadowWatcher }, 5, 2, gameSession.getPlayer1Id());
      const vorpalReaver = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.VorpalReaver }, 4, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.EMP }));
      var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction1);

      expect(shadowDancer.getIsSilenced()).to.equal(true);
      expect(shadowWatcher.getIsSilenced()).to.equal(true);
      expect(vorpalReaver.getIsSilenced()).to.equal(true);
      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(2);
    });

    it('expect EMP to break all artifacts when played', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      gameSession.executeAction(gameSession.actionEndTurn());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Artifact.SunstoneBracers }));
      UtilsSDK.executeActionWithoutValidation(player2.actionPlayCardFromHand(0, 1, 1));

      expect(gameSession.getGeneralForPlayer2().getATK()).to.equal(3);

      gameSession.executeAction(gameSession.actionEndTurn());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.SunstoneBracers }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(3);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.EMP }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction1);

      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(2);
      expect(gameSession.getGeneralForPlayer2().getATK()).to.equal(2);
    });

    it('expect boulder breacher to make enemies unable to counterattack when played with a golem on board', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 7, 2, gameSession.getPlayer1Id());
      const golem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 7, 3, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.BoulderBreacher }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction1);

      golem.refreshExhaustion();
      var action = golem.actionAttack(golem2);
      gameSession.executeAction(action);

      golem.refreshExhaustion();
      var action = golem.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(golem.getDamage()).to.equal(0);
      expect(golem2.getDamage()).to.equal(4);
      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(4);
    });

    it('expect feralu to give any friendly minion with a tribe +1/+1', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const feralu = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Feralu }, 5, 1, gameSession.getPlayer1Id());
      const dervish = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Dunecaster }, 5, 2, gameSession.getPlayer1Id());
      const ghoulie = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Ghoulie }, 5, 3, gameSession.getPlayer1Id());
      const golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BoulderBreacher }, 5, 4, gameSession.getPlayer1Id());
      const arcanyst = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Duplicator }, 5, 0, gameSession.getPlayer1Id());
      const battlepet = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Yun }, 4, 0, gameSession.getPlayer1Id());
      const structure = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Bastion }, 4, 1, gameSession.getPlayer1Id());

      expect(ghoulie.getATK()).to.equal(4);
      expect(ghoulie.getHP()).to.equal(5);
      expect(dervish.getATK()).to.equal(3);
      expect(dervish.getHP()).to.equal(2);
      expect(golem.getATK()).to.equal(6);
      expect(golem.getHP()).to.equal(6);
      expect(arcanyst.getATK()).to.equal(3);
      expect(arcanyst.getHP()).to.equal(6);
      expect(battlepet.getATK()).to.equal(6);
      expect(battlepet.getHP()).to.equal(5);
      expect(structure.getATK()).to.equal(0);
      expect(structure.getHP()).to.equal(6);
    });

    it('expect trinity wing to draw 3 teachings of the dragon when played with an arcanyst on board', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const arcanyst = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BlueConjurer }, 5, 0, gameSession.getPlayer1Id());
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.TrinityWing }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction1);

      const hand1 = player1.getDeck().getCardsInHand();

      spellCounter = 0;

      for (let i = 0; i < 3; i++) {
        if (hand1[i].getId() == SDK.Cards.Spell.DragonGrace || hand1[i].getId() == SDK.Cards.Spell.DragonBreath || hand1[i].getId() == SDK.Cards.Spell.DragonHeart) {
          spellCounter++;
        }
      }

      expect(spellCounter).to.equal(3);
    });

    it('expect lesson of wisdom to restore 3 health to anything', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      gameSession.getGeneralForPlayer1().setDamage(5);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.DragonGrace }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 0, 2);
      gameSession.executeAction(playCardFromHandAction1);

      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(2);
    });

    it('expect lesson of power to deal 2 damage to anything', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.DragonBreath }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 0, 2);
      gameSession.executeAction(playCardFromHandAction1);

      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(2);
    });

    it('expect lesson of courage to give your general +1 attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.DragonHeart }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 0, 2);
      gameSession.executeAction(playCardFromHandAction1);

      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(3);
    });
  });
});
