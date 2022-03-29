require('coffee-script/register')

const expect = require('chai').expect
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const config = require('../../config/config')
const UsersModule = require('../../server/lib/data_access/users')
const bnea = require('../../server/lib/bnea')({
	apiUrl: config.get('bnea.apiUrl'),
	appId: config.get('bnea.serverAppId'),
	appSecret: config.get('bnea.serverAppSecret')
})

// disable the logger for cleaner test output
const Logger = require('../../app/common/logger')
Logger.enabled = false

// configure where to run the tests against
// var	api = require('../../server/express')
var request = require('supertest')('http://127.0.0.1:5000')

function randomString(length) {
	return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length)
}

describe('NEW USER WITHOUT ANY ACCOUNT', function () {
	const dummyNewUser = {
		username: `test${randomString(8)}`,
		email: `marwan+${Date.now()}@counterplay.co`,
		password: "Password123!",
		birthdate_year: 1999,
		birthdate_month: 1,
		birthdate_day: 31,
		source: 'test.duelyst.com'
	}
	let token = null
	let bneaToken = null

	before(function () {
		this.timeout(5000)
		return UsersModule.userIdForEmail(dummyNewUser.email)
			.then(function (userId) {
				if (userId) {
					return UsersModule.deleteNewUser(userId)
				}
			})
	})

	after(function () {
		this.timeout(5000)
		return UsersModule.userIdForEmail(dummyNewUser.email)
			.then(function (userId) {
				if (userId) {
					return UsersModule.deleteNewUser(userId)
				}
			})
	})

	describe('register a new user', function () {
		it('returns 200 status and user created on both Duelyst and BNEA', function (done) {
			this.timeout(30000)
			request
				.post('/session/bnea_register')
				.send(dummyNewUser)
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.status).to.be.equal(200)
					done()
				})
		})
	})

	describe('login new user after creation', function () {
		it('expect 200 status and valid token for Duelyst and BNEA', function (done) {
			this.timeout(5000)
			request
				.post('/session/bnea_login')
				.send({ email: dummyNewUser.email, password: dummyNewUser.password })
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.body).to.have.property('token')
					expect(res.body).to.have.property('bnea_token')
					expect(res.body).to.have.property('bnea_refresh')
					expect(res.body).to.have.property('bnea_id')
					expect(jwt.decode(res.body.token).d.id).to.have.length(20)
					expect(jwt.decode(res.body.token).d.email).to.be.equal(dummyNewUser.email)
					token = res.body.token
					bneaToken = res.body.bnea_token
					done()
				})
		})
	})

	describe('make a secure Duelyst API request using token', function () {
		it('expect 200 status', function (done) {
			this.timeout(2500)
			request
				.get('/api/me/securetest')
				.set('Authorization', 'Bearer ' + token)
				.expect(200, done)
		})
	})

	describe('make a secure BNEA API request using token', function () {
		it('expect 200 status', function () {
			this.timeout(2500)
			return bnea.validateToken(bneaToken)
		})
	})
})

