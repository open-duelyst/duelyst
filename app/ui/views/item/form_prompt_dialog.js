'use strict';

var EVENTS = require('app/common/event_types');
var RSX = require('app/data/resources');
var audio_engine = require('app/audio/audio_engine');
var NavigationManager = require('app/ui/managers/navigation_manager');
var FormPromptModalItemView = require('./form_prompt_modal');

/**
 * Dialog version of form prompt modal. Do not use this class directly.
 */
var FormPromptDialogItemView = FormPromptModalItemView.extend({

  onShow: function () {
    FormPromptModalItemView.prototype.onShow.apply(this, arguments);

    // because this is a dialog and dialogs lock user triggered actions
    // we can't listen to user triggered actions
    this.stopListening(NavigationManager.getInstance(), EVENTS.user_triggered_confirm, this.onClickSubmit);

    // listen to user attempted actions
    this.listenTo(NavigationManager.getInstance(), EVENTS.user_attempt_cancel, this.onCancel);
    this.listenTo(NavigationManager.getInstance(), EVENTS.user_attempt_confirm, this.onClickSubmit);

    this.$el.find('input').first().focus();
  },

  onCancel: function () {
    if (!this.getSubmitting()) {
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY);
      NavigationManager.getInstance().destroyDialogView();
    }
  },

  onSubmit: function () {
    FormPromptModalItemView.prototype.onSubmit.apply(this, arguments);

    this.$el.find('.btn-user-cancel').hide();
  },

  onSuccessComplete: function () {
    FormPromptModalItemView.prototype.onSuccessComplete.apply(this, arguments);

    NavigationManager.getInstance().destroyDialogView();
  },

  onErrorComplete: function () {
    FormPromptModalItemView.prototype.onErrorComplete.apply(this, arguments);

    this.$el.find('.btn-user-cancel').show();
  },

});

// Expose the class either via CommonJS or the global object
module.exports = FormPromptDialogItemView;
