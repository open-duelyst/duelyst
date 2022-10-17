const CONFIG = require('app/common/config');
const BaseSprite = require('../BaseSprite');

/** **************************************************************************
FXCardShineSprite
 *************************************************************************** */

var FXCardShineSprite = BaseSprite.extend({
  shaderKey: 'CardAngledGradientShine',

  autoZOrder: false,
  removeOnEnd: false,

  // uniforms
  phase: 0.0,
  intensity: 1.0,

  _createRenderCmd() {
    if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
      return this._super();
    }
    return new FXCardShineSprite.WebGLRenderCmd(this);
  },

  setOptions(options) {
    this._super(options);
    if (options.phase != null) { this.setPhase(options.phase); }
    if (options.intensity != null) { this.setIntensity(options.intensity); }
  },

  getPhase() {
    return this.phase;
  },
  setPhase(val) {
    this.phase = val;
  },

  getIntensity() {
    return this.intensity;
  },
  setIntensity(val) {
    this.intensity = val;
  },

  updateTweenAction(value, key) {
    switch (key) {
    case 'phase':
      this.setPhase(value);
      break;
    case 'intensity':
      this.setIntensity(value);
      break;
    default:
      BaseSprite.prototype.updateTweenAction.call(this, value, key);
      break;
    }
  },
});

FXCardShineSprite.WebGLRenderCmd = function (renderable) {
  BaseSprite.WebGLRenderCmd.call(this, renderable);
};
const proto = FXCardShineSprite.WebGLRenderCmd.prototype = Object.create(BaseSprite.WebGLRenderCmd.prototype);
proto.constructor = FXCardShineSprite.WebGLRenderCmd;

proto.rendering = function () {
  const node = this._node;
  if (!node._texture) return;

  this.updateMatricesForRender();

  const gl = cc._renderContext;
  const shaderProgram = this._shaderProgram;
  shaderProgram.use();
  shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);
  shaderProgram.setUniformLocationWith2f(shaderProgram.loc_texResolution, node._texture.getPixelsWide(), node._texture.getPixelsHigh());
  shaderProgram.setUniformLocationWith1f(shaderProgram.loc_phase, node.phase);
  shaderProgram.setUniformLocationWith1f(shaderProgram.loc_intensity, node.intensity);

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

FXCardShineSprite.create = function (options, sprite) {
  return BaseSprite.create.call(this, options, sprite || new FXCardShineSprite(options));
};

module.exports = FXCardShineSprite;
