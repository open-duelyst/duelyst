var CONFIG = require('app/common/config');
var Animation = require('web-animations-js');

var BBMView = Backbone.Marionette.View;
var BBMRegion = Backbone.Marionette.Region;

/**
 * UI Animation helper object. Please use this when animating as it is far more performant than the built in jQuery animation methods.
 * Can be used to attach animation functions to views for transition in/out or just calling in the context of a ui element.
 * @example
 * // attach to a view for automatic transition in/out when added to a region
 * var Animations = require("relative/path/to/animations");
 * var ViewClass = Backbone.Marionette.ItemView.extend({
 *     animateIn: Animations.fadeIn,
 *     animateOut: Animations.fadeOut
 * });
 *
 * // call in the context of any view instance
 * var view = new ViewClass();
 * Animations.fadeIn.call(view);
 * // call on a specific ui element of a view
 * Animations.fadeIn.call(view.ui.$element);
 * // call with a specific duration in ms
 * Animations.fadeIn.call(view, 1000.0);
 *
 * // create your own custom animation in on a view instance
 * var customDuration = 1000.0;
 * var customDelay = 0.0;
 * var customAnimation = Animations.animateIn.call(view, function (view, $el, el, duration, delay) {
 *  return el.animate([
 *    {"opacity": 0.0}, // css from
 *    {"opacity": 1.0} // css to
 *  ], {
 *    duration: duration,
 *    delay: delay,
 *    fill: 'forwards' // fill forwards to keep the final state
 *  });
 * }, customDuration, customDelay);
 */
