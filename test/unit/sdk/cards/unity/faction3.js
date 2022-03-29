var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var UtilsSDK = require('test/utils/utils_sdk');
var _ = require('underscore');
var ModifierForcefield = require('app/sdk/modifiers/modifierForcefield');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("unity", function() {
	describe("faction3", function(){
		beforeEach(function () {
			var player1Deck = [
				{id: SDK.Cards.Faction3.AltGeneral},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction1.General},
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect dreamshaper to draw 2 cards only if you have another golem', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.InnerFocus}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.InnerFocus}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction3.Dreamcarver}));

			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction1);
			var hand1 = player1.getDeck().getCardsInHand();
			expect(hand1[0]).to.not.exist;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction3.Dreamcarver}));
			var playCardFromHandAction2 = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction2);
			var hand1 = player1.getDeck().getCardsInHand();
			expect(hand1[0]).to.exist;
			expect(hand1[1]).to.exist;
		});

		it('expect blood of air to transform an enemy into a friendly 2/2 wind dervish', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var kaidoAssassin = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KaidoAssassin}, 5, 1, gameSession.getPlayer2Id());
			kaidoAssassin.setDamage(2);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.BloodOfAir}));
			var action = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(action);

			var dervish = board.getUnitAtPosition({x:5, y:1});
			expect(dervish.getHP()).to.equal(2);
			expect(dervish.getATK()).to.equal(2);
			expect(dervish.getIsExhausted()).to.equal(false);
			expect(dervish.ownerId).to.equal('player1_id');
		});

		it('expect thunderclap to summon minions destroyed with it', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.Thunderclap}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			var valeHunter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ValeHunter}, 1, 2, gameSession.getPlayer2Id());

			var action = gameSession.getGeneralForPlayer1().actionAttack(valeHunter);
			gameSession.executeAction(action);

			var stolenHunter = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Neutral.ValeHunter);
			expect(stolenHunter[0].getId()).to.equal(SDK.Cards.Neutral.ValeHunter);
			expect(stolenHunter[0].ownerId).to.equal('player1_id');
		});

		it('expect wind striker to equip a Staff of Ykir when played from hand', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction3.Windlark}));
      		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			var artifact = gameSession.getGeneralForPlayer1().getArtifactModifiers();
			expect(artifact[0].getSourceCard().getId()).to.equal(SDK.Cards.Artifact.StaffOfYKir);
		});

		it('expect sirocco to summon a skyrock golem for each other golem summoned from the action bar ONLY', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.HailstoneGolem}));
      		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.HailstoneGolem}));
      		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			player1.remainingMana = 9;
		    UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction3.Sirocco}));
		    var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 1);
			gameSession.executeAction(playCardFromHandAction);

      		var skyrock = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Neutral.SkyrockGolem);

      		expect(skyrock[0].getId()).to.equal(SDK.Cards.Neutral.SkyrockGolem);
      		expect(skyrock[1].getId()).to.equal(SDK.Cards.Neutral.SkyrockGolem);
			expect(skyrock[2]).to.not.exist;

			//now check if it ONLY works from action bar
			player1.remainingMana = 9;
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.CircleOfDesiccation}));
      		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			player1.remainingMana = 9;
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction3.Sirocco}));
      		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			
      		var skyrock = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Neutral.SkyrockGolem);

      		expect(skyrock[0].getId()).to.equal(SDK.Cards.Neutral.SkyrockGolem);
      		expect(skyrock[1].getId()).to.equal(SDK.Cards.Neutral.SkyrockGolem);
			expect(skyrock[2].getId()).to.equal(SDK.Cards.Neutral.SkyrockGolem);
			expect(skyrock[3]).to.not.exist;
		});
	});
});
