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
SpellDeathIncoming = require 'app/sdk/spells/spellDeathIncoming'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierBond = require 'app/sdk/modifiers/modifierBond'
ModifierBondNightshroud = require 'app/sdk/modifiers/modifierBondNightshroud'
ModifierNocturne = require 'app/sdk/modifiers/modifierNocturne'
ModifierOpeningGambitDeathKnell = require 'app/sdk/modifiers/modifierOpeningGambitDeathKnell'
ModifierOnRemoveSpawnRandomDeadEntity = require 'app/sdk/modifiers/modifierOnRemoveSpawnRandomDeadEntity'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_UnitySet_Faction4

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction4.Nightshroud)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction4
      card.name = i18next.t("cards.faction_4_unit_nightshroud_name")
      card.setDescription(i18next.t("cards.faction_4_unit_nightshroud_desc"))
      card.raceId = Races.Arcanyst
      card.setFXResource(["FX.Cards.Faction4.Nightshroud"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f4_blacksolus_attack_swing.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f3_aymarahealer_attack_swing.audio
        receiveDamage : RSX.sfx_f3_aymarahealer_hit.audio
        attackDamage : RSX.sfx_f3_aymarahealer_impact.audio
        death : RSX.sfx_f3_aymarahealer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f4NightshroudBreathing.name
        idle : RSX.f4NightshroudIdle.name
        walk : RSX.f4NightshroudRun.name
        attack : RSX.f4NightshroudAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f4NightshroudHit.name
        death : RSX.f4NightshroudDeath.name
      )
      card.atk = 5
      card.maxHP = 1
      card.manaCost = 4
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierBondNightshroud.createContextObject()])

    if (identifier == Cards.Spell.DeathIncoming)
      card = new SpellDeathIncoming(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction4
      card.id = Cards.Spell.DeathIncoming
      card.name = i18next.t("cards.faction_4_spell_blood_echoes_name")
      card.setDescription(i18next.t("cards.faction_4_spell_blood_echoes_desc"))
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.AllyIndirect
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.setFXResource(["FX.Cards.Spell.BloodEchoes"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_entropicdecay.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconBloodEchoesIdle.name
        active : RSX.iconBloodEchoesActive.name
      )

    if (identifier == Cards.Faction4.Nocturne)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction4
      card.name = i18next.t("cards.faction_4_unit_nocturne_name")
      card.setDescription(i18next.t("cards.faction_4_unit_nocturne_desc"))
      card.raceId = Races.Arcanyst
      card.setFXResource(["FX.Cards.Faction4.GloomChaser"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f4_blacksolus_attack_swing.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_darkharbinger_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_darkharbinger_hit.audio
        attackDamage : RSX.sfx_neutral_darkharbinger_attack_impact.audio
        death : RSX.sfx_neutral_darkharbinger_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f4NocturneBreathing.name
        idle : RSX.f4NocturneIdle.name
        walk : RSX.f4NocturneRun.name
        attack : RSX.f4NocturneAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f4NocturneHit.name
        death : RSX.f4NocturneDeath.name
      )
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([ModifierNocturne.createContextObject()])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Faction4.DeathKnell)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction4
      card.name = i18next.t("cards.faction_4_unit_death_knell_name")
      card.setDescription(i18next.t("cards.faction_4_unit_death_knell_desc"))
      card.raceId = Races.Arcanyst
      card.setFXResource(["FX.Cards.Faction4.DeathKnell"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f4_blacksolus_attack_swing.audio
        walk : RSX.sfx_spell_icepillar_melt.audio
        attack : RSX.sfx_f6_waterelemental_death.audio
        receiveDamage : RSX.sfx_f1windbladecommander_hit.audio
        attackDamage : RSX.sfx_f2_celestialphantom_attack_impact.audio
        death : RSX.sfx_f1elyxstormblade_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f4DeathKnellBreathing.name
        idle : RSX.f4DeathKnellIdle.name
        walk : RSX.f4DeathKnellRun.name
        attack : RSX.f4DeathKnellAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f4DeathKnellHit.name
        death : RSX.f4DeathKnellDeath.name
      )
      card.atk = 6
      card.maxHP = 6
      card.manaCost = 8
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierOpeningGambitDeathKnell.createContextObject()])

    if (identifier == Cards.Artifact.AngryRebirthAmulet)
      card = new Artifact(gameSession)
      card.factionId = Factions.Faction4
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.id = Cards.Artifact.AngryRebirthAmulet
      card.name = i18next.t("cards.faction_4_artifact_the_releaser_name")
      card.setDescription(i18next.t("cards.faction_4_artifact_the_releaser_description"))
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.durability = 3
      card.setTargetModifiersContextObjects([
        ModifierOnRemoveSpawnRandomDeadEntity.createContextObject({
          type: "ModifierOnRemoveSpawnRandomDeadEntity"
          name: i18next.t("cards.faction_4_artifact_the_releaser_name")
          description: i18next.t("cards.faction_4_artifact_the_releaser_description")
        })
      ])
      card.setFXResource(["FX.Cards.Artifact.HornOfTheForsaken"])
      card.setBaseAnimResource(
        idle: RSX.iconTheReleaserIdle.name
        active: RSX.iconTheReleaserActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    return card

module.exports = CardFactory_UnitySet_Faction4
