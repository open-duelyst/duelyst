const CONFIG = require('app/common/config');
const FXSprite = require('./FXSprite');

/** **************************************************************************
FXDistortionSprite
var FXDistortionSprite = FXSprite
FXDistortionSprite.create()
 - distortion created based on a texture's brightness at each pixel
 *************************************************************************** */

var FXDistortionSprite = FXSprite.extend({
  shaderKey: 'Distortion',

  // distortions always depth test
  // distortion usually facing screen
  depthModifier: 0.0,
  depthOffset: CONFIG.DEPTH_OFFSET * 2.75,

  // progress of distortion from start to finish
  time: 0.0,
  // speed of distortion time
  speed: 1.0,
  // speed of distortion waves
  frequency: 1.0,
  // intensity of distortion
  amplitude: 1.0,
  // refraction, where lower is less
  refraction: 0.05,
  // reflection, where lower is less
  reflection: 0.1,
  // fresnel bias, between 0 and 1
  // where lower is biased towards refraction and higher is biased towards reflection
  fresnelBias: 0.25,

  _createRenderCmd() {
    if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
      return this._super();
    }
    return new FXDistortionSprite.WebGLRenderCmd(this);
  },

  setDefaultOptions() {
    this._super();

    // distortion sprites should have a 1x scale normal map
    // i.e. scale them up 2x outside of game, so the normals are more accurate
    this.setScale(1.0);
  },

  setOptions(options) {
    this._super(options);
    if (options.time != null) { this.setTime(options.time); }
    if (options.speed != null) { this.setSpeed(options.speed); }
    if (options.frequency != null) { this.setFrequency(options.frequency); }
    if (options.amplitude != null) { this.setAmplitude(options.amplitude); }
    if (options.refraction != null) { this.setRefraction(options.refraction); }
    if (options.reflection != null) { this.setReflection(options.reflection); }
    if (options.fresnelBias != null) { this.setFresnelBias(options.fresnelBias); }
  },

  setTime(time) {
    this.time = time || 0.0;
  },
  getTime() {
    return this.time;
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
  setRefraction(refraction) {
    this.refraction = refraction;
  },
  getRefraction() {
    return this.refraction;
  },
  setReflection(reflection) {
    this.reflection = reflection;
  },
  getReflection() {
    return this.reflection;
  },
  setFresnelBias(fresnelBias) {
    this.fresnelBias = fresnelBias;
  },
  getFresnelBias() {
    return this.fresnelBias;
  },
  _setup() {
    FXSprite.prototype._setup.call(this);
    this.getFX().addDistortion(this);
  },
  _teardown() {
    this.getFX().removeDistortion(this);
    FXSprite.prototype._teardown.call(this);
  },
  setLocalZOrder(z) {
    FXSprite.prototype.setLocalZOrder.call(this, z);
    this.getFX().setDistortionsDirty();
  },
  getWorldZOrder() {
    let zOrder = this._zOrder;
    let parent = this._parent;
    while (parent) {
      zOrder += parent._zOrder;
      parent = parent._parent;
    }
    return zOrder;
  },
  getWorldDepth() {
    return this._renderCmd._stackMatrix.mat[13] + (this.depthModifier || 0.0) * this._renderCmd._stackMatrix.mat[5];
  },

  updateTweenAction(value, key) {
    if (key === 'time') {
      this.setTime(value);
    } else {
      FXSprite.prototype.updateTweenAction.call(this, value, key);
    }
  },
  getActionForAnimationSequence() {
    if (this.duration > 0.0 && this.speed > 0.0) {
      return cc.actionTween(this.duration / this.speed, 'time', 0, 1.0);
    }
    return FXSprite.prototype.getActionForAnimationSequence.call(this);
  },
});

FXDistortionSprite.WebGLRenderCmd = function (renderable) {
  FXSprite.WebGLRenderCmd.call(this, renderable);
};
const proto = FXDistortionSprite.WebGLRenderCmd.prototype = Object.create(FXSprite.WebGLRenderCmd.prototype);
proto.constructor = FXDistortionSprite.WebGLRenderCmd;

proto.setDirtyFlag = function (dirtyFlag) {
  FXSprite.WebGLRenderCmd.prototype.setDirtyFlag.call(this, dirtyFlag);
  this._node.getFX().setDistortionsDirty();
};

proto.rendering = function () {
  // distortion sprites are always rendered during fx compositing
};

proto.renderingDistortion = function () {
  const node = this._node;
  const fx = node.getFX();
  const depthMap = fx.getDepthMap();
  const refractMap = fx.getRefractMap();
  if (node._texture == null || refractMap == null) return;

  this.updateMatricesForRender();

  const gl = cc._renderContext;
  const shaderProgram = this._shaderProgram;
  shaderProgram.use();
  shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);
  shaderProgram.setUniformLocationWith1f(shaderProgram.loc_depthOffset, node.depthOffset);
  shaderProgram.setUniformLocationWith1f(shaderProgram.loc_depthModifier, node.depthModifier);
  if (shaderProgram.loc_refraction) { shaderProgram.setUniformLocationWith1f(shaderProgram.loc_refraction, node.refraction); }
  if (shaderProgram.loc_reflection) { shaderProgram.setUniformLocationWith1f(shaderProgram.loc_reflection, node.reflection); }
  if (shaderProgram.loc_fresnelBias) { shaderProgram.setUniformLocationWith1f(shaderProgram.loc_fresnelBias, node.fresnelBias); }
  if (shaderProgram.loc_frequency) { shaderProgram.setUniformLocationWith1f(shaderProgram.loc_frequency, node.frequency); }
  if (shaderProgram.loc_amplitude) { shaderProgram.setUniformLocationWith1f(shaderProgram.loc_amplitude, node.amplitude); }
  if (shaderProgram.loc_time) { shaderProgram.setUniformLocationWith1f(shaderProgram.loc_time, node.time); }
  cc.glBindTexture2DN(0, node._texture);
  cc.glBindTexture2DN(1, depthMap);
  cc.glBindTexture2DN(2, refractMap);
  cc.glBlendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

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

FXDistortionSprite.create = function (options, sprite) {
  return FXSprite.create(options, sprite || new FXDistortionSprite(options));
};

module.exports = FXDistortionSprite;
