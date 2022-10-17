'use strict';

var UtilsJavascript = require('app/common/utils/utils_javascript');

var _PackageManager = {};
_PackageManager.instance = null;
_PackageManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new PackageManager();
  }
  return this.instance;
};
_PackageManager.current = _PackageManager.getInstance;

/**
 * Injects a class with resource request architecture.
 * NOTE: Cocos2d nodes and Backbone/Marionette classes are automatically injected!
 * @param {Object} cls
 * @example
 * // create a class (optional)
 * var MyClass = function () {};
 * MyClass.prototype = {
 *   constructor: MyClass,
 *   getRequiredResources: function () {
 *     return ['path/to/resource_1', ..., 'path/to/resource_n'];
 *   }
 * };
 *
 * // add resource requests to a class
 * var PackageManager = require('path/to/package_manager');
 * PackageManager.injectClassWithResourceRequests(MyClass);
 *
 * // create an instance of a class
 * var myInstance = new MyClass();
 *
 * // to add custom resource request
 * // usually not necessary if only using required resources
 * myInstance.addResourceRequest(requestId, packageId, optionalResources);
 *
 * // to wait for required resources to load
 * myInstance.whenRequiredResourcesReady().then(function (requestId) {
 *   if (!this.getAreResourcesValid(requestId)) return; // resources invalidated/unloaded
 *   // resources valid, do something
 * });
 *
 * // to wait for custom resources to load
 * myInstance.whenResourcesReady(requestId).then(function (requestId) {
 *   if (!this.getAreResourcesValid(requestId)) return; // resources invalidated/unloaded
 *   // resources valid, do something
 * });
 *
 * // when ready to load all resources
 * myInstance.enabledAndExecuteResourceRequests();
 *
 * // when ready to stop resource requests and unload all resources
 * myInstance.disableAndRemoveResourceRequests();
 */
_PackageManager.injectClassWithResourceRequests = function (cls) {
  // properties
  cls.prototype._requiredResourcesRequestId = null;
  cls.prototype._requiredResources = null;
  cls.prototype._resourceRequestsById = null;
  cls.prototype._queuedResourceRequestsById = null;
  cls.prototype._canExecuteResourceRequests = false;

  /**
   * Returns a promise that resolves when resources are ready, passing the resources request id.
   * NOTE: methods that hook into this promise should validate the resources load id (see example)
   * @param {String} requestId id of resource request
   * @returns {Promise}
   * @example
   * this.whenResourcesReady(requestId).then(function (requestId) {
   *  if (!this.getAreResourcesValid(requestId)) return; // resources have been invalidated
   *  // resources are valid
   * });
   */
  cls.prototype.whenResourcesReady = function (requestId) {
    if (requestId == null) {
      return Promise.resolve(requestId);
    } else {
      // special handling for required resources
      var requiredResourcesRequestId = this.getRequiredResourcesRequestId();
      if (requestId === requiredResourcesRequestId) {
        if (this._requiredResources == null) {
          this._requiredResources = this.getRequiredResources();
          if (this._requiredResources.length > 0) {
            this.addResourceRequest(requiredResourcesRequestId, null, this._requiredResources);
          }
        }
        if (this._requiredResources.length === 0) {
          return Promise.resolve(requestId);
        }
      }

      this.executeResourceRequests();
      return this._getOrCreateResourceRequest(requestId).promise;
    }
  };

  /**
   * Helper method to check when required resources are ready.
   * @returns {Promise}
   * @example
   * this.whenRequiredResourcesReady().then(function (requestId) {
   *  if (!this.getAreResourcesValid(requestId)) return; // resources have been invalidated
   *  // resources are valid
   * });
   */
  cls.prototype.whenRequiredResourcesReady = function () {
    var requiredResourcesRequestId = this.getRequiredResourcesRequestId();
    return this.whenResourcesReady(requiredResourcesRequestId);
  };

  /**
   * Returns a list of required resources.
   * NOTE: override this method to return any required resources.
   * @returns {Array}
   */
  var clsGetRequiredResources = cls.prototype.getRequiredResources;
  cls.prototype.getRequiredResources = function () {
    return (clsGetRequiredResources && clsGetRequiredResources.call(this)) || [];
  };

  /**
   * Returns a request id for required resources.
   * @returns {String}
   */
  cls.prototype.getRequiredResourcesRequestId = function () {
    if (this._requiredResourcesRequestId == null) {
      this._requiredResourcesRequestId = 'require_resources_' + UtilsJavascript.generateIncrementalId();
    }
    return this._requiredResourcesRequestId;
  };

  /**
   * Returns whether the resources are valid for a request id.
   * @param requestId
   * @returns {Boolean}
   */
  cls.prototype.getAreResourcesValid = function (requestId) {
    if (requestId == null) {
      return true;
    } else {
      var requiredResourcesRequestId = this.getRequiredResourcesRequestId();
      if (requestId == requiredResourcesRequestId && this._requiredResources.length === 0) {
        return true;
      } else if (this._resourceRequestsById != null) {
        var resourceRequest = this._resourceRequestsById[requestId];
        return resourceRequest != null && resourceRequest.isValid;
      }
    }
    return false;
  };

  /**
   * Adds a resource request, to be executed as soon as node is added to the scene.
   * @param {String} requestId unique id of the request
   * @param {String} [packageId=requestId] unique id of the package (may be same as requestId)
   * @param {Array} [resources=null] additional resources not defined by the package id
   * @returns {Promise} resolve called when load completes with request id or false if request removed before loading
   */
  cls.prototype.addResourceRequest = function (requestId, packageId, resources) {
    if (requestId == null) { throw new Error('addResourceRequest -> invalid requestId'); }
    if (packageId == null) { packageId = requestId; }

    var resourceRequest = this._getOrCreateResourceRequest(requestId);
    if (resourceRequest.packageId == null) {
      resourceRequest.packageId = packageId;
      var packageResources = PKGS.getPkgForIdentifier(resourceRequest.packageId);
      if (packageResources != null && packageResources.length > 0) { resourceRequest.resources = resourceRequest.resources.concat(packageResources); }
      if (resources != null && resources.length > 0) { resourceRequest.resources = resourceRequest.resources.concat(resources); }

      if (this._canExecuteResourceRequests) {
        // load immediately if already added to scene
        this._executeResourceRequest(resourceRequest);
      } else {
        // queue for loading
        if (this._queuedResourceRequestsById == null) { this._queuedResourceRequestsById = {}; }
        this._queuedResourceRequestsById[requestId] = resourceRequest;
      }
    } else {
      Logger.module('RESOURCES').warn('addResourceRequest -> duplicate resource request: ' + requestId + ' w/ packageId ' + packageId);
    }

    return resourceRequest.promise;
  };

  cls.prototype._getOrCreateResourceRequest = function (requestId) {
    var resourceRequest;
    if (this._resourceRequestsById == null) {
      this._resourceRequestsById = {};
    } else {
      resourceRequest = this._resourceRequestsById[requestId];
    }
    if (resourceRequest == null) {
      resourceRequest = this._resourceRequestsById[requestId] = {
        id: requestId,
        isValid: true,
        loadPromise: null,
        packageId: null,
        promise: null,
        resolve: null,
        resources: [],
        reject: null,
      };
      resourceRequest.promise = new Promise(function (resolve, reject) {
        resourceRequest.resolve = resolve;
        resourceRequest.reject = reject;
      });
    }
    return resourceRequest;
  };

  /**
   * Removes an existing resource request, immediately resolving it.
   * @param {Object} resourceRequest
   */
  cls.prototype.removeResourceRequest = function (resourceRequest) {
    if (resourceRequest != null) {
      var requestId = resourceRequest.id;
      if (this._resourceRequestsById != null) {
        delete this._resourceRequestsById[requestId];
      }
      if (this._queuedResourceRequestsById != null) {
        delete this._queuedResourceRequestsById[requestId];
      }
      resourceRequest.isValid = false;
      resourceRequest.resolve(false);
      if (resourceRequest.loadPromise != null) {
        _PackageManager.getInstance().unloadMajorMinorPackage(requestId);
        resourceRequest.loadPromise = null;
      }
    }
  };

  /**
   * Removes an existing resource request by id.
   * @param {String} requestId
   * @see removeResourceRequest
   */
  cls.prototype.removeResourceRequestById = function (requestId) {
    if (this._resourceRequestsById != null) {
      this.removeResourceRequest(this._resourceRequestsById[requestId]);
    }
  };

  /**
   * Removes all existing resource requests.
   * @see removeResourceRequestById
   */
  cls.prototype.removeAllResourceRequests = function () {
    var resourceRequestsById = this._resourceRequestsById;
    if (resourceRequestsById != null) {
      this._resourceRequestsById = null;
      var requestIds = Object.keys(resourceRequestsById);
      for (var i = 0, il = requestIds.length; i < il; i++) {
        var requestId = requestIds[i];
        var resourceRequest = resourceRequestsById[requestId];
        this.removeResourceRequest(resourceRequest);
      }

      // recurse in case resolving any resource requests added more resource requests
      this.removeAllResourceRequests();
    }
  };

  /**
   * Flags self as able to execute all queued resource requests.
   * @param {Boolean} val
   */
  cls.prototype.setCanExecuteResourceRequests = function (val) {
    this._canExecuteResourceRequests = val;
  };

  /**
   * Executes all queued resource requests.
   * NOTE: usually you should not need to call this manually
   * @returns {Promise}
   */
  cls.prototype.executeResourceRequests = function () {
    if (this._canExecuteResourceRequests) {
      var queuedResourceRequestsById = this._queuedResourceRequestsById;
      if (queuedResourceRequestsById != null) {
        this._queuedResourceRequestsById = null;
        var requestIds = Object.keys(queuedResourceRequestsById);
        for (var i = 0, il = requestIds.length; i < il; i++) {
          var requestId = requestIds[i];
          this._executeResourceRequest(queuedResourceRequestsById[requestId]);
        }

        // recurse in case executing any resource requests added more resource requests
        this.executeResourceRequests();
      }
    }
  };

  /**
   * Executes a resource request.
   * @param {Object} request
   * @returns {Promise}
   * @private
   */
  cls.prototype._executeResourceRequest = function (request) {
    request.loadPromise = _PackageManager.getInstance().loadMinorPackage(request.id, request.resources)
      .then(function () {
      // resolve with request id
        request.resolve(request.id);
      })
      .catch(function (error) {
      // pass on error
        request.reject(error);
      });

    return request.loadPromise;
  };

  /**
   * Helper method to enable and execute all queued resource requests.
   * @returns {Promise}
   */
  cls.prototype.enabledAndExecuteResourceRequests = function () {
    this.setCanExecuteResourceRequests(true);
    this.executeResourceRequests();
  };

  /**
   * Helper method to disable and remove all resource requests.
   * @returns {Promise}
   */
  cls.prototype.disableAndRemoveResourceRequests = function () {
    this.setCanExecuteResourceRequests(false);
    this.removeAllResourceRequests();
  };
};

