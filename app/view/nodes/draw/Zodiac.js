var ZodiacNode = cc.DrawNode.extend({

	timestamp:null,
	juncturePoints:null,
	juncturePointsStart:null,
	juncturePointsDestination:null,
	paddingX:null,
	paddingY:null,
	_width:null,
	_height:null,
	interval:null,
	lineWidth:0.5,
	duration:0.2,

	/* region INITIALIZATION */

	ctor: function (opts) {
		// do super ctor
		this._super();

		//
		this.timestamp = new Date();

		this.lineWidth = opts.lineWidth || this.lineWidth;
		this.duration = opts.duration || this.duration;
		this.paddingX = 8; //parseFloat(canvas.width)/4;
		this.paddingY = 8; //parseFloat(canvas.height)/4;
		this._width = opts.width - this.paddingX*2; // parseFloat(canvas.width)/2;
		this._height = opts.height - this.paddingY*2; // parseFloat(canvas.width)/2;

		this.generateStartPoints();
		this.generateDestinationPoints();

		// generate circles
		for (var i = 0; i < this.juncturePoints.length; i++) {
			var p = this.juncturePoints[i];
			var dp = this.juncturePointsDestination[i];
			var circle = new cc.DrawNode();
			circle.drawDot(cc.p(0,0), 3, new cc.Color(255,255,255,255));
			this.addChild(circle);
			circle.setPosition(p);
			circle.runAction(cc.EaseExponentialOut.create(cc.moveTo(this.duration,dp)));
		}

		// draw geometry
		// setInterval(this.drawZodiac.bind(this), 50);
		// this.drawZodiac();

		this.scheduleUpdate();
	},

	update: function(dt) {

		if (this.isVisible() && this.isRunning()) {
			// clear prior geometry
			this.clear();

			if (this.juncturePoints && this.juncturePoints.length > 0) {

				for (var i = 0; i < this.juncturePoints.length; i++) {
					var p = this.juncturePoints[i];
					var circleNode = this.getChildren()[i];

					var nextCircleNode = null;
					var nextPoint = null;
					var j = i + 1;

					if (j == this.juncturePoints.length) {
						nextCircleNode = this.getChildren()[0];
						nextPoint = this.juncturePoints[0];
					} else {
						nextCircleNode = this.getChildren()[j];
						nextPoint = this.juncturePoints[j];
					}

					// var alpha = Math.random();
					var alpha = (nextPoint.z / 40) * 255;
					// this.setDrawColor(new cc.Color(255,255,255,50));
					this.drawSegment(circleNode.getPosition(), nextCircleNode.getPosition(), this.lineWidth, new cc.Color(255,255,255,alpha));
				}
			}
		}
	},

	generateStartPoints: function() {
		this.juncturePointsStart = [];
		this.juncturePoints = [];
		for (var i = 0; i < 6; i++) {
			this.juncturePoints.push({
				// x: this.paddingX + Math.random() * this._width,
				// y: this.paddingY + Math.random() * this._height,
				x: this.paddingX + this._width/2,
				y: this.paddingY + this._height/2,
				z: 5 + Math.random() * 40
			});
			this.juncturePointsStart.push({
				x: this.juncturePoints[i].x,
				y: this.juncturePoints[i].y,
				z: this.juncturePoints[i].z
			});
		}
	},

	generateDestinationPoints: function() {
		if (!this.juncturePointsDestination) {
			this.juncturePointsDestination = [];
			for (var i = 0; i < this.juncturePointsStart.length; i++) {
				var p = this.juncturePointsStart[i];
				this.generateDestinationPoint(i,p.z);
			}
		} else {
			for (var i = 0; i < this.juncturePointsStart.length; i++) {
				var p = this.juncturePointsStart[i];
				this.juncturePointsDestination[i].x = p.x + (10 - Math.random() * 20);
				this.juncturePointsDestination[i].y = p.y + (10 - Math.random() * 20);
			}
		}
	},

	generateDestinationPoint: function(i,z) {
		this.juncturePointsDestination[i] = {
			x: this.paddingX + Math.random() * this._width,
			y: this.paddingY + Math.random() * this._height,
			z: z
		};
		for (var j=i-1; j >= 0; j--) {
			if (cc.pDistance(this.juncturePointsDestination[j],this.juncturePointsDestination[i]) < 2.0) {
				this.generateDestinationPoint(i,z);
			}
		}
	},


	// drawCircle: function(ctx, centerX, centerY, radius, fillColorStr, strokeColorStr,blurRadius) {
	// 	ctx.beginPath();
	// 	ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true); // Outer circle

	// 	if (blurRadius != 0) {
	// 		ctx.shadowColor = this.shadowColor;
	// 		ctx.shadowBlur = blurRadius || 15;
	// 	} else {
	// 		ctx.shadowColor = 'rgba(255,255,255,0)';
	// 		ctx.shadowBlur = 0;
	// 	}
	// 	if (fillColorStr) {
	// 		ctx.fillStyle = fillColorStr;
	// 		ctx.fill();
	// 		ctx.fill();
	// 	}
	// 	if (strokeColorStr) {
	// 		ctx.strokeStyle = strokeColorStr;
	// 		ctx.stroke();
	// 	}
	// },

	// drawJuncture: function(ctx, centerX, centerY) {
	// 	this.drawCircle(ctx, centerX, centerY, this.lineWidth + 0.5, "rgb(255,255,255)");
	// },

	iterateState: function(dt) {
		for (var i = 0; i < this.juncturePoints.length; i++) {
			var p = this.juncturePoints[i];
			var dp = this.juncturePointsDestination[i];

			var trigIn = this.timestamp / (i+1) / 50;

			var cos = Math.cos(trigIn);
			var sin = Math.sin(trigIn);
			// p.x += cos;
			// p.y += sin;
			var deltaX = (dp.x - p.x) / 10;
			var deltaY = (dp.y - p.y) / 10;
			if (Math.abs(deltaX) > 0.05) {
				p.x += deltaX;
				p.y += deltaY;
			} else {
				// this.generateDestinationPoints();
			}
		}
	}

});

ZodiacNode.create = function(node) {
	return node || new ZodiacNode();
};


module.exports = ZodiacNode;
