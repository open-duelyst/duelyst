## Backbone VirtualCollection

<a href="http://teambox.com"><img alt="Built at Teambox" src="http://i.imgur.com/hqNPlHe.png"/></a>

![Build Status](https://travis-ci.org/p3drosola/Backbone.VirtualCollection.svg?branch=master)

Backbone VirtualCollection allows you display a subset of a Backbone collection in a Backbone view that updates in real time. It works great with Marionette CollectionViews.

If you're thinking "why don't you just place the models you're interested in a new collection?" the answer is that the new collection won't update itself when new models are added to the original collection, so you're creating data inconsitency. That's why we need a VirtualCollection.

<img src="https://cloud.githubusercontent.com/assets/520550/3748311/ebb80894-17da-11e4-835b-ca733a889d0d.png">

### Installation
a) with npm `npm install backbone-virtual-collection`

b) or manually add `backbone.virtual-collection.js` directly to your web app.

### Usage

For example, let's say you have a task collection, and want to show a list of tasks that belong to a specific user.

We can instantiate a virtual collection that only contains tasks that belong to Rupert (who has user_id 13).
The constructor takes two parameters, the first is the parent collection, the second is a options object. The `filter` option specifies a function that takes the model as argument. You can also just specify a hash of attributes to match.

```js
var virtual_collection = new VirtualCollection(tasks_collection, {
  filter: function (task) {
    return task.get('user_id') == 13;
  }
});
// or using a hash of attributes to match
virtual_collection = new VirtualCollection(tasks_collection, {
  filter: {
    user_id: 13
  }
});

var view = new TaskListView({
  collection: virtual_collection
});

```

The Marionette collection view will only display the tasks that belong to Rupert, and it will update automatically. In other words, when a task is created that belongs to Rupert it will appear, but not if it belongs to Bob.

#### Sorting
Be default, the virtual collection will have the same sorting order as the parent collection. However, a comparator can be specified to change this. The comparator behaves like a [Backbone comparator](http://backbonejs.org/#Collection-comparator). In other words, you can specify a function or the name of an attribute to sort by.


```js
var virtual_collection = new VirtualCollection(tasks_collection, {
  filter: { user_id: 13 },
  comparator: 'name'
});
// tasks in the virtual_collection will be sorted by name
```
You can also change the sorting order on the fly.
```js
virtual_collection.comparator = 'created_at';
virtual_collection.sort(); // triggers sort event
// virtual_collection is now sorted by date, but the parent collection has not changed
```

#### Unbinding
The virtual collection will keep listening to its parent collection until you call `stopListening`.

You can pass a `destroy_with` option when creating the virtual collection being that an event emitter. The virtual collection will stop listening to events when the `destroy_with` event emitter emits a `destroy` event.

```js
var virtual_collection = new Backbone.VirtualCollection(collection, {
  filter: {foo: 'bar'},
  destroy_with: view
});

```
**Note:**  Prior to Marionette 2.*, "destroy" was called "close".  For compatibility with older versions of Marionette, the old option `close_with` is still available, handling the `close` event.

#### Update filter

It's very common that you'd want to update the filter being used and have the collection view update itself. `updateFilter` takes the same parameters as the original `filter` option (a hash, or a function) and regenerates the virtual collection without losing your view bindings.

```js

virtual_collection.updateFilter({
  the_new: 'properties'
, are: 'lovely'
});

// or

virtual_collection.updateFilter(function (model) {
  return model.foo() === 'bar';
});

```

### Philosophy

#### No data duplication
VirtualCollection does not store, or duplicate any data. We've used other solutions in the past, and duplicating data is just plain bad news.

#### It's Fast
VirtualCollection maintains an internal index of models that pass the filter. That way, using the accessors and iterators (`map`, `each`, etc) is fast. It doesn't have to go through the whole parent collection and re-evaluate all the filters.

Happy hacking!

#### [Changelog](https://github.com/p3drosola/Backbone.VirtualCollection/wiki/Changelog) - [License](https://github.com/p3drosola/Backbone.VirtualCollection/wiki/License)

#### ఠ ͟ಠ Pull requests are welcome, naturally

![](http://i.imgur.com/Ikzywtp.gif)
