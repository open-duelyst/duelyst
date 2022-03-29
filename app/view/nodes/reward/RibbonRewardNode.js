//pragma PKGS: ribbon_reward
var SDK = require('app/sdk');
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var RSX = require("app/data/resources");
var PKGS = require("app/data/packages");
var FigureEight = require('app/view/actions/FigureEight');
var RewardNode = require('./RewardNode');
var GlowSprite = require('./../GlowSprite');
var BaseParticleSystem = require('./../BaseParticleSystem');
var Promise = require("bluebird");

/****************************************************************************
 RibbonRewardNode
 ****************************************************************************/

var RibbonRewardNode = RewardNode.extend({

	_ribbonId: null,

	ctor: function (ribbonId) {
		if (ribbonId == null) {
			throw new Error("Ribbon reward node must be initialized with a ribbon id!")
		}
		this._ribbonId = ribbonId;

		this._super();
	},

	getRibbonId: function () {
		return this._ribbonId;
	},

	/* region RESOURCES */

	/**
	 * Returns a list of resource objects this node uses.
	 * @returns {Array}
	 */
	getRequiredResources: function () {
		var ribbonRewardResources = PKGS.getPkgForIdentifier("ribbon_reward");
		var ribbonData = SDK.RibbonFactory.ribbonForIdentifier(this._ribbonId);
		return this._super().concat(ribbonRewardResources, ribbonData.rsx);
	},

	/* endregion RESOURCES */

	/* region ANIMATION */

	getRewardAnimationPromise: function (looping, showLabel) {
		return (looping ? this.showLoopingRewardFlare() : this.showRewardFlare())
		.then(function () {
			return new Promise(function (resolve) {
				// ribbon data
				var ribbonData = SDK.RibbonFactory.ribbonForIdentifier(this._ribbonId);

				// ribbon sprite
				var ribbonSprite = new GlowSprite(ribbonData.rsx.img);
				ribbonSprite.setVisible(false);
				ribbonSprite.setHighlighted(true);
				ribbonSprite.setPosition(0.0, 0.0);
				this.addChild(ribbonSprite, 1);

				if (showLabel) {
					// primary label
					var labelText = _.isString(showLabel) ? showLabel : "BATTLE RIBBON";
					var label = new cc.LabelTTF(labelText, RSX.font_regular.name, 22, cc.size(200, 24), cc.TEXT_ALIGNMENT_CENTER);
					label.setPosition(0, -120);
					label.setOpacity(0);
					this.addChild(label, 1);
				}

				// show wipe flare
				this.showRewardWipeFlare();

				// show profile icon
				this.runAction(cc.sequence(
					cc.targetedAction(ribbonSprite, cc.sequence(
						cc.callFunc(function () {
							ribbonSprite.setVisible(true);
							ribbonSprite.fadeInHighlight(CONFIG.ANIMATE_MEDIUM_DURATION);
						}.bind(this)),
						cc.scaleTo(0.0, 0.0),
						cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0).easing(cc.easeBackOut()),
						cc.callFunc(function () {
							// show labels
							if (label != null) {
								label.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
							}
						}.bind(this))
					)),
					cc.callFunc(function () {
						ribbonSprite.fadeOutHighlight(0.5);

						// float sprite to make it appear more dynamic
						if (!looping) {
							ribbonSprite.runAction(FigureEight.create(4.0 + Math.random(), 2, 5, ribbonSprite.getPosition()).repeatForever());
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

RibbonRewardNode.create = function(options, node) {
	return RewardNode.create(options, node || new RibbonRewardNode(options));
};

module.exports = RibbonRewardNode;
