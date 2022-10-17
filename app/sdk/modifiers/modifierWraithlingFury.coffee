Modifier = require './modifier'
CardType = require 'app/sdk/cards/cardType'
Stringifiers = require 'app/sdk/helpers/stringifiers'
RSX = require 'app/data/resources'
i18next = require 'i18next'

class ModifierWraithlingFury extends Modifier

  type:"ModifierWraithlingFury"
  @type:"ModifierWraithlingFury"

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.animResource = {
      breathing: RSX.neutralShadow03Breathing.name
      idle: RSX.neutralShadow03Idle.name
      walk: RSX.neutralShadow03Run.name
      attack: RSX.neutralShadow03Attack.name
      attackReleaseDelay: 0.0
      attackDelay: 0.6
      damage: RSX.neutralShadow03Damage.name
      death: RSX.neutralShadow03Death.name
    }

    return p

  @createContextObject: (attackBuff=4, maxHPBuff=4,options) ->
    contextObject = super(options)
    contextObject.attributeBuffs = {
      atk: attackBuff
      maxHP: maxHPBuff
    }
    contextObject.appliedName = i18next.t("modifiers.wraithling_fury_name")
    return contextObject

module.exports = ModifierWraithlingFury
