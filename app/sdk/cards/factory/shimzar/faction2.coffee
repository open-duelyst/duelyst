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
SpellTempTransform = require 'app/sdk/spells/spellTempTransform'
SpellCrimsonCoil = require 'app/sdk/spells/spellCrimsonCoil'
SpellShadowWaltz = require 'app/sdk/spells/spellShadowWaltz'
SpellMirrorMeld = require 'app/sdk/spells/spellMirrorMeld'
SpellKoanOfHorns = require 'app/sdk/spells/spellKoanOfHorns'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierRanged = require 'app/sdk/modifiers/modifierRanged'
ModifierManaCostChange = require 'app/sdk/modifiers/modifierManaCostChange'
ModifierOpeningGambit = require 'app/sdk/modifiers/modifierOpeningGambit'
ModifierBackstab = require 'app/sdk/modifiers/modifierBackstab'
ModifierCardControlledPlayerModifiers = require 'app/sdk/modifiers/modifierCardControlledPlayerModifiers'
ModifierBattlePet = require 'app/sdk/modifiers/modifierBattlePet'
ModifierCannotMove = require 'app/sdk/modifiers/modifierCannotMove'
ModifierTakeDamageWatchDamageAllEnemies = require 'app/sdk/modifiers/modifierTakeDamageWatchDamageAllEnemies'
ModifierDyingWishXho = require 'app/sdk/modifiers/modifierDyingWishXho'
ModifierMyTeamMoveWatchAnyReasonBuffTarget = require 'app/sdk/modifiers/modifierMyTeamMoveWatchAnyReasonBuffTarget'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