describe('EXISTING USER WITH EXISTING BNEA ACCOUNT', function () {
	const duelystUser = {
		username: `test${randomString(8)}`,
		email: `marwan+${Date.now()}@counterplay.co`,
		password: "password123"
	}
	const bneaUser = {
		email: `marwan+${Date.now()}@counterplay.co`,
		password: "Password123!",
		birthdate_year: 1999,
		birthdate_month: 1,
		birthdate_day: 31,
		subscriptions: {
			"is_subscribed": true,
			"subscription_id": config.get('bnea.subscriptionId'),
			"subscription_name": config.get('bnea.subscriptionName'),
		}
	}
	let token = null
	let bneaId = null

	before(function () {
		this.timeout(5000)
		return UsersModule.userIdForEmail(duelystUser.email)
			.then(function (userId) {
				if (userId) {
					return UsersModule.deleteNewUser(userId)
				}
			})
	})

	describe("create existing DUELYST account with debug endpoint", function () {
		it('expect 200 status and DUELYST account created', function (done) {
			this.timeout(30000)
			request
				.post('/debug-duelyst-register')
				.set('Accept', 'application/json')
				.send(duelystUser)
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.status).to.be.equal(200)
					done()
				})
		})
	})

	describe("create existing BNEA account with debug endpoint", function () {
		it('expect 200 status and BNEA account created', function (done) {
			this.timeout(30000)
			request
				.post('/debug-bnea-register')
				.set('Accept', 'application/json')
				.send(bneaUser)
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.status).to.be.oneOf([200, 400])
					if (res.status == 400) {
						expect(res.body).to.have.property('code')
						expect(res.body.code).to.be.equal(100007)
					}
					done()
				})
		})
	})

	describe('login existing DUELYST user', function () {
		it('expect 200 status and a valid login token and unlinked BNEA status', function (done) {
			this.timeout(30000)
			request
				.post('/session')
				.send(duelystUser)
				.expect(200)
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.body).to.have.property('token')
					expect(res.body.bnea_token).to.be.equal(undefined)
					expect(jwt.decode(res.body.token).d.id).to.have.length(20)
					expect(jwt.decode(res.body.token).d.email).to.be.equal(duelystUser.email)
					token = res.body.token
					done()
				})
		})
	})

	describe('DUELYST login token is valid', function () {
		it('expect 200 status', function (done) {
			request
				.get('/api/me/securetest')
				.set('Authorization', 'Bearer ' + token)
				.expect(200, done)
		})
	})

	describe('create BNEA link with existing BNEA account', function () {
		it('expect 200 status and the link is created', function (done) {
			request
				.post('/session/bnea_link')
				.set('Authorization', 'Bearer ' + token)
				.send({
					email: bneaUser.email,
					password: bneaUser.password,
					type: 'login'
				})
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.status).to.be.equal(200)
					done()
				})
		})
	})

	describe('get BNEA link status', function () {
		it('expect 200 status with the linked BNEA account id', function (done) {
			request
				.get('/session/bnea_link')
				.set('Authorization', 'Bearer ' + token)
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.status).to.be.equal(200)
					expect(res.body).to.have.property('bnea_id')
					expect(res.body).to.have.property('bnea_associated_at')
					bneaId = res.body.bnea_id
					done()
				})
		})
	})

	describe('login migrated DUELYST user using BNEA credentials', function () {
		it('expect 200 status and a valid login including BNEA token', function (done) {
			this.timeout(5000)
			request
				.post('/session/bnea_login')
				.send({ email: bneaUser.email, password: bneaUser.password })
				.expect(200)
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.body).to.have.property('token')
					expect(res.body).to.have.property('bnea_id')
					expect(res.body).to.have.property('bnea_refresh')
					expect(res.body).to.have.property('bnea_token')
					expect(res.body['bnea_id']).to.be.equal(bneaId)
					expect(jwt.decode(res.body.token).d.id).to.have.length(20)
					expect(jwt.decode(res.body.token).d.email).to.be.equal(duelystUser.email)
					expect(jwt.decode(res.body.token).d.username).to.be.equal(duelystUser.username)
					done()
				})
		})
	})
})

