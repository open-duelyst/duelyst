var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var UtilsSDK = require('test/utils/utils_sdk');
var _ = require('underscore');
var position_backstabAvoidance = require('server/ai/scoring/position/position_backstabAvoidance');
var position_objective_backstab = require('server/ai/scoring/position/position_objective_backstab');
var position_objective_distanceFromBestObjective = require('server/ai/scoring/position/position_objective_distanceFromBestObjective');
var position_objective_frenzy = require('server/ai/scoring/position/position_objective_frenzy');
var position_objective_provoke = require('server/ai/scoring/position/position_objective_provoke');
var position_proximityToEnemies = require('server/ai/scoring/position/position_proximityToEnemies');
var position_proximityToGenerals = require('server/ai/scoring/position/position_proximityToGenerals');
var position_shadowTileAvoidance = require('server/ai/scoring/position/position_shadowTileAvoidance');
var position_zeal = require('server/ai/scoring/position/position_zeal');
var UtilsSDK = require('test/utils/utils_sdk');



// disable the logger for cleaner test output
Logger.enabled = false;

describe("unit position scoring", function() {
	describe("positioning tests", function(){
		beforeEach(function () {
			var player1Deck = [
				{id: SDK.Cards.Faction1.General},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction2.General},
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('Backstab Avoidance', function() {
		  //TEST FOR:
		  //  position_backstabAvoidance(gameSession, unit, position, bestObjective)
		  //LOCATED @:
		  //  server/ai/scoring/position/position_backstabAvoidance
      //DESCRIPTION:
		  //  if bestObjective is a backstabber, check if position is behind, if so penalize the position.
		  //  this should cause units who are able to attack their bestObjective from a non-behind position
		  //  to prefer to do so, all things being equal.
		  //  Note that this does not penalize positions that are behind ANY backstabber, only the one you're targeting

			var gameSession = SDK.GameSession.getInstance();
      //add backstabber to 2,2 for opponent
			var backstabber = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 2, 2, gameSession.getPlayer2Id());
      //add golem unit to 0,0 for myPlayer
			var golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SkyrockGolem }, 0, 0, gameSession.getPlayer1Id());

			var bestObjective = backstabber;
      //test 1
			var position_behind_Backstabber = {x:3, y:2};
			var scoreForPosition_behind_TargetedBackstabber = position_backstabAvoidance(gameSession, golem, position_behind_Backstabber, bestObjective);
      if (scoreForPosition_behind_TargetedBackstabber != null) {
        console.log("Score for " + golem.getName() + " at position", position_behind_Backstabber, "with bestObjective " + bestObjective.getName() + " at position", bestObjective.getPosition(), "=", scoreForPosition_behind_TargetedBackstabber );
      }
      //test 2
		  var position_adjacent_NOTBehind_Backstabber = {x:2, y:1};
		  var scoreForPosition_adjacent_NOTBehind_TargetedBackstabber = position_backstabAvoidance(gameSession, golem, position_adjacent_NOTBehind_Backstabber, bestObjective);
		  if (scoreForPosition_adjacent_NOTBehind_TargetedBackstabber != null) {
		    console.log("Score for " + golem.getName() + " at position", position_adjacent_NOTBehind_Backstabber, "with bestObjective " + bestObjective.getName() + " at position", bestObjective.getPosition(), "=", scoreForPosition_adjacent_NOTBehind_TargetedBackstabber);
		  }
      //test 3
			var position_awayFrom_Backstabber = {x:0, y:1};
			var scoreForPosition_awayFrom_TargetedBackstabber = position_backstabAvoidance(gameSession, golem, position_awayFrom_Backstabber, bestObjective);
			if (scoreForPosition_awayFrom_TargetedBackstabber != null) {
			  console.log("Score for " + golem.getName() + " at position", position_awayFrom_Backstabber, "with bestObjective " + bestObjective.getName() + " at position", bestObjective.getPosition(), "=", scoreForPosition_awayFrom_TargetedBackstabber);
			}
      //expect
			expect(scoreForPosition_behind_TargetedBackstabber).to.be.below(scoreForPosition_adjacent_NOTBehind_TargetedBackstabber)
        .and.to.be.below(scoreForPosition_awayFrom_TargetedBackstabber);

		});
		it('Objective Backstab', function () {
		  //TEST FOR:
		  //  position_objective_backstab = function (gameSession, unit, position, bestObjective)
		  //LOCATED @:
		  //  server/ai/scoring/position/position_objective_backstab
		  //DESCRIPTION:
		  //  backstabbers prefer to be nearer to the backstab space of their primary objective

		  var gameSession = SDK.GameSession.getInstance();

		  //add backstabber to 0,0 for myPlayer
		  var backstabber = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 0, 0, gameSession.getPlayer1Id());
		  //add golem unit to 2,2 for opponent
		  var golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SkyrockGolem }, 2, 2, gameSession.getPlayer2Id());

		  var bestObjective = golem;
		  //test 1
		  var position_behind_objective = { x: 3, y: 2 };
		  var scoreForPosition_behind_objective = position_objective_backstab(gameSession, backstabber, position_behind_objective, bestObjective);
		  if (scoreForPosition_behind_objective != null) {
		    console.log("Score for " + backstabber.getName() + " at position", position_behind_objective, "with bestObjective " + bestObjective.getName() + " at position", bestObjective.getPosition(), "=", scoreForPosition_behind_objective);
		  }
		  //test 2
		  var position_adjacent_NOTBehind_objective = { x: 2, y: 1 };
		  var scoreForPosition_adjacent_NOTBehind_objective = position_objective_backstab(gameSession, backstabber, position_adjacent_NOTBehind_objective, bestObjective);
		  if (scoreForPosition_adjacent_NOTBehind_objective != null) {
		    console.log("Score for " + backstabber.getName() + " at position", position_adjacent_NOTBehind_objective, "with bestObjective " + bestObjective.getName() + " at position", bestObjective.getPosition(), "=", scoreForPosition_adjacent_NOTBehind_objective);
		  }
		  //test 3
		  var position_awayFrom_objective = { x: 0, y: 1 };
		  var scoreForPosition_awayFrom_objective = position_objective_backstab(gameSession, backstabber, position_awayFrom_objective, bestObjective);
		  if (scoreForPosition_awayFrom_objective != null) {
		    console.log("Score for " + backstabber.getName() + " at position", position_awayFrom_objective, "with bestObjective " + bestObjective.getName() + " at position", bestObjective.getPosition(), "=", scoreForPosition_awayFrom_objective);
		  }
		  //test 4 - non-backstabber
		  var position_awayFrom_objective = { x: 0, y: 1 };
		  var scoreForPosition_nonBackstabber = position_objective_backstab(gameSession, golem, position_awayFrom_objective, backstabber);
		  if (scoreForPosition_nonBackstabber != null) {
		    console.log("Score for " + golem.getName() + " at position", position_awayFrom_objective, "with bestObjective " + backstabber.getName() + " at position", backstabber.getPosition(), "=", scoreForPosition_nonBackstabber);
		  }
      //expect
		  expect(scoreForPosition_behind_objective).to.be.above(scoreForPosition_adjacent_NOTBehind_objective)
        .and.to.be.above(scoreForPosition_awayFrom_objective);
		  expect(scoreForPosition_adjacent_NOTBehind_objective).to.be.above(scoreForPosition_awayFrom_objective);
		  expect(scoreForPosition_nonBackstabber).to.be.equal(0);

		});
		it('Distance From Best Objective', function () {
		  //TEST FOR:
		  //  position_objective_distanceFromBestObjective (gameSession, unit, position, bestObjective, scoringMode)
		  //LOCATED @:
		  //  server/ai/scoring/position/position_objective_distanceFromBestObjective
		  //DESCRIPTION:
		  //  evaluates a unit's distance from their best objective
		  //  called by board.js
		  //  optional {"scoringMode"} parameter compensates for evasion trigger distortion during scoring

		  var gameSession = SDK.GameSession.getInstance();

		  //add kaidoAssassin to 0,0 for myPlayer
		  var kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 0, 0, gameSession.getPlayer1Id());
		  //var heartSeeker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Heartseeker }, 0, 0, gameSession.getPlayer1Id());
		  //add golem unit to 3,3 for opponent
		  var golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SkyrockGolem }, 3, 3, gameSession.getPlayer2Id());

		  //tests for melee unit (non-evasive)
		  console.log("melee unit (non-evasive)")
		  var bestObjective = golem;
		  //test 1 - adjacent (distance 1)
		  var position_adjacentTo_objective = { x: 3, y: 2 };
		  var scoreForPosition_adjacentTo_objective = position_objective_distanceFromBestObjective(gameSession, kaidoAssassin, position_adjacentTo_objective, bestObjective);
		  if (scoreForPosition_adjacentTo_objective != null) {
		    console.log("Score for " + kaidoAssassin.getName() + " at position", position_adjacentTo_objective, "(distance 1) with bestObjective " + bestObjective.getName() + " at position", bestObjective.getPosition(), "=", scoreForPosition_adjacentTo_objective);
		  }
		  //test 2 - distance 2
		  var position_2DistanceFrom_objective = { x: 2, y: 1 };
		  var scoreForPosition_2DistanceFrom_objective = position_objective_distanceFromBestObjective(gameSession, kaidoAssassin, position_2DistanceFrom_objective, bestObjective);
		  if (scoreForPosition_2DistanceFrom_objective != null) {
		    console.log("Score for " + kaidoAssassin.getName() + " at position", position_2DistanceFrom_objective, "(distance 2) with bestObjective " + bestObjective.getName() + " at position", bestObjective.getPosition(), "=", scoreForPosition_2DistanceFrom_objective);
		  }
		  //test 3 - distance 3
		  var position_3DistanceFrom_objective = { x: 0, y: 4 };
		  var scoreForPosition_3DistanceFrom_objective = position_objective_distanceFromBestObjective(gameSession, kaidoAssassin, position_3DistanceFrom_objective, bestObjective);
		  if (scoreForPosition_3DistanceFrom_objective != null) {
		    console.log("Score for " + kaidoAssassin.getName() + " at position", position_3DistanceFrom_objective, "(distance 3) with bestObjective " + bestObjective.getName() + " at position", bestObjective.getPosition(), "=", scoreForPosition_3DistanceFrom_objective);
		  }
		  //expect
		  expect(scoreForPosition_adjacentTo_objective).to.be.above(scoreForPosition_2DistanceFrom_objective)
        .and.to.be.above(scoreForPosition_3DistanceFrom_objective);
		  expect(scoreForPosition_2DistanceFrom_objective).to.be.above(scoreForPosition_3DistanceFrom_objective);

		  //++++++++++++++++++++++++++

		  //tests for ranged unit (evasive)
			var damageAction = new SDK.DamageAction(gameSession);
			damageAction.setTarget(kaidoAssassin);
			damageAction.setDamageAmount(kaidoAssassin.getHP());
			UtilsSDK.executeActionWithoutValidation(damageAction);

			var heartSeeker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Heartseeker }, 0, 0, gameSession.getPlayer1Id());

			console.log("ranged unit (evasive)")
		  //test 1 - adjacent (distance 1)
		  var scoreForPosition_ranged_adjacentTo_objective = position_objective_distanceFromBestObjective(gameSession, heartSeeker, position_adjacentTo_objective, bestObjective);
		  if (scoreForPosition_ranged_adjacentTo_objective != null) {
		    console.log("Score for " + heartSeeker.getName() + " at position", position_adjacentTo_objective, "(d=1) with bestObjective " + bestObjective.getName() + " at position", bestObjective.getPosition(), "=", scoreForPosition_ranged_adjacentTo_objective);
		  }
		  //test 2 - distance 2
		  var scoreForPosition_ranged_2DistanceFrom_objective = position_objective_distanceFromBestObjective(gameSession, heartSeeker, position_2DistanceFrom_objective, bestObjective);
		  if (scoreForPosition_ranged_2DistanceFrom_objective != null) {
		    console.log("Score for " + heartSeeker.getName() + " at position", position_2DistanceFrom_objective, "(d=2) with bestObjective " + bestObjective.getName() + " at position", bestObjective.getPosition(), "=", scoreForPosition_ranged_2DistanceFrom_objective);
		  }
		  //test 3 - distance 3
		  var scoreForPosition_ranged_3DistanceFrom_objective = position_objective_distanceFromBestObjective(gameSession, heartSeeker, position_3DistanceFrom_objective, bestObjective);
		  if (scoreForPosition_ranged_3DistanceFrom_objective != null) {
		    console.log("Score for " + heartSeeker.getName() + " at position", position_3DistanceFrom_objective, "(d=3) with bestObjective " + bestObjective.getName() + " at position", bestObjective.getPosition(), "=", scoreForPosition_ranged_3DistanceFrom_objective);
		  }
		  //expect
		  expect(scoreForPosition_ranged_adjacentTo_objective).to.be.below(scoreForPosition_ranged_2DistanceFrom_objective)
        .and.to.be.below(scoreForPosition_ranged_3DistanceFrom_objective);
		  expect(scoreForPosition_ranged_2DistanceFrom_objective).to.be.below(scoreForPosition_ranged_3DistanceFrom_objective);

		});
		it('Objective Frenzy', function () {
		  //TEST FOR:
		  //  position_objective_frenzy (gameSession, unit, position, bestObjective)
		  //LOCATED @:
		  //  server/ai/scoring/position/position_objective_frenzy
		  //DESCRIPTION:
		  //  rewards bounty for spaces adjacent to best target for each adjacent enemy unit
		  //  does not award bounty if space is not adjacent to bestObjective since we don't
		  //  want frenzy to override positioning logic for seeking best objective adjacency for attacks

		  var gameSession = SDK.GameSession.getInstance();

		  //add frenzyUnit to 0,0 for myPlayer
		  var frenzyUnit = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.PiercingMantis }, 0, 0, gameSession.getPlayer1Id());
      //add enemies
		  var heartSeeker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Heartseeker }, 2, 2, gameSession.getPlayer2Id());
		  var golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SkyrockGolem }, 3, 3, gameSession.getPlayer2Id());

		  var bestObjective = heartSeeker;

		  //test 1 - adjacent to best target and 1 additional adjacent enemy
		  var position_adjacentTo_objectiveAndEnemy = { x: 3, y: 2 };
		  var scoreForPosition_adjacentTo_objectiveAndEnemy = position_objective_frenzy(gameSession, frenzyUnit, position_adjacentTo_objectiveAndEnemy, bestObjective);
		  if (scoreForPosition_adjacentTo_objectiveAndEnemy != null) {
		    console.log("Score for " + frenzyUnit.getName() + " adjacent to best objective and one other enemey unit =", scoreForPosition_adjacentTo_objectiveAndEnemy);
		  }
		  //test 2 - adjacent to best target only, no others
		  var position_adjacentToObjectiveOnly = { x: 2, y: 1 };
		  var scoreForPosition_adjacentToObjectiveOnly = position_objective_frenzy(gameSession, frenzyUnit, position_adjacentToObjectiveOnly, bestObjective);
		  if (scoreForPosition_adjacentToObjectiveOnly != null) {
		    console.log("Score for " + frenzyUnit.getName() + " adjacent to best objective only =", scoreForPosition_adjacentToObjectiveOnly);
		  }
		  //test 3 - not adjacent to objective, but adjacent to non-objective enemy
		  var position_notAdjacentToObjective_adjacentToOther = { x: 4, y: 4 };
		  var scoreForPosition_notAdjacentToObjective_adjacentToOther = position_objective_frenzy(gameSession, frenzyUnit, position_notAdjacentToObjective_adjacentToOther, bestObjective);
		  if (scoreForPosition_notAdjacentToObjective_adjacentToOther != null) {
		    console.log("Score for " + frenzyUnit.getName() + " adjacent to NON-objective enemy unit only =", scoreForPosition_notAdjacentToObjective_adjacentToOther);
		  }
		  //expect
		  expect(scoreForPosition_adjacentTo_objectiveAndEnemy).to.be.above(scoreForPosition_adjacentToObjectiveOnly)
        .and.to.be.above(scoreForPosition_notAdjacentToObjective_adjacentToOther);
		  expect(scoreForPosition_notAdjacentToObjective_adjacentToOther).to.be.equal(0);
		});
		it('Objective Provoke', function () {
		  //TEST FOR:
		  //  position_objective_provoke = function (gameSession, unit, position, bestObjective)
		  //LOCATED @:
		  //  server/ai/scoring/position/position_objective_provoke
		  //DESCRIPTION:
		  //  more enemy units around this position the better
		  //  penalizes distance from best enemy target redundantly from existing distance penalty
      //  does not reward provoking general like in v1 logic...

		  var gameSession = SDK.GameSession.getInstance();

		  //add provokeUnit to 0,0 for myPlayer
		  var provokeUnit = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.RockPulverizer }, 0, 0, gameSession.getPlayer1Id());
		  //add enemies
		  var heartSeeker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Heartseeker }, 2, 2, gameSession.getPlayer2Id());
		  var golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SkyrockGolem }, 3, 3, gameSession.getPlayer2Id());

		  var bestObjective = heartSeeker;

		  //test 1 - adjacent to best target and 1 additional adjacent enemy
		  var position_adjacentTo_objectiveAndEnemy = { x: 3, y: 2 };
		  var scoreForPosition_adjacentTo_objectiveAndEnemy = position_objective_provoke(gameSession, provokeUnit, position_adjacentTo_objectiveAndEnemy, bestObjective);
		  if (scoreForPosition_adjacentTo_objectiveAndEnemy != null) {
		    console.log("Score for " + provokeUnit.getName() + " adjacent to best objective and one other enemey unit =", scoreForPosition_adjacentTo_objectiveAndEnemy);
		  }
		  //test 2 - adjacent to best target only, no others
		  var position_adjacentToObjectiveOnly = { x: 2, y: 1 };
		  var scoreForPosition_adjacentToObjectiveOnly = position_objective_provoke(gameSession, provokeUnit, position_adjacentToObjectiveOnly, bestObjective);
		  if (scoreForPosition_adjacentToObjectiveOnly != null) {
		    console.log("Score for " + provokeUnit.getName() + " adjacent to best objective only =", scoreForPosition_adjacentToObjectiveOnly);
		  }
		  //test 3 - not adjacent to objective, but adjacent to non-objective enemy
		  var position_notAdjacentToObjective_adjacentToOther = { x: 4, y: 4 };
		  var scoreForPosition_notAdjacentToObjective_adjacentToOther = position_objective_provoke(gameSession, provokeUnit, position_notAdjacentToObjective_adjacentToOther, bestObjective);
		  if (scoreForPosition_notAdjacentToObjective_adjacentToOther != null) {
		    console.log("Score for " + provokeUnit.getName() + " adjacent to NON-objective enemy unit, 3 distance from objective =", scoreForPosition_notAdjacentToObjective_adjacentToOther);
		  }
		  //expect
		  expect(scoreForPosition_adjacentTo_objectiveAndEnemy).to.be.above(scoreForPosition_adjacentToObjectiveOnly)
        .and.to.be.above(scoreForPosition_notAdjacentToObjective_adjacentToOther);
		});
		it('Proximity to Enemies', function () {
		  //TEST FOR:
		  //  position_proximityToEnemies = function (gameSession, unit, position)
		  //LOCATED @:
		  //  server/ai/scoring/position/position_proximityToEnemies
		  //DESCRIPTION:
		  //  high hp units prefer to be near more units, low hp units do not.

		  var gameSession = SDK.GameSession.getInstance();

		  //add provokeUnit to 0,0 for myPlayer
		  var RockPulverizer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.RockPulverizer }, 0, 0, gameSession.getPlayer1Id());
		  var RockPulverizerDamaged = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.RockPulverizer }, 0, 1, gameSession.getPlayer1Id());
		  //add enemies
		  var heartSeeker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Heartseeker }, 2, 2, gameSession.getPlayer2Id());
		  var golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SkyrockGolem }, 3, 3, gameSession.getPlayer2Id());
		  //UtilsSDK.modifyUnitStats = function (position, atk, maxHP, dmg)
		  UtilsSDK.modifyUnitStats(RockPulverizerDamaged.getPosition(), null, null, 1); //damage rock pulverizer to 3 hp
		  var bestObjective = heartSeeker;
		  console.log("4 hp unit (= HIGH_HP_THRESHOLD)")
		  //test 1 - adjacent to best target and 1 additional adjacent enemy
		  var position_adjacentTo_objectiveAndEnemy = { x: 3, y: 2 };
		  var scoreForPosition_adjacentTo_objectiveAndEnemy = position_proximityToEnemies(gameSession, RockPulverizer, position_adjacentTo_objectiveAndEnemy, bestObjective);
		  if (scoreForPosition_adjacentTo_objectiveAndEnemy != null) {
		    console.log("Score for " + RockPulverizer.getName() + " adjacent to best objective and one other enemey unit =", scoreForPosition_adjacentTo_objectiveAndEnemy);
		  }
		  //test 2 - adjacent to best target only, no others
		  var position_adjacentToObjectiveOnly = { x: 2, y: 1 };
		  var scoreForPosition_adjacentToObjectiveOnly = position_proximityToEnemies(gameSession, RockPulverizer, position_adjacentToObjectiveOnly, bestObjective);
		  if (scoreForPosition_adjacentToObjectiveOnly != null) {
		    console.log("Score for " + RockPulverizer.getName() + " adjacent to best objective only =", scoreForPosition_adjacentToObjectiveOnly);
		  }
		  //test 3 - not adjacent to anything
		  var position_notAdjacentToObjective_adjacentToOther = { x: 0, y: 4 };
		  var scoreForPosition_notAdjacentToObjective_adjacentToOther = position_proximityToEnemies(gameSession, RockPulverizer, position_notAdjacentToObjective_adjacentToOther, bestObjective);
		  if (scoreForPosition_notAdjacentToObjective_adjacentToOther != null) {
		    console.log("Score for " + RockPulverizer.getName() + " adjacent to nothing =", scoreForPosition_notAdjacentToObjective_adjacentToOther);
		  }
		  //expect
		  expect(scoreForPosition_adjacentTo_objectiveAndEnemy).to.be.above(scoreForPosition_adjacentToObjectiveOnly);
		  expect(scoreForPosition_notAdjacentToObjective_adjacentToOther).to.be.equal(0);
		  //+++++++++++++++++++
		  console.log("3 hp unit (< HIGH_HP_THRESHOLD)")
		  //test 1 - adjacent to best target and 1 additional adjacent enemy
		  var position_adjacentTo_objectiveAndEnemy = { x: 3, y: 2 };
		  var scoreForPosition_adjacentTo_objectiveAndEnemy = position_proximityToEnemies(gameSession, RockPulverizerDamaged, position_adjacentTo_objectiveAndEnemy, bestObjective);
		  if (scoreForPosition_adjacentTo_objectiveAndEnemy != null) {
		    console.log("Score for " + RockPulverizerDamaged.getName() + " adjacent to best objective and one other enemey unit =", scoreForPosition_adjacentTo_objectiveAndEnemy);
		  }
		  //test 2 - adjacent to best target only, no others
		  var position_adjacentToObjectiveOnly = { x: 2, y: 1 };
		  var scoreForPosition_adjacentToObjectiveOnly = position_proximityToEnemies(gameSession, RockPulverizerDamaged, position_adjacentToObjectiveOnly, bestObjective);
		  if (scoreForPosition_adjacentToObjectiveOnly != null) {
		    console.log("Score for " + RockPulverizerDamaged.getName() + " adjacent to best objective only =", scoreForPosition_adjacentToObjectiveOnly);
		  }
		  //test 3 - not adjacent to objective, but adjacent to non-objective enemy
		  var position_notAdjacentToObjective_adjacentToOther = { x: 0, y: 4 };
		  var scoreForPosition_notAdjacentToObjective_adjacentToOther = position_proximityToEnemies(gameSession, RockPulverizerDamaged, position_notAdjacentToObjective_adjacentToOther, bestObjective);
		  if (scoreForPosition_notAdjacentToObjective_adjacentToOther != null) {
		    console.log("Score for " + RockPulverizerDamaged.getName() + " adjacent to NON-objective enemy unit, 3 distance from objective =", scoreForPosition_notAdjacentToObjective_adjacentToOther);
		  }
		  //expect
		  expect(scoreForPosition_adjacentToObjectiveOnly).to.be.above(scoreForPosition_adjacentTo_objectiveAndEnemy)
        .and.to.be.below(scoreForPosition_notAdjacentToObjective_adjacentToOther);
		  expect(scoreForPosition_notAdjacentToObjective_adjacentToOther).to.be.equal(0);
		});
		it('Proximity to Generals', function () {
		  //TEST FOR:
		  //  position_proximityToGenerals = function (gameSession, unit, position)
		  //LOCATED @:
		  //  server/ai/scoring/position/position_proximityToGenerals
		  //DESCRIPTION:
		  //  units want to be near opponent general
		  //  exponentially increasing desire to be near own general as hp declines

		  var gameSession = SDK.GameSession.getInstance();

		  //add provokeUnit to 0,0 for myPlayer
		  var RockPulverizer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.RockPulverizer }, 0, 0, gameSession.getPlayer1Id());
		  //add enemies
		  //UtilsSDK.modifyUnitStats = function (position, atk, maxHP, dmg)
		  //UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 22);

		  console.log("friendly general full hp")
		  //test 1 - adjacent to enemy general, 7 from friendly general
		  var position_adjacentTo_enemyGeneral = { x: 7, y: 2 };
		  var scoreForPosition_adjacentTo_enemyGeneral = position_proximityToGenerals(gameSession, RockPulverizer, position_adjacentTo_enemyGeneral);
		  if (scoreForPosition_adjacentTo_enemyGeneral != null) {
		    console.log("Score for " + RockPulverizer.getName() + " adjacent to enemy general, 7 from friendly general =", scoreForPosition_adjacentTo_enemyGeneral);
		  }
		  //test 2 - distance 4 from enemy general, adjacent to friendly general
		  var position_4AwayFromEnemyGeneral = { x: 1, y: 2 };
		  var scoreForPosition_4AwayFromEnemyGeneral = position_proximityToGenerals(gameSession, RockPulverizer, position_4AwayFromEnemyGeneral);
		  if (scoreForPosition_4AwayFromEnemyGeneral != null) {
		    console.log("Score for " + RockPulverizer.getName() + " 7 distance from enemy general, adjacent to friendly general =", scoreForPosition_4AwayFromEnemyGeneral);
		  }
		  //expect
		  expect(scoreForPosition_adjacentTo_enemyGeneral).to.be.above(scoreForPosition_4AwayFromEnemyGeneral);

		  console.log("friendly general 15 hp")
		  UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 10);
		  //test 1 - adjacent to enemy general, 5 from friendly general
		  scoreForPosition_adjacentTo_enemyGeneral = position_proximityToGenerals(gameSession, RockPulverizer, position_adjacentTo_enemyGeneral);
		  if (scoreForPosition_adjacentTo_enemyGeneral != null) {
		    console.log("Score for " + RockPulverizer.getName() + " adjacent to enemy general, 7 from friendly general =", scoreForPosition_adjacentTo_enemyGeneral);
		  }
		  //test 2 - distance 4 from enemy general, adjacent to friendly general
		  scoreForPosition_4AwayFromEnemyGeneral = position_proximityToGenerals(gameSession, RockPulverizer, position_4AwayFromEnemyGeneral);
		  if (scoreForPosition_4AwayFromEnemyGeneral != null) {
		    console.log("Score for " + RockPulverizer.getName() + " 7 distance from enemy general, adjacent to friendly general =", scoreForPosition_4AwayFromEnemyGeneral);
		  }
		  //expect
		  //expect(scoreForPosition_adjacentTo_enemyGeneral).to.be.above(scoreForPosition_4AwayFromEnemyGeneral);
		  console.log("friendly general 5 hp")
		  UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 20);
		  //test 1 - adjacent to enemy general, 5 from friendly general
		  scoreForPosition_adjacentTo_enemyGeneral = position_proximityToGenerals(gameSession, RockPulverizer, position_adjacentTo_enemyGeneral);
		  if (scoreForPosition_adjacentTo_enemyGeneral != null) {
		    console.log("Score for " + RockPulverizer.getName() + " adjacent to enemy general, 7 from friendly general =", scoreForPosition_adjacentTo_enemyGeneral);
		  }
		  //test 2 - distance 4 from enemy general, adjacent to friendly general
		  scoreForPosition_4AwayFromEnemyGeneral = position_proximityToGenerals(gameSession, RockPulverizer, position_4AwayFromEnemyGeneral);
		  if (scoreForPosition_4AwayFromEnemyGeneral != null) {
		    console.log("Score for " + RockPulverizer.getName() + " 7 distance from enemy general, adjacent to friendly general =", scoreForPosition_4AwayFromEnemyGeneral);
		  }
		  //expect
		  //expect(scoreForPosition_adjacentTo_enemyGeneral).to.be.above(scoreForPosition_4AwayFromEnemyGeneral);
		});
		it('Shadow Tile Avoidance', function () {
		  //TEST FOR:
		  //  position_shadowTileAvoidance = function (gameSession, unit, position) {
		  //LOCATED @:
		  //  server/ai/scoring/position/position_shadowTileAvoidance
		  //DESCRIPTION:
		  //  estimates score for unit damage multiplied by -2

		  var gameSession = SDK.GameSession.getInstance();

		  //add units to 0,0 for myPlayer
		  var SilverguardKnight = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardKnight }, 2, 2, gameSession.getPlayer2Id());
		  var SilverguardKnightDamaged = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardKnight }, 3, 3, gameSession.getPlayer2Id());
		  UtilsSDK.modifyUnitStats(SilverguardKnightDamaged.getPosition(), null, null, 1);
		  UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ShadowNova }));
		  var player1 = gameSession.getPlayer1();
		  player1.remainingMana = 9;
		  //play shadow nova to 3,3
		  //constructor: (gameSession, ownerId, x, y, handIndex) ->
		  UtilsSDK.executeActionWithoutValidation(new SDK.PlayCardFromHandAction(gameSession, gameSession.getPlayer1Id(), 3, 3, 0));
		  //test 1 - 4 shadow creep dmg to a 5 hp unit
		  var position_insideShadowCreep = { x: 3, y: 3 };
		  var position_outsideShadowCreep = { x: 7, y: 4 };
		  var scoreForPosition_insideShadowCreep_5hp = position_shadowTileAvoidance(gameSession, SilverguardKnight, position_insideShadowCreep);
		  if (scoreForPosition_insideShadowCreep_5hp != null) {
		    console.log("Score for 4 shadow creep dmg to " + SilverguardKnight.getName() + " with 5 hp =", scoreForPosition_insideShadowCreep_5hp);
		  }
		  var scoreForPosition_outsideShadowCreep_5hp = position_shadowTileAvoidance(gameSession, SilverguardKnight, position_outsideShadowCreep);
		  if (scoreForPosition_outsideShadowCreep_5hp != null) {
		    console.log("Score for 0 shadow creep dmg to " + SilverguardKnight.getName() + " with 5 hp =", scoreForPosition_outsideShadowCreep_5hp);
		  }
		  var scoreForPosition_insideShadowCreep_4hp = position_shadowTileAvoidance(gameSession, SilverguardKnightDamaged, position_insideShadowCreep);
		  if (scoreForPosition_insideShadowCreep_4hp != null) {
		    console.log("Score for 4 shadow creep dmg to " + SilverguardKnightDamaged.getName() + " with 4 hp =", scoreForPosition_insideShadowCreep_4hp);
		  }
		  //expect
		  //expect(scoreForPosition_insideShadowCreep_4hp).to.be.above(scoreForPosition_insideShadowCreep_5hp)
        //.and.to.be.above(scoreForPosition_outsideShadowCreep_5hp);
		  //expect(scoreForPosition_outsideShadowCreep_5hp).to.be.equal(0);
		});
		it('Zeal', function () {
		  //TEST FOR:
		  //  position_zeal = function (gameSession, unit, position)
		  //LOCATED @:
		  //  server/ai/scoring/position/position_zeal
		  //DESCRIPTION:
		  //  bonus for adjacency to general - either on or off, does not create desire to move into zeal range

		  var gameSession = SDK.GameSession.getInstance();

		  //add zealUnit to 0,0 for myPlayer
		  var WindbladeAdept = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.WindbladeAdept }, 0, 0, gameSession.getPlayer1Id());

		  //test 1 - adjacent to enemy general
		  var position_adjacentTo_general = { x: 1, y: 2 };
		  var scoreForPosition_adjacentTo_general = position_zeal(gameSession, WindbladeAdept, position_adjacentTo_general);
		  if (scoreForPosition_adjacentTo_general != null) {
		    console.log("Score for " + WindbladeAdept.getName() + " adjacent to general =", scoreForPosition_adjacentTo_general);
		  }
		  //test 2 - not
		  var position_notadjacentTo_general = { x: 7, y: 2 };
		  var scoreForPosition_notadjacentTo_general = position_zeal(gameSession, WindbladeAdept, position_notadjacentTo_general);
		  if (scoreForPosition_notadjacentTo_general != null) {
		    console.log("Score for " + WindbladeAdept.getName() + " not adjacent to general =", scoreForPosition_notadjacentTo_general);
		  }
		  //expect
		  expect(scoreForPosition_adjacentTo_general).to.be.above(scoreForPosition_notadjacentTo_general);
		});
	});
});
