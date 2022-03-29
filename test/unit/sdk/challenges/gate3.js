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
var BeginnerAbyssianChallenge6 = require('app/sdk/challenges/abyssian/BeginnerAbyssianChallenge6');
var BeginnerSonghaiChallenge2 = require('app/sdk/challenges/songhai/BeginnerSonghaiChallenge2');
var BeginnerMagmarChallenge1 = require('app/sdk/challenges/magmar/BeginnerMagmarChallenge1');
var BeginnerVetruvianChallenge5 = require('app/sdk/challenges/vetruvian/BeginnerVetruvianChallenge5');
var BeginnerLyonarChallenge4 = require('app/sdk/challenges/lyonar/BeginnerLyonarChallenge4');
var BeginnerVanarChallenge5 = require('app/sdk/challenges/vanar/BeginnerVanarChallenge5');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("challenges", function() {
	describe("gate 3", function() {
		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect gate 3: challenge 1 to be completable', function() {
			UtilsSDK.setupSessionForChallenge(new BeginnerVetruvianChallenge5());

			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var myPlayer = gameSession.getMyPlayer();

			var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 3, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = myPlayer.actionPlayFollowup(followupCard, 4, 2);
			gameSession.executeAction(followupAction);
			var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 3, 2);
			gameSession.executeAction(playCardFromHandAction);

			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
			gameSession.executeAction(action);
			var action = gameSession.getGeneralForPlayer1().actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);

			expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
		});
		it('expect gate 3: challenge 2 to be completable', function() {
			UtilsSDK.setupSessionForChallenge(new BeginnerAbyssianChallenge6());

			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var myPlayer = gameSession.getMyPlayer();

			var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 7, 3);
			gameSession.executeAction(playCardFromHandAction);
			var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 7, 3);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = myPlayer.actionPlayFollowup(followupCard, 4, 2);
			gameSession.executeAction(followupAction);

			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 3, y: 1});
			gameSession.executeAction(action);
			var action = gameSession.getGeneralForPlayer1().actionAttack(board.getUnitAtPosition({x:4,y:2}));
			gameSession.executeAction(action);

			expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
		});
		it('expect gate 3: challenge 3 to be completable', function() {
			UtilsSDK.setupSessionForChallenge(new BeginnerVanarChallenge5());

			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var myPlayer = gameSession.getMyPlayer();

			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2});
			gameSession.executeAction(action);

			var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 3, 1);
			gameSession.executeAction(playCardFromHandAction);
			var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 4, 0);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = myPlayer.actionPlayFollowup(followupCard, 1, 2);
			gameSession.executeAction(followupAction);

			var rhyno = board.getUnitAtPosition({x:4,y:0});

			var action = rhyno.actionMove({ x: 5, y: 1});
			gameSession.executeAction(action);
			var action = rhyno.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);
			var action = rhyno.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);

			expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
		});
		it('expect gate 3: challenge 4 to be completable', function() {
			UtilsSDK.setupSessionForChallenge(new BeginnerLyonarChallenge4());

			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var myPlayer = gameSession.getMyPlayer();

			var silverguardKnight = board.getUnitAtPosition({x:2,y:2});
			var action = silverguardKnight.actionMove({ x: 4, y: 2});
			gameSession.executeAction(action);
			var action = silverguardKnight.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);

			var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 4, 2);
			gameSession.executeAction(playCardFromHandAction);
			var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 4, 0);
			gameSession.executeAction(playCardFromHandAction);

			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2});
			gameSession.executeAction(action);
			var action = gameSession.getGeneralForPlayer1().actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);

			expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
		});
		it('expect gate 3: challenge 5 to be completable', function() {
			UtilsSDK.setupSessionForChallenge(new BeginnerSonghaiChallenge2());

			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var myPlayer = gameSession.getMyPlayer();

			var playCardFromHandAction = myPlayer.actionPlayCardFromHand(3, 1, 2);
			gameSession.executeAction(playCardFromHandAction);
			var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);
			var playCardFromHandAction = myPlayer.actionPlayCardFromHand(2, 1, 2);
			gameSession.executeAction(playCardFromHandAction);
			var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 1, 2);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = myPlayer.actionPlayFollowup(followupCard, 7, 2);
			gameSession.executeAction(followupAction);

			var gorehorn = board.getUnitAtPosition({x:7,y:2});

			var action = gorehorn.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);

			expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
		});
	});
});
