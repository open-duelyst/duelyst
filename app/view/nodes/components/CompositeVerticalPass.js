const CompositePass = require('./CompositePass');

/**
 * CompositeVerticalPass - component used to composite vertical shader effects into a BaseSprite (i.e. renders from a texture)
 * @see CompositePass
 */
const CompositeVerticalPass = CompositePass.extend({

  /* region RENDERING */

  _renderWhenRenderable(texture) {
    const node = this._node;
    const renderCmd = node._renderCmd;

    this._super();

    // bind render pass texture
    cc.glBindTexture2DN(0, texture);

    // bind quad buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, renderCmd._quadWebBuffer);
    if (renderCmd._quadDirty) {
      renderCmd._quadDirty = false;
      gl.bufferData(gl.ARRAY_BUFFER, renderCmd._quad.arrayBuffer, gl.DYNAMIC_DRAW);
    }

    // vertex attributes
    cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);
    gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12);
    gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 24, 16);

    // draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  },

  /* endregion RENDERING */

});

module.exports = CompositeVerticalPass;
