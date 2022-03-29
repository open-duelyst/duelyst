'use strict'

// npm modules
import _ from 'underscore'
import fs from 'fs'
import qs from 'querystring'
import gulp from 'gulp'
import gutil from 'gulp-util'
import Promise from 'bluebird'
import config from 'config/config'
import ProgressBar from 'progress'
import colors from 'colors'

// local modules
import ShopData from 'app/data/shop.json'
import CosmeticsFactory from 'app/sdk/cosmetics/cosmeticsFactory'
import CosmeticsTypeLookup from 'app/sdk/cosmetics/cosmeticsTypeLookup'
import RarityFactory from 'app/sdk/cards/rarityFactory'
// import PaypalExpress from 'paypal-express'

const paths = []
Promise.promisifyAll(fs)

function deleteAllPaypalButtons(request) {
	return request.makeRequestAsync({
		'METHOD': 'BMButtonSearch',
		"STARTDATE": '2012-08-24T05:38:48Z'
	})
	.bind({})
	.then(function(response){
		// parse out the paypal response
		var responseData = qs.parse(response.toString())
		var buttons = []
		for (var i=0; i<500; i++) {
			if (responseData["L_HOSTEDBUTTONID"+i]) {
				buttons.push({
					id: responseData["L_HOSTEDBUTTONID"+i],
					type: responseData["L_BUTTONTYPE"+i],
					itemName: responseData["L_ITEMNAME"+i],
				})
			} else {
				break
			}
		}

		this.buttons = buttons
		gutil.log("existing buttons count:",buttons.length)

		var bar = new ProgressBar('deleting '+buttons.length+' paypal buttons [:bar] :percent :etas', {
			complete: '='.yellow,
			incomplete: ' ',
			width: 50,
			total: buttons.length
		})

		return Promise.map(buttons,function(b) {
			return request.makeRequestAsync({
				"METHOD": 'BMManageButtonStatus',
				"HOSTEDBUTTONID": b.id,
				"BUTTONSTATUS": "DELETE"
			}).then(function(r){
				bar.tick()
				return r
			}).catch(function(e){
				gutil.log(gutil.colors.red("error: " + e.message))
				throw e
			})
		},{concurrency:5})
	})
	.then(function(){
		if (this.buttons.length >= 100) {
			return deleteAllPaypalButtons(request)
		}
	})
}

