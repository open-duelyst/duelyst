const BOUNTY = require('server/ai/scoring/bounty');
const _ = require('underscore');
const SDK = require('app/sdk');

const filterAttackTargetsForUnit = function (unit, potentialTargets) {
  // filters out illegal or bad targets i.e. suicide targets for generals or illegal targets while provoked or immune units
  potentialTargets = _filterAttackTargetsForGeneralUnit(unit, potentialTargets);
  potentialTargets = _filterAttackTargetsForProvokedUnit(unit, potentialTargets);
  potentialTargets = _.reject(potentialTargets, (target) => _isTargetImmuneToSource(target, unit));
  return potentialTargets;
};

const _filterAttackTargetsForProvokedUnit = function (unit, potentialTargets) {
  if (unit.getIsProvoked()) { // may only attack provoker
    potentialTargets = _.filter(potentialTargets, (target) => target.getIsProvoker());
    potentialTargets = _.filter(potentialTargets, (target) => _.contains(target.getEntitiesProvoked(), unit));
  }
  return potentialTargets;
};

const _filterAttackTargetsForGeneralUnit = function (unit, potentialTargets) {
  if (unit.getIsGeneral()) {
    // don't attack units that will counterattack for more than threshold
    // prevents generals trading damage with high-attack units, i.e. generals attacking into 10 damage units
    // generals also become increasingly wary of costly trades the lower their HP goes. General's current HP
    // is multiplied against THRESHOLD_COUNTERATTACK_HP_PCT_GENERAL which defines the maximum % of current HP
    // a general will trade for [currently set at 0.3 or 30% of current HP at time of writing this comment]
    // Set at 0.30, a general with 25 hp won't trade damage if the counterattack will deal more than 7 dmg
    // At 11 HP, a general won't trade if the counterattack will deal more than 3 damage! thanks for reading
    potentialTargets = _.reject(potentialTargets, (enemy) => enemy.getATK() > unit.getHP() * BOUNTY.THRESHOLD_COUNTERATTACK_HP_PCT_GENERAL);
    potentialTargets = _.reject(potentialTargets, (enemy) =>
      // avoid suicide
      unit.getHP() <= enemy.getATK());
    // TODO ***DRAW GAMES***
    // exception to counterattacking rules - if we want to attack enemy general for a DRAW GAME. Must only do this if:
    // enemy will have lethal next turn - how to estimate this?
    // look at enemy units, any of them within attack range and have enough ATK to kill general?
    // we have no attacks or burn spells left
    // check friendly units - can attack/move?
    // mana left? check hand for castable burn or removal spells...
  }
  return potentialTargets;
};

const _isTargetImmuneToSource = function (target, source) {
  if (target instanceof SDK.Card && source instanceof SDK.Card) {
    const immuneModifiers = target.getModifiersByClass(SDK.ModifierImmune);
    if (immuneModifiers.length > 0) {
      const immuneModifier = _.find(immuneModifiers, (modifier) => {
        // immune to attack
        if (modifier instanceof SDK.ModifierImmuneToAttacks) {
          if (modifier instanceof SDK.ModifierImmuneToAttacksByGeneral) {
            if (source instanceof SDK.Unit && source.getIsGeneral()) {
              return true;
            }
          } else if (modifier instanceof SDK.ModifierImmuneToAttacksByRanged) {
            if (source instanceof SDK.Unit && source.hasModifierClass(SDK.ModifierRanged)) {
              return true;
            }
          } else if (source instanceof SDK.Unit) {
            return true;
          }
        }

        // immune to damage
        if (modifier instanceof SDK.ModifierImmuneToDamage) {
          if (modifier instanceof SDK.ModifierImmuneToDamageByGeneral) {
            if (source instanceof SDK.Unit && source.getIsGeneral()) {
              return true;
            }
          } else if (modifier instanceof SDK.ModifierImmuneToDamageByRanged) {
            if (source instanceof SDK.Unit && source.hasModifierClass(SDK.ModifierRanged)) {
              return true;
            }
          } else {
            const damageSpell = source instanceof SDK.Spell;
            /* && CARD_INTENT[source.getBaseCardId()] != null
            && (CARD_INTENT[source.getBaseCardId()].indexOf("burn") !== -1 || CARD_INTENT[source.getBaseCardId()].indexOf("shadownova") !== -1); */
            if (modifier instanceof SDK.ModifierImmuneToDamageBySpells) {
              if (damageSpell) {
                return true;
              }
            } else if (damageSpell || source instanceof SDK.Unit) {
              return true;
            }
          }
        }

        if (modifier instanceof SDK.ModifierImmuneToSpells) {
          if (source instanceof SDK.Spell
          /* && CARD_INTENT[source.getBaseCardId()] != null
            && CARD_INTENT[source.getBaseCardId()].indexOf("mass") === -1
            && CARD_INTENT[source.getBaseCardId()].indexOf("shadownova") === -1 */) {
            if (modifier instanceof SDK.ModifierImmuneToSpellsByEnemy) {
              if (!target.getIsSameTeamAs(source)) {
                // immune to enemy targeted spells
                return true;
              }
            } else {
              // immune to targeted spells
              return true;
            }
          }
        }
      });

      if (immuneModifier != null) {
        // a modifier is making target immune to source
        return true;
      }
    }

    // source cannot attack target
    if (source.hasModifierClass(SDK.ModifierCannotAttackGeneral) && target.getIsGeneral()) {
      return true;
    }
  }

  // target does not appear to be immune to source
  return false;
};

module.exports = filterAttackTargetsForUnit;
