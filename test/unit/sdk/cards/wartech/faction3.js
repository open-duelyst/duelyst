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
var ModifierTranscendance = require('app/sdk/modifiers/modifierTranscendance');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("wartech", function() {
	describe("faction3", function(){
		beforeEach(function () {
			var player1Deck = [
				{id: SDK.Cards.Faction3.AltGeneral},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction1.General},
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect skyppy to put a random legendary artifact from your opponents Faction into your action bar on death', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var skyppy = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Skyppy}, 5, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(playCardFromHandAction1);

			var hand1 = player1.getDeck().getCardsInHand();
			expect(hand1[0].factionId).to.equal(1);
			expect(hand1[0].rarityId).to.equal(4);
			expect(hand1[0].type).to.equal(SDK.CardType.Artifact);
		});
		it('expect barren shrike to build after 2 turns but stay a 0/10 structure until it finishes', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction3.BarrenShrike}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction1);

			var barrenShrike = board.getUnitAtPosition({x:1,y:1});

			expect(barrenShrike.getHP()).to.equal(10);
			expect(barrenShrike.getATK()).to.equal(0);

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			expect(barrenShrike.getHP()).to.equal(10);
			expect(barrenShrike.getATK()).to.equal(0);

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var barrenShrike = board.getUnitAtPosition({x:1,y:1});
			expect(barrenShrike.getHP()).to.equal(5);
			expect(barrenShrike.getATK()).to.equal(5);
		});
		it('expect equality constraint to set a minions health to equal their attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var pyromancer = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 5, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.EqualityConstraint}));
			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(playCardFromHandAction1);

			expect(pyromancer.getHP()).to.equal(2);
			expect(pyromancer.getATK()).to.equal(2);
		});
		it('expect burden of knowledge to draw you a card and take 3 damage', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;


			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.BurdenOfKnowledge}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.BurdenOfKnowledge}));

			var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(playCardFromHandAction1);

			var hand1 = player1.getDeck().getCardsInHand();
			expect(hand1[0].getId()).to.equal(SDK.Cards.Spell.BurdenOfKnowledge);
			expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(3);
		});
		it('expect silica weaver to increase mechaz0r progress by 40%', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction3.SilicaWeaver}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			player1.remainingMana = 9;
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Mechaz0rHelm}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 1);
			gameSession.executeAction(playCardFromHandAction);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Mechaz0rHelm}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 1);
			gameSession.executeAction(playCardFromHandAction);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Mechaz0rHelm}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 4, 1);
			gameSession.executeAction(playCardFromHandAction);
			expect(playCardFromHandAction.getIsValid()).to.equal(true);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 6, 3);
			gameSession.executeAction(followupAction);
			var mechaz0r = board.getUnitAtPosition({x:6,y:3});

			expect(mechaz0r.getId()).to.equal(SDK.Cards.Neutral.Mechaz0r);
		});
		it('expect kinematic projection to give a minion blast but reduce movement to 0', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.SaberspineTiger}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);
			player1.remainingMana = 9;
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.KinematicProjection}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			var tiger = board.getUnitAtPosition({x:1,y:2});
			var action = tiger.actionMove({ x: 2, y: 1 });
			gameSession.executeAction(action);
			expect(action.getIsValid()).to.equal(false);
			expect(tiger.getPosition().x).to.equal(1);
			expect(tiger.getPosition().y).to.equal(2);

			var action = tiger.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);
			expect(action.getIsValid()).to.equal(true);
			expect(gameSession.getGeneralForPlayer2().getDamage()).to.be.above(0);
		});
		it('expect iris barrier to prevent damage taken during your turn only', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.IrisBarrier}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			var golem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 1, 2, gameSession.getPlayer2Id());

			var action = gameSession.getGeneralForPlayer1().actionAttack(golem);
			gameSession.executeAction(action);

			expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(0);
			expect(golem.getDamage()).to.equal(2);

			gameSession.executeAction(gameSession.actionEndTurn());

			var action = golem.actionAttack(gameSession.getGeneralForPlayer1());
			gameSession.executeAction(action);

			expect(golem.getDamage()).to.equal(4);
			expect(gameSession.getGeneralForPlayer1().getDamage()).to.be.above(0);
		});
		it('expect gust to summon 2 wind dervishes whenever you use your bbs', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			// cycle turns until you can use bloodborn spell
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var gust = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Gust}, 4, 3, gameSession.getPlayer1Id());

			var action = player1.actionPlaySignatureCard(0, 1);
			gameSession.executeAction(action);

			var dervishes = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction3.Dervish);
			expect(dervishes.length).to.equal(2);
		});
		it('expect lost in the desert to deal 6 damage to enemies who are not nearby friendly minions or generals', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			var terradon1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Terradon}, 5, 2, gameSession.getPlayer2Id());
			var terradon2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Terradon}, 6, 3, gameSession.getPlayer2Id());
			var terradon3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Terradon}, 8, 3, gameSession.getPlayer2Id());
			var terradon4 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Terradon}, 3, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.LostInTheDesert}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(terradon1.getDamage()).to.equal(0);
			expect(terradon2.getDamage()).to.equal(0);
			expect(terradon3.getDamage()).to.equal(0);
			expect(terradon4.getDamage()).to.equal(6);

			player1.remainingMana = 9;
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpiralTechnique}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 3);
			gameSession.executeAction(playCardFromHandAction);
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.LostInTheDesert}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(6);
			expect(terradon1.getDamage()).to.equal(0);
			expect(terradon2.getDamage()).to.equal(0);
			expect(terradon4.getIsRemoved()).to.equal(true);
		});
		it('expect neutrolink to give your general all keywords of friendly minions this turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			var keyword1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 5, 2, gameSession.getPlayer1Id());
			var keyword2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SpottedDragonlark}, 6, 3, gameSession.getPlayer1Id());
			var keyword3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.MakantorWarbeast}, 8, 3, gameSession.getPlayer1Id());
			var keyword4 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SapphireSeer}, 3, 1, gameSession.getPlayer1Id());
			var keyword5 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.RockPulverizer}, 4, 1, gameSession.getPlayer1Id());
			var keyword6 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.LysianBrawler}, 4, 3, gameSession.getPlayer1Id());
			var keyword7 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ValeHunter}, 4, 4, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Neurolink}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(gameSession.getGeneralForPlayer1().hasModifierClass(SDK.ModifierFlying)).to.equal(true);
			expect(gameSession.getGeneralForPlayer1().hasModifierClass(SDK.ModifierBlastAttack)).to.equal(true);
			expect(gameSession.getGeneralForPlayer1().hasModifierClass(SDK.ModifierFrenzy)).to.equal(true);
			expect(gameSession.getGeneralForPlayer1().hasModifierClass(ModifierForcefield)).to.equal(true);
			expect(gameSession.getGeneralForPlayer1().hasModifierClass(SDK.ModifierProvoke)).to.equal(true);
			expect(gameSession.getGeneralForPlayer1().hasModifierClass(ModifierTranscendance)).to.equal(true);
			expect(gameSession.getGeneralForPlayer1().hasModifierClass(SDK.ModifierRanged)).to.equal(true);

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(gameSession.getGeneralForPlayer1().hasModifierClass(SDK.ModifierFlying)).to.equal(false);
			expect(gameSession.getGeneralForPlayer1().hasModifierClass(SDK.ModifierBlastAttack)).to.equal(false);
			expect(gameSession.getGeneralForPlayer1().hasModifierClass(SDK.ModifierFrenzy)).to.equal(false);
			expect(gameSession.getGeneralForPlayer1().hasModifierClass(ModifierForcefield)).to.equal(false);
			expect(gameSession.getGeneralForPlayer1().hasModifierClass(SDK.ModifierProvoke)).to.equal(false);
			expect(gameSession.getGeneralForPlayer1().hasModifierClass(ModifierTranscendance)).to.equal(false);
			expect(gameSession.getGeneralForPlayer1().hasModifierClass(SDK.ModifierRanged)).to.equal(false);
		});
		it('expect simulacra obelysk to start building another one once it finishes building', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction3.SimulacraObelysk}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			// cycle turns until you can use bloodborn spell
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var obelysks = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction3.SimulacraObelysk);
			expect(obelysks.length).to.equal(1);

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			obelysks = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction3.SimulacraObelysk);
			expect(obelysks.length).to.equal(2);
		});
		it('expect grapnel paradigm to take over enemy minions with 2 or less attack when summoned on the same row as them', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;
			player2.remainingMana = 9;

			var terradon1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Terradon}, 5, 2, gameSession.getPlayer2Id());
			var terradon2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Terradon}, 5, 3, gameSession.getPlayer2Id());
			var makantor = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.MakantorWarbeast}, 6, 2, gameSession.getPlayer2Id());

			expect(terradon1.ownerId).to.equal('player2_id');
			expect(terradon2.ownerId).to.equal('player2_id');
			expect(makantor.ownerId).to.equal('player2_id');

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction3.SniperZen}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(terradon1.ownerId).to.equal('player1_id');
			expect(terradon2.ownerId).to.equal('player2_id');
			expect(makantor.ownerId).to.equal('player2_id');
		});
		it('expect monolithic vision to transform your action bar to have 6 random vetruvian cards all with -4 cost', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.MonolithicVision}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			var hand1 = player1.getDeck().getCardsInHand();

			for(i = 0; i < hand1.length; i++){
				if(hand1[i].getBaseManaCost() <= 4){
				  expect(hand1[i].getManaCost()).to.equal(0);
				} else {
				  expect(hand1[i].getManaCostChange()).to.equal(-4);
				}
				expect(hand1[i].factionId).to.equal(3);
			}
		});
	});
});
