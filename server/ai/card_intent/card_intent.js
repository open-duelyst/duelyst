const CONFIG = require('app/common/config');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const Cards = require('app/sdk/cards/cardsLookupComplete');
const Unit = require('app/sdk/entities/unit');
const Tile = require('app/sdk/entities/tile');
const Spell = require('app/sdk/spells/spell');
const Artifact = require('app/sdk/artifacts/artifact');
const _ = require('underscore');
const CardIntentType = require('./card_intent_type');
const CardTargetType = require('./card_target_type');
const CardPhaseType = require('./card_phase_type');
const CardImmunity = require('./card_immunity');
const F1 = require('./faction1');
const F2 = require('./faction2');
const F3 = require('./faction3');
const F4 = require('./faction4');
const F5 = require('./faction5');
const F6 = require('./faction6');
const NC = require('./neutral_coreset');
const NB = require('./neutral_bloodstorm');
const NM = require('./neutral_monthlies');
const NS = require('./neutral_shimzar');
const NU = require('./neutral_unity');
const NF = require('./neutral_firstwatch');
const NW = require('./neutral_wartech');
const Boss = require('./boss');

/*
Fill in later with a guide on how to use card intents
*/

const CardIntent = {
  _intentsByCardId: {},
};

UtilsJavascript.fastExtend(CardIntent._intentsByCardId, F1);
UtilsJavascript.fastExtend(CardIntent._intentsByCardId, F2);
UtilsJavascript.fastExtend(CardIntent._intentsByCardId, F3);
UtilsJavascript.fastExtend(CardIntent._intentsByCardId, F4);
UtilsJavascript.fastExtend(CardIntent._intentsByCardId, F5);
UtilsJavascript.fastExtend(CardIntent._intentsByCardId, F6);
UtilsJavascript.fastExtend(CardIntent._intentsByCardId, NC);
UtilsJavascript.fastExtend(CardIntent._intentsByCardId, NM);
UtilsJavascript.fastExtend(CardIntent._intentsByCardId, NS);
UtilsJavascript.fastExtend(CardIntent._intentsByCardId, NU);
UtilsJavascript.fastExtend(CardIntent._intentsByCardId, NF);
UtilsJavascript.fastExtend(CardIntent._intentsByCardId, NW);
UtilsJavascript.fastExtend(CardIntent._intentsByCardId, Boss);

// flatten each card's intent tree to create lists that include followups
CardIntent._intentsWithFollowupsByCardId = {};
const cardIds = Object.keys(CardIntent._intentsByCardId);
const flattenIntentsForFollowups = function (intents) {
  let intentsWithFollowups = [];
  for (let i = 0, il = intents.length; i < il; i++) {
    const intentObj = intents[i];
    intentsWithFollowups.push(intentObj);
    if (intentObj.type === CardIntentType.Followup && intentObj.followups != null && intentObj.followups.length > 0) {
      intentsWithFollowups = intentsWithFollowups.concat(flattenIntentsForFollowups(intentObj.followups));
    }
  }
  return intentsWithFollowups;
};
for (let i = 0, il = cardIds.length; i < il; i++) {
  const cardId = cardIds[i];
  const intents = CardIntent._intentsByCardId[cardId];
  CardIntent._intentsWithFollowupsByCardId[cardId] = flattenIntentsForFollowups(intents);
}

// Utility methods
CardIntent.getIntentsByCardId = function (cardId, includeFollowups) {
  if (includeFollowups) {
    return CardIntent._intentsWithFollowupsByCardId[cardId];
  }
  return CardIntent._intentsByCardId[cardId];
};

CardIntent.getPartialBitmaskMatch = function (bitmask, partial) {
  return (bitmask & partial) === partial;
};

