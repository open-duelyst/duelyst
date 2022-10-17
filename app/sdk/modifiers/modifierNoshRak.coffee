Modifier = require './modifier'
CardType = require 'app/sdk/cards/cardType'
RSX = require 'app/data/resources'
i18next = require 'i18next'

class ModifierNoshRak extends Modifier

  type:"ModifierNoshRak"
  @type:"ModifierNoshRak"

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.animResource = {
      # TODO: set these to the right sprites when nosh-rak is loaded up
      breathing : RSX.f3OnyxPantheranBreathing.name
      idle : RSX.f3OnyxPantheranIdle.name
      walk : RSX.f3OnyxPantheranRun.name
      attack : RSX.f3OnyxPantheranAttack.name
      attackReleaseDelay: 0.0
      attackDelay: 1.1
      damage : RSX.f3OnyxPantheranDamage.name
      death : RSX.f3OnyxPantheranDeath.name
    }
    p.originalDamage = 0

    return p

  @createContextObject: (attackBuff=4, maxHPBuff=9,options) ->
    contextObject = super(options)
    contextObject.attributeBuffs = {
      atk: attackBuff
      maxHP: maxHPBuff
    }
    contextObject.attributeBuffsRebased = ["atk", "maxHP"]
    contextObject.appliedName = i18next.t("modifiers.noshrak_name")

    return contextObject

  onApplyToCardBeforeSyncState: () ->
    # treating this as a 'fake' transform so we're going to store damage done to originalDamage
    # unit before we rebase their HP
    @_private.originalDamage = @getCard().getDamage()

  onRemoveFromCardBeforeSyncState: () ->
    # when this buff expires, restore original damage done to this unit
    # ignore damage done during the 'fake transform' duration
    @getCard().setDamage(@_private.originalDamage)

module.exports = ModifierNoshRak
