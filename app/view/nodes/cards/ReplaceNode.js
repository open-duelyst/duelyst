// pragma PKGS: game

const CONFIG = require('app/common/config');
const RSX = require('app/data/resources');
const _ = require('underscore');
const i18next = require('i18next');
const BaseSprite = require('../BaseSprite');

/** **************************************************************************
 ReplaceNode
 *************************************************************************** */

const ReplaceNode = cc.Node.extend({

  backgroundSprite: null,
  innerRingSprite: null,
  innerGlowSprite: null,
  outerRingShineSprite: null,
  outerRingSmokeSprite: null,
  label: null,
  highlighted: false,
  active: false,
  temporarilyEmphasized: false,
  _temporaryEmphasisAction: null,
  isDisabled: false,

  /* region INITIALIZE */

  ctor(options) {
    this._super();

    // apply options
    if (_.isObject(options)) {
      this.setOptions(options);
    }

    this.setAnchorPoint(0.5, 0.5);

    // set content size to match tile size
    const contentSize = cc.size(CONFIG.TILESIZE, CONFIG.TILESIZE);
    this.setContentSize(contentSize);
    const centerPosition = this.getCenterPosition();

    // scale should be 0.5 so that later we can use resources for retina/hd
    const scale = 0.5;

    this.backgroundSprite = BaseSprite.create(RSX.replace_background.img);
    this.backgroundSprite.setPosition(centerPosition);
    this.backgroundSprite.setScale(scale);
    this.addChild(this.backgroundSprite);

    this.innerRingSprite = BaseSprite.create(RSX.replace_inner_ring.img);
    this.innerRingSprite.setPosition(centerPosition);
    this.innerRingSprite.setScale(scale);
    this.addChild(this.innerRingSprite);

    this.innerGlowSprite = BaseSprite.create(RSX.replace_inner_glow.img);
    this.innerGlowSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
    this.innerGlowSprite.setPosition(centerPosition);
    this.innerGlowSprite.setScale(scale);
    this.innerGlowSprite.setVisible(false);
    this.innerGlowSprite.setOpacity(0.0);
    this.addChild(this.innerGlowSprite);

    this.outerRingSmokeSprite = BaseSprite.create(RSX.replace_outer_ring_smoke.img);
    this.outerRingSmokeSprite.setPosition(centerPosition);
    this.outerRingSmokeSprite.setScale(scale);
    this.addChild(this.outerRingSmokeSprite);

    this.outerRingShineSprite = BaseSprite.create(RSX.replace_outer_ring_shine.img);
    this.outerRingShineSprite.setPosition(centerPosition);
    this.outerRingShineSprite.setScale(scale);
    this.addChild(this.outerRingShineSprite);

    // text
    this.label = new cc.LabelTTF(i18next.t('battle.replace_button_label').toUpperCase(), RSX.font_regular.name, 16, cc.size(200, 32), cc.TEXT_ALIGNMENT_CENTER);
    this.label.getTexture().setAntiAliasTexParameters();
    this.label.setAnchorPoint(cc.p(0.5, 0.5));
    this.label.setFontFillColor(cc.color.WHITE);
    this.label.setOpacity(0);
    this.label.setVisible(false);
    // this.label.setPosition(cc.p(centerPosition.x, centerPosition.y - contentSize.height * 0.5));
    this.label.setPosition(cc.p(46, 42));
    this.addChild(this.label);

    this.updateState();
  },

  /* endregion INITIALIZE */

  /* region GETTERS / SETTERS */

  setHighlighted(highlighted) {
    if (this.highlighted !== highlighted) {
      this.highlighted = highlighted;
      this.updateState();
    }
  },

  getHighlighted() {
    return this.highlighted;
  },

  setActive(active) {
    if (this.active !== active) {
      this.active = active;
      this.updateState();
    }
  },

  getActive() {
    return this.active;
  },

  setTemporarilyEmphasized(val) {
    if (this.temporarilyEmphasized !== val) {
      this.temporarilyEmphasized = val;
      if (!this.temporarilyEmphasized && this._temporaryEmphasisAction != null) {
        this.stopAction(this._temporaryEmphasisAction);
        this._temporaryEmphasisAction = null;
      }
      this.updateState();
    }
  },

  getTemporarilyEmphasized() {
    return this.temporarilyEmphasized;
  },

  setIsDisabled(val) {
    if (this.isDisabled !== val) {
      this.isDisabled = val;
      this.updateState();
    }
  },

  getIsDisabled() {
    return this.isDisabled;
  },

  /* endregion GETTERS / SETTERS */

  /* region STATES */

  updateState() {
    if (this.isDisabled) {
      this.showDisabledState();
    } else if (this.temporarilyEmphasized) {
      this.showTemporaryEmphasisState();
    } else if (this.active && this.highlighted) {
      this.showActiveHighlightState();
    } else if (this.active) {
      this.showActiveState();
    } else {
      this.showInactiveState();
    }
  },

  showTemporaryEmphasisState() {
    this.innerGlowSprite.startPulsingOpacity(0.5, 0.0, 255.0);
    this._temporaryEmphasisAction = cc.sequence(
      cc.delayTime(0.5),
      cc.callFunc(() => {
        this._temporaryEmphasisAction = null;
        this.setTemporarilyEmphasized(false);
      }),
    );
    this.runAction(this._temporaryEmphasisAction);
  },

  showDisabledState() {
    this.setVisible(false);
  },

  showActiveHighlightState() {
    this.setVisible(true);
    this._removeDeemphasis();
    this.label.runAction(cc.sequence(
      cc.fadeTo(CONFIG.FADE_MEDIUM_DURATION, 0),
      cc.callFunc(() => {
        this.label.setVisible(false);
      }),
    ));
    this.backgroundSprite.startRotating(30.0, 360.0);
    this.innerGlowSprite.startRotating(30.0, 360.0);
    this.innerGlowSprite.startPulsingOpacity(0.5, 127.0, 255.0);
    this.innerRingSprite.startRotating(10.0, -360.0);
    this.outerRingSmokeSprite.startRotating(10.0, 360.0);
    this.outerRingShineSprite.startRotating(5.0, -360.0);
  },

  showActiveState() {
    this.setVisible(true);
    this._removeDeemphasis();
    this.label.setVisible(true);
    this.label.runAction(cc.fadeTo(CONFIG.FADE_MEDIUM_DURATION, 255));
    this.backgroundSprite.startRotating(60.0, 360.0);
    this.innerGlowSprite.startRotating(60.0, 360.0);
    this.innerGlowSprite.stopPulsingOpacity();
    this.innerGlowSprite.fadeToInvisible(CONFIG.FADE_MEDIUM_DURATION);
    this.innerRingSprite.startRotating(40.0, -360.0);
    this.outerRingSmokeSprite.startRotating(40.0, 360.0);
    this.outerRingShineSprite.startRotating(20.0, -360.0);
  },

  showInactiveState() {
    this.setVisible(true);
    this._showDeemphasis();
    this.label.runAction(cc.sequence(
      cc.fadeTo(CONFIG.FADE_MEDIUM_DURATION, 0),
      cc.callFunc(() => {
        this.label.setVisible(false);
      }),
    ));
    this.backgroundSprite.startRotating(60.0, 360.0);
    this.innerGlowSprite.startRotating(60.0, 360.0);
    this.innerGlowSprite.stopPulsingOpacity();
    this.innerGlowSprite.fadeToInvisible(CONFIG.FADE_MEDIUM_DURATION);
    this.innerRingSprite.startRotating(40.0, -360.0);
    this.outerRingSmokeSprite.startRotating(40.0, 360.0);
    this.outerRingShineSprite.startRotating(20.0, -360.0);
  },

  _showDeemphasis() {
    this.backgroundSprite.setShaderProgram(cc.shaderCache.programForKey('Monochrome'));
    this.innerGlowSprite.setShaderProgram(cc.shaderCache.programForKey('Monochrome'));
    this.innerRingSprite.setShaderProgram(cc.shaderCache.programForKey('Monochrome'));
    this.outerRingSmokeSprite.setShaderProgram(cc.shaderCache.programForKey('Monochrome'));
    this.outerRingShineSprite.setShaderProgram(cc.shaderCache.programForKey('Monochrome'));
  },
  _removeDeemphasis() {
    this.backgroundSprite.setShaderProgram(cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR));
    this.innerGlowSprite.setShaderProgram(cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR));
    this.innerRingSprite.setShaderProgram(cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR));
    this.outerRingSmokeSprite.setShaderProgram(cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR));
    this.outerRingShineSprite.setShaderProgram(cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR));
  },

  /* endregion STATES */

});

ReplaceNode.create = function (options, node) {
  return node || new ReplaceNode(options);
};

module.exports = ReplaceNode;
