CardType = require 'app/sdk/cards/cardType'
Races = require 'app/sdk/cards/racesLookup'
ModifierAnySummonWatch = require './modifierAnySummonWatch'
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
ModifierAirdrop = require 'app/sdk/modifiers/modifierAirdrop'
# ModifierInvulnerable = require 'app/sdk/modifiers/modifierInvulnerable'

class ModifierAnySummonWatchGainGeneralKeywords extends ModifierAnySummonWatch

  type:"ModifierAnySummonWatchGainGeneralKeywords"
  @type:"ModifierAnySummonWatchGainGeneralKeywords"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  onSummonWatch: (action) ->

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
    hasAirdrop = false
    # hasInvulnerable = false
    growAmount = 0
    backstabAmount = 0

    myGeneral = @getGameSession().getGeneralForPlayerId(action.getCard().getOwnerId())

    if myGeneral?
      if myGeneral.hasModifierClass(ModifierBackstab)
        hasBackstab = true
        for modifier in myGeneral.getModifiers()
          if modifier instanceof ModifierBackstab
            backstabAmount += modifier.getBackstabBonus()
      if !hasBlast and myGeneral.hasModifierClass(ModifierBlastAttack)
        hasBlast = true
      if !hasCelerity and myGeneral.hasModifierClass(ModifierTranscendance)
        hasCelerity = true
      if !hasFlying and myGeneral.hasModifierClass(ModifierFlying)
        hasFlying = true
      if !hasForcefield and myGeneral.hasModifierClass(ModifierForcefield)
        hasForcefield = true
      if !hasFrenzy and myGeneral.hasModifierClass(ModifierFrenzy)
        hasFrenzy = true
      if myGeneral.hasModifierClass(ModifierGrow)
        hasGrow = true
        for modifier in myGeneral.getModifiers()
          if modifier instanceof ModifierGrow
            growAmount += modifier.getGrowBonus()
      if !hasProvoke and myGeneral.hasModifierClass(ModifierProvoke)
        hasProvoke = true
      if !hasRanged and myGeneral.hasModifierClass(ModifierRanged)
        hasRanged = true
      if !hasRebirth and myGeneral.hasModifierClass(ModifierRebirth)
        hasRebirth = true
      if !hasRush and myGeneral.hasModifierClass(ModifierFirstBlood)
        hasRush = true
      if !hasAirdrop and myGeneral.hasModifierClass(ModifierAirdrop)
        hasAirdrop = true

    summonedMinion = action.getCard()
    if summonedMinion?
      if hasBackstab
        currentBackstabAmount = 0
        if summonedMinion.hasModifierClass(ModifierBackstab)
          for modifier in summonedMinion.getModifiers()
            if modifier instanceof ModifierBackstab
              currentBackstabAmount += modifier.getBackstabBonus()
        if backstabAmount > currentBackstabAmount
          @getGameSession().applyModifierContextObject(ModifierBackstab.createContextObject(backstabAmount - currentBackstabAmount), summonedMinion)
      if hasBlast and !summonedMinion.hasModifierClass(ModifierBlastAttack)
        @getGameSession().applyModifierContextObject(ModifierBlastAttack.createContextObject(), summonedMinion)
      if hasCelerity and !summonedMinion.hasModifierClass(ModifierTranscendance)
        @getGameSession().applyModifierContextObject(ModifierTranscendance.createContextObject(), summonedMinion)
      if hasFlying and !summonedMinion.hasModifierClass(ModifierFlying)
        @getGameSession().applyModifierContextObject(ModifierFlying.createContextObject(), summonedMinion)
      if hasForcefield and !summonedMinion.hasModifierClass(ModifierForcefield)
        @getGameSession().applyModifierContextObject(ModifierForcefield.createContextObject(), summonedMinion)
      if hasFrenzy and !summonedMinion.hasModifierClass(ModifierFrenzy)
        @getGameSession().applyModifierContextObject(ModifierFrenzy.createContextObject(), summonedMinion)
      if hasGrow
        currentGrowAmount = 0
        if summonedMinion.hasModifierClass(ModifierGrow)
          for modifier in summonedMinion.getModifiers()
            if modifier instanceof ModifierGrow
              currentGrowAmount += modifier.getGrowBonus()
        if growAmount > currentGrowAmount
          @getGameSession().applyModifierContextObject(ModifierGrow.createContextObject(growAmount - currentGrowAmount), summonedMinion)
      if hasProvoke and !summonedMinion.hasModifierClass(ModifierProvoke)
        @getGameSession().applyModifierContextObject(ModifierProvoke.createContextObject(), summonedMinion)
      if hasRanged and !summonedMinion.hasModifierClass(ModifierRanged)
        @getGameSession().applyModifierContextObject(ModifierRanged.createContextObject(), summonedMinion)
      if hasRebirth and !summonedMinion.hasModifierClass(ModifierRebirth)
        @getGameSession().applyModifierContextObject(ModifierRebirth.createContextObject(), summonedMinion)
      if hasRush and !summonedMinion.hasModifierClass(ModifierFirstBlood)
        @getGameSession().applyModifierContextObject(ModifierFirstBlood.createContextObject(), summonedMinion)
      if hasAirdrop and !summonedMinion.hasModifierClass(ModifierAirdrop)
        @getGameSession().applyModifierContextObject(ModifierAirdrop.createContextObject(), summonedMinion)
      # if hasInvulnerable and !mech.hasModifierClass(ModifierInvulnerable)
      #   @getGameSession().applyModifierContextObject(ModifierInvulnerable.createContextObject(), mech)


module.exports = ModifierAnySummonWatchGainGeneralKeywords
