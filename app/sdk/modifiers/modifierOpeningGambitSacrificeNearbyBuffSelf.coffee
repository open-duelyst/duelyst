ModifierOpeningGambit =       require './modifierOpeningGambit'
KillAction =     require 'app/sdk/actions/killAction'
CardType =                 require 'app/sdk/cards/cardType'
Modifier =                 require './modifier'
Stringifiers =             require 'app/sdk/helpers/stringifiers'
Modifier =                require './modifier'

class ModifierOpeningGambitSacrificeNearbyBuffSelf extends ModifierOpeningGambit

  type: "ModifierOpeningGambitSacrificeNearbyBuffSelf"
  @type: "ModifierOpeningGambitSacrificeNearbyBuffSelf"

  @modifierName: "Opening Gambit"
  @description: "Destroy friendly minions around it and gain %X for each minion"

  targetEnemies: false
  targetAllies: true
  fxResource: ["FX.Modifiers.ModifierOpeningGambit", "FX.Modifiers.ModifierGenericDamageNearbyShadow"]

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.numSacrificed = 0

    return p

  @createContextObject: (attackBuff = 0, maxHPBuff = 0, options = undefined) ->
    contextObject = super(options)
    statBuffContextObject = Modifier.createContextObjectWithAttributeBuffs(attackBuff,maxHPBuff)
    statBuffContextObject.appliedName = "Consumed Strength"
    contextObject.modifiersContextObjects = [statBuffContextObject]
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      subContextObject = modifierContextObject.modifiersContextObjects[0]
      return @description.replace /%X/, Stringifiers.stringifyAttackHealthBuff(subContextObject.attributeBuffs.atk,subContextObject.attributeBuffs.maxHP)
    else
      return @description

  applyManagedModifiersFromModifiersContextObjects: (modifiersContextObjects, card) ->
    # apply once per sacrifice
    for i in [0...@_private.numSacrificed]
      super(modifiersContextObjects, card)

  onOpeningGambit: () ->
    super()

    entities = @getGameSession().getBoard().getFriendlyEntitiesAroundEntity(@getCard(), CardType.Unit, 1)
    for entity in entities
      # don't kill general
      if !entity.getIsGeneral()
        damageAction = new KillAction(@getGameSession())
        damageAction.setOwnerId(@getCard().getOwnerId())
        damageAction.setSource(@getCard())
        damageAction.setTarget(entity)
        @getGameSession().executeAction(damageAction)
        @_private.numSacrificed++

    @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

module.exports = ModifierOpeningGambitSacrificeNearbyBuffSelf
