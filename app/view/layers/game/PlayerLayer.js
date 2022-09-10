// pragma PKGS: game
const RSX = require('app/data/resources');
const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const EVENTS = require('app/common/event_types');
const SDK = require('app/sdk');
const Promise = require('bluebird');
const _ = require('underscore');
const UtilsEngine = require('app/common/utils/utils_engine');
const BaseLayer = require('../BaseLayer');
const ArtifactNode = require('../../nodes/cards/ArtifactNode');
const SignatureCardNode = require('../../nodes/cards/SignatureCardNode');

/** **************************************************************************
 PlayerLayer
 - abstract layer for showing a player in a game
 *************************************************************************** */

const PlayerLayer = BaseLayer.extend({

  _playerId: null,
  _signatureCardNode: null,
  _canShowSignatureCardNode: false,
  _artifactNodes: null,

  /* region INITIALIZE */

  ctor(playerId) {
    this._playerId = playerId;

    // preallocate empty artifact nodes
    this._artifactNodes = [];
    for (var i = 0; i < CONFIG.MAX_ARTIFACTS; i++) {
      const artifactNode = ArtifactNode.create();
      artifactNode.setVisible(false);
      this._artifactNodes.push(artifactNode);
    }

    // node used to show signature cards
    this._signatureCardNode = SignatureCardNode.create();
    this._signatureCardNode.setVisible(false);

    // do super ctor
    this._super();

    // add nodes
    for (var i = 0, il = this._artifactNodes.length; i < il; i++) {
      this.addChild(this._artifactNodes[i]);
    }
    this.addChild(this._signatureCardNode);
  },

  /* endregion INITIALIZE */

  /* region LAYOUT */

  onResize() {
    this._super();
    this._updateArtifactNodesLayout();
    this._updateSignatureCardNodeLayout();
  },

  _updateArtifactNodesLayout() {
    // sort artifact nodes by those with an artifact card first
    this._artifactNodes = _.sortBy(this._artifactNodes, (artifactNode) => {
      const artifactCard = artifactNode.getSdkCard();
      return artifactCard ? artifactCard.getAppliedToBoardByActionIndex() : Math.Infinity;
    });
  },

  _updateSignatureCardNodeLayout() {
    // override to layout signature card node
  },

  /* endregion LAYOUT */

  /* region GETTERS / SETTERS */

  setPlayerId(playerId) {
    if (this._playerId !== playerId) {
      this._playerId = playerId;
    }
  },

  getPlayerId() {
    return this._playerId;
  },

  /**
   * Returns the sdk player this layer is visualizing.
   * @returns {SDK.Player}
   */
  getSdkPlayer() {
    return SDK.GameSession.getInstance().getPlayerById(this.getPlayerId());
  },

  /**
   * Returns all artifact nodes.
   * @returns {Array}
   */
  getArtifactNodes() {
    return this._artifactNodes;
  },

  /**
   * Returns an artifact node given a modifier, or null if this modifier is not linked to any existing artifact nodes.
   * @param {SDK.Modifier} modifier
   * @returns {ArtifactNode|null}
   */
  getArtifactNodeFromModifier(modifier) {
    let artifactNode;
    if (modifier instanceof SDK.Modifier && modifier.getIsFromArtifact()) {
      const sourceCard = modifier.getSourceCard();
      // search artifact nodes for matching artifact card
      for (let i = 0, il = this._artifactNodes.length; i < il; i++) {
        const existingArtifactNode = this._artifactNodes[i];
        if (existingArtifactNode.getSdkCard() === sourceCard) {
          artifactNode = existingArtifactNode;
          break;
        }
      }
    }
    return artifactNode;
  },

  /**
   * Returns whether an action is for this layer's player artifacts.
   * @param {SDK.Action} action
   * @returns {Boolean}
   */
  getActionIsForPlayerArtifacts(action) {
    let target;

    if (action instanceof SDK.ApplyModifierAction || action instanceof SDK.RemoveModifierAction) {
      const modifier = action.getModifier();
      if (modifier != null && modifier.getIsFromArtifact()) {
        target = modifier.getCardAffected();
      }
    } else if (action instanceof SDK.DamageAction || action instanceof SDK.RefreshArtifactChargesAction || action instanceof SDK.RestoreChargeToAllArtifactsAction) {
      target = action.getTarget();
    }

    return target instanceof SDK.Entity && (target.getIsGeneral() || target.getWasGeneral()) && target.getOwnerId() == this.getPlayerId();
  },

  getSignatureCardNode() {
    return this._signatureCardNode;
  },

  /* endregion GETTERS / SETTERS */

  /* region ARTIFACTS */

  /**
   * Returns an artifact data object given a modifier, or null if this modifier is not linked to an artifact.
   * @param {SDK.Modifier} modifier
   * @returns {Object|null}
   */
  getArtifactDataFromModifier(modifier) {
    let artifactData;
    if (modifier != null && modifier.getIsFromArtifact()) {
      const sourceCard = modifier.getSourceCard();
      // get information from source card
      if (sourceCard instanceof SDK.Artifact) {
        artifactData = {
          card: sourceCard,
          durability: modifier.getDurability(),
          maxDurability: modifier.getMaxDurability(),
        };
      }
    }
    return artifactData;
  },

  /**
   * Returns a list of artifact data objects given a list of modifiers.
   * @param {Array} modifiers
   * @returns {Array}
   */
  getArtifactsDataFromModifiers(modifiers) {
    const artifactsData = [];

    if (modifiers != null && modifiers.length > 0) {
      for (let i = 0, il = modifiers.length; i < il; i++) {
        const modifier = modifiers[i];
        const artifactData = this.getArtifactDataFromModifier(modifier);
        if (artifactData != null) {
          var artifactCard = artifactData.card;
          const matchingArtifactData = _.find(artifactsData, (existingArtifactData) => existingArtifactData.card === artifactCard);
          if (matchingArtifactData == null) {
            artifactsData.push(artifactData);
          }
        }
      }
    }

    return artifactsData;
  },

  /* region BINDING */

  /** *
   * Binds this view to the player as set in the model (SDK layer). Immediately will update to show the current state.
   */
  bindToGameSession() {
    this.bindArtifacts();
    this.bindSignatureCard();
  },

  /** *
   * Binds this view to this layer's player's current artifacts as set in the model (SDK layer). Immediately will update all artifacts slots to show the current state.
   */
  bindArtifacts() {
    let artifactsData;

    const sdkPlayer = this.getSdkPlayer();
    if (sdkPlayer != null) {
      // pull artifacts directly from player general
      const general = SDK.GameSession.getInstance().getGeneralForPlayerId(sdkPlayer.getPlayerId());
      if (general != null) {
        artifactsData = this.getArtifactsDataFromModifiers(general.getModifiers());
      }
    }

    // iterate over each artifact node and set artifact data
    if (artifactsData == null) { artifactsData = []; }
    for (let i = 0, il = this._artifactNodes.length; i < il; i++) {
      const artifactNode = this._artifactNodes[i];
      const artifactData = artifactsData[i];
      if (artifactData != null) {
        // update artifact
        artifactNode.setSdkCard(artifactData.card);
        artifactNode.setDurability(artifactData.durability);

        // always reset anim state so artifact animations are in sync
        artifactNode.showInactiveAnimState();
      } else {
        // clear artifact
        artifactNode.setSdkCard(null);
      }
    }

    // update layout of artifact nodes
    this._updateArtifactNodesLayout();
  },

  /** *
   * Binds this view to this layer's player's current signature card as set in the model (SDK layer). Immediately will update signature card node to show the current state.
   */
  bindSignatureCard() {
    // set signature node card to the player's current card or fallback to reference card
    // this way the signature card is always showing
    let referenceCard;
    let currentCard;
    const sdkPlayer = this.getSdkPlayer();
    if (sdkPlayer != null) {
      referenceCard = sdkPlayer.getReferenceSignatureCard();
      currentCard = sdkPlayer.getCurrentSignatureCard();
    }

    if (this._canShowSignatureCardNode && !this._signatureCardNode.getIsDisabled() && (currentCard != null || referenceCard != null)) {
      this._signatureCardNode.setVisible(true);
      this._signatureCardNode.setSdkCard(currentCard || referenceCard);
      this._signatureCardNode.resetHighlightAndSelection();
    } else {
      this._signatureCardNode.setVisible(false);
    }
  },

  /** *
   * Binds and resets signature card to the player's current signature card as set in the model (SDK layer).
   */
  bindAndResetSignatureCard(duration) {
    this.bindSignatureCard();
    this._signatureCardNode.resetCooldown(duration);
  },

  /** *
   * Unbinds this view from this layer's player's current signature card as set in the model (SDK layer). Immediately will update signature card node to remove all state.
   */
  unbindSignatureCard() {
    this._signatureCardNode.setSdkCard(null);
  },

  /* endregion BINDING */

  /* region ACTIONS */

  /**
   * Shows player for active game.
   */
  showActiveGame() {
    // show artifact nodes
    for (let i = 0, il = this._artifactNodes.length; i < il; i++) {
      const artifactNode = this._artifactNodes[i];
      if (!artifactNode.getIsEmpty()) {
        artifactNode.setOpacity(0.0);
        artifactNode.fadeTo(CONFIG.FADE_SLOW_DURATION, 255.0);
      }
      artifactNode.setVisible(true);
    }

    // bind and show signature card node
    this._canShowSignatureCardNode = true;
    this.bindSignatureCard();
    if (!this._signatureCardNode.getIsDisabled() && this._signatureCardNode.getSdkCard() != null) {
      this._signatureCardNode.setOpacity(0.0);
      this._signatureCardNode.fadeTo(CONFIG.FADE_SLOW_DURATION, 255.0, () => {
        this._signatureCardNode.resetCooldown(CONFIG.FADE_SLOW_DURATION);
      });
    }
  },

  /**
   * Incrementally updates artifacts based on an action.
   * @param {SDK.Action} action
   * @param {Number} [showDelay=0.0]
   * @returns {Number} duration of animations
   */
  showActionForArtifact(action, showDelay) {
    let showDuration = 0.0;

    if (this.getActionIsForPlayerArtifacts(action)) {
      // add artifacts if not yet shown
      if (action instanceof SDK.ApplyModifierAction) {
        var modifier = action.getModifier();
        const existingArtifactNode = this.getArtifactNodeFromModifier(modifier);
        if (existingArtifactNode == null) {
          // find first empty artifact node
          var artifactNodes = this._artifactNodes;
          var artifactNode;
          for (var i = 0, il = artifactNodes.length; i < il; i++) {
            const emptyArtifactNode = artifactNodes[i];
            if (emptyArtifactNode.getIsEmpty()) {
              artifactNode = emptyArtifactNode;
              break;
            }
          }

          // if no empty artifact nodes found, use last
          if (artifactNode == null) {
            artifactNode = artifactNodes[artifactNodes.length - 1];
          }

          // show application
          showDuration = Math.max(showDuration, artifactNode.showApply(modifier.getSourceCard(), showDelay));

          // update artifact nodes layout immediately
          this._updateArtifactNodesLayout();
        }
      }

      // remove artifact
      if (action instanceof SDK.RemoveModifierAction) {
        var modifier = action.getModifier();
        var artifactNode = this.getArtifactNodeFromModifier(modifier);
        if (artifactNode != null) {
          // show removal
          const removeDuration = artifactNode.showRemove(showDelay, this._updateArtifactNodesLayout.bind(this));
          showDuration = Math.max(showDuration, removeDuration);
        }
      }

      // update artifacts durability
      if (action instanceof SDK.DamageAction || action instanceof SDK.RefreshArtifactChargesAction || action instanceof SDK.RestoreChargeToAllArtifactsAction) {
        var artifactNodes = this._artifactNodes;

        // show durability change
        let durabilityChange = 0;
        if (action instanceof SDK.DamageAction) {
          if (action.getTotalDamageAmount() > 0.0) {
            durabilityChange = -1;
          }
        } else if (action instanceof SDK.RefreshArtifactChargesAction) {
          durabilityChange = CONFIG.MAX_ARTIFACT_DURABILITY;
        } else if (action instanceof SDK.RestoreChargeToAllArtifactsAction) {
          durabilityChange = 1;
        }
        for (var i = 0, il = artifactNodes.length; i < il; i++) {
          showDuration = Math.max(showDuration, artifactNodes[i].showDurabilityChange(durabilityChange, showDelay, this._updateArtifactNodesLayout.bind(this)));
        }
      }
    }

    return showDuration;
  },

  /**
   * Shows generation of a signature card for the player based on an action.
   * @param {SDK.Action} action
   * @param {Number} [showDelay=0.0]
   * @returns {Number} duration of animations
   */
  showGenerateSignatureCard(action, showDelay) {
    let showDuration = 0.0;

    if (this._canShowSignatureCardNode && action instanceof SDK.GenerateSignatureCardAction) {
      // ensure signature card node is showing
      this._signatureCardNode.setVisible(true);

      // show draw of new signature card
      const sdkCard = action.getCard();
      showDuration = this._signatureCardNode.showDraw(sdkCard, showDelay);
    }

    return showDuration;
  },

  /**
   * Shows activation of a signature card for the player based on an action.
   * @param {SDK.Action} action
   * @param {Number} [showDelay=0.0]
   * @returns {Number} duration of animations
   */
  showActivateSignatureCard(action, showDelay) {
    let showDuration = 0.0;

    if (this._canShowSignatureCardNode && action instanceof SDK.ActivateSignatureCardAction) {
      // ensure signature card node is showing
      this._signatureCardNode.setVisible(true);

      // show activate of signature card
      showDuration = this._signatureCardNode.showActivate(showDelay);
    }

    return showDuration;
  },

  /* endregion ACTIONS */

});

PlayerLayer.create = function (playerId, layer) {
  return BaseLayer.create(layer || new PlayerLayer(playerId));
};

module.exports = PlayerLayer;
