
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var UtilsEngine = require('app/common/utils/utils_engine');
var TweenTypes = require('./../actions/TweenTypes');
var RenderPass = require('./../fx/RenderPass');
var BaseSpriteComponent = require('./components/BaseSpriteComponent');
var CompositePass = require('./components/CompositePass');
var CompositeHorizontalPass = require('./components/CompositeHorizontalPass');
var CompositeVerticalPass = require('./components/CompositeVerticalPass');
var CompositeVerticalBeforePass = require('./components/CompositeVerticalBeforePass');
var CompositeVerticalAfterPass = require('./components/CompositeVerticalAfterPass');
var BatchLighting = require('./../fx/BatchLighting');
var _ = require("underscore");

/****************************************************************************
 BaseSprite
 var BaseSprite = cc.Sprite
 BaseSprite.create()
 ****************************************************************************/

var BaseSprite = cc.Sprite.extend({
	// resource/file path for sprite texture
	// if it is an array of paths, getSpriteIdentifier will return one at random
	spriteIdentifier: null,
	// string identifier for a shader program
	shaderKey: null,
	// mask texture to crop the sprite
	mask: null,
	// mask rect to size the mask texture relative to the sprite's size
	maskRect: null,
	// how much of the sprite's color to use as additive tint, rgba 0 to 255
	// setting the tint alpha value to 0 disables tint and any tint alpha value > 0 enables tint
	tint: null,
	// whether sprite should be anti aliased
	antiAlias: true,
	// whether sprite should be drawn into the depth buffer
	needsDepthDraw: false,
	// whether to draw sprite using a simple depth test shader
	// note: for now, depth testing will set the shader to the basic color/tex draw
	needsDepthTest: false,
	// depth offset to artificially change depth value, where lower values are further away
	// also used to aid in calculating correct depth/normal information in lighting
	depthOffset: 0.0,
	// whether to record depth as if sprite is facing screen (0.0) or flat on ground (1.0)
	depthModifier: 0.0,
	// whether sprite receives light
	occludes: false,
	// ambient light color of this sprite
	ambientLightColor: new cc.color(0, 0, 0),
	// whether sprite casts shadows from lights
	castsShadows: false,
	// where the actual "foot" position of the sprite is, from the bottom of the sprite
	shadowOffset: 0.0,
	// static shadow sprite string or options object, offset from bottom of sprite by shadow offset
	staticShadow: null,
	// opacity of the static shadow when in use
	staticShadowOpacity: 150,
	// where the actual "foot" position of the static shadow is, from the bottom of the sprite
	staticShadowOffset: 0.0,
	// scale of light accumulation map (lower is faster but less accurate)
	lightMapScale: 0.5,
	// normal or facing direction of sprite, by default sprites are facing screen
	normal: new cc.kmVec3(0.0, 0.0, -1.0),
	// rotation of normal or facing direction, as a vec3 of radians
	depthRotation: new cc.kmVec3(),
	// whether sprite should be colored based on what player "owns" the sprite: white for my player and red for opponent
	// currently this only is applied to sprites as shown by a SDK Node
	// this is because sprites do not have the concept of an owner, and so this must be applied externally
	colorByOwner: false,
	// whether sprite is dissolving
	dissolving: false,
	// seed to generate dissolve noise
	dissolveSeed: 0.5,
	// frequency or size of dissolve, where higher is smaller
	dissolveFrequency: 15.0,
	// amplitude or strength of dissolve, where higher is stronger
	dissolveAmplitude: 0.5,
	// strength of dissolve vignette effect, between 0.0 and 1.0, where 1.0 is a full vignette effect
	dissolveVignetteStrength: 1.0,
	// falloff distance of dissolve edge burn effect, between 0.0 and 1.0, where 0.0 is no burn
	dissolveEdgeFalloff: 0.25,
	_dissolveTime: 0.0,
	// whether sprite should level colors
	leveled: false,
	// levels controls, gamma between 0.0 and infinity and white/black between 0 and 255
	levelsInGamma: 1.0,
	levelsInBlack: 0.0,
	levelsOutBlack: 0.0,
	levelsInWhite: 255.0,
	levelsOutWhite: 255.0,
	// map of components currently active on this sprite
	_componentsById: null,

	/* region INITIALIZATION */

	ctor: function (options) {
		this._componentsById = {};

		// set spriteIdentifier
		var spriteIdentifier;
		var texture;
		if (options != null) {
			// set sprite identifier in case of array
			// this way when we get an identifier we'll get a random one
			if (typeof options === "string" || _.isArray(options)) {
				this.setSpriteIdentifier(options);
			} else {
				texture = options instanceof cc.Texture2D ? options : options.texture;
				if (!texture) {
					spriteIdentifier = options.spriteIdentifier;
					if (spriteIdentifier) {
						this.setSpriteIdentifier(spriteIdentifier);
					}
				}
			}
		}
		spriteIdentifier = this.getSpriteIdentifier();

		// find spriteFrame
		var spriteFrame = UtilsEngine.getSpriteFrameFromIdentifier(spriteIdentifier);

		// do super ctor with spriteFrame and fallback to spriteIdentifier
		this._super(spriteFrame || spriteIdentifier || texture);

		// setup defaults
		this.setDefaultOptions();

		// apply options
		if (_.isObject(options)) {
			this.setOptions(options);
		}

		// update aliasing only if we're not anti aliasing
		// cocos defaults to anti aliasing all textures
		if (!this.antiAlias) {
			this._updateAliasing();
		}
	},

	_createRenderCmd: function(){
		if(cc._renderType === cc._RENDER_TYPE_CANVAS) {
			return this._super();
		} else {
			return new BaseSprite.WebGLRenderCmd(this);
		}
	},

	setDefaultOptions: function () {
		// all base sprites should have a centered anchor point
		this.setAnchorPoint(0.5, 0.5);

		// copy prototype values down into this instance
		if (this.ambientLightColor) { this.setAmbientLightColor(this.ambientLightColor); }
		if (this.depthRotation) { this.setDepthRotation(this.depthRotation); }
		if (this.normal) { this.setNormal(this.normal); }
		if (this.tint) { this.setTint(this.tint); }
		if (this.shaderKey) { this.setShaderKey(this.shaderKey); }
	},

	setOptions: function (options) {
		this._super(options);
		if (options.shaderKey != null) { this.setShaderKey(options.shaderKey); }
		if ( options.antiAlias != null) { this.setAntiAlias(options.antiAlias); }
		if ( options.tint != null) { this.setTint(options.tint); }
		if ( options.needsDepthDraw != null) { this.setNeedsDepthDraw(options.needsDepthDraw); }
		if ( options.needsDepthTest != null) { this.setNeedsDepthTest(options.needsDepthTest); }
		if ( options.depthOffset != null) { this.setDepthOffset(options.depthOffset); }
		if ( options.depthModifier != null) { this.setDepthModifier(options.depthModifier); }
		if ( options.occludes != null) { this.setOccludes(options.occludes); }
		if ( options.ambientLightColor != null) { this.setAmbientLightColor(options.ambientLightColor); }
		if ( options.castsShadows != null) { this.setCastsShadows(options.castsShadows); }
		if ( options.shadowOffset != null) { this.setShadowOffset(options.shadowOffset); }
		if ( options.staticShadow != null) { this.setStaticShadow(options.staticShadow); }
		if ( options.staticShadowOpacity != null) { this.setStaticShadowOpacity(options.staticShadowOpacity); }
		if ( options.staticShadowOffset != null) { this.setStaticShadowOffset(options.staticShadowOffset); }
		if ( options.lightMapScale != null) { this.setLightMapScale(options.lightMapScale); }
		if (options.normal) { this.setNormal(options.normal); }
		if (options.depthRotation) { this.setDepthRotation(options.depthRotation); }
		if (options.colorByOwner != null) { this.setColorByOwner(options.colorByOwner); }
		if (options.dissolving != null) { this.setDissolving(options.dissolving); }
		if (options.dissolveSeed != null) { this.setDissolveSeed(options.dissolveSeed); }
		if (options.dissolveFrequency != null) { this.setDissolveFrequency(options.dissolveFrequency); }
		if (options.dissolveAmplitude != null) { this.setDissolveAmplitude(options.dissolveAmplitude); }
		if (options.dissolveVignetteStrength != null) { this.setDissolveVignetteStrength(options.dissolveVignetteStrength); }
		if (options.dissolveEdgeFalloff != null) { this.setDissolveEdgeFalloff(options.dissolveEdgeFalloff); }
		if (options.leveled != null) { this.setLeveled(options.leveled); }
		if (options.levelsInGamma != null) { this.setLevelsInGamma(options.levelsInGamma); }
		if (options.levelsInBlack != null) { this.setLevelsInBlack(options.levelsInBlack); }
		if (options.levelsOutBlack != null) { this.setLevelsOutBlack(options.levelsOutBlack); }
		if (options.levelsInWhite != null) { this.setLevelsInWhite(options.levelsInWhite); }
		if (options.levelsOutWhite != null) { this.setLevelsOutWhite(options.levelsOutWhite); }
	},

	_updateAliasing: function () {
		var texture = this.getTexture();
		if (texture) {
			if(this.antiAlias) {
				texture.setAntiAliasTexParameters();
			} else {
				texture.setAliasTexParameters();
			}
		}
	},

	onEnter: function () {
		cc.Sprite.prototype.onEnter.call(this);

		this._renderCmd.onEnter();

		if(this.getOccludes()) { this.setupOcclusion(); }
		if(this.getCastsShadows()) { this.setupShadowCasting(); }
		if(this.staticShadow) { this.setupStaticShadow(); }
	},
	onExit: function () {
		if(this.staticShadow) { this.teardownStaticShadow(); }
		if(this.getCastsShadows()) this.teardownShadowCasting();
		if(this.getOccludes()) this.teardownOcclusion();

		this._renderCmd.onExit();

		cc.Sprite.prototype.onExit.call(this);
	},

	/* endregion INITIALIZATION */

	/* region POOLING */

	reuse: function () {
		// do not set texture or sprite frame for improved performance
		// do not try to pool complex sprites such as BaseSprite as they have far too many properties
		// instead pool simple subclasses that tend to only change sprite frames or textures
		// you must also call "cc.pool.putInPool(this);" during the subclass's onExit method
		// and call "cc.pool.getFromPool(SubClass, options)" to get an instance from the pool on construction
	},

	unuse: function () {
		// override in sub class to disable sprite for pooling
	},

	/* endregion POOLING */

	/* region GETTERS / SETTERS */

	/**
	 * Sets the sprite's texture identifier.
	 * NOTE: does not change the texture after the texture has already been set!
	 * @param {String|Array} spriteIdentifier
	 */
	setSpriteIdentifier: function (spriteIdentifier) {
		this.spriteIdentifier = spriteIdentifier;
		this._cachedSpriteIdentifier = null;
	},
	getSpriteIdentifier: function () {
		// the sprite identifier can be either a string or an array
		// in the case of an array, we'll pick at random
		// store random choice for animation so it is always the same
		if (this._cachedSpriteIdentifier == null && this.spriteIdentifier != null) {
			if (_.isArray(this.spriteIdentifier)) {
				this._cachedSpriteIdentifier = this.spriteIdentifier[_.random(0, this.spriteIdentifier.length - 1)];
			} else {
				this._cachedSpriteIdentifier = this.spriteIdentifier;
			}
		}
		return this._cachedSpriteIdentifier;
	},

	setShaderKey: function (shaderKey) {
		this.shaderKey = shaderKey;
		var shaderProgram = cc.shaderCache.programForKey(shaderKey);
		if (shaderProgram) {
			this.setShaderProgram(shaderProgram);
		}
	},
	getShaderKey: function () {
		return this.shaderKey;
	},
	/**
	 * Sets the masking texture.
	 * @param {String|Texture|null} mask
	 * @param {cc.Rect} rect rectangle to size mask relative to sprite size
	 */
	setMask: function (mask, rect) {
		if (_.isString(mask)) {
			var texture = cc.textureCache.getTextureForKey(mask);
			if (texture != null) {
				mask = texture;
			}
		}
		if (this.mask != mask) {
			this.mask = mask;

			// auto manage mask component
			this.autoManageComponentById(this.getIsMasked(), "Mask", this.createMaskComponent.bind(this));
		}

		this.setMaskRect(rect);
	},
	createMaskComponent: function () {
		return new CompositeHorizontalPass(this, cc.shaderCache.programForKey("Mask"), this.setupMaskRender.bind(this));
	},
	setupMaskRender: function (shaderProgram) {
		this._renderCmd.setDefaultMatricesAndBlendModesForDraw(shaderProgram);
		cc.glBindTexture2DN(1, this.getMask());
		var maskRect = this.getMaskRect();
		if (maskRect == null) {
			// use texture rect as fallback
			maskRect = this._rect;
		}
		shaderProgram.setUniformLocationWith4f(shaderProgram.loc_maskRect, maskRect.x, maskRect.y, maskRect.width, maskRect.height);
	},
	getMask: function () {
		return this.mask;
	},
	getMaskRect: function () {
		return this.maskRect;
	},
	setMaskRect: function (rect) {
		if (this.maskRect != rect && !cc.rectEqualToRect(this.maskRect, rect)) {
			this.maskRect = rect;
			this._renderCmd.setCompositeDirty();
		}
	},
	getIsMasked: function () {
		return this.mask != null;
	},
	/**
	 * Sets the sprite's tint, which changes the color of the sprite towards the tint based on the tint alpha.
	 * NOTE: this uses a horizontal rendering component, which may be performance intensive in some cases.
	 * @param {cc.Color} tint
	 */
	setTint: function (tint) {
		var a = tint.a != null ? tint.a : (this.tint && this.tint.a || 0);
		if (this.tint == null || !cc.colorEqual(this.tint, tint) || (this.tint.a != a)) {
			this.tint = cc.color(tint.r, tint.g, tint.b, a);

			// auto manage tinting component
			this.autoManageComponentById(this.getTinted(), "Tinting", this.createTintingComponent.bind(this));
		}
	},
	createTintingComponent: function () {
		return new CompositeHorizontalPass(this, cc.shaderCache.programForKey("Tinting"), this.setupTintingRender.bind(this));
	},
	setupTintingRender: function (shaderProgram) {
		this._renderCmd.setDefaultMatricesAndBlendModesForDraw(shaderProgram);
		var tint = this.getTint();
		shaderProgram.setUniformLocationWith4f(shaderProgram.loc_tint, tint.r / 255.0, tint.g / 255.0, tint.b / 255.0, tint.a / 255.0);
	},
	getTint: function () {
		return this.tint;
	},
	getTinted: function () {
		return this.tint != null && this.tint.a > 0;
	},
	setAntiAlias: function (antiAlias) {
		if (this.antiAlias != antiAlias) {
			this.antiAlias = antiAlias;

			// update for changed aliasing
			this._updateAliasing();
		}
	},
	getAntiAlias: function () {
		return this.antiAlias;
	},
	setNeedsDepthTest: function (needsDepthTest) {
		this.needsDepthTest = needsDepthTest;
	},
	getNeedsDepthTest: function () {
		return this.needsDepthTest;
	},
	setNeedsDepthDraw: function (needsDepthDraw) {
		this.needsDepthDraw = needsDepthDraw;
	},
	getNeedsDepthDraw: function () {
		return this.needsDepthDraw;
	},
	setDepthModifier: function (depthModifier) {
		this.depthModifier = depthModifier;
	},
	getDepthModifier: function () {
		return this.depthModifier;
	},
	setDepthOffset: function (depthOffset) {
		this.depthOffset = depthOffset;
	},
	getDepthOffset: function () {
		return this.depthOffset;
	},
	setOccludes: function (occludes) {
		occludes || (occludes = false);
		if(this.occludes !== occludes) {
			this.occludes = occludes;
			if(this._running){
				if(this.getOccludes()) {
					this.setupOcclusion();
				}
				else {
					this.teardownOcclusion();
				}
			}
		}
	},
	getOccludes: function () {
		return this.occludes;
	},
	setupOcclusion: function () {
		this._renderCmd.setOcclusionNeedsRebuild();
		this.getFX().addOccluder(this);
	},
	teardownOcclusion: function () {
		this._renderCmd.setOcclusionNeedsRebuild();
		this.getFX().removeOccluder(this);
	},
	setLightsDirty: function () {
		this._renderCmd.setLightsDirty();
	},
	setAmbientLightColor: function (val) {
		var ambientLightColor = this.ambientLightColor;
		if(ambientLightColor &&
				(ambientLightColor.r !== val.r
				|| ambientLightColor.g !== val.g
				|| ambientLightColor.b !== val.b)) {
			// use a plain object so that the values can go negative
			// cocos doesn't allow negative color values
			this.ambientLightColor = {r: val.r, g: val.g, b: val.b};
		}
	},
	getAmbientLightColor: function () {
		return this.ambientLightColor;
	},
	setCastsShadows: function (castsShadows) {
		castsShadows || (castsShadows = false);
		if(this.castsShadows !== castsShadows) {
			this.castsShadows = castsShadows;
			if(this._running){
				if(this.getCastsShadows()) {
					this.setupShadowCasting();
				}
				else {
					this.teardownShadowCasting();
				}
			}
		}
	},
	getCastsShadows: function () {
		return this.castsShadows;
	},
	setupShadowCasting: function () {
		this._renderCmd.setOcclusionNeedsRebuild();
		this.getFX().addShadowCaster(this);
	},
	teardownShadowCasting: function () {
		this._renderCmd.setOcclusionNeedsRebuild();
		this.getFX().removeShadowCaster(this);
	},
	setShadowCastingLightsDirty: function () {
		this._renderCmd.setShadowCastingLightsDirty();
	},
	setLightMapScale: function (lightMapScale) {
		this.lightMapScale = lightMapScale;
		if(this._running){
			this._renderCmd.setOcclusionNeedsRebuild();
		}
	},
	getLightMapScale: function () {
		return this.lightMapScale;
	},
	setShadowOffset: function (shadowOffset) {
		this.shadowOffset = shadowOffset;
	},
	getShadowOffset: function () {
		return this.shadowOffset;
	},
	setStaticShadow: function (staticShadow) {
		if(this.staticShadow !== staticShadow) {
			this.staticShadow = staticShadow;
			if(this._running){
				if(this.staticShadow) {
					this.setupStaticShadow();
				}
				else {
					this.teardownStaticShadow();
				}
			}
		}
	},
	getStaticShadow: function () {
		return this.staticShadow;
	},
	setStaticShadowOpacity: function (staticShadowOpacity) {
		this.staticShadowOpacity = staticShadowOpacity;
	},
	getStaticShadowOpacity: function () {
		return this.staticShadowOpacity;
	},
	setStaticShadowOffset: function (staticShadowOffset) {
		this.staticShadowOffset = staticShadowOffset;
	},
	getStaticShadowOffset: function () {
		return this.staticShadowOffset;
	},
	setupStaticShadow: function () {
		this.staticShadowSprite = BaseSprite.create(this.staticShadow);
		this.staticShadowSprite.setOpacity(this.staticShadowOpacity);
		this.staticShadowSprite.setPosition(cc.p(this._contentSize.width * 0.5, this.staticShadowOffset));
		this.staticShadowSprite.setScale(1.0);
		this.addChild( this.staticShadowSprite, -9999 );
	},
	teardownStaticShadow: function () {
		if(this.staticShadowSprite) {
			this.staticShadowSprite.destroy(CONFIG.FADE_MEDIUM_DURATION);
			this.staticShadowSprite = null;
		}
	},
	/**
	 * Sets depth rotation for occlusion in radians.
	 * @param {Vec3} rotation
	 */
	setDepthRotation: function (rotation) {
		this.depthRotation = new cc.kmVec3(rotation.x, rotation.y, rotation.z);
		this._renderCmd.setDepthRotationDirty();
	},
	getDepthRotation: function () {
		return new cc.kmVec3(this.depthRotation.x, this.depthRotation.y, this.depthRotation.z);
	},
	/**
	 * Sets forward facing normal for occlusion.
	 * @param {Vec3} normal
	 */
	setNormal: function (normal) {
		if(!this.hasOwnProperty("normal")) {
			this.normal = new cc.kmVec3();
		}
		this.normal.x = normal.x;
		this.normal.y = normal.y;
		this.normal.z = normal.z;
	},
	setColorByOwner: function (colorByOwner) {
		this.colorByOwner = colorByOwner;
	},
	getColorByOwner: function () {
		return this.colorByOwner;
	},

	setContentSize: function (size, height) {
		var previousWidth = this._contentSize.width;
		var previousHeight = this._contentSize.height;

		cc.Sprite.prototype.setContentSize.call(this, size, height);

		if(this._running && (previousWidth !== this._contentSize.width || previousHeight !== this._contentSize.height)) {
			this.onContentSizeChanged();
		}
	},
	onContentSizeChanged: function () {
		this._renderCmd.setCompositeNeedsRebuild();
		this._renderCmd.setOcclusionNeedsRebuild();
	},
	setShaderProgram: function (program) {
		cc.Sprite.prototype.setShaderProgram.call(this, program);
		this._renderCmd.setCompositeDirty();
	},
	setBlendFunc: function (src, dst) {
		cc.Sprite.prototype.setBlendFunc.call(this, src, dst);
		this._renderCmd.setCompositeDirty();
	},
	setColor: function (color) {
		cc.Sprite.prototype.setColor.call(this, color);
		this._renderCmd.setCompositeDirty();
	},

	/**
	 * Pass in shader program and set any additional uniforms. This will be called during onBaseDraw of the render command and is intended for subclasses to easily set additional uniform values for their shaders.
	 * @param {Object} shaderProgram
	 */
	onBaseDrawSetAdditionalUniforms: function(shaderProgram) {
		// override in a sub class to set additional uniforms to a shader on base draw
	},
	/**
	 * Sets whether the sprite is dissolving. Use the dissolve time parameter to control the dissolve appearance.
	 * NOTE: this uses a horizontal rendering component, which may be performance intensive in some cases.
	 * @param {Boolean} dissolving
	 */
	setDissolving: function (dissolving) {
		if (this.dissolving !== dissolving) {
			this.dissolving = dissolving;
			this.resetDissolve();

			// auto manage dissolving component
			this.autoManageComponentById(this.getDissolving(), "Dissolve", this.createDissolvingComponent.bind(this));
		}
	},
	getDissolving: function () {
		return this.dissolving;
	},
	createDissolvingComponent: function () {
		return new CompositeHorizontalPass(this, cc.shaderCache.programForKey("Dissolve"), this.setupDissolvingRender.bind(this));
	},
	setupDissolvingRender: function (shaderProgram) {
		this._renderCmd.setDefaultMatricesAndBlendModesForDraw(shaderProgram);
		shaderProgram.setUniformLocationWith1f(shaderProgram.loc_seed, this.dissolveSeed);
		shaderProgram.setUniformLocationWith1f(shaderProgram.loc_frequency, this.dissolveFrequency);
		shaderProgram.setUniformLocationWith1f(shaderProgram.loc_amplitude, this.dissolveAmplitude);
		shaderProgram.setUniformLocationWith1f(shaderProgram.loc_vignetteStrength, this.dissolveVignetteStrength);
		shaderProgram.setUniformLocationWith1f(shaderProgram.loc_edgeFalloff, this.dissolveEdgeFalloff);
		shaderProgram.setUniformLocationWith1f(shaderProgram.loc_time, this._dissolveTime);
	},
	setDissolveSeed: function (dissolveSeed) {
		this.dissolveSeed = dissolveSeed;
		this._renderCmd.setCompositeDirty();
	},
	setDissolveFrequency: function (dissolveFrequency) {
		this.dissolveFrequency = dissolveFrequency;
		this._renderCmd.setCompositeDirty();
	},
	setDissolveAmplitude: function (dissolveAmplitude) {
		this.dissolveAmplitude = dissolveAmplitude;
		this._renderCmd.setCompositeDirty();
	},
	setDissolveVignetteStrength: function (dissolveVignetteStrength) {
		this.dissolveVignetteStrength = dissolveVignetteStrength;
		this._renderCmd.setCompositeDirty();
	},
	setDissolveEdgeFalloff: function (dissolveEdgeFalloff) {
		this.dissolveEdgeFalloff = dissolveEdgeFalloff;
		this._renderCmd.setCompositeDirty();
	},
	setDissolveTime: function (dissolveTime) {
		this._dissolveTime = dissolveTime;
		this._renderCmd.setCompositeDirty();
	},
	resetDissolve: function () {
		this.setDissolveSeed(Math.random());
		this.setDissolveTime(0.0);
	},

	/**
	 * Sets whether the sprite color is leveled. Use the levels in/out white/black parameters to control the appearance.
	 * NOTE: this uses a horizontal rendering component, which may be performance intensive in some cases.
	 * @param {Boolean} dissolving
	 */
	setLeveled: function (leveled) {
		if (this.leveled !== leveled) {
			this.leveled = leveled;

			// auto manage leveled component
			this.autoManageComponentById(this.getLeveled(), "Levels", this.createLeveledComponent.bind(this));
		}
	},
	getLeveled: function () {
		return this.leveled;
	},
	createLeveledComponent: function () {
		return new CompositeHorizontalPass(this, cc.shaderCache.programForKey("Levels"), this.setupLeveledRender.bind(this));
	},
	setupLeveledRender: function (shaderProgram) {
		this._renderCmd.setDefaultMatricesAndBlendModesForDraw(shaderProgram);
		shaderProgram.setUniformLocationWith1f(shaderProgram.loc_inGamma, this.levelsInGamma);
		shaderProgram.setUniformLocationWith1f(shaderProgram.loc_inBlack, this.levelsInBlack / 255.0);
		shaderProgram.setUniformLocationWith1f(shaderProgram.loc_outBlack, this.levelsOutBlack / 255.0);
		shaderProgram.setUniformLocationWith1f(shaderProgram.loc_inWhite, this.levelsInWhite / 255.0);
		shaderProgram.setUniformLocationWith1f(shaderProgram.loc_outWhite, this.levelsOutWhite / 255.0);
	},
	setLevelsInGamma: function (levelsInGamma) {
		this.levelsInGamma = levelsInGamma;
		this._renderCmd.setCompositeDirty();
	},
	setLevelsInBlack: function (levelsInBlack) {
		this.levelsInBlack = levelsInBlack;
		this._renderCmd.setCompositeDirty();
	},
	setLevelsOutBlack: function (levelsOutBlack) {
		this.levelsOutBlack = levelsOutBlack;
		this._renderCmd.setCompositeDirty();
	},
	setLevelsInWhite: function (levelsInWhite) {
		this.levelsInWhite = levelsInWhite;
		this._renderCmd.setCompositeDirty();
	},
	setLevelsOutWhite: function (levelsOutWhite) {
		this.levelsOutWhite = levelsOutWhite;
		this._renderCmd.setCompositeDirty();
	},

	/* endregion GETTERS / SETTERS */

	/* region COMPONENTS */

	/**
	 * Gets a component by id.
	 */
	getComponentById: function (id) {
		return id != null && this._componentsById[id];
	},

	/**
	 * Adds a component to this sprite. Components must have unique ids.
	 * @param component
	 */
	addComponent: function (component) {
		if (component instanceof BaseSpriteComponent) {
			var id = component.getId();
			if (id != null && !this.getComponentById(id)) {
				this._componentsById[id] = component;

				// handle component type
				if (component instanceof CompositePass) {
					this._renderCmd.addCompositePass(component);
				}
			}
		}
	},

	/**
	 * Removes a component from this sprite. Components must have unique ids.
	 * @param component
	 */
	removeComponent: function (component) {
		if (component instanceof BaseSpriteComponent) {
			var id = component.getId();
			delete this._componentsById[id];

			// handle component type
			if (component instanceof CompositePass) {
				this._renderCmd.removeCompositePass(component);
			}
		}
	},

	/**
	 * Removes a component by id from this sprite.
	 * @param id
	 */
	removeComponentById: function (id) {
		if (id != null) {
			this.removeComponent(this.getComponentById(id));
		}
	},

	/**
	 * Updates a component.
	 * @param component
	 */
	updateComponent: function (component) {
		if (component instanceof BaseSpriteComponent) {
			// update by component type
			if (component instanceof CompositePass) {
				this._renderCmd.updateCompositePass(component);
			}
		}
	},

	/**
	 * Updates a component by id.
	 * @param id
	 */
	updateComponentById: function (id) {
		if (id != null) {
			this.updateComponentById(this.getComponentById(id));
		}
	},

	/**
	 * Convenience method to add, remove, or update a component based on a boolean and an id.
	 * @param {Boolean} addOrUpdate whether to add or remove component (if add and component exists, will update)
	 * @param {String} id
	 * @param {Function} componentCreationCallback function that creates and returns the component
	 */
	autoManageComponentById: function (addOrUpdate, id, componentCreationCallback) {
		var component = this.getComponentById(id);
		if (addOrUpdate) {
			if (component == null) {
				component = componentCreationCallback();
				component.setId(id);
				this.addComponent(component);
			} else {
				this.updateComponent(component);
			}
		} else if (component != null) {
			this.removeComponent(component);
		}
	},

	/* endregion COMPONENTS */

	/* region UPDATE */

	updateTweenAction:function(value, key){
		if (key === TweenTypes.TINT_FADE) {
			var tint = this.getTint();
			this.setTint(cc.color(tint.r,tint.g,tint.b,value));
		} else if (key === TweenTypes.DISSOLVE) {
			this.setDissolveTime(value);
		} else if (key === "levelsInWhite") {
			this.setLevelsInWhite(value);
		} else if (key === "levelsInBlack") {
			this.setLevelsInBlack(value);
		} else if (key === "levelsInGamma") {
			this.setLevelsInGamma(value);
		}
	}

	/* endregion UPDATE */
});

