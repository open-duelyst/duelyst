/****************************************************************************
 UtilsUI - UI utility methods.
 ****************************************************************************/
var UtilsUI = {};

module.exports = UtilsUI;

var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var SDK = require('app/sdk');
var UtilsEngine = require('./utils_engine');
var audio_engine = require('app/audio/audio_engine');
var _ = require('underscore');

/**
 * Overlays scrollbars on an element as needed.
 * NOTE: does not auto update on resize. You must call this method manually anytime a recalculation is needed.
 * @param {String|DOM|jQuery} selectorOrElement
 * @param {String|DOM|jQuery} [scrollTargetSelectorOrElement=selectorOrElement]
 */
UtilsUI.overlayScrollbars = function (selectorOrElement, scrollTargetSelectorOrElement) {
	if (scrollTargetSelectorOrElement == null) { scrollTargetSelectorOrElement = selectorOrElement; }
	var $els = $(selectorOrElement);
	$(scrollTargetSelectorOrElement).each(function (i, scrollTarget) {
		var $scrollTarget = $(scrollTarget);
		var $el;
		if (scrollTargetSelectorOrElement === selectorOrElement) {
			$el = $scrollTarget;
		} else {
			var el = $els.get(i);
			$el = el != null ? $(el) : $scrollTarget;
		}

		// initialize scrolling
		if ($scrollTarget.children(".scrollable-inner").length === 0) {
			$scrollTarget.wrapInner("<div class='scrollable-inner'></div>");
			$scrollTarget.append("<div class='scrollable-bar-horizontal'><div class='scrollable-bar-horizontal-inner'></div></div>");
			$scrollTarget.append("<div class='scrollable-bar-vertical'><div class='scrollable-bar-vertical-inner'></div></div>");
			$scrollTarget.addClass("scrollable");
			$scrollTarget.data("width", 0);
			$scrollTarget.data("height", 0);
			$scrollTarget.data("scrollWidth", 0);
			$scrollTarget.data("scrollHeight", 0);
		}

		// get scrolling element
		var $inner = $scrollTarget.children(".scrollable-inner");
		var $scrollbarVertical = $scrollTarget.children(".scrollable-bar-vertical");
		var $scrollbarVerticalInner = $scrollbarVertical.children(".scrollable-bar-vertical-inner");
		var $scrollbarHorizontal = $scrollTarget.children(".scrollable-bar-horizontal");
		var $scrollbarHorizontalInner = $scrollbarHorizontal.children(".scrollable-bar-horizontal-inner");

		// measure element size
		var width = $scrollTarget.width();
		var height = $scrollTarget.height();
		var scrollWidth = $inner[0].scrollWidth;
		var scrollHeight = $inner[0].scrollHeight;

		// check if anything has changed since last time
		if ($scrollTarget.data("width") === width
			&& $scrollTarget.data("height") === height
			&& $scrollTarget.data("scrollWidth") === scrollWidth
			&& $scrollTarget.data("scrollHeight") === scrollHeight) {
			return;
		}

		$scrollTarget.data("width", width);
		$scrollTarget.data("height", height);
		$scrollTarget.data("scrollWidth", scrollWidth);
		$scrollTarget.data("scrollHeight", scrollHeight);

		// set inner width/height to match target
		$inner.css({ width: width, height: height });

		// remove any previous listeners
		$el.off("wheel");
		$scrollbarVertical.off("scroll");
		$scrollbarHorizontal.off("scroll");

		// determine whether scroll is needed
		var maxScrollVertical = scrollHeight - height;
		var maxScrollHorizontal = scrollWidth - width;
		var needsScrollVertical = maxScrollVertical > 0;
		var needsScrollHorizontal = maxScrollHorizontal > 0;

		// add listeners to keep scrolling area and scrollbars in sync
		if (!needsScrollVertical && !needsScrollHorizontal) {
			$scrollbarVertical.scrollTop(0);
			$scrollbarHorizontal.scrollLeft(0);
			$scrollbarVertical.css("height", 0);
			$scrollbarVerticalInner.css("height", 0);
			$scrollbarHorizontal.css("width", 0);
			$scrollbarHorizontalInner.css("width", 0);
			$scrollbarVertical.hide();
			$scrollbarHorizontal.hide();
		} else {
			// setup inner sync
			if (needsScrollVertical && needsScrollHorizontal) {
				$el.on("wheel", function (event) {
					var scrollTop = Math.min(maxScrollVertical, Math.max(0.0, $inner.scrollTop() + event.originalEvent.deltaY));
					var scrollLeft = Math.min(maxScrollHorizontal, Math.max(0.0, $inner.scrollLeft() + event.originalEvent.deltaX));

					$inner.scrollTop(scrollTop);
					$inner.scrollLeft(scrollLeft);

					$scrollbarVertical.scrollTop(scrollTop);
					$scrollbarHorizontal.scrollLeft(scrollLeft);
				});
			} else if (needsScrollVertical) {
				$el.on("wheel", function (event) {
					var scrollTop = Math.min(maxScrollVertical, Math.max(0.0, $inner.scrollTop() + event.originalEvent.deltaY));
					$inner.scrollTop(scrollTop);
					$scrollbarVertical.scrollTop(scrollTop);
				});
			} else if (needsScrollHorizontal) {
				$el.on("wheel", function (event) {
					var scrollLeft = Math.min(maxScrollHorizontal, Math.max(0.0, $inner.scrollLeft() + event.originalEvent.deltaX));
					$inner.scrollLeft(scrollLeft);
					$scrollbarHorizontal.scrollLeft(scrollLeft);
				});
			}

			// setup directional sync
			if (needsScrollVertical) {
				$scrollbarVertical.show();
				$scrollbarVertical.css("height", height);
				$scrollbarVerticalInner.css("height", $inner[0].scrollHeight);
				$scrollbarVertical.on("scroll", function () {
					$inner.scrollTop($scrollbarVertical.scrollTop());
				});
			} else {
				$scrollbarVertical.hide();
			}

			if (needsScrollHorizontal) {
				$scrollbarHorizontal.show();
				$scrollbarHorizontal.css("width", width);
				$scrollbarHorizontalInner.css("width", $inner[0].scrollWidth);
				$scrollbarHorizontal.on("scroll", function () {
					$inner.scrollLeft($scrollbarHorizontal.scrollLeft());
				});
			} else {
				$scrollbarHorizontal.hide();
			}
		}
	});
};

