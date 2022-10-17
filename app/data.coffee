Logger = require 'app/common/logger'
_ = require 'underscore'

DATA = DATA or {}

DATA.FX = require 'app/data/fx'

# init caches
_cache = {}
_filterCache = {}

###
  Finds, caches, and returns data for a string identifier.
  @param {String} identifier data identifier in the format: "LEVEL_1.LEVEL_2.LEVEL_N"
  @returns {*} data if found, else null
###
DATA.dataForIdentifier = (identifier) ->
  if identifier
    # get cached data for identifier
    data = _cache[identifier]

    # find and cache data for identifier
    if !data?
      keys = identifier.split(".")

      data = DATA
      for key in keys
        data = data[key]
        if !data?
          return null

      _cache[identifier] = data

    return data

###
  Finds and returns array of data objects for an array of string identifiers
  @param {String|Array} identifiers string or array of data identifiers
  @returns {Array} array of data if found, else empty array
  @see DATA.dataForIdentifier
###
DATA.dataForIdentifiers = (identifiers) ->
  data = []

  if identifiers
    if !_.isArray(identifiers) then identifiers = [identifiers]
    for identifier in identifiers
      datum = DATA.dataForIdentifier(identifier)
      if datum? then data = data.concat(datum)

  return data

###
  Finds and returns array of data objects for an array of string identifiers and an array of filter keys
  @param {String|Array} identifiers string or array of string identifiers that map to data
  @param {String|Array} filterKey keys to filter for only data that matches identifier + key
  @param {Object} [foundFilterKeys] filter keys that have already been found where foundFilterKeys[key] = true, usually internal
  @returns {Array} array of data if found, else empty array
  @see DATA.dataForIdentifier
###
DATA.dataForIdentifiersWithFilter = (identifiers, filterKeys, foundFilterKeys={}) ->
  data = []

  if identifiers and filterKeys
    # enforce arrays
    if !_.isArray(identifiers) then identifiers = [identifiers]
    if !_.isArray(filterKeys) then filterKeys = [filterKeys]
    if identifiers.length > 0 and filterKeys.length > 0
      # find data for each identifier and filter
      # work from end of identifiers backwards
      # until we've found data for each filter once
      for identifier in identifiers by -1
        lastDotIndex = lastKey = null
        for filterKey in filterKeys
          # only find filter key once
          if !foundFilterKeys[filterKey]
            filteredIdentifier = identifier + "." + filterKey

            # always try to use cache
            datum = _filterCache[filteredIdentifier]

            # find and cache
            if !datum?
              lastDotIndex ?= identifier.lastIndexOf(".")
              lastKey ?= (if lastDotIndex != -1 then identifier.slice(lastDotIndex + 1) else identifier)
              datum = _filterCache[filteredIdentifier] = DATA.dataForIdentifier((if lastKey != filterKey then filteredIdentifier else identifier))

            if datum?
              foundFilterKeys[filterKey] = true
              data = data.concat(datum)

  return data

###
  Finds and returns array of data objects for an array of string identifiers and filter keys. Alternative to DATA.dataForIdentifiersWithFilter
  @param {Object|Array} identifiers object or array of objects where {identifiers: {String|Array}, filterKeys: {String|Array}}
  @param {String} [identifierKey="identifiers"] string name of key in each object that maps to identifiers
  @param {String} [filterKeysKey="filterKeys"] string name of key in each object that maps to filterKeys
  @returns {Array} array of data if found, else empty array
  @see DATA.dataForIdentifiersWithFilter
###
DATA.dataForMappedIdentifiersWithFilter = (filterKeyedIdentifiers, identifierKey="identifiers", filterKeysKey="filterKeys") ->
  data = []
  if filterKeyedIdentifiers
    foundFilterKeys = {}

    # enforce arrays
    if !_.isArray(filterKeyedIdentifiers) then filterKeyedIdentifiers = [filterKeyedIdentifiers]

    for map in filterKeyedIdentifiers
      data = data.concat(DATA.dataForIdentifiersWithFilter(map[identifierKey], map[filterKeysKey], foundFilterKeys))

  return data

###
  Returns array of string identifiers from a base array of identifiers merged with filter keys
  @param {String|Array} identifiers string or array of data identifiers
  @param {String|Array} filterKeys string or array of filter keys
  @returns {Array} array of filter keyed identifiers
###
DATA.getFilterKeyedIdentifiers = (identifiers, filterKeys) ->
  filterKeyedIdentifiers = []
  if identifiers and filterKeys
    # enforce arrays
    if !_.isArray(identifiers) then identifiers = [identifiers]
    if !_.isArray(filterKeys) then filterKeys = [filterKeys]

    # for each identifier and filterKey, merge into a single identifier
    if identifiers.length > 0 and filterKeys.length > 0
      for identifier in identifiers by -1
        lastDotIndex = identifier.lastIndexOf(".")
        lastKey = (if lastDotIndex != -1 then identifier.slice(lastDotIndex + 1) else identifier)
        for filterKey in filterKeys
          filterKeyedIdentifier = identifier
          if lastKey != filterKey then filterKeyedIdentifier += "." + filterKey
          filterKeyedIdentifiers.push(filterKeyedIdentifier)

  return filterKeyedIdentifiers

###
  Releases and resets search caches.
###
DATA.releaseCaches = () ->
  _cache = {}
  _filterCache = {}

module.exports = DATA
