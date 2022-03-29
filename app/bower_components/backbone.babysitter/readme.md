# Backbone.BabySitter

[![Build Status](https://travis-ci.org/marionettejs/backbone.babysitter.svg?branch=master)](https://travis-ci.org/marionettejs/backbone.babysitter)

Manage child views in a Backbone.View.

## About Backbone.BabySitter

Backbone provides a lot of functionality in its views, but does not directly
provide a way to manage child views or nested views. This is not terribly
difficult to do on your own, but it gets tedious to write the same code
over and over again.

Backbone.BabySitter provides a simple way to manage an unknown number of
child views within a Backbone.View, or other object that needs to track a
list of views.

## Downloads And Source

Grab the source from the `src` folder above. Grab the most recent builds
from the links below.

* Development: [backbone.babysitter.js](https://raw.github.com/marionettejs/backbone.babysitter/master/lib/backbone.babysitter.js)

* Production: [backbone.babysitter.min.js](https://raw.github.com/marionettejs/backbone.babysitter/master/lib/backbone.babysitter.min.js)

## Documentation

Backbone.BabySitter exposes one constructor function: `Backbone.ChildViewContainer`.
This constructor function contains all of the necessary code for managing a list of
views.

### Storing Views

Views can be added to a container by calling the `add` method:

```js
var container = new Backbone.ChildViewContainer();

container.add(someView);
container.add(anotherView);
```

Views will be stored once and indexed in several ways:

* by `view.cid`
* by `view.model.cid` if the view has a model
* by a custom index key

When adding a view, you can optionally specify a custom index key
by which you can later retrieve the view.

```js
container.add(aView, "an indexer");
```

Note that the custom indexer should be unique within the container. If you
add two different views with the same custom indexer, the last one in will
be the only one stored by that index key.

### Constructing With Views

An initial list of views can be added to the container through the
constructor function call. This list must be an array of view instances:

```js
var views = [someView, anotherView];
var container = new Backbone.ChildViewContainer(views);
```

### Retrieving Views

You can retrieve a view by any of the index:

```js
var container = new Backbone.ChildViewContainer();

container.add(someView);
container.add(anotherView);
container.add(collectionView);
container.add(aView, "an indexer");

// find by view cid
var s = container.findByCid(someView.cid);

// find by model
var av = container.findByModel(anotherView.model);

// find by model cid
var av2 = container.findByModelCid(anotherView.model.cid);

// find by custom key
var custv = container.findByCustom("an indexer");

// find by numeric index (unstable)
var custv = container.findByIndex(0);
```

If the `findBy*` method cannot find the view, it will return undefined.

### Removing A View

You can remove a view directly and it will be removed from all available
indexes.

```js
var container = new Backbone.ChildViewContainer();

container.add(view);

// some time later
container.remove(view);
```

To remove a view by an index, find it by that index and then remove
the resulting view.

### Executing Methods On All Views

You can execute any arbitrary method with any arbitrary parameters on all of
the views within the container. There are two ways to do this: `container.call`
and `container.apply`. These methods work similarly to `function.call` and
`function.apply` in how parameters are passed through. However, they do not
allow the context to be specified. The view on which a method is being called
will always be the context of the call.

```js
var View = Backbone.View.extend({
  doStuff: function(a, b){
  },

  moreStuff: function(a, b){
  }
});

var v1 = new View();
var v2 = new View();

var container = new Backbone.ChildViewContainer();
container.add(v1);
container.add(v2);

// call the doStuff function
container.call("doStuff", 1, 2);

// apply the doStuff function
container.apply("doStuff", [1, 2]);
```

If any given view within the container does not have the method specified, it
will not be called on that view. No errors will be thrown in this situation.

### Get The Number Of Stored Views

To get the number of stored views, call the `container.length`
attribute. This attribute is updated any time a view is added or
removed.

```js
var container = new Backbone.ChildViewContainer();

container.add(view);
container.add(v2);
container.add(v3);

console.log(container.length); //=> 3

container.remove(v2);

console.log(container.length); //=> 2
```

### Iterators And Collection Functions

The container object borrows several functions from Underscore.js, to
provide iterators and other collection functions, including:

* forEach
* each
* map
* find
* detect
* filter
* select
* reject
* every
* all
* some
* any
* include
* contains
* invoke
* toArray
* first
* initial
* rest
* last
* without
* isEmpty
* pluck

These methods can be called directly on the container, to iterate and
process the views held by the container.

```js
var container = new Backbone.ChildViewContainer();

container.add(v1);
container.add(v2);
container.add(v3);

// iterate over all of the views
container.each(function(view){

  // process each view individually, here

});
```

For more information about these methods, see the [Underscore.js documentation](http://underscorejs.org).

## ChangeLog

For a complete change log, see the [CHANGELOG.md](https://github.com/marionettejs/backbone.babysitter/blob/master/CHANGELOG.md)
file.

## License

MIT - see [LICENSE.md](https://github.com/marionettejs/backbone.babysitter/blob/master/LICENSE.md)

## Dev

* `npm install`
* `npm install -g grunt-cli`
* `grunt`
