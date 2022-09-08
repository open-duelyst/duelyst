const CONFIG = require('app/common/config');
const UtilsEngine = require('app/common/utils/utils_engine');
const RenderPass = require('app/view/fx/RenderPass');
const _ = require('underscore');

/** **************************************************************************
 Rendering injections.
 *************************************************************************** */

const RenderingInjections = {};

// fix director's 3D projection z-eye calculation
// cocos2d has incorrectly set it to: window height / 1.1566
// when the correct calculation is: window height / 2 / tan( pi / 6 )
cc.Director.prototype.getZEye = function () {
  return this._winSizeInPoints.height / 2.0 / Math.tan(Math.PI / 6.0);
};

// clear to background color
cc.Director.prototype._clear = function () {
  const gl = cc._renderContext;
  let r; let g; let b; let
    a;
  if (CONFIG.BACKGROUND_COLOR != null) {
    r = (CONFIG.BACKGROUND_COLOR.r || 0) / 255.0;
    g = (CONFIG.BACKGROUND_COLOR.g || 0) / 255.0;
    b = (CONFIG.BACKGROUND_COLOR.b || 0) / 255.0;
    a = (CONFIG.BACKGROUND_COLOR.a || 0) / 255.0;
  } else {
    r = g = b = 0.0;
    a = 1.0;
  }
  gl.clearColor(r, g, b, a);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};

cc.rendererWebGL.rendering = function (ctx) {
  const scene = cc.director.getRunningScene();
  if (scene != null) {
    // redirect drawing of screen
    const fx = scene.getFX();
    fx.beginWithClear();

    const renderCmds = this._renderCmds;
    if (ctx == null) { ctx = cc._renderContext; }
    for (let i = 0, len = renderCmds.length; i < len; i++) {
      const renderCmd = renderCmds[i];
      renderCmd.rendering(ctx);
    }

    // composite screen
    fx.endWithComposite();
  }
};

cc.rendererWebGL._renderingToBuffer = function (renderTextureId) {
  renderTextureId = renderTextureId || this._currentID;
  const renderCmds = this._cacheToBufferCmds[renderTextureId];
  const ctx = cc._renderContext; const
    locIDs = this._cacheInstanceIds;

  // render all commands redirected to buffer
  for (let i = 0, len = renderCmds.length; i < len; i++) {
    const renderCmd = renderCmds[i];
    renderCmd.rendering(ctx);
  }

  // cleanup commands for buffer
  renderCmds.length = 0;
  delete this._cacheToBufferCmds[renderTextureId];
  cc.arrayRemoveObject(locIDs, renderTextureId);

  // update redirect state
  if (locIDs.length === 0) this._isCacheToBufferOn = false;
  else this._currentID = locIDs[locIDs.length - 1];
};

// don't update texture aliasing unless different
cc.Texture2D.prototype._antiAliased = true;
cc.Texture2D.prototype._super_setAntiAliasTexParameters = cc.Texture2D.prototype.setAntiAliasTexParameters;
cc.Texture2D.prototype.setAntiAliasTexParameters = function () {
  if (!this._antiAliased) {
    this._antiAliased = true;
    cc.Texture2D.prototype._super_setAntiAliasTexParameters.call(this);
  }
};
cc.Texture2D.prototype._super_setAliasTexParameters = cc.Texture2D.prototype.setAliasTexParameters;
cc.Texture2D.prototype.setAliasTexParameters = function () {
  if (this._antiAliased) {
    this._antiAliased = false;
    cc.Texture2D.prototype._super_setAliasTexParameters.call(this);
  }
};

cc.Texture2D.prototype.setAliasTexParametersWhenSafeScale = function () {
  if ((CONFIG.globalScale * CONFIG.resourceScaleEngine) % 0.5 === 0.0) {
    // textures are usually safe to alias at resource scales that are a multiple of 0.5
    this.setAliasTexParameters();
  }
};

// node _syncDisplayOpacity doesn't cascade by default, which causes opacity/display issues
// node _updateDisplayOpacity is functionally the same but does cascade, so we'll replace sync with update
cc.Node.WebGLRenderCmd.prototype._syncDisplayOpacity = cc.Node.WebGLRenderCmd.prototype._updateDisplayOpacity;

/**
 * Whether node uses perspective projection for transforms. Defaults to false as most nodes only use orthographic projection.
 * @type {boolean}
 */
cc.Node.prototype.usesPerspectiveProjection = !CONFIG.DYNAMIC_PROJECTION;

/**
 * Returns whether node uses perspective projection for transforms.
 * @returns {Boolean}
 */
cc.Node.prototype.getUsesPerspectiveProjection = function () {
  return this.usesPerspectiveProjection;
};

