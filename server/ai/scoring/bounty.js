const BOUNTY = {
  // general
  MANA_COST: 1.0,
  UNIT_HP: 1.2, // dmg functions as a reduction of opponent's HP score, same for healing
  MY_GENERAL_RETREAT: 9999, // my general wants to be far away from enemies when retreating
  MY_GENERAL_RETREAT_V2: -12.0, // my general wants to be far away from enemies when retreating
  GENERAL_HP: 1.4, // dmg to general valued higher than dmg to units, 5 dmg to gen = 7 dmg to unit
  GENERAL_HP_WHEN_LETHAL: 9999, // lethal dmg to general is highest priority
  UNIT_ATK: 1.0, // value for each point of ATK on a unit
  GENERAL_ATK: 1.0, // this rewards atk debuffs to general
  ARTIFACT_DURABILITY: 1, // makes attacking an equipped general slightly better, or losing artifact charges via attacks slightly worse
  MODIFIER: 2, // generic bounty for all abilities such as provoke, deathwatch, frenzy, flying, etc. worth same as 2 hp/atk
  WATCH_WITH_TRIGGER: 30, // generic bounty for watch abilities when used with anything that would trigger the watch
  THRESHOLD_COUNTERATTACK_HP_PCT_GENERAL: 0.3,
  THRESHOLD_HP_GENERAL_RETREAT: 10.0,
  // unit-specific
  // ranged units or units playing defensively would give positive bounties to enemy distance, meaning they prefer to be far away from enemies.
  // another example of unit-specific bounties are distance-related. some units "Want" to be near certain enemies, such as provoking high-atk enemies or enemy general
  // other units "want" to avoid all enemy proximity - ranged units and low-hp generals, for instance, or low-hp high-priority units like deathwatchers
  DISTANCE_FROM_BEST_ENEMY_TARGET: -0.5,
  DISTANCE_FROM_BEST_ENEMY_TARGET_RANGED: 3,
  DISTANCE_FROM_BEST_ENEMY_TARGET_BLASTATTACK_X: 3, // minimize row distance
  DISTANCE_FROM_BEST_ENEMY_TARGET_BLASTATTACK_Y: -3, // maximize column distance
  DISTANCE_FROM_BEST_ENEMY_TARGET_BLASTATTACK_X_V2: -6, // minimize row distance
  DISTANCE_FROM_BEST_ENEMY_TARGET_EVASIVE: 3, // position_objective_distanceFromBestObjective - Replaces distance logic for ranged, watchers, low-hp generals etc.
  BUFFER_HP_EVASIVE_THRESHOLD: 5, // buffers (self or others) are evasive when below this HP
  GENERAL_HP_EVASIVE_THRESHOLD: 10, // Generals are evasive when below this HP
  DISTANCE_FROM_NEAREST_BONUS_MANA: -2,
  DISTANCE_FROM_PROVOKE: -3,
  QUANTITY_SURROUNDING_ENEMIES_HIGH_HP: 0.05, // high hp units prefer to be near more enemies
  QUANTITY_SURROUNDING_ENEMIES_LOW_HP: -0.05, // low hp units prefer to be on the edges of fights
  HIGH_HP_THRESHOLD: 4,
  DISTANCE_FROM_MY_GENERAL: -0.05, // base bounty - getter method getBountyScoreForDistanceFromMyGeneral() will multiply by a ratio of your general's current hp such that the lower your general's hp, the more your units want to be near him...
  DISTANCE_FROM_MY_GENERAL_RETREATING: -10.0, // base bounty - getter method getBountyScoreForDistanceFromMyGeneral() will multiply by a ratio of your general's current hp such that the lower your general's hp, the more your units want to be near him...
  DISTANCE_FROM_MY_GENERAL_FACTOR: 20, //  used for getBountyScoreForDistanceFromMyGeneral() - factor divided by your general's current hp times BOUNTY_DISTANCE_FROM_MY_GENERAL yields exponentially increasing desire to be near general as his health declines
  DISTANCE_FROM_OPPONENT_GENERAL: -0.05,
  DISTANCE_FROM_OPPONENT_GENERAL_WHEN_LETHAL: -99,

  // positioning
  DISTANCE_FROM_BACKSTAB: -3, // used for both positioning backstabbers as well as backstabber avoidance when moving
  FRENZY_PER_UNIT: 1,
  PROVOKE_PER_UNIT: 1,
  PROVOKE_ENEMY_GENERAL: 47, // prefer to block general over lethal on a ~2/2
  ZEAL_ACTIVE: 0.7, // prefer to keep zeal active
  NO_FOLLOWUP_TARGET: -20,

  // attack
  TARGET_ENEMIES_IN_SAME_ROW: 15,
  TARGET_AT_RANGE: 25,
  TARGET_BACKSTAB_PROC: 30,
  TARGET_COUNTERATTACK_NOT_LETHAL: 15,

  // removal/disable
  REMOVAL_PER_UNIT_SCORE: 5.0, // changing from 2.0 to 5.0.
  REMOVAL_OVERKILL: -6.0,
  DISPEL_PER_UNIT_SCORE: 3.25, // changing from 1.25
  DISPEL_WASTED: -5,
  UNIT_SCORE_TONED_DOWN: 0.10,
  STUN_PER_UNIT_ATK: 2.0,
  STUN_WASTED: -5,
  UNIT_TRANSFORM: 2.0,

  // damage
  DAMAGE_PER_UNIT_SCORE: 0.5,
  DAMAGE_PER_GENERAL_HP: 2.0,
  SHADOW_CREEP_DAMAGE: -2,
  DAMAGE_LETHAL: 40,
  FORCEFIELD_POP: 5,

  // healing
  HEALING_PER_UNIT_SCORE: 1.0,
  HEALING_OVERHEAL: -6.0,
  HEALING_PER_UNIT_DAMAGE: 1.25,
  HEALING_PER_GENERAL_DAMAGE: 1.5,
  GENERAL_LOW_HP: 10,

  // modifiers
  MODIFIER_AIRDROP: 7,
  MODIFIER_BACKSTAB: 15,
  MODIFIER_BLAST: 20,
  MODIFIER_CELERITY: 20,
  MODIFIER_DEATHWATCH: 30,
  MODIFIER_DEATHWATCHSPAWNENTITY: 30,
  MODIFIER_FLYING: 10,
  MODIFIER_FORCEFIELD: 20,
  MODIFIER_FRENZY: 10,
  MODIFIER_GENERIC: 10,
  MODIFIER_GROW: 30,
  MODIFIER_HEALWATCHBUFFSELF: 20,
  MODIFIER_HEALWATCH: 20,
  MODIFIER_PROVOKE: 10,
  MODIFIER_RANGED: 20,
  MODIFIER_REBIRTH: 8,
  MODIFIER_SPELLWATCH: 10,
  MODIFIER_SUMMONWATCH: 10,

  // mana modifiers
  MANA_PER_SCORE: 10,
  UNSPENT_MANA: -0.5, // Board Score: penalty for wasted mana

  // refresh
  REFRESH_PER_UNIT_SCORE: 3,

  // immunity
  IMMUNITY_DAMAGING_GENERALS: -1.5,
  IMMUNITY_SPELLS: 0.7,

  // phase dependant variables
  LOW_HP_MINIONS: 0.5,

  // draw
  CARDS_IN_HAND: 0.5, // Board Score: Tie-breaking minor bounty rewarding players for having more cards in-hand (up to max. of 4)
  DRAW_SUCCESS: 40,
  DRAW_FAIL: -50,

};

module.exports = BOUNTY;
