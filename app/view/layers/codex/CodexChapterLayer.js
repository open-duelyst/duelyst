"use strict";

var Promise = require("bluebird");
var UtilsEngine = require("./../../../common/utils/utils_engine");
var FXCompositeLayer = require("./../FXCompositeLayer");
var BaseSprite = require("./../../nodes/BaseSprite");

/****************************************************************************
 CodexLayer
 ****************************************************************************/

var CodexLayer = FXCompositeLayer.extend({

	_bg: null,

	/* region INITIALIZE */

	/* endregion INITIALIZE */

	/* region LAYOUT */

	onResize: function () {
		this._super();

		var winCenterPosition = UtilsEngine.getGSIWinCenterPosition();

		// set self to middle of screen
		this.setPosition(winCenterPosition);

		if (this._bg != null) {
			// background
			this._bg.setScale(UtilsEngine.getWindowSizeRelativeNodeScale(this._bg));
		}
	},

	/* endregion LAYOUT */

	/**
	 * Starts showing a chapter and returns a promise.
	 * @param {String} background path to background asset
	 * @param {Number} [duration=0.0] duration to show over
	 * @returns {Promise}
   */
	showChapter: function (background, duration) {
		if (duration == null) { duration = 0.0; }

		this.stopShowingChapter(duration);

		// create scene elements
		this._bg = BaseSprite.create(background);
		this.addChild(this._bg);

		// resize once to layout all elements
		this.onResize();

		// TODO: animate elements in
		return Promise.resolve();
	},

	/**
	 * Stops showing a chapter and returns a promise.
	 * @param {Number} [duration=0.0] duration to remove over
	 * @returns {Promise}
	 */
	stopShowingChapter: function (duration) {
		if (duration == null) { duration = 0.0; }

		if (this._bg != null) {
			this._bg.destroy(duration);
			this._bg = null;
		}

		return Promise.resolve();
	}

});

CodexLayer.create = function(layer) {
	return FXCompositeLayer.create(layer || new CodexLayer());
};

module.exports = CodexLayer;