describe('EXISTING USER WITHOUT BNEA ACCOUNT', function () {
	const duelystUser = {
		username: `test${randomString(8)}`,
		email: `marwan+${Date.now()}1@counterplay.co`,
		password: "password123"
	}
	const bneaUser = {
		email: `marwan+${Date.now()}2@counterplay.co`,
		password: "Password123!",
		birthdate_year: 1999,
		birthdate_month: 1,
		birthdate_day: 31,
		is_subscribed: true
	}
	let token = null
	let bneaId = null

	before(function () {
		this.timeout(5000)
		return UsersModule.userIdForEmail(duelystUser.email)
			.then(function (userId) {
				if (userId) {
					return UsersModule.deleteNewUser(userId)
				}
			})
	})

	describe("create existing DUELYST account with debug endpoint", function () {
		it('expect 200 status and DUELYST account created', function (done) {
			this.timeout(30000)
			request
				.post('/debug-duelyst-register')
				.set('Accept', 'application/json')
				.send(duelystUser)
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.status).to.be.equal(200)
					done()
				})
		})
	})

	describe('login existing DUELYST user', function () {
		it('expect 200 status and a valid login token and unlinked BNEA status', function (done) {
			this.timeout(30000)
			request
				.post('/session')
				.send(duelystUser)
				.expect(200)
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.body).to.have.property('token')
					expect(res.body.bnea_associated_at).to.be.equal(null)
					expect(jwt.decode(res.body.token).d.id).to.have.length(20)
					expect(jwt.decode(res.body.token).d.email).to.be.equal(duelystUser.email)
					token = res.body.token
					done()
				})
		})
	})

	describe('DUELYST login token is valid', function () {
		it('expect 200 OK', function (done) {
			request
				.get('/api/me/securetest')
				.set('Authorization', 'Bearer ' + token)
				.expect(200, done)
		})
	})

	describe('create BNEA link with new BNEA account', function () {
		it('expect 200 OK', function (done) {
			request
				.post('/session/bnea_link')
				.set('Authorization', 'Bearer ' + token)
				.send(Object.assign(bneaUser, { type: 'register' }))
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.status).to.be.equal(200)
					done()
				})
		})
	})

	describe('get BNEA link status', function () {
		it('returns 200 OK', function (done) {
			request
				.get('/session/bnea_link')
				.set('Authorization', 'Bearer ' + token)
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.status).to.be.equal(200)
					expect(res.body).to.have.property('bnea_id')
					expect(res.body).to.have.property('bnea_associated_at')
					bneaId = res.body.bnea_id
					done()
				})
		})
	})

	describe('login migrated DUELYST user using BNEA credentials', function () {
		it('expect 200 status and a valid login including BNEA token', function (done) {
			this.timeout(5000)
			request
				.post('/session/bnea_login')
				.send({ email: bneaUser.email, password: bneaUser.password })
				.expect(200)
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.body).to.have.property('token')
					expect(res.body).to.have.property('bnea_id')
					expect(res.body).to.have.property('bnea_refresh')
					expect(res.body).to.have.property('bnea_token')
					expect(res.body['bnea_id']).to.be.equal(bneaId)
					expect(jwt.decode(res.body.token).d.id).to.have.length(20)
					expect(jwt.decode(res.body.token).d.email).to.be.equal(bneaUser.email)
					expect(jwt.decode(res.body.token).d.username).to.be.equal(duelystUser.username)
					done()
				})
		})
	})

	describe('login migrated DUELYST user using original credentials', function () {
		it('expect 200 status and a valid login token and linked BNEA status', function (done) {
			this.timeout(30000)
			request
				.post('/session')
				.send(duelystUser)
				.expect(200)
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.body).to.have.property('token')
					expect(res.body.bnea_associated_at).to.not.be.equal(null)
					expect(jwt.decode(res.body.token).d.id).to.have.length(20)
					expect(jwt.decode(res.body.token).d.email).to.be.equal(bneaUser.email)
					token = res.body.token
					done()
				})
		})
	})

})

