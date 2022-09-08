const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');

/** **************************************************************************
 Core injections into the base cocos classes.
 *************************************************************************** */

const CCInjections = {};

/* region CORE */

// remove filename suffix for retina
// our loader will handle all filename modification for different resolutions / dpi
cc.RETINA_DISPLAY_FILENAME_SUFFIX = '';

// helper method to retrieve the running scene, and if none present try the next scene
cc.Director.prototype.getRunningScene = function () {
  return this._runningScene || this._nextScene;
};

// helper method on any class to get the main scene (i.e. view/Scene.js)
// from there it is very easy to reference the currently active layer
cc.Class.prototype.getScene = function () {
  return cc.director.getRunningScene();
};
// helper method on any class to get the scene's shared FX
cc.Class.prototype.getFX = function () {
  const scene = this.getScene();
  return scene && scene.getFX();
};

// pooled nodes should remove reference to parent
cc.pool._super_putInPool = cc.pool.putInPool;
cc.pool.putInPool = function (obj) {
  cc.pool._super_putInPool(obj);
  obj.setParent && obj.setParent(null);
};

// inject fx visit into director before/after visit
cc.Director.prototype._superBeforeVisitScene = cc.Director.prototype._beforeVisitScene;
cc.Director.prototype._beforeVisitScene = function () {
  const scene = cc.director.getRunningScene();
  if (scene != null) {
    scene.getFX().beginForVisit();
  }

  if (cc.Director.prototype._superBeforeVisitScene) {
    cc.Director.prototype._superBeforeVisitScene.apply(this, arguments);
  }
};

cc.Director.prototype._superAfterVisitScene = cc.Director.prototype._afterVisitScene;
cc.Director.prototype._afterVisitScene = function () {
  if (cc.Director.prototype._superAfterVisitScene) {
    cc.Director.prototype._superAfterVisitScene.apply(this, arguments);
  }

  const scene = cc.director.getRunningScene();
  if (scene != null) {
    scene.getFX().endForVisit();
  }
};

/* endregion CORE */

/* region ACTIONS */

// cocos actions should have a concept of when they actually begin updating
cc.ActionInterval.prototype.step = function (dt) {
  if (this._firstTick) {
    this._firstTick = false;
    this._elapsed = 0;
    if (!this.getActive()) {
      this.activate();
    }
  } else {
    this._elapsed += dt;
  }

  if (this.getTarget() == null) {
    return;
  }

  // this.update((1 > (this._elapsed / this._duration)) ? this._elapsed / this._duration : 1);
  // this.update(Math.max(0, Math.min(1, this._elapsed / Math.max(this._duration, cc.FLT_EPSILON))));
  let t = this._elapsed / (this._duration > 0.0000001192092896 ? this._duration : 0.0000001192092896);
  t = (t < 1 ? t : 1);
  this.update(t > 0 ? t : 0);

  // Compatible with repeat class, Discard after can be deleted (this._repeatMethod)
  if (this._repeatMethod && this._timesForRepeat > 1 && this.isDone()) {
    if (!this._repeatForever) {
      this._timesForRepeat--;
    }
    // var diff = locInnerAction.getElapsed() - locInnerAction._duration;
    this.startWithTarget(this.target);
    // to prevent jerk. issue #390 ,1247
    // this._innerAction.step(0);
    // this._innerAction.step(diff);
    this.step(this._elapsed - this._duration);
  }
};
cc.ActionInterval.prototype._speedModifier = 1.0;
cc.ActionInterval.prototype.setSpeedModifier = function (val) {
  if (val <= 0.0) {
    Logger.module('ENGINE').debug('Action speed modifier must be > 0!');
    return;
  }

  if (this._speedModifier !== val) {
    const lastSpeedModifier = this._speedModifier;
    this._speedModifier = val;
    this.speed(this._speedModifier / lastSpeedModifier);
  }
};

