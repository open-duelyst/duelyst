/** **************************************************************************
Shared global object for Properties/Defines/Aliases
 - static properties should be defined in ALL_CAPS
 - dynamic properties should be defined in camelCase
 - do not include resources in this file
*************************************************************************** */
const CONFIG = {};

/**
 * Start properties that are safe to edit.
 */

// whether to debug draw sprites to show their bounding boxes
CONFIG.DEBUG_DRAW = false;
// whether to debug draw depth map
CONFIG.DEBUG_DEPTH = false;
// whether to load all assets at startup
CONFIG.LOAD_ALL_AT_START = false;
// whether to unload image assets from cpu
CONFIG.UNLOAD_CPU_IMAGES = true;
// whether nodes default to orthographic projection and swap to perspective projection only as needed
// this ensures that unless a node is rotated in 3D space, it will be rendered pixel perfect
// when false, always uses perspective projection
CONFIG.DYNAMIC_PROJECTION = true;
// global scale must be a multiple of this value
CONFIG.GLOBAL_SCALE_MULTIPLE = 0.25;
// global scale spacing to ensure layout isn't too tight
// set to 0 for tight/exact fit
CONFIG.GLOBAL_SCALE_SPACING = CONFIG.GLOBAL_SCALE_MULTIPLE * 0.5;
// list resource scales enabled other than 1x (NOTE: if you change this, you must also change $resourceScales in app/ui/styles/common/variables.scss!)
// these will be suffixed to the end of all image paths as needed, ex: path/to/img.png -> path/to/img@2x.png
CONFIG.RESOURCE_SCALES = [2];
// list of supported resolutions
CONFIG.RESOLUTION_AUTO = 1;
CONFIG.RESOLUTION_EXACT = 2;
CONFIG.RESOLUTION_PIXEL_PERFECT = 9999;
CONFIG.RESOLUTION_DEFAULT = CONFIG.RESOLUTION_AUTO;
CONFIG.RESOLUTIONS = [ // TODO: localize
  { value: CONFIG.RESOLUTION_AUTO, description: 'settings.best_fit', selected: true },
  { value: CONFIG.RESOLUTION_EXACT, description: 'settings.tightest_fit' },
  { value: CONFIG.RESOLUTION_PIXEL_PERFECT, description: 'settings.pixel_perfect' },
  /*
  {value: 2, description: "1280 x 720 (pixel perfect)"},
  {value: 3, description: "1280 x 768"},
  {value: 4, description: "1280 x 800"},
  {value: 5, description: "1280 x 960"},
  {value: 6, description: "1280 x 1024"},
  {value: 7, description: "1360 x 768"},
  {value: 8, description: "1366 x 768"},
  {value: 9, description: "1440 x 900"},
  {value: 10, description: "1536 x 864"},
  {value: 11, description: "1600 x 900"},
  {value: 12, description: "1600 x 1200"},
  {value: 13, description: "1680 x 1050"},
  {value: 14, description: "1920 x 1080"},
  {value: 15, description: "1920 x 1200"},
  {value: 16, description: "2560 x 1080"},
  {value: 17, description: "2560 x 1440"}
  */
];
// number of minutes a player is allowed to continue a game for
CONFIG.MINUTES_ALLOWED_TO_CONTINUE_GAME = 45;
// player id for AI
CONFIG.AI_PLAYER_ID = 'ai';
// background color
CONFIG.BACKGROUND_COLOR = {
  r: 0, g: 0, b: 0, a: 255,
};
// static size of reference window to base layout calculations on
CONFIG.REF_WINDOW_SIZE = { width: 1280.0, height: 720.0 };
// size of SDK board
CONFIG.BOARDROW = 5;
CONFIG.BOARDCOL = 9;
CONFIG.BOARDCENTER = { x: Math.floor(CONFIG.BOARDCOL * 0.5), y: Math.floor(CONFIG.BOARDROW * 0.5) };
// battle maps
CONFIG.BATTLEMAP0 = 0;
CONFIG.BATTLEMAP1 = 1;
CONFIG.BATTLEMAP2 = 2;
CONFIG.BATTLEMAP3 = 3;
CONFIG.BATTLEMAP4 = 4;
CONFIG.BATTLEMAP5 = 5;
CONFIG.BATTLEMAP6 = 6;
CONFIG.BATTLEMAP7 = 7;
CONFIG.BATTLEMAP_SHIMZAR = 8;
CONFIG.BATTLEMAP_ABYSSIAN = 9;
CONFIG.BATTLEMAP_REDROCK = 10;
CONFIG.BATTLEMAP_VANAR = 11;
// indices in BATTLEMAP_TEMPLATES of battlemaps available to all users
// do not include purchasable battlemaps in this list
CONFIG.BATTLEMAP_DEFAULT_INDICES = [0, 1, 2, 3, 4, 5, 6];
/**
 * Templates for how battlemaps behave.
 * @example
 * {
 *   map: {Number} identifier of map
 *   weatherChance: {Number} percent between 0 and 1
 *   rainChance: {Number} percent between 0 and 1
 *   snowChance: {Number} percent between 0 and 1
 *   blueDustChance: {Number} percent between 0 and 1
 *   blueDustColor: {cc.Color} color object with rgb values between 0 and 255 (default white)
 *   sunRaysChance: {Number} percent between 0 and 1
 *   clouds: {Array} list of cloud systems data
 *     cloudSystemData -> {
 *       index: {Number} index of cloud particles to show between 1 and 7 (default random)
 *       sourceColor: {cc.Color} starting color object with rgb values between 0 and 255 (default white)
 *       targetColor: {cc.Color} ending color object with rgb values between 0 and 255 (default white)
 *       background: {Boolean} whether clouds are in background or foreground (default foreground)
 *       sourcePosition: {Vec2} starting position of clouds as a percent of screen size between 0 and 1
 *       targetPosition: {Vec2} ending position of clouds as a percent of screen size between 0 and 1
 *     }
 * }
 */
