'use strict';

var SlidingPanelItemView = require('app/ui/views/item/sliding_panel');
var Logger = require('app/common/logger');
var RiftHelper = require('app/sdk/rift/riftHelper');
var Templ = require('./templates/rift_run_deck.hbs');

var RiftRunDeck = SlidingPanelItemView.extend({

  className: 'sliding-panel deck-preview rift-run-deck',

  template: Templ,

  serializeModel: function (model) {
    var data = model.toJSON.apply(model, _.rest(arguments));

    var levelUpRequirement = RiftHelper.pointsRequiredForLevel(data.rift_level + 1);
    var pointsSoFar = data.rift_points - RiftHelper.totalPointsForLevel(data.rift_level);

    data.level_up_points_required = levelUpRequirement;
    data.rift_points_so_far = pointsSoFar;
    data.progress_percent = 100 * (pointsSoFar / levelUpRequirement);

    if (data.rift_rating == null) {
      data.rift_rating = 400;
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
module.exports = RiftRunDeck;
