var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var ModifierTranscendance = require('app/sdk/modifiers/modifierTranscendance');
var UtilsSDK = require('test/utils/utils_sdk');
var _ = require('underscore');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("shimzar", function() {
	describe("neutral", function(){
		beforeEach(function () {
			var player1Deck = [
				{id: SDK.Cards.Faction6.General},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction1.General},
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect golden mantella to draw a random neutral token battlepet', function() {
			for(var i = 0; i < 50; i++){
				var player1Deck = [
					{id: SDK.Cards.Faction1.General}
				];

				var player2Deck = [
					{id: SDK.Cards.Faction3.General}
				];

				// setup test session
				UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

				var gameSession = SDK.GameSession.getInstance();
				var board = gameSession.getBoard();
				var player1 = gameSession.getPlayer1();
				player1.remainingMana = 9;

				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.GoldenMantella}));
				var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
				gameSession.executeAction(playCardFromHandAction);

				var hand = player1.getDeck().getCardsInHand();
				expect(hand[0]).to.exist;
				expect(hand[0].getRaceId()).to.equal(SDK.Races.BattlePet);
				expect(hand[0].getFactionId()).to.equal(SDK.Factions.Neutral);
				expect(hand[0].getRarityId()).to.equal(SDK.Rarity.TokenUnit);

				expect(hand[0].getBaseCardId()).to.not.equal(SDK.Cards.Faction5.Kin);

				SDK.GameSession.reset();
			}
		});
		it('expect koi to take no damage from enemy generals', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var koi = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Koi}, 1, 1, gameSession.getPlayer2Id());

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(koi.getDamage()).to.equal(0);
			expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(3);
		});
		it('expect gnasher to deal 3 damage to enemies upon death', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var gnasher = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Gnasher}, 7, 1, gameSession.getPlayer1Id());
			var golem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 6, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 1);
			gameSession.executeAction(playCardFromHandAction);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(gnasher.getIsRemoved()).to.equal(true);
			expect(golem.getDamage()).to.equal(3);
			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(3);
		});
		it('expect ion to deal double damage to generals', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var ion = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Ion}, 5, 1, gameSession.getPlayer2Id());

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(4);
		});
		it('expect sol to activate a friendly battle pet', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var ion = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Ion}, 2, 2, gameSession.getPlayer1Id());
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Sol}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 2, 2);
			gameSession.executeAction(followupAction);

			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(4);
		});
		it('expect soboro to kill any neutral unit it deals damage to', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var soboro = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Soboro}, 1, 1, gameSession.getPlayer1Id());
			var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 0, 1, gameSession.getPlayer2Id());

			soboro.refreshExhaustion();
			var action = soboro.actionAttack(brightmossGolem);
			gameSession.executeAction(action);

			expect(brightmossGolem.getIsRemoved()).to.equal(true);
		});
		it('expect z0r to put a mech in your hand when it dies', function() {
			for(var i = 0; i < 50; i++){
				var player1Deck = [
					{id: SDK.Cards.Faction1.General}
				];

				var player2Deck = [
					{id: SDK.Cards.Faction3.General}
				];

				// setup test session
				UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

				var gameSession = SDK.GameSession.getInstance();
				var board = gameSession.getBoard();
				var player1 = gameSession.getPlayer1();
				player1.remainingMana = 9;

				var z0r = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Z0r}, 1, 1, gameSession.getPlayer1Id());

				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
				var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
				gameSession.executeAction(playCardFromHandAction);

				var hand = player1.getDeck().getCardsInHand();
				expect(hand[0]).to.exist;
				expect(hand[0].getRaceId()).to.equal(SDK.Races.Mech);

				SDK.GameSession.reset();
			}
		});
		it('expect calculator to gain stats equal to the combined health and attack of battlepets in your action bar', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Calculator}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Yun})); //+5/4
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Koi})); //+3/1
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			var calculator = board.getUnitAtPosition({x:1,y:1});

			expect(calculator.getATK()).to.equal(9);
			expect(calculator.getHP()).to.equal(6);
		});
		it('expect zukong to allow you to control your battlepets', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var z0r = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Z0r}, 1, 1, gameSession.getPlayer1Id());
			var zukong = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Zukong}, 2, 1, gameSession.getPlayer1Id());

			z0r.refreshExhaustion();

			var action = z0r.actionMove({ x: 3, y: 1 });
			gameSession.executeAction(action);

			expect(board.getUnitAtPosition({x:3,y:1}).getId()).to.equal(SDK.Cards.Neutral.Z0r)
		});
		it('expect hydrax to draw you a card whenever a battlepet dies', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var hydrax = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Hydrax}, 2, 1, gameSession.getPlayer1Id());
			var koi = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Koi}, 2, 2, gameSession.getPlayer1Id());
			var amu = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Amu}, 2, 3, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
			gameSession.executeAction(playCardFromHandAction);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 3);
			gameSession.executeAction(playCardFromHandAction);

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0]).to.exist;
			expect(hand[0].getId()).to.equal(SDK.Cards.Spell.PhoenixFire);
			expect(hand[1]).to.exist;
			expect(hand[1].getId()).to.equal(SDK.Cards.Spell.PhoenixFire);
		});
		it('expect rawr to summon a random neutral token battlepet nearby whenever it is damaged', function() {
			for(var i = 0; i < 50; i++){
				var player1Deck = [
					{id: SDK.Cards.Faction1.General}
				];

				var player2Deck = [
					{id: SDK.Cards.Faction3.General}
				];

				// setup test session
				UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

				var gameSession = SDK.GameSession.getInstance();
				var board = gameSession.getBoard();
				var player1 = gameSession.getPlayer1();
				player1.remainingMana = 9;

				var rawr = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Rawr}, 7, 2, gameSession.getPlayer1Id());

				gameSession.executeAction(gameSession.actionEndTurn());
				gameSession.executeAction(gameSession.actionEndTurn());

				var battlepet = board.getFriendlyEntitiesAroundEntity(rawr);

				expect(battlepet[0].getRaceId()).to.equal(SDK.Races.BattlePet);
				expect(battlepet[0].getFactionId()).to.equal(SDK.Factions.Neutral);
				expect(battlepet[0].getRarityId()).to.equal(SDK.Rarity.TokenUnit);

				expect(battlepet[0].getBaseCardId()).to.not.equal(SDK.Cards.Faction5.Kin);

				SDK.GameSession.reset();
			}
		});
		it('expect inquisitor kron to summon a random 2/2 prisoner when replacing', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var kron = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.InquisitorKron}, 6, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrueStrike}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));

			var action = player1.actionReplaceCardFromHand(0);
			gameSession.executeAction(action);

			var prisoner = board.getFriendlyEntitiesAroundEntity(kron);

			expect(prisoner[0].getATK()).to.equal(2);
			expect(prisoner[0].getHP()).to.equal(2);
		});
		it('expect fog to put a random battlepet in your hand when it dies', function() {
			for(var i = 0; i < 50; i++){
				var player1Deck = [
					{id: SDK.Cards.Faction1.General}
				];

				var player2Deck = [
					{id: SDK.Cards.Faction3.General}
				];

				// setup test session
				UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

				var gameSession = SDK.GameSession.getInstance();
				var board = gameSession.getBoard();
				var player1 = gameSession.getPlayer1();
				player1.remainingMana = 9;

				var kron = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Fog}, 6, 2, gameSession.getPlayer1Id());

				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
				var playCardFromHandAction = player1.actionPlayCardFromHand(0, 6, 2);
				gameSession.executeAction(playCardFromHandAction);

				var hand = player1.getDeck().getCardsInHand();
				expect(hand[0]).to.exist;
				expect(hand[0].getRaceId()).to.equal(SDK.Races.BattlePet);
				expect(hand[0].getBaseCardId()).to.not.equal(SDK.Cards.Faction5.Kin);

				SDK.GameSession.reset();
			}
		});
	});
});
