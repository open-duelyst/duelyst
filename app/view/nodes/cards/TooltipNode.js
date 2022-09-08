// pragma PKGS: tooltip

const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const audio_engine = require('app/audio/audio_engine');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const Promise = require('bluebird');
const EntitySupportNode = require('./EntitySupportNode');
const BaseSprite = require('../BaseSprite');
const BaseLabel = require('../BaseLabel');

/** **************************************************************************
 TooltipNode
 - node used to show instruction for an entity node
 *************************************************************************** */

var TooltipNode = cc.Node.extend({

  _bgResourceRequestId: null,
  bgSprite: null,
  _carrotDirection: null,
  entityNode: null,
  label: null,
  _stopShowingAction: null,

  /* region INITIALIZE */

  ctor() {
    this._super();

    this.setCascadeOpacityEnabled(true);

    // text label setup
    this.label = new BaseLabel('', RSX.font_regular.name, 16, cc.size(CONFIG.TOOLTIP_TEXT_MAX_WIDTH, 0.0));
    const colorsByFormattingTag = {};
    colorsByFormattingTag[CONFIG.FORMATTING_ENGINE.emphasisStart] = CONFIG.INSTRUCTION_NODE_HIGHLIGHT_TEXT_COLOR;
    this.label.setColorsByFormattingTag(colorsByFormattingTag);
    this.label.setFontFillColor(CONFIG.INSTRUCTION_NODE_TEXT_COLOR);
    this.label.setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    this.label.setAnchorPoint(0.5, 0.5);

    return true;
  },

  getRequiredResources() {
    return cc.Node.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier('tooltip'));
  },

  /* endregion INITIALIZE */

  showText(text, carrotDirection) {
    const showDuration = 0.0;

    // stop any removing
    if (this._stopShowingAction != null) {
      this.stopAction(this._stopShowingAction);
      this._stopShowingAction = null;
    }

    // set carrot
    if (carrotDirection == null) {
      carrotDirection = TooltipNode.DIRECTION_DOWN;
    }
    this._setCarrotDirection(carrotDirection);

    // set text
    this.setText(text);

    this._stoppingShow = false;
    this.setVisible(false);

    Promise.all([
      this.whenRequiredResourcesReady(),
      this.whenResourcesReady(this._bgResourceRequestId),
    ])
      .spread((requiredRequestId, bgRequestId) => {
        if (!this.getAreResourcesValid(requiredRequestId) || !this.getAreResourcesValid(bgRequestId)) return; // load invalidated or resources changed

        // play sound
        audio_engine.current().play_effect(RSX.sfx_ui_instructional_enter.audio);

        // show instantly
        this.setOpacity(255.0);
        this.setVisible(true);
      });

    return showDuration;
  },

  stopShowing() {
    const showDuration = CONFIG.FADE_FAST_DURATION;
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

            // play exit sound
            audio_engine.current().play_effect(RSX.sfx_ui_instructional_exit.audio);

            // animate out
            this._stopShowingAction = cc.sequence(
              cc.fadeTo(showDuration, 0.0),
              cc.callFunc(() => {
                this._stopShowingAction = null;
                this.setVisible(false);
              }),
            );
            this.runAction(this._stopShowingAction);
          }
        });
    }

    return showDuration;
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

        if (this.bgSprite != null) {
          this.bgSprite.removeChild(this.label);
          this.removeChild(this.bgSprite);
          this.bgSprite = null;
        }

        // Reposition the text to center (considering anchor point)
        let bgOffsetToCenter;
        const centerPositionOffset = cc.p(0, 0);
        if (this._carrotDirection == TooltipNode.DIRECTION_DOWN) {
          this.setAnchorPoint(0.5, 0.0);
          bgOffsetToCenter = cc.p(0, 25);
          centerPositionOffset.y -= 15;
        } else if (this._carrotDirection == TooltipNode.DIRECTION_UP) {
          this.setAnchorPoint(0.5, 1.0);
          bgOffsetToCenter = cc.p(0, -25);
          centerPositionOffset.y += 15;
        } else if (this._carrotDirection == TooltipNode.DIRECTION_LEFT) {
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
    return this._carrotDirection === TooltipNode.DIRECTION_LEFT;
  },

  getIsRight() {
    return this._carrotDirection === TooltipNode.DIRECTION_RIGHT;
  },

  getIsUp() {
    return this._carrotDirection === TooltipNode.DIRECTION_UP;
  },

  getIsDown() {
    return this._carrotDirection === TooltipNode.DIRECTION_DOWN;
  },

  /* endregion CARROT */

});

TooltipNode.create = function (node) {
  return node || new TooltipNode();
};

TooltipNode.DIRECTION_UP = 'up';
TooltipNode.DIRECTION_DOWN = 'down';
TooltipNode.DIRECTION_LEFT = 'left';
TooltipNode.DIRECTION_RIGHT = 'right';

module.exports = TooltipNode;
