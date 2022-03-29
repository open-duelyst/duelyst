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

// disable the logger for cleaner test output
Logger.enabled = false;

describe("prophecy", function() {
	describe("faction3", function(){
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

		it('expect fate watcher to gain 5 abilities as your opponent draws 5 cards', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

            var fateWatcher = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.FateWatcher}, 1, 1, gameSession.getPlayer1Id());

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.InnerFocus}));
            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.InnerFocus}));
            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.InnerFocus}));
            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.InnerFocus}));
            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.InnerFocus}));

            gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
            gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
            gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
            gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
            gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

            expect(fateWatcher.hasModifierClass(SDK.ModifierBlastAttack)).to.equal(true);
            expect(fateWatcher.hasModifierClass(SDK.ModifierProvoke)).to.equal(true);
            expect(fateWatcher.hasModifierClass(SDK.ModifierFrenzy)).to.equal(true);
            expect(fateWatcher.hasModifierClass(ModifierCelerity)).to.equal(true);
            expect(fateWatcher.hasModifierClass(SDK.ModifierFlying)).to.equal(true);
        });

        it('expect duskweaver to give a random wish on death', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction3.Duskweaver}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

            var hand = player1.getDeck().getCardsInHand();
			var cardDraw = hand[0];
            var cardCount = 0;

                if (cardDraw.getId() == SDK.Cards.Spell.ScionsFirstWish) {
                    cardCount = cardCount + 1;
                }
                 if (cardDraw.getId() == SDK.Cards.Spell.ScionsSecondWish) {
                    cardCount = cardCount + 1;
                }
                 if (cardDraw.getId() == SDK.Cards.Spell.ScionsThirdWish) {
                    cardCount = cardCount + 1;
                }
			expect(cardCount).to.equal(1);
        });

        it('expect arid unmaking to destroy a friendly minion and make a tile', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

            var silverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 1, 1, gameSession.getPlayer1Id());

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AridUnmaking}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

            expect(silverguardSquire.getIsRemoved()).to.equal(true);

            var exhumingSand = board.getTileAtPosition({x:1,y:1},true);
            expect(exhumingSand.getOwnerId()).to.equal(player1.getPlayerId());
            expect(exhumingSand.getId()).to.equal(SDK.Cards.Tile.SandPortal);
        });

        it('expect exhuming sand to make a dervish when a minion is summoned from action bar', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

            var silverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 1, 1, gameSession.getPlayer1Id());

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AridUnmaking}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 1));

            var dervishFriend = board.getUnitAtPosition({x: 1, y: 1});
			expect(dervishFriend.getId()).to.equal(SDK.Cards.Faction3.IronDervish);
			expect(dervishFriend.getOwnerId()).to.equal(gameSession.getPlayer1Id());
        });

        it('expect reassemble to put an obelysk back into your action bar at cost 0', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

            var obelysk = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.TrygonObelysk}, 1, 2, gameSession.getPlayer1Id());

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Reassemble}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 2));

            var hand = player1.getDeck().getCardsInHand();
            expect(hand[0].getId()).to.equal(SDK.Cards.Faction3.TrygonObelysk);
            expect(hand[0].getManaCost()).to.equal(0);
        });

        it('expect sandswirl reader bounces friendly minions and creates Exhuming Sand', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;

            var silverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 1, 1, gameSession.getPlayer1Id());
            var evilSilverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 1, 2, gameSession.getPlayer2Id());

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction3.SandswirlReader}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
			gameSession.executeAction(playCardFromHandAction);
			expect(playCardFromHandAction.getIsValid()).to.equal(true);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 1, 1);
			gameSession.executeAction(followupAction);

			var exhumingSand1 = board.getTileAtPosition({x:1,y:1},true);
            expect(exhumingSand1.getOwnerId()).to.equal(player1.getPlayerId());
            expect(exhumingSand1.getId()).to.equal(SDK.Cards.Tile.SandPortal);

			var hand1 = player1.getDeck().getCardsInHand();
            expect(hand1[0].getId()).to.equal(SDK.Cards.Faction1.SilverguardSquire);
		});

		it('expect sandswirl reader bounces enemy minions and creates Exhuming Sand', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;

            var silverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 1, 1, gameSession.getPlayer2Id());
            var evilSilverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 1, 2, gameSession.getPlayer2Id());

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction3.SandswirlReader}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
			gameSession.executeAction(playCardFromHandAction);
			expect(playCardFromHandAction.getIsValid()).to.equal(true);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 1, 1);
			gameSession.executeAction(followupAction);

			var exhumingSand1 = board.getTileAtPosition({x:1,y:1},true);
            expect(exhumingSand1.getOwnerId()).to.equal(player1.getPlayerId());
            expect(exhumingSand1.getId()).to.equal(SDK.Cards.Tile.SandPortal);

			var hand1 = player2.getDeck().getCardsInHand();
            expect(hand1[0].getId()).to.equal(SDK.Cards.Faction1.SilverguardSquire);
		});

        it('expect lavastorm obelysk to damage enemy minions in its row', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

            var obelysk = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.LavastormObelysk}, 1, 2, gameSession.getPlayer1Id());
            var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 7, 2, gameSession.getPlayer2Id());

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

            expect(brightmossGolem.getHP()).to.equal(3);
            expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(25);
        });

        it('expect droplift to unequip an artifact from the enemy and equip it to your General', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.SunstoneBracers}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 2));

			gameSession.executeAction(gameSession.actionEndTurn());

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.DropLift}));
			UtilsSDK.executeActionWithoutValidation(player2.actionPlayCardFromHand(0, 1, 2));

			expect(gameSession.getGeneralForPlayer2().getATK()).to.equal(3);
            expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(2);
        });

        it('expect superior mirage to make copies that vanish when attacked', function() {

            var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

            var evilSilverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 4, 1, gameSession.getPlayer2Id());
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SuperiorMirage}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 4, 1));

			var clone = board.getEntitiesAroundEntity(evilSilverguardSquire);

			expect(clone[0].getHP()).to.equal(4);
			expect(clone[0].getATK()).to.equal(1);
            expect(clone[1].getHP()).to.equal(4);
			expect(clone[1].getATK()).to.equal(1);
			expect(clone[2].getHP()).to.equal(4);
			expect(clone[2].getATK()).to.equal(1);

            gameSession.executeAction(gameSession.actionEndTurn());

            var action = evilSilverguardSquire.actionAttack(clone[0]);
			gameSession.executeAction(action);

			expect(clone[0].getIsRemoved()).to.equal(true);
			expect(evilSilverguardSquire.getDamage()).to.equal(0);

			gameSession.executeAction(gameSession.actionEndTurn());

            var action = clone[1].actionAttack(evilSilverguardSquire);
			gameSession.executeAction(action);

			expect(clone[1].getIsRemoved()).to.equal(false);
			expect(evilSilverguardSquire.getDamage()).to.equal(1);
			expect(clone[1].getDamage()).to.equal(1);

        });

        it('expect wasteland wraith to destroy itself and enemies at the start of your turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

            var silverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 1, 1, gameSession.getPlayer1Id());
            var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 7, 2, gameSession.getPlayer2Id());
            var wastelandWraith = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.WastelandWraith}, 1, 2, gameSession.getPlayer1Id());

            gameSession.executeAction(gameSession.actionEndTurn());
            gameSession.executeAction(gameSession.actionEndTurn());

            expect(silverguardSquire.getIsRemoved()).to.equal(false);
            expect(brightmossGolem.getIsRemoved()).to.equal(true);
            expect(wastelandWraith.getIsRemoved()).to.equal(true);
        });

        it('expect azure summoning to draw only flying minions when only a flying minion is played', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AzureSummoning}));
			var action = player1.actionPlayCardFromHand(0, 8, 2);
			gameSession.executeAction(action);
			expect(action.getIsValid()).to.equal(true);

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.SpottedDragonlark}));
            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.SpottedDragonlark}));
            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.SpottedDragonlark}));
            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.HailstoneGolem}));

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.SpottedDragonlark}));
            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.SpottedDragonlark}));
            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.SpottedDragonlark}));
            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.HailstoneGolem}));

			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(1, 2, 1));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(2, 3, 1));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(3, 4, 1));


            var hand1 = player1.getDeck().getCardsInHand();
			expect(hand1[0].getId()).to.equal(SDK.Cards.Neutral.SpottedDragonlark);
            expect(hand1[1].getId()).to.equal(SDK.Cards.Neutral.SpottedDragonlark);
            expect(hand1[2].getId()).to.equal(SDK.Cards.Neutral.SpottedDragonlark);
			expect(hand1[3]).to.not.exist;
        });

        it('expect oblivion sickle to create Exhuming Sand when you destroy a minion with an attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.OblivionSickle}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			var valeHunter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ValeHunter}, 1, 2, gameSession.getPlayer2Id());

			var action = gameSession.getGeneralForPlayer1().actionAttack(valeHunter);
			gameSession.executeAction(action);

			var exhumingSand1 = board.getTileAtPosition({x:1,y:2},true);
            expect(exhumingSand1.getOwnerId()).to.equal(player1.getPlayerId());
            expect(exhumingSand1.getId()).to.equal(SDK.Cards.Tile.SandPortal);
        });

        it('expect cataclysmic fault to turn the center column into Exhuming Sand', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

            UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.CataclysmicFault}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 2));

            var exhumingSand1 = board.getTileAtPosition({x:4,y:0},true);
            expect(exhumingSand1.getOwnerId()).to.equal(player1.getPlayerId());
            expect(exhumingSand1.getId()).to.equal(SDK.Cards.Tile.SandPortal);
            var exhumingSand2 = board.getTileAtPosition({x:4,y:1},true);
            expect(exhumingSand2.getOwnerId()).to.equal(player1.getPlayerId());
            expect(exhumingSand2.getId()).to.equal(SDK.Cards.Tile.SandPortal);
            var exhumingSand3 = board.getTileAtPosition({x:4,y:2},true);
            expect(exhumingSand3.getOwnerId()).to.equal(player1.getPlayerId());
            expect(exhumingSand3.getId()).to.equal(SDK.Cards.Tile.SandPortal);
            var exhumingSand4 = board.getTileAtPosition({x:4,y:3},true);
            expect(exhumingSand4.getOwnerId()).to.equal(player1.getPlayerId());
            expect(exhumingSand4.getId()).to.equal(SDK.Cards.Tile.SandPortal);
            var exhumingSand5 = board.getTileAtPosition({x:4,y:4},true);
            expect(exhumingSand5.getOwnerId()).to.equal(player1.getPlayerId());
            expect(exhumingSand5.getId()).to.equal(SDK.Cards.Tile.SandPortal);
        });

        it('expect trygon obelyk to summon dervish summon dervish summon dervish', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

            var obelysk = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.TrygonObelysk}, 1, 2, gameSession.getPlayer1Id());

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var windDervish = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction3.Dervish);
			expect(windDervish.length).to.equal(3);
        });
	});
});