module.exports = _PackageManager;

var _ = require('underscore');
var Promise = require('bluebird');
var CONFIG = require('app/common/config');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var UtilsResources = require('app/common/utils/utils_resources');
var audio_engine = require('app/audio/audio_engine');
var CCInjections = require('app/view/extensions/CCInjections');
var NodeInjections = require('app/view/extensions/NodeInjections');
var RenderingInjections = require('app/view/extensions/RenderingInjections');
var PKGS = require('app/data/packages');
var Factions = require('app/sdk/cards/factionsLookup');
var Manager = require('app/ui/managers/manager');
var NavigationManager = require('app/ui/managers/navigation_manager');

/**
 *  PackageManager - manages resources by organizing/tracking packages and adds the concept of strong references to resources.
 *  @see Cocos2d for actual loading and resource caching.
 */
var PackageManager = Manager.extend({

  _activeMajorId: null,
  _activeMajorMinorIds: null,
  _ids: null,
  _loadingMajorId: null,
  _loadingMajorMinorIds: null,
  _loadMajorPromise: Promise.resolve(),
  _packagesById: null,
  _packagesByResourcePath: null,
  _packagesByResourceName: null,
  _strongReferencesByResourcePath: null,
  _unloadableMajorMinorIds: null,

  /* region INITIALIZE */

  initialize: function (options) {
    this._activeMajorMinorIds = [];
    this._ids = [];
    this._loadingMajorMinorIds = [];
    this._packagesById = {};
    this._packagesByResourcePath = {};
    this._packagesByResourceName = {};
    this._strongReferencesByResourcePath = {};
    this._unloadableMajorMinorIds = [];

    Manager.prototype.initialize.call(this);

    // this manager does not need to bind to anything
    this.connect();
  },

  /* endregion INITIALIZE */

  /* region CONNECT */

  onBeforeConnect: function () {
    Manager.prototype.onBeforeConnect.call(this);
    // this manager is not tied to login
    this.stopListening(EventBus.getInstance(), EVENTS.session_logged_out, this.disconnect);
    this.ready();
  },

  /* endregion CONNECT */

  /* region GETTERS / SETTERS */

  /**
   * Gets a package by id.
   * @param {Integer} id
   * @returns {LoadPackage|null}
   */
  getPackageById: function (id) {
    return this._packagesById[id];
  },

  /**
   * Returns current active major package id.
   * @returns {Integer}
   */
  getMajorPackageId: function () {
    return this._activeMajorId;
  },

  /**
   * Returns current loading major package id.
   * @returns {Integer}
   */
  getLoadingMajorPackageId: function () {
    return this._loadingMajorId;
  },

  /* endregion GETTERS / SETTERS */

  /* region LOAD */

  /**
   * Loads all resources in a package that are not required by any other package and returns a promise. Will attempt to automatically load all resources defined by PKGS.getPkgForIdentifier(id).
   * @param {String|Number|Integer} id package id
   * @param {Array} [resources=null] list of resources not included in the package defined by PKGS.getPkgForIdentifier(id)
   * @param {Function} [progressHandler] function to be called on progress where first argument is progress between 0 and 1
   * @param {Boolean} [preventAllocation] whether loaded assets will be prevented from being allocated
   * @returns {Promise}
   * @example
   * PackageManager.getInstance().loadPackage(
   *  "packageId",
   *  ["path1", "path2", ..., "pathN"],
   *  function (percentLoaded) {
   *    // handle progress
   *    // progress is not supported by promises
   *    // so to handle progress you must pass in a function as the third parameter
   *  }
   * ).then(function () {
   *  // handle completion
   *  // completion handlers must be registered using promise methods such as "then"
   * });
   */
  loadPackage: function (id, resources, progressHandler, preventAllocation) {
    var pkg = this._packagesById[id];

    if (pkg == null) {
      // create package with promise
      pkg = new LoadPackage(id, resources);

      // check resource count
      var pkgResources = pkg.getResources();
      if (pkgResources == null || pkgResources.length === 0) {
        // early return for packages with no resources
        pkg._promise = Promise.resolve();
      } else {
        // store package when not preventing allocation
        if (!preventAllocation) { this._packagesById[id] = pkg; }

        pkg._promise = new Promise(function (resolve, reject) {
          // filter package resources to load
          var resourcesToLoad = [];
          var resourcePathsToLoad = [];
          var resourceNamesAndPathsMapped = {};
          var loadPromisesForResources = [];
          var loadPromisesForResourcesSeenById = {};
          var addLoadPromisesFromPkgs = function (pkgs) {
            for (var i = 0, il = pkgs.length; i < il; i++) {
              var pkgForPromises = pkgs[i];
              var pkgForPromisesId = pkgForPromises.getId();
              if (pkgForPromises !== pkg && loadPromisesForResourcesSeenById[pkgForPromisesId] == null) {
                loadPromisesForResourcesSeenById[pkgForPromisesId] = true;
                loadPromisesForResources.push(pkgForPromises.getPromise());
              }
            }
          };
          var addToLoadOrWaitForResourcePath = function (resourcePath, resourceOptions) {
            if (resourcePath != null && resourceNamesAndPathsMapped[resourcePath] == null) {
              resourceNamesAndPathsMapped[resourcePath] = true;

              // find all packages using this resource
              var pkgsForResource = this._packagesByResourcePath[resourcePath];
              if (pkgsForResource == null || pkgsForResource.length === 0) {
                // nothing else is using this resource
                if (!preventAllocation) {
                  // add this package to list of packages using this resource
                  this._packagesByResourcePath[resourcePath] = [pkg];
                }

                // need to load this resource
                if (resourceOptions != null) {
                  resourceOptions.type = UtilsResources.getExt(resourcePath);
                  resourceOptions.referencePath = resourcePath;
                  if (resourceOptions.resourceScale != null && resourceOptions.resourceScale !== 1.0) {
                    var indexOfExt = resourcePath.lastIndexOf('.');
                    resourceOptions.src = resourcePath.substring(0, indexOfExt) + '@' + resourceOptions.resourceScale + 'x' + resourcePath.substring(indexOfExt);
                  } else {
                    resourceOptions.src = resourcePath;
                  }
                  resourcePathsToLoad.push(resourceOptions);
                } else {
                  resourcePathsToLoad.push(resourcePath);
                }
              } else {
                // gather all load promises from packages using resources from this package
                addLoadPromisesFromPkgs(pkgsForResource);

                if (!preventAllocation) {
                  // add this package to list of packages using this resource
                  pkgsForResource.push(pkg);
                }
              }
            }
          }.bind(this);

          // check each resource data and either load or wait for previous load of all resource paths
          for (var i = 0, il = pkgResources.length; i < il; i++) {
            var resourceData = pkgResources[i];
            var resourceName = resourceData.name;
            if (resourceNamesAndPathsMapped[resourceName] == null) {
              resourceNamesAndPathsMapped[resourceName] = true;

              // load or wait for previous load of all resource paths
              var imgLoadOptions = {};
              if (resourceData.is16Bit) {
                // 16 bit images should load in 16-bit format
                imgLoadOptions.pixelFormat = cc.Texture2D.PIXEL_FORMAT_RGB5A1;
                // 16 bit images should load at 1x scale
                imgLoadOptions.resourceScale = 1.0;
              } else {
                // non-16 bit images should load in 32-bit format
                imgLoadOptions.pixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888;
                // non-16 bit images without noScale flag should load at engine resource scale
                imgLoadOptions.resourceScale = resourceData.noScale ? 1.0 : CONFIG.resourceScaleEngine;
              }

              if (resourceData.imgPosX != null) {
                imgLoadOptions.isForCubemap = true;
                addToLoadOrWaitForResourcePath(resourceData.imgPosX, _.extend({}, imgLoadOptions));
                addToLoadOrWaitForResourcePath(resourceData.imgNegX, _.extend({}, imgLoadOptions));
                addToLoadOrWaitForResourcePath(resourceData.imgPosY, _.extend({}, imgLoadOptions));
                addToLoadOrWaitForResourcePath(resourceData.imgNegY, _.extend({}, imgLoadOptions));
                addToLoadOrWaitForResourcePath(resourceData.imgPosZ, _.extend({}, imgLoadOptions));
                addToLoadOrWaitForResourcePath(resourceData.imgNegZ, _.extend({}, imgLoadOptions));
              }

              addToLoadOrWaitForResourcePath(resourceData.img, imgLoadOptions);
              addToLoadOrWaitForResourcePath(resourceData.plist);
              addToLoadOrWaitForResourcePath(resourceData.font);

              if (!window.isDesktop && !resourceData.streaming) {
                // audio should only load on web client and only when not streaming
                addToLoadOrWaitForResourcePath(resourceData.audio);
              }

              var pkgsForResourceName = this._packagesByResourceName[resourceName];
              if (pkgsForResourceName != null) {
                // packages already require this entire resource
                addLoadPromisesFromPkgs(pkgsForResourceName);
                if (!preventAllocation) {
                  pkgsForResourceName.push(pkg);
                }
              } else {
                // this resource should be loaded
                resourcesToLoad.push(resourceData);

                if (!preventAllocation) {
                  // map package
                  this._packagesByResourceName[resourceName] = [pkg];

                  // make strong references to resource paths
                  // these references only need to be made the first time a resource is loaded
                  if (resourceData.imgPosX != null) {
                    this.addStrongReferenceToResourcePath(resourceName, resourceName);
                  }
                  this.addStrongReferenceToResourcePath(resourceData.img, resourceName);
                  this.addStrongReferenceToResourcePath(resourceData.plist, resourceName);
                  this.addStrongReferenceToResourcePath(resourceData.font, resourceName);
                  this.addStrongReferenceToResourcePath(resourceData.audio, resourceName);
                }
              }
            }
          }

          // after filtering, add id to list of ids when not preventing allocation
          if (!preventAllocation) {
            this._ids.push(id);
          }

          // setup promise for all other packages loading these resources
          var loadPromiseForResources = Promise.all(loadPromisesForResources);
          // console.log("LOAD", pkg, "(", loadPromisesForResources.length, "other packages loading some/all of resources) -> resourcesToLoad", resourcesToLoad, "resourcePathsToLoad", resourcePathsToLoad);
          // setup load parameters
          var loadCompleted = false;
          var onLoadComplete = function () {
            if (!loadCompleted) {
              loadCompleted = true;

              // wait for existing load promises
              loadPromiseForResources.then(function () {
                if (!preventAllocation) {
                  // add all resources to caches
                  for (var i = 0, il = resourcesToLoad.length; i < il; i++) {
                    this._addResourcesToCachesByResourceData(resourcesToLoad[i]);
                  }
                }

                resolve();
              }.bind(this));
            }
          }.bind(this);

          if (resourcePathsToLoad.length === 0) {
            // nothing new to load, call completion immediately
            onLoadComplete();
          } else {
            // setup load options
            var loadOptions = {};

            // add load options progress callback
            loadOptions.trigger = function (resource, numLoading, numLoaded) {
              if (!loadCompleted) {
                if (_.isFunction(progressHandler)) {
                  var progress = Math.min(Math.max(numLoaded / numLoading, 0), 1);
                  progressHandler(progress);
                }
              }
            };

            // add load options complete callback
            loadOptions.cb = onLoadComplete;

            // switch to non allocating loader
            if (preventAllocation) {
              NonAllocatingLoader.load(resourcePathsToLoad, loadOptions);
            } else {
              // start load using cocos
              cc.loader.load(resourcePathsToLoad, loadOptions);
            }
          }
        }.bind(this));
      }
    }

    return pkg.getPromise();
  },

  /* endregion LOAD */

  /* region UNLOAD */

  /**
   * Unloads all resources in a package that are not required by any other package and returns a promise.
   * @param id package id
   * @returns {Promise}
   */
  unloadPackage: function (id) {
    var pkg = this._packagesById[id];

    if (pkg == null) {
      return Promise.resolve();
    } else {
      var pkgResources = pkg.getResources();
      var pkgPromise = pkg.getPromise();
      if (pkgResources == null || pkgResources.length === 0) {
        return pkgPromise;
      } else {
        // remove reference to package
        delete this._packagesById[id];
        this._ids = _.without(this._ids, id);

        // wait for resolve then unload all resources
        return pkgPromise.then(function () {
          // console.log("UNLOAD", pkg);
          // unload package

          var unmapResourcePath = function (resourcePath) {
            if (resourcePath != null) {
              // remove resource from package maps
              var pkgsForResource = this._packagesByResourcePath[resourcePath];
              if (pkgsForResource != null) {
                // remove package from map
                pkgsForResource = _.without(pkgsForResource, pkg);
                if (pkgsForResource.length === 0) {
                  // no more packages need this resource path
                  delete this._packagesByResourcePath[resourcePath];
                } else {
                  this._packagesByResourcePath[resourcePath] = pkgsForResource;
                }
              }
            }
          }.bind(this);

          for (var i = 0, il = pkgResources.length; i < il; i++) {
            var resourceData = pkgResources[i];
            var resourceName = resourceData.name;

            var pkgsForResourceName = this._packagesByResourceName[resourceName];
            if (pkgsForResourceName != null && pkgsForResourceName.length > 0) {
              // unmap resources
              if (resourceData.imgPosX != null) {
                unmapResourcePath(resourceData.imgPosX, resourceName);
                unmapResourcePath(resourceData.imgNegX, resourceName);
                unmapResourcePath(resourceData.imgPosY, resourceName);
                unmapResourcePath(resourceData.imgNegY, resourceName);
                unmapResourcePath(resourceData.imgPosZ, resourceName);
                unmapResourcePath(resourceData.imgNegZ, resourceName);
              }
              unmapResourcePath(resourceData.img, resourceName);
              unmapResourcePath(resourceData.plist, resourceName);
              unmapResourcePath(resourceData.audio, resourceName);
              unmapResourcePath(resourceData.font, resourceName);

              // remove resource data from package maps
              pkgsForResourceName = _.without(pkgsForResourceName, pkg);

              if (pkgsForResourceName.length === 0) {
                // no other packages need resource
                delete this._packagesByResourceName[resourceName];

                // remove strong references to resource paths
                // these references only need to be removed when no packages need this resource anymore
                if (resourceData.imgPosX != null) {
                  this.removeStrongReferenceToResourcePath(resourceName, resourceName);
                }
                this.removeStrongReferenceToResourcePath(resourceData.img, resourceName);
                this.removeStrongReferenceToResourcePath(resourceData.plist, resourceName);
                this.removeStrongReferenceToResourcePath(resourceData.audio, resourceName);
                this.removeStrongReferenceToResourcePath(resourceData.font, resourceName);
              } else {
                this._packagesByResourceName[resourceName] = pkgsForResourceName;
              }
            }
          }
        }.bind(this));
      }
    }
  },

  /**
   * Unloads a list of packages by id and returns a promise.
   * @param {Array} ids
   * @returns {Promise}
   */
  unloadPackages: function (ids) {
    if (ids && ids.length > 0) {
      var unloadPromises = [];
      for (var i = 0, il = ids.length; i < il; i++) {
        unloadPromises.push(this.unloadPackage(ids[i]));
      }
      return Promise.all(unloadPromises);
    } else {
      return Promise.resolve();
    }
  },

  /* endregion UNLOAD */

  /* region RESOURCES */

  /**
   * Adds a strong reference for a resource path by a reference id, disabling it from being unloaded.
   * @param {String} resourcePath resource path to reference
   * @param {String|Number} referenceId id of reference
   */
  addStrongReferenceToResourcePath: function (resourcePath, referenceId) {
    if (_.isString(resourcePath) && referenceId != null) {
      var referencesForResource = this._strongReferencesByResourcePath[resourcePath];
      if (referencesForResource == null) {
        // first strong reference to resource
        this._strongReferencesByResourcePath[resourcePath] = [referenceId];
      } else {
        // new strong reference to resource
        referencesForResource.push(referenceId);
      }
    }
  },

  /**
   * Removes a strong reference for a resource path by a reference id, allowing it to be unloaded when there are no more strong references to it.
   * NOTE: a resource will be unloaded immediately when all references are removed
   * @param {String} resourcePath resource path to reference
   * @param {String|Number} referenceId id of reference
   */
  removeStrongReferenceToResourcePath: function (resourcePath, referenceId) {
    if (_.isString(resourcePath) && referenceId != null) {
      var referencesForResource = this._strongReferencesByResourcePath[resourcePath];
      if (referencesForResource != null) {
        referencesForResource = _.without(referencesForResource, referenceId);
        if (referencesForResource.length === 0) {
          // no more strong references to resource path
          delete this._strongReferencesByResourcePath[resourcePath];

          // deallocate resource at path
          this._removeResourcesFromCachesByResourcePath(resourcePath);
        } else {
          // strong references remaining
          this._strongReferencesByResourcePath[resourcePath] = referencesForResource;
        }
      }
    }
  },

  /**
   * Gets the number of strong references to a resource path.
   * @param {String} resourcePath resourcePath path to reference
   * @returns {Number}
   */
  getNumStrongReferencesForResourcePath: function (resourcePath) {
    var referencesForResource = this._strongReferencesByResourcePath[resourcePath];
    return referencesForResource != null ? referencesForResource.length : 0;
  },

  /**
   * Adds resources to caches based on a resource data object to be used for sprite frames, animations, etc.
   * @param {Object} resourceData
   * @private
   */
  _addResourcesToCachesByResourceData: function (resourceData) {
    if (resourceData != null) {
      // textures should always be loaded
      var img = resourceData.img;
      if (img != null) {
        var texture = cc.textureCache.getTextureForKey(img);
        if (texture == null) {
          throw new Error('PackageManager._addResourcesToCachesByResourceData -> images must be loaded before adding to cache: ' + img);
        }
      }

      // handle resource data by type
      if (UtilsResources.getIsResourceForCubemap(resourceData)) {
        this._addCubemapResourceToCaches(resourceData);
      } else if (UtilsResources.getIsResourceForAnimation(resourceData)) {
        this._addAnimationResourceToCaches(resourceData);
      } else if (UtilsResources.getIsResourceForSpriteFrame(resourceData)) {
        this._addSpriteFrameResourceToCaches(resourceData);
      }
    }
  },

  /**
   * Adds sprite frame resources to caches based on a resource data object.
   * @param {Object} resourceData
   * @private
   */
  _addSpriteFrameResourceToCaches: function (resourceData) {
    // add plist to auto add all sprite frames
    cc.spriteFrameCache.addSpriteFrames(resourceData.plist);
  },

  /**
   * Adds animation resources to caches based on a resource data object.
   * @param {Object} resourceData
   * @private
   */
  _addAnimationResourceToCaches: function (resourceData) {
    var name = resourceData.name;
    var plist = resourceData.plist;
    var frameDelay = resourceData.frameDelay * .8; // flat incrase of all sprite animation speeds
    var animFrames = [];

    // add plist
    cc.spriteFrameCache.addSpriteFrames(plist);

    var frameKeys = UtilsResources.getFrameKeys(resourceData.plist, resourceData.framePrefix);
    if (frameKeys.length > 0) {
      // add all matching frames
      for (var i = 0; i < frameKeys.length; i++) {
        animFrames.push(cc.spriteFrameCache.getSpriteFrame(frameKeys[i]));
      }

      // create animation
      var animation = cc.Animation.create(animFrames, frameDelay);
      cc.animationCache.addAnimation(animation, name);
    }
  },

  /**
   * Adds cubemap resources to caches based on a resource data object.
   * @param {Object} resourceData
   * @private
   */
  _addCubemapResourceToCaches: function (resourceData) {
    // trigger loaded
    cc.textureCache.handleLoadedTexture(resourceData.name, resourceData);
  },

  /**
   * Removes resources from caches based on a resource data object.
   * @param {Object} resourceData
   * @private
   */
  _removeResourcesFromCachesByResourceData: function (resourceData) {
    // remove all resource data
    if (resourceData.img != null) {
      this._removeImageResourceFromCaches(resourceData.img);
    }
    if (resourceData.imgPosX != null) {
      this._removeCubemapResourceFromCaches(resourceData.name);
    }
    if (resourceData.audio != null) {
      this._removeAudioResourceFromCaches(resourceData.audio);
    }
    if (resourceData.plist != null) {
      this._removePlistResourceFromCaches(resourceData.plist);
    }
    if (resourceData.font != null) {
      this._removeFontResourceFromCaches(resourceData.font);
    }
  },

  /**
   * Removes resources from caches based on a resource path.
   * @param {String} resourcePath
   * @private
   */
  _removeResourcesFromCachesByResourcePath: function (resourcePath) {
    var ext = UtilsResources.getExt(resourcePath);
    if (UtilsResources.getExtIsForImage(ext)) {
      this._removeImageResourceFromCaches(resourcePath);
    } else if (UtilsResources.getExtIsForAudio(ext)) {
      this._removeAudioResourceFromCaches(resourcePath);
    } else if (UtilsResources.getExtIsForPlist(ext)) {
      this._removePlistResourceFromCaches(resourcePath);
    } else if (UtilsResources.getExtIsForFont(ext)) {
      this._removeFontResourceFromCaches(resourcePath);
    } else {
      this._removeCubemapResourceFromCaches(resourcePath);
    }
  },

  /**
   * Removes cubemap resources from caches based on a resource path.
   * @param {String} resourcePath
   * @private
   */
  _removeCubemapResourceFromCaches: function (resourcePath) {
    var cubemapTexture = cc.textureCache.getTextureForKey(resourcePath);
    if (cubemapTexture instanceof CubemapTexture) {
      // textureCache
      cubemapTexture.releaseTexture();
      cc.textureCache.removeTextureForKey(resourcePath);

      // loader cache
      cc.loader.release(resourcePath);
    }
  },

  /**
   * Removes image resources from caches based on a resource path.
   * @param {String} resourcePath
   * @private
   */
  _removeImageResourceFromCaches: function (resourcePath) {
    var spriteFrames = cc.spriteFrameCache._spriteFrames;
    var spriteFramesKeys = Object.keys(spriteFrames);
    var animations = cc.animationCache._animations;
    var animationsKeys = Object.keys(animations);

    // get texture
    var texture = cc.textureCache.getTextureForKey(resourcePath);

    if (texture == null) {
      // no texture for path, it may be a spriteframe
      var spriteFrame = cc.spriteFrameCache.getSpriteFrame(resourcePath);
      if (spriteFrame != null) {
        // in this case, we need to check for any other references to the sprite frame's texture
        // sprite frames are usually part of a sprite sheet
        // the sprite sheet texture can only be removed when there are no other references
        var spriteFrameTexture = spriteFrame.getTexture();
        var textureUsedElsewhere = false;

        // check references to direct texture
        var texturePath = spriteFrameTexture && spriteFrameTexture.url;
        if (texturePath != null) {
          if (this.getNumStrongReferencesForResourcePath(texturePath) > 0) {
            textureUsedElsewhere = true;
          }
        }

        // check sprite frames that also use this texture
        if (!textureUsedElsewhere) {
          for (var i = 0, il = spriteFramesKeys.length; i < il; i++) {
            var spriteFrameKey = spriteFramesKeys[i];
            var spriteFrame = spriteFrames[spriteFrameKey];
            if (spriteFrame && (spriteFrame.getTexture() == texture) && this.getNumStrongReferencesForResourcePath(spriteFrameKey) > 0) {
              textureUsedElsewhere = true;
              break;
            }
          }
        }

        // if texture is not used anywhere else, proceed with unload
        if (!textureUsedElsewhere) {
          texture = spriteFrameTexture;
        }
      }
    }

    if (texture != null) {
      // search spriteFrameCache for texture
      // ref: cc.spriteFrameCache.removeSpriteFramesFromTexture(texture);
      var spriteFrameKeysToRemove = [];
      var animationKeysToRemove = [];
      for (var i = 0, il = spriteFramesKeys.length; i < il; i++) {
        var spriteFrameKey = spriteFramesKeys[i];
        var spriteFrame = spriteFrames[spriteFrameKey];
        if (spriteFrame && (spriteFrame.getTexture() == texture)) {
          // search animations for spriteFrame
          for (var j = 0, jl = animationsKeys.length; j < jl; j++) {
            var animationKey = animationsKeys[j];
            var animation = animations[animationKey];
            if (animation) {
              var animationFrames = animation.getFrames();
              for (var k = 0, kl = animationFrames.length; k < kl; k++) {
                var animationFrame = animationFrames[k];
                var animationSpriteFrame = animationFrame.getSpriteFrame();
                if (animationSpriteFrame === spriteFrame) {
                  // animation should be removed
                  animationKeysToRemove.push(animationKey);
                  break;
                }
              }
            }
          }

          // spriteFrame should be removed
          spriteFrameKeysToRemove.push(spriteFrameKey);
        }
      }

      // animationCache
      for (var i = 0, il = animationKeysToRemove.length; i < il; i++) {
        cc.animationCache.removeAnimation(animationKeysToRemove[i]);
      }

      // spriteFrameCache
      for (var i = 0, il = spriteFrameKeysToRemove.length; i < il; i++) {
        cc.spriteFrameCache.removeSpriteFrameByName(spriteFrameKeysToRemove[i]);
      }

      // textureCache
      texture.releaseTexture();
      cc.textureCache.removeTextureForKey(resourcePath);

      // loader cache
      cc.loader.release(resourcePath);
    }
  },

  /**
   * Removes audio resources from caches based on a resource path.
   * @param {String} resourcePath
   * @private
   */
  _removeAudioResourceFromCaches: function (resourcePath) {
    // release from audio engine
    audio_engine.current().release_audio_by_src(resourcePath);

    // loader cache
    cc.loader.release(resourcePath);
  },

  /**
   * Removes font resources from caches based on a resource path.
   * @param {String} resourcePath
   * @private
   */
  _removeFontResourceFromCaches: function (resourcePath) {
    // TODO: are fonts cached anywhere else?

    // loader cache
    cc.loader.release(resourcePath);
  },

  /**
   * Removes plist resources from caches based on a resource path.
   * @param {String} resourcePath
   * @private
   */
  _removePlistResourceFromCaches: function (resourcePath) {
    // TODO: are plist cached anywhere else?

    // loader cache
    cc.loader.release(resourcePath);
  },

  /* endregion RESOURCES */

  /* region LOAD MAJOR/MINOR */

  /**
   * Loads a major package and unloads all previously loaded major/minor packages. Will attempt to automatically load all resources defined by PKGS.getPkgForIdentifier(majorId/minorId).
   * - NOTE: currently progress handler is only called for major package load
   * @param {String|Null} majorId id of major package
   * @param {Array} [minorIds=null] list of ids of minor packages
   * @param {Array} [resources=null] list of resources not included in any major/minor packages
   * @returns {Promise}
   * @see loadPackage
   */
  loadMajorPackage: function (majorId, minorIds, resources) {
    if (majorId != null && this._loadingMajorId !== majorId) {
      // deactivate and unload any loading major package
      // this is safe as long as all resource usage is correctly strong referenced
      // as strong references will be broken naturally as the UI changes
      // once all strong references are removed, resources will be unloaded
      this.deactivateLoadingMajorPackage();
      this.unloadUnusedMajorMinorPackages();

      if (this._activeMajorId === majorId) {
        // attempting to load current active major package
        this._loadingMajorId = null;

        // unload unused immediately
        this._loadMajorPromise = this.unloadUnusedMajorMinorPackages();
      } else {
        // loading new major package
        this._loadingMajorId = majorId;

        var loadPromises = [];

        if (!CONFIG.LOAD_ALL_AT_START) {
          // load major
          this._loadingMajorMinorIds.push(majorId);
          this._unloadableMajorMinorIds = _.without(this._unloadableMajorMinorIds, majorId);
          loadPromises.push(this.loadPackage(majorId, resources));

          // load minor
          if (minorIds != null) {
            for (var i = 0, il = minorIds.length; i < il; i++) {
              loadPromises.push(this.loadMinorPackage(minorIds[i], null, majorId));
            }
          }
        }

        this._loadMajorPromise = Promise.all(loadPromises);
      }
    }

    return this._loadMajorPromise;
  },

  /**
   * Sets the currently loading major package as active and flags any previous major/minor packages as unused.
   * NOTE: this must be called after the intended active major package has started loading.
   * @returns {Promise}
   */
  activateLoadingMajorPackage: function () {
    if (this._loadingMajorId != null && this._activeMajorId !== this._loadingMajorId) {
      this._activeMajorId = this._loadingMajorId;
      this._loadingMajorId = null;

      // add all previously active major/minor packages to list of packages that can be unloaded
      this.addUnusedMajorMinorPackages(this._activeMajorMinorIds);
      this._activeMajorMinorIds = this._loadingMajorMinorIds;
      this._loadingMajorMinorIds = [];
    }

    return Promise.resolve();
  },

  /**
   * Sets the currently loading major package as unused.
   * NOTE: this must be called after the intended active major package has started loading.
   * @returns {Promise}
   */
  deactivateLoadingMajorPackage: function () {
    if (this._loadingMajorId != null) {
      this._loadingMajorId = null;

      // add all previously active major/minor packages to list of packages that can be unloaded
      this.addUnusedMajorMinorPackages(this._loadingMajorMinorIds);
      this._loadingMajorMinorIds = [];
    }

    return Promise.resolve();
  },

  /**
   * Loads a minor package, preserving all previously loaded major/minor packages. Will attempt to automatically load the list of resources defined by PKGS.getPkgForIdentifier(id).
   * @param {String|Number} id id of package
   * @param {Array} [resources=null] list of resources not included in the package defined by PKGS.getPkgForIdentifier(id)
   * @param {String} [majorId=null] major package id that this minor package is related to, defaults to current loading or if none then active
   * @returns {Promise}
   * @see loadPackage
   */
  loadMinorPackage: function (id, resources, majorId) {
    if (id != null && !CONFIG.LOAD_ALL_AT_START) {
      if (majorId == null) { majorId = this._loadingMajorId || this._activeMajorId; }
      var promise;
      var pkg = this._packagesById[id];
      if (pkg != null) {
        promise = pkg.getPromise();
      } else {
        promise = this.loadPackage(id, resources);
        pkg = this._packagesById[id];
      }

      if (pkg != null && pkg.getResources().length > 0) {
        if (majorId === this._activeMajorId) {
          // add id to list of major/minor packages in use
          if (!_.contains(this._activeMajorMinorIds, id)) {
            this._activeMajorMinorIds.push(id);
          }
        } else {
          // add id to list of major/minor packages loading
          if (!_.contains(this._loadingMajorMinorIds, id)) {
            this._loadingMajorMinorIds.push(id);
          }
        }

        // remove from unloadable major/minor packages
        this._unloadableMajorMinorIds = _.without(this._unloadableMajorMinorIds, id);
      }

      return promise;
    } else {
      return Promise.resolve();
    }
  },

  /* endregion LOAD MAJOR/MINOR */

  /* region UNLOAD MAJOR/MINOR */

  /**
   * Unloads a list of previously loaded major/minor packages immediately.
   * @param {Array} ids
   * @returns {Promise}
   */
  unloadMajorMinorPackages: function (ids) {
    if (ids && ids.length > 0) {
      var unloadPromises = [];
      for (var i = 0, il = ids.length; i < il; i++) {
        unloadPromises.push(this.unloadMajorMinorPackage(ids[i]));
      }
      return Promise.all(unloadPromises);
    } else {
      return Promise.resolve();
    }
  },

  /**
   * Unloads a previously loaded major/minor packages immediately.
   * @returns {Promise}
   */
  unloadMajorMinorPackage: function (id) {
    if (id != null) {
      // remove from major/minor package lists
      this._loadingMajorMinorIds = _.without(this._loadingMajorMinorIds, id);
      this._activeMajorMinorIds = _.without(this._activeMajorMinorIds, id);
      this._unloadableMajorMinorIds = _.without(this._unloadableMajorMinorIds, id);
    }

    return this.unloadPackage(id);
  },

  /**
   * Unloads all unused previously loaded major/minor packages.
   * @returns {Promise}
   */
  unloadUnusedMajorMinorPackages: function () {
    var unloadableMajorMinorIds = this._unloadableMajorMinorIds;
    this._unloadableMajorMinorIds = [];
    return this.unloadPackages(unloadableMajorMinorIds);
  },

  /**
   * Adds a major/minor package id as unused.
   * @param {String} id
   */
  addUnusedMajorMinorPackage: function (id) {
    if (id != null) {
      this._unloadableMajorMinorIds.push(id);
    }
  },

  /**
   * Adds major/minor packages id as unused.
   * @param {Array} ids
   */
  addUnusedMajorMinorPackages: function (ids) {
    if (ids != null && ids.length > 0) {
      this._unloadableMajorMinorIds = this._unloadableMajorMinorIds.concat(ids);
    }
  },

  /* endregion UNLOAD MAJOR/MINOR */

  /* region UTILITY */

  /**
   * Helper method to load resources for a major package and immediately activate it, causing all further minor packages to retain under this major package.
   * @param {String} majorId
   * @param {Array} [minorIds=null]
   * @param {Array} [resources=null] additional resources not contains in major/minor packages
   * @param {Function} [uiSwapCallback=null] callback to swap UI that must return a promise
   * @returns {Promise}
   */
  loadAndActivateMajorPackage: function (majorId, minorIds, resources, uiSwapCallback) {
    var loadPromise;
    if (CONFIG.LOAD_ALL_AT_START) {
      // make sure preloading UI is removed
      this._removePreloadingUI();

      // swap ui as needed
      loadPromise = ((uiSwapCallback != null && uiSwapCallback()) || Promise.resolve())
        .catch(function (error) { EventBus.getInstance().trigger(EVENTS.error, error); });
    } else if (this.getMajorPackageId() == majorId) {
      // make sure preloading UI is removed
      this._removePreloadingUI();

      // deactivate and unload any loading major package
      // deactivating flags all loading major/minor packages as unused
      // this is safe as long as all resource usage is correctly strong referenced
      // as strong references will be broken naturally as the UI changes
      // once all strong references are removed, resources will be unloaded
      this.deactivateLoadingMajorPackage();
      this.unloadUnusedMajorMinorPackages();

      // swap ui as needed
      loadPromise = ((uiSwapCallback != null && uiSwapCallback()) || Promise.resolve())
        .catch(function (error) { EventBus.getInstance().trigger(EVENTS.error, error); });
    } else {
      // show loading dialog and destroy all UI
      loadPromise = NavigationManager.getInstance().showDialogForLoad().then(function () {
        // make sure preloading UI is removed
        this._removePreloadingUI();

        return Promise.all([
          // load major/minor packages
          this.loadMajorPackage(majorId, minorIds, resources),
          // activate new major package as soon as new load begins
          this.activateLoadingMajorPackage(),
          // unload previous major package as soon as new load begins
          this.unloadUnusedMajorMinorPackages(),
        ]);
      }.bind(this))
        .then(function () {
          // destroy loading dialog
          NavigationManager.getInstance().destroyDialogForLoad();

          // update UI
          return (uiSwapCallback != null && uiSwapCallback() || Promise.resolve());
        })
        .catch(function (error) {
          EventBus.getInstance().trigger(EVENTS.error, error);
        });
    }
    return loadPromise;
  },

  _removePreloadingUI: function () {
    if (this._$preloading == null) {
      this._$preloading = $('#app-preloading').addClass('out').one('transitionend', function () { this._$preloading.remove(); }.bind(this));
    }
  },

  /**
   * Helper method to load resources for a game defined by a list of faction ids and minor package ids.
   * NOTE: to activate the game package, when ready call "PackageManager.getInstance().activateGamePackage()".
   * @param {Array} factionIds
   * @param {Array} [gameMinorPkgIds=null]
   * @returns {Promise}
   */
  loadGamePackageWithoutActivation: function (factionIds, gameMinorPkgIds) {
    if (gameMinorPkgIds == null) {
      gameMinorPkgIds = [];
    }

    // add all faction ids
    for (var i = 0, il = factionIds.length; i < il; i++) {
      var factionId = factionIds[i];
      if (factionId != null) {
        var factionGamePkgId = PKGS.getFactionGamePkgIdentifier(factionId);
        if (!_.contains(gameMinorPkgIds, factionGamePkgId)) {
          gameMinorPkgIds.push(factionGamePkgId);
        }
      }
    }

    // always add neutral pkg
    var neutralFactionGamePkgId = PKGS.getFactionGamePkgIdentifier(Factions.Neutral);
    if (!_.contains(gameMinorPkgIds, neutralFactionGamePkgId)) {
      gameMinorPkgIds.push(neutralFactionGamePkgId);
    }

    // load major game package with all minor packages
    return this.loadMajorPackage('game', gameMinorPkgIds);
  },

  /**
   * Helper method to activate the currently loading game major package.
   * NOTE: this should only be called after "PackageManager.getInstance().loadGamePackageWithoutActivation()".
   * @returns {Promise}
   */
  activateGamePackage: function () {
    if (this.getLoadingMajorPackageId() == 'game') {
      return Promise.all([
        // activate new major package and unload previous
        // activating flags all previously active major/minor packages as unused
        this.activateLoadingMajorPackage(),
        this.unloadUnusedMajorMinorPackages(),
      ]);
    } else {
      return Promise.reject('Loading major package is not game!');
    }
  },

  injectClassWithResourceRequests: function (cls) {

  },

  /* endregion UTILITY */

});

