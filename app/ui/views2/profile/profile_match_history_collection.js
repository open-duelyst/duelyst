'use strict';

var SDK = require('app/sdk');
var moment = require('moment');
var semver = require('semver');
var Logger = require('app/common/logger');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var ChatManager = require('app/ui/managers/chat_manager');
var ProfileManager = require('app/ui/managers/profile_manager');
var ErrorDialogItemView = require('app/ui/views/item/error_dialog');
var CopyReplayDialogView = require('app/ui/views2/profile/profile_match_history_copy_replay_to_clipboard_dialog');
var Template = require('./templates/profile_match_history_collection.hbs');

var ProfileMatchHistoryCollectionView = Backbone.Marionette.ItemView.extend({

  className: 'profile-match-history',
  template: Template,

  ui: {
    $replayButton: '.replay-button',
    $shareReplayCopyToClipboardButton: '.share-replay-copy-to-clipboard',
    $nextPageButton: '#button_next_page',
  },

  events: {
    'click .replay-button': 'onClickReplay',
    'click .share-replay-button': 'onClickShareReplay',
  },

  triggers: {
    'click #button_next_page': 'next_page',
  },

  serializeModel: function (model) {
    var data = model.toJSON.apply(model, _.rest(arguments));
    _.each(data.matchHistory, function (row) {
      if (row.game_type == SDK.GameType.SinglePlayer) {
        row.game_type = 'practice';
      } else if (row.game_type == SDK.GameType.BossBattle) {
        row.game_type = 'boss battle';
      } else if (row.game_type == SDK.GameType.Casual) {
        row.game_type = 'unranked';
      }
      row.faction_name = SDK.FactionFactory.factionForIdentifier(row.faction_id).name;
      row.faction_dev_name = SDK.FactionFactory.factionForIdentifier(row.faction_id).devName;
      var diff = semver.diff(process.env.VERSION, row.game_version);
      row.replay_available = (!diff || (diff != 'major' && diff != 'minor'));
      row.replay_shareble = row.user_id === ProfileManager.getInstance().get('id');

      row.is_pending = (row.is_winner == null && row.is_draw == null);
    });
    return data;
  },

  onDestroy: function () {
    Logger.module('UI').debug('match history destroyed');
  },

  onRender: function () {
    if (ChatManager.getInstance().getStatusOnline()) {
      this.ui.$replayButton.removeClass('disabled');
    } else {
      this.ui.$replayButton.addClass('disabled');
    }

    var matchHistory = this.model.get('matchHistory') || [];
    if (matchHistory.length < 10) {
      this.ui.$nextPageButton.hide();
    }

    $('td.icon', this.$el).tooltip({
      html: true,
      placement: 'left',
      delay: 200,
      title: function () {
        var hash = $(this).data('deck-hash');
        if (hash) {
          return ' \
            <span>Deck Identifier:</span> \
            <span>' + hash + '</span><br/> \
            <span style="color:#' + hash.slice(0, 6) + '"><i class="fa fa-circle"></i></span> \
            <span style="color:#' + hash.slice(6, 12) + '"><i class="fa fa-circle"></i></span> \
            <span style="color:#' + hash.slice(12, 18) + '"><i class="fa fa-circle"></i></span> \
          ';
        } else {
          return '';
        }
      },
    });
  },

  onClickReplay: function (e) {
    EventBus.getInstance().trigger(EVENTS.start_replay, {
      gameId: $(e.target).data('game-id'),
      userId: $(e.target).data('user-id'),
    });
  },

  onClickShareReplay: function (e) {
    Promise.resolve($.ajax({
      url: process.env.API_URL + '/api/me/games/share_replay',
      type: 'POST',
      data: JSON.stringify({
        game_id: $(e.target).data('game-id'),
      }),
      contentType: 'application/json',
      dataType: 'json',
    })).then(function (responseData) {
      Logger.module('UI').log('shared replay', responseData);
      NavigationManager.getInstance().showDialogView(new CopyReplayDialogView({
        replayUrl: process.env.API_URL + '/replay?replayId=' + responseData.replay_id,
      }));
    }.bind(this)).catch(function (response) {
      var message = response && response.responseJSON && (response.responseJSON.message || response.responseJSON.error);
      NavigationManager.getInstance().showDialogView(new ErrorDialogItemView({ title: 'Error sharing replay: ' + message }));
    }.bind(this));
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ProfileMatchHistoryCollectionView;
