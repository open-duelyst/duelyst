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
SpellSpawnEntitiesOnEdgeSpaces = require 'app/sdk/spells/spellSpawnEntitiesOnEdgeSpaces'
SpellApplyModifiersToExhaustedMinion = require 'app/sdk/spells/spellApplyModifiersToExhaustedMinion'
SpellApplyModifiers = require 'app/sdk/spells/spellApplyModifiers'
SpellIntensifyTeleportOwnSide = require 'app/sdk/spells/spellIntensifyTeleportOwnSide'
SpellInfiniteHowlers = require 'app/sdk/spells/spellInfiniteHowlers'
SpellTransformSameManaCost = require 'app/sdk/spells/spellTransformSameManaCost'
SpellCreepingFrost = require 'app/sdk/spells/spellCreepingFrost'
SpellDamage = require 'app/sdk/spells/spellDamage'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierStunned = require 'app/sdk/modifiers/modifierStunned'
ModifierStun = require 'app/sdk/modifiers/modifierStun'
ModifierStunnedVanar = require 'app/sdk/modifiers/modifierStunnedVanar'
ModifierOpeningGambit = require 'app/sdk/modifiers/modifierOpeningGambit'
ModifierDyingWish = require 'app/sdk/modifiers/modifierDyingWish'
ModifierProvoke = require 'app/sdk/modifiers/modifierProvoke'
ModifierDyingWishSpawnEntity = require 'app/sdk/modifiers/modifierDyingWishSpawnEntity'
ModifierEntersBattlefieldWatchApplyModifiers = require 'app/sdk/modifiers/modifierEntersBattlefieldWatchApplyModifiers'
ModifierOpeningGambitDestroyManaCrystal = require 'app/sdk/modifiers/modifierOpeningGambitDestroyManaCrystal'
ModifierOpeningGambitBonusManaCrystal = require 'app/sdk/modifiers/modifierOpeningGambitBonusManaCrystal'
ModifierDyingWishDestroyManaCrystal = require 'app/sdk/modifiers/modifierDyingWishDestroyManaCrystal'
ModifierDyingWishBonusManaCrystal = require 'app/sdk/modifiers/modifierDyingWishBonusManaCrystal'
ModifierStartsInHand = require 'app/sdk/modifiers/modifierStartsInHand'
ModifierEnemyStunWatch = require 'app/sdk/modifiers/modifierEnemyStunWatch'
ModifierEnemyStunWatchTransformThis = require 'app/sdk/modifiers/modifierEnemyStunWatchTransformThis'
ModifierEnemyStunWatchDamageNearbyEnemies = require 'app/sdk/modifiers/modifierEnemyStunWatchDamageNearbyEnemies'
ModifierIntensifySpawnEntitiesNearby = require 'app/sdk/modifiers/modifierIntensifySpawnEntitiesNearby'
ModifierKillWatchRefreshExhaustionIfTargetStunned = require 'app/sdk/modifiers/modifierKillWatchRefreshExhaustionIfTargetStunned'
ModifierEnemyStunWatchFullyHeal = require 'app/sdk/modifiers/modifierEnemyStunWatchFullyHeal'
ModifierOnSummonFromHandApplyEmblems = require 'app/sdk/modifiers/modifierOnSummonFromHandApplyEmblems'
ModifierOpeningGambitChangeSignatureCardForThisTurn = require 'app/sdk/modifiers/modifierOpeningGambitChangeSignatureCardForThisTurn'
ModifierOpeningGambitRefreshSignatureCard = require 'app/sdk/modifiers/modifierOpeningGambitRefreshSignatureCard'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'
ModifierToken = require 'app/sdk/modifiers/modifierToken'
ModifierFateVanarTokenQuest = require 'app/sdk/modifiers/modifierFateVanarTokenQuest'
ModifierCannotBeReplaced = require 'app/sdk/modifiers/modifierCannotBeReplaced'
ModifierIntensify = require 'app/sdk/modifiers/modifierIntensify'
ModifierCounterIntensify = require 'app/sdk/modifiers/modifierCounterIntensify'
ModifierCannotBeRemovedFromHand = require 'app/sdk/modifiers/modifierCannotBeRemovedFromHand'
ModifierQuestBuffVanar = require 'app/sdk/modifiers/modifierQuestBuffVanar'

