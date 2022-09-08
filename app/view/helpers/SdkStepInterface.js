/**
 * SdkStepInterface - engine interface/wrapper for SDK steps. Add all engine specific step properties to this object.
 * @param sdkStep
 */
const SdkStepInterface = function (sdkStep) {
  this._sdkStep = sdkStep;
  this.actionsEndingGame = null;
  this.actionInterfaceSequence = null;
  this.hasShownHandFullForPlayerIds = [];
  this.hasShownOutOfCardsForPlayerIds = [];
  this.loadPromise = null;
  this.resourcePackageIds = null;
};

SdkStepInterface.prototype = {
  constructor: SdkStepInterface,

  actionsEndingGame: null,
  actionInterfaceSequence: null,
  hasShownHandFullForPlayerIds: null,
  hasShownOutOfCardsForPlayerIds: null,
  loadPromise: null,
  resourcePackageIds: null,
  _sdkStep: null,

  setSdkStep(val) {
    this._sdkStep = val;
  },

  getSdkStep() {
    return this._sdkStep;
  },

};

module.exports = SdkStepInterface;
