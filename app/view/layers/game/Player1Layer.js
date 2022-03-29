//pragma PKGS: game
var CONFIG = require('app/common/config');
var UtilsEngine = require('app/common/utils/utils_engine');
var PlayerLayer = require('./PlayerLayer');

/****************************************************************************
 Player1Layer
 ****************************************************************************/

var Player1Layer = PlayerLayer.extend({

	/* region LAYOUT */

	_updateArtifactNodesLayout: function () {
		this._super();

		// reposition artifact nodes
		var player1ArtifactsPositions = UtilsEngine.getPlayer1ArtifactsPositions();
		for (var i = 0, il = this._artifactNodes.length; i < il; i++) {
			this._artifactNodes[i].setPosition(player1ArtifactsPositions[i]);
		}
	},

	_updateSignatureCardNodeLayout: function () {
		// signature card node
		this._signatureCardNode.setPosition(UtilsEngine.getPlayer1SignatureCardPosition());
	}

	/* endregion LAYOUT */

});

Player1Layer.create = function(playerId, layer) {
	return PlayerLayer.create(playerId, layer || new Player1Layer(playerId));
};


module.exports = Player1Layer;
