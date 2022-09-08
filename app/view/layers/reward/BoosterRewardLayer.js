// pragma PKGS: booster_reward
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const UtilsEngine = require('app/common/utils/utils_engine');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const Promise = require('bluebird');
const i18next = require('i18next');
const audio_engine = require('../../../audio/audio_engine');
const RewardLayer = require('./RewardLayer');
const BaseSprite = require('../../nodes/BaseSprite');
const LensNoiseSprite = require('../../nodes/fx/LensNoiseSprite');
const FXLensFlareSprite = require('../../nodes/fx/FXLensFlareSprite');
const FXFbmPolarFlareSprite = require('../../nodes/fx/FXFbmPolarFlareSprite');
const FXDissolveWithDiscFromCenterSprite = require('../../nodes/fx/FXDissolveWithDiscFromCenterSprite');
const FXWhiteCloudVignette = require('../../nodes/fx/FXWhiteCloudVignette');
const ZodiacNode = require('../../nodes/draw/Zodiac');
const TweenTypes = require('../../actions/TweenTypes');

/** **************************************************************************
 BoosterRewardLayer
 *************************************************************************** */

const BoosterRewardLayer = RewardLayer.extend({

  getRequiredResources() {
    return RewardLayer.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier('booster_reward'));
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

  animateReward(title, subtitle, cardSetId) {
    if (cardSetId == null) { cardSetId = SDK.CardSet.Core; }

    let orbResource;
    if (cardSetId == SDK.CardSet.Shimzar) {
      orbResource = RSX.shimzar_orb;
    } else if (cardSetId == SDK.CardSet.FirstWatch) {
      orbResource = RSX.firstwatch_orb;
    } else if (cardSetId == SDK.CardSet.Wartech) {
      orbResource = RSX.wartech_orb;
    } else if (cardSetId == SDK.CardSet.Coreshatter) {
      orbResource = RSX.fate_orb;
    } else {
      orbResource = RSX.orb;
    }
    const orbImg = orbResource.img;
    const orbRequestId = `spirit_orb_${cardSetId}_reward_${UtilsJavascript.generateIncrementalId()}`;
    this.addResourceRequest(orbRequestId, null, [orbResource]);

    return Promise.all([
      this.whenRequiredResourcesReady(),
      this.whenResourcesReady(orbRequestId),
    ])
      .spread((requestId, orbRequestId) => {
        if (!this.getAreResourcesValid(requestId) || !this.getAreResourcesValid(orbRequestId)) return; // load invalidated or resources changed

        // disable and reset continue
        this.disablePressToContinueAndHitboxesAndCallback();

        audio_engine.current().play_effect(RSX.sfx_spirit_orb_reward_long.audio, false);

        // anchor position for ui
        const centerAnchorPosition = cc.p(0, 50);
        const goldIconPosition = cc.p(centerAnchorPosition.x, centerAnchorPosition.y);
        const labelPosition = cc.p(centerAnchorPosition.x, centerAnchorPosition.y + 95);

        // bg shadow
        const bg_shadow = new BaseSprite(RSX.booster_reward_bg_shadow.img);
        bg_shadow.setPosition(centerAnchorPosition);
        this.addChild(bg_shadow);

        // lens flare that highlights from below
        const flare = FXLensFlareSprite.create();
        flare.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
        flare.setScale(9.0);
        flare.setPulseRate(0.0);
        flare.setSpeed(2.0);
        flare.setWispSize(0.3);
        flare.setArmLength(0.2);
        flare.setPosition(centerAnchorPosition);
        this.addChild(flare);

        // glow ring sprite
        const glow_ring = LensNoiseSprite.create(RSX.gold_reward_glow_ring.img);
        glow_ring.setPosition(centerAnchorPosition);
        // glow_ring.setPosition(cc.p(centerAnchorPosition.x,0));
        glow_ring.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
        glow_ring.setFlareAmount(0.0);
        this.addChild(glow_ring);

        // bg sprite
        const bgSpriteImage = RSX.booster_reward_bg.img;
        const bg = new BaseSprite(bgSpriteImage);
        bg.setPosition(centerAnchorPosition);
        // bg.getTexture().setAliasTexParametersWhenSafeScale();
        this.addChild(bg);

        // gold flaring
        const polarFlare = FXFbmPolarFlareSprite.create();
        polarFlare.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
        polarFlare.setTextureRect(cc.rect(0, 0, 256, 256));
        polarFlare.setAnchorPoint(cc.p(0.5, 0.5));
        polarFlare.setPosition(goldIconPosition);
        this.addChild(polarFlare, 0);

        // orb dissolve-in sprite
        const orbDissolve = FXDissolveWithDiscFromCenterSprite.create(orbImg);
        orbDissolve.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
        orbDissolve.setScale(1.0);
        orbDissolve.setAnchorPoint(cc.p(0.5, 0.5));
        orbDissolve.setPosition(goldIconPosition);
        this.addChild(orbDissolve, 0);

        // orb sprite
        const orb_icon = BaseSprite.create(orbImg);
        orb_icon.setScale(1.0);
        orb_icon.setPosition(goldIconPosition);
        orb_icon.getTexture().setAntiAliasTexParameters();
        this.addChild(orb_icon);

        // white label below gold
        let orbDescriptor = `+1 ${i18next.t('card_sets.core_set_name_short')} ${i18next.t('common.spirit_orb')}`;
        if (cardSetId == SDK.CardSet.Shimzar) {
          orbDescriptor = `+1 ${i18next.t('card_sets.shimzar_set_name_short')} ${i18next.t('common.spirit_orb')}`;
        } else if (cardSetId == SDK.CardSet.FirstWatch) {
          orbDescriptor = `+1 ${i18next.t('card_sets.firstwatch_set_name_short')} ${i18next.t('common.spirit_orb')}`;
        } else if (cardSetId == SDK.CardSet.Wartech) {
          orbDescriptor = `+1 ${i18next.t('card_sets.wartech_set_name_short')} ${i18next.t('common.spirit_orb')}`;
        } else if (cardSetId == SDK.CardSet.Coreshatter) {
          orbDescriptor = '+1 ' + 'Mythron' + ` ${i18next.t('common.spirit_orb')}`;
        }

        const reward_label = new cc.LabelTTF(orbDescriptor, RSX.font_light.name, 20, cc.size(300, 24), cc.TEXT_ALIGNMENT_CENTER);
        reward_label.setFontFillColor({ r: 255, g: 255, b: 255 });
        reward_label.setPosition(labelPosition);
        this.addChild(reward_label);

        // white label below gold
        const reward_description_label = new cc.LabelTTF(i18next.t('rewards.spirit_orb_reward_info'), RSX.font_light.name, 15, cc.size(200, 92), cc.TEXT_ALIGNMENT_CENTER);
        reward_description_label.setFontFillColor({ r: 255, g: 255, b: 255 });
        reward_description_label.setPosition(cc.p(labelPosition.x, centerAnchorPosition.y - 125));
        this.addChild(reward_description_label);

        // animation code

        // start state
        bg_shadow.setOpacity(0);

        flare.setOpacity(0);

        bg.setOpacity(0);
        bg.setScale(0.8);

        polarFlare.setVisible(false);

        orb_icon.setOpacity(0);

        glow_ring.setVisible(false);
        glow_ring.setScale(0.5);

        reward_label.setOpacity(0);
        reward_label.setScale(1.2);

        reward_description_label.setOpacity(0);
        reward_description_label.setScale(1.2);

        this.continueNode.setVisible(false);

        // animations
        flare.runAction(cc.sequence(
          cc.EaseCubicActionIn.create(cc.fadeIn(0.4)),
          cc.EaseCubicActionOut.create(cc.fadeOut(0.8)),
          cc.callFunc(() => {
            flare.setVisible(false);
            flare.destroy();
          }),
        ));

        bg_shadow.runAction(cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION));
        bg_shadow.runAction(cc.moveBy(CONFIG.ANIMATE_FAST_DURATION, cc.p(0, -20)));

        bg.runAction(cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION));
        bg.runAction(cc.sequence(
          cc.EaseBackOut.create(cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, 1.0)),
          cc.callFunc(() => {
            polarFlare.setVisible(true);
            orb_icon.setTint(new cc.Color(255, 255, 255, 255));

            orbDissolve.runAction(cc.actionTween(1.5, 'phase', 0.0, 1.0));
            polarFlare.runAction(cc.sequence(
              cc.actionTween(0.5, 'phase', 0.01, 1.0),
              cc.delayTime(0.75),
              cc.targetedAction(orb_icon, cc.fadeIn(0.1)),
              cc.targetedAction(orbDissolve, cc.fadeOut(0.1)),
              cc.callFunc(() => {
                //
                orbDissolve.setVisible(false);
                orbDissolve.destroy();

                // show reveal
                orb_icon.runAction(cc.actionTween(0.3, TweenTypes.TINT_FADE, 255.0, 0.0).easing(cc.easeIn(3.0)));

                // fade text in
                reward_label.runAction(cc.spawn(
                  cc.delayTime(0.2),
                  cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION),
                  cc.scaleTo(CONFIG.ANIMATE_SLOW_DURATION, 1.0).easing(cc.easeExponentialOut(3.0)),
                ));

                reward_description_label.runAction(cc.sequence(
                  cc.delayTime(0.3),
                  cc.spawn(
                    cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION),
                    cc.scaleTo(CONFIG.ANIMATE_SLOW_DURATION, 1.0).easing(cc.easeExponentialOut(3.0)),
                  ),
                ));

                this.showTitles(CONFIG.ANIMATE_FAST_DURATION, title, subtitle).then(() => {
                  this.setIsContinueOnPressAnywhere(true);
                  this.setIsInteractionEnabled(true);
                  this.continueNode.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
                });
              }),
              cc.delayTime(0.1),
              cc.actionTween(0.5, 'phase', 1.0, 0.01),
              cc.fadeOut(0.1),
              cc.callFunc(() => {
                polarFlare.destroy();
              }),
            ));
          }),
        ));

        glow_ring.runAction(cc.sequence(
          cc.delayTime(0.1),
          cc.callFunc(() => {
            glow_ring.setVisible(true);
          }),
          cc.EaseBackOut.create(cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, 1.0)),
          cc.EaseBackOut.create(cc.actionTween(1.0, 'flareAmount', 0.0, 1.0)),
        ));

        for (let i = 0; i < 4; i++) {
          var glyphSprite = new BaseSprite(RSX.gold_reward_glyph.img);
          glyphSprite.setScale(0.5);
          this.addChild(glyphSprite);

          let offset = 0;
          let moveByX = 0;
          if (i < 2) {
            offset = -(300 + i * 150);
            moveByX = -40;
          } else {
            offset = 100 + (i - 1) * 150;
            moveByX = 40;
          }

          glyphSprite.setPosition(cc.p(centerAnchorPosition.x + offset, centerAnchorPosition.y));
          glyphSprite.runAction(cc.spawn(
            cc.fadeIn(0.4),
            cc.scaleTo(0.8, 1.0).easing(cc.easeCubicActionOut()),
            cc.moveBy(0.8, cc.p(moveByX, 0)).easing(cc.easeCubicActionOut()),
            cc.callFunc(() => {
              glyphSprite.getTexture().setAliasTexParametersWhenSafeScale();
            }),
          ));
        }
      });
  },

});

BoosterRewardLayer.create = function (layer) {
  return RewardLayer.create(layer || new BoosterRewardLayer());
};

module.exports = BoosterRewardLayer;
