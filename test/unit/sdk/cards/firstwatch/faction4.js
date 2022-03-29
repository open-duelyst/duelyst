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

describe("first watch", function() {
	describe("faction4", function(){
		beforeEach(function () {
			var player1Deck = [
				{id: SDK.Cards.Faction4.AltGeneral},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction1.General},
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect phantasm to give a minion in your action bar +1 attack when your opponent summons a minion', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			var phantasm = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Phantasm}, 3, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.GloomChaser}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Faction4.GloomChaser}));

			gameSession.executeAction(gameSession.actionEndTurn());

			var playCardFromHandAction1 = player2.actionPlayCardFromHand(0, 8, 1);
			gameSession.executeAction(playCardFromHandAction1);

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0].getATK()).to.equal(4);
		});
		it('expect bound tormentor to create a copy of a minion the opponent played in your hand that costs 2 less', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.BoundTormentor}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Faction4.GloomChaser}));

			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction1);

			gameSession.executeAction(gameSession.actionEndTurn());

			var playCardFromHandAction1 = player2.actionPlayCardFromHand(0, 8, 1);
			gameSession.executeAction(playCardFromHandAction1);

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0].getId()).to.equal(SDK.Cards.Faction4.GloomChaser);
			expect(hand[0].getManaCost()).to.equal(0);
		});
		it('expect choking tendrils to kill an enemy minion on shadow creep', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ShadowNova}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 0);
			gameSession.executeAction(playCardFromHandAction);

			var phantasm = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Phantasm}, 0, 0, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChokingTendrils}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 0, 0);
			gameSession.executeAction(playCardFromHandAction1);

			expect(phantasm.getIsRemoved()).to.equal(true);
		});
		it('expect inkling surge to summon a wraithling', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.InklingSurge}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			var wraithling = board.getUnitAtPosition({x:1,y:1});
			expect(wraithling.getId()).to.equal(SDK.Cards.Faction4.Wraithling)
		});
		it('expect inkling surge to draw you a card if you have a wraithling on board', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			var wraithling = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Wraithling}, 0, 0, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.InklingSurge}));

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0]).to.not.exist;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.InklingSurge}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0].getId()).to.equal(SDK.Cards.Spell.InklingSurge);
		});
		it('expect skullprophet to reduce the enemy generals attack by one when they attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.SkullProphet}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction1);

			gameSession.executeAction(gameSession.actionEndTurn());
			var wraithling = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Wraithling}, 8, 1, gameSession.getPlayer1Id());

			var action = gameSession.getGeneralForPlayer2().actionAttack(wraithling);
			gameSession.executeAction(action);

			expect(gameSession.getGeneralForPlayer2().getATK()).to.equal(1);
		});
		it('expect xerroloth to put a 4/4 fiend in your action bar when your opponent casts a spell', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.Xerroloth}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.InklingSurge}));

			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction1);

			gameSession.executeAction(gameSession.actionEndTurn());

			var playCardFromHandAction1 = player2.actionPlayCardFromHand(0, 8, 1);
			gameSession.executeAction(playCardFromHandAction1);

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0].getId()).to.equal(SDK.Cards.Faction4.Fiend);
		});
		it('expect shadowstalk to summon a wraithling behind each enemy', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			gameSession.executeAction(gameSession.actionEndTurn());

			var action = gameSession.getGeneralForPlayer2().actionMove({ x: 6, y: 2 });
			gameSession.executeAction(action);

			gameSession.executeAction(gameSession.actionEndTurn());

			var enemy1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.GloomChaser}, 6, 3, gameSession.getPlayer2Id());
			var enemy2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.GloomChaser}, 6, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Shadowstalk}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			var wraithling1 = board.getUnitAtPosition({x:7,y:1});
			var wraithling2 = board.getUnitAtPosition({x:7,y:2});
			var wraithling3 = board.getUnitAtPosition({x:7,y:3});
			expect(wraithling1.getId()).to.equal(SDK.Cards.Faction4.Wraithling)
			expect(wraithling2.getId()).to.equal(SDK.Cards.Faction4.Wraithling)
			expect(wraithling3.getId()).to.equal(SDK.Cards.Faction4.Wraithling)
		});
		it('expect nethermeld to teleport an enemy to a friendly shadow creep', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ShadowNova}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 0);
			gameSession.executeAction(playCardFromHandAction);

			var phantasm = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Phantasm}, 8, 0, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Nethermeld}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 0);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 0, 0);
			gameSession.executeAction(followupAction);

			expect(board.getUnitAtPosition({x:0,y:0}).getId()).to.equal(SDK.Cards.Faction4.Phantasm);
		});
		it('expect nekomata to draw you two cards with dying wish when it dies', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			var nekomata = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Nekomata}, 0, 0, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.InklingSurge}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.Nekomata}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.InklingSurge}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.Nekomata}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.InklingSurge}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.InklingSurge}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.InklingSurge}));

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0]).to.not.exist;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 0);
			gameSession.executeAction(playCardFromHandAction);

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0].getId()).to.equal(SDK.Cards.Faction4.Nekomata);
			expect(hand[1].getId()).to.equal(SDK.Cards.Faction4.Nekomata);
			expect(hand[2]).to.not.exist;
		});
		it('expect corporeal cadence to kill a friendly minion and deal its attack to the enemy general', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			var rev = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.SpectralRevenant}, 6, 3, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.CorporealCadence}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 6, 3);
			gameSession.executeAction(playCardFromHandAction);

			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(6);
		});
		it('expect mindlathe to take control of an enemy minion until end of turn after its been attacked', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			var vorpal = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.VorpalReaver}, 1, 1, gameSession.getPlayer2Id());
			var pandora = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Pandora}, 2, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.Mindlathe}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 6, 3);
			gameSession.executeAction(playCardFromHandAction);

			var action = gameSession.getGeneralForPlayer1().actionAttack(vorpal);
			gameSession.executeAction(action);
			var action = vorpal.actionAttack(pandora);
			gameSession.executeAction(action);

			expect(pandora.getDamage()).to.equal(6);

			var action = vorpal.actionAttack(pandora);
			gameSession.executeAction(action);

			expect(pandora.getIsRemoved()).to.equal(true);
		});
		it('expect doom to kill the enemy general after 3 of their turns have passed', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Doom}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
			gameSession.executeAction(playCardFromHandAction);

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn()); //1
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn()); //2
			gameSession.executeAction(gameSession.actionEndTurn());
			expect(gameSession.getGeneralForPlayer2().getIsRemoved()).to.equal(false);
			gameSession.executeAction(gameSession.actionEndTurn()); //3
			expect(gameSession.getGeneralForPlayer2().getIsRemoved()).to.equal(true);
		});
		it('expect desolator to steal 2 health when entering play and to return to your hand when dying', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			gameSession.getGeneralForPlayer1().setDamage(5);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.Desolator}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(3);
			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(2);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0].getId()).to.equal(SDK.Cards.Faction4.Desolator);
			expect(hand[1]).to.not.exist;
		});
	});
});
