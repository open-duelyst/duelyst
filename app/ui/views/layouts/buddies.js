// pragma PKGS: alwaysloaded

const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const RSX = require('app/data/resources');
const audio_engine = require('app/audio/audio_engine');
const SDK = require('app/sdk');
const ChatManager = require('app/ui/managers/chat_manager');
const Animations = require('app/ui/views/animations');
const BuddiesTemplate = require('app/ui/templates/layouts/buddies.hbs');
const BuddyListView = require('app/ui/views/item/buddy_list');
const BuddySelectionEmptyView = require('app/ui/views/item/buddy_selection_empty');
const BuddySelectionLayout = require('./buddy_selection');

const BuddiesLayout = Backbone.Marionette.LayoutView.extend({

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

  onFocusBuddiesControls() {
    this.ui.$buddiesControls.css('opacity', '');
  },

  onBlurBuddiesControls() {
    this.ui.$buddiesControls.css('opacity', 0.5);
  },

  onShow() {
    // show the buddy list
    this.buddyList = new BuddyListView({ model: new Backbone.Model({}), collection: new Backbone.Collection() });
    this.listenTo(this.buddyList, 'buddy_selected', this.onSelectBuddy);
    this.buddySelectionRegion.show(new BuddySelectionEmptyView());
    this.buddyListRegion.show(this.buddyList);

    this.listenTo(ChatManager.getInstance().getBuddiesCollection().getPresenceCollection(), 'remove', this.onRemoveBuddy);

    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_tab_in.audio, CONFIG.SHOW_SFX_PRIORITY);
  },

  selectBuddy(buddyId) {
    const model = ChatManager.getInstance().getBuddiesCollection().getPresenceCollection().find((model) => model.userId == buddyId);
    if (model) {
      model.set('_active', true);
      if (this.buddyList) {
        this.buddyList.selectBuddy(model);
      }
      this.onSelectBuddy(model);
    }
  },

  onSelectBuddy(presenceModel) {
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

  onRemoveBuddy() {
    this.onSelectBuddy(null);
  },

});

// Expose the class either via CommonJS or the global object
module.exports = BuddiesLayout;