CardIntent.getIntentTypesByCardId = function (cardId, includeFollowups) {
  const cardIntentTypes = [];
  const cardIntents = CardIntent.getIntentsByCardId(cardId, includeFollowups);
  if (cardIntents && cardIntents.length > 0) {
    for (let i = 0, il = cardIntents.length; i < il; i++) {
      const intentObj = cardIntents[i];
      cardIntentTypes.push(intentObj.type);
    }
  }
  return cardIntentTypes;
};

CardIntent.getIntentsByIntentType = function (cardId, intentType, includeFollowups) {
  const cardIntentsByIntentType = [];
  const cardIntents = CardIntent.getIntentsByCardId(cardId, includeFollowups);
  if (cardIntents && cardIntents.length > 0) {
    for (let i = 0, il = cardIntents.length; i < il; i++) {
      const intentObj = cardIntents[i];
      if (intentObj.type === intentType) {
        cardIntentsByIntentType.push(intentObj);
      }
    }
  }
  return cardIntentsByIntentType;
};

CardIntent.getIntentsByIntentTypeWithExactTargetType = function (cardId, intentType, targetType, includeFollowups) {
  const cardIntentsByIntentType = [];
  const cardIntents = CardIntent.getIntentsByCardId(cardId, includeFollowups);
  if (cardIntents && cardIntents.length > 0) {
    for (let i = 0, il = cardIntents.length; i < il; i++) {
      const intentObj = cardIntents[i];
      if (intentObj.type === intentType && intentObj.targets === targetType) {
        cardIntentsByIntentType.push(intentObj);
      }
    }
  }
  return cardIntentsByIntentType;
};

CardIntent.getIntentsByIntentTypeWithPartialTargetType = function (cardId, intentType, targetType, includeFollowups) {
  const cardIntentsByIntentType = [];
  const cardIntents = CardIntent.getIntentsByCardId(cardId, includeFollowups);
  if (cardIntents && cardIntents.length > 0) {
    for (let i = 0, il = cardIntents.length; i < il; i++) {
      const intentObj = cardIntents[i];
      if (intentObj.type === intentType && CardIntent.getPartialBitmaskMatch(intentObj.targets, targetType.value)) {
        cardIntentsByIntentType.push(intentObj);
      }
    }
  }
  return cardIntentsByIntentType;
};

CardIntent.getHasIntentType = function (cardId, intentType, includeFollowups) {
  const cardIntents = CardIntent.getIntentsByCardId(cardId, includeFollowups);
  if (cardIntents && cardIntents.length > 0) {
    for (let i = 0, il = cardIntents.length; i < il; i++) {
      const intentObj = cardIntents[i];
      if (intentObj.type === intentType) {
        return true;
      }
    }
  }
  return false;
};

CardIntent.getHasIntentTypeWithExactTargetType = function (cardId, intentType, targetType, includeFollowups) {
  const cardIntents = CardIntent.getIntentsByCardId(cardId, includeFollowups);
  if (cardIntents && cardIntents.length > 0) {
    for (let i = 0, il = cardIntents.length; i < il; i++) {
      const intentObj = cardIntents[i];
      if (intentObj.type === intentType && intentObj.targets === targetType) {
        return true;
      }
    }
  }
  return false;
};

CardIntent.getHasIntentTypeWithPartialTargetType = function (cardId, intentType, targetType, includeFollowups) {
  const cardIntents = CardIntent.getIntentsByCardId(cardId, includeFollowups);
  if (cardIntents && cardIntents.length > 0) {
    for (let i = 0, il = cardIntents.length; i < il; i++) {
      const intentObj = cardIntents[i];
      if (intentObj.type === intentType && CardIntent.getPartialBitmaskMatch(intentObj.targets, targetType.value)) {
        return true;
      }
    }
  }
  return false;
};

CardIntent.getHasIntentTypeWithExactPhaseType = function (cardId, intentType, phaseType, includeFollowups) {
  const cardIntents = CardIntent.getIntentsByCardId(cardId, includeFollowups);
  if (cardIntents && cardIntents.length > 0) {
    for (let i = 0, il = cardIntents.length; i < il; i++) {
      const intentObj = cardIntents[i];
      if (intentObj.type === intentType && intentObj.phase != null && intentObj.phase === phaseType) {
        return true;
      }
    }
  }
  return false;
};

