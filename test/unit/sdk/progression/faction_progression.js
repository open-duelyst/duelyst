const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../'));
require('coffeescript/register');
const { expect } = require('chai');
const Promise = require('bluebird');
const _ = require('underscore');
const config = require('../../../../config/config');
const Logger = require('../../../../app/common/logger.coffee');
const SDK = require('../../../../app/sdk.coffee');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('faction progression', () => {
  describe('levelForXP()', () => {
    it('expect level 0 at 0-6 XP', () => {
      expect(SDK.FactionProgression.levelForXP(0)).to.equal(0);
      expect(SDK.FactionProgression.levelForXP(6)).to.equal(0);
    });

    it('expect level 1 at 7-13 XP', () => {
      expect(SDK.FactionProgression.levelForXP(7)).to.equal(1);
      expect(SDK.FactionProgression.levelForXP(13)).to.equal(1);
    });

    it('expect level 2 at 14-20 XP', () => {
      expect(SDK.FactionProgression.levelForXP(14)).to.equal(2);
      expect(SDK.FactionProgression.levelForXP(20)).to.equal(2);
    });

    it('expect level 7 at 86-104 XP', () => {
      expect(SDK.FactionProgression.levelForXP(86)).to.equal(7);
      expect(SDK.FactionProgression.levelForXP(104)).to.equal(7);
    });
  });

  describe('deltaXPForLevel()', () => {
    it('expect level 0-1 to require 7 XP', () => {
      expect(SDK.FactionProgression.deltaXPForLevel(1)).to.equal(7);
    });

    it('expect level 1-2 to require 7 XP', () => {
      expect(SDK.FactionProgression.deltaXPForLevel(2)).to.equal(7);
    });

    it('expect level 2-3 to require 7 XP', () => {
      expect(SDK.FactionProgression.deltaXPForLevel(3)).to.equal(7);
    });

    it('expect level 3-4 to require 11 XP', () => {
      expect(SDK.FactionProgression.deltaXPForLevel(4)).to.equal(11);
    });

    it('expect level 6-7 to require 20 XP', () => {
      expect(SDK.FactionProgression.deltaXPForLevel(7)).to.equal(20);
    });
  });

  describe('totalXPForLevel()', () => {
    it('expect level 2 to require 14 total XP', () => {
      expect(SDK.FactionProgression.totalXPForLevel(2)).to.equal(14);
    });

    it('expect level 5 to require 45 total XP', () => {
      expect(SDK.FactionProgression.totalXPForLevel(5)).to.equal(45);
    });
  });

  describe('hasLeveledUp()', () => {
    it('expect that gaining level 10XP on top of 0XP will level up to 1', () => {
      const xpBefore = 0;
      const xpEarned = 10;
      expect(SDK.FactionProgression.hasLeveledUp(xpBefore + xpEarned, xpEarned)).to.equal(true);
      expect(SDK.FactionProgression.levelForXP(xpBefore + xpEarned)).to.equal(1);
    });

    it('expect that gaining level 10XP on top of 35XP will level up to 5', () => {
      const xpBefore = 35;
      const xpEarned = 10;
      expect(SDK.FactionProgression.hasLeveledUp(xpBefore + xpEarned, xpEarned)).to.equal(true);
      expect(SDK.FactionProgression.levelForXP(xpBefore + xpEarned)).to.equal(5);
    });
  });

  describe('rewardDataForLevel()', () => {
    it('expect a card reward for Lyonar level 1', () => {
      const reward = SDK.FactionProgression.rewardDataForLevel(SDK.Factions.Faction1, 1);
      expect(reward).to.exist;
      expect(reward.cards).to.exist;
      expect(reward.cards[0].id).to.exist;
      expect(reward.cards[0].count).to.equal(3);
    });

    it('expect a prismatic card reward for Lyonar level 13', () => {
      const reward = SDK.FactionProgression.rewardDataForLevel(SDK.Factions.Faction1, 13);
      expect(reward).to.exist;
      expect(SDK.Cards.getIsPrismaticCardId(reward.cards[0].id)).to.equal(true);
    });

    it('expect a prismatic general card reward for Lyonar level 49', () => {
      const reward = SDK.FactionProgression.rewardDataForLevel(SDK.Factions.Faction1, 49);
      expect(reward).to.exist;
      expect(reward.cards[0].id).to.equal(SDK.Cards.Faction1.AltGeneral + SDK.Cards.Prismatic);
    });
  });
});
