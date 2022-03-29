//pragma PKGS: unlock_faction
var SDK = require('app/sdk');
var Promise = require('bluebird');
var CONFIG = require('app/common/config');
var EVENTS = require('app/common/event_types');
var UtilsEngine = require("./../../../common/utils/utils_engine");
var RSX = require("app/data/resources");
var PKGS = require("app/data/packages");
var audio_engine = require("./../../../audio/audio_engine");
var GameDataManager = require("./../../../ui/managers/game_data_manager");
var Shake = require("./../../actions/Shake");
var TweenTypes = require("./../../actions/TweenTypes");
var RewardLayer = require('./RewardLayer');
var BaseSprite = require('./../../nodes/BaseSprite');
var GlowSprite = require('./../../nodes/GlowSprite');
var CardNode = require('./../../nodes/cards/CardNode');
var ZodiacNode = require('./../../nodes/draw/Zodiac');
var BaseParticleSystem = require('./../../nodes/BaseParticleSystem');
var FXFireRingSprite = require('./../../nodes/fx/FXFireRingSprite');
var FXDissolveWithDiscFromCenterSprite = require('./../../nodes/fx/FXDissolveWithDiscFromCenterSprite');
var i18next = require('i18next');

/****************************************************************************
 UnlockFactionLayer
 ****************************************************************************/

