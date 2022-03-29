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
	describe("faction5", function(){
		beforeEach(function () {
			var player1Deck = [
				{id: SDK.Cards.Faction5.General},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction5.AltGeneral},
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect thraex to give all friendly minions +1 attack whenever you use your BBS', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			// cycle turns until you can use bloodborn spell
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var wraithling = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Wraithling}, 6, 1, gameSession.getPlayer1Id());
			var thraex = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Thraex}, 4, 3, gameSession.getPlayer1Id());

			var action = player1.actionPlaySignatureCard(1, 1);
			gameSession.executeAction(action);

			expect(wraithling.getATK()).to.equal(2);
			expect(thraex.getATK()).to.equal(3);
			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(3);
		});
		it('expect entropic gaze to draw both generals a card and deal 4 damage to the enemy general', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrinityOath}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrinityOath}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.TrinityOath}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.TrinityOath}));

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.EntropicGaze}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 3, 1));

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0].getId()).to.equal(SDK.Cards.Spell.TrinityOath);
			expect(hand[1]).to.not.exist;

			var hand2 = player2.getDeck().getCardsInHand();
			expect(hand2[0].getId()).to.equal(SDK.Cards.Spell.TrinityOath);
			expect(hand2[1]).to.not.exist;

			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(2);
		});
		it('expect entropic gaze to only damage generals', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var rancour = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Rancour}, 4, 3, gameSession.getPlayer1Id());
			var rancour2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Rancour}, 2, 3, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.EntropicGaze}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 3, 1));

			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(2);
			expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(0);
			expect(rancour.getDamage()).to.equal(0);
			expect(rancour2.getDamage()).to.equal(0);
		});
		it('expect rancour to gain attack equal to damage he takes', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var rancour = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Rancour}, 4, 3, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Tempest}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 3, 1));

			expect(rancour.getATK()).to.equal(3);
		});
		it('expect tectonic spikes to draw both generals 3 cards and deal 3 damage to both generals', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrinityOath}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrinityOath}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrinityOath}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrinityOath}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.TrinityOath}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.TrinityOath}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.TrinityOath}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.TrinityOath}));

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TectonicSpikes}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 3, 1));

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0].getId()).to.equal(SDK.Cards.Spell.TrinityOath);
			expect(hand[1].getId()).to.equal(SDK.Cards.Spell.TrinityOath);
			expect(hand[2].getId()).to.equal(SDK.Cards.Spell.TrinityOath);
			expect(hand[3]).to.not.exist;

			var hand2 = player2.getDeck().getCardsInHand();
			expect(hand2[0].getId()).to.equal(SDK.Cards.Spell.TrinityOath);
			expect(hand2[1].getId()).to.equal(SDK.Cards.Spell.TrinityOath);
			expect(hand2[2].getId()).to.equal(SDK.Cards.Spell.TrinityOath);
			expect(hand2[3]).to.not.exist;

			expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(3);
			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(3);
		});
		it('expect valknus seal to summon an egg that hatches into your general', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ValknusSeal}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var clone = board.getUnitAtPosition({x: 1, y:1});

			expect(clone.getHP()).to.equal(25);
			expect(clone.getATK()).to.equal(2);
		});
		it('expect valknus seal to copy buffs', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var general = gameSession.getGeneralForPlayer(player1);

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var action = player1.actionPlaySignatureCard(1, 1);
			gameSession.executeAction(action);

			expect(general.getATK()).to.equal(3)

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ValknusSeal}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var clone = board.getUnitAtPosition({x: 1, y:1});

			expect(clone.getHP()).to.equal(25);
			expect(clone.getATK()).to.equal(3);
		});
		it('expect valknus seal to copy artifact effects', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.PristineScale}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.AdamantineClaws}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			expect(gameSession.getGeneralForPlayer1().hasModifierClass(SDK.ModifierFrenzy)).to.equal(true);

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ValknusSeal}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var clone = board.getUnitAtPosition({x: 1, y:1});

			expect(clone.getHP()).to.equal(25);
			expect(clone.getATK()).to.equal(6);
			expect(clone.hasModifierClass(SDK.ModifierFrenzy)).to.equal(true);
		});
		it('expect valknus seal to not copy buffs granted by auras (ex: elyx stormblade)', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var elyxStormblade = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.ElyxStormblade}, 4, 3, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ValknusSeal}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var clone = board.getUnitAtPosition({x: 1, y:1});

			expect(clone.getSpeed()).to.equal(3);
			expect(gameSession.getGeneralForPlayer1().getSpeed()).to.equal(3);

			var damageAction = new SDK.DamageAction(gameSession);
			damageAction.setTarget(elyxStormblade);
			damageAction.setDamageAmount(elyxStormblade.getHP());
			UtilsSDK.executeActionWithoutValidation(damageAction);

			expect(gameSession.getGeneralForPlayer1().getSpeed()).to.equal(2);
			expect(clone.getSpeed()).to.equal(2);
		});
		it('expect valknus seal to copy buffs granted by non-auras (ex: grove lion)', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var groveLion = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.GroveLion}, 4, 3, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ValknusSeal}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var clone = board.getUnitAtPosition({x: 1, y:1});

			expect(gameSession.getGeneralForPlayer1().hasActiveModifierClass(ModifierForcefield)).to.equal(true);
			expect(clone.hasActiveModifierClass(ModifierForcefield)).to.equal(true);

			var damageAction = new SDK.DamageAction(gameSession);
			damageAction.setTarget(groveLion);
			damageAction.setDamageAmount(groveLion.getHP());
			UtilsSDK.executeActionWithoutValidation(damageAction);
			var damageAction = new SDK.DamageAction(gameSession);
			damageAction.setTarget(groveLion);
			damageAction.setDamageAmount(groveLion.getHP());
			UtilsSDK.executeActionWithoutValidation(damageAction);

			expect(clone.hasActiveModifierClass(ModifierForcefield)).to.equal(true);
			expect(gameSession.getGeneralForPlayer1().hasActiveModifierClass(ModifierForcefield)).to.equal(false);
		});
		it('expect valknus seals max HP to equal your generals current HP', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var damageAction = new SDK.DamageAction(gameSession);
			damageAction.setTarget(gameSession.getGeneralForPlayer1());
			damageAction.setDamageAmount(10);
			UtilsSDK.executeActionWithoutValidation(damageAction);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ValknusSeal}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var clone = board.getUnitAtPosition({x: 1, y:1});

			expect(clone.getHP()).to.equal(15);
			expect(clone.getATK()).to.equal(2);

			clone.setDamage(2);

			expect(clone.getHP()).to.equal(13);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SundropElixir}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			expect(clone.getHP()).to.equal(15);
		});
		it('expect drogon to double your generals attack this turn whenever you use your bbs', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var drogon = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Drogon}, 4, 3, gameSession.getPlayer1Id());

			var action = player1.actionPlaySignatureCard(1, 1);
			gameSession.executeAction(action);

			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(6);

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(3);
		});
	});
});