CONFIG.BATTLEMAP_TEMPLATES = [
  {
    map: CONFIG.BATTLEMAP0, // LYONAR
    weatherChance: 0.25,
    rainChance: 0.85,
    snowChance: 0.0,
    blueDustChance: 1.0,
    sunRaysChance: 1.0,
    clouds: [
      { background: true, sourcePosition: { x: 1.0, y: 1.0 }, targetPosition: { x: 0.0, y: 0.75 } },
      { background: true, sourcePosition: { x: 1.0, y: 1.0 }, targetPosition: { x: 0.0, y: 0.75 } },
      { background: false, sourcePosition: { x: 1.0, y: 0.1 }, targetPosition: { x: 0.0, y: 0.1 } },
      { background: false, sourcePosition: { x: 1.0, y: 0.1 }, targetPosition: { x: 0.0, y: 0.1 } },
    ],
  },
  {
    map: CONFIG.BATTLEMAP1, // SONGHAI BLUE MOTHBALLS
    weatherChance: 0.0,
    rainChance: 0.0,
    snowChance: 0.0,
    blueDustChance: 1.0,
    sunRaysChance: 1.0,
    clouds: [
      { background: true, sourcePosition: { x: 0.0, y: 1.0 }, targetPosition: { x: 1.0, y: 0.75 } },
      { background: true, sourcePosition: { x: 0.0, y: 1.0 }, targetPosition: { x: 1.0, y: 0.75 } },
      { background: false, sourcePosition: { x: 0.0, y: 0.1 }, targetPosition: { x: 1.0, y: 0.1 } },
      { background: false, sourcePosition: { x: 0.0, y: 0.1 }, targetPosition: { x: 1.0, y: 0.1 } },
    ],
  },
  {
    map: CONFIG.BATTLEMAP2, // DESERT
    weatherChance: 0.0,
    rainChance: 0.0,
    snowChance: 0.0,
    blueDustChance: 0.0,
    sunRaysChance: 1.0,
    clouds: [
      { background: true, sourcePosition: { x: 1.0, y: 0.85 }, targetPosition: { x: 0.0, y: 1.0 } },
      { background: true, sourcePosition: { x: 1.0, y: 0.85 }, targetPosition: { x: 0.0, y: 1.0 } },
      { background: false, sourcePosition: { x: 1.0, y: 0.125 }, targetPosition: { x: 0.0, y: 0.05 } },
      { background: false, sourcePosition: { x: 1.0, y: 0.125 }, targetPosition: { x: 0.0, y: 0.05 } },
    ],
  },
  {
    map: CONFIG.BATTLEMAP4, // ICE CAVERN
    weatherChance: 0.0,
    rainChance: 0.0,
    snowChance: 0.0,
    blueDustChance: 1.0,
    sunRaysChance: 1.0,
    clouds: [
      { background: false, sourcePosition: { x: 0.0, y: 0.125 }, targetPosition: { x: 1.0, y: 0.05 } },
      { background: false, sourcePosition: { x: 0.0, y: 0.125 }, targetPosition: { x: 1.0, y: 0.05 } },
    ],
  },
  {
    map: CONFIG.BATTLEMAP5, // SONGHAI SKY ARENA
    weatherChance: 0.25,
    rainChance: 0.85,
    snowChance: 0.0,
    blueDustChance: 1.0,
    sunRaysChance: 1.0,
    clouds: [
      { background: true, sourcePosition: { x: 0.0, y: 0.90 }, targetPosition: { x: 1.0, y: 0.70 } },
      { background: true, sourcePosition: { x: 0.0, y: 0.90 }, targetPosition: { x: 1.0, y: 0.70 } },
      { background: true, sourcePosition: { x: 0.0, y: 0.50 }, targetPosition: { x: 1.0, y: 0.30 } },
      { background: true, sourcePosition: { x: 0.0, y: 0.50 }, targetPosition: { x: 1.0, y: 0.30 } },
    ],
  },
  {
    map: CONFIG.BATTLEMAP6, // BLUE MONOLITH
    weatherChance: 0.0,
    rainChance: 0.0,
    snowChance: 0.0,
    blueDustChance: 1.0,
    sunRaysChance: 1.0,
    clouds: [
      { background: false, sourcePosition: { x: 1.0, y: 0.05 }, targetPosition: { x: 0.0, y: 0.05 } },
      { background: false, sourcePosition: { x: 1.0, y: 0.05 }, targetPosition: { x: 0.0, y: 0.05 } },
    ],
  },
  {
    map: CONFIG.BATTLEMAP7, // VETRUV PALACE
    weatherChance: 0.0,
    rainChance: 0.0,
    snowChance: 0.0,
    blueDustChance: 1.0,
    sunRaysChance: 0.0,
    clouds: [
      { background: true, sourcePosition: { x: 0.0, y: 0.95 }, targetPosition: { x: 1.0, y: 0.85 } },
      { background: true, sourcePosition: { x: 0.0, y: 0.95 }, targetPosition: { x: 1.0, y: 0.85 } },
    ],
  },
  {
    map: CONFIG.BATTLEMAP_SHIMZAR,
    weatherChance: 0.25,
    rainChance: 0.50,
    snowChance: 0.0,
    blueDustChance: 1.0,
    sunRaysChance: 1.0,
    blueDustColor: { r: 255, g: 184, b: 71 },
    clouds: [
      {
        background: true, sourcePosition: { x: 0.0, y: 0.75 }, targetPosition: { x: 1.0, y: 0.85 }, sourceColor: { r: 255, g: 225, b: 190 }, targetColor: { r: 84, g: 163, b: 174 },
      },
      {
        background: true, sourcePosition: { x: 0.0, y: 0.75 }, targetPosition: { x: 1.0, y: 0.85 }, sourceColor: { r: 255, g: 184, b: 150 }, targetColor: { r: 72, g: 117, b: 130 },
      },
      {
        background: true, sourcePosition: { x: 0.0, y: 0.75 }, targetPosition: { x: 1.0, y: 0.85 }, sourceColor: { r: 255, g: 184, b: 150 }, targetColor: { r: 93, g: 175, b: 190 },
      },
      {
        background: false, sourcePosition: { x: 1.0, y: 0.075 }, targetPosition: { x: 0.0, y: 0.05 }, sourceColor: { r: 93, g: 175, b: 190 }, targetColor: { r: 255, g: 184, b: 150 },
      },
      {
        background: false, sourcePosition: { x: 1.0, y: 0.075 }, targetPosition: { x: 0.0, y: 0.05 }, sourceColor: { r: 60, g: 100, b: 80 }, targetColor: { r: 100, g: 80, b: 60 },
      },
    ],
  },
  {
    map: CONFIG.BATTLEMAP_ABYSSIAN,
    weatherChance: 0.0,
    rainChance: 0.0,
    snowChance: 0.0,
    blueDustChance: 1.0,
    sunRaysChance: 0.0,
    blueDustColor: { r: 255, g: 0, b: 0 },
    clouds: [
      {
        background: true, sourcePosition: { x: 0.0, y: 0.8 }, targetPosition: { x: 1.0, y: 1.0 }, sourceColor: { r: 47, g: 50, b: 90 }, targetColor: { r: 32, g: 35, b: 62 },
      },
      {
        background: true, sourcePosition: { x: 0.0, y: 0.8 }, targetPosition: { x: 1.0, y: 1.0 }, sourceColor: { r: 95, g: 66, b: 127 }, targetColor: { r: 65, g: 47, b: 84 },
      },
      {
        background: true, sourcePosition: { x: 0.0, y: 0.8 }, targetPosition: { x: 1.0, y: 1.0 }, sourceColor: { r: 66, g: 72, b: 127 }, targetColor: { r: 44, g: 48, b: 84 },
      },
    ],
  },
  {
    map: CONFIG.BATTLEMAP_REDROCK,
    weatherChance: 0.0,
    rainChance: 0.0,
    snowChance: 0.0,
    blueDustChance: 1.0,
    sunRaysChance: 1.0,
    blueDustColor: { r: 255, g: 150, b: 30 },
    clouds: [
      { background: true, sourcePosition: { x: 0.0, y: 0.95 }, targetPosition: { x: 1.0, y: 0.85 } },
      { background: true, sourcePosition: { x: 0.0, y: 0.95 }, targetPosition: { x: 1.0, y: 0.85 } },
      {
        background: false, sourcePosition: { x: 1.0, y: 0.1 }, targetPosition: { x: 0.0, y: -0.025 }, sourceColor: { r: 225, g: 210, b: 210 }, targetColor: { r: 127, g: 80, b: 80 },
      },
      {
        background: false, sourcePosition: { x: 1.0, y: 0.075 }, targetPosition: { x: 0.0, y: 0.0 }, sourceColor: { r: 225, g: 210, b: 210 }, targetColor: { r: 127, g: 80, b: 80 },
      },
    ],
  },
  {
    map: CONFIG.BATTLEMAP_VANAR,
    weatherChance: 1.0,
    rainChance: 0.0,
    snowChance: 1.0,
    blueDustChance: 0.0,
    sunRaysChance: 0.0,
    clouds: [
      { background: true, sourcePosition: { x: 1.0, y: 0.85 }, targetPosition: { x: 0.0, y: 0.95 } },
      { background: true, sourcePosition: { x: 1.0, y: 0.85 }, targetPosition: { x: 0.0, y: 0.95 } },
      { background: false, sourcePosition: { x: 1.0, y: 0.1 }, targetPosition: { x: 0.0, y: -0.025 } },
      { background: false, sourcePosition: { x: 1.0, y: 0.075 }, targetPosition: { x: 0.0, y: 0.0 } },
    ],
  },
];
// size of final tiles on screen
CONFIG.TILESIZE = 95;
// percent of tile above to allow targeting a unit
CONFIG.TILE_TARGET_PCT = 0.45;
// offset of view board from center screen
CONFIG.TILEOFFSET_X = 0.0;
CONFIG.TILEOFFSET_Y = 10.0;
CONFIG.FLOOR_TILE_COLOR = { r: 0, g: 0, b: 0 };
CONFIG.FLOOR_TILE_OPACITY = 20;
// max mana; not accounting for bonuses; a player may have
CONFIG.MAX_MANA = 9;
CONFIG.STARTING_MANA = 2;
// max number of cards a player may have in hand at a time
CONFIG.MAX_HAND_SIZE = 6;
// number of cards players start with in hand
CONFIG.STARTING_HAND_SIZE = 5;
// number of cards players may mulligan
CONFIG.STARTING_HAND_REPLACE_COUNT = 2;
// content size of cards in player hand
CONFIG.HAND_CARD_SIZE = 140.0;
// padding around cards in game to account for larger unit sprite sizes
CONFIG.CARD_PADDING = 75.0;
// margin around inspected card
CONFIG.CARD_MARGIN = 75.0;
// color of card sidebar and modifiers bar
CONFIG.CARD_METADATA_BARS_COLOR = {
  r: 20, g: 20, b: 20, a: 255,
};
// padding for card modifiers and keywords
CONFIG.CARD_MODIFIER_PADDING_HORIZONTAL = 8.0;
CONFIG.CARD_MODIFIER_PADDING_VERTICAL = 5.0;
CONFIG.CARD_MODIFIER_ACTIVE_OPACITY = 255.0;
CONFIG.CARD_MODIFIER_ACTIVE_COLOR = { r: 255, g: 255, b: 255 };
CONFIG.CARD_MODIFIER_INACTIVE_OPACITY = 100.0;
CONFIG.CARD_MODIFIER_INACTIVE_COLOR = { r: 255, g: 255, b: 255 };
CONFIG.CARD_KEYWORDS_WIDTH = 190.0;
CONFIG.CARD_KEYWORD_PADDING_HORIZONTAL = 10.0;
CONFIG.CARD_KEYWORD_PADDING_VERTICAL = 5.0;
// signature card cooldown colors
CONFIG.SIGNATURE_CARD_COOLDOWN_FONT_COLOR = { r: 0.0, g: 0.0, b: 0.0 };
CONFIG.SIGNATURE_CARD_COOLDOWN_TIMER_COLOR = { r: 0.0, g: 0.0, b: 0.0 };
CONFIG.SIGNATURE_CARD_COOLDOWN_TIMER_OPACITY = 170.0;
CONFIG.SIGNATURE_CARD_COOLDOWN_TIMER_BG_COLOR = { r: 0.0, g: 0.0, b: 0.0 };
CONFIG.SIGNATURE_CARD_COOLDOWN_TIMER_BG_OPACITY = 0.0;
// content size of crates
CONFIG.CRATE_SIZE = { width: 230.0, height: 260.0 };
CONFIG.CRATE_PADDING = 80.0;
CONFIG.CRATE_OVERFLOW_SLOP = 23.0;
// max number of battle log entries to show
CONFIG.MAX_BATTLELOG_ENTRIES = 6;
// offset of battlelog
CONFIG.BATTLELOG_OFFSET = { x: 0.0, y: -30.0 };
// offset of battle log entries
CONFIG.BATTLELOG_ENTRY_OFFSET = { x: 10.0, y: 5.0 };
// content size of battle log entries
CONFIG.BATTLELOG_ENTRY_SIZE = 70.0;
// max number of active artifacts allowed on general
CONFIG.MAX_ARTIFACTS = 3;
// max durability of artifacts on general (i.e. how many times they can be hit before breaking)
CONFIG.MAX_ARTIFACT_DURABILITY = 3;
// content size of artifacts ui for active artifacts on general
CONFIG.ARTIFACT_SIZE = 70.0;
// max delay in seconds between steps in a replay
CONFIG.REPLAY_MAX_STEP_DELAY = 5.0;
// max delay in seconds between steps in a replay during mulligan
CONFIG.REPLAY_MAX_STEP_DELAY_STARTING_HAND = 10.0;
// card formatting for HTML display
CONFIG.FORMATTING_HTML = {
  entryDelimiter: '<br>',
  boldStart: '<b>',
  boldEnd: '</b>',
};
// card formatting for in engine display
CONFIG.FORMATTING_ENGINE = {
  entryDelimiter: '\n',
  boldStart: '<b>',
  boldEnd: '</b>',
  emphasisStart: '[',
  emphasisEnd: ']',
};
// offset of hand from center screen
CONFIG.HAND_OFFSET_X = -CONFIG.HAND_CARD_SIZE * 0.3;
CONFIG.HAND_OFFSET_Y = 10.0;
// players draw up to CARD_DRAW_PER_TURN cards each turn (until hand is full)
CONFIG.CARD_DRAW_PER_TURN = 1;
// max number of cards a player may replace per turn
CONFIG.MAX_REPLACE_PER_TURN = 1;
// time in seconds to show a tip
CONFIG.GAME_TIP_DURATION = 30;
// max number of emotes to show per page of emotes panel
CONFIG.MAX_EMOTES_PER_PAGE = 12;
// time in seconds between when emotes can be sent
CONFIG.EMOTE_DELAY = 5;
// time in seconds to show an emote
CONFIG.EMOTE_DURATION = 3;
// max number of cards to show per page of collection
CONFIG.MIN_COLUMNS_CARDS = 4;
CONFIG.MIN_ROWS_CARDS = 2;
// max number of buddies to show per page of buddy list
CONFIG.MAX_BUDDIES_PER_PAGE = 6;
// max number of times to update the buddy list per second
CONFIG.MAX_BUDDY_LIST_UPDATES_PER_SECOND = 1;
// max number of booster packs to show at once
CONFIG.MAX_BOOSTER_PACKS_SHOWN = 3;
// default deck name
CONFIG.DEFAULT_DECK_NAME = 'collection.default_deck_name';
// max size of deck
CONFIG.MAX_DECK_SIZE = 40;
// min size of deck when using all basics
CONFIG.MIN_BASICS_DECK_SIZE = 27;
// max size of deck in gauntlet
CONFIG.MAX_DECK_SIZE_GAUNTLET = 31;
// days before a gauntlet deck expires for use in friendly matches after being ended
CONFIG.DAYS_BEFORE_GAUNTLET_DECK_EXPIRES = 14;
// max effective spirit value of any deck
// decks may have a higher spirit value than this
CONFIG.MAX_EFFECTIVE_SPIRIT_VALUE = 10000;
// max number of duplicates of any card in deck
CONFIG.MAX_DECK_DUPLICATES = 3;
// whether deck size should include general
CONFIG.DECK_SIZE_INCLUDES_GENERAL = true;
// whether deck building should confirm cancel
CONFIG.DECK_BUILDING_CONFIRM_CANCEL = false;
// how many games to remind user to use signature card
CONFIG.NUM_GAMES_TO_SHOW_SIGNATURE_CARD_REMINDER = 20;
CONFIG.NUM_TURNS_BEFORE_SHOW_SIGNATURE_CARD_REMINDER = 3;
CONFIG.NUM_GAMES_TO_SHOW_REPLACE_REMINDER = 20;
CONFIG.NUM_TURNS_BEFORE_SHOW_REPLACE_REMINDER = 2;
CONFIG.REMINDER_DELAY = 0.25;
// max number of buddy messages to preview when not in buddy list
CONFIG.MAX_BUDDY_MESSAGES_TO_PREVIEW = 3;
// duration in seconds to show a preview of a buddy message when not in buddy list
CONFIG.BUDDY_MESSAGES_PREVIEW_DURATION = 5;
// duration in seconds to fade a preview of a buddy message when not in buddy list
CONFIG.BUDDY_MESSAGES_PREVIEW_FADE_DURATION = 0.3;
// delay in seconds of general casting animations
CONFIG.GENERAL_CAST_START_DELAY = 0.25;
CONFIG.GENERAL_CAST_END_DELAY = 0.5;
// duration in seconds to show a quest progress notification
CONFIG.QUEST_NOTIFICATION_DURATION = 4;
// duration in seconds to fade a quest progress notification
CONFIG.QUEST_NOTIFICATION_FADE_DURATION = 0.3;
// duration in seconds to show a quest progress notification
CONFIG.ACHIEVEMENT_NOTIFICATION_DURATION = 6;
// Reward for a users first win of the day
CONFIG.FIRST_WIN_OF_DAY_GOLD_REWARD = 20;
// Number of wins per user receiving win based gold reward
CONFIG.WINS_REQUIRED_FOR_WIN_REWARD = 3;
// Reward for a users first win of the day
CONFIG.WIN_BASED_GOLD_REWARD = 15;
// Cost of a rift ticket
CONFIG.RIFT_TICKET_GOLD_PRICE = 150;
// duration in seconds to announce
CONFIG.ANNOUNCER_DURATION = 1.2;
// delay in seconds between showing each star gained or lost
CONFIG.STARS_SEQUENCE_DELAY = 0.5;
// threshold distance in pixels to consider mouse input to be dragging (set to lower for more sensitive)
CONFIG.DRAGGING_DISTANCE = 20.0;
// threshold duration in seconds to consider mouse input to be dragging (set to lower for more sensitive)
CONFIG.DRAGGING_DELAY = 0.1;
// delay before app transitions from loading screen to main menu
CONFIG.POST_LOAD_DELAY = 2;
// delay before app transitions from versus screen to starting hand screen
CONFIG.VS_DELAY = 4.0;
// delay before app transitions from starting hand screen into a playable game
CONFIG.ACTIVE_GAME_DELAY = 1.5;
// delay before app tries to reconnect to a game automatically in the case of a network error
CONFIG.RECONNECT_DELAY = 1.0;
// A default timeout for promises involving UI Transitions
CONFIG.PROMISE_TIMEOUT_UI_TRANSITION = 5.0;
// delay before game over screen is shown
CONFIG.GAME_OVER_DELAY = 0.5;
// Seconds to wait before playing another messsage notification sfx
CONFIG.INCOMING_MESSAGE_SFX_DELAY = 5.0;
CONFIG.VIEW_TRANSITION_DURATION = 0.3;
CONFIG.NOTIFICATION_TRANSITION_DURATION = 0.35;
CONFIG.NOTIFICATION_DURATION = 1.0;
CONFIG.GAME_MAIN_NOTIFICATION_DURATION = 3.0;
CONFIG.GAME_BATTLE_NOTIFICATION_DURATION = 5.0;
CONFIG.GAME_PLAYER_NOTIFICATION_DURATION = 4.0;
// fallback duration to show speech bubbles over units when no sound provided
CONFIG.SPEECH_DURATION = 2.0;
CONFIG.INSTRUCTION_TEXT_MAX_WIDTH = Math.round(CONFIG.TILESIZE * 2.25);
CONFIG.TOOLTIP_TEXT_MAX_WIDTH = Math.round(CONFIG.TILESIZE * 2.25);
CONFIG.GENERAL_SPEECH_WIDTH = 280;
// fallback for how long to show
CONFIG.GENERAL_SPEECH_DURATION = 4.0;
CONFIG.DIALOGUE_PROCEED_PULSE_DELAY = 2.5;
// duration in seconds to transition dialogue in
CONFIG.DIALOGUE_ENTER_DURATION = 0.3;
// duration in seconds to show a player's out of cards statement
CONFIG.DIALOGUE_OUT_OF_CARDS_DURATION = 1.0;
// duration in seconds to show a player's hand is too full statement
CONFIG.DIALOGUE_HAND_FULL_DURATION = 1.0;
// duration in seconds for burn card animation
CONFIG.BURN_CARD_SHOW_DURATION = 0.25;
CONFIG.BURN_CARD_DELAY = 0.25;
CONFIG.BURN_CARD_DISSOLVE_DURATION = 0.75;
// duration in seconds to show a player's resign statement
CONFIG.DIALOGUE_RESIGN_DURATION = 2.0;
CONFIG.INSTRUCTIONAL_CARROT_GLOW_FREQUENCY = 4;
CONFIG.INSTRUCTIONAL_LONG_DURATION = 5.0;
CONFIG.INSTRUCTIONAL_SHORT_DURATION = 4.0;
CONFIG.INSTRUCTIONAL_ULTRAFAST_DURATION = 2.5;
CONFIG.INSTRUCTIONAL_DELAY_BEFORE_RESHOW = 4.0;
CONFIG.INSTRUCTIONAL_DEFAULT_DELAY = 0.0;
CONFIG.INSTRUCTIONAL_DISMISSED_LOOP_DELAY = 5.0;
CONFIG.INSTRUCTIONAL_MANUAL_DEFAULT_DELAY = 0.25; // This has to be manually added to instructionals, isn't automatically added anywhere
// delay before changing to next turn after all turn actions have been shown
CONFIG.TURN_DELAY = 0.0;
// delay when showing any special action
CONFIG.ACTION_DELAY = 0.5;
// how long the instructional arrow should take to get to the target
CONFIG.ACTION_INSTRUCTIONAL_ARROW_DURATION = 0.75;
// what percentage of instructional arrow duration should be used for sequencing
CONFIG.ACTION_INSTRUCTIONAL_ARROW_SHOW_PERCENT = 1.0;
// how long the exclamation mark should show for
CONFIG.ACTION_EXCLAMATION_MARK_DURATION = 1.2;
// what percentage of exclamation mark duration should be used for sequencing
CONFIG.ACTION_EXCLAMATION_MARK_SHOW_PERCENT = 0.5;
// delay in action sequencing when using a particle systems with infinite emission
CONFIG.PARTICLE_SEQUENCE_DELAY = 0.5;
// max number of steps a particle system can simulate per frame to account for lag
CONFIG.PARTICLE_SYSTEM_MAX_STEPS = 10.0;
// delay in seconds between showing multiple callouts on an entity
CONFIG.ENTITY_STATS_CHANGE_DELAY = 0.75;
// size of fonts for entity stats changes
CONFIG.ENTITY_STATS_CHANGE_ATK_FONT_SIZE = 20;
CONFIG.ENTITY_STATS_CHANGE_HP_FONT_SIZE = 20;
CONFIG.ENTITY_STATS_CHANGE_HEAL_FONT_SIZE = 20;
CONFIG.ENTITY_STATS_CHANGE_DAMAGE_FONT_SIZE = 20;// 30;
// whether to show prismatic fx only when inspecting
CONFIG.SHOW_PRISMATIC_ONLY_ON_INSPECT = false;
// whether to show prismatic card shine
CONFIG.SHOW_PRISMATIC_CARD_SHINE = true;
// how many seconds between showing prismatic card shine
CONFIG.SHOW_PRISMATIC_CARD_SHINE_DELAY = 4.0;
// threshold at which turn time starts visually counting down
CONFIG.TURN_TIME_SHOW = 20.0;
CONFIG.TURN_DURATION = 90.0;
CONFIG.TURN_DURATION_INACTIVE = 15.0;
CONFIG.TURN_DURATION_LATENCY_BUFFER = 2.0;
CONFIG.TILE_SELECT_OPACITY = 200;
CONFIG.TILE_HOVER_OPACITY = 200;
CONFIG.TILE_DIM_OPACITY = 127;
CONFIG.TILE_FAINT_OPACITY = 75;
CONFIG.TILE_SELECT_FREEZE_ON_ATTACK_MOVE = false;
// distance for path to fade in/out
CONFIG.PATH_FADE_DISTANCE = 40.0;
// opacity of paths
CONFIG.PATH_DIRECT_ACTIVE_OPACITY = 200;
CONFIG.PATH_DIRECT_DIM_OPACITY = 150;
CONFIG.PATH_TILE_ACTIVE_OPACITY = 150;
CONFIG.PATH_TILE_DIM_OPACITY = 100;
// distance for path to arc up
CONFIG.PATH_ARC_DISTANCE = CONFIG.TILESIZE * 0.5;
// rotation modifier of path when in arc
CONFIG.PATH_ARC_ROTATION_MODIFIER = 2.0;
// time it takes for a path to move 1 tile in view board
CONFIG.PATH_MOVE_DURATION = 1.5;
// opacity of targets
CONFIG.TARGET_ACTIVE_OPACITY = 200;
CONFIG.TARGET_DIM_OPACITY = 127;
// general purpose durations
CONFIG.ANIMATE_FAST_DURATION = 0.2;
CONFIG.ANIMATE_MEDIUM_DURATION = 0.35;
CONFIG.ANIMATE_SLOW_DURATION = 1.0;
CONFIG.FADE_FAST_DURATION = CONFIG.ANIMATE_FAST_DURATION;
CONFIG.FADE_MEDIUM_DURATION = CONFIG.ANIMATE_MEDIUM_DURATION;
CONFIG.FADE_SLOW_DURATION = CONFIG.ANIMATE_SLOW_DURATION;
CONFIG.PULSE_SLOW_DURATION = 1.5;
CONFIG.PULSE_MEDIUM_DURATION = 0.7;
CONFIG.PULSE_FAST_DURATION = CONFIG.ANIMATE_MEDIUM_DURATION;
CONFIG.PULSE_SLOW_FREQUENCY = 1.0 / CONFIG.PULSE_SLOW_DURATION;
CONFIG.PULSE_MEDIUM_FREQUENCY = 1.0 / CONFIG.PULSE_MEDIUM_DURATION;
CONFIG.PULSE_FAST_FREQUENCY = 1.0 / CONFIG.PULSE_FAST_DURATION;
CONFIG.MOVE_FAST_DURATION = 0.15;
CONFIG.MOVE_MEDIUM_DURATION = CONFIG.ANIMATE_MEDIUM_DURATION;
CONFIG.MOVE_SLOW_DURATION = CONFIG.ANIMATE_SLOW_DURATION;
CONFIG.STAGGER_FAST_DELAY = 0.1;
CONFIG.STAGGER_MEDIUM_DELAY = 0.15;
CONFIG.STAGGER_SLOW_DELAY = CONFIG.ANIMATE_MEDIUM_DURATION;
CONFIG.MUSIC_CROSSFADE_DURATION = 0.5;
CONFIG.VOICE_CROSSFADE_DURATION = 0.0;
// scale of sprites in view
CONFIG.SCALE = 2.0;
// offset from bottom of sprites for depth calculations
CONFIG.DEPTH_OFFSET = 19.5;
// global 3D rotation for illusion of depth
CONFIG.XYZ_ROTATION = { x: 16.0, y: 0.0, z: 0.0 };
// entity 3D rotation for illusion of depth
CONFIG.ENTITY_XYZ_ROTATION = { x: 26.0, y: 0.0, z: 0.0 };
// entity 3D rotation speed
CONFIG.XYZ_ROTATION_PER_SECOND_SLOW = { x: 0.0, y: 0.0, z: 15.0 };
CONFIG.XYZ_ROTATION_PER_SECOND_MEDIUM = { x: 0.0, y: 0.0, z: 45.0 };
CONFIG.XYZ_ROTATION_PER_SECOND_FAST = { x: 0.0, y: 0.0, z: 180.0 };
// maximum number of FX to allow per FX event
CONFIG.MAX_FX_PER_EVENT = 5;
// light intensity presets
CONFIG.LIGHT_LOW_INTENSITY = 1.0;
CONFIG.LIGHT_MEDIUM_INTENSITY = 3.0;
CONFIG.LIGHT_HIGH_INTENSITY = 5.0;
// duration to show new card for
CONFIG.NEW_CARD_DURATION = 1.5;
// whether to show unused entities when a player hovers over end turn
CONFIG.SHOW_UNUSED_ENTITIES = true;
// whether to show both move and attack tiles together when an entity can move and attack
CONFIG.SHOW_MERGED_MOVE_ATTACK_TILES = false;
// duration in seconds to transition my played card in or out for
CONFIG.MY_PLAYED_CARD_TRANSITION_DURATION = 0.5;
// duration in seconds to show my played card for between transition in/out
CONFIG.MY_PLAYED_CARD_SHOW_DURATION = 1.0 + CONFIG.MY_PLAYED_CARD_TRANSITION_DURATION;
// duration in seconds to transition opponent's played card in or out for
CONFIG.OPPONENT_PLAYED_CARD_TRANSITION_DURATION = 1.0;
// duration in seconds to show opponent's played card for
CONFIG.OPPONENT_PLAYED_CARD_SHOW_DURATION = 1.0 + CONFIG.OPPONENT_PLAYED_CARD_TRANSITION_DURATION;
// duration in seconds to transition the reveal of a hidden card in or out for
CONFIG.REVEAL_HIDDEN_CARD_TRANSITION_DURATION = 1.0;
// duration in seconds to show any played card for when revealing a hidden card
CONFIG.REVEAL_HIDDEN_CARD_SHOW_DURATION = 2.0 + CONFIG.REVEAL_HIDDEN_CARD_TRANSITION_DURATION;
// duration in seconds to transition a replay played card in or out for
CONFIG.REPLAY_PLAYED_CARD_TRANSITION_DURATION = 1.5;
// duration in seconds to show any played card for during replays
CONFIG.REPLAY_PLAYED_CARD_SHOW_DURATION = 1.0 + CONFIG.REPLAY_PLAYED_CARD_TRANSITION_DURATION;
// duration to delay view for opponent played cards
CONFIG.OPPONENT_PLAYED_CARD_DELAY = CONFIG.OPPONENT_PLAYED_CARD_SHOW_DURATION + 1.0;
// duration to delay view for reveal of hidden cards
CONFIG.REVEAL_HIDDEN_CARD_DELAY = CONFIG.REVEAL_HIDDEN_CARD_SHOW_DURATION + 1.0;
// duration to delay view for my played cards in replay
CONFIG.REPLAY_PLAYED_CARD_DELAY = CONFIG.REPLAY_PLAYED_CARD_SHOW_DURATION + 1.0;
// duration to fade fx while showing fx for played spells
CONFIG.PLAYED_SPELL_FX_FADE_IN_DURATION = 0.5;
CONFIG.PLAYED_SPELL_FX_FADE_OUT_DURATION = 0.5;
// template of options for fx that follows mouse while doing a followup
CONFIG.FOLLOWUP_FX_TEMPLATE = [
  {
    type: 'Light',
    radius: CONFIG.TILESIZE * 2.0,
    fadeInDuration: 0.5,
    opacity: 200,
    intensity: CONFIG.LIGHT_HIGH_INTENSITY,
    castsShadows: true,
  },
  {
    type: 'LensFlare',
    blendSrc: 'SRC_ALPHA',
    blendDst: 'ONE',
    speed: 1.0,
    scale: 2.0,
  },
];

