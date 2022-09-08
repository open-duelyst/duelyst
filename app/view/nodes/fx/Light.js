const CONFIG = require('app/common/config');
const UtilsEngine = require('app/common/utils/utils_engine');

/** **************************************************************************
Light
var Light = cc.Node
Light.create()
 - lights are drawn as a part of a batch, never individually
 - light default behavior is radial based on width/height
 *************************************************************************** */

var Light = cc.Node.extend({
  // whether light casts shadows
  castsShadows: true,
  // how long light should live, where <= 0 is infinite
  duration: 0.0,
  // how long to fade in
  fadeInDuration: 0.0,
  // how long to fade in, as a percent of duration
  // note: default value tuned for explosions
  fadeInDurationPct: 0.35,
  // how long to fade out, when not living forever
  fadeOutDuration: 0.0,
  // how long to fade out, as a percent of duration, when not living forever
  // note: default value tuned for explosions
  fadeOutDurationPct: 1.5,
  // intensity of the light, where higher intensity lights dim lower intensity lights
  intensity: 1.0,
  // size of light
  radius: CONFIG.TILESIZE * 3.0,
  // lights should always be calculated with perspective projection
  usesPerspectiveProjection: true,

  _autoFadeEasing: cc.EaseExponentialInOut,

  ctor(options) {
    // do super ctor
    this._super();

    // apply options
    if (_.isObject(options)) {
      this.setOptions(options);
    }
  },

  _createRenderCmd() {
    if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
      return this._super();
    }
    return new Light.WebGLRenderCmd(this);
  },

  setOptions(options) {
    this._super(options);
    if (options.radius != null) this.setRadius(options.radius);
    if (options.intensity != null) this.setIntensity(options.intensity);
    if (options.duration != null) this.setDuration(options.duration);
    if (options.castsShadows != null) this.setCastsShadows(options.castsShadows);
    if (options.fadeInDuration != null) this.setFadeInDuration(options.fadeInDuration);
    if (options.fadeInDurationPct != null) this.setFadeInDurationPct(options.fadeInDurationPct);
    if (options.fadeOutDuration != null) this.setFadeOutDuration(options.fadeOutDuration);
    if (options.fadeOutDurationPct != null) this.setFadeOutDurationPct(options.fadeOutDurationPct);
  },

  onEnter() {
    cc.Node.prototype.onEnter.call(this);
    this.getFX().addLight(this);
    this.startAutoFade();
  },
  onExit() {
    this.getFX().removeLight(this);
    cc.Node.prototype.onExit.call(this);
  },

  setRadius(radius) {
    radius || (radius = 0.0);
    if (this.radius !== radius) {
      this.radius = radius;
      this.setContentSize(cc.size(this.radius, this.radius));
      this._renderCmd.setBoundsDirty();
    }
  },
  getRadius() {
    return this.radius;
  },
  setDuration(duration) {
    this.duration = duration || 0.0;
  },
  getDuration() {
    return this.duration;
  },
  setIntensity(intensity) {
    intensity || (intensity = 0.0);
    if (this.intensity !== intensity) {
      this.intensity = intensity;
      this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.colorDirty);
    }
  },
  getIntensity() {
    return this.intensity;
  },
  getEffectiveIntensity() {
    return this.intensity * this.getEffectiveAlpha();
  },
  getEffectiveAlpha() {
    return (this._realColor.a / 255) * (this.getDisplayedOpacity() / 255.0);
  },
  setFadeInDuration(fadeInDuration) {
    this.fadeInDuration = fadeInDuration;
  },
  setFadeInDurationPct(fadeInDurationPct) {
    this.fadeInDurationPct = fadeInDurationPct;
  },
  setFadeOutDuration(fadeOutDuration) {
    this.fadeOutDuration = fadeOutDuration;
  },
  setFadeOutDurationPct(fadeOutDurationPct) {
    this.fadeOutDurationPct = fadeOutDurationPct;
  },

  setCastsShadows(castsShadows) {
    castsShadows || (castsShadows = false);
    if (this.castsShadows !== castsShadows) {
      this.castsShadows = castsShadows;
      this._renderCmd.setPropertiesDirty();
    }
  },
  getCastsShadows() {
    return this.castsShadows;
  },

  getLifeDuration() {
    // life duration is complete fade cycle
    const { duration } = this;
    const fadeDelay = Math.max(0.0, duration - duration * (this.fadeInDurationPct + this.fadeOutDurationPct));
    const fadeInDuration = this.fadeInDuration + duration * this.fadeInDurationPct;
    const fadeOutDuration = this.fadeOutDuration + duration * this.fadeOutDurationPct;

    return fadeInDuration + fadeOutDuration + fadeDelay;
  },
  getShowDelay() {
    // show only needs to be as long as fade in
    return this.fadeInDuration + this.duration * this.fadeInDurationPct;
  },
  getImpactDelay() {
    return 0.0;
  },

  startAutoFade() {
    const sequenceSteps = [];
    const { duration } = this;
    const fadeDelay = Math.max(0.0, duration - duration * (this.fadeInDurationPct + this.fadeOutDurationPct));
    const fadeInDuration = this.fadeInDuration + duration * this.fadeInDurationPct;
    const fadeOutDuration = this.fadeOutDuration + duration * this.fadeOutDurationPct;

    if (fadeInDuration > 0.0) {
      this.setOpacity(0.0);
      sequenceSteps.push(cc.EaseExponentialOut.create(cc.fadeIn(fadeInDuration)));
    }

    if (duration > 0.0 || fadeOutDuration > 0.0) {
      if (fadeDelay > 0.0) {
        sequenceSteps.push(cc.delayTime(fadeDelay));
      }
      sequenceSteps.push(cc.callFunc(function () { this.destroy(fadeOutDuration); }, this));
    }

    if (sequenceSteps.length > 0) {
      this.runAction(cc.sequence(sequenceSteps));
    }
  },

  getMVQuad() {
    return this._renderCmd.getMVQuad();
  },
  getMVVertices() {
    return this._renderCmd.getMVVertices();
  },
  getMVTexCoords() {
    return this._renderCmd.getMVTexCoords();
  },
  getMVPosition2D() {
    return this._renderCmd.getMVPosition2D();
  },
  getMVPosition3D() {
    return this._renderCmd.getMVPosition3D();
  },
});

