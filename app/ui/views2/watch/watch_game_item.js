'use strict';

var _ = require('underscore');
var Promise = require('bluebird');
var SDK = require('app/sdk');
var moment = require('moment');
var Analytics = require('app/common/analytics');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var PKGS = require('app/data/packages');
var Animations = require('app/ui/views/animations');
var GameDataManager = require('app/ui/managers/game_data_manager');
var UtilsUI = require('app/common/utils/utils_ui');
var Storage = require('app/common/storage');
var Template = require('./templates/watch_game_item.hbs');

var WatchGameItemView = Backbone.Marionette.ItemView.extend({

  className: 'watch-game-item',
  template: Template,
  events: {
    'click .watch': 'onClickWatch',
  },
  ui: {
    $keyUnits: 'ul.key-units li',
  },

  _canLoad: false,
  _whenResourcesReady: null,
  _whenResourcesReadyResolve: null,
  _loadedPackageIds: null,
  _loadingPromise: null,

  serializeModel: function (model) {
    var data = model.toJSON.apply(model, _.rest(arguments));
    var readItems = Storage.get('watched_game_ids');
    if (_.contains(readItems, data.id)) {
      data.is_read = true;
    }
    return data;
  },

  onRender: function () {
    var readItems = Storage.get('watched_game_ids');
    if (_.contains(readItems, this.model.get('id'))) {
      this.$el.addClass('read');
    }

    // setup all unit animations
    this.whenRequiredResourcesReady().then(function (requestId) {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated

      this.ui.$keyUnits.each(function (i, el) {
        var $el = $(el);
        var cardId = $el.data('card-id');
        var cardModel = GameDataManager.getInstance().getCardModelById(cardId);
        var card = cardModel.get('card');
        if (card != null) {
          // show card sprite
          var animResource = card.getAnimResource();
          if (animResource != null) {
            var spriteData = null;
            if (card instanceof SDK.Unit) {
              spriteData = UtilsUI.getCocosSpriteData(animResource.breathing);
            } else {
              spriteData = UtilsUI.getCocosSpriteData(animResource.idle);
            }
            UtilsUI.showCocosSprite($('.sprite', el), null, spriteData, null, false, cardModel.get('card'), null, null, 1.0);
          }
        }
      });
    }.bind(this));
  },

  /* region RESOURCES */

  getRequiredResources: function () {
    var requiredResources = [];

    // get list of all key card package ids
    var player1KeyCardIds = this.model.get('player_1_key_cards') || [];
    var player2KeyCardIds = this.model.get('player_2_key_cards') || [];
    var keyCardIds = [].concat(player1KeyCardIds, player2KeyCardIds);
    for (var i = 0, il = keyCardIds.length; i < il; i++) {
      var cardId = keyCardIds[i];
      var cardPkgId = PKGS.getCardInspectPkgIdentifier(cardId);
      var cardPkg = PKGS.getPkgForIdentifier(cardPkgId);
      requiredResources = requiredResources.concat(cardPkg);
    }

    return requiredResources;
  },

  /* endregion RESOURCES */

  animateReveal: function (duration, delay) {
    // hide immediately
    this.$el.css('opacity', 0.0);

    // reveal when resources loaded
    this.whenRequiredResourcesReady().then(function (requestId) {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated

      Animations.fadeZoomUpIn.call(this, duration, delay, 0, 0, 0.9);
    }.bind(this));
  },

  onClickWatch: function (e) {
    var readItems = Storage.get('watched_game_ids') || [];
    var playerId = $(e.currentTarget).data('player-id');

    if (!_.contains(readItems, this.model.get('id'))) {
      if (readItems.length > 100) {
        readItems.slice(readItems.length - 100);
      }
      readItems.push(this.model.get('id'));
      Storage.set('watched_game_ids', readItems);
    }

    Analytics.track('watched replay', {
      category: Analytics.EventCategory.Watch,
      division_id: this.model.get('division'),
      game_id: this.model.get('id'),
    }, {
      labelKey: 'division',
    });

    EventBus.getInstance().trigger(EVENTS.start_replay, {
      gameId: this.model.get('id'),
      userId: playerId || this.model.get('winner_id'),
      promotedDivisionName: this.model.get('division'),
    });
  },

});

module.exports = WatchGameItemView;
