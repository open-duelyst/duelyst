const SlidingPanelItemView = require('app/ui/views/item/sliding_panel');
const Logger = require('app/common/logger');
const moment = require('moment');
const Templ = require('./templates/arena_run_deck.hbs');

const ArenaRunDeck = SlidingPanelItemView.extend({

  className: 'sliding-panel deck-preview gauntlet-run-deck',

  template: Templ,

  serializeModel(model) {
    const data = model.toJSON.apply(model, _.rest(arguments));

    if (data.ended_at == null) {
      data.status_text = 'CURRENT';
    } else {
      const expiresMoment = moment.utc(data.ended_at).add(CONFIG.DAYS_BEFORE_GAUNTLET_DECK_EXPIRES, 'days');
      const durationToExpiration = moment.duration(expiresMoment.valueOf() - moment.utc().valueOf());
      data.status_text = `EXPIRES IN ${durationToExpiration.humanize()}`;
    }

    return data;
  },

  onRender() {
    SlidingPanelItemView.prototype.onRender.call(this);

    // add faction class
    const factionId = this.model.get('faction_id');
    this.$el.addClass(`f${factionId}`);
  },

  getIsEnabled() {
    return true;
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ArenaRunDeck;
