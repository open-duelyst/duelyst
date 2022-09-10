// pragma PKGS: game
const CONFIG = require('app/common/config');
const EVENTS = require('app/common/event_types');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const UtilsEngine = require('app/common/utils/utils_engine');
const audio_engine = require('app/audio/audio_engine');
const UtilsPosition = require('app/common/utils/utils_position');
const _ = require('underscore');
const i18next = require('i18next');
const BaseSprite = require('./nodes/BaseSprite');
const TileBoxSprite = require('./nodes/map/TileBoxSprite');
const TileSpawnSprite = require('./nodes/map/TileSpawnSprite');
const TileSpellSprite = require('./nodes/map/TileSpellSprite');
const TileCardSprite = require('./nodes/map/TileCardSprite');
const TileOpponentSprite = require('./nodes/map/TileOpponentSprite');
const TileGlowSprite = require('./nodes/map/TileGlowSprite');
const TileAttackSprite = require('./nodes/map/TileAttackSprite');
const TileMapHoverSprite = require('./nodes/map/TileMapHoverSprite');
const TileMapLargeSprite = require('./nodes/map/TileMapLargeSprite');
const TileMapPathMoveStartSprite = require('./nodes/map/TileMapPathMoveStartSprite');
const TileMapPathMoveEndSprite = require('./nodes/map/TileMapPathMoveEndSprite');
const TileMapPathMoveEndFromStartSprite = require('./nodes/map/TileMapPathMoveEndFromStartSprite');
const TileMapPathMoveStraightSprite = require('./nodes/map/TileMapPathMoveStraightSprite');
const TileMapPathMoveStraightFromStartSprite = require('./nodes/map/TileMapPathMoveStraightFromStartSprite');
const TileMapPathMoveCornerSprite = require('./nodes/map/TileMapPathMoveCornerSprite');
const TileMapPathMoveCornerFlippedSprite = require('./nodes/map/TileMapPathMoveCornerFlippedSprite');
const TileMapPathMoveCornerFromStartSprite = require('./nodes/map/TileMapPathMoveCornerFromStartSprite');
const TileMapPathMoveCornerFromStartFlippedSprite = require('./nodes/map/TileMapPathMoveCornerFromStartFlippedSprite');
const AttackPathSprite = require('./nodes/map/AttackPathSprite');
const SdkNode = require('./nodes/cards/SdkNode');
const BottomDeckCardNode = require('./nodes/cards/BottomDeckCardNode');
const SignatureCardNode = require('./nodes/cards/SignatureCardNode');
const TooltipNode = require('./nodes/cards/TooltipNode');
const Light = require('./nodes/fx/Light');
const NodeFactory = require('./helpers/NodeFactory');
const EntityNodeVisualStateTag = require('./nodes/visualStateTags/EntityNodeVisualStateTag');

/** **************************************************************************
 Player
 var Batch = cc.Class
 Player.create()
 // used to manage individual view properties of each player
 *************************************************************************** */
