const Logger = require('app/common/logger');
const UtilsJavascript = require('app/common/utils/utils_javascript');

/** **************************************************************************
 EntityNodeVisualStateTag
 *************************************************************************** */

/* region Resource Names */

const EntityNodeVisualResources = {};

EntityNodeVisualResources.glowResource = 'GlowResource';
EntityNodeVisualResources.highlightResource = 'HighlightResource';
EntityNodeVisualResources.shaderResource = 'ShaderResource';

/* endregion Resource Names */

const EntityNodeVisualStateTag = {};

// TODO: consider adding typePriority for conflicting tags of equal priority when collapsing

EntityNodeVisualStateTag.showTargetableTagType = 'ShowTargetable';
EntityNodeVisualStateTag.createShowTargetableTag = function (showTargetable, priority) {
  return {
    neededResources: [EntityNodeVisualResources.glowResource],
    priority: UtilsJavascript.defaultToValue(priority, 0),
    showTargetable: UtilsJavascript.defaultToValue(showTargetable, true),
    tagType: EntityNodeVisualStateTag.showTargetableTagType,
  };
};

EntityNodeVisualStateTag.showDeemphasisTagType = 'ShowDeemphasis';
EntityNodeVisualStateTag.createShowDeemphasisTag = function (showDeemphasis, priority) {
  return {
    neededResources: [EntityNodeVisualResources.shaderResource],
    tagType: EntityNodeVisualStateTag.showDeemphasisTagType,
    showDeemphasis: UtilsJavascript.defaultToValue(showDeemphasis, true),
    priority: UtilsJavascript.defaultToValue(priority, 0),
  };
};

EntityNodeVisualStateTag.showDissolveTagType = 'ShowDissolve';
EntityNodeVisualStateTag.createShowDissolveTag = function (showDissolve, priority) {
  return {
    neededResources: [EntityNodeVisualResources.shaderResource],
    tagType: EntityNodeVisualStateTag.showDissolveTagType,
    showDissolve: UtilsJavascript.defaultToValue(showDissolve, true),
    priority: UtilsJavascript.defaultToValue(priority, 0),
  };
};

EntityNodeVisualStateTag.showReadinessForPlayerTagType = 'ShowReadinessForPlayer';
EntityNodeVisualStateTag.createShowReadinessForPlayerTag = function (showReadinessForPlayer, priority) {
  return {
    neededResources: [EntityNodeVisualResources.highlightResource],
    tagType: EntityNodeVisualStateTag.showReadinessForPlayerTagType,
    showReadinessForPlayer: UtilsJavascript.defaultToValue(showReadinessForPlayer, true),
    priority: UtilsJavascript.defaultToValue(priority, 0),
  };
};

EntityNodeVisualStateTag.showReadinessForOpponentTagType = 'ShowReadinessForOpponent';
EntityNodeVisualStateTag.createShowReadinessForOpponentTag = function (showReadinessForOpponent, priority) {
  return {
    neededResources: [EntityNodeVisualResources.highlightResource],
    tagType: EntityNodeVisualStateTag.showReadinessForOpponentTagType,
    showReadinessForOpponent: UtilsJavascript.defaultToValue(showReadinessForOpponent, true),
    priority: UtilsJavascript.defaultToValue(priority, 0),
  };
};

EntityNodeVisualStateTag.showHoverForPlayerTagType = 'ShowHoverForPlayerTag';
EntityNodeVisualStateTag.createShowHoverForPlayerTag = function (showHoverForPlayer, priority) {
  return {
    neededResources: [EntityNodeVisualResources.glowResource, EntityNodeVisualResources.highlightResource],
    tagType: EntityNodeVisualStateTag.showHoverForPlayerTagType,
    showHoverForPlayer: UtilsJavascript.defaultToValue(showHoverForPlayer, true),
    priority: UtilsJavascript.defaultToValue(priority, 2),
  };
};

EntityNodeVisualStateTag.showHoverForOpponentTagType = 'ShowHoverForOpponentTag';
EntityNodeVisualStateTag.createShowHoverForOpponentTag = function (showHoverForOpponent, priority) {
  return {
    neededResources: [EntityNodeVisualResources.glowResource, EntityNodeVisualResources.highlightResource],
    tagType: EntityNodeVisualStateTag.showHoverForOpponentTagType,
    showHoverForOpponent: UtilsJavascript.defaultToValue(showHoverForOpponent, true),
    priority: UtilsJavascript.defaultToValue(priority, 1),
  };
};

EntityNodeVisualStateTag.showGlowForPlayerTagType = 'ShowGlowForPlayerTag';
EntityNodeVisualStateTag.createShowGlowForPlayerTag = function (showGlowForPlayer, priority) {
  return {
    neededResources: [EntityNodeVisualResources.glowResource],
    tagType: EntityNodeVisualStateTag.showGlowForPlayerTagType,
    showGlowForPlayer: UtilsJavascript.defaultToValue(showGlowForPlayer, true),
    priority: UtilsJavascript.defaultToValue(priority, 0),
  };
};

EntityNodeVisualStateTag.showGlowForOpponentTagType = 'ShowGlowForOpponentTag';
EntityNodeVisualStateTag.createShowGlowForOpponentTag = function (showGlowForOpponent, priority) {
  return {
    neededResources: [EntityNodeVisualResources.glowResource],
    tagType: EntityNodeVisualStateTag.showGlowForOpponentTagType,
    showGlowForOpponent: UtilsJavascript.defaultToValue(showGlowForOpponent, true),
    priority: UtilsJavascript.defaultToValue(priority, 0),
  };
};

EntityNodeVisualStateTag.showInstructionalGlowTagType = 'ShowInstructionalGlowTag';
EntityNodeVisualStateTag.createShowInstructionalGlowTag = function (showGlowForInstructional, priority) {
  return {
    neededResources: [EntityNodeVisualResources.glowResource],
    tagType: EntityNodeVisualStateTag.showInstructionalGlowTagType,
    showGlowForInstructional: UtilsJavascript.defaultToValue(showGlowForInstructional, true),
    priority: UtilsJavascript.defaultToValue(priority, 0),
  };
};

EntityNodeVisualStateTag.showHighlightTagType = 'ShowHighlightTag';
EntityNodeVisualStateTag.createHighlightTag = function (showHighlight, priority, color, frequency, minAlpha, maxAlpha) {
  return {
    neededResources: [EntityNodeVisualResources.highlightResource],
    tagType: EntityNodeVisualStateTag.showHighlightTagType,
    showHighlight: UtilsJavascript.defaultToValue(showHighlight, true),
    priority: UtilsJavascript.defaultToValue(priority, 0),
    color,
    frequency,
    minAlpha,
    maxAlpha,
  };
};

module.exports = EntityNodeVisualStateTag;
