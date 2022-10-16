// pragma PKGS: currency_reward
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const UtilsEngine = require('app/common/utils/utils_engine');
const i18next = require('i18next');
const audio_engine = require('../../../audio/audio_engine');
const RewardLayer = require('./RewardLayer');
const BaseSprite = require('../../nodes/BaseSprite');
const LensNoiseSprite = require('../../nodes/fx/LensNoiseSprite');
const FXWhiteCloudVignette = require('../../nodes/fx/FXWhiteCloudVignette');
const FXLensFlareSprite = require('../../nodes/fx/FXLensFlareSprite');
const ZodiacNode = require('../../nodes/draw/Zodiac');

/** **************************************************************************
 CurrencyRewardLayer
 *************************************************************************** */

const CurrencyRewardLayer = RewardLayer.extend({

  getRequiredResources() {
    return RewardLayer.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier('currency_reward'));
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

  animateReward(type, amount, title, subtitle, description) {
    return this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      // disable and reset continue
      this.disablePressToContinueAndHitboxesAndCallback();

      // Play sfx for this reward
      switch (type) {
      case 'gold':
        audio_engine.current().play_effect(RSX.sfx_gold_reward_long.audio, false);
        break;
      case 'spirit':
        audio_engine.current().play_effect(RSX.sfx_spirit_reward_long.audio, false);
        break;
      default:
        audio_engine.current().play_effect(RSX.sfx_gold_reward_long.audio, false);
        break;
      }

      amount = amount || 0;
      title = title || i18next.t('rewards.generic_reward_title');

      // anchor position for ui
      const centerAnchorPosition = cc.p(0, 50);
      const goldIconPosition = cc.p(centerAnchorPosition.x, centerAnchorPosition.y + 48);
      const labelPosition = cc.p(centerAnchorPosition.x, centerAnchorPosition.y - 50);

      // explosion particles
      const explosionParticles = cc.ParticleSystem.create(RSX.explosion.plist);
      explosionParticles.setPosition(centerAnchorPosition);
      this.addChild(explosionParticles);

      // bg shadow
      const bg_shadow = BaseSprite.create(RSX.gold_reward_bg_shadow.img);
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
      let glowringSpriteImage = null;
      switch (type) {
      case 'gold':
        glowringSpriteImage = RSX.gold_reward_glow_ring.img;
        break;
      case 'spirit':
        glowringSpriteImage = RSX.spirit_reward_glow_hex.img;
        break;
      default:
        glowringSpriteImage = RSX.gold_reward_glow_ring.img;
        break;
      }
      const glow_ring = LensNoiseSprite.create(glowringSpriteImage);
      glow_ring.setPosition(centerAnchorPosition);
      // glow_ring.setPosition(cc.p(centerAnchorPosition.x,0));
      glow_ring.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      glow_ring.setFlareAmount(0.0);
      this.addChild(glow_ring);

      // bg sprite
      let bgSpriteImage = null;
      switch (type) {
      case 'gold':
        bgSpriteImage = RSX.gold_reward_bg.img;
        break;
      case 'spirit':
        bgSpriteImage = RSX.spirit_reward_bg.img;
        break;
      default:
        bgSpriteImage = RSX.gold_reward_bg.img;
        break;
      }
      const bg = BaseSprite.create(bgSpriteImage);
      bg.setPosition(centerAnchorPosition);
      // start as anti-aliased and swap to aliased after animation is done
      bg.getTexture().setAntiAliasTexParameters();
      this.addChild(bg);

      // metal ring sprite
      let metal_ring = null;
      switch (type) {
      case 'gold':
        metal_ring = BaseSprite.create(RSX.gold_reward_metal_ring.img);
        metal_ring.setPosition(goldIconPosition);
        break;
      case 'spirit':
        metal_ring = BaseSprite.create(RSX.spirit_reward_metal_ring.img);
        metal_ring.setPosition(cc.p(centerAnchorPosition.x, centerAnchorPosition.y + 50));
        break;
      default:
        metal_ring = BaseSprite.create(RSX.gold_reward_metal_ring.img);
        metal_ring.setPosition(goldIconPosition);
        break;
      }
      // start as anti-aliased and swap to aliased after animation is done
      metal_ring.getTexture().setAntiAliasTexParameters();
      this.addChild(metal_ring);

      // gold icon sprite
      let currency_icon = null;
      switch (type) {
      case 'gold':
        currency_icon = BaseSprite.create(RSX.gold_reward_gold_icon.img);
        break;
      case 'spirit':
        goldIconPosition.y += 5;
        currency_icon = BaseSprite.create(RSX.spirit_reward_spirit_icon.img);
        break;
      default:
        currency_icon = BaseSprite.create(RSX.gold_reward_gold_icon.img);
        break;
      }
      currency_icon.setPosition(goldIconPosition);
      this.addChild(currency_icon);

      // gold AMOUNT # label
      const currency_amount_label = new cc.LabelTTF(amount.toString(), RSX.font_regular.name, 20, cc.size(48, 24), cc.TEXT_ALIGNMENT_CENTER);
      switch (type) {
      case 'gold':
        currency_amount_label.setFontFillColor({ r: 121, g: 66, b: 0 });
        currency_amount_label.setPosition(goldIconPosition);
        break;
      case 'spirit':
        currency_amount_label.setFontFillColor({ r: 28, g: 35, b: 57 });
        currency_amount_label.setPosition(goldIconPosition);
        break;
      default:
        currency_amount_label.setFontFillColor({ r: 255, g: 255, b: 255 });
        currency_amount_label.setPosition(goldIconPosition);
        break;
      }
      this.addChild(currency_amount_label);

      // white label below gold
      const currencyTypeLocalized = i18next.t(`common.currency_${type.toLowerCase()}`);
      const reward_label = new cc.LabelTTF(`+${amount.toString()} ${currencyTypeLocalized}`, RSX.font_light.name, 20, cc.size(300, 24), cc.TEXT_ALIGNMENT_CENTER);
      switch (type) {
      case 'gold':
        reward_label.setFontFillColor({ r: 247, g: 228, b: 154 });
        break;
      case 'spirit':
        reward_label.setFontFillColor({ r: 190, g: 252, b: 255 });
        break;
      default:
        reward_label.setFontFillColor({ r: 255, g: 255, b: 255 });
        break;
      }
      reward_label.setPosition(labelPosition);
      this.addChild(reward_label);

      // white label below gold
      const reward_description_label = new cc.LabelTTF(description, RSX.font_light.name, 16, cc.size(300, 30), cc.TEXT_ALIGNMENT_CENTER);
      reward_description_label.setFontFillColor({ r: 255, g: 255, b: 255 });
      reward_description_label.setPosition(cc.p(labelPosition.x, labelPosition.y - 35));
      this.addChild(reward_description_label);

      // animation code

      // start state
      bg_shadow.setOpacity(0);

      flare.setOpacity(0);

      bg.setOpacity(0);
      bg.setScale(0.8);

      metal_ring.setOpacity(0);
      metal_ring.setScale(1.2);

      currency_icon.setOpacity(0);
      currency_icon.setScale(1.2);

      glow_ring.setVisible(false);
      glow_ring.setScale(0.5);

      currency_amount_label.setOpacity(0);

      reward_label.setOpacity(0);
      reward_label.setScale(1.2);

      reward_description_label.setOpacity(0);
      reward_description_label.setScale(1.2);

      this.continueNode.setVisible(false);

      // animations
      flare.runAction(cc.sequence(
        cc.fadeIn(0.4).easing(cc.easeCubicActionOut()),
        cc.fadeOut(0.8).easing(cc.easeCubicActionOut()),
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
          // bg textures look best aliased at scales that are a multiple of 0.5
          bg.getTexture().setAliasTexParametersWhenSafeScale();
          metal_ring.getTexture().setAliasTexParametersWhenSafeScale();

          currency_icon.runAction(cc.fadeIn(0.1));
          currency_icon.runAction(cc.sequence(
            cc.scaleTo(0.1, 1.0),
            cc.callFunc(() => {
              currency_amount_label.runAction(cc.fadeIn(0.1));

              reward_label.runAction(cc.spawn(
                cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION),
                cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, 1.0),
              ));

              reward_description_label.runAction(cc.sequence(
                cc.delayTime(0.1),
                cc.spawn(
                  cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION),
                  cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, 1.0),
                ),
              ));

              this.showTitles(CONFIG.ANIMATE_FAST_DURATION, title, subtitle).then(() => {
                this.setIsContinueOnPressAnywhere(true);
                this.setIsInteractionEnabled(true);
                this.continueNode.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
              });
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

      metal_ring.runAction(cc.sequence(
        cc.delayTime(0.1),
        cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION),
        cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, 1.0),
      ));

      for (let i = 0; i < 4; i++) {
        const glyphSprite = BaseSprite.create(RSX.gold_reward_glyph.img);
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
        ));
      }
    });
  },

});

CurrencyRewardLayer.create = function (layer) {
  return RewardLayer.create(layer || new CurrencyRewardLayer());
};

module.exports = CurrencyRewardLayer;
