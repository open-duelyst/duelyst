var CONFIG = require('app/common/config');
/*

@eanticev: YEAH YEAH i know this is a dumb use of backbone models but it was the quickest way i could prototype

*/
var ZodiacSymbolModel = Backbone.Model.extend({

  timestamp: null,
  juncturePoints: null,
  juncturePointsStart: null,
  juncturePointsDestination: null,
  canvas: null,
  paddingX: null,
  paddingY: null,
  width: null,
  height: null,
  requestAnimationFrameId: null,
  shadowColor: '#a4ffff',
  lineWidth: 1,

  initialize: function (opts) {
    this.timestamp = new Date();
    this.width = opts.width != null ? opts.width : 30.0;
    this.height = opts.height != null ? opts.height : 30.0;
    this.paddingX = opts.paddingX != null ? opts.paddingX : 8.0;
    this.paddingY = opts.paddingY != null ? opts.paddingY : 8.0;
    this.lineWidth = opts.lineWidth != null ? opts.lineWidth : 1;
    this.setCanvas(opts.canvas);
    this.generateStartPoints();
    this.generateDestinationPoints();
  },

  setCanvas: function (canvas) {
    this.stopDrawing();

    this.canvas = canvas;

    var devicePixelRatio = window.devicePixelRatio;
    var width = (this.width + this.paddingX * 2) * CONFIG.globalScale;
    var height = (this.height + this.paddingY * 2) * CONFIG.globalScale;
    var $canvas = $(canvas);
    $canvas.css({
      width: width,
      height: height,
    });
    $canvas.attr('width', Math.ceil(width * devicePixelRatio)).attr('height', Math.ceil(height * devicePixelRatio));

    // fix for HiDPI screens
    var ctx = canvas.getContext('2d');
    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
  },

  startDrawing: function () {
    $(this.canvas).css('opacity', '1');

    if (this.requestAnimationFrameId != null) {
      cancelAnimationFrame(this.requestAnimationFrameId);
    }
    if (this._animateBound == null) {
      this._animateBound = function () {
        this.draw();
        this.requestAnimationFrameId = requestAnimationFrame(this._animateBound);
      }.bind(this);
    }
    this.timestamp = Date.now();
    this._animateBound();
  },

  stopDrawing: function () {
    if (this.requestAnimationFrameId != null) {
      cancelAnimationFrame(this.requestAnimationFrameId);
      this.requestAnimationFrameId = null;
    }

    $(this.canvas).css('opacity', '0.5');
  },

  generateStartPoints: function () {
    this.juncturePointsStart = [];
    this.juncturePoints = [];
    for (var i = 0; i < 6; i++) {
      this.generatePointPosition(this.juncturePoints, i, 5 + Math.random() * 40);
      this.juncturePointsStart.push({
        x: this.juncturePoints[i].x,
        y: this.juncturePoints[i].y,
        z: this.juncturePoints[i].z,
      });
    }
  },

  generateDestinationPoints: function () {
    this.juncturePointsDestination = [];
    for (var i = 0; i < this.juncturePointsStart.length; i++) {
      var p = this.juncturePointsStart[i];
      this.generatePointPosition(this.juncturePointsDestination, i, p.z);
    }
  },

  generatePointPosition: function (array, i, z, attempt) {
    if (attempt == null) { attempt = 0; }
    var scale = CONFIG.globalScale;
    var point = array[i] = {
      x: (this.paddingX + Math.random() * this.width) * scale,
      y: (this.paddingY + Math.random() * this.height) * scale,
      z: z * scale,
    };
    if (attempt < 10) {
      for (var j = i - 1; j >= 0; j--) {
        var otherPoint = array[j];
        var dx = point.x - otherPoint.x;
        var dy = point.y - otherPoint.y;
        if (Math.sqrt(dx * dx + dy * dy) < 8.0) {
          attempt++;
          this.generatePointPosition(array, i, z, attempt);
          break;
        }
      }
    }
  },

  draw: function () {
    if (this.canvas && this.canvas.getContext) {
      var canvas = this.canvas;
      var ctx = canvas.getContext('2d');
      var scale = CONFIG.globalScale;
      var width = parseFloat(canvas.width);
      var height = parseFloat(canvas.height);
      ctx.clearRect(0, 0, width, height);

      if (this.juncturePoints && this.juncturePoints.length > 0) {
        ctx.globalCompositeOperation = 'lighter';

        ctx.lineWidth = this.lineWidth * scale;

        /*
         this.drawCircle(ctx,width/2,height/2,width/2-10,"rgba(0,0,0,0.5)",30);
         ctx.globalCompositeOperation="destination-out";
         this.drawCircle(ctx,width/2,height/2,width/2-10,"rgba(0,0,0,1)",0);

         ctx.globalCompositeOperation="lighter";
         this.drawCircle(ctx,width/2,height/2,width/2-10,"rgba(0,0,0,0.15)","rgba(255,255,255,0.5)",0);
         */

        for (var i = 0; i < this.juncturePoints.length; i++) {
          var p = this.juncturePoints[i];
          var nextPoint = null;
          var j = i + 1;
          if (j == this.juncturePoints.length) {
            nextPoint = this.juncturePoints[0];
          } else {
            nextPoint = this.juncturePoints[j];
          }

          var alpha = Math.random();
          this.drawConnection(ctx, p, nextPoint, nextPoint.z / 40);
        }
        for (var i = 0; i < this.juncturePoints.length; i++) {
          var p = this.juncturePoints[i];
          this.drawJuncture(ctx, p.x, p.y);
        }

        var newTimestamp = Date.now();
        var dt = newTimestamp - this.timestamp;
        this.iterateState(dt);
        this.timestamp = newTimestamp;
      }
    }
  },

  drawCircle: function (ctx, centerX, centerY, radius, fillColorStr, strokeColorStr, blurRadius) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true); // Outer circle

    if (blurRadius != 0) {
      ctx.shadowColor = this.shadowColor;
      ctx.shadowBlur = blurRadius || 15;
    } else {
      ctx.shadowColor = 'rgba(255,255,255,0)';
      ctx.shadowBlur = 0;
    }
    if (fillColorStr) {
      ctx.fillStyle = fillColorStr;
      ctx.fill();
      ctx.fill();
    }
    if (strokeColorStr) {
      ctx.strokeStyle = strokeColorStr;
      ctx.stroke();
    }
  },

  drawLine: function (ctx, startPoint, endPoint, strokeColorStr) {
    ctx.beginPath();
    ctx.strokeStyle = strokeColorStr;
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.shadowColor = this.shadowColor;
    ctx.shadowBlur = 10;
    ctx.stroke();
  },

  drawJuncture: function (ctx, centerX, centerY) {
    this.drawCircle(ctx, centerX, centerY, this.lineWidth + 0.5, 'rgb(255,255,255)');
  },

  drawConnection: function (ctx, p1, p2, alpha) {
    this.drawLine(ctx, p1, p2, 'rgba(255,255,255,' + alpha + ')');
  },

  iterateState: function (dt) {
    if (dt != null && dt > 0) {
      for (var i = 0; i < this.juncturePoints.length; i++) {
        var p = this.juncturePoints[i];
        var dp = this.juncturePointsDestination[i];
        /*
         var trigIn = this.timestamp / (i+1) / 50;
         var cos = Math.cos(trigIn);
         var sin = Math.sin(trigIn);
         p.x += cos;
         p.y += sin;
         */
        var deltaX = (dp.x - p.x) / (dt);
        var deltaY = (dp.y - p.y) / (dt);
        if (Math.abs(deltaX) > 0.05) {
          p.x += deltaX;
          p.y += deltaY;
        } else {
          this.generateDestinationPoints();
        }
      }
    }
  },
});

// Expose the class either via CommonJS or the global object
module.exports = ZodiacSymbolModel;
