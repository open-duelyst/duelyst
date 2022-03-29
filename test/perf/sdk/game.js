const path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../'));
require('coffee-script/register');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var UtilsSDK = require('test/utils/utils_sdk');
var Promise = require('bluebird');
var Benchmark = require('benchmark');

module.exports = new Promise(function (resolve, reject) {
	var suite = new Benchmark.Suite('Construct and Execute');

	// disable the logger for cleaner test output
	Logger.enabled = false;

	// add listeners
	suite.on('cycle', function(event) {
		console.log(String(event.target));
	});

	// add tests
	suite.add('Construct empty session', {
		fn: function () {
			SDK.GameSession.create();
		}
	});

	suite.add('Construct new session', {
		fn: function () {
			UtilsSDK.setupSession(SDK.FactionFactory.starterDeckForFactionLevel(1, 30), SDK.FactionFactory.starterDeckForFactionLevel(2, 30), true);
		}
	});

	suite.add('Execute turn', {
		fn: function () {
			var gameSession = SDK.GameSession.getInstance();

			// put first card in current player's hand back into deck
			// this way players will continue to draw cards every turn
			// in order to do this we also need to disable validators
			// because these actions aren't valid explicit player actions
			var player = gameSession.getCurrentPlayer();
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, player.getPlayerId(), player.getDeck().getCardIndexInHandAtIndex(0)));

			// end turn
			gameSession.executeAction(gameSession.actionEndTurn());
		},
		onCycle: function(event) {
			// setup session with starter decks and skip mulligan
			UtilsSDK.setupSession(SDK.FactionFactory.starterDeckForFactionLevel(1, 30), SDK.FactionFactory.starterDeckForFactionLevel(2, 30), true);
		}
	});

	suite.add('Execute turn w/ 1 spell + draw, 1 spawn unit, 1 spell + kill', {
		fn: function () {
			var gameSession = SDK.GameSession.getInstance();

			// put aerial rift (draw), planar scout (unit), and true trike (spell) in current player's hand
			// in order to do this we also need to disable validators
			// because this action isn't a valid explicit player action
			var player = gameSession.getCurrentPlayer();
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, player.getPlayerId(), {id: SDK.Cards.Spell.AerialRift}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, player.getPlayerId(), {id: SDK.Cards.Neutral.PlanarScout}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, player.getPlayerId(), {id: SDK.Cards.Spell.TrueStrike}));
			player.remainingMana = 9;

			// play aerial rift from hand index 0 to position 0, 0
			gameSession.executeAction(player.actionPlayCardFromHand(0, 0, 0));

			// play planar scout from hand index 1 to position 0, 0
			gameSession.executeAction(player.actionPlayCardFromHand(1, 0, 0));

			// play true strike on scout from hand index 0 to position 0, 0
			gameSession.executeAction(player.actionPlayCardFromHand(0, 0, 0));

			// end turn
			gameSession.executeAction(gameSession.actionEndTurn());
		},
		onCycle: function(event) {
			// setup session with empty decks and skip mulligan and set to developer mode
			UtilsSDK.setupSession([{id: SDK.Cards.Faction1.General}], [{id: SDK.Cards.Faction1.General}], true, true);
		}
	});

	suite.add('Execute replace card', {
		fn: function () {
			var gameSession = SDK.GameSession.getInstance();

			// replace card
			gameSession.executeAction(gameSession.getPlayer1().actionReplaceCardFromHand(0));

			// reset number of times replaced
			gameSession.getPlayer1().getDeck().setNumCardsReplacedThisTurn(0);
		},
		onCycle: function(event) {
			// setup session with starter decks and skip mulligan
			UtilsSDK.setupSession(SDK.FactionFactory.starterDeckForFactionLevel(1, 30), SDK.FactionFactory.starterDeckForFactionLevel(2, 30), true);
		}
	});

	suite.add('Update auras', {
		fn: function () {
			var gameSession = SDK.GameSession.getInstance();

			// refresh auras by triggering state sync
			var units = gameSession.getBoard().getUnits();
			for (var i = 0, il = units.length; i < il; i++) {
				var unit = units[i];
				if (unit.getId() === SDK.Cards.Faction1.SilverguardKnight) {
					var modifiers = unit.getModifiers();
					for (var j = 0, jl = modifiers.length; j < jl; j++) {
						var modifier = modifiers[j];
						if (modifier instanceof SDK.ModifierProvoke) {
							modifier.syncState();
						}
					}
				}
			}
		},
		onCycle: function(event) {
			// setup session with starter decks and skip mulligan
			UtilsSDK.setupSession(SDK.FactionFactory.starterDeckForFactionLevel(1, 30), SDK.FactionFactory.starterDeckForFactionLevel(2, 30), true);

			var gameSession = SDK.GameSession.getInstance();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();

			// add provokers to board
			UtilsSDK.executeActionWithoutValidation(new SDK.ApplyCardToBoardAction(gameSession, player1.getPlayerId(), 0, 0, {id: SDK.Cards.Faction1.SilverguardKnight}));
			UtilsSDK.executeActionWithoutValidation(new SDK.ApplyCardToBoardAction(gameSession, player2.getPlayerId(), 0, 1, {id: SDK.Cards.Faction1.SilverguardKnight}));
			UtilsSDK.executeActionWithoutValidation(new SDK.ApplyCardToBoardAction(gameSession, player1.getPlayerId(), 1, 1, {id: SDK.Cards.Faction1.SilverguardKnight}));
			UtilsSDK.executeActionWithoutValidation(new SDK.ApplyCardToBoardAction(gameSession, player2.getPlayerId(), 1, 0, {id: SDK.Cards.Faction1.SilverguardKnight}));
			UtilsSDK.executeActionWithoutValidation(new SDK.ApplyCardToBoardAction(gameSession, player1.getPlayerId(), 2, 0, {id: SDK.Cards.Faction1.SilverguardKnight}));
			UtilsSDK.executeActionWithoutValidation(new SDK.ApplyCardToBoardAction(gameSession, player2.getPlayerId(), 2, 1, {id: SDK.Cards.Faction1.SilverguardKnight}));
			UtilsSDK.executeActionWithoutValidation(new SDK.ApplyCardToBoardAction(gameSession, player1.getPlayerId(), 3, 1, {id: SDK.Cards.Faction1.SilverguardKnight}));
			UtilsSDK.executeActionWithoutValidation(new SDK.ApplyCardToBoardAction(gameSession, player2.getPlayerId(), 3, 0, {id: SDK.Cards.Faction1.SilverguardKnight}));
		}
	});

	// add complete listener
	suite.on("complete", resolve);

	// run tests
	suite.run({ 'async': false });

});
