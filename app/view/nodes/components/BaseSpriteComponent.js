var _index = 0;

/**
 * BaseSpriteComponent - abstract component used to modify a BaseSprite.
 * @param node
 */
var BaseSpriteComponent = cc.Class.extend({
	// unique id used to map this composited effect
	_id: 0,
	// node this component is targetting
	_node: null,

	ctor: function (node) {
		this._id = _index++;
		this.setNode(node);
	},

	/* region GETTERS / SETTERS */

	setId: function (val) {
		this._id = val;
	},
	getId: function () {
		return this._id;
	},
	setNode: function (val) {
		this._node = val;
	},
	getNode: function () {
		return this._node;
	}

	/* endregion GETTERS / SETTERS */

});

module.exports = BaseSpriteComponent;
