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

describe('bloodstorm', () => {
  describe('faction3', () => {
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

    it('expect zephyr to give your general frenzy until end of turn whenever you activate your bbs', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      // cycle turns until you can use bloodborn spell
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      const whiplash = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Zephyr }, 4, 3, gameSession.getPlayer1Id());

      const action = player1.actionPlaySignatureCard(0, 1);
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer1().hasModifierClass(SDK.ModifierFrenzy)).to.equal(true);
    });

    it('expect divine spark to draw 2 cards', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrinityOath }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrinityOath }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrinityOath }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrinityOath }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrinityOath }));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.DivineSpark }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 3, 1));

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[1].getId()).to.equal(SDK.Cards.Spell.TrinityOath);
      expect(hand[0].getId()).to.equal(SDK.Cards.Spell.TrinityOath);
      expect(hand[2]).to.not.exist;
    });

    it('expect incinera to allow your general to move 2 additional spaces', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const incinera = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Incinera }, 0, 1, gameSession.getPlayer1Id());

      expect(gameSession.getGeneralForPlayer1().getSpeed()).to.equal(4);
    });

    it('expect stone to spears to give a friendly obelysk +3 attack and movement', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const obelysk = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.BrazierRedSand }, 6, 3, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.StoneToSpears }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 6, 3));

      expect(obelysk.getSpeed()).to.equal(2);
      expect(obelysk.getATK()).to.equal(3);

      obelysk.refreshExhaustion();
      var action = obelysk.actionMove({ x: 8, y: 3 });
      gameSession.executeAction(action);

      expect(obelysk.getPosition().x).to.equal(8);
      expect(obelysk.getPosition().y).to.equal(3);

      var action = obelysk.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(3);

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(obelysk.getSpeed()).to.equal(0);
      expect(obelysk.getATK()).to.equal(0);
    });

    it('expect autarchs gifts to equip 2 random vetruvian artifacts', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.EquipVetArtifacts }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 6, 3));

      expect(gameSession.getGeneralForPlayer1().getArtifactModifiersGroupedByArtifactCard().length).to.equal(2);
    });

    it('expect grandmaster nosh-rak to make the enemy general take double damage from all sources', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const obelysk = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.BrazierRedSand }, 6, 3, gameSession.getPlayer1Id());
      const noshrak = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.GrandmasterNoshRak }, 8, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.StoneToSpears }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 6, 3));

      noshrak.refreshExhaustion();
      var action = noshrak.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      // testing for doubled damage from nosh-rak
      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(8);

      obelysk.refreshExhaustion();
      var action = obelysk.actionMove({ x: 8, y: 3 });
      gameSession.executeAction(action);

      var action = obelysk.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      // testing for doubled damage from other minions
      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(14);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 8, 2));

      // testing for doubled spell damage
      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(20);
    });
  });
});
