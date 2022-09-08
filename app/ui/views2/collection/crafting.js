const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const audio_engine = require('app/audio/audio_engine');
const Animations = require('app/ui/views/animations');
const InventoryManager = require('app/ui/managers/inventory_manager');
const ProgressionManager = require('app/ui/managers/progression_manager');
const NavigationManager = require('app/ui/managers/navigation_manager');
const GameDataManager = require('app/ui/managers/game_data_manager');
const ActivityDialogItemView = require('app/ui/views/item/activity_dialog');
const ErrorDialogItemView = require('app/ui/views/item/error_dialog');
const moment = require('moment');
const i18next = require('i18next');
const CraftingRewardsDialogItemView = require('./crafting_rewards_dialog.js');
const CraftingTmpl = require('./templates/crafting.hbs');
const CraftingCardCompositeView = require('./crafting_card.js');

const CraftingCompositeView = Backbone.Marionette.CompositeView.extend({

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

  onRender() {
    this._updateWorkbench();
  },

  onShow() {
    InventoryManager.getInstance().onConnect().then(this.onInventoryManagerConnected.bind(this));
  },

  onAddChild(cardItemView) {
    this.listenTo(cardItemView, 'select', this.onCraftingCancel);
  },

  onInventoryManagerConnected() {
    this.$el.droppable({
      drop: this.onCardDropped.bind(this),
      scope: 'add',
    });
  },

  _updateWorkbench() {
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
  selectCardView(cardView) {
    const cardModel = cardView && cardView.model;
    if (cardModel != null && this._selectedCardModel != cardModel) {
      Animations.cssClassAnimation.call(cardView, 'flash-brightness');
      audio_engine.current().play_effect_for_interaction(RSX.sfx_collection_next.audio, CONFIG.SELECT_SFX_PRIORITY);
      this.selectCard(cardModel);
    }
  },

  selectCard(cardModel) {
    if (cardModel != null && this._selectedCardModel != cardModel) {
      this.deselectCard(true);

      this._selectedCardModel = cardModel;

      const sdkCard = this._selectedCardModel.get('card');
      if (!sdkCard) {
        throw new Error('Crafting: Attempted to select a card model without an sdk card attached');
      }
      const isPrismatic = SDK.Cards.getIsPrismaticCardId(sdkCard.getId());
      const rarityData = SDK.RarityFactory.rarityForIdentifier(sdkCard.getRarityId());
      let spiritCost;
      let spiritReward;
      if (isPrismatic) {
        spiritCost = rarityData.spiritCostPrismatic;
        spiritReward = rarityData.spiritRewardPrismatic;
      } else {
        spiritCost = rarityData.spiritCost;
        spiritReward = rarityData.spiritReward;
      }
      const rarityName = this._selectedCardModel.get('rarityName');

      const { walletModel } = InventoryManager.getInstance();
      const walletSpirit = walletModel.get('spirit_amount');

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

      InventoryManager.getInstance().getDisenchantPromosCollection().onSyncOrReady().then((collection) => {
        if (this.isDestroyed || this._selectedCardModel != cardModel) return; // view is destroyed or selection has changed

        const baseCardId = sdkCard.getBaseCardId();
        const promoCardData = collection.get(baseCardId);
        if (promoCardData) {
          let hasExpired = false;
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
      });
    }
  },

  /**
   * Deselects the currently crafting card.
   */
  deselectCard(withoutReset) {
    const selectedCardModel = this._selectedCardModel;
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

  bindSelectedCardProperties() {
    if (this._selectedCardModel != null) {
      const cardSetData = SDK.CardSetFactory.cardSetForIdentifier(this._selectedCardModel.get('cardSetId'));
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

  getSelectedCardModel() {
    return this._selectedCardModel;
  },

  /* CRAFTING */

  /**
   * Cancels out of any crafting sub-view and returns to the instructional view.
   */
  onCraftingCancel() {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cardburn.audio, CONFIG.SELECT_SFX_PRIORITY);
    this.deselectCard();
  },

  /**
   * Creates the currently selected card.
   */
  onCraftingCreate() {
    // selectedCardModel holds reference to current card in crafting space
    const selectedCardModel = this._selectedCardModel;
    const cardId = selectedCardModel.get('id');
    const sdkCard = selectedCardModel.get('card');
    const inventoryCount = selectedCardModel.get('inventoryCount');

    const confirmationMessage = i18next.t('collection.confirm_card_crafting_message', {
      card_name: (SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) ? 'Prismatic ' : '') + selectedCardModel.get('name'),
      interpolation: { escapeValue: false },
    });
    NavigationManager.getInstance().showDialogForConfirmation(confirmationMessage).then(() => {
      NavigationManager.getInstance().showDialogView(new ActivityDialogItemView());
      InventoryManager.getInstance().craftCard(cardId)
        .then((response) => {
          // set the new inventory count ... dont wait for firebase
          selectedCardModel.set({ inventoryCount: inventoryCount + 1 });

          // sync wallet data and update crafting state
          const walletData = response.wallet;
          const isPrismatic = SDK.Cards.getIsPrismaticCardId(sdkCard.getId());
          const rarityData = SDK.RarityFactory.rarityForIdentifier(sdkCard.getRarityId());
          const spiritCost = isPrismatic ? rarityData.spiritCostPrismatic : rarityData.spiritCost;
          this.model.set(_.extend({}, walletData, {
            hasEnoughResources: (walletData.spirit_amount >= spiritCost),
          }));

          // hide dialog
          NavigationManager.getInstance().destroyDialogView();
        })
        .catch((errorMessage) => {
          NavigationManager.getInstance().showDialogViewByClass(ErrorDialogItemView, { title: 'Oops... there was a problem crafting your card.', message: errorMessage });
        });
    });
  },

  /**
   * Disenchants the currently selected card.
   */
  onCraftingDisenchant() {
    // selectedCardModel holds reference to current card in crafting space
    const selectedCardModel = this._selectedCardModel;
    const cardId = selectedCardModel.get('id');
    const sdkCard = selectedCardModel.get('card');
    const inventoryCount = selectedCardModel.get('inventoryCount');
    const confirmationMessage = i18next.t('collection.confirm_card_disenchanting_message', {
      card_name: (SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) ? 'Prismatic ' : '') + selectedCardModel.get('name'),
      interpolation: { escapeValue: false },
    });
    NavigationManager.getInstance().showDialogForConfirmation(confirmationMessage).then(() => {
      NavigationManager.getInstance().showDialogView(new ActivityDialogItemView());
      InventoryManager.getInstance().disenchantCards([cardId])
        .then((response) => {
          // set the new inventory count and dont wait for firebase
          selectedCardModel.set('inventoryCount', inventoryCount - 1);

          // sync wallet data and update crafting state
          const walletData = response.wallet;
          const isPrismatic = SDK.Cards.getIsPrismaticCardId(sdkCard.getId());
          const rarityData = SDK.RarityFactory.rarityForIdentifier(sdkCard.getRarityId());
          const spiritCost = isPrismatic ? rarityData.spiritCostPrismatic : rarityData.spiritCost;
          this.model.set(_.extend({}, walletData, {
            hasEnoughResources: (walletData.spirit_amount >= spiritCost),
          }));

          // hide dialog
          NavigationManager.getInstance().destroyDialogView();

          // show rewards
          this.showRewardsDialogWithData(response.rewards);
        })
        .catch((errorMessage) => {
          NavigationManager.getInstance().showDialogViewByClass(ErrorDialogItemView, { title: 'Oops... there was a problem disenchanting your cards.', message: errorMessage });
        });
    });
  },

  /**
   * Disenchants all cards in inventory that are craftable and have more than CONFIG.MAX_DECK_DUPLICATES copies.
   */
  onCraftingDisenchantAll() {
    NavigationManager.getInstance().showDialogForConfirmation(i18next.t('collection.confirm_card_disenchant_all_message')).then(() => {
      NavigationManager.getInstance().showDialogView(new ActivityDialogItemView());

      // super poor-man's solution here:
      InventoryManager.getInstance().cardsCollection.once('change', () => {
        // when we get the new inventory data from Firebase, destroy dialog...
        NavigationManager.getInstance().destroyDialogView();
      });

      InventoryManager.getInstance().disenchantDuplicateCards()
        .then((response) => {
          // sync local wallet data copy and don't wait for firebase
          this.model.set(response.wallet);

          // poor man's way of removing card from sidebar
          this.onCraftingCancel();

          // show rewards
          this.showRewardsDialogWithData(response.rewards);

          // fade out the dis-enchant all area
          this.ui.$disenchantAllContainer.fadeOut();
        })
        .catch((errorMessage) => {
          NavigationManager.getInstance().showDialogView(new ErrorDialogItemView({ title: 'Oops... there was a problem disenchanting your cards.', message: errorMessage }));
        });
    });
  },

  onSkinUnlock() {
    const cardId = this._selectedCardModel.get('id');
    const skinId = SDK.Cards.getCardSkinIdForCardId(cardId);
    if (InventoryManager.getInstance().getCanPurchaseCosmeticById(skinId)) {
      // buy skin
      const productData = SDK.CosmeticsFactory.cosmeticProductDataForIdentifier(skinId);
      NavigationManager.getInstance().showDialogForConfirmPurchase(productData)
        .bind(this)
        .catch(() => {
          // do nothing on cancel
        });
    }
  },

  showRewardsDialogWithData(rewardsData) {
    // STEP 1: map the rewardsData to a mutable object that can be passed to a backbone model
    // if the rewardsData came via XHR, it may not be mutable
    var modelRewards = _.map(rewardsData, (reward) => {
      // initialize a new object and copy properties into it.
      const modelReward = _.extend({}, reward);
      return modelReward;
    });

    // STEP 2: reduce the model rewards to a single aggregate object

    // initialize the aggregate object if we have none
    const memo = { spirit_gained: 0 };

    // reduce the model rewards to a single aggregate object
    var modelRewards = _.reduce(modelRewards, (memo, reward) => {
      // aggregate spirit
      memo.spirit_gained += reward.spirit_gained;

      return memo;
    }, memo);

    // show rewards dialog
    NavigationManager.getInstance().showDialogView(new CraftingRewardsDialogItemView({ model: new Backbone.Model(modelRewards) }));
  },

  /* DRAG AND DROP */

  onCardDropped(event, ui) {
    // don't respond to own cards
    const $draggable = ui.draggable;
    if ($draggable instanceof $ && !$draggable.hasClass('crafting-card')) {
      $draggable.trigger('click');
    }
  },

});

// Expose the class either via CommonJS or the global object
module.exports = CraftingCompositeView;