var UnlockFactionLayer = RewardLayer.extend({

	_animationResolve: null,
	_cardNodes: null,
	cardRevealRadiusX: 520,
	cardRevealRadiusY: 300,
	continueNodeOffsetFromBottom: cc.p(0, 100),
	_crestNode: null,
	_factionId: null,
	_factionNameLabel: null,
	factionNameOffsetY: -200.0,
	_generalSprite: null,
	_mouseOverCard: null,
	_unlockedLabel: null,
	unlockLabelOffsetY: -150.0,
	zOrderCrest: 10,
	zOrderGeneral: 20,
	zOrderLabel: 30,
	zOrderCard: 40,
	zOrderCardHover: 50,

	ctor: function (factionId) {
		if (factionId == null) {
			throw new Error("UnlockFactionLayer -> must be initialized with faction id!")
		}

		this._cardNodes = [];
		this._factionId = factionId;

		this._super();
	},

	getRequiredResources: function () {
		return RewardLayer.prototype.getRequiredResources.call(this).concat(
			PKGS.getPkgForIdentifier("unlock_faction"),
			PKGS.getPkgForIdentifier(PKGS.getFactionInspectPkgIdentifier(this._factionId))
		);
	},

	showBackground: function () {
		return this.showFlatBackground();
	},

	showContinueNode: function () {
		return this.showPressToContinueNode()
			.then(function () {
				this.continueNode.setEnabled(false);
				this.continueNode.setVisible(false);
			}.bind(this));
	},

	onEnter: function () {
		this._super();

		// don't allow continue
		this.setIsContinueOnPressAnywhere(false);
		this.setIsInteractionEnabled(false);
	},

	onExit: function () {
		this._super();

		// reset gradient color mapping
		this.getFX().clearGradientColorMap(this._requestId, CONFIG.ANIMATE_MEDIUM_DURATION);
	},

	onResize: function () {
		this._super();

		if (this._crestNode != null) {
			this._crestNode.setScale(UtilsEngine.getWindowHeightRelativeNodeScale(this._crestNode) * 1.1);
		}

		if (this._generalSprite != null) {
			this._generalSprite.setScale(UtilsEngine.getWindowHeightRelativeNodeScale(this._generalSprite) * 1.9);
			this._generalSprite.setPosition(0.0, -UtilsEngine.getGSIWinHeight() * 0.2);
		}
	},

	/* region EVENTS */

	onPointerMove: function(event){
		this._super(event);

		if (event && event.isStopped) {
			return;
		}

		var location = event && event.getLocation();
		var mouseOverCard = null;
		if (location && this._cardNodes.length > 0) {
			// find card under mouse
			if (this._mouseOverCard && UtilsEngine.getNodeUnderMouse(this._mouseOverCard, location.x, location.y)) {
				mouseOverCard = this._mouseOverCard;
			} else {
				for (var i = 0; i < this._cardNodes.length; i++) {
					var cardNode = this._cardNodes[i];
					if (UtilsEngine.getNodeUnderMouse(cardNode, location.x, location.y)) {
						mouseOverCard = cardNode;
						break;
					}
				}
			}

			var isDifferentCard = this._mouseOverCard != mouseOverCard;

			if (this._mouseOverCard && isDifferentCard) {
				// reset previous card
				this._mouseOverCard.stopShowingInspect();
				this._mouseOverCard.setLocalZOrder(this.zOrderCard);
			}

			this._mouseOverCard = mouseOverCard;

			if (this._mouseOverCard && isDifferentCard) {
				// play sound
				audio_engine.current().play_effect(RSX.sfx_ui_menu_hover.audio);

				// inspect new card
				var keywordsOnLeft = this._mouseOverCard.getPositionX() >= 0.0;
				this._mouseOverCard.showInspect(null, true, null, null, keywordsOnLeft, true);
				this._mouseOverCard.setLocalZOrder(this.zOrderCardHover);
			}
		}
	},

	/* endregion EVENTS */

	/* region REWARD */

	animateReward: function () {
		return this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

			// disable continue
			this.disablePressToContinueAndHitboxesAndCallback();

			// start animation
			return this._showCrest()
			.then(this._showGeneral.bind(this))
			.then(this._showCards.bind(this))
			.then(function(){
				// enable continue
				this.setIsInteractionEnabled(true);

				// show continue
				this.continueNode.setEnabled(true);
				this.continueNode.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
			}.bind(this));
		}.bind(this));
	},

	_showCrest: function () {
		return new Promise(function (resolve, reject) {
			// show crest
			this._crestNode = new BaseSprite();
			this._crestNode.setRequiredTextureResource(SDK.FactionFactory.getCrestResourceForFactionId(this._factionId));
			this._crestNode.setVisible(false);
			this._crestNode.setPosition(0.0, 0.0);
			this.addChild(this._crestNode, this.zOrderCrest);

			this._crestNode.whenRequiredResourcesReady().then(function (requestId) {
				if (!this._crestNode.getAreResourcesValid(requestId)) return; // resources have been invalidated
				this._crestNode.setVisible(true);

				var crestScale = UtilsEngine.getWindowHeightRelativeNodeScale(this._crestNode) * 1.1;
				var crestContentSize = this._crestNode.getContentSize();
				this._crestNode.setScale(crestScale);

				// fire ring
				var fireRingSprite = FXFireRingSprite.create();
				fireRingSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
				fireRingSprite.setAnchorPoint(0.5, 0.5);
				fireRingSprite.setPosition(0.0, 0.0);
				var fireRingContentSize = fireRingSprite.getContentSize();
				var fireRingScale = Math.max(
						(crestContentSize.width * crestScale) / fireRingContentSize.width,
						(crestContentSize.height * crestScale) / fireRingContentSize.height
					) * 2.0;
				fireRingSprite.setScale(fireRingScale);
				fireRingSprite.setVisible(false);
				this.addChild(fireRingSprite, this.zOrderCrest - 1);

				// explosion
				var explosionParticles = new BaseParticleSystem(RSX.faction_explosion.plist);
				explosionParticles.setAnchorPoint(0.5, 0.5);
				explosionParticles.setPosition(0.0, 0.0);
				explosionParticles.setScale(fireRingScale * 0.1);
				explosionParticles.setAutoRemoveOnFinish(false);
				explosionParticles.stopSystem();
				this.addChild(explosionParticles, this.zOrderCrest - 1);

				// play explode audio
				audio_engine.current().play_effect(RSX.sfx_ui_explosion.audio, false);

				// animate crest in
				this._crestNode.setOpacity(0);
				this._crestNode.setScale(crestScale * 2.0);
				this._crestNode.runAction(cc.sequence(
					// pick up
					cc.spawn(
						cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION).easing(cc.easeOut(3.0)),
						cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, crestScale * 2.5).easing(cc.easeOut(3.0))
					),
					// slam down
					cc.spawn(
						cc.sequence(
							cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, crestScale).easing(cc.easeIn(3.0)),
							cc.callFunc(resolve)
						),
						cc.sequence(
							cc.delayTime(CONFIG.ANIMATE_FAST_DURATION * 0.75),
							Shake.create(CONFIG.ANIMATE_FAST_DURATION * 2.0, 5.0)
						),
						cc.sequence(
							cc.delayTime(CONFIG.ANIMATE_FAST_DURATION * 0.6),
							cc.spawn(
								cc.callFunc(function () {
									// explosion
									explosionParticles.setAutoRemoveOnFinish(true);
									explosionParticles.resumeSystem();
								}.bind(this)),
								cc.targetedAction(fireRingSprite, cc.sequence(
									cc.show(),
									cc.spawn(
										cc.actionTween(1.0, "phase", 1.0, 0.0).easing(cc.easeExponentialOut()),
										cc.sequence(
											cc.delayTime(1.0 - CONFIG.FADE_MEDIUM_DURATION),
											cc.fadeOut(CONFIG.FADE_MEDIUM_DURATION)
										)
									),
									cc.callFunc(function(){
										fireRingSprite.destroy();
									}.bind(this))
								))
							)
						)
					)
				));
			}.bind(this));
		}.bind(this));
	},

	_showGeneral: function () {
		return new Promise(function (resolve, reject) {
			// get faction data
			var factionData = SDK.FactionFactory.factionForIdentifier(this._factionId);
			var factionColorWhite = factionData.gradientColorMapWhite;
			var factionColorBlack = factionData.gradientColorMapBlack;

			// gradient map to faction color
			this.getFX().showGradientColorMap(this._requestId, CONFIG.ANIMATE_FAST_DURATION, factionColorWhite, factionColorBlack);

			// create general
			var generalId = SDK.FactionFactory.generalIdForFactionByOrder(this._factionId, SDK.FactionFactory.GeneralOrder.Primary);
			var generalConceptResource = SDK.GameSession.getCardCaches().getCardById(generalId).getConceptResource();
			this._generalSprite = new BaseSprite();
			this._generalSprite.setRequiredTextureResource(generalConceptResource);
			this._generalSprite.setVisible(false);
			this.addChild(this._generalSprite, this.zOrderGeneral);

			// create labels
			this._unlockedLabel = new cc.LabelTTF(i18next.t("new_player_experience.faction_unlocked_title"), RSX.font_regular.name, 25, null, cc.TEXT_ALIGNMENT_CENTER);
			this._unlockedLabel.setFontFillColor({r: 255, g: 255, b: 255});
			this._unlockedLabel.setPosition(0.0, this.unlockLabelOffsetY - 20.0);
			this._unlockedLabel.setOpacity(0.0);
			this._unlockedLabel.setVisible(false);
			this.addChild(this._unlockedLabel, this.zOrderLabel);

			this._factionNameLabel = new cc.LabelTTF(factionData.name.toUpperCase(), RSX.font_regular.name, 60, null, cc.TEXT_ALIGNMENT_CENTER);
			this._factionNameLabel.setFontFillColor({r: 255, g: 255, b: 255});
			this._factionNameLabel.setPosition(0.0, this.factionNameOffsetY - 20.0);
			this._factionNameLabel.setOpacity(0.0);
			this._factionNameLabel.setVisible(false);
			this.addChild(this._factionNameLabel, this.zOrderLabel);

			this._generalSprite.whenRequiredResourcesReady().then(function (requestId) {
				if (!this._generalSprite.getAreResourcesValid(requestId)) return; // resources have been invalidated
				this._generalSprite.setVisible(true);

				this._generalSprite.setScale(UtilsEngine.getWindowHeightRelativeNodeScale(this._generalSprite) * 1.9);
				this._generalSprite.setPosition(-40.0, -UtilsEngine.getGSIWinHeight() * 0.2);
				this._generalSprite.setTint(new cc.Color(255, 255, 255, 255));

				// animate
				this.runAction(cc.sequence(
					// fade/tint general
					cc.targetedAction(this._generalSprite, cc.spawn(
						cc.show(),
						cc.moveBy(CONFIG.ANIMATE_FAST_DURATION, cc.p(40.0, 0.0)).easing(cc.easeOut(3.0)),
						cc.actionTween(CONFIG.ANIMATE_MEDIUM_DURATION, TweenTypes.TINT_FADE, 255.0, 0.0).easing(cc.easeIn(3.0))
					)),
					cc.spawn(
						// show vignette
						cc.callFunc(function () {
							this.showVignetteBackground(CONFIG.ANIMATE_MEDIUM_DURATION, this.zOrderGeneral)
						}.bind(this)),
						// darken crest
						cc.targetedAction(this._crestNode, cc.tintTo(CONFIG.ANIMATE_MEDIUM_DURATION, 127, 127, 127))
					),
					// show text
					cc.spawn(
						cc.callFunc(function () {
							// play reward audio
							audio_engine.current().play_effect(RSX.sfx_victory_reward.audio, false);
						}),
						cc.targetedAction(this._unlockedLabel, cc.spawn(
							cc.show(),
							cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION),
							cc.moveBy(CONFIG.ANIMATE_FAST_DURATION, cc.p(0.0, 20.0)).easing(cc.easeCubicActionOut())
						)),
						cc.targetedAction(this._factionNameLabel, cc.sequence(
							cc.delayTime(CONFIG.ANIMATE_FAST_DURATION * 0.5),
							cc.spawn(
								cc.show(),
								cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION),
								cc.moveBy(CONFIG.ANIMATE_FAST_DURATION, cc.p(0.0, 20.0)).easing(cc.easeCubicActionOut())
							)
						))
					),
					// done
					cc.callFunc(resolve)
				));
			}.bind(this));
		}.bind(this));
	},

	_showCards: function () {
		return new Promise(function (resolve, reject) {
			// get all fixed rarity, non unlockable cards from faction
			var cards = GameDataManager.getInstance().getFactionCardModels(this._factionId, {
				rarityId: SDK.Rarity.Fixed,
				isHiddenInCollection: false,
				isUnlockableBasic: false,
				isUnlockableWithAchievement: false,
				isPrismatic: false,
				isSkinned: false
			});

			// split into two even groups
			var splitIndex = Math.ceil(cards.length * 0.5);
			var cardsLeft = cards.slice(0, splitIndex);
			var cardsRight = cards.slice(splitIndex);
			var radiansPerCardLeft = (Math.PI * 0.3) / cardsLeft.length;
			var radiansPerCardRight = (Math.PI * 0.3) / cardsRight.length;

			// show cards
			var cardRevealPromises = [];
			for (var i = 0, il = cardsLeft.length; i < il; i++) {
				var card = cardsLeft[i];
				var angle = Math.PI * 0.85 - radiansPerCardLeft * i;
				var targetScreenPosition = cc.p(
					this.cardRevealRadiusX *  Math.cos(angle),
					this.cardRevealRadiusY *  Math.sin(angle) - this.cardRevealRadiusY * 0.5
				);
				var delay = 0.4 * i;
				cardRevealPromises.push(this._showCardMoveAndReveal(
					card.get("id"),
					cc.p(0, this.factionNameOffsetY), targetScreenPosition,
					delay, this.zOrderCard + (il - i)
				));
			}
			for (var i = 0, il = cardsRight.length; i < il; i++) {
				var card = cardsRight[i];
				var angle = Math.PI * 0.35 - radiansPerCardRight * i;
				var targetScreenPosition = cc.p(
					this.cardRevealRadiusX *  Math.cos(angle),
					this.cardRevealRadiusY *  Math.sin(angle) - this.cardRevealRadiusY * 0.5
				);
				var delay = 0.4 * (i + cardsLeft.length);
				cardRevealPromises.push(this._showCardMoveAndReveal(
					card.get("id"),
					cc.p(0, this.factionNameOffsetY), targetScreenPosition,
					delay, this.zOrderCard + i
				));
			}

			return Promise.all(cardRevealPromises).then(resolve);
		}.bind(this));
	},

	/**
	 * Shows a card unlocking and returns a promise that resolves when the card has been revealed.
	 * @param {String|Number} cardId
	 * @param {cc.Point} sourceScreenPosition
	 * @param {cc.Point} targetScreenPosition
	 * @param {Number} [delay=0.0]
	 * @param {Number} [zOrder=this.zOrderCard]
	 * @returns {Promise}
	 */
	_showCardMoveAndReveal: function (cardId, sourceScreenPosition, targetScreenPosition, delay, zOrder) {
		if (delay == null) { delay = 0.0; }
		if (zOrder == null) { zOrder = this.zOrderCard; }

		return new Promise(function (resolve, reject) {
			var cardDisc = BaseSprite.create(RSX.booster_glowing_disc.img);
			cardDisc.setAnchorPoint(0.5,0.5);
			cardDisc.setPosition(sourceScreenPosition);
			this.addChild(cardDisc, zOrder);

			var particles = new BaseParticleSystem(RSX.booster_pack_center_particles.plist);
			particles.setAnchorPoint(0.5,0.5);
			particles.setPosition(sourceScreenPosition);
			this.addChild(particles, zOrder);

			var zodiac = new ZodiacNode({
				width:80,
				height:80,
				lineWidth:1,
				duration:1.0
			});
			var zodiacEnergyParticles = cc.ParticleSystem.create(RSX.zodiac_appear_001.plist);
			var zodiacFragmentParticles = cc.ParticleSystem.create(RSX.zodiac_appear_002.plist);

			var maxDuration = 2.0;
			var duration = maxDuration/2 + maxDuration/2*Math.random();
			var delayScaleDown = maxDuration - duration - 1.0;

			// move particles
			particles.runAction(cc.moveTo(duration, targetScreenPosition).easing(cc.easeExponentialOut()));

			// move disc
			cardDisc.runAction(cc.sequence(
				cc.moveTo(duration, targetScreenPosition).easing(cc.easeExponentialOut()),
				cc.delayTime(delayScaleDown),
				cc.callFunc(function(){
					particles.stopSystem();
				}),
				cc.scaleTo(0.5,0.25).easing(cc.easeExponentialOut()),
				cc.callFunc(function() {
					var discPosition = cardDisc.getPosition();

					// show zodiac
					zodiac.setAnchorPoint(0.5,0.5);
					zodiac.setPosition(
						discPosition.x - 40.0,
						discPosition.y - 40.0
					);
					this.addChild(zodiac, zOrder);

					zodiacEnergyParticles.setAnchorPoint(0.5,0.5);
					zodiacEnergyParticles.setPosition(discPosition);
					this.addChild(zodiacEnergyParticles, zOrder);

					zodiacFragmentParticles.setAnchorPoint(0.5,0.5);
					zodiacFragmentParticles.setPosition(discPosition);
					this.addChild(zodiacFragmentParticles, zOrder);
				}.bind(this)),
				cc.fadeOut(0.1),
				cc.delayTime(delay),
				cc.callFunc(function(){
					// destroy zodiac
					zodiac.destroy();

					// show card reveal and resolve
					this._showCardReveal(cardId, targetScreenPosition, zOrder).then(function () {
						resolve();
					});
				}.bind(this))
			));
		}.bind(this));
	},

	/**
	 * Shows a card revealing and returns a promise that resolves when the card has been revealed.
	 * @param {String|Number} cardId
	 * @param {cc.Point} targetScreenPosition
	 * @param {Number} [zOrder=this.zOrderCard]
	 * @returns {Promise}
	 */
	_showCardReveal: function(cardId, targetScreenPosition, zOrder) {
		if (zOrder == null) { zOrder = this.zOrderCard; }

		// create empty card
		var cardNode = CardNode.create();
		cardNode.setPosition(targetScreenPosition);
		this._cardNodes.push(cardNode);
		this.addChild(cardNode, zOrder);

		// play reveal sound
		audio_engine.current().play_effect(RSX.sfx_ui_card_reveal.audio, false);

		// show card reveal, then show stack
		var sdkCard = SDK.CardFactory.cardForIdentifier(cardId, SDK.GameSession.getInstance());
		return cardNode.selectReveal(sdkCard)
			.then(function () {
				// show stack if not general
				if (!(sdkCard instanceof SDK.Entity) || !sdkCard.getIsGeneral()) {
					cardNode.showStack();
				}
			});
	}

	/* endregion REWARD */

});

UnlockFactionLayer.create = function(factionId, layer) {
	return RewardLayer.create(layer || new UnlockFactionLayer(factionId));
};


module.exports = UnlockFactionLayer;
