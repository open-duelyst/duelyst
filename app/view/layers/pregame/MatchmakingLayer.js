// pragma PKGS: matchmaking

const Promise = require('bluebird');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const generatePushID = require('app/common/generate_push_id');
const SDK = require('app/sdk');
const UtilsEngine = require('app/common/utils/utils_engine');
const UtilsPosition = require('app/common/utils/utils_position');
const SoundEffectSequence = require('app/audio/SoundEffectSequence');
const _ = require('underscore');
const ParallaxLayer = require('../ParallaxLayer');
const FXCompositeLayer = require('../FXCompositeLayer');
const BaseSprite = require('../../nodes/BaseSprite');
const BaseParticleSystem = require('../../nodes/BaseParticleSystem');
const FXFireRingSprite = require('../../nodes/fx/FXFireRingSprite');
const Shake = require('../../actions/Shake');

/** **************************************************************************
 MatchmakingLayer
 *************************************************************************** */

const MatchmakingLayer = ParallaxLayer.extend({

  bg: null,
  generalParallaxRatio: cc.p(0.04, 0.01),
  _myGeneralOffsetX: 0.0,
  _opponentGeneralOffsetX: 0.0,
  generalVSOffsetX: 0.3,
  runeGlowSprite: null,
  _myGeneralSprite: null,
  _opponentGeneralSprite: null,
  _vsCrestNode: null,
  _crestNode: null,
  _externalNodes: null,
  _requestId: null,

  ctor() {
    // generate unique id for requests
    this._requestId = generatePushID();

    // initialize properties that may be required in init
    this._externalNodes = [];

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      this.bg = BaseSprite.create(RSX.vignette.img);
    });

    // do super ctor
    this._super();
  },

  getRequiredResources() {
    return ParallaxLayer.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier('matchmaking'));
  },

  onResize() {
    this._super();

    // stop shake
    this.stopActionByTag(CONFIG.MOVE_TAG);

    // set self to middle of screen
    this.setPosition(UtilsEngine.getGSIWinCenterPosition());

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      const winSize = UtilsEngine.getGSIWinSize();

      // vignette
      this.setParallaxScale(UtilsEngine.getWindowSizeRelativeNodeScale(this.bg));
      this.bg.setScale(this.getParallaxScale());
      this.addOrUpdateParallaxedNode(this.bg, 0, cc.p(0.0, 0.0), cc.p(0.0, 0.0));

      if (this._crestNode != null) {
        this._crestNode.setScale(UtilsEngine.getWindowHeightRelativeNodeScale(this._crestNode) * 1.1);
      }

      if (this._myGeneralSprite != null) {
        this._myGeneralSprite.stopActionByTag(CONFIG.MOVE_TAG);
        this._myGeneralSprite.setScale(UtilsEngine.getWindowHeightRelativeNodeScale(this._myGeneralSprite) * 1.75);
        if (this._opponentGeneralSprite != null) {
          this.addOrUpdateParallaxedNode(this._myGeneralSprite, -1, this.generalParallaxRatio, cc.p(winSize.width * this._myGeneralOffsetX, -winSize.height * 0.2));
        } else {
          this.addOrUpdateParallaxedNode(this._myGeneralSprite, -1, this.generalParallaxRatio, cc.p(0.0, -winSize.height * 0.2));
        }
      }

      if (this._opponentGeneralSprite != null) {
        this._opponentGeneralSprite.stopActionByTag(CONFIG.MOVE_TAG);
        this._opponentGeneralSprite.setScale(UtilsEngine.getWindowHeightRelativeNodeScale(this._opponentGeneralSprite) * 1.75);
        this.addOrUpdateParallaxedNode(this._opponentGeneralSprite, -1, this.generalParallaxRatio, cc.p(winSize.width * this._opponentGeneralOffsetX, -winSize.height * 0.2));
      }
    });
  },

  terminate() {
    this._super();

    // destroy all external nodes
    if (this._externalNodes != null && this._externalNodes.length > 0) {
      const externalNodes = this._externalNodes;
      this._externalNodes = [];
      for (let i = 0, il = externalNodes.length; i < il; i++) {
        externalNodes[i].destroy(CONFIG.ANIMATE_FAST_DURATION);
      }
    }

    // reset gradient color map
    this.getFX().clearGradientColorMap(this._requestId, CONFIG.ANIMATE_MEDIUM_DURATION);
  },

  showFindingGame(myPlayerFactionId, myPlayerGeneralId) {
    return this.showMyPlayer(myPlayerFactionId, myPlayerGeneralId);
  },

  showVsForGame(myPlayerFactionId, opponentPlayerFactionId, myPlayerIsPlayer1, animationDuration, myPlayerGeneralId, opponentGeneralFactionId) {
    Logger.module('ENGINE').log('MatchmakingLayer.showVsForGame', myPlayerFactionId, opponentPlayerFactionId, myPlayerIsPlayer1, animationDuration);

    // show players
    const showMyPlayerPromise = this.showMyPlayer(myPlayerFactionId, myPlayerGeneralId);
    const showOpponentPlayerPromise = this.showOpponentPlayer(opponentPlayerFactionId, opponentGeneralFactionId);

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      if (this.runeGlowSprite != null) {
        this.runeGlowSprite.runAction(cc.fadeOut(0.1));
      }
    });

    return Promise.all([
      showMyPlayerPromise,
      showOpponentPlayerPromise,
    ])
      .then(() => {
        // move my player and opponent to their sides
        if (myPlayerIsPlayer1) {
          this._myGeneralOffsetX = -this.generalVSOffsetX;
          this._opponentGeneralOffsetX = this.generalVSOffsetX;
        } else {
          this._myGeneralOffsetX = this.generalVSOffsetX;
          this._opponentGeneralOffsetX = -this.generalVSOffsetX;
        }
        const moveMyPlayerPromise = this.movePlayer(this._myGeneralOffsetX, this._myGeneralSprite, animationDuration);
        const moveOpponentPlayerPromise = this.movePlayer(this._opponentGeneralOffsetX, this._opponentGeneralSprite, animationDuration);

        // show vs crest between players
        this._vsCrestNode = new cc.Node();
        this._vsCrestNode.setPosition(0.0, 0.0);
        this.addChild(this._vsCrestNode, 2);

        const vsCrestSprite = new BaseSprite(RSX.vs_crest.img);
        this._vsCrestNode.addChild(vsCrestSprite, 0);

        const vsCrestHighlightSprite = new BaseSprite(RSX.vs_crest_highlight.img);
        vsCrestHighlightSprite.setPosition(-30.0, 48.0);
        this._vsCrestNode.addChild(vsCrestHighlightSprite, 2);

        const vsCrestBracketFriendlySprite = new BaseSprite(RSX.vs_crest_bracket_friendly.img);
        this._vsCrestNode.addChild(vsCrestBracketFriendlySprite, 1);

        const vsCrestBracketEnemySprite = new BaseSprite(RSX.vs_crest_bracket_enemy.img);
        this._vsCrestNode.addChild(vsCrestBracketEnemySprite, 1);

        if (myPlayerIsPlayer1) {
          vsCrestBracketFriendlySprite.setFlippedX(true);
          vsCrestBracketFriendlySprite.setPosition(-98.0, 0.0);
          vsCrestBracketEnemySprite.setPosition(98.0, 0.0);
        } else {
          vsCrestBracketFriendlySprite.setPosition(98.0, 0.0);
          vsCrestBracketEnemySprite.setFlippedX(true);
          vsCrestBracketEnemySprite.setPosition(-98.0, 0.0);
        }

        // fire ring
        const fireRingSprite = FXFireRingSprite.create();
        fireRingSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
        fireRingSprite.setAnchorPoint(0.5, 0.5);
        fireRingSprite.setPosition(0.0, 0.0);
        fireRingSprite.setScale(7.0);
        fireRingSprite.setVisible(false);
        this.addChild(fireRingSprite, 1);

        // explosion
        const explosionParticles = new BaseParticleSystem(RSX.faction_explosion.plist);
        explosionParticles.setAnchorPoint(0.5, 0.5);
        explosionParticles.setPosition(0.0, 0.0);
        explosionParticles.setAutoRemoveOnFinish(false);
        explosionParticles.stopSystem();
        this.addChild(explosionParticles, 1);

        // animate vs crest in
        const delay = CONFIG.VIEW_TRANSITION_DURATION;
        this._vsCrestNode.setOpacity(0.0);
        this._vsCrestNode.setScale(2.0);
        const crestFadeAction = cc.spawn(
          cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION).easing(cc.easeOut(3.0)),
          cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, 1.0).easing(cc.easeIn(3.0)),
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
        );
        crestFadeAction.setTag(CONFIG.FADE_TAG);
        this._vsCrestNode.runAction(crestFadeAction);

        // shake the screen
        const shakeAction = cc.sequence(
          cc.delayTime(delay),
          Shake.create(0.5, 30.0, UtilsEngine.getGSIWinCenterPosition()),
        );
        shakeAction.setTag(CONFIG.MOVE_TAG);
        this.runAction(shakeAction);

        return Promise.all([
          moveMyPlayerPromise,
          moveOpponentPlayerPromise,
        ]);
      });
  },

  showNewGame(player1GeneralId, player2GeneralId) {
    if (this._showNewGamePromise == null) {
      this._showNewGamePromise = new Promise((resolve, reject) => {
        const player1General = SDK.GameSession.getCardCaches().getCardById(player1GeneralId);
        const player2General = SDK.GameSession.getCardCaches().getCardById(player2GeneralId);
        const announcerFirstResource = player1General && player1General.getAnnouncerFirstResource();
        const announcerSecondResource = player2General && player2General.getAnnouncerSecondResource();
        if (announcerFirstResource == null || announcerSecondResource == null) {
          // one or more of the generals has no announcer audio
          resolve();
        } else {
          // play announcer sounds
          const requestId = `${this._requestId}_matchmaking_announcer`;
          this.addResourceRequest(requestId, null, [announcerFirstResource, announcerSecondResource]);
          this.whenResourcesReady(requestId).then((requestId) => {
            if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

            const sfxList = [
              announcerFirstResource.audio,
              RSX.sfx_announcer_versus.audio,
              announcerSecondResource.audio,
            ];
            const durationList = [CONFIG.ANNOUNCER_DURATION, CONFIG.ANNOUNCER_DURATION, CONFIG.ANNOUNCER_DURATION];
            const sfxSequence = new SoundEffectSequence();
            sfxSequence.addSoundEffects(sfxList, null, durationList);
            sfxSequence.play();

            // delay for announcer then resolve
            this.runAction(cc.sequence(
              cc.delayTime(CONFIG.ANNOUNCER_DURATION * 3.0),
              cc.callFunc(() => {
                resolve();
              }),
            ));
          });
        }
      });
    }

    return this._showNewGamePromise;
  },

  showMyPlayer(factionId, generalId) {
    if (this._showMyPlayerPromise == null) {
      // use primary general if none provided
      if (generalId == null) {
        generalId = SDK.FactionFactory.generalIdForFactionByOrder(factionId, SDK.FactionFactory.GeneralOrder.Primary);
      }

      // show gradient color map
      this.getFX().showGradientColorMap(this._requestId, CONFIG.ANIMATE_FAST_DURATION, cc.color(194, 203, 240, 255), cc.color(20, 25, 60, 255));

      if (!this._crestNode) {
        this._crestNode = new BaseSprite();
        this._crestNode.setRequiredTextureResource(SDK.FactionFactory.getCrestResourceForFactionId(factionId));
        this._crestNode.setPosition(0, 0);
        const scene = this.getScene();
        const contentLayer = scene && scene.getContent();
        if (contentLayer instanceof FXCompositeLayer) {
          this._externalNodes.push(this._crestNode);
          contentLayer.getFXLayer().addChild(this._crestNode, 1);
        } else {
          this.addChild(this._crestNode, -2);
        }
      }
      this._crestNode.setVisible(false);

      // general
      const generalConceptResource = SDK.GameSession.getCardCaches().getCardById(generalId).getConceptResource();
      this._myGeneralSprite = new BaseSprite();
      this._myGeneralSprite.setRequiredTextureResource(generalConceptResource);
      this._myGeneralSprite.setVisible(false);

      const runesResource = RSX[`f${factionId}_runes`];
      const runesSpriteIdentifier = runesResource.name;
      const requestId = `${this._requestId}_matchmaking_runes`;
      this.addResourceRequest(requestId, null, [runesResource]);
      Promise.all([
        this.whenRequiredResourcesReady(),
        this.whenResourcesReady(requestId),
      ])
        .spread((requiredRequestId, runesRequestId) => {
          if (!this.getAreResourcesValid(requiredRequestId) || !this.getAreResourcesValid(runesRequestId)) return; // load invalidated or resources changed

          // add all runes
          for (let i = 0; i < 10; i++) {
            this._addRuneTracerNode(runesSpriteIdentifier);
          }

          this.runeGlowSprite = new cc.Sprite(RSX.rune_glow.img);
          this.runeGlowSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
          this.runeGlowSprite.setOpacity(255);
          this.runeGlowSprite.setScale(2.0);
          this.addChild(this.runeGlowSprite, -3);

          const particles = BaseParticleSystem.create({
            plistFile: RSX.matchmaking_upward_line_ray_particles.plist,
            fadeInAtLifePct: 0.05,
          });
          particles.setPosition(0, 0);
          particles.setPosVar(cc.p(UtilsEngine.getGSIWinWidth() * 0.5, UtilsEngine.getGSIWinHeight() * 0.5));
          this.addChild(particles, -5);
        });

      // resize once to layout
      this.onResize();

      this._showMyPlayerPromise = Promise.all([
        this._crestNode.whenRequiredResourcesReady(),
        this._myGeneralSprite.whenRequiredResourcesReady(),
      ])
        .spread((crestRequestId, generalRequestId) => {
          if (!this._crestNode.getAreResourcesValid(crestRequestId)
          || !this._myGeneralSprite.getAreResourcesValid(generalRequestId)) return; // resources have been invalidated

          this._crestNode.setVisible(true);
          this._crestNode.setScale(UtilsEngine.getWindowHeightRelativeNodeScale(this._crestNode) * 1.1);
          this._myGeneralSprite.setVisible(true);
          this._myGeneralSprite.setScale(UtilsEngine.getWindowHeightRelativeNodeScale(this._myGeneralSprite) * 1.75);

          // transition elements in
          this._crestNode.setOpacity(0.0);
          this._myGeneralSprite.setOpacity(0.0);
          this.runAction(cc.spawn(
            cc.targetedAction(this._crestNode, cc.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 155)),
            cc.targetedAction(this._myGeneralSprite, cc.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255)),
          ));
        });
    }
    return this._showMyPlayerPromise;
  },

  showOpponentPlayer(factionId, generalId) {
    if (this._showOpponentPlayerPromise == null) {
      // use primary general if none provided
      if (generalId == null) {
        generalId = SDK.FactionFactory.generalIdForFactionByOrder(factionId, SDK.FactionFactory.GeneralOrder.Primary);
      }

      // general
      const generalConceptResource = SDK.GameSession.getCardCaches().getCardById(generalId).getConceptResource();
      this._opponentGeneralSprite = new BaseSprite();
      this._opponentGeneralSprite.setRequiredTextureResource(generalConceptResource);
      this._opponentGeneralSprite.setVisible(false);

      // resize once to layout
      this.onResize();

      this._showOpponentPlayerPromise = this._opponentGeneralSprite.whenRequiredResourcesReady().then((generalRequestId) => {
        if (!this._opponentGeneralSprite.getAreResourcesValid(generalRequestId)) return; // resources have been invalidated

        this._opponentGeneralSprite.setVisible(true);
        this._opponentGeneralSprite.setScale(UtilsEngine.getWindowHeightRelativeNodeScale(this._opponentGeneralSprite) * 1.75);

        // transition elements in
        this._opponentGeneralSprite.setOpacity(0.0);
        this.runAction(cc.targetedAction(this._opponentGeneralSprite, cc.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255)));
      });
    }
    return this._showOpponentPlayerPromise;
  },

  _addRuneTracerNode(spriteIdentifier) {
    const animAction = UtilsEngine.getAnimationAction(spriteIdentifier, true);
    if (animAction) {
      // node for rune
      const runeNode = new cc.Node();
      runeNode.setOpacity(0.0);
      const scene = this.getScene();
      const contentLayer = scene && scene.getContent();
      if (contentLayer instanceof FXCompositeLayer) {
        this._externalNodes.push(runeNode);
        contentLayer.getFXLayer().addChild(runeNode, 2);
      } else {
        this.addChild(runeNode, -1);
      }

      // rune animation
      const runeSprite = new BaseSprite(spriteIdentifier);
      runeSprite.runAction(animAction);
      runeNode.addChild(runeSprite);

      // rune glow
      const runeGlowSprite = new BaseSprite(RSX.rune_glow.img);
      runeGlowSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      runeGlowSprite.setOpacity(100);
      runeGlowSprite.runAction(cc.repeatForever(
        cc.sequence(
          cc.fadeTo(0.1, 130),
          cc.fadeTo(0.2, 100),
        ),
      ));
      runeNode.addChild(runeGlowSprite);

      // add particles
      const particles = new BaseParticleSystem(RSX.rune_particles.plist);
      runeNode.addChild(particles);
      particles.stopSystem();

      // animate movement
      var animateRuneNode = function () {
        const winSize = UtilsEngine.getGSIWinSize();
        const x = (0.5 - Math.random()) * winSize.width * 0.9;
        const y = (0.5 - Math.random()) * winSize.height * 0.5;
        runeNode.setPosition(x, y);
        runeNode.setScale(0.1 + 0.2 * Math.random());
        runeNode.setOpacity(0.0);

        const dy = (winSize.height * 0.5 + 100) - y;
        const moveDuration = dy / (runeNode.getScale() * 60.0);
        runeNode.runAction(cc.sequence(
          cc.spawn(
            cc.fadeTo(CONFIG.FADE_MEDIUM_DURATION, 255.0),
            cc.moveBy(moveDuration, cc.p(0, dy)),
          ),
          cc.callFunc(animateRuneNode),
        ));
      };

      // delay showing rune node randomly
      runeNode.runAction(cc.sequence(
        cc.delayTime(Math.random() * 10),
        cc.callFunc(() => {
          particles.resumeSystem();
          animateRuneNode();
        }),
      ));
    }
  },

  movePlayer(offsetX, generalSprite, animationDuration) {
    const movePromise = new Promise((resolve, reject) => {
      const { parallaxNode } = this;
      const { generalParallaxRatio } = this;
      const parallaxLayer = this;
      const parallaxPositionUpdate = function (value, key) {
        if (key === 'offset') {
          const tweenedOffset = cc.p(
            UtilsEngine.getGSIWinWidth() * offsetX * value,
            -UtilsEngine.getGSIWinHeight() * 0.2,
          );
          parallaxNode.setChildParallaxRatioAndOffset(generalSprite, generalParallaxRatio, tweenedOffset);
          parallaxLayer.forceParallaxUpdate();
        }
      };

      if (animationDuration != null && animationDuration > 0.0) {
        // animate movement
        generalSprite.updateTweenAction = parallaxPositionUpdate;
        generalSprite.stopActionByTag(CONFIG.MOVE_TAG);
        const moveAction = cc.actionTween(animationDuration, 'offset', 0.0, 1.0).easing(cc.easeExponentialOut());
        moveAction.setTag(CONFIG.MOVE_TAG);
        generalSprite.runAction(moveAction);

        // delay then resolve
        this.runAction(cc.sequence(
          cc.delayTime(animationDuration),
          cc.callFunc(() => {
            resolve();
          }),
        ));
      } else {
        parallaxPositionUpdate.call(generalSprite, 1.0, 'offset');
        resolve();
      }
    });

    return movePromise;
  },

});

MatchmakingLayer.create = function (layer) {
  return ParallaxLayer.create(layer || new MatchmakingLayer());
};

module.exports = MatchmakingLayer;
