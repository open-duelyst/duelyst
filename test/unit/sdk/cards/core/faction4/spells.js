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
  describe('spells', () => {
    beforeEach(() => {
      // define test decks.  Spells do not work.  Only add minions and generals this way
      const player1Deck = [
        { id: SDK.Cards.Faction4.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction4.General },
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

    it('expect darkfire sacrifice to kill a friendly minion and reduce next minion summon by 2 mana', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const abyssalCrawler1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalCrawler }, 1, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.DarkSacrifice }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.SpectralRevenant }));
      const hand = player1.getDeck().getCardsInHand();
      const cardDraw = hand[0];
      expect(abyssalCrawler1.getIsRemoved()).to.equal(true);
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Faction4.SpectralRevenant);
      expect(cardDraw.getManaCost()).to.equal(6);
    });

    it('expect darkfire sacrifice mana reduction to continue onto next turn if no minion summoned', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const abyssalCrawler1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalCrawler }, 1, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.DarkSacrifice }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.SpectralRevenant }));

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      const hand = player1.getDeck().getCardsInHand();
      const cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Faction4.SpectralRevenant);
      expect(cardDraw.getManaCost()).to.equal(6);
    });

    it('expect grasp of agony to deal 3 damage to all nearby enemies when unit dies', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const abyssalCrawler1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalCrawler }, 1, 1, gameSession.getPlayer2Id());
      const bloodshardGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BloodshardGolem }, 1, 2, gameSession.getPlayer2Id());
      const bloodshardGolem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BloodshardGolem }, 2, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.CurseOfAgony }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const action = gameSession.getGeneralForPlayer1().actionAttack(abyssalCrawler1);
      gameSession.executeAction(action);

      expect(abyssalCrawler1.getIsRemoved()).to.equal(true);
      expect(bloodshardGolem.getIsRemoved()).to.equal(true);
      expect(bloodshardGolem2.getIsRemoved()).to.equal(true);
    });

    it('expect grasp of agony to work when combined with ritual banishing', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const abyssalCrawler2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalCrawler }, 3, 1, gameSession.getPlayer1Id());
      const abyssalCrawler1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalCrawler }, 1, 1, gameSession.getPlayer2Id());
      const bloodshardGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BloodshardGolem }, 1, 2, gameSession.getPlayer2Id());
      const bloodshardGolem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BloodshardGolem }, 2, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.CurseOfAgony }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.RitualBanishing }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 1, 1);
      gameSession.executeAction(followupAction);

      const action = gameSession.getGeneralForPlayer1().actionAttack(abyssalCrawler1);
      gameSession.executeAction(action);

      expect(abyssalCrawler2.getIsRemoved()).to.equal(true);
      expect(abyssalCrawler1.getIsRemoved()).to.equal(true);
      expect(bloodshardGolem.getIsRemoved()).to.equal(true);
      expect(bloodshardGolem2.getIsRemoved()).to.equal(true);
    });

    it('expect void pulse to deal 2 damage to enemy general and restore 3 health to own general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      gameSession.getGeneralForPlayer1().setDamage(5);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.VoidPulse }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(23);
      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(23);
    });

    it('expect consuming rebirth to destroy a friendly minion and revive it at end of turn on same space with +1/+1', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const abyssalCrawler1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalCrawler }, 1, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ConsumingRebirth }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(abyssalCrawler1.getIsRemoved()).to.equal(true);

      gameSession.executeAction(gameSession.actionEndTurn());

      const abyssalCrawler2 = board.getUnitAtPosition({ x: 1, y: 1 });

      expect(abyssalCrawler2.getHP()).to.equal(2);
      expect(abyssalCrawler2.getATK()).to.equal(3);
    });

    it('expect daemonic lure to deal 1 damage to enemy minion and teleport unit far away', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const abyssalJuggernaut = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalJuggernaut }, 1, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.DaemonicLure }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 7, 4);
      gameSession.executeAction(followupAction);

      expect(abyssalJuggernaut.getDamage()).to.equal(1);
      expect(abyssalJuggernaut.getPosition().x).to.equal(7);
      expect(abyssalJuggernaut.getPosition().y).to.equal(4);
    });

    it('expect soulshatter pact to give friendly minions +2 attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const golem1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 1, 1, gameSession.getPlayer1Id());
      const golem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 2, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SoulshatterPact }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(golem1.getATK()).to.equal(6);
      expect(golem2.getATK()).to.equal(6);
    });

    it('expect deathfire crescendo to give friendly minion +2/+2 any time a friendly or enemy minion dies', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const abyssalCrawler = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalCrawler }, 3, 1, gameSession.getPlayer1Id());
      const youngSilithar = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.YoungSilithar }, 0, 1, gameSession.getPlayer2Id());
      const abyssalCrawler1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalCrawler }, 1, 1, gameSession.getPlayer1Id());
      abyssalCrawler1.refreshExhaustion();

      youngSilithar.setDamage(2);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.DeathfireCrescendo }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 1);
      gameSession.executeAction(playCardFromHandAction);

      const action = abyssalCrawler1.actionAttack(youngSilithar);
      gameSession.executeAction(action);

      expect(abyssalCrawler.getATK()).to.equal(6);
      expect(abyssalCrawler.getHP()).to.equal(5);
    });

    it('expect rite of the undervault to refill your hand', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InnerFocus }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InnerFocus }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InnerFocus }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InnerFocus }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InnerFocus }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InnerFocus }));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.RiteOfTheUndervault }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 1);
      gameSession.executeAction(playCardFromHandAction);

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[5].getBaseCardId()).to.equal(SDK.Cards.Spell.InnerFocus);
    });

    it('expect ritual banishing to destroy one of your minions and destroy an enemy minion', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const abyssalCrawler1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalCrawler }, 1, 1, gameSession.getPlayer1Id());
      const unstableLeviathan = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.UnstableLeviathan }, 5, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.RitualBanishing }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 5, 1);
      gameSession.executeAction(followupAction);

      expect(abyssalCrawler1.getIsRemoved()).to.equal(true);
      expect(unstableLeviathan.getIsRemoved()).to.equal(true);
    });

    it('expect shadow reflection to give a unit +5 attack buff', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const abyssalCrawler1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalCrawler }, 1, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ShadowReflection }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(abyssalCrawler1.getATK()).to.equal(7);
    });

    it('expect wraithling fury to give a wraithling +4/+4', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const wraithling = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 1, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AbyssianStrength }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(wraithling.getATK()).to.equal(5);
      expect(wraithling.getHP()).to.equal(5);
    });

    it('expect wraithling fury can only be cast on wraithlings', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const wraithling = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 1, 1, gameSession.getPlayer1Id());
      const abyssalCrawler1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalCrawler }, 2, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AbyssianStrength }));

      const hand = player1.getDeck().getCardsInHand();
      const wraithlingFury = hand[0];
      const validTargetPositions = wraithlingFury.getValidTargetPositions();

      expect(validTargetPositions[0]).to.exist;
      expect(validTargetPositions[0].x === 1 && validTargetPositions[0].y === 1).to.equal(true);
      expect(validTargetPositions[1]).to.not.exist;
    });

    it('expect wraithling swarm to summon 3 1/1 wraithlings', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

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
    });

    it('expect wraithling swarm can be skipped midway through follow up to only summon 1 wraithling', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.WraithlingSwarm }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
      gameSession.executeAction(playCardFromHandAction);
      const endFollowup = player1.actionEndFollowup();
      gameSession.executeAction(endFollowup);

      const wraithling1 = board.getUnitAtPosition({ x: 0, y: 3 });

      expect(wraithling1.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
      expect(gameSession.getIsFollowupActive()).to.equal(false);
    });

    it('expect breath of the unborn to deal 2 damage to all enemy minions and restore all friendly minions to full health', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      player1.remainingMana = 9;

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 5, 1, gameSession.getPlayer2Id());
      const kaidoAssassin2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 6, 1, gameSession.getPlayer1Id());

      kaidoAssassin2.setDamage(2);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.BreathOfTheUnborn }));
      const action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      expect(kaidoAssassin2.getHP()).to.equal(3);
      expect(kaidoAssassin.getHP()).to.equal(1);
    });

    it('expect dark seed to deal 1 damage to the enemy general for each card in their hand', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.DarkSeed }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.DarkSeed }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.DarkSeed }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.DarkSeed }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.DarkSeed }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.DarkSeed }));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.DarkSeed }));
      const action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(19);
    });

    it('expect dark transformation to destroy an enemy minion and leave 1/1 wraithling in place', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      player1.remainingMana = 9;

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 5, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.DarkTransformation }));
      const action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      const wraithling = board.getUnitAtPosition({ x: 5, y: 1 });

      expect(kaidoAssassin.getIsRemoved()).to.equal(true);
      expect(wraithling.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
    });

    it('expect dark transformation to override magmar rebirth eggs', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      player1.remainingMana = 9;

      const youngSilithar = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.YoungSilithar }, 5, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.DarkTransformation }));
      const action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      const wraithling = board.getUnitAtPosition({ x: 5, y: 1 });

      expect(youngSilithar.getIsRemoved()).to.equal(true);
      expect(wraithling.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
    });

    it('expect nether summoning to summon 2 enemy minions that opponent suicided during his turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      var rustCrawler = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BluetipScorpion }, 0, 1, gameSession.getPlayer2Id());
      var repulsorBeast = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.RepulsionBeast }, 1, 1, gameSession.getPlayer2Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      var action = rustCrawler.actionAttack(gameSession.getGeneralForPlayer1());
      gameSession.executeAction(action);
      var action = repulsorBeast.actionAttack(gameSession.getGeneralForPlayer1());
      gameSession.executeAction(action);

      gameSession.executeAction(gameSession.actionEndTurn());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.NetherSummoning }));
      var action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      let rustCrawlerx = 0;
      let rustCrawlery = 0;
      let repulsorBeastx = 0;
      let repulsorBeasty = 0;

      for (let xx = 0; xx < 10; xx++) {
        for (let yy = 0; yy < 5; yy++) {
          const unit = board.getUnitAtPosition({ x: xx, y: yy });
          if (unit != null && unit.getId() === SDK.Cards.Neutral.BluetipScorpion) {
            rustCrawlerx = xx;
            rustCrawlery = yy;
          }
          if (unit != null && unit.getId() === SDK.Cards.Neutral.RepulsionBeast) {
            repulsorBeastx = xx;
            repulsorBeasty = yy;
          }
        }
      }

      var rustCrawler = board.getUnitAtPosition({ x: rustCrawlerx, y: rustCrawlery });
      var repulsorBeast = board.getUnitAtPosition({ x: repulsorBeastx, y: repulsorBeasty });

      expect(rustCrawler.getOwnerId()).to.equal(gameSession.getPlayer1Id());
      expect(repulsorBeast.getOwnerId()).to.equal(gameSession.getPlayer1Id());
    });

    it('expect nether summoning to summon 2 friendly minions that opponent killed during his turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      var rustCrawler = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BluetipScorpion }, 0, 1, gameSession.getPlayer1Id());
      var repulsorBeast = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.RepulsionBeast }, 1, 1, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      player2.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.GhostLightning }));
      var action = player2.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.GhostLightning }));
      var action = player2.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      gameSession.executeAction(gameSession.actionEndTurn());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.NetherSummoning }));
      var action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      let rustCrawlerx = 0;
      let rustCrawlery = 0;
      let repulsorBeastx = 0;
      let repulsorBeasty = 0;

      for (let xx = 0; xx < 10; xx++) {
        for (let yy = 0; yy < 5; yy++) {
          const unit = board.getUnitAtPosition({ x: xx, y: yy });
          if (unit != null && unit.getId() === SDK.Cards.Neutral.BluetipScorpion) {
            rustCrawlerx = xx;
            rustCrawlery = yy;
          }
          if (unit != null && unit.getId() === SDK.Cards.Neutral.RepulsionBeast) {
            repulsorBeastx = xx;
            repulsorBeasty = yy;
          }
        }
      }

      var rustCrawler = board.getUnitAtPosition({ x: rustCrawlerx, y: rustCrawlery });
      var repulsorBeast = board.getUnitAtPosition({ x: repulsorBeastx, y: repulsorBeasty });

      expect(rustCrawler.getOwnerId()).to.equal(gameSession.getPlayer1Id());
      expect(repulsorBeast.getOwnerId()).to.equal(gameSession.getPlayer1Id());
    });

    it('expect nether summoning to not summon anything if no minions died on opponents last turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      var rustCrawler = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BluetipScorpion }, 0, 1, gameSession.getPlayer1Id());
      var repulsorBeast = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.RepulsionBeast }, 1, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
      var action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.NetherSummoning }));
      var action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      let rustCrawlerx = 0;
      let rustCrawlery = 0;
      let repulsorBeastx = 0;
      let repulsorBeasty = 0;

      for (let xx = 0; xx < 10; xx++) {
        for (let yy = 0; yy < 5; yy++) {
          const unit = board.getUnitAtPosition({ x: xx, y: yy });
          if (unit != null && unit.getId() === SDK.Cards.Neutral.BluetipScorpion) {
            rustCrawlerx = xx;
            rustCrawlery = yy;
          }
          if (unit != null && unit.getId() === SDK.Cards.Neutral.RepulsionBeast) {
            repulsorBeastx = xx;
            repulsorBeasty = yy;
          }
        }
      }

      var rustCrawler = board.getUnitAtPosition({ x: rustCrawlerx, y: rustCrawlery });
      var repulsorBeast = board.getUnitAtPosition({ x: repulsorBeastx, y: repulsorBeasty });

      expect(rustCrawler).to.equal(undefined);
      expect(repulsorBeast).to.equal(undefined);
    });

    it('expect nether summoning to not summon tokens', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      var wraithling = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 0, 1, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      player2.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.GhostLightning }));
      var action = player2.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      gameSession.executeAction(gameSession.actionEndTurn());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.NetherSummoning }));
      var action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      let wraithlingx = 0;
      let wraithlingy = 0;

      for (let xx = 0; xx < 10; xx++) {
        for (let yy = 0; yy < 5; yy++) {
          const unit = board.getUnitAtPosition({ x: xx, y: yy });
          if (unit != null && unit.getId() === SDK.Cards.Faction4.Wraithling) {
            wraithlingx = xx;
            wraithlingy = yy;
          }
        }
      }

      var wraithling = board.getUnitAtPosition({ x: wraithlingx, y: wraithlingy });

      expect(wraithling).to.equal(undefined);
    });

    it('expect shadow nova to create 2x2 shadow creep grid', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ShadowNova }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 0);
      gameSession.executeAction(playCardFromHandAction);

      const shadowCreep1 = board.getTileAtPosition({ x: 0, y: 0 }, true);
      const shadowCreep2 = board.getTileAtPosition({ x: 1, y: 0 }, true);
      const shadowCreep3 = board.getTileAtPosition({ x: 0, y: 1 }, true);
      const shadowCreep4 = board.getTileAtPosition({ x: 1, y: 1 }, true);

      expect(shadowCreep1.getOwnerId()).to.equal(player1.getPlayerId());
      expect(shadowCreep1.getId()).to.equal(SDK.Cards.Tile.Shadow);
      expect(shadowCreep2.getId()).to.equal(SDK.Cards.Tile.Shadow);
      expect(shadowCreep3.getId()).to.equal(SDK.Cards.Tile.Shadow);
      expect(shadowCreep4.getId()).to.equal(SDK.Cards.Tile.Shadow);
    });

    it('expect shadow creep to deal 1 damage at end of turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      gameSession.executeAction(gameSession.actionEndTurn());

      player2.remainingMana = 9;
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.ShadowNova }));
      var playCardFromHandAction = player2.actionPlayCardFromHand(0, 0, 0);
      gameSession.executeAction(playCardFromHandAction);
      player2.remainingMana = 9;
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.ShadowNova }));
      var playCardFromHandAction = player2.actionPlayCardFromHand(0, 2, 0);
      gameSession.executeAction(playCardFromHandAction);

      gameSession.executeAction(gameSession.actionEndTurn());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ShadowNova }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(playCardFromHandAction);

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(24);
    });
  }); // end Spells describe
});