/**
 * Removes overlay scrollbars on an element as needed.
 * @param {String|DOM|jQuery} selectorOrElement
 * @param {String|DOM|jQuery} [scrollTargetSelectorOrElement=selectorOrElement]
 */
UtilsUI.removeOverlayScrollbars = function (selectorOrElement, scrollTargetSelectorOrElement) {
	if (scrollTargetSelectorOrElement == null) { scrollTargetSelectorOrElement = selectorOrElement; }
	var $els = $(selectorOrElement);
	$(scrollTargetSelectorOrElement).each(function (i, scrollTarget) {
		var $scrollTarget = $(scrollTarget);
		var $el;
		if (scrollTargetSelectorOrElement === selectorOrElement) {
			$el = $scrollTarget;
		} else {
			var el = $els.get(i);
			$el = el != null ? $(el) : $scrollTarget;
		}

		// remove scrolling
		$el.off("wheel");
		$scrollTarget.removeClass("scrollable");
		$scrollTarget.children(".scrollable-inner").children().unwrap();
		$scrollTarget.children(".scrollable-bar-vertical, .scrollable-bar-horizontal").off("scroll").remove();
		$scrollTarget.children(".scrollable-bar-vertical").off("scroll").remove();

	}.bind(this));
};

/**
 * Returns a string with the flavor text for user profile.
 * @param factionId
 * @param userStatsData
 * @returns {String}
 */
