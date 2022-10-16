const Promise = require('bluebird');
const Animations = require('app/ui/views/animations');

// override marionette's region's _destroyView method to call prepareForDestroy method on views
// this allows us to ensure a method gets called
Backbone.Marionette.Region.prototype._super_destroyView_fromTransition = Backbone.Marionette.Region.prototype._destroyView;
Backbone.Marionette.Region.prototype._destroyView = function () {
  const view = this.currentView;
  if (view.isDestroyed) { return; }

  // call view's prepareForDestroy method
  view.prepareForDestroy();

  // call base method
  Backbone.Marionette.Region.prototype._super_destroyView_fromTransition.call(this);
};

// add a new method to all marionette views
Backbone.Marionette.View.prototype.prepareForDestroy = function () {
  // trigger method onPrepareForDestroy
  this.triggerMethod('prepareForDestroy');
};
Backbone.Marionette.CollectionView.prototype.prepareForDestroy = function () {
  // prepare all children for destroy
  this.children.each(this.prepareChildViewForDestroy, this);

  // prepare self
  Backbone.Marionette.View.prototype.prepareForDestroy.call(this);
};
Backbone.Marionette.CollectionView.prototype.prepareChildViewForDestroy = function (view) {
  view.prepareForDestroy();
};
Backbone.Marionette.LayoutView.prototype.prepareForDestroy = function () {
  // prepare all regions for destroy
  this.regionManager.prepareForDestroy();

  // prepare self
  Backbone.Marionette.ItemView.prototype.prepareForDestroy.call(this);
};
Backbone.Marionette.RegionManager.prototype.prepareForDestroy = function () {
  const regions = this.getRegions();
  _.each(regions, (region, name) => {
    region.prepareForDestroy();
  }, this);
};
Backbone.Marionette.Region.prototype.prepareForDestroy = function () {
  const { currentView } = this;
  if (currentView != null) {
    currentView.prepareForDestroy();
  }
};

// override marionette's region manager to call remove on regions
// this is necessary so the region knows when it is removed
// so that it will not transition any of its own views
// because if it does, they will not get properly destroyed
Backbone.Marionette.RegionManager.prototype._super_remove = Backbone.Marionette.RegionManager.prototype._remove;
Backbone.Marionette.RegionManager.prototype._remove = function (name, region) {
  Backbone.Marionette.triggerMethodOn(region, 'before:remove');
  Backbone.Marionette.RegionManager.prototype._super_remove.apply(this, arguments);
  Backbone.Marionette.triggerMethodOn(region, 'remove');
};

const TransitionRegion = Backbone.Marionette.Region.extend({

  // whether the region has been removed and should not allow any animation
  isRemoved: false,

  onBeforeRemove() {
    // flag the region as removed so that no animation is allowed
    this.isRemoved = true;
  },
  onRemove() {
  },

  // The styling to be set on a View that is about to be
  // transitioned in. The default is a good choice for a view
  // that fades in.
  transitionInCss: null,

  show(view) {
    if (!this.isRemoved && view != null && view !== this.currentView) {
      // make sure this region's el is present
      this._ensureElement();

      // empty first
      const emptyPromise = this.empty();

      // show second
      const showPromise = new Promise((resolve, reject) => {
        // store current view
        this.currentView = view;

        // stop listening to previous view events
        this.stopListening(view);

        // setup method to complete transition in
        let transitionedIn = false;
        const onTransitionIn = function () {
          if (!transitionedIn) {
            transitionedIn = true;

            // stop listening to previous view events
            this.stopListening(view);

            this.triggerMethod('animatedIn', view);
            Backbone.Marionette.triggerMethodOn(view, 'animatedIn');

            resolve();
          }
        }.bind(this);

        // listen for view to be destroyed before animated in
        this.listenTo(view, 'destroy', onTransitionIn);

        // render the view immediately so all properties are present
        view.render();

        this.triggerMethod('before:swap', view);
        this.triggerMethod('before:show', view);
        Backbone.Marionette.triggerMethodOn(view, 'before:show');

        // check animation properties
        const animationInFn = view && ((_.isString(view.animateIn) && Animations[view.animateIn]) || view.animateIn);
        const animating = _.isFunction(animationInFn);

        // only add transition css to the view if we want to animate it
        if (animating) {
          const transitionInCss = view.transitionInCss || this.transitionInCss;
          if (transitionInCss) {
            view.$el.css(transitionInCss);
          }
        }

        // append view to DOM
        this.appendHtml(view);

        this.triggerMethod('swap', view);
        this.triggerMethod('show', view);
        Backbone.Marionette.triggerMethodOn(view, 'show');

        // animate in
        if (animating) {
          // wait for animation and then resolve
          this.listenToOnce(view, 'animatedIn', onTransitionIn);
          animationInFn.call(view);
        } else {
          // resolve immediately
          onTransitionIn();
        }
      });

      return Promise.all([emptyPromise, showPromise]);
    }
    return Promise.resolve();
  },

  empty() {
    const view = this.currentView;
    if (view != null && !view.isDestroyed) {
      return new Promise((resolve, reject) => {
        // clear current view
        this.currentView = null;

        // stop listening to previous view events
        this.stopListening(view);

        // setup method to complete transition out
        let transitionedOut = false;
        const onTransitionOut = function () {
          if (!transitionedOut) {
            transitionedOut = true;
            // stop listening to previous view events
            this.stopListening(view);

            this.triggerMethod('animatedOut', view);
            Backbone.Marionette.triggerMethodOn(view, 'animatedOut');

            // call 'destroy' or 'remove', depending on which is found
            if (view.destroy) { view.destroy(); } else if (view.remove) { view.remove(); }

            this.triggerMethod('empty', view);

            resolve();
          }
        }.bind(this);

        // listen for view to be destroyed before animated out
        this.listenTo(view, 'destroy', onTransitionOut);

        this.triggerMethod('before:swapOut', view);
        this.triggerMethod('before:empty', view);
        this.triggerMethod('swapOut', view);

        // call view's prepareForDestroy method
        view.prepareForDestroy();

        if (!view.isDestroyed) {
          // check animation properties
          const animationOutFn = view && ((_.isString(view.animateOut) && Animations[view.animateOut]) || view.animateOut);
          const animating = !this.isRemoved && _.isFunction(animationOutFn);

          // animate out
          if (animating) {
            this.listenToOnce(view, 'animatedOut', onTransitionOut);
            animationOutFn.call(view);
          } else {
            onTransitionOut();
          }
        }
      });
    }
    return Promise.resolve();
  },

  appendHtml(view) {
    this.el.appendChild(view.el);
  },

});

module.exports = TransitionRegion;
