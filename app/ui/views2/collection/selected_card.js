// pragma PKGS: nongame

'use strict';

var CONFIG = require('app/common/config');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var UtilsUI = require('app/common/utils/utils_ui');
var RSX = require('app/data/resources');
var SDK = require('app/sdk');
var audio_engine = require('app/audio/audio_engine');
var InventoryManager = require('app/ui/managers/inventory_manager');
var CollectionCardCompositeView = require('./collection_card');
var SelectedCardLayoutTempl = require('./templates/selected_card.hbs');

var SelectedCardLayout = Backbone.Marionette.LayoutView.extend({

  _startOffset: null,
  _animateDuration: CONFIG.ANIMATE_MEDIUM_DURATION * 1000.0,

  id: 'app-selected-card',
  template: SelectedCardLayoutTempl,

  regions: {
    cardRegion: { selector: 'ul.card-region' },
  },

  ui: {
    $cardLore: '.card-lore',
    $cardLoreText: '.card-lore-text',
  },

  events: {
    click: 'onClick',
  },

  serializeModel: function (model) {
    var data = model.toJSON.apply(model, _.rest(arguments));

    // get lore for card id
    var baseCardId = this.model.get('baseCardId');
    if (InventoryManager.getInstance().isCardLoreVisible(baseCardId)) {
      var loreData = SDK.CardLore.loreForIdentifier(baseCardId);
      if (loreData != null) {
        data.lore = _.extend({}, loreData);
        if (data.lore.description) {
          data.lore.description = data.lore.description.replace(/\n|\r/g, '<br/>');
        }
        if (data.lore.text) {
          data.lore.text = data.lore.text.replace(/\n|\r/g, '<br/>');
        }
      }
    }

    return data;
  },

  initialize: function (opts) {
    this._startOffset = opts.startOffset;
  },

  onShow: function () {
    // show card
    this.cardView = new CollectionCardCompositeView({ model: this.model });
    this.cardRegion.show(this.cardView);

    // play sfx for show
    audio_engine.current().play_effect_for_interaction(RSX.sfx_collection_next.audio, CONFIG.SHOW_SFX_PRIORITY);

    // check for card lore
    var baseCardId = this.model.get('baseCardId');
    var loreData = SDK.CardLore.loreForIdentifier(baseCardId);
    if (loreData != null) {
      // mark lore as read only if card has lore
      InventoryManager.getInstance().markCardLoreAsReadInCollection(baseCardId);

      // make lore text scrollable
      this.listenTo(EventBus.getInstance(), EVENTS.resize, this.onResize);
      this.onResize();
    }
  },

  onResize: function () {
    UtilsUI.overlayScrollbars(this.ui.$cardLore, this.ui.$cardLoreText);
  },

  onClick: function () {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.HIDE_SFX_PRIORITY);
    this.trigger('close');
  },

});

// Expose the class either via CommonJS or the global object
module.exports = SelectedCardLayout;
