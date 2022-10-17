Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
ModifierBackstab = require 'app/sdk/modifiers/modifierBackstab'
ModifierBlastAttack = require 'app/sdk/modifiers/modifierBlastAttack'
ModifierTranscendance = require 'app/sdk/modifiers/modifierTranscendance'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'
ModifierForcefield = require 'app/sdk/modifiers/modifierForcefield'
ModifierFrenzy = require 'app/sdk/modifiers/modifierFrenzy'
ModifierGrow = require 'app/sdk/modifiers/modifierGrow'
ModifierProvoke = require 'app/sdk/modifiers/modifierProvoke'
ModifierRanged = require 'app/sdk/modifiers/modifierRanged'
ModifierRebirth = require 'app/sdk/modifiers/modifierRebirth'
ModifierFirstBlood = require 'app/sdk/modifiers/modifierFirstBlood'
# ModifierInvulnerable = require 'app/sdk/modifiers/modifierInvulnerable'

class SpellNeurolink extends Spell

  onApplyOneEffectToBoard: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    general = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    friendlyMinions = board.getFriendlyEntitiesForEntity(general, CardType.Unit, true, false)
    hasBackstab = false
    hasBlast = false
    hasCelerity = false
    hasFlying = false
    hasForcefield = false
    hasFrenzy = false
    hasGrow = false
    hasProvoke = false
    hasRanged = false
    hasRebirth = false
    hasRush = false
    # hasInvulnerable = false
    growAmount = 0
    backstabAmount = 0
    modifierContextObjects = []
    if friendlyMinions?
      for minion in friendlyMinions
        if minion?
          if minion.hasActiveModifierClass(ModifierBackstab)
            hasBackstab = true
            for modifier in minion.getModifiers()
              if modifier instanceof ModifierBackstab and modifier.getIsActive()
                backstabAmount += modifier.getBackstabBonus()
          if !hasBlast and minion.hasActiveModifierClass(ModifierBlastAttack)
            hasBlast = true
            modifierContextObjects.push(ModifierBlastAttack.createContextObject())
          if !hasCelerity and minion.hasActiveModifierClass(ModifierTranscendance)
            hasCelerity = true
            modifierContextObjects.push(ModifierTranscendance.createContextObject())
          if !hasFlying and minion.hasActiveModifierClass(ModifierFlying)
            hasFlying = true
            modifierContextObjects.push(ModifierFlying.createContextObject())
          if !hasForcefield and minion.hasActiveModifierClass(ModifierForcefield)
            hasForcefield = true
            modifierContextObjects.push(ModifierForcefield.createContextObject())
          if !hasFrenzy and minion.hasActiveModifierClass(ModifierFrenzy)
            hasFrenzy = true
            modifierContextObjects.push(ModifierFrenzy.createContextObject())
          if minion.hasActiveModifierClass(ModifierGrow)
            hasGrow = true
            for modifier in minion.getModifiers()
              if modifier instanceof ModifierGrow and modifier.getIsActive()
                growAmount += modifier.getGrowBonus()
          if !hasProvoke and minion.hasActiveModifierClass(ModifierProvoke)
            hasProvoke = true
            modifierContextObjects.push(ModifierProvoke.createContextObject())
          if !hasRanged and minion.hasActiveModifierClass(ModifierRanged)
            hasRanged = true
            modifierContextObjects.push(ModifierRanged.createContextObject())
          if !hasRebirth and minion.hasActiveModifierClass(ModifierRebirth)
            hasRebirth = true
            modifierContextObjects.push(ModifierRebirth.createContextObject())
          if !hasRush and minion.hasActiveModifierClass(ModifierFirstBlood)
            hasRush = true
            modifierContextObjects.push(ModifierFirstBlood.createContextObject())
          # if !hasInvulnerable and minion.hasActiveModifierClass(ModifierInvulnerable)
          #   hasInvulnerable = true
          #   modifierContextObjects.push(ModifierInvulnerable.createContextObject())

    if hasGrow
      modifierContextObjects.push(ModifierGrow.createContextObject(growAmount))
    if hasBackstab
      modifierContextObjects.push(ModifierBackstab.createContextObject(backstabAmount))

    for modifier in modifierContextObjects
      modifier.durationEndTurn = 1
      @getGameSession().applyModifierContextObject(modifier, general)

module.exports = SpellNeurolink