BaseSprite.WebGLRenderCmd = function(renderable){
	cc.Sprite.WebGLRenderCmd.call(this, renderable);

	// composited effects on sprite
	this._renderPassStackId = RenderPass.get_new_reset_stack_id();
};
var proto = BaseSprite.WebGLRenderCmd.prototype = Object.create(cc.Sprite.WebGLRenderCmd.prototype);
proto.constructor = BaseSprite.WebGLRenderCmd;

proto._compositeNeedsRebuild = false;
proto._compositeDirty = false;

proto._occlusionNeedsRebuild = false;
proto._lightingDirty = false;
proto._lightingPass = null;
proto._batchLighting = null;

proto._depthRotationDirty = false;
proto._depthRotationMatrix = null;

proto._setTexture = function () {
	var node = this._node;
	var texture = node.getTexture();
	var shaderProgram = this.getShaderProgram();
	var blendFunc = node.getBlendFunc();
	var blendSrc = blendFunc.src;
	var blendDst = blendFunc.dst;

	// super set texture
	cc.Sprite.WebGLRenderCmd.prototype._setTexture.apply(this, arguments);

	// check for texture swap
	if (node.getTexture() !== texture) {
		// update aliasing
		node._updateAliasing();

		// cocos resets properties when a texture swap occurs
		if (shaderProgram != null && (texture != null || shaderProgram !== cc.shaderCache.programForKey(cc.SHADER_POSITION_COLOR)) && this.getShaderProgram() !== shaderProgram) {
			this.setShaderProgram(shaderProgram);
		}
		var updatedBlendFunc = node.getBlendFunc();
		if (blendSrc !== cc.BLEND_SRC && updatedBlendFunc.src === cc.BLEND_SRC
			|| blendDst !== cc.BLEND_DST && updatedBlendFunc.dst === cc.BLEND_DST) {
			node.setBlendFunc(blendSrc, blendDst);
		}
	}
};

