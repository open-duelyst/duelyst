const _ = require('underscore');
const prettyjson = require('prettyjson');

const SDK = require('../app/sdk.coffee');

const rewardsData = [
  { spirit_gained: 23, shards_gained: [1, 2], bonuses_gained: [{ spirit: 2, gold: 10, shards: [1, 2] }] },
  { spirit_gained: 23, shards_gained: [1, 4], bonuses_gained: [{ spirit: 2, gold: 5, shards: [2, 3] }] },
  { spirit_gained: 23, shards_gained: [3, 4], bonuses_gained: [{ spirit: 0, gold: 10, shards: [3, 4] }] },
];

// a little convenience closure we can use to change the INT shards to objects
const convertShardIdsToObjects = function (shards) {
  const newShards = _.map(shards, (rarityId) => SDK.RarityFactory.rarityForIdentifier(rarityId));
  return newShards;
};

// map the rewardsData to a mutable object that can be passed to a backbone model
// if the rewardsData came via XHR, it may not be mutable
const modelRewards = _.map(rewardsData, (reward) => {
  // initialize a new object and copy properties into it.
  const modelReward = _.extend({}, reward);
  // modelReward.shards_gained = convertShardIdsToObjects(reward.shards_gained);
  for (let i = 0; i < modelReward.bonuses_gained.length; i++) {
    const modelBonus = _.extend({}, modelReward.bonuses_gained[i]);
    // modelBonus.shards = convertShardIdsToObjects(modelBonus.shards);
    modelReward.bonuses_gained[i] = modelBonus;
  }
  return modelReward;
});

// initialize the aggregate object if we have none
const memo = { spirit_gained: 0 };
memo.shards_gained = memo.shards_gained || {};
memo.bonuses_gained = memo.bonuses_gained || {};

// reduce the model rewards to a single aggregate object
const reducedModelRewards = _.reduce(modelRewards, (memo, reward) => {
  // turn fixed reward shards into a count array per shardId
  const initialRewardShardCounts = _.countBy(reward.shards_gained, (shardId) => shardId);

  // aggregate spirit
  memo.spirit_gained += reward.spirit_gained;
  // aggregate shards
  for (const shardId in initialRewardShardCounts) {
    if (initialRewardShardCounts[shardId] != null) {
      memo.shards_gained[shardId] = (memo.shards_gained[shardId] || 0) + initialRewardShardCounts[shardId];
    }
  }

  // aggregate the bonuses by slot
  for (let i = 0; i < reward.bonuses_gained.length; i++) {
    // initialize bonus for the slot on the aggreage object
    memo.bonuses_gained[i] = memo.bonuses_gained[i] || { shards: {}, gold: 0, spirit: 0 };
    const totalBonus = memo.bonuses_gained[i];
    const rewardBonus = reward.bonuses_gained[i];

    if (rewardBonus) {
      // aggregate spirit and gold
      totalBonus.spirit += rewardBonus.spirit;
      totalBonus.gold += rewardBonus.gold;
      // aggregate shards
      const rewardShardCounts = _.countBy(rewardBonus.shards, (shardId) => shardId);
      for (const rewardShardId in rewardShardCounts) {
        if (rewardShardCounts[rewardShardId] != null) {
          totalBonus.shards[rewardShardId] = (totalBonus.shards[rewardShardId] || 0) + rewardShardCounts[rewardShardId];
        }
      }
    }
  }

  return memo;
}, memo);

const allRarities = SDK.RarityFactory.getAllRarities();

console.log(prettyjson.render(reducedModelRewards));
