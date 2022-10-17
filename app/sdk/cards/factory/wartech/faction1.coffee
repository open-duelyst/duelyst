# do not add this file to a package
# it is specifically parsed by the package generation script

_ = require 'underscore'
moment = require 'moment'

Logger = require 'app/common/logger'

CONFIG = require('app/common/config')
RSX = require('app/data/resources')

Card = require 'app/sdk/cards/card'
Cards = require 'app/sdk/cards/cardsLookupComplete'
CardType = require 'app/sdk/cards/cardType'
Factions = require 'app/sdk/cards/factionsLookup'
FactionFactory = require 'app/sdk/cards/factionFactory'
Races = require 'app/sdk/cards/racesLookup'
Rarity = require 'app/sdk/cards/rarityLookup'
Unit = require 'app/sdk/entities/unit'
CardSet = require 'app/sdk/cards/cardSetLookup'
Artifact = require 'app/sdk/artifacts/artifact'

SpellFilterType = require 'app/sdk/spells/spellFilterType'
SpellApplyModifiers = require 'app/sdk/spells/spellApplyModifiers'
SpellTogetherness = require 'app/sdk/spells/spellTogetherness'
SpellSunstrike = require 'app/sdk/spells/spellSunstrike'
SpellApplyModifiersToUndamagedMinion = require 'app/sdk/spells/spellApplyModifiersToUndamagedMinion'
SpellApplyModifiersToGeneralAndNearbyAllies = require 'app/sdk/spells/spellApplyModifiersToGeneralAndNearbyAllies'
SpellApplyModifiersToGeneral = require 'app/sdk/spells/spellApplyModifiersToGeneral'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierOpeningGambitApplyMechazorPlayerModifiers = require 'app/sdk/modifiers/modifierOpeningGambitApplyMechazorPlayerModifiers'
ModifierSynergizeSummonMinionNearGeneral = require 'app/sdk/modifiers/modifierSynergizeSummonMinionNearGeneral'
ModifierProvoke = require 'app/sdk/modifiers/modifierProvoke'
ModifierBuild = require 'app/sdk/modifiers/modifierBuild'
ModifierBuilding = require 'app/sdk/modifiers/modifierBuilding'
ModifierSummonWatchNearbyApplyModifiersToBoth = require 'app/sdk/modifiers/modifierSummonWatchNearbyApplyModifiersToBoth'
ModifierSummonWatchNearbyTransform = require 'app/sdk/modifiers/modifierSummonWatchNearbyTransform'
ModifierPortal = require 'app/sdk/modifiers/modifierPortal'
ModifierImmuneToDamage = require 'app/sdk/modifiers/modifierImmuneToDamage'
ModifierSituationalBuffSelfIfFullHealth = require 'app/sdk/modifiers/modifierSituationalBuffSelfIfFullHealth'
ModifierBuildCompleteApplyModifiersToNearbyAllies = require 'app/sdk/modifiers/modifierBuildCompleteApplyModifiersToNearbyAllies'
ModifierAuraAboveAndBelow = require 'app/sdk/modifiers/modifierAuraAboveAndBelow'
ModifierSummonWatchNearbyApplyModifiers = require 'app/sdk/modifiers/modifierSummonWatchNearbyApplyModifiers'
ModifierToken = require 'app/sdk/modifiers/modifierToken'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

