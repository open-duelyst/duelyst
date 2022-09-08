// pragma PKGS: alwaysloaded

const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const generatePushID = require('app/common/generate_push_id');
const glslify = require('glslify');
const RSX = require('app/data/resources');
const UtilsEngine = require('app/common/utils/utils_engine');
const UtilsPosition = require('app/common/utils/utils_position');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const FXShockWaveSprite = require('app/view/nodes/fx/FXShockwaveSprite');
const TweenTypes = require('app/view/actions/TweenTypes');
const GradientColorMap = require('app/view/actions/GradientColorMap');
const BlurShaderGenerator = require('app/shaders/helpers/blurShaderGenerator');
const BatchLights = require('./BatchLights');
const RenderPass = require('./RenderPass');

/** **************************************************************************
 FX
 *************************************************************************** */

const FX = cc.Class.extend({
  // ambient light applied when lighting accumulation is merged with occluder
  ambientLightColor: { r: 89, g: 89, b: 89 },
  // falloff modifier between 0 and infinity
  // where higher causes light to spread further within radius and falloff gradient to be shorter
  falloffModifier: 1.0,
  // intensity modifier between 0 and infinity
  // where higher causes light to hit facing pixels more brightly
  intensityModifier: 1.0,
  // shadow modifier between 0 and infinity
  // where higher causes shadows to become darker
  shadowIntensity: 0.15,
  // shadow blur shift modifier between 1 and infinity
  // where higher causes shadow blur effect to start further from the shadow caster
  shadowBlurShiftModifier: 1.0,
  // shadow blur intensity modifier between 0 and infinity
  // where higher causes shadows to blur more (this is a fake increase, blur is a fixed size box blur)
  shadowBlurIntensityModifier: 3.0,
  // highpass/bloom threshold between 0 and 1
  // where lower value picks up more of the image for bloom effect
  bloomThreshold: 0.6,
  // highpass/bloom intensity between 1 and infinity
  // where higher increases color values of pixels passing threshold
  bloomIntensity: 2.5,
  // bloom transition from previous bloom to current between 0 and 1
  // lower values will make bloom transition slower
  bloomTransition: 0.15,
  // bloom scale value, between 1 and greater than 0
  // lower scale is less accurate but more performant
  bloomScale: 0.5,
  // maximum number of active decals in the world space
  maxNumDecals: 10,
  // wind direction as a 2D vector from -1 to 1 (defaults to no wind)
  windDirection: cc.p(0, 0),
  // radial blur screen position as a percent between 0 and 1
  radialBlurScreenPct: cc.p(0.5, 0.5),
  // strength of blur
  radialBlurStrength: 0.0,
  // decay of the color for each blur sample
  radialBlurDecay: 1.0,
  // dead zone for radial blur between 0 and infinity
  // where higher creates a larger unblurred area around blur origin
  radialBlurDeadZone: 0.1,
  // ramp of radial blur from center
  radialBlurRamp: 2.0,
  // density of blur samples
  // where higher is more spread out and more blurry
  radialBlurSpread: 0.0,

  lights: null,
  shadowCastingLights: null,
  occluders: null,
  shadowCasters: null,
  decals: null,
  distortions: null,

  passes: null,

  batchLights: null,
  batchShadowCastingLights: null,

  // always increasing time
  time: 0.0,
  deltaTime: 0.0,
  // looping time from 0 to 1, guaranteed to hit 1 exactly
  loopingTime: 0.0,
  _loopingTimeOverflow: 0.0,
  // looping time from 0 to 1 to 0, guaranteed to hit both 0 and 1 exactly
  loopingDirectionalTime: 0.0,
  _loopingDirectionalTimeOverflow: 0.0,
  _loopingDirection: 1.0,

  _distortionsDirty: false,
  _refractMap: null,
  _currentSurfacePass: null,
  _currentBloomCompositePass: null,
  _previousBloomCompositePass: null,

  _instancesById: null,
  _instancesDirtyById: null,
  _instancedRenderPassesById: null,

  toneCurveTextureKey: RSX.tonal_gradient_simple.img,
  // tonal curve value for how strongly to apply tone shift between 0 and 1
  toneCurveAmount: 0.0,

  // gradient color map control vars
  _gradientMapStack: null,
  _gradientMapNoneId: null,
  _gradientMapTransitionPhase: 0.0,
  _gradientMapDirty: false,
  _needsGradientColorMap: false,
  _fromGradientColorMapWhiteColor: null,
  _fromGradientColorMapMidColor: null,
  _fromGradientColorMapBlackColor: null,
  _toGradientColorMapWhiteColor: null,
  _toGradientColorMapMidColor: null,
  _toGradientColorMapBlackColor: null,

  _cacheScreenRequested: false,
  _cacheSurfaceRequested: false,
  _blurScreenRequests: null,
  _blurSurfaceRequests: null,
  screenBlurShaderProgramKey: 'BlurExtreme',
  surfaceBlurShaderProgramKey: 'BlurStrong',

  _redirectingToScreenPass: false,
  _redirectingToSurfacePass: false,
  _cachingScreen: false,
  _cachingSurface: false,
  _cachingScreenDirty: false,
  _cachingSurfaceDirty: false,

  _eventBus: null,

  ctor() {
    this._eventBus = EventBus.create();

    this._blurScreenRequests = [];
    this._blurSurfaceRequests = [];
    this._postProcessingRenderPassStackId = RenderPass.get_new_reset_stack_id();

    this._instancesById = {};
    this._instancesDirtyById = {};
    this._instancedRenderPassesById = {};

    this._gradientMapStack = [];
    this._gradientMapNoneId = generatePushID();
    this._gradientMapTransitionPhase = 0.0;
    this._gradientMapDirty = false;
    this._needsGradientColorMap = false;
    this._fromGradientColorMapWhiteColor = cc.color(0.0, 0.0, 0.0, 0.0);
    this._fromGradientColorMapMidColor = cc.color(0.0, 0.0, 0.0, 0.0);
    this._fromGradientColorMapBlackColor = cc.color(0.0, 0.0, 0.0, 0.0);
    this._toGradientColorMapWhiteColor = cc.color(0.0, 0.0, 0.0, 0.0);
    this._toGradientColorMapMidColor = cc.color(0.0, 0.0, 0.0, 0.0);
    this._toGradientColorMapBlackColor = cc.color(0.0, 0.0, 0.0, 0.0);

    this.passes = {};
    this.lights = [];
    this.shadowCastingLights = [];
    this.occluders = [];
    this.shadowCasters = [];
    this.decals = [];
    this.distortions = [];

    this.createPasses();

    this._initBatches();
    this._initShaderUniforms();
    this.updateShaderResolutionUniforms();
    this._initTime();

    this._beginSurfaceCompositeRenderCmd = new BeginSurfaceCompositeRenderCmd(this);
    this._endSurfaceCompositeRenderCmd = new EndSurfaceCompositeRenderCmd(this);

    // start update that runs before anything else every frame
    cc.director.getScheduler().scheduleUpdateForTarget(this, -9999, false);
  },

  /**
   * Creates batches for things such as lighting and shadow casting.
   */
  _initBatches() {
    this.batchLights = BatchLights.create();
    this.batchShadowCastingLights = BatchLights.create();
  },

  /**
   * Sets all initial shader uniform values. Make sure FX has been setup already so all shaders are initialized.
   */
  _initShaderUniforms() {
    const { shaderCache } = cc;

    const posTexAlphaProgram = shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLORALPHATEST);
    posTexAlphaProgram.use();
    posTexAlphaProgram.setUniformLocationWith1f(posTexAlphaProgram.loc_CC_alpha_value, 0.5);

    const bloomProgram = shaderCache.programForKey('Bloom');
    bloomProgram.use();
    bloomProgram.setUniformLocationWith1f(bloomProgram.loc_transition, this.bloomTransition);

    const highpassProgram = shaderCache.programForKey('Highpass');
    highpassProgram.use();
    highpassProgram.setUniformLocationWith1f(highpassProgram.loc_threshold, this.bloomThreshold);
    highpassProgram.setUniformLocationWith1f(highpassProgram.loc_intensity, this.bloomIntensity);

    const glowNoiseProgram = shaderCache.programForKey('GlowNoise');
    glowNoiseProgram.use();
    glowNoiseProgram.setUniformLocationWith4f(glowNoiseProgram.loc_color, 1.0, 1.0, 1.0, 1.0);
    glowNoiseProgram.setUniformLocationWith4f(glowNoiseProgram.loc_rampFrom, 1.0, 1.0, 1.0, 1.0);
    glowNoiseProgram.setUniformLocationWith4f(glowNoiseProgram.loc_rampTransition, 1.0, 1.0, 1.0, 1.0);
    glowNoiseProgram.setUniformLocationWith1f(glowNoiseProgram.loc_expandModifier, 0.2);
    glowNoiseProgram.setUniformLocationWith1f(glowNoiseProgram.loc_frequency, 75.0);
    glowNoiseProgram.setUniformLocationWith1f(glowNoiseProgram.loc_amplitude, 0.75);
    glowNoiseProgram.setUniformLocationWith2f(glowNoiseProgram.loc_range, 0.1, 0.6);

    const glowProgram = shaderCache.programForKey('Glow');
    glowProgram.use();
    glowProgram.setUniformLocationWith4f(glowProgram.loc_color, 1.0, 1.0, 1.0, 1.0);
    glowProgram.setUniformLocationWith1f(glowProgram.loc_thickness, 1.0);

    const highlightProgram = shaderCache.programForKey('Highlight');
    highlightProgram.use();
    highlightProgram.setUniformLocationWith4f(highlightProgram.loc_color, 1.0, 1.0, 1.0, 1.0);

    const lensFlareProgram = shaderCache.programForKey('LensFlare');
    lensFlareProgram.use();
    lensFlareProgram.setUniformLocationWith2f(lensFlareProgram.loc_origin, 0.5, 0.5);
    lensFlareProgram.setUniformLocationWith1f(lensFlareProgram.loc_rampThreshold, 1.0);

    const wispFlareProgram = shaderCache.programForKey('WispLensFlare');
    wispFlareProgram.use();
    wispFlareProgram.setUniformLocationWith1f(wispFlareProgram.loc_pulseRate, 0.0);
    wispFlareProgram.setUniformLocationWith1f(wispFlareProgram.loc_armLength, 0.3);
    wispFlareProgram.setUniformLocationWith1f(wispFlareProgram.loc_wispSize, 0.05);
    wispFlareProgram.setUniformLocationWith1f(wispFlareProgram.loc_flareSize, 0.1);

    const lightingProgram = shaderCache.programForKey('Lighting');
    lightingProgram.use();
    lightingProgram.setUniformLocationWith1f(lightingProgram.loc_falloffModifier, this.falloffModifier);
    lightingProgram.setUniformLocationWith1f(lightingProgram.loc_intensityModifier, this.intensityModifier);

    const shadowLowQualityProgram = shaderCache.programForKey('ShadowLowQuality');
    shadowLowQualityProgram.use();
    shadowLowQualityProgram.setUniformLocationWith1f(shadowLowQualityProgram.loc_intensity, this.shadowIntensity);
    shadowLowQualityProgram.setUniformLocationWith1f(shadowLowQualityProgram.loc_blurShiftModifier, this.shadowBlurShiftModifier);
    shadowLowQualityProgram.setUniformLocationWith1f(shadowLowQualityProgram.loc_blurIntensityModifier, this.shadowBlurIntensityModifier);

    const shadowHighQualityProgram = shaderCache.programForKey('ShadowHighQuality');
    shadowHighQualityProgram.use();
    shadowHighQualityProgram.setUniformLocationWith1f(shadowHighQualityProgram.loc_intensity, this.shadowIntensity);
    shadowHighQualityProgram.setUniformLocationWith1f(shadowHighQualityProgram.loc_blurShiftModifier, this.shadowBlurShiftModifier);
    shadowHighQualityProgram.setUniformLocationWith1f(shadowHighQualityProgram.loc_blurIntensityModifier, this.shadowBlurIntensityModifier);

    const energyBallProgram = shaderCache.programForKey('EnergyBall');
    energyBallProgram.use();
    energyBallProgram.setUniformLocationWith1f(energyBallProgram.loc_timeScale, 5.0);
    energyBallProgram.setUniformLocationWith1f(energyBallProgram.loc_noiseLevel, 10.0);

    const fireRingProgram = shaderCache.programForKey('FireRing');
    fireRingProgram.use();
    fireRingProgram.setUniformLocationWith1f(fireRingProgram.loc_phase, 0.5);
    fireRingProgram.setUniformLocationWith3f(fireRingProgram.loc_color, 0.2, 0.6, 1.0);

    const whiteCloudVignetteProgram = shaderCache.programForKey('WhiteCloudVignette');
    whiteCloudVignetteProgram.use();
    whiteCloudVignetteProgram.setUniformLocationWith1f(whiteCloudVignetteProgram.loc_noiseAmount, 1.0);
    whiteCloudVignetteProgram.setUniformLocationWith1f(whiteCloudVignetteProgram.loc_vignetteAmount, 1.0);

    const toneCurveProgram = shaderCache.programForKey('ToneCurve');
    toneCurveProgram.use();
    toneCurveProgram.setUniformLocationWith1f(toneCurveProgram.loc_amount, this.getToneCurveAmount());

    const glowImageMapControlProgram = shaderCache.programForKey('GlowImageMapControl');
    glowImageMapControlProgram.use();
    glowImageMapControlProgram.setUniformLocationWith1f(glowImageMapControlProgram.loc_intensity, 1.0);
    glowImageMapControlProgram.setUniformLocationWith1f(glowImageMapControlProgram.loc_gamma, 1.0);
    glowImageMapControlProgram.setUniformLocationWith1f(glowImageMapControlProgram.loc_levelsInWhite, 255.0);
    glowImageMapControlProgram.setUniformLocationWith1f(glowImageMapControlProgram.loc_levelsInBlack, 0.0);
    glowImageMapControlProgram.setUniformLocationWith3f(glowImageMapControlProgram.loc_color, 37, 176, 255);

    // var noiseRaysProgram = shaderCache.programForKey("FbmNoiseRays");
    // noiseRaysProgram.use();
    // noiseRaysProgram.setUniformLocationWith2f(fireWaveProgram.loc_texResolution, cc.winSize.width, cc.winSize.height);

    // var noiseGradientMaskProgram = shaderCache.programForKey("FbmNoiseGradientMask");
    // noiseGradientMaskProgram.use();

    const glowImageMapRippleProgram = shaderCache.programForKey('GlowImageMapRipple');
    glowImageMapRippleProgram.use();
    glowImageMapRippleProgram.setUniformLocationWith1f(glowImageMapRippleProgram.loc_intensity, 1.0);

    const cardAngleGradientShineProgram = shaderCache.programForKey('CardAngledGradientShine');
    cardAngleGradientShineProgram.use();
    cardAngleGradientShineProgram.setUniformLocationWith1f(cardAngleGradientShineProgram.loc_intensity, 1.0);
    cardAngleGradientShineProgram.setUniformLocationWith1f(cardAngleGradientShineProgram.loc_phase, 0.0);
  },

  _initTime() {
    this.resetTime();
  },

  resetTime() {
    // start time higher to avoid artifacts caused by low time
    this.time = 1000.0;
    this.loopingTime = 0.0;
    this._loopingTimeOverflow = 0.0;
    this.loopingDirectionalTime = 0.0;
    this._loopingDirectionalTimeOverflow = 0.0;
    this._loopingDirection = 1.0;
  },

  /**
   * Creates framebuffers for post processing. Will automatically release/cleanup any existing framebuffers.
   */
  createPasses() {
    this.setScreenCacheDirty();
    this.setSurfaceCacheDirty();

    if (this.passes.cache != null) { this.passes.cache.release(); }
    this.passes.cache = RenderPass.create(cc.Texture2D.PIXEL_FORMAT_RGBA8888, cc.winSize.width, cc.winSize.height, 1, false);
    if (this.passes.screen != null) { this.passes.screen.release(); }
    this.passes.screen = RenderPass.create(cc.Texture2D.PIXEL_FORMAT_RGBA8888, cc.winSize.width, cc.winSize.height, 1, false);
    if (this.passes.blurComposite != null) { this.passes.blurComposite.release(); }
    this.passes.blurComposite = RenderPass.create(cc.Texture2D.PIXEL_FORMAT_RGBA8888, cc.winSize.width, cc.winSize.height, 1.0, true);
    if (this.passes.surfaceA != null) { this.passes.surfaceA.release(); }
    this.passes.surfaceA = RenderPass.create(cc.Texture2D.PIXEL_FORMAT_RGBA8888, cc.winSize.width, cc.winSize.height, 1, false);
    if (this.passes.surfaceB != null) { this.passes.surfaceB.release(); }
    this.passes.surfaceB = RenderPass.create(cc.Texture2D.PIXEL_FORMAT_RGBA8888, cc.winSize.width, cc.winSize.height, 1, false);
    if (this.passes.depth != null) { this.passes.depth.release(); }
    this.passes.depth = RenderPass.create(cc.Texture2D.PIXEL_FORMAT_RGBA8888, cc.winSize.width, cc.winSize.height, 1, false);
    if (this.passes.highpass != null) { this.passes.highpass.release(); }
    this.passes.highpass = RenderPass.create(cc.Texture2D.PIXEL_FORMAT_RGBA8888, cc.winSize.width, cc.winSize.height, this.bloomScale, true);
    if (this.passes.blur != null) { this.passes.blur.release(); }
    this.passes.blur = RenderPass.create(cc.Texture2D.PIXEL_FORMAT_RGBA8888, cc.winSize.width, cc.winSize.height, this.bloomScale, true);
    if (this.passes.bloom != null) { this.passes.bloom.release(); }
    this.passes.bloom = RenderPass.create(cc.Texture2D.PIXEL_FORMAT_RGBA8888, cc.winSize.width, cc.winSize.height, this.bloomScale, true);
    if (this.passes.bloomCompositeA != null) { this.passes.bloomCompositeA.release(); }
    this.passes.bloomCompositeA = RenderPass.create(cc.Texture2D.PIXEL_FORMAT_RGBA8888, cc.winSize.width, cc.winSize.height, this.bloomScale, true);
    if (this.passes.bloomCompositeB != null) { this.passes.bloomCompositeB.release(); }
    this.passes.bloomCompositeB = RenderPass.create(cc.Texture2D.PIXEL_FORMAT_RGBA8888, cc.winSize.width, cc.winSize.height, this.bloomScale, true);
    if (this.passes.radialBlur != null) { this.passes.radialBlur.release(); }
    this.passes.radialBlur = RenderPass.create(cc.Texture2D.PIXEL_FORMAT_RGBA8888, cc.winSize.width, cc.winSize.height, 1.0, false);
    if (this.passes.toneCurve != null) { this.passes.toneCurve.release(); }
    this.passes.toneCurve = RenderPass.create(cc.Texture2D.PIXEL_FORMAT_RGBA8888, cc.winSize.width, cc.winSize.height, 1.0, false);
    if (this.passes.gradientColorMap != null) { this.passes.gradientColorMap.release(); }
    this.passes.gradientColorMap = RenderPass.create(cc.Texture2D.PIXEL_FORMAT_RGBA8888, cc.winSize.width, cc.winSize.height, 1.0, false);
  },

  /**
   * Resizes all FX properties and framebuffers. Use when resizing application.
   */
  resize() {
    Logger.module('ENGINE').log('FX.resize');
    this.createPasses();
    this.updateShaderResolutionUniforms();
  },

  /**
   * Updates all shader uniforms that are based on window resolution/size.
   */
  updateShaderResolutionUniforms() {
    const { shaderCache } = cc;

    const depthProgram = shaderCache.programForKey('Depth');
    depthProgram.use();
    depthProgram.setUniformLocationWith2f(depthProgram.loc_resolution, cc.winSize.width, cc.winSize.height);

    const depthTestProgram = shaderCache.programForKey('DepthTest');
    depthTestProgram.use();
    depthTestProgram.setUniformLocationWith2f(depthTestProgram.loc_resolution, cc.winSize.width, cc.winSize.height);

    const fxaaProgram = shaderCache.programForKey('FXAA');
    fxaaProgram.use();
    fxaaProgram.setUniformLocationWith2f(fxaaProgram.loc_resolution, cc.winSize.width, cc.winSize.height);

    const glowNoiseProgram = shaderCache.programForKey('GlowNoise');
    glowNoiseProgram.use();
    glowNoiseProgram.setUniformLocationWith2f(glowNoiseProgram.loc_resolution, cc.winSize.width, cc.winSize.height);

    const glowProgram = shaderCache.programForKey('Glow');
    glowProgram.use();
    glowProgram.setUniformLocationWith2f(glowProgram.loc_resolution, cc.winSize.width, cc.winSize.height);

    const chromaticProgram = shaderCache.programForKey('Chromatic');
    chromaticProgram.use();
    chromaticProgram.setUniformLocationWith2f(chromaticProgram.loc_resolution, cc.winSize.width, cc.winSize.height);

    const lightingProgram = shaderCache.programForKey('Lighting');
    lightingProgram.use();
    lightingProgram.setUniformLocationWith1f(lightingProgram.loc_depthRange, cc.winSize.height);

    const distortionProgram = shaderCache.programForKey('Distortion');
    distortionProgram.use();
    distortionProgram.setUniformLocationWith2f(distortionProgram.loc_resolution, cc.winSize.width, cc.winSize.height);

    const waterProgram = shaderCache.programForKey('Water');
    waterProgram.use();
    waterProgram.setUniformLocationWith2f(waterProgram.loc_resolution, cc.winSize.width, cc.winSize.height);

    const shockwaveProgram = shaderCache.programForKey('Shockwave');
    shockwaveProgram.use();
    shockwaveProgram.setUniformLocationWith2f(shockwaveProgram.loc_resolution, cc.winSize.width, cc.winSize.height);

    const vortexProgram = shaderCache.programForKey('Vortex');
    vortexProgram.use();
    vortexProgram.setUniformLocationWith2f(vortexProgram.loc_resolution, cc.winSize.width, cc.winSize.height);

    const fireWaveProgram = shaderCache.programForKey('FireLinearWave');
    fireWaveProgram.use();
    fireWaveProgram.setUniformLocationWith2f(fireWaveProgram.loc_resolution, cc.winSize.width, cc.winSize.height);
  },

  /**
   * Resets all FX properties and framebuffers. Use this when switching between scenes.
   */
  reset() {
    Logger.module('ENGINE').log('FX.reset');
    this._redirectingToSurfacePass = this._redirectingToScreenPass = false;

    this.resetTime();

    this.lights.length = 0;
    this.shadowCastingLights.length = 0;
    this.occluders.length = 0;
    this.shadowCasters.length = 0;
    this.decals.length = 0;
    this.distortions.length = 0;

    this.batchLights.reset();
    this.batchShadowCastingLights.reset();

    this.passes.cache.beginWithClear();
    this.passes.cache.end();
    this.passes.screen.beginWithClear();
    this.passes.screen.end();
    this.passes.blurComposite.beginWithClear();
    this.passes.blurComposite.end();
    this.passes.surfaceA.beginWithClear();
    this.passes.surfaceA.end();
    this.passes.surfaceB.beginWithClear();
    this.passes.surfaceB.end();
    this.passes.depth.beginWithClear(255.0, 255.0, 255.0, 255.0);
    this.passes.depth.end();
    this.passes.highpass.beginWithClear();
    this.passes.highpass.end();
    this.passes.blur.beginWithClear();
    this.passes.blur.end();
    this.passes.bloom.beginWithClear();
    this.passes.bloom.end();
    this.passes.bloomCompositeA.beginWithClear();
    this.passes.bloomCompositeA.end();
    this.passes.bloomCompositeB.beginWithClear();
    this.passes.bloomCompositeB.end();
    this.passes.radialBlur.beginWithClear();
    this.passes.radialBlur.end();
    this.passes.toneCurve.beginWithClear();
    this.passes.toneCurve.end();
    this.passes.gradientColorMap.beginWithClear();
    this.passes.gradientColorMap.end();

    this._refractMap = null;
    this._currentSurfacePass = null;
    this._currentBloomCompositePass = null;
    this._previousBloomCompositePass = null;
  },

  /**
   * Resets and releases/deallocates all FX properties and framebuffers. Use this when switching shutting down.
   */
  release() {
    Logger.module('ENGINE').log('FX.release');
    this.reset();

    cc.director.getScheduler().unscheduleUpdateForTarget(this);

    this.batchLights.release();
    this.batchShadowCastingLights.release();

    this.passes.cache.release();
    this.passes.screen.release();
    this.passes.blurComposite.release();
    this.passes.surfaceA.release();
    this.passes.surfaceB.release();
    this.passes.depth.release();
    this.passes.highpass.release();
    this.passes.blur.release();
    this.passes.bloom.release();
    this.passes.bloomCompositeA.release();
    this.passes.bloomCompositeB.release();
    this.passes.radialBlur.release();
  },

  /**
   * Returns fx event bus.
   * @returns {EventBus}
   */
  getEventBus() {
    return this._eventBus;
  },

  /**
   * Returns a render cmd to begin surface compositing.
   * @returns {RenderCmd}
   */
  getBeginSurfaceCompositeRenderCmd() {
    return this._beginSurfaceCompositeRenderCmd;
  },

  /**
   * Returns a render cmd to end surface compositing.
   * @returns {RenderCmd}
   */
  getEndSurfaceCompositeRenderCmd() {
    return this._endSurfaceCompositeRenderCmd;
  },

  /**
   * Returns the current global fx time.
   * @returns {Number} global fx time
   */
  getTime() {
    return this.time;
  },

  /**
   * Returns the current global frame delta time.
   * @returns {Number} delta time
   */
  getDeltaTime() {
    return this.deltaTime;
  },

  /**
   * Returns the current global fx looping time between 0 and 1, modified by a frequency.
   * @returns {Number} global fx time
   */
  getLoopingTimeForFrequency(frequency) {
    return (this.time * frequency) % 1.0;
  },

  /**
   * Returns the current global fx looping time between 0 and 1.
   * @returns {Number} global fx looping time
   */
  getLoopingTime() {
    return this.loopingTime;
  },

  /**
   * Returns the current global fx directional looping time between 0 and 1 and 0.
   * @returns {Number} global fx directional looping time
   */
  getLoopingDirectionalTime() {
    return this.loopingDirectionalTime;
  },

  /**
   * Request blur of entire screen.
   * @param {String|Number|Integer} id
   */
  requestBlurScreen(id) {
    if (id != null) {
      if (!_.contains(this._blurScreenRequests, id)) {
        const numRequests = this._blurScreenRequests.length;
        this._blurScreenRequests.push(id);
        if (numRequests === 0 && this._blurScreenRequests.length === 1) {
          this.getEventBus().trigger(EVENTS.blur_screen_start, { type: EVENTS.blur_screen_start });
        }
      }
    } else {
      Logger.module('ENGINE').error('FX.requestBlurScreen -> requires id');
    }
  },

  /**
   * Request unblur of entire screen. Will only stop blur when this is last request.
   * @param {String|Number|Integer} id
   */
  requestUnblurScreen(id) {
    if (id != null) {
      const indexOf = _.lastIndexOf(this._blurScreenRequests, id);
      if (indexOf !== -1) {
        const numRequests = this._blurScreenRequests.length;
        this._blurScreenRequests.splice(indexOf, 1);
        if (numRequests === 1 && this._blurScreenRequests.length === 0) {
          this.getEventBus().trigger(EVENTS.blur_screen_stop, { type: EVENTS.blur_screen_stop });
        }
      }
    } else {
      Logger.module('ENGINE').error('FX.requestUnblurScreen -> requires id');
    }
  },

  getIsBlurringScreen() {
    return this._blurScreenRequests.length > 0;
  },

  /**
   * Request blur of surface/post processed content.
   * @param {String|Number|Integer} id
   */
  requestBlurSurface(id) {
    if (id != null) {
      if (!_.contains(this._blurSurfaceRequests, id)) {
        const numRequests = this._blurSurfaceRequests.length;
        this._blurSurfaceRequests.push(id);
        if (numRequests === 0 && this._blurSurfaceRequests.length === 1) {
          this.getEventBus().trigger(EVENTS.blur_surface_start, { type: EVENTS.blur_surface_start });
        }
      }
    } else {
      Logger.module('ENGINE').error('FX.requestBlurSurface -> requires id');
    }
  },

  /**
   * Request unblur of surface/post processed content. Will only stop blur when this is last request.
   * @param {String|Number|Integer} id
   */
  requestUnblurSurface(id) {
    if (id != null) {
      const indexOf = _.lastIndexOf(this._blurSurfaceRequests, id);
      if (indexOf !== -1) {
        const numRequests = this._blurSurfaceRequests.length;
        this._blurSurfaceRequests.splice(indexOf, 1);
        if (numRequests === 1 && this._blurSurfaceRequests.length === 0) {
          this.getEventBus().trigger(EVENTS.blur_surface_stop, { type: EVENTS.blur_surface_stop });
        }
      }
    } else {
      Logger.module('ENGINE').error('FX.requestUnblurSurface -> requires id');
    }
  },

  getIsBlurringSurface() {
    // don't allow surface blur when blurring screen
    return !this.getIsBlurringScreen() && this._blurSurfaceRequests.length > 0;
  },

  /**
   * Request start screen caching.
   */
  requestStartScreenCache() {
    if (!this._cacheScreenRequested) {
      this.requestStopSurfaceCache();
      this._cacheScreenRequested = true;
    }
  },

  /**
   * Request stop screen caching.
   */
  requestStopScreenCache() {
    if (this._cacheScreenRequested) {
      this._cacheScreenRequested = false;
    }
  },

  /**
   * Set screen cache dirty and force an update.
   */
  setScreenCacheDirty() {
    if (this._cachingScreen && !this._cachingScreenDirty) {
      this._cachingScreenDirty = true;
      this.getEventBus().trigger(EVENTS.caching_screen_dirty, { type: EVENTS.caching_screen_dirty });
    }
  },
  getScreenCacheDirty() {
    return this._cachingScreenDirty;
  },

  /**
   * Set surface cache dirty and force an update.
   */
  setSurfaceCacheDirty() {
    if (this._cachingSurface && !this._cachingSurfaceDirty) {
      this._cachingSurfaceDirty = true;
      this.getEventBus().trigger(EVENTS.caching_surface_dirty, { type: EVENTS.caching_surface_dirty });
    }
  },
  getSurfaceCacheDirty() {
    return this._cachingSurfaceDirty;
  },

  /**
   * Whether screen drawing will be cached.
   */
  getScreenCacheRequested() {
    return this._cacheScreenRequested;
  },

  /**
   * Whether screen drawing is cached.
   */
  getIsCachingScreen() {
    return this._cachingScreen;
  },

  _startCachingScreen() {
    if (!this._cachingScreen) {
      this._cachingScreen = true;
      this.getEventBus().trigger(EVENTS.caching_screen_start, { type: EVENTS.caching_screen_start });
    }
  },

  _stopCachingScreen() {
    if (this._cachingScreen) {
      this._cachingScreenDirty = false;
      this._cachingScreen = false;
      this.getEventBus().trigger(EVENTS.caching_screen_stop, { type: EVENTS.caching_screen_stop });
    }
  },

  /**
   * Request start surface caching.
   */
  requestStartSurfaceCache() {
    if (!this._cacheSurfaceRequested) {
      this.requestStopScreenCache();
      this._cacheSurfaceRequested = true;
    }
  },

  /**
   * Request stop surface caching.
   */
  requestStopSurfaceCache() {
    if (this._cacheSurfaceRequested) {
      this._cacheSurfaceRequested = false;
    }
  },

  /**
   * Whether surface/post processing drawing will be cached.
   */
  getSurfaceCacheRequested() {
    return this._cacheSurfaceRequested;
  },

  /**
   * Whether surface/post processing drawing is cached.
   */
  getIsCachingSurface() {
    return this._cachingSurface;
  },

  _startCachingSurface() {
    if (!this._cachingSurface) {
      this._cachingSurface = true;
      this.getEventBus().trigger(EVENTS.caching_surface_start, { type: EVENTS.caching_surface_start });
    }
  },

  _stopCachingSurface() {
    if (this._cachingSurface) {
      this._cachingSurfaceDirty = false;
      this._cachingSurface = false;
      this.getEventBus().trigger(EVENTS.caching_surface_stop, { type: EVENTS.caching_surface_stop });
    }
  },

  /* region INSTANCING */

  /**
   * Adds a sprite as an instance. Instanced sprites all reference the same (dynamic) texture, but may be different sizes.
   * @param {String} instancingId
   * @param {cc.Sprite} instancedSprite
   */
  addInstance(instancingId, instancedSprite) {
    let instances = this._instancesById[instancingId];

    // generate list of instances as needed
    if (instances == null) {
      instances = this._instancesById[instancingId] = [];
    }

    if (!_.contains(instances, instancedSprite)) {
      // add instance to list
      instances.push(instancedSprite);

      // flag this instancing as dirty
      this.setInstancesDirty(instancingId);
    }
  },

  /**
   * Removes a sprite as an instance.
   * @param {String} instancingId
   * @param {cc.Sprite} instancedSprite
   */
  removeInstance(instancingId, instancedSprite) {
    const instances = this._instancesById[instancingId];
    if (instances != null) {
      const index = _.indexOf(instances, instancedSprite);
      if (index != -1) {
        // remove instance from list
        instances.splice(index, 1);

        // cleanup instance
        this._cleanupInstance(instancedSprite);

        // flag this instancing as dirty
        this.setInstancesDirty(instancingId);
      }
    }
  },

  /**
   * Sets a group of instances as dirty, forcing a rebuild on next frame.
   * @param {String} instancingId
   */
  setInstancesDirty(instancingId) {
    this._instancesDirtyById[instancingId] = true;
  },

  /**
   * Returns the render pass for a group of instances.
   * @param {String} instancingId
   * @returns {RenderPass}
   */
  getInstancedRenderPass(instancingId) {
    return this._instancedRenderPassesById[instancingId];
  },

  /**
   * Returns the render texture for a group of instances.
   * @param {String} instancingId
   * @returns {RenderPass}
   */
  getInstancedTexture(instancingId) {
    const instancedRenderPass = this.getInstancedRenderPass(instancingId);
    return instancedRenderPass && instancedRenderPass.getTexture();
  },

  _renderForInstancing() {
    const instancingIds = Object.keys(this._instancesById);
    for (let i = 0, il = instancingIds.length; i < il; i++) {
      const instancingId = instancingIds[i];

      // rebuild
      if (this._instancesDirtyById[instancingId]) {
        this._rebuildInstancedRenderPass(instancingId);
      }

      // render once using the renderingForInstancing method as defined by the first instance
      const instances = this._instancesById[instancingId];
      const instancedRenderPass = this._instancedRenderPassesById[instancingId];
      if (instances != null && instancedRenderPass != null) {
        const instancedRenderMethod = instances[0].getRenderingForInstancing();
        instancedRenderMethod(this, instancingId, instancedRenderPass, instances);
      }
    }
  },
  _rebuildInstancedRenderPass(instancingId) {
    this._instancesDirtyById[instancingId] = false;

    const instances = this._instancesById[instancingId];
    if (instances != null && instances.length > 0) {
      // find max width/height from instances
      let width = 0;
      let height = 0;
      for (var i = 0, il = instances.length; i < il; i++) {
        var instancedSprite = instances[i];
        if (instancedSprite.isRunning() && instancedSprite.isVisible()) {
          if (instancedSprite._contentSize.width > width) {
            width = instancedSprite._contentSize.width;
          }
          if (instancedSprite._contentSize.height > height) {
            height = instancedSprite._contentSize.height;
          }
        }
      }

      // rebuild or release
      let instancedRenderPass = this._instancedRenderPassesById[instancingId];
      if (width === 0 || height === 0) {
        if (instancedRenderPass != null) {
          instancedRenderPass.release();
          delete this._instancedRenderPassesById[instancingId];
        }
      } else {
        if (instancedRenderPass == null) {
          instancedRenderPass = this._instancedRenderPassesById[instancingId] = new RenderPass(cc.Texture2D.PIXEL_FORMAT_RGBA8888, width, height, 1, true);
        } else if (instancedRenderPass.getWidth() !== width || instancedRenderPass.getHeight() !== height) {
          instancedRenderPass.rebuild(cc.Texture2D.PIXEL_FORMAT_RGBA8888, width, height, 1, true);
        }

        // assign render pass texture to all instances
        // do not use setTexture, as it will modify the size of the instance
        for (var i = 0, il = instances.length; i < il; i++) {
          var instancedSprite = instances[i];
          instancedSprite._texture = instancedRenderPass.getTexture();
        }
      }
    } else {
      this._stopInstancing(instancingId);
    }
  },
  _stopInstancing(instancingId) {
    const instances = this._instancesById[instancingId];
    if (instances != null) {
      for (let i = 0, il = instances.length; i < il; i++) {
        this._cleanupInstance(instances[i]);
      }
      delete this._instancesById[instancingId];
    }
    const instancedRenderPass = this._instancedRenderPassesById[instancingId];
    if (instancedRenderPass != null) {
      instancedRenderPass.release();
      delete this._instancedRenderPassesById[instancingId];
    }
    delete this._instancesDirtyById[instancingId];
  },
  _cleanupInstance(instancedSprite) {
    // remove instance texture reference
    // do not use setTexture, as it will modify the size of the instance
    instancedSprite._texture = null;
  },

  /* endregion INSTANCING */

  getToneCurveAmount() {
    return this.toneCurveAmount;
  },

  setToneCurveAmount(val) {
    this.toneCurveAmount = val;
  },

  setAmbientLightColor(color) {
    const { ambientLightColor } = this;
    if (ambientLightColor
        && (ambientLightColor.r !== color.r
        || ambientLightColor.g !== color.g
        || ambientLightColor.b !== color.b)) {
      // use a plain object so that the values can go negative
      // cocos doesn't allow negative color values
      this.ambientLightColor = { r: color.r, g: color.g, b: color.b };
    }
  },
  getAmbientLightColor() {
    return this.ambientLightColor;
  },
  setFalloffModifier(value) {
    this.falloffModifier = value;
  },
  setIntensityModifier(value) {
    this.intensityModifier = value;
  },
  setShadowIntensity(value) {
    this.shadowIntensity = value;

    const shadowLowQualityProgram = cc.shaderCache.programForKey('ShadowLowQuality');
    shadowLowQualityProgram.use();
    shadowLowQualityProgram.setUniformLocationWith1f(shadowLowQualityProgram.loc_intensity, this.shadowIntensity);

    const shadowHighQualityProgram = cc.shaderCache.programForKey('ShadowHighQuality');
    shadowHighQualityProgram.use();
    shadowHighQualityProgram.setUniformLocationWith1f(shadowHighQualityProgram.loc_intensity, this.shadowIntensity);
  },
  setShadowBlurShiftModifier(value) {
    this.shadowBlurShiftModifier = value;

    const shadowLowQualityProgram = cc.shaderCache.programForKey('ShadowLowQuality');
    shadowLowQualityProgram.use();
    shadowLowQualityProgram.setUniformLocationWith1f(shadowLowQualityProgram.loc_blurShiftModifier, this.shadowBlurShiftModifier);

    const shadowHighQualityProgram = cc.shaderCache.programForKey('ShadowHighQuality');
    shadowHighQualityProgram.use();
    shadowHighQualityProgram.setUniformLocationWith1f(shadowHighQualityProgram.loc_blurShiftModifier, this.shadowBlurShiftModifier);
  },
  setShadowBlurIntensityModifier(value) {
    this.shadowBlurIntensityModifier = value;

    const shadowLowQualityProgram = cc.shaderCache.programForKey('ShadowLowQuality');
    shadowLowQualityProgram.use();
    shadowLowQualityProgram.setUniformLocationWith1f(shadowLowQualityProgram.loc_blurIntensityModifier, this.shadowBlurIntensityModifier);

    const shadowHighQualityProgram = cc.shaderCache.programForKey('ShadowHighQuality');
    shadowHighQualityProgram.use();
    shadowHighQualityProgram.setUniformLocationWith1f(shadowHighQualityProgram.loc_blurIntensityModifier, this.shadowBlurIntensityModifier);
  },
  setBloomThreshold(value) {
    this.bloomThreshold = value;
  },
  getBloomThreshold() {
    return this.bloomThreshold;
  },
  setBloomIntensity(value) {
    this.bloomIntensity = value;
  },
  getBloomIntensity() {
    return this.bloomIntensity;
  },
  setBloomTransition(value) {
    this.bloomTransition = value;
  },
  getBloomScale() {
    return this.bloomScale;
  },
  setBloomScale(value) {
    if (this.bloomScale !== value) {
      this.bloomScale = value;
      this.resize();
    }
  },
  setWindDirection(windDirection) {
    this.windDirection = UtilsPosition.normalizePosition(windDirection);
  },
  getWindDirection() {
    return this.windDirection;
  },
  setRadialBlurPosition(radialBlurPosition) {
    this.setRadialBlurScreenPct(cc.p(radialBlurPosition.x / cc.winSize.width, radialBlurPosition.y / cc.winSize.height));
  },
  setRadialBlurScreenPct(radialBlurScreenPct) {
    this.radialBlurScreenPct = radialBlurScreenPct;
  },
  setRadialBlurRamp(radialBlurRamp) {
    this.radialBlurRamp = radialBlurRamp;
  },
  setRadialBlurSpread(radialBlurSpread) {
    this.radialBlurSpread = radialBlurSpread;
  },
  getRadialBlurSpread() {
    return this.radialBlurSpread;
  },
  setRadialBlurDecay(radialBlurDecay) {
    this.radialBlurDecay = radialBlurDecay;
  },
  setRadialBlurDeadZone(radialBlurDeadZone) {
    this.radialBlurDeadZone = radialBlurDeadZone;
  },
  getRadialBlurDeadZone() {
    return this.radialBlurDeadZone;
  },
  setRadialBlurStrength(radialBlurStrength) {
    this.radialBlurStrength = radialBlurStrength;
  },
  getRadialBlurStrength() {
    return this.radialBlurStrength;
  },

  // gradient color map region

  /**
   * Sets the current Gradient Color Map FROM white color point.
   * @param     {cc.Color}     color   The color to set for this value.
   */
  setFromGradientColorMapWhiteColor(color) {
    if (!cc.colorEqual(this._fromGradientColorMapWhiteColor, color)) {
      this._fromGradientColorMapWhiteColor = color;
      this._gradientMapDirty = true;
    }
  },

  /**
   * Sets the current Gradient Color Map FROM mid color point.
   * @param     {cc.Color}     color   The color to set for this value.
   */
  setFromGradientColorMapMidColor(color) {
    if (!cc.colorEqual(this._fromGradientColorMapMidColor, color)) {
      this._fromGradientColorMapMidColor = color;
      this._gradientMapDirty = true;
    }
  },

  /**
   * Sets the current Gradient Color Map FROM black color point.
   * @param     {cc.Color}     color   The color to set for this value.
   */
  setFromGradientColorMapBlackColor(color) {
    if (!cc.colorEqual(this._fromGradientColorMapBlackColor, color)) {
      this._fromGradientColorMapBlackColor = color;
      this._gradientMapDirty = true;
    }
  },

  /**
   * Sets the current Gradient Color Map TO white color point.
   * @param     {cc.Color}     color   The color to set for this value.
   */
  setToGradientColorMapWhiteColor(color) {
    if (!cc.colorEqual(this._toGradientColorMapWhiteColor, color)) {
      this._toGradientColorMapWhiteColor = color;
      this._gradientMapDirty = true;
    }
  },

  /**
   * Sets the current Gradient Color Map TO black color point.
   * @param     {cc.Color}     color   The color to set for this value.
   */
  setToGradientColorMapBlackColor(color) {
    if (!cc.colorEqual(this._toGradientColorMapBlackColor, color)) {
      this._toGradientColorMapBlackColor = color;
      this._gradientMapDirty = true;
    }
  },

  /**
   * Sets the current Gradient Color Map TO mid color point.
   * @param     {cc.Color}     color   The color to set for this value.
   */
  setToGradientColorMapMidColor(color) {
    if (!cc.colorEqual(this._toGradientColorMapMidColor, color)) {
      this._toGradientColorMapMidColor = color;
      this._gradientMapDirty = true;
    }
  },

  /**
   * Gets the current Gradient Color Map TO white color point.
   * @return     {cc.Color}     color   The color value.
   */
  getToGradientColorMapWhiteColor() {
    return this._toGradientColorMapWhiteColor;
  },

  /**
   * Gets the current Gradient Color Map TO black color point.
   * @return     {cc.Color}     color   The color value.
   */
  getToGradientColorMapBlackColor() {
    return this._toGradientColorMapBlackColor;
  },

  /**
   * Gets the current Gradient Color Map FROM white color point.
   * @return     {cc.Color}     color   The color value.
   */
  getFromGradientColorMapWhiteColor() {
    return this._fromGradientColorMapWhiteColor;
  },

  /**
   * Gets the current Gradient Color Map FROM black color point.
   * @return     {cc.Color}     color   The color value.
   */
  getFromGradientColorMapBlackColor() {
    return this._fromGradientColorMapBlackColor;
  },

  /**
   * Sets the 0.0 to 1.0 amount of the gradient color map from/to transition.
   * @param     {Number}     phase   Value of 0.0 to 1.0 of the period / phase of the transition from one to other color map.
   */
  setGradientMapTransitionPhase(phase) {
    if (this._gradientMapTransitionPhase != phase) {
      this._gradientMapTransitionPhase = phase;
      this._gradientMapDirty = true;
    }
  },

  /**
   * Gets the current Gradient Color Map white color point accounting for phase.
   * @return     {cc.Color}     color   The color value.
   */
  getPhaseGradientColorMapWhiteColor() {
    const p = this._gradientMapTransitionPhase;
    const ps = p * p * (3.0 - 2.0 * p);
    const ips = 1.0 - ps;
    const fw = this._fromGradientColorMapWhiteColor;
    const tw = this._toGradientColorMapWhiteColor;
    return {
      r: fw.r * ips + tw.r * ps,
      g: fw.g * ips + tw.g * ps,
      b: fw.b * ips + tw.b * ps,
      a: fw.a * ips + tw.a * ps,
    };
  },

  /**
   * Gets the current Gradient Color Map mid color point accounting for phase.
   * @return     {cc.Color}     color   The color value.
   */
  getPhaseGradientColorMapMidColor() {
    const p = this._gradientMapTransitionPhase;
    const ps = p * p * (3.0 - 2.0 * p);
    const ips = 1.0 - ps;
    const fm = this._fromGradientColorMapMidColor;
    const tm = this._toGradientColorMapMidColor;
    return {
      r: fm.r * ips + tm.r * ps,
      g: fm.g * ips + tm.g * ps,
      b: fm.b * ips + tm.b * ps,
      a: fm.a * ips + tm.a * ps,
    };
  },

  /**
   * Gets the current Gradient Color Map black color point accounting for phase.
   * @return     {cc.Color}     color   The color value.
   */
  getPhaseGradientColorMapBlackColor() {
    const p = this._gradientMapTransitionPhase;
    const ps = p * p * (3.0 - 2.0 * p);
    const ips = 1.0 - ps;
    const fb = this._fromGradientColorMapBlackColor;
    const tb = this._toGradientColorMapBlackColor;
    return {
      r: fb.r * ips + tb.r * ps,
      g: fb.g * ips + tb.g * ps,
      b: fb.b * ips + tb.b * ps,
      a: fb.a * ips + tb.a * ps,
    };
  },

  /**
   * Sets the current Gradient Color Map to a target.
   * @param {Number} id
   * @param {Number} [duration=0.0]
   * @param {cc.Color} [toColorWhite=0] target white point
   * @param {cc.Color} [toColorBlack=0] target black point
   * @param {cc.Color} [toColorMid=0] target mid point )optional
   */
  showGradientColorMap(id, duration, toColorWhite, toColorBlack, toColorMid) {
    if (duration == null) { duration = 0.0; }

    // stop current top of stack
    if (this._gradientMapStack.length > 0) {
      const currentGradientMapData = this._gradientMapStack[this._gradientMapStack.length - 1];
      if (currentGradientMapData.action != null && !currentGradientMapData.action.isDone()) {
        this.getScene().stopAction(currentGradientMapData.action);
      }
    }

    // auto detect mid point if none is provided
    if (!toColorMid && toColorWhite && toColorBlack) {
      toColorMid = cc.color(
        cc.lerp(toColorWhite.r, toColorBlack.r, 0.5),
        cc.lerp(toColorWhite.g, toColorBlack.g, 0.5),
        cc.lerp(toColorWhite.b, toColorBlack.b, 0.5),
        cc.lerp(toColorWhite.a, toColorBlack.a, 0.5),
      );
    }

    // get from colors
    const fromColorWhite = this.getPhaseGradientColorMapWhiteColor();
    const fromColorMid = this.getPhaseGradientColorMapMidColor();
    const fromColorBlack = this.getPhaseGradientColorMapBlackColor();

    // find gradient map data
    let gradientMapData;
    let gradientMapDataIndex = -1;
    for (let i = 0, il = this._gradientMapStack.length; i < il; i++) {
      if (this._gradientMapStack[i].id === id) {
        gradientMapDataIndex = i;
        break;
      }
    }
    if (gradientMapDataIndex != -1) {
      if (gradientMapDataIndex === this._gradientMapStack.length - 1) {
        // get data and leave it on top
        gradientMapData = this._gradientMapStack[gradientMapDataIndex];
      } else {
        // extract data from wherever it is in stack and push to top
        gradientMapData = this._gradientMapStack.splice(gradientMapDataIndex, 1)[0];
        this._gradientMapStack.push(gradientMapData);
      }

      // check if the colors have changed
      if (toColorWhite != null && !cc.colorEqual(gradientMapData.toColorWhite, toColorWhite)) {
        gradientMapData.toColorWhite = toColorWhite;
      }
      if (toColorMid != null && !cc.colorEqual(gradientMapData.toColorMid, toColorMid)) {
        gradientMapData.toColorMid = toColorMid;
      }
      if (toColorBlack != null && !cc.colorEqual(gradientMapData.toColorBlack, toColorBlack)) {
        gradientMapData.toColorBlack = toColorBlack;
      }
    } else {
      // create gradient map data
      gradientMapData = {
        id,
        toColorWhite: toColorWhite || cc.color(0.0, 0.0, 0.0, 0.0),
        toColorMid: toColorMid || cc.color(0.0, 0.0, 0.0, 0.0),
        toColorBlack: toColorBlack || cc.color(0.0, 0.0, 0.0, 0.0),
        action: null,
      };

      // push gradient map to top of stack
      this._gradientMapStack.push(gradientMapData);
    }

    // run gradient map action
    gradientMapData.action = GradientColorMap.create(duration, fromColorWhite, fromColorMid, fromColorBlack, gradientMapData.toColorWhite, gradientMapData.toColorMid, gradientMapData.toColorBlack);
    this.getScene().runAction(gradientMapData.action);
  },

  /**
   * Helper method to clear the gradient color map, optionally with a duration.
   * @param {Number} id
   * @param [duration=0.0]
   */
  clearGradientColorMap(id, duration) {
    if (this._gradientMapStack.length > 0) {
      // find gradient map data index
      let gradientMapDataIndex = -1;
      for (let i = 0, il = this._gradientMapStack.length; i < il; i++) {
        if (this._gradientMapStack[i].id === id) {
          gradientMapDataIndex = i;
          break;
        }
      }
      if (gradientMapDataIndex !== -1) {
        if (gradientMapDataIndex === this._gradientMapStack.length - 1) {
          // pop top of stack
          this._gradientMapStack.pop();

          if (this._gradientMapStack.length > 0) {
            // transition gradient map to next
            const nextGradientMapData = this._gradientMapStack[this._gradientMapStack.length - 1];
            this.showGradientColorMap(nextGradientMapData.id, duration);
          } else {
            // transition to none gradient map
            this.showGradientColorMap(this._gradientMapNoneId, duration);
          }
        } else {
          // remove silently when not top of stack
          this._gradientMapStack.splice(gradientMapDataIndex, 1);
        }
      }
    }
  },

  /**
   * Gets the current refraction map/texture for fx such as distortion.
   * @returns {cc.Texture2D} refract map
   */
  getRefractMap() {
    return this._refractMap;
  },

  /**
   * Gets the depth render pass.
   * @returns {RenderPass} depth render pass
   */
  getDepthRenderPass() {
    return this.passes.depth;
  },

  /**
   * Gets the depth map/texture.
   * @returns {cc.Texture2D} depth map
   */
  getDepthMap() {
    return this.passes.depth.texture;
  },

  /**
   * Adds a light to the list of global lights.
   * @param {Light} light light
   * @param {Boolean} suppress whether to suppress setting lights as dirty
   */
  addLight(light, suppress) {
    if (UtilsJavascript.arrayCautiousAdd(this.lights, light) === -1 && !suppress) {
      this.setLightsDirty();
    }

    if (light.castsShadows) {
      if (UtilsJavascript.arrayCautiousAdd(this.shadowCastingLights, light) === -1 && !suppress) {
        this.setShadowCastingLightsDirty();
      }
    }
  },

  /**
   * Removes a light from the list of global lights.
   * @param {Light} light light
   * @param {Boolean} suppress whether to suppress setting lights as dirty
   */
  removeLight(light, suppress) {
    if (UtilsJavascript.arrayCautiousRemove(this.lights, light) !== -1 && !suppress) {
      this.setLightsDirty();
    }
    if (UtilsJavascript.arrayCautiousRemove(this.shadowCastingLights, light) !== -1 && !suppress) {
      this.setShadowCastingLightsDirty();
    }
  },

  /**
   * Adds a node to the list of occluder nodes.
   * @param {cc.Node} occluder occluder node
   */
  addOccluder(occluder) {
    UtilsJavascript.arrayCautiousAdd(this.occluders, occluder);
  },

  /**
   * Removes a node from the list of occluder nodes.
   * @param {cc.Node} occluder occluder node
   */
  removeOccluder(occluder) {
    UtilsJavascript.arrayCautiousRemove(this.occluders, occluder);
  },

  /**
   * Adds a node to the list of shadow casting nodes.
   * @param {cc.Node} shadowCaster shadow casting node
   */
  addShadowCaster(shadowCaster) {
    UtilsJavascript.arrayCautiousAdd(this.shadowCasters, shadowCaster);
  },

  /**
   * Removes a node from the list of shadow casting nodes.
   * @param {cc.Node} shadowCaster shadow casting node
   */
  removeShadowCaster(shadowCaster) {
    UtilsJavascript.arrayCautiousRemove(this.shadowCasters, shadowCaster);
  },

  /**
   * Returns a list of shadow casting nodes.
   * NOTE: do not modify this array directly!
   * @returns {Array}
   */
  getShadowCasters() {
    return this.shadowCasters;
  },

  /**
   * Removes a light and then adds it back to the top of the list of lights. Useful when a light does something such as start or stop casting shadows.
   * @param {Light} light light
   */
  reinsertLight(light) {
    this.removeLight(light, true);
    this.addLight(light);
  },

  /**
   * Forces lights and shadow casters to rebuild.
   * @param {Light} light light
   */
  setLightDirty(light) {
    this.setLightsDirty();

    if (light.castsShadows) {
      this.setShadowCastingLightsDirty();
    }
  },

  /**
   * Forces lights and occluders to rebuild.
   */
  setLightsDirty() {
    this.batchLights.setObjects(this.lights);
    for (let i = 0, il = this.occluders.length; i < il; i++) {
      this.occluders[i].setLightsDirty();
    }
  },

  /**
   * Forces shadow casting lights and occluders to rebuild.
   */
  setShadowCastingLightsDirty() {
    this.batchShadowCastingLights.setObjects(this.shadowCastingLights);
    for (let i = 0, il = this.shadowCasters.length; i < il; i++) {
      this.shadowCasters[i].setShadowCastingLightsDirty();
    }
  },
  getBatchLights() {
    return this.batchLights;
  },
  getBatchShadows() {
    return this.batchShadowCastingLights;
  },

  /**
   * Adds a node to the list of decal nodes and auto fades out oldest decal if we've reached the max decals shown on screen.
   * @param {cc.Node} decal decal node
   */
  addDecal(decal) {
    const index = UtilsJavascript.arrayCautiousAdd(this.decals, decal);
    if (index === -1) {
      // remove last decal when we've reached the limit
      while (this.decals.length > this.maxNumDecals) {
        this.fadeNextDecal();
      }
    }
  },

  /**
   * Removes a node from the list of decal nodes and auto fades it out.
   * @param {cc.Node} decal decal node
   */
  removeDecal(decal) {
    const index = UtilsJavascript.arrayCautiousRemove(this.decals, decal);
    if (index !== -1) {
      this.fadeDecal(decal);
    }
  },

  /**
   * Fades the oldest decal currently showing.
   */
  fadeNextDecal() {
    const decal = this.decals.shift();
    this.fadeDecal(decal);
  },

  /**
   * Fades a provided decal node.
   * @param {cc.Node} decal decal node
   */
  fadeDecal(decal) {
    decal.runAction(cc.sequence(
      cc.fadeOut(0.3),
      cc.callFunc(decal.destroy, decal),
    ));
  },

  /**
   * Sets the maximum number of decals that can be showing on screen at once.
   * @param {Number} maxNumDecals
   */
  setMaxNumDecals(maxNumDecals) {
    this.maxNumDecals = maxNumDecals;
  },

  /**
   * Adds a node to the list of distortion nodes and sets its refract map/texture to the world base framebuffer texture.
   * @param {cc.Node} distortion distortion node
   */
  addDistortion(distortion) {
    UtilsJavascript.arrayCautiousAdd(this.distortions, distortion);
    this.setDistortionsDirty();
  },

  /**
   * Removes a node from the list of distortion nodes and resets its refract map/texture.
   * @param {cc.Node} distortion distortion node
   */
  removeDistortion(distortion) {
    UtilsJavascript.arrayCautiousRemove(this.distortions, distortion);
  },

  /**
   * Forces distortions to rebuild.
   */
  setDistortionsDirty() {
    this._distortionsDirty = true;
  },

  _compareDistortions(a, b) {
    return (Number(b instanceof FXShockWaveSprite) - Number(a instanceof FXShockWaveSprite)) || (b.getWorldDepth() - a.getWorldDepth()) || (a.getWorldZOrder() - b.getWorldZOrder());
  },

  /**
   * Begins visit phase of fx.
   * NOTE: This should be called automatically at the beginning of the frame visit phase.
   */
  beginForVisit() {
    // calculate whether gradient color map is needed this frame
    if (this._gradientMapDirty) {
      const pgw = this.getPhaseGradientColorMapWhiteColor();
      const pgb = this.getPhaseGradientColorMapBlackColor();
      this._needsGradientColorMap = (pgw.r + pgw.g + pgw.b + pgw.a + pgb.r + pgb.g + pgb.b + pgb.a) > 0.0;
      if (this.getIsCachingScreen()) {
        this.setScreenCacheDirty();
      }
      if (this.getIsCachingSurface()) {
        this.setSurfaceCacheDirty();
      }
    }

    // update whether caching screen
    if (!this.getScreenCacheRequested() || this._cachingScreenDirty) {
      this._stopCachingScreen();
    }

    // update whether caching surface
    if (!this.getSurfaceCacheRequested() || this._cachingSurfaceDirty) {
      this._stopCachingSurface();
    }

    if (!this.getIsCachingScreen() && !this.getIsCachingSurface()) {
      if (this.getScreenCacheRequested()) {
        this.getEventBus().trigger(EVENTS.caching_screen_setup, { type: EVENTS.caching_screen_setup });
      }
      if (this.getSurfaceCacheRequested()) {
        this.getEventBus().trigger(EVENTS.caching_surface_setup, { type: EVENTS.caching_surface_setup });
      }
    }
  },

  /**
   * Ends visit phase of fx.
   * NOTE: This should be called automatically at the end of the frame visit phase.
   */
  endForVisit() {

  },

  /**
   * Begins redirecting drawing into screen framebuffers.
   * NOTE: This should be called automatically at the beginning of the frame rendering phase.
   */
  beginWithClear() {
    if (!this._redirectingToScreenPass) {
      // render all instances
      this._renderForInstancing();

      // redirect all drawing into screen pass
      // but only if we'll actually use it
      if (this.getIsBlurringScreen() || this.getScreenCacheRequested()) {
        if (!this.getIsCachingScreen()) {
          this.passes.screen.beginWithResetClear(this._postProcessingRenderPassStackId);
          this._redirectingToScreenPass = true;
        }
      }
    }
  },

  /**
   * Composites redirected drawing.
   * NOTE: This should be called automatically at the end of the frame rendering phase.
   */
  endWithComposite() {
    const gl = cc._renderContext;
    const { shaderCache } = cc;
    const needsCache = this.getScreenCacheRequested();

    if (this._redirectingToScreenPass) {
      this._redirectingToScreenPass = false;

      // stop redirecting drawing to screen pass
      this.passes.screen.endWithReset(this._postProcessingRenderPassStackId);

      if (needsCache) {
        this.passes.cache.beginWithResetClear(this._postProcessingRenderPassStackId);
      }

      // blur screen
      if (this.getIsBlurringScreen()) {
        // blur: horizontal pass
        this.passes.blur.beginWithResetClear(this._postProcessingRenderPassStackId);
        const blurProgram = shaderCache.programForKey(this.screenBlurShaderProgramKey);
        blurProgram.use();
        this.setRenderPassMatrices(blurProgram);
        blurProgram.setUniformLocationWith1f(blurProgram.loc_xStep, 1.0 / this.passes.blur.width);
        blurProgram.setUniformLocationWith1f(blurProgram.loc_yStep, 0.0);
        cc.glBlendFunc(gl.ONE, gl.ZERO);
        cc.glBindTexture2DN(0, this.passes.screen.texture);
        this.passes.blur.render();
        this.passes.blur.endWithReset(this._postProcessingRenderPassStackId);

        // blur: vertical pass
        this.setRenderPassMatrices(blurProgram);
        blurProgram.setUniformLocationWith1f(blurProgram.loc_xStep, 0.0);
        blurProgram.setUniformLocationWith1f(blurProgram.loc_yStep, 1.0 / this.passes.blur.height);
        cc.glBlendFunc(gl.ONE, gl.ZERO);
        cc.glBindTexture2DN(0, this.passes.blur.texture);
        this.passes.screen.render();
      } else {
        var posTexProgram = shaderCache.programForKey(cc.SHADER_POSITION_TEXTURE);
        posTexProgram.use();
        this.setRenderPassMatrices(posTexProgram);
        cc.glBlendFunc(gl.ONE, gl.ZERO);
        cc.glBindTexture2DN(0, this.passes.screen.texture);
        this.passes.screen.render();
      }

      if (needsCache) {
        this.passes.cache.endWithReset(this._postProcessingRenderPassStackId);
        this._startCachingScreen();
      }
    }

    if (this._cachingScreen) {
      // draw cache
      var posTexProgram = shaderCache.programForKey(cc.SHADER_POSITION_TEXTURE);
      posTexProgram.use();
      this.setRenderPassMatrices(posTexProgram);
      cc.glBlendFunc(gl.ONE, gl.ZERO);
      cc.glBindTexture2DN(0, this.passes.cache.texture);
      this.passes.cache.render();
    }
  },

  /**
   * Begins fx frame by redirecting drawing into framebuffers for post processing such as bloom, distortion, etc.
   * NOTE: This should be called once per frame by a FXCompositeLayer just before drawing anything that should be affected by post processing.
   */
  beginSurfaceWithClear() {
    if (!this._redirectingToSurfacePass && !this.getIsCachingScreen() && !this.getIsCachingSurface()) {
      // clear previous depth pass and set to max depth
      this.passes.depth.beginWithClear(255.0, 255.0, 255.0, 255.0);
      this.passes.depth.end();

      // set current passes
      // we alternate passes to reduce the number of fullscreen draw calls needed
      // we can cheat in some cases and use the last surface pass to read while we're writing the current surface pass
      if (this._currentSurfacePass !== this.passes.surfaceB) {
        this._currentSurfacePass = this.passes.surfaceB;
        this._refractMap = this.passes.surfaceA.texture;
        this._currentBloomCompositePass = this.passes.bloomCompositeB;
        this._previousBloomCompositePass = this.passes.bloomCompositeA;
      } else {
        this._currentSurfacePass = this.passes.surfaceA;
        this._refractMap = this.passes.surfaceB.texture;
        this._currentBloomCompositePass = this.passes.bloomCompositeA;
        this._previousBloomCompositePass = this.passes.bloomCompositeB;
      }

      // redirect all drawing into surface pass
      this._currentSurfacePass.beginWithResetClear(this._postProcessingRenderPassStackId);
      this._redirectingToSurfacePass = true;
    }
  },

  setRenderPassMatrices(shaderProgram) {
    if (RenderPass.is_rendering_reset_for_stack(this._postProcessingRenderPassStackId)) {
      // when rendering is reset, as in the case of a render pass that is not 1.0x scale
      // we should use the rendering matrix stack instead of the fixed orthographic matrices
      shaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4();
    } else {
      shaderProgram._glContext.uniformMatrix4fv(shaderProgram._uniforms[cc.UNIFORM_MVMATRIX], false, UtilsEngine.MAT4_ORTHOGRAPHIC_STACK.mat);
      shaderProgram._glContext.uniformMatrix4fv(shaderProgram._uniforms[cc.UNIFORM_PMATRIX], false, UtilsEngine.MAT4_ORTHOGRAPHIC_PROJECTION.mat);
    }
  },

  /**
   * Composites frame fx by handling post processing framebuffers and appling bloom, distortion, etc.
   * NOTE: This should be called once per frame by a FXCompositeLayer just after drawing the last thing that is affected by post processing.
   */
  endSurfaceWithComposite() {
    const gl = cc._renderContext;
    const { shaderCache } = cc;
    const needsCache = this.getSurfaceCacheRequested();

    // always end surface pass
    if (this._redirectingToSurfacePass) {
      this._redirectingToSurfacePass = false;

      // rebuild batches
      if (this.batchLights.getDirty()) {
        this.batchLights.rebuild();
      }
      if (this.batchShadowCastingLights.getDirty()) {
        this.batchShadowCastingLights.rebuild();
      }

      // stop redirecting drawing to surface pass
      this._currentSurfacePass.endWithReset(this._postProcessingRenderPassStackId);

      if (needsCache) {
        this.passes.cache.beginWithResetClear(this._postProcessingRenderPassStackId);
      }

      // setup for surface blur
      const needsSurfaceBlur = this.getIsBlurringSurface();
      if (needsSurfaceBlur) {
        // redirect to tone curve pass
        this.passes.blurComposite.beginWithResetClear(this._postProcessingRenderPassStackId);
      }

      // setup for tone curve
      if (this._needsGradientColorMap) {
        // redirect to tone curve pass
        this.passes.gradientColorMap.beginWithResetClear(this._postProcessingRenderPassStackId);
      }

      // bloom compositing
      // high pass
      this.passes.highpass.beginWithResetClear(this._postProcessingRenderPassStackId);
      const highpassProgram = shaderCache.programForKey('Highpass');
      highpassProgram.use();
      this.setRenderPassMatrices(highpassProgram);
      highpassProgram.setUniformLocationWith1f(highpassProgram.loc_threshold, this.bloomThreshold);
      highpassProgram.setUniformLocationWith1f(highpassProgram.loc_intensity, this.bloomIntensity * CONFIG.bloom);
      cc.glBlendFunc(gl.ONE, gl.ZERO);
      cc.glBindTexture2DN(0, this._currentSurfacePass.texture);
      this.passes.highpass.render();
      this.passes.highpass.endWithReset(this._postProcessingRenderPassStackId);

      // blur: horizontal pass
      this.passes.blur.beginWithResetClear(this._postProcessingRenderPassStackId);
      var blurProgram = shaderCache.programForKey('BlurStrong');
      blurProgram.use();
      this.setRenderPassMatrices(blurProgram);
      blurProgram.setUniformLocationWith1f(blurProgram.loc_xStep, 1.0 / this.passes.blur.width);
      blurProgram.setUniformLocationWith1f(blurProgram.loc_yStep, 0.0);
      cc.glBlendFunc(gl.ONE, gl.ZERO);
      cc.glBindTexture2DN(0, this.passes.highpass.texture);
      this.passes.blur.render();
      this.passes.blur.endWithReset(this._postProcessingRenderPassStackId);

      // blur: vertical pass
      this.passes.bloom.beginWithResetClear(this._postProcessingRenderPassStackId);
      this.setRenderPassMatrices(blurProgram);
      blurProgram.setUniformLocationWith1f(blurProgram.loc_xStep, 0.0);
      blurProgram.setUniformLocationWith1f(blurProgram.loc_yStep, 1.0 / this.passes.blur.height);
      cc.glBlendFunc(gl.ONE, gl.ZERO);
      cc.glBindTexture2DN(0, this.passes.blur.texture);
      this.passes.bloom.render();
      this.passes.bloom.endWithReset(this._postProcessingRenderPassStackId);

      // merge new bloom and previous
      this._currentBloomCompositePass.beginWithResetClear(this._postProcessingRenderPassStackId);
      const bloomProgram = shaderCache.programForKey('Bloom');
      bloomProgram.use();
      this.setRenderPassMatrices(bloomProgram);
      const bloomTransition = this.getSurfaceCacheRequested() || this.getScreenCacheRequested() ? 1.0 : this.bloomTransition;
      bloomProgram.setUniformLocationWith1f(bloomProgram.loc_transition, bloomTransition);
      cc.glBlendFunc(gl.ONE, gl.ZERO);
      cc.glBindTexture2DN(0, this.passes.bloom.texture);
      cc.glBindTexture2DN(1, this._previousBloomCompositePass.texture);
      this._currentBloomCompositePass.render();
      this._currentBloomCompositePass.endWithReset(this._postProcessingRenderPassStackId);

      // setup for tone curve
      const toneCurveAmount = this.getToneCurveAmount();
      const needsToneCurve = toneCurveAmount > 0.0;
      if (needsToneCurve) {
        // redirect to tone curve pass
        this.passes.toneCurve.beginWithResetClear(this._postProcessingRenderPassStackId);
      }

      // setup for radial blur
      const needsRadialBlur = this.radialBlurStrength > 0.0 && this.radialBlurSpread > 0.0;
      if (needsRadialBlur) {
        // redirect to radial blur pass
        this.passes.radialBlur.beginWithResetClear(this._postProcessingRenderPassStackId);
      }

      // composite bloom and current surface image
      const surfaceProgram = shaderCache.programForKey('Surface');
      surfaceProgram.use();
      this.setRenderPassMatrices(surfaceProgram);
      cc.glBlendFunc(gl.ONE, gl.ZERO);
      cc.glBindTexture2DN(0, this._currentSurfacePass.texture);
      cc.glBindTexture2DN(1, this._currentBloomCompositePass.texture);
      this._currentSurfacePass.render();

      // debug draw depth
      if (CONFIG.DEBUG_DEPTH) {
        const depthDebugProgram = shaderCache.programForKey('DepthDebug');
        depthDebugProgram.use();
        this.setRenderPassMatrices(depthDebugProgram);
        cc.glBlendFunc(gl.ONE, gl.ZERO);
        cc.glBindTexture2DN(0, this.getDepthMap());
        this._currentSurfacePass.render();
      }

      // draw distortions
      const { distortions } = this;
      if (distortions.length > 0) {
        if (this._distortionsDirty) {
          this._distortionsDirty = false;
          this.distortions.sort(this._compareDistortions);
        }
        for (let i = 0, il = distortions.length; i < il; i++) {
          const distortion = distortions[i];
          const renderCmd = distortion._renderCmd;
          renderCmd.renderingDistortion();
        }
      }

      // composite radial blur
      if (needsRadialBlur) {
        // stop redirecting to radial blur pass
        this.passes.radialBlur.endWithReset(this._postProcessingRenderPassStackId);

        // radial blur
        const radialBlurProgram = shaderCache.programForKey('RadialBlur');
        radialBlurProgram.use();
        this.setRenderPassMatrices(radialBlurProgram);
        radialBlurProgram.setUniformLocationWith2f(radialBlurProgram.loc_origin, this.radialBlurScreenPct.x, this.radialBlurScreenPct.y);
        radialBlurProgram.setUniformLocationWith1f(radialBlurProgram.loc_strength, this.radialBlurStrength);
        radialBlurProgram.setUniformLocationWith1f(radialBlurProgram.loc_deadZone, this.radialBlurDeadZone);
        radialBlurProgram.setUniformLocationWith1f(radialBlurProgram.loc_ramp, this.radialBlurRamp);
        radialBlurProgram.setUniformLocationWith1f(radialBlurProgram.loc_decay, this.radialBlurDecay);
        radialBlurProgram.setUniformLocationWith1f(radialBlurProgram.loc_spread, this.radialBlurSpread);
        cc.glBlendFunc(gl.ONE, gl.ZERO);
        cc.glBindTexture2DN(0, this.passes.radialBlur.texture);
        this._currentSurfacePass.render();
      }

      // composite tone curve
      if (needsToneCurve) {
        // stop redirecting to tone curve pass
        this.passes.toneCurve.endWithReset(this._postProcessingRenderPassStackId);

        // tone pass
        const toneCurveProgram = shaderCache.programForKey('ToneCurve');
        toneCurveProgram.use();
        this.setRenderPassMatrices(toneCurveProgram);
        toneCurveProgram.setUniformLocationWith1f(toneCurveProgram.loc_amount, toneCurveAmount);
        cc.glBlendFunc(gl.ONE, gl.ZERO);
        cc.glBindTexture2DN(0, this.passes.toneCurve.texture);
        cc.glBindTexture2DN(1, cc.textureCache.getTextureForKey(this.toneCurveTextureKey));
        this._currentSurfacePass.render();
      }

      // composite gradient color map
      if (this._needsGradientColorMap) {
        this._gradientMapDirty = false;

        // stop redirecting to color map pass
        this.passes.gradientColorMap.endWithReset(this._postProcessingRenderPassStackId);

        // color map pass
        var gradientColorMapProgram = shaderCache.programForKey('GradientColorMap');
        gradientColorMapProgram.use();
        this.setRenderPassMatrices(gradientColorMapProgram);
        gradientColorMapProgram.setUniformLocationWith4f(gradientColorMapProgram.loc_fromColorBlack, this._fromGradientColorMapBlackColor.r / 255.0, this._fromGradientColorMapBlackColor.g / 255.0, this._fromGradientColorMapBlackColor.b / 255.0, this._fromGradientColorMapBlackColor.a / 255.0);
        gradientColorMapProgram.setUniformLocationWith4f(gradientColorMapProgram.loc_fromColorMid, this._fromGradientColorMapMidColor.r / 255.0, this._fromGradientColorMapMidColor.g / 255.0, this._fromGradientColorMapMidColor.b / 255.0, this._fromGradientColorMapMidColor.a / 255.0);
        gradientColorMapProgram.setUniformLocationWith4f(gradientColorMapProgram.loc_fromColorWhite, this._fromGradientColorMapWhiteColor.r / 255.0, this._fromGradientColorMapWhiteColor.g / 255.0, this._fromGradientColorMapWhiteColor.b / 255.0, this._fromGradientColorMapWhiteColor.a / 255.0);
        gradientColorMapProgram.setUniformLocationWith4f(gradientColorMapProgram.loc_toColorBlack, this._toGradientColorMapBlackColor.r / 255.0, this._toGradientColorMapBlackColor.g / 255.0, this._toGradientColorMapBlackColor.b / 255.0, this._toGradientColorMapBlackColor.a / 255.0);
        gradientColorMapProgram.setUniformLocationWith4f(gradientColorMapProgram.loc_toColorMid, this._toGradientColorMapMidColor.r / 255.0, this._toGradientColorMapMidColor.g / 255.0, this._toGradientColorMapMidColor.b / 255.0, this._toGradientColorMapMidColor.a / 255.0);
        gradientColorMapProgram.setUniformLocationWith4f(gradientColorMapProgram.loc_toColorWhite, this._toGradientColorMapWhiteColor.r / 255.0, this._toGradientColorMapWhiteColor.g / 255.0, this._toGradientColorMapWhiteColor.b / 255.0, this._toGradientColorMapWhiteColor.a / 255.0);
        gradientColorMapProgram.setUniformLocationWith1f(gradientColorMapProgram.loc_phase, this._gradientMapTransitionPhase);
        cc.glBlendFunc(gl.ONE, gl.ZERO);
        cc.glBindTexture2DN(0, this.passes.gradientColorMap.texture);
        this._currentSurfacePass.render();
      }

      // surface blur
      if (needsSurfaceBlur) {
        // stop redirecting to surface blur pass
        this.passes.blurComposite.endWithReset(this._postProcessingRenderPassStackId);

        // blur: horizontal pass
        this.passes.blur.beginWithResetClear(this._postProcessingRenderPassStackId);
        var blurProgram = shaderCache.programForKey(this.surfaceBlurShaderProgramKey);
        blurProgram.use();
        this.setRenderPassMatrices(blurProgram);
        blurProgram.setUniformLocationWith1f(blurProgram.loc_xStep, 1.0 / this.passes.blur.width);
        blurProgram.setUniformLocationWith1f(blurProgram.loc_yStep, 0.0);
        cc.glBlendFunc(gl.ONE, gl.ZERO);
        cc.glBindTexture2DN(0, this.passes.blurComposite.texture);
        this.passes.blur.render();
        this.passes.blur.endWithReset(this._postProcessingRenderPassStackId);

        // blur: vertical pass
        this.setRenderPassMatrices(blurProgram);
        blurProgram.setUniformLocationWith1f(blurProgram.loc_xStep, 0.0);
        blurProgram.setUniformLocationWith1f(blurProgram.loc_yStep, 1.0 / this.passes.blur.height);
        cc.glBlendFunc(gl.ONE, gl.ZERO);
        cc.glBindTexture2DN(0, this.passes.blur.texture);
        this._currentSurfacePass.render();
      }

      if (needsCache) {
        this.passes.cache.endWithReset(this._postProcessingRenderPassStackId);
        this._startCachingSurface();
      }
    }

    if (this._cachingSurface) {
      // draw cache
      if (this._needsGradientColorMap) {
        this._gradientMapDirty = false;

        // color map pass
        var gradientColorMapProgram = shaderCache.programForKey('GradientColorMap');
        gradientColorMapProgram.use();
        this.setRenderPassMatrices(gradientColorMapProgram);
        gradientColorMapProgram.setUniformLocationWith4f(gradientColorMapProgram.loc_fromColorBlack, this._fromGradientColorMapBlackColor.r / 255.0, this._fromGradientColorMapBlackColor.g / 255.0, this._fromGradientColorMapBlackColor.b / 255.0, this._fromGradientColorMapBlackColor.a / 255.0);
        gradientColorMapProgram.setUniformLocationWith4f(gradientColorMapProgram.loc_fromColorMid, this._fromGradientColorMapMidColor.r / 255.0, this._fromGradientColorMapMidColor.g / 255.0, this._fromGradientColorMapMidColor.b / 255.0, this._fromGradientColorMapMidColor.a / 255.0);
        gradientColorMapProgram.setUniformLocationWith4f(gradientColorMapProgram.loc_fromColorWhite, this._fromGradientColorMapWhiteColor.r / 255.0, this._fromGradientColorMapWhiteColor.g / 255.0, this._fromGradientColorMapWhiteColor.b / 255.0, this._fromGradientColorMapWhiteColor.a / 255.0);
        gradientColorMapProgram.setUniformLocationWith4f(gradientColorMapProgram.loc_toColorBlack, this._toGradientColorMapBlackColor.r / 255.0, this._toGradientColorMapBlackColor.g / 255.0, this._toGradientColorMapBlackColor.b / 255.0, this._toGradientColorMapBlackColor.a / 255.0);
        gradientColorMapProgram.setUniformLocationWith4f(gradientColorMapProgram.loc_toColorMid, this._toGradientColorMapMidColor.r / 255.0, this._toGradientColorMapMidColor.g / 255.0, this._toGradientColorMapMidColor.b / 255.0, this._toGradientColorMapMidColor.a / 255.0);
        gradientColorMapProgram.setUniformLocationWith4f(gradientColorMapProgram.loc_toColorWhite, this._toGradientColorMapWhiteColor.r / 255.0, this._toGradientColorMapWhiteColor.g / 255.0, this._toGradientColorMapWhiteColor.b / 255.0, this._toGradientColorMapWhiteColor.a / 255.0);
        gradientColorMapProgram.setUniformLocationWith1f(gradientColorMapProgram.loc_phase, this._gradientMapTransitionPhase);
      } else {
        const posTexProgram = shaderCache.programForKey(cc.SHADER_POSITION_TEXTURE);
        posTexProgram.use();
        this.setRenderPassMatrices(posTexProgram);
      }
      cc.glBlendFunc(gl.ONE, gl.ZERO);
      cc.glBindTexture2DN(0, this.passes.cache.texture);
      this.passes.cache.render();
    }
  },

  update(dt) {
    // time
    this.time += dt;
    this.deltaTime = dt;

    // looping time from 0 to 1
    const loopingTime = (this._loopingTimeOverflow || this.loopingTime) + dt;
    this._loopingTimeOverflow = Math.max(0.0, loopingTime - 1.0);
    this.loopingTime = loopingTime - this._loopingTimeOverflow;

    // looping directional time from 0 to 1 to 0
    const ldt = dt * this._loopingDirection;
    let loopingDirectionalTime;
    const loopingDirectionalTimeOverflow = this._loopingDirectionalTimeOverflow;
    this._loopingDirectionalTimeOverflow = 0.0;
    if (this._loopingDirection > 0) {
      loopingDirectionalTime = (loopingDirectionalTimeOverflow !== 0 ? loopingDirectionalTimeOverflow : this.loopingDirectionalTime) + ldt;
      if (loopingDirectionalTime >= 1.0) {
        this._loopingDirectionalTimeOverflow = loopingDirectionalTime - 1.0;
        loopingDirectionalTime = 1.0;
        this._loopingDirection *= -1.0;
      }
    } else if (this._loopingDirection < 0) {
      loopingDirectionalTime = (loopingDirectionalTimeOverflow !== 0 ? loopingDirectionalTimeOverflow + 1.0 : this.loopingDirectionalTime) + ldt;
      if (loopingDirectionalTime <= 0.0) {
        this._loopingDirectionalTimeOverflow = loopingDirectionalTime;
        loopingDirectionalTime = 0.0;
        this._loopingDirection *= -1.0;
      }
    }
    this.loopingDirectionalTime = loopingDirectionalTime;
  },
});

