'use strict';

var SDK = require('app/sdk');
var moment = require('moment');
var semver = require('semver');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');

var Template = require('./templates/referral_event_history.hbs');

var ReferralEventHistoryView = Backbone.Marionette.ItemView.extend({

  id: 'referral-event-history',
  className: 'modal duelyst-modal',
  template: Template,

  serializeModel: function (model) {
    var data = model.toJSON.apply(model, _.rest(arguments));
    _.each(data.eventHistory, function (row) {
      row.updated_at = row.updated_at || row.created_at;
      switch (row.level_reached) {
      case 1:
        row.level_reached = 'silver';
        break;
      case 2:
        row.level_reached = 'gold';
        break;
      default:
        row.level_reached = 'registered';
        break;
      }
    });
    return data;
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ReferralEventHistoryView;
