const BaseSpriteComponent = require('./BaseSpriteComponent');
const RenderPass = require('../../fx/RenderPass');

/**
 * CompositePass - abstract component used to add shader effects to a BaseSprite.
 * @param node
 * @param shaderProgram
 * @param shaderRenderCallback
 * @param beginCallback
 * @param endCallback
 */
const CompositePass = BaseSpriteComponent.extend({
  // shader program to use for rendering
  _shaderProgram: null,
  // callback when setting up shader for render, where the first argument is the shader
  _shaderRenderCallback: null,
  // callback when beginning effect
  _beginCallback: null,
  // callback when ending effect
  _endCallback: null,
  // whether this pass needs to be rebuilt before next render
  _needsRebuild: false,

  ctor(node, shaderProgram, shaderRenderCallback, beginCallback, endCallback) {
    this._super(node);
    this.setShaderProgram(shaderProgram);
    this.setShaderRenderCallback(shaderRenderCallback);
    this.setBeginCallback(beginCallback);
    this.setEndCallback(endCallback);
  },

  /* region GETTERS / SETTERS */

  setNode(val) {
    this._super(val);
    this.setNeedsRebuild();
  },
  setShaderProgram(val) {
    this._shaderProgram = val;
  },
  getShaderProgram() {
    return this._shaderProgram;
  },
  setShaderRenderCallback(val) {
    this._shaderRenderCallback = val;
  },
  getShaderRenderCallback() {
    return this._shaderRenderCallback;
  },
  setBeginCallback(val) {
    this._beginCallback = val;
  },
  getBeginCallback() {
    return this._beginCallback;
  },
  setEndCallback(val) {
    this._endCallback = val;
  },
  getEndCallback() {
    return this._endCallback;
  },
  setNeedsRebuild() {
    this._needsRebuild = true;
  },
  getNeedsRebuild() {
    return this._needsRebuild;
  },

  /* endregion GETTERS / SETTERS */

  /* region RENDER PASS */

  rebuild() {
    this._needsRebuild = false;
  },

  /* endregion RENDER PASS */

  /* region RENDERING */

  getIsRenderable() {
    return this._renderPass != null;
  },

  begin() {
    if (this._needsRebuild) {
      this.rebuild();
    }

    if (this.getIsRenderable()) {
      this._beginWhenRenderable.apply(this, arguments);
    }
  },
  _beginWhenRenderable() {
    if (_.isFunction(this._beginCallback)) {
      this._beginCallback();
    }
  },
  end() {
    if (this.getIsRenderable()) {
      this._endWhenRenderable.apply(this, arguments);
    }
  },
  _endWhenRenderable() {
    if (_.isFunction(this._endCallback)) {
      this._endCallback();
    }
  },
  render() {
    if (this.getIsRenderable()) {
      this._renderWhenRenderable.apply(this, arguments);
    }
  },
  _renderWhenRenderable() {
    // get shader
    const shaderProgram = this._shaderProgram;
    shaderProgram.use();

    // setup for render with shader render callback
    this._shaderRenderCallback(shaderProgram);
  },

  /* endregion RENDERING */

});

module.exports = CompositePass;
