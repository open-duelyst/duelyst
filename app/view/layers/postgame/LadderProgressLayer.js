// pragma PKGS: ladder_progress
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
const GiftCrateNode = require('app/view/nodes/reward/GiftCrateNode');
const Promise = require('bluebird');
const FXLensFlareSprite = require('app/view/nodes/fx/FXLensFlareSprite');
const BaseParticleSystem = require('app/view/nodes/BaseParticleSystem');
const i18next = require('i18next');

/** **************************************************************************
 LadderProgressLayer
 *************************************************************************** */

const LadderProgressLayer = RewardLayer.extend({
  _rankedChevronPlateSprite: null,
  _divisionMedalSprite: null,
  _seasonHeaderLabel: null,
  _currentDivisionLabel: null,
  _chevronSprites: null,
  _nextDivisionLabel: null,
  _rankHeaderStaticLabel: null,
  _currentRankLabel: null,
  _lootCrateNode: null,
  _lootCrateHeaderLabel: null,
  _winStreakLabel: null,
  _showWinStreakLabel: null,

  _ladderRankingStaticLabel: null,
  _previousLadderRankingLabel: null,
  _currentLadderRankingLabel: null,

  // For tracking the currently shown state
  _currentShownRank: null,
  _currentShownStars: null,
  _currentShownDivisionKey: null,

  _rankStarsChange: null,

  _userTopRank: null,

  getRequiredResources() {
    return RewardLayer.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier('ladder_progress'));
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

    this._userTopRank = GamesManager.getInstance().rankingModel.get('top_rank');
    if (this._userTopRank == null) {
      this._userTopRank = 30;
    }
  },

  showLadderProgress(model) {
    this.model = model;

    this._currentShownRank = this.model.get('rank_before');
    this._currentShownStars = this.model.get('rank_stars_before');
    this._currentShownDivisionKey = SDK.RankFactory.rankedDivisionAssetNameForRank(this._currentShownRank);

    this._rankStarsChange = this.model.get('rank_stars_delta');
    if (this.model.get('rank_delta') == 1) {
      // If we lost a rank, the rank stars delta is 0 so add negative one
      this._rankStarsChange -= 1;
    }

    const rankMedalResource = RSX[`season_rank_${this._currentShownDivisionKey}`];
    const rankRequestId = `season_rank_${this._currentShownDivisionKey}_${UtilsJavascript.generateIncrementalId()}`;
    this.addResourceRequest(rankRequestId, null, [rankMedalResource]);

    Promise.all([
      this.whenRequiredResourcesReady(),
      this.whenResourcesReady(rankRequestId),
    ])
      .spread((requiredRequestId, rankRequestId) => {
        if (!this.getAreResourcesValid(requiredRequestId) || !this.getAreResourcesValid(rankRequestId)) return; // load invalidated or resources changed

        // disable and reset continue
        this.disablePressToContinueAndHitboxesAndCallback();

        this._rankedChevronPlateSprite = new BaseSprite(RSX.ranked_chevron_plate.img);
        this._rankedChevronPlateSprite.setOpacity(0);
        this.addChild(this._rankedChevronPlateSprite);

        // TODO: Add pulsing glow behind current rank label
        this._currentRankLabel = new cc.LabelTTF(`${model.get('rank_before')}`, RSX.font_bold.name, 50, cc.size(200, 50), cc.TEXT_ALIGNMENT_CENTER);
        this._currentRankLabel.setFontFillColor(CONFIG.POST_GAME_RANK_PRIMARY_COLOR);
        this._currentRankLabel.setOpacity(0);
        this.addChild(this._currentRankLabel);
        this._currentRankLabel.setPositionCenterOfSprite(this._rankedChevronPlateSprite);

        this._rankHeaderStaticLabel = new cc.LabelTTF(i18next.t('rank.rank').toUpperCase(), RSX.font_light.name, 20, cc.size(200, 22), cc.TEXT_ALIGNMENT_CENTER);
        this._rankHeaderStaticLabel.setFontFillColor(CONFIG.POST_GAME_RANK_SECONDARY_COLOR);
        this._rankHeaderStaticLabel.setOpacity(0);
        this.addChild(this._rankHeaderStaticLabel);
        this._rankHeaderStaticLabel.setPositionAboveSprite(this._currentRankLabel, cc.p(0, -5));

        this._divisionMedalSprite = this._createRankMedalSprite(this._currentShownRank);
        this._divisionMedalSprite.setOpacity(0);
        this.addChild(this._divisionMedalSprite);
        this._divisionMedalSprite.setPositionBelowSprite(this._rankedChevronPlateSprite, null, cc.p(0, 0.4));

        const divisionName = SDK.RankFactory.rankedDivisionNameForRank(model.get('rank_before'));
        this._currentDivisionLabel = new cc.LabelTTF(divisionName.toUpperCase(), RSX.font_bold.name, 14, cc.size(1200, 16), cc.TEXT_ALIGNMENT_CENTER);
        this._currentDivisionLabel.setFontFillColor(CONFIG.POST_GAME_RANK_PRIMARY_COLOR);
        this._currentDivisionLabel.setOpacity(0);
        this.addChild(this._currentDivisionLabel);
        this._currentDivisionLabel.setPositionBelowSprite(this._divisionMedalSprite);

        this._ladderRankingStaticLabel = new cc.LabelTTF('S-Rank Position: ', RSX.font_bold.name, 14, cc.size(110, 16), cc.TEXT_ALIGNMENT_CENTER);
        this._ladderRankingStaticLabel.setFontFillColor(CONFIG.POST_GAME_RANK_PRIMARY_COLOR);
        if (model.get('ladder_position_after')) {
          this.addChild(this._ladderRankingStaticLabel);
        }
        this._ladderRankingStaticLabel.setOpacity(0);
        this._ladderRankingStaticLabel.setPositionBelowSprite(this._currentDivisionLabel);

        this._previousLadderRankingLabel = new cc.LabelTTF(model.get('ladder_position_before'), RSX.font_bold.name, 14, cc.size(1200, 16), cc.TEXT_ALIGNMENT_CENTER);
        this._previousLadderRankingLabel.setFontFillColor(CONFIG.POST_GAME_RANK_PRIMARY_COLOR);
        if (model.get('ladder_position_before')) {
          this.addChild(this._previousLadderRankingLabel);
        }
        this._previousLadderRankingLabel.setOpacity(0);
        this._previousLadderRankingLabel.setPositionRightOfSprite(this._ladderRankingStaticLabel);

        this._currentLadderRankingLabel = new cc.LabelTTF(model.get('ladder_position_after'), RSX.font_bold.name, 14, cc.size(1200, 16), cc.TEXT_ALIGNMENT_CENTER);
        this._currentLadderRankingLabel.setFontFillColor(CONFIG.POST_GAME_RANK_PRIMARY_COLOR);
        if (model.get('ladder_position_after')) {
          this.addChild(this._currentLadderRankingLabel);
        }
        this._currentLadderRankingLabel.setOpacity(0);
        this._currentLadderRankingLabel.setPositionRightOfSprite(this._ladderRankingStaticLabel);

        const monthName = moment().format('MMMM');
        const seasonString = `${monthName.toUpperCase()} ${i18next.t('rank.season')}`;
        this._seasonHeaderLabel = new cc.LabelTTF(seasonString, RSX.font_light.name, 12, cc.size(200, 14), cc.TEXT_ALIGNMENT_CENTER);
        this._seasonHeaderLabel.setFontFillColor(CONFIG.POST_GAME_RANK_SECONDARY_COLOR);
        this._seasonHeaderLabel.setOpacity(0);
        this.addChild(this._seasonHeaderLabel);
        this._seasonHeaderLabel.setPositionBelowSprite(this._currentRankLabel, cc.p(0, -5));

        const starsNeededForRank = SDK.RankFactory.starsNeededToAdvanceRank(this.model.get('rank_before'));
        const starsCompleted = this.model.get('rank_stars_before');

        const lootCrateScale = 0.6;
        this._lootCrateNode = new GiftCrateNode();
        this._lootCrateNode.setScale(lootCrateScale);
        this._lootCrateNode.setOpacity(0);
        this._lootCrateNode.setPositionRightOfSprite(this._divisionMedalSprite, cc.p(200, 0));
        this.addChild(this._lootCrateNode);

        let lootCrateHeaderText = i18next.t('rank.loot_crate_instructions');

        if (model.get('rank_before') == 0) {
          lootCrateHeaderText = i18next.t('rank.loot_crate_max_reached');
        }

        this._lootCrateHeaderLabel = new cc.LabelTTF(lootCrateHeaderText, RSX.font_regular.name, 14, cc.size(250, 35), cc.TEXT_ALIGNMENT_CENTER);
        this._lootCrateHeaderLabel.setFontFillColor(CONFIG.POST_GAME_RANK_SECONDARY_COLOR);
        this._lootCrateHeaderLabel.setOpacity(0);
        this._lootCrateHeaderLabel.setPositionAboveSprite(this._lootCrateNode, cc.p(0, 20));
        this.addChild(this._lootCrateHeaderLabel);

        this._animateInBaseState().then(() => {
          const rankWinStreak = this.model.get('rank_win_streak');
          if (rankWinStreak >= 3 && this._rankStarsChange >= 2) {
            this._winStreakLabel = new cc.LabelTTF(i18next.t('rank.win_streak_message', { win_count: rankWinStreak }), RSX.font_regular.name, 14, cc.size(250, 35), cc.TEXT_ALIGNMENT_CENTER);
            this._winStreakLabel.setFontFillColor(CONFIG.POST_GAME_RANK_SECONDARY_COLOR);
            this._winStreakLabel.setOpacity(0);
            this.addChild(this._winStreakLabel);
            this._winStreakLabel.setPositionAboveSprite(this._rankedChevronPlateSprite, cc.p(0, 70));

            this._winStreakLabel.runAction(cc.spawn(
              cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
              cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0).easing(cc.easeBackOut()),
            ));
          }

          return this._animateInChevronSprites(starsNeededForRank, starsCompleted);
        }).then(() => {
          // Handle the rank changes
          const rankChangePromiseCallbacks = [];
          for (var i = 0; i < Math.abs(this._rankStarsChange); i++) {
            if (this._rankStarsChange > 0) {
              rankChangePromiseCallbacks.push(() => this._handleChevronIncrease());
            } else {
              rankChangePromiseCallbacks.push(() => this._handleChevronDecrease());
            }
          }
          const chevronDeltas = [];
          for (var i = 0; i < Math.abs(this._rankStarsChange); i++) {
            if (this._rankStarsChange > 0) {
              chevronDeltas.push(1);
            } else {
              chevronDeltas.push(-1);
            }
          }

          return Promise.each(chevronDeltas, (chevronDelta) => {
            if (chevronDelta > 0) {
              return this._handleChevronIncrease();
            }
            return this._handleChevronDecrease();
          }, { concurrency: 1 });
        }).then(() => {
          if (this.model.get('ladder_position_after')) {
            return this.animateSRankLadderProgress(this.model.get('ladder_position_after'), this.model.get('ladder_position_before'));
          }
          return Promise.resolve();
        })
          .then(() => this._lootCrateNode.showReveal(lootCrateScale, false))
          .then(() => this._lootCrateNode.showIdleState(CONFIG.ANIMATE_MEDIUM_DURATION))
          .then(() => {
            // If player increased division call method to emphasize loot crate upgrade
            if (SDK.RankFactory.rankedDivisionAssetNameForRank(model.get('rank_before')) != this._currentShownDivisionKey) {
              return this._highlightCrateUpgrade();
            }
            return Promise.resolve();
          })
          .then(() => {
            this.setIsContinueOnPressAnywhere(true);
            this.setIsInteractionEnabled(true);

            this.continueNode.setOpacity(0);
            this.continueNode.setScale(0.8);
            this._lootCrateHeaderLabel.setOpacity(0);
            this._lootCrateHeaderLabel.setScale(0.8);

            // final show actions
            const finalAnimations = [
              cc.targetedAction(this.continueNode, cc.spawn(
                cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
                cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0).easing(cc.easeBackOut()),
              )),
              cc.targetedAction(this._lootCrateHeaderLabel, cc.spawn(
                cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
                cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0).easing(cc.easeBackOut()),
              )),
            ];

            if (this._currentShownRank != 0) {
              // Add next division label
              let nextDivisionName = '';
              let nextDivisionRank = 30;
              for (let i = this._currentShownRank; i >= 0; i--) {
                if (SDK.RankFactory.rankedDivisionAssetNameForRank(i) != this._currentShownDivisionKey) {
                  nextDivisionName = SDK.RankFactory.rankedDivisionAssetNameForRank(i);
                  nextDivisionRank = i;
                  break;
                }
              }
              const nextDivisionLocalizedStr = i18next.t('rank.next_division_message', {
                division_name: SDK.RankFactory.rankedDivisionNameForRank(nextDivisionRank),
                rank: nextDivisionRank,
              });
              this._nextDivisionLabel = new cc.LabelTTF(nextDivisionLocalizedStr, RSX.font_light.name, 12, cc.size(1200, 14), cc.TEXT_ALIGNMENT_CENTER);
              this._nextDivisionLabel.setFontFillColor(CONFIG.POST_GAME_RANK_SECONDARY_COLOR);
              this._nextDivisionLabel.setPositionBelowSprite(this._lootCrateNode, cc.p(0, -20));
              this.addChild(this._nextDivisionLabel);

              // set up for animation
              this._nextDivisionLabel.setOpacity(0);
              this._nextDivisionLabel.setScale(0.8);

              finalAnimations.push(cc.targetedAction(this._nextDivisionLabel, cc.spawn(
                cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
                cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0).easing(cc.easeBackOut()),
              )));
            }

            this.runAction(cc.sequence(
              cc.delayTime(0.5), // Adding a delay to not have the animations run together
              cc.spawn(finalAnimations),
            ));
          });
      });
  },

  /**
   * Iterates rank stars up by one and calls necessary animations
   * @private
   */
  _handleChevronIncrease() {
    if (this._currentShownStars == SDK.RankFactory.starsNeededToAdvanceRank(this._currentShownRank)) {
      // Show a rank up then a chevron gain
      return this._animateGainingRank().then(() => this._animateGainingChevron());
    } if (this._currentShownStars + 1 == SDK.RankFactory.starsNeededToAdvanceRank(this._currentShownRank)) {
      // Show chevron gain then a rank up
      return this._animateGainingChevron().then(() => this._animateGainingRank());
    }
    return this._animateGainingChevron();
  },

  _handleChevronDecrease() {
    if (this._currentShownStars == 0) {
      // Show a rank loss
      return this._animateLosingRank();
    }
    return this._animateLosingChevron();
  },

  /**
   * Animates in a the base graphics of the screen
   * @private
   * @return {Promise} A promise which resolves when animation is complete
   */
  _animateInBaseState() {
    return new Promise((resolve) => {
      const rankedPlateYMovement = 20;
      const divisionMedalYMovement = 50;

      this._rankedChevronPlateSprite.setPositionY(this._rankedChevronPlateSprite.getPositionY() - rankedPlateYMovement);
      this._divisionMedalSprite.setPositionY(this._divisionMedalSprite.getPositionY() - divisionMedalYMovement);

      this._currentRankLabel.setScale(0.8);
      this._seasonHeaderLabel.setScale(0.8);
      this._rankHeaderStaticLabel.setScale(0.8);
      this._currentDivisionLabel.setScale(0.8);

      this.runAction(cc.sequence(
        // Show the plate
        cc.targetedAction(this._rankedChevronPlateSprite, cc.spawn(
          cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
          cc.moveBy(CONFIG.ANIMATE_MEDIUM_DURATION, 0, rankedPlateYMovement).easing(cc.easeExponentialOut()),
        )),
        // show the division medal
        cc.targetedAction(this._divisionMedalSprite, cc.spawn(
          cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
          cc.moveBy(CONFIG.ANIMATE_MEDIUM_DURATION, 0, divisionMedalYMovement).easing(cc.easeExponentialOut()),
        )),
        // Show the rank labels
        cc.spawn(
          cc.targetedAction(this._currentRankLabel, cc.spawn(
            cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
            cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0).easing(cc.easeBackOut()),
          )),
          cc.targetedAction(this._rankHeaderStaticLabel, cc.spawn(
            cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
            cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0).easing(cc.easeBackOut()),
          )),
          cc.targetedAction(this._seasonHeaderLabel, cc.spawn(
            cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
            cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0).easing(cc.easeBackOut()),
          )),
          cc.targetedAction(this._currentDivisionLabel, cc.spawn(
            cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
            cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0).easing(cc.easeBackOut()),
          )),
          cc.callFunc(() => {
            resolve();
          }),
        ),
      ));
    });
  },

  /**
   * Animates in a new set of chevrons (and animates out the old ones if they exist)
   * @private
   * @param integer numChevrons - number of chevrons to show
   * @param integer numFullChevrons - number of chevrons to show
   * @return {Promise} A promise which resolves when animation is complete
   */
  _animateInChevronSprites(numChevrons, numFullChevrons) {
    return new Promise((resolve) => {
      numChevrons = numChevrons || 0;
      numFullChevrons = numFullChevrons || 0;
      const oldChevronSprites = this._chevronSprites;
      this._chevronSprites = [];

      // Build new chevron sprites
      for (let i = 0; i < numChevrons; i++) {
        var newChevronSprite;
        if (i < numFullChevrons) {
          newChevronSprite = new BaseSprite(RSX.ranked_chevron_full.img);
        } else {
          newChevronSprite = new BaseSprite(RSX.ranked_chevron_empty.img);
        }
        this._chevronSprites.push(newChevronSprite);
        newChevronSprite.setOpacity(0);
        this.addChild(newChevronSprite);
        this._setPositionOfChevronSprite(newChevronSprite, i, numChevrons);
      }

      // animating old ones out and new ones in
      const oldChevronAnimateOuts = _.map(oldChevronSprites, (oldChevronSprite) => cc.targetedAction(oldChevronSprite, cc.sequence(
        cc.fadeOut(CONFIG.ANIMATE_MEDIUM_DURATION),
        cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 0.8).easing(cc.easeBackIn()),
        cc.removeSelf(),
      )));

      const newChevronAnimateIns = _.map(this._chevronSprites, (newChevronSprite, index) => cc.targetedAction(newChevronSprite, cc.sequence(
        cc.delayTime(CONFIG.ANIMATE_MEDIUM_DURATION * 0.5 * index), // Staggered delay
        cc.spawn(
          cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0).easing(cc.easeBackOut()),
          cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
        ),
      )));

      if (oldChevronAnimateOuts.length != 0 || newChevronAnimateIns.length != 0) {
        this.runAction(cc.sequence(
          cc.spawn(oldChevronAnimateOuts.concat(newChevronAnimateIns)),
          cc.callFunc(() => {
            resolve();
          }),
        ));
      } else {
        resolve();
      }
    });
  },

  /**
   * Set Chevron position
   * @private
   * @param cc.Sprite chevronSprite - sprite to be positioned
   * @param integer chevronIndex - Index position of chevron
   * @param integer numChevrons - number of chevrons being shown
   */
  _setPositionOfChevronSprite(chevronSprite, chevronIndex, numChevrons) {
    const chevronSpacing = 1.05;
    chevronSprite.setPositionAboveSprite(this._rankedChevronPlateSprite, null, cc.p((chevronIndex - (numChevrons - 1) * 0.5) * chevronSpacing, -0.3));
  },

  /**
   * Animate filling the next chevron
   * @private
   * @return {Promise} A promise which resolves when animation is complete
   */
  _animateGainingChevron() {
    return new Promise((resolve) => {
      // Play gain chevron sfx
      audio_engine.current().play_effect(RSX.sfx_unit_onclick.audio, false);

      this._currentShownStars += 1;
      const chevronIndex = this._currentShownStars - 1;
      const oldChevronSprite = this._chevronSprites[chevronIndex];
      const newChevronSprite = new BaseSprite(RSX.ranked_chevron_full.img);
      this._chevronSprites[chevronIndex] = newChevronSprite;
      newChevronSprite.setPosition(oldChevronSprite.getPosition());
      newChevronSprite.setOpacity(0);
      newChevronSprite.setScale(0.8);
      this.addChild(newChevronSprite);

      const rings = BaseParticleSystem.create(RSX.ptcl_ring_glow_circle.plist);
      rings.setScale(1.1);
      rings.setPositionCenterOfSprite(oldChevronSprite);
      rings.resumeSystem();
      rings.setPositionType(cc.ParticleSystem.TYPE_RELATIVE);
      this.addChild(rings);

      this.runAction(cc.sequence(
        cc.targetedAction(newChevronSprite, cc.spawn(
          cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
          cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0).easing(cc.easeBackOut()),
        )),
        cc.targetedAction(oldChevronSprite, cc.removeSelf()),
        cc.callFunc(((rings) => {
          rings.stopSystem();
          resolve();
        }).bind(this, rings)),
      ));
    });
  },

  /**
   * Animate losing last chevron
   * @private
   * @return {Promise} A promise which resolves when animation is complete
   */
  _animateLosingChevron() {
    return new Promise((resolve) => {
      // play gain chevron sfx
      audio_engine.current().play_effect(RSX.sfx_unit_onclick.audio, false);

      this._currentShownStars -= 1;
      const chevronIndex = this._currentShownStars;
      const oldChevronSprite = this._chevronSprites[chevronIndex];
      const newChevronSprite = new BaseSprite(RSX.ranked_chevron_empty.img);
      this._chevronSprites[chevronIndex] = newChevronSprite;
      newChevronSprite.setPosition(oldChevronSprite.getPosition());
      newChevronSprite.setOpacity(0);
      newChevronSprite.setScale(0.8);
      this.addChild(newChevronSprite);

      const inwardsParticles = BaseParticleSystem.create(RSX.ptcl_rank_chevron_inwards.plist);
      inwardsParticles.setPositionCenterOfSprite(oldChevronSprite);
      inwardsParticles.setDuration(CONFIG.ANIMATE_FAST_DURATION);
      inwardsParticles.resumeSystem();
      inwardsParticles.setAutoRemoveOnFinish(true);
      inwardsParticles.setPositionType(cc.ParticleSystem.TYPE_RELATIVE);
      inwardsParticles.setZOrder(-1);
      this.addChild(inwardsParticles);

      this.runAction(cc.sequence(
        cc.spawn(
          cc.targetedAction(oldChevronSprite, cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 0.8).easing(cc.easeOut(3.0))),
          cc.targetedAction(oldChevronSprite, cc.fadeOut(CONFIG.ANIMATE_MEDIUM_DURATION)),
          cc.targetedAction(newChevronSprite, cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION)),
          cc.targetedAction(newChevronSprite, cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0).easing(cc.easeOut(3.0))),
        ),
        cc.targetedAction(oldChevronSprite, cc.removeSelf()),
        cc.callFunc(() => {
          resolve();
        }),
      ));
    });
  },

  /**
   * Animate completing a rank
   * @private
   * @param integer newRank - Players new rank
   * @return {Promise} A promise which resolves when animation is complete
   */
  _animateGainingRank() {
    return new Promise((resolve) => {
      // play rank change
      audio_engine.current().play_effect(RSX.sfx_unit_deploy_3.audio, false);

      this._currentShownRank -= 1;
      this._currentShownStars = 0;

      const oldRankLabel = this._currentRankLabel;

      this._currentRankLabel = new cc.LabelTTF(`${this._currentShownRank}`, RSX.font_bold.name, 50, cc.size(1200, 50), cc.TEXT_ALIGNMENT_CENTER);
      this._currentRankLabel.setFontFillColor(CONFIG.POST_GAME_RANK_PRIMARY_COLOR);
      this.addChild(this._currentRankLabel);
      this._currentRankLabel.setPositionBelowSprite(oldRankLabel);

      // movement distance for rank labels
      const moveDistance = cc.p(
        oldRankLabel.getPositionX() - this._currentRankLabel.getPositionX(),
        oldRankLabel.getPositionY() - this._currentRankLabel.getPositionY(),
      );
      const animateOutOldRankAction = cc.targetedAction(oldRankLabel, cc.sequence(
        cc.spawn(
          cc.fadeOut(CONFIG.ANIMATE_MEDIUM_DURATION),
          cc.moveBy(CONFIG.ANIMATE_MEDIUM_DURATION, moveDistance).easing(cc.easeExponentialOut()),
        ),
        cc.removeSelf(),
      ));
      const animateInNewRankAction = cc.targetedAction(this._currentRankLabel, cc.spawn(
        cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
        cc.moveBy(CONFIG.ANIMATE_MEDIUM_DURATION, moveDistance).easing(cc.easeExponentialOut()),
      ));

      this.runAction(cc.sequence(
        cc.spawn(
          animateOutOldRankAction,
          animateInNewRankAction,
        ),
        cc.callFunc(() => {
          resolve();
        }),
      ));
    }).then(() => {
      if (SDK.RankFactory.rankedDivisionAssetNameForRank(this._currentShownRank) == this._currentShownDivisionKey) {
        return Promise.resolve();
      }
      return this._animateDivisionIncrease();
    }).then(() =>
    // Replace old filled chevrons with new cheons
      this._animateInChevronSprites(SDK.RankFactory.starsNeededToAdvanceRank(this._currentShownRank), 0));
  },

  /**
   * Animate completing a rank
   * @private
   * @return {Promise} A promise which resolves when animation is complete
   */
  _animateLosingRank() {
    return new Promise((resolve) => {
      // play rank change
      audio_engine.current().play_effect(RSX.sfx_unit_deploy_1.audio, false);

      this._currentShownRank += 1;
      this._currentShownStars = SDK.RankFactory.starsNeededToAdvanceRank(this._currentShownRank);

      const oldRankLabel = this._currentRankLabel;

      this._currentRankLabel = new cc.LabelTTF(`${this._currentShownRank}`, RSX.font_bold.name, 50, cc.size(1200, 50), cc.TEXT_ALIGNMENT_CENTER);
      this._currentRankLabel.setFontFillColor(CONFIG.POST_GAME_RANK_SECONDARY_COLOR);
      this.addChild(this._currentRankLabel);
      this._currentRankLabel.setPositionAboveSprite(oldRankLabel);

      // movement distance for rank labels
      const moveDistance = cc.p(
        oldRankLabel.getPositionX() - this._currentRankLabel.getPositionX(),
        oldRankLabel.getPositionY() - this._currentRankLabel.getPositionY(),
      );
      const animateOutOldRankAction = cc.targetedAction(oldRankLabel, cc.sequence(
        cc.spawn(
          cc.fadeOut(CONFIG.ANIMATE_MEDIUM_DURATION),
          cc.moveBy(CONFIG.ANIMATE_MEDIUM_DURATION, moveDistance).easing(cc.easeExponentialOut()),
        ),
        cc.removeSelf(),
      ));
      const animateInNewRankAction = cc.targetedAction(this._currentRankLabel, cc.spawn(
        cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
        cc.moveBy(CONFIG.ANIMATE_MEDIUM_DURATION, moveDistance).easing(cc.easeExponentialOut()),
      ));

      this.runAction(cc.sequence(
        cc.spawn(
          animateOutOldRankAction,
          animateInNewRankAction,
        ),
        cc.callFunc(() => {
          resolve();
        }),
      ));
    }).then(() =>
    // Replace old filled chevrons with new chevrons
      this._animateInChevronSprites(SDK.RankFactory.starsNeededToAdvanceRank(this._currentShownRank), this._currentShownStars));
  },

  rankMedalResourceForRank(rank) {

  },

  /**
   * Iterates rank stars up by one and calls necessary animations
   * @param {String} rank
   * @private
   * @return {cc.Sprite} The new rank medal sprite, with no parent
   */
  _createRankMedalSprite(rank) {
    const rankMedalResource = RSX[`season_rank_${SDK.RankFactory.rankedDivisionAssetNameForRank(rank)}`];
    const rankMedalSprite = new BaseSprite(rankMedalResource.img);
    // Sizing the medal sprite
    let medalSpriteWidth = 0;
    let medalSpriteHeight = 0;
    const divisionKey = SDK.RankFactory.rankedDivisionAssetNameForRank(rank);
    if (divisionKey == 'bronze') {
      medalSpriteWidth = 298.0;
      medalSpriteHeight = 180.0;
    } else if (divisionKey == 'silver') {
      medalSpriteWidth = 364.0;
      medalSpriteHeight = 180.0;
    } else if (divisionKey == 'gold') {
      medalSpriteWidth = 376.0;
      medalSpriteHeight = 180.0;
    } else if (divisionKey == 'diamond') {
      medalSpriteWidth = 284.0;
      medalSpriteHeight = 220.0;
    } else if (divisionKey == 'elite') {
      medalSpriteWidth = 316.0;
      medalSpriteHeight = 180.0;
    } else {
      // unknown division, default to bronze dimensions and warn
      medalSpriteWidth = 298.0;
      medalSpriteHeight = 180.0;
      console.warn(`LadderProgressLayer: Unknown division key - Rank ${model.get('rank_before')} gave division key ${divisionKey}`);
    }

    rankMedalSprite.scaleX = medalSpriteWidth / rankMedalSprite.getContentSize().width * 0.8;
    rankMedalSprite.scaleY = medalSpriteHeight / rankMedalSprite.getContentSize().height * 0.8;

    return rankMedalSprite;
  },

  /**
   * Animate going up a division
   * @private
   * @return {Promise} A promise which resolves when animation is complete
   */
  _animateDivisionIncrease() {
    return new Promise((resolve) => {
      this._currentShownDivisionKey = SDK.RankFactory.rankedDivisionAssetNameForRank(this._currentShownRank);

      const rankMedalResource = RSX[`season_rank_${this._currentShownDivisionKey}`];
      const rankMedalGlowOutlineResource = RSX[`season_rank_${this._currentShownDivisionKey}_glow_outline`];
      const rankRequestId = `season_rank_${this._currentShownDivisionKey}_${UtilsJavascript.generateIncrementalId()}`;
      this.addResourceRequest(rankRequestId, null, [
        rankMedalResource,
        rankMedalGlowOutlineResource,
      ]);

      this.whenResourcesReady(rankRequestId).then((requestId) => {
        if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

        // Play division increase sfx
        audio_engine.current().play_effect(RSX.sfx_deploy_circle1.audio, false);

        const oldMedalSprite = this._divisionMedalSprite;
        const animateOutOldDivisionAction = cc.targetedAction(oldMedalSprite, cc.sequence(
          cc.spawn(
            cc.fadeOut(CONFIG.ANIMATE_MEDIUM_DURATION),
            cc.scaleBy(CONFIG.ANIMATE_MEDIUM_DURATION, 0.8).easing(cc.easeBackIn()),
          ),
          cc.removeSelf(),
        ));

        // lens flare that highlights from below
        const flare = FXLensFlareSprite.create();
        flare.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
        flare.setScale(4.0);
        flare.setPulseRate(0.0);
        flare.setSpeed(2.0);
        flare.setWispSize(0.3);
        flare.setArmLength(0.2);
        flare.setOpacity(0);
        flare.setPositionCenterOfSprite(oldMedalSprite);
        this.addChild(flare);

        const animateFlareAction = cc.targetedAction(flare, cc.sequence(
          cc.EaseCubicActionIn.create(cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION)),
          cc.delayTime(0.2),
          cc.EaseCubicActionOut.create(cc.fadeOut(0.8)),
          cc.callFunc(() => {
            flare.setVisible(false);
            flare.destroy();
          }),
        ));

        this._divisionMedalSprite = this._createRankMedalSprite(this._currentShownRank);
        this._divisionMedalSprite.setOpacity(0);
        this.addChild(this._divisionMedalSprite);
        const animateInNewDivisionAction = cc.targetedAction(this._divisionMedalSprite, cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION));
        this._divisionMedalSprite.setPositionBelowSprite(this._rankedChevronPlateSprite, null, cc.p(0, 0.4));

        const rankMedalGlowOutlineSprite = new BaseSprite(rankMedalGlowOutlineResource.img);
        rankMedalGlowOutlineSprite.setPositionCenterOfSprite(oldMedalSprite);
        rankMedalGlowOutlineSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
        rankMedalGlowOutlineSprite.setOpacity(0);
        rankMedalGlowOutlineSprite.setScaleX(this._divisionMedalSprite.getScaleX() * 0.8);
        rankMedalGlowOutlineSprite.setScaleY(this._divisionMedalSprite.getScaleY() * 0.8);
        this.addChild(rankMedalGlowOutlineSprite);

        const animateInOutlineAction = cc.targetedAction(rankMedalGlowOutlineSprite, cc.spawn(
          cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
          cc.scaleBy(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0 / 0.8).easing(cc.easeBackOut()),
        ));

        const animateOutOutlineAction = cc.targetedAction(rankMedalGlowOutlineSprite, cc.sequence(
          cc.fadeOut(0.6),
          cc.removeSelf(),
        ));

        this.runAction(cc.sequence(
          cc.targetedAction(this._currentDivisionLabel, cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION)),
          animateOutOldDivisionAction,
          animateInOutlineAction,
          cc.spawn(
            animateInNewDivisionAction,
            animateFlareAction,
          ),
          animateOutOutlineAction,
          cc.callFunc(() => {
            this._currentDivisionLabel.setString(SDK.RankFactory.rankedDivisionNameForRank(this._currentShownRank));
            this._currentDivisionLabel.setPositionBelowSprite(this._divisionMedalSprite);
          }),
          cc.spawn(
            cc.targetedAction(this._currentDivisionLabel, cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION)),
          ),
          cc.delayTime(0.2), // To allow for emphasis on rank up
          cc.callFunc(() => {
            resolve();
          }),
        ));
      });
    });
  },

  animateSRankLadderProgress(currentLadderPosition, previousLadderPosition) {
    if (previousLadderPosition == null || (previousLadderPosition == currentLadderPosition)) {
      // No previous ladder position ( or it stayed the same), just animate in the new position
      return new Promise((resolve) => {
        this._ladderRankingStaticLabel.setScale(0.8);
        this._currentLadderRankingLabel.setScale(0.8);
        this.runAction(cc.sequence(
          // Show the current position and static label
          cc.spawn(
            cc.targetedAction(this._ladderRankingStaticLabel, cc.spawn(
              cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
              cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0).easing(cc.easeBackOut()),
            )),
            cc.targetedAction(this._currentLadderRankingLabel, cc.spawn(
              cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
              cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0).easing(cc.easeBackOut()),
            )),
          ),
          cc.callFunc(() => {
            resolve();
          }),
        ));
      });
    }
    // Show the previous ladder position, then animate in the new position
    return new Promise((resolve) => {
      this._ladderRankingStaticLabel.setScale(0.8);
      this._previousLadderRankingLabel.setScale(0.8);
      if (currentLadderPosition < previousLadderPosition) {
        this._currentLadderRankingLabel.setPositionBelowSprite(this._previousLadderRankingLabel);
      } else {
        this._currentLadderRankingLabel.setPositionAboveSprite(this._previousLadderRankingLabel);
      }
      this._currentLadderRankingLabel.setPositionBelowSprite(this._previousLadderRankingLabel);
      const yMovement = this._previousLadderRankingLabel.getPositionY() - this._currentLadderRankingLabel.getPositionY();
      this.runAction(cc.sequence(
        // Show the previous position and static label
        cc.spawn(
          cc.targetedAction(this._ladderRankingStaticLabel, cc.spawn(
            cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
            cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0).easing(cc.easeBackOut()),
          )),
          cc.targetedAction(this._previousLadderRankingLabel, cc.spawn(
            cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
            cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0).easing(cc.easeBackOut()),
          )),
        ),
        // Animate in new label and out old label
        cc.spawn(
          cc.targetedAction(this._currentLadderRankingLabel, cc.spawn(
            cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
            cc.moveBy(CONFIG.ANIMATE_MEDIUM_DURATION, 0, yMovement).easing(cc.easeExponentialOut()),
          )),
          cc.targetedAction(this._previousLadderRankingLabel, cc.spawn(
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

  /**
   * Animates emphasis that player's loot crate has upgraded
   * @private
   * @return {Promise} A promise which resolves when animation is complete
   */
  _highlightCrateUpgrade() {
    return Promise.resolve();
  },
});

LadderProgressLayer.create = function (layer) {
  return RewardLayer.create(layer || new LadderProgressLayer());
};

module.exports = LadderProgressLayer;
