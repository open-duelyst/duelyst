const CONFIG = require('app/common/config');
const UtilsEngine = require('app/common/utils/utils_engine');
const RenderPass = require('app/view/fx/RenderPass');
const SDK = require('app/sdk');
const _ = require('underscore');

/** **************************************************************************
 Node injections.
 *************************************************************************** */

const NodeInjections = {};

// easing function to use when automatically fading node
// ex: cc.EaseExponentialInOut
cc.Node.prototype._autoFadeEasing = null;

cc.Node.prototype.fadeTo = function (duration, opacity, callback) {
  if (opacity == null) { opacity = 255.0; }
  this.stopFadeTo();
  this.setVisible(true);
  if (typeof duration === 'number' && duration > 0.0) {
    let fadeAction = cc.fadeTo(duration, opacity);
    if (this._autoFadeEasing != null) {
      fadeAction = this._autoFadeEasing.create(fadeAction);
    }
    if (_.isFunction(callback)) {
      fadeAction = cc.sequence(
        fadeAction,
        cc.callFunc(callback),
      );
    }
    fadeAction.setTag(CONFIG.FADE_TAG);
    this.runAction(fadeAction);
  } else {
    this.setOpacity(opacity);
    if (_.isFunction(callback)) {
      callback();
    }
  }
};
cc.Node.prototype.stopFadeTo = function () {
  this.stopActionByTag(CONFIG.FADE_TAG);
};
cc.Node.prototype.fadeToInvisible = function (duration, callback) {
  if (this.isVisible()) {
    this.stopFadeTo();
    if (typeof duration === 'number' && duration > 0.0) {
      let fadeAction = cc.fadeTo(duration, 0);
      if (this._autoFadeEasing != null) {
        fadeAction = this._autoFadeEasing.create(fadeAction);
      }
      const sequenceActions = [
        fadeAction,
        cc.hide(),
      ];
      if (_.isFunction(callback)) {
        sequenceActions.push(cc.callFunc(callback));
      }
      const makeInvisibleAction = cc.sequence(sequenceActions);
      makeInvisibleAction.setTag(CONFIG.FADE_TAG);
      this.runAction(makeInvisibleAction);
    } else {
      this.setOpacity(0);
      this.setVisible(false);
      if (_.isFunction(callback)) {
        callback();
      }
    }
  } else if (_.isFunction(callback)) {
    callback();
  }
};

cc.Node.prototype._runAction = cc.Node.prototype.runAction;
cc.Node.prototype.runAction = function (action) {
  if (CONFIG.replayActionSpeedModifier !== 1.0 && SDK.GameSession.getInstance().getIsSpectateMode()) {
    action.setSpeedModifier(CONFIG.replayActionSpeedModifier);
  }
  return cc.Node.prototype._runAction.call(this, action);
};

cc.Node.prototype.startPulsingOpacity = function (duration, opacityMin, opacityMax) {
  this.stopPulsingOpacity();

  if (duration == null) { duration = CONFIG.PULSE_MEDIUM_DURATION; }

  this.setVisible(true);

  let actionA = cc.fadeTo(duration, opacityMin).easing(cc.easeSineInOut());
  let actionB = cc.fadeTo(duration, opacityMax).easing(cc.easeSineInOut());
  if (this.getOpacity() != opacityMax) {
    const temp = actionA;
    actionA = actionB;
    actionB = temp;
  }
  const pulseAction = cc.sequence(actionA, actionB).repeatForever();
  pulseAction.setTag(CONFIG.PULSE_TAG);
  this.runAction(pulseAction);
};
cc.Node.prototype.stopPulsingOpacity = function () {
  this.stopActionByTag(CONFIG.PULSE_TAG);
};

cc.Node.prototype.startPulsingScale = function (duration, scale) {
  this.stopPulsingScale();

  if (duration == null) { duration = CONFIG.PULSE_MEDIUM_DURATION; }
  if (scale == null) { scale = 0.85; }

  let scaleActionA = cc.EaseSineIn.create(cc.scaleBy(duration, scale));
  let scaleActionB = cc.EaseSineOut.create(cc.scaleTo(duration, 1.0));
  if (this.getScale() != 1.0) {
    const temp = scaleActionA;
    scaleActionA = scaleActionB;
    scaleActionB = temp;
  }
  const pulseAction = cc.sequence(scaleActionA, scaleActionB).repeatForever();
  pulseAction.setTag(CONFIG.PULSE_TAG);
  this.runAction(pulseAction);
};
cc.Node.prototype.stopPulsingScale = function () {
  this.stopActionByTag(CONFIG.PULSE_TAG);
};

