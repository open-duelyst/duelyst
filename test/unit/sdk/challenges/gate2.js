const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../'));
require('coffeescript/register');
const { expect } = require('chai');
const _ = require('underscore');
const Promise = require('bluebird');
const CONFIG = require('../../../../app/common/config');
const Logger = require('../../../../app/common/logger.coffee');
const SDK = require('../../../../app/sdk.coffee');
const BeginnerAbyssianChallenge1 = require('../../../../app/sdk/challenges/abyssian/BeginnerAbyssianChallenge1.coffee');
const BeginnerSonghaiChallenge5 = require('../../../../app/sdk/challenges/songhai/BeginnerSonghaiChallenge5.coffee');
const BeginnerMagmarChallenge1 = require('../../../../app/sdk/challenges/magmar/BeginnerMagmarChallenge1.coffee');
const BeginnerVetruvianChallenge1 = require('../../../../app/sdk/challenges/vetruvian/BeginnerVetruvianChallenge1.coffee');
const BeginnerLyonarChallenge2 = require('../../../../app/sdk/challenges/lyonar/BeginnerLyonarChallenge2.coffee');
const UtilsSDK = require('../../../utils/utils_sdk');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('challenges', () => {
  describe('gate 2', () => {
    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect gate 2: challenge 1 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerAbyssianChallenge1());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 5, 2);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = myPlayer.actionPlayFollowup(followupCard, 5, 2);
      gameSession.executeAction(followupAction);

      const shadowWatcher = board.getUnitAtPosition({ x: 4, y: 2 });

      let action = gameSession.getGeneralForPlayer1().actionMove({ x: 5, y: 2 });
      gameSession.executeAction(action);
      action = gameSession.getGeneralForPlayer1().actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      action = shadowWatcher.actionMove({ x: 5, y: 1 });
      gameSession.executeAction(action);
      action = shadowWatcher.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });

    it('expect gate 2: challenge 2 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerSonghaiChallenge5());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 1, 2); // SaberspineSeal
      gameSession.executeAction(playCardFromHandAction);
      let action = gameSession.getGeneralForPlayer1().actionMove({ x: 3, y: 2 });
      gameSession.executeAction(action);
      action = gameSession.getGeneralForPlayer1().actionAttack(board.getUnitAtPosition({ x: 4, y: 2 })); // kill silverguard knight
      gameSession.executeAction(action);

      playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 4, 2); // summon tiger
      gameSession.executeAction(playCardFromHandAction);

      const tiger = board.getUnitAtPosition({ x: 4, y: 2 });

      action = tiger.actionMove({ x: 5, y: 2 });
      gameSession.executeAction(action);
      action = tiger.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });

    it('expect gate 2: challenge 3 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerMagmarChallenge1());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      const warbeast = board.getUnitAtPosition({ x: 4, y: 1 });

      let action = warbeast.actionMove({ x: 6, y: 1 });
      gameSession.executeAction(action);
      action = warbeast.actionAttack(board.getUnitAtPosition({ x: 5, y: 2 }));
      gameSession.executeAction(action);

      const playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 5, 2);
      gameSession.executeAction(playCardFromHandAction);
      action = gameSession.getGeneralForPlayer1().actionMove({ x: 5, y: 2 });
      gameSession.executeAction(action);
      action = gameSession.getGeneralForPlayer1().actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });

    it('expect gate 2: challenge 4 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerVetruvianChallenge1());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      const portalGuardian = board.getUnitAtPosition({ x: 3, y: 2 });

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 5, 2);
      gameSession.executeAction(playCardFromHandAction);
      let action = gameSession.getGeneralForPlayer1().actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 5, 2);
      gameSession.executeAction(playCardFromHandAction);

      action = board.getUnitAtPosition({ x: 5, y: 1 }).actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      action = board.getUnitAtPosition({ x: 5, y: 2 }).actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      action = board.getUnitAtPosition({ x: 5, y: 3 }).actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      action = board.getUnitAtPosition({ x: 7, y: 2 }).actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      action = portalGuardian.actionMove({ x: 5, y: 2 });
      gameSession.executeAction(action);
      action = portalGuardian.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });

    it('expect gate 2: challenge 5 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerLyonarChallenge2());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      const ironcliffeGuardian = board.getUnitAtPosition({ x: 4, y: 3 });
      const windbladeAdept = board.getUnitAtPosition({ x: 4, y: 1 });

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 3, 2);
      gameSession.executeAction(playCardFromHandAction);

      playCardFromHandAction = myPlayer.actionPlayCardFromHand(2, 0, 0);
      gameSession.executeAction(playCardFromHandAction);

      let action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      action = gameSession.getGeneralForPlayer1().actionAttack(board.getUnitAtPosition({ x: 5, y: 2 }));
      gameSession.executeAction(action);
      action = windbladeAdept.actionAttack(board.getUnitAtPosition({ x: 5, y: 2 }));
      gameSession.executeAction(action);

      playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 4, 3);
      gameSession.executeAction(playCardFromHandAction);

      action = ironcliffeGuardian.actionMove({ x: 5, y: 3 });
      gameSession.executeAction(action);
      action = ironcliffeGuardian.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
  });
});
