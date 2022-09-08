// pragma PKGS: core_gem_sprite

const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const PackageManager = require('app/ui/managers/package_manager');
const BaseSprite = require('app/view/nodes/BaseSprite');
const CompositeHorizontalPass = require('app/view/nodes/components/CompositeHorizontalPass');

/** **************************************************************************
 CoreGemSprite
 *************************************************************************** */

const CoreGemSprite = BaseSprite.extend({

  // parameters that control appearance
  blackColor: cc.color(50.0, 0.0, 0.0),
  gemSeed: 1.0,
  highlightsEdges: false,
  midColor: cc.color(255.0, 15.0, 0.0),
  timeScale: 0.5,

  ctor() {
    this._super();

    // random GEM shape
    this.gemSeed = Math.random();

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated/unloaded

      // set noise as texture
      const noiseTexture = cc.textureCache.getTextureForKey(RSX.noise_128.img);
      this.setTexture(noiseTexture);

      // set custom shader
      const shaderProgram = cc.shaderCache.programForKey('CoreGem');
      this.setShaderProgram(shaderProgram);

      // activate the HighlightsEdges horizontal render pass component
      this.setHighlightsEdges(true);
    });
  },

  getRequiredResources() {
    return BaseSprite.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier('core_gem_sprite'));
  },

  onEnter() {
    BaseSprite.prototype.onEnter.call(this);

    // make a strong reference to cubemap texture resource so it doesn't get unloaded too early
    PackageManager.getInstance().addStrongReferenceToResourcePath(RSX.core_gem_cubemap.name, this.__instanceId);

    // schedule an update on each tick so we can mark the render pass composite as dirty
    this.scheduleUpdate();
  },

  onExit() {
    BaseSprite.prototype.onExit.call(this);

    // remove strong reference to cubemap texture resource so it can be unloaded
    PackageManager.getInstance().removeStrongReferenceToResourcePath(RSX.core_gem_cubemap.name, this.__instanceId);
  },

  /**
   * Overrides the abstract method from BaseSprite in order to set custom uniform values for the CoreGem shader
   * @override
   * @param {Object} shaderProgram
   */
  onBaseDrawSetAdditionalUniforms(shaderProgram) {
    // bind cube map and other uniforms to the CoreGem shader
    const cubemapTexture = cc.textureCache.getTextureForKey(RSX.core_gem_cubemap.name);
    if (cubemapTexture != null) {
      const gl = cc._renderContext;
      shaderProgram.setUniformLocationWith2f(shaderProgram.loc_texResolution, this._texture.getPixelsWide(), this._texture.getPixelsHigh());
      shaderProgram.setUniformLocationWith1f(shaderProgram.loc_time, this.getFX().getTime() * (this.timeScale || 1.0));
      shaderProgram.setUniformLocationWith1f(shaderProgram.loc_gemSeed, this.gemSeed);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture.getGLTexture());
    }
  },

  /**
   * Overlays edges over texture.
   * NOTE: this uses a horizontal rendering component, which may be performance intensive in some cases.
   * @param {Boolean} highlightsEdges
   */
  setHighlightsEdges(highlightsEdges) {
    if (this.highlightsEdges !== highlightsEdges) {
      this.highlightsEdges = highlightsEdges;

      // auto manage leveled component
      this.autoManageComponentById(this.getHighlightsEdges(), 'HighlightsEdges', this.createHighlightsEdgesComponent.bind(this));
    }
  },
  getHighlightsEdges() {
    return this.highlightsEdges;
  },
  createHighlightsEdgesComponent() {
    return new CompositeHorizontalPass(this, cc.shaderCache.programForKey('CoreGemEdgesAndColorizeFragment'), this.setupHighlightsEdgesRender.bind(this));
  },
  setupHighlightsEdgesRender(shaderProgram) {
    this._renderCmd.setDefaultMatricesAndBlendModesForDraw(shaderProgram);
    shaderProgram.setUniformLocationWith2f(shaderProgram.loc_texResolution, this._texture.getPixelsWide(), this._texture.getPixelsHigh());
    shaderProgram.setUniformLocationWith3f(shaderProgram.loc_colorBlackPoint, this.blackColor.r / 255.0, this.blackColor.g / 255.0, this.blackColor.b / 255.0);
    shaderProgram.setUniformLocationWith3f(shaderProgram.loc_colorMidPoint, this.midColor.r / 255.0, this.midColor.g / 255.0, this.midColor.b / 255.0);
  },

  /**
   * This method is scheduled to be called on each frame tick and will set the composite as dirty in order for the Horizontal render pass component to render in realtime.
   * @param {Number} dt
   */
  update(dt) {
    BaseSprite.prototype.update.call(this, dt);
    this._renderCmd.setCompositeDirty();
  },

});

module.exports = CoreGemSprite;
