// pragma PKGS: game

const CONFIG = require('app/common/config');
const EVENTS = require('app/common/event_types');
const SDK = require('app/sdk');
const UtilsEngine = require('app/common/utils/utils_engine');
const UtilsPosition = require('app/common/utils/utils_position');
const audio_engine = require('../../../audio/audio_engine');
const BaseSprite = require('../BaseSprite');
const EntitySprite = require('./EntitySprite');
const EntityNode = require('./EntityNode');

/** **************************************************************************
TileNode
 *************************************************************************** */

const TileNode = EntityNode.extend({

  _showingIdleState: false,
  _showingOccupiedState: false,
  _showingDepletedState: false,

  ctor(sdkCard) {
    this._super(sdkCard);

    if (sdkCard.getDepleted()) {
      this.showDepletedState(false);
    } else if (sdkCard.getOccupant()) {
      this.showOccupiedState(false);
    }
  },

  initEntitySprites(spriteOptions) {
    this.whenResourcesReady(this.getCardResourceRequestId()).then((cardResourceRequestId) => {
      if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

      spriteOptions || (spriteOptions = {});

      // init sprites
      this.entitySprite = EntitySprite.create(spriteOptions);
      if (spriteOptions.scale == null) { this.entitySprite.setScale(CONFIG.SCALE); }

      // position sprites
      this.entitySprite.setPosition(this.getCenterPosition());

      // add to scene
      this.addChild(this.entitySprite);
    });
  },

  getPositionForExternalFX() {
    if (this.layerName === 'tileLayer') {
      return UtilsEngine.transformScreenToTileMap(this.getPosition());
    }
    return EntityNode.prototype.getPositionForExternalFX.call(this);
  },

  _getColorForOwnerTint() {
    if (this.sdkCard == null || this.sdkCard.isOwnedByMyPlayer()) {
      return CONFIG.PLAYER_TILE_COLOR;
    }
    return CONFIG.OPPONENT_TILE_COLOR;
  },

  showCurrentState(showFX) {
    const sdkCard = this.getSdkCard();
    if (sdkCard != null) {
      if (sdkCard.getDepleted()) {
        this.showDepletedState(showFX);
      } else if (sdkCard.getOccupant()) {
        this.showOccupiedState(showFX);
      } else {
        this.showBaseState();
      }
    }
  },

  showNoState() {
    EntityNode.prototype.showNoState.call(this);
    this._showingDepletedState = this._showingOccupiedState = this._showingIdleState = false;
  },

  showBaseState() {
    this.whenResourcesReady(this.getCardResourceRequestId()).then((cardResourceRequestId) => {
      if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

      if (this.canChangeState() && !this._showingIdleState) {
        this.showNoState();
        this._showingIdleState = true;

        if (this.getSoundResource() && this.getSoundResource().idle) {
          audio_engine.current().play_effect(this.getSoundResource().idle, false);
        }

        const animActionIdle = this.getAnimResource() && UtilsEngine.getAnimationAction(this.getAnimResource().idle, true);
        if (animActionIdle != null) {
          this.entitySprite.runAction(animActionIdle);
        }
      }
    });
  },

  showPlaceholderSprites() {
    // TODO: maybe show actual placeholder sprites
    this.entitySprite.setOpacity(0);
  },

  showSpawnSprites() {
    const sdkCard = this.getSdkCard();
    // when an apply/spawn animation is present
    const animActionApply = this.getAnimResource() && UtilsEngine.getAnimationAction(this.getAnimResource().apply);
    if (animActionApply != null) {
      this.showNoState();
      this.entitySprite.setOpacity(255);
      this._stateActions.push(this.entitySprite.runAction(cc.sequence(
        animActionApply,
        cc.callFunc(this.showNextState, this),
      )));
    } else {
      this.showBaseState();
      this.entitySprite.setOpacity(0);
      this.entitySprite.fadeTo(CONFIG.FADE_MEDIUM_DURATION, 255);
    }
  },

  showOccupiedState(showFX) {
    this.whenResourcesReady(this.getCardResourceRequestId()).then((cardResourceRequestId) => {
      if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

      if (this.canChangeState() && !this._showingOccupiedState) {
        this.showNoState();
        this._showingOccupiedState = true;

        const sdkCard = this.getSdkCard();

        if (showFX !== false) {
          if (this.getSoundResource() && this.getSoundResource().occupied) {
            audio_engine.current().play_effect(this.getSoundResource().occupied, false);
          }
        }

        const animActionOccupied = this.getAnimResource() && UtilsEngine.getAnimationAction(this.getAnimResource().occupied, true);
        if (animActionOccupied != null) {
          this.entitySprite.runAction(animActionOccupied);
        }
      }
    });
  },

  showDepletedState(showFX) {
    this.whenResourcesReady(this.getCardResourceRequestId()).then((cardResourceRequestId) => {
      if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

      if (this.canChangeState() && !this._showingDepletedState) {
        this.showNoState();
        this._showingDepletedState = true;
        this.setStateLocked(true);

        const sdkCard = this.getSdkCard();
        const sequenceSteps = [];

        if (showFX !== false) {
          if (this.getSoundResource() && this.getSoundResource().depleted) {
            audio_engine.current().play_effect(this.getSoundResource().depleted, false);
          }
        }

        const animActionDepleted = this.getAnimResource() && UtilsEngine.getAnimationAction(this.getAnimResource().depleted);
        if (animActionDepleted != null) {
          sequenceSteps.push(animActionDepleted);
        }

        // short delay then destroy when dead on depletion
        if (sdkCard.getIsRemoved()) {
          this._stopListeningToEvents();
          sequenceSteps.push(cc.callFunc(function () {
            this.showDeathState();
          }, this));
          this.entitySprite.runAction(cc.sequence(sequenceSteps));
        } else {
          this._stateActions.push(this.entitySprite.runAction(cc.sequence(sequenceSteps)));
        }
      }
    });
  },

  showDeathState() {
    this.setStateLocked(false);
    if (this.getSdkCard().getDepleted() && !this._showingDepletedState) {
      this.showDepletedState();
    } else {
      EntityNode.prototype.showDeathState.call(this);
    }
  },

  /* region EVENTS */

  _startListeningToEvents() {
    this._super();

    const scene = this.getScene();
    const gameLayer = scene && scene.getGameLayer();
    if (gameLayer) {
      gameLayer.getEventBus().on(EVENTS.before_show_move, this.onBeforeShowMove, this);
      gameLayer.getEventBus().on(EVENTS.after_show_move, this.onAfterShowMove, this);
      gameLayer.getEventBus().on(EVENTS.after_show_action, this.onAfterShowAction, this);
    }
  },

  _stopListeningToEvents() {
    this._super();

    const scene = this.getScene();
    const gameLayer = scene && scene.getGameLayer();
    if (gameLayer) {
      gameLayer.getEventBus().off(EVENTS.before_show_move, this.onBeforeShowMove, this);
      gameLayer.getEventBus().off(EVENTS.after_show_move, this.onAfterShowMove, this);
      gameLayer.getEventBus().off(EVENTS.after_show_action, this.onAfterShowAction, this);
    }
  },

  onBeforeShowMove(event) {
    const action = event && event.action;
    if (action && UtilsPosition.getPositionsAreEqual(action.getSourcePosition(), this.getBoardPosition())) {
      this.showCurrentState();
    }
  },

  onAfterShowMove(event) {
    const action = event && event.action;
    if (action && UtilsPosition.getPositionsAreEqual(action.getTargetPosition(), this.getBoardPosition())) {
      this.showCurrentState();
    }
  },

  onBeforeShowAction(event) {
    this._super(event);

    const action = event && event.action;
    if (action && action === this.getSdkCard().getOccupantChangingAction() && this.getSdkCard().getOccupant() == null) {
      this.showCurrentState();
    }
  },

  onAfterShowAction(event) {
    const action = event && event.action;
    if (action && action === this.getSdkCard().getOccupantChangingAction() && this.getSdkCard().getOccupant() != null) {
      this.showCurrentState();
    }
  },

  /* endregion EVENTS */

});

TileNode.create = function (sdkCard, node) {
  return EntityNode.create(sdkCard, node || new TileNode(sdkCard));
};

module.exports = TileNode;
