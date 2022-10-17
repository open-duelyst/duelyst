Modifier = require './modifier'
ModifierSilence =   require 'app/sdk/modifiers/modifierSilence'

class ModifierOnSpawnCopyMyGeneral extends Modifier

  type:"ModifierOnSpawnCopyMyGeneral"
  @type:"ModifierOnSpawnCopyMyGeneral"

  @modifierName:"ModifierOnSpawnCopyMyGeneral"
  @description: "Become a copy of your General"

  @isHiddenToUI: true

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierOpeningGambit", "FX.Modifiers.ModifierGenericSpawn"]

  onApplyToCardBeforeSyncState: () ->
    super()

    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    myCard = @getCard()

    # set the max hp of the clone to the current hp of the general
    # instead of using getHP (the current hp), we have to use the base max - damage taken
    # as we'll clone all modifiers from the general next, which could boost the clone's max hp
    myCard.maxHP = general.maxHP - general.getDamage()

    # flush cached maxHP attribute on clone
    # this is necessary as no modifier is changing the attribute value via the expected methods
    myCard.flushCachedAttribute("maxHP")

    # clone all modifiers from general
    for modifier in general.getModifiers()
      if modifier? and !modifier.getIsAdditionalInherent() and modifier.getIsCloneable() and !(modifier instanceof ModifierSilence)
        contextObject = modifier.createContextObjectForClone()

        # convert artifact modifiers into "plain" modifiers
        if contextObject.maxDurability > 0
          contextObject.durability = 0
          contextObject.maxDurability = 0
          contextObject.isRemovable = true

        # hide all modifiers applied to this copy (prevents weird names from showing up)
        contextObject.isHiddenToUI = true
        @getCard().getGameSession().applyModifierContextObject(contextObject, @getCard())

module.exports = ModifierOnSpawnCopyMyGeneral
