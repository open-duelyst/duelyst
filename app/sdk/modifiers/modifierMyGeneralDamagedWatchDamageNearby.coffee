CONFIG = require 'app/common/config'
ModifierMyGeneralDamagedWatch = require './modifierMyGeneralDamagedWatch'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierMyGeneralDamagedWatchDamageNearby extends ModifierMyGeneralDamagedWatch

  type:"ModifierMyGeneralDamagedWatchDamageNearby"
  @type:"ModifierMyGeneralDamagedWatchDamageNearby"

  @modifierName:"My General Damage Watch Damage Nearby"
  @description: "Whenever your General takes damage, deal %X damage to %Y"

  damageAmount: 0
  includeAllies: false

  fxResource: ["FX.Modifiers.ModifierMyGeneralDamagedWatch", "FX.Modifiers.ModifierGenericDamageNearby"]

  @createContextObject: (damageAmount, includeAllies=false, options) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    contextObject.includeAllies = includeAllies
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      replaceText = @description.replace /%X/, modifierContextObject.damageAmount
      if modifierContextObject.includeAllies
        replaceText = replaceText.replace /%Y/, "a random nearby minion"
      else
        replaceText = replaceText.replace /%Y/, "a random nearby enemy minion"
      return replaceText
    else
      return @description

  onDamageDealtToGeneral: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      if @includeAllies
        entities = @getGameSession().getBoard().getEntitiesAroundEntity(@getCard(), CardType.Unit, 1)
      else
        entities = @getGameSession().getBoard().getEnemyEntitiesAroundEntity(@getCard(), CardType.Unit, 1)

      # don't damage the Generals with this counter-attack
      validEntities = []
      for entity in entities
        if !entity.getIsGeneral()
          validEntities.push(entity)

      if validEntities.length > 0
        unitToDamage = validEntities[@getGameSession().getRandomIntegerForExecution(validEntities.length)]
        damageAction = new DamageAction(@getGameSession())
        damageAction.setOwnerId(@getCard().getOwnerId())
        damageAction.setSource(@getCard())
        damageAction.setTarget(unitToDamage)
        damageAction.setDamageAmount(@damageAmount)
        @getGameSession().executeAction(damageAction)

module.exports = ModifierMyGeneralDamagedWatchDamageNearby
