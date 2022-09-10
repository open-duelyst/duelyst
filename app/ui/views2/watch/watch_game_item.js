const _ = require('underscore');
const Promise = require('bluebird');
const SDK = require('app/sdk');
const moment = require('moment');
const Analytics = require('app/common/analytics');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const PKGS = require('app/data/packages');
const Animations = require('app/ui/views/animations');
const GameDataManager = require('app/ui/managers/game_data_manager');
const UtilsUI = require('app/common/utils/utils_ui');
const Storage = require('app/common/storage');
const Template = require('./templates/watch_game_item.hbs');

const WatchGameItemView = Backbone.Marionette.ItemView.extend({

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

  serializeModel(model) {
    const data = model.toJSON.apply(model, _.rest(arguments));
    const readItems = Storage.get('watched_game_ids');
    if (_.contains(readItems, data.id)) {
      data.is_read = true;
    }
    return data;
  },

  onRender() {
    const readItems = Storage.get('watched_game_ids');
    if (_.contains(readItems, this.model.get('id'))) {
      this.$el.addClass('read');
    }

    // setup all unit animations
    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated

      this.ui.$keyUnits.each((i, el) => {
        const $el = $(el);
        const cardId = $el.data('card-id');
        const cardModel = GameDataManager.getInstance().getCardModelById(cardId);
        const card = cardModel.get('card');
        if (card != null) {
          // show card sprite
          const animResource = card.getAnimResource();
          if (animResource != null) {
            let spriteData = null;
            if (card instanceof SDK.Unit) {
              spriteData = UtilsUI.getCocosSpriteData(animResource.breathing);
            } else {
              spriteData = UtilsUI.getCocosSpriteData(animResource.idle);
            }
            UtilsUI.showCocosSprite($('.sprite', el), null, spriteData, null, false, cardModel.get('card'), null, null, 1.0);
          }
        }
      });
    });
  },

  /* region RESOURCES */

  getRequiredResources() {
    let requiredResources = [];

    // get list of all key card package ids
    const player1KeyCardIds = this.model.get('player_1_key_cards') || [];
    const player2KeyCardIds = this.model.get('player_2_key_cards') || [];
    const keyCardIds = [].concat(player1KeyCardIds, player2KeyCardIds);
    for (let i = 0, il = keyCardIds.length; i < il; i++) {
      const cardId = keyCardIds[i];
      const cardPkgId = PKGS.getCardInspectPkgIdentifier(cardId);
      const cardPkg = PKGS.getPkgForIdentifier(cardPkgId);
      requiredResources = requiredResources.concat(cardPkg);
    }

    return requiredResources;
  },

  /* endregion RESOURCES */

  animateReveal(duration, delay) {
    // hide immediately
    this.$el.css('opacity', 0.0);

    // reveal when resources loaded
    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated

      Animations.fadeZoomUpIn.call(this, duration, delay, 0, 0, 0.9);
    });
  },

  onClickWatch(e) {
    const readItems = Storage.get('watched_game_ids') || [];
    const playerId = $(e.currentTarget).data('player-id');

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