Light.WebGLRenderCmd = function (renderable) {
  cc.Node.WebGLRenderCmd.call(this, renderable);

  // lights do not need to be drawn on their own
  this._needDraw = false;

  // position in 2d
  this.mvPosition2D = new cc.kmVec4(0.0, 0.0, 0.0, 1.0);

  // position in 3d (fake)
  this.mvPosition3D = new cc.kmVec4(0.0, 0.0, 0.0, 1.0);
  this.mvQuad = {
    vertices: {
      tl: new cc.kmVec4(0.0, 0.0, this._vertexZ, 1.0),
      bl: new cc.kmVec4(0.0, 0.0, this._vertexZ, 1.0),
      tr: new cc.kmVec4(0.0, 0.0, this._vertexZ, 1.0),
      br: new cc.kmVec4(0.0, 0.0, this._vertexZ, 1.0),
    },
    texCoords: {
      tl: { u: 0.0, v: 0.0 },
      bl: { u: 0.0, v: 0.0 },
      tr: { u: 0.0, v: 0.0 },
      br: { u: 0.0, v: 0.0 },
    },
  };

  this._origin2D = new cc.kmVec4(0.0, 0.0, 0.0, 1.0);
  this._origin3D = new cc.kmVec4(0.0, 0.0, 0.0, 1.0);
  this._dirtyBounds = true;
  this._dirtyProperties = false;
};
const proto = Light.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
proto.constructor = Light.WebGLRenderCmd;

proto.getMVQuad = function () {
  return this.mvQuad;
};
proto.getMVVertices = function () {
  return this.mvQuad.vertices;
};
proto.getMVTexCoords = function () {
  return this.mvQuad.texCoords;
};
proto.getMVPosition2D = function () {
  return this.mvPosition2D;
};
proto.getMVPosition3D = function () {
  return this.mvPosition3D;
};

proto.setPropertiesDirty = function () {
  this._dirtyProperties = true;
};
proto.setBoundsDirty = function () {
  this._dirtyBounds = true;
};

