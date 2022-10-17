Logger = require 'app/common/logger'
Modifier = require './modifier'
ModifierMyAttackWatch = require './modifierMyAttackWatch'
AttackAction = require 'app/sdk/actions/attackAction'
CardType = require 'app/sdk/cards/cardType'
Stringifiers = require 'app/sdk/helpers/stringifiers'

i18next = require('i18next')

class ModifierMyAttackWatchBuffSelf extends ModifierMyAttackWatch

  type:"ModifierMyAttackWatchBuffSelf"
  @type:"ModifierMyAttackWatchBuffSelf"

  @createContextObject: (attackBuff = 0, maxHPBuff = 0, options = undefined) ->
    contextObject = super(options)
    statContextObject = Modifier.createContextObjectWithAttributeBuffs(attackBuff,maxHPBuff)
    statContextObject.appliedName = i18next.t("modifiers.faction_2_gorehorn_buff_name")
    contextObject.modifiersContextObjects = [statContextObject]
    return contextObject

  onMyAttackWatch: (action) ->
    # override me in sub classes to implement special behavior
    @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

module.exports = ModifierMyAttackWatchBuffSelf
