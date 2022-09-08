// pragma PKGS: rift
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const EVENTS = require('app/common/event_types');
const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const UtilsEngine = require('app/common/utils/utils_engine');
const FXRiftLineSprite = require('app/view/nodes/fx/FXRiftLineSprite');
const FXHorizontalGlowFlareSprite = require('app/view/nodes/fx/FXHorizontalGlowFlareSprite');
const FXFireRingFlareWarpedSprite = require('app/view/nodes/fx/FXFireRingFlareWarpedSprite');
const Promise = require('bluebird');
const FXRiftFireSprite = require('app/view/nodes/fx/FXRiftFireSprite');
const RiftHelper = require('app/sdk/rift/riftHelper');
const NewPlayerManager = require('app/ui/managers/new_player_manager');
const TooltipNode = require('app/view/nodes/cards/TooltipNode');
const i18next = require('i18next');
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
 RunLayer
 *************************************************************************** */

const RunLayer = BaseLayer.extend({

  delegate: null,
  riftData: null,

  // ui elements
  runDetailsLabel: null,
  playButton: null,
  upgradeButton: null,
  upgradeButtonTooltip: null,
  upgradeButtonPulseGlow: null,
  resignButton: null,

  _runGameNodes: null,
  _mouseOverButton: null,

  /* region INITIALIZE */

  ctor(riftData, wonLastGauntletGame) {
    // do super ctor
    this._super();

    this.riftData = riftData;

    //
    this.riftFire = new FXRiftFireSprite();
    this.riftFire.setPosition(0, 0);
    this.riftFire.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
    this.addChild(this.riftFire);

    const winSize = UtilsEngine.getGSIWinSize();
    this.riftFire.setPosition(0, -20);
    this.riftFire.setScale(
      winSize.width / this.riftFire.getTextureRect().width,
      (winSize.height * 0.75) / this.riftFire.getTextureRect().height,
    );

    // // draw background rectangle for bar
    // this.blackRect = new cc.DrawNode();
    // var bgWidth = 620;
    // var bgHeight = 100;
    // var bgBL = cc.p(-bgWidth/2, bgHeight/2);
    // var bgTR = cc.p(bgBL.x + bgWidth, -(bgBL.y + bgHeight));
    // var bgColor = cc.color(0,0,0);
    // this.blackRect.drawRect(bgBL, bgTR, bgColor, 0, bgColor);
    // this.blackRect.setOpacity(200)
    // this.blackRect.setPosition(0,40)
    // this.addChild(this.blackRect)

    this.bgPlateSprite = new BaseSprite(RSX.rift_run_bg_plate.img);
    this.addChild(this.bgPlateSprite);

    // label
    this.runDetailsLabel = new cc.LabelTTF(i18next.t('rift.rift_level_label', { level: riftData.rift_level }), RSX.font_bold.name, 20, cc.size(500, 24), cc.TEXT_ALIGNMENT_CENTER);
    this.runDetailsLabel.setPosition(0, 60);
    this.runDetailsLabel.setFontFillColor(cc.color(255, 255, 255));

    // add label
    this.addChild(this.runDetailsLabel);

    // rating label
    let riftRating = riftData.rift_rating;
    if (riftRating == null) {
      riftRating = 400;
    }
    this.runRatingDetailsLabel = new cc.LabelTTF(i18next.t('rift.rift_rating_label', { rating: riftRating }), RSX.font_regular.name, 16, cc.size(500, 20), cc.TEXT_ALIGNMENT_CENTER);
    this.runRatingDetailsLabel.setPositionBelowSprite(this.runDetailsLabel);
    this.runRatingDetailsLabel.setFontFillColor(cc.color(255, 255, 255));
    this.addChild(this.runRatingDetailsLabel);

    // progress label
    this.runProgressLabel = new cc.LabelTTF(i18next.t('rift.progress_to_next_level_message'), RSX.font_regular.name, 14, cc.size(500, 32), cc.TEXT_ALIGNMENT_CENTER);
    this.runProgressLabel.setPosition(0, -60);
    this.runProgressLabel.setFontFillColor(cc.color(255, 255, 255));

    // add label
    this.addChild(this.runProgressLabel);

    const levelUpRequirement = RiftHelper.pointsRequiredForLevel(riftData.rift_level + 1);
    const pointsSoFar = riftData.rift_points - RiftHelper.totalPointsForLevel(riftData.rift_level);

    // progress label
    this.runProgressAmountLabel = new cc.LabelTTF(i18next.t('rift.progress_over_required_xp_message', { current: pointsSoFar, required: levelUpRequirement }), RSX.font_regular.name, 20, cc.size(500, 32), cc.TEXT_ALIGNMENT_CENTER);
    this.runProgressAmountLabel.setPosition(0, -80);
    this.runProgressAmountLabel.setFontFillColor(cc.color(255, 255, 255));

    // add label
    this.addChild(this.runProgressAmountLabel);

    // TODO: currently horizontal glow flare makes run details very hard to read
    // // add label flare
    // this.horizontalGlowFlare = new FXHorizontalGlowFlareSprite();
    // this.horizontalGlowFlare.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
    // this.horizontalGlowFlare.setPosition(0,160);
    // this.horizontalGlowFlare.phase = 0.9;
    // this.horizontalGlowFlare.setScale(this.runDetailsLabel.getTextureRect().width/64,this.runDetailsLabel.getTextureRect().height/32);
    // this.horizontalGlowFlare.setOpacity(200);
    // this.horizontalGlowFlare.setColor(cc.color(0, 200, 255));
    // this.addChild(this.horizontalGlowFlare);

    const riftLine = new FXRiftLineSprite();
    riftLine.setPosition(0, 0);
    // riftLine.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
    riftLine.setScale(this.runDetailsLabel.getTextureRect().width / 48, this.runDetailsLabel.getTextureRect().height / 12);
    riftLine.progress = pointsSoFar / levelUpRequirement;
    this.addChild(riftLine);

    // Disabled because it looks bad due to button being semi transparent
    // if (riftData.upgrades_available_count != null && riftData.upgrades_available_count > 0) {
    //  this.upgradeButtonPulseGlow = new BaseSprite(RSX.button_secondary_shadow.img);
    //  this.upgradeButtonPulseGlow.setPosition(-100, -165);
    //  this.upgradeButtonPulseGlow.setOpacity(0);
    //  this.upgradeButtonPulseGlow.setColor(cc.color(164, 255, 255));
    //  this.addChild(this.upgradeButtonPulseGlow,-1);
    //  var pulseStepDuration = CONFIG.ANIMATE_SLOW_DURATION;
    //  this.upgradeButtonPulseGlow.runAction(cc.repeatForever(
    //    cc.sequence(
    //      cc.spawn(
    //        cc.scaleTo(pulseStepDuration,1.1,1.2),
    //        cc.fadeTo(pulseStepDuration,255 * 0.4)
    //      ),
    //      cc.spawn(
    //        cc.scaleTo(pulseStepDuration,0.8),
    //        cc.fadeTo(pulseStepDuration,255 * 0.6)
    //      )
    //    )
    //  ))
    // }

    const buttonSprite = new ccui.Scale9Sprite(RSX.button_secondary.img);
    const buttonGlowSprite = new ccui.Scale9Sprite(RSX.button_secondary_glow.img);
    this.upgradeButton = new cc.ControlButton(i18next.t('rift.upgrade_count_button_label', { upgradesAvailableCount: riftData.upgrades_available_count }), buttonSprite, 48);
    this.upgradeButton.setPreferredSize(buttonSprite.getContentSize());
    this.upgradeButton.setAdjustBackgroundImage(false);
    this.upgradeButton.setOpacity(riftData.upgrades_available_count > 0 ? 255 : 100);
    this.upgradeButton.setZoomOnTouchDown(false);
    this.upgradeButton.setTitleTTFForState(RSX.font_bold.name, cc.CONTROL_STATE_NORMAL);
    this.upgradeButton.setBackgroundSpriteForState(buttonSprite, cc.CONTROL_STATE_NORMAL);
    this.upgradeButton.setBackgroundSpriteForState(buttonGlowSprite, cc.CONTROL_STATE_HIGHLIGHTED);
    this.upgradeButton.setTitleColorForState(cc.color(255, 255, 255), cc.CONTROL_STATE_NORMAL);
    this.upgradeButton.setPosition(-100, -165);
    this.addChild(this.upgradeButton);

    // If a player has deck upgrades and has never used one show a tooltip
    if (!NewPlayerManager.getInstance().getHasUsedRiftUpgrade() && riftData.upgrades_available_count != null && riftData.upgrades_available_count > 0) {
      this.upgradeButtonTooltip = new TooltipNode();
      this.upgradeButtonTooltip.showText(i18next.t('rift.improve_deck_message'), TooltipNode.DIRECTION_RIGHT);
      this.upgradeButtonTooltip.setPositionLeftOfSprite(this.upgradeButton);
      this.addChild(this.upgradeButtonTooltip);
    }

    const confirmButtonSprite = new ccui.Scale9Sprite(RSX.button_confirm.img);
    const confirmButtonGlowSprite = new ccui.Scale9Sprite(RSX.button_confirm_glow.img);
    this.playButton = new cc.ControlButton(i18next.t('common.play_button_label'), confirmButtonSprite, 48);
    this.playButton.setPreferredSize(confirmButtonSprite.getContentSize());
    this.playButton.setAdjustBackgroundImage(false);
    this.playButton.setZoomOnTouchDown(false);
    this.playButton.setTitleTTFForState(RSX.font_bold.name, cc.CONTROL_STATE_NORMAL);
    this.playButton.setBackgroundSpriteForState(confirmButtonSprite, cc.CONTROL_STATE_NORMAL);
    this.playButton.setBackgroundSpriteForState(confirmButtonGlowSprite, cc.CONTROL_STATE_HIGHLIGHTED);
    this.playButton.setTitleColorForState(cc.color(255, 255, 255), cc.CONTROL_STATE_NORMAL);
    this.playButton.setPosition(100, -165);
    this.addChild(this.playButton);

    //
    const generalId = riftData.general_id;
    if (this._portrait == null) {
      const generalCard = SDK.GameSession.getCardCaches().getCardById(generalId);
      const portraitHexResource = generalCard.getPortraitHexResource();
      this._portrait = BaseSprite.create();
      this._portrait.setRequiredTextureResource(portraitHexResource);
      this._portrait.setPosition(0, 220);
      this._portrait.setScale(0.5);
      this._portrait._generalId = generalId;
      this.addChild(this._portrait, 1);
    }

    this._portrait.setVisible(false);
    this._portrait.whenRequiredResourcesReady().then((requestId) => {
      if (!this._portrait.getAreResourcesValid(requestId)) return; // resources have been invalidated
      this._portrait.setVisible(true);

      // animate in
      this._portrait.setOpacity(0.0);
      this._portrait.fadeTo(CONFIG.FADE_FAST_DURATION, 255);
    });
  },

  /* endregion INITIALIZE */

  /* region EVENTS */

  _startListeningToEvents() {
    this._super();

    const scene = this.getScene();
    if (scene != null) {
      scene.getEventBus().on(EVENTS.pointer_up, this.onPointerUp, this);
      scene.getEventBus().on(EVENTS.pointer_move, this.onPointerMove, this);
    }
  },

  _stopListeningToEvents() {
    this._super();

    const scene = this.getScene();
    if (scene != null) {
      scene.getEventBus().off(EVENTS.pointer_up, this.onPointerUp, this);
      scene.getEventBus().off(EVENTS.pointer_move, this.onPointerMove, this);
    }
  },

  resetMouseOverButton() {
    if (this._mouseOverButton != null) {
      this._mouseOverButton.setHighlighted(false);
      this._mouseOverButton = null;
    }
  },

  onPointerMove(event) {
    if (event && event.isStopped) {
      return;
    }

    let mouseOverButton;
    const location = event && event.getLocation();
    if (location) {
      if (this.playButton instanceof cc.ControlButton && this.playButton.isEnabled() && UtilsEngine.getNodeUnderMouse(this.playButton, location.x, location.y)) {
        mouseOverButton = this.playButton;
      }
      if (this.upgradeButton instanceof cc.ControlButton && this.upgradeButton.isEnabled() && UtilsEngine.getNodeUnderMouse(this.upgradeButton, location.x, location.y)) {
        mouseOverButton = this.upgradeButton;
      }
    }

    if (this._mouseOverButton != mouseOverButton) {
      this.resetMouseOverButton();

      this._mouseOverButton = mouseOverButton;

      if (this._mouseOverButton != null) {
        this.onHoverButton();
      }
    }
  },

  onPointerUp(event) {
    if (event && event.isStopped) {
      return;
    }

    const location = event && event.getLocation();
    if (location) {
      if (this.playButton instanceof cc.ControlButton && this.playButton.isEnabled() && UtilsEngine.getNodeUnderMouse(this.playButton, location.x, location.y)) {
        this.onPlayPressed();
      }
      if (this.upgradeButton instanceof cc.ControlButton && this.upgradeButton.isEnabled() && UtilsEngine.getNodeUnderMouse(this.upgradeButton, location.x, location.y)) {
        this.onUpgradePressed();
      }
    }
  },

  onHoverButton() {
    if (this._mouseOverButton != null) {
      this._mouseOverButton.setHighlighted(true);
      audio_engine.current().play_effect(RSX.sfx_ui_menu_hover.audio);
    }
  },

  onPlayPressed() {
    this.delegate.playRiftRun();
  },

  onUpgradePressed() {
    if (this.riftData.upgrades_available_count > 0) {
      this.delegate.showSelectCardToUpgradeScreen(this.riftData);
    }
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

RunLayer.create = function (layer) {
  return BaseLayer.create(layer || new RunLayer());
};

module.exports = RunLayer;
