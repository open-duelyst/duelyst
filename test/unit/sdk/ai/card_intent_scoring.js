var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var UtilsSDK = require('test/utils/utils_sdk');
var _ = require('underscore');
var StarterAI = require('server/ai/starter_ai');
var CardIntent = require('server/ai/card_intent/card_intent');
var CardIntentType = require('server/ai/card_intent/card_intent_type');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("starter ai scoring", function() {
	describe("spell tests", function(){
		beforeEach(function () {
			var player1Deck = [
				{id: SDK.Cards.Faction1.General},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction2.General},
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('Circle of Life', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = 0.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.CircleLife}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 0, 1, gameSession.getPlayer2Id());
			var position = golem.getPosition();
			var positions = [position];

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla 3/2 with own general at 25 HP", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(position, 5, 5);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla 5/5 with own general at 25 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(50);

			UtilsSDK.modifyUnitStats(position, 5, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla 5/6 with own general at 25 HP", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 22);
			UtilsSDK.modifyUnitStats(position, 5, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla 5/6 with own general at 3 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(120);

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 5);
			UtilsSDK.modifyUnitStats(position, 3, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla 3/2 with own general at 20 HP", " = ", bestPositionAndScore.score);
			}

			var ranged = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 1, 1, gameSession.getPlayer2Id());
			var position = ranged.getPosition();
			var positions = [position];

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 0);
			UtilsSDK.modifyUnitStats(position, 3, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged 3/2 with own general at 25 HP", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 5);
			UtilsSDK.modifyUnitStats(position, 3, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged 3/2 with own general at 20 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(140);

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 5);
			UtilsSDK.modifyUnitStats(position, 5, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged 5/6 with own general at 20 HP", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 22);
			UtilsSDK.modifyUnitStats(position, 5, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged 5/6 with own general at 3 HP", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 22);
			UtilsSDK.modifyUnitStats(position, 5, 5);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged 5/5 with own general at 3 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(300);

			var deathwatch = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 2, 1, gameSession.getPlayer2Id());
			var position = deathwatch.getPosition();
			var positions = [position];

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 0);
			UtilsSDK.modifyUnitStats(position, 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a deathwatch 2/2 with own general at 25 HP", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 10);
			UtilsSDK.modifyUnitStats(position, 6, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a deathwatch 6/6 with own general at 15 HP", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 24);
			UtilsSDK.modifyUnitStats(position, 6, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a deathwatch 6/6 with own general at 1 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(400);
		});
		it('Sundrop Elixir', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -5000.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SundropElixir}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 0, 1, gameSession.getPlayer1Id());
			var position = golem.getPosition();
			var positions = [position];

			UtilsSDK.modifyUnitStats(position, 5, 6);
			UtilsSDK.modifyUnitStats(golem.getPosition(), null, null, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla 5/6 with 1 damage taken", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(0);

			UtilsSDK.modifyUnitStats(position, 5, 6);
			UtilsSDK.modifyUnitStats(golem.getPosition(), null, null, 3);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla 5/6 with 3 damage taken", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(position, 5, 6);
			UtilsSDK.modifyUnitStats(golem.getPosition(), null, null, 5);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla 5/6 with 5 damage taken", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(23);

			var ranged = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 1, 1, gameSession.getPlayer1Id());
			var position = ranged.getPosition();
			var positions = [position];

			UtilsSDK.modifyUnitStats(position, 5, 6);
			UtilsSDK.modifyUnitStats(ranged.getPosition(), null, null, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged 5/6 with 1 damage taken", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(position, 5, 6);
			UtilsSDK.modifyUnitStats(ranged.getPosition(), null, null, 3);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged 5/6 with 3 damage taken", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(position, 5, 6);
			UtilsSDK.modifyUnitStats(ranged.getPosition(), null, null, 5);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged 5/6 with 5 damage taken", " = ", bestPositionAndScore.score);
			}

			var deathwatch = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 2, 1, gameSession.getPlayer1Id());
			var position = deathwatch.getPosition();
			var positions = [position];

			UtilsSDK.modifyUnitStats(position, 5, 6);
			UtilsSDK.modifyUnitStats(deathwatch.getPosition(), null, null, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a deathwatch 5/6 with 1 damage taken", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(position, 5, 6);
			UtilsSDK.modifyUnitStats(deathwatch.getPosition(), null, null, 3);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a deathwatch 5/6 with 3 damage taken", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(position, 5, 6);
			UtilsSDK.modifyUnitStats(deathwatch.getPosition(), null, null, 5);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a deathwatch 5/6 with 5 damage taken", " = ", bestPositionAndScore.score);
			}

			var position = gameSession.getGeneralForPlayer1().getPosition();
			var positions = [position];

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on own general at 24 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(30);

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 4);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on own general at 21 HP", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 10);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on own general at 15 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(25);

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 15);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on own general at 10 HP", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 20);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on own general at 5 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(60);

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 24);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on own general at 1 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(300);

			var position = gameSession.getGeneralForPlayer2().getPosition();
			var positions = [position];

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 0);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on enemy general at 25 HP", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 10);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on enemy general at 15 HP", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 20);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on enemy general at 5 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(-20);
		});
		it('Tempest', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -9999.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Tempest}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 0, 1, gameSession.getPlayer1Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 1, gameSession.getPlayer2Id());
			var position = golem2.getPosition();
			var positions = [position];

			UtilsSDK.modifyUnitStats(golem1.getPosition(), 2, 2);
			UtilsSDK.modifyUnitStats(golem2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla friendly 2/2 and a vanilla enemy 2/2", " = ", bestPositionAndScore.score);
				expect(bestPositionAndScore.score).to.be.above(10);
			}

			UtilsSDK.modifyUnitStats(golem1.getPosition(), 2, 3);
			UtilsSDK.modifyUnitStats(golem2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla friendly 2/3 and a vanilla enemy 2/2", " = ", bestPositionAndScore.score);
				expect(bestPositionAndScore.score).to.be.above(25);
			}

			UtilsSDK.modifyUnitStats(golem1.getPosition(), 2, 2);
			UtilsSDK.modifyUnitStats(golem2.getPosition(), 2, 3);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla friendly 2/2 and a vanilla enemy 2/3", " = ", bestPositionAndScore.score);
				expect(bestPositionAndScore.score).to.be.below(0);
			}

			UtilsSDK.removeCardFromBoard(0, 1);
			UtilsSDK.removeCardFromBoard(7, 1);
			var ranged1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 0, 1, gameSession.getPlayer1Id());
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer2Id());
			var position = ranged2.getPosition();
			var positions = [position];

			UtilsSDK.modifyUnitStats(ranged1.getPosition(), 2, 2);
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged friendly 2/2 and a ranged enemy 2/2", " = ", bestPositionAndScore.score);
				expect(bestPositionAndScore.score).to.be.above(40);
			}

			UtilsSDK.modifyUnitStats(ranged1.getPosition(), 2, 3);
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged friendly 2/3 and a ranged enemy 2/2", " = ", bestPositionAndScore.score);
				expect(bestPositionAndScore.score).to.be.above(100);
			}

			UtilsSDK.modifyUnitStats(ranged1.getPosition(), 2, 2);
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 2, 3);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged friendly 2/2 and a ranged enemy 2/3", " = ", bestPositionAndScore.score);
				expect(bestPositionAndScore.score).to.be.below(0);
			}
		});
		it('Decimate', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -50.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Decimate}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer2Id());
			var position = golem2.getPosition();
			var positions = [position];

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 2/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(10);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 0, 0, gameSession.getPlayer1Id());
			UtilsSDK.modifyUnitStats(golem1.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla friendly 2/2 and a vanilla enemy 2/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(3);

			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 5, 1, gameSession.getPlayer2Id());
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla friendly 2/2 and a vanilla enemy 2/2 and enemy ranged 3/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(130);
		});
		it('Martyrdom', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Martyrdom}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 0, 0, gameSession.getPlayer1Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer2Id());
			var ranged1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 0, 1, gameSession.getPlayer1Id());
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer2Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var position = golem1.getPosition();
			var positions = [position];

			UtilsSDK.modifyUnitStats(golem1.getPosition(), 4, 3);
			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 5);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla friendly 4/3 with own general at 20 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(0);

			var position = golem2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(golem2.getPosition(), 4, 3);
			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 5);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 4/3 with enemy general at 20 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(32);

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 2, 2);
			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 0);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 2/2 with enemy general at 25 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(10);

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 2, 2);
			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 10);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 2/2 with enemy general at 15 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(5);

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 10, 10);
			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 0);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 10/10 with enemy general at 25 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(180);

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 10, 10);
			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 5);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 10/10 with enemy general at 15 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(170);

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 10, 10);
			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 10);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 10/10 with enemy general at 5 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(150);

			var position = golem1.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(golem1.getPosition(), 10, 10);
			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 10);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla friendly 10/10 with own general at 15 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(-100);

			var position = golem1.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(golem1.getPosition(), 1, 10);
			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 10);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla friendly 1/10 with own general at 15 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(0);

			UtilsSDK.modifyUnitStats(golem1.getPosition(), 10, 10);
			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 24);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla friendly 10/10 with own general at 1 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(200);

			var position = ranged2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 2, 2);
			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 10);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 2/2 with enemy general at 15 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(100);

			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 6, 6);
			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 10);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 6/6 with enemy general at 15 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(170);

			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 10, 10);
			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 24);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 10/10 with enemy general at 1 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(79);

			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 1, 1);
			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 0);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 1/1 with enemy general at 25 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(80);

			var position = ranged1.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(ranged1.getPosition(), 2, 2);
			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 10);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged friendly 2/2 with own general at 15 HP", " = ", bestPositionAndScore.score);
			}

			var position = ranged1.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(ranged1.getPosition(), 2, 2);
			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 24);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged friendly 2/2 with own general at 1 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(250);

			var position = ranged1.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(ranged1.getPosition(), 2, 24);
			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 24);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged friendly 2/24 with own general at 1 HP", " = ", bestPositionAndScore.score);
			}

			var position = deathwatch2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(deathwatch2.getPosition(), 2, 2);
			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 10);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a deathwatch enemy 2/2 with enemy general at 15 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(150);

			var position = deathwatch2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(deathwatch2.getPosition(), 2, 2);
			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 24);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a deathwatch enemy 2/2 with enemy general at 1 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(-20);

			var position = deathwatch2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(deathwatch2.getPosition(), 6, 6);
			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 24);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a deathwatch enemy 6/6 with enemy general at 10 HP", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(30);
		});
		it('True Strike', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.TrueStrike}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 0, 0, gameSession.getPlayer1Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer2Id());
			var ranged1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 0, 1, gameSession.getPlayer1Id());
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer2Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var position = golem2.getPosition();
			var positions = [position];

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 2/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(20);

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 15, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 15/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(300);

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 15, 3);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 15/3", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(20);

			var position = ranged2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 2/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(130);

			var position = ranged2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 2, 3);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 2/3", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(10);

			var position = ranged2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 15, 3);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 15/3", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(35);
		});
		it('Beam Shock', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.BeamShock}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 0, 0, gameSession.getPlayer1Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer2Id());
			var ranged1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 0, 1, gameSession.getPlayer1Id());
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer2Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var position = golem2.getPosition();
			var positions = [position];

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 2/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(3);

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 15, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 15/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(25);

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 15, 3);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 15/3", " = ", bestPositionAndScore.score);
			}

			var position = ranged2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 2/2", " = ", bestPositionAndScore.score);
			}

			var position = ranged2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 2, 3);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 2/3", " = ", bestPositionAndScore.score);
			}

			var position = ranged2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 15, 3);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 15/3", " = ", bestPositionAndScore.score);
			}
		});
		it('Holy Immolation', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.HolyImmolation}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 2, gameSession.getPlayer1Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer2Id());
			var ranged1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 0, 1, gameSession.getPlayer1Id());
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer2Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var position = golem1.getPosition();
			var positions = [position];

			UtilsSDK.modifyUnitStats(golem1.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a full health 2/2 with an enemy deathwatch 2/2, enemy ranged 3/2, and 25 HP enemy general nearby", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(golem1.getPosition(), 2, 6);
			UtilsSDK.modifyUnitStats(golem1.getPosition(), null, null, 4);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a damaged 2/2 (originally 2/6) with an enemy deathwatch 2/2, enemy ranged 3/2, and 25 HP enemy general nearby", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(golem1.getPosition(), 2, 6);
			UtilsSDK.modifyUnitStats(golem1.getPosition(), null, null, 4);
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 3, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a damaged 2/2 (originally 2/6) with an enemy deathwatch 2/2, enemy ranged 3/6, and 25 HP enemy general nearby", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(golem1.getPosition(), 2, 6);
			UtilsSDK.modifyUnitStats(golem1.getPosition(), null, null, 4);

			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 3, 6);
			UtilsSDK.modifyUnitStats(deathwatch2.getPosition(), 2, 5);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a damaged 2/2 (originally 2/6) with an enemy deathwatch 2/5, enemy ranged 3/6, and 15 HP enemy general nearby", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(golem1.getPosition(), null, null, 0);
			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 20);
			//var intent = CardIntent.getIntentsByIntentType(card.getId(), CardIntentType.Burn)[0];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a full health 2/6 with an enemy deathwatch 2/5, enemy ranged 3/6, and 5 HP enemy general nearby", " = ", bestPositionAndScore.score);
			}
		});
		it('Phoenix Fire', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 0, 0, gameSession.getPlayer1Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer2Id());
			var ranged1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 0, 1, gameSession.getPlayer1Id());
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer2Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var position = golem2.getPosition();
			var positions = [position];

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 2/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(18);

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 15, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 15/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(300);

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 15, 4);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 15/4", " = ", bestPositionAndScore.score);
			}

			var position = ranged2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 2/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(120);

			var position = ranged2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 2, 4);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 2/4", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(10);

			var position = ranged2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 15, 4);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 15/4", " = ", bestPositionAndScore.score);
			}

			var position = gameSession.getGeneralForPlayer2().getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 0);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on 25 HP enemy general", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(20);

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 10);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on 15 HP enemy general", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 20);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on 5 HP enemy general", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(30);

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 22);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on 3 HP enemy general", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(1000);
		});
		it('Kage Lightning', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.KageLightning}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 0, 0, gameSession.getPlayer1Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer2Id());
			var ranged1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 0, 1, gameSession.getPlayer1Id());
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer2Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var position = golem2.getPosition();
			var positions = [position];

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 2/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(8);

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 15, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 15/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(250);

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 15, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 15/6", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(50);

			var position = ranged2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 2/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(100);

			var position = ranged2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 2, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 2/6", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(30);

			var position = ranged2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 15, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 15/6", " = ", bestPositionAndScore.score);
			}
		});
		it('Spiral Technique', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpiralTechnique}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 0, 0, gameSession.getPlayer1Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer2Id());
			var ranged1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 0, 1, gameSession.getPlayer1Id());
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer2Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var position = golem2.getPosition();
			var positions = [position];

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 2/2", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 15, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 15/2", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 15, 9);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 15/9", " = ", bestPositionAndScore.score);
			}

			var position = ranged2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 2/2", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 6, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 6/6", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 2, 9);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 2/9", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 15, 9);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 15/9", " = ", bestPositionAndScore.score);
			}

			var position = gameSession.getGeneralForPlayer2().getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 0);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on 25 HP enemy general", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 10);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on 15 HP enemy general", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 15);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on 10 HP enemy general", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(80);

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 22);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on 3 HP enemy general", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(1000);
		});
		it('Onyx Bear Seal', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.OnyxBearSeal}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 0, 0, gameSession.getPlayer1Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer2Id());
			var ranged1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 0, 1, gameSession.getPlayer1Id());
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer2Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var position = golem2.getPosition();
			var positions = [position];

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 2/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(10);

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 5, 5);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 5/5", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(23);

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 10, 10);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 10/10", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(70);

			var position = ranged2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 2/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(40);

			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 6, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 6/6", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 10, 10);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 10/10", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 1, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 1/1", " = ", bestPositionAndScore.score);
			}

			var position = deathwatch2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(deathwatch2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a deathwatch enemy 2/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(60);

			var position = deathwatch2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(deathwatch2.getPosition(), 10, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a deathwatch enemy 10/1", " = ", bestPositionAndScore.score);
			}

			var position = deathwatch2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(deathwatch2.getPosition(), 6, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a deathwatch enemy 6/6", " = ", bestPositionAndScore.score);
			}
		});
		it('Ghost Lightning', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.GhostLightning}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 0, 0, gameSession.getPlayer1Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer2Id());
			var ranged1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 0, 1, gameSession.getPlayer1Id());
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer2Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var position = golem2.getPosition();
			var positions = [position];

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 2/2, ranged 3/2, and deathwatcher 2/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(25);

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 2, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 2/1, ranged 3/2, and deathwatcher 2/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(45);

			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 3, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 2/1, ranged 3/1, and deathwatcher 2/2", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(deathwatch2.getPosition(), 2, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 2/1, ranged 3/1, and deathwatcher 2/1", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(300);
		});
		it('Metamorphosis', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Metamorphosis}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer2Id());
			var position = golem2.getPosition();
			var positions = [position];

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 2/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(6);

			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer2Id());
			UtilsSDK.modifyUnitStats(golem2.getPosition(), 2, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 2/1, ranged 3/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(50);

			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 3, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 2/1, ranged 3/1, and deathwatcher 2/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(100);

			UtilsSDK.modifyUnitStats(deathwatch2.getPosition(), 2, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 2/1, ranged 3/1, and deathwatcher 2/1", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(100);
		});
		it('Dominate Will', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Enslave}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 0, 0, gameSession.getPlayer1Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer2Id());
			var ranged1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 0, 1, gameSession.getPlayer1Id());
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer2Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var position = golem2.getPosition();
			var positions = [position];

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 2/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(23);

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 5, 5);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 5/5", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(80);

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 10, 10);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 10/10", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(200);

			var position = ranged2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 2/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(100);

			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 6, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 6/6", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 10, 10);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 10/10", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(280);

			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 1, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 1/1", " = ", bestPositionAndScore.score);
			}

			var position = deathwatch2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(deathwatch2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a deathwatch enemy 2/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(160);

			var position = deathwatch2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(deathwatch2.getPosition(), 10, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a deathwatch enemy 10/1", " = ", bestPositionAndScore.score);
			}

			var position = deathwatch2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(deathwatch2.getPosition(), 6, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a deathwatch enemy 6/6", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(200);
		});
		it('Sunbloom', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SunBloom}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var grow2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.EarthWalker}, 7, 2, gameSession.getPlayer2Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer2Id());
			var blast2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 6, 2, gameSession.getPlayer2Id());
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer2Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var position = grow2.getPosition();
			var positions = [position];

			UtilsSDK.modifyUnitStats(grow2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a grow enemy 2/2 and deathwatch 2/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(180);

			UtilsSDK.modifyUnitStats(grow2.getPosition(), 5, 5);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a grow enemy 5/5 and deathwatch 2/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(180);

			var position = blast2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(blast2.getPosition(), 1, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a blast enemy 1/1, grow enemy 5/5, and deathwatch 2/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(250);

			UtilsSDK.modifyUnitStats(blast2.getPosition(), 5, 5);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a blast enemy 5/5, grow enemy 5/5, and deathwatch 2/2", " = ", bestPositionAndScore.score);
			}

			var position = ranged2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 2/2 and a grow enemy 5/5", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(150);

			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 6, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 6/6 and a grow enemy 5/5", " = ", bestPositionAndScore.score);
			}

			var position = golem2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(golem2.getPosition(), 10, 10);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 10/10 and a ranged enemy 6/6", " = ", bestPositionAndScore.score);
			}

			var position = ranged2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 1, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 1/1 and a grow enemy 5/5", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(150);

			var position = deathwatch2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(deathwatch2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on only a deathwatch enemy 2/2", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(80);

			var position = deathwatch2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(deathwatch2.getPosition(), 10, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on only a deathwatch enemy 10/1", " = ", bestPositionAndScore.score);
			}

			var position = deathwatch2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(deathwatch2.getPosition(), 6, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on only a deathwatch enemy 6/6", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(88);
		});
		it('Siphon Energy', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SiphonEnergy}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var grow2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.EarthWalker}, 0, 0, gameSession.getPlayer2Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer2Id());
			var blast2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 0, 1, gameSession.getPlayer2Id());
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer2Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var position = grow2.getPosition();
			var positions = [position];

			UtilsSDK.modifyUnitStats(grow2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a grow enemy 2/2", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(grow2.getPosition(), 5, 5);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a grow enemy 5/5", " = ", bestPositionAndScore.score);
			}

			var position = blast2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(blast2.getPosition(), 1, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a blast enemy 1/1", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(blast2.getPosition(), 5, 5);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a blast enemy 5/5", " = ", bestPositionAndScore.score);
			}

			var position = ranged2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 2/2", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 6, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 6/6", " = ", bestPositionAndScore.score);
			}

			var position = golem2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(golem2.getPosition(), 10, 10);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 10/10", " = ", bestPositionAndScore.score);
			}

			var position = ranged2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 1, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 1/1", " = ", bestPositionAndScore.score);
			}

			var position = deathwatch2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(deathwatch2.getPosition(), 2, 2);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a deathwatch enemy 2/2", " = ", bestPositionAndScore.score);
			}

			var position = deathwatch2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(deathwatch2.getPosition(), 10, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a deathwatch enemy 10/1", " = ", bestPositionAndScore.score);
			}

			var position = deathwatch2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(deathwatch2.getPosition(), 6, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a deathwatch enemy 6/6", " = ", bestPositionAndScore.score);
			}
		});
		it('Mana Vortex', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpiralTechnique}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpiralTechnique}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ManaVortex}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpiralTechnique}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var grow2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.EarthWalker}, 0, 0, gameSession.getPlayer2Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer2Id());
			var blast2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 0, 1, gameSession.getPlayer2Id());
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer2Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var position = grow2.getPosition();
			var positions = [position];

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a spiral technique in hand = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(40);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpiralTechnique}));
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with 2 spiral techniques in hand = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(50);

			player1.remainingMana = 5;
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with 2 spiral techniques in hand but only 5 mana = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(50);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with 2 spiral techniques and 1 phoenix fire in hand but only 5 mana = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(50);
		});
		it('Flash Reincarnation', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.FlashReincarnation}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var grow2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.EarthWalker}, 0, 0, gameSession.getPlayer1Id());
			var position = grow2.getPosition();
			var positions = [position];

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with no minions in hand = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(10);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.StormmetalGolem}));
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with 1 minion in hand = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(20);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.SkyrockGolem}));
			player1.remainingMana = 3;
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with 2 minions in hand but only the mana to play 1 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(40);

			player1.remainingMana = 9;
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with 2 minions in hand and the mana to play both = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(50);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.SkyrockGolem}));
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with 3 minions in hand and the mana to play any = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(80);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.SkyrockGolem}));
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with 4 minions in hand and the mana to play any = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(100);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.SkyrockGolem}));
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with 5 minions in hand and the mana to play any = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(120);
		});
		it('Heavens Eclipse', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.HeavensEclipse}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.HeavensEclipse}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.HeavensEclipse}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.HeavensEclipse}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.HeavensEclipse}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.HeavensEclipse}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var grow2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.EarthWalker}, 0, 0, gameSession.getPlayer2Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer2Id());
			var blast2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 0, 1, gameSession.getPlayer2Id());
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer2Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var position = grow2.getPosition();
			var positions = [position];

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with 1 card in hand = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(60);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpiralTechnique}));
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with 2 cards in hand = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(30);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpiralTechnique}));
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with 3 cards in hand = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(25);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpiralTechnique}));
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with 4 cards in hand = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(-10);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpiralTechnique}));
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with 5 cards in hand = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(-50);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpiralTechnique}));
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with 6 cards in hand = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(-100);
		});
		it('Aerial Rift', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AerialRift}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var grow2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.EarthWalker}, 0, 0, gameSession.getPlayer2Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer2Id());
			var blast2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 0, 1, gameSession.getPlayer2Id());
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer2Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var position = grow2.getPosition();
			var positions = [position];

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpiralTechnique}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpiralTechnique}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpiralTechnique}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpiralTechnique}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpiralTechnique}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpiralTechnique}));

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with 1 spell in hand = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(30);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.SkyrockGolem}));
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with 1 spell and 1 minion in hand = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(20);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.SkyrockGolem}));
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with 1 spell and 2 minions in hand = ", bestPositionAndScore.score);
			}

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.SkyrockGolem}));
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with 1 spell and 3 minions in hand = ", bestPositionAndScore.score);
			}

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.SkyrockGolem}));
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with 1 spell and 4 minions in hand = ", bestPositionAndScore.score);
			}

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.SkyrockGolem}));
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with 1 spell and 5 minions in hand = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(0);

		});
		it('Greater Fortitude', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.GreaterFortitude}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var grow2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.EarthWalker}, 0, 0, gameSession.getPlayer1Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer1Id());
			var blast2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 0, 1, gameSession.getPlayer1Id());
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer1Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer1Id());
			var position = golem2.getPosition();
			var positions = [position];

			var position = golem2.getPosition();
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla 3/2 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(10);

			var position = grow2.getPosition();
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a grow 3/3 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(70);

			var position = ranged2.getPosition();
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged 3/2 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(50);
		});
		it('Auryn Nexus', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AurynNexus}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var grow2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.EarthWalker}, 0, 0, gameSession.getPlayer1Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer1Id());
			var blast2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 0, 1, gameSession.getPlayer1Id());
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer1Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer1Id());
			var position = golem2.getPosition();
			var positions = [position];

			var position = golem2.getPosition();
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla 3/2 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(10);

			var position = grow2.getPosition();
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a grow 3/3 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(55);

			var position = ranged2.getPosition();
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged 3/2 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(45);
		});
		it('Amplification', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Amplification}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var grow2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.EarthWalker}, 0, 0, gameSession.getPlayer1Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer1Id());
			var blast2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 0, 1, gameSession.getPlayer1Id());
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer1Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer1Id());
			var position = golem2.getPosition();
			var positions = [position];

			var position = golem2.getPosition();
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a full health vanilla 3/2 = ", bestPositionAndScore.score);
			}

			golem2.setDamage(1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a damaged vanilla 3/2 = ", bestPositionAndScore.score);
			}

			var position = grow2.getPosition();
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a grow 3/3 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(110);

			var position = ranged2.getPosition();
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged 3/2 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(86);
		});
		it('Lasting Judgement', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.LastingJudgement}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var grow2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.EarthWalker}, 0, 0, gameSession.getPlayer1Id());
			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 4, 0, gameSession.getPlayer1Id());
			var ranged1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 5, 1, gameSession.getPlayer1Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer2Id());
			var blast2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 0, 1, gameSession.getPlayer2Id());
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer2Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var position = golem1.getPosition();
			var positions = [position];

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a friendly vanilla 3/2 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(-15);

			UtilsSDK.modifyUnitStats(position, 5, 5);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a friendly vanilla 5/5 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(0);

			UtilsSDK.modifyUnitStats(position, 2, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a friendly vanilla 2/1 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(-8);

			var position = ranged1.getPosition();
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on an friendly ranged 3/2 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(-80);

			var position = golem2.getPosition();
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on an enemy vanilla 3/2 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(20);

			UtilsSDK.modifyUnitStats(position, 5, 5);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on an enemy vanilla 5/5 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(2);

			var position = ranged2.getPosition();
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on an enemy ranged 3/2 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(80);

			var position = deathwatch2.getPosition();
			UtilsSDK.modifyUnitStats(position, 3, 4);
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on an enemy deathwatch 3/4 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(7);

			UtilsSDK.modifyUnitStats(position, 10, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on an enemy deathwatch 10/1 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(200);
		});
		it('Aspect of the Fox', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AspectOfTheWolf}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var grow2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.EarthWalker}, 0, 0, gameSession.getPlayer1Id());
			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 4, 0, gameSession.getPlayer1Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer2Id());
			var blast2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 0, 1, gameSession.getPlayer2Id());
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer2Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var position = golem1.getPosition();
			var positions = [position];

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a friendly vanilla 3/2 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(5);

			UtilsSDK.modifyUnitStats(position, 0, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a friendly vanilla 0/1 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(15);

			UtilsSDK.modifyUnitStats(position, 5, 5);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a friendly vanilla 5/5 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(-5);

			var position = golem2.getPosition();
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on an enemy vanilla 3/2 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(0);

			UtilsSDK.modifyUnitStats(position, 5, 5);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on an enemy vanilla 5/5 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(10);

			var position = ranged2.getPosition();
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on an enemy ranged 3/2 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(30);

			var position = deathwatch2.getPosition();
			UtilsSDK.modifyUnitStats(position, 0, 1);
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on an enemy deathwatch 0/1 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(35);

			UtilsSDK.modifyUnitStats(position, 10, 10);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on an enemy deathwatch 10/10 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(110);
		});
		it('Inner Focus', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.InnerFocus}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var grow2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.EarthWalker}, 0, 0, gameSession.getPlayer1Id());
			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 4, 0, gameSession.getPlayer1Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer2Id());
			var blast2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 0, 1, gameSession.getPlayer2Id());
			var ranged1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer1Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var position = golem1.getPosition();
			var positions = [position];

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a friendly vanilla 3/2 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(15);

			UtilsSDK.modifyUnitStats(position, 5, 5);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a friendly vanilla 5/5 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(40);

			var position = ranged1.getPosition();
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a friendly ranged 3/2 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(70);
		});
		it('Spirit of the Wild', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpiritoftheWild}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var grow1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.EarthWalker}, 7, 4, gameSession.getPlayer1Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var position = grow1.getPosition();
			var positions = [position];

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a grow 3/3 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(110);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 5, 0, gameSession.getPlayer1Id());
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a grow 3/3, vanilla 3/2 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(130);

			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer1Id());
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a grow 3/3, vanilla 3/2 x2 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(150);

			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer1Id());
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a grow 3/3, vanilla 3/2 x2, ranged 3/2 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(230);

			var mechaz0r = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Mechaz0r}, 6, 0, gameSession.getPlayer1Id());
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a grow 3/3, vanilla 3/2 x2, ranged 3/2, mechaz0r = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(400);
		});
		it('Bloodtear Alchemist (followup)', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.BloodtearAlchemist}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);
			var grow1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.EarthWalker}, 7, 4, gameSession.getPlayer2Id());

			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var position = grow1.getPosition();
			var positions = card.getValidTargetPositions();

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 3/3 grow at x7 y4, and 2/2 deathwatch at x7 y3 = ", bestPositionAndScore.score, "w/ followup positions", positionsScoresAndFollowups.followupPositions[0]);
			}

			expect(bestPositionAndScore.score).to.be.above(38);

			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.Heartseeker}, 7, 1, gameSession.getPlayer2Id());
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 1/1 ranged at x7 y1, 3/3 grow at x7 y4, and 2/2 deathwatch at x7 y3 = ", bestPositionAndScore.score, "w/ followup positions", positionsScoresAndFollowups.followupPositions[0]);
			}

			expect(bestPositionAndScore.score).to.be.above(130);

			UtilsSDK.modifyUnitStats(position, 15, 1);
			var position = ranged2.getPosition();
			UtilsSDK.modifyUnitStats(position, 1, 10);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 1/10 ranged at x7 y1, 15/1 grow at x7 y4, and 2/2 deathwatch at x7 y3 = ", bestPositionAndScore.score, "w/ followup positions", positionsScoresAndFollowups.followupPositions[0]);
			}

			expect(bestPositionAndScore.score).to.be.above(480);
		});
		it('Ephemeral Shroud (followup)', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.EphemeralShroud}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);
			var blast2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 6, 3, gameSession.getPlayer2Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var position = blast2.getPosition();
			var positions = card.getValidTargetPositions();

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "2/1 blast at x6 y3, and 2/2 deathwatch at x7 y3 = ", bestPositionAndScore.score, "w/ followup positions", positionsScoresAndFollowups.followupPositions[0]);
			}

			expect(bestPositionAndScore.score).to.be.above(12);

			UtilsSDK.modifyUnitStats(position, 15, 1);
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.Heartseeker}, 2, 2, gameSession.getPlayer2Id());
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 1/1 ranged at x2 y2, 15/1 blast at x6 y3, and 2/2 deathwatch at x7 y3 = ", bestPositionAndScore.score, "w/ followup positions", positionsScoresAndFollowups.followupPositions[0]);
			}

			expect(bestPositionAndScore.score).to.be.above(80);

			var deathwatch3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 2, 3, gameSession.getPlayer2Id());
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 1, 10);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 1/10 ranged at x2 y2, 15/1 blast at x6 y3, 2/2 deathwatch at x7 y3, and 2/2 deathwatch at x2 y3 = ", bestPositionAndScore.score, "w/ followup positions", positionsScoresAndFollowups.followupPositions[0]);
			}

			expect(bestPositionAndScore.score).to.be.above(100);
		});
		it('Healing Mystic (followup)', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.HealingMystic}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.Heartseeker}, 7, 1, gameSession.getPlayer1Id());
			var blast2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 6, 3, gameSession.getPlayer1Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer1Id());
			var position = blast2.getPosition();
			var positions = card.getValidTargetPositions();
			var generalPosition = {x:0, y:2};
			var enemyGeneralPosition = {x:8, y:2};

			UtilsSDK.modifyUnitStats(generalPosition, null, null, 10);
			UtilsSDK.modifyUnitStats(enemyGeneralPosition, null, null, 10);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 10 health damaged friendly general at x0 y2, 10 health damaged enemy general at x8 y2, 1/1 ranged at x7 y1, 2/1 blast at x6 y3, and 2/2 deathwatch at x7 y3 = ", bestPositionAndScore.score, "w/ followup positions", positionsScoresAndFollowups.followupPositions[0]);
			}

			expect(bestPositionAndScore.score).to.be.above(55);

			UtilsSDK.modifyUnitStats(position, 3, 15, 14);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 1/1 ranged at x7 y1, 3/15 blast who's been damaged 14 at x6 y3, and 2/2 deathwatch at x7 y3 = ", bestPositionAndScore.score, "w/ followup positions", positionsScoresAndFollowups.followupPositions[0]);
			}

			expect(bestPositionAndScore.score).to.be.above(160);

			var deathwatch3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 6, 1, gameSession.getPlayer2Id());
			var position = ranged2.getPosition();
			UtilsSDK.modifyUnitStats(position, 1, 10);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 1/10 ranged at x7 y1, 3/15 blast who's been damaged 14 at x6 y3, 2/2 deathwatch at x7 y3, and a 2/2 deathwatch at x6 y1= ", bestPositionAndScore.score, "w/ followup positions", positionsScoresAndFollowups.followupPositions[0]);
			}

			expect(bestPositionAndScore.score).to.be.above(160);
		});
		it('Primus Fist (followup)', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.PrimusFist}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.Heartseeker}, 7, 1, gameSession.getPlayer1Id());
			var blast2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 6, 3, gameSession.getPlayer1Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer1Id());
			var positions = card.getValidTargetPositions();

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 1/1 ranged at x7 y1, 2/1 blast at x6 y3, and 2/2 deathwatch at x7 y3 = ", bestPositionAndScore.score, "w/ followup positions", positionsScoresAndFollowups.followupPositions[0]);
			}

			expect(bestPositionAndScore.score).to.be.above(50);
		});
		it('Dark Transformation', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.DarkTransformation}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var grow1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.EarthWalker}, 7, 4, gameSession.getPlayer2Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var position = grow1.getPosition();
			var positions = [position];

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a grow 3/3 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(180);
		});
		it('Arclyte Sentinel (followup)', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.ArclyteSentinel}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.Heartseeker}, 1, 1, gameSession.getPlayer2Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.HailstoneGolem}, 0, 1, gameSession.getPlayer2Id());
			var blast2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.StarfireScarab}, 0, 3, gameSession.getPlayer2Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 1, 3, gameSession.getPlayer2Id());
			var position = blast2.getPosition();
			var positions = card.getValidTargetPositions();

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 1/1 ranged (1,1), 4/6 blast (0,3), and 2/2 deathwatch (1,3) = ", bestPositionAndScore.score, "w/ followup positions", positionsScoresAndFollowups.followupPositions[0]);
			}

			expect(bestPositionAndScore.score).to.be.above(160);

			UtilsSDK.modifyUnitStats(position, 15, 1);
			var position = deathwatch2.getPosition();
			UtilsSDK.modifyUnitStats(position, 2, 3);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 1/1 ranged (1,1), 15/1 blast (0,3), and 2/3 deathwatch (1,3) = ", bestPositionAndScore.score, "w/ followup positions", positionsScoresAndFollowups.followupPositions[0]);
			}

			expect(bestPositionAndScore.score).to.be.above(100);

			var position = ranged2.getPosition();
			UtilsSDK.modifyUnitStats(position, 1, 10);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 1/10 ranged (1/1), 15/1 blast (0,3), and 2/3 deathwatchs (1,3) = ", bestPositionAndScore.score, "w/ followup positions", positionsScoresAndFollowups.followupPositions[0]);
			}

			expect(bestPositionAndScore.score).to.be.above(30);
		});
		it('Blood Siren (followup)', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.DarkSiren}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.Heartseeker}, 1, 1, gameSession.getPlayer2Id());
			var blast2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 0, 3, gameSession.getPlayer2Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 1, 3, gameSession.getPlayer2Id());
			var position = blast2.getPosition();
			var positions = card.getValidTargetPositions();

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 1/1 ranged (1,1), 2/1 blast (0,3), and 2/2 deathwatch (1,3) = ", bestPositionAndScore.score, "w/ followup positions", positionsScoresAndFollowups.followupPositions[0]);
			}

			expect(bestPositionAndScore.score).to.be.above(50);

			UtilsSDK.modifyUnitStats(position, 15, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 1/1 ranged (1,1), 15/1 blast (0,3), and 2/2 deathwatch (1,3) = ", bestPositionAndScore.score, "w/ followup positions", positionsScoresAndFollowups.followupPositions[0]);
			}

			expect(bestPositionAndScore.score).to.be.above(90);

			var deathwatch3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 0, 1, gameSession.getPlayer2Id());
			UtilsSDK.modifyUnitStats(position, 1, 10);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 1/10 ranged (1,1), 15/1 blast (0,3), and 2 2/2 deathwatchs (1,3)(0,1) = ", bestPositionAndScore.score, "w/ followup positions", positionsScoresAndFollowups.followupPositions[0]);
			}

			expect(bestPositionAndScore.score).to.be.above(50);
		});
		it('Nightsorrow Assassin (followup)', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.NightsorrowAssassin}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 1, 1, gameSession.getPlayer2Id());
			var blast2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 0, 3, gameSession.getPlayer2Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 1, 3, gameSession.getPlayer2Id());
			var position = blast2.getPosition();
			var positions = card.getValidTargetPositions();

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 3/2 ranged (1,1), 2/1 blast (0,3), and 2/2 deathwatch (1,3) = ", bestPositionAndScore.score, "w/ followup positions", positionsScoresAndFollowups.followupPositions[0]);
			}

			expect(bestPositionAndScore.score).to.be.above(190);

			UtilsSDK.modifyUnitStats(position, 15, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 3/2 ranged (1,1), 15/1 blast (0,3), and 2/2 deathwatch (1,3) = ", bestPositionAndScore.score, "w/ followup positions", positionsScoresAndFollowups.followupPositions[0]);
			}

			expect(bestPositionAndScore.score).to.be.above(190);

			var deathwatch3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 0, 1, gameSession.getPlayer2Id());
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 3/2 ranged (1,1), 15/1 blast (0,3), and 2 2/2 deathwatchs (1,3)(0,1) = ", bestPositionAndScore.score, "w/ followup positions", positionsScoresAndFollowups.followupPositions[0]);
			}

			expect(bestPositionAndScore.score).to.be.above(190);
		});
		it('Crossbones (followup)', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Crossbones}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 1, 1, gameSession.getPlayer2Id());
			var blast2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 0, 3, gameSession.getPlayer2Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 1, 3, gameSession.getPlayer2Id());
			var position = blast2.getPosition();
			var positions = card.getValidTargetPositions();

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 3/2 ranged (1,1), 2/1 blast (0,3), and 2/2 deathwatch (1,3) = ", bestPositionAndScore.score, "w/ followup positions", positionsScoresAndFollowups.followupPositions[0]);
			}

			expect(bestPositionAndScore.score).to.be.above(160);

			UtilsSDK.modifyUnitStats(position, 15, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 3/2 ranged (1,1), 15/1 blast (0,3), and 2/2 deathwatch (1,3) = ", bestPositionAndScore.score, "w/ followup positions", positionsScoresAndFollowups.followupPositions[0]);
			}

			expect(bestPositionAndScore.score).to.be.above(160);

			var deathwatch3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 0, 1, gameSession.getPlayer2Id());
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 3/2 ranged (1,1), 15/1 blast (0,3), and 2 2/2 deathwatchs (1,3)(0,1) = ", bestPositionAndScore.score, "w/ followup positions", positionsScoresAndFollowups.followupPositions[0]);
			}

			expect(bestPositionAndScore.score).to.be.above(160);
		});
		it('Shadow Watcher', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.ShadowWatcher}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ValeHunter}, 7, 1, gameSession.getPlayer2Id());
			var position = ranged2.getPosition();
			var positions = card.getValidTargetPositions();

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 1/2 on board = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(125);

			var blast2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 6, 3, gameSession.getPlayer2Id());

			UtilsSDK.modifyUnitStats(position, 15, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 1/2 and a 15/1 on board = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(150);

			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var deathwatch3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 6, 1, gameSession.getPlayer2Id());
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 1/2, 15/1, and 2 2/2s on board = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(190);
		});
		it('Shadow Dancer', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.SharianShadowdancer}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ValeHunter}, 7, 1, gameSession.getPlayer2Id());
			var position = ranged2.getPosition();
			var positions = card.getValidTargetPositions();

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 1/2 on board with both generals full health = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(100);

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 20);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 1/2 on board with own general at 5 health = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(220);

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 23);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 1/2 on board with own general at 5 health and enemy general at 2 health = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(300);

			var blast2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 6, 3, gameSession.getPlayer2Id());

			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 0);
			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer1().getPosition(), null, null, 0);
			UtilsSDK.modifyUnitStats(position, 15, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 1/2 and a 15/1 on board both generals at full health = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(100);

			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var deathwatch3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 6, 1, gameSession.getPlayer2Id());
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 1/2, 15/1, and 2 2/2s on board both generals at full health = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(120);
		});
		it('Aspect of the Fox', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AspectOfTheWolf}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 0, 0, gameSession.getPlayer1Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer2Id());
			var ranged1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 0, 1, gameSession.getPlayer1Id());
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer2Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var position = golem2.getPosition();
			var positions = [position];

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 1, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 1/1", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(golem1.getPosition(), 1, 1);
			var position = golem1.getPosition();
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla friendly 1/1", " = ", bestPositionAndScore.score);
			}

			UtilsSDK.modifyUnitStats(golem2.getPosition(), 15, 15);
			var position = golem2.getPosition();
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a vanilla enemy 15/15", " = ", bestPositionAndScore.score);
			}

			var position = ranged2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 1, 1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged enemy 1/1", " = ", bestPositionAndScore.score);
			}

			var position = deathwatch2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(deathwatch2.getPosition(), 5, 5);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a deathwatch enemy 5/5", " = ", bestPositionAndScore.score);
			}

			var position = ranged1.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(ranged1.getPosition(), 5, 5);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged friendly 5/5", " = ", bestPositionAndScore.score);
			}
		});
		it('Aspect of the Mountain', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AspectOfTheMountains}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 2, gameSession.getPlayer1Id());
			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer2Id());
			var ranged1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 0, 1, gameSession.getPlayer1Id());
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer2Id());
			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var deathwatch3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 4, 3, gameSession.getPlayer2Id());
			var position = golem1.getPosition();
			var positions = [position];

			UtilsSDK.modifyUnitStats(golem1.getPosition(), 6, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a full health 6/6 with an enemy deathwatch 2/2, enemy ranged 3/2, and 25 HP enemy general nearby", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(320);

			UtilsSDK.modifyUnitStats(golem1.getPosition(), 2, 6);
			UtilsSDK.modifyUnitStats(golem1.getPosition(), null, null, 4);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a damaged 2/2 (originally 2/6) with an enemy deathwatch 2/2, enemy ranged 3/2, and 25 HP enemy general nearby", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(350);

			UtilsSDK.modifyUnitStats(golem1.getPosition(), 2, 6);
			UtilsSDK.modifyUnitStats(golem1.getPosition(), null, null, 4);
			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 3, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a damaged 2/2 (originally 2/6) with an enemy deathwatch 2/2, enemy ranged 3/6, and 25 HP enemy general nearby", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(240);

			UtilsSDK.modifyUnitStats(golem1.getPosition(), 2, 6);
			UtilsSDK.modifyUnitStats(golem1.getPosition(), null, null, 4);

			UtilsSDK.modifyUnitStats(ranged2.getPosition(), 3, 6);
			UtilsSDK.modifyUnitStats(deathwatch2.getPosition(), 2, 5);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a damaged 2/2 (originally 2/6) with an enemy deathwatch 2/5, enemy ranged 3/6, and 15 HP enemy general nearby", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(275);

			UtilsSDK.modifyUnitStats(golem1.getPosition(), null, null, 0);
			UtilsSDK.modifyUnitStats(gameSession.getGeneralForPlayer2().getPosition(), null, null, 20);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a full health 2/6 with an enemy deathwatch 2/5, enemy ranged 3/6, and 5 HP enemy general nearby", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(1000);

			var position = ranged1.getPosition();
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a ranged friendly 3/2 isolated", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(0);

			var position = deathwatch3.getPosition();
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on an enemy deathwatch 2/2 isolated", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(50);
		});
		it('Natural Selection', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.NaturalSelection}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 2, gameSession.getPlayer1Id());
			var position = golem1.getPosition();
			var positions = [position];

			UtilsSDK.modifyUnitStats(golem1.getPosition(), 6, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a friendly 6/6 on board", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(-80);

			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 0, gameSession.getPlayer2Id());
			var position = golem2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(golem2.getPosition(), 6, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a friendly 6/6 and enemy 6/6 on board", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(85);

			var ranged1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 0, 1, gameSession.getPlayer1Id());
			var ranged2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 7, 1, gameSession.getPlayer2Id());

			var position = ranged2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(golem2.getPosition(), 6, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), " on  a 3/2 ranged", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(120);

			var deathwatch2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 7, 3, gameSession.getPlayer2Id());
			var deathwatch3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 4, 3, gameSession.getPlayer2Id());

			var position = deathwatch2.getPosition();
			var positions = [position];
			UtilsSDK.modifyUnitStats(golem2.getPosition(), 6, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), " on a 2/2 deathwatch", " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(159);
		});
		it('Daemonic Lure (followup)', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.DaemonicLure}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 2, 2, gameSession.getPlayer2Id());
			var position = golem2;
			var positions = [position];

			//UtilsSDK.modifyUnitStats(golem2.getPosition(), 6, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a 3/2 golem at x2, y2 with follow up location: ", positionsScoresAndFollowups.followupPositions[0], " = ", bestPositionAndScore.score);
			}

			//expect(bestPositionAndScore.score).to.be.above(0);
		});
		it('Orb Weaver (followup)', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction3.OrbWeaver}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var position = {x:1, y:1};
			var positions = [position];

			//UtilsSDK.modifyUnitStats(golem2.getPosition(), 6, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on tile x1, y1 with follow up location: ", positionsScoresAndFollowups.followupPositions[0], " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(35);
		});
		it('Gloom Chaser', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.GloomChaser}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var position = {x: 1, y:1};
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a tile x1, y1 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(40);
		});
		it('Wraithling Swarm (followup)', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.WraithlingSwarm}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 2, gameSession.getPlayer1Id());
			var position = {x: 1, y:1};
			var positions = [position];

			UtilsSDK.modifyUnitStats(golem1.getPosition(), 6, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a tile x1, y1 with follow up locations: ", positionsScoresAndFollowups.followupPositions[0], " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(44);
		});
		it('Sky Phalanx (followup)', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SkyPhalanx}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 2, gameSession.getPlayer1Id());
			var position = {x: 1, y:1};
			var positions = [position];

			UtilsSDK.modifyUnitStats(golem1.getPosition(), 6, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a tile x1, y1 with follow up locations: ", positionsScoresAndFollowups.followupPositions[0], " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(80);
		});
		it('Khymera', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Khymera}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 2, gameSession.getPlayer1Id());

			var position = {x: 1, y:1};
			var positions = [position];

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on tile x1, y1 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(80);
		});
		it('Chrysalis Burst', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ChrysalisBloom}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 2, gameSession.getPlayer1Id());

			var position = {x: 1, y:1};
			var positions = [position];

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on tile x1, y1 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(150);
		});
		it('Roar', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Roar}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 2, gameSession.getPlayer1Id());
			var ranged1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 5, 2, gameSession.getPlayer1Id());
			var deathwatch1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 4, 2, gameSession.getPlayer1Id());

			var position = golem1.getPosition();
			var positions = [position];

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on 3/2 golem = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(6);

			var position = ranged1.getPosition();
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on 3/2 ranged = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(20);

			var position = deathwatch1.getPosition();
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on 2/2 shadowwatcher = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(28);
		});
		it('Afterglow', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Afterglow}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 2, gameSession.getPlayer1Id());
			var ranged1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FireSpitter}, 5, 2, gameSession.getPlayer1Id());
			var deathwatch1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 4, 2, gameSession.getPlayer1Id());

			var position = golem1.getPosition();
			var positions = [position];

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a full health 3/2 golem = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(-10);

			golem1.setDamage(1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a 1 point damaged 3/2 golem = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(0);

			var position = ranged1.getPosition();
			UtilsSDK.modifyUnitStats(position, 6, 6);
			ranged1.setDamage(3);
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a 3 point damaged 6/6 ranged = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(37);

		});
		it('Arcane Heart', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ArcaneHeart}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var position = {x: 1, y: 1};
			var positions = [position];

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on x1, y1 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(20);
		});
		it('Iron Shroud', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.WindShroud}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var position = {x: 1, y: 1};
			var positions = [position];

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on x1, y1 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(15);
		});
		it('Shadow Spawn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Shadowspawn}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var position = {x: 1, y: 1};
			var positions = [position];

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on x1, y1 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(14);
		});
		it('Abyssal Scar', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.AbyssalScar}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 2, gameSession.getPlayer2Id());
			var ranged1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.Heartseeker}, 5, 2, gameSession.getPlayer2Id());
			var deathwatch1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 4, 2, gameSession.getPlayer2Id());

			var position = golem1.getPosition();
			var positions = [position];

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on 3/2 golem = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(29);

			golem1.setDamage(1);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on 3/1 golem = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(60);

			var position = ranged1.getPosition();
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on 1/1 ranged = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(150);

			var position = deathwatch1.getPosition();
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on 2/2 shadowwatcher = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(46);
		});
		it('Overload', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Overload}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var position = {x: 1, y: 1};
			var positions = [position];

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), " = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(15);
		});
		it('Seeking Eye', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SeekingEye}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.HeavensEclipse}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.HeavensEclipse}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.HeavensEclipse}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.HeavensEclipse}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.HeavensEclipse}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var position = {x: 1, y: 1};
			var positions = [position];

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with both generals at 0 cards = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(80);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SeekingEye}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SeekingEye}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SeekingEye}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.SeekingEye}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.SeekingEye}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.SeekingEye}));

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with both generals at 3 cards = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(50);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.SeekingEye}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.SeekingEye}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.SeekingEye}));

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with enemy general at 6 cards and own general at 3 = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(50);
		});
		it('Warbird', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Warbird}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var position = {x: 8, y: 2};
			var positions = [position];

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "when it hits only general = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(20);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 8, 3, gameSession.getPlayer2Id());
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "when it hits general and a 3/2 golem = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(50);

			var ranged1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.Heartseeker}, 8, 1, gameSession.getPlayer2Id());
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "when it hits general, a 3/2 golem, and a 1/1 ranged = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(170);

			var deathwatch1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 8, 4, gameSession.getPlayer2Id());
			UtilsSDK.modifyUnitStats(deathwatch1.getPosition, 6, 6);
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "when it hits general, a 3/2 golem, a 1/1 ranged, and a 6/6 deathwatch = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(350);
		});
		it('Kinetic Surge', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.KineticSurge}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var position = {x: 8, y: 2};
			var positions = [position];

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with 0 minions in hand = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(5);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.SkyrockGolem}));
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 3/2 golem in hand = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(7);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction2.Heartseeker}));
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 3/2 golem and 1/1 ranged in hand = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(33);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.ShadowWatcher}));
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "with a 3/2 golem, 1/1 ranged, and 2/2 shadowwatcher in hand = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(70);
		});
		it('Darkfire Sacrifice', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.DarkSacrifice}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 2, gameSession.getPlayer1Id());
			var khymera = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Khymera}, 4, 2, gameSession.getPlayer1Id());
			var deathwatch = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.ShadowWatcher}, 3, 2, gameSession.getPlayer1Id());
			var wraithling1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Wraithling}, 7, 3, gameSession.getPlayer1Id());

			var position = golem1.getPosition();
			var positions = [position];

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a 3/2 golem with no minions in hand = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(-20);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.VorpalReaver}));

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a 3/2 golem with a Vorpal Reaver in hand = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(0);

			var position = wraithling1.getPosition();
			var positions = [position];

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a wraithling with a Vorpal Reaver in hand = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(13);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.VorpalReaver}));
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a wraithling with 2 Vorpal Reavers in hand = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(38);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.VorpalReaver}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.VorpalReaver}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.VorpalReaver}));
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a wraithling with 5 Vorpal Reavers in hand = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(120);

			var position = golem1.getPosition();
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a 3/2 golem with 5 Vorpal Reavers in hand = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(100);

			var position = khymera.getPosition();
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a 5/12 Khymera with 5 Vorpal Reavers in hand = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(8);

			var position = deathwatch.getPosition();
			var positions = [position];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on a 2/2 deathwatch shadowwatcher with 5 Vorpal Reavers in hand = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(-20);
		});
		it('Keeper of the Vale', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.KeeperOfTheVale}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 2, gameSession.getPlayer1Id());
			var khymera = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Khymera}, 7, 3, gameSession.getPlayer1Id());

			var position = {x: 1, y:1};
			var positions = [position];

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on tile x1, y1 with 0 dead friendly units = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(16);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(1, 7, 2);
			gameSession.executeAction(playCardFromHandAction);

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on tile x1, y1 with 1 dead friendly 3/2 golem = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(50);

			khymera.setDamage(11);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(1, 7, 3);
			gameSession.executeAction(playCardFromHandAction);

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on tile x1, y1 with 1 dead friendly 3/2 golem and 1 dead friendly 5/12 Khymera = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(50);
		});
		it('Nether Summoning', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -500.0;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.NetherSummoning}));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 7, 2, gameSession.getPlayer1Id());
			var khymera = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Khymera}, 7, 3, gameSession.getPlayer1Id());

			var position = {x: 1, y:1};
			var positions = [position];

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on tile x1, y1 with 0 dead friendly units = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.below(10);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(1, 7, 2);
			gameSession.executeAction(playCardFromHandAction);

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on tile x1, y1 with 1 dead friendly 3/2 golem = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(18);

			khymera.setDamage(11);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(1, 7, 3);
			gameSession.executeAction(playCardFromHandAction);

			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, positions, useThreshold, true);
			var bestPositionAndScore = positionsScoresAndFollowups.positionsAndScores[0];
			if (bestPositionAndScore != null) {
				console.log("Score for", card.getName(), "on tile x1, y1 with 1 dead friendly 3/2 golem and 1 dead friendly 5/12 Khymera = ", bestPositionAndScore.score);
			}

			expect(bestPositionAndScore.score).to.be.above(36);
		});
		it('Summon Intent Tests', function () {
			//TEST FOR:
			//  ScoreForIntentSummon
			//LOCATED @:
			//  server/ai/scoring/intent/intent_summon
			//DESCRIPTION:
			//  (ScoreForUnit/5) + ScoreForCardAtTargetPosition [+15 IF BELOW 15]

			//cases: o,o alone, adjacent enemy general, surrounded by enemy units

			//let ScoreForIntentSummon = function (card, targetPosition, cardIntents)

			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = 0.0;
			player1.remainingMana = 9;

			UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SkyrockGolem}, 8, 3, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.PlanarScout }, 0));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			console.log("Summon Vanilla 2/1");
			var position_adjacentTo_enemyGeneral = [{ x: 7, y: 2 }];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, position_adjacentTo_enemyGeneral, useThreshold, true);
			var scoreForPosition_adjacentTo_enemyGeneral = positionsScoresAndFollowups.positionsAndScores[0];
			console.log("Good summon score for", card.getName(), " at " + position_adjacentTo_enemyGeneral[0].x + "," + position_adjacentTo_enemyGeneral[0].y + " (adjacent to enemy general) = ", scoreForPosition_adjacentTo_enemyGeneral.score);

			var position_AwayFromEnemyGeneral = [{ x: 0, y: 0 }];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, position_AwayFromEnemyGeneral, useThreshold, true);
			var scoreForPosition_AwayFromEnemyGeneral = positionsScoresAndFollowups.positionsAndScores[0];
			console.log("Bad summon score for", card.getName(), " at " + position_AwayFromEnemyGeneral[0].x + "," + position_AwayFromEnemyGeneral[0].y + " (away from everything) = ", scoreForPosition_AwayFromEnemyGeneral.score);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }, 0));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			console.log("Summon Vanilla 1/4");
			var position_adjacentTo_enemyGeneral = [{ x: 7, y: 2 }];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, position_adjacentTo_enemyGeneral, useThreshold, true);
			var scoreForPosition_adjacentTo_enemyGeneral = positionsScoresAndFollowups.positionsAndScores[0];
			console.log("Good summon score for", card.getName(), " at " + position_adjacentTo_enemyGeneral[0].x + "," + position_adjacentTo_enemyGeneral[0].y + " (adjacent to enemy general) = ", scoreForPosition_adjacentTo_enemyGeneral.score);

			var position_AwayFromEnemyGeneral = [{ x: 0, y: 0 }];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, position_AwayFromEnemyGeneral, useThreshold, true);
			var scoreForPosition_AwayFromEnemyGeneral = positionsScoresAndFollowups.positionsAndScores[0];
			console.log("Bad summon score for", card.getName(), " at " + position_AwayFromEnemyGeneral[0].x + "," + position_AwayFromEnemyGeneral[0].y + " (away from everything) = ", scoreForPosition_AwayFromEnemyGeneral.score);

			//expect
			expect(scoreForPosition_adjacentTo_enemyGeneral.score).to.be.above(scoreForPosition_AwayFromEnemyGeneral.score);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.SkyrockGolem }, 0));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			console.log("Summon Vanilla 3/2");
			var position_adjacentTo_enemyGeneral = [{ x: 7, y: 2 }];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, position_adjacentTo_enemyGeneral, useThreshold, true);
			var scoreForPosition_adjacentTo_enemyGeneral = positionsScoresAndFollowups.positionsAndScores[0];
			console.log("Good summon score for", card.getName(), " at " + position_adjacentTo_enemyGeneral[0].x + "," + position_adjacentTo_enemyGeneral[0].y + " (adjacent to enemy general) = ", scoreForPosition_adjacentTo_enemyGeneral.score);

			var position_AwayFromEnemyGeneral = [{ x: 0, y: 0 }];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, position_AwayFromEnemyGeneral, useThreshold, true);
			var scoreForPosition_AwayFromEnemyGeneral = positionsScoresAndFollowups.positionsAndScores[0];
			console.log("Bad summon score for", card.getName(), " at " + position_AwayFromEnemyGeneral[0].x + "," + position_AwayFromEnemyGeneral[0].y + " (away from everything) = ", scoreForPosition_AwayFromEnemyGeneral.score);

			//expect
			expect(scoreForPosition_adjacentTo_enemyGeneral.score).to.be.above(scoreForPosition_AwayFromEnemyGeneral.score);


			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.PrimusShieldmaster }, 0));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			console.log("Summon Provoke 3/6");
			var position_adjacentTo_enemyGeneral_enemyUnit = [{ x: 7, y: 2 }];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, position_adjacentTo_enemyGeneral_enemyUnit, useThreshold, true);
			var scoreForPosition_adjacentTo_enemyGeneral_enemyUnit = positionsScoresAndFollowups.positionsAndScores[0];
			console.log("Good summon score for", card.getName(), " at " + position_adjacentTo_enemyGeneral_enemyUnit[0].x + "," + position_adjacentTo_enemyGeneral_enemyUnit[0].y + " (adjacent to enemy general and enemy unit) = ", scoreForPosition_adjacentTo_enemyGeneral_enemyUnit.score);

			var position_adjacentTo_enemyGeneral = [{ x: 8, y: 1 }];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, position_adjacentTo_enemyGeneral, useThreshold, true);
			var scoreForPosition_adjacentTo_enemyGeneral = positionsScoresAndFollowups.positionsAndScores[0];
			console.log("Medium summon score for", card.getName(), " at " + position_adjacentTo_enemyGeneral[0].x + "," + position_adjacentTo_enemyGeneral[0].y + " (adjacent to enemy general) = ", scoreForPosition_adjacentTo_enemyGeneral.score);

			var position_AwayFromEnemyGeneral = [{ x: 0, y: 0 }];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, position_AwayFromEnemyGeneral, useThreshold, true);
			var scoreForPosition_AwayFromEnemyGeneral = positionsScoresAndFollowups.positionsAndScores[0];
			console.log("Bad summon score for", card.getName(), " at " + position_AwayFromEnemyGeneral[0].x + "," + position_AwayFromEnemyGeneral[0].y + " (away from everything) = ", scoreForPosition_AwayFromEnemyGeneral.score);

			//expect
			expect(scoreForPosition_adjacentTo_enemyGeneral_enemyUnit.score).to.be.above(scoreForPosition_adjacentTo_enemyGeneral.score);
			expect(scoreForPosition_adjacentTo_enemyGeneral.score).to.be.above(scoreForPosition_AwayFromEnemyGeneral.score);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.ValeHunter }, 0));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			console.log("Summon Ranged 1/2");
			var position_AwayFromEnemyGeneral = [{ x: 0, y: 0 }];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, position_AwayFromEnemyGeneral, useThreshold, true);
			var scoreForPosition_AwayFromEnemyGeneral = positionsScoresAndFollowups.positionsAndScores[0];
			console.log("Good summon score for", card.getName(), " at " + position_AwayFromEnemyGeneral[0].x + "," + position_AwayFromEnemyGeneral[0].y + " (away from everything) = ", scoreForPosition_AwayFromEnemyGeneral.score);

			var position_adjacentTo_enemyGeneral = [{ x: 7, y: 2 }];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, position_adjacentTo_enemyGeneral, useThreshold, true);
			var scoreForPosition_adjacentTo_enemyGeneral = positionsScoresAndFollowups.positionsAndScores[0];
			console.log("Bad summon score for", card.getName(), " at " + position_adjacentTo_enemyGeneral[0].x + "," + position_adjacentTo_enemyGeneral[0].y + " (adjacent to enemy general) = ", scoreForPosition_adjacentTo_enemyGeneral.score);

			//expect
			expect(scoreForPosition_adjacentTo_enemyGeneral.score).to.be.below(scoreForPosition_AwayFromEnemyGeneral.score);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.ShadowWatcher }, 0));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			console.log("Summon Deathwatch 2/2");
			var position_AwayFromEnemyGeneral = [{ x: 0, y: 0 }];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, position_AwayFromEnemyGeneral, useThreshold, true);
			var scoreForPosition_AwayFromEnemyGeneral = positionsScoresAndFollowups.positionsAndScores[0];
			console.log("Good summon score for", card.getName(), " at " + position_AwayFromEnemyGeneral[0].x + "," + position_AwayFromEnemyGeneral[0].y + " (away from everything) = ", scoreForPosition_AwayFromEnemyGeneral.score);

			var position_adjacentTo_enemyGeneral = [{ x: 7, y: 2 }];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, position_adjacentTo_enemyGeneral, useThreshold, true);
			var scoreForPosition_adjacentTo_enemyGeneral = positionsScoresAndFollowups.positionsAndScores[0];
			console.log("Bad summon score for", card.getName(), " at " + position_adjacentTo_enemyGeneral[0].x + "," + position_adjacentTo_enemyGeneral[0].y + " (adjacent to enemy general) = ", scoreForPosition_adjacentTo_enemyGeneral.score);

			//expect
			expect(scoreForPosition_adjacentTo_enemyGeneral.score).to.be.below(scoreForPosition_AwayFromEnemyGeneral.score);
		});
		it('Teleport Intent Tests', function () {
			//TEST FOR:
			//  ScoreForIntentTeleportTarget
			//  ScoreForIntentTeleportDestination
			//LOCATED @:
			//  server/ai/scoring/intent/intent_teleport_target
			//  server/ai/scoring/intent/intent_teleport_destination
			//DESCRIPTION:
			//  Target score = unit score / 10 + unit position score * -1 (if friendly) or +4 (if enemy)

			//let getScoreForTeleportTargetFromCardWithIntentToCard = function (card, intent, targetPosition)

			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var ai = new StarterAI(gameSession, player1.getPlayerId(), 1);
			var useThreshold = -999;
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Juxtaposition }));
			var deck = player1.getDeck();
			var card = deck.getCardInHandAtIndex(0);

			var golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SkyrockGolem }, 0, 0, gameSession.getPlayer1Id());
			var heartseeker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Heartseeker }, 7, 1, gameSession.getPlayer1Id());

			var position = [golem.getPosition()];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, position, useThreshold, true);
			var scoreForPosition_bad_meleePosition = positionsScoresAndFollowups.positionsAndScores[0];
			console.log("Score for teleport on badly-positioned friendly melee unit ", golem.getName(), " at " + position[0].x + "," + position[0].y + " = ", scoreForPosition_bad_meleePosition.score);

			var position = [heartseeker.getPosition()];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, position, useThreshold, true);
			var scoreForPosition_bad_rangedPosition = positionsScoresAndFollowups.positionsAndScores[0];
			console.log("Score for teleport on badly-positioned friendly ranged unit ", heartseeker.getName(), " at " + position[0].x + "," + position[0].y + " = ", scoreForPosition_bad_rangedPosition.score);

			var golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SkyrockGolem }, 7, 2, gameSession.getPlayer1Id());
			var heartseeker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Heartseeker }, 0, 1, gameSession.getPlayer1Id());

			var position = [golem.getPosition()];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, position, useThreshold, true);
			var scoreForPosition_good_meleePosition = positionsScoresAndFollowups.positionsAndScores[0];
			console.log("Score for teleport on well-positioned friendly melee unit ", golem.getName(), " at " + position[0].x + "," + position[0].y + " = ", scoreForPosition_good_meleePosition.score);

			var position = [heartseeker.getPosition()];
			var positionsScoresAndFollowups = ai._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, position, useThreshold, true);
			var scoreForPosition_good_rangedPosition = positionsScoresAndFollowups.positionsAndScores[0];
			console.log("Score for teleport on well-positioned friendly ranged unit ", heartseeker.getName(), " at " + position[0].x + "," + position[0].y + " = ", scoreForPosition_good_rangedPosition.score);

			expect(scoreForPosition_good_rangedPosition.score).to.be.below(scoreForPosition_bad_rangedPosition.score);
			expect(scoreForPosition_good_meleePosition.score).to.be.below(scoreForPosition_bad_meleePosition.score);
		});
	});

});
