'use strict';

var SDK = require('app/sdk');
var CONFIG = require('app/common/config');
var moment = require('moment');
var _ = require('underscore');
var Template = require('./templates/profile_faction_level_collection.hbs');

var ProfileFactionLevelCollectionView = Backbone.Marionette.ItemView.extend({

  className: 'profile-faction-levels',
  template: Template,

  serializeModel: function (model) {
    var data = model.toJSON.apply(model, _.rest(arguments));

    // ensure all factions are present
    var factionProgressionKeys = Object.keys(data.factionProgression);
    var playableFactions = SDK.FactionFactory.getAllPlayableFactions();
    if (factionProgressionKeys.length < playableFactions.length) {
      for (var i = 0, il = playableFactions.length; i < il; i++) {
        var factionData = playableFactions[i];
        var factionId = factionData.id;
        if (data.factionProgression[factionId] == null) {
          data.factionProgression[factionId] = {
            faction_id: factionId,
          };
        }
      }
    }

    _.each(data.factionProgression, function (v, k) {
      v.faction_name = SDK.FactionFactory.factionForIdentifier(v.faction_id).name;
      v.faction_dev_name = SDK.FactionFactory.factionForIdentifier(v.faction_id).devName;

      if (v.level == null) {
        v.level = 0;
      }
      if (v.xp == null) {
        v.xp = 0;
      }

      // level number users should see is +1 from actual 0-indexed level
      v.level_for_user = v.level + 1;

      var levelXPProgress = v.xp - SDK.FactionProgression.totalXPForLevel(v.level);
      var nextLevel = Math.min(v.level + 1, SDK.FactionProgression.maxLevel);
      v.progress_percent = Math.ceil(100 * levelXPProgress / SDK.FactionProgression.deltaXPForLevel(nextLevel));

      for (var i = Math.min(v.level + 1, SDK.FactionProgression.maxLevel); i < SDK.FactionProgression.maxLevel; i++) {
        var rewardData = SDK.FactionProgression.rewardDataForLevel(v.faction_id, i);
        if (rewardData) {
          if (rewardData.cards) {
            var isPrismaticReward = false;
            var isGeneralReward = false;
            var isNeutralReward = false;

            // TODO: this only accounts for first card reward
            for (var j = 0, jl = rewardData.cards.length; j < jl; j++) {
              var rewardCardData = rewardData.cards[j];
              var rewardCardId = rewardCardData.id;
              var rewardCard = SDK.CardFactory.cardForIdentifier(rewardCardId, SDK.GameSession.getInstance());
              if (rewardCard) {
                if (rewardCard instanceof SDK.Entity && rewardCard.getIsGeneral()) {
                  isGeneralReward = true;
                }
                if (rewardCard.getFactionId() === SDK.Factions.Neutral) {
                  isNeutralReward = true;
                }
                if (SDK.Cards.getIsPrismaticCardId(rewardCard.getId())) {
                  isPrismaticReward = true;
                }
                break;
              }
            }

            if (isGeneralReward) {
              v.next_reward_description = '1 x ' + (isNeutralReward ? 'Neutral' : 'Faction') + (isPrismaticReward ? ' Prismatic ' : ' Alternate ') + 'General';
            } else {
              v.next_reward_description = CONFIG.MAX_DECK_DUPLICATES + ' x ' + (isNeutralReward ? 'Neutral' : 'Faction') + (isPrismaticReward ? ' Prismatic ' : ' Basic ') + 'Card';
            }
          }
          if (rewardData.booster_packs) {
            v.next_reward_description = rewardData.booster_packs + ' Spirit Orb(s)';
          }
          if (rewardData.emotes) {
            v.next_reward_description = 'Faction Emote';
          }
          // level number users should see is +1 from actual 0-indexed level
          v.next_reward_level = i + 1;
          break;
        }
      }
    });
    return data;
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ProfileFactionLevelCollectionView;