cc.Node.prototype.startRotating = function (duration, rotation, easing) {
  this.stopRotating();

  if (duration == null) { duration = CONFIG.PULSE_SLOW_DURATION; }
  if (rotation == null) { rotation = 360.0; }

  let rotateAction = cc.rotateBy(duration, rotation);
  if (easing != null) {
    rotateAction = rotateAction.easing(easing);
  }
  rotateAction = rotateAction.repeatForever();
  rotateAction.setTag(CONFIG.ROTATE_TAG);
  this.runAction(rotateAction);
};
cc.Node.prototype.stopRotating = function () {
  this.stopActionByTag(CONFIG.ROTATE_TAG);
};
cc.Node.prototype.destroy = function (duration) {
  if (this.isRunning()) {
    if (typeof duration === 'number') {
      this.stopActionByTag(CONFIG.FADE_TAG);
      let fadeAction = cc.fadeTo(duration, 0.0);
      if (this._autoFadeEasing != null) {
        fadeAction = this._autoFadeEasing.create(fadeAction);
      }
      const destroyAction = cc.sequence(
        fadeAction,
        cc.callFunc(function () {
          this.removeFromParent(true);
        }, this),
      );
      destroyAction.setTag(CONFIG.DESTROY_TAG);
      this.runAction(destroyAction);
    } else {
      this.removeFromParent(true);
    }
  }
};

// whether node has moved (in global or local space) since the last frame
// this is useful because cocos often sets transform dirty when the node has not moved
cc.Node.prototype._positionChanged = false;

cc.Node.prototype.centerOffset = cc.p();
cc.Node.prototype.getCenterPosition = function () {
  return cc.p(this._contentSize.width * 0.5 + this.centerOffset.x, this._contentSize.height * 0.5 + this.centerOffset.y);
};
cc.Node.prototype.getCenterPositionForExternal = function () {
  return cc.p(this._position.x + this.centerOffset.x, this._position.y + this.centerOffset.y);
};

// name of layer in battle layer to add sprite to
// note: this only affects sprites that are actually added to the battle layer!
// note: this only works if set BEFORE adding to the battle layer!
cc.Node.prototype.layerName = '';
// whether sprite should auto z order itself based on its current board position
// note: z order is based on position y converted to board units, where board center is 0, board top is < 0, and board bottom is > 0
cc.Node.prototype.autoZOrder = false;
// position for automatic z ordering
cc.Node.prototype.autoZOrderPosition = null;
// offset on automatic z ordering
cc.Node.prototype.autoZOrderOffset = 0.0;

cc.Node.prototype.setLayerName = function (layerName) {
  this.layerName = layerName;
};
cc.Node.prototype.getLayerName = function () {
  return this.layerName;
};
cc.Node.prototype.setAutoZOrder = function (autoZOrder) {
  this.autoZOrder = autoZOrder;
  if (this._running && this.autoZOrder) {
    this.updateAutoZOrder();
  }
};
cc.Node.prototype.getAutoZOrder = function () {
  return this.autoZOrder;
};
cc.Node.prototype.getAutoZOrderIndex = function () {
  return Math.floor((this._position.y - UtilsEngine._boardCenterY + CONFIG.TILESIZE * 0.5) / CONFIG.TILESIZE);
};
cc.Node.prototype.setAutoZOrderOffset = function (autoZOrderOffset) {
  this.autoZOrderOffset = autoZOrderOffset;
  if (this._running && this.autoZOrder) {
    this.updateAutoZOrder();
  }
};
cc.Node.prototype.getAutoZOrderOffset = function () {
  return this.autoZOrderOffset;
};

cc.Node.prototype.getAutoZOrderValue = function () {
  return 100.0 - this.getAutoZOrderIndex() + this.autoZOrderOffset;
};

cc.Node.prototype.updateAutoZOrder = function () {
  // no need to set z order when it is the same
  // cocos does some processing when we set it that would be unnecessary
  const zOrder = this.getAutoZOrderValue();
  if (this.getLocalZOrder() !== zOrder) {
    this.setLocalZOrder(zOrder);
  }
};

