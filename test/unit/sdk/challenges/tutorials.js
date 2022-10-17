const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../'));
require('coffeescript/register');

const { expect } = require('chai');
const _ = require('underscore');
const Promise = require('bluebird');

const CONFIG = require('../../../../app/common/config');
const Logger = require('../../../../app/common/logger.coffee');
const SDK = require('../../../../app/sdk.coffee');
const BeginnerFlyingChallenge1 = require('../../../../app/sdk/challenges/tutorial/BeginnerFlyingChallenge1.coffee');
const Lesson1 = require('../../../../app/sdk/challenges/tutorial/lesson1.coffee');
const Lesson2 = require('../../../../app/sdk/challenges/tutorial/lesson2.coffee');
const Lesson4 = require('../../../../app/sdk/challenges/tutorial/lesson4.coffee');
const UtilsSDK = require('../../../utils/utils_sdk');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('challenges', () => {
  describe('tutorials', () => {
    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect tutorial lesson 1 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new Lesson1());
      UtilsSDK.executeTutorialUntilOTK();

      // otk: move unit and attack enemy general
      const gameSession = SDK.GameSession.getInstance();
      const unit = gameSession.getBoard().getUnitAtPosition({ x: 5, y: 2 });
      const action1 = unit.actionMove({ x: 7, y: 2 });
      gameSession.executeAction(action1);
      expect(action1.getIsValid()).to.equal(true);

      const enemyGeneral = gameSession.getBoard().getUnitAtPosition({ x: 8, y: 1 });
      const action2 = unit.actionAttack(enemyGeneral);
      gameSession.executeAction(action2);
      expect(action2.getIsValid()).to.equal(true);

      expect(gameSession.isOver()).to.equal(true);
    });

    it('expect tutorial lesson 1 to be failable', () => {
      UtilsSDK.setupSessionForChallenge(new Lesson1());
      UtilsSDK.executeTutorialAndFailOTK();

      const gameSession = SDK.GameSession.getInstance();
      expect(gameSession.getGeneralForMyPlayer().getHP()).to.equal(0);
      expect(gameSession.getChallenge().isChallengeLost).to.equal(true);
    });

    it('expect tutorial lesson 2 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new Lesson2());
      UtilsSDK.executeTutorialUntilOTK();

      // otk: move unit and attack enemy general
      const gameSession = SDK.GameSession.getInstance();
      const unit = gameSession.getBoard().getUnitAtPosition({ x: 4, y: 1 });
      const action1 = unit.actionMove({ x: 3, y: 1 });
      gameSession.executeAction(action1);
      expect(action1.getIsValid()).to.equal(true);

      const enemyGeneral = gameSession.getBoard().getUnitAtPosition({ x: 2, y: 2 });
      const action2 = unit.actionAttack(enemyGeneral);
      gameSession.executeAction(action2);
      expect(action2.getIsValid()).to.equal(true);

      expect(gameSession.isOver()).to.equal(true);
    });

    it('expect tutorial lesson 2 to be failable', () => {
      UtilsSDK.setupSessionForChallenge(new Lesson2());
      UtilsSDK.executeTutorialAndFailOTK();

      const gameSession = SDK.GameSession.getInstance();
      expect(gameSession.getGeneralForMyPlayer().getHP()).to.equal(0);
      expect(gameSession.getChallenge().isChallengeLost).to.equal(true);
    });

    it('expect tutorial lesson 4 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new Lesson4());
      UtilsSDK.executeTutorialUntilOTK();

      // otk: play 2 artifacts and attack enemy general
      const gameSession = SDK.GameSession.getInstance();
      const action1 = gameSession.getMyPlayer().actionPlayCardFromHand(1, 0, 0);
      gameSession.executeAction(action1);
      expect(action1.getIsValid()).to.equal(true);

      const action2 = gameSession.getMyPlayer().actionPlayCardFromHand(4, 0, 0);
      gameSession.executeAction(action2);
      expect(action2.getIsValid()).to.equal(true);

      const enemyGeneral = gameSession.getBoard().getUnitAtPosition({ x: 5, y: 2 });
      const action3 = gameSession.getGeneralForMyPlayer().actionAttack(enemyGeneral);
      gameSession.executeAction(action3);
      expect(action3.getIsValid()).to.equal(true);

      expect(gameSession.isOver()).to.equal(true);
    });

    it('expect tutorial lesson 4 to be failable', () => {
      UtilsSDK.setupSessionForChallenge(new Lesson4());
      UtilsSDK.executeTutorialAndFailOTK();

      const gameSession = SDK.GameSession.getInstance();
      expect(gameSession.getGeneralForMyPlayer().getHP()).to.equal(0);
      expect(gameSession.getChallenge().isChallengeLost).to.equal(true);
    });
  });
});