CardIntent.getHasIntentTypeWithPartialPhaseType = function (cardId, intentType, phaseType, includeFollowups) {
  const cardIntents = CardIntent.getIntentsByCardId(cardId, includeFollowups);
  if (cardIntents && cardIntents.length > 0) {
    for (let i = 0, il = cardIntents.length; i < il; i++) {
      const intentObj = cardIntents[i];
      if (intentObj.type === intentType && intentObj.phase != null && CardIntent.getPartialBitmaskMatch(intentObj.phase, phaseType.value)) {
        return true;
      }
    }
  }
  return false;
};

CardIntent.getIntentsByExactTargetType = function (cardId, targetType, includeFollowups) {
  const cardIntentsByExactTargetType = [];
  const cardIntents = CardIntent.getIntentsByCardId(cardId, includeFollowups);
  if (cardIntents && cardIntents.length > 0) {
    for (let i = 0, il = cardIntents.length; i < il; i++) {
      const intentObj = cardIntents[i];
      if (intentObj.targets === targetType) {
        cardIntentsByExactTargetType.push(intentObj);
      }
    }
  }
  return cardIntentsByExactTargetType;
};

CardIntent.getIntentsByPartialTargetType = function (cardId, targetType, includeFollowups) {
  const cardIntentsByPartialTargetType = [];
  const cardIntents = CardIntent.getIntentsByCardId(cardId, includeFollowups);
  if (cardIntents && cardIntents.length > 0) {
    for (let i = 0, il = cardIntents.length; i < il; i++) {
      const intentObj = cardIntents[i];
      if (CardIntent.getPartialBitmaskMatch(intentObj.targets, targetType.value)) {
        cardIntentsByPartialTargetType.push(intentObj);
      }
    }
  }
  return cardIntentsByPartialTargetType;
};

CardIntent.getAnyIntentsMatchPartialTargetType = function (cardId, targetType, includeFollowups) {
  const cardIntents = CardIntent.getIntentsByCardId(cardId, includeFollowups);
  if (cardIntents && cardIntents.length > 0) {
    for (let i = 0, il = cardIntents.length; i < il; i++) {
      const intentObj = cardIntents[i];
      if (CardIntent.getPartialBitmaskMatch(intentObj.targets, targetType.value)) {
        return true;
      }
    }
  }
  return false;
};

CardIntent.getAllIntentsMatchPartialTargetType = function (cardId, targetType, includeFollowups) {
  const cardIntents = CardIntent.getIntentsByCardId(cardId, includeFollowups);
  let allIntentsMatch;
  if (cardIntents && cardIntents.length > 0) {
    allIntentsMatch = true;
    for (let i = 0, il = cardIntents.length; i < il; i++) {
      const intentObj = cardIntents[i];
      if (!CardIntent.getPartialBitmaskMatch(intentObj.targets, targetType.value)) {
        allIntentsMatch = false;
        break;
      }
    }
  } else {
    allIntentsMatch = false;
  }
  return allIntentsMatch;
};

CardIntent.getIntentsByExactImmunityType = function (cardId, immunityType, includeFollowups) {
  const cardIntentsByImmunity = [];
  const cardIntents = CardIntent.getIntentsByCardId(cardId, includeFollowups);
  if (cardIntents && cardIntents.length > 0) {
    for (let i = 0, il = cardIntents.length; i < il; i++) {
      const intentObj = cardIntents[i];
      if (intentObj.immunity != null && intentObj.immunity === immunityType) {
        cardIntentsByImmunity.push(intentObj);
      }
    }
  }
  return cardIntentsByImmunity;
};

