ModifierEnemyMinionAttackWatch = require 'app/sdk/modifiers/modifierEnemyMinionAttackWatch'
ModifierFrenzy = require 'app/sdk/modifiers/modifierFrenzy'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'
ModifierTranscendance = require 'app/sdk/modifiers/modifierTranscendance'
ModifierProvoke = require 'app/sdk/modifiers/modifierProvoke'
ModifierRanged = require 'app/sdk/modifiers/modifierRanged'
ModifierForcefield = require 'app/sdk/modifiers/modifierForcefield'

class ModifierEnemyMinionAttackWatchGainKeyword extends ModifierEnemyMinionAttackWatch

  type:"ModifierEnemyMinionAttackWatchGainKeyword"
  @type:"ModifierEnemyMinionAttackWatchGainKeyword"

  @modifierName:"ModifierEnemyMinionAttackWatchGainKeyword"
  @description:"Whenever an enemy minion attacks, this minion gains a random keyword"

  fxResource: ["FX.Modifiers.ModifierEnemyMinionAttackWatch", "FX.Modifiers.ModifierGenericBuff"]

  allModifierContextObjects =[]

  @createContextObject: () ->
    contextObject = super()
    contextObject.allModifierContextObjects = [
      ModifierFrenzy.createContextObject(),
      ModifierFlying.createContextObject(),
      ModifierTranscendance.createContextObject(),
      ModifierProvoke.createContextObject(),
      ModifierRanged.createContextObject(),
      ModifierForcefield.createContextObject()
    ]
    return contextObject

  onEnemyMinionAttackWatch: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative() and @allModifierContextObjects.length > 0
      # pick one modifier from the remaining list and splice it out of the set of choices
      modifierContextObject = @allModifierContextObjects.splice(@getGameSession().getRandomIntegerForExecution(@allModifierContextObjects.length), 1)[0]
      @getGameSession().applyModifierContextObject(modifierContextObject, @getCard())
    

module.exports = ModifierEnemyMinionAttackWatchGainKeyword
