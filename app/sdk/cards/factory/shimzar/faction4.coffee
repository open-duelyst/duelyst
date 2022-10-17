# do not add this file to a package
# it is specifically parsed by the package generation script

_ = require 'underscore'
moment = require 'moment'

Logger = require 'app/common/logger'

CONFIG = require('app/common/config')
RSX = require('app/data/resources')

Card = require 'app/sdk/cards/card'
Cards = require 'app/sdk/cards/cardsLookupComplete'
CardSet = require 'app/sdk/cards/cardSetLookup'
CardType = require 'app/sdk/cards/cardType'
Factions = require 'app/sdk/cards/factionsLookup'
FactionFactory = require 'app/sdk/cards/factionFactory'
Races = require 'app/sdk/cards/racesLookup'
Rarity = require 'app/sdk/cards/rarityLookup'

Unit = require 'app/sdk/entities/unit'
Artifact = require 'app/sdk/artifacts/artifact'

Spell = require 'app/sdk/spells/spell'
SpellFilterType = require 'app/sdk/spells/spellFilterType'
SpellAbyssalScar = require 'app/sdk/spells/spellAbyssalScar'
SpellLurkingFear = require 'app/sdk/spells/spellLurkingFear'
SpellEchoingShriek = require 'app/sdk/spells/spellEchoingShriek'
SpellVoidSteal = require 'app/sdk/spells/spellVoidSteal'
SpellVeilOfUnraveling = require 'app/sdk/spells/spellVeilOfUnraveling'
SpellSpawnEntity = require 'app/sdk/spells/spellSpawnEntity'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierStackingShadows = require 'app/sdk/modifiers/modifierStackingShadows'
ModifierProvoke = require 'app/sdk/modifiers/modifierProvoke'
ModifierOpeningGambit = require 'app/sdk/modifiers/modifierOpeningGambit'
ModifierOpeningGambitApplyPlayerModifiers = require 'app/sdk/modifiers/modifierOpeningGambitApplyPlayerModifiers'
ModifierDyingWishSpawnEntityInCorner = require 'app/sdk/modifiers/modifierDyingWishSpawnEntityInCorner'
ModifierDynamicCountModifySelfByShadowTilesOnBoard = require 'app/sdk/modifiers/modifierDynamicCountModifySelfByShadowTilesOnBoard'
ModifierBattlePet = require 'app/sdk/modifiers/modifierBattlePet'
ModifierInkhornGaze = require 'app/sdk/modifiers/modifierInkhornGaze'
ModifierOpeningGambitDamageEnemiesNearShadowCreep = require 'app/sdk/modifiers/modifierOpeningGambitDamageEnemiesNearShadowCreep'
ModifierTakeDamageWatchSpawnShadowCreep = require 'app/sdk/modifiers/modifierTakeDamageWatchSpawnShadowCreep'
ModifierDyingWishSpawnTileAnywhere = require 'app/sdk/modifiers/modifierDyingWishSpawnTileAnywhere'
ModifierDyingWish = require 'app/sdk/modifiers/modifierDyingWish'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