CardIntent.getIntentsByExactPhaseType = function (cardId, phaseType, includeFollowups) {
  const cardIntentsByPhase = [];
  const cardIntents = CardIntent.getIntentsByCardId(cardId, includeFollowups);
  if (cardIntents && cardIntents.length > 0) {
    for (let i = 0, il = cardIntents.length; i < il; i++) {
      const intentObj = cardIntents[i];
      if (intentObj.phase != null && intentObj.phase === phaseType) {
        cardIntentsByPhase.push(intentObj);
      }
    }
  }
  return cardIntentsByPhase;
};

CardIntent.getIntentsByPartialPhaseType = function (cardId, phaseType, includeFollowups) {
  const cardIntentsByPhase = [];
  const cardIntents = CardIntent.getIntentsByCardId(cardId, includeFollowups);
  if (cardIntents && cardIntents.length > 0) {
    for (let i = 0, il = cardIntents.length; i < il; i++) {
      const intentObj = cardIntents[i];
      if (intentObj.phase != null && CardIntent.getPartialBitmaskMatch(intentObj.phase, phaseType.value)) {
        cardIntentsByPhase.push(intentObj);
      }
    }
  }
  return cardIntentsByPhase;
};

CardIntent.getHasExactPhaseType = function (cardId, phaseType, includeFollowups) {
  const cardIntents = CardIntent.getIntentsByCardId(cardId, includeFollowups);
  if (cardIntents && cardIntents.length > 0) {
    for (let i = 0, il = cardIntents.length; i < il; i++) {
      const intentObj = cardIntents[i];
      if (intentObj.phase != null && intentObj.phase === phaseType) {
        return true;
      }
    }
  }
  return false;
};

CardIntent.getHasPartialPhaseType = function (cardId, phaseType, includeFollowups) {
  const cardIntents = CardIntent.getIntentsByCardId(cardId, includeFollowups);
  if (cardIntents && cardIntents.length > 0) {
    for (let i = 0, il = cardIntents.length; i < il; i++) {
      const intentObj = cardIntents[i];
      if (intentObj.phase != null && CardIntent.getPartialBitmaskMatch(intentObj.phase, phaseType.value)) {
        return true;
      }
    }
  }
  return false;
};

CardIntent.getHasWatchPhaseType = function (cardId, includeFollowups) {
  const cardIntents = CardIntent.getIntentsByCardId(cardId, includeFollowups);
  if (cardIntents && cardIntents.length > 0) {
    for (let i = 0, il = cardIntents.length; i < il; i++) {
      const intentObj = cardIntents[i];
      if (intentObj.phase != null
        && !(CardIntent.getPartialBitmaskMatch(intentObj.phase, CardPhaseType.Now.value)
          || CardIntent.getPartialBitmaskMatch(intentObj.phase, CardPhaseType.EndTurn.value)
          || CardIntent.getPartialBitmaskMatch(intentObj.phase, CardPhaseType.StartTurn.value))) {
        return true;
      }
    }
  }
  return false;
};

CardIntent.filterIntentsByIntentType = function (cardIntents, intentType) {
  const cardIntentsByIntentType = [];
  if (cardIntents && cardIntents.length > 0) {
    for (let i = 0, il = cardIntents.length; i < il; i++) {
      const intentObj = cardIntents[i];
      if (intentObj.type === intentType) {
        cardIntentsByIntentType.push(intentObj);
      }
    }
  }
  return cardIntentsByIntentType;
};

/**
 * Returns whether a target card will be targeted by an intent of another card.
 * @param {Card} card
 * @param {Object} intent
 * @param {Card} targetCard
 * @returns {Boolean}
 */