// template of options for fx during a tutorial instruction
CONFIG.TUTORIAL_INSTRUCTION_FX_ENABLED = false;
CONFIG.TUTORIAL_INSTRUCTION_FX_FADE_DURATION = CONFIG.FADE_MEDIUM_DURATION;
CONFIG.TUTORIAL_INSTRUCTION_FX_LIGHT_RADIUS = 6.0;
CONFIG.TUTORIAL_INSTRUCTION_FX_TEMPLATE = [
  {
    type: 'Light',
    fadeInDuration: CONFIG.FADE_MEDIUM_DURATION,
    opacity: 255,
    intensity: CONFIG.LIGHT_LOW_INTENSITY,
    castsShadows: true,
    offset: { x: 0.0, y: -CONFIG.TILESIZE * 0.5 },
    color: { r: 255, g: 255, b: 255 },
  },
];

// template of options for fx that follows mouse for when hovering to attack
CONFIG.ATTACK_FX_TEMPLATE = [
  {
    // type: "LensFlare",
    /// /blendSrc: "SRC_ALPHA",
    /// /blendDst: "ONE",
    // color: { r: 255, g: 20, b: 40 },
    // speed: 1.0,
    // scale: 3.0
  },
];
// duration in seconds to show a general's taunt before finishing
// (may remove this and set dynamically later)
CONFIG.HIGHLIGHT_GENERAL_TAUNT_DURATION = 2.0;
// duration in seconds to delay before showing my general taunting
// if this value is less than opponent general's taunt, it will show before
CONFIG.HIGHLIGHT_MY_GENERAL_TAUNT_DELAY = 0.5;
// duration in seconds to delay before showing opponent general taunting
// if this value is less than my general's taunt, it will show before
CONFIG.HIGHLIGHT_OPPONENT_GENERAL_TAUNT_DELAY = CONFIG.HIGHLIGHT_MY_GENERAL_TAUNT_DELAY + CONFIG.HIGHLIGHT_GENERAL_TAUNT_DURATION + 0.5;
// duration in seconds to fade out fx used to show general
CONFIG.GENERAL_FX_FADE_DURATION = CONFIG.FADE_FAST_DURATION;
// template of options for fx that is used to show my general
CONFIG.GENERAL_FX_TEMPLATE = [
  {
    type: 'Light',
    radius: CONFIG.TILESIZE * 4.0,
    fadeInDuration: CONFIG.FADE_SLOW_DURATION,
    opacity: 255,
    intensity: CONFIG.LIGHT_LOW_INTENSITY,
    castsShadows: true,
    offset: { x: 0.0, y: -CONFIG.TILESIZE },
    color: { r: 255, g: 255, b: 255 },
  },
];
// whether stats should be shown during steps replay
CONFIG.OVERLAY_STATS_DURING_STEPS = true;
// whether stats should be shown on hover
CONFIG.OVERLAY_STATS_DURING_HOVER = true;
// whether stats should be shown on select
CONFIG.OVERLAY_STATS_DURING_SELECT = true;
// stats node text size
CONFIG.OVERLAY_STATS_TEXT_SIZE = 16;
// stats node offset from center of unit
CONFIG.OVERLAY_STATS_OFFSET = { x: 0.0, y: -CONFIG.TILESIZE * 0.6 };
// stats node background transparency
CONFIG.OVERLAY_STATS_BG_ALPHA = 225;
// space between overlay stats
CONFIG.OVERLAY_STATS_SPACING = CONFIG.TILESIZE * 0.6;
// speech node offset from center of unit
CONFIG.KILL_NODE_OFFSET = { x: 0.0, y: -CONFIG.TILESIZE * 0.225 };
// instruction node offset from center of unit based on direction of instruction
CONFIG.INSTRUCTION_NODE_OFFSET = CONFIG.TILESIZE * 0.5;
// colors for entity glows
CONFIG.PLAYER_CARD_GLOW_RAMP_FROM_COLOR = {
  r: 255, g: 255, b: 255, a: 255,
};
CONFIG.PLAYER_CARD_GLOW_RAMP_TRANSITION_COLOR = { r: 40, g: 170, b: 255 };
CONFIG.PLAYER_CARD_GLOW_RAMP_TO_COLOR = { r: 40, g: 170, b: 255 };
CONFIG.PLAYER_CARD_GLOW_RAMP_NOISE_COLOR = { r: 40, g: 255, b: 255 };
CONFIG.OPPONENT_CARD_GLOW_RAMP_FROM_COLOR = {
  r: 255, g: 175, b: 175, a: 255,
};
CONFIG.OPPONENT_CARD_GLOW_RAMP_TRANSITION_COLOR = { r: 255, g: 60, b: 60 };
CONFIG.OPPONENT_CARD_GLOW_RAMP_TO_COLOR = { r: 255, g: 0, b: 0 };
CONFIG.OPPONENT_CARD_GLOW_RAMP_NOISE_COLOR = { r: 255, g: 60, b: 60 };
CONFIG.PLAYER_SIGNATURE_CARD_GLOW = { r: 40, g: 201, b: 255 };
CONFIG.OPPONENT_SIGNATURE_CARD_GLOW = { r: 255, g: 50, b: 75 };
CONFIG.NEUTRAL_SIGNATURE_CARD_GLOW = { r: 40, g: 133, b: 255 };
CONFIG.INSTRUCTIONAL_CARD_GLOW_RAMP_FROM_COLOR = {
  r: 255, g: 255, b: 255, a: 255,
};
CONFIG.INSTRUCTIONAL_CARD_GLOW_RAMP_TRANSITION_COLOR = { r: 40, g: 170, b: 255 };
CONFIG.INSTRUCTIONAL_CARD_GLOW_RAMP_TO_COLOR = { r: 40, g: 170, b: 255 };
CONFIG.INSTRUCTIONAL_CARD_GLOW_RAMP_NOISE_COLOR = { r: 40, g: 255, b: 255 };
// colors for labels in post game rank screen
CONFIG.POST_GAME_RANK_PRIMARY_COLOR = { r: 255, g: 255, b: 255 };
CONFIG.POST_GAME_RANK_SECONDARY_COLOR = { r: 196, g: 211, b: 227 };
// time it takes an entity to move 1 tile
CONFIG.ENTITY_MOVE_DURATION_MODIFIER = 1.0;

