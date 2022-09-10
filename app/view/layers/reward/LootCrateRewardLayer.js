// pragma PKGS: loot_crate

const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const SDK = require('app/sdk');
const UtilsEngine = require('app/common/utils/utils_engine');
const GiftCrateNode = require('app/view/nodes/reward/GiftCrateNode');
const GiftCrateLookup = require('app/sdk/giftCrates/giftCrateLookup');
const MysteryT1CrateNode = require('app/view/nodes/reward/MysteryT1CrateNode');
const MysteryT2CrateNode = require('app/view/nodes/reward/MysteryT2CrateNode');
const MysteryT3CrateNode = require('app/view/nodes/reward/MysteryT3CrateNode');
const MysteryBossCrateNode = require('app/view/nodes/reward/MysteryBossCrateNode');
const FrostfireCrateNode = require('app/view/nodes/reward/FrostfireCrateNode');
const FrostfirePremiumCrateNode = require('app/view/nodes/reward/FrostfirePremiumCrateNode');
const Promise = require('bluebird');
const i18next = require('i18next');
const FXFbmPolarFlareWipeSprite = require('../../nodes/fx/FXFbmPolarFlareWipeSprite');
const FXFbmPolarFlareSprite = require('../../nodes/fx/FXFbmPolarFlareSprite');
const BaseParticleSystem = require('../../nodes/BaseParticleSystem');
const BaseSprite = require('../../nodes/BaseSprite');
const RewardLayer = require('./RewardLayer');
const audio_engine = require('../../../audio/audio_engine');

/** **************************************************************************
 LootCrateRewardLayer
 *************************************************************************** */

const LootCrateRewardLayer = RewardLayer.extend({

  getRequiredResources() {
    return RewardLayer.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier('loot_crate'));
  },

  showBackground() {
    return this.showFlatBackground();
  },

  showContinueNode() {
    return this._super().then(() => {
      this.continueNode.setVisible(false);
    });
  },

  onEnter() {
    this._super();

    // don't allow continue
    this.setIsContinueOnPressAnywhere(false);
    this.setIsInteractionEnabled(false);
  },

  animateReward(lootCrateTypes, title, subtitle) {
    return this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      audio_engine.current().play_effect(RSX.sfx_loot_crate_reward_long.audio, false);

      const showPromises = [];

      // show rewards
      if (lootCrateTypes && lootCrateTypes.length > 0) {
        const numRewards = lootCrateTypes.length;
        const padding = UtilsEngine.getGSIWinWidth() * 0.3;
        const offsetPerReward = (UtilsEngine.getGSIWinWidth() - padding) / numRewards;
        let offsetX;
        const offsetY = 0.0;
        if (numRewards > 1) {
          offsetX = -(offsetPerReward * numRewards * 0.5) + offsetPerReward * 0.5;
        } else {
          offsetX = 0.0;
        }
        for (let i = 0; i < numRewards; i++) {
          const disableCrateDescription = (i != (numRewards - 1));
          showPromises.push(this._showRewardLootCrate(lootCrateTypes[i], cc.p(offsetX, offsetY), disableCrateDescription));
          offsetX += offsetPerReward;
        }
      }

      // show titles
      if (!title) {
        if (lootCrateTypes) {
          if (lootCrateTypes.length > 1) {
            title = i18next.t('rewards.multi_mystery_crate', { numCrates: lootCrateTypes.length });
          } else {
            const lootCrateType = lootCrateTypes[0];
            const lootCrateName = SDK.CosmeticsFactory.nameForCosmeticChestType(lootCrateType);
            title = i18next.t('rewards.one_mystery_crate', { crateName: lootCrateName });
          }
        }
      }
      subtitle = subtitle || 'Mystery Crates are filled with cosmetic items!';
      if (lootCrateTypes[0] === SDK.CosmeticsChestTypeLookup.Boss) {
        subtitle = '';
      }
      showPromises.push(new Promise((resolve) => {
        this.runAction(cc.sequence(
          cc.delayTime(1.0),
          cc.callFunc(() => {
            this.showTitles(CONFIG.ANIMATE_FAST_DURATION, title, subtitle).then(resolve);
          }),
        ));
      }));

      return Promise.all(showPromises).then(() => {
        this.setIsContinueOnPressAnywhere(true);
        this.setIsInteractionEnabled(true);
        this.continueNode.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
      });
    });
  },

  _showRewardLootCrate(lootCrateType, targetScreenPosition, disableCrateDescription) {
    return new Promise((resolve) => {
      // loot crate
      let lootCrateNode;
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
      const polarFlare = FXFbmPolarFlareSprite.create();
      polarFlare.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      polarFlare.setTextureRect(cc.rect(0, 0, 512, 640));
      polarFlare.setAnchorPoint(cc.p(0.5, 0.5));
      polarFlare.setPosition(targetScreenPosition);
      this.addChild(polarFlare, -1);

      // wipe flare
      const wipeFlare = FXFbmPolarFlareWipeSprite.create();
      wipeFlare.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      wipeFlare.setTextureRect(cc.rect(0, 0, 512, 512));
      wipeFlare.setAnchorPoint(cc.p(0.5, 0.5));
      wipeFlare.setPosition(targetScreenPosition);
      wipeFlare.setColor(cc.color(165, 233, 255));
      this.addChild(wipeFlare, -1);

      // explosion particles
      const explosionParticles = cc.ParticleSystem.create(RSX.explosion.plist);
      explosionParticles.setAnchorPoint(cc.p(0.5, 0.5));
      explosionParticles.setPosition(targetScreenPosition);
      this.addChild(explosionParticles, -1);

      // run the wipe effect
      wipeFlare.runAction(cc.sequence(
        cc.fadeIn(0.01),
        cc.actionTween(0.25, 'phase', 0.0, 0.5),
        cc.actionTween(0.75, 'phase', 0.5, 1.5),
        cc.fadeOut(0.1),
      ));

      // show reward
      lootCrateNode.showReveal()
        .then(() => {
          const allPromises = [];
          allPromises.push(lootCrateNode.showIdleState(CONFIG.ANIMATE_MEDIUM_DURATION));
          if (!disableCrateDescription) {
            allPromises.push(lootCrateNode.showCrateDescriptionLabel(CONFIG.ANIMATE_MEDIUM_DURATION));
          }

          return Promise.all([allPromises]);
        })
        .then(() => {
          // finish
          resolve();
        });
    });
  },

});

LootCrateRewardLayer.create = function (layer) {
  return RewardLayer.create(layer || new LootCrateRewardLayer());
};

module.exports = LootCrateRewardLayer;
