const CONFIG = require('app/common/config');
const FXSprite = require('./FXSprite');

/** **************************************************************************
FXFbmPolarFlareSprite
 - use sprite.setTextureRect(cc.rect(x, y, w, h)) to define the size of the sprite
 *************************************************************************** */

var FXFbmPolarFlareSprite = FXSprite.extend({
  shaderKey: 'FbmPolarFlare',

  antiAlias: true,
  autoZOrder: false,
  removeOnEnd: false,
  timeScale: 1.0,
  flareColor: cc.color(255, 191, 0),

  // uniforms
  phase: 0.0, // between 0.0 and 1.0

  _createRenderCmd() {
    if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
      return this._super();
    }
    return new FXFbmPolarFlareSprite.WebGLRenderCmd(this);
  },

  setDefaultOptions() {
    this._super();

    // procedural fx should usually have a scale of 1
    this.setScale(1.0);
  },

  setOptions(options) {
    this._super(options);
    if (options.phase != null) { this.phase = options.phase; }
    if (options.flareColor != null) { this.flareColor = options.flareColor; }
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

FXFbmPolarFlareSprite.WebGLRenderCmd = function (renderable) {
  FXSprite.WebGLRenderCmd.call(this, renderable);
};
const proto = FXFbmPolarFlareSprite.WebGLRenderCmd.prototype = Object.create(FXSprite.WebGLRenderCmd.prototype);
proto.constructor = FXFbmPolarFlareSprite.WebGLRenderCmd;

proto.rendering = function () {
  const node = this._node;

  this.updateMatricesForRender();

  const gl = cc._renderContext;
  const shaderProgram = this._shaderProgram;
  shaderProgram.use();
  shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);
  shaderProgram.setUniformLocationWith2f(shaderProgram.loc_size, node._rect.width, node._rect.height);
  shaderProgram.setUniformLocationWith1f(shaderProgram.loc_time, node.getFX().getTime() * node.timeScale);
  shaderProgram.setUniformLocationWith1f(shaderProgram.loc_phase, node.phase);
  shaderProgram.setUniformLocationWith3f(shaderProgram.loc_flareColor, node.flareColor.r / 255, node.flareColor.g / 255, node.flareColor.b / 255);
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

FXFbmPolarFlareSprite.create = function (options, sprite) {
  return FXSprite.create.call(this, options, sprite || new FXFbmPolarFlareSprite(options));
};

module.exports = FXFbmPolarFlareSprite;
