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
SpellThunderbomb = require 'app/sdk/spells/spellThunderbomb'
SpellAssassinationProtocol = require 'app/sdk/spells/spellAssassinationProtocol'
SpellSpawnEntitiesOnGeneralsDiagonals = require 'app/sdk/spells/spellSpawnEntitiesOnGeneralsDiagonals'
SpellBamboozle = require 'app/sdk/spells/spellBamboozle'
SpellFriendlyJux = require 'app/sdk/spells/spellFriendlyJux'
SpellApplyModifiers = require 'app/sdk/spells/spellApplyModifiers'
SpellApplyPlayerModifiers = require 'app/sdk/spells/spellApplyPlayerModifiers'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierSpellWatchApplyModifiers = require 'app/sdk/modifiers/modifierSpellWatchApplyModifiers'
ModifierCardControlledPlayerModifiers = require 'app/sdk/modifiers/modifierCardControlledPlayerModifiers'
ModifierSpellWatchDrawCard = require 'app/sdk/modifiers/modifierSpellWatchDrawCard'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'
ModifierBackstab = require 'app/sdk/modifiers/modifierBackstab'
ModifierBuild = require 'app/sdk/modifiers/modifierBuild'
ModifierBuilding = require 'app/sdk/modifiers/modifierBuilding'
ModifierDealDamageWatchSpawnEntity = require 'app/sdk/modifiers/modifierDealDamageWatchSpawnEntity'
ModifierSynergizePutCardInHand = require 'app/sdk/modifiers/modifierSynergizePutCardInHand'
ModifierBackstabWatchAddCardToHand = require 'app/sdk/modifiers/modifierBackstabWatchAddCardToHand'
ModifierBuildCompleteGainTempMana = require 'app/sdk/modifiers/modifierBuildCompleteGainTempMana'
ModifierBackstabWatchTransformToBuilding = require 'app/sdk/modifiers/modifierBackstabWatchTransformToBuilding'
ModifierPortal = require 'app/sdk/modifiers/modifierPortal'
ModifierToken = require 'app/sdk/modifiers/modifierToken'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

