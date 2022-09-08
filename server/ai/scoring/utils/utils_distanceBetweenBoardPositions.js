const distanceBetweenBoardPositions = function (positionA, positionB) {
  // on the duelyst board, the closer we are to a position
  // the more likely it is that non-cardinal directions
  // are the same distance as cardinal directions
  // this formula gives us the following grid:
  // [ 3 ] [ 2 ] [ 2 ] [ 2 ] [ 3 ]
  // [ 2 ] [ 1 ] [ 1 ] [ 1 ] [ 2 ]
  // [ 2 ] [ 1 ] [ x ] [ 1 ] [ 2 ]
  // [ 2 ] [ 1 ] [ 1 ] [ 1 ] [ 2 ]
  // [ 3 ] [ 2 ] [ 2 ] [ 2 ] [ 3 ]
  const dx = positionA.x - positionB.x;
  const dy = positionA.y - positionB.y;
  return Math.round(Math.sqrt(dx * dx + dy * dy));
};

module.exports = distanceBetweenBoardPositions;