UtilsUI.getFactionFlavorTextWithUserStats = function (factionId,userStatsData) {
	if (factionId == SDK.Factions.Faction1) {
		var zealUnitsPlayed = 0;
		zealUnitsPlayed += userStatsData.ranked[factionId].cardsPlayedCounts[SDK.Cards.Faction1.WindbladeAdept] || 0;
		zealUnitsPlayed += userStatsData.ranked[factionId].cardsPlayedCounts[SDK.Cards.Faction1.SuntideMaiden] || 0;
		zealUnitsPlayed += userStatsData.ranked[factionId].cardsPlayedCounts[SDK.Cards.Faction1.SilverguardKnight] || 0;
		zealUnitsPlayed += userStatsData.ranked[factionId].cardsPlayedCounts[SDK.Cards.Faction1.WindbladeCommander] || 0;
		zealUnitsPlayed += userStatsData.ranked[factionId].cardsPlayedCounts[SDK.Cards.Faction1.Sunriser] || 0;
		// Lyonar reports the number of games with provokes
		return zealUnitsPlayed + " Zealous units summoned";
	} else if (factionId == SDK.Factions.Faction2) {
		// Songhai reports the number of games with backstabs
		var backstabUnitsPlayed = 0;
		backstabUnitsPlayed += userStatsData.ranked[factionId].cardsPlayedCounts[SDK.Cards.Faction2.KaidoAssassin] || 0;
		backstabUnitsPlayed += userStatsData.ranked[factionId].cardsPlayedCounts[SDK.Cards.Faction2.ScarletViper] || 0;
		backstabUnitsPlayed += userStatsData.ranked[factionId].cardsPlayedCounts[SDK.Cards.Faction2.GoreHorn] || 0;
		return backstabUnitsPlayed + " Assassins summoned";
	} else if (factionId == SDK.Factions.Faction3) {
		// Vetruvian reports the number of games with dervishes
		var dervishesSummoned = userStatsData.ranked[factionId].cardsPlayedCounts[SDK.Cards.Faction3.Dervish] || 0;
		return dervishesSummoned + " Ethereal Dervishes manifested";
	} else if (factionId == SDK.Factions.Faction4) {
		// Abyssian reports the number of games with wraithlings
		var wraithlingsSpawned = userStatsData.ranked[factionId].cardsPlayedCounts[SDK.Cards.Faction4.Wraithling] || 0;
		return wraithlingsSpawned + " Wraithlings spawned";
	} else if (factionId == SDK.Factions.Faction5) {
		// Magmar reports the number of games with rebirth
		var rebirthersSummoned = 0;
		rebirthersSummoned += userStatsData.ranked[factionId].cardsPlayedCounts[SDK.Cards.Faction5.YoungSilithar] || 0;
		rebirthersSummoned += userStatsData.ranked[factionId].cardsPlayedCounts[SDK.Cards.Faction5.VeteranSilithar] || 0;
		rebirthersSummoned += userStatsData.ranked[factionId].cardsPlayedCounts[SDK.Cards.Faction5.SilitharElder] || 0;
		return rebirthersSummoned + " Rebirth units summoned";
	} else if (factionId == SDK.Factions.Faction6) {
		// Vanar reports the number of games with inflitration
		var infilitratorsSummoned = 0;
		infilitratorsSummoned += userStatsData.ranked[factionId].cardsPlayedCounts[SDK.Cards.Faction6.Ravager] || 0;
		infilitratorsSummoned += userStatsData.ranked[factionId].cardsPlayedCounts[SDK.Cards.Faction6.GhostWolf] || 0;
		infilitratorsSummoned += userStatsData.ranked[factionId].cardsPlayedCounts[SDK.Cards.Faction6.Cloaker] || 0;
		infilitratorsSummoned += userStatsData.ranked[factionId].cardsPlayedCounts[SDK.Cards.Faction6.WyrBeast] || 0;
		infilitratorsSummoned += userStatsData.ranked[factionId].cardsPlayedCounts[SDK.Cards.Faction6.WolfRaven] || 0;
		return infilitratorsSummoned + " Infiltrators summoned";
	} else {
		return "Flavor Text - Unknown Faction";
	}
};

