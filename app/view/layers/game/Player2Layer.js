// pragma PKGS: game
const CONFIG = require('app/common/config');
const UtilsEngine = require('app/common/utils/utils_engine');
const PlayerLayer = require('./PlayerLayer');

/** **************************************************************************
 Player2Layer
 *************************************************************************** */

const Player2Layer = PlayerLayer.extend({

  /* region INITIALIZE */

  ctor(playerId) {
    this._super(playerId);

    // artifacts should show durability on left
    for (let i = 0, il = this._artifactNodes.length; i < il; i++) {
      const artifactNode = this._artifactNodes[i];
      artifactNode.setDurabilityOnLeft(true);
    }
  },

  /* endregion INITIALIZE */

  /* region LAYOUT */

  _updateArtifactNodesLayout() {
    this._super();

    // reposition artifact nodes
    const player2ArtifactsPositions = UtilsEngine.getPlayer2ArtifactsPositions();
    for (let i = 0, il = this._artifactNodes.length; i < il; i++) {
      this._artifactNodes[i].setPosition(player2ArtifactsPositions[i]);
    }
  },

  _updateSignatureCardNodeLayout() {
    this._signatureCardNode.setPosition(UtilsEngine.getPlayer2SignatureCardPosition());
  },

  /* endregion LAYOUT */

});

Player2Layer.create = function (playerId, layer) {
  return PlayerLayer.create(playerId, layer || new Player2Layer(playerId));
};

module.exports = Player2Layer;
