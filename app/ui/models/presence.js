'use strict';

var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
var moment = require('moment');

var PresenceModel = DuelystFirebase.Model.extend({

  /**
  * Get the reliable status of this buddy presence. Using get('status') is not enough as it doesn't check if that status is REALLY old.
  * @public
  * @returns {string} presence status of this buddy
  */
  getStatus: function () {
    if (this.get('began') && this.get('status') != 'offline') {
      var began = parseInt(this.get('began'));
      var now = moment.utc().valueOf();
      var diff = now - began;
      var duration = moment.duration(diff);
      if (duration.asDays() > 0.75) {
        // looks like the start of this status was almost a day ago. default to offline
        return 'offline';
      }
    }

    // by default return status
    return this.get('status');
  },

});

// Expose the class either via CommonJS or the global object
module.exports = PresenceModel;
