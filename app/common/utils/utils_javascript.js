/** **************************************************************************
  UtilsJavascript - javascript utility methods
 *************************************************************************** */
const UtilsJavascript = {};
module.exports = UtilsJavascript;
const _ = require('underscore');
const i18next = require('i18next');

UtilsJavascript.defaultToValue = function (optionalValue, defaultValue) {
  return (typeof optionalValue === 'undefined') ? defaultValue : optionalValue;
};

let incrementalId = 0;
/**
 * Returns a unique incrementing integer id.
 * @returns {Number}
 */
UtilsJavascript.generateIncrementalId = function () {
  return incrementalId++;
};

/**
 * Escapes a string for regex search.
 * @param str
 * @returns {String}
 */
UtilsJavascript.escapeStringForRegexSearch = function (str) {
  return str ? str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') : '';
};

/**
 * Shallow copies the properties from a source object into a target object.
 * @param {Object} target
 * @param {Object} source
 * @returns {Object}
 */
UtilsJavascript.fastExtend = function (target, source) {
  if (target != null && source != null) {
    const keys = Object.keys(source);
    for (let i = 0, il = keys.length; i < il; i++) {
      const key = keys[i];
      target[key] = source[key];
    }
  }
  return target;
};

/**
 * Serializes an object similar to JSON.stringify.
 * @param {Object} input
 * @returns {String}
 */
UtilsJavascript.serializeObject = function (input) {
  const keys = Object.keys(input);
  const il = keys.length;
  if (il === 0) {
    return '{}';
  } if (il === 1) {
    const key = keys[0];
    const value = input[key];
    const type = typeof value;
    if (type === 'object') {
      if (value === null) {
        return `{"${key}":null}`;
      } if (Array.isArray(value)) {
        return `{"${key}":${UtilsJavascript.serializeArray(value)}}`;
      }
      return `{"${key}":${UtilsJavascript.serializeObject(value)}}`;
    } if (type === 'string') {
      return `{"${key}":"${value}"}`;
    } if (type === 'undefined') {
      return `{"${key}":null}`;
    }
    return `{"${key}":${value}}`;
  }
  let output = '{';
  const cl = il - 1;
  for (let i = 0; i < il; i++) {
    const key = keys[i];
    const value = input[key];
    const type = typeof value;
    if (type === 'object') {
      if (value === null) {
        output += `"${key}":null`;
      } else if (Array.isArray(value)) {
        output += `"${key}":${UtilsJavascript.serializeArray(value)}`;
      } else {
        output += `"${key}":${UtilsJavascript.serializeObject(value)}`;
      }
    } else if (type === 'string') {
      output += `"${key}":"${value}"`;
    } else if (type === 'undefined') {
      output += `"${key}":null`;
    } else {
      output += `"${key}":${value}`;
    }
    if (i < cl) {
      output += ',';
    }
  }
  return `${output}}`;
};

/**
 * Serializes an array similar to JSON.stringify.
 * @param {Array} input
 * @returns {String}
 */
UtilsJavascript.serializeArray = function (input) {
  const il = input.length;
  if (il === 0) {
    return '[]';
  } if (il === 1) {
    const value = input[0];
    const type = typeof value;
    if (type === 'object') {
      if (value === null) {
        return '[null]';
      } if (Array.isArray(value)) {
        return `[${UtilsJavascript.serializeArray(value)}]`;
      }
      return `[${UtilsJavascript.serializeObject(value)}]`;
    } if (type === 'string') {
      return `["${value}"]`;
    } if (type === 'undefined') {
      return '[null]';
    }
    return `[${value}]`;
  }
  let output = '[';
  const cl = il - 1;
  for (let i = 0; i < il; i++) {
    const value = input[i];
    const type = typeof value;
    if (type === 'object') {
      if (value === null) {
        output += 'null';
      } else if (Array.isArray(value)) {
        output += UtilsJavascript.serializeArray(value);
      } else {
        output += UtilsJavascript.serializeObject(value);
      }
    } else if (type === 'string') {
      output += `"${value}"`;
    } else if (type === 'undefined') {
      output += 'null';
    } else {
      output += value;
    }
    if (i < cl) {
      output += ',';
    }
  }
  return `${output}]`;
};