cc.Node.prototype.setOptions = function (options) {
  // TODO: use underscore extend and only set options that need special handling
  if (_.isObject(options)) {
    if (options.size != null) { this.setTextureRect(cc.rect(0, 0, options.size, options.size)); }
    if (options.layerName != null) { this.setLayerName(options.layerName); }
    if (options.autoZOrder != null) { this.setAutoZOrder(options.autoZOrder); }
    if (options.autoZOrderOffset != null) { this.setAutoZOrderOffset(options.autoZOrderOffset); }
    if (options.zOrder != null) { this.setLocalZOrder(options.zOrder); }
    if (options.opacity != null) { this.setOpacity(options.opacity); }
    if (options.color != null) { this.setColor(options.color); }
    if (options.scale != null) { this.setScale(options.scale); }
    if (options.rotation != null) { this.setRotation(options.rotation); }
    if (options._xyzRotation != null) { this.setXYZRotation(options._xyzRotation); }
    if (options.flippedX != null) { this.setFlippedX(options.flippedX); }
    if (options.flippedY != null) { this.setFlippedY(options.flippedY); }
    if (options.blendSrc && options.blendDst) {
      this.setBlendFunc(options.blendSrc, options.blendDst);
    } else if (options.blendSrc) {
      this.setBlendFunc(options.blendSrc, this._blendFunc.dst);
    } else if (options.blendDst) {
      this.setBlendFunc(this._blendFunc.src, options.blendDst);
    }
  }
};

cc.Node.prototype._cascadeColorEnabled = false;
cc.Node.prototype._cascadeOpacityEnabled = true;
cc.Node.prototype._superCtor = cc.Node.prototype.ctor;
cc.Node.prototype.ctor = function () {
  // initialization for tags
  this._generatedVisualStateTags = []; // List of visual state tags generated in Node.update, these may be wiped each update
  this.injectedVisualStateTags = []; // List of visual state tags created and maintained externally // TODO: make private
  this._visualStateNeedsUpdate = false; // Tracks whether or not the visual state needs to update to reflect current tags
  this._visualStateTagsToBeDeactivated = []; // List of tags that were removed or deactivated but haven't been processed
  this._visualStateTagsToBeActivated = []; // List of tags that were activated but haven't been processed

  // cocos forces these to false and ignores prototype
  const cascadeOpacityEnabled = cc.Node.prototype._cascadeOpacityEnabled;
  const cascadeColorEnabled = cc.Node.prototype._cascadeColorEnabled;

  cc.Node.prototype._superCtor.call(this);

  this.setCascadeColorEnabled(cascadeColorEnabled);
  this.setCascadeOpacityEnabled(cascadeOpacityEnabled);

  // store prototype rotation and set as starting rotation
  if (this._xyzRotation) { this.setXYZRotation(this._xyzRotation); }
};

/* region Node Visual State tagging */

cc.Node.prototype._generatedVisualStateTags = []; // List of visual state tags generated in Node.update, these may be wiped each update
cc.Node.prototype.injectedVisualStateTags = []; // List of visual state tags created and maintained externally // TODO: make private
cc.Node.prototype._visualStateNeedsUpdate = false; // Tracks whether or not the visual state needs to update to reflect current tags
cc.Node.prototype._visualStateTagsToBeDeactivated = []; // List of tags that were removed or deactivated but haven't been processed
cc.Node.prototype._visualStateTagsToBeActivated = []; // List of tags that were activated but haven't been processed

// Adds a tag to the entity node if it doesn't already exist, update it to higher of priorities if it does
cc.Node.prototype.addGeneratedVisualStateTag = function (newVisualStateTag) {
  let i;
  for (i = 0; i < this._generatedVisualStateTags.length; i++) {
    const currentTag = this._generatedVisualStateTags[i];
    if (currentTag.tagType == newVisualStateTag.tagType) {
      // If a tag already exists of the same type, update it to whichever has higher priority or was added last
      if (newVisualStateTag.priority >= currentTag.priority) {
        this._generateVisualStateTags[i] = newVisualStateTag;
        this._updateVisualStateTags();
        return;
      }
      return;
    }
  }

  // No preexisting tag matches, append it
  this._generatedVisualStateTags.push(newVisualStateTag);
  this._updateVisualStateTags();
};

// Adds an injected visual tag with an id (expected string) to remove it with
cc.Node.prototype.addInjectedVisualStateTagWithId = function (newVisualStateTag, id) {
  // Throw an error if id isn't passed because without an id an injected state tag can't be removed causing
  if (typeof id !== 'string') {
    throw 'Error: EntityNode.addInjectedVisualStateTagWithId id parameter must be a non-null string';
  }

  newVisualStateTag.injectedId = id;

  for (let i = 0, il = this.injectedVisualStateTags.length; i < il; i++) {
    const currentTag = this.injectedVisualStateTags[i];
    if (currentTag.tagType == newVisualStateTag.tagType && currentTag.injectedId == newVisualStateTag.injectedId) {
      // if a tag already exists of the same type, replace only if new tag has higher priority
      if (newVisualStateTag.priority < currentTag.priority) {
        // activate new tag if the one being updated was active
        if (currentTag.active) {
          // deactivate the overwritten tag
          this._visualStateTagsToBeDeactivated.push(currentTag);
        }

        this.injectedVisualStateTags[i] = newVisualStateTag;
        this._updateVisualStateTags();
      }

      // early return as nothing else is needed
      return;
    }
  }

  this.injectedVisualStateTags.push(newVisualStateTag);
  this._updateVisualStateTags();
};

