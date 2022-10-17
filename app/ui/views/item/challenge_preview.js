// pragma PKGS: nongame

'use strict';

var SDK = require('app/sdk');
var RSX = require('app/data/resources');
var audio_engine = require('app/audio/audio_engine');
var ChallengePreviewTmpl = require('app/ui/templates/item/challenge_preview.hbs');

var ChallengePreviewItemView = Backbone.Marionette.ItemView.extend({

  tagName: 'li',
  className: 'challenge-preview',

  template: ChallengePreviewTmpl,

  events: {
    mouseenter: 'onMouseEnter',
    click: 'onSelect',
  },

  onRender: function () {
    if (!this.model.get('enabled')) {
      this.$el.addClass('disabled');
    } else {
      this.$el.removeClass('disabled');
    }
  },

  onMouseEnter: function () {
    audio_engine.current().play_effect(RSX.sfx_ui_menu_hover.audio);
  },

  onSelect: function () {
    if (this.model.get('enabled')) {
      this.trigger('select');
    }
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ChallengePreviewItemView;
