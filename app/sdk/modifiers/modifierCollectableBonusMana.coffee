BonusManaAction =       require 'app/sdk/actions/bonusManaAction'
Cards =                 require 'app/sdk/cards/cardsLookupComplete'
CardType =               require 'app/sdk/cards/cardType'
CONFIG =                 require('app/common/config')
ModifierCollectable =   require './modifierCollectable'
i18next = require 'i18next'

i18next = require('i18next')

class ModifierCollectableBonusMana extends ModifierCollectable

  type:"ModifierCollectableBonusMana"
  @type:"ModifierCollectableBonusMana"

  @modifierName: i18next.t("modifiers.bonus_mana_name")
  @description: i18next.t("modifiers.bonus_mana_def")

  bonusMana: 1
  bonusDuration: 1
  fxResource: ["FX.Modifiers.ModifierCollectibleBonusMana"]

  onCollect: (entity) ->
    super(entity)

    action = @getGameSession().createActionForType(BonusManaAction.type)
    action.setSource(@getCard())
    action.setTarget(entity)
    action.bonusMana = @bonusMana
    action.bonusDuration = @bonusDuration
    @getGameSession().executeAction(action)

module.exports = ModifierCollectableBonusMana
