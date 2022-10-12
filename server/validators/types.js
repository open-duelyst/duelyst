const t = require('tcomb');
const validator = require('validator');
const RankDivisionLookup = require('../../app/sdk/rank/rankDivisionLookup.coffee');
const ShopData = require('../../app/data/shop.json');
const CosmeticsFactory = require('../../app/sdk/cosmetics/cosmeticsFactory.coffee');

const Password = t.subtype(t.Str, (s) => s.length >= 6, 'Password');
const NewPassword = t.subtype(t.Str, (s) => s.length >= 8, 'New Password');
const UserId = t.subtype(t.Str, (s) => s.length === 20 && s.match(/^[A-Za-z0-9\-\_]+$/) !== null, 'UserId');

const Username = t.subtype(t.Str, (s) => {
  if (!validator.isAlphanumeric(s)) {
    return false;
  }
  return s.length >= 3 && s.length <= 18;
}, 'Username');

const ReferralCode = t.subtype(
  t.Str,
  (s) => s.length >= 4 && s.length <= 16,
  'ReferralCode',
);

const UUID = t.subtype(t.Str, (s) => validator.isUUID(s, 4), 'UUID');
const GiftCode = t.subtype(t.Str, (s) => s.length >= 3, 'Gift Code');

const SeasonKey = t.subtype(
  t.Str,
  (s) => validator.matches(s, /^[0-9]{4}\-[0-9]{2}/i),
  'Season Key',
);

const Card = t.struct({
  id: t.Number,
}, 'Card');

const CampaignData = t.struct({
  campaign_id: t.maybe(t.String),
  campaign_name: t.maybe(t.String),
  campaign_source: t.maybe(t.String),
  campaign_medium: t.maybe(t.String),
  campaign_content: t.maybe(t.String),
  campaign_term: t.maybe(t.String),
  referrer: t.maybe(t.String),
}, 'CampaignData');

const Deck = t.list(Card, 'Deck');

const CurrencyType = t.subtype(
  t.Str,
  (s) => s === 'hard' || s === 'soft',
  'Currency Type',
);

const ProductSku = t.subtype(
  t.Str,
  (s) => (
    ShopData.packs[s] !== undefined
      || ShopData.earned_specials[s] !== undefined
      || ShopData.gauntlet[s] !== undefined
      || ShopData.bundles[s] !== undefined
      || ShopData.loot_chest_keys[s] !== undefined
      || ShopData.rift[s] !== undefined
      || ShopData.promos[s] !== undefined
      || CosmeticsFactory.cosmeticProductAttrsForSKU(s) != null
  ),
  'Product SKU',
);

const DivisionName = t.subtype(
  t.Str,
  (s) => {
    const divisionKey = s.charAt(0).toUpperCase() + s.slice(1);
    return RankDivisionLookup[divisionKey] >= 0;
  },
  'Division Name',
);

const GameCenterAuth = t.struct({
  publicKeyUrl: t.String,
  timestamp: t.Number,
  signature: t.String,
  salt: t.String,
  playerId: t.String,
}, 'Game Center Authentication');

module.exports = {
  UserId,
  Password,
  NewPassword,
  Username,
  ReferralCode,
  UUID,
  GiftCode,
  SeasonKey,
  Card,
  Deck,
  CurrencyType,
  ProductSku,
  DivisionName,
  CampaignData,
  GameCenterAuth,
};
