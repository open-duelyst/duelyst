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
var BeginnerAbyssianChallenge3 = require('app/sdk/challenges/abyssian/BeginnerAbyssianChallenge3');
var BeginnerSonghaiChallenge1 = require('app/sdk/challenges/songhai/BeginnerSonghaiChallenge1');
var BeginnerMagmarChallenge4 = require('app/sdk/challenges/magmar/BeginnerMagmarChallenge4');
var BeginnerVetruvianChallenge2 = require('app/sdk/challenges/vetruvian/BeginnerVetruvianChallenge2');
var BeginnerRangedChallenge1 = require('app/sdk/challenges/tutorial/BeginnerRangedChallenge1');
var BeginnerVanarChallenge2 = require('app/sdk/challenges/vanar/BeginnerVanarChallenge2');
var MediumVetruvianChallenge2 = require('app/sdk/challenges/vetruvian/MediumVetruvianChallenge2');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("challenges", function() {
  describe("gate 5", function() {
    afterEach(function () {
      SDK.GameSession.reset();
    });

    it('expect gate 5: challenge 1 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new BeginnerVanarChallenge2());

      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var myPlayer = gameSession.getMyPlayer();

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(2, 4, 2);
			gameSession.executeAction(playCardFromHandAction);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = myPlayer.actionPlayFollowup(followupCard, 1, 2);
      gameSession.executeAction(followupAction);
      var followupCard2 = followupAction.getCard().getCurrentFollowupCard();
      var followupAction2 = myPlayer.actionPlayFollowup(followupCard2, 1, 3);
      gameSession.executeAction(followupAction2);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(3, 3, 1);
			gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 3, 1);
			gameSession.executeAction(playCardFromHandAction);

      var bear = board.getUnitAtPosition({x:3,y:3});
      var cloaker = board.getUnitAtPosition({x:3,y:1});

      var action = bear.actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      var action = bear.actionAttack(board.getUnitAtPosition({x:5,y:1}));
      gameSession.executeAction(action);

      var action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      var action = gameSession.getGeneralForPlayer1().actionAttack(board.getUnitAtPosition({x:5,y:1}));
      gameSession.executeAction(action);

      var action = cloaker.actionMove({ x: 5, y: 1 });
      gameSession.executeAction(action);
      var action = cloaker.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
    it('expect gate 5: challenge 2 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new MediumVetruvianChallenge2());

      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var myPlayer = gameSession.getMyPlayer();

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(2, 0, 2);
      gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(3, 0, 2);
      gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = myPlayer.actionPlayFollowup(followupCard, 4, 2);
      gameSession.executeAction(followupAction);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 3, 0);
      gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = myPlayer.actionPlayFollowup(followupCard, 3, 1);
      gameSession.executeAction(followupAction);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 2, 0);
      gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = myPlayer.actionPlayFollowup(followupCard, 2, 2);
      gameSession.executeAction(followupAction);

      var dervish = board.getUnitAtPosition({x:4, y:2});
      var action = dervish.actionAttack(board.getUnitAtPosition({x:3,y:2}));
      gameSession.executeAction(action);

      var action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 1});
      gameSession.executeAction(action);
      var action = gameSession.getGeneralForPlayer1().actionAttack(board.getUnitAtPosition({x:3,y:2}));
      gameSession.executeAction(action);

      var orb1 = board.getUnitAtPosition({x:3, y:1});
      var orb2 = board.getUnitAtPosition({x:3, y:3});
      var sandHowler = board.getUnitAtPosition({x:2, y:2});

      var action = orb1.actionMove({ x: 4, y: 2});
      gameSession.executeAction(action);
      var action = orb1.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      var action = orb2.actionMove({ x: 4, y: 2});
      gameSession.executeAction(action);
      var action = orb2.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      var action = sandHowler.actionMove({ x: 4, y: 2});
      gameSession.executeAction(action);
      var action = sandHowler.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
    it('expect gate 5: challenge 3 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new BeginnerRangedChallenge1());

      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var myPlayer = gameSession.getMyPlayer();

      var archer = board.getUnitAtPosition({x:0, y:2});
      var templar = board.getUnitAtPosition({x:2, y:2});

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 3, 2);
      gameSession.executeAction(playCardFromHandAction);

      var action = gameSession.getGeneralForPlayer1().actionMove({ x: 3, y: 2 });
      gameSession.executeAction(action);
      var action = gameSession.getGeneralForPlayer1().actionAttack(board.getUnitAtPosition({x:4,y:2}));
      gameSession.executeAction(action);

      var action = templar.actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      var action = templar.actionAttack(board.getUnitAtPosition({x:5,y:2}));
      gameSession.executeAction(action);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = myPlayer.actionPlayFollowup(followupCard, 0, 2);
      gameSession.executeAction(followupAction);

      var action = archer.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
    it('expect gate 5: challenge 4 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new BeginnerAbyssianChallenge3());

      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var myPlayer = gameSession.getMyPlayer();

      var wraithling = board.getUnitAtPosition({x:2, y:3});
      var gloomchaser = board.getUnitAtPosition({x:2, y:1});
      var solus = board.getUnitAtPosition({x:4, y:2});

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 3, 2);
      gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(2, 6, 2);
      gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = myPlayer.actionPlayFollowup(followupCard, 1, 1);
      gameSession.executeAction(followupAction);
      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 2, 3);
      gameSession.executeAction(playCardFromHandAction);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(3, 0, 1);
      gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = myPlayer.actionPlayFollowup(followupCard, 0, 2);
      gameSession.executeAction(followupAction);
      var followupCard2 = followupAction.getCard().getCurrentFollowupCard();
      var followupAction2 = myPlayer.actionPlayFollowup(followupCard2, 0, 3);
      gameSession.executeAction(followupAction2);

      var action = gameSession.getGeneralForPlayer1().actionAttack(board.getUnitAtPosition({x:1,y:1}));
      gameSession.executeAction(action);

      var action = wraithling.actionMove({ x: 4, y: 3 });
      gameSession.executeAction(action);
      var action = wraithling.actionAttack(board.getUnitAtPosition({x:5,y:2}));
      gameSession.executeAction(action);
      var action = gloomchaser.actionMove({ x: 4, y: 1 });
      gameSession.executeAction(action);
      var action = gloomchaser.actionAttack(board.getUnitAtPosition({x:5,y:2}));
      gameSession.executeAction(action);
      var action = solus.actionMove({ x: 6, y: 2 });
      gameSession.executeAction(action);
      var action = solus.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
    it('expect gate 5: challenge 5 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new BeginnerSonghaiChallenge1());

      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var myPlayer = gameSession.getMyPlayer();

      var chakri = board.getUnitAtPosition({x:3, y:1});
      var fourWinds = board.getUnitAtPosition({x:3, y:3});

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(2, 3, 1);
      gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = myPlayer.actionPlayFollowup(followupCard, 7, 2);
      gameSession.executeAction(followupAction);

      var action = chakri.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(3, 7, 2);
      gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 2, 3);
      gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(4, 6, 2);
      gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(playCardFromHandAction);

      var action = chakri.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      var action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      var action = gameSession.getGeneralForPlayer1().actionAttack(board.getUnitAtPosition({x:5,y:3}));
      gameSession.executeAction(action);


      var action = fourWinds.actionMove({ x: 5, y: 3 });
      gameSession.executeAction(action);
      var action = fourWinds.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
  });
});