/* region LOAD PACKAGE */

/**
 * Load package object.
 * @param {String|Number|Integer} id
 * @param {Array} resources
 * @constructor
 */
var LoadPackage = function (id, resources) {
  this._id = id;
  this._promise = null;

  // assemble resources
  this._resources = PKGS.getPkgForIdentifier(id);
  if (resources != null && resources.length > 0) {
    this._resources = this._resources.concat(resources);
  }
};

LoadPackage.prototype = {
  constructor: LoadPackage,
  getId: function () {
    return this._id;
  },
  getPromise: function () {
    return this._promise;
  },
  getResources: function () {
    return this._resources;
  },
};

/* endregion LOAD PACKAGE */

/* region NON-ALLOCATING LOADER */

/**
 * Non-allocating loader.
 */
var NonAllocatingLoader = {
  load: function (resources, options) {
    // get options
    var progressCallback = options && options.trigger;
    var completionCallback = options && options.cb;

    // ensure array
    if (resources != null && !_.isArray(resources)) { resources = [resources]; }

    if (resources == null || resources.length === 0) {
      if (completionCallback) { completionCallback(); }
    } else {
      // map load requests with a concurrency limit
      var numLoading = resources.length;
      var numLoaded = 0;
      Promise.map(resources, function (resource) {
        var url;
        if (resource.type) {
          url = resource.src ? resource.src : (resource.name + '.' + resource.type.toLowerCase());
        } else {
          url = resource;
        }
        return this.loadUrl(url).then(function () {
          // update progress as soon as get request resolves
          numLoaded++;
          if (progressCallback) { progressCallback(url, numLoading, numLoaded); }
        }).catch(function (errorMessage) {
          // log errors for now and do nothing
          console.log(errorMessage);
        });
      }.bind(this), { concurrency: 10000 })
        .then(function () {
        // for now, we want to complete the load whether all resources get loaded or not
        // we don't need to retry on errors because this is loading without allocation
        // i.e. something is better than nothing
          if (completionCallback) { completionCallback(); }
        });
    }
  },
  loadUrl: function (url) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = UtilsResources.getExtIsForAudio(url) ? 'arraybuffer' : 'blob';

      xhr.onload = function () {
        // this is called even on 404 etc so check the status
        if (xhr.status == 200) {
          // status is okay
          resolve();
        } else {
          // not okay, reject with the status text
          reject('[LOAD ERROR] ' + url + ' -> ' + xhr.statusText);
        }
      };

      // handle network errors
      xhr.onerror = function () {
        reject('[NETWORK ERROR] ' + url);
      };

      xhr.send();
    });
  },
};

