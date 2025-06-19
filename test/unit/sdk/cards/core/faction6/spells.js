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
  describe('spells', () => {
    beforeEach(() => {
      // define test decks.  Spells do not work.  Only add minions and generals this way
      const player1Deck = [
        { id: SDK.Cards.Faction6.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction3.General },
      ];

      // setup test session
      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

      /* // USE THIS TO GET THE CURRENT CARDS IN YOUR HAND
      var deck = player1.getDeck();
      Logger.module("UNITTEST").log(deck.getCardsInHand(1));
      */
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect flash freeze to deal 1 damage and add stunned modifier on minion', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 5, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.FlashFreeze }));
      const action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      expect(kaidoAssassin.getDamage()).to.equal(1);
      expect(kaidoAssassin.hasActiveModifierClass(SDK.ModifierStunned)).to.equal(true);
    });

    it('expect polarity to swap minion attack and health', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 5, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.RitualOfTheWind }));
      const action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      expect(kaidoAssassin.getHP()).to.equal(2);
      expect(kaidoAssassin.getATK()).to.equal(3);
    });

    it('expect polarity to swap minion attack and health when minion is damaged', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 5, 1, gameSession.getPlayer2Id());
      kaidoAssassin.setDamage(1);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.RitualOfTheWind }));
      const action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      expect(kaidoAssassin.getHP()).to.equal(2);
      expect(kaidoAssassin.getATK()).to.equal(2);
    });

    it('expect a minion to have original HP if polarity cast on them, then damaged, then polarity cast again', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 5, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.RitualOfTheWind }));
      var action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      kaidoAssassin.setDamage(2);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.RitualOfTheWind }));
      var action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      expect(kaidoAssassin.getHP()).to.equal(3);
    });

    it('expect aspect of the fox to turn any minion into vanilla 3/3', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 5, 1, gameSession.getPlayer2Id());
      kaidoAssassin.setDamage(1);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AspectOfTheWolf }));
      const action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      const fox = board.getUnitAtPosition({ x: 5, y: 1 });
      expect(fox.getId()).to.equal(SDK.Cards.Faction6.WolfAspect);
      expect(fox.getHP()).to.equal(3);
      expect(fox.getATK()).to.equal(3);
    });

    it('expect mesmerize to push an enemy general or minion one space', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      player1.remainingMana = 9;

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 5, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Numb }));
      var action = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(action);
      var followupCard = action.getCard().getCurrentFollowupCard();
      var followupAction = player1.actionPlayFollowup(followupCard, 7, 2);
      gameSession.executeAction(followupAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Numb }));
      var action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);
      var followupCard = action.getCard().getCurrentFollowupCard();
      var followupAction = player1.actionPlayFollowup(followupCard, 5, 2);
      gameSession.executeAction(followupAction);

      expect(board.getUnitAtPosition({ x: 5, y: 2 }).getId()).to.equal(SDK.Cards.Faction2.KaidoAssassin);
      expect(board.getUnitAtPosition({ x: 7, y: 2 }).getId()).to.equal(SDK.Cards.Faction3.General);
    });

    it('expect bonechill barrier to summon 3 0/2 vespyr walls', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.BonechillBarrier }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 0, 4);
      gameSession.executeAction(followupAction);
      const followupCard2 = followupAction.getCard().getCurrentFollowupCard();
      const followupAction2 = player1.actionPlayFollowup(followupCard2, 1, 4);
      gameSession.executeAction(followupAction2);

      const bcb1 = board.getUnitAtPosition({ x: 0, y: 3 });
      const bcb2 = board.getUnitAtPosition({ x: 0, y: 4 });
      const bcb3 = board.getUnitAtPosition({ x: 1, y: 4 });

      expect(bcb1.getId()).to.equal(SDK.Cards.Faction6.BonechillBarrier);
      expect(bcb2.getId()).to.equal(SDK.Cards.Faction6.BonechillBarrier);
      expect(bcb3.getId()).to.equal(SDK.Cards.Faction6.BonechillBarrier);
      expect(bcb1.getHP()).to.equal(2);
      expect(bcb1.getATK()).to.equal(0);
    });

    it('expect bonechill barrier walls to stun enemy minions who attack it', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.BonechillBarrier }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 0, 4);
      gameSession.executeAction(followupAction);
      const followupCard2 = followupAction.getCard().getCurrentFollowupCard();
      const followupAction2 = player1.actionPlayFollowup(followupCard2, 1, 4);
      gameSession.executeAction(followupAction2);

      const bcb1 = board.getUnitAtPosition({ x: 0, y: 3 });

      gameSession.executeAction(gameSession.actionEndTurn());

      const abyssalCrawler1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalCrawler }, 1, 3, gameSession.getPlayer2Id());
      abyssalCrawler1.refreshExhaustion();

      const action = abyssalCrawler1.actionAttack(bcb1);
      gameSession.executeAction(action);
      expect(abyssalCrawler1.hasActiveModifierClass(SDK.ModifierStunned)).to.equal(true);
    });

    it('expect boundless courage to give a minion +2 attack permanently', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 5, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ElementalFury }));
      const action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      expect(kaidoAssassin.getATK()).to.equal(4);
    });

    it('expect boundless courage to make a minion immune to damage only until end of turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 7, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ElementalFury }));
      var action = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(action);

      kaidoAssassin.refreshExhaustion();
      var action = kaidoAssassin.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(kaidoAssassin.getHP()).to.equal(3);
      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(21);
    });

    it('expect chromatic cold to deal 1 damage to an enemy minion or general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 7, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
      var action = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(action);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
      var action = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(action);

      expect(kaidoAssassin.getHP()).to.equal(2);
      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(24);
    });

    it('expect chromatic cold to dispel spell immune creatures', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const sandHowler = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.SandHowler }, 7, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
      const action = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(action);

      expect(sandHowler.getIsSilenced()).to.equal(true);
    });

    it('expect chromatic cold to not deal damage to friendly minions or generals', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 7, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
      var action = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(action);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
      var action = player1.actionPlayCardFromHand(0, 0, 2);
      gameSession.executeAction(action);

      expect(kaidoAssassin.getHP()).to.equal(3);
      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(25);
    });

    it('expect chromatic cold to dispel buffs and debuffs on a minion', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 7, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ElementalFury }));
      var action = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(action);
      expect(kaidoAssassin.getATK()).to.equal(4);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
      var action = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(action);

      expect(kaidoAssassin.getATK()).to.equal(2);
    });

    it('expect frostfire to give a friendly non-vespyr +3 attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 7, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PermafrostShield }));
      const action = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(action);
      expect(kaidoAssassin.getATK()).to.equal(5);
      expect(kaidoAssassin.getHP()).to.equal(3);
    });

    it('expect frostfire to give a friendly vespyr +3 attack and +3 health', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const boreanBear = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.BoreanBear }, 7, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PermafrostShield }));
      const action = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(action);
      expect(boreanBear.getATK()).to.equal(4);
      expect(boreanBear.getHP()).to.equal(6);
    });

    it('expect hailstone prison to return a minion to its owners action bar', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const boreanBear = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.BoreanBear }, 7, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.IceCage }));
      const action = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(action);

      const hand = player1.getDeck().getCardsInHand();
      const cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Faction6.BoreanBear);
    });

    it('expect hailstone prison to exhaust a minion when you replay it', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      var boreanBear = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.BoreanBear }, 7, 2, gameSession.getPlayer1Id());
      boreanBear.refreshExhaustion();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.IceCage }));
      var action = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(action);

      const hand = player1.getDeck().getCardsInHand();
      const cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Faction6.BoreanBear);

      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      var boreanBear = board.getUnitAtPosition({ x: 1, y: 2 });
      var action = boreanBear.actionMove({ x: 2, y: 3 });
      gameSession.executeAction(action);

      expect(boreanBear.getPosition().x).to.equal(1);
      expect(boreanBear.getPosition().y).to.equal(2);
    });

    it('expect mark of solitude to ignore damage and buffs and transform a unit into a 5/5', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 7, 2, gameSession.getPlayer1Id());
      kaidoAssassin.setDamage(1);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ElementalFury }));
      var action = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(action);
      expect(kaidoAssassin.getATK()).to.equal(4);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.MarkOfSolitude }));
      var action = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(action);

      expect(kaidoAssassin.getATK()).to.equal(5);
      expect(kaidoAssassin.getHP()).to.equal(5);
    });

    it('expect mark of solitude to make minion unable to attack general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 7, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.MarkOfSolitude }));
      var action = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(action);

      kaidoAssassin.refreshExhaustion();
      var action = kaidoAssassin.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(25);
    });

    it('expect mark of solitude minions to be able to counter attack if a general strikes them', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 7, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.MarkOfSolitude }));
      var action = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(action);

      gameSession.executeAction(gameSession.actionEndTurn());

      var action = gameSession.getGeneralForPlayer2().actionAttack(kaidoAssassin);
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(20);
      expect(kaidoAssassin.getHP()).to.equal(3);
    });

    it('expect mark of solitude stats to not be diselable (only unable to attack general part)', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 7, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.MarkOfSolitude }));
      var action = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(action);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
      var action = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(action);

      expect(kaidoAssassin.getHP()).to.equal(5);
      expect(kaidoAssassin.getATK()).to.equal(5);
    });

    it('expect blazing spines to create two 3/3 walls', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.BlazingSpines }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 0, 4);
      gameSession.executeAction(followupAction);

      const bcb1 = board.getUnitAtPosition({ x: 0, y: 3 });
      const bcb2 = board.getUnitAtPosition({ x: 0, y: 4 });

      expect(bcb1.getId()).to.equal(SDK.Cards.Faction6.BlazingSpines);
      expect(bcb2.getId()).to.equal(SDK.Cards.Faction6.BlazingSpines);
      expect(bcb1.getHP()).to.equal(3);
      expect(bcb1.getATK()).to.equal(3);
    });

    it('expect blazing spine walls to disappear if dispeled', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.BlazingSpines }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 0, 4);
      gameSession.executeAction(followupAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
      const action = player1.actionPlayCardFromHand(0, 0, 3);
      gameSession.executeAction(action);

      const bcb1 = board.getUnitAtPosition({ x: 0, y: 3 });

      expect(bcb1).to.equal(undefined);
    });

    it('expect blazing spine walls to not be able to move', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.BlazingSpines }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 0, 4);
      gameSession.executeAction(followupAction);

      const bcb1 = board.getUnitAtPosition({ x: 0, y: 3 });
      bcb1.refreshExhaustion();

      const action = bcb1.actionMove({ x: 1, y: 4 });
      gameSession.executeAction(action);
      expect(bcb1.getPosition().x).to.equal(0);
      expect(bcb1.getPosition().y).to.equal(3);
    });

    it('expect cryogenesis to deal 4 damage to an enemy minion and draw a vespyr minion from deck', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const hailstoneGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 7, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction6.BoreanBear }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Cryogenesis }));
      const action = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(action);

      expect(hailstoneGolem.getDamage()).to.equal(4);

      const hand = player1.getDeck().getCardsInHand();
      const cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Faction6.BoreanBear);
    });

    it('expect cryogensis to not draw any minion if you have no vespyrs in deck', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const hailstoneGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 7, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.HailstoneGolem }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Cryogenesis }));
      const action = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(action);

      expect(hailstoneGolem.getDamage()).to.equal(4);

      const hand = player1.getDeck().getCardsInHand();
      const cardDraw = hand[0];
      expect(cardDraw).to.equal(undefined);
    });

    it('expect gravity well to summon 4 0/1 walls with provoke', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.GravityWell }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 0, 4);
      gameSession.executeAction(followupAction);
      const followupCard2 = followupAction.getCard().getCurrentFollowupCard();
      const followupAction2 = player1.actionPlayFollowup(followupCard2, 1, 4);
      gameSession.executeAction(followupAction2);
      const followupCard3 = followupAction2.getCard().getCurrentFollowupCard();
      const followupAction3 = player1.actionPlayFollowup(followupCard3, 2, 4);
      gameSession.executeAction(followupAction3);

      const bcb1 = board.getUnitAtPosition({ x: 0, y: 3 });
      const bcb2 = board.getUnitAtPosition({ x: 0, y: 4 });
      const bcb3 = board.getUnitAtPosition({ x: 1, y: 4 });
      const bcb4 = board.getUnitAtPosition({ x: 2, y: 4 });

      expect(bcb1.getId()).to.equal(SDK.Cards.Faction6.GravityWell);
      expect(bcb2.getId()).to.equal(SDK.Cards.Faction6.GravityWell);
      expect(bcb3.getId()).to.equal(SDK.Cards.Faction6.GravityWell);
      expect(bcb4.getId()).to.equal(SDK.Cards.Faction6.GravityWell);
      expect(bcb1.getHP()).to.equal(1);
      expect(bcb1.getATK()).to.equal(0);
      expect(bcb1.hasActiveModifierClass(SDK.ModifierProvoke)).to.equal(true);
    });

    it('expect aspect of the drake to turn an enemy minion into a 4/4 with flying', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const hailstoneGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 7, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AspectOfTheDrake }));
      const action = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(action);

      const drake = board.getUnitAtPosition({ x: 7, y: 2 });

      expect(drake.getId()).to.equal(SDK.Cards.Faction6.AzureDrake);
      expect(drake.getATK()).to.equal(4);
      expect(drake.getHP()).to.equal(4);
    });

    it('expect aspect of the drake to give friendly nearby minions flying', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const hailstoneGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 7, 2, gameSession.getPlayer2Id());
      const hailstoneGolem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 7, 3, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AspectOfTheDrake }));
      const action = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(action);

      expect(hailstoneGolem2.hasActiveModifierClass(SDK.ModifierFlying)).to.equal(true);
    });

    it('expect avalanche to deal 4 damage to all friendly and enemy minions and generals on your side of map and stun them', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const hailstoneGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 1, 2, gameSession.getPlayer2Id());
      const hailstoneGolem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 7, 3, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Avalanche }));
      const action = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(action);

      expect(hailstoneGolem.getDamage()).to.equal(4);
      expect(hailstoneGolem.hasActiveModifierClass(SDK.ModifierStunned)).to.equal(true);
      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(4);
      expect(gameSession.getGeneralForPlayer1().hasActiveModifierClass(SDK.ModifierStunned)).to.equal(true);
      expect(hailstoneGolem2.getDamage()).to.equal(0);
      expect(hailstoneGolem2.hasActiveModifierClass(SDK.ModifierStunned)).to.equal(false);
      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(0);
      expect(gameSession.getGeneralForPlayer2().hasActiveModifierClass(SDK.ModifierStunned)).to.equal(false);
    });

    it('expect spirit of the wild to reactivate exhausted friendly minions only on opponents side of battlefield', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const hailstoneGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 1, 2, gameSession.getPlayer1Id());
      const hailstoneGolem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 7, 3, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SpiritoftheWild }));
      const action = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(action);

      expect(hailstoneGolem.getIsExhausted()).to.equal(true);
      expect(hailstoneGolem2.getIsExhausted()).to.equal(false);
    });

    it('expect aspect of the mountain to transform a minion into a 5/5 and deal 5 damage to all nearby enemy minions', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const hailstoneGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 7, 2, gameSession.getPlayer2Id());
      const hailstoneGolem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 7, 3, gameSession.getPlayer1Id());
      const hailstoneGolem3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 7, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AspectOfTheMountains }));
      const action = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(action);

      expect(hailstoneGolem2.getDamage()).to.equal(0);
      expect(hailstoneGolem3.getDamage()).to.equal(5);

      const elemental = board.getUnitAtPosition({ x: 7, y: 2 });

      expect(elemental.getId()).to.equal(SDK.Cards.Faction6.SeismicElemental);
      expect(elemental.getATK()).to.equal(5);
      expect(elemental.getHP()).to.equal(5);
    });
  }); // end Spells describe
});