/**
 * Whether node needs perspective projection during rendering phase.
 * - when true, during visit phase the stack matrix will be swapped to perspective mode
 * - when true, during rendering phase the projection matrix will be swapped to perspective mode
 * - otherwise, stack and projection matrices will swapped to orthographic mode
 * - by default nodes with 3D (XYZ) rotation will automatically set this flag to true
 * @type {boolean}
 * @private
 */
cc.Node.RenderCmd.prototype._needsPerspectiveProjection = false;

/**
 * Returns cached calculation of whether this node needs perspective projection, including whether parent needs perspective projection.
 * NOTE: always use this method to check perspective projection from external code
 */
cc.Node.WebGLRenderCmd.prototype.getNeedsPerspectiveProjection = function () {
  return this._needsPerspectiveProjection;
};

/**
 * Returns immediate calculation of whether this node needs perspective projection, NOT including whether parent needs perspective projection.
 * NOTE: override this method to force perspective projection based on render command state
 */
cc.Node.WebGLRenderCmd.prototype.getNeedsPerspectiveProjectionForCache = function () {
  return this._node.getUsesPerspectiveProjection() || this.getNeedsXYZRotation();
};

cc.Node.WebGLRenderCmd.prototype._projMatrix = null;
/**
 * Pushes the node's projection matrix onto the top of the stack. Call this before rendering the node.
 */
cc.Node.WebGLRenderCmd.prototype.updateMatricesForRender = function () {
  // ensure positions are set to integer values when possible to fix rendering artifacts caused by sub-pixel positions
  if (!this.getNeedsSubPixelPosition()) {
    const stackMat4 = this._stackMatrix.mat;
    stackMat4[12] = Math.round(stackMat4[12]);
    stackMat4[13] = Math.round(stackMat4[13]);
  }

  // push projection matrix to top of stack
  cc.projection_matrix_stack.stack.push(cc.projection_matrix_stack.top);
  cc.projection_matrix_stack.top = this._projMatrix;
};
/**
 * Pops this node's projection matrix from the stack. Call this after rendering the node.
 */
cc.Node.WebGLRenderCmd.prototype.updateMatricesAfterRender = function () {
  cc.projection_matrix_stack.top = cc.projection_matrix_stack.stack.pop();
};

// override updateTransform (only called for batched nodes) to fix rendering artifacts caused by sub-pixel positions
cc.Sprite.WebGLRenderCmd.prototype.updateTransform = function () {
  const node = this._node;

  // recalculate matrix only if it is dirty
  if (this._dirty) {
    const locQuad = this._quad; const
      locParent = node._parent;
    // If it is not visible, or one of its ancestors is not visible, then do nothing:
    if (!node._visible || (locParent && locParent != node._batchNode && locParent._shouldBeHidden)) {
      locQuad.br.vertices = locQuad.tl.vertices = locQuad.tr.vertices = locQuad.bl.vertices = { x: 0, y: 0, z: 0 };
      node._shouldBeHidden = true;
    } else {
      node._shouldBeHidden = false;
      if (this._dirtyFlag !== 0) { // because changing color and opacity uses dirty flag at visit, but visit doesn't call at batching.
        this.updateStatus();
        this._dirtyFlag = 0;
      }

      if (!locParent || locParent == node._batchNode) {
        node._transformToBatch = this.getNodeToParentTransform();
      } else {
        node._transformToBatch = cc.affineTransformConcat(this.getNodeToParentTransform(), locParent._transformToBatch);
      }

      //
      // calculate the Quad based on the Affine Matrix
      //
      const locTransformToBatch = node._transformToBatch;
      const rect = node._rect;
      const x1 = node._offsetPosition.x;
      const y1 = node._offsetPosition.y;
      const x2 = x1 + rect.width;
      const y2 = y1 + rect.height;
      const x = locTransformToBatch.tx;
      const y = locTransformToBatch.ty;

      const cr = locTransformToBatch.a;
      const sr = locTransformToBatch.b;
      const cr2 = locTransformToBatch.d;
      const sr2 = -locTransformToBatch.c;
      let ax = x1 * cr - y1 * sr2 + x;
      let ay = x1 * sr + y1 * cr2 + y;

      let bx = x2 * cr - y1 * sr2 + x;
      let by = x2 * sr + y1 * cr2 + y;

      let cx = x2 * cr - y2 * sr2 + x;
      let cy = x2 * sr + y2 * cr2 + y;

      let dx = x1 * cr - y2 * sr2 + x;
      let dy = x1 * sr + y2 * cr2 + y;

      const locVertexZ = node._vertexZ;

      // ensure positions are set to integer values when possible to fix rendering artifacts caused by sub-pixel positions
      if (!this.getNeedsSubPixelPosition()) { // || !cc.SPRITEBATCHNODE_RENDER_SUBPIXEL) {
        ax = Math.round(ax);
        ay = Math.round(ay);
        bx = Math.round(bx);
        by = Math.round(by);
        cx = Math.round(cx);
        cy = Math.round(cy);
        dx = Math.round(dx);
        dy = Math.round(dy);
      }
      locQuad.bl.vertices = { x: ax, y: ay, z: locVertexZ };
      locQuad.br.vertices = { x: bx, y: by, z: locVertexZ };
      locQuad.tl.vertices = { x: dx, y: dy, z: locVertexZ };
      locQuad.tr.vertices = { x: cx, y: cy, z: locVertexZ };
    }
    node.textureAtlas.updateQuad(locQuad, node.atlasIndex);
    node._recursiveDirty = false;
    this._dirty = false;
  }

  // recursively iterate over children
  if (node._hasChildren) node._arrayMakeObjectsPerformSelector(node._children, cc.Node._stateCallbackType.updateTransform);
};

