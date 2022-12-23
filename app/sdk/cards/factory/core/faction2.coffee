# do not add this file to a package
# it is specifically parsed by the package generation script

_ = require 'underscore'
moment = require 'moment'

Logger = require 'app/common/logger'

CONFIG = require('app/common/config')
config = require('config/config')
RSX = require('app/data/resources')

Card = require 'app/sdk/cards/card'
Cards = require 'app/sdk/cards/cardsLookupComplete'
CardType = require 'app/sdk/cards/cardType'
Factions = require 'app/sdk/cards/factionsLookup'
FactionFactory = require 'app/sdk/cards/factionFactory'
Races = require 'app/sdk/cards/racesLookup'
Rarity = require 'app/sdk/cards/rarityLookup'

Unit = require 'app/sdk/entities/unit'
Artifact = require 'app/sdk/artifacts/artifact'

Spell = require 'app/sdk/spells/spell'
SpellFilterType = require 'app/sdk/spells/spellFilterType'
SpellDamage = require 'app/sdk/spells/spellDamage'
SpellApplyModifiers = require 'app/sdk/spells/spellApplyModifiers'
SpellTwinStrike = require 'app/sdk/spells/spellTwinStrike'
SpellRemoveAndReplaceEntity = require 'app/sdk/spells/spellRemoveAndReplaceEntity'
SpellMartyrdom = require 'app/sdk/spells/spellMartyrdom'
SpellRemoveArtifacts = require 'app/sdk/spells/spellRemoveArtifacts'
SpellApplyPlayerModifiers = require 'app/sdk/spells/spellApplyPlayerModifiers'
SpellHeavensEclipse = require 'app/sdk/spells/spellHeavensEclipse'
SpellInnerFocus = require 'app/sdk/spells/spellInnerFocus'
SpellMistWalking = require 'app/sdk/spells/spellMistWalking'
SpellKillingEdge = require 'app/sdk/spells/spellKillingEdge'
SpellJuxtaposition = require 'app/sdk/spells/spellJuxtaposition'
SpellSpawnEntityNearbyGeneral = require 'app/sdk/spells/spellSpawnEntityNearbyGeneral'
SpellAncestralDivination = require 'app/sdk/spells/spellAncestralDivination'
SpellSwordsBBS = require 'app/sdk/spells/spellSwordsBBS'
SpellApplyModifiersToGeneral = require 'app/sdk/spells/spellApplyModifiersToGeneral'
SpellDrawCardEndOfTurn = require 'app/sdk/spells/spellDrawCardEndOfTurn'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierRanged = require 'app/sdk/modifiers/modifierRanged'
ModifierImmuneToAttacks = require 'app/sdk/modifiers/modifierImmuneToAttacks'
ModifierFirstBlood = require 'app/sdk/modifiers/modifierFirstBlood'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'
ModifierSpellWatchApplyModifiers = require 'app/sdk/modifiers/modifierSpellWatchApplyModifiers'
ModifierSpellWatchDamageGeneral = require 'app/sdk/modifiers/modifierSpellWatchDamageGeneral'
ModifierStartTurnWatchDamageMyGeneral = require 'app/sdk/modifiers/modifierStartTurnWatchDamageMyGeneral'
ModifierBackstab = require 'app/sdk/modifiers/modifierBackstab'
ModifierMyAttackWatchBuffSelf = require 'app/sdk/modifiers/modifierMyAttackWatchBuffSelf'
ModifierDealDamageWatchKillTarget = require 'app/sdk/modifiers/modifierDealDamageWatchKillTarget'
ModifierSpellWatchBloodLeech = require 'app/sdk/modifiers/modifierSpellWatchBloodLeech'
ModifierOpeningGambitApplyPlayerModifiers = require 'app/sdk/modifiers/modifierOpeningGambitApplyPlayerModifiers'
ModifierStartTurnWatchBounceToActionBar = require 'app/sdk/modifiers/modifierStartTurnWatchBounceToActionBar'
ModifierTakeDamageWatchDamageEnemy = require 'app/sdk/modifiers/modifierTakeDamageWatchDamageEnemy'
ModifierSpellDamageWatchPutCardInHand = require 'app/sdk/modifiers/modifierSpellDamageWatchPutCardInHand'
ModifierTakeDamageWatchPutCardInHand = require 'app/sdk/modifiers/modifierTakeDamageWatchPutCardInHand'
ModifierToken = require 'app/sdk/modifiers/modifierToken'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

PlayerModifierManaModifier = require 'app/sdk/playerModifiers/playerModifierManaModifier'
PlayerModifierManaModifierSingleUse = require 'app/sdk/playerModifiers/playerModifierManaModifierSingleUse'
PlayerModifierSpellDamageModifier = require 'app/sdk/playerModifiers/playerModifierSpellDamageModifier'
PlayerModifierCardDrawModifier = require 'app/sdk/playerModifiers/playerModifierCardDrawModifier'

