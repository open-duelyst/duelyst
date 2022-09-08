// pragma PKGS: motion_streak

const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const _ = require('underscore');

const MotionStreakRingNode = cc.Node.extend({

  _guideNodes: null,
  _radius: 100.0,
  _speed: 900.0,
  _spreadFactor: 2.5,
  _streakCount: 8,
  _streakNodes: null,

  ctor(options) {
    // setup properties that may be required during initialization
    this._streakNodes = [];
    this._guideNodes = [];

    this._super(options);

    this.setOptions(options);

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated/unloaded

      for (let i = 0; i < this._streakCount; i++) {
        const node = new cc.Node();
        const streak = new cc.MotionStreak(0.35, 4, 20, cc.color(255, 255, 255), RSX.motion_streak.img);

        this.addChild(streak);
        this._streakNodes.push(streak);

        this.addChild(node);
        this._guideNodes.push(node);
        node.setOpacity(0);
        streak.setOpacity(0);
        streak.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      }
    });
  },

  setOptions(options) {
    this._super(options);

    if (_.isObject(options)) {
      if (options.radius != null) { this.setRadius(options.radius); }
      if (options.speed != null) { this.setSpeed(options.speed); }
      if (options.spreadFactor != null) { this.setSpreadFactor(options.spreadFactor); }
      if (options.streakCount != null) { this.setStreakCount(options.streakCount); }
    }
  },

  setRadius(val) {
    this._radius = val;
  },
  getRadius() {
    return this._radius;
  },

  setSpeed(val) {
    this._speed = val;
  },
  getSpeed() {
    return this._speed;
  },

  setSpreadFactor(val) {
    this._spreadFactor = val;
  },
  getSpreadFactor() {
    return this._spreadFactor;
  },

  setStreakCount(val) {
    this._streakCount = val;
  },
  getStreakCount() {
    return this._streakCount;
  },

  getRequiredResources() {
    return cc.Node.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier('motion_streak'));
  },

  onEnter() {
    cc.Node.prototype.onEnter.call(this);

    this.scheduleUpdate();
  },

  animate() {
    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated/unloaded

      const p1 = cc.p(-this._radius, 0);
      const p2 = cc.p(0, this._radius);
      const p3 = cc.p(this._radius, 0);
      const p4 = cc.p(0, -this._radius);

      const ringPoints = [p1, p2, p3, p4];

      for (let i = 0; i < this._guideNodes.length; i++) {
        const destinationPoint = ringPoints[i % 4];
        this._startStreak(i, destinationPoint);
      }
    });
  },

  _startStreak(i, destinationPoint) {
    const guide = this._guideNodes[i];
    const streak = this._streakNodes[i];
    const sourcePoint = cc.p(destinationPoint.x, destinationPoint.y);
    const motionPoints = [];

    for (var j = 0; j < 4; j++) {
      const previousPoint = motionPoints[0] || destinationPoint;
      var p = cc.p(0, 0);
      if (previousPoint.x == 0) {
        p.x += destinationPoint.x * 1 / 4 + Math.random() * destinationPoint.x * 3 / 4 || (this._radius - Math.random() * (2 * this._radius));
      } else if (destinationPoint.y == 0) {
        p.y += destinationPoint.y * 1 / 4 + Math.random() * destinationPoint.y * 3 / 4 || (this._radius - Math.random() * (2 * this._radius));
      }
      p.x = this._spreadFactor * Math.round(p.x);
      p.y = this._spreadFactor * Math.round(p.y);
      sourcePoint.x += p.x;
      sourcePoint.y += p.y;
      motionPoints.unshift(p);
    }

    guide.setPosition(sourcePoint);
    streak.setPosition(sourcePoint);
    let sequence = [cc.delayTime(i * 0.1)];

    streak.runAction(cc.sequence(
      cc.delayTime(i * 0.1),
      cc.fadeIn(0.2),
    ));

    for (var j = 0; j < 4; j++) {
      var p = motionPoints[j];
      const distance = Math.abs(p.x) || Math.abs(p.y);
      const duration = distance / this._speed;
      sequence.push(cc.moveBy(duration, cc.p(-p.x, -p.y)));
    }

    const bezierFactor = 0.552284749831;
    const bezierPoints = [
      [
        cc.p(-this._radius, this._radius * bezierFactor),
        cc.p(-this._radius * bezierFactor, this._radius),
        cc.p(0, this._radius),
      ],
      [
        cc.p(this._radius * bezierFactor, this._radius),
        cc.p(this._radius, this._radius * bezierFactor),
        cc.p(this._radius, 0),
      ],
      [
        cc.p(this._radius, -this._radius * bezierFactor),
        cc.p(this._radius * bezierFactor, -this._radius),
        cc.p(0, -this._radius),
      ],
      [
        cc.p(-this._radius * bezierFactor, -this._radius),
        cc.p(-this._radius, -this._radius * bezierFactor),
        cc.p(-this._radius, 0),
      ],
    ];

    const dest1 = bezierPoints[(i + 0) % 4];
    const dest2 = bezierPoints[(i + 1) % 4];
    const dest3 = bezierPoints[(i + 2) % 4];
    const dest4 = bezierPoints[(i + 3) % 4];

    // sequence.push(cc.repeatForever(
    //   cc.sequence(
    //     cc.bezierBy(0.2,dest1),
    //     cc.bezierBy(0.2,dest2),
    //     cc.bezierBy(0.2,dest3),
    //     cc.bezierBy(0.2,dest4)
    //   )
    // ))

    const arcCircumference = Math.PI * this._radius / 2.0;
    const arcDuration = arcCircumference / this._speed;

    sequence = sequence.concat([
      cc.bezierTo(arcDuration, dest1),
      cc.bezierTo(arcDuration, dest2),
      cc.bezierTo(arcDuration, dest3),
      cc.bezierTo(arcDuration, dest4),
    ]);

    guide.runAction(cc.sequence(sequence));
  },

  update(dt) {
    cc.Node.prototype.update.call(this, dt);

    for (let i = 0, il = this._guideNodes.length; i < il; i++) {
      const guide = this._guideNodes[i];
      const streak = this._streakNodes[i];
      streak.setPosition(guide.getPosition());
    }
  },

});

MotionStreakRingNode.create = function (options, node) {
  return node || new MotionStreakRingNode(options);
};

module.exports = MotionStreakRingNode;
