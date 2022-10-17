// based on @eanticev's work at http://jsfiddle.net/nysfkakt/12/

var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');

var ListWithPooledRowsView = Marionette.ItemView.extend({

  currentIndex: 0,
  rowsPerPage: 0,
  scrollInsetTop: 0,
  previousScrollTop: 0,
  _listHeight: 0,
  _rowHeight: 0,
  rowTemplate: null,

  ui: {
    $listContainer: '.list-container',
    $list: '.list',
  },

  initialize: function (opts) {
    // bind collection events to live-render changes
    if (this.collection) {
      this.listenTo(this.collection, 'change', this.onModelChanged);
      this.listenTo(this.collection, 'add remove', this.onModelAddedOrRemoved);
    }

    this.itemViewPool = [];
    this.invisibleItemViews = [];

    // TEMP: do a little scroll animation
    // setTimeout(function() {
    //     this.ui.$listContainer.animate({scrollTop:600},500);
    //     // this.ui.$listContainer.scrollTop(500);
    // }.bind(this),1000);
    // setTimeout(function() {
    //     var model = this.collection.at(14);
    //     model.set("name","CHANGE THIS!");
    // }.bind(this),2000);
    // setTimeout(function() {
    //     this.collection.add([{name:"NEW!"}]);
    // }.bind(this),3000);
    // setTimeout(function() {
    //     this.collection.unshift([{name:"NEW 2!"}]);
    // }.bind(this),3000);
  },

  getListHeight: function () {
    return this._listHeight;
  },

  getListHeightForCache: function () {
    return this.ui.$listContainer.height() / CONFIG.globalScale;
  },

  getRowHeight: function () {
    return this._rowHeight;
  },

  getRowHeightForCache: function () {
    return 50.0;
  },

  onResize: function () {
    this.render();
  },

  onRender: function () {
    // reset list height
    this.ui.$listContainer.css('height', '');

    // calculate number of rows that fit in the overall container
    this._listHeight = this.getListHeightForCache() * CONFIG.globalScale;
    this._rowHeight = this.getRowHeightForCache() * CONFIG.globalScale;
    this.rowsPerPage = Math.ceil(this._listHeight / this._rowHeight);

    // set calculated list height
    this.ui.$listContainer.css('height', this._listHeight);

    // console.log("RENDER... this._listHeight", this._listHeight, "this._rowHeight", this._rowHeight, "rowsPerPage" + this.rowsPerPage);

    // generate the item view pool
    this.itemViewPool = [];
    if (this.rowsPerPage > 0) {
      for (var i = 0; i < this.rowsPerPage + 2; i++) {
        var itemView = this.rowTemplate({ index: i, name: 'bla_' + i });
        itemView = $(itemView);
        // add the item to the pool and screen
        this.itemViewPool.push(itemView);
        this.ui.$list.append(itemView);
      }
    }

    this.bindAndReset();
  },

  onShow: function () {
    // listen to global events
    this.listenTo(EventBus.getInstance(), EVENTS.resize, this.onResize);
    this.onResize();
  },

  bindAndReset: function () {
    // unbind the scroll event of the list container to our onScroll handler
    this.ui.$listContainer.off('scroll', this.onScroll.bind(this));

    // reset invisible item views
    this.invisibleItemViews = _.clone(this.itemViewPool);
    _.each(this.invisibleItemViews, function (itemView) {
      $.data(itemView[0], 'top', -1000);
      $.data(itemView[0], 'index', -1);
      itemView.css('transform', 'translateY(-1000px)');
    });

    // set the total height of the inner list
    this.ui.$list.height(this.collection.length * this._rowHeight);

    // scroll to top if needed
    this.ui.$listContainer.scrollTop(0);

    for (var i = 0; i < this.rowsPerPage; i++) {
      // if the item is visible, set it's initial data
      var model = this.collection.at(i);
      if (model) {
        var itemView = this.invisibleItemViews.pop();
        // set the initial item view position
        itemView.css('transform', 'translateY(' + (i * this._rowHeight) + 'px)');
        // set the simple data value for the top offset of this item
        $.data(itemView[0], 'top', (i * this._rowHeight));
        this.bindModelToItemView(model, itemView);
      }
    }

    // set index
    this.currentIndex = 0;
    this.previousScrollTop = 0;

    // bind the scroll event of the list container to our onScroll handler
    this.ui.$listContainer.on('scroll', this.onScroll.bind(this));
  },

  bindItemViewsAfterSort: function () {
    Logger.module('UI').log('ListWithPooledRowsView.bindItemViewsAfterSort()');
    for (var i = Math.max(0, this.currentIndex - 1); i < this.currentIndex + this.rowsPerPage + 1; i++) {
      var model = this.collection.at(i);
      if (model) {
        var itemView = _.find(this.itemViewPool, function (itemView) { return $.data(itemView[0], 'index') == i; });
        if (!itemView) {
          var newTop = i * this._rowHeight;
          itemView = this.invisibleItemViews.pop();
          if (itemView) {
            $.data(itemView, 'top', newTop);
            itemView.css('transform', 'translateY(' + newTop + 'px)');
          } else {
            throw new Error('Out of pooled rows for list.');
          }
        }
        this.bindModelToItemView(model, itemView);
      }
    }
  },

  bindItemViewsAfterScroll: function () {
    var scrollTop = this.ui.$listContainer.scrollTop() - this.scrollInsetTop;
    // var directionDown = (scrollTop - this.previousScrollTop) > 0;
    var index = Math.ceil(scrollTop / this._rowHeight);
    // index = directionDown ? Math.ceil(index) : Math.floor(index);
    var delta = index - this.currentIndex;
    var partialScrollAmount = scrollTop / this._rowHeight % 1;
    this.previousScrollTop = scrollTop;

    if (index != this.currentIndex) {
      // step 1: gather invisible rows
      this.gatherInvisibleItemViews(index);

      // console.log("scrollTop:"+scrollTop+" index:"+index+" delta: "+delta+" invisibleItemViews:"+this.invisibleItemViews.length+" partial:"+partialScrollAmount);

      if (Math.abs(delta) > this.rowsPerPage) {
        // if it's a full page refresh just change out the entire page of rows
        delta = (delta > 0) ? this.rowsPerPage : -this.rowsPerPage;
        for (var i = index - 1; i < index + this.rowsPerPage + 1; i++) {
          var model = this.collection.at(i);
          if (model) {
            // console.log("re-arranging for "+i);
            var newTop = i * this._rowHeight;
            var replacementRow = this.invisibleItemViews.pop();
            if (!replacementRow)
              console.warn('out of replacement rows!');
            this.bindModelToItemView(model, replacementRow);
            $.data(replacementRow[0], 'top', newTop);
            replacementRow.css('transform', 'translateY(' + newTop + 'px)');
          }
        }
      } else {
        // otherwise change just the delta part
        for (var i = 0; i < Math.abs(delta); i++) {
          var k = 0;
          if (delta > 0)
            k = (index) + (this.rowsPerPage - delta) + i;
          else
            k = (index) - delta - (i + 2);
          var model = this.collection.at(k);
          if (model) {
            // console.log("re-arranging for "+k);
            var newTop = k * this._rowHeight;
            var replacementRow = this.invisibleItemViews.pop();
            if (!replacementRow)
              console.warn('out of replacement rows!');
            this.bindModelToItemView(model, replacementRow);
            $.data(replacementRow[0], 'top', newTop);
            replacementRow.css('transform', 'translateY(' + newTop + 'px)');
          }
        }
      }

      this.currentIndex = index;
    }
  },

  gatherInvisibleItemViews: function (index) {
    var containerHeight = this.ui.$listContainer.height();
    var count = 0;
    for (var i = 0; i < this.itemViewPool.length; i++) {
      var itemView = this.itemViewPool[i];
      var itemViewIndex = $.data(itemView[0], 'index');
      // var itemViewTop = parseInt($.data(itemView, 'top'));
      var invisible = false;
      if (itemViewIndex != -1 && (itemViewIndex < index - 1 || itemViewIndex >= index + this.rowsPerPage)) {
        this.invisibleItemViews.push(itemView);
        $.data(itemView[0], 'top', -1000);
        $.data(itemView[0], 'index', -1);
        itemView.css('transform', 'translateY(-1000px)');
        count++;

        invisible = true;
      }
      // console.log("itemView index:"+itemViewIndex+" invisible:"+invisible);
    }

    if (count > 0) {
      // console.log(":: found "+count+" invisible views");
    }
  },

  onModelAddedOrRemoved: function (model, collection, options) {
    var modelIndex = options.index || this.collection.indexOf(model);

    // console.log("MODEL ADDED/REMOVED at INDEX: ",modelIndex, this.currentIndex + this.rowsPerPage);

    this.ui.$list.height(this.collection.length * this._rowHeight);

    if (modelIndex > this.currentIndex + this.rowsPerPage) {
      // an item was added/removed after our current visible page, do nothing
      return;
    } else {
      this.bindItemViewsAfterSort();
    }
  },

  onModelChanged: function (model) {
    var modelIndex = this.collection.indexOf(model);
    for (var i = 0; i < this.itemViewPool.length; i++) {
      var itemView = this.itemViewPool[i];
      if ($.data(itemView[0], 'index') == modelIndex) {
        this.bindModelToItemView(model, itemView);
      }
    }
  },

  bindModelToItemView: function (model, itemView) {
    var modelIndex = this.collection.indexOf(model);
    $.data(itemView[0], 'index', modelIndex);
  },

  onScroll: function () {
    this.bindItemViewsAfterScroll();
  },

  scrollToIndex: function (index) {
    this.ui.$listContainer.scrollTop(this.scrollInsetTop + index * this._rowHeight);
  },
});

// Expose the class either via CommonJS or the global object
module.exports = ListWithPooledRowsView;
