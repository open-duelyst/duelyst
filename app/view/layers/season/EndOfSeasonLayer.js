// pragma PKGS: end_of_season
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const RewardLayer = require('app/view/layers/reward/RewardLayer');
const BaseSprite = require('app/view/nodes/BaseSprite');
const FXLensFlareSprite = require('app/view/nodes/fx/FXLensFlareSprite');
const ZodiacNode = require('app/view/nodes/draw/Zodiac');
const RankFactory = require('app/sdk/rank/rankFactory');
const moment = require('moment');
const TweenTypes = require('app/view/actions/TweenTypes');
const GiftCrateNode = require('app/view/nodes/reward/GiftCrateNode');
const audio_engine = require('app/audio/audio_engine');
const GamesManager = require('app/ui/managers/games_manager');
const Promise = require('bluebird');
const i18next = require('i18next');

/** **************************************************************************
 EndOfSeasonLayer
 *************************************************************************** */

const EndOfSeasonLayer = RewardLayer.extend({

  bgColor: CONFIG.SEASON_BG_COLOR,
  continueButtonText: 'OPEN',

  _animationResolve: null,
  _lootCrateNode: null,
  _previousTopRank: null,
  _numChevronsRewarded: 0,
  _seasonModel: null,
  _willShowLootCrate: false,

  ctor(seasonModel) {
    if (seasonModel == null) {
      throw new Error('EndOfSeasonLayer must be initialized with season model!');
    }
    this._seasonModel = seasonModel;

    this._previousTopRank = this._seasonModel.get('top_rank') || this._seasonModel.get('rank');
    this._numChevronsRewarded = RankFactory.chevronsRewardedForReachingRank(this._previousTopRank);
    this._willShowLootCrate = RankFactory.willGetRewardsForReachingRank(this._previousTopRank, this._seasonModel.get('starting_at'));

    this._super();
  },

  getRequiredResources() {
    let resources = RewardLayer.prototype.getRequiredResources.call(this);

    // add end of season package
    resources = resources.concat(PKGS.getPkgForIdentifier('end_of_season'));

    // add season resources
    const previousRankMedalSpriteResource = RSX[`season_rank_${RankFactory.rankedDivisionAssetNameForRank(this._previousTopRank)}`];
    resources.push(previousRankMedalSpriteResource);
    const previousRankMedalGlowOutlineResource = RSX[`season_rank_${RankFactory.rankedDivisionAssetNameForRank(this._previousTopRank)}_glow_outline`];
    resources.push(previousRankMedalGlowOutlineResource);
    const rankMedalSpriteResource = RSX[`season_rank_${RankFactory.rankedDivisionAssetNameForRank(GamesManager.getInstance().getCurrentRank())}`];
    if (rankMedalSpriteResource != previousRankMedalSpriteResource) {
      resources.push(rankMedalSpriteResource);
    }

    return resources;
  },

  showBackground() {
    return this.showFlatBackground();
  },

  showContinueNode() {
    return this.showPressToContinueNode()
      .then(() => {
        // hide continue initially
        this.continueNode.setVisible(false);
        this.continueNode.setEnabled(false);
      });
  },

  onEnter() {
    this._super();

    // don't allow continue
    this.setIsContinueOnPressAnywhere(false);
    this.setIsInteractionEnabled(false);

    this.getFX().requestUnblurSurface(this._requestId);
  },

  animateReward() {
    return this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      // disable and reset continue
      this.disablePressToContinueAndHitboxesAndCallback();

      return this._animateReward();
    });
  },

  _animateReward() {
    return new Promise((resolve, reject) => {
      if (this._animationResolve) {
        console.error('Calling EndOfSeasonLayer:animateReward when it already has a callback set');
      }
      this._animationResolve = resolve;

      const title = i18next.t('rank.end_of_ranked_season_title');

      // data
      const rankText = i18next.t('rank.current_rank_message', { rank: this._previousTopRank });
      const divisionName = RankFactory.rankedDivisionNameForRank(this._previousTopRank).toUpperCase();
      const divisionText = i18next.t('rank.current_division_message', { division: divisionName });
      const seasonStart = this._seasonModel.get('starting_at');
      const seasonStartMoment = moment(seasonStart).utc();
      const seasonMonthText = i18next.t('rank.month_year_season_message', {
        month: seasonStartMoment.format('MMMM'),
        year: seasonStartMoment.format('YYYY'),
      });

      // anchor position for ui
      const centerAnchorPosition = cc.p(0, 0);

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

      // bg shadow
      this._rankedMedalShadow = new BaseSprite(RSX.gold_reward_bg_shadow.img);
      this._rankedMedalShadow.setPosition(centerAnchorPosition);
      this.addChild(this._rankedMedalShadow);

      // rankMedalSprite sprite
      var rankMedalSpriteImage = RSX[`season_rank_${RankFactory.rankedDivisionAssetNameForRank(this._previousTopRank)}`].img;
      this.rankMedalSprite = new BaseSprite(rankMedalSpriteImage);
      this.rankMedalSprite.setPosition(centerAnchorPosition);
      this.addChild(this.rankMedalSprite);

      const rankMedalGlowOutlineImage = RSX[`season_rank_${RankFactory.rankedDivisionAssetNameForRank(this._previousTopRank)}_glow_outline`].img;
      this.rankMedalGlowOutlineSprite = new BaseSprite(rankMedalGlowOutlineImage);
      this.rankMedalGlowOutlineSprite.setPosition(centerAnchorPosition);
      this.rankMedalGlowOutlineSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      this.addChild(this.rankMedalGlowOutlineSprite);

      // Loot Crate Node
      if (this._willShowLootCrate) {
        this._lootCrateNode = new GiftCrateNode();
        this._lootCrateNode.setVisible(false);
        this.addChild(this._lootCrateNode);
      }

      // division label
      this.divisionLabel = new cc.LabelTTF(divisionText.toUpperCase(), RSX.font_regular.name, 25, cc.size(300, 26), cc.TEXT_ALIGNMENT_CENTER);
      this.divisionLabel.setFontFillColor({ r: 255, g: 255, b: 171 });
      const divisionDistanceBelowMedal = 25;
      this.divisionLabel.setPosition(cc.p(
        centerAnchorPosition.x,
        this.rankMedalSprite.getPositionY() - this.rankMedalSprite.getBoundingBox().height * 0.5 - this.divisionLabel.getBoundingBox().height * 0.5 - divisionDistanceBelowMedal,
      ));
      this.addChild(this.divisionLabel);

      // rank label
      this.rankLabel = new cc.LabelTTF(rankText, RSX.font_light.name, 24, cc.size(300, 26), cc.TEXT_ALIGNMENT_CENTER);
      this.rankLabel.setFontFillColor({ r: 255, g: 255, b: 255 });
      const rankDistanceBelowDivision = 15;
      this.rankLabel.setPosition(cc.p(
        centerAnchorPosition.x,
        this.divisionLabel.getPositionY() - this.divisionLabel.getBoundingBox().height * 0.5 - this.rankLabel.getBoundingBox().height * 0.5 - rankDistanceBelowDivision,
      ));
      this.addChild(this.rankLabel);

      // season month label
      this.seasonMonthlabel = new cc.LabelTTF(seasonMonthText.toUpperCase(), RSX.font_light.name, 20, cc.size(1200, 20), cc.TEXT_ALIGNMENT_CENTER);
      this.seasonMonthlabel.setFontFillColor({ r: 255, g: 255, b: 255 });
      const smDistanceAboveMedal = 25;
      this.seasonMonthlabel.setPosition(cc.p(
        centerAnchorPosition.x,
        this.rankMedalSprite.getPositionY() + this.rankMedalSprite.getBoundingBox().height * 0.5 + this.seasonMonthlabel.getBoundingBox().height * 0.5 + smDistanceAboveMedal,
      ));
      this.addChild(this.seasonMonthlabel);

      // title label
      this.titleLabel = new cc.LabelTTF(title.toUpperCase(), RSX.font_regular.name, 25, cc.size(1200, 26), cc.TEXT_ALIGNMENT_CENTER);
      this.titleLabel.setFontFillColor({ r: 255, g: 255, b: 255 });
      const titleDistanceAboveSMLabel = 25;
      this.titleLabel.setPosition(cc.p(
        centerAnchorPosition.x,
        this.seasonMonthlabel.getPositionY() + this.seasonMonthlabel.getBoundingBox().height * 0.5 + titleDistanceAboveSMLabel,
      ));
      this.addChild(this.titleLabel);

      // White chevron
      const chevronDistanceAboveTitle = 30;
      const chevronSpriteImage = RSX.season_chevron.img;
      this.chevronSprite = new BaseSprite(chevronSpriteImage);
      this.chevronSprite.setPosition(
        centerAnchorPosition.x,
        this.titleLabel.getPositionY() + this.titleLabel.getBoundingBox().height * 0.5 + this.chevronSprite.getBoundingBox().height * 0.5 + chevronDistanceAboveTitle,
      );
      this.addChild(this.chevronSprite);

      // region CHEVRONS

      const bonusChevronsImage = RSX.ranked_chevron_full.img;
      this.bonusChevronsSprite = new BaseSprite(bonusChevronsImage);
      this.bonusChevronsSprite.getTexture().setAntiAliasTexParameters();
      this.bonusChevronsSprite.setPosition(centerAnchorPosition);
      this.bonusChevronsSprite.setOpacity(0);
      this.addChild(this.bonusChevronsSprite);

      // Add quantity of rank stars to chevron sprite
      this.chevronsQuantityLabel = new cc.LabelTTF(`${this._numChevronsRewarded}`, RSX.font_regular.name, 25, cc.size(1200, 26), cc.TEXT_ALIGNMENT_CENTER);
      this.chevronsQuantityLabel.setFontFillColor({ r: 255, g: 255, b: 255 });
      const quantityDistanceBelowChevronSprite = 5;
      this.chevronsQuantityLabel.setPosition(cc.p(
        centerAnchorPosition.x,
        this.bonusChevronsSprite.getPositionY() - this.bonusChevronsSprite.getBoundingBox().height * 0.5 - this.chevronsQuantityLabel.getBoundingBox().height * 0.5 - quantityDistanceBelowChevronSprite,
      ));
      this.chevronsQuantityLabel.setOpacity(0);
      this.addChild(this.chevronsQuantityLabel);

      // Chevron Header label
      this.chevronsHeaderLabel = new cc.LabelTTF(i18next.t('rank.last_season_ranked_earned_message'), RSX.font_regular.name, 25, cc.size(1200, 26), cc.TEXT_ALIGNMENT_CENTER);
      this.chevronsHeaderLabel.setFontFillColor({ r: 255, g: 255, b: 255 });
      var headerDistanceAboveSprite = 25;
      this.chevronsHeaderLabel.setPosition(cc.p(
        centerAnchorPosition.x,
        this.bonusChevronsSprite.getPositionY() + this.bonusChevronsSprite.getBoundingBox().height * 0.5 + this.chevronsHeaderLabel.getBoundingBox().height * 0.5 + headerDistanceAboveSprite,
      ));
      this.chevronsHeaderLabel.setOpacity(0);
      this.addChild(this.chevronsHeaderLabel);

      // 'bonus chevrons' label
      this.chevronsBonusLabel = new cc.LabelTTF(i18next.t('rank.bonus_chevrons_message'), RSX.font_regular.name, 32, cc.size(1200, 34), cc.TEXT_ALIGNMENT_CENTER);
      this.chevronsBonusLabel.setFontFillColor({ r: 255, g: 255, b: 255 });
      var footerDistanceBelowSprite = 25;
      this.chevronsBonusLabel.setPosition(cc.p(
        centerAnchorPosition.x,
        this.chevronsQuantityLabel.getPositionY() - this.chevronsQuantityLabel.getBoundingBox().height * 0.5 - this.chevronsBonusLabel.getBoundingBox().height * 0.5 - footerDistanceBelowSprite,
      ));
      this.chevronsBonusLabel.setOpacity(0);
      this.addChild(this.chevronsBonusLabel);

      // endregion CHEVRONS

      // region NewDivision

      // new division sprite
      var rankMedalSpriteImage = RSX[`season_rank_${RankFactory.rankedDivisionAssetNameForRank(GamesManager.getInstance().getCurrentRank())}`].img;
      this.newRankMedalSprite = new BaseSprite(rankMedalSpriteImage);
      this.newRankMedalSprite.setPosition(centerAnchorPosition);
      this.newRankMedalSprite.setOpacity(0);
      this.addChild(this.newRankMedalSprite);

      // new season label
      const currentMoment = moment().utc();
      const currentMonthString = currentMoment.format('MMMM');
      const currentYearString = currentMoment.format('YYYY');
      this.newSeasonLabel = new cc.LabelTTF(i18next.t('rank.season_has_begun_message', { month: currentMonthString, year: currentYearString }), RSX.font_regular.name, 32, cc.size(1200, 38), cc.TEXT_ALIGNMENT_CENTER);
      this.newSeasonLabel.setFontFillColor({ r: 255, g: 255, b: 255 });
      var headerDistanceAboveSprite = 25;
      this.newSeasonLabel.setPosition(cc.p(
        centerAnchorPosition.x,
        this.newRankMedalSprite.getPositionY() + this.newRankMedalSprite.getBoundingBox().height * 0.5 + this.newSeasonLabel.getBoundingBox().height * 0.5 + headerDistanceAboveSprite,
      ));
      this.newSeasonLabel.setOpacity(0);
      this.addChild(this.newSeasonLabel);

      // new rank label
      this.newRankLabel = new cc.LabelTTF(i18next.t('rank.current_rank_message', { rank: GamesManager.getInstance().getCurrentRank() }), RSX.font_regular.name, 32, cc.size(1200, 34), cc.TEXT_ALIGNMENT_CENTER);
      this.newRankLabel.setFontFillColor({ r: 255, g: 255, b: 255 });
      var footerDistanceBelowSprite = 25;
      this.newRankLabel.setPosition(cc.p(
        centerAnchorPosition.x,
        this.newRankMedalSprite.getPositionY() - this.newRankMedalSprite.getBoundingBox().height * 0.5 - this.newRankLabel.getBoundingBox().height * 0.5 - footerDistanceBelowSprite,
      ));
      this.newRankLabel.setOpacity(0);
      this.addChild(this.newRankLabel);

      // endregion NewDivision

      // animation code

      // start state
      this._rankedMedalShadow.setOpacity(0);

      flare.setOpacity(0);

      this.rankMedalSprite.setOpacity(0);
      // this.rankMedalSprite.setScale(0.8);

      this.rankMedalGlowOutlineSprite.setOpacity(0);
      this.rankMedalGlowOutlineSprite.setScale(0.8);

      this.rankLabel.setOpacity(0);
      this.rankLabel.setScale(1.2);

      this.titleLabel.setOpacity(0);
      this.continueNode.setOpacity(0.0);
      this.continueNode.setVisible(false);
      this.continueNode.setEnabled(false);
      this.seasonMonthlabel.setOpacity(0);

      // animations
      this._rankedMedalShadow.runAction(cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION));
      this._rankedMedalShadow.runAction(cc.moveBy(CONFIG.ANIMATE_FAST_DURATION, cc.p(0, -20)));

      // Main animation sequence
      this.runAction(cc.sequence(
        // animate in rank medal sprite
        cc.targetedAction(this.rankMedalGlowOutlineSprite, cc.spawn(
          cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
          cc.EaseBackOut.create(cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0)),
          cc.callFunc(() => {
            audio_engine.current().play_effect(RSX.sfx_division_crest_outline_reveal.audio, false);
          }),
        )),
        cc.spawn(
          cc.targetedAction(flare, cc.sequence(
            cc.EaseCubicActionIn.create(cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION)),
            cc.delayTime(0.2),
            cc.EaseCubicActionOut.create(cc.fadeOut(0.8)),
            cc.callFunc(() => {
              flare.setVisible(false);
              flare.destroy();
            }),
          )),
          cc.callFunc(() => {
            audio_engine.current().play_effect(RSX.sfx_division_crest_reveal.audio, false);
          }),
          cc.targetedAction(this.rankMedalSprite, cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION)),

        ),
        cc.targetedAction(this.rankMedalGlowOutlineSprite, cc.fadeOut(0.6)),

        // animate in labels
        cc.spawn(
          cc.callFunc(() => {
            audio_engine.current().play_effect(RSX.sfx_season_rewards_text_reveal.audio, false);
          }),
          cc.targetedAction(this.rankLabel, cc.spawn(
            cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
            cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0),
          )),
          cc.targetedAction(this.titleLabel, cc.spawn(
            cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
            cc.moveBy(CONFIG.ANIMATE_MEDIUM_DURATION, cc.p(0, 20)).easing(cc.easeCubicActionOut()),
          )),
          cc.targetedAction(this.seasonMonthlabel, cc.spawn(
            cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
            cc.moveBy(CONFIG.ANIMATE_MEDIUM_DURATION, cc.p(0, 20)).easing(cc.easeCubicActionOut()),
          )),
          cc.targetedAction(this.chevronSprite, cc.spawn(
            cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
            cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0),
          )),
          cc.targetedAction(this.divisionLabel, cc.spawn(
            cc.fadeIn(CONFIG.ANIMATE_MEDIUM_DURATION),
            cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0),
          )),
        ),

        // Pause on ranked medal
        // cc.delayTime(2),

        cc.callFunc(() => {
          // update continue button
          this.continueNode.setTitleForState(i18next.t('common.next_button_label'), cc.CONTROL_STATE_NORMAL);
          this.continueNode.setTitleForState(i18next.t('common.next_button_label'), cc.CONTROL_STATE_HIGHLIGHTED);
          this.continueNode.setEnabled(true);
          this.continueNode.setVisible(true);
          this.continueNode.setOpacity(0);
          this.continueNode.fadeTo(CONFIG.FADE_MEDIUM_DURATION, 255.0);

          // set callback on continue
          this.setContinueCallback(this._onDoneWithRankPressed);

          // enable continue
          this.setIsInteractionEnabled(true);
        }),
      ));
      // }.bind(this)).timeout(CONFIG.PROMISE_TIMEOUT_UI_TRANSITION,"EndOfSeasonLayer:animateReward promise timeout"); // This is something I would like to try and do in the future
    });
  },

  _onDoneWithRankPressed() {
    // disable and reset continue
    this.disablePressToContinueAndHitboxesAndCallback();

    // Run action to fade out rank medal and proceed to next view
    this.runAction(cc.sequence(
      // animate out rank medal
      cc.targetedAction(this.rankMedalGlowOutlineSprite, cc.fadeIn(0.2)),
      cc.spawn(
        cc.targetedAction(this.rankMedalSprite, cc.fadeOut(0.2)),
        cc.targetedAction(this._rankedMedalShadow, cc.fadeOut(0.2)),
        cc.targetedAction(this.rankMedalGlowOutlineSprite, cc.fadeOut(0.2)),
      ),

      // Branch to either showing the loot crate or straight to division medals if no loot crate
      cc.callFunc(() => {
        if (this._willShowLootCrate) {
          // animate out the ranked medal when activated
          var cleanupAction = cc.sequence(
            cc.delayTime(CONFIG.ANIMATE_MEDIUM_DURATION),
          );

          this._beginShowLootCrate(cleanupAction);
        } else {
          // Go ahead and 'claim rewards' in the background to mark this season as read
          GamesManager.getInstance().claimRewardsForSeason(this._seasonModel);

          var cleanupAction = cc.spawn(
            cc.targetedAction(this.rankLabel, cc.spawn(
              cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION),
              cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, 0.8),
            )),
            cc.targetedAction(this.titleLabel, cc.spawn(
              cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION),
              cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, 0.8),
            )),
            cc.targetedAction(this.seasonMonthlabel, cc.spawn(
              cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION),
              cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, 0.8),
            )),
            cc.targetedAction(this.chevronSprite, cc.spawn(
              cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION),
              cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, 0.8),
            )),
            cc.targetedAction(this.divisionLabel, cc.spawn(
              cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION),
              cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, 0.8),
            )),
          );

          this._onDonePressed(cleanupAction);
        }
      }),
    ));
  },

  _beginShowLootCrate(cleanupAction) {
    return new Promise((resolve, reject) => {
      const sequenceSteps = [
        cc.callFunc(() => {
          resolve();
        }),
      ];

      if (cleanupAction instanceof cc.Action) {
        sequenceSteps.unshift(cleanupAction);
      }

      this.runAction(cc.sequence(sequenceSteps));
    }).then(() => this._lootCrateNode.showReveal()).then(() => this._lootCrateNode.showIdleState(CONFIG.ANIMATE_MEDIUM_DURATION)).then(() => {
      // update secondary click to continue hit box
      this.resetContinueHitboxes();
      this.addContinueHitbox(this._lootCrateNode.getBoundingBoxToWorld());

      // update continue button
      this.continueNode.setEnabled(true);
      this.continueNode.setVisible(true);
      this.continueNode.setOpacity(0);
      this.continueNode.fadeTo(CONFIG.FADE_MEDIUM_DURATION, 255.0);

      // set callback on continue
      this.setContinueCallback(this._onOpenPressed);

      // enable continue
      this.setIsInteractionEnabled(true);
    });
  },

  // On user clicking the proceed button for the loot crate
  _onOpenPressed() {
    // disable and reset continue
    this.disablePressToContinueAndHitboxesAndCallback();

    // Speed up the figure 8
    this._lootCrateNode.showExcitedState(CONFIG.ANIMATE_MEDIUM_DURATION);

    // claim rewards and prep crate contents
    const seasonRewardModelsPromise = GamesManager.getInstance().claimRewardsForSeason(this._seasonModel);
    return seasonRewardModelsPromise.then((seasonRewardModels) => {
      this._lootCrateNode.setRewardsModels(seasonRewardModels);
      this._animateLootCrate();
    });
  },

  _animateLootCrate() {
    // disable and reset continue
    this.disablePressToContinueAndHitboxesAndCallback();

    return new Promise((resolve, reject) => {
      // animate out labels
      this.runAction(cc.sequence(
        cc.spawn(
          cc.targetedAction(this.rankLabel, cc.spawn(
            cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION),
            cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, 0.8),
          )),
          cc.targetedAction(this.titleLabel, cc.spawn(
            cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION),
            cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, 0.8),
          )),
          cc.targetedAction(this.seasonMonthlabel, cc.spawn(
            cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION),
            cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, 0.8),
          )),
          cc.targetedAction(this.chevronSprite, cc.spawn(
            cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION),
            cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, 0.8),
          )),
          cc.targetedAction(this.divisionLabel, cc.spawn(
            cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION),
            cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, 0.8),
          )),
        ),
        cc.callFunc(() => {
          resolve();
        }),
      ));
    }).then(() => this._lootCrateNode.showOpeningAndRewards()).then(() => {
      this.runAction(cc.sequence(
        cc.callFunc(() => {
          // update continue button
          this.continueNode.setTitleForState(i18next.t('common.done_button_label'), cc.CONTROL_STATE_NORMAL);
          this.continueNode.setTitleForState(i18next.t('common.done_button_label'), cc.CONTROL_STATE_HIGHLIGHTED);
          this.continueNode.setEnabled(true);
          this.continueNode.setVisible(true);
          this.continueNode.setOpacity(0);
          this.continueNode.fadeTo(CONFIG.FADE_MEDIUM_DURATION, 255.0);

          // set callback on continue
          this.setContinueCallback(this._onDonePressed);

          // enable continue
          this.setIsInteractionEnabled(true);
        }),
      ));
    });
  },

  _onDonePressed(cleanupAction) {
    // disable and reset continue
    this.disablePressToContinueAndHitboxesAndCallback();

    const lootCratePromise = this._willShowLootCrate ? this._lootCrateNode.cleanupLootCrate() : Promise.resolve();
    return lootCratePromise.then(() => {
      this.bonusChevronsSprite.setScale(0);

      // Animate the bonus chevrons
      const sequenceSteps = [
        cc.spawn(
          cc.targetedAction(this.chevronsHeaderLabel, cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION)),
          cc.targetedAction(this.chevronsBonusLabel, cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION)),
          cc.targetedAction(this.chevronsQuantityLabel, cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION)),

          cc.targetedAction(this.bonusChevronsSprite, cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION)),

          cc.targetedAction(this.bonusChevronsSprite, cc.EaseBackOut.create(cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, 1.0))),
        ),
        cc.delayTime(CONFIG.ANIMATE_FAST_DURATION),
        cc.callFunc(() => {
          // update continue button
          this.continueNode.setTitleForState(i18next.t('common.next_button_label'), cc.CONTROL_STATE_NORMAL);
          this.continueNode.setTitleForState(i18next.t('common.next_button_label'), cc.CONTROL_STATE_HIGHLIGHTED);
          this.continueNode.setEnabled(true);
          this.continueNode.setVisible(true);
          this.continueNode.setOpacity(0);
          this.continueNode.fadeTo(CONFIG.FADE_MEDIUM_DURATION, 255.0);

          // set callback on continue
          this.setContinueCallback(this._onNextPressed);

          // enable continue
          this.setIsInteractionEnabled(true);
        }),
      ];

      if (cleanupAction instanceof cc.Action) {
        sequenceSteps.unshift(cleanupAction);
      }

      this.runAction(cc.sequence(sequenceSteps));
    });
  },

  _onNextPressed() {
    // disable and reset continue
    this.disablePressToContinueAndHitboxesAndCallback();

    this.newRankMedalSprite.setScale(0);

    // Animate showing the new division
    this.runAction(cc.sequence(
      // Fade out chevrons labels/sprites and next button
      cc.spawn(
        cc.targetedAction(this.chevronsHeaderLabel, cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION)),
        cc.targetedAction(this.chevronsBonusLabel, cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION)),
        cc.targetedAction(this.chevronsQuantityLabel, cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION)),
        cc.targetedAction(this.bonusChevronsSprite, cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION)),
      ),

      // Fade in the new rank division
      cc.spawn(
        cc.targetedAction(this.newSeasonLabel, cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION)),
        cc.targetedAction(this.newRankLabel, cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION)),
        cc.targetedAction(this.newRankMedalSprite, cc.EaseBackOut.create(cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, 1.0))),
        cc.targetedAction(this.newRankMedalSprite, cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION)),
        cc.callFunc(() => {
          audio_engine.current().play_effect(RSX.sfx_division_crest_reveal.audio, false);
        }),
      ),

      // final animation step, allow exiting through click and call resolve callback
      cc.callFunc(() => {
        this._animationResolve();
        this._animationResolve = null;

        this.showPressAnywhereToContinueNode();
        this.setIsContinueOnPressAnywhere(true);
        this.setIsInteractionEnabled(true);
      }),
    ));
  },
});

EndOfSeasonLayer.create = function (options, layer) {
  return RewardLayer.create(layer || new EndOfSeasonLayer(options));
};

module.exports = EndOfSeasonLayer;
