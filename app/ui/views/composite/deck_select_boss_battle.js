// pragma PKGS: game

'use strict';

var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var CONFIG = require('app/common/config');
var SDK = require('app/sdk');
var RSX = require('app/data/resources');
var DeckSelectBossBattleTmpl = require('app/ui/templates/composite/deck_select_boss_battle.hbs');
var _ = require('underscore');
var moment = require('moment');
var DeckSelectSinglePlayerCompositeView = require('./deck_select_single_player');

var DeckSelectBossBattleCompositeView = DeckSelectSinglePlayerCompositeView.extend({

  className: 'sliding-panel-select deck-select deck-select-single-player deck-select-boss-battle',

  _opponentClassPrefix: '.boss-opponent',

  template: DeckSelectBossBattleTmpl,

  onRender: function () {
    DeckSelectSinglePlayerCompositeView.prototype.onRender.apply(this, arguments);

    // remove all ai tools
    $('.ai-tool').remove();
  },

  onShow: function () {
    DeckSelectSinglePlayerCompositeView.prototype.onShow.apply(this, arguments);

    var opponents = this.getOpponents();
    if (opponents != null && opponents.length > 0) {
      this.setSelectedOpponent(opponents[0].id, opponents[0].factionId);
    }
  },

  getRecommendedOpponentId: function () {
    // no recommended opponent
    return null;
  },

  getOpponents: function () {
    var opponents = [];

    var progressionManager = ProgressionManager.getInstance();
    var currentBossEventModels = progressionManager.getCurrentBossEventModels();

    for (var i = 0, il = currentBossEventModels.length; i < il; i++) {
      var bossEventModel = currentBossEventModels[i];
      var generalId = bossEventModel.get('boss_id');
      var generalCard = SDK.GameSession.getCardCaches().getCardById(generalId);
      var factionId = SDK.Factions.Boss;
      var bossEventId = bossEventModel.get('event_id');
      var alreadyDefeated = progressionManager.getHasDefeatedBossForEvent(generalId, bossEventId);

      var opponentData = {
        name: generalCard.getName(),
        description: generalCard.getBossBattleDescription(),
        factionId: factionId,
        id: generalId,
        portraitImg: generalCard.getPortraitHexResource().img,
        bossEventId: bossEventId,
        defeated: alreadyDefeated,
      };

      opponents.push(opponentData);
    }

    return opponents;
  },

  getConfirmSelectionEvent: function () {
    return EVENTS.start_boss_battle;
  },

});

// Expose the class either via CommonJS or the global object
module.exports = DeckSelectBossBattleCompositeView;
