//pragma PKGS: spirit_orb_reward
var SDK = require('app/sdk');
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var RSX = require("app/data/resources");
var PKGS = require("app/data/packages");
var FigureEight = require('app/view/actions/FigureEight');
var TweenTypes = require('app/view/actions/TweenTypes');
var RewardNode = require('./RewardNode');
var BaseSprite = require('app/view/nodes/BaseSprite');
var FXDissolveWithDiscFromCenterSprite = require('app/view/nodes/fx/FXDissolveWithDiscFromCenterSprite');
var Promise = require("bluebird");
var i18next = require("i18next")

/****************************************************************************
 SpiritOrbRewardNode
 ****************************************************************************/

var SpiritOrbRewardNode = RewardNode.extend({

	_cardSet: SDK.CardSet.Core,

	ctor: function (orbCardSet) {
		if (orbCardSet != null) {
			this.setOrbCardSet(orbCardSet);
		}

		this._super();
	},

	setOrbCardSet: function (val) {
		if (this._cardSet != val) {
			this._cardSet = val;
		}
	},
	getOrbCardSet: function () {
		return this._cardSet;
	},

	/* region RESOURCES */

	/**
	 * Returns a list of resource objects this node uses.
	 * @returns {Array}
	 */
	getRequiredResources: function () {
		return this._super().concat(PKGS.getPkgForIdentifier("spirit_orb_reward"));
	},

	/* endregion RESOURCES */

	/* region ANIMATION */

	getRewardAnimationPromise: function (looping, showLabel) {
		return (looping ? this.showLoopingRewardFlare() : this.showRewardFlare())
		.then(function () {
			return new Promise(function (resolve) {
				// spirit orb
				var spiritOrbContainerNode = new cc.Node();
				spiritOrbContainerNode.setAnchorPoint(0.5, 0.5);
				this.addChild(spiritOrbContainerNode, this._zOrderRewards);

				// bg shadow
				var bgShadowSprite = BaseSprite.create(RSX.gold_reward_bg_shadow.img);
				bgShadowSprite.setScale(0.5);
				bgShadowSprite.setOpacity(0);
				bgShadowSprite.setVisible(false);
				spiritOrbContainerNode.addChild(bgShadowSprite);

				var orbImgRef;
				if (this.getOrbCardSet() == SDK.CardSet.Shimzar) {
					orbImgRef = RSX.shop_1_shimzar_orb.img;
				} else if (this.getOrbCardSet() == SDK.CardSet.FirstWatch) {
					orbImgRef = RSX.shop_1_firstwatch_orb.img;
				} else if (this.getOrbCardSet() == SDK.CardSet.Wartech) {
					orbImgRef = RSX.shop_1_wartech_orb.img;
				} else if (this.getOrbCardSet() == SDK.CardSet.CombinedUnlockables) {
					orbImgRef = RSX.shop_1_ancient_orb.img;
				} else if (this.getOrbCardSet() == SDK.CardSet.Coreshatter) {
					orbImgRef = RSX.shop_1_fate_orb.img;
				} else {
					orbImgRef = RSX.orb.img;
				}

				// orb dissolve-in sprite
				var orbDissolveSprite = FXDissolveWithDiscFromCenterSprite.create(orbImgRef);
				orbDissolveSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
				orbDissolveSprite.setScale(1.5);
				orbDissolveSprite.setAnchorPoint(cc.p(0.5, 0.5));
				orbDissolveSprite.setVisible(false);
				spiritOrbContainerNode.addChild(orbDissolveSprite, 0);

				// icon sprite
				var orbSprite = BaseSprite.create(orbImgRef);
				orbSprite.setScale(1.5);
				orbSprite.setTint(new cc.Color(255, 255, 255, 255));
				orbSprite.setVisible(false);
				spiritOrbContainerNode.addChild(orbSprite);

				if (showLabel) {
					// primary label
					var labelText = _.isString(showLabel) ? showLabel : i18next.t("common.spirit_orb").toUpperCase();
					var label = new cc.LabelTTF(labelText, RSX.font_regular.name, 22, cc.size(200, 24), cc.TEXT_ALIGNMENT_CENTER);
					label.setPosition(0, -120);
					label.setOpacity(0);
					this.addChild(label, 1);
				}

				// show wipe flare
				this.showRewardWipeFlare();

				// show orb
				this.runAction(cc.sequence(
					cc.targetedAction(orbDissolveSprite, cc.sequence(
						cc.show(),
						cc.actionTween(0.5, "phase", 0.0, 1.0),
						cc.callFunc(function () {
							orbDissolveSprite.setVisible(false);
						}.bind(this))
					)),
					cc.targetedAction(orbSprite, cc.sequence(
						cc.show(),
						cc.actionTween(0.3, TweenTypes.TINT_FADE, 255.0, 0.0).easing(cc.easeIn(3.0)),
						cc.callFunc(function () {
							// show labels
							if (label != null) {
								label.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
							}
						}.bind(this))
					)),
					cc.callFunc(function () {
						// show shadow
						bgShadowSprite.setVisible(true);
						bgShadowSprite.setOpacity(0.0);
						bgShadowSprite.fadeTo(0.2, 100.0);

						// float sprite to make it appear more dynamic
						if (!looping) {
							spiritOrbContainerNode.runAction(FigureEight.create(4.0 + Math.random(), 2, 5, spiritOrbContainerNode.getPosition()).repeatForever());
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

SpiritOrbRewardNode.create = function(options, node) {
	return RewardNode.create(options, node || new SpiritOrbRewardNode(options));
};

module.exports = SpiritOrbRewardNode;
