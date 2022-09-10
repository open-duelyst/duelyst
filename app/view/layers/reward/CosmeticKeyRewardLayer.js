// pragma PKGS: cosmetic_key_reward
const CONFIG = require('app/common/config');
const UtilsEngine = require('app/common/utils/utils_engine');
const Promise = require('bluebird');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const audio_engine = require('../../../audio/audio_engine');
const RewardLayer = require('./RewardLayer');
const KeyRewardNode = require('../../nodes/reward/KeyRewardNode');

/** **************************************************************************
 CosmeticKeyRewardLayer
 *************************************************************************** */

const CosmeticKeyRewardLayer = RewardLayer.extend({

  getRequiredResources() {
    return RewardLayer.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier('cosmetic_key_reward'));
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

  /* region REWARD KEYS */
  showRewardKeys(cosmeticKeyTypes, title, subtitle) {
    return this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      audio_engine.current().play_effect(RSX.sfx_ribbon_reward_long.audio, false);

      const showPromises = [];

      // show ribbons
      if (cosmeticKeyTypes && cosmeticKeyTypes.length > 0) {
        const numRewards = cosmeticKeyTypes.length;
        const padding = UtilsEngine.getGSIWinWidth() * 0.2;
        const offsetPerReward = (UtilsEngine.getGSIWinWidth() - padding) / numRewards;
        let offsetX;
        const offsetY = 0.0;
        if (numRewards > 1) {
          offsetX = -(offsetPerReward * numRewards * 0.5) + offsetPerReward * 0.5;
        } else {
          offsetX = 0.0;
        }
        for (let i = 0; i < numRewards; i++) {
          showPromises.push(this._showRewardKey(cosmeticKeyTypes[i], cc.p(offsetX, offsetY)));
          offsetX += offsetPerReward;
        }
      }

      // show titles
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

  _showRewardKey(keyType, targetScreenPosition) {
    const keyRewardNode = new KeyRewardNode(keyType);
    keyRewardNode.setPosition(targetScreenPosition);
    this.addChild(keyRewardNode, 1);
    return keyRewardNode.animateReward(true, false);
  },
  /* endregion REWARD RIBBONS */
});

CosmeticKeyRewardLayer.create = function (layer) {
  return RewardLayer.create(layer || new CosmeticKeyRewardLayer());
};

module.exports = CosmeticKeyRewardLayer;