FX.create = function () {
  Logger.module('ENGINE').log('FX::create');
  if (_needsSetup) {
    FX.setup();
  }
  return new FX();
};

var _needsSetup = true;
/**
 * Sets up all shaders and initializes uniform locations. Do not set uniform values here.
 */
FX.setup = function () {
  if (_needsSetup) {
    _needsSetup = false;
    Logger.module('ENGINE').log('FX::setup');
    const { shaderCache } = cc;

    cc.ATTRIBUTE_NAME_ORIGIN_RADIUS = 'a_originRadius';
    cc.VERTEX_ATTRIB_ORIGIN_RADIUS = cc.VERTEX_ATTRIB_MAX;
    cc.VERTEX_ATTRIB_FLAG_ORIGIN_RADIUS = 1 << cc.VERTEX_ATTRIB_ORIGIN_RADIUS;

    cc.ATTRIBUTE_NAME_PROPERTIES = 'a_properties';
    cc.VERTEX_ATTRIB_PROPERTIES = cc.VERTEX_ATTRIB_MAX + 1;
    cc.VERTEX_ATTRIB_FLAG_PROPERTIES = 1 << cc.VERTEX_ATTRIB_PROPERTIES;

    const posTexAlphaProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLORALPHATEST);
    posTexAlphaProgram.loc_CC_alpha_value = posTexAlphaProgram._uniforms[cc.UNIFORM_ALPHA_TEST_VALUE_S] = posTexAlphaProgram.getUniformLocationForName(cc.UNIFORM_ALPHA_TEST_VALUE_S);

    const monochromeProgram = new cc.GLProgram();
    monochromeProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/MonochromeFragment.glsl'));
    monochromeProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    monochromeProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    monochromeProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    monochromeProgram.link();
    monochromeProgram.updateUniforms();
    cc.shaderCache.addProgram(monochromeProgram, 'Monochrome');

    const tintingProgram = new cc.GLProgram();
    tintingProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/TintingFragment.glsl'));
    tintingProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    tintingProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    tintingProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    tintingProgram.link();
    tintingProgram.updateUniforms();
    tintingProgram.loc_tint = tintingProgram.getUniformLocationForName('u_tint');
    cc.shaderCache.addProgram(tintingProgram, 'Tinting');

    const depthProgram = new cc.GLProgram();
    depthProgram.initWithVertexShaderByteArray(glslify('./../../shaders/DepthVertex.glsl'), glslify('./../../shaders/DepthFragment.glsl'));
    depthProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    depthProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    depthProgram.link();
    depthProgram.updateUniforms();
    depthProgram.loc_resolution = depthProgram.getUniformLocationForName('u_resolution');
    depthProgram.loc_depthOffset = depthProgram.getUniformLocationForName('u_depthOffset');
    depthProgram.loc_depthModifier = depthProgram.getUniformLocationForName('u_depthModifier');
    shaderCache.addProgram(depthProgram, 'Depth');

    const depthTestProgram = new cc.GLProgram();
    depthTestProgram.initWithVertexShaderByteArray(glslify('./../../shaders/DepthTestVertex.glsl'), glslify('./../../shaders/DepthTestFragment.glsl'));
    depthTestProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    depthTestProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    depthTestProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    depthTestProgram.link();
    depthTestProgram.updateUniforms();
    depthTestProgram.loc_resolution = depthTestProgram.getUniformLocationForName('u_resolution');
    depthTestProgram.loc_depthOffset = depthTestProgram.getUniformLocationForName('u_depthOffset');
    depthTestProgram.loc_depthModifier = depthTestProgram.getUniformLocationForName('u_depthModifier');
    // textures are unlikely to change slots
    // depth map for z sorting
    depthTestProgram.loc_depthMap = depthTestProgram.getUniformLocationForName('u_depthMap');
    depthTestProgram.setUniformLocationWith1i(depthTestProgram.loc_depthMap, 1);
    shaderCache.addProgram(depthTestProgram, 'DepthTest');

    const maskProgram = new cc.GLProgram();
    maskProgram.initWithVertexShaderByteArray(glslify('./../../shaders/MaskVertex.glsl'), glslify('./../../shaders/MaskFragment.glsl'));
    maskProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    maskProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    maskProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    maskProgram.link();
    maskProgram.updateUniforms();
    maskProgram.loc_maskRect = maskProgram.getUniformLocationForName('u_maskRect');
    // textures are unlikely to change slots
    // mask map
    maskProgram.loc_maskMap = maskProgram.getUniformLocationForName('u_maskMap');
    maskProgram.setUniformLocationWith1i(maskProgram.loc_maskMap, 1);
    shaderCache.addProgram(maskProgram, 'Mask');

    const fxaaProgram = new cc.GLProgram();
    fxaaProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexVertex.glsl'), glslify('./../../shaders/FXAAFragment.glsl'));
    fxaaProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    fxaaProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    fxaaProgram.link();
    fxaaProgram.updateUniforms();
    fxaaProgram.loc_resolution = fxaaProgram.getUniformLocationForName('u_resolution');
    shaderCache.addProgram(fxaaProgram, 'FXAA');

    const depthDebugProgram = new cc.GLProgram();
    depthDebugProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexVertex.glsl'), glslify('./../../shaders/DepthDebugFragment.glsl'));
    depthDebugProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    depthDebugProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    depthDebugProgram.link();
    depthDebugProgram.updateUniforms();
    shaderCache.addProgram(depthDebugProgram, 'DepthDebug');

    const surfaceProgram = new cc.GLProgram();
    surfaceProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexVertex.glsl'), glslify('./../../shaders/SurfaceFragment.glsl'));
    surfaceProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    surfaceProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    surfaceProgram.link();
    surfaceProgram.updateUniforms();
    // textures are unlikely to change slots
    // bloom map
    surfaceProgram.loc_bloom = surfaceProgram.getUniformLocationForName('u_bloom');
    surfaceProgram.setUniformLocationWith1i(surfaceProgram.loc_bloom, 1);
    shaderCache.addProgram(surfaceProgram, 'Surface');

    const bloomProgram = new cc.GLProgram();
    bloomProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexVertex.glsl'), glslify('./../../shaders/BloomFragment.glsl'));
    bloomProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    bloomProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    bloomProgram.link();
    bloomProgram.updateUniforms();
    bloomProgram.loc_transition = bloomProgram.getUniformLocationForName('u_transition');
    // textures are unlikely to change slots
    // bloom map from previous frame
    bloomProgram.loc_previousBloom = bloomProgram.getUniformLocationForName('u_previousBloom');
    bloomProgram.setUniformLocationWith1i(bloomProgram.loc_previousBloom, 1);
    shaderCache.addProgram(bloomProgram, 'Bloom');

    const highpassProgram = new cc.GLProgram();
    highpassProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexVertex.glsl'), glslify('./../../shaders/HighpassFragment.glsl'));
    highpassProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    highpassProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    highpassProgram.link();
    highpassProgram.updateUniforms();
    highpassProgram.loc_threshold = highpassProgram.getUniformLocationForName('u_threshold');
    highpassProgram.loc_intensity = highpassProgram.getUniformLocationForName('u_intensity');
    shaderCache.addProgram(highpassProgram, 'Highpass');

    // blur
    BlurShaderGenerator.compileShader('BlurWeak', 0.5);
    BlurShaderGenerator.compileShader('BlurMedium', 1.75);
    BlurShaderGenerator.compileShader('BlurStrong', 3);
    BlurShaderGenerator.compileShader('BlurExtreme', 5);

    // full screen mega blur
    // use only when caching since it takes a LOT of steps (35 per pixel)
    BlurShaderGenerator.compileShader('BlurFullScreenMega', 16);

    const radialBlurProgram = new cc.GLProgram();
    radialBlurProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexVertex.glsl'), glslify('./../../shaders/RadialBlurFragment.glsl'));
    radialBlurProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    radialBlurProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    radialBlurProgram.link();
    radialBlurProgram.updateUniforms();
    radialBlurProgram.loc_origin = radialBlurProgram.getUniformLocationForName('u_origin');
    radialBlurProgram.loc_strength = radialBlurProgram.getUniformLocationForName('u_strength');
    radialBlurProgram.loc_deadZone = radialBlurProgram.getUniformLocationForName('u_deadZone');
    radialBlurProgram.loc_ramp = radialBlurProgram.getUniformLocationForName('u_ramp');
    radialBlurProgram.loc_decay = radialBlurProgram.getUniformLocationForName('u_decay');
    radialBlurProgram.loc_spread = radialBlurProgram.getUniformLocationForName('u_spread');
    shaderCache.addProgram(radialBlurProgram, 'RadialBlur');

    const glowNoiseProgram = new cc.GLProgram();
    glowNoiseProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexVertex.glsl'), glslify('./../../shaders/GlowNoiseFragment.glsl'));
    glowNoiseProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    glowNoiseProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    glowNoiseProgram.link();
    glowNoiseProgram.updateUniforms();
    glowNoiseProgram.loc_resolution = glowNoiseProgram.getUniformLocationForName('u_resolution');
    glowNoiseProgram.loc_color = glowNoiseProgram.getUniformLocationForName('u_color');
    glowNoiseProgram.loc_rampFrom = glowNoiseProgram.getUniformLocationForName('u_rampFrom');
    glowNoiseProgram.loc_rampTransition = glowNoiseProgram.getUniformLocationForName('u_rampTransition');
    // position of vertical fade from top of sprite going down
    glowNoiseProgram.loc_verticalFadeFromTop = glowNoiseProgram.getUniformLocationForName('u_verticalFadeFromTop');
    // speed of vertical fade, where higher will fade more aggressively
    glowNoiseProgram.loc_verticalFadeSpeed = glowNoiseProgram.getUniformLocationForName('u_verticalFadeSpeed');
    // higher expand, noise is shown further from glow
    glowNoiseProgram.loc_expandModifier = glowNoiseProgram.getUniformLocationForName('u_expandModifier');
    // higher frequency, smaller noise
    glowNoiseProgram.loc_frequency = glowNoiseProgram.getUniformLocationForName('u_frequency');
    glowNoiseProgram.loc_amplitude = glowNoiseProgram.getUniformLocationForName('u_amplitude');
    // wider range, more noise and bigger noise clouds
    // higher range, less noise and smaller noise clouds
    glowNoiseProgram.loc_range = glowNoiseProgram.getUniformLocationForName('u_range');
    glowNoiseProgram.loc_time = glowNoiseProgram.getUniformLocationForName('u_time');
    shaderCache.addProgram(glowNoiseProgram, 'GlowNoise');

    const glowProgram = new cc.GLProgram();
    glowProgram.initWithVertexShaderByteArray(glslify('./../../shaders/GlowVertex.glsl'), glslify('./../../shaders/GlowFragment.glsl'));
    glowProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    glowProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    glowProgram.link();
    glowProgram.updateUniforms();
    glowProgram.loc_size = glowProgram.getUniformLocationForName('u_size');
    glowProgram.loc_resolution = glowProgram.getUniformLocationForName('u_resolution');
    glowProgram.loc_color = glowProgram.getUniformLocationForName('u_color');
    glowProgram.loc_time = glowProgram.getUniformLocationForName('u_time');
    glowProgram.loc_pulseMax = glowProgram.getUniformLocationForName('u_pulseMax');
    glowProgram.loc_pulseMin = glowProgram.getUniformLocationForName('u_pulseMin');
    glowProgram.loc_thickness = glowProgram.getUniformLocationForName('u_thickness');
    shaderCache.addProgram(glowProgram, 'Glow');

    const highlightProgram = new cc.GLProgram();
    highlightProgram.initWithVertexShaderByteArray(glslify('./../../shaders/HighlightVertex.glsl'), glslify('./../../shaders/HighlightFragment.glsl'));
    highlightProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    highlightProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    highlightProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    highlightProgram.link();
    highlightProgram.updateUniforms();
    highlightProgram.loc_time = highlightProgram.getUniformLocationForName('u_time');
    highlightProgram.loc_pulseMax = highlightProgram.getUniformLocationForName('u_pulseMax');
    highlightProgram.loc_pulseMin = highlightProgram.getUniformLocationForName('u_pulseMin');
    // color of highlight bloom
    highlightProgram.loc_color = highlightProgram.getUniformLocationForName('u_color');
    // how much of the highlight color to use vs the sprite color
    highlightProgram.loc_brightness = highlightProgram.getUniformLocationForName('u_brightness');
    // threshold for highpass where a color must meet or exceed to be bloomed
    highlightProgram.loc_threshold = highlightProgram.getUniformLocationForName('u_threshold');
    // when a color is bloomed, how intense the effect should be
    highlightProgram.loc_intensity = highlightProgram.getUniformLocationForName('u_intensity');
    // position of vertical fade from top of sprite going down
    highlightProgram.loc_verticalFadeFromTop = highlightProgram.getUniformLocationForName('u_verticalFadeFromTop');
    // speed of vertical fade, where higher will fade more aggressively
    highlightProgram.loc_verticalFadeSpeed = highlightProgram.getUniformLocationForName('u_verticalFadeSpeed');
    // properties for adjusting levels
    highlightProgram.loc_inBlack = highlightProgram.getUniformLocationForName('u_inBlack');
    highlightProgram.loc_inWhite = highlightProgram.getUniformLocationForName('u_inWhite');
    highlightProgram.loc_inGamma = highlightProgram.getUniformLocationForName('u_inGamma');
    highlightProgram.loc_outBlack = highlightProgram.getUniformLocationForName('u_outBlack');
    highlightProgram.loc_outWhite = highlightProgram.getUniformLocationForName('u_outWhite');
    shaderCache.addProgram(highlightProgram, 'Highlight');

    const lensFlareProgram = new cc.GLProgram();
    lensFlareProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/LensFlareFragment.glsl'));
    lensFlareProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    lensFlareProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    lensFlareProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    lensFlareProgram.link();
    lensFlareProgram.updateUniforms();
    lensFlareProgram.loc_origin = lensFlareProgram.getUniformLocationForName('u_origin');
    lensFlareProgram.loc_texResolution = lensFlareProgram.getUniformLocationForName('u_texResolution');
    lensFlareProgram.loc_time = lensFlareProgram.getUniformLocationForName('u_time');
    lensFlareProgram.loc_rampThreshold = lensFlareProgram.getUniformLocationForName('u_rampThreshold');
    shaderCache.addProgram(lensFlareProgram, 'LensFlare');

    const wispLensFlareProgram = new cc.GLProgram();
    wispLensFlareProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/WispLensFlareFragment.glsl'));
    wispLensFlareProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    wispLensFlareProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    wispLensFlareProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    wispLensFlareProgram.link();
    wispLensFlareProgram.updateUniforms();
    wispLensFlareProgram.loc_texResolution = wispLensFlareProgram.getUniformLocationForName('u_texResolution');
    wispLensFlareProgram.loc_time = wispLensFlareProgram.getUniformLocationForName('u_time');
    wispLensFlareProgram.loc_pulseRate = wispLensFlareProgram.getUniformLocationForName('u_pulseRate');
    wispLensFlareProgram.loc_armLength = wispLensFlareProgram.getUniformLocationForName('u_armLength');
    wispLensFlareProgram.loc_wispSize = wispLensFlareProgram.getUniformLocationForName('u_wispSize');
    wispLensFlareProgram.loc_flareSize = wispLensFlareProgram.getUniformLocationForName('u_flareSize');
    shaderCache.addProgram(wispLensFlareProgram, 'WispLensFlare');

    const chromaticProgram = new cc.GLProgram();
    chromaticProgram.initWithVertexShaderByteArray(glslify('./../../shaders/ChromaticVertex.glsl'), glslify('./../../shaders/ChromaticFragment.glsl'));
    chromaticProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    chromaticProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    chromaticProgram.link();
    chromaticProgram.updateUniforms();
    chromaticProgram.loc_time = chromaticProgram.getUniformLocationForName('u_time');
    chromaticProgram.loc_resolution = chromaticProgram.getUniformLocationForName('u_resolution');
    chromaticProgram.loc_aberrationScale = chromaticProgram.getUniformLocationForName('u_aberrationScale');
    chromaticProgram.loc_frequency = chromaticProgram.getUniformLocationForName('u_frequency');
    chromaticProgram.loc_amplitude = chromaticProgram.getUniformLocationForName('u_amplitude');
    chromaticProgram.loc_smoothstepMin = chromaticProgram.getUniformLocationForName('u_smoothstepMin');
    chromaticProgram.loc_smoothstepMax = chromaticProgram.getUniformLocationForName('u_smoothstepMax');
    // uncomment if using noise map based chromatic shader
    /*
    // textures are unlikely to change slots
    chromaticProgram.loc_noiseMap = chromaticProgram.getUniformLocationForName("u_noiseMap");
    chromaticProgram.setUniformLocationWith1i(chromaticProgram.loc_noiseMap, 1);
    */
    shaderCache.addProgram(chromaticProgram, 'Chromatic');

    const chromaticFlareProgram = new cc.GLProgram();
    chromaticFlareProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/ChromaticFlareFragment.glsl'));
    chromaticFlareProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    chromaticFlareProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    chromaticFlareProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    chromaticFlareProgram.link();
    chromaticFlareProgram.updateUniforms();
    chromaticFlareProgram.loc_phase = chromaticFlareProgram.getUniformLocationForName('u_phase');
    chromaticFlareProgram.loc_time = chromaticFlareProgram.getUniformLocationForName('u_time');
    chromaticFlareProgram.loc_size = chromaticFlareProgram.getUniformLocationForName('u_size');
    chromaticFlareProgram.loc_frequency = chromaticFlareProgram.getUniformLocationForName('u_frequency');
    chromaticFlareProgram.loc_amplitude = chromaticFlareProgram.getUniformLocationForName('u_amplitude');
    chromaticFlareProgram.loc_smoothstepMin = chromaticFlareProgram.getUniformLocationForName('u_smoothstepMin');
    chromaticFlareProgram.loc_smoothstepMax = chromaticFlareProgram.getUniformLocationForName('u_smoothstepMax');
    shaderCache.addProgram(chromaticFlareProgram, 'ChromaticFlare');

    const causticPrismaticGlowProgram = new cc.GLProgram();
    causticPrismaticGlowProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/CausticPrismaticGlowFragment.glsl'));
    causticPrismaticGlowProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    causticPrismaticGlowProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    causticPrismaticGlowProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    causticPrismaticGlowProgram.link();
    causticPrismaticGlowProgram.updateUniforms();
    causticPrismaticGlowProgram.loc_time = causticPrismaticGlowProgram.getUniformLocationForName('u_time');
    shaderCache.addProgram(causticPrismaticGlowProgram, 'CausticPrismaticGlow');

    const voronoiPrismaticProgram = new cc.GLProgram();
    voronoiPrismaticProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/VoronoiPrismaticFragment.glsl'));
    voronoiPrismaticProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    voronoiPrismaticProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    voronoiPrismaticProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    voronoiPrismaticProgram.link();
    voronoiPrismaticProgram.updateUniforms();
    voronoiPrismaticProgram.loc_phase = voronoiPrismaticProgram.getUniformLocationForName('u_phase');
    shaderCache.addProgram(voronoiPrismaticProgram, 'VoronoiPrismatic');

    const lightingProgram = new cc.GLProgram();
    lightingProgram.initWithVertexShaderByteArray(glslify('./../../shaders/LightingVertex.glsl'), glslify('./../../shaders/LightingFragment.glsl'));
    lightingProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    lightingProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    lightingProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    lightingProgram.addAttribute(cc.ATTRIBUTE_NAME_ORIGIN_RADIUS, cc.VERTEX_ATTRIB_ORIGIN_RADIUS);
    lightingProgram.link();
    lightingProgram.updateUniforms();
    lightingProgram.loc_depthRange = lightingProgram.getUniformLocationForName('u_depthRange');
    lightingProgram.loc_depthOffset = lightingProgram.getUniformLocationForName('u_depthOffset');
    lightingProgram.loc_lightMapScale = lightingProgram.getUniformLocationForName('u_lightMapScale');
    lightingProgram.loc_depthRotationMatrix = lightingProgram.getUniformLocationForName('u_depthRotationMatrix');
    lightingProgram.loc_normal = lightingProgram.getUniformLocationForName('u_normal');
    lightingProgram.loc_falloffModifier = lightingProgram.getUniformLocationForName('u_falloffModifier');
    lightingProgram.loc_intensityModifier = lightingProgram.getUniformLocationForName('u_intensityModifier');
    shaderCache.addProgram(lightingProgram, 'Lighting');

    const shadowLowQualityProgram = new cc.GLProgram();
    shadowLowQualityProgram.initWithVertexShaderByteArray(glslify('./../../shaders/ShadowVertex.glsl'), glslify('./../../shaders/ShadowLowQualityFragment.glsl'));
    shadowLowQualityProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    shadowLowQualityProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    shadowLowQualityProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    shadowLowQualityProgram.addAttribute(cc.ATTRIBUTE_NAME_ORIGIN_RADIUS, cc.VERTEX_ATTRIB_ORIGIN_RADIUS);
    shadowLowQualityProgram.link();
    shadowLowQualityProgram.updateUniforms();
    shadowLowQualityProgram.loc_size = shadowLowQualityProgram.getUniformLocationForName('u_size');
    shadowLowQualityProgram.loc_anchor = shadowLowQualityProgram.getUniformLocationForName('u_anchor');
    shadowLowQualityProgram.loc_intensity = shadowLowQualityProgram.getUniformLocationForName('u_intensity');
    shadowLowQualityProgram.loc_blurShiftModifier = shadowLowQualityProgram.getUniformLocationForName('u_blurShiftModifier');
    shadowLowQualityProgram.loc_blurIntensityModifier = shadowLowQualityProgram.getUniformLocationForName('u_blurIntensityModifier');
    shaderCache.addProgram(shadowLowQualityProgram, 'ShadowLowQuality');

    const shadowHighQualityProgram = new cc.GLProgram();
    shadowHighQualityProgram.initWithVertexShaderByteArray(glslify('./../../shaders/ShadowVertex.glsl'), glslify('./../../shaders/ShadowHighQualityFragment.glsl'));
    shadowHighQualityProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    shadowHighQualityProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    shadowHighQualityProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    shadowHighQualityProgram.addAttribute(cc.ATTRIBUTE_NAME_ORIGIN_RADIUS, cc.VERTEX_ATTRIB_ORIGIN_RADIUS);
    shadowHighQualityProgram.link();
    shadowHighQualityProgram.updateUniforms();
    shadowHighQualityProgram.loc_size = shadowHighQualityProgram.getUniformLocationForName('u_size');
    shadowHighQualityProgram.loc_anchor = shadowHighQualityProgram.getUniformLocationForName('u_anchor');
    shadowHighQualityProgram.loc_intensity = shadowHighQualityProgram.getUniformLocationForName('u_intensity');
    shadowHighQualityProgram.loc_blurShiftModifier = shadowHighQualityProgram.getUniformLocationForName('u_blurShiftModifier');
    shadowHighQualityProgram.loc_blurIntensityModifier = shadowHighQualityProgram.getUniformLocationForName('u_blurIntensityModifier');
    shaderCache.addProgram(shadowHighQualityProgram, 'ShadowHighQuality');

    const multipliedLightingProgram = new cc.GLProgram();
    multipliedLightingProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexVertex.glsl'), glslify('./../../shaders/MultipliedLightingFragment.glsl'));
    multipliedLightingProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    multipliedLightingProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    multipliedLightingProgram.link();
    multipliedLightingProgram.updateUniforms();
    multipliedLightingProgram.loc_ambientColor = multipliedLightingProgram.getUniformLocationForName('u_ambientColor');
    // textures are unlikely to change slots
    multipliedLightingProgram.loc_lightMap = multipliedLightingProgram.getUniformLocationForName('u_lightMap');
    multipliedLightingProgram.setUniformLocationWith1i(multipliedLightingProgram.loc_lightMap, 1);
    shaderCache.addProgram(multipliedLightingProgram, 'MultipliedLighting');

    const distortionProgram = new cc.GLProgram();
    distortionProgram.initWithVertexShaderByteArray(glslify('./../../shaders/DistortionVertex.glsl'), glslify('./../../shaders/DistortionFragment.glsl'));
    distortionProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    distortionProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    distortionProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    distortionProgram.link();
    distortionProgram.updateUniforms();
    distortionProgram.loc_resolution = distortionProgram.getUniformLocationForName('u_resolution');
    distortionProgram.loc_depthOffset = distortionProgram.getUniformLocationForName('u_depthOffset');
    distortionProgram.loc_depthModifier = distortionProgram.getUniformLocationForName('u_depthModifier');
    distortionProgram.loc_refraction = distortionProgram.getUniformLocationForName('u_refraction');
    distortionProgram.loc_reflection = distortionProgram.getUniformLocationForName('u_reflection');
    distortionProgram.loc_fresnelBias = distortionProgram.getUniformLocationForName('u_fresnelBias');
    // textures are unlikely to change slots
    // sprite texture should be a map of normals (rgb) and intensity (a) used to control distortion
    // depth map for z sorting
    distortionProgram.loc_depthMap = distortionProgram.getUniformLocationForName('u_depthMap');
    distortionProgram.setUniformLocationWith1i(distortionProgram.loc_depthMap, 1);
    // environment map for refraction and reflection
    distortionProgram.loc_refractMap = distortionProgram.getUniformLocationForName('u_refractMap');
    distortionProgram.setUniformLocationWith1i(distortionProgram.loc_refractMap, 2);
    shaderCache.addProgram(distortionProgram, 'Distortion');

    const waterProgram = new cc.GLProgram();
    waterProgram.initWithVertexShaderByteArray(glslify('./../../shaders/DistortionVertex.glsl'), glslify('./../../shaders/WaterFragment.glsl'));
    waterProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    waterProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    waterProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    waterProgram.link();
    waterProgram.updateUniforms();
    waterProgram.loc_resolution = waterProgram.getUniformLocationForName('u_resolution');
    waterProgram.loc_depthOffset = waterProgram.getUniformLocationForName('u_depthOffset');
    waterProgram.loc_depthModifier = waterProgram.getUniformLocationForName('u_depthModifier');
    waterProgram.loc_refraction = waterProgram.getUniformLocationForName('u_refraction');
    waterProgram.loc_reflection = waterProgram.getUniformLocationForName('u_reflection');
    waterProgram.loc_fresnelBias = waterProgram.getUniformLocationForName('u_fresnelBias');
    waterProgram.loc_frequency = waterProgram.getUniformLocationForName('u_frequency');
    waterProgram.loc_amplitude = waterProgram.getUniformLocationForName('u_amplitude');
    waterProgram.loc_time = waterProgram.getUniformLocationForName('u_time');
    // textures are unlikely to change slots
    // sprite texture should be a map of normals (rgb) and intensity (a) used to control distortion
    // depth map for z sorting
    waterProgram.loc_depthMap = waterProgram.getUniformLocationForName('u_depthMap');
    waterProgram.setUniformLocationWith1i(waterProgram.loc_depthMap, 1);
    // environment map for refraction
    waterProgram.loc_refractMap = waterProgram.getUniformLocationForName('u_refractMap');
    waterProgram.setUniformLocationWith1i(waterProgram.loc_refractMap, 2);
    shaderCache.addProgram(waterProgram, 'Water');

    const shockwaveProgram = new cc.GLProgram();
    shockwaveProgram.initWithVertexShaderByteArray(glslify('./../../shaders/DistortionVertex.glsl'), glslify('./../../shaders/ShockwaveFragment.glsl'));
    shockwaveProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    shockwaveProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    shockwaveProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    shockwaveProgram.link();
    shockwaveProgram.updateUniforms();
    shockwaveProgram.loc_resolution = shockwaveProgram.getUniformLocationForName('u_resolution');
    shockwaveProgram.loc_depthOffset = shockwaveProgram.getUniformLocationForName('u_depthOffset');
    shockwaveProgram.loc_depthModifier = shockwaveProgram.getUniformLocationForName('u_depthModifier');
    shockwaveProgram.loc_refraction = shockwaveProgram.getUniformLocationForName('u_refraction');
    shockwaveProgram.loc_reflection = shockwaveProgram.getUniformLocationForName('u_reflection');
    shockwaveProgram.loc_fresnelBias = shockwaveProgram.getUniformLocationForName('u_fresnelBias');
    shockwaveProgram.loc_amplitude = shockwaveProgram.getUniformLocationForName('u_amplitude');
    shockwaveProgram.loc_time = shockwaveProgram.getUniformLocationForName('u_time');
    // textures are unlikely to change slots
    // depth map for z sorting
    shockwaveProgram.loc_refractMap = shockwaveProgram.getUniformLocationForName('u_refractMap');
    shockwaveProgram.setUniformLocationWith1i(shockwaveProgram.loc_refractMap, 1);
    shaderCache.addProgram(shockwaveProgram, 'Shockwave');

    const vortexProgram = new cc.GLProgram();
    vortexProgram.initWithVertexShaderByteArray(glslify('./../../shaders/DistortionVertex.glsl'), glslify('./../../shaders/VortexFragment.glsl'));
    vortexProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    vortexProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    vortexProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    vortexProgram.link();
    vortexProgram.updateUniforms();
    vortexProgram.loc_radius = vortexProgram.getUniformLocationForName('u_radius');
    vortexProgram.loc_resolution = vortexProgram.getUniformLocationForName('u_resolution');
    vortexProgram.loc_depthOffset = vortexProgram.getUniformLocationForName('u_depthOffset');
    vortexProgram.loc_depthModifier = vortexProgram.getUniformLocationForName('u_depthModifier');
    vortexProgram.loc_refraction = vortexProgram.getUniformLocationForName('u_refraction');
    vortexProgram.loc_reflection = vortexProgram.getUniformLocationForName('u_reflection');
    vortexProgram.loc_fresnelBias = vortexProgram.getUniformLocationForName('u_fresnelBias');
    vortexProgram.loc_frequency = vortexProgram.getUniformLocationForName('u_frequency');
    vortexProgram.loc_amplitude = vortexProgram.getUniformLocationForName('u_amplitude');
    vortexProgram.loc_time = vortexProgram.getUniformLocationForName('u_time');
    // textures are unlikely to change slots
    // depth map for z sorting
    vortexProgram.loc_refractMap = vortexProgram.getUniformLocationForName('u_refractMap');
    vortexProgram.setUniformLocationWith1i(vortexProgram.loc_refractMap, 1);
    shaderCache.addProgram(vortexProgram, 'Vortex');

    const toneCurveProgram = new cc.GLProgram();
    toneCurveProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexVertex.glsl'), glslify('./../../shaders/ToneCurveFragment.glsl'));
    toneCurveProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    toneCurveProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    toneCurveProgram.link();
    toneCurveProgram.updateUniforms();
    toneCurveProgram.loc_toneCurveTexture = toneCurveProgram.getUniformLocationForName('u_toneCurveTexture');
    toneCurveProgram.loc_amount = toneCurveProgram.getUniformLocationForName('u_amount');
    toneCurveProgram.setUniformLocationWith1i(toneCurveProgram.loc_toneCurveTexture, 1);
    shaderCache.addProgram(toneCurveProgram, 'ToneCurve');

    const gradientColorMapProgram = new cc.GLProgram();
    gradientColorMapProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexVertex.glsl'), glslify('./../../shaders/GradientColorMapFragment.glsl'));
    gradientColorMapProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    gradientColorMapProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    gradientColorMapProgram.link();
    gradientColorMapProgram.updateUniforms();
    gradientColorMapProgram.loc_fromColorBlack = gradientColorMapProgram.getUniformLocationForName('u_fromColorBlack');
    gradientColorMapProgram.loc_fromColorMid = gradientColorMapProgram.getUniformLocationForName('u_fromColorMid');
    gradientColorMapProgram.loc_fromColorWhite = gradientColorMapProgram.getUniformLocationForName('u_fromColorWhite');
    gradientColorMapProgram.loc_toColorBlack = gradientColorMapProgram.getUniformLocationForName('u_toColorBlack');
    gradientColorMapProgram.loc_toColorMid = gradientColorMapProgram.getUniformLocationForName('u_toColorMid');
    gradientColorMapProgram.loc_toColorWhite = gradientColorMapProgram.getUniformLocationForName('u_toColorWhite');
    gradientColorMapProgram.loc_phase = gradientColorMapProgram.getUniformLocationForName('u_phase');
    shaderCache.addProgram(gradientColorMapProgram, 'GradientColorMap');

    const dissolveProgram = new cc.GLProgram();
    dissolveProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/DissolveFragment.glsl'));
    dissolveProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    dissolveProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    dissolveProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    dissolveProgram.link();
    dissolveProgram.updateUniforms();
    dissolveProgram.loc_seed = dissolveProgram.getUniformLocationForName('u_seed');
    dissolveProgram.loc_frequency = dissolveProgram.getUniformLocationForName('u_frequency');
    dissolveProgram.loc_amplitude = dissolveProgram.getUniformLocationForName('u_amplitude');
    dissolveProgram.loc_vignetteStrength = dissolveProgram.getUniformLocationForName('u_vignetteStrength');
    dissolveProgram.loc_edgeFalloff = dissolveProgram.getUniformLocationForName('u_edgeFalloff');
    dissolveProgram.loc_time = dissolveProgram.getUniformLocationForName('u_time');
    shaderCache.addProgram(dissolveProgram, 'Dissolve');

    const dissolveWithDiscFromCenterProgram = new cc.GLProgram();
    dissolveWithDiscFromCenterProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/DissolveFromCenterWithDiscFragment.glsl'));
    dissolveWithDiscFromCenterProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    dissolveWithDiscFromCenterProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    dissolveWithDiscFromCenterProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    dissolveWithDiscFromCenterProgram.link();
    dissolveWithDiscFromCenterProgram.updateUniforms();
    dissolveWithDiscFromCenterProgram.loc_time = dissolveWithDiscFromCenterProgram.getUniformLocationForName('u_time');
    dissolveWithDiscFromCenterProgram.loc_phase = dissolveWithDiscFromCenterProgram.getUniformLocationForName('u_phase');
    dissolveWithDiscFromCenterProgram.loc_texResolution = dissolveWithDiscFromCenterProgram.getUniformLocationForName('u_texResolution');
    shaderCache.addProgram(dissolveWithDiscFromCenterProgram, 'DissolveWithDiscFromCenter');

    const energyBallProgram = new cc.GLProgram();
    energyBallProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/EnergyBallFragment.glsl'));
    energyBallProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    energyBallProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    energyBallProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    energyBallProgram.link();
    energyBallProgram.updateUniforms();
    energyBallProgram.loc_time = energyBallProgram.getUniformLocationForName('u_time');
    energyBallProgram.loc_texResolution = energyBallProgram.getUniformLocationForName('u_texResolution');
    energyBallProgram.loc_timeScale = energyBallProgram.getUniformLocationForName('u_timeScale');
    energyBallProgram.loc_noiseLevel = energyBallProgram.getUniformLocationForName('u_noiseLevel');
    shaderCache.addProgram(energyBallProgram, 'EnergyBall');

    const fireRingProgram = new cc.GLProgram();
    fireRingProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/FireRingFragment.glsl'));
    fireRingProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    fireRingProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    fireRingProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    fireRingProgram.link();
    fireRingProgram.updateUniforms();
    fireRingProgram.loc_texResolution = fireRingProgram.getUniformLocationForName('u_texResolution');
    fireRingProgram.loc_time = fireRingProgram.getUniformLocationForName('u_time');
    fireRingProgram.loc_phase = fireRingProgram.getUniformLocationForName('u_phase');
    fireRingProgram.loc_color = fireRingProgram.getUniformLocationForName('u_color');
    shaderCache.addProgram(fireRingProgram, 'FireRing');

    const fireRingFlareWarpedProgram = new cc.GLProgram();
    fireRingFlareWarpedProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/FireRingFlareWarpedFragment.glsl'));
    fireRingFlareWarpedProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    fireRingFlareWarpedProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    fireRingFlareWarpedProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    fireRingFlareWarpedProgram.link();
    fireRingFlareWarpedProgram.updateUniforms();
    fireRingFlareWarpedProgram.loc_texResolution = fireRingFlareWarpedProgram.getUniformLocationForName('u_texResolution');
    fireRingFlareWarpedProgram.loc_time = fireRingFlareWarpedProgram.getUniformLocationForName('u_time');
    fireRingFlareWarpedProgram.loc_phase = fireRingFlareWarpedProgram.getUniformLocationForName('u_phase');
    fireRingFlareWarpedProgram.loc_color = fireRingFlareWarpedProgram.getUniformLocationForName('u_color');
    shaderCache.addProgram(fireRingFlareWarpedProgram, 'FireRingFlareWarped');

    const lensNoiseProgram = new cc.GLProgram();
    lensNoiseProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/LensNoiseFragment.glsl'));
    lensNoiseProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    lensNoiseProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    lensNoiseProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    lensNoiseProgram.link();
    lensNoiseProgram.updateUniforms();
    lensNoiseProgram.loc_time = lensNoiseProgram.getUniformLocationForName('u_time');
    lensNoiseProgram.loc_flareAmount = lensNoiseProgram.getUniformLocationForName('u_flareAmount');
    lensNoiseProgram.loc_texResolution = lensNoiseProgram.getUniformLocationForName('u_texResolution');
    shaderCache.addProgram(lensNoiseProgram, 'LensNoise');

    const whiteCloudVignetteProgram = new cc.GLProgram();
    whiteCloudVignetteProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/WhiteCloudVignetteFragment.glsl'));
    whiteCloudVignetteProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    whiteCloudVignetteProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    whiteCloudVignetteProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    whiteCloudVignetteProgram.link();
    whiteCloudVignetteProgram.updateUniforms();
    whiteCloudVignetteProgram.loc_time = whiteCloudVignetteProgram.getUniformLocationForName('u_time');
    whiteCloudVignetteProgram.loc_texResolution = whiteCloudVignetteProgram.getUniformLocationForName('u_texResolution');
    whiteCloudVignetteProgram.loc_vignetteAmount = whiteCloudVignetteProgram.getUniformLocationForName('u_vignetteAmount');
    whiteCloudVignetteProgram.loc_noiseAmount = whiteCloudVignetteProgram.getUniformLocationForName('u_noiseAmount');
    shaderCache.addProgram(whiteCloudVignetteProgram, 'WhiteCloudVignette');

    const fireLinearWaveShaderProgram = new cc.GLProgram();
    fireLinearWaveShaderProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/FireLinearWaveFragment.glsl'));
    fireLinearWaveShaderProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    fireLinearWaveShaderProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    fireLinearWaveShaderProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    fireLinearWaveShaderProgram.link();
    fireLinearWaveShaderProgram.updateUniforms();
    fireLinearWaveShaderProgram.loc_resolution = fireLinearWaveShaderProgram.getUniformLocationForName('u_resolution');
    fireLinearWaveShaderProgram.loc_time = fireLinearWaveShaderProgram.getUniformLocationForName('u_time');
    fireLinearWaveShaderProgram.loc_phase = fireLinearWaveShaderProgram.getUniformLocationForName('u_phase');
    shaderCache.addProgram(fireLinearWaveShaderProgram, 'FireLinearWave');

    const glowImageMapControlProgram = new cc.GLProgram();
    glowImageMapControlProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/GlowImageMapControlFragment.glsl'));
    glowImageMapControlProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    glowImageMapControlProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    glowImageMapControlProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    glowImageMapControlProgram.link();
    glowImageMapControlProgram.updateUniforms();
    glowImageMapControlProgram.loc_texResolution = glowImageMapControlProgram.getUniformLocationForName('u_texResolution');
    glowImageMapControlProgram.loc_time = glowImageMapControlProgram.getUniformLocationForName('u_time');
    glowImageMapControlProgram.loc_color = glowImageMapControlProgram.getUniformLocationForName('u_color');
    glowImageMapControlProgram.loc_intensity = glowImageMapControlProgram.getUniformLocationForName('u_intensity');
    glowImageMapControlProgram.loc_gamma = glowImageMapControlProgram.getUniformLocationForName('u_gamma');
    glowImageMapControlProgram.loc_levelsInWhite = glowImageMapControlProgram.getUniformLocationForName('u_levelsInWhite');
    glowImageMapControlProgram.loc_levelsInBlack = glowImageMapControlProgram.getUniformLocationForName('u_levelsInBlack');
    shaderCache.addProgram(glowImageMapControlProgram, 'GlowImageMapControl');

    const glowImageMapRippleProgram = new cc.GLProgram();
    glowImageMapRippleProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/GlowImageMapRippleFragment.glsl'));
    glowImageMapRippleProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    glowImageMapRippleProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    glowImageMapRippleProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    glowImageMapRippleProgram.link();
    glowImageMapRippleProgram.updateUniforms();
    glowImageMapRippleProgram.loc_time = glowImageMapRippleProgram.getUniformLocationForName('u_time');
    glowImageMapRippleProgram.loc_intensity = glowImageMapRippleProgram.getUniformLocationForName('u_intensity');
    glowImageMapRippleProgram.loc_texResolution = glowImageMapRippleProgram.getUniformLocationForName('u_texResolution');
    shaderCache.addProgram(glowImageMapRippleProgram, 'GlowImageMapRipple');

    const fbmPolarFlareShaderProgram = new cc.GLProgram();
    fbmPolarFlareShaderProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/FbmPolarFlareFragment.glsl'));
    fbmPolarFlareShaderProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    fbmPolarFlareShaderProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    fbmPolarFlareShaderProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    fbmPolarFlareShaderProgram.link();
    fbmPolarFlareShaderProgram.updateUniforms();
    fbmPolarFlareShaderProgram.loc_size = fbmPolarFlareShaderProgram.getUniformLocationForName('u_size');
    fbmPolarFlareShaderProgram.loc_time = fbmPolarFlareShaderProgram.getUniformLocationForName('u_time');
    fbmPolarFlareShaderProgram.loc_phase = fbmPolarFlareShaderProgram.getUniformLocationForName('u_phase');
    fbmPolarFlareShaderProgram.loc_flareColor = fbmPolarFlareShaderProgram.getUniformLocationForName('u_flareColor');
    shaderCache.addProgram(fbmPolarFlareShaderProgram, 'FbmPolarFlare');

    const fbmNoiseRaysShaderProgram = new cc.GLProgram();
    fbmNoiseRaysShaderProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/FbmNoiseRays.glsl'));
    fbmNoiseRaysShaderProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    fbmNoiseRaysShaderProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    fbmNoiseRaysShaderProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    fbmNoiseRaysShaderProgram.link();
    fbmNoiseRaysShaderProgram.updateUniforms();
    fbmNoiseRaysShaderProgram.loc_texResolution = fbmNoiseRaysShaderProgram.getUniformLocationForName('u_texResolution');
    fbmNoiseRaysShaderProgram.loc_time = fbmNoiseRaysShaderProgram.getUniformLocationForName('u_time');
    shaderCache.addProgram(fbmNoiseRaysShaderProgram, 'FbmNoiseRays');

    const fbmNoiseGradientMaskProgram = new cc.GLProgram();
    fbmNoiseGradientMaskProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/FbmNoiseGradientMask.glsl'));
    fbmNoiseGradientMaskProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    fbmNoiseGradientMaskProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    fbmNoiseGradientMaskProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    fbmNoiseGradientMaskProgram.link();
    fbmNoiseGradientMaskProgram.updateUniforms();
    fbmNoiseGradientMaskProgram.loc_texResolution = fbmNoiseGradientMaskProgram.getUniformLocationForName('u_texResolution');
    fbmNoiseGradientMaskProgram.loc_time = fbmNoiseGradientMaskProgram.getUniformLocationForName('u_time');
    shaderCache.addProgram(fbmNoiseGradientMaskProgram, 'FbmNoiseGradientMask');

    const levelsShaderProgram = new cc.GLProgram();
    levelsShaderProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexVertex.glsl'), glslify('./../../shaders/LevelsFragment.glsl'));
    levelsShaderProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    levelsShaderProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    levelsShaderProgram.link();
    levelsShaderProgram.updateUniforms();
    levelsShaderProgram.loc_inGamma = levelsShaderProgram.getUniformLocationForName('u_inGamma');
    levelsShaderProgram.loc_inBlack = levelsShaderProgram.getUniformLocationForName('u_inBlack');
    levelsShaderProgram.loc_outBlack = levelsShaderProgram.getUniformLocationForName('u_outBlack');
    levelsShaderProgram.loc_inWhite = levelsShaderProgram.getUniformLocationForName('u_inWhite');
    levelsShaderProgram.loc_outWhite = levelsShaderProgram.getUniformLocationForName('u_outWhite');
    shaderCache.addProgram(levelsShaderProgram, 'Levels');

    const cardAngleGradientShineProgram = new cc.GLProgram();
    cardAngleGradientShineProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/CardAngledGradientShine.glsl'));
    cardAngleGradientShineProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    cardAngleGradientShineProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    cardAngleGradientShineProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    cardAngleGradientShineProgram.link();
    cardAngleGradientShineProgram.updateUniforms();
    cardAngleGradientShineProgram.loc_phase = cardAngleGradientShineProgram.getUniformLocationForName('u_phase');
    cardAngleGradientShineProgram.loc_time = cardAngleGradientShineProgram.getUniformLocationForName('u_time');
    cardAngleGradientShineProgram.loc_intensity = cardAngleGradientShineProgram.getUniformLocationForName('u_intensity');
    cardAngleGradientShineProgram.loc_texResolution = cardAngleGradientShineProgram.getUniformLocationForName('u_texResolution');
    shaderCache.addProgram(cardAngleGradientShineProgram, 'CardAngledGradientShine');

    const colorizeProgram = new cc.GLProgram();
    colorizeProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/ColorizeFragment.glsl'));
    colorizeProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    colorizeProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    colorizeProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    colorizeProgram.link();
    colorizeProgram.updateUniforms();
    shaderCache.addProgram(colorizeProgram, 'Colorize');

    const rarityFlareProgram = new cc.GLProgram();
    rarityFlareProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/RarityFlareFragment.glsl'));
    rarityFlareProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    rarityFlareProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    rarityFlareProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    rarityFlareProgram.link();
    rarityFlareProgram.updateUniforms();
    rarityFlareProgram.loc_phase = rarityFlareProgram.getUniformLocationForName('u_phase');
    rarityFlareProgram.loc_time = rarityFlareProgram.getUniformLocationForName('u_time');
    rarityFlareProgram.loc_texResolution = rarityFlareProgram.getUniformLocationForName('u_texResolution');
    shaderCache.addProgram(rarityFlareProgram, 'RarityFlare');

    // NOTE: HorizontalGlowFlare is very similar to 'RarityFlare' program but has lower intensity and does not force 1:1 aspect.
    const horizontalGlowFlare = new cc.GLProgram();
    horizontalGlowFlare.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/HorizontalGlowFlareFragment.glsl'));
    horizontalGlowFlare.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    horizontalGlowFlare.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    horizontalGlowFlare.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    horizontalGlowFlare.link();
    horizontalGlowFlare.updateUniforms();
    horizontalGlowFlare.loc_phase = horizontalGlowFlare.getUniformLocationForName('u_phase');
    horizontalGlowFlare.loc_time = horizontalGlowFlare.getUniformLocationForName('u_time');
    horizontalGlowFlare.loc_texResolution = horizontalGlowFlare.getUniformLocationForName('u_texResolution');
    shaderCache.addProgram(horizontalGlowFlare, 'HorizontalGlowFlare');

    const shadowBlobProgram = new cc.GLProgram();
    shadowBlobProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/ShadowBlobFragment.glsl'));
    shadowBlobProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    shadowBlobProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    shadowBlobProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    shadowBlobProgram.link();
    shadowBlobProgram.updateUniforms();
    shadowBlobProgram.loc_time = shadowBlobProgram.getUniformLocationForName('u_time');
    shadowBlobProgram.loc_texResolution = shadowBlobProgram.getUniformLocationForName('u_texResolution');
    shaderCache.addProgram(shadowBlobProgram, 'ShadowBlob');

    const coreGemProgram = new cc.GLProgram();
    coreGemProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/CoreGemFragment.glsl'));
    coreGemProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    coreGemProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    coreGemProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    coreGemProgram.link();
    coreGemProgram.updateUniforms();
    coreGemProgram.loc_time = coreGemProgram.getUniformLocationForName('u_time');
    coreGemProgram.loc_texResolution = coreGemProgram.getUniformLocationForName('u_texResolution');
    coreGemProgram.loc_cubeMap = coreGemProgram.getUniformLocationForName('u_cubeMap');
    coreGemProgram.loc_gemSeed = coreGemProgram.getUniformLocationForName('u_gemSeed');
    coreGemProgram.setUniformLocationWith1i(coreGemProgram.loc_cubeMap, 1);
    shaderCache.addProgram(coreGemProgram, 'CoreGem');

    const coreGemEdgesAndColorizeFragmentProgram = new cc.GLProgram();
    coreGemEdgesAndColorizeFragmentProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/CoreGemEdgesAndColorizeFragment.glsl'));
    coreGemEdgesAndColorizeFragmentProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    coreGemEdgesAndColorizeFragmentProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    coreGemEdgesAndColorizeFragmentProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    coreGemEdgesAndColorizeFragmentProgram.link();
    coreGemEdgesAndColorizeFragmentProgram.updateUniforms();
    coreGemEdgesAndColorizeFragmentProgram.loc_texResolution = coreGemEdgesAndColorizeFragmentProgram.getUniformLocationForName('u_texResolution');
    coreGemEdgesAndColorizeFragmentProgram.loc_colorBlackPoint = coreGemEdgesAndColorizeFragmentProgram.getUniformLocationForName('u_colorBlackPoint');
    coreGemEdgesAndColorizeFragmentProgram.loc_colorMidPoint = coreGemEdgesAndColorizeFragmentProgram.getUniformLocationForName('u_colorMidPoint');
    shaderCache.addProgram(coreGemEdgesAndColorizeFragmentProgram, 'CoreGemEdgesAndColorizeFragment');

    const polarFlareWipeProgram = new cc.GLProgram();
    polarFlareWipeProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/FbmPolarFlareWipeFragment.glsl'));
    polarFlareWipeProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    polarFlareWipeProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    polarFlareWipeProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    polarFlareWipeProgram.link();
    polarFlareWipeProgram.updateUniforms();
    polarFlareWipeProgram.loc_phase = polarFlareWipeProgram.getUniformLocationForName('u_phase');
    polarFlareWipeProgram.loc_time = polarFlareWipeProgram.getUniformLocationForName('u_time');
    polarFlareWipeProgram.loc_size = polarFlareWipeProgram.getUniformLocationForName('u_size');
    shaderCache.addProgram(polarFlareWipeProgram, 'FbmPolarFlareWipe');

    const timerProgram = new cc.GLProgram();
    timerProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/TimerFragment.glsl'));
    timerProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    timerProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    timerProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    timerProgram.link();
    timerProgram.updateUniforms();
    timerProgram.loc_progress = timerProgram.getUniformLocationForName('u_progress');
    timerProgram.loc_startingAngle = timerProgram.getUniformLocationForName('u_startingAngle');
    timerProgram.loc_edgeGradientFactor = timerProgram.getUniformLocationForName('u_edgeGradientFactor');
    timerProgram.loc_bgColor = timerProgram.getUniformLocationForName('u_bgColor');
    timerProgram.loc_texResolution = timerProgram.getUniformLocationForName('u_texResolution');
    shaderCache.addProgram(timerProgram, 'Timer');

    const causticProgram = new cc.GLProgram();
    causticProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/CausticFragment.glsl'));
    causticProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    causticProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    causticProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    causticProgram.link();
    causticProgram.updateUniforms();
    causticProgram.loc_time = causticProgram.getUniformLocationForName('u_time');
    causticProgram.loc_texResolution = causticProgram.getUniformLocationForName('u_texResolution');
    shaderCache.addProgram(causticProgram, 'Caustic');

    const riftLineProgram = new cc.GLProgram();
    riftLineProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/RiftLineFragment.glsl'));
    riftLineProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    riftLineProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    riftLineProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    riftLineProgram.link();
    riftLineProgram.updateUniforms();
    riftLineProgram.loc_texResolution = riftLineProgram.getUniformLocationForName('u_texResolution');
    riftLineProgram.loc_time = riftLineProgram.getUniformLocationForName('u_time');
    riftLineProgram.loc_progress = riftLineProgram.getUniformLocationForName('u_progress');
    // riftLineProgram.loc_color = riftLineProgram.getUniformLocationForName("u_color");
    shaderCache.addProgram(riftLineProgram, 'RiftLine');

    const riftFireProgram = new cc.GLProgram();
    riftFireProgram.initWithVertexShaderByteArray(glslify('./../../shaders/helpers/PosTexColorVertex.glsl'), glslify('./../../shaders/RiftFireFragment.glsl'));
    riftFireProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
    riftFireProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
    riftFireProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
    riftFireProgram.link();
    riftFireProgram.updateUniforms();
    riftFireProgram.loc_texResolution = riftFireProgram.getUniformLocationForName('u_texResolution');
    riftFireProgram.loc_time = riftFireProgram.getUniformLocationForName('u_time');
    shaderCache.addProgram(riftFireProgram, 'RiftFire');
  }
};

