const t = require('tcomb');
const types = require('./types');

const token = t.struct({
  id: types.UserId,
  username: t.maybe(types.Username),
});

const loginInput = t.struct({
  password: types.Password,
  username: t.maybe(types.Username),
});

const loginGooglePlayInput = t.struct({
  google_play_id: t.Str,
  google_auth_token: t.Str,
});

const loginGameCenterInput = t.struct({
  identity: types.GameCenterAuth,
});

const signupInput = t.struct({
  password: types.NewPassword,
  username: types.Username,
  keycode: t.maybe(t.Str),
  referral_code: t.maybe(types.ReferralCode),
  friend_referral_code: t.maybe(types.Username),
  campaign_data: t.maybe(types.CampaignData),
  captcha: t.maybe(t.Str),
  is_desktop: t.maybe(t.Bool),
});

const signupGooglePlayInput = t.struct({
  username: types.Username,
  google_play_id: t.Str,
  google_auth_token: t.Str,
  keycode: t.maybe(t.Str),
  referral_code: t.maybe(types.ReferralCode),
  friend_referral_code: t.maybe(types.Username),
  campaign_data: t.maybe(types.CampaignData),
  captcha: t.maybe(t.Str),
});

const signupGameCenterInput = t.struct({
  identity: types.GameCenterAuth,
  username: types.Username,
  keycode: t.maybe(t.Str),
  referral_code: t.maybe(types.ReferralCode),
  friend_referral_code: t.maybe(types.Username),
  campaign_data: t.maybe(types.CampaignData),
  captcha: t.maybe(t.Str),
});

const signupKeychainInput = t.struct({
  username: types.Username,
  keycode: t.maybe(t.Str),
  referral_code: t.maybe(types.ReferralCode),
  friend_referral_code: t.maybe(types.Username),
  campaign_data: t.maybe(types.CampaignData),
  captcha: t.maybe(t.Str),
});

const changePasswordInput = t.struct({
  current_password: types.Password,
  new_password: types.NewPassword,
});

const matchmakingInput = t.struct({
  inviteId: t.maybe(t.Str),
  name: t.Str,
  deck: types.Deck,
  factionId: t.Number,
  gameType: t.Str,
  cardBackId: t.maybe(t.Num),
  battleMapId: t.maybe(t.Num),
  ticketId: t.maybe(t.Str),
  hasPremiumBattleMaps: t.maybe(t.Bool),
});

const singlePlayerInput = t.struct({
  deck: types.Deck,
  cardBackId: t.maybe(t.Num),
  battleMapId: t.maybe(t.Num),
  hasPremiumBattleMaps: t.maybe(t.Bool),
  ai_general_id: t.Number,
  ai_difficulty: t.maybe(t.Number),
  ai_num_random_cards: t.maybe(t.Number),
  ai_username: t.maybe(t.Str),
});

const bossBattleInput = t.struct({
  deck: types.Deck,
  cardBackId: t.maybe(t.Num),
  battleMapId: t.maybe(t.Num),
  ai_general_id: t.Number,
  ai_username: t.maybe(t.Str),
});

const reportPlayerInput = t.struct({
  user_id: t.subtype(t.Str, (s) => s.length >= 1 && s.length <= 100),
  message: t.subtype(t.Str, (s) => s.length >= 1 && s.length <= 1000),
});

const deckInput = t.struct({
  name: t.Str,
  cards: types.Deck,
  faction_id: t.Number,
  spell_count: t.Number,
  minion_count: t.Number,
  artifact_count: t.Number,
  color_code: t.Number,
  card_back_id: t.maybe(t.Number),
});

const purchaseInput = t.struct({
  card_token: t.maybe(t.Str),
  product_sku: t.maybe(types.ProductSku),
});

const premiumPurchaseInput = t.struct({
  card_token: t.maybe(t.Str),
  product_sku: t.maybe(types.ProductSku),
  sale_id: t.maybe(t.Str),
});

module.exports = {
  token,
  loginInput,
  loginGooglePlayInput,
  loginGameCenterInput,
  signupInput,
  signupGooglePlayInput,
  signupGameCenterInput,
  signupKeychainInput,
  changePasswordInput,
  matchmakingInput,
  singlePlayerInput,
  bossBattleInput,
  reportPlayerInput,
  deckInput,
  purchaseInput,
  premiumPurchaseInput,
};
