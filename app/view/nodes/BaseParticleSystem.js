const CONFIG = require('app/common/config');
const UtilsEngine = require('app/common/utils/utils_engine');
const UtilsPosition = require('app/common/utils/utils_position');
const NodeFactory = require('app/view/helpers/NodeFactory');

/** **************************************************************************
 BaseParticleSystem
 var BaseParticleSystem = cc.ParticleSystem
 BaseParticleSystem.create()
 *************************************************************************** */
var BaseParticleSystem = cc.ParticleSystem.extend({
  // config file for particles
  // note: textures DO NOT need to be square!
  plistFile: '',
  // max number of particles
  maxParticles: 0,
  // source and target positions in board space
  sourceBoardPosition: null,
  targetBoardPosition: null,
  // source and target positions in screen space
  sourceScreenPosition: null,
  targetScreenPosition: null,
  // absolute offset, not relative to rotation and not based on particle size
  particleOffset: cc.p(),
  // particle spawn offset, based on particle size
  // offset is relative to particle rotation
  relativeOffset: cc.p(),
  // whether particles and system should be fully transformed with parent
  relativeToParent: false,
  // align particles to pixel grid
  pixelGridAligned: false,
  // size of pixel grid
  pixelGridSize: 2,
  // set system angle with vector between source and target positions
  angled: true,
  // rotate particles with direction of travel
  // this works best with particle textures where forward is right
  directionAligned: false,
  // whether system should act as if in a parallax node
  parallaxMode: false,
  // how much to scale particles size up with posVar increase
  posVarScaleSize: 0.0,
  // how much of posVar should be treated as area of effect (multiplied by posVar)
  posVarAOE: 0.0,
  // rate of particle speed decay, between 0 and 1
  // usually a value between 0.9 and 1 is best for a slowdown
  // this is also useful to create a fake depth perspective
  friction: cc.p(1.0, 1.0),
  // fade particle to starting alpha (from zero) by a percentage of it's life
  fadeInAtLifePct: 0.0,
  // fade particle to zero alpha starting at a percentage of it's life
  fadeOutAtLifePct: 1.0,
  // fx created within this particle system
  // either a string or array of paths to plistFile, or a single or array of options objects
  emitFX: null,
  // emitted particle systems are used for special behavior
  emitSystems: null,
  // parent particle system that this system emits particles for
  parentSystem: null,
  // whether system should only emit particles on impact from parent system
  emitOnImpact: false,
  // max number of particles to emit per impact from parent system
  // where -1 is defer to maxParticles, otherwise go by the number when >= 0
  maxParticlesPerImpact: -1,
  // scale emission area to fit parent
  fitToParent: false,
  // scale emission area to fit distance between source and target
  fitToDistance: false,
  // set particle lifespan to approximately long enough to cross distance between source and target
  liveForDistance: false,
  // whether to draw particles using depth test
  // note: for now, depth testing will set the shader to the basic color/tex draw
  needsDepthTest: false,
  // depth offset to artificially change depth value
  depthOffset: -CONFIG.TILESIZE * 0.5,
  // per particle random depth offset
  particleDepthOffset: CONFIG.TILESIZE,
  // whether to record depth as if sprite is facing screen (0.0) or flat on ground (1.0)
  depthModifier: 0.0,
  // whether particles are affected by the global FX wind direction
  // note: this changes the direction/angle of the particles and the gravity direction of the emitter, but does not affect speed
  affectedByWind: false,
  // whether particle system is flipped horizontally
  // note: for now this does not flip particles themselves, only the system
  flippedX: false,
  // chance that a particle will be emitted
  // when < 1.0, will random and emit if value is <= chance
  emissionChance: 1.0,
  // whether particle system emission is synced to the global fx time
  // note: particle systems can only sync emission if their duration is infinite
  emissionSynced: false,
  // max inertia when particles follow particle system
  maxInertia: 0.5,
  // max randomized inertia when particles follow particle system
  maxInertiaRandom: 8.0,

  _emitFXSprites: null,
  _impacts: null,
  _psParticleId: 0,
  _sourceScreenOffsetPosition: null,
  _sourceToTargetDistance: 0.0,
  _spriteFrame: null,
  _syncedEmitTimeLast: 0,
  _syncedEmitTime: 0,
  _targetScreenOffsetPosition: null,
  _worldPositionForParticle: null,
  _staticPositionsToSample: null,

  ctor(options) {
    // initialize properties that may be required in init
    this._worldPositionForParticle = cc.p();
    this._sourceScreenOffsetPosition = cc.p();
    this._targetScreenOffsetPosition = cc.p();
    this._impacts = [];

    // find plist file
    let plistFile;
    if (typeof options === 'string') {
      plistFile = options;
    } else {
      plistFile = options.plistFile || options.plist || this.plistFile;
    }

    // do super ctor
    this._super(plistFile);

    // apply options
    if (_.isObject(options)) {
      this.setOptions(options);
    }

    // set auto remove when duration is not forever
    if (this.getDuration() !== -1 && !this.emitFX && !this.emitOnImpact && !this.isAutoRemoveOnFinish() && (!options || typeof options.autoRemoveOnFinish === 'undefined')) {
      this.setAutoRemoveOnFinish(true);
    }

    this.updateSourceToTarget();
  },

  _createRenderCmd() {
    if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
      return this._super();
    }
    return new BaseParticleSystem.WebGLRenderCmd(this);
  },

  initWithFile(plistFile) {
    const ret = cc.ParticleSystem.prototype.initWithFile.apply(this, arguments);
    this.setPlistFile(plistFile);
    return ret;
  },
  initWithTotalParticles(numberOfParticles) {
    const ret = cc.ParticleSystem.prototype.initWithTotalParticles.apply(this, arguments);
    this.setMaxParticles(this._totalParticles);
    return ret;
  },
  initWithDictionary(dictionary, dirname) {
    const ret = cc.ParticleSystem.prototype.initWithDictionary.apply(this, arguments);

    if (ret) {
      const locValueForKey = this._valueForKey;
      // TODO: populate with custom keys
    }

    return ret;
  },
  destroy(duration) {
    this.stopSystem();
    cc.Node.prototype.destroy.call(this, duration);
  },

  setOptions(options) {
    this._super(options);

    if (options.duration) { this.setDuration(options.duration); }
    if (options.maxParticles) { this.setMaxParticles(options.maxParticles); }
    if (options.sourceBoardPosition) { this.setSourceBoardPosition(options.sourceBoardPosition); }
    if (options.targetBoardPosition) { this.setTargetBoardPosition(options.targetBoardPosition); }
    if (options.sourceScreenPosition) { this.setSourceScreenPosition(options.sourceScreenPosition); }
    if (options.targetScreenPosition) { this.setTargetScreenPosition(options.targetScreenPosition); }
    if (options.relativeToParent) { this.setRelativeToParent(options.relativeToParent); }
    if (options.pixelGridAligned) { this.setPixelGridAligned(options.pixelGridAligned); }
    if (options.pixelGridSize) { this.setPixelGridSize(options.pixelGridSize); }
    if (options.angled != null) { this.setAngled(options.angled); }
    const directionAligned = options.directionAligned || this.modeA.rotationIsDir;
    if (directionAligned != null) { this.setDirectionAligned(directionAligned); }
    if (options.parallaxMode != null) { this.setParallaxMode(options.parallaxMode); }
    if (options.posVarScaleSize) { this.setPosVarScaleSize(options.posVarScaleSize); }
    if (options.posVarAOE) { this.setPosVarAOE(options.posVarAOE); }
    if (options.friction) { this.setFriction(options.friction); }
    if (options.fadeInAtLifePct) { this.setFadeInAtLifePct(options.fadeInAtLifePct); }
    if (options.fadeOutAtLifePct != null) { this.setFadeOutAtLifePct(options.fadeOutAtLifePct); }
    if (options.particleOffset) { this.setParticleOffset(options.particleOffset); }
    if (options.relativeOffset) { this.setRelativeOffset(options.relativeOffset); }
    if (options.emitFX) { this.setEmitFX(options.emitFX); }
    if (options.parentSystem) { this.setParentSystem(options.parentSystem); }
    if (options.emitOnImpact != null) { this.setEmitOnImpact(options.emitOnImpact); }
    if (options.maxParticlesPerImpact) { this.setMaxParticlesPerImpact(options.maxParticlesPerImpact); }
    if (options.fitToParent != null) { this.setFitToParent(options.fitToParent); }
    if (options.fitToDistance != null) { this.setFitToDistance(options.fitToDistance); }
    if (options.liveForDistance != null) { this.setLiveForDistance(options.liveForDistance); }
    if (options.needsDepthTest != null) { this.setNeedsDepthTest(options.needsDepthTest); }
    if (options.depthOffset != null) { this.setDepthOffset(options.depthOffset); }
    if (options.particleDepthOffset != null) { this.setParticleDepthOffset(options.particleDepthOffset); }
    if (options.depthModifier != null) { this.setDepthModifier(options.depthModifier); }
    if (options.affectedByWind != null) { this.setAffectedByWind(options.affectedByWind); }
    if (options.flippedX != null) { this.setFlippedX(options.flippedX); }
    if (options.emissionChance != null) { this.setEmissionChance(options.emissionChance); }
    if (options.emissionSynced != null) { this.setEmissionSynced(options.emissionSynced); }
    if (options.maxInertia != null) { this.setMaxInertia(options.maxInertia); }
    if (options.maxInertiaRandom != null) { this.setMaxInertiaRandom(options.maxInertiaRandom); }

    // cc.ParticleSystem/Node options (incomplete)
    if (options.posVar) { this.setPosVar(options.posVar); }
    if (options.angle) { this.setAngle(options.angle); }
    if (options.autoRemoveOnFinish != null) { this.setAutoRemoveOnFinish(options.autoRemoveOnFinish); }
    if (options.positionType != null) { this.setPositionType(options.positionType); }

    if (options.staticPositionsToSample != null) { this._staticPositionsToSample = options.staticPositionsToSample; }
  },

  setMaxParticles(maxParticles) {
    this.maxParticles = maxParticles;
    if (this.maxParticles > 0 && this._totalParticles !== this.maxParticles) {
      this.setTotalParticles(this.maxParticles);
    }
  },
  getMaxParticles() {
    return this.maxParticles;
  },
  setTotalParticles(totalParticles) {
    cc.ParticleSystem.prototype.setTotalParticles.call(this, totalParticles);
    this.maxParticles = this._totalParticles;
    this.updateEmissionRate();
  },
  setPlistFile(plistFile) {
    this.plistFile = plistFile;
  },
  getPlistFile() {
    return this.plistFile;
  },
  setSourceBoardPosition(sourceBoardPosition) {
    this.sourceBoardPosition = sourceBoardPosition;
  },
  getSourceBoardPosition() {
    return this.sourceBoardPosition;
  },
  setSourceScreenPosition(sourceScreenPosition) {
    this.sourceScreenPosition = sourceScreenPosition;
    this.updateSourceToTarget();
  },
  getSourceScreenPosition() {
    return this.sourceScreenPosition;
  },
  getSourceScreenOffsetPosition() {
    return this._sourceScreenOffsetPosition;
  },
  setTargetBoardPosition(targetBoardPosition) {
    this.targetBoardPosition = targetBoardPosition;
  },
  getTargetBoardPosition() {
    return this.targetBoardPosition;
  },
  setTargetScreenPosition(targetScreenPosition) {
    this.targetScreenPosition = targetScreenPosition;
    this.updateSourceToTarget();
  },
  getTargetScreenPosition() {
    return this.targetScreenPosition;
  },
  getTargetScreenOffsetPosition() {
    return this._targetScreenOffsetPosition;
  },
  setRelativeToParent(relativeToParent) {
    this.relativeToParent = relativeToParent;
  },
  getRelativeToParent() {
    return this.relativeToParent;
  },
  setPixelGridAligned(pixelGridAligned) {
    this.pixelGridAligned = pixelGridAligned;
  },
  getPixelGridAligned() {
    return this.pixelGridAligned;
  },
  setPixelGridSize(pixelGridSize) {
    this.pixelGridSize = pixelGridSize;
  },
  getPixelGridSize() {
    return this.pixelGridSize;
  },
  setAngled(angled) {
    this.angled = angled;
  },
  getAngled() {
    return this.angled;
  },
  setDirectionAligned(directionAligned) {
    this.directionAligned = directionAligned;
  },
  getDirectionAligned() {
    return this.directionAligned;
  },
  setParallaxMode(parallaxMode) {
    this.parallaxMode = parallaxMode;
  },
  getParallaxMode() {
    return this.parallaxMode;
  },
  setPosVar(posVar) {
    const lastPosVar = this._posVar;

    if (posVar) {
      // cc.ParticleSystem.prototype.setPosVar.call(this, posVar);
      this._posVar = posVar;

      // scale particles with position variance
      const radius = Math.max(this._posVar.x, this._posVar.y);
      const lastRadius = Math.max(lastPosVar.x, lastPosVar.y);
      if (lastRadius && this.posVarScaleSize) {
        const deltaSize = radius - lastRadius;
        const { startSize } = this;
        this.setStartSize(startSize + deltaSize * this.posVarScaleSize);
        this.setStartSizeVar(this.startSizeVar * (this.startSize / startSize));
      }
    }
  },
  getPosVar() {
    return this._posVar;
  },
  setPosVarScaleSize(posVarScaleSize) {
    this.posVarScaleSize = posVarScaleSize;
  },
  getPosVarScaleSize() {
    return this.posVarScaleSize;
  },
  setPosVarAOE(posVarAOE) {
    this.posVarAOE = posVarAOE;
  },
  getPosVarAOE() {
    return this.posVarAOE;
  },
  setFriction(friction) {
    if (typeof friction === 'number') {
      this.friction = cc.p(friction, friction);
    } else {
      this.friction = cc.p(friction.x, friction.y);
    }
  },
  getFriction() {
    return this.friction;
  },
  setFadeInAtLifePct(fadeInAtLifePct) {
    this.fadeInAtLifePct = fadeInAtLifePct;
  },
  getFadeInAtLifePct() {
    return this.fadeInAtLifePct;
  },
  setFadeOutAtLifePct(val) {
    this.fadeOutAtLifePct = val;
  },
  getFadeOutAtLifePct() {
    return this.fadeOutAtLifePct;
  },
  setParticleOffset(particleOffset) {
    this.particleOffset = particleOffset;
  },
  getParticleOffset() {
    return this.particleOffset;
  },
  setRelativeOffset(relativeOffset) {
    this.relativeOffset = relativeOffset;
  },
  getRelativeOffset() {
    return this.relativeOffset;
  },
  setEmitFX(emitFX) {
    this.emitFX = emitFX;
  },
  getEmitFX() {
    return this.emitFX;
  },
  setParentSystem(parentSystem) {
    this.parentSystem = parentSystem;
  },
  getParentSystem() {
    return this.parentSystem;
  },
  setEmitOnImpact(emitOnImpact) {
    this.emitOnImpact = emitOnImpact;
    if (emitOnImpact) {
      this.setAutoRemoveOnFinish(false);
    }
  },
  getEmitOnImpact() {
    return this.emitOnImpact;
  },
  setMaxParticlesPerImpact(maxParticlesPerImpact) {
    this.maxParticlesPerImpact = maxParticlesPerImpact;
  },
  getMaxParticlesPerImpact() {
    return this.maxParticlesPerImpact;
  },
  setFitToParent(fitToParent) {
    this.fitToParent = fitToParent;
  },
  getFitToParent() {
    return this.fitToParent;
  },
  setFitToDistance(fitToDistance) {
    this.fitToDistance = fitToDistance;
  },
  getFitToDistance() {
    return this.fitToDistance;
  },
  setLiveForDistance(liveForDistance) {
    this.liveForDistance = liveForDistance;
  },
  getLiveForDistance() {
    return this.liveForDistance;
  },
  setNeedsDepthTest(needsDepthTest) {
    this.needsDepthTest = needsDepthTest;
  },
  getNeedsDepthTest() {
    return this.needsDepthTest;
  },
  setDepthModifier(depthModifier) {
    this.depthModifier = depthModifier;
  },
  getDepthModifier() {
    return this.depthModifier;
  },
  setDepthOffset(depthOffset) {
    this.depthOffset = depthOffset;
  },
  getDepthOffset() {
    return this.depthOffset;
  },
  setParticleDepthOffset(particleDepthOffset) {
    this.particleDepthOffset = particleDepthOffset;
  },
  getParticleDepthOffset() {
    return this.particleDepthOffset;
  },
  setAffectedByWind(affectedByWind) {
    this.affectedByWind = affectedByWind;
  },
  getAffectedByWind() {
    return this.affectedByWind;
  },
  setFlippedX(flippedX) {
    // TODO: flip particle system
    this.flippedX = flippedX;
  },
  isFlippedX() {
    return this.flippedX;
  },
  setEmissionChance(emissionChance) {
    this.emissionChance = emissionChance;
  },
  getEmissionChance() {
    return this.emissionChance;
  },
  setEmissionSynced(emissionSynced) {
    this.emissionSynced = emissionSynced;
  },
  getEmissionSynced() {
    return this.emissionSynced;
  },
  setMaxInertia(maxInertia) {
    this.maxInertia = maxInertia;
  },
  getMaxInertia() {
    return this.maxInertia;
  },
  setMaxInertiaRandom(maxInertiaRandom) {
    this.maxInertiaRandom = maxInertiaRandom;
  },
  getMaxInertiaRandom() {
    return this.maxInertiaRandom;
  },

  getIsFiniteDuration() {
    return this.duration != -1;
  },

  getLifeDuration(parentDuration) {
    // life is duration of emission but not infinite
    return Math.max(typeof parentDuration === 'number' ? parentDuration : CONFIG.PARTICLE_SEQUENCE_DELAY, Math.max(0.0, this.duration));
  },
  getShowDelay() {
    // show is duration of emission but not infinite
    return Math.max(CONFIG.PARTICLE_SEQUENCE_DELAY, Math.max(0.0, this.duration));
  },

  setVisible(visible) {
    const wasVisible = this._visible;
    cc.ParticleSystem.prototype.setVisible.call(this, visible);

    if (this._visible && this._visible != wasVisible) {
      this.updateWorldPositionForParticle();
    }
  },

  setPosition() {
    cc.ParticleSystem.prototype.setPosition.apply(this, arguments);
    this.updateWorldPositionForParticle();
  },

  setSpriteFrame(spriteFrame) {
    this._spriteFrame = spriteFrame;
    const texture = spriteFrame.getTexture();
    const rect = spriteFrame.getRect();
    this._rectRotated = (spriteFrame && spriteFrame.isRotated()) || false;

    // store texture
    this.setTextureWithRect(texture, rect);
  },
  getSpriteFrame() {
    return this._spriteFrame;
  },

  updateWorldPositionForParticle() {
    // when free or following particles, recalculate world position
    const positionType = this.getPositionType();
    if (positionType === cc.ParticleSystem.TYPE_FREE || positionType === cc.ParticleSystem.TYPE_FOLLOW) {
      this._worldPositionForParticle = this.convertToWorldSpace(this._pointZeroForParticle);
    }
  },

  updateEmissionRate() {
    this.setEmissionRate(this.getTotalParticles() / (this.getEstimatedParticleTimeToLive()));

    // reset emit counter
    const rate = 1.0 / this.emissionRate;
    this._emitCounter = 0.0;
    if (!this.getIsFiniteDuration() && this.emissionSynced) {
      this._syncedEmitTime = this._syncedEmitTimeLast = this.getFX().getTime() % rate;
    }
  },

  updateSourceToTarget() {
    const sourceScreenPosition = this.getSourceScreenPosition();
    const targetScreenPosition = this.getTargetScreenPosition();
    if (sourceScreenPosition && targetScreenPosition) {
      let difference = cc.kmVec2Subtract(cc.p(), targetScreenPosition, sourceScreenPosition);
      if (difference.x !== 0 || difference.y !== 0) {
        const posVar = this.getPosVar();
        const posVarDistance = cc.kmVec2Length(posVar);
        const direction = cc.kmVec2Normalize(cc.p(), difference);
        const offsetCorrection = this.getStartSize() + this.getStartSizeVar();
        const sourceOffset = cc.p(offsetCorrection * -direction.x, offsetCorrection * -direction.y);
        const targetOffset = cc.p(offsetCorrection * direction.x, offsetCorrection * direction.y);

        // calculate offset
        this._sourceScreenOffsetPosition = cc.p(sourceScreenPosition.x + sourceOffset.x, sourceScreenPosition.y + sourceOffset.y);
        this._targetScreenOffsetPosition = cc.p(targetScreenPosition.x + targetOffset.x, targetScreenPosition.y + targetOffset.y);
        this.setPosition(this._sourceScreenOffsetPosition);

        // redo difference
        difference = cc.kmVec2Subtract(cc.p(), this._targetScreenOffsetPosition, this._sourceScreenOffsetPosition);
        this._sourceToTargetDistance = cc.kmVec2Length(difference);

        // scale emission area to distance
        if (this.fitToDistance) {
          const scale = (this._sourceToTargetDistance * 0.5) / posVarDistance;
          const fitSize = cc.p(posVar.x * scale, posVar.y * scale);
          this.setPosVar(fitSize);
        }

        // rotate based on direction
        if (this.angled) {
          const rad = Math.atan2(difference.y, difference.x);
          const angle = cc.kmRadiansToDegrees(rad);
          this.setAngle(angle);
          // this.setPosVar(UtilsPosition.rotatePosition(this.getPosVar(), rad));
        }

        this.updateEmissionRate();

        // reset system to apply new offsets
        if (this.isActive()) {
          this.resetSystem();
        }
      }
    }
  },

  onEnter() {
    cc.ParticleSystem.prototype.onEnter.call(this);

    const posVar = this.getPosVar();
    const posVarDistance = cc.kmVec2Length(posVar);
    let distance;

    // rotate gravity when affected by wind
    if (this.affectedByWind && this.getEmitterMode() === cc.ParticleSystem.MODE_GRAVITY) {
      const gravity = this.getGravity();
      distance = Math.sqrt(gravity.x * gravity.x + gravity.y * gravity.y);
      const windDir = this.getFX().getWindDirection();
      this.setGravity(cc.p(windDir.x * distance, windDir.y * distance));
    }

    // set position type when relative to parent
    if (this.relativeToParent) {
      this.setPositionType(cc.ParticleSystem.TYPE_GROUPED);
    }

    // scale emission area to parent content size
    if (this.fitToParent) {
      const parent = this.getParent();
      if (parent) {
        const size = parent.getContentSize();
        distance = Math.sqrt(size.width * size.width + size.height * size.height) * 0.5;
        const scale = distance / posVarDistance;
        const fitSize = cc.p(posVar.x * scale, posVar.y * scale);
        this.setPosVar(fitSize);
        this.setPosition(0, 0);
      }
    }

    this.updateSourceToTarget();
    this.updateEmissionRate();

    if (this.emitOnImpact) {
      this.stopSystem();
    }

    BaseParticleSystem.maxParticles += this.maxParticles;

    this.updateWorldPositionForParticle();
  },

  onExit() {
    cc.ParticleSystem.prototype.onExit.call(this);

    BaseParticleSystem.maxParticles -= this.maxParticles;

    this.emitSystems = null;

    this._renderCmd._teardownVBO();
  },

  addParticle() {
    // only allow new particles when no parent system or parent system has at least 1 particle
    const ps = this.parentSystem;
    if (!ps || this._impacts.length > 0 || ps.particleCount) {
      cc.ParticleSystem.prototype.addParticle.call(this);
    }
  },

  getEstimatedParticleTimeToLive() {
    // helper method to calculate average particle time to live
    // do not use this to set actual particle time to live, it is not random
    let ttl = this.life + this.lifeVar;

    if (this.getEmitterMode() === cc.ParticleSystem.MODE_GRAVITY) {
      const liveForAOE = this.posVarAOE > 0;
      const liveForDistance = this.liveForDistance && this._sourceToTargetDistance > 0.0;
      if (liveForAOE || liveForDistance) {
        let a;
        if (this.affectedByWind) {
          a = cc.pToAngle(this.getFX().getWindDirection());
        } else {
          a = cc.degreesToRadians(this.angle);
          if (this.isFlippedX()) {
            a = Math.PI - a;
          }
        }
        const speed = this.modeA.speed + this.modeA.speedVar;
        const dir = cc.p(Math.cos(a) + speed, Math.sin(a) + speed);
        const delta = Math.max(cc.kmVec2Length(dir), 1.0);

        if (liveForAOE) {
          // make sure particle lives long enough to make the trip
          const posVarX = this._posVar.x * this.posVarAOE;
          const posVarY = this._posVar.y * this.posVarAOE;
          const radius = Math.max(posVarX, posVarY);
          ttl = radius / delta * 1.5;
        } else if (liveForDistance) {
          // time to live based on distance
          ttl = this._sourceToTargetDistance / delta;
        }
      }
    }

    // particles must have a lifespan of at least 1 frame
    return Math.max(1 / 60, ttl);
  },

  initParticle(particle) {
    const locRandomMinus11 = cc.randomMinus1To1;
    const flippedX = this.isFlippedX();
    const flipX = flippedX ? -1 : 1;

    particle.timeToLive = Math.max(0, this.life + this.lifeVar * locRandomMinus11());

    // position
    if (this._staticPositionsToSample) {
      const sampledPosition = _.sample(this._staticPositionsToSample);
      particle.pos.x = sampledPosition.x;
      particle.pos.y = sampledPosition.y;
    } else {
      particle.pos.x = this._posVar.x * locRandomMinus11();
      particle.pos.y = this._posVar.y * locRandomMinus11();
    }

    // size
    let startS = this.startSize + this.startSizeVar * locRandomMinus11();
    startS = Math.max(0, startS); // No negative value
    particle.size = startS;

    // rotation
    const startA = this.startSpin + this.startSpinVar * locRandomMinus11();
    const endA = this.endSpin + this.endSpinVar * locRandomMinus11();
    particle.rotation = startA;

    // position
    const positionType = this.getPositionType();
    if (positionType == cc.ParticleSystem.TYPE_FREE) {
      cc.pIn(particle.startPos, this._worldPositionForParticle);
    } else if (positionType == cc.ParticleSystem.TYPE_RELATIVE) {
      cc.pIn(particle.startPos, this._position);
    } else if (positionType == cc.ParticleSystem.TYPE_FOLLOW) {
      cc.pIn(particle.startPos, this._worldPositionForParticle);

      // set max inertia speed
      particle.maxInertia = this.maxInertia + Math.random() * this.maxInertiaRandom;
    }

    // the previous position relative to emiter gets set to the start position when the particle is initialized
    // this position is used to adjust for inertia during particle updates so that particles anchored (using PARTICLE_TYPE_FOLLOW) have inertia and move towards the emiter center
    // TODO: comment this out some more
    if (particle.prevPosition == null) {
      particle.prevPosition = cc.p(particle.startPos.x, particle.startPos.y);
    } else {
      cc.pIn(particle.prevPosition, particle.startPos);
    }

    // direction
    let a;
    const angleVar = this.angleVar * locRandomMinus11();
    if (this.affectedByWind) {
      a = cc.pToAngle(this.getFX().getWindDirection()) + cc.degreesToRadians(angleVar);
    } else {
      a = cc.degreesToRadians(this.angle + angleVar);
      if (flippedX) {
        a = Math.PI - a;
      }
    }

    const ps = this.parentSystem;
    let psParticle;
    if (ps && ps.particleCount) {
      this._psParticleId = (this._psParticleId + 1) % ps.particleCount;
      psParticle = ps._particles[this._psParticleId];

      if (this._impacts.length === 0) {
        particle.pos.x = psParticle.pos.x + this._posVar.x * locRandomMinus11();
        particle.pos.y = psParticle.pos.y + this._posVar.y * locRandomMinus11();
      }
    }

    // depth test random offset
    particle.depthOffset = this.particleDepthOffset * locRandomMinus11();

    let rad;
    let speed;
    if (this.getEmitterMode() === cc.ParticleSystem.MODE_GRAVITY) {
      // Mode Gravity: A
      const locModeA = this.modeA; const
        locParticleModeA = particle.modeA;
      const s = locModeA.speed + locModeA.speedVar * locRandomMinus11();

      // direction
      locParticleModeA.dir.x = Math.cos(a);
      locParticleModeA.dir.y = Math.sin(a);
      cc.pMultIn(locParticleModeA.dir, s);

      // radial accel
      locParticleModeA.radialAccel = locModeA.radialAccel + locModeA.radialAccelVar * locRandomMinus11();

      // tangential accel
      locParticleModeA.tangentialAccel = locModeA.tangentialAccel * flipX + locModeA.tangentialAccelVar * locRandomMinus11();

      // rotation is dir
      if (locModeA.rotationIsDir) {
        particle.rotation = -cc.radiansToDegrees(cc.pToAngle(locParticleModeA.dir));
      }

      if (this.directionAligned) {
        // align particles to opposite of parent system particle direction
        if (ps && psParticle && ps.getEmitterMode() === cc.ParticleSystem.MODE_GRAVITY) {
          rad = -cc.pToAngle(psParticle.modeA.dir);
          speed = Math.max(cc.kmVec2Length(locParticleModeA.dir), 1.0);
          const psDir = cc.p(psParticle.modeA.dir.x, psParticle.modeA.dir.y);
          const psSpeed = Math.max(cc.kmVec2Length(psDir), 1.0);
          locParticleModeA.dir = cc.p(speed * (-psDir.x / psSpeed), speed * (-psDir.y / psSpeed));
          particle.rotation = cc.radiansToDegrees(rad);
        } else {
          rad = cc.pToAngle(locParticleModeA.dir);
          particle.rotation = -cc.radiansToDegrees(rad);
        }
      }

      // time to live based on distance
      if (this.liveForDistance && this._sourceToTargetDistance > 0.0) {
        speed = Math.max(cc.kmVec2Length(locParticleModeA.dir), 1.0);
        particle.timeToLive = this._sourceToTargetDistance / speed;
      }

      // area of effect radius
      // FIXME: these calculations are not very accurate
      if (this.posVarAOE > 0) {
        const posVarX = this._posVar.x * this.posVarAOE;
        const posVarY = this._posVar.y * this.posVarAOE;

        // offset in direction of travel by radius
        const radius = Math.max(posVarX, posVarY);
        const dir = cc.p(-locParticleModeA.dir.x, -locParticleModeA.dir.y);
        const dirAngle = cc.pToAngle(dir);
        const accel = (locParticleModeA.radialAccel + locParticleModeA.tangentialAccel);
        const accelOffsetX = -accel * 0.35;
        const accelOffsetY = particle.pos.x > 0 ? -accel * 0.65 : accel * 0.65;
        const radiusOffset = UtilsPosition.rotatePosition(cc.p(radius + accelOffsetX, accelOffsetY), dirAngle);
        particle.pos.x += radiusOffset.x;
        particle.pos.y += radiusOffset.y;
        // make sure particle lives long enough to make the trip
        speed = Math.max(cc.kmVec2Length(locParticleModeA.dir), 1.0);
        particle.timeToLive = Math.max(0, radius / speed);

        // correct depth offset so particles aren't going behind units when they still have a long ways to go
        const diff = Math.abs(particle.pos.y) - radius;
        if (diff > 0) {
          particle.depthOffset = -this.particleDepthOffset - this.particleDepthOffset * Math.random() * 0.5;
        } else {
          particle.depthOffset = this.particleDepthOffset + this.particleDepthOffset * Math.random() * 0.5;
        }
      }
    } else {
      // Mode Radius: B
      const locModeB = this.modeB; const
        locParticleModeB = particle.modeB;

      // Set the default diameter of the particle from the source position
      const startRadius = locModeB.startRadius + locModeB.startRadiusVar * locRandomMinus11();
      const endRadius = locModeB.endRadius + locModeB.endRadiusVar * locRandomMinus11();

      locParticleModeB.radius = startRadius;
      locParticleModeB.deltaRadius = (locModeB.endRadius === cc.ParticleSystem.START_RADIUS_EQUAL_TO_END_RADIUS) ? 0 : (endRadius - startRadius) / particle.timeToLive;

      locParticleModeB.angle = a;
      locParticleModeB.degreesPerSecond = cc.degreesToRadians(locModeB.rotatePerSecond + locModeB.rotatePerSecondVar * locRandomMinus11());

      if (this.directionAligned) {
        particle.rotation = a;
      }
    }

    if (this.particleOffset.x !== 0 || this.particleOffset.y !== 0) {
      particle.pos.x += this.particleOffset.x * flipX;
      particle.pos.y += this.particleOffset.y;
    }

    if (this.relativeOffset.x !== 0 || this.relativeOffset.y !== 0) {
      let relativeOffset;
      if (this.getEmitterMode() === cc.ParticleSystem.MODE_GRAVITY) {
        rad = cc.pToAngle(particle.modeA.dir);
        relativeOffset = UtilsPosition.rotatePosition(this.relativeOffset, rad);
      } else {
        relativeOffset = this.relativeOffset;
      }
      particle.pos.x += relativeOffset.x * (this.startSize + this._posVar.x);
      particle.pos.y += relativeOffset.y * (this.startSize + this._posVar.y);
    }

    particle.lastPos = cc.p(particle.pos.x, particle.pos.y);
    particle.deltaPos = cc.p();

    // values that rely on time to live
    const ttl = particle.timeToLive;
    particle.lifeDuration = ttl;

    // delta rotation
    particle.deltaRotation = (endA - startA) / ttl;

    // delta size
    if (this.endSize === cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE) {
      particle.deltaSize = 0;
    } else {
      let endS = this.endSize + this.endSizeVar * locRandomMinus11();
      endS = Math.max(0, endS); // No negative values
      particle.deltaSize = (endS - startS) / ttl;
    }

    // delta color
    const locStartColor = this._startColor; const
      locStartColorVar = this._startColorVar;
    const locEndColor = this._endColor; const
      locEndColorVar = this._endColorVar;
    const start = {
      r: cc.clampf(locStartColor.r + locStartColorVar.r * locRandomMinus11(), 0, 255),
      g: cc.clampf(locStartColor.g + locStartColorVar.g * locRandomMinus11(), 0, 255),
      b: cc.clampf(locStartColor.b + locStartColorVar.b * locRandomMinus11(), 0, 255),
      a: cc.clampf(locStartColor.a + locStartColorVar.a * locRandomMinus11(), 0, 255),
    };
    const end = {
      r: cc.clampf(locEndColor.r + locEndColorVar.r * locRandomMinus11(), 0, 255),
      g: cc.clampf(locEndColor.g + locEndColorVar.g * locRandomMinus11(), 0, 255),
      b: cc.clampf(locEndColor.b + locEndColorVar.b * locRandomMinus11(), 0, 255),
      a: cc.clampf(locEndColor.a + locEndColorVar.a * locRandomMinus11(), 0, 255),
    };

    particle.color = start;
    const locParticleDeltaColor = particle.deltaColor;
    locParticleDeltaColor.r = (end.r - start.r) / ttl;
    locParticleDeltaColor.g = (end.g - start.g) / ttl;
    locParticleDeltaColor.b = (end.b - start.b) / ttl;
    // actual time to live for fading is modulated by fade in/out at life pct
    const ttlFade = ttl * Math.max(0.0, 1.0 - this.fadeInAtLifePct - (1.0 - this.fadeOutAtLifePct));
    locParticleDeltaColor.a = ttlFade != 0.0 ? (end.a - start.a) / ttlFade : 0.0;

    particle.startAlpha = start.a;
    particle.endAlpha = end.a;

    // update particle quad in batch
    if (this._batchNode) {
      const textureAtlas = this._batchNode.getTextureAtlas();
      textureAtlas.updateQuad(this._renderCmd._quad, this.atlasIndex + particle.atlasIndex);
    }

    // auto particle system creation
    const { emitFX } = this;
    if (emitFX && !this.emitSystems) {
      this.emitSystems = [];

      const fxSprites = this._emitFXSprites = NodeFactory.createFX(emitFX);
      for (let i = 0; i < fxSprites.length; i++) {
        const fxSprite = fxSprites[i];

        if (fxSprite instanceof BaseParticleSystem) {
          this.emitSystems.push(fxSprite);
          fxSprite.setEmitOnImpact(true);
        }

        // correct for multiplicative scale
        fxSprite.setScale(fxSprite.getScale() * (1.0 / this.getScale()));

        this.addChild(fxSprite, fxSprite.getLocalZOrder() || -1);
      }
    }
  },

  // extendable update methods for particles
  updateParticle(particle, dt, currentPosition, tpa, tpb, tpc) {
    const { friction } = this;
    const { lastPos } = particle;
    var { deltaPos } = particle;
    let mode;

    // Mode A: gravity, direction, tangential accel & radial accel
    if (this.getEmitterMode() == cc.ParticleSystem.MODE_GRAVITY) {
      const tmp = tpc; const radial = tpa; const
        tangential = tpb;
      mode = particle.modeA;

      // radial acceleration
      if (particle.pos.x || particle.pos.y) {
        cc.pIn(radial, particle.pos);
        cc.pNormalizeIn(radial);
      } else {
        cc.pZeroIn(radial);
      }

      cc.pIn(tangential, radial);
      cc.pMultIn(radial, particle.modeA.radialAccel);

      // tangential acceleration
      const newy = tangential.x;
      tangential.x = -tangential.y;
      tangential.y = newy;

      cc.pMultIn(tangential, particle.modeA.tangentialAccel);

      cc.pIn(tmp, radial);
      cc.pAddIn(tmp, tangential);
      cc.pAddIn(tmp, this.modeA.gravity);
      cc.pMultIn(tmp, dt);
      cc.pAddIn(mode.dir, tmp);

      cc.pIn(tmp, mode.dir);
      cc.pMultIn(tmp, dt);
      cc.pAddIn(particle.pos, tmp);

      // decay particle speed
      mode.dir.x *= friction.x;
      mode.dir.y *= friction.y;
    } else {
      // Mode B: radius movement
      mode = particle.modeB;
      // Update the angle and radius of the particle.
      mode.angle += mode.degreesPerSecond * dt;
      mode.radius += mode.deltaRadius * dt;

      particle.pos.x = -Math.cos(mode.angle) * mode.radius;
      particle.pos.y = -Math.sin(mode.angle) * mode.radius;

      // decay particle speed
      mode.angle *= friction.x;
      mode.radius *= friction.y;
    }

    // color
    this._renderCmd._updateDeltaColor(particle, dt);

    // size
    particle.size = Math.max(0, particle.size + (particle.deltaSize * dt));

    // align particle with direction of travel, where forward is right
    if (this.directionAligned) {
      if (deltaPos.x !== 0.0 || deltaPos.y !== 0.0) {
        particle.rotation = -cc.kmRadiansToDegrees(Math.atan2(deltaPos.y, deltaPos.x));
      }
    } else {
      particle.rotation += (particle.deltaRotation * dt);
    }

    // update values in quad
    const newPos = tpa;
    const positionType = this.getPositionType();
    if ((positionType == cc.ParticleSystem.TYPE_FREE || positionType == cc.ParticleSystem.TYPE_RELATIVE) && !this.parallaxMode) {
      var diff = tpb;
      cc.pIn(diff, currentPosition);
      cc.pSubIn(diff, particle.startPos);

      cc.pIn(newPos, particle.pos);
      cc.pSubIn(newPos, diff);
    } else if (positionType == cc.ParticleSystem.TYPE_FOLLOW) {
      // this case is when we want particles to follow the emitter but with some viscosity / inertia
      // basically particles are anchored to emitter but follow slowly

      // === update position based on max speed / inertia ===
      // calculate speed based on the previous position relative to emitter (prevPosition) and current position relative to emitter (currentPosition)
      // prevPosition will initially equal to the "startPos" of the particle
      const particleMoveSpeed = Math.abs(cc.pDistance(currentPosition, particle.prevPosition) / dt);
      // calculate maxSpeed relative to time
      const maxSpeed = particle.maxInertia / dt;
      // if the speed of the particle is faster than the max allowed speed
      if (particleMoveSpeed > maxSpeed) {
        // calculate by which factor we need to slow down the particle
        const factor = maxSpeed / particleMoveSpeed;
        // how much motion has happened between current positon and previous position (both relative to emitter position)
        var deltaPos = cc.pSub(currentPosition, particle.prevPosition);
        // adjust the delta / motion amount by the speed slowdown factor
        cc.pMultIn(deltaPos, factor);
        // add the new delta (with slowdown) to the previous position relative to emitter
        cc.pAddIn(particle.prevPosition, deltaPos);
      } else {
        // otherwise just set the previous position to current position
        cc.pIn(particle.prevPosition, currentPosition);
      }

      // calculate distance (diff) between current and previous position
      var diff = tpb;
      cc.pIn(diff, currentPosition);
      cc.pSubIn(diff, particle.prevPosition);

      // subtract the distance (diff) from the particle position calculated by motion/gravity/radial etc.
      cc.pIn(newPos, particle.pos);
      cc.pSubIn(newPos, diff);
    } else {
      cc.pIn(newPos, particle.pos);
    }

    // translate newPos to correct position, since matrix transform isn't performed in batchnode
    // don't update the particle with the new position information, it will interfere with the radius and tangential calculations
    if (this._batchNode) {
      newPos.x += this._position.x;
      newPos.y += this._position.y;
    }

    // align particle to pixel grid
    if (this.pixelGridAligned) {
      const gridSize = this.pixelGridSize;
      newPos.x = newPos.x - (newPos.x % gridSize) + gridSize;
      newPos.y = newPos.y - (newPos.y % gridSize) + gridSize;
    }

    // save change in position
    deltaPos.x = newPos.x - lastPos.x;
    deltaPos.y = newPos.y - lastPos.y;
    lastPos.x = newPos.x;
    lastPos.y = newPos.y;

    this._renderCmd.updateParticlePosition(particle, newPos);
  },
  killParticle(particle) {
    // impact just before kill
    const { emitSystems } = this;
    if (emitSystems) {
      for (let i = 0; i < emitSystems.length; i++) {
        const particleSystem = emitSystems[i];
        particleSystem.impactParticle(particle);
      }
    }

    // shift and disable particle
    const locParticles = this._particles;
    const currentIndex = particle.atlasIndex;
    if (this._particleIdx !== this.particleCount - 1) {
      const deadParticle = locParticles[this._particleIdx];
      locParticles[this._particleIdx] = locParticles[this.particleCount - 1];
      locParticles[this.particleCount - 1] = deadParticle;
    }
    if (this._batchNode) {
      // disable the switched particle
      this._batchNode.disableParticle(this.atlasIndex + currentIndex);

      // switch indexes
      locParticles[this.particleCount - 1].atlasIndex = currentIndex;
    }

    --this.particleCount;
  },
  impactParticle(particle) {
    if (this.emitOnImpact && particle) {
      const ps = this.parentSystem;

      // store impact info
      let impactMaxParticles;
      if (this.maxParticlesPerImpact >= 0) {
        impactMaxParticles = Math.min(this.maxParticlesPerImpact, this.maxParticles);
      } else if (ps) {
        impactMaxParticles = Math.ceil(this.maxParticles / ps.maxParticles);
      } else {
        impactMaxParticles = 0;
      }

      if (impactMaxParticles > 0) {
        const impactPosition = cc.p(particle.pos.x, particle.pos.y);
        const impactDuration = this.duration > 0 ? this.duration * (impactMaxParticles / this.maxParticles) : 0;
        this._impacts.push(new ParticleImpact(impactMaxParticles, impactPosition, impactDuration));
        this._isActive = true;

        if (this.getIsFiniteDuration()) {
          this._elapsed = 0;
        }
      }
    }
  },

  stopSystem() {
    cc.ParticleSystem.prototype.stopSystem.call(this);
    this._impacts.length = 0;
  },

  resetSystem() {
    cc.ParticleSystem.prototype.resetSystem.call(this);
    this._impacts.length = 0;

    // do a single update to ensure system is reset immediately
    this.update(1.0 / 60.0);
  },

  /**
   * Resumes the particle system without resetting.
   */
  resumeSystem() {
    this._isActive = true;
    this._elapsed = 0;
  },

  /**
   * Seeds a particle system with a number of particles immediately, or the max if no number provided.
   * NOTE: this does not simulate system, only adds particles at initial position
   * @param {Number} [numParticles=max] number of particles to seed system with, up to max
   */
  seedSystem(numParticles) {
    numParticles || (numParticles = this._totalParticles);
    const particlesEmitted = 0;
    while ((this.particleCount < this._totalParticles) && (particlesEmitted < numParticles)) {
      this.addParticle();
    }
  },

  /**
   * Simulates a particle system for a given duration.
   * NOTE: systems attempt to update at a rate of 60 fps, so be very careful about how long you simulate
   * @param {Number} timeToSimulate duration in seconds to simulate
   */
  simulateSystem(timeToSimulate) {
    const dtFixed = 1.0 / 60.0;
    const dtDiv = timeToSimulate / dtFixed;
    const steps = Math.floor(dtDiv);
    for (let i = 0; i < steps; i++) {
      if (this._parent == null) {
        break;
      } else {
        this.update(dtFixed);
      }
    }
  },

  updateEmit(rate) {
    while ((this.particleCount < this._totalParticles) && (this._emitCounter >= rate)) {
      this.addParticle();
      this._emitCounter = Math.max(0.0, this._emitCounter - rate);
    }
  },

  update(dt) {
    this._particleIdx = 0;

    if (this._isActive && this.emissionRate) {
      const rate = 1.0 / this.emissionRate;

      // impact emissions
      const impacts = this._impacts;
      if (impacts.length > 0) {
        // store counter
        const emitCounter = this._emitCounter;

        for (let i = impacts.length - 1; i >= 0; i--) {
          const impact = impacts[i];

          // shift to impact position
          this.setPosition(impact.position);

          // set emit counter to emit an exact number of particles
          let { maxParticles } = impact;
          if (impact.duration) {
            maxParticles *= Math.min(1.0, dt / impact.duration);
          }
          this._emitCounter = rate * maxParticles;

          this.updateEmit(rate);

          impact.elapsed += dt;
          // this impact complete
          if (impact.duration <= impact.elapsed) {
            impacts.splice(i, 1);
            // all impacts complete
            if (impacts.length === 0) {
              this.stopSystem();
            }
          }
        }

        // restore counter
        this._emitCounter = emitCounter;
      } else {
        // default emissions
        const isFiniteDuration = this.getIsFiniteDuration();
        if (isFiniteDuration) {
          // bursty with limited duration
          let particlesToEmit = this._totalParticles - this.particleCount;
          if (this.duration) {
            particlesToEmit *= dt / this.duration;
          }
          if (particlesToEmit < 1) {
            this._emitCounter += this.particleCount === 0 ? rate : dt;
          } else {
            this._emitCounter = rate * particlesToEmit;
          }
        } else if (this.emissionSynced) {
          // synced emission with any other particle system with the same rate
          this._syncedEmitTimeLast = this._syncedEmitTime;
          this._syncedEmitTime = this.getFX().getTime() % rate;
          if (this._syncedEmitTimeLast > this._syncedEmitTime) {
            this._emitCounter += rate;
          }

          // when emission needed but at max number of particles
          // force kill oldest particle so that emission stays in sync
          if (this._emitCounter >= rate && this.particleCount >= this._totalParticles) {
            this.killParticle(this._particles[this._particleIdx]);
          }
        } else if (this.emissionChance === 1.0 || Math.random() <= this.emissionChance) {
          // default emission
          this._emitCounter += dt;
        }

        this.updateEmit(rate);

        this._elapsed += dt;
        if (isFiniteDuration && this.duration < this._elapsed) {
          this.stopSystem();
        }
      }
    }

    const currentPosition = cc.Particle.TemporaryPoints[0];
    const positionType = this.getPositionType();
    if (positionType == cc.ParticleSystem.TYPE_FREE) {
      cc.pIn(currentPosition, this._worldPositionForParticle);
    } else if (positionType == cc.ParticleSystem.TYPE_RELATIVE) {
      cc.pIn(currentPosition, this._position);
    } else if (positionType == cc.ParticleSystem.TYPE_FOLLOW) {
      cc.pIn(currentPosition, this._worldPositionForParticle);
    }

    if (this._visible) {
      // Used to reduce memory allocation / creation within the loop
      const tpa = cc.Particle.TemporaryPoints[1];
      const tpb = cc.Particle.TemporaryPoints[2];
      const tpc = cc.Particle.TemporaryPoints[3];

      const locParticles = this._particles;
      while (this._particleIdx < this.particleCount) {
        // Reset the working particles
        cc.pZeroIn(tpa);
        cc.pZeroIn(tpb);
        cc.pZeroIn(tpc);

        const particle = locParticles[this._particleIdx];
        particle.timeToLive -= dt;

        if (particle.timeToLive > 0) {
          this.updateParticle(particle, dt, currentPosition, tpa, tpb, tpc);

          ++this._particleIdx;
        } else {
          this.killParticle(particle);
        }
      }

      if (this.particleCount == 0 && this.isAutoRemoveOnFinish() && this._parent != null) {
        this.unscheduleUpdate();
        this._parent.removeChild(this, true);
        return;
      }

      this._transformSystemDirty = false;
    }

    if (!this._batchNode) this.postStep();
  },
});

