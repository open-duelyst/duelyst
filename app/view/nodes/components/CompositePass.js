var BaseSpriteComponent = require("./BaseSpriteComponent");
var RenderPass = require("./../../fx/RenderPass");

/**
 * CompositePass - abstract component used to add shader effects to a BaseSprite.
 * @param node
 * @param shaderProgram
 * @param shaderRenderCallback
 * @param beginCallback
 * @param endCallback
 */
var CompositePass = BaseSpriteComponent.extend({
	// shader program to use for rendering
	_shaderProgram: null,
	// callback when setting up shader for render, where the first argument is the shader
	_shaderRenderCallback: null,
	// callback when beginning effect
	_beginCallback: null,
	// callback when ending effect
	_endCallback: null,
	// whether this pass needs to be rebuilt before next render
	_needsRebuild: false,

	ctor: function (node, shaderProgram, shaderRenderCallback, beginCallback, endCallback) {
		this._super(node);
		this.setShaderProgram(shaderProgram);
		this.setShaderRenderCallback(shaderRenderCallback);
		this.setBeginCallback(beginCallback);
		this.setEndCallback(endCallback);
	},

	/* region GETTERS / SETTERS */

	setNode: function (val) {
		this._super(val);
		this.setNeedsRebuild();
	},
	setShaderProgram: function (val) {
		this._shaderProgram = val;
	},
	getShaderProgram: function () {
		return this._shaderProgram;
	},
	setShaderRenderCallback: function (val) {
		this._shaderRenderCallback = val;
	},
	getShaderRenderCallback: function () {
		return this._shaderRenderCallback;
	},
	setBeginCallback: function (val) {
		this._beginCallback = val;
	},
	getBeginCallback: function () {
		return this._beginCallback;
	},
	setEndCallback: function (val) {
		this._endCallback = val;
	},
	getEndCallback: function () {
		return this._endCallback;
	},
	setNeedsRebuild: function () {
		this._needsRebuild = true;
	},
	getNeedsRebuild: function () {
		return this._needsRebuild;
	},

	/* endregion GETTERS / SETTERS */

	/* region RENDER PASS */

	rebuild: function () {
		this._needsRebuild = false;
	},

	/* endregion RENDER PASS */

	/* region RENDERING */

	getIsRenderable: function () {
		return this._renderPass != null;
	},

	begin: function () {
		if (this._needsRebuild) {
			this.rebuild();
		}

		if (this.getIsRenderable()) {
			this._beginWhenRenderable.apply(this, arguments);
		}
	},
	_beginWhenRenderable: function () {
		if (_.isFunction(this._beginCallback)) {
			this._beginCallback();
		}
	},
	end: function () {
		if (this.getIsRenderable()) {
			this._endWhenRenderable.apply(this, arguments);
		}
	},
	_endWhenRenderable: function () {
		if (_.isFunction(this._endCallback)) {
			this._endCallback();
		}
	},
	render: function () {
		if (this.getIsRenderable()) {
			this._renderWhenRenderable.apply(this, arguments);
		}
	},
	_renderWhenRenderable: function () {
		// get shader
		var shaderProgram = this._shaderProgram;
		shaderProgram.use();

		// setup for render with shader render callback
		this._shaderRenderCallback(shaderProgram);
	}

	/* endregion RENDERING */

});

module.exports = CompositePass;
