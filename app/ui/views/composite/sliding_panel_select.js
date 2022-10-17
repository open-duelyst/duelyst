// pragma PKGS: nongame

'use strict';

var CONFIG = require('app/common/config');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var RSX = require('app/data/resources');
var Animations = require('app/ui/views/animations');
var SlidingPanelItemView = require('app/ui/views/item/sliding_panel');
var _ = require('underscore');
var SlidingPanelSelectTmpl = require('../../templates/composite/sliding_panel_select.hbs');

var SlidingPanelSelectCompositeView = Backbone.Marionette.CompositeView.extend({

  className: 'sliding-panel-select',

  template: SlidingPanelSelectTmpl,

  childView: SlidingPanelItemView,
  childViewContainer: '.sliding-panel-select-choices .choices',

  _isEmptyView: false,
  _numPages: 0,
  _pageWidth: 0,
  _pageHeight: 0,
  _slidingAccelerationX: 0,
  _slidingAnimating: false,
  _slidingAnimationId: null,
  _slidingAtStart: false,
  _slidingAtEnd: false,
  _slidingChoicesHorizontalPadding: 0,
  _slidingContainerWidth: 0,
  _slidingContainerHeight: 0,
  _slidingContainerCSSWidth: 0,
  _slidingContainerCSSHeight: 0,
  _slidingDeltaX: 0,
  _slidingOffsetX: 0,
  _slidingLastOffsetX: 0,
  _slidingLastDeltaX: 0,
  _slidingLocked: false,
  _slidingRange: 0,
  _slidingTargetDuration: null,
  _slidingTargetOffsetX: null,
  _slidingTargetStartedAt: null,
  _slidingScrolling: false,
  _slidingSourceOffsetX: null,
  _slidingVelocityX: 0,
  _totalViewsWidth: 0,
  _totalViewsHeight: 0,
  _viewWidth: 0,
  _viewHeight: 0,

  // parameters for slide
  // anchor point of center of panel group when showing all on screen at once
  slidingAnchorPoint: 0.5,
  // distance as a fixed pixel amount from edges of screen to trigger sliding
  slidingTriggerDistance: 160.0,
  // Amplitude of sliding acceleration
  slidingAccelerationAmplitude: 20.0,
  // decay of sliding velocity
  slidingVelocityDecay: 0.5,
  // minimum distance from edges to start slowing down slide
  slidingEdgeDistance: 320.0,
  // ideal distance as a percentage from edges of total slide range to start slowing down slide
  slidingEdgeDistancePct: 0.25,
  // whether sliding panels should snap to left side when selected
  slidingPanelsSnap: false,
  // whether sliding panels have sticky selection (i.e. click -> select and stay selected, click again -> deselect)
  // NOTE: this is always true if slidingPanelsSnap is true
  slidingPanelsStickySelection: false,
  // whether sliding panels may stack vertically to fill the space
  slidingPanelsStack: true,
  // duration of sliding panel snap animation
  slidingPanelsSnapDuration: 250,
  // animation method to use when showing sliding panels
  slidingPanelShowAnimation: Animations.fadeZoomRotateFlashUpIn,
  // timing for showing sliding panels
  slidingPanelsShowDuration: 600.0,
  slidingPanelsShowDelay: 150.0,
  slidingPanelsShowStagger: 100.0,
  slidingPanelsShowStaggerRandom: 20.0,

  /* region INITIALIZE */

  initialize: function () {
    this._dataById = {};
  },

  /* endregion INITIALIZE */

  /* region LAYOUT */

  onResize: function () {
    // get dimensions of space
    var $slidingPanelSelectBody = this.$el.find('.sliding-panel-select-body');
    var $slidingPanelSelectChoicesContainer = this.$el.find('.sliding-panel-select-choices');
    var $slidingPanelSelectChoices = $slidingPanelSelectChoicesContainer.children('.choices');

    // strip css
    $slidingPanelSelectChoicesContainer.css({ width: '', height: '', flex: '' });
    this.$el.removeClass('slides slide-end slide-start');
    this._slidingAtStart = false;
    this._slidingAtEnd = false;

    // store previous size
    var slidingContainerWidth = this._slidingContainerWidth;
    var slidingContainerHeight = this._slidingContainerHeight;

    // find current size
    this._slidingContainerWidth = $slidingPanelSelectChoices.width();
    this._slidingContainerHeight = $slidingPanelSelectBody.height();
    this._slidingChoicesHorizontalPadding = $slidingPanelSelectChoicesContainer.innerWidth() - this._slidingContainerWidth;
    var slidingContainerHorizontalPadding = $slidingPanelSelectChoicesContainer.innerWidth() - $slidingPanelSelectChoicesContainer.width();
    var slidingContainerVerticalPadding = $slidingPanelSelectChoicesContainer.innerHeight() - $slidingPanelSelectChoicesContainer.height();

    // redo panels layout
    this._layoutSlidingPanels();

    // update slide parameters
    if (this._getCanSlide()) {
      // set container height to match total views height
      this._slidingContainerHeight = this._totalViewsHeight;

      // reset container css
      this._slidingContainerCSSWidth = '';
      this._slidingContainerCSSHeight = this._slidingContainerHeight + slidingContainerVerticalPadding;
      this._slidingContainerCSSFlex = '';

      // slide within window
      this._slidingRange = this._totalViewsWidth - this._slidingContainerWidth;
      var slidingScale = this._slidingContainerWidth > 0 ? slidingContainerWidth / this._slidingContainerWidth : 0.0;
      this._slidingOffsetX = this._slidingLastOffsetX = this._slidingOffsetX * slidingScale;
      if (!this._slidingLocked) {
        this._startSlidingPanelsForUpdate();
      }
    } else {
      if (this._isEmptyView) {
        this._slidingContainerCSSWidth = this._slidingContainerWidth + this._slidingChoicesHorizontalPadding + slidingContainerHorizontalPadding;
        this._slidingContainerCSSHeight = this._slidingContainerHeight + slidingContainerVerticalPadding;
        this._slidingContainerCSSFlex = 'none';
      } else {
        // set container width/height to match total views width/height
        this._slidingContainerWidth = this._totalViewsWidth;
        this._slidingContainerHeight = this._totalViewsHeight;

        // reset container css
        this._slidingContainerCSSWidth = this._slidingContainerWidth + this._slidingChoicesHorizontalPadding + slidingContainerHorizontalPadding;
        this._slidingContainerCSSHeight = this._slidingContainerHeight + slidingContainerVerticalPadding;
        this._slidingContainerCSSFlex = 'none';
      }

      // window size is big enough that there is no need to slide
      this._slidingRange = 0.0;
      this._slidingOffsetX = this._slidingLastOffsetX = (this._slidingContainerWidth - this._totalViewsWidth) * this.slidingAnchorPoint + slidingContainerHorizontalPadding * (0.5 - this.slidingAnchorPoint);
      this._slidingVelocityX = 0.0;
      this._slidingVelocityEasing = false;
      this._slidingLastDeltaX = this._slidingDeltaX = 0.0;
      this.children.each(function (view) {
        var viewData = this._getSlidingPanelDataForView(view);
        var x = viewData.x + this._slidingOffsetX;
        var y = viewData.y + (this._slidingContainerHeight - this._totalViewsHeight) * 0.5;
        if (this._isEmptyView) {
          x = 0.0;
        }
        if (viewData.animation != null) {
          viewData.animation.cancel();
          viewData.animation = null;
        }
        view.$el.css('transform', 'translate(' + x + 'px, ' + y + 'px)');
      }.bind(this));
    }

    // apply size to container
    $slidingPanelSelectChoicesContainer.css({
      width: this._slidingContainerCSSWidth,
      height: this._slidingContainerCSSHeight,
      flex: this._slidingContainerCSSFlex,
    });
  },

  /* region LAYOUT */

  /* region MARIONETTE EVENTS */

  onRender: function () {
    this.onResize();

    // listen for pagination
    this.$el.find('.previous-page').on('click', this.onClickPreviousPage.bind(this));
    this.$el.find('.next-page').on('click', this.onClickNextPage.bind(this));
  },

  onShow: function () {
    // start listening for select deck
    this.listenTo(this, 'childview:select', this.onSelectChildView);

    // listen to global events
    this.listenTo(EventBus.getInstance(), EVENTS.pointer_wheel, this.onPointerWheel);
    this.listenTo(EventBus.getInstance(), EVENTS.resize, this.onResize);

    // resize once
    this.onResize();

    // animate sliding panels
    this._scheduleSlidingPanelsUpdate();

    // show sliding panels
    this._showSlidingPanels();
  },

  onDestroy: function () {
    if (this._requestAnimationId != null) {
      cancelAnimationFrame(this._requestAnimationId);
      this._requestAnimationId = null;
    }
    if (this._postSnapTimeoutId != null) {
      clearTimeout(this._postSnapTimeoutId);
      this._postSnapTimeoutId = null;
    }
  },

  /* endregion MARIONETTE EVENTS */

  /* region EVENTS */

  onPointerWheel: function (event) {
    if (!this._slidingLocked) {
      // stop any in progress animations
      this._stopSlidingPanelAnimations();

      var dx = event.getWheelDeltaX();
      var dy = event.getWheelDeltaY();
      var dx_abs = Math.abs(dx);
      var dy_abs = Math.abs(dy);
      var velocity = 0;
      if (dy_abs * 0.5 > dx_abs) {
        velocity = dy;
      } else if (dx_abs > dy_abs) {
        velocity = dx;
      } else {
        velocity = dx + dy;
      }

      // set sliding from scrolling to prevent default behavior
      this._slidingScrolling = true;

      // wait for short delay after wheel to restore default behavior
      if (this._slidingScrollingTimeoutId != null) {
        clearTimeout(this._slidingScrollingTimeoutId);
      }
      this._slidingScrollingTimeoutId = setTimeout(function () {
        this._slidingScrolling = false;
        this._slidingScrollingTimeoutId = null;
      }.bind(this), 250);

      // reset sliding movement
      this._slidingVelocityX = -velocity;
      this._slidingAccelerationX = 0.0;
    }
  },

  onClickPreviousPage: function () {
    if (!this._slidingLocked) {
      // round current offset down to nearest page and go to new page
      var slidingOffsetX = -(this._slidingTargetOffsetX != null ? this._slidingTargetOffsetX : this._slidingOffsetX);
      var pagePct = ((this._pageWidth * Math.ceil(slidingOffsetX / this._pageWidth)) - this._pageWidth) / this._slidingRange;
      this._gotoSlidePct(pagePct, CONFIG.ANIMATE_MEDIUM_DURATION);
    }
  },

  onClickNextPage: function () {
    if (!this._slidingLocked) {
      // round current offset down to nearest page and go to new page
      var slidingOffsetX = -(this._slidingTargetOffsetX != null ? this._slidingTargetOffsetX : this._slidingOffsetX);
      var pagePct = ((slidingOffsetX - (slidingOffsetX % this._pageWidth)) + this._pageWidth) / this._slidingRange;
      this._gotoSlidePct(pagePct, CONFIG.ANIMATE_MEDIUM_DURATION);
    }
  },

  onSelectChildView: function (childView) {
    this.setSelectedChildView(childView);
  },

  /* endregion EVENTS */

  /* region SELECT */

  /**
   * Sets the currently selected child view.
   * @param childView
   */
  setSelectedChildView: function (childView) {
    if (!this.slidingPanelsStickySelection && !this.slidingPanelsSnap) {
      if (childView) {
        this.trigger('select', childView.model);
      }
    } else {
      if (childView != null && this._selectedChildView === childView) {
        childView = null;
      }

      if (this._selectedChildView !== childView) {
        // stop any in progress animations
        this._stopSlidingPanelAnimations();

        if (this._selectedChildView != null) {
          if (childView == null) {
            // when resetting to no selected view
            if (this.slidingPanelsSnap && this._selectedChildView.collection != null && this._selectedChildView.collection.length > 0) {
              // animate all panels back into shape

              // setup finish handler
              var numToAnimate = this.children.length;
              var numFinished = 0;
              var onFinishAnimation = function () {
                numFinished++;
                if (numFinished >= numToAnimate && this._getCanSlide()) {
                  // restart sliding
                  this._postSnapTimeoutId = setTimeout(function () {
                    this._startSlidingPanelsForUpdate();
                  }.bind(this), 250);
                }
              }.bind(this);

              var slidingVal = -this._slidingOffsetX / this._slidingRange;
              this.children.each(function (view) {
                var el = view.$el[0];
                var viewData = this._getSlidingPanelDataForView(view);
                var y = viewData.y + (this._slidingContainerHeight - this._totalViewsHeight) * 0.5;
                var source_x = viewData.source_x;
                var target_x = viewData.target_x;
                var timePct;
                if (viewData.animation != null) {
                  timePct = viewData.animation.currentTime / viewData.animation_duration;
                  viewData.animation.cancel();
                } else {
                  timePct = 0.0;
                }
                viewData.source_x = source_x + (target_x - source_x) * timePct;
                viewData.target_x = viewData.x - this._slidingRange * slidingVal;
                viewData.animation_duration = this.slidingPanelsSnapDuration;
                viewData.animation = el.animate([
                  { transform: 'translate(' + viewData.source_x + 'px, ' + y + 'px)' },
                  { transform: 'translate(' + viewData.target_x + 'px, ' + y + 'px)' },
                ], {
                  duration: this.slidingPanelsSnapDuration,
                  fill: 'forwards',
                  easing: 'ease-out',
                });
                var onfinish = viewData.animation.onfinish;
                viewData.animation.onfinish = function () {
                  if (_.isFunction(onfinish)) { onfinish(); }
                  onFinishAnimation();
                }.bind(this);
              }.bind(this));
            }

            // trigger deselect event
            this.trigger('deselect', this._selectedChildView.model);
          }

          // set child view as inactive
          this._selectedChildView.$el.removeClass('active');
        }

        // store child view
        this._selectedChildView = childView;

        if (this._selectedChildView != null) {
          // set child view as active
          this._selectedChildView.$el.addClass('active');

          if (this.slidingPanelsSnap && this._selectedChildView.collection != null && this._selectedChildView.collection.length > 0) {
            // lock sliding
            this._slidingLocked = true;

            if (this._postSnapTimeoutId != null) {
              clearTimeout(this._postSnapTimeoutId);
              this._postSnapTimeoutId = null;
            }

            // unflag as sliding
            this.$el.removeClass('sliding');

            // unflag as slides
            if (this._slidingRange > 0) {
              this.$el.removeClass('slides');
            }

            // flag as snapped
            this.$el.addClass('snapped');

            // get position of selected panel relative to others
            var selectedX = -this._slidingChoicesHorizontalPadding * 0.5;
            this.children.find(function (view) {
              var viewData = this._getSlidingPanelDataForView(view);
              if (view === this._selectedChildView) {
                return true;
              } else {
                selectedX += viewData.outerWidth;
              }
            }.bind(this));

            // animate all panels to new sliding offset
            var panelX = -selectedX;
            this.children.each(function (view) {
              var el = view.$el[0];
              var viewData = this._getSlidingPanelDataForView(view);
              var y = viewData.y + (this._slidingContainerHeight - this._totalViewsHeight) * 0.5;
              var source_x = viewData.source_x;
              var target_x = viewData.target_x;
              var timePct;
              if (viewData.animation != null) {
                timePct = viewData.animation.currentTime / viewData.animation_duration;
                viewData.animation.cancel();
              } else {
                timePct = 0.0;
              }
              viewData.source_x = source_x + (target_x - source_x) * timePct;
              viewData.target_x = panelX;
              viewData.animation_duration = this.slidingPanelsSnapDuration;
              viewData.animation = el.animate([
                { transform: 'translate(' + viewData.source_x + 'px, ' + y + 'px)' },
                { transform: 'translate(' + viewData.target_x + 'px, ' + y + 'px)' },
              ], {
                duration: viewData.animation_duration,
                fill: 'forwards',
                easing: 'ease-out',
              });

              // update x for next
              if (view === this._selectedChildView) {
                panelX += this.getSelectedChildViewWidth();
              } else {
                // update x
                panelX += viewData.outerWidth;
              }
            }.bind(this));

            // set new sliding val
            if (this._slidingRange > 0) {
              this._slidingOffsetX = Math.min(0.0, Math.max(-this._slidingRange, -selectedX));
            }
          }

          // trigger select event
          this.trigger('select', this._selectedChildView.model);
        }
      }
    }
  },

  /**
   * Returns currently selected child view.
   * @returns {Backbone.View}
   */
  getSelectedChildView: function () {
    return this._selectedChildView;
  },

  /**
   * Return width of currently selected child view.
   * @returns {Number}
   */
  getSelectedChildViewWidth: function () {
    var val = 0.0;
    var selectedChildView = this.getSelectedChildView();
    if (selectedChildView != null) {
      val += this._getSlidingPanelDataForView(selectedChildView).outerWidth + selectedChildView.$el.find('.sliding-panel-active-content').outerWidth(true);
    }
    return val;
  },

  /* endregion SELECT */

  /* region SLIDING */

  _getCanSlide: function () {
    return this._slidingContainerWidth < this._totalViewsWidth && !this._isEmptyView;
  },

  _getSlidingPanelDataForView: function (view) {
    return this._getSlidingPanelDataForModel(view.model);
  },

  _getSlidingPanelDataForModel: function (model) {
    var id = model.get('id') || model.get('name') || model.cid;
    return this._getSlidingPanelDataForId(id);
  },

  _getSlidingPanelDataForId: function (id) {
    return this._dataById[id] || (this._dataById[id] = {
      x: 0,
      y: 0,
      source_x: 0,
      target_x: 0,
      animation: null,
      animation_duration: 1,
      width: 0,
      height: 0,
      outerWidth: 0,
      outerHeight: 0,
    });
  },

  _stopSlidingPanelAnimations: function () {
    if (this._slidingAnimating) {
      this.children.each(function (view) {
        var viewData = this._getSlidingPanelDataForView(view);
        if (viewData.animation != null) {
          viewData.animation.finish();
          viewData.animation = null;
        }
      }.bind(this));
      this._slidingAnimating = false;
    }

    if (this._slidingTargetOffsetX != null) {
      this._slidingTargetOffsetX = null;
      this._slidingSourceOffsetX = null;
      this._slidingTargetDuration = null;
      this._slidingTargetStartedAt = null;
    }
  },

  _layoutSlidingPanels: function () {
    // update decks data
    this._totalViewsWidth = this._pageWidth = this._viewWidth = 0;
    this._totalViewsHeight = this._pageHeight = this._viewHeight = 0;
    this._numPages = 0;
    var slidingContainerUsableWidth = this._slidingContainerWidth - this._slidingChoicesHorizontalPadding;
    var numPanelsPerRow;
    var numPanelsPerColumn;
    var pageIndex = 0;
    var rowIndex = 0;
    var rowIndexMin;
    var rowIndexMax;
    var columnIndex = 0;
    var columnIndexMin;
    var columnIndexMax;
    if (this.children.length === 1 && this.emptyView != null) {
      this._isEmptyView = this.children.first() instanceof this.emptyView;
    } else {
      this._isEmptyView = false;
    }
    this.children.each(function (view, i) {
      // recalculate view data
      var viewData = this._getSlidingPanelDataForView(view);

      // update dimensions
      viewData.width = view.$el.width();
      viewData.height = view.$el.height();
      viewData.outerWidth = view.$el.outerWidth(true);
      viewData.outerHeight = view.$el.outerHeight(true);
      this._viewWidth = Math.max(this._viewWidth, viewData.outerWidth);
      this._viewHeight = Math.max(this._viewHeight, viewData.outerHeight);

      var numPanels = this.children.length;
      if (this.slidingPanelsStack && numPanels > 3) {
        // attempt to stack views based on height and even distribution
        // for simplicity, assumes that all views have an equal height
        if (numPanelsPerRow == null) {
          numPanelsPerRow = Math.max(1, Math.floor(slidingContainerUsableWidth / viewData.outerWidth) || 0);
          numPanelsPerColumn = Math.max(1, Math.floor(this._slidingContainerHeight / viewData.outerHeight) || 0);

          // attempt to evenly distribute when can fit all in screen
          while ((numPanelsPerRow - 1) * numPanelsPerColumn >= numPanels && numPanelsPerRow - 1 >= numPanelsPerColumn) {
            numPanelsPerRow--;
          }

          rowIndexMin = 0;
          rowIndexMax = rowIndexMin + numPanelsPerColumn;
          rowIndex = rowIndexMin;

          columnIndexMin = 0;
          columnIndexMax = columnIndexMin + numPanelsPerRow;
          columnIndex = columnIndexMin;

          this._pageWidth = viewData.outerWidth * numPanelsPerRow;
          this._pageHeight = viewData.outerHeight * numPanelsPerColumn;
          this._numPages = Math.max(1, Math.ceil(numPanels / (numPanelsPerRow * numPanelsPerColumn)));
        }

        viewData.x = columnIndex * viewData.outerWidth + pageIndex * this._pageWidth + this._slidingChoicesHorizontalPadding * 0.5;
        viewData.y = rowIndex * viewData.outerHeight;
        if (rowIndex === rowIndexMin) {
          this._totalViewsWidth += viewData.outerWidth;
        }
        if (pageIndex === 0 && columnIndex === columnIndexMin) {
          this._totalViewsHeight += viewData.outerHeight;
        }
        columnIndex++;
        if (columnIndex >= columnIndexMax) {
          columnIndex = columnIndexMin;
          rowIndex++;
          if (rowIndex >= rowIndexMax) {
            rowIndex = rowIndexMin;
            pageIndex++;
          }
        }
      } else {
        // tile horizontal
        viewData.x = this._totalViewsWidth + this._slidingChoicesHorizontalPadding * 0.5;
        viewData.y = 0;
        this._totalViewsWidth += viewData.outerWidth;
        this._totalViewsHeight = Math.max(this._totalViewsHeight, viewData.outerHeight);
        this._pageWidth = Math.max(1, Math.floor(slidingContainerUsableWidth / viewData.outerWidth) || 0) * viewData.outerWidth;
        this._pageHeight = this._totalViewsHeight;
        this._numPages = Math.max(this._numPages, Math.ceil(slidingContainerUsableWidth / (numPanels * viewData.outerWidth)));
      }
    }.bind(this));
  },

  _showSlidingPanels: function () {
    // stop any in progress animations
    this._stopSlidingPanelAnimations();

    // set sliding as animating
    this._slidingAnimating = true;
    this._slidingLocked = true;
    var slidingAnimationId = this._slidingAnimationId = (this._slidingAnimationId || 0) + 1;

    // set as not slides
    if (this._slidingRange > 0) {
      this.$el.removeClass('slides');
    }

    var delay = this.slidingPanelsShowDelay;

    // setup finish handler
    var numToAnimate = this.children.length;
    var numFinished = 0;
    var onFinishAnimation = function () {
      if (this._slidingAnimating && slidingAnimationId == this._slidingAnimationId) {
        numFinished++;
        if (numFinished >= numToAnimate) {
          // all views animated in
          this._slidingAnimating = false;
          if (this._getCanSlide() && (!this.slidingPanelsSnap || this._selectedChildView == null)) {
            this._startSlidingPanelsForUpdate();
          }
        }
      }
    }.bind(this);

    this.children.each(function (view, i) {
      var viewData = this._getSlidingPanelDataForView(view);
      var x = viewData.x + this._slidingOffsetX;
      var y = viewData.y + (this._slidingContainerHeight - this._totalViewsHeight) * 0.5;
      if (this._isEmptyView) {
        x = 0.0;
      }

      if (viewData.animation != null) {
        viewData.animation.cancel();
      }

      // set final position immediately to ensure selections made during show are correct
      view.$el.css('transform', 'translateX(' + x + 'px) translateY(' + y + 'px)');

      if (x >= -viewData.outerWidth && x <= this._slidingContainerWidth + viewData.outerWidth) {
        // animate view in
        var animationMethod = this.slidingPanelShowAnimation;
        viewData.animation = animationMethod.call(view, this.slidingPanelsShowDuration, delay, x, y);
        var onfinish = viewData.animation.onfinish;
        viewData.animation.onfinish = function () {
          if (_.isFunction(onfinish)) {
            onfinish();
          }
          onFinishAnimation();
        }.bind(this);

        // increase delay
        delay += this.slidingPanelsShowStagger + Math.random() * this.slidingPanelsShowStaggerRandom;
      } else {
        // skip animating when view is outside screen
        onFinishAnimation();
      }
    }.bind(this));
  },

  /**
   * Moves sliding panels to a percent of the total slide range with optional animate over duration.
   * @param {Number} [pct=0.0]
   * @param {Number} [duration=0.0]
   * @private
   */
  _gotoSlidePct: function (pct, duration) {
    if (this._getCanSlide()) {
      if (pct == null) {
        pct = 0.0;
      } else {
        pct = Math.max(0, Math.min(1, pct));
      }

      if (duration == null) { duration = 0.0; }

      // stop any in progress animations
      this._stopSlidingPanelAnimations();

      // reset sliding movement
      this._slidingVelocityX = 0.0;
      this._slidingAccelerationX = 0.0;

      if (duration != null && duration > 0.0) {
        // animate to
        this._slidingSourceOffsetX = this._slidingOffsetX;
        this._slidingTargetOffsetX = -this._slidingRange * pct;
        this._slidingTargetDuration = duration;
        this._slidingTargetStartedAt = Date.now();
      } else {
        // move to
        this._slidingOffsetX = -this._slidingRange * pct;
        this._updateSlidingPanels();
      }
    }
  },

  _startSlidingPanelsForUpdate: function () {
    // clear post snap delay
    if (this._postSnapTimeoutId != null) {
      clearTimeout(this._postSnapTimeoutId);
      this._postSnapTimeoutId = null;
    }

    // setup animations
    this.children.each(function (view) {
      var viewData = this._getSlidingPanelDataForView(view);
      viewData.source_x = viewData.x;
      viewData.target_x = viewData.source_x - this._slidingRange;
      viewData.animation_duration = 1.0;
      var y = viewData.y + (this._slidingContainerHeight - this._totalViewsHeight) * 0.5;
      view.$el.css('transform', '');
      if (viewData.animation != null) {
        viewData.animation.cancel();
      }
      viewData.animation = view.$el[0].animate([
        { transform: 'translate(' + viewData.source_x + 'px, ' + y + 'px)' },
        { transform: 'translate(' + viewData.target_x + 'px, ' + y + 'px)' },
      ], {
        duration: viewData.animation_duration,
        fill: 'forwards',
      });
      viewData.animation.pause();
    }.bind(this));

    // unlock sliding
    this._slidingLocked = false;

    // set as slides
    if (this._slidingRange > 0) {
      this.$el.addClass('slides');
    }

    // reset sliding movement
    this._slidingVelocityX = 0.0;
    this._slidingAccelerationX = 0.0;

    // make one step to update animations
    this._stepSlidingPanels();
  },

  _scheduleSlidingPanelsUpdate: function () {
    if (this._slidingTargetOffsetX != null) {
      // animating offset to target
      // easing: cubic in out
      var duration = this._slidingTargetDuration * 1000.0;
      var time = Date.now();
      var dt = Math.min(duration, time - this._slidingTargetStartedAt);
      var dx = this._slidingTargetOffsetX - this._slidingSourceOffsetX;
      var dte = dt / (duration * 0.5);
      if (dte < 1) {
        this._slidingOffsetX = dx * 0.5 * (dte * dte * dte) + this._slidingSourceOffsetX;
      } else {
        dte -= 2;
        this._slidingOffsetX = dx * 0.5 * (dte * dte * dte + 2) + this._slidingSourceOffsetX;
      }

      // update panels to new offset
      this._updateSlidingPanels();

      // complete animation
      if (dt === duration) {
        this._stopSlidingPanelAnimations();
      }
    } else {
      // step offset based on velocity
      this._stepSlidingPanels();
    }

    // request update
    this._requestAnimationId = requestAnimationFrame(this._scheduleSlidingPanelsUpdate.bind(this));
  },

  /**
   * Incrementally steps the slide behavior of all the panels.
   * @private
   */
  _stepSlidingPanels: function () {
    if (!this._slidingLocked && this._slidingRange > 0) {
      // update velocity
      this._slidingVelocityX += this._slidingAccelerationX;
      /*
      // ease velocity as slide approaches edges
      var edgeModifier = Math.min(1.0, Math.pow(1.0 + Math.pow(Math.abs(this._slidingVelocityX / (this.slidingAccelerationAmplitude * 3.0)), 1.5), 2.0) - 1.0);
      var edgeDist = Math.max(this.slidingEdgeDistance, this._slidingRange * this.slidingEdgeDistancePct) * edgeModifier;
      if (edgeDist > 0 && this._slidingAccelerationX < 0 && this._slidingOffsetX < -this._slidingRange + edgeDist) {
        if (!this._slidingVelocityEasing) {
          this._slidingVelocityEasing = true;
          this._slidingVelocityEdgeX = this._slidingVelocityX;
        }
        var easeVal = (this._slidingOffsetX + this._slidingRange) / edgeDist;
        this._slidingVelocityX = this._slidingVelocityEdgeX * (easeVal * (2.0 - easeVal));
      } else if (edgeDist > 0 && this._slidingAccelerationX > 0 && this._slidingOffsetX > -edgeDist) {
        if (!this._slidingVelocityEasing) {
          this._slidingVelocityEasing = true;
          this._slidingVelocityEdgeX = this._slidingVelocityX;
        }
        var easeVal = this._slidingOffsetX / -edgeDist;
        this._slidingVelocityX = this._slidingVelocityEdgeX * (easeVal * (2.0 - easeVal));
      } else {
        this._slidingVelocityEasing = false;
      }
      */
      // update offset
      this._slidingLastOffsetX = this._slidingOffsetX;
      this._slidingOffsetX = Math.min(0.0, Math.max(-this._slidingRange, this._slidingOffsetX + this._slidingVelocityX));
      this._slidingLastDeltaX = this._slidingDeltaX;
      this._slidingDeltaX = this._slidingLastOffsetX - this._slidingOffsetX;

      // is sliding when acceleration is not 0 and offset has changed
      var isSliding = this._slidingAccelerationX !== 0.0 && this._slidingDeltaX !== 0.0;

      // decay velocity
      this._slidingVelocityX *= this.slidingVelocityDecay;

      // transform views
      this._updateSlidingPanels();

      // set sliding class
      if (isSliding) {
        this.$el.addClass('sliding');
      } else {
        this.$el.removeClass('sliding');
      }
    }
  },

  _updateSlidingPanels: function () {
    var slidingRange = this._slidingRange;
    if (slidingRange > 0.0) {
      var slidingOffsetX = -this._slidingOffsetX;
      var slidingVal = slidingOffsetX / slidingRange;

      // enable/disable start/end flags
      var slidingSlop = 0.025;
      if (slidingVal - slidingSlop <= 0.0) {
        this._slidingAtStart = true;
        this.$el.addClass('slide-start');
      } else if (this._slidingAtStart) {
        this._slidingAtStart = false;
        this.$el.removeClass('slide-start');
      }
      if (slidingVal + slidingSlop >= 1.0) {
        this._slidingAtEnd = true;
        this.$el.addClass('slide-end');
      } else if (this._slidingAtEnd) {
        this._slidingAtEnd = false;
        this.$el.removeClass('slide-end');
      }

      // move all views to current sliding val
      this.children.each(function (view) {
        var viewData = this._getSlidingPanelDataForView(view);
        viewData.animation.currentTime = slidingVal;
      }.bind(this));
    }
  },

  /* endregion SLIDING */

});

// Expose the class either via CommonJS or the global object
module.exports = SlidingPanelSelectCompositeView;
