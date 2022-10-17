'use strict';

var SlidingPanelItemView = require('app/ui/views/item/sliding_panel');
var Logger = require('app/common/logger');
var moment = require('moment');
var Templ = require('./templates/arena_run_deck.hbs');

var ArenaRunDeck = SlidingPanelItemView.extend({

  className: 'sliding-panel deck-preview gauntlet-run-deck',

  template: Templ,

  serializeModel: function (model) {
    var data = model.toJSON.apply(model, _.rest(arguments));

    if (data.ended_at == null) {
      data.status_text = 'CURRENT';
    } else {
      var expiresMoment = moment.utc(data.ended_at).add(CONFIG.DAYS_BEFORE_GAUNTLET_DECK_EXPIRES, 'days');
      var durationToExpiration = moment.duration(expiresMoment.valueOf() - moment.utc().valueOf());
      data.status_text = 'EXPIRES IN ' + durationToExpiration.humanize();
    }

    return data;
  },

  onRender: function () {
    SlidingPanelItemView.prototype.onRender.call(this);

    // add faction class
    var factionId = this.model.get('faction_id');
    this.$el.addClass('f' + factionId);
  },

  getIsEnabled: function () {
    return true;
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ArenaRunDeck;
