
// this script converts the AnimationSetup file to an object map and writes animations.js

(function () {
	var Promise = require("bluebird");
	var _ = require("underscore");
	var j2j = require("j2j");
	var helpers = require('./../../../scripts/helpers');
	var RSX = require('./../../common/resources.js');
	var CONFIG = require('./../../common/config');

	// read animation setup and generate animation map
	var generateAnimationMap = function (file, content) {
		var RSX_ANIM_MAP = {};
		var parts = content.split(/(?=cc\.spriteFrameCache\.addSpriteFrames)/g);
		for (var i = 0; i < parts.length; i++) {
			var part = parts[i];
			var plistAlias = part.match(/cc\.spriteFrameCache\.addSpriteFrames\((.*?)\)/);
			if (plistAlias != null && plistAlias.length > 1) {
				plistAlias = plistAlias[1].replace(/RSX\.|\s|\t|"|'/g, "");
				var plistAliasParts = plistAlias.split(".");
				var plist = RSX;
				for (var j = 0; j < plistAliasParts.length; j++) {
					plist = plist[plistAliasParts[j]];
					if (plist == null) {
						console.log("generateAnimationMap -> plist ", plistAlias, "does not exist in RSX");
						break;
					}
				}

				var imgAlias = plistAlias.replace("plist_", "img_");
				var imgAliasParts = imgAlias.split(".");
				var img = RSX;
				for (var j = 0; j < imgAliasParts.length; j++) {
					img = img[imgAliasParts[j]];
					if (img == null) {
						console.log("generateAnimationMap -> img ", imgAlias, "does not exist in RSX");
						break;
					}
				}

				var animations = part.match(/.*?(AnimationSetup|this)\.addAnimation\(.*?[\n|\r]/g) || [];
				//console.log(animations);
				for (var j = 0; j < animations.length; j++) {
					var animation = animations[j];
					animation = animation.replace(/.*?\((.*?)\).*?[\n|\r]/, "$1").replace(/\s|\t|"|'/g, "");
					var animationParts = animation.split(/,/g);
					var animationName = animationParts[5];
					//console.log(animationParts[5]);
					RSX_ANIM_MAP[animationName] = {
						// add extra quotes to flag properties as needing quotes
						name: '"' + animationName + '"',
						img: "RSX." + imgAlias,
						plist: "RSX." + plistAlias,
						framePrefix: '"' + animationParts[0] + '"',
						frameDelay: parseFloat(animationParts[4])
					};
				}
			}
		}

		// convert resources map to json
		var resourcesJSON = j2j.output(RSX_ANIM_MAP);

		// preserve escaped quotes and strip all other quotes
		resourcesJSON = resourcesJSON.replace(/\\("|')/g, "$1");
		resourcesJSON = resourcesJSON.replace(/["'](?!["'])/g, "");

		// remove line breaks to compress data
		resourcesJSON = resourcesJSON.replace(/([^\}]),\n[\s\t]*?(\w)/g, "$1, $2");
		resourcesJSON = resourcesJSON.replace(/(.*?): \{[\r\n\s\t]*([\s\S]*?)[\r\n\s\t]*\}/g, "$1: {$2}");

		// write resources
		var resourcesContent = "";
		resourcesContent += 'var RSX = require("./../common/resources");\n\n';
		resourcesContent += '/**\n';
		resourcesContent += ' * Animations.js - map of resource aliases to resources.\n';
		resourcesContent += '*/\n\n';
		resourcesContent += "var ANIMS = " + resourcesJSON + ";";
		resourcesContent += "\n\nmodule.exports = ANIMS;\n}";
		return helpers.writeFile("./../../data/animations.js", resourcesContent);
	};

	// read all files and exit when complete
	console.log("Refactor Animations -> BEGIN");
	helpers.readFile("./../../view/helpers/AnimationSetup.js", generateAnimationMap).then(function () {
		console.log("Refactor Animations -> COMPLETED");
		process.exit(0);
	});
})();