// max modifier to entity movement animation time per 1 tile
CONFIG.ENTITY_MOVE_MODIFIER_MAX = 1.0;
// minimum modifier to entity movement animation time per 1 tile
CONFIG.ENTITY_MOVE_MODIFIER_MIN = 0.75;
// correction time to make it appear as if an entity stops correctly at end of movement
CONFIG.ENTITY_MOVE_CORRECTION = 0.2;
// fixed number of tiles that a flying unit will use to determine how fast to move
// i.e. the lower the tile count, the fewer animation cycles and faster the unit will move
// however, if the distance to travel is less than this, it will use the lower distance
CONFIG.ENTITY_MOVE_FLYING_FIXED_TILE_COUNT = 3.0;
// modifier to entity attack animation time
CONFIG.ENTITY_ATTACK_DURATION_MODIFIER = 1.0;
// properties of glow used to suggest that an entity is ready to be used
CONFIG.PLAYER_READY_COLOR = { r: 255, g: 255, b: 255 };
CONFIG.PLAYER_READY_PARTICLES_VISIBLE = true;
CONFIG.PLAYER_READY_HIGHLIGHT_VISIBLE = false;
CONFIG.PLAYER_READY_HIGHLIGHT_COLOR = { r: 70, g: 90, b: 255 };
CONFIG.PLAYER_READY_HIGHLIGHT_FREQUENCY = 0.75;
CONFIG.PLAYER_READY_HIGHLIGHT_OPACITY_MIN = 0;
CONFIG.PLAYER_READY_HIGHLIGHT_OPACITY_MAX = 200;
// properties of glow used to suggest that an entity is opponent's entity
CONFIG.OPPONENT_READY_COLOR = { r: 255, g: 40, b: 70 };
CONFIG.OPPONENT_READY_PARTICLES_VISIBLE = false;
CONFIG.OPPONENT_READY_HIGHLIGHT_VISIBLE = false;
CONFIG.OPPONENT_READY_HIGHLIGHT_COLOR = { r: 255, g: 0, b: 0 };
CONFIG.OPPONENT_READY_HIGHLIGHT_FREQUENCY = 0.75;
CONFIG.OPPONENT_READY_HIGHLIGHT_OPACITY_MIN = 0;
CONFIG.OPPONENT_READY_HIGHLIGHT_OPACITY_MAX = 200;
// default glow colors
CONFIG.DEFAULT_GLOW_COLOR = { r: 37, g: 176, b: 255 };
CONFIG.DEFAULT_GLOW_HIGHLIGHT_COLOR = { r: 50, g: 255, b: 100 };
// loot crate glow colors
CONFIG.LOOT_CRATE_GLOW_COLOR = { r: 37, g: 176, b: 255 };
// arena faction select glow colors
CONFIG.ARENA_FACTION_GLOW_COLOR = CONFIG.DEFAULT_GLOW_COLOR;
CONFIG.ARENA_FACTION_GLOW_HIGHLIGHT_COLOR = { r: 50, g: 255, b: 100 };
CONFIG.ARENA_FACTION_GLOW_SELECT_COLOR = { r: 50, g: 255, b: 150 };
CONFIG.ARENA_FACTION_GLOW_DISABLE_COLOR = { r: 70, g: 99, b: 127 };
// arena card select glow colors
CONFIG.ARENA_CARD_GLOW_COLOR = CONFIG.DEFAULT_GLOW_COLOR;
CONFIG.ARENA_CARD_GLOW_HIGHLIGHT_COLOR = { r: 143, g: 218, b: 62 };
CONFIG.ARENA_CARD_GLOW_SELECT_COLOR = { r: 143, g: 255, b: 62 };
CONFIG.ARENA_CARD_GLOW_DISABLE_COLOR = { r: 70, g: 99, b: 127 };
// the pattern step used to generate range patterns
// think of it like a stamp that fills out the final pattern until it reaches the max distance
CONFIG.RANGE_PATTERN_STEP = [
  { x: -1, y: -1 },
  { x: -1, y: 0 },
  { x: -1, y: 1 },
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: 1, y: -1 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
];
// the pattern step used to generate movement paths
// think of it as how something is allowed to move across the board from tile to tile
CONFIG.MOVE_PATTERN_STEP = [
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: 0, y: 1 },
];
// the pattern step used to generate spawn patterns
CONFIG.SPAWN_PATTERN_STEP = CONFIG.RANGE_PATTERN_STEP;
// the pattern step used to generate spell patterns
CONFIG.SPELL_PATTERN_STEP = [
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: 0, y: 1 },
];
// properties for owners
CONFIG.PLAYER_OWNER_OPACITY = 0;
CONFIG.PLAYER_OWNER_COLOR = { r: 0, g: 200, b: 255 };
CONFIG.PLAYER_FX_COLOR = { r: 255, g: 255, b: 255 };
CONFIG.PLAYER_TILE_COLOR = { r: 255, g: 255, b: 255 };
CONFIG.OPPONENT_OWNER_OPACITY = 80;
CONFIG.OPPONENT_OWNER_COLOR = { r: 255, g: 0, b: 0 };
CONFIG.OPPONENT_FX_COLOR = { r: 255, g: 100, b: 100 };
CONFIG.OPPONENT_TILE_COLOR = { r: 255, g: 100, b: 100 };
// colors for various situations
CONFIG.HP_COLOR = { r: 252, g: 0, b: 2 };
CONFIG.ATK_COLOR = { r: 251, g: 254, b: 0 };
CONFIG.MANA_COLOR = { r: 12, g: 82, b: 161 };
CONFIG.MANA_BUFF_COLOR = { r: 13, g: 148, b: 23 };
CONFIG.MANA_NERF_COLOR = { r: 161, g: 27, b: 18 };
CONFIG.BUFF_COLOR = { r: 39, g: 233, b: 86 };
CONFIG.NERF_COLOR = { r: 255, g: 50, b: 0 };
CONFIG.PATH_COLOR = { r: 255, g: 255, b: 255 };
CONFIG.MOVE_COLOR = { r: 240, g: 240, b: 240 };
CONFIG.MOVE_ALT_COLOR = { r: 255, g: 255, b: 255 };
CONFIG.MOVE_OPPONENT_COLOR = { r: 240, g: 240, b: 240 };
CONFIG.MOVE_OPPONENT_ALT_COLOR = { r: 255, g: 255, b: 255 };
CONFIG.AGGRO_COLOR = { r: 255, g: 217, b: 0 };
CONFIG.AGGRO_ALT_COLOR = { r: 255, g: 255, b: 255 };
CONFIG.AGGRO_OPPONENT_COLOR = { r: 210, g: 40, b: 70 };
CONFIG.AGGRO_OPPONENT_ALT_COLOR = { r: 130, g: 25, b: 45 };
CONFIG.NEUTRAL_COLOR = { r: 255, g: 217, b: 0 };
CONFIG.NEUTRAL_ALT_COLOR = { r: 245, g: 245, b: 245 };
CONFIG.SELECT_COLOR = { r: 255, g: 255, b: 255 };
CONFIG.SELECT_OPPONENT_COLOR = { r: 210, g: 40, b: 70 };
CONFIG.MOUSE_OVER_COLOR = { r: 255, g: 255, b: 255 };
CONFIG.MOUSE_OVER_OPPONENT_COLOR = { r: 210, g: 40, b: 70 };
CONFIG.CARD_PLAYER_COLOR = { r: 255, g: 217, b: 0 };
CONFIG.CARD_PLAYER_ALT_COLOR = { r: 255, g: 255, b: 255 };
CONFIG.CARD_OPPONENT_COLOR = { r: 210, g: 40, b: 70 };
CONFIG.CARD_OPPONENT_ALT_COLOR = { r: 130, g: 25, b: 45 };
CONFIG.INSTRUCTIONAL_TARGET_COLOR = { r: 255, g: 255, b: 255 };

