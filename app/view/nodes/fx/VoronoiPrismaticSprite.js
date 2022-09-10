const BaseSprite = require('../BaseSprite');

/** **************************************************************************
VoronoiPrismaticSprite
 - use sprite.setTextureRect(cc.rect(x, y, w, h)) to define the size of the sprite
 *************************************************************************** */

var VoronoiPrismaticSprite = BaseSprite.extend({
  shaderKey: 'VoronoiPrismatic',

  duration: 1.0,
  antiAlias: true,
  autoZOrder: false,

  // where in effect from 0.0 to 1.0
  phase: 0.0,

  _createRenderCmd() {
    if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
      return this._super();
    }
    return new VoronoiPrismaticSprite.WebGLRenderCmd(this);
  },

  setOptions(options) {
    this._super(options);
    if (options.phase != null) { this.setPhase(options.phase); }
  },

  setPhase(phase) {
    this.phase = phase || 0.0;
  },
  getPhase() {
    return this.phase;
  },

  updateTweenAction(value, key) {
    if (key === 'phase') {
      this.setPhase(value);
    } else {
      BaseSprite.prototype.updateTweenAction.call(this, value, key);
    }
  },
});

VoronoiPrismaticSprite.WebGLRenderCmd = function (renderable) {
  BaseSprite.WebGLRenderCmd.call(this, renderable);
};
const proto = VoronoiPrismaticSprite.WebGLRenderCmd.prototype = Object.create(BaseSprite.WebGLRenderCmd.prototype);
proto.constructor = VoronoiPrismaticSprite.WebGLRenderCmd;

proto.rendering = function () {
  const node = this._node;

  this.updateMatricesForRender();

  const gl = cc._renderContext;
  const shaderProgram = this._shaderProgram;
  shaderProgram.use();
  shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);
  shaderProgram.setUniformLocationWith1f(shaderProgram.loc_phase, node.getPhase());
  cc.glBlendFunc(cc.SRC_ALPHA, cc.ONE);

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

VoronoiPrismaticSprite.create = function (options, sprite) {
  return BaseSprite.create.call(this, options, sprite || new VoronoiPrismaticSprite(options));
};

module.exports = VoronoiPrismaticSprite;