/**
* Creates or syncs paypal buttons for all cosmetics.
* @see: https://developer.paypal.com/docs/classic/button-manager/integration-guide/#id093PD0M07HS
* @see: https://developer.paypal.com/docs/classic/button-manager/integration-guide/examples/
*/
export function syncPaypalButtons() {

	// gutil.log("syncing paypal NVP buttons for ENV:" + config.get('env'))
	// gutil.log("Using Sandbox:" + config.get('paypalNvpApi.sandbox'))

	// var request = new PaypalExpress.NVPRequest(config.get("paypalNvpApi.username"),config.get("paypalNvpApi.password"),config.get("paypalNvpApi.signature"))
	// request.useSandbox(config.get('paypalNvpApi.sandbox'))
	// Promise.promisifyAll(request)

	// return deleteAllPaypalButtons(request).then(function(){

	// 	// array to collect all the paypal button requests
	// 	var allButtonNvpRequestParams = []
	// 	this.productSKUs = []

	// 	var cosmetics = _.filter(CosmeticsFactory.getAllCosmetics(),(cosmetic)=> { return (cosmetic.rarityId && cosmetic.purchasable) })
	// 	var products = _.map(cosmetics,(cosmetic)=> { return CosmeticsFactory.cosmeticProductAttrsForIdentifier(cosmetic.id) })
	// 	products = _.union(products,_.values(ShopData["packs"]))
	// 	products = _.union(products,_.values(ShopData["gauntlet"]))
	// 	products = _.union(products,_.values(ShopData["earned_specials"]))
	// 	products = _.union(products,_.values(ShopData["bundles"]))
	// 	products = _.union(products,_.values(ShopData["loot_chest_keys"]))

	// 	var bar = new ProgressBar('updating paypal buttons [:bar] :percent :etas', {
	// 		complete: '='.cyan,
	// 		incomplete: ' ',
	// 		width: 50,
	// 		total: products.length
	// 	})

	// 	// for each product, create or update the paypal button
	// 	_.each(products, (productAttributes)=>{

	// 		if (!productAttributes.sku || !productAttributes.price) {
	// 			gutil.log(gutil.colors.red("bad product data: "))
	// 			console.log(productAttributes)
	// 			return
	// 		}

	// 		// add sku to array to map to button IDs after all requests complete
	// 		this.productSKUs.push(productAttributes.sku)
	// 		// first try to find an existing button
	// 		var button = null // _.find(buttons,(b)=>{ return b.itemNumber === productAttributes.sku })
	// 		// assemble the button NVP API request parameters
	// 		var requestParams = {
	// 			"BUTTONTYPE": 'BUYNOW',
	// 			"BUTTONSUBTYPE": 'PRODUCTS',
	// 			'L_BUTTONVAR1': 'item_name=' + (productAttributes.name || "DUELYST Cosmetic Item "+productAttributes.steam_id),
	// 			'L_BUTTONVAR2': 'item_number=' + productAttributes.sku,
	// 			'L_BUTTONVAR3': 'amount=' + productAttributes.price/100,
	// 			'L_BUTTONVAR4': 'no_shipping=1',
	// 			'L_BUTTONVAR5': 'currency_code=USD'
	// 		}
	// 		// create or update the button
	// 		if (button) {
	// 			gutil.log(gutil.colors.blue("updating button for SKU: "+productAttributes.sku))
	// 			requestParams["METHOD"] = 'BMUpdateButton'
	// 			requestParams["HOSTEDBUTTONID"] = button.id
	// 		} else {
	// 			gutil.log(gutil.colors.green("creating button for SKU: "+productAttributes.sku))
	// 			requestParams["METHOD"] = 'BMCreateButton'
	// 		}

	// 		allButtonNvpRequestParams.push(requestParams)
	// 	})

	// 	// resolve when all button requests are done
	// 	return Promise.map(allButtonNvpRequestParams,function(requestParams){
	// 		var p = request.makeRequestAsync(requestParams)
	// 		// var p = Promise.resolve("HOSTEDBUTTONID="+productAttributes.sku)
	// 		p.then(function(){ bar.tick() })
	// 		p.catch(function(e){ console.error("ERROR:",e) })
	// 		return p
	// 	},{concurrency:5})

	// }).then(function(responses){
	// 	var json = { "paypalButtons": {} }
	// 	_.each(responses,(response,i)=>{
	// 		// gutil.log(response)
	// 		var responseData = qs.parse(response.toString())
	// 		gutil.log(this.productSKUs[i] + " -> " + responseData["HOSTEDBUTTONID"])
	// 		json["paypalButtons"][this.productSKUs[i]] = responseData["HOSTEDBUTTONID"]
	// 	})
	// 	var paypalMode = config.get('paypalNvpApi.sandbox') ? "sandbox" : "production"
	// 	var path = __dirname + "/../app/data/shop-paypal-buttons-" + paypalMode + ".json"
	// 	console.log(path)
	// 	return fs.writeFileAsync(path, JSON.stringify(json))
	// }).catch((error) => {
	// 	gutil.log("ERROR:",error)
	// 	throw error
	// })
}