PlayerModifierSpellDamageModifier = require 'app/sdk/playerModifiers/playerModifierSpellDamageModifier'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_ShimzarSet_Faction2

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction2.Xho)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction2
      card.setIsHiddenInCollection(false)
      card.name = i18next.t("cards.faction_2_unit_xho_name")
      card.setDescription(i18next.t("cards.faction_2_unit_xho_desc"))
      card.raceId = Races.BattlePet
      card.setFXResource(["FX.Cards.Neutral.Xho"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_neutral_grimrock_hit.audio
        attack : RSX.sfx_neutral_xho_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_xho_hit.audio
        attackDamage : RSX.sfx_neutral_xho_attack_impact.audio
        death : RSX.sfx_neutral_xho_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2XhoBreathing.name
        idle : RSX.f2XhoIdle.name
        walk : RSX.f2XhoRun.name
        attack : RSX.f2XhoAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.0
        damage : RSX.f2XhoHit.name
        death : RSX.f2XhoDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierBattlePet.createContextObject(), ModifierDyingWishXho.createContextObject()])

    if (identifier == Cards.Faction2.Ace)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_ace_name")
      card.setDescription(i18next.t("cards.faction_2_unit_ace_desc"))
      card.raceId = Races.BattlePet
      card.setFXResource(["FX.Cards.Neutral.PandoraMinionZap"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_cannonmechaz0r_impact.audio
        receiveDamage : RSX.sfx_neutral_silitharveteran_hit.audio
        attackDamage : RSX.sfx_neutral_silitharveteran_attack_impact.audio
        death : RSX.sfx_f6_waterelemental_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2AceBreathing.name
        idle : RSX.f2AceIdle.name
        walk : RSX.f2AceRun.name
        attack : RSX.f2AceAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.f2AceHit.name
        death : RSX.f2AceDeath.name
      )
      card.atk = 1
      card.maxHP = 2
      card.manaCost = 1
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierBattlePet.createContextObject(), ModifierRanged.createContextObject()])

    if (identifier == Cards.Faction2.OnyxJaguar)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_onyx_jaguar_name")
      card.setDescription(i18next.t("cards.faction_2_unit_onyx_jaguar_desc"))
      card.setFXResource(["FX.Cards.Faction2.OnyxJaguar"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_f2_jadeogre_attack_swing.audio
        attack : RSX.sfx_f6_boreanbear_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_beastsaberspinetiger_hit.audio
        attackDamage : RSX.sfx_neutral_beastsaberspinetiger_attack_impact.audio
        death : RSX.sfx_neutral_prophetofthewhite_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2OnyxJaguarBreathing.name
        idle : RSX.f2OnyxJaguarIdle.name
        walk : RSX.f2OnyxJaguarRun.name
        attack : RSX.f2OnyxJaguarAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.0
        damage : RSX.f2OnyxJaguarHit.name
        death : RSX.f2OnyxJaguarDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 5
      card.rarityId = Rarity.Epic
      modContextObject = Modifier.createContextObjectWithAttributeBuffs(1,1)
      modContextObject.appliedName = i18next.t("modifiers.faction_2_onyx_jaguar_buff_name")
      card.setInherentModifiersContextObjects([ModifierMyTeamMoveWatchAnyReasonBuffTarget.createContextObject([modContextObject], "give it +1/+1")])

    if (identifier == Cards.Faction2.KiBeholder)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_ki_beholder_name")
      card.setDescription(i18next.t("cards.faction_2_unit_ki_beholder_desc"))
      card.setFXResource(["FX.Cards.Faction2.KiBeholder"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_f2_jadeogre_attack_swing.audio
        attack : RSX.sfx_neutral_alcuinloremaster_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_alcuinloremaster_hit.audio
        attackDamage : RSX.sfx_neutral_alcuinloremaster_attack_impact.audio
        death : RSX.sfx_neutral_alcuinloremaster_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2KiBeholderBreathing.name
        idle : RSX.f2KiBeholderIdle.name
        walk : RSX.f2KiBeholderRun.name
        attack : RSX.f2KiBeholderAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f2KiBeholderHit.name
        death : RSX.f2KiBeholderDeath.name
      )
      card.atk = 3
      card.maxHP = 2
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierRanged.createContextObject()])
      card.addKeywordClassToInclude(ModifierOpeningGambit)
      statContextObject = ModifierCannotMove.createContextObject()
      statContextObject.durationEndTurn = 2
      card.setFollowups([
        {
          id: Cards.Spell.ApplyModifiers
          spellFilterType: SpellFilterType.EnemyDirect
          targetModifiersContextObjects: [
            statContextObject
          ]
          _private: {
            followupSourcePattern: CONFIG.PATTERN_WHOLE_BOARD
          }
        }
      ])

    if (identifier == Cards.Faction2.Katara)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_katara_name")
      card.setDescription(i18next.t("cards.faction_2_unit_katara_desc"))
      card.setFXResource(["FX.Cards.Faction2.Katara"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_redsynja_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_redsynja_hit.audio
        attackDamage : RSX.sfx_neutral_syvrel_attack_impact.audio
        death : RSX.sfx_neutral_syvrel_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2KataraBreathing.name
        idle : RSX.f2KataraIdle.name
        walk : RSX.f2KataraRun.name
        attack : RSX.f2KataraAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.f2KataraHit.name
        death : RSX.f2KataraDeath.name
      )
      card.atk = 1
      card.maxHP = 3
      card.manaCost = 1
      card.setInherentModifiersContextObjects([ModifierBackstab.createContextObject(1)])
      card.rarityId = Rarity.Common

    if (identifier == Cards.Faction2.BattlePanddo)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_battle_panddo_name")
      card.setDescription(i18next.t("cards.faction_2_unit_battle_panddo_desc"))
      card.setFXResource(["FX.Cards.Faction2.BattlePanddo"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_onyxbearseal.audio
        walk : RSX.sfx_neutral_arakiheadhunter_hit.audio
        attack : RSX.sfx_f6_boreanbear_attack_swing.audio
        receiveDamage : RSX.sfx_f6_boreanbear_hit.audio
        attackDamage : RSX.sfx_f6_boreanbear_attack_impact.audio
        death : RSX.sfx_f6_boreanbear_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2PandaBearBreathing.name
        idle : RSX.f2PandaBearIdle.name
        walk : RSX.f2PandaBearRun.name
        attack : RSX.f2PandaBearAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f2PandaBearDamage.name
        death : RSX.f2PandaBearDeath.name
      )
      card.atk = 2
      card.maxHP = 4
      card.manaCost = 3
      card.setInherentModifiersContextObjects([ModifierTakeDamageWatchDamageAllEnemies.createContextObject(1)])
      card.rarityId = Rarity.Epic

    if (identifier == Cards.Faction2.GrandmasterZendo)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_grandmaster_zendo_name")
      card.setDescription(i18next.t("cards.faction_2_unit_grandmaster_zendo_desc"))
      card.setFXResource(["FX.Cards.Faction2.GrandmasterZendo"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_unit_run_magical_3.audio
        attack : RSX.sfx_spell_darkseed.audio
        receiveDamage : RSX.sfx_f2_kaidoassassin_hit.audio
        attackDamage : RSX.sfx_neutral_daggerkiri_attack_swing.audio
        death : RSX.sfx_neutral_prophetofthewhite_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2GradmasterZendoBreathing.name
        idle : RSX.f2GradmasterZendoIdle.name
        walk : RSX.f2GradmasterZendoRun.name
        attack : RSX.f2GradmasterZendoAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.4
        damage : RSX.f2GradmasterZendoHit.name
        death : RSX.f2GradmasterZendoDeath.name
      )
      card.atk = 3
      card.maxHP = 6
      card.manaCost = 6
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetEnemyPlayer([ModifierBattlePet.createContextObject()], "The enemy General moves and attacks as if they are a Battle Pet")])

    if (identifier == Cards.Spell.CrimsonCoil)
      card = new SpellCrimsonCoil(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.CrimsonCoil
      card.name = i18next.t("cards.faction_2_spell_crimson_coil_name")
      card.setDescription(i18next.t("cards.faction_2_spell_crimson_coil_description"))
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.damageAmount = 2
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.CrimsonCoil"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_windstopper_attack_impact.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconCrimsonCoilIdle.name
        active : RSX.iconCrimsonCoilActive.name
      )

    if (identifier == Cards.Spell.ShadowWaltz)
      card = new SpellShadowWaltz(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.ShadowWaltz
      card.name = i18next.t("cards.faction_2_spell_shadow_waltz_name")
      card.setDescription(i18next.t("cards.faction_2_spell_shadow_waltz_description"))
      card.manaCost = 1
      card.rarityId = Rarity.Common
      card.setFXResource(["FX.Cards.Spell.ShadowWaltz"])
      card.addKeywordClassToInclude(ModifierBackstab)
      attackBuff = Modifier.createContextObjectWithAttributeBuffs(1,1)
      attackBuff.appliedName = i18next.t("modifiers.faction_2_spell_shadow_waltz_1")
      manaCostReduction = ModifierManaCostChange.createContextObject(-1)
      card.setTargetModifiersContextObjects([attackBuff, manaCostReduction])
      card.applyToOwnPlayer = true
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_khymera_death.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconShadowWaltzIdle.name
        active : RSX.iconShadowWaltzActive.name
      )

    if (identifier == Cards.Spell.Pandamonium)
      card = new SpellTempTransform(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.Pandamonium
      card.name = i18next.t("cards.faction_2_spell_pandamonium_name")
      card.setDescription(i18next.t("cards.faction_2_spell_pandamonium_description"))
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      card.spellFilterType = SpellFilterType.NeutralIndirect
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.durationEndTurn = 1
      card.cardDataOrIndexToSpawn = {id: Cards.Faction2.OnyxBear}
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.OnyxBearSeal"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_onyxbearseal.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconPandamoniumIdle.name
        active : RSX.iconPandamoniumActive.name
      )

    if (identifier == Cards.Spell.MirrorMeld)
      card = new SpellMirrorMeld(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.MirrorMeld
      card.name = i18next.t("cards.faction_2_spell_mirror_meld_name")
      card.setDescription(i18next.t("cards.faction_2_spell_mirror_meld_description"))
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.spellFilterType = SpellFilterType.AllyDirect
      card.cardDataOrIndexToSpawn = {id: Cards.Faction2.OnyxBear}
      card.setFXResource(["FX.Cards.Spell.MirrorMeld"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f1elyxstormblade_attack_impact.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconMirrorMeldIdle.name
        active : RSX.iconMirrorMeldActive.name
      )

    if (identifier == Cards.Spell.KoanOfHorns)
      card = new SpellKoanOfHorns(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.KoanOfHorns
      card.name = i18next.t("cards.faction_2_spell_koan_of_horns_name")
      card.setDescription(i18next.t("cards.faction_2_spell_koan_of_horns_description"))
      card.manaCost = 8
      card.rarityId = Rarity.Legendary
      card.drawCardsPostPlay = 3
      card.setFXResource(["FX.Cards.Spell.KoanOfHorns"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f2tank_attack_swing.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconKoanOfHornsIdle.name
        active : RSX.iconKoanOfHornsActive.name
      )

    if (identifier == Cards.Artifact.CrescentSpear)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction2
      card.id = Cards.Artifact.CrescentSpear
      card.name = i18next.t("cards.faction_2_artifact_crescent_spear_name")
      card.setDescription(i18next.t("cards.faction_2_artifact_crescent_spear_description"))
      card.manaCost = 1
      card.rarityId = Rarity.Legendary
      card.durability = 3
      contextObject = PlayerModifierSpellDamageModifier.createContextObject()
      contextObject.spellDamageChange = 1
      contextObject.activeInHand = contextObject.activeInDeck = contextObject.activeInSignatureCards = false
      contextObject.activeOnBoard = true
      card.setTargetModifiersContextObjects([
        Modifier.createContextObjectWithAttributeBuffs(1,0,{
          name: i18next.t("cards.faction_2_artifact_crescent_spear_name")
          description: i18next.t("modifiers.plus_attack_key",{amount:1})
        }),
        ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetOwnPlayer([contextObject], i18next.t("modifiers.faction_2_artifact_crescent_spear_1"),{
          name: i18next.t("cards.faction_2_artifact_crescent_spear_name")
          description: i18next.t("modifiers.faction_2_artifact_crescent_spear_1")
        })
      ])
      card.setFXResource(["FX.Cards.Artifact.CrescentSpear"])
      card.setBaseAnimResource(
        idle: RSX.iconCrescentSpearIdle.name
        active: RSX.iconCrescentSpearActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    return card

module.exports = CardFactory_ShimzarSet_Faction2
