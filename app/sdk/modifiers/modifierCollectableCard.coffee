PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
Cards = require 'app/sdk/cards/cardsLookupComplete'
ModifierCollectable =   require './modifierCollectable'

i18next = require('i18next')

class ModifierCollectableCard extends ModifierCollectable

  type:"ModifierCollectableCard"
  @type:"ModifierCollectableCard"

  #@modifierName: i18next.t("modifiers.bonus_mana_name")
  #@description: i18next.t("modifiers.bonus_mana_def")

  isRemovable: false

  fxResource: ["FX.Modifiers.ModifierCollectableCard"]

  @createContextObject: (cardDataOrIndex, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndex = cardDataOrIndex
    return contextObject

  onCollect: (entity) ->
    super(entity)

    a = new PutCardInHandAction(@getGameSession(), entity.getOwnerId(), @cardDataOrIndex)
    @getGameSession().executeAction(a)

module.exports = ModifierCollectableCard
