// pragma PKGS: game

'use strict';

var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var CONFIG = require('app/common/config');
var SDK = require('app/sdk');
var RSX = require('app/data/resources');
var UtilsJavascript = require('app/common/utils/utils_javascript');
var audio_engine = require('app/audio/audio_engine');
var GameDataManager = require('app/ui/managers/game_data_manager');
var ProfileManager = require('app/ui/managers/profile_manager');
var ProgressionManager = require('app/ui/managers/progression_manager');
var DeckSelectSinglePlayerTmpl = require('app/ui/templates/composite/deck_select_single_player.hbs');
var _ = require('underscore');
var i18next = require('i18next');
var DeckSelectCompositeView = require('./deck_select');

var DeckSelectSinglePlayerCompositeView = DeckSelectCompositeView.extend({

  className: 'sliding-panel-select deck-select deck-select-single-player',

  template: DeckSelectSinglePlayerTmpl,

  _selectedOpponentId: null,
  _selectedOpponentFactionId: null,
  _opponentScrollTop: 0,

  _aiDifficulty: -0.1,
  _aiNumRandomCards: -1,
  _opponentClassPrefix: '.ai-opponent',

  initialize: function () {
    DeckSelectCompositeView.prototype.initialize.call(this);

    // get opponents
    this.model.set('opponents', this.getOpponents());

    // set parameters for ai tools
    if (process.env.AI_TOOLS_ENABLED) {
      this.model.set('maxNumRandomCards', CONFIG.MAX_DECK_SIZE);
    }
  },

  getRecommendedOpponentId: function () {
    if (ProgressionManager.getInstance().getFactionProgressionStatsModel(SDK.Factions.Faction5).get('level') == null) {
      return SDK.Cards.Faction5.General;
    } else if (ProgressionManager.getInstance().getFactionProgressionStatsModel(SDK.Factions.Faction3).get('level') == null) {
      return SDK.Cards.Faction3.General;
    } else if (ProgressionManager.getInstance().getFactionProgressionStatsModel(SDK.Factions.Faction4).get('level') == null) {
      return SDK.Cards.Faction4.General;
    } else if (ProgressionManager.getInstance().getFactionProgressionStatsModel(SDK.Factions.Faction2).get('level') == null) {
      return SDK.Cards.Faction2.General;
    } else if (ProgressionManager.getInstance().getFactionProgressionStatsModel(SDK.Factions.Faction6).get('level') == null) {
      return SDK.Cards.Faction6.General;
    }
  },

  getOpponents: function () {
    var opponents = [];

    // get recommended opponent
    var recommendedOpponentId = this.getRecommendedOpponentId();

    // for each faction
    var factionModels = GameDataManager.getInstance().visibleFactionsCollection.where({ isNeutral: false, enabled: true });
    for (var i = 0, il = factionModels.length; i < il; i++) {
      var factionModel = factionModels[i];
      var factionId = factionModel.get('id');

      // opponent should be primary general from faction
      var generalId = SDK.FactionFactory.generalIdForFactionByOrder(factionId, SDK.FactionFactory.GeneralOrder.Primary);
      var generalCard = SDK.GameSession.getCardCaches().getCardById(generalId);

      var opponentData = {
        name: factionModel.get('name'),
        factionId: factionId,
        id: generalId,
        portraitImg: generalCard.getPortraitHexResource().img,
      };

      // recommend opponent
      if (generalId === recommendedOpponentId) {
        opponentData.recommended = true;
      }

      opponents.push(opponentData);

      // if ai tools enabled, add other generals for faction
      if (process.env.AI_TOOLS_ENABLED) {
        var otherGeneralOrders = [SDK.FactionFactory.GeneralOrder.Secondary];
        for (var j = 0, jl = otherGeneralOrders.length; j < jl; j++) {
          var generalOrder = otherGeneralOrders[j];
          var otherOpponentData = UtilsJavascript.fastExtend({}, opponentData);
          var otherGeneralId = SDK.FactionFactory.generalIdForFactionByOrder(factionId, generalOrder);
          var otherGeneralCard = SDK.GameSession.getCardCaches().getCardById(otherGeneralId);
          if (otherGeneralCard != null) {
            otherOpponentData.id = otherGeneralId;
            otherOpponentData.portraitImg = otherGeneralCard.getPortraitHexResource().img;
            opponents.push(otherOpponentData);
          }
        }
      }
    }

    return opponents;
  },

  onBeforeRender: function () {
    var opponentChoices = this.$el.find(this._opponentClassPrefix + '-select-choices');
    this._opponentScrollTop = opponentChoices.scrollTop();
  },

  onRender: function () {
    DeckSelectCompositeView.prototype.onRender.apply(this, arguments);

    if (process.env.AI_TOOLS_ENABLED) {
      // update ai tools
      this.$el.find('.setting-difficulty input').val(this._aiDifficulty);
      this.$el.find('.setting-num-random-cards input').val(this._aiNumRandomCards);
      this.onChangeDifficulty();
      this.onChangeNumRandomCards();

      // listen for change in ai tools
      this.$el.find('.setting-difficulty input').on('change', this.onChangeDifficulty.bind(this));
      this.$el.find('.setting-num-random-cards input').on('change', this.onChangeNumRandomCards.bind(this));
    } else {
      // remove ai dev tools
      this.$el.find('.ai-tool').remove();
    }

    // show selected opponent faction as active
    if (this._selectedOpponentId != null) {
      this.$el.find(this._opponentClassPrefix + '[data-opponent-id=\'' + this._selectedOpponentId + '\']').addClass('active');
    }

    // restore opponent choices scroll
    this.$el.find(this._opponentClassPrefix + '-select-choices').scrollTop(this._opponentScrollTop);
  },

  onShow: function () {
    DeckSelectCompositeView.prototype.onShow.apply(this, arguments);

    // delegate listen for click on ai opponent
    this.$el.on('click', this._opponentClassPrefix, this.onSelectOpponent.bind(this));
  },

  /* region SELECTION */

  onSelectOpponent: function (event) {
    var $target = $(event.currentTarget);
    var opponentId = $target.data('opponent-id');
    var factionId = $target.data('faction-id');

    this.setSelectedOpponent(opponentId, factionId);
  },

  setSelectedOpponent: function (opponentId, factionId) {
    if (opponentId != null && this._selectedOpponentId !== opponentId) {
      // clear previous showing as active
      this.$el.find(this._opponentClassPrefix + '[data-opponent-id=\'' + this._selectedOpponentId + '\']').removeClass('active');

      // store new
      this._selectedOpponentId = opponentId;
      this._selectedOpponentFactionId = factionId;

      // show new as active
      this.$el.find(this._opponentClassPrefix + '[data-opponent-id=\'' + opponentId + '\']').addClass('active');

      // play select sound
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_select.audio, CONFIG.SELECT_SFX_PRIORITY);

      // emit select event
      this.trigger('select_opponent', opponentId);
    }
  },

  getConfirmSelectionEvent: function () {
    return EVENTS.start_single_player;
  },

  onConfirmSelection: function () {
    var selectedDeckModel = this._selectedDeckModel;
    var selectedOpponentId = this._selectedOpponentId;
    if (selectedDeckModel != null && selectedOpponentId != null) {
      this.ui.$deckSelectConfirm.addClass('disabled');
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);
      var aiDifficulty;
      var aiNumRandomCards;
      if (process.env.AI_TOOLS_ENABLED) {
        // check for custom settings
        aiDifficulty = this._aiDifficulty;
        aiNumRandomCards = this._aiNumRandomCards;

        // preserve auto values
        if (aiDifficulty < 0.0) aiDifficulty = null;
        if (aiNumRandomCards < 0) aiNumRandomCards = null;
      }
      EventBus.getInstance().trigger(
        this.getConfirmSelectionEvent(),
        UtilsJavascript.deepCopy(selectedDeckModel.get('cards')),
        selectedDeckModel.get('faction_id'),
        selectedDeckModel.get('cards')[0].id,
        selectedDeckModel.get('card_back_id'),
        ProfileManager.getInstance().get('battle_map_id'),
        selectedOpponentId,
        aiDifficulty,
        aiNumRandomCards,
      );
    } else if (selectedDeckModel != null) {
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_error.audio, CONFIG.ERROR_SFX_PRIORITY);
      this._showSelectDeckWarningPopover(this.ui.$deckSelectConfirm, i18next.t('game_setup.must_select_opponent_message'));
    } else if (selectedOpponentId != null) {
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_error.audio, CONFIG.ERROR_SFX_PRIORITY);
      this._showSelectDeckWarningPopover(this.ui.$deckSelectConfirm, i18next.t('game_setup.must_select_deck_message'));
    } else {
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_error.audio, CONFIG.ERROR_SFX_PRIORITY);
      this._showSelectDeckWarningPopover(this.ui.$deckSelectConfirm, i18next.t('game_setup.must_select_deck_and_opponent_message'));
    }
  },

  _updateFindDeckPopover: function () {
    // show no popover
  },

  /* endregion SELECTION */

  /* region AI TOOLS */

  onChangeDifficulty: function () {
    this._aiDifficulty = parseFloat(this.$el.find('.setting-difficulty input').val());
    if (_.isNumber(this._aiDifficulty) && this._aiDifficulty >= 0.0) {
      this.$el.find('.setting-difficulty output').text(this._aiDifficulty * 100.0 + '%');
    } else {
      this.$el.find('.setting-difficulty output').text('auto');
    }
  },

  onChangeNumRandomCards: function () {
    this._aiNumRandomCards = parseInt(this.$el.find('.setting-num-random-cards input').val());
    if (_.isNumber(this._aiNumRandomCards) && this._aiNumRandomCards >= 0) {
      this.$el.find('.setting-num-random-cards output').text(this._aiNumRandomCards);
    } else {
      this.$el.find('.setting-num-random-cards output').text('auto');
    }
  },

  /* endregion AI TOOLS */

});

// Expose the class either via CommonJS or the global object
module.exports = DeckSelectSinglePlayerCompositeView;
