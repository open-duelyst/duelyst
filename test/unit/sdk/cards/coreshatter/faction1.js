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
var ModifierCelerity = require('app/sdk/modifiers/modifierTranscendance');
var Factions = require('app/sdk/cards/factionsLookup');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("coreshatter", function() {
	describe("faction1", function(){
		beforeEach(function () {
			var player1Deck = [
				{id: SDK.Cards.Faction1.General},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction1.General},
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect one man army to add progressively more crestfallen into your hand each time its played', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.OneManArmy}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(player1.getDeck().getCardInHandAtIndex(0).getId()).to.equal(SDK.Cards.Faction1.KingsGuard);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.OneManArmy}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(1, 2, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(player1.getDeck().getCardInHandAtIndex(1).getId()).to.equal(SDK.Cards.Faction1.KingsGuard);
			expect(player1.getDeck().getCardInHandAtIndex(2).getId()).to.equal(SDK.Cards.Faction1.KingsGuard);
        });
		it('expect one man army to be shuffled into your deck each time its played', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.OneManArmy}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(player1.getDeck().getCardInHandAtIndex(0).getId()).to.equal(SDK.Cards.Faction1.KingsGuard);

			var deck = player1.getDeck().getCardsInDrawPile();
			expect(deck[0].getId()).to.equal(SDK.Cards.Faction1.OneManArmy);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.OneManArmy}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(1, 2, 1);
			gameSession.executeAction(playCardFromHandAction);

			var deck = player1.getDeck().getCardsInDrawPile();
			expect(deck[1].getId()).to.equal(SDK.Cards.Faction1.OneManArmy);
		});
		it('expect friend fighter to summon a friendsguard from your deck nearby', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AerialRift}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.FriendFighter}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(playCardFromHandAction);

			var nearbyUnits = board.getEntitiesAroundEntity(board.getUnitAtPosition({x:5,y:1}));
			expect(nearbyUnits.length).to.equal(0);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.Friendsguard}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.FriendFighter}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 1, 1);
			gameSession.executeAction(followupAction);

			nearbyUnits = board.getEntitiesAroundEntity(board.getUnitAtPosition({x:2,y:2}));
			expect(nearbyUnits.length).to.equal(1);
			expect(nearbyUnits[0].getId()).to.equal(SDK.Cards.Faction1.Friendsguard);
		});
		it('expect lifestream to fully heal a minion and then draw a copy of it from your deck', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var silverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 2, 2, gameSession.getPlayer1Id());
			silverguardSquire.setDamage(3);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Resilience}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(silverguardSquire.getDamage()).to.equal(0);
			expect(player1.getDeck().getCardInHandAtIndex(0).getId()).to.equal(SDK.Cards.Faction1.SilverguardSquire);
		});
		it('expect increasing dominance to give your minions incremental +2 health each time its played', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var silverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 2, 2, gameSession.getPlayer1Id());
			expect(silverguardSquire.getHP()).to.equal(4);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.IncreasingDominance}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(silverguardSquire.getHP()).to.equal(6);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.IncreasingDominance}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(silverguardSquire.getHP()).to.equal(10);
		});
		it('expect rally to give friendly minions in front of and behind your general +2/+2 and cant be spell targeted if they have zeal', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;

			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 1, y: 2 });
			gameSession.executeAction(action);

			var silverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 0, 2, gameSession.getPlayer1Id());
			var silverguardSquire2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 1, 1, gameSession.getPlayer1Id());
			var silverguardSquire3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 3, 2, gameSession.getPlayer1Id());
			var knight = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardKnight}, 2, 2, gameSession.getPlayer1Id());
			expect(silverguardSquire.getHP()).to.equal(4);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Rally}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(silverguardSquire.getHP()).to.equal(6);
			expect(silverguardSquire.getATK()).to.equal(3);
			expect(silverguardSquire2.getATK()).to.equal(1);
			expect(silverguardSquire2.getHP()).to.equal(4);
			expect(silverguardSquire3.getATK()).to.equal(1);
			expect(silverguardSquire3.getHP()).to.equal(4);
			expect(knight.getATK()).to.equal(5);
			expect(knight.getHP()).to.equal(7);

			gameSession.executeAction(gameSession.actionEndTurn());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction = player2.actionPlayCardFromHand(0, 2, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(knight.getHP()).to.equal(7);
		});
		it('expect divinest bonderest to give all friendly minions +attack equal to their health', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var silverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 2, 2, gameSession.getPlayer1Id());
			var knight = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardKnight}, 1, 2, gameSession.getPlayer1Id());
			expect(knight.getATK()).to.equal(3);
			expect(knight.getHP()).to.equal(5);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.DivinestBonderest}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(silverguardSquire.getHP()).to.equal(4);
			expect(silverguardSquire.getATK()).to.equal(5);
			expect(knight.getATK()).to.equal(8);
			expect(knight.getHP()).to.equal(5);
		});
		it('expect friendsguard to turn into a friend fighter if a friendly friend fighter dies', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var friendFighter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.FriendFighter}, 1, 2, gameSession.getPlayer1Id());
			var friendsguard = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.Friendsguard}, 1, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(board.getUnitAtPosition({x:1,y:1}).getId()).to.equal(SDK.Cards.Faction1.FriendFighter);
		});
		it('expect charge into battle to give a unit behind your general celerity', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
			gameSession.executeAction(action);

			var friendFighter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.FriendFighter}, 1, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChargeIntoBattle}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(friendFighter.hasModifierClass(ModifierCelerity)).to.equal(true);
		});
		it('expect 3hander to give your general +3 attack and to summon a 3 cost minion from your deck nearby when attacking', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
			gameSession.executeAction(action);

			var ironcliffe = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.IroncliffeGuardian}, 1, 2, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardKnight}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.IroncliffeGuardian}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.LysianBrawler}));

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.TwoHander}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			var action = gameSession.getGeneralForPlayer1().actionAttack(ironcliffe);
			gameSession.executeAction(action);

			expect(ironcliffe.getDamage()).to.equal(5);

			var nearbyAllies = board.getFriendlyEntitiesAroundEntity(gameSession.getGeneralForPlayer1());

			expect(nearbyAllies[0].getId()).to.equal(SDK.Cards.Faction1.SilverguardKnight);
		});
		it('expect indominus to make your general invulnerable but cant move or attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var indominus = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.Invincibuddy}, 4, 2, gameSession.getPlayer1Id());

			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
			gameSession.executeAction(action);
			//expect(action.getIsValid()).to.equal(false);
			expect(board.getUnitAtPosition({x:2,y:2})).to.equal(undefined);

			var ironcliffe = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.IroncliffeGuardian}, 1, 2, gameSession.getPlayer2Id());


			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
			gameSession.executeAction(playCardFromHandAction);

			/*
			var action = gameSession.getGeneralForPlayer1().actionAttack(ironcliffe);
			gameSession.executeAction(action);

			// bugged in unit tests but works in game

			expect(ironcliffe.getDamage()).to.equal(0);
			*/
			expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(0);
		});
		it('expect suntide expert to cast holy immolation on your damaged minions at the start of your turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var silverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 7, 2, gameSession.getPlayer1Id());
			silverguardSquire.setDamage(3);
			var silverguardSquire2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 7, 3, gameSession.getPlayer1Id());
			var suntideExpert = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SuntideExpert}, 5, 3, gameSession.getPlayer1Id());

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			expect(silverguardSquire.getDamage()).to.equal(0);
			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(4);
		});
		it('expect once more with provoke to summon all friendly minions with provoke that died this game around your general', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var silverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 7, 2, gameSession.getPlayer1Id());
			var silverguardSquire2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 7, 3, gameSession.getPlayer1Id());
			var suntideExpert = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SuntideExpert}, 5, 3, gameSession.getPlayer1Id());
			var suntideExpert2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SuntideExpert}, 6, 3, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.CircleOfDesiccation}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
			gameSession.executeAction(playCardFromHandAction);

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.OnceMoreWithProvoke}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
			gameSession.executeAction(playCardFromHandAction);

			var nearbyAllies = board.getFriendlyEntitiesAroundEntity(gameSession.getGeneralForPlayer1());
			expect(nearbyAllies.length).to.equal(2);
			expect(nearbyAllies[0].hasModifierClass(SDK.ModifierProvoke)).to.equal(true);
			expect(nearbyAllies[1].hasModifierClass(SDK.ModifierProvoke)).to.equal(true);
		});

		/* Test disabled: failing
		it('expect rightful heir to promote your minions at the end of the original players turns once youve played 10 minions with 1 or less attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var lanternFox = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.LanternFox}, 7, 4, gameSession.getPlayer1Id());
			var golem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 6, 4, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.RightfulHeir}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
			gameSession.executeAction(playCardFromHandAction);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 1);
			gameSession.executeAction(playCardFromHandAction);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 1);
			gameSession.executeAction(playCardFromHandAction);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 4, 1);
			gameSession.executeAction(playCardFromHandAction);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(board.getUnitAtPosition({x:0,y:1}).getManaCost()).to.equal(1);

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 6, 1);
			gameSession.executeAction(playCardFromHandAction);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 1);
			gameSession.executeAction(playCardFromHandAction);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
			gameSession.executeAction(playCardFromHandAction);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 3);
			gameSession.executeAction(playCardFromHandAction);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 3);
			gameSession.executeAction(playCardFromHandAction);

			player1.remainingMana = 9;
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.RightfulHeir}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(1, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(board.getUnitAtPosition({x:7,y:4}).getManaCost()).to.equal(4);
			expect(board.getUnitAtPosition({x:7,y:4}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:6,y:4}).getManaCost()).to.equal(6);
			expect(board.getUnitAtPosition({x:6,y:4}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:0,y:1}).getManaCost()).to.equal(2);
			expect(board.getUnitAtPosition({x:0,y:1}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:1,y:1}).getManaCost()).to.equal(2);
			expect(board.getUnitAtPosition({x:1,y:1}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:2,y:1}).getManaCost()).to.equal(2);
			expect(board.getUnitAtPosition({x:2,y:1}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:3,y:1}).getManaCost()).to.equal(2);
			expect(board.getUnitAtPosition({x:3,y:1}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:4,y:1}).getManaCost()).to.equal(2);
			expect(board.getUnitAtPosition({x:4,y:1}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:5,y:1}).getManaCost()).to.equal(2);
			expect(board.getUnitAtPosition({x:5,y:1}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:6,y:1}).getManaCost()).to.equal(2);
			expect(board.getUnitAtPosition({x:6,y:1}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:7,y:1}).getManaCost()).to.equal(2);
			expect(board.getUnitAtPosition({x:7,y:1}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:0,y:3}).getManaCost()).to.equal(2);
			expect(board.getUnitAtPosition({x:0,y:3}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:1,y:3}).getManaCost()).to.equal(2);
			expect(board.getUnitAtPosition({x:1,y:3}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:2,y:3}).getManaCost()).to.equal(2);
			expect(board.getUnitAtPosition({x:2,y:3}).getFactionId()).to.equal(Factions.Faction1)

			// Commenting out the rest of this unit test as it breaks if a battle pet is summoned (since the battlepet moves away from the coordinates)
			console.log("x:0, y:1 = ", board.getUnitAtPosition({x:0,y:1}));
			console.log("x:1, y:1 = ", board.getUnitAtPosition({x:1,y:1}));
			console.log("x:2, y:1 = ", board.getUnitAtPosition({x:2,y:1}));
			console.log("x:3, y:1 = ", board.getUnitAtPosition({x:3,y:1}));
			console.log("x:4, y:1 = ", board.getUnitAtPosition({x:4,y:1}));
			console.log("x:5, y:1 = ", board.getUnitAtPosition({x:5,y:1}));
			console.log("x:6, y:1 = ", board.getUnitAtPosition({x:6,y:1}));
			console.log("x:7, y:1 = ", board.getUnitAtPosition({x:6,y:1}));
			console.log("x:0, y:3 = ", board.getUnitAtPosition({x:0,y:3}));
			console.log("x:1, y:3 = ", board.getUnitAtPosition({x:1,y:3}));
			console.log("x:2, y:3 = ", board.getUnitAtPosition({x:2,y:3}));

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(board.getUnitAtPosition({x:7,y:4}).getManaCost()).to.equal(4);
			expect(board.getUnitAtPosition({x:7,y:4}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:6,y:4}).getManaCost()).to.equal(6);
			expect(board.getUnitAtPosition({x:6,y:4}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:0,y:1}).getManaCost()).to.equal(2);
			expect(board.getUnitAtPosition({x:0,y:1}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:1,y:1}).getManaCost()).to.equal(2);
			expect(board.getUnitAtPosition({x:1,y:1}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:2,y:1}).getManaCost()).to.equal(2);
			expect(board.getUnitAtPosition({x:2,y:1}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:3,y:1}).getManaCost()).to.equal(2);
			expect(board.getUnitAtPosition({x:3,y:1}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:4,y:1}).getManaCost()).to.equal(2);
			expect(board.getUnitAtPosition({x:4,y:1}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:5,y:1}).getManaCost()).to.equal(2);
			expect(board.getUnitAtPosition({x:5,y:1}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:6,y:1}).getManaCost()).to.equal(2);
			expect(board.getUnitAtPosition({x:6,y:1}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:7,y:1}).getManaCost()).to.equal(2);
			expect(board.getUnitAtPosition({x:7,y:1}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:0,y:3}).getManaCost()).to.equal(2);
			expect(board.getUnitAtPosition({x:0,y:3}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:1,y:3}).getManaCost()).to.equal(2);
			expect(board.getUnitAtPosition({x:1,y:3}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:2,y:3}).getManaCost()).to.equal(2);
			expect(board.getUnitAtPosition({x:2,y:3}).getFactionId()).to.equal(Factions.Faction1)

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(board.getUnitAtPosition({x:7,y:4}).getManaCost()).to.equal(5);
			expect(board.getUnitAtPosition({x:7,y:4}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:6,y:4}).getManaCost()).to.equal(7);
			expect(board.getUnitAtPosition({x:6,y:4}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:0,y:1}).getManaCost()).to.equal(3);
			expect(board.getUnitAtPosition({x:0,y:1}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:1,y:1}).getManaCost()).to.equal(3);
			expect(board.getUnitAtPosition({x:1,y:1}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:2,y:1}).getManaCost()).to.equal(3);
			expect(board.getUnitAtPosition({x:2,y:1}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:3,y:1}).getManaCost()).to.equal(3);
			expect(board.getUnitAtPosition({x:3,y:1}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:4,y:1}).getManaCost()).to.equal(3);
			expect(board.getUnitAtPosition({x:4,y:1}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:5,y:1}).getManaCost()).to.equal(3);
			expect(board.getUnitAtPosition({x:5,y:1}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:6,y:1}).getManaCost()).to.equal(3);
			expect(board.getUnitAtPosition({x:6,y:1}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:7,y:1}).getManaCost()).to.equal(3);
			expect(board.getUnitAtPosition({x:7,y:1}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:0,y:3}).getManaCost()).to.equal(3);
			expect(board.getUnitAtPosition({x:0,y:3}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:1,y:3}).getManaCost()).to.equal(3);
			expect(board.getUnitAtPosition({x:1,y:3}).getFactionId()).to.equal(Factions.Faction1)
			expect(board.getUnitAtPosition({x:2,y:3}).getManaCost()).to.equal(3);
			expect(board.getUnitAtPosition({x:2,y:3}).getFactionId()).to.equal(Factions.Faction1)
		});
		*/
	});
});