/**
* Same as above but PURELY additive. Does not account for any changes to existing buttons or removal of any products.
* @see: https://developer.paypal.com/docs/classic/button-manager/integration-guide/#id093PD0M07HS
* @see: https://developer.paypal.com/docs/classic/button-manager/integration-guide/examples/
*/
export function addPaypalButtons() {

	// gutil.log("adding new paypal NVP buttons for ENV:" + config.get('env'))
	// gutil.log("Using Sandbox:" + config.get('paypalNvpApi.sandbox'))

	// var request = new PaypalExpress.NVPRequest(config.get("paypalNvpApi.username"),config.get("paypalNvpApi.password"),config.get("paypalNvpApi.signature"))
	// request.useSandbox(config.get('paypalNvpApi.sandbox'))
	// Promise.promisifyAll(request)

	// return Promise.resolve()
	// .bind({})
	// .then(function(){

	// 	// array to collect all the paypal button requests
	// 	var allButtonNvpRequestParams = []
	// 	this.productSKUs = []

	// 	var cosmetics = _.filter(CosmeticsFactory.getAllCosmetics(),(cosmetic)=> { return (cosmetic.rarityId && cosmetic.purchasable) })
	// 	var products = _.map(cosmetics,(cosmetic)=> { return CosmeticsFactory.cosmeticProductAttrsForIdentifier(cosmetic.id) })
	// 	products = _.union(products,_.values(ShopData["packs"]))
	// 	products = _.union(products,_.values(ShopData["gauntlet"]))
	// 	products = _.union(products,_.values(ShopData["earned_specials"]))
	// 	products = _.union(products,_.values(ShopData["bundles"]))
	// 	products = _.union(products,_.values(ShopData["loot_chest_keys"]))
	// 	products = _.union(products,_.values(ShopData["rift"]))

	// 	// filter out to leave only NEWLY added products since last sync
	// 	var paypalMode = config.get('paypalNvpApi.sandbox') ? "sandbox" : "production"
	// 	var existingButtons = require("app/data/shop-paypal-buttons-"+paypalMode+".json").paypalButtons
	// 	this.existingButtons = existingButtons
	// 	products = _.filter(products,function(p) { return existingButtons[p.sku] === undefined })

	// 	var bar = new ProgressBar('adding paypal buttons [:bar] :percent :etas', {
	// 		complete: '='.cyan,
	// 		incomplete: ' ',
	// 		width: 50,
	// 		total: products.length
	// 	})

	// 	// for each product, create or update the paypal button
	// 	_.each(products, (productAttributes)=>{

	// 		if (!productAttributes.sku || !productAttributes.price) {
	// 			gutil.log(gutil.colors.red("bad product data: "))
	// 			console.log(productAttributes)
	// 			return
	// 		}

	// 		// add sku to array to map to button IDs after all requests complete
	// 		this.productSKUs.push(productAttributes.sku)
	// 		// first try to find an existing button
	// 		var button = null // _.find(buttons,(b)=>{ return b.itemNumber === productAttributes.sku })
	// 		// assemble the button NVP API request parameters
	// 		var requestParams = {
	// 			"BUTTONTYPE": 'BUYNOW',
	// 			"BUTTONSUBTYPE": 'PRODUCTS',
	// 			'L_BUTTONVAR1': 'item_name=' + (productAttributes.name || "DUELYST Cosmetic Item "+productAttributes.steam_id),
	// 			'L_BUTTONVAR2': 'item_number=' + productAttributes.sku,
	// 			'L_BUTTONVAR3': 'amount=' + productAttributes.price/100,
	// 			'L_BUTTONVAR4': 'no_shipping=1',
	// 			'L_BUTTONVAR5': 'currency_code=USD'
	// 		}
	// 		// create or update the button
	// 		if (button) {
	// 			gutil.log(gutil.colors.blue("updating button for SKU: "+productAttributes.sku))
	// 			requestParams["METHOD"] = 'BMUpdateButton'
	// 			requestParams["HOSTEDBUTTONID"] = button.id
	// 		} else {
	// 			gutil.log(gutil.colors.green("creating button for SKU: "+productAttributes.sku))
	// 			requestParams["METHOD"] = 'BMCreateButton'
	// 		}

	// 		allButtonNvpRequestParams.push(requestParams)
	// 	})

	// 	// resolve when all button requests are done
	// 	return Promise.map(allButtonNvpRequestParams,function(requestParams){
	// 		var p = request.makeRequestAsync(requestParams)
	// 		// var p = Promise.resolve("HOSTEDBUTTONID="+productAttributes.sku)
	// 		p.then(function(){ bar.tick() })
	// 		p.catch(function(e){ console.error("ERROR:",e) })
	// 		return p
	// 	},{concurrency:5})

	// }).then(function(responses){
	// 	var json = { "paypalButtons": this.existingButtons  }
	// 	_.each(responses,(response,i)=>{
	// 		// gutil.log(response)
	// 		var responseData = qs.parse(response.toString())
	// 		gutil.log(this.productSKUs[i] + " -> " + responseData["HOSTEDBUTTONID"])
	// 		json["paypalButtons"][this.productSKUs[i]] = responseData["HOSTEDBUTTONID"]
	// 	})
	// 	var paypalMode = config.get('paypalNvpApi.sandbox') ? "sandbox" : "production"
	// 	var path = __dirname + "/../app/data/shop-paypal-buttons-" + paypalMode + ".json"
	// 	console.log(path)
	// 	return fs.writeFileAsync(path, JSON.stringify(json))
	// }).catch((error) => {
	// 	gutil.log("ERROR:",error)
	// 	throw error
	// })
}