PlayerModifierManaModifierSingleUse = require 'app/sdk/playerModifiers/playerModifierManaModifierSingleUse'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_ShimzarSet_Faction4

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction4.NightFiend)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction4
      card.name = i18next.t("cards.faction_4_unit_night_fiend_name")
      card.setDescription(i18next.t("cards.faction_4_unit_night_fiend_desc"))
      card.setFXResource(["FX.Cards.Faction4.DarkSiren"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f4_blacksolus_attack_swing.audio
        walk : RSX.sfx_f3_aymarahealer_impact.audio
        attack : RSX.sfx_f3_anubis_attack_impact.audio
        receiveDamage : RSX.sfx_f3_anubis_hit.audio
        attackDamage : RSX.sfx_f4_siren_attack_impact.audio
        death : RSX.sfx_f3_anubis_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f4NightFiendBreathing.name
        idle : RSX.f4NightFiendIdle.name
        walk : RSX.f4NightFiendRun.name
        attack : RSX.f4NightFiendAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f4NightFiendHit.name
        death : RSX.f4NightFiendDeath.name
      )
      card.atk = 4
      card.maxHP = 4
      card.manaCost = 5
      card.rarityId = Rarity.Common
      card.addKeywordClassToInclude(ModifierStackingShadows)
      card.setInherentModifiersContextObjects([ModifierOpeningGambitDamageEnemiesNearShadowCreep.createContextObject(2)])

    if (identifier == Cards.Faction4.Gor)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction4
      card.name = i18next.t("cards.faction_4_unit_gor_name")
      card.setDescription(i18next.t("cards.faction_4_unit_gor_desc"))
      card.raceId = Races.BattlePet
      card.setFXResource(["FX.Cards.Neutral.Gor"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f4_blacksolus_attack_swing.audio
        walk : RSX.sfx_f6_draugarlord_hit.audio
        attack : RSX.sfx_f6_waterelemental_attack_swing.audio
        receiveDamage : RSX.sfx_f6_waterelemental_hit.audio
        attackDamage : RSX.sfx_f6_waterelemental_attack_impact.audio
        death : RSX.sfx_f6_waterelemental_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f4GorBreathing.name
        idle : RSX.f4GorIdle.name
        walk : RSX.f4GorRun.name
        attack : RSX.f4GorAttack.name
        attackReleaseDelay: 0.2
        attackDelay: 1.2
        damage : RSX.f4GorHit.name
        death : RSX.f4GorDeath.name
      )
      card.atk = 1
      card.maxHP = 1
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierBattlePet.createContextObject(), ModifierDyingWishSpawnEntityInCorner.createContextObject({id: Cards.Faction4.Gor}, "a copy of this minion")])

    if (identifier == Cards.Faction4.Ooz)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction4
      card.name = i18next.t("cards.faction_4_unit_ooz_name")
      card.setDescription(i18next.t("cards.faction_4_unit_ooz_desc"))
      card.raceId = Races.BattlePet
      card.setFXResource(["FX.Cards.Neutral.Gor"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f4_blacksolus_attack_swing.audio
        walk : RSX.sfx_spell_icepillar_melt.audio
        attack : RSX.sfx_neutral_coiledcrawler_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_coiledcrawler_hit.audio
        attackDamage : RSX.sfx_neutral_coiledcrawler_attack_impact.audio
        death : RSX.sfx_neutral_coiledcrawler_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f4OozBreathing.name
        idle : RSX.f4OozIdle.name
        walk : RSX.f4OozRun.name
        attack : RSX.f4OozAttack.name
        attackReleaseDelay: 0.2
        attackDelay: 1.2
        damage : RSX.f4OozHit.name
        death : RSX.f4OozDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierBattlePet.createContextObject(), ModifierTakeDamageWatchSpawnShadowCreep.createContextObject()])
      card.addKeywordClassToInclude(ModifierStackingShadows)

    if (identifier == Cards.Faction4.BloodBaronette)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction4
      card.name = i18next.t("cards.faction_4_unit_blood_baronette_name")
      card.setDescription(i18next.t("cards.faction_4_unit_blood_baronette_desc"))
      card.setFXResource(["FX.Cards.Faction4.BloodBaronette"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f4_blacksolus_attack_swing.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f4_siren_attack_swing.audio
        receiveDamage : RSX.sfx_f4_siren_hit.audio
        attackDamage : RSX.sfx_f4_siren_attack_impact.audio
        death : RSX.sfx_f1elyxstormblade_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f4BloodBaronetteBreathing.name
        idle : RSX.f4BloodBaronetteIdle.name
        walk : RSX.f4BloodBaronetteRun.name
        attack : RSX.f4BloodBaronetteAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f4BloodBaronetteHit.name
        death : RSX.f4BloodBaronetteDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      card.setFollowups([
        {
          id: Cards.Spell.DoubleAttackAndHealth
          filterCardIds: [Cards.Faction4.Wraithling]
          spellFilterType: SpellFilterType.AllyDirect
          modifierAppliedName: i18next.t("modifiers.faction_4_followup_blood_baronette_2")
          _private: {
            followupSourcePattern: CONFIG.PATTERN_3x3
          }
        }
      ])

    if (identifier == Cards.Faction4.ArcaneDevourer)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction4
      card.name = i18next.t("cards.faction_4_unit_arcane_devourer_name")
      card.setDescription(i18next.t("cards.faction_4_unit_arcane_devourer_desc"))
      card.setFXResource(["FX.Cards.Faction4.ArcaneDevourer"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f4_blacksolus_attack_swing.audio
        walk : RSX.sfx_spell_icepillar_melt.audio
        attack : RSX.sfx_f6_waterelemental_death.audio
        receiveDamage : RSX.sfx_f1windbladecommander_hit.audio
        attackDamage : RSX.sfx_f2_celestialphantom_attack_impact.audio
        death : RSX.sfx_f1elyxstormblade_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f4ArcaneDevourerBreathing.name
        idle : RSX.f4ArcaneDevourerIdle.name
        walk : RSX.f4ArcaneDevourerRun.name
        attack : RSX.f4ArcaneDevourerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f4ArcaneDevourerHit.name
        death : RSX.f4ArcaneDevourerDeath.name
      )
      card.atk = 8
      card.maxHP = 4
      card.manaCost = 7
      card.rarityId = Rarity.Epic
      customContextObject = PlayerModifierManaModifierSingleUse.createCostChangeContextObject(1, CardType.Unit)
      customContextObject.durationEndTurn = 1
      customContextObject.modifiersContextObjects[0].attributeBuffsAbsolute = ["manaCost"]
      customContextObject.modifiersContextObjects[0].attributeBuffsFixed = ["manaCost"]
      card.setInherentModifiersContextObjects([
        ModifierOpeningGambitApplyPlayerModifiers.createContextObjectToTargetOwnPlayer([customContextObject], false, "The next minion you summon this turn costs 1")
      ])

    if (identifier == Cards.Faction4.Klaxon)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction4
      card.name = i18next.t("cards.faction_4_unit_klaxon_name")
      card.setDescription(i18next.t("cards.faction_4_unit_klaxon_desc"))
      card.setFXResource(["FX.Cards.Faction4.Klaxon"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_f4_klaxon_shriek.audio
        attack : RSX.sfx_f2_celestialphantom_attack_swing.audio
        receiveDamage : RSX.sfx_f2_celestialphantom_hit.audio
        attackDamage : RSX.sfx_f2_celestialphantom_attack_impact.audio
        death : RSX.sfx_f2_celestialphantom_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f4KlaxonBreathing.name
        idle : RSX.f4KlaxonIdle.name
        walk : RSX.f4KlaxonRun.name
        attack : RSX.f4KlaxonAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f4KlaxonHit.name
        death : RSX.f4KlaxonDeath.name
      )
      card.atk = 6
      card.maxHP = 6
      card.manaCost = 6
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierProvoke.createContextObject(), ModifierDyingWishSpawnTileAnywhere.createContextObject({id: Cards.Tile.Shadow}, 6)])
      card.addKeywordClassToInclude(ModifierStackingShadows)

    if (identifier == Cards.Spell.LurkingFear)
      card = new SpellLurkingFear(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction4
      card.id = Cards.Spell.LurkingFear
      card.name = i18next.t("cards.faction_4_spell_lurking_fear_name")
      card.setDescription(i18next.t("cards.faction_4_spell_lurking_fear_description"))
      card.rarityId = Rarity.Epic
      card.addKeywordClassToInclude(ModifierDyingWish)
      card.manaCost = 2
      card.costChange = -1
      card.setFXResource(["FX.Cards.Spell.LurkingFear"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_darkfiresacrifice.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconLurkingFearIdle.name
        active : RSX.iconLurkingFearActive.name
      )

    if (identifier == Cards.Spell.InkhornGaze)
      card = new SpellAbyssalScar(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction4
      card.id = Cards.Spell.InkhornGaze
      card.name = i18next.t("cards.faction_4_spell_inkhorn_gaze_name")
      card.setDescription(i18next.t("cards.faction_4_spell_inkhorn_gaze_description"))
      card.rarityId = Rarity.Common
      card.manaCost = 2
      card.damageAmount = 2
      dyingWishContextObject = ModifierInkhornGaze.createContextObject()
      dyingWishContextObject.durationEndTurn = 1
      dyingWishContextObject.isRemovable = false
      dyingWishContextObject.appliedName = i18next.t("cards.faction_4_spell_inkhorn_gaze_name")
      card.setTargetModifiersContextObjects([dyingWishContextObject])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.InkhornGaze"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_shadowreflection.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconInkhornGazeIdle.name
        active : RSX.iconInkhornGazeActive.name
      )

    if (identifier == Cards.Spell.SphereOfDarkness)
      card = new SpellSpawnEntity(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction4
      card.id = Cards.Spell.SphereOfDarkness
      card.name = i18next.t("cards.faction_4_spell_sphere_of_darkness_name")
      card.setDescription(i18next.t("cards.faction_4_spell_sphere_of_darkness_description"))
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.canTargetGeneral = false
      card.addKeywordClassToInclude(ModifierStackingShadows)
      card.manaCost = 2
      card.drawCardsPostPlay = 1
      card.cardDataOrIndexToSpawn = {id: Cards.Tile.Shadow}
      card.setTargetsSpace(true)
      card.setFXResource(["FX.Cards.Spell.SphereOfDarkness"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_makantorwarbeast_attack_impact.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconSphereOfDarknessIdle.name
        active : RSX.iconSphereOfDarknessActive.name
      )

    if (identifier == Cards.Spell.EchoingShriek)
      card = new SpellEchoingShriek(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction4
      card.id = Cards.Spell.EchoingShriek
      card.name = i18next.t("cards.faction_4_spell_echoing_shriek_name")
      card.setDescription(i18next.t("cards.faction_4_spell_echoing_shriek_description"))
      card.manaCost = 2
      card.rarityId = Rarity.Epic
      card.spellFilterType = SpellFilterType.NeutralIndirect
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.durationEndTurn = 2
      card.cardDataOrIndexToSpawn = {id: Cards.Faction4.Wraithling}
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.EchoingShriek"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_darktransformation.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconEchoingShriekIdle.name
        active : RSX.iconEchoingShriekActive.name
      )

    if (identifier == Cards.Spell.VoidSteal)
      card = new SpellVoidSteal(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction4
      card.id = Cards.Spell.VoidSteal
      card.name = i18next.t("cards.faction_4_spell_void_steal_name")
      card.setDescription(i18next.t("cards.faction_4_spell_void_steal_description"))
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      card.spellFilterType = SpellFilterType.EnemyDirect
      enemyBuffContextObject = Modifier.createContextObjectWithAttributeBuffs(-3,0)
      enemyBuffContextObject.appliedName = i18next.t("modifiers.faction_4_spell_void_steal_1")
      card.targetModifiersContextObjects = [enemyBuffContextObject]
      card.allyBuffContextObject = Modifier.createContextObjectWithAttributeBuffs(3,0)
      card.allyBuffContextObject.appliedName = i18next.t("modifiers.faction_4_spell_void_steal_2")
      card.setFXResource(["FX.Cards.Spell.VoidSteal"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_voidpulse02.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconVoidStealIdle.name
        active : RSX.iconVoidStealActive.name
      )

    if (identifier == Cards.Spell.VeilOfUnraveling)
      card = new SpellVeilOfUnraveling(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction4
      card.id = Cards.Spell.VeilOfUnraveling
      card.name = i18next.t("cards.faction_4_spell_obliterate_name")
      card.setDescription(i18next.t("cards.faction_4_spell_obliterate_description"))
      card.manaCost = 8
      card.rarityId = Rarity.Legendary
      card.addKeywordClassToInclude(ModifierStackingShadows)
      card.spellFilterType = SpellFilterType.EnemyIndirect
      card.canTargetGeneral = true
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.setFXResource(["FX.Cards.Spell.Obliterate"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_flashreincarnation.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconVeilOfUnravelingIdle.name
        active : RSX.iconVeilOfUnravelingActive.name
      )

    if (identifier == Cards.Artifact.GhostAzalea)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction4
      card.id = Cards.Artifact.GhostAzalea
      card.name = i18next.t("cards.faction_4_artifact_ghost_azalea_name")
      card.setDescription(i18next.t("cards.faction_4_artifact_ghost_azalea_description"))
      card.addKeywordClassToInclude(ModifierStackingShadows)
      card.manaCost = 4
      card.rarityId = Rarity.Legendary
      card.durability = 3
      card.setTargetModifiersContextObjects([
        ModifierDynamicCountModifySelfByShadowTilesOnBoard.createContextObject(1,0,i18next.t("modifiers.plus_attack_key",{amount:1}),i18next.t("modifiers.faction_4_artifact_ghost_azalea_1"),{
          name: i18next.t("cards.faction_4_artifact_ghost_azalea_name")
          description: i18next.t("cards.faction_4_artifact_ghost_azalea_description")
        })
      ])
      card.setFXResource(["FX.Cards.Artifact.GhostAzalea"])
      card.setBaseAnimResource(
        idle: RSX.iconGhostAzaleaIdle.name
        active: RSX.iconGhostAzaleaActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    return card

module.exports = CardFactory_ShimzarSet_Faction4
