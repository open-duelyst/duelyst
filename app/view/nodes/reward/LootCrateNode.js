// pragma PKGS: loot_crate

const SDK = require('app/sdk');
const CONFIG = require('app/common/config');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const Logger = require('app/common/logger');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const audio_engine = require('app/audio/audio_engine');
const UtilsEngine = require('app/common/utils/utils_engine');
const BaseSprite = require('app/view/nodes/BaseSprite');
const BaseLabel = require('app/view/nodes/BaseLabel');
const FXLensFlareSprite = require('app/view/nodes/fx/FXLensFlareSprite');
const FXRarityFlareSprite = require('app/view/nodes/fx/FXRarityFlareSprite');
const FigureEight = require('app/view/actions/FigureEight');
const Shake = require('app/view/actions/Shake');
const CardNode = require('app/view/nodes/cards/CardNode');
const TicketNode = require('app/view/nodes/arena/TicketNode');
const FXFbmPolarFlareSprite = require('app/view/nodes/fx/FXFbmPolarFlareSprite');
const FXFbmPolarFlareWipeSprite = require('app/view/nodes/fx/FXFbmPolarFlareWipeSprite');
const FXDissolveWithDiscFromCenterSprite = require('app/view/nodes/fx/FXDissolveWithDiscFromCenterSprite');
const BaseParticleSystem = require('app/view/nodes/BaseParticleSystem');
const TweenTypes = require('app/view/actions/TweenTypes');
const GlowSprite = require('app/view/nodes/GlowSprite');
const ZodiacNode = require('app/view/nodes/draw/Zodiac');
const FXGlowImageMap = require('app/view/nodes/fx/FXGlowImageMap');
const Promise = require('bluebird');
const i18next = require('i18next');
const moment = require('moment');
const KeyRewardNode = require('./KeyRewardNode');
const CardBackRewardNode = require('./CardBackRewardNode');
const CardSkinRewardNode = require('./CardSkinRewardNode');
const CosmeticRewardNode = require('./CosmeticRewardNode');
const EmoteRewardNode = require('./EmoteRewardNode');
const SpiritOrbRewardNode = require('./SpiritOrbRewardNode');
const CurrencyRewardNode = require('./CurrencyRewardNode');

const LOOT_CRATE_REWARD_SFX = [
  RSX.sfx_loot_crate_card_reward_reveal_0,
  RSX.sfx_loot_crate_card_reward_reveal_1,
  RSX.sfx_loot_crate_card_reward_reveal_2,
  RSX.sfx_loot_crate_card_reward_reveal_3,
  RSX.sfx_loot_crate_card_reward_reveal_4,
];

/** **************************************************************************
 LootCrateNode
 - abstract base class for loot crates (do not use this class directly)
 *************************************************************************** */

