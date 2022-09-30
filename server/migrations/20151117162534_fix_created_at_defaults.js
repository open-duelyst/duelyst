exports.up = function (knex) {
  return Promise.all([
    knex.schema.raw('ALTER TABLE games ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE invite_codes ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE users ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE password_reset_tokens ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE email_verify_tokens ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE user_buddies ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE user_rank_events ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE user_rank_history ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE user_gauntlet_run ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE user_gauntlet_run_complete ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE user_gauntlet_tickets ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE user_gauntlet_tickets_used ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE user_spirit_orbs ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE user_spirit_orbs_opened ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE user_cards ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE user_card_log ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE user_card_collection ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE user_currency_log ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE user_decks ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE user_games ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE user_faction_progression ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE user_faction_progression_events ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE user_quests ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE user_rewards ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE user_emotes ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE user_achievements ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE user_game_counters ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE user_game_faction_counters ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE user_game_season_counters ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE referral_codes ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE user_ribbons ALTER COLUMN created_at SET DEFAULT now()'),
    knex.schema.raw('ALTER TABLE paypal_ipn_errors ALTER COLUMN created_at SET DEFAULT now()'),
  ]);
};

exports.down = function (knex) {
  return Promise.resolve();
};
