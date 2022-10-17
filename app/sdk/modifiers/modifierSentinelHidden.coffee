ModifierOverwatchHidden = require './modifierOverwatchHidden'

###
  Generic modifier used to hide the true sentinel modifier from an opponent.
###
class ModifierSentinelHidden extends ModifierOverwatchHidden

  type:"ModifierSentinelHidden"
  @type:"ModifierSentinelHidden"

  @isKeyworded: true
  @keywordDefinition:"Hidden condition is one of: the opponent summons a minion, casts a spell, or attacks with General."

  @modifierName:"Sentinel"
  @description: "%X"

module.exports = ModifierSentinelHidden
