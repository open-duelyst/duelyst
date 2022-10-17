const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../'));
require('coffeescript/register');
const { expect } = require('chai');
const Promise = require('bluebird');
const _ = require('underscore');
const Logger = require('../../../../app/common/logger.coffee');
const SDK = require('../../../../app/sdk.coffee');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('RankFactory', () => {
  describe('starsNeededToAdvanceRank()', () => {
    it('requires 1 star up to rank 25', () => {
      for (let i = 30; i > 25; i--) {
        expect(SDK.RankFactory.starsNeededToAdvanceRank(i)).to.equal(1);
      }
    });

    it('requires 2 stars from 25 up to rank 20', () => {
      for (let i = 25; i > 20; i--) {
        expect(SDK.RankFactory.starsNeededToAdvanceRank(i)).to.equal(2);
      }
    });

    it('requires 3 stars from 20 up to rank 15', () => {
      for (let i = 20; i > 15; i--) {
        expect(SDK.RankFactory.starsNeededToAdvanceRank(i)).to.equal(3);
      }
    });

    it('requires 4 stars from 15 up to rank 10', () => {
      for (let i = 15; i > 10; i--) {
        expect(SDK.RankFactory.starsNeededToAdvanceRank(i)).to.equal(4);
      }
    });

    it('requires 5 stars from 10 up to rank 5', () => {
      for (let i = 10; i > 5; i--) {
        expect(SDK.RankFactory.starsNeededToAdvanceRank(i)).to.equal(5);
      }
    });

    it('requires 5 stars from 5 up to rank 0', () => {
      for (let i = 5; i > 0; i--) {
        expect(SDK.RankFactory.starsNeededToAdvanceRank(i)).to.equal(5);
      }
    });

    it('returns undefined if you ask for stars needed to advance rank 0', () => {
      expect(SDK.RankFactory.starsNeededToAdvanceRank(0)).to.equal(undefined);
    });
  });

  describe('canLoseStars()', () => {
    it('can NOT lose stars on ranks 30 to 21', () => {
      for (let i = 30; i > 20; i--) {
        expect(SDK.RankFactory.canLoseStars(i, 1)).to.equal(false);
      }
    });

    it('can NOT lose stars on rank 20 with 0 stars', () => {
      expect(SDK.RankFactory.canLoseStars(20, 0)).to.equal(false);
    });

    it('can lose stars on ranks above 20 with 1 stars', () => {
      for (let i = 20; i >= 0; i--) {
        expect(SDK.RankFactory.canLoseStars(i, 1)).to.equal(true);
      }
    });

    it('can drop down ranks within SILVER division', function () {
      for (let i = SDK.RankDivisionLookup.Silver - 1; i > SDK.RankDivisionLookup.Gold; i--) {
        expect(SDK.RankFactory.canLoseStars(this, 0)).to.equal(true);
      }
    });

    it('can drop down ranks within GOLD division', function () {
      for (let i = SDK.RankDivisionLookup.Gold - 1; i > SDK.RankDivisionLookup.Diamond; i--) {
        expect(SDK.RankFactory.canLoseStars(this, 0)).to.equal(true);
      }
    });

    it('can drop down ranks within DIAMOND division', function () {
      for (let i = SDK.RankDivisionLookup.Diamond - 1; i > SDK.RankDivisionLookup.Elite; i--) {
        expect(SDK.RankFactory.canLoseStars(this, 0)).to.equal(true);
      }
    });

    it('can NOT lose stars to drop from GOLD (10) to SILVER', () => {
      expect(SDK.RankFactory.canLoseStars(10, 0)).to.equal(false);
    });

    it('can NOT lose stars to drop from DIAMOND (5) to GOLD', () => {
      expect(SDK.RankFactory.canLoseStars(5, 0)).to.equal(false);
    });

    it('can NOT lose stars to drop from ELITE (0) to DIAMOND', () => {
      expect(SDK.RankFactory.canLoseStars(0, 0)).to.equal(false);
    });
  });

  describe('areWinStreaksEnabled()', () => {
    it('can earn win streaks on ranks 25 to 6', () => {
      for (let i = 25; i >= 6; i--) {
        expect(SDK.RankFactory.areWinStreaksEnabled(i)).to.equal(true);
      }
    });

    it('can NOT earn win streaks on ranks 30 to 26', () => {
      for (let i = 30; i >= 26; i--) {
        expect(SDK.RankFactory.areWinStreaksEnabled(i)).to.equal(false);
      }
    });

    it('can NOT earn win streaks on ranks 5 to 0', () => {
      for (let i = 5; i >= 0; i--) {
        expect(SDK.RankFactory.areWinStreaksEnabled(i)).to.equal(false);
      }
    });
  });

  describe('rankForNewSeason()', () => {
    // These numbers should match the design doc here:
    // https://docs.google.com/spreadsheets/d/1R1Sx0iOoT8ON1j5_B2OpmDusvdRsJNYmIVDJc-aMDq0/

    it('Remain at 30 if ending the season at 30', () => {
      expect(SDK.RankFactory.rankForNewSeason(30).rank).to.equal(30);
    });

    it('Drop to Rank 24 with 1 star if ending the season at 20', () => {
      expect(SDK.RankFactory.rankForNewSeason(20).rank).to.equal(24);
      expect(SDK.RankFactory.rankForNewSeason(20).stars).to.equal(1);
    });

    it('Drop to Rank 21 with 0 stars if ending the season at 15', () => {
      expect(SDK.RankFactory.rankForNewSeason(15).rank).to.equal(21);
      expect(SDK.RankFactory.rankForNewSeason(15).stars).to.equal(0);
    });

    it('Drop to Rank 19 with 0 stars if ending the season at 10', () => {
      expect(SDK.RankFactory.rankForNewSeason(10).rank).to.equal(19);
      expect(SDK.RankFactory.rankForNewSeason(10).stars).to.equal(0);
    });

    it('Drop to Rank 11 with 0 stars if ending the season at 5', () => {
      expect(SDK.RankFactory.rankForNewSeason(5).rank).to.equal(11);
      expect(SDK.RankFactory.rankForNewSeason(5).stars).to.equal(0);
    });

    it('Drop to Rank 11 with 0 stars if ending the season at 0', () => {
      expect(SDK.RankFactory.rankForNewSeason(0).rank).to.equal(11);
      expect(SDK.RankFactory.rankForNewSeason(0).stars).to.equal(0);
    });
  });

  describe('totalStarsRequiredForRank()', () => {
    it('expect rank 30 to require 0 stars', () => {
      const stars = SDK.RankFactory.totalStarsRequiredForRank(30);
      expect(stars).to.equal(0);
    });

    it('expect rank 20 to require 15 stars', () => {
      const stars = SDK.RankFactory.totalStarsRequiredForRank(20);
      expect(stars).to.equal(15);
    });

    it('expect rank 10 to require 50 stars', () => {
      const stars = SDK.RankFactory.totalStarsRequiredForRank(10);
      expect(stars).to.equal(50);
    });

    it('expect rank 0 to require 100 stars', () => {
      const stars = SDK.RankFactory.totalStarsRequiredForRank(0);
      expect(stars).to.equal(100);
    });
  });

  describe('updateRankDataWithGameOutcome()', () => {
    it('adds one star for a win with no streak', () => {
      // use rank 1 because lower ranks COULD increase with just 1 star
      const rankData = {
        rank: 1,
        stars: 0,
        win_streak: 0,
      };

      const resultingRankData = SDK.RankFactory.updateRankDataWithGameOutcome(rankData, true);

      // we should have gottan an object back
      expect(resultingRankData).to.exist
        .and.to.be.a('object');

      // should have earned a star
      expect(resultingRankData.stars).to.be.a('number')
        .and.to.equal(1);

      // rank should not change
      expect(resultingRankData.rank).to.be.a('number')
        .and.to.equal(1);
    });

    it('ranks up by 1 for 1 win (no streak) up to rank 25', () => {
      // 30-25 we should be getting higher with 1 win
      for (let i = 30; i > 25; i--) {
        // use rank 1 because lower ranks COULD increase with just 1 star
        const rankData = {
          rank: i,
          stars: 0,
          win_streak: 0,
        };

        const resultingRankData = SDK.RankFactory.updateRankDataWithGameOutcome(rankData, true);

        // we should have gottan an object back
        expect(resultingRankData).to.exist
          .and.to.be.a('object');

        // should have earned a star but stars should be 0 since your rank went up
        expect(resultingRankData.delta.stars).to.be.a('number')
          .and.to.equal(1);
        expect(resultingRankData.stars).to.be.a('number')
          .and.to.equal(0);

        // rank should go up by 1
        expect(resultingRankData.rank).to.be.a('number')
          .and.to.equal(i - 1);
      }
    });

    it('does NOT rank up for 1 win (no streak) at or above rank 25', () => {
      // 25 to 0 we should NOT be getting higher with 1 win
      for (let i = 25; i >= 1; i--) {
        // use rank 1 because lower ranks COULD increase with just 1 star
        const rankData = {
          rank: i,
          stars: 0,
          win_streak: 0,
        };

        const resultingRankData = SDK.RankFactory.updateRankDataWithGameOutcome(rankData, true);

        // we should have gottan an object back
        expect(resultingRankData).to.exist
          .and.to.be.a('object');

        // rank should NOT go up by 1
        expect(resultingRankData.rank).to.be.a('number')
          .and.to.equal(i);

        // should have earned a star
        expect(resultingRankData.stars).to.be.a('number')
          .and.to.equal(1);
      }
    });

    it('earns 2 stars for a win with a current win_streak of 2 or higher at ranks 25 to 6 (inclusive)', () => {
      for (let i = 6; i <= 25; i++) {
        const rankData = {
          rank: i,
          stars: 0,
          win_streak: 2,
        };

        const resultingRankData = SDK.RankFactory.updateRankDataWithGameOutcome(rankData, true);

        // we should have gottan an object back
        expect(resultingRankData).to.exist
          .and.to.be.a('object');

        // Expect result object to have a rank and stars
        expect(resultingRankData.rank).to.be.a('number');
        expect(resultingRankData.stars).to.be.a('number');

        // should have earned 2 stars
        const previousTotalStars = SDK.RankFactory.totalStarsRequiredForRank(i);
        const starsAfterOutcome = SDK.RankFactory.totalStarsRequiredForRank(resultingRankData.rank) + resultingRankData.stars;
        expect(starsAfterOutcome).to.equal(previousTotalStars + 2);

        // Expect win streak to have advanced
        expect(resultingRankData.win_streak).to.be.a('number')
          .and.to.equal(3);
      }
    });

    it('Do not earn a win streak star bonus for wins at ranks 30 to 26 (inclusive)', () => {
      for (let i = 26; i <= 30; i++) {
        const rankData = {
          rank: i,
          stars: 0,
          win_streak: 2,
        };

        const resultingRankData = SDK.RankFactory.updateRankDataWithGameOutcome(rankData, true);

        // we should have gottan an object back
        expect(resultingRankData).to.exist.and.to.be.a('object');

        // Expect result object to have a rank and stars
        expect(resultingRankData.rank).to.be.a('number');
        expect(resultingRankData.stars).to.be.a('number');

        // should have earned 2 stars
        const previousTotalStars = SDK.RankFactory.totalStarsRequiredForRank(i);
        const starsAfterOutcome = SDK.RankFactory.totalStarsRequiredForRank(resultingRankData.rank) + resultingRankData.stars;
        expect(starsAfterOutcome).to.equal(previousTotalStars + 1);
      }
    });

    it('Do not earn a win streak star bonus for wins at ranks 5 to 1 (inclusive)', () => {
      for (let i = 1; i <= 5; i++) {
        const rankData = {
          rank: i,
          stars: 0,
          win_streak: 2,
        };

        const resultingRankData = SDK.RankFactory.updateRankDataWithGameOutcome(rankData, true);

        // we should have gottan an object back
        expect(resultingRankData).to.exist
          .and.to.be.a('object');

        // Expect result object to have a rank and stars
        expect(resultingRankData.rank).to.be.a('number');
        expect(resultingRankData.stars).to.be.a('number');

        // should have earned 2 stars
        const previousTotalStars = SDK.RankFactory.totalStarsRequiredForRank(i);
        const starsAfterOutcome = SDK.RankFactory.totalStarsRequiredForRank(resultingRankData.rank) + resultingRankData.stars;
        expect(starsAfterOutcome).to.equal(previousTotalStars + 1);
      }
    });

    it('does not lose stars, rank, or win streak for draws', () => {
      // use rank 1 because lower ranks COULD increase with just 1 star
      const rankData = {
        rank: 15,
        stars: 1,
        win_streak: 2,
      };

      const resultingRankData = SDK.RankFactory.updateRankDataWithGameOutcome(rankData, false, true);

      // we should have gottan an object back
      expect(resultingRankData).to.exist
        .and.to.be.a('object');

      // rank should not change
      expect(resultingRankData.win_streak).to.be.a('number')
        .and.to.equal(2);

      // should have earned a star
      expect(resultingRankData.stars).to.be.a('number')
        .and.to.equal(1);

      // should have earned a star
      expect(resultingRankData.rank).to.be.a('number')
        .and.to.equal(15);
    });

    it('resets win streaks at border ranks for divisions (20,10,5)', () => {
      //
      // RANK 20
      //
      let rankData = {
        rank: 20,
        stars: 0,
        win_streak: 1,
      };

      let resultingRankData = SDK.RankFactory.updateRankDataWithGameOutcome(rankData, false);

      expect(resultingRankData.rank).to.be.a('number')
        .and.to.equal(20);

      // win streak should be 0
      expect(resultingRankData.win_streak).to.be.a('number')
        .and.to.equal(0);

      //
      // RANK 10
      //
      rankData = {
        rank: 10,
        stars: 0,
        win_streak: 1,
      };

      resultingRankData = SDK.RankFactory.updateRankDataWithGameOutcome(rankData, false);

      expect(resultingRankData.rank).to.be.a('number')
        .and.to.equal(10);

      // win streak should be 0
      expect(resultingRankData.win_streak).to.be.a('number')
        .and.to.equal(0);

      //
      // RANK 5
      //
      rankData = {
        rank: 5,
        stars: 0,
        win_streak: 1,
      };

      resultingRankData = SDK.RankFactory.updateRankDataWithGameOutcome(rankData, false);

      expect(resultingRankData.rank).to.be.a('number')
        .and.to.equal(5);

      // win streak should be 0
      expect(resultingRankData.win_streak).to.be.a('number')
        .and.to.equal(0);
    });

    it('begins losing stars at rank 20', () => {
      // use rank 1 because lower ranks COULD increase with just 1 star
      const rankData = {
        rank: 20,
        stars: 1,
        win_streak: 0,
      };

      const resultingRankData = SDK.RankFactory.updateRankDataWithGameOutcome(rankData, false);

      // we should have gottan an object back
      expect(resultingRankData).to.exist
        .and.to.be.a('object');

      // we should have gottan an object back
      expect(resultingRankData.rank).to.be.a('number')
        .and.to.equal(20);

      // should have earned a star
      expect(resultingRankData.stars).to.be.a('number')
        .and.to.equal(0);
    });

    it('does NOT drop you rank for losing stars at rank 20 (start of SILVER) when you have 0 stars left', () => {
      // use rank 1 because lower ranks COULD increase with just 1 star
      const rankData = {
        rank: 20,
        stars: 0,
        stars_required: SDK.RankFactory.starsNeededToAdvanceRank(20),
        win_streak: 0,
      };

      const resultingRankData = SDK.RankFactory.updateRankDataWithGameOutcome(rankData, false);

      // we should have gottan an object back
      expect(resultingRankData).to.exist
        .and.to.be.a('object');

      // we should have gottan an object back
      expect(resultingRankData.rank).to.be.a('number')
        .and.to.equal(20);

      // should have stars equal to previous level's requirement
      expect(resultingRankData.stars).to.be.a('number')
        .and.to.equal(0);

      // should have previous level's star requirement
      expect(resultingRankData.stars_required).to.be.a('number')
        .and.to.equal(SDK.RankFactory.starsNeededToAdvanceRank(20));
    });

    it('does NOT drop you rank for losing stars at rank 21 (in BRONZE) when you have 0 stars left', () => {
      // use rank 1 because lower ranks COULD increase with just 1 star
      const rankData = {
        rank: 21,
        stars: 0,
        win_streak: 0,
      };

      const resultingRankData = SDK.RankFactory.updateRankDataWithGameOutcome(rankData, false);

      // we should have gottan an object back
      expect(resultingRankData).to.exist
        .and.to.be.a('object');

      // we should have gottan an object back
      expect(resultingRankData.rank).to.be.a('number')
        .and.to.equal(21);

      // should have stars equal to previous level's requirement
      expect(resultingRankData.stars).to.be.a('number')
        .and.to.equal(0);
    });

    it('drops you rank for losing stars at rank 19 when you have 0 stars left', () => {
      // use rank 1 because lower ranks COULD increase with just 1 star
      const rankData = {
        rank: 19,
        stars: 0,
        win_streak: 0,
      };

      const resultingRankData = SDK.RankFactory.updateRankDataWithGameOutcome(rankData, false);

      // we should have gottan an object back
      expect(resultingRankData).to.exist
        .and.to.be.a('object');

      // we should have gottan an object back
      expect(resultingRankData.rank).to.be.a('number')
        .and.to.equal(20);

      // should have stars equal to previous level's requirement
      expect(resultingRankData.stars).to.be.a('number')
        .and.to.equal(SDK.RankFactory.starsNeededToAdvanceRank(20));

      // should have previous level's star requirement
      expect(resultingRankData.stars_required).to.be.a('number')
        .and.to.equal(SDK.RankFactory.starsNeededToAdvanceRank(20));
    });

    it('ignores any wins at rank 0 (KUMITE)', () => {
      // kumite rank
      const rankData = {
        rank: 0,
        stars: 0,
        win_streak: 0,
      };

      const resultingRankData = SDK.RankFactory.updateRankDataWithGameOutcome(rankData, true);

      // we should have gottan an object back
      expect(resultingRankData).to.exist
        .and.to.be.a('object');

      // rank should not change
      expect(resultingRankData.win_streak).to.be.a('number')
        .and.to.equal(0);

      // should have NOT earned a star
      expect(resultingRankData.stars).to.be.a('number')
        .and.to.equal(0);
    });

    it('losing at rank 0 (KUMITE) does NOT drop you to rank 1', () => {
      // kumite rank
      const rankData = {
        rank: 0,
        stars: 0,
        win_streak: 0,
      };

      const resultingRankData = SDK.RankFactory.updateRankDataWithGameOutcome(rankData, false);

      // we should have gottan an object back
      expect(resultingRankData).to.exist
        .and.to.be.a('object');

      // rank should be 1
      expect(resultingRankData.rank).to.be.a('number')
        .and.to.equal(0);

      // win streaks should be 0
      expect(resultingRankData.win_streak).to.be.a('number')
        .and.to.equal(0);

      // win streaks should be 0
      expect(resultingRankData.stars).to.be.a('number')
        .and.to.equal(0);
    });
  });
});