describe('NEW USER WITH BNEA ACCOUNT', function () {
	// CREATE BNEA ACCOUNT VIA DEBUG ENDPOINT IN BEFORE STEP
	// SEARCH FOR EXISTING USER IN DUELYST - SHOULD RETURN FALSE
	// LOGIN WITH BNEA ACCOUNT - SHOULD VALIDATE AND CREATE NEW USER AUTOMATICALLY
	// SEARCH FOR EXISTING USER IN DUELYST - SHOULD RETURN TRUE
	const bneaUser = {
		email: `marwan+${Date.now()}@counterplay.co`,
		password: "Password123!",
		birthdate_year: 1999,
		birthdate_month: 1,
		birthdate_day: 31,
		is_subscribed: true
	}
	let token = null
	let bneaId = null
	let bneaToken = null

	describe("create BNEA account with debug endpoint", function () {
		it('expect 200 status and BNEA account created', function (done) {
			this.timeout(30000)
			request
				.post('/debug-bnea-register')
				.set('Accept', 'application/json')
				.send(bneaUser)
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.status).to.be.oneOf([200, 400])
					if (res.status == 400) {
						expect(res.body).to.have.property('code')
						expect(res.body.code).to.be.equal(100007)
					}
					done()
				})
		})
	})

	describe("DUELYST account with same email should NOT exist", function () {
		it('expect user search for return false', function () {
			return UsersModule.userIdForEmail(bneaUser.email)
				.then(function (userId) {
					expect(userId).to.be.equal(null)
				})
		})
	})

	describe("login existing BNEA account first time", function () {
		it('expect 201 status and new linked DUELYST account created with null username', function (done) {
			this.timeout(5000)
			request
				.post('/session/bnea_login')
				.send(bneaUser)
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.status).to.be.equal(201)
					expect(res.body).to.have.property('token')
					expect(res.body).to.have.property('bnea_token')
					expect(res.body).to.have.property('bnea_refresh')
					expect(res.body).to.have.property('bnea_id')
					expect(jwt.decode(res.body.token).d.id).to.have.length(20)
					expect(jwt.decode(res.body.token).d.email).to.be.equal(bneaUser.email)
					expect(jwt.decode(res.body.token).d.username).to.be.equal(null)
					token = res.body.token
					bneaToken = res.body.bnea_token
					done()
				})
		})
	})

	describe('get BNEA link status', function () {
		it('expect 200 status with the linked BNEA account id', function (done) {
			request
				.get('/session/bnea_link')
				.set('Authorization', 'Bearer ' + token)
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.status).to.be.equal(200)
					expect(res.body).to.have.property('bnea_id')
					expect(res.body).to.have.property('bnea_associated_at')
					bneaId = res.body.bnea_id
					done()
				})
		})
	})

	describe('login existing BNEA account second time', function () {
		it('expect 200 status and a valid login token and linked BNEA status', function (done) {
			this.timeout(5000)
			request
				.post('/session/bnea_login')
				.send(bneaUser)
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.status).to.be.equal(200)
					expect(res.body).to.have.property('token')
					expect(res.body).to.have.property('bnea_token')
					expect(res.body).to.have.property('bnea_refresh')
					expect(res.body).to.have.property('bnea_id')
					expect(jwt.decode(res.body.token).d.id).to.have.length(20)
					expect(jwt.decode(res.body.token).d.email).to.be.equal(bneaUser.email)
					expect(jwt.decode(res.body.token).d.username).to.be.equal(null)
					done()
				})
		})
	})
})

describe('NEW USER WITHOUT USERNAME SPECIFIED', function () {
	const dummyNewUser = {
		email: `marwan+${Date.now()}@counterplay.co`,
		password: "Password123!",
		birthdate_year: 1999,
		birthdate_month: 1,
		birthdate_day: 31,
		is_subscribed: true
	}
	let token = null
	let bneaToken = null

	before(function () {
		this.timeout(5000)
		return UsersModule.userIdForEmail(dummyNewUser.email)
			.then(function (userId) {
				if (userId) {
					return UsersModule.deleteNewUser(userId)
				}
			})
	})

	after(function () {
		this.timeout(5000)
		return UsersModule.userIdForEmail(dummyNewUser.email)
			.then(function (userId) {
				if (userId) {
					return UsersModule.deleteNewUser(userId)
				}
			})
	})

	describe('register a new user', function () {
		it('returns 200 status and user created on both Duelyst and BNEA', function (done) {
			this.timeout(30000)
			request
				.post('/session/bnea_register')
				.send(dummyNewUser)
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.status).to.be.equal(200)
					done()
				})
		})
	})

	describe('login new user after creation', function () {
		it('expect 200 status and valid token with null username set', function (done) {
			this.timeout(5000)
			request
				.post('/session/bnea_login')
				.send({ email: dummyNewUser.email, password: dummyNewUser.password })
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.body).to.have.property('token')
					expect(res.body).to.have.property('bnea_token')
					expect(res.body).to.have.property('bnea_refresh')
					expect(res.body).to.have.property('bnea_id')
					expect(jwt.decode(res.body.token).d.id).to.have.length(20)
					expect(jwt.decode(res.body.token).d.email).to.be.equal(dummyNewUser.email)
					expect(jwt.decode(res.body.token).d.username).to.be.equal(null)
					token = res.body.token
					bneaToken = res.body.bnea_token
					done()
				})
		})
	})

	describe('make a secure Duelyst API request using token', function () {
		it('expect 200 status', function (done) {
			this.timeout(2500)
			request
				.get('/api/me/securetest')
				.set('Authorization', 'Bearer ' + token)
				.expect(200, done)
		})
	})

	describe('make a secure BNEA API request using token', function () {
		it('expect 200 status', function () {
			this.timeout(2500)
			return bnea.validateToken(bneaToken)
		})
	})

	describe('select/change username first time (for free)', function () {
		it('expect 200 status', function (done) {
			this.timeout(2500)
			request
				.post('/session/change_username')
				.set('Authorization', 'Bearer ' + token)
				.send({ new_username: `user${Date.now()}`, })
				.expect(200, done)
		})
	})

	describe('select/change username second time', function () {
		it('expect 400 status', function (done) {
			this.timeout(2500)
			request
				.post('/session/change_username')
				.set('Authorization', 'Bearer ' + token)
				.send({ username: `user${Date.now()}`, })
				.expect(400, done)
		})
	})
})