proto._syncStatus = function (parentCmd) {
	if (this.getIsOccluding()) {
		var flags = cc.Node._dirtyFlags, locFlag = this._dirtyFlag;
		if(parentCmd && (parentCmd._dirtyFlag & flags.transformDirty)) {
			locFlag |= flags.transformDirty;
		}
		var transformDirty = locFlag & flags.transformDirty;

		cc.Sprite.WebGLRenderCmd.prototype._syncStatus.call(this, parentCmd);

		if(transformDirty) {
			this.setLightsDirty();
		}
	} else {
		cc.Sprite.WebGLRenderCmd.prototype._syncStatus.call(this, parentCmd);
	}
};
proto.updateStatus = function () {
	if (this.getIsOccluding()) {
		var flags = cc.Node._dirtyFlags, locFlag = this._dirtyFlag;
		var transformDirty = locFlag & flags.transformDirty;

		cc.Sprite.WebGLRenderCmd.prototype.updateStatus.call(this);

		if(transformDirty) {
			this.setLightsDirty();
		}
	} else {
		cc.Sprite.WebGLRenderCmd.prototype.updateStatus.call(this);
	}
};

proto.getNeedsPerspectiveProjectionForCache = function () {
	return cc.Sprite.WebGLRenderCmd.prototype.getNeedsPerspectiveProjectionForCache.call(this) || this.getNeedsOcclusion();
};