BaseParticleSystem.WebGLRenderCmd = function (renderable) {
  this._needsSetupVBO = true;
  cc.ParticleSystem.WebGLRenderCmd.call(this, renderable);
  this._quad = new cc.V3F_C4B_T2F_Quad();
  this._pointRect = cc.rect();
  this._boundingSize = 1.0;
};
const proto = BaseParticleSystem.WebGLRenderCmd.prototype = Object.create(cc.ParticleSystem.WebGLRenderCmd.prototype);
proto.constructor = BaseParticleSystem.WebGLRenderCmd;

proto.setBatchNode = function (batchNode) {
  const node = this._node;
  if (node._batchNode != batchNode) {
    const oldBatch = node._batchNode;
    node._batchNode = batchNode; // weak reference

    if (batchNode) {
      const locParticles = node._particles;
      for (let i = 0; i < node._totalParticles; i++) locParticles[i].atlasIndex = i;
    }

    if (!batchNode) {
      // no new batch
      this._allocMemory();
      this.initIndices(node._totalParticles);
      node.setTexture(oldBatch.getTexture());
      this._setupVBO();
    } else if (!oldBatch) {
      // no old batch

      // copy current state to batch
      node._batchNode.textureAtlas._copyQuadsToTextureAtlas(this._quads, node.atlasIndex);

      // delete buffers
      this._teardownVBO();
    }
  }
};

