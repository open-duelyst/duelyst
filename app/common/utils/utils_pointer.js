const _ = require('underscore');

/** **************************************************************************
  UtilsPointer - pointer utility methods
 - x,y are in GL coordinates, i.e. from BOTTOM LEFT
 - top,left are in ui coordinates, i.e. from TOP LEFT
 *************************************************************************** */
const UtilsPointer = {};

UtilsPointer.pointer = {
  x: 0,
  y: 0,
  deltaX: 0,
  deltaY: 0,
  top: 0,
  left: 0,
  deltaTop: 0,
  deltaLeft: 0,
  down: false,
  downX: 0,
  downY: 0,
  downTop: 0,
  downLeft: 0,
  upX: 0,
  upY: 0,
  upTop: 0,
  upLeft: 0,
  wheelDeltaX: 0,
  wheelDeltaY: 0,
  key: 1,
  right: false,
  type: 0,
};

module.exports = UtilsPointer;

const Pointer = UtilsPointer.pointer;

function setPointerKey(key) {
  if (key !== 1 && key !== 2 && key !== 3) {
    key = 1;
  }
  Pointer.key = key - 1;
  Pointer.right = key === 2;
}

/**
 * Pointer Event object that roughly matches Cocos2D's mouse/touch event.
 * @constructor
 */
const PointerEvent = function () {
  // copy pointer as of when this event was created
  _.extend(this, Pointer);
  this.isStopped = false;
};

PointerEvent.prototype = {
  constructor: PointerEvent,
  getType() {
    return this.type;
  },
  stopPropagation() {
    this.isStopped = true;
  },
  getIsStopped() {
    return this.isStopped;
  },
  getButton() {
    return this.key;
  },
  getLocation() {
    return {
      x: this.x, y: this.y, top: this.top, left: this.left,
    };
  },
  getLocationInView() {
    return { x: this.left, y: this.top };
  },
  getLocationX() {
    return this.x;
  },
  getLocationY() {
    return this.y;
  },
  getLocationTop() {
    return this.top;
  },
  getLocationLeft() {
    return this.left;
  },
  getDelta() {
    return {
      x: this.deltaX, y: this.deltaY, top: this.deltaTop, left: this.deltaLeft,
    };
  },
  getDeltaX() {
    return this.deltaX;
  },
  getDeltaY() {
    return this.deltaY;
  },
  getDeltaTop() {
    return this.deltaTop;
  },
  getDeltaLeft() {
    return this.deltaLeft;
  },
  getWheelDelta() {
    return { x: this.wheelDeltaX, y: this.wheelDeltaY };
  },
  getWheelDeltaX() {
    return this.wheelDeltaX;
  },
  getWheelDeltaY() {
    return this.wheelDeltaY;
  },
};

/**
 * Return current pointer properties as an event.
 * @return {Object}
 */
UtilsPointer.getPointerEvent = function () {
  return new PointerEvent();
};

/**
 * Set current pointer from move event.
 * @param {Object} event
 * @param {Number} documentHeight
 * @param {Number} [offsetLeft=0]
 * @param {Number} [offsetTop=0]
 */
UtilsPointer.setPointerFromMoveEvent = function (event, documentHeight, offsetLeft, offsetTop) {
  if (offsetLeft == null) { offsetLeft = 0; }
  if (offsetTop == null) { offsetTop = 0; }
  const left = event.pageX - offsetLeft;
  const top = event.pageY - offsetTop;
  const x = left;
  const y = documentHeight - top;
  Pointer.deltaX = x - Pointer.x;
  Pointer.deltaY = y - Pointer.y;
  Pointer.x = x;
  Pointer.y = y;
  Pointer.deltaTop = top - Pointer.top;
  Pointer.deltaLeft = left - Pointer.left;
  Pointer.top = top;
  Pointer.left = left;
};

/**
 * Set current pointer from down event.
 * @param {Object} event
 * @param {Number} documentHeight
 * @param {Number} [offsetLeft=0]
 * @param {Number} [offsetTop=0]
 */
UtilsPointer.setPointerFromDownEvent = function (event, documentHeight, offsetLeft, offsetTop) {
  UtilsPointer.setPointerFromMoveEvent(event, documentHeight, offsetLeft, offsetTop);
  Pointer.downX = Pointer.x;
  Pointer.downY = Pointer.y;
  Pointer.downTop = Pointer.top;
  Pointer.downLeft = Pointer.left;
  Pointer.down = true;
  setPointerKey(event.which);
};

/**
 * Set current pointer from up event.
 * @param {Object} event
 * @param {Number} documentHeight
 * @param {Number} [offsetLeft=0]
 * @param {Number} [offsetTop=0]
 */
UtilsPointer.setPointerFromUpEvent = function (event, documentHeight, offsetLeft, offsetTop) {
  UtilsPointer.setPointerFromMoveEvent(event, documentHeight, offsetLeft, offsetTop);
  Pointer.upX = Pointer.x;
  Pointer.upY = Pointer.y;
  Pointer.upTop = Pointer.top;
  Pointer.upLeft = Pointer.left;
  Pointer.down = false;
  setPointerKey(event.which);
};

/**
 * Set current pointer from wheel event.
 * @param {Object} event
 * @param {Number} documentHeight
 * @param {Number} [offsetLeft=0]
 * @param {Number} [offsetTop=0]
 */
UtilsPointer.setPointerFromWheelEvent = function (event, documentHeight, offsetLeft, offsetTop) {
  UtilsPointer.setPointerFromMoveEvent(event, documentHeight, offsetLeft, offsetTop);
  Pointer.wheelDeltaX = event.deltaX;
  Pointer.wheelDeltaY = event.deltaY;
  setPointerKey(event.which);
};
