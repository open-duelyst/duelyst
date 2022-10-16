// pragma PKGS: game

const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const CONFIG = require('app/common/config');
const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const DeckSelectBossBattleTmpl = require('app/ui/templates/composite/deck_select_boss_battle.hbs');
const _ = require('underscore');
const moment = require('moment');
const DeckSelectSinglePlayerCompositeView = require('./deck_select_single_player');

const DeckSelectBossBattleCompositeView = DeckSelectSinglePlayerCompositeView.extend({

  className: 'sliding-panel-select deck-select deck-select-single-player deck-select-boss-battle',

  _opponentClassPrefix: '.boss-opponent',

  template: DeckSelectBossBattleTmpl,

  onRender() {
    DeckSelectSinglePlayerCompositeView.prototype.onRender.apply(this, arguments);

    // remove all ai tools
    $('.ai-tool').remove();
  },

  onShow() {
    DeckSelectSinglePlayerCompositeView.prototype.onShow.apply(this, arguments);

    const opponents = this.getOpponents();
    if (opponents != null && opponents.length > 0) {
      this.setSelectedOpponent(opponents[0].id, opponents[0].factionId);
    }
  },

  getRecommendedOpponentId() {
    // no recommended opponent
    return null;
  },

  getOpponents() {
    const opponents = [];

    const progressionManager = ProgressionManager.getInstance();
    const currentBossEventModels = progressionManager.getCurrentBossEventModels();

    for (let i = 0, il = currentBossEventModels.length; i < il; i++) {
      const bossEventModel = currentBossEventModels[i];
      const generalId = bossEventModel.get('boss_id');
      const generalCard = SDK.GameSession.getCardCaches().getCardById(generalId);
      const factionId = SDK.Factions.Boss;
      const bossEventId = bossEventModel.get('event_id');
      const alreadyDefeated = progressionManager.getHasDefeatedBossForEvent(generalId, bossEventId);

      const opponentData = {
        name: generalCard.getName(),
        description: generalCard.getBossBattleDescription(),
        factionId,
        id: generalId,
        portraitImg: generalCard.getPortraitHexResource().img,
        bossEventId,
        defeated: alreadyDefeated,
      };

      opponents.push(opponentData);
    }

    return opponents;
  },

  getConfirmSelectionEvent() {
    return EVENTS.start_boss_battle;
  },

});

// Expose the class either via CommonJS or the global object
module.exports = DeckSelectBossBattleCompositeView;
