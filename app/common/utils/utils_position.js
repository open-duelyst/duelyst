/****************************************************************************
UtilsPosition - position/vec2 utility methods.
****************************************************************************/

var UtilsPosition = {};

module.exports = UtilsPosition;

var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var _ = require('underscore');

/**
 * Creates a mapped array from a list of a positions in board (index) space.
 * @param {Int} columnCount number of columns in board
 * @param {Array} positions integer positions
 * @returns {Array} map
 */
UtilsPosition.getMapFromPositions = function (columnCount, positions) {
	var map = [];

	if (positions && positions.length > 0) {
		for (var i = 0, il = positions.length; i < il; i++) {
			var position = positions[i];
			map[UtilsPosition.getMapIndexFromPosition(columnCount, position.x, position.y)] = position;
		}
	}

	return map;
};

/**
 * Creates a list of positions from a mapped array of positions in board (index) space.
 * @param {Array} map
 * @returns {Array} positions integer positions
 */
UtilsPosition.getPositionsFromMap = function (map) {
	var positions = [];

	if (map && map.length > 0) {
		for (var i = 0, il = map.length; i < il; i++) {
			var position = map[i];
			if (position != null) {
				positions.push(position);
			}
		}
	}

	return positions;
};

/**
 * Checks whether a map has a position.
 * @param {Number} columnCount number of columns in board
 * @param {Array} map
 * @param {Vec2} position integer position
 * @returns {Boolean} true if position exists in map
 */
UtilsPosition.getMapHasPosition = function (columnCount, map, position) {
	return map[UtilsPosition.getMapIndexFromPosition(columnCount, position.x, position.y)] != null;
};
/**
 * Transform a position in board space to a mapped index in an array of mapped positions.
 * NOTE: position must be within board otherwise indices may conflict!
 * @param {Int} columnCount number of columns in board
 * @param {Int} x
 * @param {Int} y
 * @returns {Int} index
 */
UtilsPosition.getMapIndexFromPosition = function (columnCount, x, y) {
	return Math.floor(x + y * columnCount);
};
/**
 * Filters a list of positions down to a list of unique positions.
 * @param {Array} positions
 * @returns {Array} uniquePositions
 */
UtilsPosition.getUniquePositions = function (positions) {
	var uniquePositions = [];

	if (positions && positions.length > 0) {
		for (var i = 0, il = positions.length; i < il; i++) {
			var position = positions[i];
			var unique = true;
			for (var j = 0, jl = uniquePositions.length; j < jl; j++) {
				var uniquePosition = uniquePositions[j];
				if (UtilsPosition.getPositionsAreEqual(position, uniquePosition)) {
					unique = false;
					break;
				}
			}
			if (unique) {
				uniquePositions.push(position);
			}
		}
	}

	return uniquePositions;
};

/**
 * Rotates a position by an angle in radians.
 * @param {Vec2} position
 * @returns {Vec2}
 */
UtilsPosition.rotatePosition = function(position, rad) {
	var x = position.x;
	var y = position.y;
	var cr = Math.cos(rad);
	var sr = Math.sin(rad);
	return {x: x * cr - y * sr, y: x * sr + y * cr};
};
/**
 * Normalizes a position, accounting for a length of 0.
 * @param {Vec2} position
 * @returns {Vec2}
 */
UtilsPosition.normalizePosition = function(position) {
	var x = position.x;
	var y = position.y;
	var len = Math.sqrt(x * x + y * y);
	if (len !== 0.0) { len = 1.0 / len; }
	return {x: x * len, y: y * len};
};
/**
 * Returns the angle between two positions in radians.
 * @param {Vec2} positionA
 * @param {Vec2} positionB
 * @returns {Number} angle in radians
 */
UtilsPosition.getAngleBetweenPositions = function(positionA, positionB) {
	var cross = positionA.x * positionB.y - positionA.y * positionB.x;
	var dot = positionA.x * positionB.x + positionA.y * positionB.y;
	return Math.atan2(cross, dot);
};
/**
 * Finds whether two arrays of positions are equal. Useful for testing position equality when instance equality is not guaranteed.
 * @param {Array} positionsA positions to search
 * @param {Array} positionsB positions to match
 * @returns {Boolean}
 **/
UtilsPosition.getArraysOfPositionsAreEqual = function (positionsA, positionsB) {
	if (positionsA == null || positionsB == null || positionsA.length !== positionsB.length) {
		return false;
	} else {
		for (var i = 0, il = positionsA.length; i < il; i++) {
			var positionA = positionsA[i];
			var positionB = positionsB[i];
			if ((positionA != null && positionB == null) || (positionA == null && positionB != null) || positionA.x !== positionB.x || positionA.y !== positionB.y) {
				return false;
			}
		}
		return true;
	}
};
/**
 * Finds whether one array contains another array. Useful for testing position equality when instance equality is not guaranteed.
 * @param {Array} positionsA positions to search
 * @param {Array} positionsB positions to match
 * @returns {Boolean}
 **/
