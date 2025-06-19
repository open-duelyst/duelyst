const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../../'));
require('coffeescript/register');
const expect = require('chai').expect;
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const ModifierForcefieldAbsorb = require('app/sdk/modifiers/modifierForcefieldAbsorb');
const UtilsSDK = require('test/utils/utils_sdk');
const _ = require('underscore');
const Promise = require('bluebird');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('battle pets', () => {
  beforeEach(() => {
    // define test decks.
    const player1Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction2.General },
    ];

    // setup test session
    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
  });

  afterEach(() => {
    SDK.GameSession.reset();
  });

  it('expect battle pets to move at the start of its owners turn', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    player1.remainingMana = 9;

    const yun = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Yun }, 3, 2, gameSession.getPlayer2Id());

    gameSession.executeAction(gameSession.actionEndTurn());

    // yun = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.Yun);
    const oldYun = board.getUnitAtPosition({ x: 3, y: 2 });

    expect(oldYun).to.equal(undefined);
  });

  it('expect battle pets to not attempt to move if sand trapped', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    player1.remainingMana = 9;

    const yun = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Yun }, 3, 2, gameSession.getPlayer2Id());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.DrainMorale }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 2);
    gameSession.executeAction(playCardFromHandAction);

    gameSession.executeAction(gameSession.actionEndTurn());

    // yun = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.Yun);
    const oldYun = board.getUnitAtPosition({ x: 3, y: 2 });
    const currentPlayer = gameSession.getCurrentPlayer();

    expect(currentPlayer).to.equal(gameSession.getPlayer2());
    expect(oldYun.getId()).to.equal(SDK.Cards.Neutral.Yun);
  });

  it('expect battle pets to not attempt to attack if attack is 0', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    player1.remainingMana = 9;

    const amu = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Amu }, 1, 1, gameSession.getPlayer2Id());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.VoidSteal }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);

    expect(amu.getATK()).to.equal(0);

    gameSession.executeAction(gameSession.actionEndTurn());

    const currentPlayer = gameSession.getCurrentPlayer();
    expect(currentPlayer).to.equal(gameSession.getPlayer2());

    const player1General = gameSession.getGeneralForPlayer1();
    expect(player1General.getDamage()).to.equal(0);
  });

  it('expect battle pets to move towards its closest enemy', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    player1.remainingMana = 9;

    let yun = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Yun }, 4, 0, gameSession.getPlayer2Id());
    const golem1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 8, 0, gameSession.getPlayer1Id());
    const golem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 0, 4, gameSession.getPlayer1Id());

    gameSession.executeAction(gameSession.actionEndTurn());

    yun = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.Yun);

    expect(yun.getPosition().x).to.be.above(5);
  });

  it('expect battle pets to immediately attack an enemy if its already in melee range instead of moving first', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    player1.remainingMana = 9;

    let yun = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Yun }, 4, 0, gameSession.getPlayer2Id());
    const kiri = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.DaggerKiri }, 5, 0, gameSession.getPlayer1Id());

    gameSession.executeAction(gameSession.actionEndTurn());

    yun = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.Yun);

    expect(yun.getPosition().x).to.equal(4);
    expect(yun.getPosition().y).to.equal(0);
  });

  it('expect melee battle pets to attack the nearest enemy', () => {
    for (let i = 0; i < 30; i++) {
      const player1Deck = [{ id: SDK.Cards.Faction1.General }];
      const player2Deck = [{ id: SDK.Cards.Faction3.General }];
      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const yun = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Yun }, 5, 0, gameSession.getPlayer2Id());
      const damage = yun.getATK();
      const golem1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 8, 0, gameSession.getPlayer1Id());
      const golem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 0, 0, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(golem1.getDamage()).to.equal(damage);
    }
  });

  /* Test disabled: slow
    it('expect ranged battle pets to attack the nearest enemy', function() {
      for(var i = 0; i < 100; i++) {
        var player1Deck = [{id: SDK.Cards.Faction1.General}];
        var player2Deck = [{id: SDK.Cards.Faction3.General}];
        UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

        var gameSession = SDK.GameSession.getInstance();
        var board = gameSession.getBoard();
        var player1 = gameSession.getPlayer1();
        player1.remainingMana = 9;

        var ion = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Ion}, 8, 0, gameSession.getPlayer2Id());
        var damage = ion.getATK();
        var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 1, 0, gameSession.getPlayer1Id());
        var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 1, 1, gameSession.getPlayer1Id());
        var golem3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 1, 2, gameSession.getPlayer1Id());

        gameSession.executeAction(gameSession.actionEndTurn());

        expect(golem1.getDamage()).to.equal(damage);
      }
    });
    */

  it('expect flying battle pets to attack the nearest enemy', () => {
    for (let i = 0; i < 30; i++) {
      const player1Deck = [{ id: SDK.Cards.Faction1.General }];
      const player2Deck = [{ id: SDK.Cards.Faction3.General }];
      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      gameSession.executeAction(gameSession.actionEndTurn());

      player2.remainingMana = 9;

      const ubo = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Ubo }, 8, 0, gameSession.getPlayer2Id());
      const damage = ubo.getATK();
      const golem1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 2, 0, gameSession.getPlayer1Id());
      const golem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 1, 1, gameSession.getPlayer1Id());
      const golem3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AstralPhasing }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 0);
      gameSession.executeAction(playCardFromHandAction);

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      expect(golem1.getDamage()).to.equal(damage);
    }
  });

  it('expect battle pets to attack the next closest enemy if the closest one is blocked', () => {
    for (let i = 0; i < 30; i++) {
      const player1Deck = [{ id: SDK.Cards.Faction1.General }];
      const player2Deck = [{ id: SDK.Cards.Faction3.General }];
      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const yun = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Yun }, 5, 0, gameSession.getPlayer2Id());
      const damage = yun.getATK();
      const golem1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 7, 0, gameSession.getPlayer1Id());
      const golem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 6, 0, gameSession.getPlayer2Id());
      const golem3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 6, 1, gameSession.getPlayer2Id());
      const golem4 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 2, 0, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(golem4.getDamage()).to.equal(damage);
    }
  });

  it('expect battle pets to always attack a provoking minion when provoked', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    player1.remainingMana = 9;

    const yun = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Yun }, 5, 0, gameSession.getPlayer2Id());
    const damage = yun.getATK();
    const heartseeker1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Heartseeker }, 5, 1, gameSession.getPlayer1Id());
    const heartseeker2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Heartseeker }, 6, 0, gameSession.getPlayer1Id());
    const provoke = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.PrimusShieldmaster }, 6, 1, gameSession.getPlayer1Id());
    const heartseeker3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Heartseeker }, 4, 0, gameSession.getPlayer1Id());
    const heartseeker4 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Heartseeker }, 4, 1, gameSession.getPlayer1Id());

    gameSession.executeAction(gameSession.actionEndTurn());

    expect(provoke.getDamage()).to.equal(damage);
  });

  it('expect battle pets to always attack a provoking minion when moving into provoke range', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    player1.remainingMana = 9;

    const yun = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Yun }, 4, 1, gameSession.getPlayer2Id());
    const damage = yun.getATK();
    const provoke = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.PrimusShieldmaster }, 6, 0, gameSession.getPlayer1Id());
    const heartseeker1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Heartseeker }, 6, 1, gameSession.getPlayer1Id());
    const heartseeker2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Heartseeker }, 6, 2, gameSession.getPlayer1Id());

    gameSession.executeAction(gameSession.actionEndTurn());

    expect(provoke.getDamage()).to.equal(damage);
  });

  it('expect ranged battle pets to always attack a ranged provoking minion when provoked', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    player1.remainingMana = 9;

    const ion = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Ion }, 3, 0, gameSession.getPlayer2Id());
    const damage = ion.getATK();
    const golem1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 4, 0, gameSession.getPlayer1Id());
    const provoke = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.PrimusShieldmaster }, 3, 1, gameSession.getPlayer1Id());
    const windstopper = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.WindStopper }, 8, 0, gameSession.getPlayer1Id());

    gameSession.executeAction(gameSession.actionEndTurn());

    expect(windstopper.getDamage()).to.equal(damage);
  });

  it('expect ranged battle pets to not attack a provoking minion when out of range', () => {
    for (let i = 0; i < 30; i++) {
      const player1Deck = [{ id: SDK.Cards.Faction1.General }];
      const player2Deck = [{ id: SDK.Cards.Faction3.General }];
      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const ion = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Ion }, 8, 0, gameSession.getPlayer2Id());
      const damage = ion.getATK();
      const provoke = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.PrimusShieldmaster }, 2, 0, gameSession.getPlayer1Id());
      const golem1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 4, 0, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());
      expect(golem1.getDamage()).to.equal(damage);
    }
  });

  it('expect battle pets to take actions in the order they were summoned', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    player1.remainingMana = 9;

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Yun }));
    var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Yun }));
    var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 1);
    gameSession.executeAction(playCardFromHandAction);

    const golem1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneHowler }, 2, 2, gameSession.getPlayer2Id());
    const yun1 = board.getUnitAtPosition({ x: 1, y: 1 });
    const yun2 = board.getUnitAtPosition({ x: 2, y: 1 });

    gameSession.executeAction(gameSession.actionEndTurn());
    gameSession.executeAction(gameSession.actionEndTurn());

    // yun = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.Yun);
    // var oldYun = board.getUnitAtPosition({x: 3, y: 2});

    expect(yun1.getIsRemoved()).to.equal(true);
    expect(yun2.getIsRemoved()).to.equal(false);
  });

  it('expect battle pets to ignore invalid targets', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    player1.remainingMana = 9;

    const yun = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Yun }, 5, 0, gameSession.getPlayer2Id());
    const damage = yun.getATK();
    const golem1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 7, 0, gameSession.getPlayer1Id());
    const panddo = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.OnyxBear }, 6, 0, gameSession.getPlayer1Id());

    gameSession.executeAction(gameSession.actionEndTurn());

    expect(golem1.getDamage()).to.equal(damage);
  });

  it('expect battle pets to attack forcefielded targets', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    player1.remainingMana = 9;

    const yun = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Yun }, 6, 0, gameSession.getPlayer2Id());
    const oni = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Oni }, 5, 0, gameSession.getPlayer1Id());
    expect(oni.hasActiveModifierClass(ModifierForcefieldAbsorb)).to.equal(true);

    gameSession.executeAction(gameSession.actionEndTurn());

    expect(oni.getDamage()).to.equal(0);
    expect(oni.hasActiveModifierClass(ModifierForcefieldAbsorb)).to.equal(false);
  });
});
