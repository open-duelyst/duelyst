// pragma PKGS: alwaysloaded

'use strict';

var CONFIG = require('app/common/config');
var RSX = require('app/data/resources');
var audio_engine = require('app/audio/audio_engine');
var Animations = require('app/ui/views/animations');
var ActivityDialogViewTempl = require('app/ui/templates/item/activity_dialog.hbs');
var NavigationManager = require('app/ui/managers/navigation_manager');
var i18next = require('i18next');

var ActivityDialogItemView = Backbone.Marionette.ItemView.extend({

  id: 'app-activity-dialog',
  className: 'dialog',

  template: ActivityDialogViewTempl,

  events: {
    'click .cancel-dialog': 'hideDialog',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  initialize: function () {
    this.model = new Backbone.Model({
      title: this.options.title || i18next.t('common.loading_dialog_one_moment_label'),
      allowCancel: this.options.allowCancel,
      background: this.options.background,
    });
  },

  hideDialog: function () {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY);
    this.trigger('cancel');

    // destroy last to allow any events to occur
    NavigationManager.getInstance().destroyDialogView();
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ActivityDialogItemView;
