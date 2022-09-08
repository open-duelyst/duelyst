const SDK = require('app/sdk');
const moment = require('moment');
const semver = require('semver');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');

const Template = require('./templates/referral_event_history.hbs');

const ReferralEventHistoryView = Backbone.Marionette.ItemView.extend({

  id: 'referral-event-history',
  className: 'modal duelyst-modal',
  template: Template,

  serializeModel(model) {
    const data = model.toJSON.apply(model, _.rest(arguments));
    _.each(data.eventHistory, (row) => {
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
