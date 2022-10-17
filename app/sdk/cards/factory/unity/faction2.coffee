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
SpellJoseki = require 'app/sdk/spells/spellJoseki'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierBond = require 'app/sdk/modifiers/modifierBond'
ModifierBondPutCardsInHand = require 'app/sdk/modifiers/modifierBondPutCardsInHand'
ModifierSpellWatchBuffAlliesByRace = require 'app/sdk/modifiers/modifierSpellWatchBuffAlliesByRace'
ModifierTranscendance = require 'app/sdk/modifiers/modifierTranscendance'
ModifierMyAttackWatchGetSonghaiSpells = require 'app/sdk/modifiers/modifierMyAttackWatchGetSonghaiSpells'
ModifierFirstBlood = require 'app/sdk/modifiers/modifierFirstBlood'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_UnitySet_Faction2

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction2.Sparrowhawk)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_sparrowhawk_name")
      card.setDescription(i18next.t("cards.faction_2_unit_sparrowhawk_desc"))
      card.raceId = Races.Arcanyst
      card.setBoundingBoxWidth(45)
      card.setBoundingBoxHeight(85)
      card.setFXResource(["FX.Cards.Faction2.ScarletViper"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_unit_run_magical_3.audio
        attack : RSX.sfx_neutral_stormmetalgolem_attack_swing.audio
        receiveDamage : RSX.sfx_f6_icedryad_hit.audio
        attackDamage : RSX.sfx_neutral_stormmetalgolem_attack_impact.audio
        death : RSX.sfx_f6_icedryad_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2SparrowhawkBreathing.name
        idle : RSX.f2SparrowhawkIdle.name
        walk : RSX.f2SparrowhawkRun.name
        attack : RSX.f2SparrowhawkAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.25
        damage : RSX.f2SparrowhawkHit.name
        death : RSX.f2SparrowhawkDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierBondPutCardsInHand.createContextObject([Cards.Spell.MistDragonSeal])])

    if (identifier == Cards.Faction2.Kindling)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_kindling_name")
      card.setDescription(i18next.t("cards.faction_2_unit_kindling_desc"))
      card.raceId = Races.Arcanyst
      card.setFXResource(["FX.Cards.Neutral.Kindling"])
      card.setBoundingBoxWidth(85)
      card.setBoundingBoxHeight(110)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_blindscorch.audio
        walk : RSX.sfx_neutral_firestarter_impact.audio
        attack :  RSX.sfx_neutral_firestarter_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_firestarter_hit.audio
        attackDamage : RSX.sfx_neutral_firestarter_impact.audio
        death : RSX.sfx_neutral_firestarter_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2KindlingBreathing.name
        idle : RSX.f2KindlingIdle.name
        walk : RSX.f2KindlingRun.name
        attack : RSX.f2KindlingAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.f2KindlingHit.name
        death : RSX.f2KindlingDeath.name
      )
      card.atk = 3
      card.maxHP = 5
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([ModifierSpellWatchBuffAlliesByRace.createContextObject(1, 0, Races.Arcanyst)])

    if (identifier == Cards.Faction2.Calligrapher)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_calligrapher_name")
      card.setDescription(i18next.t("cards.faction_2_unit_calligrapher_desc"))
      card.raceId = Races.Arcanyst
      card.setFXResource(["FX.Cards.Faction2.JadeOgre"])
      card.setBoundingBoxWidth(65)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_unit_physical_4.audio
        attack : RSX.sfx_f2_jadeogre_attack_swing.audio
        receiveDamage : RSX.sfx_f2_jadeogre_hit.audio
        attackDamage : RSX.sfx_f2_jadeogre_attack_impact.audio
        death : RSX.sfx_f2_jadeogre_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2CaligrapherBreathing.name
        idle : RSX.f2CaligrapherIdle.name
        walk : RSX.f2CaligrapherRun.name
        attack : RSX.f2CaligrapherAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.f2CaligrapherHit.name
        death : RSX.f2CaligrapherRun.name
      )
      card.atk = 3
      card.maxHP = 7
      card.manaCost = 7
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects(
        [ModifierFirstBlood.createContextObject(), ModifierMyAttackWatchGetSonghaiSpells.createContextObject(3)]
      )

    if (identifier == Cards.Artifact.MaskOfCelerity)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction2
      card.id = Cards.Artifact.MaskOfCelerity
      card.name = i18next.t("cards.faction_2_artifact_bangle_of_blinding_strike_name")
      card.setDescription(i18next.t("cards.faction_2_artifact_bangle_of_blinding_strike_description"))
      card.addKeywordClassToInclude(ModifierTranscendance)
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      card.durability = 3
      card.setTargetModifiersContextObjects([
        ModifierTranscendance.createContextObject({
          name: i18next.t("cards.faction_2_artifact_bangle_of_blinding_strike_name")
        })
      ])
      card.setFXResource(["FX.Cards.Artifact.MaskOfShadows"])
      card.setBaseAnimResource(
        idle: RSX.iconBraceletBlindingStrikeIdle.name
        active: RSX.iconBraceletBlindingStrikeActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Spell.Joseki)
      card = new SpellJoseki(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.Joseki
      card.name = i18next.t("cards.faction_2_spell_joseki_name")
      card.setDescription(i18next.t("cards.faction_2_spell_joseki_desc"))
      card.manaCost = 1
      card.rarityId = Rarity.Common
      card.setFXResource(["FX.Cards.Spell.Joseki"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_flashreincarnation.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconJosekiIdle.name
        active : RSX.iconJosekiActive.name
      )

    return card

module.exports = CardFactory_UnitySet_Faction2
