// pragma PKGS: nongame

const CONFIG = require('app/common/config');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const UtilsUI = require('app/common/utils/utils_ui');
const RSX = require('app/data/resources');
const SDK = require('app/sdk');
const audio_engine = require('app/audio/audio_engine');
const InventoryManager = require('app/ui/managers/inventory_manager');
const CollectionCardCompositeView = require('./collection_card');
const SelectedCardLayoutTempl = require('./templates/selected_card.hbs');

const SelectedCardLayout = Backbone.Marionette.LayoutView.extend({

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

  serializeModel(model) {
    const data = model.toJSON.apply(model, _.rest(arguments));

    // get lore for card id
    const baseCardId = this.model.get('baseCardId');
    if (InventoryManager.getInstance().isCardLoreVisible(baseCardId)) {
      const loreData = SDK.CardLore.loreForIdentifier(baseCardId);
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

  initialize(opts) {
    this._startOffset = opts.startOffset;
  },

  onShow() {
    // show card
    this.cardView = new CollectionCardCompositeView({ model: this.model });
    this.cardRegion.show(this.cardView);

    // play sfx for show
    audio_engine.current().play_effect_for_interaction(RSX.sfx_collection_next.audio, CONFIG.SHOW_SFX_PRIORITY);

    // check for card lore
    const baseCardId = this.model.get('baseCardId');
    const loreData = SDK.CardLore.loreForIdentifier(baseCardId);
    if (loreData != null) {
      // mark lore as read only if card has lore
      InventoryManager.getInstance().markCardLoreAsReadInCollection(baseCardId);

      // make lore text scrollable
      this.listenTo(EventBus.getInstance(), EVENTS.resize, this.onResize);
      this.onResize();
    }
  },

  onResize() {
    UtilsUI.overlayScrollbars(this.ui.$cardLore, this.ui.$cardLoreText);
  },

  onClick() {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.HIDE_SFX_PRIORITY);
    this.trigger('close');
  },

});

// Expose the class either via CommonJS or the global object
module.exports = SelectedCardLayout;
