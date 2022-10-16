// pragma PKGS: nongame

const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const audio_engine = require('app/audio/audio_engine');
const ChallengePreviewTmpl = require('app/ui/templates/item/challenge_preview.hbs');

const ChallengePreviewItemView = Backbone.Marionette.ItemView.extend({

  tagName: 'li',
  className: 'challenge-preview',

  template: ChallengePreviewTmpl,

  events: {
    mouseenter: 'onMouseEnter',
    click: 'onSelect',
  },

  onRender() {
    if (!this.model.get('enabled')) {
      this.$el.addClass('disabled');
    } else {
      this.$el.removeClass('disabled');
    }
  },

  onMouseEnter() {
    audio_engine.current().play_effect(RSX.sfx_ui_menu_hover.audio);
  },

  onSelect() {
    if (this.model.get('enabled')) {
      this.trigger('select');
    }
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ChallengePreviewItemView;
