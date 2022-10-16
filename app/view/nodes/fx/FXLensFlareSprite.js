// pragma PKGS: alwaysloaded

const RSX = require('app/data/resources');
const CONFIG = require('app/common/config');
const FXSprite = require('./FXSprite');

/** **************************************************************************
FXLensFlareSprite
var FXLensFlareSprite = FXProceduralDistortionSprite
FXLensFlareSprite.create(
 - procedural animated radial glow
 *************************************************************************** */

var FXLensFlareSprite = FXSprite.extend({
  // LensFlare or WispLensFlare
  shaderKey: 'WispLensFlare',

  autoZOrder: false,
  removeOnEnd: false,

  /* shader control params */
  pulseRate: 4.0,
  armLength: 0.3,
  _armLengthTarget: 0.3,
  wispSize: 0.05,
  _wispSizeTarget: 0.05,
  flareSize: 0.1,
  _flareSizeTarget: 0.1,
  // speed of the radial motion in the lens flare
  speed: 2.0,
  // ramp threshold to darken inner area
  rampThreshold: 0.01,
  // default to using noise
  spriteIdentifier: RSX.noise.img,

  _createRenderCmd() {
    if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
      return this._super();
    }
    return new FXLensFlareSprite.WebGLRenderCmd(this);
  },

  setOptions(options) {
    this._super(options);
    if (options.speed != null) { this.setSpeed(options.speed); }
    if (options.pulseRate != null) { this.setPulseRate(options.pulseRate); }
    if (options.armLength != null) { this.setArmLength(options.armLength); }
    if (options.wispSize != null) { this.setWispSize(options.wispSize); }
    if (options.flareSize != null) { this.setFlareSize(options.flareSize); }
    if (options.rampThreshold != null) { this.setRampThreshold(options.rampThreshold); }
  },

  setSpeed(speed) {
    this.speed = speed;
  },
  setPulseRate(pulseRate) {
    this.pulseRate = pulseRate;
  },
  setRampThreshold(rampThreshold) {
    this.rampThreshold = rampThreshold;
  },
  setArmLength(armLength) {
    this.armLength = this._armLengthTarget = armLength;
  },
  setWispSize(wispSize) {
    this.wispSize = this._wispSizeTarget = wispSize;
  },
  setFlareSize(flareSize) {
    this.flareSize = this._flareSizeTarget = flareSize;
  },

  updateTweenAction(value, key) {
    switch (key) {
    case 'armLength':
      this.armLength = this._armLengthTarget * value;
      break;
    case 'wispSize':
      this.wispSize = this._wispSizeTarget * value;
      break;
    case 'flareSize':
      this.flareSize = this._flareSizeTarget * value;
      break;
    default:
      FXSprite.prototype.updateTweenAction.call(this, value, key);
      break;
    }
  },
});

FXLensFlareSprite.WebGLRenderCmd = function (renderable) {
  FXSprite.WebGLRenderCmd.call(this, renderable);
};
const proto = FXLensFlareSprite.WebGLRenderCmd.prototype = Object.create(FXSprite.WebGLRenderCmd.prototype);
proto.constructor = FXLensFlareSprite.WebGLRenderCmd;

proto.rendering = function () {
  const node = this._node;
  if (!node._texture) return;

  this.updateMatricesForRender();

  const gl = cc._renderContext;
  const shaderProgram = this._shaderProgram;
  shaderProgram.use();
  shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);
  shaderProgram.setUniformLocationWith2f(shaderProgram.loc_texResolution, node._texture.getPixelsWide(), node._texture.getPixelsHigh());
  shaderProgram.setUniformLocationWith1f(shaderProgram.loc_time, node.getFX().getTime() * node.speed);

  if (shaderProgram.loc_rampThreshold) shaderProgram.setUniformLocationWith1f(shaderProgram.loc_rampThreshold, node.rampThreshold);
  if (shaderProgram.loc_pulseRate) shaderProgram.setUniformLocationWith1f(shaderProgram.loc_pulseRate, node.pulseRate);
  if (shaderProgram.loc_armLength) shaderProgram.setUniformLocationWith1f(shaderProgram.loc_armLength, node.armLength);
  if (shaderProgram.loc_wispSize) shaderProgram.setUniformLocationWith1f(shaderProgram.loc_wispSize, node.wispSize);
  if (shaderProgram.loc_flareSize) shaderProgram.setUniformLocationWith1f(shaderProgram.loc_flareSize, node.flareSize);

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

FXLensFlareSprite.create = function (options, sprite) {
  return FXSprite.create.call(this, options, sprite || new FXLensFlareSprite(options));
};

module.exports = FXLensFlareSprite;
