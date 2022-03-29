"use strict";

const CardIntent = require("../../card_intent/card_intent");
const CardIntentType = require("../../card_intent/card_intent_type");
const CardPhaseType = require("../../card_intent/card_phase_type");
const CardTargetType = require("../../card_intent/card_target_type");
const ScoreForUnitStun = require("./../base/unit_stun");
const willUnitSurviveCard = require('./../utils/utils_willUnitSurviveCard');
const BOUNTY = require("./../bounty");
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
let getScoreForStunFromCardWithIntentToCard = function (card, intent, targetCard) {
	let score = 0;
	if (targetCard != null) {

		if (!card.getIsSameTeamAs(targetCard)) {
			// add score for stunning enemy card
			score += ScoreForUnitStun(targetCard);
		} else {
			// subtract score for stunning friendly card
			score -= ScoreForUnitStun(targetCard);
		}
	}
	return score;
};

/**
 * Returns the burn score for a card at a target position.
 * @param {Card} card
 * @param {Vec2} targetPosition
 * @param {Array} [cardIntents=null] forced card intents (won't use card's own card intents)
 * @returns {Number}
 * @static
 * @public
 */
let ScoreForIntentStun = function (card, targetPosition, cardIntents) {
	let score = 0;
	const cardId = card.getBaseCardId();
	const validIntents = cardIntents != null ? CardIntent.filterIntentsByIntentType(cardIntents, CardIntentType.Stun) : CardIntent.getIntentsByIntentType(cardId, CardIntentType.Stun);

	_.each(validIntents, function (intent) {
		const cards = CardIntent.getCardsTargetedByCardWithIntent(card, intent, targetPosition);
		for (let i = 0, il = cards.length; i < il; i++) {
		  if (willUnitSurviveCard(cards[i], card)) {
		    score += getScoreForStunFromCardWithIntentToCard(card, intent, cards[i]);
		  }
		}
	  //score still zero? Wasted valid intent. penalize
		if (score == 0) {
		  score += BOUNTY.STUN_WASTED; //-5
		}
	}.bind(this));

	return score;
};

module.exports = ScoreForIntentStun;
