/*!
 * BackFire is the officially supported Backbone binding for Firebase. The
 * bindings let you use special model and collection types that will
 * automatically synchronize with Firebase, and also allow you to use regular
 * Backbone.Sync based synchronization methods.
 *
 * BackFire 0.4.0
 * https://github.com/firebase/backfire/
 * License: MIT
 */

"use strict";

(function() {

  var _ = window._;
  var Backbone = window.Backbone;

  Backbone.Firebase = function(ref) {
    this._fbref = ref;
    this._children = [];
    if (typeof ref == "string") {
      this._fbref = new Firebase(ref);
    }

    this._fbref.on("child_added", this._childAdded, this);
    this._fbref.on("child_moved", this._childMoved, this);
    this._fbref.on("child_changed", this._childChanged, this);
    this._fbref.on("child_removed", this._childRemoved, this);
  };

  _.extend(Backbone.Firebase.prototype, {

   /**
    * A utility for retrieving the key name of a Firebase ref or
    * DataSnapshot. This is backwards-compatible with `name()`
    * from Firebase 1.x.x and `key()` from Firebase 2.0.0+. Once
    * support for Firebase 1.x.x is dropped in BackFire, this
    * helper can be removed.
    */
    _getKey: function(refOrSnapshot) {
      return (typeof refOrSnapshot.key === 'function') ? refOrSnapshot.key() : refOrSnapshot.name();
    },

    _childAdded: function(childSnap, prevChild) {
      var model = childSnap.val();
      model.id = this._getKey(childSnap);
      if (prevChild) {
        var item = _.find(this._children, function(child) {
          return child.id == prevChild;
        });
        this._children.splice(this._children.indexOf(item) + 1, 0, model);
      } else {
        this._children.unshift(model);
      }
    },

    _childMoved: function(childSnap, prevChild) {
      var model = childSnap.val();
      this._children = _.reject(this._children, function(child) {
        return child.id == model.id;
      });
      this._childAdded(childSnap, prevChild);
    },

    _childChanged: function(childSnap) {
      var model = childSnap.val();
      model.id = this._getKey(childSnap);
      var item = _.find(this._children, function(child) {
        return child.id == model.id;
      });
      this._children[this._children.indexOf(item)] = model;
    },

    _childRemoved: function(oldChildSnap) {
      var model = oldChildSnap.val();
      this._children = _.reject(this._children, function(child) {
        return child.id == model.id;
      });
    },

    create: function(model, cb) {
      if (!model.id) {
        model.id = this._getKey(this._fbref.ref().push());
      }

      var val = model.toJSON();
      this._fbref.ref().child(model.id).set(val, _.bind(function(err) {
        if (!err) {
          cb(null, val);
        } else {
          cb("Could not create model " + model.id);
        }
      }, this));
    },

    read: function(model, cb) {
      if (!model.id) {
        _.defer(cb, "Invalid model ID provided to read");
        return;
      }

      var index = _.find(this._children, function(child) {
        return child.id == model.id;
      });

      _.defer(cb, null, this._children[index]);
    },

    readAll: function(model, cb) {
      _.defer(cb, null, this._children);
    },

    update: function(model, cb) {
      var val = model.toJSON();
      this._fbref.ref().child(model.id).update(val, function(err) {
        if (!err) {
          cb(null, val);
        } else {
          cb("Could not update model " + model.id, null);
        }
      });
    },

    "delete": function(model, cb) {
      this._fbref.ref().child(model.id).remove(function(err) {
        if (!err) {
          cb(null, model);
        } else {
          cb("Could not delete model " + model.id);
        }
      });
    },

    ref: function() {
      return this._fbref;
    }
  });


  Backbone.Firebase.sync = function(method, model, options, error) {
    var store = model.firebase || model.collection.firebase;

    // Backwards compatibility with Backbone <= 0.3.3
    if (typeof options == "function") {
      options = {
        success: options,
        error: error
      };
    }

    if (method == "read" && model.id === undefined) {
      method = "readAll";
    }

    store[method].apply(store, [model, function(err, val) {
      if (err) {
        model.trigger("error", model, err, options);
        if (Backbone.VERSION === "0.9.10") {
          options.error(model, err, options);
        } else {
          options.error(err);
        }
      } else {
        model.trigger("sync", model, val, options);
        if (Backbone.VERSION === "0.9.10") {
          options.success(model, val, options);
        } else {
          options.success(val);
        }
      }
    }]);
  };

  Backbone.oldSync = Backbone.sync;

  // Override "Backbone.sync" to default to Firebase sync.
  // the original "Backbone.sync" is still available in "Backbone.oldSync"
  Backbone.sync = function(method, model, options, error) {
    var syncMethod = Backbone.oldSync;
    if (model.firebase || (model.collection && model.collection.firebase)) {
      syncMethod = Backbone.Firebase.sync;
    }
    return syncMethod.apply(this, [method, model, options, error]);
  };

  // Custom Firebase Collection.
  Backbone.Firebase.Collection = Backbone.Collection.extend({
    sync: function() {
      this._log("Sync called on a Firebase collection, ignoring.");
    },

    fetch: function() {
      this._log("Fetch called on a Firebase collection, ignoring.");
    },

    constructor: function(models, options) {
      // Apply parent constructor (this will also call initialize).
      Backbone.Collection.apply(this, arguments);

      if (options && options.firebase) {
        this.firebase = options.firebase;
      }
      switch (typeof this.firebase) {
      case "object":
        break;
      case "string":
        this.firebase = new Firebase(this.firebase);
        break;
      case "function":
        this.firebase = this.firebase();
        break;
      default:
        throw new Error("Invalid firebase reference created");
      }

      // Add handlers for remote events.
      this.firebase.on("child_added", _.bind(this._childAdded, this));
      this.firebase.on("child_moved", _.bind(this._childMoved, this));
      this.firebase.on("child_changed", _.bind(this._childChanged, this));
      this.firebase.on("child_removed", _.bind(this._childRemoved, this));

      // Once handler to emit "sync" event.
      this.firebase.once("value", _.bind(function() {
        this.trigger("sync", this, null, null);
      }, this));

      // Handle changes in any local models.
      this.listenTo(this, "change", this._updateModel, this);
      // Listen for destroy event to remove models.
      this.listenTo(this, "destroy", this._removeModel, this);

      // Don't suppress local events by default.
      this._suppressEvent = false;
    },

    comparator: function(model) {
      return model.id;
    },

    add: function(models, options) {
      var parsed = this._parseModels(models);
      options = options ? _.clone(options) : {};
      options.success =
        _.isFunction(options.success) ? options.success : function() {};

      for (var i = 0; i < parsed.length; i++) {
        var model = parsed[i];
        var childRef = this.firebase.ref().child(model.id);
        if (options.silent === true) {
          this._suppressEvent = true;
        }
        childRef.set(model, _.bind(options.success, model));
      }

      return parsed;
    },

    remove: function(models, options) {
      var parsed = this._parseModels(models);
      options = options ? _.clone(options) : {};
      options.success =
        _.isFunction(options.success) ? options.success : function() {};

      for (var i = 0; i < parsed.length; i++) {
        var model = parsed[i];
        var childRef = this.firebase.ref().child(model.id);
        if (options.silent === true) {
          this._suppressEvent = true;
        }
        childRef.set(null, _.bind(options.success, model));
      }

      return parsed;
    },

    create: function(model, options) {
      options = options ? _.clone(options) : {};
      if (options.wait) {
        this._log("Wait option provided to create, ignoring.");
      }
      model = Backbone.Collection.prototype._prepareModel.apply(
        this, [model, options]
      );
      if (!model) {
        return false;
      }
      var set = this.add([model], options);
      return set[0];
    },

    reset: function(models, options) {
      options = options ? _.clone(options) : {};
      // Remove all models remotely.
      this.remove(this.models, {silent: true});
      // Add new models.
      var ret = this.add(models, {silent: true});
      // Trigger "reset" event.
      if (!options.silent) {
        this.trigger("reset", this, options);
      }
      return ret;
    },

    _log: function(msg) {
      if (console && console.log) {
        console.log(msg);
      }
    },

    // TODO: Options will be ignored for add & remove, document this!
    _parseModels: function(models) {
      var ret = [];
      models = _.isArray(models) ? models.slice() : [models];
      for (var i = 0; i < models.length; i++) {
        var model = models[i];
        if (model.toJSON && typeof model.toJSON == "function") {
          model = model.toJSON();
        }
        if (!model.id) {
          model.id = Backbone.Firebase.prototype._getKey(this.firebase.ref().push());
        }
        ret.push(model);
      }
      return ret;
    },

    _childAdded: function(snap) {
      var model = snap.val();
      if (!model.id) {
        if (!_.isObject(model)) {
          model = {};
        }
        model.id = Backbone.Firebase.prototype._getKey(snap);
      }
      if (this._suppressEvent === true) {
        this._suppressEvent = false;
        Backbone.Collection.prototype.add.apply(this, [model], {silent: true});
      } else {
        Backbone.Collection.prototype.add.apply(this, [model]);
      }
      this.get(model.id)._remoteAttributes = model;
    },

    _childMoved: function(snap) {
      // TODO: Investigate: can this occur without the ID changing?
      this._log("_childMoved called with " + snap.val());
    },

    _childChanged: function(snap) {
      var model = snap.val();
      if (!model.id) {
        model.id = Backbone.Firebase.prototype._getKey(snap);
      }

      var item = _.find(this.models, function(child) {
        return child.id == model.id;
      });

      if (!item) {
        // TODO: Investigate: what is the right way to handle this case?
        throw new Error("Could not find model with ID " + model.id);
      }

      this._preventSync(item, true);
      item._remoteAttributes = model;

      var diff = _.difference(_.keys(item.attributes), _.keys(model));
      _.each(diff, function(key) {
        item.unset(key);
      });

      item.set(model);
      this._preventSync(item, false);
    },

    _childRemoved: function(snap) {
      var model = snap.val();
      if (!model.id) {
        model.id = Backbone.Firebase.prototype._getKey(snap);
      }
      if (this._suppressEvent === true) {
        this._suppressEvent = false;
        Backbone.Collection.prototype.remove.apply(
          this, [model], {silent: true}
        );
      } else {
        Backbone.Collection.prototype.remove.apply(this, [model]);
      }
    },

    // Add handlers for all models in this collection, and any future ones
    // that may be added.
    _updateModel: function(model) {
      if (model._remoteChanging) {
        return;
      }

      var remoteAttributes = model._remoteAttributes || {};
      var localAttributes = model.toJSON();
      var updateAttributes = {};

      var union = _.union(_.keys(remoteAttributes), _.keys(localAttributes));
      _.each(union, function(key) {
        if (!_.has(localAttributes, key)) {
          updateAttributes[key] = null;
        } else if (localAttributes[key] != remoteAttributes[key]) {
          updateAttributes[key] = localAttributes[key];
        }
      });

      if (_.size(updateAttributes)) {
        // Special case if ".priority" was updated - a merge is not
        // allowed so we'll have to do a full setWithPriority.
        if (_.has(updateAttributes, ".priority")) {
          var ref = this.firebase.ref().child(model.id);
          var priority = localAttributes[".priority"];
          delete localAttributes[".priority"];
          ref.setWithPriority(localAttributes, priority);
        } else {
          this.firebase.ref().child(model.id).update(updateAttributes);
        }
      }
    },

    // Triggered when model.destroy() is called on one of the children.
    _removeModel: function(model, collection, options) {
      options = options ? _.clone(options) : {};
      options.success =
        _.isFunction(options.success) ? options.success : function() {};
      var childRef = this.firebase.ref().child(model.id);
      childRef.set(null, _.bind(options.success, model));
    },

    _preventSync: function(model, state) {
      model._remoteChanging = state;
    }
  });

  // Custom Firebase Model.
  Backbone.Firebase.Model = Backbone.Model.extend({
    save: function() {
      this._log("Save called on a Firebase model, ignoring.");
    },

    destroy: function(options) {
      // TODO: Fix naive success callback. Add error callback.
      this.firebase.ref().set(null, this._log);
      this.trigger("destroy", this, this.collection, options);
      if (options.success) {
        options.success(this, null, options);
      }
    },

    constructor: function(model, options) {
      // Store defaults so they don't get applied immediately.
      var defaults = _.result(this, "defaults");

      // Apply defaults only after first sync.
      this.once("sync", function() {
        this.set(_.defaults(this.toJSON(), defaults));
      });

      // Apply parent constructor (this will also call initialize).
      Backbone.Model.apply(this, arguments);

      if (options && options.firebase) {
        this.firebase = options.firebase;
      }
      switch (typeof this.firebase) {
      case "object":
        break;
      case "string":
        this.firebase = new Firebase(this.firebase);
        break;
      case "function":
        this.firebase = this.firebase();
        break;
      default:
        throw new Error("Invalid firebase reference created");
      }

      // Add handlers for remote events.
      this.firebase.on("value", _.bind(this._modelChanged, this));

      this._listenLocalChange(true);
    },

    _listenLocalChange: function(state) {
      if (state) {
        this.on("change", this._updateModel, this);
      } else {
        this.off("change", this._updateModel, this);
      }
    },

    _updateModel: function(model) {
      // Find the deleted keys and set their values to null
      // so Firebase properly deletes them.
      var modelObj = model.changedAttributes();
      _.each(model.changed, function(value, key) {
        if (typeof value === "undefined" || value === null) {
          if (key == "id") {
            delete modelObj[key];
          } else {
            modelObj[key] = null;
          }
        }
      });
      if (_.size(modelObj)) {
        this.firebase.ref().update(modelObj, this._log);
      }
    },

    _modelChanged: function(snap) {
      // Unset attributes that have been deleted from the server
      // by comparing the keys that have been removed.
      var newModel = snap.val();
      if (typeof newModel === "object" && newModel !== null) {
        var diff = _.difference(_.keys(this.attributes), _.keys(newModel));
        var self = this;
        _.each(diff, function(key) {
          self.unset(key);
        });
      }
      this._listenLocalChange(false);
      this.set(newModel);
      this._listenLocalChange(true);
      this.trigger("sync", this, null, null);
    },

    _log: function(msg) {
      if (typeof msg === "undefined" || msg === null) {
        return;
      }
      if (console && console.log) {
        console.log(msg);
      }
    }

  });

})();