/**
 * Whether node should use sub pixel positioning.
 */
cc.Node.prototype.usesSubPixelPosition = false;

/**
 * Sets whether node uses sub pixel positioning.
 * @param {Boolean} val
 */
cc.Node.prototype.setUsesSubPixelPosition = function (val) {
  if (this.usesSubPixelPosition != val) {
    this.usesSubPixelPosition = val;
    this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty);
  }
};

/**
 * Returns whether node should use sub pixel positioning.
 * @returns {Boolean}
 */
cc.Node.prototype.getUsesSubPixelPosition = function () {
  return this.usesSubPixelPosition;
};

/**
 * Whether an action targeting this node uses sub pixel positioning.
 */
cc.Node.prototype.actionsUsingSubPixelPosition = 0;

/**
 * Adds a count to the actions targeting this node that use sub pixel positioning.
 */
cc.Node.prototype.addActionUsingSubPixelPosition = function () {
  this.setActionsUsingSubPixelPosition(this.actionsUsingSubPixelPosition + 1);
};

/**
 * Removes a count to the actions targeting this node that use sub pixel positioning.
 */
cc.Node.prototype.removeActionUsingSubPixelPosition = function () {
  this.setActionsUsingSubPixelPosition(this.actionsUsingSubPixelPosition - 1);
};

/**
 * Sets whether an action targeting this node uses sub pixel positioning.
 * @param {Boolean} val
 */
cc.Node.prototype.setActionsUsingSubPixelPosition = function (val) {
  if (this.actionsUsingSubPixelPosition != val) {
    const lastVal = this.actionsUsingSubPixelPosition;
    this.actionsUsingSubPixelPosition = Math.max(0, val);
    if ((lastVal === 0 && this.actionsUsingSubPixelPosition === 1) || (lastVal === 1 && this.actionsUsingSubPixelPosition === 0)) {
      this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty);
    }
  }
};

/**
 * Returns whether an action targeting this node uses sub pixel positioning.
 * @returns {Boolean}
 */
cc.Node.prototype.getActionsUsingSubPixelPosition = function () {
  return this.actionsUsingSubPixelPosition > 0;
};

cc.MoveBy.prototype.activate = function () {
  cc.ActionInterval.prototype.activate.call(this);
  this.target.addActionUsingSubPixelPosition();
};
cc.MoveBy.prototype.deactivate = function () {
  cc.ActionInterval.prototype.deactivate.call(this);
  this.target.removeActionUsingSubPixelPosition();
};
cc.ScaleTo.prototype.activate = function () {
  cc.ActionInterval.prototype.activate.call(this);
  this.target.addActionUsingSubPixelPosition();
};
cc.ScaleTo.prototype.deactivate = function () {
  cc.ActionInterval.prototype.deactivate.call(this);
  this.target.removeActionUsingSubPixelPosition();
};
cc.RotateBy.prototype.activate = function () {
  cc.ActionInterval.prototype.activate.call(this);
  this.target.addActionUsingSubPixelPosition();
};
cc.RotateBy.prototype.deactivate = function () {
  cc.ActionInterval.prototype.deactivate.call(this);
  this.target.removeActionUsingSubPixelPosition();
};
cc.RotateTo.prototype.activate = function () {
  cc.ActionInterval.prototype.activate.call(this);
  this.target.addActionUsingSubPixelPosition();
};
cc.RotateTo.prototype.deactivate = function () {
  cc.ActionInterval.prototype.deactivate.call(this);
  this.target.removeActionUsingSubPixelPosition();
};
cc.BezierBy.prototype.activate = function () {
  cc.ActionInterval.prototype.activate.call(this);
  this.target.addActionUsingSubPixelPosition();
};
cc.BezierBy.prototype.deactivate = function () {
  cc.ActionInterval.prototype.deactivate.call(this);
  this.target.removeActionUsingSubPixelPosition();
};

