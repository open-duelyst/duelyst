// pragma PKGS: alwaysloaded

'use strict';

var SDK = require('app/sdk');
var Promise = require('bluebird');
var CONFIG = require('app/common/config');
var RSX = require('app/data/resources');
var PKGS = require('app/data/packages');
var UtilsJavascript = require('app/common/utils/utils_javascript');
var UtilsUI = require('app/common/utils/utils_ui');
var audio_engine = require('app/audio/audio_engine');
var CardTmpl = require('app/ui/templates/composite/card.hbs');
var PackageManager = require('app/ui/managers/package_manager');
var GameDataManager = require('app/ui/managers/game_data_manager');
var InventoryManager = require('app/ui/managers/inventory_manager');
var ProfileManager = require('app/ui/managers/profile_manager');
var Animations = require('app/ui/views/animations');

var CardCompositeView = Backbone.Marionette.CompositeView.extend({

  tagName: 'li',
  className: 'card choice',

  template: CardTmpl,

  ui: {
    $cardSprite: '.card-sprite .sprite',
    $signatureCardSprite: '.signature-card-sprite .sprite',
  },

  events: {
    mouseenter: 'onMouseEnter',
    mouseleave: 'onMouseLeave',
    click: 'onSelect',
  },

  templateHelpers: {

    longCardDescription: function () {
      if (this.description == null)
        return false;
      var descriptionLength = this.description.length;
      if (this.description.includes('<br/>')) {
        descriptionLength += 15;
      }
      return descriptionLength >= 110;
    },

    longCardName: function () {
      if (this.name == null)
        return false;
      return this.name.length >= 23;
    },
  },

  // whether a card is draggable
  draggable: false,
  // what kind of droppable to drop into
  draggableScope: 'add',
  // a css selector for a different object to append the draggable to than the card parent
  draggableAppendTo: 'parent',

  // whether a card may be used
  usable: true,

  // whether a card reacts to mouse
  interactive: true,

  // whether card sprite is animated
  animated: true,

  _optionsCardId: null,
  _optionsDirty: false,
  _cardClasses: null,
  _inactiveSpriteData: null,
  _activeSpriteData: null,
  _activeStartingSpriteData: null,
  _activeStartingSound: null,
  _displayedSpriteData: null,
  _displayedSpriteGLData: null,
  _draggableSpriteGLData: null,
  signatureSpriteScale: 1.0,
  signatureSpriteScaleDraggable: 1.0,
  _signatureSpriteData: null,
  _displayedSignatureSpriteData: null,
  _displayedSignatureSpriteGLData: null,
  _draggableSignatureSpriteGLData: null,

  initialize: function (opts) {
    // set options from initial model
    var model = this.model;
    this.model = null;
    this.setOptions(model, true);

    // clear displayed sprite data so render doesn't try to show anything yet
    this._displayedSpriteData = null;

    // initialize card draggability
    this.$el.draggable({
      distance: 50,
      helper: 'clone',
      appendTo: this.draggableAppendTo,
      scroll: false,
      revert: 'invalid',
      revertDuration: 500,
      scope: opts.draggableScope || this.draggableScope,
      start: this.onStartDragging.bind(this),
      stop: this.onStopDragging.bind(this),
    });
  },

  onRender: function () {
    this._optionsDirty = false;

    // reset card classes
    if (this._cardClasses != null) {
      this.$el.removeClass(this._cardClasses);
    }
    this._cardClasses = this.getCardClasses();
    this.$el.addClass(this._cardClasses);

    // update interaction states
    this._updateState();

    // redisplay sprites as needed
    var displayedSpriteData = this._displayedSpriteData;
    this._displayedSpriteData = null;
    this.setSprite(displayedSpriteData);
    var displayedSignatureSpriteData = this._displayedSignatureSpriteData;
    this._displayedSignatureSpriteData = null;
    this.setSignatureSprite(displayedSignatureSpriteData);
  },

  onShow: function () {
    // force show inactive sprite
    this._displayedSpriteData = null;
    this.setSprite(this._inactiveSpriteData);
  },

  onDestroy: function () {
    UtilsUI.releaseCocosSprite(this._displayedSpriteGLData);
    UtilsUI.releaseCocosSprite(this._displayedSignatureSpriteGLData);
    UtilsUI.releaseCocosSprite(this._draggableSpriteGLData);
    UtilsUI.releaseCocosSprite(this._draggableSignatureSpriteGLData);
    this._cleanup();
  },

  onMouseEnter: function () {
    var interactiveAndUsable = this.interactive && this.usable;
    var card = this.model.get('card');
    if (card instanceof SDK.Card) {
      var cardId = this.model.get('id');
      InventoryManager.getInstance().markCardAsReadInCollection(cardId);
      this.setRead(true);
      if (interactiveAndUsable) {
        this.setSprite(this._activeSpriteData, this._activeStartingSpriteData, this._activeStartingSound);
      }
    }

    if (interactiveAndUsable) {
      audio_engine.current().play_effect(RSX.sfx_ui_menu_hover.audio);
    }
  },

  onMouseLeave: function () {
    var interactiveAndUsable = this.interactive && this.usable;
    var card = this.model.get('card');
    if (card instanceof SDK.Card && interactiveAndUsable) {
      this.setSprite(this._inactiveSpriteData);
    }
  },

  onSelect: function () {
    var card = this.model.get('card');
    if (card instanceof SDK.Card) {
      var cardId = this.model.get('id');
      InventoryManager.getInstance().markCardAsReadInCollection(cardId);
      this.setRead(true);
    }

    if (this.interactive) {
      this.trigger('select', this);
    }
  },

  onChangedOptions: function () {
    // override in sub-class to react to new model options
  },

  _updateState: function () {
    // override in set custom state
    this.setUsable(this.usable);
    this.setInteractive(this.interactive);
    this.setDraggable(this.draggable);
  },

  _cleanup: function (withoutUnload) {
    // cleanup previous model
    if (this.model != null) {
      // stop any running animations
      Animations.stop.call(this);

      // clear sprites so we're not wasting cycles
      this.setSprite(null);
      this.setSignatureSprite(null);

      // unload assets
      if (withoutUnload != true && this._loadPkgId != null) {
        PackageManager.getInstance().unloadMajorMinorPackage(this._loadPkgId);
        this._loadPkgId = null;
      }

      this.stopListening(this.model);
      this.model = null;
    }
  },

  /* STATE SETTERS / GETTERS */

  show: function () {
    if (this._optionsDirty) {
      this.render();
    }
    this.$el.removeClass('invisible');
  },

  hide: function (withoutOptionsClear) {
    this.$el.addClass('invisible');
    if (!withoutOptionsClear) {
      this.setOptions(null, true);
    }
  },

  setOptions: function (options, withoutRender) {
    // get new model
    options || (options = {});
    var model = this._getModelFromOptions(options);

    // no need to change options if same as existing
    if (this._getModelOptionsAreDifferent(model, options)) {
      this._cleanup(true);

      // set new model
      this.model = model;

      // allow card to react to changed options before rendering
      this.onChangedOptions(options);

      // flag options as dirty in case we don't render immediately
      this._optionsDirty = true;

      if (withoutRender != true) {
        // render new options immediately
        this.render();
      }

      // listen for changes to model between setting of options
      this.listenTo(this.model, 'change', this.render);

      // load card assets
      var previousLoadPkgId = this._loadPkgId;
      this._loadPkgId = null;
      var card = this.model.get('card');
      if (card instanceof SDK.Card) {
        var cardId = this.model.get('id');
        var cardPkgId = PKGS.getCardInspectPkgIdentifier(cardId);
        if (cardPkgId != null) {
          // we have to make each load pkg id unique in case more than one card loads the same assets
          // we don't want one to unload those assets and have another card that also uses the assets break
          var loadPkgId = this._loadPkgId = cardPkgId + '_' + UtilsJavascript.generateIncrementalId();
          var cardResourcesPkg = PKGS.getPkgForIdentifier(cardPkgId);

          // include signature card resources
          if (card instanceof SDK.Entity && card.getWasGeneral()) {
            var referenceSignatureCard = card.getReferenceSignatureCard();
            if (referenceSignatureCard != null) {
              var signatureCardId = referenceSignatureCard.getId();
              var signatureCardPkgId = PKGS.getCardInspectPkgIdentifier(signatureCardId);
              var signatureCardResourcesPkg = PKGS.getPkgForIdentifier(signatureCardPkgId);
              cardResourcesPkg = [].concat(cardResourcesPkg, signatureCardResourcesPkg);
            }
          }
        }
      }

      if (this._loadPkgId != null) {
        this._loadCardPkgPromise = new Promise(function (resolve, reject) {
          PackageManager.getInstance().loadMinorPackage(this._loadPkgId, cardResourcesPkg).then(function () {
            // unload previous card assets after loading new
            // this will better preserve assets if we're paging back and forth quickly
            if (previousLoadPkgId != null) {
              PackageManager.getInstance().unloadMajorMinorPackage(previousLoadPkgId);
            }

            // when loaded current pkg
            if (loadPkgId === this._loadPkgId) {
              // update sprite data
              this._findSpriteData();
              this.setSprite(this._inactiveSpriteData);
              this.setSignatureSprite(this._signatureSpriteData);
            }

            resolve();
          }.bind(this));
        }.bind(this));
      } else {
        // no new load needed
        if (previousLoadPkgId != null) {
          PackageManager.getInstance().unloadMajorMinorPackage(previousLoadPkgId);
        }
        this._loadCardPkgPromise = Promise.resolve();
      }
    }

    return this._loadCardPkgPromise;
  },

  _getModelOptionsAreDifferent: function (model, options) {
    return !this.model || this.model.get('id') != model.get('id');
  },

  _getModelFromOptions: function (options, forDeckCardBackSelectingMode) {
    var model;

    // check if options is a model
    if (options instanceof Backbone.Model) {
      model = options;
    } else if (options != null) {
      model = GameDataManager.getInstance().getCardModelById(options.id || (options.card && options.card.id));
    }

    if (model == null) {
      model = new Backbone.Model();
    }

    return model;
  },

  setRead: function (read) {
    if (read) {
      this.$el.removeClass('is-unread');
    } else {
      this.$el.addClass('is-unread');
    }
  },

  setLoreRead: function (read) {
    if (read || !ProfileManager.getInstance().profile.get('showLoreNotifications')) {
      this.$el.removeClass('is-lore-unread');
    } else {
      this.$el.addClass('is-lore-unread');
    }
  },

  setUsable: function (usable) {
    this.usable = usable;
    if (!usable) {
      this.$el.addClass('unusable');
    } else {
      this.$el.removeClass('unusable');
    }
  },

  setInteractive: function (interactive) {
    this.interactive = interactive;
    if (interactive) {
      this.$el.removeClass('interaction-locked');
    } else {
      this.$el.addClass('interaction-locked');
    }
  },

  setDraggable: function (draggable) {
    this.draggable = draggable;
    if (this.$el.draggable('instance') != null) {
      if (draggable) {
        this.$el.draggable('enable');
      } else {
        this.$el.draggable('disable');
      }
    }
    UtilsUI.resetCocosSprite(this._draggableSpriteGLData);
    UtilsUI.resetCocosSprite(this._draggableSignatureSpriteGLData);
  },

  setAnimated: function (animated) {
    if (this.animated !== animated) {
      this.animated = animated;

      // reset sprite data
      var displayedSpriteData = this._displayedSpriteData;
      this._displayedSpriteData = null;
      this.setSprite(displayedSpriteData);
      var displayedSignatureSpriteData = this._displayedSignatureSpriteData;
      this._displayedSignatureSpriteData = null;
      this.setSignatureSprite(displayedSignatureSpriteData);
    }
  },

  /**
   * Sets the state of the card by applying css classes based on the type of card this is.
   * @returns {string}
   */
  getCardClasses: function () {
    var cardTypes = '';
    var card = this.model.get('card');
    if (card instanceof SDK.Card) {
      // card types
      if (this.model.get('isEntity')) {
        cardTypes += ' entity';
        if (this.model.get('isGeneral')) {
          cardTypes += ' general';
        } else if (this.model.get('isUnit')) {
          cardTypes += ' unit';
        } else if (this.model.get('isTile')) {
          cardTypes += ' tile';
        }
      } else if (this.model.get('isArtifact')) {
        cardTypes += ' artifact';
      } else if (this.model.get('isSpell')) {
        cardTypes += ' spell';
      }

      if (this.model.get('isPrismatic')) {
        cardTypes += ' prismatic';
      }
    } else {
      cardTypes += 'card-back';
    }

    // faction
    var factionId = this.model.get('factionId');
    if (factionId != null) {
      cardTypes += ' faction-' + factionId;
    }

    return cardTypes;
  },

  /* SPRITES */

  _findSpriteData: function () {
    // reset old data
    this._inactiveSpriteData = null;
    this._activeSpriteData = null;
    this._activeStartingSpriteData = null;
    this._activeStartingSound = null;
    this._signatureSpriteData = null;

    // cache sprite data
    var card = this.model.get('card');
    if (card instanceof SDK.Card) {
      var animResource = card.getAnimResource();
      if (animResource != null) {
        if (card instanceof SDK.Unit) {
          this._inactiveSpriteData = UtilsUI.getCocosSpriteData(animResource.breathing);
          this._activeSpriteData = UtilsUI.getCocosSpriteData(animResource.idle);
          this._activeStartingSpriteData = UtilsUI.getCocosSpriteData(animResource.attack);
        } else if (card instanceof SDK.Tile) {
          this._inactiveSpriteData = this._activeSpriteData = UtilsUI.getCocosSpriteData(animResource.idle);
        } else {
          this._inactiveSpriteData = UtilsUI.getCocosSpriteData(animResource.idle);
          this._activeSpriteData = UtilsUI.getCocosSpriteData(animResource.active);
        }
      }

      if (card instanceof SDK.Entity && card.getWasGeneral()) {
        var referenceSignatureCard = card.getReferenceSignatureCard();
        if (referenceSignatureCard != null) {
          var signatureAnimResource = referenceSignatureCard.getAnimResource();
          if (signatureAnimResource != null) {
            this._signatureSpriteData = UtilsUI.getCocosSpriteData(signatureAnimResource.idle);
          }
        }
      }
      /*
      var soundResource = card.getSoundResource();
      if (soundResource != null) {
        this._activeStartingSound = soundResource.attack || soundResource.apply;
      }
      */
    }
  },

  setSprite: function (spriteData, startingSpriteData, startingSound) {
    if (this._displayedSpriteData !== spriteData) {
      this._displayedSpriteData = spriteData;
      if (this._displayedSpriteData != null) {
        this._displayedSpriteGLData = UtilsUI.showCocosSprite(this.ui.$cardSprite, this._displayedSpriteGLData, this._displayedSpriteData, null, this.animated, this.model.get('card'), startingSpriteData, startingSound);
      } else {
        UtilsUI.resetCocosSprite(this._displayedSpriteGLData);
        this._displayedSpriteGLData = null;
      }
    }
  },

  setSignatureSprite: function (spriteData) {
    if (this._displayedSignatureSpriteData !== spriteData) {
      this._displayedSignatureSpriteData = spriteData;
      if (this._displayedSignatureSpriteData != null) {
        this._displayedSignatureSpriteGLData = UtilsUI.showCocosSprite(this.ui.$signatureCardSprite, this._displayedSignatureSpriteGLData, spriteData, null, this.animated, null, null, null, this.signatureSpriteScale);
      } else {
        UtilsUI.resetCocosSprite(this._displayedSignatureSpriteGLData);
        this._displayedSignatureSpriteGLData = null;
      }
    }
  },

  /* DRAG AND DROP */

  onStartDragging: function () {
    this.trigger('start_dragging');

    var card = this.model.get('card');
    if (card instanceof SDK.Card) {
      this.setSprite(this._inactiveSpriteData);
      var draggable = this.$el.draggable('instance');
      var $draggableElement = draggable.helper;

      // display sprites on draggable element
      var $draggableCardSprite = $draggableElement.find('.card-sprite .sprite');
      this._draggableSpriteGLData = UtilsUI.showCocosSprite($draggableCardSprite, this._draggableSpriteGLData, this._activeSpriteData, null, this.animated, this.model.get('card'));

      if (this._signatureSpriteData != null) {
        var $draggableSignatureCardSprite = $draggableElement.find('.signature-card-sprite .sprite');
        this._draggableSignatureSpriteGLData = UtilsUI.showCocosSprite($draggableSignatureCardSprite, this._draggableSignatureSpriteGLData, this._signatureSpriteData, null, this.animated, null, null, null, this.signatureSpriteScaleDraggable);
      }
    }
  },

  onStopDragging: function () {
    this.trigger('stop_dragging');

    UtilsUI.resetCocosSprite(this._draggableSpriteGLData);
    UtilsUI.resetCocosSprite(this._draggableSignatureSpriteGLData);
  },

});

// Expose the class either via CommonJS or the global object
module.exports = CardCompositeView;
