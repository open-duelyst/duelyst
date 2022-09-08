// pragma PKGS: alwaysloaded

const CONFIG = require('app/common/config');
const RSX = require('app/data/resources');
const audio_engine = require('app/audio/audio_engine');
const Animations = require('app/ui/views/animations');
const ActivityDialogViewTempl = require('app/ui/templates/item/activity_dialog.hbs');
const NavigationManager = require('app/ui/managers/navigation_manager');
const i18next = require('i18next');

const ActivityDialogItemView = Backbone.Marionette.ItemView.extend({

  id: 'app-activity-dialog',
  className: 'dialog',

  template: ActivityDialogViewTempl,

  events: {
    'click .cancel-dialog': 'hideDialog',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  initialize() {
    this.model = new Backbone.Model({
      title: this.options.title || i18next.t('common.loading_dialog_one_moment_label'),
      allowCancel: this.options.allowCancel,
      background: this.options.background,
    });
  },

  hideDialog() {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY);
    this.trigger('cancel');

    // destroy last to allow any events to occur
    NavigationManager.getInstance().destroyDialogView();
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ActivityDialogItemView;
