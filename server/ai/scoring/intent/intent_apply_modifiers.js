"use strict";

const CardIntent = require("../../card_intent/card_intent");
const CardIntentType = require("../../card_intent/card_intent_type");
const CardPhaseType = require("../../card_intent/card_phase_type");
const CardTargetType = require("../../card_intent/card_target_type");
const ScoreForApplyModifiers = require("./../base/apply_modifiers");
const _ = require("underscore");

/**
 * Returns the
 * @param {Card} card
 * @param {Object} intent
 * @param {Card} targetCard
 * @returns {Number}
 * @static
 * @public
 */
let getScoreForApplyModifiersFromCardWithIntentToCard = function (card, intent, targetCard) {
	let score = 0;
	if (targetCard != null) {
		const amount = intent.amount || 1;
		const modifiers = intent.modifiers;
		if (card.getIsSameTeamAs(targetCard)) {
			// add score for applying modifiers to friendly cards
			score += ScoreForApplyModifiers(card, targetCard, amount, modifiers);
		} else {
			// subtract score for applying modifiers to enemy cards
			score -= ScoreForApplyModifiers(card, targetCard, amount, modifiers);
		}
	}
	return score;
};

/**
 * Returns the
 * @param {Card} card
 * @param {Vec2} targetPosition
 * @param {Array} [cardIntents=null] forced card intents (won't use card's own card intents)
 * @returns {Number}
 * @static
 * @public
 */
let ScoreForIntentApplyModifiers = function (card, targetPosition, cardIntents) {
	let score = 0;
	const cardId = card.getBaseCardId();
	const validIntents = cardIntents != null ? CardIntent.filterIntentsByIntentType(cardIntents, CardIntentType.ApplyModifiers) : CardIntent.getIntentsByIntentType(cardId, CardIntentType.ApplyModifiers);

	_.each(validIntents, function (intent) {
		const cards = CardIntent.getCardsTargetedByCardWithIntent(card, intent, targetPosition);
		for (let i = 0, il = cards.length; i < il; i++) {
			score += getScoreForApplyModifiersFromCardWithIntentToCard(card, intent, cards[i]);
		}
	}.bind(this));

	return score;
};

module.exports = ScoreForIntentApplyModifiers;
