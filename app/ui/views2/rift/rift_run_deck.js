const SlidingPanelItemView = require('app/ui/views/item/sliding_panel');
const Logger = require('app/common/logger');
const RiftHelper = require('app/sdk/rift/riftHelper');
const Templ = require('./templates/rift_run_deck.hbs');

const RiftRunDeck = SlidingPanelItemView.extend({

  className: 'sliding-panel deck-preview rift-run-deck',

  template: Templ,

  serializeModel(model) {
    const data = model.toJSON.apply(model, _.rest(arguments));

    const levelUpRequirement = RiftHelper.pointsRequiredForLevel(data.rift_level + 1);
    const pointsSoFar = data.rift_points - RiftHelper.totalPointsForLevel(data.rift_level);

    data.level_up_points_required = levelUpRequirement;
    data.rift_points_so_far = pointsSoFar;
    data.progress_percent = 100 * (pointsSoFar / levelUpRequirement);

    if (data.rift_rating == null) {
      data.rift_rating = 400;
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
module.exports = RiftRunDeck;
