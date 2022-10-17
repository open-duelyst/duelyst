// pragma PKGS: nongame

'use strict';

var RSX = require('app/data/resources');
var audio_engine = require('app/audio/audio_engine');
var SlidingPanelTmpl = require('app/ui/templates/item/sliding_panel.hbs');

var SlidingPanelItemView = Backbone.Marionette.ItemView.extend({

  tagName: 'li',
  className: 'sliding-panel',

  template: SlidingPanelTmpl,

  onRender: function () {
    this.$el.on('mouseenter', this.onMouseEnter.bind(this));
    this.$el.on('click', this.onClick.bind(this));

    if (!this.getIsEnabled()) {
      this.$el.addClass('disabled');
    } else {
      this.$el.removeClass('disabled');
    }
  },

  getIsEnabled: function () {
    return this.model.get('enabled');
  },

  onMouseEnter: function () {
    audio_engine.current().play_effect(RSX.sfx_ui_menu_hover.audio);
  },

  onClick: function () {
    if (this.getIsEnabled()) {
      this.trigger('select');
    }
  },

});

// Expose the class either via CommonJS or the global object
module.exports = SlidingPanelItemView;