cc.Sequence.prototype.update = function (dt) {
  let new_t; let
    found = 0;
  const locSplit = this._split; const locActions = this._actions; const locLast = this._last; let
    actionFound;

  dt = this._computeEaseTime(dt);
  if (dt < locSplit) {
    // action[0]
    new_t = (locSplit !== 0) ? dt / locSplit : 1;
    if (locLast === -1) {
      if (locActions[1].getActive()) {
        // every time a sequence loops, it resets locLast to -1
        // so we need to check if the second action is active and deactivate
        locActions[1].deactivate();
      }
    } else if (locLast === 1) {
      // Reverse mode ?
      // XXX: Bug. this case doesn't contemplate when _last==-1, found=0 and in "reverse mode"
      // since it will require a hack to know if an action is on reverse mode or not.
      // "step" should be overriden, and the "reverseMode" value propagated to inner Sequences.
      locActions[1].update(0);
      locActions[1].stop();
    }
  } else {
    // action[1]
    found = 1;
    new_t = (locSplit === 1) ? 1 : (dt - locSplit) / (1 - locSplit);

    if (locLast === -1) {
      // action[0] was skipped, execute it.
      locActions[0].startWithTarget(this.target);
      if (!locActions[0].getActive()) {
        locActions[0].activate();
      }
      locActions[0].update(1);
      locActions[0].stop();
    } else if (!locLast) {
      // switching to action 1. stop action 0.
      locActions[0].update(1);
      locActions[0].stop();
    }
  }

  actionFound = locActions[found];
  // Last action found and it is done.
  if (locLast === found && actionFound.isDone()) {
    return;
  }

  // action changed
  if (locLast !== found) actionFound.startWithTarget(this.target);

  if (actionFound.getTarget() == null) {
    return;
  }

  new_t *= actionFound._timesForRepeat;
  new_t = new_t > 1 ? new_t % 1 : new_t;
  if (!actionFound.getActive()) {
    actionFound.activate();
  }
  actionFound.update(new_t);
  this._last = found;
};

cc.Action.prototype._active = false;
cc.Action.prototype.getActive = function () {
  return this._active;
};

/**
 * Called before the action's first step is taken. Override as needed to do any setup when the action actually becomes active.
 * NOTE: startWithTarget and initWithDuration are called before actions actually become active
 */
cc.Action.prototype.activate = function () {
  this._active = true;
};

/**
 * Called when an active action is stopped or removed. Override as needed to do any teardown for active actions.
 * NOTE: stop is not called unless an action finishes naturally
 */
cc.Action.prototype.deactivate = function () {
  this._active = false;
};

cc.Action.prototype._onCancelledCallback = null;
/**
 * Called when an active action is cancelled.
 * NOTE: actions are not cancelled unless stopped before finishing.
 */
cc.Action.prototype.setOnCancelledCallback = function (fn) {
  this._onCancelledCallback = fn;
};
cc.Action.prototype.getOnCancelledCallback = function () {
  return this._onCancelledCallback;
};

cc.Action.prototype.cancel = function () {
  if (this.getActive()) {
    // deactivate first in case cancel callback triggers action removal
    // this will prevent infinite loops from occurring
    this.deactivate();

    if (this._onCancelledCallback != null) {
      this._onCancelledCallback.call(this);
    }
  }
};

cc.Sequence.prototype.cancel = function () {
  if (this.getActive()) {
    const actions = this._actions;
    for (let i = 0, il = actions.length; i < il; i++) {
      actions[i].cancel();
    }
    cc.Action.prototype.cancel.call(this);
  }
};

cc.Action.prototype.stop = function () {
  if (this.getActive()) {
    this.deactivate();
  }
  this.target = null;
};

cc.Sequence.prototype.stop = function () {
  const actions = this._actions;
  for (let i = 0, il = actions.length; i < il; i++) {
    actions[i].stop();
  }
  cc.Action.prototype.stop.call(this);
};

