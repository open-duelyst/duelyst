// pragma PKGS: rift_progress
const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const PKGS = require('app/data/packages');
const audio_engine = require('app/audio/audio_engine');
const RewardLayer = require('app/view/layers/reward/RewardLayer');
const BaseSprite = require('app/view/nodes/BaseSprite');
const moment = require('moment');
const Promise = require('bluebird');
const FXLensFlareSprite = require('app/view/nodes/fx/FXLensFlareSprite');
const BaseParticleSystem = require('app/view/nodes/BaseParticleSystem');
const RiftHelper = require('app/sdk/rift/riftHelper');
const FXRiftLineSprite = require('app/view/nodes/fx/FXRiftLineSprite');
const MotionStreakRingNode = require('app/view//nodes/misc/MotionStreakRingNode');
const UtilsEngine = require('app/common/utils/utils_engine');

/** **************************************************************************
 RiftProgressLayer
 *************************************************************************** */

const RiftProgressLayer = RewardLayer.extend({

  // Cocos elements
  _motionStreakRing: null,
  _currentLevelLabel: null,
  _levelHeaderStaticLabel: null,
  _ratingStaticLabel: null,
  _previousRatingLabel: null,
  _newRatingLabel: null,
  _progressLineSprite: null,
  _progressDynamicLabel: null,
  _headerLabel: null,

  _riftPointsAfter: null,
  _riftPointsEarned: null,
  _riftPointsBefore: null,
  _riftRatingAfter: null,
  _riftRatingEarned: null,
  _riftRatingBefore: null,
  _riftLevelBefore: null,
  _riftLevelAfter: null,

  getRequiredResources() {
    return RewardLayer.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier('rift_progress'));
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

  showRiftProgress(model) {
    this.model = model;

    this._riftPointsAfter = this.model.get('rift_points') || 0;
    this._riftPointsEarned = this.model.get('rift_points_earned') || 0;
    this._riftPointsBefore = this._riftPointsAfter - this._riftPointsEarned;
    this._riftRatingAfter = this.model.get('rift_rating_after');
    if (this._riftRatingAfter == null) {
      this._riftRatingAfter = 400;
    }
    this._riftRatingEarned = this.model.get('rift_rating_earned') || 0;
    this._riftRatingBefore = this._riftRatingAfter - this._riftRatingEarned;

    this._riftLevelBefore = RiftHelper.levelForPoints(this._riftPointsBefore);
    this._riftLevelAfter = RiftHelper.levelForPoints(this._riftPointsAfter);

    this.whenRequiredResourcesReady()
      .bind(this)
      .then((requiredRequestId) => {
        if (!this.getAreResourcesValid(requiredRequestId)) return; // load invalidated or resources changed

        // disable and reset continue
        this.disablePressToContinueAndHitboxesAndCallback();

        const winHeight = UtilsEngine.getGSIWinHeight();

        this._riftLevelRingSprite = new BaseSprite(RSX.rift_level_ring.img);
        this._riftLevelRingSprite.setOpacity(0);
        this._riftLevelRingSprite.setAntiAlias(true);
        this._riftLevelRingSprite.setScale(1.2);

        this.addChild(this._riftLevelRingSprite);

        this._motionStreakRing = new MotionStreakRingNode();
        this._motionStreakRing.setScale(0.8);
        this._motionStreakRing.setOpacity(0);
        this.addChild(this._motionStreakRing);

        // Region: stuff in center of plate
        this._currentLevelLabel = new cc.LabelTTF(`${this._riftLevelBefore}`, RSX.font_bold.name, 50, cc.size(200, 50), cc.TEXT_ALIGNMENT_CENTER);
        this._currentLevelLabel.setFontFillColor(CONFIG.POST_GAME_RANK_PRIMARY_COLOR);
        this._currentLevelLabel.setOpacity(0);
        this.addChild(this._currentLevelLabel);
        this._currentLevelLabel.setPositionCenterOfSprite(this._riftLevelRingSprite);

        this._levelHeaderStaticLabel = new cc.LabelTTF('LEVEL', RSX.font_regular.name, 20, cc.size(200, 22), cc.TEXT_ALIGNMENT_CENTER);
        this._levelHeaderStaticLabel.setFontFillColor(CONFIG.POST_GAME_RANK_SECONDARY_COLOR);
        this._levelHeaderStaticLabel.setOpacity(0);
        this.addChild(this._levelHeaderStaticLabel);
        this._levelHeaderStaticLabel.setPositionAboveSprite(this._currentLevelLabel, cc.p(0, -5));

        // Endregion: stuff in center of plate

        // Region: Header

        this._headerLabel = new cc.LabelTTF('RIFT PROGRESS', RSX.font_bold.name, 64, cc.size(600, 80), cc.TEXT_ALIGNMENT_CENTER);
        this._headerLabel.setFontFillColor(CONFIG.POST_GAME_RANK_PRIMARY_COLOR);
        this._headerLabel.setOpacity(0);
        this.addChild(this._headerLabel);
        this._headerLabel.setPositionAboveSprite(this._riftLevelRingSprite, cc.p(0, 20));

        // Endregion: header

        // Region: stuff below plate

        this._ratingStaticLabel = new cc.LabelTTF('Rift Run Rating: ', RSX.font_bold.name, 14, cc.size(120, 18), cc.TEXT_ALIGNMENT_CENTER);
        this._ratingStaticLabel.setFontFillColor(CONFIG.POST_GAME_RANK_PRIMARY_COLOR);
        this.addChild(this._ratingStaticLabel);
        this._ratingStaticLabel.setOpacity(0);
        this._ratingStaticLabel.setPositionBelowSprite(this._riftLevelRingSprite, cc.p(-10, 20));

        this._previousRatingLabel = new cc.LabelTTF(this._riftRatingBefore, RSX.font_bold.name, 14, cc.size(100, 18), cc.TEXT_ALIGNMENT_CENTER);
        this._previousRatingLabel.setFontFillColor(CONFIG.POST_GAME_RANK_PRIMARY_COLOR);
        this.addChild(this._previousRatingLabel);
        this._previousRatingLabel.setOpacity(0);
        var offset = cc.p(-5, 0);
        if (this._riftRatingBefore >= 1000) offset = cc.p(0, 0);
        this._previousRatingLabel.setPositionRightOfSprite(this._ratingStaticLabel, offset);

        this._newRatingLabel = new cc.LabelTTF(this._riftRatingAfter, RSX.font_bold.name, 14, cc.size(100, 18), cc.TEXT_ALIGNMENT_CENTER);
        this._newRatingLabel.setFontFillColor(CONFIG.POST_GAME_RANK_PRIMARY_COLOR);
        this.addChild(this._newRatingLabel);
        this._newRatingLabel.setOpacity(0);
        var offset = cc.p(-5, 0);
        if (this._riftRatingAfter >= 1000) offset = cc.p(0, 0);
        this._newRatingLabel.setPositionRightOfSprite(this._ratingStaticLabel, offset);

        const currentLevelPointsProgress = this._riftPointsBefore - RiftHelper.totalPointsForLevel(this._riftLevelBefore);
        const currentLevelPointsNeeded = RiftHelper.pointsRequiredForLevel(this._riftLevelBefore + 1);
        this._progressLineSprite = new FXRiftLineSprite();
        this._progressLineSprite.setScale(10.5, 2.5);
        this._progressLineSprite.setProgress(currentLevelPointsProgress / currentLevelPointsNeeded);
        this._progressLineSprite.setPositionBelowSprite(this._ratingStaticLabel, cc.p(10, 0));
        this.addChild(this._progressLineSprite);

        this._progressDynamicLabel = new cc.LabelTTF('', RSX.font_regular.name, 14, cc.size(100, 16), cc.TEXT_ALIGNMENT_CENTER);
        this._progressDynamicLabel.setFontFillColor(CONFIG.POST_GAME_RANK_PRIMARY_COLOR);
        this.addChild(this._progressDynamicLabel);
        this._progressDynamicLabel.setOpacity(0);
        this._progressDynamicLabel.setPositionBelowSprite(this._progressLineSprite, cc.p(0, 30));
        this._setProgressUpdateTweenMethod(currentLevelPointsProgress, currentLevelPointsNeeded);

        // Endregion: stuff below plate

        this._animateInBaseState()
          .then(() => this._animateLevelProgress())
          .then(() => this._animateRatingChange()).then(() => {
            this.setIsContinueOnPressAnywhere(true);
            this.setIsInteractionEnabled(true);
          });
      });
  },

  _setProgressUpdateTweenMethod(currentLevelProgress, currentLevelProgressNeeded) {
    this._progressDynamicLabel.setString(`${currentLevelProgress} / ${currentLevelProgressNeeded}`);
    this._progressDynamicLabel.updateTweenAction = function (value, key) {
      if (key === 'string') {
        this.setString(`${Math.floor(value)} / ${currentLevelProgressNeeded}`);
      }
    }.bind(this._progressDynamicLabel);
  },

  /**
   * Animates in a the base graphics of the screen
   * @private
   * @return {Promise} A promise which resolves when animation is complete
   */
  _animateInBaseState() {
    return new Promise((resolve) => {
      const levelRingYMovement = 20;
      const headerPlateYMovement = -20;

      this._headerLabel.setPositionY(this._headerLabel.getPositionY() - headerPlateYMovement);
      this._riftLevelRingSprite.setPositionY(this._riftLevelRingSprite.getPositionY() - levelRingYMovement);

      this._currentLevelLabel.setScale(0.8);
      this._levelHeaderStaticLabel.setScale(0.8);
      this._ratingStaticLabel.setScale(0.8);
      this._previousRatingLabel.setScale(0.8);

      this.runAction(cc.sequence(
        cc.targetedAction(this._headerLabel, cc.spawn(
          cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
          cc.moveBy(CONFIG.ANIMATE_MEDIUM_DURATION, 0, headerPlateYMovement).easing(cc.easeExponentialOut()),
        )),
        cc.targetedAction(this._riftLevelRingSprite, cc.spawn(
          cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
          cc.moveBy(CONFIG.ANIMATE_MEDIUM_DURATION, 0, levelRingYMovement).easing(cc.easeExponentialOut()),
        )),
        // Show the initial labels
        cc.spawn(
          cc.targetedAction(this._currentLevelLabel, cc.spawn(
            cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
            cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0).easing(cc.easeBackOut()),
          )),
          cc.targetedAction(this._levelHeaderStaticLabel, cc.spawn(
            cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
            cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0).easing(cc.easeBackOut()),
          )),
          cc.targetedAction(this._ratingStaticLabel, cc.spawn(
            cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
            cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0).easing(cc.easeBackOut()),
          )),
          cc.targetedAction(this._previousRatingLabel, cc.spawn(
            cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
            cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0).easing(cc.easeBackOut()),
          )),
          cc.targetedAction(this._progressDynamicLabel, cc.spawn(
            cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
            cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0).easing(cc.easeBackOut()),
          )),
        ),
        cc.callFunc(() => {
          resolve();
        }),
      ));
    });
  },

  _animateLevelProgress(initialPoints, afterPoints) {
    if (initialPoints == null) {
      initialPoints = this._riftPointsBefore;
    }

    if (afterPoints == null) {
      afterPoints = this._riftPointsAfter;
    }

    if (initialPoints == afterPoints) {
      return Promise.resolve();
    }

    const initialLevel = RiftHelper.levelForPoints(initialPoints);
    let afterLevel = RiftHelper.levelForPoints(afterPoints);
    const finalPoints = afterPoints; // Store points to continue animating towards

    // Detect if we are wrapping past a level and cap to transitioning to that level
    let levelsInTransition = false;
    if (initialLevel != afterLevel) {
      levelsInTransition = true;
      afterLevel = initialLevel + 1;
      afterPoints = RiftHelper.totalPointsForLevel(afterLevel);
    }

    const initialLevelPointsProgress = initialPoints - RiftHelper.totalPointsForLevel(initialLevel);
    const afterLevelPointsProgress = afterPoints - RiftHelper.totalPointsForLevel(initialLevel);
    const currentLevelPointsNeeded = RiftHelper.pointsRequiredForLevel(initialLevel + 1);
    const initialProgress = initialLevelPointsProgress / currentLevelPointsNeeded;
    const newProgress = afterLevelPointsProgress / currentLevelPointsNeeded;

    const progressAnimationSpeed = this._getLevelProgressAnimationSpeed(afterPoints - initialPoints, newProgress - initialProgress);

    return new Promise((resolve) => {
      this.runAction(cc.sequence(
        // Show the plate
        cc.spawn(
          cc.targetedAction(this._progressLineSprite, cc.actionTween(progressAnimationSpeed, 'progress', initialProgress, newProgress).easing(cc.easeExponentialInOut())),
          cc.targetedAction(this._progressDynamicLabel, cc.actionTween(progressAnimationSpeed, 'string', initialLevelPointsProgress, afterLevelPointsProgress)),
        ),
        cc.callFunc(() => {
          if (!levelsInTransition) {
            resolve();
          } else {
            return this._animateLevelUp(afterPoints)
              .then(() => this._animateLevelProgress(afterPoints, finalPoints)).then(() => {
                resolve();
              });
          }
        }),
      ));
    });
  },

  _getLevelProgressAnimationSpeed(pointDelta, progressDelta) {
    // Fill up at a rate of 10 points per second
    return pointDelta / 10.0;
  },

  _animateLevelUp(currentRiftPoints) {
    return new Promise((resolve) => {
      const newLevelValue = RiftHelper.levelForPoints(currentRiftPoints);
      const newLevelLabel = new cc.LabelTTF(`${newLevelValue}`, RSX.font_bold.name, 50, cc.size(200, 50), cc.TEXT_ALIGNMENT_CENTER);
      newLevelLabel.setFontFillColor(CONFIG.POST_GAME_RANK_PRIMARY_COLOR);
      newLevelLabel.setOpacity(0);
      this.addChild(newLevelLabel);
      newLevelLabel.setPositionAboveSprite(this._currentLevelLabel);

      const yMovement = this._currentLevelLabel.getPositionY() - newLevelLabel.getPositionY();
      this.runAction(cc.sequence(
        // Animate in new label and out old label
        cc.spawn(
          cc.targetedAction(newLevelLabel, cc.spawn(
            cc.fadeIn(CONFIG.ANIMATE_SLOW_DURATION),
            cc.moveBy(CONFIG.ANIMATE_SLOW_DURATION, 0, yMovement).easing(cc.easeExponentialOut()),
          )),
          cc.targetedAction(this._currentLevelLabel, cc.spawn(
            cc.fadeOut(CONFIG.ANIMATE_SLOW_DURATION),
            cc.moveBy(CONFIG.ANIMATE_SLOW_DURATION, 0, yMovement).easing(cc.easeExponentialOut()),
          )),
          cc.callFunc(() => {
            audio_engine.current().play_effect(RSX.sfx_ui_tab_in.audio, false);
            this._motionStreakRing.animate();
          }),
        ),
        cc.callFunc(() => {
          this._currentLevelLabel = newLevelLabel;
          this._setProgressUpdateTweenMethod(0, RiftHelper.pointsRequiredForLevel(newLevelValue + 1));
          resolve();
        }),
      ));
    });
  },

  _animateRatingChange() {
    if (this._riftRatingBefore == this._riftRatingAfter) {
      // No change in rating no animation needed
      return Promise.resolve();
    }
    // Show the previous ladder position, then animate in the new position
    return new Promise((resolve) => {
      if (this._riftRatingAfter < this._riftRatingBefore) {
        this._newRatingLabel.setPositionBelowSprite(this._previousRatingLabel);
      } else {
        this._newRatingLabel.setPositionAboveSprite(this._previousRatingLabel);
      }
      const yMovement = this._previousRatingLabel.getPositionY() - this._newRatingLabel.getPositionY();
      audio_engine.current().play_effect(RSX.sfx_ui_dialogue_enter.audio, false);
      this.runAction(cc.sequence(
        // Animate in new label and out old label
        cc.spawn(
          cc.targetedAction(this._newRatingLabel, cc.spawn(
            cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
            cc.moveBy(CONFIG.ANIMATE_MEDIUM_DURATION, 0, yMovement).easing(cc.easeExponentialOut()),
          )),
          cc.targetedAction(this._previousRatingLabel, cc.spawn(
            cc.fadeOut(CONFIG.ANIMATE_MEDIUM_DURATION),
            cc.moveBy(CONFIG.ANIMATE_MEDIUM_DURATION, 0, yMovement).easing(cc.easeExponentialOut()),
          )),
        ),
        cc.callFunc(() => {
          resolve();
        }),
      ));
    });
  },

});

RiftProgressLayer.create = function (layer) {
  return RewardLayer.create(layer || new RiftProgressLayer());
};

module.exports = RiftProgressLayer;
