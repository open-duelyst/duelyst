const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
const moment = require('moment');

const PresenceModel = DuelystFirebase.Model.extend({

  /**
  * Get the reliable status of this buddy presence. Using get('status') is not enough as it doesn't check if that status is REALLY old.
  * @public
  * @returns {string} presence status of this buddy
  */
  getStatus() {
    if (this.get('began') && this.get('status') != 'offline') {
      const began = parseInt(this.get('began'));
      const now = moment.utc().valueOf();
      const diff = now - began;
      const duration = moment.duration(diff);
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
