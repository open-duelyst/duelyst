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

SpellFilterType = require 'app/sdk/spells/spellFilterType'
SpellApplyModifiers = require 'app/sdk/spells/spellApplyModifiers'
SpellDamage = require 'app/sdk/spells/spellDamage'

ModifierOpeningGambitSpawnEnemyMinionNearOpponent = require 'app/sdk/modifiers/modifierOpeningGambitSpawnEnemyMinionNearOpponent'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'
ModifierEnemySpellWatchCopySpell = require 'app/sdk/modifiers/modifierEnemySpellWatchCopySpell'
ModifierOpeningGambitPutCardInHand = require 'app/sdk/modifiers/modifierOpeningGambitPutCardInHand'
ModifierImmuneToAttacks = require 'app/sdk/modifiers/modifierImmuneToAttacks'
ModifierOpeningGambitRemoveArtifactToDrawArtifactFromFaction = require 'app/sdk/modifiers/modifierOpeningGambitRemoveArtifactToDrawArtifactFromFaction'
ModifierFrenzy = require 'app/sdk/modifiers/modifierFrenzy'
ModifierWildTahr = require 'app/sdk/modifiers/modifierWildTahr'
ModifierCannotCastSpellsByCost = require 'app/sdk/modifiers/modifierCannotCastSpellsByCost'
ModifierKillWatchBounceEnemyToActionBar = require 'app/sdk/modifiers/modifierKillWatchBounceEnemyToActionBar'
ModifierRanged = require 'app/sdk/modifiers/modifierRanged'
ModifierMyGeneralAttackWatchSpawnEntity = require 'app/sdk/modifiers/modifierMyGeneralAttackWatchSpawnEntity'
ModifierFirstBlood = require 'app/sdk/modifiers/modifierFirstBlood'
ModifierOpeningGambitReplaceHand = require 'app/sdk/modifiers/modifierOpeningGambitReplaceHand'
ModifierDealDamageWatchDamageJoinedEnemies = require 'app/sdk/modifiers/modifierDealDamageWatchDamageJoinedEnemies'
ModifierOpeningGambitSpawnPartyAnimals = require 'app/sdk/modifiers/modifierOpeningGambitSpawnPartyAnimals'
ModifierDealDamageWatchIfMinionHealMyGeneral = require 'app/sdk/modifiers/modifierDealDamageWatchIfMinionHealMyGeneral'
ModifierSprigginDiesBuffSelf = require 'app/sdk/modifiers/modifierSprigginDiesBuffSelf'
ModifierSituationalBuffSelfIfSpriggin = require 'app/sdk/modifiers/modifierSituationalBuffSelfIfSpriggin'
ModifierCustomSpawnOnOtherUnit = require 'app/sdk/modifiers/modifierCustomSpawnOnOtherUnit'
ModifierOpeningGambitDagona = require 'app/sdk/modifiers/modifierOpeningGambitDagona'
ModifierDyingWishDagona = require 'app/sdk/modifiers/modifierDyingWishDagona'
ModifierMyAttackWatchGamble = require 'app/sdk/modifiers/modifierMyAttackWatchGamble'
ModifierProvoke = require 'app/sdk/modifiers/modifierProvoke'
ModifierToken = require 'app/sdk/modifiers/modifierToken'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_FirstWatchSet_Neutral

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Neutral.Carcynus)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_carcynus_name")
      card.setFXResource(["FX.Cards.Neutral.EXun"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_neutral_komodocharger_hit.audio
        attack : RSX.sfx_neutral_sunelemental_death.audio
        receiveDamage : RSX.sfx_neutral_swornavenger_hit.audio
        attackDamage : RSX.sfx_f2lanternfox_death.audio
        death : RSX.sfx_neutral_daggerkiri_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralGiantCrabBreathing.name
        idle : RSX.neutralGiantCrabIdle.name
        walk : RSX.neutralGiantCrabRun.name
        attack : RSX.neutralGiantCrabAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralGiantCrabHit.name
        death : RSX.neutralGiantCrabDeath.name
      )
      card.atk = 1
      card.maxHP = 5
      card.manaCost = 2
      card.rarityId = Rarity.Common

    if (identifier == Cards.Neutral.RazorcragGolem)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_razorcrag_golem_name")
      card.raceId = Races.Golem
      card.setFXResource(["FX.Cards.Neutral.RazorcragGolem"])
      card.setBoundingBoxWidth(80)
      card.setBoundingBoxHeight(95)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_stormmetalgolem_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_stormmetalgolem_hit.audio
        attackDamage : RSX.sfx_neutral_stormmetalgolem_attack_impact.audio
        death : RSX.sfx_neutral_stormmetalgolem_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralRazorcragGolemBreathing.name
        idle : RSX.neutralRazorcragGolemIdle.name
        walk : RSX.neutralRazorcragGolemRun.name
        attack : RSX.neutralRazorcragGolemAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralRazorcragGolemHit.name
        death : RSX.neutralRazorcragGolemDeath.name
      )
      card.atk = 10
      card.maxHP = 3
      card.manaCost = 4
      card.rarityId = Rarity.Common

    if (identifier == Cards.Neutral.KomodoHunter)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_komodo_hunter_name")
      card.setDescription(i18next.t("cards.neutral_komodo_hunter_desc"))
      card.setFXResource(["FX.Cards.Neutral.AstralCrusader"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_neutral_primordialgazer_death.audio
        attack : RSX.sfx_neutral_makantorwarbeast_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_makantorwarbeast_hit.audio
        attackDamage : RSX.sfx_neutral_makantorwarbeast_attack_impact.audio
        death : RSX.sfx_neutral_makantorwarbeast_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralKomodoKinBreathing.name
        idle : RSX.neutralKomodoKinIdle.name
        walk : RSX.neutralKomodoKinRun.name
        attack : RSX.neutralKomodoKinAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralKomodoKinHit.name
        death : RSX.neutralKomodoKinDeath.name
      )
      card.atk = 5
      card.maxHP = 6
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierOpeningGambitSpawnEnemyMinionNearOpponent.createContextObject({id: Cards.Neutral.KomodoCharger}, 2)])

    if (identifier == Cards.Neutral.Emberwyrm)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_emberwyrm_name")
      card.setDescription("Flying")
      card.setFXResource(["FX.Cards.Neutral.Unseven"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_fractalreplication.audio
        walk : RSX.sfx_neutral_ubo_attack_swing.audio
        attack : RSX.sfx_spell_blindscorch.audio
        receiveDamage : RSX.sfx_f1_oserix_hit.audio
        attackDamage : RSX.sfx_f2lanternfox_attack_impact.audio
        death : RSX.sfx_f6_draugarlord_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralVeteranFlamewingBreathing.name
        idle : RSX.neutralVeteranFlamewingIdle.name
        walk : RSX.neutralVeteranFlamewingRun.name
        attack : RSX.neutralVeteranFlamewingAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralVeteranFlamewingHit.name
        death : RSX.neutralVeteranFlamewingDeath.name
      )
      card.atk = 10
      card.maxHP = 7
      card.manaCost = 7
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierFlying.createContextObject()])

    if (identifier == Cards.Neutral.Magesworn)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_magesworn_name")
      card.setDescription(i18next.t("cards.neutral_magesworn_desc"))
      card.raceId = Races.Arcanyst
      card.setFXResource(["FX.Cards.Neutral.Magesworn"])
      card.setBoundingBoxWidth(80)
      card.setBoundingBoxHeight(105)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_arakiheadhunter_hit.audio
        attack : RSX.sfx_f6_boreanbear_attack_swing.audio
        receiveDamage : RSX.sfx_f6_boreanbear_hit.audio
        attackDamage : RSX.sfx_f6_boreanbear_attack_impact.audio
        death : RSX.sfx_f6_boreanbear_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralMageswornBreathing.name
        idle : RSX.neutralMageswornIdle.name
        walk : RSX.neutralMageswornRun.name
        attack : RSX.neutralMageswornAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralMageswornHit.name
        death : RSX.neutralMageswornDeath.name
      )
      card.atk = 3
      card.maxHP = 8
      card.manaCost = 6
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierCannotCastSpellsByCost.createContextObject(2)])

    if (identifier == Cards.Neutral.Rokadoptera)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_rokadoptera_name")
      card.setDescription(i18next.t("cards.neutral_rokadoptera_desc"))
      card.setFXResource(["FX.Cards.Neutral.DiamondGolem"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_icebeetle_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_golembloodshard_hit.audio
        attackDamage : RSX.sfx_neutral_golembloodshard_attack_impact.audio
        death : RSX.sfx_neutral_golembloodshard_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralBoulderHurlerBreathing.name
        idle : RSX.neutralBoulderHurlerIdle.name
        walk : RSX.neutralBoulderHurlerRun.name
        attack : RSX.neutralBoulderHurlerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralBoulderHurlerHit.name
        death : RSX.neutralBoulderHurlerDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierOpeningGambitPutCardInHand.createContextObject({id: Cards.Spell.BoulderHurl})])

    if (identifier == Cards.Spell.BoulderHurl)
      card = new SpellDamage(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.neutral_boulder_hurl_name")
      card.setDescription(i18next.t("cards.neutral_boulder_hurl_desc"))
      card.manaCost = 0
      card.damageAmount = 1
      card.canTargetGeneral = true
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.setFXResource(["FX.Cards.Spell.BoulderHurl"])
      card.setBaseAnimResource(
        idle: RSX.iconBoulderHurlIdle.name
        active: RSX.iconBoulderHurlActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_naturalselection.audio
      )

    if (identifier == Cards.Neutral.SinisterSilhouette)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_sinister_silhouette_name")
      card.setDescription(i18next.t("cards.neutral_sinister_silhouette_desc"))
      card.setFXResource(["FX.Cards.Neutral.PlanarScout"])
      card.setBoundingBoxWidth(65)
      card.setBoundingBoxHeight(40)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_beastphasehound_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_beastphasehound_hit.audio
        attackDamage : RSX.sfx_neutral_beastphasehound_attack_impact.audio
        death : RSX.sfx_neutral_beastphasehound_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralSinisterSilhouetteBreathing.name
        idle : RSX.neutralSinisterSilhouetteIdle.name
        walk : RSX.neutralSinisterSilhouetteRun.name
        attack : RSX.neutralSinisterSilhouetteAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralSinisterSilhouetteHit.name
        death : RSX.neutralSinisterSilhouetteDeath.name
      )
      card.atk = 1
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierImmuneToAttacks.createContextObject()])

    if (identifier == Cards.Neutral.MatterShaper)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_matter_shaper_name")
      card.setDescription(i18next.t("cards.neutral_matter_shaper_desc"))
      card.atk = 5
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Rare
      card.setFXResource(["FX.Cards.Neutral.EXun"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_f1_oserix_death.audio
        attack : RSX.sfx_neutral_firestarter_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_silitharveteran_hit.audio
        attackDamage : RSX.sfx_neutral_prophetofthewhite_death.audio
        death : RSX.sfx_neutral_daggerkiri_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralArtifactShaperBreathing.name
        idle : RSX.neutralArtifactShaperIdle.name
        walk : RSX.neutralArtifactShaperRun.name
        attack : RSX.neutralArtifactShaperAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralArtifactShaperHit.name
        death : RSX.neutralArtifactShaperDeath.name
      )
      card.setInherentModifiersContextObjects([ModifierOpeningGambitRemoveArtifactToDrawArtifactFromFaction.createContextObject()])

    if (identifier == Cards.Neutral.WildTahr)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_wild_tahr_name")
      card.setDescription(i18next.t("cards.neutral_wild_tahr_desc"))
      card.atk = 2
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([
        ModifierFrenzy.createContextObject(),
        ModifierWildTahr.createContextObject()
      ])
      card.setFXResource(["FX.Cards.Neutral.WildTahr"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_neutral_arakiheadhunter_hit.audio
        attack : RSX.sfx_f6_seismicelemental_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_golembloodshard_hit.audio
        attackDamage : RSX.sfx_f2lanternfox_death.audio
        death : RSX.sfx_f2lanternfox_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralWildTahrBreathing.name
        idle : RSX.neutralWildTahrIdle.name
        walk : RSX.neutralWildTahrRun.name
        attack : RSX.neutralWildTahrAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.neutralWildTahrHit.name
        death : RSX.neutralWildTahrDeath.name
      )

    if (identifier == Cards.Neutral.Quahog)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_quahog_name")
      card.setDescription(i18next.t("cards.neutral_quahog_desc"))
      card.atk = 7
      card.maxHP = 7
      card.manaCost = 5
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([
        ModifierKillWatchBounceEnemyToActionBar.createContextObject(false, false)
      ])
      card.setFXResource(["FX.Cards.Neutral.Quahog"])
      card.setBoundingBoxWidth(85)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f4_daemongate_attack_swing.audio
        receiveDamage : RSX.sfx_f4_daemongate_hit.audio
        attackDamage : RSX.sfx_f4_daemongate_attack_impact.audio
        death : RSX.sfx_f4_daemongate_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralQuahogBreathing.name
        idle : RSX.neutralQuahogIdle.name
        walk : RSX.neutralQuahogRun.name
        attack : RSX.neutralQuahogAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.3
        damage : RSX.neutralQuahogHit.name
        death : RSX.neutralQuahogDeath.name
      )

    if (identifier == Cards.Neutral.Letigress)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_letigress_name")
      card.setDescription(i18next.t("cards.neutral_letigress_desc"))
      card.atk = 2
      card.maxHP = 6
      card.manaCost = 5
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([
        ModifierRanged.createContextObject(),
        ModifierMyGeneralAttackWatchSpawnEntity.createContextObject({id: Cards.Neutral.TigerCub}, 1, CONFIG.PATTERN_3x3)
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Neutral.Letigress"])
      card.setBoundingBoxWidth(85)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_ladylocke_attack_impact.audio
        attack : RSX.sfx_f1_sunriser_attack_swing.audio
        receiveDamage : RSX.sfx_f1_sunriser_hit_noimpact.audio
        attackDamage : RSX.sfx_f1_sunriser_attack_impact.audio
        death : RSX.sfx_neutral_spiritscribe_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralLeTigressBreathing.name
        idle : RSX.neutralLeTigressIdle.name
        walk : RSX.neutralLeTigressRun.name
        attack : RSX.neutralLeTigressAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.neutralLeTigressHit.name
        death : RSX.neutralLeTigressDeath.name
      )

    if (identifier == Cards.Neutral.TigerCub)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_saberspine_cub_name")
      card.setDescription(i18next.t("cards.neutral_saberspine_cub_desc"))
      card.atk = 2
      card.maxHP = 1
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.setIsHiddenInCollection(true)
      card.setInherentModifiersContextObjects([
        ModifierFirstBlood.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierToken)
      card.setFXResource(["FX.Cards.Neutral.GhostLynx"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_neutral_grimrock_hit.audio
        attack : RSX.sfx_neutral_xho_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_xho_hit.audio
        attackDamage : RSX.sfx_neutral_xho_attack_impact.audio
        death : RSX.sfx_neutral_xho_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralTigerCubBreathing.name
        idle : RSX.neutralTigerCubIdle.name
        walk : RSX.neutralTigerCubRun.name
        attack : RSX.neutralTigerCubAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.neutralTigerCubHit.name
        death : RSX.neutralTigerCubDeath.name
      )

    if (identifier == Cards.Neutral.Theobule)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_theobule_name")
      card.setDescription(i18next.t("cards.neutral_theobule_desc"))
      card.setFXResource(["FX.Cards.Neutral.Shuffler"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_spell_icepillar_melt.audio
        attack : RSX.sfx_neutral_windstopper_attack_impact.audio
        receiveDamage : RSX.sfx_f6_icedryad_hit.audio
        attackDamage : RSX.sfx_neutral_spelljammer_attack_impact.audio
        death : RSX.sfx_neutral_windstopper_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralShufflerBreathing.name
        idle : RSX.neutralShufflerIdle.name
        walk : RSX.neutralShufflerRun.name
        attack : RSX.neutralShufflerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralShufflerHit.name
        death : RSX.neutralShufflerDeath.name
      )
      card.atk = 5
      card.maxHP = 6
      card.manaCost = 5
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierOpeningGambitReplaceHand.createContextObject()])

    if (identifier == Cards.Neutral.Thunderhorn)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_thunderhorn_name")
      card.setDescription(i18next.t("cards.neutral_thunderhorn_desc"))
      card.atk = 4
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([ModifierDealDamageWatchDamageJoinedEnemies.createContextObject()])
      card.setFXResource(["FX.Cards.Neutral.Unseven"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_neutral_arakiheadhunter_hit.audio
        attack : RSX.sfx_f6_seismicelemental_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_golembloodshard_hit.audio
        attackDamage : RSX.sfx_f2lanternfox_death.audio
        death : RSX.sfx_f2lanternfox_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralThunderhornBreathing.name
        idle : RSX.neutralThunderhornIdle.name
        walk : RSX.neutralThunderhornRun.name
        attack : RSX.neutralThunderhornAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.6
        damage : RSX.neutralThunderhornHit.name
        death : RSX.neutralThunderhornDeath.name
      )

    if (identifier == Cards.Neutral.Spriggin)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_spriggin_name")
      card.setDescription(i18next.t("cards.neutral_spriggin_desc"))
      card.atk = 8
      card.maxHP = 8
      card.manaCost = 6
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([
        ModifierOpeningGambitSpawnPartyAnimals.createContextObject(),
        ModifierProvoke.createContextObject()
        ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Neutral.TwilightMage"])
      card.setBoundingBoxWidth(50)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f2_jadeogre_attack_swing.audio
        receiveDamage : RSX.sfx_f3_dunecaster_hit.audio
        attackDamage : RSX.sfx_f3_dunecaster_impact.audio
        death : RSX.sfx_f3_dunecaster_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralPartyElfBreathing.name
        idle : RSX.neutralPartyElfIdle.name
        walk : RSX.neutralPartyElfRun.name
        attack : RSX.neutralPartyElfAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.3
        damage : RSX.neutralPartyElfHit.name
        death : RSX.neutralPartyElfDeath.name
      )

    if (identifier == Cards.Neutral.PartyAnimal1)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_glub_name")
      card.setDescription(i18next.t("cards.neutral_glub_desc"))
      card.atk = 1
      card.maxHP = 1
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.setIsHiddenInCollection(true)
      card.setInherentModifiersContextObjects([
        ModifierSprigginDiesBuffSelf.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierToken)
      card.setFXResource(["FX.Cards.Neutral.Spelljammer"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_waterelemental_attack_swing.audio
        receiveDamage : RSX.sfx_f6_waterelemental_hit.audio
        attackDamage : RSX.sfx_neutral_fog_attack_impact.audio
        death : RSX.sfx_neutral_fog_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.critter1Breathing.name
        idle : RSX.critter1Idle.name
        walk : RSX.critter1Run.name
        attack : RSX.critter1Attack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.critter1Hit.name
        death : RSX.critter1Death.name
      )

    if (identifier == Cards.Neutral.PartyAnimal2)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_binky_name")
      card.setDescription(i18next.t("cards.neutral_binky_desc"))
      card.atk = 2
      card.maxHP = 1
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.setIsHiddenInCollection(true)
      card.setInherentModifiersContextObjects([
        ModifierFlying.createContextObject(),
        ModifierDealDamageWatchIfMinionHealMyGeneral.createContextObject(2)
      ])
      card.addKeywordClassToInclude(ModifierToken)
      card.setFXResource(["FX.Cards.Neutral.PlanarScout"])
      card.setBoundingBoxWidth(65)
      card.setBoundingBoxHeight(40)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_beastphasehound_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_beastphasehound_hit.audio
        attackDamage : RSX.sfx_neutral_beastphasehound_attack_impact.audio
        death : RSX.sfx_neutral_beastphasehound_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.critter2Breathing.name
        idle : RSX.critter2Idle.name
        walk : RSX.critter2Run.name
        attack : RSX.critter2Attack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.critter2Hit.name
        death : RSX.critter2Death.name
      )

    if (identifier == Cards.Neutral.PartyAnimal3)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_zetta_name")
      card.setDescription(i18next.t("cards.neutral_zetta_desc"))
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.setIsHiddenInCollection(true)
      card.setInherentModifiersContextObjects([
        ModifierFrenzy.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierToken)
      card.setFXResource(["FX.Cards.Neutral.Icy"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_spell_polymorph.audio
        attack : RSX.sfx_neutral_sai_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_sai_hit.audio
        attackDamage : RSX.sfx_neutral_sai_attack_impact.audio
        death : RSX.sfx_neutral_sai_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.critterdBreathing.name
        idle : RSX.critterdIdle.name
        walk : RSX.critterdRun.name
        attack : RSX.critterdAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.critterdHit.name
        death : RSX.critterdDeath.name
      )

    if (identifier == Cards.Neutral.PartyAnimal4)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_moro_name")
      card.setDescription(i18next.t("cards.neutral_moro_desc"))
      card.atk = 0
      card.maxHP = 3
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.setIsHiddenInCollection(true)
      card.setInherentModifiersContextObjects([
        ModifierSituationalBuffSelfIfSpriggin.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierToken)
      card.setFXResource(["FX.Cards.Neutral.VineEntangler"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_komodocharger_attack_swing.audio
        receiveDamage : RSX.sfx_f6_ancientgrove_hit.audio
        attackDamage : RSX.sfx_f6_ancientgrove_attack_impact.audio
        death : RSX.sfx_f6_ancientgrove_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.crittercBreathing.name
        idle : RSX.crittercIdle.name
        walk : RSX.crittercRun.name
        attack : RSX.crittercAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.crittercHit.name
        death : RSX.crittercDeath.name
      )

    if (identifier == Cards.Neutral.DagonaFish)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setCardSetId(CardSet.FirstWatch)
      card.name = i18next.t("cards.neutral_dagona_name")
      card.setDescription(i18next.t("cards.neutral_dagona_desc"))
      card.setInherentModifiersContextObjects([
        ModifierCustomSpawnOnOtherUnit.createContextObject(), ModifierOpeningGambitDagona.createContextObject(), ModifierDyingWishDagona.createContextObject()
      ])
      card.setFXResource(["FX.Cards.Neutral.DagonaFish"])
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(80)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_boreanbear_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_hailstonehowler_hit.audio
        attackDamage : RSX.sfx_neutral_hailstonehowler_attack_impact.audio
        death : RSX.sfx_neutral_hailstonehowler_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralDagonaBreathing.name
        idle : RSX.neutralDagonaIdle.name
        walk : RSX.neutralDagonaRun.name
        attack : RSX.neutralDagonaAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralDagonaHit.name
        death : RSX.neutralDagonaDeath.name
      )
      card.atk = 8
      card.maxHP = 8
      card.manaCost = 8
      card.rarityId = Rarity.Legendary

    if (identifier == Cards.Neutral.Gambler)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setCardSetId(CardSet.FirstWatch)
      card.name = i18next.t("cards.neutral_bloodsworn_gambler_name")
      card.setDescription(i18next.t("cards.neutral_bloodsworn_gambler_desc"))
      card.setFXResource(["FX.Cards.Neutral.Gambler"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_firespitter_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_firespitter_hit.audio
        attackDamage : RSX.sfx_neutral_firespitter_attack_impact.audio
        death : RSX.sfx_neutral_firespitter_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralGamblerBreathing.name
        idle : RSX.neutralGamblerIdle.name
        walk : RSX.neutralGamblerRun.name
        attack : RSX.neutralGamblerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.neutralGamblerHit.name
        death : RSX.neutralGamblerDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([ModifierRanged.createContextObject(), ModifierMyAttackWatchGamble.createContextObject()])

    return card

module.exports = CardFactory_FirstWatchSet_Neutral
