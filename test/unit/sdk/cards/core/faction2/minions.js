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

describe("faction2", function() {
	describe("minions", function(){
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

		it('expect chakri avatar to gain +1/+1 on every allied spell cast', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var chakriAvatar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.ChakriAvatar}, 0, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(chakriAvatar.getHP()).to.equal(3);
			expect(chakriAvatar.getATK()).to.equal(2);
		});
		it('expect back stab to give bonus damage and not get counter attacked (kaido assassin)', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var kaidoAssassin = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KaidoAssassin}, 1, 1, gameSession.getPlayer1Id());
			var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 0, 1, gameSession.getPlayer2Id());

			kaidoAssassin.refreshExhaustion();
			var action = kaidoAssassin.actionAttack(brightmossGolem);
			gameSession.executeAction(action);

			expect(kaidoAssassin.getHP()).to.equal(3);
			expect(brightmossGolem.getHP()).to.equal(6);
		});
		it('expect tusk boar to return to hand at start of next turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var tuskBoar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.TuskBoar}, 1, 1, gameSession.getPlayer1Id());

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var hand = player1.getDeck().getCardsInHand();
			var cardDraw = hand[0];
			expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Faction2.TuskBoar);
		});
		it('expect celestial phantom to kill any unit it deals damage to', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var celestialPhantom = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.CelestialPhantom}, 1, 1, gameSession.getPlayer1Id());
			var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 0, 1, gameSession.getPlayer2Id());

			celestialPhantom.refreshExhaustion();
			var action = celestialPhantom.actionAttack(brightmossGolem);
			gameSession.executeAction(action);

			expect(celestialPhantom.getHP()).to.equal(1);
			expect(brightmossGolem.getIsRemoved()).to.equal(true);
		});
		it('expect gorehorn to gain +1/+1 on attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var goreHorn = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.GoreHorn}, 1, 1, gameSession.getPlayer1Id());
			var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 0, 1, gameSession.getPlayer2Id());

			goreHorn.refreshExhaustion();
			var action = goreHorn.actionAttack(brightmossGolem);
			gameSession.executeAction(action);

			expect(goreHorn.getHP()).to.equal(4);
			expect(goreHorn.getATK()).to.equal(4);
			expect(brightmossGolem.getHP()).to.equal(4);
		});
		it('expect gorehorn to not gain +1/+1 when counter attacking', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var goreHorn = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.GoreHorn}, 0, 1, gameSession.getPlayer1Id());
			var silverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 1, 1, gameSession.getPlayer2Id());

			gameSession.executeAction(gameSession.actionEndTurn());

			silverguardSquire.refreshExhaustion();
			var action = silverguardSquire.actionAttack(goreHorn);
			gameSession.executeAction(action);

			expect(goreHorn.getHP()).to.equal(2);
			expect(goreHorn.getATK()).to.equal(3);
			expect(silverguardSquire.getHP()).to.equal(1);
		});
		it('expect jade monk to deal 1 damage to random enemy minion upon taking damage', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var jadeOgre = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.JadeOgre}, 0, 1, gameSession.getPlayer2Id());
			var silverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 1, 1, gameSession.getPlayer1Id());
			var silverguardSquire2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 2, 1, gameSession.getPlayer1Id());
			var silverguardSquire3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 3, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.GhostLightning}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.GhostLightning}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.GhostLightning}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));

			var totalDamage = silverguardSquire.getDamage() + silverguardSquire2.getDamage() + silverguardSquire3.getDamage();

			expect(totalDamage).to.equal(3);
			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(0);
		});
		it('expect lantern fox to give a phoenix fire when it takes damage', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var lanternFox = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.LanternFox}, 1, 2, gameSession.getPlayer1Id());
			var hailstoneGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.HailstoneGolem}, 2, 2, gameSession.getPlayer2Id());

			lanternFox.refreshExhaustion();
			var action = lanternFox.actionAttack(hailstoneGolem);
			gameSession.executeAction(action);

			var hand = player1.getDeck().getCardsInHand();
			var cardDraw = hand[0];
			expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
		});
		it('expect four winds magi to deal 1 damage and heal your general for 1 on every allied spell cast', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var fourWindsMagi = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.MageOfFourWinds}, 1, 2, gameSession.getPlayer1Id());

			gameSession.getGeneralForPlayer1().setDamage(2);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.GhostLightning}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));

			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(24);
			expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(24);
		});
		it('expect keshrai fanblade to make opponents spells cost 2 more on next turn only', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();

			player1.remainingMana = 9;

			//var keshraiFanblade = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KeshraiFanblade}, 1, 2, gameSession.getPlayer1Id());
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction2.KeshraiFanblade}));
			var action = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(action);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.Magnetize}));

			gameSession.executeAction(gameSession.actionEndTurn());

			var hand = player2.getDeck().getCardsInHand();
			var cardDraw = hand[0];
			expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.Magnetize)
			expect(cardDraw.getManaCost()).to.equal(3);
		});
		it('expect hamon bladeseeker to deal 2 damage to own general at start of every turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var hamonBladeseeker = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.HamonBlademaster}, 1, 2, gameSession.getPlayer1Id());

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(23);
		});
		it('expect storm kage to give kage lightning on damaging spell cast', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var stormKage = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.StormKage}, 0, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
			gameSession.executeAction(playCardFromHandAction);

			var hand = player1.getDeck().getCardsInHand();
			var cardDraw = hand[0];
			expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.KageLightning);
		});
		it('expect storm kage to not give kage lightning if spell could not cause any damage', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var stormKage = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.StormKage}, 0, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.GhostLightning}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(player1.getDeck().getHand()[0]).to.equal(null);
		});
	});
});
