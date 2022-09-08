const CONFIG = require('app/common/config');
const UtilsEngine = require('app/common/utils/utils_engine');
const UtilsPosition = require('app/common/utils/utils_position');
const NodeFactory = require('app/view/helpers/NodeFactory');
const FXSprite = require('./FXSprite');
const FXProjectileSprite = require('./FXProjectileSprite');

/** **************************************************************************
 FXFlockSprite
 var FXFlockSprite = FXProjectileSprite
 FXFlockSprite.create()
 *************************************************************************** */
const FXFlockSprite = FXProjectileSprite.extend({
  usesSubPixelPosition: true,
  // exact duration to reach target
  // when === 0.0, the flock will random walk and NEVER reach a destination
  moveDuration: 1.0,
  // number of boids in flock
  numBoids: 1,
  // fx options for boids
  boidFX: null,
  // all boids in flock, usually created automatically
  boids: null,
  // all obstacles
  obstacles: null,
  // max/min velocity
  speed: CONFIG.TILESIZE,
  // whether sprite should always rotate to face forward (no need for spheres)
  faceForward: true,
  // whether sprite should stop at target on impact
  stopAtTarget: false,
  // max/min velocity change
  // higher values are better for things such as flies (no clear facing direction)
  // lower values are best for things such as snakes (easy to see where it is facing)
  steeringSpeed: 0.02,
  // distance to try to keep from other flocking sprites
  // note: this is distance from center to center, ignoring sprite bounding size
  flockSpread: CONFIG.TILESIZE * 0.25,
  // max distance from center of flock
  flockRadius: CONFIG.TILESIZE * 0.5,
  // distance to try to keep from obstacles
  // note: this is distance from center to center, ignoring sprite bounding size
  obstacleSpread: CONFIG.TILESIZE,
  // alignment weight
  // higher values keep flock facing same direction
  alignmentWeight: 0.1,
  // separation weight between flockmates
  // higher values force dodging flock
  flockSeparationWeight: 0.5,
  // separation weight from obstacles
  // higher values force dodging obstacles
  obstacleSeparationWeight: 0.85,
  // cohesion weight
  // higher values keep flock together
  cohesionWeight: 0.1,
  // how close to the center boids should end up
  // i.e. higher values will force boids to target center and clump at end
  centerWeight: 1.0,
  // amount of randomization in start position and direction
  // lower values cause a burst effect
  randomWeight: 0.15,
  // random range, as a xy vector, from the source position to fly within when random walking
  randomRange: null,
  // velocity and target velocity when random walking
  velocity: null,
  targetVelocity: null,
  // whether flock should act as if in a parallax node
  parallaxMode: false,

  _lastPosition: null,
  _centerWeight: 0.0,
  _offsetWeight: 0.0,
  _utilPoint1: null,
  _utilPoint2: null,
  _utilPoint3: null,
  _utilPoint4: null,

  ctor(options) {
    // initialize properties that may be required in init
    this.boids = [];
    this.obstacles = [];
    this.velocity = cc.p();
    this.targetVelocity = cc.p();
    this.randomRange = cc.p();
    this._lastPosition = cc.p();
    this._utilPoint1 = cc.p();
    this._utilPoint2 = cc.p();
    this._utilPoint3 = cc.p();
    this._utilPoint4 = cc.p();

    // do super ctor
    this._super(options);
  },

  setOptions(options) {
    this._super(options);
    if (options.numBoids != null) this.setNumBoids(options.numBoids);
    if (options.boidFX != null) this.setBoidFX(options.boidFX);
    if (options.boids != null) this.setBoids(options.boids);
    if (options.speed != null) this.setSpeed(options.speed);
    if (options.minSpeed != null) this.setMinSpeed(options.minSpeed);
    if (options.steeringSpeed != null) this.setSteeringSpeed(options.steeringSpeed);
    if (options.faceForward != null) this.setFaceForward(options.faceForward);
    if (options.stopAtTarget != null) this.setStopAtTarget(options.stopAtTarget);
    if (options.flockSpread != null) this.setFlockSpread(options.flockSpread);
    if (options.flockRadius != null) this.setFlockRadius(options.flockRadius);
    if (options.obstacleSpread != null) this.setObstacleSpread(options.obstacleSpread);
    if (options.alignmentWeight != null) this.setAlignmentWeight(options.alignmentWeight);
    if (options.flockSeparationWeight != null) this.setFlockSeparationWeight(options.flockSeparationWeight);
    if (options.obstacleSeparationWeight != null) this.setObstacleSeparationWeight(options.obstacleSeparationWeight);
    if (options.cohesionWeight != null) this.setCohesionWeight(options.cohesionWeight);
    if (options.centerWeight != null) this.setCenterWeight(options.centerWeight);
    if (options.randomWeight != null) this.setRandomWeight(options.randomWeight);
    if (options.randomRange != null) this.setRandomRange(options.randomRange);
    if (options.parallaxMode != null) { this.setParallaxMode(options.parallaxMode); }
  },

  // properties

  setNumBoids(numBoids) {
    this.numBoids = numBoids;
  },
  setBoidFX(boidFX) {
    this.boidFX = boidFX;
  },
  setBoids(boids) {
    this.boids = boids;
  },
  setSpeed(speed) {
    this.speed = speed;
  },
  setMinSpeed(minSpeed) {
    this.minSpeed = minSpeed;
  },
  setSteeringSpeed(steeringSpeed) {
    this.steeringSpeed = steeringSpeed;
  },
  setFaceForward(faceForward) {
    this.faceForward = faceForward;
  },
  setStopAtTarget(stopAtTarget) {
    this.stopAtTarget = stopAtTarget;
  },
  setFlockSpread(flockSpread) {
    this.flockSpread = flockSpread;
  },
  setFlockRadius(flockRadius) {
    this.flockRadius = flockRadius;
  },
  setObstacleSpread(obstacleSpread) {
    this.obstacleSpread = obstacleSpread;
  },
  setAlignmentWeight(alignmentWeight) {
    this.alignmentWeight = alignmentWeight;
  },
  setFlockSeparationWeight(flockSeparationWeight) {
    this.flockSeparationWeight = flockSeparationWeight;
  },
  setObstacleSeparationWeight(obstacleSeparationWeight) {
    this.obstacleSeparationWeight = obstacleSeparationWeight;
  },
  setCohesionWeight(cohesionWeight) {
    this.cohesionWeight = cohesionWeight;
  },
  setCenterWeight(centerWeight) {
    this.centerWeight = centerWeight;
  },
  setRandomWeight(randomWeight) {
    this.randomWeight = randomWeight;
  },
  setRandomRange(randomRange) {
    this.randomRange = randomRange;
  },
  setParallaxMode(parallaxMode) {
    this.parallaxMode = parallaxMode;
  },
  getParallaxMode() {
    return this.parallaxMode;
  },

  // obstacles
  setObstacles(obstacles) {
    this.obstacles = obstacles;
  },

  // flock

  steerFlock(dt) {
    const position = this._position;
    const lastPosition = this._lastPosition;

    let dx;
    let dy;
    if (this.parallaxMode) {
      dx = 0.0;
      dy = 0.0;
    } else {
      this.steerSelf(dt);

      dx = position.x - lastPosition.x;
      dy = position.y - lastPosition.y;
    }
    lastPosition.x = position.x;
    lastPosition.y = position.y;

    const cx = this._contentSize.width * this._anchorPoint.x;
    const cy = this._contentSize.height * this._anchorPoint.y;

    // steer boids
    const { boids } = this;
    for (let i = 0, il = boids.length; i < il; i++) {
      this.steerBoid(boids[i], dt, cx, cy, dx, dy);
    }
  },

  steerSelf(dt) {
    // when has no move duration, random walk
    if (!this.moveDuration) {
      const position = this.getPosition();
      const { speed } = this;
      const { velocity } = this;
      const { targetVelocity } = this;

      // try to keep within radius of center
      let cvx = 0.0;
      let cvy = 0.0;
      const sourceScreenPosition = this.getSourceOffsetScreenPosition();
      const { randomRange } = this;
      if (sourceScreenPosition) {
        const dcx = sourceScreenPosition.x - position.x;
        const dcy = sourceScreenPosition.y - position.y;
        if (Math.abs(dcx) > randomRange.x) {
          cvx = dcx / randomRange.x * speed;
        }
        if (Math.abs(dcy) > randomRange.y) {
          cvy = dcy / randomRange.y * speed;
        }
      }

      // update velocity
      targetVelocity.x = Math.max(Math.min(targetVelocity.x + cvx + (Math.random() * 2.0 - 1.0) * speed, speed), -speed);
      targetVelocity.y = Math.max(Math.min(targetVelocity.y + cvy + (Math.random() * 2.0 - 1.0) * speed, speed), -speed);
      velocity.x += (targetVelocity.x - velocity.x) * this.steeringSpeed;
      velocity.y += (targetVelocity.y - velocity.y) * this.steeringSpeed;

      // apply velocity
      position.x += velocity.x * dt;
      position.y += velocity.y * dt;
      this.setPosition(position);
    }
  },

  steerBoid(boid, dt, cx, cy, dx, dy) {
    const { speed } = this;
    const { flockSpread } = this;

    const boidPosition = boid.getPosition();
    const { velocity } = boid;

    // steer with neighbors
    const { boids } = this;
    const { obstacles } = this;
    const flockVelocity = this._utilPoint1;
    const flockPosition = this._utilPoint2;
    const flockDifference = this._utilPoint3;
    const obstacleDifference = this._utilPoint4;

    // zero out utility points
    cc.pZeroIn(flockVelocity);
    cc.pZeroIn(flockPosition);
    cc.pZeroIn(flockDifference);
    cc.pZeroIn(obstacleDifference);

    if (boids.length + obstacles.length > 0) {
      let numFlockmates = 0;
      let numFlockmatesClose = 0;
      const numObstacles = 0;
      const diff = new cc.kmVec2();
      let i; let
        il;

      for (i = 0, il = boids.length; i < il; i++) {
        const flockmate = boids[i];

        if (flockmate !== boid) {
          numFlockmates++;

          // no need to check for neighbor distance
          // flocks should always stick together
          cc.kmVec2Add(flockVelocity, flockVelocity, flockmate.velocity);
          cc.kmVec2Add(flockPosition, flockPosition, flockmate._position);

          cc.kmVec2Subtract(diff, flockmate._position, boidPosition);
          if (Math.sqrt(diff.x * diff.x + diff.y * diff.y) < flockSpread) {
            numFlockmatesClose++;
            cc.kmVec2Subtract(flockDifference, flockDifference, diff);
          }
        }
      }
      /*
      // TODO: add separation from obstacles
      var obstacleSpread = this.obstacleSpread;
      if(this.obstacleSeparationWeight > 0.0) {
        for(i = 0, il = obstacles.length; i < il; i++) {
          var obstacle = obstacles[i];
          var obstaclePosition = this.getScreenPositionFrom(obstacle);
          cc.kmVec2Subtract(diff, obstaclePosition, cc.p(position.x + boidPosition.x, position.y + boidPosition.y));
          var obstacleDistance = Math.sqrt(diff.x * diff.x + diff.y * diff.y);
          if(obstacleDistance < obstacleSpread) {
            numObstacles++;
            cc.kmVec2Subtract(obstacleDifference, obstacleDifference, diff);
          }
        }
      }
      */
      // finalize boids properties
      if (numFlockmates > 0) {
        const flockInfluencers = 1.0 / numFlockmates;
        cc.kmVec2Subtract(flockVelocity, cc.kmVec2Scale(flockVelocity, flockVelocity, flockInfluencers), velocity);
        cc.kmVec2Subtract(flockPosition, cc.kmVec2Scale(flockPosition, flockPosition, flockInfluencers), boidPosition);
        if (numFlockmatesClose) {
          cc.kmVec2Scale(flockDifference, flockDifference, 1.0 / numFlockmatesClose);
        }
      }
      if (numObstacles > 0) {
        cc.kmVec2Scale(obstacleDifference, obstacleDifference, 1.0 / numObstacles);
      }
    }

    // update velocity and direct to target
    const { flockRadius } = this;
    const dcx = cx - boidPosition.x;
    const dcy = cy - boidPosition.y;
    const centerDist = Math.sqrt(dcx * dcx + dcy * dcy);
    let cvx = 0.0;
    let cvy = 0.0;
    let cwx = 0.0;
    let cwy = 0.0;
    if (centerDist > 0.0) {
      cwx = (dcx / centerDist) * speed;
      cwy = (dcy / centerDist) * speed;
      if (centerDist > flockRadius) {
        cvx = (dcx / flockRadius) * speed;
        cvy = (dcy / flockRadius) * speed;
      }
    }
    const fx = cvx + flockVelocity.x * this.alignmentWeight + flockPosition.x * this.cohesionWeight + flockDifference.x * this.flockSeparationWeight + obstacleDifference.x * this.obstacleSeparationWeight;
    const fy = cvy + flockVelocity.y * this.alignmentWeight + flockPosition.y * this.cohesionWeight + flockDifference.y * this.flockSeparationWeight + obstacleDifference.y * this.obstacleSeparationWeight;
    const { targetVelocity } = boid;
    targetVelocity.x = Math.max(Math.min(targetVelocity.x + fx, speed), -speed);
    targetVelocity.y = Math.max(Math.min(targetVelocity.y + fy, speed), -speed);
    velocity.x += (targetVelocity.x - velocity.x) * this.steeringSpeed;
    velocity.y += (targetVelocity.y - velocity.y) * this.steeringSpeed;

    // apply velocity
    const centerWeight = this._centerWeight;
    const invCenterWeight = Math.max(1.0 - centerWeight, 0.0);
    let vx = velocity.x * invCenterWeight + cwx * centerWeight;
    let vy = velocity.y * invCenterWeight + cwy * centerWeight;
    const len = Math.sqrt(vx * vx + vy * vy);
    if (len !== 0 && len < this.minSpeed) {
      vx = vx / len * this.minSpeed;
      vy = vy / len * this.minSpeed;
    }
    boidPosition.x += vx * dt;
    boidPosition.y += vy * dt;
    boid.setPosition(boidPosition);

    // set rotation
    boid.setRotation(-Math.atan2(dy + vy, dx + vx) * 180 / Math.PI);
  },

  // core

  start() {
    FXProjectileSprite.prototype.start.call(this);
    this.scheduleUpdate();
  },
  startTransform() {
    FXSprite.prototype.startTransform.call(this);

    let dx; let
      dy;
    let da; let ra; let
      angle;
    const { speed } = this;
    const cx = this._contentSize.width * this._anchorPoint.x;
    const cy = this._contentSize.height * this._anchorPoint.y;
    const sourceScreenPosition = this.getSourceOffsetScreenPosition();
    const targetScreenPosition = this.getTargetOffsetScreenPosition();
    if (sourceScreenPosition && targetScreenPosition) {
      dx = targetScreenPosition.x - sourceScreenPosition.x;
      dy = targetScreenPosition.y - sourceScreenPosition.y;
    } else {
      dx = Math.random() * 2.0 - 1.0;
      dy = Math.random() * 2.0 - 1.0;
    }
    const rad = -Math.atan2(dy, dx);

    // handles own facing
    this.setFlippedX(false);

    // create new boids
    let { boids } = this;
    let i; let il; let
      boid;
    if (this.boidFX && boids.length !== this.numBoids) {
      // remove all previous
      for (i = 0, il = boids.length; i < il; i++) {
        boids[i].destroy();
      }

      boids = NodeFactory.createFX(this.boidFX, { copies: this.numBoids, noLimit: true });
      this.setBoids(boids);
    }

    // show all boids
    let oxMax = 0.0;
    if (boids && boids.length) {
      for (i = 0, il = boids.length; i < il; i++) {
        boid = boids[i];

        // ensure is child of flock
        if (boid.getParent() !== this) {
          this.addChild(boid, boid.getLocalZOrder() || 0);

          // counteract scaling
          boid.setScale(boid.getScale() * (1.0 / this.getScale()));
        }

        // velocity
        da = Math.atan2(dy, dx);
        ra = Math.PI * 2.0 * (Math.random() * 2.0 - 1.0) * this.randomWeight;
        angle = -(da + ra);
        boid.velocity = UtilsPosition.rotatePosition(cc.p(speed, 0.0), angle);
        boid.targetVelocity.x = boid.velocity.x;
        boid.targetVelocity.y = boid.velocity.y;

        // rotation
        const boidRad = angle * 180 / Math.PI;
        boid.setRotation(boidRad);

        // offset
        const ox = boid._contentSize.width;
        oxMax = Math.max(oxMax, ox);
        const boidOffset = UtilsPosition.rotatePosition(cc.p(-ox, 0.0), rad);

        // position
        const rx = Math.random() * 2.0 - 1.0;
        const ry = Math.random() * 2.0 - 1.0;
        const sx = this.flockSpread * rx + rx;
        const sy = this.flockSpread * ry + ry;
        boid.setPosition(cc.p(cx + sx + boidOffset.x, cy + sy + boidOffset.y));
      }
    }

    const offset = UtilsPosition.rotatePosition(cc.p(oxMax, 0.0), rad);
    this.setPosition(cc.p(sourceScreenPosition.x + offset.x, sourceScreenPosition.y + offset.y));

    if (this.moveDuration) {
      // transition center weight to max
      this._centerWeight = 1.0;
      this.runAction(cc.EaseExponentialIn.create(cc.ActionTween.create(this.moveDuration, '_centerWeight', 0.0, this.centerWeight)));
      this._offsetWeight = 0.0;
      this.runAction(cc.ActionTween.create(this.moveDuration, '_offsetWeight', 0.0, 1.0));

      // movement
      if (targetScreenPosition) {
        let movement = cc.MoveTo.create(this.moveDuration, targetScreenPosition);
        if (this.easing) {
          movement = this.easing.create(movement);
        }

        this.runAction(cc.sequence(
          movement,
          cc.callFunc(this.end, this),
        ));
      }
    }

    // record starting position
    this._lastPosition.x = this._position.x;
    this._lastPosition.y = this._position.y;
  },
  updateTweenAction(value, key) {
    if (key === '_centerWeight') {
      this._centerWeight = value;
    } else if (key === '_offsetWeight') {
      this._offsetWeight = value;
    }
  },
  update(dt) {
    this.steerFlock(dt);
    FXProjectileSprite.prototype.update.call(this, dt);
  },
});

FXFlockSprite.create = function (options, sprite) {
  return FXProjectileSprite.create(options, sprite || new FXFlockSprite(options));
};

module.exports = FXFlockSprite;
