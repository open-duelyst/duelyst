// pragma PKGS: booster_opening

const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const SDK = require('app/sdk');
const Promise = require('bluebird');
const Scene = require('app/view/Scene');
const Analytics = require('app/common/analytics');
const Animations = require('app/ui/views/animations');
const audio_engine = require('app/audio/audio_engine');
const BoosterPackOpeningLayer = require('app/view/layers/booster/BoosterPackOpeningLayer');
const TransitionRegion = require('app/ui/views/regions/transition');
const BoosterPackCollectionLayoutTemplate = require('app/ui/templates/layouts/booster_pack_collection.hbs');
const InventoryManager = require('app/ui/managers/inventory_manager');
const BoosterPacksCompositeView = require('app/ui/views/composite/booster_packs');
const ActivityDialogItemView = require('app/ui/views/item/activity_dialog');
const NavigationManager = require('app/ui/managers/navigation_manager');
const SoundEffectSequence = require('app/audio/SoundEffectSequence');
const ErrorDialogItemView = require('app/ui/views/item/error_dialog');
const ShopSpiritOrbsModalView = require('app/ui/views2/shop/shop_spirit_orbs_modal');

const BoosterPackCollectionLayout = Backbone.Marionette.LayoutView.extend({

  _resetPackPromise: null,
  _boosterPacksCompositeViews: null,
  _coreSetBoosterPacksCompositeView: null,
  _shimzarSetBoosterPacksCompositeView: null,
  _firstwatchSetBoosterPacksCompositeView: null,
  _wartechSetBoosterPacksCompositeView: null,
  _combinedUnlockablesSetBoosterPacksCompositeView: null,
  _fateSetBoosterPacksCompositeView: null,

  id: 'booster_pack_collection',

  template: BoosterPackCollectionLayoutTemplate,

  regions: {
    boosterPacksDispenserRegion: { selector: '.booster-packs-dispenser', regionClass: TransitionRegion },
    boosterPacksDispenserRegion2: { selector: '.booster-packs-dispenser-2', regionClass: TransitionRegion },
    boosterPacksDispenserRegion3: { selector: '.booster-packs-dispenser-3', regionClass: TransitionRegion },
    boosterPacksDispenserRegion4: { selector: '.booster-packs-dispenser-4', regionClass: TransitionRegion },
    boosterPacksDispenserRegion5: { selector: '.booster-packs-dispenser-5', regionClass: TransitionRegion },
    boosterPacksDispenserRegion6: { selector: '.booster-packs-dispenser-6', regionClass: TransitionRegion },
    boosterPacksDispenserRegion7: { selector: '.booster-packs-dispenser-7', regionClass: TransitionRegion },
    boosterPacksDispenserRegion8: { selector: '.booster-packs-dispenser-8', regionClass: TransitionRegion },
  },

  ui: {
    $boosterPacksControls: '.booster-packs-controls',
    $boosterPackUnlock: '.booster-pack-unlock',
    $boosterPacksDispenserRegion2: '.booster-packs-dispenser-2',
    $boosterPacksDispenserRegion3: '.booster-packs-dispenser-3',
    $boosterPacksDispenserRegion4: '.booster-packs-dispenser-4',
    $boosterPacksDispenserRegion5: '.booster-packs-dispenser-5',
    $boosterPacksDispenserRegion6: '.booster-packs-dispenser-6',
    $boosterPacksDispenserRegion7: '.booster-packs-dispenser-7',
    $boosterPacksDispenserRegion8: '.booster-packs-dispenser-8',
  },

  events: {
    'click .booster-buy': 'onClickBoosterBuy',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  _userNavLockId: 'BoosterCollectionUserNavLockId',
  _locked: false,
  _draggingBoosterPackEl: null,

  initialize() {
    this._boosterPacksCompositeViews = [];
    this._resetPackPromise = Promise.resolve();
  },

  getRequiredResources() {
    return Backbone.Marionette.LayoutView.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier('booster_opening'));
  },

  onShow() {
    // analytics call
    Analytics.page('Booster Packs', { path: '/#booster_packs' });

    this._coreSetBoosterPacksCompositeView = new BoosterPacksCompositeView({ model: new Backbone.Model({ cardSet: SDK.CardSet.Core }), collection: new Backbone.Collection() });
    this._boosterPacksCompositeViews.push(this._coreSetBoosterPacksCompositeView);
    this.boosterPacksDispenserRegion.show(this._coreSetBoosterPacksCompositeView);

    this._shimzarSetBoosterPacksCompositeView = new BoosterPacksCompositeView({ model: new Backbone.Model({ cardSet: SDK.CardSet.Shimzar }), collection: new Backbone.Collection() });
    this._boosterPacksCompositeViews.push(this._shimzarSetBoosterPacksCompositeView);
    this.boosterPacksDispenserRegion2.show(this._shimzarSetBoosterPacksCompositeView);

    // TODO: reorder indexes

    this._firstwatchSetBoosterPacksCompositeView = new BoosterPacksCompositeView({ model: new Backbone.Model({ cardSet: SDK.CardSet.FirstWatch }), collection: new Backbone.Collection() });
    this._boosterPacksCompositeViews.push(this._firstwatchSetBoosterPacksCompositeView);
    this.boosterPacksDispenserRegion5.show(this._firstwatchSetBoosterPacksCompositeView);

    this._wartechSetBoosterPacksCompositeView = new BoosterPacksCompositeView({ model: new Backbone.Model({ cardSet: SDK.CardSet.Wartech }), collection: new Backbone.Collection() });
    this._boosterPacksCompositeViews.push(this._wartechSetBoosterPacksCompositeView);
    this.boosterPacksDispenserRegion6.show(this._wartechSetBoosterPacksCompositeView);

    this._combinedUnlockablesSetBoosterPacksCompositeView = new BoosterPacksCompositeView({ model: new Backbone.Model({ cardSet: SDK.CardSet.CombinedUnlockables }), collection: new Backbone.Collection() });
    this._boosterPacksCompositeViews.push(this._combinedUnlockablesSetBoosterPacksCompositeView);
    this.boosterPacksDispenserRegion7.show(this._combinedUnlockablesSetBoosterPacksCompositeView);

    this._fateSetBoosterPacksCompositeView = new BoosterPacksCompositeView({ model: new Backbone.Model({ cardSet: SDK.CardSet.Coreshatter }), collection: new Backbone.Collection() });
    this._boosterPacksCompositeViews.push(this._fateSetBoosterPacksCompositeView);
    this.boosterPacksDispenserRegion8.show(this._fateSetBoosterPacksCompositeView);

    this.listenTo(InventoryManager.getInstance().boosterPacksCollection, 'add remove', this.onBoosterPacksCollectionChanged);
    this.onBoosterPacksCollectionChanged();

    this.setLocked(true);

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated/unloaded

      this.ui.$boosterPackUnlock.droppable({
        activate: this.onBoosterPackStartDragging.bind(this),
        deactivate: this.onBoosterPackStopDragging.bind(this),
        out: this.onBoosterPackOut.bind(this),
        over: this.onBoosterPackOver.bind(this),
        drop: this.onBoosterPackDropped.bind(this),
      });

      this.setLocked(false);
    });
  },

  onDestroy() {
    // always unlock user navigation
    NavigationManager.getInstance().requestUserTriggeredNavigationUnlocked(this._userNavLockId);

    this._coreSetBoosterPacksCompositeView = null;

    if (this._unlockedBoosterPackEl != null) {
      this._unlockedBoosterPackEl.velocity('stop');
      this._unlockedBoosterPackEl = null;
    }
  },

  setLocked(val) {
    if (this._locked !== val) {
      this._locked = val;
      this._updateBoosterPacksControls();
      for (let i = 0, il = this._boosterPacksCompositeViews.length; i < il; i++) {
        const boosterPackCompositeView = this._boosterPacksCompositeViews[i];
        boosterPackCompositeView.setLocked(val);
      }
    }
  },

  _updateBoosterPacksControls() {
    if (this._locked) {
      this.ui.$boosterPacksControls.removeClass('active');
    } else {
      this.ui.$boosterPacksControls.addClass('active');
    }
  },

  onBoosterPacksCollectionChanged() {
    if (InventoryManager.getInstance().getBoosterPacksBySet(SDK.CardSet.Shimzar) == 0) {
      this.ui.$boosterPacksDispenserRegion2.addClass('hide');
    } else {
      this.ui.$boosterPacksDispenserRegion2.removeClass('hide');
    }
    if (InventoryManager.getInstance().getBoosterPacksBySet(SDK.CardSet.FirstWatch) == 0) {
      this.ui.$boosterPacksDispenserRegion5.addClass('hide');
    } else {
      this.ui.$boosterPacksDispenserRegion5.removeClass('hide');
    }
    if (InventoryManager.getInstance().getBoosterPacksBySet(SDK.CardSet.Wartech) == 0) {
      this.ui.$boosterPacksDispenserRegion6.addClass('hide');
    } else {
      this.ui.$boosterPacksDispenserRegion6.removeClass('hide');
    }
    if (InventoryManager.getInstance().getBoosterPacksBySet(SDK.CardSet.CombinedUnlockables) == 0) {
      this.ui.$boosterPacksDispenserRegion7.addClass('hide');
    } else {
      this.ui.$boosterPacksDispenserRegion7.removeClass('hide');
    }
  },

  onBoosterPackStartDragging(e, ui) {
    if (!this._locked && this._draggingBoosterPackEl == null) {
      Logger.module('UI').log('BoosterPackCollectionLayout::onBoosterPackStartDragging');
      const boosterPack = ui.draggable;
      this._draggingBoosterPackEl = boosterPack;
      this._draggingBoosterPackEl.addClass('booster-pack-dragging');
      this.ui.$boosterPackUnlock.addClass('booster-pack-dragging');

      // reset visuals
      const scene = Scene.getInstance();
      const boosterLayer = scene && scene.getContent();
      if (boosterLayer instanceof BoosterPackOpeningLayer) {
        boosterLayer.showResetPack();
        boosterLayer.showEnergyBall();
      }

      // sfx sequence
      if (this._sfxSequence != null) {
        this._sfxSequence.stop();
        this._sfxSequence = null;
      }
      this._sfxSequence = new SoundEffectSequence();
      this._sfxSequence.addSoundEffect(RSX.sfx_ui_booster_huming_head.audio);
      this._sfxSequence.addSoundEffect(RSX.sfx_ui_booster_humming_loop.audio, true);
      this._sfxSequence.play();
    }
  },

  onBoosterPackStopDragging(e, ui) {
    const boosterPack = ui.draggable;
    if (!this._locked || this._draggingBoosterPackEl === boosterPack) {
      Logger.module('UI').log('BoosterPackCollectionLayout::onBoosterPackStopDragging');
      this._draggingBoosterPackEl.removeClass('booster-pack-dragging');
      this._draggingBoosterPackEl = null;
      this.ui.$boosterPackUnlock.removeClass('booster-pack-dragging');

      // end the sequence
      if (this._sfxSequence != null) {
        this._sfxSequence.stop();
        this._sfxSequence = null;
      }

      // play humming tail
      audio_engine.current().play_effect(RSX.sfx_ui_booster_huming_tail.audio);
    }
  },

  onBoosterPackOver(e, ui) {
    const boosterPack = ui.draggable;
    if (!this._locked || this._draggingBoosterPackEl === boosterPack) {
      Logger.module('UI').log('BoosterPackCollectionLayout::onBoosterPackOver');
      this._draggingBoosterPackEl.addClass('booster-pack-over');
      this.ui.$boosterPackUnlock.addClass('booster-pack-over');
    }
  },

  onBoosterPackOut(e, ui) {
    const boosterPack = ui.draggable;
    if (!this._locked || this._draggingBoosterPackEl === boosterPack) {
      Logger.module('UI').log('BoosterPackCollectionLayout::onBoosterPackOut');
      this._draggingBoosterPackEl.removeClass('booster-pack-over');
      this.ui.$boosterPackUnlock.removeClass('booster-pack-over');
    }
  },

  onBoosterPackDropped(e, ui) {
    const boosterPack = ui.draggable;
    if (!this._locked || this._draggingBoosterPackEl === boosterPack) {
      Logger.module('UI').log('BoosterPackCollectionLayout::onBoosterPackDropped');
      this._unlockedBoosterPackEl = this._draggingBoosterPackEl;
      const boosterPackId = this._unlockedBoosterPackEl.attr('id');

      this._unlockedBoosterPackEl.removeClass('booster-pack-over').addClass('booster-pack-unlocked');
      this.ui.$boosterPackUnlock.removeClass('booster-pack-over').addClass('booster-pack-unlocked');

      // lock booster packs and navigation
      NavigationManager.getInstance().requestUserTriggeredNavigationLocked(this._userNavLockId);
      this.setLocked(true);

      // unlock pack immediately
      let unlockedBoosterPackCards;
      const requestUnlockPromise = InventoryManager.getInstance().unlockBoosterPack(boosterPackId)
        .bind(this)
        .then((response) => {
          const unlockedBoosterPackModel = new Backbone.Model(response);
          unlockedBoosterPackCards = unlockedBoosterPackModel.get('cards');
        })
        .catch((errorMessage) => {
          EventBus.getInstance().trigger(EVENTS.ajax_error, errorMessage);
        });

      // show pre-unlock immediately
      let animateUnlockPromise;
      const scene = Scene.getInstance();
      const boosterLayer = scene && scene.getContent();
      if (boosterLayer instanceof BoosterPackOpeningLayer) {
        animateUnlockPromise = boosterLayer.showUnlockPack();
      } else {
        animateUnlockPromise = Promise.resolve();
      }

      // animate pack immediately
      if (this._unlockedBoosterPackEl.draggable('instance') != null) {
        this._unlockedBoosterPackEl.draggable('option', 'revert', false).draggable('disable');
      }
      const droppable = this.ui.$boosterPackUnlock;
      const droppableOffset = droppable.offset();
      const boosterPackOffset = this._unlockedBoosterPackEl.offset();
      const sourceX = boosterPackOffset.left;
      const sourceY = boosterPackOffset.top;
      const targetX = droppableOffset.left + (droppable.outerWidth(true) - this._unlockedBoosterPackEl.width()) * 0.5 - this.ui.$boosterPacksControls.outerWidth();
      const targetY = droppableOffset.top + (droppable.outerHeight(true) - this._unlockedBoosterPackEl.height()) * 0.5;
      const deltaX = targetX - sourceX;
      const deltaY = targetY - sourceY;
      const scaleOffset = 0.25;
      let currentScale = 1.0;
      const shakeMagnitude = 10.0;
      const animatePackPromise = new Promise((resolve, reject) => {
        // spiral path to center
        const radius = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const theta = Math.atan2(deltaY, deltaX);
        const spin = -(Math.PI * 0.5 + Math.random() * Math.PI * 0.5);
        this._unlockedBoosterPackEl.velocity('stop').velocity({
          tween: 1,
        }, {
          easing: 'easeInSine',
          duration: 500.0,
          progress: function (elements, complete, remaining, start, tweenValue) {
            const r = radius * (1.0 - tweenValue);
            const t = spin * tweenValue * tweenValue * tweenValue;
            const x = Math.round(deltaX - r * Math.cos(theta + t));
            const y = Math.round(deltaY - r * Math.sin(theta + t));
            this._unlockedBoosterPackEl.css('transform', `translateX(${x}px) translateY(${y}px)`);
          }.bind(this),
          complete: function () {
            // start shake/scale loop
            this._unlockedBoosterPackEl.velocity({
              tween: 1,
            }, {
              easing: 'easeInSine',
              duration: 1000.0,
              progress: function (elements, complete, remaining, start, tweenValue) {
                currentScale = (1.0 + scaleOffset * tweenValue);
                this._unlockedBoosterPackEl.css('transform', `translateX(${Math.round(deltaX + (Math.random() * shakeMagnitude - shakeMagnitude * 0.5) * tweenValue)}px) translateY(${Math.round(deltaY + (Math.random() * shakeMagnitude - shakeMagnitude * 0.5) * tweenValue)}px) scale(${currentScale})`);
              }.bind(this),
            }).velocity({
              tween: 1,
            }, {
              loop: true,
              duration: 1000.0,
              progress: function (elements, complete, remaining, start, tweenValue) {
                this._unlockedBoosterPackEl.css('transform', `translateX(${Math.round(deltaX + (Math.random() * shakeMagnitude - shakeMagnitude * 0.5))}px) translateY(${Math.round(deltaY + (Math.random() * shakeMagnitude - shakeMagnitude * 0.5))}px) scale(${currentScale})`);
              }.bind(this),
            });

            // resolve
            resolve();
          }.bind(this),
        });
      });

      // show unlocked cards when ready
      Promise.all([
        requestUnlockPromise,
        animateUnlockPromise,
        animatePackPromise,
      ]).then(() => {
        // delay then remove current booster pack
        this._unlockedBoosterPackEl.velocity('stop', true).velocity({
          tween: 1,
        }, {
          duration: 800.0,
          progress: function (elements, complete, remaining, start, tweenValue) {
            this._unlockedBoosterPackEl.css('transform', `translateX(${Math.round(deltaX + (Math.random() * shakeMagnitude - shakeMagnitude * 0.5))}px) translateY(${Math.round(deltaY + (Math.random() * shakeMagnitude - shakeMagnitude * 0.5))}px) scale(${currentScale})`);
          }.bind(this),
          complete: function () {
            this._unlockedBoosterPackEl.remove();
            this._unlockedBoosterPackEl = null;
          }.bind(this),
        });

        // reveal contents of pack
        const scene = Scene.getInstance();
        const boosterLayer = scene && scene.getContent();
        if (boosterLayer instanceof BoosterPackOpeningLayer) {
          boosterLayer.showRevealPack(unlockedBoosterPackCards).then(() => {
            // unlock booster packs and navigation
            this.setLocked(false);
            NavigationManager.getInstance().requestUserTriggeredNavigationUnlocked(this._userNavLockId);
          });
        }
      });
    }
  },

  onClickBoosterBuy() {
    if (!this._locked) {
      NavigationManager.getInstance().toggleModalViewByClass(ShopSpiritOrbsModalView, { model: new Backbone.Model() });
    }
  },

});

// Expose the class either via CommonJS or the global object
module.exports = BoosterPackCollectionLayout;
