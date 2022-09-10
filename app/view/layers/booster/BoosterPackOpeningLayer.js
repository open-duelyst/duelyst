// pragma PKGS: booster_opening

const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const Promise = require('bluebird');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const UtilsEngine = require('app/common/utils/utils_engine');
const audio_engine = require('app/audio/audio_engine');
const BaseLayer = require('app/view/layers/BaseLayer');
const FXCompositeLayer = require('app/view/layers/FXCompositeLayer');
const BaseParticleSystem = require('app/view/nodes/BaseParticleSystem');
const BaseSprite = require('app/view/nodes/BaseSprite');
const GlowSprite = require('app/view/nodes/GlowSprite');
const CardNode = require('app/view/nodes/cards/CardNode');
const ZodiacNode = require('app/view/nodes/draw/Zodiac');
const FXEnergyBall = require('app/view/nodes/fx/FXEnergyBallSprite');
const FXLensFlareSprite = require('app/view/nodes/fx/FXLensFlareSprite');
const FXFireRing = require('app/view/nodes/fx/FXFireRingSprite');
const TweenTypes = require('app/view/actions/TweenTypes');
const ToneCurve = require('app/view/actions/ToneCurve');
const Shake = require('app/view/actions/Shake');
const CoreGemNode = require('app/view/nodes/gem/CoreGemNode');
const MotionStreakRingNode = require('app/view//nodes/misc/MotionStreakRingNode');
const i18next = require('i18next');
const EVENTS = require('../../../common/event_types');

/** **************************************************************************
 BoosterPackOpeningLayer
 *************************************************************************** */

