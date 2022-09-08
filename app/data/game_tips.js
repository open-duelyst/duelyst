const _ = require('underscore');
const i18next = require('i18next');

/**
 * game_tips.js - list of game tips.
 */
const GAME_TIPS = {};

/**
 * Tip categories.
 * @type {{NOVICE: string, MEDIUM: string}}
 */
GAME_TIPS.CATEGORIES = {
  NOVICE: 'novice',
  MEDIUM: 'medium',
};

// novice tips
GAME_TIPS[GAME_TIPS.CATEGORIES.NOVICE] = [
  i18next.t('game_tips.novice_tip_0'),
  i18next.t('game_tips.novice_tip_1'),
  i18next.t('game_tips.novice_tip_2'),
  i18next.t('game_tips.novice_tip_3'),
  i18next.t('game_tips.novice_tip_4'),
  i18next.t('game_tips.novice_tip_5'),
  i18next.t('game_tips.novice_tip_6'),
  i18next.t('game_tips.novice_tip_7'),
  i18next.t('game_tips.novice_tip_8'),
  i18next.t('game_tips.novice_tip_9'),
  i18next.t('game_tips.novice_tip_10'),
  i18next.t('game_tips.novice_tip_11'),
  i18next.t('game_tips.novice_tip_12'),
  i18next.t('game_tips.novice_tip_13'),
  i18next.t('game_tips.novice_tip_14'),
  i18next.t('game_tips.novice_tip_15'),
  i18next.t('game_tips.novice_tip_16'),
  i18next.t('game_tips.novice_tip_17'),
  i18next.t('game_tips.novice_tip_18'),
  i18next.t('game_tips.novice_tip_19'),
  i18next.t('game_tips.novice_tip_20'),
  i18next.t('game_tips.novice_tip_21'),
  i18next.t('game_tips.novice_tip_22'),
  i18next.t('game_tips.novice_tip_23'),
  i18next.t('game_tips.novice_tip_24'),
  i18next.t('game_tips.novice_tip_25'),
  i18next.t('game_tips.novice_tip_26'),
  i18next.t('game_tips.novice_tip_27'),
  i18next.t('game_tips.novice_tip_28'),
  i18next.t('game_tips.novice_tip_29'),
  i18next.t('game_tips.novice_tip_30'),
  i18next.t('game_tips.novice_tip_31'),
  i18next.t('game_tips.novice_tip_32'),
  i18next.t('game_tips.novice_tip_33'),
  i18next.t('game_tips.novice_tip_34'),
  i18next.t('game_tips.novice_tip_35'),
  i18next.t('game_tips.novice_tip_36'),
  i18next.t('game_tips.novice_tip_37'),
];

// medium tips
GAME_TIPS[GAME_TIPS.CATEGORIES.MEDIUM] = [
  i18next.t('game_tips.medium_tip_0'),
  i18next.t('game_tips.medium_tip_1'),
  i18next.t('game_tips.medium_tip_2'),
  i18next.t('game_tips.medium_tip_3'),
  i18next.t('game_tips.medium_tip_4'),
  i18next.t('game_tips.medium_tip_5'),
  i18next.t('game_tips.medium_tip_6'),
  i18next.t('game_tips.medium_tip_7'),
  i18next.t('game_tips.medium_tip_8'),
  i18next.t('game_tips.medium_tip_9'),
  i18next.t('game_tips.medium_tip_10'),
  i18next.t('game_tips.medium_tip_11'),
  i18next.t('game_tips.medium_tip_12'),
  i18next.t('game_tips.medium_tip_13'),
  i18next.t('game_tips.medium_tip_14'),
  i18next.t('game_tips.medium_tip_15'),
  i18next.t('game_tips.medium_tip_16'),
  i18next.t('game_tips.medium_tip_17'),
  i18next.t('game_tips.medium_tip_18'),
  i18next.t('game_tips.medium_tip_19'),
  i18next.t('game_tips.medium_tip_20'),
  //  "If your minions or General with RANGED or BLAST attack an enemy in melee range, they'll get hit back.",
  i18next.t('game_tips.medium_tip_21'),
  //  "Minions with RANGED minions have map-wide attack range and avoid counterattacks, except from enemies with RANGED.",
  i18next.t('game_tips.medium_tip_22'),
  // i18next.t("game_tips.medium_tip_23"),
  //  "To get the most out of INFILTRATE, trap your opponent on their starting side of the battlefield.",
  i18next.t('game_tips.medium_tip_24'),
  i18next.t('game_tips.medium_tip_25'),
  i18next.t('game_tips.medium_tip_26'),
  // TODO: these need to be localized and checked for dupes
  'Minions with AIRDROP can be summoned anywhere on the battlefield.',
  'Minions with BLAST deal damage to all enemies in a straight line.',
  'Minions with CELERITY can be activated TWICE per turn.',
  'Minions with DEATHWATCH trigger whenever ANY minion dies.',
  'Minions with DYING WISH trigger AFTER they\'re destroyed.',
  'Minions with FLYING can move anywhere on the battlefield.',
  'Minions with FRENZY can hit all nearby enemies simultaneously.',
  'Minions with PROVOKE force nearby enemies to attack them first.',
  'Minions with REBIRTH leave behind an egg that hatches before your next turn.',
  'Minions with RUSH are activated right upon entering play.',
  'Minions with GROW will gain stats at the beginning of your turn.',
  'Reach Rank 10 and you\'ll be rewarded with a new LEGENDARY card at the end of the season.',
  'Consider replacing at the START of your turn to expand your strategic options.',
  'ZEAL minions need to be near your General to maximize their potential.',
  'Minions with OPENING GAMBIT trigger right BEFORE they enter play.',
  'Your General\'s Artifact is destroyed upon receiving damage three times.',
  'BLAST minions will receive counterattacks from RANGED minions.',
  'Wind Dervishes summoned by your Obelysks disappear at the end of your turn.',
  'Effects that only target minions will not apply to Generals.',
  'Minions with FRENZY are only counterattacked by their attack target.',
  //  "If your minions or General with RANGED or BLAST attack an enemy in melee range, they'll get hit back.",
  'Minions with INFILTRATE gain a bonus while on your opponent\'s side of the battlefield.',
  //  "Minions with RANGED minions have map-wide attack range and avoid counterattacks, except from enemies with RANGED.",
  'Star\'s Fury won\'t summon Dervishes on spaces that are already occupied.',
  //  "Dispelling a STUNNED minion will not remove STUN.",
  //  "To get the most out of INFILTRATE, trap your opponent on their starting side of the battlefield.",
  'Transforming units does not activate REBIRTH or DYING WISH.',
  'Use your allies to block movement of your enemies.',
  'Your minions lose the ZEAL buff when they\'re not adjacent to your General.',
];

/**
 * Returns a random tip from an optional category, or all categories if no category defined or the category defined is invalid.
 * @param {String} [category=random]
 * @see GAME_TIPS.CATEGORIES
 */
GAME_TIPS.random_tip = function (category) {
  let category_tips;

  // try to use defined category
  if (category != null) {
    category_tips = GAME_TIPS[category];
  }

  // pick random category
  if (category_tips == null) {
    const all_category_keys = [];
    /* eslint-disable guard-for-in */
    for (const category_key in GAME_TIPS.CATEGORIES) {
      all_category_keys.push(GAME_TIPS.CATEGORIES[category_key]);
    }
    category_tips = GAME_TIPS[_.sample(all_category_keys)];
  }

  return _.sample(category_tips);
};

module.exports = GAME_TIPS;
