const Logger = require('./logger.coffee');
const EventBus = require('./eventbus');
const EVENTS = require('./event_types');

window.ipcRenderer.on('discord', (event, type, ...args) => {
  switch (type) {
  case 'ready':
    discordOnReady(...args);
    break;
  case 'disconnected':
    discordOnDisconnected(...args);
    break;
  case 'error':
    discordOnError(...args);
    break;
  case 'spectateGame':
    discordOnSpectateGame(...args);
    break;
  case 'joinGame':
    discordOnJoinGame(...args);
    break;
  case 'tick':
    discordOnTick(...args);
    break;
  default:
    break;
  }
});

function discordOnReady(...args) {
  Logger.module('DISCORD').log('discordOnReady');
}
function discordOnDisconnected(...args) {
  Logger.module('DISCORD').log('discordOnDisconnected');
}
function discordOnError(...args) {
  Logger.module('DISCORD').log('discordOnError');
}
function discordOnSpectateGame(...args) {
  Logger.module('DISCORD').log('discordOnSpectateGame');
  EventBus.getInstance().trigger(EVENTS.discord_spectate, ...args);
}
function discordOnJoinGame(...args) {
  Logger.module('DISCORD').log('discordOnJoingame');
}
function discordOnTick(...args) {
  Logger.module('DISCORD').log('discordOnTick');
}
function discordUpdatePresence(presence) {
  window.ipcRenderer.send('discord-update-presence', presence);
}

module.exports = { updatePresence: discordUpdatePresence };
