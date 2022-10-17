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
CardSet = require 'app/sdk/cards/cardSetLookup'
Factions = require 'app/sdk/cards/factionsLookup'
FactionFactory = require 'app/sdk/cards/factionFactory'
Races = require 'app/sdk/cards/racesLookup'
Rarity = require 'app/sdk/cards/rarityLookup'

Unit = require 'app/sdk/entities/unit'
Artifact = require 'app/sdk/artifacts/artifact'

Spell = require 'app/sdk/spells/spell'
SpellFilterType = require 'app/sdk/spells/spellFilterType'
SpellAspectBase = require 'app/sdk/spells/spellAspectBase'
SpellSpawnEntityNearbyGeneral = require 'app/sdk/spells/spellSpawnEntityNearbyGeneral'
SpellSkyBurial = require 'app/sdk/spells/spellSkyBurial'
SpellFightingSpirit = require 'app/sdk/spells/spellFightingSpirit'
SpellLucentBeam = require 'app/sdk/spells/spellLucentBeam'
SpellAfterblaze = require 'app/sdk/spells/spellAfterblaze'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierProvoke = require 'app/sdk/modifiers/modifierProvoke'
ModifierBanding = require 'app/sdk/modifiers/modifierBanding'
ModifierOpeningGambit = require 'app/sdk/modifiers/modifierOpeningGambit'
ModifierBattlePet = require 'app/sdk/modifiers/modifierBattlePet'
ModifierOpeningGambitDrawCard = require 'app/sdk/modifiers/modifierOpeningGambitDrawCard'
ModifierEndTurnWatchApplyModifiersRandomly = require 'app/sdk/modifiers/modifierEndTurnWatchApplyModifiersRandomly'
ModifierBandingChangeCardDraw = require 'app/sdk/modifiers/modifierBandingChangeCardDraw'
ModifierEndTurnWatchRefreshArtifacts = require 'app/sdk/modifiers/modifierEndTurnWatchRefreshArtifacts'
ModifierHealWatchBuffGeneral = require 'app/sdk/modifiers/modifierHealWatchBuffGeneral'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_ShimzarSet_Faction1

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction1.Fiz)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_fiz_name")
      card.setDescription(i18next.t("cards.faction_1_unit_fiz_desc"))
      card.raceId = Races.BattlePet
      card.setFXResource(["FX.Cards.Faction1.AzuriteLion"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_f6_draugarlord_hit.audio
        attack : RSX.sfx_neutral_beastsaberspinetiger_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_beastsaberspinetiger_hit.audio
        attackDamage : RSX.sfx_neutral_beastsaberspinetiger_attack_impact.audio
        death : RSX.sfx_f6_draugarlord_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1FizBreathing.name
        idle : RSX.f1FizIdle.name
        walk : RSX.f1FizRun.name
        attack : RSX.f1FizAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.0
        damage : RSX.f1FizHit.name
        death : RSX.f1FizDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 2
      card.setInherentModifiersContextObjects([ModifierBattlePet.createContextObject()])
      card.addKeywordClassToInclude(ModifierOpeningGambit)
      card.setFollowups([
        {
          id: Cards.Spell.FollowupHeal
          canTargetGeneral: true
          healAmount: 2
        }
      ])
      card.rarityId = Rarity.Rare

    if (identifier == Cards.Faction1.Slo)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_slo_name")
      card.setDescription(i18next.t("cards.faction_1_unit_slo_desc"))
      card.raceId = Races.BattlePet
      card.setFXResource(["FX.Cards.Neutral.Slo"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_sunseer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_sunseer_hit.audio
        attackDamage : RSX.sfx_neutral_sunseer_attack_impact.audio
        death : RSX.sfx_neutral_sunseer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1SloBreathing.name
        idle : RSX.f1SloIdle.name
        walk : RSX.f1SloRun.name
        attack : RSX.f1SloAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.0
        damage : RSX.f1SloHit.name
        death : RSX.f1SloDeath.name
      )
      card.atk = 1
      card.maxHP = 4
      card.manaCost = 1
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierBattlePet.createContextObject(), ModifierProvoke.createContextObject()])

    if (identifier == Cards.Faction1.SunWisp)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_sun_wisp_name")
      card.setDescription(i18next.t("cards.faction_1_unit_sun_wisp_desc"))
      card.setFXResource(["FX.Cards.Faction1.SunWisp"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_unit_run_magical_4.audio
        attack : RSX.sfx_f6_voiceofthewind_death.audio
        receiveDamage : RSX.sfx_neutral_shieldoracle_hit.audio
        attackDamage : RSX.sfx_neutral_shieldoracle_attack_impact.audio
        death : RSX.sfx_neutral_shieldoracle_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1SunWispBreathing.name
        idle : RSX.f1SunWispIdle.name
        walk : RSX.f1SunWispRun.name
        attack : RSX.f1SunWispAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.35
        damage : RSX.f1SunWispHit.name
        death : RSX.f1SunWispDeath.name
      )
      card.atk = 2
      card.maxHP = 1
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierOpeningGambitDrawCard.createContextObject(1)])

    if (identifier == Cards.Faction1.RadiantDragoon)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_radiant_dragoon_name")
      card.setDescription(i18next.t("cards.faction_1_unit_radiant_dragoon_desc"))
      card.setFXResource(["FX.Cards.Faction1.RadiantDragoon"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_neutral_arcanelimiter_attack_impact.audio
        attack : RSX.sfx_neutral_rook_attack_swing.audio
        receiveDamage : RSX.sfx_f2_kaidoassassin_hit.audio
        attackDamage : RSX.sfx_neutral_rook_attack_impact.audio
        death : RSX.sfx_neutral_windstopper_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1RadiantDragoonBreathing.name
        idle : RSX.f1RadiantDragoonIdle.name
        walk : RSX.f1RadiantDragoonRun.name
        attack : RSX.f1RadiantDragoonAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f1RadiantDragoonHit.name
        death : RSX.f1RadiantDragoonDeath.name
      )
      card.atk = 3
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      statContextObject = Modifier.createContextObjectWithAttributeBuffs(0,1)
      statContextObject.appliedName = i18next.t("modifiers.faction_1_radiant_dragoon_applied_name")
      card.setInherentModifiersContextObjects([
        ModifierEndTurnWatchApplyModifiersRandomly.createContextObject([statContextObject],
          true, true, false, CONFIG.WHOLE_BOARD_RADIUS, false, "give a friendly minion +1 Health", 1)
      ])

    if (identifier == Cards.Faction1.SunforgeLancer)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Core)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_sunforge_lancer_name")
      card.setDescription(i18next.t("cards.faction_1_unit_sunforge_lancer_desc"))
      card.setFXResource(["FX.Cards.Faction1.SunforgeLancer"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_neutral_rook_attack_swing.audio
        receiveDamage : RSX.sfx_f2_kaidoassassin_hit.audio
        attackDamage : RSX.sfx_neutral_rook_attack_impact.audio
        death : RSX.sfx_f1silverguardsquire_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1SunforgeLancerBreathing.name
        idle : RSX.f1SunforgeLancerIdle.name
        walk : RSX.f1SunforgeLancerRun.name
        attack : RSX.f1SunforgeLancerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f1SunWispHit.name
        death : RSX.f1SunforgeLancerDeath.name
      )
      card.atk = 2
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Epic
      statBuffContextObject = Modifier.createContextObjectWithAttributeBuffs(1,0)
      statBuffContextObject.appliedName = i18next.t("modifiers.faction_1_sunforged_lancer_applied_name")
      card.setInherentModifiersContextObjects([ModifierHealWatchBuffGeneral.createContextObject([statBuffContextObject], "+1 Attack")])

    if (identifier == Cards.Faction1.Solarius)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_solarius_name")
      card.setDescription(i18next.t("cards.faction_1_unit_solarius_desc"))
      card.setFXResource(["FX.Cards.Faction1.Solarius"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_unit_run_magical_4.audio
        attack : RSX.sfx_neutral_sunseer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_sunseer_hit.audio
        attackDamage : RSX.sfx_neutral_rook_attack_impact.audio
        death : RSX.sfx_spell_sunbloom.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1SolariusBreathing.name
        idle : RSX.f1SolariusIdle.name
        walk : RSX.f1SolariusRun.name
        attack : RSX.f1SolariusAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f1SolariusHit.name
        death : RSX.f1SolariusDeath.name
      )
      card.atk = 3
      card.maxHP = 2
      card.manaCost = 5
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ ModifierBandingChangeCardDraw.createContextObject(2) ])

    if (identifier == Cards.Spell.IroncliffeHeart)
      card = new SpellAspectBase(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction1
      card.id = Cards.Spell.IroncliffeHeart
      card.name = i18next.t("cards.faction_1_spell_ironcliffe_heart_name")
      card.setDescription(i18next.t("cards.faction_1_spell_ironcliffe_heart_description"))
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      card.spellFilterType = SpellFilterType.AllyDirect
      card.cardDataOrIndexToSpawn = {id: Cards.Faction1.IroncliffeGuardian}
      card.setFXResource(["FX.Cards.Spell.IroncliffeHeart"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f1ironcliffeguardian_attack_swing.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconIroncliffeHeartIdle.name
        active : RSX.iconIroncliffeHeartActive.name
      )

    if (identifier == Cards.Spell.SkyBurial)
      card = new SpellSkyBurial(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction1
      card.id = Cards.Spell.SkyBurial
      card.name = i18next.t("cards.faction_1_spell_sky_burial_name")
      card.setDescription(i18next.t("cards.faction_1_spell_sky_burial_description"))
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.setFXResource(["FX.Cards.Spell.SkyBurial"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_swordmechaz0r_death.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconSkyBurialIdle.name
        active : RSX.iconSkyBurialActive.name
      )

    if (identifier == Cards.Spell.Afterblaze)
      card = new SpellAfterblaze(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction1
      card.id = Cards.Spell.Afterblaze
      card.name = i18next.t("cards.faction_1_spell_afterblaze_name")
      card.setDescription(i18next.t("cards.faction_1_spell_afterblaze_description"))
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.addKeywordClassToInclude(ModifierBanding)
      card.spellFilterType = SpellFilterType.AllyDirect
      buffContextObject = Modifier.createContextObjectWithAttributeBuffs(2,4)
      buffContextObject.appliedName = i18next.t("modifiers.faction_1_spell_afterblaze_1")
      card.setTargetModifiersContextObjects([buffContextObject])
      card.setFXResource(["FX.Cards.Spell.WarSurge"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_firestarter_attack_swing.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconAfterblazeIdle.name
        active : RSX.iconAfterblazeActive.name
      )

    if (identifier == Cards.Spell.FightingSpirit)
      card = new SpellFightingSpirit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction1
      card.id = Cards.Spell.FightingSpirit
      card.name = i18next.t("cards.faction_1_spell_fighting_spirit_name")
      card.setDescription(i18next.t("cards.faction_1_spell_fighting_spirit_description"))
      card.spellFilterType = SpellFilterType.AllyIndirect
      card.manaCost = 1
      card.rarityId = Rarity.Epic
      buffContextObject = Modifier.createContextObjectWithAttributeBuffs(0,1)
      buffContextObject.appliedName = i18next.t("cards.faction_1_spell_fighting_spirit_name")
      card.setTargetModifiersContextObjects([
        buffContextObject
      ])
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.LionheartBlessing"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_warsurge.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconFightingSpiritIdle.name
        active : RSX.iconFightingSpiritActive.name
      )

    if (identifier == Cards.Spell.LucentBeam)
      card = new SpellLucentBeam(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction1
      card.id = Cards.Spell.LucentBeam
      card.name = i18next.t("cards.faction_1_spell_lucent_beam_name")
      card.setDescription(i18next.t("cards.faction_1_spell_lucent_beam_description"))
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.damageAmount = 2
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.canTargetGeneral = true
      card.setFXResource(["FX.Cards.Spell.LucentBeam"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_windstopper_attack_impact.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconLucentBeamIdle.name
        active : RSX.iconLucentBeamActive.name
      )

    if (identifier == Cards.Spell.SkyPhalanx)
      card = new SpellSpawnEntityNearbyGeneral(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction1
      card.id = Cards.Spell.SkyPhalanx
      card.name = i18next.t("cards.faction_1_spell_sky_phalanx_name")
      card.setDescription(i18next.t("cards.faction_1_spell_sky_phalanx_description"))
      card.manaCost = 8
      card.rarityId = Rarity.Legendary
      card.cardDataOrIndexToSpawn = {id: Cards.Faction1.SilverguardKnight}
      card.setFollowups([{
        id: Cards.Spell.CloneSourceEntityNearbyGeneral2X
      }])
      card.setFXResource(["FX.Cards.Spell.SkyPhalanx"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f1tank_attack_swing.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconSkyPhalanxIdle.name
        active : RSX.iconSkyPhalanxActive.name
      )

    if (identifier == Cards.Artifact.DawnsEye)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction1
      card.id = Cards.Artifact.DawnsEye
      card.name = i18next.t("cards.faction_1_artifact_dawns_eye_name")
      card.setDescription(i18next.t("cards.faction_1_artifact_dawns_eye_description"))
      card.manaCost = 5
      card.rarityId = Rarity.Legendary
      card.durability = 3
      card.setTargetModifiersContextObjects([
        Modifier.createContextObjectWithAttributeBuffs(4,undefined, {
          name: i18next.t("cards.faction_1_artifact_dawns_eye_name")
          description: i18next.t("modifiers.plus_attack_key",{amount:4})
        }),
        ModifierEndTurnWatchRefreshArtifacts.createContextObject( {
          name: i18next.t("cards.faction_1_artifact_dawns_eye_name")
          description: i18next.t("modifiers.faction_1_artifact_dawns_eye_1")
        })
      ])
      card.setFXResource(["FX.Cards.Artifact.DawnsEye"])
      card.setBaseAnimResource(
        idle: RSX.iconDawnsEyeIdle.name
        active: RSX.iconDawnsEyeActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    return card

module.exports = CardFactory_ShimzarSet_Faction1
