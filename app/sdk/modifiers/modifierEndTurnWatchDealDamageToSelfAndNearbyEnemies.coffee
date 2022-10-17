ModifierEndTurnWatch = require './modifierEndTurnWatch'
CardType = require 'app/sdk/cards/cardType'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierEndTurnWatchDealDamageToSelfAndNearbyEnemies extends ModifierEndTurnWatch

  type:"ModifierEndTurnWatchDealDamageToSelfAndNearbyEnemies"
  @type:"ModifierEndTurnWatchDealDamageToSelfAndNearbyEnemies"

  @modifierName:"End Watch"
  @description:"At the end of your turn, deal %X damage to self and all nearby enemies"

  damageAmount: 1

  fxResource: ["FX.Modifiers.ModifierEndTurnWatch", "FX.Modifiers.ModifierExplosionsNearby"]

  @createContextObject: (damageAmount=1, damageGenerals=true, damageAmountDelta=2, options) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    contextObject.damageGenerals = damageGenerals
    contextObject.damageAmountDelta = damageAmountDelta
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      replaceText = @description.replace /%X/, modifierContextObject.damageAmount
      if modifierContextObject.damageGenerals
        replaceText = replaceText.replace /%Y/, "nearby enemies"
      else
        replaceText = replaceText.replace /%Y/, "nearby enemy minions"
      return replaceText
    else
      return @description

  onTurnWatch: (action) ->
    entities = @getGameSession().getBoard().getEnemyEntitiesAroundEntity(@getCard(), CardType.Unit, 1)
    for entity in entities
      # don't damage enemy General unless specifically allowed, but do damage enemy units
      if @damageGenerals or (!@damageGenerals and !entity.getIsGeneral())
        damageAction = new DamageAction(@getGameSession())
        damageAction.setOwnerId(@getCard().getOwnerId())
        damageAction.setSource(@getCard())
        damageAction.setTarget(entity)
        damageAction.setDamageAmount(@_private.currentDamageAmount)
        @getGameSession().executeAction(damageAction)

    #damage self too
    damageAction = new DamageAction(@getGameSession())
    damageAction.setOwnerId(@getCard().getOwnerId())
    damageAction.setSource(@getCard())
    damageAction.setTarget(@getCard())
    damageAction.setDamageAmount(@_private.currentDamageAmount)
    @getGameSession().executeAction(damageAction)

    #increment the damage amount
    @_private.currentDamageAmount *= @damageAmountDelta
    description1 = "At the end of #{if @getCard().getIsGeneral() then @getCard().getName() + "'s" else "your"} turn, deal "
    description2 = " damage to self and all nearby enemies."
    updatedDamage = @_private.currentDamageAmount
    descriptionFinal = description1.concat updatedDamage
    descriptionFinal = descriptionFinal.concat description2

    @contextObject.description = descriptionFinal
    @_private.cachedDescription = descriptionFinal
    @getCard().flushCachedDescription()



  onActivate: () ->
    super()
    @_private.currentDamageAmount = @damageAmount

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)
    p.currentDamageAmount = @damageAmount

    return p

module.exports = ModifierEndTurnWatchDealDamageToSelfAndNearbyEnemies
