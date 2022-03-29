//pragma PKGS: loot_crate

var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var RSX = require("app/data/resources");
var PKGS = require("app/data/packages");
var SDK = require("app/sdk");
var UtilsEngine = require('app/common/utils/utils_engine');
var audio_engine = require("./../../../audio/audio_engine");
var RewardLayer = require('./RewardLayer');
var BaseSprite = require('./../../nodes/BaseSprite');
var BaseParticleSystem = require('./../../nodes/BaseParticleSystem');
var FXFbmPolarFlareSprite = require('./../../nodes/fx/FXFbmPolarFlareSprite');
var FXFbmPolarFlareWipeSprite = require('./../../nodes/fx/FXFbmPolarFlareWipeSprite');
var GiftCrateNode = require("app/view/nodes/reward/GiftCrateNode");
var GiftCrateLookup = require('app/sdk/giftCrates/giftCrateLookup');
var MysteryT1CrateNode = require("app/view/nodes/reward/MysteryT1CrateNode");
var MysteryT2CrateNode = require("app/view/nodes/reward/MysteryT2CrateNode");
var MysteryT3CrateNode = require("app/view/nodes/reward/MysteryT3CrateNode");
var MysteryBossCrateNode = require("app/view/nodes/reward/MysteryBossCrateNode");
var FrostfireCrateNode = require("app/view/nodes/reward/FrostfireCrateNode");
var FrostfirePremiumCrateNode = require("app/view/nodes/reward/FrostfirePremiumCrateNode");
var Promise = require("bluebird");
var i18next = require('i18next')

/****************************************************************************
 LootCrateRewardLayer
 ****************************************************************************/

var LootCrateRewardLayer = RewardLayer.extend({

	getRequiredResources: function () {
		return RewardLayer.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier("loot_crate"));
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

	animateReward: function (lootCrateTypes,title,subtitle) {
		return this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

			audio_engine.current().play_effect(RSX.sfx_loot_crate_reward_long.audio, false);

			var showPromises = [];

			// show rewards
			if (lootCrateTypes && lootCrateTypes.length > 0) {
				var numRewards = lootCrateTypes.length;
				var padding = UtilsEngine.getGSIWinWidth() * 0.3;
				var offsetPerReward = (UtilsEngine.getGSIWinWidth() - padding) / numRewards;
				var offsetX;
				var offsetY = 0.0;
				if (numRewards > 1) {
					offsetX = -(offsetPerReward * numRewards * 0.5) + offsetPerReward * 0.5;
				} else {
					offsetX = 0.0;
				}
				for (var i = 0; i < numRewards; i++) {
					var disableCrateDescription = (i != (numRewards-1));
					showPromises.push(this._showRewardLootCrate(lootCrateTypes[i], cc.p(offsetX, offsetY),disableCrateDescription));
					offsetX += offsetPerReward;
				}
			}

			// show titles
			if (!title) {
				if (lootCrateTypes) {
					if (lootCrateTypes.length > 1) {
						title = i18next.t("rewards.multi_mystery_crate", {numCrates: lootCrateTypes.length});
					} else {
						var lootCrateType = lootCrateTypes[0];
						var lootCrateName = SDK.CosmeticsFactory.nameForCosmeticChestType(lootCrateType);
						title = i18next.t("rewards.one_mystery_crate", {crateName: lootCrateName});
					}
				}
			}
			subtitle = subtitle || "Mystery Crates are filled with cosmetic items!";
			if (lootCrateTypes[0] === SDK.CosmeticsChestTypeLookup.Boss) {
				subtitle = ""
			}
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

	_showRewardLootCrate: function (lootCrateType, targetScreenPosition,disableCrateDescription) {
		return new Promise(function (resolve) {
			// loot crate
			var lootCrateNode;
			if (lootCrateType === SDK.CosmeticsChestTypeLookup.Epic) {
				lootCrateNode = new MysteryT3CrateNode();
			} else if (lootCrateType === SDK.CosmeticsChestTypeLookup.Rare) {
				lootCrateNode = new MysteryT2CrateNode();
			} else if (lootCrateType === SDK.CosmeticsChestTypeLookup.Common) {
				lootCrateNode = new MysteryT1CrateNode();
			} else if (lootCrateType === SDK.CosmeticsChestTypeLookup.Boss) {
				lootCrateNode = new MysteryBossCrateNode();
			} else if (lootCrateType === GiftCrateLookup.FrostfirePurchasable2017) {
				lootCrateNode = new FrostfireCrateNode();
			} else if (lootCrateType === GiftCrateLookup.FrostfirePremiumPurchasable2017) {
				lootCrateNode = new FrostfirePremiumCrateNode();
			} else {
				lootCrateNode = new GiftCrateNode();
			}
			lootCrateNode.setPosition(targetScreenPosition);
			lootCrateNode.setVisible(false);
			lootCrateNode.setReducedDescriptionSpacing(true);
			this.addChild(lootCrateNode);

			// gold flaring
			var polarFlare = FXFbmPolarFlareSprite.create();
			polarFlare.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
			polarFlare.setTextureRect(cc.rect(0, 0, 512, 640));
			polarFlare.setAnchorPoint(cc.p(0.5, 0.5));
			polarFlare.setPosition(targetScreenPosition);
			this.addChild(polarFlare, -1);

			// wipe flare
			var wipeFlare = FXFbmPolarFlareWipeSprite.create();
			wipeFlare.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
			wipeFlare.setTextureRect(cc.rect(0, 0, 512, 512));
			wipeFlare.setAnchorPoint(cc.p(0.5, 0.5));
			wipeFlare.setPosition(targetScreenPosition);
			wipeFlare.setColor(cc.color(165,233,255));
			this.addChild(wipeFlare, -1);

			// explosion particles
			var explosionParticles = cc.ParticleSystem.create(RSX.explosion.plist);
			explosionParticles.setAnchorPoint(cc.p(0.5, 0.5));
			explosionParticles.setPosition(targetScreenPosition);
			this.addChild(explosionParticles, -1);

			// run the wipe effect
			wipeFlare.runAction(cc.sequence(
				cc.fadeIn(0.01),
				cc.actionTween(0.25,"phase",0.0,0.5),
				cc.actionTween(0.75,"phase",0.5,1.5),
				cc.fadeOut(0.1)
			));

			// show reward
			lootCrateNode.showReveal()
			.then(function () {
				var allPromises = [];
				allPromises.push(lootCrateNode.showIdleState(CONFIG.ANIMATE_MEDIUM_DURATION));
				if (!disableCrateDescription) {
					allPromises.push(lootCrateNode.showCrateDescriptionLabel(CONFIG.ANIMATE_MEDIUM_DURATION));
				}

				return Promise.all([allPromises])
			})
			.then(function () {
				// finish
				resolve();
			});

		}.bind(this));
	}

});

LootCrateRewardLayer.create = function(layer) {
	return RewardLayer.create(layer || new LootCrateRewardLayer());
};

module.exports = LootCrateRewardLayer;