PlayerModifierEmblemSummonWatchVanarTokenQuest = require 'app/sdk/playerModifiers/playerModifierEmblemSummonWatchVanarTokenQuest'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_CoreshatterSet_Faction6

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction6.VanarQuest)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      card.setCardSetId(CardSet.Coreshatter)
      card.name = "Oak in the Nemeton"
      card.setDescription("Trial: Have 5 token minions with different names.\nDestiny: Friendly token minions have +4/+4.")
      card.atk = 6
      card.maxHP = 6
      card.manaCost = 6
      card.rarityId = Rarity.Mythron
      statContextObject = ModifierQuestBuffVanar.createContextObjectWithAttributeBuffs(4,4)
      statContextObject.appliedName = "Might of the Oak"
      emblemModifier = PlayerModifierEmblemSummonWatchVanarTokenQuest.createContextObject([statContextObject])
      emblemModifier.appliedName = "Nemeton's Protection"
      emblemModifier.appliedDescription = "Your token minions have +4/+4."
      card.setInherentModifiersContextObjects([
        ModifierStartsInHand.createContextObject(),
        ModifierCannotBeReplaced.createContextObject(),
        ModifierFateVanarTokenQuest.createContextObject(5),
        ModifierOnSummonFromHandApplyEmblems.createContextObject([emblemModifier], true, false),
        ModifierCannotBeRemovedFromHand.createContextObject()
      ])
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
        breathing : RSX.f6MythronquestBreathing.name
        idle : RSX.f6MythronquestIdle.name
        walk : RSX.f6MythronquestRun.name
        attack : RSX.f6MythronquestAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.f6MythronquestHit.name
        death : RSX.f6MythronquestDeath.name
      )

    if (identifier == Cards.Faction6.Snowballer)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Faction6
      card.name = "Cloudcaller"
      card.setDescription("Opening Gambit: Your Bloodbound Spell refreshes and is Lesser Waterball this turn.")
      card.atk = 4
      card.maxHP = 5
      card.manaCost = 5
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([
        ModifierOpeningGambitRefreshSignatureCard.createContextObject()
        ModifierOpeningGambitChangeSignatureCardForThisTurn.createContextObject({id: Cards.Spell.SnowballBBS})
      ])
      card.setFXResource(["FX.Cards.Neutral.ZenRui"])
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_bloodtearalchemist_death.audio
        receiveDamage : RSX.sfx_neutral_archonspellbinder_hit.audio
        attackDamage : RSX.sfx_neutral_archonspellbinder_attack_impact.audio
        death : RSX.sfx_neutral_archonspellbinder_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6YnuytTrackerBreathing.name
        idle : RSX.f6YnuytTrackerIdle.name
        walk : RSX.f6YnuytTrackerRun.name
        attack : RSX.f6YnuytTrackerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.f6YnuytTrackerHit.name
        death : RSX.f6YnuytTrackerDeath.name
      )

    if (identifier == Cards.Spell.SnowballBBS)
      card = new SpellDamage(gameSession)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.SnowballBBS
      card.setIsHiddenInCollection(true)
      card.name = "Lesser Waterball"
      card.setDescription("Deal 4 damage to an enemy minion.")
      card.manaCost = 1
      card.damageAmount = 4
      card.rarityId = Rarity.Fixed
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.canTargetGeneral = false
      card.setFXResource(["FX.Cards.Spell.LesserWaterball"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_icepillar.audio
      )
      card.setBaseAnimResource(
        idle: RSX.iconWaterballIdle.name
        active: RSX.iconWaterballActive.name
      )

    if (identifier == Cards.Faction6.ManaThief)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Faction6
      card.name = "Malicious Wisp"
      card.setDescription("Opening Gambit: Take a mana crystal from your opponent.\nDying Wish: Give back the mana crystal.")
      card.atk = 4
      card.maxHP = 3
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([
        ModifierOpeningGambitDestroyManaCrystal.createContextObject(false,1),
        ModifierOpeningGambitBonusManaCrystal.createContextObject(true,1),
        ModifierDyingWishDestroyManaCrystal.createContextObject(true,1),
        ModifierDyingWishBonusManaCrystal.createContextObject(false,1)
      ])
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
        breathing : RSX.f6EvilWispBreathing.name
        idle : RSX.f6EvilWispIdle.name
        walk : RSX.f6EvilWispRun.name
        attack : RSX.f6EvilWispAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f6EvilWispHit.name
        death : RSX.f6EvilWispDeath.name
      )

    if (identifier == Cards.Spell.EnterThunderdome)
      card = new SpellSpawnEntitiesOnEdgeSpaces(gameSession)
      card.factionId = Factions.Faction6
      card.setCardSetId(CardSet.Coreshatter)
      card.id = Cards.Spell.EnterThunderdome
      card.name = "Ice Age"
      card.setDescription("Summon Blazing Spines along the outside of the battlefield.")
      card.cardDataOrIndexToSpawn = {id: Cards.Faction6.BlazingSpines}
      card.manaCost = 8
      card.rarityId = Rarity.Legendary
      card.spellFilterType = SpellFilterType.None
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.IceAge"])
      card.setBaseAnimResource(
        idle : RSX.iconEnterIcedomeIdle.name
        active : RSX.iconEnterIcedomeActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_ghostlightning.audio
      )

    if (identifier == Cards.Faction6.Rootmancer)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Faction6
      card.name = "Thicket Augur"
      card.setDescription("Intensify: Summon 1 Treant with Provoke nearby.")
      card.atk = 1
      card.maxHP = 1
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([
        ModifierIntensifySpawnEntitiesNearby.createContextObject({id: Cards.Faction6.Treant}, 1),
        ModifierCounterIntensify.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierProvoke)
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Neutral.Amu"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f6_voiceofthewind_attack_swing.audio
        walk : RSX.sfx_spell_polymorph.audio
        attack : RSX.sfx_neutral_amu_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_amu_hit.audio
        attackDamage : RSX.sfx_neutral_amu_attack_impact.audio
        death : RSX.sfx_neutral_amu_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6RootmancerBreathing.name
        idle : RSX.f6RootmancerIdle.name
        walk : RSX.f6RootmancerRun.name
        attack : RSX.f6RootmancerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.f6RootmancerHit.name
        death : RSX.f6RootmancerDeath.name
      )

    if (identifier == Cards.Faction6.SuperFenrir)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Faction6
      card.name = "Fenrir Berserker"
      card.setDescription("Dying Wish: Summon a Fenrir Warmaster on this space.")
      card.atk = 4
      card.maxHP = 3
      card.manaCost = 5
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ ModifierDyingWishSpawnEntity.createContextObject({id: Cards.Faction6.FenrirWarmaster}) ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
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
        breathing : RSX.f6SuperFenrirBreathing.name
        idle : RSX.f6SuperFenrirIdle.name
        walk : RSX.f6SuperFenrirRun.name
        attack : RSX.f6SuperFenrirAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f6SuperFenrirHit.name
        death : RSX.f6SuperFenrirDeath.name
      )

    if (identifier == Cards.Faction6.SnowWinkle)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Faction6
      card.name = "Meltwater Moose"
      card.setDescription("When this minion is summoned, Stun it.")
      card.atk = 6
      card.maxHP = 7
      card.manaCost = 4
      card.rarityId = Rarity.Common
      card.raceId = Races.Vespyr
      card.setInherentModifiersContextObjects([
        ModifierEntersBattlefieldWatchApplyModifiers.createContextObject([ModifierStunnedVanar.createContextObject()])
      ])
      card.addKeywordClassToInclude(ModifierStun)
      card.setFXResource(["FX.Cards.Neutral.DragoneboneGolem"])
      card.setBoundingBoxWidth(95)
      card.setBoundingBoxHeight(95)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_2.audio
        walk : RSX.sfx_unit_physical_4.audio
        attack : RSX.sfx_neutral_golemdragonbone_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_golemdragonbone_hit.audio
        attackDamage : RSX.sfx_neutral_golemdragonbone_impact.audio
        death : RSX.sfx_neutral_golemdragonbone_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6ElkodonBreathing.name
        idle : RSX.f6ElkodonIdle.name
        walk : RSX.f6ElkodonRun.name
        attack : RSX.f6ElkodonAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f6ElkodonHit.name
        death : RSX.f6ElkodonDeath.name
      )

    if (identifier == Cards.Spell.IceCapsule)
      card = new SpellApplyModifiersToExhaustedMinion(gameSession)
      card.factionId = Factions.Faction6
      card.setCardSetId(CardSet.Coreshatter)
      card.id = Cards.Spell.IceCapsule
      card.name = "Cryonic Potential"
      card.setDescription("Give an exhausted friendly minion +6/+6.")
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.AllyDirect
      card.canTargetGeneral = false
      buffContextObject = Modifier.createContextObjectWithAttributeBuffs(6,6)
      buffContextObject.appliedName = "Potential Realized"
      card.setTargetModifiersContextObjects([
        buffContextObject
      ])
      card.setFXResource(["FX.Cards.Spell.CryonicPotential"])
      card.setBaseAnimResource(
        idle: RSX.iconIceCapsuleIdle.name
        active: RSX.iconIceCapsuleActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_icepillar.audio
      )

    if (identifier == Cards.Spell.OwnSideTeleport)
      card = new SpellIntensifyTeleportOwnSide(gameSession)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.OwnSideTeleport
      card.setCardSetId(CardSet.Coreshatter)
      card.name = "Wanderlust"
      card.setDescription("Intensify: Teleport 1 random enemy minion to a space on your starting side of the battlefield.")
      card.spellFilterType = SpellFilterType.None
      card.manaCost = 1
      card.rarityId = Rarity.Common
      card.addKeywordClassToInclude(ModifierIntensify)
      card.setInherentModifiersContextObjects([ModifierCounterIntensify.createContextObject()])
      card._fxResource = ["FX.Cards.Spell.Wanderlust"]
      card.setBaseAnimResource(
        idle: RSX.iconIceHooksIdle.name
        active: RSX.iconIceHooksActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_tranquility.audio
      )

    if (identifier == Cards.Faction6.StunWarlock)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Faction6
      card.name = "Disciple of Yggdra"
      card.setDescription("When an enemy is Stunned, transform this minion into Yggdra's Voracity.")
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([
        ModifierEnemyStunWatchTransformThis.createContextObject({id: Cards.Faction6.StunBeast})
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.addKeywordClassToInclude(ModifierStunned)
      card.setFXResource(["FX.Cards.Neutral.AzureHornShaman"])
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(105)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_fractalreplication.audio
        walk : RSX.sfx_unit_run_magical_3.audio
        attack : RSX.sfx_neutral_prophetofthewhite_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_alcuinloremaster_hit.audio
        attackDamage : RSX.sfx_neutral_alcuinloremaster_attack_impact.audio
        death : RSX.sfx_neutral_alcuinloremaster_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6YnuytWarlockBreathing.name
        idle : RSX.f6YnuytWarlockIdle.name
        walk : RSX.f6YnuytWarlockRun.name
        attack : RSX.f6YnuytWarlockAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f6YnuytWarlockHit.name
        death : RSX.f6YnuytWarlockDeath.name
      )

    if (identifier == Cards.Faction6.StunBeast)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Faction6
      card.setIsHiddenInCollection(true)
      card.name = "Yggdra's Voracity"
      card.setDescription("Whenever an enemy is Stunned, fully heal this minion.")
      card.atk = 5
      card.maxHP = 5
      card.manaCost = 3
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([
        ModifierEnemyStunWatchFullyHeal.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierToken)
      card.addKeywordClassToInclude(ModifierStunned)
      card.setFXResource(["FX.Cards.Neutral.OwlbeastSage"])
      card.setBoundingBoxWidth(85)
      card.setBoundingBoxHeight(80)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_arcanelimiter_attack_impact.audio
        receiveDamage : RSX.sfx_f4_engulfingshadow_attack_impact.audio
        attackDamage : RSX.sfx_f4_engulfingshadow_hit.audio
        death : RSX.sfx_f4_engulfingshadow_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6YnuytUnleashedBreathing.name
        idle : RSX.f6YnuytUnleashedIdle.name
        walk : RSX.f6YnuytUnleashedRun.name
        attack : RSX.f6YnuytUnleashedAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f6YnuytUnleashedHit.name
        death : RSX.f6YnuytUnleashedDeath.name
      )

    if (identifier == Cards.Spell.InfiniteHowlers)
      card = new SpellInfiniteHowlers(gameSession)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.InfiniteHowlers
      card.setCardSetId(CardSet.Coreshatter)
      card.name = "Endless Hunt"
      card.setDescription("Summon a 3/3 Vespyr Night Howler.\nPut an Endless Hunt into your action bar.")
      card.manaCost = 4
      card.spellFilterType = SpellFilterType.SpawnSource
      card.rarityId = Rarity.Rare
      card.cardDataOrIndexToSpawn = {id: Cards.Faction6.ShadowVespyr}
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.EndlessHunt"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_entropicdecay.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconInfiniteHowlersIdle.name
        active : RSX.iconInfiniteHowlersActive.name
      )

    if (identifier == Cards.Artifact.SnowChipper)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Faction6
      card.id = Cards.Artifact.SnowChipper
      card.name = "Resonance Scythe"
      card.setDescription("Your General has +1 Attack.\nReactivate your General whenever they destroy a Stunned enemy.")
      card.manaCost = 2
      card.rarityId = Rarity.Epic
      card.durability = 3
      card.setTargetModifiersContextObjects([
        Modifier.createContextObjectWithAttributeBuffs(1,undefined),
        ModifierKillWatchRefreshExhaustionIfTargetStunned.createContextObject(false, true)
      ])
      card.addKeywordClassToInclude(ModifierStunned)
      card.setFXResource(["FX.Cards.Artifact.OblivionSickle"])
      card.setBaseAnimResource(
        idle: RSX.iconSnowchipperIdle.name
        active: RSX.iconSnowchipperActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Spell.AspectOfIdentity)
      card = new SpellTransformSameManaCost(gameSession)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.AspectOfIdentity
      card.setCardSetId(CardSet.Coreshatter)
      card.name = "Aspect of Ego"
      card.setDescription("Transform ANY minion into a random minion of the same cost.")
      card.manaCost = 1
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.canTargetGeneral = false
      card.rarityId = Rarity.Rare
      card.setFXResource(["FX.Cards.Spell.AspectOfEgo"])
      card.setBaseAnimResource(
        idle : RSX.iconAspectIdentityIdle.name
        active : RSX.iconAspectIdentityActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_crossbones_hit.audio
      )

    if (identifier == Cards.Spell.CreepingFrost)
      card = new SpellCreepingFrost(gameSession)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.CreepingFrost
      card.setCardSetId(CardSet.Coreshatter)
      card.name = "Permafrost"
      card.setDescription("Stun an enemy minion.\nStunned enemy minions Stun a nearby enemy.")
      card.manaCost = 3
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.canTargetGeneral = false
      card.rarityId = Rarity.Epic
      card.addKeywordClassToInclude(ModifierStunned)
      card.addKeywordClassToInclude(ModifierStun)
      card.setFXResource(["FX.Cards.Spell.Permafrost"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_windstopper_attack_impact.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconPermaFrostIdle.name
        active : RSX.iconPermaFrostActive.name
      )

    return card

module.exports = CardFactory_CoreshatterSet_Faction6
