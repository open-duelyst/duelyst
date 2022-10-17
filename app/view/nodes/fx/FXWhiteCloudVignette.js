// pragma PKGS: alwaysloaded

const RSX = require('app/data/resources');
const CONFIG = require('app/common/config');
const FXSprite = require('./FXSprite');

/** **************************************************************************
FXWhiteCloudVignette
 *************************************************************************** */

var FXWhiteCloudVignette = FXSprite.extend({
  shaderKey: 'WhiteCloudVignette',

  antiAlias: true,
  autoZOrder: false,
  removeOnEnd: false,

  // uniforms
  timeScale: 5.0,
  vignetteAmount: 1.0,

  // default to using noise
  spriteIdentifier: RSX.noise.img,

  _createRenderCmd() {
    if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
      return this._super();
    }
    return new FXWhiteCloudVignette.WebGLRenderCmd(this);
  },

  setOptions(options) {
    this._super(options);
    if (options.timeScale != null) { this.setTimeScale(options.timeScale); }
    if (options.vignetteAmount != null) { this.setVignetteAmount(options.vignetteAmount); }
  },

  setVignetteAmount(vignetteAmount) {
    this.vignetteAmount = vignetteAmount;
  },

  setTimeScale(timeScale) {
    this.timeScale = timeScale;
  },

  updateTweenAction(value, key) {
    switch (key) {
    case 'timeScale':
      this.timeScale = value;
      break;
    case 'vignetteAmount':
      this.vignetteAmount = value;
      break;
    default:
      FXSprite.prototype.updateTweenAction.call(this, value, key);
      break;
    }
  },
});

FXWhiteCloudVignette.WebGLRenderCmd = function (renderable) {
  FXSprite.WebGLRenderCmd.call(this, renderable);
};
const proto = FXWhiteCloudVignette.WebGLRenderCmd.prototype = Object.create(FXSprite.WebGLRenderCmd.prototype);
proto.constructor = FXWhiteCloudVignette.WebGLRenderCmd;

proto.rendering = function () {
  const node = this._node;
  if (!node._texture) return;

  this.updateMatricesForRender();

  const gl = cc._renderContext;
  const shaderProgram = this._shaderProgram;
  shaderProgram.use();
  shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);
  shaderProgram.setUniformLocationWith2f(shaderProgram.loc_texResolution, node._texture.getPixelsWide(), node._texture.getPixelsHigh());
  shaderProgram.setUniformLocationWith1f(shaderProgram.loc_time, node.getFX().getTime());
  shaderProgram.setUniformLocationWith1f(shaderProgram.loc_vignetteAmount, node.vignetteAmount);
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

FXWhiteCloudVignette.create = function (options, sprite) {
  return FXSprite.create.call(this, options, sprite || new FXWhiteCloudVignette(options));
};

module.exports = FXWhiteCloudVignette;