// Removes all injected visual state tags with the given id
cc.Node.prototype.removeInjectedVisualStateTagById = function (id) {
  let i;
  // Reverse iteration
  for (i = this.injectedVisualStateTags.length - 1; i >= 0; i--) {
    const currentTag = this.injectedVisualStateTags[i];
    if (currentTag.injectedId == id) {
      if (currentTag.active) {
        this._visualStateTagsToBeDeactivated.push(currentTag);
      }
      // this._visualStateTagsToBeDeactivated.push(currentTag);
      this.injectedVisualStateTags.splice(i, 1);
      this._updateVisualStateTags();
    }
  }
};

// Removes all injected visual state tags
cc.Node.prototype.removeInjectedVisualStateTags = function () {
  this._visualStateTagsToBeDeactivated = this._visualStateTagsToBeDeactivated.concat(this.injectedVisualStateTags);
  this._updateVisualStateTags();
  this.injectedVisualStateTags = [];
};

// Gets all injected visual state tags with the given id
cc.Node.prototype.getInjectedVisualStateTagsById = function (id) {
  const tags = [];
  for (let i = 0, il = this.injectedVisualStateTags.length; i < il; i++) {
    const currentTag = this.injectedVisualStateTags[i];
    if (currentTag.injectedId === id) {
      tags.push(currentTag);
    }
  }
  return tags;
};

// Uses the resourcesNeeded property to activate as many visual states that don't conflict
cc.Node.prototype._determineActiveTagsByResourcesNeeded = function () {
  let usedResources = [];

  // sort injectedVisualStateTags
  this.injectedVisualStateTags = _.sortBy(this.injectedVisualStateTags, 'priority');

  for (let i = this.injectedVisualStateTags.length - 1; i >= 0; i--) {
    const currentTag = this.injectedVisualStateTags[i];
    // A tag is active if all resources it needs are available
    const shouldBeActive = _.intersection(currentTag.neededResources, usedResources).length == 0;
    // Deactivate tags that shouldn't be that are
    if (currentTag.active && !shouldBeActive) {
      this._visualStateTagsToBeDeactivated.push(currentTag);
    }

    // Activate tags that should be that arent
    if (!currentTag.active && shouldBeActive) {
      this._visualStateTagsToBeActivated.push(currentTag);
    }

    // Update resources used if needed
    if (shouldBeActive) {
      usedResources = _.union(usedResources, currentTag.neededResources);
    }
  }
};

// Determine which tags should be activated by only activating the most recent tag injected
cc.Node.prototype._determineActiveTagsByMostRecent = function () {
  let i;
  // Iterate over all tags besides last one to ensure they are deactivated
  for (i = 0; i < this.injectedVisualStateTags.length; i++) {
    const currentTag = this.injectedVisualStateTags[i];
    // Deactive any currently active tag that isn't last tag
    if (currentTag.active && i != this.injectedVisualStateTags.length - 1) {
      this._visualStateTagsToBeDeactivated.push(currentTag);
    }
    // Activate last tag if not already active
    if (!currentTag.active && i == this.injectedVisualStateTags.length - 1) {
      this._visualStateTagsToBeActivated.push(currentTag);
    }
  }
};

// Overwrite to perform state cleanup for deactivated tags
// Or can be ignored and more advanced handling can be done in update
cc.Node.prototype._handleDeactivatedVisualStateTags = function (deactivatedVisualStateTags) {
  // Needs to be overwritten for functionality
};

// Overwrite to perform visual activation for activated tags
// Or can be ignored and more advanced handling can be done in update
cc.Node.prototype._handleActivatedVisualStateTags = function (activatedVisualStateTags) {
  // Needs to be overwritten for functionality
};

cc.Node.prototype._updateVisualStateTags = function () {
  // Check which tags should be activated
  this._determineActiveTagsByResourcesNeeded();

  // deactivate tags as needed
  if (this._visualStateTagsToBeDeactivated.length > 0) {
    this._handleDeactivatedVisualStateTags(this._visualStateTagsToBeDeactivated);
    for (var i = 0; i < this._visualStateTagsToBeDeactivated.length; i++) {
      this._visualStateTagsToBeDeactivated[i].active = false;
    }
    this._visualStateTagsToBeDeactivated = [];
  }

  // activate tags as needed
  if (this._visualStateTagsToBeActivated.length > 0) {
    this._handleActivatedVisualStateTags(this._visualStateTagsToBeActivated);
    for (var i = 0; i < this._visualStateTagsToBeActivated.length; i++) {
      this._visualStateTagsToBeActivated[i].active = true;
    }
    this._visualStateTagsToBeActivated = [];
  }
};