const LootCrateNode = cc.Node.extend({

  _crateTypeLabel: null,
  _crateCountLabel: null,
  _crateMaxCountLabel: null,
  _crateDescriptionLabel: null,
  _delayBetweenRewardShowAnimations: CONFIG.ANIMATE_MEDIUM_DURATION, // Time to delay each reward show animation
  _expirationInstructionLabel: null,
  _expirationLabel: null,
  _expirationUpdateInterval: null,
  _flareBehindCrate: null, // flare behind loot crate
  _glowImageMap: null,
  _idleParticles: null, // Idle particles that exist behind the loot crate
  _idleParticles2: null, // Idle particles that exist behind the loot crate
  _isGlowing: false,
  _layoutRewardsInCircle: false, // Whether to layout rewards in circle or rows, defaults to true
  _lootCrateContainerNode: null, // container node for all loot crate parts
  _lootCrateBackLeftSprite: null,
  _lootCrateBackRightSprite: null,
  _lootCrateBottomSprite: null,
  _lootCrateSphereSprite: null,
  _lootCrateFrontLeftSprite: null,
  _lootCrateFrontRightSprite: null,
  _lootCrateTopSprite: null,
  _mouseOverRewardNode: null,
  _repeatingFigureEightAction: null,
  _rewardsModels: null, // Backbone models passed in constructor
  _rewardsData: null, // Array of awards after being process out of models
  _rewardTargetPositions: null, // Final positions of each reward node
  _rewardNodes: null,
  _rewardAnimationPromiseCallbacks: null,
  _rewardZodiacs: null,
  _showExcitedStatePromise: null,
  _showIdleStatePromise: null,
  _showStaticStatePromise: null,
  _zOrderLabels: -2,
  _zOrderBehindCrate: -1,
  _zOrderCrate: 0,
  _zOrderInfrontOfCrate: 1,
  _zOrderRewards: 2,
  _reduceDescriptionSpacing: false,

  /* region INITIALIZE */

  /**
   * ctor
   * @public
   * @param {Object} [options=null] options including: rewardsModels (array) and layoutRewardsInCircle (boolean)
   */
  ctor(options) {
    cc.Node.prototype.ctor.call(this);

    if (options != null) {
      this.setRewardsModels(options.rewardsModels, options.layoutRewardsInCircle);
    }

    this.setAnchorPoint(0.5, 0.5);

    // set content size immediately
    // otherwise content size will not be set until assets load
    // which could cause values that use content size to be incorrect
    this.setContentSize(CONFIG.CRATE_SIZE);

    // build crate
    this._constructCrateSprites();
  },

  destroy(duration) {
    cc.Node.prototype.destroy.call(this, duration);

    this.stopUpdateCrateExpiration();
  },

  /**
   * Helper - Constructs the pieces of the loot crate and adds them to the root node
   * @private
   */
  _constructCrateSprites() {
    return this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      this._lootCrateContainerNode = new cc.Node();
      this.addChild(this._lootCrateContainerNode, this._zOrderCrate);

      // BACK LEFT
      this._lootCrateBackLeftSprite = BaseSprite.create(this._getLootCrateBackLeftSpriteIdentifier());
      this._lootCrateContainerNode.addChild(this._lootCrateBackLeftSprite);

      // BACK RIGHT
      this._lootCrateBackRightSprite = BaseSprite.create(this._getLootCrateBackRightSpriteIdentifier());
      this._lootCrateContainerNode.addChild(this._lootCrateBackRightSprite);

      // BOTTOM
      this._lootCrateBottomSprite = BaseSprite.create(this._getLootCrateBottomSpriteIdentifier());
      this._lootCrateContainerNode.addChild(this._lootCrateBottomSprite);

      // SPHERE
      this._lootCrateSphereSprite = BaseSprite.create(this._getLootCrateSphereSpriteIdentifier());
      this._lootCrateContainerNode.addChild(this._lootCrateSphereSprite);

      // FRONT RIGHT
      this._lootCrateFrontRightSprite = BaseSprite.create(this._getLootCrateFrontRightSpriteIdentifier());
      this._lootCrateContainerNode.addChild(this._lootCrateFrontRightSprite);

      // FRONT LEFT
      this._lootCrateFrontLeftSprite = BaseSprite.create(this._getLootCrateFrontLeftSpriteIdentifier());
      this._lootCrateContainerNode.addChild(this._lootCrateFrontLeftSprite);

      // TOP
      this._lootCrateTopSprite = BaseSprite.create(this._getLootCrateTopSpriteIdentifier());
      this._lootCrateContainerNode.addChild(this._lootCrateTopSprite);

      const centerPosition = this.getCenterPosition();
      this._lootCrateContainerNode.setPosition(centerPosition);

      // RARITY FLARE BEHIND
      this._flareBehindCrate = new FXRarityFlareSprite();
      this._flareBehindCrate.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      this._flareBehindCrate.setVisible(false);
      this._flareBehindCrate.setScale(10.0);
      this._flareBehindCrate.setScaleY(5.0);
      this._flareBehindCrate.setPosition(centerPosition);
      this.addChild(this._flareBehindCrate, this._zOrderBehindCrate);

      this._idleParticles = BaseParticleSystem.create(RSX.loot_crate_idle_particles.plist);
      this._idleParticles.setPosition(centerPosition.x + 50.0, centerPosition.y);
      this._idleParticles.stopSystem();
      this.addChild(this._idleParticles, this._zOrderBehindCrate);

      this._idleParticles2 = BaseParticleSystem.create(RSX.loot_crate_idle_particles.plist);
      this._idleParticles2.setPosition(centerPosition.x - 50.0, centerPosition.y);
      this._idleParticles2.setRotation(180);
      this._idleParticles2.stopSystem();
      this.addChild(this._idleParticles2, this._zOrderBehindCrate);

      // explosion flare
      this.flare = FXLensFlareSprite.create();
      this.flare.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      this.flare.setPosition(centerPosition);
      this.flare.setScale(2.0);
      this.flare.setPulseRate(0.0);
      this.flare.setSpeed(2.0);
      this.flare.setWispSize(0.2);
      this.flare.setAnchorPoint(cc.p(0.5, 0.5));
      this.flare.setVisible(false);
      this.addChild(this.flare, this._zOrderInfrontOfCrate);
    });
  },

  /* endregion INITIALIZE */

  /* region GETTERS / SETTERS */

  _getLootCrateSphereSpriteIdentifier() {
    return null;
  },
  _getLootCrateFrontLeftSpriteIdentifier() {
    return null;
  },
  _getLootCrateFrontRightSpriteIdentifier() {
    return null;
  },
  _getLootCrateTopSpriteIdentifier() {
    return null;
  },
  _getLootCrateBottomSpriteIdentifier() {
    return null;
  },
  _getLootCrateBackLeftSpriteIdentifier() {
    return null;
  },
  _getLootCrateBackRightSpriteIdentifier() {
    return null;
  },
  _getLootCrateGlowSpriteIdentifier() {
    return null;
  },

  getCrateType() {
    // override in subclass to return crate type
    return 0;
  },

  getCrateCount() {
    // override in subclass to return crate count
    return 0;
  },

  getCrateKeyCount() {
    // override in subclass to return crate key count
    return 0;
  },

  getUsesKeys() {
    return false;
  },

  /* endregion GETTERS / SETTERS */

  /* region LABELS */

  showCrateTypeLabel(duration, fontName, fontSize, fontColor) {
    if (fontName == null) { fontName = RSX.font_light.name; }
    if (fontSize == null) { fontSize = 20; }
    if (this._crateTypeLabel == null) {
      const lootCrateType = this.getCrateType();
      const crateLabel = i18next.t('mystery_crates.crate_type_label', { crate_type: SDK.CosmeticsFactory.nameForCosmeticChestType(lootCrateType) });
      this._crateTypeLabel = new cc.LabelTTF(crateLabel, fontName, fontSize, null, cc.TEXT_ALIGNMENT_CENTER);
      this.addChild(this._crateTypeLabel, this._zOrderLabels);
    } else {
      this._crateTypeLabel.setFontName(fontName);
      this._crateTypeLabel.setFontSize(fontSize);
    }
    if (fontColor != null) {
      this._crateTypeLabel.setFontFillColor(fontColor);
    }
    this._crateTypeLabel.setPosition(this.getCrateTypeLabelBasePosition());

    if (duration != null && duration > 0.0) {
      this._crateTypeLabel.setOpacity(0.0);
      this._crateTypeLabel.setVisible(false);
      this._crateTypeLabel.fadeTo(duration, 255.0);
    }
  },

  getCrateTypeLabel() {
    return this._crateTypeLabel;
  },

  getCrateTypeLabelBasePosition() {
    const contentSize = this.getContentSize();
    const centerPosition = this.getCenterPosition();
    return cc.p(centerPosition.x, centerPosition.y + contentSize.height * 0.5 + 140.0);
  },

  showCrateCountLabel(duration, fontName, fontSize, fontColor) {
    if (fontName == null) { fontName = RSX.font_bold.name; }
    if (fontSize == null) { fontSize = 40; }
    if (this._crateCountLabel == null) {
      this._crateCountLabel = new cc.LabelTTF(`${this.getCrateCount()}`, fontName, fontSize, null, cc.TEXT_ALIGNMENT_CENTER);
      this.addChild(this._crateCountLabel, this._zOrderLabels);
    } else {
      this._crateCountLabel.setFontName(fontName);
      this._crateCountLabel.setFontSize(fontSize);
    }
    if (fontColor != null) {
      this._crateCountLabel.setFontFillColor(fontColor);
    }
    this._crateCountLabel.setPosition(this.getCrateCountLabelBasePosition());

    if (duration != null && duration > 0.0) {
      this._crateCountLabel.setOpacity(0.0);
      this._crateCountLabel.setVisible(false);
      this._crateCountLabel.fadeTo(duration, 255.0);
    }
  },

  showCrateExpirationLabel(duration, fontName, fontSize, fontColor) {
    if (fontName == null) { fontName = RSX.font_regular.name; }
    if (fontSize == null) { fontSize = 32; }
    if (this._expirationLabel == null) {
      this._expirationLabel = new cc.LabelTTF('', fontName, fontSize, null, cc.TEXT_ALIGNMENT_CENTER);
      this.addChild(this._expirationLabel, this._zOrderLabels);
    } else {
      this._expirationLabel.setFontName(fontName);
      this._expirationLabel.setFontSize(fontSize);
    }
    if (fontColor != null) {
      this._expirationLabel.setFontFillColor(fontColor);
    } else {
      this._expirationLabel.setFontFillColor(cc.color(194, 203, 220));
    }
    this._expirationLabel.setPosition(this.getCrateExpirationLabelBasePosition());

    if (duration != null && duration > 0.0) {
      this._expirationLabel.setOpacity(0.0);
      this._expirationLabel.setVisible(false);
      this._expirationLabel.fadeTo(duration, 255.0);
    }

    // also show instruction label
    this.showCrateExpirationInstructionLabel(duration);
  },

  showCrateExpirationInstructionLabel(duration, fontName, fontSize, fontColor) {
    if (fontName == null) { fontName = RSX.font_regular.name; }
    if (fontSize == null) { fontSize = 12; }
    if (this._expirationInstructionLabel == null) {
      this._expirationInstructionLabel = new cc.LabelTTF(i18next.t('mystery_crates.crate_expires_in_label'), fontName, fontSize, null, cc.TEXT_ALIGNMENT_CENTER);
      this.addChild(this._expirationInstructionLabel, this._zOrderLabels);
    } else {
      this._expirationInstructionLabel.setFontName(fontName);
      this._expirationInstructionLabel.setFontSize(fontSize);
    }
    if (fontColor != null) {
      this._expirationInstructionLabel.setFontFillColor(fontColor);
    } else {
      this._expirationInstructionLabel.setFontFillColor(cc.color(194, 203, 220));
    }
    this._expirationInstructionLabel.setPosition(
      this.getCrateExpirationLabelBasePosition().x,
      this.getCrateExpirationLabelBasePosition().y + 30,
    );

    if (duration != null && duration > 0.0) {
      this._expirationInstructionLabel.setOpacity(0.0);
      this._expirationInstructionLabel.setVisible(false);
      this._expirationInstructionLabel.fadeTo(duration, 255.0);
    }
  },

  // Also removes crate expiration instruction label
  hideCrateExpirationLabel(duration) {
    if (this._expirationLabel != null) {
      this._expirationLabel.fadeToInvisible(duration);
    }
    if (this._expirationInstructionLabel != null) {
      this._expirationInstructionLabel.fadeToInvisible(duration);
    }
  },

  updateCrateExpiration() {
    const crateExpirationMoment = this.getCrateExpirationTime();
    if (this._expirationLabel != null && crateExpirationMoment != null) {
      const momentNowUtc = moment.utc();
      const durationLeft = moment.duration(crateExpirationMoment.valueOf() - momentNowUtc.valueOf());
      const daysRemaining = durationLeft.days();
      let hoursRemaining = durationLeft.hours();
      const minutesRemaining = durationLeft.minutes();
      let minutesRemainingString = `${minutesRemaining}`;
      if (minutesRemaining < 10) minutesRemainingString = `0${minutesRemainingString}`;
      const secondsRemaining = durationLeft.seconds();
      let secondsRemainingString = `${secondsRemaining}`;
      if (secondsRemaining < 10) secondsRemainingString = `0${secondsRemainingString}`;

      hoursRemaining += (daysRemaining * 24);

      this._expirationLabel.setString(`${hoursRemaining}:${minutesRemainingString}:${secondsRemainingString}`);
    }

    if (crateExpirationMoment == null) {
      this.stopUpdateCrateExpiration();
      this.hideCrateExpirationLabel();
    }
  },

  getCrateExpirationTime() {
    if (this.getCrateType() == SDK.CosmeticsChestTypeLookup.Boss) {
      return CrateManager.getInstance().getNextBossCrateExpirationMoment();
    }
    return null;
  },

  beginUpdateCrateExpiration() {
    // Make sure there isn't two running:
    this.stopUpdateCrateExpiration();

    this._expirationUpdateInterval = setInterval(this.updateCrateExpiration.bind(this), 1000);
  },

  stopUpdateCrateExpiration() {
    if (this._expirationUpdateInterval != null) {
      clearInterval(this._expirationUpdateInterval);
      this._expirationUpdateInterval = null;
    }
  },

  getCrateExpirationLabelBasePosition() {
    const contentSize = this.getContentSize();
    const centerPosition = this.getCenterPosition();
    return cc.p(centerPosition.x, centerPosition.y - contentSize.height * 0.5 - 155.0);
  },

  getCrateCountLabel() {
    return this._crateCountLabel;
  },

  getCrateCountLabelBasePosition() {
    const position = this.getCrateTypeLabelBasePosition();
    position.x += 10.0;
    position.y += -40.0;
    return position;
  },

  showCrateMaxCountLabel(duration, fontName, fontSize, fontColor) {
    if (fontName == null) { fontName = RSX.font_light.name; }
    if (fontSize == null) { fontSize = 20; }
    if (fontColor == null) { fontColor = { r: 194, g: 203, b: 220 }; }
    if (this._crateMaxCountLabel == null) {
      this._crateMaxCountLabel = new cc.LabelTTF('', fontName, fontSize, null, cc.TEXT_ALIGNMENT_CENTER);
      this.addChild(this._crateMaxCountLabel, this._zOrderLabels);
    } else {
      this._crateMaxCountLabel.setFontName(fontName);
      this._crateMaxCountLabel.setFontSize(fontSize);
    }
    this._crateMaxCountLabel.setFontFillColor(fontColor);
    this._crateMaxCountLabel.setPosition(this.getCrateMaxCountLabelBasePosition());

    if (duration != null && duration > 0.0) {
      this._crateMaxCountLabel.setOpacity(0.0);
      this._crateMaxCountLabel.setVisible(false);
      this._crateMaxCountLabel.fadeTo(duration, 255.0);
    }
  },

  getCrateMaxCountLabel() {
    return this._crateMaxCountLabel;
  },

  getCrateMaxCountLabelBasePosition() {
    const position = this.getCrateCountLabelBasePosition();
    position.x += -26.0;
    return position;
  },

  showCrateDescriptionLabel(duration, fontName, fontSize, fontColor, contentSize, labelText) {
    if (fontName == null) { fontName = RSX.font_light.name; }
    if (fontSize == null) { fontSize = 16; }
    if (fontColor == null) { fontColor = { r: 220, g: 220, b: 220 }; }
    if (contentSize == null) { contentSize = cc.size(350, 0); }
    if (this._crateDescriptionLabel == null) {
      const lootCrateType = this.getCrateType();
      this._crateDescriptionLabel = new BaseLabel(labelText || SDK.CosmeticsFactory.descriptionForCosmeticChestType(lootCrateType), fontName, fontSize, contentSize, cc.TEXT_ALIGNMENT_LEFT);
      this.addChild(this._crateDescriptionLabel, this._zOrderLabels);
    } else {
      this._crateDescriptionLabel.setFontName(fontName);
      this._crateDescriptionLabel.setFontSize(fontSize);
    }
    this._crateDescriptionLabel.setFontFillColor(fontColor);
    this._crateDescriptionLabel.setPosition(this.getCrateDescriptionLabelBasePosition());

    if (duration != null && duration > 0.0) {
      this._crateDescriptionLabel.setOpacity(0.0);
      this._crateDescriptionLabel.setVisible(false);
      this._crateDescriptionLabel.fadeTo(duration, 255.0);
    }
  },

  getCrateDescriptionLabel() {
    return this._crateDescriptionLabel;
  },

  getCrateDescriptionLabelBasePosition() {
    const contentSize = this.getContentSize();
    const centerPosition = this.getCenterPosition();
    const descriptionLabelContentSize = (this._crateDescriptionLabel && this._crateDescriptionLabel.getContentSize()) || cc.size(0, 0);
    if (this.getReducedDescriptionSpacing()) {
      return cc.p(centerPosition.x + contentSize.width * 0.5 + descriptionLabelContentSize.width * 0.5, centerPosition.y);
    }
    return cc.p(centerPosition.x + contentSize.width + descriptionLabelContentSize.width * 0.5, centerPosition.y);
  },

  /* endregion LABELS */

  /* region RESOURCES */

  /**
   * Returns a list of resource objects this node uses.
   * @returns {Array}
   */
  getRequiredResources() {
    return cc.Node.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier('loot_crate'));
  },

  /* endregion RESOURCES */

  /* region SCENE */

  onEnter() {
    this._super();
    this._startListeningToEvents();
  },

  onExit() {
    this._stopListeningToEvents();
    this._super();
  },

  /* endregion SCENE */

  setReducedDescriptionSpacing(reducedDescriptionSpacing) {
    this._reduceDescriptionSpacing = reducedDescriptionSpacing;
  },

  getReducedDescriptionSpacing() {
    return this._reduceDescriptionSpacing;
  },

  /* region REWARDS */

  /**
   * Sets up the rewards to be shown, should only be called once
   * @public
   * @param {Array of backbone models} rewardsModels - represents the rewards to be displayed
   * @param {Boolean} [layoutRewardsInCircle=true}
   * @returns {Promise}
   */
  setRewardsModels(rewardsModels, layoutRewardsInCircle) {
    if (rewardsModels != null) {
      if (this._rewardsModels != null) {
        console.warn('LootCrateNode:setRewardsModels - reward models already set');
      }

      this._rewardsModels = rewardsModels;
      this._layoutRewardsInCircle = layoutRewardsInCircle == null ? false : layoutRewardsInCircle;

      return this.whenRequiredResourcesReady().then((requestId) => {
        if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed
        this._mapRewardsModels(rewardsModels);
      });
    }
  },

  /**
   * (Helper) Processes the reward models into the desired nodes and calculates animation values
   * @public
   * @param {Array of backbone models or data objects} rewardsModels - represents the rewards to be displayed
   */
  _mapRewardsModels(rewardsModels) {
    // reset rewards data
    this._rewardsData = [];
    if (rewardsModels != null && rewardsModels.length > 0) {
      // Pull apart the season rewards
      // save the currency rewards to insert into the middle
      for (var i = 0; i < rewardsModels.length; i++) {
        const rewardModel = rewardsModels[i];

        if (rewardModel.cosmetic_id || rewardModel.get && rewardModel.get('cosmetic_id')) {
          // cosmetic
          const cosmeticId = rewardModel.cosmetic_id || rewardModel.get && rewardModel.get('cosmetic_id');
          const cosmeticData = SDK.CosmeticsFactory.cosmeticForIdentifier(cosmeticId);
          if (cosmeticData != null) {
            const cosmeticTypeId = cosmeticData.typeId;
            var cosmeticRewardData;
            if (cosmeticTypeId === SDK.CosmeticsTypeLookup.Emote) {
              cosmeticRewardData = { emoteId: cosmeticData.id };
            } else if (cosmeticTypeId === SDK.CosmeticsTypeLookup.ProfileIcon) {
              cosmeticRewardData = { profileIconId: cosmeticData.id };
            } else if (cosmeticTypeId === SDK.CosmeticsTypeLookup.CardSkin) {
              cosmeticRewardData = { cardSkinId: cosmeticData.id };
            } else if (cosmeticTypeId === SDK.CosmeticsTypeLookup.CardBack) {
              cosmeticRewardData = { cardBackId: cosmeticData.id };
            } else if (cosmeticTypeId === SDK.CosmeticsTypeLookup.BattleMap) {
              cosmeticRewardData = { battleMapId: cosmeticData.id };
            } else if (cosmeticTypeId === SDK.CosmeticsTypeLookup.Scene) {
              cosmeticRewardData = { sceneId: cosmeticData.id };
            }

            if (cosmeticRewardData != null) {
              // check for cosmetic converted to spirit
              if (rewardModel.spirit || rewardModel.get && rewardModel.get('spirit')) {
                var spirit = rewardModel.spirit || rewardModel.get && rewardModel.get('spirit');
                cosmeticRewardData.convertedToSpirit = spirit;
              }

              this._rewardsData.push(cosmeticRewardData);
            }
          }
        } else if (rewardModel.gold || rewardModel.get && rewardModel.get('gold')) {
          // Gold
          const gold = rewardModel.gold || rewardModel.get && rewardModel.get('gold');
          this._rewardsData.push({ gold });
        } else if (rewardModel.spirit || rewardModel.get && rewardModel.get('spirit')) {
          // Spirit
          var spirit = rewardModel.spirit || rewardModel.get && rewardModel.get('spirit');
          this._rewardsData.push({ spirit });
        } else if (rewardModel.card_id || rewardModel.get && rewardModel.get('card_id')) {
          // Individual card id
          const card_id = rewardModel.card_id || rewardModel.get && rewardModel.get('card_id');
          this._rewardsData.push({ cardId: card_id });
        } else if (rewardModel.cards || rewardModel.get && rewardModel.get('cards')) {
          // Card ids array
          const cards = rewardModel.cards || rewardModel.get && rewardModel.get('cards');
          for (var j = 0; j < cards.length; j++) {
            const cardId = cards[j];
            this._rewardsData.push({ cardId });
          }
        } else if (rewardModel.spirit_orbs || rewardModel.get && rewardModel.get('spirit_orbs')) {
          // Spirit orbs
          const spirit_orbs = rewardModel.spirit_orbs || rewardModel.get && rewardModel.get('spirit_orbs');
          if (_.isArray(spirit_orbs)) {
            for (var j = 0; j < spirit_orbs.length; j++) {
              this._rewardsData.push({ spirit_orbs: spirit_orbs[j] });
            }
          } else {
            this._rewardsData.push({ spirit_orbs });
          }
        } else if (rewardModel.arena_tickets || rewardModel.get && rewardModel.get('arena_tickets')) {
          // Gauntlet tickets
          const arena_tickets = rewardModel.arena_tickets || rewardModel.get && rewardModel.get('arena_tickets');
          this._rewardsData.push({ gauntletTickets: arena_tickets });
        } else if (rewardModel.gauntlet_tickets || rewardModel.get && rewardModel.get('gauntlet_tickets')) {
          // Gauntlet tickets
          const gauntlet_tickets = rewardModel.gauntlet_tickets || rewardModel.get && rewardModel.get('gauntlet_tickets');
          this._rewardsData.push({ gauntletTickets: gauntlet_tickets });
        } else if (rewardModel.chest_key || rewardModel.get && rewardModel.get('chest_key')) {
          // chest keys
          const chest_key_type = rewardModel.chest_key || rewardModel.get && rewardModel.get('chest_key');
          this._rewardsData.push({ keyType: chest_key_type });
        } else if (rewardModel.cosmetic_keys || rewardModel.get && rewardModel.get('cosmetic_keys')) {
          // chest keys
          _.each(rewardModel.cosmetic_keys || rewardModel.get('cosmetic_keys'), (key) => {
            this._rewardsData.push({ keyType: key });
          });
        } else {
          // Shouldn't reach here
          console.error(`EndOfSeasonLayer:animateReward - Reward model with no recognizable reward type - ${_.keys(rewardModel)}`);
        }
      }
    }

    // randomize reward order
    this._rewardsData = _.shuffle(this._rewardsData);

    // Prepare reward positions
    const centerPosition = this.getCenterPosition();
    if (this._layoutRewardsInCircle) {
      if (this._rewardsData.length == 1) {
        this._rewardTargetPositions = [centerPosition];
      } else if (this._rewardsData.length == 2) {
        this._rewardTargetPositions = [
          cc.p(centerPosition.x - 200, centerPosition.y),
          cc.p(centerPosition.x + 200, centerPosition.y),
        ];
      } else if (this._rewardsData.length > 2) {
        // Radial ditance discribes how far from the center each reward node will be
        const horizontalRadialDistance = 325;
        const verticalRadialDistance = 200;
        const scaleRadiusX = 1.0;
        const scaleRadiusY = 1.0;

        // Position around a circle
        this._rewardTargetPositions = [];
        var numNodes = this._rewardsData.length;
        for (var i = 0; i < numNodes; i++) {
          let progressAroundCircle = i / numNodes;
          if (numNodes % 2 == 0) {
            // If there are an even number of nodes we rotate the circle by a half node to make sure there is no node at the bottom peak
            progressAroundCircle += 0.5 / numNodes;
          }
          const targetPosition = cc.p(
            centerPosition.x + horizontalRadialDistance * Math.cos(Math.PI / 2 + 2 * Math.PI * progressAroundCircle),
            centerPosition.y + verticalRadialDistance * Math.sin(Math.PI / 2 + 2 * Math.PI * progressAroundCircle),
          );
          targetPosition.x *= scaleRadiusX;
          targetPosition.y *= scaleRadiusY;
          if (i == 0 && numNodes % 2 == 1) {
            // If there are an odd number of nodes there will be a node at the highest peak, we want to dampen that nodes radius
            targetPosition.y *= 5 / 6;
          }
          this._rewardTargetPositions.push(targetPosition);
        }
      }
    } else {
      // Layout in rows
      const verticalSpacing = 300;
      const horizontalSpacing = 250;

      this._rewardTargetPositions = [];
      var numNodes = this._rewardsData.length;

      // If greater than 3 rewards, use two rows, else one row
      if (numNodes <= 3) {
        const startingX = horizontalSpacing * (numNodes - 1) * -0.5;
        for (var i = 0; i < numNodes; i++) {
          this._rewardTargetPositions[i] = cc.p(
            centerPosition.x + startingX + i * horizontalSpacing,
            centerPosition.y,
          );
        }
      } else {
        const nodesInFirstRow = Math.round(numNodes / 2);
        const nodesInSecondRow = Math.floor(numNodes / 2);
        const firstRowStartingX = horizontalSpacing * (nodesInFirstRow - 1) * -0.5;
        const secondRowStartingX = horizontalSpacing * (nodesInSecondRow - 1) * -0.5;
        for (var i = 0; i < numNodes; i++) {
          if (i < nodesInFirstRow) {
            this._rewardTargetPositions[i] = cc.p(
              centerPosition.x + firstRowStartingX + i * horizontalSpacing,
              centerPosition.y + verticalSpacing * 0.5,
            );
          } else {
            this._rewardTargetPositions[i] = cc.p(
              centerPosition.x + secondRowStartingX + (i - nodesInFirstRow) * horizontalSpacing,
              centerPosition.y + verticalSpacing * -0.5,
            );
          }
        }
      }
    }

    // region Rewards Nodes
    this._rewardNodes = [];
    this._rewardAnimationPromiseCallbacks = [];
    let currencyRewardsBuilt = 0;
    for (var i = 0, il = this._rewardsData.length; i < il; i++) {
      const rewardData = this._rewardsData[i];
      const rewardTargetPosition = this._rewardTargetPositions[i];
      const sfxIndex = Math.min(i - currencyRewardsBuilt, 4);

      // reward node
      const rewardNode = this._createRewardNode(rewardData);
      rewardNode.setVisible(false);
      rewardNode.setPosition(rewardTargetPosition);
      this.addChild(rewardNode, this._zOrderRewards);
      this._rewardNodes.push(rewardNode);

      // reward animation callback
      let rewardAnimationCallback = this._createRewardAnimationCallback(rewardData, rewardNode, sfxIndex);

      // converted to reward
      const convertedToAnimationCallback = this._createConvertedToRewardAnimationCallback(rewardData, rewardNode, rewardAnimationCallback);
      if (convertedToAnimationCallback != null) {
        rewardAnimationCallback = convertedToAnimationCallback;
      }

      this._rewardAnimationPromiseCallbacks.push(rewardAnimationCallback);

      if (rewardData.gold != null || rewardData.spirit != null) {
        currencyRewardsBuilt++;
      }
    }
  },

  _createRewardNode(rewardData) {
    if (rewardData.gold) {
      // gold
      return new CurrencyRewardNode('gold', rewardData.gold);
    } if (rewardData.spirit) {
      // spirit
      return new CurrencyRewardNode('spirit', rewardData.spirit);
    } if (rewardData.cardId) {
      // card
      const { cardId } = rewardData;
      const sdkCard = SDK.CardFactory.cardForIdentifier(cardId, SDK.GameSession.current());
      return new CardNode(sdkCard);
    } if (rewardData.spirit_orbs) {
      // spirit orbs
      return new SpiritOrbRewardNode(rewardData.spirit_orbs);
    } if (rewardData.gauntletTickets) {
      // gauntlet ticket
      return new TicketNode();
    } if (rewardData.emoteId) {
      // emote
      return new EmoteRewardNode(rewardData.emoteId);
    } if (rewardData.keyType) {
      // key
      return new KeyRewardNode(rewardData.keyType);
    } if (rewardData.profileIconId) {
      // profile icon
      return new CosmeticRewardNode(rewardData.profileIconId);
    } if (rewardData.cardSkinId) {
      // card skin
      return new CardSkinRewardNode(rewardData.cardSkinId);
    } if (rewardData.cardBackId) {
      // card back
      return new CardBackRewardNode(rewardData.cardBackId);
    } if (rewardData.battleMapId) {
      // battle map
      return new CosmeticRewardNode(rewardData.battleMapId);
    } if (rewardData.sceneId) {
      // TODO
      // scene
    } else {
      console.error('Invalid reward used in LootCrate Node');
    }
  },

  _createConvertedToRewardAnimationCallback(rewardData, rewardNode, rewardAnimationCallback) {
    let convertedToRewardNode;
    let convertedToRewardAnimationCallback;
    if (rewardData.convertedToSpirit) {
      // spirit
      convertedToRewardNode = new CurrencyRewardNode('spirit', rewardData.convertedToSpirit, i18next.t('cosmetics.cosmetic_chest_duplicate').toLocaleUpperCase());
      convertedToRewardAnimationCallback = function () {
        convertedToRewardNode.setVisible(true);
        return convertedToRewardNode.animateReward(false, true);
      };
    }

    if (convertedToRewardAnimationCallback != null) {
      return function () {
        return rewardAnimationCallback()
          .then(() => {
            convertedToRewardNode.setVisible(false);
            convertedToRewardNode.setPosition(rewardNode.getPosition());
            rewardNode.getParent().addChild(convertedToRewardNode, convertedToRewardNode.getLocalZOrder() + 0.5);
            return new Promise((resolve, reject) => {
              const replaceDelay = 0.75;
              const replaceAction = cc.spawn(
                Shake.create(replaceDelay + CONFIG.ANIMATE_FAST_DURATION, 5.0, rewardNode.getPosition()),
                cc.sequence(
                  cc.delayTime(replaceDelay),
                  cc.callFunc(() => {
                    resolve();
                  }),
                  cc.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 0.0),
                  cc.hide(),
                ),
              );
              rewardNode.runAction(replaceAction);
            })
              .then(convertedToRewardAnimationCallback);
          });
      };
    }
  },

  _createRewardAnimationCallback(rewardData, rewardNode, sfxIndex) {
    if (rewardData.gold) {
      // gold
      return function () {
        audio_engine.current().play_effect(LOOT_CRATE_REWARD_SFX[sfxIndex].audio, false);
        rewardNode.setVisible(true);
        return rewardNode.animateReward(false, true);
      };
    } if (rewardData.spirit) {
      // spirit
      return function () {
        audio_engine.current().play_effect(LOOT_CRATE_REWARD_SFX[sfxIndex].audio, false);
        rewardNode.setVisible(true);
        return rewardNode.animateReward(false, true);
      };
    } if (rewardData.cardId) {
      // card
      return function () {
        audio_engine.current().play_effect(LOOT_CRATE_REWARD_SFX[sfxIndex].audio, false);
        rewardNode.setVisible(true);
        return rewardNode.showReveal(null, rewardNode.getPosition(), null);
      };
    } if (rewardData.spirit_orbs) {
      // spirit orbs
      return function () {
        audio_engine.current().play_effect(LOOT_CRATE_REWARD_SFX[sfxIndex].audio, false);
        rewardNode.setVisible(true);
        return rewardNode.animateReward(false, true);
      };
    } if (rewardData.gauntletTickets) {
      // gauntlet ticket
      return function () {
        audio_engine.current().play_effect(LOOT_CRATE_REWARD_SFX[sfxIndex].audio, false);
        rewardNode.setVisible(true);
        const showDelay = rewardNode.showReveal();
        return Promise.delay(showDelay * 1000.0);
      };
    } if (rewardData.emoteId) {
      // emote
      return function () {
        audio_engine.current().play_effect(LOOT_CRATE_REWARD_SFX[sfxIndex].audio, false);
        rewardNode.setVisible(true);
        return rewardNode.animateReward(false, true);
      };
    } if (rewardData.keyType) {
      // key
      return function () {
        audio_engine.current().play_effect(LOOT_CRATE_REWARD_SFX[sfxIndex].audio, false);
        rewardNode.setVisible(true);
        return rewardNode.animateReward(false, true);
      };
    } if (rewardData.cardSkinId) {
      // card back
      return function () {
        audio_engine.current().play_effect(LOOT_CRATE_REWARD_SFX[sfxIndex].audio, false);
        rewardNode.setVisible(true);
        return rewardNode.animateReward(false, true);
      };
    } if (rewardData.cardBackId) {
      // card back
      return function () {
        audio_engine.current().play_effect(LOOT_CRATE_REWARD_SFX[sfxIndex].audio, false);
        rewardNode.setVisible(true);
        return rewardNode.animateReward(false, true);
      };
    } if (rewardData.profileIconId) {
      // profile icon
      return function () {
        audio_engine.current().play_effect(LOOT_CRATE_REWARD_SFX[sfxIndex].audio, false);
        rewardNode.setVisible(true);
        return rewardNode.animateReward(false, i18next.t('cosmetics.cosmetic_type_profile_icon').toLocaleUpperCase(), true);
      };
    } if (rewardData.battleMapId) {
      // profile icon
      return function () {
        audio_engine.current().play_effect(LOOT_CRATE_REWARD_SFX[sfxIndex].audio, false);
        rewardNode.setVisible(true);
        return rewardNode.animateReward(false, i18next.t('cosmetics.cosmetic_type_battle_map').toLocaleUpperCase());
      };
    }
    console.error('Invalid reward used in LootCrate Node');
  },

  /* endregion REWARDS */

  /* region ANIMATION */

  _stopShowingFXSprites(duration) {
    if (this._idleParticles != null) {
      if (duration == null || duration <= 0.0) {
        this._idleParticles.resetSystem();
      }
      this._idleParticles.stopSystem();
    }
    if (this._idleParticles2 != null) {
      if (duration == null || duration <= 0.0) {
        this._idleParticles2.resetSystem();
      }
      this._idleParticles2.stopSystem();
    }
    if (this._flareBehindCrate != null) {
      this._flareBehindCrate.stopAllActions();
      this._flareBehindCrate.fadeToInvisible(duration);
    }
    if (this.flare != null) {
      this.flare.stopAllActions();
      this.flare.fadeToInvisible(duration);
    }
  },

  /**
   * Shows a loot crate being revealed.
   * @param {Number} [scaleTo=1.0]
   * @param {Boolean} [withAudio=true]
   * @public
   * @return {Promise}
   */
  showReveal(scaleTo, withAudio) {
    if (scaleTo == null) { scaleTo = 1.0; }
    if (withAudio == null) { withAudio = true; }

    // hide elements immediately
    this.setVisible(false);
    this.setScale(0.0);
    this.setOpacity(0.0);
    this._stopShowingFXSprites(0.0);

    return this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      return new Promise((resolve, reject) => {
        if (withAudio) {
          audio_engine.current().play_effect(RSX.sfx_loot_crate_reveal.audio, false);
        }

        this.runAction(cc.sequence(
          // reveal self
          cc.spawn(
            cc.show(),
            cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION),
            cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, scaleTo).easing(cc.easeBackOut()),
          ),
          cc.callFunc(() => {
            resolve();
          }),
        ));
      })
        .catch((error) => { EventBus.getInstance().trigger(EVENTS.error, error); });
    });
  },

  /**
   * Shows the loot crate as static.
   * @param {Number} [duration=0.0]
   * @param {Boolean} [preserveFX=false]
   * @public
   * @return {Promise}
   */
  showStaticState(duration, preserveFX) {
    return this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      if (duration == null) { duration = 0.0; }

      if (!preserveFX) {
        this._stopShowingFXSprites(duration);
      }

      if (this._repeatingFigureEightAction != null) {
        this._lootCrateContainerNode.stopAction(this._repeatingFigureEightAction);
        this._repeatingFigureEightAction = null;
        const centerPosition = this.getCenterPosition();
        if (duration > 0.0) {
          this._lootCrateContainerNode.runAction(cc.moveTo(duration, centerPosition));
        } else {
          this._lootCrateContainerNode.setPosition(centerPosition);
        }
      }
    });
  },

  /**
   * Shows the loot crate idling.
   * @param {Number} [duration=0.0]
   * @public
   * @return {Promise}
   */
  showIdleState(duration) {
    return this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      if (duration == null) { duration = 0.0; }

      this._idleParticles.resumeSystem();
      this._idleParticles2.resumeSystem();

      if (!this._flareBehindCrate.isVisible()) {
        this._flareBehindCrate.setVisible(true);
        this._flareBehindCrate.setPhase(1.0);
        this._flareBehindCrate.setColor(cc.color(133, 255, 255));
        this._flareBehindCrate.setOpacity(0.0);
        this._flareBehindCrate.fadeTo(duration, 255.0);
      }

      // Loop the loot crate around in a figure eight repeating
      if (this._repeatingFigureEightAction == null) {
        const centerPosition = this.getCenterPosition();
        this._repeatingFigureEightAction = FigureEight.create(10.0, 2, 5, centerPosition).repeatForever();
        this._lootCrateContainerNode.runAction(this._repeatingFigureEightAction);
      } else {
        this._repeatingFigureEightAction.setDuration(10.0);
      }
    });
  },

  /**
   * Shows the loot crate as excited.
   * @param {Number} [duration=0.5]
   * @public
   * @return {Promise}
   */
  showExcitedState(duration) {
    return this.showIdleState(duration).then(() => {
      // Speed up the figure 8
      if (this._repeatingFigureEightAction != null) {
        this._repeatingFigureEightAction.setDuration(2.0);
      }
    });
  },

  /**
   * Shows the loot crate as glowing.
   * @param {Number} [duration=0.0]
   * @param {cc.Color} [color=CONFIG.LOOT_CRATE_GLOW_COLOR]
   * @public
   * @return {Promise}
   */
  showGlow(duration, color) {
    if (!this._isGlowing) {
      this._isGlowing = true;

      return this.whenRequiredResourcesReady().then((requestId) => {
        if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

        if (this._glowImageMap == null) {
          this._glowImageMap = FXGlowImageMap.create(this._getLootCrateGlowSpriteIdentifier());
          this._lootCrateContainerNode.addChild(this._glowImageMap, -1);
        }

        if (duration == null) {
          duration = 0.0;
        }
        if (color == null) {
          color = CONFIG.LOOT_CRATE_GLOW_COLOR;
        }
        this._glowImageMap.setGlowColor(color);
        this._glowImageMap.fadeTo(duration, 255.0);
      });
    }
  },

  /**
   * Stops showing the loot crate as glowing.
   * @param {Number} [duration=0.0]
   * @public
   * @return {Promise}
   */
  stopShowingGlow(duration) {
    if (this._isGlowing) {
      this._isGlowing = false;

      return this.whenRequiredResourcesReady().then((requestId) => {
        if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

        if (this._glowImageMap != null) {
          if (duration == null) { duration = 0.0; }
          this._glowImageMap.fadeToInvisible(duration);
        }
      });
    }
  },

  /**
   * Animates opening the loot crate and showing rewards.
   * @public
   * @return {Promise}
   */
  showOpeningAndRewards() {
    return this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      this._rewardZodiacs = [];

      return new Promise((resolve, reject) => {
        // show crate as static but preserve fx
        this.showStaticState(CONFIG.FADE_FAST_DURATION, true);

        // play explosion sfx
        audio_engine.current().play_effect(RSX.sfx_loot_crate_explode.audio, false);

        const uleg = 0.70710678118; // unit triangle leg length
        const pieceTravelDistance = 250; // Distance for exploding out loot crate pieces
        const centerPosition = this.getCenterPosition();

        const locResolve = resolve;
        this.runAction(cc.sequence(
          // cc.delayTime(1),// To sync with audio
          cc.callFunc(() => {
            // wipe flare
            const wipeFlare = FXFbmPolarFlareWipeSprite.create();
            wipeFlare.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
            wipeFlare.setTextureRect(cc.rect(0, 0, 512, 512));
            wipeFlare.setAnchorPoint(0.5, 0.5);
            wipeFlare.setPosition(centerPosition);
            wipeFlare.setColor(cc.color(165, 233, 255));
            this.addChild(wipeFlare, this._zOrderInfrontOfCrate);

            // run the wipe effect
            wipeFlare.runAction(cc.sequence(
              cc.fadeIn(0.01),
              cc.actionTween(0.25, 'phase', 0.0, 0.5),
              cc.actionTween(0.75, 'phase', 0.5, 1.5),
              cc.fadeOut(0.1),
              cc.removeSelf(),
            ));
          }),

          cc.spawn(
            // Break apart loot crate pieces
            cc.targetedAction(this._lootCrateBackLeftSprite, cc.spawn(
              cc.moveBy(CONFIG.MOVE_SLOW_DURATION, {
                x: -uleg * pieceTravelDistance,
                y: uleg * pieceTravelDistance,
              }).easing(cc.easeExponentialOut()),
              cc.scaleTo(CONFIG.MOVE_SLOW_DURATION, 0.8).easing(cc.easeExponentialOut()),
              cc.sequence(
                cc.delayTime(CONFIG.MOVE_SLOW_DURATION * 0.7),
                cc.fadeOut(CONFIG.MOVE_SLOW_DURATION * 0.3),
              ),
            )),
            cc.targetedAction(this._lootCrateBackRightSprite, cc.spawn(
              cc.moveBy(CONFIG.MOVE_SLOW_DURATION, {
                x: uleg * pieceTravelDistance,
                y: uleg * pieceTravelDistance,
              }).easing(cc.easeExponentialOut()),
              cc.scaleTo(CONFIG.MOVE_SLOW_DURATION, 0.8).easing(cc.easeExponentialOut()),
              cc.sequence(
                cc.delayTime(CONFIG.MOVE_SLOW_DURATION * 0.7),
                cc.fadeOut(CONFIG.MOVE_SLOW_DURATION * 0.3),
              ),
            )),
            cc.targetedAction(this._lootCrateTopSprite, cc.spawn(
              cc.moveBy(CONFIG.MOVE_SLOW_DURATION, {
                x: 0,
                y: pieceTravelDistance,
              }).easing(cc.easeExponentialOut()),
              cc.scaleTo(CONFIG.MOVE_SLOW_DURATION, 0.9).easing(cc.easeExponentialOut()),
              cc.sequence(
                cc.delayTime(CONFIG.MOVE_SLOW_DURATION * 0.7),
                cc.fadeOut(CONFIG.MOVE_SLOW_DURATION * 0.3),
              ),
            )),
            cc.targetedAction(this._lootCrateBottomSprite, cc.spawn(
              cc.moveBy(CONFIG.MOVE_SLOW_DURATION, {
                x: 0,
                y: -pieceTravelDistance,
              }).easing(cc.easeExponentialOut()),
              cc.scaleTo(CONFIG.MOVE_SLOW_DURATION, 1.1).easing(cc.easeExponentialOut()),
              cc.sequence(
                cc.delayTime(CONFIG.MOVE_SLOW_DURATION * 0.7),
                cc.fadeOut(CONFIG.MOVE_SLOW_DURATION * 0.3),
              ),
            )),
            cc.targetedAction(this._lootCrateFrontLeftSprite, cc.spawn(
              cc.moveBy(CONFIG.MOVE_SLOW_DURATION, {
                x: -uleg * pieceTravelDistance,
                y: -uleg * pieceTravelDistance,
              }).easing(cc.easeExponentialOut()),
              cc.scaleTo(CONFIG.MOVE_SLOW_DURATION, 1.2).easing(cc.easeExponentialOut()),
              cc.sequence(
                cc.delayTime(CONFIG.MOVE_SLOW_DURATION * 0.7),
                cc.fadeOut(CONFIG.MOVE_SLOW_DURATION * 0.3),
              ),
            )),
            cc.targetedAction(this._lootCrateFrontRightSprite, cc.spawn(
              cc.moveBy(CONFIG.MOVE_SLOW_DURATION, {
                x: uleg * pieceTravelDistance,
                y: -uleg * pieceTravelDistance,
              }).easing(cc.easeExponentialOut()),
              cc.scaleTo(CONFIG.MOVE_SLOW_DURATION, 1.2).easing(cc.easeExponentialOut()),
              cc.sequence(
                cc.delayTime(CONFIG.MOVE_SLOW_DURATION * 0.7),
                cc.fadeOut(CONFIG.MOVE_SLOW_DURATION * 0.3),
              ),
            )),
            cc.callFunc(() => {
              // Add explosion particles behind loot crate
              const explosionParticles = BaseParticleSystem.create(RSX.explosion.plist);
              explosionParticles.setPosition(centerPosition);
              explosionParticles.setAnchorPoint(cc.p(0.5, 0.5));
              explosionParticles.setAutoRemoveOnFinish(true);
              this.addChild(explosionParticles, this._zOrderInfrontOfCrate);

              // Remove fx from behind sphere
              this._idleParticles.stopSystem();
              this._idleParticles2.stopSystem();
              this._flareBehindCrate.runAction(cc.sequence(
                cc.fadeOut(0.2),
                cc.removeSelf(),
              ));

              // shake sphere
              this._lootCrateSphereSprite.runAction(
                Shake.create(CONFIG.MOVE_SLOW_DURATION + CONFIG.ANIMATE_MEDIUM_DURATION, 5.0, this._lootCrateSphereSprite.getPosition()),
              );
            }),
          ),

          cc.spawn(
            // animate out the sphere
            cc.targetedAction(this._lootCrateSphereSprite, cc.spawn(
              cc.fadeOut(CONFIG.ANIMATE_MEDIUM_DURATION),
              cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 0.8).easing(cc.easeBackIn()),
            )),

            // explode and animate flare out
            cc.targetedAction(this.flare, cc.sequence(
              cc.show(),
              cc.scaleTo(0.8, 8.0),
              cc.actionTween(0.8, 'armLength', 0.0, 1.0),
              cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION),
            )),

            // show rewards
            cc.callFunc(() => {
              for (let i = 0; i < this._rewardNodes.length; i++) {
                this._rewardNodes[i].setPosition(this._rewardTargetPositions[i]);
              }

              this._showRewardDiscs()
                .then(() =>
                // Run through the promise chain for each reward show animation
                  _.reduce(this._rewardAnimationPromiseCallbacks, (currentPromiseCallback, nextPromiseCallback, index) => {
                    const zodiacDestroyPromiseCallback = function () {
                      return new Promise(function (index, resolve, reject) {
                        this._rewardZodiacs[index].destroy();
                        resolve();
                      }.bind(this, index));
                    }.bind(this);

                    return currentPromiseCallback.then(zodiacDestroyPromiseCallback).then(nextPromiseCallback);
                  }, Promise.resolve()).then(() => {
                    locResolve();
                  }));
            }),
          ),
          cc.delayTime(CONFIG.ANIMATE_FAST_DURATION),
        ));
      })
        .catch((error) => { EventBus.getInstance().trigger(EVENTS.error, error); });
    });
  },

  _showRewardDiscs() {
    return new Promise((resolve, reject) => {
      const locResolve = resolve;
      const centerPosition = this.getCenterPosition();
      for (let i = 0; i < this._rewardNodes.length; i++) {
        const index = i;
        const cardDisc = BaseSprite.create(RSX.booster_glowing_disc.img);
        cardDisc.setPosition(centerPosition);
        cardDisc.setAnchorPoint(0.5, 0.5);
        this.addChild(cardDisc, this._zOrderInfrontOfCrate);

        const particles = BaseParticleSystem.create(RSX.booster_pack_center_particles.plist);
        particles.setPosition(centerPosition);
        particles.setAnchorPoint(0.5, 0.5);
        particles.setAutoRemoveOnFinish(true);
        this.addChild(particles, this._zOrderInfrontOfCrate);

        const cardScreenRevealPosition = this._rewardTargetPositions[i];
        const maxDuration = 2.0;
        const duration = maxDuration / 2 + maxDuration / 2 * Math.random();
        const delayScaleDown = maxDuration - duration - 1.0;
        var numReady = 0;

        // move particles
        particles.runAction(
          cc.moveTo(duration, cardScreenRevealPosition).easing(cc.easeExponentialOut()),
        );

        // move disc
        cardDisc.runAction(cc.sequence(
          cc.moveTo(duration, cardScreenRevealPosition).easing(cc.easeExponentialOut()),
          cc.delayTime(delayScaleDown),
          cc.callFunc(function () {
            this.stopSystem();
          }.bind(particles)),
          cc.scaleTo(0.5, 0.25).easing(cc.easeExponentialOut()),
          cc.callFunc(function (cardDisc, index) {
            // zodiac symbol that animates from a single point out
            const zodiac = new ZodiacNode({
              width: 80,
              height: 80,
              lineWidth: 1,
              duration: 1.0,
            });
            zodiac.setAnchorPoint(cc.p(0.5, 0.5));
            zodiac.setPosition(cc.p(
              cardDisc.getPosition().x - 40,
              cardDisc.getPosition().y - 40,
            ));
            this._rewardZodiacs[index] = zodiac;
            this.addChild(zodiac, this._zOrderInfrontOfCrate);

            // energy particles
            const particles = BaseParticleSystem.create(RSX.zodiac_appear_001.plist);
            particles.setAnchorPoint(cc.p(0.5, 0.5));
            particles.setPosition(cardDisc.getPosition());
            particles.setAutoRemoveOnFinish(true);
            this.addChild(particles, this._zOrderInfrontOfCrate);

            // zodiac fragment particles
            const particles2 = BaseParticleSystem.create(RSX.zodiac_appear_002.plist);
            particles2.setAnchorPoint(cc.p(0.5, 0.5));
            particles2.setPosition(cardDisc.getPosition());
            particles2.setAutoRemoveOnFinish(true);
            this.addChild(particles2, this._zOrderInfrontOfCrate);

            cardDisc.zodiac = zodiac;
          }.bind(this, cardDisc, index)),
          // cc.delayTime(0.5),
          cc.fadeOut(0.1),
          cc.callFunc(function (cardDisc, index) {
            numReady += 1;
            if (numReady == this._rewardNodes.length) {
              locResolve();
            }
          }.bind(this, cardDisc, index)),
          cc.removeSelf(),
        ));
      }
    })
      .catch((error) => { EventBus.getInstance().trigger(EVENTS.error, error); });
  },

  /**
   * Promisified - Transitions out the loot crate
   * @public
   * @return {Promise} A promise which resolves when the loot crate has finished animating out
   */
  cleanupLootCrate() {
    return this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      return new Promise((resolve, reject) => {
        audio_engine.current().play_effect(RSX.sfx_loot_crate_reward_disappear.audio, false);
        this.runAction(cc.sequence(
          cc.callFunc(() => {
            for (let i = 0; i < this._rewardNodes.length; i++) {
              this._rewardNodes[i].destroy(CONFIG.ANIMATE_FAST_DURATION);
            }
          }),
          cc.delayTime(CONFIG.ANIMATE_FAST_DURATION),
          cc.callFunc(() => {
            this.destroy();
            resolve();
          }),
        ));
      })
        .catch((error) => { EventBus.getInstance().trigger(EVENTS.error, error); });
    });
  },

  /* endregion ANIMATION */

  /* region EVENTS */
  _startListeningToEvents() {
    const scene = this.getScene();
    if (scene != null) {
      scene.getEventBus().on(EVENTS.pointer_move, this.onPointerMove, this);
    }

    EventBus.getInstance().on(EVENTS.cosmetic_chest_collection_change, this.onCrateCollectionsChanged, this);
    EventBus.getInstance().on(EVENTS.gift_crate_collection_change, this.onCrateCollectionsChanged, this);
  },

  _stopListeningToEvents() {
    const scene = this.getScene();
    if (scene != null) {
      scene.getEventBus().off(EVENTS.pointer_move, this.onPointerMove, this);
    }

    EventBus.getInstance().off(EVENTS.cosmetic_chest_collection_change, this.onCrateCollectionsChanged, this);
    EventBus.getInstance().off(EVENTS.gift_crate_collection_change, this.onCrateCollectionsChanged, this);
  },

  onPointerMove(event) {
    if (event && event.isStopped) {
      return;
    }

    const location = event && event.getLocation();
    let mouseOverRewardNode = null;
    if (location && this._rewardNodes && this._rewardNodes.length > 0) {
      // find reward under mouse
      for (let i = 0; i < this._rewardNodes.length; i++) {
        const rewardNode = this._rewardNodes[i];
        if (rewardNode.isVisible() && UtilsEngine.getNodeUnderMouse(rewardNode, location.x, location.y)) {
          mouseOverRewardNode = rewardNode;
          break;
        }
      }

      const isDifferentNode = this._mouseOverRewardNode != mouseOverRewardNode;

      // reset previous
      if (this._mouseOverRewardNode && isDifferentNode) {
        if (this._mouseOverRewardNode instanceof CardNode) {
          this._mouseOverRewardNode.stopShowingInspect();
        }
      }

      this._mouseOverRewardNode = mouseOverRewardNode;

      // setup new
      if (this._mouseOverRewardNode && isDifferentNode) {
        if (this._mouseOverRewardNode instanceof CardNode) {
          this._mouseOverRewardNode.showInspect(null, true, null, null, false, true);
        }
        this._mouseOverRewardNode.setLocalZOrder(this._zOrderRewards + 1);
      }
    }
  },

  onCrateCollectionsChanged() {
    const crateCountLabel = this.getCrateCountLabel();
    if (crateCountLabel != null) {
      crateCountLabel.setString(`${this.getCrateCount()}`);
    }
  },

  /* endregion EVENTS */

});

LootCrateNode.create = function (node) {
  return cc.Node.create(node || new LootCrateNode());
};

module.exports = LootCrateNode;
