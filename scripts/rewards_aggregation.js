var _ = require('underscore');
var prettyjson = require('prettyjson');

var rewardsData = [
	{spirit_gained:23,shards_gained:[1,2],bonuses_gained:[{spirit:2,gold:10,shards:[1,2]}]},
	{spirit_gained:23,shards_gained:[1,4],bonuses_gained:[{spirit:2,gold:5,shards:[2,3]}]},
	{spirit_gained:23,shards_gained:[3,4],bonuses_gained:[{spirit:0,gold:10,shards:[3,4]}]}
];

// a little convenience closure we can use to change the INT shards to objects
var convertShardIdsToObjects = function(shards) {
	var newShards = _.map(shards,function(rarityId){
		return SDK.RarityFactory.rarityForIdentifier(rarityId);
	});
	return newShards;
}

// map the rewardsData to a mutable object that can be passed to a backbone model
// if the rewardsData came via XHR, it may not be mutable
var modelRewards = _.map(rewardsData,function(reward) {
	// initialize a new object and copy properties into it.
	var modelReward = _.extend({},reward);
	// modelReward.shards_gained = convertShardIdsToObjects(reward.shards_gained);
	for (var i=0; i<modelReward.bonuses_gained.length; i++) {
		var modelBonus = _.extend({},modelReward.bonuses_gained[i]);
		// modelBonus.shards = convertShardIdsToObjects(modelBonus.shards);
		modelReward.bonuses_gained[i] = modelBonus;
	}
	return modelReward;
});

console.log(modelRewards.length);

// reduce the model rewards to a single aggregate object

// initialize the aggregate object if we have none
memo = {spirit_gained:0};
memo.shards_gained = memo.shards_gained || {};
memo.bonuses_gained = memo.bonuses_gained || {};

// reduce the model rewards to a single aggregate object
var modelRewards = _.reduce(modelRewards,function(memo,reward) {

	// turn fixed reward shards into a count array per shardId
	var rewardShardCounts = _.countBy(reward.shards_gained,function(shardId) { return shardId; });

	// aggregate spirit
	memo.spirit_gained += reward.spirit_gained;
	// aggregate shards
	for (var shardId in rewardShardCounts) {
		memo.shards_gained[shardId] = (memo.shards_gained[shardId] || 0) + rewardShardCounts[shardId];
	}

	// aggregate the bonuses by slot
	for (var i=0; i<reward.bonuses_gained.length; i++) {
		// initialize bonus for the slot on the aggreage object
		memo.bonuses_gained[i] = memo.bonuses_gained[i] || {shards:{},gold:0,spirit:0};
		var totalBonus = memo.bonuses_gained[i];
		var rewardBonus = reward.bonuses_gained[i];

		if (rewardBonus) {
			// aggregate spirit and gold
			totalBonus.spirit += 	rewardBonus.spirit;
			totalBonus.gold += 		rewardBonus.gold;
			// aggregate shards
			var rewardShardCounts = _.countBy(rewardBonus.shards,function(shardId) { return shardId; });
			for (var shardId in rewardShardCounts) {
				totalBonus.shards[shardId] = (totalBonus.shards[shardId] || 0) + rewardShardCounts[shardId];
			}
		}
	}

	return memo;

},memo);

var allRarities = SDK.RarityFactory.getAllRarities();

// console.log(modelRewards);
console.log(prettyjson.render(modelRewards));