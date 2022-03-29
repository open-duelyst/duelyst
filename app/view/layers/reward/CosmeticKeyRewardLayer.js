//pragma PKGS: cosmetic_key_reward
var CONFIG = require('app/common/config');
var UtilsEngine = require('app/common/utils/utils_engine');
var Promise = require('bluebird');
var RSX = require("app/data/resources");
var PKGS = require("app/data/packages");
var audio_engine = require("./../../../audio/audio_engine");
var RewardLayer = require('./RewardLayer');
var KeyRewardNode = require('./../../nodes/reward/KeyRewardNode');

/****************************************************************************
 CosmeticKeyRewardLayer
 ****************************************************************************/

var CosmeticKeyRewardLayer = RewardLayer.extend({

	getRequiredResources: function () {
		return RewardLayer.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier("cosmetic_key_reward"));
	},

	showBackground: function () {
		return this.showFlatBackground();
	},

	showContinueNode: function () {
		return this._super().then(function () {
			this.continueNode.setVisible(false);
		}.bind(this));
	},

	onEnter: function () {
		this._super();

		// don't allow continue
		this.setIsContinueOnPressAnywhere(false);
		this.setIsInteractionEnabled(false);
	},

	/* region REWARD KEYS */
	showRewardKeys: function (cosmeticKeyTypes, title, subtitle) {
		return this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

			audio_engine.current().play_effect(RSX.sfx_ribbon_reward_long.audio, false);

			var showPromises = [];

			// show ribbons
			if (cosmeticKeyTypes && cosmeticKeyTypes.length > 0) {
				var numRewards = cosmeticKeyTypes.length;
				var padding = UtilsEngine.getGSIWinWidth() * 0.2;
				var offsetPerReward = (UtilsEngine.getGSIWinWidth() - padding) / numRewards;
				var offsetX;
				var offsetY = 0.0;
				if (numRewards > 1) {
					offsetX = -(offsetPerReward * numRewards * 0.5) + offsetPerReward * 0.5;
				} else {
					offsetX = 0.0;
				}
				for (var i = 0; i < numRewards; i++) {
					showPromises.push(this._showRewardKey(cosmeticKeyTypes[i], cc.p(offsetX, offsetY)));
					offsetX += offsetPerReward;
				}
			}

			// show titles
			showPromises.push(new Promise(function (resolve) {
				this.runAction(cc.sequence(
					cc.delayTime(1.0),
					cc.callFunc(function () {
						this.showTitles(CONFIG.ANIMATE_FAST_DURATION, title, subtitle).then(resolve);
					}.bind(this))
				));
			}.bind(this)));

			return Promise.all(showPromises).then(function () {
				this.setIsContinueOnPressAnywhere(true);
				this.setIsInteractionEnabled(true);
				this.continueNode.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
			}.bind(this));
		}.bind(this));
	},

	_showRewardKey: function (keyType, targetScreenPosition) {
		var keyRewardNode = new KeyRewardNode(keyType);
		keyRewardNode.setPosition(targetScreenPosition);
		this.addChild(keyRewardNode, 1);
		return keyRewardNode.animateReward(true,false)
	}
	/* endregion REWARD RIBBONS */
});

CosmeticKeyRewardLayer.create = function(layer) {
	return RewardLayer.create(layer || new CosmeticKeyRewardLayer());
};

module.exports = CosmeticKeyRewardLayer;
