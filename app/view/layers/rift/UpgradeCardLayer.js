// pragma PKGS: rift

const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const Promise = require('bluebird');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const UtilsEngine = require('app/common/utils/utils_engine');
const audio_engine = require('app/audio/audio_engine');
const BaseLayer = require('app/view/layers/BaseLayer');
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
const ConfirmDialogItemView = require('app/ui/views/item/confirm_dialog');
const i18next = require('i18next');
const RiftHelper = require('app/sdk/rift/riftHelper');
const ErrorDialogItemView = require('app/ui/views/item/error_dialog');
const InventoryManager = require('app/ui/managers/inventory_manager');
const EVENTS = require('../../../common/event_types');

/** **************************************************************************
 UpgradeCardLayer
 *************************************************************************** */

const UpgradeCardLayer = BaseLayer.extend({

  delegate: null,

  _mouseOverCard: null,
  _mouseOverGem: null,
  _unlocking: false,
  _unlocked: false,
  _opened: false,
  _whenMostRecentShowCardReveal: null,
  _whenRevealResolve: null,
  _cardCountsById: null,
  _cardCount: null,
  _spiritCostForNextReroll: null,

  // radius/positions/spacing for cards
  radius: 215,
  layoutsByCount: {
    3: {
      positionsByIndex: [
        cc.p(1, 0.0), cc.p(0, 0.0), cc.p(-1, 0.0),
      ],
      spacingByIndex: [
        cc.p(20.0, 30.0), cc.p(0, 30.0), cc.p(-20.0, 30.0),
      ],
    },
    6: {
      positionsByIndex: [
        cc.p(1, 0.5), cc.p(0, 0.5), cc.p(-1, 0.5),
        cc.p(1, -0.5), cc.p(0, -0.5), cc.p(-1, -0.5),
      ],
      spacingByIndex: [
        cc.p(20.0, 30.0), cc.p(0, 30.0), cc.p(-20.0, 30.0),
        cc.p(20.0, 30.0), cc.p(0, 30.0), cc.p(-20.0, 30.0),
      ],
    },
  },

  continueNode: null,
  innerLayer: null,
  outerLayer: null,
  cardNodes: null,
  coreGemNodes: null,
  doneButton: null,
  fireRing: null,
  vignette: null,
  blurredOverlay: null,
  storeUpgradeButton: null,
  rerollUpgradeButton: null,
  _mouseOverButton: null,
  _selectedCard: null,
  _selectedStoreUpgrade: null,
  _selectedRerollUpgrade: null,

  ctor() {
    // initialize properties that may be required in init
    this.cardNodes = [];
    this.coreGemNodes = [];
    this._selectedCard = null;
    this._selectedStoreUpgrade = false;
    this._selectedRerollUpgrade = false;

    // layers
    this.innerLayer = BaseLayer.create();
    this.outerLayer = BaseLayer.create();

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated/unloaded

      // vignette image
      this.vignette = BaseSprite.create(RSX.booster_opening_vignette.img);
      this.vignette.setAnchorPoint(cc.p(0.5, 0.5));
      this.vignette.setOpacity(0);

      // continue instruction label
      this.continueNode = new cc.LabelTTF(i18next.t('rift.select_a_new_card_message'), RSX.font_light.name, 18, cc.size(1200, 24), cc.TEXT_ALIGNMENT_CENTER);
      this.continueNode.setAnchorPoint(cc.p(0.5, 0));
      this.continueNode.setLocalZOrder(999);
      this.continueNode.setOpacity(0.0);
      this.continueNode.setVisible(false);

      // Store upgrade button
      const confirmButtonSprite = new ccui.Scale9Sprite(RSX.button_confirm.img);
      const confirmButtonGlowSprite = new ccui.Scale9Sprite(RSX.button_confirm_glow.img);
      this.storeUpgradeButton = new cc.ControlButton(i18next.t('rift.save_upgrade_button_label'), confirmButtonSprite, 48);
      this.storeUpgradeButton.setPreferredSize(confirmButtonSprite.getContentSize());
      this.storeUpgradeButton.setAdjustBackgroundImage(false);
      this.storeUpgradeButton.setZoomOnTouchDown(false);
      this.storeUpgradeButton.setTitleTTFForState(RSX.font_bold.name, cc.CONTROL_STATE_NORMAL);
      this.storeUpgradeButton.setBackgroundSpriteForState(confirmButtonSprite, cc.CONTROL_STATE_NORMAL);
      this.storeUpgradeButton.setBackgroundSpriteForState(confirmButtonGlowSprite, cc.CONTROL_STATE_HIGHLIGHTED);
      this.storeUpgradeButton.setTitleColorForState(cc.color(255, 255, 255), cc.CONTROL_STATE_NORMAL);
      this.storeUpgradeButton.setPosition(100, -310);
      this.storeUpgradeButton.setOpacity(0);

      // Reroll upgrade button
      const confirmRerollButtonSprite = new ccui.Scale9Sprite(RSX.button_confirm.img);
      const confirmRerollButtonGlowSprite = new ccui.Scale9Sprite(RSX.button_confirm_glow.img);
      this.rerollUpgradeButton = new cc.ControlButton('REROLL UPGRADE', confirmRerollButtonSprite, 48);
      this.rerollUpgradeButton.setPreferredSize(confirmButtonSprite.getContentSize());
      this.rerollUpgradeButton.setAdjustBackgroundImage(false);
      this.rerollUpgradeButton.setZoomOnTouchDown(false);
      this.rerollUpgradeButton.setTitleTTFForState(RSX.font_bold.name, cc.CONTROL_STATE_NORMAL);
      this.rerollUpgradeButton.setBackgroundSpriteForState(confirmRerollButtonSprite, cc.CONTROL_STATE_NORMAL);
      this.rerollUpgradeButton.setBackgroundSpriteForState(confirmRerollButtonGlowSprite, cc.CONTROL_STATE_HIGHLIGHTED);
      this.rerollUpgradeButton.setTitleColorForState(cc.color(255, 255, 255), cc.CONTROL_STATE_NORMAL);
      this.rerollUpgradeButton.setPosition(-100, -310);
      this.rerollUpgradeButton.setOpacity(0);

      // this.innerLayer.addChild(this.storeUpgradeButton);
      // this.addChild(this.storeUpgradeButton);

      // add children after ctor
      this.addChild(this.vignette);
      this.addChild(this.innerLayer);
      this.addChild(this.outerLayer);
      this.addChild(this.continueNode);
    });

    // super constructor last to ensure elements get created before doing anything else
    this._super();
  },

  getRequiredResources() {
    return BaseLayer.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier('rift'));
  },

  /* region LAYOUT */

  onResize() {
    BaseLayer.prototype.onResize.apply(this, arguments);

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated/unloaded

      const winCenterPosition = UtilsEngine.getGSIWinCenterPosition();

      if (this.innerLayer != null) {
        this.innerLayer.setPosition(winCenterPosition);
      }
      if (this.outerLayer != null) {
        this.outerLayer.setPosition(winCenterPosition);
      }

      this.vignette.setScale(UtilsEngine.getWindowSizeRelativeNodeScale(this.vignette));
      this.vignette.setPosition(winCenterPosition);

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
  },

  onExit() {
    this._super();
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

    let mouseOverButton;
    if (location) {
      if (this.storeUpgradeButton instanceof cc.ControlButton && this.storeUpgradeButton.isEnabled() && UtilsEngine.getNodeUnderMouse(this.storeUpgradeButton, location.x, location.y)) {
        mouseOverButton = this.storeUpgradeButton;
      } else if (this.rerollUpgradeButton instanceof cc.ControlButton && this.rerollUpgradeButton.isEnabled() && UtilsEngine.getNodeUnderMouse(this.rerollUpgradeButton, location.x, location.y)) {
        mouseOverButton = this.rerollUpgradeButton;
      }
    }

    if (this._mouseOverButton != mouseOverButton) {
      this.resetMouseOverButton();

      this._mouseOverButton = mouseOverButton;

      if (this._mouseOverButton != null) {
        this.onHoverButton();
      }
    }
  },

  resetMouseOverButton() {
    if (this._mouseOverButton != null) {
      this._mouseOverButton.setHighlighted(false);
      this._mouseOverButton = null;
    }
  },

  onHoverButton() {
    if (this._mouseOverButton != null) {
      this._mouseOverButton.setHighlighted(true);
      audio_engine.current().play_effect(RSX.sfx_ui_menu_hover.audio);
    }
  },

  getHasMadeSelection() {
    return this._selectedCard != null || this._selectedStoreUpgrade == true || this._selectedRerollUpgrade == true;
  },

  onPointerUp(event) {
    if (event && event.isStopped) {
      return;
    }

    if (this._mouseOverCard && this._unlocked && !this.getHasMadeSelection()) {
      this._selectedCard = this._mouseOverCard;
      this.delegate.selectCard(this._mouseOverCard.sdkCard);
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
      // this.showResetPack();
    }

    if (this.storeUpgradeButton instanceof cc.ControlButton && this.storeUpgradeButton.isEnabled() && this._mouseOverButton == this.storeUpgradeButton && !this.getHasMadeSelection()) {
      this.onStoreUpgradePressed();
    }

    if (this.rerollUpgradeButton instanceof cc.ControlButton && this.rerollUpgradeButton.isEnabled() && this._mouseOverButton == this.rerollUpgradeButton && !this.getHasMadeSelection()) {
      this.onRerollUpgradePressed();
    }
  },

  onStoreUpgradePressed() {
    this._selectedStoreUpgrade = true;
    NavigationManager.getInstance().showDialogForConfirmation(i18next.t('rift.save_upgrade_confirmation_title'), i18next.t('rift.save_upgrade_confirmation_body'), i18next.t('common.confirm_button_label'))
      .then(() => {
        this.delegate.storeCurrentUpgradePack();
      }).catch(() => {
        this._selectedStoreUpgrade = false;
      });
  },

  onRerollUpgradePressed() {
    if (InventoryManager.getInstance().getWalletModelSpiritAmount() < this._spiritCostForNextReroll) {
      const spiritDifference = this._spiritCostForNextReroll - InventoryManager.getInstance().getWalletModelSpiritAmount();
      NavigationManager.getInstance().showDialogView(new ErrorDialogItemView({
        title: 'Insufficient Spirit',
        message: `You need ${spiritDifference} more spirit to reroll this upgrade.`,
      }));
    } else {
      this._selectedRerollUpgrade = true;
      NavigationManager.getInstance().showDialogForConfirmation('Reroll Upgrade', `Rerolling this upgrade will cost ${this._spiritCostForNextReroll} Spirit.  Are you sure you wish to do this?`, 'Confirm')
        .then(() => {
          this.delegate.rerollCurrentUpgradePack();
        }).catch(() => {
          this._selectedRerollUpgrade = false;
        });
    }
  },

  /* endregion EVENTS */

  /* region PACK OPENING */

  showResetPack() {
    this._resetPack();

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated/unloaded

      this.continueNode.setVisible(false);

      const fadeDuration = 0.1;

      this.vignette.stopActionByTag(CONFIG.FADE_TAG);
      const fadeAction = cc.fadeTo(fadeDuration, 0);
      fadeAction.setTag(CONFIG.FADE_TAG);
      this.vignette.runAction(fadeAction);

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
  showRevealPack(cardIds, upgradeStorageDisabled, currentUpgradeRerollCount, runTotalRerollCount) {
    if (upgradeStorageDisabled == null) {
      upgradeStorageDisabled = false;
    }
    if (currentUpgradeRerollCount == null) {
      currentUpgradeRerollCount = 0;
    }
    if (runTotalRerollCount == null) {
      runTotalRerollCount = 0;
    }

    this._spiritCostForNextReroll = RiftHelper.spiritCostForNextReroll(currentUpgradeRerollCount, runTotalRerollCount);

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

        if (upgradeStorageDisabled) {
          this.storeUpgradeButton.setEnabled(false);
        } else {
          this.innerLayer.addChild(this.storeUpgradeButton);
        }

        this.rerollUpgradeButton.setTitleForState(`REROLL (${this._spiritCostForNextReroll} SPIRIT)`, cc.CONTROL_STATE_NORMAL);
        this.innerLayer.addChild(this.rerollUpgradeButton);

        if (upgradeStorageDisabled) {
          this.rerollUpgradeButton.setPositionX(0);
        } else {
          this.rerollUpgradeButton.setPositionX(100);
          this.rerollUpgradeButton.setPositionX(-100);
        }

        // flare
        const flare = FXLensFlareSprite.create();
        flare.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
        flare.setScale(2.0);
        flare.setPulseRate(0.0);
        flare.setSpeed(2.0);
        flare.setWispSize(0.2);
        flare.setAnchorPoint(cc.p(0.5, 0.5));
        this.innerLayer.addChild(flare);

        const fireRing = FXFireRing.create();
        fireRing.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
        fireRing.setAnchorPoint(cc.p(0.5, 0.5));
        fireRing.setPosition(0, 0);
        fireRing.setScale(11.0);
        fireRing.setVisible(false);
        this.innerLayer.addChild(fireRing);

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
            this.runAction(cc.sequence(
              Shake.create(0.5, 5.0, cc.p(0, 0)),
            ));

            this.vignette.stopActionByTag(CONFIG.FADE_TAG);
            const fadeAction = cc.sequence(
              cc.fadeTo(0.2, 100),
              cc.fadeTo(0.5, 200),
            );
            fadeAction.setTag(CONFIG.FADE_TAG);
            this.vignette.runAction(fadeAction);

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

              this.storeUpgradeButton.runAction(cc.fadeIn(CONFIG.FADE_FAST_DURATION));
              this.rerollUpgradeButton.runAction(cc.fadeIn(CONFIG.FADE_FAST_DURATION));

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
    return new Promise((resolve, reject) => {
      this.runAction(cc.sequence(
        cc.fadeOut(CONFIG.FADE_FAST_DURATION),
        cc.callFunc(() => {
          resolve();
        }),
      ));
    });
  },

  /* endregion TRANSITION */
});

UpgradeCardLayer.create = function (layer) {
  return BaseLayer.create(layer || new UpgradeCardLayer());
};

module.exports = UpgradeCardLayer;
