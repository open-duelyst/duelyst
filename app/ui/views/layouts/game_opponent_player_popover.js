// pragma PKGS: game

'use strict';

var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var CONFIG = require('app/common/config');
var RSX = require('app/data/resources');
var audio_engine = require('app/audio/audio_engine');
var EmotesListCompositeView = require('app/ui/views/composite/emotes-list');
var OpponentPlayerPopoverLayoutTempl = require('app/ui/templates/layouts/game_opponent_player_popover.hbs');
var TransitionRegion = require('app/ui/views/regions/transition');
var InventoryManager = require('app/ui/managers/inventory_manager');
var i18next = require('i18next');
var PlayerPopoverLayout = require('./game_player_popover');

var MyPlayerPopoverLayout = PlayerPopoverLayout.extend({

  className: 'player-popover opponent-player',

  template: OpponentPlayerPopoverLayoutTempl,

  regions: {
    emotesListRegion: { selector: '.emotes-list-region' },
    emoteRegion: { selector: '.emote-region', regionClass: TransitionRegion },
  },

  _isMuted: false,

  _emoteReceivedAt: 0,

  /* region MARIONETTE EVENTS */

  onShow: function () {
    // show opponent options
    var opponentEmotes = [
      new Backbone.Model({
        title: i18next.t('common.mute_button_label'),
        callback: this.onMute.bind(this),
        _canUse: true,
      }),
    ];
    var emotesListCompositeView = new EmotesListCompositeView({ collection: new Backbone.Collection(opponentEmotes) });
    emotesListCompositeView.listenTo(emotesListCompositeView, 'childview:select', this.onSelectEmote.bind(this));
    this.emotesListRegion.show(emotesListCompositeView);

    // listen for emotes
    this.listenTo(EventBus.getInstance(), EVENTS.show_emote, this.onEmoteReceived);
  },

  /* endregion MARIONETTE EVENTS */

  /* region MUTE */

  onMute: function () {
    this._isMuted = true;
  },

  getIsMuted: function () {
    return this._isMuted;
  },

  /* endregion MUTE */

  /* region SHOW / HIDE */

  showOptions: function () {
    // don't show options when muted
    if (!this._isMuted) {
      PlayerPopoverLayout.prototype.showOptions.call(this);
    }
  },

  /* endregion SHOW / HIDE */

  /* region EMOTES */

  onEmoteReceived: function (event) {
    var receivedTimestamp = Date.now();
    if (this._emoteReceivedAt + CONFIG.EMOTE_DELAY * 1000.0 <= receivedTimestamp) {
      this._emoteReceivedAt = receivedTimestamp;
      var emoteId = event.id;
      if (event.playerId && event.playerId != this.model.get('playerId'))
        return;
      else
        this.showEmote(emoteId);
    }
  },

  onSelectEmote: function (emoteView) {
    var emoteModel = emoteView && emoteView.model;
    var emoteCallback = emoteModel && emoteModel.get('callback');
    if (emoteCallback != null) {
      // play effect
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_select.audio, CONFIG.SELECT_SFX_PRIORITY);

      // stop showing emotes
      this.stopShowingEmote();
      this.hideOptions();

      // do emote callback
      emoteCallback();
    }
  },

  showEmote: function (emoteId) {
    // don't show emote when muted or my player has opponent options open
    if (!this._isMuted && !this.getIsShowingOptions()) {
      PlayerPopoverLayout.prototype.showEmote.call(this, emoteId);
    }
  },

  /* endregion EMOTES */

});

// Expose the class either via CommonJS or the global object
module.exports = MyPlayerPopoverLayout;
