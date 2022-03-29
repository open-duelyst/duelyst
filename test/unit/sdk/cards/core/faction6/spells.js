var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var UtilsSDK = require('test/utils/utils_sdk');
var _ = require('underscore');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("faction6", function() {
	describe("spells", function(){

		beforeEach(function () {
			// define test decks.  Spells do not work.  Only add minions and generals this way
			var player1Deck = [
				{id: SDK.Cards.Faction6.General},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction3.General},
			];

			// setup test session
			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

			/* // USE THIS TO GET THE CURRENT CARDS IN YOUR HAND
			var deck = player1.getDeck();
			Logger.module("UNITTEST").log(deck.getCardsInHand(1));
			*/
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect flash freeze to deal 1 damage and add stunned modifier on minion', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var kaidoAssassin = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KaidoAssassin}, 5, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.FlashFreeze}));
			var action = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(action);

			expect(kaidoAssassin.getDamage()).to.equal(1);
			expect(kaidoAssassin.hasActiveModifierClass(SDK.ModifierStunned)).to.equal(true);
		});
		it('expect polarity to swap minion attack and health', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var kaidoAssassin = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KaidoAssassin}, 5, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.RitualOfTheWind}));
			var action = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(action);

			expect(kaidoAssassin.getHP()).to.equal(2);
			expect(kaidoAssassin.getATK()).to.equal(3);
		});
		it('expect polarity to swap minion attack and health when minion is damaged', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var kaidoAssassin = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KaidoAssassin}, 5, 1, gameSession.getPlayer2Id());
			kaidoAssassin.setDamage(1);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.RitualOfTheWind}));
			var action = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(action);

			expect(kaidoAssassin.getHP()).to.equal(2);
			expect(kaidoAssassin.getATK()).to.equal(2);
		});
		it('expect a minion to have original HP if polarity cast on them, then damaged, then polarity cast again', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var kaidoAssassin = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KaidoAssassin}, 5, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.RitualOfTheWind}));
			var action = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(action);

			kaidoAssassin.setDamage(2);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.RitualOfTheWind}));
			var action = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(action);

			expect(kaidoAssassin.getHP()).to.equal(3);
		});
		it('expect aspect of the fox to turn any minion into vanilla 3/3', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var kaidoAssassin = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KaidoAssassin}, 5, 1, gameSession.getPlayer2Id());
			kaidoAssassin.setDamage(1);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AspectOfTheWolf}));
			var action = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(action);

			var fox = board.getUnitAtPosition({x:5, y:1});
			expect(fox.getId()).to.equal(SDK.Cards.Faction6.WolfAspect);
			expect(fox.getHP()).to.equal(3);
			expect(fox.getATK()).to.equal(3);
		});
		it('expect mesmerize to push an enemy general or minion one space', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();

			player1.remainingMana = 9;

			var kaidoAssassin = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KaidoAssassin}, 5, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Numb}));
			var action = player1.actionPlayCardFromHand(0, 8, 2);
			gameSession.executeAction(action);
			var followupCard = action.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 7, 2);
			gameSession.executeAction(followupAction);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Numb}));
			var action = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(action);
			var followupCard = action.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 5, 2);
			gameSession.executeAction(followupAction);

			expect(board.getUnitAtPosition({x:5,y:2}).getId()).to.equal(SDK.Cards.Faction2.KaidoAssassin);
			expect(board.getUnitAtPosition({x:7,y:2}).getId()).to.equal(SDK.Cards.Faction3.General);
		});
		it('expect bonechill barrier to summon 3 0/2 vespyr walls', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.BonechillBarrier}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 0, 4);
			gameSession.executeAction(followupAction);
			var followupCard2 = followupAction.getCard().getCurrentFollowupCard();
			var followupAction2 = player1.actionPlayFollowup(followupCard2, 1, 4);
			gameSession.executeAction(followupAction2);

			var bcb1 = board.getUnitAtPosition({x:0,y:3});
			var bcb2 = board.getUnitAtPosition({x:0,y:4});
			var bcb3 = board.getUnitAtPosition({x:1,y:4});

			expect(bcb1.getId()).to.equal(SDK.Cards.Faction6.BonechillBarrier);
			expect(bcb2.getId()).to.equal(SDK.Cards.Faction6.BonechillBarrier);
			expect(bcb3.getId()).to.equal(SDK.Cards.Faction6.BonechillBarrier);
			expect(bcb1.getHP()).to.equal(2);
			expect(bcb1.getATK()).to.equal(0);
		});
		it('expect bonechill barrier walls to stun enemy minions who attack it', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.BonechillBarrier}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 0, 4);
			gameSession.executeAction(followupAction);
			var followupCard2 = followupAction.getCard().getCurrentFollowupCard();
			var followupAction2 = player1.actionPlayFollowup(followupCard2, 1, 4);
			gameSession.executeAction(followupAction2);

			var bcb1 = board.getUnitAtPosition({x:0,y:3});

			gameSession.executeAction(gameSession.actionEndTurn());

			var abyssalCrawler1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalCrawler}, 1, 3, gameSession.getPlayer2Id());
			abyssalCrawler1.refreshExhaustion();

			var action = abyssalCrawler1.actionAttack(bcb1);
			gameSession.executeAction(action);
			expect(abyssalCrawler1.hasActiveModifierClass(SDK.ModifierStunned)).to.equal(true);
		});
		it('expect boundless courage to give a minion +2 attack permanently', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var kaidoAssassin = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KaidoAssassin}, 5, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ElementalFury}));
			var action = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(action);

			expect(kaidoAssassin.getATK()).to.equal(4);
		});
		it('expect boundless courage to make a minion immune to damage only until end of turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var kaidoAssassin = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KaidoAssassin}, 7, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ElementalFury}));
			var action = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(action);

			kaidoAssassin.refreshExhaustion();
			var action = kaidoAssassin.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);

			expect(kaidoAssassin.getHP()).to.equal(3);
			expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(21);
		});
		it('expect chromatic cold to deal 1 damage to an enemy minion or general', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var kaidoAssassin = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KaidoAssassin}, 7, 2, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
			var action = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(action);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
			var action = player1.actionPlayCardFromHand(0, 8, 2);
			gameSession.executeAction(action);

			expect(kaidoAssassin.getHP()).to.equal(2);
			expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(24);
		});
		it('expect chromatic cold to dispel spell immune creatures', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var sandHowler = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.SandHowler}, 7, 2, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
			var action = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(action);

			expect(sandHowler.getIsSilenced()).to.equal(true);
		});
		it('expect chromatic cold to not deal damage to friendly minions or generals', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var kaidoAssassin = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KaidoAssassin}, 7, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
			var action = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(action);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
			var action = player1.actionPlayCardFromHand(0, 0, 2);
			gameSession.executeAction(action);

			expect(kaidoAssassin.getHP()).to.equal(3);
			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(25);
		});
		it('expect chromatic cold to dispel buffs and debuffs on a minion', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var kaidoAssassin = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KaidoAssassin}, 7, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ElementalFury}));
			var action = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(action);
			expect(kaidoAssassin.getATK()).to.equal(4);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
			var action = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(action);

			expect(kaidoAssassin.getATK()).to.equal(2);
		});
		it('expect frostfire to give a friendly non-vespyr +3 attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var kaidoAssassin = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KaidoAssassin}, 7, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PermafrostShield}));
			var action = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(action);
			expect(kaidoAssassin.getATK()).to.equal(5);
			expect(kaidoAssassin.getHP()).to.equal(3);
		});
		it('expect frostfire to give a friendly vespyr +3 attack and +3 health', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var boreanBear = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.BoreanBear}, 7, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PermafrostShield}));
			var action = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(action);
			expect(boreanBear.getATK()).to.equal(4);
			expect(boreanBear.getHP()).to.equal(6);
		});
		it('expect hailstone prison to return a minion to its owners action bar', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var boreanBear = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.BoreanBear}, 7, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.IceCage}));
			var action = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(action);

			var hand = player1.getDeck().getCardsInHand();
			var cardDraw = hand[0];
			expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Faction6.BoreanBear);
		});
		it('expect hailstone prison to exhaust a minion when you replay it', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var boreanBear = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.BoreanBear}, 7, 2, gameSession.getPlayer1Id());
			boreanBear.refreshExhaustion();

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.IceCage}));
			var action = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(action);

			var hand = player1.getDeck().getCardsInHand();
			var cardDraw = hand[0];
			expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Faction6.BoreanBear);

			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			var boreanBear = board.getUnitAtPosition({x: 1, y: 2});
			var action = boreanBear.actionMove({ x: 2, y: 3 });
			gameSession.executeAction(action);

			expect(boreanBear.getPosition().x).to.equal(1);
			expect(boreanBear.getPosition().y).to.equal(2);
		});
		it('expect mark of solitude to ignore damage and buffs and transform a unit into a 5/5', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var kaidoAssassin = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KaidoAssassin}, 7, 2, gameSession.getPlayer1Id());
			kaidoAssassin.setDamage(1);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ElementalFury}));
			var action = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(action);
			expect(kaidoAssassin.getATK()).to.equal(4);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.MarkOfSolitude}));
			var action = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(action);

			expect(kaidoAssassin.getATK()).to.equal(5);
			expect(kaidoAssassin.getHP()).to.equal(5);
		});
		it('expect mark of solitude to make minion unable to attack general', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var kaidoAssassin = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KaidoAssassin}, 7, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.MarkOfSolitude}));
			var action = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(action);

			kaidoAssassin.refreshExhaustion();
			var action = kaidoAssassin.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);

			expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(25);
		});
		it('expect mark of solitude minions to be able to counter attack if a general strikes them', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var kaidoAssassin = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KaidoAssassin}, 7, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.MarkOfSolitude}));
			var action = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(action);

			gameSession.executeAction(gameSession.actionEndTurn());

			var action = gameSession.getGeneralForPlayer2().actionAttack(kaidoAssassin);
			gameSession.executeAction(action);

			expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(20);
			expect(kaidoAssassin.getHP()).to.equal(3);
		});
		it('expect mark of solitude stats to not be diselable (only unable to attack general part)', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var kaidoAssassin = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KaidoAssassin}, 7, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.MarkOfSolitude}));
			var action = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(action);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
			var action = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(action);

			expect(kaidoAssassin.getHP()).to.equal(5);
			expect(kaidoAssassin.getATK()).to.equal(5);
		});
		it('expect blazing spines to create two 3/3 walls', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.BlazingSpines}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 0, 4);
			gameSession.executeAction(followupAction);

			var bcb1 = board.getUnitAtPosition({x:0,y:3});
			var bcb2 = board.getUnitAtPosition({x:0,y:4});

			expect(bcb1.getId()).to.equal(SDK.Cards.Faction6.BlazingSpines);
			expect(bcb2.getId()).to.equal(SDK.Cards.Faction6.BlazingSpines);
			expect(bcb1.getHP()).to.equal(3);
			expect(bcb1.getATK()).to.equal(3);
		});
		it('expect blazing spine walls to disappear if dispeled', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.BlazingSpines}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 0, 4);
			gameSession.executeAction(followupAction);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChromaticCold}));
			var action = player1.actionPlayCardFromHand(0, 0, 3);
			gameSession.executeAction(action);

			var bcb1 = board.getUnitAtPosition({x:0,y:3});

			expect(bcb1).to.equal(undefined);
		});
		it('expect blazing spine walls to not be able to move', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.BlazingSpines}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 0, 4);
			gameSession.executeAction(followupAction);

			var bcb1 = board.getUnitAtPosition({x:0,y:3});
			bcb1.refreshExhaustion();

			var action = bcb1.actionMove({ x: 1, y: 4 });
			gameSession.executeAction(action);
			expect(bcb1.getPosition().x).to.equal(0);
			expect(bcb1.getPosition().y).to.equal(3);
		});
		it('expect cryogenesis to deal 4 damage to an enemy minion and draw a vespyr minion from deck', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var hailstoneGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.HailstoneGolem}, 7, 2, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction6.BoreanBear}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Cryogenesis}));
			var action = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(action);

			expect(hailstoneGolem.getDamage()).to.equal(4);

			var hand = player1.getDeck().getCardsInHand();
			var cardDraw = hand[0];
			expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Faction6.BoreanBear);
		});
		it('expect cryogensis to not draw any minion if you have no vespyrs in deck', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var hailstoneGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.HailstoneGolem}, 7, 2, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.HailstoneGolem}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Cryogenesis}));
			var action = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(action);

			expect(hailstoneGolem.getDamage()).to.equal(4);

			var hand = player1.getDeck().getCardsInHand();
			var cardDraw = hand[0];
			expect(cardDraw).to.equal(undefined);
		});
		it('expect gravity well to summon 4 0/1 walls with provoke', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.GravityWell}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 0, 4);
			gameSession.executeAction(followupAction);
			var followupCard2 = followupAction.getCard().getCurrentFollowupCard();
			var followupAction2 = player1.actionPlayFollowup(followupCard2, 1, 4);
			gameSession.executeAction(followupAction2);
			var followupCard3 = followupAction2.getCard().getCurrentFollowupCard();
			var followupAction3 = player1.actionPlayFollowup(followupCard3, 2, 4);
			gameSession.executeAction(followupAction3);

			var bcb1 = board.getUnitAtPosition({x:0,y:3});
			var bcb2 = board.getUnitAtPosition({x:0,y:4});
			var bcb3 = board.getUnitAtPosition({x:1,y:4});
			var bcb4 = board.getUnitAtPosition({x:2,y:4});

			expect(bcb1.getId()).to.equal(SDK.Cards.Faction6.GravityWell);
			expect(bcb2.getId()).to.equal(SDK.Cards.Faction6.GravityWell);
			expect(bcb3.getId()).to.equal(SDK.Cards.Faction6.GravityWell);
			expect(bcb4.getId()).to.equal(SDK.Cards.Faction6.GravityWell);
			expect(bcb1.getHP()).to.equal(1);
			expect(bcb1.getATK()).to.equal(0);
			expect(bcb1.hasActiveModifierClass(SDK.ModifierProvoke)).to.equal(true);
		});
		it('expect aspect of the drake to turn an enemy minion into a 4/4 with flying', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var hailstoneGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.HailstoneGolem}, 7, 2, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AspectOfTheDrake}));
			var action = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(action);

			var drake = board.getUnitAtPosition({x:7,y:2});

			expect(drake.getId()).to.equal(SDK.Cards.Faction6.AzureDrake);
			expect(drake.getATK()).to.equal(4);
			expect(drake.getHP()).to.equal(4);
		});
		it('expect aspect of the drake to give friendly nearby minions flying', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var hailstoneGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.HailstoneGolem}, 7, 2, gameSession.getPlayer2Id());
			var hailstoneGolem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.HailstoneGolem}, 7, 3, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AspectOfTheDrake}));
			var action = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(action);

			expect(hailstoneGolem2.hasActiveModifierClass(SDK.ModifierFlying)).to.equal(true);
		});
		it('expect avalanche to deal 4 damage to all friendly and enemy minions and generals on your side of map and stun them', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var hailstoneGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.HailstoneGolem}, 1, 2, gameSession.getPlayer2Id());
			var hailstoneGolem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.HailstoneGolem}, 7, 3, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Avalanche}));
			var action = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(action);

			expect(hailstoneGolem.getDamage()).to.equal(4);
			expect(hailstoneGolem.hasActiveModifierClass(SDK.ModifierStunned)).to.equal(true);
			expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(4);
			expect(gameSession.getGeneralForPlayer1().hasActiveModifierClass(SDK.ModifierStunned)).to.equal(true);
			expect(hailstoneGolem2.getDamage()).to.equal(0);
			expect(hailstoneGolem2.hasActiveModifierClass(SDK.ModifierStunned)).to.equal(false);
			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(0);
			expect(gameSession.getGeneralForPlayer2().hasActiveModifierClass(SDK.ModifierStunned)).to.equal(false);
		});
		it('expect spirit of the wild to reactivate exhausted friendly minions only on opponents side of battlefield', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var hailstoneGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.HailstoneGolem}, 1, 2, gameSession.getPlayer1Id());
			var hailstoneGolem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.HailstoneGolem}, 7, 3, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpiritoftheWild}));
			var action = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(action);

			expect(hailstoneGolem.getIsExhausted()).to.equal(true);
			expect(hailstoneGolem2.getIsExhausted()).to.equal(false);
		});
		it('expect aspect of the mountain to transform a minion into a 5/5 and deal 5 damage to all nearby enemy minions', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var hailstoneGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.HailstoneGolem}, 7, 2, gameSession.getPlayer2Id());
			var hailstoneGolem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.HailstoneGolem}, 7, 3, gameSession.getPlayer1Id());
			var hailstoneGolem3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.HailstoneGolem}, 7, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AspectOfTheMountains}));
			var action = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(action);

			expect(hailstoneGolem2.getDamage()).to.equal(0);
			expect(hailstoneGolem3.getDamage()).to.equal(5);

			var elemental = board.getUnitAtPosition({x:7,y:2});

			expect(elemental.getId()).to.equal(SDK.Cards.Faction6.SeismicElemental);
			expect(elemental.getATK()).to.equal(5);
			expect(elemental.getHP()).to.equal(5);
		});
	});  //end Spells describe

});