proto._needsSetupVBO = true;
proto._setupVBO = function () {
  if (this._needsSetupVBO) {
    const gl = cc._renderContext;

    this._needsSetupVBO = false;

    this._buffersVBO[0] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._buffersVBO[0]);
    gl.bufferData(gl.ARRAY_BUFFER, this._quadsArrayBuffer, gl.DYNAMIC_DRAW);

    this._buffersVBO[1] = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1]);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, gl.STATIC_DRAW);
  }
};

proto._teardownVBO = function () {
  if (!this._needsSetupVBO) {
    const gl = cc._renderContext;

    this._needsSetupVBO = true;

    gl.deleteBuffer(this._buffersVBO[0]);
    gl.deleteBuffer(this._buffersVBO[1]);
    this._buffersVBO = [0, 0];
  }
};

proto.transform = function () {
  const node = this._node;
  cc.ParticleSystem.WebGLRenderCmd.prototype.transform.apply(this, arguments);

  node.updateWorldPositionForParticle();
};
proto.getNodeToParentTransform = function () {
  const xyzRotationDirty = this._xyzRotationDirty;
  const ret = cc.ParticleSystem.WebGLRenderCmd.prototype.getNodeToParentTransform.apply(this, arguments);
  if (xyzRotationDirty) {
    this.updateQuad();
  }
  return ret;
};
proto.getNodeToParentXYZTransform = function (t4x4) {
  // don't rotate this transform, xyz rotation will be applied to particle quad
  return t4x4;
};
proto.initTexCoordsWithRect = function (rect) {
  cc.ParticleSystem.WebGLRenderCmd.prototype.initTexCoordsWithRect.call(this, rect);
  this._pointRect = rect;
  this.updateQuad();
  cc.Sprite.WebGLRenderCmd.prototype._setTextureCoords.call(this, rect);
};

