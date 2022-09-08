// pragma PKGS: rift
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const EVENTS = require('app/common/event_types');
const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const UtilsEngine = require('app/common/utils/utils_engine');
const Promise = require('bluebird');
const BaseLayer = require('../BaseLayer');
const BaseParticleSystem = require('../../nodes/BaseParticleSystem');
const BaseSprite = require('../../nodes/BaseSprite');
const GlowSprite = require('../../nodes/GlowSprite');
const CardNode = require('../../nodes/cards/CardNode');
const ZodiacNode = require('../../nodes/draw/Zodiac');
const TweenTypes = require('../../actions/TweenTypes');
const ToneCurve = require('../../actions/ToneCurve');
const Shake = require('../../actions/Shake');
const audio_engine = require('../../../audio/audio_engine');

/** **************************************************************************
 UpgradeInstructionsLayer
 *************************************************************************** */

const UpgradeInstructionsLayer = BaseLayer.extend({

  delegate: null,

  // ui elements
  runDetailsLabel: null,

  /* region INITIALIZE */
  ctor(riftData, wonLastGauntletGame) {
    // do super ctor
    this._super();

    const hasStoredUpgrades = (riftData.stored_upgrades != null) && (riftData.stored_upgrades.length != 0);

    // instructional arrow
    const winSize = UtilsEngine.getGSIWinSize();
    const instructionalArrowSprite = BaseSprite.create(RSX.instructional_arrow.img);
    instructionalArrowSprite.setPosition(cc.p(0.0, 0.0));
    instructionalArrowSprite.setOpacity(0.0);
    instructionalArrowSprite.setRotation(-90);
    instructionalArrowSprite.runAction(cc.sequence(
      cc.delayTime(0.2),
      cc.fadeIn(CONFIG.FADE_MEDIUM_DURATION),
      cc.moveBy(CONFIG.MOVE_SLOW_DURATION, cc.p(winSize.width / 2 - 400, 0)).easing(cc.easeExponentialOut()),
      cc.delayTime(1.0),
      cc.callFunc(() => {
        // instructionalArrowSprite.destroy(CONFIG.FADE_MEDIUM_DURATION);
      }),
    ));
    this.addChild(instructionalArrowSprite);

    // label
    this.runDetailsLabel = new cc.LabelTTF(i18next.t('rift.choose_card_upgrade_instruction_message'), RSX.font_bold.name, 32, cc.size(500, 50), cc.TEXT_ALIGNMENT_CENTER);
    this.runDetailsLabel.setPosition(0, 60);
    this.runDetailsLabel.setFontFillColor(cc.color(255, 255, 255));

    // add label
    this.addChild(this.runDetailsLabel);

    let upgradeDetailText = '';
    if (hasStoredUpgrades) {
      let storedPacksRemaining = 0;
      if (riftData != null && riftData.stored_upgrades != null) {
        storedPacksRemaining = riftData.stored_upgrades.length;
      }
      upgradeDetailText = i18next.t('rift.upgrade_details_with_stored_packs_message', { storedPacks: storedPacksRemaining });
    } else {
      upgradeDetailText = i18next.t('rift.upgrade_details_message');
      const storedUpgradeCount = ProfileManager.getInstance().profile.get('rift_stored_upgrade_count') || 0;
      if (storedUpgradeCount >= 10) {
        upgradeDetailText += i18next.t('rift.upgrade_added_details_max_saved_message');
      } else {
        upgradeDetailText += i18next.t('rift.upgrade_added_details_current_saved_message', { storedUpgradeCount });
      }
    }

    this.runProgressLabel = new cc.LabelTTF(upgradeDetailText, RSX.font_regular.name, 20, cc.size(800, 80), cc.TEXT_ALIGNMENT_CENTER);
    this.runProgressLabel.setPosition(0, -60);
    this.runProgressLabel.setFontFillColor(cc.color(255, 255, 255));

    // add label
    this.addChild(this.runProgressLabel);

    // progress label
    this.runProgressAmountLabel = new cc.LabelTTF('', RSX.font_regular.name, 14, cc.size(500, 32), cc.TEXT_ALIGNMENT_CENTER);
    this.runProgressAmountLabel.setPosition(0, -80);
    this.runProgressAmountLabel.setFontFillColor(cc.color(255, 255, 255));

    // add label
    this.addChild(this.runProgressAmountLabel);
  },

  /* region TRANSITION */

  transitionIn() {
    return new Promise((resolve, reject) => {
      this.setOpacity(0.0);
      this.runAction(cc.sequence(
        cc.fadeIn(CONFIG.FADE_FAST_DURATION),
        cc.callFunc(() => {
          resolve();
        }),
      ));
    });
  },

  transitionOut() {
    return new Promise((resolve, reject) => {
      this.runAction(cc.sequence(
        cc.fadeOut(CONFIG.FADE_FAST_DURATION),
        cc.callFunc(() => {
          resolve();
        }),
      ));
    });
  },

  /* endregion TRANSITION */

});

UpgradeInstructionsLayer.create = function (layer) {
  return BaseLayer.create(layer || new UpgradeInstructionsLayer());
};

module.exports = UpgradeInstructionsLayer;
