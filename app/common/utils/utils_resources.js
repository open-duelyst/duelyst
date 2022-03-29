/****************************************************************************
  UtilsResources - resource utility methods
 ****************************************************************************/
var UtilsResources = {};

/**
 * Return extension from a resource path.
 * @param {String} resourcePath
 * @return {String}
 */
UtilsResources.getExt = function (resourcePath) {
	// fast ext: http://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript
	return resourcePath.substr((~-resourcePath.lastIndexOf(".") >>> 0) + 2).toLowerCase();
};

/**
 * Return whether a resource path is for an image resource.
 * @param {String} resourcePath
 * @return {Boolean}
 */
UtilsResources.getPathIsForImage = function (resourcePath) {
	return UtilsResources.getExtIsForImage(UtilsResources.getExt(resourcePath));
};

/**
 * Return whether an extension is for an image resource.
 * @param {String} ext
 * @return {Boolean}
 */
UtilsResources.getExtIsForImage = function (ext) {
	return ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "bmp" || ext === "gif";
};

/**
 * Return whether a resource path is for an audio resource.
 * @param {String} resourcePath
 * @return {Boolean}
 */
UtilsResources.getPathIsForAudio = function (resourcePath) {
	return UtilsResources.getExtIsForAudio(UtilsResources.getExt(resourcePath));
};

/**
 * Return whether an extension is for an audio resource.
 * @param {String} ext
 * @return {Boolean}
 */
UtilsResources.getExtIsForAudio = function (ext) {
	return ext === "ogg" || ext === "wav" || ext === "mp3" || ext === "mp4" || ext === "m4a";
};

/**
 * Return whether a resource path is for a plist resource.
 * @param {String} resourcePath
 * @return {Boolean}
 */
UtilsResources.getPathIsForPlist = function (resourcePath) {
	return UtilsResources.getExtIsForPlist(UtilsResources.getExt(resourcePath));
};

/**
 * Return whether an extension is for a plist resource.
 * @param {String} ext
 * @return {Boolean}
 */
UtilsResources.getExtIsForPlist = function (ext) {
	return ext === "plist";
};

/**
 * Return whether a resource path is for a font resource.
 * @param {String} resourcePath
 * @return {Boolean}
 */
UtilsResources.getPathIsForFont = function (resourcePath) {
	return UtilsResources.getExtIsForFont(UtilsResources.getExt(resourcePath));
};

/**
 * Return whether an extension is for a font resource.
 * @param {String} ext
 * @return {Boolean}
 */
UtilsResources.getExtIsForFont = function (ext) {
	return ext === "ttf" || ext === "fnt" || ext === "font" || ext === "eot" || ext === "woff" || ext === "svg";
};

/**
 * Return whether a resource data object is for an animation.
 * @param {Object} resourceData
 * @return {Boolean}
 */
UtilsResources.getIsResourceForAnimation = function (resourceData) {
	return resourceData.frameDelay != null && resourceData.img != null && resourceData.plist != null;
};

/**
 * Return whether a resource data object is for a sprite frame.
 * @param {Object} resourceData
 * @return {Boolean}
 */
UtilsResources.getIsResourceForSpriteFrame = function (resourceData) {
	return resourceData.plist != null && resourceData.frame != null;
};

/**
 * Return whether a resource data object is for a texture.
 * @param {Object} resourceData
 * @return {Boolean}
 */
UtilsResources.getIsResourceForTexture = function (resourceData) {
	return resourceData.img != null;
};

/**
 * Return whether a resource data object is for a cubemap.
 * @param {Object} resourceData
 * @return {Boolean}
 */
UtilsResources.getIsResourceForCubemap = function (resourceData) {
	return resourceData.imgPosX != null;
};

/**
 * Return whether a resource data object is for a font.
 * @param {Object} resourceData
 * @return {Boolean}
 */
UtilsResources.getIsResourceForFont = function (resourceData) {
	return resourceData.font != null;
};

/**
 * Return whether a resource data object is for an audio resource.
 * @param {Object} resourceData
 * @return {Boolean}
 */
UtilsResources.getIsResourceForAudio = function (resourceData) {
	return resourceData.audio != null;
};

