// pragma PKGS: alwaysloaded
// pragma PKGS: alwaysloaded

'use strict';

var CONFIG = require('app/common/config');
var EVENTS = require('app/common/event_types');
var RSX = require('app/data/resources');
var audio_engine = require('app/audio/audio_engine');
var ConfirmDialogItemViewTempl = require('app/ui/templates/item/confirm_dialog.hbs');
var NavigationManager = require('app/ui/managers/navigation_manager');

var ConfirmDialogItemView = Backbone.Marionette.ItemView.extend({

  id: 'app-confirm-dialog',
  className: 'modal prompt-modal',

  template: ConfirmDialogItemViewTempl,

  events: {
    click: 'onPress',
    'click .cancel-dialog': 'onCancel',
    'click .confirm-dialog': 'onConfirm',
  },

  initialize: function () {
    this.model = new Backbone.Model({
      title: this.options.title || 'Are you sure you want to do that?',
      message: this.options.message,
      buttonLabel: this.options.buttonLabel,
    });
  },

  onPress: function (e) {
    if ($(e.target).attr('id') === this.id) {
      this.onCancel(e);
    }
  },

  onShow: function () {
    // listen to specific user attempted actions as this is a dialog and dialogs block user actions
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_cancel, this.onCancel);
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_skip, this.onConfirm);
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_confirm, this.onConfirm);
  },

  onCancel: function () {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY);
    this.trigger('cancel');

    // destroy last to allow any events to occur
    NavigationManager.getInstance().destroyDialogView();
  },

  onConfirm: function () {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);
    this.trigger('confirm');

    // destroy last to allow any events to occur
    NavigationManager.getInstance().destroyDialogView();
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ConfirmDialogItemView;
