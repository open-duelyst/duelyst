var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../'))
require('coffee-script/register')
var chai = require('chai');
chai.config.includeStack = true;
var expect = chai.expect;
var DuelystFirebase = require('../../../server/lib/duelyst_firebase_module.coffee');
var Errors = require('../../../server/lib/custom_errors.coffee');
var UsersModule = require('../../../server/lib/data_access/users.coffee');
var RankModule = require('../../../server/lib/data_access/rank.coffee');
var SyncModule = require('../../../server/lib/data_access/sync.coffee');
var FirebasePromises = require('../../../server/lib/firebase_promises.coffee');
var generatePushId = require('../../../app/common/generate_push_id');
var config = require('../../../config/config.js');
var Promise = require('bluebird');
var Logger = require('../../../app/common/logger');
var sinon = require('sinon');
var _ = require('underscore');
var SDK = require('../../../app/sdk');
var moment = require('moment');
var knex = require('../../../server/lib/data_access/knex');

var SRankManager = require('../../../server/redis/').SRankManager;

// disable the logger
// for cleaner test output
Logger.enabled = Logger.enabled && false;

describe("rank module", function() {

	var userId = null;
	this.timeout(25000);

	var userIdsByUsername = {};
	var createOrWipeUser = function (userEmail,userName,initialRank,rankStartingAt) {
		if (rankStartingAt == null) {
			rankStartingAt = moment.utc().startOf("month").toDate()
		}

		return UsersModule.createNewUser(userEmail, userName, 'hash', 'kumite14')
			.bind({})
			.then(function (userIdCreated) {
				this.userId = userIdCreated;
				Logger.module("UNITTEST").log("created user ", userIdCreated);
			}).catch(Errors.AlreadyExistsError, function (error) {
				Logger.module("UNITTEST").log("existing user");
				return UsersModule.userIdForEmail(userEmail)
					.bind(this)
					.then(function (userIdExisting) {
						this.userId = userIdExisting;
						Logger.module("UNITTEST").log("existing user retrieved", userIdExisting);
						return SyncModule.wipeUserData(userIdExisting);
					}).then(function () {
						Logger.module("UNITTEST").log("existing user data wiped", this.userId);
					})
			}).then(function () {
				var initialRankData = {
					rank: initialRank,
					stars: 0,
					stars_required: SDK.RankFactory.starsNeededToAdvanceRank(initialRank)
				};
				return knex('users').where('id', this.userId).update({
					rank: initialRankData.rank,
					rank_stars: initialRankData.stars,
					rank_stars_required: initialRankData.stars_required,
					rank_starting_at: rankStartingAt,
					rank_created_at: rankStartingAt,
					rank_updated_at: rankStartingAt,
					rank_is_unread: true
				});
			}).then(function () {
				userIdsByUsername[userName] = this.userId;
				return Promise.resolve(this.userId)
			});
	};

	// before cleanup to check if user already exists and delete
	before(function(){
		this.timeout(25000);

		SRankManager.unitTestMode = true;

		Logger.module("UNITTEST").log("creating user");
		return UsersModule.createNewUser('unit-test@counterplay.co','unittest','hash','kumite14')
		.then(function(userIdCreated){
			Logger.module("UNITTEST").log("created user ",userIdCreated);
			userId = userIdCreated;
		}).catch(Errors.AlreadyExistsError,function(error){
			Logger.module("UNITTEST").log("existing user");
			return UsersModule.userIdForEmail('unit-test@counterplay.co').then(function(userIdExisting){
				Logger.module("UNITTEST").log("existing user retrieved",userIdExisting);
				userId = userIdExisting;
				return SyncModule.wipeUserData(userIdExisting);
			}).then(function(){
				Logger.module("UNITTEST").log("existing user data wiped",userId);
			})
		})
	});

	// after cleanup
	after(function(){
		SRankManager.unitTestMode = false;
	});

	describe("userNeedsSeasonStartRanking", function() {
		it('expect to be TRUE when there is no rank data', function() {
			return RankModule.userNeedsSeasonStartRanking(userId)
			.then(function(value){
				expect(value).to.equal(true);
			});
		});
	});

	describe("_isSeasonTimestampExpired", function() {

		it('expect days this month to NOT be expired',function(){
			var now = moment().utc();
			expect(RankModule._isSeasonTimestampExpired(now.valueOf())).to.equal(false);
			expect(RankModule._isSeasonTimestampExpired(now.endOf('month').valueOf())).to.equal(false);
			expect(RankModule._isSeasonTimestampExpired(now.startOf('month').valueOf())).to.equal(false);
		})

		it('expect days last month to be expired',function(){
			var nowLastMonth = moment().utc().subtract(1,'month');
			expect(RankModule._isSeasonTimestampExpired(nowLastMonth.valueOf())).to.equal(true);
			expect(RankModule._isSeasonTimestampExpired(nowLastMonth.endOf('month').valueOf())).to.equal(true);
			expect(RankModule._isSeasonTimestampExpired(nowLastMonth.startOf('month').valueOf())).to.equal(true);
		})
	});

	describe("cycleUserSeasonRanking()", function() {

		var currentRankData = null;

		it('expect to update and return rank data', function() {
			return RankModule.cycleUserSeasonRanking(userId)
			.then(function(rankData){
				expect(rankData).to.exist;
				currentRankData = rankData;
			})
		});

		it('expect rank data to be correctly set in DB and Firebase', function() {
			return DuelystFirebase.connect().getRootRef()
			.bind({})
			.then(function(rootRef){
				return Promise.all([
					knex.first().from('users').where('id',userId),
					FirebasePromises.once(rootRef.child("user-ranking").child(userId).child("current"),"value")
				])
			}).spread(function(userRow,rankSnapshot){
				expect(userRow).to.exist;
				expect(rankSnapshot.val()).to.exist;
				expect(userRow.rank).to.equal(currentRankData.rank);
				expect(userRow.rank).to.equal(rankSnapshot.val().rank);
			})
		});

		it('expect NO update if current season rank cycled again', function() {
			return RankModule.cycleUserSeasonRanking(userId)
			.then(function(rankData){
				expect(rankData).to.exist;
				expect(moment.utc(rankData.updated_at).valueOf()).to.equal(moment.utc(currentRankData.updated_at).valueOf());
			})
		});

		it('expect to update rank data with force update', function() {
			return RankModule.cycleUserSeasonRanking(userId, true)
			.then(function(rankData){
				expect(rankData).to.exist;
				expect(moment.utc(rankData.created_at).valueOf()).to.not.equal(moment.utc(currentRankData.created_at).valueOf());
				currentRankData = rankData;
			})
		});

		it('expect new rank when a season passes', function() {
			var systemTime = moment().utc().add(1,'month');
			return RankModule.cycleUserSeasonRanking(userId, false, systemTime)
			.then(function(rankData){
				expect(rankData).to.exist;
				expect(moment.utc(rankData.created_at).valueOf()).to.not.equal(moment.utc(currentRankData.created_at).valueOf());
				expect(moment.utc(rankData.starting_at).valueOf()).to.not.equal(moment.utc(currentRankData.starting_at).valueOf());
			});
		});

		it('expect the most recent rank in the DB and Firebase history to exist and to be unread and for the '+moment().utc().format("MMMM YYYY")+' season', function() {
			return DuelystFirebase.connect().getRootRef()
			.bind({})
			.then(function(rootRef){
				return Promise.all([
					knex.first().from('user_rank_history').where('user_id',userId),
				 	FirebasePromises.once(rootRef.child("user-ranking").child(userId).child("history").limitToLast(1),"child_added"),
				])
			}).spread(function(historyRow,historySnapshot){
				var expectedSeasonTimestamp = moment().utc().startOf('month').valueOf()

				var historyRankData = historySnapshot.val()
				expect(historyRankData).to.exist;
				expect(moment.utc(historyRankData.starting_at).valueOf()).to.equal(expectedSeasonTimestamp);
				expect(historyRankData.is_unread).to.equal(true);

				expect(historyRow).to.exist;
				expect(moment.utc(historyRow.starting_at).valueOf()).to.equal(expectedSeasonTimestamp);
				expect(historyRow.is_unread).to.equal(true);
			});
		});

		it('expect the top rank record in the DB and Firebase to exist and to be unread and for the '+moment().utc().format("MMMM YYYY")+' season', function() {
			return DuelystFirebase.connect().getRootRef()
			.bind({})
			.then(function(rootRef){
				return Promise.all([
					knex.first().from('users').where('id',userId),
				 	FirebasePromises.once(rootRef.child("user-ranking").child(userId).child("top"),"value")
				])
			}).spread(function(userRow,topRankSnapshot){
				var expectedSeasonTimestamp = moment().utc().startOf('month').valueOf()

				var topRankData = topRankSnapshot.val();
				expect(topRankData).to.exist;
				expect(moment.utc(topRankData.starting_at).valueOf()).to.equal(expectedSeasonTimestamp);
				expect(topRankData.is_unread).to.equal(true);

				expect(moment.utc(userRow.top_rank_starting_at).valueOf()).to.equal(expectedSeasonTimestamp);
				expect(userRow.top_rank).to.equal(topRankData.rank);
			});
		});
	});

	describe("cycleUserSeasonRanking() srank", function() {
		var player1UserName = "unittestrating1";
		var player2UserName = "unittestrating2";
		var player3UserName = "unittestrating3";
		var player4UserName = "unittestrating4";

		it('expect players to have accurate ladder position and rating after cycling if (S-Rank and Non-Srank)', function() {
			var MOMENT_UTC_NOW = moment.utc()
			var startOfCurrentSeason = moment.utc(MOMENT_UTC_NOW).startOf("month");
			var startOfCurrentSeasonDate = startOfCurrentSeason.toDate();
			var nextSeasonMoment = moment.utc(MOMENT_UTC_NOW).add(1,"month")

			// set up users
			return Promise.all([
				createOrWipeUser('unit-test-rating-1@counterplay.co',player1UserName,0,startOfCurrentSeasonDate),
				createOrWipeUser('unit-test-rating-2@counterplay.co',player2UserName,0,startOfCurrentSeasonDate),
				createOrWipeUser('unit-test-rating-3@counterplay.co',player3UserName,5,startOfCurrentSeasonDate),
				createOrWipeUser('unit-test-rating-4@counterplay.co',player4UserName,2,startOfCurrentSeasonDate)
			]).then(function() {
				// Simulate some s-rank matches
				// [Player 1, Player 2, Player 1 is winner]
				var matchTuples = [
					[player1UserName,player2UserName,true],
					[player1UserName,player3UserName,true],
					[player2UserName,player3UserName,true],
					[player2UserName,player3UserName,true],
					[player4UserName,player3UserName,true]
				];

				return Promise.map(matchTuples,function (tuple) {
					return RankModule.updateUsersRatingsWithGameOutcome(userIdsByUsername[tuple[0]],userIdsByUsername[tuple[1]],tuple[2],generatePushId(),false,true,true,MOMENT_UTC_NOW)
				})
			}).then(function () {
				// cycle the test users
				var usersToCycle = [player1UserName,player2UserName,player3UserName,player4UserName];
				return Promise.map(usersToCycle, function (username) {
					return RankModule.cycleUserSeasonRanking(userIdsByUsername[username],false,nextSeasonMoment)
				})
			}).then(function () {
				// Gather data and validate
				return Promise.all([
					knex("user_rank_history").first().where("user_id",userIdsByUsername[player1UserName]).andWhere("starting_at",startOfCurrentSeasonDate),
					knex("user_rank_ratings").first().where("user_id",userIdsByUsername[player1UserName]).andWhere("season_starting_at",startOfCurrentSeasonDate),
					knex("user_rank_history").first().where("user_id",userIdsByUsername[player2UserName]).andWhere("starting_at",startOfCurrentSeasonDate),
					knex("user_rank_ratings").first().where("user_id",userIdsByUsername[player2UserName]).andWhere("season_starting_at",startOfCurrentSeasonDate),
					knex("user_rank_history").first().where("user_id",userIdsByUsername[player3UserName]).andWhere("starting_at",startOfCurrentSeasonDate),
					knex("user_rank_ratings").first().where("user_id",userIdsByUsername[player3UserName]).andWhere("season_starting_at",startOfCurrentSeasonDate),
					knex("user_rank_history").first().where("user_id",userIdsByUsername[player4UserName]).andWhere("starting_at",startOfCurrentSeasonDate),
					knex("user_rank_ratings").first().where("user_id",userIdsByUsername[player4UserName]).andWhere("season_starting_at",startOfCurrentSeasonDate)
				])
			}).spread(function(user1RankHistoryRow,user1RatingHistoryRow,user2RankHistoryRow,user2RatingHistoryRow,user3RankHistoryRow,user3RatingHistoryRow,user4RankHistoryRow,user4RatingHistoryRow) {
				expect(user1RankHistoryRow).to.not.equal(null);
				expect(user1RatingHistoryRow).to.not.equal(null);
				expect(user2RankHistoryRow).to.not.equal(null);
				expect(user2RatingHistoryRow).to.not.equal(null);
				expect(user3RankHistoryRow).to.not.equal(null);
				expect(user3RatingHistoryRow).to.not.equal(null);
				expect(user4RankHistoryRow).to.not.equal(null);
				expect(user4RatingHistoryRow).to.not.equal(null);

				expect(user1RankHistoryRow.rating).to.not.equal(null);
				expect(user2RankHistoryRow.rating).to.not.equal(null);
				expect(user3RankHistoryRow.rating).to.not.equal(null);
				expect(user4RankHistoryRow.rating).to.not.equal(null);

				expect(user1RankHistoryRow.ladder_rating).to.not.equal(null);
				expect(user2RankHistoryRow.ladder_rating).to.not.equal(null);
				expect(user3RankHistoryRow.ladder_rating).to.equal(null);
				expect(user4RankHistoryRow.ladder_rating).to.equal(null);

				expect(user1RankHistoryRow.ladder_position).to.not.equal(null);
				expect(user2RankHistoryRow.ladder_position).to.not.equal(null);
				expect(user3RankHistoryRow.ladder_position).to.equal(null);
				expect(user4RankHistoryRow.ladder_position).to.equal(null);

				expect(user1RankHistoryRow.srank_game_count).to.equal(2);
				expect(user2RankHistoryRow.srank_game_count).to.equal(3);
				expect(user3RankHistoryRow.srank_game_count).to.equal(0);
				expect(user4RankHistoryRow.srank_game_count).to.equal(0);

				expect(user1RankHistoryRow.srank_win_count).to.equal(2);
				expect(user2RankHistoryRow.srank_win_count).to.equal(2);
				expect(user3RankHistoryRow.srank_win_count).to.equal(0);
				expect(user4RankHistoryRow.srank_win_count).to.equal(0);

				expect(user1RatingHistoryRow.rating).to.not.equal(null);
				expect(user2RatingHistoryRow.rating).to.not.equal(null);
				expect(user3RatingHistoryRow.rating).to.not.equal(null);
				expect(user4RatingHistoryRow.rating).to.not.equal(null);

				expect(user1RatingHistoryRow.ladder_rating).to.not.equal(null);
				expect(user2RatingHistoryRow.ladder_rating).to.not.equal(null);
				expect(user3RatingHistoryRow.ladder_rating).to.equal(null);
				expect(user4RatingHistoryRow.ladder_rating).to.equal(null);
			})
		});
	});

	describe("updateUserRankingWithGameOutcome()", function() {

		// before
		// read initial rank state

		var initialRank = null;

		before(function(){
			initialRank = {
				rank:19,
				stars:0,
				stars_required:SDK.RankFactory.starsNeededToAdvanceRank(19)
			}
			this.timeout(5000);
			return knex('users').where('id',userId).update({
				rank:initialRank.rank,
				rank_stars:initialRank.stars,
				rank_stars_required:initialRank.stars_required
			});
		});

		after(function(){
		});

		it('expect to update rank data with an additional win', function() {
			var gameId = generatePushId()
			return RankModule.updateUserRankingWithGameOutcome(userId, true, gameId)
			.then(function(rankData){
				expect(rankData).to.exist;
				expect(rankData.rank).to.equal(19);
				expect(rankData.stars).to.equal(1);
				return DuelystFirebase.connect().getRootRef()
				.bind({})
			}).then(function(rootRef){
				return Promise.all([
					knex.first().from('users').where('id',userId),
					FirebasePromises.once(rootRef.child("user-ranking").child(userId).child("current"),"value"),
					FirebasePromises.once(rootRef.child("user-games").child(userId).child(gameId).child("job_status"),"value")
				])
			}).spread(function(userRow,rankSnapshot,firebaseGameJobStatusSnapshot){
				expect(userRow).to.exist;
				expect(userRow.rank).to.equal(19);
				expect(userRow.rank_stars).to.equal(1);
				expect(rankSnapshot.val()).to.exist;
				expect(rankSnapshot.val().rank).to.equal(19);
				expect(rankSnapshot.val().stars).to.equal(userRow.rank_stars);
				expect(firebaseGameJobStatusSnapshot.val()["rank"]).to.equal(true)
			})
		})

		it('expect no change in data in case of a draw (input as win)', function() {
			return RankModule.updateUserRankingWithGameOutcome(userId, true, generatePushId(), true)
			.then(function(rankData){
				expect(rankData).to.exist
				expect(rankData.rank).to.equal(19)
				expect(rankData.stars).to.equal(1)
			})
		})

		it('expect no change in data in case of a draw (input as loss)', function() {
			return RankModule.updateUserRankingWithGameOutcome(userId, false, generatePushId(), true)
			.then(function(rankData){
				expect(rankData).to.exist
				expect(rankData.rank).to.equal(19)
				expect(rankData.stars).to.equal(1)
			})
		})

		it('expect to update rank data with an additional loss', function() {
			return RankModule.updateUserRankingWithGameOutcome(userId, false, generatePushId())
			.then(function(rankData){
				expect(rankData).to.exist;
				expect(rankData.rank).to.equal(19);
				expect(rankData.stars).to.equal(0);
			})
		});

		it('expect to update dropping a rank with an additional loss', function() {
			return RankModule.updateUserRankingWithGameOutcome(userId, false, generatePushId())
			.then(function(rankData){
				expect(rankData).to.exist;
				expect(rankData.rank).to.equal(20);
				expect(rankData.stars).to.equal(SDK.RankFactory.starsNeededToAdvanceRank(20));
			})
		});

		it('expect rank (20) data to be correctly set in DB and Firebase', function() {
			return DuelystFirebase.connect().getRootRef()
			.bind({})
			.then(function(rootRef){
				return Promise.all([
					knex.first().from('users').where('id',userId),
					FirebasePromises.once(rootRef.child("user-ranking").child(userId).child("current"),"value")
				])
			}).spread(function(userRow,rankSnapshot){
				expect(userRow).to.exist;
				expect(userRow.rank).to.equal(20);
				expect(userRow.rank_stars).to.equal(SDK.RankFactory.starsNeededToAdvanceRank(20));
				expect(rankSnapshot.val()).to.exist;
				expect(rankSnapshot.val().rank).to.equal(20);
				expect(rankSnapshot.val().stars).to.equal(userRow.rank_stars);
			})
		});
	});

	describe("updateUserRankingWithGameOutcome() - rank floors", function() {

		// before
		// read initial rank state

		var initialRank = null;

		before(function(){
		});

		after(function(){
		});

		it('expect to not lose stars for a loss at rank 20', function() {
			initialRank = {
				rank:20,
				stars:0,
				stars_required:SDK.RankFactory.starsNeededToAdvanceRank(20)
			}
			return knex('users').where('id',userId).update({
				rank:initialRank.rank,
				rank_stars:initialRank.stars,
				rank_stars_required:initialRank.stars_required,
				rank_starting_at:moment.utc().startOf('month')
			}).then(function () {
				return RankModule.updateUserRankingWithGameOutcome(userId, false, generatePushId())
			}).then(function(rankData){
				expect(rankData).to.exist;
				expect(rankData.rank).to.equal(20);
				expect(rankData.stars).to.equal(0);
			})
		});

		it('expect to not lose stars for a loss at rank 10', function() {
			initialRank = {
				rank:10,
				stars:0,
				stars_required:SDK.RankFactory.starsNeededToAdvanceRank(10)
			}
			return knex('users').where('id',userId).update({
				rank:initialRank.rank,
				rank_stars:initialRank.stars,
				rank_stars_required:initialRank.stars_required,
				rank_starting_at:moment.utc().startOf('month')
			}).then(function () {
				return RankModule.updateUserRankingWithGameOutcome(userId, false, generatePushId())
			}).then(function(rankData){
				expect(rankData).to.exist;
				expect(rankData.rank).to.equal(10);
				expect(rankData.stars).to.equal(0);
			})
		});

		it('expect to not lose stars for a loss at rank 5', function() {
			initialRank = {
				rank:5,
				stars:0,
				stars_required:SDK.RankFactory.starsNeededToAdvanceRank(5)
			}
			return knex('users').where('id',userId).update({
				rank:initialRank.rank,
				rank_stars:initialRank.stars,
				rank_stars_required:initialRank.stars_required,
				rank_starting_at:moment.utc().startOf('month')
			}).then(function () {
				return RankModule.updateUserRankingWithGameOutcome(userId, false, generatePushId())
			}).then(function(rankData){
				expect(rankData).to.exist;
				expect(rankData.rank).to.equal(5);
				expect(rankData.stars).to.equal(0);
			})
		});

		it('expect to not lose stars for a loss at rank 0', function() {
			initialRank = {
				rank:0,
				stars:0,
				stars_required:SDK.RankFactory.starsNeededToAdvanceRank(0)
			}
			return knex('users').where('id',userId).update({
				rank:initialRank.rank,
				rank_stars:initialRank.stars,
				rank_stars_required:initialRank.stars_required,
				rank_starting_at:moment.utc().startOf('month')
			}).then(function () {
				return RankModule.updateUserRankingWithGameOutcome(userId, false, generatePushId())
			}).then(function(rankData){
				expect(rankData).to.exist;
				expect(rankData.rank).to.equal(0);
				expect(rankData.stars).to.equal(0);
			})
		});
	});

	describe("getCurrentSeasonRank()", function() {

		it('expect non-expired rank to return correctly', function() {
			return RankModule.getCurrentSeasonRank(userId)
			.bind({})
			.then(function(rank){
				expect(rank).to.equal(20);
			})
		});

		it('expect expired rank to default to returning 30', function() {
			var systemTime = moment().utc().add(3,'month');
			return RankModule.getCurrentSeasonRank(userId,systemTime)
			.bind({})
			.then(function(rank){
				expect(rank).to.equal(30);
			})
		});
	});

	describe("updateUsersRatingsWithGameOutcome()", function() {

		// before
		// read initial rank state

		var initialRank = null;
		var player1UserName = "unittestrating1";
		var player2UserName = "unittestrating2";
		var player3UserName = "unittestrating3";
		var player4UserName = "unittestrating4";
		var player1Id = null;
		var player2Id = null;
		var player3Id = null;
		var player4Id = null;

		var updateUserRank = function(userId,rank) {
			var rankData = {
				rank: rank,
				rank_stars: 0,
				rank_stars_required: SDK.RankFactory.starsNeededToAdvanceRank(rank)
			};

			return knex('users').where('id', userId).update(rankData);
		};

		before(function(){
			this.timeout(10000);
			return Promise.all([
				createOrWipeUser('unit-test-rating-1@counterplay.co',player1UserName,20),
				createOrWipeUser('unit-test-rating-2@counterplay.co',player2UserName,20),
				createOrWipeUser('unit-test-rating-3@counterplay.co',player3UserName,0),
				createOrWipeUser('unit-test-rating-4@counterplay.co',player4UserName,0)
			]).spread(function(player1CreatedId,player2CreatedId,player3CreatedId,player4CreatedId) {
				player1Id = player1CreatedId;
				player2Id = player2CreatedId;
				player3Id = player3CreatedId;
				player4Id = player4CreatedId;
			})
		});

		after(function(){
		});

		it('expect to have no rating data after two non silver players play a match', function() {
			var now = moment().utc();
			var startOfSeasonMonth = moment(now).utc().startOf('month');
			var seasonStartingAt = startOfSeasonMonth.toDate();
			return RankModule.updateUsersRatingsWithGameOutcome(player1Id,player2Id,true,generatePushId(),null,true,true,now)
				.then(function(){

					return Promise.all([
						knex.first().from('user_rank_ratings').where('user_id',player1Id).andWhere('season_starting_at',seasonStartingAt),
						knex.first().from('user_rank_ratings').where('user_id',player2Id).andWhere('season_starting_at',seasonStartingAt)
					]).spread(function(player1RatingRow,player2RatingRow){
						expect(player1RatingRow).to.not.exist;
						expect(player2RatingRow).to.not.exist;
					})
				})
		});

		it('expect both s-rank player to have rating data after a match', function() {
			var now = moment().utc();
			var startOfSeasonMonth = moment(now).utc().startOf('month');
			var seasonStartingAt = startOfSeasonMonth.toDate();
			return RankModule.updateUsersRatingsWithGameOutcome(player3Id,player4Id,true,generatePushId(),null,true,true,now)
				.then(function(){

					return Promise.all([
						knex.first().from('user_rank_ratings').where('user_id',player3Id).andWhere('season_starting_at',seasonStartingAt),
						knex.first().from('user_rank_ratings').where('user_id',player4Id).andWhere('season_starting_at',seasonStartingAt)
					]).bind({}).spread(function(player3RatingRow,player4RatingRow){
						expect(player3RatingRow).to.exist;
						expect(player3RatingRow.rating).to.exist;
						expect(player3RatingRow.ladder_position).to.exist;
						expect(player3RatingRow.ladder_rating).to.exist;

						expect(player4RatingRow).to.exist;
						expect(player4RatingRow.rating).to.exist;
						expect(player4RatingRow.ladder_position).to.exist;
						expect(player4RatingRow.ladder_rating).to.exist;

						this.player3RatingRow = player3RatingRow;
						this.player4RatingRow = player4RatingRow;

						return DuelystFirebase.connect().getRootRef()
					}).then(function(rootRef){
						return Promise.all([
							FirebasePromises.once(rootRef.child("users").child(player3Id).child("presence").child("ladder_position"),"value"),
							FirebasePromises.once(rootRef.child("users").child(player4Id).child("presence").child("ladder_position"),"value")
						]);
					}).spread(function(player3LPSnapshot,player4LPSnapshot) {
						expect(player3LPSnapshot.val()).to.exist;
						expect(player3LPSnapshot.val()).to.equal(this.player3RatingRow.ladder_position);

						expect(player4LPSnapshot.val()).to.exist;
						expect(player4LPSnapshot.val()).to.equal(this.player4RatingRow.ladder_position);
					})
				})
		});

		it('expect a non s-rank player to have not rating data after a match with an s-rank player', function() {
			var now = moment().utc();
			var startOfSeasonMonth = moment(now).utc().startOf('month');
			var seasonStartingAt = startOfSeasonMonth.toDate();
			return RankModule.updateUsersRatingsWithGameOutcome(player3Id,player4Id,true,generatePushId(),null,true,true,now)
				.then(function(){

					return Promise.all([
						knex.first().from('user_rank_ratings').where('user_id',player1Id).andWhere('season_starting_at',seasonStartingAt),
						knex.first().from('user_rank_ratings').where('user_id',player3Id).andWhere('season_starting_at',seasonStartingAt)
					]).spread(function(player1RatingRow,player3RatingRow){
						expect(player1RatingRow).to.not.exist;
						expect(player3RatingRow).to.exist;
					})
				})
		});

		it('expect a s-rank player in casual queue to not change rating after a match with an s-rank player', function() {
			var now = moment().utc();
			var startOfSeasonMonth = moment(now).utc().startOf('month');
			var seasonStartingAt = startOfSeasonMonth.toDate();
			return knex.first().from('user_rank_ratings').where('user_id',player3Id).andWhere('season_starting_at',seasonStartingAt)
				.bind({})
				.then (function (player3RatingRowBefore) {
					expect(player3RatingRowBefore).to.exist; // Should exist due to previous tests
					expect(player3RatingRowBefore.rating).to.exist; // Should exist due to previous tests
				  this.player3RatingBefore = player3RatingRowBefore.rating;

					return RankModule.updateUsersRatingsWithGameOutcome(player3Id,player4Id,true,generatePushId(),null,false,true,now)
				})
				.then(function(){

					return Promise.all([
						knex.first().from('user_rank_ratings').where('user_id',player3Id).andWhere('season_starting_at',seasonStartingAt),
						knex.first().from('user_rank_ratings').where('user_id',player4Id).andWhere('season_starting_at',seasonStartingAt)
					]).bind(this).spread(function(player3RatingRow,player4RatingRow){
						expect(player3RatingRow).to.exist;
						expect(player3RatingRow.rating).to.exist;
						expect(player3RatingRow.rating).to.equal(this.player3RatingBefore);
					})
				})
		});

		it('expect a s-rank player with max rating to have a ladder position of 1', function() {
			var now = moment().utc();
			var startOfSeasonMonth = moment(now).utc().startOf('month');
			var seasonStartingAt = startOfSeasonMonth.toDate();
			var this_obj = {}
			var txPromise = knex.transaction(function(tx) {
				knex('user_rank_ratings').where('user_id',player3Id).andWhere('season_starting_at',seasonStartingAt).update({
					rating:5000,
					ladder_rating:5000
				}).bind(this_obj)
				.then (function () {
					return SRankManager.updateUserLadderRating(player3Id,startOfSeasonMonth,5000);
				}).then (function () {
					return RankModule.updateAndGetUserLadderPosition(txPromise,tx,player3Id,startOfSeasonMonth,now)
				}).then(function(ladderPosition){
					this.ladderPosition = ladderPosition
					tx.commit()
				}).catch(function(e){
					Logger.module("UNITTEST").log(e);
					tx.rollback();
				});
				return;
			});
			return txPromise
			.bind(this_obj)
			.then(function () {
				expect(this.ladderPosition).to.exist;
				expect(this.ladderPosition).to.equal(1)
			});

		});

		it('expect a diamond player playing a diamond player, both get a rating but no ladder position', function () {
			var now = moment().utc();
			var startOfSeasonMonth = moment(now).utc().startOf('month');
			var seasonStartingAt = startOfSeasonMonth.toDate();
			return Promise.all([
				SyncModule.wipeUserData(player1Id),
				SyncModule.wipeUserData(player2Id)
			]).then(function () {
				return Promise.all([
					updateUserRank(player1Id,5),
					updateUserRank(player2Id,5)
				])
			}).then( function () {
				return RankModule.updateUsersRatingsWithGameOutcome(player1Id,player2Id,true,generatePushId(),null,true,true,now)
			}).then( function () {
				return Promise.all([
					knex.first().from('user_rank_ratings').where('user_id',player1Id).andWhere('season_starting_at',seasonStartingAt),
					knex.first().from('user_rank_ratings').where('user_id',player2Id).andWhere('season_starting_at',seasonStartingAt)
				])
			}).spread(function(p1RatingsRow,p2RatingsRow){
				expect(p1RatingsRow).to.exist
				expect(p1RatingsRow.rating).to.exist
				expect(p1RatingsRow.top_rating).to.exist
				expect(p1RatingsRow.rating_deviation).to.exist
				expect(p1RatingsRow.volatility).to.exist
				expect(p1RatingsRow.ladder_position).to.not.exist
				expect(p1RatingsRow.top_ladder_position).to.not.exist
				expect(p1RatingsRow.ladder_rating).to.not.exist
				expect(p1RatingsRow.srank_game_count).to.equal(0)
				expect(p1RatingsRow.srank_win_count).to.equal(0)

				expect(p2RatingsRow).to.exist
				expect(p2RatingsRow.rating).to.exist
				expect(p2RatingsRow.top_rating).to.exist
				expect(p2RatingsRow.rating_deviation).to.exist
				expect(p2RatingsRow.volatility).to.exist
				expect(p2RatingsRow.ladder_position).to.not.exist
				expect(p2RatingsRow.top_ladder_position).to.not.exist
				expect(p2RatingsRow.ladder_rating).to.not.exist
				expect(p2RatingsRow.srank_game_count).to.equal(0)
				expect(p2RatingsRow.srank_win_count).to.equal(0)

				return Promise.all([
					SRankManager.getUserLadderPosition(player1Id,startOfSeasonMonth),
					SRankManager.getUserLadderPosition(player2Id,startOfSeasonMonth)
				])
			}).spread(function(ladderPosition1,ladderPosition2){
				expect(ladderPosition1).to.not.exist
				expect(ladderPosition2).to.not.exist
			})
		})

		it('expect a diamond player playing a srank player, diamond to get a rating but no ladder position, srank to get a rating and ladder position', function () {
			// TODO: this can fail, need to clear players from redis to consistently pass
			var now = moment().utc();
			var startOfSeasonMonth = moment(now).utc().startOf('month');
			var seasonStartingAt = startOfSeasonMonth.toDate();
			return Promise.all([
				SyncModule.wipeUserData(player1Id),
				SyncModule.wipeUserData(player2Id)
			]).then(function () {
				return Promise.all([
					updateUserRank(player1Id,5),
					updateUserRank(player2Id,0)
				])
			}).then( function () {
				return RankModule.updateUsersRatingsWithGameOutcome(player1Id,player2Id,false,generatePushId(),null,true,true,now)
			}).then( function () {
				return Promise.all([
					knex.first().from('user_rank_ratings').where('user_id',player1Id).andWhere('season_starting_at',seasonStartingAt),
					knex.first().from('user_rank_ratings').where('user_id',player2Id).andWhere('season_starting_at',seasonStartingAt)
				])
			}).spread(function(p1RatingsRow,p2RatingsRow){
				expect(p1RatingsRow).to.exist
				expect(p1RatingsRow.rating).to.exist
				expect(p1RatingsRow.top_rating).to.exist
				expect(p1RatingsRow.rating_deviation).to.exist
				expect(p1RatingsRow.volatility).to.exist
				expect(p1RatingsRow.ladder_position).to.not.exist
				expect(p1RatingsRow.top_ladder_position).to.not.exist
				expect(p1RatingsRow.ladder_rating).to.not.exist
				expect(p1RatingsRow.srank_game_count).to.equal(0)
				expect(p1RatingsRow.srank_win_count).to.equal(0)

				expect(p2RatingsRow).to.exist
				expect(p2RatingsRow.rating).to.exist
				expect(p2RatingsRow.top_rating).to.exist
				expect(p2RatingsRow.rating_deviation).to.exist
				expect(p2RatingsRow.volatility).to.exist
				expect(p2RatingsRow.ladder_position).to.exist
				expect(p2RatingsRow.top_ladder_position).to.exist
				expect(p2RatingsRow.ladder_rating).to.exist
				expect(p2RatingsRow.srank_game_count).to.equal(1)
				expect(p2RatingsRow.srank_win_count).to.equal(1)

				// TODO: add fb check
			})
		})
	});

	describe("updateUsersRatingsWithGameOutcome() expected ladder Position", function() {

		// before
		// read initial rank state

		var initialRank = null;
		var player1UserName = "unittestposition1"; // position 4
		var player2UserName = "unittestposition2"; // position 1
		var player3UserName = "unittestposition3"; // position 2
		var player4UserName = "unittestposition4"; // position 5
		var player5UserName = "unittestposition5"; // position 6
		var player6UserName = "unittestposition6"; // position 3
		var player1Id = null;
		var player2Id = null;
		var player3Id = null;
		var player4Id = null;
		var player5Id = null;
		var player6Id = null;
		var startOfSeasonMoment = null;

		// Create or wipe 6 s-rank users then perform a series of matches
		before(function(){
			this.timeout(10000);

			var oldSeasonTime = moment().utc().year(1999).month(2); // Set to an old season so this can happen in isolation
			startOfSeasonMoment = moment(oldSeasonTime).utc().startOf('month');
			return Promise.all([
				createOrWipeUser('unit-test-position-1@counterplay.co',player1UserName,0),
				createOrWipeUser('unit-test-position-2@counterplay.co',player2UserName,0),
				createOrWipeUser('unit-test-position-3@counterplay.co',player3UserName,0),
				createOrWipeUser('unit-test-position-4@counterplay.co',player4UserName,0),
				createOrWipeUser('unit-test-position-5@counterplay.co',player5UserName,0),
				createOrWipeUser('unit-test-position-6@counterplay.co',player6UserName,0)
			]).spread(function(player1CreatedId,player2CreatedId,player3CreatedId,player4CreatedId,player5CreatedId,player6CreatedId) {
				player1Id = player1CreatedId;
				player2Id = player2CreatedId;
				player3Id = player3CreatedId;
				player4Id = player4CreatedId;
				player5Id = player5CreatedId;
				player6Id = player6CreatedId;

				// Array of matches, with outcomes described as [player1Id,player2Id,player1IsWinner]
				var matchUpDescriptions = [
					[player2Id,player5Id,true],
					[player5Id,player3Id,false],
					[player1Id,player2Id,false],
					[player3Id,player5Id,true],
					[player6Id,player5Id,true],
					[player2Id,player4Id,true],
					[player4Id,player3Id,false],
					[player5Id,player2Id,false],
					[player6Id,player4Id,true],
					[player1Id,player5Id,true],
					[player4Id,player5Id,true]
				];

				return Promise.each(matchUpDescriptions,function (matchUpDescription) {
					return RankModule.updateUsersRatingsWithGameOutcome(matchUpDescription[0],matchUpDescription[1],matchUpDescription[2],generatePushId(),false,true,true,startOfSeasonMoment);
				}.bind(this),{concurrency: 1})

			})
		});

		after(function(){
		});

		it('expect a series of s rank matches to result in an expected ladder state', function() {
			var playerLadderPositionsById = {};
			return Promise.each([player1Id,player2Id,player3Id,player4Id,player5Id,player6Id],function (playerId) {
				var txPromise = knex.transaction(function(tx) {
					RankModule.updateAndGetUserLadderPosition(txPromise,tx,playerId,startOfSeasonMoment,startOfSeasonMoment)
					.then(function(ladderPosition){
						expect(ladderPosition).to.exist;
						playerLadderPositionsById[playerId] = ladderPosition
					}).then(function() {
						tx.commit()
					}).catch(function(e){
						Logger.module("UNITTEST").log(e);
						tx.rollback();
					});
					return;
				});
				return txPromise;
			}.bind(this),{concurrency: 1})
			.then(function() {
				expect(playerLadderPositionsById[player1Id]).to.equal(4);
				expect(playerLadderPositionsById[player2Id]).to.equal(1);
				expect(playerLadderPositionsById[player3Id]).to.equal(2);
				expect(playerLadderPositionsById[player4Id]).to.equal(5);
				expect(playerLadderPositionsById[player5Id]).to.equal(6);
				expect(playerLadderPositionsById[player6Id]).to.equal(3);
			})
		});
	});

	describe("claimRewardsForSeasonRank()", function() {

		var daySoFar = moment().utc();

		before(function(){
			this.timeout(25000);
			return SyncModule.wipeUserData(userId).then(function(){
				return RankModule.cycleUserSeasonRanking(userId)
			});
		});

		it('expect to NOT be able to claim rewards if no rank achieved last season', function() {
			var lastSeasonMoment = moment(daySoFar).subtract(1,'month');
			return RankModule.claimRewardsForSeasonRank(userId, lastSeasonMoment, daySoFar)
			.then(function(response){
				expect(response).to.not.exist;
			}).catch(function(exception){
				expect(exception).to.be.an.instanceof(Errors.NotFoundError);
			});
		});

		it('expect to be able to claim 0 rewards and be placed rank 30 for last season\'s rank 30', function() {
			daySoFar.add(1,'month');
			var lastSeasonMoment = moment(daySoFar).subtract(1,'month');
			return RankModule.cycleUserSeasonRanking(userId, false, daySoFar)
			.then(function(){
				return RankModule.claimRewardsForSeasonRank(userId, lastSeasonMoment, daySoFar)
			}).then(function(rewards){
				expect(rewards).to.exist;
				expect(rewards.length).to.equal(0);
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex("user_rank_history").first().where({'user_id':userId,'starting_at':lastSeasonMoment.startOf('month')})
				])
			}).spread(function(historyRow){
				expect(historyRow).to.exist;
				expect(historyRow.rewards_claimed_at.valueOf()).to.equal(daySoFar.valueOf());
				expect(historyRow.reward_ids.length).to.equal(0);
				expect(historyRow.is_unread).to.equal(false);

				return knex("users").first('rank','rank_stars').where('id',userId)
			}).then(function (userRankData) {
				expect(userRankData.rank).to.equal(30);
				expect(userRankData.rank_stars).to.equal(0);
			});
		});

		it('expect to be rank 24 (1 star), earn 90 gold, 10 spirit, and 1 card after last season\'s rank 20', function() {
			daySoFar.add(1,'month');
			var lastSeasonMoment = moment(daySoFar).subtract(1,'month');
			return knex("users").where('id',userId).update({'rank':20,'rank_top_rank':20})
			.then(function(){
				return RankModule.cycleUserSeasonRanking(userId, false, daySoFar)
			}).then(function(){
				return RankModule.claimRewardsForSeasonRank(userId, lastSeasonMoment, daySoFar)
			}).then(function(rewards){
				expect(rewards).to.exist;
				expect(rewards.length).to.equal(3);

				_.each(rewards, function (reward) {
					if (reward.gold) {
						expect(reward.gold).to.equal(90)
					}
					if (reward.spirit) {
						expect(reward.spirit).to.equal(10);
					}
					if (reward.card_ids) {
						expect(reward.card_ids.length).to.equal(1);
					}
				})
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex("user_rank_history").first().where({'user_id':userId,'starting_at':lastSeasonMoment.startOf('month')}),
					knex("user_rewards").select().where({'user_id':userId,'reward_category':'season rank','source_id':lastSeasonMoment.format("YYYY/MM")})
				])
			}).spread(function(historyRow,rewardRows){
				expect(historyRow).to.exist;
				expect(historyRow.rewards_claimed_at.valueOf()).to.equal(daySoFar.valueOf());
				expect(historyRow.reward_ids.length).to.equal(3);
				expect(rewardRows.length).to.equal(3);
				return knex("users").first('rank','rank_stars').where('id',userId);
			}).then(function (userRankData) {
				expect(userRankData.rank).to.equal(24);
				expect(userRankData.rank_stars).to.equal(1);
			});
		});

		it('expect to be rank 19 (0 star), earn 110 gold, 135 spirit, and 2 cards after last season\'s rank 10', function() {
			daySoFar.add(1,'month');
			var lastSeasonMoment = moment(daySoFar).subtract(1,'month');
			return knex("users").where('id',userId).update({'rank':10,'rank_top_rank':10})
				.then(function(){
					return RankModule.cycleUserSeasonRanking(userId, false, daySoFar)
				}).then(function(){
					return RankModule.claimRewardsForSeasonRank(userId, lastSeasonMoment, daySoFar)
				}).then(function(rewards){
					expect(rewards).to.exist;
					expect(rewards.length).to.equal(3);

					_.each(rewards, function (reward) {
						if (reward.gold) {
							expect(reward.gold).to.equal(110)
						}
						if (reward.spirit) {
							expect(reward.spirit).to.equal(135);
						}
						if (reward.card_ids) {
							expect(reward.card_ids.length).to.equal(2);
						}
					})
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex("user_rank_history").first().where({'user_id':userId,'starting_at':lastSeasonMoment.startOf('month')}),
						knex("user_rewards").select().where({'user_id':userId,'reward_category':'season rank','source_id':lastSeasonMoment.format("YYYY/MM")})
					])
				}).spread(function(historyRow,rewardRows){
					expect(historyRow).to.exist;
					expect(historyRow.rewards_claimed_at.valueOf()).to.equal(daySoFar.valueOf());
					expect(historyRow.reward_ids.length).to.equal(3);
					expect(rewardRows.length).to.equal(3);
					return knex("users").first('rank','rank_stars').where('id',userId);
				}).then(function (userRankData) {
					expect(userRankData.rank).to.equal(19);
					expect(userRankData.rank_stars).to.equal(0);
				});
		});

		it('expect to be rank 11 (0 star), earn 150 gold, 155 spirit, and 3 cards after last season\'s rank 5', function() {
			daySoFar.add(1,'month');
			var lastSeasonMoment = moment(daySoFar).subtract(1,'month');
			return knex("users").where('id',userId).update({'rank':5,'rank_top_rank':5})
				.then(function(){
					return RankModule.cycleUserSeasonRanking(userId, false, daySoFar)
				}).then(function(){
					return RankModule.claimRewardsForSeasonRank(userId, lastSeasonMoment, daySoFar)
				}).then(function(rewards){
					expect(rewards).to.exist;
					expect(rewards.length).to.equal(3);

					_.each(rewards, function (reward) {
						if (reward.gold) {
							expect(reward.gold).to.equal(150)
						}
						if (reward.spirit) {
							expect(reward.spirit).to.equal(155);
						}
						if (reward.card_ids) {
							expect(reward.card_ids.length).to.equal(3);
						}
					})
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex("user_rank_history").first().where({'user_id':userId,'starting_at':lastSeasonMoment.startOf('month')}),
						knex("user_rewards").select().where({'user_id':userId,'reward_category':'season rank','source_id':lastSeasonMoment.format("YYYY/MM")})
					])
				}).spread(function(historyRow,rewardRows){
					expect(historyRow).to.exist;
					expect(historyRow.rewards_claimed_at.valueOf()).to.equal(daySoFar.valueOf());
					expect(historyRow.reward_ids.length).to.equal(3);
					expect(rewardRows.length).to.equal(3);
					return knex("users").first('rank','rank_stars').where('id',userId);
				}).then(function (userRankData) {
					expect(userRankData.rank).to.equal(11);
					expect(userRankData.rank_stars).to.equal(0);
				});
		});

		it('expect to be rank 11 (0 star), earn 180 gold, 155 spirit, and 5 cards after last season\'s rank 0', function() {
			daySoFar.add(1,'month');
			var lastSeasonMoment = moment(daySoFar).subtract(1,'month');
			return knex("users").where('id',userId).update({'rank':0,'rank_top_rank':0})
				.then(function(){
					return RankModule.cycleUserSeasonRanking(userId, false, daySoFar)
				}).then(function(){
					return RankModule.claimRewardsForSeasonRank(userId, lastSeasonMoment, daySoFar)
				}).then(function(rewards){
					expect(rewards).to.exist;
					expect(rewards.length).to.equal(3);

					_.each(rewards, function (reward) {
						if (reward.gold) {
							expect(reward.gold).to.equal(180)
						}
						if (reward.spirit) {
							expect(reward.spirit).to.equal(155);
						}
						if (reward.card_ids) {
							expect(reward.card_ids.length).to.equal(5);
						}
					})
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex("user_rank_history").first().where({'user_id':userId,'starting_at':lastSeasonMoment.startOf('month')}),
						knex("user_rewards").select().where({'user_id':userId,'reward_category':'season rank','source_id':lastSeasonMoment.format("YYYY/MM")})
					])
				}).spread(function(historyRow,rewardRows){
					expect(historyRow).to.exist;
					expect(historyRow.rewards_claimed_at.valueOf()).to.equal(daySoFar.valueOf());
					expect(historyRow.reward_ids.length).to.equal(3);
					expect(rewardRows.length).to.equal(3);
					return knex("users").first('rank','rank_stars').where('id',userId);
				}).then(function (userRankData) {
					expect(userRankData.rank).to.equal(11);
					expect(userRankData.rank_stars).to.equal(0);
				});
		});

	});
});

