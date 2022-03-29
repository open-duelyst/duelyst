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
	describe("faction3", function(){
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

		it('expect zephyr to give your general frenzy until end of turn whenever you activate your bbs', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			// cycle turns until you can use bloodborn spell
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var whiplash = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Zephyr}, 4, 3, gameSession.getPlayer1Id());

			var action = player1.actionPlaySignatureCard(0, 1);
			gameSession.executeAction(action);

			expect(gameSession.getGeneralForPlayer1().hasModifierClass(SDK.ModifierFrenzy)).to.equal(true);
		});
		it('expect divine spark to draw 2 cards', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrinityOath}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrinityOath}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrinityOath}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrinityOath}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrinityOath}));

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.DivineSpark}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 3, 1));

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[1].getId()).to.equal(SDK.Cards.Spell.TrinityOath);
			expect(hand[0].getId()).to.equal(SDK.Cards.Spell.TrinityOath);
			expect(hand[2]).to.not.exist;
		});
		it('expect incinera to allow your general to move 2 additional spaces', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var incinera = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Incinera}, 0, 1, gameSession.getPlayer1Id());

			expect(gameSession.getGeneralForPlayer1().getSpeed()).to.equal(4);
		});
		it('expect stone to spears to give a friendly obelysk +3 attack and movement', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var obelysk = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.BrazierRedSand}, 6, 3, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.StoneToSpears}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 6, 3));

			expect(obelysk.getSpeed()).to.equal(2);
			expect(obelysk.getATK()).to.equal(3);

			obelysk.refreshExhaustion();
			var action = obelysk.actionMove({ x: 8, y: 3 });
			gameSession.executeAction(action);

			expect(obelysk.getPosition().x).to.equal(8);
			expect(obelysk.getPosition().y).to.equal(3);

			var action = obelysk.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);

			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(3);

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(obelysk.getSpeed()).to.equal(0);
			expect(obelysk.getATK()).to.equal(0);
		});
		it('expect autarchs gifts to equip 2 random vetruvian artifacts', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.EquipVetArtifacts}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 6, 3));

			expect(gameSession.getGeneralForPlayer1().getArtifactModifiersGroupedByArtifactCard().length).to.equal(2);
		});
		it('expect grandmaster nosh-rak to make the enemy general take double damage from all sources', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var obelysk = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.BrazierRedSand}, 6, 3, gameSession.getPlayer1Id());
			var noshrak = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.GrandmasterNoshRak}, 8, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.StoneToSpears}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 6, 3));

			noshrak.refreshExhaustion();
			var action = noshrak.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);

			//testing for doubled damage from nosh-rak
			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(8);

			obelysk.refreshExhaustion();
			var action = obelysk.actionMove({ x: 8, y: 3 });
			gameSession.executeAction(action);

			var action = obelysk.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);

			//testing for doubled damage from other minions
			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(14);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 8, 2));

			//testing for doubled spell damage
			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(20);
		});
	});
});