proto._updateDeltaColor = function (particle, dt) {
  const node = this._node;
  if (!node._dontTint) {
    const { color } = particle;
    const { deltaColor } = particle;
    color.r = Math.max(0.0, color.r + (deltaColor.r * dt));
    color.g = Math.max(0.0, color.g + (deltaColor.g * dt));
    color.b = Math.max(0.0, color.b + (deltaColor.b * dt));

    const lifePct = 1.0 - particle.timeToLive / particle.lifeDuration;
    const { fadeInAtLifePct } = node;
    const { fadeOutAtLifePct } = node;
    if (lifePct <= fadeInAtLifePct) {
      color.a = particle.startAlpha * Math.min(1.0, lifePct / fadeInAtLifePct);
    } else if (lifePct >= fadeOutAtLifePct) {
      color.a = particle.endAlpha * ((1.0 - lifePct) / (1.0 - fadeOutAtLifePct));
    } else {
      color.a = Math.max(0.0, color.a + (deltaColor.a * dt));
    }

    particle.isChangeColor = true;
  }
};

proto.updateQuad = function () {
  if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
    return;
  }

  const node = this._node;

  // create a quad from the texture
  // because cocos2d assumes everything is square
  // we need to correct this behavior in the case of most textures
  const quad = this._quad;
  const scaleFactor = cc.contentScaleFactor();
  // convert to pixels coords
  const rect = cc.rect(
    this._pointRect.x * scaleFactor,
    this._pointRect.y * scaleFactor,
    this._pointRect.width * scaleFactor,
    this._pointRect.height * scaleFactor,
  );

  let width;
  let height;

  if (node._texture) {
    width = node._texture.getPixelsWide();
    height = node._texture.getPixelsHigh();
  } else {
    width = rect.width;
    height = rect.height;
  }

  this._boundingSize = Math.max(rect.width, rect.height, 1.0);

  const halfWidth = rect.width * 0.5;
  const halfHeight = rect.height * 0.5;

  const left = rect.x - halfWidth;
  const bottom = rect.y - halfHeight;
  const right = rect.x + halfWidth;
  const top = rect.y + halfHeight;

  // vertices

  const needsRotation = this._xyzRotationMatrix != null;
  let bl; let br; let tl; let
    tr;
  if (needsRotation) {
    bl = cc.kmVec4Transform(new cc.kmVec4(), new cc.kmVec4(left, bottom, 0.0), this._xyzRotationMatrix);
    br = cc.kmVec4Transform(new cc.kmVec4(), new cc.kmVec4(right, bottom, 0.0), this._xyzRotationMatrix);
    tl = cc.kmVec4Transform(new cc.kmVec4(), new cc.kmVec4(left, top, 0.0), this._xyzRotationMatrix);
    tr = cc.kmVec4Transform(new cc.kmVec4(), new cc.kmVec4(right, top, 0.0), this._xyzRotationMatrix);
  } else {
    bl = new cc.kmVec4(left, bottom, 0.0);
    br = new cc.kmVec4(right, bottom, 0.0);
    tl = new cc.kmVec4(left, top, 0.0);
    tr = new cc.kmVec4(right, top, 0.0);
  }
  quad.bl.vertices.x = bl.x;
  quad.bl.vertices.y = bl.y;
  quad.bl.vertices.z = bl.z;

  quad.br.vertices.x = br.x;
  quad.br.vertices.y = br.y;
  quad.br.vertices.z = br.z;

  quad.tl.vertices.x = tl.x;
  quad.tl.vertices.y = tl.y;
  quad.tl.vertices.z = tl.z;

  quad.tr.vertices.x = tr.x;
  quad.tr.vertices.y = tr.y;
  quad.tr.vertices.z = tr.z;

  // uvs

  let uvl; let uvb; let uvr; let
    uvt;
  if (cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL) {
    uvl = (rect.x * 2 + 1) / (width * 2);
    uvb = (rect.y * 2 + 1) / (height * 2);
    uvr = uvl + (rect.width * 2 - 2) / (width * 2);
    uvt = uvb + (rect.height * 2 - 2) / (height * 2);
  } else {
    uvl = rect.x / width;
    uvb = rect.y / height;
    uvr = uvl + rect.width / width;
    uvt = uvb + rect.height / height;
  }

  // Important. Texture in cocos2d are inverted, so the Y component should be inverted
  const temp = uvt;
  uvt = uvb;
  uvb = temp;

  quad.bl.texCoords.u = uvl;
  quad.bl.texCoords.v = uvb;

  quad.br.texCoords.u = uvr;
  quad.br.texCoords.v = uvb;

  quad.tl.texCoords.u = uvl;
  quad.tl.texCoords.v = uvt;

  quad.tr.texCoords.u = uvr;
  quad.tr.texCoords.v = uvt;
};

