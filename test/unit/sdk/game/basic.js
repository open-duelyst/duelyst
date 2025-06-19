const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../'));
require('coffeescript/register');

const _ = require('underscore');
const Promise = require('bluebird');
const { expect } = require('chai');

const CONFIG = require('../../../../app/common/config');
const Logger = require('../../../../app/common/logger.coffee');
const SDK = require('../../../../app/sdk.coffee');
const UtilsSDK = require('../../../utils/utils_sdk');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('basic', () => {
  beforeEach(() => {
    // define test decks.  Spells do not work.  Only add minions and generals this way
    const player1Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction2.General },
    ];

    // setup test session
    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    /* // USE THIS TO GET THE CURRENT CARDS IN YOUR HAND
      const deck = player1.getDeck();
       Logger.module("UNITTEST").log(deck.getCardsInHand(1));
      */
  });

  afterEach(() => {
    SDK.GameSession.reset();
  });

  it('expect to attack with a melee unit who has moved', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();

    const windbladeAdept = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.WindbladeAdept }, 0, 1, gameSession.getPlayer1Id());
    const windbladeAdept2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.WindbladeAdept }, 3, 1, gameSession.getPlayer2Id());

    windbladeAdept.refreshExhaustion();
    let action = windbladeAdept.actionMove({ x: 2, y: 1 });
    gameSession.executeAction(action);
    action = windbladeAdept.actionAttack(windbladeAdept2);
    gameSession.executeAction(action);
    expect(windbladeAdept2.getDamage()).to.equal(2);
    expect(windbladeAdept.getDamage()).to.equal(2);
  });

  it('expect to not be able to attack when out of range', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();

    const windbladeAdept = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.WindbladeAdept }, 0, 1, gameSession.getPlayer1Id());
    const windbladeAdept2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.WindbladeAdept }, 3, 1, gameSession.getPlayer2Id());

    windbladeAdept.refreshExhaustion();
    let action = windbladeAdept.actionMove({ x: 1, y: 1 });
    gameSession.executeAction(action);
    action = windbladeAdept.actionAttack(windbladeAdept2);
    gameSession.executeAction(action);
    expect(windbladeAdept2.getDamage()).to.equal(0);
    expect(windbladeAdept.getDamage()).to.equal(0);
  });

  it('expect blast to damage all enemies in a vertical line', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();

    const pyromancer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Pyromancer }, 1, 0, gameSession.getPlayer1Id());
    const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 1, 4, gameSession.getPlayer2Id());
    const brightmossGolem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 1, 3, gameSession.getPlayer2Id());

    pyromancer.refreshExhaustion();
    const action = pyromancer.actionAttack(brightmossGolem);
    gameSession.executeAction(action);

    expect(brightmossGolem.getDamage()).to.equal(2);
    expect(brightmossGolem2.getDamage()).to.equal(2);
  });

  it('expect to not be able to attack again after already attacking', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();

    const windbladeAdept = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.WindbladeAdept }, 0, 1, gameSession.getPlayer1Id());
    const windbladeAdept2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.WindbladeAdept }, 3, 1, gameSession.getPlayer2Id());

    windbladeAdept.refreshExhaustion();
    let action = windbladeAdept.actionMove({ x: 2, y: 1 });
    gameSession.executeAction(action);
    action = windbladeAdept.actionAttack(windbladeAdept2);
    gameSession.executeAction(action);
    action = windbladeAdept.actionAttack(windbladeAdept2);
    gameSession.executeAction(action);
    expect(windbladeAdept2.getDamage()).to.equal(2);
    expect(windbladeAdept.getDamage()).to.equal(2);
  });

  it('expect flying to allow a unit to move across the map', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();

    let flameWing = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.FlameWing }, 0, 1, gameSession.getPlayer1Id());

    flameWing.refreshExhaustion();
    const action = flameWing.actionMove({ x: 6, y: 2 });
    gameSession.executeAction(action);

    flameWing = board.getUnitAtPosition({ x: 6, y: 2 });

    expect(flameWing.getId()).to.equal(SDK.Cards.Neutral.FlameWing);
  });

  it('expect to not be able to move out of range', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();

    let windbladeAdept = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.WindbladeAdept }, 0, 1, gameSession.getPlayer1Id());

    windbladeAdept.refreshExhaustion();
    const action = windbladeAdept.actionMove({ x: 4, y: 1 });
    gameSession.executeAction(action);

    windbladeAdept = board.getUnitAtPosition({ x: 4, y: 1 });

    expect(windbladeAdept).to.equal(undefined);
  });

  it('expect to not be able to move through an enemy unit', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();

    let windbladeAdept = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.WindbladeAdept }, 0, 1, gameSession.getPlayer1Id());
    const windbladeAdept2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.WindbladeAdept }, 1, 1, gameSession.getPlayer2Id());

    windbladeAdept.refreshExhaustion();
    const action = windbladeAdept.actionMove({ x: 2, y: 1 });
    gameSession.executeAction(action);
    windbladeAdept = board.getUnitAtPosition({ x: 2, y: 1 });

    expect(windbladeAdept).to.equal(undefined);
  });

  it('expect to not be albe to move a unit that has already moved', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();

    let windbladeAdept = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.WindbladeAdept }, 0, 1, gameSession.getPlayer1Id());

    windbladeAdept.refreshExhaustion();
    let action = windbladeAdept.actionMove({ x: 2, y: 1 });
    gameSession.executeAction(action);
    action = windbladeAdept.actionMove({ x: 4, y: 1 });
    gameSession.executeAction(action);
    windbladeAdept = board.getUnitAtPosition({ x: 4, y: 1 });

    expect(windbladeAdept).to.equal(undefined);
  });

  it('expect to not be able to move after a unit has already attacked', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();

    let windbladeAdept = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.WindbladeAdept }, 1, 1, gameSession.getPlayer1Id());
    const windbladeAdept2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.WindbladeAdept }, 0, 1, gameSession.getPlayer2Id());

    windbladeAdept.refreshExhaustion();
    let action = windbladeAdept.actionAttack(windbladeAdept2);
    gameSession.executeAction(action);
    action = windbladeAdept.actionMove({ x: 3, y: 1 });
    gameSession.executeAction(action);
    windbladeAdept = board.getUnitAtPosition({ x: 3, y: 1 });

    expect(windbladeAdept).to.equal(undefined);
  });

  it('expect to not be able to play a unit from hand out of range', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();

    player1.remainingMana = 9;

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.WindbladeAdept }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 5, 3);
    gameSession.executeAction(playCardFromHandAction);

    const windbladeAdept = board.getUnitAtPosition({ x: 5, y: 3 });

    expect(windbladeAdept).to.equal(undefined);
  });

  it('expect a valid card with an invalid follow-up action to fail', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();

    gameSession.executeAction(gameSession.actionEndTurn());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Artifact.StaffOfYKir }));
    UtilsSDK.executeActionWithoutValidation(player2.actionPlayCardFromHand(0, 1, 1));

    gameSession.executeAction(gameSession.actionEndTurn());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.RashasCurse }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
    gameSession.executeAction(playCardFromHandAction);
    const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
    const followupAction = player1.actionPlayFollowup(followupCard, 5, 3);
    gameSession.executeAction(followupAction);

    const dervish = board.getUnitAtPosition({ x: 5, y: 3 });
    expect(dervish).to.equal(undefined);
  });

  it('expect mana to be returned correctly if canceling a follow-up on a mana orb', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    let player1 = gameSession.getPlayer1();

    player1.remainingMana = 3;

    const action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
    gameSession.executeAction(action);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.WraithlingSwarm }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 1);
    gameSession.executeAction(playCardFromHandAction);
    const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
    const followupAction = player1.actionPlayFollowup(followupCard, 4, 0);
    gameSession.executeAction(followupAction);
    expect(gameSession.getRollbackSnapshotData()).to.exist;
    const endFollowUp = gameSession.actionRollbackSnapshot();
    gameSession.executeAction(endFollowUp);

    player1 = gameSession.getPlayer1();

    expect(player1.getRemainingMana()).to.equal(3);
  });

  it('expect blast units to still have blast after canceling a follow-up', () => {
    const gameSession = SDK.GameSession.getInstance();
    let board = gameSession.getBoard();
    let player1 = gameSession.getPlayer1();

    player1.remainingMana = 9;

    let pyromancer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Pyromancer }, 3, 2, gameSession.getPlayer1Id());

    let action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
    gameSession.executeAction(action);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.WraithlingSwarm }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 1);
    gameSession.executeAction(playCardFromHandAction);
    const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
    const followupAction = player1.actionPlayFollowup(followupCard, 4, 0);
    gameSession.executeAction(followupAction);
    expect(gameSession.getRollbackSnapshotData()).to.exist;
    const endFollowUp = gameSession.actionRollbackSnapshot();
    gameSession.executeAction(endFollowUp);

    player1 = gameSession.getPlayer1();
    board = gameSession.getBoard();

    pyromancer = board.getUnitAtPosition({ x: 3, y: 2 });
    pyromancer.refreshExhaustion();

    action = pyromancer.actionAttack(gameSession.getGeneralForPlayer2());
    gameSession.executeAction(action);

    expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(2);
  });

  it('expect buffed units to still have buffs after canceling a follow-up', () => {
    const gameSession = SDK.GameSession.getInstance();
    let board = gameSession.getBoard();
    let player1 = gameSession.getPlayer1();

    player1.remainingMana = 9;

    let pyromancer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Pyromancer }, 3, 2, gameSession.getPlayer1Id());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ScionsFirstWish }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 2);
    gameSession.executeAction(playCardFromHandAction);

    const action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
    gameSession.executeAction(action);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.WraithlingSwarm }));
    playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 1);
    gameSession.executeAction(playCardFromHandAction);
    const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
    const followupAction = player1.actionPlayFollowup(followupCard, 4, 0);
    gameSession.executeAction(followupAction);
    expect(gameSession.getRollbackSnapshotData()).to.exist;
    const endFollowUp = gameSession.actionRollbackSnapshot();
    gameSession.executeAction(endFollowUp);

    player1 = gameSession.getPlayer1();
    board = gameSession.getBoard();
    pyromancer = board.getUnitAtPosition({ x: 3, y: 2 });

    expect(pyromancer.getATK()).to.equal(3);
    expect(pyromancer.getHP()).to.equal(2);
  });

  it('expect zealed units to still have zeal buffs after canceling a follow-up', () => {
    const gameSession = SDK.GameSession.getInstance();
    let board = gameSession.getBoard();
    let player1 = gameSession.getPlayer1();

    player1.remainingMana = 9;

    let windbladeAdept = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.WindbladeAdept }, 3, 2, gameSession.getPlayer1Id());

    const action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
    gameSession.executeAction(action);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.WraithlingSwarm }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 1);
    gameSession.executeAction(playCardFromHandAction);
    const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
    const followupAction = player1.actionPlayFollowup(followupCard, 4, 0);
    gameSession.executeAction(followupAction);
    expect(gameSession.getRollbackSnapshotData()).to.exist;
    const endFollowUp = gameSession.actionRollbackSnapshot();
    gameSession.executeAction(endFollowUp);

    player1 = gameSession.getPlayer1();
    board = gameSession.getBoard();

    windbladeAdept = board.getUnitAtPosition({ x: 3, y: 2 });

    expect(windbladeAdept.hasActiveModifierClass(SDK.ModifierBanded)).to.equal(true);
    expect(windbladeAdept.getATK()).to.equal(3);
    expect(windbladeAdept.getHP()).to.equal(3);
  });

  it('expect players to have correct mana progression until reaching max mana', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();

    gameSession.executeAction(gameSession.actionEndTurn());
    expect(player1.remainingMana).to.equal(2);
    gameSession.executeAction(gameSession.actionEndTurn());
    expect(player2.remainingMana).to.equal(3);
    gameSession.executeAction(gameSession.actionEndTurn());
    expect(player1.remainingMana).to.equal(3);
    gameSession.executeAction(gameSession.actionEndTurn());
    expect(player2.remainingMana).to.equal(4);
    gameSession.executeAction(gameSession.actionEndTurn());
    expect(player1.remainingMana).to.equal(4);
    gameSession.executeAction(gameSession.actionEndTurn());
    expect(player2.remainingMana).to.equal(5);
    gameSession.executeAction(gameSession.actionEndTurn());
    expect(player1.remainingMana).to.equal(5);
    gameSession.executeAction(gameSession.actionEndTurn());
    expect(player2.remainingMana).to.equal(6);
    gameSession.executeAction(gameSession.actionEndTurn());
    expect(player1.remainingMana).to.equal(6);
    gameSession.executeAction(gameSession.actionEndTurn());
    expect(player2.remainingMana).to.equal(7);
    gameSession.executeAction(gameSession.actionEndTurn());
    expect(player1.remainingMana).to.equal(7);
    gameSession.executeAction(gameSession.actionEndTurn());
    expect(player2.remainingMana).to.equal(8);
    gameSession.executeAction(gameSession.actionEndTurn());
    expect(player1.remainingMana).to.equal(8);
    gameSession.executeAction(gameSession.actionEndTurn());
    expect(player2.remainingMana).to.equal(9);
    gameSession.executeAction(gameSession.actionEndTurn());
    expect(player1.remainingMana).to.equal(9);
    gameSession.executeAction(gameSession.actionEndTurn());
    expect(player2.remainingMana).to.equal(9);
    gameSession.executeAction(gameSession.actionEndTurn());
    expect(player1.remainingMana).to.equal(9);
    gameSession.executeAction(gameSession.actionEndTurn());
    expect(player2.remainingMana).to.equal(9);
  });

  it('expect explicit draw actions to fail', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.WraithlingSwarm }));

    const draw = player1.getDeck().actionDrawCard();
    gameSession.executeAction(draw);

    const hand = player1.getDeck().getCardsInHand();
    const cardDraw = hand[0];

    expect(cardDraw).to.equal(undefined);
  });

  it('expect eggs to grant rush when hatching', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    player1.remainingMana = 9;

    let veteranSilithar = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.VeteranSilithar }, 7, 2, gameSession.getPlayer1Id());

    veteranSilithar.setDamage(2);
    veteranSilithar.refreshExhaustion();
    let action = veteranSilithar.actionAttack(gameSession.getGeneralForPlayer2());
    gameSession.executeAction(action);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.EggMorph }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
    gameSession.executeAction(playCardFromHandAction);

    veteranSilithar = board.getUnitAtPosition({ x: 7, y: 2 });

    action = veteranSilithar.actionMove({ x: 6, y: 3 });
    gameSession.executeAction(action);

    expect(veteranSilithar.getPosition().x).to.equal(6);
    expect(veteranSilithar.getPosition().y).to.equal(3);
  });

  it('expect hailstone prison on a newly hatched minion to lose rush when played again', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    player1.remainingMana = 90;

    let veteranSilithar = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.VeteranSilithar }, 7, 2, gameSession.getPlayer1Id());

    veteranSilithar.setDamage(2);
    veteranSilithar.refreshExhaustion();
    let action = veteranSilithar.actionAttack(gameSession.getGeneralForPlayer2());
    gameSession.executeAction(action);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.EggMorph }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
    gameSession.executeAction(playCardFromHandAction);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.IceCage }));
    playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
    gameSession.executeAction(playCardFromHandAction);

    playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);

    veteranSilithar = board.getUnitAtPosition({ x: 1, y: 1 });

    action = veteranSilithar.actionMove({ x: 2, y: 2 });
    gameSession.executeAction(action);

    expect(veteranSilithar.getPosition().x).to.equal(1);
    expect(veteranSilithar.getPosition().y).to.equal(1);
  });

  it('expect hailstone prisoned eggs to hatch correctly when played to the board', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    player1.remainingMana = 9;

    let veteranSilithar = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.VeteranSilithar }, 7, 2, gameSession.getPlayer1Id());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.IceCage }));

    veteranSilithar.setDamage(2);
    veteranSilithar.refreshExhaustion();
    const action = veteranSilithar.actionAttack(gameSession.getGeneralForPlayer2());
    gameSession.executeAction(action);

    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
    gameSession.executeAction(playCardFromHandAction);

    playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
    gameSession.executeAction(playCardFromHandAction);

    gameSession.executeAction(gameSession.actionEndTurn());
    gameSession.executeAction(gameSession.actionEndTurn());
    gameSession.executeAction(gameSession.actionEndTurn());

    veteranSilithar = board.getUnitAtPosition({ x: 1, y: 1 });

    expect(veteranSilithar.getId()).to.equal(SDK.Cards.Faction5.VeteranSilithar);
  });

  it('expect the last artifact to be replaced when equipping a 4th', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    player1.remainingMana = 999;

    // add artifacts to max
    for (let i = 0; i < CONFIG.MAX_ARTIFACTS; i++) {
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.SunstoneBracers }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));
    }
    let artifactModifiersBySourceCard = gameSession.getGeneralForPlayer1().getArtifactModifiersGroupedByArtifactCard();
    expect(artifactModifiersBySourceCard.length).to.equal(3);
    expect(artifactModifiersBySourceCard[2][0].getSourceCard().getId()).to.equal(SDK.Cards.Artifact.SunstoneBracers);

    // replace oldest
    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.ArclyteRegalia }));
    UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));
    artifactModifiersBySourceCard = gameSession.getGeneralForPlayer1().getArtifactModifiersGroupedByArtifactCard();
    expect(artifactModifiersBySourceCard.length).to.equal(3);
    expect(artifactModifiersBySourceCard[2][0].getSourceCard().getId()).to.equal(SDK.Cards.Artifact.ArclyteRegalia);
  });

  it('expect prismatic sarlac the eternal to respawn a prismatic sarlac when dying to an attack', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();

    const prismaticCardId = SDK.Cards.getPrismaticCardId(SDK.Cards.Neutral.SarlacTheEternal);
    let sarlac = UtilsSDK.applyCardToBoard({ id: prismaticCardId }, 7, 2, gameSession.getPlayer1Id());

    sarlac.refreshExhaustion();
    const action = sarlac.actionAttack(gameSession.getGeneralForPlayer2());
    gameSession.executeAction(action);

    sarlac = UtilsSDK.getEntityOnBoardById(prismaticCardId);
    const updatedSarlac = board.getUnitAtPosition({ x: 7, y: 2 });

    expect(updatedSarlac).to.equal(undefined);
    expect(sarlac.getHP()).to.equal(1);
    expect(SDK.Cards.getIsPrismaticCardId(sarlac.getId())).to.equal(true);
  });

  it('expect prismatic sarlac the eternal to respawn a prismatic sarlac when dying to a non-followup burn spell', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();

    const prismaticCardId = SDK.Cards.getPrismaticCardId(SDK.Cards.Neutral.SarlacTheEternal);
    let sarlac = UtilsSDK.applyCardToBoard({ id: prismaticCardId }, 7, 2, gameSession.getPlayer1Id());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
    gameSession.executeAction(playCardFromHandAction);

    sarlac = UtilsSDK.getEntityOnBoardById(prismaticCardId);
    const updatedSarlac = board.getUnitAtPosition({ x: 7, y: 2 });

    expect(updatedSarlac).to.equal(undefined);
    expect(sarlac.getHP()).to.equal(1);
    expect(SDK.Cards.getIsPrismaticCardId(sarlac.getId())).to.equal(true);
  });

  it('expect prismatic sarlac the eternal to respawn a prismatic sarlac when dying to a followup spell', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();

    player1.remainingMana = 9;

    const prismaticCardId = SDK.Cards.getPrismaticCardId(SDK.Cards.Neutral.SarlacTheEternal);
    const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 3, 2, gameSession.getPlayer1Id());
    let sarlac = UtilsSDK.applyCardToBoard({ id: prismaticCardId }, 7, 2, gameSession.getPlayer2Id());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.RitualBanishing }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 2);
    gameSession.executeAction(playCardFromHandAction);
    const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
    const followupAction = player1.actionPlayFollowup(followupCard, 7, 2);
    gameSession.executeAction(followupAction);

    sarlac = UtilsSDK.getEntityOnBoardById(prismaticCardId);
    const updatedSarlac = board.getUnitAtPosition({ x: 7, y: 2 });

    expect(updatedSarlac).to.equal(undefined);
    expect(sarlac.getHP()).to.equal(1);
    expect(SDK.Cards.getIsPrismaticCardId(sarlac.getId())).to.equal(true);
  });

  it('expect sarlac prime to respawn a sarlac prime when dying to an attack', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();

    const skinnedCardId = SDK.Cards.getSkinnedCardId(SDK.Cards.Neutral.SarlacTheEternal, 1);
    let sarlac = UtilsSDK.applyCardToBoard({ id: skinnedCardId }, 7, 2, gameSession.getPlayer1Id());

    sarlac.refreshExhaustion();
    const action = sarlac.actionAttack(gameSession.getGeneralForPlayer2());
    gameSession.executeAction(action);

    sarlac = UtilsSDK.getEntityOnBoardById(skinnedCardId);
    const updatedSarlac = board.getUnitAtPosition({ x: 7, y: 2 });

    expect(updatedSarlac).to.equal(undefined);
    expect(sarlac.getHP()).to.equal(1);
    expect(SDK.Cards.getIsSkinnedCardId(sarlac.getId())).to.equal(true);
  });

  it('expect prismatic sarlac the eternal to respawn on a prismatic sarlac when dying to a non-followup burn spell', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();

    const skinnedCardId = SDK.Cards.getSkinnedCardId(SDK.Cards.Neutral.SarlacTheEternal, 1);
    let sarlac = UtilsSDK.applyCardToBoard({ id: skinnedCardId }, 7, 2, gameSession.getPlayer1Id());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
    gameSession.executeAction(playCardFromHandAction);

    sarlac = UtilsSDK.getEntityOnBoardById(skinnedCardId);
    const updatedSarlac = board.getUnitAtPosition({ x: 7, y: 2 });

    expect(updatedSarlac).to.equal(undefined);
    expect(sarlac.getHP()).to.equal(1);
    expect(SDK.Cards.getIsSkinnedCardId(sarlac.getId())).to.equal(true);
  });

  it('expect prismatic sarlac the eternal to respawn on a prismatic sarlac when dying to a followup spell', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();

    player1.remainingMana = 9;

    const skinnedCardId = SDK.Cards.getSkinnedCardId(SDK.Cards.Neutral.SarlacTheEternal, 1);
    let sarlac = UtilsSDK.applyCardToBoard({ id: skinnedCardId }, 7, 2, gameSession.getPlayer2Id());
    const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 3, 2, gameSession.getPlayer1Id());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.RitualBanishing }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 2);
    gameSession.executeAction(playCardFromHandAction);
    const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
    const followupAction = player1.actionPlayFollowup(followupCard, 7, 2);
    gameSession.executeAction(followupAction);

    sarlac = UtilsSDK.getEntityOnBoardById(skinnedCardId);
    const updatedSarlac = board.getUnitAtPosition({ x: 7, y: 2 });

    expect(updatedSarlac).to.equal(undefined);
    expect(sarlac.getHP()).to.equal(1);
    expect(SDK.Cards.getIsSkinnedCardId(sarlac.getId())).to.equal(true);
  });

  it('expect an egged grow minion to gain stats the turn it hatches', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    player1.remainingMana = 9;

    let earthwalker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.EarthWalker }, 0, 1, gameSession.getPlayer2Id());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.EggMorph }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
    gameSession.executeAction(playCardFromHandAction);

    gameSession.executeAction(gameSession.actionEndTurn());

    earthwalker = board.getUnitAtPosition({ x: 0, y: 1 });

    expect(earthwalker.getHP()).to.equal(4);
    expect(earthwalker.getATK()).to.equal(4);
  });

  it('expect an egged vindicator to not gain stats the turn it hatches', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    player1.remainingMana = 9;

    let vindicator = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.Vindicator }, 0, 1, gameSession.getPlayer2Id());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.EggMorph }));
    const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
    gameSession.executeAction(playCardFromHandAction);

    gameSession.executeAction(gameSession.actionEndTurn());

    vindicator = board.getUnitAtPosition({ x: 0, y: 1 });

    expect(vindicator.getHP()).to.equal(3);
    expect(vindicator.getATK()).to.equal(1);
  });

  it('expect eggs that are stolen from dominate will to hatch at the beginning of their owners next turn', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    player1.remainingMana = 90;

    let vindicator = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.Vindicator }, 0, 1, gameSession.getPlayer2Id());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.EggMorph }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
    gameSession.executeAction(playCardFromHandAction);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Enslave }));
    playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
    gameSession.executeAction(playCardFromHandAction);

    gameSession.executeAction(gameSession.actionEndTurn());

    vindicator = board.getUnitAtPosition({ x: 0, y: 1 });

    expect(vindicator.getHP()).to.equal(1);
    expect(vindicator.getATK()).to.equal(0);

    gameSession.executeAction(gameSession.actionEndTurn());

    vindicator = board.getUnitAtPosition({ x: 0, y: 1 });

    expect(vindicator.getHP()).to.equal(3);
    expect(vindicator.getATK()).to.equal(1);
  });

  it('expect eggs that are stolen from psychic conduit to hatch at the beginning of their owners next turn', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    player1.remainingMana = 90;

    let vindicator = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.Vindicator }, 0, 1, gameSession.getPlayer2Id());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.EggMorph }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
    gameSession.executeAction(playCardFromHandAction);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PsychicConduit }));
    playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
    gameSession.executeAction(playCardFromHandAction);

    gameSession.executeAction(gameSession.actionEndTurn());

    vindicator = board.getUnitAtPosition({ x: 0, y: 1 });

    expect(vindicator.getHP()).to.equal(3);
    expect(vindicator.getATK()).to.equal(1);
    expect(vindicator.getOwnerId()).to.equal('player2_id');
  });

  it('expect eggs that are stolen from dominate will and then stolen back to hatch at the beginning of their final owners next turn', () => {
    const gameSession = SDK.GameSession.getInstance();
    const board = gameSession.getBoard();
    const player1 = gameSession.getPlayer1();
    const player2 = gameSession.getPlayer2();
    player1.remainingMana = 90;

    let vindicator = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.Vindicator }, 0, 1, gameSession.getPlayer2Id());
    const vindicator2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.Vindicator }, 1, 1, gameSession.getPlayer2Id());

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.EggMorph }));
    let playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
    gameSession.executeAction(playCardFromHandAction);

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Enslave }));
    playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
    gameSession.executeAction(playCardFromHandAction);

    gameSession.executeAction(gameSession.actionEndTurn());

    vindicator = board.getUnitAtPosition({ x: 0, y: 1 });

    expect(vindicator.getHP()).to.equal(1);
    expect(vindicator.getATK()).to.equal(0);

    player2.remainingMana = 9;

    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Neutral.ZenRui }));
    playCardFromHandAction = player2.actionPlayCardFromHand(0, 1, 0);
    gameSession.executeAction(playCardFromHandAction);
    const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
    const followupAction = player2.actionPlayFollowup(followupCard, 0, 1);
    gameSession.executeAction(followupAction);

    gameSession.executeAction(gameSession.actionEndTurn());

    vindicator = board.getUnitAtPosition({ x: 0, y: 1 });

    expect(vindicator.getHP()).to.equal(1);
    expect(vindicator.getATK()).to.equal(0);

    gameSession.executeAction(gameSession.actionEndTurn());

    vindicator = board.getUnitAtPosition({ x: 0, y: 1 });

    expect(vindicator.getHP()).to.equal(3);
    expect(vindicator.getATK()).to.equal(1);
    expect(vindicator.getOwnerId()).to.equal('player2_id');
  });

  /* Test disabled: failing
    it('expect to not draw into the card you just replaced more than statistically probable', function() {
      const repeatCounter = 0;
      for(var i = 0; i < 100; i++){
        const player1Deck = [
          {id: SDK.Cards.Faction6.General},
        ];

        const player2Deck = [
          {id: SDK.Cards.Faction3.General},
        ];

        // setup test session
        UtilsSDK.setupSession(player1Deck, player2Deck, true, false);

        const gameSession = SDK.GameSession.getInstance();
        const board = gameSession.getBoard();
        const player1 = gameSession.getPlayer1();

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.FireSpitter}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.OnyxBearSeal}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.OnyxBearSeal}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.OnyxBearSeal}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.HolyImmolation}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.HolyImmolation}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.HolyImmolation}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Tempest}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Tempest}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Tempest}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.DarkSacrifice}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.DarkSacrifice}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.DarkSacrifice}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AspectOfTheWolf}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AspectOfTheWolf}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AspectOfTheWolf}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AspectOfTheDrake}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AspectOfTheDrake}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AspectOfTheDrake}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AspectOfTheMountains}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AspectOfTheMountains}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AspectOfTheMountains}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.VoidPulse}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.VoidPulse}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.VoidPulse}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.EggMorph}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.EggMorph}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.EggMorph}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.NaturalSelection}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.NaturalSelection}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.NaturalSelection}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SaberspineSeal}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SaberspineSeal}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SaberspineSeal}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.KillingEdge}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.KillingEdge}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.KillingEdge}));

        const action = player1.actionReplaceCardFromHand(0);
        gameSession.executeAction(action);

        const hand = player1.getDeck().getCardsInHand();
        const cardDraw = hand[0];

        expect(cardDraw.getId()).to.not.equal(SDK.Cards.Spell.PhoenixFire);

        gameSession.executeAction(gameSession.actionEndTurn());

        const hand = player1.getDeck().getCardsInHand();
        const cardDraw = hand[1];

        if(cardDraw.getId() === SDK.Cards.Spell.PhoenixFire){
          repeatCounter++;
        }

        SDK.GameSession.reset();
      }

      Logger.module("UNITTEST").log("You drew into the card you replaced ", repeatCounter, " times.");
    });
    */
});
