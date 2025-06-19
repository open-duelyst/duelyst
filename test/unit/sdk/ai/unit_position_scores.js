const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../'));
require('coffeescript/register');

const { expect } = require('chai');
const _ = require('underscore');

const positionBackstabAvoidance = require('../../../../server/ai/scoring/position/position_backstabAvoidance');
const positionObjectiveBackstab = require('../../../../server/ai/scoring/position/position_objective_backstab');
const positionObjectiveDistanceFromBestObjective = require('../../../../server/ai/scoring/position/position_objective_distanceFromBestObjective');
const positionObjectiveFrenzy = require('../../../../server/ai/scoring/position/position_objective_frenzy');
const positionObjectiveProvoke = require('../../../../server/ai/scoring/position/position_objective_provoke');
const positionProximityToEnemies = require('../../../../server/ai/scoring/position/position_proximityToEnemies');
const positionProximityToGenerals = require('../../../../server/ai/scoring/position/position_proximityToGenerals');
const positionShadowTileAvoidance = require('../../../../server/ai/scoring/position/position_shadowTileAvoidance');
const positionZeal = require('../../../../server/ai/scoring/position/position_zeal');
const UtilsSDK = require('../../../utils/utils_sdk');
const SDK = require('../../../../app/sdk.coffee');
const Logger = require('../../../../app/common/logger.coffee');
const CONFIG = require('../../../../app/common/config');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('unit position scoring', () => {
  describe('positioning tests', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction2.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('Backstab Avoidance', () => {
      // TEST FOR:
      //  positionBackstabAvoidance(gameSession, unit, position, bestObjective)
      // LOCATED @:
      //  server/ai/scoring/position/positionBackstabAvoidance
      // DESCRIPTION:
      //  if bestObjective is a backstabber, check if position is behind, if so penalize the position.
      //  this should cause units who are able to attack their bestObjective from a non-behind position
      //  to prefer to do so, all things being equal.
      //  Note that this does not penalize positions that are behind ANY backstabber, only the one you're targeting

      const gameSession = SDK.GameSession.getInstance();
      // add backstabber to 2,2 for opponent
      const backstabber = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 2, 2, gameSession.getPlayer2Id());
      // add golem unit to 0,0 for myPlayer
      const golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SkyrockGolem }, 0, 0, gameSession.getPlayer1Id());

      const bestObjective = backstabber;
      // test 1
      const positionBehindBackstabber = { x: 3, y: 2 };
      const scoreForPositionBehindTargetedBackstabber = positionBackstabAvoidance(gameSession, golem, positionBehindBackstabber, bestObjective);
      if (scoreForPositionBehindTargetedBackstabber != null) {
        console.log(`Score for ${golem.getName()} at position`, positionBehindBackstabber, `with bestObjective ${bestObjective.getName()} at position`, bestObjective.getPosition(), '=', scoreForPositionBehindTargetedBackstabber);
      }
      // test 2
      const positionAdjacentNotBehindBackstabber = { x: 2, y: 1 };
      const scoreForPositionAdjacentNotBehindTargetedBackstabber = positionBackstabAvoidance(gameSession, golem, positionAdjacentNotBehindBackstabber, bestObjective);
      if (scoreForPositionAdjacentNotBehindTargetedBackstabber != null) {
        console.log(`Score for ${golem.getName()} at position`, positionAdjacentNotBehindBackstabber, `with bestObjective ${bestObjective.getName()} at position`, bestObjective.getPosition(), '=', scoreForPositionAdjacentNotBehindTargetedBackstabber);
      }
      // test 3
      const positionAwayFromBackstabber = { x: 0, y: 1 };
      const scoreForPositionAwayFromTargetedBackstabber = positionBackstabAvoidance(gameSession, golem, positionAwayFromBackstabber, bestObjective);
      if (scoreForPositionAwayFromTargetedBackstabber != null) {
        console.log(`Score for ${golem.getName()} at position`, positionAwayFromBackstabber, `with bestObjective ${bestObjective.getName()} at position`, bestObjective.getPosition(), '=', scoreForPositionAwayFromTargetedBackstabber);
      }
      // expect
      expect(scoreForPositionBehindTargetedBackstabber).to.be.below(scoreForPositionAdjacentNotBehindTargetedBackstabber)
        .and.to.be.below(scoreForPositionAwayFromTargetedBackstabber);
    });

    it('Objective Backstab', () => {
      // TEST FOR:
      //  positionObjectiveBackstab = function (gameSession, unit, position, bestObjective)
      // LOCATED @:
      //  server/ai/scoring/position/positionObjectiveBackstab
      // DESCRIPTION:
      //  backstabbers prefer to be nearer to the backstab space of their primary objective

      const gameSession = SDK.GameSession.getInstance();

      // add backstabber to 0,0 for myPlayer
      const backstabber = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 0, 0, gameSession.getPlayer1Id());
      // add golem unit to 2,2 for opponent
      const golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SkyrockGolem }, 2, 2, gameSession.getPlayer2Id());

      const bestObjective = golem;
      // test 1
      const positionBehindObjective = { x: 3, y: 2 };
      const scoreForPositionBehindObjective = positionObjectiveBackstab(gameSession, backstabber, positionBehindObjective, bestObjective);
      if (scoreForPositionBehindObjective != null) {
        console.log(`Score for ${backstabber.getName()} at position`, positionBehindObjective, `with bestObjective ${bestObjective.getName()} at position`, bestObjective.getPosition(), '=', scoreForPositionBehindObjective);
      }
      // test 2
      const positionAdjacentNotBehindObjective = { x: 2, y: 1 };
      const scoreForPositionAdjacentNotBehindObjective = positionObjectiveBackstab(gameSession, backstabber, positionAdjacentNotBehindObjective, bestObjective);
      if (scoreForPositionAdjacentNotBehindObjective != null) {
        console.log(`Score for ${backstabber.getName()} at position`, positionAdjacentNotBehindObjective, `with bestObjective ${bestObjective.getName()} at position`, bestObjective.getPosition(), '=', scoreForPositionAdjacentNotBehindObjective);
      }
      // test 3
      let positionAwayFromObjective = { x: 0, y: 1 };
      const scoreForPositionAwayFromObjective = positionObjectiveBackstab(gameSession, backstabber, positionAwayFromObjective, bestObjective);
      if (scoreForPositionAwayFromObjective != null) {
        console.log(`Score for ${backstabber.getName()} at position`, positionAwayFromObjective, `with bestObjective ${bestObjective.getName()} at position`, bestObjective.getPosition(), '=', scoreForPositionAwayFromObjective);
      }
      // test 4 - non-backstabber
      positionAwayFromObjective = { x: 0, y: 1 };
      const scoreForPositionNonBackstabber = positionObjectiveBackstab(gameSession, golem, positionAwayFromObjective, backstabber);
      if (scoreForPositionNonBackstabber != null) {
        console.log(`Score for ${golem.getName()} at position`, positionAwayFromObjective, `with bestObjective ${backstabber.getName()} at position`, backstabber.getPosition(), '=', scoreForPositionNonBackstabber);
      }
      // expect
      expect(scoreForPositionBehindObjective).to.be.above(scoreForPositionAdjacentNotBehindObjective)
        .and.to.be.above(scoreForPositionAwayFromObjective);
      expect(scoreForPositionAdjacentNotBehindObjective).to.be.above(scoreForPositionAwayFromObjective);
      expect(scoreForPositionNonBackstabber).to.be.equal(0);
    });

    it('Distance From Best Objective', () => {
      // TEST FOR:
      //  positionObjectiveDistanceFromBestObjective (gameSession, unit, position, bestObjective, scoringMode)
      // LOCATED @:
      //  server/ai/scoring/position/positionObjectiveDistanceFromBestObjective
      // DESCRIPTION:
      //  evaluates a unit's distance from their best objective
      //  called by board.js
      //  optional {"scoringMode"} parameter compensates for evasion trigger distortion during scoring

      const gameSession = SDK.GameSession.getInstance();

      // add kaidoAssassin to 0,0 for myPlayer
      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 0, 0, gameSession.getPlayer1Id());
      // const heartSeeker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Heartseeker }, 0, 0, gameSession.getPlayer1Id());
      // add golem unit to 3,3 for opponent
      const golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SkyrockGolem }, 3, 3, gameSession.getPlayer2Id());

      // tests for melee unit (non-evasive)
      console.log('melee unit (non-evasive)');
      const bestObjective = golem;
      // test 1 - adjacent (distance 1)
      const positionAdjacentToObjective = { x: 3, y: 2 };
      const scoreForPositionAdjacentToObjective = positionObjectiveDistanceFromBestObjective(gameSession, kaidoAssassin, positionAdjacentToObjective, bestObjective);
      if (scoreForPositionAdjacentToObjective != null) {
        console.log(`Score for ${kaidoAssassin.getName()} at position`, positionAdjacentToObjective, `(distance 1) with bestObjective ${bestObjective.getName()} at position`, bestObjective.getPosition(), '=', scoreForPositionAdjacentToObjective);
      }
      // test 2 - distance 2
      const position2DistanceFromObjective = { x: 2, y: 1 };
      const scoreForPosition2DistanceFromObjective = positionObjectiveDistanceFromBestObjective(gameSession, kaidoAssassin, position2DistanceFromObjective, bestObjective);
      if (scoreForPosition2DistanceFromObjective != null) {
        console.log(`Score for ${kaidoAssassin.getName()} at position`, position2DistanceFromObjective, `(distance 2) with bestObjective ${bestObjective.getName()} at position`, bestObjective.getPosition(), '=', scoreForPosition2DistanceFromObjective);
      }
      // test 3 - distance 3
      const position3DistanceFromObjective = { x: 0, y: 4 };
      const scoreForPosition3DistanceFromObjective = positionObjectiveDistanceFromBestObjective(gameSession, kaidoAssassin, position3DistanceFromObjective, bestObjective);
      if (scoreForPosition3DistanceFromObjective != null) {
        console.log(`Score for ${kaidoAssassin.getName()} at position`, position3DistanceFromObjective, `(distance 3) with bestObjective ${bestObjective.getName()} at position`, bestObjective.getPosition(), '=', scoreForPosition3DistanceFromObjective);
      }
      // expect
      expect(scoreForPositionAdjacentToObjective).to.be.above(scoreForPosition2DistanceFromObjective)
        .and.to.be.above(scoreForPosition3DistanceFromObjective);
      expect(scoreForPosition2DistanceFromObjective).to.be.above(scoreForPosition3DistanceFromObjective);

      //++++++++++++++++++++++++++

      // tests for ranged unit (evasive)
      const damageAction = new SDK.DamageAction(gameSession);
      damageAction.setTarget(kaidoAssassin);
      damageAction.setDamageAmount(kaidoAssassin.getHP());
      UtilsSDK.executeActionWithoutValidation(damageAction);

      const heartSeeker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Heartseeker }, 0, 0, gameSession.getPlayer1Id());

      console.log('ranged unit (evasive)');
      // test 1 - adjacent (distance 1)
      const scoreForPositionRangedAdjacentToObjective = positionObjectiveDistanceFromBestObjective(gameSession, heartSeeker, positionAdjacentToObjective, bestObjective);
      if (scoreForPositionRangedAdjacentToObjective != null) {
        console.log(`Score for ${heartSeeker.getName()} at position`, positionAdjacentToObjective, `(d=1) with bestObjective ${bestObjective.getName()} at position`, bestObjective.getPosition(), '=', scoreForPositionRangedAdjacentToObjective);
      }
      // test 2 - distance 2
      const scoreForPositionRanged2DistanceFromObjective = positionObjectiveDistanceFromBestObjective(gameSession, heartSeeker, position2DistanceFromObjective, bestObjective);
      if (scoreForPositionRanged2DistanceFromObjective != null) {
        console.log(`Score for ${heartSeeker.getName()} at position`, position2DistanceFromObjective, `(d=2) with bestObjective ${bestObjective.getName()} at position`, bestObjective.getPosition(), '=', scoreForPositionRanged2DistanceFromObjective);
      }
      // test 3 - distance 3
      const scoreForPositionRanged3DistanceFromObjective = positionObjectiveDistanceFromBestObjective(gameSession, heartSeeker, position3DistanceFromObjective, bestObjective);
      if (scoreForPositionRanged3DistanceFromObjective != null) {
        console.log(`Score for ${heartSeeker.getName()} at position`, position3DistanceFromObjective, `(d=3) with bestObjective ${bestObjective.getName()} at position`, bestObjective.getPosition(), '=', scoreForPositionRanged3DistanceFromObjective);
      }
      // expect
      expect(scoreForPositionRangedAdjacentToObjective).to.be.below(scoreForPositionRanged2DistanceFromObjective)
        .and.to.be.below(scoreForPositionRanged3DistanceFromObjective);
      expect(scoreForPositionRanged2DistanceFromObjective).to.be.below(scoreForPositionRanged3DistanceFromObjective);
    });

    it('Objective Frenzy', () => {
      // TEST FOR:
      //  positionObjectiveFrenzy (gameSession, unit, position, bestObjective)
      // LOCATED @:
      //  server/ai/scoring/position/positionObjectiveFrenzy
      // DESCRIPTION:
      //  rewards bounty for spaces adjacent to best target for each adjacent enemy unit
      //  does not award bounty if space is not adjacent to bestObjective since we don't
      //  want frenzy to override positioning logic for seeking best objective adjacency for attacks

      const gameSession = SDK.GameSession.getInstance();

      // add frenzyUnit to 0,0 for myPlayer
      const frenzyUnit = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.PiercingMantis }, 0, 0, gameSession.getPlayer1Id());
      // add enemies
      const heartSeeker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Heartseeker }, 2, 2, gameSession.getPlayer2Id());
      const golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SkyrockGolem }, 3, 3, gameSession.getPlayer2Id());

      const bestObjective = heartSeeker;

      // test 1 - adjacent to best target and 1 additional adjacent enemy
      const positionAdjacentToObjectiveAndEnemy = { x: 3, y: 2 };
      const scoreForPositionAdjacentToObjectiveAndEnemy = positionObjectiveFrenzy(gameSession, frenzyUnit, positionAdjacentToObjectiveAndEnemy, bestObjective);
      if (scoreForPositionAdjacentToObjectiveAndEnemy != null) {
        console.log(`Score for ${frenzyUnit.getName()} adjacent to best objective and one other enemey unit =`, scoreForPositionAdjacentToObjectiveAndEnemy);
      }
      // test 2 - adjacent to best target only, no others
      const positionAdjacentToObjectiveOnly = { x: 2, y: 1 };
      const scoreForPositionAdjacentToObjectiveOnly = positionObjectiveFrenzy(gameSession, frenzyUnit, positionAdjacentToObjectiveOnly, bestObjective);
      if (scoreForPositionAdjacentToObjectiveOnly != null) {
        console.log(`Score for ${frenzyUnit.getName()} adjacent to best objective only =`, scoreForPositionAdjacentToObjectiveOnly);
      }
      // test 3 - not adjacent to objective, but adjacent to non-objective enemy
      const positionNotAdjacentToObjectiveAdjacentToOther = { x: 4, y: 4 };
      const scoreForPositionNotAdjacentToObjectiveAdjacentToOther = positionObjectiveFrenzy(gameSession, frenzyUnit, positionNotAdjacentToObjectiveAdjacentToOther, bestObjective);
      if (scoreForPositionNotAdjacentToObjectiveAdjacentToOther != null) {
        console.log(`Score for ${frenzyUnit.getName()} adjacent to NON-objective enemy unit only =`, scoreForPositionNotAdjacentToObjectiveAdjacentToOther);
      }
      // expect
      expect(scoreForPositionAdjacentToObjectiveAndEnemy).to.be.above(scoreForPositionAdjacentToObjectiveOnly)
        .and.to.be.above(scoreForPositionNotAdjacentToObjectiveAdjacentToOther);
      expect(scoreForPositionNotAdjacentToObjectiveAdjacentToOther).to.be.equal(0);
    });

    it('Objective Provoke', () => {
      // TEST FOR:
      //  positionObjectiveProvoke = function (gameSession, unit, position, bestObjective)
      // LOCATED @:
      //  server/ai/scoring/position/positionObjectiveProvoke
      // DESCRIPTION:
      //  more enemy units around this position the better
      //  penalizes distance from best enemy target redundantly from existing distance penalty
      //  does not reward provoking general like in v1 logic...

      const gameSession = SDK.GameSession.getInstance();

      // add provokeUnit to 0,0 for myPlayer
      const provokeUnit = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.RockPulverizer }, 0, 0, gameSession.getPlayer1Id());
      // add enemies
      const heartSeeker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Heartseeker }, 2, 2, gameSession.getPlayer2Id());
      const golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SkyrockGolem }, 3, 3, gameSession.getPlayer2Id());

      const bestObjective = heartSeeker;

      // test 1 - adjacent to best target and 1 additional adjacent enemy
      const positionAdjacentToObjectiveAndEnemy = { x: 3, y: 2 };
      const scoreForPositionAdjacentToObjectiveAndEnemy = positionObjectiveProvoke(gameSession, provokeUnit, positionAdjacentToObjectiveAndEnemy, bestObjective);
      if (scoreForPositionAdjacentToObjectiveAndEnemy != null) {
        console.log(`Score for ${provokeUnit.getName()} adjacent to best objective and one other enemey unit =`, scoreForPositionAdjacentToObjectiveAndEnemy);
      }
      // test 2 - adjacent to best target only, no others
      const positionAdjacentToObjectiveOnly = { x: 2, y: 1 };
      const scoreForPositionAdjacentToObjectiveOnly = positionObjectiveProvoke(gameSession, provokeUnit, positionAdjacentToObjectiveOnly, bestObjective);
      if (scoreForPositionAdjacentToObjectiveOnly != null) {
        console.log(`Score for ${provokeUnit.getName()} adjacent to best objective only =`, scoreForPositionAdjacentToObjectiveOnly);
      }
      // test 3 - not adjacent to objective, but adjacent to non-objective enemy
      const positionNotAdjacentToObjectiveAdjacentToOther = { x: 4, y: 4 };
      const scoreForPositionNotAdjacentToObjectiveAdjacentToOther = positionObjectiveProvoke(gameSession, provokeUnit, positionNotAdjacentToObjectiveAdjacentToOther, bestObjective);
      if (scoreForPositionNotAdjacentToObjectiveAdjacentToOther != null) {
        console.log(`Score for ${provokeUnit.getName()} adjacent to NON-objective enemy unit, 3 distance from objective =`, scoreForPositionNotAdjacentToObjectiveAdjacentToOther);
      }
      // expect
      expect(scoreForPositionAdjacentToObjectiveAndEnemy).to.be.above(scoreForPositionAdjacentToObjectiveOnly)
        .and.to.be.above(scoreForPositionNotAdjacentToObjectiveAdjacentToOther);
    });

    it('Proximity to Enemies', () => {
      // TEST FOR:
      //  positionProximityToEnemies = function (gameSession, unit, position)
      // LOCATED @:
      //  server/ai/scoring/position/positionProximityToEnemies
      // DESCRIPTION:
      //  high hp units prefer to be near more units, low hp units do not.

      const gameSession = SDK.GameSession.getInstance();

      // add provokeUnit to 0,0 for myPlayer
      const RockPulverizer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.RockPulverizer }, 0, 0, gameSession.getPlayer1Id());
      const RockPulverizerDamaged = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.RockPulverizer }, 0, 1, gameSession.getPlayer1Id());
      // add enemies
      const heartSeeker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Heartseeker }, 2, 2, gameSession.getPlayer2Id());
      const golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SkyrockGolem }, 3, 3, gameSession.getPlayer2Id());
      // UtilsSDK.modifyUnitStats = function (position, atk, maxHP, dmg)
      UtilsSDK.modifyUnitStats(RockPulverizerDamaged.getPosition(), null, null, 1); // damage rock pulverizer to 3 hp
      const bestObjective = heartSeeker;
      console.log('4 hp unit (= HIGH_HP_THRESHOLD)');
      // test 1 - adjacent to best target and 1 additional adjacent enemy
      let positionAdjacentToObjectiveAndEnemy = { x: 3, y: 2 };
      let scoreForPositionAdjacentToObjectiveAndEnemy = positionProximityToEnemies(gameSession, RockPulverizer, positionAdjacentToObjectiveAndEnemy, bestObjective);
      if (scoreForPositionAdjacentToObjectiveAndEnemy != null) {
        console.log(`Score for ${RockPulverizer.getName()} adjacent to best objective and one other enemey unit =`, scoreForPositionAdjacentToObjectiveAndEnemy);
      }
      // test 2 - adjacent to best target only, no others
      let positionAdjacentToObjectiveOnly = { x: 2, y: 1 };
      let scoreForPositionAdjacentToObjectiveOnly = positionProximityToEnemies(gameSession, RockPulverizer, positionAdjacentToObjectiveOnly, bestObjective);
      if (scoreForPositionAdjacentToObjectiveOnly != null) {
        console.log(`Score for ${RockPulverizer.getName()} adjacent to best objective only =`, scoreForPositionAdjacentToObjectiveOnly);
      }
      // test 3 - not adjacent to anything
      let positionNotAdjacentToObjectiveAdjacentToOther = { x: 0, y: 4 };
      let scoreForPositionNotAdjacentToObjectiveAdjacentToOther = positionProximityToEnemies(gameSession, RockPulverizer, positionNotAdjacentToObjectiveAdjacentToOther, bestObjective);
      if (scoreForPositionNotAdjacentToObjectiveAdjacentToOther != null) {
        console.log(`Score for ${RockPulverizer.getName()} adjacent to nothing =`, scoreForPositionNotAdjacentToObjectiveAdjacentToOther);
      }
      // expect
      expect(scoreForPositionAdjacentToObjectiveAndEnemy).to.be.above(scoreForPositionAdjacentToObjectiveOnly);
      expect(scoreForPositionNotAdjacentToObjectiveAdjacentToOther).to.be.equal(0);
      //+++++++++++++++++++
      console.log('3 hp unit (< HIGH_HP_THRESHOLD)');
      // test 1 - adjacent to best target and 1 additional adjacent enemy
      positionAdjacentToObjectiveAndEnemy = { x: 3, y: 2 };
      scoreForPositionAdjacentToObjectiveAndEnemy = positionProximityToEnemies(gameSession, RockPulverizerDamaged, positionAdjacentToObjectiveAndEnemy, bestObjective);
      if (scoreForPositionAdjacentToObjectiveAndEnemy != null) {
        console.log(`Score for ${RockPulverizerDamaged.getName()} adjacent to best objective and one other enemey unit =`, scoreForPositionAdjacentToObjectiveAndEnemy);
      }
      // test 2 - adjacent to best target only, no others
      positionAdjacentToObjectiveOnly = { x: 2, y: 1 };
      scoreForPositionAdjacentToObjectiveOnly = positionProximityToEnemies(gameSession, RockPulverizerDamaged, positionAdjacentToObjectiveOnly, bestObjective);
      if (scoreForPositionAdjacentToObjectiveOnly != null) {
        console.log(`Score for ${RockPulverizerDamaged.getName()} adjacent to best objective only =`, scoreForPositionAdjacentToObjectiveOnly);
      }
      // test 3 - not adjacent to objective, but adjacent to non-objective enemy
      positionNotAdjacentToObjectiveAdjacentToOther = { x: 0, y: 4 };
      scoreForPositionNotAdjacentToObjectiveAdjacentToOther = positionProximityToEnemies(gameSession, RockPulverizerDamaged, positionNotAdjacentToObjectiveAdjacentToOther, bestObjective);
      if (scoreForPositionNotAdjacentToObjectiveAdjacentToOther != null) {
        console.log(`Score for ${RockPulverizerDamaged.getName()} adjacent to NON-objective enemy unit, 3 distance from objective =`, scoreForPositionNotAdjacentToObjectiveAdjacentToOther);
      }
      // expect
      expect(scoreForPositionAdjacentToObjectiveOnly).to.be.above(scoreForPositionAdjacentToObjectiveAndEnemy)
        .and.to.be.below(scoreForPositionNotAdjacentToObjectiveAdjacentToOther);
      expect(scoreForPositionNotAdjacentToObjectiveAdjacentToOther).to.be.equal(0);
    });

    it('Proximity to Generals', () => {
      // TEST FOR:
      //  positionProximityToGenerals = function (gameSession, unit, position)
      // LOCATED @:
      //  server/ai/scoring/position/positionProximityToGenerals
      // DESCRIPTION:
      //  units want to be near opponent general
      //  exponentially increasing desire to be near own general as hp declines

      const gameSession = SDK.GameSession.getInstance();

      // add provokeUnit to 0,0 for myPlayer
      const RockPulverizer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.RockPulverizer }, 0, 0, gameSession.getPlayer1Id());
      // add enemies
      // UtilsSDK.modifyUnitStats = function (position, atk, maxHP, dmg)
      // UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 22);

      console.log('friendly general full hp');
      // test 1 - adjacent to enemy general, 7 from friendly general
      const positionAdjacentToEnemyGeneral = { x: 7, y: 2 };
      let scoreForPositionAdjacentToEnemyGeneral = positionProximityToGenerals(gameSession, RockPulverizer, positionAdjacentToEnemyGeneral);
      if (scoreForPositionAdjacentToEnemyGeneral != null) {
        console.log(`Score for ${RockPulverizer.getName()} adjacent to enemy general, 7 from friendly general =`, scoreForPositionAdjacentToEnemyGeneral);
      }
      // test 2 - distance 4 from enemy general, adjacent to friendly general
      const position4AwayFromEnemyGeneral = { x: 1, y: 2 };
      let scoreForPosition4AwayFromEnemyGeneral = positionProximityToGenerals(gameSession, RockPulverizer, position4AwayFromEnemyGeneral);
      if (scoreForPosition4AwayFromEnemyGeneral != null) {
        console.log(`Score for ${RockPulverizer.getName()} 7 distance from enemy general, adjacent to friendly general =`, scoreForPosition4AwayFromEnemyGeneral);
      }
      // expect
      expect(scoreForPositionAdjacentToEnemyGeneral).to.be.above(scoreForPosition4AwayFromEnemyGeneral);

      console.log('friendly general 15 hp');
      UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 10);
      // test 1 - adjacent to enemy general, 5 from friendly general
      scoreForPositionAdjacentToEnemyGeneral = positionProximityToGenerals(gameSession, RockPulverizer, positionAdjacentToEnemyGeneral);
      if (scoreForPositionAdjacentToEnemyGeneral != null) {
        console.log(`Score for ${RockPulverizer.getName()} adjacent to enemy general, 7 from friendly general =`, scoreForPositionAdjacentToEnemyGeneral);
      }
      // test 2 - distance 4 from enemy general, adjacent to friendly general
      scoreForPosition4AwayFromEnemyGeneral = positionProximityToGenerals(gameSession, RockPulverizer, position4AwayFromEnemyGeneral);
      if (scoreForPosition4AwayFromEnemyGeneral != null) {
        console.log(`Score for ${RockPulverizer.getName()} 7 distance from enemy general, adjacent to friendly general =`, scoreForPosition4AwayFromEnemyGeneral);
      }
      // expect
      // expect(scoreForPositionAdjacentToEnemyGeneral).to.be.above(scoreForPosition4AwayFromEnemyGeneral);
      console.log('friendly general 5 hp');
      UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 20);
      // test 1 - adjacent to enemy general, 5 from friendly general
      scoreForPositionAdjacentToEnemyGeneral = positionProximityToGenerals(gameSession, RockPulverizer, positionAdjacentToEnemyGeneral);
      if (scoreForPositionAdjacentToEnemyGeneral != null) {
        console.log(`Score for ${RockPulverizer.getName()} adjacent to enemy general, 7 from friendly general =`, scoreForPositionAdjacentToEnemyGeneral);
      }
      // test 2 - distance 4 from enemy general, adjacent to friendly general
      scoreForPosition4AwayFromEnemyGeneral = positionProximityToGenerals(gameSession, RockPulverizer, position4AwayFromEnemyGeneral);
      if (scoreForPosition4AwayFromEnemyGeneral != null) {
        console.log(`Score for ${RockPulverizer.getName()} 7 distance from enemy general, adjacent to friendly general =`, scoreForPosition4AwayFromEnemyGeneral);
      }
      // expect
      // expect(scoreForPositionAdjacentToEnemyGeneral).to.be.above(scoreForPosition4AwayFromEnemyGeneral);
    });

    it('Shadow Tile Avoidance', () => {
      // TEST FOR:
      //  positionShadowTileAvoidance = function (gameSession, unit, position) {
      // LOCATED @:
      //  server/ai/scoring/position/positionShadowTileAvoidance
      // DESCRIPTION:
      //  estimates score for unit damage multiplied by -2

      const gameSession = SDK.GameSession.getInstance();

      // add units to 0,0 for myPlayer
      const SilverguardKnight = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardKnight }, 2, 2, gameSession.getPlayer2Id());
      const SilverguardKnightDamaged = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardKnight }, 3, 3, gameSession.getPlayer2Id());
      UtilsSDK.modifyUnitStats(SilverguardKnightDamaged.getPosition(), null, null, 1);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ShadowNova }));
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;
      // play shadow nova to 3,3
      // constructor: (gameSession, ownerId, x, y, handIndex) ->
      UtilsSDK.executeActionWithoutValidation(new SDK.PlayCardFromHandAction(gameSession, gameSession.getPlayer1Id(), 3, 3, 0));
      // test 1 - 4 shadow creep dmg to a 5 hp unit
      const positionInsideShadowCreep = { x: 3, y: 3 };
      const positionOutsideShadowCreep = { x: 7, y: 4 };
      const scoreForPositionInsideShadowCreep5hp = positionShadowTileAvoidance(gameSession, SilverguardKnight, positionInsideShadowCreep);
      if (scoreForPositionInsideShadowCreep5hp != null) {
        console.log(`Score for 4 shadow creep dmg to ${SilverguardKnight.getName()} with 5 hp =`, scoreForPositionInsideShadowCreep5hp);
      }
      const scoreForPositionOutsideShadowCreep5hp = positionShadowTileAvoidance(gameSession, SilverguardKnight, positionOutsideShadowCreep);
      if (scoreForPositionOutsideShadowCreep5hp != null) {
        console.log(`Score for 0 shadow creep dmg to ${SilverguardKnight.getName()} with 5 hp =`, scoreForPositionOutsideShadowCreep5hp);
      }
      const scoreForPositionInsideShadowCreep4hp = positionShadowTileAvoidance(gameSession, SilverguardKnightDamaged, positionInsideShadowCreep);
      if (scoreForPositionInsideShadowCreep4hp != null) {
        console.log(`Score for 4 shadow creep dmg to ${SilverguardKnightDamaged.getName()} with 4 hp =`, scoreForPositionInsideShadowCreep4hp);
      }
      // expect
      // expect(scoreForPositionInsideShadowCreep4hp).to.be.above(scoreForPositionInsideShadowCreep5hp)
      // .and.to.be.above(scoreForPositionOutsideShadowCreep5hp);
      // expect(scoreForPositionOutsideShadowCreep5hp).to.be.equal(0);
    });

    it('Zeal', () => {
      // TEST FOR:
      //  positionZeal = function (gameSession, unit, position)
      // LOCATED @:
      //  server/ai/scoring/position/positionZeal
      // DESCRIPTION:
      //  bonus for adjacency to general - either on or off, does not create desire to move into zeal range

      const gameSession = SDK.GameSession.getInstance();

      // add zealUnit to 0,0 for myPlayer
      const WindbladeAdept = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.WindbladeAdept }, 0, 0, gameSession.getPlayer1Id());

      // test 1 - adjacent to enemy general
      const positionAdjacentToGeneral = { x: 1, y: 2 };
      const scoreForPositionAdjacentToGeneral = positionZeal(gameSession, WindbladeAdept, positionAdjacentToGeneral);
      if (scoreForPositionAdjacentToGeneral != null) {
        console.log(`Score for ${WindbladeAdept.getName()} adjacent to general =`, scoreForPositionAdjacentToGeneral);
      }
      // test 2 - not
      const positionNotAdjacentToGeneral = { x: 7, y: 2 };
      const scoreForPositionNotAdjacentToGeneral = positionZeal(gameSession, WindbladeAdept, positionNotAdjacentToGeneral);
      if (scoreForPositionNotAdjacentToGeneral != null) {
        console.log(`Score for ${WindbladeAdept.getName()} not adjacent to general =`, scoreForPositionNotAdjacentToGeneral);
      }
      // expect
      expect(scoreForPositionAdjacentToGeneral).to.be.above(scoreForPositionNotAdjacentToGeneral);
    });
  });
});
