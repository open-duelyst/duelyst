const Logger = require('app/common/logger');
const EVENTS = require('app/common/event_types');
const UtilsEnv = require('app/common/utils/utils_env');
const Scene = require('app/view/Scene');
const GameLayer = require('app/view/layers/game/GameLayer');
const SDK = require('app/sdk');
const PackageManager = require('app/ui/managers/package_manager');
const _ = require('underscore');

/**
 * performance.js - Multi-purpose client-side performance tracking tool.
 */
var PERF = {

  _started: false,
  _observing_loads: [],
  stats_by_id: {},

  /* region GETTERS / SETTERS */

  /**
   * Returns whether performance is currently being profiled.
   * @returns {Boolean}
   */
  get_started() {
    return this._started;
  },

  /**
   * Returns all stats recorded mapped by id.
   * @returns {Object}
   */
  get_stats() {
    return PERF.stats_by_id;
  },

  /**
   * Returns stats recorded for id.
   * @returns {Performance_Stats}
   */
  get_stats_by_id(id) {
    if (id != null) {
      return PERF.stats_by_id[id];
    }
  },

  /**
   * Returns all stats recorded as a plain data object.
   * @returns {Object}
   * @see get_stats_data_by_id
   */
  get_stats_data(noise_threshold, below_threshold, above_threshold, fixed, unconverted) {
    const data = {};
    for (const id in PERF.stats_by_id) {
      data[id] = PERF.get_stats_data_by_id(id);
    }
    return data;
  },

  /**
   * Returns stats recorded for id as a plain data object.
   * @param {Number} [noise_threshold=0] difference between average and entry to consider it noisy
   * @param {Number} [below_threshold=0] threshold which entries are considered below
   * @param {Number} [above_threshold=0] threshold which entries are considered above
   * @param {Number} [fixed=2] number of digits to appear after the decimal point
   * @param {Boolean} [unconverted=false] whether to get the raw recorded values
   * @returns {Object}
   */
  get_stats_data_by_id(id, noise_threshold, below_threshold, above_threshold, fixed, unconverted) {
    const stats_data = {};
    const stats = PERF.get_stats_by_id(id);
    if (stats != null) {
      stats_data.entries = stats.get_num_records();
      stats_data.average = stats.average(fixed, unconverted);
      stats_data.deviation = stats.deviation(fixed, unconverted);

      const stats_noise_threshold = noise_threshold != null ? noise_threshold : stats.get_noise_threshold();
      if (stats_noise_threshold != null) {
        stats_data[`noise(${stats_noise_threshold})`] = stats.noise(stats_noise_threshold, fixed, unconverted);
      }

      const stats_below_threshold = below_threshold != null ? below_threshold : stats.get_below_threshold();
      if (stats_below_threshold != null) {
        stats_data[`below(${stats_below_threshold})`] = stats.below(stats_below_threshold, fixed, unconverted);
      }
      const stats_above_threshold = above_threshold != null ? above_threshold : stats.get_above_threshold();
      if (stats_above_threshold != null) {
        stats_data[`above(${stats_above_threshold})`] = stats.above(stats_above_threshold, fixed, unconverted);
      }
    }
    return stats_data;
  },

  /**
   * Logs stats by id, or all stats recorded when no id present.
   * @see log_stats_by_id
   */
  log(id, noise_threshold, below_threshold, above_threshold, fixed, unconverted) {
    if (id != null) {
      PERF.log_stats_by_id(id, noise_threshold, below_threshold, above_threshold, fixed, unconverted);
    } else {
      for (var id in PERF.stats_by_id) {
        PERF.log_stats_by_id(id, noise_threshold, below_threshold, above_threshold, fixed, unconverted);
      }
    }
  },

  /**
   * Logs stats by id.
   * @param id
   * @param {Number} [noise_threshold=0] difference between average and entry to consider it noisy
   * @param {Number} [below_threshold=0] threshold which entries are considered below
   * @param {Number} [above_threshold=0] threshold which entries are considered above
   * @param {Number} [fixed=2] number of digits to appear after the decimal point
   * @param {Boolean} [unconverted=false] whether to get the raw recorded values
   */
  log_stats_by_id(id, noise_threshold, below_threshold, above_threshold, fixed, unconverted) {
    const stats = PERF.get_stats_by_id(id);
    if (stats != null) {
      Logger.module('PERF').group(`Performance for ${id}`);
      Logger.module('PERF').log('entries: ', stats.get_num_records());
      Logger.module('PERF').log('average: ', stats.average(fixed, unconverted));
      Logger.module('PERF').log('deviation: ', stats.deviation(fixed, unconverted));
      if (noise_threshold == null) { noise_threshold = stats.get_noise_threshold(); }
      if (noise_threshold != null) {
        Logger.module('PERF').log(`noise(${noise_threshold}): `, stats.noise(noise_threshold, fixed, unconverted));
      }
      if (below_threshold == null) { below_threshold = stats.get_below_threshold(); }
      if (below_threshold != null) {
        Logger.module('PERF').log(`below(${below_threshold}): `, stats.below(below_threshold, fixed, unconverted));
      }
      if (above_threshold == null) { above_threshold = stats.get_above_threshold(); }
      if (above_threshold != null) {
        Logger.module('PERF').log(`above(${above_threshold}): `, stats.above(above_threshold, fixed, unconverted));
      }
      Logger.module('PERF').groupEnd();
    } else {
      Logger.module('PERF').log(`no stats found for ${id}`);
    }
  },

  /* endregion GETTERS / SETTERS */

  /* region START / STOP */

  /**
   * Starts profiling performance by tracking all predefined methods.
   */
  start() {
    if (!PERF._started) {
      PERF._started = true;

      // register trackers after the current call stack completes
      _.defer(() => {
        PERF._start_tracking_draw_scene();
        PERF._start_tracking_loads();
        PERF._start_tracking_network();
      });
    }
  },

  /**
   * Stops profiling performance.
   */
  stop() {
    if (PERF._started) {
      PERF._started = false;

      // unregister trackers after the current call stack completes
      _.defer(() => {
        PERF._stop_tracking_draw_scene();
        PERF._stop_tracking_loads();
        PERF._stop_tracking_network();
      });
    }
  },

  /* endregion START / STOP */

  /* region TRACKING DRAW */

  _start_tracking_draw_scene() {
    // track engine scene draw loop
    const drawScene_stats = PERF.stats_by_id.FPS = new Performance_Stats(
      // 10 minute sample
      60 * 60 * 10,
      // convert recorded delta time values to fps
      ((val) => (val > 0 ? 1000.0 / val : 0.0)),
      // consider more than 5 frames off noisy
      5,
      // threshold for frame rates below 50
      50,
      // threshold for frame rates above 60
      60,
    );
    const drawScene_method = PERF._drawScene_method = cc.Director.prototype.drawScene;
    let drawScene_timestamp;
    const drawScene_wrapper = function () {
      if (PERF._observing_loads.length === 0) {
        // record delta time when not observing a load
        const timestamp_now = performance.now();
        drawScene_stats.record(timestamp_now - drawScene_timestamp);
        drawScene_timestamp = timestamp_now;
      }

      // call original method
      drawScene_method.call(this);
    };
    // wait for first call then swap to wrapper
    cc.Director.prototype.drawScene = function () {
      if (PERF._observing_loads.length === 0) {
        drawScene_timestamp = performance.now();
        drawScene_method.call(this);
        cc.Director.prototype.drawScene = drawScene_wrapper;
      } else {
        drawScene_method.call(this);
      }
    };
  },

  _stop_tracking_draw_scene() {
    if (PERF._drawScene_method != null) {
      cc.Director.prototype.drawScene = PERF._drawScene_method;
      PERF._drawScene_method = null;
    }
  },

  /* endregion TRACKING DRAW */

  /* region TRACKING LOAD */

  _start_tracking_loads() {
    // setup stats
    const load_major_nongame_stats = PERF.stats_by_id['Load out of Game (s)'] = new Performance_Stats(20, ((val) => val / 1000.0));
    const load_major_game_stats = PERF.stats_by_id['Load into Game (s)'] = new Performance_Stats(20, ((val) => val / 1000.0));
    const load_minor_game_stats = PERF.stats_by_id['Load during Game (ms)'] = new Performance_Stats(1000);

    // reference original methods
    const method_loadMajorPackage = PERF._method_loadMajorPackage = PackageManager.getInstance().loadMajorPackage;
    const method_activateLoadingMajorPackage = PERF._method_activateLoadingMajorPackage = PackageManager.getInstance().activateLoadingMajorPackage;
    const method_unloadUnusedMajorMinorPackages = PERF._method_unloadUnusedMajorMinorPackages = PackageManager.getInstance().unloadUnusedMajorMinorPackages;
    const method_loadMinorPackage = PERF._method_loadMinorPackage = PackageManager.getInstance().loadMinorPackage;

    // replace original methods
    let load_major_id;
    let load_major_timestamp;
    let load_major_promise;
    let activate_major_promise;
    let unload_major_promise;
    const on_major_promises_present = function () {
      if (load_major_id != null && load_major_promise != null && activate_major_promise != null && unload_major_promise != null) {
        Promise.all([
          load_major_promise,
          activate_major_promise,
          unload_major_promise,
        ]).then(() => {
          // when load resolves record time delta
          const time_delta = performance.now() - load_major_timestamp;
          if (load_major_id === 'game') {
            load_major_game_stats.record(time_delta);
          } else if (load_major_id === 'nongame') {
            load_major_nongame_stats.record(time_delta);
          }

          // no longer observing a load
          PERF._observing_loads = _.without(PERF._observing_loads, load_major_id);
          load_major_id = null;
        });
      }
    };
    PackageManager.getInstance().loadMajorPackage = function (majorId, minorIds, resources) {
      if (majorId !== PackageManager.getInstance().getMajorPackageId()) {
        // set performance as observing this load
        PERF._observing_loads.push(majorId);

        // track major id
        load_major_id = majorId;

        // get time at start of load
        load_major_timestamp = performance.now();

        // call original method
        load_major_promise = method_loadMajorPackage.call(PackageManager.getInstance(), majorId, minorIds, resources);

        // check if all promises present
        on_major_promises_present();

        return load_major_promise;
      }
      // call original method
      return method_loadMajorPackage.call(PackageManager.getInstance(), majorId, minorIds, resources);
    };
    PackageManager.getInstance().activateLoadingMajorPackage = function () {
      if (PackageManager.getInstance()._loadingMajorId === load_major_id && PackageManager.getInstance()._activeMajorId !== load_major_id) {
        activate_major_promise = method_activateLoadingMajorPackage.call(PackageManager.getInstance());

        // check if all promises present
        on_major_promises_present();

        return activate_major_promise;
      }
      return method_activateLoadingMajorPackage.call(PackageManager.getInstance());
    };
    PackageManager.getInstance().unloadUnusedMajorMinorPackages = function () {
      if (load_major_id != null) {
        unload_major_promise = method_unloadUnusedMajorMinorPackages.call(PackageManager.getInstance());

        // check if all promises present
        on_major_promises_present();

        return unload_major_promise;
      }
      return method_unloadUnusedMajorMinorPackages.call(PackageManager.getInstance());
    };
    PackageManager.getInstance().loadMinorPackage = function (id, resources, majorId) {
      const scene = Scene.getInstance();
      const game_layer = scene && scene.getGameLayer();
      if (game_layer != null && game_layer.getStatus() !== GameLayer.STATUS.DISABLED) {
        const load_minor_timestamp = performance.now();
        return method_loadMinorPackage.call(PackageManager.getInstance(), id, resources, majorId).then(() => {
          load_minor_game_stats.record(performance.now() - load_minor_timestamp);
        });
      }
      return method_loadMinorPackage.call(PackageManager.getInstance(), id, resources, majorId);
    };
  },

  _stop_tracking_loads() {
    if (PERF._method_loadMajorPackage != null) {
      PackageManager.getInstance().loadMajorPackage = PERF._method_loadMajorPackage;
      PERF._method_loadMajorPackage = null;
    }
    if (PERF._method_activateLoadingMajorPackage != null) {
      PackageManager.getInstance().activateLoadingMajorPackage = PERF._method_activateLoadingMajorPackage;
      PERF._method_activateLoadingMajorPackage = null;
    }
    if (PERF._method_unloadUnusedMajorMinorPackages != null) {
      PackageManager.getInstance().unloadUnusedMajorMinorPackages = PERF._method_unloadUnusedMajorMinorPackages;
      PERF._method_unloadUnusedMajorMinorPackages = null;
    }
    if (PERF._method_loadMinorPackage != null) {
      PackageManager.getInstance().loadMinorPackage = PERF._method_loadMinorPackage;
      PERF._method_loadMinorPackage = null;
    }
  },

  /* endregion TRACKING LOAD */

  /* region TRACKING LOAD */

  _start_tracking_network() {
    // setup stats
    const action_response_stats = PERF.stats_by_id['Server Action Response (ms)'] = new Performance_Stats(1000);

    // reference original methods
    const method_broadcastGameEvent = PERF._method_broadcastGameEvent = SDK.NetworkManager.getInstance().broadcastGameEvent;

    // replace original methods
    PERF.step_timestamp = performance.now();
    SDK.NetworkManager.getInstance().broadcastGameEvent = function (eventData) {
      const timestamp = performance.now();

      // call original method
      const validForBroadcast = method_broadcastGameEvent.call(SDK.NetworkManager.getInstance(), eventData);

      // valid step broadcast
      if (validForBroadcast) {
        const { step } = eventData;
        if (step != null && step.playerId === SDK.GameSession.getInstance().getMyPlayerId()) {
          // record timestamp by step index
          PERF.step_timestamp = timestamp;
        }
      }

      return validForBroadcast;
    };
    SDK.NetworkManager.getInstance().getEventBus().on(EVENTS.network_game_event, PERF._on_game_event, PERF);
  },

  _on_game_event(eventData) {
    if (PERF.step_timestamp != null) {
      const { step } = eventData;
      if (step != null && step.playerId === SDK.GameSession.getInstance().getMyPlayerId()) {
        // record time delta
        PERF.stats_by_id['Server Action Response (ms)'].record(performance.now() - PERF.step_timestamp);
        PERF.step_timestamp = null;
      }
    }
  },

  _stop_tracking_network() {
    if (PERF._method_broadcastGameEvent != null) {
      SDK.NetworkManager.getInstance().broadcastGameEvent = PERF._method_broadcastGameEvent;
      PERF._method_broadcastGameEvent = null;
    }
    SDK.NetworkManager.getInstance().getEventBus().off(EVENTS.network_game_event, PERF._on_game_event, PERF);
    PERF.step_timestamp = null;
  },

  /* endregion TRACKING LOAD */

};

