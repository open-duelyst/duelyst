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

    it('expect phantasm to give a minion in your action bar +1 attack when your opponent summons a minion', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      const phantasm = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Phantasm }, 3, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.GloomChaser }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Faction4.GloomChaser }));

      gameSession.executeAction(gameSession.actionEndTurn());

      const playCardFromHandAction1 = player2.actionPlayCardFromHand(0, 8, 1);
      gameSession.executeAction(playCardFromHandAction1);

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getATK()).to.equal(4);
    });

    it('expect bound tormentor to create a copy of a minion the opponent played in your hand that costs 2 less', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.BoundTormentor }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Faction4.GloomChaser }));

      var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction1);

      gameSession.executeAction(gameSession.actionEndTurn());

      var playCardFromHandAction1 = player2.actionPlayCardFromHand(0, 8, 1);
      gameSession.executeAction(playCardFromHandAction1);

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getId()).to.equal(SDK.Cards.Faction4.GloomChaser);
      expect(hand[0].getManaCost()).to.equal(0);
    });

    it('expect choking tendrils to kill an enemy minion on shadow creep', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ShadowNova }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 0);
      gameSession.executeAction(playCardFromHandAction);

      const phantasm = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Phantasm }, 0, 0, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChokingTendrils }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 0, 0);
      gameSession.executeAction(playCardFromHandAction1);

      expect(phantasm.getIsRemoved()).to.equal(true);
    });

    it('expect inkling surge to summon a wraithling', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InklingSurge }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const wraithling = board.getUnitAtPosition({ x: 1, y: 1 });
      expect(wraithling.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
    });

    it('expect inkling surge to draw you a card if you have a wraithling on board', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      const wraithling = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 0, 0, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InklingSurge }));

      var hand = player1.getDeck().getCardsInHand();
      expect(hand[0]).to.not.exist;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InklingSurge }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      var hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getId()).to.equal(SDK.Cards.Spell.InklingSurge);
    });

    it('expect skullprophet to reduce the enemy generals attack by one when they attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.SkullProphet }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction1);

      gameSession.executeAction(gameSession.actionEndTurn());
      const wraithling = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 8, 1, gameSession.getPlayer1Id());

      const action = gameSession.getGeneralForPlayer2().actionAttack(wraithling);
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getATK()).to.equal(1);
    });

    it('expect xerroloth to put a 4/4 fiend in your action bar when your opponent casts a spell', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.Xerroloth }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.InklingSurge }));

      var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction1);

      gameSession.executeAction(gameSession.actionEndTurn());

      var playCardFromHandAction1 = player2.actionPlayCardFromHand(0, 8, 1);
      gameSession.executeAction(playCardFromHandAction1);

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getId()).to.equal(SDK.Cards.Faction4.Fiend);
    });

    it('expect shadowstalk to summon a wraithling behind each enemy', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      gameSession.executeAction(gameSession.actionEndTurn());

      const action = gameSession.getGeneralForPlayer2().actionMove({ x: 6, y: 2 });
      gameSession.executeAction(action);

      gameSession.executeAction(gameSession.actionEndTurn());

      const enemy1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.GloomChaser }, 6, 3, gameSession.getPlayer2Id());
      const enemy2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.GloomChaser }, 6, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Shadowstalk }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const wraithling1 = board.getUnitAtPosition({ x: 7, y: 1 });
      const wraithling2 = board.getUnitAtPosition({ x: 7, y: 2 });
      const wraithling3 = board.getUnitAtPosition({ x: 7, y: 3 });
      expect(wraithling1.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
      expect(wraithling2.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
      expect(wraithling3.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
    });

    it('expect nethermeld to teleport an enemy to a friendly shadow creep', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ShadowNova }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 0);
      gameSession.executeAction(playCardFromHandAction);

      const phantasm = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Phantasm }, 8, 0, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Nethermeld }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 0);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 0, 0);
      gameSession.executeAction(followupAction);

      expect(board.getUnitAtPosition({ x: 0, y: 0 }).getId()).to.equal(SDK.Cards.Faction4.Phantasm);
    });

    it('expect nekomata to draw you two cards with dying wish when it dies', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      const nekomata = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Nekomata }, 0, 0, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InklingSurge }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.Nekomata }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InklingSurge }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.Nekomata }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InklingSurge }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InklingSurge }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InklingSurge }));

      var hand = player1.getDeck().getCardsInHand();
      expect(hand[0]).to.not.exist;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 0);
      gameSession.executeAction(playCardFromHandAction);

      var hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getId()).to.equal(SDK.Cards.Faction4.Nekomata);
      expect(hand[1].getId()).to.equal(SDK.Cards.Faction4.Nekomata);
      expect(hand[2]).to.not.exist;
    });

    it('expect corporeal cadence to kill a friendly minion and deal its attack to the enemy general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      const rev = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.SpectralRevenant }, 6, 3, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.CorporealCadence }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 6, 3);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(6);
    });

    it('expect mindlathe to take control of an enemy minion until end of turn after its been attacked', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      const vorpal = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.VorpalReaver }, 1, 1, gameSession.getPlayer2Id());
      const pandora = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Pandora }, 2, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.Mindlathe }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 6, 3);
      gameSession.executeAction(playCardFromHandAction);

      var action = gameSession.getGeneralForPlayer1().actionAttack(vorpal);
      gameSession.executeAction(action);
      var action = vorpal.actionAttack(pandora);
      gameSession.executeAction(action);

      expect(pandora.getDamage()).to.equal(6);

      var action = vorpal.actionAttack(pandora);
      gameSession.executeAction(action);

      expect(pandora.getIsRemoved()).to.equal(true);
    });

    it('expect doom to kill the enemy general after 3 of their turns have passed', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Doom }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn()); // 1
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn()); // 2
      gameSession.executeAction(gameSession.actionEndTurn());
      expect(gameSession.getGeneralForPlayer2().getIsRemoved()).to.equal(false);
      gameSession.executeAction(gameSession.actionEndTurn()); // 3
      expect(gameSession.getGeneralForPlayer2().getIsRemoved()).to.equal(true);
    });

    it('expect desolator to steal 2 health when entering play and to return to your hand when dying', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      gameSession.getGeneralForPlayer1().setDamage(5);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.Desolator }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(3);
      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(2);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getId()).to.equal(SDK.Cards.Faction4.Desolator);
      expect(hand[1]).to.not.exist;
    });
  });
});
