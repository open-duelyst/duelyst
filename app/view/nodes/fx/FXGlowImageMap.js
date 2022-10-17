const CONFIG = require('app/common/config');
const BaseSprite = require('../BaseSprite');

/** **************************************************************************
FXGlowImageMap
 *************************************************************************** */

var FXGlowImageMap = BaseSprite.extend({
  shaderKey: 'GlowImageMapControl',

  autoZOrder: false,
  removeOnEnd: false,

  // uniforms
  timeScale: 0.067,
  intensity: 1.0,
  gamma: 1.0,
  levelsInWhite: 255.0,
  levelsInBlack: 0.0,
  glowColor: CONFIG.DEFAULT_GLOW_COLOR,
  _sourceGlowColor: null,
  _targetGlowColor: null,
  _glowColorAction: null,

  seed: null,

  ctor(options) {
    this._super(options);
    this.seed = Math.random() * 1000;
  },

  _createRenderCmd() {
    if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
      return this._super();
    }
    return new FXGlowImageMap.WebGLRenderCmd(this);
  },

  setOptions(options) {
    this._super(options);
    if (options.timeScale != null) { this.setTimeScale(options.timeScale); }
    if (options.intensity != null) { this.setIntensity(options.intensity); }
    if (options.gamma != null) { this.setGamma(options.gamma); }
    if (options.levelsInWhite != null) { this.setLevelsInWhite(options.levelsInWhite); }
    if (options.levelsInBlack != null) { this.setLevelsInBlack(options.levelsInBlack); }
    if (options.glowColor != null) { this.setGlowColor(options.glowColor); }
  },

  getTimeScale() {
    return this.timeScale;
  },

  setTimeScale(timeScale) {
    this.timeScale = timeScale;
  },

  getIntensity() {
    return this.intensity;
  },

  setIntensity(intensity) {
    this.intensity = intensity;
  },

  getGamma() {
    return this.gamma;
  },

  setGamma(gamma) {
    this.gamma = gamma;
  },

  getLevelsInWhite() {
    return this.levelsInWhite;
  },

  setLevelsInWhite(val) {
    this.levelsInWhite = val;
  },

  getLevelsInBlack() {
    return this.levelsInBlack;
  },

  setLevelsInBlack(val) {
    this.levelsInBlack = val;
  },

  getGlowColor() {
    return this.glowColor;
  },

  setGlowColor(glowColor) {
    this.glowColor = glowColor;
  },

  animateGlowColor(duration, glowColor) {
    if (this._glowColorAction != null && !this._glowColorAction.isDone()) {
      this.stopAction(this._glowColorAction);
    }
    if (!cc.colorEqual(this.glowColor, glowColor)) {
      this._sourceGlowColor = { r: this.glowColor.r, g: this.glowColor.g, b: this.glowColor.b };
      this._targetGlowColor = glowColor;
      this._glowColorAction = new cc.ActionTween(duration, 'glowColor', 0.0, 1.0);
      this.runAction(this._glowColorAction);
    }
  },

  updateTweenAction(value, key) {
    switch (key) {
    case 'timeScale':
      this.setTimeScale(value);
      break;
    case 'glowColor':
      var invValue = 1.0 - value;
      var src = this._sourceGlowColor;
      var tgt = this._targetGlowColor;
      var glowColor = {
        r: src.r * invValue + tgt.r * value,
        g: src.g * invValue + tgt.g * value,
        b: src.b * invValue + tgt.b * value,
      };
      this.setGlowColor(glowColor);
      break;
    default:
      BaseSprite.prototype.updateTweenAction.call(this, value, key);
      break;
    }
  },
});

FXGlowImageMap.WebGLRenderCmd = function (renderable) {
  BaseSprite.WebGLRenderCmd.call(this, renderable);
};
const proto = FXGlowImageMap.WebGLRenderCmd.prototype = Object.create(BaseSprite.WebGLRenderCmd.prototype);
proto.constructor = FXGlowImageMap.WebGLRenderCmd;

proto.rendering = function () {
  const node = this._node;
  if (!node._texture) return;

  this.updateMatricesForRender();

  const gl = cc._renderContext;
  const shaderProgram = this._shaderProgram;
  shaderProgram.use();
  shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);
  shaderProgram.setUniformLocationWith2f(shaderProgram.loc_texResolution, node._texture.getPixelsWide(), node._texture.getPixelsHigh());
  shaderProgram.setUniformLocationWith1f(shaderProgram.loc_time, (node.getFX().getTime() + node.seed) * node.timeScale);
  shaderProgram.setUniformLocationWith1f(shaderProgram.loc_intensity, node.intensity);
  shaderProgram.setUniformLocationWith1f(shaderProgram.loc_gamma, node.gamma);
  shaderProgram.setUniformLocationWith1f(shaderProgram.loc_levelsInWhite, node.levelsInWhite / 255.0);
  shaderProgram.setUniformLocationWith1f(shaderProgram.loc_levelsInBlack, node.levelsInBlack / 255.0);
  shaderProgram.setUniformLocationWith3f(shaderProgram.loc_color, node.glowColor.r / 255.0, node.glowColor.g / 255.0, node.glowColor.b / 255.0);

  cc.glBindTexture2DN(0, node._texture);
  cc.glBlendFunc(node._blendFunc.src, node._blendFunc.dst);

  cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);
  gl.bindBuffer(gl.ARRAY_BUFFER, this._quadWebBuffer);
  if (this._quadDirty) {
    this._quadDirty = false;
    gl.bufferData(gl.ARRAY_BUFFER, this._quad.arrayBuffer, gl.DYNAMIC_DRAW);
  }
  gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0);
  gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12);
  gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 24, 16);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  this.updateMatricesAfterRender();
};

FXGlowImageMap.create = function (options, sprite) {
  return BaseSprite.create.call(this, options, sprite || new FXGlowImageMap(options));
};

module.exports = FXGlowImageMap;