proto.rendering = function () {
	var node = this._node;
	if (node._texture == null || !node._texture.isLoaded() || this._displayedOpacity === 0)
		return;

	this.updateMatricesForRender();

	this.rebuild();

	var isCompositing = this.getIsCompositing();
	var isOccluding = this.getIsOccluding();
	var isDepthTesting = this.getIsDepthTesting();

	// begin redirecting for depth test
	if (isDepthTesting) {
		this.beginDepthTest();
	}

	// cache composite passes
	if (isCompositing && (this._quadDirty || this._compositeDirty)) {
		this.cacheCompositeHorizontalPasses();
	}

	if(isOccluding) {
		// check if lights should be dirty
		if (!this._lightingDirty && (this._batchLighting && this._batchLighting.getDirty()) && node.getFX().batchLights.getBatchSize() > 0) {
			this.setLightsDirty();
		}

		// cache lighting effects
		if (this._lightingDirty) {
			this.cacheDrawLighting();
		}
	}

	// vertical composite before passes
	this.drawCompositeVerticalBeforePasses();

	// composite/base draw
	if (isCompositing) {
		// draw composite
		this.drawComposite();
	} else {
		// default draw
		this.drawBase();
	}

	// vertical composite after passes
	this.drawCompositeVerticalAfterPasses();

	this.updateMatricesAfterRender();

	// end and render depth tested texture
	if (isDepthTesting) {
		this.endDepthTest();
		this.drawDepthTested();
	}

	// debug draw
	if (CONFIG.DEBUG_DRAW) {
		this.drawDebug();
	}

	// draw into depth texture
	if(node.needsDepthDraw) {
		this.drawDepth();
	}
};

