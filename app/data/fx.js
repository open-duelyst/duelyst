const RSX = require('./resources');

/**
 * fx.js - map of fx options and resources.
*/

const FX = {
  Factions: {
    Faction1: {
      UnitSpawnFX: [
        {
          spriteIdentifier: RSX.fxTeleportRecallWhite.name,
          offset: { x: 0, y: -10 },
          color: { r: 255, g: 255, b: 100 },
        },
        { spriteIdentifier: RSX.fx_f1_holyimmolation.name },
        {
          spriteIdentifier: RSX.fxSmokeGround.name,
          offset: { x: 0, y: -45 },
        },
        {
          type: 'Light',
          offset: { x: 0, y: -80 },
          duration: 1,
          castsShadows: false,
          radius: 270,
          intensity: 9,
          color: { r: 255, g: 200, b: 100 },
        },
      ],
    },
    Faction2: {
      UnitSpawnFX: [
        {
          spriteIdentifier: RSX.fx_f2_teleportsmoke.name,
          flippedX: true,
          offset: { x: 20, y: 40 },
          color: { r: 200, g: 200, b: 200 },
        },
        {
          spriteIdentifier: RSX.fx_f2_teleportsmoke.name,
          offset: { x: -10, y: 30 },
        },
        {
          spriteIdentifier: RSX.fxSmokeGround.name,
          offset: { x: 0, y: -45 },
        },
        {
          type: 'Light',
          offset: { x: 0, y: -80 },
          duration: 1,
          castsShadows: false,
          radius: 270,
          intensity: 9,
          color: { r: 255, g: 100, b: 100 },
        },
      ],
    },
    Faction3: {
      UnitSpawnFX: [
        {
          spriteIdentifier: RSX.fxTeleportRecallWhite.name,
          offset: { x: 0, y: -10 },
          color: { r: 255, g: 200, b: 100 },
        },
        {
          spriteIdentifier: RSX.fxBladestorm.name,
          flippedX: true,
          offset: { x: 0, y: 0 },
          color: { r: 255, g: 255, b: 100 },
        },
        {
          spriteIdentifier: RSX.fxSmokeGround.name,
          offset: { x: 0, y: -45 },
        },
        {
          type: 'Light',
          offset: { x: 0, y: -80 },
          duration: 1,
          castsShadows: false,
          radius: 270,
          intensity: 9,
          color: { r: 255, g: 255, b: 0 },
        },
      ],
    },
    Faction4: {
      UnitSpawnFX: [
        {
          spriteIdentifier: RSX.fx_f2_teleportsmoke.name,
          flippedX: true,
          offset: { x: 30, y: 40 },
          color: { r: 127, g: 0, b: 255 },
        },
        {
          spriteIdentifier: RSX.fx_f2_teleportsmoke.name,
          offset: { x: -20, y: 30 },
          color: { r: 150, g: 0, b: 255 },
        },
        {
          spriteIdentifier: RSX.fxSmokeGround.name,
          offset: { x: 0, y: -45 },
        },
        {
          type: 'Light',
          offset: { x: 0, y: -80 },
          duration: 1,
          castsShadows: false,
          radius: 270,
          intensity: 9,
          color: { r: 150, g: 50, b: 255 },
        },
      ],
    },
    Faction5: {
      UnitSpawnFX: [
        {
          spriteIdentifier: RSX.fxTeleportRecallWhite.name,
          offset: { x: 0, y: -10 },
          color: { r: 0, g: 255, b: 127 },
        },
        {
          spriteIdentifier: RSX.fxLightningHitGreen.name,
          offset: { x: 0, y: 0 },
        },
        {
          spriteIdentifier: RSX.fxSmokeGround.name,
          offset: { x: 0, y: -45 },
        },
        {
          type: 'Light',
          offset: { x: 0, y: -80 },
          duration: 1,
          castsShadows: false,
          radius: 270,
          intensity: 9,
          color: { r: 127, g: 255, b: 127 },
        },
      ],
    },
    Faction6: {
      UnitSpawnFX: [
        {
          spriteIdentifier: RSX.fxBlueWaterSplash.name,
          offset: { x: 0, y: -10 },
        },
        {
          spriteIdentifier: RSX.fxBlueWaterSplash.name,
          flippedX: true,
          offset: { x: 0, y: 40 },
        },
        {
          spriteIdentifier: RSX.fxSwirlRingsBlue.name,
          offset: { x: 0, y: -20 },
        },
        {
          spriteIdentifier: RSX.fxSmokeGround.name,
          offset: { x: 0, y: -45 },
        },
        {
          type: 'Light',
          offset: { x: 0, y: -80 },
          duration: 1,
          castsShadows: false,
          radius: 270,
          intensity: 9,
          color: { r: 0, g: 255, b: 255 },
        },
      ],
    },
    Neutral: {
      UnitSpawnFX: [
        {
          spriteIdentifier: RSX.fxTeleportRecallBlue.name,
          offset: { x: 0, y: -10 },
        },
        {
          spriteIdentifier: RSX.fxSwirlRingsBlue.name,
          offset: { x: 0, y: -20 },
        },
        {
          spriteIdentifier: RSX.fxSmokeGround.name,
          offset: { x: 0, y: -45 },
        },
        {
          type: 'Light',
          offset: { x: 0, y: -80 },
          duration: 1,
          castsShadows: false,
          radius: 270,
          intensity: 9,
          color: { r: 255, g: 255, b: 255 },
        },
      ],
      SpawnSpecialFX: [
        { spriteIdentifier: RSX.fxTeleportRecall2.name },
        {
          spriteIdentifier: RSX.fxSwirlRingsBlue.name,
          offset: { x: 0, y: -20 },
        },
        {
          spriteIdentifier: RSX.fxSmokeGround.name,
          offset: { x: 0, y: -45 },
        },
        {
          type: 'Light',
          offset: { x: 0, y: -80 },
          duration: 1,
          castsShadows: false,
          radius: 270,
          intensity: 9,
          color: { r: 255, g: 255, b: 255 },
        },
      ],
      UnitDamagedFX: [
        { spriteIdentifier: [RSX.BloodExplosionBig.name, RSX.BloodExplosionMedium.name] },
        {
          type: 'Decal',
          spriteIdentifier: [
            RSX.fxBloodGround.name,
            RSX.fxBloodGround2.name,
            RSX.fxBloodGround3.name,
            RSX.fxBloodGround4.name,
          ],
          offset: { x: 0, y: -45 },
        },
      ],
      UnitHealedFX: [
        { type: 'Particles', plistFile: RSX.ptcl_dot_square_green.plist },
        { spriteIdentifier: RSX.fxSwirlRingsGreen.name },
        {
          spriteIdentifier: RSX.fxSmokeGround.name,
          offset: { x: 0, y: -45 },
        },
      ],
      UnitDiedFX: [
        { spriteIdentifier: [RSX.BloodExplosionBig.name, RSX.BloodExplosionMedium.name] },
        {
          type: 'Decal',
          spriteIdentifier: [
            RSX.fxBloodGround.name,
            RSX.fxBloodGround2.name,
            RSX.fxBloodGround3.name,
            RSX.fxBloodGround4.name,
          ],
          offset: { x: 0, y: -45 },
        },
      ],
      SpellAutoFX: [
        {
          type: 'Light',
          offset: { x: 0, y: -60 },
          duration: 1,
          castsShadows: false,
          radius: 270,
          intensity: 9,
          color: { r: 255, g: 255, b: 255 },
        },
      ],
      SpellCastFX: [
        { plistFile: RSX.ptcl_pixelpuff.plist, type: 'Particles' },
        {
          spriteIdentifier: RSX.fxSmokeGround.name,
          offset: { x: 0, y: -45 },
        },
      ],
      ArtifactAppliedFX: [
        { spriteIdentifier: RSX.fxBuffSimpleGold.name },
        {
          spriteIdentifier: RSX.fxSwirlRingsBlue.name,
          offset: { x: 0, y: -20 },
        },
        {
          spriteIdentifier: RSX.fxSmokeGround.name,
          offset: { x: 0, y: -45 },
        },
      ],
      ArtifactFX: [
        {
          spriteIdentifier: RSX.decal_artifact.img,
          antiAlias: true,
          looping: true,
          colorByOwner: true,
          scale: 1,
          opacity: 200,
          zOrder: -1,
          offset: { x: 0, y: -45 },
          xyzRotation: { x: 26, y: 0, z: 0 },
          xyzRotationPerSecond: { x: 0, y: 0, z: 45 },
          blendSrc: 'SRC_ALPHA',
          blendDst: 'ONE',
        },
      ],
    },
  },
  Cards: {
    Spell: {
      ShadowNova: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f4_shadownova.name,
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -45 },
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 0, b: 255 },
            },
          },
        ],
      },
      PainfulPluck: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f4_shadownova.name,
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -45 },
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 0, b: 255 },
            },
          },
        ],
      },
      SunBloom: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f1_sunbloom.name,
            offset: { x: 0, y: 0 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -45 },
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 230, b: 50 },
            },
          },
        ],
        SpellAppliedFX: [
          { spriteIdentifier: RSX.fxBladestorm.name },
          { spriteIdentifier: RSX.fxEnergyHaloGround.name },
        ],
      },
      FireBlast: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxSearingChasm.name,
            offset: { x: 0, y: 30 },
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -40 },
          },
        ],
      },
      FireTornado: {
        SpellCastFX: [
          {
            type: 'Light',
            offset: { x: 0, y: -50 },
            radius: 2000,
            intensity: 9,
            duration: 1,
            color: { r: 255, g: 100, b: 60 },
          },
        ],
        SpellAppliedFX: [
          { spriteIdentifier: RSX.fxFireTornado.name },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -45 },
          },
        ],
      },
      Enslave: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f3_drainmorale.name,
            offset: { x: 0, y: 90 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -245 },
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 100, b: 127 },
            },
          },
          {
            spriteIdentifier: RSX.fxTendrilsGreen.name,
            offset: { x: 0, y: -15 },
            reverse: true,
            color: { r: 0, g: 200, b: 255 },
          },
        ],
      },
      SynapticArbitrage: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f3_drainmorale.name,
            offset: { x: 0, y: 90 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -245 },
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 100, b: 127 },
            },
          },
          {
            spriteIdentifier: RSX.fxTendrilsGreen.name,
            offset: { x: 0, y: -15 },
            reverse: true,
            color: { r: 0, g: 200, b: 255 },
          },
        ],
      },
      SundropElixir: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxBuffSimpleGold.name,
            offset: { x: 0, y: -10 },
          },
          {
            spriteIdentifier: RSX.fxImpactBigOrange.name,
            offset: { x: 0, y: 0 },
            rotation: 90,
          },
        ],
      },
      BrilliantPlume: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxImpactGreenBig.name,
            offset: { x: -50, y: -75 },
          },
          {
            spriteIdentifier: RSX.fxImpactBigOrange.name,
            offset: { x: -25, y: -50 },
          },
          {
            spriteIdentifier: RSX.fxImpactRedBig.name,
            offset: { x: 0, y: -25 },
          },
          {
            spriteIdentifier: RSX.fxImpactBlueBig.name,
            offset: { x: 25, y: 0 },
          },
        ],
      },
      Mesmerize: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f6_mesmerize.name,
            offset: { x: 0, y: 90 },
          },
          { spriteIdentifier: RSX.fxTendrilsGreen.name },
          {
            spriteIdentifier: RSX.fxSwirlRingsBlue.name,
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      Avalanche: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f6_cryogenesis.name,
            offset: { x: 0, y: 200 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -245 },
              radius: 2000,
              intensity: 9,
              color: { r: 60, g: 255, b: 255 },
            },
          },
        ],
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f5_earthsphere_blue.name,
            offset: { x: 0, y: -40 },
          },
        ],
      },
      Cryogenesis: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f6_cryogenesis.name,
            offset: { x: 0, y: 300 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -245 },
              radius: 2000,
              intensity: 9,
              color: { r: 60, g: 255, b: 255 },
            },
          },
          {
            spriteIdentifier: RSX.fx_f5_earthsphere_blue.name,
            offset: { x: 0, y: -40 },
          },
        ],
      },
      ChromaticCold: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_crossslash_x.name,
            offset: { x: 0, y: 25 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 60, g: 255, b: 255 },
            },
            color: { r: 200, g: 25, b: 230 },
          },
          {
            spriteIdentifier: RSX.fx_f6_chromaticcold.name,
            offset: { x: 0, y: 70 },
          },
        ],
      },
      HailstonePrison: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f6_hailstoneprison.name,
            offset: { x: 0, y: 20 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 60, g: 255, b: 255 },
            },
          },
        ],
      },
      MarkOfSolitude: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f6_markofsolitude.name,
            offset: { x: 0, y: 90 },
          },
          {
            spriteIdentifier: RSX.fxSwirlRingsBlue.name,
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      Tempest: {
        SpellCastFX: [
          {
            type: 'Light',
            offset: { x: 0, y: -50 },
            radius: 2000,
            intensity: 9,
            duration: 1,
            color: { r: 255, g: 160, b: 60 },
          },
        ],
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_fireslash.name,
            offset: { x: 0, y: 10 },
          },
          {
            spriteIdentifier: RSX.fx_fireslash.name,
            flippedX: true,
            offset: { x: 0, y: 100 },
          },
          {
            spriteIdentifier: RSX.fxHeavensStrike.name,
            offset: { x: 0, y: 170 },
          },
        ],
      },
      AurynNexus: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f1_aurynnexus.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      FireOrb: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxTeleportOrangeOrb.name,
            offset: { x: 0, y: -4.5 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -5 },
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 160, b: 60 },
            },
          },
          {
            spriteIdentifier: RSX.fx_f3_entropicdecay.name,
            offset: { x: 0, y: 10 },
          },
          {
            spriteIdentifier: RSX.fx_f5_earthsphere_orange.name,
            offset: { x: 0, y: -40 },
          },
        ],
      },
      FreezingOrb: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxTeleportBlueOrb.name,
            offset: { x: 0, y: -4.5 },
          },
          {
            spriteIdentifier: RSX.fx_f5_earthsphere_blue.name,
            offset: { x: 0, y: -40 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -5 },
              radius: 2000,
              intensity: 9,
              color: { r: 60, g: 255, b: 255 },
            },
          },
          { plistFile: RSX.ptcl_pixelpuff.plist, type: 'Particles' },
          {
            spriteIdentifier: RSX.fxSwirlRingsBlue.name,
            offset: { x: 0, y: -45 },
          },
        ],
      },
      LastingJudgement: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f1_lasting_judgment.name,
            offset: { x: 0, y: 120 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -165 },
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 160, b: 60 },
            },
          },
          {
            spriteIdentifier: RSX.fxYellowTeleporterBeam.name,
            blendSrc: 'SRC_ALPHA',
            blendDst: 'ONE',
            offset: { x: 0, y: 22.5 },
          },
        ],
      },
      Martyrdom: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f1_martyrdom.name,
            offset: { x: 0, y: 120 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -165 },
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 160, b: 60 },
            },
          },
          {
            spriteIdentifier: RSX.fxYellowTeleporterBeam.name,
            blendSrc: 'SRC_ALPHA',
            blendDst: 'ONE',
            offset: { x: 0, y: 22.5 },
          },
        ],
      },
      WarSurge: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f1_warsurge.name,
            offset: { x: 0, y: 90 },
          },
          {
            spriteIdentifier: RSX.fxYellowTeleporterBeam.name,
            blendSrc: 'SRC_ALPHA',
            blendDst: 'ONE',
            offset: { x: 0, y: 22.5 },
          },
        ],
      },
      DaemonicLure: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_ringswirl.name,
            offset: { x: 0, y: 0 },
            color: { r: 120, g: 60, b: 255 },
          },
          {
            spriteIdentifier: RSX.fx_f4_daemoniclure.name,
            offset: { x: 30, y: 80 },
            emitFX: {
              type: 'Light',
              radius: 500,
              intensity: 9,
              color: { r: 200, g: 0, b: 100 },
            },
          },
        ],
      },
      KillTarget: {
        SpellAppliedFX: [
          { spriteIdentifier: RSX.fxFireTornado.name },
          { spriteIdentifier: RSX.fx_slashfrenzy.name },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -45 },
          },
        ],
      },
      KillTargetWithRanged: {
        SpellAppliedFX: [
          { spriteIdentifier: RSX.fxFireTornado.name },
          { spriteIdentifier: RSX.fxFaerieFireRed.name },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -45 },
          },
        ],
      },
      RiteOfTheUndervault: {
        SpellCastFX: [
          {
            type: 'Vortex',
            offset: { x: 0, y: 100 },
            radius: 140,
            duration: 2,
            color: { r: 255, g: 100, b: 255 },
          },
          {
            spriteIdentifier: RSX.fx_f4_riteundervault.name,
            offset: { x: 0, y: 100 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -45 },
              radius: 2000,
              intensity: 9,
              color: { r: 225, g: 0, b: 255 },
            },
          },
        ],
      },
      UnfathomableRite: {
        SpellCastFX: [
          {
            type: 'Vortex',
            offset: { x: 0, y: 100 },
            radius: 140,
            duration: 2,
            color: { r: 255, g: 100, b: 255 },
          },
          {
            spriteIdentifier: RSX.fx_f4_riteundervault.name,
            offset: { x: 0, y: 100 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -45 },
              radius: 2000,
              intensity: 9,
              color: { r: 225, g: 0, b: 255 },
            },
            reverse: true,
          },
        ],
      },
      ConsumingRebirth: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_crossslash.name,
            offset: { x: 0, y: 0 },
            color: { r: 200, g: 0, b: 100 },
          },
          {
            spriteIdentifier: RSX.fx_f4_consumingrebirth.name,
            offset: { x: 0, y: 15 },
          },
        ],
      },
      UnleashTheEvil: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_animalslash.name,
            offset: { x: 0, y: 0 },
            color: { r: 200, g: 0, b: 100 },
          },
          {
            spriteIdentifier: RSX.fx_animalslash.name,
            offset: { x: 0, y: 0 },
            flippedX: true,
            color: { r: 200, g: 0, b: 100 },
          },
          {
            spriteIdentifier: RSX.fx_f4_consumingrebirth.name,
            offset: { x: 0, y: 15 },
            flippedX: true,
            emitFX: {
              type: 'Light',
              intensity: 9,
              radius: 500,
              color: { r: 200, g: 0, b: 100 },
            },
          },
        ],
      },
      NetherSummoning: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f4_soulshatterpact.name,
            offset: { x: 0, y: 0 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -45 },
              radius: 2000,
              intensity: 9,
              color: { r: 225, g: 0, b: 255 },
            },
          },
        ],
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxTeleportPurpleOrb.name,
            offset: { x: 0, y: 0 },
            reverse: true,
            flippedY: true,
          },
          {
            spriteIdentifier: RSX.fx_f4_nethersummoning.name,
            offset: { x: 0, y: 70 },
          },
        ],
      },
      VoidPulse: {
        SpellCastFX: [
          {
            type: 'Light',
            offset: { x: 0, y: -45 },
            duration: 1,
            radius: 2000,
            intensity: 9,
            color: { r: 225, g: 0, b: 255 },
          },
        ],
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f4_voidpulse.name,
            offset: { x: 0, y: 0 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -45 },
              radius: 2000,
              intensity: 9,
              color: { r: 225, g: 0, b: 255 },
            },
          },
        ],
      },
      DeathfireCrescendo: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_flamesphere.name,
            offset: { x: 0, y: 0 },
            color: { r: 200, g: 0, b: 100 },
          },
          {
            spriteIdentifier: RSX.fx_f2_eightgates_purpleflame.name,
            offset: { x: -5, y: 60 },
          },
          {
            spriteIdentifier: RSX.fx_f4_deathfire_crescendo.name,
            offset: { x: 0, y: -25 },
          },
        ],
      },
      BreathOfTheUnborn: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f4_darkfiresacrifice.name,
            offset: { x: 0, y: 0 },
            reverse: true,
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 0, b: 255 },
            },
          },
        ],
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f4_nethersummoning.name,
            offset: { x: 0, y: 70 },
          },
        ],
      },
      DarkSacrifice: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f2_eightgates_purpleflame.name,
            offset: { x: -10, y: 70 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fx_f4_darkfiresacrifice.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      RitualBanishing: {
        SpellCastFX: [
          {
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -45 },
              radius: 2000,
              intensity: 9,
              color: { r: 225, g: 0, b: 255 },
              duration: 1,
            },
          },
        ],
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f4_darkfiresacrifice.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fx_f2_eightgates_purpleflame.name,
            offset: { x: -10, y: 75 },
          },
        ],
      },
      DarkTransformation: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f4_darkfiretransformation.name,
            offset: { x: 0, y: 40 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -45 },
              radius: 2000,
              intensity: 9,
              color: { r: 225, g: 0, b: 255 },
            },
          },
        ],
      },
      LionheartBlessing: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f1_lionheartblessing.name,
            offset: { x: 0, y: 90 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -45 },
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 160, b: 60 },
            },
          },
        ],
      },
      Lionize: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f1_lionheartblessing.name,
            offset: { x: 0, y: 90 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -45 },
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 160, b: 60 },
            },
          },
        ],
      },
      TrueStrike: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f1_truestrike.name,
            offset: { x: 0, y: 60 },
          },
          {
            spriteIdentifier: RSX.fxEnergyHaloGround.name,
            offset: { x: 0, y: -60 },
          },
        ],
      },
      Magnetize: {
        SpellCastFX: [
          { spriteIdentifier: RSX.fxBladestorm.name },
          {
            spriteIdentifier: RSX.fxYellowTeleporterBeam.name,
            blendSrc: 'SRC_ALPHA',
            blendDst: 'ONE',
            offset: { x: 0, y: 25 },
          },
          { spriteIdentifier: RSX.fxBuffSimpleGold.name },
        ],
      },
      CircleLife: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f1_circlelife.name,
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -45 },
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 160, b: 60 },
            },
          },
        ],
      },
      BeamShock: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -70 },
          },
          {
            spriteIdentifier: RSX.f1CasterProjectile.name,
            offset: { x: 0, y: 60 },
            rotation: -90,
          },
          {
            spriteIdentifier: RSX.fxImpactBigOrange.name,
            offset: { x: 0, y: 0 },
            rotation: 90,
          },
        ],
      },
      AerialRift: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxTeleportYellowOrb.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
          {
            offset: { x: 0, y: 0 },
            emitFX: {
              type: 'Vortex',
              duration: 0.8,
              radius: 100,
              color: { r: 255, g: 160, b: 60 },
            },
          },
        ],
      },
      HolyImmolation: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxHeavensStrike.name,
            offset: { x: 0, y: 170 },
          },
          {
            spriteIdentifier: RSX.fx_vortexswirl.name,
            offset: { x: 0, y: 15 },
            color: { r: 255, g: 200, b: 0 },
            emitFX: {
              type: 'Light',
              intensity: 9,
              radius: 2000,
              color: { r: 255, g: 200, b: 0 },
            },
          },
          {
            spriteIdentifier: RSX.fx_f1_holyimmolation.name,
            offset: { x: -5, y: -25 },
          },
        ],
      },
      DivineBond: {
        SpellCastFX: [
          { spriteIdentifier: RSX.fxBuffSimpleGold.name },
          {
            spriteIdentifier: RSX.fx_ringswirl.name,
            offset: { x: 0, y: 25 },
            color: { r: 75, g: 225, b: 255 },
          },
          {
            spriteIdentifier: RSX.fx_f1_divinebond.name,
            offset: { x: 0, y: 100 },
          },
        ],
      },
      DivineLiturgy: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f1_divinebond.name,
            offset: { x: 0, y: 100 },
          },
          { spriteIdentifier: RSX.fxBuffSimpleGold.name },
        ],
      },
      Decimate: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxHeavensStrike.name,
            offset: { x: 0, y: 170 },
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -65 },
          },
          {
            spriteIdentifier: RSX.fx_f1_decimate.name,
            offset: { x: 0, y: 0 },
          },
        ],
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f1_decimate.name,
            offset: { x: 0, y: 0 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 160, b: 60 },
            },
          },
        ],
      },
      DarkSeed: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f4_darkseed.name,
            offset: { x: 0, y: 60 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              duration: 1,
              color: { r: 255, g: 0, b: 255 },
            },
          },
        ],
      },
      AbyssianStrength: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f4_wraithlingfury.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      CurseOfAgony: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f4_nethersummoning.name,
            offset: { x: 0, y: 70 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -115 },
              radius: 2000,
              intensity: 9,
              color: { r: 225, g: 0, b: 255 },
            },
          },
          {
            spriteIdentifier: RSX.fx_f4_curseofagony.name,
            offset: { x: 0, y: 50 },
          },
        ],
      },
      ShadowReflection: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f4_shadowreflection.name,
            offset: { x: 0, y: 50 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -45 },
              radius: 2000,
              intensity: 9,
              color: { r: 225, g: 0, b: 255 },
            },
          },
        ],
      },
      SoulshatterPact: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f4_soulshatterpact.name,
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -45 },
              radius: 2000,
              intensity: 9,
              color: { r: 225, g: 0, b: 255 },
            },
          },
        ],
      },
      DemonicConversion: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f4_soulshatterpact.name,
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -45 },
              radius: 2000,
              intensity: 9,
              color: { r: 225, g: 0, b: 255 },
            },
          },
        ],
      },
      WraithlingSwarm: {},
      CosmicFlesh: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f3_cosmicflesh.name,
            offset: { x: 0, y: 90 },
          },
        ],
      },
      AstralPhasing: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name,
            flippedX: true,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxYellowTeleporterBeam.name,
            blendSrc: 'SRC_ALPHA',
            blendDst: 'ONE',
            offset: { x: 0, y: 22.5 },
          },
          {
            spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name,
            offset: { x: 0.1, y: 11.25 },
          },
        ],
      },
      BoneSwarm: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f3_boneswarm.name,
            offset: { x: 0, y: 40 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -45 },
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 150, b: 0 },
            },
          },
          {
            spriteIdentifier: RSX.fxSwirlRingsBlue.name,
            offset: { x: 0, y: 25 },
          },
          {
            spriteIdentifier: RSX.fx_f3_boneswarm.name,
            offset: { x: 0, y: 0 },
            flippedY: true,
            flippedX: true,
          },
        ],
      },
      EntropicDecay: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f3_entropicdecay.name,
            offset: { x: 0, y: 10 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -45 },
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 150, b: 0 },
            },
          },
          {
            spriteIdentifier: RSX.fx_vortexswirl.name,
            offset: { x: 0, y: 10 },
            reverse: true,
            color: { r: 255, g: 200, b: 50 },
          },
        ],
      },
      Wither: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_ringswirl.name,
            offset: { x: 0, y: 25 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -45 },
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 150, b: 0 },
            },
          },
          {
            spriteIdentifier: RSX.fxTeleportRecall.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
        ],
      },
      Maelstrom: {
        SpellCastFX: [
          {
            type: 'Vortex',
            radius: 125,
            duration: 2,
            opacity: 175,
            offset: { x: 0, y: 80 },
            color: { r: 255, g: 150, b: 0 },
          },
          {
            spriteIdentifier: RSX.fx_f3_entropicdecay.name,
            offset: { x: 0, y: 90 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fx_f5_earthsphere_orange.name,
            offset: { x: 0, y: 45 },
          },
        ],
      },
      FountainOfYouth: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f3_fountainofyouth.name,
            offset: { x: 0, y: 20 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -65 },
              radius: 2000,
              intensity: 9,
              color: { r: 60, g: 255, b: 255 },
            },
          },
          {
            spriteIdentifier: RSX.fxCleanse.name,
            offset: { x: 0, y: -45 },
            flippedX: true,
            zOrder: -1,
          },
        ],
      },
      ScionsFirstWish: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f3_scionsfirstwish.name,
            offset: { x: 0, y: 90 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -145 },
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 150, b: 0 },
            },
          },
          { plistFile: RSX.ptcl_pixelpuff.plist, type: 'Particles' },
        ],
      },
      ScionsSecondWish: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f3_scionssecondwish.name,
            offset: { x: 0, y: 90 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -145 },
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 150, b: 0 },
            },
          },
          {
            spriteIdentifier: RSX.fxCleanse.name,
            offset: { x: 0, y: -45 },
            flippedX: true,
            zOrder: -1,
          },
          {
            spriteIdentifier: RSX.fxSwirlRingsBlue.name,
            offset: { x: 0, y: -12.5 },
          },
        ],
      },
      ScionsThirdWish: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f3_scionsthirdwish.name,
            offset: { x: 0, y: 90 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -135 },
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 150, b: 0 },
            },
          },
          {
            spriteIdentifier: RSX.fxCleanse.name,
            offset: { x: 0, y: -45 },
            flippedX: true,
            zOrder: -1,
          },
          {
            spriteIdentifier: RSX.fxCleanse.name,
            offset: { x: 0, y: -20 },
            zOrder: -1,
          },
        ],
      },
      Blindscorch: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f3_blindscorch.name,
            offset: { x: 0, y: 30 },
          },
          {
            spriteIdentifier: RSX.fxCleanse.name,
            offset: { x: 0, y: 0 },
            flippedX: true,
            zOrder: -1,
          },
        ],
      },
      SiphonEnergy: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxCollisionSparksOrange.name,
            offset: { x: 0, y: -25 },
          },
          {
            spriteIdentifier: RSX.fxCollisionSparksBlue.name,
            offset: { x: 0, y: -25 },
          },
        ],
      },
      SandTrap: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxTeleportRecall.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fxBuffSimpleGold.name,
            offset: { x: 0, y: -20 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -65 },
          },
        ],
      },
      DrainMorale: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f3_drainmorale.name,
            offset: { x: 0, y: 100 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -145 },
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 150, b: 0 },
            },
          },
          { spriteIdentifier: RSX.fxBuffSimpleGold.name },
        ],
      },
      Amplification: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f5_amplification.name,
            offset: { x: 0, y: 90 },
          },
          {
            spriteIdentifier: RSX.fxSwirlRingsGreen.name,
            offset: { x: 0, y: 0 },
            flippedX: true,
          },
        ],
      },
      FractalReplication: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f5_fractalreplication.name,
            offset: { x: 0, y: 90 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -135 },
              radius: 2000,
              intensity: 9,
              color: { r: 0, g: 255, b: 127 },
            },
          },
        ],
      },
      EggMorph: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f5_earthsphere.name,
            offset: { x: 0, y: -35 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -75 },
              radius: 2000,
              intensity: 9,
              color: { r: 0, g: 255, b: 127 },
            },
          },
          {
            spriteIdentifier: RSX.fxSwirlRingsGreen.name,
            offset: { x: -10, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxSwirlRingsGreen.name,
            offset: { x: 10, y: 25 },
            flippedX: true,
          },
        ],
      },
      HatchAnEgg: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f5_earthsphere.name,
            offset: { x: 0, y: 35 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -45 },
              radius: 2000,
              intensity: 9,
              color: { r: 0, g: 255, b: 127 },
            },
          },
          {
            spriteIdentifier: RSX.fxSwirlRingsGreen.name,
            offset: { x: -10, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxSwirlRingsGreen.name,
            offset: { x: 20, y: 0 },
            flippedX: true,
          },
          { type: 'Particles', plistFile: RSX.ptcl_dot_square_green.plist },
        ],
      },
      FlashReincarnation: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f5_flashreincarnation.name,
            offset: { x: 0, y: 90 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -135 },
              radius: 2000,
              intensity: 9,
              color: { r: 0, g: 255, b: 127 },
            },
          },
        ],
      },
      Bellow: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f5_flashreincarnation.name,
            offset: { x: 0, y: 90 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -135 },
              radius: 2000,
              intensity: 9,
              color: { r: 0, g: 255, b: 127 },
            },
          },
        ],
      },
      SaberspineSeal: {
        SpellCastFX: [
          { spriteIdentifier: RSX.fxPlasmaRedVertical.name },
          {
            spriteIdentifier: RSX.fx_fireslash.name,
            offset: { x: 0, y: 10 },
          },
          {
            spriteIdentifier: RSX.fx_f2_saberspineseal.name,
            offset: { x: 0, y: 100 },
          },
        ],
      },
      MistDragonSeal: {
        SpellCastFX: [
          { spriteIdentifier: RSX.fxPlasmaBlueVertical.name },
          {
            spriteIdentifier: RSX.fx_f2_mistdragonseal.name,
            offset: { x: 0, y: 100 },
          },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpBlue.name,
            flippedX: true,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -45 },
          },
        ],
      },
      InnerFocus: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f2_innerfocus.name,
            offset: { x: 0, y: 120 },
          },
          { spriteIdentifier: RSX.fxBuffSimpleGold.name },
        ],
      },
      PhoenixFire: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f2_phoenixfire.name,
            offset: { x: 0, y: 45 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              duration: 1.5,
              color: { r: 255, g: 0, b: 60 },
            },
          },
          {
            spriteIdentifier: RSX.fxFireTornado.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      PhoenixBarrage: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f2_phoenixfire.name,
            offset: { x: 50, y: 50 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              duration: 1.5,
              color: { r: 255, g: 0, b: 60 },
            },
            rotation: 30,
            flippedX: true,
          },
          {
            spriteIdentifier: RSX.fx_f2_phoenixfire.name,
            offset: { x: -50, y: 50 },
            rotation: -30,
          },
          {
            spriteIdentifier: RSX.fx_ringswirl.name,
            offset: { x: 0, y: 30 },
            color: { r: 255, g: 200, b: 60 },
          },
          {
            spriteIdentifier: RSX.fxFireTornado.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      TwinStrike: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: -235, y: -45 },
          },
          {
            spriteIdentifier: RSX.fx_f2_twinstrike.name,
            offset: { x: -125, y: 90 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -45 },
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 0, b: 60 },
            },
          },
          {
            spriteIdentifier: RSX.fx_f2_twinstrike_part2.name,
            offset: { x: 125, y: 90 },
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 235, y: -45 },
          },
        ],
      },
      SpellDamage: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxPlasmaRedVertical.name,
            flippedX: true,
            offset: { x: 0, y: 0 },
          },
          { spriteIdentifier: RSX.fxFireTornado.name },
          { spriteIdentifier: RSX.fxFaerieFireRed.name },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -45 },
          },
        ],
      },
      FollowupDamage: {
        SpellAppliedFX: [
          { spriteIdentifier: RSX.fxFaerieFireRed.name },
          { spriteIdentifier: RSX.fxExplosionOrangeSmoke.name },
          { spriteIdentifier: RSX.fx_slashfrenzy.name },
        ],
      },
      FollowupDamageDevour: {
        SpellAppliedFX: [
          { spriteIdentifier: RSX.fxDevour.name },
          {
            spriteIdentifier: RSX.BloodExplosionBig.name,
            flippedX: true,
            offset: { x: -20, y: -10 },
          },
          {
            spriteIdentifier: RSX.BloodExplosionMedium.name,
            offset: { x: 20, y: -10 },
          },
        ],
      },
      SpiralTechnique: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_fireslash.name,
            offset: { x: 0, y: 10 },
          },
          {
            spriteIdentifier: RSX.fx_fireslash.name,
            flippedX: true,
            offset: { x: 0, y: 50 },
          },
          {
            spriteIdentifier: RSX.fx_f2_spiraltechnique02.name,
            offset: { x: 5, y: 70 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -125 },
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 0, b: 60 },
            },
          },
          {
            spriteIdentifier: RSX.fx_f2_eightgates_teal.name,
            offset: { x: 0, y: 85 },
            autoZOrderOffset: -1,
          },
        ],
      },
      ManaVortex: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxImpactRedBig.name,
            offset: { x: 0, y: 70 },
            rotation: -90,
          },
          {
            spriteIdentifier: RSX.fx_f2_manavortex.name,
            offset: { x: 0, y: 90 },
          },
          {
            spriteIdentifier: RSX.fxExplosionGroundSmokeSwirl.name,
            offset: { x: 5, y: -50 },
            rotation: 15,
          },
        ],
      },
      Meditate: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f2_ancestralpact.name,
            offset: { x: 0, y: 65 },
            rotation: 0,
          },
          {
            spriteIdentifier: RSX.fx_f2_manavortex.name,
            offset: { x: 10, y: 70 },
          },
          {
            spriteIdentifier: RSX.fxExplosionGroundSmokeSwirl.name,
            offset: { x: 5, y: -60 },
            rotation: 15,
          },
        ],
      },
      HeavensEclipse: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f2_heavenseclipse.name,
            offset: { x: 0, y: 90 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -135 },
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 0, b: 60 },
            },
          },
        ],
      },
      OnyxBearSeal: {
        SpellCastFX: [
          { spriteIdentifier: RSX.fxPlasmaRedVertical.name },
          {
            spriteIdentifier: RSX.fx_f2_onyxbearseal.name,
            offset: { x: 0, y: 100 },
          },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpYellow.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -45 },
          },
        ],
      },
      Pandatentiary: {
        SpellCastFX: [
          { spriteIdentifier: RSX.fxPlasmaRedVertical.name },
          {
            spriteIdentifier: RSX.fx_f2_onyxbearseal.name,
            offset: { x: 0, y: 100 },
          },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpYellow.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -45 },
          },
        ],
      },
      EightGates: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f2_eightgates_blue.name,
            offset: { x: 0, y: 90 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -135 },
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 0, b: 60 },
            },
          },
        ],
      },
      KenshoVortex: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f2_spiraltechnique02.name,
            offset: { x: 0, y: 90 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -135 },
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 0, b: 60 },
            },
          },
          {
            spriteIdentifier: RSX.fx_tornadoswirl.name,
            offset: { x: 0, y: 0 },
            color: { r: 255, g: 175, b: 60 },
          },
        ],
      },
      AncestralDivination: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f2_ancestralpact.name,
            offset: { x: 0, y: 90 },
          },
          {
            spriteIdentifier: RSX.fxSwirlRingsGreen.name,
            offset: { x: 0, y: -25 },
          },
        ],
      },
      KillingEdge: {
        SpellCastFX: [
          { spriteIdentifier: RSX.fxFireTornado.name },
          {
            spriteIdentifier: RSX.fx_f2_killingedge.name,
            offset: { x: 0, y: 0 },
            emitFX: {
              type: 'Light',
              intensity: 9,
              radius: 2000,
              color: { r: 255, g: 0, b: 60 },
            },
          },
        ],
      },
      ApplyModifiers: {
        SpellCastFX: [
          { spriteIdentifier: RSX.fxBuffSimpleGold.name },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -45 },
          },
        ],
      },
      GhostLightning: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxPlasmaRedVertical.name,
            offset: { x: 15, y: 20 },
            rotation: 65,
            emitFX: {
              type: 'Light', radius: 50, intensity: 9, duration: 0.75,
            },
          },
          {
            spriteIdentifier: RSX.fxPlasmaRedVertical.name,
            offset: { x: -15, y: -40 },
            rotation: -130,
          },
        ],
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxChainLightningRed.name,
            type: 'Chain',
            impactAtStart: false,
            impactAtEnd: true,
            impactFX: [
              {
                spriteIdentifier: RSX.fxPlasmaRedVertical.name,
                offset: { x: 0, y: 0 },
              },
            ],
          },
        ],
      },
      KageLightning: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f2_backstab.name,
            offset: { x: 0, y: 30 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -45 },
              radius: 2000,
              intensity: 9,
              color: { r: 100, g: 100, b: 100 },
            },
          },
        ],
      },
      DeathstrikeSeal: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f2_deathstrikeseal.name,
            offset: { x: 0, y: 100 },
          },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpYellow.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -45 },
          },
          {
            spriteIdentifier: RSX.fxPlasmaRedVertical.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      RashasCurse: {
        SpellCastFX: [
          { spriteIdentifier: RSX.fxPlasmaBlueVertical.name },
          {
            spriteIdentifier: RSX.fx_f3_rashascurse.name,
            offset: { x: 0, y: 200 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -245 },
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 150, b: 0 },
            },
          },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      Accumulonimbus: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxSandTileSpawn.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fx_tornadoswirl.name,
            offset: { x: 0, y: 0 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -245 },
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 150, b: 0 },
            },
            color: { r: 200, g: 150, b: 30 },
            flippedY: false,
          },
          {
            spriteIdentifier: RSX.fx_ringswirl.name,
            offset: { x: 0, y: 0 },
            flippedY: true,
          },
        ],
      },
      DervishCast: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxPlasmaBlueVertical.name,
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -45 },
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 150, b: 0 },
            },
          },
          {
            spriteIdentifier: RSX.fx_f3_rashascurse.name,
            offset: { x: 0, y: 200 },
          },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      AstralFlood: {
        SpellCastFX: [
          {
            type: 'Light',
            offset: { x: 0, y: -45 },
            duration: 1,
            radius: 2000,
            intensity: 9,
            color: { r: 255, g: 160, b: 60 },
          },
          {
            spriteIdentifier: RSX.fxExplosionGroundSmokeSwirl.name,
            offset: { x: 0, y: 150 },
            rotation: 15,
          },
          {
            spriteIdentifier: RSX.fxBuffSimpleGold.name,
            offset: { x: 0, y: 60 },
            flippedY: true,
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: -5, y: 125 },
          },
        ],
      },
      AurorasTears: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f3_aurorastears.name,
            offset: { x: 0, y: -20 },
          },
        ],
      },
      MistWalking: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxExplosionGroundSmokeSwirl.name,
            offset: { x: 10, y: -50 },
            rotation: 15,
          },
          {
            spriteIdentifier: RSX.fx_f2_teleportsmoke.name,
            offset: { x: -10, y: 20 },
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -60 },
          },
        ],
      },
      StarsFury: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f3_starsfury.name,
            offset: { x: 0, y: 375 },
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -45 },
          },
        ],
      },
      ArtifactDefiler: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxElectricalGroundUpYellow.name,
            offset: { x: -25, y: 45 },
            rotation: -30,
          },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpYellow.name,
            offset: { x: 30, y: -45 },
            rotation: 150,
          },
          {
            spriteIdentifier: RSX.fxArtifactBreak.name,
            offset: { x: 0, y: 0 },
            color: { r: 255, g: 0, b: 0 },
          },
        ],
      },
      DampeningWave: {
        SpellAppliedFX: [
          {
            offset: { x: 0, y: 0 },
            plistFile: RSX.ptcl_circleswirls.plist,
            type: 'Particles',
            color: { r: 0, g: 255, b: 0 },
          },
          {
            spriteIdentifier: RSX.fxCleanse.name,
            offset: { x: 0, y: -45 },
            color: { r: 0, g: 255, b: 125 },
          },
          {
            spriteIdentifier: RSX.fxCleanse.name,
            offset: { x: 0, y: 0 },
            color: { r: 0, g: 255, b: 125 },
          },
        ],
      },
      DiretideFrenzy: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_slashfrenzy.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fx_animalslash.name,
            offset: { x: -20, y: 0 },
            color: { r: 90, g: 240, b: 170 },
            flippedX: true,
            flippedY: true,
            rotation: 45,
          },
        ],
      },
      Tremor: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f5_tremor.name,
            offset: { x: 0, y: 0 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -75 },
              radius: 2000,
              intensity: 9,
              color: { r: 0, g: 255, b: 127 },
            },
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -50 },
          },
        ],
      },
      DanceOfDreams: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f5_manaburn.name,
            offset: { x: 0, y: 30 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -75 },
              radius: 2000,
              intensity: 9,
              color: { r: 0, g: 255, b: 127 },
            },
          },
        ],
      },
      MindSteal: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f5_mindsteal.name,
            offset: { x: 0, y: 90 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -135 },
              radius: 2000,
              intensity: 9,
              color: { r: 0, g: 255, b: 127 },
            },
          },
        ],
      },
      GargantuanGrowth: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f5_mindsteal.name,
            offset: { x: 0, y: 90 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -135 },
              radius: 2000,
              intensity: 9,
              color: { r: 0, g: 255, b: 127 },
            },
          },
        ],
      },
      GreaterFortitude: {
        ModifierAppliedFX: [
          {
            spriteIdentifier: RSX.fx_animalslash.name,
            offset: { x: 0, y: 25 },
            rotation: 90,
            color: { r: 255, g: 170, b: 60 },
          },
          {
            spriteIdentifier: RSX.fx_f5_flashreincarnation.name,
            offset: { x: 0, y: 90 },
          },
        ],
      },
      Invigoration: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxImpactGreenBig.name,
            offset: { x: 0, y: 0 },
            reverse: false,
            emitFX: {
              type: 'Light',
              intensity: 9,
              radius: 2000,
              color: { r: 0, g: 255, b: 125 },
            },
            rotation: 90,
          },
          {
            spriteIdentifier: RSX.fxImpactGreenSmall.name,
            offset: { x: -30, y: 25 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fxImpactGreenSmall.name,
            offset: { x: 40, y: -35 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fxImpactGreenSmall.name,
            offset: { x: 45, y: 50 },
          },
          {
            spriteIdentifier: RSX.fxImpactGreenSmall.name,
            offset: { x: -45, y: -50 },
          },
        ],
      },
      EarthSphere: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f5_earthsphere.name,
            offset: { x: 0, y: 0 },
            reverse: true,
            emitFX: {
              type: 'Light',
              intensity: 9,
              radius: 2000,
              color: { r: 0, g: 255, b: 125 },
            },
          },
          {
            offset: { x: 0, y: 35 },
            emitFX: { type: 'Vortex', radius: 150, duration: 2 },
          },
        ],
      },
      BoundedLifeforce: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f5_manaburn.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fx_f5_boundedlife.name,
            offset: { x: 0, y: 150 },
          },
        ],
      },
      SpiritoftheWild: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f6_spiritofthewild.name,
            offset: { x: 0, y: 20 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -45 },
              radius: 2000,
              intensity: 9,
              color: { r: 60, g: 255, b: 255 },
            },
          },
        ],
      },
      AegisBarrier: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.FloatingShield.name,
            offset: { x: -25, y: -25 },
          },
          {
            spriteIdentifier: RSX.ForceField.name,
            offset: { x: 0, y: -4.5 },
          },
          { spriteIdentifier: RSX.fxFaerieFireBlue.name },
        ],
      },
      Metamorphosis: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f5_manaburn.name,
            offset: { x: 0, y: 0 },
            reverse: 1,
          },
        ],
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f5_flashreincarnation.name,
            offset: { x: 0, y: 70 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fx_f5_naturalselection.name,
            offset: { x: 0, y: 70 },
            reverse: true,
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 0, g: 255, b: 125 },
            },
          },
        ],
      },
      PlasmaStorm: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f5_kinectequilibrium.name,
            offset: { x: 0, y: 350 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 0, g: 255, b: 125 },
            },
          },
        ],
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f5_manaburn.name,
            offset: { x: 0, y: 30 },
          },
          {
            spriteIdentifier: RSX.fx_f3_blaststarfire.name,
            rotation: -90,
            offset: { x: 0, y: 400 },
          },
          { spriteIdentifier: RSX.fxElectricalGroundUpBlue.name },
        ],
      },
      ChrysalisBurst: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f5_amplification.name,
            offset: { x: 0, y: 90 },
          },
          {
            spriteIdentifier: RSX.fxTendrilsGreen.name,
            offset: { x: -50, y: 55 },
            flippedX: true,
          },
          {
            spriteIdentifier: RSX.fxTendrilsGreen.name,
            offset: { x: 50, y: 45 },
          },
          {
            spriteIdentifier: RSX.fxTendrilsGreen.name,
            offset: { x: 10, y: 0 },
            flippedX: true,
          },
        ],
      },
      ExtinctionEvent: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_flamesphere.name,
            offset: { x: 0, y: 120 },
            color: { r: 255, g: 170, b: 60 },
            emitFX: {
              type: 'Light',
              radius: 1500,
              intensity: 9,
              color: { r: 255, g: 170, b: 60 },
            },
          },
          {
            spriteIdentifier: RSX.fx_f5_amplification.name,
            offset: { x: 0, y: 90 },
          },
          {
            spriteIdentifier: RSX.fxPrimalTileSpawn.name,
            offset: { x: 0, y: -50 },
          },
        ],
      },
      Shadowspawn: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f4_bbs_shadowspawn.name,
            offset: { x: 0, y: 50 },
          },
        ],
      },
      AbyssalScar: {
        ModifierAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f4_bbs_abyssalscar.name,
            offset: { x: 0, y: 50 },
          },
        ],
      },
      Blink: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f2_bbs_blink.name,
            offset: { x: 0, y: 50 },
          },
        ],
      },
      ArcaneHeart: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f2_bbs_arcaneheart.name,
            offset: { x: 0, y: 50 },
          },
        ],
      },
      Afterglow: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f1_bbs_afterglow.name,
            offset: { x: 0, y: 50 },
          },
        ],
      },
      WindShroud: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f3_bbs_ironshroud.name,
            offset: { x: 0, y: 50 },
          },
        ],
      },
      Roar: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f1_bbs_roar.name,
            offset: { x: 0, y: 50 },
          },
        ],
      },
      PsionicStrike: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f3_bbs_psyonicstrike.name,
            offset: { x: 0, y: 50 },
          },
        ],
      },
      Decension: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f3_bbs_decension.name,
            offset: { x: 0, y: 50 },
          },
        ],
      },
      Warbird: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxImpactBlueBig.name,
            offset: { x: 0, y: 0 },
            rotation: 90,
          },
        ],
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f6_bbs_warbird.name,
            offset: { x: 0, y: 50 },
          },
        ],
      },
      Overload: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f5_bbs_overload.name,
            offset: { x: 0, y: 50 },
          },
        ],
      },
      KineticSurge: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f6_bbs_kinectsurge.name,
            offset: { x: 0, y: 50 },
          },
        ],
      },
      PetalFlurry: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f2_bbs_petalflurry.name,
            offset: { x: 0, y: 50 },
          },
        ],
      },
      Crystallize: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f6_bbs_crystallize.name,
            offset: { x: 0, y: 50 },
          },
        ],
      },
      Conscript: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f1_bbs_conscript.name,
            offset: { x: 0, y: 50 },
          },
        ],
      },
      Malice: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f4_bbs_malice.name,
            offset: { x: 0, y: 50 },
          },
        ],
      },
      EggBBS: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f5_bbs_egg.name,
            offset: { x: 0, y: 50 },
          },
        ],
      },
      SeekingEye: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f5_bbs_seekingeye.name,
            offset: { x: 0, y: 50 },
          },
        ],
      },
      KineticEquilibrium: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f5_kinectequilibrium.name,
            offset: { x: 0, y: 360 },
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -415 },
              radius: 2000,
              intensity: 9,
              color: { r: 0, g: 255, b: 127 },
            },
          },
        ],
      },
      NaturalSelection: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f5_manaburn.name,
            offset: { x: 0, y: 0 },
            color: { r: 175, g: 175, b: 175 },
          },
          {
            spriteIdentifier: RSX.fx_f5_naturalselection.name,
            offset: { x: 0, y: 75 },
          },
        ],
      },
      IceCage: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxFrozenIceBlock.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxTeleportBlueOrb.name,
            offset: { x: 0, y: 15 },
          },
        ],
      },
      KoanOfHorns: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f2_koanofhorns.name,
            offset: { x: 0, y: 150 },
            emitFX: { type: 'Light', intensity: 9 },
          },
        ],
      },
      SkyPhalanx: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f1_skyphalanx.name,
            offset: { x: 0, y: 20 },
            emitFX: { type: 'Light', intensity: 9 },
          },
        ],
      },
      Obliterate: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f4_obliterate.name,
            offset: { x: 0, y: 20 },
            emitFX: { type: 'Light', intensity: 9 },
          },
        ],
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxShadowCreepSpawn.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
        ],
      },
      Munch: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f4_soulshatterpact.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxShadowCreepSpawn.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
        ],
      },
      Riddle: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_neutral_riddle.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      FlamingStampede: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f5_flamingstampede.name,
            offset: { x: 0, y: 0 },
            emitFX: { type: 'Light', intensity: 9 },
          },
        ],
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f3_blast.name,
            offset: { x: 0, y: 375 },
            rotation: -90,
          },
          {
            spriteIdentifier: RSX.fxSearingChasm.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -65 },
          },
        ],
      },
      CircleOfDesiccation: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f3_circleofdessication.name,
            offset: { x: 0, y: 100 },
            emitFX: { type: 'Light', intensity: 9 },
          },
        ],
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f3_starsfury.name,
            offset: { x: 0, y: 375 },
          },
        ],
      },
      CircleOfFabrication: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f3_circleofdessication.name,
            offset: { x: 0, y: 100 },
            emitFX: { type: 'Light', intensity: 9 },
            reverse: true,
          },
        ],
      },
      WintersWake: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f6_winterswake.name,
            offset: { x: 0, y: 150 },
            emitFX: { type: 'Light', intensity: 9 },
          },
        ],
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxTeleportBlueOrb.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      IceAge: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f6_winterswake.name,
            offset: { x: 0, y: -25 },
            emitFX: { type: 'Light', intensity: 9 },
            reverse: true,
            flippedY: true,
          },
        ],
      },
      IroncliffeHeart: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxTeleportYellowOrb.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxCleanse.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxEnergyHaloGround.name,
            offset: { x: 0, y: -75 },
          },
        ],
      },
      DrainingWave: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f3_blaststarfire.name,
            offset: { x: 0, y: 350 },
            rotation: -90,
          },
          {
            spriteIdentifier: RSX.fx_f3_fountainofyouth.name,
            offset: { x: 0, y: -25 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              duration: 1.25,
              color: { r: 125, g: 215, b: 255 },
            },
          },
          {
            spriteIdentifier: RSX.fx_f1_lionheartblessing.name,
            offset: { x: 0, y: 100 },
          },
        ],
      },
      SkyBurial: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f1_decimate.name,
            offset: { x: 0, y: 0 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              duration: 1,
              color: { r: 255, g: 160, b: 60 },
            },
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -70 },
          },
        ],
      },
      LucentBeam: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_beamlaser.name,
            offset: { x: 0, y: 225 },
            emitFX: {
              type: 'Light',
              duration: 0.5,
              intensity: 9,
              radius: 2000,
              color: { r: 255, g: 160, b: 60 },
            },
            color: { r: 255, g: 225, b: 100 },
          },
          {
            spriteIdentifier: RSX.fxYellowTeleporterBeam.name,
            offset: { x: 0, y: 15 },
          },
          {
            spriteIdentifier: RSX.fxHeavensStrike.name,
            offset: { x: 0, y: 150 },
            rotation: 0,
            reverse: false,
          },
        ],
      },
      CrimsonCoil: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxFireTornado.name,
            offset: { x: 0, y: 0 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              duration: 0.75,
              color: { r: 255, g: 0, b: 60 },
            },
          },
          {
            spriteIdentifier: RSX.fxExplosionGroundSmokeSwirl.name,
            offset: { x: 0, y: -70 },
            rotation: 15,
          },
          {
            spriteIdentifier: RSX.fxImpactRedMed.name,
            offset: { x: 0, y: -60 },
            rotation: 90,
          },
        ],
      },
      ObscuringBlow: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f2_backstab.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fx_fireslash.name,
            offset: { x: 0, y: 0 },
            flippedX: true,
          },
        ],
      },
      ShadowWaltz: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxBladestorm.name,
            offset: { x: 0, y: 30 },
          },
          {
            spriteIdentifier: RSX.fxCrossSlash.name,
            offset: { x: 0, y: 0 },
            color: { r: 255, g: 50, b: 50 },
          },
          {
            spriteIdentifier: RSX.fxBladestorm.name,
            offset: { x: 0, y: -30 },
            flippedX: true,
          },
        ],
      },
      Knucklestorm: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_multislash_intro.name,
            offset: { x: 0, y: 0 },
            color: { r: 255, g: 85, b: 85 },
          },
          {
            spriteIdentifier: RSX.fxBladestorm.name,
            offset: { x: 0, y: 30 },
            color: { r: 255, g: 175, b: 60 },
          },
          {
            spriteIdentifier: RSX.fxBladestorm.name,
            offset: { x: 0, y: -30 },
            flippedX: true,
            color: { r: 255, g: 175, b: 60 },
          },
        ],
      },
      EtherealBlades: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_fireslash.name,
            offset: { x: 0, y: -10 },
          },
          {
            spriteIdentifier: RSX.fx_fireslash.name,
            offset: { x: 0, y: 30 },
            flippedX: true,
          },
        ],
      },
      CobraStrike: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f2_twinstrike_part2.name,
            offset: { x: 45, y: 90 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              duration: 1,
              intensity: 9,
              color: { r: 255, g: 0, b: 60 },
            },
          },
          {
            spriteIdentifier: RSX.fx_f2_teleportsmoke.name,
            offset: { x: 160, y: 20 },
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 160, y: -45 },
          },
        ],
      },
      MirrorMeld: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxTeleportOrangeOrb.name,
            offset: { x: 0, y: 0 },
          },
          {
            offset: { x: 0, y: 0 },
            emitFX: {
              type: 'Vortex',
              radius: 100,
              duration: 1,
              color: { r: 255, g: 60, b: 60 },
            },
          },
        ],
      },
      SecondSelf: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxTeleportOrangeOrb.name,
            offset: { x: 0, y: 0 },
          },
          {
            offset: { x: 0, y: 0 },
            emitFX: {
              type: 'Vortex',
              radius: 100,
              duration: 1,
              color: { r: 255, g: 60, b: 60 },
            },
          },
        ],
      },
      InnerOasis: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f1_divinebond.name,
            offset: { x: 0, y: 20 },
            color: { r: 200, g: 100, b: 0 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fxCleanse.name,
            offset: { x: 0, y: -50 },
          },
          {
            spriteIdentifier: RSX.fxSwirlRingsBlue.name,
            offset: { x: 0, y: 125 },
          },
          {
            spriteIdentifier: RSX.fxBlueWaterSplash.name,
            offset: { x: 0, y: -35 },
          },
        ],
      },
      AutarchsGifts: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxHeavensStrike.name,
            offset: { x: 0, y: 200 },
          },
          {
            spriteIdentifier: RSX.fx_f3_entropicdecay.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      DivineSpark: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f5_earthsphere_orange.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
          {
            offset: { x: 0, y: 40 },
            emitFX: {
              type: 'Vortex',
              radius: 150,
              duration: 1.5,
              color: { r: 255, g: 150, b: 0 },
            },
          },
        ],
      },
      StoneToSpears: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxCollisionSparksOrange.name,
            offset: { x: 0, y: -20 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fxCollisionSparksOrange.name,
            offset: { x: 0, y: -20 },
            reverse: true,
            flippedX: true,
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -65 },
          },
        ],
      },
      EchoingShriek: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f4_wraithlingfury.name,
            offset: { x: 0, y: 0 },
            reverse: true,
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 0, b: 255 },
            },
          },
        ],
      },
      InkhornGaze: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxTeleportPurpleOrb.name,
            offset: { x: 0, y: 0 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 0, b: 255 },
            },
            rotation: 45,
          },
          {
            spriteIdentifier: RSX.fxCrossSlash.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      LurkingFear: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_beamfire.name,
            offset: { x: 0, y: 250 },
            color: { r: 200, g: 0, b: 100 },
          },
          {
            spriteIdentifier: RSX.fx_f4_darkfiresacrifice.name,
            offset: { x: 8, y: 0 },
            reverse: true,
          },
        ],
      },
      SphereOfDarkness: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxTeleportPurpleOrb.name,
            offset: { x: 0, y: 0 },
            reverse: true,
            flippedY: true,
          },
        ],
      },
      VoidSteal: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f4_voidpulse.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
        ],
        SpellCastFX: [
          {
            offset: { x: 0, y: 0 },
            emitFX: {
              radius: 100,
              duration: 1,
              type: 'Vortex',
              color: { r: 255, g: 100, b: 255 },
            },
          },
        ],
      },
      NecroticSphere: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f4_nethersummoning.name,
            offset: { x: 0, y: 70 },
          },
          {
            spriteIdentifier: RSX.fxTeleportPurpleOrb.name,
            offset: { x: 0, y: 0 },
          },
        ],
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f4_darkfiretransformation.name,
            offset: { x: 0, y: 0 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 0, b: 255 },
            },
          },
        ],
      },
      Punish: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_vortexswirl.name,
            offset: { x: 0, y: 0 },
            reverse: true,
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 120, g: 60, b: 255 },
            },
            color: { r: 200, g: 0, b: 100 },
            flippedY: true,
          },
          {
            spriteIdentifier: RSX.fx_f4_deathfire_crescendo.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
        ],
      },
      LavaLance: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxFireTornado.name,
            offset: { x: 0, y: 0 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 125, b: 50 },
            },
          },
          {
            spriteIdentifier: RSX.fxSearingChasm.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      RazorSkin: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxTendrilsGreen.name,
            offset: { x: 0, y: -30 },
          },
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            offset: { x: 0, y: 30 },
            reverse: true,
          },
        ],
      },
      ThumpingWave: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f5_mindsteal.name,
            offset: { x: 5, y: 50 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 0, g: 255, b: 125 },
            },
            reverse: true,
          },
          {
            offset: { x: 0, y: 0 },
            plistFile: RSX.ptcl_circleswirls.plist,
            type: 'Particles',
            color: { r: 0, g: 255, b: 0 },
          },
          {
            spriteIdentifier: RSX.fx_f5_manaburn.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      DeepImpact: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxTeleportOrangeOrb.name,
            offset: { x: 0, y: 150 },
          },
          {
            spriteIdentifier: RSX.fx_f5_manaburn.name,
            offset: { x: 0, y: 0 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 150, b: 100 },
            },
          },
          {
            spriteIdentifier: RSX.fx_bouldersphere.name,
            offset: { x: 0, y: 50 },
            color: { r: 200, g: 125, b: 50 },
          },
        ],
      },
      EntropicGaze: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxTeleportOrangeOrb.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fx_f5_flashreincarnation.name,
            offset: { x: 0, y: 70 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 125, b: 50 },
            },
          },
        ],
      },
      TectonicSpikes: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f5_tremor.name,
            offset: { x: 0, y: 0 },
            reverse: true,
            emitFX: {
              type: 'Light',
              intensity: 9,
              radius: 2000,
              color: { r: 255, g: 125, b: 50 },
            },
          },
          {
            spriteIdentifier: RSX.fx_f3_blast.name,
            offset: { x: 0, y: 400 },
            rotation: -90,
          },
        ],
      },
      LightningBlitz: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            offset: { x: 0, y: -45 },
          },
          {
            spriteIdentifier: RSX.fxPlasmaBlueVertical.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      Frostburn: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f6_chromaticcold.name,
            offset: { x: 0, y: 60 },
            reverse: true,
            emitFX: {
              type: 'Light',
              intensity: 9,
              radius: 2000,
              color: { r: 60, g: 255, b: 255 },
            },
          },
        ],
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxFrozenIceBlock.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      Polarity: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxSwirlRingsBlue.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxSwirlRingsBlue.name,
            offset: { x: 0, y: -40 },
          },
        ],
      },
      LifeCoil: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxEnergyHaloGround.name,
            offset: { x: 0, y: -65 },
          },
          {
            spriteIdentifier: RSX.fxYellowTeleporterBeam.name,
            offset: { x: 0, y: 30 },
          },
        ],
      },
      Bolster: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxEnergyHaloGround.name,
            offset: { x: 0, y: -75 },
          },
          {
            spriteIdentifier: RSX.fxYellowTeleporterBeam.name,
            offset: { x: 0, y: 15 },
          },
          {
            spriteIdentifier: RSX.fx_f1_lionheartblessing.name,
            offset: { x: 0, y: 75 },
          },
        ],
      },
      Joseki: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_fireslash.name,
            offset: { x: 0, y: -10 },
          },
          {
            spriteIdentifier: RSX.fx_fireslash.name,
            offset: { x: 0, y: 30 },
            flippedX: true,
          },
        ],
      },
      BloodEchoes: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_multislash_full.name,
            offset: { x: 0, y: 0 },
            color: { r: 200, g: 0, b: 100 },
          },
          {
            spriteIdentifier: RSX.fx_f4_consumingrebirth.name,
            offset: { x: 0, y: 90 },
            reverse: true,
            emitFX: {
              type: 'Light',
              radius: 1200,
              intensity: 9,
              color: { r: 200, g: 0, b: 100 },
            },
          },
        ],
      },
      BloodOfAir: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f3_rashascurse.name,
            offset: { x: 10, y: 175 },
            reverse: true,
            emitFX: { type: 'Light', radius: 2000, intensity: 9 },
          },
          {
            spriteIdentifier: RSX.fx_tornadoswirl.name,
            offset: { x: 0, y: 0 },
            reverse: true,
            color: { r: 150, g: 255, b: 255 },
          },
          {
            spriteIdentifier: RSX.fxBladestorm.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      CascadingRebirth: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxTeleportOrangeOrb.name,
            offset: { x: 0, y: 0 },
            flippedY: true,
          },
          {
            spriteIdentifier: RSX.fx_f5_earthsphere.name,
            offset: { x: 0, y: -35 },
            reverse: true,
          },
        ],
      },
      ManaDeathgrip: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxTeleportBlueOrb.name,
            offset: { x: 0, y: 0 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 60, g: 255, b: 255 },
            },
          },
        ],
      },
      LesserWaterball: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxTeleportBlueOrb.name,
            offset: { x: 0, y: 0 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 60, g: 255, b: 255 },
            },
          },
        ],
      },
      LessonOfPower: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            offset: { x: -30, y: 40 },
            flippedX: true,
            color: { r: 0, g: 225, b: 255 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            offset: { x: 40, y: 20 },
            color: { r: 0, g: 225, b: 255 },
          },
        ],
      },
      LessonOfWisdom: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxSwirlRingsGreen.name,
            offset: { x: 0, y: -25 },
          },
          {
            spriteIdentifier: RSX.fxImpactGreenBig.name,
            offset: { x: 0, y: 0 },
            rotation: 90,
          },
        ],
      },
      LessonOfCourage: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxImpactBlueMed.name,
            offset: { x: -50, y: 15 },
            rotation: 45,
          },
          {
            spriteIdentifier: RSX.fxImpactBlueMed.name,
            offset: { x: 50, y: 15 },
            rotation: -45,
            flippedX: 1,
          },
          {
            spriteIdentifier: RSX.fxImpactBlueBig.name,
            offset: { x: -5, y: -30 },
            rotation: 90,
          },
        ],
      },
      ChanneledBreath: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxYellowTeleporterBeam.name,
            offset: { x: 0, y: 25 },
          },
          {
            spriteIdentifier: RSX.fxTeleportRecall.name,
            offset: { x: 0, y: -10 },
          },
        ],
      },
      Lifestream: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxYellowTeleporterBeam.name,
            offset: { x: 0, y: 25 },
          },
          {
            spriteIdentifier: RSX.fxTeleportRecall.name,
            offset: { x: 0, y: -10 },
          },
        ],
      },
      FortifiedAssault: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxHolyTileSpawn.name,
            offset: { x: 0, y: 0 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              duration: 1.25,
              color: { r: 125, g: 215, b: 255 },
            },
          },
          {
            spriteIdentifier: RSX.fxSwirlRingsBlue.name,
            offset: { x: 0, y: 15 },
          },
          {
            spriteIdentifier: RSX.fx_f1_truestrike.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      Congregation: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f1_aurynnexus.name,
            offset: { x: 0, y: 0 },
            reverse: true,
            emitFX: {
              type: 'Light',
              radius: 9000,
              intensity: 9,
              color: { r: 255, g: 230, b: 50 },
            },
          },
          {
            spriteIdentifier: RSX.fx_f1_warsurge.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      ValeAscension: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxHolyTileSpawn.name,
            offset: { x: 0, y: 0 },
            reverse: true,
            emitFX: {
              type: 'Light',
              radius: 9000,
              intensity: 9,
              color: { r: 255, g: 230, b: 50 },
            },
          },
          {
            spriteIdentifier: RSX.fxYellowTeleporterBeam.name,
            offset: { x: 0, y: 50 },
          },
        ],
      },
      AmaranthineVow: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f1_lasting_judgment.name,
            offset: { x: 0, y: 105 },
            reverse: true,
            emitFX: { type: 'Light', intensity: 9 },
          },
          {
            spriteIdentifier: RSX.fxHolyTileSpawn.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
        ],
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxHolyTileSpawn.name,
            offset: { x: 0, y: 0 },
            reverse: true,
            emitFX: {
              type: 'Light',
              radius: 9000,
              intensity: 9,
              color: { r: 255, g: 230, b: 50 },
            },
          },
          {
            spriteIdentifier: RSX.fxYellowTeleporterBeam.name,
            offset: { x: 0, y: 50 },
          },
        ],
      },
      AperionsClaim: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f1_sunbloom.name,
            offset: { x: 0, y: 0 },
            emitFX: { type: 'Light', intensity: 9 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fx_f1_aperionssurge.name,
            offset: { x: 0, y: 25 },
          },
        ],
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f1_decimate.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      Gotatsu: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_fireslash.name,
            offset: { x: -15, y: 0 },
            rotation: -90,
            emitFX: {
              type: 'Light',
              radius: 9000,
              intensity: 9,
              color: { r: 255, g: 0, b: 60 },
            },
          },
        ],
      },
      SpiralCounter: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f2_spiraltechnique02.name,
            offset: { x: 5, y: 70 },
            emitFX: {
              type: 'Light',
              color: { r: 255, g: 0, b: 60 },
              radius: 2000,
              intensity: 5,
            },
          },
        ],
      },
      TwilightReiki: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f2_twilightreiki.name,
            offset: { x: 0, y: 20 },
            emitFX: { type: 'Light', intensity: 9 },
          },
        ],
      },
      Bombard: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxTeleportOrangeOrb.name,
            offset: { x: 0, y: 0 },
            flippedY: true,
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fx_f2_innerfocus.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      FirestormMantra: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_flamesphere.name,
            offset: { x: 0, y: 15 },
            emitFX: {
              type: 'Light',
              intensity: 9,
              radius: 9000,
              color: { r: 255, g: 0, b: true },
            },
            color: { r: 255, g: 100, b: 60 },
          },
          {
            spriteIdentifier: RSX.fx_f2_spiraltechnique02.name,
            offset: { x: 0, y: 50 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fx_ringswirl.name,
            offset: { x: 0, y: 15 },
            color: { r: 255, g: 200, b: 50 },
          },
        ],
      },
      AzureSummoning: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxTeleportBlueOrb.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fx_f3_fountainofyouth.name,
            offset: { x: 0, y: 0 },
            emitFX: {
              type: 'Light',
              radius: 9000,
              intensity: 9,
              color: { r: 125, g: 215, b: 255 },
            },
          },
        ],
      },
      AridUnmaking: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f5_earthsphere_orange.name,
            offset: { x: 0, y: -25 },
            reverse: true,
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 150, b: 0 },
            },
          },
        ],
      },
      DropLift: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxTeleportRecallBlue.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fxArtifactHit.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fxArtifactHit.name,
            offset: { x: 0, y: 0 },
          },
        ],
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxElectricalGroundUpYellow.name,
            offset: { x: -25, y: 45 },
            rotation: -30,
          },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpYellow.name,
            offset: { x: 30, y: -45 },
            rotation: 150,
          },
          {
            spriteIdentifier: RSX.fxArtifactBreak.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      Metalmeld: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxElectricalGroundUpYellow.name,
            offset: { x: -25, y: 45 },
            rotation: -30,
          },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpYellow.name,
            offset: { x: 30, y: -45 },
            rotation: 150,
          },
          {
            spriteIdentifier: RSX.fxArtifactBreak.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      PlanarFoundry: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxTeleportRecallBlue.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fxArtifactHit.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fxArtifactHit.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      Reassemble: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxYellowTeleporterBeam.name,
            offset: { x: 0, y: 30 },
          },
          {
            spriteIdentifier: RSX.fxTeleportRecallWhite.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxExplosionGroundSmokeSwirl.name,
            offset: { x: 0, y: -55 },
            rotation: 15,
          },
        ],
      },
      SuperiorMirage: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f3_entropicdecay.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fx_f3_blindscorch.name,
            offset: { x: 0, y: 20 },
            emitFX: {
              type: 'Light',
              radius: 9000,
              intensity: 9,
              color: { r: 125, g: 225, b: 255 },
            },
          },
        ],
      },
      CataclysmicFault: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f3_cataclysmicfault.name,
            offset: { x: 0, y: 20 },
            emitFX: { type: 'Light', intensity: 9 },
          },
        ],
      },
      ChokingTendrils: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f4_shadownova.name,
            offset: { x: 0, y: 0 },
            reverse: true,
            emitFX: {
              type: 'Light',
              intensity: 9,
              radius: 2000,
              color: { r: 255, g: 0, b: 255 },
            },
          },
        ],
      },
      YieldingDepths: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f4_shadownova.name,
            offset: { x: 0, y: 0 },
            reverse: true,
            emitFX: {
              type: 'Light',
              intensity: 9,
              radius: 2000,
              color: { r: 255, g: 0, b: 255 },
            },
          },
        ],
      },
      ShadowStalk: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f4_wraithlingfury.name,
            offset: { x: 0, y: 0 },
            reverse: true,
            emitFX: { type: 'Light', intensity: 9 },
          },
        ],
      },
      CorporealCadence: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_crossslash_x.name,
            offset: { x: 0, y: 0 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 0, b: 255 },
            },
            color: { r: 255, g: 125, b: 255 },
          },
          {
            spriteIdentifier: RSX.fx_tornadoswirl.name,
            offset: { x: 0, y: 0 },
            color: { r: 200, g: 0, b: 100 },
            flippedY: true,
          },
          {
            spriteIdentifier: RSX.fx_f4_shadowreflection.name,
            offset: { x: 0, y: 25 },
            reverse: true,
          },
        ],
      },
      Doom: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f4_doom.name,
            offset: { x: 0, y: 20 },
            emitFX: { type: 'Light', intensity: 9 },
            reverse: true,
          },
        ],
      },
      PrimalBallast: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxYellowTeleporterBeam.name,
            offset: { x: 0, y: 25 },
            color: { r: 150, g: 255, b: 200 },
          },
          {
            spriteIdentifier: RSX.fx_f5_flashreincarnation.name,
            offset: { x: 0, y: 50 },
            emitFX: {
              type: 'Light',
              intensity: 9,
              radius: 2000,
              color: { r: 0, g: 255, b: 125 },
            },
          },
        ],
      },
      VaathsBrutality: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxSearingChasm.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fx_f5_manaburn.name,
            offset: { x: 0, y: 0 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 125, b: 50 },
            },
          },
        ],
      },
      BloodRage: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f5_flashreincarnation.name,
            offset: { x: 0, y: 70 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fx_f5_naturalselection.name,
            offset: { x: 0, y: 70 },
            reverse: true,
            color: { r: 255, g: 75, b: 25 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 125, b: 50 },
            },
          },
        ],
      },
      VerdentFulmination: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f5_amplification.name,
            offset: { x: 0, y: 120 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 0, g: 225, b: 125 },
            },
          },
          {
            spriteIdentifier: RSX.fxPrimalTileSpawn.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
        ],
      },
      EvolutionaryApex: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f5_evolutionaryapex.name,
            offset: { x: 0, y: 20 },
            emitFX: { type: 'Light', intensity: 9 },
          },
        ],
      },
      GlacialFissure: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f6_cryogenesis.name,
            offset: { x: 0, y: 150 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 60, g: 255, b: 255 },
            },
          },
        ],
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxFrozenIceBlock.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      BlindingSnowstorm: {
        SpellCastFX: [
          {
            offset: { x: 0, y: 0 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 60, g: 255, b: 255 },
              duration: 1,
            },
          },
        ],
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxBlueWaterSplash.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fx_flashfreeze_appear.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      Permafrost: {
        SpellCastFX: [
          {
            offset: { x: 0, y: 0 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 60, g: 255, b: 255 },
              duration: 1,
            },
          },
        ],
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxBlueWaterSplash.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fx_flashfreeze_appear.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      VespyrianMight: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxBlueWaterSplash.name,
            offset: { x: 0, y: 35 },
          },
          {
            spriteIdentifier: RSX.fx_f5_earthsphere_blue.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxBlueWaterSplash.name,
            offset: { x: 0, y: -15 },
            flippedX: true,
          },
        ],
      },
      SnowPatrol: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxFrozenIceBlock.name,
            offset: { x: 0, y: -25 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fx_f6_mesmerize.name,
            offset: { x: 0, y: 0 },
            emitFX: { type: 'Light', intensity: 9 },
          },
        ],
      },
      FlawlessReflection: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f6_perfectreflection.name,
            offset: { x: 0, y: 20 },
            emitFX: { type: 'Light', intensity: 9 },
          },
        ],
      },
      SteadfastFormation: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f1_aurynnexus.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
        ],
      },
      DauntlessAdvance: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxTeleportYellowOrb.name,
            emitFX: {
              type: 'Light',
              offset: { x: 0, y: -50 },
              color: { r: 255, g: 160, b: 60 },
              radius: 2000,
              intensity: 9,
            },
          },
        ],
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.FloatingShield.name,
            offset: { x: 10, y: -10 },
          },
          {
            spriteIdentifier: RSX.FloatingShield.name,
            offset: { x: -10, y: -10 },
            flippedX: true,
          },
        ],
      },
      MarchingOrders: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.FloatingShield.name,
            offset: { x: 10, y: -10 },
          },
          {
            spriteIdentifier: RSX.FloatingShield.name,
            offset: { x: -10, y: -10 },
            flippedX: true,
          },
          {
            spriteIdentifier: RSX.ForceField.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      Fealty: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f1_lionheartblessing.name,
            offset: { x: 0, y: 50 },
          },
        ],
      },
      SunStrike: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxHeavensStrike.name,
            offset: { x: 240, y: -30 },
            rotation: 90,
          },
          {
            spriteIdentifier: RSX.fxHeavensStrike.name,
            offset: { x: -240, y: -30 },
            flippedX: true,
            rotation: -90,
          },
          {
            spriteIdentifier: RSX.fx_f1_decimate.name,
            offset: { x: 0, y: -25 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 160, b: 60 },
            },
          },
        ],
      },
      Invincible: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxTeleportYellowOrb.name,
            offset: { x: 0, y: 0 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 160, b: 60 },
            },
          },
          {
            spriteIdentifier: RSX.fx_f1_warsurge.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      Assassination: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f2_innerfocus.name,
            offset: { x: 0, y: 50 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fx_f2_manavortex.name,
            offset: { x: 5, y: 50 },
          },
        ],
      },
      MassFlight: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f2_phoenixfire.name,
            offset: { x: 0, y: 25 },
            reverse: true,
            emitFX: { type: 'Light', intensity: 9, radius: 100 },
          },
        ],
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxBuffSimpleGold.name,
            offset: { x: 0, y: -10 },
          },
        ],
      },
      Thunderbomb: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_flamesphere.name,
            offset: { x: 0, y: 20 },
            emitFX: {
              type: 'Light',
              color: { r: 255, g: 0, b: 60 },
              intensity: 9,
              radius: 2000,
            },
            rotation: 0,
            color: { r: 255, g: 100, b: 50 },
          },
          {
            spriteIdentifier: RSX.fx_electricsphere.name,
            offset: { x: 0, y: -15 },
            color: { r: 255, g: 220, b: 100 },
            rotation: 90,
          },
          {
            spriteIdentifier: RSX.fx_f2_backstab.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      Bamboozle: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxTeleportRecallRed.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fx_f2_onyxbearseal.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
        ],
      },
      BurdenOfKnowledge: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxTeleportRecallBlue.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxImpactMediumBlue.name,
            offset: { x: 0, y: 20 },
            rotation: 90,
          },
        ],
      },
      KinematicProjection: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f3_starsfury.name,
            offset: { x: 0, y: 350 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 150, b: 0 },
              offset: { x: 0, y: -250 },
            },
          },
          {
            spriteIdentifier: RSX.fxTeleportRecallWhite.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      EqualityConstraint: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_multislash_outro.name,
            offset: { x: 30, y: -30 },
            flippedX: true,
            flippedY: true,
            color: { r: 255, g: 125, b: 50 },
          },
          {
            spriteIdentifier: RSX.fx_multislash_outro.name,
            offset: { x: -30, y: 30 },
            color: { r: 50, g: 125, b: 255 },
          },
          {
            spriteIdentifier: RSX.fxImpactBlueBig.name,
            offset: { x: 35, y: -35 },
            rotation: -90,
          },
          {
            spriteIdentifier: RSX.fxImpactBigOrange.name,
            offset: { x: -35, y: 15 },
            rotation: 90,
          },
        ],
      },
      Neurolink: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxTeleportYellowOrb.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fx_f3_fountainofyouth.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      LostInTheDesert: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_ringswirl.name,
            offset: { x: 0, y: 0 },
            color: { r: 255, g: 200, b: 50 },
            flippedY: true,
          },
          {
            spriteIdentifier: RSX.fxSandTileSpawn.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      CallToArms: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f1_sunbloom.name,
            offset: { x: 0, y: 50 },
            emitFX: { type: 'Light', intensity: 9 },
          },
          {
            spriteIdentifier: RSX.fxTeleportBlueOrb.name,
            offset: { x: 0, y: 0 },
            reverse: false,
          },
          {
            spriteIdentifier: RSX.fx_f1_warsurge.name,
            offset: { x: 0, y: 0 },
            reverse: false,
          },
        ],
      },
      SeekerSquad: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f2_ancestralpact.name,
            offset: { x: 0, y: 75 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fx_f2_teleportsmoke.name,
            offset: { x: -30, y: 15 },
          },
          {
            spriteIdentifier: RSX.fx_f2_teleportsmoke.name,
            offset: { x: 30, y: 15 },
            flippedX: true,
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -75 },
          },
        ],
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_beamfire.name,
            offset: { x: 0, y: 275 },
            color: { r: 255, g: 100, b: 100 },
          },
        ],
      },
      MonolithicVision: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f3_dominatewill.name,
            offset: { x: 0, y: 0 },
            emitFX: { type: 'Light', intensity: 9 },
          },
        ],
      },
      Deathmark: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_crossslash_x.name,
            offset: { x: 0, y: 0 },
            color: { r: 120, g: 60, b: 255 },
            emitFX: {
              type: 'Light',
              intensity: 9,
              radius: 2000,
              color: { r: 200, g: 0, b: 100 },
            },
          },
          {
            spriteIdentifier: RSX.fx_f2_backstab.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      Infest: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxTeleportPurpleOrb.name,
            offset: { x: 0, y: 0 },
            emitFX: { type: 'Light', intensity: 9 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fx_f4_nethersummoning.name,
            offset: { x: 0, y: 75 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fx_f4_darkfiretransformation.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
        ],
      },
      HorrificVisage: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_multislash_full.name,
            offset: { x: 0, y: 0 },
            color: { r: 120, g: 60, b: 255 },
          },
          {
            spriteIdentifier: RSX.fx_f4_darkfiresacrifice.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
        ],
      },
      AbhorrentUnbirth: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxTeleportOrangeOrb.name,
            offset: { x: 0, y: 0 },
            emitFX: { type: 'Light', intensity: 9 },
          },
          {
            spriteIdentifier: RSX.fx_beamfire.name,
            offset: { x: 0, y: 250 },
            color: { r: 200, g: 0, b: 100 },
          },
          {
            spriteIdentifier: RSX.fx_f4_deathfire_crescendo.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
        ],
      },
      Vellumscry: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f2_eightgates_purpleflame.name,
            offset: { x: 0, y: 75 },
            reverse: false,
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -65 },
          },
        ],
      },
      Betrayal: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f4_nethersummoning.name,
            offset: { x: 0, y: 25 },
            emitFX: {
              type: 'Light',
              intensity: 9,
              radius: 2000,
              color: { r: 255, g: 0, b: 255 },
            },
          },
          {
            spriteIdentifier: RSX.fx_f4_darkseed.name,
            offset: { x: 0, y: 75 },
          },
        ],
      },
      EmbryoticInsight: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.f1CasterProjectile.name,
            offset: { x: 0, y: 150 },
            rotation: -90,
          },
          {
            spriteIdentifier: RSX.fx_f5_earthsphere.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
        ],
      },
      MitoticInduction: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.f1CasterProjectile.name,
            offset: { x: 0, y: 150 },
            rotation: -90,
          },
          {
            spriteIdentifier: RSX.fx_f5_earthsphere.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
        ],
      },
      UpperHand: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            offset: { x: 0, y: 50 },
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -50 },
          },
          {
            spriteIdentifier: RSX.fxTendrilsGreen.name,
            offset: { x: 0, y: 0 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 0, g: 255, b: 125 },
            },
          },
        ],
      },
      HomeostaticRebuke: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_beamfire.name,
            offset: { x: 0, y: 250 },
            color: { r: 255, g: 125, b: 0 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 125, b: 0 },
            },
          },
          {
            spriteIdentifier: RSX.fx_f5_kinectequilibrium.name,
            offset: { x: 5, y: 350 },
          },
        ],
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxFaerieFireDeepRed.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxImpactBigOrange.name,
            offset: { x: 0, y: 0 },
            rotation: 90,
          },
        ],
      },
      EffulgentInfusion: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxFireTornado.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            offset: { x: 0, y: -25 },
          },
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            offset: { x: 0, y: 50 },
          },
        ],
      },
      Pupabomb: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxTeleportOrangeOrb.name,
            offset: { x: 0, y: 0 },
            reverse: true,
            color: { r: 75, g: 225, b: 75 },
            flippedY: true,
          },
          {
            spriteIdentifier: RSX.fx_f5_earthsphere_orange.name,
            offset: { x: 0, y: -40 },
            reverse: true,
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 255, g: 125, b: 0 },
            },
          },
          {
            offset: { x: 0, y: 0 },
            type: 'Vortex',
            radius: 150,
            duration: 2,
            color: { r: 75, g: 255, b: 75 },
          },
        ],
      },
      SaurianFinality: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fxTeleportOrangeOrb.name,
            offset: { x: 0, y: 0 },
            emitFX: { type: 'Light', intensity: 9 },
            flippedY: true,
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fx_f5_amplification.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fx_f5_earthsphere.name,
            offset: { x: 0, y: -35 },
            reverse: true,
          },
          {
            offset: { x: 0, y: 0 },
            type: 'Vortex',
            radius: 150,
            opacity: 75,
            color: { r: 255, g: 125, b: 0 },
            duration: 2,
          },
        ],
      },
      EssenceSculpt: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f6_hailstoneprison.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fxTeleportBlueOrb.name,
            offset: { x: 0, y: -25 },
            flippedY: true,
          },
        ],
      },
      CryonicPotential: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f6_hailstoneprison.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fxTeleportBlueOrb.name,
            offset: { x: 0, y: -25 },
            flippedY: true,
          },
        ],
      },
      Shatter: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f5_earthsphere_blue.name,
            offset: { x: 0, y: -50 },
            reverse: true,
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 60, g: 255, b: 255 },
            },
          },
          {
            spriteIdentifier: RSX.fxFrozenIceBlock.name,
            offset: { x: 0, y: -25 },
            reverse: true,
          },
        ],
      },
      CrystalReinforce: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f6_chromaticcold.name,
            offset: { x: 0, y: 0 },
            reverse: true,
          },
          {
            spriteIdentifier: RSX.fxTeleportBlueOrb.name,
            offset: { x: 0, y: -40 },
            reverse: true,
            flippedY: true,
          },
        ],
      },
      Auroraboros: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f6_cryogenesis.name,
            offset: { x: 0, y: 125 },
            emitFX: {
              type: 'Light',
              radius: 2000,
              intensity: 9,
              color: { r: 60, g: 255, b: 255 },
            },
          },
        ],
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_beamtesla.name,
            offset: { x: 0, y: 250 },
            color: { r: 60, g: 200, b: 255 },
          },
        ],
      },
      Murasame: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f1_truestrike.name,
            offset: { x: 0, y: 0 },
            reverse: true,
            color: { r: 255, g: 175, b: 175 },
          },
          {
            spriteIdentifier: RSX.fxBladestorm.name,
            offset: { x: 0, y: 25 },
          },
          {
            spriteIdentifier: RSX.fxBladestorm.name,
            offset: { x: 0, y: -25 },
            flippedX: true,
          },
        ],
      },
      Kotetsu: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f1_truestrike.name,
            offset: { x: 0, y: 0 },
            color: { r: 150, g: 25, b: 25 },
          },
          {
            spriteIdentifier: RSX.fx_f2_backstab.name,
            offset: { x: 0, y: 0 },
            flippedX: true,
          },
        ],
      },
      Tanahashi: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f1_truestrike.name,
            offset: { x: 0, y: 0 },
            flippedX: true,
            reverse: true,
            color: { r: 200, g: 175, b: 175 },
          },
        ],
      },
      Kiyomori: {
        SpellAppliedFX: [
          {
            spriteIdentifier: RSX.fx_f1_truestrike.name,
            offset: { x: 0, y: 0 },
            flippedX: true,
          },
        ],
      },
      MechProgress: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_beamlaser.name,
            offset: { x: 0, y: 250 },
            color: { r: 255, g: 100, b: 100 },
          },
          {
            spriteIdentifier: RSX.fxBuffSimpleGold.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxEnergyHaloGround.name,
            offset: { x: 0, y: -65 },
          },
        ],
      },
      BoulderHurl: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxImpactRedBig.name,
            offset: { x: 0, y: -25 },
            rotation: 90,
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -65 },
          },
        ],
      },
      AncientKnowledge: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_crossslash_x.name,
            offset: { x: 0, y: 0 },
            color: { r: 0, g: 255, b: 230 },
          },
          {
            spriteIdentifier: RSX.fx_neutral_riddle.name,
            offset: { x: 0, y: 0 },
            reverse: true,
            flippedX: true,
            flippedY: true,
            color: { r: 140, g: 115, b: 90 },
          },
        ],
      },
      RestoringLight: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f1_sunbloom.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fx_beamlaser.name,
            offset: { x: 0, y: 250 },
            color: { r: 125, g: 215, b: 255 },
          },
        ],
      },
      EntanglingShadow: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_flamesphere.name,
            offset: { x: 0, y: 0 },
            color: { r: 200, g: 125, b: 255 },
          },
          {
            spriteIdentifier: RSX.fx_f4_shadownova.name,
            offset: { x: -5, y: 0 },
          },
        ],
      },
      EtherealWind: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_tornadoswirl.name,
            offset: { x: 0, y: 0 },
            color: { r: 200, g: 200, b: 222 },
          },
          {
            spriteIdentifier: RSX.fx_ringswirl.name,
            offset: { x: 0, y: 0 },
            color: { r: 165, g: 150, b: 215 },
          },
        ],
      },
      LaceratingFrost: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fxFrozenIceBlock.name,
            offset: { x: -47, y: -20 },
            rotation: -90,
          },
          {
            spriteIdentifier: RSX.fxFrozenIceBlock.name,
            offset: { x: 47, y: -20 },
            rotation: 90,
          },
          {
            spriteIdentifier: RSX.fx_multislash_full.name,
            offset: { x: 10, y: 0 },
            rotation: 90,
            color: { r: 165, g: 200, b: 255 },
          },
        ],
      },
      LivingFlame: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_beamfire.name,
            offset: { x: 0, y: 250 },
            color: { r: 255, g: 100, b: 0 },
          },
          {
            spriteIdentifier: RSX.fxFireTornado.name,
            offset: { x: 0, y: -15 },
          },
        ],
      },
      MoldingEarth: {
        SpellCastFX: [
          {
            spriteIdentifier: RSX.fx_f5_tremor.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fx_bouldersphere.name,
            offset: { x: 0, y: 100 },
            color: { r: 150, g: 100, b: 0 },
          },
        ],
      },
    },
    Faction1: {
      General: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxImpactBigOrange.name },
          {
            spriteIdentifier: RSX.fxCollisionSparksBlue.name,
            offset: { x: -10, y: 10 },
          },
        ],
      },
      ZiranSunforge: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxImpactRingVerticalOrange.name },
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name },
          {
            spriteIdentifier: RSX.fxImpactRingVerticalWhite.name,
            offset: { x: 30, y: 0 },
          },
        ],
      },
      SilverguardSquire: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name },
          {
            spriteIdentifier: RSX.fxCollisionSparksOrange.name,
            offset: { x: 10, y: -20 },
            flippedX: true,
          },
          {
            spriteIdentifier: RSX.fxImpactMediumOrange.name,
            flippedX: true,
            offset: { x: 0, y: -10 },
          },
        ],
      },
      WindbladeAdept: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxImpactWhiteMedium.name },
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name },
        ],
      },
      SuntideMaiden: {
        UnitAttackedFX: [
          { spriteIdentifier: [RSX.fxElectricalGroundUpYellow.name] },
          {
            spriteIdentifier: RSX.fxTeleportYellowOrb.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpYellow.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      SilverguardKnight: {
        UnitAttackedFX: [
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name] },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
          {
            spriteIdentifier: RSX.fxCollisionSparksBlue.name,
            offset: { x: -10, y: 30 },
          },
        ],
      },
      ArclyteSentinel: {
        UnitAttackedFX: [
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name] },
          { spriteIdentifier: RSX.fxPlasmaBlueVertical.name },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      WindbladeCommander: {
        UnitAttackedFX: [
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name] },
          { spriteIdentifier: RSX.fxPlasmaBlueVertical.name },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
          {
            spriteIdentifier: RSX.fxCollisionSparksBlue.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxCollisionSparksBlue.name,
            offset: { x: -10, y: 30 },
          },
        ],
      },
      LysianBrawler: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxSearingChasm.name },
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name },
          { type: 'Shockwave', radius: 135, duration: 0.75 },
        ],
      },
      Lightchaser: {
        UnitAttackedFX: [
          {
            type: 'Vortex', radius: 90, duration: 1.1, atSource: true, impactAtStart: false,
          },
          {
            spriteIdentifier: RSX.fxTeleportOrangeOrb.name,
            offset: { x: 0, y: 15 },
          },
          {
            spriteIdentifier: RSX.f1CasterProjectile.name, type: 'EnergyBeam', moveDuration: 1, looping: true,
          },
        ],
      },
      SunstoneTemplar: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxElectricalGroundUpYellow.name },
          {
            spriteIdentifier: RSX.fxCollisionSparksOrange.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      IroncliffeGuardian: {
        UnitAttackedFX: [
          {
            spriteIdentifier: [
              RSX.fxExplosionMediumWhiteHot.name,
            ],
            flippedX: true,
            offset: { x: 0, y: -20 },
          },
          {
            type: 'Shockwave',
            offset: { x: 0, y: -45 },
            radius: 135,
            duration: 0.5,
          },
          { spriteIdentifier: RSX.fxElectricalGroundUpYellow.name },
          {
            spriteIdentifier: RSX.fxImpactRingVerticalOrange.name,
            offset: { x: -15, y: 20 },
          },
          {
            spriteIdentifier: RSX.fxImpactRingVerticalOrange.name,
            offset: { x: 0, y: -15 },
            flippedX: true,
          },
        ],
      },
      ElyxStormblade: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxPlasmaBlueVertical.name },
          {
            spriteIdentifier: RSX.fxCollisionSparksBlue.name,
            offset: { x: -10, y: 30 },
          },
          {
            spriteIdentifier: RSX.fxCollisionSparksBlue.name,
            offset: { x: 10, y: 20 },
            flippedX: true,
          },
        ],
      },
      XyleStormblade: {
        UnitAttackedFX: [
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name] },
          { spriteIdentifier: RSX.fxPlasmaBlueVertical.name },
          {
            spriteIdentifier: RSX.fxCollisionSparksBlue.name,
            offset: { x: -10, y: 10 },
          },
          {
            spriteIdentifier: RSX.fxCollisionSparksBlue.name,
            offset: { x: 10, y: -10 },
            flippedX: true,
          },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      RadiantDragoon: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxElectricalGroundUpBlue.name, flippedX: true },
        ],
      },
      SunforgeLancer: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxCollisionSparksOrange.name,
            offset: { x: -10, y: 30 },
          },
          {
            spriteIdentifier: RSX.fxCollisionSparksOrange.name,
            offset: { x: 10, y: 20 },
            flippedX: true,
          },
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
        ],
      },
      Solarius: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksRed.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxExplosionBigBall_MetalSlug.name,
            flippedX: true,
            offset: { x: 0, y: -20 },
          },
          { type: 'Shockwave', radius: 135, duration: 0.75 },
        ],
      },
      GrandmasterZir: {
        UnitAttackedFX: [
          { spriteIdentifier: [RSX.fxImpactBigOrange.name, RSX.fxImpactBigOrange.name], flippedX: true },
          {
            spriteIdentifier: RSX.fxCollisionSparksBlue.name,
            offset: { x: -10, y: 10 },
          },
          {
            spriteIdentifier: RSX.fxCollisionSparksBlue.name,
            offset: { x: 10, y: -20 },
            flippedX: true,
          },
        ],
      },
      AzuriteLion: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
        ],
      },
      CaliberO: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxElectricalGroundUpYellow.name, intensity: 3 },
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            offset: { x: -20, y: 0 },
          },
          { spriteIdentifier: RSX.fxElectricalGroundUpYellow.name },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -45 },
          },
        ],
      },
      Sunriser: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxCollisionSparksBlue.name,
            offset: { x: -10, y: 30 },
          },
        ],
      },
    },
    Faction2: {
      General: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxCollisionSparksRed.name,
            offset: { x: 10, y: 20 },
            flippedX: true,
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxImpactRingVerticalWhite.name,
            offset: { x: 30, y: 0 },
          },
        ],
      },
      RevaEventide: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
          {
            spriteIdentifier: RSX.fxImpactRingVerticalWhite.name,
            offset: { x: 30, y: 0 },
          },
        ],
      },
      Heartseeker: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.f2CasterProjectile.name,
            type: 'Projectile',
            emitFX: [
              {
                type: 'Particles',
                plistFile: RSX.ptcl_projectile_trail.plist,
                color: { r: 255, g: 100, b: 0 },
                friction: 0.95,
              },
            ],
            impactFX: [
              { spriteIdentifier: RSX.fxImpactRingVerticalOrange.name },
              { spriteIdentifier: RSX.fxCollisionSparksOrange.name },
            ],
            looping: true,
          },
        ],
      },
      Widowmaker: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.f2RangedProjectile.name,
            type: 'Projectile',
            emitFX: [],
            impactFX: [
              { spriteIdentifier: RSX.fxExplosionMediumIcyWhite.name },
              { spriteIdentifier: RSX.fxCollisionSparksRed.name, flippedX: true },
              {
                spriteIdentifier: RSX.fxCollisionSparksRed.name,
                offset: { x: 10, y: 20 },
                flippedX: true,
              },
            ],
            looping: true,
          },
        ],
      },
      KaidoAssassin: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxImpactWhiteMedium.name },
          { spriteIdentifier: RSX.fxCollisionSparksRed.name },
        ],
      },
      KiBeholder: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxExplosionBigBall_MetalSlug.name,
            flippedX: true,
            offset: { x: 0, y: -20 },
          },
          { type: 'Shockwave', radius: 135, duration: 0.75 },
        ],
      },
      ScarletViper: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxCollisionSparksRed.name,
            offset: { x: 10, y: 20 },
            flippedX: true,
          },
          { spriteIdentifier: RSX.fxClawSlash.name, flippedX: true },
        ],
      },
      GoreHorn: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxCollisionSparksRed.name,
            offset: { x: -10, y: -10 },
          },
          {
            spriteIdentifier: RSX.BloodExplosionBig.name,
            flippedX: true,
            offset: { x: -20, y: -10 },
          },
          {
            spriteIdentifier: RSX.BloodExplosionMedium.name,
            offset: { x: 20, y: -10 },
          },
        ],
      },
      TuskBoar: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxDevour.name,
            type: 'Projectile',
            scale: 3,
            impactFX: [
              { spriteIdentifier: RSX.BloodExplosionBig.name, flippedX: true },
              {
                spriteIdentifier: RSX.fxImpactRingVerticalWhite.name,
                offset: { x: 30, y: 0 },
              },
            ],
            looping: true,
          },
        ],
      },
      LanternFox: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksRed.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxCollisionSparksRed.name,
            offset: { x: -10, y: 30 },
          },
          {
            spriteIdentifier: RSX.fxCollisionSparksOrange.name,
            offset: { x: 10, y: 20 },
            flippedX: true,
          },
          { spriteIdentifier: RSX.fxFaerieFireRed.name },
        ],
      },
      ChakriAvatar: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.neutralMechaz0rSuperProjectile.name,
            type: 'Projectile',
            emitFX: [
              {
                type: 'Particles',
                plistFile: RSX.ptcl_projectile_trail.plist,
                color: { r: 255, g: 150, b: 200 },
                friction: 0.95,
              },
            ],
            impactFX: [
              { spriteIdentifier: RSX.fxImpactBigOrange.name },
            ],
            looping: true,
          },
        ],
      },
      MageOfFourWinds: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxPlasmaRedVertical.name,
            flippedX: false,
            offset: { x: 0, y: -10 },
          },
        ],
      },
      CelestialPhantom: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
          { spriteIdentifier: RSX.fxFaerieFireRed.name },
        ],
      },
      LightningSister: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxExplosionBigBall_MetalSlug.name,
            flippedX: true,
            offset: { x: 0, y: -20 },
          },
          { type: 'Shockwave', radius: 135, duration: 0.75 },
        ],
      },
      JadeOgre: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxCollisionSparksRed.name,
            offset: { x: 0, y: 0 },
          },
          { spriteIdentifier: RSX.fxPlasmaRedVertical.name, flippedX: true },
        ],
      },
      StormKage: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxElectricalGroundUpRed.name,
            offset: { x: 0, y: -20 },
          },
          { spriteIdentifier: RSX.fxPlasmaRedVertical.name, flippedX: true },
        ],
      },
      HamonBlademaster: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxImpactWhiteMedium.name },
          {
            plistFile: RSX.ptcl_circleswirls.plist,
            type: 'Particles',
            offset: { x: 0, y: 0 },
            zOrder: 1,
          },
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name },
        ],
      },
      KeshraiFanblade: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksRed.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
        ],
      },
      FlareSlinger: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.f2FlareSlingerProjectile.name,
            type: 'Projectile',
            emitFX: [
              {
                type: 'Particles',
                plistFile: RSX.ptcl_projectile_trail.plist,
                color: { r: 255, g: 150, b: 100 },
                friction: 0.95,
              },
            ],
            impactFX: [
              { spriteIdentifier: RSX.fxImpactBigOrange.name },
              { spriteIdentifier: RSX.fxCollisionSparksOrange.name },
            ],
            looping: true,
          },
        ],
      },
    },
    Faction3: {
      General: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name },
          {
            spriteIdentifier: RSX.fxImpactRingVerticalWhite.name,
            offset: { x: 30, y: 0 },
          },
        ],
      },
      ScionessSajj: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxPlasmaBlueVertical.name,
            flippedX: true,
            offset: { x: 0, y: -10 },
          },
          { spriteIdentifier: RSX.fxElectricalGroundUpBlue.name, flippedX: true },
        ],
      },
      Blast: {
        UnitPrimaryAttackedFX: [
          {
            spriteIdentifier: RSX.fx_f3_blast.name,
            type: 'EnergyBeam',
            moveDuration: 1,
            offset: { x: 0, y: -20 },
            looping: true,
          },
        ],
      },
      BlastStrong: {
        UnitPrimaryAttackedFX: [
          {
            spriteIdentifier: RSX.fx_f3_blaststarfire.name,
            type: 'EnergyBeam',
            moveDuration: 1,
            offset: { x: 0, y: -20 },
            sourceOffset: { x: -60, y: 0 },
            looping: true,
          },
        ],
      },
      SandSister: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksRed.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxExplosionBigBall_MetalSlug.name,
            flippedX: true,
            offset: { x: 0, y: -20 },
          },
          { type: 'Shockwave', radius: 135, duration: 0.75 },
        ],
      },
      WindShrike: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          { spriteIdentifier: RSX.fxImpactRingVerticalWhite.name },
          { spriteIdentifier: RSX.fxPlasmaBlueVertical.name },
        ],
      },
      StarfireScarab: {},
      Pyromancer: {},
      SandHowler: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
          { spriteIdentifier: [RSX.fxImpactBigOrange.name] },
        ],
      },
      PortalGuardian: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          { spriteIdentifier: RSX.fxImpactRingVerticalWhite.name },
        ],
      },
      Oserix: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          { spriteIdentifier: RSX.fxImpactRingVerticalWhite.name },
          { spriteIdentifier: RSX.fxPlasmaBlueVertical.name },
        ],
      },
      OrbWeaver: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          { spriteIdentifier: RSX.fxImpactRingVerticalWhite.name },
        ],
      },
      NightfallMechanyst: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          { spriteIdentifier: RSX.fxImpactRingVerticalWhite.name },
          { spriteIdentifier: RSX.fxPlasmaBlueVertical.name },
        ],
      },
      BrazierRedSand: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxImpactWhiteMedium.name },
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name },
        ],
      },
      BrazierGoldenFlame: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxImpactBigOrange.name },
          { spriteIdentifier: RSX.fxEnergyHaloGround.name },
        ],
      },
      Dervish: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
          { spriteIdentifier: RSX.fxImpactRingVerticalWhite.name },
        ],
      },
      Dunecaster: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          { spriteIdentifier: RSX.fxImpactRingVerticalWhite.name },
        ],
      },
      Pantheran: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      Allomancer: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxElectricalGroundUpBlue.name,
            offset: { x: -30, y: 30 },
          },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpBlue.name,
            offset: { x: 30, y: 20 },
          },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      Nimbus: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpBlue.name,
            offset: { x: -30, y: 30 },
          },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpBlue.name,
            offset: { x: 30, y: 20 },
          },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      MirrorMaster: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          { spriteIdentifier: RSX.fxPlasmaBlueVertical.name },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      AymaraHealer: {
        UnitAttackedFX: [
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name, RSX.fxImpactOrangeSmall.name] },
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          { spriteIdentifier: RSX.fxImpactRingVerticalWhite.name, flippedX: true },
        ],
      },
    },
    Faction4: {
      General: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksPurple.name, flippedX: true },
          { spriteIdentifier: RSX.fxCrossSlash.name },
          {
            spriteIdentifier: RSX.fxImpactRingVerticalWhite.name,
            offset: { x: 30, y: 0 },
          },
        ],
      },
      CassyvaSoulreaper: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksPurple.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxExplosionPurpleSmoke.name,
            flippedX: true,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxImpactRingVerticalWhite.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      AbyssalCrawler: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksPurple.name, flippedX: true },
          { spriteIdentifier: [RSX.fxImpactMediumOrange.name] },
        ],
      },
      AbyssalJuggernaut: {
        UnitAttackedFX: [
          {
            type: 'Shockwave',
            offset: { x: 0, y: -45 },
            radius: 144,
            duration: 0.9,
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -45 },
          },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      BloodmoonPriestess: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxSiphon.name,
            type: 'Chain',
            impactFX: [
              { spriteIdentifier: [RSX.fxCrossSlash.name] },
              { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
            ],
          },
        ],
      },
      ShadowWatcher: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.neutralMechaz0rSuperProjectile.name,
            type: 'Projectile',
            emitFX: [],
            impactFX: [
              { spriteIdentifier: RSX.fxImpactBigOrange.name },
              { spriteIdentifier: RSX.fxCollisionSparksRed.name },
            ],
            looping: true,
          },
        ],
      },
      ArcaneDevourer: {
        UnitAttackedFX: [
          { spriteIdentifier: [RSX.fxDevour.name] },
          {
            type: 'Shockwave',
            offset: { x: 0, y: -45 },
            radius: 135,
            duration: 0.6,
          },
        ],
      },
      Klaxon: {
        UnitAttackedFX: [
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name] },
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            type: 'Shockwave',
            offset: { x: 0, y: -45 },
            radius: 135,
            duration: 0.6,
          },
        ],
      },
      DeepfireDevourer: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: 0, y: 0 },
          },
          { spriteIdentifier: RSX.fxFaerieFirePurple.name },
          {
            type: 'Shockwave',
            offset: { x: 0, y: -45 },
            radius: 80,
            duration: 0.6,
          },
        ],
      },
      DarkSiren: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksPurple.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxCollisionSparksPurple.name,
            offset: { x: 10, y: 20 },
            flippedX: true,
          },
          {
            spriteIdentifier: RSX.fxCrossSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxCrossSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
          { spriteIdentifier: RSX.fxFaerieFirePurple.name },
        ],
      },
      VorpalReaver: {
        UnitAttackedFX: [
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name] },
          { spriteIdentifier: RSX.fxCollisionSparksPurple.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxExplosionPurpleSmoke.name,
            flippedX: true,
            offset: { x: -50, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxExplosionPurpleSmoke.name,
            offset: { x: 50, y: 20 },
          },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      Wraithling: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCrossSlash.name },
          { spriteIdentifier: RSX.fxCollisionSparksPurple.name },
        ],
      },
      DarkspineElemental: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxExplosionPurpleSmoke.name },
          { spriteIdentifier: RSX.fxCrossSlash.name },
          { spriteIdentifier: RSX.fxCollisionSparksPurple.name },
        ],
      },
      GloomChaser: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCrossSlash.name },
          { spriteIdentifier: RSX.fxCollisionSparksPurple.name },
        ],
      },
      SharianShadowdancer: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxImpactWhiteMedium.name },
          { spriteIdentifier: RSX.fxCrossSlash.name },
          { spriteIdentifier: RSX.fxCollisionSparksPurple.name },
        ],
      },
      NightsorrowAssassin: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxImpactWhiteMedium.name },
          { spriteIdentifier: RSX.fxCollisionSparksPurple.name },
        ],
      },
      ShadowSister: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksRed.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxExplosionBigBall_MetalSlug.name,
            flippedX: true,
            offset: { x: 0, y: -20 },
          },
          { type: 'Shockwave', radius: 135, duration: 0.75 },
        ],
      },
      SpectralRevenant: {
        UnitAttackedFX: [
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name] },
          { spriteIdentifier: RSX.fxCollisionSparksPurple.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 20 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: false,
            offset: { x: 30, y: 40 },
          },
        ],
      },
      BlackSolus: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksPurple.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxExplosionPurpleSmoke.name,
            flippedX: true,
            offset: { x: -50, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxExplosionPurpleSmoke.name,
            offset: { x: 50, y: 20 },
          },
        ],
      },
    },
    Faction5: {
      General: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksGreen.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            offset: { x: 0, y: 50 },
          },
          {
            spriteIdentifier: RSX.fxBubbleEnergySootGround.name,
            offset: { x: 0, y: -20 },
          },
        ],
      },
      Starhorn: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksGreen.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            offset: { x: -20, y: 30 },
          },
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            flippedX: true,
            offset: { x: 20, y: 30 },
          },
        ],
      },
      EarthSister: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxExplosionBigBall_MetalSlug.name,
            flippedX: true,
            offset: { x: 0, y: -20 },
          },
          { type: 'Shockwave', radius: 135, duration: 0.75 },
        ],
      },
      EarthWalker: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxImpactGreenBig.name,
            flippedX: true,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      Vindicator: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            flippedX: true,
            offset: { x: 0, y: 60 },
          },
          { spriteIdentifier: RSX.fxElectricalGroundUpGreen.name },
        ],
      },
      MolokiHuntress: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            flippedX: true,
            offset: { x: 0, y: 60 },
          },
          { spriteIdentifier: RSX.fxElectricalGroundUpGreen.name },
        ],
      },
      Mandrake: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksGreen.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            flippedX: true,
            offset: { x: 0, y: 60 },
          },
          {
            spriteIdentifier: RSX.fxImpactGreenMed.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxImpactGreenMed.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
          {
            spriteIdentifier: RSX.fxImpactMediumOrange.name,
            flippedX: false,
            offset: { x: 0, y: -30 },
          },
        ],
      },
      Grimrock: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksGreen.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            flippedX: true,
            offset: { x: 0, y: 60 },
          },
          { spriteIdentifier: RSX.fxElectricalGroundUpGreen.name },
        ],
      },
      Dreadnaught: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksGreen.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpGreen.name,
            offset: { x: 0, y: -20 },
          },
        ],
      },
      Kolossus: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksGreen.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            flippedX: true,
            offset: { x: 0, y: 60 },
          },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpGreen.name,
            offset: { x: 0, y: -20 },
          },
        ],
      },
      MakantorWarbeast: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksGreen.name, flippedX: true },
          {
            spriteIdentifier: RSX.fx_slashfrenzy.name,
            flippedX: true,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
        ],
      },
      Phalanxar: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksGreen.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            offset: { x: -60, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            offset: { x: 60, y: 20 },
          },
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            flippedX: true,
            offset: { x: 0, y: 60 },
          },
        ],
      },
      Elucidator: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksGreen.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            flippedX: true,
            offset: { x: 0, y: 60 },
          },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpGreen.name,
            offset: { x: 0, y: -20 },
          },
        ],
      },
      UnstableLeviathan: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            flippedX: true,
            offset: { x: 0, y: 60 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: 0, y: 40 },
          },
        ],
      },
      Kujata: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksGreen.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            flippedX: true,
            offset: { x: 0, y: 60 },
          },
          {
            spriteIdentifier: RSX.fx_slashfrenzy.name,
            flippedX: true,
            offset: { x: 0, y: 0 },
          },
          { spriteIdentifier: RSX.fxImpactWhiteMedium.name },
        ],
      },
      PrimordialGazer: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksGreen.name, flippedX: true },
        ],
      },
      Egg: {
        UnitAttackedFX: [
          { spriteIdentifier: [RSX.fxImpactGreenBig.name] },
        ],
      },
      YoungSilithar: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksGreen.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
        ],
      },
      VeteranSilithar: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxElectricalGroundUpBlue.name,
            offset: { x: 0, y: -20 },
          },
        ],
      },
      SilitharElder: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpBlue.name,
            offset: { x: 0, y: -20 },
          },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpBlue.name,
            offset: { x: -40, y: 30 },
          },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpBlue.name,
            offset: { x: 30, y: 20 },
          },
        ],
      },
      SpiritHarvester: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksGreen.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
        ],
      },
      MiniMagmar: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksGreen.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            offset: { x: -60, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            offset: { x: 60, y: 20 },
          },
        ],
      },
      Firebreather: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.f5FireBreatherProjectile.name,
            type: 'Projectile',
            emitFX: [
              {
                type: 'Particles',
                plistFile: RSX.ptcl_projectile_trail.plist,
                color: { r: 255, g: 150, b: 100 },
                friction: 0.95,
              },
            ],
            impactFX: [
              { spriteIdentifier: RSX.fxImpactBigOrange.name },
              { spriteIdentifier: RSX.fxCollisionSparksOrange.name },
            ],
            looping: true,
          },
        ],
      },
    },
    Faction6: {
      General: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxImpactRingVerticalOrange.name,
            offset: { x: 15, y: 0 },
          },
          { spriteIdentifier: RSX.fxExplosionBigWhiteHot.name },
        ],
      },
      KaraWinterblade: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxBubbleEnergySootGround.name },
          {
            spriteIdentifier: RSX.fxImpactRingVerticalWhite.name,
            offset: { x: 30, y: 0 },
          },
        ],
      },
      AncientGrove: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxBubbleEnergySootGround.name },
        ],
      },
      HearthSister: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.neutralCrossbonesProjectile.name,
            type: 'Projectile',
            emitFX: [
              {
                type: 'Particles',
                plistFile: RSX.ptcl_projectile_trail.plist,
                color: { r: 150, g: 200, b: 255 },
                friction: 0.95,
              },
            ],
            impactFX: [
              { spriteIdentifier: RSX.fxImpactMediumBlue.name },
              { spriteIdentifier: RSX.fxCollisionSparksBlue.name },
            ],
            looping: true,
          },
        ],
      },
      SnowElemental: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.neutralCrossbonesProjectile.name,
            type: 'Projectile',
            emitFX: [
              {
                type: 'Particles',
                plistFile: RSX.ptcl_projectile_trail.plist,
                color: { r: 150, g: 200, b: 255 },
                friction: 0.95,
              },
            ],
            impactFX: [
              { spriteIdentifier: RSX.fxImpactMediumBlue.name },
              { spriteIdentifier: RSX.fxCollisionSparksBlue.name },
            ],
            looping: true,
          },
        ],
      },
      WolfRaven: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
        ],
      },
      Razorback: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
        ],
      },
      IceDryad: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxCollisionSparksBlue.name,
            offset: { x: -10, y: 30 },
          },
        ],
      },
      WyrBeast: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
        ],
      },
      FenrirWarmaster: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
        ],
      },
      SeismicElemental: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxCollisionSparksBlue.name,
            offset: { x: -10, y: 30 },
          },
        ],
      },
      AzureDrake: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
        ],
      },
      ArcticRhyno: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
        ],
      },
      ArcticDisplacer: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
        ],
      },
      VoiceoftheWind: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            offset: { x: -60, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            offset: { x: 60, y: 20 },
          },
        ],
      },
      Treant: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
        ],
      },
      WolfAspect: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxDevour.name,
            flippedX: false,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      GhostWolf: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxDevour.name,
            flippedX: false,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      PrismaticGiant: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxCollisionSparksBlue.name,
            offset: { x: -10, y: 30 },
          },
          {
            spriteIdentifier: RSX.fxCollisionSparksBlue.name,
            offset: { x: 10, y: 20 },
            flippedX: true,
          },
        ],
      },
      IceDrake: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
        ],
      },
      WindSister: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxExplosionBigBall_MetalSlug.name,
            flippedX: true,
            offset: { x: 0, y: -20 },
          },
          { type: 'Shockwave', radius: 135, duration: 0.75 },
        ],
      },
      CrystalCloaker: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxCollisionSparksBlue.name,
            offset: { x: -10, y: 30 },
          },
          {
            spriteIdentifier: RSX.fxCollisionSparksBlue.name,
            offset: { x: 10, y: 20 },
            flippedX: true,
          },
        ],
      },
    },
    Neutral: {
      FireSpitter: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.neutralSwornAvengerProjectile.name,
            type: 'Projectile',
            emitFX: [
              {
                type: 'Particles',
                plistFile: RSX.ptcl_projectile_trail.plist,
                color: { r: 255, g: 150, b: 100 },
                friction: 0.95,
              },
            ],
            impactFX: [
              { spriteIdentifier: RSX.fxImpactBigOrange.name },
              { spriteIdentifier: RSX.fxExplosionOrangeSmoke.name },
              { spriteIdentifier: RSX.fxCollisionSparksOrange.name },
            ],
            looping: true,
          },
        ],
      },
      BeastCharger: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name] },
        ],
      },
      PlanarScout: {
        UnitAttackedFX: [
          { spriteIdentifier: [RSX.fxElectricalGroundUpRed.name] },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      EphemeralShroud: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
        UnitDamagedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
        ],
      },
      SunSeer: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxExplosionBigBall_MetalSlug.name },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      ArtifactHunter: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name] },
        ],
      },
      Manaforger: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name] },
        ],
      },
      PrismaticIllusionist: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      ArcaneIllusion: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxCollisionSparksBlue.name,
            offset: { x: -10, y: 30 },
          },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      AlcuinLoremaster: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksRed.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpRed.name,
            offset: { x: -30, y: 30 },
          },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpRed.name,
            offset: { x: 30, y: 10 },
          },
          {
            type: 'Shockwave',
            offset: { x: 0, y: -45 },
            radius: 135,
            duration: 0.6,
          },
        ],
      },
      OwlbeastSage: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxElectricalGroundUpBlue.name,
            offset: { x: 0, y: -20 },
          },
          {
            type: 'Shockwave',
            offset: { x: 0, y: -45 },
            radius: 135,
            duration: 0.6,
          },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      Lightbender: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksRed.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpRed.name,
            offset: { x: 10, y: 20 },
          },
        ],
      },
      RogueWarden: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxChainLightningBlue.name,
            type: 'Chain',
            impactAtStart: false,
            impactAtEnd: true,
            impactFX: [
              { spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name },
            ],
          },
          {
            spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name,
            flippedX: true,
            offset: { x: 0.1, y: 11.25 },
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -45 },
          },
        ],
        UnitSpawnFX: [
          {
            spriteIdentifier: RSX.fxTeleportRecall.name,
            offset: { x: 0, y: -11.25 },
          },
          {
            spriteIdentifier: RSX.fxBladestorm.name,
            offset: { x: 0, y: 22.5 },
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -45 },
          },
        ],
      },
      VineEntangler: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxCrossSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxCrossSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
        ],
      },
      RockPulverizer: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name] },
        ],
      },
      Sojourner: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name] },
        ],
      },
      PrimusShieldmaster: {
        UnitAttackedFX: [
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name] },
        ],
      },
      Moebius: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxSearingChasm.name,
            intensity: 3,
            offset: { x: 0, y: 22.5 },
          },
          {
            type: 'Shockwave',
            offset: { x: 0, y: -45 },
            radius: 135,
            duration: 0.5,
          },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      LadyLocke: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name },
          {
            type: 'Shockwave',
            offset: { x: 0, y: -45 },
            radius: 135,
            duration: 0.5,
          },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      HailstoneHowler: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxFrozenIceBlock.name },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      WhistlingBlade: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpRed.name,
            offset: { x: -20, y: 30 },
          },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpRed.name,
            offset: { x: 10, y: 20 },
          },
        ],
      },
      OnyxScorpion: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
        ],
      },
      CrimsonOculus: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          { spriteIdentifier: RSX.fxImpactWhiteMedium.name },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      ThornNeedler: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
          { spriteIdentifier: RSX.fxImpactWhiteMedium.name },
        ],
      },
      VenomToth: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
          { spriteIdentifier: RSX.fxImpactWhiteMedium.name },
        ],
      },
      SkyrockGolem: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          { spriteIdentifier: RSX.fxImpactWhiteMedium.name },
        ],
      },
      BloodshardGolem: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksRed.name, flippedX: true },
          { spriteIdentifier: RSX.fxImpactWhiteMedium.name },
        ],
      },
      DragoneboneGolem: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            type: 'Shockwave',
            offset: { x: 0, y: -45 },
            radius: 144,
            duration: 0.9,
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -45 },
          },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      StormmetalGolem: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            type: 'Shockwave',
            offset: { x: 0, y: -45 },
            radius: 144,
            duration: 0.9,
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -45 },
          },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      BrightmossGolem: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksGreen.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxImpactGreenBig.name,
            flippedX: false,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -45 },
          },
        ],
      },
      Mechaz0rHelm: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxCollisionSparksBlue.name,
            offset: { x: -10, y: 30 },
          },
        ],
      },
      Mechaz0rWings: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxCollisionSparksBlue.name,
            offset: { x: 10, y: 20 },
            flippedX: true,
          },
        ],
      },
      Mechaz0rCannon: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.neutralMechaz0rCannonProjectile.name,
            type: 'Projectile',
            emitFX: [
              {
                type: 'Particles',
                plistFile: RSX.ptcl_projectile_trail.plist,
                color: { r: 255, g: 0, b: 200 },
                friction: 0.95,
              },
            ],
            impactFX: [
              { spriteIdentifier: RSX.fxImpactBigOrange.name },
              { spriteIdentifier: RSX.fxCollisionSparksRed.name },
            ],
            looping: true,
          },
        ],
      },
      Mechaz0rSword: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fx_slashfrenzy.name,
            flippedX: true,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      Mechaz0rChassis: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxCollisionSparksBlue.name,
            offset: { x: -10, y: 30 },
          },
        ],
      },
      Mechaz0r: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.neutralMechaz0rSuperProjectile.name,
            type: 'Projectile',
            emitFX: [
              {
                type: 'Particles',
                plistFile: RSX.ptcl_projectile_trail.plist,
                color: { r: 255, g: 150, b: 200 },
                friction: 0.95,
              },
            ],
            impactFX: [
              { spriteIdentifier: RSX.fxImpactBigOrange.name },
              { spriteIdentifier: RSX.fxCollisionSparksRed.name },
            ],
            looping: true,
          },
        ],
      },
      SpottedDragonlark: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
        ],
      },
      PutridMindflayer: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
        ],
      },
      Mindwarper: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            flippedX: true,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      Eclipse: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksPurple.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxExplosionPurpleSmoke.name,
            flippedX: true,
            offset: { x: -50, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxExplosionPurpleSmoke.name,
            offset: { x: 50, y: 20 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
        ],
      },
      EmeraldRejuvenator: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksGreen.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpGreen.name,
            offset: { x: 0, y: -20 },
          },
          { spriteIdentifier: RSX.fxImpactWhiteMedium.name },
        ],
      },
      HealingMystic: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksGreen.name, flippedX: true },
          { spriteIdentifier: RSX.fxImpactWhiteMedium.name },
        ],
      },
      Fireblazer: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            flippedX: true,
            offset: { x: -50, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            offset: { x: -30, y: 40 },
          },
        ],
      },
      Pandora: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            offset: { x: 50, y: 20 },
          },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            flippedX: true,
            offset: { x: 30, y: 60 },
          },
        ],
      },
      PandoraMinionCloud: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name] },
        ],
      },
      PandoraMinionBlaze: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            flippedX: true,
            offset: { x: 30, y: 60 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
        ],
      },
      PandoraMinionFlash: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksRed.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          { spriteIdentifier: RSX.fxFaerieFireRed.name },
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name] },
        ],
      },
      PandoraMinionZap: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.neutralSwornAvengerProjectile.name,
            type: 'Projectile',
            emitFX: [
              {
                type: 'Particles',
                plistFile: RSX.ptcl_projectile_trail.plist,
                color: { r: 255, g: 150, b: 100 },
                friction: 0.95,
              },
            ],
            impactFX: [
              { spriteIdentifier: RSX.fxImpactBigOrange.name },
              { spriteIdentifier: RSX.fxExplosionOrangeSmoke.name },
              { spriteIdentifier: RSX.fxCollisionSparksOrange.name },
            ],
            looping: true,
          },
        ],
      },
      PandoraMinionSinker: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksPurple.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          { spriteIdentifier: RSX.fxFaerieFirePurple.name },
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name] },
        ],
      },
      FlameWing: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
        ],
      },
      GhostLynx: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
        ],
      },
      WindRunner: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          { spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name, flippedX: true },
          { spriteIdentifier: RSX.fxImpactRingVerticalWhite.name },
        ],
      },
      Mogwai: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          { spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name, flippedX: true },
          { spriteIdentifier: RSX.fxImpactRingVerticalWhite.name },
        ],
      },
      BlackLocust: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
        ],
      },
      Firestarter: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            flippedX: true,
            offset: { x: -50, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            offset: { x: 50, y: 20 },
          },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            flippedX: true,
            offset: { x: 30, y: 60 },
          },
        ],
      },
      Spellspark: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            offset: { x: 50, y: 20 },
          },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            flippedX: true,
            offset: { x: 30, y: 60 },
          },
        ],
      },
      Grailmaster: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            offset: { x: -30, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            flippedX: true,
            offset: { x: 30, y: 0 },
          },
        ],
      },
      Khymera: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            flippedX: true,
            offset: { x: -50, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            offset: { x: 50, y: 20 },
          },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            flippedX: true,
            offset: { x: 30, y: 60 },
          },
        ],
      },
      SunElemental: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            offset: { x: 50, y: 20 },
          },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            flippedX: true,
            offset: { x: 30, y: 60 },
          },
        ],
      },
      ProphetWhitePalm: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name,
            flippedX: true,
            offset: { x: 0, y: 0 },
          },
          { spriteIdentifier: RSX.fxElectricalGroundUpBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name,
            offset: { x: 0.1, y: 11.25 },
          },
        ],
      },
      ArakiHeadhunter: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            flippedX: true,
            offset: { x: -50, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            offset: { x: 50, y: 20 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
        ],
      },
      KeeperOfTheVale: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxImpactMediumBlue.name },
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          { spriteIdentifier: RSX.fxElectricalGroundUpBlue.name, flippedX: true },
        ],
      },
      WhiteWidow: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksPurple.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxCrossSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxCrossSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      WingsOfParadise: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksRed.name, flippedX: true },
          { spriteIdentifier: RSX.fxElectricalGroundUpBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpRed.name,
            offset: { x: 0, y: -20 },
          },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpRed.name,
            offset: { x: -40, y: 30 },
          },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpRed.name,
            offset: { x: 30, y: 20 },
          },
        ],
      },
      Dreamgazer: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxImpactMediumBlue.name },
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name,
            flippedX: true,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name,
            offset: { x: 0.1, y: 11.25 },
          },
        ],
      },
      AstralCrusader: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxElectricalGroundUpBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name,
            offset: { x: 0.1, y: 11.25 },
          },
        ],
      },
      WarTalon: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name,
            flippedX: true,
            offset: { x: 0, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name,
            offset: { x: 0.1, y: 11.25 },
          },
        ],
      },
      Tethermancer: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksRed.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name,
            flippedX: true,
            offset: { x: 0, y: 0 },
          },
          { spriteIdentifier: RSX.fxElectricalGroundUpBlue.name, flippedX: true },
        ],
      },
      Bonereaper: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxCrossSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxCrossSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
          { spriteIdentifier: RSX.fxFaerieFirePurple.name },
          {
            type: 'Shockwave',
            offset: { x: 0, y: -45 },
            radius: 135,
            duration: 0.6,
          },
        ],
      },
      HollowGrovekeeper: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxElectricalGroundUpBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name,
            offset: { x: 0.1, y: 11.25 },
          },
        ],
      },
      SapphireSeer: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name, flippedX: true },
          { spriteIdentifier: RSX.fxImpactRingVerticalWhite.name },
        ],
      },
      SunsteelDefender: {
        UnitAttackedFX: [
          { plistFile: RSX.ptcl_pixelpuff.plist, type: 'Particles' },
          {
            spriteIdentifier: RSX.fxHeavensStrike.name,
            offset: { x: 0, y: 170 },
          },
          {
            type: 'Shockwave', atSource: true, radius: 180, duration: 0.75,
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -45 },
          },
        ],
      },
      SunsetParagon: {
        UnitAttackedFX: [
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name] },
          { spriteIdentifier: RSX.fxCollisionSparksPurple.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxCrossSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxCrossSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
          {
            type: 'Shockwave',
            offset: { x: 0, y: -45 },
            radius: 135,
            duration: 0.6,
          },
        ],
      },
      EXun: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name,
            flippedX: true,
            offset: { x: 0, y: 0 },
          },
          { spriteIdentifier: RSX.fxElectricalGroundUpBlue.name, flippedX: true },
        ],
      },
      ArrowWhistler: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.neutralSwornAvengerProjectile.name,
            type: 'Projectile',
            emitFX: [
              {
                type: 'Particles',
                plistFile: RSX.ptcl_projectile_trail.plist,
                color: { r: 255, g: 150, b: 100 },
                friction: 0.95,
              },
            ],
            impactFX: [
              { spriteIdentifier: RSX.fxImpactBigOrange.name },
              { spriteIdentifier: RSX.fxExplosionOrangeSmoke.name },
              { spriteIdentifier: RSX.fxCollisionSparksOrange.name },
            ],
            looping: true,
          },
        ],
      },
      Skywing: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksRed.name, flippedX: true },
          { spriteIdentifier: RSX.fxElectricalGroundUpBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpRed.name,
            offset: { x: 0, y: -20 },
          },
        ],
      },
      GoldenJusticar: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxPlasmaBlueVertical.name,
            flippedX: true,
            offset: { x: 0, y: -10 },
          },
        ],
      },
      Unseven: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          { spriteIdentifier: RSX.fxImpactWhiteMedium.name },
          {
            plistFile: RSX.ptcl_circleswirls.plist,
            type: 'Particles',
            offset: { x: 0, y: 0 },
            zOrder: 1,
          },
          {
            plistFile: RSX.ptcl_circleswirls.plist,
            type: 'Particles',
            offset: { x: 0, y: 0 },
            zOrder: 1,
          },
        ],
      },
      DiamondGolem: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxFrozenIceBlock.name },
        ],
      },
      Abjudicator: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.ForceField.name,
            offset: { x: 0, y: -4.5 },
          },
          { spriteIdentifier: RSX.fxElectricalGroundUpBlue.name, flippedX: true },
        ],
      },
      Bastion: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            flippedX: true,
            offset: { x: -50, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            offset: { x: 50, y: 20 },
          },
        ],
      },
      AlterRexx: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            type: 'Shockwave',
            offset: { x: 0, y: -45 },
            radius: 135,
            duration: 0.5,
          },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      Shiro: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name, flippedX: true },
          { spriteIdentifier: RSX.fxElectricalGroundUpBlue.name, flippedX: true },
        ],
      },
      Grincher: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            offset: { x: 50, y: 20 },
          },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            offset: { x: -30, y: 40 },
          },
        ],
      },
      TheScientist: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxPlasmaBlueVertical.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxPlasmaBlueVertical.name,
            flippedX: true,
            offset: { x: 0, y: -10 },
          },
          {
            spriteIdentifier: RSX.fxPlasmaBlueVertical.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
        ],
      },
      Envybaer: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksRed.name, flippedX: true },
          { type: 'Shockwave', radius: 135, duration: 0.75 },
          { spriteIdentifier: RSX.fxClawSlash.name },
        ],
      },
      BlisteringSkorn: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
        ],
      },
      Chakkram: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            flippedX: true,
            offset: { x: -50, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            flippedX: true,
            offset: { x: 30, y: 60 },
          },
        ],
      },
      RubyRifter: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxSearingChasm.name,
            intensity: 3,
            offset: { x: 0, y: 22.5 },
          },
          {
            type: 'Shockwave',
            offset: { x: 0, y: -45 },
            radius: 135,
            duration: 0.5,
          },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      BloodTaura: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksRed.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxExplosionBigBall_MetalSlug.name,
            flippedX: true,
            offset: { x: 0, y: -20 },
          },
          { type: 'Shockwave', radius: 135, duration: 0.75 },
          { spriteIdentifier: RSX.fxClawSlash.name },
        ],
      },
      LightningBeetle: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxPlasmaBlueVertical.name,
            flippedX: true,
            offset: { x: 0, y: -10 },
          },
        ],
      },
      PhaseHound: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
        ],
      },
      BlackSandBurrower: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
        ],
      },
      RepulsionBeast: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxImpactRingVerticalWhite.name, flippedX: true },
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
        ],
      },
      SilvertongueCorsair: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
        ],
      },
      JaxTruesight: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.neutralJaxTruesightProjectile.name,
            type: 'Projectile',
            emitFX: [
              {
                type: 'Particles',
                plistFile: RSX.ptcl_projectile_trail.plist,
                color: { r: 150, g: 200, b: 255 },
                friction: 0.95,
              },
            ],
            impactFX: [
              { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
              {
                spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name,
                offset: { x: 0.1, y: 11.25 },
              },
            ],
            looping: true,
          },
        ],
      },
      Jaxi: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.neutralJaxTruesightProjectile.name,
            type: 'Projectile',
            emitFX: [
              {
                type: 'Particles',
                plistFile: RSX.ptcl_projectile_trail.plist,
                color: { r: 150, g: 200, b: 255 },
                friction: 0.95,
              },
            ],
            impactFX: [
              { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
              {
                spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name,
                offset: { x: 0.1, y: 11.25 },
              },
            ],
            looping: true,
          },
        ],
      },
      MiniJax: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.neutralMiniJaxProjectile.name,
            type: 'Projectile',
            emitFX: [
              {
                type: 'Particles',
                plistFile: RSX.ptcl_projectile_trail.plist,
                color: { r: 150, g: 200, b: 255 },
                friction: 0.95,
              },
            ],
            impactFX: [
              { spriteIdentifier: RSX.fxImpactMediumBlue.name },
              {
                spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name,
                offset: { x: 0.1, y: 11.25 },
              },
            ],
            looping: true,
          },
        ],
      },
      SwornSister: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxExplosionBigBall_MetalSlug.name,
            flippedX: true,
            offset: { x: 0, y: -20 },
          },
          { type: 'Shockwave', radius: 135, duration: 0.75 },
        ],
      },
      Rook: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxExplosionBigBall_MetalSlug.name,
            flippedX: true,
            offset: { x: 0, y: -20 },
          },
          { type: 'Shockwave', radius: 135, duration: 0.75 },
        ],
      },
      DeathBlighter: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxExplosionPurpleSmoke.name,
            flippedX: true,
            offset: { x: -50, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxExplosionPurpleSmoke.name,
            offset: { x: 50, y: 20 },
          },
          { spriteIdentifier: RSX.fxFaerieFirePurple.name },
        ],
      },
      AshMephyt: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksPurple.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxExplosionPurpleSmoke.name,
            flippedX: true,
            offset: { x: -50, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxExplosionPurpleSmoke.name,
            offset: { x: 50, y: 20 },
          },
          { spriteIdentifier: RSX.fxFaerieFirePurple.name },
        ],
      },
      FirstSwordofAkrane: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxImpactMediumBlue.name },
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
        ],
      },
      Paddo: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksGreen.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            offset: { x: -60, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxLightningHitGreen.name,
            offset: { x: 60, y: 20 },
          },
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name] },
        ],
      },
      Aethermaster: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxImpactMediumBlue.name },
          {
            spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name,
            flippedX: true,
            offset: { x: 0, y: 0 },
          },
          { spriteIdentifier: RSX.fxElectricalGroundUpBlue.name, flippedX: true },
        ],
      },
      ZenRui: {
        UnitAttackedFX: [
          {
            spriteIdentifier: [
              RSX.fxExplosionMediumWhiteHot.name,
            ],
            flippedX: true,
            offset: { x: 0, y: -20 },
          },
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name },
          { spriteIdentifier: RSX.fxElectricalGroundUpYellow.name },
          {
            spriteIdentifier: RSX.fxImpactRingVerticalOrange.name,
            offset: { x: -15, y: 20 },
          },
          {
            spriteIdentifier: RSX.fxImpactRingVerticalOrange.name,
            offset: { x: 0, y: -15 },
            flippedX: true,
          },
        ],
      },
      TheHighHand: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxPlasmaBlueVertical.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxPlasmaBlueVertical.name,
            flippedX: true,
            offset: { x: 0, y: -10 },
          },
          {
            spriteIdentifier: RSX.fxPlasmaBlueVertical.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
        ],
      },
      Bloodletter: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksRed.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          { spriteIdentifier: RSX.fxImpactRingVerticalWhite.name },
        ],
      },
      Necroseer: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name,
            offset: { x: 0.1, y: 11.25 },
          },
          { spriteIdentifier: RSX.fxFaerieFirePurple.name },
          {
            spriteIdentifier: RSX.fxSwirlRingsBlue.name,
            offset: { x: 0, y: -22.5 },
          },
          {
            spriteIdentifier: RSX.fxExplosionGroundSmokeSwirl.name,
            offset: { x: 0, y: -11.25 },
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -45 },
          },
        ],
      },
      Maw: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksGreen.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxImpactMediumOrange.name,
            flippedX: false,
            offset: { x: 0, y: -30 },
          },
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name] },
        ],
      },
      Fog: {
        UnitAttackedFX: [
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name] },
        ],
      },
      Ubo: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksGreen.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpGreen.name,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      Xho: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            flippedX: true,
            offset: { x: -50, y: 0 },
          },
          {
            spriteIdentifier: RSX.fxExplosionOrangeSmoke.name,
            offset: { x: -30, y: 40 },
          },
          { spriteIdentifier: RSX.fxImpactWhiteMedium.name },
        ],
      },
      Amu: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksGreen.name, flippedX: true },
          { spriteIdentifier: RSX.fxImpactWhiteMedium.name },
        ],
      },
      Gro: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxImpactMediumOrange.name,
            flippedX: false,
            offset: { x: 0, y: -30 },
          },
        ],
      },
      Sai: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksGreen.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxImpactMediumOrange.name,
            flippedX: false,
            offset: { x: 0, y: -30 },
          },
          { spriteIdentifier: RSX.fxImpactWhiteMedium.name },
        ],
      },
      Yun: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksRed.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxImpactMediumOrange.name,
            flippedX: false,
            offset: { x: 0, y: -30 },
          },
          { spriteIdentifier: RSX.fxImpactWhiteMedium.name },
        ],
      },
      Purgatos: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksRed.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxPlasmaRedVertical.name,
            flippedX: true,
            offset: { x: 0, y: -20 },
          },
          {
            spriteIdentifier: RSX.fxPlasmaBlueVertical.name,
            offset: { x: -20, y: 0 },
          },
        ],
      },
      VoidHunter: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpRed.name,
            offset: { x: 0, y: 0 },
          },
          { spriteIdentifier: RSX.fxClawSlash.name },
        ],
      },
      ChaosElemental: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxElectricalGroundUpRed.name,
            offset: { x: 0, y: -20 },
          },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpRed.name,
            offset: { x: -40, y: 30 },
          },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpRed.name,
            offset: { x: 30, y: 20 },
          },
        ],
      },
      SaberspineTiger: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
          { spriteIdentifier: RSX.fxClawSlash.name },
        ],
      },
      PiercingMantis: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fx_slashfrenzy.name,
            flippedX: true,
            offset: { x: 0, y: 0 },
          },
          { spriteIdentifier: RSX.fxCrossSlash.name },
        ],
      },
      TwilightMage: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.neutralMercGrenadierProjectile.name,
            type: 'Projectile',
            impactFX: [
              { spriteIdentifier: RSX.fxImpactBigOrange.name },
            ],
            looping: true,
          },
        ],
        UnitSpawnFX: [
          { spriteIdentifier: RSX.fxTeleportRecall2.name },
          {
            spriteIdentifier: RSX.fxBladestorm.name,
            offset: { x: 0, y: 22.5 },
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -45 },
          },
        ],
      },
      PrimusFist: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          { spriteIdentifier: RSX.fxFaerieFireBlue.name },
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name] },
        ],
      },
      GolemMetallurgist: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: false },
        ],
      },
      GolemVanquisher: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxImpactOrangeSmall.name },
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
        ],
      },
      FrostboneNaga: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name, flippedX: true },
          { spriteIdentifier: RSX.fxImpactRingVerticalWhite.name },
        ],
      },
      ArchonSpellbinder: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxChainLightningRed.name,
            type: 'Chain',
            impactAtStart: false,
            impactAtEnd: true,
            impactFX: [
              { spriteIdentifier: RSX.fxPlasmaRedVertical.name },
              { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
              { spriteIdentifier: RSX.fxFaerieFirePurple.name },
            ],
          },
        ],
      },
      Dilotas: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksRed.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpRed.name,
            offset: { x: 0, y: -20 },
          },
        ],
      },
      DilotasTombstone: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksRed.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpRed.name,
            offset: { x: 0, y: -20 },
          },
        ],
      },
      Spelljammer: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxElectricalGroundUpRed.name,
            offset: { x: 0, y: -20 },
          },
        ],
      },
      SarlacTheEternal: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      DarkNemesis: {
        UnitAttackedFX: [
          {
            type: 'Shockwave',
            offset: { x: 0, y: -45 },
            radius: 135,
            duration: 0.6,
          },
          {
            spriteIdentifier: RSX.fxExplosionMediumBlueGround.name,
            type: 'Decal',
            offset: { x: 0, y: -22.5 },
          },
        ],
      },
      MirkbloodDevourer: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name, flippedX: true },
          { spriteIdentifier: RSX.fxImpactRingVerticalWhite.name },
        ],
      },
      Serpenti: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxCrossSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
          {
            spriteIdentifier: RSX.fx_slashfrenzy.name,
            flippedX: true,
            offset: { x: 0, y: 0 },
          },
        ],
      },
      Windstopper: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name] },
        ],
      },
      AzureHornShaman: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxChainLightningBlue.name,
            type: 'Chain',
            impactAtStart: false,
            impactAtEnd: true,
            impactFX: [
              { spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name },
            ],
          },
        ],
      },
      ZuraelTheLifegiver: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fx_fireslash.name,
            offset: { x: 0, y: 10 },
          },
          { spriteIdentifier: RSX.fxFireTornado.name },
          {
            spriteIdentifier: RSX.fxTeleportOrangeOrb.name,
            offset: { x: 0, y: -15 },
          },
          {
            spriteIdentifier: RSX.fx_f3_starsfury.name,
            offset: { x: 0, y: 375 },
          },
        ],
      },
      FlamebloodWarlock: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.neutralFlamebloodWarlockProjectile.name,
            type: 'Projectile',
            impactFX: [
              { spriteIdentifier: RSX.fxImpactWhiteMedium.name },
              { spriteIdentifier: RSX.fxExplosionOrangeSmoke.name },
              { spriteIdentifier: RSX.fxCollisionSparksRed.name, flippedX: true },
            ],
            looping: true,
          },
        ],
      },
      BloodtearAlchemist: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name] },
        ],
      },
      Crossbones: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.neutralCrossbonesProjectile.name,
            type: 'Projectile',
            emitFX: [
              {
                type: 'Particles',
                plistFile: RSX.ptcl_projectile_trail.plist,
                color: { r: 150, g: 200, b: 255 },
                friction: 0.95,
              },
            ],
            impactFX: [
              { spriteIdentifier: RSX.fxImpactMediumBlue.name },
              { spriteIdentifier: RSX.fxCollisionSparksBlue.name },
            ],
            looping: true,
          },
        ],
      },
      SwornAvenger: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.neutralSwornAvengerProjectile.name,
            type: 'Projectile',
            emitFX: [
              {
                type: 'Particles',
                plistFile: RSX.ptcl_projectile_trail.plist,
                color: { r: 255, g: 150, b: 100 },
                friction: 0.95,
              },
            ],
            impactFX: [
              { spriteIdentifier: RSX.fxImpactBigOrange.name },
              { spriteIdentifier: RSX.fxExplosionOrangeSmoke.name },
              { spriteIdentifier: RSX.fxCollisionSparksOrange.name },
            ],
            looping: true,
          },
        ],
      },
      SwornDefender: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name] },
        ],
      },
      RedSynja: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name] },
        ],
      },
      CoiledCrawler: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxImpactOrangeSmall.name },
          { spriteIdentifier: RSX.fxCollisionSparksPurple.name, flippedX: true },
          { spriteIdentifier: RSX.fxFaerieFireGreen.name },
          { spriteIdentifier: RSX.fxCrossSlash.name },
        ],
      },
      DaggerKiri: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: true,
            offset: { x: -30, y: 40 },
          },
          {
            spriteIdentifier: RSX.fxClawSlash.name,
            flippedX: false,
            offset: { x: 40, y: 20 },
          },
          { spriteIdentifier: [RSX.fxImpactWhiteMedium.name] },
        ],
      },
      ValeHunter: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.neutralTribalRanged1Projectile.name,
            type: 'Projectile',
            emitFX: [
              {
                type: 'Particles',
                plistFile: RSX.ptcl_projectile_trail.plist,
                color: { r: 150, g: 200, b: 255 },
                friction: 0.95,
              },
            ],
            impactFX: [
              { spriteIdentifier: RSX.fxImpactMediumBlue.name },
              { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
            ],
            looping: true,
          },
        ],
      },
      DancingBlades: {
        UnitAttackedFX: [
          { spriteIdentifier: RSX.fxCollisionSparksRed.name, flippedX: true },
          { spriteIdentifier: RSX.fx_slashfrenzy.name, flippedX: true },
        ],
      },
      LuxIgnis: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.neutralLuxIgnisProjectile.name,
            type: 'Projectile',
            emitFX: [
              {
                type: 'Particles',
                plistFile: RSX.ptcl_projectile_trail.plist,
                color: { r: 255, g: 0, b: 200 },
                friction: 0.95,
              },
            ],
            impactFX: [
              { spriteIdentifier: RSX.fxImpactBigOrange.name },
              { spriteIdentifier: RSX.fxCollisionSparksOrange.name, flippedX: true },
              { spriteIdentifier: RSX.fxImpactRingVerticalOrange.name },
            ],
            looping: true,
          },
        ],
      },
      SyvrelTheExile: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.neutralSyvrelProjectile.name,
            type: 'Projectile',
            emitFX: [
              {
                type: 'Particles',
                plistFile: RSX.ptcl_projectile_trail.plist,
                color: { r: 255, g: 0, b: 200 },
                friction: 0.95,
              },
            ],
            impactFX: [
              { spriteIdentifier: RSX.fxExplosionOrangeSmoke.name },
              { spriteIdentifier: RSX.fxImpactRingVerticalOrange.name },
            ],
            looping: true,
          },
        ],
      },
      HankHart: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.neutralCaptainHartProjectile.name,
            type: 'Projectile',
            emitFX: [
              {
                type: 'Particles',
                plistFile: RSX.ptcl_projectile_trail.plist,
                color: { r: 150, g: 200, b: 255 },
                friction: 0.95,
              },
            ],
            impactFX: [
              { spriteIdentifier: RSX.fxExplosionMediumIcyWhite.name },
              { spriteIdentifier: RSX.fxImpactRingVerticalOrange.name },
            ],
            looping: true,
          },
        ],
      },
      Prisoner6: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxChainLightningBlue.name,
            type: 'Chain',
            impactAtStart: false,
            impactAtEnd: true,
            impactFX: [
              { spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name },
            ],
          },
          {
            spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name,
            flippedX: true,
            offset: { x: 0.1, y: 11.25 },
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -45 },
          },
        ],
      },
      Elkowl: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.fxChainLightningRed.name,
            type: 'Chain',
            impactAtStart: false,
            impactAtEnd: true,
            impactFX: [
              { spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name },
            ],
          },
          {
            spriteIdentifier: RSX.fxPlasmaBlueHorizontal.name,
            flippedX: true,
            offset: { x: 0.1, y: 11.25 },
          },
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -45 },
          },
        ],
      },
      Gambler: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.neutralGamblerProjectile.name,
            type: 'Projectile',
            emitFX: [
              {
                type: 'Particles',
                plistFile: RSX.ptcl_projectile_trail.plist,
                color: { r: 255, g: 150, b: 100 },
                friction: 0.95,
              },
            ],
            impactFX: [
              { spriteIdentifier: RSX.fxImpactBigOrange.name },
              { spriteIdentifier: RSX.fxCollisionSparksOrange.name },
            ],
            looping: true,
          },
        ],
      },
      Solpiercer: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.f1BacklineArcherProjectile.name,
            type: 'Projectile',
            emitFX: [
              {
                type: 'Particles',
                plistFile: RSX.ptcl_projectile_trail.plist,
                color: { r: 255, g: 150, b: 100 },
                friction: 0.95,
              },
            ],
            impactFX: [
              { spriteIdentifier: RSX.fxImpactBigOrange.name },
              { spriteIdentifier: RSX.fxCollisionSparksOrange.name },
            ],
            looping: true,
          },
        ],
      },
      Letigress: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.neutralLeTigressProjectile.name,
            type: 'Projectile',
            emitFX: [
              {
                type: 'Particles',
                plistFile: RSX.ptcl_projectile_trail.plist,
                color: { r: 255, g: 150, b: 100 },
                friction: 0.95,
              },
            ],
            impactFX: [
              { spriteIdentifier: RSX.fxImpactBigOrange.name },
              { spriteIdentifier: RSX.fxCollisionSparksOrange.name },
            ],
            looping: true,
          },
        ],
      },
      DrakeDowager: {
        UnitAttackedFX: [
          {
            spriteIdentifier: RSX.f6MotherOfDrakesProjectile.name,
            type: 'Projectile',
            emitFX: [
              {
                type: 'Particles',
                plistFile: RSX.ptcl_projectile_trail.plist,
                color: { r: 255, g: 150, b: 100 },
                friction: 0.95,
              },
            ],
            impactFX: [
              { spriteIdentifier: RSX.fxImpactBigOrange.name },
              { spriteIdentifier: RSX.fxCollisionSparksOrange.name },
            ],
            looping: true,
          },
        ],
      },
    },
    Tile: {
      BonusMana: {
        UnitSpawnFX: [],
        UnitDiedFX: [
          {
            spriteIdentifier: RSX.fxSwirlRingsBlue.name,
            offset: { x: 0, y: -22.5 },
          },
          { spriteIdentifier: RSX.fxCollisionSparksBlue.name, flippedX: true },
        ],
      },
      Shadow: {
        UnitSpawnFX: [
          {
            spriteIdentifier: RSX.fxSmokeGround.name,
            offset: { x: 0, y: -45 },
          },
        ],
        UnitDiedFX: [],
      },
    },
  },
  Actions: {
    Teleport: {
      MoveSourceFX: [
        { spriteIdentifier: RSX.fxTeleportRecall2.name },
        {
          spriteIdentifier: RSX.fxSwirlRingsBlue.name,
          offset: { x: 0, y: -45 },
        },
        {
          type: 'Shockwave',
          offset: { x: 0, y: -40 },
          radius: 72,
          duration: 0.9,
        },
      ],
      MoveTargetFX: [
        { spriteIdentifier: RSX.fxTeleportRecall2.name },
        {
          spriteIdentifier: RSX.fxSwirlRingsBlue.name,
          offset: { x: 0, y: -45 },
        },
        {
          type: 'Shockwave',
          offset: { x: 0, y: -40 },
          radius: 72,
          duration: 0.9,
        },
      ],
      MoveFX: [
        {
          type: 'Particles', plistFile: RSX.ptcl_pixelteleport.plist, needsDepthTest: true, positionType: 'PARTICLE_TYPE_FOLLOW', maxInertia: 16, maxInertiaRandom: 16, friction: 0.9,
        },
      ],
    },
    RefreshArtifacts: {
      SpellAppliedFX: [
        {
          spriteIdentifier: RSX.ForceField.name,
          offset: { x: 0, y: -4.5 },
        },
        { spriteIdentifier: RSX.fxBuffSimpleGold.name },
      ],
    },
  },
  Modifiers: {
    ModifierAbsorbDamage: {
      ModifierTriggeredTargetFX: [
        {
          spriteIdentifier: RSX.ForceField.name,
          offset: { x: 0, y: -4.5 },
        },
      ],
    },
    ModifierAirdrop: {},
    ModifierAttackEqualsHealth: {},
    ModifierBackstab: {
      ModifierTriggeredTargetFX: [
        { spriteIdentifier: RSX.fx_f2_backstab.name },
      ],
    },
    ModifierCannotAttackGeneral: {},
    ModifierCelerity: {},
    ModifierCollectable: {},
    ModifierCollectibleBonusMana: {
      ModifierFX: [
        {
          spriteIdentifier: RSX.unit_shadow.img,
          offset: { x: 0, y: -5 },
          scale: 1,
          opacity: 200,
          needsDepthDraw: false,
          removeOnEnd: false,
          zOrder: -1000,
        },
        {
          plistFile: RSX.ptcl_manaswirl.plist,
          type: 'Particles',
          layerName: 'middlegroundLayer',
          needsDepthTest: true,
          directionAligned: true,
          fadeInAtLifePct: 0.2,
          friction: 0.98,
          offset: { x: 0, y: 45 },
        },
        {
          spriteIdentifier: RSX.fxDistortionWaterBubble.name,
          type: 'Distortion',
          shaderKey: 'Water',
          layerName: 'middlegroundLayer',
          scale: 0.35,
          duration: 1,
          looping: true,
          speed: 0.05,
          amplitude: 2,
          frequency: 75,
          color: { r: 200, g: 255, b: 255 },
          removeOnEnd: false,
          depthOffset: -50,
          offset: { x: 0, y: 50 },
        },
      ],
      ModifierTriggeredSourceFX: [
        {
          plistFile: RSX.ptcl_manaspring.plist,
          type: 'Particles',
          layerName: 'middlegroundLayer',
          needsDepthTest: true,
          particleDepthOffset: 0,
          friction: { x: 0.98, y: 0.95 },
          offset: { x: 0, y: 20 },
          fadeInAtLifePct: 0.1,
        },
        {
          type: 'Light',
          offset: { x: 0, y: -40 },
          duration: 1,
          radius: 480,
          intensity: 3,
          opacity: 127,
          color: { r: 0, g: 255, b: 255 },
        },
      ],
    },
    ModifierDamageGeneralOnAttack: {},
    ModifierDealDamageWatch: {},
    ModifierDeathwatch: {},
    ModifierDestroyAtEndOfTurn: {},
    ModifierDispel: {
      ModifierAppliedFX: [
        {
          plistFile: RSX.ptcl_circleswirls.plist,
          type: 'Particles',
          offset: { x: 0, y: 0 },
          zOrder: 1,
        },
        {
          spriteIdentifier: RSX.fxCleanse.name,
          offset: { x: 0, y: -45 },
          zOrder: -1,
        },
        {
          spriteIdentifier: RSX.fxSwirlRingsBlue.name,
          offset: { x: 0, y: -20 },
        },
      ],
    },
    ModifierDoubleDamageToMinions: {},
    ModifierDyingWish: {},
    ModifierEgg: {},
    ModifierEndTurnWatch: {},
    ModifierEphemeral: {},
    ModifierFirstBlood: {},
    ModifierFlying: {},
    ModifierForcefield: {},
    ModifierForcefieldAbsorb: {
      ModifierFX: [
        {
          plistFile: RSX.ptcl_force_field.plist,
          type: 'Particles',
          offset: { x: 0, y: 0 },
          relativeToParent: true,
          fadeInAtLifePct: 0.025,
          zOrder: -1,
        },
      ],
    },
    ModifierInvulnerable: {
      ModifierFX: [
        {
          plistFile: RSX.ptcl_force_field_blue.plist,
          type: 'Particles',
          offset: { x: 0, y: 0 },
          relativeToParent: true,
          fadeInAtLifePct: 0.025,
          zOrder: -1,
        },
      ],
    },
    ModifierAntiMagicField: {
      ModifierFX: [
        {
          spriteIdentifier: RSX.fxDistortionHexShield.name,
          type: 'Distortion',
          scale: 0.6,
          color: { r: 225, g: 255, b: 255 },
          offset: { x: 0, y: -20 },
        },
      ],
    },
    ModifierFrenzy: {
      ModifierTriggeredSourceFX: [
        { spriteIdentifier: RSX.fxBladestorm.name },
        {
          spriteIdentifier: RSX.fxClawSlash.name,
          flippedX: true,
          offset: { x: 0, y: 40 },
        },
        {
          spriteIdentifier: RSX.fxClawSlash.name,
          flippedX: false,
          offset: { x: 10, y: 30 },
        },
      ],
    },
    ModifierGenericBuff: {
      ModifierTriggeredTargetFX: [
        { spriteIdentifier: RSX.fxBuffSimpleGold.name },
        {
          spriteIdentifier: RSX.fxSwirlRingsGreen.name,
          offset: { x: 0, y: 20 },
        },
      ],
    },
    ModifierSecondWind: {
      ModifierTriggeredFX: [
        {
          spriteIdentifier: RSX.fx_f5_boundedlife.name,
          offset: { x: 0, y: 150 },
        },
        {
          spriteIdentifier: RSX.fx_f5_manaburn.name,
          offset: { x: 0, y: 30 },
          emitFX: {
            type: 'Light',
            offset: { x: 0, y: -45 },
            radius: 2000,
            intensity: 9,
            color: { r: 170, g: 255, b: 170 },
          },
        },
        {
          spriteIdentifier: RSX.fxYellowTeleporterBeam.name,
          blendSrc: 'SRC_ALPHA',
          blendDst: 'ONE',
          offset: { x: 0, y: 40 },
        },
      ],
    },
    ModifierGenericChain: {
      ModifierTriggeredFX: [
        {
          spriteIdentifier: RSX.fxSiphon.name,
          type: 'Chain',
          emitFX: [
            { plistFile: RSX.ptcl_siphon.plist, type: 'Particles', fitToParent: true },
          ],
          impactFX: [
            { spriteIdentifier: RSX.fxExplosionMediumIcyWhite.name },
          ],
        },
      ],
    },
    ModifierGenericChainLightning: {
      ModifierTriggeredFX: [
        {
          spriteIdentifier: RSX.fxChainLightningBlue.name,
          type: 'Chain',
          impactFX: [
            { spriteIdentifier: RSX.fxExplosionMediumIcyWhite.name },
          ],
        },
      ],
    },
    ModifierGenericChainLightningRed: {
      ModifierTriggeredFX: [
        {
          spriteIdentifier: RSX.fxChainLightningRed.name,
          type: 'Chain',
          impactFX: [
            { spriteIdentifier: RSX.fxImpactBigOrange.name },
          ],
        },
      ],
    },
    ModifierGenericDamage: {
      ModifierTriggeredFX: [
        {
          spriteIdentifier: RSX.neutralMechaz0rSuperProjectile.name,
          type: 'Projectile',
          emitFX: [
            {
              type: 'Particles',
              plistFile: RSX.ptcl_projectile_trail.plist,
              color: { r: 255, g: 150, b: 200 },
              friction: 0.95,
            },
          ],
          impactFX: [
            { spriteIdentifier: RSX.fxImpactBigOrange.name },
            { spriteIdentifier: RSX.fxCollisionSparksRed.name },
          ],
          looping: true,
        },
      ],
    },
    ModifierGenericDamageEnergySmall: {
      ModifierTriggeredFX: [
        {
          spriteIdentifier: RSX.neutralMechaz0rCannonProjectile.name,
          type: 'Projectile',
          emitFX: [
            {
              type: 'Particles',
              plistFile: RSX.ptcl_projectile_trail.plist,
              color: { r: 255, g: 0, b: 200 },
              friction: 0.95,
            },
          ],
          impactFX: [
            { spriteIdentifier: RSX.fxImpactBigOrange.name },
            { spriteIdentifier: RSX.fxCollisionSparksRed.name },
          ],
          looping: true,
        },
      ],
    },
    ModifierGenericDamageSmall: {
      ModifierTriggeredFX: [
        {
          spriteIdentifier: RSX.f2CasterProjectile.name,
          type: 'Projectile',
          emitFX: [
            {
              type: 'Particles',
              plistFile: RSX.ptcl_projectile_trail.plist,
              color: { r: 255, g: 100, b: 0 },
              friction: 0.95,
            },
          ],
          impactFX: [
            { spriteIdentifier: RSX.fxImpactRingVerticalOrange.name },
            { spriteIdentifier: RSX.fxCollisionSparksOrange.name },
          ],
          looping: true,
        },
      ],
    },
    ModifierMyAttackWatchGamble: {
      ModifierTriggeredFX: [
        {
          spriteIdentifier: RSX.neutralGamblerProjectile.name,
          type: 'Projectile',
          emitFX: [
            {
              type: 'Particles',
              plistFile: RSX.ptcl_projectile_trail.plist,
              color: { r: 255, g: 150, b: 100 },
              friction: 0.95,
            },
          ],
          impactFX: [
            { spriteIdentifier: RSX.fxImpactBigOrange.name },
            { spriteIdentifier: RSX.fxCollisionSparksOrange.name },
          ],
          looping: true,
        },
      ],
    },
    ModifierGenericDamageIce: {
      ModifierTriggeredFX: [
        {
          spriteIdentifier: RSX.neutralCrossbonesProjectile.name,
          type: 'Projectile',
          emitFX: [
            {
              type: 'Particles',
              plistFile: RSX.ptcl_projectile_trail.plist,
              color: { r: 150, g: 200, b: 255 },
              friction: 0.95,
            },
          ],
          impactFX: [
            { spriteIdentifier: RSX.fxImpactMediumBlue.name },
            { spriteIdentifier: RSX.fxCollisionSparksBlue.name },
          ],
          looping: true,
        },
      ],
    },
    ModifierGenericDamageFire: {
      ModifierTriggeredFX: [
        {
          spriteIdentifier: RSX.neutralSwornAvengerProjectile.name,
          type: 'Projectile',
          emitFX: [
            {
              type: 'Particles',
              plistFile: RSX.ptcl_projectile_trail.plist,
              color: { r: 255, g: 150, b: 100 },
              friction: 0.95,
            },
          ],
          impactFX: [
            { spriteIdentifier: RSX.fxImpactBigOrange.name },
            { spriteIdentifier: RSX.fxExplosionOrangeSmoke.name },
            { spriteIdentifier: RSX.fxCollisionSparksOrange.name },
          ],
          looping: true,
        },
      ],
    },
    ModifierGenericDamageNearby: {
      ModifierTriggeredSourceFX: [
        { spriteIdentifier: RSX.fxFaerieFireRed.name, zOrder: -1 },
        { spriteIdentifier: RSX.fx_slashfrenzy.name },
      ],
    },
    ModifierGenericDamageNearbyShadow: {
      ModifierTriggeredSourceFX: [
        { spriteIdentifier: RSX.fx_f4_voidpulse.name },
      ],
    },
    ModifierGenericHeal: {},
    ModifierGenericKill: {
      ModifierTriggeredTargetFX: [
        {
          spriteIdentifier: RSX.fxCrossSlash.name,
          offset: { x: 0, y: 40 },
        },
      ],
    },
    ModifierGenericSpawn: {},
    ModifierGrow: {},
    ModifierImmunity: {
      ModifierFX: [
        {
          plistFile: RSX.ptcl_phalanx.plist,
          type: 'Particles',
          particleOffset: { x: 10, y: -55 },
          directionAligned: true,
          needsDepthTest: true,
          relativeToParent: true,
          fadeInAtLifePct: 0.2,
          friction: 0.98,
        },
      ],
    },
    ModifierImmunityAttack: {},
    ModifierImmunitySpell: {},
    ModifierInfiltrate: {},
    ModifierKillWatch: {},
    ModifierMyAttackWatch: {},
    ModifierMyGeneralDamagedWatch: {},
    ModifierMyMinionOrGeneralDamagedWatch: {},
    ModifierOpeningGambit: {},
    ModifierOpponentSummonWatch: {},
    ModifierPortal: {},
    ModifierProvoke: {
      ModifierFX: [
        {
          spriteIdentifier: RSX.decal_provoke.img,
          antiAlias: true,
          looping: true,
          colorByOwner: true,
          scale: 1,
          opacity: 200,
          pulseScaleMin: 0,
          zOrder: -1,
          offset: { x: 0, y: -45 },
          xyzRotation: { x: 26, y: 0, z: 0 },
          blendSrc: 'SRC_ALPHA',
          blendDst: 'ONE',
        },
      ],
    },
    ModifierProvoked: {
      ModifierFX: [
        {
          spriteIdentifier: RSX.decal_provoked.img,
          antiAlias: true,
          looping: true,
          colorByOwner: true,
          scale: 1,
          opacity: 200,
          pulseScaleMin: 1,
          pulseScaleMax: 0,
          zOrder: -1,
          offset: { x: 0, y: -45 },
          xyzRotation: { x: 26, y: 0, z: 0 },
          blendSrc: 'SRC_ALPHA',
          blendDst: 'ONE',
        },
      ],
    },
    ModifierRanged: {},
    ModifierRebirth: {},
    ModifierShadowCreep: {},
    ModifierSpellWatch: {},
    ModifierStartTurnWatch: {},
    ModifierStrikeback: {},
    ModifierStunned: {
      ModifierFX: [
        {
          spriteIdentifier: RSX.decal_stunned.img,
          antiAlias: true,
          looping: true,
          colorByOwner: true,
          scale: 1,
          opacity: 200,
          zOrder: -1,
          offset: { x: 0, y: -45 },
          xyzRotation: { x: 26, y: 0, z: 90 },
          xyzRotationPerSecond: { x: 0, y: 0, z: 45 },
          blendSrc: 'SRC_ALPHA',
          blendDst: 'ONE',
        },
      ],
    },
    ModifierStunnedVanar: {
      ModifierAppliedFX: [
        {
          spriteIdentifier: RSX.fx_flashfreeze_appear.name,
          duration: 0.75,
          zOrder: 1,
          fadeInDurationPct: 0.2,
          fadeOutDurationPct: 0.35,
          offset: { x: 0, y: 16 },
        },
      ],
      ModifierFX: [
        {
          spriteIdentifier: RSX.fx_flashfreeze_idle.name,
          zOrder: 1,
          looping: true,
          offset: { x: 0, y: 16 },
        },
      ],
      ModifierRemovedFX: [
        {
          spriteIdentifier: RSX.fx_flashfreeze_disappear.name,
          zOrder: 1,
          duration: 0.75,
          fadeInDurationPct: 0.2,
          fadeOutDurationPct: 0.35,
          offset: { x: 0, y: 16 },
        },
      ],
    },
    ModifierSummonWatch: {},
    ModifierTakeDamageWatch: {},
    ModifierTransformed: {},
    ModifierWall: {},
    ModifierZeal: {},
    ModifierZealAttack: {},
    ModifierZealAttackAndHealth: {},
    ModifierZealDoubleAttack: {},
    ModifierZealHeal: {},
    ModifierZealRanged: {},
    ModifierZealed: {
      ModifierFX: [
        {
          spriteIdentifier: RSX.decal_banded.img,
          antiAlias: true,
          looping: true,
          colorByOwner: true,
          scale: 1,
          opacity: 200,
          zOrder: -1,
          offset: { x: 0, y: -45 },
          xyzRotation: { x: 26, y: 0, z: 0 },
          xyzRotationPerSecond: { x: 0, y: 0, z: 45 },
          blendSrc: 'SRC_ALPHA',
          blendDst: 'ONE',
        },
      ],
    },
    ModifierZealedDoubleAttack: {},
    ModifierZealedHeal: {
      ModifierTriggeredSourceFX: [
        {
          type: 'Light',
          radius: 360,
          opacity: 200,
          duration: 0.75,
          offset: { x: 0, y: -30 },
          color: { r: 0, g: 255, b: 127 },
        },
      ],
    },
    ModifierZealedRanged: {},
    ModifierOverwatch: {
      ModifierFX: [
        {
          spriteIdentifier: RSX.decal_banded.img,
          antiAlias: true,
          looping: true,
          colorByOwner: true,
          scale: 1,
          opacity: 200,
          zOrder: -1,
          offset: { x: 0, y: -45 },
          xyzRotation: { x: 26, y: 0, z: 0 },
          xyzRotationPerSecond: { x: 0, y: 0, z: 45 },
          blendSrc: 'SRC_ALPHA',
          blendDst: 'ONE',
        },
      ],
    },
    ModifierDoomed: {
      ModifierFX: [
        {
          spriteIdentifier: RSX.fx_Doomed.name,
          offset: { x: 0, y: 55 },
          zOrder: 1,
          looping: true,
        },
      ],
    },
    ModifierDoomed3: {
      ModifierFX: [
        {
          spriteIdentifier: RSX.fx_Doomed3.name,
          zOrder: 1,
          looping: true,
          offset: { x: 0, y: 55 },
        },
      ],
    },
    ModifierDoomed2: {
      ModifierFX: [
        {
          spriteIdentifier: RSX.fx_Doomed2.name,
          zOrder: 1,
          looping: true,
          offset: { x: 0, y: 55 },
        },
      ],
    },
    ModifierInfest: {
      ModifierFX: [
        {
          spriteIdentifier: RSX.fx_deathplagueicon.name,
          zOrder: 1,
          looping: true,
          offset: { x: 0, y: -10 },
        },
      ],
    },
    ModifierEmblem: {
      ModifierAppliedFX: [
        {
          spriteIdentifier: RSX.fxSummonMythron.name,
          offset: { x: 0, y: 80 },
          autoZOrderOffset: -0.5,
        },
      ],
    },
  },
  Game: {
    CardDrawFX: [
      { spriteIdentifier: RSX.fx_carddraw.name, scale: 1 },
    ],
    CardRemoveFX: [
      {
        spriteIdentifier: RSX.fxCrossSlash.name,
        offset: { x: 0, y: 40 },
      },
      { spriteIdentifier: RSX.fxBladestorm.name },
    ],
    CardBurnFX: [
      { plistFile: RSX.ptcl_fireexplosion.plist, type: 'Particles' },
    ],
    CardLegendaryPlayFX: [
      {
        spriteIdentifier: RSX.fxSummonLegendary.name,
        offset: { x: 0, y: 80 },
        autoZOrderOffset: -0.5,
      },
    ],
  },
};
module.exports = FX;