function SurfaceCompositeRenderCmd(fx) {
  this._needDraw = true;
  this._fx = fx;
}
SurfaceCompositeRenderCmd.prototype = {
  constructor: SurfaceCompositeRenderCmd,
  getNeedsPerspectiveProjection() {
    return false;
  },
};

function BeginSurfaceCompositeRenderCmd(fx) {
  SurfaceCompositeRenderCmd.call(this, fx);
}
BeginSurfaceCompositeRenderCmd.prototype = Object.create(SurfaceCompositeRenderCmd.prototype);
BeginSurfaceCompositeRenderCmd.constructor = BeginSurfaceCompositeRenderCmd;
BeginSurfaceCompositeRenderCmd.prototype.rendering = function () {
  // start drawing into fx for post processing
  this._fx.beginSurfaceWithClear();
};

function EndSurfaceCompositeRenderCmd(fx) {
  SurfaceCompositeRenderCmd.call(this, fx);
}
EndSurfaceCompositeRenderCmd.prototype = Object.create(SurfaceCompositeRenderCmd.prototype);
EndSurfaceCompositeRenderCmd.constructor = EndSurfaceCompositeRenderCmd;
EndSurfaceCompositeRenderCmd.prototype.rendering = function () {
  // end drawing into fx for post processing
  this._fx.endSurfaceWithComposite();
};

module.exports = FX;
