// pragma PKGS: game
const CONFIG = require('app/common/config');
const UtilsEngine = require('app/common/utils/utils_engine');
const PlayerLayer = require('./PlayerLayer');

/** **************************************************************************
 Player1Layer
 *************************************************************************** */

const Player1Layer = PlayerLayer.extend({

  /* region LAYOUT */

  _updateArtifactNodesLayout() {
    this._super();

    // reposition artifact nodes
    const player1ArtifactsPositions = UtilsEngine.getPlayer1ArtifactsPositions();
    for (let i = 0, il = this._artifactNodes.length; i < il; i++) {
      this._artifactNodes[i].setPosition(player1ArtifactsPositions[i]);
    }
  },

  _updateSignatureCardNodeLayout() {
    // signature card node
    this._signatureCardNode.setPosition(UtilsEngine.getPlayer1SignatureCardPosition());
  },

  /* endregion LAYOUT */

});

Player1Layer.create = function (playerId, layer) {
  return PlayerLayer.create(playerId, layer || new Player1Layer(playerId));
};

module.exports = Player1Layer;
