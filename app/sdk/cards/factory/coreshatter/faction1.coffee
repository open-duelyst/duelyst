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
SpellIntensifyIncreasingDominance = require 'app/sdk/spells/spellIntensifyIncreasingDominance'
SpellBuffAttributeByOtherAttribute = require 'app/sdk/spells/spellBuffAttributeByOtherAttribute'
SpellResilience = require 'app/sdk/spells/spellResilience'
SpellRally = require 'app/sdk/spells/spellRally'
SpellChargeIntoBattle = require 'app/sdk/spells/spellChargeIntoBattle'
SpellOnceMoreWithProvoke = require 'app/sdk/spells/spellOnceMoreWithProvoke'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierBandingFlying = require 'app/sdk/modifiers/modifierBandingFlying'
ModifierProvoke = require 'app/sdk/modifiers/modifierProvoke'
ModifierIntensifyOneManArmy = require 'app/sdk/modifiers/modifierIntensifyOneManArmy'
ModifierFriendsguard = require 'app/sdk/modifiers/modifierFriendsguard'
ModifierMyGeneralAttackWatchSpawnRandomEntityFromDeck = require 'app/sdk/modifiers/modifierMyGeneralAttackWatchSpawnRandomEntityFromDeck'
ModifierStartsInHand = require 'app/sdk/modifiers/modifierStartsInHand'
ModifierTranscendance = require 'app/sdk/modifiers/modifierTranscendance'
ModifierInvulnerable = require 'app/sdk/modifiers/modifierInvulnerable'
ModifierCardControlledPlayerModifiers = require 'app/sdk/modifiers/modifierCardControlledPlayerModifiers'
ModifierBanding = require 'app/sdk/modifiers/modifierBanding'
ModifierStartTurnWatchImmolateDamagedMinions = require 'app/sdk/modifiers/modifierStartTurnWatchImmolateDamagedMinions'
ModifierOnSummonFromHandApplyEmblems = require 'app/sdk/modifiers/modifierOnSummonFromHandApplyEmblems'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'
ModifierFateLyonarSmallMinionQuest = require 'app/sdk/modifiers/modifierFateLyonarSmallMinionQuest'
ModifierCannotBeReplaced = require 'app/sdk/modifiers/modifierCannotBeReplaced'
ModifierIntensify = require 'app/sdk/modifiers/modifierIntensify'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'
ModifierOpeningGambit = require 'app/sdk/modifiers/modifierOpeningGambit'
ModifierCounterIntensify = require 'app/sdk/modifiers/modifierCounterIntensify'
ModifierCannotBeRemovedFromHand = require 'app/sdk/modifiers/modifierCannotBeRemovedFromHand'