/* endregion Node Visual State tagging */

// 3D rotation of node, as a vec3 of degrees
cc.Node.prototype._xyzRotation = null;
/**
 * Sets xyz rotation in degrees of node for rendering.
 * @param {Vec3} rotation
 */
cc.Node.prototype.setXYZRotation = function (rotation) {
  if (!this.hasOwnProperty('_xyzRotation')) {
    this._xyzRotation = new cc.kmVec3();
  }
  const rotX = (rotation.x || 0.0) % 360.0;
  const rotY = (rotation.y || 0.0) % 360.0;
  const rotZ = (rotation.z || 0.0) % 360.0;
  if (this._xyzRotation.x !== rotX || this._xyzRotation.y !== rotY || this._xyzRotation.z !== rotZ) {
    this._xyzRotation.x = rotX;
    this._xyzRotation.y = rotY;
    this._xyzRotation.z = rotZ;
    this.setXYZRotationDirty();
  }
};
cc.Node.prototype.getXYZRotation = function () {
  return new cc.kmVec3(this.getXYZRotationX(), this.getXYZRotationY(), this.getXYZRotationZ());
};
cc.Node.prototype.getXYZRotationX = function () {
  return this._xyzRotation != null ? this._xyzRotation.x : 0.0;
};
cc.Node.prototype.getXYZRotationY = function () {
  return this._xyzRotation != null ? this._xyzRotation.y : 0.0;
};
cc.Node.prototype.getXYZRotationZ = function () {
  return this._xyzRotation != null ? this._xyzRotation.z : 0.0;
};

cc.Node.prototype._secondaryXYZRotation = null;
/**
 * Sets the node's angular XYZ rotation.
 * NOTE: this is applied in addition to the node's XYZ rotation, and is intended to be non-conflicting.
 * @param {Vec3} rotation
 */
cc.Node.prototype.setSecondaryXYZRotation = function (rotation) {
  if (!this.hasOwnProperty('_secondaryXYZRotation')) {
    this._secondaryXYZRotation = new cc.kmVec3();
  }
  const rotX = (rotation.x || 0.0) % 360.0;
  const rotY = (rotation.y || 0.0) % 360.0;
  const rotZ = (rotation.z || 0.0) % 360.0;
  if (this._secondaryXYZRotation.x !== rotX || this._secondaryXYZRotation.y !== rotY || this._secondaryXYZRotation.z !== rotZ) {
    this._secondaryXYZRotation.x = rotX;
    this._secondaryXYZRotation.y = rotY;
    this._secondaryXYZRotation.z = rotZ;
    this.setXYZRotationDirty();
  }
};

cc.Node.prototype.getSecondaryXYZRotation = function () {
  return new cc.kmVec3(this.getSecondaryXYZRotationX(), this.getSecondaryXYZRotationY(), this.getSecondaryXYZRotationZ());
};
cc.Node.prototype.getSecondaryXYZRotationX = function () {
  return this._secondaryXYZRotation != null ? this._secondaryXYZRotation.x : 0.0;
};
cc.Node.prototype.getSecondaryXYZRotationY = function () {
  return this._secondaryXYZRotation != null ? this._secondaryXYZRotation.y : 0.0;
};
cc.Node.prototype.getSecondaryXYZRotationZ = function () {
  return this._secondaryXYZRotation != null ? this._secondaryXYZRotation.z : 0.0;
};

cc.Node.prototype.setXYZRotationDirty = function () {
  this._renderCmd._xyzRotationDirty = true;
  this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty);
};

cc.Node.prototype.getCompositeXYZRotation = function () {
  return new cc.kmVec3(this.getCompositeXYZRotationX(), this.getCompositeXYZRotationY(), this.getCompositeXYZRotationZ());
};
cc.Node.prototype.getCompositeXYZRotationX = function () {
  return this.getXYZRotationX() + this.getSecondaryXYZRotationX();
};
cc.Node.prototype.getCompositeXYZRotationY = function () {
  return this.getXYZRotationY() + this.getSecondaryXYZRotationY();
};
cc.Node.prototype.getCompositeXYZRotationZ = function () {
  return this.getXYZRotationZ() + this.getSecondaryXYZRotationZ();
};