proto.rebuild = function () {
	var needsComposite = this.getNeedsComposite();
	var isCompositing = this.getIsCompositing();
	var needsOcclusion = this.getNeedsOcclusion();
	var isOccluding = this.getIsOccluding();

	// rebuild composite as needed
	if(this._compositeNeedsRebuild || (needsComposite && !isCompositing) || (!needsComposite && isCompositing)) {
		this.rebuildCompositePasses();
	}

	// rebuild lighting as needed
	if (this._occlusionNeedsRebuild || (needsOcclusion && !isOccluding) || (!needsOcclusion && isOccluding)) {
		this.rebuildOcclusion();
	}

	// rebuild depth test pass as needed
	var depthTestSize = this.getDepthTestSize();
	var width = depthTestSize.width;
	var height = depthTestSize.height;
	if (!this.getNeedsDepthTest() || width == null || width <= 0 || height == null || height <= 0) {
		this.releaseDepthTestPasses();
	} else {
		if (this._depthTestPass == null) {
			this._depthTestPass = RenderPass.create(cc.Texture2D.PIXEL_FORMAT_RGBA8888, width, height, 1, node.antiAlias);
		} else if (this._depthTestPass.getWidth() != width || this._depthTestPass.getHeight() != height) {
			this._depthTestPass.rebuild(cc.Texture2D.PIXEL_FORMAT_RGBA8888, width, height, 1, node.antiAlias);
		}
	}
};