/**
 * Whether node needs sub pixel positioning.
 * @type {boolean}
 * @private
 */
cc.Node.WebGLRenderCmd.prototype._needsSubPixelPosition = false;

/**
 * Returns cached calculation of whether this node needs sub pixel positioning, including whether parent needs sub pixel positioning.
 * NOTE: always use this method to check sub pixel positioning from external code
 */
cc.Node.WebGLRenderCmd.prototype.getNeedsSubPixelPosition = function () {
  return this._needsSubPixelPosition;
};

/**
 * Returns immediate calculation of whether this node needs sub pixel positioning, NOT including whether parent needs sub pixel positioning.
 * NOTE: override this method to force sub pixel positioning based on render command state
 */
cc.Node.WebGLRenderCmd.prototype.getNeedsSubPixelPositionForCache = function () {
  return this._node.getUsesSubPixelPosition() || this._node.getActionsUsingSubPixelPosition() || this.getNeedsXYZRotation();
};

cc.Node.WebGLRenderCmd.prototype.transform = function (parentCmd, recursive) {
  const transformDirty = this._dirtyFlag & cc.Node._dirtyFlags.transformDirty;
  const t4x4 = this._transform4x4; const stackMatrix = this._stackMatrix; const
    node = this._node;
  parentCmd = parentCmd || this.getParentRenderCmd();

  // update node to parent transform
  const trans = this.getNodeToParentTransform();

  // get whether needs perspective projection
  const renderingToBuffer = cc.rendererWebGL._isCacheToBufferOn;
  const parentNeedsPerspectiveProjection = parentCmd != null && _.isFunction(parentCmd.getNeedsPerspectiveProjection) ? parentCmd.getNeedsPerspectiveProjection() : (!renderingToBuffer && !CONFIG.DYNAMIC_PROJECTION);
  this._needsPerspectiveProjection = parentNeedsPerspectiveProjection || this.getNeedsPerspectiveProjectionForCache();

  const parentNeedsSubPixelPosition = parentCmd != null && _.isFunction(parentCmd.getNeedsSubPixelPosition) ? parentCmd.getNeedsSubPixelPosition() : cc.Node.prototype.usesSubPixelPosition;
  this._needsSubPixelPosition = parentNeedsSubPixelPosition || this.getNeedsSubPixelPositionForCache();

  // get projection matrix
  // use render pass projection matrix if visiting this node:
  // - after cc.RenderTexture has called begin
  // - after RenderPass has called beginWithResetClear
  // set whether this node needs perspective projection
  if (this._needsPerspectiveProjection) {
    if (renderingToBuffer) {
      var renderPass = RenderPass.get_top_of_reset_stack();
      if (renderPass) {
        this._projMatrix = renderPass._perspectiveProjMatrix;
      } else {
        this._projMatrix = cc.projection_matrix_stack.top;
      }
    } else {
      this._projMatrix = UtilsEngine.MAT4_PERSPECTIVE_PROJECTION;
    }
  } else if (renderingToBuffer) {
    var renderPass = RenderPass.get_top_of_reset_stack();
    if (renderPass) {
      this._projMatrix = renderPass._projMatrix;
    } else {
      this._projMatrix = cc.projection_matrix_stack.top;
    }
  } else {
    this._projMatrix = UtilsEngine.MAT4_ORTHOGRAPHIC_PROJECTION;
  }

  // get parent matrix
  let parentMatrix;
  if (parentCmd != null && parentCmd._stackMatrix != null) {
    parentMatrix = parentCmd._stackMatrix;
  } else if (renderingToBuffer) {
    var renderPass = RenderPass.get_top_of_reset_stack();
    if (renderPass) {
      parentMatrix = renderPass._stackMatrix;
    } else {
      parentMatrix = cc.modelview_matrix_stack.top;
    }
  } else if (CONFIG.DYNAMIC_PROJECTION) {
    parentMatrix = UtilsEngine.MAT4_ORTHOGRAPHIC_STACK_SCALED;
  } else {
    parentMatrix = UtilsEngine.MAT4_PERSPECTIVE_STACK_SCALED;
  }

  // if this is the first node in the stack that needs perspective
  // multiply the perspective stack matrix into the parent matrix
  if (this._needsPerspectiveProjection && !parentNeedsPerspectiveProjection) {
    if (renderingToBuffer) {
      var renderPass = RenderPass.get_top_of_reset_stack();
      if (renderPass) {
        parentMatrix = cc.kmMat4Multiply(new cc.kmMat4(), renderPass._perspectiveStackMatrix, parentMatrix);
      }
    } else {
      parentMatrix = cc.kmMat4Multiply(new cc.kmMat4(), UtilsEngine.MAT4_PERSPECTIVE_STACK, parentMatrix);
    }
  }

  // cocos normally resets transform dirty flags here
  // but if we do that, child nodes don't know that their parent updated the transform
  // it seems to make more sense to reset these flags after doing the transforms in node.getNodeToParentTransform
  // but doing that really makes a mess, and the node.transform method is only called during node.visit
  // and node.visit resets all flags at the end of the method
  // this._dirtyFlag = this._dirtyFlag & cc.Node._dirtyFlags.transformDirty ^ this._dirtyFlag;

  // calculate stack matrix
  cc.kmMat4Multiply(stackMatrix, parentMatrix, t4x4);

  // update auto z order
  if (transformDirty && node.getAutoZOrder()) {
    node.updateAutoZOrder();
  }

  // transform children recursively
  const locChildren = node._children;
  if (recursive && locChildren != null && locChildren.length > 0) {
    for (let i = 0, len = locChildren.length; i < len; i++) {
      locChildren[i]._renderCmd.transform(this, recursive);
    }
  }
};

