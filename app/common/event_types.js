/**
 * Dictionary of Duelyst specific events. Do not add generic events here (ex: io connect).
 */
const EVENTS = {

  /* region COMMON */

  // generic error
  error: 'error',

  // screen resize
  // auto emitted, do not trigger manually
  resize: 'resize',

  // request screen resize
  request_resize: 'request_resize',

  // before screen resize
  // auto emitted, do not trigger manually
  before_resize: 'before_resize',

  // after screen resize
  // auto emitted, do not trigger manually
  after_resize: 'after_resize',

  // request game reload
  // auto emitted, do not trigger manually
  request_reload: 'request_reload',

  // cancel reload game request
  // auto emitted, do not trigger manually
  cancel_reload_request: 'cancel_reload_request',

  // status updates
  // auto emitted, do not trigger manually
  status: 'status',

  // when an object is terminated and will never be used again
  // auto emitted, do not trigger manually
  terminate: 'terminate',

  // pointer/mouse events
  // auto emitted, do not trigger manually
  pointer_up: 'pointer_up',
  pointer_down: 'pointer_down',
  pointer_move: 'pointer_move',
  pointer_wheel: 'pointer_wheel',

  // mouse state for changing cursor when hovering canvas
  canvas_mouse_state: 'canvas_mouse_state',

  /* endregion COMMON */

  /* region UI */

  // user requested navigation actions
  // manually triggered
  user_request_confirm: 'user_request_confirm',
  user_request_cancel: 'user_request_cancel',
  user_request_skip: 'user_request_skip',
  user_request_exit: 'user_request_exit',

  // user attempted navigation actions
  // auto emitted, do not trigger manually
  user_attempt_confirm: 'user_attempt_confirm',
  user_attempt_cancel: 'user_attempt_cancel',
  user_attempt_skip: 'user_attempt_skip',
  user_attempt_exit: 'user_attempt_exit',

  // user triggered navigation actions
  // auto emitted, do not trigger manually
  user_triggered_confirm: 'user_triggered_confirm',
  user_triggered_cancel: 'user_triggered_cancel',
  user_triggered_skip: 'user_triggered_skip',
  user_triggered_exit: 'user_triggered_exit',

  // session events from the application
  session_logged_in: 'session_logged_in',
  session_logged_out: 'session_logged_out',

  // user inventory changes
  booster_pack_collection_change: 'booster_pack_collection_change',
  cards_collection_change: 'cards_collection_change',
  card_lore_collection_change: 'card_lore_collection_change',
  cosmetic_chest_collection_change: 'cosmetic_chest_collection_change',
  cosmetic_chest_key_collection_change: 'cosmetic_chest_key_collection_change',
  decks_collection_change: 'decks_collection_change',
  cosmetics_collection_change: 'cosmetics_collection_change',
  orb_count_collection_change: 'orb_count_collection_change',
  gift_crate_collection_change: 'gift_crate_collection_change',
  wallet_change: 'wallet_change',

  // start game type
  start_challenge: 'start_challenge',
  start_single_player: 'start_single_player',
  start_boss_battle: 'start_boss_battle',
  start_replay: 'start_replay',

  // show ui
  show_login: 'show_login',
  show_terms: 'show_terms',
  show_play: 'show_play',
  show_watch: 'show_watch',
  show_shop: 'show_shop',
  show_collection: 'show_collection',
  show_codex: 'show_codex',
  show_booster_pack_unlock: 'show_booster_pack_unlock',
  show_crate_inventory: 'show_crate_inventory',
  show_emote: 'show_emote',
  show_free_card_of_the_day: 'show_free_card_of_the_day',

  // showing ui
  showing_quest_log: 'showing_quest_log',

  // scene change
  change_scene: 'change_scene',

  // replays
  replay_started: 'replay_started',
  replay_stopped: 'replay_stopped',
  replay_paused: 'replay_paused',
  replay_resumed: 'replay_resumed',

  /* endregion UI */

  /* region NETWORK */

  // matchmaking events
  matchmaking_velocity: 'matchmaking_velocity',
  matchmaking_start: 'matchmaking_start',
  matchmaking_cancel: 'matchmaking_cancel',
  matchmaking_error: 'matchmaking_error',
  finding_game: 'finding_game',
  invite_accepted: 'invite_accepted',
  invite_rejected: 'invite_rejected',
  invite_cancelled: 'invite_cancelled',

  game_server_shutdown: 'game_server_shutdown',

  // joined a game as a player
  join_game: 'join_game',

  // joined a game as a spectator
  start_spectate: 'start_spectate',
  spectate_game: 'spectate_game',

  // spectators coming/going
  spectator_joined: 'spectator_joined',
  spectator_left: 'spectator_left',

  // leave game
  leave_game: 'leave_game',

  // reconnection states
  reconnect_to_game: 'reconnect_to_game',
  reconnect_failed: 'reconnect_failed',

  // generic network error
  ajax_error: 'ajax_error',

  // a game event from the server, such as a game step or mouse movement
  network_game_event: 'network_game_event',
  network_game_hover: 'network_game_hover',
  network_game_select: 'network_game_select',
  network_game_mouse_clear: 'network_game_mouse_clear',

  // a game error from the server, such as when a game fails to initialize
  network_game_error: 'network_game_error',

  // opponent has connected or disconnected
  opponent_connection_status_changed: 'opponent_connection_status_changed',

  /* endregion NETWORK */

  /* region SDK */

  turn_time: 'turn_time',

  // game session has finished executing a step and step is ready for external usage
  step: 'step',

  // game session has started a new step
  start_step: 'start_step',

  // game session has finished a step and sent it out
  after_step: 'after_step',

  // game session is going to validate action and it may now be modified
  modify_action_for_validation: 'modify_action_for_validation',

  // game session is going validating action
  validate_action: 'validate_action',

  // game session has invalidated an attempted action
  invalid_action: 'invalid_action',

  // game session is going to add an action to the queue
  before_added_action_to_queue: 'before_added_action_to_queue',

  // game session has added an action to the queue
  added_action_to_queue: 'added_action_to_queue',

  // game session is going to execute action, and action may now be modified
  modify_action_for_execution: 'modify_action_for_execution',

  // game session is just before executing an action
  overwatch: 'overwatch',

  // game session is just before executing an action
  before_action: 'before_action',

  // game session has just executed an action
  action: 'action',

  // game session has executed and signed an action
  after_action: 'after_action',

  // game session cards can terminate themselves safely in response to the action that removed them
  cleanup_action: 'cleanup_action',

  // game session modifiers can trigger if the card they're applied to is still active
  after_cleanup_action: 'after_cleanup_action',

  // game session modifiers can now update their active state
  modifier_active_change: 'modifier_active_change',

  // game session modifiers can now remove auras from any cards no longer affected
  modifier_remove_aura: 'modifier_remove_aura',

  // game session modifiers can now add auras to any cards now affected
  modifier_add_aura: 'modifier_add_aura',

  // game session modifiers should now update their end of turn duration
  modifier_end_turn_duration_change: 'modifier_end_turn_duration_change',

  // game session modifiers should now update their start of turn duration
  modifier_start_turn_duration_change: 'modifier_start_turn_duration_change',

  // game session has just rolled back
  rollback_to_snapshot: 'rollback_to_snapshot',

  // game session snapshot was just requested
  rollback_to_snapshot_requested: 'rollback_to_snapshot_requested',

  // game session snapshot was just recorded
  rollback_to_snapshot_recorded: 'rollback_to_snapshot_recorded',

  // game session is preparing to roll back
  before_rollback_to_snapshot: 'before_rollback_to_snapshot',

  // game session has just deserialized
  deserialize: 'deserialize',

  // game session is preparing to deserialize
  before_deserialize: 'before_deserialize',

  // game state
  end_turn: 'end_turn',
  start_turn: 'start_turn',
  game_over: 'game_over',
  validate_game_over: 'validate_game_over',

  // caching
  update_cache_action: 'update_cache_action',
  update_cache_step: 'update_cache_step',

  // challenges
  instruction_triggered: 'instruction_triggered',
  challenge_attempted: 'challenge_attempted',
  challenge_completed: 'challenge_completed',
  challenge_lost: 'challenge_lost',
  challenge_reset: 'challenge_reset',
  challenge_start: 'challenge_start',

  // attack prediction
  entities_involved_in_attack: 'entities_involved_in_attack',
  modify_action_for_entities_involved_in_attack: 'modify_action_for_entities_involved_in_attack',

  /* endregion SDK */

  /* region ENGINE: FX */

  // blur entire screen
  blur_screen_start: 'blur_screen_start',
  blur_screen_stop: 'blur_screen_stop',

  // blur surface (excludes non post-processing items)
  blur_surface_start: 'blur_surface_start',
  blur_surface_stop: 'blur_surface_stop',

  // caching screen
  caching_screen_setup: 'caching_screen_setup',
  caching_screen_start: 'caching_screen_start',
  caching_screen_stop: 'caching_screen_stop',
  caching_screen_dirty: 'caching_screen_dirty',

  // caching surface (excludes non post-processing items)
  caching_surface_setup: 'caching_surface_setup',
  caching_surface_start: 'caching_surface_start',
  caching_surface_stop: 'caching_surface_stop',
  caching_surface_dirty: 'caching_surface_dirty',

  /* endregion ENGINE: FX */

  /* region ENGINE: GAME */

  // selection/hover changes in engine
  game_selection_changed: 'game_selection_changed',
  game_hover_changed: 'game_hover_changed',
  general_speech_pressed: 'general_speech_pressed',
  general_speech_done_showing: 'general_speech_done_showing',
  instruction_node_pressed: 'instruction_node_pressed',
  instruction_node_done_showing: 'instruction_node_done_showing',
  speech_node_pressed: 'speech_node_pressed',
  speech_node_done_showing: 'speech_node_done_showing',

  // cards
  inspect_card_start: 'inspect_card_start',
  inspect_card_stop: 'inspect_card_stop',

  play_card_start: 'play_card_start',
  play_card_stop: 'play_card_stop',

  mulligan_card_selected: 'mulligan_card_selected',
  mulligan_card_deselected: 'mulligan_card_deselected',

  followup_card_start: 'followup_card_start',
  followup_card_stop: 'followup_card_stop',

  // game state
  show_active_game: 'show_active_game',
  show_rollback: 'show_rollback',
  before_show_game_over: 'before_show_game_over',
  show_game_over: 'show_game_over',

  // turns
  show_end_turn: 'show_end_turn',
  after_show_end_turn: 'after_show_end_turn',
  show_start_turn: 'show_start_turn',
  after_show_start_turn: 'after_show_start_turn',

  // steps
  before_show_step: 'before_show_step',
  after_show_step: 'after_show_step',

  // actions
  before_show_action: 'before_show_action',
  after_show_action: 'after_show_action',
  show_action_for_game: 'show_action_for_game',
  show_action_for_source: 'show_action_for_source',
  show_action_for_target: 'show_action_for_target',
  before_show_move: 'before_show_move',
  after_show_move: 'after_show_move',

  /* endregion ENGINE: GAME */

  discord_spectate: 'discord_spectate',
};

module.exports = EVENTS;
