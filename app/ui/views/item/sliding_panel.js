// pragma PKGS: nongame

const RSX = require('app/data/resources');
const audio_engine = require('app/audio/audio_engine');
const SlidingPanelTmpl = require('app/ui/templates/item/sliding_panel.hbs');

const SlidingPanelItemView = Backbone.Marionette.ItemView.extend({

  tagName: 'li',
  className: 'sliding-panel',

  template: SlidingPanelTmpl,

  onRender() {
    this.$el.on('mouseenter', this.onMouseEnter.bind(this));
    this.$el.on('click', this.onClick.bind(this));

    if (!this.getIsEnabled()) {
      this.$el.addClass('disabled');
    } else {
      this.$el.removeClass('disabled');
    }
  },

  getIsEnabled() {
    return this.model.get('enabled');
  },

  onMouseEnter() {
    audio_engine.current().play_effect(RSX.sfx_ui_menu_hover.audio);
  },

  onClick() {
    if (this.getIsEnabled()) {
      this.trigger('select');
    }
  },

});

// Expose the class either via CommonJS or the global object
module.exports = SlidingPanelItemView;
