// require('coffee-script/register')
// var expect = require('chai').expect
// var Steam = require('../../../server/lib/steam')

// describe('steam', function() {

// 	// this needs to be an actual auth ticket generated from steam desktop api
// 	// test will fail if steamTicket is not updated
// 	// reference on generating a ticket @ https://github.com/88dots/steamworks
// 	const ticket = "140000005B4216673D33130388D38A0001001001ADBA7257180000000100000002000000B72774620000000092E4120002000000B2000000320000000400000088D38A000100100152720400B72774625100006400000000AFBA72572F6A8E570100A39F000000000000B03C9B084359D0F9A72E6BB26702C96545AF0D137E33FA71F218C96D503CFDCF4D172DF6998F0D329F1991959BEB5C302DEF32DDC20A0BDE6C8A8E5D47C81BB45F517AE65FCE889A635A17CBDA966CE5C5324C00DDD71BB86989148B0D0AA2BFCF9E3C1C7EF870CAF6C98242D2A4E11AC185032F220460F19F83FDBA65AB16CB"
// 	describe("validate a user's steam auth ticket", function() {
// 		it('expect a steam ID when given a valid steam ticket', function() {
// 			return Steam.authenticateUserTicket(ticket)
// 			.then(function(steamId){
// 				expect(steamId).to.exist
// 				Logger.module("UNITTEST").log(`steam id ${steamId}`)
// 			})
// 		})
// 	})

// 	describe("get user info with steamid", function() {
// 		it("expect user's wallet details", function() {
// 			return Steam.authenticateUserTicket(ticket)
// 			.then(function(steamId){
// 				expect(steamId).to.exist
// 				return Steam.getUserInfo(steamId)
// 			})
// 			.then(function(details){
// 				expect(details).to.exist
// 				expect(details.country).to.exist
// 				expect(details.currency).to.exist
// 				expect(details.status).to.exist
// 				Logger.module("UNITTEST").log(`steam wallet details: ${JSON.stringify(details)}`)
// 			})
// 			.catch(e => {
// 								if (e.steamerror) {
// 					console.error(e.steamerror)
// 				}
// 				throw e
// 			})
// 		})
// 	})

// 	describe("initTxn", function() {
// 		it("expect orderid, transaction id, and store url", function() {
// 			return Steam.authenticateUserTicket(ticket)
// 			.then(function(steamId){
// 				expect(steamId).to.exist
// 				return Steam.initTxn({
// 					sandbox: true,
// 					steamId: steamId,
// 					language: 'EN',
// 					currency: 'USD',
// 					items: [{id: 1, qty: 2, amount: 199, description: 'This is an item'}]
// 				})
// 			})
// 			.then(function(transaction){
// 				expect(transaction).to.exist
// 				Logger.module("UNITTEST").log(typeof transaction.orderid)
// 				Logger.module("UNITTEST").log(typeof transaction.transid)
// 				expect(transaction.orderid).to.exist
// 				expect(transaction.transid).to.exist
// 				expect(transaction.steamurl).to.exist
// 				Logger.module("UNITTEST").log(`steam transaction:`)
// 				Logger.module("UNITTEST").log(transaction)
// 				Logger.module("UNITTEST").log(`steam checkout url: ${transaction.steamurl}?returnurl=https://duelyst.com`)
// 			})
// 			.catch(e => {
// 				if (e.steamerror) {
// 					console.error(e.steamerror)
// 				}
// 				throw e
// 			})
// 		})
// 	})

// 	describe("queryTxn", function() {
// 		it("expect to receive transaction status", function() {
// 			return Steam.authenticateUserTicket(ticket)
// 			.then(function(steamId){
// 				expect(steamId).to.exist
// 				return Steam.initTxn({
// 					sandbox: true,
// 					steamId: steamId,
// 					language: 'EN',
// 					currency: 'USD',
// 					items: [{id: 12345, qty: 1, amount: 199, description: 'This is an item'}]
// 				})
// 			})
// 			.then(function(transaction){
// 				expect(transaction).to.exist
// 				expect(transaction.orderid).to.exist
// 				expect(transaction.transid).to.exist
// 				expect(transaction.steamurl).to.exist
// 				Logger.module("UNITTEST").log(`steam transaction:`)
// 				Logger.module("UNITTEST").log(transaction)
// 				Logger.module("UNITTEST").log(`steam checkout url: ${transaction.steamurl}?returnurl=https://duelyst.com`)
// 				return Steam.queryTxn({sandbox: true, orderId: transaction.orderid })
// 			})
// 			.then(function(transactionDetails){
// 				expect(transactionDetails).to.exist
// 				expect(transactionDetails.status).to.exist
// 				Logger.module("UNITTEST").log(`steam transaction details:`)
// 				Logger.module("UNITTEST").log(transactionDetails)
// 				Logger.module("UNITTEST").log(`steam transaction status: ${transactionDetails.status}`)
// 			})
// 			.catch(e => {
// 				if (e.steamerror) {
// 					console.error(e.steamerror)
// 				}
// 				throw e
// 			})
// 		})
// 	})

// 	describe("finalizeTxn", function() {
// 		it("expect to receive transaction status", function() {
// 			return Steam.finalizeTxn({sandbox: true})
// 			.then(function(response){
// 				expect(response).to.exist
// 				Logger.module("UNITTEST").log(response)
// 			})
// 			.catch(e => {
// 				if (e.steamerror) {
// 					console.error(e.steamerror)
// 				}
// 				throw e
// 			})
// 		})
// 	})

// 	describe("refundTxn", function() {
// 		it("expect to receive refund status", function() {
// 			return Steam.refundTxn({sandbox: true})
// 			.then(function(response){
// 				expect(response).to.exist
// 				Logger.module("UNITTEST").log(response)
// 			})
// 			.catch(e => {
// 				if (e.steamerror) {
// 					console.error(e.steamerror)
// 				}
// 				throw e
// 			})
// 		})
// 	})

// 	describe("getReport", function() {
// 		it("expect to receive refund status", function() {
// 			return Steam.getReport({sandbox: true})
// 			.then(function(response){
// 				expect(response).to.exist
// 				Logger.module("UNITTEST").log(response)
// 			})
// 			.catch(e => {
// 				if (e.steamerror) {
// 					console.error(e.steamerror)
// 				}
// 				throw e
// 			})
// 		})
// 	})
// })