/**
 * Attempts to find the popover element on another element.
 * @param {String|DOM|jQuery} selectorOrElement
 * @returns {$popover}
 */
UtilsUI.getPopover = function (selectorOrElement) {
	var popoverData = $(selectorOrElement).data("bs.popover");
	return popoverData && popoverData.$tip;
};

/**
 * Attempts to remove the popover element from another element.
 * @param {String|DOM|jQuery} selectorOrElement
 */
UtilsUI.removePopover = function (selectorOrElement) {
	var $popover = UtilsUI.getPopover(selectorOrElement);
	if ($popover) {
		$popover.remove();
	}
};

var animatingGLData = [];
var animationRequestId = null;
var cocosSpriteDataCache = {};

function startAnimatingCocosSprite (glData) {
	if (!glData.animating) {
		glData.animating = true;

		// add to list of animating gl data
		animatingGLData.push(glData);
		if (animatingGLData.length === 1) {
			animationRequestId = requestAnimationFrame(animateCocosSprites);
		}
	}
}

function stopAnimatingCocosSprite (glData) {
	if (glData.animating) {
		glData.animating = false;

		// find and remove gl data from list of animating gl data
		for (var i = 0, il = animatingGLData.length; i < il; i++) {
			if (animatingGLData[i] === glData) {
				animatingGLData.splice(i, 1);
				if (animatingGLData.length === 0) {
					cancelAnimationFrame(animationRequestId);
					animationRequestId = null;
				}
				break;
			}
		}
	}
}

function animateCocosSprites (frameTime) {
	for (var i = 0, il = animatingGLData.length; i < il; i++) {
		var glData = animatingGLData[i];
		animateCocosSprite(glData, frameTime);
	}

	// request animation for next frame if we're still animating
	if (animatingGLData.length > 0) {
		animationRequestId = requestAnimationFrame(animateCocosSprites);
	}
}

function animateCocosSprite (glData, frameTime) {
	// always check if we're still animating in case callback stopped animation
	if (glData.animating) {
		// increase frame time
		var lastLoops = glData.loops;
		var lastFrameTime = glData.frameTime || frameTime;
		glData.frameTime = frameTime;
		glData.frameDeltaTime += frameTime - lastFrameTime;
		if (glData.frameDeltaTime >= glData.currentSpriteData.frameDelay) {
			glData.frameDeltaTime = 0.0;
			changeCocosSpriteFrame(glData);
		}

		// do callback now that we've finished the animation
		if (lastLoops !== glData.loops && _.isFunction(glData.callback)) {
			glData.callback();
		}
	}
}

function changeCocosSpriteFrame (glData) {
	// update frame
	var frame = glData.currentSpriteData.frames[glData.frameIndex];
	glData.frameIndex++;
	if (glData.frameIndex >= glData.currentSpriteData.frames.length) {
		glData.loops++;

		// check if we need to switch sprite data
		if (!glData.specialShown && glData.currentSpriteData !== glData.specialSpriteData) {
			glData.specialShown = true;

			// switch to special sprite
			glData.currentSpriteData = glData.specialSpriteData;

			// play sound for special sprite
			glData.audioTimeoutId = setTimeout(function () {
				playSpecialSound(glData);
			}, 250);
		} else if (glData.currentSpriteData !== glData.spriteData) {
			// reset to origin sprite data
			glData.currentSpriteData = glData.spriteData;
		}

		// reset sprite to first frame
		glData.frameIndex = 0;
	}

	drawCocosSprite(glData, frame);
}

function drawCocosSprite (glData, frame) {
	var x = (frame.x || 0.0) + glData.offset.x;
	var y = (frame.y || 0.0) + glData.offset.y;
	glData.$element.css("background-position", "-" + x + "px -" + y + "px");
}

