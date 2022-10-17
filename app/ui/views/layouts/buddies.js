// pragma PKGS: alwaysloaded

'use strict';

var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var RSX = require('app/data/resources');
var audio_engine = require('app/audio/audio_engine');
var SDK = require('app/sdk');
var ChatManager = require('app/ui/managers/chat_manager');
var Animations = require('app/ui/views/animations');
var BuddiesTemplate = require('app/ui/templates/layouts/buddies.hbs');
var BuddyListView = require('app/ui/views/item/buddy_list');
var BuddySelectionEmptyView = require('app/ui/views/item/buddy_selection_empty');
var BuddySelectionLayout = require('./buddy_selection');

var BuddiesLayout = Backbone.Marionette.LayoutView.extend({

  id: 'app-buddies',
  className: 'modal duelyst-modal',

  template: BuddiesTemplate,

  regions: {
    buddyListRegion: '.buddy-list-region',
    buddySelectionRegion: '.buddy-selection-region',
  },

  ui: {
    $buddiesControls: '.buddies-controls',
  },

  events: {
    // "click .buddy-preview": "onSelectBuddy",
    'focus .buddies-controls': 'onFocusBuddiesControls',
    'blur .buddies-controls': 'onBlurBuddiesControls',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  onFocusBuddiesControls: function () {
    this.ui.$buddiesControls.css('opacity', '');
  },

  onBlurBuddiesControls: function () {
    this.ui.$buddiesControls.css('opacity', 0.5);
  },

  onShow: function () {
    // show the buddy list
    this.buddyList = new BuddyListView({ model: new Backbone.Model({}), collection: new Backbone.Collection() });
    this.listenTo(this.buddyList, 'buddy_selected', this.onSelectBuddy);
    this.buddySelectionRegion.show(new BuddySelectionEmptyView());
    this.buddyListRegion.show(this.buddyList);

    this.listenTo(ChatManager.getInstance().getBuddiesCollection().getPresenceCollection(), 'remove', this.onRemoveBuddy);

    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_tab_in.audio, CONFIG.SHOW_SFX_PRIORITY);
  },

  selectBuddy: function (buddyId) {
    var model = ChatManager.getInstance().getBuddiesCollection().getPresenceCollection().find(function (model) { return model.userId == buddyId; });
    if (model) {
      model.set('_active', true);
      if (this.buddyList) {
        this.buddyList.selectBuddy(model);
      }
      this.onSelectBuddy(model);
    }
  },

  onSelectBuddy: function (presenceModel) {
    if (this.presenceModelSelected !== presenceModel) {
      this.presenceModelSelected = presenceModel;
      if (this.presenceModelSelected) {
        this.ui.$buddiesControls.css('opacity', 0.5);
        // show buddy details and conversation
        this.buddySelectionRegion.show(new BuddySelectionLayout({ model: presenceModel }));
      } else {
        this.ui.$buddiesControls.css('opacity', '');
        this.buddySelectionRegion.empty();
      }
    }
  },

  onRemoveBuddy: function () {
    this.onSelectBuddy(null);
  },

});

// Expose the class either via CommonJS or the global object
module.exports = BuddiesLayout;
