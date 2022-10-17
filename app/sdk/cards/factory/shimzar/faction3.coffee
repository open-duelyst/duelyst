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
SpellAstralFlood = require 'app/sdk/spells/spellAstralFlood'
SpellWhisperOfTheSands = require 'app/sdk/spells/spellWhisperOfTheSands'
SpellPsychicConduit = require 'app/sdk/spells/spellPsychicConduit'
SpellCircleOfDesiccation = require 'app/sdk/spells/spellCircleOfDesiccation'
SpellCorpseCombustion = require 'app/sdk/spells/spellCorpseCombustion'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierImmuneToDamage = require 'app/sdk/modifiers/modifierImmuneToDamage'
ModifierManaCostChange = require 'app/sdk/modifiers/modifierManaCostChange'
ModifierPortal = require 'app/sdk/modifiers/modifierPortal'
ModifierDyingWishSpawnEntity = require 'app/sdk/modifiers/modifierDyingWishSpawnEntity'
ModifierStartTurnWatchSummonDervish = require 'app/sdk/modifiers/modifierStartTurnWatchSummonDervish'
ModifierOpeningGambitApplyModifiersRandomly = require 'app/sdk/modifiers/modifierOpeningGambitApplyModifiersRandomly'
ModifierImmuneToSpellDamage = require 'app/sdk/modifiers/modifierImmuneToSpellDamage'
ModifierSummonWatchFromActionBarByOpeningGambitBuffSelf = require 'app/sdk/modifiers/modifierSummonWatchFromActionBarByOpeningGambitBuffSelf'
ModifierSummonWatchFromActionBarByOpeningGambitBuffSelf = require 'app/sdk/modifiers/modifierSummonWatchFromActionBarByOpeningGambitBuffSelf'
ModifierOpeningGambitApplyModifiersRandomly = require 'app/sdk/modifiers/modifierOpeningGambitApplyModifiersRandomly'
ModifierImmuneToSpellDamage = require 'app/sdk/modifiers/modifierImmuneToSpellDamage'
ModifierOpeningGambitApplyModifiersToHand = require 'app/sdk/modifiers/modifierOpeningGambitApplyModifiersToHand'
ModifierBattlePet = require 'app/sdk/modifiers/modifierBattlePet'
ModifierOpeningGambitApplyModifiersToGeneral = require 'app/sdk/modifiers/modifierOpeningGambitApplyModifiersToGeneral'
ModifierTakeDamageWatchDestroy = require 'app/sdk/modifiers/modifierTakeDamageWatchDestroy'
ModifierDyingWishSpawnRandomEntity = require 'app/sdk/modifiers/modifierDyingWishSpawnRandomEntity'
ModifierTakeDamageWatchSpawnEntity = require 'app/sdk/modifiers/modifierTakeDamageWatchSpawnEntity'
ModifierPantheran = require 'app/sdk/modifiers/modifierPantheran'
ModifierEndTurnWatchSwapAllegiance = require 'app/sdk/modifiers/modifierEndTurnWatchSwapAllegiance'
ModifierKillWatchSpawnEnemyEntity = require 'app/sdk/modifiers/modifierKillWatchSpawnEnemyEntity'
ModifierEndEveryTurnWatchDamageOwner = require 'app/sdk/modifiers/modifierEndEveryTurnWatchDamageOwner'
ModifierDyingWishDispelNearestEnemy = require 'app/sdk/modifiers/modifierDyingWishDispelNearestEnemy'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'
ModifierToken = require 'app/sdk/modifiers/modifierToken'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_ShimzarSet_Faction3

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->

    if (identifier == Cards.Faction3.Pantheran)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction3
      card.name = i18next.t("cards.faction_3_unit_pantheran_name")
      card.setDescription(i18next.t("cards.faction_3_unit_pantheran_desc"))
      card.setFXResource(["FX.Cards.Faction3.Pantheran"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_ghostlightning.audio
        walk : RSX.sfx_neutral_silitharveteran_death.audio
        attack : RSX.sfx_neutral_makantorwarbeast_attack_swing.audio
        receiveDamage : RSX.sfx_f6_boreanbear_hit.audio
        attackDamage : RSX.sfx_f6_boreanbear_attack_impact.audio
        death : RSX.sfx_f6_boreanbear_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f3OnyxPantheranBreathing.name
        idle : RSX.f3OnyxPantheranIdle.name
        walk : RSX.f3OnyxPantheranRun.name
        attack : RSX.f3OnyxPantheranAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.f3OnyxPantheranDamage.name
        death : RSX.f3OnyxPantheranDeath.name
      )
      card.atk = 8
      card.maxHP = 8
      card.manaCost = 6
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([ModifierPantheran.createContextObject()])

    if (identifier == Cards.Faction3.Falcius)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction3
      card.name = i18next.t("cards.faction_3_unit_falcius_name")
      card.setDescription(i18next.t("cards.faction_3_unit_falcius_desc"))
      card.setFXResource(["FX.Cards.Faction3.Falcius"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_ghostlightning.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_neutral_silitharveteran_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_silitharveteran_hit.audio
        attackDamage : RSX.sfx_neutral_silitharveteran_attack_impact.audio
        death : RSX.sfx_neutral_silitharveteran_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f3FalciusBreathing.name
        idle : RSX.f3FalciusIdle.name
        walk : RSX.f3FalciusRun.name
        attack : RSX.f3FalciusAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.0
        damage : RSX.f3FalciusHit.name
        death : RSX.f3FalciusDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 4
      card.rarityId = Rarity.Common
      buffContextObject = Modifier.createContextObjectWithAttributeBuffs(2,0)
      buffContextObject.appliedName = i18next.t("modifiers.faction_3_falcius_buff_name")
      buffContextObject.durationEndTurn = 1
      immunityContextObject = ModifierImmuneToDamage.createContextObject()
      immunityContextObject.durationEndTurn = 1
      card.setInherentModifiersContextObjects([ModifierOpeningGambitApplyModifiersToGeneral.createContextObject([buffContextObject, immunityContextObject], true, false, "Your General gains +2 Attack and takes no damage this turn")])

    if (identifier == Cards.Faction3.Rae)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction3
      card.name = i18next.t("cards.faction_3_unit_rae_name")
      card.setDescription(i18next.t("cards.faction_3_unit_rae_desc"))
      card.raceId = Races.BattlePet
      card.setFXResource(["FX.Cards.Neutral.Nip"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_ghostlightning.audio
        walk : RSX.sfx_spell_icepillar_melt.audio
        attack : RSX.sfx_neutral_coiledcrawler_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_coiledcrawler_hit.audio
        attackDamage : RSX.sfx_neutral_coiledcrawler_attack_impact.audio
        death : RSX.sfx_neutral_coiledcrawler_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f3RaeBreathing.name
        idle : RSX.f3RaeIdle.name
        walk : RSX.f3RaeRun.name
        attack : RSX.f3RaeAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.f3RaeHit.name
        death : RSX.f3RaeDeath.name
      )
      card.atk = 1
      card.maxHP = 1
      card.manaCost = 0
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierBattlePet.createContextObject(), ModifierDyingWishDispelNearestEnemy.createContextObject()])

    if (identifier == Cards.Faction3.Pax)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction3
      card.name = i18next.t("cards.faction_3_unit_pax_name")
      card.setDescription(i18next.t("cards.faction_3_unit_pax_desc"))
      card.raceId = Races.BattlePet
      card.setFXResource(["FX.Cards.Neutral.Nip"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_ghostlightning.audio
        walk : RSX.sfx_spell_polymorph.audio
        attack : RSX.sfx_neutral_sai_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_sai_hit.audio
        attackDamage : RSX.sfx_neutral_sai_attack_impact.audio
        death : RSX.sfx_neutral_sai_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f3PaxBreathing.name
        idle : RSX.f3PaxIdle.name
        walk : RSX.f3PaxRun.name
        attack : RSX.f3PaxAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.f3PaxHit.name
        death : RSX.f3PaxDeath.name
      )
      card.atk = 2
      card.maxHP = 1
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierBattlePet.createContextObject(), ModifierDyingWishSpawnEntity.createContextObject({id: Cards.Faction3.IronDervish}, "two 2/2 Iron Dervishes", 2, CONFIG.PATTERN_3x3)])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Faction3.WindSlicer)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction3
      card.name = i18next.t("cards.faction_3_unit_wind_slicer_name")
      card.setDescription(i18next.t("cards.faction_3_unit_wind_slicer_desc"))
      card.setFXResource(["FX.Cards.Neutral.Sojourner"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_ghostlightning.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_voiceofthewind_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_prophetofthewhite_hit.audio
        attackDamage : RSX.sfx_neutral_prophetofthewhite_impact.audio
        death : RSX.sfx_neutral_prophetofthewhite_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f3ZephyrBreathing.name
        idle : RSX.f3ZephyrIdle.name
        walk : RSX.f3ZephyrRun.name
        attack : RSX.f3ZephyrAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.f3ZephyrHit.name
        death : RSX.f3ZephyrDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 2
      contextObject = ModifierManaCostChange.createContextObject(-1)
      card.setInherentModifiersContextObjects([ModifierOpeningGambitApplyModifiersToHand.createContextObjectToTargetOwnPlayer([contextObject], false, CardType.Unit, Races.Structure, "Lower the cost of all Structure minions in your action bar by 1")])
      card.rarityId = Rarity.Rare

    if (identifier == Cards.Faction3.SoulburnObelysk)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction3
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.faction_3_unit_soulburn_obelysk_name")
      card.setDescription(i18next.t("cards.faction_3_unit_soulburn_obelysk_desc"))
      card.raceId = Races.Structure
      card.setFXResource(["FX.Cards.Faction3.BrazierDuskWind"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_divinebond.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_monsterdreamoracle_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_monsterdreamoracle_hit.audio
        attackDamage : RSX.sfx_f1_general_attack_impact.audio
        death : RSX.sfx_neutral_golembloodshard_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f3ObeliskSoulburnBreathing.name
        idle : RSX.f3ObeliskSoulburnIdle.name
        walk : RSX.f3ObeliskSoulburnIdle.name
        attack : RSX.f3ObeliskSoulburnAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.f3ObeliskSoulburnDamage.name
        death : RSX.f3ObeliskSoulburnDeath.name
      )
      card.maxHP = 4
      card.atk = 0
      card.manaCost = 3
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([
        ModifierStartTurnWatchSummonDervish.createContextObject(),
        ModifierPortal.createContextObject(),
        ModifierTakeDamageWatchDestroy.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction3.Allomancer)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction3
      card.name = i18next.t("cards.faction_3_unit_allomancer_name")
      card.setDescription(i18next.t("cards.faction_3_unit_allomancer_desc"))
      card.setFXResource(["FX.Cards.Faction3.Allomancer"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_ghostlightning.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_windstopper_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_prophetofthewhite_hit.audio
        attackDamage : RSX.sfx_spell_blindscorch.audio
        death : RSX.sfx_neutral_prophetofthewhite_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f3AllomancerBreathing.name
        idle : RSX.f3AllomancerIdle.name
        walk : RSX.f3AllomancerRun.name
        attack : RSX.f3AllomancerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.f3AllomancerHit.name
        death : RSX.f3AllomancerDeath.name
      )
      card.atk = 4
      card.maxHP = 3
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      cardDataToSpawn = [
        {id: Cards.Faction3.BrazierRedSand },
        {id: Cards.Faction3.BrazierGoldenFlame },
        {id: Cards.Faction3.BrazierDuskWind },
        {id: Cards.Faction3.SoulburnObelysk },
        {id: Cards.Faction3.TrygonObelysk },
        {id: Cards.Faction3.LavastormObelysk },
        {id: Cards.Faction3.SimulacraObelysk }
      ]
      card.setInherentModifiersContextObjects([ModifierDyingWishSpawnRandomEntity.createContextObject(cardDataToSpawn, "random Obelysk")])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Faction3.Nimbus)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction3
      card.name = i18next.t("cards.faction_3_unit_nimbus_name")
      card.setDescription(i18next.t("cards.faction_3_unit_nimbus_desc"))
      card.setFXResource(["FX.Cards.Faction3.Nimbus"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_spell_icepillar_melt.audio
        attack : RSX.sfx_neutral_windstopper_attack_impact.audio
        receiveDamage : RSX.sfx_f6_icedryad_hit.audio
        attackDamage : RSX.sfx_neutral_spelljammer_attack_impact.audio
        death : RSX.sfx_neutral_windstopper_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f3NimbusBreathing.name
        idle : RSX.f3NimbusIdle.name
        walk : RSX.f3NimbusRun.name
        attack : RSX.f3NimbusAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f3NimbusHit.name
        death : RSX.f3NimbusDeath.name
      )
      card.atk = 3
      card.maxHP = 8
      card.manaCost = 5
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([
        ModifierTakeDamageWatchSpawnEntity.createContextObject({id: Cards.Faction3.SoulburnObelysk}, "a Soulburn Obelysk")
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Faction3.PlagueTotem)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction3
      card.name = i18next.t("cards.faction_3_unit_bloodfire_totem_name")
      card.setDescription(i18next.t("cards.faction_3_unit_bloodfire_totem_desc"))
      card.setIsHiddenInCollection(true)
      card.raceId = Races.Structure
      card.setFXResource(["FX.Cards.Faction3.BrazierDuskWind"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_divinebond.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_monsterdreamoracle_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_monsterdreamoracle_hit.audio
        attackDamage : RSX.sfx_f1_general_attack_impact.audio
        death : RSX.sfx_neutral_golembloodshard_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f3PlagueTotemBreathing.name
        idle : RSX.f3PlagueTotemIdle.name
        walk : RSX.f3PlagueTotemIdle.name
        attack : RSX.f3PlagueTotemAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.f3PlagueTotemHit.name
        death : RSX.f3PlagueTotemDeath.name
      )
      card.maxHP = 4
      card.atk = 0
      card.manaCost = 2
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([
        ModifierPortal.createContextObject(),
        ModifierEndEveryTurnWatchDamageOwner.createContextObject(1)
      ])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Spell.AstralFlood)
      card = new SpellAstralFlood(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction3
      card.id = Cards.Spell.AstralFlood
      card.name = i18next.t("cards.faction_3_spell_astral_flood_name")
      card.setDescription(i18next.t("cards.faction_3_spell_astral_flood_description"))
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.setFXResource(["FX.Cards.Spell.AstralFlood"])
      card.spellFilterType = SpellFilterType.NeutralIndirect
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_scionsfirstwish.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconAstralFloodIdle.name
        active : RSX.iconAstralFloodActive.name
      )

    if (identifier == Cards.Spell.WhisperOfTheSands)
      card = new SpellWhisperOfTheSands(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction3
      card.id = Cards.Spell.WhisperOfTheSands
      card.name = i18next.t("cards.faction_3_spell_whisper_of_the_sands_name")
      card.setDescription(i18next.t("cards.faction_3_spell_whisper_of_the_sands_description"))
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.DervishCast"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_starsfury.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconWhisperOfTheSandsIdle.name
        active : RSX.iconWhisperOfTheSandsActive.name
      )

    if (identifier == Cards.Spell.PsychicConduit)
      card = new SpellPsychicConduit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction3
      card.id = Cards.Spell.PsychicConduit
      card.name = i18next.t("cards.faction_3_spell_psychic_conduit_name")
      card.setDescription(i18next.t("cards.faction_3_spell_psychic_conduit_description"))
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      card.maxAttack = 2
      swapAllegianceContextObject = ModifierEndTurnWatchSwapAllegiance.createContextObject()
      swapAllegianceContextObject.durationEndTurn = 1
      swapAllegianceContextObject.isRemovable = false
      card.setTargetModifiersContextObjects([
        swapAllegianceContextObject
      ])
      card.setFXResource(["FX.Cards.Spell.PsychicConduit"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_voidpulse.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconPsychicConduitIdle.name
        active : RSX.iconPsychicConduitActive.name
      )

    if (identifier == Cards.Spell.CorpseCombustion)
      card = new SpellCorpseCombustion(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction3
      card.id = Cards.Spell.CorpseCombustion
      card.name = i18next.t("cards.faction_3_spell_corpse_combustion_name")
      card.setDescription(i18next.t("cards.faction_3_spell_corpse_combustion_description"))
      card.manaCost = 5
      card.rarityId = Rarity.Epic
      card.setFXResource(["FX.Cards.Spell.CosmicFlesh"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_voidpulse.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconCorpseCombustionIdle.name
        active : RSX.iconCorpseCombustionActive.name
      )

    if (identifier == Cards.Spell.CircleOfDesiccation)
      card = new SpellCircleOfDesiccation(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction3
      card.id = Cards.Spell.CircleOfDesiccation
      card.name = i18next.t("cards.faction_3_spell_circle_of_desiccation_name")
      card.setDescription(i18next.t("cards.faction_3_spell_circle_of_desiccation_description"))
      card.manaCost = 8
      card.rarityId = Rarity.Legendary
      card.spellFilterType = SpellFilterType.NeutralIndirect
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.setFXResource(["FX.Cards.Spell.CircleOfDesiccation"])
      card.setBaseAnimResource(
        idle : RSX.iconCircleOfDessicationIdle.name
        active : RSX.iconCircleOfDessicationActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_boneswarm.audio
      )

    if (identifier == Cards.Artifact.Spinecleaver)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction3
      card.id = Cards.Artifact.Spinecleaver
      card.name = i18next.t("cards.faction_3_artifact_spinecleaver_name")
      card.setDescription(i18next.t("cards.faction_3_artifact_spinecleaver_description"))
      card.manaCost = 5
      card.rarityId = Rarity.Legendary
      card.durability = 3
      card.setTargetModifiersContextObjects([
        Modifier.createContextObjectWithAttributeBuffs(1,0,{
          name: i18next.t("cards.faction_3_artifact_spinecleaver_name")
          description: i18next.t("modifiers.plus_attack_key",{amount:1})
        }),
        ModifierKillWatchSpawnEnemyEntity.createContextObject({id: Cards.Faction3.PlagueTotem}, false, false, 1, CONFIG.PATTERN_1x1, true,{
          name: i18next.t("cards.faction_3_artifact_spinecleaver_name")
          description: i18next.t("modifiers.faction_3_artifact_spinecleaver_1")
        })
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Artifact.StaffOfYKir"])
      card.setBaseAnimResource(
        idle: RSX.iconSpinecleaverIdle.name
        active: RSX.iconSpinecleaverActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    return card

module.exports = CardFactory_ShimzarSet_Faction3
