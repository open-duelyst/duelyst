// pragma PKGS: speech

const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const EVENTS = require('app/common/event_types');
const UtilsEngine = require('app/common/utils/utils_engine');
const PKGS = require('app/data/packages');
const audio_engine = require('app/audio/audio_engine');
const RSX = require('app/data/resources');
const BaseSprite = require('../BaseSprite');
const BaseLabel = require('../BaseLabel');

/** **************************************************************************
SpeechNode
 - node used to show speech for an entity node
 *************************************************************************** */

const SpeechNode = cc.Node.extend({

  entityNode: null,
  _isPressedOnPressAnywhere: false,
  _isDismissable: true,
  _listeningToEvents: false,
  label: null,
  _showingText: false,
  _showTextAction: null,
  _stoppingShowText: false,
  _stopShowingAction: null,

  /* region INITIALIZE */

  ctor() {
    this._super();

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources have been invalidated

      // text label
      this.label = new BaseLabel('', RSX.font_bold.name, 16, cc.size(CONFIG.GENERAL_SPEECH_WIDTH, 0.0));
      const colorsByFormattingTag = {};
      colorsByFormattingTag[CONFIG.FORMATTING_ENGINE.emphasisStart] = CONFIG.DIALOGUE_HIGHLIGHT_TEXT_COLOR;
      this.label.setColorsByFormattingTag(colorsByFormattingTag);
      this.label.setFontFillColor(CONFIG.DIALOGUE_TEXT_COLOR);
      this.label.setAnchorPoint(0, 1);
      this.addChild(this.label, 1);
    });

    return true;
  },

  onExit() {
    this._super();

    this._stopListeningToEvents();

    const scene = this.getScene();
    const gameLayer = scene && scene.getGameLayer();
    gameLayer && gameLayer.removeNode(this);
  },

  /* endregion INITIALIZE */

  /* region GETTERS / SETTERS */

  getRequiredResources() {
    let resources = cc.Node.prototype.getRequiredResources.call(this);

    // add this package
    resources = resources.concat(PKGS.getPkgForIdentifier('speech'));

    return resources;
  },

  getIsPressedOnPressAnywhere() {
    return this._isPressedOnPressAnywhere;
  },

  setIsPressedOnPressAnywhere(val) {
    this._isPressedOnPressAnywhere = val;
  },

  getIsDismissable() {
    return this._isDismissable;
  },

  setIsDismissable(val) {
    this._isDismissable = val;
  },

  /* endregion GETTERS / SETTERS */

  /* region EVENTS */

  _startListeningToEvents() {
    if (!this._listeningToEvents) {
      this._listeningToEvents = true;

      const scene = this.getScene();
      if (scene != null) {
        scene.getEventBus().on(EVENTS.pointer_up, this.onPointerUp, this);
      }
    }
  },

  _stopListeningToEvents() {
    if (this._listeningToEvents) {
      this._listeningToEvents = false;

      const scene = this.getScene();
      if (scene != null) {
        scene.getEventBus().off(EVENTS.pointer_up, this.onPointerUp, this);
      }
    }
  },

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
        gameLayer.getEventBus().trigger(EVENTS.speech_node_pressed, {
          type: EVENTS.speech_node_pressed,
          tag: this.getText(),
        });
      }
    }
  },

  /* endregion EVENTS */

  /* region TEXT */

  setText(value) {
    if (`${value}` !== this.getText()) {
      this.whenRequiredResourcesReady().then((requestId) => {
        if (!this.getAreResourcesValid(requestId)) return; // resources have been invalidated

        this.label.setString(value, true);
        this._updateLayout();
      });
    }
  },

  getText() {
    return (this.label && this.label.getString()) || '';
  },

  _updateLayout() {
    // override in sub class
  },

  _stopAnimations() {
    this._showingText = false;
    if (this._showTextAction != null) {
      this.stopAction(this._showTextAction);
      this._showTextAction = null;
    }

    this._stoppingShowText = false;
    if (this._stopShowingAction != null) {
      this.stopAction(this._stopShowingAction);
      this._stopShowingAction = null;
    }
  },

  showTextWithSoundForDuration(text, sound, duration, removeFromParentOnComplete, isNotDismissable) {
    let showDuration = 0.0;

    // stop running animations
    this._stopAnimations();

    if (duration == null) {
      duration = CONFIG.SPEECH_DURATION;
    }

    // update show duration
    showDuration += duration + CONFIG.FADE_MEDIUM_DURATION * 2.0;

    // setup for show
    this._showingText = true;
    this.setOpacity(0.0);
    this.setIsDismissable(!isNotDismissable);
    this._removeFromParentOnComplete = removeFromParentOnComplete != null ? removeFromParentOnComplete : false;

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId) && !this._showingText) return; // resources have been invalidated

      this.setVisible(true);

      // start listening for pointer events
      this._startListeningToEvents();

      // update text
      this.setText(text);

      // play sound for enter
      audio_engine.current().play_effect(sound || RSX.sfx_ui_dialogue_enter.audio, false);

      // animate showing
      this._showTextAction = cc.sequence(
        cc.fadeTo(CONFIG.FADE_FAST_DURATION, 255.0),
        cc.delayTime(duration),
        cc.callFunc(() => {
          this.stopShowing();
        }),
      );
      this.runAction(this._showTextAction);
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

      this._stoppingShowText = true;

      this.whenRequiredResourcesReady().then((requestId) => {
        if (!this.getAreResourcesValid(requestId) && !this._stoppingShowText) return; // resources have been invalidated

        // play audio for exit
        audio_engine.current().play_effect(RSX.sfx_ui_dialogue_exit.audio, false);

        // animate out
        const sequence = [
          cc.callFunc(() => {
            this._stoppingShowText = false;
            this._stopShowingAction = null;

            // teardown
            this.setVisible(false);
            if (this._removeFromParentOnComplete) {
              this.destroy();
            }

            // emit event that we're done showing
            const scene = this.getScene();
            const gameLayer = scene && scene.getGameLayer();
            if (gameLayer != null) {
              gameLayer.getEventBus().trigger(EVENTS.speech_node_done_showing, {
                type: EVENTS.speech_node_done_showing,
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
    if (!this._stoppingShowText && !this._showingText) {
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
      this._removeFromParentOnComplete = true;
    }
  },

  /* endregion TEXT */

});

SpeechNode.create = function (node) {
  return node || new SpeechNode();
};

module.exports = SpeechNode;
