const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../'));
require('coffeescript/register');

const { expect } = require('chai');
const _ = require('underscore');
const Promise = require('bluebird');

const CONFIG = require('../../../../app/common/config');
const Logger = require('../../../../app/common/logger.coffee');
const SDK = require('../../../../app/sdk.coffee');
const BeginnerAbyssianChallenge3 = require('../../../../app/sdk/challenges/abyssian/BeginnerAbyssianChallenge3.coffee');
const BeginnerSonghaiChallenge1 = require('../../../../app/sdk/challenges/songhai/BeginnerSonghaiChallenge1.coffee');
const BeginnerMagmarChallenge4 = require('../../../../app/sdk/challenges/magmar/BeginnerMagmarChallenge4.coffee');
const BeginnerVetruvianChallenge2 = require('../../../../app/sdk/challenges/vetruvian/BeginnerVetruvianChallenge2.coffee');
const BeginnerRangedChallenge1 = require('../../../../app/sdk/challenges/tutorial/BeginnerRangedChallenge1.coffee');
const BeginnerVanarChallenge2 = require('../../../../app/sdk/challenges/vanar/BeginnerVanarChallenge2.coffee');
const MediumVetruvianChallenge2 = require('../../../../app/sdk/challenges/vetruvian/MediumVetruvianChallenge2.coffee');
const UtilsSDK = require('../../../utils/utils_sdk');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('challenges', () => {
  describe('gate 5', () => {
    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect gate 5: challenge 1 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerVanarChallenge2());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(2, 4, 2);
      gameSession.executeAction(playCardFromHandAction);

      playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = myPlayer.actionPlayFollowup(followupCard, 1, 2);
      gameSession.executeAction(followupAction);
      const followupCard2 = followupAction.getCard().getCurrentFollowupCard();
      const followupAction2 = myPlayer.actionPlayFollowup(followupCard2, 1, 3);
      gameSession.executeAction(followupAction2);

      playCardFromHandAction = myPlayer.actionPlayCardFromHand(3, 3, 1);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 3, 1);
      gameSession.executeAction(playCardFromHandAction);

      const bear = board.getUnitAtPosition({ x: 3, y: 3 });
      const cloaker = board.getUnitAtPosition({ x: 3, y: 1 });

      let action = bear.actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      action = bear.actionAttack(board.getUnitAtPosition({ x: 5, y: 1 }));
      gameSession.executeAction(action);

      action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      action = gameSession.getGeneralForPlayer1().actionAttack(board.getUnitAtPosition({ x: 5, y: 1 }));
      gameSession.executeAction(action);

      action = cloaker.actionMove({ x: 5, y: 1 });
      gameSession.executeAction(action);
      action = cloaker.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });

    it('expect gate 5: challenge 2 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new MediumVetruvianChallenge2());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(2, 0, 2);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(3, 0, 2);
      gameSession.executeAction(playCardFromHandAction);
      let followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      let followupAction = myPlayer.actionPlayFollowup(followupCard, 4, 2);
      gameSession.executeAction(followupAction);

      playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 3, 0);
      gameSession.executeAction(playCardFromHandAction);
      followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      followupAction = myPlayer.actionPlayFollowup(followupCard, 3, 1);
      gameSession.executeAction(followupAction);

      playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 2, 0);
      gameSession.executeAction(playCardFromHandAction);
      followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      followupAction = myPlayer.actionPlayFollowup(followupCard, 2, 2);
      gameSession.executeAction(followupAction);

      const dervish = board.getUnitAtPosition({ x: 4, y: 2 });
      let action = dervish.actionAttack(board.getUnitAtPosition({ x: 3, y: 2 }));
      gameSession.executeAction(action);

      action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 1 });
      gameSession.executeAction(action);
      action = gameSession.getGeneralForPlayer1().actionAttack(board.getUnitAtPosition({ x: 3, y: 2 }));
      gameSession.executeAction(action);

      const orb1 = board.getUnitAtPosition({ x: 3, y: 1 });
      const orb2 = board.getUnitAtPosition({ x: 3, y: 3 });
      const sandHowler = board.getUnitAtPosition({ x: 2, y: 2 });

      action = orb1.actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      action = orb1.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      action = orb2.actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      action = orb2.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      action = sandHowler.actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      action = sandHowler.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });

    it('expect gate 5: challenge 3 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerRangedChallenge1());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      const archer = board.getUnitAtPosition({ x: 0, y: 2 });
      const templar = board.getUnitAtPosition({ x: 2, y: 2 });

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 3, 2);
      gameSession.executeAction(playCardFromHandAction);

      let action = gameSession.getGeneralForPlayer1().actionMove({ x: 3, y: 2 });
      gameSession.executeAction(action);
      action = gameSession.getGeneralForPlayer1().actionAttack(board.getUnitAtPosition({ x: 4, y: 2 }));
      gameSession.executeAction(action);

      action = templar.actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      action = templar.actionAttack(board.getUnitAtPosition({ x: 5, y: 2 }));
      gameSession.executeAction(action);

      playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = myPlayer.actionPlayFollowup(followupCard, 0, 2);
      gameSession.executeAction(followupAction);

      action = archer.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });

    it('expect gate 5: challenge 4 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerAbyssianChallenge3());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      const wraithling = board.getUnitAtPosition({ x: 2, y: 3 });
      const gloomchaser = board.getUnitAtPosition({ x: 2, y: 1 });
      const solus = board.getUnitAtPosition({ x: 4, y: 2 });

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 3, 2);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(2, 6, 2);
      gameSession.executeAction(playCardFromHandAction);
      let followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      let followupAction = myPlayer.actionPlayFollowup(followupCard, 1, 1);
      gameSession.executeAction(followupAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 2, 3);
      gameSession.executeAction(playCardFromHandAction);

      playCardFromHandAction = myPlayer.actionPlayCardFromHand(3, 0, 1);
      gameSession.executeAction(playCardFromHandAction);
      followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      followupAction = myPlayer.actionPlayFollowup(followupCard, 0, 2);
      gameSession.executeAction(followupAction);
      const followupCard2 = followupAction.getCard().getCurrentFollowupCard();
      const followupAction2 = myPlayer.actionPlayFollowup(followupCard2, 0, 3);
      gameSession.executeAction(followupAction2);

      let action = gameSession.getGeneralForPlayer1().actionAttack(board.getUnitAtPosition({ x: 1, y: 1 }));
      gameSession.executeAction(action);

      action = wraithling.actionMove({ x: 4, y: 3 });
      gameSession.executeAction(action);
      action = wraithling.actionAttack(board.getUnitAtPosition({ x: 5, y: 2 }));
      gameSession.executeAction(action);
      action = gloomchaser.actionMove({ x: 4, y: 1 });
      gameSession.executeAction(action);
      action = gloomchaser.actionAttack(board.getUnitAtPosition({ x: 5, y: 2 }));
      gameSession.executeAction(action);
      action = solus.actionMove({ x: 6, y: 2 });
      gameSession.executeAction(action);
      action = solus.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });

    it('expect gate 5: challenge 5 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerSonghaiChallenge1());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      const chakri = board.getUnitAtPosition({ x: 3, y: 1 });
      const fourWinds = board.getUnitAtPosition({ x: 3, y: 3 });

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(2, 3, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = myPlayer.actionPlayFollowup(followupCard, 7, 2);
      gameSession.executeAction(followupAction);

      let action = chakri.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      playCardFromHandAction = myPlayer.actionPlayCardFromHand(3, 7, 2);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 2, 3);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(4, 6, 2);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(playCardFromHandAction);

      action = chakri.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      action = gameSession.getGeneralForPlayer1().actionAttack(board.getUnitAtPosition({ x: 5, y: 3 }));
      gameSession.executeAction(action);

      action = fourWinds.actionMove({ x: 5, y: 3 });
      gameSession.executeAction(action);
      action = fourWinds.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
  });
});