PlayerModifierManaModifier = require 'app/sdk/playerModifiers/playerModifierManaModifier'
PlayerModifierMechazorBuildProgress = require 'app/sdk/playerModifiers/playerModifierMechazorBuildProgress'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_WartechSet_Faction2

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction2.Suzumebachi)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_suzumebachi_name")
      card.setDescription(i18next.t("cards.faction_2_unit_suzumebachi_desc"))
      card.atk = 1
      card.maxHP = 4
      card.manaCost = 2
      card.rarityId = Rarity.Common
      statBuff = Modifier.createContextObjectWithAttributeBuffs(1,0)
      statBuff.appliedName = i18next.t("modifiers.faction_2_suzumebachi")
      statBuff.durationEndTurn = 2
      card.setInherentModifiersContextObjects([
        ModifierSpellWatchApplyModifiers.createContextObject([statBuff])
      ])
      card.setFXResource(["FX.Cards.Neutral.ProphetWhitePalm"])
      card.setBoundingBoxWidth(55)
      card.setBoundingBoxHeight(115)
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_ubo_attack_swing.audio
        walk : RSX.sfx_neutral_ubo_attack_swing.audio
        attack : RSX.sfx_neutral_prophetofthewhite_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_prophetofthewhite_hit.audio
        attackDamage : RSX.sfx_neutral_prophetofthewhite_impact.audio
        death : RSX.sfx_neutral_prophetofthewhite_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2SpearmanBreathing.name
        idle : RSX.f2SpearmanIdle.name
        walk : RSX.f2SpearmanRun.name
        attack : RSX.f2SpearmanAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.0
        damage : RSX.f2SpearmanHit.name
        death : RSX.f2SpearmanDeath.name
      )

    if (identifier == Cards.Faction2.SecondSwordSarugi)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_second_sword_sarugi_name")
      card.setDescription(i18next.t("cards.faction_2_unit_second_sword_sarugi_desc"))
      card.atk = 4
      card.maxHP = 7
      card.manaCost = 7
      card.rarityId = Rarity.Legendary
      contextObject = PlayerModifierManaModifier.createCostChangeContextObject(-2, CardType.Spell)
      contextObject.activeInHand = contextObject.activeInDeck = contextObject.activeInSignatureCards = false
      contextObject.activeOnBoard = contextObject.auraIncludeSignatureCards = true
      card.setInherentModifiersContextObjects([
        ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetOwnPlayer([contextObject], i18next.t("cards.faction_2_unit_second_sword_sarugi_desc"))
      ])
      card.setFXResource(["FX.Cards.Neutral.Eclipse"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_icebeetle_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_spelljammer_hit.audio
        attackDamage : RSX.sfx_neutral_spelljammer_attack_impact.audio
        death : RSX.sfx_neutral_spelljammer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2SecondSwordBreathing.name
        idle : RSX.f2SecondSwordIdle.name
        walk : RSX.f2SecondSwordRun.name
        attack : RSX.f2SecondSwordAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.f2SecondSwordHit.name
        death : RSX.f2SecondSwordDeath.name
      )

    if (identifier == Cards.Artifact.OrnateHiogi)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction2
      card.id = Cards.Artifact.OrnateHiogi
      card.name = i18next.t("cards.faction_2_artifact_ornate_hiogi_name")
      card.setDescription(i18next.t("cards.faction_2_artifact_ornate_hiogi_desc"))
      card.manaCost = 6
      card.rarityId = Rarity.Rare
      card.durability = 3
      card.setTargetModifiersContextObjects([
        ModifierSpellWatchDrawCard.createContextObject()
      ])
      card.setFXResource(["FX.Cards.Artifact.OrnateHiogi"])
      card.setBaseAnimResource(
        idle: RSX.iconOrnateHiogiIdle.name
        active: RSX.iconOrnateHiogiActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Spell.Thunderbomb)
      card = new SpellThunderbomb(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.HellsKitchen
      card.name = i18next.t("cards.faction_2_spell_thunderbomb_name")
      card.setDescription(i18next.t("cards.faction_2_spell_thunderbomb_desc"))
      card.rarityId = Rarity.Common
      card.manaCost = 3
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.canTargetGeneral = true
      card.setFXResource(["FX.Cards.Spell.Thunderbomb"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_phoenixfire.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconThunderbombIdle.name
        active : RSX.iconThunderbombActive.name
      )

    if (identifier == Cards.Faction2.ManakiteBuilding)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction2
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
        breathing : RSX.f2BuildMinionBreathing.name
        idle : RSX.f2BuildMinionIdle.name
        walk : RSX.f2BuildMinionIdle.name
        attack : RSX.f2BuildMinionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f2BuildMinionHit.name
        death : RSX.f2BuildMinionDeath.name
      )
      card.atk = 0
      card.maxHP = 10
      card.manaCost = 4
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierPortal.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction2.PenumbraxxBuilding)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction2
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
        breathing : RSX.f2BuildMinionBreathing.name
        idle : RSX.f2BuildMinionIdle.name
        walk : RSX.f2BuildMinionIdle.name
        attack : RSX.f2BuildMinionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f2BuildMinionHit.name
        death : RSX.f2BuildMinionDeath.name
      )
      card.atk = 0
      card.maxHP = 10
      card.manaCost = 3
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierPortal.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction2.ManakiteDrifter)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_manakite_drifter_name")
      card.setDescription(i18next.t("cards.faction_2_unit_manakite_drifter_desc"))
      card.atk = 5
      card.maxHP = 5
      card.manaCost = 4
      card.rarityId = Rarity.Common
      buildData = {id: Cards.Faction2.ManakiteBuilding}
      buildData.additionalInherentModifiersContextObjects ?= []
      buildData.additionalInherentModifiersContextObjects.push(ModifierBuildCompleteGainTempMana.createContextObject(2, "Builds into Manakite Drifter after 2 turns (this cannot be dispelled).", {id: Cards.Faction2.ManakiteDrifter}, 2))
      card.setInherentModifiersContextObjects([
        ModifierBuild.createContextObject(buildData)
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Neutral.DustWailer"])
      card.setBoundingBoxWidth(60)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_2.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_dragonlark_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_dragonlark_hit.audio
        attackDamage : RSX.sfx_neutral_dragonlark_attack_impact.audio
        death : RSX.sfx_neutral_dragonlark_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2ManakiteDrifterBreathing.name
        idle : RSX.f2ManakiteDrifterIdle.name
        walk : RSX.f2ManakiteDrifterRun.name
        attack : RSX.f2ManakiteDrifterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f2ManakiteDrifterHit.name
        death : RSX.f2ManakiteDrifterDeath.name
      )

    if (identifier == Cards.Faction2.Penumbraxx)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_penumbraxx_name")
      card.setDescription(i18next.t("cards.faction_2_unit_penumbraxx_desc"))
      card.atk = 4
      card.maxHP = 1
      card.manaCost = 3
      card.rarityId = Rarity.Legendary
      buildData = {id: Cards.Faction2.PenumbraxxBuilding}
      buildData.additionalInherentModifiersContextObjects ?= []
      buildData.additionalInherentModifiersContextObjects.push(ModifierBuilding.createContextObject("Builds into Penumbraxx after 2 turns (this cannot be dispelled).", {id: Cards.Faction2.Penumbraxx}, 2))
      card.setInherentModifiersContextObjects([
        ModifierBuild.createContextObject(buildData),
        ModifierBackstab.createContextObject(2),
        ModifierBackstabWatchTransformToBuilding.createContextObject({id: Cards.Faction2.PenumbraxxBuilding}, "Builds into Penumbraxx after 1 turn (this cannot be dispelled).")
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Neutral.VoidHunter"])
      card.setBoundingBoxWidth(50)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f2_chakriavatar_attack_swing.audio
        receiveDamage : RSX.sfx_f2_chakriavatar_hit.audio
        attackDamage : RSX.sfx_f2_chakriavatar_attack_impact.audio
        death : RSX.sfx_f2_chakriavatar_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2PenumbraxxBreathing.name
        idle : RSX.f2PenumbraxxIdle.name
        walk : RSX.f2PenumbraxxRun.name
        attack : RSX.f2PenumbraxxAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f2PenumbraxxHit.name
        death : RSX.f2PenumbraxxDeath.name
      )

    if (identifier == Cards.Faction2.WildfireTenketsu)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_wildfire_tenketsu_name")
      card.setDescription(i18next.t("cards.faction_2_unit_wildfire_tenketsu_desc"))
      card.atk = 3
      card.maxHP = 5
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([
        ModifierSynergizePutCardInHand.createContextObject({id: Cards.Spell.EightGates})
      ])
      card.setFXResource(["FX.Cards.Neutral.Mindwarper"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f4_engulfingshadow_attack_swing.audio
        receiveDamage : RSX.sfx_f4_engulfingshadow_attack_impact.audio
        attackDamage : RSX.sfx_f4_engulfingshadow_hit.audio
        death : RSX.sfx_f4_engulfingshadow_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2TenketsuBreathing.name
        idle : RSX.f2TenketsuIdle.name
        walk : RSX.f2TenketsuRun.name
        attack : RSX.f2TenketsuAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.f2TenketsuHit.name
        death : RSX.f2TenketsuDeath.name
      )

    if (identifier == Cards.Spell.AssassinationProtocol)
      card = new SpellAssassinationProtocol(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.AssassinationProtocol
      card.name = i18next.t("cards.faction_2_spell_assassination_protocol_name")
      card.setDescription(i18next.t("cards.faction_2_spell_assassination_protocol_desc"))
      card.rarityId = Rarity.Common
      card.manaCost = 1
      card.spellFilterType = SpellFilterType.AllyDirect
      card.canTargetGeneral = false
      card.setFXResource(["FX.Cards.Spell.Assassination"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_innerfocus.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconGoGetEmIdle.name
        active : RSX.iconGoGetEmActive.name
      )

    if (identifier == Cards.Spell.SeekerSquad)
      card = new SpellSpawnEntitiesOnGeneralsDiagonals(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.SeekerSquad
      card.name = i18next.t("cards.faction_2_spell_seeker_squad_name")
      card.setDescription(i18next.t("cards.faction_2_spell_seeker_squad_desc"))
      card.rarityId = Rarity.Legendary
      card.manaCost = 5
      card.spellFilterType = SpellFilterType.None
      card.cardDataOrIndexToSpawn = {id: Cards.Faction2.Heartseeker}
      card.setFXResource(["FX.Cards.Spell.SeekerSquad"])
      card.setBaseAnimResource(
        idle: RSX.iconSeekerSquadIdle.name
        active: RSX.iconSeekerSquadActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_kineticequilibrium.audio
      )

    if (identifier == Cards.Spell.Bamboozle)
      card = new SpellBamboozle(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.Bamboozle
      card.name = i18next.t("cards.faction_2_spell_bamboozle_name")
      card.setDescription(i18next.t("cards.faction_2_spell_bamboozle_desc"))
      card.rarityId = Rarity.Epic
      card.manaCost = 3
      card.filterNearGeneral = true
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.canTargetGeneral = false
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.Bamboozle"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_onyxbearseal.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconBamboozleIdle.name
        active : RSX.iconBamboozleActive.name
      )

    if (identifier == Cards.Spell.Substitution)
      card = new SpellFriendlyJux(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.Substitution
      card.name = i18next.t("cards.faction_2_spell_substitution_name")
      card.setDescription(i18next.t("cards.faction_2_spell_substitution_desc"))
      card.rarityId = Rarity.Epic
      card.manaCost = 3
      card.spellFilterType = SpellFilterType.AllyDirect
      card.canTargetGeneral = false
      card.setFXResource(["FX.Cards.Spell.Substitution"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_crossbones_attack_swing.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconSubstitutionIdle.name
        active : RSX.iconSubstitutionActive.name
      )

    if (identifier == Cards.Faction2.DuskRigger)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction2
      card.raceId = Races.Mech
      card.name = i18next.t("cards.faction_2_unit_dusk_rigger_name")
      card.setDescription(i18next.t("cards.faction_2_unit_dusk_rigger_desc"))
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([
        ModifierBackstab.createContextObject(2),
        ModifierBackstabWatchAddCardToHand.createContextObject({id: Cards.Spell.MechProgress}, 1)
      ])
      card.setFXResource(["FX.Cards.Faction6.WolfAspect"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_primordialgazer_attack_impact.audio
        attack : RSX.sfx_f3_anubis_attack_swing.audio
        receiveDamage : RSX.sfx_f6_ghostwolf_hit.audio
        attackDamage : RSX.sfx_spell_icepillar.audio
        death : RSX.sfx_f3_anubis_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2MechBreathing.name
        idle : RSX.f2MechIdle.name
        walk : RSX.f2MechRun.name
        attack : RSX.f2MechAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.f2MechHit.name
        death : RSX.f2MechDeath.name
      )

    if (identifier == Cards.Spell.MassFlight)
      card = new SpellApplyModifiers(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.MassFlight
      card.name = i18next.t("cards.faction_2_spell_mass_flight_name")
      card.setDescription(i18next.t("cards.faction_2_spell_mass_flight_desc"))
      card.rarityId = Rarity.Rare
      card.manaCost = 2
      card.spellFilterType = SpellFilterType.AllyIndirect
      customContextObject = ModifierFlying.createContextObject()
      customContextObject.durationEndTurn = 1
      card.setTargetModifiersContextObjects([customContextObject])
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.setFXResource(["FX.Cards.Spell.MassFlight"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_crossbones_attack_swing.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconMassFlyingIdle.name
        active : RSX.iconMassFlyingActive.name
      )

    if (identifier == Cards.Spell.MechProgress)
      card = new SpellApplyPlayerModifiers(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.setIsHiddenInCollection(true)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.MechProgress
      card.name = i18next.t("cards.faction_2_spell_mechaz0r_progress_name")
      card.setDescription(i18next.t("cards.faction_2_spell_mechaz0r_progress_desc"))
      card.rarityId = Rarity.TokenUnit
      card.manaCost = 0
      card.spellFilterType = SpellFilterType.None
      card.applyToOwnGeneral = true
      card.setFollowups([{
        id: Cards.Spell.DeployMechaz0r
      }])
      card.setTargetModifiersContextObjects([PlayerModifierMechazorBuildProgress.createContextObject()])
      card.setFXResource(["FX.Cards.Spell.MechProgress"])
      card.setBaseAnimResource(
        idle: RSX.iconMechProgressIdle.name
        active: RSX.iconMechProgressActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_naturalselection.audio
      )

    return card

module.exports = CardFactory_WartechSet_Faction2
