const UtilsPosition = require('app/common/utils/utils_position');
const Entity = require('app/sdk/entities/entity');
const Spell = require('app/sdk/spells/spell');
const SpellApplyEntityToBoard = require('app/sdk/spells/spellApplyEntityToBoard');
const SpellCloneSourceEntity = require('app/sdk/spells/spellCloneSourceEntity');
const _ = require('underscore');
const CardIntent = require('../../card_intent/card_intent');
const CardIntentType = require('../../card_intent/card_intent_type');
const CardPhaseType = require('../../card_intent/card_phase_type');
const CardTargetType = require('../../card_intent/card_target_type');
const canCardAndEffectsBeAppliedAnywhere = require('../utils/utils_canCardAndEffectsBeAppliedAnywhere');
const BOUNTY = require('../bounty');
const ScoreForIntents = require('./intents');

/**
 * Returns the Followup score for a card at a target position.
 * @param {Card} card
 * @param {Vec2} targetPosition
 * @param {Array} [cardIntents=null] forced card intents (won't use card's own card intents)
 * @param {Array} [allFollowupCards=null] all followup cards (don't pass in from outside, used internally)
 * @param {Array} [bestFollowupPositions=null] all followup positions in use (don't pass in from outside, used internally)
 * @returns {Object} object with "score" value and "followups" array (which is a recursive object of the same format)
 * @static
 * @public
 */
const ScoreForIntentFollowup = function (card, targetPosition, cardIntents, allFollowupCards, bestFollowupPositions) {
  const cardId = card.getBaseCardId();
  const scoreAndFollowups = {
    score: 0,
    position: targetPosition,
    followupPositions: [],
  };

  // cards can only have a single follow-up intent
  const validIntents = cardIntents != null ? CardIntent.filterIntentsByIntentType(cardIntents, CardIntentType.Followup) : CardIntent.getIntentsByIntentType(cardId, CardIntentType.Followup);
  const intent = validIntents[0];
  if (intent != null) {
    // inject properties into card to simulate card being played
    // this ensures the card's followup will have the correct source position
    card.setPosition(targetPosition);
    if (card instanceof Spell) {
      card.setApplyEffectPosition(targetPosition);
    }

    if (allFollowupCards == null) {
      const rootCard = card;

      // define method to find all followup cards recursively
      const generateFollowupCards = function (card) {
        const gameSession = card.getGameSession();
        let followupCards = [];
        const followups = card.getFollowups();
        if (followups != null && followups.length > 0) {
          for (let i = 0, il = followups.length; i < il; i++) {
            const followup = followups[i];
            const followupCard = gameSession.getExistingCardFromIndexOrCreateCardFromData(followup);
            if (followupCard != null) {
              setupFollowupCard(rootCard, card, followupCard, i);
              followupCards.push(followupCard);
            }

            // recursive find followups for followup
            followupCards = followupCards.concat(generateFollowupCards(followupCard));
          }
        }
        return followupCards;
      };

      // generate all followup cards in sequence starting at root card
      allFollowupCards = generateFollowupCards(card);
    }

    if (bestFollowupPositions == null) {
      // store reference to root followup positions list
      bestFollowupPositions = scoreAndFollowups.followupPositions;
    }

    // process all followup intents
    // intents that do not have an intent of followup should always process first
    const followupIntents = intent.followups;
    const followupIntentsWithIntentFollowup = _.groupBy(followupIntents, (intent) => intent.type === CardIntentType.Followup);
    const intentsFollowup = followupIntentsWithIntentFollowup.true;
    const notIntentsFollowup = followupIntentsWithIntentFollowup.false;
    if (notIntentsFollowup != null && notIntentsFollowup.length > 0) {
      findBestFollowup(targetPosition, notIntentsFollowup, scoreAndFollowups, allFollowupCards, bestFollowupPositions);
    }
    if (intentsFollowup != null && intentsFollowup.length > 0) {
      findBestFollowup(targetPosition, intentsFollowup, scoreAndFollowups, allFollowupCards, bestFollowupPositions);
    }

    // finished and at root card
    if (!card.getIsFollowup()) {
      // cleanup card and followup cards
      card.setPosition(null);
      if (card instanceof Spell) {
        card.setApplyEffectPosition(null);
      }
      for (let i = 0, il = allFollowupCards.length; i < il; i++) {
        cleanFollowupCard(allFollowupCards[i]);
      }
    }
  }

  return scoreAndFollowups;
};

