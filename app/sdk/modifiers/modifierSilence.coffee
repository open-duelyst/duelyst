Modifier = require './modifier'
CardType = require 'app/sdk/cards/cardType'
i18next = require 'i18next'

class ModifierSilence extends Modifier

  type: "ModifierSilence"
  @type: "ModifierSilence"

  @modifierName:i18next.t("modifiers.silence_name")
  @description:i18next.t("modifiers.silence_def")

  fxResource: ["FX.Modifiers.ModifierDispel"]

  onApplyToCard: (card) ->
    allowableSilenceTarget = true
    if card.getType() == CardType.Unit and !card.getIsTargetable()
      allowableSilenceTarget = false

    # temporarily make self unremovable
    wasRemovable = @isRemovable
    @isRemovable = false

    if allowableSilenceTarget
      # silence card and remove all other modifiers
      card.silence()

    super(card)

    # restore removable state
    @isRemovable = wasRemovable

    if !allowableSilenceTarget # remove modifier immediately after attempting to slience
      @getGameSession().removeModifier(@)

module.exports = ModifierSilence
