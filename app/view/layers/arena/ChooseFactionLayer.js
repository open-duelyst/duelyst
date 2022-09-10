// pragma PKGS: gauntlet
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const UtilsEngine = require('app/common/utils/utils_engine');
const Promise = require('bluebird');
const i18next = require('i18next');
const EVENTS = require('../../../common/event_types');
const BaseLayer = require('../BaseLayer');
const BaseParticleSystem = require('../../nodes/BaseParticleSystem');
const BaseSprite = require('../../nodes/BaseSprite');
const GlowSprite = require('../../nodes/GlowSprite');
const CardNode = require('../../nodes/cards/CardNode');
const ZodiacNode = require('../../nodes/draw/Zodiac');
const TweenTypes = require('../../actions/TweenTypes');
const ToneCurve = require('../../actions/ToneCurve');
const Shake = require('../../actions/Shake');
const audio_engine = require('../../../audio/audio_engine');
const FXGlowImageMap = require('../../nodes/fx/FXGlowImageMap');
const FXFireRingSprite = require('../../nodes/fx/FXFireRingSprite');

/** **************************************************************************
 ChooseFactionLayer
 *************************************************************************** */

const ChooseFactionLayer = BaseLayer.extend({

  delegate: null,
  _currentlyHighlightedNode: null,
  _crestNodes: null,
  _selectedNode: null,
  _showingAnimationsPromise: null,

  // ui elements
  titleLabel: null,

  /* region INITIALIZE */

  ctor(arenaRunData) {
    this._crestNodes = [];

    // do super ctor
    this._super();

    this.titleLabel = new cc.LabelTTF(i18next.t('gauntlet.select_faction_label').toUpperCase(), RSX.font_bold.name, 24, cc.size(500, 32), cc.TEXT_ALIGNMENT_CENTER);
    this.titleLabel.setPosition(0, 200);
    this.titleLabel.setVisible(false);
    this.addChild(this.titleLabel);
  },

  /* endregion INITIALIZE */

  /* region EVENTS */

  _startListeningToEvents() {
    this._super();

    const scene = this.getScene();
    if (scene != null) {
      scene.getEventBus().on(EVENTS.pointer_move, this.onPointerMove, this);
      scene.getEventBus().on(EVENTS.pointer_up, this.onPointerUp, this);
    }
  },

  _stopListeningToEvents() {
    this._super();

    const scene = this.getScene();
    if (scene != null) {
      scene.getEventBus().off(EVENTS.pointer_move, this.onPointerMove, this);
      scene.getEventBus().off(EVENTS.pointer_up, this.onPointerUp, this);
    }
  },

  onPointerMove(event) {
    if (event && event.isStopped) {
      return;
    }

    if (this.canMakeSelection()) {
      // intersect nodes
      const location = event && event.getLocation();
      if (location) {
        for (let i = 0; i < this._crestNodes.length; i++) {
          const node = this._crestNodes[i];
          if (UtilsEngine.getNodeUnderMouse(node, location.x, location.y)) {
            this.highlightNode(node);
            event.stopPropagation();
            break;
          }
        }
      }
    }
  },

  onPointerUp(event) {
    if (event && event.isStopped) {
      return;
    }

    if (this.canMakeSelection()) {
      const location = event && event.getLocation();
      if (location) {
        for (let i = 0; i < this._crestNodes.length; i++) {
          const node = this._crestNodes[i];
          if (UtilsEngine.getNodeUnderMouse(node, location.x, location.y)) {
            this.selectNode(node);
            event.stopPropagation();
            break;
          }
        }
      }
    }
  },

  /* endregion EVENTS */

  /* region OPTIONS */

  showFactionOptions(factionChoices) {
    // wait to show factions until animations complete
    return (this._showingAnimationsPromise || Promise.resolve()).then(() => this._showingAnimationsPromise = new Promise((resolve, reject) => {
      // reset
      if (this._crestNodes != null && this._crestNodes.length > 0) {
        for (var i = 0, il = this._crestNodes.length; i < il; i++) {
          const crestNode = this._crestNodes[i];
          crestNode._glowNode.destroy(CONFIG.FADE_FAST_DURATION);
          crestNode._factionNameLabel.destroy(CONFIG.FADE_FAST_DURATION);
          crestNode.destroy(CONFIG.FADE_FAST_DURATION);
        }
      }
      this._crestNodes = [];

      this.resetSelection();

      // play show audio
      audio_engine.current().play_effect(RSX.sfx_ui_explosion.audio, false);

      // show all faction choices
      const showFactionPromises = [];
      for (var i = 0; i < factionChoices.length; i++) {
        showFactionPromises.push(this.showFactionOption(factionChoices[i], cc.p((i - 1) * 300, 0.0)));
      }

      // fade in title after short delay
      this.titleLabel.setOpacity(0.0);
      this.titleLabel.runAction(cc.sequence(
        cc.delayTime(CONFIG.ANIMATE_FAST_DURATION),
        cc.show(),
        cc.fadeIn(CONFIG.FADE_FAST_DURATION),
      ));

      // shake delegate after short delay
      showFactionPromises.push(this.delegate.showShake(CONFIG.ANIMATE_FAST_DURATION * 2.0));

      Promise.all(showFactionPromises).then(() => {
        // resolve after everything is shown
        resolve();
      });
    })).finally(() => {
      this._showingAnimationsPromise = null;
    });
  },

  showFactionOption(factionId, position, delay) {
    return new Promise((resolve, reject) => {
      if (delay == null) { delay = 0.0; }

      // add a small random delay
      delay += Math.random() * 0.1;

      // glow
      const crestGlow = new FXGlowImageMap();
      crestGlow.setRequiredTextureResource(SDK.FactionFactory.getCrestShadowResourceForFactionId(factionId));
      crestGlow.setAnchorPoint(0.5, 0.5);
      crestGlow.setScale(0.28);
      crestGlow.setPosition(position);
      crestGlow.setLevelsInWhite(200);
      crestGlow.setGamma(0.75);
      crestGlow.setIntensity(0.75);
      crestGlow.setGlowColor(CONFIG.ARENA_FACTION_GLOW_COLOR);
      this.addChild(crestGlow, -2);

      // label
      const factionNameLabel = new cc.LabelTTF(SDK.FactionFactory.factionForIdentifier(factionId).name.toUpperCase(), RSX.font_light.name, 18, cc.size(500, 32), cc.TEXT_ALIGNMENT_CENTER);
      factionNameLabel.setPosition(cc.p(position.x, position.y - 200.0));
      this.addChild(factionNameLabel, -2);

      // fire ring
      const fireRingSprite = FXFireRingSprite.create();
      fireRingSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      fireRingSprite.setAnchorPoint(0.5, 0.5);
      fireRingSprite.setPosition(position);
      fireRingSprite.setScale(5.0);
      fireRingSprite.setVisible(false);
      this.addChild(fireRingSprite, -1);

      // explosion
      const explosionParticles = new BaseParticleSystem(RSX.faction_explosion.plist);
      explosionParticles.setAnchorPoint(0.5, 0.5);
      explosionParticles.setPosition(position);
      explosionParticles.setAutoRemoveOnFinish(false);
      explosionParticles.stopSystem();
      this.addChild(explosionParticles, -1);

      // crest
      const crest = new BaseSprite();
      crest.setRequiredTextureResource(SDK.FactionFactory.getCrestResourceForFactionId(factionId));
      crest.setVisible(false);
      crest.setAnchorPoint(0.5, 0.5);
      crest._baseScale = 0.3;
      crest.setPosition(position);
      crest._factionId = factionId;
      crest._glowNode = crestGlow;
      crest._factionNameLabel = factionNameLabel;
      this._crestNodes.push(crest);
      this.addChild(crest);

      crest.whenRequiredResourcesReady().then((requestId) => {
        if (!crest.getAreResourcesValid(requestId)) return; // resources have been invalidated

        crest.setVisible(true);

        // animate crest in
        crest.setOpacity(0);
        crest.setScale(crest._baseScale * 2.0);
        const crestFadeAction = cc.sequence(
          cc.spawn(
            cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION).easing(cc.easeOut(3.0)),
            cc.moveTo(CONFIG.ANIMATE_FAST_DURATION, cc.p(position.x * 1.75, position.y)).easing(cc.easeOut(3.0)),
            cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, crest._baseScale * 2.5).easing(cc.easeOut(3.0)),
          ),
          cc.delayTime(delay),
          cc.spawn(
            cc.moveTo(CONFIG.ANIMATE_FAST_DURATION, position).easing(cc.easeIn(3.0)),
            cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, crest._baseScale).easing(cc.easeIn(3.0)),
            cc.sequence(
              cc.delayTime(CONFIG.ANIMATE_FAST_DURATION * 0.5),
              cc.callFunc(() => {
                // fire ring
                fireRingSprite.setVisible(true);
                fireRingSprite.runAction(cc.sequence(
                  cc.spawn(
                    cc.actionTween(1.0, 'phase', 1.0, 0.0).easing(cc.easeExponentialOut()),
                    cc.sequence(
                      cc.delayTime(1.0 - CONFIG.FADE_MEDIUM_DURATION),
                      cc.fadeOut(CONFIG.FADE_MEDIUM_DURATION),
                    ),
                  ),
                  cc.callFunc(() => {
                    fireRingSprite.destroy();
                  }),
                ));

                // explosion
                explosionParticles.setAutoRemoveOnFinish(true);
                explosionParticles.resumeSystem();
              }),
            ),
          ),
        );
        crestFadeAction.setTag(CONFIG.FADE_TAG);
        crest.runAction(crestFadeAction);

        // delay a little extra for secondary elements
        delay += CONFIG.ANIMATE_FAST_DURATION * 2.0;

        // animate glow in
        crestGlow.setOpacity(0);
        const glowFadeAction = cc.sequence(
          cc.delayTime(delay),
          cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION),
        );
        glowFadeAction.setTag(CONFIG.FADE_TAG);
        crestGlow.runAction(glowFadeAction);

        // animate faction name in
        factionNameLabel.setOpacity(0);
        const factionFadeAction = cc.sequence(
          cc.delayTime(delay),
          cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION),
          cc.callFunc(() => {
            resolve();
          }),
        );
        factionFadeAction.setTag(CONFIG.FADE_TAG);
        factionNameLabel.runAction(factionFadeAction);
      });
    });
  },

  /* endregion OPTIONS */

  /* region SELECTION */

  highlightNode(node) {
    if (this._currentlyHighlightedNode != node) {
      // cleanup previous
      if (this._currentlyHighlightedNode != null) {
        this._currentlyHighlightedNode._glowNode.setGlowColor(CONFIG.ARENA_FACTION_GLOW_COLOR);
        this._currentlyHighlightedNode = null;
      }

      if (node != null && this.canMakeSelection()) {
        // play sound
        audio_engine.current().play_effect(RSX.sfx_ui_menu_hover.audio);

        // set new
        this._currentlyHighlightedNode = node;
        this._currentlyHighlightedNode._glowNode.setGlowColor(CONFIG.ARENA_FACTION_GLOW_HIGHLIGHT_COLOR);
        this.delegate.highlightFaction(this._currentlyHighlightedNode._factionId);
      }
    }
  },

  selectNode(selectedNode) {
    if (selectedNode != null && this.canMakeSelection()) {
      this._selectedNode = selectedNode;
      const factionId = this._selectedNode._factionId;

      // play select audio
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.SELECT_SFX_PRIORITY);

      // set up an async promise that allows us to wait for animations to complete before showing anything else
      this._showingAnimationsPromise = this.showSelectedNode(this._selectedNode).finally(() => {
        this._showingAnimationsPromise = null;
      });

      // select faction
      return this.delegate.selectFaction(factionId).catch(() => {
        // reset if there is a problem
        this.resetSelection();
      });
    }
  },

  showSelectedNode(selectedNode) {
    return new Promise((resolve, reject) => {
      // show selected node
      selectedNode._glowNode.setGlowColor(CONFIG.ARENA_FACTION_GLOW_SELECT_COLOR);

      // show unselected nodes
      for (let i = 0; i < this._crestNodes.length; i++) {
        const node = this._crestNodes[i];
        if (node !== selectedNode) {
          node._glowNode.setVisible(false);
          node._factionNameLabel.setVisible(false);
          const fadeAction = cc.sequence(
            cc.scaleBy(CONFIG.ANIMATE_FAST_DURATION, 0.9).easing(cc.easeOut(4.0)),
            cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION),
          );
          fadeAction.setTag(CONFIG.FADE_TAG);
          node.runAction(fadeAction);
        }
      }

      this._showSelectedNodeAction = cc.sequence(
        cc.delayTime(CONFIG.ANIMATE_FAST_DURATION * 2.0),
        cc.callFunc(() => {
          resolve();
        }),
      );
      this.runAction(this._showSelectedNodeAction);
    });
  },

  canMakeSelection() {
    if (this._selectedNode != null) {
      return false;
    }
    return this._showingAnimationsPromise == null || this._showingAnimationsPromise.isFulfilled();
  },

  resetSelection() {
    if (this._showSelectedNodeAction != null) {
      this.stopAction(this._showSelectedNodeAction);
    }
    this._selectedNode = null;
    this.highlightNode(null);

    for (let i = 0; i < this._crestNodes.length; i++) {
      const node = this._crestNodes[i];
      node.stopActionByTag(CONFIG.FADE_TAG);
      node.setScale(node._baseScale);
      node.setOpacity(255.0);
      node._glowNode.setGlowColor(CONFIG.ARENA_FACTION_GLOW_COLOR);
      node._glowNode.setVisible(true);
      node._factionNameLabel.setVisible(true);
    }
  },

  /* endregion SELECTION */

  /* region TRANSITION */

  transitionIn() {
    return new Promise((resolve, reject) => {
      this.setOpacity(0.0);
      this.runAction(cc.sequence(
        cc.fadeIn(CONFIG.FADE_FAST_DURATION),
        cc.callFunc(() => {
          resolve();
        }),
      ));
    });
  },

  transitionOut() {
    return (this._showingAnimationsPromise || Promise.resolve()).then(() => new Promise((resolve, reject) => {
      this.runAction(cc.sequence(
        cc.fadeOut(CONFIG.FADE_FAST_DURATION),
        cc.callFunc(() => {
          resolve();
        }),
      ));
    }));
  },

  /* endregion TRANSITION */

});

ChooseFactionLayer.create = function (layer) {
  return BaseLayer.create(layer || new ChooseFactionLayer());
};

module.exports = ChooseFactionLayer;
