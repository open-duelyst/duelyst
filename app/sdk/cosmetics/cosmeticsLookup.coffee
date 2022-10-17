_ = require("underscore")

class CosmeticsLookup

  # The top level keys must match the keys of cosmeticsTypeLookup.coffee #

  # First 10,000 ids reserved for emotes
  @Emote:
    TextHello: 1
    TextGLHF: 2
    TextGG: 3
    TextOops: 4

    #HealingMystic:
    HealingMysticHappy: 2001
    HealingMysticSad: 2002
    HealingMysticThumbsUp: 2003
    HealingMysticConfused: 2004
    HealingMysticBlink: 2005

    #Other:
    OtherRook: 2011
    OtherIcebladeDryad: 2012
    OtherLightchaser: 2013
    OtherSnowChaserHoliday2015: 2014

    ##Neutral:
    emote_mechaz0r_cannon_confused: 2101
    emote_mechaz0r_chassis_angry: 2102
    emote_mechaz0r_helm_taunt: 2103
    emote_mechaz0r_sad: 2104
    emote_mechaz0r_sword_frustrated: 2105
    emote_mechaz0r_wings_happy: 2106
    emote_ladylocke: 2107
    emote_phalanxar_thumbsdown: 2108
    emote_snowchaser_bow: 2109
    emote_hollowgrovekeeper: 2110
    emote_lightbender: 2111
    emote_primusfist: 2112
    emote_zenrui: 2113
    emote_fog_bow: 2114
    emote_fog_confused: 2115
    emote_fog_dead: 2116
    emote_fog_frustrated: 2117
    emote_fog_happy: 2118
    emote_fog_sad: 2119
    emote_fog_sleep: 2120
    emote_fog_sunglasses: 2121
    emote_fog_surprised: 2122
    emote_fog_taunt_alt: 2123
    emote_fog_taunt: 2124

    #Faction1:
    Faction1Taunt: 3001
    Faction1Angry: 3002
    Faction1Confused: 3003
    Faction1Sad: 3004
    Faction1Frustrated: 3005
    Faction1Surprised: 3006
    Faction1Bow: 3007
    Faction1Sleep: 3008
    Faction1Sunglasses: 3009
    Faction1Happy: 3010
    Faction1Kiss: 3011

    #Faction1Alt:
    Faction1AltTaunt: 3101
    Faction1AltAngry: 3102
    Faction1AltConfused: 3103
    Faction1AltSad: 3104
    Faction1AltFrustrated: 3105
    Faction1AltSurprised: 3106
    Faction1AltBow: 3107
    Faction1AltSleep: 3108
    Faction1AltSunglasses: 3109
    Faction1AltHappy: 3110
    Faction1AltKiss: 3111

    #Faction1Third:
    Faction1ThirdTaunt: 3201
    Faction1ThirdAngry: 3202
    Faction1ThirdConfused: 3203
    Faction1ThirdSad: 3204
    Faction1ThirdFrustrated: 3205
    Faction1ThirdSurprised: 3206
    Faction1ThirdBow: 3207
    Faction1ThirdSleep: 3208
    Faction1ThirdSunglasses: 3209
    Faction1ThirdHappy: 3210
    Faction1ThirdKiss: 3211

    #Faction2:
    Faction2Taunt: 4001
    Faction2Happy: 4002
    Faction2Confused: 4003
    Faction2Sad: 4004
    Faction2Frustrated: 4005
    Faction2Surprised: 4006
    Faction2Bow: 4007
    Faction2Sleep: 4008
    Faction2Sunglasses: 4009
    Faction2Angry: 4010
    Faction2Kiss: 4011

    #Faction2Alt:
    Faction2AltTaunt: 4101
    Faction2AltHappy: 4102
    Faction2AltConfused: 4103
    Faction2AltSad: 4104
    Faction2AltFrustrated: 4105
    Faction2AltSurprised: 4106
    Faction2AltBow: 4107
    Faction2AltSleep: 4108
    Faction2AltSunglasses: 4109
    Faction2AltAngry: 4110
    Faction2AltKiss: 4111

    #Faction2Third:
    Faction2ThirdTaunt: 4201
    Faction2ThirdHappy: 4202
    Faction2ThirdConfused: 4203
    Faction2ThirdSad: 4204
    Faction2ThirdFrustrated: 4205
    Faction2ThirdSurprised: 4206
    Faction2ThirdBow: 4207
    Faction2ThirdSleep: 4208
    Faction2ThirdSunglasses: 4209
    Faction2ThirdAngry: 4210
    Faction2ThirdKiss: 4211

    #Faction3:
    Faction3Taunt: 5001
    Faction3Happy: 5002
    Faction3Angry: 5003
    Faction3Sad: 5004
    Faction3Frustrated: 5005
    Faction3Surprised: 5006
    Faction3Bow: 5007
    Faction3Sleep: 5008
    Faction3Sunglasses: 5009
    Faction3Confused: 5010
    Faction3Kiss: 5011

    #Faction3Alt:
    Faction3AltTaunt: 5101
    Faction3AltHappy: 5102
    Faction3AltAngry: 5103
    Faction3AltSad: 5104
    Faction3AltFrustrated: 5105
    Faction3AltSurprised: 5106
    Faction3AltBow: 5107
    Faction3AltSleep: 5108
    Faction3AltSunglasses: 5109
    Faction3AltConfused: 5110
    Faction3AltKiss: 5111

    #Faction3Third:
    Faction3ThirdTaunt: 5201
    Faction3ThirdHappy: 5202
    Faction3ThirdAngry: 5203
    Faction3ThirdSad: 5204
    Faction3ThirdFrustrated: 5205
    Faction3ThirdSurprised: 5206
    Faction3ThirdBow: 5207
    Faction3ThirdSleep: 5208
    Faction3ThirdSunglasses: 5209
    Faction3ThirdConfused: 5210
    Faction3ThirdKiss: 5211

    #Faction4:
    Faction4Taunt: 6001
    Faction4Happy: 6002
    Faction4Angry: 6003
    Faction4Confused: 6004
    Faction4Sad: 6005
    Faction4Surprised: 6006
    Faction4Bow: 6007
    Faction4Sleep: 6008
    Faction4Sunglasses: 6009
    Faction4Frustrated: 6010
    Faction4Kiss: 6011

    #Faction4Alt:
    Faction4AltTaunt: 6101
    Faction4AltHappy: 6102
    Faction4AltAngry: 6103
    Faction4AltConfused: 6104
    Faction4AltSad: 6105
    Faction4AltSurprised: 6106
    Faction4AltBow: 6107
    Faction4AltSleep: 6108
    Faction4AltSunglasses: 6109
    Faction4AltFrustrated: 6110
    Faction4AltKiss: 6111

    #Faction4Third:
    Faction4ThirdTaunt: 6201
    Faction4ThirdHappy: 6202
    Faction4ThirdAngry: 6203
    Faction4ThirdConfused: 6204
    Faction4ThirdSad: 6205
    Faction4ThirdSurprised: 6206
    Faction4ThirdBow: 6207
    Faction4ThirdSleep: 6208
    Faction4ThirdSunglasses: 6209
    Faction4ThirdFrustrated: 6210
    Faction4ThirdKiss: 6211

    #Faction5:
    Faction5Taunt: 7001
    Faction5Happy: 7002
    Faction5Angry: 7003
    Faction5Confused: 7004
    Faction5Frustrated: 7005
    Faction5Surprised: 7006
    Faction5Bow: 7007
    Faction5Sleep: 7008
    Faction5Sunglasses: 7009
    Faction5Sad: 7010
    Faction5Kiss: 7011

    #Faction5Alt:
    Faction5AltTaunt: 7101
    Faction5AltHappy: 7102
    Faction5AltAngry: 7103
    Faction5AltConfused: 7104
    Faction5AltFrustrated: 7105
    Faction5AltSurprised: 7106
    Faction5AltBow: 7107
    Faction5AltSleep: 7108
    Faction5AltSunglasses: 7109
    Faction5AltSad: 7110
    Faction5AltKiss: 7111

    #Faction5Third:
    Faction5ThirdTaunt: 7201
    Faction5ThirdHappy: 7202
    Faction5ThirdAngry: 7203
    Faction5ThirdConfused: 7204
    Faction5ThirdFrustrated: 7205
    Faction5ThirdSurprised: 7206
    Faction5ThirdBow: 7207
    Faction5ThirdSleep: 7208
    Faction5ThirdSunglasses: 7209
    Faction5ThirdSad: 7210
    Faction5ThirdKiss: 7211

    # Faction6
    Faction6Frustrated: 8001
    Faction6Happy: 8002
    Faction6Angry: 8003
    Faction6Confused: 8004
    Faction6Sad: 8005
    Faction6Surprised: 8006
    Faction6Bow: 8007
    Faction6Sleep: 8008
    Faction6Sunglasses: 8009
    Faction6Taunt: 8010
    Faction6Kiss: 8011

    # Faction6Alt
    Faction6AltFrustrated: 8101
    Faction6AltHappy: 8102
    Faction6AltAngry: 8103
    Faction6AltConfused: 8104
    Faction6AltSad: 8105
    Faction6AltSurprised: 8106
    Faction6AltBow: 8107
    Faction6AltSleep: 8108
    Faction6AltSunglasses: 8109
    Faction6AltTaunt: 8110
    Faction6AltKiss: 8111

    # Faction6Third
    Faction6ThirdFrustrated: 8201
    Faction6ThirdHappy: 8202
    Faction6ThirdAngry: 8203
    Faction6ThirdConfused: 8204
    Faction6ThirdSad: 8205
    Faction6ThirdSurprised: 8206
    Faction6ThirdBow: 8207
    Faction6ThirdSleep: 8208
    Faction6ThirdSunglasses: 8209
    Faction6ThirdTaunt: 8210
    Faction6ThirdKiss: 8211

  @CardBack:
    Normal: 10001
    Agenor: 10002
    LyonarGears: 10003
    Gauntlet: 10004
    Magma: 10005
    Shimzar: 10006
    HumbleBundle: 10007
    DawnDuelysts: 10008
    Snowchaser: 10009

  @ProfileIcon:
    Tree: 20001
    Bloodmoon: 20002
    CrystalCaverns: 20003
    Kaero: 20004
    WhistlingBlade: 20006
    abyssian_abyssalcrawler: 20007
    abyssian_cassyvasoulreaper1: 20008
    abyssian_crest: 20009
    abyssian_gloomchaser: 20010
    abyssian_kelainosister: 20011
    abyssian_lilithe1: 20012
    abyssian_lilithe2: 20013
    abyssian_vorpalreaver: 20014
    abyssian_wraithling: 20015
    frostfire: 20016
    lyonar_arclytesentinel: 20017
    lyonar_argeonhighmayne1: 20018
    lyonar_argeonhighmayne2: 20019
    lyonar_crest: 20020
    lyonar_lightchaser: 20021
    lyonar_silverguardknight: 20022
    lyonar_steropesister: 20023
    lyonar_suntidemaiden: 20024
    lyonar_windbladeadept: 20025
    lyonar_ziransunforge1: 20026
    magmar_crest: 20027
    magmar_dreadnought: 20028
    magmar_elucidator: 20029
    magmar_makantorwarbeast: 20030
    magmar_phalanxar: 20031
    magmar_silitharelder: 20032
    magmar_starhorn1: 20033
    magmar_starhorn2: 20034
    magmar_taygetesister: 20035
    magmar_vaath1: 20036
    magmar_vaath2: 20037
    magmar_veteransilithar: 20038
    magmar_youngsilithar: 20039
    neutral_beastmaster: 20040
    neutral_cannonofmechaz0r: 20041
    neutral_chassisofmechaz0r: 20042
    neutral_gnasher: 20043
    neutral_goldenmantella: 20044
    neutral_grincher: 20045
    neutral_helmofmechaz0r: 20046
    neutral_hydrax1: 20047
    neutral_hydrax2: 20048
    neutral_ion: 20049
    neutral_ladylocke: 20050
    neutral_lkiansister: 20051
    neutral_mechaz0r: 20052
    neutral_nip: 20053
    neutral_rawr: 20054
    neutral_rok: 20055
    neutral_rook: 20056
    neutral_silverbeak: 20057
    neutral_soboro: 20058
    neutral_swordofmechaz0r: 20059
    neutral_wingsofmechaz0r: 20060
    neutral_z0r: 20061
    neutral_zukong: 20062
    obsidian_woods: 20063
    rashas_tomb: 20064
    songhai_alkyonesister: 20065
    songhai_crest: 20066
    songhai_gorehorn: 20067
    songhai_grandmasterzendo: 20068
    songhai_heartseeker: 20069
    songhai_kaidoassassin: 20070
    songhai_kaleosxaan1: 20071
    songhai_revaeventide1: 20072
    songhai_revaeventide2: 20073
    songhai_scarletviper: 20074
    songhai_tuskboar: 20075
    songhai_widowmaker: 20076
    vanar_arcticdisplacer: 20077
    vanar_crest: 20078
    vanar_draugarlord: 20079
    vanar_faiebloodwing_warbird: 20080
    vanar_faiebloodwing1: 20081
    vanar_faiebloodwing2: 20082
    vanar_glacialelemental: 20083
    vanar_hearthsister: 20084
    vanar_icebladedryad: 20085
    vanar_karawinterblade1: 20086
    vanar_karawinterblade2: 20087
    vanar_maiasister: 20088
    vanar_razorback: 20089
    vanar_snowchaser: 20090
    vanar_wolfraven: 20091
    vetruvian_miragemaster: 20092
    vetruvian_pax: 20093
    vetruvian_pyromancer: 20094
    vetruvian_rae: 20095
    vetruvian_saonsister: 20096
    vetruvian_scionesssajj1: 20097
    vetruvian_starfirescarab: 20098
    vetruvian_windshrike: 20099
    vetruvian_zirixstarstrider1: 20100
    vetruvian_zirixstarstrider2: 20101
    vetruvian_crest: 20102
    grandmaster_icon: 20103
    tournament_dawnofduelysts1: 20104
    tournament_dawnofduelysts2: 20105
    lyonar_brome1: 20106
    magmar_ragnora1: 20107
    songhai_shidai1: 20108
    abyssian_maehv1: 20109
    vanar_ilena1: 20110
    vetruvian_ciphyron1: 20111
    aer: 20112
    frizzing_mystic: 20113
    gibbet: 20114
    orbo: 20115
    canopic: 20116
    veracity: 20117
    indominus: 20118
    spriggen: 20119
    eternityPainter: 20120
    skullProphet: 20121
    sinisterSilhouette: 20122

  @Scene:
    MagaariEmberHighlands: 40001
    ObsidianWoods: 40002
    Frostfire: 40003
    Vetruvian: 40004
    Shimzar: 40005

  @BattleMap:
    Magmar: 50001
    Abyssian: 50002
    Redrock: 50003
    Vanar: 50004

  @CardSkin:
    Faction1GeneralTier2: 1000001
    Faction1AltGeneralTier2: 1000002
    Faction2GeneralTier2: 1000003
    Faction2AltGeneralTier2: 1000004
    Faction3GeneralTier2: 1000005
    Faction3AltGeneralTier2: 1000006
    Faction4GeneralTier2: 1000007
    Faction4AltGeneralTier2: 1000008
    Faction5GeneralTier2: 1000009
    Faction5AltGeneralTier2: 1000010
    Faction6GeneralTier2: 1000011
    Faction6AltGeneralTier2: 1000012
    SarlacPrime: 1000013
    KeeperOfTheValue: 1000014
    Faction2GeneralDogehai: 1000015
    Faction1GeneralRogueLegacy: 1000016
    Darkjammer: 1000017
    FrostfireTiger: 1000018
    FestiveSnowchaser: 1000019
    ElyxMK2: 1000020
    HealingMysticBN: 1000021
    HealingMysticTwitch: 1000022
    Faction3GeneralFestive: 1000023
    Faction6GeneralFestive: 1000024
    FestiveZyx: 1000025
    Faction1IVGeneralTier2: 1000026
    Faction2IVGeneralTier2: 1000027
    Faction3IVGeneralTier2: 1000028
    Faction4IVGeneralTier2: 1000029
    Faction5IVGeneralTier2: 1000030
    Faction6IVGeneralTier2: 1000031
    MirkbloodDevourerBoss: 1000032
    DreadnoughtBoss: 1000033
    IroncladBoss: 1000034
    ZendoBoss: 1000035
    Z0rBoss: 1000036
    Mechaz0rChassisBoss: 1000037
    Mechaz0rHelmBoss: 1000038
    AlterRexxBoss: 1000039
    Mechaz0rSwordBoss: 1000040
    Mechaz0rWingsBoss: 1000041
    ZukongBoss: 1000042
    WartalonBoss: 1000043
    EMPBoss: 1000044
    ArchonBoss: 1000045
    BastionBoss: 1000046
    HighHandBoss: 1000047
    BlackSolusBoss: 1000048
    CalculatorBoss: 1000049
    ChakkramBoss: 1000050
    KronBoss: 1000051
    MeltdownBoss: 1000052
    ArcaneDevourerBoss: 1000053
    TrinityWingBoss: 1000054
    FuriosaBoss: 1000055
    ArclyteSentinelBoss: 1000056
    RancourBoss: 1000057
    SwornAvengerBoss: 1000058
    SwornDefenderBoss: 1000059
    QuartermasterGaujBoss: 1000060
    AlabasterTitanBoss: 1000061
    RadiantDragoonBoss: 1000062
    TethermancerBoss: 1000063
    DrogonBoss: 1000064
    PantheranBoss: 1000065
    LysianBrawlerBoss: 1000066
    DeathKnellBoss: 1000067
    DraugerLordBoss: 1000068
    NightWatcherBoss: 1000069
    CalligrapherBoss: 1000070
    PandoraBoss: 1000071
    GrandmasterNoshRakBoss: 1000072
    IroncliffeGuardianBoss: 1000073
    CelestialPhantomBoss: 1000074
    GrailmasterBoss: 1000075

module.exports = CosmeticsLookup