/**
 * Performance stats object.
 * @param {Number} max_records max number of recorded stat values.
 * @param {Function} [converter=null] method used to convert recorded values into output values.
 * @param {Number} [noise_threshold=0] difference between average and entry to consider it noisy
 * @param {Number} [below_threshold=0] threshold which entries are considered below
 * @param {Number} [above_threshold=0] threshold which entries are considered above
 */
var Performance_Stats = function (max_records, converter, noise_threshold, below_threshold, above_threshold) {
  // preallocate an array buffer that can record for n entries
  // stats are recorded as 32-bit floating point numbers
  const bytes_per_stat = 4;
  this._max_records = max_records;
  this._buffer = new ArrayBuffer(this._max_records * bytes_per_stat);
  this._buffer_interface = new Float32Array(this._buffer);
  this.set_converter(converter);
  this.set_noise_threshold(noise_threshold);
  this.set_below_threshold(below_threshold);
  this.set_above_threshold(above_threshold);
};

Performance_Stats.prototype = {
  constructor: Performance_Stats,

  _buffer: null,
  _buffer_interface: null,

  _max_records: 0,
  _num_records: 0,
  _record_index: 0,

  _noise_threshold: null,
  _above_threshold: null,
  _below_threshold: null,

  _converter(val) { return val; },

  /**
   * Gets number of recorded values.
   * @returns {Number}
   */
  get_num_records() {
    return this._num_records;
  },

  /**
   * Sets a method to use to convert recorded values when performing averages, deviations, etc.
   * @param {Function} converter
   */
  set_converter(converter) {
    if (_.isFunction(converter)) {
      this._converter = converter;
    }
  },

  /**
   * Sets the noise threshold
   * @param {Number} val
   */
  set_noise_threshold(val) {
    if (_.isNumber(val)) {
      this._noise_threshold = val;
    }
  },
  get_noise_threshold() {
    return this._noise_threshold;
  },

  /**
   * Sets the below threshold
   * @param {Number} val
   */
  set_below_threshold(val) {
    if (_.isNumber(val)) {
      this._below_threshold = val;
    }
  },
  get_below_threshold() {
    return this._below_threshold;
  },

  /**
   * Sets the above threshold
   * @param {Number} val
   */
  set_above_threshold(val) {
    if (_.isNumber(val)) {
      this._above_threshold = val;
    }
  },
  get_above_threshold() {
    return this._above_threshold;
  },

  /**
   * Resets recorded data.
   */
  reset() {
    this._num_records = 0;
    this._record_index = 0;
  },

  /**
   * Records the next value and advances the record counter.
   * @param {Number} val
   */
  record(val) {
    this._buffer_interface[this._record_index] = val;

    // advance index
    this._record_index++;
    if (this._record_index > this._max_records) {
      // loop index around when reached end
      this._record_index = 0;
    }

    // track number of entries recorded
    if (this._num_records < this._max_records) {
      this._num_records++;
    }
  },

  _to_fixed(val, places) {
    if (places == null) { places = 2; }
    return +(`${Math.round(`${val}e+${places}`)}e-${places}`);
  },

  /**
   * Returns an array of all recorded values.
   * @param {Boolean} [unconverted=false] whether to get the raw recorded values
   * @returns {Array}
   */
  get_recorded_values(unconverted) {
    const result = [];
    const num_records = this._num_records;

    if (num_records > 0) {
      const buffer_interface = this._buffer_interface;
      if (unconverted) {
        // raw
        for (var i = 0; i < num_records; i++) {
          result.push(buffer_interface[i]);
        }
      } else {
        // converted
        for (var i = 0; i < num_records; i++) {
          result.push(this._converter(buffer_interface[i]));
        }
      }
    }

    return result;
  },

  /**
   * Calculates the average for all entries recorded.
   * @param {Number} [fixed=2] number of digits to appear after the decimal point
   * @param {Boolean} [unconverted=false] whether to get the raw recorded values
   * @returns {Number}
   */
  average(fixed, unconverted) {
    const recorded_values = this.get_recorded_values(unconverted);
    let result = 0;

    if (recorded_values.length > 0) {
      for (let i = 0, il = recorded_values.length; i < il; i++) {
        result += recorded_values[i];
      }
      result = this._to_fixed(result / recorded_values.length, fixed);
    }

    return result;
  },

  /**
   * Calculates the standard deviation for all entries recorded.
   * @param {Number} [fixed=2] number of digits to appear after the decimal point
   * @param {Boolean} [unconverted=false] whether to get the raw recorded values
   * @returns {Number}
   */
  deviation(fixed, unconverted) {
    const recorded_values = this.get_recorded_values(unconverted);
    let result = 0;

    if (recorded_values.length > 0) {
      const average = this.average(unconverted);
      let squared_average = 0;
      for (let i = 0, il = recorded_values.length; i < il; i++) {
        squared_average += (recorded_values[i] - average) ** 2;
      }
      result = this._to_fixed(Math.sqrt(squared_average / recorded_values.length), fixed);
    }

    return result;
  },

  /**
   * Calculates the noise ratio for all entries recorded, or how often the entries deviated from the average as a percent.
   * @param {Number} [threshold=0] difference between average and entry to consider it deviated
   * @param {Number} [fixed=2] number of digits to appear after the decimal point
   * @param {Boolean} [unconverted=false] whether to get the raw recorded values
   * @returns {String}
   */
  noise(threshold, fixed, unconverted) {
    const recorded_values = this.get_recorded_values(unconverted);
    let result = 0;

    if (recorded_values.length > 0) {
      if (threshold == null) { threshold = this._noise_threshold; }
      if (threshold != null) {
        const average = this.average();
        for (let i = 0, il = recorded_values.length; i < il; i++) {
          if (Math.abs(recorded_values[i] - average) >= threshold) {
            result++;
          }
        }
        result = this._to_fixed((result / recorded_values.length) * 100.0, fixed);
      }
    }

    return `${result}%`;
  },

  /**
   * Calculates how often the entries were below a threshold as a percent.
   * @param {Number} [threshold=0]
   * @param {Number} [fixed=2] number of digits to appear after the decimal point
   * @param {Boolean} [unconverted=false] whether to get the raw recorded values
   * @returns {String}
   */
  below(threshold, fixed, unconverted) {
    const recorded_values = this.get_recorded_values(unconverted);
    let result = 0;

    if (recorded_values.length > 0) {
      if (threshold == null) { threshold = this._below_threshold; }
      if (threshold != null) {
        for (let i = 0, il = recorded_values.length; i < il; i++) {
          if (recorded_values[i] < threshold) {
            result++;
          }
        }
        result = this._to_fixed((result / recorded_values.length) * 100.0, fixed);
      }
    }

    return `${result}%`;
  },

  /**
   * Calculates how often the entries were above a threshold as a percent.
   * @param {Number} [threshold=0]
   * @param {Number} [fixed=2] number of digits to appear after the decimal point
   * @param {Boolean} [unconverted=false] whether to get the raw recorded values
   * @returns {String}
   */
  above(threshold, fixed, unconverted) {
    const recorded_values = this.get_recorded_values(unconverted);
    let result = 0;

    if (recorded_values.length > 0) {
      if (threshold == null) { threshold = this._above_threshold; }
      if (threshold != null) {
        for (let i = 0, il = recorded_values.length; i < il; i++) {
          if (recorded_values[i] > threshold) {
            result++;
          }
        }
        result = this._to_fixed((result / recorded_values.length) * 100.0, fixed);
      }
    }

    return `${result}%`;
  },
};

// auto start profiling when not in production
if (!UtilsEnv.getIsInProduction()) {
  PERF.start();
}

module.exports = PERF;
