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
const ModifierCelerity = require('app/sdk/modifiers/modifierTranscendance');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('prophecy', () => {
  describe('faction3', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect fate watcher to gain 5 abilities as your opponent draws 5 cards', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const fateWatcher = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.FateWatcher }, 1, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.InnerFocus }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.InnerFocus }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.InnerFocus }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.InnerFocus }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.InnerFocus }));

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

      expect(fateWatcher.hasModifierClass(SDK.ModifierBlastAttack)).to.equal(true);
      expect(fateWatcher.hasModifierClass(SDK.ModifierProvoke)).to.equal(true);
      expect(fateWatcher.hasModifierClass(SDK.ModifierFrenzy)).to.equal(true);
      expect(fateWatcher.hasModifierClass(ModifierCelerity)).to.equal(true);
      expect(fateWatcher.hasModifierClass(SDK.ModifierFlying)).to.equal(true);
    });

    it('expect duskweaver to give a random wish on death', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction3.Duskweaver }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      const hand = player1.getDeck().getCardsInHand();
      const cardDraw = hand[0];
      let cardCount = 0;

      if (cardDraw.getId() == SDK.Cards.Spell.ScionsFirstWish) {
        cardCount += 1;
      }
      if (cardDraw.getId() == SDK.Cards.Spell.ScionsSecondWish) {
        cardCount += 1;
      }
      if (cardDraw.getId() == SDK.Cards.Spell.ScionsThirdWish) {
        cardCount += 1;
      }
      expect(cardCount).to.equal(1);
    });

    it('expect arid unmaking to destroy a friendly minion and make a tile', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AridUnmaking }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      expect(silverguardSquire.getIsRemoved()).to.equal(true);

      const exhumingSand = board.getTileAtPosition({ x: 1, y: 1 }, true);
      expect(exhumingSand.getOwnerId()).to.equal(player1.getPlayerId());
      expect(exhumingSand.getId()).to.equal(SDK.Cards.Tile.SandPortal);
    });

    it('expect exhuming sand to make a dervish when a minion is summoned from action bar', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AridUnmaking }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 1));

      const dervishFriend = board.getUnitAtPosition({ x: 1, y: 1 });
      expect(dervishFriend.getId()).to.equal(SDK.Cards.Faction3.IronDervish);
      expect(dervishFriend.getOwnerId()).to.equal(gameSession.getPlayer1Id());
    });

    it('expect reassemble to put an obelysk back into your action bar at cost 0', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const obelysk = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.TrygonObelysk }, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Reassemble }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 2));

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getId()).to.equal(SDK.Cards.Faction3.TrygonObelysk);
      expect(hand[0].getManaCost()).to.equal(0);
    });

    it('expect sandswirl reader bounces friendly minions and creates Exhuming Sand', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer1Id());
      const evilSilverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction3.SandswirlReader }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
      gameSession.executeAction(playCardFromHandAction);
      expect(playCardFromHandAction.getIsValid()).to.equal(true);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 1, 1);
      gameSession.executeAction(followupAction);

      const exhumingSand1 = board.getTileAtPosition({ x: 1, y: 1 }, true);
      expect(exhumingSand1.getOwnerId()).to.equal(player1.getPlayerId());
      expect(exhumingSand1.getId()).to.equal(SDK.Cards.Tile.SandPortal);

      const hand1 = player1.getDeck().getCardsInHand();
      expect(hand1[0].getId()).to.equal(SDK.Cards.Faction1.SilverguardSquire);
    });

    it('expect sandswirl reader bounces enemy minions and creates Exhuming Sand', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer2Id());
      const evilSilverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction3.SandswirlReader }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
      gameSession.executeAction(playCardFromHandAction);
      expect(playCardFromHandAction.getIsValid()).to.equal(true);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 1, 1);
      gameSession.executeAction(followupAction);

      const exhumingSand1 = board.getTileAtPosition({ x: 1, y: 1 }, true);
      expect(exhumingSand1.getOwnerId()).to.equal(player1.getPlayerId());
      expect(exhumingSand1.getId()).to.equal(SDK.Cards.Tile.SandPortal);

      const hand1 = player2.getDeck().getCardsInHand();
      expect(hand1[0].getId()).to.equal(SDK.Cards.Faction1.SilverguardSquire);
    });

    it('expect lavastorm obelysk to damage enemy minions in its row', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const obelysk = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.LavastormObelysk }, 1, 2, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 7, 2, gameSession.getPlayer2Id());

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      expect(brightmossGolem.getHP()).to.equal(3);
      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(25);
    });

    it('expect droplift to unequip an artifact from the enemy and equip it to your General', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.SunstoneBracers }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 2));

      gameSession.executeAction(gameSession.actionEndTurn());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.DropLift }));
      UtilsSDK.executeActionWithoutValidation(player2.actionPlayCardFromHand(0, 1, 2));

      expect(gameSession.getGeneralForPlayer2().getATK()).to.equal(3);
      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(2);
    });

    it('expect superior mirage to make copies that vanish when attacked', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const evilSilverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 4, 1, gameSession.getPlayer2Id());
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SuperiorMirage }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 4, 1));

      const clone = board.getEntitiesAroundEntity(evilSilverguardSquire);

      expect(clone[0].getHP()).to.equal(4);
      expect(clone[0].getATK()).to.equal(1);
      expect(clone[1].getHP()).to.equal(4);
      expect(clone[1].getATK()).to.equal(1);
      expect(clone[2].getHP()).to.equal(4);
      expect(clone[2].getATK()).to.equal(1);

      gameSession.executeAction(gameSession.actionEndTurn());

      var action = evilSilverguardSquire.actionAttack(clone[0]);
      gameSession.executeAction(action);

      expect(clone[0].getIsRemoved()).to.equal(true);
      expect(evilSilverguardSquire.getDamage()).to.equal(0);

      gameSession.executeAction(gameSession.actionEndTurn());

      var action = clone[1].actionAttack(evilSilverguardSquire);
      gameSession.executeAction(action);

      expect(clone[1].getIsRemoved()).to.equal(false);
      expect(evilSilverguardSquire.getDamage()).to.equal(1);
      expect(clone[1].getDamage()).to.equal(1);
    });

    it('expect wasteland wraith to destroy itself and enemies at the start of your turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 7, 2, gameSession.getPlayer2Id());
      const wastelandWraith = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.WastelandWraith }, 1, 2, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      expect(silverguardSquire.getIsRemoved()).to.equal(false);
      expect(brightmossGolem.getIsRemoved()).to.equal(true);
      expect(wastelandWraith.getIsRemoved()).to.equal(true);
    });

    it('expect azure summoning to draw only flying minions when only a flying minion is played', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AzureSummoning }));
      const action = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(action);
      expect(action.getIsValid()).to.equal(true);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.SpottedDragonlark }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.SpottedDragonlark }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.SpottedDragonlark }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.HailstoneGolem }));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.SpottedDragonlark }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.SpottedDragonlark }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.SpottedDragonlark }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.HailstoneGolem }));

      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(1, 2, 1));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(2, 3, 1));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(3, 4, 1));

      const hand1 = player1.getDeck().getCardsInHand();
      expect(hand1[0].getId()).to.equal(SDK.Cards.Neutral.SpottedDragonlark);
      expect(hand1[1].getId()).to.equal(SDK.Cards.Neutral.SpottedDragonlark);
      expect(hand1[2].getId()).to.equal(SDK.Cards.Neutral.SpottedDragonlark);
      expect(hand1[3]).to.not.exist;
    });

    it('expect oblivion sickle to create Exhuming Sand when you destroy a minion with an attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.OblivionSickle }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 1, 2, gameSession.getPlayer2Id());

      const action = gameSession.getGeneralForPlayer1().actionAttack(valeHunter);
      gameSession.executeAction(action);

      const exhumingSand1 = board.getTileAtPosition({ x: 1, y: 2 }, true);
      expect(exhumingSand1.getOwnerId()).to.equal(player1.getPlayerId());
      expect(exhumingSand1.getId()).to.equal(SDK.Cards.Tile.SandPortal);
    });

    it('expect cataclysmic fault to turn the center column into Exhuming Sand', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.CataclysmicFault }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 2));

      const exhumingSand1 = board.getTileAtPosition({ x: 4, y: 0 }, true);
      expect(exhumingSand1.getOwnerId()).to.equal(player1.getPlayerId());
      expect(exhumingSand1.getId()).to.equal(SDK.Cards.Tile.SandPortal);
      const exhumingSand2 = board.getTileAtPosition({ x: 4, y: 1 }, true);
      expect(exhumingSand2.getOwnerId()).to.equal(player1.getPlayerId());
      expect(exhumingSand2.getId()).to.equal(SDK.Cards.Tile.SandPortal);
      const exhumingSand3 = board.getTileAtPosition({ x: 4, y: 2 }, true);
      expect(exhumingSand3.getOwnerId()).to.equal(player1.getPlayerId());
      expect(exhumingSand3.getId()).to.equal(SDK.Cards.Tile.SandPortal);
      const exhumingSand4 = board.getTileAtPosition({ x: 4, y: 3 }, true);
      expect(exhumingSand4.getOwnerId()).to.equal(player1.getPlayerId());
      expect(exhumingSand4.getId()).to.equal(SDK.Cards.Tile.SandPortal);
      const exhumingSand5 = board.getTileAtPosition({ x: 4, y: 4 }, true);
      expect(exhumingSand5.getOwnerId()).to.equal(player1.getPlayerId());
      expect(exhumingSand5.getId()).to.equal(SDK.Cards.Tile.SandPortal);
    });

    it('expect trygon obelyk to summon dervish summon dervish summon dervish', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const obelysk = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.TrygonObelysk }, 1, 2, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      const windDervish = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction3.Dervish);
      expect(windDervish.length).to.equal(3);
    });
  });
});