proto.updateQuadWithParticle = function (particle, newPosition) {
  let quad = null; const
    node = this._node;
  if (node._batchNode) {
    const batchQuads = node._batchNode.textureAtlas.quads;
    quad = batchQuads[node.atlasIndex + particle.atlasIndex];
    node._batchNode.textureAtlas.dirty = true;
  } else {
    quad = this._quads[node._particleIdx];
  }

  // colors
  const { color } = particle;
  let r; let g; let b; let
    a;
  if (node._opacityModifyRGB) {
    const opacity = color.a / 255;
    r = 0 | (color.r * (this._displayedColor.r / 255.0) * opacity);
    g = 0 | (color.g * (this._displayedColor.g / 255.0) * opacity);
    b = 0 | (color.b * (this._displayedColor.b / 255.0) * opacity);
  } else {
    r = 0 | (color.r * (this._displayedColor.r / 255.0));
    g = 0 | (color.g * (this._displayedColor.g / 255.0));
    b = 0 | (color.b * (this._displayedColor.b / 255.0));
  }
  a = 0 | (color.a * (this._displayedOpacity / 255.0));

  const blColors = quad.bl.colors; const brColors = quad.br.colors; const tlColors = quad.tl.colors; const
    trColors = quad.tr.colors;
  blColors.r = brColors.r = tlColors.r = trColors.r = r;
  blColors.g = brColors.g = tlColors.g = trColors.g = g;
  blColors.b = brColors.b = tlColors.b = trColors.b = b;
  blColors.a = brColors.a = tlColors.a = trColors.a = a;

  // vertices

  const { x } = newPosition;
  const { y } = newPosition;
  let rad; let cr; let
    sr;
  let zbl = 0.0;
  let zbr = 0.0;
  let ztl = 0.0;
  let ztr = 0.0;

  // because cocos2d assumes everything is square
  // we need to correct this behavior in the case of rectangular textures
  const systemQuad = this._quad;
  if (systemQuad) {
    const scale = particle.size / this._boundingSize;
    const bl = systemQuad.bl.vertices;
    const br = systemQuad.br.vertices;
    const tl = systemQuad.tl.vertices;
    const tr = systemQuad.tr.vertices;
    const xbl = bl.x * scale;
    const ybl = bl.y * scale;
    const xbr = br.x * scale;
    const ybr = br.y * scale;
    const xtl = tl.x * scale;
    const ytl = tl.y * scale;
    const xtr = tr.x * scale;
    const ytr = tr.y * scale;

    zbl = bl.z * scale;
    zbr = br.z * scale;
    ztl = tl.z * scale;
    ztr = tr.z * scale;

    if (particle.rotation) {
      rad = -cc.degreesToRadians(particle.rotation);
      cr = Math.cos(rad);
      sr = Math.sin(rad);

      quad.bl.vertices.x = xbl * cr - ybl * sr + x;
      quad.bl.vertices.y = xbl * sr + ybl * cr + y;

      quad.br.vertices.x = xbr * cr - ybr * sr + x;
      quad.br.vertices.y = xbr * sr + ybr * cr + y;

      quad.tl.vertices.x = xtl * cr - ytl * sr + x;
      quad.tl.vertices.y = xtl * sr + ytl * cr + y;

      quad.tr.vertices.x = xtr * cr - ytr * sr + x;
      quad.tr.vertices.y = xtr * sr + ytr * cr + y;
    } else {
      quad.bl.vertices.x = xbl + x;
      quad.bl.vertices.y = ybl + y;

      quad.br.vertices.x = xbr + x;
      quad.br.vertices.y = ybr + y;

      quad.tl.vertices.x = xtl + x;
      quad.tl.vertices.y = ytl + y;

      quad.tr.vertices.x = xtr + x;
      quad.tr.vertices.y = ytr + y;
    }
  } else {
    const halfSize = particle.size / 2;
    if (particle.rotation) {
      const x1 = -halfSize;
      const y1 = -halfSize;
      const x2 = halfSize;
      const y2 = halfSize;

      rad = -cc.degreesToRadians(particle.rotation);
      cr = Math.cos(rad);
      sr = Math.sin(rad);

      quad.bl.vertices.x = x1 * cr - y1 * sr + x;
      quad.bl.vertices.y = x1 * sr + y1 * cr + y;

      quad.br.vertices.x = x2 * cr - y1 * sr + x;
      quad.br.vertices.y = x2 * sr + y1 * cr + y;

      quad.tl.vertices.x = x1 * cr - y2 * sr + x;
      quad.tl.vertices.y = x1 * sr + y2 * cr + y;

      quad.tr.vertices.x = x2 * cr - y2 * sr + x;
      quad.tr.vertices.y = x2 * sr + y2 * cr + y;
    } else {
      quad.bl.vertices.x = newPosition.x - halfSize;
      quad.bl.vertices.y = newPosition.y - halfSize;

      quad.br.vertices.x = newPosition.x + halfSize;
      quad.br.vertices.y = newPosition.y - halfSize;

      quad.tl.vertices.x = newPosition.x - halfSize;
      quad.tl.vertices.y = newPosition.y + halfSize;

      quad.tr.vertices.x = newPosition.x + halfSize;
      quad.tr.vertices.y = newPosition.y + halfSize;
    }
  }

  if (node.needsDepthTest) {
    const depthOffset = particle.depthOffset - y;
    zbl += depthOffset;
    zbr += depthOffset;
    ztl += depthOffset;
    ztr += depthOffset;
  }

  quad.bl.vertices.z = zbl;
  quad.br.vertices.z = zbr;
  quad.tl.vertices.z = ztl;
  quad.tr.vertices.z = ztr;
};

