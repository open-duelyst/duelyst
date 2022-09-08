// pragma PKGS: alwaysloaded

const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const CONFIG = require('app/common/config');
const Animations = require('app/ui/views/animations');
const QuestsManager = require('app/ui/managers/quests_manager');
const NavigationManager = require('app/ui/managers/navigation_manager');
const NewPlayerManager = require('app/ui/managers/new_player_manager');
const RSX = require('app/data/resources');
const Logger = require('app/common/logger');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const audio_engine = require('app/audio/audio_engine');
const moment = require('moment');
const DuelystFirebase = require('app/ui/extensions/duelyst_firebase');

const QuestLogViewTempl = require('./templates/quest_log_composite.hbs');
const QuestItemView = require('./quest_item');
const QuestLogEmptyView = require('./quest_log_empty');

const QuestLogView = Backbone.Marionette.CompositeView.extend({

  tagName: 'ul',
  className: 'quest-log-list',

  template: QuestLogViewTempl,

  childView: QuestItemView,
  emptyView: QuestLogEmptyView,

  events: {
    'click .replace': 'onReplace',
  },

  ui: {
    $rollovercountdown: '.rollover-countdown',
    $firstWinCountdown: '.first-win-of-the-day-countdown',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  rolloverUpdateInterval: null,
  showConfirm: false,

  initialize(opts) {
    this.showConfirm = opts.showConfirm;
  },

  onReplace(e) {
    const index = $(e.currentTarget).data('quest-index');
    const $quest = $(e.currentTarget).parents('li.quest');

    const model = this.collection.get(index);

    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);

    $quest.removeClass('animateIn').addClass('replacing');
    this.listenToOnce(model, 'change', () => {
      $quest.removeClass('replacing').addClass('animateIn');
      // mark daily quests as read
      QuestsManager.getInstance().markQuestsAsRead();
    });

    const request = QuestsManager.getInstance().requestQuestReplace(index);
    request.done((response) => {
      // nada
    });
  },

});

// Expose the class either via CommonJS or the global object
module.exports = QuestLogView;
