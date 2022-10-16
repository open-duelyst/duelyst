const BaseSprite = require('../BaseSprite');

/** **************************************************************************
LensNoiseSprite
 *************************************************************************** */

var LensNoiseSprite = BaseSprite.extend({

  _flareAmount: 1.0,

  _createRenderCmd() {
    if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
      return this._super();
    }
    return new LensNoiseSprite.WebGLRenderCmd(this);
  },

  setOptions(options) {
    this._super(options);
    if (options.flareAmount != null) { this._flareAmount = options.flareAmount; }
  },

  setFlareAmount(val) {
    this._flareAmount = val;
  },

  getFlareAmount() {
    return this._flareAmount;
  },

  updateTweenAction(value, key) {
    switch (key) {
    case 'flareAmount':
      this._flareAmount = value;
      break;
    default:
      BaseSprite.prototype.updateTweenAction.call(this, value, key);
      break;
    }
  },
});

LensNoiseSprite.WebGLRenderCmd = function (renderable) {
  BaseSprite.WebGLRenderCmd.call(this, renderable);
};
const proto = LensNoiseSprite.WebGLRenderCmd.prototype = Object.create(BaseSprite.WebGLRenderCmd.prototype);
proto.constructor = LensNoiseSprite.WebGLRenderCmd;

proto.rendering = function () {
  const node = this._node;
  if (!node._texture) return;

  this.updateMatricesForRender();

  const gl = cc._renderContext;
  const shaderProgram = cc.shaderCache.programForKey('LensNoise');
  shaderProgram.use();
  shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);
  shaderProgram.setUniformLocationWith2f(shaderProgram.loc_texResolution, node._texture.getPixelsWide(), node._texture.getPixelsHigh());
  shaderProgram.setUniformLocationWith1f(shaderProgram.loc_time, node.getFX().getTime());
  shaderProgram.setUniformLocationWith1f(shaderProgram.loc_flareAmount, node.getFlareAmount());
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

LensNoiseSprite.create = function (options, sprite) {
  return BaseSprite.create.call(this, options, sprite || new LensNoiseSprite(options));
};

module.exports = LensNoiseSprite;
