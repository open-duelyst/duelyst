/** **************************************************************************
Render Pass
*************************************************************************** */
var RenderPass = cc.Class.extend({
  width: 0,
  height: 0,
  scale: 0,
  antiAlias: true,
  frameBuffer: null,
  renderBuffer: null,
  texture: null,
  _quad: null,
  _quadBuffer: null,
  _quadDirty: false,
  _stackMatrix: null,
  _lastFrameBuffer: null,

  /* region INITIALIZE */

  ctor(format, width, height, scale, antiAlias, depthStencilFormat) {
    this.rebuild(format, width, height, scale, antiAlias, depthStencilFormat);
  },
  /**
   * Rebuild render pass to use new parameters.
   * @param format
   * @param width
   * @param height
   * @param [scale=1]
   * @param [antiAlias=true]
   * @param [depthStencilFormat=null]
   */
  rebuild(format, width, height, scale, antiAlias, depthStencilFormat) {
    // always release first
    this.release();

    // set defaults in case of bad parameters
    // TODO: report to bug snag
    if (format == null) {
      var errorMsg = `RenderPass: initialized with invalid FORMAT of ${format}, using default cc.Texture2D.PIXEL_FORMAT_RGBA8888`;
      console.warn(errorMsg);
      format = cc.Texture2D.PIXEL_FORMAT_RGBA8888;
    }
    if (width == null || width <= 0) {
      var errorMsg = `RenderPass: initialized with invalid WIDTH dimension of ${width}, using default 100`;
      console.warn(errorMsg);
      width = 100;
    }
    if (height == null || height <= 0) {
      var errorMsg = `RenderPass: initialized with invalid HEIGHT dimension of ${height}, using default 100`;
      console.warn(errorMsg);
      height = 100;
    }
    if (scale == null || scale <= 0) {
      scale = 1;
    }
    if (antiAlias == null) {
      antiAlias = true;
    }

    // appears to be safe to use non power of two textures
    // based on http://www.khronos.org/webgl/wiki/WebGL_and_OpenGL_Differences#Non-Power_of_Two_Texture_Support
    // repeat must be CLAMP_TO_EDGE and minification must be NEAREST OR LINEAR
    this.scale = scale;
    this.width = Math.ceil(width * this.scale);
    this.height = Math.ceil(height * this.scale);
    const devicePixelRatio = cc.view.getDevicePixelRatio();
    const textureWidth = Math.ceil(this.width * devicePixelRatio);
    const textureHeight = Math.ceil(this.height * devicePixelRatio);
    this.antiAlias = antiAlias;

    const gl = cc._renderContext;
    const frameBufferLast = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    this.frameBuffer = gl.createFramebuffer();

    this.texture = new cc.Texture2D();
    this.texture.initWithData(null, format, textureWidth, textureHeight, cc.size(textureWidth, textureHeight));
    if (this.antiAlias) {
      this.texture.setAntiAliasTexParameters();
    } else {
      this.texture.setAliasTexParameters();
    }
    this.texture._hasPremultipliedAlpha = true;

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture.getName(), 0);

    if (depthStencilFormat != null) {
      this.renderBuffer = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
      // stencil format support appears to be unstable, so we'll force use of depth/stencil for now
      // gl.renderbufferStorage(gl.RENDERBUFFER, depthStencilFormat, this.width, this.height);
      // gl.framebufferRenderbuffer(gl.FRAMEBUFFER, depthStencilFormat === gl.STENCIL_INDEX8 ? gl.STENCIL_ATTACHMENT : gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderBuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, this.width, this.height);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.renderBuffer);
    }

    // check framebuffer status
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    switch (status) {
    case gl.FRAMEBUFFER_UNSUPPORTED:
      throw 'RenderPass: Framebuffer is unsupported';
    case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
      throw 'RenderPass: Framebuffer incomplete attachment';
    case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
      throw 'RenderPass: Framebuffer incomplete dimensions';
    case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
      throw 'RenderPass: Framebuffer incomplete missing attachment';
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferLast);

    const quad = this._quad = new cc.V3F_C4B_T2F_Quad();

    quad.tl.vertices.x = 0;
    quad.tl.vertices.y = this.height;
    quad.tl.vertices.z = cc.Node.prototype._vertexZ;
    quad.tl.texCoords.u = 0;
    quad.tl.texCoords.v = 1;
    quad.tl.colors.r = quad.tl.colors.g = quad.tl.colors.b = quad.tl.colors.a = 255;

    quad.bl.vertices.x = 0;
    quad.bl.vertices.y = 0;
    quad.bl.vertices.z = cc.Node.prototype._vertexZ;
    quad.bl.texCoords.u = 0;
    quad.bl.texCoords.v = 0;
    quad.bl.colors.r = quad.bl.colors.g = quad.bl.colors.b = quad.bl.colors.a = 255;

    quad.tr.vertices.x = this.width;
    quad.tr.vertices.y = this.height;
    quad.tr.vertices.z = cc.Node.prototype._vertexZ;
    quad.tr.texCoords.u = 1;
    quad.tr.texCoords.v = 1;
    quad.tr.colors.r = quad.tr.colors.g = quad.tr.colors.b = quad.tr.colors.a = 255;

    quad.br.vertices.x = this.width;
    quad.br.vertices.y = 0;
    quad.br.vertices.z = cc.Node.prototype._vertexZ;
    quad.br.texCoords.u = 1;
    quad.br.texCoords.v = 0;
    quad.br.colors.r = quad.br.colors.g = quad.br.colors.b = quad.br.colors.a = 255;

    this._quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad.arrayBuffer, gl.STATIC_DRAW);

    // orthographic projection matrix
    this._projMatrix = cc.kmMat4Identity(new cc.kmMat4());
    cc.kmMat4OrthographicProjection(this._projMatrix, 0, this.width, 0, this.height, -1024, 1024);

    // stack/modelview matrix
    this._stackMatrix = cc.kmMat4Identity(new cc.kmMat4());

    // TODO: pass perspective projection/stack matrices are slightly off
    const zeyePass = (this.height / 2.0 / Math.tan(Math.PI / 6.0));
    this._perspectiveProjMatrix = cc.kmMat4Identity(new cc.kmMat4());
    cc.kmMat4PerspectiveProjection(this._perspectiveProjMatrix, 60, this.width / this.height, 0.1, zeyePass * 2);

    this._perspectiveStackMatrix = cc.kmMat4Identity(new cc.kmMat4());
    const eye = cc.kmVec3Fill(null, this.width / 2, this.height / 2, zeyePass);
    const center = cc.kmVec3Fill(null, this.width / 2, this.height / 2, 0.0);
    const up = cc.kmVec3Fill(null, 0.0, 1.0, 0.0);
    cc.kmMat4LookAt(this._perspectiveStackMatrix, eye, center, up);
  },
  /**
   * Releases a render pass by cleaning up buffers and textures.
   */
  release() {
    const gl = cc._renderContext;
    if (this.frameBuffer != null) {
      gl.deleteFramebuffer(this.frameBuffer);
    }
    if (this.renderBuffer != null) {
      gl.deleteRenderbuffer(this.renderBuffer);
    }
    if (this._quadBuffer != null) {
      gl.deleteBuffer(this._quadBuffer);
    }
    if (this.texture != null) {
      this.texture.releaseTexture();
    }
  },

  /* endregion INITIALIZE */

  /* region GETTERS / SETTERS */

  getWidth() {
    return this.width;
  },
  getHeight() {
    return this.height;
  },
  getScale() {
    return this.scale;
  },
  getAntiAlias() {
    return this.antiAlias;
  },
  getTexture() {
    return this.texture;
  },
  getQuad() {
    return this._quad;
  },
  getQuadDirty() {
    return this._quadDirty;
  },
  setQuadDirty() {
    this._quadDirty = true;
  },
  setColor(color) {
    const quad = this._quad;
    quad.tl.colors.r = quad.bl.colors.r = quad.tr.colors.r = quad.br.colors.r = color.r;
    quad.tl.colors.g = quad.bl.colors.g = quad.tr.colors.g = quad.br.colors.g = color.g;
    quad.tl.colors.b = quad.bl.colors.b = quad.tr.colors.b = quad.br.colors.b = color.b;
    if (color.a != null) {
      quad.tl.colors.a = quad.bl.colors.a = quad.tr.colors.a = quad.br.colors.a = color.a;
    }
    this.setQuadDirty();
  },
  getColor() {
    // sample one vertex (not entirely accurate)
    return {
      r: this._quad.tl.colors.r, g: this._quad.tl.colors.g, b: this._quad.tl.colors.b, a: this._quad.tl.colors.a,
    };
  },
  getNeedsPerspectiveProjection() {
    return false;
  },

  /* endregion GETTERS / SETTERS */

  /* region RENDERING */

  /**
   * Begins redirecting drawing and clears the render pass. This is an optimized version of beginWithResetClear, and should only be used for fullscreen passes!
   * @param [r = 0] red clear value from 0 to 255
   * @param [g = 0] green clear value from 0 to 255
   * @param [b = 0] blue clear value from 0 to 255
   * @param [a = 0] alpha clear value from 0 to 255
   * @param [stencilValue = 0x0]
   */
  beginWithClear(r, g, b, a, stencilValue) {
    this.begin();
    this.clear(r, g, b, a, stencilValue);
  },
  /**
   * Begins, clears, and resets projection / modelview matrices to the pass's matrices, i.e. position 0, 0 is now x, y in render pass space, not screen space.
   * @param [stackId = 0] id of stack this should reset onto (use this to organize redirected drawing by id)
   * @param [r = 0] red clear value from 0 to 255
   * @param [g = 0] green clear value from 0 to 255
   * @param [b = 0] blue clear value from 0 to 255
   * @param [a = 0] alpha clear value from 0 to 255
   * @param [stencilValue = 0x0]
   */
  beginWithResetClear(stackId, r, g, b, a, stencilValue) {
    this.beginWithClear(r, g, b, a, stencilValue);
    RenderPass.push_to_reset_stack(this, stackId);
  },
  /**
   * Begins and resets projection / modelview matrices to the pass's matrices, i.e. position 0, 0 is now x, y in render pass space, not screen space.
   */
  beginWithReset(stackId) {
    this.begin();
    RenderPass.push_to_reset_stack(this, stackId);
  },
  /**
   * Begins redirecting drawing to the render pass.
   */
  begin() {
    const gl = cc._renderContext;
    cc.renderer._turnToCacheMode(this.__instanceId);
    this._lastFrameBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
  },
  /**
   * Clears pass texture, resetting to rgba/stencil parameters.
   * @param [r = 0] red clear value from 0 to 255
   * @param [g = 0] green clear value from 0 to 255
   * @param [b = 0] blue clear value from 0 to 255
   * @param [a = 0] alpha clear value from 0 to 255
   * @param [stencil = 0x0]
   */
  clear(r, g, b, a, stencil) {
    const gl = cc._renderContext;
    r = r ? r / 255.0 : 0.0;
    g = g ? g / 255.0 : 0.0;
    b = b ? b / 255.0 : 0.0;
    a = a ? a / 255.0 : 0.0;
    gl.clearColor(r, g, b, a);
    if (typeof stencil !== 'undefined') {
      gl.clearStencil(stencil || 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    } else {
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    /*

    // below is more flexible, but getParameter is a slow op
    // and we should be able to safely skip it

    flags = flags || gl.COLOR_BUFFER_BIT;

    if(flags & gl.COLOR_BUFFER_BIT) {
      lastColor = gl.getParameter(gl.COLOR_CLEAR_VALUE);
      gl.clearColor(r || 0.0, g || 0.0, b || 0.0, a || 0.0);
    }

    if (flags & gl.DEPTH_BUFFER_BIT) {
      lastDepthValue = gl.getParameter(gl.DEPTH_CLEAR_VALUE);
      gl.clearDepth(depthValue);
    }

    if(flags & gl.STENCIL_BUFFER_BIT) {
      lastStencilValue = gl.getParameter(gl.STENCIL_CLEAR_VALUE);
      gl.clearStencil(stencilValue || 0.0);
    }

    gl.clear(flags);

    if (flags & gl.COLOR_BUFFER_BIT) {
      gl.clearColor(lastColor[0], lastColor[1], lastColor[2], lastColor[3]);
    }

    if (flags & gl.DEPTH_BUFFER_BIT) {
      gl.clearDepth(lastDepthValue);
    }

    if (flags & gl.STENCIL_BUFFER_BIT) {
      gl.clearStencil(lastStencilValue);
    }
    */
  },
  /**
   * Resets projection / modelview matrices for visiting a node and then visits the node.
   * @param node
   */
  visitNode(node) {
    const gl = cc._renderContext;
    const anchorPoint = node.getAnchorPoint();
    const position = node.getPosition();

    // flipped stack matrix for nodes so they draw correctly
    const ox = (position.x || 0);
    const oy = (position.y || 0);
    const ax = this.width * (anchorPoint.x || 0);
    const ay = this.height * (anchorPoint.y || 0);
    const stackMat = this._stackMatrix.mat;
    stackMat[5] = -1.0;
    stackMat[12] = ax - ox;
    stackMat[13] = this.height - ay + oy;

    // visit node
    node.visit(this);

    // reset self to normal
    stackMat[12] = stackMat[13] = 0;
    stackMat[5] = 1.0;
  },
  /**
   * Ends redirect of drawing to this pass and restores the previous framebuffer.
   */
  end() {
    const gl = cc._renderContext;
    cc.renderer._renderingToBuffer(this.__instanceId);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._lastFrameBuffer);
    this._lastFrameBuffer = null;
  },
  /**
   * Resets projection and modelview matrices to the previous matrices, i.e. position 0, 0 is now 0, 0 in screen space, not render pass space.
   * @param [stackId = 0] id of stack this should reset from (use this to organize redirected drawing by id)
   */
  endWithReset(stackId) {
    this.end();
    RenderPass.pop_from_reset_stack(stackId);
  },
  /**
   * Render using pass's quad. Don't forget to set the shader, matrices, and texture before calling this method!
   */
  render() {
    const gl = cc._renderContext;

    cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._quadBuffer);
    if (this._quadDirty) {
      this._quadDirty = false;
      gl.bufferData(gl.ARRAY_BUFFER, this._quad.arrayBuffer, gl.DYNAMIC_DRAW);
    }
    gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12);
    gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 24, 16);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    cc.incrementGLDraws(1);
  },

  /* endregion RENDERING */
});

