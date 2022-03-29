//pragma PKGS: gauntlet
var RSX = require('app/data/resources');
var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var SDK = require('app/sdk');

/****************************************************************************
DeckHistogramNode
shows histogram for an array of SDK cards
 ****************************************************************************/

var DeckHistogramNode = cc.Node.extend({

	barWidth:14,
	barUnitHeight:5,
	maxBarScale:20,
	_columnNodes:null,

	/* region INITIALIZATION */

	ctor: function (manaCounts) {

        cc.Node.prototype.ctor.call(this);

		var horizontalLineNode = new cc.DrawNode();
		horizontalLineNode.setAnchorPoint(0,0);
		horizontalLineNode.drawSegment(cc.p(0,0), cc.p(270 + this.barWidth,0), 1.0, new cc.Color(255,255,255,100));
		this.addChild(horizontalLineNode);

		this._columnNodes = [];

		for (var i=0; i<10; i++) {
			var columnLabel = new cc.LabelTTF(i.toString(), RSX.font_light.name, 14, cc.size(this.barWidth,30), cc.TEXT_ALIGNMENT_CENTER);

			columnLabel.setAnchorPoint(0,1);
			columnLabel.setPosition(i*30,-5);
			this.addChild(columnLabel);

			var columnBar = new cc.DrawNode();
			columnBar.setAnchorPoint(0,0);
			columnBar.setPosition(i*30,5);
			columnBar.drawRect(cc.p(0,0),cc.p(this.barWidth,this.barUnitHeight),cc.color(100,200,255),0,cc.color(0,0,0,0));
			columnBar.setScaleY(0);
			this.addChild(columnBar);

			this._columnNodes.push(columnBar);
		}

	},

	bindManaCounts: function(manaCounts) {
		// reset scales to 0
		_.each(this._columnNodes,function(node) {
			node.setScaleY(0);
		});
		// set mana counts
		_.each(manaCounts,function(v,k){
			this._columnNodes[k].setScaleY(v);
		}.bind(this));
	},

	addItem: function(cost,newCount) {
		if (newCount < this.maxBarScale)
			this._columnNodes[cost].setScaleY(newCount);
	}

});

DeckHistogramNode.create = function(sdkCard, node) {
	return node || new DeckHistogramNode(sdkCard);
};


module.exports = DeckHistogramNode;
