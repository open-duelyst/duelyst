const _ = require('underscore');

/*
 Extracts the Backbone.Events module to avoid having to require Backbone/jQuery/etc.
 */

const Events = function () {
  this._events = {};
  this._listeners = {};
};
Events.prototype = {
  constructor: Events,

  _events: null,
  _listeners: null,

  // Bind an event to a `callback` function. Passing `"all"` will bind
  // the callback to all events fired.
  on(name, callback, context) {
    if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
    const events = this._events[name] || (this._events[name] = []);
    events.push({ callback, context, ctx: context || this });
    return this;
  },

  // Bind an event to only be triggered a single time. After the first time
  // the callback is invoked, it will be removed.
  once(name, callback, context) {
    if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
    const self = this;
    const once = _.once(function () {
      self.off(name, once);
      callback.apply(this, arguments);
    });
    once._callback = callback;
    return this.on(name, once, context);
  },

  // Remove one or many callbacks. If `context` is null, removes all
  // callbacks with that function. If `callback` is null, removes all
  // callbacks for the event. If `name` is null, removes all bound
  // callbacks for all events.
  off(name, callback, context) {
    let retain;
    let ev;
    let events;
    let i;
    let l;
    let j;
    let k;
    if (!eventsApi(this, 'off', name, [callback, context])) return this;
    if (!name && !callback && !context) {
      this._events = {};
      return this;
    }

    const names = name ? [name] : _.keys(this._events);
    for (i = 0, l = names.length; i < l; i++) {
      name = names[i];
      // This looks like a bug (= vs ==) but will leave as is for now.
      /* eslint-disable no-cond-assign */
      if (events = this._events[name]) {
        this._events[name] = retain = [];
        if (callback || context) {
          for (j = 0, k = events.length; j < k; j++) {
            ev = events[j];
            if ((callback && callback !== ev.callback && callback !== ev.callback._callback)
              || (context && context !== ev.context)) {
              retain.push(ev);
            }
          }
        }
        if (!retain.length) delete this._events[name];
      }
    }

    return this;
  },

  // Trigger one or many events, firing all bound callbacks. Callbacks are
  // passed the same arguments as `trigger` is, apart from the event name
  // (unless you're listening on `"all"`, which will cause your callback to
  // receive the true name of the event as the first argument).
  trigger(name) {
    const args = Array.prototype.slice.call(arguments, 1);
    if (!eventsApi(this, 'trigger', name, args)) return this;
    const events = this._events[name];
    const allEvents = this._events.all;
    if (events) triggerEvents(events, args);
    if (allEvents) triggerEvents(allEvents, arguments);
    return this;
  },

  // Tell this object to stop listening to either specific events ... or
  // to every object it's currently listening to.
  stopListening(obj, name, callback) {
    const deleteListener = !name && !callback;
    if (typeof name === 'object') callback = this;
    if (obj) {
      obj.off(name, callback, this);
      if (deleteListener) delete this._listeners[obj._listenerId];
    } else {
      const listeners = this._listeners;
      const ids = Object.keys(listeners);
      for (let i = 0, l = ids.length; i < l; i++) {
        const id = ids[i];
        listeners[id].off(name, callback, this);
        if (deleteListener) delete listeners[id];
      }
    }
    return this;
  },

};

// Regular expression used to split event strings.
const eventSplitter = /\s+/;

// Implement fancy features of the Events API such as multiple event
// names `"change blur"` and jQuery-style event maps `{change: action}`
// in terms of the existing API.
let eventsApi = function (obj, action, name, rest) {
  if (!name) return true;

  // Handle event maps.
  if (typeof name === 'object') {
    /* eslint-disable guard-for-in */
    for (const key in name) {
      /* eslint-disable prefer-spread */
      obj[action].apply(obj, [key, name[key]].concat(rest));
    }
    return false;
  }

  // Handle space separated event names.
  if (eventSplitter.test(name)) {
    const names = name.split(eventSplitter);
    for (let i = 0, l = names.length; i < l; i++) {
      /* eslint-disable prefer-spread */
      obj[action].apply(obj, [names[i]].concat(rest));
    }
    return false;
  }

  return true;
};

// A difficult-to-believe, but optimized internal dispatch function for
// triggering events. Tries to keep the usual cases speedy (most internal
// Backbone events have 3 arguments).
let triggerEvents = function (events, args) {
  let ev; let i = -1; const l = events.length; const a1 = args[0]; const a2 = args[1]; const
    a3 = args[2];
  switch (args.length) {
  case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
  case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
  case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
  case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
  default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
  }
};

const listenMethods = { listenTo: 'on', listenToOnce: 'once' };

// Inversion-of-control versions of `on` and `once`. Tell *this* object to
// listen to an event in another object ... keeping track of what it's
// listening to.
_.each(listenMethods, (implementation, method) => {
  Events.prototype[method] = function (obj, name, callback) {
    const listeners = this._listeners;
    const id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
    listeners[id] = obj;
    if (typeof name === 'object') callback = this;
    obj[implementation](name, callback, this);
    return this;
  };
});

// Aliases for backwards compatibility.
Events.prototype.bind = Events.prototype.on;
Events.prototype.unbind = Events.prototype.off;

// Events instance creation
Events.instance = null;
Events.getInstance = function () {
  if (!(this.instance instanceof Events)) {
    this.instance = new Events();
  }
  return this.instance;
};
Events.current = Events.getInstance;
Events.reset = function () {
  Events.instance = null;
};

Events.create = function () {
  return new Events();
};

module.exports = Events;