/**
 * Sets blend functions and automatically checks for string arguments.
 * @param {String} src source blend
 * @param {String} dst destination blend
 */
cc.Sprite.prototype._superSetBlendFunc = cc.Sprite.prototype.setBlendFunc;
cc.Sprite.prototype.setBlendFunc = function (src, dst) {
  if (typeof src === 'string') {
    src = UtilsEngine.getBlendFuncByName(src);
  }
  if (typeof dst === 'string') {
    dst = UtilsEngine.getBlendFuncByName(dst);
  }
  cc.Sprite.prototype._superSetBlendFunc.call(this, src, dst);
};

cc.Sprite.WebGLRenderCmd.prototype._super_rendering = cc.Sprite.WebGLRenderCmd.prototype.rendering;
cc.Sprite.WebGLRenderCmd.prototype.rendering = function (ctx) {
  if (this._node._texture != null && this._node._texture.isLoaded() && this._displayedOpacity > 0) {
    this.updateMatricesForRender();
    cc.Sprite.WebGLRenderCmd.prototype._super_rendering.call(this, ctx);
    this.updateMatricesAfterRender();
  }
};

cc.Sprite.prototype.setTexture = function (texture) {
  if (!texture) return this._renderCmd._setTexture(null);

  if (cc.isString(texture)) {
    texture = cc.textureCache.addImage(texture);

    if (!texture._textureLoaded) {
      texture.addEventListener('load', function () {
        this._renderCmd._setTexture(texture);
        this._changeRectWithTexture(texture.getContentSize());
        this.setColor(this._realColor);
        this._textureLoaded = true;
      }, this);
    } else {
      this._renderCmd._setTexture(texture);
      this._changeRectWithTexture(texture.getContentSize());
      this.setColor(this._realColor);
      this._textureLoaded = true;
    }
  } else {
    // CCSprite: setTexture doesn't work when the sprite is rendered using a CCSpriteSheet
    cc.assert(texture instanceof cc.Texture2D, cc._LogInfos.Sprite_setTexture_2);
    this._renderCmd._setTexture(texture);

    // fix for setting texture: this method must be called AFTER render command's texture is set
    // otherwise setting texture after the sprite is added to the scene causes the texture to be upside down
    this._changeRectWithTexture(texture.getContentSize());
  }
};

cc.Sprite.WebGLRenderCmd.prototype._super_setTextureCoords = cc.Sprite.WebGLRenderCmd.prototype._setTextureCoords;
cc.Sprite.WebGLRenderCmd.prototype._setTextureCoords = function () {
  const node = this._node;
  const texture = node._batchNode != null ? node.textureAtlas.texture : node._texture;
  if (texture == null) {
    // when there is no texture, cocos does not set texture coords
    // but we may have sprites that don't need a texture (shader based)
    // so we need to make sure in these cases to set uv to 0-1
    this.setTextureCoordsEdgeToEdge();
  } else {
    cc.Sprite.WebGLRenderCmd.prototype._super_setTextureCoords.apply(this, arguments);
  }
};

cc.Sprite.WebGLRenderCmd.prototype.setTextureCoordsEdgeToEdge = function () {
  const quad = this._quad;
  quad.bl.texCoords.u = 0.0;
  quad.bl.texCoords.v = 0.0;
  quad.br.texCoords.u = 1.0;
  quad.br.texCoords.v = 0.0;
  quad.tl.texCoords.u = 0.0;
  quad.tl.texCoords.v = 1.0;
  quad.tr.texCoords.u = 1.0;
  quad.tr.texCoords.v = 1.0;
  this._quadDirty = true;
};