const findBestFollowup = function (followupSourcePosition, followupIntents, scoreAndFollowups, allFollowupCards, bestFollowupPositions) {
  const followupScores = {};
  const followupSubScoreAndFollowups = {};
  let bestFollowupScore;
  let bestFollowupSubScoreAndFollowups;
  for (let i = 0, il = followupIntents.length; i < il; i++) {
    const followupIntent = followupIntents[i];
    const followupIndex = followupIntent.followupIndex != null ? followupIntent.followupIndex : i;
    const followupCard = allFollowupCards[followupIndex];

    // update followup source position
    followupCard.setFollowupSourcePosition(followupSourcePosition);

    // get valid target positions
    let validTargetPositions;
    if (followupIntent.type === CardIntentType.Followup) {
      // swap target position to position of last best followup
      // this ensures that any sub followup intents only look from the best position
      validTargetPositions = bestFollowupPositions.slice(bestFollowupPositions.length - 1);
    } else {
      // regenerate the followup card's valid target positions
      followupCard.flushCachedValidTargetPositions();
      validTargetPositions = followupCard.getValidTargetPositions();
    }
    if (validTargetPositions.length > 0) {
      // card that can be applied anywhere and have only "all" targeted intents should only use a single random valid target position
      if (canCardAndEffectsBeAppliedAnywhere(followupCard, [followupIntent])) {
        validTargetPositions = [validTargetPositions[Math.floor(Math.random() * validTargetPositions.length)]];
      }

      for (let j = 0, jl = validTargetPositions.length; j < jl; j++) {
        const followupTargetPosition = validTargetPositions[j];
        const followupScoreKey = `${followupTargetPosition.x}_${followupTargetPosition.y}`;
        if (followupScores[followupScoreKey] == null) {
          followupScores[followupScoreKey] = 0;
        }
        let followupSubScoreAndFollowupsAtPos = followupSubScoreAndFollowups[followupScoreKey];
        if (followupSubScoreAndFollowupsAtPos == null) {
          followupSubScoreAndFollowupsAtPos = followupSubScoreAndFollowups[followupScoreKey] = [];
        }
        let subScoreAndFollowups;
        if (followupIntent.type === CardIntentType.Followup) {
          subScoreAndFollowups = ScoreForIntentFollowup(followupCard, followupTargetPosition, [followupIntent], allFollowupCards, bestFollowupPositions);
        } else {
          subScoreAndFollowups = {
            score: ScoreForIntents(followupCard, followupTargetPosition, [followupIntent]),
            position: followupTargetPosition,
          };
        }
        const totalFollowupScore = followupScores[followupScoreKey] += subScoreAndFollowups.score;
        followupSubScoreAndFollowupsAtPos.push(subScoreAndFollowups);
        if (bestFollowupScore == null || totalFollowupScore > bestFollowupScore) {
          bestFollowupScore = totalFollowupScore;
          bestFollowupSubScoreAndFollowups = followupSubScoreAndFollowupsAtPos;
        }
      }
    }
  }

  if (bestFollowupScore == null) {
    // if there are no valid target positions for the follow-up, return a negative value
    scoreAndFollowups.score += BOUNTY.NO_FOLLOWUP_TARGET;
  } else {
    // followups always use the best score
    scoreAndFollowups.score += bestFollowupScore;

    // flatten the best score's followup positions
    for (let i = 0, il = bestFollowupSubScoreAndFollowups.length; i < il; i++) {
      const subScoreAndFollowups = bestFollowupSubScoreAndFollowups[i];
      const subFollowupPositions = subScoreAndFollowups.followupPositions;
      if (subFollowupPositions == null) {
        scoreAndFollowups.followupPositions.push(subScoreAndFollowups.position);
      } else if (subFollowupPositions.length > 0) {
        // multi-push instead of concat to preserve original array
        // we're passing this array to all recursive calls
        // so we need to ensure we continue using this array
        scoreAndFollowups.followupPositions.push.apply(scoreAndFollowups.followupPositions, subFollowupPositions);
      }
    }
  }
};

const setupFollowupCard = function (rootCard, parentCard, followupCard, followupIndex) {
  const rootGameSession = rootCard.getGameSession();

  // inject followup data from parent card to followup card
  parentCard.injectFollowupPropertiesIntoCard(followupCard, followupIndex);

  // set followup card game session to match root card
  // this way the followup card works with the correct game data
  followupCard.original_gameSession = followupCard.getGameSession();
  followupCard.setGameSession(rootGameSession);

  // followup cards need a parent card
  // but because we're not playing these followup cards
  // we have to override the parent card getter method to return this parent card
  followupCard.getParentCard = function () { return parentCard; };

  // special followup cases
  if (followupCard instanceof SpellCloneSourceEntity) {
    if (parentCard instanceof Entity) {
      followupCard.getEntityToSpawn = function () {
        return parentCard;
      };
    } else if (parentCard instanceof SpellApplyEntityToBoard) {
      followupCard.getEntityToSpawn = function () {
        return parentCard.getEntityToSpawn();
      };
    }
  }
};

const cleanFollowupCard = function (followupCard) {
  followupCard.setPosition(null);
  if (followupCard instanceof Spell) {
    followupCard.setApplyEffectPosition(null);
  }
  followupCard.cleanFollowupPropertiesFromCard();

  // restore original method to find parent card
  const parentCard = followupCard.getParentCard();
  delete followupCard.getParentCard;

  // restore original game session
  const originalGameSession = followupCard.original_gameSession;
  delete followupCard.original_gameSession;
  followupCard.setGameSession(originalGameSession);

  // special cases
  if (followupCard instanceof SpellCloneSourceEntity) {
    if (parentCard instanceof SpellApplyEntityToBoard) {
      delete followupCard.getEntityToSpawn;
    }
  }
};

module.exports = ScoreForIntentFollowup;