/* endregion NON-ALLOCATING LOADER */

/* region BACKBONE-MARIONETTE */

// inject all views with resource request architecture
_PackageManager.injectClassWithResourceRequests(Backbone.Marionette.View);

Backbone.Marionette.View.prototype._super_onShowCalled_fromResources = Backbone.Marionette.View.prototype.onShowCalled;
Backbone.Marionette.View.prototype.onShowCalled = function () {
  if (this.isDestroyed) { return; }

  // call original method
  Backbone.Marionette.View.prototype._super_onShowCalled_fromResources.call(this);

  // start executing resource requests
  this.enabledAndExecuteResourceRequests();
};

Backbone.Marionette.View.prototype._super_destroy_fromResources = Backbone.Marionette.View.prototype.destroy;
Backbone.Marionette.View.prototype.destroy = function () {
  if (this.isDestroyed) { return; }

  // call original method
  Backbone.Marionette.View.prototype._super_destroy_fromResources.call(this);

  // stop and unload all resource requests
  this.disableAndRemoveResourceRequests();
};

/* endregion BACKBONE-MARIONETTE */

/* region COCOS2D */

/* region COCOS2D LOADERS */

/**
 * Cocos image loader.
 */
var ImageLoader = {
  load: function (realUrl, url, options, cb) {
    // get reference path
    var referencePath = (options && options.referencePath) || url;

    // load url
    cc.loader.loadImg(realUrl, function (err, img) {
      if (err) return cb(err);
      // add to loader cache
      cc.loader.cache[url] = img;

      // alias reference path to map to loaded url
      if (referencePath !== url) {
        cc.loader._aliases[referencePath] = url;
      }

      // add to texture cache
      cc.textureCache.handleLoadedTexture(referencePath, options);

      // finish
      cb(null, img);

      // attempt to release html image object (but not texture)
      // this frees up the RAM on the CPU side, as the image data has already been pushed to the GPU
      if (CONFIG.UNLOAD_CPU_IMAGES && !CONFIG.LOAD_ALL_AT_START && img != null && !options.isForCubemap) {
        cc.textureCache.releaseImageFromCPU(referencePath);
      }
    });
  },
};
cc.loader.register(['png', 'jpg', 'bmp', 'jpeg', 'gif', 'ico'], ImageLoader);

