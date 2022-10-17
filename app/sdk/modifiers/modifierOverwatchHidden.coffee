Modifier = require './modifier'

i18next = require('i18next')

###
  Generic modifier used to hide the true overwatch modifier from an opponent.
###
class ModifierOverwatchHidden extends Modifier

  type:"ModifierOverwatchHidden"
  @type:"ModifierOverwatchHidden"

  @isKeyworded: true
  @keywordDefinition:"A hidden effect which only takes place when a specific event occurs."

  @modifierName:"Overwatch"
  @description: "%X"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierOverwatch"]

  @createContextObject: (manaCost=0,options) ->
    contextObject = super(options)
    contextObject.manaCost = manaCost
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return i18next.t("modifiers.sentinel_watchful")
    else
      return @description

  onCreatedToHide: (source) ->
    super(source)

    # copy base mana cost of source modifier's source card
    @contextObject.manaCost = source.getSourceCard().getBaseManaCost()

module.exports = ModifierOverwatchHidden
