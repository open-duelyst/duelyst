let _index = 0;

/**
 * BaseSpriteComponent - abstract component used to modify a BaseSprite.
 * @param node
 */
const BaseSpriteComponent = cc.Class.extend({
  // unique id used to map this composited effect
  _id: 0,
  // node this component is targetting
  _node: null,

  ctor(node) {
    this._id = _index++;
    this.setNode(node);
  },

  /* region GETTERS / SETTERS */

  setId(val) {
    this._id = val;
  },
  getId() {
    return this._id;
  },
  setNode(val) {
    this._node = val;
  },
  getNode() {
    return this._node;
  },

  /* endregion GETTERS / SETTERS */

});

module.exports = BaseSpriteComponent;
