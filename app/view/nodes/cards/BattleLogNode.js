//pragma PKGS: game
var _ = require("underscore");
var CONFIG = require('app/common/config');
var SDK = require('app/sdk');
var RSX = require('app/data/resources');
var PKGS = require('app/data/packages');
var UtilsEngine = require('app/common/utils/utils_engine');
var SdkNode = require('./SdkNode');
var BaseSprite = require('./../BaseSprite');
var Promise = require("bluebird");

/***************************************************************************
 BattleLogNode
 var BattleLogNode = SdkNode
 BattleLogNode.create()
 - node used to display battle log entries
 ***************************************************************************/

var BattleLogNode = SdkNode.extend({

	step: null,
	cardSprite: null,
	bgSprite: null,
	bgSpriteFriendly: null,
	bgSpriteEnemy: null,
	highlighted: false,

	/* region INITIALIZATION */

	ctor: function (step) {
		// initialize properties that may be required in init
		this.bgSpriteFriendly = new BaseSprite(RSX.battlelog_entry_frame_friendly.img);
		this.bgSpriteFriendly.setVisible(false);
		this.bgSpriteEnemy = new BaseSprite(RSX.battlelog_entry_frame_enemy.img);
		this.bgSpriteEnemy.setVisible(false);
		var contentSize = cc.size(CONFIG.BATTLELOG_ENTRY_SIZE, CONFIG.BATTLELOG_ENTRY_SIZE);

		// do super ctor
		this._super();

		// set anchor
		this.setAnchorPoint(0.5, 0.5);

		// set content size
		// this must be done after the cocos/super ctor
		this.setContentSize(contentSize);
		var centerPosition = this.getCenterPosition();

		// add bg
		this.bgSpriteFriendly.setPosition(centerPosition);
		this.bgSpriteEnemy.setPosition(centerPosition);
		this.addChild(this.bgSpriteFriendly);
		this.addChild(this.bgSpriteEnemy);

		// set step
		this.setStep(step);
	},

	/* endregion INITIALIZATION */

	/* region GETTERS / SETTERS */

	/**
	 * Battle log nodes should always use card inspect resource packages.
	 * @see SdkNode.getCardResourcePackageId
	 */
	getCardResourcePackageId: function (sdkCard) {
		return PKGS.getCardInspectPkgIdentifier(sdkCard.getId());
	},

	setSdkCard: function (sdkCard, cardFadeDuration) {
		if (this.step != null && this.sdkCard !== sdkCard) {
			// destroy previous card
			if (this.sdkCard != null) {
				if (this.cardSprite != null) {
					this.cardSprite.destroy(cardFadeDuration);
					this.cardSprite = null;
				}
			}

			// update card after resetting last and before showing new
			this._super(sdkCard);

			// setup new card
			if (this.sdkCard != null) {
				var contentSize = this.getContentSize();

				// set options
				var cardOptions = _.extend({}, sdkCard.getCardOptions());
				cardOptions.spriteIdentifier = sdkCard.getBaseAnimResource() && sdkCard.getBaseAnimResource().idle;
				cardOptions.antiAlias = false;

				this.whenResourcesReady(this.getCardResourceRequestId()).then(function (cardResourceRequestId) {
					if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

					// create sprite
					this.cardSprite = BaseSprite.create(cardOptions);

					// flip sprite for player 2
					if (sdkCard instanceof SDK.Entity && sdkCard.isOwnedByPlayer2()) {
						this.cardSprite.setFlippedX(true);
					}

					// set base position of sprite
					var cardSpritePosition;
					if (sdkCard instanceof SDK.Unit) {
						this.cardSprite.setAnchorPoint(cc.p(0.5, 0));
						cardSpritePosition = cc.p(contentSize.width * 0.5, -contentSize.height * 0.5 + 35);
					} else {
						this.cardSprite.setAnchorPoint(0.5, 0.5);
						cardSpritePosition = cc.p(contentSize.width * 0.5, contentSize.height * 0.5);
					}

					// offset sprite
					var offset = cardOptions.offset;
					if (offset != null) {
						cardSpritePosition.x += offset.x;
						cardSpritePosition.y += offset.y;
					}

					this.cardSprite.setPosition(cardSpritePosition);
					this.addChild(this.cardSprite);
				}.bind(this));
			}
		}
	},

	/**
	 * Sets the step to be shown by this battle log node.
	 * @param {SDK.Step} step
	 */
	setStep:function(step) {
		var lastStep = this.step;
		// update if different
		if (lastStep != step) {
			// reset and stop
			this.stopShowingDetails();
			this.setHighlighted(false);

			// set step
			this.step = step;

			// reset last
			if (lastStep != null) {
				if (this.cardSprite != null) {
					this.cardSprite.destroy();
					this.cardSprite = null;
				}
			}

			// update card always after resetting last and before showing new
			if (this.step == null) {
				this.setSdkCard(null);
			}
			else {
				var action = this.step.getAction();

				// set sdk card
				var sdkCard;
				if (action instanceof SDK.PlayCardFromHandAction || action instanceof SDK.PlaySignatureCardAction) {
					sdkCard = action.getCard();
				} else if (action instanceof SDK.MoveAction) {
					sdkCard = action.getSource();
				} else if (action instanceof SDK.AttackAction) {
					sdkCard = action.getSource();
				}
				this.setSdkCard(sdkCard);
			}

			// update sprites for owner
			this.updateSpritesForOwner();
		}
	},

	getStep:function() {
		return this.step;
	},

	getIsEmpty: function () {
		return this.step == null;
	},

	getAction:function() {
		if (this.step != null) {
			return this.step.getAction();
		}
	},

	/* endregion GETTERS / SETTERS */

	/* region LAYOUT */

	updateSpritesForOwner: function () {
		// get background based on player id
		var bgSprite;
		if (this.step != null) {
			var playerId = this.step.getPlayerId();
			if (playerId === SDK.GameSession.getInstance().getOpponentPlayerId()) {
				bgSprite = this.bgSpriteEnemy;
			} else {
				bgSprite = this.bgSpriteFriendly;
			}
		}

		if (this.bgSprite != bgSprite) {
			// reset previous
			if (this.bgSprite != null) {
				this.bgSprite.setVisible(false);
				this.bgSprite = null;
			}

			// store new
			this.bgSprite = bgSprite;

			// show new
			if (this.bgSprite != null) {
				this.bgSprite.setVisible(true);
			}
		}
	},

	/* endregion LAYOUT */

	/* region HIGHLIGHT */

	setHighlighted:function(val) {
		if (this.highlighted != val) {
			this.highlighted = val;
			if (this.highlighted) {
				this.showDetails();
			} else {
				this.stopShowingDetails();
			}
		}
	},

	getHighlighted:function() {
		return this.highlighted;
	},

	showDetails:function() {
		if (this.step != null) {
			var scene = this.getScene();
			var gameLayer = scene && scene.getGameLayer();
			if (gameLayer != null) {
				var action = this.step.getAction();

				// show by type
				if (action instanceof SDK.PlayCardFromHandAction || action instanceof SDK.PlaySignatureCardAction) {
					// show inspect
					var sdkCard = this.getSdkCard();
					if (sdkCard != null) {
						gameLayer.showInspectCard(sdkCard, this);
					}
					/*
					var cardsProcessing = [sdkCard];
					var cardsToProcess = [];
					var cards = [];
					while(cardsProcessing.length > 0) {
						var nextCard = cardsProcessing.shift();
						cards.push(nextCard);
						cardsToProcess = cardsToProcess.concat(nextCard.getSubCards());
						if (cardsProcessing.length === 0) {
							cardsProcessing = cardsToProcess;
							cardsToProcess = [];
						}
					}

					// show an instructional arrow for each affected position
					var affectedBoardPositions = [];
					for (var i = 0, il = cards.length; i < il; i++) {
						var card = cards[i];
						if (card instanceof SDK.Spell) {
							var applyEffectPositions = card.getApplyEffectPositions();
							affectedBoardPositions = affectedBoardPositions.concat(applyEffectPositions);
						} else if (card instanceof SDK.Artifact) {
							affectedBoardPositions.push(SDK.GameSession.getInstance().getGeneralForPlayerId(card.getOwnerId()).getPosition());
						} else {
							affectedBoardPositions.push(action.getTargetPosition());
						}
					}

					// convert board positions to screen positions
					var affectedScreenPositions = [];
					for (var i = 0, il = affectedBoardPositions.length; i < il; i++) {
						var affectedScreenPosition = UtilsEngine.transformBoardToTileMap(affectedBoardPositions[i]);
						affectedScreenPosition.y += 10.0;
						affectedScreenPositions.push(affectedScreenPosition);
					}

					this._instructionalArrows = [];
					if (affectedScreenPositions.length > 0) {
						// show an instructional arrow for each affected position
						for (var i = 0, il = affectedScreenPositions.length; i < il; i++) {
							var affectedScreenPosition = affectedScreenPositions[i];
							var instructionalArrowRemovalMethod = gameLayer.showPersistentInstructionalArrow(affectedScreenPosition, (il > 2 ? Math.random() * 0.15 : 0.0));
							this._instructionalArrows.push(instructionalArrowRemovalMethod);
						}
					}
					*/
				} else if (action instanceof SDK.MoveAction) {
					var tileBoardPath = action.getPath();
					gameLayer.getAltPlayer().showTilePath(tileBoardPath, true);
				} else if (action instanceof SDK.AttackAction) {
					var directScreenPath = [UtilsEngine.transformBoardToTileMap(action.getSourcePosition()), UtilsEngine.transformBoardToTileMap(action.getTargetPosition())];
					gameLayer.getAltPlayer().showDirectPath(directScreenPath, true);
					gameLayer.getAltPlayer().showTargetTile(UtilsEngine.transformTileMapToScreen(directScreenPath[directScreenPath.length - 1]), false, CONFIG.TARGET_ACTIVE_OPACITY, CONFIG.FADE_FAST_DURATION, CONFIG.AGGRO_OPPONENT_COLOR,  RSX.tile_attack.frame);
				}
			}
		}
	},

	stopShowingDetails:function() {
		var scene = this.getScene();
		var gameLayer = scene && scene.getGameLayer();
		if (gameLayer != null) {
			// remove paths and targets
			gameLayer.getAltPlayer().removePath();
			gameLayer.getAltPlayer().removeTargetTile();

			// remove arrows
			if (this._instructionalArrows != null && this._instructionalArrows.length > 0) {
				for (var i = 0, il = this._instructionalArrows.length; i < il; i++) {
					this._instructionalArrows[i].destroy(CONFIG.FADE_FAST_DURATION);
				}
				this._instructionalArrows = [];
			}

			// stop inspecting
			var sdkCard = this.getSdkCard();
			if (sdkCard != null) {
				gameLayer.stopShowingInspectCard(sdkCard);
			}
		}
	},

	/* endregion HIGHLIGHT */

	/* region ANIMATION */

	showIn: function (targetScreenPosition) {
		return new Promise(function (resolve, reject) {
			// stop any running animations
			this.stopAnimations();

			// show animation
			var sourceScreenPosition = cc.p(targetScreenPosition.x, targetScreenPosition.y + CONFIG.BATTLELOG_ENTRY_SIZE * 0.5);
			this.setPosition(sourceScreenPosition);
			this.setOpacity(0.0);
			var animationAction = cc.sequence(
				cc.spawn(
					cc.fadeIn(CONFIG.FADE_FAST_DURATION),
					cc.moveTo(CONFIG.MOVE_FAST_DURATION, targetScreenPosition)
				),
				cc.callFunc(function () {
					resolve();
				}.bind(this))
			);
			this.addAnimationAction(animationAction);
			this.runAction(animationAction);
		}.bind(this));
	},

	showOut: function (sourceScreenPosition) {
		return new Promise(function (resolve, reject) {
			// stop any running animations
			this.stopAnimations();

			// show animation
			var targetScreenPosition = cc.p(sourceScreenPosition.x, sourceScreenPosition.y - CONFIG.BATTLELOG_ENTRY_SIZE * 0.5);
			var animationAction = cc.sequence(
				cc.spawn(
					cc.fadeOut(CONFIG.FADE_FAST_DURATION),
					cc.moveTo(CONFIG.MOVE_FAST_DURATION, targetScreenPosition)
				),
				cc.callFunc(function () {
					this.setStep(null);
					resolve();
				}.bind(this))
			);
			this.addAnimationAction(animationAction);
			this.runAction(animationAction);
		}.bind(this));
	},

	showMoveToNext: function (targetScreenPosition) {
		return new Promise(function (resolve, reject) {
			// stop any running animations
			this.stopAnimations();

			// show animation
			var animationAction = cc.sequence(
				cc.moveTo(CONFIG.MOVE_FAST_DURATION, targetScreenPosition),
				cc.callFunc(function () {
					resolve();
				}.bind(this))
			);
			this.addAnimationAction(animationAction);
			this.runAction(animationAction);
		}.bind(this));
	}

	/* endregion ANIMATION */

});

BattleLogNode.create = function(step, node) {
	return SdkNode.create(null, node || new BattleLogNode(step));
};

module.exports = BattleLogNode;
