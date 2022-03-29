//pragma PKGS: cosmetic_reward
var SDK = require('app/sdk');
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var RSX = require("app/data/resources");
var PKGS = require("app/data/packages");
var FigureEight = require('app/view/actions/FigureEight');
var RewardNode = require('./RewardNode');
var BaseSprite = require('./../BaseSprite');
var BaseParticleSystem = require('./../BaseParticleSystem');
var Promise = require("bluebird");
var i18next = require("i18next")

/****************************************************************************
 CosmeticRewardNode
 ****************************************************************************/

var CosmeticRewardNode = RewardNode.extend({

	_cosmeticId: null,

	ctor: function (cosmeticId) {
		if (cosmeticId == null) {
			throw new Error("Cosmetic reward node must be initialized with a cosmetic id!")
		}
		this._cosmeticId = cosmeticId;

		this._super();
	},

	getCosmeticId: function () {
		return this._cosmeticId;
	},

	/* region RESOURCES */

	/**
	 * Returns a list of resource objects this node uses.
	 * @returns {Array}
	 */
	getRequiredResources: function () {
		var cosmeticRewardResources = PKGS.getPkgForIdentifier("cosmetic_reward");
		var cosmeticResources = this._cosmeticId != null ? SDK.CosmeticsFactory.cosmeticResourcesForIdentifier(this._cosmeticId) : [];
		return this._super().concat(cosmeticResources, cosmeticRewardResources);
	},

	/* endregion RESOURCES */

	/* region ANIMATION */

	getRewardAnimationPromise: function (looping, showLabel, maskWithCircle) {
		return (looping ? this.showLoopingRewardFlare() : this.showRewardFlare())
		.then(function () {
			return new Promise(function (resolve) {
				// cosmetic data
				var cosmeticData = SDK.CosmeticsFactory.cosmeticForIdentifier(this._cosmeticId);

				// cosmetic sprite
				var cosmeticScale = 0.75;
				var cosmeticSprite = BaseSprite.create(cosmeticData.img);
				if (maskWithCircle) {
					cosmeticSprite.setMask(RSX.mask_circle.img);
				}
				cosmeticSprite.setScale(cosmeticScale);
				cosmeticSprite.setVisible(false);
				this.addChild(cosmeticSprite, 1);

				if (showLabel) {
					// primary label
					var labelText = _.isString(showLabel) ? showLabel : "COSMETIC";
					var label = new cc.LabelTTF(labelText, RSX.font_regular.name, 22, cc.size(200, 24), cc.TEXT_ALIGNMENT_CENTER);
					label.setPosition(0, -120);
					label.setOpacity(0);
					this.addChild(label, 1);

					// secondary label
					var rarityId = cosmeticData.rarityId;
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

				// show cosmetic
				this.runAction(cc.sequence(
					cc.targetedAction(cosmeticSprite, cc.sequence(
						cc.show(),
						cc.scaleTo(0.0, 0.0),
						cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, cosmeticScale).easing(cc.easeBackOut()),
						cc.callFunc(function () {
							// show labels
							if (label != null) {
								label.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
							}
							if (sublabel != null) {
								sublabel.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
							}
						}.bind(this))
					)),
					cc.callFunc(function () {
						// float sprite to make it appear more dynamic
						if (!looping) {
							cosmeticSprite.runAction(FigureEight.create(4.0 + Math.random(), 2, 5, cosmeticSprite.getPosition()).repeatForever());
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

CosmeticRewardNode.create = function(options, node) {
	return RewardNode.create(options, node || new CosmeticRewardNode(options));
};

module.exports = CosmeticRewardNode;
