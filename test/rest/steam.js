// var expect = require('chai').expect
// var request = require('supertest')('http://127.0.0.1:3000')
// var version = require("../../version.json").version
// var Logger = require('../../app/common/logger')
// Logger.enabled = true

// const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkIjp7ImlkIjoiLUs5RXpYc0hIdFFtV2hXSm1fUmQiLCJlbWFpbCI6Im1oaWxtaStmdWszQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiZnVrMyJ9LCJ2IjowLCJpYXQiOjE0NjcwNjEwNDgsImV4cCI6MTQ2ODI3MDY0OH0.4-X2T9BkdW4nTuqhe3t-32MEwlGl0vMLI4BUP3dWxdk"
// const ticket = "14000000A5BA5955C3F78FFD88D38A00010010019B867157180000000100000002000000B7277462000000003EEF340004000000B2000000320000000400000088D38A000100100152720400B7277462510000640000000002926457824180570100A39F000000000000092B3D81F478CFFE6F18D49576C3209EADB625B2468A8719E4AE99BC1D5CA9092D366676C8EB90989D66C2419C5228822F3E24B16D7EDE08A9B020305B166D46A8D7341129DAC67A2C02F37D397F523B9D5B7D0573CB72B3A18A653907A25354CD639CB746F20A5F36DD38168E1A9D10CD781F5D08372C868E024B6E83B3E60F"

// describe('steam api requests', function () {
// 	describe('/steam/init_txn', function() {
// 		it('returns 200 OK', function(done) {
// 			this.timeout(2500);
// 			request
// 				.post('/steam/init_txn')
// 				.set('Client-Version', version)
// 				.set('Authorization', 'Bearer ' + token)
// 				.send({
// 					steam_ticket: ticket,
// 					product_sku: 'BOOSTER2'
// 				})
// 				.expect(200)
// 				.end(function(err,res){
// 					expect(err).to.be.equal(null)
// 					expect(res.body).to.exist
// 					expect(res.body.steamurl).to.exist
// 					Logger.module("UNITTEST").log(res.body)
// 					done()
// 				})
// 		})
// 	})
// })