/**
 * Makes a deep copy of an object, ignoring functions and properties that match the prototype.
 * @param {Object|Array} source
 * @param {Function} [filter=null] filter method that receives key and property and should return true or false
 * @param {Function} [post=null] post copy method that receives the current value being copied and the current destination object to copy into
 * @returns {Object|Array}
 */
UtilsJavascript.deepCopy = function (source, filter, post) {
  const copy = _.isArray(source) ? [] : {};

  const walk = function (value, dst, visited, reference) {
    if (_.isObject(value) && !_.isFunction(value)) {
      const proto = Object.getPrototypeOf(value);
      const keys = Object.keys(value);
      for (let i = 0, il = keys.length; i < il; i++) {
        const key = keys[i];
        const property = value[key];
        if (!_.isFunction(property) && proto[key] !== property && (filter == null || filter(key, property))) {
          const index = _.indexOf(visited, property);
          if (index !== -1) {
            dst[key] = reference[index];
          } else {
            let next;
            if (_.isArray(property)) {
              next = dst[key] = [];
            } else if (_.isObject(property)) {
              next = dst[key] = {};
            } else {
              next = dst[key] = property;
            }
            visited.push(property);
            reference.push(next);
            if (_.isObject(property)) {
              walk(property, next, visited, reference);
            }
          }
        }
      }

      if (post != null) {
        post(value, dst);
      }
    }
  };
  walk(source, copy, [source], [copy]);

  return copy;
};

/**
 * Add a value to an array if it does not already exist in array.
 * @param {Array} array Array to search
 * @param {*} value value to match
 * @returns {Number} -1 if added, >= 0 if not
 * */
UtilsJavascript.arrayCautiousAdd = function (array, value) {
  const index = _.indexOf(array, value);
  if (index === -1) {
    array.push(value);
  }
  return index;
};

/**
 * Remove a value from an array if it does exist in array.
 * @param {Array} array Array to search
 * @param {*} value value to match
 * @returns {Number} >= 0 if removed, -1 if not
 * */
UtilsJavascript.arrayCautiousRemove = function (array, value) {
  const index = _.indexOf(array, value);
  if (index !== -1) {
    array.splice(index, 1);
  }
  return index;
};

/**
 * Add a value to a sorted array from largest to smallest.
 * NOTE: modifies the array in place!
 * @param {Array} array Array to add to
 * @param {*} value value to insert
 * @returns {Number} index where value was inserted
 * */
UtilsJavascript.arraySortedInsert = function (array, value) {
  if (array.length === 0 || value >= array[0]) {
    array.unshift(value);
    return 0;
  }
  for (let i = array.length - 1; i >= 1; i--) {
    if (value <= array[i]) {
      array.splice(i + 1, 0, value);
      return i + 1;
    }
  }
  // add to end
  array.push(value);
  return array.length - 1;
};

/**
 * Add an object to a sorted array based on a property value from largest to smallest.
 * NOTE: modifies the array in place!
 * @param {Array} array Array to add to
 * @param {Object} obj object to insert
 * @param {String} key key for property value to sort by
 * @returns {Number} index where object was inserted
 * */
UtilsJavascript.arraySortedInsertByProperty = function (array, obj, key) {
  const value = obj[key];
  if (array.length === 0 || value >= array[0][key]) {
    array.unshift(obj);
    return 0;
  }
  for (let i = array.length - 1; i >= 1; i--) {
    if (value <= array[i][key]) {
      array.splice(i + 1, 0, obj);
      return i + 1;
    }
  }
  // add to end
  array.push(obj);
  return array.length - 1;
};

/**
 * Add an object to a sorted array based on a comparator function return value from largest to smallest.
 * NOTE: modifies the array in place!
 * @param {Array} array Array to add to
 * @param {Object} obj object to insert
 * @param {Function} comparator comparator function returning a value to sort by, where <= 0 will insert element
 * @returns {Number} index where object was inserted
 * */