/* endregion COCOS2D LOADERS */

/* region TEXTURE */

/**
 * Releases an image resource from the CPU side caches.
 * @param {String} resourcePath
 */
cc.textureCache.releaseImageFromCPU = function (resourcePath) {
  var texture = cc.textureCache._textures[resourcePath];
  if (texture != null && texture._htmlElementObj != null) {
    texture._htmlElementObj.src = '';
    texture._htmlElementObj = null;
  }
  cc.loader.release(resourcePath);
};

// overrides for texture cache
// modify texture cache to allow for passing in texture options
cc.textureCache.handleLoadedTexture = function (referencePath, options) {
  // check whether renderer has been initialized
  var locTexs = this._textures;
  if (!cc._rendererInitialized) {
    locTexs = this._loadedTexturesBefore;
  }

  // create and cache texture
  var tex = locTexs[referencePath];
  if (!tex) {
    if (options.imgPosX != null) {
      tex = locTexs[referencePath] = new CubemapTexture();
    } else {
      tex = locTexs[referencePath] = new cc.Texture2D();
    }
    tex.url = referencePath;
  }
  tex.handleLoadedTexture(options);
};

cc.textureCache.addImage = function (url, cb, target) {
  cc.assert(url, cc._LogInfos.Texture2D_addImage_2);

  var locTexs = this._textures;
  if (!cc._rendererInitialized) {
    locTexs = this._loadedTexturesBefore;
  }
  var tex = locTexs[url] || locTexs[cc.loader._aliases[url]];
  if (tex) {
    cb && cb.call(target, tex);
    return tex;
  }

  // added image is not yet loaded, and cocos tries to load on the fly
  // this should never be the case for us, so we'll throw an error
  // TODO: appears loader is not loading correctly
  // throw new Error("cc.textureCache.addImage -> images must be loaded before adding to cache: " + url);

  tex = locTexs[url] = new cc.Texture2D();
  tex.url = url;
  var loadFunc = cc.loader._checkIsImageURL(url) ? cc.loader.load : cc.loader.loadImg;
  loadFunc.call(cc.loader, url, function (err, img) {
    if (err)
      return cb && cb.call(target, err);

    if (typeof pixelFormat === 'undefined') {
      cc.textureCache.handleLoadedTexture(url, cc.Texture2D.PIXEL_FORMAT_RGBA8888);
    } else {
      cc.textureCache.handleLoadedTexture(url, pixelFormat);
    }

    var texResult = locTexs[url];
    cb && cb.call(target, texResult);
  });

  return tex;
};

