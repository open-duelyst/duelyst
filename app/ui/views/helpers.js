const CONFIG = require('app/common/config');
const RSX = require('app/data/resources');
const ProgressionManager = require('app/ui/managers/progression_manager');
const InventoryManager = require('app/ui/managers/inventory_manager');
const Handlebars = require('hbsfy/runtime');
const { markdown } = require('markdown');
const moment = require('moment');
const SDK = require('app/sdk');
const _ = require('underscore');
const i18next = require('i18next');

Handlebars.registerHelper('localize', (opts) => {
  let key = opts;
  if (opts.hash) {
    key = opts.hash.key;
  }
  return i18next.t(key, opts.hash);
});

Handlebars.registerHelper('localizedMonth', (item) => {
  let localizedMonthKey = 'common.month_';
  if (item) localizedMonthKey += moment.utc(item).month();
  else localizedMonthKey += moment.utc().month();

  return i18next.t(localizedMonthKey);
});

Handlebars.registerHelper('localizedShopKey', (opts) => {
  let key = opts;
  if (opts.hash) {
    key = opts.hash.key;
  }
  return i18next.t(`shop.${key}`, opts.hash);
});

// Handlebars.registerHelper('longCardDescription',function(desc) {
//  if (desc == null)
//    return false;
//  return desc.length > 120;
// });

Handlebars.registerHelper('imageForResourceName', (resourceName) => {
  if (!_.isString(resourceName)) {
    return '';
  }
  const resource = RSX[resourceName];
  return (resource && resource.img) || '';
});

Handlebars.registerHelper('imageForResourceScale', (path) => {
  if (!_.isString(path)) {
    return '';
  }
  return RSX.getResourcePathForScale(path, CONFIG.resourceScaleCSS);
});

Handlebars.registerHelper('list', (items, options) => {
  let out = '';
  if (items) {
    for (let i = 0, l = items.length; i < l; i++) {
      out += options.fn(items[i]);
    }
  }
  return out;
});

Handlebars.registerHelper('concat', function () {
  const arg = Array.prototype.slice.call(arguments, 0);
  arg.pop();
  return arg.join('');
});

Handlebars.registerHelper('capitalize', (item) => item.toUpperCase());

Handlebars.registerHelper('downcase', (item) => item.toLowerCase());

Handlebars.registerHelper('statOrDash', (item) => (item != null ? item : '-'));

// http://momentjs.com/
// moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
// usage: {{dateFormat creation_date format="MMMM YYYY"}}
Handlebars.registerHelper('dateFormat', (context, block) => {
  if (moment) {
    const f = block.hash.format || 'MMM DD, YYYY hh:mm:ss A';
    return moment(context).format(f); // had to remove Date(context)
  }
  return context; // moment plugin not available. return data as is.
});

Handlebars.registerHelper('timeAgo', (context) => {
  if (moment) return moment(context).fromNow();
  return context; // moment plugin not available. return data as is.
});

Handlebars.registerHelper('ifUTCDayPassedSince', function (valueIn, options) {
  if (moment) {
    const now_utc = moment().utc().valueOf(); // use moment.js (via Bower)
    const daysPassed = (now_utc - valueIn) / 1000 / 60 / 60 / 24;
    if (!valueIn || daysPassed >= 1) {
      return options.fn(this);
    }
    return options.inverse(this);
  }
  return options.inverse(this); // moment plugin not available. return data as is.
});

Handlebars.registerHelper('times', (n, block) => {
  let accum = '';
  for (let i = 0; i < n; ++i) accum += block.fn(i);
  return accum;
});

Handlebars.registerHelper('fromTo', (n1, n2, block) => {
  let accum = '';
  for (let i = n1; i < n2; ++i) accum += block.fn(i);
  return accum;
});

// Handlebars.registerHelper('monthName',function(item) {
//  if (item)
//    return moment.utc(item).format('MMMM')
//  else
//    return moment().format('MMMM')
// });