// ActionManager should call deactivate on any active actions when they are removed
// but by default cocos does not call stop on actions unless they finish naturally
// which means that actions have no way of cleaning themselves up
cc.ActionManager.prototype.removeAllActionsFromTarget = function (target, forceDelete) {
  // explicit null handling
  if (target == null) return;
  const element = this._hashTargets[target.__instanceId];
  if (element) {
    if (element.currentAction != null) {
      // salvage the action in case we are mid loop
      if (!element.currentActionSalvaged) {
        element.currentActionSalvaged = true;
      }
    }

    if (element.actions.length > 0) {
      const { actions } = element;
      for (let i = 0, il = actions.length; i < il; i++) {
        const action = actions[i];
        if (action.getActive()) {
          action.deactivate();
        }
      }
      element.actions.length = 0;
    }

    if (this._currentTarget == element && !forceDelete) {
      this._currentTargetSalvaged = true;
    } else {
      this._deleteHashElement(element);
    }
  }
};
cc.ActionManager.prototype.removeAction = function (action) {
  // explicit null handling
  if (action == null || action.getOriginalTarget() == null) return;
  const target = action.getOriginalTarget();
  const element = this._hashTargets[target.__instanceId];

  if (element) {
    for (let i = 0; i < element.actions.length; i++) {
      if (element.actions[i] == action) {
        this._removeActionAtIndex(i, element);
        break;
      }
    }
  }
};
cc.ActionManager.prototype.removeActionByTag = function (tag, target) {
  if (tag == cc.ACTION_TAG_INVALID) cc.log(cc._LogInfos.ActionManager_addAction);

  cc.assert(target, cc._LogInfos.ActionManager_addAction);

  const element = this._hashTargets[target.__instanceId];

  if (element) {
    const limit = element.actions.length;
    for (let i = 0; i < limit; ++i) {
      const action = element.actions[i];
      if (action && action.getTag() === tag && action.getOriginalTarget() == target) {
        this._removeActionAtIndex(i, element);
        break;
      }
    }
  }
};
cc.ActionManager.prototype._removeActionAtIndex = function (index, element) {
  const action = element.actions[index];

  if (action == element.currentAction) {
    // salvage the action in case we are mid loop
    if (!element.currentActionSalvaged) {
      element.currentActionSalvaged = true;
    }
  }

  // attempt to cancel the action
  action.cancel();

  // if element wasn't already cleaned up by cancel
  if (element.actions != null) {
    element.actions.splice(index, 1);

    // update actionIndex in case we are mid loop
    if (element.actionIndex >= index) element.actionIndex--;

    if (element.actions.length == 0) {
      if (this._currentTarget == element) {
        this._currentTargetSalvaged = true;
      } else {
        this._deleteHashElement(element);
      }
    }
  }
};
cc.ActionManager.prototype.setAllActionsSpeedModifiers = function (val) {
  if (val <= 0.0) {
    Logger.module('ENGINE').debug('Action speed modifier must be > 0!');
    return;
  }

  const actionTargets = this._arrayTargets;
  for (let i = 0; i < actionTargets.length; i++) {
    const actionTarget = actionTargets[i];
    const { actions } = actionTarget;
    for (let j = 0, jl = actions.length; j < jl; j++) {
      const action = actions[j];
      if (action != null) {
        action.setSpeedModifier(val);
      }
    }
  }
};

/* endregion ACTIONS */

/* region INPUT */

// control buttons don't set their sub-label opacity correctly when their own opacity is set
cc.ControlButton.prototype._cascadeOpacityEnabled = true;
cc.ControlButton.prototype._superCtor = cc.ControlButton.prototype.ctor;
cc.ControlButton.prototype.ctor = function () {
  // cocos forces these to false and ignores prototype
  const cascadeOpacityEnabled = cc.ControlButton.prototype._cascadeOpacityEnabled;
  cc.ControlButton.prototype._superCtor.apply(this, arguments);
  this.setCascadeOpacityEnabled(cascadeOpacityEnabled);
};

