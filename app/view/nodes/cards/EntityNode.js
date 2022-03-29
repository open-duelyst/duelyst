//pragma PKGS: game

var RSX = require('app/data/resources');
var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var EVENTS = require('app/common/event_types');
var SDK = require('app/sdk');
var DATA = require('app/data');
var Promise = require('bluebird');
var UtilsEngine = require('app/common/utils/utils_engine');
var UtilsPosition = require('app/common/utils/utils_position');
var audio_engine = require("./../../../audio/audio_engine");
var TweenTypes = require('./../../actions/TweenTypes');
var ActionStateRecord = require('app/common/actionStateRecord');
var NodeFactory = require('./../../helpers/NodeFactory');
var BaseSprite = require('./../BaseSprite');
var BaseParticleSystem = require('./../BaseParticleSystem');
var TileMapGridSprite = require('./../map/TileMapGridSprite');
var SdkNode = require('./SdkNode');
var StatsNode = require('./StatsNode');
var StatsChangeNode = require('./StatsChangeNode');
var GeneralSpeechNode = require('./GeneralSpeechNode');
var EntityNodeVisualStateTag = require('./../visualStateTags/EntityNodeVisualStateTag');
var FXShadowBlobSprite = require("./../fx/FXShadowBlobSprite");
var CausticPrismaticGlowSprite = require("./../fx/CausticPrismaticGlowSprite");

/****************************************************************************
 EntityNode
 var EntityNode = SdkNode
 EntityNode.create()
 ****************************************************************************/