PlayerModifierMechazorBuildProgress = require 'app/sdk/playerModifiers/playerModifierMechazorBuildProgress'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_WartechSet_Faction1

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction1.Oakenheart)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction1
      card.raceId = Races.Mech
      card.name = i18next.t("cards.faction_1_unit_oakenheart_name")
      card.setDescription(i18next.t("cards.faction_1_unit_oakenheart_desc"))
      card.atk = 4
      card.maxHP = 5
      card.manaCost = 5
      card.rarityId = Rarity.Rare
      buffContextObject = Modifier.createContextObjectWithAttributeBuffs(1,1)
      buffContextObject.appliedName = i18next.t("modifiers.faction_1_oakenheart_applied_name")
      card.setInherentModifiersContextObjects([
        Modifier.createContextObjectWithAuraForAllAllies([buffContextObject],[Races.Mech],null,null,i18next.t("modifiers.faction_1_oakenheart_def")),
        ModifierOpeningGambitApplyMechazorPlayerModifiers.createContextObject()
      ])
      card.addKeywordClassToInclude(PlayerModifierMechazorBuildProgress)
      card.setFollowups([{
        id: Cards.Spell.DeployMechaz0r
      }])
      card.setFXResource(["FX.Cards.Neutral.DaggerKiri"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_unit_run_magical_4.audio
        attack : RSX.sfx_neutral_daggerkiri_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_daggerkiri_attack_impact.audio
        attackDamage : RSX.sfx_neutral_daggerkiri_hit.audio
        death : RSX.sfx_neutral_daggerkiri_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1MechBreathing.name
        idle : RSX.f1MechIdle.name
        walk : RSX.f1MechRun.name
        attack : RSX.f1MechAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f1MechHit.name
        death : RSX.f1MechDeath.name
      )

    if (identifier == Cards.Faction1.Prominence)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_prominence_name")
      card.setDescription(i18next.t("cards.faction_1_unit_prominence_desc"))
      card.atk = 4
      card.maxHP = 7
      card.manaCost = 6
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([
        ModifierSynergizeSummonMinionNearGeneral.createContextObject({id: Cards.Faction1.SilverguardKnight}, 1)
      ])
      card.setFXResource(["FX.Cards.Neutral.GoldenJusticar"])
      card.setBoundingBoxWidth(105)
      card.setBoundingBoxHeight(100)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_neutral_earthwalker_death.audio
        attack : RSX.sfx_f5_vindicator_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_beastsaberspinetiger_hit.audio
        attackDamage : RSX.sfx_neutral_beastsaberspinetiger_attack_impact.audio
        death : RSX.sfx_neutral_beastsaberspinetiger_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1ProminenceBreathing.name
        idle : RSX.f1ProminenceIdle.name
        walk : RSX.f1ProminenceRun.name
        attack : RSX.f1ProminenceAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.f1ProminenceHit.name
        death : RSX.f1ProminenceDeath.name
      )

    if (identifier == Cards.Faction1.VigilatorBuilding)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction1
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.building_name")
      card.raceId = Races.Structure
      card.setFXResource(["FX.Cards.Neutral.Bastion"])
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(125)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_divinebond.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_spiritscribe_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_spiritscribe_hit.audio
        attackDamage : RSX.sfx_neutral_spiritscribe_impact.audio
        death : RSX.sfx_neutral_golembloodshard_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1BuildMinionBreathing.name
        idle : RSX.f1BuildMinionIdle.name
        walk : RSX.f1BuildMinionIdle.name
        attack : RSX.f1BuildMinionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f1BuildMinionHit.name
        death : RSX.f1BuildMinionDeath.name
      )
      card.atk = 0
      card.maxHP = 10
      card.manaCost = 3
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierPortal.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction1.MonumentBuilding)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction1
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.building_name")
      card.raceId = Races.Structure
      card.setFXResource(["FX.Cards.Neutral.Bastion"])
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(125)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_divinebond.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_spiritscribe_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_spiritscribe_hit.audio
        attackDamage : RSX.sfx_neutral_spiritscribe_impact.audio
        death : RSX.sfx_neutral_golembloodshard_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1BuildMinionBreathing.name
        idle : RSX.f1BuildMinionIdle.name
        walk : RSX.f1BuildMinionIdle.name
        attack : RSX.f1BuildMinionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f1BuildMinionHit.name
        death : RSX.f1BuildMinionDeath.name
      )
      card.atk = 0
      card.maxHP = 10
      card.manaCost = 4
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierPortal.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction1.Vigilator)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_vigilator_name")
      card.setDescription(i18next.t("cards.faction_1_unit_vigilator_desc"))
      card.setFXResource(["FX.Cards.Faction1.SilverguardSquire"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1silverguardsquire_attack_swing.audio
        receiveDamage : RSX.sfx_f1silverguardsquire_hit.audio
        attackDamage : RSX.sfx_f1silverguardsquire_attack_impact.audio
        death : RSX.sfx_f1silverguardsquire_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1VigilatorBreathing.name
        idle : RSX.f1VigilatorIdle.name
        walk : RSX.f1VigilatorRun.name
        attack : RSX.f1VigilatorAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f1VigilatorHit.name
        death : RSX.f1VigilatorDeath.name
      )
      card.atk = 3
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Common
      statContextObject = Modifier.createContextObjectWithAttributeBuffs(0,3)
      statContextObject.appliedName = i18next.t("modifiers.faction_1_vigilator_applied_name")
      buildData = {id: Cards.Faction1.VigilatorBuilding}
      buildData.additionalInherentModifiersContextObjects ?= []
      buildData.additionalInherentModifiersContextObjects.push(ModifierBuildCompleteApplyModifiersToNearbyAllies.createContextObject([statContextObject], false, "Builds into Vigilator after 1 turn (this cannot be dispelled).", {id: Cards.Faction1.Vigilator}, 1))
      card.setInherentModifiersContextObjects([ModifierBuild.createContextObject(buildData)])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Spell.SteadfastFormation)
      card = new SpellApplyModifiers(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction1
      card.id = Cards.Spell.SteadfastFormation
      card.name = i18next.t("cards.faction_1_spell_steadfast_formation_name")
      card.setDescription(i18next.t("cards.faction_1_spell_steadfast_formation_desc"))
      card.rarityId = Rarity.Common
      card.manaCost = 0
      card.spellFilterType = SpellFilterType.AllyIndirect
      card.setAffectPattern(CONFIG.PATTERN_2X2)
      card.setTargetModifiersContextObjects([
        ModifierProvoke.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierProvoke)
      card.setFXResource(["FX.Cards.Spell.SteadfastFormation"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_disintegrate.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconStandTogetherIdle.name
        active : RSX.iconStandTogetherActive.name
      )

    if (identifier == Cards.Faction1.Warsmith)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_surgeforger_name")
      card.setDescription(i18next.t("cards.faction_1_unit_surgeforger_desc"))
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 3
      card.rarityId = Rarity.Legendary
      statContextObject = Modifier.createContextObjectWithAttributeBuffs(1,1)
      statContextObject.appliedName = i18next.t("modifiers.faction_1_surgeforger_applied_name")
      card.setInherentModifiersContextObjects([
        ModifierSummonWatchNearbyApplyModifiersToBoth.createContextObject([statContextObject])
      ])
      card.setFXResource(["FX.Cards.Neutral.Warsmith"])
      card.setBoundingBoxWidth(50)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_f1ironcliffeguardian_attack_swing.audio
        receiveDamage : RSX.sfx_f1ironcliffeguardian_hit.audio
        attackDamage : RSX.sfx_f1ironcliffeguardian_attack_impact.audio
        death : RSX.sfx_f1ironcliffeguardian_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1SurgeforgerBreathing.name
        idle : RSX.f1SurgeforgerIdle.name
        walk : RSX.f1SurgeforgerRun.name
        attack : RSX.f1SurgeforgerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.f1SurgeforgerHit.name
        death : RSX.f1SurgeforgerDeath.name
      )

    if (identifier == Cards.Faction1.DecoratedEnlistee)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_decorated_enlistee_name")
      card.setDescription(i18next.t("cards.faction_1_unit_decorated_enlistee_desc"))
      card.atk = 1
      card.maxHP = 5
      card.manaCost = 3
      card.rarityId = Rarity.Common
      buffContextObject = Modifier.createContextObjectWithAttributeBuffs(3,0,{
        modifierName:i18next.t("modifiers.faction_1_decorated_enlisteee_applied_name"),
        appliedName:i18next.t("modifiers.faction_1_decorated_enlisteee_applied_name")
      })
      card.setInherentModifiersContextObjects([
        ModifierSituationalBuffSelfIfFullHealth.createContextObject([buffContextObject])
      ])
      card.setFXResource(["FX.Cards.Neutral.Chakkram"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_f1_oserix_death.audio
        attack : RSX.sfx_neutral_serpenti_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_serpenti_hit.audio
        attackDamage : RSX.sfx_neutral_serpenti_attack_impact.audio
        death : RSX.sfx_neutral_serpenti_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1EnlisteeBreathing.name
        idle : RSX.f1EnlisteeIdle.name
        walk : RSX.f1EnlisteeRun.name
        attack : RSX.f1EnlisteeAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f1EnlisteeHit.name
        death : RSX.f1EnlisteeDeath.name
      )

    if (identifier == Cards.Spell.Fealty)
      card = new SpellTogetherness(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction1
      card.id = Cards.Spell.Fealty
      card.name = i18next.t("cards.faction_1_spell_fealty_name")
      card.setDescription(i18next.t("cards.faction_1_spell_fealty_desc"))
      card.rarityId = Rarity.Rare
      card.manaCost = 3
      card.setFXResource(["FX.Cards.Spell.Fealty"])
      card.setBaseAnimResource(
        idle : RSX.iconFealtyIdle.name
        active : RSX.iconFealtyActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_crossbones_attack_swing.audio
      )

    if (identifier == Cards.Faction1.IroncliffeMonument)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_ironcliffe_monument_name")
      card.setDescription(i18next.t("cards.faction_1_unit_ironcliffe_monument_desc"))
      card.raceId = Races.Structure
      card.atk = 0
      card.maxHP = 10
      card.manaCost = 4
      card.rarityId = Rarity.Legendary
      buildData = {id: Cards.Faction1.MonumentBuilding}
      buildData.additionalInherentModifiersContextObjects ?= []
      buildData.additionalInherentModifiersContextObjects.push(ModifierBuilding.createContextObject("Builds into Ironcliffe Monument after 2 turns (this cannot be dispelled).", {id: Cards.Faction1.IroncliffeMonument}, 2))
      card.setInherentModifiersContextObjects([
        ModifierSummonWatchNearbyTransform.createContextObject({id: Cards.Faction1.IroncliffeGuardian}),
        ModifierBuild.createContextObject(buildData),
        ModifierPortal.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Neutral.Bastion"])
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(125)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_divinebond.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_spiritscribe_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_spiritscribe_hit.audio
        attackDamage : RSX.sfx_neutral_spiritscribe_impact.audio
        death : RSX.sfx_neutral_golembloodshard_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1IroncliffeMonumentBreathing.name
        idle : RSX.f1IroncliffeMonumentIdle.name
        walk : RSX.f1IroncliffeMonumentIdle.name
        attack : RSX.f1IroncliffeMonumentAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f1IroncliffeMonumentHit.name
        death : RSX.f1IroncliffeMonumentDeath.name
      )

    if (identifier == Cards.Spell.CallToArms)
      card = new SpellApplyModifiersToGeneral(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction1
      card.id = Cards.Spell.CallToArms
      card.name = i18next.t("cards.faction_1_spell_call_to_arms_name")
      card.setDescription(i18next.t("cards.faction_1_spell_call_to_arms_desc"))
      card.rarityId = Rarity.Legendary
      card.manaCost = 7
      card.spellFilterType = SpellFilterType.None
      card.applyToOwnGeneral = true
      buffContextObject = Modifier.createContextObjectWithAttributeBuffs(3,3)
      buffContextObject.appliedName = i18next.t("modifiers.faction_1_spell_call_to_arms_1")
      summonWatchModifier = ModifierSummonWatchNearbyApplyModifiers.createContextObject([buffContextObject])
      summonWatchModifier.appliedName = i18next.t("cards.faction_1_spell_call_to_arms_name")
      summonWatchModifier.appliedDescription = i18next.t("modifiers.faction_1_spell_call_to_arms_2")
      card.setTargetModifiersContextObjects([summonWatchModifier])
      card.setFXResource(["FX.Cards.Spell.CallToArms"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_warsurge.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconCallToArmsIdle.name
        active : RSX.iconCallToArmsActive.name
      )

    if (identifier == Cards.Spell.Sunstrike)
      card = new SpellSunstrike(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction1
      card.id = Cards.Spell.Sunstrike
      card.name = i18next.t("cards.faction_1_spell_sunstrike_name")
      card.setDescription(i18next.t("cards.faction_1_spell_sunstrike_desc"))
      card.rarityId = Rarity.Epic
      card.manaCost = 4
      card.spellFilterType = SpellFilterType.None
      card.setAffectPattern(CONFIG.PATTERN_WHOLE_ROW)
      card.setFXResource(["FX.Cards.Spell.SunStrike"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f2_jadeogre_attack_impact.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconSunstrikeIdle.name
        active : RSX.iconSunstrikeActive.name
      )

    if (identifier == Cards.Spell.Invincible)
      card = new SpellApplyModifiersToUndamagedMinion(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction1
      card.id = Cards.Spell.Invincible
      card.name = i18next.t("cards.faction_1_spell_invincible_name")
      card.setDescription(i18next.t("cards.faction_1_spell_invincible_desc"))
      card.rarityId = Rarity.Epic
      card.manaCost = 4
      card.spellFilterType = SpellFilterType.AllyDirect
      buffContextObject = Modifier.createContextObjectWithAttributeBuffs(4,4)
      buffContextObject.appliedName = i18next.t("modifiers.faction_1_spell_invincible")
      card.setTargetModifiersContextObjects([
        buffContextObject
      ])
      card.setFXResource(["FX.Cards.Spell.Invincible"])
      card.setBaseAnimResource(
        idle: RSX.iconInvincibleIdle.name
        active: RSX.iconInvincibleActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_divinebond.audio
      )

    if (identifier == Cards.Spell.DauntlessAdvance)
      card = new SpellApplyModifiersToGeneralAndNearbyAllies(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction1
      card.id = Cards.Spell.DauntlessAdvance
      card.name = i18next.t("cards.faction_1_spell_dauntless_advance_name")
      card.setDescription(i18next.t("cards.faction_1_spell_dauntless_advance_desc"))
      card.rarityId = Rarity.Common
      card.manaCost = 2
      card.spellFilterType = SpellFilterType.None
      damageImmuneContextObject = ModifierImmuneToDamage.createContextObject()
      damageImmuneContextObject.durationEndTurn = 1
      damageImmuneContextObject.appliedName = i18next.t("modifiers.faction_1_spell_dauntless_advance_1")
      damageImmuneContextObject.appliedDescription = i18next.t("modifiers.faction_1_spell_dauntless_advance_2")
      card.setTargetModifiersContextObjects([
        damageImmuneContextObject
      ])
      card.setFXResource(["FX.Cards.Spell.DauntlessAdvance"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_forcebarrier.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconPressTheAttackIdle.name
        active : RSX.iconPressTheAttackActive.name
      )

    if (identifier == Cards.Artifact.SunbondPavise)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction1
      card.id = Cards.Artifact.SunbondPavise
      card.name = i18next.t("cards.faction_1_artifact_sunbond_pavise_name")
      card.setDescription(i18next.t("cards.faction_1_artifact_sunbond_pavise_desc"))
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.durability = 3
      attackBuffModifier = Modifier.createContextObjectWithAttributeBuffs(2)
      attackBuffModifier.appliedName = i18next.t("modifiers.faction_1_artifact_sunbound_pavise")
      card.setTargetModifiersContextObjects([
        ModifierAuraAboveAndBelow.createContextObjectWithAuraForNearbyAllies(
          [ModifierProvoke.createContextObject(), attackBuffModifier],
          null, null, null, i18next.t("cards.faction_1_artifact_sunbond_pavise_name")
        )
      ])
      card.addKeywordClassToInclude(ModifierProvoke)
      card.setFXResource(["FX.Cards.Artifact.SunbondPavise"])
      card.setBaseAnimResource(
        idle: RSX.iconBigShieldIdle.name
        active: RSX.iconBigShieldActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    return card

module.exports = CardFactory_WartechSet_Faction1
