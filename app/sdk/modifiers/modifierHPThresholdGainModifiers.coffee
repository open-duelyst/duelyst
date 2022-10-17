Modifier = require './modifier'
ModifierRanged = require 'app/sdk/modifiers/modifierRanged'
ModifierForcefield = require 'app/sdk/modifiers/modifierForcefield'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'
ModifierTranscendance = require 'app/sdk/modifiers/modifierTranscendance'
ModifierHPChange = require 'app/sdk/modifiers/modifierHPChange'

i18next = require 'i18next'

class ModifierHPThresholdGainModifiers extends ModifierHPChange

  type:"ModifierHPThresholdGainModifiers"
  @type:"ModifierHPThresholdGainModifiers"

  @modifierName:"Modifier HP Threshold Gain Modifiers"
  @description:i18next.t("modifiers.HP_threshold_gain_modifiers_def")

  fxResource: ["FX.Modifiers.ModifierBuffSelfOnReplace"]

  @createContextObject: (options) ->
    contextObject = super(options)

    rangedModifier = ModifierRanged.createContextObject()
    rangedModifier.isRemovable = false
    forcefieldModifier = ModifierForcefield.createContextObject()
    forcefieldModifier.isRemovable = false
    celerityModifier = ModifierTranscendance.createContextObject()
    celerityModifier.isRemovable = false
    flyingModifier = ModifierFlying.createContextObject()
    flyingModifier.isRemovable = false

    contextObject.listOfModifiersContextObjectsFor30HP = []
    contextObject.listOfModifiersContextObjectsFor20HP = [rangedModifier]
    contextObject.listOfModifiersContextObjectsFor15HP = [forcefieldModifier]
    contextObject.listOfModifiersContextObjectsFor10HP = [celerityModifier]
    contextObject.listOfModifiersContextObjectsFor5HP = [flyingModifier]
    return contextObject

  @getDescription: (modifierContextObject) ->
    return @description

  onHPChange: (e) ->
    super(e)

    card = @getCard()
    hp = card.getHP()
    missingModifierContextObjects = []
    extraModifierContextObjects = []
    if hp <= 30 then missingModifierContextObjects = missingModifierContextObjects.concat(@searchMissingModifiers(@listOfModifiersContextObjectsFor30HP, card))
    else extraModifierContextObjects = extraModifierContextObjects.concat(@getExistingModifiersFromContextObjects(@listOfModifiersContextObjectsFor30HP, card))
    if hp <= 20 then missingModifierContextObjects = missingModifierContextObjects.concat(@searchMissingModifiers(@listOfModifiersContextObjectsFor20HP, card))
    else extraModifierContextObjects = extraModifierContextObjects.concat(@getExistingModifiersFromContextObjects(@listOfModifiersContextObjectsFor20HP, card))
    if hp <= 15 then missingModifierContextObjects = missingModifierContextObjects.concat(@searchMissingModifiers(@listOfModifiersContextObjectsFor15HP, card))
    else extraModifierContextObjects = extraModifierContextObjects.concat(@getExistingModifiersFromContextObjects(@listOfModifiersContextObjectsFor15HP, card))
    if hp <= 10 then missingModifierContextObjects = missingModifierContextObjects.concat(@searchMissingModifiers(@listOfModifiersContextObjectsFor10HP, card))
    else extraModifierContextObjects = extraModifierContextObjects.concat(@getExistingModifiersFromContextObjects(@listOfModifiersContextObjectsFor10HP, card))
    if hp <= 5 then missingModifierContextObjects = missingModifierContextObjects.concat(@searchMissingModifiers(@listOfModifiersContextObjectsFor5HP, card))
    else extraModifierContextObjects = extraModifierContextObjects.concat(@getExistingModifiersFromContextObjects(@listOfModifiersContextObjectsFor5HP, card))

    #adding the missing modifiers
    if missingModifierContextObjects.length > 0
      this.applyManagedModifiersFromModifiersContextObjects(missingModifierContextObjects, card)

    #removing the extra modifiers we don't need
    if extraModifierContextObjects.length > 0
      for modifier in extraModifierContextObjects
        @getGameSession().removeModifier(modifier)

  searchMissingModifiers: (modifierContextObjects, card) ->
    missingModifierContextObjects = []
    index = @getIndex()
    for modifierContextObject in modifierContextObjects
      modifierType = modifierContextObject.type
      hasModifier = false
      for existingModifier in card.getModifiers()
        if existingModifier? and existingModifier.getType() == modifierType and existingModifier.getParentModifierIndex() == index
          hasModifier = true
          break
      if !hasModifier
        missingModifierContextObjects.push(modifierContextObject)
    return missingModifierContextObjects

  getExistingModifiersFromContextObjects: (modifierContextObjects, card) ->
    modifiers = []
    index = @getIndex()
    for modifier in card.getModifiers()
      for modifierContextObject in modifierContextObjects
        if modifier.getType() == modifierContextObject.type and modifier.getParentModifierIndex() == index
          modifiers.push(modifier)
    return modifiers

module.exports = ModifierHPThresholdGainModifiers
