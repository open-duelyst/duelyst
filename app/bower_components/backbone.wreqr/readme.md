# Backbone.Wreqr

A simple infrastructure based on [messaging patterns](http://www.eaipatterns.com/)
and service bus implementations for decoupling [Backbone](http://backbonejs.org)
and [Backbone.Marionette](http://marionettejs.com) applications.

## Downloads And Source

Grab the source from the `src` folder above. Grab the most recent builds
from the links below.

### Standard Builds

* Development: [backbone.wreqr.js](https://raw.github.com/marionettejs/backbone.wreqr/master/lib/backbone.wreqr.js)

* Production: [backbone.wreqr.min.js](https://raw.github.com/marionettejs/backbone.wreqr/master/lib/backbone.wreqr.min.js)

## Basic Use

### Event Aggregator

An event aggregator implementation. It extends from `Backbone.Events` to
provide the core event handling code in an object that can itself be
extended and instantiated as needed.

```js
var vent = new Backbone.Wreqr.EventAggregator();

vent.on("foo", function(){
  console.log("foo event");
});

vent.trigger("foo");
```

### Commands And Request / Response

Wreqr can be used by instantiating a `Backbone.Wreqr.Commands`
or `Backbone.Wreqr.RequestResponse` object. These objects provide a
`setHandler` method to add a handler for a named request or command.
Commands can then be executed with the `execute` method, and
request/response can be done through the `request` method.

### Commands

```js
var commands = new Backbone.Wreqr.Commands();

commands.setHandler("foo", function(){
  console.log("the foo command was executed");
});

commands.execute("foo");
```

### Request/Response

```js
var reqres = new Backbone.Wreqr.RequestResponse();

reqres.setHandler("foo", function(){
  return "foo requested. this is the response";
});

var result = reqres.request("foo");
console.log(result);
```

### Radio

Radio is a convenient way for emitting events through channels. Radio can be used to either retrieve a channel, or talk through a channel with either command, reqres, or vent.

```js
// channels
var globalChannel = Backbone.Wreqr.radio.channel('global');
var userChannel = Backbone.Wreqr.radio.channel('user');

// Wreqr events
Backbone.Wreqr.radio.commands.execute( 'global', 'shutdown' );
Backbone.Wreqr.radio.reqres.request(  'global', 'current-user' );
Backbone.Wreqr.radio.vent.trigger(  'global', 'game-over');

```

### Channel
Channel is an object that wraps EventAggregator, Commands, and Reqres. Channels provide a convenient way for the objects in your system to talk to one another without the global channel becoming too noisy.

```js
// global channel
var globalChannel = Backbone.Wreqr.radio.channel('global');
globalChannel.commands.execute('shutdown' );
globalChannel.reqres.request('current-user' );
globalChannel.vent.trigger('game-over');

// user channel
var userChannel = Backbone.Wreqr.radio.channel('user');
userChannel.commands.execute('punnish');
userChannel.reqres.request('user-avatar');
userChannel.vent.trigger('win', {
  level: 2,
  stars: 3
});
```

### Adding Multiple Handlers

Multiple handlers can be set on the Commands and RequestResponse
objects in a single call, using the `setHandlers` method and supplying
a `{"name": configuration}` hash where the `configuration` is an
object literal or a function.

```js
var reqres = new Backbone.Wreqr.RequestResponse();

reqres.setHandlers({
  "foo": function(){ /* ... */ },
  "bar": {
    callback: function(){ /* ... */ },
    context: someObject
  }
});

var result = reqres.request("foo");
```

The "foo" handler is assigned directly to a function, while the
"bar" handler is assigned to a function with a specific context
to execute the function within.

This works for all `Handlers`, `Commands` and `RequestResponse`
objects.

### Removing Handlers

Removing handlers for commands or requests is done the
same way, with the `removeHandler` or `removeAllHandlers`
functions.

```js
reqres.removeHandler("foo");

commands.removeAllHandlers();
```

### Extending Wreqr Objects

The EventAggregator, Commands and RequestResponse objects can all be
extended using Backbone's standard `extend` method.

```js
var MyEventAgg = Backbone.Wreqr.EventAggregator.extend({
  foo: function(){...}
});

var MyCommands = Backbone.Wreqr.Commands.extend({
  foo: function(){...}
});

var MyReqRes = Backbone.Wreqr.RequestResponse.extend({
  foo: function(){...}
});
```

## License

MIT - see [LICENSE.md](https://raw.github.com/marionettejs/backbone.wreqr/master/LICENSE.md)

## Dev
* `npm install`
* `npm install -g grunt-cli`
* `grunt`

