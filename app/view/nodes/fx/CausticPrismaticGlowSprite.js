const InstancedSprite = require('../InstancedSprite');

/** **************************************************************************
 CausticPrismaticGlowSprite
 var CausticPrismaticGlowSprite = InstancedSprite
 CausticPrismaticGlowSprite.create()
 - procedurally generated caustic prismatic glow sprite
 - this sprite is pooled, so that it may be reused with better performance
 - this sprite is instanced, so all instances of it will appear the same
 - use sprite.setTextureRect(cc.rect(x, y, w, h)) to define the size of the sprite
 *************************************************************************** */

var CausticPrismaticGlowSprite = InstancedSprite.extend({

  _instancingId: 'CausticPrismaticGlow',

  _createRenderCmd() {
    if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
      return InstancedSprite.prototype._createRenderCmd.call(this);
    }
    return new CausticPrismaticGlowSprite.WebGLRenderCmd(this);
  },
});

CausticPrismaticGlowSprite.WebGLRenderCmd = function (renderable) {
  InstancedSprite.WebGLRenderCmd.call(this, renderable);
};
const proto = CausticPrismaticGlowSprite.WebGLRenderCmd.prototype = Object.create(InstancedSprite.WebGLRenderCmd.prototype);
proto.constructor = CausticPrismaticGlowSprite.WebGLRenderCmd;

proto.renderingForInstancing = function (fx, instancingId, instancedRenderPass, instances) {
  // redirect drawing to render pass
  const renderPassStackId = 'CausticPrismaticGlow';
  instancedRenderPass.beginWithResetClear(renderPassStackId);

  // prepare board batch node for draw
  const shaderProgram = cc.shaderCache.getProgram('CausticPrismaticGlow');
  shaderProgram.use();
  shaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4();
  shaderProgram.setUniformLocationWith1f(shaderProgram.loc_time, fx.getTime());

  // separate blend function to account for rendering to offscreen texture
  gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE_MINUS_DST_ALPHA, gl.ONE);

  // render to pass
  instancedRenderPass.render();

  // stop redirecting drawing
  instancedRenderPass.endWithReset(renderPassStackId);
};

CausticPrismaticGlowSprite.create = function (options, node) {
  if (node == null) {
    node = cc.pool.getFromPool(CausticPrismaticGlowSprite, options) || new CausticPrismaticGlowSprite(options);
  }
  return node;
};

module.exports = CausticPrismaticGlowSprite;
