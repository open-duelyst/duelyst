/**
 * Returns whether two positions are equal or adjacent.
 * @param {Vec2} positionA
 * @param {Vec2} positionB
 * @returns {Boolean}
 */
const arePositionsEqualOrAdjacent = function (positionA, positionB) {
  return Math.abs(positionA.x - positionB.x) <= 1 && Math.abs(positionA.y - positionB.y) <= 1;
};

module.exports = arePositionsEqualOrAdjacent;
