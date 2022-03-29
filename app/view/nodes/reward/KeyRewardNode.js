//pragma PKGS: key_reward
var SDK = require('app/sdk');
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var RSX = require("app/data/resources");
var PKGS = require("app/data/packages");
var FigureEight = require('app/view/actions/FigureEight');
var RewardNode = require('./RewardNode');
var BaseSprite = require('app/view/nodes/BaseSprite');
var BaseParticleSystem = require('app/view/nodes/BaseParticleSystem');
var Promise = require("bluebird");

/****************************************************************************
 KeyRewardNode
 ****************************************************************************/

var KeyRewardNode = RewardNode.extend({

	_keyType: null,

	ctor: function (keyType) {
		if (keyType == null) {
			throw new Error("Key reward node must be initialized with a key type!")
		}
		this._keyType = keyType;

		this._super();
	},

	getKeyType: function () {
		return this._keyType;
	},

	/* region RESOURCES */

	/**
	 * Returns a list of resource objects this node uses.
	 * @returns {Array}
	 */
	getRequiredResources: function () {
		return this._super().concat(PKGS.getPkgForIdentifier("key_reward"));
	},

	/* endregion RESOURCES */

	/* region ANIMATION */

	getRewardAnimationPromise: function (looping, showLabel) {
		return (looping ? this.showLoopingRewardFlare() : this.showRewardFlare())
		.then(function () {
			return new Promise(function (resolve) {
				// key sprite
				var spriteIdentifier;
				var chestType;
				if (this._keyType === SDK.CosmeticsChestTypeLookup.Epic) {
					spriteIdentifier = RSX.mystery_t3_loot_crate_key.img;
					chestType = "Epic Crate";
				} else if (this._keyType === SDK.CosmeticsChestTypeLookup.Rare) {
					spriteIdentifier = RSX.mystery_t2_loot_crate_key.img;
					chestType = "Rare Crate";
				} else {
					spriteIdentifier = RSX.mystery_t1_loot_crate_key.img;
					chestType = "Common Crate";
				}
				var keyScale = 1.0;
				var keySprite = BaseSprite.create(spriteIdentifier);
				keySprite.setVisible(false);
				keySprite.setRotation(90.0);
				keySprite.setScale(keyScale);
				this.addChild(keySprite, 1);

				if (showLabel) {
					// primary label
					var labelText = _.isString(showLabel) ? showLabel : "KEY";
					var label = new cc.LabelTTF(labelText, RSX.font_regular.name, 22, cc.size(200, 24), cc.TEXT_ALIGNMENT_CENTER);
					label.setPosition(0, -120);
					label.setOpacity(0);
					this.addChild(label, 1);

					// secondary label
					var sublabel = new cc.LabelTTF(chestType.toLocaleUpperCase(), RSX.font_regular.name, 16, cc.size(200, 24), cc.TEXT_ALIGNMENT_CENTER);
					sublabel.setFontFillColor({r: 220, g: 220, b: 220});
					sublabel.setPosition(0, -100);
					sublabel.setOpacity(0);
					this.addChild(sublabel, 1);
				}

				// show wipe flare
				this.showRewardWipeFlare();

				// show key
				this.runAction(cc.sequence(
					cc.targetedAction(keySprite, cc.sequence(
						cc.show(),
						cc.scaleTo(0.0, 0.0),
						cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, keyScale).easing(cc.easeBackOut()),
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
							keySprite.runAction(FigureEight.create(4.0 + Math.random(), 2, 5, keySprite.getPosition()).repeatForever());
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

KeyRewardNode.create = function(options, node) {
	return RewardNode.create(options, node || new KeyRewardNode(options));
};

module.exports = KeyRewardNode;