const Player = cc.Class.extend({

  boardTileZOrder: 1,
  moveTileZOrder: 2,
  assistTileZOrder: 3,
  aggroTileZOrder: 4,
  attackableTargetTileZOrder: 5,
  cardTileZOrder: 6,
  selectTileZOrder: 7,
  pathTileZOrder: 8,
  mouseOverTileZOrder: 9,

  playerId: null,
  isMyPlayer: false,
  isAltPlayer: false,
  isCurrentPlayer: false,
  shouldShowTargetingPathFromGeneral: true,

  _showPathsLocked: false,
  _showPathsLockId: -1,
  _showPathsLockRequests: [],

  generalFX: null,
  generalNodeHighlighted: null,

  _intentType: SDK.IntentType.NeutralIntent,

  mouseScreenPosition: null, // position of mouse in screen space
  mouseGlobalScaleInvertedScreenPosition: null, // position of mouse in screen space, inverted for global scale
  mouseScreenDownPosition: null, // position of mouse down in screen space
  mouseGlobalScaleInvertedScreenDownPosition: null, // position of mouse down in screen space, inverted for global scale
  mouseScreenUpPosition: null, // position of mouse up in screen space
  mouseGlobalScaleInvertedScreenUpPosition: null, // position of mouse up in screen space, inverted for global scale
  mouseBoardPosition: null, // position of mouse on board space, rounded to nearest integer
  mouseBoardDownPosition: null, // position of mouse down on board space, rounded to nearest integer
  mouseBoardUpPosition: null, // position of mouse up on board space, rounded to nearest integer
  mouseBoardUnroundedPosition: null, // position of mouse on board space, unrounded
  mouseScreenBoardPosition: null, // position of mouse in screen space, rounded to nearest integer
  mouseTileMapBoardPosition: null, // position of mouse in tile map space, rounded to nearest integer
  mouseIsOnBoard: false,
  mouseWasOnBoard: false,
  mouseDown: false,
  mouseDownAt: 0,
  mouseDragging: false,

  selectedEntityNode: null,
  selectedHandIndex: null,
  selectedCard: null,
  selectedCardNode: null,
  stickyTargetNode: null,

  cardsWithFollowupStack: null,
  followupCard: null,
  followupFX: null,

  selectedTiles: null,
  selectedMoveTiles: null,
  selectedAttackTiles: null,
  selectedMoveMap: null,
  selectedAttackMap: null,
  selectedBoxTile: null,
  selectedActionTile: null,

  cardTiles: null,
  cardValidTiles: null,
  cardMap: null,
  cardTile: null,

  pathTiles: null,
  pathLocs: null,
  pathIsActive: false,
  pathIsDirect: false,
  pathColor: null,
  pathEndRelativeScreenPosition: null,

  targetTile: null,
  targetIsActive: false,
  targetColor: null,
  targetSpriteIdentifier: null,

  opponentTile: null,

  mouseOverEntityNode: null,
  mouseOverArtifactNode: null,
  mouseOverReplaceNode: null,
  mouseOverCardNode: null,
  mouseOverSdkCard: null,
  mouseOverHandIndex: null,
  mouseOverTiles: null,
  mouseOverSpellTiles: null,
  _mouseOverSpellAffectBoardPositions: null,

  previewTiles: null,
  previewMoveTiles: null,
  previewAttackTiles: null,
  previewMoveMap: null,
  previewAttackMap: null,

  selecting: false,
  showingCard: false,
  previewing: false,
  hovering: false,
  hoveringOnBoard: false,
  hoverChanged: false,

  _previewDirty: false,
  _selectedDirty: false,
  _cardDirty: false,
  _hoverDirty: false,

  _validTargetNodes: null,

  /* region INITIALIZATION */

  ctor(playerId) {
    // initialize properties that may be required in init
    this.mouseScreenPosition = cc.p(-1, -1);
    this.mouseGlobalScaleInvertedScreenPosition = cc.p(-1, -1);
    this.mouseScreenDownPosition = cc.p(-1, -1);
    this.mouseGlobalScaleInvertedScreenDownPosition = cc.p(-1, -1);
    this.mouseScreenUpPosition = cc.p(-1, -1);
    this.mouseGlobalScaleInvertedScreenUpPosition = cc.p(-1, -1);
    this.mouseBoardPosition = cc.p(-1, -1);
    this.mouseBoardDownPosition = cc.p(-1, -1);
    this.mouseBoardUpPosition = cc.p(-1, -1);

    this.setPlayerId(playerId);

    this._resetSelectedTileData();
    this._resetPreviewTileData();
    this._resetCardTileData();
    this._resetPathTileData();
    this._validTargetNodes = [];
    this.mouseOverTiles = [];
    this.mouseOverSpellTiles = [];
    this.cardsWithFollowupStack = [];
  },

  reset() {
    this.setIsCurrentPlayer(false);
    this.setSelectedEntityNode(null);
    this.setSelectedCard(null);
    this.setMouseOverEntityNode(null);
    this.setMouseOverCard(null);
    this.setMouseOverArtifact(null);
    this._showPathsLockRequests = [];
    this.setShowPathsLocked(false);
    this.removeHover();
    this.resetMouseState();
  },
  resetMouseState() {
    this.mouseScreenDownPosition = cc.p(-1, -1);
    this.mouseGlobalScaleInvertedScreenDownPosition = cc.p(-1, -1);
    this.mouseBoardDownPosition = cc.p(-1, -1);
    this.mouseScreenUpPosition = cc.p(-1, -1);
    this.mouseGlobalScaleInvertedScreenUpPosition = cc.p(-1, -1);
    this.mouseBoardUpPosition = cc.p(-1, -1);
    this.mouseDown = false;
    this.mouseDragging = false;
  },

  /* endregion INITIALIZATION */

  /* region PLAYER STATE */

  setPlayerId(playerId) {
    if (this.playerId != playerId) {
      this.playerId = playerId;
      this.reset();
    }
  },
  getPlayerId() {
    return this.playerId;
  },
  getSdkPlayer() {
    return this.playerId && SDK.GameSession.getInstance().getPlayerById(this.playerId);
  },
  setIsMyPlayer(val) {
    this.isMyPlayer = val;
  },
  getIsMyPlayer() {
    return this.isMyPlayer;
  },
  setIsAltPlayer(val) {
    this.isAltPlayer = val;
  },
  getIsAltPlayer() {
    return this.isAltPlayer;
  },
  getIsPlayer1() {
    return this.playerId === SDK.GameSession.getInstance().getPlayer1Id();
  },
  getIsPlayer2() {
    return this.playerId === SDK.GameSession.getInstance().getPlayer2Id();
  },

  setIsCurrentPlayer(isCurrentPlayer) {
    this.isCurrentPlayer = isCurrentPlayer;
  },
  // TODO: Rework this behavior, this leads to cases where neither player is the current player
  getIsCurrentPlayer() {
    const sdkPlayer = this.getSdkPlayer();
    if (sdkPlayer != null) {
      return this.isCurrentPlayer && sdkPlayer.getIsCurrentPlayer();
    }
    return false;
  },

  setShouldShowTargetingPathFromGeneral(val) {
    this.shouldShowTargetingPathFromGeneral = val;
  },
  getShouldShowTargetingPathFromGeneral() {
    return this.shouldShowTargetingPathFromGeneral;
  },

  /* endregion PLAYER STATE */

  /* region GENERAL */

  highlightGeneral(generalNode) {
    const sdkPlayer = this.getSdkPlayer();
    if (sdkPlayer != null && generalNode != null) {
      if (generalNode != null && this.generalNodeHighlighted != generalNode) {
        this.unhighlightGeneral();
        this.generalNodeHighlighted = generalNode;

        // show fx on my general
        // TODO: merge in fx template from faction?
        this.generalFX = NodeFactory.createFX(CONFIG.GENERAL_FX_TEMPLATE);
        this.generalNodeHighlighted.showFX(this.generalFX);
      }
    }
  },

  unhighlightGeneral() {
    if (this.generalNodeHighlighted != null && this.generalFX != null) {
      this.generalNodeHighlighted.removeFX(CONFIG.GENERAL_FX_FADE_DURATION, this.generalFX);
      this.generalNodeHighlighted = null;
      this.generalFX = null;
    }
  },

  /* endregion GENERAL */

  getTileLayer() {
    const scene = this.getScene();
    const gameLayer = scene && scene.getGameLayer();
    return gameLayer && gameLayer.getTileLayer();
  },

  /* region INTENT */

  setIntentType(intent) {
    this._intentType = intent || SDK.IntentType.NeutralIntent;
  },
  getIntentType() {
    return this._intentType;
  },
  getIntentTypeIsDeck() {
    return this.getIntentType() === SDK.IntentType.DeckIntent;
  },
  getIntentTypeIsGame() {
    return this.getIntentType() === SDK.IntentType.GameIntent;
  },
  getIntentTypeIsSelection() {
    return this.getIntentTypeIsDeck() || this.getIntentTypeIsGame();
  },
  updateIntent() {
    // only update intent for my player when does not have a selection intent
    if (this.getIsMyPlayer() && !this.getIntentTypeIsSelection()) {
      if (this.getIsMouseOnBoard()) {
        this.setIntentType(SDK.IntentType.InspectIntent);
      } else {
        this.setIntentType(SDK.IntentType.NeutralIntent);
      }
    }
  },

  getIsTakingActionInHand() {
    // true when player is hovering anything in hand, playing a card from hand, or playing a followupCard
    return !!(this.getSelectedCard() || this.getMouseOverCardNode() || this.getFollowupCard());
  },
  getIsTakingActionOnBoard() {
    // true when player is not taking an action from hand and hovering anything on board or selecting a unit
    return !this.getIsTakingActionInHand() && !!(this.getSelectedEntityNode() || this.getMouseOverEntityNode());
  },
  getIsTakingSelectionAction() {
    // true when player is selecting anything
    return !!(this.getSelectedCard() || this.getSelectedEntityNode() || this.getFollowupCard());
  },
  getIsTakingInspectAction() {
    // true when player is doing any kind of action that creates an inspector
    return !!(this.getMouseOverEntityNode() || this.getMouseOverCardNode() || this.getMouseOverArtifactNode());
  },
  getIsTakingAction() {
    // true when player is doing any kind of action
    return this.getIsTakingInspectAction() || this.getIsTakingSelectionAction();
  },

  /* endregion INTENT */

  /* region MOUSE */

  /**
   * Sets mouse screen position, board index position, and board position.
   * @param {Vec2} screenLocation
   */
  setMouseScreenPosition(screenLocation) {
    if (screenLocation != null) {
      this.mouseScreenPosition = cc.p(screenLocation.x, screenLocation.y);
      this.mouseGlobalScaleInvertedScreenPosition = UtilsEngine.transformPositionFromGlobalScale(this.mouseScreenPosition);
      this.mouseBoardUnroundedPosition = UtilsEngine.transformTileMapToBoard(this.mouseGlobalScaleInvertedScreenPosition);
      const mouseBoardPosition = UtilsEngine.transformTileMapToBoardIndex(this.mouseGlobalScaleInvertedScreenPosition);
      this.setMouseBoardPosition(mouseBoardPosition);

      // check state of dragging
      if (this.mouseDown && !this.mouseDragging && Date.now() - CONFIG.DRAGGING_DELAY * 1000.0 >= this.mouseDownAt) {
        const dx = this.mouseScreenPosition.x - this.mouseScreenDownPosition.x;
        const dy = this.mouseScreenPosition.y - this.mouseScreenDownPosition.y;
        if (Math.sqrt(dx * dx + dy * dy) >= CONFIG.DRAGGING_DISTANCE) {
          this.mouseDragging = true;
        }
      }

      this._updateFollowupFX();
      this._updateAttackFX();
    }
  },

  setMouseScreenPositionFromBoardLocation(boardLocation) {
    if (boardLocation != null) {
      this.mouseScreenPosition = UtilsEngine.transformBoardToScreen(boardLocation);
      this.mouseGlobalScaleInvertedScreenPosition = UtilsEngine.transformPositionFromGlobalScale(this.mouseScreenPosition);
      this.mouseBoardUnroundedPosition = cc.p(boardLocation.x, boardLocation.y);
      const mouseBoardPosition = cc.p(Math.floor(boardLocation.x), Math.floor(boardLocation.y));
      this.setMouseBoardPosition(mouseBoardPosition);

      // check state of dragging
      if (this.mouseDown && !this.mouseDragging && performance.now() - this.mouseDownAt >= CONFIG.DRAGGING_DELAY) {
        const dx = this.mouseScreenPosition.x - this.mouseScreenDownPosition.x;
        const dy = this.mouseScreenPosition.y - this.mouseScreenDownPosition.y;
        if (Math.sqrt(dx * dx + dy * dy) >= CONFIG.DRAGGING_DISTANCE) {
          this.mouseDragging = true;
        }
      }

      this._updateFollowupFX();
      this._updateAttackFX();
    }
  },

  /**
   * Sets mouse board index position and board position.
   * @param {Vec2} boardLocation
   */
  setMouseBoardPosition(boardLocation) {
    if (!UtilsPosition.getPositionsAreEqual(this.mouseBoardPosition, boardLocation)) {
      this.setHoverDirty(true);
      this.mouseBoardPosition = cc.p(boardLocation.x, boardLocation.y);
      this.mouseScreenBoardPosition = UtilsEngine.transformBoardToScreen(this.mouseBoardPosition);
      this.mouseTileMapBoardPosition = UtilsEngine.transformScreenToTileMap(this.mouseScreenBoardPosition);
      this.mouseWasOnBoard = this.mouseIsOnBoard;
      this.mouseIsOnBoard = SDK.GameSession.getInstance().getBoard().isOnBoard(this.mouseBoardPosition);
    }
  },

  /**
   * Sets mouse screen down position, board down index position, and board down position.
   * @param {Vec2} screenLocation
   */
  setMouseScreenDownPosition(screenLocation) {
    if (screenLocation != null) {
      this.mouseScreenDownPosition = cc.p(screenLocation.x, screenLocation.y);
      this.mouseGlobalScaleInvertedScreenDownPosition = UtilsEngine.transformPositionFromGlobalScale(this.mouseScreenDownPosition);
      this.mouseBoardDownPosition = UtilsEngine.transformTileMapToBoardIndex(this.mouseGlobalScaleInvertedScreenDownPosition);
      this.mouseBoardUnroundedDownPosition = UtilsEngine.transformTileMapToBoard(this.mouseGlobalScaleInvertedScreenDownPosition);
      this.mouseDown = true;
      this.mouseDragging = false;
      this.mouseDownAt = Date.now();
    }
  },

  /**
   * Sets mouse screen up position, board up index position, and board up position.
   * @param {Vec2} screenLocation
   */
  setMouseScreenUpPosition(screenLocation) {
    if (screenLocation != null) {
      this.mouseScreenUpPosition = cc.p(screenLocation.x, screenLocation.y);
      this.mouseGlobalScaleInvertedScreenUpPosition = UtilsEngine.transformPositionFromGlobalScale(this.mouseScreenUpPosition);
      this.mouseBoardUpPosition = UtilsEngine.transformTileMapToBoardIndex(this.mouseGlobalScaleInvertedScreenUpPosition);
      this.mouseBoardUnroundedUpPosition = UtilsEngine.transformTileMapToBoard(this.mouseGlobalScaleInvertedScreenUpPosition);
      this.mouseDown = false;
      this.mouseDragging = false;
    }
  },

  /**
   * Gets mouse screen position.
   * NOTE: do not modify this value.
   * @return {Vec2}
   */
  getMouseScreenPosition() {
    return this.mouseScreenPosition;
  },

  /**
   * Gets mouse screen down position.
   * NOTE: do not modify this value.
   * @return {Vec2}
   */
  getMouseScreenDownPosition() {
    return this.mouseScreenDownPosition;
  },

  /**
   * Gets mouse screen up position.
   * NOTE: do not modify this value.
   * @return {Vec2}
   */
  getMouseScreenUpPosition() {
    return this.mouseScreenUpPosition;
  },

  getMouseGlobalScaleInvertedScreenPosition() {
    return this.mouseGlobalScaleInvertedScreenPosition;
  },
  getMouseGlobalScaleInvertedScreenDownPosition() {
    return this.mouseGlobalScaleInvertedScreenDownPosition;
  },
  getMouseGlobalScaleInvertedScreenUpPosition() {
    return this.mouseGlobalScaleInvertedScreenUpPosition;
  },

  /**
   * Gets mouse board index position (rounded).
   * NOTE: do not modify this value.
   * @return {Vec2}
   */
  getMouseBoardPosition() {
    return this.mouseBoardPosition;
  },

  /**
   * Gets mouse board down index position (rounded).
   * NOTE: do not modify this value.
   * @return {Vec2}
   */
  getMouseBoardDownPosition() {
    return this.mouseBoardDownPosition;
  },

  /**
   * Gets mouse board up index position (rounded).
   * NOTE: do not modify this value.
   * @return {Vec2}
   */
  getMouseBoardUpPosition() {
    return this.mouseBoardUpPosition;
  },

  /**
   * Gets mouse board position (unrounded).
   * NOTE: do not modify this value.
   * @return {Vec2}
   */
  getMouseBoardUnroundedPosition() {
    return this.mouseBoardUnroundedPosition;
  },

  /**
   * Gets mouse board down position (unrounded).
   * NOTE: do not modify this value.
   * @return {Vec2}
   */
  getMouseBoardUnroundedDownPosition() {
    return this.mouseBoardUnroundedDownPosition;
  },

  /**
   * Gets mouse board up position (unrounded).
   * NOTE: do not modify this value.
   * @return {Vec2}
   */
  getMouseBoardUnroundedUpPosition() {
    return this.mouseBoardUnroundedUpPosition;
  },

  /**
   * Gets mouse screen position from board index position (rounded).
   * NOTE: do not modify this value.
   * @return {Vec2}
   */
  getMouseScreenBoardPosition() {
    return this.mouseScreenBoardPosition;
  },

  /**
   * Gets mouse tilemap position from board index position (rounded).
   * NOTE: do not modify this value.
   * @return {Vec2}
   */
  getMouseTileMapBoardPosition() {
    return this.mouseTileMapBoardPosition;
  },

  /**
   * Gets whether mouse is on the board.
   * @return {Boolean}
   */
  getIsMouseOnBoard() {
    return this.mouseIsOnBoard;
  },

  /**
   * Gets whether mouse was on the board.
   * @return {Boolean}
   */
  getWasMouseOnBoard() {
    return this.mouseWasOnBoard;
  },

  /**
   * Gets whether mouse is down.
   * @return {Boolean}
   */
  getMouseDown() {
    return this.mouseDown;
  },

  /**
   * Gets whether mouse is dragging.
   * @return {Boolean}
   */
  getMouseDragging() {
    return this.mouseDragging;
  },

  /* endregion MOUSE */

  /* region SELECTED ENTITY */

  setSelectedEntityNode(selectedEntityNode) {
    const scene = this.getScene();
    const gameLayer = scene != null && scene.getGameLayer();
    if (gameLayer != null && this.selectedEntityNode !== selectedEntityNode) {
      const isForMyPlayer = this.getIsMyPlayer();

      if (this.selectedEntityNode != null) {
        // cleanup
        this.setMouseOverEntityNode(null);
        this.removeAllSelectedTiles();
        this.selectedEntityNode.setSelected(false);
        this.selectedEntityNode = null;

        this.updateIntent();
        if (isForMyPlayer && !selectedEntityNode) {
          gameLayer.updateReadinessTagForAllEntities();
          gameLayer.getEventBus().trigger(EVENTS.game_selection_changed, { type: EVENTS.game_selection_changed, selection: null });
        }
      }

      const sdkPlayer = this.getSdkPlayer();
      if (selectedEntityNode && sdkPlayer != null && gameLayer.getIsActive()) {
        this.setStickyTargetNode(null);

        // new
        this.selectedEntityNode = selectedEntityNode;
        this.selectedEntityNode.setSelected(true);

        audio_engine.current().play_effect_for_interaction(RSX.sfx_unit_select.audio, CONFIG.SELECT_SFX_PRIORITY);

        this.showEntityTiles();

        if (isForMyPlayer) {
          if (this.selectedEntityNode.getSdkCard().getCanAct()) {
            this.setIntentType(SDK.IntentType.GameIntent);
            gameLayer.updateReadinessTagForAllEntities();
          }

          // force inspector to close
          gameLayer.stopShowingInspectCard();
          gameLayer.updateShowingSdkNodeStats();
          gameLayer.getEventBus().trigger(EVENTS.game_selection_changed, { type: EVENTS.game_selection_changed, selection: this.selectedEntityNode });
        }
      }

      if (isForMyPlayer) {
        gameLayer.updateMouseCursor(true);

        // broadcast selection
        const selectEventData = {
          type: EVENTS.network_game_select,
          timestamp: Date.now(),
          intentType: this.getIntentType(),
        };
        if (this.selectedEntityNode != null) {
          selectEventData.cardIndex = this.selectedEntityNode.getSdkCard().getIndex();
        }
        SDK.NetworkManager.getInstance().broadcastGameEvent(selectEventData);
      }
    }
  },
  getSelectedEntityNode() {
    return this.selectedEntityNode;
  },
  getSelectedSdkEntity() {
    return this.selectedEntityNode && this.selectedEntityNode.getSdkCard();
  },
  setStickyTargetNode(stickyTargetNode) {
    this.stickyTargetNode = stickyTargetNode;
  },
  getStickyTargetNode() {
    return this.stickyTargetNode;
  },
  _showAttackFX() {
    if (!this.attackFX) {
      this.attackFX = NodeFactory.createFX(CONFIG.ATTACK_FX_TEMPLATE, { targetBoardPosition: this.mouseBoardPosition });
      this.getScene().getGameLayer().addNodes(this.attackFX);
    }
  },
  _removeAttackFX() {
    if (this.attackFX) {
      this.getScene().getGameLayer().removeNodes(this.attackFX);
      this.attackFX = null;
    }
  },
  _updateAttackFX() {
    if (this.attackFX && this.attackFX.length > 0) {
      for (let i = 0, il = this.attackFX.length; i < il; i++) {
        const attackFXSprite = this.attackFX[i];
        attackFXSprite.setPosition(this.mouseGlobalScaleInvertedScreenPosition);
      }
    }
  },

  /* endregion SELECTED ENTITY */

  /* region FOLLOWUPS */

  clearCardsWithFollowup() {
    this.cardsWithFollowupStack = [];
    this.setFollowupCard(null);
  },
  pushCardWithFollowup(card) {
    if (card && card.getOwnerId() === this.getSdkPlayer().getPlayerId() && !_.contains(this.cardsWithFollowupStack, card)) {
      this.cardsWithFollowupStack.push(card);
      Logger.module('ENGINE').log('Player.pushCardWithFollowup -> NAME:', card.getName(), 'num cards', this.cardsWithFollowupStack.length);
    }
  },
  popCurrentCardWithFollowup() {
    if (this.getHasCardsWithFollowup()) {
      const card = this.cardsWithFollowupStack.pop();
      Logger.module('ENGINE').log('Player.popCurrentCardWithFollowup -> NAME:', card.getName(), 'num cards', this.cardsWithFollowupStack.length);
    }
  },
  getCurrentCardWithFollowup() {
    return this.cardsWithFollowupStack[this.cardsWithFollowupStack.length - 1];
  },
  getCardsWithFollowupStack() {
    return this.cardsWithFollowupStack;
  },
  getHasCardsWithFollowup() {
    return this.cardsWithFollowupStack.length > 0;
  },
  setFollowupCard(followupCard) {
    const scene = this.getScene();
    const gameLayer = scene != null && scene.getGameLayer();
    if (gameLayer != null && this.followupCard !== followupCard) {
      const sdkPlayer = this.getSdkPlayer();
      var isForMyPlayer = this.getIsMyPlayer();

      if (this.followupCard != null) {
        // cleanup
        this.setMouseOverEntityNode(null);
        this.removeAllFollowupCardTiles();
        this._removeFollowupFX();
        this.followupCard = null;

        this.updateIntent();

        if (sdkPlayer != null) {
          var general = SDK.GameSession.getInstance().getGeneralForPlayerId(sdkPlayer.getPlayerId());
          var generalNode = general && gameLayer.getNodeForSdkCard(general);
          if (generalNode != null) {
            generalNode.showCastingEndState();
          }

          if ((isForMyPlayer || this.getIsAltPlayer()) && !SDK.GameSession.getInstance().getIsFollowupActive()) {
            gameLayer.stopShowingPlayCard();
          }

          if (isForMyPlayer) {
            gameLayer.updateReadinessTagForAllEntities();
            gameLayer.getEventBus().trigger(EVENTS.followup_card_stop, { type: EVENTS.followup_card_stop });
          }
        }
      }

      if (followupCard != null && sdkPlayer != null && gameLayer.getIsActive()) {
        // new followup
        this.followupCard = followupCard;

        var general = SDK.GameSession.getInstance().getGeneralForPlayerId(sdkPlayer.getPlayerId());
        var generalNode = general && gameLayer.getNodeForSdkCard(general);
        if (generalNode != null) {
          generalNode.showCastingStartState();
        }

        if (isForMyPlayer) {
          this.setIntentType(SDK.IntentType.DeckIntent);

          this._showFollowupFX(this.followupCard);

          this.showCardTiles(this.followupCard);

          gameLayer.updateReadinessTagForAllEntities();
          gameLayer.stopShowingInspectCard();
          gameLayer.getEventBus().trigger(EVENTS.followup_card_start, { type: EVENTS.followup_card_start, card: this.followupCard });
        }
      }
    }

    if (isForMyPlayer) {
      gameLayer.updateMouseCursor(true);

      // attempt to trace back the card that began the followup
      if (this.followupCard != null) {
        const rootCard = this.followupCard.getRootCard();
        const playedByAction = rootCard && rootCard.getAppliedToBoardByAction();
        if (playedByAction instanceof SDK.PlayCardFromHandAction) {
          SDK.NetworkManager.getInstance().broadcastGameEvent({
            type: EVENTS.network_game_select, timestamp: Date.now(), handIndex: playedByAction.getIndexOfCardInHand(), intentType: this.getIntentType(),
          });
        } else if (playedByAction instanceof SDK.PlaySignatureCardAction) {
          const selectEventData = {
            type: EVENTS.network_game_select,
            timestamp: Date.now(),
            intentType: this.getIntentType(),
          };
          if (this.getIsPlayer2()) {
            selectEventData.player2SignatureCard = true;
          } else {
            selectEventData.player1SignatureCard = true;
          }
          SDK.NetworkManager.getInstance().broadcastGameEvent(selectEventData);
        }
      } else {
        SDK.NetworkManager.getInstance().broadcastGameEvent({ type: EVENTS.network_game_select, timestamp: Date.now(), intentType: this.getIntentType() });
      }
    }
  },
  getFollowupCard() {
    return this.followupCard;
  },
  _showFollowupFX() {
    this.followupFX = NodeFactory.createFX(CONFIG.FOLLOWUP_FX_TEMPLATE, { targetBoardPosition: this.mouseBoardPosition });
    this.getScene().getGameLayer().addNodes(this.followupFX);
  },
  _removeFollowupFX() {
    if (this.followupFX) {
      this.getScene().getGameLayer().removeNodes(this.followupFX);
      this.followupFX = null;
    }
  },
  _updateFollowupFX() {
    if (this.followupFX) {
      for (let i = 0, il = this.followupFX.length; i < il; i++) {
        const followupFXSprite = this.followupFX[i];
        followupFXSprite.setPosition(this.mouseGlobalScaleInvertedScreenPosition);
      }
    }
  },

  /* endregion FOLLOWUPS */

  /* region SELECTED CARD */

  setSelectedCard(cardNodeOrHandIndex) {
    const scene = this.getScene();
    const gameLayer = scene != null && scene.getGameLayer();
    let cardNode;
    let sdkCard;
    let handIndex;
    if (cardNodeOrHandIndex instanceof SdkNode) {
      cardNode = cardNodeOrHandIndex;
      sdkCard = cardNode.getSdkCard();
      if (cardNode instanceof BottomDeckCardNode) {
        handIndex = cardNode.getHandIndex();
      }
    } else if (_.isNumber(cardNodeOrHandIndex)) {
      handIndex = cardNodeOrHandIndex;
    }
    if (gameLayer != null && (this.selectedCard !== sdkCard || this.selectedHandIndex !== handIndex)) {
      const isForMyPlayer = this.getIsMyPlayer();
      const sdkPlayer = this.getSdkPlayer();

      // select a single card
      if (this.selectedCard != null || this.selectedHandIndex != null) {
        // cleanup for old selected card
        this.removeAllSelectedCardTiles();
        this.selectedCard = null;
        this.selectedHandIndex = null;
        if (this.selectedCardNode) {
          this.selectedCardNode.setSelected(false);
          this.selectedCardNode = null;
        }

        if (sdkPlayer != null) {
          var general = SDK.GameSession.getInstance().getGeneralForPlayerId(sdkPlayer.getPlayerId());
          var generalNode = general && gameLayer.getNodeForSdkCard(general);
          if (generalNode != null) {
            generalNode.showCastingEndState();
          }
        }

        this.updateIntent();
        if (isForMyPlayer) {
          gameLayer.getBottomDeckLayer().getReplaceNode().setTemporarilyEmphasized(false);

          if (cardNode == null) {
            gameLayer.updateReadinessTagForAllEntities();
            gameLayer.getEventBus().trigger(EVENTS.game_selection_changed, { type: EVENTS.game_selection_changed, selection: null });
          }
        }
      }

      if (sdkPlayer != null && (sdkCard != null || handIndex != null)) {
        this.selectedCard = sdkCard;
        this.selectedHandIndex = handIndex;
        if (cardNode) {
          this.selectedCardNode = cardNode;
          this.selectedCardNode.setSelected(true);
        }

        var general = SDK.GameSession.getInstance().getGeneralForPlayerId(sdkPlayer.getPlayerId());
        var generalNode = general && gameLayer.getNodeForSdkCard(general);
        if (generalNode != null) {
          generalNode.showCastingStartState();
        }

        if (isForMyPlayer) {
          if (this.selectedCard != null && this.selectedCard.getDoesOwnerHaveEnoughManaToPlay()) {
            this.setIntentType(SDK.IntentType.DeckIntent);
            this.showCardTiles(this.selectedCard);
            gameLayer.updateReadinessTagForAllEntities();
          }

          gameLayer.stopShowingInspectCard();
          gameLayer.updateShowingSdkNodeStats();
          if (this.selectedHandIndex != null && sdkPlayer.getDeck().getCanReplaceCardThisTurn()) {
            gameLayer.getBottomDeckLayer().getReplaceNode().setTemporarilyEmphasized(true);
          }
        }

        gameLayer.getEventBus().trigger(EVENTS.game_selection_changed, { type: EVENTS.game_selection_changed, selection: this.selectedCard });
      }

      if (isForMyPlayer) {
        gameLayer.updateMouseCursor(true);

        // broadcast select
        const selectEventData = {
          type: EVENTS.network_game_select,
          timestamp: Date.now(),
          intentType: this.getIntentType(),
        };
        if (this.selectedCard != null) {
          if (this.selectedHandIndex != null) {
            selectEventData.handIndex = this.selectedHandIndex;
          } else if (this.getSelectedCard().isOwnedByPlayer2()) {
            selectEventData.player2SignatureCard = true;
          } else {
            selectEventData.player1SignatureCard = true;
          }
        }
        SDK.NetworkManager.getInstance().broadcastGameEvent(selectEventData);
      }
    }
  },
  getSelectedCardIndexInHand() {
    return this.selectedHandIndex;
  },
  getSelectedCard() {
    return this.selectedCard;
  },
  getSelectedCardNode() {
    return this.selectedCardNode;
  },

  /* endregion SELECTED CARD */

  /* region MOUSE OVER ENTITY */

  _mouseOverEntityNodeTagId: 'MouseOverEntityNodeTagId', // TODO: may need to add distinction by player
  setMouseOverEntityNode(mouseOverEntityNode) {
    const scene = this.getScene();
    const gameLayer = scene != null && scene.getGameLayer();
    if (gameLayer != null) {
      const isForMyPlayer = this.getIsMyPlayer();

      if (this.mouseOverEntityNode && this.mouseOverEntityNode !== mouseOverEntityNode) {
        // cleanup
        this.removeAllPreviewTiles();
        const mouseOverEntityNodePrev = this.mouseOverEntityNode;
        this.mouseOverEntityNode.setHovered(false);
        this.mouseOverEntityNode.removeInjectedVisualStateTagById(this._mouseOverEntityNodeTagId);
        this.mouseOverEntityNode = null;

        this.updateIntent();

        if (isForMyPlayer) {
          gameLayer.stopShowingInspectCard(mouseOverEntityNodePrev.getSdkCard());
          gameLayer.stopShowingEntitiesKilledByAttack();
          if (mouseOverEntityNode == null) {
            gameLayer.getEventBus().trigger(EVENTS.game_hover_changed, { type: EVENTS.game_hover_changed, hover: null });
          }
        }
      }

      const sdkPlayer = this.getSdkPlayer();
      if (mouseOverEntityNode && sdkPlayer != null && gameLayer.getIsActive() && this.mouseOverEntityNode !== mouseOverEntityNode) {
        this.mouseOverEntityNode = mouseOverEntityNode;
        this.mouseOverEntityNode.setHovered(true);

        // play sound
        if (isForMyPlayer) {
          audio_engine.current().play_effect(RSX.sfx_ui_in_game_hover.audio);
        }

        // show full mouse over when game is active
        if (gameLayer.getIsActive()) {
          if (this.mouseOverEntityNode.getIsActive() && this.mouseOverEntityNode.getIsTargetable()) {
            // hover entity
            if ((this.getIsMyPlayer() || this.getIsAltPlayer()) && this.mouseOverEntityNode.getSdkCard().isOwnedByMyPlayer()) {
              this.mouseOverEntityNode.addInjectedVisualStateTagWithId(EntityNodeVisualStateTag.createShowHoverForPlayerTag(), this._mouseOverEntityNodeTagId);
            } else {
              this.mouseOverEntityNode.addInjectedVisualStateTagWithId(EntityNodeVisualStateTag.createShowHoverForOpponentTag(), this._mouseOverEntityNodeTagId);
            }

            // show preview tiles for my player when not taking a selection action
            if (isForMyPlayer && !this.getIsTakingSelectionAction()) {
              this.previewEntityTiles();
            }
          }

          if (isForMyPlayer) {
            gameLayer.updateMouseCursor(true);

            // broadcast event over network if i'm the source of this event
            SDK.NetworkManager.getInstance().broadcastGameEvent({
              type: EVENTS.network_game_hover,
              timestamp: Date.now(),
              cardIndex: this.getMouseOverSdkEntityIndex(),
              intentType: this.getIntentType(),
            });

            gameLayer.showInspectCard(this.mouseOverEntityNode.getSdkCard(), this.mouseOverEntityNode);
            gameLayer.showEntitiesKilledByAttack(this.getSelectedSdkEntity(), this.getMouseOverSdkEntity());
            gameLayer.getEventBus().trigger(EVENTS.game_hover_changed, { type: EVENTS.game_hover_changed, hover: this.mouseOverEntityNode });
          }
        }
      }
    }
  },

  getMouseOverEntityNode() {
    return this.mouseOverEntityNode;
  },

  getMouseOverSdkEntity() {
    return this.mouseOverEntityNode && this.mouseOverEntityNode.getSdkCard();
  },

  getMouseOverSdkEntityIndex() {
    const sdkEntity = this.getMouseOverSdkEntity();
    return sdkEntity && sdkEntity.getIndex();
  },

  /* endregion MOUSE OVER ENTITY */

  /* region MOUSE OVER CARD */

  setMouseOverCard(cardNodeOrHandIndex) {
    const scene = this.getScene();
    const gameLayer = scene != null && scene.getGameLayer();
    let cardNode;

    // nulls are used to ensure equality checks for changes don't give false positives
    let sdkCard = null;
    let handIndex = null;
    if (cardNodeOrHandIndex instanceof SdkNode) {
      cardNode = cardNodeOrHandIndex;
      sdkCard = cardNode.getSdkCard();
      if (cardNode instanceof BottomDeckCardNode) {
        handIndex = cardNode.getHandIndex();
      }
    } else if (_.isNumber(cardNodeOrHandIndex)) {
      handIndex = cardNodeOrHandIndex;
    }

    if (gameLayer != null && (this.mouseOverSdkCard != sdkCard || this.mouseOverHandIndex != handIndex)) {
      const isForMyPlayer = this.getIsMyPlayer();
      if (this.mouseOverSdkCard != null || this.mouseOverHandIndex != null) {
        const lastMouseOverSdkCard = this.mouseOverSdkCard;
        const lastMouseOverCardNode = this.mouseOverCardNode;
        this.mouseOverSdkCard = null;
        this.mouseOverHandIndex = null;
        if (this.mouseOverCardNode != null) {
          this.mouseOverCardNode.setHighlighted(false);
          this.mouseOverCardNode = null;
        }
        if (isForMyPlayer) {
          if (lastMouseOverCardNode instanceof SignatureCardNode) {
            gameLayer.stopShowingTooltip();
          }
          gameLayer.stopShowingInspectCard(lastMouseOverSdkCard);
          gameLayer.getEventBus().trigger(EVENTS.game_hover_changed, { type: EVENTS.game_hover_changed, hover: null });
        }
      }

      const sdkPlayer = this.getSdkPlayer();
      if (sdkPlayer != null && (sdkCard != null || handIndex != null)) {
        this.mouseOverSdkCard = sdkCard;
        this.mouseOverHandIndex = handIndex;
        this.mouseOverCardNode = cardNode;

        if (!gameLayer.getIsDisabled() && this.mouseOverCardNode != null) {
          // highlight
          this.mouseOverCardNode.setHighlighted(true);

          if (isForMyPlayer) {
            // play sound
            audio_engine.current().play_effect(RSX.sfx_ui_in_game_hover.audio);

            // show tooltip for signature cards
            if (CONFIG.showInGameTips && this.mouseOverCardNode instanceof SignatureCardNode) {
              const owner = this.mouseOverSdkCard.getOwner();
              const cooldown = SDK.GameSession.getInstance().getNumberOfPlayerTurnsUntilPlayerActivatesSignatureCard(owner, true);
              const carrotDirection = owner.getPlayerId() === SDK.GameSession.getInstance().getPlayer2Id() ? TooltipNode.DIRECTION_RIGHT : TooltipNode.DIRECTION_LEFT;
              let text;
              if (owner.getPlayerId() === SDK.GameSession.getInstance().getMyPlayerId()) {
                text = i18next.t('game_ui.my_bloodborn_refresh_message', { count: cooldown });
              } else {
                text = i18next.t('game_ui.opponent_bloodborn_refresh_message', { count: cooldown });
              }
              //= (owner.getPlayerId() === SDK.GameSession.getInstance().getMyPlayerId() ? "Your" : "Your opponent's") + " [Bloodborn Spell] refreshes";
              // if (cooldown === 1) {
              //  if (owner.getPlayerId() === SDK.GameSession.getInstance().getMyPlayerId()) {
              //    text += " on your next turn.";
              //  } else {
              //    text += " on their next turn.";
              //  }
              // } else {
              //  text += " in " + cooldown + " turns.";
              // }
              gameLayer.showTooltipForSdkNode(this.mouseOverCardNode, text, carrotDirection);
            }

            // show inspect
            gameLayer.showInspectCard(this.mouseOverSdkCard, this.mouseOverCardNode);
            gameLayer.getEventBus().trigger(EVENTS.game_hover_changed, { type: EVENTS.game_hover_changed, hover: this.mouseOverCardNode });
          }
        }
      }

      if (isForMyPlayer) {
        gameLayer.updateMouseCursor(true);

        // broadcast hover
        const hoverEventData = {
          type: EVENTS.network_game_hover,
          timestamp: Date.now(),
          intentType: this.getIntentType(),
        };
        if (this.mouseOverSdkCard != null) {
          if (this.mouseOverSdkCard.isSignatureCard()) {
            if (this.mouseOverSdkCard.isOwnedByPlayer2()) {
              hoverEventData.player2SignatureCard = true;
            } else {
              hoverEventData.player1SignatureCard = true;
            }
          } else if (this.mouseOverHandIndex != null) {
            hoverEventData.handIndex = this.mouseOverHandIndex;
          }
        }
        SDK.NetworkManager.getInstance().broadcastGameEvent(hoverEventData);
      }
    }
  },
  getMouseOverCardNode() {
    return this.mouseOverCardNode;
  },
  getMouseOverSdkCard() {
    return this.mouseOverSdkCard;
  },
  getMouseOverHandIndex() {
    return this.mouseOverHandIndex;
  },

  /* endregion MOUSE OVER CARD */

  /* region MOUSE OVER ARTIFACT */

  setMouseOverArtifact(artifactNode) {
    const scene = this.getScene();
    const gameLayer = scene != null && scene.getGameLayer();
    if (gameLayer != null && this.getIsMyPlayer()) {
      if (this.mouseOverArtifactNode != null && this.mouseOverArtifactNode !== artifactNode) {
        gameLayer.stopShowingInspectCard(this.mouseOverArtifactNode.getSdkCard());
        this.mouseOverArtifactNode.setHighlighted(false);
        this.mouseOverArtifactNode = null;
        if (artifactNode == null) {
          gameLayer.getEventBus().trigger(EVENTS.game_hover_changed, { type: EVENTS.game_hover_changed, hover: null });
        }
      }

      if (artifactNode != null && this.mouseOverArtifactNode !== artifactNode) {
        this.mouseOverArtifactNode = artifactNode;
        // play sound
        audio_engine.current().play_effect(RSX.sfx_ui_in_game_hover.audio);

        // highlight
        this.mouseOverArtifactNode.setHighlighted(true);

        // show inspector
        gameLayer.showInspectCard(this.mouseOverArtifactNode.getSdkCard(), this.mouseOverArtifactNode);
        gameLayer.getEventBus().trigger(EVENTS.game_hover_changed, { type: EVENTS.game_hover_changed, hover: this.mouseOverArtifactNode });
      }
    }
  },

  getMouseOverArtifactNode() {
    return this.mouseOverArtifactNode;
  },

  getMouseOverSdkArtifact() {
    return this.mouseOverArtifactNode && this.mouseOverArtifactNode.getSdkCard();
  },

  /* endregion MOUSE OVER ARTIFACT */

  /* region MOUSE OVER REPLACE */

  setMouseOverReplaceNode(replaceNode) {
    const scene = this.getScene();
    const gameLayer = scene != null && scene.getGameLayer();
    if (gameLayer != null && this.getIsMyPlayer()) {
      if (this.mouseOverReplaceNode != null && this.mouseOverReplaceNode !== replaceNode) {
        this.mouseOverReplaceNode.setHighlighted(false);
        this.mouseOverReplaceNode = null;
        if (replaceNode == null) {
          gameLayer.getEventBus().trigger(EVENTS.game_hover_changed, { type: EVENTS.game_hover_changed, hover: null });
        }
      }

      if (replaceNode != null && this.mouseOverReplaceNode !== replaceNode) {
        this.mouseOverReplaceNode = replaceNode;
        this.mouseOverReplaceNode.setHighlighted(true);
        gameLayer.getEventBus().trigger(EVENTS.game_hover_changed, { type: EVENTS.game_hover_changed, hover: this.mouseOverReplaceNode });
      }
    }
  },
  getMouseOverReplaceNode() {
    return this.mouseOverReplaceNode;
  },

  /* endregion MOUSE OVER REPLACE */

  /* region TILES */

  removeAllSelectedTiles(fadeDuration) {
    if (this.selecting) {
      this.getTileLayer().removeTilesWithFade(this.selectedTiles, fadeDuration);
      this.removeBoxTileForSelect(fadeDuration);
      this._resetSelectedTileData();
      this._resetValidTargetNodes();
    }
  },
  _resetSelectedTileData() {
    this.selectedTiles = [];
    this.selectedMoveTiles = [];
    this.selectedAttackTiles = [];
    this.selectedMoveMap = [];
    this.selectedAttackMap = [];
    this.selectedBoxTile = null;
    this.selecting = false;
    this._selectedDirty = true;
  },

  removeAllSelectedCardTiles(fadeDuration) {
    if (this.selectedCard) {
      this.removeCardTiles(fadeDuration);
    }
  },
  removeAllFollowupCardTiles(fadeDuration) {
    if (this.followupCard) {
      this.removeCardTiles(fadeDuration);
    }
  },
  removeCardTiles(fadeDuration) {
    if (this.showingCard) {
      this.getTileLayer().removeTilesWithFade(this.cardTiles, fadeDuration);
      this._resetCardTileData();
      this._resetValidTargetNodes();
    }
  },
  _resetCardTileData() {
    this.cardTiles = [];
    this.cardValidTiles = [];
    this.cardMap = [];
    this.showingCard = false;
    this._cardDirty = true;
  },
  removeAllPreviewTiles(fadeDuration) {
    if (this.previewing) {
      this._resetPreview();
      if (CONFIG.SHOW_MERGED_MOVE_ATTACK_TILES) {
        this.getTileLayer().updateMergedTileTextures(RSX.tile_merged_large.frame, this.selectedMoveMap, this.selectedAttackMap);
      }
      this._fadeTiles(this.selectedTiles, fadeDuration);
    }
  },
  _resetPreview(fadeDuration) {
    this.getTileLayer().removeTilesWithFade(this.previewTiles, fadeDuration);
    this._resetPreviewTileData();
  },
  _resetPreviewTileData() {
    this.previewTiles = [];
    this.previewMoveTiles = [];
    this.previewAttackTiles = [];
    this.previewMoveMap = [];
    this.previewAttackMap = [];
    this.previewing = false;
    this._previewDirty = true;
  },

  _resetValidTargetNodes() {
    const validTargetNodes = this._validTargetNodes;
    if (validTargetNodes.length > 0) {
      this._validTargetNodes = [];
      for (let i = 0, il = validTargetNodes.length; i < il; i++) {
        validTargetNodes[i].setIsValidTarget(false);
      }
    }
  },

  getIsViewingTiles() {
    return !!(this.getSelectedEntityNode() || this.getSelectedCard());
  },

  previewEntityTiles(opacity, fadeDuration) {
    this.showEntityTiles(opacity, fadeDuration, true);
  },

  showEntityTiles(opacity, fadeDuration, preview) {
    const scene = this.getScene();
    const gameLayer = scene && scene.getGameLayer();
    if (gameLayer) {
      let entityNode;
      let sdkEntity;
      let showTiles;
      const isForMyPlayer = this.getIsMyPlayer();
      const isAltPlayer = this.getIsAltPlayer();
      if (preview) {
        entityNode = this.getMouseOverEntityNode();
        sdkEntity = this.getMouseOverSdkEntity();
        showTiles = this._previewDirty && !this.getSelectedSdkEntity();
      } else {
        entityNode = this.getSelectedEntityNode();
        sdkEntity = this.getSelectedSdkEntity();
        showTiles = this._selectedDirty;
      }

      if (showTiles && sdkEntity) {
        if (opacity == null) {
          if (preview && sdkEntity.isOwnedByMyPlayer()) {
            opacity = CONFIG.TILE_HOVER_OPACITY;
          } else {
            opacity = CONFIG.TILE_SELECT_OPACITY;
          }
        }
        if (fadeDuration == null) {
          fadeDuration = CONFIG.FADE_FAST_DURATION;
        }

        const isMyEntity = sdkEntity.isOwnedByMyPlayer();
        const entityPosition = sdkEntity.getPosition();

        // reset and organize by preview or selection
        let allTiles; let moveTiles; let attackTiles; let moveMap; let
          attackMap;
        if (preview) {
          this._resetPreview();
          this.removeHover(fadeDuration);
          // only fade selected attack tiles on preview
          // because we want to see where our entity can move
          this._fadeTiles(this.selectedAttackTiles, fadeDuration, 0.0);
          if (CONFIG.SHOW_MERGED_MOVE_ATTACK_TILES) {
            this.getTileLayer().updateMergedTileTextures(RSX.tile_merged_large.frame, this.selectedMoveMap);
          }

          this.previewing = true;
          this._previewDirty = false;

          allTiles = this.previewTiles;
          moveTiles = this.previewMoveTiles;
          attackTiles = this.previewAttackTiles;
          moveMap = this.previewMoveMap;
          attackMap = this.previewAttackMap;
        } else {
          this.removeAllPreviewTiles();
          this.removeAllSelectedTiles();

          this.selecting = true;
          this._selectedDirty = false;

          allTiles = this.selectedTiles;
          moveTiles = this.selectedMoveTiles;
          attackTiles = this.selectedAttackTiles;
          moveMap = this.selectedMoveMap;
          attackMap = this.selectedAttackMap;

          this.showBoxTileForSelect(UtilsEngine.transformBoardToScreen(entityPosition), opacity, fadeDuration, (isForMyPlayer || isAltPlayer) ? CONFIG.SELECT_COLOR : CONFIG.SELECT_OPPONENT_COLOR);
        }

        // only show move/attack tiles for own selection/preview
        if (isForMyPlayer) {
          // generate movement locations when entity has not moved
          let hasMoveTiles;
          const canMove = sdkEntity.getCanMove();
          if (canMove) {
            var moveLocations = [entityPosition];
            const movePaths = sdkEntity.getMovementRange().getValidPositions(SDK.GameSession.getInstance().getBoard(), sdkEntity);
            // generate list of final move locations from paths
            for (var i = 0, il = movePaths.length; i < il; i++) {
              moveLocations.push(movePaths[i][movePaths[i].length - 1]);
            }

            if (moveLocations && moveLocations.length > 1 && isMyEntity) {
              hasMoveTiles = true;
            }
          }

          // generate attack locations when entity has not attacked
          let attackPattern;
          if (sdkEntity.getCanAttack()) {
            if (!isMyEntity || CONFIG.SHOW_MERGED_MOVE_ATTACK_TILES) {
              attackPattern = sdkEntity.getAttackRange().getValidPositions(SDK.GameSession.getInstance().getBoard(), sdkEntity, moveLocations && moveLocations.length > 1 ? moveLocations : entityPosition);
            } else {
              attackPattern = [];
            }

            // find attackable targets
            if (!preview) {
              const attackableTargets = sdkEntity.getAttackRange().getValidTargets(SDK.GameSession.getInstance().getBoard(), sdkEntity, entityPosition);
              if (attackableTargets.length > 0) {
                for (var i = 0, il = attackableTargets.length; i < il; i++) {
                  const attackableTarget = attackableTargets[i];
                  const attackableEntityNode = gameLayer.getNodeForSdkCard(attackableTarget);
                  const attackableTargetPosition = attackableTarget.getPosition();
                  const attackableTargetTile = TileMapLargeSprite.create();

                  // set as valid target
                  if (attackableEntityNode != null) {
                    attackableEntityNode.setIsValidTarget(true);
                    this._validTargetNodes.push(attackableEntityNode);
                  }

                  // remove from attack pattern
                  for (let j = attackPattern.length - 1; j >= 0; j--) {
                    var attackPosition = attackPattern[i];
                    if (attackPosition.x === attackableTargetPosition.x && attackPosition.y === attackableTargetPosition.y) {
                      attackPattern.splice(j, 1);
                      break;
                    }
                  }

                  // show tile for target
                  attackableTargetTile.setPosition(UtilsEngine.transformBoardToScreen(attackableTargetPosition));
                  attackableTargetTile.setColor(CONFIG.AGGRO_COLOR);
                  allTiles.push(attackableTargetTile);
                  this.getTileLayer().addBoardBatchedTile(attackableTargetTile, this.attackableTargetTileZOrder, opacity, fadeDuration);
                }
              }
            }
          }

          // show move tiles
          if (hasMoveTiles) {
            moveMap = this.getTileLayer().getMapFromBoardPositions(moveLocations, moveMap);
            this.showMergedTilesForAction(moveLocations, moveMap, attackMap, RSX.tile_merged_large.frame, this.moveTileZOrder, opacity, fadeDuration, sdkEntity.isOwnedByMyPlayer() ? CONFIG.MOVE_COLOR : CONFIG.MOVE_OPPONENT_COLOR, moveTiles, allTiles);
          }

          // show attack tiles
          if (attackPattern && attackPattern.length > 0) {
            let attackLocations;
            if (moveMap && moveMap.length > 0) {
              // remove attack tiles wherever a move tile is already present
              attackLocations = [];
              for (var i = 0, il = attackPattern.length; i < il; i++) {
                var attackPosition = attackPattern[i];
                if (!UtilsPosition.getMapHasPosition(SDK.GameSession.getInstance().getBoard().getColumnCount(), moveMap, attackPosition)) {
                  attackLocations.push(attackPosition);
                }
              }
            } else {
              attackLocations = attackPattern.slice(0);
            }

            attackMap = this.getTileLayer().getMapFromBoardPositions(attackLocations, attackMap);
            this.showMergedTilesForAction(attackLocations, attackMap, moveMap, RSX.tile_merged_large.frame, this.aggroTileZOrder, opacity, fadeDuration, sdkEntity.isOwnedByMyPlayer() ? CONFIG.AGGRO_COLOR : CONFIG.AGGRO_OPPONENT_COLOR, attackTiles, allTiles);
          }
        }
      } else {
        this._fadeTiles(this.selectedMoveTiles, fadeDuration, opacity, true);
        this._fadeTiles(this.selectedAttackTiles, fadeDuration, opacity, true);
      }
    }
  },

  showCardTiles(card, opacity, altOpacity, fadeDuration) {
    if (this._cardDirty) {
      this.removeCardTiles();
      this.showingCard = true;
      this._cardDirty = false;
      const validPositions = card.getValidTargetPositions();

      if (opacity == null) { opacity = CONFIG.TILE_SELECT_OPACITY; }
      if (altOpacity == null) { altOpacity = CONFIG.TILE_DIM_OPACITY; }
      if (fadeDuration == null) { fadeDuration = CONFIG.FADE_FAST_DURATION; }

      // always color as card so as to not conflict with enemy tiles
      const color = CONFIG.CARD_PLAYER_COLOR;
      const altColor = CONFIG.CARD_PLAYER_ALT_COLOR;

      if (validPositions && validPositions.length > 0) {
        // show valid positions
        this.cardMap = this.getTileLayer().getMapFromBoardPositions(validPositions, this.cardMap);
        this.showMergedTilesForAction(validPositions, this.cardMap, null, RSX.tile_merged_large.frame, this.cardTileZOrder, opacity, fadeDuration, color, this.cardValidTiles, this.cardTiles);

        // set all entity nodes at valid positions as valid targets
        const scene = this.getScene();
        const gameLayer = scene && scene.getGameLayer();
        if (gameLayer) {
          const board = SDK.GameSession.getInstance().getBoard();
          for (let i = 0, il = validPositions.length; i < il; i++) {
            const validPosition = validPositions[i];
            const validTargetEntity = board.getUnitAtPosition(validPosition);
            const validEntityNode = validTargetEntity && gameLayer.getNodeForSdkCard(validTargetEntity);
            if (validEntityNode != null) {
              validEntityNode.setIsValidTarget(true);
              this._validTargetNodes.push(validEntityNode);
            }
          }
        }
      }
    }
  },
  _fadeTiles(tiles, fadeDuration, opacity, rememberOpacity) {
    if (tiles) {
      if (!_.isArray(tiles)) {
        tiles = [tiles];
      }

      if (fadeDuration == null) { fadeDuration = CONFIG.FADE_FAST_DURATION; }

      for (let i = 0, il = tiles.length; i < il; i++) {
        const tileSprite = tiles[i];
        var tileOpacity;
        if (opacity == null) {
          tileOpacity = tileSprite._tileOpacity;
        } else {
          tileOpacity = opacity;
          if (rememberOpacity) {
            tileSprite._tileOpacity = opacity;
          }
        }

        tileSprite.stopActionByTag(CONFIG.FADE_TAG);
        if (fadeDuration) {
          const fadeAction = cc.fadeTo(fadeDuration, tileOpacity);
          fadeAction.setTag(CONFIG.FADE_TAG);
          tileSprite.runAction(fadeAction);
        } else {
          tileSprite.setOpacity(tileOpacity);
        }
      }
    }
  },
  showMergedTilesForAction(locs, map, altMap, framePrefix, zOrder, opacity, fadeDuration, color, tiles, allTiles) {
    if (locs) {
      if (!_.isArray(locs)) {
        locs = [locs];
      }

      if (locs.length > 0) {
        tiles = this.getTileLayer().displayMergedTiles(locs, map, altMap, framePrefix, zOrder, opacity, fadeDuration, color, tiles);

        // add to the list of all tiles
        if (allTiles && allTiles !== tiles) {
          Array.prototype.push.apply(allTiles, tiles);
        }
      }
    }
  },

  /* endregion TILES */

  /* region HOVER */

  showHover(opacity, fadeDuration) {
    const scene = this.getScene();
    const gameLayer = scene != null && scene.getGameLayer();
    if (gameLayer != null) {
      const mouseIsOnBoard = this.getIsMouseOnBoard();
      const isForMyPlayer = this.getIsMyPlayer();
      const isAltPlayer = this.getIsAltPlayer();
      const sdkPlayer = this.getSdkPlayer();
      if (sdkPlayer == null || !gameLayer.getIsActive() || (!isForMyPlayer && !isAltPlayer && !mouseIsOnBoard)) {
        this.removeHover(fadeDuration);
      } else {
        let needsPassiveHover = true;
        const mouseBoardPosition = this.getMouseBoardPosition();
        const selectedSdkEntity = this.getSelectedSdkEntity();
        const mouseOverSdkEntity = this.getMouseOverSdkEntity();
        const followupCard = this.getFollowupCard();
        const selectedCard = this.getSelectedCard();
        const selectedCardNode = this.getSelectedCardNode();
        const mouseOverSdkCard = this.getMouseOverSdkCard();
        const card = followupCard || selectedCard;
        const mouseOverReplaceNode = this.getSdkPlayer().getDeck().getCanReplaceCardThisTurn() && this.getMouseOverReplaceNode();
        const withinAttackRange = selectedSdkEntity && (!mouseOverSdkEntity || !mouseOverSdkEntity.isOwnedBy(sdkPlayer)) && selectedSdkEntity.getAttackRange().getIsPositionValid(SDK.GameSession.getInstance().getBoard(), selectedSdkEntity, mouseBoardPosition);

        // some tiles are generic and may use float positions
        // so we need to check them every time
        let path;
        let activePath = this.pathIsActive;
        let directPath = this.pathIsDirect;
        let { pathColor } = this;
        let activeTarget = this.targetIsActive;
        let { targetColor } = this;
        let { targetSpriteIdentifier } = this;

        if (mouseOverReplaceNode) {
          // reset some values when mouse is over replace
          needsPassiveHover = false;
        } else if (!mouseIsOnBoard) {
          // reset some values when mouse is not on board
          needsPassiveHover = false;
          activeTarget = false;
          activePath = false;
        }

        // hover position must be different from existing
        if (this.getHoverDirty()) {
          const wasHoveringOnBoard = this.hoveringOnBoard;
          let hoverFadeDuration;
          if (wasHoveringOnBoard) {
            hoverFadeDuration = 0.0;
          } else if (fadeDuration != null) {
            hoverFadeDuration = fadeDuration;
          } else {
            hoverFadeDuration = CONFIG.FADE_FAST_DURATION;
          }
          const forOpponentDeckAction = !isForMyPlayer && !isAltPlayer && this.getIntentTypeIsDeck();
          const forMyCardAction = !forOpponentDeckAction && card && (followupCard || (selectedCard && selectedCard.getDoesOwnerHaveEnoughManaToPlay()));
          let spellAffectBoardPositions;
          let sameSpellPositions;
          if (forMyCardAction && card instanceof SDK.Spell) {
            spellAffectBoardPositions = card.getAffectPositionsFromPattern(mouseBoardPosition);
            sameSpellPositions = UtilsPosition.getArraysOfPositionsAreEqual(spellAffectBoardPositions, this._mouseOverSpellAffectBoardPositions);
          }
          this.removeHover((mouseIsOnBoard ? 0.0 : fadeDuration), true, sameSpellPositions);
          this.hovering = true;
          this.hoveringOnBoard = mouseIsOnBoard;
          this.hoverChanged = true;
          this.setHoverDirty(false);

          var { mouseScreenBoardPosition } = this;

          // show hover for actions
          if (!this.getShowPathsLocked()) {
            if (forOpponentDeckAction) {
              // opponent selected card
              this.showCardTile(mouseScreenBoardPosition, opacity, fadeDuration, CONFIG.CARD_OPPONENT_ALT_COLOR);

              // hover tile
              needsPassiveHover = false;
              var hoverTileSprite = TileMapHoverSprite.create();
              hoverTileSprite.setPosition(mouseScreenBoardPosition);
              hoverTileSprite.setColor(CONFIG.CARD_OPPONENT_COLOR);
              this.mouseOverTiles.push(hoverTileSprite);
              this.getTileLayer().addBoardBatchedTile(hoverTileSprite, this.mouseOverTileZOrder, CONFIG.TILE_HOVER_OPACITY, hoverFadeDuration);

              let pathSource;
              if (!this.getShouldShowTargetingPathFromGeneral() || selectedCardNode != null) {
                pathSource = selectedCardNode.getPosition();
              } else {
                pathSource = UtilsEngine.transformBoardToTileMap(SDK.GameSession.getInstance().getGeneralForPlayerId(sdkPlayer.getPlayerId()).getPosition());
              }

              path = [
                pathSource,
                this.getMouseTileMapBoardPosition(),
              ];

              activePath = true;
              directPath = true;
              pathColor = CONFIG.CARD_OPPONENT_COLOR;
            } else if (forMyCardAction) {
              // card
              if (card.getIsPositionValidTarget(mouseBoardPosition)) {
                needsPassiveHover = false;
                path = [
                  followupCard ? UtilsEngine.transformBoardToTileMap(followupCard.getFollowupSourcePosition()) : selectedCardNode.getPosition(),
                  this.getMouseTileMapBoardPosition(),
                ];
                activePath = true;
                directPath = true;

                // always color as card so as to not conflict with enemy tiles
                const color = CONFIG.CARD_PLAYER_COLOR;
                const altColor = CONFIG.CARD_PLAYER_ALT_COLOR;

                if (card instanceof SDK.Spell) {
                  this.showSpellTile(mouseScreenBoardPosition, opacity, fadeDuration, altColor);
                  if (!sameSpellPositions) {
                    this._mouseOverSpellAffectBoardPositions = spellAffectBoardPositions;
                    this._showActiveHoverTile(this._mouseOverSpellAffectBoardPositions, this.mouseOverSpellTiles, RSX.tile_merged_hover.frame, opacity, fadeDuration, color);
                  }
                } else {
                  this.showSpawnTile(mouseScreenBoardPosition, opacity, fadeDuration, altColor);

                  var hoverTileSprite = TileMapHoverSprite.create();
                  hoverTileSprite.setPosition(mouseScreenBoardPosition);
                  hoverTileSprite.setColor(color);
                  this.mouseOverTiles.push(hoverTileSprite);
                  this.getTileLayer().addBoardBatchedTile(hoverTileSprite, this.mouseOverTileZOrder, CONFIG.TILE_HOVER_OPACITY, hoverFadeDuration);
                }
              }
            } else if (selectedSdkEntity) {
              // mouse over sdk entity
              if (mouseOverSdkEntity && selectedSdkEntity !== mouseOverSdkEntity && withinAttackRange && mouseOverSdkEntity.getIsActive() && mouseOverSdkEntity.getIsTargetable()) {
                // attack entity
                if (this.selectedBoxTile != null && CONFIG.TILE_SELECT_FREEZE_ON_ATTACK_MOVE) {
                  this.selectedBoxTile.stopPulsingScale();
                }
                if (isForMyPlayer) {
                  pathColor = CONFIG.AGGRO_ALT_COLOR;

                  this.setIntentType(SDK.IntentType.DamageIntent);

                  var hoverTileSprite = TileMapHoverSprite.create();
                  hoverTileSprite.setPosition(mouseScreenBoardPosition);
                  hoverTileSprite.setColor(CONFIG.AGGRO_COLOR);
                  this.mouseOverTiles.push(hoverTileSprite);
                  this.getTileLayer().addBoardBatchedTile(hoverTileSprite, this.mouseOverTileZOrder, CONFIG.TILE_HOVER_OPACITY, hoverFadeDuration);
                } else {
                  pathColor = CONFIG.AGGRO_OPPONENT_COLOR;
                }
                targetColor = (isForMyPlayer || isAltPlayer) ? CONFIG.AGGRO_ALT_COLOR : CONFIG.AGGRO_OPPONENT_ALT_COLOR;
                activeTarget = true;
                path = [
                  UtilsEngine.transformBoardToTileMap(selectedSdkEntity.getPosition()),
                  this.getMouseTileMapBoardPosition(),
                ];
                activePath = true;
                directPath = true;
                needsPassiveHover = false;
              }

              // show move path
              if (needsPassiveHover && selectedSdkEntity.getCanMove() && selectedSdkEntity.getMovementRange().getIsPositionValid(SDK.GameSession.getInstance().getBoard(), selectedSdkEntity, mouseBoardPosition)) {
                if (this.selectedBoxTile != null && CONFIG.TILE_SELECT_FREEZE_ON_ATTACK_MOVE) {
                  this.selectedBoxTile.stopPulsingScale();
                }

                this.showGlowTileForAction(mouseScreenBoardPosition, this.selectTileZOrder, opacity, fadeDuration, (isForMyPlayer || isAltPlayer) ? CONFIG.MOVE_ALT_COLOR : CONFIG.MOVE_OPPONENT_COLOR);
                // var hoverTileSprite = TileMapHoverSprite.create();
                // hoverTileSprite.setPosition(mouseScreenBoardPosition);
                // hoverTileSprite.setColor((isForMyPlayer || isAltPlayer) ? CONFIG.MOUSE_OVER_COLOR : CONFIG.MOUSE_OVER_OPPONENT_COLOR);
                // this.mouseOverTiles.push(hoverTileSprite);
                // this.getTileLayer().addBoardBatchedTile(hoverTileSprite, this.boardTileZOrder, CONFIG.TILE_FAINT_OPACITY, hoverFadeDuration);

                pathColor = (isForMyPlayer || isAltPlayer) ? CONFIG.MOVE_COLOR : CONFIG.MOVE_OPPONENT_ALT_COLOR;
                if (isForMyPlayer) {
                  this.setIntentType(SDK.IntentType.MoveIntent);
                }
                targetColor = CONFIG.MOVE_ALT_COLOR;
                path = selectedSdkEntity.getMovementRange().getPathTo(selectedSdkEntity.getGameSession().getBoard(), selectedSdkEntity, mouseBoardPosition);
                activePath = true;
                directPath = false;
                needsPassiveHover = false;
              }
            }
          }

          // fallback to passive hover
          if (needsPassiveHover) {
            if (!isForMyPlayer && !isAltPlayer && !selectedSdkEntity) {
              this.showOpponentTile(mouseScreenBoardPosition, this.boardTileZOrder, opacity, fadeDuration, CONFIG.AGGRO_OPPONENT_ALT_COLOR);
            }

            var hoverTileSprite = TileMapHoverSprite.create();
            hoverTileSprite.setPosition(mouseScreenBoardPosition);
            hoverTileSprite.setColor((isForMyPlayer || isAltPlayer) ? CONFIG.MOUSE_OVER_COLOR : CONFIG.MOUSE_OVER_OPPONENT_COLOR);
            this.mouseOverTiles.push(hoverTileSprite);
            this.getTileLayer().addBoardBatchedTile(hoverTileSprite, this.boardTileZOrder, CONFIG.TILE_FAINT_OPACITY, hoverFadeDuration);

            // passive hover usually means passive path/target
            activePath = activeTarget = false;
            pathColor = targetColor = null;
            targetSpriteIdentifier = null;
          }

          gameLayer.getEventBus().trigger(EVENTS.game_hover_changed, { type: EVENTS.game_hover_changed, hovered: mouseBoardPosition });
        } else {
          this.hoverChanged = false;
        }

        let pathAllowed;
        let targetAllowed;
        if (!this.getShowPathsLocked() && (card && !mouseOverSdkCard)) {
          pathAllowed = true;
          targetAllowed = mouseIsOnBoard && (!card || !activePath);
        }

        // handle path
        if (!path) {
          if (activePath && this.pathLocs) {
            // use last active path
            path = this.pathLocs;
          } else if (pathAllowed) {
            // create constant direct path when selecting a entity or doing an action after applied
            let pathSourceScreenPosition;
            if (selectedSdkEntity) {
              pathSourceScreenPosition = UtilsEngine.transformBoardToTileMap(selectedSdkEntity.getPosition());
            } else if (followupCard) {
              pathSourceScreenPosition = UtilsEngine.transformBoardToTileMap(followupCard.getFollowupSourcePosition());
            } else if (selectedCard) {
              pathSourceScreenPosition = selectedCardNode.getPosition();
            }
            let pathTargetScreenPosition;
            if (isForMyPlayer || isAltPlayer) {
              if (mouseOverReplaceNode) {
                activeTarget = true;
                activePath = true;
                pathTargetScreenPosition = mouseOverReplaceNode.getPosition();
              } else {
                pathTargetScreenPosition = this.mouseGlobalScaleInvertedScreenPosition;
              }
            } else {
              pathTargetScreenPosition = this.getMouseTileMapBoardPosition();
            }
            if (pathSourceScreenPosition && pathTargetScreenPosition) {
              path = [pathSourceScreenPosition, pathTargetScreenPosition];
              directPath = true;
            }
          }
        }

        // check that path has at least a start and end
        if (path && path.length > 1) {
          if (!UtilsPosition.getArraysOfPositionsAreEqual(this.pathLocs, path)) {
            // store path and show new
            if (pathColor == null) {
              pathColor = !isForMyPlayer && !isAltPlayer ? CONFIG.AGGRO_OPPONENT_ALT_COLOR : (directPath && selectedSdkEntity ? CONFIG.AGGRO_ALT_COLOR : CONFIG.PATH_COLOR);
            }
            this.showPath(path, activePath, directPath, opacity, fadeDuration, pathColor);
          }
        } else {
          path = null;
          this.removePath(fadeDuration);
        }

        // target tile
        if (targetAllowed && pathAllowed) {
          if (!isForMyPlayer && !isAltPlayer) {
            targetColor = CONFIG.AGGRO_OPPONENT_COLOR;
          } else if (targetColor == null) {
            targetColor = CONFIG.PATH_COLOR;
          }
          if (directPath && withinAttackRange) {
            this._showAttackFX();
          } else {
            this._removeAttackFX();
          }
          this.showTargetTile(path ? UtilsEngine.transformTileMapToScreen(path[path.length - 1]) : mouseScreenBoardPosition, activeTarget, opacity, fadeDuration, targetColor, targetSpriteIdentifier);
        } else {
          this.removeTargetTile(fadeDuration);
          this._removeAttackFX();
        }
      }
    }
  },
  _showActiveHoverTile(locs, tiles, framePrefix, opacity, fadeDuration, color, fadeOpacity, fadeTiles) {
    if (opacity == null) { opacity = CONFIG.TILE_HOVER_OPACITY; }
    if (fadeDuration == null) { fadeDuration = CONFIG.FADE_FAST_DURATION; }
    if (fadeOpacity == null) { fadeOpacity = CONFIG.TILE_DIM_OPACITY; }
    if (fadeTiles == null) { fadeTiles = this.selectedTiles; }
    this._fadeTiles(fadeTiles, fadeDuration, fadeOpacity);
    this.showMergedTilesForAction(locs, null, null, framePrefix, this.mouseOverTileZOrder, opacity, fadeDuration, color, tiles);
  },
  getHoverDirty() {
    return this._hoverDirty;
  },
  setHoverDirty(val) {
    this._hoverDirty = val || false;
  },
  removeHover(fadeDuration, keepPersistent, keepSpellTiles) {
    if (this.getHovering()) {
      this.getTileLayer().removeTilesWithFade(this.mouseOverTiles, fadeDuration);
      this.mouseOverTiles = [];
      if (!keepSpellTiles) {
        this.getTileLayer().removeTilesWithFade(this.mouseOverSpellTiles, fadeDuration);
        this.mouseOverSpellTiles = [];
        this._mouseOverSpellAffectBoardPositions = null;
      }
      this.hovering = false;
      this.hoveringOnBoard = false;
      this.hoverChanged = true;
      this.setHoverDirty(true);

      // reset tiles to pre-hover state
      if (CONFIG.SHOW_MERGED_MOVE_ATTACK_TILES) {
        this.getTileLayer().updateMergedTileTextures(RSX.tile_merged_large.frame, this.selectedMoveMap, this.selectedAttackMap);
      }
      this._fadeTiles(this.selectedTiles, fadeDuration);
      this.removeBoxTileForAction(fadeDuration);
      this.removeGlowTileForAction(fadeDuration);
      this.removeSpawnTile(fadeDuration);
      this.removeSpellTile(fadeDuration);
      this.removeCardTile(fadeDuration);
      this.removeOpponentTile(fadeDuration);
      if (this.selectedBoxTile != null && CONFIG.TILE_SELECT_FREEZE_ON_ATTACK_MOVE) { this.selectedBoxTile.startPulsingScale(CONFIG.PULSE_MEDIUM_DURATION, 0.85); }

      if (!keepPersistent) {
        this._removeAttackFX();
        this.removeTargetTile(fadeDuration);
        this.removePath(fadeDuration);
      }

      // clear out intent
      this.updateIntent();

      const scene = this.getScene();
      const gameLayer = scene != null && scene.getGameLayer();
      if (gameLayer != null) {
        gameLayer.getEventBus().trigger(EVENTS.game_hover_changed, { type: EVENTS.game_hover_changed, hovered: null });
      }
    } else {
      this.hoverChanged = false;
    }
  },
  getHovering() {
    return this.hovering;
  },
  getHoverChanged() {
    return this.hoverChanged;
  },

  /* endregion HOVER */

  /* region PATH */

  requestShowPathsLocked(id) {
    if (id == null) {
      id = this._showPathsLockId;
    }
    if (!_.contains(this._showPathsLockRequests, id)) {
      const numRequests = this._showPathsLockRequests.length;
      this._showPathsLockRequests.push(id);
      if (numRequests === 0 && this._showPathsLockRequests.length === 1) {
        this.setShowPathsLocked(true);
      }
    }
  },

  requestShowPathsUnlocked(id) {
    if (id == null) {
      id = this._showPathsLockId;
    }
    const indexOf = _.lastIndexOf(this._showPathsLockRequests, id);
    if (indexOf !== -1) {
      const numRequests = this._showPathsLockRequests.length;
      this._showPathsLockRequests.splice(indexOf, 1);
      if (numRequests === 1 && this._showPathsLockRequests.length === 0) {
        this.setShowPathsLocked(false);
      }
    }
  },

  setShowPathsLocked(val) {
    if (this._showPathsLocked != val) {
      this._showPathsLocked = val;
      if (this._showPathsLocked) {
        this.removePath(CONFIG.FADE_FAST_DURATION);
      }
    }
  },

  getShowPathsLocked() {
    return this._showPathsLocked;
  },

  showPath(path, active, direct, opacity, fadeDuration, color) {
    // when path makes a major change, destroy current path
    if (this.pathIsActive !== active || this.pathIsDirect !== direct) {
      this.removePath(fadeDuration);
    }

    if (!this.getShowPathsLocked()) {
      // show/update path
      if (direct) {
        this.showDirectPath(path, active, opacity, fadeDuration, color);
      } else {
        this.showTilePath(path, active, opacity, fadeDuration, color);
      }

      this.pathLocs = path;
      this.pathIsActive = active;
      this.pathIsDirect = direct;
      this.pathColor = color;
    }
  },
  showTilePath(boardPath, active, opacity, fadeDuration, color) {
    if (opacity == null) { opacity = (active ? CONFIG.PATH_TILE_ACTIVE_OPACITY : CONFIG.PATH_TILE_DIM_OPACITY); }
    if (fadeDuration == null) { fadeDuration = CONFIG.FADE_FAST_DURATION; }
    if (color == null) { color = CONFIG.PATH_COLOR; }

    let i; let
      il;

    // always remove previous tile path
    this.removePath(fadeDuration);

    // convert board path to screen path
    const screenPositions = [];
    for (i = 0, il = boardPath.length; i < il; i++) {
      screenPositions[i] = UtilsEngine.transformBoardToScreen(boardPath[i]);
    }

    // create tiles for path
    let tileSprite;
    const startScreenPosition = screenPositions[0];
    for (i = 0, il = screenPositions.length; i < il; i++) {
      const screenPosition = screenPositions[i];
      const prevScreenPosition = screenPositions[i - 1];
      const nextScreenPosition = screenPositions[i + 1];
      tileSprite = this.getNextTilePathTile(screenPosition, prevScreenPosition, nextScreenPosition, color, prevScreenPosition === startScreenPosition);
      this.pathTiles.push(tileSprite);
    }

    // show path
    this.getTileLayer().addBoardBatchedTiles(this.pathTiles, this.pathTileZOrder, opacity, fadeDuration);
  },
  getNextTilePathTile(screenPosition, prevScreenPosition, nextScreenPosition, color, fromStart) {
    // deltas and rotation
    let pdx; let pdy; let
      pa;
    let ndx; let ndy; let
      na;
    let radians;
    if (prevScreenPosition) {
      pdx = screenPosition.x - prevScreenPosition.x;
      pdy = screenPosition.y - prevScreenPosition.y;
      radians = pa = -Math.atan2(pdy, pdx);
    }
    if (nextScreenPosition) {
      ndx = nextScreenPosition.x - screenPosition.x;
      ndy = nextScreenPosition.y - screenPosition.y;
      radians = na = -Math.atan2(ndy, ndx);
    }

    let corner;
    let isFlipped;
    if (nextScreenPosition && prevScreenPosition) {
      // path is turning
      if (na !== pa) {
        corner = true;
        // check for possible corner angles
        if (pa === 0) {
          radians = na === Math.PI * 0.5 ? 0.0 : Math.PI * 0.5;
        } else if (pa === Math.PI || pa === -Math.PI) {
          radians = na === Math.PI * 0.5 ? Math.PI * 1.5 : Math.PI;
        } else if (pa === Math.PI * 0.5) {
          radians = na === Math.PI || na === -Math.PI ? Math.PI * 0.5 : Math.PI;
        } else if (pa === -Math.PI * 0.5) {
          radians = na === Math.PI || na === -Math.PI ? 0.0 : Math.PI * 1.5;
        }

        // check for whether corner needs to be flipped
        if (fromStart && ((pa === 0 && na === -Math.PI * 0.5)
          || (pa === -Math.PI && na === Math.PI * 0.5)
          || (pa === Math.PI * 0.5 && na === 0.0)
          || (pa === -Math.PI * 0.5 && na === -Math.PI))) {
          isFlipped = true;
          radians -= Math.PI * 0.5;
        }
      }
    }

    // texture
    let tileMapPathMoveClass;
    if (!prevScreenPosition) {
      tileMapPathMoveClass = TileMapPathMoveStartSprite;
    } else if (!nextScreenPosition) {
      if (fromStart) {
        tileMapPathMoveClass = TileMapPathMoveEndFromStartSprite;
      } else {
        tileMapPathMoveClass = TileMapPathMoveEndSprite;
      }
    } else if (corner) {
      if (fromStart) {
        tileMapPathMoveClass = isFlipped ? TileMapPathMoveCornerFromStartFlippedSprite : TileMapPathMoveCornerFromStartSprite;
      } else {
        tileMapPathMoveClass = isFlipped ? TileMapPathMoveCornerFlippedSprite : TileMapPathMoveCornerSprite;
      }
    } else if (fromStart) {
      tileMapPathMoveClass = TileMapPathMoveStraightFromStartSprite;
    } else {
      tileMapPathMoveClass = TileMapPathMoveStraightSprite;
    }

    const tileSprite = tileMapPathMoveClass.create();
    tileSprite.setPosition(screenPosition);
    tileSprite.setRotation(cc.radiansToDegrees(radians));

    if (color) {
      tileSprite.setColor(color);
    }

    return tileSprite;
  },
  showDirectPath(screenPath, active, opacity, fadeDuration, color) {
    if (opacity == null) { opacity = (active ? CONFIG.PATH_DIRECT_ACTIVE_OPACITY : CONFIG.PATH_DIRECT_DIM_OPACITY); }
    if (fadeDuration == null) { fadeDuration = CONFIG.FADE_FAST_DURATION; }
    if (color == null) { color = CONFIG.PATH_COLOR; }

    let i; let
      il;
    let attackPathSprite;

    // create tiles for max length path
    const directPathTileWidth = CONFIG.TILESIZE * 0.4;
    const winSize = UtilsEngine.getGSIWinSize();
    const maxDistance = Math.sqrt(winSize.width * winSize.width + winSize.height * winSize.height);
    const maxNumTiles = Math.ceil(maxDistance / directPathTileWidth);
    if (this.pathTiles.length !== maxNumTiles) {
      // remove previous
      this.removePath(fadeDuration);

      // create new
      this.pathTiles = [];
      for (i = 0; i < maxNumTiles; i++) {
        attackPathSprite = AttackPathSprite.create();
        attackPathSprite.setScale(directPathTileWidth / attackPathSprite._contentSize.width);
        if (color) { attackPathSprite.setColor(color); }
        attackPathSprite.setOpacity(0.0);
        attackPathSprite.fadeTo(fadeDuration, opacity);

        this.pathTiles.push(attackPathSprite);
      }

      // show path
      this.getScene().getGameLayer().addNodes(this.pathTiles, { layerName: 'uiLayer' });
    }

    // update path
    const startScreenPosition = screenPath[0];
    const endScreenPosition = screenPath[screenPath.length - 1];
    const dx = endScreenPosition.x - startScreenPosition.x;
    const dy = endScreenPosition.y - startScreenPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / distance;
    const ny = dy / distance;
    const startPosition = startScreenPosition;
    const endPosition = cc.p(startPosition.x + maxDistance * nx, startPosition.y + maxDistance * ny);
    for (i = 0, il = this.pathTiles.length; i < il; i++) {
      attackPathSprite = this.pathTiles[i];
      attackPathSprite.setPath(startPosition, endPosition, distance, maxDistance, i / maxNumTiles);
    }
  },
  removePath(fadeDuration) {
    if (this.pathTiles && this.pathTiles.length > 0) {
      this.getTileLayer().removeTilesWithFade(this.pathTiles, fadeDuration);
      this._resetPathTileData();
    }
  },
  _resetPathTileData() {
    this.pathTiles = [];
    this.pathLocs = [];
    this.pathIsActive = false;
    this.pathIsDirect = false;
    this.pathColor = null;
  },

  /* endregion PATH */

  /* region SPECIAL TILES */

  showBoxTileForSelect(position, opacity, fadeDuration, color) {
    if (!this.selectedBoxTile) {
      this.selectedBoxTile = TileBoxSprite.create();
      this.selectedTiles.push(this.selectedBoxTile);
    }
    this._showPulsingScaleTile(this.selectedBoxTile, position, opacity, fadeDuration, color);
  },
  removeBoxTileForSelect(fadeDuration) {
    if (this.selectedBoxTile) {
      this.getTileLayer().removeTileWithFade(this.selectedBoxTile, fadeDuration);
      this.selectedBoxTile = null;
    }
  },
  showBoxTileForAction(position, opacity, fadeDuration, color) {
    if (!this.selectedActionTile) {
      this.selectedActionTile = TileBoxSprite.create();
    }
    this._showPulsingScaleTile(this.selectedActionTile, position, opacity, fadeDuration, color);
  },
  removeBoxTileForAction(fadeDuration) {
    if (this.selectedActionTile) {
      this.getTileLayer().removeTileWithFade(this.selectedActionTile, fadeDuration);
      this.selectedActionTile = null;
    }
  },
  showTargetTile(position, active, opacity, fadeDuration, color, spriteIdentifier) {
    if (opacity == null) { opacity = active ? CONFIG.TARGET_ACTIVE_OPACITY : CONFIG.TARGET_DIM_OPACITY; }
    if (color == null) { color = CONFIG.AGGRO_COLOR; }
    if (spriteIdentifier == null) { spriteIdentifier = RSX.tile_target.frame; }

    // when active state changes, reset target tile
    if (active !== this.targetIsActive) {
      this.removeTargetTile(fadeDuration);
    }

    if (!this.targetTile) {
      if (spriteIdentifier === RSX.tile_attack.frame) {
        this.targetTile = TileAttackSprite.create();
      } else {
        this.targetTile = BaseSprite.create(spriteIdentifier);
      }
      if (active) {
        // active should be shown as a pulsing scale tile in the tilemap
        this._showPulsingScaleTile(this.targetTile, position, opacity, fadeDuration, color);
      } else {
        // passive target tile should not pulse
        this._showSpecialTile(this.targetTile, position, this.selectTileZOrder, opacity, fadeDuration, color);
      }
    } else {
      this.targetTile.setPosition(position);
      this.targetTile.setColor(color);
    }

    this.targetIsActive = active;
    this.targetColor = color;
    this.targetSpriteIdentifier = spriteIdentifier;
  },
  removeTargetTile(fadeDuration) {
    if (this.targetTile) {
      this.getTileLayer().removeTileWithFade(this.targetTile, fadeDuration);
      this.targetTile = null;
      this.targetIsActive = false;
      this.targetColor = null;
      this.targetSpriteIdentifier = null;
    }
  },
  showSpawnTile(position, opacity, fadeDuration, color) {
    color || (color = CONFIG.NEUTRAL_COLOR);
    if (!this.cardTile) {
      this.cardTile = TileSpawnSprite.create();
    }
    this._showPulsingScaleTile(this.cardTile, position, opacity, fadeDuration, color);
  },
  removeSpawnTile(fadeDuration) {
    if (this.cardTile) {
      this.getTileLayer().removeTileWithFade(this.cardTile, fadeDuration);
      this.cardTile = null;
    }
  },
  showSpellTile(position, opacity, fadeDuration, color) {
    color || (color = CONFIG.NEUTRAL_COLOR);
    if (!this.cardTile) {
      this.cardTile = TileSpellSprite.create();
    }
    this._showPulsingScaleTile(this.cardTile, position, opacity, fadeDuration, color);
  },
  removeSpellTile(fadeDuration) {
    if (this.cardTile) {
      this.getTileLayer().removeTileWithFade(this.cardTile, fadeDuration);
      this.cardTile = null;
    }
  },
  showCardTile(position, opacity, fadeDuration, color) {
    if (color == null) { color = CONFIG.NEUTRAL_ALT_COLOR; }
    if (!this.cardTile) {
      this.cardTile = TileCardSprite.create();
    }
    this._showPulsingScaleTile(this.cardTile, position, opacity, fadeDuration, color);
  },
  removeCardTile(fadeDuration) {
    if (this.cardTile) {
      this.getTileLayer().removeTileWithFade(this.cardTile, fadeDuration);
      this.cardTile = null;
    }
  },
  showOpponentTile(position, zOrder, opacity, fadeDuration, color) {
    if (opacity == null) { opacity = CONFIG.TILE_FAINT_OPACITY; }
    if (color == null) { color = CONFIG.AGGRO_OPPONENT_ALT_COLOR; }
    if (!this.opponentTile) {
      this.opponentTile = TileOpponentSprite.create();
    }
    this._showSpecialTile(this.opponentTile, position, zOrder, opacity, fadeDuration, color);
  },
  removeOpponentTile(fadeDuration) {
    if (this.opponentTile) {
      this.getTileLayer().removeTileWithFade(this.opponentTile, fadeDuration);
      this.opponentTile = null;
    }
  },
  showGlowTileForAction(position, zOrder, opacity, fadeDuration, color) {
    if (opacity == null) { opacity = 50; }
    if (!this.selectedActionTile) {
      this.selectedActionTile = TileGlowSprite.create();
    }
    this._showSpecialTile(this.selectedActionTile, position, zOrder, opacity, fadeDuration, color);
  },
  removeGlowTileForAction(fadeDuration) {
    if (this.selectedActionTile) {
      this.getTileLayer().removeTileWithFade(this.selectedActionTile, fadeDuration);
      this.selectedActionTile = null;
    }
  },

  _showSpecialTile(tile, position, zOrder, opacity, fadeDuration, color) {
    if (zOrder == null) { zOrder = this.selectTileZOrder; }
    if (opacity == null) { opacity = CONFIG.TILE_SELECT_OPACITY; }
    if (fadeDuration == null) { fadeDuration = CONFIG.FADE_FAST_DURATION; }

    tile.setPosition(position);
    if (color) {
      tile.setColor(color);
    }

    if (!tile.isRunning()) {
      this.getTileLayer().addTiles(tile, zOrder, opacity, fadeDuration);
    }
  },
  _showPulsingScaleTile(tile, position, opacity, fadeDuration, color, scale) {
    if (color == null) { color = CONFIG.SELECT_COLOR; }
    if (scale == null) { scale = 0.85; }
    tile.setScale(1.0);
    tile.startPulsingScale(CONFIG.PULSE_MEDIUM_DURATION, scale);
    this._showSpecialTile(tile, position, this.selectTileZOrder, opacity, fadeDuration, color);
  },

  /* endregion SPECIAL TILES */

});

Player.create = function (playerId) {
  return new Player(playerId);
};

module.exports = Player;