const BoosterPackOpeningLayer = FXCompositeLayer.extend({

  _mouseOverCard: null,
  _mouseOverGem: null,
  _unlocking: false,
  _unlocked: false,
  _opened: false,
  _whenMostRecentShowCardReveal: null,
  _whenRevealResolve: null,
  _cardCountsById: null,
  _cardCount: null,

  // radius/positions/spacing for cards
  radius: 215,
  layoutsByCount: {
    3: {
      positionsByIndex: [
        cc.p(1, 0.5), cc.p(-1, 0.5), cc.p(0, -0.5),
      ],
      spacingByIndex: [
        cc.p(20.0, 30.0), cc.p(-20.0, 30.0), cc.p(0, 10.0),
      ],
    },
    5: {
      positionsByIndex: [
        cc.p(1, 0.5), cc.p(0, 0.5), cc.p(-1, 0.5),
        cc.p(-0.5, -0.5), cc.p(0.5, -0.5),
      ],
      spacingByIndex: [
        cc.p(20.0, 30.0), cc.p(0, 30.0), cc.p(-20.0, 30.0),
        cc.p(-10.0, 10.0), cc.p(10.0, 10.0),
      ],
    },
  },

  continueNode: null,
  bgImage: null,
  energyBall: null,
  energyBallParticles: null,
  innerLayer: null,
  outerLayer: null,
  cardNodes: null,
  coreGemNodes: null,
  doneButton: null,
  fireRing: null,
  vignette: null,
  blurredOverlay: null,

  ctor() {
    // initialize properties that may be required in init
    this.cardNodes = [];
    this.coreGemNodes = [];

    // layers
    this.innerLayer = BaseLayer.create();
    this.outerLayer = BaseLayer.create();

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated/unloaded

      // background image
      this.bgImage = BaseSprite.create(RSX.booster_opening_bg.img);
      this.bgImage.setAnchorPoint(cc.p(0.5, 0.5));

      // red ring with runes
      this.redRing = BaseSprite.create(RSX.booster_opening_red_ring.img);
      this.redRing.setAnchorPoint(cc.p(0.5, 0.5));

      // main metallic plate
      this.plate = BaseSprite.create(RSX.booster_opening_plate.img);
      this.plate.setAnchorPoint(cc.p(0.5, 0.5));

      // turbine
      this.turbine = BaseSprite.create(RSX.booster_opening_turbine.img);
      this.turbine.setAnchorPoint(cc.p(0.5, 0.5));

      // center ring with lights
      this.centerRing = BaseSprite.create(RSX.booster_opening_center_ring.img);
      this.centerRing.setAnchorPoint(cc.p(0.5, 0.5));

      // vignette image
      this.vignette = BaseSprite.create(RSX.booster_opening_vignette.img);
      this.vignette.setAnchorPoint(cc.p(0.5, 0.5));
      this.vignette.setOpacity(0);

      // blurred overlay static image
      this.blurredOverlay = BaseSprite.create(RSX.booster_opening_blurred_overlay.img);
      this.blurredOverlay.setAnchorPoint(cc.p(0.5, 0.5));
      this.blurredOverlay.setOpacity(0);

      // center ring with lights
      this.centerMetalOuterRing = BaseSprite.create(RSX.booster_opening_center_metal_outer_ring.img);
      this.centerMetalOuterRing.setAnchorPoint(cc.p(0.5, 0.5));

      // top red plate
      this.topRedPlateLeft = BaseSprite.create(RSX.booster_opening_top_red_plate_left.img);
      this.topRedPlateLeft.setAnchorPoint(cc.p(0.5, 0.5));

      // top red plate
      this.topRedPlateRight = BaseSprite.create(RSX.booster_opening_top_red_plate_right.img);
      this.topRedPlateRight.setAnchorPoint(cc.p(0.5, 0.5));

      // top red plate
      this.topRedPlateBottom = BaseSprite.create(RSX.booster_opening_top_red_plate_bottom.img);
      this.topRedPlateBottom.setAnchorPoint(cc.p(0.5, 0.5));

      // energy particles
      this.energyBallParticles = new BaseParticleSystem(RSX.booster_pack_center_particles.plist, {
        plistFile: RSX.booster_pack_center_particles.plist,
        type: 'Particles',
        fadeInAtLifePct: 0.05,
      });
      this.energyBallParticles.setAnchorPoint(cc.p(0.5, 0.5));
      this.energyBallParticles.stopSystem();

      // energy ball
      this.energyBall = FXEnergyBall.create();
      this.energyBall.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      this.energyBall.setScale(4.0);
      this.energyBall.setAnchorPoint(cc.p(0.5, 0.5));
      // this.energyBall.setOpacity(0)

      // instructional arrow
      const instructionalArrowSprite = BaseSprite.create(RSX.instructional_arrow.img);
      instructionalArrowSprite.setPosition(cc.p(280, 0.0));
      instructionalArrowSprite.setOpacity(0.0);
      instructionalArrowSprite.setRotation(90);
      instructionalArrowSprite.runAction(cc.sequence(
        cc.delayTime(0.2),
        cc.fadeIn(CONFIG.FADE_MEDIUM_DURATION),
        cc.callFunc(() => {
          const rings = BaseParticleSystem.create(RSX.ptcl_ring_flash.plist);
          rings.setPosition(0, 0);
          rings.setAutoRemoveOnFinish(true);
          this.innerLayer.addChild(rings);

          this.turbine.startRotating(30.0, 360);
          this.centerRing.startRotating(30.0, -360);
        }),
        cc.moveBy(CONFIG.MOVE_SLOW_DURATION, cc.p(-140, 0)).easing(cc.easeExponentialOut()),
        cc.delayTime(1.0),
        cc.callFunc(() => {
          instructionalArrowSprite.destroy(CONFIG.FADE_MEDIUM_DURATION);
        }),
      ));
      this.innerLayer.addChild(instructionalArrowSprite);

      // continue instruction label
      this.continueNode = new cc.LabelTTF(i18next.t('common.press_anywhere_to_continue_label').toUpperCase(), RSX.font_light.name, 18, cc.size(1200, 24), cc.TEXT_ALIGNMENT_CENTER);
      this.continueNode.setAnchorPoint(cc.p(0.5, 0));
      this.continueNode.setLocalZOrder(999);
      this.continueNode.setOpacity(0.0);
      this.continueNode.setVisible(false);

      // add children after ctor
      this.getFXLayer().addChild(this.bgImage);
      this.getFXLayer().addChild(this.redRing);
      this.getFXLayer().addChild(this.plate);
      this.getFXLayer().addChild(this.turbine);
      this.getFXLayer().addChild(this.centerRing);
      this.getFXLayer().addChild(this.centerMetalOuterRing);
      this.getFXLayer().addChild(this.topRedPlateLeft);
      this.getFXLayer().addChild(this.topRedPlateRight);
      this.getFXLayer().addChild(this.topRedPlateBottom);
      this.getFXLayer().addChild(this.blurredOverlay);
      this.getFXLayer().addChild(this.vignette);
      this.getFXLayer().addChild(this.energyBallParticles);
      this.getFXLayer().addChild(this.energyBall);
      this.getFXLayer().addChild(this.innerLayer);
      this.getNoFXLayer().addChild(this.outerLayer);
      this.addChild(this.continueNode);
    });

    // super constructor last to ensure elements get created before doing anything else
    this._super();
  },

  getRequiredResources() {
    return FXCompositeLayer.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier('booster_opening'));
  },

  /* region LAYOUT */

  onResize() {
    FXCompositeLayer.prototype.onResize.apply(this, arguments);

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated/unloaded

      const winCenterPosition = UtilsEngine.getGSIWinCenterPosition();

      if (this.innerLayer != null) {
        this.innerLayer.setPosition(winCenterPosition);
      }
      if (this.outerLayer != null) {
        this.outerLayer.setPosition(winCenterPosition);
      }

      const scale = UtilsEngine.getWindowSizeRelativeNodeScale(this.bgImage);

      this.bgImage.setScale(scale);
      this.bgImage.setPosition(winCenterPosition);

      this.redRing.setScale(scale - 0.1);
      this.redRing.setPosition(winCenterPosition);

      this.plate.setScale(scale - 0.1);
      this.plate.setPosition(winCenterPosition);

      this.turbine.setScale(scale - 0.1);
      this.turbine.setPosition(winCenterPosition);

      this.centerRing.setScale(scale - 0.1);
      this.centerRing.setPosition(winCenterPosition);

      this.centerMetalOuterRing.setScale(scale - 0.1);
      this.centerMetalOuterRing.setPosition(winCenterPosition);

      this.topRedPlateLeft.setScale(scale - 0.1);
      this.topRedPlateLeft.setPosition(winCenterPosition);

      this.topRedPlateRight.setScale(scale - 0.1);
      this.topRedPlateRight.setPosition(winCenterPosition);

      this.topRedPlateBottom.setScale(scale - 0.1);
      this.topRedPlateBottom.setPosition(winCenterPosition);

      this.vignette.setScale(UtilsEngine.getWindowSizeRelativeNodeScale(this.vignette));
      this.vignette.setPosition(winCenterPosition);

      this.blurredOverlay.setScale(UtilsEngine.getWindowSizeRelativeNodeScale(this.blurredOverlay));
      this.blurredOverlay.setPosition(winCenterPosition);

      this.energyBallParticles.setPosition(winCenterPosition);

      this.energyBall.setPosition(winCenterPosition);

      this.continueNode.setPosition(cc.p(winCenterPosition.x, 40));
    });
  },

  /* endregion LAYOUT */

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

  onEnter() {
    this._super();

    // set bloom
    const fx = this.getFX();
    this._lastBloomThreshold = fx.getBloomThreshold();
    this._bloomThreshold = 0.5;
    fx.setBloomThreshold(this._bloomThreshold);
    this._lastBloomIntensity = fx.getBloomIntensity();
    this._bloomIntensity = 1.8;
    // bloom will fade in during booster opening
    fx.setBloomIntensity(0.0);

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated/unloaded

      audio_engine.current().play_music(RSX.music_boosterpack.audio);
    });
  },

  onExit() {
    this._super();

    // restore bloom
    const fx = this.getFX();
    if (this._lastBloomThreshold != null && fx.getBloomThreshold() === this._bloomThreshold) {
      fx.setBloomThreshold(this._lastBloomThreshold);
    }
    if (this._lastBloomIntensity != null && fx.getBloomThreshold() === this._bloomIntensity) {
      fx.setBloomThreshold(this._lastBloomIntensity);
    }
  },

  onPointerMove(event) {
    if (event && event.isStopped) {
      return;
    }

    const location = event && event.getLocation();
    let mouseOverCard = null;
    let mouseOverGem = null;
    if (location && !this._unlocking && this._opened) {
      // find card under mouse
      for (var i = 0; i < this.cardNodes.length; i++) {
        const cardNode = this.cardNodes[i];
        if (!cardNode.getIsAnimationInProgress() && UtilsEngine.getNodeUnderMouse(cardNode, location.x, location.y)) {
          mouseOverCard = cardNode;
          break;
        }
      }
      // find core gem under mouse
      for (var i = 0; i < this.coreGemNodes.length; i++) {
        const gemNode = this.coreGemNodes[i];
        if (UtilsEngine.getNodeUnderMouse(gemNode.gemSprite, location.x, location.y) && gemNode.isRunning()) {
          mouseOverGem = gemNode;
          break;
        }
      }

      if (mouseOverCard) {
        const isDifferentCard = this._mouseOverCard != mouseOverCard;

        // reset previous card
        if (this._mouseOverCard && isDifferentCard) {
          this._mouseOverCard.stopShowingInspect();
        }

        this._mouseOverCard = mouseOverCard;

        // setup new card
        if (this._mouseOverCard && isDifferentCard) {
          this._mouseOverCard.showInspect(null, true, null, null, false, true);
          this._mouseOverCard.setLocalZOrder(1);
        }
      } else if (mouseOverGem) {
        if (this._mouseOverGem != mouseOverGem) {
          if (this._mouseOverGem) {
            this._mouseOverGem.setSelected(false);
          }
          this._mouseOverGem = mouseOverGem;
          this._mouseOverGem.setSelected(true);
        }
      } else {
        if (this._mouseOverGem) {
          this._mouseOverGem.setSelected(false);
          this._mouseOverGem = null;
        }
        if (this._mouseOverCard) {
          this._mouseOverCard.stopShowingInspect();
          this._mouseOverCard = null;
        }
      }
    }
  },

  onPointerUp(event) {
    if (event && event.isStopped) {
      return;
    }

    if (this._mouseOverGem && !this._unlocked) {
      // explosion particles
      const explosionParticles = cc.ParticleSystem.create(RSX.explosion.plist);
      explosionParticles.setPosition(this._mouseOverGem.getPosition());
      explosionParticles.setAutoRemoveOnFinish(true);
      this.innerLayer.addChild(explosionParticles);

      // show card
      const index = this.coreGemNodes.indexOf(this._mouseOverGem);
      const cardId = this._mouseOverGem.getCardId();
      let cardCount = 1;
      if (this._cardCountsById != null) {
        cardCount = this._cardCountsById[cardId] || 1;
      }
      this._whenMostRecentShowCardReveal = this._showCardReveal(cardId, index, this._mouseOverGem.getPosition(), cardCount);

      // destroy gem
      // this.coreGemNodes = _.without(this.coreGemNodes,this._mouseOverGem)
      this._mouseOverGem.destroy();
      this._mouseOverGem = null;
    }

    if (!this._unlocked && this.coreGemNodes.length > 0 && this.coreGemNodes.length == this.cardNodes.length) {
      if (!this._whenMostRecentShowCardReveal) {
        this._whenMostRecentShowCardReveal = Promise.resolve();
      }
      this._unlocked = true;
      this._whenMostRecentShowCardReveal.then(() => {
        this.continueNode.setVisible(true);
        this.continueNode.setOpacity(0);
        this.continueNode.runAction(cc.fadeIn(0.2));
      });
    } else if (!this._unlocking && this._unlocked && this.coreGemNodes.length > 0) { // reset when pointer clicked anywhere
      if (this._whenMostRecentShowCardReveal && !this._whenMostRecentShowCardReveal.isFulfilled()) {
        return;
      }
      if (this._whenRevealResolve != null) {
        this._whenRevealResolve();
        this._whenRevealResolve = null;
      }
      this.showResetPack();
    }
  },

  /* endregion EVENTS */

  /* region PACK OPENING */

  showEnergyBall() {
    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated/unloaded

      const winCenterPosition = UtilsEngine.getGSIWinCenterPosition();

      this.energyBall.stopActionByTag(CONFIG.FADE_TAG);
      const fadeAction = cc.fadeIn(0.1);
      fadeAction.setTag(CONFIG.FADE_TAG);
      this.energyBall.runAction(fadeAction);
      this.energyBallParticles.resetSystem();

      this.turbine.stopRotating();
      this.centerRing.stopRotating();
      this.turbine.startRotating(10.0, 360);
      this.centerRing.startRotating(5.0, -360);

      // bloom out
      this.runAction(cc.actionTween(0.2, TweenTypes.BLOOM_INTENSITY, 0.0, this._bloomIntensity + 1.0).easing(cc.easeExponentialOut()));

      // unlock plates
      this.topRedPlateBottom.runAction(cc.sequence(
        cc.delayTime(0.1),
        cc.spawn(
          cc.fadeIn(0.1),
          cc.moveTo(0.5, cc.p(winCenterPosition.x, winCenterPosition.y - 50)).easing(cc.easeExponentialOut()),
        ),
      ));
      this.topRedPlateLeft.runAction(cc.sequence(
        cc.delayTime(0.2),
        cc.spawn(
          cc.fadeIn(0.1),
          cc.moveTo(0.5, cc.p(winCenterPosition.x - 50, winCenterPosition.y + 50)).easing(cc.easeExponentialOut()),
        ),
      ));
      this.topRedPlateRight.runAction(cc.sequence(
        cc.delayTime(0.3),
        cc.spawn(
          cc.fadeIn(0.1),
          cc.moveTo(0.5, cc.p(winCenterPosition.x + 50, winCenterPosition.y + 50)).easing(cc.easeExponentialOut()),
        ),
      ));
    });
  },

  showResetPack() {
    this._resetPack();

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated/unloaded

      this.continueNode.setVisible(false);

      this.turbine.startRotating(30.0, 360);
      this.centerRing.startRotating(30.0, -360);

      const fadeDuration = 0.1;

      // this.energyBall.stopActionByTag(CONFIG.FADE_TAG);
      // var fadeAction = cc.fadeOut(fadeDuration);
      // fadeAction.setTag(CONFIG.FADE_TAG);
      // this.energyBall.runAction(fadeAction);
      // this.energyBallParticles.stopSystem();

      this.vignette.stopActionByTag(CONFIG.FADE_TAG);
      const fadeAction = cc.fadeTo(fadeDuration, 0);
      fadeAction.setTag(CONFIG.FADE_TAG);
      this.vignette.runAction(fadeAction);

      this.blurredOverlay.stopActionByTag(CONFIG.FADE_TAG);
      const fadeAction2 = cc.fadeTo(fadeDuration, 0);
      fadeAction2.setTag(CONFIG.FADE_TAG);
      this.blurredOverlay.runAction(fadeAction2);

      this.runAction(cc.actionTween(fadeDuration, TweenTypes.BLOOM_INTENSITY, this._bloomIntensity, 0.0));
    });
  },

  _resetPack() {
    this.cardNodes = [];
    this.coreGemNodes = [];

    this._whenRevealResolve = null;
    this._unlocking = false;
    this._unlocked = false;
    this._opened = false;

    this.innerLayer.removeAllChildren();
    this.outerLayer.removeAllChildren();
  },

  /**
   * Shows pack looping animation for unlock and returns a promise that resolves when all animations have played out.
   */
  showUnlockPack() {
    return new Promise((resolve, reject) => {
      // reset and set as unlocking until finished
      this._resetPack();
      this._unlocking = true;

      this.whenRequiredResourcesReady().then((requestId) => {
        if (!this.getAreResourcesValid(requestId)) return; // resources invalidated/unloaded

        const fadeDuration = 0.8;
        const winCenterPosition = UtilsEngine.getGSIWinCenterPosition();

        // assemble motion streaks
        const motionStreakRing = new MotionStreakRingNode();
        this.innerLayer.addChild(motionStreakRing);
        motionStreakRing.animate();

        // play inward line particles
        this.lines_particles = BaseParticleSystem.create(RSX.ptcl_lines_towards_ring.plist);
        this.lines_particles.setPosition(0, 0);
        this.lines_particles.setDirectionAligned(true);
        this.lines_particles.setFadeInAtLifePct(0.1);
        this.lines_particles.setFadeOutAtLifePct(0.9);
        this.lines_particles.setStartSizeVar(40);
        this.lines_particles.setStartRadius(200);
        this.lines_particles.setStartRadiusVar(50);
        this.innerLayer.addChild(this.lines_particles);

        this.inward_particles = BaseParticleSystem.create(RSX.ptcl_spiral_assemble_for_booster.plist);
        this.inward_particles.setAnchorPoint(cc.p(0.5, 0.5));
        this.inward_particles.setPosition(0, 0);
        this.innerLayer.addChild(this.inward_particles);

        // fade background
        this.vignette.stopActionByTag(CONFIG.FADE_TAG);
        const fadeAction = cc.fadeTo(fadeDuration, 200);
        fadeAction.setTag(CONFIG.FADE_TAG);
        this.vignette.runAction(fadeAction);

        // lock plates
        // this.topRedPlateBottom.setPosition(cc.p(winCenterPosition.x, winCenterPosition.y - 100))
        // this.topRedPlateBottom.setOpacity(0)
        this.topRedPlateBottom.runAction(cc.sequence(
          cc.delayTime(0.1),
          cc.spawn(
            cc.fadeIn(0.1),
            cc.moveTo(0.5, winCenterPosition).easing(cc.easeExponentialOut()),
          ),
        ));
        // this.topRedPlateLeft.setPosition(cc.p(winCenterPosition.x - 100, winCenterPosition.y + 100))
        // this.topRedPlateLeft.setOpacity(0)
        this.topRedPlateLeft.runAction(cc.sequence(
          cc.delayTime(0.2),
          cc.spawn(
            cc.fadeIn(0.1),
            cc.moveTo(0.5, winCenterPosition).easing(cc.easeExponentialOut()),
          ),
        ));
        // this.topRedPlateBottom.setOpacity(0)
        // this.topRedPlateBottom.setPosition(cc.p(winCenterPosition.x + 100, winCenterPosition.y + 100))
        this.topRedPlateRight.runAction(cc.sequence(
          cc.delayTime(0.3),
          cc.spawn(
            cc.fadeIn(0.1),
            cc.moveTo(0.5, winCenterPosition).easing(cc.easeExponentialOut()),
          ),
        ));

        // animate global tone curve using scene
        this.getScene().runAction(ToneCurve.create(fadeDuration, 0.0, 1.0));

        // delay for fade duration and then resolve
        this.runAction(cc.sequence(
          cc.delayTime(fadeDuration),
          cc.callFunc(resolve),
        ));
      });
    });
  },

  /**
   * Shows pack unlocking and returns a promise that resolves when all cards have been revealed.
   * @param cardIds
   * @returns {Promise}
   */
  showRevealPack(cardIds) {
    const revealPromise = new Promise((resolve, reject) => {
      this._whenRevealResolve = resolve;

      this.whenRequiredResourcesReady().then((requestId) => {
        if (!this.getAreResourcesValid(requestId)) return; // resources invalidated/unloaded

        // randomize pack before showing
        this._cardCountsById = _.countBy(cardIds, (cardId) => cardId);
        cardIds = _.unique(cardIds);
        cardIds = _.sample(cardIds, cardIds.length);

        // Must come after the unique above
        this._cardCount = cardIds.length;

        // flare
        const flare = FXLensFlareSprite.create();
        flare.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
        flare.setScale(2.0);
        flare.setPulseRate(0.0);
        flare.setSpeed(2.0);
        flare.setWispSize(0.2);
        flare.setAnchorPoint(cc.p(0.5, 0.5));
        this.innerLayer.addChild(flare);

        // second energy ball
        const energyBall2 = FXEnergyBall.create();
        energyBall2.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
        energyBall2.setScale(4.0);
        energyBall2.setTimeScale(5.0);
        energyBall2.setNoiseLevel(15.0);
        energyBall2.setAnchorPoint(cc.p(0.5, 0.5));
        // energyBall2.runAction(cc.actionTween(1.0, "noiseLevel", 1.0, 2.0));
        // energyBall2.runAction(cc.actionTween(1.0, "timeScale", 1.0, 2.0));
        this.innerLayer.addChild(energyBall2);

        const fireRing = FXFireRing.create();
        fireRing.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
        fireRing.setAnchorPoint(cc.p(0.5, 0.5));
        fireRing.setPosition(0, 0);
        fireRing.setScale(11.0);
        fireRing.setVisible(false);
        this.innerLayer.addChild(fireRing);

        // set energy ball opacity to 255
        this.energyBall.setOpacity(255);

        // fade second energy ball in
        energyBall2.runAction(cc.fadeIn(0.2));

        // power up flare
        flare.runAction(cc.scaleTo(0.8, 8.0));

        // bloom down to baseline
        this.runAction(cc.actionTween(0.3, TweenTypes.BLOOM_INTENSITY, this._bloomIntensity + 1.0, this._bloomIntensity).easing(cc.easeExponentialOut()));

        // play explode sfx
        audio_engine.current().play_effect(RSX.sfx_ui_booster_packexplode.audio);

        // extend flare and continue sequence
        flare.runAction(cc.sequence(
          cc.actionTween(0.8, 'armLength', 0.0, 1.0),
          cc.callFunc(() => {
            this.turbine.stopRotating();
            this.centerRing.stopRotating();

            this.getFXLayer().runAction(cc.sequence(
              Shake.create(0.5, 5.0, cc.p(0, 0)),
            ));

            this.vignette.stopActionByTag(CONFIG.FADE_TAG);
            const fadeAction = cc.sequence(
              cc.fadeTo(0.2, 100),
              cc.fadeTo(0.5, 200),
            );
            fadeAction.setTag(CONFIG.FADE_TAG);
            this.vignette.runAction(fadeAction);

            this.blurredOverlay.stopActionByTag(CONFIG.FADE_TAG);
            const fadeAction2 = cc.sequence(
              cc.delayTime(0.7),
              cc.fadeIn(0.5),
            );
            fadeAction2.setTag(CONFIG.FADE_TAG);
            this.blurredOverlay.runAction(fadeAction2);

            this.lines_particles.destroy();
            this.inward_particles.destroy();

            // animate global tone curve using scene
            this.getScene().runAction(ToneCurve.create(0.2, 1.0, 0.0));

            fireRing.setVisible(true);
            fireRing.runAction(cc.sequence(
              cc.EaseExponentialOut.create(cc.actionTween(3.0, 'phase', 1.0, -0.25)),
              cc.callFunc(() => {
                fireRing.destroy();
              }),
            ));

            this.energyBallParticles.stopSystem();
            this.energyBall.runAction(cc.fadeOut(0.1));
            energyBall2.destroy();

            const explosionParticles = cc.ParticleSystem.create(RSX.explosion.plist);
            explosionParticles.setAnchorPoint(cc.p(0.5, 0.5));
            this.innerLayer.addChild(explosionParticles);

            // reveal each card in the pack
            const unlockCardPromises = [];
            for (let i = 0; i < cardIds.length; i++) {
              unlockCardPromises.push(this._showCardMoveAndReveal(cardIds[i], i));
            }

            // when all cards revealed
            Promise.all(unlockCardPromises).then(() => {
              this._unlocking = false;
              this._opened = true;
              resolve();
            }).catch((error) => {
              console.error(error);
              throw error;
            });
          }),
          cc.fadeOut(0.1),
        ));
      });
    });

    return revealPromise;
  },

  /**
   * Shows a card unlocking and returns a promise that resolves when the card has been revealed.
   * @param cardId
   * @param index
   * @returns {Promise}
   */
  _showCardMoveAndReveal(cardId, index) {
    return new Promise((resolve, reject) => {
      const cardDisc = BaseSprite.create(RSX.booster_glowing_disc.img);
      cardDisc.setAnchorPoint(cc.p(0.5, 0.5));
      this.innerLayer.addChild(cardDisc);

      const particles = cc.ParticleSystem.create(RSX.booster_pack_center_particles.plist);
      // var particles = new BaseParticleSystem(RSX.booster_pack_center_particles.plist,{
      //   plistFile: RSX.booster_pack_center_particles.plist,
      //   type: "Particles",
      //   fadeInAtLifePct:0.05,
      //   positionType:cc.ParticleSystem.TYPE_FREE
      // });
      particles.setAnchorPoint(cc.p(0.5, 0.5));
      this.innerLayer.addChild(particles);

      const angle = index * Math.PI / (this._cardCount / 2.0);
      const sourceScreenPosition = cc.p(this.radius * Math.cos(angle), this.radius * Math.sin(angle));
      const maxDuration = 1.5;
      const duration = maxDuration / 2 + maxDuration / 2 * Math.random();
      const delayScaleDown = maxDuration - duration - 1.0;

      // core gem will be initialized during animation
      let coreGem = new CoreGemNode(cardId);
      coreGem.setVisible(false);

      // custom back easing with heavy overshoot
      const customEaseBackOut = {
        easing(time1) {
          const overshoot = 3.70158;
          time1 -= 1;
          return time1 * time1 * ((overshoot + 1) * time1 + overshoot) + 1;
        },
      };

      // get reveal parameters
      const cardContentSize = cc.size(226, 296);
      const cardLayout = this._getLayout();
      const targetScreenPosition = cc.p(
        cardLayout.positionsByIndex[index].x * cardContentSize.width + cardLayout.spacingByIndex[index].x,
        cardLayout.positionsByIndex[index].y * cardContentSize.height + cardLayout.spacingByIndex[index].y,
      );

      // move particles
      particles.runAction(cc.moveTo(duration, sourceScreenPosition).easing(cc.easeBackOut())); // cc.easeExponentialOut()

      // move disc
      cardDisc.runAction(cc.sequence(
        cc.moveTo(duration, sourceScreenPosition).easing(cc.easeBackOut()),
        // cc.delayTime(delayScaleDown),
        cc.callFunc(function () {
          this.stopSystem();
        }.bind(particles)),
        cc.scaleTo(0.4, 0.25).easing(cc.easeExponentialOut()),
        cc.callFunc(() => {
          // zodiac symbol that animates from a single point out
          const zodiac = new ZodiacNode({
            width: 80,
            height: 80,
            lineWidth: 1,
            duration: 1.0,
          });
          zodiac.setAnchorPoint(cc.p(0.5, 0.5));
          zodiac.setPosition(cc.p(
            cardDisc.getPosition().x - 40,
            cardDisc.getPosition().y - 40,
          ));
          this.innerLayer.addChild(zodiac);

          // energy particles
          const particles = cc.ParticleSystem.create(RSX.zodiac_appear_001.plist);
          particles.setAnchorPoint(cc.p(0.5, 0.5));
          particles.setPosition(cardDisc.getPosition());
          this.innerLayer.addChild(particles);

          // zodiac fragment particles
          const particles2 = cc.ParticleSystem.create(RSX.zodiac_appear_002.plist);
          particles2.setAnchorPoint(cc.p(0.5, 0.5));
          particles2.setPosition(cardDisc.getPosition());
          this.innerLayer.addChild(particles2);

          cardDisc.zodiac = zodiac;
        }),
        cc.fadeOut(0.1),
        cc.callFunc(() => {
          // construct core gem
          coreGem = new CoreGemNode(cardId);
          coreGem.fadeOutReticle(0.0);
          coreGem.setVisible(true);
          coreGem.setPosition(cardDisc.getPosition());
          this.innerLayer.addChild(coreGem);
          coreGem.transitionIn();
          this.coreGemNodes.push(coreGem);
          // destroy card zodiac
          cardDisc.zodiac.destroy();
          cardDisc.setVisible(false);
        }),
        cc.delayTime((index + 1) * 0.1),
        cc.callFunc(() => {
          const moveToFinalAction = cc.moveTo(0.4, targetScreenPosition).easing(cc.easeExponentialInOut());
          coreGem.runAction(moveToFinalAction);
        }),
        cc.delayTime(0.4),
        cc.callFunc(() => {
          coreGem.fadeInReticle(0.5);
          // destroy card disc
          cardDisc.destroy();
          resolve();
        }),
      ));
    });
  },

  /**
   * Shows a card revealing and returns a promise that resolves when the card has been revealed.
   * @param cardId
   * @param index
   * @param sourceScreenPosition
   * @returns {Promise}
   */
  _showCardReveal(cardId, index, sourceScreenPosition, cardCount) {
    if (cardCount == null) { cardCount = 1; }

    // create empty card
    const cardNode = CardNode.create();
    this.cardNodes.push(cardNode);
    this.outerLayer.addChild(cardNode);

    // // get reveal parameters
    // var cardContentSize = cardNode.getCardBackgroundContentSize();
    // var targetScreenPosition = cc.p(
    //   this.positionsByIndex[index].x * cardContentSize.width + this.spacingByIndex[index].x,
    //   this.positionsByIndex[index].y * cardContentSize.height + this.spacingByIndex[index].y
    // );
    // var moveDelay = CONFIG.FADE_FAST_DURATION + (2.0 - (index/2.0));

    // play reveal sound
    audio_engine.current().play_effect(RSX[`sfx_loot_crate_card_reward_reveal_${index}`].audio, false);

    // show card reveal
    const sdkCard = SDK.CardFactory.cardForIdentifier(cardId, SDK.GameSession.getInstance());
    const showRevealPromise = cardNode.showReveal(sdkCard, sourceScreenPosition, null, 0.0);

    if (cardCount > 1) {
      showRevealPromise
        .bind(cardNode)
        .then(function () {
          this.showStack(CONFIG.ANIMATE_FAST_DURATION, cardCount - 1, null, cc.p(0, -17), 10);
        });
    }

    return showRevealPromise;
  },

  _getLayout() {
    // Defaults to a 5 card layout
    if (this._cardCount == null || this.layoutsByCount[this._cardCount] == null) {
      return this.layoutsByCount[5];
    }

    return this.layoutsByCount[this._cardCount];
  },

  /* endregion PACK OPENING */

  updateTweenAction(value, key) {
    if (key === TweenTypes.BLOOM_INTENSITY) {
      const fx = this.getFX();
      fx.setBloomIntensity(value);
    }
  },

});

BoosterPackOpeningLayer.create = function (layer) {
  return FXCompositeLayer.create(layer || new BoosterPackOpeningLayer());
};

module.exports = BoosterPackOpeningLayer;