UtilsPosition.getArrayOfPositionsContainsArrayOfPositions = function (positionsA, positionsB) {
	if (positionsA == null || positionsB == null || positionsA.length < positionsB.length) {
		return false;
	} else {
		for (var i = 0, il = positionsB.length; i < il; i++) {
			var positionB = positionsB[i];
			if (positionB != null) {
				var contains = false;
				var x = positionB.x;
				var y = positionB.y;
				for (var j = 0, jl = positionsA.length; j < jl; j++) {
					var positionA = positionsA[j];
					if (positionA != null && x === positionA.x && y === positionA.y) {
						contains = true;
						break;
					}
				}
				if (!contains) {
					return false;
				}
			}
		}
		return true;
	}
};
/**
 * Finds whether one array contains a multiple of another array. Useful for testing position equality when instance equality is not guaranteed.
 * @param {Array} positionsA positions to search
 * @param {Array} positionsB positions to match
 * @returns {Boolean}
 **/
UtilsPosition.getArrayOfPositionsContainsMultipleArrayOfPositions = function (positionsA, positionsB) {
	if (positionsA == null || positionsB == null || positionsA.length < positionsB.length || positionsA.length % positionsB.length !== 0) {
		return false;
	} else {
		var multiples = positionsA.length / positionsB.length;
		var positionsSearch = positionsA.slice(0);
		for (var m = 0; m < multiples; m++) {
			for (var i = 0, il = positionsB.length; i < il; i++) {
				var positionB = positionsB[i];
				if (positionB != null) {
					var contains = false;
					var x = positionB.x;
					var y = positionB.y;
					for (var j = 0, jl = positionsSearch.length; j < jl; j++) {
						var positionA = positionsSearch[j];
						if (positionA != null && x === positionA.x && y === positionA.y) {
							contains = true;
							positionsSearch.splice(j, 1);
							break;
						}
					}
					if (!contains) {
						return false;
					}
				}
			}
		}
		return true;
	}
};

/**
 * Finds whether a 2D position exists in an array of positions. Useful for testing position equality when instance equality is not guaranteed.
 * @param {Array} positions positions to search
 * @param {Vec2} position position to match
 * @returns {Boolean} true if found
 **/
UtilsPosition.getIsPositionInPositions = function (positions, position) {
	return !!(position && _.find(positions, function (comparisonPosition) {
		return comparisonPosition && position.x === comparisonPosition.x && position.y === comparisonPosition.y
	}));
};

/**
 * Removes a 2D position from an array of positions. Useful for testing position equality when instance equality is not guaranteed.
 * NOTE: this modifies the array in place!
 * @param {Vec2} positionToRemove position to remove
 * @param {Array} positionsToRemoveFrom positions to remove from
 * @returns {Array} array with positions removed
 **/
UtilsPosition.removePositionFromPositions = function (positionToRemove, positionsToRemoveFrom) {
	if (positionToRemove != null) {
		var x = positionToRemove.x;
		var y = positionToRemove.y;
		for (var i = positionsToRemoveFrom.length - 1; i >= 0; i--) {
			var position = positionsToRemoveFrom[i];
			if (x === position.x && y === position.y) {
				positionsToRemoveFrom.splice(i, 1);
			}
		}
	}
	return positionsToRemoveFrom;
};

/**
 * Removes all 2D positions in an array of positions from another array of positions. Useful for testing position equality when instance equality is not guaranteed.
 * NOTE: this modifies the array in place!
 * @param {Array} positionsToRemove positions to remove
 * @param {Array} positionsToRemoveFrom positions to remove from
 * @returns {Array} array with positions removed
 **/
UtilsPosition.removePositionsFromPositions = function (positionsToRemove, positionsToRemoveFrom) {
	if (positionsToRemove != null && positionsToRemove.length > 0) {
		for (var i = positionsToRemoveFrom.length - 1; i >= 0; i--) {
			var position = positionsToRemoveFrom[i];
			if (!UtilsPosition.getIsPositionInPositions(positionsToRemove, position)) {
				positionsToRemoveFrom.splice(i, 1);
			}
		}
	}
	return positionsToRemoveFrom;
};

/**
 * Compares two positions by position and not by object equality.
 * @param positionA {Vec2}
 * @param positionB {Vec2}
 * @returns {Boolean} true equal
 **/
UtilsPosition.getPositionsAreEqual = function (positionA, positionB) {
	return positionA != null && positionB != null && positionA.x == positionB.x && positionA.y == positionB.y;
};

/**
 * Compares two positions by approximate position and not by object equality.
 * @param positionA {Vec2}
 * @param positionB {Vec2}
 * @returns {Boolean} true equal
 **/
UtilsPosition.getPositionsAreEqualAprox = function (positionA, positionB) {
	return positionA != null && positionB != null && positionA.x.toFixed(4) == positionB.x.toFixed(4) && positionA.y.toFixed(4) == positionB.y.toFixed(4);
};
