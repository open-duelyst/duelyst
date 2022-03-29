
Rarity = require './rarityLookup'
i18next = require 'i18next'

class RarityFactory

	@rarityForIdentifier: (identifier) ->
		rarity = null

		if identifier == Rarity.Fixed
			rarity =
				id: Rarity.Fixed
				name: i18next.t("rarity.rarity_basic")
				devName: "basic"
				spiritCost: 0
				spiritReward: 0
				spiritCostPrismatic: 0
				spiritRewardPrismatic: 0
				bonusRewardCount: 0
				color: {r: 255, g: 255, b: 255}
				hex: "#CCCCCC"
				isHiddenToUI: false

		if identifier == Rarity.Common
			rarity =
				id: Rarity.Common
				name: i18next.t("rarity.rarity_common")
				devName: "common"
				spiritCost: 40
				spiritReward: 10
				spiritCostPrismatic: 200
				spiritRewardPrismatic: 40
				cosmeticHardPrice: 100
				spiritCostCosmetic: 500
				spiritRewardCosmetic: 50
				bonusRewardCount: 1
				color: {r: 255, g: 255, b: 255}
				hex: "#CCCCCC"
				isHiddenToUI: false

		if identifier == Rarity.Rare
			rarity =
				id: Rarity.Rare
				name: i18next.t("rarity.rarity_rare")
				devName: "rare"
				spiritCost: 100
				spiritReward: 20
				spiritCostPrismatic: 350
				spiritRewardPrismatic: 100
				cosmeticHardPrice: 150
				spiritCostCosmetic: 1000
				spiritRewardCosmetic: 100
				bonusRewardCount: 1
				color: {r: 56, g: 93, b: 255}
				hex: "#6dcff6"
				isHiddenToUI: false

		if identifier == Rarity.Epic
			rarity =
				id: Rarity.Epic
				name: i18next.t("rarity.rarity_epic")
				devName: "epic"
				spiritCost: 350
				spiritReward: 100
				spiritCostPrismatic: 900
				spiritRewardPrismatic: 350
				cosmeticHardPrice: 200
				spiritCostCosmetic: 1500
				spiritRewardCosmetic: 150
				bonusRewardCount: 2
				color: {r: 144, g: 41, b: 255}
				hex: "#f49ac1"
				isHiddenToUI: false

		if identifier == Rarity.Legendary
			rarity =
				id: Rarity.Legendary
				name: i18next.t("rarity.rarity_legendary")
				devName: "legendary"
				spiritCost: 900
				spiritReward: 350
				spiritCostPrismatic: 1800
				spiritRewardPrismatic: 900
				cosmeticHardPrice: 400
				spiritCostCosmetic: 3000
				spiritRewardCosmetic: 350
				bonusRewardCount: 2
				color: {r: 255, g: 120, b: 0}
				hex: "#ffac49"
				isHiddenToUI: false

		if identifier == Rarity.TokenUnit
			rarity =
				id: Rarity.TokenUnit
				devName: "token"
				name: "Token"
				spiritCost: 0
				spiritReward: 0
				bonusRewardCount: 0
				color: {r: 189, g: 189, b: 189}
				hex: "#BDBDBD"
				isHiddenToUI: true

		if identifier == Rarity.Mythron
			rarity =
				id: Rarity.Mythron
				devName: "mythron"
				name: "Mythron"
				spiritCost: 1200
				spiritReward: 0
				spiritCostPrismatic: 2400
				spiritRewardPrismatic: 1200
				bonusRewardCount: 0
				color: {r: 189, g: 189, b: 189}
				hex: "#BDBDBD"
				isHiddenToUI: false

		# no faction found
		if rarity
			return rarity
		else
			console.error "RarityFactory.rarityForIdentifier - Unknown rarity identifier: #{identifier}".red

	@getIsRarityTypeCraftable: (rarityType) ->
		return rarityType != Rarity.Fixed and rarityType != Rarity.TokenUnit

	@getAllRarities: () ->
		rarities = []
		for rarityName of Rarity
			identifier = Rarity[rarityName]
			rarity = @rarityForIdentifier(identifier)
			if rarity?
				rarities.push(rarity)

		return rarities

module.exports = RarityFactory
