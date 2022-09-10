const _ = require('underscore');
const ScoreForUnit = require('./unit');
const position_proximityToEnemies = require('../position/position_proximityToEnemies');
const position_proximityToGenerals = require('../position/position_proximityToGenerals');
// const position_zeal = require("./position_zeal");
const position_shadowTileAvoidance = require('../position/position_shadowTileAvoidance');
const position_seekManaGlobes = require('../position/position_seekManaGlobes');
// const position_objective_ranged = require("./../position/position_objective_ranged");  // ADD THESE IN.  MISSING FILE REFERENCES
// const position_objective_blastAttack = require("./../position/position_objective_blastAttack"); // ADD THESE IN.  MISSING FILE REFERENCES
const position_objective_backstab = require('../position/position_objective_backstab');
const position_objective_frenzy = require('../position/position_objective_frenzy');
const position_objective_provoke = require('../position/position_objective_provoke');
// const position_objective_deathWatch = require("./../position/position_objective_deathWatch"); // ADD THESE IN.  MISSING FILE REFERENCES
const position_objective_distanceFromBestObjective = require('../position/position_objective_distanceFromBestObjective');
const position_backstabAvoidance = require('../position/position_backstabAvoidance');
const handAndUnspentMana = require('./handAndUnspentMana');
const findBestObjectiveForCardAtTargetPosition = require('../utils/utils_findBestObjectiveForCardAtTargetPosition');

const ScoreForBoard = function (gameSession, playerId) {
  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForBoard() begin. playerId = " + playerId);
  // defaults to current player except when called by a terminating leaf in buildTree() , in which case the gameSession
  // has been advanced to next turn and the ai's playerID is sent in as a param
  if (playerId == null) {
    playerId = gameSession.getCurrentPlayerId();
    // Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForBoard() begin => playerId is null, defaulting to current player = " + playerId);
  }
  let score = 0;
  let scoreBuffer = 0;
  const allUnits = gameSession.getBoard().getUnits();

  _.each(allUnits, (unit) => {
    scoreBuffer = 0;
    /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForBoard() begin => unit " + unit.getLogName() + ". scoreBuffer = " + scoreBuffer + " & score = " + score);
    // unit stats and independent variables
    scoreBuffer += ScoreForUnit(unit);
    // specific case positioning
    // Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForBoard() 1 = " + scoreBuffer);
    const positiontoEvaluate = unit.getPosition(); // allows evaluation of potential spawning/moving/reloc spaces for pre_proc
    // Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForBoard() 3 = " + scoreBuffer);
    scoreBuffer += position_proximityToEnemies(gameSession, unit, positiontoEvaluate);
    // Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForBoard() 4 = " + scoreBuffer);
    scoreBuffer += position_proximityToGenerals(gameSession, unit, positiontoEvaluate);
    // Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForBoard() 5 = " + scoreBuffer);
    scoreBuffer += position_shadowTileAvoidance(gameSession, unit, positiontoEvaluate);
    // Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForBoard() 6 = " + scoreBuffer);
    scoreBuffer += position_seekManaGlobes(gameSession, unit, positiontoEvaluate);
    // Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForBoard() 8 = " + scoreBuffer);
    // positioning/distance using best target
    const bestObjective = findBestObjectiveForCardAtTargetPosition(gameSession, unit, positiontoEvaluate);
    // Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForBoard() 10 = " + scoreBuffer);
    scoreBuffer += position_objective_backstab(gameSession, unit, positiontoEvaluate, bestObjective);
    // Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForBoard() 11 = " + scoreBuffer);
    scoreBuffer += position_objective_frenzy(gameSession, unit, positiontoEvaluate, bestObjective);
    // Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForBoard() 12 = " + scoreBuffer);
    scoreBuffer += position_objective_provoke(gameSession, unit, positiontoEvaluate, bestObjective);
    // Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForBoard() 14 = " + scoreBuffer);

    // TODO: position_objective_distanceFromBestObjective interacts weirdly with scoring triggered evasion logic - for example, attacking that results
    // in lowering your general or a watcher unit below 10 or 4 hp respectively can result in up to a 12 point score
    // penalty for triggering evasive behavior. This would outweigh killing even a 6/6!
    // we need a duplicate scoring module which only has the 0.5 regular position bounty scores for distance.
    // this would yield 6 point penalty -0.5 for each distance away, so at worst it would prevent
    // watchers/generals from becoming evasive unless they are yielding at least ~6 bounty points from the action.
    // this conundrum is because we are only doing single-ply evaluation. the "Evasive" triggers are really just
    // approximations of the opponent's turn and the threat to low-hp, high-value units that need to be preserved
    // if we have buffs or heals in-deck or in-hand, really the evasion logic should apply to "regular" units as well.
    // if they drop below a threshold where we think they are at-risk, they become evasive until we heal/buff them?
    const scoringMode = true; // true = scoring mode, softens the evasion trigger penalty
    scoreBuffer += position_objective_distanceFromBestObjective(gameSession, unit, positiontoEvaluate, bestObjective, scoringMode);

    // Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForBoard() 15 = " + scoreBuffer);
    scoreBuffer += position_backstabAvoidance(gameSession, unit, positiontoEvaluate, bestObjective);
    // Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForBoard() 16 = " + scoreBuffer);
    if (unit.getOwnerId() == playerId) {
      score += scoreBuffer;
    } else {
      score -= scoreBuffer;
    }
    // Logger.module("AI").debug("[G:" + gameSession.gameId + "] ai_getScoreForUnit() END => unit " + unit.getLogName() + ". scoreBuffer = " + scoreBuffer + " & score = " + score);
  });
  // external modules
  score += handAndUnspentMana(gameSession, playerId);

  return score;
};

module.exports = ScoreForBoard;
