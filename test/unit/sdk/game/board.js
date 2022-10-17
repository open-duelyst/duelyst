const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../'));
require('coffeescript/register');
const { expect } = require('chai');
const _ = require('underscore');
const CONFIG = require('../../../../app/common/config');
const Logger = require('../../../../app/common/logger.coffee');
const SDK = require('../../../../app/sdk.coffee');
const UtilsSDK = require('../../../utils/utils_sdk');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('board', () => {
  beforeEach(() => {
    SDK.GameSession.reset();
    const player1Deck = [
      { id: SDK.Cards.Faction1.General },
    ];

    const player2Deck = [
      { id: SDK.Cards.Faction4.General },
    ];

    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

    const player1Id = SDK.GameSession.getInstance().getPlayer1Id();
    const player2Id = SDK.GameSession.getInstance().getPlayer2Id();

    UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 4, 3, player1Id);
    UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 5, 3, player1Id);
    UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 4, 4, player1Id);
    UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 7, 4, player1Id);
    UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 8, 4, player1Id);

    UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 3, 1, player2Id);
    UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 4, 0, player2Id);
    UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 1, 0, player2Id);
    UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 0, 0, player2Id);
    UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 0, 1, player2Id);
    UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 0, 3, player2Id);
    UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 1, 1, player1Id);
    UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 1, 2, player1Id);

    UtilsSDK.applyCardToBoard({ id: SDK.Cards.Tile.Shadow }, 8, 2, player2Id);
  });

  afterEach(() => {
    SDK.GameSession.reset();
  });

  it('expect 0, 0 to be on 9x5 board', () => {
    expect(SDK.GameSession.getInstance().getBoard().isOnBoard({ x: 0, y: 0 })).to.equal(true);
  });

  it('expect 0, 4 to be on 9x5 board', () => {
    expect(SDK.GameSession.getInstance().getBoard().isOnBoard({ x: 0, y: 4 })).to.equal(true);
  });

  it('expect 8, 4 to be on 9x5 board', () => {
    expect(SDK.GameSession.getInstance().getBoard().isOnBoard({ x: 8, y: 4 })).to.equal(true);
  });

  it('expect 8, 0 to be on 9x5 board', () => {
    expect(SDK.GameSession.getInstance().getBoard().isOnBoard({ x: 8, y: 0 })).to.equal(true);
  });

  it('expect -1, -1 to be off 9x5 board', () => {
    expect(SDK.GameSession.getInstance().getBoard().isOnBoard({ x: -1, y: -1 })).to.equal(false);
  });

  it('expect 9, 5 to be off 9x5 board', () => {
    expect(SDK.GameSession.getInstance().getBoard().isOnBoard({ x: 9, y: 5 })).to.equal(false);
  });

  it('expect board.getCardAtPosition to find card at 0, 2', () => {
    expect(SDK.GameSession.getInstance().getBoard().getCardAtPosition({ x: 0, y: 2 }) instanceof SDK.Card).to.equal(true);
  });

  it('expect board.getEntityAtPosition to find entity at 4, 3', () => {
    console.log(SDK.GameSession.getInstance().getBoard().getUnits().length);
    expect(SDK.GameSession.getInstance().getBoard().getEntityAtPosition({ x: 4, y: 3 }) instanceof SDK.Entity).to.equal(true);
  });

  it('expect board.getUnitAtPosition to find unit at 5, 3', () => {
    expect(SDK.GameSession.getInstance().getBoard().getUnitAtPosition({ x: 5, y: 3 }) instanceof SDK.Unit).to.equal(true);
  });

  it('expect board.getEntityAtPosition to find unit and not tile at 8, 2', () => {
    expect(SDK.GameSession.getInstance().getBoard().getEntityAtPosition({ x: 8, y: 2 }) instanceof SDK.Unit).to.equal(true);
  });

  it('expect board.getTileAtPosition to not find tile at 8, 2', () => {
    expect(SDK.GameSession.getInstance().getBoard().getTileAtPosition({ x: 8, y: 2 }) == null).to.equal(true);
  });

  it('expect board.getTileAtPosition, allowing untargetable, to find tile at 8, 2', () => {
    expect(SDK.GameSession.getInstance().getBoard().getTileAtPosition({ x: 8, y: 2 }, true) instanceof SDK.Tile).to.equal(true);
  });

  it('expect board.getCardsAtPosition to find unit but not tile at 8, 2', () => {
    const entites = SDK.GameSession.getInstance().getBoard().getCardsAtPosition({ x: 8, y: 2 });
    expect(entites[0] instanceof SDK.Unit && entites.length === 1).to.equal(true);
  });

  it('expect board.getCardsAtPosition, allowing untargetable, to find unit and tile at 8, 2', () => {
    const entites = SDK.GameSession.getInstance().getBoard().getCardsAtPosition({ x: 8, y: 2 }, null, true);
    expect(entites[0] instanceof SDK.Unit && entites[1] instanceof SDK.Tile).to.equal(true);
  });

  it('expect board.getEntitiesAtPosition to find unit but not tile at 8, 2', () => {
    const entites = SDK.GameSession.getInstance().getBoard().getEntitiesAtPosition({ x: 8, y: 2 });
    expect(entites[0] instanceof SDK.Unit && entites.length === 1).to.equal(true);
  });

  it('expect board.getEntitiesAtPosition, allowing untargetable, to find unit and tile at 8, 2', () => {
    const entites = SDK.GameSession.getInstance().getBoard().getEntitiesAtPosition({ x: 8, y: 2 }, true);
    expect(entites[0] instanceof SDK.Unit && entites[1] instanceof SDK.Tile).to.equal(true);
  });

  it('expect board.getObstructionAtPosition to find obstruction at 5, 3', () => {
    expect(SDK.GameSession.getInstance().getBoard().getObstructionAtPosition({ x: 5, y: 3 }) != null).to.equal(true);
  });

  it('expect board.getObstructionAtPositionForEntity to find obstruction for unit at 3, 1', () => {
    const entity = SDK.GameSession.getInstance().getBoard().getUnitAtPosition({ x: 0, y: 2 });
    expect(SDK.GameSession.getInstance().getBoard().getObstructionAtPositionForEntity({ x: 3, y: 1 }, entity) != null).to.equal(true);
  });

  it('expect board.getCardsWithinRadiusOfPosition with radius of 1 to find 5 cards at 0, 2', () => {
    const entites = SDK.GameSession.getInstance().getBoard().getCardsWithinRadiusOfPosition({ x: 0, y: 2 });
    expect(entites.length).to.equal(5);
  });

  it('expect board.getCardsWithinRadiusOfPosition with radius of entire board to find 15 cards at 0, 2', () => {
    const entites = SDK.GameSession.getInstance().getBoard().getCardsWithinRadiusOfPosition({ x: 0, y: 2 }, null, CONFIG.WHOLE_BOARD_RADIUS);
    expect(entites.length).to.equal(15);
  });

  it('expect board.getCardsAroundPosition with radius of 1 to find 4 cards at 0, 2', () => {
    const entites = SDK.GameSession.getInstance().getBoard().getCardsAroundPosition({ x: 0, y: 2 });
    expect(entites.length).to.equal(4);
  });

  it('expect board.getEntitiesAroundEntity with radius of 1 to find 4 cards at 0, 2', () => {
    const entity = SDK.GameSession.getInstance().getBoard().getUnitAtPosition({ x: 0, y: 2 });
    const entites = SDK.GameSession.getInstance().getBoard().getEntitiesAroundEntity(entity);
    expect(entites.length).to.equal(4);
  });

  it('expect board.getFriendlyEntitiesAroundEntity with radius of 1 to find 2 cards at 0, 2', () => {
    const entity = SDK.GameSession.getInstance().getBoard().getUnitAtPosition({ x: 0, y: 2 });
    const entites = SDK.GameSession.getInstance().getBoard().getFriendlyEntitiesAroundEntity(entity);
    expect(entites.length).to.equal(2);
  });

  it('expect board.getFriendlyEntitiesAroundEntity with radius of entire board to find 7 cards at 0, 2', () => {
    const entity = SDK.GameSession.getInstance().getBoard().getUnitAtPosition({ x: 0, y: 2 });
    const entites = SDK.GameSession.getInstance().getBoard().getFriendlyEntitiesAroundEntity(entity, null, CONFIG.WHOLE_BOARD_RADIUS);
    expect(entites.length).to.equal(7);
  });

  it('expect board.getEnemyEntitiesAroundEntity with radius of 1 to find 2 cards at 0, 2', () => {
    const entity = SDK.GameSession.getInstance().getBoard().getUnitAtPosition({ x: 0, y: 2 });
    const entites = SDK.GameSession.getInstance().getBoard().getEnemyEntitiesAroundEntity(entity);
    expect(entites.length).to.equal(2);
  });

  it('expect board.getEnemyEntitiesAroundEntity with radius of entire board to find 7 cards at 0, 2', () => {
    const entity = SDK.GameSession.getInstance().getBoard().getUnitAtPosition({ x: 0, y: 2 });
    const entites = SDK.GameSession.getInstance().getBoard().getEnemyEntitiesAroundEntity(entity, null, CONFIG.WHOLE_BOARD_RADIUS);
    expect(entites.length).to.equal(7);
  });

  it('expect board.getEntitiesInRow to find 3 cards at the first row', () => {
    const entites = SDK.GameSession.getInstance().getBoard().getEntitiesInRow(0);
    expect(entites.length).to.equal(3);
  });

  it('expect board.getEntitiesInColumn to find 3 cards at the middle column', () => {
    const entites = SDK.GameSession.getInstance().getBoard().getEntitiesInColumn(4);
    expect(entites.length).to.equal(3);
  });

  it('expect board.getEntitiesInfrontOf to find 2 cards at 4, 4', () => {
    const entity = SDK.GameSession.getInstance().getBoard().getUnitAtPosition({ x: 4, y: 4 });
    const entites = SDK.GameSession.getInstance().getBoard().getEntitiesInfrontOf(entity);
    expect(entites.length).to.equal(2);
  });

  it('expect board.getEntitiesInfrontOf to find 0 cards at 0, 0', () => {
    const entity = SDK.GameSession.getInstance().getBoard().getUnitAtPosition({ x: 0, y: 0 });
    const entites = SDK.GameSession.getInstance().getBoard().getEntitiesInfrontOf(entity);
    expect(entites.length).to.equal(0);
  });

  it('expect board.getEntitiesOnCardinalAxisFromEntityToPosition to find 2 cards at 0, 2 to 8, 2', () => {
    const entity = SDK.GameSession.getInstance().getBoard().getUnitAtPosition({ x: 0, y: 2 });
    const entites = SDK.GameSession.getInstance().getBoard().getEntitiesOnCardinalAxisFromEntityToPosition(entity, { x: 8, y: 2 });
    expect(entites.length).to.equal(2);
  });

  it('expect board.getEntitiesOnCardinalAxisFromEntityToPosition to find 2 cards at 0, 0 to 8, 0', () => {
    const entity = SDK.GameSession.getInstance().getBoard().getUnitAtPosition({ x: 0, y: 0 });
    const entites = SDK.GameSession.getInstance().getBoard().getEntitiesOnCardinalAxisFromEntityToPosition(entity, { x: 8, y: 0 });
    expect(entites.length).to.equal(2);
  });

  it('expect board.getEntitiesOnCardinalAxisFromEntityToPosition to find 2 cards at 0, 2 to 0, 0', () => {
    const entity = SDK.GameSession.getInstance().getBoard().getUnitAtPosition({ x: 0, y: 2 });
    const entites = SDK.GameSession.getInstance().getBoard().getEntitiesOnCardinalAxisFromEntityToPosition(entity, { x: 0, y: 0 });
    expect(entites.length).to.equal(2);
  });
});