describe('EXISTING USER WITH NEW BNEA ACCOUNT WITH SAME EMAIL', function () {
	const email = `marwan+${Date.now()}@counterplay.co`
	const duelystUser = {
		username: `test${randomString(8)}`,
		email: email,
		password: "password123"
	}
	const bneaUser = {
		email: email,
		password: "Password123!",
		birthdate_year: 1999,
		birthdate_month: 1,
		birthdate_day: 31,
		is_subscribed: true
	}
	let token = null
	let bneaId = null

	before(function () {
		this.timeout(5000)
		return UsersModule.userIdForEmail(duelystUser.email)
			.then(function (userId) {
				if (userId) {
					return UsersModule.deleteNewUser(userId)
				}
			})
	})

	describe("create existing DUELYST account with debug endpoint", function () {
		it('expect 200 status and DUELYST account created', function (done) {
			this.timeout(30000)
			request
				.post('/debug-duelyst-register')
				.set('Accept', 'application/json')
				.send(duelystUser)
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.status).to.be.equal(200)
					done()
				})
		})
	})

	describe('login existing DUELYST user', function () {
		it('expect 200 status and a valid login token and unlinked BNEA status', function (done) {
			this.timeout(30000)
			request
				.post('/session')
				.send(duelystUser)
				.expect(200)
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.body).to.have.property('token')

					expect(res.body.bnea_associated_at).to.be.equal(null)
					expect(jwt.decode(res.body.token).d.id).to.have.length(20)
					expect(jwt.decode(res.body.token).d.email).to.be.equal(duelystUser.email)
					token = res.body.token
					done()
				})
		})
	})

	describe('DUELYST login token is valid', function () {
		it('expect 200 OK', function (done) {
			request
				.get('/api/me/securetest')
				.set('Authorization', 'Bearer ' + token)
				.expect(200, done)
		})
	})

	describe('create BNEA link with new BNEA account', function () {
		it('expect 200 OK', function (done) {
			request
				.post('/session/bnea_link')
				.set('Authorization', 'Bearer ' + token)
				.send(Object.assign(bneaUser, { type: 'register' }))
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.status).to.be.equal(200)
					done()
				})
		})
	})

	describe('get BNEA link status', function () {
		it('returns 200 OK', function (done) {
			request
				.get('/session/bnea_link')
				.set('Authorization', 'Bearer ' + token)
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.status).to.be.equal(200)
					expect(res.body).to.have.property('bnea_id')
					expect(res.body).to.have.property('bnea_associated_at')
					bneaId = res.body.bnea_id
					done()
				})
		})
	})

	describe('login migrated DUELYST user using BNEA credentials', function () {
		it('expect 200 status and a valid login including BNEA token', function (done) {
			this.timeout(5000)
			request
				.post('/session/bnea_login')
				.send({ email: bneaUser.email, password: bneaUser.password })
				.expect(200)
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.body).to.have.property('token')
					expect(res.body).to.have.property('bnea_id')
					expect(res.body).to.have.property('bnea_refresh')
					expect(res.body).to.have.property('bnea_token')
					expect(res.body['bnea_id']).to.be.equal(bneaId)
					expect(jwt.decode(res.body.token).d.id).to.have.length(20)
					expect(jwt.decode(res.body.token).d.email).to.be.equal(duelystUser.email)
					expect(jwt.decode(res.body.token).d.username).to.be.equal(duelystUser.username)
					done()
				})
		})
	})

	describe('login migrated DUELYST user using original credentials', function () {
		it('expect 200 status and a valid login token and linked BNEA status', function (done) {
			this.timeout(30000)
			request
				.post('/session')
				.send(duelystUser)
				.expect(200)
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.body).to.have.property('token')
					expect(res.body.bnea_associated_at).to.not.be.equal(null)
					expect(jwt.decode(res.body.token).d.id).to.have.length(20)
					expect(jwt.decode(res.body.token).d.email).to.be.equal(duelystUser.email)
					token = res.body.token
					done()
				})
		})
	})

})

