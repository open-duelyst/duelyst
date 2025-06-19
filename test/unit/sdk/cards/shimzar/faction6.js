const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../../'));
require('coffeescript/register');
const expect = require('chai').expect;
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const ModifierTranscendance = require('app/sdk/modifiers/modifierTranscendance');
const UtilsSDK = require('test/utils/utils_sdk');
const _ = require('underscore');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('shimzar', () => {
  describe('faction6', () => {
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

    it('expect snow rippler to draw a battlepet when it damages a general while infiltrated', () => {
      for (let i = 0; i < 50; i++) {
        const player1Deck = [
          { id: SDK.Cards.Faction6.General },
        ];

        const player2Deck = [
          { id: SDK.Cards.Faction6.General },
        ];

        // setup test session
        UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
        const gameSession = SDK.GameSession.getInstance();
        const board = gameSession.getBoard();
        const player1 = gameSession.getPlayer1();

        const rippler = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.SnowRippler }, 7, 2, gameSession.getPlayer1Id());
        rippler.refreshExhaustion();
        const action = rippler.actionAttack(gameSession.getGeneralForPlayer2());
        gameSession.executeAction(action);

        const hand = player1.getDeck().getCardsInHand();
        expect(hand[0]).to.exist;
        expect(hand[0].getRaceId()).to.equal(SDK.Races.BattlePet);
        expect(hand[0].getBaseCardId()).to.not.equal(SDK.Cards.Faction5.Kin);

        SDK.GameSession.reset();
      }
    });

    it('expect icy to stun a nearby enemy minion or general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const rippler = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.SnowRippler }, 2, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction6.Icy }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 2, 2);
      gameSession.executeAction(followupAction);

      expect(rippler.hasActiveModifierClass(SDK.ModifierStunned)).to.equal(true);
    });

    it('expect wailing overdrive to give a friendly minion on opponents side of the battlefield +5/+5', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const rippler = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.SnowRippler }, 7, 2, gameSession.getPlayer1Id());
      const rippler2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.SnowRippler }, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.WailingOverdrive }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.WailingOverdrive }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(rippler.getATK()).to.equal(8);
      expect(rippler.getHP()).to.equal(9);
      expect(rippler2.getATK()).to.equal(3);
      expect(rippler2.getHP()).to.equal(4);
    });

    it('expect altered beast to turn one minion into a random battlepet', () => {
      for (let i = 0; i < 50; i++) {
        const player1Deck = [
          { id: SDK.Cards.Faction6.General },
        ];

        const player2Deck = [
          { id: SDK.Cards.Faction6.General },
        ];

        // setup test session
        UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

        const gameSession = SDK.GameSession.getInstance();
        const board = gameSession.getBoard();
        const player1 = gameSession.getPlayer1();

        player1.remainingMana = 9;

        const rippler2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.SnowRippler }, 1, 2, gameSession.getPlayer1Id());

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AlteredBeast }));
        const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
        gameSession.executeAction(playCardFromHandAction);

        const battlepet = board.getUnitAtPosition({ x: 1, y: 2 });

        expect(battlepet.getRaceId()).to.equal(SDK.Races.BattlePet);
        expect(battlepet.getId()).to.not.equal(SDK.Cards.Neutral.Rawr);

        SDK.GameSession.reset();
      }
    });

    it('expect huldra to give a friendly vespyr minion celerity', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const cloaker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.CrystalCloaker }, 2, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction6.Huldra }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 2, 2);
      gameSession.executeAction(followupAction);

      expect(cloaker.hasActiveModifierClass(ModifierTranscendance)).to.equal(true);
    });

    it('expect bur to transform into a different battle pet when it takes damage', () => {
      for (let i = 0; i < 50; i++) {
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

        const bur = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.Bur }, 2, 2, gameSession.getPlayer2Id());

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.GhostLightning }));
        const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
        gameSession.executeAction(playCardFromHandAction);

        const battlepet = board.getUnitAtPosition({ x: 2, y: 2 });
        expect(battlepet.getRaceId()).to.equal(SDK.Races.BattlePet);
        expect(battlepet.getBaseCardId()).to.not.equal(SDK.Cards.Faction6.Bur);
        expect(battlepet.getBaseCardId()).to.not.equal(SDK.Cards.Faction5.Kin);

        SDK.GameSession.reset();
      }
    });

    it('expect frostburn to deal 3 damage to all enemy minions', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer2Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 8, 1, gameSession.getPlayer2Id());
      const brightmossGolem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 7, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Frostburn }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(silverguardSquire.getDamage()).to.equal(3);
      expect(brightmossGolem.getDamage()).to.equal(3);
      expect(brightmossGolem2.getDamage()).to.equal(0); // to make sure our own don't get targeted
    });

    it('expect iceblade dryad to give a friendly vespyr minion flying and +1/+1', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const cloaker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.CrystalCloaker }, 2, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction6.IceDryad }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 2, 2);
      gameSession.executeAction(followupAction);

      expect(cloaker.hasActiveModifierClass(SDK.ModifierFlying)).to.equal(true);
      expect(cloaker.getATK()).to.equal(3);
      expect(cloaker.getHP()).to.equal(4);
    });

    it('expect vespyric call to draw a non-token vespyr minion', () => {
      for (let i = 0; i < 50; i++) {
        const player1Deck = [
          { id: SDK.Cards.Faction6.General },
        ];

        const player2Deck = [
          { id: SDK.Cards.Faction6.General },
        ];

        // setup test session
        UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

        const gameSession = SDK.GameSession.getInstance();
        const board = gameSession.getBoard();
        const player1 = gameSession.getPlayer1();

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.VespyricCall }));
        const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
        gameSession.executeAction(playCardFromHandAction);

        const hand = player1.getDeck().getCardsInHand();
        expect(hand[0]).to.exist;
        expect(hand[0].getRaceId()).to.equal(SDK.Races.Vespyr);
        expect(hand[0].getRarityId()).to.not.equal(SDK.Rarity.TokenUnit);
      }
    });

    it('expect vespyric call to give the vespyr +1/+1 and cost 1 less', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.VespyricCall }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const hand = player1.getDeck().getCardsInHand();
      const vespyr = hand[0];
      expect(vespyr).to.exist;
      if (vespyr.getId() === SDK.Cards.Faction6.WyrBeast) {
        expect(vespyr.getATK()).to.equal(3);
        expect(vespyr.getHP()).to.equal(2);
        expect(vespyr.getManaCost()).to.equal(0);
      }
      if (vespyr.getId() === SDK.Cards.Faction6.BoreanBear) {
        expect(vespyr.getATK()).to.equal(2);
        expect(vespyr.getHP()).to.equal(4);
        expect(vespyr.getManaCost()).to.equal(1);
      }
      if (vespyr.getId() === SDK.Cards.Faction6.CrystalCloaker) {
        expect(vespyr.getATK()).to.equal(3);
        expect(vespyr.getHP()).to.equal(4);
        expect(vespyr.getManaCost()).to.equal(1);
      }
      if (vespyr.getId() === SDK.Cards.Faction6.SnowElemental) {
        expect(vespyr.getATK()).to.equal(3);
        expect(vespyr.getHP()).to.equal(4);
        expect(vespyr.getManaCost()).to.equal(2);
      }
      if (vespyr.getId() === SDK.Cards.Faction6.ArcticDisplacer) {
        expect(vespyr.getATK()).to.equal(11);
        expect(vespyr.getHP()).to.equal(5);
        expect(vespyr.getManaCost()).to.equal(4);
      }
      if (vespyr.getId() === SDK.Cards.Faction6.PrismaticGiant) {
        expect(vespyr.getATK()).to.equal(5);
        expect(vespyr.getHP()).to.equal(9);
        expect(vespyr.getManaCost()).to.equal(5);
      }
      if (vespyr.getId() === SDK.Cards.Faction6.AncientGrove) {
        expect(vespyr.getATK()).to.equal(8);
        expect(vespyr.getHP()).to.equal(8);
        expect(vespyr.getManaCost()).to.equal(6);
      }
      if (vespyr.getId() === SDK.Cards.Faction6.SnowRippler) {
        expect(vespyr.getATK()).to.equal(4);
        expect(vespyr.getHP()).to.equal(5);
        expect(vespyr.getManaCost()).to.equal(2);
      }
      if (vespyr.getId() === SDK.Cards.Faction6.IceDryad) {
        expect(vespyr.getATK()).to.equal(4);
        expect(vespyr.getHP()).to.equal(4);
        expect(vespyr.getManaCost()).to.equal(2);
      }
    });

    it('expect lightning blitz to give your friendly minions +1/+1 and teleport them to opponents starting side of battlefield', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const cloaker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.CrystalCloaker }, 2, 2, gameSession.getPlayer1Id());
      const cloaker2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.CrystalCloaker }, 7, 2, gameSession.getPlayer1Id());
      const cloaker3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.CrystalCloaker }, 4, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.LightningBlitz }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(cloaker.getPosition().x).to.be.above(4);
      expect(cloaker2.getPosition().x).to.be.above(4);
      expect(cloaker3.getPosition().x).to.be.above(4);
      expect(cloaker.getATK()).to.equal(5);
      expect(cloaker.getHP()).to.equal(4);
      expect(cloaker2.getATK()).to.equal(5);
      expect(cloaker2.getHP()).to.equal(4);
      expect(cloaker3.getATK()).to.equal(5);
      expect(cloaker3.getHP()).to.equal(4);
    });

    it('expect white asp to grant +3 attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.WhiteAsp }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(5);
    });

    it('expect white asp to turn enemies killed by it into blazing spines', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.WhiteAsp }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 1, 2, gameSession.getPlayer2Id());

      const action = gameSession.getGeneralForPlayer1().actionAttack(valeHunter);
      gameSession.executeAction(action);

      const wall = board.getUnitAtPosition({ x: 1, y: 2 });
      expect(wall.getId()).to.equal(SDK.Cards.Faction6.BlazingSpines);
    });

    it('expect winters wake to give friendly walls +4/+4 and allow them to move', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const blazingSpines1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.BlazingSpines }, 1, 2, gameSession.getPlayer1Id());
      const blazingSpines2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.BlazingSpines }, 2, 2, gameSession.getPlayer1Id());
      blazingSpines1.refreshExhaustion();
      blazingSpines2.refreshExhaustion();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.WintersWake }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      expect(blazingSpines1.getATK()).to.equal(7);
      expect(blazingSpines1.getHP()).to.equal(7);
      expect(blazingSpines2.getATK()).to.equal(7);
      expect(blazingSpines2.getHP()).to.equal(7);

      var action = blazingSpines1.actionMove({ x: 3, y: 2 });
      gameSession.executeAction(action);
      var action = blazingSpines2.actionMove({ x: 2, y: 4 });
      gameSession.executeAction(action);

      expect(blazingSpines1.getPosition().x).to.equal(3);
      expect(blazingSpines2.getPosition().y).to.equal(4);
    });

    it('expect frostiva to summon a shadow vespyr nearby whenever it attacks or is attacked', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const frostiva = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.Frostiva }, 7, 2, gameSession.getPlayer1Id());
      frostiva.refreshExhaustion();
      const action = frostiva.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      const shadowvespyr = board.getFriendlyEntitiesAroundEntity(frostiva);

      expect(shadowvespyr[0].getId()).to.equal(SDK.Cards.Faction6.ShadowVespyr);
    });
  });
});