function playSpecialSound (glData) {
	UtilsUI.resetCocosSound(glData.specialSoundData);
	if (glData.specialSoundData.sound) {
		glData.audio = audio_engine.current().play_effect(glData.specialSoundData.sound, false);
	}
}

/**
 * Extracts cocos2d sprite data for CSS, by assuming in order: animation from cache, static sprite from cache, direct path to resource.
 * @param spriteIdentifier
 */
UtilsUI.getCocosSpriteData = function (spriteIdentifier) {
	if (spriteIdentifier != null) {
		var spriteData = cocosSpriteDataCache[spriteIdentifier];
		if (spriteData == null) {
			spriteData = {
				spriteIdentifier: spriteIdentifier,
				frames: []
			};

			// find or create animation
			var animation = cc.animationCache.getAnimation(spriteIdentifier);
			if (animation != null) {
				// prefer animation first
				spriteData.frameDelay = animation.getDelayPerUnit() * 1000.0;
				var frames = animation.getFrames();
				for (var i = 0, il = frames.length; i < il; i++) {
					var frame = frames[i];
					spriteData.frames.push(UtilsUI.getCocosSpriteFrameData(frame.getSpriteFrame()));
				}
			} else {
				var spriteFrame = cc.spriteFrameCache.getSpriteFrame(spriteIdentifier);
				if (spriteFrame != null) {
					// prefer static sprite frame second
					spriteData.frames.push(UtilsUI.getCocosSpriteFrameData(spriteFrame));
				} else {
					// assume sprite identifier is a direct path
					var texture = cc.textureCache.getTextureForKey(spriteIdentifier);
					if (texture != null) {
						var textureWidth = texture.getPixelsWide();
						var textureHeight = texture.getPixelsHigh();
						spriteData.frames.push({
							imgPath: spriteIdentifier,
							texture: texture,
							x: 0, y: 0,
							width: textureWidth,
							height: textureHeight,
							textureWidth: textureWidth,
							textureHeight: textureHeight
						});
					}
				}
			}

			// when has frames
			var frame = spriteData.frames[0];
			if (frame != null) {
				// get path and texture from first frame
				spriteData.imgPath = frame.imgPath;
				spriteData.texture = frame.texture;

				// cache sprite data
				cocosSpriteDataCache[spriteIdentifier] = spriteData;
			}
		}

		return spriteData;
	}
};

/**
 * Extracts relevant data for CSS from a cocos2d spriteFrame.
 * @param spriteFrame
 * @returns {{x: number, y: number, width: number, height: number, imgPath: string, textureWidth: number, textureHeight: number}}
 */
UtilsUI.getCocosSpriteFrameData = function (spriteFrame) {
	var rect = spriteFrame.getRectInPixels();
	var texture = spriteFrame.getTexture();
	return {
		imgPath: texture.url,
		texture: texture,
		x: rect.x,
		y: rect.y,
		width: rect.width,
		height: rect.height,
		textureWidth: texture.getPixelsWide(),
		textureHeight: texture.getPixelsHigh()
	};
};

/**
 * Shows a cocos2d animation in a canvas element from the data extracted by UtilsUI.getCocosSpriteData.
 * @param $element
 * @param glData
 * @param spriteData
 * @param {Boolean} [animated=true] whether sprite should be animated or just show first frame
 * @param {Function} [callback=null] callback to execute each time the animation finishes
 * @param {SDK.Card} [card] card to pull visual properties from
 * @param [specialSpriteData] special sprite/animation data to be played once
 * @param [specialSound] special sound to be played once
 * @param {Boolean} [scale] scale to draw at (defaults internally to CONFIG.SCALE)
 * @returns {glData}
 */
