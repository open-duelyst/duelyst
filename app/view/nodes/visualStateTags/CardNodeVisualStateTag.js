const Logger = require('app/common/logger');
const UtilsJavascript = require('app/common/utils/utils_javascript');

/** **************************************************************************
 CardNodeVisualStateTag
 *************************************************************************** */

/* region Resource Names */

const CardNodeVisualResources = {};

CardNodeVisualResources.glowResource = 'GlowResource';
// CardNodeVisualResources.highlightResource = "HighlightResource";

/* endregion Resource Names */

const CardNodeVisualStateTag = {};

CardNodeVisualStateTag.showGlowForPlayerTagType = 'ShowGlowForPlayerTag';
CardNodeVisualStateTag.createShowGlowForPlayerTag = function (showGlowForPlayer, priority) {
  return {
    neededResources: [CardNodeVisualResources.glowResource],
    tagType: CardNodeVisualStateTag.showGlowForPlayerTagType,
    showGlowForPlayer: UtilsJavascript.defaultToValue(showGlowForPlayer, true),
    priority: UtilsJavascript.defaultToValue(priority, 0),
  };
};

CardNodeVisualStateTag.showGlowForOpponentTagType = 'ShowGlowForOpponentTag';
CardNodeVisualStateTag.createShowGlowForOpponentTag = function (showGlowForOpponent, priority) {
  return {
    neededResources: [CardNodeVisualResources.glowResource],
    tagType: CardNodeVisualStateTag.showGlowForOpponentTagType,
    showGlowForOpponent: UtilsJavascript.defaultToValue(showGlowForOpponent, true),
    priority: UtilsJavascript.defaultToValue(priority, 0),
  };
};

CardNodeVisualStateTag.showGlowForNeutralTagType = 'ShowGlowForNeutralTag';
CardNodeVisualStateTag.createShowGlowForNeutralTag = function (showGlowForNeutral, priority) {
  return {
    neededResources: [CardNodeVisualResources.glowResource],
    tagType: CardNodeVisualStateTag.showGlowForNeutralTagType,
    showGlowForNeutral: UtilsJavascript.defaultToValue(showGlowForNeutral, true),
    priority: UtilsJavascript.defaultToValue(priority, 0),
  };
};

// Unused for now
// CardNodeVisualStateTag.showHighlightTagType = "ShowHighlightTag";
// CardNodeVisualStateTag.createHighlightTag = function(showHighlight, priority, color, frequency, minAlpha, maxAlpha) {
//  return {
//    neededResources: [EntityNodeVisualResources.highlightResource],
//    tagType: CardNodeVisualStateTag.showHighlightTagType,
//    showHighlight: UtilsJavascript.defaultToValue(showHighlight, true),
//    priority: UtilsJavascript.defaultToValue(priority, 0),
//    color: color,
//    frequency: frequency,
//    minAlpha: minAlpha,
//    maxAlpha: maxAlpha
//  }
// };

module.exports = CardNodeVisualStateTag;