PlayerModifierEmblemEndTurnWatchLyonarSmallMinionQuest = require 'app/sdk/playerModifiers/playerModifierEmblemEndTurnWatchLyonarSmallMinionQuest'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_CoreshatterSet_Faction1

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction1.RightfulHeir)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction1
      card.setCardSetId(CardSet.Coreshatter)
      card.name = "Grand Strategos"
      card.setDescription("Trial: Summon 12 minions with 1 or less Attack.\nDestiny: Promote other friendly minions at the end of your turn.")
      card.atk = 5
      card.maxHP = 5
      card.manaCost = 5
      card.rarityId = Rarity.Mythron
      emblemModifier = PlayerModifierEmblemEndTurnWatchLyonarSmallMinionQuest.createContextObject()
      emblemModifier.appliedName = "Grand Stratagem"
      emblemModifier.appliedDescription = "At the end of your turn, transform friendly minions other than Grand Strategos into faction minions that cost 1 more."
      card.setInherentModifiersContextObjects([
        ModifierStartsInHand.createContextObject(),
        ModifierCannotBeReplaced.createContextObject(),
        ModifierOnSummonFromHandApplyEmblems.createContextObject([emblemModifier], true, false),
        ModifierFateLyonarSmallMinionQuest.createContextObject(12),
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
        breathing : RSX.f1RightfulHeirBreathing.name
        idle : RSX.f1RightfulHeirIdle.name
        walk : RSX.f1RightfulHeirRun.name
        attack : RSX.f1RightfulHeirAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.3
        damage : RSX.f1RightfulHeirHit.name
        death : RSX.f1RightfulHeirDeath.name
      )

    if (identifier == Cards.Spell.IncreasingDominance)
      card = new SpellIntensifyIncreasingDominance(gameSession)
      card.factionId = Factions.Faction1
      card.setCardSetId(CardSet.Coreshatter)
      card.id = Cards.Spell.IncreasingDominance
      card.name = "Bolster"
      card.setDescription("Intensify: Give friendly minions +2 Health.")
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.modifierAppliedName = "Bolstered"
      card.spellFilterType = SpellFilterType.None
      card.addKeywordClassToInclude(ModifierIntensify)
      card.setInherentModifiersContextObjects([ModifierCounterIntensify.createContextObject()])
      card.setFXResource(["FX.Cards.Spell.Bolster"])
      card.setBaseAnimResource(
        idle: RSX.iconIncreasingDominanceIdle.name
        active: RSX.iconIncreasingDominanceActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_kineticequilibrium.audio
      )

    if (identifier == Cards.Faction1.OneManArmy)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Faction1
      card.name = "Legion"
      card.setDescription("Intensify: Put 1 Crestfallen into your action bar. Shuffle a copy of this minion into your deck.")
      card.atk = 3
      card.maxHP = 2
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([
        ModifierIntensifyOneManArmy.createContextObject(),
        ModifierCounterIntensify.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Faction1.SilverguardSquire"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1silverguardsquire_attack_swing.audio
        receiveDamage : RSX.sfx_f1silverguardsquire_hit.audio
        attackDamage : RSX.sfx_f1silverguardsquire_attack_impact.audio
        death : RSX.sfx_f1silverguardsquire_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1KaiserGladiatorBreathing.name
        idle : RSX.f1KaiserGladiatorIdle.name
        walk : RSX.f1KaiserGladiatorRun.name
        attack : RSX.f1KaiserGladiatorAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f1KaiserGladiatorHit.name
        death : RSX.f1KaiserGladiatorDeath.name
      )

    if (identifier == Cards.Faction1.CatapultGryphon)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Faction1
      card.name = "Gryphon Fledgling"
      card.setDescription("Zeal: Flying")
      card.atk = 5
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([
        ModifierBandingFlying.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierFlying)
      card.setFXResource(["FX.Cards.Neutral.WingsOfParadise"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_ubo_attack_swing.audio
        walk : RSX.sfx_neutral_ubo_attack_swing.audio
        attack : RSX.sfx_neutral_wingsofparadise_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_wingsofparadise_hit.audio
        attackDamage : RSX.sfx_neutral_wingsofparadise_attack_impact.audio
        death : RSX.sfx_neutral_wingsofparadise_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1GryphinoxBreathing.name
        idle : RSX.f1GryphinoxIdle.name
        walk : RSX.f1GryphinoxRun.name
        attack : RSX.f1GryphinoxAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f1GryphinoxHit.name
        death : RSX.f1GryphinoxDeath.name
      )

    if (identifier == Cards.Spell.DivinestBonderest)
      card = new SpellBuffAttributeByOtherAttribute(gameSession)
      card.factionId = Factions.Faction1
      card.setCardSetId(CardSet.Coreshatter)
      card.id = Cards.Spell.DivinestBonderest
      card.name = "Divine Liturgy"
      card.setDescription("Give all friendly minions +Attack equal to their Health.")
      card.manaCost = 6
      card.rarityId = Rarity.Rare
      card.spellFilterType = SpellFilterType.AllyIndirect
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.attributeTarget = "atk"
      card.attributeSource = "hp"
      card.appliedName = "Strength of Will"
      card.appliedDescription = "Gained +Attack equal to Health"
      card.setFXResource(["FX.Cards.Spell.DivineLiturgy"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f6_voiceofthewind_attack_impact.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconDivinestBondIdle.name
        active : RSX.iconDivinestBondActive.name
      )

    if (identifier == Cards.Spell.Resilience)
      card = new SpellResilience(gameSession)
      card.factionId = Factions.Faction1
      card.setCardSetId(CardSet.Coreshatter)
      card.id = Cards.Spell.Resilience
      card.name = "Lifestream"
      card.setDescription("Fully heal a friendly minion, then draw a copy of it from your deck.")
      card.manaCost = 1
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.AllyDirect
      card.canTargetGeneral = false
      card.setFXResource(["FX.Cards.Spell.Lifestream"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_fountainofyouth.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconLifestreamIdle.name
        active : RSX.iconLifestreamActive.name
      )

    if (identifier == Cards.Faction1.Friendsguard)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Faction1
      card.name = "Windcliffe Protector"
      card.setDescription("Provoke\nWhen a friendly Windcliffe Alarmist dies, transform this minion into a Windcliffe Alarmist.")
      card.atk = 5
      card.maxHP = 5
      card.manaCost = 5
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([
        ModifierProvoke.createContextObject(),
        ModifierFriendsguard.createContextObject({id: Cards.Faction1.FriendFighter})
      ])
      card.setFXResource(["FX.Cards.Neutral.GoldenJusticar"])
      card.setBoundingBoxWidth(105)
      card.setBoundingBoxHeight(100)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_neutral_earthwalker_death.audio
        attack : RSX.sfx_f5_vindicator_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_grimrock_hit.audio
        attackDamage : RSX.sfx_neutral_grimrock_attack_impact.audio
        death : RSX.sfx_neutral_grimrock_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1FriendsGuardBreathing.name
        idle : RSX.f1FriendsGuardIdle.name
        walk : RSX.f1FriendsGuardRun.name
        attack : RSX.f1FriendsGuardAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.f1FriendsGuardHit.name
        death : RSX.f1FriendsGuardDeath.name
      )

    if (identifier == Cards.Faction1.FriendFighter)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Faction1
      card.name = "Windcliffe Alarmist"
      card.setDescription("Opening Gambit: Summon a 5/5 Windcliffe Protector with Provoke from your deck.")
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 4
      card.rarityId = Rarity.Common
      card.setFollowups([
        {
          id: Cards.Spell.FollowupSpawnEntityFromDeck
        }
      ])
      card.addKeywordClassToInclude(ModifierOpeningGambit)
      card.addKeywordClassToInclude(ModifierProvoke)
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
        breathing : RSX.f1BaastChampionBreathing.name
        idle : RSX.f1BaastChampionIdle.name
        walk : RSX.f1BaastChampionRun.name
        attack : RSX.f1BaastChampionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f1BaastChampionHit.name
        death : RSX.f1BaastChampionDeath.name
      )

    if (identifier == Cards.Spell.Rally)
      card = new SpellRally(gameSession)
      card.factionId = Factions.Faction1
      card.setCardSetId(CardSet.Coreshatter)
      card.id = Cards.Spell.Rally
      card.name = "Marching Orders"
      card.setDescription("Give friendly minions directly in front of and behind your General +2/+2.  If they have Zeal, they cannot be targeted by enemy spells.")
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.buffName = "Marching Command"
      card.spellFilterType = SpellFilterType.None
      card.canTargetGeneral = false
      card.addKeywordClassToInclude(ModifierBanding)
      card.setFXResource(["FX.Cards.Spell.MarchingOrders"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_forcebarrier.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconRallyIdle.name
        active : RSX.iconRallyActive.name
      )

    if (identifier == Cards.Artifact.TwoHander)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Faction1
      card.id = Cards.Artifact.TwoHander
      card.name = "Radiant Standard"
      card.setDescription("Your General has +3 Attack.\nWhen your General attacks, summon a minion that costs 3 from your deck nearby.")
      card.manaCost = 6
      card.rarityId = Rarity.Epic
      card.durability = 3
      card.setTargetModifiersContextObjects([
        Modifier.createContextObjectWithAttributeBuffs(3,undefined),
        ModifierMyGeneralAttackWatchSpawnRandomEntityFromDeck.createContextObject(3,true,1)
      ])
      card.setFXResource(["FX.Cards.Artifact.SunstoneBracers"])
      card.setBaseAnimResource(
        idle: RSX.iconIronBannerIdle.name
        active: RSX.iconIronBannerActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Spell.ChargeIntoBattle)
      card = new SpellChargeIntoBattle(gameSession)
      card.factionId = Factions.Faction1
      card.setCardSetId(CardSet.Coreshatter)
      card.id = Cards.Spell.ChargeIntoBattle
      card.name = "Lionize"
      card.setDescription("Give Celerity to a friendly minion directly behind your General.")
      card.manaCost = 5
      card.rarityId = Rarity.Epic
      card.spellFilterType = SpellFilterType.AllyDirect
      card.canTargetGeneral = false
      celerityObject = ModifierTranscendance.createContextObject()
      card.setTargetModifiersContextObjects([
        celerityObject
      ])
      card.addKeywordClassToInclude(ModifierTranscendance)
      card.setFXResource(["FX.Cards.Spell.Lionize"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_arakiheadhunter_attack_swing.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconChargeIntoBattleIdle.name
        active : RSX.iconChargeIntoBattleActive.name
      )

    if (identifier == Cards.Faction1.Invincibuddy)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Faction1
      card.name = "Indominus"
      card.setDescription("Your General is Invulnerable BUT cannot move or attack.")
      card.atk = 7
      card.maxHP = 9
      card.manaCost = 7
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([
        ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetOwnPlayer([ModifierInvulnerable.createContextObject()])
      ])
      card.addKeywordClassToInclude(ModifierInvulnerable)
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(60)
      card.setFXResource(["FX.Cards.Neutral.BlisteringSkorn"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_icepillar_melt.audio
        walk : RSX.sfx_neutral_primordialgazer_death.audio
        attack : RSX.sfx_neutral_pandora_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_makantorwarbeast_hit.audio
        attackDamage : RSX.sfx_neutral_makantorwarbeast_attack_impact.audio
        death : RSX.sfx_neutral_makantorwarbeast_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1InvincibuddyBreathing.name
        idle : RSX.f1InvincibuddyIdle.name
        walk : RSX.f1InvincibuddyRun.name
        attack : RSX.f1InvincibuddyAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f1InvincibuddyHit.name
        death : RSX.f1InvincibuddyDeath.name
      )

    if (identifier == Cards.Faction1.SuntideExpert)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Faction1
      card.name = "War Exorcist"
      card.setDescription("Provoke\nAt the start of your turn, Holy Immolation your damaged minions.")
      card.atk = 3
      card.maxHP = 8
      card.manaCost = 5
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([
        ModifierProvoke.createContextObject(),
        ModifierStartTurnWatchImmolateDamagedMinions.createContextObject()
      ])
      card.setFXResource(["FX.Cards.Neutral.Grailmaster"])
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(105)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_neutral_sai_attack_impact.audio
        attack : RSX.sfx_neutral_spiritscribe_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_spiritscribe_hit.audio
        attackDamage : RSX.sfx_neutral_spiritscribe_impact.audio
        death : RSX.sfx_neutral_spiritscribe_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1LeovoyantBreathing.name
        idle : RSX.f1LeovoyantIdle.name
        walk : RSX.f1LeovoyantRun.name
        attack : RSX.f1LeovoyantAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.f1LeovoyantHit.name
        death : RSX.f1LeovoyantDeath.name
      )

    if (identifier == Cards.Spell.OnceMoreWithProvoke)
      card = new SpellOnceMoreWithProvoke(gameSession)
      card.factionId = Factions.Faction1
      card.setCardSetId(CardSet.Coreshatter)
      card.id = Cards.Spell.OnceMoreWithProvoke
      card.name = "Amaranthine Vow"
      card.setDescription("Summon around your General all friendly minions with Provoke that died this game.")
      card.manaCost = 9
      card.rarityId = Rarity.Legendary
      card.addKeywordClassToInclude(ModifierProvoke)
      card.setFXResource(["FX.Cards.Spell.AmaranthineVow"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_sunbloom.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconOnceMoreIdle.name
        active : RSX.iconOnceMoreActive.name
      )

    return card

module.exports = CardFactory_CoreshatterSet_Faction1
