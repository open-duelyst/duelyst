Spell = require './spell'
ModifierOverwatch = require 'app/sdk/modifiers/modifierOverwatch'

###
  Generic spell used to hide the true overwatch spell from an opponent.
###
class SpellOverwatch extends Spell

  name: "Overwatch"

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.description = "Give a minion Overwatch: A hidden effect that costs %X mana."
    p.keywordClassesToInclude.push(ModifierOverwatch)

    return p

  getDescription: (options) ->
    description = super(options)

    description = description.replace /%X/, @manaCost

    return description

  createCardData: (cardData) ->
    cardData = super(cardData)

    cardData.manaCost = @getBaseManaCost()

    return cardData

  onCreatedToHide: (source) ->
    super(source)

    # copy mana cost
    @setBaseManaCost(source.getBaseManaCost())

module.exports = SpellOverwatch
