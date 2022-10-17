// pragma PKGS: game

'use strict';

var CONFIG = require('app/common/config');
var NewPlayerManager = require('app/ui/managers/new_player_manager');
var Template = require('app/ui/templates/composite/game_player_profile_preview.hbs');
var ItemTemplate = require('app/ui/templates/item/game_player_profile_preview_ribbon_item.hbs');
var SDK = require('app/sdk');
var i18next = require('i18next');

/*
  Ribbon Item
*/
var RibbonItemView = Backbone.Marionette.ItemView.extend({

  template: ItemTemplate,
  tagName: 'li',

  serializeModel: function (model) {
    var data = model.toJSON.apply(model, _.rest(arguments));
    var ribbonData = SDK.RibbonFactory.ribbonForIdentifier(data.ribbon_id);
    data.img_src = ribbonData.rsx.img;
    data.show_count = data.count > 1;
    data.title = ribbonData.title;
    data.description = ribbonData.description;
    return data;
  },

});

/*
  Player Profile Preview
*/
var GamePlayerProfilePreview = Backbone.Marionette.CompositeView.extend({

  className: 'app-game-player-profile-preview',
  template: Template,
  childView: RibbonItemView,
  childViewContainer: '.ribbons',

  serializeModel: function (model) {
    var data = model.toJSON.apply(model, _.rest(arguments));
    if (SDK.GameSession.getInstance().isSinglePlayer()) {
      data.username = i18next.t('battle.your_name_default_label');
    } else {
      data.isOpponent = data.username != SDK.GameSession.getInstance().getMyPlayer().getUsername();
    }

    if ((!SDK.GameSession.getInstance().isRanked()
      && NewPlayerManager.getInstance().getCurrentCoreStage().value < SDK.NewPlayerProgressionStageEnum.FirstGameDone.value)
      || SDK.GameSession.getInstance().isGauntlet() || SDK.GameSession.getInstance().isCasual()) {
      // don't show division information until player has played first ranked game
      // never show division information in gauntlet and casual
      delete data.division_name;
      delete data.division_class;
    } else if (data.rank != null) {
      try {
        data.division_name = SDK.RankFactory.rankedDivisionNameForRank(data.rank).toUpperCase();
        data.division_class = SDK.RankFactory.rankedDivisionAssetNameForRank(data.rank).toLowerCase();
      } catch (ex) {
        console.error(ex);
      }
    }
    return data;
  },

  initialize: function () {
    this.listenTo(this.model, 'change', this.render);
  },
  onRender: function () {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip('destroy').tooltip({ container: CONFIG.OVERLAY_SELECTOR, trigger: 'hover' });
  },
  onDestroy: function () {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip('destroy');
    $('.tooltip').remove();
  },

});

// Expose the class either via CommonJS or the global object
module.exports = GamePlayerProfilePreview;
