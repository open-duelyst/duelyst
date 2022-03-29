"use strict";

const CardIntent = require("../../card_intent/card_intent");
const CardIntentType = require("../../card_intent/card_intent_type");
const CardPhaseType = require("../../card_intent/card_phase_type");
const CardTargetType = require("../../card_intent/card_target_type");
const ScoreForUnitRefresh = require("./../base/unit_refresh");
const _ = require("underscore");

/**
 * Returns the score for the damage dealt to a target card by a card.
 * @param {Card} card
 * @param {Object} intent
 * @param {Card} targetCard
 * @returns {Number}
 * @static
 * @public
 */
let getScoreForRefreshFromCardWithIntentToCard = function (card, intent, targetCard) {
	let score = 0;
	if (targetCard != null) {
			score += ScoreForUnitRefresh(targetCard);
	}
	return score;
};

/**
 * Returns the Refresh score for a card at a target position.
 * @param {Card} card
 * @param {Vec2} targetPosition
 * @param {Array} [cardIntents=null] forced card intents (won't use card's own card intents)
 * @returns {Number}
 * @static
 * @public
 */
let ScoreForIntentRefresh = function (card, targetPosition, cardIntents) {
	let score = 0;
	const cardId = card.getBaseCardId();
	const validIntents = cardIntents != null ? CardIntent.filterIntentsByIntentType(cardIntents, CardIntentType.Refresh) : CardIntent.getIntentsByIntentType(cardId, CardIntentType.Refresh);

	_.each(validIntents, function (intent) {
		const cards = CardIntent.getCardsTargetedByCardWithIntent(card, intent, targetPosition);
		for (let i = 0, il = cards.length; i < il; i++) {
			score += getScoreForRefreshFromCardWithIntentToCard(card, intent, cards[i]);
		}
	}.bind(this));

	return score;
};

module.exports = ScoreForIntentRefresh;
