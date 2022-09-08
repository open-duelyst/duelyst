const CompositePass = require('./CompositePass');
const RenderPass = require('../../fx/RenderPass');

/**
 * CompositeHorizontalPass - component used to composite horizontal shader effects into a BaseSprite (i.e. captures rendering input to texture and renders new output)
 * @see CompositePass
 */
const CompositeHorizontalPass = CompositePass.extend({

  // size of pass
  _fixedWidth: null,
  _width: 0,
  _fixedHeight: null,
  _height: 0,
  _fixedScale: null,
  _scale: 1,
  // whether to anti alias
  _fixedAntiAlias: null,
  _antiAlias: true,

  /* region GETTERS / SETTERS */

  setFixedWidth(val) {
    this._fixedWidth = val;
    this.setNeedsRebuild();
  },
  getFixedWidth() {
    return this._fixedWidth;
  },
  getWidth() {
    return this._width;
  },
  setFixedHeight(val) {
    this._fixedHeight = val;
    this.setNeedsRebuild();
  },
  getFixedHeight() {
    return this._fixedHeight;
  },
  getHeight() {
    return this._height;
  },
  setFixedScale(val) {
    this._fixedScale = val;
    this.setNeedsRebuild();
  },
  getFixedScale() {
    return this._fixedScale;
  },
  getScale() {
    return this._scale;
  },
  setFixedAntiAlias(val) {
    this._fixedAntiAlias = val;
    this.setNeedsRebuild();
  },
  getFixedAntiAlias() {
    return this._fixedAntiAlias;
  },
  getAntiAlias() {
    return this._antiAlias;
  },

  /* endregion GETTERS / SETTERS */

  /* region RENDER PASS */

  rebuild() {
    const node = this._node;
    let width;
    let height;
    let antiAlias;
    if (node) {
      const contentSize = node.getContentSize();
      width = contentSize.width;
      height = contentSize.height;
      antiAlias = node.getAntiAlias();
    } else {
      width = height = 0;
      antiAlias = true;
    }

    if (width <= 0 || height <= 0) {
      //
      this._width = width;
      this._height = height;
      this._scale = 1;
      this._antiAlias = antiAlias;
      if (this._renderPass != null) {
        this._renderPass.release();
        this._renderPass = null;
      }
    } else {
      this._super();

      this._width = this._fixedWidth != null ? this._fixedWidth : width;
      this._height = this._fixedHeight != null ? this._fixedHeight : height;
      this._scale = this._fixedScale != null ? this._fixedScale : 1;
      this._antiAlias = this._fixedAntiAlias != null ? this._fixedAntiAlias : antiAlias;
      if (this._renderPass != null) {
        this._renderPass.rebuild(cc.Texture2D.PIXEL_FORMAT_RGBA8888, this._width, this._height, this._scale, this._antiAlias);
      } else {
        this._renderPass = new RenderPass(cc.Texture2D.PIXEL_FORMAT_RGBA8888, this._width, this._height, this._scale, this._antiAlias);
      }
    }
  },

  release() {
    this.setNode(null);
    this.setShaderProgram(null);
    this.setShaderRenderCallback(null);
    if (this._renderPass != null) {
      this._renderPass.release();
      this._renderPass = null;
    }
  },

  /* endregion RENDER PASS */

  /* region RENDERING */

  getIsRenderable() {
    return this._renderPass != null;
  },

  _beginWhenRenderable(stackId) {
    this._super();

    this._renderPass.beginWithResetClear(stackId);
  },
  _endWhenRenderable(stackId) {
    this._renderPass.endWithReset(stackId);

    this._super();
  },
  _renderWhenRenderable() {
    this._super();

    // bind render pass texture
    cc.glBindTexture2DN(0, this._renderPass.getTexture());

    // render with render pass
    this._renderPass.render();
  },

  /* endregion RENDERING */

});

module.exports = CompositeHorizontalPass;