// modify texture to allow for passing in texture options
cc.Texture2D.prototype.handleLoadedTexture = function (options) {
  var gl = cc._renderContext;

  if (!cc._rendererInitialized)
    return;

  // cocos defaults all textures to be anti aliased
  this._antiAliased = true;

  if (!this._htmlElementObj) {
    var img = cc.loader.getRes(this.url);
    if (!img) return;
    this.initWithElement(img);
  }

  var pixelsWide = this._htmlElementObj.width;
  var pixelsHigh = this._htmlElementObj.height;
  if (!pixelsWide || !pixelsHigh)
    return;

  // extract options
  var pixelFormat;
  var resourceScale;
  if (options != null) {
    pixelFormat = options.pixelFormat || this._pixelFormat || cc.Texture2D.PIXEL_FORMAT_RGBA8888;
    resourceScale = options.resourceScale || 1;
  } else {
    pixelFormat = this._pixelFormat || cc.Texture2D.PIXEL_FORMAT_RGBA8888;
    resourceScale = 1;
  }

  // default pixel format
  if (pixelFormat == null) {
    pixelFormat = this._pixelFormat || cc.Texture2D.PIXEL_FORMAT_RGBA8888;
  }
  var bitsPerPixel = cc.Texture2D._B[pixelFormat];

  // resize based on resource scale
  if (resourceScale !== 1.0) {
    pixelsWide = Math.round(pixelsWide / resourceScale);
    pixelsHigh = Math.round(pixelsHigh / resourceScale);
  }

  // upload image to buffer
  cc.glBindTexture2D(this);

  // pixel store
  var bytesPerRow = pixelsWide * bitsPerPixel / 8;
  if (bytesPerRow % 8 === 0) {
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 8);
  } else if (bytesPerRow % 4 === 0) {
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
  } else if (bytesPerRow % 2 === 0) {
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 2);
  } else {
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  }

  // gl format and type from pixel format
  var format = gl.RGBA;
  var type = gl.UNSIGNED_BYTE;
  switch (pixelFormat) {
  case cc.Texture2D.PIXEL_FORMAT_RGBA8888:
    format = gl.RGBA;
    break;
  case cc.Texture2D.PIXEL_FORMAT_RGB888:
    format = gl.RGB;
    break;
  case cc.Texture2D.PIXEL_FORMAT_RGBA4444:
    type = gl.UNSIGNED_SHORT_4_4_4_4;
    break;
  case cc.Texture2D.PIXEL_FORMAT_RGB5A1:
    type = gl.UNSIGNED_SHORT_5_5_5_1;
    break;
  case cc.Texture2D.PIXEL_FORMAT_RGB565:
    type = gl.UNSIGNED_SHORT_5_6_5;
    break;
  case cc.Texture2D.PIXEL_FORMAT_AI88:
    format = gl.LUMINANCE_ALPHA;
    break;
  case cc.Texture2D.PIXEL_FORMAT_A8:
    format = gl.ALPHA;
    break;
  case cc.Texture2D.PIXEL_FORMAT_I8:
    format = gl.LUMINANCE;
    break;
  default:
    cc.assert(0, cc._LogInfos.Texture2D_initWithData);
  }

  // Specify OpenGL texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, format, format, type, this._htmlElementObj);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURE);
  cc.glBindTexture2D(null);

  this._pixelsWide = this._contentSize.width = pixelsWide;
  this._pixelsHigh = this._contentSize.height = pixelsHigh;
  this._pixelFormat = pixelFormat;
  this.maxS = 1;
  this.maxT = 1;

  this._hasPremultipliedAlpha = false;
  this._hasMipmaps = false;

  // dispatch load event to listener.
  this.dispatchEvent('load');
};

