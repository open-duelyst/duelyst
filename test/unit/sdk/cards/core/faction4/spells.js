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

describe("faction4", function() {
	describe("spells", function(){

		beforeEach(function () {
			// define test decks.  Spells do not work.  Only add minions and generals this way
			var player1Deck = [
				{id: SDK.Cards.Faction4.General},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction4.General},
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

		it('expect darkfire sacrifice to kill a friendly minion and reduce next minion summon by 2 mana', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var abyssalCrawler1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalCrawler}, 1, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.DarkSacrifice}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.SpectralRevenant}));
			var hand = player1.getDeck().getCardsInHand();
			var cardDraw = hand[0];
			expect(abyssalCrawler1.getIsRemoved()).to.equal(true);
			expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Faction4.SpectralRevenant);
			expect(cardDraw.getManaCost()).to.equal(6);
		});
		it('expect darkfire sacrifice mana reduction to continue onto next turn if no minion summoned', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var abyssalCrawler1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalCrawler}, 1, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.DarkSacrifice}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.SpectralRevenant}));

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var hand = player1.getDeck().getCardsInHand();
			var cardDraw = hand[0];
			expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Faction4.SpectralRevenant);
			expect(cardDraw.getManaCost()).to.equal(6);
		});
		it('expect grasp of agony to deal 3 damage to all nearby enemies when unit dies', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var abyssalCrawler1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalCrawler}, 1, 1, gameSession.getPlayer2Id());
			var bloodshardGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BloodshardGolem}, 1, 2, gameSession.getPlayer2Id());
			var bloodshardGolem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BloodshardGolem}, 2, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.CurseOfAgony}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			var action = gameSession.getGeneralForPlayer1().actionAttack(abyssalCrawler1);
			gameSession.executeAction(action);

			expect(abyssalCrawler1.getIsRemoved()).to.equal(true);
			expect(bloodshardGolem.getIsRemoved()).to.equal(true);
			expect(bloodshardGolem2.getIsRemoved()).to.equal(true);
		});
		it('expect grasp of agony to work when combined with ritual banishing', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var abyssalCrawler2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalCrawler}, 3, 1, gameSession.getPlayer1Id());
			var abyssalCrawler1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalCrawler}, 1, 1, gameSession.getPlayer2Id());
			var bloodshardGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BloodshardGolem}, 1, 2, gameSession.getPlayer2Id());
			var bloodshardGolem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BloodshardGolem}, 2, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.CurseOfAgony}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.RitualBanishing}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 1, 1);
			gameSession.executeAction(followupAction);

			var action = gameSession.getGeneralForPlayer1().actionAttack(abyssalCrawler1);
			gameSession.executeAction(action);

			expect(abyssalCrawler2.getIsRemoved()).to.equal(true);
			expect(abyssalCrawler1.getIsRemoved()).to.equal(true);
			expect(bloodshardGolem.getIsRemoved()).to.equal(true);
			expect(bloodshardGolem2.getIsRemoved()).to.equal(true);
		});
		it('expect void pulse to deal 2 damage to enemy general and restore 3 health to own general', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			gameSession.getGeneralForPlayer1().setDamage(5);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.VoidPulse}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(23);
			expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(23);
		});
		it('expect consuming rebirth to destroy a friendly minion and revive it at end of turn on same space with +1/+1', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var abyssalCrawler1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalCrawler}, 1, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ConsumingRebirth}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(abyssalCrawler1.getIsRemoved()).to.equal(true);

			gameSession.executeAction(gameSession.actionEndTurn());

			var abyssalCrawler2 = board.getUnitAtPosition({x: 1, y: 1});

			expect(abyssalCrawler2.getHP()).to.equal(2);
			expect(abyssalCrawler2.getATK()).to.equal(3);
		});
		it('expect daemonic lure to deal 1 damage to enemy minion and teleport unit far away', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var abyssalJuggernaut = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalJuggernaut}, 1, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.DaemonicLure}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 7, 4);
			gameSession.executeAction(followupAction);

			expect(abyssalJuggernaut.getDamage()).to.equal(1);
			expect(abyssalJuggernaut.getPosition().x).to.equal(7);
			expect(abyssalJuggernaut.getPosition().y).to.equal(4);
		});
		it('expect soulshatter pact to give friendly minions +2 attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 1, 1, gameSession.getPlayer1Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 2, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SoulshatterPact}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(golem1.getATK()).to.equal(6);
			expect(golem2.getATK()).to.equal(6);
		});
		it('expect deathfire crescendo to give friendly minion +2/+2 any time a friendly or enemy minion dies', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var abyssalCrawler = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalCrawler}, 3, 1, gameSession.getPlayer1Id());
			var youngSilithar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.YoungSilithar}, 0, 1, gameSession.getPlayer2Id());
			var abyssalCrawler1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalCrawler}, 1, 1, gameSession.getPlayer1Id());
			abyssalCrawler1.refreshExhaustion();

			youngSilithar.setDamage(2);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.DeathfireCrescendo}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 1);
			gameSession.executeAction(playCardFromHandAction);

			var action = abyssalCrawler1.actionAttack(youngSilithar);
			gameSession.executeAction(action);

			expect(abyssalCrawler.getATK()).to.equal(6);
			expect(abyssalCrawler.getHP()).to.equal(5);
		});
		it('expect rite of the undervault to refill your hand', function() {
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

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.RiteOfTheUndervault}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 1);
			gameSession.executeAction(playCardFromHandAction);

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[5].getBaseCardId()).to.equal(SDK.Cards.Spell.InnerFocus);
		});
		it('expect ritual banishing to destroy one of your minions and destroy an enemy minion', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var abyssalCrawler1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalCrawler}, 1, 1, gameSession.getPlayer1Id());
			var unstableLeviathan = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.UnstableLeviathan}, 5, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.RitualBanishing}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 5, 1);
			gameSession.executeAction(followupAction);

			expect(abyssalCrawler1.getIsRemoved()).to.equal(true);
			expect(unstableLeviathan.getIsRemoved()).to.equal(true);
		});
		it('expect shadow reflection to give a unit +5 attack buff', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var abyssalCrawler1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalCrawler}, 1, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ShadowReflection}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(abyssalCrawler1.getATK()).to.equal(7);
		});
		it('expect wraithling fury to give a wraithling +4/+4', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var wraithling = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Wraithling}, 1, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AbyssianStrength}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(wraithling.getATK()).to.equal(5);
			expect(wraithling.getHP()).to.equal(5);
		});
		it('expect wraithling fury can only be cast on wraithlings', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var wraithling = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Wraithling}, 1, 1, gameSession.getPlayer1Id());
			var abyssalCrawler1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalCrawler}, 2, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AbyssianStrength}));

			var hand = player1.getDeck().getCardsInHand();
			var wraithlingFury = hand[0];
			var validTargetPositions = wraithlingFury.getValidTargetPositions();

			expect(validTargetPositions[0]).to.exist;
			expect(validTargetPositions[0].x === 1 && validTargetPositions[0].y === 1).to.equal(true);
			expect(validTargetPositions[1]).to.not.exist;
		});
		it('expect wraithling swarm to summon 3 1/1 wraithlings', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.WraithlingSwarm}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 0, 4);
			gameSession.executeAction(followupAction);
			var followupCard2 = followupAction.getCard().getCurrentFollowupCard();
			var followupAction2 = player1.actionPlayFollowup(followupCard2, 1, 4);
			gameSession.executeAction(followupAction2);

			var wraithling1 = board.getUnitAtPosition({x: 0, y: 3});
			var wraithling2 = board.getUnitAtPosition({x: 0, y: 4});
			var wraithling3 = board.getUnitAtPosition({x: 1, y: 4});

			expect(wraithling1.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
			expect(wraithling2.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
			expect(wraithling3.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
		});
		it('expect wraithling swarm can be skipped midway through follow up to only summon 1 wraithling', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.WraithlingSwarm}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
			gameSession.executeAction(playCardFromHandAction);
			var endFollowup = player1.actionEndFollowup();
			gameSession.executeAction(endFollowup);

			var wraithling1 = board.getUnitAtPosition({x: 0, y: 3});

			expect(wraithling1.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
			expect(gameSession.getIsFollowupActive()).to.equal(false);
		});
		it('expect breath of the unborn to deal 2 damage to all enemy minions and restore all friendly minions to full health', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();

			player1.remainingMana = 9;

			var kaidoAssassin = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KaidoAssassin}, 5, 1, gameSession.getPlayer2Id());
			var kaidoAssassin2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KaidoAssassin}, 6, 1, gameSession.getPlayer1Id());

			kaidoAssassin2.setDamage(2);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.BreathOfTheUnborn}));
			var action = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(action);

			expect(kaidoAssassin2.getHP()).to.equal(3);
			expect(kaidoAssassin.getHP()).to.equal(1);
		});
		it('expect dark seed to deal 1 damage to the enemy general for each card in their hand', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.DarkSeed}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.DarkSeed}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.DarkSeed}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.DarkSeed}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.DarkSeed}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.DarkSeed}));

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.DarkSeed}));
			var action = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(action);

			expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(19);
		});
		it('expect dark transformation to destroy an enemy minion and leave 1/1 wraithling in place', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();

			player1.remainingMana = 9;

			var kaidoAssassin = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KaidoAssassin}, 5, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.DarkTransformation}));
			var action = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(action);

			var wraithling = board.getUnitAtPosition({x:5,y:1});

			expect(kaidoAssassin.getIsRemoved()).to.equal(true);
			expect(wraithling.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
		});
		it('expect dark transformation to override magmar rebirth eggs', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();

			player1.remainingMana = 9;

			var youngSilithar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.YoungSilithar}, 5, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.DarkTransformation}));
			var action = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(action);

			var wraithling = board.getUnitAtPosition({x:5,y:1});

			expect(youngSilithar.getIsRemoved()).to.equal(true);
			expect(wraithling.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
		});
		it('expect nether summoning to summon 2 enemy minions that opponent suicided during his turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();

			var rustCrawler = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BluetipScorpion}, 0, 1, gameSession.getPlayer2Id());
			var repulsorBeast = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.RepulsionBeast}, 1, 1, gameSession.getPlayer2Id());

			gameSession.executeAction(gameSession.actionEndTurn());

			var action = rustCrawler.actionAttack(gameSession.getGeneralForPlayer1());
			gameSession.executeAction(action);
			var action = repulsorBeast.actionAttack(gameSession.getGeneralForPlayer1());
			gameSession.executeAction(action);

			gameSession.executeAction(gameSession.actionEndTurn());

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.NetherSummoning}));
			var action = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(action);

			var rustCrawlerx = 0;
			var rustCrawlery = 0;
			var repulsorBeastx = 0;
			var repulsorBeasty = 0;

			for (var xx = 0; xx < 10; xx++) {
				for (var yy = 0; yy < 5; yy++) {
					var unit = board.getUnitAtPosition({x: xx, y: yy});
					if (unit != null && unit.getId() === SDK.Cards.Neutral.BluetipScorpion) {
						rustCrawlerx = xx;
						rustCrawlery = yy;
					}
					if (unit != null && unit.getId() === SDK.Cards.Neutral.RepulsionBeast) {
						repulsorBeastx = xx;
						repulsorBeasty = yy;
					}
				}
			}

			var rustCrawler = board.getUnitAtPosition({x: rustCrawlerx, y: rustCrawlery});
			var repulsorBeast = board.getUnitAtPosition({x: repulsorBeastx, y: repulsorBeasty});

			expect(rustCrawler.getOwnerId()).to.equal(gameSession.getPlayer1Id());
			expect(repulsorBeast.getOwnerId()).to.equal(gameSession.getPlayer1Id());
		});
		it('expect nether summoning to summon 2 friendly minions that opponent killed during his turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();

			var rustCrawler = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BluetipScorpion}, 0, 1, gameSession.getPlayer1Id());
			var repulsorBeast = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.RepulsionBeast}, 1, 1, gameSession.getPlayer1Id());

			gameSession.executeAction(gameSession.actionEndTurn());

			player2.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.GhostLightning}));
			var action = player2.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(action);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.GhostLightning}));
			var action = player2.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(action);

			gameSession.executeAction(gameSession.actionEndTurn());

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.NetherSummoning}));
			var action = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(action);

			var rustCrawlerx = 0;
			var rustCrawlery = 0;
			var repulsorBeastx = 0;
			var repulsorBeasty = 0;

			for (var xx = 0; xx < 10; xx++) {
				for (var yy = 0; yy < 5; yy++) {
					var unit = board.getUnitAtPosition({x: xx, y: yy});
					if (unit != null && unit.getId() === SDK.Cards.Neutral.BluetipScorpion) {
						rustCrawlerx = xx;
						rustCrawlery = yy;
					}
					if (unit != null && unit.getId() === SDK.Cards.Neutral.RepulsionBeast) {
						repulsorBeastx = xx;
						repulsorBeasty = yy;
					}
				}
			}

			var rustCrawler = board.getUnitAtPosition({x: rustCrawlerx, y: rustCrawlery});
			var repulsorBeast = board.getUnitAtPosition({x: repulsorBeastx, y: repulsorBeasty});

			expect(rustCrawler.getOwnerId()).to.equal(gameSession.getPlayer1Id());
			expect(repulsorBeast.getOwnerId()).to.equal(gameSession.getPlayer1Id());
		});
		it('expect nether summoning to not summon anything if no minions died on opponents last turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();

			var rustCrawler = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BluetipScorpion}, 0, 1, gameSession.getPlayer1Id());
			var repulsorBeast = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.RepulsionBeast}, 1, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Tempest}));
			var action = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(action);

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.NetherSummoning}));
			var action = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(action);

			var rustCrawlerx = 0;
			var rustCrawlery = 0;
			var repulsorBeastx = 0;
			var repulsorBeasty = 0;

			for (var xx = 0; xx < 10; xx++) {
				for (var yy = 0; yy < 5; yy++) {
					var unit = board.getUnitAtPosition({x: xx, y: yy});
					if (unit != null && unit.getId() === SDK.Cards.Neutral.BluetipScorpion) {
						rustCrawlerx = xx;
						rustCrawlery = yy;
					}
					if (unit != null && unit.getId() === SDK.Cards.Neutral.RepulsionBeast) {
						repulsorBeastx = xx;
						repulsorBeasty = yy;
					}
				}
			}

			var rustCrawler = board.getUnitAtPosition({x: rustCrawlerx, y: rustCrawlery});
			var repulsorBeast = board.getUnitAtPosition({x: repulsorBeastx, y: repulsorBeasty});

			expect(rustCrawler).to.equal(undefined);
			expect(repulsorBeast).to.equal(undefined);
		});
		it('expect nether summoning to not summon tokens', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();

			var wraithling = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Wraithling}, 0, 1, gameSession.getPlayer1Id());

			gameSession.executeAction(gameSession.actionEndTurn());

			player2.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.GhostLightning}));
			var action = player2.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(action);

			gameSession.executeAction(gameSession.actionEndTurn());

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.NetherSummoning}));
			var action = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(action);

			var wraithlingx = 0;
			var wraithlingy = 0;

			for (var xx = 0; xx < 10; xx++) {
				for (var yy = 0; yy < 5; yy++) {
					var unit = board.getUnitAtPosition({x: xx, y: yy});
					if (unit != null && unit.getId() === SDK.Cards.Faction4.Wraithling) {
						wraithlingx = xx;
						wraithlingy = yy;
					}
				}
			}

			var wraithling = board.getUnitAtPosition({x: wraithlingx, y: wraithlingy});

			expect(wraithling).to.equal(undefined);
		});
		it('expect shadow nova to create 2x2 shadow creep grid', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ShadowNova}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 0);
			gameSession.executeAction(playCardFromHandAction);

			var shadowCreep1 = board.getTileAtPosition({x:0,y:0},true);
			var shadowCreep2 = board.getTileAtPosition({x:1,y:0},true);
			var shadowCreep3 = board.getTileAtPosition({x:0,y:1},true);
			var shadowCreep4 = board.getTileAtPosition({x:1,y:1},true);

			expect(shadowCreep1.getOwnerId()).to.equal(player1.getPlayerId());
			expect(shadowCreep1.getId()).to.equal(SDK.Cards.Tile.Shadow);
			expect(shadowCreep2.getId()).to.equal(SDK.Cards.Tile.Shadow);
			expect(shadowCreep3.getId()).to.equal(SDK.Cards.Tile.Shadow);
			expect(shadowCreep4.getId()).to.equal(SDK.Cards.Tile.Shadow);
		});
		it('expect shadow creep to deal 1 damage at end of turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();

			gameSession.executeAction(gameSession.actionEndTurn());

			player2.remainingMana = 9;
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.ShadowNova}));
			var playCardFromHandAction = player2.actionPlayCardFromHand(0, 0, 0);
			gameSession.executeAction(playCardFromHandAction);
			player2.remainingMana = 9;
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.ShadowNova}));
			var playCardFromHandAction = player2.actionPlayCardFromHand(0, 2, 0);
			gameSession.executeAction(playCardFromHandAction);

			gameSession.executeAction(gameSession.actionEndTurn());

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ShadowNova}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(playCardFromHandAction);

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(24);
		});
	});  //end Spells describe

});
