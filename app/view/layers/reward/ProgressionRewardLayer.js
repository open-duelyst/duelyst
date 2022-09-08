// pragma PKGS: progression_reward
const CONFIG = require('app/common/config');
const UtilsEngine = require('app/common/utils/utils_engine');
const SDK = require('app/sdk');
const Promise = require('bluebird');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const audio_engine = require('../../../audio/audio_engine');
const RewardLayer = require('./RewardLayer');
const BaseSprite = require('../../nodes/BaseSprite');
const GlowSprite = require('../../nodes/GlowSprite');
const CardNode = require('../../nodes/cards/CardNode');
const EmoteRewardNode = require('../../nodes/reward/EmoteRewardNode');
const CosmeticRewardNode = require('../../nodes/reward/CosmeticRewardNode');
const RibbonRewardNode = require('../../nodes/reward/RibbonRewardNode');
const BaseParticleSystem = require('../../nodes/BaseParticleSystem');
const FXFireRingSprite = require('../../nodes/fx/FXFireRingSprite');
const FXDissolveWithDiscFromCenterSprite = require('../../nodes/fx/FXDissolveWithDiscFromCenterSprite');
const FXFbmPolarFlareSprite = require('../../nodes/fx/FXFbmPolarFlareSprite');
const FXFbmPolarFlareWipeSprite = require('../../nodes/fx/FXFbmPolarFlareWipeSprite');
const KeyRewardNode = require('../../nodes/reward/KeyRewardNode');

/** **************************************************************************
 ProgressionRewardLayer
 *************************************************************************** */

