const _ = require('underscore');
const Promise = require('bluebird');
const UtilsAudio = require('../common/utils/utils_audio');

let _audio_id = 0;

/**
 *  audio_object - wrapper/controller object for handling an audio file.
 *  @param {String|Object} options audio src as string or a options object
 */
const audio_object = function (options) {
  this._id = _audio_id++;

  // merge options
  if (_.isString(options)) {
    this.src = options;
  } else if (_.isObject(options)) {
    _.extend(this, options);
  }

  // set stopped state
  this._state = audio_object.STATE_STOPPED;

  // create web audio element
  this._element = new Audio();

  // wait for played
  this._element.onplaying = this._on_playing.bind(this);

  // wait for ended
  this._element.onended = this._on_ended.bind(this);

  // handle errors
  this._element.onerror = this._on_error.bind(this);

  // set starting values
  this.set_volume(this.get_volume());
  this._element.loop = this.get_loop();
  this._element.autoplay = this.get_autoplay();

  // set audio source
  this._element.src = this.get_src();
};

audio_object.prototype = {

  constructor: audio_object,

  _id: null,

  _element: null,
  _errorPromise: Promise.resolve(),
  _erroredForSrc: null,
  _fadeId: 0,
  _fadeDuration: 0.0,
  _pausePromise: Promise.resolve(),
  _playingPromise: Promise.resolve(),
  _playingAndFadedInPromise: Promise.resolve(),
  _state: null,
  _stoppedPromise: Promise.resolve(),
  _targetVolume: 1.0,
  _when_playing_promise: Promise.resolve(),
  _when_playing_resolve: null,
  _when_ended_promise: Promise.resolve(),
  _when_ended_resolve: null,

  autoplay: false,
  loop: false,
  src: '',
  volume: 1.0,

  /* region GETTERS / SETTERS */

  get_id() {
    return this._id;
  },

  get_element() {
    return this._element;
  },

  is_playing() {
    return !this._element.paused;
  },

  set_src(val) {
    if (!_.isString(val)) {
      val = '';
    }
    if (this.src !== val) {
      this._resetErrorRetry();
      this.src = val;
      this._element.src = val;
    }
  },

  get_src() {
    return this.src;
  },

  set_volume(val) {
    this.volume = this._targetVolume = UtilsAudio.getValidVolume(val);
    this._element.volume = this.get_volume();
  },

  get_volume() {
    return this.volume;
  },

  set_loop(val) {
    if (!_.isBoolean(val)) {
      val = false;
    }
    this.loop = val;
    this._element.loop = val;
  },

  get_loop() {
    return this.loop;
  },

  set_autoplay(val) {
    if (!_.isBoolean(val)) {
      val = false;
    }
    this.autoplay = val;
    this._element.autoplay = val;
  },

  get_autoplay() {
    return this.autoplay;
  },

  get_elapsed() {
    return (this._element && this._element.currentTime) || 0.0;
  },

  set_elapsed(val) {
    if (this._element != null) {
      if (val == null || !_.isNumber(val)) {
        val = 0.0;
      } else {
        val = Math.max(0.0, Math.min(this.get_duration(), val));
      }
      this._element.currentTime = val;
    }
  },

  get_duration() {
    return (this._element && this._element.duration) || 0.0;
  },

  get_is_playing() {
    return this._state === audio_object.STATE_PLAYING;
  },

  get_is_paused() {
    return this._state === audio_object.STATE_PAUSED;
  },

  get_is_stopped() {
    return this._state === audio_object.STATE_STOPPED;
  },

  /* endregion EVENTS */

  /**
   * Returns a promise that resolves when the audio starts playing.
   * @returns {Promise}
   */
  when_playing() {
    return this._when_playing_promise;
  },

  _on_playing() {
    if (this._when_playing_resolve != null) {
      this._when_playing_resolve();
      this._when_playing_resolve = null;
      this._when_playing_promise = null;
    }

    this._state = audio_object.STATE_PLAYING;
  },

  /**
   * Returns a promise that resolves when the audio finishes playing or is stopped.
   * @returns {Promise}
   */
  when_ended() {
    return this._when_ended_promise;
  },

  _on_ended() {
    if (this._when_ended_resolve != null) {
      this._when_ended_resolve();
      this._when_ended_resolve = null;
      this._when_ended_promise = null;
    }

    this._state = audio_object.STATE_STOPPED;
  },

  _on_error(error) {
    const { src } = this;
    const state = this._state;
    if (src != null && src !== '' && this._erroredForSrc !== src && state === audio_object.STATE_PLAYING) {
      // retain resolves to pass back into play on retry
      const whenPlayingPromise = this._when_playing_promise;
      const whenPlayingResolve = this._when_playing_resolve;
      this._when_playing_promise = this._when_playing_resolve = null;
      const whenEndedPromise = this._when_ended_promise;
      const whenEndedResolve = this._when_ended_resolve;
      this._when_ended_promise = this._when_ended_resolve = null;

      // set state to error
      this._state = audio_object.STATE_ERROR;

      this._errorPromise = new Promise((resolve, reject) => {
        if (this.src === src && this._state === audio_object.STATE_ERROR) {
          // set that we've errored for this src
          // so that we don't retry more than once
          this._erroredForSrc = src;

          // clear src to stop loading
          this._element.src = '';

          // restore resolves to ensure pause/stop requests during retry delay work
          this._when_playing_promise = whenPlayingPromise;
          this._when_playing_resolve = whenPlayingResolve;
          this._when_ended_promise = whenEndedPromise;
          this._when_ended_resolve = whenEndedResolve;

          // wait a bit and retry once
          setTimeout(resolve, 1000);
        }
      })
        .then(() => {
          if (this.src === src && this._state === audio_object.STATE_ERROR) {
            this._state = null;
            return this.play(this._fadeDuration, this._targetVolume, whenPlayingPromise, whenPlayingResolve, whenEndedPromise, whenEndedResolve);
          }
          return null;
        });
    }

    return this._errorPromise;
  },

  _resetErrorRetry() {
    this._erroredForSrc = null;
    this._errorPromise = Promise.resolve();
  },

  /* region EVENTS */

  /* endregion GETTERS / SETTERS */

  /* region PLAY */

  /**
   * Plays audio and returns a promise.
   * @param [fadeDuration=0]
   * @param [volume=1]
   * @returns {Promise}
   */
  play(fadeDuration, volume, whenPlayingPromise, whenPlayingResolve, whenEndedPromise, whenEndedResolve) {
    const state = this._state;
    if (state === audio_object.STATE_ERROR) {
      this._playingPromise = this._playingAndFadedInPromise = this._errorPromise;
    } else if (state !== audio_object.STATE_PLAYING) {
      if (state !== audio_object.STATE_PAUSED) {
        // create promise for when this starts playing
        if (whenPlayingPromise != null && whenPlayingResolve != null) {
          this._when_playing_promise = whenPlayingPromise;
          this._when_playing_resolve = whenPlayingResolve;
        } else {
          this._on_playing();
          this._when_playing_promise = new Promise((resolve, reject) => {
            this._when_playing_resolve = resolve;
          });
        }

        // create promise for when this has ended
        if (whenEndedPromise != null && whenEndedResolve != null) {
          this._when_ended_promise = whenEndedPromise;
          this._when_ended_resolve = whenEndedResolve;
        } else {
          this._on_ended();
          this._when_ended_promise = new Promise((resolve, reject) => {
            this._when_ended_resolve = resolve;
          });
        }

        // ensure audio source is set
        if (this._element.src !== this.src) {
          this._element.src = this.src;
        }
      }

      // set as playing
      this._state = audio_object.STATE_PLAYING;

      // play audio
      const playingPromise = this._element.play();
      if (playingPromise != null) {
        this._playingPromise = playingPromise.catch(this._on_error.bind(this));
      }

      // start at 0 volume and fade in
      this.set_volume(0);
      this._playingAndFadedInPromise = this.fade_to(fadeDuration, volume);
    }

    return this._playingAndFadedInPromise;
  },

  /**
   * Stops audio and returns a promise.
   * @param [fadeDuration=0]
   * @returns {Promise}
   */
  stop(fadeDuration) {
    const state = this._state;
    if (state === audio_object.STATE_ERROR) {
      this._on_playing();
      this._on_ended();
      this._stoppedPromise = Promise.resolve();
    } else if (state === audio_object.STATE_PAUSED) {
      this._stoppedPromise = this._pausePromise.then(() => {
        // ensure still stopped in case of promise race conditions
        if (this._state === audio_object.STATE_STOPPED) {
          // end previous
          this._on_playing();
          this._on_ended();

          // clear the src to stop streaming
          this._element.src = '';
        }
      });
    } else if (state === audio_object.STATE_PLAYING) {
      this._stoppedPromise = this.fade_out(fadeDuration).then(() => {
        // ensure still stopped in case of promise race conditions
        if (this._state === audio_object.STATE_STOPPED) {
          // end previous
          this._on_playing();
          this._on_ended();

          // pause element (returns a promise)
          return this._element.pause();
        }
        return null;
      }).then(() => {
        // clear the src to stop streaming
        this._element.src = '';
      });
    }

    // set state as stopped
    this._state = audio_object.STATE_STOPPED;
    return this._stoppedPromise;
  },

  /**
   * Pauses audio and returns a promise.
   * @param [fadeDuration=0]
   * @returns {Promise}
   */
  pause(fadeDuration) {
    const state = this._state;
    if (state === audio_object.STATE_ERROR) {
      this._on_playing();
      this._on_ended();
      this._pausePromise = Promise.resolve();
    } else if (state === audio_object.STATE_PLAYING) {
      this._state = audio_object.STATE_PAUSED;

      this._pausePromise = this.fade_out(fadeDuration).then(() => {
        // ensure still paused in case of promise race conditions
        if (this._state === audio_object.STATE_PAUSED) {
          // pause element (returns a promise)
          return this._element.pause();
        }
        return null;
      });
    }

    return this._pausePromise;
  },

  /* endregion PLAY */

  /* region FADE */

  fade_in(duration) {
    return this.fade_to(duration, 1.0);
  },

  fade_out(duration) {
    return this.fade_to(duration, 0.0);
  },

  fade_to(duration, volume) {
    if (duration == null) { duration = 0.0; }
    if (volume == null) { volume = 1.0; }

    // stop current running fade
    this.stop_fade();

    // get current fade id
    const fadeId = this._fadeId;

    // store fade values
    this._fadeDuration = duration;
    this._targetVolume = volume;

    // return a promise for new fade once started playing
    return this._playingPromise.then(() => new Promise((resolve, reject) => {
      // fade has changed
      if (fadeId !== this._fadeId) {
        resolve();
      } else if (this.volume !== volume && _.isNumber(duration) && duration > 0) {
        // fade over duration
        this._fadeAction = cc.sequence(
          cc.actionTween(duration, 'volume', this.volume, volume).easing(cc.EaseInOut(3.0)),
          cc.callFunc(resolve),
        );
        cc.director.getActionManager().addAction(this._fadeAction, this);
      } else {
        // instant fade
        this.set_volume(volume);
        resolve();
      }
    }));
  },

  stop_fade() {
    // update fade id
    this._fadeId++;

    // stop any running fade actions
    if (this._fadeAction != null) {
      cc.director.getActionManager().removeAction(this._fadeAction);
      this._fadeAction = null;
    }
  },

  // cocos callback on action update
  // TODO: decouple audio from cocos
  updateTweenAction(val, key) {
    if (key === 'volume') {
      // don't use set volume as it sets target volume
      this.volume = UtilsAudio.getValidVolume(val);
      this._element.volume = this.get_volume();
    }
  },

  /* endregion FADE */

};

audio_object.STATE_STOPPED = 1;
audio_object.STATE_PLAYING = 2;
audio_object.STATE_PAUSED = 3;
audio_object.STATE_ERROR = 4;

audio_object.create = function (options, audio) {
  return audio || new audio_object(options);
};

module.exports = audio_object;