cc.Sprite.WebGLRenderCmd.prototype.flipTextureCoords = function () {
  const locQuad = this._quad;
  const blV = locQuad.bl.texCoords.v;
  const brV = locQuad.br.texCoords.v;
  const tlV = locQuad.tl.texCoords.v;
  const trV = locQuad.tr.texCoords.v;
  locQuad.bl.texCoords.v = tlV;
  locQuad.br.texCoords.v = trV;
  locQuad.tl.texCoords.v = blV;
  locQuad.tr.texCoords.v = brV;
  this._quadDirty = true;
};

cc.Sprite.WebGLRenderCmd.prototype.setTextureCoordsEdgeToEdgeAndFlipped = function () {
  this.setTextureCoordsEdgeToEdge();
  this.flipTextureCoords();
};

cc.SpriteBatchNode.WebGLRenderCmd.prototype._super_rendering = cc.SpriteBatchNode.WebGLRenderCmd.prototype.rendering;
cc.SpriteBatchNode.WebGLRenderCmd.prototype.rendering = function (ctx) {
  if (this._textureAtlas.totalQuads > 0) {
    this.updateMatricesForRender();
    cc.SpriteBatchNode.WebGLRenderCmd.prototype._super_rendering.call(this, ctx);
    this.updateMatricesAfterRender();
  }
};

cc.AtlasNode.WebGLRenderCmd.prototype._super_rendering = cc.AtlasNode.WebGLRenderCmd.prototype.rendering;
cc.AtlasNode.WebGLRenderCmd.prototype.rendering = function (ctx) {
  this.updateMatricesForRender();
  cc.AtlasNode.WebGLRenderCmd.prototype._super_rendering.call(this, ctx);
  this.updateMatricesAfterRender();
};

cc.LabelTTF.WebGLRenderCmd.prototype._updateTexture = function () {
  this._dirtyFlag = this._dirtyFlag & cc.Node._dirtyFlags.textDirty ^ this._dirtyFlag;
  const node = this._node;
  const locContext = this._getLabelContext(); const
    locLabelCanvas = this._labelCanvas;
  const locContentSize = node._contentSize;

  if (node._string.length === 0) {
    locLabelCanvas.width = 1;
    locLabelCanvas.height = locContentSize.height || 1;
    node._texture && node._texture.handleLoadedTexture();
    node.setTextureRect(cc.rect(0, 0, 1, locContentSize.height));
    return true;
  }

  // set size for labelCanvas
  locContext.font = this._fontStyleStr;
  this._updateTTF();
  const { width } = locContentSize;
  const { height } = locContentSize;
  const flag = locLabelCanvas.width == width && locLabelCanvas.height == height;

  // transform canvas to acount for scale
  const textureWidth = Math.ceil(width * CONFIG.pixelScaleEngine);
  const textureHeight = Math.ceil(height * CONFIG.pixelScaleEngine);
  locLabelCanvas.style.width = `${width}px`;
  locLabelCanvas.style.height = `${width}px`;
  locLabelCanvas.width = textureWidth;
  locLabelCanvas.height = textureHeight;
  locContext.mozImageSmoothingEnabled = false;
  locContext.webkitImageSmoothingEnabled = false;
  locContext.msImageSmoothingEnabled = false;
  locContext.imageSmoothingEnabled = false;

  if (flag) locContext.clearRect(0, 0, textureWidth, textureHeight);

  // draw text to labelCanvas
  this._drawTTFInCanvas(locContext);
  node._texture && node._texture.handleLoadedTexture();

  node.setTextureRect(cc.rect(0, 0, width, height));

  // fix for HiDPI screens: force quad texture coords to go edge to edge and flip for cocos
  this.setTextureCoordsEdgeToEdgeAndFlipped();

  // label TTF updates the texture constantly (for who knows what reason) and swaps back to anti aliased texture
  // fix text rendering by forcing the font texture to always alias
  node._texture.setAliasTexParameters();

  return true;
};