const ProgressionRewardLayer = RewardLayer.extend({

  getRequiredResources() {
    return RewardLayer.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier('progression_reward'));
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

  /* region REWARD CARDS */

  // Show stack is whether or not to show a stack of 3 cards or individual cards
  showRewardCards(cardIds, showStack, title, subtitle) {
    return this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      audio_engine.current().play_effect(RSX.sfx_card_reward_long.audio, false);

      const showCardsPromise = new Promise((resolve) => {
        const spacingBetweenCardCenters = 250;
        const centerPosition = cc.p(0, 70);

        const cardsLength = cardIds.length;
        const startingCenterXOffset = (cardsLength - 1) * -0.5 * spacingBetweenCardCenters;

        for (let c = 0; c < cardsLength; c++) {
          _.delay(function (c) {
            const cardId = cardIds[c];
            const lastCard = c === cardsLength - 1;
            const cardCenterPosition = cc.p(centerPosition.x + startingCenterXOffset + c * spacingBetweenCardCenters, centerPosition.y);
            const flareSprite = FXFireRingSprite.create();
            flareSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
            flareSprite.setTimeScale(0.5);
            flareSprite.setPhase(0.5);
            flareSprite.setPosition(cardCenterPosition);
            flareSprite.setScale(1.75);
            flareSprite.setVisible(false);
            flareSprite.setFlippedY(true);
            this.addChild(flareSprite, 0);

            // TODO: The following commented line should work, however when the cardnode reveal gets the description, it fails to use the correct options
            // https://trello.com/c/40ebEr6N/53-when-grabbing-card-from-cache-getdescription-fails-to-obey-options-correctly
            // var sdkCard = SDK.GameSession.getCardCaches().getCardById(cardId);
            const sdkCard = SDK.CardFactory.cardForIdentifier(cardId, SDK.GameSession.getInstance());
            const cardNode = CardNode.create();
            cardNode.setVisible(false);
            cardNode.setPosition(cardCenterPosition);
            this.addChild(cardNode, 5);

            // card dissolve-in sprite
            let cardDissolveSpriteIdentifier;
            if (sdkCard instanceof SDK.Entity) {
              cardDissolveSpriteIdentifier = SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) ? RSX.card_neutral_prismatic_unit.img : RSX.card_neutral_unit.img;
            } else if (sdkCard instanceof SDK.Artifact) {
              cardDissolveSpriteIdentifier = SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) ? RSX.card_neutral_prismatic_artifact.img : RSX.card_neutral_artifact.img;
            } else {
              cardDissolveSpriteIdentifier = SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) ? RSX.card_neutral_prismatic_spell.img : RSX.card_neutral_spell.img;
            }
            const cardDissolve = FXDissolveWithDiscFromCenterSprite.create(cardDissolveSpriteIdentifier);
            cardDissolve.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
            cardDissolve.setScale(1.0);
            cardDissolve.setAnchorPoint(cc.p(0.5, 0.5));
            cardDissolve.setPosition(cardCenterPosition);
            this.addChild(cardDissolve, 0);

            // gold flaring
            const polarFlare = FXFbmPolarFlareSprite.create();
            polarFlare.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
            polarFlare.setTextureRect(cc.rect(0, 0, 512, 640));
            polarFlare.setAnchorPoint(cc.p(0.5, 0.5));
            polarFlare.setPosition(cardCenterPosition);
            this.addChild(polarFlare, 0);

            const particles = BaseParticleSystem.create(RSX.ptcl_spiral_assemble_for_card_reward.plist);
            particles.setAnchorPoint(cc.p(0.5, 0.5));
            particles.setPosition(cardCenterPosition);
            this.addChild(particles);

            cardDissolve.runAction(cc.actionTween(2.0, 'phase', 0.0, 1.0));
            polarFlare.runAction(cc.sequence(
              cc.actionTween(1.0, 'phase', 0.01, 1.0),
              cc.delayTime(0.5),
              cc.callFunc(function (cardDissolve, cardNode, sdkCard, cardCenterPosition, flareSprite, lastCard) {
                // play reveal sound
                audio_engine.current().play_effect(RSX.sfx_ui_card_reveal.audio, false);

                // show card reveal
                cardNode.setVisible(true);
                cardNode.showReveal(sdkCard, cardCenterPosition, null);
                cardNode.factionNameLabel.setOpacity(0);

                // finalize animation
                cardNode.runAction(cc.sequence(
                  cc.delayTime(1.5),
                  cc.callFunc(((cardDissolve, cardNode, sdkCard, cardCenterPosition, flareSprite, lastCard) => {
                    cardDissolve.setVisible(false);
                    cardDissolve.destroy();

                    flareSprite.setVisible(true);
                    flareSprite.runAction(cc.EaseCubicActionOut.create(cc.scaleTo(1.5, 9.0)));

                    // show card stack
                    if (showStack) {
                      cardNode.showStack();
                    }

                    // all done
                    resolve();
                  }).bind(this, cardDissolve, cardNode, sdkCard, cardCenterPosition, flareSprite, lastCard)),
                ));
              }.bind(this, cardDissolve, cardNode, sdkCard, cardCenterPosition, flareSprite, lastCard)),
              cc.delayTime(0.5),
              cc.actionTween(1.0, 'phase', 1.0, 0.01),
            ));
          }.bind(this, c), c * 500);
        }
      });

      // show titles
      const showTitlesPromise = new Promise((resolve) => {
        this.runAction(cc.sequence(
          cc.delayTime(2.0),
          cc.callFunc(() => {
            this.showTitles(CONFIG.ANIMATE_FAST_DURATION, title, subtitle).then(resolve);
          }),
        ));
      });

      return Promise.all([
        showCardsPromise,
        showTitlesPromise,
      ]).then(() => {
        this.setIsContinueOnPressAnywhere(true);
        this.setIsInteractionEnabled(true);
        this.continueNode.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
      });
    });
  },
  /* endregion REWARD CARDS */

  /* region REWARD EMOTES */

  showRewardEmotes(emoteIds, title, subtitle) {
    return this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      audio_engine.current().play_effect(RSX.sfx_emote_reward_long.audio, false);

      const showPromises = [];

      // show emotes
      if (emoteIds && emoteIds.length > 0) {
        const numRewards = emoteIds.length;
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
          showPromises.push(this._showRewardEmote(emoteIds[i], cc.p(offsetX, offsetY)));
          offsetX += offsetPerReward;
        }
      }

      // show titles
      showPromises.push(new Promise((resolve) => {
        this.runAction(cc.sequence(
          cc.delayTime(2.0),
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

  _showRewardEmote(emoteId, targetScreenPosition) {
    const emoteRewardNode = new EmoteRewardNode(emoteId);
    emoteRewardNode.setPosition(targetScreenPosition);
    this.addChild(emoteRewardNode);

    return emoteRewardNode.animateReward(true, false);
  },

  /* endregion REWARD EMOTES */

  /* region REWARD Battle Maps */

  showRewardBattleMaps(battleMapIds, title, subtitle) {
    return this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      audio_engine.current().play_effect(RSX.sfx_emote_reward_long.audio, false);

      const showPromises = [];

      // show emotes
      if (battleMapIds && battleMapIds.length > 0) {
        const numRewards = battleMapIds.length;
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
          showPromises.push(this._showRewardBattleMap(battleMapIds[i], cc.p(offsetX, offsetY)));
          offsetX += offsetPerReward;
        }
      }

      // show titles
      showPromises.push(new Promise((resolve) => {
        this.runAction(cc.sequence(
          cc.delayTime(2.0),
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

  _showRewardBattleMap(battleMapId, targetScreenPosition) {
    const rewardNode = new CosmeticRewardNode(battleMapId);
    rewardNode.setPosition(targetScreenPosition);
    this.addChild(rewardNode);

    return rewardNode.animateReward(true, false);
  },

  /* endregion REWARD EMOTES */

  /* region REWARD RIBBONS */
  showRewardRibbons(ribbonIds, title, subtitle) {
    return this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      audio_engine.current().play_effect(RSX.sfx_ribbon_reward_long.audio, false);

      const showPromises = [];

      // show ribbons
      if (ribbonIds && ribbonIds.length > 0) {
        const numRewards = ribbonIds.length;
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
          showPromises.push(this._showRewardRibbon(ribbonIds[i], cc.p(offsetX, offsetY)));
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

  _showRewardRibbon(ribbonId, targetScreenPosition) {
    const ribbonRewardNode = new RibbonRewardNode(ribbonId);
    ribbonRewardNode.setPosition(targetScreenPosition);
    this.addChild(ribbonRewardNode);

    return ribbonRewardNode.animateReward(true, false);
  },
  /* endregion REWARD RIBBONS */

});

ProgressionRewardLayer.create = function (layer) {
  return RewardLayer.create(layer || new ProgressionRewardLayer());
};

module.exports = ProgressionRewardLayer;