/**
 * Returns a list of frame keys from a plist file.
 * @param {String} plist key
 * @param {String} [framePrefix=null]
 * @param {Boolean} [exactMatch=false]
 * @return {Array}
 */
UtilsResources.getFrameKeys = function (plist, framePrefix, exactMatch) {
	var frameKeys = [];

	// find all frame keys from the frame cache
	var frameConfigCache = cc.spriteFrameCache._frameConfigCache;
	var frameData = frameConfigCache[plist];
	if (frameData != null) {
		var frameRegExp;
		if (exactMatch) {
			frameRegExp = new RegExp("^" + framePrefix + "\(\?\=\\b\)");
		} else {
			frameRegExp = new RegExp("^" + framePrefix + "\(\?\=\[0\-9\\.\\b\]\)");
		}
		var frames = frameData.frames;
		var framesKeys = Object.keys(frames);
		for (var i = 0, il = framesKeys.length; i < il; i++) {
			var frameKey = framesKeys[i];
			if (frameRegExp.test(frameKey)) {
				frameKeys.push(frameKey);
			}
		}
	}

	// sort keys in ascending order
	frameKeys.sort(function (a, b) {
		var aNums = a.match(/\d+/g);
		var bNums = b.match(/\d+/g);
		var aNum = parseInt(aNums && aNums[aNums.length - 1]);
		var bNum = parseInt(bNums && bNums[bNums.length - 1]);
		return !isNaN(aNum) && !isNaN(bNum) ? aNum - bNum : 0;
	});
	return frameKeys;
};

/**
 * Returns a list of resource paths from a list of resource data objects.
 * @param {Array} resources
 * @return {Array}
 */
UtilsResources.getResourcePathsFromResources = function (resources) {
	var resourcePaths = [];
	for (var i = 0, il = resources.length; i < il; i++) {
		var resource = resources[i];
		if (resource.img != null) { resourcePaths.push(resource.img); }
		if (resource.plist != null) { resourcePaths.push(resource.plist); }
		if (resource.audio != null) { resourcePaths.push(resource.audio); }
		if (resource.font != null) { resourcePaths.push(resource.font); }
	}
	resourcePaths = _.uniq(resourcePaths);
	return resourcePaths;
};

/**
 * Returns a list of sprite frames that use a texture.
 * @param {cc.Texture2D} texture
 * @returns {Array}
 */
UtilsResources.getSpriteFramesUsingTexture = function (texture) {
	var spriteFramesUsingTexture = [];

	if (texture != null) {
		// search sprite frames for texture
		var spriteFrames = cc.spriteFrameCache._spriteFrames;
		var spriteFramesKeys = Object.keys(spriteFrames);
		for (var i = 0, il = spriteFramesKeys.length; i < il; i++) {
			var spriteFrameKey = spriteFramesKeys[i];
			var spriteFrame = spriteFrames[spriteFrameKey];
			// matching spriteFrame
			if (spriteFrame && (spriteFrame.getTexture() === texture)) {
				spriteFramesUsingTexture.push(spriteFrame);
			}
		}
	}

	return spriteFramesUsingTexture;
};

/**
 * Returns a list of animations that use a sprite frame.
 * @param {cc.SpriteFrame} spriteFrame
 * @returns {Array}
 */
UtilsResources.getAnimationsUsingSpriteFrame = function (spriteFrame) {
	var animationsUsingSpriteFrame = [];

	if (spriteFrame != null) {
		// search animations for sprite frame
		var animations = cc.animationCache._animations;
		var animationsKeys = Object.keys(animations);
		for (var i = 0, il = animationsKeys.length; i < il; i++) {
			var animationKey = animationsKeys[i];
			var animation = animations[animationKey];
			if (animation) {
				var animationFrames = animation.getFrames();
				for (var j = 0, jl = animationFrames.length; j < jl; j++) {
					var animationFrame = animationFrames[j];
					var animationSpriteFrame = animationFrame.getSpriteFrame();
					if (animationSpriteFrame === spriteFrame) {
						animationsUsingSpriteFrame.push(animation);
						break;
					}
				}
			}
		}
	}

	return animationsUsingSpriteFrame;
};

module.exports = UtilsResources;
