const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../'));
require('coffeescript/register');
const { expect } = require('chai');
const _ = require('underscore');
const Promise = require('bluebird');
const CONFIG = require('../../../../app/common/config');
const Logger = require('../../../../app/common/logger.coffee');
const SDK = require('../../../../app/sdk.coffee');
const BeginnerAbyssianChallenge6 = require('../../../../app/sdk/challenges/abyssian/BeginnerAbyssianChallenge6.coffee');
const BeginnerSonghaiChallenge2 = require('../../../../app/sdk/challenges/songhai/BeginnerSonghaiChallenge2.coffee');
const BeginnerMagmarChallenge1 = require('../../../../app/sdk/challenges/magmar/BeginnerMagmarChallenge1.coffee');
const BeginnerVetruvianChallenge5 = require('../../../../app/sdk/challenges/vetruvian/BeginnerVetruvianChallenge5.coffee');
const BeginnerLyonarChallenge4 = require('../../../../app/sdk/challenges/lyonar/BeginnerLyonarChallenge4.coffee');
const BeginnerVanarChallenge5 = require('../../../../app/sdk/challenges/vanar/BeginnerVanarChallenge5.coffee');
const UtilsSDK = require('../../../utils/utils_sdk');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('challenges', () => {
  describe('gate 3', () => {
    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect gate 3: challenge 1 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerVetruvianChallenge5());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 3, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = myPlayer.actionPlayFollowup(followupCard, 4, 2);
      gameSession.executeAction(followupAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 3, 2);
      gameSession.executeAction(playCardFromHandAction);

      let action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      action = gameSession.getGeneralForPlayer1().actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });

    it('expect gate 3: challenge 2 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerAbyssianChallenge6());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 7, 3);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 7, 3);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = myPlayer.actionPlayFollowup(followupCard, 4, 2);
      gameSession.executeAction(followupAction);

      let action = gameSession.getGeneralForPlayer1().actionMove({ x: 3, y: 1 });
      gameSession.executeAction(action);
      action = gameSession.getGeneralForPlayer1().actionAttack(board.getUnitAtPosition({ x: 4, y: 2 }));
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });

    it('expect gate 3: challenge 3 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerVanarChallenge5());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      let action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
      gameSession.executeAction(action);

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 3, 1);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 4, 0);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = myPlayer.actionPlayFollowup(followupCard, 1, 2);
      gameSession.executeAction(followupAction);

      const rhyno = board.getUnitAtPosition({ x: 4, y: 0 });

      action = rhyno.actionMove({ x: 5, y: 1 });
      gameSession.executeAction(action);
      action = rhyno.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      action = rhyno.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });

    it('expect gate 3: challenge 4 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerLyonarChallenge4());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      const silverguardKnight = board.getUnitAtPosition({ x: 2, y: 2 });
      let action = silverguardKnight.actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      action = silverguardKnight.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 4, 2);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 4, 0);
      gameSession.executeAction(playCardFromHandAction);

      action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      action = gameSession.getGeneralForPlayer1().actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });

    it('expect gate 3: challenge 5 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerSonghaiChallenge2());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(3, 1, 2);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(2, 1, 2);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 1, 2);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = myPlayer.actionPlayFollowup(followupCard, 7, 2);
      gameSession.executeAction(followupAction);

      const gorehorn = board.getUnitAtPosition({ x: 7, y: 2 });

      const action = gorehorn.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
  });
});