describe('FORGOT PASSWORD STOPS WORKING AFTER LINKING', function () {
	const duelystUser = {
		username: `test${randomString(8)}`,
		email: `marwan+${Date.now()}1@counterplay.co`,
		password: "password123"
	}
	const bneaUser = {
		email: `marwan+${Date.now()}2@counterplay.co`,
		password: "Password123!",
		birthdate_year: 1999,
		birthdate_month: 1,
		birthdate_day: 31,
		is_subscribed: true
	}
	let token = null
	let bneaId = null

	before(function () {
		this.timeout(5000)
		return UsersModule.userIdForEmail(duelystUser.email)
			.then(function (userId) {
				if (userId) {
					return UsersModule.deleteNewUser(userId)
				}
			})
	})

	describe("create existing DUELYST account with debug endpoint", function () {
		it('expect 200 status and DUELYST account created', function (done) {
			this.timeout(30000)
			request
				.post('/debug-duelyst-register')
				.set('Accept', 'application/json')
				.send(duelystUser)
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.status).to.be.equal(200)
					done()
				})
		})
	})

	describe('login existing DUELYST user', function () {
		it('expect 200 status and a valid login token and unlinked BNEA status', function (done) {
			this.timeout(30000)
			request
				.post('/session')
				.send(duelystUser)
				.expect(200)
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.body).to.have.property('token')
					expect(res.body.bnea_associated_at).to.be.equal(null)
					expect(jwt.decode(res.body.token).d.id).to.have.length(20)
					expect(jwt.decode(res.body.token).d.email).to.be.equal(duelystUser.email)
					token = res.body.token
					done()
				})
		})
	})

	describe('DUELYST login token is valid', function () {
		it('expect 200 OK', function (done) {
			request
				.get('/api/me/securetest')
				.set('Authorization', 'Bearer ' + token)
				.expect(200, done)
		})
	})

	describe('attempt to reset password with original email', function () {
		it('expect 200 OK', function (done) {
			request
				.post('/forgot')
				.set('Authorization', 'Bearer ' + token)
				.set('Accept', 'application/json')
				.send({ email: duelystUser.email })
				.expect(200, done)
		})
	})

	describe('create BNEA link with new BNEA account', function () {
		it('expect 200 OK', function (done) {
			request
				.post('/session/bnea_link')
				.set('Authorization', 'Bearer ' + token)
				.send(Object.assign(bneaUser, { type: 'register' }))
				.end(function (err, res) {
					expect(err).to.be.equal(null)
					expect(res.status).to.be.equal(200)
					done()
				})
		})
	})

	describe('attempt to reset password after BNEA linking with original email', function () {
		it('expect 404', function (done) {
			request
				.post('/forgot')
				.set('Authorization', 'Bearer ' + token)
				.set('Accept', 'application/json')
				.send({ email: duelystUser.email })
				.expect(404, done)
		})
	})

	describe('attempt to reset password after BNEA linking with new email', function () {
		it('expect 302', function (done) {
			request
				.post('/forgot')
				.set('Authorization', 'Bearer ' + token)
				.set('Accept', 'application/json')
				.send({ email: bneaUser.email })
				.expect(302, done)
		})
	})

})