/**
 * Returns whether node is showing back side based on local 3D rotation.
 */
cc.Node.prototype.getIsShowingBackside = function () {
  return this._renderCmd.getIsShowingBackside();
};
cc.Node.WebGLRenderCmd.prototype.getIsShowingBackside = function () {
  const xyzRotation = this._node.getCompositeXYZRotation();
  if (xyzRotation.x !== 0.0 || xyzRotation.y !== 0.0 || xyzRotation.z !== 0.0) {
    let xyzRotationMatrix = this._xyzRotationMatrix;
    if (xyzRotationMatrix == null || this._xyzRotationDirty) {
      xyzRotationMatrix = this._rebuildXYZRotationMatrix();
    }
    return xyzRotationMatrix && xyzRotationMatrix.mat[10] < 0.0;
  }
  return false;
};

/**
 * Returns whether node is showing back side based on world 3D rotation.
 * NOTE: return value is based on the node's current world transformation matrix.
 */
cc.Node.prototype.getIsWorldShowingBackside = function () {
  return this._renderCmd.getIsWorldShowingBackside();
};
cc.Node.WebGLRenderCmd.prototype.getIsWorldShowingBackside = function () {
  // 4x4 matrix index 10 is the un-normalized forward z vector
  return this._stackMatrix.mat[10] < 0.0;
};

// whether xyz rotation has changed
cc.Node.WebGLRenderCmd.prototype._xyzRotationDirty = false;
cc.Node.WebGLRenderCmd.prototype._rebuildXYZRotationMatrix = function () {
  this._xyzRotationDirty = false;
  const node = this._node;
  const xyzRotation = node.getCompositeXYZRotation();
  const rotX = xyzRotation.x;
  const rotY = xyzRotation.y;
  const rotZ = xyzRotation.z;
  if (rotX !== 0.0 || rotY !== 0.0 || rotZ !== 0.0) {
    this._xyzRotationMatrix = cc.kmMat4RotationPitchYawRoll(
      new cc.kmMat4(),
      cc.degreesToRadians(rotX),
      cc.degreesToRadians(rotY),
      cc.degreesToRadians(rotZ),
    );
  } else {
    this._xyzRotationMatrix = null;
  }
};

// 3D rotation matrix
cc.Node.WebGLRenderCmd.prototype._xyzRotationMatrix = null;

cc.Node.WebGLRenderCmd.prototype.getNeedsXYZRotation = function () {
  return this._xyzRotationMatrix != null;
};

cc.Node.WebGLRenderCmd.prototype.getNodeToParentXYZTransform = function (t4x4) {
  cc.kmMat4Multiply(t4x4, t4x4, this._xyzRotationMatrix);
};

