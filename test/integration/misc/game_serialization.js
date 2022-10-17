const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../'));
require('coffeescript/register');
const { expect } = require('chai');
const util = require('util');
const SDK = require('../../../app/sdk.coffee');

describe('game serialization', () => {
  describe('action serialization', () => {
    describe('actions with subactions', () => {
      it('expect a deep copy with sub-actions when serialized', (done) => {
        function replacer(key, value) {
          if (key[0] === '_') return undefined;
          return value;
        }

        const action = SDK.GameSession.current().actionEndTurn();
        const startTurnAction = SDK.GameSession.current().createActionForType(SDK.StartTurnAction.type);
        startTurnAction.ownerId = SDK.GameSession.current().getNonCurrentPlayerId();
        action.addSubAction(startTurnAction);

        const json = JSON.stringify(action, replacer);
        expect(json).to.exist;
        // Logger.module("UNITTEST").log(json);

        const json3 = SDK.GameSession.current().serializeToJSON(action);
        expect(json3).to.exist;
        // Logger.module("UNITTEST").log(json3);

        expect(json3).to.equal(json);

        done();
      });
    });
  });
});
