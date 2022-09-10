/** **************************************************************************
  UtilsEnv - environment utility methods
 - NOTE: these methods are configured at compile time by browserify
 *************************************************************************** */
const UtilsEnv = {};

/**
 * Return whether the current environment is in staging (i.e. development but not local).
 * @return {Boolean}
 */
UtilsEnv.getIsInStaging = function () {
  return process.env.NODE_ENV === 'staging';
};

/**
 * Return whether the current environment is in local environment.
 * @return {Boolean}
 */
UtilsEnv.getIsInLocal = function () {
  const env = process.env.NODE_ENV;
  return !UtilsEnv.getIsInProduction() && (env.indexOf('dev') >= 0 || env === 'local');
};

/**
 * Return whether the current environment is in production.
 * @return {Boolean}
 */
UtilsEnv.getIsInProduction = function () {
  const env = process.env.NODE_ENV;
  return env === 'production' || UtilsEnv.getIsInStaging();
};

/**
 * Return whether the current environment is in development, whether local or remote.
 * @return {Boolean}
 */
UtilsEnv.getIsInDevelopment = function () {
  return UtilsEnv.getIsInStaging() || UtilsEnv.getIsInLocal();
};

module.exports = UtilsEnv;