CardIntent.getIsCardTargetedByCardWithIntent = function (card, intent, targetCard) {
  let isTargeted = false;
  if (targetCard != null) {
    const ownerId = card.getOwnerId();
    const targetType = intent.targets;
    const gameSession = card.getGameSession();

    // step 1: filter friendly/enemy
    isTargeted = (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Friendly.value) && targetCard.getIsSameTeamAs(gameSession.getGeneralForPlayerId(ownerId)))
      || (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Enemy.value) && !targetCard.getIsSameTeamAs(gameSession.getGeneralForPlayerId(ownerId)));

    if (isTargeted) {
      // step 2: filter minion/general/spell/artifact
      if (targetCard instanceof Unit) {
        isTargeted = (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Minion.value) && !targetCard.getIsGeneral())
          || (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.General.value) && targetCard.getIsGeneral());
      } else if (targetCard instanceof Tile) {
        isTargeted = CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Tile.value);
      } else if (targetCard instanceof Spell) {
        isTargeted = CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Spell.value);
      } else if (targetCard instanceof Artifact) {
        isTargeted = CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Artifact.value);
      }
    }
  }

  return isTargeted;
};

/**
 * Returns a list of cards that match an intent of another card.
 * @param {Card} card
 * @param {Object} intent
 * @param {Vec2} targetPosition
 * @returns {Array}
 */
