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
var BeginnerSonghaiChallenge4 = require('app/sdk/challenges/songhai/BeginnerSonghaiChallenge4');
var BeginnerVetruvianChallenge3 = require('app/sdk/challenges/vetruvian/BeginnerVetruvianChallenge3');
var BeginnerAbyssianChallenge4 = require('app/sdk/challenges/abyssian/BeginnerAbyssianChallenge4');
var BeginnerMagmarChallenge3 = require('app/sdk/challenges/magmar/BeginnerMagmarChallenge3');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("challenges", function() {
  describe("gate 1", function() {

    afterEach(function () {
      SDK.GameSession.reset();
    });

    it('expect gate 1: challenge 1 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new BeginnerFlyingChallenge1());

      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var myPlayer = gameSession.getMyPlayer();

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 0, 2);
			gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 2, 2);
			gameSession.executeAction(playCardFromHandAction);

      var lark = board.getUnitAtPosition({x:0, y:2});


      var action = lark.actionMove({ x: 7, y: 2 });
      gameSession.executeAction(action);
      var action = lark.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
    it('expect gate 1: challenge 2 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new BeginnerSonghaiChallenge4());

      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var myPlayer = gameSession.getMyPlayer();

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 7, 2);
			gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(playCardFromHandAction);

      var scout = board.getUnitAtPosition({x:7, y:2});

      var action = scout.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
    /*it('expect gate 1: challenge 3 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new BeginnerVetruvianChallenge3());

      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var myPlayer = gameSession.getMyPlayer();

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 4, 2);
			gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = myPlayer.actionPlayFollowup(followupCard, 5, 2);
			gameSession.executeAction(followupAction);
      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 2, 2);
			gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = myPlayer.actionPlayFollowup(followupCard, 5, 2);
			gameSession.executeAction(followupAction);

      var action = gameSession.getGeneralForPlayer1().actionMove({ x: 5, y: 2 });
      gameSession.executeAction(action);
      var action = gameSession.getGeneralForPlayer1().actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
  });*/
    it('expect gate 1: challenge 4 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new BeginnerAbyssianChallenge4());

      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var myPlayer = gameSession.getMyPlayer();

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 4, 2);
      gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(playCardFromHandAction);

      var wraithling1 = board.getUnitAtPosition({x:3, y:1});
      var wraithling2 = board.getUnitAtPosition({x:3, y:2});
      var wraithling3 = board.getUnitAtPosition({x:3, y:3});
      var mantis = board.getUnitAtPosition({x:2, y:2});

      var action = mantis.actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      var action = mantis.actionAttack(board.getUnitAtPosition({x:5,y:2}));
      gameSession.executeAction(action);
      var action = wraithling1.actionMove({ x: 5, y: 1 });
      gameSession.executeAction(action);
      var action = wraithling1.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      var action = wraithling2.actionMove({ x: 5, y: 2 });
      gameSession.executeAction(action);
      var action = wraithling2.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      var action = wraithling3.actionMove({ x: 5, y: 3 });
      gameSession.executeAction(action);
      var action = wraithling3.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
    it('expect gate 1: challenge 5 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new BeginnerMagmarChallenge3());

      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var myPlayer = gameSession.getMyPlayer();

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 4, 2);
      gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 0, 0);
      gameSession.executeAction(playCardFromHandAction);

      var ranged1 = board.getUnitAtPosition({x:0, y:0});
      var ranged2 = board.getUnitAtPosition({x:0, y:4});


      var action = ranged1.actionAttack(board.getUnitAtPosition({x:3,y:2}));
      gameSession.executeAction(action);
      var action = ranged2.actionAttack(board.getUnitAtPosition({x:4,y:2}));
      gameSession.executeAction(action);

      var action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      var action = gameSession.getGeneralForPlayer1().actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
  });
});
