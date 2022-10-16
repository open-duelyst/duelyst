const CONFIG = require('app/common/config');
const BaseSprite = require('../BaseSprite');

/** **************************************************************************
FXTimerSprite
 - procedurally generated timer sprite
 - use sprite.setTextureRect(cc.rect(x, y, w, h)) to define the size of the sprite
 *************************************************************************** */

var FXTimerSprite = BaseSprite.extend({
  shaderKey: 'Timer',

  // progress of timer between 0 and 1
  progress: 0.0,
  _targetProgress: 0.0,
  // starting angle for timer (defaults to top middle)
  startingAngle: -Math.PI * 0.5,
  // smoothness of timer edge (default is hard edge)
  edgeGradientFactor: 0.0,
  // color and opacity of background
  bgColor: cc.color(0.0, 0.0, 0.0),
  bgOpacity: 0.0,

  _createRenderCmd() {
    if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
      return this._super();
    }
    return new FXTimerSprite.WebGLRenderCmd(this);
  },

  setOptions(options) {
    this._super(options);
    if (options.progress != null) { this.setProgress(options.progress); }
    if (options.startingAngle != null) { this.setStartingAngle(options.startingAngle); }
    if (options.edgeGradientFactor != null) { this.setEdgeGradientFactor(options.edgeGradientFactor); }
    if (options.bgColor != null) { this.setBGColor(options.bgColor); }
    if (options.bgOpacity != null) { this.setBGOpacity(options.bgOpacity); }
  },

  setProgress(val) {
    if (this._targetProgress !== val) {
      this.stopActionByTag(CONFIG.ANIM_TAG);
      this.progress = this._targetProgress = val;
    }
  },

  getProgress(val) {
    return this._targetProgress;
  },

  animateProgress(duration, progress) {
    if (this._targetProgress !== progress) {
      if (typeof duration === 'number') {
        this._targetProgress = progress;
        this.stopActionByTag(CONFIG.ANIM_TAG);
        const progressAction = cc.actionTween(duration, 'progress', this.progress, this._targetProgress);
        progressAction.setTag(CONFIG.ANIM_TAG);
        this.runAction(progressAction);
      } else {
        this.setProgress(progress);
      }
    }
  },

  setStartingAngle(val) {
    this.startingAngle = val;
  },

  setEdgeGradientFactor(val) {
    this.edgeGradientFactor = val;
  },

  setBGColor(color) {
    this.bgColor.r = color.r;
    this.bgColor.g = color.g;
    this.bgColor.b = color.b;
  },

  setBGOpacity(val) {
    this.bgOpacity = val;
  },

  updateTweenAction(value, key) {
    switch (key) {
    case 'progress':
      this.progress = value;
      break;
    default:
      BaseSprite.prototype.updateTweenAction.call(this, value, key);
      break;
    }
  },
});

FXTimerSprite.WebGLRenderCmd = function (renderable) {
  BaseSprite.WebGLRenderCmd.call(this, renderable);
};
const proto = FXTimerSprite.WebGLRenderCmd.prototype = Object.create(BaseSprite.WebGLRenderCmd.prototype);
proto.constructor = FXTimerSprite.WebGLRenderCmd;

proto.rendering = function () {
  const node = this._node;

  this.updateMatricesForRender();

  const gl = cc._renderContext;
  const shaderProgram = this._shaderProgram;
  shaderProgram.use();
  shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);
  shaderProgram.setUniformLocationWith1f(shaderProgram.loc_progress, node.progress);
  shaderProgram.setUniformLocationWith1f(shaderProgram.loc_startingAngle, node.startingAngle);
  shaderProgram.setUniformLocationWith1f(shaderProgram.loc_edgeGradientFactor, node.edgeGradientFactor);
  const { bgColor } = node;
  shaderProgram.setUniformLocationWith4f(shaderProgram.loc_bgColor, bgColor.r / 255.0, bgColor.g / 255.0, bgColor.b / 255.0, node.bgOpacity / 255.0);
  shaderProgram.setUniformLocationWith2f(shaderProgram.loc_texResolution, node._contentSize.width * node._scaleX, node._contentSize.height * node._scaleY);

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

FXTimerSprite.create = function (options, sprite) {
  return BaseSprite.create.call(this, options, sprite || new FXTimerSprite(options));
};

module.exports = FXTimerSprite;
