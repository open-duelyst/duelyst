const Promise = require('bluebird');
const promiseThrottle = require('p-throttle');
const promiseWhilst = require('p-whilst');
const { ChromaApp, Color, Keyboard } = require('../../packages/chroma-js');

const App = new ChromaApp('Duelyst', 'The ULTIMATE collectible tactics game', 'Duelyst');

function sleep(timeMs) {
  return new Promise((resolve) => setTimeout(resolve, timeMs));
}

function flashTurnTimer(timePct, color) {
  return new Promise((resolve) => {
    const startColumn = Math.ceil((Keyboard.Columns - (timePct * Keyboard.Columns)));
    const endColumn = Keyboard.Columns;

    App.Instance().then((Instance) => {
      for (let c = startColumn; c < endColumn; ++c) {
        Instance.Keyboard.setCol(c, color);
      }
      for (let c = 0; c < startColumn; ++c) {
        Instance.Keyboard.setCol(c, Color.White);
      }
      return Instance.send()
        .then(() => {
          resolve();
        });
    }).catch((e) => {});
  });
}

// 50ms is general minimum to be properly visible
function flashAction(color, delay, times) {
  let count = 0;
  return promiseWhilst(() => count < times, () => {
    count++;
    return new Promise((resolve) => {
      App.Instance().then((Instance) => {
        Instance.setAll(color);
        Instance.send()
          .then(() => sleep(delay))
          .then(() => {
            Instance.setNone();
            resolve(Instance.send());
          });
      });
    });
  }).catch((e) => {});
}

function flashActionThrottled(color, delay, times) {
  return promiseThrottle(() => flashAction(color, delay, times), 1, delay * times)();
}

function setAll(color) {
  return new Promise((resolve) => {
    App.Instance().then((Instance) => {
      Instance.setAll(color);
      resolve(Instance.send());
    }).catch((e) => {});
  });
}

module.exports = {
  Color,
  setAll,
  flashTurnTimer,
  flashAction,
  flashActionThrottled,
};
