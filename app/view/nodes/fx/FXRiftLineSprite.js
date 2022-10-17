// pragma PKGS: alwaysloaded

const RSX = require('app/data/resources');
const CONFIG = require('app/common/config');
const FXSprite = require('./FXSprite');

/** **************************************************************************
FXRiftLineSprite
 *************************************************************************** */

var FXRiftLineSprite = FXSprite.extend({
  shaderKey: 'RiftLine',

  antiAlias: true,
  autoZOrder: false,
  removeOnEnd: false,

  // uniforms
  timeScale: 5.0,
  progress: 0.0,

  // default to using noise
  spriteIdentifier: RSX.noise.img,

  _createRenderCmd() {
    if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
      return this._super();
    }
    return new FXRiftLineSprite.WebGLRenderCmd(this);
  },

  setOptions(options) {
    this._super(options);
    if (options.timeScale != null) { this.setTimeScale(options.timeScale); }
  },

  setTimeScale(timeScale) {
    this.timeScale = this._timeScaleTarget = timeScale;
  },

  setProgress(value) {
    this.progress = value;
  },

  updateTweenAction(value, key) {
    switch (key) {
    case 'timeScale':
      this.timeScale = this._timeScaleTarget * value;
      break;
    case 'progress':
      this.progress = value;
      break;
    default:
      FXSprite.prototype.updateTweenAction.call(this, value, key);
      break;
    }
  },
});

FXRiftLineSprite.WebGLRenderCmd = function (renderable) {
  FXSprite.WebGLRenderCmd.call(this, renderable);
};
const proto = FXRiftLineSprite.WebGLRenderCmd.prototype = Object.create(FXSprite.WebGLRenderCmd.prototype);
proto.constructor = FXRiftLineSprite.WebGLRenderCmd;

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
  shaderProgram.setUniformLocationWith1f(shaderProgram.loc_progress, node.progress);
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

FXRiftLineSprite.create = function (options, sprite) {
  return FXSprite.create.call(this, options, sprite || new FXRiftLineSprite(options));
};

module.exports = FXRiftLineSprite;
