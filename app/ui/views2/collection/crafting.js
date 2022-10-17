'use strict';

var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var SDK = require('app/sdk');
var RSX = require('app/data/resources');
var audio_engine = require('app/audio/audio_engine');
var Animations = require('app/ui/views/animations');
var InventoryManager = require('app/ui/managers/inventory_manager');
var ProgressionManager = require('app/ui/managers/progression_manager');
var NavigationManager = require('app/ui/managers/navigation_manager');
var GameDataManager = require('app/ui/managers/game_data_manager');
var ActivityDialogItemView = require('app/ui/views/item/activity_dialog');
var ErrorDialogItemView = require('app/ui/views/item/error_dialog');
var moment = require('moment');
var i18next = require('i18next');
var CraftingRewardsDialogItemView = require('./crafting_rewards_dialog');
var CraftingTmpl = require('./templates/crafting.hbs');
var CraftingCardCompositeView = require('./crafting_card');

var CraftingCompositeView = Backbone.Marionette.CompositeView.extend({

  id: 'app-crafting',
  className: 'card-container-hover-keywords',

  template: CraftingTmpl,

  childView: CraftingCardCompositeView,
  childViewContainer: '.crafting-card-container',

  ui: {
    $workbench: '.crafting-workbench',
    $instructions: '.crafting-instructions',
    $disenchantAllContainer: '.crafting-disenchant-all-container',
    $buttonCraft: '.crafting-create',
    $buttonDisenchant: '.crafting-disenchant',
    $buttonDisenchantAll: '.crafting-disenchant-all',
    $buttonUnlock: '.skin-unlock',
  },

  events: {
    'click .crafting-cancel': 'onCraftingCancel',
    'click .crafting-create': 'onCraftingCreate',
    'click .crafting-disenchant': 'onCraftingDisenchant',
    'click .crafting-disenchant-all': 'onCraftingDisenchantAll',
    'click .skin-unlock': 'onSkinUnlock',
  },

  onRender: function () {
    this._updateWorkbench();
  },

  onShow: function () {
    InventoryManager.getInstance().onConnect().then(this.onInventoryManagerConnected.bind(this));
  },

  onAddChild: function (cardItemView) {
    this.listenTo(cardItemView, 'select', this.onCraftingCancel);
  },

  onInventoryManagerConnected: function () {
    this.$el.droppable({
      drop: this.onCardDropped.bind(this),
      scope: 'add',
    });
  },

  _updateWorkbench: function () {
    if (this._selectedCardModel != null) {
      this.ui.$workbench.addClass('active');
      this.ui.$instructions.removeClass('active');
      // has resources to craft
      // and owns less than 3 for common to legendary
      // OR and owns less than 1 for Mythron rarity
      if (this.model.get('hasEnoughResources')
        && ((this._selectedCardModel.get('rarityId') != SDK.Rarity.Mythron && this._selectedCardModel.get('inventoryCount') < CONFIG.MAX_DECK_DUPLICATES) || (this._selectedCardModel.get('rarityId') == SDK.Rarity.Mythron && this._selectedCardModel.get('inventoryCount') < 1))) {
        this.ui.$buttonCraft.removeClass('disabled');
      } else {
        this.ui.$buttonCraft.addClass('disabled');
      }
      if (this._selectedCardModel.get('inventoryCount') > 0 && this.model.get('disenchantMaterials')[0].amount != 0) {
        this.ui.$buttonDisenchant.removeClass('disabled');
      } else {
        this.ui.$buttonDisenchant.addClass('disabled');
      }
    } else {
      this.ui.$instructions.addClass('active');
      this.ui.$workbench.removeClass('active');

      if (InventoryManager.getInstance().hasCollectionDuplicates()) {
        this.ui.$disenchantAllContainer.show();
      } else {
        this.ui.$disenchantAllContainer.hide();
      }
    }
  },

  /* CARDS */

  /**
   * Selects a card for crafting by getting the model from a selected card view.
   * @param cardView
   */
  selectCardView: function (cardView) {
    var cardModel = cardView && cardView.model;
    if (cardModel != null && this._selectedCardModel != cardModel) {
      Animations.cssClassAnimation.call(cardView, 'flash-brightness');
      audio_engine.current().play_effect_for_interaction(RSX.sfx_collection_next.audio, CONFIG.SELECT_SFX_PRIORITY);
      this.selectCard(cardModel);
    }
  },

  selectCard: function (cardModel) {
    if (cardModel != null && this._selectedCardModel != cardModel) {
      this.deselectCard(true);

      this._selectedCardModel = cardModel;

      var sdkCard = this._selectedCardModel.get('card');
      if (!sdkCard) {
        throw new Error('Crafting: Attempted to select a card model without an sdk card attached');
      }
      var isPrismatic = SDK.Cards.getIsPrismaticCardId(sdkCard.getId());
      var rarityData = SDK.RarityFactory.rarityForIdentifier(sdkCard.getRarityId());
      var spiritCost;
      var spiritReward;
      if (isPrismatic) {
        spiritCost = rarityData.spiritCostPrismatic;
        spiritReward = rarityData.spiritRewardPrismatic;
      } else {
        spiritCost = rarityData.spiritCost;
        spiritReward = rarityData.spiritReward;
      }
      var rarityName = this._selectedCardModel.get('rarityName');

      var walletModel = InventoryManager.getInstance().walletModel;
      var walletSpirit = walletModel.get('spirit_amount');

      this.model.set({
        hasEnoughResources: (walletSpirit >= spiritCost),
        craftMaterials: [{
          type: 'Spirit',
          localizedType: i18next.t('common.currency_spirit'),
          rarity: '',
          amount: spiritCost,
        }],
      });

      this.listenTo(this._selectedCardModel, 'change', this.bindSelectedCardProperties);
      this.bindSelectedCardProperties();

      this.collection.reset([this._selectedCardModel]);

      InventoryManager.getInstance().getDisenchantPromosCollection().onSyncOrReady().then(function (collection) {
        if (this.isDestroyed || this._selectedCardModel != cardModel) return; // view is destroyed or selection has changed

        var baseCardId = sdkCard.getBaseCardId();
        var promoCardData = collection.get(baseCardId);
        if (promoCardData) {
          var hasExpired = false;
          if (promoCardData.get('expires_at')) {
            hasExpired = moment(new Date()).utc().valueOf() > promoCardData.get('expires_at');
          }
          if (!hasExpired) {
            spiritReward = promoCardData.get('spirit');
            if (spiritReward == 'COST') {
              spiritReward = isPrismatic ? rarityData.spiritCostPrismatic : rarityData.spiritCost;
            }
          }
        }

        this.model.set({
          disenchantMaterials: [{
            type: 'Spirit',
            localizedType: i18next.t('common.currency_spirit'),
            rarity: '',
            amount: spiritReward,
          }],
        });

        this.listenTo(this.model, 'change', this.render);
        this.render();
      }.bind(this));
    }
  },

  /**
   * Deselects the currently crafting card.
   */
  deselectCard: function (withoutReset) {
    var selectedCardModel = this._selectedCardModel;
    if (selectedCardModel != null) {
      this._selectedCardModel = null;
      this.stopListening(selectedCardModel, 'change', this.bindSelectedCardProperties);
      this.stopListening(this.model, 'change', this.render);
      this.model.set({
        hasEnoughResources: false,
        craftMaterials: [],
        disenchantMaterials: [],
      });

      if (!withoutReset) {
        this.collection.reset([]);
        this.render();
      }
    }
  },

  bindSelectedCardProperties: function () {
    if (this._selectedCardModel != null) {
      var cardSetData = SDK.CardSetFactory.cardSetForIdentifier(this._selectedCardModel.get('cardSetId'));
      this.model.set({
        isCraftable: this._selectedCardModel.get('isCraftable'),
        isUnlocked: this._selectedCardModel.get('isUnlocked'),
        isSkinned: this._selectedCardModel.get('isSkinned'),
        isUnlockableThroughProgression: this._selectedCardModel.get('isUnlockableThroughProgression'),
        isUnlockableWithAchievement: this._selectedCardModel.get('isUnlockableWithAchievement'),
        isUnlockablePrismaticWithAchievement: this._selectedCardModel.get('isUnlockablePrismaticWithAchievement'),
        isUnlockablePrismaticWithSpiritOrbs: this._selectedCardModel.get('isUnlockablePrismaticWithSpiritOrbs'),
        isUnlockableWithSpiritOrbs: this._selectedCardModel.get('isUnlockableWithSpiritOrbs'),
        cardSetName: cardSetData.name,
      });
    } else {
      this.model.set({
        isCraftable: false,
        isUnlocked: false,
        isSkinned: false,
        isUnlockableThroughProgression: false,
        isUnlockableWithAchievement: false,
        isUnlockablePrismaticWithAchievement: false,
      });
    }
  },

  getSelectedCardModel: function () {
    return this._selectedCardModel;
  },

  /* CRAFTING */

  /**
   * Cancels out of any crafting sub-view and returns to the instructional view.
   */
  onCraftingCancel: function () {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cardburn.audio, CONFIG.SELECT_SFX_PRIORITY);
    this.deselectCard();
  },

  /**
   * Creates the currently selected card.
   */
  onCraftingCreate: function () {
    // selectedCardModel holds reference to current card in crafting space
    var selectedCardModel = this._selectedCardModel;
    var cardId = selectedCardModel.get('id');
    var sdkCard = selectedCardModel.get('card');
    var inventoryCount = selectedCardModel.get('inventoryCount');

    var confirmationMessage = i18next.t('collection.confirm_card_crafting_message', {
      card_name: (SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) ? 'Prismatic ' : '') + selectedCardModel.get('name'),
      interpolation: { escapeValue: false },
    });
    NavigationManager.getInstance().showDialogForConfirmation(confirmationMessage).then(function () {
      NavigationManager.getInstance().showDialogView(new ActivityDialogItemView());
      InventoryManager.getInstance().craftCard(cardId)
        .then(function (response) {
          // set the new inventory count ... dont wait for firebase
          selectedCardModel.set({ inventoryCount: inventoryCount + 1 });

          // sync wallet data and update crafting state
          var walletData = response.wallet;
          var isPrismatic = SDK.Cards.getIsPrismaticCardId(sdkCard.getId());
          var rarityData = SDK.RarityFactory.rarityForIdentifier(sdkCard.getRarityId());
          var spiritCost = isPrismatic ? rarityData.spiritCostPrismatic : rarityData.spiritCost;
          this.model.set(_.extend({}, walletData, {
            hasEnoughResources: (walletData.spirit_amount >= spiritCost),
          }));

          // hide dialog
          NavigationManager.getInstance().destroyDialogView();
        }.bind(this))
        .catch(function (errorMessage) {
          NavigationManager.getInstance().showDialogViewByClass(ErrorDialogItemView, { title: 'Oops... there was a problem crafting your card.', message: errorMessage });
        }.bind(this));
    }.bind(this));
  },

  /**
   * Disenchants the currently selected card.
   */
  onCraftingDisenchant: function () {
    // selectedCardModel holds reference to current card in crafting space
    var selectedCardModel = this._selectedCardModel;
    var cardId = selectedCardModel.get('id');
    var sdkCard = selectedCardModel.get('card');
    var inventoryCount = selectedCardModel.get('inventoryCount');
    var confirmationMessage = i18next.t('collection.confirm_card_disenchanting_message', {
      card_name: (SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) ? 'Prismatic ' : '') + selectedCardModel.get('name'),
      interpolation: { escapeValue: false },
    });
    NavigationManager.getInstance().showDialogForConfirmation(confirmationMessage).then(function () {
      NavigationManager.getInstance().showDialogView(new ActivityDialogItemView());
      InventoryManager.getInstance().disenchantCards([cardId])
        .then(function (response) {
          // set the new inventory count and dont wait for firebase
          selectedCardModel.set('inventoryCount', inventoryCount - 1);

          // sync wallet data and update crafting state
          var walletData = response.wallet;
          var isPrismatic = SDK.Cards.getIsPrismaticCardId(sdkCard.getId());
          var rarityData = SDK.RarityFactory.rarityForIdentifier(sdkCard.getRarityId());
          var spiritCost = isPrismatic ? rarityData.spiritCostPrismatic : rarityData.spiritCost;
          this.model.set(_.extend({}, walletData, {
            hasEnoughResources: (walletData.spirit_amount >= spiritCost),
          }));

          // hide dialog
          NavigationManager.getInstance().destroyDialogView();

          // show rewards
          this.showRewardsDialogWithData(response.rewards);
        }.bind(this))
        .catch(function (errorMessage) {
          NavigationManager.getInstance().showDialogViewByClass(ErrorDialogItemView, { title: 'Oops... there was a problem disenchanting your cards.', message: errorMessage });
        }.bind(this));
    }.bind(this));
  },

  /**
   * Disenchants all cards in inventory that are craftable and have more than CONFIG.MAX_DECK_DUPLICATES copies.
   */
  onCraftingDisenchantAll: function () {
    NavigationManager.getInstance().showDialogForConfirmation(i18next.t('collection.confirm_card_disenchant_all_message')).then(function () {
      NavigationManager.getInstance().showDialogView(new ActivityDialogItemView());

      // super poor-man's solution here:
      InventoryManager.getInstance().cardsCollection.once('change', function () {
        // when we get the new inventory data from Firebase, destroy dialog...
        NavigationManager.getInstance().destroyDialogView();
      });

      InventoryManager.getInstance().disenchantDuplicateCards()
        .then(function (response) {
          // sync local wallet data copy and don't wait for firebase
          this.model.set(response.wallet);

          // poor man's way of removing card from sidebar
          this.onCraftingCancel();

          // show rewards
          this.showRewardsDialogWithData(response.rewards);

          // fade out the dis-enchant all area
          this.ui.$disenchantAllContainer.fadeOut();
        }.bind(this))
        .catch(function (errorMessage) {
          NavigationManager.getInstance().showDialogView(new ErrorDialogItemView({ title: 'Oops... there was a problem disenchanting your cards.', message: errorMessage }));
        }.bind(this));
    }.bind(this));
  },

  onSkinUnlock: function () {
    var cardId = this._selectedCardModel.get('id');
    var skinId = SDK.Cards.getCardSkinIdForCardId(cardId);
    if (InventoryManager.getInstance().getCanPurchaseCosmeticById(skinId)) {
      // buy skin
      var productData = SDK.CosmeticsFactory.cosmeticProductDataForIdentifier(skinId);
      NavigationManager.getInstance().showDialogForConfirmPurchase(productData)
        .bind(this)
        .catch(function () {
        // do nothing on cancel
        });
    }
  },

  showRewardsDialogWithData: function (rewardsData) {
    // STEP 1: map the rewardsData to a mutable object that can be passed to a backbone model
    // if the rewardsData came via XHR, it may not be mutable
    var modelRewards = _.map(rewardsData, function (reward) {
      // initialize a new object and copy properties into it.
      var modelReward = _.extend({}, reward);
      return modelReward;
    });

    // STEP 2: reduce the model rewards to a single aggregate object

    // initialize the aggregate object if we have none
    var memo = { spirit_gained: 0 };

    // reduce the model rewards to a single aggregate object
    var modelRewards = _.reduce(modelRewards, function (memo, reward) {
      // aggregate spirit
      memo.spirit_gained += reward.spirit_gained;

      return memo;
    }, memo);

    // show rewards dialog
    NavigationManager.getInstance().showDialogView(new CraftingRewardsDialogItemView({ model: new Backbone.Model(modelRewards) }));
  },

  /* DRAG AND DROP */

  onCardDropped: function (event, ui) {
    // don't respond to own cards
    var $draggable = ui.draggable;
    if ($draggable instanceof $ && !$draggable.hasClass('crafting-card')) {
      $draggable.trigger('click');
    }
  },

});

// Expose the class either via CommonJS or the global object
module.exports = CraftingCompositeView;
