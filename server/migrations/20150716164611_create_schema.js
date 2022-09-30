// Migration date convention: moment().utc().format('YYYYMMDDHHMMSS')
exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable('games', (table) => {
      table.string('id', 36).notNullable().primary();
      table.string('status', 10);
      table.string('version', 36);
      table.string('type', 36);
      table.string('player_1_id', 36).notNullable();
      table.string('player_2_id', 36).notNullable();
      table.integer('player_1_faction_id');
      table.integer('player_2_faction_id');
      table.string('winner_id', 36);
      table.string('game_data_json_url', 500);
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.dateTime('ended_at');
    }),
    knex.schema.createTable('invite_codes', (table) => {
      table.string('code', 36).notNullable().primary();
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    }),
    knex.schema.createTable('users', (table) => {
      table.string('id', 36).notNullable().primary();
      table.string('username').notNullable().unique().index();
      table.string('email').notNullable().unique().index();
      table.string('password').notNullable();
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.dateTime('updated_at');
      table.dateTime('last_session_at');
      table.integer('session_count').notNullable().defaultTo(knex.raw('0'));
      table.dateTime('username_updated_at');
      table.dateTime('email_verified_at');
      table.dateTime('password_updated_at');
      table.string('invite_code', 36);
      // ltv
      table.integer('ltv').notNullable().defaultTo(knex.raw('0'));
      table.integer('purchase_count').notNullable().defaultTo(knex.raw('0'));
      table.dateTime('last_purchase_at');
      // rank
      table.integer('rank').index();
      table.dateTime('rank_created_at');
      table.dateTime('rank_starting_at');
      table.integer('rank_stars');
      table.integer('rank_stars_required');
      table.json('rank_delta', true);
      table.integer('rank_top_rank');
      table.dateTime('rank_updated_at');
      table.integer('rank_win_streak');
      table.boolean('rank_is_unread').notNullable().defaultTo(false);
      table.integer('top_rank');
      table.dateTime('top_rank_starting_at');
      table.dateTime('top_rank_updated_at');
      // quests
      table.dateTime('daily_quests_generated_at');
      table.dateTime('daily_quests_updated_at');
      // achievements
      table.dateTime('achievements_last_read_at');
      // wallet
      table.integer('wallet_gold').notNullable().defaultTo(knex.raw('0'));
      table.integer('wallet_spirit').notNullable().defaultTo(knex.raw('0'));
      table.integer('wallet_cores').notNullable().defaultTo(knex.raw('0'));
      table.dateTime('wallet_updated_at');
      table.integer('total_gold_earned').notNullable().defaultTo(knex.raw('0'));
      table.integer('total_spirit_earned').notNullable().defaultTo(knex.raw('0'));
      // buddies
      table.integer('buddy_count').notNullable().defaultTo(knex.raw('0'));
      // tx
      table.integer('tx_count').notNullable().defaultTo(knex.raw('0'));
      table.dateTime('synced_firebase_at');
      // payment
      table.string('stripe_customer_id', 255);
      table.string('card_last_four_digits', 4);
      table.dateTime('card_updated_at');
      // stats
      table.integer('top_gauntlet_win_count');
    }),
    knex.schema.createTable('password_reset_tokens', (table) => {
      table.string('reset_token', 36).notNullable().primary();
      table.string('user_id', 36).notNullable();
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    }),
    knex.schema.createTable('email_verify_tokens', (table) => {
      table.string('verify_token', 36).notNullable().primary();
      table.string('user_id', 36).notNullable();
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    }),
    knex.schema.createTable('user_buddies', (table) => {
      table.string('user_id', 36).notNullable().index();
      table.string('buddy_id').notNullable();
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.primary(['user_id', 'buddy_id']);
    }),
    knex.schema.createTable('user_settings', (table) => {
      table.string('user_id', 36).notNullable().primary();
      table.json('settings', true);
    }),
    knex.schema.createTable('user_rank_events', (table) => {
      table.string('id', 36).primary();
      table.string('game_id', 36).notNullable();
      table.string('user_id', 36).notNullable().index();
      table.dateTime('starting_at').notNullable();
      table.integer('rank');
      table.integer('stars');
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    }),
    knex.schema.createTable('user_rank_history', (table) => {
      table.string('user_id', 36).notNullable().index();
      table.dateTime('starting_at').notNullable();
      table.integer('rank').notNullable();
      table.integer('top_rank');
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.integer('stars');
      table.integer('stars_required');
      table.dateTime('updated_at');
      table.integer('win_streak');
      table.boolean('is_unread').notNullable().defaultTo(true).index();
      table.primary(['user_id', 'starting_at']);
    }),
    knex.schema.createTable('user_charges', (table) => {
      table.string('charge_id', 36).notNullable().primary();
      table.string('user_id', 36).notNullable().index();
      table.integer('amount').notNullable();
      table.string('currency', 3).notNullable();
      table.json('charge_json', true).notNullable();
      table.dateTime('created_at');
      table.dateTime('updated_at');
    }),
    knex.schema.createTable('user_gauntlet_run', (table) => {
      table.string('user_id', 36).notNullable().primary();
      table.string('ticket_id', 36).notNullable().unique();
      table.integer('win_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('loss_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('draw_count').notNullable().defaultTo(knex.raw('0'));
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.dateTime('started_at');
      table.dateTime('completed_at');
      table.dateTime('updated_at');
      table.dateTime('ended_at');
      table.boolean('is_complete').notNullable().defaultTo(false);
      table.boolean('is_resigned');
      table.dateTime('rewards_claimed_at');
      table.specificType('faction_choices', 'integer[]');
      table.integer('faction_id');
      table.specificType('deck', 'integer[]');
      table.specificType('card_choices', 'integer[]');
      table.specificType('games', 'varchar[]');
      table.specificType('reward_ids', 'varchar[]');
    }),
    knex.schema.createTable('user_gauntlet_run_complete', (table) => {
      table.string('id', 36).notNullable().primary();
      table.string('user_id', 36).notNullable().index();
      table.integer('win_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('loss_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('draw_count').notNullable().defaultTo(knex.raw('0'));
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.dateTime('started_at');
      table.dateTime('completed_at');
      table.dateTime('updated_at');
      table.dateTime('ended_at');
      table.boolean('is_complete').notNullable().defaultTo(false);
      table.boolean('is_resigned');
      table.dateTime('rewards_claimed_at');
      table.specificType('faction_choices', 'integer[]');
      table.integer('faction_id');
      table.specificType('deck', 'integer[]');
      table.specificType('card_choices', 'integer[]');
      table.specificType('games', 'varchar[]');
      table.specificType('reward_ids', 'varchar[]');
    }),
    knex.schema.createTable('user_gauntlet_tickets', (table) => {
      table.string('id', 36).notNullable().primary();
      table.string('user_id', 36).notNullable().index();
      table.string('transaction_type', 36);
      table.string('transaction_id', 36);
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.boolean('is_unread').notNullable().defaultTo(true);
    }),
    knex.schema.createTable('user_gauntlet_tickets_used', (table) => {
      table.string('id', 36).notNullable().primary();
      table.string('user_id', 36).notNullable().index();
      table.string('transaction_type', 36);
      table.string('transaction_id', 36);
      table.dateTime('used_at').notNullable();
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    }),
    knex.schema.createTable('user_spirit_orbs', (table) => {
      table.string('id', 36).notNullable().primary();
      table.string('user_id', 36).notNullable().index();
      table.integer('card_set', 36).notNullable().defaultTo(knex.raw('1'));
      table.string('transaction_type', 36);
      table.string('transaction_id', 36);
      table.json('params', true);
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.boolean('is_unread').notNullable().defaultTo(true);
    }),
    knex.schema.createTable('user_spirit_orbs_opened', (table) => {
      table.string('id', 36).notNullable().primary();
      table.string('user_id', 36).notNullable().index();
      table.integer('card_set', 36).notNullable().defaultTo(knex.raw('1'));
      table.string('transaction_type', 36);
      table.string('transaction_id', 36);
      table.json('params', true);
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.dateTime('opened_at').notNullable();
      table.specificType('cards', 'integer[]').notNullable();
    }),
    knex.schema.createTable('user_cards', (table) => {
      table.string('user_id', 36).notNullable().index();
      table.integer('card_id').notNullable();
      table.integer('count').notNullable();
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.dateTime('updated_at');
      table.boolean('is_unread').notNullable().defaultTo(true);
      table.boolean('is_new').notNullable().defaultTo(true);
      table.primary(['user_id', 'card_id']);
    }),
    knex.schema.createTable('user_card_log', (table) => {
      table.string('id', 36).notNullable().primary();
      table.string('user_id', 36).notNullable().index();
      table.integer('card_id').notNullable();
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.boolean('is_credit').notNullable();
      table.string('source_type', 36);
      table.string('source_id', 36);
      table.string('memo', 36);
    }),
    knex.schema.createTable('user_card_collection', (table) => {
      table.string('user_id', 36).primary();
      table.json('cards', true);
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.dateTime('updated_at');
      table.boolean('is_unread').notNullable().defaultTo(true);
    }),
    knex.schema.createTable('user_currency_log', (table) => {
      table.string('id', 36).notNullable().primary();
      table.string('user_id', 36).notNullable().index();
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.integer('gold');
      table.integer('spirit');
      table.string('memo');
    }),
    knex.schema.createTable('user_decks', (table) => {
      table.string('id', 36).notNullable().primary();
      table.string('user_id', 36).notNullable().index();
      table.string('name').notNullable();
      table.integer('faction_id').notNullable();
      table.integer('spell_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('minion_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('artifact_count').notNullable().defaultTo(knex.raw('0'));
      table.specificType('cards', 'integer[]');
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.dateTime('updated_at');
    }),
    knex.schema.createTable('user_games', (table) => {
      table.string('user_id', 36).notNullable();
      table.string('game_id', 36).notNullable();
      table.string('game_type', 36);
      table.string('game_server');
      table.string('gauntlet_ticket_id', 36);
      table.boolean('is_scored');
      table.boolean('is_winner');
      table.boolean('is_draw');
      table.boolean('is_player_1').notNullable();
      table.integer('faction_id').notNullable();
      table.integer('general_id');
      table.integer('faction_xp');
      table.integer('faction_xp_earned');
      table.string('opponent_id', 36).notNullable();
      table.integer('opponent_faction_id').notNullable();
      table.integer('opponent_general_id');
      table.string('opponent_username').notNullable();
      table.specificType('deck_cards', 'integer[]');
      table.string('deck_id', 36);
      table.string('game_version', 36);
      table.json('rewards', true);
      table.specificType('reward_ids', 'varchar[]');
      table.integer('rank_before');
      table.integer('rank_stars_before');
      table.integer('rank_delta');
      table.integer('rank_stars_delta');
      table.integer('rank_win_streak');
      table.boolean('is_daily_win');
      table.integer('play_count_reward_progress');
      table.integer('win_count_reward_progress');
      table.boolean('has_maxed_play_count_rewards');
      table.boolean('has_maxed_win_count_rewards');
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.dateTime('updated_at');
      table.dateTime('ended_at');
      table.string('status').notNullable();
      table.primary(['user_id', 'game_id']);
    }),
    knex.schema.createTable('user_progression', (table) => {
      table.string('user_id', 36).notNullable().primary();
      table.integer('game_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('win_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('win_streak').notNullable().defaultTo(knex.raw('0'));
      table.integer('loss_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('draw_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('unscored_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('last_awarded_game_count');
      table.integer('last_awarded_win_count');
      table.dateTime('last_awarded_win_count_at');
      table.dateTime('last_daily_win_at');
      table.dateTime('last_win_at');
      table.dateTime('play_awards_last_maxed_at');
      table.dateTime('win_awards_last_maxed_at');
      table.dateTime('updated_at');
      table.string('last_game_id', 36);
    }),
    knex.schema.createTable('user_progression_days', (table) => {
      table.string('user_id', 36).notNullable().index();
      table.integer('date').notNullable();
      table.integer('game_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('win_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('win_streak').notNullable().defaultTo(knex.raw('0'));
      table.integer('loss_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('draw_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('unscored_count').notNullable().defaultTo(knex.raw('0'));
      table.primary(['user_id', 'date']);
    }),
    knex.schema.createTable('user_faction_progression', (table) => {
      table.string('user_id', 36).notNullable().index();
      table.integer('faction_id').notNullable();
      table.integer('xp').notNullable().defaultTo(knex.raw('0'));
      table.integer('xp_earned').notNullable().defaultTo(knex.raw('0'));
      table.integer('level').notNullable().defaultTo(knex.raw('0'));
      table.integer('game_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('win_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('loss_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('draw_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('unscored_count').notNullable().defaultTo(knex.raw('0'));
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.dateTime('updated_at');
      table.string('last_game_id', 36);
      table.primary(['user_id', 'faction_id']);
    }),
    knex.schema.createTable('user_faction_progression_events', (table) => {
      table.string('user_id', 36).notNullable().index();
      table.integer('faction_id').notNullable();
      table.string('game_id', 36).notNullable();
      table.boolean('is_winner').notNullable();
      table.boolean('is_draw').notNullable();
      table.boolean('is_scored').notNullable();
      table.integer('xp_earned').notNullable().defaultTo(knex.raw('0'));
      table.specificType('reward_ids', 'varchar[]');
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.primary(['user_id', 'faction_id', 'game_id']);
    }),
    knex.schema.createTable('user_quests', (table) => {
      table.string('user_id', 36).notNullable().index();
      table.integer('quest_slot_index').notNullable();
      table.integer('quest_type_id').notNullable();
      table.integer('gold');
      table.integer('progress');
      table.specificType('progressed_by_game_ids', 'varchar[]');
      table.json('params', true);
      table.dateTime('begin_at').notNullable();
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.dateTime('updated_at');
      table.dateTime('mulliganed_at');
      table.boolean('is_unread').notNullable().defaultTo(true);
      table.dateTime('read_at');
      table.primary(['user_id', 'quest_slot_index']);
    }),
    knex.schema.createTable('user_quests_complete', (table) => {
      table.string('id', 36).primary();
      table.string('user_id', 36).notNullable().index();
      table.integer('quest_slot_index');
      table.integer('quest_type_id').notNullable();
      table.integer('gold');
      table.integer('progress');
      table.specificType('progressed_by_game_ids', 'varchar[]');
      table.json('params', true);
      table.dateTime('begin_at').notNullable();
      table.dateTime('created_at').notNullable();
      table.dateTime('updated_at');
      table.dateTime('completed_at').notNullable();
      table.dateTime('mulliganed_at');
      table.boolean('is_unread').notNullable().defaultTo(true);
      table.dateTime('read_at');
    }),
    knex.schema.createTable('user_rewards', (table) => {
      table.string('id', 36).notNullable().primary();
      table.string('user_id', 36).notNullable().index();
      table.string('game_id', 36).index();
      table.integer('quest_type_id');
      table.string('source_id', 36).index();
      table.string('reward_category', 36);
      table.string('reward_type', 36);
      table.integer('gold');
      table.integer('spirit');
      table.integer('cores');
      table.integer('spirit_orbs');
      table.integer('gauntlet_tickets');
      table.specificType('cards', 'integer[]');
      table.specificType('emotes', 'integer[]');
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.boolean('is_unread').notNullable().defaultTo(true).index();
      table.dateTime('read_at');
    }),
    knex.schema.createTable('user_new_player_progression', (table) => {
      table.string('user_id', 36).notNullable().index();
      table.string('module_name').notNullable();
      table.string('stage').notNullable();
      table.dateTime('updated_at');
      table.boolean('is_unread').notNullable().defaultTo(true).index();
      table.primary(['user_id', 'module_name']);
    }),
    knex.schema.createTable('user_challenges', (table) => {
      table.string('user_id', 36).notNullable().index();
      table.string('challenge_id').notNullable();
      table.dateTime('last_attempted_at');
      table.dateTime('completed_at');
      table.boolean('is_unread').notNullable().defaultTo(true).index();
      table.specificType('reward_ids', 'varchar[]');
      table.primary(['user_id', 'challenge_id']);
    }),
    knex.schema.createTable('user_emotes', (table) => {
      table.string('user_id', 36).notNullable().index();
      table.integer('emote_id').notNullable();
      table.string('transaction_type');
      table.string('transaction_id');
      table.integer('faction_id');
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.boolean('is_unread').notNullable().defaultTo(true).index();
      table.primary(['user_id', 'emote_id']);
    }),
    knex.schema.createTable('user_achievements', (table) => {
      table.string('user_id', 36).notNullable().index();
      table.string('achievement_id').notNullable();
      table.integer('progress').notNullable().defaultTo(knex.raw('0'));
      table.integer('progress_required').notNullable();
      table.specificType('reward_ids', 'varchar[]');
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.dateTime('completed_at');
      table.dateTime('updated_at');
      table.boolean('is_unread').notNullable().defaultTo(true).index();
      table.primary(['user_id', 'achievement_id']);
    }),
    knex.schema.createTable('user_game_counters', (table) => {
      table.string('user_id', 36).notNullable().index();
      table.string('game_type').notNullable();
      table.integer('game_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('win_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('loss_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('draw_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('unscored_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('win_streak').notNullable().defaultTo(knex.raw('0'));
      table.integer('loss_streak').notNullable().defaultTo(knex.raw('0'));
      table.integer('top_win_streak').notNullable().defaultTo(knex.raw('0'));
      table.integer('top_loss_streak').notNullable().defaultTo(knex.raw('0'));
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.dateTime('updated_at');
      table.primary(['user_id', 'game_type']);
    }),
    knex.schema.createTable('user_game_faction_counters', (table) => {
      table.string('user_id', 36).notNullable().index();
      table.string('game_type').notNullable();
      table.integer('faction_id').notNullable();
      table.integer('game_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('win_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('loss_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('draw_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('unscored_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('win_streak').notNullable().defaultTo(knex.raw('0'));
      table.integer('loss_streak').notNullable().defaultTo(knex.raw('0'));
      table.integer('top_win_streak').notNullable().defaultTo(knex.raw('0'));
      table.integer('top_loss_streak').notNullable().defaultTo(knex.raw('0'));
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.dateTime('updated_at');
      table.primary(['user_id', 'game_type', 'faction_id']);
    }),
    knex.schema.createTable('user_game_season_counters', (table) => {
      table.string('user_id', 36).notNullable().index();
      table.string('game_type').notNullable();
      table.dateTime('season_starting_at').notNullable();
      table.integer('game_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('win_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('loss_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('draw_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('unscored_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('win_streak').notNullable().defaultTo(knex.raw('0'));
      table.integer('loss_streak').notNullable().defaultTo(knex.raw('0'));
      table.integer('top_win_streak').notNullable().defaultTo(knex.raw('0'));
      table.integer('top_loss_streak').notNullable().defaultTo(knex.raw('0'));
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.dateTime('updated_at');
      table.primary(['user_id', 'game_type', 'season_starting_at']);
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTableIfExists('games'),
    knex.schema.dropTableIfExists('password_reset_tokens'),
    knex.schema.dropTableIfExists('email_verify_tokens'),
    knex.schema.dropTableIfExists('invite_codes'),
    knex.schema.dropTableIfExists('users'),
    knex.schema.dropTableIfExists('user_settings'),
    knex.schema.dropTableIfExists('user_rank_history'),
    knex.schema.dropTableIfExists('user_rank_events'),
    knex.schema.dropTableIfExists('user_charges'),
    knex.schema.dropTableIfExists('user_gauntlet_run'),
    knex.schema.dropTableIfExists('user_gauntlet_run_complete'),
    knex.schema.dropTableIfExists('user_gauntlet_tickets'),
    knex.schema.dropTableIfExists('user_gauntlet_tickets_used'),
    knex.schema.dropTableIfExists('user_spirit_orbs'),
    knex.schema.dropTableIfExists('user_spirit_orbs_opened'),
    knex.schema.dropTableIfExists('user_cards'),
    knex.schema.dropTableIfExists('user_card_log'),
    knex.schema.dropTableIfExists('user_card_collection'),
    knex.schema.dropTableIfExists('user_currency_log'),
    knex.schema.dropTableIfExists('user_decks'),
    knex.schema.dropTableIfExists('user_games'),
    knex.schema.dropTableIfExists('user_progression'),
    knex.schema.dropTableIfExists('user_progression_days'),
    knex.schema.dropTableIfExists('user_faction_progression'),
    knex.schema.dropTableIfExists('user_faction_progression_events'),
    knex.schema.dropTableIfExists('user_quests'),
    knex.schema.dropTableIfExists('user_quests_complete'),
    knex.schema.dropTableIfExists('user_rewards'),
    knex.schema.dropTableIfExists('user_new_player_progression'),
    knex.schema.dropTableIfExists('user_challenges'),
    knex.schema.dropTableIfExists('user_emotes'),
    knex.schema.dropTableIfExists('user_achievements'),
    knex.schema.dropTableIfExists('user_buddies'),
    knex.schema.dropTableIfExists('user_game_counters'),
    knex.schema.dropTableIfExists('user_game_faction_counters'),
    knex.schema.dropTableIfExists('user_game_season_counters'),

  ]);
};
