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
const BeginnerSonghaiChallenge4 = require('../../../../app/sdk/challenges/songhai/BeginnerSonghaiChallenge4.coffee');
const BeginnerVetruvianChallenge3 = require('../../../../app/sdk/challenges/vetruvian/BeginnerVetruvianChallenge3.coffee');
const BeginnerAbyssianChallenge4 = require('../../../../app/sdk/challenges/abyssian/BeginnerAbyssianChallenge4.coffee');
const BeginnerMagmarChallenge3 = require('../../../../app/sdk/challenges/magmar/BeginnerMagmarChallenge3.coffee');
const UtilsSDK = require('../../../utils/utils_sdk');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('challenges', () => {
  describe('gate 1', () => {
    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect gate 1: challenge 1 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerFlyingChallenge1());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 0, 2);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(playCardFromHandAction);

      const lark = board.getUnitAtPosition({ x: 0, y: 2 });

      let action = lark.actionMove({ x: 7, y: 2 });
      gameSession.executeAction(action);
      action = lark.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });

    it('expect gate 1: challenge 2 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerSonghaiChallenge4());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 7, 2);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(playCardFromHandAction);

      const scout = board.getUnitAtPosition({ x: 7, y: 2 });

      const action = scout.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
    /* it('expect gate 1: challenge 3 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new BeginnerVetruvianChallenge3());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 4, 2);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = myPlayer.actionPlayFollowup(followupCard, 5, 2);
      gameSession.executeAction(followupAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = myPlayer.actionPlayFollowup(followupCard, 5, 2);
      gameSession.executeAction(followupAction);

      let action = gameSession.getGeneralForPlayer1().actionMove({ x: 5, y: 2 });
      gameSession.executeAction(action);
      action = gameSession.getGeneralForPlayer1().actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
  }); */
    it('expect gate 1: challenge 4 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerAbyssianChallenge4());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 4, 2);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(playCardFromHandAction);

      const wraithling1 = board.getUnitAtPosition({ x: 3, y: 1 });
      const wraithling2 = board.getUnitAtPosition({ x: 3, y: 2 });
      const wraithling3 = board.getUnitAtPosition({ x: 3, y: 3 });
      const mantis = board.getUnitAtPosition({ x: 2, y: 2 });

      let action = mantis.actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      action = mantis.actionAttack(board.getUnitAtPosition({ x: 5, y: 2 }));
      gameSession.executeAction(action);
      action = wraithling1.actionMove({ x: 5, y: 1 });
      gameSession.executeAction(action);
      action = wraithling1.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      action = wraithling2.actionMove({ x: 5, y: 2 });
      gameSession.executeAction(action);
      action = wraithling2.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      action = wraithling3.actionMove({ x: 5, y: 3 });
      gameSession.executeAction(action);
      action = wraithling3.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });

    it('expect gate 1: challenge 5 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerMagmarChallenge3());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 4, 2);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 0, 0);
      gameSession.executeAction(playCardFromHandAction);

      const ranged1 = board.getUnitAtPosition({ x: 0, y: 0 });
      const ranged2 = board.getUnitAtPosition({ x: 0, y: 4 });

      let action = ranged1.actionAttack(board.getUnitAtPosition({ x: 3, y: 2 }));
      gameSession.executeAction(action);
      action = ranged2.actionAttack(board.getUnitAtPosition({ x: 4, y: 2 }));
      gameSession.executeAction(action);

      action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      action = gameSession.getGeneralForPlayer1().actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
  });
});
