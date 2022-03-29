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

		it('expect nightshroud to steal 1 Health per other Arcanyst only if you have an Arcanyst', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			gameSession.getGeneralForPlayer1().setDamage(5);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.Nightshroud}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.Nightshroud}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.Nightshroud}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction1);
			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(20);
			expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(25);

			player1.remainingMana = 9;
			var playCardFromHandAction2 = player1.actionPlayCardFromHand(1, 1, 2);
			gameSession.executeAction(playCardFromHandAction2);
			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(21);
			expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(24);

			player1.remainingMana = 9;
			var playCardFromHandAction3 = player1.actionPlayCardFromHand(2, 2, 1);
			gameSession.executeAction(playCardFromHandAction3);
			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(23);
			expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(22);
		});

		it('expect blood echoes to destroy minions, then resummon them end of turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var bloodtearAlchemist = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BloodtearAlchemist}, 2, 1, gameSession.getPlayer1Id());
			var nocturne = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Nocturne}, 3, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.DeathIncoming}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			expect(bloodtearAlchemist.getIsRemoved()).to.equal(true);
			expect(nocturne.getIsRemoved()).to.equal(true);

			gameSession.executeAction(gameSession.actionEndTurn());

			var bloodtearCheck = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Neutral.BloodtearAlchemist);
			var nocturneCheck = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction4.Nocturne);

			expect(bloodtearCheck[0].getId()).to.equal(SDK.Cards.Neutral.BloodtearAlchemist);
			expect(nocturneCheck[0].getId()).to.equal(SDK.Cards.Faction4.Nocturne);
		});

		it('expect the releaser to resummon a random friendly minion when broken', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var bluetipScorpion = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BluetipScorpion}, 0, 1, gameSession.getPlayer2Id());
			var repulsorBeast = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.RepulsionBeast}, 1, 1, gameSession.getPlayer2Id());
			var bloodtearAlchemist = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BloodtearAlchemist}, 2, 1, gameSession.getPlayer1Id());
			var nocturne = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Nocturne}, 3, 1, gameSession.getPlayer1Id());

			gameSession.executeAction(gameSession.actionEndTurn());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.AngryRebirthAmulet}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			var action = bluetipScorpion.actionAttack(gameSession.getGeneralForPlayer1());
			gameSession.executeAction(action);
			var action = repulsorBeast.actionAttack(gameSession.getGeneralForPlayer1());
			gameSession.executeAction(action);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Tempest}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));

			var released = board.getFriendlyEntitiesAroundEntity(board.getUnitAtPosition({x:0, y: 2}));
			var releasedCheck = false;

			if(released[0].getId() === SDK.Cards.Neutral.BloodtearAlchemist){
				releasedCheck = true;
			} else if (released[0].getId() === SDK.Cards.Faction4.Nocturne){
				releasedCheck = true;
			}

			expect(releasedCheck).to.equal(true);
		});

		it('expect the releaser to do nothing if theres nothing to summon', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var bluetipScorpion = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BluetipScorpion}, 0, 1, gameSession.getPlayer2Id());
			var repulsorBeast = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.RepulsionBeast}, 1, 1, gameSession.getPlayer2Id());

			gameSession.executeAction(gameSession.actionEndTurn());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.AngryRebirthAmulet}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			var action = bluetipScorpion.actionAttack(gameSession.getGeneralForPlayer1());
			gameSession.executeAction(action);
			var action = repulsorBeast.actionAttack(gameSession.getGeneralForPlayer1());
			gameSession.executeAction(action);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Tempest}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));

			var released = board.getFriendlyEntitiesAroundEntity(board.getUnitAtPosition({x:0, y: 2}));
			expect(released[0]).to.not.exist;
		});

		it('expect the releaser to not resummon tokens', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var bluetipScorpion = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BluetipScorpion}, 0, 1, gameSession.getPlayer2Id());
			var repulsorBeast = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.RepulsionBeast}, 1, 1, gameSession.getPlayer2Id());
			var illusion = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ArcaneIllusion}, 2, 1, gameSession.getPlayer1Id());

			gameSession.executeAction(gameSession.actionEndTurn());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.AngryRebirthAmulet}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			var action = bluetipScorpion.actionAttack(gameSession.getGeneralForPlayer1());
			gameSession.executeAction(action);
			var action = repulsorBeast.actionAttack(gameSession.getGeneralForPlayer1());
			gameSession.executeAction(action);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Tempest}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));

			var released = board.getFriendlyEntitiesAroundEntity(board.getUnitAtPosition({x:0, y: 2}));
			expect(released[0]).to.not.exist;
		});

		it('expect nocturne to summon wraithlings when making creep', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var nocturne = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Nocturne}, 1, 2, gameSession.getPlayer1Id());
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ShadowNova}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 0);
			gameSession.executeAction(playCardFromHandAction);

			var wraithling1 = board.getUnitAtPosition({x:0,y:0},true);
			var wraithling2 = board.getUnitAtPosition({x:1,y:0},true);
			var wraithling3 = board.getUnitAtPosition({x:0,y:1},true);
			var wraithling4 = board.getUnitAtPosition({x:1,y:1},true);

			expect(wraithling1.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
			expect(wraithling2.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
			expect(wraithling3.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
			expect(wraithling4.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
		});

		it('expect nocturne to make creep when summoning wraithlings', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var nocturne = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Nocturne}, 1, 2, gameSession.getPlayer1Id());
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.WraithlingSwarm}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 0, 4);
			gameSession.executeAction(followupAction);
			var followupCard2 = followupAction.getCard().getCurrentFollowupCard();
			var followupAction2 = player1.actionPlayFollowup(followupCard2, 1, 4);
			gameSession.executeAction(followupAction2);

			var shadowCreep1 = board.getTileAtPosition({x:0,y:3},true);
			var shadowCreep2 = board.getTileAtPosition({x:0,y:4},true);
			var shadowCreep3 = board.getTileAtPosition({x:1,y:4},true);

			expect(shadowCreep1.getId()).to.equal(SDK.Cards.Tile.Shadow);
			expect(shadowCreep2.getId()).to.equal(SDK.Cards.Tile.Shadow);
			expect(shadowCreep3.getId()).to.equal(SDK.Cards.Tile.Shadow);
		});

		it('expect death knell to resummon arcanysts nearby when summoned', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var manaforger = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Manaforger}, 1, 1, gameSession.getPlayer1Id());
			var nocturne = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Nocturne}, 1, 2, gameSession.getPlayer1Id());

			player1.remainingMana = 9;
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.CircleOfDesiccation}));
      		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			player1.remainingMana = 9;
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.DeathKnell}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			var generalMove = board.getUnitAtPosition({x: 0, y: 2});
			generalMove.refreshExhaustion();
			var action = generalMove.actionMove({ x: 0, y: 0 });
			gameSession.executeAction(action);

			var arcanystCheck = board.getFriendlyEntitiesAroundEntity(board.getUnitAtPosition({x:1, y: 2}));
			var arcanystVerify1 = false;
			var arcanystVerify2 = false;

			if(arcanystCheck[0].getId() === SDK.Cards.Neutral.Manaforger || arcanystCheck[0].getId() === SDK.Cards.Faction4.Nocturne){
				arcanystVerify1 = true;
			}

			if(arcanystCheck[1].getId() === SDK.Cards.Neutral.Manaforger || arcanystCheck[1].getId() === SDK.Cards.Faction4.Nocturne){
				arcanystVerify2 = true;
			}

			expect(arcanystVerify1).to.equal(true);
			expect(arcanystVerify2).to.equal(true);
		});
	});
});