// Colors for instruction nodes
CONFIG.INSTRUCTION_NODE_BACKGROUND_COLOR = {
  r: 0, g: 0, b: 0, a: 255,
};
CONFIG.INSTRUCTION_NODE_OUTLINE_COLOR = {
  r: 255, g: 255, b: 255, a: 255,
};
CONFIG.INSTRUCTION_NODE_CARROT_BACKGROUND_COLOR = {
  r: 255, g: 69, b: 0, a: 255,
};
CONFIG.INSTRUCTION_NODE_CARROT_OUTLINE_COLOR = {
  r: 0, g: 0, b: 0, a: 200,
};
CONFIG.INSTRUCTION_NODE_TEXT_COLOR = { r: 255, g: 255, b: 255 };
CONFIG.INSTRUCTION_NODE_HIGHLIGHT_TEXT_COLOR = { r: 0, g: 255, b: 0 };
CONFIG.INSTRUCTION_NODE_HEADER_TITLE_COLOR = { r: 20, g: 128, b: 255 };
CONFIG.DIALOGUE_TEXT_COLOR = { r: 0, g: 0, b: 0 };
CONFIG.DIALOGUE_HIGHLIGHT_TEXT_COLOR = { r: 0, g: 255, b: 0 };
CONFIG.DIALOGUE_HEADER_TITLE_COLOR = { r: 20, g: 128, b: 255 };
// Config for instructional ui in tutorial
CONFIG.INSTRUCTIONAL_UI_INITIAL_OPACITY = 100;
CONFIG.INSTRUCTIONAL_UI_OVERLAP_OPACITY = 127;
CONFIG.INSTRUCTIONAL_UI_HIGHLIGHTED_OPACITY = 200;
CONFIG.INSTRUCTIONAL_UI_CORRECT_TARGET_OPACITY = 200;
// colors for attackable targets
// CONFIG.ATTACKABLE_TARGET_GLOW_RAMP_FROM = {r: 255, g: 50, b: 40};
// CONFIG.ATTACKABLE_TARGET_GLOW_RAMP_TRANSITION = {r: 255, g: 50, b: 40};
// CONFIG.ATTACKABLE_TARGET_GLOW_COLOR_TO = {r: 255, g: 50, b: 40};
// CONFIG.ATTACKABLE_TARGET_GLOW_EXPAND_MODIFIER = 2.25;
CONFIG.CONTINUE_TEXT_COLOR = { r: 141, g: 253, b: 255 };
CONFIG.CONTINUE_BUTTON_TEXT_COLOR = { r: 255, g: 255, b: 255 };
CONFIG.CONTINUE_BG_COLOR = {
  r: 19, g: 19, b: 49, a: 128,
};
CONFIG.BUY_TEXT_COLOR = { r: 141, g: 253, b: 255 };
CONFIG.BUY_BUTTON_TEXT_COLOR = { r: 255, g: 255, b: 255 };
CONFIG.BUY_BG_COLOR = {
  r: 19, g: 19, b: 49, a: 128,
};
CONFIG.SEASON_BG_COLOR = {
  r: 19, g: 19, b: 49, a: 192,
};