proto.cacheCompositeHorizontalPasses = function () {
	this._compositeDirty = false;

	// begin composite
	this._compositePass.beginWithResetClear(this._renderPassStackId);

	var compositeHorizontalPasses = this._compositeHorizontalPasses;
	if (compositeHorizontalPasses != null && compositeHorizontalPasses.length > 0) {
		// begin each horizontally composited pass
		// loop forwards on begin so that the compositing is done from least to most recent
		for (var i = 0, il = compositeHorizontalPasses.length; i < il; i++) {
			compositeHorizontalPasses[i].begin(this._renderPassStackId);
		}

		// draw base
		this.drawBase();

		// end and render each horizontally composited pass
		// loop backwards on end so that the compositing is done from least to most recent
		for (var i = compositeHorizontalPasses.length - 1; i >= 0; i--) {
			var compositeHorizontalPass = compositeHorizontalPasses[i];
			compositeHorizontalPass.end(this._renderPassStackId);
			compositeHorizontalPass.render();
		}
	} else {
		// draw base only
		this.drawBase();
	}

	// end composite
	this._compositePass.endWithReset(this._renderPassStackId);
};

proto.drawComposite = function () {
	var node = this._node;
	var gl = cc._renderContext;
	var needsOcclusion = this.getNeedsOcclusion();

	var shaderProgram = needsOcclusion ? cc.shaderCache.programForKey("MultipliedLighting") : cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
	shaderProgram.use();

	// setup for composite render
	this.setDefaultMatricesAndBlendModesForDraw(shaderProgram);
	cc.glBindTexture2DN(0, this._compositePass.texture);

	// multiply lighting accumulation with base texture
	if (needsOcclusion) {
		var globalAmbientLightColor = node.getFX().getAmbientLightColor();
		var ambientLightColor = node.ambientLightColor;
		shaderProgram.setUniformLocationWith3f(shaderProgram.loc_ambientColor, (globalAmbientLightColor.r + ambientLightColor.r) / 255, (globalAmbientLightColor.g + ambientLightColor.g) / 255, (globalAmbientLightColor.b + ambientLightColor.b) / 255);
		cc.glBindTexture2DN(1, this._lightingPass.texture);
	}

	// render composite
	this._compositePass.render();
};

proto.drawCompositeVerticalBeforePasses = function () {
	var compositeVerticalBeforePasses = this._compositeVerticalBeforePasses;
	if (compositeVerticalBeforePasses != null) {
		for (var i = 0, il = compositeVerticalBeforePasses.length; i < il; i++) {
			var compositeVerticalBeforePass = compositeVerticalBeforePasses[i];
			compositeVerticalBeforePass.begin(this._renderPassStackId);
			compositeVerticalBeforePass.end(this._renderPassStackId);
			compositeVerticalBeforePass.render();
		}
	}
};

proto.drawCompositeVerticalAfterPasses = function () {
	var compositeVerticalAfterPasses = this._compositeVerticalAfterPasses;
	if (compositeVerticalAfterPasses != null) {
		for (var i = 0, il = compositeVerticalAfterPasses.length; i < il; i++) {
			var compositeVerticalAfterPass = compositeVerticalAfterPasses[i];
			compositeVerticalAfterPass.begin(this._renderPassStackId);
			compositeVerticalAfterPass.end(this._renderPassStackId);
			compositeVerticalAfterPass.render();
		}
	}
};

proto.drawBase = function () {
	var node = this._node;
	var texture = node._texture;
	var gl = cc._renderContext;

	// get shader
	var shaderProgram = this._shaderProgram;
	shaderProgram.use();
	this.setDefaultMatricesAndBlendModesForDraw(shaderProgram);
	cc.glBindTexture2DN(0, texture);

	// allow subclasses of the node itself to set any extra unforms their specific shaders require
	node.onBaseDrawSetAdditionalUniforms(shaderProgram)

	// bind quad buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, this._quadWebBuffer);
	if (this._quadDirty) {
		this._quadDirty = false;
		gl.bufferData(gl.ARRAY_BUFFER, this._quad.arrayBuffer, gl.DYNAMIC_DRAW);
	}

	// vertex attributes
	cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);
	gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0);
	gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12);
	gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 24, 16);

	// draw
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

proto.cacheDrawStencilIntoCurrentRenderBuffer = function () {
	/*
	var gl = cc._renderContext;

<<<<<<< HEAD
	// draw sprite to overlay stencil buffer
	gl.enable(gl.STENCIL_TEST);
	gl.colorMask(false, false, false, false);
	gl.depthMask(false);
	gl.stencilMask(0xFF);
	// never pass the stencil test, and set the reference value to one.
	gl.stencilFunc(gl.NEVER, 1, 0xFF);
	// replace the value in the stencil buffer with the reference value
	// whenever the stencil test fails (which is always)
	gl.stencilOp(gl.REPLACE, gl.KEEP, gl.KEEP);
=======
	// draw composite
	var shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
	shaderProgram.use();

	// set shader matrices
	if(RenderPass.is_rendering_reset_for_stack(this._renderPassStackId)) {
		shaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4();
	} else {
		shaderProgram._setUniformForMVPMatrixWithMat4(this._mvMatrix);
	}
>>>>>>> master

	// because we're using sprites
	// we have to render to stencil buffer with an alpha threshold shader
	var posTexAlphaProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLORALPHATEST);
	posTexAlphaProgram.use();
	posTexAlphaProgram.setUniformForModelViewAndProjectionMatrixWithMat4();
	cc.glBlendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	cc.glBindTexture2DN(0, this.passes.base.texture);
	this.passes.base.render();

	gl.stencilMask(0xFFFFFFFF); // default stencil mask
	gl.depthMask(true);
	gl.colorMask(true, true, true, true);
	gl.disable(gl.STENCIL_TEST);
	*/
};

proto.getNeedsDepthTest = function () {
	return this._node.getNeedsDepthTest();
};

proto.getIsDepthTesting = function () {
	return this._depthTestPass != null;
};

proto.getDepthTestSize = function () {
	if (this.getIsCompositing()) {
		return cc.size(this._compositePass.getWidth(), this._compositePass.getHeight());
	} else if (this._node != null) {
		return this._node._contentSize;
	} else {
		return cc.size(0, 0);
	}
};

proto.releaseDepthTestPasses = function () {
	if(this._depthTestPass != null) {
		this._depthTestPass.release();
		this._depthTestPass = null;
	}
};

proto.beginDepthTest = function () {
	// begin redirecting to depth test
	this._depthTestPass.beginWithResetClear(this._renderPassStackId);
};

proto.endDepthTest = function () {
	this._depthTestPass.endWithReset(this._renderPassStackId);
};

proto.drawDepthTested = function () {
	var node = this._node;
	var gl = cc._renderContext;
	// console.log("DRAW DEPTH TESTED", node.__instanceId);

	this.updateMatricesForRender();

	// draw using depth test
	var shaderProgram = cc.shaderCache.programForKey("DepthTest");
	shaderProgram.use();
	this.setDefaultMatricesAndBlendModesForDraw(shaderProgram);
	shaderProgram.setUniformLocationWith1f(shaderProgram.loc_depthOffset, node.depthOffset);
	shaderProgram.setUniformLocationWith1f(shaderProgram.loc_depthModifier, node.depthModifier);
	cc.glBindTexture2DN(0, this._depthTestPass.texture);
	cc.glBindTexture2DN(1, node.getFX().getDepthMap());
	this._depthTestPass.render();

	this.updateMatricesAfterRender();
};

