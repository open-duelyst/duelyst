// pragma PKGS: instruction

const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const audio_engine = require('app/audio/audio_engine');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const UtilsEngine = require('app/common/utils/utils_engine');
const SDK = require('app/sdk');
const EVENTS = require('app/common/event_types');
const Promise = require('bluebird');
const EntitySupportNode = require('./EntitySupportNode');
const BaseSprite = require('../BaseSprite');
const BaseLabel = require('../BaseLabel');

/** **************************************************************************
 InstructionNode
 - node used to show instruction for an entity node
 *************************************************************************** */

var InstructionNode = cc.Node.extend({

  _bgResourceRequestId: null,
  bgSprite: null,
  _carrotDirection: null,
  entityNode: null,
  _isPressedOnPressAnywhere: false,
  _isDismissable: true,
  _listeningToEvents: false,
  label: null,
  _removeFromParentOnComplete: null,
  _showAction: null,
  _stoppingShow: false,
  _stopShowingAction: null,

  /* region INITIALIZE */

  ctor() {
    this._super();

    this.setCascadeOpacityEnabled(true);

    // text label setup
    this.label = new BaseLabel('', RSX.font_regular.name, 16, cc.size(CONFIG.INSTRUCTION_TEXT_MAX_WIDTH, 0.0));
    const colorsByFormattingTag = {};
    colorsByFormattingTag[CONFIG.FORMATTING_ENGINE.emphasisStart] = CONFIG.INSTRUCTION_NODE_HIGHLIGHT_TEXT_COLOR;
    this.label.setColorsByFormattingTag(colorsByFormattingTag);
    this.label.setFontFillColor(CONFIG.INSTRUCTION_NODE_TEXT_COLOR);
    this.label.setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    this.label.setAnchorPoint(0.5, 0.5);

    return true;
  },

  getRequiredResources() {
    return cc.Node.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier('instruction'));
  },

  onExit() {
    this._super();
    this._stopListeningToEvents();
  },

  /* endregion INITIALIZE */

  /* region GETTERS / SETTERS */

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

      if (this._isDismissable && (this._stopShowingAction == null || this._stopShowingAction.isDone())) {
        // stop showing
        this.stopShowingIfAble(true);

        // emit event that this was pressed
        gameLayer.getEventBus().trigger(EVENTS.instruction_node_pressed, {
          type: EVENTS.instruction_node_pressed,
          tag: this.getText(),
        });
      }
    }
  },

  /* endregion EVENTS */

  /* region TEXT */

  showTextWithSoundForDuration(text, sound, duration, removeFromParentOnComplete, isNotDismissable, carrotDirection) {
    if (duration == null) { duration = CONFIG.SPEECH_DURATION; }
    const showDuration = duration + CONFIG.FADE_MEDIUM_DURATION * 2.0;

    if (removeFromParentOnComplete == null) { removeFromParentOnComplete = false; }
    this._removeFromParentOnComplete = removeFromParentOnComplete;

    this.setIsDismissable(!isNotDismissable);

    this._setCarrotDirection(carrotDirection != null ? carrotDirection : InstructionNode.DIRECTION_DOWN);

    this._stoppingShow = false;
    this.setVisible(false);

    // update text
    this.setText(text);

    Promise.all([
      this.whenRequiredResourcesReady(),
      this.whenResourcesReady(this._bgResourceRequestId),
    ])
      .spread((requiredRequestId, bgRequestId) => {
        if (!this.getAreResourcesValid(requiredRequestId) || !this.getAreResourcesValid(bgRequestId)) return; // load invalidated or resources changed

        // stop any showing/removing
        this._stoppingShow = false;
        if (this._stopShowingAction != null) {
          this.bgSprite.stopAction(this._stopShowingAction);
          this._stopShowingAction = null;
        }
        if (this._showAction != null) {
          this.bgSprite.stopAction(this._showAction);
          this._showAction = null;
        }

        // play sound for enter
        audio_engine.current().play_effect(sound || RSX.sfx_ui_instructional_enter.audio, false);

        // setup for show
        this.setVisible(true);
        this.bgSprite.setOpacity(0.0);
        this.bgSprite.setScale(1.0);
        const bgPosition = this.bgSprite.getPosition();
        let offset;
        if (this.getIsLeft()) {
          offset = cc.p(20.0, 0.0);
        } else if (this.getIsRight()) {
          offset = cc.p(-20.0, 0.0);
        } else if (this.getIsUp()) {
          offset = cc.p(0.0, -20.0);
        } else {
          offset = cc.p(0.0, 20.0);
        }
        this.bgSprite.setPosition(bgPosition.x - offset.x, bgPosition.y - offset.y);

        // animate showing
        this._showAction = cc.sequence(
          cc.spawn(
            cc.fadeTo(CONFIG.FADE_FAST_DURATION, 255.0),
            cc.moveBy(CONFIG.FADE_FAST_DURATION, offset).easing(cc.easeCubicActionOut()),
          ),
          cc.delayTime(duration),
          cc.callFunc(() => {
            this._showAction = null;
            this.stopShowing();
          }),
        );
        this.bgSprite.runAction(this._showAction);

        // listen for pointer events
        this._startListeningToEvents();
      });

    return showDuration;
  },

  stopShowing(fromPress) {
    let showDuration;
    if (fromPress) {
      showDuration = CONFIG.FADE_FAST_DURATION;
    } else {
      showDuration = CONFIG.FADE_MEDIUM_DURATION;
    }

    if (!this._stoppingShow && this.isVisible() && (this._stopShowingAction == null || !this._stopShowingAction.getActive())) {
      this._stoppingShow = true;

      // stop any removing
      if (this._stopShowingAction != null) {
        this.stopAction(this._stopShowingAction);
        this._stopShowingAction = null;
      }

      Promise.all([
        this.whenRequiredResourcesReady(),
        this.whenResourcesReady(this._bgResourceRequestId),
      ])
        .spread((requiredRequestId, bgRequestId) => {
          if (!this.getAreResourcesValid(requiredRequestId) || !this.getAreResourcesValid(bgRequestId)) return; // load invalidated or resources changed

          if (this._stoppingShow && (this._stopShowingAction == null || !this._stopShowingAction.getActive())) {
            this._stoppingShow = false;

            // stop listening for pointer events
            this._stopListeningToEvents();

            // stop any showing
            if (this._showAction != null) {
              this.bgSprite.stopAction(this._showAction);
              this._showAction = null;
            }

            // play exit sound
            audio_engine.current().play_effect(RSX.sfx_ui_instructional_exit.audio, false);

            // animate out
            const sequence = [
              cc.callFunc(() => {
                this._stopShowingAction = null;

                // teardown
                this.setVisible(false);
                this.setScale(1.0);
                if (this._removeFromParentOnComplete) {
                  this.destroy();
                }

                // emit event that we're done showing
                const scene = this.getScene();
                const gameLayer = scene && scene.getGameLayer();
                if (gameLayer != null) {
                  gameLayer.getEventBus().trigger(EVENTS.instruction_node_done_showing, {
                    type: EVENTS.instruction_node_done_showing,
                    tag: this.getText(),
                  });
                }
              }),
            ];
            if (fromPress) {
              sequence.unshift(cc.spawn(
                cc.fadeTo(showDuration, 0),
                cc.scaleTo(showDuration, 1.05).easing(cc.easeCubicActionOut()),
              ));
            } else {
              sequence.unshift(cc.spawn(
                cc.fadeTo(showDuration, 0),
                cc.scaleTo(showDuration, 0.8).easing(cc.easeCubicActionIn()),
              ));
            }
            this._stopShowingAction = cc.sequence(sequence);
            this.bgSprite.runAction(this._stopShowingAction);
          }
        });
    }

    return showDuration;
  },

  stopShowingIfAble(fromPress) {
    return this.stopShowing(fromPress);
  },

  _updateBackground() {
    const bgResource = RSX[`tooltip_${this._carrotDirection}`];
    if (this._bgResourceRequestId != null) {
      this.removeResourceRequestById(this._bgResourceRequestId);
    }
    this._bgResourceRequestId = `tooltip_bg_${UtilsJavascript.generateIncrementalId()}`;
    this.addResourceRequest(this._bgResourceRequestId, null, [bgResource]);

    Promise.all([
      this.whenRequiredResourcesReady(),
      this.whenResourcesReady(this._bgResourceRequestId),
    ])
      .spread((requiredRequestId, bgRequestId) => {
        if (!this.getAreResourcesValid(requiredRequestId) || !this.getAreResourcesValid(bgRequestId)) return; // load invalidated or resources changed

        if (this.bgSprite) {
          this.bgSprite.removeChild(this.label);
          this.removeChild(this.bgSprite);
          this.bgSprite = null;
        }

        // Reposition the text to center (considering anchor point)
        let bgOffsetToCenter;
        const centerPositionOffset = cc.p(0, 0);
        if (this._carrotDirection == InstructionNode.DIRECTION_DOWN) {
          this.setAnchorPoint(0.5, 0.0);
          bgOffsetToCenter = cc.p(0, 25);
          centerPositionOffset.y -= 15;
        } else if (this._carrotDirection == InstructionNode.DIRECTION_UP) {
          this.setAnchorPoint(0.5, 1.0);
          bgOffsetToCenter = cc.p(0, -25);
          centerPositionOffset.y += 15;
        } else if (this._carrotDirection == InstructionNode.DIRECTION_LEFT) {
          this.setAnchorPoint(0.0, 0.5);
          bgOffsetToCenter = cc.p(25, 0);
          centerPositionOffset.x -= 20;
        } else {
          // Assume right
          this.setAnchorPoint(1.0, 0.5);
          bgOffsetToCenter = cc.p(-25, 0);
          centerPositionOffset.x += 20;
        }

        // create bg sprite
        this.bgSprite = BaseSprite.create(bgResource.img);
        this.bgSprite.setAntiAlias(false);
        this.addChild(this.bgSprite, 0);

        // set content size to match bg sprite
        this.setContentSize(this.bgSprite.getContentSize());
        this.bgSprite.setPosition(this.getCenterPosition().x + centerPositionOffset.x, this.getCenterPosition().y + centerPositionOffset.y);
        this.bgSprite.addChild(this.label, 1);

        this.label.setPosition(this.bgSprite.getContentSize().width * 0.5 + bgOffsetToCenter.x, this.bgSprite.getContentSize().height * 0.5 + bgOffsetToCenter.y);
      });
  },

  setText(value) {
    if (`${value}` !== this.label.getString()) {
      // Set the labels string
      this.label.setString(value, true);
    }
  },

  getText() {
    return this.label.getString();
  },

  /* endregion TEXT */

  /* region CARROT */

  _setCarrotDirection(carrotDirection) {
    if (carrotDirection != this._carrotDirection) {
      this._carrotDirection = carrotDirection;
      this._updateBackground();
    }
  },

  getIsLeft() {
    return this._carrotDirection === InstructionNode.DIRECTION_LEFT;
  },

  getIsRight() {
    return this._carrotDirection === InstructionNode.DIRECTION_RIGHT;
  },

  getIsUp() {
    return this._carrotDirection === InstructionNode.DIRECTION_UP;
  },

  getIsDown() {
    return this._carrotDirection === InstructionNode.DIRECTION_DOWN;
  },

  /* endregion CARROT */

});

InstructionNode.create = function (node) {
  return node || new InstructionNode();
};

InstructionNode.DIRECTION_UP = 'up';
InstructionNode.DIRECTION_DOWN = 'down';
InstructionNode.DIRECTION_LEFT = 'left';
InstructionNode.DIRECTION_RIGHT = 'right';

module.exports = InstructionNode;
