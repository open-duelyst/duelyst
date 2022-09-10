// pragma PKGS: general_speech

const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const EVENTS = require('app/common/event_types');
const UtilsEngine = require('app/common/utils/utils_engine');
const PKGS = require('app/data/packages');
const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const audio_engine = require('app/audio/audio_engine');
const BaseSprite = require('app/view/nodes/BaseSprite');
const GlowSprite = require('app/view/nodes/GlowSprite');
const FXRipplingGlowImageMapSprite = require('app/view/nodes/fx/FXRipplingGlowImageMapSprite');
const SpeechNode = require('./SpeechNode');

/** **************************************************************************
 GeneralSpeechNode
 - node used to show a general's speech
 *************************************************************************** */

const GeneralSpeechNode = SpeechNode.extend({
  // sprites
  bgSprite: null, // background base sprite
  bgSpriteGlow: null, // background glow base sprite
  _entryYPosition: null, // number representing a percentage along the y axis of the screen this will enter at
  generalSprite: null, // baseSprite of generals portrait
  generalBorderSprite: null, // basesprite of general border
  _isPressedOnPressAnywhere: true, // general speech is dismissed when clicking anywhere
  _isPersistent: false,
  _proceedCarrotSprite: null, // basesprite for showing proceed carrot
  _rawBGSize: cc.p(554.0, 210.0),
  _sdkPlayer: null, // the sdk player this speech is for
  speakerLabel: null,

  /* region INITIALIZE */

  ctor(sdkPlayer) {
    if (sdkPlayer == null) {
      throw new Error('GeneralSpeechNode must be initialized with a player!');
    }
    this._sdkPlayer = sdkPlayer;

    this._super();

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources have been invalidated

      // create bg sprite
      this.bgSpriteGlow = new FXRipplingGlowImageMapSprite({
        spriteIdentifier: RSX.dialog_plate_glow.img,
        // blendSrc: "SRC_ALPHA",
        // blendDst: "ONE",
        scale: 1.0,
        levelsInWhite: 200,
        // gamma: 2.0,
        gamma: 0.75,
        intensity: 0.75,
      });
      this.bgSpriteGlow.setPosition(-95, -6);
      this.addChild(this.bgSpriteGlow, -1);

      // create bg sprite
      this.bgSprite = new BaseSprite(RSX.dialog_plate.img);
      this.addChild(this.bgSprite, 0);

      // get the general for this player
      const playerId = this._sdkPlayer.getPlayerId();
      const playerSetupData = SDK.GameSession.getInstance().getPlayerSetupDataForPlayerId(playerId);
      const originalGeneral = SDK.GameSession.getCardCaches().getCardById(playerSetupData.generalId);
      const general = SDK.GameSession.getInstance().getGeneralForPlayerId(playerId) || originalGeneral;
      const portraitCenterPosition = cc.p(-159, 0);

      const generalSpeechResource = general.getSpeechResource() || originalGeneral.getSpeechResource();
      this.generalSprite = new BaseSprite(generalSpeechResource.img);
      this.generalSprite.setAntiAlias(false);
      this.generalSprite.setPosition(portraitCenterPosition);
      this.addChild(this.generalSprite, 1);

      this.generalBorderSprite = new BaseSprite(RSX.dialogue_border.img);
      this.generalBorderSprite.setAntiAlias(false);
      this.generalBorderSprite.setPosition(portraitCenterPosition);

      // create carat sprite
      this._proceedCarrotSprite = GlowSprite.create(RSX.dialogue_carat.img);
      this._proceedCarrotSprite.setAntiAlias(false);
      this._proceedCarrotSprite.setAnchorPoint(1, 0);
      this._proceedCarrotSprite.setPosition(175, -55);
      this._proceedCarrotSprite.setVisible(false);
      this._proceedCarrotSprite.setGlowNoiseExpandModifier(100);
      this._proceedCarrotSprite.setGlowThickness(1);
      this._proceedCarrotSprite.setGlowMinAlpha(0);
      this._proceedCarrotSprite.setGlowMaxAlpha(255);
      this._proceedCarrotSprite.setGlowFrequency(CONFIG.INSTRUCTIONAL_CARROT_GLOW_FREQUENCY);
      this._proceedCarrotSprite.showGlowForPlayer();
      this._proceedCarrotSprite.setGlowMaxAlpha(255);
      this._proceedCarrotSprite.setGlowVerticalFadeFromTop(1.0);
      this._proceedCarrotSprite.setGlowing(false);
      this.addChild(this._proceedCarrotSprite, 0);

      // speaker label
      this.speakerLabel = new cc.LabelTTF('', RSX.font_bold.name, 16, cc.size(CONFIG.GENERAL_SPEECH_WIDTH, 0.0));
      this.speakerLabel.setAnchorPoint(0, 1);
      this.speakerLabel.setFontFillColor(CONFIG.DIALOGUE_HEADER_TITLE_COLOR);
      this.speakerLabel.setString(general.getName(), true);
      this.speakerLabel.setPositionX(Math.round(this.bgSprite.width * -0.13));
      this.addChild(this.speakerLabel, 1);

      this._updateLayout();
    });

    return true;
  },

  /* endregion INITIALIZE */

  /* region GETTERS / SETTERS */

  getRequiredResources() {
    let resources = SpeechNode.prototype.getRequiredResources.call(this);

    // add this package
    resources = resources.concat(PKGS.getPkgForIdentifier('general_speech'));

    // add general speech resource
    const playerId = this._sdkPlayer.getPlayerId();
    const playerSetupData = SDK.GameSession.getInstance().getPlayerSetupDataForPlayerId(playerId);
    const originalGeneral = SDK.GameSession.getCardCaches().getCardById(playerSetupData.generalId);
    const general = SDK.GameSession.getInstance().getGeneralForPlayerId(playerId) || originalGeneral;
    const generalSpeechResource = general.getSpeechResource() || originalGeneral.getSpeechResource();
    if (generalSpeechResource != null) {
      resources.push(generalSpeechResource);
    }

    return resources;
  },

  /* endregion GETTERS / SETTERS */

  /* region EVENTS */

  onPointerUp(event) {
    if (event == null || event.isStopped) {
      return;
    }

    const location = event.getLocation();
    const scene = this.getScene();
    const gameLayer = scene && scene.getGameLayer();
    if (gameLayer && this.isVisible() && this.getDisplayedOpacity() > 0.0
      && (this._isPressedOnPressAnywhere || UtilsEngine.getNodeUnderMouse(this.bgSprite, location.x, location.y))) {
      // play sound for click
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_click.audio, CONFIG.CLICK_SFX_PRIORITY);

      if (this._isDismissable && !this._stoppingShowText) {
        // stop showing
        this.stopShowingIfAble(true);

        // emit event that this was pressed
        gameLayer.getEventBus().trigger(EVENTS.general_speech_pressed, {
          type: EVENTS.general_speech_pressed,
          tag: this.getText(),
        });
      }
    }
  },

  /* endregion EVENTS */

  /* region TEXT */

  _updateLayout() {
    this._super();

    const verticalGapBetweenLabels = 20.0;
    if (this.speakerLabel != null) {
      this.speakerLabel.setPosition(-80, 40);
      if (this.label != null) {
        this.label.setPositionX(this.speakerLabel.getPositionX());
        this.label.setPositionY(this.speakerLabel.getPositionY() - this.speakerLabel.height - verticalGapBetweenLabels / this._rawBGSize.y);
      }
    }
  },

  _stopAnimations() {
    this._super();
    if (this._pulseCarrotAction != null) {
      this.stopAction(this._pulseCarrotAction);
      this._pulseCarrotAction = null;
    }
  },

  showTextWithSoundForDuration(text, sound, duration, removeFromParentOnComplete, isNotDismissable, atYPosition, willPersist) {
    let showDuration = 0.0;

    // stop any showing text
    this._stopAnimations();

    if (duration == null) {
      duration = CONFIG.SPEECH_DURATION;
    }

    // update show duration
    showDuration += duration + CONFIG.DIALOGUE_ENTER_DURATION + CONFIG.FADE_SLOW_DURATION;

    this.setIsDismissable(!isNotDismissable);
    this._removeFromParentOnComplete = removeFromParentOnComplete != null ? removeFromParentOnComplete : false;
    this._entryYPosition = atYPosition = atYPosition != null ? atYPosition : 0.66;
    this._isPersistent = willPersist;

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId) && !this._showingText) return; // resources have been invalidated

      // start listening for pointer events
      this._startListeningToEvents();

      this._proceedCarrotSprite.setVisible(willPersist);

      const isPlayerOne = SDK.GameSession.current().getPlayer1().playerId == this._sdkPlayer.playerId;

      const winRect = UtilsEngine.getGSIWinRect();
      let xMovement;
      if (isPlayerOne) {
        xMovement = this.bgSprite.width + 25;
        this.setPosition(winRect.x - this.bgSprite.width * 0.5, winRect.y + winRect.height * atYPosition);
      } else {
        xMovement = -this.bgSprite.width - 25;
        this.setPosition(winRect.x + winRect.width + this.bgSprite.width * 0.5, winRect.y + winRect.height * atYPosition);
      }
      xMovement = Math.round(xMovement);

      // update text
      this.setText(text);

      // setup for show
      this.setVisible(true);
      this.setOpacity(255.0);

      // play sound for enter
      audio_engine.current().play_effect(sound || RSX.sfx_ui_dialogue_enter.audio, false);

      // animate showing
      this._showTextAction = cc.sequence(
        cc.moveBy(CONFIG.DIALOGUE_ENTER_DURATION, xMovement, 0),
        cc.delayTime(duration),
        cc.callFunc(() => {
          this._showingText = false;
          this._showTextAction = null;
          if (!this._isPersistent) {
            this.stopShowing();
          }
        }),
      );
      this.runAction(this._showTextAction);

      if (this._isPersistent) {
        // pulse the proceed carrot after a delay
        this._pulseCarrotAction = cc.sequence(
          cc.delayTime(CONFIG.DIALOGUE_ENTER_DURATION + CONFIG.DIALOGUE_PROCEED_PULSE_DELAY),
          cc.callFunc(() => {
            this._pulseCarrotAction = null;
            this._proceedCarrotSprite.setGlowing(true);
          }),
        );
        this.runAction(this._pulseCarrotAction);
      }
    });

    return showDuration;
  },

  stopShowing(fromPress) {
    let showDuration = 0.0;

    if (this.isVisible() && !this._stoppingShowText) {
      // stop listening for pointer events
      this._stopListeningToEvents();

      // stop animations
      this._stopAnimations();

      this.whenRequiredResourcesReady().then((requestId) => {
        if (!this.getAreResourcesValid(requestId) && !this._stoppingShowText) return; // resources have been invalidated

        this._proceedCarrotSprite.setGlowing(false);

        // play audio for exit
        audio_engine.current().play_effect(RSX.sfx_ui_dialogue_exit.audio, false);

        // animate out
        const sequence = [
          cc.callFunc(() => {
            this._stoppingShowText = false;
            this._stopShowingAction = null;

            // teardown
            this.setVisible(false);
            this.setScale(1.0);
            if (this._removeFromParentOnComplete) {
              this.destroy();
            }
            const scene = this.getScene();
            const gameLayer = scene && scene.getGameLayer();
            if (gameLayer != null) {
              gameLayer.getEventBus().trigger(EVENTS.general_speech_done_showing, {
                type: EVENTS.general_speech_done_showing,
                tag: this.getText(),
              });
            }
          }),
        ];
        if (fromPress) {
          showDuration = CONFIG.FADE_FAST_DURATION;
          sequence.unshift(cc.spawn(
            cc.fadeTo(showDuration, 0),
            cc.scaleTo(showDuration, 1.05).easing(cc.easeCubicActionOut()),
          ));
        } else {
          showDuration = CONFIG.FADE_MEDIUM_DURATION;
          sequence.unshift(cc.spawn(
            cc.fadeTo(showDuration, 0),
            cc.scaleTo(showDuration, 0.8).easing(cc.easeCubicActionIn()),
          ));
        }
        this._stopShowingAction = cc.sequence(sequence);
        this.runAction(this._stopShowingAction);
      });
    }
    return showDuration;
  },

  stopShowingIfAble(fromPress) {
    let showDuration = 0.0;
    if (!this._stoppingShowText && (!this._showingText || this._isPersistent)) {
      showDuration = this.stopShowing(fromPress);
    }
    return showDuration;
  },

  destroyWhenDoneShowingText() {
    if (!this._showingText && !this._stoppingShowText) {
      // instant remove
      this.destroy();
    } else {
      // set flags for removal
      this._isPersistent = false;
      this._removeFromParentOnComplete = true;
    }
  },

  /* endregion TEXT */

});

GeneralSpeechNode.create = function (sdkPlayer, node) {
  return node || new GeneralSpeechNode(sdkPlayer);
};

module.exports = GeneralSpeechNode;