proto.drawDepth = function () {
	var node = this._node;
	var gl = cc._renderContext;
	var depthRenderPass = node.getFX().getDepthRenderPass();

	depthRenderPass.beginWithReset(this._renderPassStackId);

	// push projection matrix to top of stack to account for depth pass resetting render space
	this.updateMatricesForRender();

	var depthProgram = cc.shaderCache.programForKey("Depth");
	depthProgram.use();
	depthProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);
	depthProgram.setUniformLocationWith1f(depthProgram.loc_depthOffset, node.depthOffset);
	depthProgram.setUniformLocationWith1f(depthProgram.loc_depthModifier, node.depthModifier);
	cc.glBlendFunc(gl.ONE, gl.ZERO);
	cc.glBindTexture2DN(0, node._texture);
	cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);
	gl.bindBuffer(gl.ARRAY_BUFFER, this._quadWebBuffer);
	if(this._quadDirty) {
		this._quadDirty = false;
		gl.bufferData(gl.ARRAY_BUFFER, this._quad.arrayBuffer, gl.DYNAMIC_DRAW);
	}
	gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0);
	gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12);
	gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 24, 16);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	// pop projection matrix from top of stack to account for depth pass resetting render space
	this.updateMatricesAfterRender();

	depthRenderPass.endWithReset(this._renderPassStackId);
};

proto.drawDebug = function () {
	var node = this._node;

	this.updateMatricesForRender();

	cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
	//cc.kmGLPushMatrixWitMat4(node._stackMatrix);
	cc.current_stack.stack.push(cc.current_stack.top);
	cc.current_stack.top = this._stackMatrix;

	// draw bounding box
	var locQuad = this._quad;
	var verticesG1 = [
		cc.p(locQuad.tl.vertices.x, locQuad.tl.vertices.y),
		cc.p(locQuad.bl.vertices.x, locQuad.bl.vertices.y),
		cc.p(locQuad.br.vertices.x, locQuad.br.vertices.y),
		cc.p(locQuad.tr.vertices.x, locQuad.tr.vertices.y)
	];
	cc._drawingUtil.drawPoly(verticesG1, 4, true);

	// draw texture box
	var drawRectG2 = node.getTextureRect();
	var offsetPixG2 = node.getOffsetPosition();
	var verticesG2 = [cc.p(offsetPixG2.x, offsetPixG2.y), cc.p(offsetPixG2.x + drawRectG2.width, offsetPixG2.y),
		cc.p(offsetPixG2.x + drawRectG2.width, offsetPixG2.y + drawRectG2.height), cc.p(offsetPixG2.x, offsetPixG2.y + drawRectG2.height)];
	cc._drawingUtil.drawPoly(verticesG2, 4, true);

	cc.current_stack.top = cc.current_stack.stack.pop();

	this.updateMatricesAfterRender();
};

proto.cacheDrawLighting = function () {
	if (this.getIsOccluding()) {
		var node = this._node;
		var gl = cc._renderContext;

		this._lightingDirty = false;

		this._lightingPass.beginWithResetClear(this._renderPassStackId);

		if (this._depthRotationDirty || this._depthRotationMatrix == null) {
			this._depthRotationDirty = false;
			this._depthRotationMatrix = cc.kmMat4RotationPitchYawRoll(new cc.kmMat4(), node.depthRotation.x, node.depthRotation.y, node.depthRotation.z);
		}

		var lightingProgram = cc.shaderCache.programForKey("Lighting");
		lightingProgram.use();
		lightingProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);
		lightingProgram.setUniformLocationWith1f(lightingProgram.loc_depthOffset, node.depthOffset);
		lightingProgram.setUniformLocationWith1f(lightingProgram.loc_lightMapScale, node.lightMapScale);
		lightingProgram.setUniformLocationWithMatrix4fv(lightingProgram.loc_depthRotationMatrix, this._depthRotationMatrix.mat, 1);
		lightingProgram.setUniformLocationWith3f(lightingProgram.loc_normal, node.normal.x, node.normal.y, node.normal.z);
		// lighting accumulation doesn't need a texture
		cc.glBlendFunc(gl.SRC_ALPHA, gl.ONE);

		this._batchLighting.renderWithLights();

		this._lightingPass.endWithReset(this._renderPassStackId);
	}
};

proto.drawShadows = function () {
	if (this.getIsOccluding()) {
		var node = this._node;
		var gl = cc._renderContext;

		this.updateMatricesForRender();

		var shadowProgram;
		if (CONFIG.shadowQuality === CONFIG.SHADOW_QUALITY_HIGH) {
			shadowProgram = cc.shaderCache.programForKey("ShadowHighQuality");
		} else {
			shadowProgram = cc.shaderCache.programForKey("ShadowLowQuality");
		}
		shadowProgram.use();
		shadowProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);

		var width;
		var height;
		var offset = node.shadowOffset;
		if (this.getIsCompositing()) {
			width = this._compositePass.getWidth();
			height = this._compositePass.getHeight();
			cc.glBindTexture2DN(0, this._compositePass.getTexture());
		} else {
			width = node._contentSize.width;
			height = node._contentSize.height;
			cc.glBindTexture2DN(0, node._texture);
		}

		shadowProgram.setUniformLocationWith2f(shadowProgram.loc_size, width, height);
		shadowProgram.setUniformLocationWith2f(shadowProgram.loc_anchor, node._anchorPoint.x * width, offset);
		cc.glBlendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		this._batchLighting.renderWithShadowCastingLights();

		this.updateMatricesAfterRender();
	}
};

/**
 * Called automatically when this render command's node is added to the scene.
 */
proto.onEnter = function () {
	this.setCompositeNeedsRebuild();
	this.setOcclusionNeedsRebuild();
};
/**
 * Called automatically when this render command's node is removed from the scene.
 */
proto.onExit = function () {
	this.releasePasses();
};

proto.setDefaultMatricesAndBlendModesForDraw = function (shaderProgram) {
	this.setDefaultMatricesForDraw(shaderProgram);
	this.setDefaultBlendModesForDraw(shaderProgram);
};

proto.setDefaultMatricesForDraw = function (shaderProgram) {
	if (RenderPass.is_rendering_reset_for_stack(this._renderPassStackId)) {
		shaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4();
	} else {
		shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);
	}
};

proto.setDefaultBlendModesForDraw = function () {
	var node = this._node;
	var gl = cc._renderContext;
	if (RenderPass.is_rendering_reset_for_stack(this._renderPassStackId)) {
		cc.glBlendFunc(gl.ONE, gl.ZERO);
	} else {
		cc.glBlendFunc(node._blendFunc.src, node._blendFunc.dst);
	}
};

proto.releasePasses = function () {
	this.releaseCompositePasses();
	this.releaseOcclusionPasses();
	this.releaseDepthTestPasses();
};

/**
 * Returns whether this sprite needs to be composited.
 * @returns {Boolean}
 */
proto.getNeedsComposite = function () {
	return (this._compositePasses && this._compositePasses.length > 0) || this.getNeedsOcclusion();
};

/**
 * Returns whether this sprite is currently compositing.
 * @returns {Boolean}
 */
