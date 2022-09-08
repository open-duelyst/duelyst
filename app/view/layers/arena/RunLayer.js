// pragma PKGS: gauntlet
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const EVENTS = require('app/common/event_types');
const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const UtilsEngine = require('app/common/utils/utils_engine');
const FXCausticSprite = require('app/view/nodes/fx/FXCausticSprite');
const FXHorizontalGlowFlareSprite = require('app/view/nodes/fx/FXHorizontalGlowFlareSprite');
const FXFireRingFlareWarpedSprite = require('app/view/nodes/fx/FXFireRingFlareWarpedSprite');
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

// maps win counts to keyblade number
const BLADE_WIN_COUNT_MAP = {
  0: 1,
  1: 1,
  2: 2,
  3: 2,
  4: 3,
  5: 3,
  6: 4,
  7: 5,
  8: 6,
  9: 6,
  10: 7,
  11: 8,
  12: 9,
};

/** **************************************************************************
 RunLayer
 *************************************************************************** */

const RunLayer = BaseLayer.extend({

  delegate: null,

  // ui elements
  runDetailsLabel: null,
  playButton: null,
  resignButton: null,
  causticSprite: null,
  keyBladeSprite: null,
  keyBladeGlowSprite: null,

  _runGameNodes: null,
  _mouseOverButton: null,

  /* region INITIALIZE */

  ctor(arenaData, wonLastGauntletGame) {
    // do super ctor
    this._super();

    this.causticSprite = new FXCausticSprite();
    this.causticSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
    this.causticSprite.setScale(6.0 + Math.min(5.0, arenaData.win_count * 0.5));
    this.causticSprite.setPosition(0, -10);
    this.causticSprite.setColor(cc.color(255, 222, 90));
    this.addChild(this.causticSprite);

    this.showKeyblade(arenaData.win_count, wonLastGauntletGame);

    // label
    const winLossLabel = i18next.t('gauntlet.win_loss_label', { win_count: arenaData.win_count, loss_count: arenaData.loss_count }).toUpperCase();
    this.runDetailsLabel = new cc.LabelTTF(winLossLabel, RSX.font_bold.name, 20, cc.size(500, 32), cc.TEXT_ALIGNMENT_CENTER);
    this.runDetailsLabel.setPosition(0, 150);
    this.runDetailsLabel.setFontFillColor(cc.color(255, 255, 255));

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

    // add label
    this.addChild(this.runDetailsLabel);

    const confirmButtonSprite = new ccui.Scale9Sprite(RSX.button_confirm.img);
    const confirmButtonGlowSprite = new ccui.Scale9Sprite(RSX.button_confirm_glow.img);
    this.playButton = new cc.ControlButton(i18next.t('main_menu.menu_item_play').toUpperCase(), confirmButtonSprite, 32);
    this.playButton.setPreferredSize(confirmButtonSprite.getContentSize());
    this.playButton.setAdjustBackgroundImage(false);
    this.playButton.setZoomOnTouchDown(false);
    this.playButton.setTitleTTFForState(RSX.font_bold.name, cc.CONTROL_STATE_NORMAL);
    this.playButton.setBackgroundSpriteForState(confirmButtonSprite, cc.CONTROL_STATE_NORMAL);
    this.playButton.setBackgroundSpriteForState(confirmButtonGlowSprite, cc.CONTROL_STATE_HIGHLIGHTED);
    this.playButton.setTitleColorForState(cc.color(255, 255, 255), cc.CONTROL_STATE_NORMAL);
    this.playButton.setPosition(0, -165);
    // this.addChild(this.playButton);
  },

  showKeyblade(winCount, wonLastGauntletGame) {
    const bladeNumber = BLADE_WIN_COUNT_MAP[winCount] || 1;

    this.fireRingFlare = new FXFireRingFlareWarpedSprite();
    this.fireRingFlare.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
    this.fireRingFlare.setPosition(0, -10);
    this.addChild(this.fireRingFlare, 1);

    const bladeResource = RSX[`key_blade_${bladeNumber}`];
    this.keyBladeSprite = new BaseSprite();
    this.keyBladeSprite.setRequiredTextureResource(bladeResource);
    this.keyBladeSprite.setPosition(0.0, 10.0);
    this.addChild(this.keyBladeSprite, 1);

    this.fireRingFlare.setOpacity(0.0);
    this.keyBladeSprite.setOpacity(0.0);
    this.causticSprite.setOpacity(0.0);

    if (wonLastGauntletGame) {
      const bladeGlowResource = RSX[`key_blade_outline_glow_${bladeNumber}`];
      this.keyBladeGlowSprite = new BaseSprite();
      this.keyBladeGlowSprite.setRequiredTextureResource(bladeGlowResource);
      this.keyBladeGlowSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      this.keyBladeGlowSprite.setPosition(this.keyBladeSprite.getPosition());
      this.keyBladeGlowSprite.setVisible(false);
      this.addChild(this.keyBladeGlowSprite, 1);

      Promise.all([
        this.keyBladeSprite.whenRequiredResourcesReady(),
        this.keyBladeGlowSprite.whenRequiredResourcesReady(),
      ])
        .spread((keybladeRequestId, keybladeGlowRequestId) => {
          if (!this.keyBladeSprite.getAreResourcesValid(keybladeRequestId) || !this.keyBladeGlowSprite.getAreResourcesValid(keybladeGlowRequestId)) return; // load invalidated or resources changed

          this.keyBladeGlowSprite.setOpacity(0.0);
          this.keyBladeGlowSprite.setScale(0.0);
          this.fireRingFlare.setScale(0.0);
          this.keyBladeSprite.setScale(0.0);
          this.keyBladeGlowSprite.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.show(),
            cc.spawn(
              cc.fadeIn(CONFIG.FADE_MEDIUM_DURATION),
              cc.scaleTo(CONFIG.FADE_MEDIUM_DURATION, 1.0).easing(cc.easeBackOut()),
              cc.targetedAction(this.keyBladeSprite, cc.scaleTo(CONFIG.FADE_MEDIUM_DURATION, 1.0).easing(cc.easeBackOut())),
              cc.targetedAction(this.fireRingFlare, cc.fadeIn(0.1)),
              cc.targetedAction(this.fireRingFlare, cc.scaleTo(0.15, 7.0).easing(cc.easeCubicActionOut())),
              cc.sequence(
                cc.delayTime(CONFIG.FADE_MEDIUM_DURATION * 0.5),
                cc.spawn(
                  cc.targetedAction(this.keyBladeSprite, cc.fadeIn(0.2)),
                  cc.callFunc(() => {
                    const levelUpParticles1 = new BaseParticleSystem({
                      plistFile: RSX.key_blade_level_up_particles.plist,
                      fadeInAtLifePct: 0.05,
                    });
                    levelUpParticles1.setPosition(this.keyBladeSprite.getPosition());
                    levelUpParticles1.setAutoRemoveOnFinish(true);
                    this.addChild(levelUpParticles1, 0);

                    this.fireRingFlare.runAction(cc.sequence(
                      cc.actionTween(5.0, 'phase', 1.0, -0.5).easing(cc.easeExponentialOut()),
                      cc.callFunc(() => {
                        this.fireRingFlare.destroy();
                      }),
                    ));
                  }),
                  cc.delayTime(0.5),
                ),
              ),
            ),
            cc.fadeOut(0.25),
            cc.targetedAction(this.causticSprite, cc.fadeIn(0.4)),
          ));
        });
    } else {
      this.keyBladeSprite.whenRequiredResourcesReady()
        .then((keybladeRequestId) => {
          if (!this.keyBladeSprite.getAreResourcesValid(keybladeRequestId)) return; // load invalidated or resources changed

          this.keyBladeSprite.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.spawn(
              cc.fadeIn(0.2),
              cc.targetedAction(this.causticSprite, cc.fadeIn(0.4)),
            ),
          ));
        });
    }
  },

  showRunStatus(arenaData) {
    _.each(this._runGameNodes, (node) => {
      node.destroy();
    });
    this._runGameNodes = [];

    // temp
    arenaData.games = [
      { won: false },
      { won: true },
      { won: false },
      { won: true },
    ];

    let lastPosition = cc.p(0, 0);
    _.each(arenaData.games, (game, i) => {
      const spriteIdentifier = game.won ? RSX.run_win.img : RSX.run_loss.img;
      const gameSprite = BaseSprite.create(spriteIdentifier);
      const lineSprite = BaseSprite.create(RSX.run_line.img);
      const median = Math.floor(arenaData.games.length / 2) + 1;
      const position = cc.p((-median + i) * (gameSprite.getContentSize().width + lineSprite.getContentSize().width), 0);

      gameSprite.setAnchorPoint(0, 0.39);
      gameSprite.setPosition(position);
      gameSprite.getTexture().setAliasTexParameters();
      lineSprite.setAnchorPoint(0, 0.5);
      lineSprite.setPosition(position.x + gameSprite.getContentSize().width, 0);
      this.addChild(gameSprite);
      this.addChild(lineSprite);

      lastPosition = cc.p(lineSprite.getPosition().x + lineSprite.getContentSize().width, 0);

      this._runGameNodes.push(gameSprite);
      this._runGameNodes.push(lineSprite);
    });

    const gameSprite = BaseSprite.create(RSX.run_current_game.img);
    gameSprite.setAnchorPoint(0, 0.5);
    gameSprite.setPosition(lastPosition);
    this.addChild(gameSprite);

    this._runGameNodes.push(gameSprite);
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
    }
  },

  onHoverButton() {
    if (this._mouseOverButton != null) {
      this._mouseOverButton.setHighlighted(true);
      audio_engine.current().play_effect(RSX.sfx_ui_menu_hover.audio);
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
