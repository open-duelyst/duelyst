var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');

/****************************************************************************
 BaseLayer
 ****************************************************************************/

var BaseLayer = cc.Layer.extend({

	/* region INITIALIZATION */

	ctor: function () {
		this._eventBus = EventBus.create();

		// do super ctor
		this._super();

		// resize once to ensure layout is correct
		this.onResize();
	},

	start: function () {
		// start and enable this layer
		// override in subclass
	},

	terminate: function () {
		// stop and disable this layer
		// override in subclass
		this._eventBus.trigger(EVENTS.terminate, {type: EVENTS.terminate});
		this._stopListeningToEvents();
		if (this._eventBus != null) {
			this._eventBus.off();
		}
	},

	/* endregion INITIALIZATION */

	/* region LAYOUT */

	onResize: function () {
		// set content size to win size and not global scale inverted win size
		// this ensures correct 3D rotation for layers and any nodes on those layers
		// otherwise the 3D rotation anchor point correction will be off
		this.setContentSize(cc.winSize);
	},

	/* endregion LAYOUT */

	/* region SCENE */

	onEnter: function () {
		cc.Layer.prototype.onEnter.call(this);
		this._startListeningToEvents();
	},

	onExit: function () {
		cc.Layer.prototype.onExit.call(this);
		this.terminate();
	},

	/* endregion SCENE */

	/* region EVENTS */

	_startListeningToEvents: function () {
		this.getScene().getEventBus().on(EVENTS.resize, this.onResize, this);
	},

	_stopListeningToEvents: function () {
		this.getScene().getEventBus().off(EVENTS.resize, this.onResize, this);
	},

	/* endregion EVENTS  */

	/* region TRANSITION */

	onSetupTransitionIn: function () {
		// called when layer starts transitioning in
		// but only if a layer is transitioned!
		// override in subclass
	},

	onTransitionIn: function () {
		// called when layer finished transitioning in
		// but only if a layer is transitioned!
		// override in subclass
		this.start();
	},

	onSetupTransitionOut: function () {
		// called when layer starts transitioning out
		// but only if a layer is transitioned!
		// override in subclass
		this.terminate();
	},

	onTransitionOut: function () {
		// called when layer finished transitioning out
		// but only if a layer is transitioned!
		// override in subclass
	}

	/* endregion TRANSITION */
});

BaseLayer.create = function(layer) {
	return layer || new BaseLayer();
};

module.exports = BaseLayer;
