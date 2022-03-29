
// this script reads every file that may use RSX and replaces the old behavior of RSX.USE.resourceAlias with RSX.resourceAlias.resourceProperty

(function () {
	var Promise = require("bluebird");
	var _ = require("underscore");
	var j2j = require("j2j");
	var helpers = require('./../../../scripts/helpers');
	var RSX = require('./../../common/resources.js');
	var ANIMS = require('./../../data/animations.js');
	var CONFIG = require('./../../common/config');

	// refactor resources file
	var RSX_SOURCE_MAP = {};
	var RSX_FLAT_MAP = {};
	var RSX_REPLACE_MAP = {};
	var RSX_USAGE_MAP = _.extend({}, ANIMS);
	var generateResourcesMaps = function () {
		var walkRSX = function (obj, parentPath) {
			for (var key in obj) {
				var rsxPath = obj[key];

				// update path
				var sourcePath =  parentPath + "." + key;

				if (_.isObject(rsxPath)) {
					// recursively search
					walkRSX(rsxPath, sourcePath);
				} else {
					// convert key/values to new convention
					var flatPath = helpers.getContentAfterLastDot(sourcePath);
					var ext = helpers.getContentAfterLastDot(rsxPath);

					// remove existing filetypes
					// plist tacked on at end
					flatPath = flatPath.replace(/_plist(?!_plist)/g, "");
					// fnt tacked on at end
					flatPath = flatPath.replace(/_fnt(?!_fnt)/g, "");
					// particle prefixes
					flatPath = flatPath.replace(/^p(?=[A-Z])|^part_|^w3p_/, "");
					// misc useless words
					flatPath = flatPath.replace(/sound|_particles|_particle|_png/, "");
					// unncessary prefixes
					flatPath = flatPath.replace(/^w3|^img_|^audio_|^plist_|^font_/, "");

					// force path to underscore case
					flatPath = flatPath.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();

					// get filetype
					var isImg = ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "bmp" || ext === "gif";
					var isAudio = ext === "ogg" || ext === "wav" || ext === "mp3" || ext === "mp4" || ext === "m4a";
					var isPlist = ext === "plist";
					var isFont = ext === "ttf" || ext === "fnt" || ext === "font" || ext === "eot" || ext === "woff" || ext === "svg";

					// set name for usage data
					var name = flatPath;

					// ensure prefix for specific resource types
					if (/resources\/particles\//.test(rsxPath) && /^(?!ptcl_).+/.test(name)) {
						name = "ptcl_" + name;
					} else if (/resources\/sfx\//.test(rsxPath) && /^(?!sfx_).+/.test(name)) {
						name = "sfx_" + name;
					} else if (/resources\/music\//.test(rsxPath) && /^(?!music_).+/.test(name)) {
						name = "music_" + name;
					}

					// search anims for this rsxPath
					// if it already exists, skip adding this rsxPath
					// and change the name for replace to the existing alias
					var exists = false;
					for (var animAlias in ANIMS) {
						var animData = ANIMS[animAlias];
						if (rsxPath === animData.img || rsxPath === animData.plist || rsxPath === animData.audio || rsxPath === animData.font) {
							exists = true;
							name = animAlias;
							break;
						}
					}

					if (!exists) {
						// get or initialize usage data
						var usageData = RSX_USAGE_MAP[name];
						var replaceName = name;
						if (usageData == null) {
							usageData = RSX_USAGE_MAP[name] = {name: name};
						}

						// set usage data
						if (isImg) {
							usageData.img = rsxPath;
							replaceName += ".img";
						}
						if (isPlist) {
							usageData.plist = rsxPath;
							replaceName += ".plist";
						}
						if (isAudio) {
							usageData.audio = rsxPath;
							replaceName += ".audio";
						}
						if (isFont) {
							usageData.font = rsxPath;
							replaceName += ".font";
						}
					}

					// map paths
					RSX_SOURCE_MAP[sourcePath] = rsxPath;
					RSX_REPLACE_MAP[sourcePath] = replaceName;
				}
			}
		};

		// walk rsx to generate maps
		walkRSX(RSX, "RSX");

		// for each usage
		var RSX_USAGE_MAP_SORT = [];
		for (var key in RSX_USAGE_MAP) {
			var resource = RSX_USAGE_MAP[key];

			// ignore non-objects
			if (_.isObject(resource) && !_.isFunction(resource)) {
				// add extra quotes to flag properties as needing quotes
				if (resource.name != null) {
					resource.name = '"' + resource.name + '"';
				}
				if (resource.img != null) {
					resource.img = '"' + resource.img + '"';
				}
				if (resource.plist != null) {
					resource.plist = '"' + resource.plist + '"';
				}
				if (resource.font != null) {
					resource.font = '"' + resource.font + '"';
				}
				if (resource.audio != null) {
					resource.audio = '"' + resource.audio + '"';
				}
				if (resource.framePrefix != null) {
					resource.framePrefix = '"' + resource.framePrefix + '"';
				}

				resource._key = key;

				RSX_USAGE_MAP_SORT.push(resource);
			}
		}

		// sort usage map
		RSX_USAGE_MAP_SORT.sort(function (a, b) {
			// sort by folder name
			var aFolder = a.font || a.audio || a.plist || a.img;
			aFolder = aFolder.replace(/resources\/(.*?)\/.*?$/, "$1");
			var bFolder = b.font || b.audio || b.plist || b.img;
			bFolder = bFolder.replace(/resources\/(.*?)\/.*?$/, "$1");
			return aFolder.localeCompare(bFolder) || a.name.localeCompare(b.name);
		});

		var RSX_USAGE_MAP_SORTED = {};
		for (var i = 0; i < RSX_USAGE_MAP_SORT.length; i++) {
			var resource = RSX_USAGE_MAP_SORT[i];
			var key = resource._key;
			delete resource._key;
			RSX_USAGE_MAP_SORTED[key] = resource;
		}

		// convert resources map to json
		var resourcesJSON = j2j.output(RSX_USAGE_MAP_SORTED);

		// preserve escaped quotes and strip all other quotes
		resourcesJSON = resourcesJSON.replace(/\\("|')/g, "$1");
		resourcesJSON = resourcesJSON.replace(/["'](?!["'])/g, "");

		// remove line breaks to compress data
		resourcesJSON = resourcesJSON.replace(/([^\}]),\n[\s\t]*?(\w)/g, "$1, $2");
		resourcesJSON = resourcesJSON.replace(/(.*?): \{[\r\n\s\t]*([\s\S]*?)[\r\n\s\t]*\}/g, "$1: {$2}");

		// write resources
		var resourcesContent = "";
		resourcesContent += '/**\n';
		resourcesContent += ' * Resource.js - map of resource usage data to resources.\n';
		resourcesContent += '*/\n\n';
		resourcesContent += "var RSX = " + resourcesJSON + ";";
		resourcesContent += "\nmodule.exports = RSX;\n";
		return helpers.writeFile("./../../data/resources.js", resourcesContent);
	};

	var RSX_ALIASES = [];
	var RSX_REPLACE_FAILURES = {};
	var replaceRSXInFile = function (file, content) {
		// replace resources require
		content = content.replace(/common\/resources/, "data/resources");
		content = content.replace(/(data|common)\/resources.json/, "data/resources.js");
		content = content.replace(/data\/resources.js/, "data/resources");

		// replace animations
		content = content.replace(/[\r\n].*?(data|common)\/animations.*?[\r\n]/, "");
		content = content.replace(/ANIMS([\.\[])/g, "RSX$1");

		// check for aliased resources require that need changed by hand
		if (/require\(["'\s\t]*?resources["'\s\t]*?\)/g.test(content)) {
			RSX_ALIASES.push(file);
		}

		// replace resources usage
		var usesResources = false;
		content = content.replace(/RSX\.([a-zA-Z_]*?)\.(.*?)(?=\W)/g, function (match, p1, p2) {
			usesResources = true;
			var replaceName = RSX_REPLACE_MAP["RSX." + p1 + "." + p2];
			//console.log(" > ", match, p1, p2, " === ", fwdBkwdData);
			if (replaceName != null) {
				var ref = "RSX." + replaceName;
				//console.log(" > ", match, " === ", ref);
				return ref;
			} else {
				return match;
			}
		});

		// check for failed resource replace
		content.replace(/RSX\.([A-Z\[]+).*?[\r\n]|ANIMS.*?[\r\n]/g, function (match) {
			if (RSX_REPLACE_FAILURES[file] == null) {
				RSX_REPLACE_FAILURES[file] = [];
			}
			var failure = match.replace(/[\r\n\t]*/g, "").replace(/\\r|\\n|\\t/g, "").replace(/\s+/g, " ");
			RSX_REPLACE_FAILURES[file].push(failure);
			return match;
		});

		// check for files that have no resources require but use resources
		if (usesResources && !(/data\/resources/.test(content))) {
			RSX_ALIASES.push(file);
		}

		return helpers.writeFile(file, content);
	};

	// read all files and exit when complete
	console.log("Refactor Resources -> BEGIN");
	generateResourcesMaps().then(function () {
		return Promise.all([
			helpers.readFile("./../../application.coffee", replaceRSXInFile),
			helpers.recursivelyReadDirectoryAndFilesSync("./../../audio", replaceRSXInFile),
			helpers.recursivelyReadDirectoryAndFilesSync("./../../sdk", replaceRSXInFile),
			helpers.recursivelyReadDirectoryAndFilesSync("./../../ui", replaceRSXInFile),
			helpers.recursivelyReadDirectoryAndFilesSync("./../../view", replaceRSXInFile)
		]);
	}).then(function () {
		var log = { aliases: RSX_ALIASES, failures: RSX_REPLACE_FAILURES };
		var logContent = j2j.output(log);
		logContent = logContent.replace(/\\("|')/g, "$1");
		logContent = logContent.replace(/["'](?!["'])/g, "");
		return helpers.writeFile("./../../data/RSX_REFACTOR_LOG.txt", logContent);
	}).then(function () {
		console.log("Refactor Resources -> COMPLETED");
		process.exit(0);
	});
})();
