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

describe("prophecy", function() {
	describe("faction2", function(){
		beforeEach(function () {
			var player1Deck = [
				{id: SDK.Cards.Faction2.General},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction1.General},
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect hundred-hand rakushi to be summoned as watchful, then transform and deal 2 damage to the enemy minion', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction2.HundredHand}));
			var action = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(action);

            var watchfulSentinel = board.getUnitAtPosition({x: 1, y: 1});
            expect(watchfulSentinel.getId()).to.equal(SDK.Cards.Faction2.SonghaiSentinel);

            gameSession.executeAction(gameSession.actionEndTurn());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			var playCardFromHandAction = player2.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(playCardFromHandAction);

            var revealedSentinel = board.getUnitAtPosition({x: 1, y: 1});
            expect(revealedSentinel.getId()).to.equal(SDK.Cards.Faction2.HundredHand);
            var silverguardSquire = board.getUnitAtPosition({x: 7, y: 2});
			expect(silverguardSquire.getDamage()).to.equal(2);
        });

        it('expect flamewreath to damage minions and Generals when moving or moved', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

            var flamewreath = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.Flamewreath}, 1, 1, gameSession.getPlayer1Id());
            var hailstoneGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.HailstoneGolem}, 8, 3, gameSession.getPlayer2Id());

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.MistDragonSeal}));
			var action = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(action);
			var followupCard = action.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 7, 2);
			gameSession.executeAction(followupAction);

            expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(23);
            expect(hailstoneGolem.getHP()).to.equal(4);

            flamewreath.refreshExhaustion();
			var action = flamewreath.actionMove({ x: 7, y: 3 });
			gameSession.executeAction(action);

            expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(21);
            expect(hailstoneGolem.getHP()).to.equal(2);
        });

        it('expect spiral counter to not work unless the minion has attacked', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			//fails if it is turn 1, passing the turn so that it passes (known/documented bug)
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			player1.remainingMana = 9;

            var hailstoneGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.HailstoneGolem}, 8, 3, gameSession.getPlayer2Id());

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpiralCounter}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 3);
			gameSession.executeAction(playCardFromHandAction);

			expect(playCardFromHandAction.getIsValid()).to.equal(false);
        });

        it('expect spiral counter deal 8 if a minion attacked', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

            var hailstoneGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.HailstoneGolem}, 0, 1, gameSession.getPlayer2Id());

			gameSession.executeAction(gameSession.actionEndTurn());

			hailstoneGolem.refreshExhaustion();
			var action = hailstoneGolem.actionAttack(gameSession.getGeneralForPlayer1());
			gameSession.executeAction(action);

			gameSession.executeAction(gameSession.actionEndTurn());

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpiralCounter}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(hailstoneGolem.getIsRemoved()).to.equal(true);
        });

        it('expect gotatsu to deal 1 damage to an enemy minion and draw a card end of turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

            var hailstoneGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.HailstoneGolem}, 8, 3, gameSession.getPlayer2Id());

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Gotatsu}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 3);
			gameSession.executeAction(playCardFromHandAction);

			expect(hailstoneGolem.getHP()).to.equal(5);

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.InnerFocus}));

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(player1.getDeck().getCardInHandAtIndex(0).getId()).to.equal(SDK.Cards.Spell.InnerFocus);
        });

        it('expect gotatsu to not work on Generals', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.Gotatsu}));
			var playCardFromHandAction = player2.actionPlayCardFromHand(0, 8, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(playCardFromHandAction.getIsValid()).to.equal(false);
        });

        it('expect mizuchi to be summoned as watchful, then transform and have flying and backstab when the General attacks', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction2.Mizuchi}));
			var action = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(action);

            var watchfulSentinel = board.getUnitAtPosition({x: 1, y: 1});
            expect(watchfulSentinel.getId()).to.equal(SDK.Cards.Faction2.SonghaiSentinel);

            gameSession.executeAction(gameSession.actionEndTurn());
            var action = gameSession.getGeneralForPlayer2().actionMove({x:6, y:2});
            gameSession.executeAction(action);
            gameSession.executeAction(gameSession.actionEndTurn());
            gameSession.executeAction(gameSession.actionEndTurn());
            var action = gameSession.getGeneralForPlayer2().actionMove({x:4, y:2});
            gameSession.executeAction(action);
            gameSession.executeAction(gameSession.actionEndTurn());
            gameSession.executeAction(gameSession.actionEndTurn());
            var action = gameSession.getGeneralForPlayer2().actionMove({x:2, y:2});
            gameSession.executeAction(action);
            gameSession.executeAction(gameSession.actionEndTurn());
            gameSession.executeAction(gameSession.actionEndTurn());
            var action = gameSession.getGeneralForPlayer2().actionMove({x:1, y:2});
            gameSession.executeAction(action);
            var action = gameSession.getGeneralForPlayer2().actionAttack(gameSession.getGeneralForPlayer1());
			gameSession.executeAction(action);
			expect(action.getIsValid()).to.equal(true);

            var revealedSentinel = board.getUnitAtPosition({x: 1, y: 1});
            expect(revealedSentinel.getId()).to.equal(SDK.Cards.Faction2.Mizuchi);
            expect(revealedSentinel.hasModifierClass(SDK.ModifierFlying)).to.equal(true);
            expect(revealedSentinel.hasModifierClass(SDK.ModifierBackstab)).to.equal(true);
        });

        it('expect mind-cage oni to be summoned as watchful, then transform when a spell is played, steal that spell, and continue to steal further spells cast', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction2.MindCageOni}));
			var action = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(action);

            var watchfulSentinel = board.getUnitAtPosition({x: 1, y: 1});
            expect(watchfulSentinel.getId()).to.equal(SDK.Cards.Faction2.SonghaiSentinel);

			gameSession.executeAction(gameSession.actionEndTurn());
			player2.remainingMana = 9;
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var action = player2.actionPlayCardFromHand(0, 0, 2);
			gameSession.executeAction(action);

            var revealedSentinel = board.getUnitAtPosition({x: 1, y: 1});
            expect(revealedSentinel.getId()).to.equal(SDK.Cards.Faction2.MindCageOni);

            var hand = player1.getDeck().getCardsInHand();
            expect(hand[0].getId()).to.equal(SDK.Cards.Spell.PhoenixFire);

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var action = player2.actionPlayCardFromHand(0, 0, 2);
			gameSession.executeAction(action);

            var hand = player1.getDeck().getCardsInHand();
            expect(hand[1].getId()).to.equal(SDK.Cards.Spell.PhoenixFire);
        });

        it('expect bombard to reactive friendly minions only if they are ranged', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

            var heartseeker = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.Heartseeker}, 0, 0, gameSession.getPlayer1Id());
            var kaidoAssassin = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KaidoAssassin}, 0, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Bombard}));
			var action = player1.actionPlayCardFromHand(0, 0, 1);
			gameSession.executeAction(action);

			expect(heartseeker.getIsExhausted()).to.equal(false);
			expect(kaidoAssassin.getIsExhausted()).to.equal(true);
        });

        it('expect scroll bandit to steal a spell when backstabbing', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

            var scrollBandit = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.ScrollBandit}, 1, 1, gameSession.getPlayer1Id());
			var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 0, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.InnerFocus}));

            scrollBandit.refreshExhaustion();
			var action = scrollBandit.actionAttack(brightmossGolem);
			gameSession.executeAction(action);

            expect(player1.getDeck().getCardInHandAtIndex(0).getId()).to.equal(SDK.Cards.Spell.InnerFocus);
        });

        it('expect firestorm mantra to steal 2 Health for each spell cast including itself', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;
            gameSession.getGeneralForPlayer1().setDamage(24);

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.FirestormMantra}));
			var action = player1.actionPlayCardFromHand(0, 8, 2);
			gameSession.executeAction(action);

            expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(3);
            expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(23);

            player1.remainingMana = 9;
            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.FirestormMantra}));
			var action = player1.actionPlayCardFromHand(0, 8, 2);
			gameSession.executeAction(action);

            expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(7);
            expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(19);

            player1.remainingMana = 9;
            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.FirestormMantra}));
			var action = player1.actionPlayCardFromHand(0, 8, 2);
			gameSession.executeAction(action);

            expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(13);
            expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(13);
        });

        it('expect flicker to move your General behind an enemy', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;

            //move behind minion
            var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 0, 1, gameSession.getPlayer2Id());

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Flicker}));
			var action = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(action);

            var flickeredGeneral = board.getUnitAtPosition({x:1, y:1});
            expect(flickeredGeneral.getId()).to.equal(SDK.Cards.Faction2.General);
            //move behind General
            gameSession.executeAction(gameSession.actionEndTurn());
            var action = gameSession.getGeneralForPlayer2().actionMove({x:7, y:2});
			gameSession.executeAction(action);
            gameSession.executeAction(gameSession.actionEndTurn());

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Flicker}));
			var action = player1.actionPlayCardFromHand(0, 8, 2);
			gameSession.executeAction(action);
            var flickeredGeneral = board.getUnitAtPosition({x:8, y:2});
            expect(flickeredGeneral.getId()).to.equal(SDK.Cards.Faction2.General);
        });

        it('expect unbounded energy amulet to give +1 attack and +1 speed', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.EnergyAmulet}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(3);
            expect(gameSession.getGeneralForPlayer1().getSpeed()).to.equal(3);
        });

        it('expect twilight reiki to draw 3 Songhai minions that cost 1 less', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TwilightReiki}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

            var hand = player1.getDeck().getCardsInHand();
			expect(hand[0].type).to.equal(SDK.CardType.Unit);
			expect(hand[1].type).to.equal(SDK.CardType.Unit);
			expect(hand[2].type).to.equal(SDK.CardType.Unit);
            expect(hand[0].getFactionId()).to.equal(SDK.Factions.Faction2);
			expect(hand[1].getFactionId()).to.equal(SDK.Factions.Faction2);
			expect(hand[2].getFactionId()).to.equal(SDK.Factions.Faction2);
			expect(hand[0].getManaCostChange()).to.equal(-1);
			expect(hand[1].getManaCostChange()).to.equal(-1);
			expect(hand[2].getManaCostChange()).to.equal(-1);
        });

        it('expect eternity painter to transform nearby enemies to panddo at end of turns', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

            var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 2, 0, gameSession.getPlayer2Id());
            var brightmossGolem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 2, 1, gameSession.getPlayer2Id());
            var eternityPainter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.EternityPainter}, 1, 1, gameSession.getPlayer1Id());

            gameSession.executeAction(gameSession.actionEndTurn());
            gameSession.executeAction(gameSession.actionEndTurn());

            var panddo1 = board.getUnitAtPosition({x:2, y:0});
            var panddo2 = board.getUnitAtPosition({x:2, y:1});

			expect(panddo1.getATK()).to.equal(0);
			expect(panddo1.getHP()).to.equal(2);
			expect(panddo2.getATK()).to.equal(0);
			expect(panddo2.getHP()).to.equal(2);
        });
	});
});
