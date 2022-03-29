var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var UtilsSDK = require('test/utils/utils_sdk');
var _ = require('underscore');
var StarterAI = require('server/ai/starter_ai');
const ScoreForUnit = require('server/ai/scoring/base/unit');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("starter ai scoring", function() {
	describe("unit score tests", function(){
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

		it('Unit Scores', function() {
      var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
      var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
      var useThreshold = 0.0;
      player1.remainingMana = 9;

      var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 0, 0, gameSession.getPlayer2Id());
      var grow2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.EarthWalker}, 1, 0, gameSession.getPlayer2Id());
      var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 2, 0, gameSession.getPlayer2Id());
      var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 3, 0, gameSession.getPlayer2Id());
      var blast2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 4, 0, gameSession.getPlayer2Id());
      var spellwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.ChakriAvatar}, 5, 0, gameSession.getPlayer2Id());
      var provoke2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.PrimusShieldmaster}, 6, 0, gameSession.getPlayer2Id());
      var frenzy2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.PiercingMantis}, 7, 0, gameSession.getPlayer2Id());
      var flying2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FlameWing}, 8, 0, gameSession.getPlayer2Id());

      UtilsSDK.modifyUnitStats(golem1.getPosition(), 2, 2);
      console.log("Unit score for vanilla 2/2 = ", ScoreForUnit(golem1));
      UtilsSDK.modifyUnitStats(golem1.getPosition(), 4, 4);
      console.log("Unit score for vanilla 4/4 = ", ScoreForUnit(golem1));
      UtilsSDK.modifyUnitStats(golem1.getPosition(), 6, 6);
      console.log("Unit score for vanilla 6/6 = ", ScoreForUnit(golem1));
      UtilsSDK.modifyUnitStats(golem1.getPosition(), 8, 8);
      console.log("Unit score for vanilla 8/8 = ", ScoreForUnit(golem1));
      UtilsSDK.modifyUnitStats(golem1.getPosition(), 1, 5);
      console.log("Unit score for vanilla 1/5 = ", ScoreForUnit(golem1));
      UtilsSDK.modifyUnitStats(grow2.getPosition(), 3, 3);
      console.log("Unit score for grow 3/3 = ", ScoreForUnit(grow2));
      UtilsSDK.modifyUnitStats(grow2.getPosition(), 5, 9);
      console.log("Unit score for grow 5/9 = ", ScoreForUnit(grow2));
      UtilsSDK.modifyUnitStats(grow2.getPosition(), 8, 8);
      console.log("Unit score for grow 8/8 = ", ScoreForUnit(grow2));
      UtilsSDK.modifyUnitStats(ranged2.getPosition(), 1, 1);
      console.log("Unit score for ranged 1/1 = ", ScoreForUnit(ranged2));
      UtilsSDK.modifyUnitStats(ranged2.getPosition(), 3, 2);
      console.log("Unit score for ranged 3/2 = ", ScoreForUnit(ranged2));
      UtilsSDK.modifyUnitStats(ranged2.getPosition(), 4, 3);
      console.log("Unit score for ranged 4/3 = ", ScoreForUnit(ranged2));
      UtilsSDK.modifyUnitStats(ranged2.getPosition(), 8, 8);
      console.log("Unit score for ranged 8/8 = ", ScoreForUnit(ranged2));
      UtilsSDK.modifyUnitStats(deathwatch2.getPosition(), 2, 2);
      console.log("Unit score for deathwatch 2/2 = ", ScoreForUnit(deathwatch2));
      UtilsSDK.modifyUnitStats(deathwatch2.getPosition(), 4, 4);
      console.log("Unit score for deathwatch 4/4 = ", ScoreForUnit(deathwatch2));
      UtilsSDK.modifyUnitStats(deathwatch2.getPosition(), 5, 9);
      console.log("Unit score for deathwatch 5/9 = ", ScoreForUnit(deathwatch2));
      UtilsSDK.modifyUnitStats(deathwatch2.getPosition(), 8, 8);
      console.log("Unit score for deathwatch 8/8 = ", ScoreForUnit(deathwatch2));
      UtilsSDK.modifyUnitStats(blast2.getPosition(), 2, 1);
      console.log("Unit score for blast 2/1 = ", ScoreForUnit(blast2));
      UtilsSDK.modifyUnitStats(blast2.getPosition(), 4, 6);
      console.log("Unit score for blast 4/6 = ", ScoreForUnit(blast2));
      UtilsSDK.modifyUnitStats(blast2.getPosition(), 3, 3);
      console.log("Unit score for blast 3/3 = ", ScoreForUnit(blast2));
      UtilsSDK.modifyUnitStats(blast2.getPosition(), 8, 8);
      console.log("Unit score for blast 8/8 = ", ScoreForUnit(blast2));
      UtilsSDK.modifyUnitStats(spellwatch2.getPosition(), 1, 2);
      console.log("Unit score for spellwatch 1/2 = ", ScoreForUnit(spellwatch2));
      UtilsSDK.modifyUnitStats(spellwatch2.getPosition(), 3, 4);
      console.log("Unit score for spellwatch 3/4 = ", ScoreForUnit(spellwatch2));
      UtilsSDK.modifyUnitStats(spellwatch2.getPosition(), 6, 6);
      console.log("Unit score for spellwatch 6/6 = ", ScoreForUnit(spellwatch2));
      UtilsSDK.modifyUnitStats(spellwatch2.getPosition(), 8, 8);
      console.log("Unit score for spellwatch 8/8 = ", ScoreForUnit(spellwatch2));
      UtilsSDK.modifyUnitStats(provoke2.getPosition(), 1, 2);
      console.log("Unit score for provoke 1/2 = ", ScoreForUnit(provoke2));
      UtilsSDK.modifyUnitStats(provoke2.getPosition(), 5, 5);
      console.log("Unit score for provoke 5/5 = ", ScoreForUnit(provoke2));
      UtilsSDK.modifyUnitStats(provoke2.getPosition(), 3, 6);
      console.log("Unit score for provoke 3/6 = ", ScoreForUnit(provoke2));
      UtilsSDK.modifyUnitStats(provoke2.getPosition(), 7, 7);
      console.log("Unit score for provoke 7/7 = ", ScoreForUnit(provoke2));
      UtilsSDK.modifyUnitStats(frenzy2.getPosition(), 2, 2);
      console.log("Unit score for frenzy 2/2 = ", ScoreForUnit(frenzy2));
      UtilsSDK.modifyUnitStats(frenzy2.getPosition(), 4, 4);
      console.log("Unit score for frenzy 4/4 = ", ScoreForUnit(frenzy2));
      UtilsSDK.modifyUnitStats(frenzy2.getPosition(), 4, 9);
      console.log("Unit score for frenzy 4/9 = ", ScoreForUnit(frenzy2));
      UtilsSDK.modifyUnitStats(frenzy2.getPosition(), 7, 7);
      console.log("Unit score for frenzy 7/7 = ", ScoreForUnit(frenzy2));
      UtilsSDK.modifyUnitStats(flying2.getPosition(), 2, 2);
      console.log("Unit score for flying 2/2 = ", ScoreForUnit(flying2));
      UtilsSDK.modifyUnitStats(flying2.getPosition(), 5, 4);
      console.log("Unit score for flying 5/4 = ", ScoreForUnit(flying2));
      UtilsSDK.modifyUnitStats(flying2.getPosition(), 4, 9);
      console.log("Unit score for flying 4/9 = ", ScoreForUnit(flying2));
      UtilsSDK.modifyUnitStats(flying2.getPosition(), 7, 7);
      console.log("Unit score for flying 7/7 = ", ScoreForUnit(flying2));
      console.log("Unit score for general at 25 HP = ", ScoreForUnit(gameSession.getGeneralForPlayer1()));
      gameSession.getGeneralForPlayer1().setDamage(5);
      console.log("Unit score for general at 20 HP = ", ScoreForUnit(gameSession.getGeneralForPlayer1()));
      gameSession.getGeneralForPlayer1().setDamage(10);
      console.log("Unit score for general at 15 HP = ", ScoreForUnit(gameSession.getGeneralForPlayer1()));
      gameSession.getGeneralForPlayer1().setDamage(15);
      console.log("Unit score for general at 10 HP = ", ScoreForUnit(gameSession.getGeneralForPlayer1()));
      gameSession.getGeneralForPlayer1().setDamage(20);
      console.log("Unit score for general at 5 HP = ", ScoreForUnit(gameSession.getGeneralForPlayer1()));
      gameSession.getGeneralForPlayer1().setDamage(22);
      console.log("Unit score for general at 3 HP = ", ScoreForUnit(gameSession.getGeneralForPlayer1()));
      gameSession.getGeneralForPlayer1().setDamage(24);
      console.log("Unit score for general at 1 HP = ", ScoreForUnit(gameSession.getGeneralForPlayer1()));
    });
  });
});