WartechGeneralFaction2Achievement = require 'app/sdk/achievements/wartechAchievements/wartechGeneralFaction2Achievement'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_CoreSet_Faction2

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction2.General)
      card = new Unit(gameSession)
      card.setIsGeneral(true)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_kaelos_name")
      card.manaCost = 0
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(120)
      card.setPortraitResource(RSX.general_portrait_image_f2)
      card.setPortraitHexResource(RSX.general_portrait_image_hex_f2)
      card.setSpeechResource(RSX.speech_portrait_songhai)
      card.setConceptResource(RSX.general_f2)
      card.setAnnouncerFirstResource(RSX.sfx_announcer_songhai_1st)
      card.setAnnouncerSecondResource(RSX.sfx_announcer_songhai_2nd)
      card.setFXResource(["FX.Cards.Faction2.General"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f2general_attack_swing.audio
        receiveDamage : RSX.sfx_f2general_hit.audio
        attackDamage : RSX.sfx_f2general_attack_impact.audio
        death : RSX.sfx_f2general_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2GeneralBreathing.name
        idle : RSX.f2GeneralIdle.name
        walk : RSX.f2GeneralRun.name
        attack : RSX.f2GeneralAttack.name
        attackReleaseDelay: 0.2
        attackDelay: 0.5
        damage : RSX.f2GeneralDamage.name
        death : RSX.f2GeneralDeath.name
        castStart : RSX.f2GeneralCastStart.name
        castEnd : RSX.f2GeneralCastEnd.name
        castLoop : RSX.f2GeneralCastLoop.name
        cast : RSX.f2GeneralCast.name
      )
      card.atk = 2
      card.maxHP = 25
      card.signatureCardData = {id: Cards.Spell.Blink}
      card.setDescription(i18next.t("cards.faction_2_unit_kaelos_desc"))

    if (identifier == Cards.Faction2.AltGeneral)
      card = new Unit(gameSession)
      if !config.get('allCardsAvailable')?
        card.setIsUnlockableBasic(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_reva_name")
      card.manaCost = 0
      card.setBoundingBoxWidth(85)
      card.setBoundingBoxHeight(90)
      card.setPortraitResource(RSX.general_portrait_image_f2alt)
      card.setPortraitHexResource(RSX.general_portrait_image_hex_f2Alt1)
      card.setSpeechResource(RSX.speech_portrait_songhaialt)
      card.setConceptResource(RSX.general_f2alt)
      card.setAnnouncerFirstResource(RSX.sfx_announcer_songhai_1st)
      card.setAnnouncerSecondResource(RSX.sfx_announcer_songhai_2nd)
      card.setFXResource(["FX.Cards.Faction2.RevaEventide"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_neutral_ladylocke_attack_impact.audio
        attack : RSX.sfx_f2general_attack_swing.audio
        receiveDamage : RSX.sfx_f2general_hit.audio
        attackDamage : RSX.sfx_f2general_attack_impact.audio
        death : RSX.sfx_f2general_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2AltGeneralBreathing.name
        idle : RSX.f2AltGeneralIdle.name
        walk : RSX.f2AltGeneralRun.name
        attack : RSX.f2AltGeneralAttack.name
        attackReleaseDelay: 0.2
        attackDelay: 1.0
        damage : RSX.f2AltGeneralHit.name
        death : RSX.f2AltGeneralDeath.name
        castStart : RSX.f2AltGeneralCastStart.name
        castEnd : RSX.f2AltGeneralCastEnd.name
        castLoop : RSX.f2AltGeneralCastLoop.name
        cast : RSX.f2AltGeneralCast.name
      )
      card.atk = 2
      card.maxHP = 25
      card.signatureCardData = {id: Cards.Spell.ArcaneHeart}
      card.setDescription(i18next.t("cards.faction_2_unit_reva_desc"))

    if (identifier == Cards.Faction2.ThirdGeneral)
      card = new Unit(gameSession)
      card.setIsGeneral(true)
      if !config.get('allCardsAvailable')?
        card.setIsUnlockableWithAchievement(true)
        card.setIsUnlockedWithAchievementId(WartechGeneralFaction2Achievement.id)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_shidai_name")
      card.setDescription(i18next.t("cards.faction_2_unit_shidai_desc"))
      card.manaCost = 0
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(120)
      card.setPortraitResource(RSX.general_portrait_image_f2)
      card.setPortraitHexResource(RSX.general_portrait_image_hex_f2Third)
      card.setSpeechResource(RSX.speech_portrait_songhaithird)
      card.setConceptResource(RSX.general_f2third)
      card.setAnnouncerFirstResource(RSX.sfx_announcer_songhai_1st)
      card.setAnnouncerSecondResource(RSX.sfx_announcer_songhai_2nd)
      card.setFXResource(["FX.Cards.Faction2.RevaEventide"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_neutral_ladylocke_attack_impact.audio
        attack : RSX.sfx_neutral_whitewidow_attack_swing.audio
        receiveDamage : RSX.sfx_f2general_hit.audio
        attackDamage : RSX.sfx_f2general_attack_impact.audio
        death : RSX.sfx_f2general_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2ThirdGeneralBreathing.name
        idle : RSX.f2ThirdGeneralIdle.name
        walk : RSX.f2ThirdGeneralRun.name
        attack : RSX.f2ThirdGeneralAttack.name
        attackReleaseDelay: 0.2
        attackDelay: 1.0
        damage : RSX.f2ThirdGeneralHit.name
        death : RSX.f2ThirdGeneralDeath.name
        castStart : RSX.f2ThirdGeneralCastStart.name
        castEnd : RSX.f2ThirdGeneralCastEnd.name
        castLoop : RSX.f2ThirdGeneralCastLoop.name
        cast : RSX.f2ThirdGeneralCast.name
      )
      card.atk = 2
      card.maxHP = 25
      card.signatureCardData = {id: Cards.Spell.SwordsBBS}

    if (identifier == Cards.Faction2.Heartseeker)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_heartseeker_name")
      card.setDescription(i18next.t("cards.faction_2_unit_heartseeker_desc"))
      card.setBoundingBoxWidth(50)
      card.setBoundingBoxHeight(50)
      card.setFXResource(["FX.Cards.Faction2.Heartseeker"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1windbladecommander_attack_swing.audio
        receiveDamage : RSX.sfx_f1windbladecommander_hit.audio
        attackDamage : RSX.sfx_f1windbladecommanderattack_impact.audio
        death : RSX.sfx_neutral_gambitgirl_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2CasterBreathing.name
        idle : RSX.f2CasterIdle.name
        walk : RSX.f2CasterRun.name
        attack : RSX.f2CasterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.25
        damage : RSX.f2CasterDamage.name
        death : RSX.f2CasterDeath.name
      )
      card.atk = 1
      card.maxHP = 1
      card.manaCost = 1
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ ModifierRanged.createContextObject()  ])

    if (identifier == Cards.Faction2.Widowmaker)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_widowmaker_name")
      card.setDescription(i18next.t("cards.faction_2_unit_widowmaker_desc"))
      card.setFXResource(["FX.Cards.Faction2.Widowmaker"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1_grandmasterzir_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_luxignis_hit.audio
        attackDamage : RSX.sfx_f1silverguardsquire_attack_impact.audio
        death : RSX.sfx_f1_grandmasterzir_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2RangedBreathing.name
        idle : RSX.f2RangedIdle.name
        walk : RSX.f2RangedRun.name
        attack : RSX.f2RangedAttack.name
        attackReleaseDelay: 0.2
        attackDelay: 0.3
        damage : RSX.f2RangedDamage.name
        death : RSX.f2RangedDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Fixed
      card.setInherentModifiersContextObjects([ModifierRanged.createContextObject()])

    if (identifier == Cards.Faction2.KaidoAssassin)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_kaido_assassin_name")
      card.setFXResource(["FX.Cards.Faction2.KaidoAssassin"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_unit_run_magical_3.audio
        attack : RSX.sfx_f2_kaidoassassin_attack_swing.audio
        receiveDamage : RSX.sfx_f2_kaidoassassin_hit.audio
        attackDamage : RSX.sfx_f2_kaidoassassin_attack_impact.audio
        death : RSX.sfx_f2_kaidoassassin_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2MeleeBreathing.name
        idle : RSX.f2MeleeIdle.name
        walk : RSX.f2MeleeRun.name
        attack : RSX.f2MeleeAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f2MeleeDamage.name
        death : RSX.f2MeleeDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.Fixed
      card.setInherentModifiersContextObjects([ModifierBackstab.createContextObject(1)])
      card.setDescription(i18next.t("cards.faction_2_unit_kaido_assassin_desc"))
      card.addKeywordClassToInclude(ModifierBackstab)

    if (identifier == Cards.Faction2.ScarletViper)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_scarlet_viper_name")
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
        breathing : RSX.f2SupportBreathing.name
        idle : RSX.f2SupportIdle.name
        walk : RSX.f2SupportRun.name
        attack : RSX.f2SupportAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.25
        damage : RSX.f2SupportDamage.name
        death : RSX.f2SupportDeath.name
      )
      card.atk = 2
      card.maxHP = 5
      card.manaCost = 5
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierFlying.createContextObject(), ModifierBackstab.createContextObject(4)])
      card.setDescription(i18next.t("cards.faction_2_unit_scarlet_viper_desc"))
      card.addKeywordClassToInclude(ModifierBackstab)
      card.addKeywordClassToInclude(ModifierFlying)

    if (identifier == Cards.Faction2.GoreHorn)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_gorehorn_name")
      card.setBoundingBoxWidth(90)
      card.setBoundingBoxHeight(90)
      card.setFXResource(["FX.Cards.Faction2.GoreHorn"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f2tank_attack_swing.audio
        receiveDamage : RSX.sfx_f2tank_hit.audio
        attackDamage : RSX.sfx_f2tank_attack_impact.audio
        death : RSX.sfx_f2tank_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2TankBreathing.name
        idle : RSX.f2TankIdle.name
        walk : RSX.f2TankRun.name
        attack : RSX.f2TankAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.f2TankDamage.name
        death : RSX.f2TankDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Rare

      attackWatchAttackBuff = 1
      attackWatchHealthBuff = 1
      attackWatchBuffSelf = ModifierMyAttackWatchBuffSelf.createContextObject(attackWatchAttackBuff,attackWatchHealthBuff)
      card.setInherentModifiersContextObjects([
        attackWatchBuffSelf
        ModifierBackstab.createContextObject(2)
      ])
      card.setDescription(i18next.t("cards.faction_2_unit_gorehorn_desc"))
      card.addKeywordClassToInclude(ModifierBackstab)

    if (identifier == Cards.Faction2.OnyxBear)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction2
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.faction_2_unit_panddo_name")
      card.setBoundingBoxWidth(50)
      card.setBoundingBoxHeight(45)
      card.setFXResource(["FX.Cards.Faction2.OnyxBear"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_neutral_luxignis_hit.audio
        attack : RSX.sfx_f2_jadeogre_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_spelljammer_hit.audio
        attackDamage : RSX.sfx_neutral_spelljammer_attack_impact.audio
        death : RSX.sfx_neutral_spelljammer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2PanddoBreathing.name
        idle : RSX.f2PanddoIdle.name
        walk : RSX.f2PanddoRun.name
        attack : RSX.f2PanddoAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f2PanddoDamage.name
        death : RSX.f2PanddoDeath.name
      )
      card.atk = 0
      card.maxHP = 2
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([
        ModifierImmuneToAttacks.createContextObject()
      ])
      card.setDescription(i18next.t("cards.faction_2_unit_panddo_desc"))
      card.addKeywordClassToInclude(ModifierToken)
      

    if (identifier == Cards.Faction2.TuskBoar)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_tuskboar_name")
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(80)
      card.setFXResource(["FX.Cards.Faction2.TuskBoar"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_arakiheadhunter_hit.audio
        attack : RSX.sfx_f6_seismicelemental_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_golembloodshard_hit.audio
        attackDamage : RSX.sfx_f2lanternfox_death.audio
        death : RSX.sfx_f2lanternfox_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2SpecialBreathing.name
        idle : RSX.f2SpecialIdle.name
        walk : RSX.f2SpecialRun.name
        attack : RSX.f2SpecialAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.f2SpecialDamage.name
        death : RSX.f2SpecialDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([  ModifierFirstBlood.createContextObject(), ModifierStartTurnWatchBounceToActionBar.createContextObject()  ])
      card.setDescription(i18next.t("cards.faction_2_unit_tuskboar_desc"))

    if (identifier == Cards.Faction2.LanternFox)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_lantern_fox_name")
      card.setBoundingBoxWidth(80)
      card.setBoundingBoxHeight(55)
      card.setFXResource(["FX.Cards.Faction2.LanternFox"])
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f2lanternfox_attack_swing.audio
        receiveDamage : RSX.sfx_f2lanternfox_hit.audio
        attackDamage : RSX.sfx_f2lanternfox_attack_impact.audio
        death : RSX.sfx_f2lanternfox_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2LanternFoxBreathing.name
        idle : RSX.f2LanternFoxIdle.name
        walk : RSX.f2LanternFoxRun.name
        attack : RSX.f2LanternFoxAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f2LanternFoxDamage.name
        death : RSX.f2LanternFoxDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([ModifierTakeDamageWatchPutCardInHand.createContextObject({id: Cards.Spell.PhoenixFire})])
      card.setDescription(i18next.t("cards.faction_2_unit_lantern_fox_desc"))

    if (identifier == Cards.Faction2.JadeOgre)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_jade_monk_name")
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
        breathing : RSX.f2JadeOgreBreathing.name
        idle : RSX.f2JadeOgreIdle.name
        walk : RSX.f2JadeOgreRun.name
        attack : RSX.f2JadeOgreAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.f2JadeOgreDamage.name
        death : RSX.f2JadeOgreDeath.name
      )
      card.atk = 4
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ ModifierTakeDamageWatchDamageEnemy.createContextObject(1) ])
      card.setDescription(i18next.t("cards.faction_2_unit_jade_monk_desc"))

    if (identifier == Cards.Faction2.ChakriAvatar)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction2
      card.raceId = Races.Arcanyst
      if !config.get('allCardsAvailable')?
        card.setIsUnlockableBasic(true)
      card.name = i18next.t("cards.faction_2_unit_chakri_avatar_name")
      card.setFXResource(["FX.Cards.Faction2.ChakriAvatar"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f2_chakriavatar_attack_swing.audio
        receiveDamage : RSX.sfx_f2_chakriavatar_hit.audio
        attackDamage : RSX.sfx_f2_chakriavatar_attack_impact.audio
        death : RSX.sfx_f2_chakriavatar_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2ChakriAvatarBreathing.name
        idle : RSX.f2ChakriAvatarIdle.name
        walk : RSX.f2ChakriAvatarRun.name
        attack : RSX.f2ChakriAvatarAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.f2ChakriAvatarDamage.name
        death : RSX.f2ChakriAvatarDeath.name
      )
      card.atk = 1
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.Fixed
      statsBuff = Modifier.createContextObjectWithAttributeBuffs(1,1)
      statsBuff.appliedName = i18next.t("modifiers.faction_2_chakri_avatar_buff_name")
      card.setInherentModifiersContextObjects([ModifierSpellWatchApplyModifiers.createContextObject([statsBuff])])
      card.setDescription(i18next.t("cards.faction_2_unit_chakri_avatar_desc"))

    if (identifier == Cards.Faction2.MageOfFourWinds)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction2
      card.raceId = Races.Arcanyst
      card.name = i18next.t("cards.faction_2_unit_four_winds_magi_name")
      card.setFXResource(["FX.Cards.Faction2.MageOfFourWinds"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f2mage4winds_attack_swing.audio
        receiveDamage : RSX.sfx_f2mage4winds_hit.audio
        attackDamage : RSX.sfx_f2mage4winds_attack_impact.audio
        death : RSX.sfx_f2mage4winds_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2Mage4WindsBreathing.name
        idle : RSX.f2Mage4WindsIdle.name
        walk : RSX.f2Mage4WindsRun.name
        attack : RSX.f2Mage4WindsAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f2Mage4WindsDamage.name
        death : RSX.f2Mage4WindsDeath.name
      )
      card.atk = 4
      card.maxHP = 4
      card.manaCost = 4
      card.setInherentModifiersContextObjects([
        ModifierSpellWatchBloodLeech.createContextObject(1,1)
      ])
      card.rarityId = Rarity.Rare
      card.setDescription(i18next.t("cards.faction_2_unit_four_winds_magi_desc"))

    if (identifier == Cards.Faction2.CelestialPhantom)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_celestial_phantom_name")
      card.setBoundingBoxWidth(60)
      card.setBoundingBoxHeight(90)
      card.setFXResource(["FX.Cards.Faction2.CelestialPhantom"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f2_celestialphantom_attack_swing.audio
        receiveDamage :  RSX.sfx_f2_celestialphantom_hit.audio
        attackDamage : RSX.sfx_f2_celestialphantom_attack_impact.audio
        death : RSX.sfx_f2_celestialphantom_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2DeathPhantomBreathing.name
        idle : RSX.f2DeathPhantomIdle.name
        walk : RSX.f2DeathPhantomRun.name
        attack : RSX.f2DeathPhantomAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f2DeathPhantomDamage.name
        death : RSX.f2DeathPhantomDeath.name
      )
      card.atk = 1
      card.maxHP = 5
      card.manaCost = 3
      card.setInherentModifiersContextObjects([ModifierDealDamageWatchKillTarget.createContextObject()])
      card.rarityId = Rarity.Rare
      card.setDescription(i18next.t("cards.faction_2_unit_celestial_phantom_desc"))

    if (identifier == Cards.Faction2.StormKage)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_storm_kage_name")
      card.setFXResource(["FX.Cards.Faction2.StormKage"])
      card.setBoundingBoxWidth(60)
      card.setBoundingBoxHeight(105)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f2stormkage_attack_swing.audio
        receiveDamage :  RSX.sfx_f2stormkage_hit.audio
        attackDamage : RSX.sfx_f2stormkage_attack_impact.audio
        death : RSX.sfx_f2stormkage_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2StormKageBreathing.name
        idle : RSX.f2StormKageIdle.name
        walk : RSX.f2StormKageRun.name
        attack : RSX.f2StormKageAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.f2StormKageDamage.name
        death : RSX.f2StormKageDeath.name
      )
      card.atk = 5
      card.maxHP = 10
      card.manaCost = 7
      card.setInherentModifiersContextObjects([ModifierSpellDamageWatchPutCardInHand.createContextObject({id: Cards.Spell.KageLightning})])
      card.rarityId = Rarity.Legendary
      card.setDescription(i18next.t("cards.faction_2_unit_storm_kage_desc"))

    if (identifier == Cards.Faction2.HamonBlademaster)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_hamon_bladeseeker_name")
      card.setFXResource(["FX.Cards.Faction2.HamonBlademaster"])
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_unit_run_magical_4.audio
        attack : RSX.sfx_f2mage4winds_attack_swing.audio
        receiveDamage : RSX.sfx_f2mage4winds_hit.audio
        attackDamage : RSX.sfx_f2mage4winds_attack_impact.audio
        death : RSX.sfx_f2mage4winds_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2HammonBladeseekerBreathing.name
        idle : RSX.f2HammonBladeseekerIdle.name
        walk : RSX.f2HammonBladeseekerRun.name
        attack : RSX.f2HammonBladeseekerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.35
        damage : RSX.f2HammonBladeseekerDamage.name
        death : RSX.f2HammonBladeseekerDeath.name
      )
      card.maxHP = 8
      card.atk = 8
      card.manaCost = 5
      card.setInherentModifiersContextObjects([ModifierStartTurnWatchDamageMyGeneral.createContextObject(2)])
      card.rarityId = Rarity.Epic
      card.setDescription(i18next.t("cards.faction_2_unit_hamon_bladeseeker_desc"))

    if (identifier == Cards.Faction2.KeshraiFanblade)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_keshrai_fanblade_name")
      card.setFXResource(["FX.Cards.Faction2.KeshraiFanblade"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_2.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1elyxstormblade_attack_swing.audio
        receiveDamage : RSX.sfx_f1elyxstormblade_hit.audio
        attackDamage : RSX.sfx_f1elyxstormblade_attack_impact.audio
        death : RSX.sfx_f1elyxstormblade_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2KeshraiFanbladeBreathing.name
        idle : RSX.f2KeshraiFanbladeIdle.name
        walk : RSX.f2KeshraiFanbladeRun.name
        attack : RSX.f2KeshraiFanbladeAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f2KeshraiFanbladeDamage.name
        death : RSX.f2KeshraiFanbladeDeath.name
      )
      card.atk = 5
      card.maxHP = 3
      card.manaCost = 4
      customContextObject = PlayerModifierManaModifier.createCostChangeContextObject(2, CardType.Spell)
      customContextObject.durationEndTurn = 2 #lasts until end of opponent's next turn
      customContextObject.auraIncludeSignatureCards = true
      card.setInherentModifiersContextObjects([
        ModifierOpeningGambitApplyPlayerModifiers.createContextObjectToTargetEnemyPlayer([customContextObject], false)
      ])
      card.rarityId = Rarity.Common
      card.setDescription(i18next.t("cards.faction_2_unit_keshrai_fanblade_desc"))

    if (identifier == Cards.Spell.Blink)
      card = new Spell(gameSession)
      card.factionId = Factions.Faction2
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.Blink
      card.name = i18next.t("cards.faction_2_spell_blink_name")
      card.setDescription(i18next.t("cards.faction_2_spell_blink_description"))
      card.manaCost = 1
      card.spellFilterType = SpellFilterType.AllyDirect
      card.setFXResource(["FX.Cards.Spell.Blink"])
      card.setFollowups([
        {
          id: Cards.Spell.FollowupTeleport
          _private: {
            followupSourcePattern: CONFIG.PATTERN_2SPACES
          }
        }
      ])
      card.setBaseSoundResource(
        apply : RSX.sfx_loot_crate_reveal.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconBlinkIdle.name
        active : RSX.iconBlinkActive.name
      )

    if (identifier == Cards.Spell.ArcaneHeart)
      card = new SpellSpawnEntityNearbyGeneral(gameSession)
      card.factionId = Factions.Faction2
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.ArcaneHeart
      card.name = i18next.t("cards.faction_2_spell_arcane_heart_name")
      card.setDescription(i18next.t("cards.faction_2_spell_arcane_heart_description"))
      card.manaCost = 1
      card.filterNearGeneral = true
      card.cardDataOrIndexToSpawn = {id: Cards.Faction2.Heartseeker}
      card.setFXResource(["FX.Cards.Spell.ArcaneHeart"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_graspofagony.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconTwilightSurgeIdle.name
        active : RSX.iconTwilightSurgeActive.name
      )

    if (identifier == Cards.Spell.SwordsBBS)
      card = new SpellSwordsBBS(gameSession)
      card.factionId = Factions.Faction2
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.SwordsBBS
      card.name = i18next.t("cards.faction_2_spell_petal_flurry_name")
      card.setDescription(i18next.t("cards.faction_2_spell_petal_flurry_desc"))
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.setFXResource(["FX.Cards.Spell.PetalFlurry"])
      card.setBaseSoundResource(
        apply : RSX.sfx_loot_crate_reveal.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconPetalFlurryIdle.name
        active : RSX.iconPetalFlurryActive.name
      )

    if (identifier == Cards.Spell.SpellSword1)
      card = new SpellDrawCardEndOfTurn(gameSession)
      card.factionId = Factions.Faction2
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.SpellSword1
      card.name = i18next.t("cards.faction_2_spell_murasame_name")
      card.setDescription(i18next.t("cards.faction_2_spell_murasame_desc"))
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.setFXResource(["FX.Cards.Spell.Murasame"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_truestrike.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconSpellSword1Idle.name
        active : RSX.iconSpellSword1Active.name
      )

    if (identifier == Cards.Spell.SpellSword2)
      card = new SpellApplyModifiersToGeneral(gameSession)
      card.factionId = Factions.Faction2
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.SpellSword2
      card.name = i18next.t("cards.faction_2_spell_kiyomori_name")
      card.setDescription(i18next.t("cards.faction_2_spell_kiyomori_desc"))
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.spellFilterType = SpellFilterType.None
      card.applyToOwnGeneral = true
      movementModifierContextObject = Modifier.createContextObjectOnBoard()
      movementModifierContextObject.attributeBuffs = {"speed": 1}
      movementModifierContextObject.durationEndTurn = 1
      movementModifierContextObject.appliedName = i18next.t("modifiers.faction_2_spell_kiyomori_1")
      movementModifierContextObject.appliedDescription = i18next.t("modifiers.faction_2_spell_kiyomori_2")
      card.setTargetModifiersContextObjects([
        movementModifierContextObject
      ])
      card.setFXResource(["FX.Cards.Spell.Kiyomori"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_truestrike.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconSpellSword2Idle.name
        active : RSX.iconSpellSword2Active.name
      )

    if (identifier == Cards.Spell.SpellSword3)
      card = new Spell(gameSession)
      card.factionId = Factions.Faction2
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.SpellSword3
      card.name = i18next.t("cards.faction_2_spell_tanahashi_name")
      card.setDescription(i18next.t("cards.faction_2_spell_tanahashi_desc"))
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.setFollowups([
        {
          id: Cards.Spell.FollowupTeleport
          _private: {
            followupSourcePattern: CONFIG.PATTERN_1SPACE
          }
        }
      ])
      card.setFXResource(["FX.Cards.Spell.Tanahashi"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_truestrike.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconSpellSword3Idle.name
        active : RSX.iconSpellSword3Active.name
      )

    if (identifier == Cards.Spell.SpellSword4)
      card = new SpellApplyModifiers(gameSession)
      card.factionId = Factions.Faction2
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.SpellSword4
      card.name = i18next.t("cards.faction_2_spell_kotetsu_name")
      card.setDescription(i18next.t("cards.faction_2_spell_kotetsu_desc"))
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.spellFilterType = SpellFilterType.AllyDirect
      card.canTargetGeneral = true
      card.addKeywordClassToInclude(ModifierBackstab)
      backstabModifier = ModifierBackstab.createContextObject(2)
      backstabModifier.durationEndTurn = 1
      card.setTargetModifiersContextObjects([
        backstabModifier
      ])
      card.setFXResource(["FX.Cards.Spell.Kotetsu"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_truestrike.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconSpellSword4Idle.name
        active : RSX.iconSpellSword4Active.name
      )

    if (identifier == Cards.Spell.SaberspineSeal)
      card = new SpellApplyModifiers(gameSession)
      card.factionId = Factions.Faction2
      if !config.get('allCardsAvailable')?
        card.setIsUnlockableBasic(true)
      card.id = Cards.Spell.SaberspineSeal
      card.name = i18next.t("cards.faction_2_spell_saberspine_seal_name")
      card.setDescription(i18next.t("cards.faction_2_spell_saberspine_seal_description"))
      card.manaCost = 2
      card.rarityId = Rarity.Fixed
      card.canTargetGeneral = true
      customContextObject = Modifier.createContextObjectWithAttributeBuffs(3,0)
      customContextObject.durationEndTurn = 1
      customContextObject.appliedName = i18next.t("modifiers.faction_2_spell_saberspine_seal_1")
      card.setTargetModifiersContextObjects([customContextObject])
      card.setFXResource(["FX.Cards.Spell.SaberspineSeal"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f2tank_death.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconSaberspineSealIdle.name
        active : RSX.iconSaberspineSealActive.name
      )

    if (identifier == Cards.Spell.MistDragonSeal)
      card = new SpellApplyModifiers(gameSession)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.MistDragonSeal
      card.name = i18next.t("cards.faction_2_spell_mist_dragon_seal_name")
      card.setDescription(i18next.t("cards.faction_2_spell_mist_dragon_seal_description"))
      card.manaCost = 1
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.AllyDirect
      mistDragonStatBuff = Modifier.createContextObjectWithAttributeBuffs(1,1)
      mistDragonStatBuff.appliedName = i18next.t("modifiers.faction_2_spell_mist_dragon_seal_1")
      card.setTargetModifiersContextObjects([mistDragonStatBuff])
      card.setFollowups([{
        id: Cards.Spell.FollowupTeleport
      }])
      card.setFXResource(["FX.Cards.Spell.MistDragonSeal"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_mistdragonseal_alt.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconMistdragonSealIdle.name
        active : RSX.iconMistdragonSealActive.name
      )

    if (identifier == Cards.Spell.PhoenixFire)
      card = new SpellDamage(gameSession)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.PhoenixFire
      card.name = i18next.t("cards.faction_2_spell_phoenix_fire_name")
      card.setDescription(i18next.t("cards.faction_2_spell_phoenix_fire_description"))
      card.manaCost = 2
      card.damageAmount = 3
      card.rarityId = Rarity.Fixed
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.canTargetGeneral = true
      card.setFXResource(["FX.Cards.Spell.PhoenixFire"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_phoenixfire.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconPhoenixFire2Idle.name
        active : RSX.iconPhoenixFire2Active.name
      )

    if (identifier == Cards.Spell.KageLightning)
      card = new SpellDamage(gameSession)
      card.factionId = Factions.Faction2
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.KageLightning
      card.name = i18next.t("cards.faction_2_spell_kage_lightning_name")
      card.setDescription(i18next.t("cards.faction_2_spell_kage_lightning_description"))
      card.manaCost = 2
      card.damageAmount = 5
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.setFXResource(["FX.Cards.Spell.KageLightning"])
      card.setBaseAnimResource(
        idle : RSX.iconKageLightningIdle.name
        active : RSX.iconKageLightningActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_ghostlightning.audio
      )

    if (identifier == Cards.Spell.TwinStrike)
      card = new SpellTwinStrike(gameSession)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.TwinStrike
      card.name = i18next.t("cards.faction_2_spell_twin_strike_name")
      card.setDescription(i18next.t("cards.faction_2_spell_twin_strike_description"))
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.damageAmount = 2
      card.spellFilterType = SpellFilterType.EnemyIndirect
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.setFXResource(["FX.Cards.Spell.TwinStrike"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_twinstrike.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconTwinStrikeIdle.name
        active : RSX.iconTwinStrikeActive.name
      )

    if (identifier == Cards.Spell.EightGates)
      card = new SpellApplyPlayerModifiers(gameSession)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.EightGates
      card.name = i18next.t("cards.faction_2_spell_eight_gates_name")
      card.setDescription(i18next.t("cards.faction_2_spell_eight_gates_description"))
      card.manaCost = 2
      card.rarityId = Rarity.Legendary
      card.applyToOwnGeneral = true
      customContextObject = PlayerModifierSpellDamageModifier.createContextObject()
      customContextObject.durationEndTurn = 1
      customContextObject.spellDamageChange = 2
      card.setTargetModifiersContextObjects([customContextObject])
      card.spellFilterType = SpellFilterType.None
      card.setFXResource(["FX.Cards.Spell.EightGates"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_chaoselemental_attack_swing.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconEightGatesIdle.name
        active : RSX.iconEightGatesActive.name
      )

    if (identifier == Cards.Spell.SpiralTechnique)
      card = new SpellDamage(gameSession)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.SpiralTechnique
      card.name = i18next.t("cards.faction_2_spell_spiral_technique_name")
      card.setDescription(i18next.t("cards.faction_2_spell_spiral_technique_description"))
      card.manaCost = 8
      card.rarityId = Rarity.Epic
      card.damageAmount = 8
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.canTargetGeneral = true
      card.setFXResource(["FX.Cards.Spell.SpiralTechnique"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_spiraltechnique.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconSpiralTechniqueIdle.name
        active : RSX.iconSpiralTechniqueActive.name
      )

    if (identifier == Cards.Spell.ManaVortex)
      card = new SpellApplyPlayerModifiers(gameSession)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.ManaVortex
      card.name = i18next.t("cards.faction_2_spell_mana_vortex_name")
      card.setDescription(i18next.t("cards.faction_2_spell_mana_vortex_description"))
      card.manaCost = 0
      card.rarityId = Rarity.Rare
      card.applyToOwnGeneral = true
      customContextObject = PlayerModifierManaModifierSingleUse.createCostChangeContextObject(-1, CardType.Spell)
      customContextObject.durationEndTurn = 1
      customContextObject.auraIncludeSignatureCards = true
      card.setTargetModifiersContextObjects([customContextObject])
      card.spellFilterType = SpellFilterType.None
      card.setFXResource(["FX.Cards.Spell.ManaVortex"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_manavortex.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconManaVortexIdle.name
        active : RSX.iconManaVortexActive.name
      )

    if (identifier == Cards.Spell.InnerFocus)
      card = new SpellInnerFocus(gameSession)
      card.factionId = Factions.Faction2
      if !config.get('allCardsAvailable')?
        card.setIsUnlockableBasic(true)
      card.id = Cards.Spell.InnerFocus
      card.name = i18next.t("cards.faction_2_spell_inner_focus_name")
      card.setDescription(i18next.t("cards.faction_2_spell_inner_focus_description"))
      card.manaCost = 1
      card.maxAttack = 3
      card.rarityId = Rarity.Fixed
      card.setFXResource(["FX.Cards.Spell.InnerFocus"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_innerfocus.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconInnerFocusIdle.name
        active : RSX.iconInnerFocusActive.name
      )

    if (identifier == Cards.Spell.OnyxBearSeal)
      card = new SpellRemoveAndReplaceEntity(gameSession)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.OnyxBearSeal
      card.name = i18next.t("cards.faction_2_spell_onyx_bear_seal_name")
      card.setDescription(i18next.t("cards.faction_2_spell_onyx_bear_seal_description"))
      card.manaCost = 3
      card.rarityId = Rarity.Epic
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.cardDataOrIndexToSpawn = {id: Cards.Faction2.OnyxBear}
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.OnyxBearSeal"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_onyxbearseal.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconOnyxbearSealIdle.name
        active : RSX.iconOnyxbearSealActive.name
      )

    if (identifier == Cards.Spell.GhostLightning)
      card = new SpellDamage(gameSession)
      card.factionId = Factions.Faction2
      if !config.get('allCardsAvailable')?
        card.setIsUnlockableBasic(true)
      card.id = Cards.Spell.GhostLightning
      card.name = i18next.t("cards.faction_2_spell_ghost_lightning_name")
      card.setDescription(i18next.t("cards.faction_2_spell_ghost_lightning_description"))
      card.spellFilterType = SpellFilterType.EnemyIndirect
      card.manaCost = 1
      card.rarityId = Rarity.Fixed
      card.damageAmount = 1
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.maxJumps = CONFIG.INFINITY
      card.setFXResource(["FX.Cards.Spell.GhostLightning"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_ghostlightning.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconGhostLightningIdle.name
        active : RSX.iconGhostLightningActive.name
      )

    if (identifier == Cards.Spell.DeathstrikeSeal)
      card = new SpellApplyModifiers(gameSession)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.DeathstrikeSeal
      card.name = i18next.t("cards.faction_2_spell_deathstrike_seal_name")
      card.setDescription(i18next.t("cards.faction_2_spell_deathstrike_seal_description"))
      card.spellFilterType = SpellFilterType.AllyDirect
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      killDamagedContextObject = ModifierDealDamageWatchKillTarget.createContextObject()
      killDamagedContextObject.appliedName = i18next.t("modifiers.faction_2_spell_deathstrike_seal_1")
      killDamagedContextObject.appliedDescription = i18next.t("modifiers.faction_2_spell_deathstrike_seal_2")
      card.setTargetModifiersContextObjects([
        killDamagedContextObject
      ])
      card.setFXResource(["FX.Cards.Spell.DeathstrikeSeal"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconDeathstrikeSealIdle.name
        active : RSX.iconDeathstrikeSealActive.name
      )

    if (identifier == Cards.Spell.AncestralDivination)
      card = new SpellAncestralDivination(gameSession)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.AncestralDivination
      card.name = i18next.t("cards.faction_2_spell_ancestral_divination_name")
      card.setDescription(i18next.t("cards.faction_2_spell_ancestral_divination_description"))
      card.spellFilterType = SpellFilterType.None
      card.manaCost = 4
      card.rarityId = Rarity.Common
      card.setFXResource(["FX.Cards.Spell.AncestralDivination"])
      card.setBaseAnimResource(
        idle : RSX.iconAncestralPactIdle.name
        active : RSX.iconAncestralPactActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_crossbones_attack_swing.audio
      )

    if (identifier == Cards.Spell.Juxtaposition)
      card = new SpellJuxtaposition(gameSession)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.Juxtaposition
      card.name = i18next.t("cards.faction_2_spell_juxtaposition_name")
      card.setDescription(i18next.t("cards.faction_2_spell_juxtaposition_description"))
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.manaCost = 0
      card.rarityId = Rarity.Epic
      card.setFollowups([{
        id: Cards.Spell.FollowupSwapPositions
      }])
      card.setFXResource(["FX.Cards.Spell.Juxtaposition"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_crossbones_attack_swing.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconJuxtapositionIdle.name
        active : RSX.iconJuxtapositionActive.name
      )

    if (identifier == Cards.Spell.ArtifactDefiler)
      card = new SpellRemoveArtifacts(gameSession)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.ArtifactDefiler
      card.name = i18next.t("cards.faction_2_spell_artifact_defiler_name")
      card.setDescription(i18next.t("cards.faction_2_spell_artifact_defiler_description"))
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.setFXResource(["FX.Cards.Spell.ArtifactDefiler"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f6_voiceofthewind_attack_impact.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconArtifactDefilerIdle.name
        active : RSX.iconArtifactDefilerActive.name
      )

    if (identifier == Cards.Spell.HeavensEclipse)
      card = new SpellHeavensEclipse(gameSession)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.HeavensEclipse
      card.name = i18next.t("cards.faction_2_spell_heavens_eclipse_name")
      card.setDescription(i18next.t("cards.faction_2_spell_heavens_eclipse_description"))
      card.manaCost = 5
      card.numSpells = 3
      card.rarityId = Rarity.Legendary
      card.setFXResource(["FX.Cards.Spell.HeavensEclipse"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_a.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconHeavensEclipseIdle.name
        active : RSX.iconHeavensEclipseActive.name
      )

    if (identifier == Cards.Spell.MistWalking)
      card = new SpellMistWalking(gameSession)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.MistWalking
      card.name = i18next.t("cards.faction_2_spell_mist_walking_name")
      card.setDescription(i18next.t("cards.faction_2_spell_mist_walking_description"))
      card.manaCost = 1
      card.rarityId = Rarity.Rare
      card.setFXResource(["FX.Cards.Spell.MistWalking"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_crossbones_attack_swing.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconMistWalkingIdle.name
        active : RSX.iconMistWalkingActive.name
      )

    if (identifier == Cards.Spell.KillingEdge)
      card = new SpellKillingEdge(gameSession)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.KillingEdge
      card.name = i18next.t("cards.faction_2_spell_killing_edge_name")
      card.setDescription(i18next.t("cards.faction_2_spell_killing_edge_description"))
      card.addKeywordClassToInclude(ModifierBackstab)
      card.manaCost = 3
      card.rarityId = Rarity.Fixed
      card.setFXResource(["FX.Cards.Spell.KillingEdge"])
      card.spellFilterType = SpellFilterType.AllyDirect
      attackBuff = Modifier.createContextObjectWithAttributeBuffs(4,2)
      attackBuff.appliedName = i18next.t("modifiers.faction_2_spell_killing_edge_1")
      card.setTargetModifiersContextObjects([attackBuff])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_twinstrike.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconKillingEdgeIdle.name
        active : RSX.iconKillingEdgeActive.name
      )

    if (identifier == Cards.Artifact.MaskOfShadows)
      card = new Artifact(gameSession)
      card.factionId = Factions.Faction2
      card.id = Cards.Artifact.MaskOfShadows
      card.name = i18next.t("cards.faction_2_artifact_mask_of_shadows_name")
      card.setDescription(i18next.t("cards.faction_2_artifact_mask_of_shadows_description"))
      card.addKeywordClassToInclude(ModifierBackstab)
      card.manaCost = 2
      card.rarityId = Rarity.Legendary
      card.durability = 3
      card.setTargetModifiersContextObjects([
        Modifier.createContextObjectWithAttributeBuffs(1,undefined),
        ModifierBackstab.createContextObject(4,undefined,{
          name: i18next.t("cards.faction_2_artifact_mask_of_shadows_name")
        })
      ])
      card.setFXResource(["FX.Cards.Artifact.MaskOfShadows"])
      card.setBaseAnimResource(
        idle: RSX.iconMaskofShadowsIdle.name
        active: RSX.iconMaskofShadowsActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Artifact.MaskOfTranscendance)
      card = new Artifact(gameSession)
      card.factionId = Factions.Faction2
      card.id = Cards.Artifact.MaskOfTranscendance
      card.name = i18next.t("cards.faction_2_artifact_cyclone_mask_name")
      card.setDescription(i18next.t("cards.faction_2_artifact_cyclone_mask_description"))
      card.addKeywordClassToInclude(ModifierRanged)
      card.manaCost = 3
      card.rarityId = Rarity.Epic
      card.durability = 3
      card.setTargetModifiersContextObjects([
        ModifierRanged.createContextObject({
          name: i18next.t("cards.faction_2_artifact_cyclone_mask_name")
        })
      ])
      card.setFXResource(["FX.Cards.Artifact.MaskOfTranscendance"])
      card.setBaseAnimResource(
        idle: RSX.iconCycloneMaskIdle.name
        active: RSX.iconCycloneMaskActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Artifact.MaskOfBloodLeech)
      card = new Artifact(gameSession)
      card.factionId = Factions.Faction2
      card.id = Cards.Artifact.MaskOfBloodLeech
      card.name = i18next.t("cards.faction_2_artifact_bloodrage_mask_name")
      card.setDescription(i18next.t("cards.faction_2_artifact_bloodrage_mask_description"))
      card.manaCost = 2
      card.rarityId = Rarity.Fixed
      card.durability = 3
      card.setTargetModifiersContextObjects([
        ModifierSpellWatchDamageGeneral.createContextObject(1,{
          name: i18next.t("cards.faction_2_artifact_bloodrage_mask_name")
        })
      ])
      card.setFXResource(["FX.Cards.Artifact.MaskOfBloodLeech"])
      card.setBaseAnimResource(
        idle: RSX.iconBloodLeechMaskIdle.name
        active: RSX.iconBloodLeechMaskActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    return card

module.exports = CardFactory_CoreSet_Faction2
