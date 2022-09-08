// pragma PKGS: alwaysloaded

const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const Events = require('app/common/eventbus');
const audio_engine = require('app/audio/audio_engine');
const ProgressionManager = require('app/ui/managers/progression_manager');
const DeckSlidingPanelTmpl = require('app/ui/templates/item/deck_sliding_panel.hbs');
const SlidingPanelItemView = require('./sliding_panel');

const DeckSlidingPanelItemView = SlidingPanelItemView.extend({

  className: 'sliding-panel deck-preview',

  template: DeckSlidingPanelTmpl,

  templateHelpers: {
    generalId() {
      return this.model.getGeneralId();
    },
  },

  initialize() {
    // determine if this deck is unlocked
    const factionId = this.model.get('faction_id');
    const isUnlocked = ProgressionManager.getInstance().isFactionUnlocked(factionId);
    this.model.set('_isUnlocked', isUnlocked);
  },

  onRender() {
    SlidingPanelItemView.prototype.onRender.call(this);

    // add faction class
    const factionId = this.model.get('faction_id');
    this.$el.addClass(`f${factionId}`);

    // add whether starter
    if (this.model.get('isStarter')) {
      this.$el.addClass('starter');
    } else {
      // custom decks should show whether valid
      if (!this.model.isValid()) {
        this.$el.addClass('invalid');
      } else {
        this.$el.removeClass('invalid');
      }
    }

    // show whether faction unlocked
    if (!this.model.get('_isUnlocked')) {
      this.$el.addClass('locked');
    } else {
      this.$el.removeClass('locked');
    }

    if (this.model.get('_flash')) {
      this.$el.find('>div').get(0).animate([
        { 'background-color': '#243341' },
        { 'background-color': '#00b9fd' },
        { 'background-color': '#243341' },
      ], {
        duration: 800,
        delay: 300,
        easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
        fill: 'forwards',
      });
      this.model.set('_flash', false);
    }
  },

  onShow() {
    this.listenTo(this.model, 'sync', this.render);
  },

  getIsEnabled() {
    return this.model.isValid();
  },

  onClick() {
    if (this.getIsEnabled() && this.model.get('_isUnlocked')) {
      this.trigger('select');
    }
  },

});

// Expose the class either via CommonJS or the global object
module.exports = DeckSlidingPanelItemView;