CONFIG.ATTACKABLE_TARGET_GLOW_RAMP_FROM = { r: 255, g: 210, b: 180 };
CONFIG.ATTACKABLE_TARGET_GLOW_RAMP_TRANSITION = { r: 255, g: 210, b: 180 };
CONFIG.ATTACKABLE_TARGET_GLOW_COLOR_TO = { r: 255, g: 210, b: 180 };
CONFIG.ATTACKABLE_TARGET_GLOW_RAMP_NOISE_COLOR = { r: 255, g: 210, b: 180 };

// threshold for something to be considered high damage
CONFIG.HIGH_DAMAGE = 7;
// how long screen focus takes to "fade" in
CONFIG.HIGH_DAMAGE_SCREEN_FOCUS_IN_DURATION = 0.1;
// how long screen focus sits idle
CONFIG.HIGH_DAMAGE_SCREEN_FOCUS_DELAY = 0.0;
// how long screen focus takes to "fade" out
CONFIG.HIGH_DAMAGE_SCREEN_FOCUS_OUT_DURATION = 0.25;
// screen shake on high damage
CONFIG.HIGH_DAMAGE_SCREEN_SHAKE_DURATION = 0.35;
CONFIG.HIGH_DAMAGE_SCREEN_SHAKE_STRENGTH = 20.0;
// radial blur on high damage
CONFIG.HIGH_DAMAGE_RADIAL_BLUR_SPREAD = 0.25;
CONFIG.HIGH_DAMAGE_RADIAL_BLUR_DEAD_ZONE = 0.2;
CONFIG.HIGH_DAMAGE_RADIAL_BLUR_STRENGTH = 0.5;
// threshold for something to be considered high cost
CONFIG.HIGH_COST = 5;
// how long screen focus takes to "fade" in
CONFIG.HIGH_COST_SCREEN_FOCUS_IN_DURATION = 0.1;
// how long screen focus sits idle
CONFIG.HIGH_COST_SCREEN_FOCUS_DELAY = 0.0;
// how long screen focus takes to "fade" out
CONFIG.HIGH_COST_SCREEN_FOCUS_OUT_DURATION = 0.5;
// screen shake on high cost
CONFIG.HIGH_COST_SCREEN_SHAKE_DURATION = 1.0;
CONFIG.HIGH_COST_SCREEN_SHAKE_STRENGTH = 5.0;
// radial blur on high cost
CONFIG.HIGH_COST_RADIAL_BLUR_SPREAD = 0.25;
CONFIG.HIGH_COST_RADIAL_BLUR_DEAD_ZONE = 0.2;
CONFIG.HIGH_COST_RADIAL_BLUR_STRENGTH = 0.5;

