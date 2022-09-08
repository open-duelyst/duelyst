// pragma PKGS: gauntlet
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const EVENTS = require('app/common/event_types');
const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const UtilsEngine = require('app/common/utils/utils_engine');
const BaseLayer = require('app/view/layers/BaseLayer');
const audio_engine = require('app/audio/audio_engine');
const GiftCrateNode = require('app/view/nodes/reward/GiftCrateNode');
const Promise = require('bluebird');
const i18next = require('i18next');

/** **************************************************************************
 RewardsLayer
 *************************************************************************** */

const RewardsLayer = BaseLayer.extend({

  delegate: null,

  // ui elements
  titleLabel: null,
  runDetailsLabel: null,
  claimRewardsButton: null,
  doneButton: null,

  _runGameNodes: null,
  _mouseOverButton: null,

  /* region INITIALIZE */

  ctor(arenaData) {
    // do super ctor
    this._super();

    this.runDetailsLabel = new cc.LabelTTF('', RSX.font_light.name, 24, cc.size(500, 32), cc.TEXT_ALIGNMENT_CENTER);
    this.runDetailsLabel.setPosition(0, 80);
    this.runDetailsLabel.setVisible(false);
    this.addChild(this.runDetailsLabel);

    const confirmButtonSprite = new ccui.Scale9Sprite(RSX.button_confirm.img);
    const confirmButtonGlowSprite = new ccui.Scale9Sprite(RSX.button_confirm_glow.img);
    this.claimRewardsButton = new cc.ControlButton(i18next.t('gauntlet.claim_rewards_button_label').toUpperCase(), confirmButtonSprite, 24);
    this.claimRewardsButton.setPreferredSize(confirmButtonSprite.getContentSize());
    this.claimRewardsButton.setAdjustBackgroundImage(false);
    this.claimRewardsButton.setZoomOnTouchDown(false);
    this.claimRewardsButton.setTitleTTFForState(RSX.font_light.name, cc.CONTROL_STATE_NORMAL);
    this.claimRewardsButton.setBackgroundSpriteForState(confirmButtonSprite, cc.CONTROL_STATE_NORMAL);
    this.claimRewardsButton.setBackgroundSpriteForState(confirmButtonGlowSprite, cc.CONTROL_STATE_HIGHLIGHTED);
    this.claimRewardsButton.setTitleColorForState(cc.color(255, 255, 255), cc.CONTROL_STATE_NORMAL);
    this.claimRewardsButton.setPosition(0, -90);
    this.claimRewardsButton.setEnabled(false);
    this.claimRewardsButton.setVisible(false);
    this.addChild(this.claimRewardsButton);

    const doneButtonSprite = new ccui.Scale9Sprite(RSX.button_confirm.img);
    const doneButtonGlowSprite = new ccui.Scale9Sprite(RSX.button_confirm_glow.img);
    this.doneButton = new cc.ControlButton(i18next.t('common.default_confirm_dialog_button_continue_label'), doneButtonSprite, 24);
    this.doneButton.setPreferredSize(confirmButtonSprite.getContentSize());
    this.doneButton.setAdjustBackgroundImage(false);
    this.doneButton.setZoomOnTouchDown(false);
    this.doneButton.setTitleTTFForState(RSX.font_light.name, cc.CONTROL_STATE_NORMAL);
    this.doneButton.setBackgroundSpriteForState(doneButtonSprite, cc.CONTROL_STATE_NORMAL);
    this.doneButton.setBackgroundSpriteForState(doneButtonGlowSprite, cc.CONTROL_STATE_HIGHLIGHTED);
    this.doneButton.setTitleColorForState(cc.color(255, 255, 255), cc.CONTROL_STATE_NORMAL);
    this.doneButton.setPosition(0, -UtilsEngine.getGSIWinHeight() * 0.5 + 50);
    this.doneButton.setEnabled(false);
    this.doneButton.setVisible(false);
    this.addChild(this.doneButton);
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
      if (this.claimRewardsButton instanceof cc.ControlButton && this.claimRewardsButton.isEnabled() && UtilsEngine.getNodeUnderMouse(this.claimRewardsButton, location.x, location.y)) {
        mouseOverButton = this.claimRewardsButton;
      } else if (this.doneButton instanceof cc.ControlButton && this.doneButton.isEnabled() && UtilsEngine.getNodeUnderMouse(this.doneButton, location.x, location.y)) {
        mouseOverButton = this.doneButton;
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
      if (this.claimRewardsButton instanceof cc.ControlButton && this.claimRewardsButton.isEnabled() && UtilsEngine.getNodeUnderMouse(this.claimRewardsButton, location.x, location.y)) {
        this.onClaimRewardsPressed();
      } else if (this.doneButton instanceof cc.ControlButton && this.doneButton.isEnabled() && UtilsEngine.getNodeUnderMouse(this.doneButton, location.x, location.y)) {
        this.onDonePressed();
      }
    }
  },

  onHoverButton() {
    if (this._mouseOverButton != null) {
      this._mouseOverButton.setHighlighted(true);
      audio_engine.current().play_effect(RSX.sfx_ui_menu_hover.audio);
    }
  },

  onClaimRewardsPressed() {
    // hide buttons and details
    this.hideClaimButton();

    // play confirm audio
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);

    // claim rewards
    this.delegate.claimArenaRewards().catch(() => {
      // reset if there is a problem
      this.showClaimButton();
    });
  },

  onDonePressed() {
    // hide buttons and details
    this.hideDoneButton();

    // play confirm audio
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);

    // mark rewards as seen
    this.delegate.markArenaRewardsAsSeen().catch(() => {
      // reset if there is a problem
      this.showDoneButton();
    });
  },

  /* endregion EVENTS */

  /* region BUTTON STATES */

  showClaimButton() {
    this.claimRewardsButton.setEnabled(true);
    this.claimRewardsButton.setVisible(true);
    this.claimRewardsButton.setOpacity(0);
    this.claimRewardsButton.fadeTo(CONFIG.FADE_MEDIUM_DURATION, 255.0);

    this.runDetailsLabel.setVisible(true);
  },

  hideClaimButton() {
    this.claimRewardsButton.setEnabled(false);
    this.claimRewardsButton.fadeToInvisible(CONFIG.FADE_MEDIUM_DURATION);

    this.runDetailsLabel.setVisible(false);
  },

  showDoneButton() {
    this.doneButton.setEnabled(true);
    this.doneButton.setVisible(true);
    this.doneButton.setOpacity(0);
    this.doneButton.fadeTo(CONFIG.FADE_MEDIUM_DURATION, 255.0);
  },

  hideDoneButton() {
    this.doneButton.setEnabled(false);
    this.doneButton.fadeToInvisible(CONFIG.FADE_MEDIUM_DURATION);
  },

  /* endregion BUTTON STATES */

  /* region REWARDS */

  showRewards(arenaData) {
    // show results and claim or rewards
    if (arenaData.rewards == null) {
      const labelStr = i18next.t('gauntlet.claim_rewards_win_count_label', { count: arenaData.win_count }).toUpperCase();
      this.runDetailsLabel.setString(labelStr, true);
      this.showClaimButton();
    } else {
      // hide buttons and details
      this.hideClaimButton();

      // show done buttons and details, to be run after loot crate finishes
      const doneShowAction = cc.sequence(
        cc.delayTime(1.0),
        cc.callFunc(() => {
          this.showDoneButton();
        }),
      );
      doneShowAction.setTag(CONFIG.FADE_TAG);

      const lootCrateNode = new GiftCrateNode();
      lootCrateNode.setRewardsModels(arenaData.rewards);
      lootCrateNode.setPosition(0, -25);
      lootCrateNode.setVisible(false);
      this.addChild(lootCrateNode);

      lootCrateNode.showReveal()
        .then(() => lootCrateNode.showIdleState(CONFIG.ANIMATE_MEDIUM_DURATION)).then(() => lootCrateNode.showOpeningAndRewards()).then(() => {
          this.doneButton.runAction(doneShowAction);
        });
    }
  },

  /* endregion REWARDS */

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
        cc.delayTime(0),
        cc.fadeOut(CONFIG.FADE_FAST_DURATION),
        cc.callFunc(() => {
          resolve();
        }),
      ));
    });
  },

  /* endregion TRANSITION */

});

RewardsLayer.create = function (layer) {
  return BaseLayer.create(layer || new RewardsLayer());
};

module.exports = RewardsLayer;
