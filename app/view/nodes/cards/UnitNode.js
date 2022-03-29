//pragma PKGS: game

var RSX = require('app/data/resources');
var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var SDK = require('app/sdk');
var UtilsEngine = require('app/common/utils/utils_engine');
var audio_engine = require("./../../../audio/audio_engine");
var TweenTypes = require('./../../actions/TweenTypes');
var BaseSprite = require('./../BaseSprite');
var BaseParticleSystem = require('./../BaseParticleSystem');
var UnitSprite = require('./UnitSprite');
var FXSprite = require('./../fx/FXSprite');
var EntityNode = require('./EntityNode');

/****************************************************************************
 UnitNode
 var UnitNode = EntityNode
 UnitNode.create()
 ****************************************************************************/

var UnitNode = EntityNode.extend({

	// sprites
	shadowSprite: null,

	initEntitySprites: function (spriteOptions) {
		spriteOptions || (spriteOptions = {});
		var scale = spriteOptions.scale || CONFIG.SCALE;
		var shadowOffset = (spriteOptions.shadowOffset || UnitSprite.prototype.shadowOffset) * scale;

		// update center offset for shadow offset
		this.centerOffset.y += shadowOffset;

		this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
			if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

			var sdkCard = this.sdkCard;
			spriteOptions.spriteIdentifier = this.getAnimResource().breathing;

			// entity sprite
			this.entitySprite = UnitSprite.create(spriteOptions);
			if (scale != null) { this.entitySprite.setScale(scale); }

			// shadow sprite
			this.shadowSprite = BaseSprite.create(RSX.unit_shadow.img);
			this.shadowSprite.setOpacity(200);

			// set positions
			// set center offset based on sprite size
			var contentSize = this.entitySprite.getContentSize();
			var centerPositionForSprite = this.getCenterPosition();
			centerPositionForSprite.y += contentSize.height - shadowOffset * 2.0;
			this.entitySprite.setPosition(centerPositionForSprite);
			this.shadowSprite.setPosition(this.getGroundPosition());

			// add sprites to scene
			this.addChild(this.entitySprite);
			this.addChild(this.shadowSprite, -9999);
		}.bind(this));
	},

	cleanupStateChanges: function () {
		EntityNode.prototype.cleanupStateChanges.call(this);

		this.setAutoZOrderOffset(0.0);
	},

	getBaseStateAction: function () {
		var sdkCard = this.sdkCard;
		var animIdentifier;

		if (this.selected) {
			animIdentifier = this.getAnimationIdentifierFromAnimResource("idle");
		} else {
			animIdentifier = this.getAnimationIdentifierFromAnimResource("breathing");
		}

		var animAction = UtilsEngine.getAnimationAction(animIdentifier);
		var animSequence;
		if (animAction != null) {
			if (animAction.getDuration() > 0) {
				animSequence = cc.sequence(
					animAction,
					cc.callFunc(this.changeBaseState, this)
				).repeatForever();
			} else {
				animSequence = cc.sequence(
					animAction,
					cc.delayTime(1.0),
					cc.callFunc(this.changeBaseState, this)
				).repeatForever();
			}
		} else {
			animSequence = EntityNode.prototype.getBaseStateAction.call(this);
		}

		return animSequence;
	},

	showPlaceholderSprites: function () {
		// TODO: maybe show actual placeholder sprites
		this.entitySprite.setOpacity(0);
		this.shadowSprite.setOpacity(0);
	},

	showSpawnSprites: function () {
		var sdkCard = this.getSdkCard();
		// when an apply/spawn animation is present
		var animActionApply = this.getAnimationActionFromAnimResource("apply");
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

		this.shadowSprite.setOpacity(0);
		this.shadowSprite.fadeTo(CONFIG.FADE_MEDIUM_DURATION, 200);
	},

	onChangeAnimationResource: function () {
		EntityNode.prototype.onChangeAnimationResource.call(this);

		if(this.canChangeState()) {
			this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
				if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

				if (this.canChangeState()) {
					this.showNoState();

					var sequenceSteps = [];
					var animAction = this.getAnimationActionFromAnimResource("idle");
					if (animAction != null) {
						sequenceSteps.push(animAction);
					}
					sequenceSteps.push(cc.callFunc(this.showNextState, this));
					this._stateActions.push(this.entitySprite.runAction(cc.sequence(sequenceSteps)));
				}
			}.bind(this));
		}
	},
	/*
	showMove: function(action, sourceBoardPosition, targetBoardPosition) {
		var showDuration = 0.0;

		if(this.canChangeState()) {
			this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
				if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

				if (this.canChangeState()) {
					this.showNoState();

					var sdkCard = this.sdkCard;
					var animMoveAction = UtilsEngine.getAnimationAction(this.getAnimResource().walk);
					var sequenceSteps = [];
					// get duration, which calculates tile count in the process
					var moveTileCount = this.getMoveTileCount(action);
					var moveDuration = this.getMoveDuration(moveTileCount);
					var actualDuration = 0.0;
					var animMoveDuration = animMoveAction.getDuration();
					var animMoveCorrection = animMoveDuration * CONFIG.ENTITY_MOVE_CORRECTION;
					var sourceBoardPosition = action.getSourcePosition();
					var targetBoardPosition = action.getTargetPosition();
					var targetScreenPosition = UtilsEngine.transformBoardToTileMap(targetBoardPosition);

					// set final move position
					this.setMovePosition(targetScreenPosition);

					// start moving
					this.setIsMoving(true);

					// set the auto z order offset temporarily
					// (used by the base sprite's auto z order method)
					this.setAutoZOrderOffset(0.1);

					// flip, position, and set as moving
					if (sourceBoardPosition.x !== targetBoardPosition.x) {
						this.entitySprite.setFlippedX(sourceBoardPosition.x > targetBoardPosition.x);
					}

					// don't show readiness while moving
					this.removeReadinessVisualTag();

					// walking sound
					var sfx_walk = this.getSoundResource() && this.getSoundResource().walk;
					audio_engine.current().play_effect(sfx_walk, false);

					// sequence movements
					for (var i = 0; i < moveTileCount + 1; i++) {
						sequenceSteps.push(animMoveAction.clone());
						actualDuration += animMoveDuration;
					}
					actualDuration -= animMoveCorrection;

					// stop moving and show next
					sequenceSteps.push(cc.callFunc(function () {
						this.setIsMoving(false);
						this.showNextState();
					}.bind(this)));

					var sequence = cc.sequence(sequenceSteps).speed(actualDuration / moveDuration);
					this._stateActions.push(this.entitySprite.runAction(sequence));
				}
			}.bind(this));
		}
	},
	*/
	showAttackState: function(action) {
		EntityNode.prototype.showAttackState.call(this, action);

		if(this.canChangeState()) {
			this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
				if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

				if (this.canChangeState()) {
					this.showNoState();

					var sdkCard = this.sdkCard;

					// don't show readiness while attacking
					this.removeReadinessVisualTag();

					// flip to face target
					if (action instanceof SDK.Action) {
						var targetBoardPosition = action.getTargetPosition();
						var cardPosition = sdkCard.getPosition();
						if (targetBoardPosition != null && cardPosition.x !== targetBoardPosition.x) {
							this.entitySprite.setFlippedX(cardPosition.x > targetBoardPosition.x);
						}
					}

					var sequenceSteps = [];
					var animAction = this.getAnimationActionFromAnimResource("attack");
					if (animAction != null) {
						sequenceSteps.push(animAction);
					}
					sequenceSteps.push(cc.callFunc(this.showNextState, this));
					this._stateActions.push(this.entitySprite.runAction(cc.sequence(sequenceSteps).speed(1.0 / CONFIG.ENTITY_ATTACK_DURATION_MODIFIER)));

					// sound
					var releaseDelay = (this.getAnimResource() && this.getAnimResource().attackReleaseDelay) || 0.0;
					this._stateActions.push(this.entitySprite.runAction(cc.sequence(
						cc.delayTime(releaseDelay * CONFIG.ENTITY_ATTACK_DURATION_MODIFIER),
						cc.callFunc(function () {
							this.playSoundAttackerRelease(sdkCard);
						}, this)
					)));
				}
			}.bind(this));
		}
	},

	showHealerState: function (action) {
		EntityNode.prototype.showHealerState.call(this, action);

		if(this.canChangeState()) {
			this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
				if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

				if (this.canChangeState()) {
					this.showNoState();

					var sdkCard = this.sdkCard;

					// flip to face target
					if (action instanceof SDK.Action) {
						var targetBoardPosition = action.getTargetPosition();
						var cardPosition = sdkCard.getPosition();
						if (targetBoardPosition != null && cardPosition.x !== targetBoardPosition.x) {
							this.entitySprite.setFlippedX(cardPosition.x > targetBoardPosition.x);
						}
					}

					// sound
					audio_engine.current().play_effect(RSX.sfx_spell_tranquility.audio, false);

					// animation
					var sequenceSteps = [];
					var animAction = this.getAnimationActionFromAnimResource("attack");
					if (animAction != null) {
						sequenceSteps.push(animAction);
					}
					sequenceSteps.push(cc.callFunc(this.showNextState, this));
					this._stateActions.push(this.entitySprite.runAction(cc.sequence(sequenceSteps).speed(1.0 / CONFIG.ENTITY_ATTACK_DURATION_MODIFIER)));
				}
			}.bind(this));
		}
	},

	showAttackedState: function(action) {
		EntityNode.prototype.showAttackedState.call(this, action);

		if(this.canChangeState()) {
			this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
				if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

				if (this.canChangeState()) {
					this.showNoState();

					var source = action.getSource();
					var sdkCard = this.sdkCard;

					// sounds
					this.playSoundAttackerDamage(source);
					this.playSoundReceiveDamage(sdkCard);

					// animation
					var sequenceSteps = [];
					var animAction = this.getAnimationActionFromAnimResource("damage");
					if (animAction != null) {
						sequenceSteps.push(animAction);
					}
					sequenceSteps.push(cc.callFunc(this.showNextState, this));
					this._stateActions.push(this.entitySprite.runAction(cc.sequence(sequenceSteps)));
				}
			}.bind(this));
		}
	},

	showDeathState: function() {
		var canChangeState = this.canChangeState();
		if(canChangeState) {
			this.setStateLocked(true);

			var whenCardResourcesReady = this.whenResourcesReady(this.getCardResourceRequestId());
			if (!whenCardResourcesReady.isFulfilled()) {
				// if resources are not ready yet, destroy immediately
				this.destroy();
			} else {
				whenCardResourcesReady.then(function (cardResourceRequestId) {
					if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

					if (canChangeState) {
						this.showNoState();

						this.playSoundDeath(this.sdkCard);

						// entity is dead, show current stats (usually 0)
						// and fade out support nodes
						var statsNode = this.getStatsNode();
						if (statsNode != null) {
							statsNode.showStatsAsOfAction(null, null, true);
						}
						this.terminateSupportNodes(CONFIG.FADE_MEDIUM_DURATION);

						// death animation + dissolve
						var sequenceSteps = [];
						var animAction = this.getAnimationActionFromAnimResource("death");
						if (animAction != null) {
							sequenceSteps.push(animAction);
						}
						var dissolveDuration = CONFIG.FADE_SLOW_DURATION;
						sequenceSteps = sequenceSteps.concat(
							cc.callFunc(function () {
								// start dissolving
								this.addDissolveVisualTag();

								// destroy all children that are not entity sprite
								// some children are also added/tracked externally (ex: some fx sprites)
								var children = _.uniq([].concat(this.getChildren(), this.getFXSprites()));
								for (var i = 0, il = children.length; i < il; i++) {
									var child = children[i];
									if (child !== this.entitySprite) {
										child.destroy(CONFIG.FADE_MEDIUM_DURATION);
									}
								}

								// emit particles
								var particleSystem = BaseParticleSystem.create({
									plistFile: RSX.ptcl_unit_dissolve.plist,
									affectedByWind: true,
									duration: 0.1
								});
								var centerPosition = this.getCenterPositionForExternal();
								var groundPosition = this.getGroundPositionForExternal();
								particleSystem.setPosition(cc.p((centerPosition.x + groundPosition.x) * 0.5, (centerPosition.y + groundPosition.y) * 0.5));
								this.getScene().getGameLayer().addNode(particleSystem);
							}, this),
							cc.actionTween(dissolveDuration, TweenTypes.DISSOLVE, 0.0, 1.0),
							cc.callFunc(function () {
								// remove self
								this.destroy();
							}, this)
						);
						this._stateActions.push(this.entitySprite.runAction(cc.sequence(sequenceSteps)));
					}
				}.bind(this));
			}
		}
	},

	showRefreshExhaustionState: function (action) {
		EntityNode.prototype.showRefreshExhaustionState.call(this, action);

		if(this.canChangeState()) {
			this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
				if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

				if (this.canChangeState()) {
					var sdkCard = this.sdkCard;
					var entitySprite = this.entitySprite;
					var animAction = this.getAnimationActionFromAnimResource("walk") || this.getAnimationActionFromAnimResource("run") || this.getAnimationActionFromAnimResource("move");
					if (animAction != null) {
						var offset = CONFIG.TILESIZE;// * 0.5;
						var delay = 0.0;
						var duration = animAction.getDuration() * (offset / CONFIG.TILESIZE);
						var numClones = 5;
						var deltaDuration = duration / numClones;

						// reverse offset for player 2
						if (sdkCard.isOwnedByPlayer2()) {
							offset *= -1;
						}

						// get source and target
						var position = entitySprite.getPosition();
						var sourceScreenPosition = cc.p(position.x + offset, position.y);

						// copy self
						this.cloneSprites = [];
						for (var i = 0; i < numClones; i++) {
							this._showClone(entitySprite, sourceScreenPosition, position, animAction.clone(), true, 255, true, delay, duration);
							delay += deltaDuration;
						}

						// add enough reaction animations to cover duration
						if (!this.getHasActiveState()) {
							this.showNoState();

							var animReactionAction = this.getAnimationActionFromAnimResource("idle");
							if (animReactionAction != null) {
								var sequenceSteps = [];
								var numReactions = Math.ceil((duration * 2) / animReactionAction.getDuration()) || 1;
								for (i = 0; i < numReactions; i++) {
									sequenceSteps.push(animReactionAction.clone());
								}
								sequenceSteps.push(cc.callFunc(this.showNextState, this));
								this._stateActions.push(entitySprite.runAction(cc.sequence(sequenceSteps)));
							}
						}
					}
				}
			}.bind(this));
		}
	},

	showSwapAllegianceState: function () {
		EntityNode.prototype.showSwapAllegianceState.call(this);

		if(this.canChangeState()) {
			this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
				if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

				if (this.canChangeState()) {
					this.showNoState();

					var sequenceSteps = [];
					var animAction = this.getAnimationActionFromAnimResource("idle");
					if (animAction != null) {
						sequenceSteps.push(animAction);
					}
					sequenceSteps.push(cc.callFunc(this.showNextState, this));
					this._stateActions.push(this.entitySprite.runAction(cc.sequence(sequenceSteps)));
				}
			}.bind(this));
		}
	},

	_showClone: function (sourceSprite, sourceScreenPosition, targetScreenPosition, animAction, reverseAnim, opacity, additive, delay, duration) {
		delay || (delay = 0.0);
		duration || (duration = 0.5);

		var gl = cc._renderContext;
		var cloneSprite = BaseSprite.create(sourceSprite.spriteIdentifier);
		cloneSprite.setAntiAlias(false);
		cloneSprite.setScale(sourceSprite.getScale());
		cloneSprite.setFlippedX(sourceSprite.isFlippedX());
		cloneSprite.setAnchorPoint(0.5, 0.5);

		this.cloneSprites.push(cloneSprite);
		this.addChild(cloneSprite, 1);

		// clone move
		cloneSprite.setPosition(sourceScreenPosition);
		cloneSprite.runAction(cc.sequence(
			cc.delayTime(delay),
			cc.MoveTo.create(duration, targetScreenPosition)
		));

		// clone fade in
		opacity || (opacity = 127);
		cloneSprite.setOpacity(0);
		var fadeSequence = cc.sequence(
			cc.delayTime(delay),
			cc.FadeTo.create(duration * 0.25, opacity),
			cc.delayTime(duration * 0.5),
			cc.FadeTo.create(duration * 0.25, 0)
		);
		fadeSequence.setTag(CONFIG.FADE_TAG);
		cloneSprite.runAction(fadeSequence);

		// clone animation
		if(reverseAnim) {
			animAction = animAction.reverse();
		}

		cloneSprite.runAction(cc.sequence(
			cc.delayTime(delay),
			animAction
		));

		if(additive) {
			// things don't play nice with blend fn so we set it last
			cloneSprite.runAction(cc.sequence(
				cc.delayTime(delay),
				cc.callFunc(function () {
					cloneSprite.setBlendFunc(gl.SRC_ALPHA, gl.ONE);
				})
			));
		}
	}

});

UnitNode.create = function(sdkCard, node) {
	return EntityNode.create(sdkCard, node || new UnitNode(sdkCard));
};

module.exports = UnitNode;
