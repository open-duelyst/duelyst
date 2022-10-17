const CONFIG = require('app/common/config');
const BaseSprite = require('../BaseSprite');

/** **************************************************************************
FXRipplingGlowImageMapSprite
 *************************************************************************** */

var FXRipplingGlowImageMapSprite = BaseSprite.extend({
  shaderKey: 'GlowImageMapRipple',

  autoZOrder: false,
  removeOnEnd: false,

  // uniforms
  timeScale: 0.05,
  intensity: 1.0,
  gamma: 1.0,
  levelsInWhite: 255.0,
  levelsInBlack: 0.0,
  glowColor: null,

  seed: null,

  ctor(options) {
    this._super(options);
    this.seed = Math.random() * 1000;
  },

  _createRenderCmd() {
    if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
      return this._super();
    }
    return new FXRipplingGlowImageMapSprite.WebGLRenderCmd(this);
  },

  setOptions(options) {
    this._super(options);
    if (options.timeScale != null) { this.setTimeScale(options.timeScale); }
    if (options.intensity != null) { this.setIntensity(options.intensity); }
    if (options.glowColor != null) { this.setGlowColor(options.glowColor); }
  },

  setTimeScale(timeScale) {
    this.timeScale = timeScale;
  },

  setIntensity(intensity) {
    this.intensity = intensity;
  },

  setGlowColor(glowColor) {
    this.glowColor = glowColor;
  },

  updateTweenAction(value, key) {
    switch (key) {
    case 'timeScale':
      this.setTimeScale(value);
      break;
    default:
      BaseSprite.prototype.updateTweenAction.call(this, value, key);
      break;
    }
  },
});

FXRipplingGlowImageMapSprite.WebGLRenderCmd = function (renderable) {
  BaseSprite.WebGLRenderCmd.call(this, renderable);
};
const proto = FXRipplingGlowImageMapSprite.WebGLRenderCmd.prototype = Object.create(BaseSprite.WebGLRenderCmd.prototype);
proto.constructor = FXRipplingGlowImageMapSprite.WebGLRenderCmd;

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

  // if (node.glowColor)
  //   shaderProgram.setUniformLocationWith3f(shaderProgram.loc_color, node.glowColor.r, node.glowColor.g, node.glowColor.b);

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

FXRipplingGlowImageMapSprite.create = function (options, sprite) {
  return BaseSprite.create.call(this, options, sprite || new FXRipplingGlowImageMapSprite(options));
};

module.exports = FXRipplingGlowImageMapSprite;