var EntityNode = SdkNode.extend({

	_actionStateRecord: null,
	_animResource: null,
	autoZOrder: true,
	autoZOrderOffset: 0.0,
	_baseStateAction: null,
	_baseStateDirty: false, // whether base state should change after looping
	_cachedColorForOwnerTint: null,
	_canShowOwnerSprites: false,
	entitySprite: null,
	groundOffset: cc.p(),
	hovered: false,
	isMoving: false,
	isSpawned: false,
	isValidTarget: false,
	movePosition: null,
	_numCastingStatesToShow: 0,
	_ownerIndicatorSprite: null,
	_prismaticGlow: null,
	_prismaticSpawnGlowTagId: "PrismaticSpawnGlowTagId",
	_readinessParticles: null, // Particle system for the radiating readiness circles
	selected: false,
	_showingBaseState: false,
	_showingCastingState: false,
	_showingCastingStartState: false,
	_showingCastState: false,
	_showingCastingStartStateTimeoutId: null,
	_showingCastingEndStateTimeoutId: null,
	_showingPrismatic: false,
	_showingOwnerSprites: false,
	_showMoveAction: null,
	_showTeleportAction: null,
	_stateActions: null,
	stateLocked: false, // Locks the animation state, such as during death animation
	_stateQueue: null,
	_statChangeShowing: false,
	_statChangeQueue: null,
	_statsChangeNode: null,
	_statsNode: null,
	targetable: true,

	/* region INITIALIZE */

	ctor: function (sdkCard) {
		// initialize properties that may be required in init
		this._stateActions = [];
		this._stateQueue = [];
		this._statChangeQueue = [];

		// do super ctor
		this._super(sdkCard);

		// setup action state record
		this._actionStateRecord = new ActionStateRecord();
		var resolvePropertiesToRecord = {
			isReady: function () {
				var sdkCard = this.sdkCard;
				if (sdkCard.getGameSession().isNew()) {
					return sdkCard.isOwnedByPlayer1();
				} else if (sdkCard.getGameSession().isOver()) {
					return false;
				} else if (sdkCard.getIsActive() && sdkCard.isOwnersTurn() && sdkCard.getIsTargetable() && sdkCard.getCanAct()) {
					// has moved but not attacked, check if any targets are in range
					if (!sdkCard.getCanMove() && sdkCard.getCanAttack()) {
						return sdkCard.getAttackRange().getValidTargets(sdkCard.getGameSession().getBoard(), sdkCard).length > 0;
					} else {
						return true;
					}
				}
				return false;
			}.bind(this)
		};
		this._actionStateRecord.setupToRecordStateOnEvent(EVENTS.update_cache_step, resolvePropertiesToRecord);

		// set content size to match tile size
		var contentSize = cc.size(CONFIG.TILESIZE, CONFIG.TILESIZE);
		this.setContentSize(contentSize);

		// create sprites
		var spriteOptions = _.extend({}, sdkCard.getSpriteOptions());
		if (spriteOptions.spriteIdentifier == null) { spriteOptions.spriteIdentifier = this.getAnimResource().idle; }
		this.centerOffset = cc.p(
			this.centerOffset.x + (spriteOptions.offset ? spriteOptions.offset.x : 0),
			this.centerOffset.y + (spriteOptions.offset ? spriteOptions.offset.y : 0)
		);

		this.initEntitySprites(spriteOptions);
		this.initSupportNodes(spriteOptions);

		// all entities are not ready by default
		this.removeReadiness();

		// update by initial owner
		this.resetStateByOwner();
		this.updateSpritesForOwner();
	},

	initEntitySprites: function (spriteOptions) {
		// override in sub class
	},

	initSupportNodes: function (spriteOptions) {
		// node that displays changes in stats
		if (this._statsChangeNode == null) {
			this._statsChangeNode = StatsChangeNode.create(this);
		}

		var sdkCard = this.getSdkCard();
		var groundPosition = this.getGroundPosition();

		// support nodes for targetable entities
		if (sdkCard.getIsTargetable()) {
			// node that displays current stats
			if (this._statsNode == null) {
				this._statsNode = StatsNode.create(this);
				this._statsNode.stopShowing();
			}

			// player owned targetable entities
			if (!sdkCard.isOwnedByGameSession()) {
				// owner decal sprite (only if we would ever show it)
				if (this._ownerIndicatorSprite == null && (CONFIG.PLAYER_OWNER_OPACITY > 0 || CONFIG.OPPONENT_OWNER_OPACITY > 0)) {
					/*
				  this._ownerIndicatorSprite = BaseSprite.create({
					 spriteIdentifier: RSX.decal_readiness.img,
					 scale: 1.0,
					 blendSrc: "SRC_ALPHA",
					 blendDst: "ONE_MINUS_SRC_ALPHA"
					});
					*/
					this._ownerIndicatorSprite = TileMapGridSprite.create();
					this._ownerIndicatorSprite.setOpacity(0.0);
					this._ownerIndicatorSprite.setVisible(false);
				}

				// readiness particles (only if we would ever show them)
				if (this._readinessParticles == null && (CONFIG.PLAYER_READY_PARTICLES_VISIBLE || CONFIG.OPPONENT_READY_PARTICLES_VISIBLE)) {
					this._readinessParticles = BaseParticleSystem.create({
						plistFile: RSX.ptcl_readiness.plist,
						xyzRotation: CONFIG.ENTITY_XYZ_ROTATION,
						fadeInAtLifePct: 0.25,
						fadeOutAtLifePct: 0.75,
						emissionSynced: true,
						scale: 1.0
					});
					this._readinessParticles.setPosition(groundPosition);
					this.addChild(this._readinessParticles, 1);
					this._readinessParticles.stopSystem();
				}
			}
		}
	},

	terminateSupportNodes: function (duration) {
		this._super(duration);
		if (this._ownerIndicatorSprite != null) {
			this._ownerIndicatorSprite.stopAllActions();
			this._ownerIndicatorSprite.destroy(duration);
			this._ownerIndicatorSprite = null;
		}
		if (this._statsNode != null) {
			this._statsNode.stopAllActions();
			this._statsNode.destroy(duration);
			this._statsNode = null;
		}
		if (this._statsChangeNode != null) {
			this._statsChangeNode.stopAllActions();
			this._statsChangeNode.destroy(duration);
			this._statsChangeNode = null;
		}
		if (this._killPreviewNode != null) {
			this._killPreviewNode.stopAllActions();
			this._killPreviewNode.destroy(duration);
			this._killPreviewNode = null;
		}
	},

	/* endregion INITIALIZE */

	/* region GETTERS / SETTERS */

	getAnimationIdentifierFromAnimResource: function (animKey) {
		var animResource = this.getAnimResource();
		return animResource && animResource[animKey];
	},

	getAnimationFromAnimResource: function (animKey) {
		var animIdentifier = this.getAnimationIdentifierFromAnimResource(animKey);
		return cc.animationCache.getAnimation(animIdentifier);
	},

	getAnimationActionFromAnimResource: function (animKey) {
		var animIdentifier = this.getAnimationIdentifierFromAnimResource(animKey);
		return animIdentifier && UtilsEngine.getAnimationAction(animIdentifier);
	},

	getAutoZOrderIndex: function () {
		return this.getBoardPosition().y;
	},

	updateSupportNodePositions: function () {
		this._super();
		var position = this.getCenterPositionForExternal();
		if (this._statsNode != null) {
			this._statsNode.setPosition(position.x + CONFIG.OVERLAY_STATS_OFFSET.x, position.y + CONFIG.OVERLAY_STATS_OFFSET.y);
		}
		if (this._killPreviewNode != null) {
			this._killPreviewNode.setPosition(position.x + CONFIG.KILL_NODE_OFFSET.x, position.y + CONFIG.KILL_NODE_OFFSET.y);
		}
	},

	getOwnerIndicatorSprite: function () {
		return this._ownerIndicatorSprite;
	},

	getStatsNode: function () {
		return this._statsNode;
	},

	getStatsChangeNode: function () {
		return this._statsChangeNode;
	},

	getOrCreateKillPreviewNode: function () {
		if (this._killPreviewNode == null) {
			this._killPreviewNode = new cc.Node();

			// kill symbol
			this._killSprite = new BaseSprite(RSX.kill_symbol.img);
			this._killPreviewNode.addChild(this._killSprite, 1);

			// shadow blob
			this._killShadowSprite = new FXShadowBlobSprite();
			this._killShadowSprite.setBlendFunc(cc.DST_COLOR, cc.ZERO);
			/*
			 // TODO: size of shadow tendrils should be independent of scale
			 var killContentSize = this._killSprite.getContentSize();
			 this._killShadowSprite.setContentSize(killContentSize.width * 2.0, killContentSize.height * 2.0);
			 */
			this._killShadowSprite.setScale(2.5);
			this._killPreviewNode.addChild(this._killShadowSprite, 0);
		}

		return this._killPreviewNode;
	},

	getKillPreviewNode: function () {
		return this._killPreviewNode;
	},

	getGroundPosition: function () {
		return cc.p(this.groundOffset.x + this._contentSize.width * 0.5, this.groundOffset.y + this._contentSize.height * 0.5);
	},

	getGroundPositionForExternal: function () {
		return cc.p(this._position.x + this.groundOffset.x, this._position.y + this.groundOffset.y);
	},

	setStateLocked: function (stateLocked) {
		this.stateLocked = stateLocked;
	},

	getStateLocked: function () {
		return this.stateLocked;
	},

	setTargetable:function(targetable) {
		if (this.targetable != targetable) {
			this.targetable = targetable;
			var gameLayer = this.getScene().getGameLayer();
			if (!this.targetable && gameLayer.getMyPlayer().getMouseOverEntityNode() === this) {
				// stop mouse over when player mousing over entity
				gameLayer.stopMouseOver();
			}
		}
	},

	getIsTargetable:function() {
		return this.targetable && this.sdkCard != null && this.sdkCard.getIsTargetable();
	},

	setIsValidTarget:function (val) {
		val = !!val;
		if(this.isValidTarget !== val) {
			this.isValidTarget = val;
			this.updateOwnerSprites();
		}
	},
	getIsValidTarget:function() {
		return this.isValidTarget;
	},

	setSelected:function (val) {
		val = !!val;
		if(this.selected !== val) {
			this.selected = val;
			this._baseStateDirty = true;
			// transition to idle immediately when selected unless moving
			// when deselected, it is much smoother to let idle finish
			if(this.selected && !this.getIsMoving()) {
				this.changeBaseState();
			}
			this.updateOwnerSprites();
		}
	},
	getSelected:function() {
		return this.selected;
	},

	setHovered:function (val) {
		val = !!val;
		if(this.hovered !== val) {
			this.hovered = val;
			if (CONFIG.SHOW_PRISMATIC_ONLY_ON_INSPECT && this.sdkCard != null && !(this.sdkCard instanceof SDK.Tile) && SDK.Cards.getIsPrismaticCardId(this.sdkCard.getId())) {
				if (this.hovered) {
					this.showPrismatic();
				} else {
					this.stopShowingPrismatic();
				}
			}
			this.updateOwnerSprites();
		}
	},
	getHovered:function() {
		return this.hovered;
	},

	setIsMoving:function(val) {
		val = !!val;
		if(this.isMoving !== val) {
			this.isMoving = val;
			this.updateOwnerSprites();
		}
	},
	getIsMoving: function () {
		return this.isMoving;
	},
	setMovePosition:function(val) {
		if(this.movePosition !== val) {
			this.movePosition = val;
		}
	},
	getMovePosition: function () {
		return this.movePosition;
	},
	getMoveTileCount: function (sourceBoardPosition, targetBoardPosition) {
		var tileCount = 0;

		if (sourceBoardPosition != null && targetBoardPosition != null && !UtilsPosition.getPositionsAreEqual(sourceBoardPosition, targetBoardPosition)) {
			var diffX = targetBoardPosition.x - sourceBoardPosition.x;
			var diffY = targetBoardPosition.y - sourceBoardPosition.y;
			var distance = Math.sqrt(( diffX * diffX ) + ( diffY * diffY ));
			tileCount = Math.floor(distance);

			if (this.sdkCard != null && this.sdkCard.hasActiveModifierClass(SDK.ModifierFlying)) {
				tileCount = Math.min(tileCount, CONFIG.ENTITY_MOVE_FLYING_FIXED_TILE_COUNT);
			}
		}

		return tileCount;
	},
	getMoveDuration: function (moveTileCount) {
		var movementDuration = 0.0;

		if (moveTileCount > 0) {
			var animResource = this.getAnimResource();
			if (animResource != null) {
				var animMove = this.getAnimationActionFromAnimResource("walk");
				if (animMove) {
					var animMoveDuration = animMove.getDuration() * CONFIG.ENTITY_MOVE_DURATION_MODIFIER;
					var animMoveCorrection = animMoveDuration * CONFIG.ENTITY_MOVE_CORRECTION;
					for(var i = 0; i < moveTileCount + 1; i++) {
						movementDuration += animMoveDuration;
					}
					// remove a bit of one movement animation cycle
					// this gives the appearance that the unit makes a last step correctly on the tile
					movementDuration -= animMoveCorrection;
				}
			}
		}

		return movementDuration;
	},

	getIsReadyAtAction: function (action) {
		return this.sdkCard != null && !this.sdkCard.getIsUncontrollableBattlePet() && this._actionStateRecord.getStateAtAction(action).isReady;
	},

	getHasActiveState: function () {
		return this.getIsMoving() || (this._stateActions.length > 0 && !this._showingBaseState);
	},

	canChangeState: function () {
		return !this.stateLocked && this.sdkCard != null && this.getIsSpawned();
	},

	/* endregion GETTERS / SETTERS */

	/* region COCOS EVENTS */

	onEnter: function () {
		this._super();

		// show base state when not showing active state
		if (!this.getHasActiveState()) {
			this.showBaseState();
		}
	},

	onExit: function () {
		this._super();

		this.stopShowingTeleport();
		this.showNoState();
	},

	/* endregion COCOS EVENTS */

	/* region EVENTS */

	onGameAction: function (event) {
		// make this entity node is untargetable and reset when removed/dead
		var action = event && event.action;
		if (action instanceof SDK.RemoveAction && action.getTarget() === this.sdkCard) {
			this.setHovered(false);
			this.setSelected(false);
			this.setTargetable(false);
			this.removeInjectedVisualStateTags();
		}
	},

	/* endregion EVENTS */

	/* region EVENT STREAM */

	_startListeningToEvents: function () {
		this._super();

		// start listening to events for action state recording
		this._actionStateRecord.startListeningToEvents(this.sdkCard.getGameSession().getEventBus());
	},

	_stopListeningToEvents: function () {
		this._super();

		// cleanup action state recording
		this._actionStateRecord.stopListeningToEvents();
	},

	/* endregion EVENT STREAM */

	/* region SPRITES */

	getCanShowOwnerSprites: function () {
		if (this.sdkCard != null
			&& ((!this.sdkCard.isOwnedByMyPlayer() && CONFIG.OPPONENT_OWNER_OPACITY > 0.0) || (this.sdkCard.isOwnedByMyPlayer() && CONFIG.PLAYER_OWNER_OPACITY > 0.0))
			&& !this.hovered && !this.selected && !this.isValidTarget && !this.getIsMoving() && this.getIsSpawned()) {
			var scene = this.getScene();
			var gameLayer = scene && scene.getGameLayer();
			return gameLayer && gameLayer.getIsActive();
		}
		return false;
	},

	updateOwnerSprites: function () {
		if (this.getCanShowOwnerSprites()) {
			this.showOwnerSprites();
		} else {
			this.hideOwnerSprites();
		}
	},

	showOwnerSprites: function () {
		if (!this._showingOwnerSprites && this._ownerIndicatorSprite != null) {
			// update position only on show as owner tile sprite should always be hidden while moving
			this._showingOwnerSprites = true;
			this._ownerIndicatorSprite.setPosition(UtilsEngine.transformTileMapToScreen(this.getPosition()));

			var opacity;
			var color;
			if (this.sdkCard.isOwnedByMyPlayer()) {
				opacity = CONFIG.PLAYER_OWNER_OPACITY;
				color = CONFIG.PLAYER_OWNER_COLOR;
			} else {
				opacity = CONFIG.OPPONENT_OWNER_OPACITY;
				color = CONFIG.OPPONENT_OWNER_COLOR;
			}

			if (opacity > 0.0) {
				this._ownerIndicatorSprite.fadeTo(CONFIG.FADE_FAST_DURATION, opacity);
				this._ownerIndicatorSprite.setColor(color);
			} else {
				this._ownerIndicatorSprite.fadeToInvisible(CONFIG.FADE_FAST_DURATION);
			}
		}
	},

	hideOwnerSprites: function () {
		if (this._showingOwnerSprites) {
			this._showingOwnerSprites = false;

			if (this._ownerIndicatorSprite != null) {
				this._ownerIndicatorSprite.fadeToInvisible(CONFIG.FADE_FAST_DURATION);
			}
		}
	},

	updateSpritesForOwner: function () {
		if (this.sdkCard != null && !this.sdkCard.isOwnedByGameSession()) {
			if (this.sdkCard.isOwnedByPlayer2()) {
				this._updateSpritesOwnedByPlayer2();
			} else {
				this._updateSpritesOwnedByPlayer1();
			}

			if (this.sdkCard.isOwnedByMyPlayer()) {
				this._updateSpritesOwnedByMyPlayer();
			} else {
				this._updateSpritesOwnedByOpponentPlayer();
			}

			// tint entity sprite by owner as needed
			var colorForOwnerTint = this._getColorForOwnerTint();
			if (colorForOwnerTint != null && (this._cachedColorForOwnerTint == null || !cc.colorEqual(this._cachedColorForOwnerTint, colorForOwnerTint))) {
				this._cachedColorForOwnerTint = colorForOwnerTint;
				this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
					if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
					this.entitySprite.setColor(colorForOwnerTint);
				}.bind(this));
			}

			this.updateOwnerSprites();
		}
	},

	_updateSpritesOwnedByPlayer1: function () {
		/*if (this._ownerIndicatorSprite != null) {
			var groundPosition = this.getGroundPosition();
			this._ownerIndicatorSprite.setPosition(cc.p(groundPosition.x + 5.0, groundPosition.y));
			this._ownerIndicatorSprite.setFlippedX(false);
		}*/
	},

	_updateSpritesOwnedByPlayer2: function () {
		/*if (this._ownerIndicatorSprite != null) {
			var groundPosition = this.getGroundPosition();
			this._ownerIndicatorSprite.setPosition(cc.p(groundPosition.x - 5.0, groundPosition.y));
			this._ownerIndicatorSprite.setFlippedX(true);
		}*/
	},

	_getColorForOwnerTint: function () {
		// override in subclas and return color to tint entity sprite by owner
	},

	_updateSpritesOwnedByMyPlayer: function () {
		// color fx sprites by owner
		for (var i = 0, il = this._fxSprites.length; i < il; i++) {
			var fxSprite = this._fxSprites[i];
			if (fxSprite.getColorByOwner && fxSprite.getColorByOwner()) {
				fxSprite.setColor(CONFIG.PLAYER_FX_COLOR);
			}
		}

		if (this._statsNode != null) {
			this._statsNode.setActive(true);
		}
	},

	_updateSpritesOwnedByOpponentPlayer: function () {
		// color fx sprites by owner
		for (var i = 0, il = this._fxSprites.length; i < il; i++) {
			var fxSprite = this._fxSprites[i];
			if (fxSprite.getColorByOwner && fxSprite.getColorByOwner()) {
				fxSprite.setColor(CONFIG.OPPONENT_FX_COLOR);
			}
		}

		if (this._statsNode != null) {
			this._statsNode.setActive(false);
		}
	},

	/* endregion SPRITES */

	/* region PRISMATIC */

	/**
	 * Shows the entity as prismatic.
	 * @param {Number} [duration=0.0]
	 */
	showPrismatic: function (duration) {
		if (!this._showingPrismatic && this.sdkCard != null) {
			this._showingPrismatic = true;

			if (this._prismaticGlow == null) {
				this._prismaticGlow = CausticPrismaticGlowSprite.create();
				this.addChild(this._prismaticGlow, -1);
			}

			// update glow based on card size
			var contentSize = this.getContentSize();
			var boundingBox = this.sdkCard.getBoundingBox();
			var glowWidth = Math.min(200.0, Math.max(80.0, boundingBox.width * 1.8));
			var glowHeight = Math.min(200.0, Math.max(80.0, boundingBox.height * 1.8));
			this._prismaticGlow.setTextureRect(cc.rect(0, 0, glowWidth, glowHeight));
			this._prismaticGlow.setPosition(contentSize.width * 0.5, contentSize.height * 0.5 + boundingBox.height * 0.5);

			this._prismaticGlow.fadeTo(duration, 175.0);
		}
	},

	/**
	 * Stops showing the entity as prismatic.
	 * @param {Number} [duration=0.0]
	 */
	stopShowingPrismatic: function (duration) {
		if (this._showingPrismatic) {
			this._showingPrismatic = false;

			if (this._prismaticGlow != null) {
				this._prismaticGlow.fadeToInvisible(duration);
			}
		}
	},

	/* endregion PRISMATIC */

	/* region STATS */

	/**
	 * Shows stat changes for hp.
	 * @param {Number} hpValue
	 * @param {String} [hpChangeType=StatsChangeNode.HP_CHANGE_TYPE_MODIFIER]
	 * @returns {Number} show duration
	 */
	showHPChange: function(hpValue, hpChangeType) {
		return this.showStatChanges(null, hpValue, hpChangeType);
	},

	/**
	 * Shows stat changes for atk.
	 * @param {Number} atkValue
	 * @returns {Number} show duration
	 */
	showATKChange: function(atkValue) {
		return this.showStatChanges(atkValue);
	},

	/**
	 * Shows stat changes for atk and/or hp. Either parameter is optional, but at least one must be defined.
	 * @param {Number} [atkValue=null]
	 * @param {Number} [hpValue=null]
	 * @param {String} [hpChangeType=StatsChangeNode.HP_CHANGE_TYPE_MODIFIER]
	 * @returns {Number} show duration
	 */
	showStatChanges: function(atkValue, hpValue, hpChangeType) {
		var showDuration = 0.0;
		var hasAtkValue = atkValue != null;
		var hasHPValue = hpValue != null;

		if (hasAtkValue || hasHPValue) {
			// ensure strings
			if (hasAtkValue) { atkValue = "" + atkValue; }
			if (hasHPValue) { hpValue = "" + hpValue; }

			// we're queuing stat change to be shown
			// but we know how long it will show for
			showDuration += CONFIG.ENTITY_STATS_CHANGE_DELAY * 0.5;

			// check if hp change is numeric
			var hpValueIsNumeric = !isNaN(parseInt(hpValue));

			// attempt to squash changes into last stat change
			var squashed = false;
			if (this._statChangeQueue.length > 0 && (!hasHPValue || hpValueIsNumeric)) {
				var lastStatChangeData = this._statChangeQueue[this._statChangeQueue.length - 1];
				if (hasAtkValue && !hasHPValue) {
					// squash attack change if signs match
					var lastAtk = lastStatChangeData.atk;
					var lastAtkSign = lastAtk && lastAtk.match(/([+-])/);
					var atkSign = atkValue.match(/([+-])/);
					if (lastAtkSign == null && atkSign == null) {
						squashed = true;
						lastStatChangeData.atk = "" + ((parseInt(lastAtk) || 0) + parseInt(atkValue));
					} else if (lastAtkSign != null && atkSign != null && lastAtkSign[1] === atkSign[1]) {
						squashed = true;
						lastStatChangeData.atk = "" + lastAtkSign[1] + ((parseInt(lastAtk && lastAtk.slice(1)) || 0) + parseInt(atkValue.slice(1)));
					}
				} else if (lastStatChangeData.hpChangeType == null || lastStatChangeData.hpChangeType == hpChangeType) {
					// squash change if signs match
					var lastHP = lastStatChangeData.hp;
					var lastHPSign = lastHP && lastHP.match(/([+-])/);
					var hpSign = hpValue.match(/([+-])/);
					var signsMatchNull = lastHPSign == null && hpSign == null;
					var signsMatchNotNull = lastHPSign != null && hpSign != null && lastHPSign[1] === hpSign[1];
					var signsMatch = signsMatchNull || signsMatchNotNull;
					if (signsMatch) {
						// squash atk
						if (hasAtkValue) {
							var lastAtk = lastStatChangeData.atk;
							var lastAtkSign = lastAtk && lastAtk.match(/([+-])/);
							var atkSign = atkValue.match(/([+-])/);
							if (lastAtkSign == null && atkSign == null) {
								signsMatch = true;
								lastStatChangeData.atk = "" + ((parseInt(lastAtk) || 0) + parseInt(atkValue));
							} else if (lastAtkSign != null && atkSign != null && lastAtkSign[1] === atkSign[1]) {
								signsMatch = true;
								lastStatChangeData.atk = "" + lastAtkSign[1] + ((parseInt(lastAtk && lastAtk.slice(1)) || 0) + parseInt(atkValue.slice(1)));
							} else {
								signsMatch = false;
							}
						}

						// squash hp
						if (signsMatch) {
							squashed = true;
							if (signsMatchNull) {
								lastStatChangeData.hp = "" + ((parseInt(lastHP) || 0) + parseInt(hpValue));
							} else if (signsMatchNotNull) {
								lastStatChangeData.hp = "" + lastHPSign[1] + ((parseInt(lastHP && lastHP.slice(1)) || 0) + parseInt(hpValue.slice(1)));
							}
						}
					}
				}
			}

			if (!squashed) {
				// push to queue
				this._statChangeQueue.push({atk: atkValue, hp: hpValue, hpChangeType: hpChangeType});
				if (!this._statChangeShowing && this._statChangeQueue.length === 1) {
					this._statChangeShowing = true;

					// delay slightly to allow multiple rapid stat changes to be squashed
					// unless hp value is non-numeric, in which case show immediately
					if (hasHPValue && !hpValueIsNumeric) {
						this._showNextStatChange();
					} else {
						this.runAction(cc.sequence(
							cc.delayTime(showDuration * 0.25),
							cc.callFunc(this._showNextStatChange, this)
						));
					}
				}
			}
		}

		return showDuration;
	},

	_showNextStatChange: function () {
		if (this._statsChangeNode == null) {
			// don't show stat changes when no stat node to show with
			this._statChangeQueue = [];
		} else {
			// only update stats change node position when showing next change
			var centerPosition = this.getCenterPositionForExternal();
			this._statsChangeNode.setPosition(centerPosition.x, centerPosition.y - 10.0);
		}

		if (this._statChangeQueue.length > 0) {
			this._statChangeShowing = true;
			var statChangeData = this._statChangeQueue.shift();
			var showDuration = this._statsChangeNode.showChanges(statChangeData.atk, statChangeData.hp, statChangeData.hpChangeType);
			if (showDuration > 0.0) {
				// delay and then show next changes
				this.runAction(cc.sequence(
					cc.delayTime(showDuration),
					cc.callFunc(this._showNextStatChange, this)
				));
			} else {
				this._showNextStatChange();
			}
		} else {
			this._statChangeShowing = false;
		}
	},

	/* endregion STATS */

	/* region Sound Effects */

	playSoundAttackerDamage:function(sdkCard) {
		var sfx = this.getSoundResource() && this.getSoundResource().attackDamage;
		if(sfx != null) {
			audio_engine.current().play_effect(sfx, false);
		}
	},

	playSoundAttackerRelease:function(sdkCard) {
		var sfx = this.getSoundResource() && this.getSoundResource().attack;
		if(sfx != null) {
			audio_engine.current().play_effect(sfx, false);
		}
	},

	playSoundReceiveDamage:function(sdkCard) {
		var sfx = this.getSoundResource() && this.getSoundResource().receiveDamage;
		if(sfx != null) {
			audio_engine.current().play_effect(sfx, false);
		}
	},

	playSoundDeath:function(sdkCard) {
		var sfx = this.getSoundResource() && this.getSoundResource().death;
		if(sfx != null) {
			audio_engine.current().play_effect(sfx, false);
		}
	},
	/* endregion Sound Effects */

	/* region Animation state methods */

	canShowModifier: function (modifier, action) {
		return this._super() && this.canChangeState();
	},

	showNoState: function () {
		this.cleanupStateActions();
		this.cleanupStateChanges();
	},

	cleanupStateActions: function () {
		this.stopShowingMove();

		if(this._stateActions.length > 0) {
			for (var i = 0, il = this._stateActions.length; i < il; i++) {
				var action = this._stateActions[i];
				var target = action.getTarget();
				if (target != null) {
					target.stopAction(action);
				}
			}
			this._stateActions.length = 0;
		}
	},

	cleanupStateChanges: function () {
		this._baseStateAction = null;
		this._showingBaseState = false;
		this._showingCastingStartState = false;
		this._showingCastingState = false;
		this._showingCastState = false;
		this.resetStateByOwner();
	},

	// TODO; shows the next animation if one exists
	showNextState: function () {
		if(this.canChangeState()) {
			this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
				if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

				if (this.canChangeState()) {
					this.showNoState();

					if (this._stateQueue.length > 0) {
						var nextState = this._stateQueue.shift();
						nextState.fn.call(this, nextState.action);
					} else if (this._numCastingStatesToShow > 0) {
						this.showCastingLoopState();
					} else {
						this._showingBaseState = true;
						this.updateReadinessVisualTag();

						var sequenceSteps = [];
						var animAction = this.getAnimationActionFromAnimResource("idle");
						if (animAction != null) {
							sequenceSteps.push(animAction);
						}
						sequenceSteps.push(cc.callFunc(this.showBaseState, this));
						this._stateActions.push(this.entitySprite.runAction(cc.sequence(sequenceSteps)));
					}
				}
			}.bind(this));
		}
	},

	showBaseState: function () {
		if(this.canChangeState()) {
			this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
				if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
				if (this.canChangeState()) {
					// clear all states
					this.showNoState();

					// create a new base state
					var baseStateAction = this._baseStateAction = this.getBaseStateAction();

					// run base state
					this._baseStateDirty = false;
					this._showingBaseState = true;
					this._stateActions.push(this.entitySprite.runAction(baseStateAction));
				}
			}.bind(this));
		}
	},

	getBaseStateAction: function () {
		return cc.sequence(
			cc.delayTime(1.0),
			cc.callFunc(this.changeBaseState, this)
		).repeatForever();
	},

	changeBaseState: function () {
		if(this._baseStateDirty && this.canChangeState()) {
			this._baseStateDirty = false;
			this.showNoState();
			this.showBaseState();
		}
	},

	showPlaceholder: function () {
		if(!this.getIsSpawned()) {
			this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
				if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
				// setup sprites
				this.showPlaceholderSprites();

				// fade self in
				this.setOpacity(0);
				this.fadeTo(CONFIG.FADE_MEDIUM_DURATION, 255);
			}.bind(this));
		}
	},

	showPlaceholderSprites: function () {
		// override in sub class
	},

	getIsSpawned: function () {
		return this.isSpawned;
	},

	setSpawned: function (val) {
		val = !!val;
		if(this.isSpawned !== val) {
			this.isSpawned = val;
		}
	},

	/**
	 * Shows unit as newly spawning.
	 * @returns {Number} duration of show
	 */
	showSpawn: function () {
		if(!this.getIsSpawned()) {
			this.setSpawned(true);
			this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
				if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
				// play apply sound
				var sfx_apply = this.getSoundResource() && this.getSoundResource().apply;
				if (sfx_apply != null) {
					audio_engine.current().play_effect(sfx_apply, false);
				}

				// show the spawn
				this.showSpawnSprites();

				// update owner sprites
				this.updateOwnerSprites();

				if (SDK.Cards.getIsPrismaticCardId(this.sdkCard.getId())) {
					// show prismatic spawn
					if (this.sdkCard.isOwnedByMyPlayer()) {
						this.addInjectedVisualStateTagWithId(EntityNodeVisualStateTag.createShowGlowForPlayerTag(), this._prismaticSpawnGlowTagId);
					} else {
						this.addInjectedVisualStateTagWithId(EntityNodeVisualStateTag.createShowGlowForOpponentTag(), this._prismaticSpawnGlowTagId);
					}

					var colorForOwnerTint = this._getColorForOwnerTint() || cc.color(255, 255, 255);
					this.entitySprite.runAction(cc.sequence(
						cc.tintTo(0.2, 0, 0, 0),
						cc.delayTime(0.2),
						cc.tintTo(0.2, colorForOwnerTint.r, colorForOwnerTint.g, colorForOwnerTint.b),
						cc.callFunc(function () {
							this.removeInjectedVisualStateTagById(this._prismaticSpawnGlowTagId);
						}.bind(this))
					));

					// show prismatic state
					if (!CONFIG.SHOW_PRISMATIC_ONLY_ON_INSPECT
						&& !(this.sdkCard instanceof SDK.Tile)) {
						this.showPrismatic();
					}
				}
			}.bind(this));
		}

		return 0.0;
	},

	showSpawnSprites: function () {
		// override in sub class
	},

	/**
	 * Shows unit as spawned and in base state. Do not use when spawning a new unit.
	 * @returns {Number} duration of show
	 */
	showSpawned: function () {
		this.setSpawned(true);
		this.updateOwnerSprites();
		if (!CONFIG.SHOW_PRISMATIC_ONLY_ON_INSPECT && this.sdkCard != null && !(this.sdkCard instanceof SDK.Tile) && SDK.Cards.getIsPrismaticCardId(this.sdkCard.getId())) {
			this.showPrismatic();
		}
		this.showBaseState();
		return 0.0;
	},

	/**
	 * Shows unit as teleporting from its current position to a target position.
	 * @param {SDK.MoveAction} action
	 * @param {Vec2} targetBoardPosition
	 * @returns {Number} duration of show
	 */
	showTeleport: function(action, targetBoardPosition) {
		var showDuration = 0.0;

		var scene = this.getScene();
		var gameLayer = scene && scene.getGameLayer();

		// show teleport if positions are different
		var sourceBoardPosition = UtilsEngine.transformScreenToBoard(this.getPosition());
		if (gameLayer != null && sourceBoardPosition != null && targetBoardPosition != null && this.canChangeState() && !UtilsPosition.getPositionsAreEqual(sourceBoardPosition, targetBoardPosition)) {
			this.stopShowingMove();
			this.stopShowingTeleport();
			this.showBaseState();

			var sourceTileMapPosition = UtilsEngine.transformBoardToTileMap(sourceBoardPosition);
			var targetTileMapPosition = UtilsEngine.transformBoardToTileMap(targetBoardPosition);
			var dx = targetBoardPosition.x - sourceBoardPosition.x;
			var dy = targetBoardPosition.y - sourceBoardPosition.y;
			var distance = Math.sqrt(dx * dx + dy * dy);

			// create fx
			var sourceFX = DATA.dataForIdentifiersWithFilter(action.getFXResource(), SDK.FXType.MoveSourceFX);
			var sourceFXSprites = NodeFactory.createFX(sourceFX, {
				targetBoardPosition: sourceBoardPosition,
				offset: this.centerOffset
			});
			var sourceFXDelays = UtilsEngine.getDelaysFromFXSprites(sourceFXSprites);
			var targetFX = DATA.dataForIdentifiersWithFilter(action.getFXResource(), SDK.FXType.MoveTargetFX);
			var targetFXSprites = NodeFactory.createFX(targetFX, {
				targetBoardPosition: targetBoardPosition,
				offset: this.centerOffset
			});
			var targetFXDelays = UtilsEngine.getDelaysFromFXSprites(targetFXSprites);
			var moveFX = DATA.dataForIdentifiersWithFilter(action.getFXResource(), SDK.FXType.MoveFX);
			var moveFXSprites = NodeFactory.createFX(moveFX);

			// travel delays
			var startTravelDuration = 0.2;
			var endTravelDuration = 0.3;
			var travelDuration = distance * 0.05;
			var totalTravelDuration = startTravelDuration + travelDuration + endTravelDuration;

			// set showDuration
			var sourceDelay = sourceFXDelays.showDelay * 0.5;
			var targetDelay = targetFXDelays.showDelay * 0.25;
			showDuration += sourceDelay + totalTravelDuration + targetDelay;

			// set final move position
			this.setMovePosition(targetTileMapPosition);

			// start moving
			this.setIsMoving(true);

			// don't show readiness while moving
			this.removeReadinessVisualTag();

			// emit the start of the move
			gameLayer.getEventBus().trigger(EVENTS.before_show_move, { type: EVENTS.before_show_move, action: action });

			// setup final method
			var onFinishMove = function () {
				// set new node position
				this.setPosition(targetTileMapPosition);

				// stop moving
				this.setIsMoving(false);

				// restore opacity
				this.setOpacity(255.0);

				// emit the completion of the move
				gameLayer.getEventBus().trigger(EVENTS.after_show_move, { type: EVENTS.after_show_move, action: action });
			}.bind(this);

			this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
				if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
				if (this.canChangeState()) {
					// add source fx at source
					gameLayer.addNodes(sourceFXSprites);

					// run sequence
					var teleportAction = cc.sequence(
						cc.delayTime(sourceDelay),
						cc.callFunc(function () {
							// move moving fx from source to target
							var scene = this.getScene();
							var gameLayer = scene && scene.getGameLayer();
							gameLayer && gameLayer.addNodes(moveFXSprites);
							for (var i = 0, il = moveFXSprites.length; i < il; i++) {
								var moveFXSprite = moveFXSprites[i];
								moveFXSprite.setPosition(sourceTileMapPosition);
								// set lifespan of particles
								if (moveFXSprite instanceof BaseParticleSystem) {
									moveFXSprite.setLife(totalTravelDuration * 2.0);
								}
								// move fx sprites
								moveFXSprite.runAction(cc.sequence(
									cc.delayTime(startTravelDuration),
									cc.moveTo(travelDuration, targetTileMapPosition),
									cc.delayTime(endTravelDuration),
									cc.fadeOut(CONFIG.FADE_MEDIUM_DURATION)
								));
							}
						}, this),
						cc.fadeOut(CONFIG.FADE_FAST_DURATION),
						cc.callFunc(function () {
							onFinishMove();
							this.setOpacity(0.0);
						}, this),
						cc.delayTime(totalTravelDuration - CONFIG.FADE_FAST_DURATION),
						cc.callFunc(function () {
							// add target fx at target
							var scene = this.getScene();
							var gameLayer = scene && scene.getGameLayer();
							gameLayer && gameLayer.addNodes(targetFXSprites);
						}, this),
						cc.delayTime(targetDelay),
						cc.fadeIn(CONFIG.FADE_FAST_DURATION),
						cc.callFunc(function () {
							this._showTeleportAction = null;
						}, this)
					);
					teleportAction.setOnCancelledCallback(onFinishMove);
					this._showTeleportAction = teleportAction;
					this.runAction(teleportAction);
				} else {
					onFinishMove();
				}
			}.bind(this));
		}

		return showDuration;
	},

	stopShowingTeleport: function () {
		if (this._showTeleportAction != null) {
			if (!this._showTeleportAction.isDone()) {
				this.stopAction(this._showTeleportAction);
			}
			this._showTeleportAction = null;
		}
	},

	/**
	 * Shows entity movement.
	 * @param {SDK.MoveAction} action
	 * @param {Vec2} sourceBoardPosition
	 * @param {Vec2} targetBoardPosition
	 * @returns {Number} duration of show
	 */
	showMove: function(action, sourceBoardPosition, targetBoardPosition) {
		var showDuration = 0.0;

		var scene = this.getScene();
		var gameLayer = scene && scene.getGameLayer();

		// show movement if positions are different
		if (gameLayer != null && sourceBoardPosition != null && targetBoardPosition != null && this.canChangeState() && !UtilsPosition.getPositionsAreEqual(sourceBoardPosition, targetBoardPosition)) {
			this.stopShowingMove();
			this.stopShowingTeleport();

			var sourceTileMapPosition = UtilsEngine.transformBoardToTileMap(sourceBoardPosition);
			var targetTileMapPosition = UtilsEngine.transformBoardToTileMap(targetBoardPosition);
			var moveTileCount = this.getMoveTileCount(sourceBoardPosition, targetBoardPosition);
			var moveDuration = this.getMoveDuration(moveTileCount);
			var animMoveAction = this.getAnimationActionFromAnimResource("walk") || this.getAnimationActionFromAnimResource("run") || this.getAnimationActionFromAnimResource("move");
			var animMoveDuration = animMoveAction != null ? animMoveAction.getDuration() : 0.0;
			var animMoveCorrection = animMoveDuration * CONFIG.ENTITY_MOVE_CORRECTION;
			var actualDuration = animMoveDuration * (moveTileCount + 1) - animMoveCorrection;

			// set show duration
			showDuration += Math.max(moveDuration, actualDuration + animMoveCorrection);

			// set the initial position in case of any movement conflicts
			this.setPosition(sourceTileMapPosition);

			// set final move position
			this.setMovePosition(targetTileMapPosition);

			// set moving state
			this.setIsMoving(true);

			// setup final method
			var onFinishMove = function () {
				// set the final position in case of any movement conflicts
				this.setPosition(targetTileMapPosition);

				// stop moving
				this.setIsMoving(false);

				// emit the completion of the move
				gameLayer.getEventBus().trigger(EVENTS.after_show_move, { type: EVENTS.after_show_move, action: action });
			}.bind(this);

			this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
				if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
				if (this.canChangeState()) {
					this.showNoState();

					// set the auto z order offset temporarily
					// (used by the base sprite's auto z order method)
					this.setAutoZOrderOffset(0.1);

					// flip, position, and set as moving
					if (sourceBoardPosition.x !== targetBoardPosition.x) {
						this.entitySprite.setFlippedX(sourceBoardPosition.x > targetBoardPosition.x);
					}

					// don't show readiness while moving
					this.removeReadinessVisualTag();

					// emit the start of the move
					gameLayer.getEventBus().trigger(EVENTS.before_show_move, { type: EVENTS.before_show_move, action: action });

					// walking sound
					var sfx_walk = this.getSoundResource() && this.getSoundResource().walk;
					audio_engine.current().play_effect(sfx_walk, false);

					// compose sequence
					var sequenceSteps = [];

					// compose animation
					var animationSequence;
					if (animMoveAction != null) {
						var animationSteps = [];
						for (var i = 0; i < moveTileCount + 1; i++) {
							animationSteps.push(animMoveAction.clone());
						}
						animationSequence = cc.targetedAction(this.entitySprite, cc.sequence(animationSteps).speed(actualDuration / moveDuration));
					}

					// spawn move and animations in parallel
					if (animationSequence != null) {
						sequenceSteps.push(cc.spawn(
							cc.moveTo(moveDuration, targetTileMapPosition),
							animationSequence
						));
					} else {
						sequenceSteps.push(cc.moveTo(moveDuration, targetTileMapPosition));
					}

					sequenceSteps.push(cc.callFunc(function () {
						this._showMoveAction = null;
						onFinishMove();
						this.showNextState();
					}, this));

					// run sequence
					var moveSequence = cc.sequence(sequenceSteps);
					moveSequence.setOnCancelledCallback(onFinishMove);
					this._showMoveAction = moveSequence;
					this.runAction(moveSequence);
				} else {
					onFinishMove();
				}
			}.bind(this));
		}

		return showDuration;
	},

	stopShowingMove: function () {
		if (this._showMoveAction != null) {
			if (!this._showMoveAction.isDone()) {
				this.stopAction(this._showMoveAction);
			}
			this._showMoveAction = null;
		}
	},

	// TODO: restore movement dust
	/*
	showMovementForNodeOnPath:function(entityNode, sdkEntity, sourceBoardPosition, targetBoardPosition, path, duration){
		var actionSequence = [];

		// get tilemap positions
		var cp = UtilsEngine.transformBoardToTileMap(sourceBoardPosition);
		var np = UtilsEngine.transformBoardToTileMap(targetBoardPosition);
		// schedule an event to emit at the start of the move
		actionSequence.push(cc.callFunc(function () {
			// set the initial position in case of any movement conflicts
			entityNode.setPosition(cp);
		}, this));

		// does not follow through each node (only initial and final destination)
		actionSequence.push(cc.moveTo(duration, np));

		actionSequence.push(cc.callFunc(function () {
			// reset the state based on the player
			entityNode.resetStateByOwner();

			// set the final position in case of any movement conflicts
			entityNode.setPosition(np);
		}, this));

		var movement = cc.sequence(actionSequence);
		entityNode.runAction(movement);

		// dust clouds along walk for units
		if (entityNode instanceof UnitNode) {
			var dustSequence = [];
			var dustPerSecond = 1.0;
			var deltaX = Math.round(np.x - cp.x);
			var deltaY = Math.round(np.y - cp.y);
			var numDust = Math.max(Math.round(duration * dustPerSecond), 1);
			var offsetPerDust = 1.0 / (numDust + 1);
			var offsetRandomFactor = offsetPerDust * 0.75;
			var currentOffset = 0.0;
			for(var i = 0; i < numDust; i++) {
				var offset = (offsetPerDust - offsetRandomFactor) + Math.random() * offsetRandomFactor;
				currentOffset += offset;
				var dp = cc.p(cp.x + currentOffset * deltaX, cp.y + currentOffset * deltaY);
				var flip;
				if(deltaX !== 0.0) {
					if(deltaX < 0.0) {
						flip = true;
						dp.x += CONFIG.TILESIZE * 0.25;
					} else {
						dp.x -= CONFIG.TILESIZE * 0.25;
					}
				} else if(sdkEntity.isOwnedByPlayer2()) {
					flip = true;
					dp.x += CONFIG.TILESIZE * 0.25;
				} else {
					flip = false;
					dp.x -= CONFIG.TILESIZE * 0.25;
				}
				dp.y += CONFIG.TILESIZE * 0.1;
				dustSequence.push(cc.delayTime(duration * offset));
				dustSequence.push(cc.callFunc(this.showMovementDust, this, {position: dp, flip: flip, behind: deltaY < 0.0}));
			}
			entityNode.runAction(cc.sequence(dustSequence));
		}
	},

	showMovementDust: function (battleLayer, options) {
		var dustFX = FXSprite.create({
			spriteIdentifier: RSX.fxFootStepDust.name,
			scale: 4.0,
			opacity: 150,
			blendSrc: "SRC_ALPHA",
			blendDst: "ONE",
			anchorPoint: cc.p(0.5, 0.25)
		});
		dustFX.setPosition(options.position);
		dustFX.setFlippedX(options.flip);
		if(options.behind) {
			this.backgroundLayer.addChild( dustFX );
		} else {
			this.middlegroundLayer.addChild( dustFX );
		}
	},
	*/

	/**
	 * Shows entity attack state.
	 * @param {SDK.AttackAction} action
	 * @returns {Number} duration of show
	 */
	showAttackState: function(action) {
		// override in sub class
		return 0.0;
	},

	/**
	 * Shows entity healer state.
	 * @param {SDK.HealAction} action
	 * @returns {Number} duration of show
	 */
	showHealerState: function (action) {
		// override in sub class
		return 0.0;
	},

	/**
	 * Shows entity healed state with stat change.
	 * @param {SDK.HealAction} action
	 * @returns {Number} duration of show
	 */
	showHealedState: function (action) {
		return this.showHPChange(action.getTotalHealApplied(), StatsChangeNode.HP_CHANGE_TYPE_HEAL);
	},

	/**
	 * Shows entity attacked state with stat change.
	 * @param {SDK.DamageAction} action
	 * @returns {Number} duration of show
	 */
	showAttackedState: function(action) {
		return this.showHPChange("-" + action.getTotalDamageAmount(), StatsChangeNode.HP_CHANGE_TYPE_DAMAGE);
	},

	/**
	 * Shows entity destroyed state.
	 * @param {SDK.Action} action
	 * @returns {Number} duration of show
	 */
	showDestroyedState: function(action) {
		return this.showHPChange("X", StatsChangeNode.HP_CHANGE_TYPE_DAMAGE);
	},

	/**
	 * Shows entity refresh exhaustion state.
	 * @param {SDK.Action} action
	 * @returns {Number} duration of show
	 */
	showRefreshExhaustionState: function (action) {
		// override in sub class
		return 0.0;
	},

	/**
	 * Shows entity swap allegiance state.
	 * @returns {Number} duration of show
	 */
	showSwapAllegianceState: function () {
		this.updateSpritesForOwner();

		return 0.0;
	},

	/**
	 * Shows entity disappear state with fade out.
	 * @returns {Number} duration of show
	 */
	showDisappearState: function () {
		var showDuration = 0.0;

		if(this.canChangeState()) {
			this.showBaseState();
			this.setStateLocked(true);
			showDuration = CONFIG.FADE_MEDIUM_DURATION;
			this.destroy(showDuration);
		}

		return showDuration;
	},

	/**
	 * Shows entity death state with fade out.
	 * @returns {Number} duration of show
	 */
	showDeathState: function() {
		var showDuration = 0.0;

		if(this.canChangeState()) {
			this.setStateLocked(true);

			this.showNoState();

			this.playSoundDeath(this.sdkCard);

			showDuration = CONFIG.FADE_MEDIUM_DURATION;
			this.destroy(showDuration);
		}

		return showDuration;
	},

	/**
	 * Shows entity casting start state.
	 * @returns {Number} duration of show
	 */
	showCastingStartState: function () {
		var showDuration = 0.0;
		//console.log(this.sdkCard.getLogName(), "showCastingStartState", this._numCastingStatesToShow, this._showingCastingStartStateTimeoutId == null, this._showingCastingStartState, this._showingCastingState);
		// update casting state
		this._cleanupCastingEndStateTimeout();
		this._numCastingStatesToShow++;

		if(this.canChangeState() && this._showingCastingStartStateTimeoutId == null) {
			if (this._showingCastingStartState && !this.getHasActiveState()) {
				// special case: casting loop never started because cast end was triggered
				this.showCastingLoopState();
			} else {
				// get duration
				var animResource = this.getAnimResource();
				var animIdentifier = animResource && animResource.castStart;
				var anim = cc.animationCache.getAnimation(animIdentifier);
				if (anim) {
					showDuration += anim.getDuration() * 0.5;
				}

				// add cast delay
				showDuration += CONFIG.GENERAL_CAST_START_DELAY;

				this._showingCastingStartStateTimeoutId = setTimeout(function () {
					this._showingCastingStartStateTimeoutId = null;
					this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
						if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
						//console.log(this.sdkCard.getLogName(), " > > showCastingStartState", this._numCastingStatesToShow, this._showingCastingEndStateTimeoutId == null, !this.getHasActiveState(), !this._showingCastingState);
						if (this.canChangeState() && this._showingCastingEndStateTimeoutId == null) {
							var animAction = animIdentifier && UtilsEngine.getAnimationAction(animIdentifier);
							if (animAction != null && !this.getHasActiveState() && !this._showingCastingState && !this._showingCastState) {
								// clear all states
								this.showNoState();
								this.removeReadinessVisualTag();
								this._showingCastingStartState = true;
								this._stateActions.push(this.entitySprite.runAction(cc.sequence(
									animAction,
									cc.callFunc(function () {
										this.cleanupStateActions();
										this.showCastingLoopState();
									}.bind(this))
								)));
							}
						}
					}.bind(this));
				}.bind(this), CONFIG.GENERAL_CAST_START_DELAY * 1000.0);
			}
		}

		return showDuration;
	},

	/**
	 * Shows entity casting loop state.
	 * @returns {Number} duration of show
	 */
	showCastingLoopState: function () {
		var showDuration = 0.0;
		//console.log(this.sdkCard.getLogName(), "showCastingLoopState", this._numCastingStatesToShow);
		if(this.canChangeState()) {
			this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
				if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
				if (this.canChangeState() && (!this.getHasActiveState() || this._showingCastingStartState) && this._numCastingStatesToShow > 0 && !this._showingCastingState && !this._showingCastState) {
					//console.log(this.sdkCard.getLogName(), " > > showCastingLoopState");
					this._showingCastingState = true;

					var animResource = this.getAnimResource();

					this.removeReadinessVisualTag();

					var animLoopAction = animResource.castLoop && UtilsEngine.getAnimationAction(animResource.castLoop, true);
					if (animLoopAction != null) {
						var needsStartAnim = !this._showingCastingStartState && this._showingCastingEndStateTimeoutId == null && animResource.castStart;
						var animStartAction;
						if (needsStartAnim) {
							animStartAction = UtilsEngine.getAnimationAction(animResource.castStart);
						}
						if (needsStartAnim && animStartAction != null) {
							// show casting start if not already
							this._stateActions.push(this.entitySprite.runAction(cc.sequence(
								animStartAction,
								cc.callFunc(function () {
									this._stateActions.push(this.entitySprite.runAction(animLoopAction));
								}.bind(this))
							)));
						} else {
							this._stateActions.push(this.entitySprite.runAction(animLoopAction));
						}
					}
				}
			}.bind(this));
		}

		return showDuration;
	},

	/**
	 * Shows entity cast state.
	 * @returns {Number} duration of show
	 */
	showCastState: function () {
		var showDuration = 0.0;
		//console.log(this.sdkCard.getLogName(), "showCastState", this._numCastingStatesToShow);
		// update casting state
		this._cleanupCastingStateTimeouts();

		if(this.canChangeState()) {
			// get duration
			var animResource = this.getAnimResource();
			var animIdentifier;
			if (animResource != null) {
				// use cast animation when present, fallback to attack animation
				animIdentifier = animResource.cast || animResource.attack;
			}
			var anim = cc.animationCache.getAnimation(animIdentifier);
			if (anim) {
				showDuration += anim.getDuration() * 0.25;
			}

			this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
				if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
				if (this.canChangeState()) {
					//console.log(this.sdkCard.getLogName(), " > > showCastState");
					// clear all states
					this.showNoState();
					this.removeReadinessVisualTag();
					this._showingCastState = true;

					// compose sequence
					var sequence = [];

					var animAction = animIdentifier && UtilsEngine.getAnimationAction(animIdentifier);
					if (animAction != null) {
						sequence.push(animAction);
					}

					sequence.push(cc.callFunc(function () {
						this.showNextState();
					}.bind(this)));
					this._stateActions.push(this.entitySprite.runAction(cc.sequence(sequence)));
				}
			}.bind(this));
		}

		return showDuration;
	},

	/**
	 * Shows entity end casting end state.
	 * @returns {Number} duration of show
	 */
	showCastingEndState: function () {
		var showDuration = 0.0;
		//console.log(this.sdkCard.getLogName(), "showCastingEndState", this._numCastingStatesToShow, this._showingCastingEndStateTimeoutId == null, !this._showingCastState);
		// update casting state
		this._cleanupCastingStartStateTimeout();
		this._numCastingStatesToShow = Math.max(0, this._numCastingStatesToShow - 1);

		if (this.canChangeState() && this._showingCastingEndStateTimeoutId == null && !this._showingCastState) {
			// get duration
			var animResource = this.getAnimResource();
			var animIdentifier = animResource && animResource.castEnd;
			var anim = cc.animationCache.getAnimation(animIdentifier);
			if (anim) {
				showDuration += anim.getDuration() * 0.5;
			}

			// add cast delay
			showDuration += CONFIG.GENERAL_CAST_END_DELAY;

			this._showingCastingEndStateTimeoutId = setTimeout(function () {
				this._showingCastingEndStateTimeoutId = null;
				this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
					if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
					//console.log(this.sdkCard.getLogName(), " > > showCastingEndState", this._showingCastingStartStateTimeoutId == null, this._showingCastingStartState || this._showingCastingState, !this._showingCastState);
					if (this.canChangeState() && this._showingCastingStartStateTimeoutId == null && !this.getIsMoving() && (this._showingCastingStartState || this._showingCastingState) && !this._showingCastState) {
						// clear all states
						this.showNoState();

						// compose sequence
						var sequence = [];

						var animAction = animIdentifier && UtilsEngine.getAnimationAction(animIdentifier);
						if (animAction != null) {
							sequence.push(animAction);
						}

						sequence.push(cc.callFunc(this.showNextState, this));
						this._stateActions.push(this.entitySprite.runAction(cc.sequence(sequence)));
					}
				}.bind(this));
			}.bind(this), CONFIG.GENERAL_CAST_END_DELAY * 1000.0);
		}

		return showDuration;
	},

	_cleanupCastingStateTimeouts: function () {
		this._cleanupCastingStartStateTimeout();
		this._cleanupCastingEndStateTimeout();
	},

	_cleanupCastingStartStateTimeout: function () {
		if (this._showingCastingStartStateTimeoutId != null) {
			clearTimeout(this._showingCastingStartStateTimeoutId);
			this._showingCastingStartStateTimeoutId = null;
		}
	},

	_cleanupCastingEndStateTimeout: function () {
		if (this._showingCastingEndStateTimeoutId != null) {
			clearTimeout(this._showingCastingEndStateTimeoutId);
			this._showingCastingEndStateTimeoutId = null;
		}
	},

	/* endregion */

	/* region Visual effect state methods */

	// Overwrite to perform state cleanup for deactivated tags
	_handleDeactivatedVisualStateTags: function(deactivatedVisualStateTags) {
		SdkNode.prototype._handleDeactivatedVisualStateTags.call(this,deactivatedVisualStateTags);
		for (var i=0; i<deactivatedVisualStateTags.length; i++) {
			var currentTag = deactivatedVisualStateTags[i];
			if (currentTag.tagType == EntityNodeVisualStateTag.showTargetableTagType) {
				this._removeGlow();
			} else if (currentTag.tagType == EntityNodeVisualStateTag.showDeemphasisTagType) {
				this._removeDeemphasis();
			} else if (currentTag.tagType == EntityNodeVisualStateTag.showDissolveTagType) {
				this._removeDissolve();
			} else if (currentTag.tagType == EntityNodeVisualStateTag.showReadinessForPlayerTagType) {
				this.removeReadiness();
			} else if (currentTag.tagType == EntityNodeVisualStateTag.showReadinessForOpponentTagType) {
				this.removeReadiness();
			} else if (currentTag.tagType == EntityNodeVisualStateTag.showHoverForPlayerTagType) {
				this._removeHover();
			} else if (currentTag.tagType == EntityNodeVisualStateTag.showHoverForOpponentTagType) {
				this._removeHover();
			} else if (currentTag.tagType == EntityNodeVisualStateTag.showGlowForPlayerTagType) {
				this._removeGlow();
			} else if (currentTag.tagType == EntityNodeVisualStateTag.showGlowForOpponentTagType) {
				this._removeGlow();
			} else if (currentTag.tagType == EntityNodeVisualStateTag.showHighlightTagType) {
				this._removeHighlight();
			} else if (currentTag.tagType == EntityNodeVisualStateTag.showInstructionalGlowTagType) {
				this._removeGlow();
			}

		}
	},

	// Overwrite to perform visual activation for activated tags
	_handleActivatedVisualStateTags: function(activatedVisualStateTags) {
		SdkNode.prototype._handleActivatedVisualStateTags.call(this,activatedVisualStateTags);
		for (var i=0; i<activatedVisualStateTags.length; i++) {
			var currentTag = activatedVisualStateTags[i];
			if (currentTag.tagType == EntityNodeVisualStateTag.showTargetableTagType) {
				this._showGlowForAttackable();
			} else if (currentTag.tagType == EntityNodeVisualStateTag.showDeemphasisTagType) {
				this._showDeemphasis();
			} else if (currentTag.tagType == EntityNodeVisualStateTag.showDissolveTagType) {
				this._showDissolve();
			} else if (currentTag.tagType == EntityNodeVisualStateTag.showReadinessForPlayerTagType) {
				if (currentTag.showReadinessForPlayer) {
					this._showReadinessForPlayer();
				}
			} else if (currentTag.tagType == EntityNodeVisualStateTag.showReadinessForOpponentTagType) {
				this._showReadinessForOpponent();
			} else if (currentTag.tagType == EntityNodeVisualStateTag.showHoverForPlayerTagType) {
				this._showHoverForPlayer();
			} else if (currentTag.tagType == EntityNodeVisualStateTag.showHoverForOpponentTagType) {
				this._showHoverForOpponent();
			} else if (currentTag.tagType == EntityNodeVisualStateTag.showGlowForPlayerTagType) {
				this._showGlowForPlayer();
			} else if (currentTag.tagType == EntityNodeVisualStateTag.showGlowForOpponentTagType) {
				this._showGlowForOpponent();
			} else if (currentTag.tagType == EntityNodeVisualStateTag.showHighlightTagType) {
				this._showHighlight(currentTag.color, currentTag.frequency, currentTag.minAlpha, currentTag.maxAlpha);
			} else if (currentTag.tagType == EntityNodeVisualStateTag.showInstructionalGlowTagType) {
				this._showGlowForInstructional();
			}
		}
	},

	/* region SHADERS */

	/* region DEEMPHASIS */

	// Applies effect representing the entity being less important
	_deemphasisVisualTagId: "DeemphasisVisualTagId",
	addDeemphasisVisualTag: function () {
		this.addInjectedVisualStateTagWithId(EntityNodeVisualStateTag.createShowDeemphasisTag(),this._deemphasisVisualTagId);
	},
	removeDeemphasisVisualTag: function () {
		this.removeInjectedVisualStateTagById(this._deemphasisVisualTagId);
	},

	_showDeemphasis: function () {
		this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
			if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

			this.entitySprite.setShaderProgram(cc.shaderCache.programForKey("Monochrome"));
		}.bind(this));
	},
	// This is the only effect that sets the shader, return the shader to base form
	_removeDeemphasis: function () {
		this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
			if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

			this.entitySprite.setShaderProgram(cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR));
		}.bind(this));
	},

	/* endregion DEEMPHASIS */

	/* region DISSOLVE */

	_dissolveVisualTagId: "DissolveVisualTagId",
	addDissolveVisualTag: function () {
		this.addInjectedVisualStateTagWithId(EntityNodeVisualStateTag.createShowDissolveTag(),this._dissolveVisualTagId);
	},
	removeDissolveVisualTag: function () {
		this.removeInjectedVisualStateTagById(this._dissolveVisualTagId);
	},

	_showDissolve: function () {
		this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
			if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
			this.entitySprite.setDissolving(true);
		}.bind(this));
	},
	_removeDissolve: function () {
		this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
			if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
			this.entitySprite.setDissolving(false);
		}.bind(this));
	},

	/* endregion DISSOLVE */

	_exhaustedVisualTagId: "ExhaustedVisualTagId",
	_readinessVisualTagId: "ReadinessVisualTagId",
	// Shows effects related to readiness of entity including: ready particle effect, glow, and exhaustion deemphasis
	updateReadinessVisualTag: function () {
		if (this.getIsTargetable() && this.getIsSpawned()) {
			var sdkCard = this.sdkCard;
			var scene = this.getScene();
			var gameLayer = scene && scene.getGameLayer();
			if (gameLayer != null && gameLayer.getIsGameActive() && !gameLayer.getIsPlayerSelectionLocked()) {
				if (sdkCard.isOwnedByOpponentPlayer()) {
					// opponent cards always show readiness
					this.addReadinessVisualTag();
				} else {
					// my cards show readiness only when ready for the last action
					var isReady = this.getIsReadyAtAction(gameLayer && gameLayer.getLastShownSdkStateRecordingAction());
					var isMyTurn = gameLayer.getIsMyTurn();
					var canShowReadiness = isMyTurn && !gameLayer.getIsShowingStep() && !gameLayer.getMyPlayer().getIsTakingSelectionAction();
					if (isReady && canShowReadiness) {
						this.addReadinessVisualTag();
					} else {
						this.removeReadinessVisualTag();
						if (!isReady && isMyTurn && !this.getHasActiveState() && !sdkCard.getIsUncontrollableBattlePet()) {
							// exhaustion show for when something has moved but cannot attack (effectively exhausted unless something is moved)
							this.addDeemphasisVisualTag();
						}
					}
				}
			} else {
				this.removeReadinessVisualTag();
			}
		}
	},

	addReadinessVisualTag: function () {
		this.removeDeemphasisVisualTag();

		if(this.sdkCard.isOwnedByMyPlayer()) {
			this.addInjectedVisualStateTagWithId(EntityNodeVisualStateTag.createShowReadinessForPlayerTag(),this._readinessVisualTagId);
		} else {
			this.addInjectedVisualStateTagWithId(EntityNodeVisualStateTag.createShowReadinessForOpponentTag(),this._readinessVisualTagId);
		}
	},

	removeReadinessVisualTag: function () {
		this.removeDeemphasisVisualTag();
		this.removeInjectedVisualStateTagById(this._readinessVisualTagId);
	},

	_showReadinessForPlayer: function () {
		if (this.getIsTargetable()) {
			if (this._readinessParticles != null) {
				if (CONFIG.PLAYER_READY_PARTICLES_VISIBLE) {
					this._readinessParticles.setColor(CONFIG.PLAYER_READY_COLOR);
					if (!this._readinessParticles.isActive()) {
						this._readinessParticles.resumeSystem();
					}
				} else if (this._readinessParticles.isActive()) {
					this._readinessParticles.stopSystem();
				}
			}

			if (CONFIG.PLAYER_READY_HIGHLIGHT_VISIBLE) {
				this._showHighlight(CONFIG.PLAYER_READY_HIGHLIGHT_COLOR, CONFIG.PLAYER_READY_HIGHLIGHT_FREQUENCY, CONFIG.PLAYER_READY_HIGHLIGHT_OPACITY_MIN, CONFIG.PLAYER_READY_HIGHLIGHT_OPACITY_MAX);
			} else {
				this._removeHighlight();
			}

			if (this.getAutoZOrder()) {
				this.setLocalZOrder(this.getAutoZOrderValue());
			}
		}
	},

	_showReadinessForOpponent: function () {
		if (this.getIsTargetable()) {
			if (this._readinessParticles != null) {
				if (CONFIG.OPPONENT_READY_PARTICLES_VISIBLE) {
					this._readinessParticles.setColor(CONFIG.OPPONENT_READY_COLOR);
					if (!this._readinessParticles.isActive()) {
						this._readinessParticles.resumeSystem();
					}
				} else if (this._readinessParticles.isActive()) {
					this._readinessParticles.stopSystem();
				}
			}

			if (CONFIG.OPPONENT_READY_HIGHLIGHT_VISIBLE) {
				this._showHighlight(CONFIG.OPPONENT_READY_HIGHLIGHT_COLOR, CONFIG.OPPONENT_READY_HIGHLIGHT_FREQUENCY, CONFIG.OPPONENT_READY_HIGHLIGHT_OPACITY_MIN, CONFIG.OPPONENT_READY_HIGHLIGHT_OPACITY_MAX);
			} else {
				this._removeHighlight();
			}

			if (this.getAutoZOrder()) {
				this.setLocalZOrder(this.getAutoZOrderValue());
			}
		}
	},

	removeReadiness: function () {
		if (this.getIsTargetable()) {
			if (this._readinessParticles != null) {
				if (this._readinessParticles.isActive()) {
					this._readinessParticles.stopSystem();
				}
			}

			this._removeHighlight();
		}
	},

	_showHighlight: function (color, frequency, minAlpha, maxAlpha) {
		this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
			if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
			this.entitySprite.showHighlight(color, frequency, minAlpha, maxAlpha);
		}.bind(this));
	},

	_removeHighlight: function () {
		this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
			if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
			this.entitySprite.fadeOutHighlight();
		}.bind(this));
	},

	_showHoverForPlayer: function () {
		this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
			if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
			this.entitySprite.showGlowForPlayer();
		}.bind(this));
	},

	_showHoverForOpponent: function () {
		this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
			if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
			this.entitySprite.showGlowForOpponent();
		}.bind(this));
	},

	_removeHover: function () {
		this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
			if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
			this.entitySprite.fadeOutGlow();
		}.bind(this));
	},

	_showGlowForAttackable: function () {
		this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
			if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
			this.entitySprite.showGlowForAttackableTarget();
		}.bind(this));
	},

	_showGlowForPlayer: function () {
		this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
			if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
			this.entitySprite.showGlowForPlayer();
		}.bind(this));
	},

	_showGlowForOpponent: function () {
		this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
			if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
			this.entitySprite.showGlowForOpponent();
		}.bind(this));
	},

	_showGlowForInstructional: function () {
		this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
			if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
			this.entitySprite.showGlowForInstructional();
		}.bind(this));
	},

	_removeGlow: function () {
		this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
			if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
			this.entitySprite.fadeOutGlow();
		}.bind(this));
	},

	/**
	 * Resets the node depending on which player owns it.
	 */
	resetStateByOwner:function() {
		if (this.sdkCard != null && this.entitySprite != null) {
			if (this.sdkCard.isOwnedByPlayer2()) {
				if (!this.getIsMoving()) {
					this.entitySprite.setFlippedX(true);
				}
			} else {
				if (!this.getIsMoving()) {
					this.entitySprite.setFlippedX(false);
				}
			}
		}
	},

	/* endregion Visual effect state methods */

	/* region Triggered visual effects */

	showModifierChanges: function (modifier, action, forRemove) {
		var showDuration = this._super(modifier, action, forRemove);

		if (modifier instanceof SDK.ModifierProvoked) {
			// special case: provoked
			showDuration += this.showModifierProvokedChanges(modifier, forRemove);
		}

		return showDuration;
	},

	/**
	 * Shows predefined fx for the application or removal of provoked modifiers.
	 * @param {SDK.ModifierProvoked} modifier
	 * @param {Boolean} [forRemove=false]
	 * @returns {Number} show duration
	 */
	showModifierProvokedChanges: function (modifier, forRemove) {
		var showDuration = 0.0;

		if (this.canChangeState() && modifier != null && modifier instanceof SDK.ModifierProvoked) {
			var provokeModifier = modifier.getAppliedByModifier();
			if (provokeModifier instanceof SDK.ModifierProvoke) {
				var sourceSdkCard = provokeModifier.getCardAffected();
				var targetSdkCard = this.getSdkCard();
				var lifeDuration = 0.6;
				var travelDuration = 0.1;

				// re-set the unit's state so it grabs the idle state since the unit is provoked
				if (!this.getHasActiveState()) {
					this.showNoState();
					this.showBaseState();
				}

				if (!forRemove) {

					this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
						if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

						var colorForOwnerTint = this._getColorForOwnerTint() || cc.color(255, 255, 255);
						this.entitySprite.runAction(cc.sequence(
							cc.delayTime(lifeDuration),
							cc.tintTo(0.2, 0, 0, 0),
							cc.delayTime(0.2),
							cc.tintTo(0.2, colorForOwnerTint.r, colorForOwnerTint.g, colorForOwnerTint.b)
						));
					}.bind(this));

					var sourceScreenPosition = UtilsEngine.transformBoardToTileMap(sourceSdkCard.getPosition());
					var targetScreenPosition = UtilsEngine.transformBoardToTileMap(targetSdkCard.getPosition());

					// show particles
					var particleSystem = BaseParticleSystem.create(RSX.ptcl_soot_ball.plist);
					particleSystem.setAutoRemoveOnFinish(false);
					particleSystem.setNeedsDepthTest(true);
					particleSystem.setPixelGridAligned(true);
					particleSystem.setPositionType(cc.ParticleSystem.TYPE_FOLLOW);
					particleSystem.setDuration(0.0);
					particleSystem.setScale(0.8);
					particleSystem.setPosition(sourceScreenPosition);
					this.getScene().getGameLayer().addNodes(particleSystem);

					// move fx sprites
					particleSystem.runAction(cc.sequence(
						cc.delayTime(lifeDuration),
						cc.moveTo(travelDuration, targetScreenPosition),
						cc.delayTime(lifeDuration),
						cc.callFunc(function () {
							this.destroy(CONFIG.FADE_MEDIUM_DURATION)
						}.bind(particleSystem))
					));
				}
			}
		}

		return showDuration;
	},

	showMoveIncreaseState: function (buffValue) {
		// TODO: this should be a separate fx sprite and not specific to unit nodes
		/*
	  this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
	    if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
			if(this.canChangeState()) {
				this.showNoState();

				var sdkCard = this.sdkCard;
				var entitySprite = this.entitySprite;
				var anim = cc.animationCache.getAnimation(this.getAnimResource().walk);

				var offset = CONFIG.TILESIZE;// * 0.5;
				var delay = 0.0;
				var duration = anim.getDuration() * (offset / CONFIG.TILESIZE);
				var numClones = 2 * buffValue;
				var deltaDuration = duration / numClones;

				// reverse offset for player 1
				if(sdkCard.isOwnedByPlayer1()) {
					offset *= -1;
				}

				// get source and target
				var sourceScreenPosition = entitySprite.getPosition();
				var targetScreenPosition = cc.p(sourceScreenPosition.x + offset, sourceScreenPosition.y);

				// copy self
				this.cloneSprites = [];
				for (var i = 0; i < numClones; i++) {
					this._showClone(entitySprite, sourceScreenPosition, targetScreenPosition, anim, false, 127, false, delay, duration);
					delay += deltaDuration;
				}

				// add enough reaction animations to cover duration
				var animReaction = cc.animationCache.getAnimation(this.getAnimResource().walk);
				var sequenceSteps = [];
				var numReactions = Math.ceil((duration * 2) / animReaction.getDuration()) || 1;
				for(i = 0; i < numReactions; i++) {
					sequenceSteps.push(cc.Animate.create(animReaction));
				}
				sequenceSteps.push(cc.callFunc(this.showNextState, this));
				this._stateActions.push(entitySprite.runAction(cc.sequence(sequenceSteps)));
			}
		}.bind(this));
		*/
	}

	/* endregion Triggered Visual Effects */

});

EntityNode.create = function(sdkCard, node) {
	return SdkNode.create(sdkCard, node || new EntityNode(sdkCard));
};

module.exports = EntityNode;
