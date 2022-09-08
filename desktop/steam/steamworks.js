let steamworks = {};

if (process.platform === 'darwin') {
  steamworks = require('./greenworks-osx64.node');
} else if (process.platform === 'win32') {
  if (process.arch === 'x64') {
    steamworks = require('./greenworks-win64.node');
  } else if (process.arch === 'ia32') {
    steamworks = require('./greenworks-win32.node');
  }
}

// event handler for steam events is required
steamworks._steam_events.on = function (...args) {
};

process.versions.steamworks = steamworks._version;
module.exports = steamworks;