UtilsJavascript.arraySortedInsertByComparator = function (array, obj, comparator) {
  if (array.length === 0 || comparator(obj, array[0]) >= 0) {
    array.unshift(obj);
    return 0;
  }
  for (let i = array.length - 1; i >= 1; i--) {
    if (comparator(obj, array[i]) <= 0) {
      array.splice(i + 1, 0, obj);
      return i + 1;
    }
  }
  // add to end
  array.push(obj);
  return array.length - 1;
};

/**
 * Add an object to a sorted array based on a comparator function return value from smallest to largest.
 * NOTE: modifies the array in place!
 * @param {Array} array Array to add to
 * @param {Object} obj object to insert
 * @param {Function} comparator comparator function returning a value to sort by, where >= 0 will insert element
 * @returns {Number} index where object was inserted
 * */
UtilsJavascript.arraySortedInsertAscendingByComparator = function (array, obj, comparator) {
  if (array.length === 0 || comparator(obj, array[0]) <= 0) {
    array.unshift(obj);
    return 0;
  }
  for (let i = 1, il = array.length; i < il; i++) {
    if (comparator(obj, array[i]) <= 0) {
      array.splice(i, 0, obj);
      return i;
    }
  }
  // add to end
  array.push(obj);
  return array.length - 1;
};

/**
 * Add an object to a sorted array based on a scoring function return value from largest to smallest.
 * NOTE: modifies the array in place!
 * @param {Array} array Array to add to
 * @param {Object} obj object to insert
 * @param {Function} scoringMethod scoring function returning a value when given a single object
 * @returns {Number} index where object was inserted
 * */
UtilsJavascript.arraySortedInsertByScore = function (array, obj, scoringMethod) {
  if (array.length === 0 || scoringMethod(obj) >= scoringMethod(array[0])) {
    array.unshift(obj);
    return 0;
  }
  for (let i = array.length - 1; i >= 1; i--) {
    if (scoringMethod(obj) >= scoringMethod(array[i])) {
      array.splice(i + 1, 0, obj);
      return i + 1;
    }
  }
  // add to end
  array.push(obj);
  return array.length - 1;
};

/**
 * Add an object to a sorted array based on a scoring function return value from smallest to largest.
 * NOTE: modifies the array in place!
 * @param {Array} array Array to add to
 * @param {Object} obj object to insert
 * @param {Function} scoringMethod scoring function returning a value when given a single object
 * @returns {Number} index where object was inserted
 * */
UtilsJavascript.arraySortedInsertAscendingByScore = function (array, obj, scoringMethod) {
  if (array.length === 0 || scoringMethod(obj) <= scoringMethod(array[0])) {
    array.unshift(obj);
    return 0;
  }
  for (let i = 1, il = array.length; i < il; i++) {
    if (scoringMethod(obj) <= scoringMethod(array[i])) {
      array.splice(i, 0, obj);
      return i;
    }
  }
  // add to end
  array.push(obj);
  return array.length - 1;
};

// Creates a representation of an amount of time given hours, minutes, seconds, leaving off 0 values
// Returns "Now" if all params are 0
// TODO: replace stringifiers.coffee with stringifiers.js, put this method there, and place it in common directory
UtilsJavascript.stringifyHoursMinutesSeconds = function (hours, minutes, seconds) {
  let retString = '';
  if (hours) {
    retString += `${hours} ${i18next.t('common.time_hour', { count: hours })}`;
  }
  if (minutes) {
    if (retString !== '') {
      retString += ' ';
    }
    retString += `${minutes} ${i18next.t('common.time_minute', { count: minutes })}`;
  }
  if (seconds) {
    if (retString !== '') {
      retString += ' ';
    }
    retString += `${seconds} ${i18next.t('common.time_second', { count: seconds })}`;
  }
  if (retString === '') {
    retString = '...';
  }

  return retString;
};