proto.rendering = function (ctx) {
  const node = this._node;
  if (!node._texture || this._needsSetupVBO) return;

  this.updateMatricesForRender();

  // depth test draw
  if (node.needsDepthTest) {
    const gl = ctx || cc._renderContext;

    const depthTestProgram = cc.shaderCache.programForKey('DepthTest');
    depthTestProgram.use();
    depthTestProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);
    depthTestProgram.setUniformLocationWith1f(depthTestProgram.loc_depthOffset, node.depthOffset);
    depthTestProgram.setUniformLocationWith1f(depthTestProgram.loc_depthModifier, node.depthModifier);
    cc.glBindTexture2DN(0, node._texture);
    cc.glBindTexture2DN(1, node.getFX().getDepthMap());

    cc.glBlendFuncForParticle(node._blendFunc.src, node._blendFunc.dst);

    // Using VBO without VAO
    cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);

    gl.bindBuffer(gl.ARRAY_BUFFER, this._buffersVBO[0]);
    gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12);
    gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 24, 16);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1]);
    gl.drawElements(gl.TRIANGLES, node._particleIdx * 6, gl.UNSIGNED_SHORT, 0);
  } else {
    // default draw
    cc.ParticleSystem.WebGLRenderCmd.prototype.rendering.call(this, ctx);
  }

  this.updateMatricesAfterRender();
};

var ParticleImpact = function (maxParticles, position, duration) {
  this.maxParticles = maxParticles || 0;
  this.position = position || cc.p();
  this.duration = duration || 0;
  this.elapsed = 0;
};

ParticleImpact.prototype = {
  constructor: ParticleImpact,
  maxParticles: 0,
  position: null,
  duration: 0,
  elapsed: 0,
};

// max possible number of particles across all systems in the scene
BaseParticleSystem.maxParticles = 0.0;

/**
 * Creates a new particle system with properties based on an options object.
 * @param {Object} options name of plist file, pass either a string or options object with plistFile property
 * @param {BaseParticleSystem} [system]
 */
BaseParticleSystem.create = function (options, system) {
  return system || new BaseParticleSystem(options);
};

cc.ParticleSystem.TYPE_FOLLOW = 'PARTICLE_TYPE_FOLLOW';

module.exports = BaseParticleSystem;