Handlebars.registerHelper('compare', function (lvalue, operator, rvalue, options) {
  let operators; let
    result;

  if (arguments.length < 3) {
    throw new Error('Handlerbars Helper \'compare\' needs 2 parameters');
  }

  if (options === undefined) {
    options = rvalue;
    rvalue = operator;
    operator = '===';
  }

  operators = {
    '==': function (l, r) { return l == r; },
    '===': function (l, r) { return l === r; },
    '!=': function (l, r) { return l != r; },
    '!==': function (l, r) { return l !== r; },
    '<': function (l, r) { return l < r; },
    '>': function (l, r) { return l > r; },
    '<=': function (l, r) { return l <= r; },
    '>=': function (l, r) { return l >= r; },
    '||': function (l, r) { return l || r; },
    '&&': function (l, r) { return l && r; },
    typeof(l, r) { return typeof l === r; },
  };

  if (!operators[operator]) {
    throw new Error(`Handlerbars Helper 'compare' doesn't know the operator ${operator}`);
  }

  result = operators[operator](lvalue, rvalue);

  if (result) {
    return options.fn(this);
  }
  return options.inverse(this);
});

Handlebars.registerHelper('math', (lvalue, operator, rvalue, options) => {
  lvalue = parseFloat(lvalue);
  rvalue = parseFloat(rvalue);

  return {
    '+': lvalue + rvalue,
    '-': lvalue - rvalue,
    '*': lvalue * rvalue,
    '/': lvalue / rvalue,
    '%': lvalue % rvalue,
  }[operator];
});

// HELPER: #key_value
//
// Usage: {{#key_value obj}} Key: {{key}} // Value: {{value}} {{/key_value}}
//
// Iterate over an object, setting 'key' and 'value' for each property in
// the object.
Handlebars.registerHelper('key_value', (obj, hash) => {
  let buffer = '';
  let key;

  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      buffer += hash.fn({ key, value: obj[key] });
    }
  }

  return buffer;
});

Handlebars.registerHelper('markdown', (markdownContent) => markdown.toHTML(markdownContent));

Handlebars.registerHelper('profilePortraitImgForId', (portraitId) => SDK.CosmeticsFactory.profileIconForIdentifier(portraitId).img);

Handlebars.registerHelper('cardBackImgForId', (cardBackId) => SDK.CosmeticsFactory.cardBackForIdentifier(cardBackId).img);

Handlebars.registerHelper('divisionClassNameForRank', (rank) => SDK.RankFactory.rankedDivisionAssetNameForRank(rank));

Handlebars.registerHelper('divisionNameForRank', (rank) => {
  const assetName = SDK.RankFactory.rankedDivisionNameForRank(rank);
  return assetName;
});

Handlebars.registerHelper('generalPortraitHexImageForGeneralId', (generalId) => {
  const generalCard = SDK.GameSession.getCardCaches().getCardById(generalId);
  if (generalCard != null) {
    const portraitHexResource = generalCard.getPortraitHexResource();
    return portraitHexResource && portraitHexResource.img;
  }
});

Handlebars.registerHelper('isFactionUnlockedOrCardsOwned', function (factionId, options) {
  if (ProgressionManager.getInstance().isFactionUnlockedOrCardsOwned(factionId)) {
    return options.fn(this);
  }
});

Handlebars.registerHelper('isFactionDisabledInCollection', function (factionId, options) {
  if (!ProgressionManager.getInstance().isFactionUnlockedOrCardsOwned(factionId)) {
    return options.fn(this);
  }
});

Handlebars.registerHelper('isFactionUnlocked', function (factionId, options) {
  if (ProgressionManager.getInstance().isFactionUnlocked(factionId)) {
    return options.fn(this);
  }
});

Handlebars.registerHelper('isFactionLocked', function (factionId, options) {
  if (!ProgressionManager.getInstance().isFactionUnlocked(factionId)) {
    return options.fn(this);
  }
});

Handlebars.registerHelper('classForColorCode', (colorCode) => {
  let colorCodeData = CONFIG.COLOR_CODES[colorCode];
  if (colorCodeData == null) {
    colorCodeData = CONFIG.COLOR_CODES[0];
  }
  return colorCodeData.cssClass;
});

Handlebars.registerHelper('ifNotNull', function (n, block) {
  if (_.isNull(n) || _.isUndefined(n) || _.isNaN(n)) return block.inverse(this);
  return block.fn(this);
});

Handlebars.registerHelper('formatCurrency', (value) => `$<strong>${(value / 100).toFixed(2)}</strong> USD`);

Handlebars.registerHelper('formatPremiumCurrency', (value) => `<strong>${value}</strong> ${i18next.t('common.currency_premium_plural')}`);

Handlebars.registerHelper('rarityNameForId', (value) => SDK.RarityFactory.rarityForIdentifier(value).name);

Handlebars.registerHelper('rarityHexColorForId', (value) => SDK.RarityFactory.rarityForIdentifier(value).hex);

Handlebars.registerHelper('replace', (value, subStr, newSubStr) => value.replace(subStr, newSubStr));
