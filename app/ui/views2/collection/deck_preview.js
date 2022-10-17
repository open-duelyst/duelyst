// pragma PKGS: alwaysloaded

'use strict';

var RSX = require('app/data/resources');
var audio_engine = require('app/audio/audio_engine');
var DeckPreviewTmpl = require('./templates/deck_preview.hbs');

var DeckPreviewItemView = Backbone.Marionette.ItemView.extend({

  tagName: 'li',
  className: 'deck-preview',

  template: DeckPreviewTmpl,

  templateHelpers: {
    generalId: function () {
      return this.model.getGeneralId();
    },
  },

  events: {
    mouseenter: 'onMouseEnter',
  },

  triggers: {
    'click .deck-preview-content': 'select',
    'click .deck-delete': 'delete',
  },

  onRender: function () {
    // add faction class
    var factionId = this.model.get('faction_id');
    this.$el.addClass('f' + factionId);

    // add whether starter
    if (this.model.get('isStarter')) {
      this.$el.addClass('starter');
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

    // show whether valid
    if (!this.model.isValid()) {
      this.$el.addClass('invalid');
    } else {
      this.$el.removeClass('invalid');
    }
  },

  onShow: function () {
    this.listenTo(this.model, 'sync', this.onDeckSync);
  },

  onDeckSync: function () {
    if (!this.isDestroyed && this.model.hasChanged()) {
      this.render();
    }
  },

  onMouseEnter: function () {
    audio_engine.current().play_effect(RSX.sfx_ui_menu_hover.audio);
  },

});

// Expose the class either via CommonJS or the global object
module.exports = DeckPreviewItemView;