cc.LabelTTF.WebGLRenderCmd.prototype._drawTTFInCanvas = function (context) {
  if (!context) return;
  const node = this._node;
  const locStrokeShadowOffsetX = node._strokeShadowOffsetX; const
    locStrokeShadowOffsetY = node._strokeShadowOffsetY;
  const locContentSizeHeight = node._contentSize.height - locStrokeShadowOffsetY; const locVAlignment = node._vAlignment;
  const locHAlignment = node._hAlignment; const
    locStrokeSize = node._strokeSize;

  // transform canvas to account for pixel scale
  context.setTransform(CONFIG.pixelScaleEngine, 0, 0, CONFIG.pixelScaleEngine, Math.ceil((locStrokeShadowOffsetX * 0.5) * CONFIG.pixelScaleEngine), Math.ceil((locContentSizeHeight + locStrokeShadowOffsetY * 0.5) * CONFIG.pixelScaleEngine));

  // this is fillText for canvas
  if (context.font != this._fontStyleStr) context.font = this._fontStyleStr;
  context.fillStyle = this._fillColorStr;

  let xOffset = 0; let
    yOffset = 0;
  // stroke style setup
  const locStrokeEnabled = node._strokeEnabled;
  if (locStrokeEnabled) {
    context.lineWidth = locStrokeSize * 2;
    context.strokeStyle = this._strokeColorStr;
  }

  // shadow style setup
  if (node._shadowEnabled) {
    const locShadowOffset = node._shadowOffset;
    context.shadowColor = this._shadowColorStr;
    context.shadowOffsetX = locShadowOffset.x;
    context.shadowOffsetY = -locShadowOffset.y;
    context.shadowBlur = node._shadowBlur;
  }

  context.textBaseline = cc.LabelTTF._textBaseline[locVAlignment];
  context.textAlign = cc.LabelTTF._textAlign[locHAlignment];

  const locContentWidth = node._contentSize.width - locStrokeShadowOffsetX;

  // lineHeight
  const lineHeight = node.getLineHeight();
  const transformTop = (lineHeight - this._fontClientHeight) / 2;

  if (locHAlignment === cc.TEXT_ALIGNMENT_RIGHT) xOffset += locContentWidth;
  else if (locHAlignment === cc.TEXT_ALIGNMENT_CENTER) xOffset += locContentWidth / 2;
  else xOffset += 0;
  if (this._isMultiLine) {
    const locStrLen = this._strings.length;
    if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM) yOffset = lineHeight - transformTop * 2 + locContentSizeHeight - lineHeight * locStrLen;
    else if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_CENTER) yOffset = (lineHeight - transformTop * 2) / 2 + (locContentSizeHeight - lineHeight * locStrLen) / 2;

    for (let i = 0; i < locStrLen; i++) {
      const line = this._strings[i];
      const tmpOffsetY = -locContentSizeHeight + (lineHeight * i + transformTop) + yOffset;
      if (locStrokeEnabled) context.strokeText(line, xOffset, tmpOffsetY);
      context.fillText(line, xOffset, tmpOffsetY);
    }
  } else {
    if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM) {
      // do nothing
    } else if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_TOP) {
      yOffset -= locContentSizeHeight;
    } else {
      yOffset -= locContentSizeHeight * 0.5;
    }
    if (locStrokeEnabled) context.strokeText(node._string, xOffset, yOffset);
    context.fillText(node._string, xOffset, yOffset);
  }
};

cc.LayerColor.WebGLRenderCmd.prototype._super_rendering = cc.LayerColor.WebGLRenderCmd.prototype.rendering;
cc.LayerColor.WebGLRenderCmd.prototype.rendering = function (ctx) {
  this.updateMatricesForRender();
  cc.LayerColor.WebGLRenderCmd.prototype._super_rendering.call(this, ctx);
  this.updateMatricesAfterRender();
};

cc.ParticleSystem.WebGLRenderCmd.prototype._super_rendering = cc.ParticleSystem.WebGLRenderCmd.prototype.rendering;
cc.ParticleSystem.WebGLRenderCmd.prototype.rendering = function (ctx) {
  if (this._node._texture != null) {
    this.updateMatricesForRender();
    cc.ParticleSystem.WebGLRenderCmd.prototype._super_rendering.call(this, ctx);
    this.updateMatricesAfterRender();
  }
};

cc.ParticleBatchNode.WebGLRenderCmd.prototype._super_rendering = cc.ParticleBatchNode.WebGLRenderCmd.prototype.rendering;
cc.ParticleBatchNode.WebGLRenderCmd.prototype.rendering = function (ctx) {
  if (this._node.textureAtlas.totalQuads > 0) {
    this.updateMatricesForRender();
    cc.ParticleBatchNode.WebGLRenderCmd.prototype._super_rendering.call(this, ctx);
    this.updateMatricesAfterRender();
  }
};

cc.MotionStreak.WebGLRenderCmd.prototype._super_rendering = cc.MotionStreak.WebGLRenderCmd.prototype.rendering;
cc.MotionStreak.WebGLRenderCmd.prototype.rendering = function (ctx) {
  if (this._node._texture != null && this._node._texture.isLoaded()) {
    this.updateMatricesForRender();
    cc.MotionStreak.WebGLRenderCmd.prototype._super_rendering.call(this, ctx);
    this.updateMatricesAfterRender();
  }
};