var Animations = {

  _animationId: 0,
  _animationsById: {},

  /* region HELPERS */

  _getAnimationForView: function (view) {
    var id = view instanceof $ ? view.data('_animationId') : view._animationId;
    return Animations._animationsById[id];
  },

  _storeAnimationForView: function (view, animation) {
    var id = Animations._animationId++;
    if (view instanceof $) {
      view.data('_animationId', id);
    } else {
      view._animationId = id;
    }
    Animations._animationsById[id] = animation;
  },

  _destroyAnimationForView: function (view) {
    var id = view instanceof $ ? view.data('_animationId') : view._animationId;
    if (id != null) {
      if (view instanceof $) {
        view.data('_animationId', '');
      } else {
        delete view._animationId;
      }
      delete Animations._animationsById[id];
    }
  },

  _isTimeoutId: function (animation) {
    return animation && _.isNumber(animation);
  },
  _isAnimation: function (animation) {
    return animation && _.isFunction(animation.cancel);
  },

  /* endregion HELPERS */

  /* region ANIMATION */

  /**
   * Method to handle setup and teardown of animations. Triggers an "animated" event when finished.
   * NOTE: call animateIn or animateOut instead if specific in/out animation events are needed.
   * @param callback callback that creates and returns an animation, args: view, $el, el, duration, delay
   * @param {Number} [duration=CONFIG.VIEW_TRANSITION_DURATION]
   * @param {Number} [delay=0]
   * @returns {Animation}
   */
  animate: function (callback, duration, delay) {
    // determine view and elements
    var view; var $el; var el;
    if (this instanceof BBMView || this instanceof BBMRegion) { view = this; $el = this.$el; } else { view = $el = this; }
    if ($el instanceof $) { el = $el[0]; } else { el = $el; }

    // set default duration and delay
    if (!_.isNumber(duration)) { duration = CONFIG.VIEW_TRANSITION_DURATION * 1000.0; }
    if (!_.isNumber(delay)) { delay = 0.0; }

    // stop any existing animations
    Animations.stop.call(this);

    // make sure the element is visible
    $el.css('visibility', '');

    // execute callback to generate animation
    var animation = callback(view, $el, el, duration, delay);

    // store animation
    Animations._storeAnimationForView(view, animation);

    // cleanup when animation finished
    if (Animations._isAnimation(animation)) {
      var onfinish = animation.onfinish;
      animation.onfinish = function () {
        Animations._destroyAnimationForView(view);
        view.trigger('animated');
        if (onfinish != null) { onfinish(); }
      };
    }

    return animation;
  },

  /**
   * Method to handle setup and teardown of animation in. Triggers an "animatedIn" event when finished.
   * @param callback callback that creates and returns an animation, args: view, $el, el, duration, delay
   * @param {Number} [duration=CONFIG.VIEW_TRANSITION_DURATION]
   * @param {Number} [delay=0]
   * @returns {Animation}
   * @see Animations.animate
   */
  animateIn: function (callback, duration, delay) {
    return Animations.animate.call(this, function (view, $el, el, duration, delay) {
      // execute callback to generate animation
      var animation = callback(view, $el, el, duration, delay);

      if (Animations._isAnimation(animation)) {
        var onfinish = animation.onfinish;
        animation.onfinish = function () {
          if (onfinish != null) {
            onfinish();
          }
          view.trigger('animatedIn');
        };
      }

      return animation;
    }, duration, delay);
  },
  /**
   * Method to handle setup and teardown of animation out. Triggers an "animatedOut" event and hides the element when finished.
   * @param callback callback that creates and returns an animation, args: view, $el, el, duration, delay
   * @param {Number} [duration=CONFIG.VIEW_TRANSITION_DURATION]
   * @param {Number} [delay=0]
   * @returns {Animation}
   * @see Animations.animate
   */
  animateOut: function (callback, duration, delay) {
    return Animations.animate.call(this, function (view, $el, el, duration, delay) {
      // execute callback to generate animation
      var animation = callback(view, $el, el, duration, delay);

      if (Animations._isAnimation(animation)) {
        var onfinish = animation.onfinish;
        animation.onfinish = function () {
          $el.css('visibility', 'hidden');
          if (onfinish != null) {
            onfinish();
          }
          view.trigger('animatedOut');
        };
      }

      return animation;
    }, duration, delay);
  },
  /**
   * Stops any currently running animations that were created through the Animation helpers.
   */
  stop: function () {
    var view; var $el;
    if (this instanceof BBMView || this instanceof BBMRegion) { view = this; $el = this.$el; } else { view = $el = this; }
    var animation = Animations._getAnimationForView(view);
    if (animation != null) {
      if (Animations._isTimeoutId(animation)) {
        clearTimeout(animation);
      } else if (Animations._isAnimation(animation)) {
        animation.cancel();
      }
      Animations._destroyAnimationForView(view);
    }
    if (view._cssClassesAnimating != null) {
      $el.removeClass(view._cssClassesAnimating);
      view._cssClassesAnimating = null;
    }
  },

  /* endregion ANIMATION */

  /* region PRESETS */

  /**
   * Adds a css class to an element after 1 frame to trigger css animations.
   * @param cssClass
   * @returns {Animation}
   * @see Animations.animate
   */
  cssClassAnimation: function (cssClass) {
    return Animations.animate.call(this, function (view, $el, el, duration, delay) {
      $el.removeClass(cssClass);

      return setTimeout(function () {
        $el.addClass(cssClass);
        Animations._destroyAnimationForView(view);
        view.trigger('animated');
      }, 30.0);
    });
  },

  /**
   * Fades an element/view in.
   * @param {Number} [duration=CONFIG.VIEW_TRANSITION_DURATION]
   * @param {Number} [delay=0]
   * @returns {Animation}
   * @see Animations.animateIn
   */
  fadeIn: function (duration, delay) {
    return Animations.animateIn.call(this, function (view, $el, el, duration, delay) {
      if (delay > 0) {
        $el.css('opacity', 0.0);
      }
      var animation = el.animate([
        { opacity: 0.0 },
        { opacity: 1.0 },
      ], {
        duration: duration,
        delay: delay,
        fill: 'forwards',
      });
      if (delay > 0) {
        animation.onfinish = function () {
          $el.css('opacity', '');
        };
      }
      return animation;
    }, duration, delay);
  },
  /**
   * Fades an element/view out.
   * @param {Number} [duration=CONFIG.VIEW_TRANSITION_DURATION]
   * @param {Number} [delay=0]
   * @returns {Animation}
   * @see Animations.animateOut
   */
  fadeOut: function (duration, delay) {
    return Animations.animateOut.call(this, function (view, $el, el, duration, delay) {
      return el.animate([
        { opacity: 1.0 },
        { opacity: 0.0 },
      ], {
        duration: duration,
        delay: delay,
        fill: 'forwards',
      });
    }, duration, delay);
  },
  /**
   * Fades, shifts, and zooms an element/view in from small to big.
   * @param {Number} [duration=CONFIG.VIEW_TRANSITION_DURATION]
   * @param {Number} [delay=0]
   * @param {Number} [translateX=0]
   * @param {Number} [translateY=0]
   * @param {Number} [scaleStart=0]
   * @returns {Animation}
   * @see Animations.animateIn
   */
  fadeZoomUpIn: function (duration, delay, translateX, translateY, scaleStart) {
    return Animations.animateIn.call(this, function (view, $el, el, duration, delay) {
      if (translateX == null) { translateX = 0; }
      if (translateY == null) { translateY = 0; }
      if (scaleStart == null) { scaleStart = 0; }
      if (delay > 0) {
        $el.css('opacity', 0.0);
      }
      var animation = el.animate([
        { opacity: 0.0, transform: 'translateX(' + translateX + 'px) translateY(' + translateY + 'px) scale(' + scaleStart + ')' },
        { opacity: 1.0, transform: 'translateX(' + translateX + 'px) translateY(' + translateY + 'px) scale(1.0)' },
      ], {
        duration: duration,
        delay: delay,
        easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
        fill: 'forwards',
      });
      if (delay > 0) {
        animation.onfinish = function () {
          $el.css('opacity', '');
        };
      }
      return animation;
    }, duration, delay);
  },
  /**
   * Fades and zooms an element/view out from big to small.
   * @param {Number} [duration=CONFIG.VIEW_TRANSITION_DURATION]
   * @param {Number} [delay=0]
   * @param {Number} [translateX=0]
   * @param {Number} [translateY=0]
   * @returns {Animation}
   * @see Animations.animateOut
   */
  fadeZoomDownOut: function (duration, delay, translateX, translateY) {
    return Animations.animateOut.call(this, function (view, $el, el, duration, delay) {
      if (translateX == null) { translateX = 0; }
      if (translateY == null) { translateY = 0; }

      return el.animate([
        { opacity: 1.0, transform: 'translateX(' + translateX + 'px) translateY(' + translateY + 'px) scale(1.0)' },
        { opacity: 0.0, transform: 'translateX(' + translateX + 'px) translateY(' + translateY + 'px) scale(0.0)' },
      ], {
        duration: duration,
        delay: delay,
        easing: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
        fill: 'forwards',
      });
    }, duration, delay);
  },
  /**
   * Fades and zooms an element/view in from big to small.
   * @param {Number} [duration=CONFIG.VIEW_TRANSITION_DURATION]
   * @param {Number} [delay=0]
   * @param {Number} [translateX=0]
   * @param {Number} [translateY=0]
   * @returns {Animation}
   * @see Animations.animateIn
   */
  fadeZoomDownIn: function (duration, delay, translateX, translateY) {
    return Animations.animateIn.call(this, function (view, $el, el, duration, delay) {
      if (translateX == null) { translateX = 0; }
      if (translateY == null) { translateY = 0; }
      if (delay > 0) {
        $el.css('opacity', 0.0);
      }

      $el.parent().css('perspective', '1000px');

      var animation = el.animate([
        { opacity: 0.0, transform: 'translateX(' + translateX + 'px) translateY(' + translateY + 'px) translateZ(600px)' },
        { opacity: 1.0, transform: 'translateX(' + translateX + 'px) translateY(' + translateY + 'px) translateZ(0.0)' },
      ], {
        duration: duration,
        delay: delay,
        easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
        fill: 'forwards',
      });
      if (delay > 0) {
        animation.onfinish = function () {
          $el.css('opacity', '');
        };
      }
      return animation;
    }, duration, delay);
  },
  /**
   * Fades, zooms, and flashes an element/view in from small to big.
   * @param {Number} [duration=CONFIG.VIEW_TRANSITION_DURATION]
   * @param {Number} [delay=0]
   * @param {Number} [translateX=0]
   * @param {Number} [translateY=0]
   * @returns {Animation}
   * @see Animations.animateIn
   */
  fadeZoomFlashUpIn: function (duration, delay, translateX, translateY) {
    return Animations.animateIn.call(this, function (view, $el, el, duration, delay) {
      if (translateX == null) { translateX = 0; }
      if (translateY == null) { translateY = 0; }
      if (delay > 0) {
        $el.css('opacity', 0.0);
      }

      $el.parent().css('perspective', '1000px');

      var animation = el.animate([
        { opacity: 0.0, transform: 'translateX(' + translateX + 'px) translateY(' + translateY + 'px) translateZ(-50px)', '-webkit-filter': 'brightness(0%)' },
        { opacity: 1.0, transform: 'translateX(' + translateX + 'px) translateY(' + translateY + 'px) translateZ(0.0)', '-webkit-filter': 'brightness(100%)' },
      ], {
        duration: duration,
        delay: delay,
        easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
        fill: 'forwards',
      });
      if (delay > 0) {
        animation.onfinish = function () {
          $el.css('opacity', '');
        };
      }
      return animation;
    }, duration, delay);
  },
  /**
   * Fades, zooms, rotates, and flashes an element/view in from small to big.
   * @param {Number} [duration=CONFIG.VIEW_TRANSITION_DURATION]
   * @param {Number} [delay=0]
   * @param {Number} [translateX=0]
   * @param {Number} [translateY=0]
   * @returns {Animation}
   * @see Animations.animateIn
   */
  fadeZoomRotateFlashUpIn: function (duration, delay, translateX, translateY) {
    return Animations.animateIn.call(this, function (view, $el, el, duration, delay) {
      if (translateX == null) { translateX = 0; }
      if (translateY == null) { translateY = 0; }
      if (delay > 0) {
        $el.css('opacity', 0.0);
      }

      $el.parent().css('perspective', '1000px');
      $el.css('transform-origin', '50% 50%');
      var rotateY = (0.5 - Math.random()) * 90;
      var rotateZ = (0.5 - Math.random()) * 30;
      var translateZ = -(150 + Math.random() * 100);
      var scale = (0.6 + Math.random() * 0.2);

      var animation = el.animate([
        { opacity: 0.75, transform: 'translateX(' + translateX + 'px) translateY(' + translateY + 'px) translateZ(' + translateZ + 'px) scale(' + scale + ') rotateY(' + rotateY + 'deg) rotateZ(' + rotateZ + 'deg)', '-webkit-filter': 'brightness(0)' },
        { opacity: 1.0, transform: 'translateX(' + translateX + 'px) translateY(' + translateY + 'px) translateZ(0px) scale(1.0) rotateY(0deg) rotateZ(0deg)', '-webkit-filter': 'brightness(1)' },
      ], {
        duration: duration,
        delay: delay,
        easing: 'cubic-bezier(0.56, 1.21, 0.56, 1)',
        fill: 'forwards',
      });
      animation.onfinish = function () {
        $el.css('opacity', '');
        $el.css('transform-origin', '');
      };
      return animation;
    }, duration, delay);
  },

  /* endregion PRESETS */

};

// Expose the class either via CommonJS or the global object
module.exports = Animations;
