var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var UtilsSDK = require('./../../../utils/utils_sdk');
var _ = require('underscore');
var Promise = require('bluebird');
var BeginnerFlyingChallenge1 = require('app/sdk/challenges/tutorial/BeginnerFlyingChallenge1');
var Lesson1 = require('app/sdk/challenges/tutorial/lesson1');
var Lesson2 = require('app/sdk/challenges/tutorial/lesson2');
var Lesson4 = require('app/sdk/challenges/tutorial/lesson4');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("challenges", function() {
  describe("tutorials", function() {
    afterEach(function () {
      SDK.GameSession.reset();
    });

    it('expect tutorial lesson 1 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new Lesson1());
			UtilsSDK.executeTutorialUntilOTK();

			// otk: move unit and attack enemy general
			var gameSession = SDK.GameSession.getInstance();
			var unit = gameSession.getBoard().getUnitAtPosition({x: 5, y: 2});
			var action1 = unit.actionMove({x: 7, y: 2});
			gameSession.executeAction(action1);
			expect(action1.getIsValid()).to.equal(true);

			var enemyGeneral = gameSession.getBoard().getUnitAtPosition({x: 8, y: 1});
			var action2 = unit.actionAttack(enemyGeneral);
			gameSession.executeAction(action2);
			expect(action2.getIsValid()).to.equal(true);

			expect(gameSession.isOver()).to.equal(true);
    });

		it('expect tutorial lesson 1 to be failable', function() {
			UtilsSDK.setupSessionForChallenge(new Lesson1());
			UtilsSDK.executeTutorialAndFailOTK();

			var gameSession = SDK.GameSession.getInstance();
			expect(gameSession.getGeneralForMyPlayer().getHP()).to.equal(0);
			expect(gameSession.getChallenge().isChallengeLost).to.equal(true);
		});

    it('expect tutorial lesson 2 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new Lesson2());
			UtilsSDK.executeTutorialUntilOTK();

			// otk: move unit and attack enemy general
			var gameSession = SDK.GameSession.getInstance();
			var unit = gameSession.getBoard().getUnitAtPosition({x: 4, y: 1});
			var action1 = unit.actionMove({x: 3, y: 1});
			gameSession.executeAction(action1);
			expect(action1.getIsValid()).to.equal(true);

			var enemyGeneral = gameSession.getBoard().getUnitAtPosition({x: 2, y: 2});
			var action2 = unit.actionAttack(enemyGeneral);
			gameSession.executeAction(action2);
			expect(action2.getIsValid()).to.equal(true);

			expect(gameSession.isOver()).to.equal(true);
    });

		it('expect tutorial lesson 2 to be failable', function() {
			UtilsSDK.setupSessionForChallenge(new Lesson2());
			UtilsSDK.executeTutorialAndFailOTK();

			var gameSession = SDK.GameSession.getInstance();
			expect(gameSession.getGeneralForMyPlayer().getHP()).to.equal(0);
			expect(gameSession.getChallenge().isChallengeLost).to.equal(true);
		});

    it('expect tutorial lesson 4 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new Lesson4());
			UtilsSDK.executeTutorialUntilOTK();

			// otk: play 2 artifacts and attack enemy general
			var gameSession = SDK.GameSession.getInstance();
			var action1 = gameSession.getMyPlayer().actionPlayCardFromHand(1, 0, 0);
			gameSession.executeAction(action1);
			expect(action1.getIsValid()).to.equal(true);

			var action2 = gameSession.getMyPlayer().actionPlayCardFromHand(4, 0, 0);
			gameSession.executeAction(action2);
			expect(action2.getIsValid()).to.equal(true);

			var enemyGeneral = gameSession.getBoard().getUnitAtPosition({x: 5, y: 2});
			var action3 = gameSession.getGeneralForMyPlayer().actionAttack(enemyGeneral);
			gameSession.executeAction(action3);
			expect(action3.getIsValid()).to.equal(true);

			expect(gameSession.isOver()).to.equal(true);
    });

    it('expect tutorial lesson 4 to be failable', function() {
      UtilsSDK.setupSessionForChallenge(new Lesson4());
			UtilsSDK.executeTutorialAndFailOTK();

			var gameSession = SDK.GameSession.getInstance();
			expect(gameSession.getGeneralForMyPlayer().getHP()).to.equal(0);
			expect(gameSession.getChallenge().isChallengeLost).to.equal(true);
    });

  });
});
