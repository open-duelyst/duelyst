'use strict';

var CONFIG = require('app/common/config');
var RSX = require('app/data/resources');
var ProgressionManager = require('app/ui/managers/progression_manager');
var InventoryManager = require('app/ui/managers/inventory_manager');
var Handlebars = require('hbsfy/runtime');
var markdown = require('markdown').markdown;
var moment = require('moment');
var SDK = require('app/sdk');
var _ = require('underscore');
var i18next = require('i18next');

Handlebars.registerHelper('localize', function (opts) {
  var key = opts;
  if (opts.hash) {
    key = opts.hash.key;
  }
  return i18next.t(key, opts.hash);
});

Handlebars.registerHelper('localizedMonth', function (item) {
  var localizedMonthKey = 'common.month_';
  if (item)
    localizedMonthKey += moment.utc(item).month();
  else
    localizedMonthKey += moment.utc().month();

  return i18next.t(localizedMonthKey);
});

Handlebars.registerHelper('localizedShopKey', function (opts) {
  var key = opts;
  if (opts.hash) {
    key = opts.hash.key;
  }
  return i18next.t('shop.' + key, opts.hash);
});

// Handlebars.registerHelper('longCardDescription',function(desc) {
//  if (desc == null)
//    return false;
//  return desc.length > 120;
// });

Handlebars.registerHelper('imageForResourceName', function (resourceName) {
  if (!_.isString(resourceName)) {
    return '';
  } else {
    var resource = RSX[resourceName];
    return (resource && resource.img) || '';
  }
});

Handlebars.registerHelper('imageForResourceScale', function (path) {
  if (!_.isString(path)) {
    return '';
  } else {
    return RSX.getResourcePathForScale(path, CONFIG.resourceScaleCSS);
  }
});

Handlebars.registerHelper('list', function (items, options) {
  var out = '';
  if (items) {
    for (var i = 0, l = items.length; i < l; i++) {
      out += options.fn(items[i]);
    }
  }
  return out;
});

Handlebars.registerHelper('concat', function () {
  var arg = Array.prototype.slice.call(arguments, 0);
  arg.pop();
  return arg.join('');
});

Handlebars.registerHelper('capitalize', function (item) {
  return item.toUpperCase();
});

Handlebars.registerHelper('downcase', function (item) {
  return item.toLowerCase();
});

Handlebars.registerHelper('statOrDash', function (item) {
  return item != null ? item : '-';
});

// http://momentjs.com/
// moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
// usage: {{dateFormat creation_date format="MMMM YYYY"}}
Handlebars.registerHelper('dateFormat', function (context, block) {
  if (moment) {
    var f = block.hash.format || 'MMM DD, YYYY hh:mm:ss A';
    return moment(context).format(f); // had to remove Date(context)
  } else {
    return context; // moment plugin not available. return data as is.
  }
});

Handlebars.registerHelper('timeAgo', function (context) {
  if (moment)
    return moment(context).fromNow();
  else
    return context; // moment plugin not available. return data as is.
});

Handlebars.registerHelper('ifUTCDayPassedSince', function (valueIn, options) {
  if (moment) {
    var now_utc = moment().utc().valueOf(); // use moment.js (via Bower)
    var daysPassed = (now_utc - valueIn) / 1000 / 60 / 60 / 24;
    if (!valueIn || daysPassed >= 1) {
      return options.fn(this);
    }
    return options.inverse(this);
  } else {
    return options.inverse(this); // moment plugin not available. return data as is.
  }
});

Handlebars.registerHelper('times', function (n, block) {
  var accum = '';
  for (var i = 0; i < n; ++i)
    accum += block.fn(i);
  return accum;
});

Handlebars.registerHelper('fromTo', function (n1, n2, block) {
  var accum = '';
  for (var i = n1; i < n2; ++i)
    accum += block.fn(i);
  return accum;
});

// Handlebars.registerHelper('monthName',function(item) {
//  if (item)
//    return moment.utc(item).format('MMMM')
//  else
//    return moment().format('MMMM')
// });

Handlebars.registerHelper('compare', function (lvalue, operator, rvalue, options) {
  var operators; var result;

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
    typeof: function (l, r) { return typeof l == r; },
  };

  if (!operators[operator]) {
    throw new Error('Handlerbars Helper \'compare\' doesn\'t know the operator ' + operator);
  }

  result = operators[operator](lvalue, rvalue);

  if (result) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('math', function (lvalue, operator, rvalue, options) {
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
Handlebars.registerHelper('key_value', function (obj, hash) {
  var buffer = '';
  var key;

  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      buffer += hash.fn({ key: key, value: obj[key] });
    }
  }

  return buffer;
});

Handlebars.registerHelper('markdown', function (markdownContent) {
  return markdown.toHTML(markdownContent);
});

Handlebars.registerHelper('profilePortraitImgForId', function (portraitId) {
  return SDK.CosmeticsFactory.profileIconForIdentifier(portraitId).img;
});

Handlebars.registerHelper('cardBackImgForId', function (cardBackId) {
  return SDK.CosmeticsFactory.cardBackForIdentifier(cardBackId).img;
});

Handlebars.registerHelper('divisionClassNameForRank', function (rank) {
  return SDK.RankFactory.rankedDivisionAssetNameForRank(rank);
});

Handlebars.registerHelper('divisionNameForRank', function (rank) {
  var assetName = SDK.RankFactory.rankedDivisionNameForRank(rank);
  return assetName;
});

Handlebars.registerHelper('generalPortraitHexImageForGeneralId', function (generalId) {
  var generalCard = SDK.GameSession.getCardCaches().getCardById(generalId);
  if (generalCard != null) {
    var portraitHexResource = generalCard.getPortraitHexResource();
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

Handlebars.registerHelper('classForColorCode', function (colorCode) {
  var colorCodeData = CONFIG.COLOR_CODES[colorCode];
  if (colorCodeData == null) {
    colorCodeData = CONFIG.COLOR_CODES[0];
  }
  return colorCodeData.cssClass;
});

Handlebars.registerHelper('ifNotNull', function (n, block) {
  if (_.isNull(n) || _.isUndefined(n) || _.isNaN(n))
    return block.inverse(this);
  else
    return block.fn(this);
});

Handlebars.registerHelper('formatGold', function (value) {
  return '$<strong>' + value + '</strong> ' + i18next.t('common.currency_gold');
});

Handlebars.registerHelper('formatCurrency', function (value) {
  return '$<strong>' + (value / 100).toFixed(2) + '</strong> USD';
});

Handlebars.registerHelper('formatPremiumCurrency', function (value) {
  return '<strong>' + value + '</strong> ' + i18next.t('common.currency_premium_plural');
});

Handlebars.registerHelper('rarityNameForId', function (value) {
  return SDK.RarityFactory.rarityForIdentifier(value).name;
});

Handlebars.registerHelper('rarityHexColorForId', function (value) {
  return SDK.RarityFactory.rarityForIdentifier(value).hex;
});

Handlebars.registerHelper('replace', function (value, subStr, newSubStr) {
  return value.replace(subStr, newSubStr);
});
