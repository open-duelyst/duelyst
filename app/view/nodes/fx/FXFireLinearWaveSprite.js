// pragma PKGS: alwaysloaded

const RSX = require('app/data/resources');
const CONFIG = require('app/common/config');
const FXSprite = require('./FXSprite');

/** **************************************************************************
FXFireLinearWaveSprite
 - use sprite.setTextureRect(cc.rect(x, y, w, h)) to define the size of the sprite
 *************************************************************************** */

var FXFireLinearWaveSprite = FXSprite.extend({
  shaderKey: 'FireLinearWave',

  antiAlias: true,
  autoZOrder: false,
  removeOnEnd: false,

  // uniforms
  phase: 0.0, // between 0.0 and 1.0

  // default to using noise
  spriteIdentifier: RSX.noise.img,

  _createRenderCmd() {
    if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
      return this._super();
    }
    return new FXFireLinearWaveSprite.WebGLRenderCmd(this);
  },

  setOptions(options) {
    this._super(options);
    if (options.phase != null) { this.setPhase(options.phase); }
  },

  setPhase(phase) {
    this.phase = phase;
  },

  updateTweenAction(value, key) {
    switch (key) {
    case 'phase':
      this.phase = value;
      break;
    default:
      FXSprite.prototype.updateTweenAction.call(this, value, key);
      break;
    }
  },
});

FXFireLinearWaveSprite.WebGLRenderCmd = function (renderable) {
  FXSprite.WebGLRenderCmd.call(this, renderable);
};
const proto = FXFireLinearWaveSprite.WebGLRenderCmd.prototype = Object.create(FXSprite.WebGLRenderCmd.prototype);
proto.constructor = FXFireLinearWaveSprite.WebGLRenderCmd;

proto.rendering = function () {
  const node = this._node;
  if (!node._texture) return;

  this.updateMatricesForRender();

  const gl = cc._renderContext;
  const shaderProgram = this._shaderProgram;
  shaderProgram.use();
  shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);
  shaderProgram.setUniformLocationWith1f(shaderProgram.loc_time, node.getFX().getTime());
  shaderProgram.setUniformLocationWith1f(shaderProgram.loc_phase, node.phase); // node.getFX().getTime()
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

FXFireLinearWaveSprite.create = function (options, sprite) {
  return FXSprite.create.call(this, options, sprite || new FXFireLinearWaveSprite(options));
};

module.exports = FXFireLinearWaveSprite;
