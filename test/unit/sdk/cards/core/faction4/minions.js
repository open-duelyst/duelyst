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
	describe("minions", function(){
		beforeEach(function () {
			var player1Deck = [
				{id: SDK.Cards.Faction4.General},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction2.General},
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect abyssal crawler to spawn 1 shadow creep nearby at the end of turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var abyssalCrawler1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalCrawler}, 0, 0, gameSession.getPlayer1Id());

			gameSession.executeAction(gameSession.actionEndTurn());

			var shadowCreep1 = board.getTileAtPosition({x:0,y:1},true);
			var shadowCreep2 = board.getTileAtPosition({x:1,y:0},true);
			var shadowCreep3 = board.getTileAtPosition({x:1,y:1},true);

			var creepSpawn = 0;
			if(shadowCreep1 != undefined){
				if(shadowCreep1.getId() == SDK.Cards.Tile.Shadow){
					creepSpawn++;
				}
			}
			if(shadowCreep2 != undefined){
				if(shadowCreep2.getId() == SDK.Cards.Tile.Shadow){
					creepSpawn++;
				}
			}
			if(shadowCreep3 != undefined){
				if(shadowCreep3.getId() == SDK.Cards.Tile.Shadow){
					creepSpawn++;
				}
			}

			expect(creepSpawn).to.equal(1);
		});
		it('expect blood siren to give a nearby enemy minion -2 attack until end of turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var youngSilithar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.YoungSilithar}, 0, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.DarkSiren}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 0, 1);
			gameSession.executeAction(followupAction);

			expect(youngSilithar.getATK()).to.equal(0);

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(youngSilithar.getATK()).to.equal(2);
		});
		it('expect darkspine elemental to double the damage of friendly shadow creep on board', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();

			gameSession.executeAction(gameSession.actionEndTurn());

			var darkspineElemental = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.DarkspineElemental}, 5, 2, gameSession.getPlayer2Id());

			player2.remainingMana = 9;
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.ShadowNova}));
			var playCardFromHandAction = player2.actionPlayCardFromHand(0, 0, 2);
			gameSession.executeAction(playCardFromHandAction);

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(2);

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ShadowNova}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(playCardFromHandAction);

			var darkspineElemental2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.DarkspineElemental}, 4, 1, gameSession.getPlayer1Id());
			var darkspineElemental3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.DarkspineElemental}, 3, 1, gameSession.getPlayer1Id());

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(4);
		});
		it('expect gloomchaser to summon 1/1 wraithling on random nearby space', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.GloomChaser}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			var wraithlingx = 0;
			var wraithlingy = 0;

			for (var xx = 0; xx < 10; xx++) {
				for (var yy = 0; yy < 5; yy++) {
					var wraithling = board.getUnitAtPosition({x: xx, y: yy});
					if (wraithling != null && wraithling.getId() === SDK.Cards.Faction4.Wraithling) {
						wraithlingx = xx;
						wraithlingy = yy;
						break;
					}
				}
			}

			var wraithling = board.getUnitAtPosition({x: wraithlingx, y: wraithlingy});

			expect(wraithling.getHP()).to.equal(1);
			expect(wraithling.getATK()).to.equal(1);
		});
		it('expect nightsorrow assassin to destroy nearby minion with 2 or less attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var windblade = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.WindbladeAdept}, 1, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.NightsorrowAssassin}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 1, 1);
			gameSession.executeAction(followupAction);

			expect(windblade.getIsRemoved()).to.equal(true);
		});
		it('expect nightsorrow assassin to not be able to target minions with more than 2 attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var knight = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.IroncliffeGuardian}, 1, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.NightsorrowAssassin}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();

			expect(followupCard).to.equal(null);

			expect(knight.getIsRemoved()).to.equal(false);
		});
		it('expect shadowwatcher to gain +1/+1 on every allied or enemy minion death', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var shadowwatcher = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 3, 1, gameSession.getPlayer1Id());
			var youngSilithar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.YoungSilithar}, 0, 1, gameSession.getPlayer2Id());
			var abyssalCrawler1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalCrawler}, 1, 1, gameSession.getPlayer1Id());
			abyssalCrawler1.refreshExhaustion();

			youngSilithar.setDamage(2);

			var action = abyssalCrawler1.actionAttack(youngSilithar);
			gameSession.executeAction(action);

			expect(shadowwatcher.getATK()).to.equal(4);
			expect(shadowwatcher.getHP()).to.equal(4);
		});
		it('expect abyssal juggernaut to gain and lose +1/+1 for each friendly shadow creep on board', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();

			gameSession.executeAction(gameSession.actionEndTurn());

			var abyssalJuggernaut = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalJuggernaut}, 5, 2, gameSession.getPlayer2Id());
			expect(abyssalJuggernaut.getHP()).to.equal(3);
			expect(abyssalJuggernaut.getATK()).to.equal(3);

			player2.remainingMana = 9;
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.ShadowNova}));
			var playCardFromHandAction = player2.actionPlayCardFromHand(0, 0, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(abyssalJuggernaut.getHP()).to.equal(7);
			expect(abyssalJuggernaut.getATK()).to.equal(7);

			gameSession.executeAction(gameSession.actionEndTurn());

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SunBloom}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(abyssalJuggernaut.getHP()).to.equal(3);
			expect(abyssalJuggernaut.getATK()).to.equal(3);
		});
		it('expect bloodmoon priestess to summon 1/1 wraithling nearby whenever a friendly or enemy minion dies', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var bloodmoonPriestess = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.BloodmoonPriestess}, 6, 1, gameSession.getPlayer1Id());
			var youngSilithar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.YoungSilithar}, 0, 1, gameSession.getPlayer2Id());
			var abyssalCrawler1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalCrawler}, 1, 1, gameSession.getPlayer1Id());
			abyssalCrawler1.refreshExhaustion();

			youngSilithar.setDamage(2);

			var action = abyssalCrawler1.actionAttack(youngSilithar);
			gameSession.executeAction(action);

			var wraithlingx = 0;
			var wraithlingy = 0;
			var wraithlingCount = 0;

			for (var xx = 0; xx < 10; xx++) {
				for (var yy = 0; yy < 5; yy++) {
					var wraithling = board.getUnitAtPosition({x: xx, y: yy});
					if (wraithling != null && wraithling.getId() === SDK.Cards.Faction4.Wraithling) {
						wraithlingx = xx;
						wraithlingy = yy;
						wraithlingCount = wraithlingCount + 1;
					}
				}
			}

			expect(wraithlingCount).to.equal(2);
		});
		it('expect deepfire devourer to destroy all nearby friendly minions and gain +2/+2 for each minion destroyed', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var youngSilithar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.YoungSilithar}, 0, 1, gameSession.getPlayer2Id());
			var abyssalCrawler1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalCrawler}, 1, 1, gameSession.getPlayer1Id());
			var abyssalCrawler3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalCrawler}, 1, 3, gameSession.getPlayer1Id());
			var abyssalCrawler4 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalCrawler}, 0, 3, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.DeepfireDevourer}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			var deepfireDevourer = board.getUnitAtPosition({x: 1, y: 2});

			expect(deepfireDevourer.getHP()).to.equal(10);
			expect(deepfireDevourer.getATK()).to.equal(10);
		});
		it('expect black solus to gain +2 attack when you summon a wraithling', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var blackSolus = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.BlackSolus}, 1, 1, gameSession.getPlayer1Id())

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
			expect(blackSolus.getHP()).to.equal(7);
			expect(blackSolus.getATK()).to.equal(10);
		});
		it('expect reaper of the nine moons to be replaced by a random enemy minion in opponents deck when dying', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Faction5.SilitharElder}));

			var unstableLeviathan = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.UnstableLeviathan}, 0, 1, gameSession.getPlayer2Id());
			var reaper = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ReaperNineMoons}, 1, 1, gameSession.getPlayer1Id());
			reaper.refreshExhaustion();

			var action = reaper.actionAttack(unstableLeviathan);
			gameSession.executeAction(action);

			var silitharElder = board.getUnitAtPosition({x: 1, y: 1});
			expect(silitharElder.getId()).to.equal(SDK.Cards.Faction5.SilitharElder);
			expect(silitharElder.getOwnerId()).to.equal(gameSession.getPlayer1Id());
		});
		it('expect repear of the nine moons to do nothing when dying if there are no minions left in enemy deck', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var unstableLeviathan = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.UnstableLeviathan}, 0, 1, gameSession.getPlayer2Id());
			var reaper = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ReaperNineMoons}, 1, 1, gameSession.getPlayer1Id());
			reaper.refreshExhaustion();

			var action = reaper.actionAttack(unstableLeviathan);
			gameSession.executeAction(action);

			var silitharElder = board.getUnitAtPosition({x: 1, y: 1});
			expect(silitharElder).to.equal(undefined);
		});
		it('expect shadow dancer to deal 1 damage to enemy general and heal allied general 1 every time an enemy or friendly minion dies', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var shadowDancer = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.SharianShadowdancer}, 3, 1, gameSession.getPlayer1Id());
			var youngSilithar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.YoungSilithar}, 0, 1, gameSession.getPlayer2Id());
			var abyssalCrawler1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.AbyssalCrawler}, 1, 1, gameSession.getPlayer1Id());
			abyssalCrawler1.refreshExhaustion();

			youngSilithar.setDamage(2);
			gameSession.getGeneralForPlayer1().setDamage(5);

			var action = abyssalCrawler1.actionAttack(youngSilithar);
			gameSession.executeAction(action);

			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(22);
			expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(23);
		});
		it('expect vorpal reaver to summon six 1/1 wraithlings in random spaces when killed', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var unstableLeviathan = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.UnstableLeviathan}, 0, 1, gameSession.getPlayer2Id());
			var reaver = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.VorpalReaver}, 1, 1, gameSession.getPlayer1Id());
			reaver.refreshExhaustion();

			var action = reaver.actionAttack(unstableLeviathan);
			gameSession.executeAction(action);

			var wraithlingx = 0;
			var wraithlingy = 0;
			var wraithlingCount = 0;

			for (var xx = 0; xx < 10; xx++) {
				for (var yy = 0; yy < 5; yy++) {
					var wraithling = board.getUnitAtPosition({x: xx, y: yy});
					if (wraithling != null && wraithling.getId() === SDK.Cards.Faction4.Wraithling) {
						wraithlingx = xx;
						wraithlingy = yy;
						wraithlingCount = wraithlingCount + 1;
					}
				}
			}

			expect(wraithlingCount).to.equal(6);
		});
		it('expect spectral revenant to deal 4 damage to enemy general when attacking an enemy minion', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var unstableLeviathan = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.UnstableLeviathan}, 0, 1, gameSession.getPlayer2Id());
			var revenant = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.SpectralRevenant}, 1, 1, gameSession.getPlayer1Id());
			revenant.refreshExhaustion();

			var action = revenant.actionAttack(unstableLeviathan);
			gameSession.executeAction(action);

			expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(21);
		});

	});
});
