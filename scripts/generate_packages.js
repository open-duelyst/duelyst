/**
 * This script generates resource packages for dynamic loading by parsing all source files.
 * To add resources used in a source file to a specific package, add the following comment:
 * //pragma PKGS: package_name_1 package_name_2 package_name_n
 */
(function () {
	var dir = __dirname;

	// parse arguments for flags
	var args = process.argv.slice(2);
	var debug;
	var forceAllResources;
	for (var a = 0; a < args.length; a++) {
		var arg = args[a];
		if (arg === "-d" || arg === "-debug") {
			debug = true;
		} else if (arg === "-fa" || arg === "-force-all-resources") {
			forceAllResources = true;
		}
	}
	const path = require('path')
	require('app-module-path').addPath(path.join(__dirname, '..'))
	var Promise = require("bluebird");
	var _ = require("underscore");
	var j2j = require("j2j");
	var helpers = require("./helpers");
	var coffeScript = require('coffee-script/register');
	var Cards = require("app/sdk/cards/cardsLookupComplete.coffee");
	var FactionsLookup = require("app/sdk/cards/factionsLookup.coffee");
	var FactionFactory = require("app/sdk/cards/factionFactory.coffee");
	var CodexChapters = require("app/sdk/codex/codexChapterLookup.coffee");
	var CosmeticsLookup = require("app/sdk/cosmetics/cosmeticsLookup.coffee");
	var CONFIG = require("app/common/config.js");
	var UtilsJavascript = require("app/common/utils/utils_javascript.js");
	var DATA = require("app/data.coffee");
	var FX = require("app/data/fx.js");
	var RSX = require("app/data/resources.js");
	var PKGS_DEF = require("app/data/packages_predefined.js");
	var PKGS = {};

	var getResources = function (resourceIdentifier) {
		var resources = [];

		// get direct resource
		var resource = RSX[resourceIdentifier];
		if (resource != null) {
			resources.push(resource);
		}

		// reverse map
		resources = resources.concat(RSX.getResourcesByPath(resourceIdentifier));

		return resources;
	};

	var RSX_MAP = {};
	var RSX_NON_ALIASED = [];
	var RSX_NON_ALIASED_MATCHES = {};
	var WARN_WHEN_REQUIRES_MORE_RSX_THAN = 50;

	var getRelativePath = function (file) {
		return path.relative(__dirname, file).replace(/^(\.\.[\/\\])*?(?=\w)/, "");
	};

	var resourcesForFile = function (file, content) {
		// search for rsx key partials
		var resources = [];
		var dynamicResources = [];

		// setup method to parse partials
		var parsePartials = function (match, p1) {
			if (!/getResourcePathForScale/i.test(match)) {
				var partials;
				var isDynamic;
				var partialAtBeginning = true;
				if (/RSX\[/.test(match)) {
					isDynamic = true;
					// filter for partials that begin with a set of quotes
					partials = p1.match(/"(?:[^"])*"|'(?:[^'])*'/g) || [];
					partialAtBeginning = partials.length <= 1;
					partials = _.map(partials, function (partial) {
						return partial.replace(/["']/g, "");
					});
					partials = _.reject(partials, function (partial) {
						return !partial || partial.length < 2 || !isNaN(parseInt(partial));
					});
				} else {
					isDynamic = false;
					partials = [p1];
				}

				// search for partial key matches in RSX
				var matchFound = false;
				for (var i = 0, il = partials.length; i < il; i++) {
					var partial = partials[i];
					var partialEscaped = UtilsJavascript.escapeStringForRegexSearch(partial);
					var resourceMatchRegExp = new RegExp((partialAtBeginning ? "^" : "") + partialEscaped);
					for (var key in RSX) {
						var resource = RSX[key];
						if (!_.isFunction(resource)
							&& (resourceMatchRegExp.test(key)
							|| (resource.img != null && resourceMatchRegExp.test(resource.img))
							|| (resource.plist != null && resourceMatchRegExp.test(resource.plist))
							|| (resource.audio != null && resourceMatchRegExp.test(resource.audio))
							|| (resource.font != null && resourceMatchRegExp.test(resource.font)))
						) {
							if (/getResourcePathForScale/i.test(match)) {
								console.log(match, p1, "getResourcePathForScale match", key);
							}
							matchFound = true;
							if (isDynamic) {
								dynamicResources.push(key);
							} else {
								resources.push(key);
							}
						}
					}
				}

				if (debug && !matchFound) {
					console.log(" [GP] [WARN] " + getRelativePath(file) + " -> matched RSX search but no resource could be found for: " + match);
				}
			}
		};

		content.replace(/(?:RSX[.\[]{1})(.*?)(?=\]|\.name|\.img|\.plist|\.audio|\.font|\.framePrefix|\.frame)/g, parsePartials);
		content.replace(/(?:RSX\.)(\w+)/g, parsePartials);

		// search for data key partials
		content.replace(/(?:DATA\..*?)\(["'](.*?)["']\)/g, function (match, p1) {
			resources = resources.concat(resourcesForFXResourceStrings(p1));
		});

		return {resources: resources, dynamicResources: dynamicResources};
	};

	var mapResourcesForFile = function (file, content) {
		var relativePath = getRelativePath(file);

		// replace soft returns
		content = content.replace("\r", "\n");

		// check for package flag
		// do this before stripping comments as this flag may be in a comment
		var pkgNames = [];
		var pkgFlagsBlocks = content.match(/pragma[\s\t]*?PKGS:.*?[\r\n]/);
		if (pkgFlagsBlocks != null) {
			for (var i = 0; i < pkgFlagsBlocks.length; i++) {
				var pkgFlagBlock = pkgFlagsBlocks[i].replace(/pragma[\s\t]*?PKGS:[\s\t]*?(.*?)[\r\n]/, "$1").replace(/\t/g, " ").replace(/^\s*(.*?)\s*$/, "$1").replace(/\s+/g, " ");
				pkgNames = pkgNames.concat(pkgFlagBlock.split(" "));
			}
		}

		// remove comments
		content = helpers.stripComments(content);

		var resourcesData = resourcesForFile(file, content);
		var resources = resourcesData.resources;
		var dynamicResources = resourcesData.dynamicResources;
		if (resources.length > 0 || dynamicResources.length > 0) {
			// store resources in map by relative path
			RSX_MAP[relativePath] = [].concat(resources, dynamicResources);

			// add resources to packages
			for (var i = 0; i < pkgNames.length; i++) {
				var pkgName = pkgNames[i];
				addPkgResources(pkgName, resources);
			}

			// add dynamic resources to all package
			addPkgResources("all", dynamicResources);
		}

		// search for non-aliased paths in file and add to all resources only
		// these resource usages should only ever be in template(hbs) or style(css/scss) files
		// and those don't get loaded dynamically but rather as the styling is applied
		// NOTE: this will attempt to handle dynamic resource usage in template files (ex: resources/crests/crest_{{faction_id}}.png)
		content.replace(/[\/\\]?resources[\/\\].*?['"({]?.*?['")}]/g, function (match) {
			// trim match for last quote
			match = match.replace(/(.*\w)['")}].*$/, "$1");
			// filter for dynamic resource usage
			var partial = match.replace(/([\/\\]?resources[\/\\][^.]*?)['"({].*$/, "$1");
			var ext = helpers.getContentAfterLastDot(match);
			ext = ext && ext.toLowerCase();
			var needsPartialMatch = partial !== match || !ext;

			var resources;
			if (needsPartialMatch) {
				// search for partial key matches in RSX
				resources = [];
				var resourceMatchRegExp = new RegExp("^" + UtilsJavascript.escapeStringForRegexSearch(partial));
				for (var key in RSX) {
					var resource = RSX[key];
					if (resourceMatchRegExp.test(key)
						|| (resource.img != null && resourceMatchRegExp.test(resource.img))
						|| (resource.plist != null && resourceMatchRegExp.test(resource.plist))
						|| (resource.audio != null && resourceMatchRegExp.test(resource.audio))
						|| (resource.font != null && resourceMatchRegExp.test(resource.font))
					) {
						resources.push(resource);
					}
				}
			} else {
				// get resources from exact match
				resources = getResources(match);
			}

			if (resources != null && resources.length > 0) {
				for (var i = 0, il = resources.length; i < il; i++) {
					var resource = resources[i];
					var resourceKey = RSX.getResourceKeyByResourceName(resource.name);
					RSX_NON_ALIASED.push("RSX." + resourceKey);
				}
			} else if (!needsPartialMatch) {
				if (RSX_NON_ALIASED_MATCHES[match] == null) {
					// make temporary resource and add to list of non aliased resources
					var resource = {
						name: '"' + helpers.getFileName(match) + '"'
					};
					if (ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "bmp" || ext === "gif") {
						resource.img = '"' + match + '"';
					} else if (ext === "ogg" || ext === "wav" || ext === "mp3" || ext === "mp4" || ext === "m4a") {
						resource.audio = '"' + match + '"';
					} else if (ext === "ttf" || ext === "fnt" || ext === "font" || ext === "eot" || ext === "woff" || ext === "svg") {
						resource.font = '"' + match + '"';
					} else if (ext === "plist") {
						resource.plist = '"' + match + '"';
					}
					if (resource.img != null || resource.audio != null || resource.font != null || resource.plist != null) {
						RSX_NON_ALIASED.push(resource);
						RSX_NON_ALIASED_MATCHES[match] = resource;

						if (resource.img != null && helpers.getContentAfterLastDot(file).toLowerCase() !== "css") {
							// when not processing css, add versions at all resolutions
							var resourceName = resource.name.replace(/['"]/g, "");
							var imagePath = resource.img.replace(/['"]/g, "");
							var indexOfExt = imagePath.lastIndexOf(".");
							for (var j = CONFIG.RESOURCE_SCALES.length - 1; j >= 0; j--) {
								var resourceScale = CONFIG.RESOURCE_SCALES[j];
								var imagePathScaled = imagePath.substring(0, indexOfExt) + '@' + resourceScale + 'x' + imagePath.substring(indexOfExt);
								var resourceScaled = {
									name: '"' + resourceName + '@' + resourceScale + 'x' + '"',
									img: '"' + imagePathScaled + '"'
								};
								RSX_NON_ALIASED.push(resourceScaled);
								RSX_NON_ALIASED_MATCHES[imagePathScaled] = resourceScaled;
							}
						}
					} else {
						console.log(" [GP] [WARN] " + getRelativePath(file) + " -> has non aliased empty resource: " + match);
					}
				}
			} else if (debug) {
				console.log(" [GP] [WARN] " + getRelativePath(file) + " -> has non aliased path that may not get loaded: " + match);
			}
		});

		return Promise.resolve();
	};

	var SDK_FX_RESOURCE_MAP = {};
	var SDK_RESOURCE_MAP = {};
	var SDK_ACTION_MAP = {};
	var SDK_MODIFIER_MAP = {};
	var SDK_SUPERCLASS_MAP = {};
	var mapResourcesForSDKFile = function (file, content) {
		var promise = mapResourcesForFile(file, content);
		var fileName = helpers.getFileName(file);
		var className = fileName[0].toUpperCase() + fileName.slice(1);

		// remove comments and soft returns
		content = helpers.stripComments(content).replace("\r", "\n");

		// look for fx resource in file
		var fxResourceBlocks = content.match(/(fxResource|cardFXResource)[\s\t]*?[:=][\s\t]*?[^null][\s\S]*?\]/g);
		if (fxResourceBlocks != null && fxResourceBlocks.length > 0) {
			for (var i = 0, il = fxResourceBlocks.length; i < il; i++) {
				var fxResourceBlock = fxResourceBlocks[i];
				var fxResourceMatches = fxResourceBlock.match(/["']FX\..*?["']/g);
				if (fxResourceMatches != null && fxResourceMatches.length > 0) {
					for (var j = 0; j < fxResourceMatches.length; j++) {
						var fxResourceMatch = fxResourceMatches[j].replace(/["']/g, "");
						if (SDK_FX_RESOURCE_MAP[className] == null) {
							SDK_FX_RESOURCE_MAP[className] = [];
						}
						SDK_FX_RESOURCE_MAP[className].push(fxResourceMatch);
					}
				}
			}
		}

		// look for resources in file
		var resourcesData = resourcesForFile(file, content);
		var resources = resourcesData.resources;
		var dynamicResources = resourcesData.dynamicResources;
		if (resources.length > 0 || dynamicResources.length > 0) {
			var allResources = [].concat(resources, dynamicResources);
			addPkgResources("all", allResources);
			SDK_RESOURCE_MAP[className] = (SDK_RESOURCE_MAP[className] || []).concat(allResources);
		}

		// look for action usage in file
		var actionBlocks = content.match(/new ([A-Z]\w*?Action)(?=\()|([A-Z]\w*?Action)(?=\.type)/g);
		if (actionBlocks != null && actionBlocks.length > 0) {
			for (var i = 0, il = actionBlocks.length; i < il; i++) {
				var actionClass = actionBlocks[i].replace(/new /g, "");
				if (SDK_ACTION_MAP[className] == null) { SDK_ACTION_MAP[className] = []; }
				SDK_ACTION_MAP[className].push(actionClass);
			}
		}

		// look for modifier usage in file
		var modifiersBlock = content.match(/new ((?:Player)?Modifier\w+?)(?=\()|((?:Player)?Modifier\w+?)(?=\.type|\.createContext)/g);
		if (modifiersBlock != null && modifiersBlock.length > 0) {
			for (var i = 0, il = modifiersBlock.length; i < il; i++) {
				var modifierClass = modifiersBlock[i].replace(/new /g, "");
				if (SDK_MODIFIER_MAP[className] == null) { SDK_MODIFIER_MAP[className] = []; }
				SDK_MODIFIER_MAP[className].push(modifierClass);
			}
		}

		// determine for super class
		var superclassBlock = content.match(/extends (\w+?)[\r\n]/);
		if (superclassBlock != null && superclassBlock.length > 0) {
			var superclassName = superclassBlock[0].replace(/extends (\w+?)[\r\n]/g, "$1");
			SDK_SUPERCLASS_MAP[className] = superclassName;
		}

		return promise;
	};

	var resourcesBySDKClassName = function (className) {
		var resources = [];
		var classNamesSeen = {};

		var walkSDKMapsForResources = function (currentClassName) {
			if (currentClassName != null && !classNamesSeen[currentClassName]) {
				classNamesSeen[currentClassName] = true;

				// add from fx resource map
				var resourcesFromMap = SDK_RESOURCE_MAP[currentClassName];
				if (resourcesFromMap != null && resourcesFromMap.length > 0) {
					resources = resources.concat(resourcesFromMap);
				}

				// add from action map
				var actionClassNames = SDK_ACTION_MAP[currentClassName];
				if (actionClassNames != null) {
					for (var j = 0; j < actionClassNames.length; j++) {
						walkSDKMapsForResources(actionClassNames[j]);
					}
				}

				// add from modifier map
				var modifierClassNames = SDK_MODIFIER_MAP[currentClassName];
				if (modifierClassNames != null) {
					for (var j = 0; j < modifierClassNames.length; j++) {
						walkSDKMapsForResources(modifierClassNames[j]);
					}
				}

				// add from super class map
				var superclassName = SDK_SUPERCLASS_MAP[currentClassName];
				if (superclassName != null) {
					walkSDKMapsForResources(superclassName);
				}
			}
		};

		walkSDKMapsForResources(className);

		return _.uniq(resources);
	};

	var fxResourceStringsBySDKClassName = function (className) {
		var fxResourceStrings = [];
		var classNamesSeen = {};

		var walkSDKMapsForFXResourceStrings = function (currentClassName) {
			if (currentClassName != null && !classNamesSeen[currentClassName]) {
				classNamesSeen[currentClassName] = true;

				// add from fx resource map
				var fxResourceStringsFromMap = SDK_FX_RESOURCE_MAP[currentClassName];
				if (fxResourceStringsFromMap != null && fxResourceStringsFromMap.length > 0) {
					fxResourceStrings = fxResourceStrings.concat(fxResourceStringsFromMap);
				}

				// add from action map
				var actionClassNames = SDK_ACTION_MAP[currentClassName];
				if (actionClassNames != null) {
					for (var j = 0; j < actionClassNames.length; j++) {
						walkSDKMapsForFXResourceStrings(actionClassNames[j]);
					}
				}

				// add from modifier map
				var modifierClassNames = SDK_MODIFIER_MAP[currentClassName];
				if (modifierClassNames != null) {
					for (var j = 0; j < modifierClassNames.length; j++) {
						walkSDKMapsForFXResourceStrings(modifierClassNames[j]);
					}
				}

				// add from super class map
				var superclassName = SDK_SUPERCLASS_MAP[currentClassName];
				if (superclassName != null) {
					walkSDKMapsForFXResourceStrings(superclassName);
				}
			}
		};

		walkSDKMapsForFXResourceStrings(className);

		return _.uniq(fxResourceStrings);
	};

	var walkFXDataForResources = function (data) {
		var resources = [];

		var properties = Object.keys(data);
		for (var i = 0, il = properties.length; i < il; i++) {
			var property = properties[i];
			var value = data[property];
			if (value != null) {
				if (/spriteIdentifier|plistFile/.test(property)) {
					if (!_.isArray(value)) {
						value = [value];
					}
					for (var j = 0; j < value.length; j++) {
						var resourceIdentifier = value[j];
						var resourcesForIdentifier = getResources(resourceIdentifier);
						for (var k = 0, kl = resourcesForIdentifier.length; k < kl; k++) {
							var resource = resourcesForIdentifier[k];
							var resourceKey = RSX.getResourceKeyByResourceName(resource.name);
							resources.push("RSX." + resourceKey);
						}
					}
				} else if (_.isObject(value)) {
					resources = resources.concat(walkFXDataForResources(value));
				}
			}
		}

		return resources;
	};

	var resourcesForFXResourceStrings = function (fxResourceStrings) {
		var resources = [];

		if (fxResourceStrings != null) {
			if (!_.isArray(fxResourceStrings)) {
				fxResourceStrings = [fxResourceStrings];
			}
			for (var i = 0; i < fxResourceStrings.length; i++) {
				var fxResourceString = fxResourceStrings[i];
				var fxData = DATA.dataForIdentifier(fxResourceString);
				if (fxData) {
					resources = resources.concat(walkFXDataForResources(fxData));
				}
			}
		}

		return resources;
	};

	var addPkgResources = function (pkgName, resources) {
		if (_.isString(pkgName) && _.isArray(resources) && resources.length > 0) {
			// get or create package
			var pkg = PKGS[pkgName];
			if (pkg == null) {
				pkg = PKGS[pkgName] = [];
			}

			// add resources
			for (var i = 0; i < resources.length; i++) {
				var resource = resources[i];

				// strip spaces, tabs, and newlines
				resource = resource.replace(/[\s\t\r\n]/g, "");

				// add resource if valid
				if (resource != "" && RSX[resource.replace("RSX.", "")] != null) {
					// ensure resource begins with RSX.
					if (/^(?!RSX\.).+/.test(resource)) {
						resource = "RSX." + resource;
					}

					// add resource to package
					pkg.push(resource);
				}
			}
		}
	};

	var CARD_GAME_PKG_PREFIX = "card_game_";
	var CARD_INSPECT_PKG_PREFIX = "card_inspect_";
	var CARD_BACK_PKG_PREFIX = "card_back_";
	var FACTION_GAME_PKG_PREFIX = "faction_game_";
	var FACTION_INSPECT_PKG_PREFIX = "faction_inspect_";
	var CHAPTER_PKG_PREFIX = "chapter_";
	var CHALLENGE_PKG_PREFIX = "challenge_";
	var CARD_DATA_BY_ID_STRING = {};
	var CARD_DATA_BY_ID = {};

	var hasCurrentCard = false;
	var currentCardContent = "";
	var cardFactoryLineInsideComment = false;
	var nextLine = false;
	var parseCardFactoryLine = function (file, line) {
		// remove plain comments and soft returns
		line = helpers.stripComments(line).replace("\r", "\n");

		// ignore lines between complex comments
		// will fail if line contains actual code before/after comment
		var indexOfComment = line.indexOf("###");
		if (cardFactoryLineInsideComment) {
			if (nextLine){
				nextLine = false;
			}
			if (indexOfComment != -1) {
				cardFactoryLineInsideComment = false;
				line = line.slice(indexOfComment + 3);
			}
		} else if (indexOfComment != -1) {
			cardFactoryLineInsideComment = true;
			nextLine = true;
		}

		// check if this is a valid line
		if (line && !cardFactoryLineInsideComment) {
			// check if this is a card identifier line
			if (/if[\s]*\([\s]*identifier[\s]*==[\s]*/.test(line)) {
				// process and reset content
				parseCurrentSdkCardContent();
				hasCurrentCard = true;
			}

			// add line to current card content
			if (hasCurrentCard) {
				currentCardContent += line + "\n";
			}
		}

		return Promise.resolve();
	};

	var parseCurrentSdkCardContent = function () {
		if (hasCurrentCard && currentCardContent) {
			parseSdkCardContent(currentCardContent);
			currentCardContent = "";
			hasCurrentCard = false;
		}
	};

	var parseSdkCardContent = function (cardContent) {
		// card id
		var idStringStartIndex = cardContent.indexOf("Cards.");
		var idStringEndIndex = cardContent.indexOf(")");
		var cardIdString = cardContent.slice(idStringStartIndex, idStringEndIndex);
		cardIdString = cardIdString.replace(/\n|\r/g, "");
		var idStringParts = cardIdString.split(".");
		var cardId = Cards;
		for (var j = 1; j < idStringParts.length; j++) {
			cardId = cardId[idStringParts[j]];
			if (cardId == null) {
				console.log(" [GP] [WARN] " + cardIdString + " -> not found in cards lookup at part: ", idStringParts[j]);
				break;
			}
		}

		// faction id
		var factionIdString;
		var factionId;
		factionIdString = cardContent.match(/factionId(.*?)Factions\.(\w*)\b/);
		factionId = FactionsLookup[factionIdString] || FactionsLookup.Neutral;
		if (factionIdString != null) {
			factionIdString = factionIdString[0].replace(/(.*?)Factions\./, "");
			factionId = FactionsLookup[factionIdString];
		}

		// class name
		var className = cardContent.match(/card[\s\t]*?=[\s\t]*?new (\w+?)\(/)[1];

		// get card type string based on class name
		var cardTypeString;
		if (/Artifact/i.test(className)) {
			cardTypeString = "Artifact";
		} else if (/Unit/i.test(className)) {
			cardTypeString = "Unit";
		} else if (/Tile/i.test(className)) {
			cardTypeString = "Tile";
		} else {
			cardTypeString = "Spell";
		}

		// check for general
		var isGeneral = /setIsGeneral\(.*?true.*?\)/.test(cardContent);

		// add data to master maps
		var cardData = {
			cardContent: cardContent,
			cardId: cardId,
			cardIdString: cardIdString,
			cardTypeString: cardTypeString,
			factionId: factionId,
			factionIdString: factionIdString,
			className: className,
			isGeneral: isGeneral
		};
		CARD_DATA_BY_ID_STRING[cardIdString] = cardData;
		CARD_DATA_BY_ID[cardId] = cardData;

		return Promise.resolve();
	};

	var parseCardFactoryData = function () {
		// parse any current card content left over
		parseCurrentSdkCardContent();

		var resourcesForAllPkg = [];

		// find resources for each card
		var cardIdStrings = Object.keys(CARD_DATA_BY_ID_STRING);
		for (var i = 0, il = cardIdStrings.length; i < il; i++) {
			var cardIdString = cardIdStrings[i];
			var cardData = CARD_DATA_BY_ID_STRING[cardIdString];
			var cardContent = cardData.cardContent;
			var factionId = cardData.factionId;
			var factionIdString = cardData.factionIdString;
			var cardId = cardData.cardId;
			var className = cardData.className;
			var isGeneral = cardData.isGeneral;
			cardData.resources = {
				animResources: [],
				animResourcesForCardInspect: [],
				animResourcesForFactionInspect: [],
				soundResources: [],
				soundResourcesForCardInspect: [],
				soundResourcesForFactionInspect: [],
				miscResources: [],
				fxResources: [],
				classResources: []
			};

			// search for misc resources
			var resourceStrings = cardContent.match(/(?:set\w*?Resource\()*RSX\..*?(?=[\.\W\r\n])/g) || [];
			for (var j = 0; j < resourceStrings.length; j++) {
				var resourceString = resourceStrings[j];
				var resource = resourceString.replace(/set\w*?Resource\(/g, "").replace(/[\t\s\r\n"']/g, "");

				resourcesForAllPkg.push(resource);
			}

			// anim resources for inspect
			var animResourceBlock = cardContent.match(/setBaseAnimResource\([\s\S]*?\)/g);
			if (animResourceBlock != null) {
				var animResourceLines = animResourceBlock[0].match(/(\w+)[\s\t]*?:[\s\t]*?(RSX\..*?)(?=[\.\r\n])/g) || [];
				for (var j = 0; j < animResourceLines.length; j++) {
					var animResourceLine = animResourceLines[j];
					var animResourceName = animResourceLine.replace(/(\w+)[\s\t]*?:[\s\t]*?RSX\..*?$/, "$1").replace(/[\t\s\r\n"']/g, "").toLowerCase();
					var animResource = animResourceLine.replace(/\w+[\s\t]*?:[\s\t]*?(RSX\..*?)$/, "$1").replace(/[\t\s\r\n"']/g, "");
					cardData.resources.animResources.push(animResource);
					if (/breathing|idle|attack|active/i.test(animResourceName)) {
						cardData.resources.animResourcesForCardInspect.push(animResource);
					}
				}
			}

			// sound resources
			var soundResourceBlock = cardContent.match(/setBaseSoundResource\([\s\S]*?\)/g);
			if (soundResourceBlock != null) {
				var soundResourcesLines = soundResourceBlock[0].match(/(\w+)[\s\t]*?:[\s\t]*?(RSX\..*?)(?=[\.\r\n])/g) || [];
				for (var j = 0; j < soundResourcesLines.length; j++) {
					var soundResourceLine = soundResourcesLines[j];
					var soundResourceName = soundResourceLine.replace(/(\w+)[\s\t]*?:[\s\t]*?RSX\..*?$/, "$1").replace(/[\t\s\r\n"']/g, "").toLowerCase();
					var soundResource = soundResourceLine.replace(/\w+[\s\t]*?:[\s\t]*?(RSX\..*?)$/, "$1").replace(/[\t\s\r\n"']/g, "");
					cardData.resources.soundResources.push(soundResource);
					/*
					if (/attack/i.test(soundResourceName)) {
						cardData.resources.soundResourcesForCardInspect.push(soundResource);
						cardData.resources.soundResourcesForFactionInspect.push(soundResource);
					}
					*/
				}
			}

			// fx resource strings specific to skin
			var fxResourceStrings = [];
			var fxResourceBlocks = cardContent.match(/fxResource[(:\s]*?\[([\s\S]*?)\]/ig);
			if (fxResourceBlocks != null) {
				for (var j = 0; j < fxResourceBlocks.length; j++) {
					var fxResourceBlock = fxResourceBlocks[j];
					var fxResourceBlockStrings = fxResourceBlock.match(/["'](.*?)["']/g);
					for (var k = 0; k < fxResourceBlockStrings.length; k++) {
						fxResourceStrings.push(fxResourceBlockStrings[k].replace(/["']/g, ""));
					}
				}
			}

			// get resources used by card class name
			var resourcesForClassName = resourcesBySDKClassName(className);
			if (resourcesForClassName != null && resourcesForClassName.length > 0) {
				cardData.resources.classResources = cardData.resources.classResources.concat(resourcesForClassName);
			}

			// get fx resources strings this card may use
			var fxResourceStringsForClassName = fxResourceStringsBySDKClassName(className);
			if (fxResourceStringsForClassName != null && fxResourceStringsForClassName.length > 0) {
				fxResourceStrings = fxResourceStrings.concat(fxResourceStringsForClassName);
			}

			// add fx resource strings specific to card faction unless neutral
			// this is necessary for cases where a faction card is used in a game without that faction
			if (factionId !== FactionsLookup.Neutral) {
				var factionData = FactionFactory.factionForIdentifier(factionId);
				if (factionData != null) {
					var factionFXResource = factionData.fxResource;
					for (var j = 0, jl = factionFXResource.length; j < jl; j++) {
						var factionFXResourceString = factionFXResource[j];
						// neutral faction fx resources are always loaded
						if (!(/neutral$/i.test(factionFXResourceString))) {
							fxResourceStrings.push(factionFXResourceString);
						}
					}
				}
			}

			// check for modifier classes used by this card
			var modifierBlocks = cardContent.match(/new ((?:Player)?Modifier\w+?)(?=\()|((?:Player)?Modifier\w+?)(?=\.type|\.createContext)/g);
			if (modifierBlocks != null) {
				for (var j = 0; j < modifierBlocks.length; j++) {
					var modifierClass = modifierBlocks[j].replace(/new /g, "");

					// get resources used by modifier classes this card uses
					var resourcesForModifierClassName = resourcesBySDKClassName(modifierClass);
					if (resourcesForModifierClassName != null && resourcesForModifierClassName.length > 0) {
						cardData.resources.classResources = cardData.resources.classResources.concat(resourcesForModifierClassName);
					}

					// fx resource strings of any modifiers specific to card definition
					var fxResourceStringsForModifierClassName = fxResourceStringsBySDKClassName(modifierClass);
					if (fxResourceStringsForModifierClassName != null && fxResourceStringsForModifierClassName.length > 0) {
						fxResourceStrings = fxResourceStrings.concat(fxResourceStringsForModifierClassName);
					}
				}
			}

			// get fx resources from fx resource strings for this card
			var fxResources = resourcesForFXResourceStrings(fxResourceStrings);
			if (fxResources != null && fxResources.length > 0) {
				cardData.resources.fxResources = cardData.resources.fxResources.concat(fxResources);
			}

			// add all card resources to packages
			addPkgResourcesForCard(cardId, factionId, cardData.resources);
		}

		addPkgResources("all", resourcesForAllPkg);

		return Promise.resolve();
	};

	var addPkgResourcesForCard = function (cardId, factionId, resources) {
		// anim
		if (resources.animResources != null) {
			addPkgResources(CARD_GAME_PKG_PREFIX + cardId, resources.animResources);
		}
		if (resources.animResourcesForCardInspect != null) {
			addPkgResources(CARD_INSPECT_PKG_PREFIX + cardId, resources.animResourcesForCardInspect);
		}
		if (resources.animResourcesForFactionInspect != null) {
			addPkgResources(FACTION_INSPECT_PKG_PREFIX + factionId, resources.animResourcesForFactionInspect);
		}

		// sound
		if (resources.soundResources != null) {
			addPkgResources(CARD_GAME_PKG_PREFIX + cardId, resources.soundResources);
		}
		if (resources.soundResourcesForCardInspect != null) {
			addPkgResources(CARD_INSPECT_PKG_PREFIX + cardId, resources.soundResourcesForCardInspect);
		}
		if (resources.soundResourcesForFactionInspect != null) {
			addPkgResources(FACTION_INSPECT_PKG_PREFIX + factionId, resources.soundResourcesForFactionInspect);
		}

		// fx
		if (resources.fxResources != null) {
			addPkgResources(CARD_GAME_PKG_PREFIX + cardId, resources.fxResources);
		}

		// class
		if (resources.classResources != null) {
			addPkgResources(CARD_GAME_PKG_PREFIX + cardId, resources.classResources);
		}

		// misc
		if (resources.miscResources != null) {
			addPkgResources(CARD_GAME_PKG_PREFIX + cardId, resources.miscResources);
			addPkgResources(FACTION_GAME_PKG_PREFIX + factionId, resources.miscResources);
			addPkgResources(FACTION_INSPECT_PKG_PREFIX + factionId, resources.miscResources);
			addPkgResources("nongame", resources.miscResources);
		}
	};

	var parseModifier = function (file, content) {
		var fileName = helpers.getFileName(file);
		var className = fileName[0].toUpperCase() + fileName.slice(1);
		var modifierType = content.match(/type:.*?['"](\w+?)['"]/);
		if (modifierType != null) {
			modifierType = modifierType[1];
		} else {
			console.log(" [GP] [WARN] " + className + " -> has no 'type' property!");
			modifierType = className;
		}

		var resourcesForPkg = [];
		var fxResourceStrings = [];

		// get resources used by modifier class
		var resourcesForClassName = resourcesBySDKClassName(className);
		if (resourcesForClassName != null && resourcesForClassName.length > 0) {
			resourcesForPkg = resourcesForPkg.concat(resourcesForClassName);
		}

		// fx resource strings for modifier
		var fxResourceStringsForClassName = fxResourceStringsBySDKClassName(className);
		if (fxResourceStringsForClassName != null && fxResourceStringsForClassName.length > 0) {
			fxResourceStrings = fxResourceStrings.concat(fxResourceStringsForClassName);
		}

		// get fx resources from fx resource strings
		var fxResources = resourcesForFXResourceStrings(fxResourceStrings);
		if (fxResources != null && fxResources.length > 0) {
			resourcesForPkg = resourcesForPkg.concat(fxResources);
		}

		// add resources to a package for this modifier
		addPkgResources(modifierType, resourcesForPkg);

		return Promise.resolve();
	};

	var parseFactionFactory = function (file, content) {
		// remove comments and soft returns
		content = helpers.stripComments(content).replace("\r", "\n");

		var resourcesForAllPkg = [];

		// extract all resources for each faction in faction factory
		var factionBlocks = content.split(/fmap\[[\s\t]*?Factions\.\w+\][\s\t]*?=/);
		for (var i = 1, il = factionBlocks.length; i < il; i++) {
			var factionBlock = factionBlocks[i];
			var factionAlias = factionBlock.match(/id:[\s\t]*?Factions\.(\w+)[\r\n]/)[1];
			var factionId = FactionsLookup[factionAlias];
			if (factionId != null) {
				var factionResourcesForGamePkg = [];
				var factionResourcesForInspectPkg = [];

				// find all resources
				var resourceStrings = factionBlock.match(/RSX\..*?(?=[\.\W\r\n])/g) || [];
				for (var j = 0; j < resourceStrings.length; j++) {
					var resourceString = resourceStrings[j];
					var resourceName = resourceString.replace(/RSX\./g, "").replace(/[\W\t\s\r\n"']/g, "");
					var resource = resourceString.replace(/[\t\s\r\n"']/g, "");

					resourcesForAllPkg.push(resource);
				}

				// add faction fx resources
				var fxResourcesBlock = factionBlock.match(/fxResource.*?\[[\s\S]*?\]/g);
				if (fxResourcesBlock != null) {
					var fxResourceStrings = fxResourcesBlock[0].match(/["'].*?["']/g) || [];
					for (var j = 0; j < fxResourceStrings.length; j++) {
						fxResourceStrings[j] = fxResourceStrings[j].replace(/["']/g, "");
					}
					var factionResourcesForFXPkg = resourcesForFXResourceStrings(fxResourceStrings);
					factionResourcesForGamePkg = factionResourcesForGamePkg.concat(factionResourcesForFXPkg);
				}

				addPkgResources(FACTION_GAME_PKG_PREFIX + factionId, factionResourcesForGamePkg);
				addPkgResources(FACTION_INSPECT_PKG_PREFIX + factionId, factionResourcesForInspectPkg);
				addPkgResources("nongame", factionResourcesForInspectPkg);
			}
		}

		addPkgResources("all", resourcesForAllPkg);

		return Promise.resolve();
	};

	var parseCodex = function (file, content) {
		// remove comments and soft returns
		content = helpers.stripComments(content).replace("\r", "\n");

		// extract all resources for each chapter in codex
		var chapterBlocks = content.split(/\[[\s\t]*?CodexChapters\./);
		for (var i = 1, il = chapterBlocks.length; i < il; i++) {
			var chapterBlock = chapterBlocks[i];
			var chapterCategory = chapterBlock.match(/(.*?)[\W\r\n]/)[1];
			var chapterId = CodexChapters[chapterCategory];
			var chapterResourcesForPkg = [];

			// find all resources
			var resourceStrings = chapterBlock.match(/RSX\..*?(?=[\.\W\r\n])/g) || [];
			for (var j = 0; j < resourceStrings.length; j++) {
				var resourceString = resourceStrings[j];
				var resourceName = resourceString.replace(/RSX\./g, "").replace(/[\W\t\s\r\n"']/g, "");
				var resource = resourceString.replace(/[\t\s\r\n"']/g, "");

				if (chapterId != null) {
					chapterResourcesForPkg.push(resource);
				}
			}

			if (chapterId != null) {
				addPkgResources(CHAPTER_PKG_PREFIX + chapterId, chapterResourcesForPkg);
			}
		}

		return Promise.resolve();
	};

	var CHALLENGE_SUPERCLASS_MAP = {};

	var parseChallenge = function (file, content) {
		// remove comments and soft returns
		content = helpers.stripComments(content).replace("\r", "\n");

		// get challenge type for package identifier
		var challengeType = content.match(/type[\s\t]*?:[\s\t]*?["'](\w+)['"]/);
		if (challengeType != null) {
			challengeType = challengeType[1];

			// find all resources
			var challengeResourcesForPkg = [];
			var resourceStrings = content.match(/RSX\..*?(?=[\.\W\r\n])/g) || [];
			for (var j = 0; j < resourceStrings.length; j++) {
				var resourceString = resourceStrings[j];
				var resource = resourceString.replace(/[\t\s\r\n"']/g, "");

				if (challengeType != null) {
					challengeResourcesForPkg.push(resource);
				}
			}

			if (challengeResourcesForPkg.length > 0) {
				addPkgResources(CHALLENGE_PKG_PREFIX + challengeType, challengeResourcesForPkg);
			}

			// determine super class
			var superclassBlock = content.match(/extends (\w+?)[\r\n]/);
			if (superclassBlock != null && superclassBlock.length > 0) {
				var superclassName = superclassBlock[0].replace(/extends (\w+?)[\r\n]/g, "$1");
				CHALLENGE_SUPERCLASS_MAP[challengeType] = superclassName;
			}
		}

		return Promise.resolve();
	};

	var parseChallengeSuperClass = function (file, content) {
		// remove comments and soft returns
		content = helpers.stripComments(content).replace("\r", "\n");

		// get challenge type for package identifier
		var challengeType = content.match(/type[\s\t]*?:[\s\t]*?["'](\w+)['"]/);
		if (challengeType != null) {
			challengeType = challengeType[1];

			// get super class resources recursively
			var superclassName = CHALLENGE_SUPERCLASS_MAP[challengeType];
			while (superclassName != null) {
				var superclassResources = PKGS[CHALLENGE_PKG_PREFIX + superclassName];
				addPkgResources(CHALLENGE_PKG_PREFIX + challengeType, superclassResources);

				// get next superclass
				superclassName = CHALLENGE_SUPERCLASS_MAP[superclassName];
			}
		}

		return Promise.resolve();
	};

	var BATTLE_MAP_PKG_PREFIX = "battle_map_";
	var parseBattleMap = function (file, content) {
		// remove comments and soft returns
		content = helpers.stripComments(content).replace("\r", "\n");

		// keep a list of all resources in battle map file that aren't specific to a battle map
		var resources = [];

		// setup regex to search for battlemap chunks
		// the global flag is used to keep an internal index counter on the regexp object
		var battleMapRegex = new RegExp("\(BATTLEMAP\.\*\?\)\(\?\=\\W\)","g");

		// parse battle map starting at the top level
		var nextBattleMapMatch = battleMapRegex.exec(content);
		var openIndex = 0;
		var closeIndex = 0;
		while(nextBattleMapMatch != null) {
			var battleMapIdString = nextBattleMapMatch[0];
			var battleMapId = CONFIG[battleMapIdString];
			// starting at match index, search for first open char
			openIndex = content.indexOf("{", nextBattleMapMatch.index);
			var lastCloseIndex = closeIndex;
			closeIndex = content.length - 1;
			if (openIndex != -1) {
				// search for match close char
				var levels = 1;
				var charIndex = openIndex + 1;
				while (charIndex < closeIndex) {
					if (content[charIndex] === "{") {
						levels++;
					} else if (content[charIndex] === "}") {
						levels--;
					}
					if (levels === 0) {
						closeIndex = charIndex;
						break;
					}
					charIndex++;
				}
			}

			// anything between last close index and this open index is part of all battle maps and should be in game package
			if (openIndex - lastCloseIndex > 0) {
				var resourcesData = resourcesForFile(file, content.slice(lastCloseIndex, openIndex));
				addPkgResources("game", [].concat(resourcesData.resources, resourcesData.dynamicResources));
			}

			// anything between open and close indices is a part of the current battlemap
			var resourcesData = resourcesForFile(file, content.slice(openIndex, closeIndex + 1));
			addPkgResources(BATTLE_MAP_PKG_PREFIX + battleMapId, [].concat(resourcesData.resources, resourcesData.dynamicResources));

			// get next match
			nextBattleMapMatch = battleMapRegex.exec(content);
		}

		// anything from close index to end is part of all battle maps and should be in game package
		if (content.length - 1 - closeIndex > 0) {
			var resourcesData = resourcesForFile(file, content.slice(closeIndex, content.length - 1));
			addPkgResources("game", [].concat(resourcesData.resources, resourcesData.dynamicResources));
		}

		return Promise.resolve();
	};

	var parseCosmeticsFactory = function (file, content) {
		// remove comments and soft returns
		content = helpers.stripComments(content).replace("\r", "\n");

		var resourcesForNonGamePkg = [];
		var resourcesForGamePkg = [];
		var resourcesForShopPkg = [];
		var resourcesForEmotesPkg = [];

		// find all resources for shop
		var resourceStrings = content.match(/RSX\..*?(?=[.\W\r\n])/g) || [];
		for (var j = 0; j < resourceStrings.length; j++) {
			var resourceString = resourceStrings[j];
			var resourceName = resourceString.replace(/RSX\./g, "").replace(/[\W\t\s\r\n"']/g, "");
			var resource = resourceString.replace(/[\t\s\r\n"']/g, "");

			// add to shop resources
			resourcesForShopPkg.push(resource);
		}

		// extract all resources for each emote
		var emoteBlocks = content.split(/\[[\s\t]*?Emote\.(.*?\{[\s\S]*?)[\r\n]\}/);
		for (var i = 1, il = emoteBlocks.length - 1; i < il; i++) {
			var emoteBlock = emoteBlocks[i];
			var factionBlock = emoteBlock.match(/factionId[\s\t]*?:[\s\t]*?Factions\.(\w+)/);
			var factionKey = factionBlock && factionBlock[1];
			var factionId = FactionsLookup[factionKey];
			var unlockableBlock = emoteBlock.match(/unlockable[\s\t]*?:[\s\t]*?(\w+)/);
			var purchasableBlock = emoteBlock.match(/purchasable[\s\t]*?:[\s\t]*?(\w+)/);
			var factionResourcesForGamePkg = [];

			// find all resources
			var resourceStrings = emoteBlock.match(/RSX\..*?(?=[\.\W\r\n])/g) || [];
			for (var j = 0; j < resourceStrings.length; j++) {
				var resourceString = resourceStrings[j];
				var resourceName = resourceString.replace(/RSX\./g, "").replace(/[\W\t\s\r\n"']/g, "");
				var resource = resourceString.replace(/[\t\s\r\n"']/g, "");

				resourcesForEmotesPkg.push(resource);
			}
		}

		// extract all resources for card backs
		var cardBackBlocks = content.split(/\[[\s\t]*?CardBack\.(.*?\{[\s\S]*?)[\r\n]\}/);
		for (var i = 1, il = cardBackBlocks.length - 1; i < il; i++) {
			var cardBackBlock = cardBackBlocks[i];
			var cardBackIdBlock = cardBackBlock.match(/id[\s\t]*?:[\s\t]*?CardBack\.(\w+)/);
			var cardBackIdKey = cardBackIdBlock && cardBackIdBlock[1];
			var cardBackId = CosmeticsLookup.CardBack[cardBackIdKey];

			// find all resources
			var resourcesForCardBack = [];
			var resourceStrings = cardBackBlock.match(/RSX\..*?(?=[.\W\r\n])/g) || [];
			for (var j = 0; j < resourceStrings.length; j++) {
				var resourceString = resourceStrings[j];
				var resourceName = resourceString.replace(/RSX\./g, "").replace(/[\W\t\s\r\n"']/g, "");
				var resource = resourceString.replace(/[\t\s\r\n"']/g, "");

				// add to card back resources
				resourcesForCardBack.push(resource);
			}

			// add to card back package
			addPkgResources(CARD_BACK_PKG_PREFIX + cardBackId, resourcesForCardBack);
		}

		// extract all resources for card skins
		var cardSkinBlocks = content.split(/\[[\s\t]*?CardSkin\.(.*?\{[\s\S]*?)[\r\n]\}/);
		for (var i = 1, il = cardSkinBlocks.length - 1; i < il; i++) {
			var cardSkinBlock = cardSkinBlocks[i];
			var cardSkinIdBlock = cardSkinBlock.match(/id[\s\t]*?:[\s\t]*?CardSkin\.(\w+)/);
			var cardSkinIdKey = cardSkinIdBlock && cardSkinIdBlock[1];
			if (cardSkinIdKey != null) {
				var cardSkinId = CosmeticsLookup.CardSkin[cardSkinIdKey];
				var cardIdBlock = cardSkinBlock.match(/cardId[\s\t]*?:[\s\t]*?(Cards\..*?)[\s\t]*?[\r\n]/);
				var skinNumBlock = cardSkinBlock.match(/skinNum[\s\t]*?:[\s\t]*?(\d*?)[\s\t]*?[\r\n]/);
				if (cardIdBlock == null) {
					console.log(" [GP] [WARN] card skin data for " + cardSkinIdKey + " -> has no card id!");
				} else {
					var skinNum = skinNumBlock && parseInt(skinNumBlock[1]);
					if (skinNum == null || isNaN(skinNum)) {
						console.log(" [GP] [WARN] card skin data for " + cardSkinIdKey + " -> has no/invalid skin num!");
					} else {
						var cardIdString = cardIdBlock[1];
						var cardData = CARD_DATA_BY_ID_STRING[cardIdString];
						var cardId = cardData.cardId;
						var factionId = cardData.factionId;
						var skinnedCardId = Cards.getSkinnedCardId(cardId, skinNum);
						var isGeneral = cardData.isGeneral;
						var cardResources = cardData.resources;
						var skinResources = _.extend({}, cardResources);

						// anim resources
						var animResources = [];
						var animResourcesForCardInspect = [];
						var animResourcesForFactionInspect = [];
						var animResourceBlock = cardSkinBlock.match(/animResource[\s\t]*?:[\s\t]*?\{[\s\S]*?\}/g);
						if (animResourceBlock != null) {
							var animResourceLines = animResourceBlock[0].match(/(\w+)[\s\t]*?:[\s\t]*?(RSX\..*?)(?=[\.\r\n])/g) || [];
							for (var j = 0; j < animResourceLines.length; j++) {
								var animResourceLine = animResourceLines[j];
								var animResourceName = animResourceLine.replace(/(\w+)[\s\t]*?:[\s\t]*?RSX\..*?$/, "$1").replace(/[\t\s\r\n"']/g, "").toLowerCase();
								var animResource = animResourceLine.replace(/\w+[\s\t]*?:[\s\t]*?(RSX\..*?)$/, "$1").replace(/[\t\s\r\n"']/g, "");
								animResources.push(animResource);
								if (/breathing|idle|attack|active/i.test(animResourceName)) {
									animResourcesForCardInspect.push(animResource);
								}
							}
						}
						if (animResources.length > 0) {
							skinResources.animResources = animResources;
							if (animResourcesForCardInspect.length > 0) {
								skinResources.animResourcesForCardInspect = animResourcesForCardInspect;
							}
							if (animResourcesForFactionInspect.length > 0) {
								skinResources.animResourcesForFactionInspect = animResourcesForFactionInspect;
							}
						}

						// sound resources
						var soundResources = [];
						var soundResourcesForCardInspect = [];
						var soundResourcesForFactionInspect = [];
						var soundResourceBlock = cardSkinBlock.match(/soundResource[\s\t]*?:[\s\t]*?\{[\s\S]*?\}/g);
						if (soundResourceBlock != null) {
							var soundResourcesLines = soundResourceBlock[0].match(/(\w+)[\s\t]*?:[\s\t]*?(RSX\..*?)(?=[\.\r\n])/g) || [];
							for (var j = 0; j < soundResourcesLines.length; j++) {
								var soundResourceLine = soundResourcesLines[j];
								var soundResourceName = soundResourceLine.replace(/(\w+)[\s\t]*?:[\s\t]*?RSX\..*?$/, "$1").replace(/[\t\s\r\n"']/g, "").toLowerCase();
								var soundResource = soundResourceLine.replace(/\w+[\s\t]*?:[\s\t]*?(RSX\..*?)$/, "$1").replace(/[\t\s\r\n"']/g, "");
								soundResources.push(soundResource);
							}
						}
						if (soundResources.length > 0) {
							skinResources.soundResources = soundResources;
							if (soundResourcesForCardInspect.length > 0) {
								skinResources.soundResourcesForCardInspect = soundResourcesForCardInspect;
							}
							if (soundResourcesForFactionInspect.length > 0) {
								skinResources.soundResourcesForFactionInspect = soundResourcesForFactionInspect;
							}
						}

						addPkgResourcesForCard(skinnedCardId, factionId, skinResources);
					}
				}
			}
		}

		// add to packages
		addPkgResources("nongame", resourcesForNonGamePkg);
		addPkgResources("game", resourcesForGamePkg);
		addPkgResources("shop", resourcesForShopPkg);
		addPkgResources("emotes", resourcesForEmotesPkg);

		return Promise.resolve();
	};

	var parseShopData = function (file, content) {
		// remove comments and soft returns
		content = helpers.stripComments(content).replace("\r", "\n");

		// find all resources
		var resources = [];
		var iconResourceNames = content.match(/icon_image_resource_name['"][\s\t]*?:[\s\t]*?['"]\w+['"]/g) || [];
		var coverResourceNames = content.match(/cover_image_resource_name['"][\s\t]*?:[\s\t]*?['"]\w+['"]/g) || [];
		var resourceNames = [].concat(iconResourceNames, coverResourceNames);
		if (resourceNames != null) {
			for (var i = 0; i < resourceNames.length; i++) {
				var resourceName = resourceNames[i].replace(/[\s\t'":]|icon_image_resource_name|cover_image_resource_name/g, "");
				if (resourceName.length > 0 && RSX[resourceName] != null) {
					resources.push(resourceName);
				} else {
					console.log(" [GP] [WARN] shop resource name " + resourceName + " -> appears to be invalid!")
				}
			}
		}

		addPkgResources("shop", resources);

		return Promise.resolve();
	};

	// begin generate packages
	console.log(" [GP] Packaging resources for STANDARD files...");

	// read all files and exit when complete
	Promise.all([
		helpers.readFile(dir + "/../app/application.coffee", mapResourcesForFile),
		helpers.recursivelyReadDirectoryAndFiles(dir + "/../app/audio", mapResourcesForFile),
		helpers.recursivelyReadDirectoryAndFiles(dir + "/../app/ui", mapResourcesForFile, /\.scss/),
		helpers.readFile(dir + "/../dist/src/duelyst.css", mapResourcesForFile),
		helpers.recursivelyReadDirectoryAndFiles(dir + "/../app/view", mapResourcesForFile, /battlemap/i),
		helpers.recursivelyReadDirectoryAndFiles(dir + "/../app/sdk", mapResourcesForSDKFile, /cardFactory|factory\/|factionFactory|cosmeticsFactory|modifierFactory|actionfactory|codex/i)
	]).then(function () {
		console.log(" [GP] Resources packed for STANDARD files!");
		console.log(" [GP] Packaging resources for SPECIAL files...");
		return Promise.all([
			helpers.readFile(dir + "/../app/sdk/cards/factionFactory.coffee", parseFactionFactory),
			helpers.readFile(dir + "/../app/sdk/codex/codex.coffee", parseCodex),
			helpers.readFile(dir + "/../app/view/layers/game/BattleMap.js", parseBattleMap),
			helpers.recursivelyReadDirectoryAndFiles(dir + "/../app/sdk/modifiers", parseModifier, /modifierFactory|modifierContextObject/i),
			helpers.recursivelyReadDirectoryAndFiles(dir + "/../app/sdk/playerModifiers", parseModifier, /modifierFactory|modifierContextObject/i),
			helpers.recursivelyReadDirectoryAndFiles(dir + "/../app/sdk/challenges", parseChallenge, /challengeCategory|challengeFactory/i),
			helpers.recursivelyReadDirectoryAndFiles(dir + "/../app/sdk/challenges", parseChallengeSuperClass, /challengeCategory|challengeFactory/i),
			helpers.readFile(dir + "/../app/data/shop.json", parseShopData),
			helpers.readFile(dir + "/../app/data/premium_shop.json", parseShopData)			
		]);
	}).then(function () {
		console.log(" [GP] Resources packed for SPECIAL files!");
		console.log(" [GP] Packaging resources for CARD FACTORY...");
		// card factory is incredibly performance intensive to process
		// so instead of processing the entire file, read line by line
		// each card factory file must be read in sequence, otherwise we'll have data conflict
		// once all lines are read and data extracted, parse the extracted data
		return helpers.recursivelyReadDirectoryAndFilesByLine(dir + "/../app/sdk/cards/factory", parseCardFactoryLine);
	}).then(function () {
		return parseCardFactoryData();
	}).then(function () {
		// parse cosmetic factory after card factory
		// that way all card resources have been gathered
		// and card skin packages can be correctly generated
		return helpers.readFile(dir + "/../app/sdk/cosmetics/cosmeticsFactory.coffee", parseCosmeticsFactory);
	}).then(function () {
		console.log(" [GP] Resources packed for CARD FACTORY!");
		console.log(" [GP] Wrapping packages...");

		// add some additional fx resources to the game package
		addPkgResources("game", walkFXDataForResources(DATA.FX.Actions));
		addPkgResources("game", walkFXDataForResources(DATA.FX.Game));

		// make all resources map unique
		var rsxKeys = Object.keys(RSX_MAP);
		for (var i = 0, il = rsxKeys.length; i < il; i++) {
			var key = rsxKeys[i];
			RSX_MAP[key] = _.uniq(RSX_MAP[key]);
			if (debug && RSX_MAP[key].length > WARN_WHEN_REQUIRES_MORE_RSX_THAN
					&& !(/factory[\/]|battlemap|cosmeticsFactory|factionfactory/i.test(key))) {
				console.log(" [GP] [WARN] " + key + " -> appears to require ~" + RSX_MAP[key].length + " resources!")
			}
		}

		// check all predefined packages
		var pkgKeys = Object.keys(PKGS_DEF);
		for (var i = 0, il = pkgKeys.length; i < il; i++) {
			var key = pkgKeys[i];
			var pkg_def = PKGS_DEF[key];
			var pkg = PKGS[key];
			if (pkg == null) {
				pkg = PKGS[key] = [];
			}
			for (var j = 0; j < pkg_def.length; j++) {
				var resourceData = pkg_def[j];
				var resourceKey = RSX.getResourceKeyByResourceName(resourceData.name);
				pkg.push("RSX." + resourceKey);
			}
		}

		// check all packages
		var pkg_all = PKGS.all || [];
		var pkgKeysToDelete = [];
		var pkgKeys = Object.keys(PKGS);
		for (var i = 0, il = pkgKeys.length; i < il; i++) {
			var key = pkgKeys[i];
			var pkg = PKGS[key];

			if (_.isArray(pkg)) {
				if (pkg.length === 0) {
					// delete package if it has no resources
					pkgKeysToDelete.push(key);
				} else {
					// make pkg unique
					pkg = _.uniq(pkg);

					// store final pkg
					PKGS[key] = pkg;

					// add resources to the "all" pkg
					pkg_all = pkg_all.concat(pkg);
				}
			}
		}

		// delete packages as needed
		for (var i = 0, il = pkgKeysToDelete.length; i < il; i++) {
			delete PKGS[pkgKeysToDelete[i]];
		}

		// check that there are packages for every card
		var cardGroupKeys = Object.keys(Cards);
		for (var i = 0, il = cardGroupKeys.length; i < il; i++) {
			var cardGroupKey = cardGroupKeys[i];
			var cardGroup = Cards[cardGroupKey];
			if (_.isObject(cardGroup)) {
				var cardKeys = Object.keys(cardGroup);
				for (var j = 0, jl = cardKeys.length; j < jl; j++) {
					var cardKey = cardKeys[j];
					// generic cards don't need packages
					if (!/clone|followup|prismatic|killtarget|modifiers|spelldamage|spawnentity|spawnneutralentity|^(dispel|repulsion|deploymechaz0r|mindcontrolbyattackvalue|doubleattackandhealth|wall)$/gi.test(cardKey)) {
						var cardId = cardGroup[cardKey];
						var cardInspectPkgKey = CARD_INSPECT_PKG_PREFIX + Cards.getNonPrismaticCardId(cardId);
						if (PKGS[cardInspectPkgKey] == null) {
							console.log(" [GP] [WARN] card " + cardKey + " -> has no inspect package!")
						}
						var cardGamePkgKey = CARD_GAME_PKG_PREFIX + Cards.getNonPrismaticCardId(cardId);
						if (PKGS[cardGamePkgKey] == null) {
							console.log(" [GP] [WARN] card " + cardKey + " -> has no game package!")
						}
					}
				}
			}
		}

		// add all non aliased resources to the "all" pkg
		pkg_all = _.union(pkg_all, RSX_NON_ALIASED);

		// add all resources to the "all" pkg if forcing all resources
		if (forceAllResources) {
			console.log(" [GP] FORCE UPLOAD ALL RESOURCES");
			var resourceKeys = Object.keys(RSX);
			for (var i = 0, il = resourceKeys.length; i < il; i++) {
				var resourceKey = resourceKeys[i];
				var resource = RSX[resourceKey];
				if (!_.isFunction(resource) && _.isObject(resource)) {
					pkg_all.push("RSX." + resourceKey);
				}
			}
		}

		// add pseudo-resources for all non-16 bit images in the "all" pkg at each enabled resource scale
		// this ensures that all images at all enabled resource scales will be copied/loaded/cached
		var pseudoImagesSeen = {};
		for (var i = pkg_all.length - 1; i >= 0; i--) {
			var resource = pkg_all[i];

			// ignore all but actual resources
			if (_.isString(resource)) {
				resource = RSX[resource.replace("RSX.", "")];
				var imagePath = resource.img;
				if (imagePath != null
					&& !resource.noScale && !resource.is16Bit
					&& pseudoImagesSeen[imagePath] == null
					&& !(/@\d/i.test(helpers.getFileName(imagePath)))) {
					// mark image as seen
					pseudoImagesSeen[imagePath] = true;

					// strip quotes
					var resourceName = resource.name.replace(/['"]/g, "");
					imagePath = imagePath.replace(/['"]/g, "");
					var indexOfExt = imagePath.lastIndexOf(".");
					for (var j = CONFIG.RESOURCE_SCALES.length - 1; j >= 0; j--) {
						var resourceScale = CONFIG.RESOURCE_SCALES[j];
						pkg_all.splice(i + 1, 0, {
							name: '"' + resourceName + '@' + resourceScale + 'x' + '"',
							img: '"' + imagePath.substring(0, indexOfExt) + '@' + resourceScale + 'x' + imagePath.substring(indexOfExt) + '"'
						});
					}
				}
			}
		}

		// make "all" pkg unique
		pkg_all = _.uniq(pkg_all, function (resource) {
			if (_.isString(resource)) {
				resource = RSX[resource.replace("RSX.", "")];
			}
			return resource.name.replace(/['"]/g, "");
		});

		// check all package resource entries for invalid files or formats
		for (var i = 0, il = pkg_all.length; i < il; i++) {
			var resource = pkg_all[i];
			if (_.isString(resource)) {
				resource = RSX[resource.replace("RSX.", "")];
			}

			// audio should always be m4a or mp4
			var audio = resource.audio;
			if (audio != null) {
				var audioExt = helpers.getContentAfterLastDot(audio);
				if (!(/m4a|mp4/i.test(audioExt))) {
					throw new Error(resource.name + " uses an invalid audio format (" + audioExt + "), please use m4a or mp4 instead.");
				}
			}
		}

		// store "all" pkg
		PKGS["all"] = pkg_all;

		// convert packages map to json
		var PKGS_JSON = j2j.output(PKGS);

		// preserve escaped quotes and strip all other quotes
		PKGS_JSON = PKGS_JSON.replace(/\\("|')/g, "$1");
		PKGS_JSON = PKGS_JSON.replace(/["'](?!["'])/g, "");

		// write packages map
		var PKGS_CONTENT = "";
		PKGS_CONTENT += 'var RSX = require("./resources");\n';
		PKGS_CONTENT += 'var Cards = require("./../sdk/cards/cardsLookupComplete");\n';
		PKGS_CONTENT += '\n';
		PKGS_CONTENT += '/**\n';
		PKGS_CONTENT += ' * packages.js - map of packages to resources.\n';
		PKGS_CONTENT += '*/\n';
		PKGS_CONTENT += '\n';
		PKGS_CONTENT += "var PKGS = " + PKGS_JSON + ";\n";
		PKGS_CONTENT += '\n';
		PKGS_CONTENT += "PKGS.getPkgForIdentifier = function (pkgIdentifier) { return PKGS[pkgIdentifier] || []; };\n";
		PKGS_CONTENT += "PKGS.setPkgForIdentifier = function (pkgIdentifier, pkg) { PKGS[pkgIdentifier] = pkg || []; };\n";
		PKGS_CONTENT += "PKGS.addToPkgForIdentifier = function (pkgIdentifier, pkgAdditions) { PKGS[pkgIdentifier] = (PKGS[pkgIdentifier] || []).concat(pkgAdditions || []); };\n";
		PKGS_CONTENT += "PKGS.getFactionGamePkgIdentifier = function (factionIdentifier) { return '" + FACTION_GAME_PKG_PREFIX + "' + factionIdentifier; };\n";
		PKGS_CONTENT += "PKGS.getFactionInspectPkgIdentifier = function (factionIdentifier) { return '" + FACTION_INSPECT_PKG_PREFIX + "' + factionIdentifier; };\n";
		PKGS_CONTENT += "PKGS.getCardGamePkgIdentifier = function (cardIdentifier) { return '" + CARD_GAME_PKG_PREFIX + "' + Cards.getNonPrismaticCardId(cardIdentifier); };\n";
		PKGS_CONTENT += "PKGS.getCardInspectPkgIdentifier = function (cardIdentifier) { return '" + CARD_INSPECT_PKG_PREFIX + "' + Cards.getNonPrismaticCardId(cardIdentifier); };\n";
		PKGS_CONTENT += "PKGS.getCardBackPkgIdentifier = function (cardBackIdentifier) { return '" + CARD_BACK_PKG_PREFIX + "' + parseInt(cardBackIdentifier); };\n";
		PKGS_CONTENT += "PKGS.getBattleMapPkgIdentifier = function (battleMapIdentifier) { return '" + BATTLE_MAP_PKG_PREFIX + "' + battleMapIdentifier; };\n";
		PKGS_CONTENT += "PKGS.getChapterPkgIdentifier = function (chapterIdentifier) { return '" + CHAPTER_PKG_PREFIX + "' + chapterIdentifier; };\n";
		PKGS_CONTENT += "PKGS.getChallengePkgIdentifier = function (challengeIdentifier) { return '" + CHALLENGE_PKG_PREFIX + "' + challengeIdentifier; };\n";
		PKGS_CONTENT += '\n';
		PKGS_CONTENT += "module.exports = PKGS;\n";

		// write packages map
		return Promise.all([
			helpers.writeFile(dir + "/../app/data/packages.js", PKGS_CONTENT)
		]);
	}).then(function () {
		console.log(" [GP] Packages wrapped!");
		process.exit(0);
	}).catch(function (error) {
		console.log(" [GP] [ERR] Package generation failed -> " + error.stack);
	});
})();