/**
 * Creates a frameBuffer and texture for a simple render pass.
 * @param {FX} fx fx instance this render pass will be working for
 * @param {Number} format texture pixel format, usually TEXTURE_2D_PIXEL_FORMAT_RGBA8888
 * @param {Number} width width greater than 0
 * @param {Number} height height greater than 0
 * @param {Number} [scale=1] scale of texture and vertices
 * @param {Boolean} [antiAlias=true]
 * @param {Number} [depthStencilFormat] whether to attach a depth and/or stencil render buffer to the pass
 * @returns {RenderPass}
 * */
RenderPass.create = function (format, width, height, scale, antiAlias, depthStencilFormat) {
  return new RenderPass(format, width, height, scale, antiAlias, depthStencilFormat);
};

/**
 * Global stacks for render passes that are currently redirecting drawing to themselves or nodes.
 */
RenderPass._reset_stacks_by_id = {};
RenderPass._reset_stacks = [];

/**
 * Get a unique reset stack id.
 */
RenderPass._reset_stack_id = 0;
RenderPass.get_new_reset_stack_id = function () {
  return RenderPass._reset_stack_id++;
};

/**
 * Push a render pass to the global stack.
 */
RenderPass.push_to_reset_stack = function (renderPass, stackId) {
  stackId || (stackId = 0);
  const gl = cc._renderContext;

  // push render pass to stack matching id
  let resetStack = RenderPass._reset_stacks_by_id[stackId];
  if (resetStack == null) {
    resetStack = RenderPass._reset_stacks_by_id[stackId] = [];
  }
  resetStack.push(renderPass);

  // push reset stack to list
  RenderPass._reset_stacks.push(resetStack);

  cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
  cc.current_stack.stack.push(cc.current_stack.top);
  cc.current_stack.top = renderPass._projMatrix;

  cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
  cc.current_stack.stack.push(cc.current_stack.top);
  cc.current_stack.top = renderPass._stackMatrix;

  const devicePixelRatio = cc.view.getDevicePixelRatio();
  gl.viewport(0, 0, Math.ceil(renderPass.width * devicePixelRatio), Math.ceil(renderPass.height * devicePixelRatio));

  return renderPass;
};

