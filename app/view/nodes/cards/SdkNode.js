var Logger = require('app/common/logger');
var DATA = require('app/data');
var CONFIG = require('app/common/config');
var EVENTS = require('app/common/event_types');
var UtilsJavascript = require('app/common/utils/utils_javascript');
var PKGS = require('app/data/packages');
var PackageManager = require('app/ui/managers/package_manager');
var SDK = require('app/sdk');
var InstructionNode = require('./InstructionNode');
var StatsChangeNode = require("./StatsChangeNode");
var NodeFactory = require('./../../helpers/NodeFactory');
var Promise = require('bluebird');
var GlowSprite = require("./../GlowSprite");
var _ = require("underscore");

/****************************************************************************
SdkNode
- abstract cocos node that interacts with an sdk card
 ****************************************************************************/

var SdkNode = cc.Node.extend({

	_animationActions: null,
	_cardResourceRequestId: null,
	_fxSprites: null,
	_instructionNode: null,
	_loadRequests: null,
	_modifierIndices: null,
	_modifiers: null,
	_modifierLoadDataByLoadId: null,
	sdkCard: null,

	/* region INITIALIZATION */

	ctor: function (sdkCard) {
		// initialize properties that may be required in init
		this._loadRequests = [];
		this._fxSprites = [];
		this._animationActions = [];

		this._modifierIndices = [];
		this._modifiers = [];
		this._modifierLoadDataByLoadId = {};

		// do super ctor
		this._super();

		// apply options
		var nodeOptions = sdkCard && sdkCard.getNodeOptions() || {};
		if (_.isObject(nodeOptions)) {
			this.setOptions(nodeOptions);
		}

		this.setAnchorPoint(0.5, 0.5);

		// set sdk card
		this.setSdkCard(sdkCard);
	},

	terminateSupportNodes: function (duration) {
		if (this._instructionNode != null) {
			this._instructionNode.stopAllActions();
			this._instructionNode.destroy(duration);
			this._instructionNode = null;
		}
	},

	updateSupportNodePositions: function () {
		if (this._instructionNode != null) {
			var position = this.getCenterPositionForExternal();
			if (this._instructionNode.getIsLeft()) {
				position.x += CONFIG.INSTRUCTION_NODE_OFFSET;
				position.y -= CONFIG.INSTRUCTION_NODE_OFFSET * 0.25;
			} else if (this._instructionNode.getIsRight()) {
				position.x -= CONFIG.INSTRUCTION_NODE_OFFSET;
				position.y -= CONFIG.INSTRUCTION_NODE_OFFSET * 0.25;
			} else if (this._instructionNode.getIsUp()) {
				position.y -= CONFIG.INSTRUCTION_NODE_OFFSET;
			} else {
				position.y += CONFIG.INSTRUCTION_NODE_OFFSET;
			}
			this._instructionNode.setPosition(position.x, position.y);
		}
	},

	/* endregion INITIALIZATION */

	/* region RESOURCES */

	removeAllResourceRequests: function () {
		this.releaseAnimResource();
		this.releaseSoundResource();
		this.invalidateAndUnloadAllModifierResources();
		return cc.Node.prototype.removeAllResourceRequests.call(this);
	},

	/**
	 * Returns a resource request identifier for a card.
	 * @returns {String|Number}
	 */
	getCardResourceRequestId: function () {
		return this._cardResourceRequestId;
	},

	/**
	 * Returns a resource package identifier for a card. Defaults to the card's game package, override to use a different package.
	 * @param {SDK.Card} sdkCard
	 * @returns {String}
	 */
	getCardResourcePackageId: function (sdkCard) {
		return PKGS.getCardGamePkgIdentifier(sdkCard.getId());
	},

	/* endregion RESOURCES */

	/* region GETTERS / SETTERS */

	/**
	 * Sets the sdk card that this node should visualize. Loads resources for the card as needed.
	 * @param sdkCard
	 */
	setSdkCard:function(sdkCard) {
		if (this.sdkCard != sdkCard) {
			// stop any running animations
			this.stopAnimations();

			// invalidate previous resources
			if (this._cardResourceRequestId != null) {
				this.removeResourceRequestById(this._cardResourceRequestId);
				this._cardResourceRequestId = null;
			}

			// store new card
			this.sdkCard = sdkCard;

			if (this.sdkCard instanceof SDK.Card) {
				// load resources for this card with a unique package identifier
				// this way we can release this package when we destroy this node
				// but anything else using this same card package will be preserved
				var cardPkgId = this.getCardResourcePackageId(sdkCard);
				this._cardResourceRequestId = sdkCard.getId() + "_" + UtilsJavascript.generateIncrementalId();

				var additionalCardResources;

				// include signature card resources
				if (this.sdkCard instanceof SDK.Entity && this.sdkCard.getWasGeneral()) {
					var referenceSignatureCard = this.sdkCard.getReferenceSignatureCard();
					if (referenceSignatureCard != null) {
						var signatureCardPkgId = this.getCardResourcePackageId(referenceSignatureCard);
						additionalCardResources = PKGS.getPkgForIdentifier(signatureCardPkgId);
					}
				}

				// setup promise to wait for resources
				this.addResourceRequest(this._cardResourceRequestId, cardPkgId, additionalCardResources);
			}

			// set base resources from card
			this.updateAnimResource();
			this.updateSoundResource();
		}
	},

	getSdkCard:function() {
		return this.sdkCard;
	},

	getIsActive:function() {
		return this.sdkCard != null && this.sdkCard.getIsActive();
	},

	getBoardPosition: function () {
		return this.sdkCard != null ? this.sdkCard.getPosition() : cc.p(CONFIG.BOARDCENTER.x, CONFIG.BOARDCENTER.y);
	},

	getFXSprites: function () {
		return this._fxSprites;
	},

	getPositionForExternalFX: function () {
		return this.getPosition();
	},

	setPosition: function () {
		cc.Node.prototype.setPosition.apply(this, arguments);
		// auto reposition support nodes
		// they are not this node's children but should track it
		this.updateSupportNodePositions();
	},

	/* endregion GETTERS / SETTERS */

	/* region COCOS EVENTS */

	onEnter: function () {
		cc.Node.prototype.onEnter.call(this);
		this._startListeningToEvents();
	},

	onExit: function () {
		cc.Node.prototype.onExit.call(this);
		this._stopListeningToEvents();

		// remove support nodes
		this.terminateSupportNodes();

		// clear fx
		this.removeFX();

		// remove from game layer
		var scene = this.getScene();
		var gameLayer = scene && scene.getGameLayer();
		gameLayer && gameLayer.removeNode(this);
	},

	destroy: function (duration) {
		cc.Node.prototype.destroy.call(this, duration);
		this.terminateSupportNodes(duration);
	},

	/* endregion COCOS EVENTS */

	/* region EVENTS */

	_startListeningToEvents: function () {
		var scene = this.getScene();
		var gameLayer = scene && scene.getGameLayer();
		if (gameLayer) {
			gameLayer.getEventBus().on(EVENTS.before_show_action, this.onBeforeShowAction, this);
		}
	},

	_stopListeningToEvents: function () {
		var scene = this.getScene();
		var gameLayer = scene && scene.getGameLayer();
		if (gameLayer) {
			gameLayer.getEventBus().off(EVENTS.before_show_action, this.onBeforeShowAction, this);
		}
	},

	onBeforeShowAction: function () {
		// check current fx sprites list
		// remove reference to any that no longer have a parent
		for (var i = this._fxSprites.length - 1; i >= 0; i--) {
			if (!this._fxSprites[i].getParent()) {
				this._fxSprites.splice(i, 1);
			}
		}
	},

	/* endregion EVENTS */

	/* region ANIMATION */

	/**
	 * Stops all currently running actions that have been recorded as animation actions.
	 * @see SdkNode.addAnimationAction
	 */
	stopAnimations: function () {
		if (this._animationActions != null && this._animationActions.length > 0) {
			for (var i = 0, il = this._animationActions.length; i < il; i++) {
				var action = this._animationActions[i];
				var target = action.getTarget();
				if (target != null) {
					target.stopAction(action);
				}
			}
			this._animationActions = [];
		}
	},

	/**
	 * Adds an action to the list of animation actions. Useful for automatically stopping previous animations without worrying about tags or running all actions on this node only.
	 * @param {cc.Action} action
	 */
	addAnimationAction: function (action) {
		if (action != null && this._animationActions != null) {
			this._animationActions.push(action);
		}
	},

	/* endregion ANIMATION */

	/* region FX */

	showFX: function (fx) {
		var fxSprites = NodeFactory.createFX(fx);
		var sdkCard = this.sdkCard;

		if(sdkCard != null && fxSprites.length > 0) {
			// add new fx
			var ownedByPlayer2 = sdkCard.isOwnedByPlayer2();
			var ownedByMyPlayer = sdkCard.isOwnedByMyPlayer();
			var centerPosition = this.getCenterPosition();
			var externalFXSprites = [];
			for(var i = 0, il = fxSprites.length; i < il; i++) {
				var fxSprite = fxSprites[i];
				if (fxSprite.layerName != null) {
					externalFXSprites.push(fxSprite);
				} else {
					// fx should not be auto z ordered when added to node
					fxSprite.setAutoZOrder(false);

					// offset
					var fxPosition = fxSprite.getPosition();
					fxSprite.setPosition(fxPosition.x + centerPosition.x, fxPosition.y + centerPosition.y);

					// correct for multiplicative scale
					fxSprite.setScale(fxSprite.getScale() / this.getScale());

					// add to self
					this._fxSprites.push(fxSprite);
					this.addChild(fxSprite, fxSprite.getLocalZOrder() || 0);
				}

				// set owner specific properties
				if (!sdkCard.isOwnedByGameSession()) {
					// flip by player
					if (ownedByPlayer2) {
						if (fxSprite.setFlippedX) {
							fxSprite.setFlippedX(!fxSprite._flippedX);
						}
					}

					// color by owner
					if (fxSprite.getColorByOwner && fxSprite.getColorByOwner()) {
						if (ownedByMyPlayer) {
							fxSprite.setColor(CONFIG.PLAYER_FX_COLOR);
						} else {
							fxSprite.setColor(CONFIG.OPPONENT_FX_COLOR);
						}
					}
				}
			}

			if (externalFXSprites.length > 0) {
				this.showExternalFX(externalFXSprites);
			}
		}

		return fxSprites;
	},
	showExternalFX: function (fx) {
		var fxSprites = NodeFactory.createFX(fx);

		if(fxSprites.length > 0) {
			var position = this.getPositionForExternalFX();
			for(var i = 0, il = fxSprites.length; i < il; i++) {
				var fxSprite = fxSprites[i];
				var spritePosition = fxSprite.getPosition();
				fxSprite.setPosition(spritePosition.x + position.x, spritePosition.y + position.y);
				fxSprite.setAutoZOrderOffset(fxSprite.getAutoZOrderOffset() + this.getAutoZOrderOffset());
			}
			this.getScene().getGameLayer().addNodes(fxSprites);
			this._fxSprites = this._fxSprites.concat(fxSprites);

		}

		return fxSprites;
	},
	showContinuousFX: function(fx, tag) {
		var fxSprites = this.showFX(fx);
		if(fxSprites.length > 0) {
			for(var i = 0, il = fxSprites.length; i < il; i++) {
				var fxSprite = fxSprites[i];
				fxSprite.setTag(tag);
				if(fxSprite.setRemoveOnEnd) {
					fxSprite.setRemoveOnEnd(false);
				}
			}
		}
		return fxSprites;
	},

	removeFX: function (duration, fxSprites) {
		fxSprites || (fxSprites = this._fxSprites);
		if(fxSprites != null && fxSprites.length > 0) {
			for(var i = 0, il = fxSprites.length; i < il; i++) {
				var fxSprite = fxSprites[i];
				fxSprite.destroy(duration);
			}
			fxSprites.length = 0;
		}
	},
	removeExternalFX: function (duration, fxSprites) {
		fxSprites || (fxSprites = this._fxSprites);
		if(fxSprites != null && fxSprites.length > 0) {
			for(var i = fxSprites.length - 1; i >= 0; i--) {
				var fxSprite = fxSprites[i];
				fxSprite.destroy(duration);
				fxSprites.splice(i, 1);
			}
		}
	},
	removeContinuousFX: function (tag, duration, fxSprites) {
		fxSprites || (fxSprites = this._fxSprites);
		if(fxSprites != null && fxSprites.length > 0) {
			for(var i = fxSprites.length - 1; i >= 0; i--) {
				var fxSprite = fxSprites[i];
				if (fxSprite.getTag() === tag) {
					fxSprite.destroy(duration);
					fxSprites.splice(i, 1);
				}
			}
		}
	},

	/* endregion FX */

	/* region ANIM / SOUND RESOURCES */

	updateAnimResource: function () {
		// find resource
		var resource;
		var modifiers = this.getModifiers();
		if (modifiers.length > 0) {
			for (var i = modifiers.length - 1; i >= 0; i--) {
				var modifier = modifiers[i];
				if (modifier instanceof SDK.Modifier) {
					var modifierResource = modifier.getAnimResource();
					if (modifierResource != null) {
						if (modifier.getIsManagedByAura()) {
							// always use most recent aura modifier
							resource = modifierResource;
							break;
						} else if (resource == null) {
							resource = modifierResource;
						}
					}
				}
			}
		}

		// when resource has changed
		if (resource == null && this.sdkCard != null) {
			resource = this.sdkCard.getBaseAnimResource();
		}
		if (this._animResource !== resource) {
			var resource_prev = this._animResource;
			this._animResource = resource;

			// retain new
			this._retainResourceMap(this._animResource);

			// handle change of resource
			this.onChangeAnimationResource();

			// release previous
			if (resource_prev != null && (this.sdkCard == null || resource_prev !== this.sdkCard.getBaseAnimResource())) {
				this._releaseResourceMap(resource_prev);
			}
		}
	},

	onChangeAnimationResource: function () {
		// override in sub class
	},

	getAnimResource: function () {
		return this._animResource;
	},

	releaseAnimResource: function () {
		var animResource = this._animResource;
		if (animResource != null) {
			this._animResource = null;
			this._releaseResourceMap(animResource);
		}
	},

	updateSoundResource: function () {
		// find resource
		var resource;
		var modifiers = this.getModifiers();
		if (modifiers.length > 0) {
			for (var i = modifiers.length - 1; i >= 0; i--) {
				var modifier = modifiers[i];
				if (modifier instanceof SDK.Modifier) {
					var modifierResource = modifier.getSoundResource();
					if (modifierResource != null) {
						if (modifier.getIsManagedByAura()) {
							// always use most recent aura modifier
							resource = modifierResource;
							break;
						} else if (resource == null) {
							resource = modifierResource;
						}
					}
				}
			}
		}

		// when resource has changed
		if (resource == null && this.sdkCard != null) {
			resource = this.sdkCard.getBaseSoundResource();
		}
		if (this._soundResource !== resource) {
			var resource_prev = this._soundResource;
			this._soundResource = resource;

			// retain new
			this._retainResourceMap(this._soundResource);

			// handle change of resource
			this.onChangeSoundResource();

			// release previous
			if (resource_prev != null && (this.sdkCard == null || resource_prev !== this.sdkCard.getBaseSoundResource())) {
				this._releaseResourceMap(resource_prev);
			}
		}
	},

	onChangeSoundResource: function () {
		// override in sub class
	},

	getSoundResource: function () {
		return this._soundResource;
	},

	releaseSoundResource: function () {
		var soundResource = this._soundResource;
		if (soundResource != null) {
			this._soundResource = null;
			this._releaseResourceMap(soundResource);
		}
	},

	_retainResourceMap: function (resource_map) {
		if (resource_map != null) {
			var resource_map_id = resource_map._id;
			if (resource_map_id == null) {
				resource_map_id = resource_map._id = UtilsJavascript.generateIncrementalId();
			}
			var keys = Object.keys(resource_map);
			for (var i = 0, il = keys.length; i < il; i++) {
				var key = keys[i];
				var resource = resource_map[key];
				PackageManager.getInstance().addStrongReferenceToResourcePath(resource, resource_map_id);
			}
		}
	},

	_releaseResourceMap: function (resource_map) {
		if (resource_map != null) {
			var resource_map_id = resource_map._id;
			if (resource_map_id != null) {
				var keys = Object.keys(resource_map);
				for (var i = 0, il = keys.length; i < il; i++) {
					var key = keys[i];
					var resource = resource_map[key];
					PackageManager.getInstance().removeStrongReferenceToResourcePath(resource, resource_map_id);
				}
			}
		}
	},

	/* endregion ANIM / SOUND RESOURCES */

	/* region MODIFIERS */

	/**
	 * Loads a modifier's resources and returns a promise
	 * @param {SDK.Modifier} modifier
	 * @returns {Promise}
	 */
	loadModifierResources: function (modifier) {
		var modifierIndex = modifier.getIndex();
		var modifierLoadId = this.getModifierLoadId(modifier);
		var modifierLoadData = this._modifierLoadDataByLoadId[modifierLoadId];

		// load modifier resources
		if (modifierLoadData == null) {
			// add modifier index to list of applied modifiers
			this._modifierIndices.push(modifierIndex);
			this._modifiers = SDK.GameSession.getInstance().getModifiersByIndices(this._modifierIndices);

			// start new load for modifier resources
			var modifierType = modifier.getType();
			modifierLoadData = this._modifierLoadDataByLoadId[modifierLoadId] = {
				valid: true,
				id: modifierLoadId,
				modifierIndex: modifierIndex,
				promise: this.addResourceRequest(modifierLoadId, modifierType)
			};
		}

		return modifierLoadData.promise;
	},

	/**
	 * Invalidates a modifier resources load and unloads the resources.
	 * @param {Int} modifierLoadId
	 */
	invalidateAndUnloadModifierResources: function (modifierLoadId) {
		var modifierLoadData = this._modifierLoadDataByLoadId[modifierLoadId];
		if (modifierLoadData != null && modifierLoadData.valid) {
			// invalidate modifier load data
			modifierLoadData.valid = false;
			this._modifierIndices = _.without(this._modifierIndices, modifierLoadData.modifierIndex);
			this._modifiers = SDK.GameSession.getInstance().getModifiersByIndices(this._modifierIndices);
			this.removeResourceRequestById(modifierLoadId);
		} else if (modifierLoadData == null) {
			// create pseudo load data so that any further attempts to use resources for this modifier get blocked
			this._modifierLoadDataByLoadId[modifierLoadId] = {
				valid: false,
				promise: Promise.resolve(modifierLoadId)
			};
		}
	},

	/**
	 * Invalidates all modifier resources loads and unloads all resources.
	 */
	invalidateAndUnloadAllModifierResources: function () {
		for (var modifierLoadId in this._modifierLoadDataByLoadId) {
			this.invalidateAndUnloadModifierResources(modifierLoadId);
		}
	},

	/**
	 * Returns a modifier's load id.
	 * @param {SDK.Modifier} modifier
	 * @returns {String}
	 */
	getModifierLoadId: function (modifier) {
		return modifier.getType() + modifier.getIndex();
	},

	/**
	 * Returns whether modifier resources are loaded and valid.
	 * @param {String} modifierLoadId
	 * @returns {Boolean}
	 */
	getAreModifierResourcesValid: function (modifierLoadId) {
		var modifierLoadData = this._modifierLoadDataByLoadId[modifierLoadId];
		return modifierLoadData != null && modifierLoadData.valid;
	},

	/**
	 * Returns list of modifiers active visually.
	 * NOTE: may not be in sync with sdk state!
	 */
	getModifiers: function () {
		return this._modifiers;
	},

	/**
	 * Returns list of modifier indices active visually.
	 * NOTE: may not be in sync with sdk state!
	 */
	getModifierIndices: function () {
		return this._modifierIndices;
	},

	/**
	 * Returns whether a modifier can be shown.
	 * @param {Modifier} modifier
	 * @param {Action} [action=null]
	 */
	canShowModifier: function (modifier, action) {
		return true;
	},

	/**
	 * Shows the stat changes, one time fx, and continuous fx of a modifier when applied.
	 * @param {SDK.Modifier} modifier
	 * @param {SDK.Action} action
	 * @param {Boolean} [suppressChanges=false] whether to suppress showing changes and just show continuous fx
	 * @returns {Number} show duration
	 */
	showAppliedModifier: function(modifier, action, suppressChanges) {
		var showDuration = 0.0;

		if (modifier != null && this.canShowModifier(modifier, action)) {
			// wait for resources to load
			Promise.all([
				this.loadModifierResources(modifier),
				this.whenResourcesReady(this.getCardResourceRequestId())
			]).spread(function (modifierLoadId, cardResourceRequestId) {
				// ensure that modifier load and resources are valid
				if (!this.getAreModifierResourcesValid(modifierLoadId) || !this.getAreResourcesValid(cardResourceRequestId)) return;

				// show one time applied fx for modifier
				if (!suppressChanges) {
					this.showFX(DATA.dataForIdentifiersWithFilter(modifier.getFXResource(), SDK.FXType.ModifierAppliedFX));
				}
			}.bind(this));
		}

		return showDuration;
	},

	/**
	 * Shows a modifier being activated.
	 * @param {SDK.Modifier} modifier
	 * @param {SDK.Action} action
	 * @param {Boolean} [suppressChanges=false] whether to suppress showing changes and just show continuous fx
	 * @param {Number} [continuousFXFadeDuration=0.0] fade duration of continuous fx
	 * @returns {Number} show duration
	 */
	showActivatedModifier: function (modifier, action, suppressChanges, continuousFXFadeDuration) {
		var showDuration = 0.0;

		if (modifier != null) {
			var sdkCard = this.getSdkCard();

			// show changes
			if (!suppressChanges && this.canShowModifier(modifier, action)
				// don't show changes if for removal
				&& (action == null || action.getMatchingAncestorAction(SDK.RemoveAction, null, sdkCard) == null)
				// don't show changes if for apply to board
				&& (action == null || action.getMatchingAncestorAction(SDK.ApplyCardToBoardAction, null, sdkCard) == null)) {
				showDuration += this.showModifierChanges(modifier, action);
			}

			// wait for resources to load
			Promise.all([
				this.loadModifierResources(modifier),
				this.whenResourcesReady(this.getCardResourceRequestId())
			]).spread(function (modifierLoadId, cardResourceRequestId) {
				// ensure that modifier load and resources are valid
				if (!this.getAreModifierResourcesValid(modifierLoadId) || !this.getAreResourcesValid(cardResourceRequestId)) return;

				// update resources
				if (modifier.getAnimResource() != null) {
					this.updateAnimResource();
				}
				if (modifier.getSoundResource() != null) {
					this.updateSoundResource();
				}

				// inject modifier cardFXResource into sdk object
				var cardFXResource = modifier.getCardFXResource();
				if (cardFXResource) {
					this.sdkCard.addFXResource(cardFXResource);
				}

				// show continuous fx for modifier
				var stackType = modifier.getStackType();
				if (!this.getChildByTag(stackType)) {
					var continuousFXSprites = this.showContinuousFX(DATA.dataForIdentifiersWithFilter(modifier.getFXResource(), SDK.FXType.ModifierFX), stackType);
					if (continuousFXSprites && _.isNumber(continuousFXFadeDuration) && continuousFXFadeDuration > 0.0) {
						for (var i = 0, il = continuousFXSprites.length; i < il; i++) {
							var fxSprite = continuousFXSprites[i];
							var opacity = fxSprite.getOpacity();
							fxSprite.setOpacity(0.0);
							fxSprite.fadeTo(continuousFXFadeDuration, opacity);
						}
					}
				}

				// show continuous fx for artifacts
				if (modifier.getIsFromArtifact()) {
					var artifactStackType = modifier.getArtifactStackType();

					if (!this.getChildByTag(artifactStackType)) {
						var continuousFXSprites = this.showContinuousFX(DATA.dataForIdentifiersWithFilter(modifier.getFXResource(), SDK.FXType.ArtifactFX), artifactStackType);
						if (continuousFXSprites && _.isNumber(continuousFXFadeDuration) && continuousFXFadeDuration > 0.0) {
							for (var i = 0, il = continuousFXSprites.length; i < il; i++) {
								var fxSprite = continuousFXSprites[i];
								var opacity = fxSprite.getOpacity();
								fxSprite.setOpacity(0.0);
								fxSprite.fadeTo(continuousFXFadeDuration, opacity);
							}
						}
					}
				}

			}.bind(this));
		}

		return showDuration;
	},

	/**
	 * Shows the one time fx of a modifier when triggered.
	 * @param {SDK.Modifier} modifier
	 * @param {SDK.Action} action
	 * @returns {Number} show duration
	 */
	showTriggeredModifier: function (modifier, action) {
		var showDuration = 0.0;

		if (modifier != null) {
			// nothing yet
		}

		return showDuration;
	},

	/**
	 * Shows a modifier being deactivated.
	 * @param {SDK.Modifier} modifier
	 * @param {SDK.Action} action
	 * @returns {Number} show duration
	 */
	showDeactivatedModifier: function (modifier, action) {
		var showDuration = 0.0;

		if (modifier != null) {
			var notShowingForRemoval = action == null || action.getMatchingAncestorAction(SDK.RemoveAction, null, this.getSdkCard()) == null;

			// show changes as long as not for removal
			if (notShowingForRemoval && this.canShowModifier(modifier, action)) {
				showDuration += this.showModifierChanges(modifier, action, true);
			}

			// wait for resources to load
			Promise.all([
				this.loadModifierResources(modifier),
				this.whenResourcesReady(this.getCardResourceRequestId())
			]).spread(function (modifierIndex, cardResourceRequestId) {
				// ensure that resources are valid
				// no need to check modifier resources because we're just removing
				if (!this.getAreResourcesValid(cardResourceRequestId)) return;

				// remove modifier cardFXResource from sdkCard
				var cardFXResource = modifier.getCardFXResource();
				if (cardFXResource) {
					this.sdkCard.removeFXResource(cardFXResource);
				}

				// remove continuous fx from modifier
				var stackType = modifier.getStackType();
				if (this.getSdkCard().getNumActiveModifiersOfStackType(stackType) === 0) {
					this.removeContinuousFX(modifier.getStackType(), CONFIG.FADE_MEDIUM_DURATION);
				}

				// remove continuous fx from artifact
				if (modifier.getIsFromArtifact()) {
					var artifactStackType = modifier.getArtifactStackType();
					if (this.getSdkCard().getNumActiveModifiersOfArtifactStackType(artifactStackType) === 0) {
						this.removeContinuousFX(artifactStackType, CONFIG.FADE_MEDIUM_DURATION);
					}
				}

				// only update animation resources if we can still change state and this is not a result of a removal action
				// otherwise, this entity is in the process of removing itself and will clean up afterwards
				if (notShowingForRemoval && this.canShowModifier(modifier, action)) {
					// update resources
					if (modifier.getAnimResource() != null) {
						this.updateAnimResource();
					}
					if (modifier.getSoundResource() != null) {
						this.updateSoundResource();
					}
				}

			}.bind(this));
		}

		return showDuration;
	},

	/**
	 * Shows the stat changes, one time fx, and removal of continuous fx of a modifier.
	 * @param {SDK.Modifier} modifier
	 * @param {SDK.Action} action
	 * @returns {Number} show duration
	 */
	showRemovedModifier: function(modifier, action) {
		var showDuration = 0.0;

		if (modifier != null) {
			var modifierLoadId = this.getModifierLoadId(modifier);
			var modifierLoadData = this._modifierLoadDataByLoadId[modifierLoadId];
			if (modifierLoadData == null || !modifierLoadData.valid || !modifierLoadData.promise.isFulfilled()) {
				// invalidate modifier load immediately if removing before load completes
				this.invalidateAndUnloadModifierResources(modifierLoadId);
			} else {
				// wait for resources to load
				Promise.all([
					this.loadModifierResources(modifier),
					this.whenResourcesReady(this.getCardResourceRequestId())
				]).spread(function (modifierLoadId, cardResourceRequestId) {
					// ensure that modifier load and resources are valid
					if (!this.getAreModifierResourcesValid(modifierLoadId) || !this.getAreResourcesValid(cardResourceRequestId)) return;

					// show one time removed fx for modifier
					this.showFX(DATA.dataForIdentifiersWithFilter(modifier.getFXResource(), SDK.FXType.ModifierRemovedFX));

					// only invalidate and unload resources if we can still change state and this is not a result of a removal action
					// otherwise, this entity is in the process of removing itself and will clean up afterwards
					if (this.canShowModifier(modifier, action) && (action == null || action.getMatchingAncestorAction(SDK.RemoveAction, null, this.getSdkCard()) == null)) {
						// unload modifier resources
						this.invalidateAndUnloadModifierResources(modifierLoadId);
					}
				}.bind(this));
			}
		}

		return showDuration;
	},

	showModifierChanges: function (modifier, action, forRemove) {
		var showDuration = 0.0;

		if (modifier != null) {
			// show attribute changes
			if (!modifier.getIsInherent() && modifier.attributeBuffs) {
				// only show modifier attribute buffs if the modifier is not being removed due to entity removal from board
				var validChangeToShow = action == null;
				if (!validChangeToShow) {
					var ancestorRemoveAction = action.getMatchingResolveAncestorAction(SDK.RemoveAction, null, this.sdkCard);
					validChangeToShow = (!(action instanceof SDK.RemoveAction) || action.getTarget() !== this.sdkCard) && !ancestorRemoveAction;
				}
				if (validChangeToShow) {
					var sdkCard = this.sdkCard;
					var attributeBuffs = modifier.attributeBuffs;
					var canShowChange = function (buffKey) {
						var buffValue = attributeBuffs[buffKey];
						var validChange = buffValue != null;
						if (validChange) {
							// check if this modifier sets stat to a fixed value
							// and if not, check that another existing modifier isn't fixed
							// stat value must not be overridden to show changes
							if (!modifier.getIsAttributeFixed(buffKey)) {
								var modifiers = sdkCard.getActiveAttributeModifiers(buffKey);
								for (var j = 0, jl = modifiers.length; j < jl; j++) {
									if (modifiers[j].getIsAttributeFixed(buffKey)) {
										validChange = false;
										break;
									}
								}
							}
						}
						return validChange;
					};

					// show buff values for atk and hp
					var atkValue;
					if (canShowChange("atk")) {
						atkValue = parseInt(attributeBuffs["atk"]);
						// add +/- when buff is not absolute
						if (!modifier.getRebasesAttribute("atk") && !modifier.getBuffsAttributeAbsolutely("atk")) {
							if (forRemove) {
								// when removing, reverse +/-
								atkValue = (atkValue > 0 ? "-" : "+") + Math.abs(atkValue);
							} else if (atkValue > 0) {
								atkValue = "+" + atkValue;
							}
						}
					}

					var hpValue;
					if (canShowChange("maxHP")) {
						hpValue = parseInt(attributeBuffs["maxHP"]);
						// add +/- when buff is not absolute
						if (!modifier.getRebasesAttribute("maxHP") && !modifier.getBuffsAttributeAbsolutely("maxHP")) {
							if (forRemove) {
								// when removing, reverse +/-
								hpValue = (hpValue > 0 ? "-" : "+") + Math.abs(hpValue);
							} else if (hpValue > 0) {
								hpValue = "+" + hpValue;
							}
						}
					}

					// show changes
					showDuration += this.showStatChanges(atkValue, hpValue, StatsChangeNode.HP_CHANGE_TYPE_MODIFIER);
				}
			}
		}

		return showDuration;
	},

	showStatChanges: function (atkValue, hpValue, hpChangeType) {
		// override in subclass to show changes in stats and return a show duration
		return 0.0;
	},

	/* endregion MODIFIERS */

	/* region INSTRUCTION */

	getOrCreateInstructionNode: function () {
		// node that displays instructions
		if (this._instructionNode == null) {
			this._instructionNode = InstructionNode.create();
			this._instructionNode.setVisible(false);
		}
		return this._instructionNode;
	},

	getInstructionNode: function () {
		return this._instructionNode;
	}

	/* endregion INSTRUCTION */

});

SdkNode.create = function(sdkCard, node) {
	return node || new SdkNode(sdkCard);
};


module.exports = SdkNode;
