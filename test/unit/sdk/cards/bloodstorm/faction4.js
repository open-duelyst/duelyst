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

describe("bloodstorm", function() {
	describe("faction4", function(){
		beforeEach(function () {
			var player1Deck = [
				{id: SDK.Cards.Faction4.General},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction4.AltGeneral},
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect furosa to give friendly wraithlings +1/+1 whenever you use your BBS', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			// cycle turns until you can use bloodborn spell
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var wraithling = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Wraithling}, 6, 1, gameSession.getPlayer1Id());
			var furosa = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Furosa}, 4, 3, gameSession.getPlayer1Id());

			var action = player1.actionPlaySignatureCard(1, 1);
			gameSession.executeAction(action);

			var wraithlings = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction4.Wraithling);

			expect(wraithlings[0].getHP()).to.equal(2);
			expect(wraithlings[0].getATK()).to.equal(2);
			expect(wraithlings[1].getHP()).to.equal(2);
			expect(wraithlings[1].getATK()).to.equal(2);
			expect(wraithlings[2].getHP()).to.equal(2);
			expect(wraithlings[2].getATK()).to.equal(2);
		});
		it('expect aphotic drain to destroy a friendly minion and restore 5 health to your general', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			gameSession.getGeneralForPlayer1().setDamage(10);

			var wraithling = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Wraithling}, 6, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AphoticDrain}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 6, 1));

			expect(wraithling.getIsRemoved()).to.equal(true);
			expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(5);
		});
		it('expect horror burster to turn a random friendly minion into a 6/6 upon death', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var burster = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.HorrorBurster}, 6, 1, gameSession.getPlayer1Id());
			var wraithling = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Wraithling}, 5, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AphoticDrain}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 6, 1));

			var horror = board.getUnitAtPosition({x:5,y:1});

			expect(horror).to.exist;
			expect(horror.getBaseCardId()).to.equal(SDK.Cards.Faction4.Horror);
		});
		it('expect horror burster to not turn a random friendly minion into a horror if everything dies to tempest', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var burster = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.HorrorBurster}, 6, 1, gameSession.getPlayer1Id());
			var wraithling = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Wraithling}, 5, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Tempest}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 6, 1));

			var horror = board.getUnitAtPosition({x:5,y:1});

			expect(horror).to.not.exist;
		});
		it('expect horror burster to not turn a random friendly minion into a horror if everything dies to twin strike', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();

			var burster = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.HorrorBurster}, 6, 1, gameSession.getPlayer1Id());
			var wraithling = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Wraithling}, 5, 1, gameSession.getPlayer1Id());

			gameSession.executeAction(gameSession.actionEndTurn());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.TwinStrike}));
			UtilsSDK.executeActionWithoutValidation(player2.actionPlayCardFromHand(0, 6, 1));

			var horror = board.getUnitAtPosition({x:5,y:1});

			expect(horror).to.not.exist;
		});
		it('expect horror burster to create a horror out of a naga if the naga clears the board', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var burster = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.HorrorBurster}, 6, 1, gameSession.getPlayer1Id());
			var wraithling = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Wraithling}, 5, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.FrostboneNaga}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 5, 2));

			var horror = board.getUnitAtPosition({x:5,y:2});

			expect(horror).to.exist;
			expect(horror.getBaseCardId()).to.equal(SDK.Cards.Faction4.Horror);
		});
		it('expect horror burster to not turn a random friendly minion into a horror if everything dies to decimate', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var burster = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.HorrorBurster}, 6, 1, gameSession.getPlayer1Id());
			var wraithling = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Wraithling}, 5, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Decimate}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 6, 1));

			var horror = board.getUnitAtPosition({x:5,y:1});

			expect(horror).to.not.exist;
		});
		it('expect punish to destroy a damaged minion', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var juggernaut = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalJuggernaut}, 5, 1, gameSession.getPlayer2Id());

			juggernaut.setDamage(1);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Punish}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 5, 1));

			expect(juggernaut.getIsRemoved()).to.equal(true);
		});
		it('expect necrotic sphere to turn all friendly and enemy minions nearby general into wraithlings', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var juggernaut = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalJuggernaut}, 1, 1, gameSession.getPlayer2Id());
			var juggernaut2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalJuggernaut}, 1, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.NecroticSphere}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 5, 1));

			var wraithling1 = board.getUnitAtPosition({x:1,y:1});
			var wraithling2 = board.getUnitAtPosition({x:1,y:2});

			expect(wraithling1.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
			expect(wraithling2.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
		});
		it('expect grandmaster variax to give all lilithes wraithlings +4/+4 for every 3 mana BBS use', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			// cycle turns until you can use bloodborn spell
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			player1.remainingMana = 9;

			var wraithling = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Wraithling}, 6, 1, gameSession.getPlayer1Id());
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.GrandmasterVariax}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));
			//var variax = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.GrandmasterVariax}, 4, 3, gameSession.getPlayer1Id());

			//console.log(board.getUnitAtPosition({x:1,y:1}));

			player1.remainingMana = 9;

			var action = player1.actionPlaySignatureCard(1, 1);
			gameSession.executeAction(action);

			var wraithlings = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction4.Wraithling);

			expect(wraithlings[0].getHP()).to.equal(5);
			expect(wraithlings[0].getATK()).to.equal(5);
			expect(wraithlings[1].getHP()).to.equal(5);
			expect(wraithlings[1].getATK()).to.equal(5);
			expect(wraithlings[2].getHP()).to.equal(5);
			expect(wraithlings[2].getATK()).to.equal(5);

			expect(player1.remainingMana).to.equal(6);
		});
		it('expect grandmaster variax to make cassyvas shadow creep tiles spawn 4/4 minions for every 3 mana BBS use', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player2 = gameSession.getPlayer2();

			// cycle turns until you can use bloodborn spell
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			player2.remainingMana = 9;

			var wraithling = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Wraithling}, 6, 1, gameSession.getPlayer2Id());
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Faction4.GrandmasterVariax}));
			UtilsSDK.executeActionWithoutValidation(player2.actionPlayCardFromHand(0, 5, 1));

			player2.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.ShadowNova}));
			UtilsSDK.executeActionWithoutValidation(player2.actionPlayCardFromHand(0, 0, 0));

			player2.remainingMana = 9;

			var action = player2.actionPlaySignatureCard(1, 1);
			gameSession.executeAction(action);

			var fiends = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction4.Fiend);

			expect(fiends[0].getHP()).to.equal(4);
			expect(fiends[0].getATK()).to.equal(4);
			expect(fiends[1].getHP()).to.equal(4);
			expect(fiends[1].getATK()).to.equal(4);
			expect(fiends[2].getHP()).to.equal(4);
			expect(fiends[2].getATK()).to.equal(4);
			expect(fiends[3].getHP()).to.equal(4);
			expect(fiends[3].getATK()).to.equal(4);

			expect(player2.remainingMana).to.equal(6);
		});
		it('expect grandmaster variax and furosa to give all lilithes wraithlings +5/+5 for every 3 mana BBS use', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			// cycle turns until you can use bloodborn spell
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			player1.remainingMana = 9;

			var furosa = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Furosa}, 6, 2, gameSession.getPlayer1Id());
			var wraithling = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Wraithling}, 6, 1, gameSession.getPlayer1Id());
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.GrandmasterVariax}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));
			//var variax = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.GrandmasterVariax}, 4, 3, gameSession.getPlayer1Id());

			//console.log(board.getUnitAtPosition({x:1,y:1}));

			player1.remainingMana = 9;

			var action = player1.actionPlaySignatureCard(1, 1);
			gameSession.executeAction(action);

			var wraithlings = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction4.Wraithling);

			expect(wraithlings[0].getHP()).to.equal(6);
			expect(wraithlings[0].getATK()).to.equal(6);
			expect(wraithlings[1].getHP()).to.equal(6);
			expect(wraithlings[1].getATK()).to.equal(6);
			expect(wraithlings[2].getHP()).to.equal(6);
			expect(wraithlings[2].getATK()).to.equal(6);

			expect(player1.remainingMana).to.equal(6);
		});
		it('expect grandmaster variax to turn grandmaster zirs bbs into the upgraded one', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			// cycle turns until you can use bloodborn spell
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			player1.remainingMana = 9;

			var furosa = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Furosa}, 6, 2, gameSession.getPlayer1Id());
			var wraithling = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Wraithling}, 6, 1, gameSession.getPlayer1Id());
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.GrandmasterVariax}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));
			//var variax = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.GrandmasterVariax}, 4, 3, gameSession.getPlayer1Id());

			var grandmasterZir = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.GrandmasterZir}, 5, 1, gameSession.getPlayer1Id());

			var damageAction = new SDK.DamageAction(gameSession);
			damageAction.setTarget(gameSession.getGeneralForPlayer1());
			damageAction.setDamageAmount(gameSession.getGeneralForPlayer1().getHP());
			UtilsSDK.executeActionWithoutValidation(damageAction);

			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(12);
			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(5);

			//console.log(board.getUnitAtPosition({x:1,y:1}));

			player1.remainingMana = 9;

			var action = player1.actionPlaySignatureCard(1, 1);
			gameSession.executeAction(action);

			var wraithlings = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction4.Wraithling);

			expect(wraithlings[0].getHP()).to.equal(6);
			expect(wraithlings[0].getATK()).to.equal(6);
			expect(wraithlings[1].getHP()).to.equal(6);
			expect(wraithlings[1].getATK()).to.equal(6);
			expect(wraithlings[2].getHP()).to.equal(6);
			expect(wraithlings[2].getATK()).to.equal(6);

			expect(player1.remainingMana).to.equal(6);
		});
	});
});
