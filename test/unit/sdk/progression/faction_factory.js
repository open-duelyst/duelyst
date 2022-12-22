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
  describe('starterDeckForFactionLevel()', () => {
    it('expect 28 cards at level 0', () => {
      expect(SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction1, 0).length).to.equal(28);
    });

    it('expect 31 cards at level 1', () => {
      expect(SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction1, 1).length).to.equal(31);
    });

    it('expect 34 cards at level 3', () => {
      expect(SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction1, 3).length).to.equal(34);
    });

    it('expect 37 cards at level 6', () => {
      expect(SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction1, 6).length).to.equal(37);
    });

    it('expect 40 cards at level 9', () => {
      expect(SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction1, 9).length).to.equal(40);
    });

    /* Test disabled: Basics are no longer unlockable.
    it('expect 12 total unlockable basic cards in starter deck at level 9', () => {
      let unlockableBasicCount = 0;
      const deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction1, 9);
      for (let i = 0; i < deck.length; i++) {
        const cardData = deck[i];
        const cardId = cardData.id;
        const sdkCard = SDK.CardFactory.cardForIdentifier(cardId, SDK.GameSession.current());
        if (sdkCard.getIsUnlockableBasic()) unlockableBasicCount++;
      }
      expect(unlockableBasicCount).to.equal(12);
    });
    */
  });
});