// color codes
CONFIG.COLOR_CODES = [
  { code: 0, cssClass: 'color-code-none' },
  { code: 1, cssClass: 'color-code-blue' },
  { code: 2, cssClass: 'color-code-cyan' },
  { code: 3, cssClass: 'color-code-green' },
  { code: 4, cssClass: 'color-code-magenta' },
  { code: 5, cssClass: 'color-code-purple' },
  { code: 6, cssClass: 'color-code-red' },
  { code: 7, cssClass: 'color-code-orange' },
  { code: 8, cssClass: 'color-code-yellow' },
];

/**
 * Start properties that you probably don't want to edit unless you know what they do.
 */
CONFIG.APP_SELECTOR = '#app';
CONFIG.MAIN_SELECTOR = '#app-main';
CONFIG.HORIZONTAL_SELECTOR = '#app-horizontal';
CONFIG.VERTICAL_SELECTOR = '#app-vertical';
CONFIG.OVERLAY_SELECTOR = '#app-overlay-region';
CONFIG.GAME_SELECTOR = '#app-game';
CONFIG.GAMECANVAS_SELECTOR = '#app-gamecanvas';
CONFIG.CONTENT_SELECTOR = '#app-content-region';
CONFIG.MODAL_SELECTOR = '#app-modal-region';
CONFIG.NOTIFICATIONS_SELECTOR = '#app-notifications-region';
CONFIG.UTILITY_SELECTOR = '#app-utility-region';
CONFIG.COLLECTION_SELECTOR = '#app-collection';
CONFIG.MAINTENANCE_ANNOUNCEMENTS_SELECTOR = '#maintenance-announcements-region';

CONFIG.DESTROY_TAG = 1001;
CONFIG.FADE_TAG = 1002;
CONFIG.MOVE_TAG = 1003;
CONFIG.ROTATE_TAG = 1004;
CONFIG.SCALE_TAG = 1005;
CONFIG.PULSE_TAG = 1006;
CONFIG.FOCUS_TAG = 1007;
CONFIG.GLOW_TAG = 1008;
CONFIG.TINT_TAG = 1009;
CONFIG.ANIM_TAG = 1010;
CONFIG.CARD_TAG = 1011;
CONFIG.SPEECH_TAG = 1012;
CONFIG.INFINITY = 9999;

// commonly used speed (movement range)

CONFIG.SPEED_BASE = 2;
CONFIG.SPEED_FAST = 3;
CONFIG.SPEED_INFINITE = CONFIG.BOARDCOL + CONFIG.BOARDROW;

// commonly used reach (attack range)

CONFIG.REACH_MELEE = 1;
CONFIG.REACH_RANGED = CONFIG.BOARDCOL + CONFIG.BOARDROW;

// convenient board values

CONFIG.WHOLE_BOARD_RADIUS = CONFIG.BOARDCOL > CONFIG.BOARDROW ? CONFIG.BOARDCOL : CONFIG.BOARDROW;

CONFIG.ALL_BOARD_POSITIONS = (function () {
  const pattern = [];
  for (let x = 0; x < CONFIG.BOARDCOL; x++) {
    for (let y = 0; y < CONFIG.BOARDROW; y++) {
      pattern.push({ x, y });
    }
  }
  return pattern;
}());

// commonly used patterns

