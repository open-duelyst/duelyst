//pragma PKGS: game
var CONFIG = require('app/common/config');
var UtilsEngine = require('app/common/utils/utils_engine');
var PlayerLayer = require('./PlayerLayer');

/****************************************************************************
 Player2Layer
 ****************************************************************************/

var Player2Layer = PlayerLayer.extend({

	/* region INITIALIZE */

	ctor: function (playerId) {
		this._super(playerId);

		// artifacts should show durability on left
		for (var i = 0, il = this._artifactNodes.length; i < il; i++) {
			var artifactNode = this._artifactNodes[i];
			artifactNode.setDurabilityOnLeft(true);
		}
	},

	/* endregion INITIALIZE */

	/* region LAYOUT */

	_updateArtifactNodesLayout: function () {
		this._super();

		// reposition artifact nodes
		var player2ArtifactsPositions = UtilsEngine.getPlayer2ArtifactsPositions();
		for (var i = 0, il = this._artifactNodes.length; i < il; i++) {
			this._artifactNodes[i].setPosition(player2ArtifactsPositions[i]);
		}
	},

	_updateSignatureCardNodeLayout: function () {
		this._signatureCardNode.setPosition(UtilsEngine.getPlayer2SignatureCardPosition());
	}

	/* endregion LAYOUT */

});

Player2Layer.create = function(playerId, layer) {
	return PlayerLayer.create(playerId, layer || new Player2Layer(playerId));
};


module.exports = Player2Layer;
