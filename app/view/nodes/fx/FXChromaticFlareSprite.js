// pragma PKGS: alwaysloaded

const CONFIG = require('app/common/config');
const RSX = require('app/data/resources');
const FXSprite = require('./FXSprite');

/** **************************************************************************
FXChromaticFlareSprite
var FXChromaticFlareSprite = FXSprite
FXChromaticFlareSprite.create()
 - procedurally generated chromatic explosion sprite
 - use sprite.setTextureRect(cc.rect(x, y, w, h)) to define the size of the sprite
 *************************************************************************** */

var FXChromaticFlareSprite = FXSprite.extend({
  shaderKey: 'ChromaticFlare',

  duration: 1.0,
  antiAlias: true,
  autoZOrder: false,

  // speed of flare
  speed: 0.05,
  // where in effect from 0.0 to 1.0
  phase: 0.0,
  // complexity of flare
  frequency: 0.5,
  // intensity of flare
  amplitude: 0.75,
  // smoothstep
  smoothstepMin: 0.5,
  smoothstepMax: 0.7,

  _createRenderCmd() {
    if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
      return this._super();
    }
    return new FXChromaticFlareSprite.WebGLRenderCmd(this);
  },

  setDefaultOptions() {
    this._super();

    // procedural fx should usually have a scale of 1
    this.setScale(1.0);
  },

  setOptions(options) {
    this._super(options);
    if (options.phase != null) { this.setPhase(options.phase); }
    if (options.speed != null) { this.setSpeed(options.speed); }
    if (options.frequency != null) { this.setFrequency(options.frequency); }
    if (options.amplitude != null) { this.setAmplitude(options.amplitude); }
  },

  setPhase(phase) {
    this.phase = phase || 0.0;
  },
  getPhase() {
    return this.phase;
  },
  setSpeed(speed) {
    this.speed = speed || 1.0;
  },
  getSpeed() {
    return this.speed;
  },
  setFrequency(frequency) {
    this.frequency = frequency || 1.0;
  },
  getFrequency() {
    return this.frequency;
  },
  setAmplitude(amplitude) {
    this.amplitude = amplitude || 1.0;
  },
  getAmplitude() {
    return this.amplitude;
  },
  setSmoothstepMin(smoothstepMin) {
    this.smoothstepMin = smoothstepMin || 1.0;
  },
  getSmoothstepMin() {
    return this.smoothstepMin;
  },
  setSmoothstepMax(smoothstepMax) {
    this.smoothstepMax = smoothstepMax || 1.0;
  },
  getSmoothstepMax() {
    return this.smoothstepMax;
  },

  updateTweenAction(value, key) {
    if (key === 'phase') {
      this.setPhase(value);
    } else {
      FXSprite.prototype.updateTweenAction.call(this, value, key);
    }
  },
  getActionForAnimationSequence() {
    if (this.duration > 0.0) {
      return cc.actionTween(this.duration, 'phase', 0.0, 1.0);
    }
    return FXSprite.prototype.getActionForAnimationSequence.call(this);
  },
});

FXChromaticFlareSprite.WebGLRenderCmd = function (renderable) {
  FXSprite.WebGLRenderCmd.call(this, renderable);
};
const proto = FXChromaticFlareSprite.WebGLRenderCmd.prototype = Object.create(FXSprite.WebGLRenderCmd.prototype);
proto.constructor = FXChromaticFlareSprite.WebGLRenderCmd;

proto.rendering = function () {
  const node = this._node;

  this.updateMatricesForRender();

  const gl = cc._renderContext;
  const shaderProgram = this._shaderProgram;
  shaderProgram.use();
  shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);
  if (shaderProgram.loc_size != null) { shaderProgram.setUniformLocationWith2f(shaderProgram.loc_size, node._rect.width, node._rect.height); }
  if (shaderProgram.loc_phase != null) { shaderProgram.setUniformLocationWith1f(shaderProgram.loc_phase, node.getPhase()); }
  if (shaderProgram.loc_time != null) { shaderProgram.setUniformLocationWith1f(shaderProgram.loc_time, node.getFX().getTime() * node.getSpeed()); }
  if (shaderProgram.loc_frequency != null) { shaderProgram.setUniformLocationWith1f(shaderProgram.loc_frequency, node.getFrequency()); }
  if (shaderProgram.loc_amplitude != null) { shaderProgram.setUniformLocationWith1f(shaderProgram.loc_amplitude, node.getAmplitude()); }
  if (shaderProgram.loc_smoothstepMin != null) { shaderProgram.setUniformLocationWith1f(shaderProgram.loc_smoothstepMin, node.getSmoothstepMin()); }
  if (shaderProgram.loc_smoothstepMax != null) { shaderProgram.setUniformLocationWith1f(shaderProgram.loc_smoothstepMax, node.getSmoothstepMax()); }
  cc.glBlendFunc(node._blendFunc.src, node._blendFunc.dst);
  cc.glBindTexture2DN(0, cc.textureCache.getTextureForKey(RSX.noise.img));

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

FXChromaticFlareSprite.create = function (options, sprite) {
  return FXSprite.create(options, sprite || new FXChromaticFlareSprite(options));
};

module.exports = FXChromaticFlareSprite;
