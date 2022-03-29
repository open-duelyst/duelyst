//pragma PKGS: card_back_reward
var SDK = require('app/sdk');
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var RSX = require("app/data/resources");
var PKGS = require("app/data/packages");
var UtilsEngine = require('app/common/utils/utils_engine');
var FigureEight = require('app/view/actions/FigureEight');
var TweenTypes = require('app/view/actions/TweenTypes');
var RewardNode = require('./RewardNode');
var BaseSprite = require('./../BaseSprite');
var BaseParticleSystem = require('./../BaseParticleSystem');
var GlowSprite = require('./../GlowSprite');
var Promise = require("bluebird");
var i18next = require("i18next")

/****************************************************************************
 CardBackRewardNode
 ****************************************************************************/

var CardBackRewardNode = RewardNode.extend({

	_cardBackId: null,

	ctor: function (cardBackId) {
		if (cardBackId == null) {
			throw new Error("Card Back reward node must be initialized with a card back id!")
		}
		this._cardBackId = cardBackId;

		this._super();
	},

	getCardBackId: function () {
		return this._cardBackId;
	},

	/* region RESOURCES */

	/**
	 * Returns a list of resource objects this node uses.
	 * @returns {Array}
	 */
	getRequiredResources: function () {
		var requiredResources = RewardNode.prototype.getRequiredResources.call(this);
		requiredResources = requiredResources.concat(PKGS.getPkgForIdentifier("card_back_reward"));
		if (this._cardBackId != null) {
			var cardBackPkgId = PKGS.getCardBackPkgIdentifier(this._cardBackId);
			requiredResources = requiredResources.concat(PKGS.getPkgForIdentifier(cardBackPkgId));
		}
		return requiredResources;
	},

	/* endregion RESOURCES */

	/* region ANIMATION */

	getRewardAnimationPromise: function (looping, showLabel) {
		return (looping ? this.showLoopingRewardFlare() : this.showRewardFlare())
		.then(function () {
			return new Promise(function (resolve) {
				// card back data
				var cardBackData = SDK.CosmeticsFactory.cosmeticForIdentifier(this._cardBackId);

				// card container node
				var cardContainerNode = new cc.Node();
				cardContainerNode.setAnchorPoint(0.5, 0.5);
				this.addChild(cardContainerNode, 1);

				// card back sprite
				var cardBackSprite = GlowSprite.create(cardBackData.img);
				cardContainerNode.addChild(cardBackSprite, 1);
				var cardBackgroundContentSize = cardBackSprite.getContentSize();

				// card back glow outline sprite
				var cardBackGlowOutlineSprite = BaseSprite.create(cardBackData.glowOutlineRSX.img);
				cardBackGlowOutlineSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
				cardContainerNode.addChild(cardBackGlowOutlineSprite, 2);

				// bg shadow
				var cardShadow = new BaseSprite(RSX.card_shadow_map.img);
				cardShadow.setOpacity(0.0);
				cardShadow.setVisible(false);
				cardContainerNode.addChild(cardShadow,-9999);

				if (showLabel) {
					// primary label
					var labelText = _.isString(showLabel) ? showLabel : i18next.t("cosmetics.cosmetic_type_card_back").toLocaleUpperCase();
					var label = new cc.LabelTTF(labelText, RSX.font_regular.name, 22, cc.size(200, 24), cc.TEXT_ALIGNMENT_CENTER);
					label.setPosition(0, -200);
					label.setOpacity(0.0);
					this.addChild(label, 3);

					// secondary label
					var rarityId = cardBackData.rarityId;
					if (rarityId != null) {
						var rarityData = SDK.RarityFactory.rarityForIdentifier(rarityId);
						var sublabel = new cc.LabelTTF(rarityData.name.toLocaleUpperCase(), RSX.font_regular.name, 16, cc.size(200, 24), cc.TEXT_ALIGNMENT_CENTER);
						sublabel.setFontFillColor(rarityData.color);
						sublabel.setPosition(0, -180);
						sublabel.setOpacity(0.0);
						this.addChild(sublabel, 3);
					}
				}

				// tint and highlight
				cardBackSprite.setLeveled(true);
				cardBackSprite.setLevelsInWhite(180);
				cardBackSprite.setLevelsInBlack(30);
				cardBackSprite.setHighlighted(true);
				cardBackSprite.setTint(new cc.Color(255, 255, 255, 255));
				cardBackSprite.setScale(0.0);
				cardBackSprite.setOpacity(255.0);
				cardBackSprite.setVisible(true);
				cardBackGlowOutlineSprite.setScale(0.0);
				cardBackGlowOutlineSprite.setOpacity(255.0);
				cardBackGlowOutlineSprite.setVisible(true);

				// show card back
				this.runAction(cc.sequence(
					cc.targetedAction(cardBackSprite, cc.sequence(
						cc.spawn(
							cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, 1.0).easing(cc.easeExponentialOut()),
							cc.actionTween(CONFIG.ANIMATE_MEDIUM_DURATION, TweenTypes.TINT_FADE, 255.0, 0.0).easing(cc.easeOut(2.0)),
							cc.targetedAction(cardBackGlowOutlineSprite, cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, 1.0).easing(cc.easeExponentialOut()))
						),
						cc.spawn(
							cc.callFunc(function () {
								var particles = new BaseParticleSystem(RSX.ptcl_card_appear.plist);
								particles.setPosVar(cc.p(cardBackgroundContentSize.width * 0.5, cardBackgroundContentSize.height * 0.5));
								particles.setAnchorPoint(0.5, 0.5);
								particles.setAutoRemoveOnFinish(true);
								this.addChild(particles, 1);

								cardBackSprite.fadeOutHighlight(CONFIG.ANIMATE_FAST_DURATION);
							}.bind(this)),
							cc.actionTween(CONFIG.ANIMATE_FAST_DURATION, "levelsInWhite", 180.0, 255.0),
							cc.actionTween(CONFIG.ANIMATE_FAST_DURATION, "levelsInBlack", 30.0, 0.0),
							cc.targetedAction(cardShadow, cc.spawn(
								cc.show(),
								cc.fadeTo(CONFIG.FADE_FAST_DURATION, 150.0)
							)),
							cc.targetedAction(cardBackGlowOutlineSprite, cc.sequence(
								cc.delayTime(CONFIG.ANIMATE_FAST_DURATION),
								cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION),
								cc.hide()
							))
						)
					)),
					cc.callFunc(function () {
						// show labels
						if (label != null) {
							label.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
						}
						if (sublabel != null) {
							sublabel.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
						}

						// float card to make it appear more dynamic
						if (!looping) {
							cardContainerNode.runAction(FigureEight.create(4.0 + Math.random(), 2, 5, cardContainerNode.getPosition()).repeatForever());
						}

						// finish
						resolve();
					}.bind(this))
				));
			}.bind(this))
			.catch(function (error) { EventBus.getInstance().trigger(EVENTS.error, error); });
		}.bind(this));
	}

	/* endregion ANIMATION */

});

CardBackRewardNode.create = function(options, node) {
	return RewardNode.create(options, node || new CardBackRewardNode(options));
};

module.exports = CardBackRewardNode;
