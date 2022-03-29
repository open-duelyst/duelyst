const path = require('path')
const crypto = require('crypto')
require('coffee-script/register')
require('app-module-path').addPath(path.join(__dirname, '../../../'))
const config = require('../../../config/config')
const expect = require('chai').expect
var ShopData = require('app/data/shop.json')

var Promise = require('bluebird')
var request = require('superagent')

const bnea = require('../../../server/lib/bnea')({
	apiUrl: config.get('bnea.apiUrl'),
	appId: config.get('bnea.serverAppId'),
	appSecret: config.get('bnea.serverAppSecret')
})
require("../../utils/bnea_inject_qa")(bnea);

const registrationTestData = {
	"email": `marwan+${Date.now()}@counterplay.co`,
	"password": "Password123!",
	"birthdate_year": 1999,
	"birthdate_month": 1,
	"birthdate_day": 31,
	"subscriptions": [
		{
			"subscription_id": 1,
			"is_subscribed": true
		},
		{
			"subscription_id": 2,
			"is_subscribed": true
		}
	],
	"source": "https://test.duelyst.com"
}

function dataLogger(res) {
	if (res.body != null) {
		// console.log(`[Status ${res.status}] ${res.body.status}`)
		// console.log(res.body.data)
	}
	return res
}

function errorLogger(e) {
	console.log(`[Status ${e.status}] ${e.innerMessage}: ${e.code} ${e.codeMessage}`)
	throw e
}

function randomString(length) {
	return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length)
}

function newUserName() {
	return "qa_bn_" + ("" + Date.now()).slice(-6)
}


describe('bnea', function () {
	let bearerToken = null
	let refreshToken = null
	
	describe("register a new user", function () {
		this.timeout(25000);
		it('expect a 200 return status', function () {
			return bnea.register(registrationTestData)
				.then(dataLogger)
				.catch(errorLogger)
		})
	})

	describe("login a new user", function () {
		it('expect a login object', function () {
			return bnea.login({ email: registrationTestData.email, password: registrationTestData.password })
				.then(dataLogger)
				.then((res) => {
					bearerToken = res.body.data.access_token
					refreshToken = res.body.data.refresh_token
				})
				.catch(errorLogger)
		})
	})

	describe("get account info", function () {
		it('expect account info', function () {
			return bnea.accountInfo(bearerToken)
				.then(dataLogger)
				.catch(errorLogger)
		})
	})

	describe("update account", function () {
		it('expect a 200 return status', function () {
			var username = newUserName()
			return bnea.updateAccount(bearerToken, { username: username })
				.then(dataLogger)
				.catch(errorLogger)
		})
	})

	describe("validate token", function () {
		it('expect a 200 return status', function () {
			return bnea.validateToken(bearerToken)
				.then(dataLogger)
				.catch(errorLogger)
		})
	})

	describe("refresh token", function () {
		it('expect a 200 return status', function () {

			return bnea.refreshToken(bearerToken, refreshToken)
				.then(function (res) {
					bearerToken = res.body.data.access_token
					refreshToken = res.body.data.refresh_token
					expect(bearerToken).to.exist;
					expect(refreshToken).to.exist;
					return Promise.resolve(res)
				}).then(dataLogger)
				.catch(errorLogger)
		})
	})

	describe("get steam skus", function () {
		it('expect a 200 return status', function () {
			return bnea.getSteamSkus(bearerToken)
				.then(dataLogger)
				.catch(errorLogger)
		})
	})

	describe("init premium purchase link", function () {
		it('expect a 200 return status', function () {
			return bnea.initPaymentWallLink(bearerToken)
				.then(dataLogger)
				.catch(errorLogger)
		})
	})

	describe("get account balance", function () {
		it('expect account info', function () {
			return bnea.accountBalance(bearerToken)
				.then(function (accountBalance) {
					expect(accountBalance).to.exist;
					// expect(accountBalance).to.equal(0);
				}).catch(errorLogger)
		})
	})

	describe("add balance with test route", function () {
		it('expect balance to reflect change', function () {
			var initialBalance = null;
			return bnea.accountBalance(bearerToken)
				.then(function (accountBalance) {
					initialBalance = accountBalance;
					return bnea.addStagingCurrency(bearerToken, 100)
				}).then(function (res) {
					return bnea.accountBalance(bearerToken)
				}).then(function (accountBalance) {
					expect(accountBalance).to.exist;
					expect(accountBalance).to.equal(initialBalance + 100)
				})
		})
	})

	describe("deduct currency for purchase", function () {
		it('expect a 200 return status', function () {
			var productData = ShopData["packs"]["BOOSTER3"];
			return bnea.addStagingCurrency(bearerToken, productData.price)
				.then(function () {
					return bnea.deductCurrencyForItemPurchase(bearerToken, {
						"deduct_platinum": productData.price,
						"item_id": "" + productData.steam_id,
						"item_name": productData.name,
						"item_qty": 1,
						"item_type": 1
					})
				}).then(dataLogger)
				.catch(errorLogger)
		})
	})
})

describe('bnea-kongregate', function () {
	let bearerToken = null
	const kongregateData = {
		id: 36060863, 
		token: "d4aa9a5eef54d9da2532696c5ee3d1300f4088083eeed1aa534c3bf5db002124"
	}
	
	describe("kongregate account channel", function () {
		it('expect a 200 return status', function () {
			return bnea.kongregateChannel(kongregateData.id, kongregateData.token)
			.then(dataLogger)
			.then(function(res) {
				bearerToken = res.body.data.access_token
				return bnea.getUserId(bearerToken)
			})
			.then(function(id) {
				console.log(`bnea user id ${id}`)
				return
			})
			.catch(errorLogger)
		})
	})

	describe("kongregate account convert", function () {
		it('expect a 200 return status', function () {
			return bnea.kongregateConvert(bearerToken, kongregateData.id, kongregateData.token, registrationTestData)
			.then(function(res) {
				return res
			})
			.then(dataLogger)
			.catch(errorLogger)
		})
	})
})
