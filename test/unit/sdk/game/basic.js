var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var UtilsSDK = require('test/utils/utils_sdk');
var _ = require('underscore');
var Promise = require('bluebird');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("basic", function() {

		beforeEach(function () {
			// define test decks.  Spells do not work.  Only add minions and generals this way
			var player1Deck = [
				{id: SDK.Cards.Faction1.General},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction2.General},
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


		it('expect to attack with a melee unit who has moved', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var windbladeAdept = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.WindbladeAdept}, 0, 1, gameSession.getPlayer1Id());
			var windbladeAdept2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.WindbladeAdept}, 3, 1, gameSession.getPlayer2Id());

			windbladeAdept.refreshExhaustion();
			var action = windbladeAdept.actionMove({ x: 2, y: 1 });
			gameSession.executeAction(action);
			var action = windbladeAdept.actionAttack(windbladeAdept2);
			gameSession.executeAction(action);
			expect(windbladeAdept2.getDamage()).to.equal(2);
			expect(windbladeAdept.getDamage()).to.equal(2);
		});
		it('expect to not be able to attack when out of range', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var windbladeAdept = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.WindbladeAdept}, 0, 1, gameSession.getPlayer1Id());
			var windbladeAdept2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.WindbladeAdept}, 3, 1, gameSession.getPlayer2Id());

			windbladeAdept.refreshExhaustion();
			var action = windbladeAdept.actionMove({ x: 1, y: 1 });
			gameSession.executeAction(action);
			var action = windbladeAdept.actionAttack(windbladeAdept2);
			gameSession.executeAction(action);
			expect(windbladeAdept2.getDamage()).to.equal(0);
			expect(windbladeAdept.getDamage()).to.equal(0);
		});
		it('expect blast to damage all enemies in a vertical line', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var pyromancer = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 1, 0, gameSession.getPlayer1Id());
			var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 1, 4, gameSession.getPlayer2Id());
			var brightmossGolem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 1, 3, gameSession.getPlayer2Id());

			pyromancer.refreshExhaustion();
			var action = pyromancer.actionAttack(brightmossGolem);
			gameSession.executeAction(action);

			expect(brightmossGolem.getDamage()).to.equal(2);
			expect(brightmossGolem2.getDamage()).to.equal(2);
		});
		it('expect to not be able to attack again after already attacking', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var windbladeAdept = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.WindbladeAdept}, 0, 1, gameSession.getPlayer1Id());
			var windbladeAdept2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.WindbladeAdept}, 3, 1, gameSession.getPlayer2Id());

			windbladeAdept.refreshExhaustion();
			var action = windbladeAdept.actionMove({ x: 2, y: 1 });
			gameSession.executeAction(action);
			var action = windbladeAdept.actionAttack(windbladeAdept2);
			gameSession.executeAction(action);
			var action = windbladeAdept.actionAttack(windbladeAdept2);
			gameSession.executeAction(action);
			expect(windbladeAdept2.getDamage()).to.equal(2);
			expect(windbladeAdept.getDamage()).to.equal(2);
		});
		it('expect flying to allow a unit to move across the map', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var flameWing = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FlameWing}, 0, 1, gameSession.getPlayer1Id());

			flameWing.refreshExhaustion();
			var action = flameWing.actionMove({ x: 6, y: 2 });
			gameSession.executeAction(action);

			var flameWing = board.getUnitAtPosition({x:6, y: 2});

			expect(flameWing.getId()).to.equal(SDK.Cards.Neutral.FlameWing);
		});
		it('expect to not be able to move out of range', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var windbladeAdept = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.WindbladeAdept}, 0, 1, gameSession.getPlayer1Id());

			windbladeAdept.refreshExhaustion();
			var action = windbladeAdept.actionMove({ x: 4, y: 1 });
			gameSession.executeAction(action);

			var windbladeAdept = board.getUnitAtPosition({x:4, y: 1});

			expect(windbladeAdept).to.equal(undefined);
		});
		it('expect to not be able to move through an enemy unit', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var windbladeAdept = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.WindbladeAdept}, 0, 1, gameSession.getPlayer1Id());
			var windbladeAdept2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.WindbladeAdept}, 1, 1, gameSession.getPlayer2Id());

			windbladeAdept.refreshExhaustion();
			var action = windbladeAdept.actionMove({ x: 2, y: 1 });
			gameSession.executeAction(action);
			var windbladeAdept = board.getUnitAtPosition({x:2, y: 1});

			expect(windbladeAdept).to.equal(undefined);
		});
		it('expect to not be albe to move a unit that has already moved', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var windbladeAdept = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.WindbladeAdept}, 0, 1, gameSession.getPlayer1Id());

			windbladeAdept.refreshExhaustion();
			var action = windbladeAdept.actionMove({ x: 2, y: 1 });
			gameSession.executeAction(action);
			var action = windbladeAdept.actionMove({ x: 4, y: 1 });
			gameSession.executeAction(action);
			var windbladeAdept = board.getUnitAtPosition({x:4, y: 1});

			expect(windbladeAdept).to.equal(undefined);
		});
		it('expect to not be able to move after a unit has already attacked', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var windbladeAdept = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.WindbladeAdept}, 1, 1, gameSession.getPlayer1Id());
			var windbladeAdept2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.WindbladeAdept}, 0, 1, gameSession.getPlayer2Id());

			windbladeAdept.refreshExhaustion();
			var action = windbladeAdept.actionAttack(windbladeAdept2);
			gameSession.executeAction(action);
			var action = windbladeAdept.actionMove({ x: 3, y: 1 });
			gameSession.executeAction(action);
			var windbladeAdept = board.getUnitAtPosition({x:3, y: 1});

			expect(windbladeAdept).to.equal(undefined);
		});
		it('expect to not be able to play a unit from hand out of range', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.WindbladeAdept}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 5, 3);
			gameSession.executeAction(playCardFromHandAction);

			var windbladeAdept = board.getUnitAtPosition({x:5, y: 3});

			expect(windbladeAdept).to.equal(undefined);
		});
		it('expect a valid card with an invalid follow-up action to fail', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();

			gameSession.executeAction(gameSession.actionEndTurn());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Artifact.StaffOfYKir}));
			UtilsSDK.executeActionWithoutValidation(player2.actionPlayCardFromHand(0, 1, 1));

			gameSession.executeAction(gameSession.actionEndTurn());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.RashasCurse}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 5, 3);
			gameSession.executeAction(followupAction);

			var dervish = board.getUnitAtPosition({x:5, y:3});
			expect(dervish).to.equal(undefined);
		});
		it('expect mana to be returned correctly if canceling a follow-up on a mana orb', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 3;

			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
			gameSession.executeAction(action);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.WraithlingSwarm}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 4, 0);
			gameSession.executeAction(followupAction);
			expect(gameSession.getRollbackSnapshotData()).to.exist;
			var endFollowUp = gameSession.actionRollbackSnapshot();
			gameSession.executeAction(endFollowUp);

			var player1 = gameSession.getPlayer1();

			expect(player1.getRemainingMana()).to.equal(3);
		});
		it('expect blast units to still have blast after canceling a follow-up', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var pyromancer = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 3, 2, gameSession.getPlayer1Id());

			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
			gameSession.executeAction(action);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.WraithlingSwarm}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 4, 0);
			gameSession.executeAction(followupAction);
			expect(gameSession.getRollbackSnapshotData()).to.exist;
			var endFollowUp = gameSession.actionRollbackSnapshot();
			gameSession.executeAction(endFollowUp);

			var player1 = gameSession.getPlayer1();
			var board = gameSession.getBoard();

			var pyromancer = board.getUnitAtPosition({x:3, y:2});
			pyromancer.refreshExhaustion();

			var action = pyromancer.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);

			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(2);
		});
		it('expect buffed units to still have buffs after canceling a follow-up', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var pyromancer = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 3, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ScionsFirstWish}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 2);
			gameSession.executeAction(playCardFromHandAction);

			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
			gameSession.executeAction(action);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.WraithlingSwarm}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 4, 0);
			gameSession.executeAction(followupAction);
			expect(gameSession.getRollbackSnapshotData()).to.exist;
			var endFollowUp = gameSession.actionRollbackSnapshot();
			gameSession.executeAction(endFollowUp);

			var player1 = gameSession.getPlayer1();
			var board = gameSession.getBoard();
			var pyromancer = board.getUnitAtPosition({x:3, y:2});

			expect(pyromancer.getATK()).to.equal(3);
			expect(pyromancer.getHP()).to.equal(2);
		});
		it('expect zealed units to still have zeal buffs after canceling a follow-up', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var windbladeAdept = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.WindbladeAdept}, 3, 2, gameSession.getPlayer1Id());

			var action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
			gameSession.executeAction(action);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.WraithlingSwarm}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 4, 0);
			gameSession.executeAction(followupAction);
			expect(gameSession.getRollbackSnapshotData()).to.exist;
			var endFollowUp = gameSession.actionRollbackSnapshot();
			gameSession.executeAction(endFollowUp);

			var player1 = gameSession.getPlayer1();
			var board = gameSession.getBoard();

			var windbladeAdept = board.getUnitAtPosition({x:3, y:2});

			expect(windbladeAdept.hasActiveModifierClass(SDK.ModifierBanded)).to.equal(true);
			expect(windbladeAdept.getATK()).to.equal(3);
			expect(windbladeAdept.getHP()).to.equal(3);
		});
		it('expect players to have correct mana progression until reaching max mana', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();

			gameSession.executeAction(gameSession.actionEndTurn());
			expect(player1.remainingMana).to.equal(2);
			gameSession.executeAction(gameSession.actionEndTurn());
			expect(player2.remainingMana).to.equal(3);
			gameSession.executeAction(gameSession.actionEndTurn());
			expect(player1.remainingMana).to.equal(3);
			gameSession.executeAction(gameSession.actionEndTurn());
			expect(player2.remainingMana).to.equal(4);
			gameSession.executeAction(gameSession.actionEndTurn());
			expect(player1.remainingMana).to.equal(4);
			gameSession.executeAction(gameSession.actionEndTurn());
			expect(player2.remainingMana).to.equal(5);
			gameSession.executeAction(gameSession.actionEndTurn());
			expect(player1.remainingMana).to.equal(5);
			gameSession.executeAction(gameSession.actionEndTurn());
			expect(player2.remainingMana).to.equal(6);
			gameSession.executeAction(gameSession.actionEndTurn());
			expect(player1.remainingMana).to.equal(6);
			gameSession.executeAction(gameSession.actionEndTurn());
			expect(player2.remainingMana).to.equal(7);
			gameSession.executeAction(gameSession.actionEndTurn());
			expect(player1.remainingMana).to.equal(7);
			gameSession.executeAction(gameSession.actionEndTurn());
			expect(player2.remainingMana).to.equal(8);
			gameSession.executeAction(gameSession.actionEndTurn());
			expect(player1.remainingMana).to.equal(8);
			gameSession.executeAction(gameSession.actionEndTurn());
			expect(player2.remainingMana).to.equal(9);
			gameSession.executeAction(gameSession.actionEndTurn());
			expect(player1.remainingMana).to.equal(9);
			gameSession.executeAction(gameSession.actionEndTurn());
			expect(player2.remainingMana).to.equal(9);
			gameSession.executeAction(gameSession.actionEndTurn());
			expect(player1.remainingMana).to.equal(9);
			gameSession.executeAction(gameSession.actionEndTurn());
			expect(player2.remainingMana).to.equal(9);
		});

		it('expect explicit draw actions to fail', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.WraithlingSwarm}));

			var draw = player1.getDeck().actionDrawCard();
			gameSession.executeAction(draw);

			var hand = player1.getDeck().getCardsInHand();
			var cardDraw = hand[0];

			expect(cardDraw).to.equal(undefined);
		});
		it('expect eggs to grant rush when hatching', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var veteranSilithar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.VeteranSilithar}, 7, 2, gameSession.getPlayer1Id());

			veteranSilithar.setDamage(2);
			veteranSilithar.refreshExhaustion();
			var action = veteranSilithar.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.EggMorph}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(playCardFromHandAction);

			var veteranSilithar = board.getUnitAtPosition({x:7,y:2});

			var action = veteranSilithar.actionMove({ x: 6, y: 3 });
			gameSession.executeAction(action);

			expect(veteranSilithar.getPosition().x).to.equal(6);
			expect(veteranSilithar.getPosition().y).to.equal(3);
		});
		it('expect hailstone prison on a newly hatched minion to lose rush when played again', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 90;

			var veteranSilithar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.VeteranSilithar}, 7, 2, gameSession.getPlayer1Id());

			veteranSilithar.setDamage(2);
			veteranSilithar.refreshExhaustion();
			var action = veteranSilithar.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.EggMorph}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(playCardFromHandAction);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.IceCage}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(playCardFromHandAction);

			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			var veteranSilithar = board.getUnitAtPosition({x:1,y:1});

			var action = veteranSilithar.actionMove({ x: 2, y: 2 });
			gameSession.executeAction(action);

			expect(veteranSilithar.getPosition().x).to.equal(1);
			expect(veteranSilithar.getPosition().y).to.equal(1);
		});
		it('expect hailstone prisoned eggs to hatch correctly when played to the board', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var veteranSilithar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.VeteranSilithar}, 7, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.IceCage}));

			veteranSilithar.setDamage(2);
			veteranSilithar.refreshExhaustion();
			var action = veteranSilithar.actionAttack(gameSession.getGeneralForPlayer2());
			gameSession.executeAction(action);

			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(playCardFromHandAction);

			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var veteranSilithar = board.getUnitAtPosition({x:1,y:1});

			expect(veteranSilithar.getId()).to.equal(SDK.Cards.Faction5.VeteranSilithar);
		});
		it('expect the last artifact to be replaced when equipping a 4th', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 999;

			// add artifacts to max
			for (var i = 0; i < CONFIG.MAX_ARTIFACTS; i++) {
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.SunstoneBracers}));
				UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));
			}
			var artifactModifiersBySourceCard = gameSession.getGeneralForPlayer1().getArtifactModifiersGroupedByArtifactCard();
			expect(artifactModifiersBySourceCard.length).to.equal(3);
			expect(artifactModifiersBySourceCard[2][0].getSourceCard().getId()).to.equal(SDK.Cards.Artifact.SunstoneBracers);

			// replace oldest
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.ArclyteRegalia}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));
			var artifactModifiersBySourceCard = gameSession.getGeneralForPlayer1().getArtifactModifiersGroupedByArtifactCard();
			expect(artifactModifiersBySourceCard.length).to.equal(3);
			expect(artifactModifiersBySourceCard[2][0].getSourceCard().getId()).to.equal(SDK.Cards.Artifact.ArclyteRegalia);
		});
		it('expect prismatic sarlac the eternal to respawn a prismatic sarlac when dying to an attack', function() {
		  var gameSession = SDK.GameSession.getInstance();
		  var board = gameSession.getBoard();
		  var player1 = gameSession.getPlayer1();

		  var prismaticCardId = SDK.Cards.getPrismaticCardId(SDK.Cards.Neutral.SarlacTheEternal)
		  var sarlac = UtilsSDK.applyCardToBoard({id: prismaticCardId}, 7, 2, gameSession.getPlayer1Id());

		  sarlac.refreshExhaustion();
		  var action = sarlac.actionAttack(gameSession.getGeneralForPlayer2());
		  gameSession.executeAction(action);

		  var sarlac = UtilsSDK.getEntityOnBoardById(prismaticCardId);
		  var updatedSarlac = board.getUnitAtPosition({x:7,y:2});

		  expect(updatedSarlac).to.equal(undefined);
		  expect(sarlac.getHP()).to.equal(1);
		  expect(SDK.Cards.getIsPrismaticCardId(sarlac.getId())).to.equal(true);
		});
		it('expect prismatic sarlac the eternal to respawn a prismatic sarlac when dying to a non-followup burn spell', function() {
		  var gameSession = SDK.GameSession.getInstance();
		  var board = gameSession.getBoard();
		  var player1 = gameSession.getPlayer1();

		  var prismaticCardId = SDK.Cards.getPrismaticCardId(SDK.Cards.Neutral.SarlacTheEternal)
		  var sarlac = UtilsSDK.applyCardToBoard({id: prismaticCardId}, 7, 2, gameSession.getPlayer1Id());

		  UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		  var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
		  gameSession.executeAction(playCardFromHandAction);

		  var sarlac = UtilsSDK.getEntityOnBoardById(prismaticCardId);
		  var updatedSarlac = board.getUnitAtPosition({x:7,y:2});

		  expect(updatedSarlac).to.equal(undefined);
		  expect(sarlac.getHP()).to.equal(1);
		  expect(SDK.Cards.getIsPrismaticCardId(sarlac.getId())).to.equal(true);
		});
		it('expect prismatic sarlac the eternal to respawn a prismatic sarlac when dying to a followup spell', function() {
		  var gameSession = SDK.GameSession.getInstance();
		  var board = gameSession.getBoard();
		  var player1 = gameSession.getPlayer1();

		  player1.remainingMana = 9;

		  var prismaticCardId = SDK.Cards.getPrismaticCardId(SDK.Cards.Neutral.SarlacTheEternal)
		  var valeHunter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ValeHunter}, 3, 2, gameSession.getPlayer1Id());
		  var sarlac = UtilsSDK.applyCardToBoard({id: prismaticCardId}, 7, 2, gameSession.getPlayer2Id());

		  UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.RitualBanishing}));
		  var playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 2);
		  gameSession.executeAction(playCardFromHandAction);
		  var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
		  var followupAction = player1.actionPlayFollowup(followupCard, 7, 2);
		  gameSession.executeAction(followupAction);

		  var sarlac = UtilsSDK.getEntityOnBoardById(prismaticCardId);
		  var updatedSarlac = board.getUnitAtPosition({x:7,y:2});

		  expect(updatedSarlac).to.equal(undefined);
		  expect(sarlac.getHP()).to.equal(1);
		  expect(SDK.Cards.getIsPrismaticCardId(sarlac.getId())).to.equal(true);
		});
		it('expect sarlac prime to respawn a sarlac prime when dying to an attack', function() {
		  var gameSession = SDK.GameSession.getInstance();
		  var board = gameSession.getBoard();
		  var player1 = gameSession.getPlayer1();

		  var skinnedCardId = SDK.Cards.getSkinnedCardId(SDK.Cards.Neutral.SarlacTheEternal, 1);
		  var sarlac = UtilsSDK.applyCardToBoard({id: skinnedCardId}, 7, 2, gameSession.getPlayer1Id());

		  sarlac.refreshExhaustion();
		  var action = sarlac.actionAttack(gameSession.getGeneralForPlayer2());
		  gameSession.executeAction(action);

		  var sarlac = UtilsSDK.getEntityOnBoardById(skinnedCardId);
		  var updatedSarlac = board.getUnitAtPosition({x:7,y:2});

		  expect(updatedSarlac).to.equal(undefined);
		  expect(sarlac.getHP()).to.equal(1);
		  expect(SDK.Cards.getIsSkinnedCardId(sarlac.getId())).to.equal(true);
		});
		it('expect prismatic sarlac the eternal to respawn on a prismatic sarlac when dying to a non-followup burn spell', function() {
		  var gameSession = SDK.GameSession.getInstance();
		  var board = gameSession.getBoard();
		  var player1 = gameSession.getPlayer1();

		  var skinnedCardId = SDK.Cards.getSkinnedCardId(SDK.Cards.Neutral.SarlacTheEternal, 1);
		  var sarlac = UtilsSDK.applyCardToBoard({id: skinnedCardId}, 7, 2, gameSession.getPlayer1Id());

		  UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
		  var playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
		  gameSession.executeAction(playCardFromHandAction);

		  var sarlac = UtilsSDK.getEntityOnBoardById(skinnedCardId);
		  var updatedSarlac = board.getUnitAtPosition({x:7,y:2});

		  expect(updatedSarlac).to.equal(undefined);
		  expect(sarlac.getHP()).to.equal(1);
		  expect(SDK.Cards.getIsSkinnedCardId(sarlac.getId())).to.equal(true);
		});
		it('expect prismatic sarlac the eternal to respawn on a prismatic sarlac when dying to a followup spell', function() {
		  var gameSession = SDK.GameSession.getInstance();
		  var board = gameSession.getBoard();
		  var player1 = gameSession.getPlayer1();

		  player1.remainingMana = 9;

		  var skinnedCardId = SDK.Cards.getSkinnedCardId(SDK.Cards.Neutral.SarlacTheEternal, 1);
		  var sarlac = UtilsSDK.applyCardToBoard({id: skinnedCardId}, 7, 2, gameSession.getPlayer2Id());
		  var valeHunter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ValeHunter}, 3, 2, gameSession.getPlayer1Id());

		  UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.RitualBanishing}));
		  var playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 2);
		  gameSession.executeAction(playCardFromHandAction);
		  var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
		  var followupAction = player1.actionPlayFollowup(followupCard, 7, 2);
		  gameSession.executeAction(followupAction);

		  var sarlac = UtilsSDK.getEntityOnBoardById(skinnedCardId);
		  var updatedSarlac = board.getUnitAtPosition({x:7,y:2});

		  expect(updatedSarlac).to.equal(undefined);
		  expect(sarlac.getHP()).to.equal(1);
		  expect(SDK.Cards.getIsSkinnedCardId(sarlac.getId())).to.equal(true);
		});
		it('expect an egged grow minion to gain stats the turn it hatches', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var earthwalker = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.EarthWalker}, 0, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.EggMorph}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
			gameSession.executeAction(playCardFromHandAction);

			gameSession.executeAction(gameSession.actionEndTurn());

			earthwalker = board.getUnitAtPosition({x:0, y:1});

			expect(earthwalker.getHP()).to.equal(4);
			expect(earthwalker.getATK()).to.equal(4);
		});
		it('expect an egged vindicator to not gain stats the turn it hatches', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var vindicator = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Vindicator}, 0, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.EggMorph}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
			gameSession.executeAction(playCardFromHandAction);

			gameSession.executeAction(gameSession.actionEndTurn());

			vindicator = board.getUnitAtPosition({x:0, y:1});

			expect(vindicator.getHP()).to.equal(3);
			expect(vindicator.getATK()).to.equal(1);
		});
		it('expect eggs that are stolen from dominate will to hatch at the beginning of their owners next turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 90;

			var vindicator = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Vindicator}, 0, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.EggMorph}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
			gameSession.executeAction(playCardFromHandAction);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Enslave}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
			gameSession.executeAction(playCardFromHandAction);

			gameSession.executeAction(gameSession.actionEndTurn());

			vindicator = board.getUnitAtPosition({x:0, y:1});

			expect(vindicator.getHP()).to.equal(1);
			expect(vindicator.getATK()).to.equal(0);

			gameSession.executeAction(gameSession.actionEndTurn());

			vindicator = board.getUnitAtPosition({x:0, y:1});

			expect(vindicator.getHP()).to.equal(3);
			expect(vindicator.getATK()).to.equal(1);
		});
		it('expect eggs that are stolen from psychic conduit to hatch at the beginning of their owners next turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 90;

			var vindicator = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Vindicator}, 0, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.EggMorph}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
			gameSession.executeAction(playCardFromHandAction);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PsychicConduit}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
			gameSession.executeAction(playCardFromHandAction);

			gameSession.executeAction(gameSession.actionEndTurn());

			vindicator = board.getUnitAtPosition({x:0, y:1});

			expect(vindicator.getHP()).to.equal(3);
			expect(vindicator.getATK()).to.equal(1);
			expect(vindicator.getOwnerId()).to.equal('player2_id');
		});
		it('expect eggs that are stolen from dominate will and then stolen back to hatch at the beginning of their final owners next turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 90;

			var vindicator = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Vindicator}, 0, 1, gameSession.getPlayer2Id());
			var vindicator2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Vindicator}, 1, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.EggMorph}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
			gameSession.executeAction(playCardFromHandAction);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Enslave}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
			gameSession.executeAction(playCardFromHandAction);

			gameSession.executeAction(gameSession.actionEndTurn());

			vindicator = board.getUnitAtPosition({x:0, y:1});

			expect(vindicator.getHP()).to.equal(1);
			expect(vindicator.getATK()).to.equal(0);

			player2.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Neutral.ZenRui}));
			var playCardFromHandAction = player2.actionPlayCardFromHand(0, 1, 0);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player2.actionPlayFollowup(followupCard, 0, 1);
			gameSession.executeAction(followupAction);

			gameSession.executeAction(gameSession.actionEndTurn());

			vindicator = board.getUnitAtPosition({x:0, y:1});

			expect(vindicator.getHP()).to.equal(1);
			expect(vindicator.getATK()).to.equal(0);

			gameSession.executeAction(gameSession.actionEndTurn());

			vindicator = board.getUnitAtPosition({x:0, y:1});

			expect(vindicator.getHP()).to.equal(3);
			expect(vindicator.getATK()).to.equal(1);
			expect(vindicator.getOwnerId()).to.equal('player2_id');
		});

		/* Test disabled: failing
		it('expect to not draw into the card you just replaced more than statistically probable', function() {
			var repeatCounter = 0;
			for(var i = 0; i < 100; i++){
				var player1Deck = [
					{id: SDK.Cards.Faction6.General},
				];

				var player2Deck = [
					{id: SDK.Cards.Faction3.General},
				];

				// setup test session
				UtilsSDK.setupSession(player1Deck, player2Deck, true, false);


				var gameSession = SDK.GameSession.getInstance();
				var board = gameSession.getBoard();
				var player1 = gameSession.getPlayer1();

				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.FireSpitter}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.OnyxBearSeal}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.OnyxBearSeal}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.OnyxBearSeal}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.HolyImmolation}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.HolyImmolation}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.HolyImmolation}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Tempest}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Tempest}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Tempest}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.DarkSacrifice}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.DarkSacrifice}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.DarkSacrifice}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AspectOfTheWolf}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AspectOfTheWolf}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AspectOfTheWolf}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AspectOfTheDrake}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AspectOfTheDrake}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AspectOfTheDrake}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AspectOfTheMountains}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AspectOfTheMountains}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AspectOfTheMountains}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.VoidPulse}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.VoidPulse}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.VoidPulse}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.EggMorph}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.EggMorph}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.EggMorph}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.NaturalSelection}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.NaturalSelection}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.NaturalSelection}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SaberspineSeal}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SaberspineSeal}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SaberspineSeal}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.KillingEdge}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.KillingEdge}));
				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.KillingEdge}));

				var action = player1.actionReplaceCardFromHand(0);
				gameSession.executeAction(action);

				var hand = player1.getDeck().getCardsInHand();
				var cardDraw = hand[0];

				expect(cardDraw.getId()).to.not.equal(SDK.Cards.Spell.PhoenixFire);

				gameSession.executeAction(gameSession.actionEndTurn());

				var hand = player1.getDeck().getCardsInHand();
				var cardDraw = hand[1];

				if(cardDraw.getId() === SDK.Cards.Spell.PhoenixFire){
					repeatCounter++;
				}

				SDK.GameSession.reset();
			}

			Logger.module("UNITTEST").log("You drew into the card you replaced ", repeatCounter, " times.");
		});
		*/
	});
