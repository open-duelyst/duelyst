const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../'));
require('coffeescript/register');

const { expect } = require('chai');
const _ = require('underscore');

const CONFIG = require('../../../../app/common/config');
const Logger = require('../../../../app/common/logger.coffee');
const SDK = require('../../../../app/sdk.coffee');
const CardFactory = require('../../../../app/sdk/cards/cardFactory.coffee');
const UtilsSDK = require('../../../utils/utils_sdk');
const UsableDecks = require('../../../../server/ai/decks/usable_decks');
const StarterAI = require('../../../../server/ai/starter_ai');
const ModifierRanged = require('../../../../app/sdk/modifiers/modifierRanged.coffee');
const ModifierForcefield = require('../../../../app/sdk/modifiers/modifierForcefield.coffee');
const ModifierFlying = require('../../../../app/sdk/modifiers/modifierFlying.coffee');
const ModifierTranscendance = require('../../../../app/sdk/modifiers/modifierTranscendance.coffee');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('bosses', () => {
  beforeEach(() => {

  });

  afterEach(() => {
    SDK.GameSession.reset();
  });

  /* Test disabled: slow
  it('expect bosses to not be dispellable', function() {
    const bosses = SDK.GameSession.getCardCaches().getFaction(SDK.Factions.Boss).getIsGeneral(true).getCards();
    //console.log(bosses[0].id);

    for(var i = 0; i < bosses.length; i++){
      const player1Deck = [
        bosses[i]
      ];

      const player2Deck = [
        {id: SDK.Cards.Faction1.General}
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const boss = gameSession.getGeneralForPlayer1();

      player1.remainingMana = 9;
      //console.log(bosses[i].name, " is now being tested");

      const startingModifiers = boss.getModifiers().length;
      //console.log("Starting modifiers: ", boss.getModifiers());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
      gameSession.executeAction(playCardFromHandAction);

      //console.log("Ending modifiers: ", boss.getModifiers());
      const endingModifiers = boss.getModifiers().length;

      expect(startingModifiers + 1).to.equal(endingModifiers);
    }
  });
  */

  it('expect boreal juggernaut to only be able to move 1 space at a time', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss1 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    let action = boss.actionMove({ x: 2, y: 2 });
    gameSession.executeAction(action);
    expect(action.getIsValid()).to.equal(false);
    expect(boss.getPosition().x).to.equal(0);
    expect(boss.getPosition().y).to.equal(2);

    action = boss.actionMove({ x: 1, y: 2 });
    gameSession.executeAction(action);
    expect(action.getIsValid()).to.equal(true);
    expect(boss.getPosition().x).to.equal(1);
    expect(boss.getPosition().y).to.equal(2);
  });

  it('expect boreal juggernaut to stun enemies hit', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss1 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const boss = gameSession.getGeneralForPlayer1();

    const golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 1, 1, gameSession.getPlayer2Id());

    player1.remainingMana = 9;
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    const action = boss.actionAttack(golem);
    gameSession.executeAction(action);

    expect(action.getIsValid()).to.equal(true);
    expect(golem.hasActiveModifierClass(SDK.ModifierStunned)).to.equal(true);
  });

  it('expect umbra to spawn a 1 health clone whenever you summon a minion', () => {
    const player1Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    const player2Deck = [
      { id: SDK.Cards.Boss.Boss2 },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const boss = gameSession.getGeneralForPlayer1();
    player1.remainingMana = 9;

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
    gameSession.executeAction(playCardFromHandAction);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.IroncliffeGuardian }));
    playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);

    const clone = board.getFriendlyEntitiesAroundEntity(gameSession.getGeneralForPlayer2());

    expect(clone[0].getHP()).to.equal(1);
    expect(clone[0].getId()).to.equal(SDK.Cards.Faction1.IroncliffeGuardian);
  });

  it('expect cade to teleport any minion he hits to a random space', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss4 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Boss.Boss4 },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const boss = gameSession.getGeneralForPlayer1();

    const golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 1, 1, gameSession.getPlayer2Id());

    player1.remainingMana = 9;
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    const action = boss.actionAttack(golem);
    gameSession.executeAction(action);

    expect(action.getIsValid()).to.equal(true);
    const updatedGolem = board.getUnitAtPosition({ x: 1, y: 1 });
    expect(updatedGolem).to.equal(undefined);
  });

  it('expect cade to teleport generals he hits to a random space', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss4 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const boss = gameSession.getGeneralForPlayer1();

    let action = boss.actionMove({ x: 2, y: 2 });
    gameSession.executeAction(action);
    boss.refreshExhaustion();
    action = boss.actionMove({ x: 4, y: 2 });
    gameSession.executeAction(action);
    boss.refreshExhaustion();
    action = boss.actionMove({ x: 6, y: 2 });
    gameSession.executeAction(action);
    boss.refreshExhaustion();
    action = boss.actionMove({ x: 7, y: 2 });
    gameSession.executeAction(action);

    action = boss.actionAttack(gameSession.getGeneralForPlayer2());
    gameSession.executeAction(action);

    expect(action.getIsValid()).to.equal(true);
    const updatedGeneral = board.getUnitAtPosition({ x: 8, y: 2 });
    expect(updatedGeneral).to.equal(undefined);
  });

  it('expect cade to teleport your general when you cast spells on it', () => {
    const player1Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    const player2Deck = [
      { id: SDK.Cards.Boss.Boss4 },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const boss = gameSession.getGeneralForPlayer1();
    player1.remainingMana = 9;

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
    gameSession.executeAction(playCardFromHandAction);

    const updatedGeneral = board.getUnitAtPosition({ x: 0, y: 2 });
    expect(updatedGeneral).to.equal(undefined);
  });

  it('expect shinkage zendo to be unable to move', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss5 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Boss.Boss5 },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const boss = gameSession.getGeneralForPlayer1();

    let action = boss.actionMove({ x: 2, y: 2 });
    gameSession.executeAction(action);
    expect(action.getIsValid()).to.equal(false);
    expect(boss.getPosition().x).to.equal(0);
    expect(boss.getPosition().y).to.equal(2);

    action = boss.actionMove({ x: 1, y: 2 });
    gameSession.executeAction(action);
    expect(action.getIsValid()).to.equal(false);
    expect(boss.getPosition().x).to.equal(0);
    expect(boss.getPosition().y).to.equal(2);
  });

  it('expect shinkage zendo to be immune to damage if he has minions in play', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss5 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();
    player1.remainingMana = 9;

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.IroncliffeGuardian }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);

    gameSession.executeAction(gameSession.actionEndTurn());

    player2.remainingMana = 9;
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.ChromaticCold }));
    playCardFromHandAction = player2.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    playCardFromHandAction = player2.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    expect(boss.getDamage()).to.equal(0);

    player2.remainingMana = 9;

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.DarkTransformation }));
    playCardFromHandAction = player2.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    playCardFromHandAction = player2.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    expect(boss.getDamage()).to.equal(3);
  });

  it('expect shinkage zendo to make the enemy general act like a battlepet', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss5 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();
    player1.remainingMana = 9;

    player1.remainingMana = 9;
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    expect(gameSession.getGeneralForPlayer2().getPosition().x === 8 || gameSession.getGeneralForPlayer2().getPosition().y === 2).to.equal(true);

    gameSession.executeAction(gameSession.actionEndTurn());

    expect(gameSession.getGeneralForPlayer2().getPosition().x !== 8 || gameSession.getGeneralForPlayer2().getPosition().y !== 2).to.equal(true);
  });

  it('expect caliber0 to equip artifacts every turn after the second', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss7 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    player1.remainingMana = 9;

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    gameSession.executeAction(gameSession.actionEndTurn());
    gameSession.executeAction(gameSession.actionEndTurn());

    expect(gameSession.getGeneralForPlayer1().getArtifactModifiersGroupedByArtifactCard().length).to.equal(1);
  });

  it('expect monolith guardian to steal enemy units he kills', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss8 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();
    player1.remainingMana = 9;

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    const planarScout = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.PlanarScout }, 0, 1, gameSession.getPlayer2Id());

    const action = boss.actionAttack(planarScout);
    gameSession.executeAction(action);

    const newUnit = board.getFriendlyEntitiesAroundEntity(gameSession.getGeneralForPlayer1());
    expect(newUnit[0].getId()).to.equal(SDK.Cards.Neutral.PlanarScout);
    expect(newUnit[0].ownerId).to.equal('player1_id');
  });

  it('expect monolith guardian to respawn at 4/20 stats when dying for the first time', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss8 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();
    player1.remainingMana = 9;

    boss.setDamage(13);

    expect(boss.getHP()).to.equal(2);
    expect(boss.getATK()).to.equal(2);

    player1.remainingMana = 9;
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    expect(boss.getHP()).to.equal(20);
    expect(boss.getATK()).to.equal(4);
  });

  it('expect monolith guardian to be killable again after he transforms into a 4/20', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss8 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();
    player1.remainingMana = 9;

    boss.setDamage(13);

    expect(boss.getHP()).to.equal(2);
    expect(boss.getATK()).to.equal(2);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    boss.setDamage(18);

    expect(boss.getHP()).to.equal(2);
    expect(boss.getATK()).to.equal(4);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    expect(boss.getHP()).to.equal(0);
    expect(boss.getIsRemoved()).to.equal(true);
  });

  it('expect wujin to spawn 1/5 provoke decoys when he attacks', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss9 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    let action = boss.actionMove({ x: 8, y: 3 });
    gameSession.executeAction(action);
    action = boss.actionAttack(gameSession.getGeneralForPlayer2());
    gameSession.executeAction(action);

    const newUnit = board.getFriendlyEntitiesAroundEntity(gameSession.getGeneralForPlayer1());
    expect(newUnit[0].getId()).to.equal(SDK.Cards.Boss.Boss9Clone);
    expect(newUnit[0].ownerId).to.equal('player1_id');
    expect(newUnit[0].getHP()).to.equal(5);
    expect(newUnit[0].getATK()).to.equal(1);
    expect(newUnit[0].hasActiveModifierClass(SDK.ModifierProvoke)).to.equal(true);
  });

  it('expect wujin to spawn 1/5 provoke decoys when he is attacked', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss9 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 5, 1, gameSession.getPlayer2Id());

    gameSession.executeAction(gameSession.actionEndTurn());

    const action = valeHunter.actionAttack(boss);
    gameSession.executeAction(action);

    const newUnit = board.getFriendlyEntitiesAroundEntity(gameSession.getGeneralForPlayer1());
    expect(newUnit[0].getId()).to.equal(SDK.Cards.Boss.Boss9Clone);
    expect(newUnit[0].ownerId).to.equal('player1_id');
    expect(newUnit[0].getHP()).to.equal(5);
    expect(newUnit[0].getATK()).to.equal(1);
    expect(newUnit[0].hasActiveModifierClass(SDK.ModifierProvoke)).to.equal(true);
  });

  it('expect wujin to teleport to a random corner at the end of turn', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss9 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    gameSession.executeAction(gameSession.actionEndTurn());

    let generalInCorner = false;
    const corner1 = board.getUnitAtPosition({ x: 0, y: 0 });
    const corner2 = board.getUnitAtPosition({ x: 0, y: 4 });
    const corner3 = board.getUnitAtPosition({ x: 8, y: 0 });
    const corner4 = board.getUnitAtPosition({ x: 8, y: 4 });

    if (corner1 != null) {
      if (corner1.getId() === SDK.Cards.Boss.Boss9) {
        generalInCorner = true;
      }
    }
    if (corner2 != null) {
      if (corner2.getId() === SDK.Cards.Boss.Boss9) {
        generalInCorner = true;
      }
    }
    if (corner3 != null) {
      if (corner3.getId() === SDK.Cards.Boss.Boss9) {
        generalInCorner = true;
      }
    }
    if (corner4 != null) {
      if (corner4.getId() === SDK.Cards.Boss.Boss9) {
        generalInCorner = true;
      }
    }

    expect(generalInCorner).to.equal(true);
  });

  it('expect d3c to transform into d3cepticle when killed', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss6 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    const newBoss = UtilsSDK.getEntityOnBoardById(SDK.Cards.Boss.Boss6Prime);
    expect(newBoss.getId()).to.equal(SDK.Cards.Boss.Boss6Prime);
  });

  it('expect d3c to be immune to damage with a mech peice in play', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss6 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    const mech = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Boss.Boss6Helm }, 5, 1, gameSession.getPlayer1Id());

    player1.remainingMana = 9;
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    expect(board.getUnitAtPosition({ x: 0, y: 2 }).getHP()).to.equal(1);
  });

  it('expect solfist to reactivate whenever he kills a minion', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss10 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 1, 1, gameSession.getPlayer2Id());

    player1.remainingMana = 9;
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    let action = boss.actionAttack(valeHunter);
    gameSession.executeAction(action);

    action = boss.actionMove({ x: 2, y: 2 });
    gameSession.executeAction(action);

    expect(boss.getPosition().x).to.equal(2);
    expect(boss.getPosition().y).to.equal(2);
    expect(valeHunter.getIsRemoved()).to.equal(true);
  });

  it('expect solfist to damage himself and all nearby enemies at the end of each turn', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss10 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    const highHP = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.WhistlingBlade }, 1, 1, gameSession.getPlayer2Id());

    player1.remainingMana = 9;
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    gameSession.executeAction(gameSession.actionEndTurn());
    expect(boss.getDamage()).to.equal(1);
    expect(highHP.getDamage()).to.equal(1);

    gameSession.executeAction(gameSession.actionEndTurn());
    gameSession.executeAction(gameSession.actionEndTurn());
    expect(boss.getDamage()).to.equal(3);
    expect(highHP.getDamage()).to.equal(3);

    gameSession.executeAction(gameSession.actionEndTurn());
    gameSession.executeAction(gameSession.actionEndTurn());
    expect(boss.getDamage()).to.equal(7);
    expect(highHP.getDamage()).to.equal(7);
  });

  it('expect automaton 8s ranged attack to damage enemies in an area and take an equal amount himself', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss11 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    const highHP = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.WhistlingBlade }, 8, 1, gameSession.getPlayer2Id());
    const highHP2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.WhistlingBlade }, 8, 3, gameSession.getPlayer2Id());

    player1.remainingMana = 9;
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    const action = boss.actionAttack(gameSession.getGeneralForPlayer2());
    gameSession.executeAction(action);

    expect(highHP.getDamage()).to.equal(3);
    expect(highHP2.getDamage()).to.equal(3);
    expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(3);
    expect(boss.getDamage()).to.equal(9);
  });

  it('expect orias to gain attack anytime he or his minions are damaged', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss12 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    const highHP = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.WhistlingBlade }, 8, 1, gameSession.getPlayer1Id());
    const highHP2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.WhistlingBlade }, 8, 3, gameSession.getPlayer1Id());

    player1.remainingMana = 9;
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 1);
    gameSession.executeAction(playCardFromHandAction);

    expect(boss.getATK()).to.equal(2);
  });

  it('expect malyk to let the opponent draw a card whenever they play a minion', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss13 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    gameSession.executeAction(gameSession.actionEndTurn());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
    playCardFromHandAction = player2.actionPlayCardFromHand(0, 7, 2);
    gameSession.executeAction(playCardFromHandAction);

    const hand = player2.getDeck().getCardsInHand();
    expect(hand[0].getId()).to.equal(SDK.Cards.Spell.PhoenixFire);
  });

  it('expect malyk to summon a 3/3 ooz whenever the opponent overdraws', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss13 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, false);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    const spelljammer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Spelljammer }, 8, 1, gameSession.getPlayer1Id());

    gameSession.executeAction(gameSession.actionEndTurn());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.ChromaticCold }));
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.ChromaticCold }));
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.ChromaticCold }));
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.ChromaticCold }));
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
    playCardFromHandAction = player2.actionPlayCardFromHand(5, 7, 2);
    gameSession.executeAction(playCardFromHandAction);

    gameSession.executeAction(gameSession.actionEndTurn());

    const ooz = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction4.Ooz);
    expect(ooz[0].getId()).to.equal(SDK.Cards.Faction4.Ooz);
  });

  it('expect archonis to deal damage equal to unspent mana', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss14 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChromaticCold }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    gameSession.executeAction(gameSession.actionEndTurn());
    gameSession.executeAction(gameSession.actionEndTurn());

    expect(boss.getDamage()).to.equal(7);
    expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(3);
  });

  it('expect paragon of light to gain/lose modifiers at certain HP thresholds', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss15 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;

    expect(boss.hasModifierClass(ModifierRanged)).to.equal(false);
    expect(boss.hasModifierClass(ModifierForcefield)).to.equal(false);
    expect(boss.hasModifierClass(ModifierTranscendance)).to.equal(false);
    expect(boss.hasModifierClass(ModifierFlying)).to.equal(false);

    let damageAction = new SDK.DamageAction(gameSession);
    damageAction.setTarget(boss);
    damageAction.setDamageAmount(5);
    UtilsSDK.executeActionWithoutValidation(damageAction);

    expect(boss.hasModifierClass(ModifierRanged)).to.equal(true);
    expect(boss.hasModifierClass(ModifierForcefield)).to.equal(true);
    expect(boss.hasModifierClass(ModifierTranscendance)).to.equal(false);
    expect(boss.hasModifierClass(ModifierFlying)).to.equal(false);

    damageAction = new SDK.DamageAction(gameSession);
    damageAction.setTarget(boss);
    damageAction.setDamageAmount(5);
    UtilsSDK.executeActionWithoutValidation(damageAction);

    damageAction = new SDK.DamageAction(gameSession);
    damageAction.setTarget(boss);
    damageAction.setDamageAmount(5);
    UtilsSDK.executeActionWithoutValidation(damageAction);

    expect(boss.hasModifierClass(ModifierRanged)).to.equal(true);
    expect(boss.hasModifierClass(ModifierForcefield)).to.equal(true);
    expect(boss.hasModifierClass(ModifierTranscendance)).to.equal(true);
    expect(boss.hasModifierClass(ModifierFlying)).to.equal(false);

    damageAction = new SDK.DamageAction(gameSession);
    damageAction.setTarget(boss);
    damageAction.setDamageAmount(5);
    UtilsSDK.executeActionWithoutValidation(damageAction);

    expect(boss.hasModifierClass(ModifierRanged)).to.equal(true);
    expect(boss.hasModifierClass(ModifierForcefield)).to.equal(true);
    expect(boss.hasModifierClass(ModifierTranscendance)).to.equal(true);
    expect(boss.hasModifierClass(ModifierFlying)).to.equal(true);

    damageAction = new SDK.HealAction(gameSession);
    damageAction.setTarget(boss);
    damageAction.setHealAmount(5);
    UtilsSDK.executeActionWithoutValidation(damageAction);

    expect(boss.hasModifierClass(ModifierRanged)).to.equal(true);
    expect(boss.hasModifierClass(ModifierForcefield)).to.equal(true);
    expect(boss.hasModifierClass(ModifierTranscendance)).to.equal(true);
    expect(boss.hasModifierClass(ModifierFlying)).to.equal(false);

    damageAction = new SDK.HealAction(gameSession);
    damageAction.setTarget(boss);
    damageAction.setHealAmount(5);
    UtilsSDK.executeActionWithoutValidation(damageAction);

    expect(boss.hasModifierClass(ModifierRanged)).to.equal(true);
    expect(boss.hasModifierClass(ModifierForcefield)).to.equal(true);
    expect(boss.hasModifierClass(ModifierTranscendance)).to.equal(false);
    expect(boss.hasModifierClass(ModifierFlying)).to.equal(false);

    damageAction = new SDK.HealAction(gameSession);
    damageAction.setTarget(boss);
    damageAction.setHealAmount(5);
    UtilsSDK.executeActionWithoutValidation(damageAction);

    expect(boss.hasModifierClass(ModifierRanged)).to.equal(true);
    expect(boss.hasModifierClass(ModifierForcefield)).to.equal(false);
    expect(boss.hasModifierClass(ModifierTranscendance)).to.equal(false);
    expect(boss.hasModifierClass(ModifierFlying)).to.equal(false);

    damageAction = new SDK.HealAction(gameSession);
    damageAction.setTarget(boss);
    damageAction.setHealAmount(5);
    UtilsSDK.executeActionWithoutValidation(damageAction);

    expect(boss.hasModifierClass(ModifierRanged)).to.equal(false);
    expect(boss.hasModifierClass(ModifierForcefield)).to.equal(false);
    expect(boss.hasModifierClass(ModifierTranscendance)).to.equal(false);
    expect(boss.hasModifierClass(ModifierFlying)).to.equal(false);
  });

  it('expect scion of the void to deal double damage on counter attacks', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss16 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;
    const highHP = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.WhistlingBlade }, 1, 1, gameSession.getPlayer2Id());

    let action = boss.actionAttack(highHP);
    gameSession.executeAction(action);

    expect(highHP.getDamage()).to.equal(2);

    gameSession.executeAction(gameSession.actionEndTurn());
    action = highHP.actionAttack(boss);
    gameSession.executeAction(action);

    expect(highHP.getDamage()).to.equal(6);
  });

  it('expect scion of the void to steal health when attacking', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss16 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;
    const highHP = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.WhistlingBlade }, 1, 1, gameSession.getPlayer2Id());

    boss.setDamage(10);

    let action = boss.actionAttack(highHP);
    gameSession.executeAction(action);

    expect(boss.getDamage()).to.equal(10);

    gameSession.executeAction(gameSession.actionEndTurn());
    action = highHP.actionAttack(boss);
    gameSession.executeAction(action);

    expect(boss.getDamage()).to.equal(8);
  });

  /* Test disabled: inconsistent
  it('expect high templar kron to spawn prisoners when killing enemies', function() {
    const player1Deck = [
      {id: SDK.Cards.Boss.Boss17}
    ];

    const player2Deck = [
      {id: SDK.Cards.Faction1.General}
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;
    const mantis = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.PiercingMantis}, 1, 1, gameSession.getPlayer2Id());

    const action = boss.actionAttack(mantis);
    gameSession.executeAction(action);

    const prisoner = board.getUnitAtPosition({x:1, y:1});

    expect(prisoner.getATK()).to.equal(2);
    expect(prisoner.getHP()).to.equal(2);
    expect(prisoner.ownerId).to.equal('player1_id');
  });
  */

  it('expect high templar kron to have cheaper spells', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss17 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));

    const hand = player1.getDeck().getCardsInHand();
    expect(hand[0].getId()).to.equal(SDK.Cards.Spell.PhoenixFire);

    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
    gameSession.executeAction(playCardFromHandAction);

    expect(player1.getRemainingMana()).to.equal(9);
  });

  it('expect megapenti to make all minions he summons from hand have rebirth: serpenti', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss18 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.PiercingMantis }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
    playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);

    gameSession.executeAction(gameSession.actionEndTurn());
    gameSession.executeAction(gameSession.actionEndTurn());

    const serpenti = board.getUnitAtPosition({ x: 1, y: 1 });
    expect(serpenti.getId()).to.equal(SDK.Cards.Neutral.Serpenti);
  });

  it('expect rin the shadowsworn to spawn wraithlings with grow +1/+1 when taking damage', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss19 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);

    const wraithlings = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction4.Wraithling);
    expect(wraithlings[0].getHP()).to.equal(1);
    expect(wraithlings[0].getATK()).to.equal(1);
    expect(wraithlings[1].getHP()).to.equal(1);
    expect(wraithlings[1].getATK()).to.equal(1);

    gameSession.executeAction(gameSession.actionEndTurn());
    gameSession.executeAction(gameSession.actionEndTurn());

    expect(wraithlings.length).to.equal(2);
    expect(wraithlings[0].getHP()).to.equal(2);
    expect(wraithlings[0].getATK()).to.equal(2);
    expect(wraithlings[1].getHP()).to.equal(2);
    expect(wraithlings[1].getATK()).to.equal(2);
  });

  it('expect skyfall tyrant to equip frost armor at the beginning of every turn that reduces damage by 1 and returns 1 damage to the attacker', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss20 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;

    gameSession.executeAction(gameSession.actionEndTurn());
    gameSession.executeAction(gameSession.actionEndTurn());

    expect(gameSession.getGeneralForPlayer1().getArtifactModifiersGroupedByArtifactCard().length).to.equal(1);

    gameSession.executeAction(gameSession.actionEndTurn());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    const playCardFromHandAction = player2.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    expect(boss.getDamage()).to.equal(2);
    expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(1);
  });

  it('expect cindera to teleport randomly at the start of every turn', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss21 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;

    gameSession.executeAction(gameSession.actionEndTurn());
    gameSession.executeAction(gameSession.actionEndTurn());

    const oldSpot = board.getUnitAtPosition({ x: 0, y: 2 });
    expect(oldSpot).to.equal(undefined);
  });

  it('expect cindera to give all minions summoned dying wish: explode 2 damage to enemies', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss21 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AerialRift }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.PiercingMantis }));
    playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 1);
    gameSession.executeAction(playCardFromHandAction);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
    playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);

    expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(4);
  });

  it('expect crystalline champion to give all minions summoned +2/-2', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss22 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.WhistlingBlade }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);

    const blade = board.getUnitAtPosition({ x: 1, y: 1 });

    expect(blade.getHP()).to.equal(13);
    expect(blade.getATK()).to.equal(4);

    gameSession.executeAction(gameSession.actionEndTurn());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Neutral.Yun }));
    playCardFromHandAction = player2.actionPlayCardFromHand(0, 8, 1);
    gameSession.executeAction(playCardFromHandAction);

    const yun = board.getUnitAtPosition({ x: 8, y: 1 });
    expect(yun.getHP()).to.equal(2);
    expect(yun.getATK()).to.equal(7);
  });

  it('expect xel to damage enemy player at the end of their turn equal to total number of minions they own', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss23 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;

    gameSession.executeAction(gameSession.actionEndTurn());

    const mantis = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.PiercingMantis }, 1, 1, gameSession.getPlayer2Id());
    const mantis2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.PiercingMantis }, 3, 1, gameSession.getPlayer2Id());
    const mantis3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.PiercingMantis }, 4, 1, gameSession.getPlayer2Id());

    gameSession.executeAction(gameSession.actionEndTurn());

    expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(3);
  });

  it('expect xel to have deathwatch: deal 1 damage to enemy general, heal 1 health', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss23 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;

    const youngSilithar = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.YoungSilithar }, 0, 1, gameSession.getPlayer2Id());
    const abyssalCrawler1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalCrawler }, 1, 1, gameSession.getPlayer1Id());
    abyssalCrawler1.refreshExhaustion();

    youngSilithar.setDamage(2);
    gameSession.getGeneralForPlayer1().setDamage(5);

    const action = abyssalCrawler1.actionAttack(youngSilithar);
    gameSession.executeAction(action);

    expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(27);
    expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(23);
  });

  it('expect skurge to summon valiant when at 15 health or under and to then be immune to damage until valiant dies', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss24 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;

    boss.setDamage(9);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    const newBoss = UtilsSDK.getEntityOnBoardById(SDK.Cards.Boss.Boss24Valiant);
    expect(newBoss.getId()).to.equal(SDK.Cards.Boss.Boss24Valiant);

    expect(boss.getDamage()).to.equal(12);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    expect(boss.getDamage()).to.equal(12);

    newBoss.setDamage(14);
    const valiantPos = newBoss.getPosition();

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    playCardFromHandAction = player1.actionPlayCardFromHand(0, valiantPos.x, valiantPos.y);
    gameSession.executeAction(playCardFromHandAction);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    expect(boss.getDamage()).to.equal(15);
  });

  it('expect skurge to take 3 damage at the start of its turn and gain +1 attack', () => {
    const player1Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    const player2Deck = [
      { id: SDK.Cards.Boss.Boss24 },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer2();

    gameSession.executeAction(gameSession.actionEndTurn());

    expect(boss.getDamage()).to.equal(3);
    expect(boss.getATK()).to.equal(2);
  });

  it('expect shadow lord to give friendly minions +1/+1 when they move', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss25 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;

    boss.setDamage(9);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.SaberspineTiger }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);

    const tiger = board.getUnitAtPosition({ x: 1, y: 1 });

    const action = tiger.actionMove({ x: 3, y: 1 });
    gameSession.executeAction(action);
    expect(tiger.getATK()).to.equal(4);
    expect(tiger.getHP()).to.equal(3);
  });

  it('expect shadow lord to summon a kaido assassin behind enemy minions when they move', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss25 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    gameSession.executeAction(gameSession.actionEndTurn());

    player2.remainingMana = 9;

    boss.setDamage(9);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Neutral.SaberspineTiger }));
    const playCardFromHandAction = player2.actionPlayCardFromHand(0, 7, 1);
    gameSession.executeAction(playCardFromHandAction);

    const tiger = board.getUnitAtPosition({ x: 7, y: 1 });

    const action = tiger.actionMove({ x: 5, y: 1 });
    gameSession.executeAction(action);

    const kaido = board.getUnitAtPosition({ x: 6, y: 1 });
    expect(kaido.getBaseCardId()).to.equal(SDK.Cards.Faction2.KaidoAssassin);
  });

  it('expect archmagus vol to damage all enemy minions when he attacks', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss26 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;

    const golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 1, 1, gameSession.getPlayer2Id());
    const golem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 4, 1, gameSession.getPlayer2Id());
    const golem3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 6, 1, gameSession.getPlayer1Id());

    const action = boss.actionAttack(golem);
    gameSession.executeAction(action);

    expect(golem.getDamage()).to.equal(2);
    expect(golem2.getDamage()).to.equal(2);
    expect(golem3.getDamage()).to.equal(0);
  });

  it('expect zane to deal double damage to vol', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss26 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;

    const zane = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Boss.Boss26Companion }, 1, 1, gameSession.getPlayer2Id());

    gameSession.executeAction(gameSession.actionEndTurn());

    expect(boss.getDamage()).to.equal(6);
  });

  it('expect zane to die if his attack exceeds 6 and then for zanes general to die', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss26 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;

    const zane = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Boss.Boss26Companion }, 1, 1, gameSession.getPlayer2Id());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.LastingJudgement }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);

    expect(zane.getIsRemoved()).to.equal(false);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.LastingJudgement }));
    playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);

    expect(zane.getIsRemoved()).to.equal(true);
    expect(gameSession.getGeneralForPlayer2().getIsRemoved()).to.equal(true);
  });

  it('expect taskmaster beatrix to make both generals unable to move', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss27 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;

    let action = boss.actionMove({ x: 2, y: 2 });
    gameSession.executeAction(action);

    expect(action.getIsValid()).to.equal(false);

    gameSession.executeAction(gameSession.actionEndTurn());

    action = gameSession.getGeneralForPlayer2().actionMove({ x: 6, y: 2 });
    gameSession.executeAction(action);

    expect(action.getIsValid()).to.equal(false);
  });

  it('expect taskmaster beatrix to make all minions behave like battle pets', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss27 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.RockPulverizer }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);

    const rocky = board.getUnitAtPosition({ x: 1, y: 1 });

    gameSession.executeAction(gameSession.actionEndTurn());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Neutral.RockPulverizer }));
    playCardFromHandAction = player2.actionPlayCardFromHand(0, 7, 1);
    gameSession.executeAction(playCardFromHandAction);

    const rocky2 = board.getUnitAtPosition({ x: 7, y: 1 });

    gameSession.executeAction(gameSession.actionEndTurn());

    expect(rocky.getPosition().x !== 1 || rocky.getPosition().y !== 1).to.equal(true);

    gameSession.executeAction(gameSession.actionEndTurn());

    expect(rocky2.getPosition().x !== 7 || rocky2.getPosition().y !== 1).to.equal(true);
  });

  it('expect grym to deal 3 damage to a random minion and to heal 3 whenever a friendly minion dies', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss28 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;

    const rocky = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.RockPulverizer }, 1, 1, gameSession.getPlayer1Id());
    const rocky2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.RockPulverizer }, 3, 1, gameSession.getPlayer1Id());
    const rocky3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.RockPulverizer }, 5, 1, gameSession.getPlayer2Id());

    boss.setDamage(5);
    rocky.setDamage(3);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);

    const totalDamage = rocky2.getDamage() + rocky3.getDamage();

    expect(totalDamage).to.equal(3);

    expect(boss.getDamage()).to.equal(2);
  });

  it('expect nahlgol to summon a sand tile randomly at the start of their turn', () => {
    const player1Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    const player2Deck = [
      { id: SDK.Cards.Boss.Boss29 },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;

    gameSession.executeAction(gameSession.actionEndTurn());

    const sand = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Tile.SandPortal);
    expect(sand.length).to.equal(1);
  });

  it('expect wolfpunch to gain +4 attack on opponents turn and to summon a fox ravager nearby', () => {
    const player1Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    const player2Deck = [
      { id: SDK.Cards.Boss.Boss30 },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer2();

    player1.remainingMana = 9;

    expect(boss.getATK()).to.equal(6);

    gameSession.executeAction(gameSession.actionEndTurn());

    expect(boss.getATK()).to.equal(2);

    const fox = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction6.WolfAspect);
    expect(fox.length).to.equal(1);
  });

  it('expect unhallowed to spawn a random haunt whenever she takes damage', () => {
    const player1Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    const player2Deck = [
      { id: SDK.Cards.Boss.Boss31 },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer2();

    player1.remainingMana = 9;

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
    gameSession.executeAction(playCardFromHandAction);

    const haunt1 = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Boss.Boss31Haunt1);
    const haunt2 = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Boss.Boss31Haunt2);
    const haunt3 = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Boss.Boss31Haunt3);
    const hauntcount = haunt1.length + haunt2.length + haunt3.length;
    expect(hauntcount).to.equal(1);
  });

  it('expect the first candy panda to give +5 health and draw a card when the general attacks', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss31 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Boss.Boss31Treat1 }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);

    const rocky = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.RockPulverizer }, 7, 1, gameSession.getPlayer1Id());

    gameSession.executeAction(gameSession.actionEndTurn());

    gameSession.getGeneralForPlayer2().setDamage(10);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Neutral.RockPulverizer }));

    const action = gameSession.getGeneralForPlayer2().actionAttack(rocky);
    gameSession.executeAction(action);

    const treat = board.getUnitAtPosition({ x: 1, y: 1 });

    expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(6);
    expect(treat.getHP()).to.equal(2);
    expect(treat.getATK()).to.equal(3);
    const hand = player2.getDeck().getCardsInHand();
    expect(hand[0].getId()).to.equal(SDK.Cards.Neutral.RockPulverizer);
  });

  it('expect the second candy panda to give +2/+2 to the minion that triggers the flip and to draw a card', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss31 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Boss.Boss31Treat2 }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);

    gameSession.executeAction(gameSession.actionEndTurn());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Neutral.RockPulverizer }));

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Neutral.RockPulverizer }));
    playCardFromHandAction = player2.actionPlayCardFromHand(0, 7, 1);
    gameSession.executeAction(playCardFromHandAction);

    const treat = board.getUnitAtPosition({ x: 1, y: 1 });
    const rocky = board.getUnitAtPosition({ x: 7, y: 1 });

    expect(rocky.getHP()).to.equal(6);
    expect(rocky.getATK()).to.equal(3);
    expect(treat.getHP()).to.equal(2);
    expect(treat.getATK()).to.equal(3);
    const hand = player2.getDeck().getCardsInHand();
    expect(hand[0].getId()).to.equal(SDK.Cards.Neutral.RockPulverizer);
  });

  it('expect the third candy panda to refund the mana of the spell that was cast and to draw a card', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss31 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer1();

    player1.remainingMana = 9;

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Boss.Boss31Treat3 }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);

    gameSession.executeAction(gameSession.actionEndTurn());
    player2.remainingMana = 9;

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Neutral.RockPulverizer }));

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    playCardFromHandAction = player2.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    const treat = board.getUnitAtPosition({ x: 1, y: 1 });

    expect(player2.getRemainingMana()).to.equal(9);
    expect(treat.getHP()).to.equal(2);
    expect(treat.getATK()).to.equal(3);
    const hand = player2.getDeck().getCardsInHand();
    expect(hand[0].getId()).to.equal(SDK.Cards.Neutral.RockPulverizer);
  });

  it('expect the corporeal haunt to make the enemy generals minions cost 1 more to play and to draw 2 cards on death', () => {
    const player1Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    const player2Deck = [
      { id: SDK.Cards.Boss.Boss31 },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer2();

    player1.remainingMana = 9;

    const haunt = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Boss.Boss31Haunt1 }, 7, 1, gameSession.getPlayer1Id());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.RockPulverizer }));
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.RockPulverizer }));
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.RockPulverizer }));

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Faction1.WindbladeAdept }));
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Artifact.StaffOfYKir }));

    let hand = player2.getDeck().getCardsInHand();
    expect(hand[0].getManaCost()).to.equal(2);
    expect(hand[1].getManaCost()).to.equal(3);
    expect(hand[2].getManaCost()).to.equal(2);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 1);
    gameSession.executeAction(playCardFromHandAction);

    hand = player1.getDeck().getCardsInHand();
    expect(hand[0].getBaseCardId()).to.equal(SDK.Cards.Neutral.RockPulverizer);
    expect(hand[1].getBaseCardId()).to.equal(SDK.Cards.Neutral.RockPulverizer);
    expect(hand[2]).to.equal(undefined);
  });

  it('expect the enchanted haunt to make the enemy generals spells cost 1 more to play and to draw 2 cards on death', () => {
    const player1Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    const player2Deck = [
      { id: SDK.Cards.Boss.Boss31 },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer2();

    player1.remainingMana = 9;

    const haunt = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Boss.Boss31Haunt2 }, 7, 1, gameSession.getPlayer1Id());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.RockPulverizer }));
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.RockPulverizer }));
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.RockPulverizer }));

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Faction1.WindbladeAdept }));
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Artifact.StaffOfYKir }));

    let hand = player2.getDeck().getCardsInHand();
    expect(hand[0].getManaCost()).to.equal(3);
    expect(hand[1].getManaCost()).to.equal(2);
    expect(hand[2].getManaCost()).to.equal(2);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 1);
    gameSession.executeAction(playCardFromHandAction);

    hand = player1.getDeck().getCardsInHand();
    expect(hand[0].getBaseCardId()).to.equal(SDK.Cards.Neutral.RockPulverizer);
    expect(hand[1].getBaseCardId()).to.equal(SDK.Cards.Neutral.RockPulverizer);
    expect(hand[2]).to.equal(undefined);
  });

  it('expect the material haunt to make the enemy generals artifacts cost 1 more to play and to draw 2 cards on death', () => {
    const player1Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    const player2Deck = [
      { id: SDK.Cards.Boss.Boss31 },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer2();

    player1.remainingMana = 9;

    const haunt = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Boss.Boss31Haunt3 }, 7, 1, gameSession.getPlayer1Id());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.RockPulverizer }));
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.RockPulverizer }));
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.RockPulverizer }));

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Faction1.WindbladeAdept }));
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Artifact.StaffOfYKir }));

    let hand = player2.getDeck().getCardsInHand();
    expect(hand[0].getManaCost()).to.equal(2);
    expect(hand[1].getManaCost()).to.equal(2);
    expect(hand[2].getManaCost()).to.equal(3);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 1);
    gameSession.executeAction(playCardFromHandAction);

    hand = player1.getDeck().getCardsInHand();
    expect(hand[0].getBaseCardId()).to.equal(SDK.Cards.Neutral.RockPulverizer);
    expect(hand[1].getBaseCardId()).to.equal(SDK.Cards.Neutral.RockPulverizer);
    expect(hand[2]).to.equal(undefined);
  });

  it('expect santaur to spawn a frostfire elf at the start of his turn and to give the player a present spell when those die', () => {
    const player1Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    const player2Deck = [
      { id: SDK.Cards.Boss.Boss32 },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer2();

    gameSession.executeAction(gameSession.actionEndTurn());

    const elf = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Boss.Boss32_2);
    expect(elf.length).to.equal(1);

    gameSession.executeAction(gameSession.actionEndTurn());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, elf[0].getPosition().x, elf[0].getPosition().y);
    gameSession.executeAction(playCardFromHandAction);

    const hand = player1.getDeck().getCardsInHand();
    expect(hand[0].getBaseCardId()).to.equal(SDK.Cards.BossSpell.HolidayGift);

    playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 1);
    gameSession.executeAction(playCardFromHandAction);

    expect(gameSession.getGeneralForPlayer1().getArtifactModifiersGroupedByArtifactCard().length).to.equal(1);
  });

  it('expect jingle bells to give your general flying', () => {
    const player1Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    const player2Deck = [
      { id: SDK.Cards.Boss.Boss32 },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer2();

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.BossArtifact.FlyingBells }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 1);
    gameSession.executeAction(playCardFromHandAction);

    expect(gameSession.getGeneralForPlayer1().hasModifierClass(SDK.ModifierFlying)).to.equal(true);
  });

  it('expect lump of coal to block you from casting your bbs', () => {
    const player1Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    const player2Deck = [
      { id: SDK.Cards.Boss.Boss32 },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer2();

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.BossArtifact.Coal }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 1);
    gameSession.executeAction(playCardFromHandAction);

    const squire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer1Id());

    // cycle turns until you can use bloodborn spell
    gameSession.executeAction(gameSession.actionEndTurn());
    gameSession.executeAction(gameSession.actionEndTurn());
    gameSession.executeAction(gameSession.actionEndTurn());
    gameSession.executeAction(gameSession.actionEndTurn());

    const action = player1.actionPlaySignatureCard(1, 1);
    gameSession.executeAction(action);
    expect(action.getIsValid()).to.equal(false);

    expect(squire.getHP()).to.equal(4);
    expect(squire.getATK()).to.equal(1);
  });

  it('expect mistletoe to reduce the mana of all cards in your hand by 1', () => {
    const player1Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    const player2Deck = [
      { id: SDK.Cards.Boss.Boss32 },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer2();

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.WindbladeAdept }));
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.StaffOfYKir }));

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.BossArtifact.CostReducer }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(3, 7, 1);
    gameSession.executeAction(playCardFromHandAction);

    const hand = player1.getDeck().getCardsInHand();
    expect(hand[0].getManaCost()).to.equal(1);
    expect(hand[1].getManaCost()).to.equal(1);
    expect(hand[2].getManaCost()).to.equal(1);
  });

  it('expect snowball to give your general ranged and -1 attack', () => {
    const player1Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    const player2Deck = [
      { id: SDK.Cards.Boss.Boss32 },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer2();

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.BossArtifact.Snowball }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 1);
    gameSession.executeAction(playCardFromHandAction);

    expect(gameSession.getGeneralForPlayer1().hasModifierClass(SDK.ModifierRanged)).to.equal(true);
    expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(1);
  });

  it('expect legion heal clone to heal itself and allies at end of turn for 3', () => {
    const player1Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    const player2Deck = [
      { id: SDK.Cards.Boss.Boss33 },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer2();

    const cornerBlock = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 0, 0, gameSession.getPlayer1Id());
    const cornerBlock2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 0, 4, gameSession.getPlayer1Id());
    const cornerBlock3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 8, 0, gameSession.getPlayer1Id());
    const cornerBlock4 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 8, 4, gameSession.getPlayer1Id());
    const clone = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Boss.Boss33_2 }, 1, 1, gameSession.getPlayer2Id());

    boss.setDamage(7);
    gameSession.executeAction(gameSession.actionEndTurn());
    gameSession.executeAction(gameSession.actionEndTurn());
    expect(boss.getDamage()).to.equal(4);
    boss.setDamage(7);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
    gameSession.executeAction(playCardFromHandAction);

    const healclone = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Boss.Boss33_1 }, 5, 1, gameSession.getPlayer2Id());
    const clone2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Boss.Boss33_3 }, 3, 1, gameSession.getPlayer2Id());

    gameSession.executeAction(gameSession.actionEndTurn());
    gameSession.executeAction(gameSession.actionEndTurn());

    player1.remainingMana = 9;

    healclone.setDamage(6);
    clone.setDamage(6);
    clone2.setDamage(6);
    expect(healclone.getDamage()).to.equal(6);
    expect(clone.getDamage()).to.equal(6);
    gameSession.executeAction(gameSession.actionEndTurn());
    gameSession.executeAction(gameSession.actionEndTurn());
    expect(clone2.getDamage()).to.equal(3); // heal other non-general clone
    expect(clone.getDamage()).to.equal(3); // heal new general
    expect(healclone.getDamage()).to.equal(3); // heal self
  });

  it('expect legion attack clone to give +2 attack to itself and allies (and general control swaps to clone on death)', () => {
    const player1Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    const player2Deck = [
      { id: SDK.Cards.Boss.Boss33 },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer2();
    player1.remainingMana = 9;

    const cornerBlock = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 0, 0, gameSession.getPlayer1Id());
    const cornerBlock2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 0, 4, gameSession.getPlayer1Id());
    const cornerBlock3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 8, 0, gameSession.getPlayer1Id());
    const cornerBlock4 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 8, 4, gameSession.getPlayer1Id());
    const clone = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Boss.Boss33_2 }, 1, 1, gameSession.getPlayer2Id());

    clone.setDamage(7);

    expect(clone.getATK()).to.equal(4);
    expect(boss.getATK()).to.equal(4);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);

    expect(boss.getATK()).to.equal(2);

    const newclone = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Boss.Boss33_2 }, 1, 1, gameSession.getPlayer2Id());

    expect(newclone.getATK()).to.equal(4);
    expect(boss.getATK()).to.equal(4);

    boss.setDamage(7);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
    gameSession.executeAction(playCardFromHandAction);

    expect(newclone.getATK()).to.equal(4);
    expect(newclone.getIsGeneral()).to.equal(true);
  });

  it('expect legion to resummon its fallen clones in corners at the start of turn', () => {
    const player1Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    const player2Deck = [
      { id: SDK.Cards.Boss.Boss33 },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer2();

    gameSession.executeAction(gameSession.actionEndTurn());

    const corner1 = board.getUnitAtPosition({ x: 0, y: 0 });
    const corner2 = board.getUnitAtPosition({ x: 8, y: 0 });
    const corner3 = board.getUnitAtPosition({ x: 0, y: 4 });
    const corner4 = board.getUnitAtPosition({ x: 8, y: 4 });

    let totalClones = 0;
    if (corner1 !== undefined && (corner1.getBaseCardId() === SDK.Cards.Boss.Boss33_2 || corner1.getBaseCardId() === SDK.Cards.Boss.Boss33_3 || corner1.getBaseCardId() === SDK.Cards.Boss.Boss33_4)) {
      totalClones++;
    }
    if (corner2 !== undefined && (corner2.getBaseCardId() === SDK.Cards.Boss.Boss33_2 || corner2.getBaseCardId() === SDK.Cards.Boss.Boss33_3 || corner2.getBaseCardId() === SDK.Cards.Boss.Boss33_4)) {
      totalClones++;
    }
    if (corner3 !== undefined && (corner3.getBaseCardId() === SDK.Cards.Boss.Boss33_2 || corner3.getBaseCardId() === SDK.Cards.Boss.Boss33_3 || corner3.getBaseCardId() === SDK.Cards.Boss.Boss33_4)) {
      totalClones++;
    }
    if (corner4 !== undefined && (corner4.getBaseCardId() === SDK.Cards.Boss.Boss33_2 || corner4.getBaseCardId() === SDK.Cards.Boss.Boss33_3 || corner4.getBaseCardId() === SDK.Cards.Boss.Boss33_4)) {
      totalClones++;
    }

    expect(totalClones).to.equal(3);
  });

  it('expect harmony to make all minions cost 0 mana', () => {
    const player1Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    const player2Deck = [
      { id: SDK.Cards.Boss.Boss34 },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer2();
    player1.remainingMana = 9;

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.WindbladeAdept }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);

    expect(player1.getRemainingMana()).to.equal(9);

    gameSession.executeAction(gameSession.actionEndTurn());

    player2.remainingMana = 9;
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Faction1.WindbladeAdept }));
    playCardFromHandAction = player2.actionPlayCardFromHand(0, 7, 1);
    gameSession.executeAction(playCardFromHandAction);

    expect(player2.getRemainingMana()).to.equal(9);
  });

  it('expect harmony to become dissonance when killed and to flip all minion allegiances', () => {
    const player1Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    const player2Deck = [
      { id: SDK.Cards.Boss.Boss34 },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer2();
    player1.remainingMana = 9;
    boss.setDamage(24);

    const cornerBlock = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 0, 0, gameSession.getPlayer1Id());
    const cornerBlock2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 0, 4, gameSession.getPlayer2Id());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
    gameSession.executeAction(playCardFromHandAction);

    const dissonance = UtilsSDK.getEntityOnBoardById(SDK.Cards.Boss.Boss34_2);
    expect(cornerBlock.getOwnerId()).to.equal('player2_id');
    expect(cornerBlock2.getOwnerId()).to.equal('player1_id');
  });

  /* Test disabled: inconsistent
  it('expect andromeda to transform all minions you play into random minions of the same cost', function() {
    const player1Deck = [
      {id: SDK.Cards.Faction1.General}
    ];

    const player2Deck = [
      {id: SDK.Cards.Boss.Boss35}
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer2();

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.WindbladeAdept}));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);

    const notWindblade = board.getUnitAtPosition({x:1,y:1});
    expect(notWindblade.getId()).to.not.equal(SDK.Cards.Faction1.WindbladeAdept);
    expect(notWindblade.getManaCost()).to.equal(2);
  });
  */

  it('expect soulstealer to transform the last minion played into your general', () => {
    const player1Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    const player2Deck = [
      { id: SDK.Cards.Boss.Boss37 },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer2();

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.WindbladeAdept }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);

    const notWindblade = board.getUnitAtPosition({ x: 1, y: 1 });
    expect(notWindblade.getIsGeneral()).to.equal(true);
  });

  it('expect soulstealer to give one of his minions general status whenever he dies', () => {
    const player1Deck = [
      { id: SDK.Cards.Boss.Boss37 },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    player1.remainingMana = 9;

    gameSession.getGeneralForPlayer1().setDamage(29);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.WindbladeAdept }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);

    const notWindblade = board.getUnitAtPosition({ x: 1, y: 1 });
    expect(notWindblade.getIsGeneral()).to.equal(false);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
    gameSession.executeAction(playCardFromHandAction);

    expect(notWindblade.getIsGeneral()).to.equal(true);
  });

  it('expect spell eater to gain a keyword when the enemy casts a spell', () => {
    const player1Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    const player2Deck = [
      { id: SDK.Cards.Boss.Boss38 },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer2();

    const startingModifiers = boss.getModifiers().length;

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
    gameSession.executeAction(playCardFromHandAction);

    const endingModifiers = boss.getModifiers().length;

    expect(endingModifiers).to.be.above(startingModifiers);
  });

  it('expect spell eater to give all summoned minions their generals keywords', () => {
    const player1Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    const player2Deck = [
      { id: SDK.Cards.Boss.Boss38 },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    const boss = gameSession.getGeneralForPlayer2();

    const startingModifiers = boss.getModifiers().length;

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.BossArtifact.FlyingBells }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 1);
    gameSession.executeAction(playCardFromHandAction);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.WindbladeAdept }));
    playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);

    const notWindblade = board.getUnitAtPosition({ x: 1, y: 1 });

    expect(notWindblade.hasModifierClass(SDK.ModifierFlying)).to.equal(true);
  });
});