cc.Texture2D.prototype.getGLTexture = function () {
  return this._webTextureObj;
};

var CubemapTexture = cc.Texture2D.extend({

  _urlPosX: null,
  _urlNegX: null,
  _urlPosY: null,
  _urlNegY: null,
  _urlPosZ: null,
  _urlNegZ: null,

  getUrlPosX: function () {
    return this._urlPosX;
  },
  getUrlNegX: function () {
    return this._urlNegX;
  },
  getUrlPosY: function () {
    return this._urlPosY;
  },
  getUrlNegY: function () {
    return this._urlNegY;
  },
  getUrlPosZ: function () {
    return this._urlPosZ;
  },
  getUrlNegZ: function () {
    return this._urlNegZ;
  },

  handleLoadedTexture: function (options) {
    var gl = cc._renderContext;

    if (!cc._rendererInitialized)
      return;

    this._urlPosX = options.imgPosX;
    this._urlNegX = options.imgNegX;
    this._urlPosY = options.imgPosY;
    this._urlNegY = options.imgNegY;
    this._urlPosZ = options.imgPosZ;
    this._urlNegZ = options.imgNegZ;

    // strong reference sides to avoid unloading them before ready
    _PackageManager.getInstance().addStrongReferenceToResourcePath(this._urlPosX, this.__instanceId);
    _PackageManager.getInstance().addStrongReferenceToResourcePath(this._urlNegX, this.__instanceId);
    _PackageManager.getInstance().addStrongReferenceToResourcePath(this._urlPosY, this.__instanceId);
    _PackageManager.getInstance().addStrongReferenceToResourcePath(this._urlNegY, this.__instanceId);
    _PackageManager.getInstance().addStrongReferenceToResourcePath(this._urlPosZ, this.__instanceId);
    _PackageManager.getInstance().addStrongReferenceToResourcePath(this._urlNegZ, this.__instanceId);

    // bind texture for the cubemap
    this._webTextureObj = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this._webTextureObj);

    // set texture image data for the cube map
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cc.loader.getRes(this._urlPosX));
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cc.loader.getRes(this._urlNegX));
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cc.loader.getRes(this._urlPosY));
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cc.loader.getRes(this._urlNegY));
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cc.loader.getRes(this._urlPosZ));
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cc.loader.getRes(this._urlNegZ));

    // set cube map gl params
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    // release all cube sides from CPU now that we're done using them
    cc.textureCache.releaseImageFromCPU(this._urlPosX);
    cc.textureCache.releaseImageFromCPU(this._urlNegX);
    cc.textureCache.releaseImageFromCPU(this._urlPosY);
    cc.textureCache.releaseImageFromCPU(this._urlNegY);
    cc.textureCache.releaseImageFromCPU(this._urlPosZ);
    cc.textureCache.releaseImageFromCPU(this._urlNegZ);
  },

  releaseTexture: function () {
    // remove strong references to cube map sides
    _PackageManager.getInstance().removeStrongReferenceToResourcePath(this._urlPosX, this.__instanceId);
    _PackageManager.getInstance().removeStrongReferenceToResourcePath(this._urlNegX, this.__instanceId);
    _PackageManager.getInstance().removeStrongReferenceToResourcePath(this._urlPosY, this.__instanceId);
    _PackageManager.getInstance().removeStrongReferenceToResourcePath(this._urlNegY, this.__instanceId);
    _PackageManager.getInstance().removeStrongReferenceToResourcePath(this._urlPosZ, this.__instanceId);
    _PackageManager.getInstance().removeStrongReferenceToResourcePath(this._urlNegZ, this.__instanceId);

    this._urlPosX = this._urlNegX = this._urlPosY = this._urlNegY = this._urlPosZ = this._urlNegZ = null;

    if (this._webTextureObj != null) {
      cc._renderContext.deleteTexture(this._webTextureObj);
      this._webTextureObj = null;
    }
    cc.loader.release(this.url);
  },
});

