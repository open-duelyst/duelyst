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
SpellApplyModifiers = require 'app/sdk/spells/spellApplyModifiers'
SpellRazorSkin = require 'app/sdk/spells/spellRazorSkin'
SpellLavaLance = require 'app/sdk/spells/spellLavaLance'
SpellNaturesConfluence = require 'app/sdk/spells/spellNaturesConfluence'
SpellFlamingStampede = require 'app/sdk/spells/spellFlamingStampede'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierManaCostChange = require 'app/sdk/modifiers/modifierManaCostChange'
ModifierOpeningGambit = require 'app/sdk/modifiers/modifierOpeningGambit'
ModifierGrow = require 'app/sdk/modifiers/modifierGrow'
ModifierRebirth = require 'app/sdk/modifiers/modifierRebirth'
ModifierBattlePet = require 'app/sdk/modifiers/modifierBattlePet'
ModifierAnyDrawCardWatchBuffSelf = require 'app/sdk/modifiers/modifierAnyDrawCardWatchBuffSelf'
ModifierGrowOnBothTurns = require 'app/sdk/modifiers/modifierGrowOnBothTurns'
ModifierAnySummonWatchFromActionBarApplyModifiersToSelf = require 'app/sdk/modifiers/modifierAnySummonWatchFromActionBarApplyModifiersToSelf'
ModifierSummonWatchDreadnaught = require 'app/sdk/modifiers/modifierSummonWatchDreadnaught'
ModifierRemoveAndReplaceEntity = require 'app/sdk/modifiers/modifierRemoveAndReplaceEntity'
ModifierDealDamageWatchHatchEggs = require 'app/sdk/modifiers/modifierDealDamageWatchHatchEggs'
ModifierToken = require 'app/sdk/modifiers/modifierToken'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_ShimzarSet_Faction5

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction5.Gro)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_gro_name")
      card.setDescription(i18next.t("cards.faction_5_unit_gro_desc"))
      card.raceId = Races.BattlePet
      card.setFXResource(["FX.Cards.Neutral.Gro"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_earthwalker_death.audio
        walk : RSX.sfx_neutral_grimrock_hit.audio
        attack :  RSX.sfx_neutral_gro_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_gro_hit.audio
        attackDamage : RSX.sfx_neutral_gro_attack_impact.audio
        death : RSX.sfx_neutral_gro_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5GroBreathing.name
        idle : RSX.f5GroIdle.name
        walk : RSX.f5GroRun.name
        attack : RSX.f5GroAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.f5GroHit.name
        death : RSX.f5GroDeath.name
      )
      card.atk = 2
      card.maxHP = 4
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierBattlePet.createContextObject(), ModifierGrow.createContextObject(1)])

    if (identifier == Cards.Faction5.Rex)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_rex_name")
      card.setDescription(i18next.t("cards.faction_5_unit_rex_desc"))
      card.raceId = Races.BattlePet
      card.setFXResource(["FX.Cards.Faction5.Rex"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_earthwalker_death.audio
        walk : RSX.sfx_neutral_grimrock_hit.audio
        attack :  RSX.sfx_neutral_gro_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_gro_hit.audio
        attackDamage : RSX.sfx_neutral_gro_attack_impact.audio
        death : RSX.sfx_neutral_gro_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5RexBreathing.name
        idle : RSX.f5RexIdle.name
        walk : RSX.f5RexRun.name
        attack : RSX.f5RexAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.f5RexHit.name
        death : RSX.f5RexDeath.name
      )
      card.atk = 3
      card.maxHP = 1
      card.manaCost = 1
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierBattlePet.createContextObject(), ModifierRebirth.createContextObject()])

    if (identifier == Cards.Faction5.Kin)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction5
      card.raceId = Races.BattlePet
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.faction_5_unit_kin_name")
      card.setFXResource(["FX.Cards.Faction5.Kin"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f6_voiceofthewind_attack_swing.audio
        walk : RSX.sfx_spell_polymorph.audio
        attack : RSX.sfx_neutral_amu_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_amu_hit.audio
        attackDamage : RSX.sfx_neutral_amu_attack_impact.audio
        death : RSX.sfx_neutral_amu_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralKinBreathing.name
        idle : RSX.neutralKinIdle.name
        walk : RSX.neutralKinRun.name
        attack : RSX.neutralKinAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.neutralKinHit.name
        death : RSX.neutralKinDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierBattlePet.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction5.WildInceptor)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_wild_inceptor_name")
      card.setDescription(i18next.t("cards.faction_5_unit_wild_inceptor_desc"))
      card.setFXResource(["FX.Cards.Neutral.Spelljammer"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_spell_icepillar_melt.audio
        attack : RSX.sfx_neutral_firestarter_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_firestarter_hit.audio
        attackDamage : RSX.sfx_neutral_firestarter_impact.audio
        death : RSX.sfx_neutral_firestarter_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5WildInceptorBreathing.name
        idle : RSX.f5WildInceptorIdle.name
        walk : RSX.f5WildInceptorRun.name
        attack : RSX.f5WildInceptorAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f5WildInceptorHit.name
        death : RSX.f5WildInceptorDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 4
      card.rarityId = Rarity.Common
      card.setFollowups([
        {
          id: Cards.Spell.HatchAnEgg
          spellFilterType: SpellFilterType.AllyDirect
        }
      ])
      card.addKeywordClassToInclude(ModifierOpeningGambit)

    if (identifier == Cards.Faction5.MolokiHuntress)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_moloki_huntress_name")
      card.setDescription(i18next.t("cards.faction_5_unit_moloki_huntress_desc"))
      card.setFXResource(["FX.Cards.Faction5.MolokiHuntress"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_spell_icepillar_melt.audio
        attack : RSX.sfx_f2_celestialphantom_death.audio
        receiveDamage : RSX.sfx_f6_waterelemental_hit.audio
        attackDamage : RSX.sfx_f6_waterelemental_attack_impact.audio
        death : RSX.sfx_neutral_spiritscribe_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5MolokiHuntressBreathing.name
        idle : RSX.f5MolokiHuntressIdle.name
        walk : RSX.f5MolokiHuntressRun.name
        attack : RSX.f5MolokiHuntressAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f5MolokiHuntressHit.name
        death : RSX.f5MolokiHuntressDeath.name
      )
      card.atk = 1
      card.maxHP = 2
      card.manaCost = 3
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([ModifierGrow.createContextObject(1), Modifier.createContextObjectWithAuraForAllAlliesAndSelf([ModifierGrowOnBothTurns.createContextObject()], null, null, null, "Friendly minions grow at the start of BOTH player\'s turns")])

    if (identifier == Cards.Faction5.Dreadnaught)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_dreadnought_name")
      card.setDescription(i18next.t("cards.faction_5_unit_dreadnought_desc"))
      card.setFXResource(["FX.Cards.Faction5.Dreadnaught"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_silitharveteran_death.audio
        attack : RSX.sfx_neutral_rook_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_makantorwarbeast_hit.audio
        attackDamage : RSX.sfx_neutral_silitharveteran_attack_impact.audio
        death : RSX.sfx_neutral_makantorwarbeast_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5DreadnaughtBreathing.name
        idle : RSX.f5DreadnaughtIdle.name
        walk : RSX.f5DreadnaughtRun.name
        attack : RSX.f5DreadnaughtAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f5DreadnaughtHit.name
        death : RSX.f5DreadnaughtDeath.name
      )
      card.atk = 4
      card.maxHP = 7
      card.manaCost = 6
      card.rarityId = Rarity.Legendary
      buffContextObject = Modifier.createContextObjectWithAttributeBuffs(2,2)
      buffContextObject.appliedName = i18next.t("modifiers.faction_5_dreadnought_buff_name")
      card.setInherentModifiersContextObjects([ModifierRebirth.createContextObject(), ModifierSummonWatchDreadnaught.createContextObject([buffContextObject],[Cards.Faction5.Egg], "Egg minions", "gain +2/+2")])

    if (identifier == Cards.Faction5.Mandrake)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_mandrake_name")
      card.setDescription(i18next.t("cards.faction_5_unit_mandrake_desc"))
      card.setFXResource(["FX.Cards.Faction5.Mandrake"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_bluetipscorpion_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_silitharveteran_death.audio
        attackDamage : RSX.sfx_f1windbladecommanderattack_impact.audio
        death : RSX.sfx_f6_waterelemental_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5MandrakeBreathing.name
        idle : RSX.f5MandrakeIdle.name
        walk : RSX.f5MandrakeRun.name
        attack : RSX.f5MandrakeAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.0
        damage : RSX.f5MandrakeHit.name
        death : RSX.f5MandrakeDeath.name
      )
      card.atk = 6
      card.maxHP = 6
      card.manaCost = 12
      card.rarityId = Rarity.Rare
      buffContextObject = ModifierManaCostChange.createContextObject(-1)
      buffContextObject.appliedName = i18next.t("modifiers.faction_5_mandrake_buff_name")
      inherentModifier = ModifierAnySummonWatchFromActionBarApplyModifiersToSelf.createContextObject([buffContextObject], "Costs 1 less")
      inherentModifier.activeInHand = inherentModifier.activeInDeck = true
      inherentModifier.activeOnBoard = false
      card.setInherentModifiersContextObjects([inherentModifier])

    if (identifier == Cards.Faction5.Visionar)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_visionar_name")
      card.setDescription(i18next.t("cards.faction_5_unit_visionar_desc"))
      card.setFXResource(["FX.Cards.Faction5.Dreadnaught"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_neutral_rockpulverizer_hit.audio
        attack : RSX.sfx_neutral_rockpulverizer_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_makantorwarbeast_hit.audio
        attackDamage : RSX.sfx_neutral_makantorwarbeast_attack_impact.audio
        death : RSX.sfx_neutral_makantorwarbeast_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5VisionarBreathing.name
        idle : RSX.f5VisionarIdle.name
        walk : RSX.f5VisionarRun.name
        attack : RSX.f5VisionarAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f5VisionarHit.name
        death : RSX.f5VisionarDeath.name
      )
      card.atk = 5
      card.maxHP = 6
      card.manaCost = 5
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([ModifierAnyDrawCardWatchBuffSelf.createContextObject(1,1)])

    if (identifier == Cards.Spell.RazorSkin)
      card = new SpellRazorSkin(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction5
      card.id = Cards.Spell.RazorSkin
      card.name = i18next.t("cards.faction_5_spell_razor_skin_name")
      card.setDescription(i18next.t("cards.faction_5_spell_razor_skin_description"))
      card.spellFilterType = SpellFilterType.AllyIndirect
      card.manaCost = 1
      card.rarityId = Rarity.Common
      buffContextObject = Modifier.createContextObjectWithAttributeBuffs(1,0)
      buffContextObject.appliedName = i18next.t("cards.faction_5_spell_razor_skin_name")
      card.setTargetModifiersContextObjects([
        buffContextObject
      ])
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.RazorSkin"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_flashreincarnation.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconRazorSkinIdle.name
        active : RSX.iconRazorSkinActive.name
      )

    if (identifier == Cards.Spell.LavaLance)
      card = new SpellLavaLance(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction5
      card.id = Cards.Spell.LavaLance
      card.name = i18next.t("cards.faction_5_spell_lava_lance_name")
      card.setDescription(i18next.t("cards.faction_5_spell_lava_lance_description"))
      card.manaCost = 1
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.setFXResource(["FX.Cards.Spell.LavaLance"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_phoenixfire.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconLavaLanceIdle.name
        active : RSX.iconLavaLanceActive.name
      )

    if (identifier == Cards.Spell.NaturesConfluence)
      card = new SpellNaturesConfluence(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction5
      card.id = Cards.Spell.NaturesConfluence
      card.name = i18next.t("cards.faction_5_spell_natures_confluence_name")
      card.setDescription(i18next.t("cards.faction_5_spell_natures_confluence_description"))
      card.manaCost = 5
      card.rarityId = Rarity.Epic
      card.setAffectPattern(CONFIG.PATTERN_2X2)
      card.spellFilterType = SpellFilterType.None
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.KineticEquilibrium"])
      card.setBaseAnimResource(
        idle: RSX.iconNaturesConfluenceIdle.name
        active: RSX.iconNaturesConfluenceActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_kineticequilibrium.audio
      )

    if (identifier == Cards.Spell.ThumpingWave)
      card = new SpellApplyModifiers(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_spell_thumping_wave_name")
      card.setDescription(i18next.t("cards.faction_5_spell_thumping_wave_description"))
      card.manaCost = 4
      card.rarityId = Rarity.Rare
      card.spellFilterType = SpellFilterType.NeutralDirect
      atkBuff = Modifier.createContextObjectWithAttributeBuffs(5,0)
      atkBuff.appliedName = i18next.t("modifiers.faction_5_spell_thumping_wave_1")
      removeAndReplaceContextObject = ModifierRemoveAndReplaceEntity.createContextObject({id: Cards.Faction5.Kin})
      removeAndReplaceContextObject.isHiddenToUI = true
      removeAndReplaceContextObject.durationEndTurn = 1
      removeAndReplaceContextObject.isRemovable = false
      card.setTargetModifiersContextObjects([
        atkBuff, removeAndReplaceContextObject
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.ThumpingWave"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_forcebarrier.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconThumpingWaveIdle.name
        active : RSX.iconThumpingWaveActive.name
      )

    if (identifier == Cards.Spell.FlamingStampede)
      card = new SpellFlamingStampede(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction5
      card.id = Cards.Spell.FlamingStampede
      card.name = i18next.t("cards.faction_5_spell_flaming_stampede_name")
      card.setDescription(i18next.t("cards.faction_5_spell_flaming_stampede_description"))
      card.manaCost = 8
      card.rarityId = Rarity.Legendary
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.spellFilterType = SpellFilterType.NeutralIndirect
      card.canTargetGeneral = true
      card.damageAmount = 8
      card.setFXResource(["FX.Cards.Spell.FlamingStampede"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_phoenixfire.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconFlamingStampedeIdle.name
        active : RSX.iconFlamingStampedeActive.name
      )

    if (identifier == Cards.Artifact.MorinKhur)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction5
      card.id = Cards.Artifact.MorinKhur
      card.name = i18next.t("cards.faction_5_artifact_morinkhur_name")
      card.setDescription(i18next.t("cards.faction_5_artifact_morinkhur_description"))
      card.manaCost = 6
      card.rarityId = Rarity.Legendary
      card.durability = 3
      card.setTargetModifiersContextObjects([
        Modifier.createContextObjectWithAttributeBuffs(3,undefined, {
          name: i18next.t("cards.faction_5_artifact_morinkhur_name")
          description: i18next.t("modifiers.plus_attack_key",{amount:3})
        }),
        ModifierDealDamageWatchHatchEggs.createContextObject({
          name: i18next.t("cards.faction_5_artifact_morinkhur_name")
          description: i18next.t("modifiers.faction_5_artifact_morinkhur_1")
        })
      ])
      card.setFXResource(["FX.Cards.Artifact.MorinKhur"])
      card.setBaseAnimResource(
        idle: RSX.iconMorinKhurIdle.name
        active: RSX.iconMorinKhurActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    return card

module.exports = CardFactory_ShimzarSet_Faction5
