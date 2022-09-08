const BaseLayer = require('./BaseLayer');

/** **************************************************************************
 ShadowCastingLayer
 - this layer will draw ALL shadows in the scene at once (for performance reasons)
 - there should only be ONE shadow casting layer in a scene
 *************************************************************************** */

var ShadowCastingLayer = BaseLayer.extend({

  _createRenderCmd() {
    if (cc._renderType === cc._RENDER_TYPE_CANVAS) return this._super();

    return new ShadowCastingLayer.WebGLRenderCmd(this);
  },

});

ShadowCastingLayer.WebGLRenderCmd = function (renderable) {
  cc.Layer.WebGLRenderCmd.call(this, renderable);
  // we won't actually draw this layer
  // but we need to flag it as needing draw
  // so that the renderer calls its rendering method
  this._needDraw = true;
};
const proto = ShadowCastingLayer.WebGLRenderCmd.prototype = Object.create(cc.Layer.WebGLRenderCmd.prototype);
proto.constructor = ShadowCastingLayer.WebGLRenderCmd;

proto.rendering = function (ctx) {
  this.renderingShadows();
};

proto.renderingShadows = function () {
  const node = this._node;
  const shadowCasters = node.getFX().getShadowCasters();
  for (let i = 0, il = shadowCasters.length; i < il; i++) {
    const shadowCaster = shadowCasters[i];
    const renderCmd = shadowCaster._renderCmd;
    renderCmd.drawShadows();
  }
};

ShadowCastingLayer.create = function (layer) {
  return layer || new ShadowCastingLayer();
};

module.exports = ShadowCastingLayer;