proto._syncStatus = function (parentCmd) {
  const flags = cc.Node._dirtyFlags; let
    locFlag = this._dirtyFlag;
  if (parentCmd && (parentCmd._dirtyFlag & flags.transformDirty)) {
    locFlag |= flags.transformDirty;
  }
  const transformDirty = locFlag & flags.transformDirty;

  cc.Node.WebGLRenderCmd.prototype._syncStatus.call(this, parentCmd);

  if (this._dirtyProperties) {
    this._updateProperties();
  }

  if (this._dirtyBounds || transformDirty) {
    this._updateBounds();
  }
};
proto.updateStatus = function () {
  const flags = cc.Node._dirtyFlags; const
    locFlag = this._dirtyFlag;
  const transformDirty = locFlag & flags.transformDirty;

  cc.Node.WebGLRenderCmd.prototype.updateStatus.call(this);

  if (this._dirtyProperties) {
    this._updateProperties();
  }

  if (this._dirtyBounds || transformDirty) {
    this._updateBounds();
  }
};

proto._updateColor = function () {
  const node = this._node;
  cc.Node.WebGLRenderCmd.prototype._updateColor.apply(this, arguments);
  node.getFX().setLightDirty(node);
};
proto._updateColor = function () {
  const node = this._node;
  cc.Node.WebGLRenderCmd.prototype._updateColor.apply(this, arguments);
  node.getFX().setLightDirty(node);
};
proto._syncDisplayColor = function () {
  const node = this._node;
  cc.Node.WebGLRenderCmd.prototype._syncDisplayColor.apply(this, arguments);
  node.getFX().setLightDirty(node);
};
proto._syncDisplayOpacity = function () {
  const node = this._node;
  cc.Node.WebGLRenderCmd.prototype._syncDisplayOpacity.apply(this, arguments);
  node.getFX().setLightDirty(node);
};
proto._updateProperties = function () {
  const node = this._node;
  this._dirtyProperties = false;
  node.getFX().reinsertLight(node);
};
proto._updateBounds = function () {
  const node = this._node;
  const stackMatrix = this._stackMatrix;
  const scale = CONFIG.globalScale;
  const radius = node.radius * scale;

  this._dirtyBounds = false;

  // transform local positions to model-view
  cc.kmVec4Transform(this.mvPosition2D, this._origin2D, stackMatrix);
  cc.kmVec4Transform(this.mvPosition3D, this._origin3D, stackMatrix);

  // swap y to depth and z to height for 3D position
  const altitude = Math.sqrt(node.radius) * 6 * scale;
  const { y } = this.mvPosition3D;
  this.mvPosition3D.y = this.mvPosition3D.z + altitude;
  this.mvPosition3D.z = y;

  // set quad vertices
  const vertices = this.getMVVertices();
  const { tl } = vertices;
  const { bl } = vertices;
  const { tr } = vertices;
  const { br } = vertices;
  const { mvPosition2D } = this;
  const mv2DX = mvPosition2D.x;
  const mv2DY = mvPosition2D.y;
  const mv2DZ = mvPosition2D.z;

  tl.x = mv2DX - radius;
  tl.y = mv2DY + radius;
  tl.z = mv2DZ;
  bl.x = mv2DX - radius;
  bl.y = mv2DY - radius;
  bl.z = mv2DZ;
  tr.x = mv2DX + radius;
  tr.y = mv2DY + radius;
  tr.z = mv2DZ;
  br.x = mv2DX + radius;
  br.y = mv2DY - radius;
  br.z = mv2DZ;

  // perspective uv
  const texCoords = this.getMVTexCoords();
  const winWidth = UtilsEngine.getGSIWinWidth();
  const winWidthHalf = winWidth * 0.5;
  const winHeight = UtilsEngine.getGSIWinHeight();
  const winHeightHalf = winHeight * 0.5;
  texCoords.tl.u = (mv2DX - radius + winWidthHalf) / winWidth;
  texCoords.tl.v = (mv2DY + radius + winHeightHalf) / winHeight;
  texCoords.bl.u = (mv2DX - radius + winWidthHalf) / winWidth;
  texCoords.bl.v = (mv2DY - radius + winHeightHalf) / winHeight;
  texCoords.tr.u = (mv2DX + radius + winWidthHalf) / winWidth;
  texCoords.tr.v = (mv2DY + radius + winHeightHalf) / winHeight;
  texCoords.br.u = (mv2DX + radius + winWidthHalf) / winWidth;
  texCoords.br.v = (mv2DY - radius + winHeightHalf) / winHeight;

  node.getFX().setLightDirty(node);
};

Light.create = function (options, node) {
  return node || new Light(options);
};

module.exports = Light;
