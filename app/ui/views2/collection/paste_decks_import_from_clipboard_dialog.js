// pragma PKGS: alwaysloaded

'use strict';

var EVENTS = require('app/common/event_types');
var RSX = require('app/data/resources');
var InventoryManager = require('app/ui/managers/inventory_manager');
var NavigationManager = require('app/ui/managers/navigation_manager');
var ErrorDialogItemView = require('app/ui/views/item/error_dialog');
var Animations = require('app/ui/views/animations');
var audio_engine = require('app/audio/audio_engine');
var Templ = require('app/ui/views2/collection/templates/paste_decks_import_from_clipboard_dialog.hbs');
var Clipboard = require('clipboard');

var PasteDecksImportItemView = Backbone.Marionette.ItemView.extend({
  id: 'app-paste-decks-import-dialog',
  className: 'dialog prompt-modal',

  template: Templ,

  events: {
    'click .cancel-dialog': 'onCancel',
    'click .import-decks-submit': 'onImportDecksSubmit',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  initialize: function () {
    this.model = new Backbone.Model({
      background: this.options.background,
    });
  },

  onRender: function () {
    new Clipboard('#paste_decks_import_button');
  },

  onShow: function () {
    // listen to specific user attempted actions as this is a dialog and dialogs block user actions
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_cancel, this.onCancel);
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_skip, this.onCancel);
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_confirm, this.onCancel);

    // play error audio
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_error.audio, CONFIG.ERROR_SFX_PRIORITY);
  },

  onCancel: function () {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY);
    NavigationManager.getInstance().destroyDialogView();
    this.trigger('cancel');
  },

  onImportDecksSubmit: function (event) {
    const input = document.getElementById('input_text').value;
    InventoryManager.getInstance().importDecks(input)
      .then(function (response) {
      // Close the dialog window.
        this.onCancel();
      }.bind(this))
      .catch((error) => {
        console.error('import decks error:', error);
        NavigationManager.getInstance().showDialogView(new ErrorDialogItemView({
          title: `Failed to import decks: ${error}`,
        }));
      });
  },
});

module.exports = PasteDecksImportItemView;