/* endregion TEXTURE */

/* region NODE */

// inject all nodes with resource request architecture
_PackageManager.injectClassWithResourceRequests(cc.Node);

cc.Node.prototype._super_onEnter_fromResources = cc.Node.prototype.onEnter;
cc.Node.prototype.onEnter = function () {
  // call original method
  cc.Node.prototype._super_onEnter_fromResources.call(this);

  // start executing resource requests
  this.enabledAndExecuteResourceRequests();
};

cc.Node.prototype._super_onExit_fromResources = cc.Node.prototype.onExit;
cc.Node.prototype.onExit = function () {
  // call original method
  cc.Node.prototype._super_onExit_fromResources.call(this);

  // stop and unload all resource requests
  this.disableAndRemoveResourceRequests();
};

/* endregion NODE */

/* region STRONG REFERENCES */

/* region SPRITE */

cc.Sprite.prototype._requiredTextureResource = null;
cc.Sprite.prototype._requiredTextureResourceRequested = false;
/**
 * Sets the required texture resource for this sprite. Internally causes this texture to become a required resource for this sprite.
 * @param {Object} resource
 */
cc.Sprite.prototype.setRequiredTextureResource = function (resource) {
  if (this._requiredTextureResource != resource) {
    this._requiredTextureResource = resource;
    if (this._requiredTextureResource != null && !this._requiredTextureResourceRequested) {
      this._requiredTextureResourceRequested = true;
      this.whenRequiredResourcesReady().then(function (requestId) {
        if (!this.getAreResourcesValid(requestId)) return; // resources have been invalidated
        this.setTexture(cc.textureCache.getTextureForKey(resource.img));
      }.bind(this));
    }
  }
};

/**
 * Returns the required texture resources for this sprite.
 * @returns {null}
 */
cc.Sprite.prototype.getRequiredTextureResource = function () {
  return this._requiredTextureResource;
};

cc.Sprite.prototype._super_getRequiredResources_fromResources = cc.Sprite.prototype.getRequiredResources;
cc.Sprite.prototype.getRequiredResources = function () {
  var requiredTextureResource = this.getRequiredTextureResource();
  var requiredResources = cc.Sprite.prototype._super_getRequiredResources_fromResources.call(this);
  if (requiredTextureResource != null) {
    requiredResources.push(requiredTextureResource);
  }
  return requiredResources;
};

cc.Sprite.prototype._super_onEnter_fromResources = cc.Sprite.prototype.onEnter;
cc.Sprite.prototype.onEnter = function () {
  var texture = this._texture;
  if (texture != null) {
    // make a strong reference to the texture resource so it doesn't get unloaded too early
    _PackageManager.getInstance().addStrongReferenceToResourcePath(texture.url, this.__instanceId);
  } else if (!this._requiredTextureResourceRequested) {
    var requiredTextureResource = this.getRequiredTextureResource();
    if (requiredTextureResource != null) {
      this._requiredTextureResourceRequested = true;
      this.whenRequiredResourcesReady().then(function (requestId) {
        if (!this.getAreResourcesValid(requestId)) return; // resources have been invalidated
        this.setTexture(cc.textureCache.getTextureForKey(requiredTextureResource.img));
      }.bind(this));
    }
  }

  cc.Sprite.prototype._super_onEnter_fromResources.call(this);
};

cc.Sprite.prototype._super_onExit_fromResources = cc.Sprite.prototype.onExit;
cc.Sprite.prototype.onExit = function () {
  // remove strong reference to the texture resource so it can be unloaded
  var texture = this._texture;
  if (texture != null) {
    _PackageManager.getInstance().removeStrongReferenceToResourcePath(texture.url, this.__instanceId);
  }

  cc.Sprite.prototype._super_onExit_fromResources.call(this);
};

cc.Sprite.prototype._super_setTexture_fromResources = cc.Sprite.prototype.setTexture;
cc.Sprite.prototype.setTexture = function () {
  var texturePrev = this._texture;

  // set new texture
  cc.Sprite.prototype._super_setTexture_fromResources.apply(this, arguments);

  // when added to scene already
  if (this.isRunning()) {
    var texture = this._texture;
    if (texturePrev != texture) {
      if (texturePrev != null) {
        // remove strong reference to the texture resource so it can be unloaded
        _PackageManager.getInstance().removeStrongReferenceToResourcePath(texturePrev.url, this.__instanceId);
      }

      if (texture != null) {
        // make a strong reference to the texture resource so it doesn't get unloaded too early
        _PackageManager.getInstance().addStrongReferenceToResourcePath(texture.url, this.__instanceId);
      }
    }
  }
};

/* endregion SPRITE */

/* region AUDIO */

cc.Audio.prototype._super_play_fromResources = cc.Audio.prototype.play;
cc.Audio.prototype.play = function () {
  // make a strong reference to the audio resource so it doesn't get unloaded too early
  _PackageManager.getInstance().addStrongReferenceToResourcePath(this.src, this.__instanceId);

  cc.Audio.prototype._super_play_fromResources.apply(this, arguments);

  if (this._currentSource) {
    var super_onended = this._currentSource.onended;
    this._currentSource.onended = function () {
      // remove strong reference to the audio resource so it can be unloaded
      _PackageManager.getInstance().removeStrongReferenceToResourcePath(this.src, this.__instanceId);

      if (super_onended) { super_onended(); }
    }.bind(this);
  }
};

cc.Audio.prototype._super_stop_fromResources = cc.Audio.prototype.stop;
cc.Audio.prototype.stop = function () {
  cc.Audio.prototype._super_stop_fromResources.apply(this, arguments);

  // remove strong reference to the audio resource so it can be unloaded
  _PackageManager.getInstance().removeStrongReferenceToResourcePath(this.src, this.__instanceId);
};

/* endregion AUDIO */

/* region LABELS */

cc.LabelTTF.prototype._super_onEnter_fromResources = cc.LabelTTF.prototype.onEnter;
cc.LabelTTF.prototype.onEnter = function () {
  // make a strong reference to the font resource so it doesn't get unloaded too early
  _PackageManager.getInstance().addStrongReferenceToResourcePath(this.getFontName(), this.__instanceId);

  cc.LabelTTF.prototype._super_onEnter_fromResources.call(this);
};

cc.LabelTTF.prototype._super_onExit_fromResources = cc.LabelTTF.prototype.onExit;
cc.LabelTTF.prototype.onExit = function () {
  // remove strong reference to the font resource so it can be unloaded
  _PackageManager.getInstance().removeStrongReferenceToResourcePath(this.getFontName(), this.__instanceId);

  cc.LabelTTF.prototype._super_onExit_fromResources.call(this);
};

cc.LabelTTF.prototype._super_setFontName_fromResources = cc.LabelTTF.prototype.setFontName;
cc.LabelTTF.prototype.setFontName = function () {
  var fontNamePrev = this.getFontName();
  cc.LabelTTF.prototype._super_setFontName_fromResources.apply(this, arguments);

  // when already added to scene
  if (this.isRunning()) {
    if (fontNamePrev != null) {
      // remove strong reference to the font resource so it can be unloaded
      _PackageManager.getInstance().removeStrongReferenceToResourcePath(fontNamePrev, this.__instanceId);
    }

    // make a strong reference to the font resource so it doesn't get unloaded too early
    _PackageManager.getInstance().addStrongReferenceToResourcePath(this.getFontName(), this.__instanceId);
  }
};

/* endregion LABELS */

/* endregion STRONG REFERENCES */

/* endregion COCOS2D */