UtilsUI.showCocosSprite = function ($element, glData, spriteData, callback, animated, card, specialSpriteData, specialSound, scale) {
	if (animated == null) { animated = true; }
	if (scale == null) { scale = CONFIG.SCALE; }

	// reset gl data
	UtilsUI.resetCocosSprite(glData);

	if ($element instanceof $ && spriteData != null && spriteData.frames.length > 0) {
		var cardOptions = card && card.getCardOptions();
		var offset = cardOptions && cardOptions.offset;
		if (offset == null) { offset = {x: 0, y: 0}; }

		var frame = spriteData.frames[0];
		var width;
		var height;
		if (frame != null) {
			width = Math.max(0.0, frame.width);
			height = Math.max(0.0, frame.height);
			var textureWidth = Math.max(0.0, spriteData.texture.getPixelsWide());
			var textureHeight = Math.max(0.0, spriteData.texture.getPixelsHigh());
			$element.css({
				"background-image": 'url("' + spriteData.imgPath + '")',
				"background-size": textureWidth + "px " + textureHeight + "px",
				"background-repeat": "no-repeat",
				"transform": "scale(" + (scale * CONFIG.globalScale) + ")",
				"width": width,
				"height": height,
				"margin-left": -Math.floor(width * 0.5),
				"margin-top": -Math.floor(height * 0.5)
			});
		} else {
			width = height = 0.0;
		}

		// create as needed
		if (glData == null) {
			glData = {
				animating: false,
				audioTimeoutId: null,
				audio: null,
				callback: callback,
				currentSpriteData: null,
				$element: $element,
				frameDeltaTime: 0.0,
				frameIndex: 0,
				frameTime: 0.0,
				height: height,
				loops: 0,
				offset: offset,
				scale: scale,
				specialSpriteData: specialSpriteData,
				specialSoundData: {sound: specialSound},
				specialShown: specialSpriteData == null || specialSpriteData === spriteData,
				spriteData: spriteData,
				width: width
			}
		} else {
			if (glData.$element == null || !glData.$element.is($element)) glData.$element = $element;
			if (glData.callback !== callback) glData.callback = callback;
			if (glData.height !== height) glData.height = height;
			if (offset != null && (glData.offset == null || glData.offset.x !== offset.x || glData.offset.y !== offset.y)) glData.offset = offset;
			if (glData.specialSpriteData != spriteData) glData.specialSpriteData = specialSpriteData;
			if (glData.specialSoundData != spriteData) glData.specialSoundData = {sound: specialSound};
			if (glData.spriteData != spriteData) glData.spriteData = spriteData;
			if (glData.scale !== scale) glData.scale = scale;
			if (glData.width !== width) glData.width = width;
			glData.specialShown = glData.specialSpriteData == null || glData.specialSpriteData === glData.spriteData;
		}

		glData.currentSpriteData = glData.spriteData;

		// set first frame
		glData.frameIndex = glData.loops = 0;
		changeCocosSpriteFrame(glData);

		// start animating if more than 1 frame
		if (animated && glData.spriteData.frames.length > 1) {
			startAnimatingCocosSprite(glData);
		}
	}

	return glData;
};

/**
 * Resets cocos2d sprite by cleaning up the shared data returned by UtilsUI.showCocosSprite.
 * @param glData
 */
UtilsUI.resetCocosSprite = function (glData) {
	if (glData != null) {
		stopAnimatingCocosSprite(glData);

		glData.frameIndex = glData.loops = 0;
		glData.frameDeltaTime = glData.frameTime = 0.0;

		glData.scale = 1.0;
		glData.width = glData.height = 0.0;

		UtilsUI.resetCocosSound(glData);
	}

	return glData;
};

UtilsUI.resetCocosSound = function (glData) {
	if (glData) {
		if (glData.audioTimeoutId != null) {
			clearTimeout(glData.audioTimeoutId);
			glData.audioTimeoutId = null;
		}
		if (glData.audio != null) {
			audio_engine.current().stop_effect(glData.audio);
			glData.audio = null;
		}
	}
	return glData;
};

UtilsUI.releaseCocosSprite = function (glData) {
	if (glData) {
		glData.$element = null;
	}
	UtilsUI.resetCocosSprite(glData);
};
