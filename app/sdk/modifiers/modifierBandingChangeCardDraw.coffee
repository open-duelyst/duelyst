ModifierBanding = require './modifierBanding'
PlayerModifierCardDrawModifier =   require 'app/sdk/playerModifiers/playerModifierCardDrawModifier'
ModifierCardControlledPlayerModifiers = require './modifierCardControlledPlayerModifiers'
i18next = require 'i18next'

class ModifierBandingChangeCardDraw extends ModifierBanding

  type:"ModifierBandingChangeCardDraw"
  @type:"ModifierBandingChangeCardDraw"

  @description:i18next.t("modifiers.banding_change_card_draw_def")

  fxResource: ["FX.Modifiers.ModifierZeal", "FX.Modifiers.ModifierZealHeal"]

  @createContextObject: (cardDraw=0, options) ->
    contextObject = super(options)
    contextObject.appliedName = i18next.t("modifiers.banding_change_card_draw_name")
    contextObject.cardDraw = cardDraw
    cardDrawContextObject = PlayerModifierCardDrawModifier.createContextObject(cardDraw)
    cardDrawContextObject.activeInHand = contextObject.activeInDeck = contextObject.activeInSignatureCards = false
    cardDrawContextObject.activeOnBoard = true
    bandedContextObject = ModifierCardControlledPlayerModifiers.createContextObjectToTargetOwnPlayer([cardDrawContextObject], "Draw cards")
    bandedContextObject.appliedName = contextObject.appliedName
    bandedContextObject.description = ModifierBandingChangeCardDraw.getDescription(contextObject)
    contextObject.modifiersContextObjects = [bandedContextObject]
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return i18next.t("modifiers.banding_change_card_draw_def",{amount:modifierContextObject.cardDraw})
      #return @description.replace /%X/, modifierContextObject.cardDraw
    else
      return @description

  onChangeOwner: (fromOwnerId, toOwnerId) ->
    super(fromOwnerId, toOwnerId)
    @removeManagedModifiersFromCard(@getCard())
    cardDrawContextObject = PlayerModifierCardDrawModifier.createContextObject(@cardDraw)
    cardDrawContextObject.activeInHand = cardDrawContextObject.activeInDeck = cardDrawContextObject.activeInSignatureCards = false
    cardDrawContextObject.activeOnBoard = true
    bandedContextObject = ModifierCardControlledPlayerModifiers.createContextObjectToTargetOwnPlayer([cardDrawContextObject], "Draw cards")
    bandedContextObject.appliedName = @modifiersContextObjects[0].appliedName
    bandedContextObject.description = @modifiersContextObjects[0].description
    @modifiersContextObjects = [bandedContextObject]
    @applyManagedModifiersFromModifiersContextObjectsOnce(@modifiersContextObjects, @getCard())

module.exports = ModifierBandingChangeCardDraw
