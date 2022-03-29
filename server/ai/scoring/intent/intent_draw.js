"use strict";

const CardIntent = require("../../card_intent/card_intent");
const CardIntentType = require("../../card_intent/card_intent_type");
const CardPhaseType = require("../../card_intent/card_phase_type");
const CardTargetType = require("../../card_intent/card_target_type");
const ScoreForDraw = require("./../base/draw_card");
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
let getScoreForDrawFromCardWithIntentToCard = function (card, intent, targetCard) {
	let score = 0;
	if (targetCard != null) {
		const amount = intent.amount || 0;
		if (card.getIsSameTeamAs(targetCard)) {
			// add score for drawing cards
			score += ScoreForDraw(card, targetCard, amount);
		} else {
			// subtract score for enemy drawing cards
			score -= ScoreForDraw(card, targetCard, amount);
		}
	}
	return score;
};

/**
 * Returns the modify mana score for cards in hand
 * @param {Card} card
 * @param {Vec2} targetPosition
 * @param {Array} [cardIntents=null] forced card intents (won't use card's own card intents)
 * @returns {Number}
 * @static
 * @public
 */
let ScoreForIntentDraw = function (card, targetPosition, cardIntents) {
	let score = 0;
	const cardId = card.getBaseCardId();
	const validIntents = cardIntents != null ? CardIntent.filterIntentsByIntentType(cardIntents, CardIntentType.DrawCard) : CardIntent.getIntentsByIntentType(cardId, CardIntentType.DrawCard);

	_.each(validIntents, function (intent) {
		const cards = CardIntent.getCardsTargetedByCardWithIntent(card, intent, targetPosition);
		for (let i = 0, il = cards.length; i < il; i++) {
			score += getScoreForDrawFromCardWithIntentToCard(card, intent, cards[i]);
		}
	}.bind(this));

	return score;
};

module.exports = ScoreForIntentDraw;