// override cocos input manager to NOT swallow all events
cc.inputManager.registerSystemEvent = function (element) {
  if (this._isRegisterEvent) return;

  const locView = this._glView = cc.view;
  const selfPointer = this;
  const supportMouse = ('mouse' in cc.sys.capabilities); const
    supportTouches = ('touches' in cc.sys.capabilities);

  // HACK
  //  - At the same time to trigger the ontouch event and onmouse event
  //  - The function will execute 2 times
  // The known browser:
  //  liebiao
  //  miui
  //  WECHAT
  let prohibition = false;
  if (cc.sys.isMobile) prohibition = true;

  // register touch event
  if (supportMouse) {
    // registering mouse events on the window object causes buggy behavior
    /*
    cc._addEventListener(window, 'mousedown', function () {
      selfPointer._mousePressed = true;
    }, false);

    cc._addEventListener(window, 'mouseup', function (event) {
      if(prohibition) return;
      var savePressed = selfPointer._mousePressed;
      selfPointer._mousePressed = false;

      if(!savePressed)
        return;

      var pos = selfPointer.getHTMLElementPosition(element);
      var location = selfPointer.getPointByEvent(event, pos);
      if (!cc.rectContainsPoint(new cc.Rect(pos.left, pos.top, pos.width, pos.height), location)){
        selfPointer.handleTouchesEnd([selfPointer.getTouchByXY(location.x, location.y, pos)]);

        var mouseEvent = selfPointer.getMouseEvent(location,pos,cc.EventMouse.UP);
        mouseEvent.setButton(event.button);
        cc.eventManager.dispatchEvent(mouseEvent);
      }
    }, false);
    */
    // register canvas mouse event
    cc._addEventListener(element, 'mousedown', (event) => {
      if (prohibition) return;
      selfPointer._mousePressed = true;

      const pos = selfPointer.getHTMLElementPosition(element);
      const location = selfPointer.getPointByEvent(event, pos);

      selfPointer.handleTouchesBegin([selfPointer.getTouchByXY(location.x, location.y, pos)]);

      const mouseEvent = selfPointer.getMouseEvent(location, pos, cc.EventMouse.DOWN);
      mouseEvent.setButton(event.button);
      cc.eventManager.dispatchEvent(mouseEvent);
      element.focus();
    }, false);

    cc._addEventListener(element, 'mouseup', (event) => {
      if (prohibition) return;
      selfPointer._mousePressed = false;

      const pos = selfPointer.getHTMLElementPosition(element);
      const location = selfPointer.getPointByEvent(event, pos);

      selfPointer.handleTouchesEnd([selfPointer.getTouchByXY(location.x, location.y, pos)]);

      const mouseEvent = selfPointer.getMouseEvent(location, pos, cc.EventMouse.UP);
      mouseEvent.setButton(event.button);
      cc.eventManager.dispatchEvent(mouseEvent);
    }, false);

    cc._addEventListener(element, 'mousemove', (event) => {
      if (prohibition) return;

      const pos = selfPointer.getHTMLElementPosition(element);
      const location = selfPointer.getPointByEvent(event, pos);

      selfPointer.handleTouchesMove([selfPointer.getTouchByXY(location.x, location.y, pos)]);

      const mouseEvent = selfPointer.getMouseEvent(location, pos, cc.EventMouse.MOVE);
      if (selfPointer._mousePressed) mouseEvent.setButton(event.button);
      else mouseEvent.setButton(null);
      cc.eventManager.dispatchEvent(mouseEvent);
    }, false);

    cc._addEventListener(element, 'mousewheel', (event) => {
      const pos = selfPointer.getHTMLElementPosition(element);
      const location = selfPointer.getPointByEvent(event, pos);

      const mouseEvent = selfPointer.getMouseEvent(location, pos, cc.EventMouse.SCROLL);
      mouseEvent.setButton(event.button);
      mouseEvent.setScrollData(0, event.wheelDelta);
      cc.eventManager.dispatchEvent(mouseEvent);
    }, false);

    /* firefox fix */
    cc._addEventListener(element, 'DOMMouseScroll', (event) => {
      const pos = selfPointer.getHTMLElementPosition(element);
      const location = selfPointer.getPointByEvent(event, pos);

      const mouseEvent = selfPointer.getMouseEvent(location, pos, cc.EventMouse.SCROLL);
      mouseEvent.setButton(event.button);
      mouseEvent.setScrollData(0, event.detail * -120);
      cc.eventManager.dispatchEvent(mouseEvent);
    }, false);
  }

  if (window.navigator.msPointerEnabled) {
    const _pointerEventsMap = {
      MSPointerDown: selfPointer.handleTouchesBegin,
      MSPointerMove: selfPointer.handleTouchesMove,
      MSPointerUp: selfPointer.handleTouchesEnd,
      MSPointerCancel: selfPointer.handleTouchesCancel,
    };

    for (const eventName in _pointerEventsMap) {
      (function (_pointerEvent, _touchEvent) {
        cc._addEventListener(element, _pointerEvent, (event) => {
          const pos = selfPointer.getHTMLElementPosition(element);
          pos.left -= document.documentElement.scrollLeft;
          pos.top -= document.documentElement.scrollTop;

          _touchEvent.call(selfPointer, [selfPointer.getTouchByXY(event.clientX, event.clientY, pos)]);
        }, false);
      }(eventName, _pointerEventsMap[eventName]));
    }
  }

  if (supportTouches) {
    // register canvas touch event
    cc._addEventListener(element, 'touchstart', (event) => {
      if (!event.changedTouches) return;

      const pos = selfPointer.getHTMLElementPosition(element);
      pos.left -= document.body.scrollLeft;
      pos.top -= document.body.scrollTop;
      selfPointer.handleTouchesBegin(selfPointer.getTouchesByEvent(event, pos));
      element.focus();
    }, false);

    cc._addEventListener(element, 'touchmove', (event) => {
      if (!event.changedTouches) return;

      const pos = selfPointer.getHTMLElementPosition(element);
      pos.left -= document.body.scrollLeft;
      pos.top -= document.body.scrollTop;
      selfPointer.handleTouchesMove(selfPointer.getTouchesByEvent(event, pos));
    }, false);

    cc._addEventListener(element, 'touchend', (event) => {
      if (!event.changedTouches) return;

      const pos = selfPointer.getHTMLElementPosition(element);
      pos.left -= document.body.scrollLeft;
      pos.top -= document.body.scrollTop;
      selfPointer.handleTouchesEnd(selfPointer.getTouchesByEvent(event, pos));
    }, false);

    cc._addEventListener(element, 'touchcancel', (event) => {
      if (!event.changedTouches) return;

      const pos = selfPointer.getHTMLElementPosition(element);
      pos.left -= document.body.scrollLeft;
      pos.top -= document.body.scrollTop;
      selfPointer.handleTouchesCancel(selfPointer.getTouchesByEvent(event, pos));
    }, false);
  }

  // register keyboard event
  this._registerKeyboardEvent();

  // register Accelerometer event
  this._registerAccelerometerEvent();

  this._isRegisterEvent = true;
};