// full override of node to parent transform
// we're now caching the camera and 3d rotations in the transform4x4 matrix
// this should make it much less expensive to 3d rotate a sprite
cc.Node.WebGLRenderCmd.prototype.getNodeToParentTransform = function () {
  const node = this._node;
  const camera = node._camera;
  const cameraDirty = camera && camera._dirty;
  const transformDirty = (this._dirtyFlag & cc.Node._dirtyFlags.transformDirty) || cameraDirty;
  const t4x4 = this._transform4x4;
  const t4x4Mat = t4x4.mat;

  if (node._usingNormalizedPosition && node._parent) { // TODO need refactor
    const conSize = node._parent._contentSize;
    node._position.x = node._normalizedPosition.x * conSize.width;
    node._position.y = node._normalizedPosition.y * conSize.height;
    node._normalizedPositionDirty = false;
  }
  if (transformDirty) {
    // Translate values
    let { x } = node._position;
    let { y } = node._position;
    const apx = this._anchorPointInPoints.x; const
      napx = -apx;
    const apy = this._anchorPointInPoints.y; const
      napy = -apy;
    const scx = node._scaleX; const
      scy = node._scaleY;
    const rotationRadiansX = node._rotationX * 0.017453292519943295; // 0.017453292519943295 = (Math.PI / 180);   for performance
    const rotationRadiansY = node._rotationY * 0.017453292519943295;

    if (node._ignoreAnchorPointForPosition) {
      x += apx;
      y += apy;
    }

    // Rotation values
    // Change rotation code to handle X and Y
    // If we skew with the exact same value for both x and y then we're simply just rotating
    let cx = 1; let sx = 0; let cy = 1; let
      sy = 0;
    if (node._rotationX !== 0 || node._rotationY !== 0) {
      cx = Math.cos(-rotationRadiansX);
      sx = Math.sin(-rotationRadiansX);
      cy = Math.cos(-rotationRadiansY);
      sy = Math.sin(-rotationRadiansY);
    }
    const needsSkewMatrix = (node._skewX || node._skewY);

    // optimization:
    // inline anchor point calculation if skew is not needed
    // Adjusted transform calculation for rotational skew
    if (!needsSkewMatrix && (apx !== 0 || apy !== 0)) {
      x += cy * napx * scx + -sx * napy * scy;
      y += sy * napx * scx + cx * napy * scy;
    }

    // Build Transform Matrix
    // Adjusted transform calculation for rotational skew
    let t = this._transform;
    t.a = cy * scx;
    t.b = sy * scx;
    t.c = -sx * scy;
    t.d = cx * scy;
    t.tx = x;
    t.ty = y;

    // XXX: Try to inline skew
    // If skew is needed, apply skew and then anchor point
    if (needsSkewMatrix) {
      t = cc.affineTransformConcat({
        a: 1.0,
        b: Math.tan(cc.degreesToRadians(node._skewY)),
        c: Math.tan(cc.degreesToRadians(node._skewX)),
        d: 1.0,
        tx: 0.0,
        ty: 0.0,
      }, t);

      // adjust anchor point
      if (apx !== 0 || apy !== 0) t = cc.affineTransformTranslate(t, napx, napy);
    }

    if (node._additionalTransformDirty) {
      t = cc.affineTransformConcat(t, node._additionalTransform);
      node._additionalTransformDirty = false;
    }
    this._transform = t;

    // convert 3x3 into 4x4 matrix
    cc.CGAffineToGL(this._transform, t4x4Mat);

    // update Z vertex manually
    t4x4Mat[14] = node._vertexZ;

    // recalculate xyz rotation matrix
    if (this._xyzRotationDirty) {
      this._rebuildXYZRotationMatrix();
    }

    const needsCamera = camera && !(node.grid != null && node.grid.isActive());
    const needsRotation = this.getNeedsXYZRotation();

    // correct the rotation around the anchor point
    const translate = (needsCamera || needsRotation) && (apx !== 0.0 || apy !== 0.0);
    if (translate) {
      if (this._anchorRotationMatrix == null) {
        this._anchorRotationMatrix = cc.kmMat4Identity(new cc.kmMat4());
      }
      this._anchorRotationMatrix.mat[12] = apx;
      this._anchorRotationMatrix.mat[13] = apy;
      cc.kmMat4Multiply(t4x4, t4x4, this._anchorRotationMatrix);
    }

    // 3d rotation
    if (needsRotation) {
      this.getNodeToParentXYZTransform(t4x4);
    }

    // camera
    if (needsCamera) {
      node._camera._locateForRenderer(t4x4);
    }

    // reset anchor point correction
    if (translate) {
      this._anchorRotationMatrix.mat[12] = -apx;
      this._anchorRotationMatrix.mat[13] = -apy;
      cc.kmMat4Multiply(t4x4, t4x4, this._anchorRotationMatrix);
    }
  }
  return this._transform;
};

cc.Node.prototype.terminateAllActions = function () {
  // stop node actions
  this.stopAllActions();

  // stop all children actions
  const children = this.getChildren();
  for (let i = 0, il = children.length; i < il; i++) {
    children[i].terminateAllActions();
  }
};

cc.Node.prototype.terminateAllParticles = function () {
  // stop particle emissions
  if (this instanceof cc.ParticleSystem) {
    this.stopSystem();
  }

  // stop all children particles
  const children = this.getChildren();
  for (let i = 0, il = children.length; i < il; i++) {
    children[i].terminateAllParticles();
  }
};

/**
 * Positions this sprite so that the bottom of this sprite touches the top of relative sprite
 * @public
 * @param {cc.Sprite} relativeSprite - sprite to position relative to
 * @param {cc.point} [offset] - (optional) absolute position offset to add
 * @param {cc.point} [scaledOffset] - (optional) offset by this sprites width and height scaled by scaledOffset's contents
 * TODO: Account for anchor point
 * TODO: Account for creation of object with getBoundingBox
 * TODO: Check for object parent equality
 * TODO: FlexBox (facebook)
 */
cc.Node.prototype.setPositionAboveSprite = function (relativeSprite, offset, scaledOffset) {
  const totalOffset = cc.p(0, 0);
  if (offset != null) {
    totalOffset.x += offset.x;
    totalOffset.y += offset.y;
  }

  const boundingBox = this.getBoundingBox();
  if (scaledOffset != null) {
    totalOffset.x += scaledOffset.x * boundingBox.width;
    totalOffset.y += scaledOffset.y * boundingBox.height;
  }

  this.setPosition(
    relativeSprite.getPositionX() + totalOffset.x,
    relativeSprite.getPositionY() + relativeSprite.getBoundingBox().height * 0.5 + boundingBox.height * 0.5 + totalOffset.y,
  );
};

