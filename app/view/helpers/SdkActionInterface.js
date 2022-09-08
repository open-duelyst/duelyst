/**
 * SdkActionInterface - engine interface/wrapper for SDK actions. Add all engine specific action properties to this object.
 * @param sdkAction
 * @param sdkStepInterface
 */
const SdkActionInterface = function (sdkAction, sdkStepInterface) {
  this._sdkAction = sdkAction;
  this._sdkStepInterface = sdkStepInterface;
  this.cachedResolveActivatedModifierActionInterfaces = null;
  this.cachedResolveDeactivatedModifierActionInterfaces = null;
  this.cachedResolveDepthFirstTriggerActionInterfaces = null;
  this.cachedResolveSubActions = null;
  this.cachedResolveTriggerActionInterfaces = null;
  this.cachedResolveTriggeredModifierActionInterfaces = null;
  this.cachedTriggeredModifierActionInterfacesForChanges = null;
  this.forcedSortIndex = null;
  this.isFirstSequence = false;
  this.isFirstSequenceAndSequencedAsOne = false;
  this.isFirstSequenceRoot = false;
  this.isSequenceRoot = false;
  this.isSequencedAsOne = false;
  this.isSequenceSequencedAsOne = false;
  this.rearrangingParentActionInterface = null;
  this.rearrangedActionInterfaces = null;
  this.rearranging = false;
  this.sequenceActionInterfaces = null;
  this.sequenceActionInterfacesAreOnlyForModifiers = true;
  this.sequenceRootSdkActionInterface = null;
  this.siblingActions = null;
};

SdkActionInterface.prototype = {
  constructor: SdkActionInterface,

  cachedResolveActivatedModifierActionInterfaces: null,
  cachedResolveDeactivatedModifierActionInterfaces: null,
  cachedResolveDepthFirstTriggerActionInterfaces: null,
  cachedResolveSubActions: null,
  cachedResolveTriggerActionInterfaces: null,
  cachedResolveTriggeredModifierActionInterfaces: null,
  cachedTriggeredModifierActionInterfacesForChanges: null,
  forcedSortIndex: null,
  isFirstSequence: false,
  isFirstSequenceAndSequencedAsOne: false,
  isFirstSequenceRoot: false,
  isSequenceRoot: false,
  isSequencedAsOne: false,
  isSequenceSequencedAsOne: false,
  rearrangingParentActionInterface: null,
  rearrangedActionInterfaces: null,
  rearranging: false,
  sequenceActionInterfaces: null,
  sequenceActionInterfacesAreOnlyForModifiers: true,
  sequenceRootSdkActionInterface: null,
  siblingActions: null,
  _sdkAction: null,
  _sdkStepInterface: null,

  setSdkAction(val) {
    this._sdkAction = val;
  },

  getSdkAction() {
    return this._sdkAction;
  },

  setSdkStepInterface(val) {
    this._sdkStepInterface = val;
  },

  getSdkStepInterface() {
    return this._sdkStepInterface;
  },

};

module.exports = SdkActionInterface;
