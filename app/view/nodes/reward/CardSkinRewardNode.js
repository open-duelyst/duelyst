//pragma PKGS: card_skin_reward
var SDK = require('app/sdk');
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var RSX = require("app/data/resources");
var PKGS = require("app/data/packages");
var UtilsEngine = require('app/common/utils/utils_engine');
var RewardNode = require('./RewardNode');
var BaseSprite = require('./../BaseSprite');
var BaseParticleSystem = require('./../BaseParticleSystem');
var Promise = require("bluebird");
var i18next = require("i18next")

/****************************************************************************
 CardSkinRewardNode
 ****************************************************************************/

var CardSkinRewardNode = RewardNode.extend({

	_cardSkinId: null,

	ctor: function (cardSkinId) {
		if (cardSkinId == null) {
			throw new Error("Card Skin reward node must be initialized with a card skin id!")
		}
		this._cardSkinId = cardSkinId;

		this._super();
	},

	getCardSkinId: function () {
		return this._cardSkinId;
	},

	/* region RESOURCES */

	/**
	 * Returns a list of resource objects this node uses.
	 * @returns {Array}
	 */
	getRequiredResources: function () {
		var cardSkinRewardResources = PKGS.getPkgForIdentifier("card_skin_reward");
		var cardSkinResources = this._cardSkinId != null ? SDK.CosmeticsFactory.cosmeticResourcesForIdentifier(this._cardSkinId) : [];
		return this._super().concat(cardSkinResources, cardSkinRewardResources);
	},

	/* endregion RESOURCES */

	/* region ANIMATION */

	getRewardAnimationPromise: function (looping, showLabel) {
		return (looping ? this.showLoopingRewardFlare() : this.showRewardFlare())
		.then(function () {
			return new Promise(function (resolve) {
				// card skin data
				var cardSkinData = SDK.CosmeticsFactory.cosmeticForIdentifier(this._cardSkinId);
				var animResource = cardSkinData.animResource;
				var animName = animResource.breathing || animResource.idle;
				var animStartName = animResource.attack || animName;

				// card skin sprite
				var cardSkinScale = CONFIG.SCALE;
				var cardSkinSprite = BaseSprite.create(animName);
				cardSkinSprite.setPosition(0.0, -80.0);
				cardSkinSprite.setAnchorPoint(0.5, 0.0);
				cardSkinSprite.getTexture().setAliasTexParametersWhenSafeScale();
				cardSkinSprite.setScale(0.0);
				cardSkinSprite.setVisible(false);
				this.addChild(cardSkinSprite, 1);

				// shadow
				var shadowSprite = BaseSprite.create(RSX.unit_shadow.img);
				shadowSprite.setPosition(0.0, -40.0);
				shadowSprite.setOpacity(0);
				shadowSprite.setVisible(false);
				this.addChild(shadowSprite);

				if (showLabel) {
					// primary label
					var labelText = _.isString(showLabel) ? showLabel : i18next.t("cosmetics.cosmetic_type_card_skin").toLocaleUpperCase();
					var label = new cc.LabelTTF(labelText, RSX.font_regular.name, 22, cc.size(200, 24), cc.TEXT_ALIGNMENT_CENTER);
					label.setPosition(0, -120);
					label.setOpacity(0);
					this.addChild(label, 1);

					// secondary label
					var rarityId = cardSkinData.rarityId;
					if (rarityId != null) {
						var rarityData = SDK.RarityFactory.rarityForIdentifier(rarityId);
						var sublabel = new cc.LabelTTF(rarityData.name.toLocaleUpperCase(), RSX.font_regular.name, 16, cc.size(200, 24), cc.TEXT_ALIGNMENT_CENTER);
						sublabel.setFontFillColor(rarityData.color);
						sublabel.setPosition(0, -100);
						sublabel.setOpacity(0);
						this.addChild(sublabel, 1);
					}
				}

				// show wipe flare
				this.showRewardWipeFlare();

				// loop animation
				var animationLoopingAction = UtilsEngine.getAnimationAction(animName, true);
				var animationStartAction = UtilsEngine.getAnimationAction(animStartName);
				cardSkinSprite.runAction(animationLoopingAction);

				// show card skin
				this.runAction(cc.sequence(
					cc.spawn(
						cc.targetedAction(cardSkinSprite, cc.sequence(
							cc.show(),
							cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, cardSkinScale).easing(cc.easeBackOut())
						)),
						cc.targetedAction(shadowSprite, cc.sequence(
							cc.show(),
							cc.fadeTo(CONFIG.ANIMATE_MEDIUM_DURATION, 125.0)
						))
					),
					cc.callFunc(function () {
						// show labels
						if (label != null) {
							label.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
						}
						if (sublabel != null) {
							sublabel.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
						}
					}.bind(this)),
					cc.spawn(
						cc.callFunc(function () {
							// show start action and then loop idle animation
							cardSkinSprite.stopAction(animationLoopingAction);
							cardSkinSprite.runAction(cc.sequence(
								animationStartAction,
								cc.callFunc(function () {
									cardSkinSprite.runAction(animationLoopingAction);
								}.bind(this))
							));
						}.bind(this)),
						cc.sequence(
							cc.delayTime(animationStartAction.getDuration() * 0.5),
							cc.callFunc(function () {
								// finish
								resolve();
							}.bind(this))
						)
					)
				));
			}.bind(this))
			.catch(function (error) { EventBus.getInstance().trigger(EVENTS.error, error); });
		}.bind(this));
	}

	/* endregion ANIMATION */

});

CardSkinRewardNode.create = function(options, node) {
	return RewardNode.create(options, node || new CardSkinRewardNode(options));
};

module.exports = CardSkinRewardNode;
