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

describe("wartech", function() {
	describe("faction2", function(){
		beforeEach(function () {
			var player1Deck = [
				{id: SDK.Cards.Faction2.AltGeneral},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction1.General},
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect suzumebachi to gain +1 attack when a spell is played, only until your next turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var suzumebachi = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.Suzumebachi}, 0, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(suzumebachi.getATK()).to.equal(2);

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(suzumebachi.getATK()).to.equal(2);

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(suzumebachi.getATK()).to.equal(1);

		});
		it('expect manakite drifter to give +2 mana the turn it is built', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction2.ManakiteDrifter}));
			var action = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(action);

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			expect(player1.getRemainingMana()).to.equal(6);
		});
		it('expect thunderbomb to deal 3 damage to an enemy and 1 damage to nearby enemies', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var silverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 8, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Thunderbomb}));
            var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
		    gameSession.executeAction(playCardFromHandAction);

			expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(22);
			expect(silverguardSquire.getHP()).to.equal(3);

		});
		it('expect assassination protocol to activate a minion but prevent attacking and damaging the General', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();

			var wildTahr = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WildTahr}, 7, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AssassinationProtocol}));
            var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
		    gameSession.executeAction(playCardFromHandAction);

			var action = wildTahr.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);
			expect(action.getIsValid()).to.equal(false);

			var wildTahr2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WildTahr}, 8, 1, gameSession.getPlayer2Id());
			var action = wildTahr.actionAttack(wildTahr2);
			gameSession.executeAction(action);
			expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(25);

		});
		it('expect assassination protocol to prevent unit abilities from damaging the enemy general', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();

			var flamewreath = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.Flamewreath}, 7, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AssassinationProtocol}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(playCardFromHandAction);

			var action = flamewreath.actionMove({x:7,y:3});
			gameSession.executeAction(action);
			expect(action.getIsValid()).to.equal(true);

			expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(25);
		});
		it('expect dusk rigger to give a mech progress spell on successful backstab', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var duskRigger = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.DuskRigger}, 1, 1, gameSession.getPlayer1Id());
			var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 0, 1, gameSession.getPlayer2Id());

            duskRigger.refreshExhaustion();
			var action = duskRigger.actionAttack(brightmossGolem);
			gameSession.executeAction(action);

            expect(player1.getDeck().getCardInHandAtIndex(0).getId()).to.equal(SDK.Cards.Spell.MechProgress);

		});
		it('expect mass flight to give all friendly minions flying', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var silverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 0, 0, gameSession.getPlayer1Id());
			var silverguardSquire2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 1, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.MassFlight}));
            var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		    gameSession.executeAction(playCardFromHandAction);

			expect(silverguardSquire.hasActiveModifierClass(SDK.ModifierFlying)).to.equal(true);
			expect(silverguardSquire2.hasActiveModifierClass(SDK.ModifierFlying)).to.equal(true);

		});
		it('expect ornate hiogi to draw a card when a spell is played', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.OrnateHiogi}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.InnerFocus}));

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Tempest}));
            var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
		    gameSession.executeAction(playCardFromHandAction);

            expect(player1.getDeck().getCardInHandAtIndex(0).getId()).to.equal(SDK.Cards.Spell.InnerFocus);

		});
		it('expect wildfire tenketsu to give you an Eight Gates when your BBS is used', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var wildfireTenketsu = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.WildfireTenketsu}, 1, 2, gameSession.getPlayer1Id());

			var action = player1.actionPlaySignatureCard(1, 3);
			gameSession.executeAction(action);

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0].getBaseCardId()).to.equal(SDK.Cards.Spell.EightGates);

		});
		it('expect substitution to switch your General with a minion', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var kaidoAssassin = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KaidoAssassin}, 1, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Substitution}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(kaidoAssassin.getPosition().x).to.equal(0);
			expect(kaidoAssassin.getPosition().y).to.equal(2);
			expect(gameSession.getGeneralForPlayer1().getPosition().x).to.equal(1);
			expect(gameSession.getGeneralForPlayer1().getPosition().y).to.equal(1);

		});
		it('expect bamboozle to turn an enemy into a panddo', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var kaidoAssassin = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KaidoAssassin}, 1, 2, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Bamboozle}));
			var action = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(action);

			var panddo = board.getUnitAtPosition({x:1, y:2});

			expect(panddo.getATK()).to.equal(0);
			expect(panddo.getHP()).to.equal(2);

		});
		it('expect bamboozle to not work on minions far away from general', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var valeHunter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ValeHunter}, 4, 2, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Bamboozle}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 4, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(valeHunter.getIsRemoved()).to.equal(false);
		});
		it('expect bamboozle to refill your action bar if used on a panddo, and destroy that panddo', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.InnerFocus}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.InnerFocus}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.InnerFocus}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.InnerFocus}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.InnerFocus}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.InnerFocus}));

			var kaidoAssassin = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KaidoAssassin}, 1, 2, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Bamboozle}));
			var action = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(action);

			var lovelyPanddo = board.getUnitAtPosition({x:1,y:2});
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Bamboozle}));
			var action = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(action);

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[5].getBaseCardId()).to.equal(SDK.Cards.Spell.InnerFocus);
			expect(lovelyPanddo.getIsRemoved()).to.equal(true);
		});
		it('expect penumbraxx to turn back into a building on successful backstab', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction2.Penumbraxx}));
			var action = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(action);

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 0, 1, gameSession.getPlayer2Id());
			var penumbraxx = board.getUnitAtPosition({x:1,y:1});

			expect(penumbraxx.getATK()).to.equal(3);
			var action = penumbraxx.actionAttack(brightmossGolem);
			gameSession.executeAction(action);

			var buildPenumbraxx = board.getUnitAtPosition({x:1,y:1});
			expect(buildPenumbraxx.getATK()).to.equal(0);

		});
		it('expect second-sword sarugi to discount all spells by 2', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var secondswordSarugi = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.SecondSwordSarugi}, 1, 2, gameSession.getPlayer1Id());
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Thunderbomb}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Thunderbomb}));
			var hand1 = player1.getDeck().getCardsInHand();
			expect(hand1[0].getManaCost()).to.equal(1);
			expect(hand1[1].getManaCost()).to.equal(1);
		});
		it('expect seeker squad to create heartseekers diagonally around your General', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

	        var action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
	        gameSession.executeAction(action);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SeekerSquad}));
			var action = player1.actionPlayCardFromHand(0, 0, 0);
			gameSession.executeAction(action);

			var squad = board.getEntitiesAroundEntity(gameSession.getGeneralForPlayer1());
			expect(squad.length).to.equal(4);
			expect(squad[0].getId()).to.equal(SDK.Cards.Faction2.Heartseeker);
			expect(squad[1].getId()).to.equal(SDK.Cards.Faction2.Heartseeker);
			expect(squad[2].getId()).to.equal(SDK.Cards.Faction2.Heartseeker);
			expect(squad[3].getId()).to.equal(SDK.Cards.Faction2.Heartseeker);
		});
	});
});
