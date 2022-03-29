//pragma PKGS: game

var CONFIG = require('app/common/config');
var EVENTS = require('app/common/event_types');
var SDK = require('app/sdk');
var UtilsEngine = require('app/common/utils/utils_engine');
var UtilsPosition = require('app/common/utils/utils_position');
var audio_engine = require("./../../../audio/audio_engine");
var BaseSprite = require('./../BaseSprite');
var EntitySprite = require('./EntitySprite');
var EntityNode = require('./EntityNode');

/****************************************************************************
TileNode
 ****************************************************************************/

var TileNode = EntityNode.extend({

	_showingIdleState: false,
	_showingOccupiedState: false,
	_showingDepletedState: false,

	ctor: function (sdkCard) {
		this._super(sdkCard);

		if(sdkCard.getDepleted()) {
			this.showDepletedState(false);
		} else if(sdkCard.getOccupant()) {
			this.showOccupiedState(false);
		}
	},

	initEntitySprites: function (spriteOptions) {
		this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
			if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

			spriteOptions || (spriteOptions = {});

			// init sprites
			this.entitySprite = EntitySprite.create(spriteOptions);
			if (spriteOptions.scale == null) { this.entitySprite.setScale(CONFIG.SCALE); }

			// position sprites
			this.entitySprite.setPosition(this.getCenterPosition());

			// add to scene
			this.addChild(this.entitySprite);
		}.bind(this));
	},

	getPositionForExternalFX: function () {
		if (this.layerName === "tileLayer") {
			return UtilsEngine.transformScreenToTileMap(this.getPosition());
		} else {
			return EntityNode.prototype.getPositionForExternalFX.call(this);
		}
	},

	_getColorForOwnerTint: function () {
		if (this.sdkCard == null || this.sdkCard.isOwnedByMyPlayer()) {
			return CONFIG.PLAYER_TILE_COLOR;
		} else {
			return CONFIG.OPPONENT_TILE_COLOR;
		}
	},

	showCurrentState: function (showFX) {
		var sdkCard = this.getSdkCard();
		if(sdkCard != null) {
			if(sdkCard.getDepleted()) {
				this.showDepletedState(showFX);
			} else if(sdkCard.getOccupant()) {
				this.showOccupiedState(showFX);
			} else {
				this.showBaseState();
			}
		}
	},

	showNoState: function () {
		EntityNode.prototype.showNoState.call(this);
		this._showingDepletedState = this._showingOccupiedState = this._showingIdleState = false;
	},

	showBaseState: function () {
		this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
			if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

			if(this.canChangeState() && !this._showingIdleState) {
				this.showNoState();
				this._showingIdleState = true;

				if(this.getSoundResource() && this.getSoundResource().idle) {
					audio_engine.current().play_effect(this.getSoundResource().idle, false);
				}

				var animActionIdle = this.getAnimResource() && UtilsEngine.getAnimationAction(this.getAnimResource().idle, true);
				if(animActionIdle != null) {
					this.entitySprite.runAction(animActionIdle);
				}
			}
		}.bind(this));
	},

	showPlaceholderSprites: function () {
		// TODO: maybe show actual placeholder sprites
		this.entitySprite.setOpacity(0);
	},

	showSpawnSprites: function () {
		var sdkCard = this.getSdkCard();
		// when an apply/spawn animation is present
		var animActionApply = this.getAnimResource() && UtilsEngine.getAnimationAction(this.getAnimResource().apply);
		if (animActionApply != null) {
			this.showNoState();
			this.entitySprite.setOpacity(255);
			this._stateActions.push(this.entitySprite.runAction(cc.sequence(
				animActionApply,
				cc.callFunc(this.showNextState, this)
			)));
		} else {
			this.showBaseState();
			this.entitySprite.setOpacity(0);
			this.entitySprite.fadeTo(CONFIG.FADE_MEDIUM_DURATION, 255);
		}
	},

	showOccupiedState: function (showFX) {
		this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
			if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

			if(this.canChangeState() && !this._showingOccupiedState) {
				this.showNoState();
				this._showingOccupiedState = true;

				var sdkCard = this.getSdkCard();

				if (showFX !== false) {
					if(this.getSoundResource() && this.getSoundResource().occupied) {
						audio_engine.current().play_effect(this.getSoundResource().occupied, false);
					}
				}

				var animActionOccupied = this.getAnimResource() && UtilsEngine.getAnimationAction(this.getAnimResource().occupied, true);
				if(animActionOccupied != null) {
					this.entitySprite.runAction(animActionOccupied);
				}
			}
		}.bind(this));
	},

	showDepletedState:function(showFX) {
		this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
			if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

			if(this.canChangeState() && !this._showingDepletedState) {
				this.showNoState();
				this._showingDepletedState = true;
				this.setStateLocked(true);

				var sdkCard = this.getSdkCard();
				var sequenceSteps = [];

				if (showFX !== false) {
					if(this.getSoundResource() && this.getSoundResource().depleted) {
						audio_engine.current().play_effect(this.getSoundResource().depleted, false);
					}
				}

				var animActionDepleted = this.getAnimResource() && UtilsEngine.getAnimationAction(this.getAnimResource().depleted);
				if(animActionDepleted != null) {
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
		}.bind(this));
	},

	showDeathState: function () {
		this.setStateLocked(false);
		if (this.getSdkCard().getDepleted() && !this._showingDepletedState) {
			this.showDepletedState();
		} else {
			EntityNode.prototype.showDeathState.call(this);
		}
	},

	/* region EVENTS */

	_startListeningToEvents: function () {
		this._super();

		var scene = this.getScene();
		var gameLayer = scene && scene.getGameLayer();
		if (gameLayer) {
			gameLayer.getEventBus().on(EVENTS.before_show_move, this.onBeforeShowMove, this);
			gameLayer.getEventBus().on(EVENTS.after_show_move, this.onAfterShowMove, this);
			gameLayer.getEventBus().on(EVENTS.after_show_action, this.onAfterShowAction, this);
		}
	},

	_stopListeningToEvents: function () {
		this._super();

		var scene = this.getScene();
		var gameLayer = scene && scene.getGameLayer();
		if (gameLayer) {
			gameLayer.getEventBus().off(EVENTS.before_show_move, this.onBeforeShowMove, this);
			gameLayer.getEventBus().off(EVENTS.after_show_move, this.onAfterShowMove, this);
			gameLayer.getEventBus().off(EVENTS.after_show_action, this.onAfterShowAction, this);
		}
	},

	onBeforeShowMove:function (event) {
		var action = event && event.action;
		if (action && UtilsPosition.getPositionsAreEqual(action.getSourcePosition(), this.getBoardPosition())) {
			this.showCurrentState();
		}
	},

	onAfterShowMove:function (event) {
		var action = event && event.action;
		if (action && UtilsPosition.getPositionsAreEqual(action.getTargetPosition(), this.getBoardPosition())) {
			this.showCurrentState();
		}
	},

	onBeforeShowAction:function (event) {
		this._super(event);

		var action = event && event.action;
		if (action && action === this.getSdkCard().getOccupantChangingAction() && this.getSdkCard().getOccupant() == null) {
			this.showCurrentState();
		}
	},

	onAfterShowAction:function (event) {
		var action = event && event.action;
		if (action && action === this.getSdkCard().getOccupantChangingAction() && this.getSdkCard().getOccupant() != null) {
			this.showCurrentState();
		}
	}

	/* endregion EVENTS */

});

TileNode.create = function(sdkCard, node) {
	return EntityNode.create(sdkCard, node || new TileNode(sdkCard));
};

module.exports = TileNode;