proto.getIsCompositing = function () {
	return this._compositePass != null;
};

proto.setCompositeNeedsRebuild = function () {
	this._compositeNeedsRebuild = true;
};

proto.setCompositeDirty = function () {
	this._compositeDirty = true;
};

proto.setQuadDirty = function () {
	this._quadDirty = true;
};

proto._compositePasses = null;
proto._compositeHorizontalPasses = null;
proto._compositeVerticalBeforePasses = null;
proto._compositeVerticalAfterPasses = null;

proto.addCompositePass = function (compositePass) {
	if (compositePass instanceof CompositePass) {
		if (this._compositePasses == null) { this._compositePasses = []; }
		this._compositePasses.push(compositePass);

		if (compositePass instanceof CompositeHorizontalPass) {
			if (this._compositeHorizontalPasses == null) { this._compositeHorizontalPasses = []; }
			this._compositeHorizontalPasses.push(compositePass);
		} else if (compositePass instanceof CompositeVerticalBeforePass) {
			if (this._compositeVerticalBeforePasses == null) { this._compositeVerticalBeforePasses = []; }
			this._compositeVerticalBeforePasses.push(compositePass);
		} else if (compositePass instanceof CompositeVerticalAfterPass) {
			if (this._compositeVerticalAfterPasses == null) { this._compositeVerticalAfterPasses = []; }
			this._compositeVerticalAfterPasses.push(compositePass);
		}

		// flag composite as dirty
		this.setCompositeDirty();
	}
};

proto.removeCompositePass = function (compositePass) {
	if (compositePass instanceof CompositePass && this._compositePasses != null && this._compositePasses.length > 0) {
		this._compositePasses = _.without(this._compositePasses, compositePass);

		if (compositePass instanceof CompositeHorizontalPass) {
			if (this._compositeHorizontalPasses != null && this._compositeHorizontalPasses.length > 0) {
				this._compositeHorizontalPasses = _.without(this._compositeHorizontalPasses, compositePass);
			}
		} else if (compositePass instanceof CompositeVerticalBeforePass) {
			if (this._compositeVerticalBeforePasses != null && this._compositeVerticalBeforePasses.length > 0) {
				this._compositeVerticalBeforePasses = _.without(this._compositeVerticalBeforePasses, compositePass);
			}
		} else if (compositePass instanceof CompositeVerticalAfterPass) {
			if (this._compositeVerticalAfterPasses != null && this._compositeVerticalAfterPasses.length > 0) {
				this._compositeVerticalAfterPasses = _.without(this._compositeVerticalAfterPasses, compositePass);
			}
		}

		// release compositePass
		compositePass.release();

		// flag composite as dirty
		this.setCompositeDirty();
	}
};

proto.updateCompositePass = function (compositePass) {
	if (compositePass instanceof CompositePass) {
		// flag composite as dirty
		this.setCompositeDirty();
	}
};

proto.rebuildCompositePasses = function () {
	var node = this._node;
	var needsComposite = this.getNeedsComposite();
	var width = node._contentSize.width;
	var height = node._contentSize.height;

	this._compositeNeedsRebuild = false;

	// flag everything as dirty to refresh cache
	this.setCompositeDirty();
	this.setQuadDirty();

	if (!needsComposite || width == null || width <= 0 || height == null || height <= 0) {
		this.releaseCompositePasses();
	} else {
		if (this._compositePass != null) {
			this._compositePass.rebuild(cc.Texture2D.PIXEL_FORMAT_RGBA8888, width, height, 1.0, node.antiAlias);
		} else {
			this._compositePass = RenderPass.create(cc.Texture2D.PIXEL_FORMAT_RGBA8888, width, height, 1.0, node.antiAlias);
		}

		// flag all composite effects to rebuild on next draw
		if (this._compositePasses != null && this._compositePasses.length > 0) {
			for (var i = 0, il = this._compositePasses.length; i < il; i++) {
				this._compositePasses[i].setNeedsRebuild();
			}
		}
	}
};

proto.releaseCompositePasses = function () {
	// release all passes
	if(this._compositePass) {
		this._compositePass.release();
		this._compositePass = null;
	}

	if (this._compositePasses != null && this._compositePasses.length > 0) {
		for (var i = 0, il = this._compositePasses.length; i < il; i++) {
			this._compositePasses[i].release();
		}
		this._compositePasses = null;
		this._compositeHorizontalPasses = null;
		this._compositeVerticalBeforePasses = null;
		this._compositeVerticalAfterPasses = null;
	}
};

/**
 * Returns whether this sprite needs occlusion.
 * @returns {Boolean}
 */
proto.getNeedsOcclusion = function () {
	return this._node.getOccludes();
};

/**
 * Returns whether this sprite is currently occluding.
 * @returns {Boolean}
 */
proto.getIsOccluding = function () {
	return this._lightingPass != null;
};

proto.setOcclusionNeedsRebuild = function () {
	this._occlusionNeedsRebuild = true;
};

proto.setLightsDirty = function () {
	this._lightingDirty = true;
};

proto.setDepthRotationDirty = function () {
	this._depthRotationDirty = true;
	this.setLightsDirty();
};

proto.setShadowCastingLightsDirty = function () {

};

proto.rebuildOcclusion = function () {
	var node = this._node;
	var needsOcclusion = this.getNeedsOcclusion();
	var isCompositing = this.getIsCompositing();
	var width;
	var height;
	if (needsOcclusion) {
		if (isCompositing) {
			width = this._compositePass.getWidth();
			height = this._compositePass.getHeight();
		} else {
			width = node._contentSize.width;
			height = node._contentSize.height;
		}
	} else {
		width = height = 0;
	}

	this._occlusionNeedsRebuild = false;

	// flag lights as dirty to update cached state
	this.setLightsDirty();

	if (!needsOcclusion || width == null || width <= 0 || height == null || height <= 0) {
		this.releaseOcclusionPasses();
	} else {
		// create new lighting passes if node is occluding
		if(this._batchLighting) this._batchLighting.release();
		this._batchLighting = BatchLighting.create();

		if(this._lightingPass) this._lightingPass.release();
		if (isCompositing) {
			this._lightingPass = RenderPass.create(cc.Texture2D.PIXEL_FORMAT_RGBA8888, width, height, node.lightMapScale, node.antiAlias);
			this._batchLighting.setOccluder(this._compositePass);
		} else {
			this._lightingPass = RenderPass.create(cc.Texture2D.PIXEL_FORMAT_RGBA8888, width, height, node.lightMapScale, node.antiAlias);
			this._batchLighting.setOccluder(node);
		}
	}
};

proto.releaseOcclusionPasses = function () {
	if(this._lightingPass != null) {
		this._lightingPass.release();
		this._lightingPass = null;
	}

	if(this._batchLighting != null) {
		this._batchLighting.release();
		this._batchLighting = null;
	}
};

/**
 * Create sprite and extract all relevant properties from options object. Options may be provided for any non-private properties of the BaseSprite and descendants.
 * @param {Object|String} options name of sprite sheet, pass either a string or options object with spriteIdentifier property
 * @param {BaseSprite} [sprite=new BaseSprite()] instance of sprite class
 * @returns {BaseSprite}
 */
BaseSprite.create = function(options, sprite) {
	return sprite || new BaseSprite(options);
};

module.exports = BaseSprite;
