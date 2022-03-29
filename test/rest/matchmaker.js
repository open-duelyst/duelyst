require('coffee-script/register');

var expect = require('chai').expect;
var	api = require('../../server/express.coffee');
var request = require('supertest')(api);
var jwt = require('jsonwebtoken');

var version = require("../../version.json").version;

// disable the logger for cleaner test output
var UsersModule = require('../../server/lib/data_access/users.coffee')
var SyncModule = require('../../server/lib/data_access/sync.coffee')
var Errors = require('../../server/lib/custom_errors')
var Logger = require('../../app/common/logger')
var GameType = require('../../app/sdk/gameType')
Logger.enabled = false;

describe('matchmaking', function(){

	var userId1;
	var userId2;

	var p1_token;
	var p1_id;
	var p2_token;
	var p2_id;
	var matchmaking_token1;
	var matchmaking_token2;

	// before cleanup to check if user already exists and delete
	before(function(){
		this.timeout(25000);
		Logger.module("UNITTEST").log("creating users")
		return UsersModule.createNewUser('unit-test@counterplay.co','unittest','hash','kumite14')
		.then(function(userIdCreated){
			Logger.module("UNITTEST").log("created user 1 ",userIdCreated)
			userId1 = userIdCreated
		}).catch(Errors.AlreadyExistsError,function(error){
			Logger.module("UNITTEST").log("existing user 1");
			return UsersModule.userIdForEmail('unit-test@counterplay.co').then(function(userIdExisting){
				Logger.module("UNITTEST").log("existing user 1 retrieved",userIdExisting);
				userId1 = userIdExisting;
				return SyncModule.wipeUserData(userIdExisting);
			}).then(function(){
				Logger.module("UNITTEST").log("existing user 1 data wiped",userId1);
			})
		}).then(function(){
			return UsersModule.createNewUser('unit-test2@counterplay.co','unittest','hash','kumite14')
		}).then(function(userIdCreated){
			Logger.module("UNITTEST").log("created user 2 ",userIdCreated);
			userId2 = userIdCreated;
		}).catch(Errors.AlreadyExistsError,function(error){
			Logger.module("UNITTEST").log("existing user 2");
			return UsersModule.userIdForEmail('unit-test@counterplay.co').then(function(userIdExisting){
				Logger.module("UNITTEST").log("existing user 2 retrieved",userIdExisting);
				userId2 = userIdExisting;
				return SyncModule.wipeUserData(userIdExisting);
			}).then(function(){
				Logger.module("UNITTEST").log("existing user 2 data wiped",userId2);
			})
		}).catch(function(error){
			Logger.module("UNITTEST").log("unexpected error: ",error)
			throw error
		})
	})

	// Get a token for player 1
	describe('login player 1', function() {
		it('expect a player 1 token when logging in', function(done) {
			this.timeout(5000);
			request
			.post('/session')
			.set('Client-Version', version)
			.send({ email: "unit-test@counterplay.co", password: "hash"})
			.expect(200)
			.end(function(err,res){
				expect(err).to.be.equal(null);
				expect(res.body).to.have.property('token');
				expect(jwt.decode(res.body.token).d.id).to.have.length(20);
				expect(jwt.decode(res.body.token).d.email).to.be.equal("unit-test@counterplay.co");
				p1_token = res.body.token;
				p1_id = jwt.decode(res.body.token).d.id
				done();
			});
		});
	});

	// Get a token for player 2
	describe('login player 2', function(done) {
		it('expect a player 2 token when logging in', function(done) {
			this.timeout(5000);
			request
			.post('/session')
			.set('Client-Version', version)
			.send({ email: "unit-test2@counterplay.co", password: "hash"})
			.expect(200)
			.end(function(err,res){
				expect(err).to.be.equal(null);
				expect(res.body).to.have.property('token');
				expect(jwt.decode(res.body.token).d.id).to.have.length(20);
				expect(jwt.decode(res.body.token).d.email).to.be.equal("unit-test2@counterplay.co");
				p2_token = res.body.token;
				p2_id = jwt.decode(res.body.token).d.id
				done();
			});
		});
	});

	describe('POST /matchmaking', function() {

		it('returns 400 for if no client version', function(done) {
			request
			.post('/matchmaking')
			.set('Accept', 'application/json')
			.send()
			.expect(400,done)
		});

		it('returns 400 for if wrong client version', function(done) {
			request
			.post('/matchmaking')
			.set('Client-Version', "wrong")
			.set('Accept', 'application/json')
			.send()
			.expect(400,done)
		});

		it('returns 401 for if no login data', function(done) {
			request
			.post('/matchmaking')
			.set('Client-Version', version)
			.set('Accept', 'application/json')
			.send()
			.expect(401,done)
		});

		it('returns 400 if no matchmaking request data', function(done) {
			request
			.post('/matchmaking')
			.set('Client-Version', version)
			.set('Authorization', 'Bearer ' + p1_token)
			.set('Accept', 'application/json')
			.send()
			.expect(400,done)
		});

		it('returns 400 with invalid deck message with a deck with fewer than 40 cards', function(done) {
			request
			.post('/matchmaking')
			.set('Client-Version', version)
			.set('Authorization', 'Bearer ' + p1_token)
			.set('Accept', 'application/json')
			.send({deck: [1000], factionId: 1, gameType: GameType.Ranked})
			.expect(400)
			.end(function(err,res){
				expect(res.status).to.be.equal(400);
				// expect(res.body).to.have.property('error');
				// expect(res.body.error).to.be.equal('Deck has fewer than 40 cards')
				done();
			});
		});

		it('returns 400 with invalid general message if deck has no general', function(done) {
			request
			.post('/matchmaking')
			.set('Client-Version', version)
			.set('Authorization', 'Bearer ' + p1_token)
			.set('Accept', 'application/json')
			.send({
				deck:[
					1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000,
					1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000,
					1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000,
					1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000
				],
				factionId: 1, gameType: GameType.Ranked
			})
			.expect(400)
			.end(function(err,res){
				expect(res.status).to.be.equal(400);
				// expect(res.body).to.have.property('error');
				// expect(res.body.error).to.be.equal('First card in the deck must be a general')
				done();
			});
		});

		it('returns 400 with invalid deck message if sent an invalid deck with more than 3 of a card', function(done) {
			request
			.post('/matchmaking')
			.set('Client-Version', version)
			.set('Authorization', 'Bearer ' + p1_token)
			.set('Accept', 'application/json')
			.send({
				deck:[
					1, 8, 8, 8, 8, 8, 8, 8, 8, 8,
					8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
					8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
					8, 8, 8, 8, 8, 8, 8, 8, 8, 8
				],
				factionId: 1, gameType: GameType.Ranked
			})
			.expect(400)
			.end(function(err,res){
				expect(res.status).to.be.equal(400);
				// expect(res.body).to.have.property('error');
				// expect(res.body.error).to.be.equal('Deck has more than 3 of a card')
				done();
			});
		});

		it('returns 200 when using a valid deck', function(done) {
			request
			.post('/matchmaking')
			.set('Client-Version', version)
			.set('Authorization', 'Bearer ' + p1_token)
			.set('Accept', 'application/json')
			.send({
				deck:[
					1, 8, 8, 8, 9, 9, 9, 11, 11, 11,
					30004, 30004, 30004, 20066, 20066,
					20066, 20044, 20044, 20044, 20047,
					20047, 20047, 10205, 10205, 10205,
					20090, 20090, 20090, 10017, 10017,
					10017, 19031, 19031, 19031, 10204,
					10204, 10204, 10206, 10206, 10206
				],
				factionId: 1,
				gameType: GameType.Ranked,
				name: 'Player 1',
				ranking: {rank:30}
			})
			.end(function(err,res){
				expect(res.status).to.be.equal(200);
				expect(res.body).to.have.property("token")
				// matchmaking_token1 = res.body.token;
				done();
			});
		});
	});

	describe('GET /matchmaking', function() {
		it('returns 200 and current token', function(done) {
			request
			.get('/matchmaking')
			.set('Client-Version', version)
			.set('Authorization', 'Bearer ' + p1_token)
			.expect(200)
			.end(function(err,res){
				expect(res.status).to.be.equal(200);
				expect(res.body).to.have.property("id")
				done();
			});
		});
	});

	describe('DELETE /matchmaking', function() {
		it('returns 204', function(done) {
			request
			.del('/matchmaking')
			.set('Client-Version', version)
			.set('Authorization', 'Bearer ' + p1_token)
			.expect(204)
			.end(function(err,res){
				expect(res.status).to.be.equal(204);
				done();
			});
		});
	});

	describe('GET /matchmaking (after delete)', function() {
		it('returns 404', function(done) {
			request
			.get('/matchmaking')
			.set('Client-Version', version)
			.set('Authorization', 'Bearer ' + p1_token)
			.expect(404)
			.end(function(err,res){
				expect(res.status).to.be.equal(404);
				done();
			});
		});
	});

	// TODO: before() : probe redis to get the current game id
	// Player 1 joins
	describe('matchmaking POST player 1', function() {
		it('returns 200', function(done) {
			request
			.post('/matchmaking')
			.set('Client-Version', version)
			.set('Authorization', 'Bearer ' + p1_token)
			.set('Accept', 'application/json')
			.send({
				deck:[
					1, 8, 8, 8, 9, 9, 9, 11, 11, 11,
					30004, 30004, 30004, 20066, 20066,
					20066, 20044, 20044, 20044, 20047,
					20047, 20047, 10205, 10205, 10205,
					20090, 20090, 20090, 10017, 10017,
					10017, 19031, 19031, 19031, 10204,
					10204, 10204, 10206, 10206, 10206
				],
				factionId: 1,
				gameType: GameType.Ranked,
				name: 'Player 1',
				ranking: {rank:30}
			})
			.end(function(err,res){
				expect(res.status).to.be.equal(200);
				expect(res.body).to.have.property("tokenId")
				matchmaking_token1 = res.body.tokenId;
				done();
			});
		});
	});

	// Player 2 joins
	describe('matchmaking POST player 2', function() {
		it('returns 200', function(done) {
			request
			.post('/matchmaking')
			.set('Client-Version', version)
			.set('Authorization', 'Bearer ' + p2_token)
			.set('Accept', 'application/json')
			.send({
				deck:[
					1, 8, 8, 8, 9, 9, 9, 11, 11, 11,
					30004, 30004, 30004, 20066, 20066,
					20066, 20044, 20044, 20044, 20047,
					20047, 20047, 10205, 10205, 10205,
					20090, 20090, 20090, 10017, 10017,
					10017, 19031, 19031, 19031, 10204,
					10204, 10204, 10206, 10206, 10206
				],
				factionId: 1,
				gameType: GameType.Ranked,
				name: 'Player 2',
				ranking: {rank:30}
			})
			.expect(200)
			.end(function(err,res){
				expect(res.status).to.be.equal(200);
				expect(res.body).to.have.property("tokenId")
				matchmaking_token2 = res.body.tokenId;
				expect(matchmaking_token2).to.not.be.equal(matchmaking_token1);
				done();
			});
		});
	});

	// TODO: after() : probe redis again to see if game id ++

});