CONFIG.PATTERN_1x1 = [
  { x: 0, y: 0 },
];
CONFIG.PATTERN_3x1 = [
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: 2, y: 0 },
  { x: -2, y: 0 },
  { x: 3, y: 0 },
  { x: -3, y: 0 },
];
CONFIG.PATTERN_3x2 = [
  { x: -1, y: 0 },
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: -1, y: -1 },
  { x: 0, y: -1 },
  { x: 1, y: -1 },
];
CONFIG.PATTERN_3x3 = [
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: -1, y: -1 },
  { x: 1, y: 1 },
  { x: 1, y: -1 },
  { x: -1, y: 1 },
];
CONFIG.PATTERN_3x3_INCLUDING_CENTER = [
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: 0, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: -1 },
  { x: 1, y: 1 },
  { x: 1, y: -1 },
  { x: -1, y: 1 },
];
CONFIG.PATTERN_2X2 = [
  { x: 0, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
];
CONFIG.PATTERN_1X3 = [
  { x: 0, y: -1 },
  { x: 0, y: 0 },
  { x: 0, y: 1 },
];
CONFIG.PATTERN_3X1 = [
  { x: -1, y: 0 },
  { x: 0, y: 0 },
  { x: 1, y: 0 },
];
CONFIG.PATTERN_4SPACES = [
  { x: -4, y: 0 },
  { x: -3, y: -1 }, { x: -3, y: 0 }, { x: -3, y: 1 },
  { x: -2, y: -2 }, { x: -2, y: -1 }, { x: -2, y: 0 }, { x: -2, y: 1 }, { x: -2, y: 2 },
  { x: -1, y: -3 }, { x: -1, y: -2 }, { x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: -1, y: 2 }, { x: -1, y: 3 },
  { x: 0, y: -4 }, { x: 0, y: -3 }, { x: 0, y: -2 }, { x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 },
  { x: 1, y: -3 }, { x: 1, y: -2 }, { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 },
  { x: 2, y: -2 }, { x: 2, y: -1 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 },
  { x: 3, y: -1 }, { x: 3, y: 0 }, { x: 3, y: 1 },
  { x: 4, y: 0 },
];

CONFIG.PATTERN_3SPACES_WITHOUT_CENTER = [
  { x: -3, y: 0 },
  { x: -2, y: -1 }, { x: -2, y: 0 }, { x: -2, y: 1 },
  { x: -1, y: -2 }, { x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: -1, y: 2 },
  { x: 0, y: -3 }, { x: 0, y: -2 }, { x: 0, y: -1 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 },
  { x: 1, y: -2 }, { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 },
  { x: 2, y: -1 }, { x: 2, y: 0 }, { x: 2, y: 1 },
  { x: 3, y: 0 },
];

CONFIG.PATTERN_3SPACES = [
  { x: -3, y: 0 },
  { x: -2, y: -1 }, { x: -2, y: 0 }, { x: -2, y: 1 },
  { x: -1, y: -2 }, { x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: -1, y: 2 },
  { x: 0, y: -3 }, { x: 0, y: -2 }, { x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 },
  { x: 1, y: -2 }, { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 },
  { x: 2, y: -1 }, { x: 2, y: 0 }, { x: 2, y: 1 },
  { x: 3, y: 0 },
];

CONFIG.PATTERN_2SPACES = [
  { x: -2, y: 0 },
  { x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 },
  { x: 0, y: -2 }, { x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 },
  { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 },
  { x: 2, y: 0 },
];

CONFIG.PATTERN_1SPACE = [
  { x: -1, y: 0 },
  { x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 },
  { x: 1, y: 0 },
];

CONFIG.PATTERN_CORNERS = [
  { x: 0, y: 0 },
  { x: 0, y: CONFIG.BOARDROW - 1 },
  { x: CONFIG.BOARDCOL - 1, y: 0 },
  { x: CONFIG.BOARDCOL - 1, y: CONFIG.BOARDROW - 1 },
];

CONFIG.PATTERN_WHOLE_BOARD = (function () {
  const pattern = [];
  for (let x = -CONFIG.BOARDCOL; x < CONFIG.BOARDCOL; x++) {
    for (let y = -CONFIG.BOARDROW; y < CONFIG.BOARDROW; y++) {
      pattern.push({ x, y });
    }
  }
  return pattern;
}());

CONFIG.PATTERN_HALF_BOARD = (function () {
  const pattern = [];
  for (let x = 0; x < Math.floor(CONFIG.BOARDCOL / 2); x++) {
    for (let y = 0; y < CONFIG.BOARDROW; y++) {
      pattern.push({ x, y });
    }
  }
  return pattern;
}());

CONFIG.PATTERN_WHOLE_ROW = (function () {
  const pattern = [];
  for (let x = -Math.floor(CONFIG.BOARDCOL / 2); x < Math.ceil(CONFIG.BOARDCOL / 2); x++) {
    pattern.push({
      x,
      y: 0,
    });
  }
  return pattern;
}());

CONFIG.PATTERN_WHOLE_COLUMN = (function () {
  const pattern = [];
  for (let y = -Math.floor(CONFIG.BOARDROW / 2); y < Math.ceil(CONFIG.BOARDROW / 2); y++) {
    pattern.push({
      x: 0,
      y,
    });
  }
  return pattern;
}());

CONFIG.PATTERN_BLAST = (function () {
  let pattern = [];
  for (let x = -CONFIG.BOARDCOL; x < CONFIG.BOARDCOL; x++) {
    if (x !== 0) {
      pattern.push({
        x,
        y: 0,
      });
    }
  }
  for (let y = -CONFIG.BOARDROW; y < CONFIG.BOARDROW; y++) {
    if (y !== 0) {
      pattern.push({
        x: 0,
        y,
      });
    }
  }

  // we also want to include the normal pattern
  pattern = pattern.concat(CONFIG.PATTERN_3x3);

  // remove any duplicates
  const finalPattern = [];
  for (let i = 0, il = pattern.length; i < il; i++) {
    const currentPosition = pattern[i];
    const { x } = currentPosition;
    const { y } = currentPosition;
    let unique = true;
    for (let j = 0, jl = finalPattern.length; j < jl; j++) {
      const position = finalPattern[j];
      if (x === position.x && y === position.y) {
        unique = false;
        break;
      }
    }
    if (unique) {
      finalPattern.push(currentPosition);
    }
  }

  return finalPattern;
}());

CONFIG.TEST_LIGHT_TEMPLATE = {
  type: 'Light',
  radius: CONFIG.TILESIZE * 10,
  opacity: 255.0,
  intensity: 1.0,
  duration: 1.0,
  color: {
    r: 255,
    g: 255,
    b: 255,
  },
};

// bloom constant values
CONFIG.BLOOM_MIN = 0.5;
CONFIG.BLOOM_DEFAULT = 0.7;
CONFIG.BLOOM_MAX = 0.8;

// lighting quality constant values
CONFIG.LIGHTING_QUALITY_LOW = 0.0;
CONFIG.LIGHTING_QUALITY_MEDIUM = 0.5;
CONFIG.LIGHTING_QUALITY_HIGH = 1.0;

// shadow quality constant values
CONFIG.SHADOW_QUALITY_LOW = 0.0;
CONFIG.SHADOW_QUALITY_MEDIUM = 0.5;
CONFIG.SHADOW_QUALITY_HIGH = 1.0;

// board quality constant values
CONFIG.BOARD_QUALITY_LOW = 0.0;
CONFIG.BOARD_QUALITY_HIGH = 1.0;

// default volumes for a new user, between 0 and 1
CONFIG.DEFAULT_MASTER_VOLUME = 1.0;
CONFIG.DEFAULT_MUSIC_VOLUME = 0.04;
CONFIG.DEFAULT_VOICE_VOLUME = 0.3;
CONFIG.DEFAULT_SFX_VOLUME = 0.3;

// duration in seconds that interaction sfx will wait before playing
CONFIG.SFX_INTERACTION_DELAY = 0.06;

// duration in seconds that sfx will be considered playing for the purposes of volume modification
CONFIG.SFX_MULTIPLIER_DURATION_THRESHOLD = 0.35;

// power to which sfx volume will be lowered based on number of playing sfx
// where higher power will lower volume more aggressively and 0 will not lower volume at all
// equation: pow(1 / num sfx, multiplier power)
CONFIG.SFX_MULTIPLIER_POWER = 0.3;

// duration in seconds that interaction sfx will block other interaction sfx
CONFIG.INTERACTION_SFX_BLOCKING_DURATION_THRESHOLD = 0.5;

CONFIG.DEFAULT_SFX_PRIORITY = 0;
CONFIG.CLICK_SFX_PRIORITY = 1;
CONFIG.SELECT_SFX_PRIORITY = 2;
CONFIG.CANCEL_SFX_PRIORITY = 3;
CONFIG.CONFIRM_SFX_PRIORITY = 4;
CONFIG.SHOW_SFX_PRIORITY = 5;
CONFIG.HIDE_SFX_PRIORITY = 6;
CONFIG.ERROR_SFX_PRIORITY = 7;
CONFIG.MAX_SFX_PRIORITY = 9999;

// global scale - scale of game relative to resolution
// set dynamically on resize
CONFIG.globalScale = 1.0;

// pixel scale in engine - combined global scale and engine device pixel ratio
// set dynamically on resize
CONFIG.pixelScaleEngine = 1.0;

// pixel scale in CSS - combined global scale and css device pixel ratio
// set dynamically on resize
CONFIG.pixelScaleCSS = 1.0;

// resource scale in engine - scale at which resources should be loaded for use in engine
// set dynamically on resize
CONFIG.resourceScaleEngine = 1.0;

// resource scale in CSS - scale at which resources should be loaded for use in CSS
// set dynamically on resize
CONFIG.resourceScaleCSS = 1.0;

// resolution
// set dynamically by local storage
CONFIG.resolution = CONFIG.RESOLUTION_DEFAULT;

// whether HiDPI mode is enabled
// set dynamically by local storage
CONFIG.hiDPIEnabled = false;

// currently chosen main menu scene
// set dynamically by user profile and/or local storage
CONFIG.selectedScene = null;

// idle razer chroma color set by deck select
CONFIG.razerChromaIdleColor = null;

CONFIG.getGlobalScaleForResolution = function (resolution, width, height) {
  let globalScale = 1.0;

  if (resolution !== CONFIG.RESOLUTION_PIXEL_PERFECT) {
    globalScale = Math.min(width / CONFIG.REF_WINDOW_SIZE.width, height / CONFIG.REF_WINDOW_SIZE.height);

    // ensure scale is in multiples of CONFIG.GLOBAL_SCALE_MULTIPLE
    globalScale = Math.round((globalScale) * 100) / 100;
    const globalScaleMult = globalScale % CONFIG.GLOBAL_SCALE_MULTIPLE;
    globalScale -= globalScaleMult;

    if (resolution === CONFIG.RESOLUTION_AUTO) {
      const globalScaleDiff = globalScaleMult - CONFIG.GLOBAL_SCALE_SPACING;
      if (globalScale > 1.0 && globalScaleDiff < 0) {
        globalScale -= CONFIG.GLOBAL_SCALE_MULTIPLE;
      }
    }
  }

  return globalScale;
};

// called to reset config values that may rely on user profiles/preferences
CONFIG.reset = function () {
  // amount of bloom
  // set dynamically by user profile
  CONFIG.bloom = CONFIG.BLOOM_DEFAULT;

  // whether unit stats are always visible
  // set dynamically by user profile
  CONFIG.alwaysShowStats = true;

  // whether battlelog is enabled
  // set dynamically by user profile
  CONFIG.showBattleLog = true;

  // whether sticky targeting of units is enabled
  // set dynamically by user profile
  CONFIG.stickyTargeting = false;

  // whether tips are shown in game
  // set dynamically by user profile
  CONFIG.showInGameTips = true;

  // quality of lighting in game
  // set dynamically by user profile
  CONFIG.lightingQuality = CONFIG.LIGHTING_QUALITY_HIGH;

  // quality of shadows in game
  // set dynamically by user profile
  CONFIG.shadowQuality = CONFIG.SHADOW_QUALITY_HIGH;

  // quality of board in game
  // set dynamically by user profile
  CONFIG.boardQuality = CONFIG.BOARD_QUALITY_HIGH;

  // speed of game for things such as action delays, unit movement, etc, where higher is faster
  // set dynamically by user profile
  CONFIG.gameSpeed = 0.0;

  // last game data
  CONFIG.resetLastGameData();

  // last selected deck data
  CONFIG.resetLastSelectedDeckData();

  // razer chroma integration
  CONFIG.razerChromaEnabled = false;
};
CONFIG.resetLastGameData = function () {
  // global animation speed modifier used by replay playback
  CONFIG.replayActionSpeedModifier = 1.0;

  // whether to cull deadtime in replays
  CONFIG.replaysCullDeadtime = true;

  // record of important last game properties
  CONFIG.lastGameType = null;
  CONFIG.lastGameWasSpectate = false;
  CONFIG.lastGameWasTutorial = false;
  CONFIG.lastGameWasDeveloper = false;
  CONFIG.lastGameWasDailyChallenge = false;
};
CONFIG.resetLastSelectedDeckData = function () {
  CONFIG.lastSelectedDeckId = null;
  CONFIG.lastSelectedSandboxPlayer1DeckId = null;
  CONFIG.lastSelectedSandboxPlayer2DeckId = null;
};

CONFIG.reset();

module.exports = CONFIG;
