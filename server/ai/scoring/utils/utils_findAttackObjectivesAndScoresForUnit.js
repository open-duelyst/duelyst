const BOUNTY = require('server/ai/scoring/bounty');
const filterAttackTargetsForUnit = require('server/ai/scoring/utils/utils_filterAttackTargetsForUnit');
const ScoreForUnitDamage = require('server/ai/scoring/base/unit_damage');
const distanceBetweenBoardPositions = require('server/ai/scoring/utils/utils_distanceBetweenBoardPositions');
const _ = require('underscore');
const SDK = require('app/sdk');

const findAttackObjectivesAndScoresForUnit = function (gameSession, unit, targetPosition) {
  const sourceUnit = unit.getIsPlayed() ? unit : gameSession.getGeneralForPlayerId(unit.getOwnerId());
  // get potential attack targets at target position
  const potentialAttackTargets = sourceUnit.getAttackRange().getValidTargets(gameSession.getBoard(), sourceUnit, targetPosition);
  /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] _findSortedFilteredAttackObjectivesAndScoresForUnit() => potentialAttackTargets " + potentialAttackTargets.length);

  // don't attack units that will die at the end of the turn (shadow creep...)
  // potentialAttackTargets = _.reject(potentialAttackTargets, function (target) {
  //  //----DEBUGGING START (extra logger lines)
  //  var contains = _.contains(_markedForDeath, target);
  //  //if (_markedForDeath.length > 0)
  //  ////Logger.module("AI").debug("[G:" + gameSession.gameId + "] _findSortedFilteredAttackObjectivesAndScoresForUnit() => markedForDeath.length > 0. checking if potential targets include marked for death unit. includes = " + contains);
  //  //----DEBUGGING END
  //  return contains;
  // });

  // sort and filter targets
  const filteredAttackTargets = filterAttackTargetsForUnit(unit, potentialAttackTargets);
  /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] _findSortedFilteredAttackObjectivesAndScoresForUnit() => filteredAttackTargets " + filteredAttackTargets.length);

  // get and cast attack buffs that result in lethal unless we've found lethal on enemy general
  const unitATK = unit.getATK();

  // get scores for all filtered attack targets
  const filteredAttackTargetsAndScores = _.map(filteredAttackTargets, (enemy) => {
    let sortBounty = 0;
    sortBounty += ScoreForUnitDamage(gameSession, enemy, unitATK);
    /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] _findSortedFilteredAttackObjectivesAndScoresForUnit() => unit " + unit.getLogName() + "'s enemy " + enemy.getLogName() + " score for damage = " + sortBounty);
    if (!unit.hasModifierClass(SDK.ModifierRanged) && !unit.hasModifierClass(SDK.ModifierBlastAttack)) {
      sortBounty += unit.getHP() >= enemy.getATK() ? BOUNTY.TARGET_COUNTERATTACK_NOT_LETHAL : 0; // counterattack not lethal +15
    }
    if (unit.hasModifierClass(SDK.ModifierProvoke) && enemy.getIsGeneral()) {
      sortBounty += BOUNTY.PROVOKE_ENEMY_GENERAL;
    }
    if (unit.getIsPlayed()) {
      if (unit.hasModifierClass(SDK.ModifierRanged) || unit.hasModifierClass(SDK.ModifierBlastAttack)) sortBounty += distanceBetweenBoardPositions(unit.position, enemy.position) <= 1 ? 0 : BOUNTY.TARGET_AT_RANGE; // ranged prefer to attack units at range
      if (unit.hasModifierClass(SDK.ModifierBackstab)) sortBounty += gameSession.getBoard().getIsPositionBehindEntity(enemy, unit.position, 1, 0) ? BOUNTY.TARGET_BACKSTAB_PROC : 0; // backstab prefer to attack units from behind
      if (unit.hasModifierClass(SDK.ModifierBlastAttack)) {
        sortBounty += _.reject(gameSession.getBoard().getEntitiesInRow(enemy.getPosition().y, SDK.CardType.Unit), (entity) => entity.getIsSameTeamAs(unit)).length * BOUNTY.TARGET_ENEMIES_IN_SAME_ROW;
      }
    } else { // unit not played, but we still want ranged/blastAttackers to spawn at distance.
      if (unit.hasModifierClass(SDK.ModifierRanged) || unit.hasModifierClass(SDK.ModifierBlastAttack)) sortBounty += distanceBetweenBoardPositions(sourceUnit.position, enemy.position) <= 1 ? 0 : BOUNTY.TARGET_AT_RANGE; // ranged prefer to attack units at range
    }
    /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] _findSortedFilteredAttackObjectivesAndScoresForUnit() => unit " + unit.getLogName() + "'s enemy " + enemy.getLogName() + " sorted bounty = " + sortBounty);
    // return object with objective and score
    return {
      objective: enemy,
      score: sortBounty,
    };
  });
  // sort high to low (descending)
  const sortedFilteredAttackTargetsAndScores = _.sortBy(filteredAttackTargetsAndScores, (objectiveAndScore) => objectiveAndScore.score).reverse();
  /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] _findSortedFilteredAttackObjectivesAndScoresForUnit() => sortedFilteredAttackTargets length = " + sortedFilteredAttackTargetsAndScores.length);
  return sortedFilteredAttackTargetsAndScores;
};

module.exports = findAttackObjectivesAndScoresForUnit;