/**
 * Pop the top render pass from the global stack.
 */
RenderPass.pop_from_reset_stack = function (stackId) {
  stackId || (stackId = 0);
  const resetStack = RenderPass._reset_stacks_by_id[stackId];
  const gl = cc._renderContext;
  let renderPass;
  if (resetStack != null && resetStack.length > 0) {
    // pop the top off the stacks
    renderPass = resetStack.pop();
    RenderPass._reset_stacks.pop();

    // reset matrices
    cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
    cc.kmGLPopMatrix();
    cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
    cc.kmGLPopMatrix();

    // reset viewport
    let nextRenderPass;
    if (RenderPass._reset_stacks.length > 0) {
      const nextResetStack = RenderPass._reset_stacks[RenderPass._reset_stacks.length - 1];
      if (nextResetStack != null) {
        nextRenderPass = resetStack[resetStack.length - 1];
      }
    }
    if (nextRenderPass != null) {
      const devicePixelRatio = cc.view.getDevicePixelRatio();
      gl.viewport(0, 0, Math.ceil(nextRenderPass.width * devicePixelRatio), Math.ceil(nextRenderPass.height * devicePixelRatio));
    } else {
      cc.director.setViewport();
    }
  }

  return renderPass;
};

/**
 * Get whether drawing is reset to render pass space for a specific stack.
 */
RenderPass.is_rendering_reset_for_stack = function (stackId) {
  if (stackId != null) {
    return RenderPass.get_top_of_reset_stack(stackId) != null;
  }
  return false;
};

/**
 * Get render pass that rendering is redirecting to, or null if not redirecting.
 * @param [stackId=null] id of stack to get top from, otherwise current stack
 * @returns {RenderPass|null}
 */
RenderPass.get_top_of_reset_stack = function (stackId) {
  let resetStack;
  if (stackId != null) {
    resetStack = RenderPass._reset_stacks_by_id[stackId];
  } else {
    const reset_stacks = RenderPass._reset_stacks;
    if (reset_stacks.length > 0) {
      resetStack = reset_stacks[reset_stacks.length - 1];
    }
  }
  return resetStack && resetStack[resetStack.length - 1];
};

module.exports = RenderPass;
