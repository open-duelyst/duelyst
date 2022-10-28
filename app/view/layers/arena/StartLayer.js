// pragma PKGS: gauntlet
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const EVENTS = require('app/common/event_types');
const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const UtilsEngine = require('app/common/utils/utils_engine');
const Promise = require('bluebird');
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
 StartLayer
 *************************************************************************** */

const StartLayer = BaseLayer.extend({
  delegate: null,
  _gauntletGoldPrice: 0,

  // ui elements
  titleLabel: null,
  runDetailsLabel: null,
  startButton: null,
  _mouseOverButton: null,

  /* region INITIALIZE */

  ctor(ticketCount) {
    // do super ctor
    this._super();

    this.titleLabel = new cc.LabelTTF(i18next.t('gauntlet.gauntlet_title').toUpperCase(), RSX.font_bold.name, 32, cc.size(500, 32), cc.TEXT_ALIGNMENT_CENTER);
    this.titleLabel.setPosition(0, 140);
    this.addChild(this.titleLabel);

    this.descriptionLabel = new cc.LabelTTF(i18next.t('gauntlet.gauntlet_instructions'), RSX.font_light.name, 24, cc.size(600, 0), cc.TEXT_ALIGNMENT_CENTER);
    this.descriptionLabel.setPosition(0, 0);
    this.addChild(this.descriptionLabel);

    const confirmButtonSprite = new ccui.Scale9Sprite(RSX.button_confirm.img);
    const confirmButtonGlowSprite = new ccui.Scale9Sprite(RSX.button_confirm_glow.img);
    this.startButton = new cc.ControlButton(i18next.t('gauntlet.start_button_label').toUpperCase(), confirmButtonSprite, 24);
    this.startButton.setPreferredSize(confirmButtonSprite.getContentSize());
    this.startButton.setAdjustBackgroundImage(false);
    this.startButton.setZoomOnTouchDown(false);
    this.startButton.setTitleTTFForState(RSX.font_light.name, cc.CONTROL_STATE_NORMAL);
    this.startButton.setBackgroundSpriteForState(confirmButtonSprite, cc.CONTROL_STATE_NORMAL);
    this.startButton.setBackgroundSpriteForState(confirmButtonGlowSprite, cc.CONTROL_STATE_HIGHLIGHTED);
    this.startButton.setTitleColorForState(cc.color(255, 255, 255), cc.CONTROL_STATE_NORMAL);
    this.startButton.setPosition(0, -200); // Was -100, -200.
    this.addChild(this.startButton, 0);

    this.costLabel = new cc.LabelTTF(i18next.t('gauntlet.gauntlet_start_instructions', { gold_price: this._gauntletGoldPrice, hard_currency_price: '200 Diamonds' }), RSX.font_regular.name, 14, cc.size(500, 32), cc.TEXT_ALIGNMENT_CENTER);
    this.costLabel.setPosition(0, -150);
    this.addChild(this.costLabel);

    // gold icon sprite
    this.currency_icon = new BaseSprite(RSX.gold_reward_gold_icon.img);
    this.currency_icon.setPosition(-75, -200); // Was -175, -200.
    this.addChild(this.currency_icon, 1);

    // gold AMOUNT # label
    this.currency_amount_label = new cc.LabelTTF(`${this._gauntletGoldPrice}`, RSX.font_regular.name, 20, cc.size(48, 24), cc.TEXT_ALIGNMENT_CENTER);
    this.currency_amount_label.setFontFillColor({ r: 121, g: 66, b: 0 });
    this.currency_amount_label.setPosition(-75, -200); // Was -175, -200.
    this.addChild(this.currency_amount_label, 1);

    this.countLabel = new cc.LabelTTF(i18next.t('gauntlet.ticket_inventory_label_plural', { count: ticketCount }), RSX.font_regular.name, 14, cc.size(500, 32), cc.TEXT_ALIGNMENT_CENTER);
    this.countLabel.setPosition(0, -250);
    this.addChild(this.countLabel);

    const buyTicketSprite = new ccui.Scale9Sprite(RSX.button_confirm.img);
    const buyTicketGlowSprite = new ccui.Scale9Sprite(RSX.button_confirm_glow.img);
    this.buyTicketButton = new cc.ControlButton(`200 ${i18next.t('common.currency_premium_plural')}`, buyTicketSprite, 24);
    this.buyTicketButton.setPreferredSize(confirmButtonSprite.getContentSize());
    this.buyTicketButton.setAdjustBackgroundImage(false);
    this.buyTicketButton.setZoomOnTouchDown(false);
    this.buyTicketButton.setTitleTTFForState(RSX.font_light.name, cc.CONTROL_STATE_NORMAL);
    this.buyTicketButton.setBackgroundSpriteForState(buyTicketSprite, cc.CONTROL_STATE_NORMAL);
    this.buyTicketButton.setBackgroundSpriteForState(buyTicketGlowSprite, cc.CONTROL_STATE_HIGHLIGHTED);
    this.buyTicketButton.setTitleColorForState(cc.color(255, 255, 255), cc.CONTROL_STATE_NORMAL);
    this.buyTicketButton.setPosition(100, -200);
    this.addChild(this.buyTicketButton, 0);

    if (!ticketCount) {
      this.countLabel.setVisible(false);
    } else {
      this.costLabel.setVisible(false);
      this.currency_icon.setVisible(false);
      this.currency_amount_label.setVisible(false);
      this.buyTicketButton.setVisible(false);
      this.startButton.setPosition(0, -200);
    }

    // Ensure Diamond purchase button is hidden.
    this.buyTicketButton.setVisible(false);
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
      if (this.startButton instanceof cc.ControlButton && this.startButton.isEnabled() && UtilsEngine.getNodeUnderMouse(this.startButton, location.x, location.y)) {
        mouseOverButton = this.startButton;
      }
      if (this.buyTicketButton instanceof cc.ControlButton && this.buyTicketButton.isEnabled() && UtilsEngine.getNodeUnderMouse(this.buyTicketButton, location.x, location.y)) {
        mouseOverButton = this.buyTicketButton;
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
      if (this.startButton instanceof cc.ControlButton && this.startButton.isEnabled() && UtilsEngine.getNodeUnderMouse(this.startButton, location.x, location.y)) {
        this.onStartPressed();
      }
      if (this.buyTicketButton instanceof cc.ControlButton && this.buyTicketButton.isEnabled() && UtilsEngine.getNodeUnderMouse(this.buyTicketButton, location.x, location.y)) {
        this.onBuyTicketPressed();
      }
    }
  },

  onHoverButton() {
    if (this._mouseOverButton != null) {
      this._mouseOverButton.setHighlighted(true);
      audio_engine.current().play_effect(RSX.sfx_ui_menu_hover.audio);
    }
  },

  onStartPressed() {
    // disable start button
    this.hideStartButton();

    // play confirm audio
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);

    // start run
    this.delegate.startNewArenaRun().catch(() => {
      // reset if there is a problem
      this.showStartButton();
    });
  },

  onBuyTicketPressed() {
    // disable start button
    // this.hideStartButton();

    // play confirm audio
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);

    // purchase
    this.delegate.purchaseTicket().catch(() => {
      // reset if there is a problem
      // this.showStartButton();
    });
  },

  /* endregion EVENTS */

  /* region BUTTON STATES */

  showStartButton(delayTime) {
    if (this._showStartButtonPromise == null) {
      if (delayTime == null) { delayTime = 0.0; }
      this._hideStartButtonPromise = null;
      this._showStartButtonPromise = new Promise((resolve, reject) => {
        this.costLabel.setOpacity(0.0);
        this.costLabel.stopActionByTag(CONFIG.FADE_TAG);
        var fadeAction = cc.sequence(
          cc.delayTime(delayTime),
          cc.fadeIn(0.4),
        );
        fadeAction.setTag(CONFIG.FADE_TAG);
        this.costLabel.runAction(fadeAction);

        this.startButton.setEnabled(true);
        this.startButton.setOpacity(0.0);
        this.startButton.stopActionByTag(CONFIG.FADE_TAG);
        var fadeAction = cc.sequence(
          cc.delayTime(delayTime + 0.2),
          cc.fadeIn(0.4),
        );
        fadeAction.setTag(CONFIG.FADE_TAG);
        this.startButton.runAction(fadeAction);

        this.currency_icon.setScale(0.0);
        this.currency_icon.stopActionByTag(CONFIG.FADE_TAG);
        var fadeAction = cc.sequence(
          cc.delayTime(delayTime + 0.4),
          cc.scaleTo(0.2, 1.0),
        );
        fadeAction.setTag(CONFIG.FADE_TAG);
        this.currency_icon.runAction(fadeAction);

        this.currency_amount_label.setOpacity(0.0);
        this.currency_amount_label.stopActionByTag(CONFIG.FADE_TAG);
        var fadeAction = cc.sequence(
          cc.delayTime(delayTime + 0.5),
          cc.fadeIn(0.2),
          cc.callFunc(() => {
            resolve();
          }),
        );
        fadeAction.setTag(CONFIG.FADE_TAG);
        this.currency_amount_label.runAction(fadeAction);
      });
    }
    return this._showStartButtonPromise;
  },

  hideStartButton() {
    if (this._hideStartButtonPromise == null) {
      this._showStartButtonPromise = null;
      this._hideStartButtonPromise = new Promise((resolve, reject) => {
        this.startButton.setEnabled(false);
        this.startButton.stopActionByTag(CONFIG.FADE_TAG);
        var fadeAction = cc.fadeOut(0.2);
        fadeAction.setTag(CONFIG.FADE_TAG);
        this.startButton.runAction(fadeAction);

        this.costLabel.stopActionByTag(CONFIG.FADE_TAG);
        var fadeAction = cc.sequence(
          cc.delayTime(0.1),
          cc.fadeOut(0.2),
        );
        fadeAction.setTag(CONFIG.FADE_TAG);
        this.costLabel.runAction(fadeAction);

        this.currency_icon.stopActionByTag(CONFIG.FADE_TAG);
        var fadeAction = cc.sequence(
          cc.delayTime(0.2),
          cc.scaleTo(0.1, 0.0),
        );
        fadeAction.setTag(CONFIG.FADE_TAG);
        this.currency_icon.runAction(fadeAction);

        this.currency_amount_label.stopActionByTag(CONFIG.FADE_TAG);
        var fadeAction = cc.sequence(
          cc.delayTime(0.2),
          cc.fadeOut(0.1),
          cc.callFunc(() => {
            resolve();
          }),
        );
        fadeAction.setTag(CONFIG.FADE_TAG);
        this.currency_amount_label.runAction(fadeAction);
      });
    }
    return this._hideStartButtonPromise;
  },

  /* endregion BUTTON STATES */

  /* region TRANSITION */

  transitionIn() {
    return Promise.all([
      new Promise((resolve, reject) => {
        this.titleLabel.setOpacity(0);
        this.descriptionLabel.setOpacity(0);

        this.titleLabel.runAction(cc.sequence(
          cc.delayTime(0.0),
          cc.fadeIn(0.4),
        ));
        this.descriptionLabel.runAction(cc.sequence(
          cc.delayTime(0.2),
          cc.fadeIn(0.4),
          cc.callFunc(() => {
            resolve();
          }),
        ));
      }),
      this.showStartButton(0.4),
    ]);
  },

  transitionOut() {
    return Promise.all([
      new Promise((resolve, reject) => {
        // title and description
        this.titleLabel.runAction(cc.scaleTo(0.1, 0.0));
        this.descriptionLabel.runAction(cc.sequence(
          cc.delayTime(0.1),
          cc.fadeOut(0.2),
          cc.callFunc(() => {
            resolve();
          }),
        ));
      }),
      this.hideStartButton(),
    ]);
  },

  /* endregion TRANSITION */

});

StartLayer.create = function (layer) {
  return BaseLayer.create(layer || new StartLayer());
};

module.exports = StartLayer;