CardIntent.getCardsTargetedByCardWithIntent = function (card, intent, targetPosition) {
  let cards = [];
  const targetType = intent.targets;
  const { pattern } = intent;
  const gameSession = card.getGameSession();
  const board = gameSession.getBoard();
  const ownerId = card.getOwnerId();

  if (pattern != null && pattern.length > 0) {
    // case: targets within a pattern relative to target position
    if (card.isAreaOfEffectOnBoard(targetPosition)) {
      const tx = targetPosition.x;
      const ty = targetPosition.y;
      const position = { x: 0, y: 0 };
      for (let i = 0, il = pattern.length; i < il; i++) {
        const offset = pattern[i];
        position.x = tx + offset.x;
        position.y = ty + offset.y;
        const unit = board.getUnitAtPosition(position);
        if (CardIntent.getIsCardTargetedByCardWithIntent(card, intent, unit)) {
          cards.push(unit);
        }
      }
    }
  } else if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.All.value)) {
    // case: targets all

    // add enemy units
    if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Enemy.value)) {
      const opponentGeneral = gameSession.getGeneralForOpponentOfPlayerId(ownerId);
      if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Minion.value)) {
        cards = cards.concat(board.getFriendlyEntitiesForEntity(opponentGeneral));
      }
      if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.General.value)) {
        cards.push(opponentGeneral);
      }
    }

    // add friendly units
    if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Friendly.value)) {
      const myGeneral = gameSession.getGeneralForPlayerId(ownerId);
      if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Minion.value)) {
        cards = cards.concat(board.getFriendlyEntitiesForEntity(myGeneral));
      }
      if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.General.value)) {
        cards.push(myGeneral);
      }
    }

    // all may also target in hand
    if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Hand.value)) {
      // enemy hand
      if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Enemy.value)) {
        const deck = gameSession.getOpponentPlayerOfPlayerId(ownerId).getDeck();
        for (let i = 0; i < CONFIG.MAX_HAND_SIZE; i++) {
          const cardInHand = deck.getCardInHandAtIndex(i);
          if (cardInHand != null) {
            if (cardInHand instanceof Unit) {
              if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Minion.value)) {
                cards.push(cardInHand);
              }
            } else if (cardInHand instanceof Spell) {
              if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Spell.value)) {
                cards.push(cardInHand);
              }
            } else if (cardInHand instanceof Artifact) {
              if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Artifact.value)) {
                cards.push(cardInHand);
              }
            }
          }
        }
      }

      // friendly hand
      if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Friendly.value)) {
        const deck = gameSession.getPlayerById(ownerId).getDeck();
        for (let i = 0; i < CONFIG.MAX_HAND_SIZE; i++) {
          const cardInHand = deck.getCardInHandAtIndex(i);
          if (cardInHand != null) {
            if (cardInHand instanceof Unit) {
              if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Minion.value)) {
                cards.push(cardInHand);
              }
            } else if (cardInHand instanceof Spell) {
              if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Spell.value)) {
                cards.push(cardInHand);
              }
            } else if (cardInHand instanceof Artifact) {
              if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Artifact.value)) {
                cards.push(cardInHand);
              }
            }
          }
        }
      }
    }
  } else if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Nearby.value)) {
    // case: targets entities nearby a unit

    // when targeting nearby and targets includes general
    // assume targeted unit is always the general

    let targetedUnit;
    if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.General.value)) {
      targetedUnit = gameSession.getGeneralForOpponentOfPlayerId(ownerId);
    } else {
      targetedUnit = board.getUnitAtPosition(targetPosition);
    }

    if (targetedUnit != null) {
      // add enemy units
      if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Enemy.value)) {
        if (targetedUnit.getIsSameTeamAs(gameSession.getGeneralForPlayerId(ownerId))) {
          // if you're targeting a friendly unit, then target all enemies of that unit around the target
          cards = cards.concat(board.getEnemyEntitiesAroundEntity(targetedUnit));
        } else {
          // if you're targeting an enemy unit, then target all friends of that unit around the target
          cards = cards.concat(board.getFriendlyEntitiesAroundEntity(targetedUnit));
        }
      }

      // add friendly units
      if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Friendly.value)) {
        if (targetedUnit.getIsSameTeamAs(gameSession.getGeneralForPlayerId(ownerId))) {
          // if you're targeting a friendly unit, then target all friendls of that unit around the target
          cards = cards.concat(board.getFriendlyEntitiesAroundEntity(targetedUnit));
        } else {
          // if you're targeting an enemy unit, then target all enemies of that unit around the target
          cards = cards.concat(board.getEnemyEntitiesAroundEntity(targetedUnit));
        }
      }
    }

    // remove generals
    if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.General.value)) {
      cards = _.reject(cards, (unit) => unit.getIsGeneral());
    }
  } else if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.NotNearby.value)) {
    // case: targets entities not nearby a unit

    // when targeting nearby and targets includes general
    // assume targeted unit is always the general
    let targetedUnit;
    if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.General.value)) {
      targetedUnit = gameSession.getGeneralForOpponentOfPlayerId(ownerId);
    } else {
      targetedUnit = board.getUnitAtPosition(targetPosition);
    }

    if (targetedUnit != null) {
      // add enemy units
      if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Enemy.value)) {
        if (targetedUnit.getIsSameTeamAs(gameSession.getGeneralForPlayerId(ownerId))) {
          // if you're targeting a friendly unit, then target all enemies of that unit around the target
          cards = cards.concat(board.getEnemyEntitiesNotAroundEntity(targetedUnit));
        } else {
          // if you're targeting an enemy unit, then target all friends of that unit around the target
          cards = cards.concat(board.getFriendlyEntitiesNotAroundEntity(targetedUnit));
        }
      }

      // add friendly units
      if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Friendly.value)) {
        if (targetedUnit.getIsSameTeamAs(gameSession.getGeneralForPlayerId(ownerId))) {
          // if you're targeting a friendly unit, then target all friendls of that unit around the target
          cards = cards.concat(board.getFriendlyEntitiesNotAroundEntity(targetedUnit));
        } else {
          // if you're targeting an enemy unit, then target all enemies of that unit around the target
          cards = cards.concat(board.getEnemyEntitiesNotAroundEntity(targetedUnit));
        }
      }

      // remove generals
      if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.General.value)) {
        cards = _.reject(cards, (unit) => unit.getIsGeneral());
      }
    }
  } else if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Column.value)) {
    // case: targets all units in column

    // get all units in column
    cards = cards.concat(board.getEntitiesInColumn(targetPosition.x));

    // remove minions
    if (!CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Minion.value)) {
      cards = _.reject(cards, (unit) => !unit.getIsGeneral());
    } else {
      // remove enemy units
      if (!CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Enemy.value)) {
        cards = _.reject(cards, (unit) => !card.getIsSameTeamAs(unit));
      }

      // remove friendly units
      if (!CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Friendly.value)) {
        cards = _.reject(cards, (unit) => card.getIsSameTeamAs(unit));
      }
    }

    // remove generals
    if (!CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.General.value)) {
      cards = _.reject(cards, (unit) => unit.getIsGeneral());
    }
  } else if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Row.value)) {
    // case: targets all units in row

    // get all units in column
    cards = cards.concat(board.getEntitiesInRow(targetPosition.y));

    // remove minions
    if (!CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Minion.value)) {
      cards = _.reject(cards, (unit) => !unit.getIsGeneral());
    } else {
      // remove enemy units
      if (!CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Enemy.value)) {
        cards = _.reject(cards, (unit) => !card.getIsSameTeamAs(unit));
      }

      // remove friendly units
      if (!CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Friendly.value)) {
        cards = _.reject(cards, (unit) => card.getIsSameTeamAs(unit));
      }
    }

    // remove generals
    if (!CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.General.value)) {
      cards = _.reject(cards, (unit) => unit.getIsGeneral());
    }
  } else if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.FriendlySide.value)) {
    // case: targets all on my side

    // get all units on my side
    cards = cards.concat(board.getEntitiesOnEntityStartingSide(card));

    // remove minions
    if (!CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Minion.value)) {
      cards = _.reject(cards, (unit) => !unit.getIsGeneral());
    } else {
      // remove enemy units
      if (!CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Enemy.value)) {
        cards = _.reject(cards, (unit) => !card.getIsSameTeamAs(unit));
      }

      // remove friendly units
      if (!CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Friendly.value)) {
        cards = _.reject(cards, (unit) => card.getIsSameTeamAs(unit));
      }
    }

    // remove generals
    if (!CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.General.value)) {
      cards = _.reject(cards, (unit) => unit.getIsGeneral());
    }
  } else if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.EnemySide.value)) {
    // case: targets all on enemy's side

    // get all units on enemy's side
    cards = cards.concat(board.getEntitiesOnEntityStartingSide(gameSession.getGeneralForOpponentOfPlayerId(ownerId)));
    // console.log(cards);

    // remove minions
    if (!CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Minion.value)) {
      cards = _.reject(cards, (unit) => !unit.getIsGeneral());
    } else {
      // remove enemy units
      if (!CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Enemy.value)) {
        cards = _.reject(cards, (unit) => !card.getIsSameTeamAs(unit));
      }

      // remove friendly units
      if (!CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Friendly.value)) {
        cards = _.reject(cards, (unit) => card.getIsSameTeamAs(unit));
      }
    }

    // remove generals
    if (!CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.General.value)) {
      cards = _.reject(cards, (unit) => unit.getIsGeneral());
    }
  } else if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Hand.value)) {
    // case: cards in hand
    if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Enemy.value)) {
      const deck = gameSession.getOpponentPlayerOfPlayerId(ownerId).getDeck();
      for (let i = 0; i < CONFIG.MAX_HAND_SIZE; i++) {
        const cardInHand = deck.getCardInHandAtIndex(i);
        if (cardInHand != null) {
          if (cardInHand instanceof Unit) {
            if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Minion.value)) {
              cards.push(cardInHand);
            }
          } else if (cardInHand instanceof Spell) {
            if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Spell.value)) {
              cards.push(cardInHand);
            }
          } else if (cardInHand instanceof Artifact) {
            if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Artifact.value)) {
              cards.push(cardInHand);
            }
          }
        }
      }
    }

    if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Friendly.value)) {
      const deck = gameSession.getPlayerById(ownerId).getDeck();
      for (let i = 0; i < CONFIG.MAX_HAND_SIZE; i++) {
        const cardInHand = deck.getCardInHandAtIndex(i);
        if (cardInHand != null) {
          if (cardInHand instanceof Unit) {
            if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Minion.value)) {
              cards.push(cardInHand);
            }
          } else if (cardInHand instanceof Spell) {
            if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Spell.value)) {
              cards.push(cardInHand);
            }
          } else if (cardInHand instanceof Artifact) {
            if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Artifact.value)) {
              cards.push(cardInHand);
            }
          }
        }
      }
    }
  } else if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.General.value)
    && !(CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Minion.value))) {
    // case: only targets generals

    // add opponent general of target
    if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.TargetEnemy.value)) {
      const unit = board.getUnitAtPosition(targetPosition);
      if (unit != null) {
        cards.push(gameSession.getGeneralForOpponentOfPlayerId(unit.getOwnerId()));
      }
    }

    // add general of target
    if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.TargetFriendly.value)) {
      const unit = board.getUnitAtPosition(targetPosition);
      if (unit != null) {
        cards.push(gameSession.getGeneralForPlayerId(unit.getOwnerId()));
      }
    }

    // add enemy general
    if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Enemy.value)) {
      cards.push(gameSession.getGeneralForOpponentOfPlayerId(ownerId));
    }

    // add friendly general
    if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Friendly.value)) {
      cards.push(gameSession.getGeneralForPlayerId(ownerId));
    }
  } else if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Self.value)) {
    // case: targets self
    cards.push(card);
  } else if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Dead.value)) {
    // case: targets dead units
    const forFriendly = CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Friendly.value);
    const forEnemy = CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Enemy.value);
    let forPlayerId;
    if (forFriendly && forEnemy) {
      forPlayerId = null;
    } else if (forFriendly) {
      forPlayerId = ownerId;
    } else if (forEnemy) {
      forPlayerId = gameSession.getOpponentPlayerIdOfPlayerId(ownerId);
    }

    // search until last turn filter
    const untilFriendly = CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.DeadUntilLastFriendlyTurn.value);
    const untilEnemy = CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.DeadUntilLastEnemyTurn.value);
    let searchUntilLastTurnForPlayerId;
    if (untilFriendly && untilEnemy) {
      searchUntilLastTurnForPlayerId = null;
    } else if (untilFriendly) {
      searchUntilLastTurnForPlayerId = ownerId;
    } else if (untilEnemy) {
      searchUntilLastTurnForPlayerId = gameSession.getOpponentPlayerIdOfPlayerId(ownerId);
    }

    cards = cards.concat(gameSession.getDeadUnits(forPlayerId, searchUntilLastTurnForPlayerId));
  } else if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Played.value)) {
    // case: targets played spells/artifacts
    const forFriendly = CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Friendly.value);
    const forEnemy = CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Enemy.value);
    let forPlayerId;
    if (forFriendly && forEnemy) {
      forPlayerId = null;
    } else if (forFriendly) {
      forPlayerId = ownerId;
    } else if (forEnemy) {
      forPlayerId = gameSession.getOpponentPlayerIdOfPlayerId(ownerId);
    }

    if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Minion.value)) {
      cards = cards.concat(gameSession.getUnitsPlayed(forPlayerId));
    }

    if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Spell.value)) {
      cards = cards.concat(gameSession.getSpellsPlayed(forPlayerId));
    }

    if (CardIntent.getPartialBitmaskMatch(targetType, CardTargetType.Artifact.value)) {
      cards = cards.concat(gameSession.getArtifactsPlayed(forPlayerId));
    }
  } else {
    // case: targets unit directly
    const unit = board.getUnitAtPosition(targetPosition);
    if (CardIntent.getIsCardTargetedByCardWithIntent(card, intent, unit)) {
      cards.push(unit);
    }
  }

  // pick random targets
  // not actually random, because otherwise scoring would become unpredictable
  // instead we always take the first N targets
  const { numRandomTargets } = intent;
  if (numRandomTargets != null && numRandomTargets > 0 && cards.length > numRandomTargets) {
    cards = cards.slice(0, numRandomTargets);
  }

  return cards;
};

module.exports = CardIntent;
