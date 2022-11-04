const Promise = require('bluebird');
const url = require('url');
const querystring = require('query-string');
const _ = require('underscore');
const debug = require('debug')('landing');
const Storage = require('./storage');

// search for any traces of previous login / session to determine if this is a first time user
function isNewUser() {
  const searchKeys = ['token', 'AWSMobileAnalyticsStorage', 'redirected'];
  let itemFound = false;
  for (const key of searchKeys) {
    debug(`found key ${key}: ${Storage.get(key)}`);
    if (Storage.get(key)) {
      itemFound = true;
      break;
    }
  }
  debug(`isNewUser: ${!itemFound}`);
  return !itemFound;
}

// parse the querystring for a newsignup param
function isNewSignup() {
  const params = querystring.parse(window.location.search);
  if (params.newsignup) {
    return true;
  }
  return false;
}

// look at current environment and parse current URL to determine if we should redirect to a landing page
function shouldRedirect() {
  // check environnent
  if (window.isDesktop) {
    debug('no redirect environment');
    return false;
  }
  // check url
  const currentUrl = window.location.pathname;
  if (currentUrl === '/game' || currentUrl === '/register' || currentUrl === '/login') {
    debug('no redirect url');
    return false;
  }
  return true;
}

// redirect to the landing page, URL set via process.env config
function redirect() {
  let redirectUrl = process.env.LANDING_PAGE_URL;
  if (redirectUrl === '') {
    redirectUrl = '/';
  }
  debug(`redirect to ${redirectUrl}`);
  Storage.set('redirected', true);
  return window.location.replace(redirectUrl);
}

// redirect to the game page
function redirectToGame(options) {
  options = options || {};
  let redirectUrl = `${window.location.origin}/game`;
  const allowedReferrerUrls = process.env.REFERRER_PAGE_URLS;
  if (options.isNewSignUp) {
    // check referrer first, we only want to flag ad traffic as 'new' signups from allowed reffers
    // reconstruct the url from parts to safely strip the query parameters
    // https://www.duelyst.com/landing?utm_content=video-browser => https://www.duelyst.com/landing
    const referrer = url.parse(document.referrer);
    const referrerUrlStripped = `${referrer.protocol}//${referrer.host}${referrer.pathname}`;
    if (_.include(allowedReferrerUrls, referrerUrlStripped)) {
      redirectUrl += '?newsignup=true';
    }
  }
  debug(`redirect to ${redirectUrl}`);
  return window.location.replace(redirectUrl);
}

// async add tracking pixel(s) to current page (after registration)
function firePixels() {
  if (window.isDesktop || !process.env.TRACKING_PIXELS_ENABLED) {
    debug('tracking pixels disabled');
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://zulumob.go2cloud.org/SL3v5';
    iframe.scrolling = 'no';
    iframe.frameBorder = 0;
    iframe.width = 1;
    iframe.height = 1;
    iframe.addEventListener('load', () => {
      debug('iframe tracking pixel loaded');
      resolve();
    }, false);
    document.body.appendChild(iframe);
  });
}

// add tracking pixel(s) to document head (on page load)
function addPixelsToHead() {
  if (window.isDesktop || !process.env.TRACKING_PIXELS_ENABLED) {
    debug('tracking pixels disabled');
    return;
  }
  const s1 = createScriptElement();
  s1.innerHTML = `
    var versaTag = {};
    versaTag.id = "7963";
    versaTag.sync = 0;
    versaTag.dispType = "js";
    versaTag.ptcl = "HTTPS";
    versaTag.bsUrl = "bs.serving-sys.com/BurstingPipe";
    versaTag.activityParams = {
        "Session":""
    };
    versaTag.retargetParams = {};
    versaTag.dynamicRetargetParams = {};
    versaTag.conditionalParams = {};
    `;
  const s2 = createScriptElement();
  s2.id = 'ebOneTagUrlId';
  s2.src = 'https://secure-ds.serving-sys.com/SemiCachedScripts/ebOneTag.js';
  s2.onload = () => {
    debug('tracking pixel loaded');
  };
  document.body.insertBefore(s2, document.body.childNodes[0]);
  document.body.insertBefore(s1, document.body.childNodes[0]);
}

function createScriptElement() {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  return script;
}

const landing = {
  isNewUser,
  isNewSignup,
  shouldRedirect,
  redirect,
  redirectToGame,
  firePixels,
  addPixelsToHead,
};
module.exports = landing;
