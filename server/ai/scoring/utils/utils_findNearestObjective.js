const distanceBetweenBoardPositions = require('server/ai/scoring/utils/utils_distanceBetweenBoardPositions');
const _ = require('underscore');

const findNearestObjective = function (position, objectives) {
  return _.min(objectives, (objective) => distanceBetweenBoardPositions(position, objective.getPosition())) || objectives[0];
};

module.exports = findNearestObjective;
