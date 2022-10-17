Spell = require 'app/sdk/spells/spell'
Cards = require 'app/sdk/cards/cardsLookupComplete'
CardType = require 'app/sdk/cards/cardType'
CONFIG = require('app/common/config')
Modifier = require 'app/sdk/modifiers/modifier'
ModifierTakeDamageWatchHealMyGeneral = require 'app/sdk/modifiers/modifierTakeDamageWatchHealMyGeneral'
ModifierMyAttackOrCounterattackWatchDamageRandomEnemy = require 'app/sdk/modifiers/modifierMyAttackOrCounterattackWatchDamageRandomEnemy'
ModifierMyAttackWatchSummonDeadMinions = require 'app/sdk/modifiers/modifierMyAttackWatchSummonDeadMinions'
ModifierMyAttackMinionWatchStealGeneralHealth = require 'app/sdk/modifiers/modifierMyAttackMinionWatchStealGeneralHealth'
ModifierDealDamageWatchApplyModifiersToAllies = require 'app/sdk/modifiers/modifierDealDamageWatchApplyModifiersToAllies'
ModifierMyAttackWatchSpawnMinionNearby = require 'app/sdk/modifiers/modifierMyAttackWatchSpawnMinionNearby'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
KillAction = require 'app/sdk/actions/killAction'
ModifierForgedArtifactDescription = require 'app/sdk/modifiers/modifierForgedArtifactDescription'

i18next = require 'i18next'

class SpellForgeArtifact extends Spell

  magmarModifierAppliedName: null

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->

    target = board.getCardAtPosition({x:x, y:y}, CardType.Unit)
    if target?
      cardDataToEquip = null
      attack = target.getATK()
      faction = target.getFactionId()

      killAction = new KillAction(@getGameSession())
      killAction.setOwnerId(@getOwnerId())
      killAction.setTarget(target)
      @getGameSession().executeAction(killAction)

      artifactModifiers = []
      if faction is 1
        cardDataToEquip = {id: Cards.Artifact.LyonarRelic}
        artifactModifiers.push(ModifierTakeDamageWatchHealMyGeneral.createContextObject(attack))
      else if faction is 2
        cardDataToEquip = {id: Cards.Artifact.SonghaiRelic}
        artifactModifiers.push(ModifierMyAttackOrCounterattackWatchDamageRandomEnemy.createContextObject(attack))
      else if faction is 3
        cardDataToEquip = {id: Cards.Artifact.VetruvianRelic}
        artifactModifiers.push(ModifierMyAttackWatchSummonDeadMinions.createContextObject(attack))
      else if faction is 4
        cardDataToEquip = {id: Cards.Artifact.AbyssianRelic}
        artifactModifiers.push(ModifierMyAttackMinionWatchStealGeneralHealth.createContextObject(attack))
      else if faction is 5
        cardDataToEquip = {id: Cards.Artifact.MagmarRelic}
        statsBuff = Modifier.createContextObjectWithAttributeBuffs(attack,attack)
        statsBuff.appliedName = @magmarModifierAppliedName
        attackWatchModifier = ModifierDealDamageWatchApplyModifiersToAllies.createContextObject([statsBuff], false)
        artifactModifiers.push(attackWatchModifier)
      else if faction is 6
        cardDataToEquip = {id: Cards.Artifact.VanarRelic}
        artifactModifiers.push(ModifierMyAttackWatchSpawnMinionNearby.createContextObject({id: Cards.Faction6.ShadowVespyr}, i18next.t("cards.faction_6_unit_night_howler_name"), attack))
      else
        cardDataToEquip = {id: Cards.Artifact.NeutralRelic}

      attackBuff = Modifier.createContextObjectWithAttributeBuffs(attack,0)
      attackBuff.appliedName = "Forged"
      artifactModifiers.push(attackBuff)

      cardDataToEquip.targetModifiersContextObjects = artifactModifiers
      cardDataToEquip.additionalInherentModifiersContextObjects = [ModifierForgedArtifactDescription.createContextObject(faction, attack)]

      playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getOwnerId(), x, y, cardDataToEquip)
      playCardAction.setSource(@)
      @getGameSession().executeAction(playCardAction)

module.exports = SpellForgeArtifact
