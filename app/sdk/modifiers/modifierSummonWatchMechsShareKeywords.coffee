CardType = require 'app/sdk/cards/cardType'
Races = require 'app/sdk/cards/racesLookup'
ModifierSummonWatch = require './modifierSummonWatch'
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

class ModifierSummonWatchMechsShareKeywords extends ModifierSummonWatch

  type:"ModifierSummonWatchMechsShareKeywords"
  @type:"ModifierSummonWatchMechsShareKeywords"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  onActivate: () ->
    super()
    @onSummonWatch()

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

    myGeneral = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    friendlyMinions = @getGameSession().getBoard().getFriendlyEntitiesForEntity(myGeneral, CardType.Unit, true, false)
    friendlyMechs = []

    if friendlyMinions?
      for minion in friendlyMinions
        if minion? and !minion.getIsGeneral() and minion.getBelongsToTribe(Races.Mech)
          friendlyMechs.push(minion)
          if minion.hasActiveModifierClass(ModifierBackstab)
            hasBackstab = true
            for modifier in minion.getModifiers()
              if modifier instanceof ModifierBackstab and modifier.getIsActive()
                backstabAmount += modifier.getBackstabBonus()
                #arbitrary cap to prevent exponential increase
                if backstabAmount > 999
                  backstabAmount = 999
                  break
          if !hasBlast and minion.hasActiveModifierClass(ModifierBlastAttack)
            hasBlast = true
          if !hasCelerity and minion.hasActiveModifierClass(ModifierTranscendance)
            hasCelerity = true
          if !hasFlying and minion.hasActiveModifierClass(ModifierFlying)
            hasFlying = true
          if !hasForcefield and minion.hasActiveModifierClass(ModifierForcefield)
            hasForcefield = true
          if !hasFrenzy and minion.hasActiveModifierClass(ModifierFrenzy)
            hasFrenzy = true
          if minion.hasActiveModifierClass(ModifierGrow)
            hasGrow = true
            for modifier in minion.getModifiers()
              if modifier instanceof ModifierGrow and modifier.getIsActive()
                growAmount += modifier.getGrowBonus()
                #arbitrary cap to prevent exponential increase
                if growAmount > 999
                  growAmount = 999
                  break
          if !hasProvoke and minion.hasActiveModifierClass(ModifierProvoke)
            hasProvoke = true
          if !hasRanged and minion.hasActiveModifierClass(ModifierRanged)
            hasRanged = true
          if !hasRebirth and minion.hasActiveModifierClass(ModifierRebirth)
            hasRebirth = true
          if !hasRush and minion.hasActiveModifierClass(ModifierFirstBlood)
            hasRush = true
          if !hasAirdrop and minion.hasActiveModifierClass(ModifierAirdrop)
            hasAirdrop = true
          # if !hasInvulnerable and minion.hasActiveModifierClass(ModifierInvulnerable)
          #   hasInvulnerable = true

      for mech in friendlyMechs
        if hasBackstab
          currentBackstabAmount = 0
          if mech.hasActiveModifierClass(ModifierBackstab)
            for modifier in mech.getModifiers()
              if modifier instanceof ModifierBackstab and modifier.getIsActive()
                currentBackstabAmount += modifier.getBackstabBonus()
          if backstabAmount > currentBackstabAmount
            @getGameSession().applyModifierContextObject(ModifierBackstab.createContextObject(backstabAmount - currentBackstabAmount), mech)
        if hasBlast and !mech.hasActiveModifierClass(ModifierBlastAttack)
          @getGameSession().applyModifierContextObject(ModifierBlastAttack.createContextObject(), mech)
        if hasCelerity and !mech.hasActiveModifierClass(ModifierTranscendance)
          @getGameSession().applyModifierContextObject(ModifierTranscendance.createContextObject(), mech)
        if hasFlying and !mech.hasActiveModifierClass(ModifierFlying)
          @getGameSession().applyModifierContextObject(ModifierFlying.createContextObject(), mech)
        if hasForcefield and !mech.hasActiveModifierClass(ModifierForcefield)
          @getGameSession().applyModifierContextObject(ModifierForcefield.createContextObject(), mech)
        if hasFrenzy and !mech.hasActiveModifierClass(ModifierFrenzy)
          @getGameSession().applyModifierContextObject(ModifierFrenzy.createContextObject(), mech)
        if hasGrow
          currentGrowAmount = 0
          if mech.hasActiveModifierClass(ModifierGrow)
            for modifier in mech.getModifiers()
              if modifier instanceof ModifierGrow and modifier.getIsActive()
                currentGrowAmount += modifier.getGrowBonus()
          if growAmount > currentGrowAmount
            @getGameSession().applyModifierContextObject(ModifierGrow.createContextObject(growAmount - currentGrowAmount), mech)
        if hasProvoke and !mech.hasActiveModifierClass(ModifierProvoke)
          @getGameSession().applyModifierContextObject(ModifierProvoke.createContextObject(), mech)
        if hasRanged and !mech.hasActiveModifierClass(ModifierRanged)
          @getGameSession().applyModifierContextObject(ModifierRanged.createContextObject(), mech)
        if hasRebirth and !mech.hasActiveModifierClass(ModifierRebirth)
          @getGameSession().applyModifierContextObject(ModifierRebirth.createContextObject(), mech)
        if hasRush and !mech.hasActiveModifierClass(ModifierFirstBlood)
          @getGameSession().applyModifierContextObject(ModifierFirstBlood.createContextObject(), mech)
        if hasAirdrop and !mech.hasActiveModifierClass(ModifierAirdrop)
          @getGameSession().applyModifierContextObject(ModifierAirdrop.createContextObject(), mech)
        # if hasInvulnerable and !mech.hasActiveModifierClass(ModifierInvulnerable)
        #   @getGameSession().applyModifierContextObject(ModifierInvulnerable.createContextObject(), mech)

  getIsCardRelevantToWatcher: (card) ->
    return card.getBelongsToTribe(Races.Mech)

module.exports = ModifierSummonWatchMechsShareKeywords