cc.ProgressTimer.WebGLRenderCmd.prototype._super_rendering = cc.ProgressTimer.WebGLRenderCmd.prototype.rendering;
cc.ProgressTimer.WebGLRenderCmd.prototype.rendering = function (ctx) {
  if (this._node.autoDraw) {
    this.updateMatricesForRender();
    cc.ProgressTimer.WebGLRenderCmd.prototype._super_rendering.call(this, ctx);
    this.updateMatricesAfterRender();
  }
};

cc.RenderTexture.WebGLRenderCmd.prototype._super_rendering = cc.RenderTexture.WebGLRenderCmd.prototype.rendering;
cc.RenderTexture.WebGLRenderCmd.prototype.rendering = function (ctx) {
  if (this._node.autoDraw) {
    this.updateMatricesForRender();
    cc.RenderTexture.WebGLRenderCmd.prototype._super_rendering.call(this, ctx);
    this.updateMatricesAfterRender();
  }
};

cc.DrawNode.WebGLRenderCmd.prototype._super_rendering = cc.DrawNode.WebGLRenderCmd.prototype.rendering;
cc.DrawNode.WebGLRenderCmd.prototype.rendering = function (ctx) {
  this.updateMatricesForRender();
  cc.DrawNode.WebGLRenderCmd.prototype._super_rendering.call(this, ctx);
  this.updateMatricesAfterRender();
};

// draw nodes do not account for their own opacity property
// fix draw node opacity by applying it to the vertices of the draw shape
cc.DrawNode.prototype._applyDisplayedOpacityToBuffer = function (indexFrom, indexTo) {
  const buffer = this._buffer;
  if (indexFrom == null) { indexFrom = 0; }
  if (indexTo == null) { indexTo = buffer.length; }
  if (indexTo > indexFrom) {
    for (let i = indexFrom; i < indexTo; i++) {
      const triangle = buffer[i];
      this._applyDisplayedOpacityToTriangleVertex(triangle.a);
      this._applyDisplayedOpacityToTriangleVertex(triangle.b);
      this._applyDisplayedOpacityToTriangleVertex(triangle.c);
    }
    this._dirty = true;
  }
};
cc.DrawNode.prototype._applyDisplayedOpacityToTriangleVertex = function (vertex) {
  if (vertex._baseOpacity == null) {
    vertex._baseOpacity = vertex.colors.a;
  }
  vertex.colors.a = Math.min(255.0, vertex._baseOpacity * (this.getDisplayedOpacity() / 255.0));
};
cc.DrawNode.prototype._super_drawDot = cc.DrawNode.prototype.drawDot;
cc.DrawNode.prototype.drawDot = function () {
  const bufferLength = this._buffer.length;
  cc.DrawNode.prototype._super_drawDot.apply(this, arguments);
  this._applyDisplayedOpacityToBuffer(bufferLength);
};
cc.DrawNode.prototype._super_drawSegment = cc.DrawNode.prototype.drawSegment;
cc.DrawNode.prototype.drawSegment = function () {
  const bufferLength = this._buffer.length;
  cc.DrawNode.prototype._super_drawSegment.apply(this, arguments);
  this._applyDisplayedOpacityToBuffer(bufferLength);
};
cc.DrawNode.prototype._super_drawPoly = cc.DrawNode.prototype.drawPoly;
cc.DrawNode.prototype.drawPoly = function () {
  const bufferLength = this._buffer.length;
  cc.DrawNode.prototype._super_drawPoly.apply(this, arguments);
  this._applyDisplayedOpacityToBuffer(bufferLength);
};
cc.DrawNode.prototype._super_drawSegments = cc.DrawNode.prototype._drawSegments;
cc.DrawNode.prototype._drawSegments = function () {
  const bufferLength = this._buffer.length;
  cc.DrawNode.prototype._super_drawSegments.apply(this, arguments);
  this._applyDisplayedOpacityToBuffer(bufferLength);
};
cc.DrawNode.WebGLRenderCmd.prototype._super_updateDisplayOpacity = cc.DrawNode.WebGLRenderCmd.prototype._updateDisplayOpacity;
cc.DrawNode.WebGLRenderCmd.prototype._updateDisplayOpacity = function (val) {
  cc.DrawNode.WebGLRenderCmd.prototype._super_updateDisplayOpacity.call(this, val);
  this._node._applyDisplayedOpacityToBuffer();
};
cc.DrawNode.WebGLRenderCmd.prototype._super_syncDisplayOpacity = cc.DrawNode.WebGLRenderCmd.prototype._syncDisplayOpacity;
cc.DrawNode.WebGLRenderCmd.prototype._syncDisplayOpacity = function (val) {
  cc.DrawNode.WebGLRenderCmd.prototype._super_syncDisplayOpacity.call(this, val);
  this._node._applyDisplayedOpacityToBuffer();
};

module.exports = RenderingInjections;