/**
 * Positions this sprite so that the top of this sprite touches the bottom of relative sprite
 * @public
 * @param {cc.Sprite} relativeSprite - sprite to position relative to
 * @param {cc.point} [offset] - (optional) absolute position offset to add
 * @param {cc.point} [scaledOffset] - (optional) offset by this sprites width and height scaled by scaledOffset's contents
 */
cc.Node.prototype.setPositionBelowSprite = function (relativeSprite, offset, scaledOffset) {
  const totalOffset = cc.p(0, 0);
  if (offset != null) {
    totalOffset.x += offset.x;
    totalOffset.y += offset.y;
  }

  const boundingBox = this.getBoundingBox();
  if (scaledOffset != null) {
    totalOffset.x += scaledOffset.x * boundingBox.width;
    totalOffset.y += scaledOffset.y * boundingBox.height;
  }

  this.setPosition(
    relativeSprite.getPositionX() + totalOffset.x,
    relativeSprite.getPositionY() - relativeSprite.getBoundingBox().height * 0.5 - boundingBox.height * 0.5 + totalOffset.y,
  );
};

/**
 * Positions this sprite so that the right of this sprite touches the left of relative sprite
 * @public
 * @param {cc.Sprite} relativeSprite - sprite to position relative to
 * @param {cc.point} [offset] - (optional) absolute position offset to add
 * @param {cc.point} [scaledOffset] - (optional) offset by this sprites width and height scaled by scaledOffset's contents
 */
cc.Node.prototype.setPositionLeftOfSprite = function (relativeSprite, offset, scaledOffset) {
  const totalOffset = cc.p(0, 0);
  if (offset != null) {
    totalOffset.x += offset.x;
    totalOffset.y += offset.y;
  }

  const boundingBox = this.getBoundingBox();
  if (scaledOffset != null) {
    totalOffset.x += scaledOffset.x * boundingBox.width;
    totalOffset.y += scaledOffset.y * boundingBox.height;
  }

  this.setPosition(
    relativeSprite.getPositionX() - relativeSprite.getBoundingBox().width * 0.5 - boundingBox.height * 0.5 + totalOffset.x,
    relativeSprite.getPositionY() + totalOffset.y,
  );
};

/**
 * Positions this sprite so that the left of this sprite touches the right of relative sprite
 * @public
 * @param {cc.Sprite} relativeSprite - sprite to position relative to
 * @param {cc.point} [offset] - (optional) absolute position offset to add
 * @param {cc.point} [scaledOffset] - (optional) offset by this sprites width and height scaled by scaledOffset's contents
 */
cc.Node.prototype.setPositionRightOfSprite = function (relativeSprite, offset, scaledOffset) {
  const totalOffset = cc.p(0, 0);
  if (offset != null) {
    totalOffset.x += offset.x;
    totalOffset.y += offset.y;
  }

  const boundingBox = this.getBoundingBox();
  if (scaledOffset != null) {
    totalOffset.x += scaledOffset.x * boundingBox.width;
    totalOffset.y += scaledOffset.y * boundingBox.height;
  }

  this.setPosition(
    relativeSprite.getPositionX() + relativeSprite.getBoundingBox().width * 0.5 + boundingBox.height * 0.5 + totalOffset.x,
    relativeSprite.getPositionY() + totalOffset.y,
  );
};

/**
 * Positions this sprite so that it's center matches the center of the relative sprite
 * @public
 * @param {cc.Sprite} relativeSprite - sprite to position relative to
 * @param {cc.point} [offset] - (optional) absolute position offset to add
 * @param {cc.point} [scaledOffset] - (optional) offset by this sprites width and height scaled by scaledOffset's contents
 */
cc.Node.prototype.setPositionCenterOfSprite = function (relativeSprite, offset, scaledOffset) {
  const totalOffset = cc.p(0, 0);
  if (offset != null) {
    totalOffset.x += offset.x;
    totalOffset.y += offset.y;
  }

  if (scaledOffset != null) {
    const boundingBox = this.getBoundingBox();
    totalOffset.x += scaledOffset.x * boundingBox.width;
    totalOffset.y += scaledOffset.y * boundingBox.height;
  }

  this.setPosition(
    relativeSprite.getPositionX() + totalOffset.x,
    relativeSprite.getPositionY() + totalOffset.y,
  );
};

module.exports = NodeInjections;
