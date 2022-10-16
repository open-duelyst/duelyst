// pragma PKGS: game

const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const CONFIG = require('app/common/config');
const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const audio_engine = require('app/audio/audio_engine');
const GameDataManager = require('app/ui/managers/game_data_manager');
const ProfileManager = require('app/ui/managers/profile_manager');
const ProgressionManager = require('app/ui/managers/progression_manager');
const DeckSelectSinglePlayerTmpl = require('app/ui/templates/composite/deck_select_single_player.hbs');
const _ = require('underscore');
const i18next = require('i18next');
const DeckSelectCompositeView = require('./deck_select');

const DeckSelectSinglePlayerCompositeView = DeckSelectCompositeView.extend({

  className: 'sliding-panel-select deck-select deck-select-single-player',

  template: DeckSelectSinglePlayerTmpl,

  _selectedOpponentId: null,
  _selectedOpponentFactionId: null,
  _opponentScrollTop: 0,

  _aiDifficulty: -0.1,
  _aiNumRandomCards: -1,
  _opponentClassPrefix: '.ai-opponent',

  initialize() {
    DeckSelectCompositeView.prototype.initialize.call(this);

    // get opponents
    this.model.set('opponents', this.getOpponents());

    // set parameters for ai tools
    if (process.env.AI_TOOLS_ENABLED) {
      this.model.set('maxNumRandomCards', CONFIG.MAX_DECK_SIZE);
    }
  },

  getRecommendedOpponentId() {
    if (ProgressionManager.getInstance().getFactionProgressionStatsModel(SDK.Factions.Faction5).get('level') == null) {
      return SDK.Cards.Faction5.General;
    } if (ProgressionManager.getInstance().getFactionProgressionStatsModel(SDK.Factions.Faction3).get('level') == null) {
      return SDK.Cards.Faction3.General;
    } if (ProgressionManager.getInstance().getFactionProgressionStatsModel(SDK.Factions.Faction4).get('level') == null) {
      return SDK.Cards.Faction4.General;
    } if (ProgressionManager.getInstance().getFactionProgressionStatsModel(SDK.Factions.Faction2).get('level') == null) {
      return SDK.Cards.Faction2.General;
    } if (ProgressionManager.getInstance().getFactionProgressionStatsModel(SDK.Factions.Faction6).get('level') == null) {
      return SDK.Cards.Faction6.General;
    }
  },

  getOpponents() {
    const opponents = [];

    // get recommended opponent
    const recommendedOpponentId = this.getRecommendedOpponentId();

    // for each faction
    const factionModels = GameDataManager.getInstance().visibleFactionsCollection.where({ isNeutral: false, enabled: true });
    for (let i = 0, il = factionModels.length; i < il; i++) {
      const factionModel = factionModels[i];
      const factionId = factionModel.get('id');

      // opponent should be primary general from faction
      const generalId = SDK.FactionFactory.generalIdForFactionByOrder(factionId, SDK.FactionFactory.GeneralOrder.Primary);
      const generalCard = SDK.GameSession.getCardCaches().getCardById(generalId);

      const opponentData = {
        name: factionModel.get('name'),
        factionId,
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
        const otherGeneralOrders = [SDK.FactionFactory.GeneralOrder.Secondary];
        for (let j = 0, jl = otherGeneralOrders.length; j < jl; j++) {
          const generalOrder = otherGeneralOrders[j];
          const otherOpponentData = UtilsJavascript.fastExtend({}, opponentData);
          const otherGeneralId = SDK.FactionFactory.generalIdForFactionByOrder(factionId, generalOrder);
          const otherGeneralCard = SDK.GameSession.getCardCaches().getCardById(otherGeneralId);
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

  onBeforeRender() {
    const opponentChoices = this.$el.find(`${this._opponentClassPrefix}-select-choices`);
    this._opponentScrollTop = opponentChoices.scrollTop();
  },

  onRender() {
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
      this.$el.find(`${this._opponentClassPrefix}[data-opponent-id='${this._selectedOpponentId}']`).addClass('active');
    }

    // restore opponent choices scroll
    this.$el.find(`${this._opponentClassPrefix}-select-choices`).scrollTop(this._opponentScrollTop);
  },

  onShow() {
    DeckSelectCompositeView.prototype.onShow.apply(this, arguments);

    // delegate listen for click on ai opponent
    this.$el.on('click', this._opponentClassPrefix, this.onSelectOpponent.bind(this));
  },

  /* region SELECTION */

  onSelectOpponent(event) {
    const $target = $(event.currentTarget);
    const opponentId = $target.data('opponent-id');
    const factionId = $target.data('faction-id');

    this.setSelectedOpponent(opponentId, factionId);
  },

  setSelectedOpponent(opponentId, factionId) {
    if (opponentId != null && this._selectedOpponentId !== opponentId) {
      // clear previous showing as active
      this.$el.find(`${this._opponentClassPrefix}[data-opponent-id='${this._selectedOpponentId}']`).removeClass('active');

      // store new
      this._selectedOpponentId = opponentId;
      this._selectedOpponentFactionId = factionId;

      // show new as active
      this.$el.find(`${this._opponentClassPrefix}[data-opponent-id='${opponentId}']`).addClass('active');

      // play select sound
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_select.audio, CONFIG.SELECT_SFX_PRIORITY);

      // emit select event
      this.trigger('select_opponent', opponentId);
    }
  },

  getConfirmSelectionEvent() {
    return EVENTS.start_single_player;
  },

  onConfirmSelection() {
    const selectedDeckModel = this._selectedDeckModel;
    const selectedOpponentId = this._selectedOpponentId;
    if (selectedDeckModel != null && selectedOpponentId != null) {
      this.ui.$deckSelectConfirm.addClass('disabled');
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);
      let aiDifficulty;
      let aiNumRandomCards;
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

  _updateFindDeckPopover() {
    // show no popover
  },

  /* endregion SELECTION */

  /* region AI TOOLS */

  onChangeDifficulty() {
    this._aiDifficulty = parseFloat(this.$el.find('.setting-difficulty input').val());
    if (_.isNumber(this._aiDifficulty) && this._aiDifficulty >= 0.0) {
      this.$el.find('.setting-difficulty output').text(`${this._aiDifficulty * 100.0}%`);
    } else {
      this.$el.find('.setting-difficulty output').text('auto');
    }
  },

  onChangeNumRandomCards() {
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