cc.inputManager._registerKeyboardEvent = function () {
  cc._addEventListener(cc._canvas, 'keydown', (e) => {
    cc.eventManager.dispatchEvent(new cc.EventKeyboard(e.keyCode, true));
  }, false);
  cc._addEventListener(cc._canvas, 'keyup', (e) => {
    cc.eventManager.dispatchEvent(new cc.EventKeyboard(e.keyCode, false));
  }, false);
};

/* endregion INPUT */

/* region PARALLAX */

/**
 * Sets a child's parallax ratio and a position offset (cocos doesn't provide this functionality).
 * @param {cc.Node} child
 * @param {cc.Point} ratio
 * @param {cc.Point} offset
 */
cc.ParallaxNode.prototype.setChildParallaxRatioAndOffset = function (child, ratio, offset) {
  const locParallaxArray = this.parallaxArray;
  for (let i = 0; i < locParallaxArray.length; i++) {
    const point = locParallaxArray[i];
    if (point.getChild() == child) {
      point.setRatio(ratio);
      point.setOffset(offset);
      child.setPosition(this._position.x * ratio.x + offset.x, this._position.y * ratio.y + offset.y);
      break;
    }
  }
};

/* endregion PARALLAX */

/* region AUDIO */

// audio engine all effect methods errors out often due to race conditions
cc.audioEngine.stopAllEffects = function () {
  const ap = this._audioPool;
  const poolKeys = Object.keys(ap);
  for (let i = 0, il = poolKeys.length; i < il; i++) {
    const poolKey = poolKeys[i];
    const list = ap[poolKey];
    if (list != null) {
      for (let j = 0, jl = list.length; j < jl; j++) {
        const audio = list[j];
        if (audio != null) {
          audio.stop();
        }
      }
    }
  }
};
cc.audioEngine.pauseAllEffects = function () {
  const ap = this._audioPool;
  const poolKeys = Object.keys(ap);
  for (let i = 0, il = poolKeys.length; i < il; i++) {
    const poolKey = poolKeys[i];
    const list = ap[poolKey];
    if (list != null) {
      for (let j = 0, jl = list.length; j < jl; j++) {
        const audio = list[j];
        if (audio != null && audio.getPlaying()) {
          audio.pause();
        }
      }
    }
  }
};
cc.audioEngine.resumeAllEffects = function () {
  const ap = this._audioPool;
  const poolKeys = Object.keys(ap);
  for (let i = 0, il = poolKeys.length; i < il; i++) {
    const poolKey = poolKeys[i];
    const list = ap[poolKey];
    if (list != null) {
      for (let j = 0, jl = list.length; j < jl; j++) {
        const audio = list[j];
        if (audio != null && !audio.getPlaying()) {
          audio.resume();
        }
      }
    }
  }
};

cc.Audio.prototype.getPlaying = function () {
  return this._playing;
  /*
  if(!this._playing){
    return this._playing;
  }
  if(this._AUDIO_TYPE === "AUDIO"){
    var audio = this._element;
    if(!audio || this._pause){
      this._playing = false;
      return false;
    } else if(audio.ended){
      this._playing = false;
      return false;
    } else {
      return true;
    }
  }else{
    if(!this._context || !this._currentSource || !this._currentSource.buffer) {
      return false;
    } else {
      return this._currentTime + this._context.currentTime - this._startTime < this._currentSource.buffer.duration;
    }
  }
  */
};

cc.Audio.prototype.getElapsed = function () {
  if (this._AUDIO_TYPE === 'AUDIO') {
    if (this._element == null) {
      return 0.0;
    }
    return this._element.currentTime;
  }
  if (!this._context || !this._currentSource || !this._currentSource.buffer) {
    return 0.0;
  }
  return this._currentTime + this._context.currentTime - this._startTime;
};

cc.Audio.prototype.getDuration = function () {
  if (this._AUDIO_TYPE === 'AUDIO') {
    if (this._element == null) {
      return 0.0;
    }
    return this._element.duration;
  }
  if (!this._buffer) {
    return 0.0;
  }
  return this._buffer.duration;
};

/* endregion AUDIO */

module.exports = CCInjections;
