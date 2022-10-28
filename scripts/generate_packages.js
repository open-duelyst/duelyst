/**
 * This script generates resource packages for dynamic loading by parsing all source files.
 * To add resources used in a source file to a specific package, add the following comment:
 * //pragma PKGS: package_name_1 package_name_2 package_name_n
 */
(function () {
  const dir = __dirname;

  // parse arguments for flags
  const args = process.argv.slice(2);
  let debug;
  let forceAllResources;
  for (let a = 0; a < args.length; a++) {
    const arg = args[a];
    if (arg === '-d' || arg === '-debug') {
      debug = true;
    } else if (arg === '-fa' || arg === '-force-all-resources') {
      forceAllResources = true;
    }
  }
  const path = require('path');
  require('app-module-path').addPath(path.join(__dirname, '..'));
  const Promise = require('bluebird');
  const _ = require('underscore');
  const j2j = require('j2j');
  const helpers = require('./helpers');
  const coffeScript = require('coffeescript/register');
  const Cards = require('app/sdk/cards/cardsLookupComplete.coffee');
  const FactionsLookup = require('app/sdk/cards/factionsLookup.coffee');
  const FactionFactory = require('app/sdk/cards/factionFactory.coffee');
  const CodexChapters = require('app/sdk/codex/codexChapterLookup.coffee');
  const CosmeticsLookup = require('app/sdk/cosmetics/cosmeticsLookup.coffee');
  const CONFIG = require('app/common/config');
  const UtilsJavascript = require('app/common/utils/utils_javascript');
  const DATA = require('app/data.coffee');
  const FX = require('app/data/fx');
  const RSX = require('app/data/resources');
  const PKGS_DEF = require('app/data/packages_predefined');
  const PKGS = {};

  const getResources = function (resourceIdentifier) {
    let resources = [];

    // get direct resource
    const resource = RSX[resourceIdentifier];
    if (resource != null) {
      resources.push(resource);
    }

    // reverse map
    resources = resources.concat(RSX.getResourcesByPath(resourceIdentifier));

    return resources;
  };

  const RSX_MAP = {};
  const RSX_NON_ALIASED = [];
  const RSX_NON_ALIASED_MATCHES = {};
  const WARN_WHEN_REQUIRES_MORE_RSX_THAN = 50;

  const getRelativePath = function (file) {
    return path.relative(__dirname, file).replace(/^(\.\.[\/\\])*?(?=\w)/, '');
  };

  const resourcesForFile = function (file, content) {
    // search for rsx key partials
    let resources = [];
    const dynamicResources = [];

    // setup method to parse partials
    const parsePartials = function (match, p1) {
      if (!/getResourcePathForScale/i.test(match)) {
        let partials;
        let isDynamic;
        let partialAtBeginning = true;
        if (/RSX\[/.test(match)) {
          isDynamic = true;
          // filter for partials that begin with a set of quotes
          partials = p1.match(/"(?:[^"])*"|'(?:[^'])*'|\}(.*?)\$\{|\}(.*?)\`|\`(.*?)\$\{/g) || [];
          partialAtBeginning = partials.length <= 1;
          partials = _.map(partials, (partial) => partial.replace(/["'`}]|(\$\{)/g, ''));
          partials = _.reject(partials, (partial) => !partial || partial.length < 2 || !isNaN(parseInt(partial)));
        } else {
          isDynamic = false;
          partials = [p1];
        }

        // search for partial key matches in RSX
        let matchFound = false;
        for (let i = 0, il = partials.length; i < il; i++) {
          const partial = partials[i];
          const partialEscaped = UtilsJavascript.escapeStringForRegexSearch(partial);
          const resourceMatchRegExp = new RegExp((partialAtBeginning ? '^' : '') + partialEscaped);
          for (const key in RSX) {
            const resource = RSX[key];
            if (!_.isFunction(resource)
              && (resourceMatchRegExp.test(key)
              || (resource.img != null && resourceMatchRegExp.test(resource.img))
              || (resource.plist != null && resourceMatchRegExp.test(resource.plist))
              || (resource.audio != null && resourceMatchRegExp.test(resource.audio))
              || (resource.font != null && resourceMatchRegExp.test(resource.font)))
            ) {
              if (/getResourcePathForScale/i.test(match)) {
                console.log(match, p1, 'getResourcePathForScale match', key);
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
          console.log(` [GP] [WARN] ${getRelativePath(file)} -> matched RSX search but no resource could be found for: ${match}`);
        }
      }
    };

    content.replace(/(?:RSX[.\[]{1})(.*?)(?=\]|\.name|\.img|\.plist|\.audio|\.font|\.framePrefix|\.frame)/g, parsePartials);
    content.replace(/(?:RSX\.)(\w+)/g, parsePartials);

    // search for data key partials
    content.replace(/(?:DATA\..*?)\(["'](.*?)["']\)/g, (match, p1) => {
      resources = resources.concat(resourcesForFXResourceStrings(p1));
    });

    return { resources, dynamicResources };
  };

  const mapResourcesForFile = function (file, content) {
    const relativePath = getRelativePath(file);

    // replace soft returns
    content = content.replace('\r', '\n');

    // check for package flag
    // do this before stripping comments as this flag may be in a comment
    let pkgNames = [];
    const pkgFlagsBlocks = content.match(/pragma[\s\t]*?PKGS:.*?[\r\n]/);
    if (pkgFlagsBlocks != null) {
      for (var i = 0; i < pkgFlagsBlocks.length; i++) {
        const pkgFlagBlock = pkgFlagsBlocks[i].replace(/pragma[\s\t]*?PKGS:[\s\t]*?(.*?)[\r\n]/, '$1').replace(/\t/g, ' ').replace(/^\s*(.*?)\s*$/, '$1').replace(/\s+/g, ' ');
        pkgNames = pkgNames.concat(pkgFlagBlock.split(' '));
      }
    }

    // remove comments
    content = helpers.stripComments(content);

    const resourcesData = resourcesForFile(file, content);
    const { resources } = resourcesData;
    const { dynamicResources } = resourcesData;
    if (resources.length > 0 || dynamicResources.length > 0) {
      // store resources in map by relative path
      RSX_MAP[relativePath] = [].concat(resources, dynamicResources);

      // add resources to packages
      for (var i = 0; i < pkgNames.length; i++) {
        const pkgName = pkgNames[i];
        addPkgResources(pkgName, resources);
      }

      // add dynamic resources to all package
      addPkgResources('all', dynamicResources);
    }

    // search for non-aliased paths in file and add to all resources only
    // these resource usages should only ever be in template(hbs) or style(css/scss) files
    // and those don't get loaded dynamically but rather as the styling is applied
    // NOTE: this will attempt to handle dynamic resource usage in template files (ex: resources/crests/crest_{{faction_id}}.png)
    content.replace(/[\/\\]?resources[\/\\].*?['"({]?.*?['")}]/g, (match) => {
      // trim match for last quote
      match = match.replace(/(.*\w)['")}].*$/, '$1');
      // filter for dynamic resource usage
      const partial = match.replace(/([\/\\]?resources[\/\\][^.]*?)['"({].*$/, '$1');
      let ext = helpers.getContentAfterLastDot(match);
      ext = ext && ext.toLowerCase();
      const needsPartialMatch = partial !== match || !ext;

      let resources;
      if (needsPartialMatch) {
        // search for partial key matches in RSX
        resources = [];
        const resourceMatchRegExp = new RegExp(`^${UtilsJavascript.escapeStringForRegexSearch(partial)}`);
        for (const key in RSX) {
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
        for (let i = 0, il = resources.length; i < il; i++) {
          var resource = resources[i];
          const resourceKey = RSX.getResourceKeyByResourceName(resource.name);
          RSX_NON_ALIASED.push(`RSX.${resourceKey}`);
        }
      } else if (!needsPartialMatch) {
        if (RSX_NON_ALIASED_MATCHES[match] == null) {
          // make temporary resource and add to list of non aliased resources
          var resource = {
            name: `"${helpers.getFileName(match)}"`,
          };
          if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'bmp' || ext === 'gif') {
            resource.img = `"${match}"`;
          } else if (ext === 'ogg' || ext === 'wav' || ext === 'mp3' || ext === 'mp4' || ext === 'm4a') {
            resource.audio = `"${match}"`;
          } else if (ext === 'ttf' || ext === 'fnt' || ext === 'font' || ext === 'eot' || ext === 'woff' || ext === 'svg') {
            resource.font = `"${match}"`;
          } else if (ext === 'plist') {
            resource.plist = `"${match}"`;
          }
          if (resource.img != null || resource.audio != null || resource.font != null || resource.plist != null) {
            RSX_NON_ALIASED.push(resource);
            RSX_NON_ALIASED_MATCHES[match] = resource;

            if (resource.img != null && helpers.getContentAfterLastDot(file).toLowerCase() !== 'css') {
              // when not processing css, add versions at all resolutions
              const resourceName = resource.name.replace(/['"]/g, '');
              const imagePath = resource.img.replace(/['"]/g, '');
              const indexOfExt = imagePath.lastIndexOf('.');
              for (let j = CONFIG.RESOURCE_SCALES.length - 1; j >= 0; j--) {
                const resourceScale = CONFIG.RESOURCE_SCALES[j];
                const imagePathScaled = `${imagePath.substring(0, indexOfExt)}@${resourceScale}x${imagePath.substring(indexOfExt)}`;
                const resourceScaled = {
                  name: `"${resourceName}@${resourceScale}x` + '"',
                  img: `"${imagePathScaled}"`,
                };
                RSX_NON_ALIASED.push(resourceScaled);
                RSX_NON_ALIASED_MATCHES[imagePathScaled] = resourceScaled;
              }
            }
          } else {
            console.log(` [GP] [WARN] ${getRelativePath(file)} -> has non aliased empty resource: ${match}`);
          }
        }
      } else if (debug) {
        console.log(` [GP] [WARN] ${getRelativePath(file)} -> has non aliased path that may not get loaded: ${match}`);
      }
    });

    return Promise.resolve();
  };

  const SDK_FX_RESOURCE_MAP = {};
  const SDK_RESOURCE_MAP = {};
  const SDK_ACTION_MAP = {};
  const SDK_MODIFIER_MAP = {};
  const SDK_SUPERCLASS_MAP = {};
  const mapResourcesForSDKFile = function (file, content) {
    const promise = mapResourcesForFile(file, content);
    const fileName = helpers.getFileName(file);
    const className = fileName[0].toUpperCase() + fileName.slice(1);

    // remove comments and soft returns
    content = helpers.stripComments(content).replace('\r', '\n');

    // look for fx resource in file
    const fxResourceBlocks = content.match(/(fxResource|cardFXResource)[\s\t]*?[:=][\s\t]*?[^null][\s\S]*?\]/g);
    if (fxResourceBlocks != null && fxResourceBlocks.length > 0) {
      for (var i = 0, il = fxResourceBlocks.length; i < il; i++) {
        const fxResourceBlock = fxResourceBlocks[i];
        const fxResourceMatches = fxResourceBlock.match(/["']FX\..*?["']/g);
        if (fxResourceMatches != null && fxResourceMatches.length > 0) {
          for (let j = 0; j < fxResourceMatches.length; j++) {
            const fxResourceMatch = fxResourceMatches[j].replace(/["']/g, '');
            if (SDK_FX_RESOURCE_MAP[className] == null) {
              SDK_FX_RESOURCE_MAP[className] = [];
            }
            SDK_FX_RESOURCE_MAP[className].push(fxResourceMatch);
          }
        }
      }
    }

    // look for resources in file
    const resourcesData = resourcesForFile(file, content);
    const { resources, dynamicResources } = resourcesData;

    if (resources.length > 0 || dynamicResources.length > 0) {
      const allResources = [].concat(resources, dynamicResources);
      addPkgResources('all', allResources);
      SDK_RESOURCE_MAP[className] = (SDK_RESOURCE_MAP[className] || []).concat(allResources);
    }

    // look for action usage in file
    const actionBlocks = content.match(/new ([A-Z]\w*?Action)(?=\()|([A-Z]\w*?Action)(?=\.type)/g);
    if (actionBlocks != null && actionBlocks.length > 0) {
      for (var i = 0, il = actionBlocks.length; i < il; i++) {
        const actionClass = actionBlocks[i].replace(/new /g, '');
        if (SDK_ACTION_MAP[className] == null) { SDK_ACTION_MAP[className] = []; }
        SDK_ACTION_MAP[className].push(actionClass);
      }
    }

    // look for modifier usage in file
    const modifiersBlock = content.match(/new ((?:Player)?Modifier\w+?)(?=\()|((?:Player)?Modifier\w+?)(?=\.type|\.createContext)/g);
    if (modifiersBlock != null && modifiersBlock.length > 0) {
      for (var i = 0, il = modifiersBlock.length; i < il; i++) {
        const modifierClass = modifiersBlock[i].replace(/new /g, '');
        if (SDK_MODIFIER_MAP[className] == null) { SDK_MODIFIER_MAP[className] = []; }
        SDK_MODIFIER_MAP[className].push(modifierClass);
      }
    }

    // determine for super class
    const superclassBlock = content.match(/extends (\w+?)[\r\n]/);
    if (superclassBlock != null && superclassBlock.length > 0) {
      const superclassName = superclassBlock[0].replace(/extends (\w+?)[\r\n]/g, '$1');
      SDK_SUPERCLASS_MAP[className] = superclassName;
    }

    return promise;
  };

  const resourcesBySDKClassName = function (className) {
    let resources = [];
    const classNamesSeen = {};

    var walkSDKMapsForResources = function (currentClassName) {
      if (currentClassName != null && !classNamesSeen[currentClassName]) {
        classNamesSeen[currentClassName] = true;

        // add from fx resource map
        const resourcesFromMap = SDK_RESOURCE_MAP[currentClassName];
        if (resourcesFromMap != null && resourcesFromMap.length > 0) {
          resources = resources.concat(resourcesFromMap);
        }

        // add from action map
        const actionClassNames = SDK_ACTION_MAP[currentClassName];
        if (actionClassNames != null) {
          for (var j = 0; j < actionClassNames.length; j++) {
            walkSDKMapsForResources(actionClassNames[j]);
          }
        }

        // add from modifier map
        const modifierClassNames = SDK_MODIFIER_MAP[currentClassName];
        if (modifierClassNames != null) {
          for (var j = 0; j < modifierClassNames.length; j++) {
            walkSDKMapsForResources(modifierClassNames[j]);
          }
        }

        // add from super class map
        const superclassName = SDK_SUPERCLASS_MAP[currentClassName];
        if (superclassName != null) {
          walkSDKMapsForResources(superclassName);
        }
      }
    };

    walkSDKMapsForResources(className);

    return _.uniq(resources);
  };

  const fxResourceStringsBySDKClassName = function (className) {
    let fxResourceStrings = [];
    const classNamesSeen = {};

    var walkSDKMapsForFXResourceStrings = function (currentClassName) {
      if (currentClassName != null && !classNamesSeen[currentClassName]) {
        classNamesSeen[currentClassName] = true;

        // add from fx resource map
        const fxResourceStringsFromMap = SDK_FX_RESOURCE_MAP[currentClassName];
        if (fxResourceStringsFromMap != null && fxResourceStringsFromMap.length > 0) {
          fxResourceStrings = fxResourceStrings.concat(fxResourceStringsFromMap);
        }

        // add from action map
        const actionClassNames = SDK_ACTION_MAP[currentClassName];
        if (actionClassNames != null) {
          for (var j = 0; j < actionClassNames.length; j++) {
            walkSDKMapsForFXResourceStrings(actionClassNames[j]);
          }
        }

        // add from modifier map
        const modifierClassNames = SDK_MODIFIER_MAP[currentClassName];
        if (modifierClassNames != null) {
          for (var j = 0; j < modifierClassNames.length; j++) {
            walkSDKMapsForFXResourceStrings(modifierClassNames[j]);
          }
        }

        // add from super class map
        const superclassName = SDK_SUPERCLASS_MAP[currentClassName];
        if (superclassName != null) {
          walkSDKMapsForFXResourceStrings(superclassName);
        }
      }
    };

    walkSDKMapsForFXResourceStrings(className);

    return _.uniq(fxResourceStrings);
  };

  var walkFXDataForResources = function (data) {
    let resources = [];

    const properties = Object.keys(data);
    for (let i = 0, il = properties.length; i < il; i++) {
      const property = properties[i];
      let value = data[property];
      if (value != null) {
        if (/spriteIdentifier|plistFile/.test(property)) {
          if (!_.isArray(value)) {
            value = [value];
          }
          for (let j = 0; j < value.length; j++) {
            const resourceIdentifier = value[j];
            const resourcesForIdentifier = getResources(resourceIdentifier);
            for (let k = 0, kl = resourcesForIdentifier.length; k < kl; k++) {
              const resource = resourcesForIdentifier[k];
              const resourceKey = RSX.getResourceKeyByResourceName(resource.name);
              resources.push(`RSX.${resourceKey}`);
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
    let resources = [];

    if (fxResourceStrings != null) {
      if (!_.isArray(fxResourceStrings)) {
        fxResourceStrings = [fxResourceStrings];
      }
      for (let i = 0; i < fxResourceStrings.length; i++) {
        const fxResourceString = fxResourceStrings[i];
        const fxData = DATA.dataForIdentifier(fxResourceString);
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
      let pkg = PKGS[pkgName];
      if (pkg == null) {
        pkg = PKGS[pkgName] = [];
      }

      // add resources
      for (let i = 0; i < resources.length; i++) {
        let resource = resources[i];

        // strip spaces, tabs, and newlines
        resource = resource.replace(/[\s\t\r\n]/g, '');

        // add resource if valid
        if (resource != '' && RSX[resource.replace('RSX.', '')] != null) {
          // ensure resource begins with RSX.
          if (/^(?!RSX\.).+/.test(resource)) {
            resource = `RSX.${resource}`;
          }

          // add resource to package
          pkg.push(resource);
        }
      }
    }
  };

  const CARD_GAME_PKG_PREFIX = 'card_game_';
  const CARD_INSPECT_PKG_PREFIX = 'card_inspect_';
  const CARD_BACK_PKG_PREFIX = 'card_back_';
  const FACTION_GAME_PKG_PREFIX = 'faction_game_';
  const FACTION_INSPECT_PKG_PREFIX = 'faction_inspect_';
  const CHAPTER_PKG_PREFIX = 'chapter_';
  const CHALLENGE_PKG_PREFIX = 'challenge_';
  const CARD_DATA_BY_ID_STRING = {};
  const CARD_DATA_BY_ID = {};

  let hasCurrentCard = false;
  let currentCardContent = '';
  let cardFactoryLineInsideComment = false;
  let nextLine = false;
  const parseCardFactoryLine = function (file, line) {
    // remove plain comments and soft returns
    line = helpers.stripComments(line).replace('\r', '\n');

    // ignore lines between complex comments
    // will fail if line contains actual code before/after comment
    const indexOfComment = line.indexOf('###');
    if (cardFactoryLineInsideComment) {
      if (nextLine) {
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
        currentCardContent += `${line}\n`;
      }
    }

    return Promise.resolve();
  };

  var parseCurrentSdkCardContent = function () {
    if (hasCurrentCard && currentCardContent) {
      parseSdkCardContent(currentCardContent);
      currentCardContent = '';
      hasCurrentCard = false;
    }
  };

  var parseSdkCardContent = function (cardContent) {
    // card id
    const idStringStartIndex = cardContent.indexOf('Cards.');
    const idStringEndIndex = cardContent.indexOf(')');
    let cardIdString = cardContent.slice(idStringStartIndex, idStringEndIndex);
    cardIdString = cardIdString.replace(/\n|\r/g, '');
    const idStringParts = cardIdString.split('.');
    let cardId = Cards;
    for (let j = 1; j < idStringParts.length; j++) {
      cardId = cardId[idStringParts[j]];
      if (cardId == null) {
        console.log(` [GP] [WARN] ${cardIdString} -> not found in cards lookup at part: `, idStringParts[j]);
        break;
      }
    }

    // faction id
    let factionIdString;
    let factionId;
    factionIdString = cardContent.match(/factionId(.*?)Factions\.(\w*)\b/);
    factionId = FactionsLookup[factionIdString] || FactionsLookup.Neutral;
    if (factionIdString != null) {
      factionIdString = factionIdString[0].replace(/(.*?)Factions\./, '');
      factionId = FactionsLookup[factionIdString];
    }

    // class name
    const className = cardContent.match(/card[\s\t]*?=[\s\t]*?new (\w+?)\(/)[1];

    // get card type string based on class name
    let cardTypeString;
    if (/Artifact/i.test(className)) {
      cardTypeString = 'Artifact';
    } else if (/Unit/i.test(className)) {
      cardTypeString = 'Unit';
    } else if (/Tile/i.test(className)) {
      cardTypeString = 'Tile';
    } else {
      cardTypeString = 'Spell';
    }

    // check for general
    const isGeneral = /setIsGeneral\(.*?true.*?\)/.test(cardContent);

    // add data to master maps
    const cardData = {
      cardContent,
      cardId,
      cardIdString,
      cardTypeString,
      factionId,
      factionIdString,
      className,
      isGeneral,
    };
    CARD_DATA_BY_ID_STRING[cardIdString] = cardData;
    CARD_DATA_BY_ID[cardId] = cardData;

    return Promise.resolve();
  };

  const parseCardFactoryData = function () {
    // parse any current card content left over
    parseCurrentSdkCardContent();

    const resourcesForAllPkg = [];

    // find resources for each card
    const cardIdStrings = Object.keys(CARD_DATA_BY_ID_STRING);
    for (let i = 0, il = cardIdStrings.length; i < il; i++) {
      const cardIdString = cardIdStrings[i];
      const cardData = CARD_DATA_BY_ID_STRING[cardIdString];
      const { cardContent } = cardData;
      const { factionId } = cardData;
      const { factionIdString } = cardData;
      const { cardId } = cardData;
      const { className } = cardData;
      const { isGeneral } = cardData;
      cardData.resources = {
        animResources: [],
        animResourcesForCardInspect: [],
        animResourcesForFactionInspect: [],
        soundResources: [],
        soundResourcesForCardInspect: [],
        soundResourcesForFactionInspect: [],
        miscResources: [],
        fxResources: [],
        classResources: [],
      };

      // search for misc resources
      const resourceStrings = cardContent.match(/(?:set\w*?Resource\()*RSX\..*?(?=[\.\W\r\n])/g) || [];
      for (var j = 0; j < resourceStrings.length; j++) {
        const resourceString = resourceStrings[j];
        const resource = resourceString.replace(/set\w*?Resource\(/g, '').replace(/[\t\s\r\n"']/g, '');

        resourcesForAllPkg.push(resource);
      }

      // anim resources for inspect
      const animResourceBlock = cardContent.match(/setBaseAnimResource\([\s\S]*?\)/g);
      if (animResourceBlock != null) {
        const animResourceLines = animResourceBlock[0].match(/(\w+)[\s\t]*?:[\s\t]*?(RSX\..*?)(?=[\.\r\n])/g) || [];
        for (var j = 0; j < animResourceLines.length; j++) {
          const animResourceLine = animResourceLines[j];
          const animResourceName = animResourceLine.replace(/(\w+)[\s\t]*?:[\s\t]*?RSX\..*?$/, '$1').replace(/[\t\s\r\n"']/g, '').toLowerCase();
          const animResource = animResourceLine.replace(/\w+[\s\t]*?:[\s\t]*?(RSX\..*?)$/, '$1').replace(/[\t\s\r\n"']/g, '');
          cardData.resources.animResources.push(animResource);
          if (/breathing|idle|attack|active/i.test(animResourceName)) {
            cardData.resources.animResourcesForCardInspect.push(animResource);
          }
        }
      }

      // sound resources
      const soundResourceBlock = cardContent.match(/setBaseSoundResource\([\s\S]*?\)/g);
      if (soundResourceBlock != null) {
        const soundResourcesLines = soundResourceBlock[0].match(/(\w+)[\s\t]*?:[\s\t]*?(RSX\..*?)(?=[\.\r\n])/g) || [];
        for (var j = 0; j < soundResourcesLines.length; j++) {
          const soundResourceLine = soundResourcesLines[j];
          const soundResourceName = soundResourceLine.replace(/(\w+)[\s\t]*?:[\s\t]*?RSX\..*?$/, '$1').replace(/[\t\s\r\n"']/g, '').toLowerCase();
          const soundResource = soundResourceLine.replace(/\w+[\s\t]*?:[\s\t]*?(RSX\..*?)$/, '$1').replace(/[\t\s\r\n"']/g, '');
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
      let fxResourceStrings = [];
      const fxResourceBlocks = cardContent.match(/fxResource[(:\s]*?\[([\s\S]*?)\]/ig);
      if (fxResourceBlocks != null) {
        for (var j = 0; j < fxResourceBlocks.length; j++) {
          const fxResourceBlock = fxResourceBlocks[j];
          const fxResourceBlockStrings = fxResourceBlock.match(/["'](.*?)["']/g);
          for (let k = 0; k < fxResourceBlockStrings.length; k++) {
            fxResourceStrings.push(fxResourceBlockStrings[k].replace(/["']/g, ''));
          }
        }
      }

      // get resources used by card class name
      const resourcesForClassName = resourcesBySDKClassName(className);
      if (resourcesForClassName != null && resourcesForClassName.length > 0) {
        cardData.resources.classResources = cardData.resources.classResources.concat(resourcesForClassName);
      }

      // get fx resources strings this card may use
      const fxResourceStringsForClassName = fxResourceStringsBySDKClassName(className);
      if (fxResourceStringsForClassName != null && fxResourceStringsForClassName.length > 0) {
        fxResourceStrings = fxResourceStrings.concat(fxResourceStringsForClassName);
      }

      // add fx resource strings specific to card faction unless neutral
      // this is necessary for cases where a faction card is used in a game without that faction
      if (factionId !== FactionsLookup.Neutral) {
        const factionData = FactionFactory.factionForIdentifier(factionId);
        if (factionData != null) {
          const factionFXResource = factionData.fxResource;
          for (var j = 0, jl = factionFXResource.length; j < jl; j++) {
            const factionFXResourceString = factionFXResource[j];
            // neutral faction fx resources are always loaded
            if (!(/neutral$/i.test(factionFXResourceString))) {
              fxResourceStrings.push(factionFXResourceString);
            }
          }
        }
      }

      // check for modifier classes used by this card
      const modifierBlocks = cardContent.match(/new ((?:Player)?Modifier\w+?)(?=\()|((?:Player)?Modifier\w+?)(?=\.type|\.createContext)/g);
      if (modifierBlocks != null) {
        for (var j = 0; j < modifierBlocks.length; j++) {
          const modifierClass = modifierBlocks[j].replace(/new /g, '');

          // get resources used by modifier classes this card uses
          const resourcesForModifierClassName = resourcesBySDKClassName(modifierClass);
          if (resourcesForModifierClassName != null && resourcesForModifierClassName.length > 0) {
            cardData.resources.classResources = cardData.resources.classResources.concat(resourcesForModifierClassName);
          }

          // fx resource strings of any modifiers specific to card definition
          const fxResourceStringsForModifierClassName = fxResourceStringsBySDKClassName(modifierClass);
          if (fxResourceStringsForModifierClassName != null && fxResourceStringsForModifierClassName.length > 0) {
            fxResourceStrings = fxResourceStrings.concat(fxResourceStringsForModifierClassName);
          }
        }
      }

      // get fx resources from fx resource strings for this card
      const fxResources = resourcesForFXResourceStrings(fxResourceStrings);
      if (fxResources != null && fxResources.length > 0) {
        cardData.resources.fxResources = cardData.resources.fxResources.concat(fxResources);
      }

      // add all card resources to packages
      addPkgResourcesForCard(cardId, factionId, cardData.resources);
    }

    addPkgResources('all', resourcesForAllPkg);

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
      addPkgResources('nongame', resources.miscResources);
    }
  };

  const parseModifier = function (file, content) {
    const fileName = helpers.getFileName(file);
    const className = fileName[0].toUpperCase() + fileName.slice(1);
    let modifierType = content.match(/type:.*?['"](\w+?)['"]/);
    if (modifierType != null) {
      modifierType = modifierType[1];
    } else {
      console.log(` [GP] [WARN] ${className} -> has no 'type' property!`);
      modifierType = className;
    }

    let resourcesForPkg = [];
    let fxResourceStrings = [];

    // get resources used by modifier class
    const resourcesForClassName = resourcesBySDKClassName(className);
    if (resourcesForClassName != null && resourcesForClassName.length > 0) {
      resourcesForPkg = resourcesForPkg.concat(resourcesForClassName);
    }

    // fx resource strings for modifier
    const fxResourceStringsForClassName = fxResourceStringsBySDKClassName(className);
    if (fxResourceStringsForClassName != null && fxResourceStringsForClassName.length > 0) {
      fxResourceStrings = fxResourceStrings.concat(fxResourceStringsForClassName);
    }

    // get fx resources from fx resource strings
    const fxResources = resourcesForFXResourceStrings(fxResourceStrings);
    if (fxResources != null && fxResources.length > 0) {
      resourcesForPkg = resourcesForPkg.concat(fxResources);
    }

    // add resources to a package for this modifier
    addPkgResources(modifierType, resourcesForPkg);

    return Promise.resolve();
  };

  const parseFactionFactory = function (file, content) {
    // remove comments and soft returns
    content = helpers.stripComments(content).replace('\r', '\n');

    const resourcesForAllPkg = [];

    // extract all resources for each faction in faction factory
    const factionBlocks = content.split(/fmap\[[\s\t]*?Factions\.\w+\][\s\t]*?=/);
    for (let i = 1, il = factionBlocks.length; i < il; i++) {
      const factionBlock = factionBlocks[i];
      const factionAlias = factionBlock.match(/id:[\s\t]*?Factions\.(\w+)[\r\n]/)[1];
      const factionId = FactionsLookup[factionAlias];
      if (factionId != null) {
        let factionResourcesForGamePkg = [];
        const factionResourcesForInspectPkg = [];

        // find all resources
        const resourceStrings = factionBlock.match(/RSX\..*?(?=[\.\W\r\n])/g) || [];
        for (var j = 0; j < resourceStrings.length; j++) {
          const resourceString = resourceStrings[j];
          const resourceName = resourceString.replace(/RSX\./g, '').replace(/[\W\t\s\r\n"']/g, '');
          const resource = resourceString.replace(/[\t\s\r\n"']/g, '');

          resourcesForAllPkg.push(resource);
        }

        // add faction fx resources
        const fxResourcesBlock = factionBlock.match(/fxResource.*?\[[\s\S]*?\]/g);
        if (fxResourcesBlock != null) {
          const fxResourceStrings = fxResourcesBlock[0].match(/["'].*?["']/g) || [];
          for (var j = 0; j < fxResourceStrings.length; j++) {
            fxResourceStrings[j] = fxResourceStrings[j].replace(/["']/g, '');
          }
          const factionResourcesForFXPkg = resourcesForFXResourceStrings(fxResourceStrings);
          factionResourcesForGamePkg = factionResourcesForGamePkg.concat(factionResourcesForFXPkg);
        }

        addPkgResources(FACTION_GAME_PKG_PREFIX + factionId, factionResourcesForGamePkg);
        addPkgResources(FACTION_INSPECT_PKG_PREFIX + factionId, factionResourcesForInspectPkg);
        addPkgResources('nongame', factionResourcesForInspectPkg);
      }
    }

    addPkgResources('all', resourcesForAllPkg);

    return Promise.resolve();
  };

  const parseCodex = function (file, content) {
    // remove comments and soft returns
    content = helpers.stripComments(content).replace('\r', '\n');

    // extract all resources for each chapter in codex
    const chapterBlocks = content.split(/\[[\s\t]*?CodexChapters\./);
    for (let i = 1, il = chapterBlocks.length; i < il; i++) {
      const chapterBlock = chapterBlocks[i];
      const chapterCategory = chapterBlock.match(/(.*?)[\W\r\n]/)[1];
      const chapterId = CodexChapters[chapterCategory];
      const chapterResourcesForPkg = [];

      // find all resources
      const resourceStrings = chapterBlock.match(/RSX\..*?(?=[\.\W\r\n])/g) || [];
      for (let j = 0; j < resourceStrings.length; j++) {
        const resourceString = resourceStrings[j];
        const resourceName = resourceString.replace(/RSX\./g, '').replace(/[\W\t\s\r\n"']/g, '');
        const resource = resourceString.replace(/[\t\s\r\n"']/g, '');

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

  const CHALLENGE_SUPERCLASS_MAP = {};

  const parseChallenge = function (file, content) {
    // remove comments and soft returns
    content = helpers.stripComments(content).replace('\r', '\n');

    // get challenge type for package identifier
    let challengeType = content.match(/type[\s\t]*?:[\s\t]*?["'](\w+)['"]/);
    if (challengeType != null) {
      challengeType = challengeType[1];

      // find all resources
      const challengeResourcesForPkg = [];
      const resourceStrings = content.match(/RSX\..*?(?=[\.\W\r\n])/g) || [];
      for (let j = 0; j < resourceStrings.length; j++) {
        const resourceString = resourceStrings[j];
        const resource = resourceString.replace(/[\t\s\r\n"']/g, '');

        if (challengeType != null) {
          challengeResourcesForPkg.push(resource);
        }
      }

      if (challengeResourcesForPkg.length > 0) {
        addPkgResources(CHALLENGE_PKG_PREFIX + challengeType, challengeResourcesForPkg);
      }

      // determine super class
      const superclassBlock = content.match(/extends (\w+?)[\r\n]/);
      if (superclassBlock != null && superclassBlock.length > 0) {
        const superclassName = superclassBlock[0].replace(/extends (\w+?)[\r\n]/g, '$1');
        CHALLENGE_SUPERCLASS_MAP[challengeType] = superclassName;
      }
    }

    return Promise.resolve();
  };

  const parseChallengeSuperClass = function (file, content) {
    // remove comments and soft returns
    content = helpers.stripComments(content).replace('\r', '\n');

    // get challenge type for package identifier
    let challengeType = content.match(/type[\s\t]*?:[\s\t]*?["'](\w+)['"]/);
    if (challengeType != null) {
      challengeType = challengeType[1];

      // get super class resources recursively
      let superclassName = CHALLENGE_SUPERCLASS_MAP[challengeType];
      while (superclassName != null) {
        const superclassResources = PKGS[CHALLENGE_PKG_PREFIX + superclassName];
        addPkgResources(CHALLENGE_PKG_PREFIX + challengeType, superclassResources);

        // get next superclass
        superclassName = CHALLENGE_SUPERCLASS_MAP[superclassName];
      }
    }

    return Promise.resolve();
  };

  const BATTLE_MAP_PKG_PREFIX = 'battle_map_';
  const parseBattleMap = function (file, content) {
    // remove comments and soft returns
    content = helpers.stripComments(content).replace('\r', '\n');

    // keep a list of all resources in battle map file that aren't specific to a battle map
    const resources = [];

    // setup regex to search for battlemap chunks
    // the global flag is used to keep an internal index counter on the regexp object
    const battleMapRegex = new RegExp('\(BATTLEMAP\.\*\?\)\(\?\=\\W\)', 'g');

    // parse battle map starting at the top level
    let nextBattleMapMatch = battleMapRegex.exec(content);
    let openIndex = 0;
    let closeIndex = 0;
    while (nextBattleMapMatch != null) {
      const battleMapIdString = nextBattleMapMatch[0];
      const battleMapId = CONFIG[battleMapIdString];
      // starting at match index, search for first open char
      openIndex = content.indexOf('{', nextBattleMapMatch.index);
      const lastCloseIndex = closeIndex;
      closeIndex = content.length - 1;
      if (openIndex != -1) {
        // search for match close char
        let levels = 1;
        let charIndex = openIndex + 1;
        while (charIndex < closeIndex) {
          if (content[charIndex] === '{') {
            levels++;
          } else if (content[charIndex] === '}') {
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
        addPkgResources('game', [].concat(resourcesData.resources, resourcesData.dynamicResources));
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
      addPkgResources('game', [].concat(resourcesData.resources, resourcesData.dynamicResources));
    }

    return Promise.resolve();
  };

  const parseCosmeticsFactory = function (file, content) {
    // remove comments and soft returns
    content = helpers.stripComments(content).replace('\r', '\n');

    const resourcesForNonGamePkg = [];
    const resourcesForGamePkg = [];
    const resourcesForShopPkg = [];
    const resourcesForEmotesPkg = [];

    // find all resources for shop
    var resourceStrings = content.match(/RSX\..*?(?=[.\W\r\n])/g) || [];
    for (var j = 0; j < resourceStrings.length; j++) {
      var resourceString = resourceStrings[j];
      var resourceName = resourceString.replace(/RSX\./g, '').replace(/[\W\t\s\r\n"']/g, '');
      var resource = resourceString.replace(/[\t\s\r\n"']/g, '');

      // add to shop resources
      resourcesForShopPkg.push(resource);
    }

    // extract all resources for each emote
    const emoteBlocks = content.split(/\[[\s\t]*?Emote\.(.*?\{[\s\S]*?)[\r\n]\}/);
    for (var i = 1, il = emoteBlocks.length - 1; i < il; i++) {
      const emoteBlock = emoteBlocks[i];
      const factionBlock = emoteBlock.match(/factionId[\s\t]*?:[\s\t]*?Factions\.(\w+)/);
      const factionKey = factionBlock && factionBlock[1];
      var factionId = FactionsLookup[factionKey];
      const unlockableBlock = emoteBlock.match(/unlockable[\s\t]*?:[\s\t]*?(\w+)/);
      const purchasableBlock = emoteBlock.match(/purchasable[\s\t]*?:[\s\t]*?(\w+)/);
      const factionResourcesForGamePkg = [];

      // find all resources
      var resourceStrings = emoteBlock.match(/RSX\..*?(?=[\.\W\r\n])/g) || [];
      for (var j = 0; j < resourceStrings.length; j++) {
        var resourceString = resourceStrings[j];
        var resourceName = resourceString.replace(/RSX\./g, '').replace(/[\W\t\s\r\n"']/g, '');
        var resource = resourceString.replace(/[\t\s\r\n"']/g, '');

        resourcesForEmotesPkg.push(resource);
      }
    }

    // extract all resources for card backs
    const cardBackBlocks = content.split(/\[[\s\t]*?CardBack\.(.*?\{[\s\S]*?)[\r\n]\}/);
    for (var i = 1, il = cardBackBlocks.length - 1; i < il; i++) {
      const cardBackBlock = cardBackBlocks[i];
      const cardBackIdBlock = cardBackBlock.match(/id[\s\t]*?:[\s\t]*?CardBack\.(\w+)/);
      const cardBackIdKey = cardBackIdBlock && cardBackIdBlock[1];
      const cardBackId = CosmeticsLookup.CardBack[cardBackIdKey];

      // find all resources
      const resourcesForCardBack = [];
      var resourceStrings = cardBackBlock.match(/RSX\..*?(?=[.\W\r\n])/g) || [];
      for (var j = 0; j < resourceStrings.length; j++) {
        var resourceString = resourceStrings[j];
        var resourceName = resourceString.replace(/RSX\./g, '').replace(/[\W\t\s\r\n"']/g, '');
        var resource = resourceString.replace(/[\t\s\r\n"']/g, '');

        // add to card back resources
        resourcesForCardBack.push(resource);
      }

      // add to card back package
      addPkgResources(CARD_BACK_PKG_PREFIX + cardBackId, resourcesForCardBack);
    }

    // extract all resources for card skins
    const cardSkinBlocks = content.split(/\[[\s\t]*?CardSkin\.(.*?\{[\s\S]*?)[\r\n]\}/);
    for (var i = 1, il = cardSkinBlocks.length - 1; i < il; i++) {
      const cardSkinBlock = cardSkinBlocks[i];
      const cardSkinIdBlock = cardSkinBlock.match(/id[\s\t]*?:[\s\t]*?CardSkin\.(\w+)/);
      const cardSkinIdKey = cardSkinIdBlock && cardSkinIdBlock[1];
      if (cardSkinIdKey != null) {
        const cardSkinId = CosmeticsLookup.CardSkin[cardSkinIdKey];
        const cardIdBlock = cardSkinBlock.match(/cardId[\s\t]*?:[\s\t]*?(Cards\..*?)[\s\t]*?[\r\n]/);
        const skinNumBlock = cardSkinBlock.match(/skinNum[\s\t]*?:[\s\t]*?(\d*?)[\s\t]*?[\r\n]/);
        if (cardIdBlock == null) {
          console.log(` [GP] [WARN] card skin data for ${cardSkinIdKey} -> has no card id!`);
        } else {
          const skinNum = skinNumBlock && parseInt(skinNumBlock[1]);
          if (skinNum == null || isNaN(skinNum)) {
            console.log(` [GP] [WARN] card skin data for ${cardSkinIdKey} -> has no/invalid skin num!`);
          } else {
            const cardIdString = cardIdBlock[1];
            const cardData = CARD_DATA_BY_ID_STRING[cardIdString];
            const { cardId } = cardData;
            var { factionId } = cardData;
            const skinnedCardId = Cards.getSkinnedCardId(cardId, skinNum);
            const { isGeneral } = cardData;
            const cardResources = cardData.resources;
            const skinResources = _.extend({}, cardResources);

            // anim resources
            const animResources = [];
            const animResourcesForCardInspect = [];
            const animResourcesForFactionInspect = [];
            const animResourceBlock = cardSkinBlock.match(/animResource[\s\t]*?:[\s\t]*?\{[\s\S]*?\}/g);
            if (animResourceBlock != null) {
              const animResourceLines = animResourceBlock[0].match(/(\w+)[\s\t]*?:[\s\t]*?(RSX\..*?)(?=[\.\r\n])/g) || [];
              for (var j = 0; j < animResourceLines.length; j++) {
                const animResourceLine = animResourceLines[j];
                const animResourceName = animResourceLine.replace(/(\w+)[\s\t]*?:[\s\t]*?RSX\..*?$/, '$1').replace(/[\t\s\r\n"']/g, '').toLowerCase();
                const animResource = animResourceLine.replace(/\w+[\s\t]*?:[\s\t]*?(RSX\..*?)$/, '$1').replace(/[\t\s\r\n"']/g, '');
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
            const soundResources = [];
            const soundResourcesForCardInspect = [];
            const soundResourcesForFactionInspect = [];
            const soundResourceBlock = cardSkinBlock.match(/soundResource[\s\t]*?:[\s\t]*?\{[\s\S]*?\}/g);
            if (soundResourceBlock != null) {
              const soundResourcesLines = soundResourceBlock[0].match(/(\w+)[\s\t]*?:[\s\t]*?(RSX\..*?)(?=[\.\r\n])/g) || [];
              for (var j = 0; j < soundResourcesLines.length; j++) {
                const soundResourceLine = soundResourcesLines[j];
                const soundResourceName = soundResourceLine.replace(/(\w+)[\s\t]*?:[\s\t]*?RSX\..*?$/, '$1').replace(/[\t\s\r\n"']/g, '').toLowerCase();
                const soundResource = soundResourceLine.replace(/\w+[\s\t]*?:[\s\t]*?(RSX\..*?)$/, '$1').replace(/[\t\s\r\n"']/g, '');
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
    addPkgResources('nongame', resourcesForNonGamePkg);
    addPkgResources('game', resourcesForGamePkg);
    addPkgResources('shop', resourcesForShopPkg);
    addPkgResources('emotes', resourcesForEmotesPkg);

    return Promise.resolve();
  };

  const parseShopData = function (file, content) {
    // remove comments and soft returns
    content = helpers.stripComments(content).replace('\r', '\n');

    // find all resources
    const resources = [];
    const iconResourceNames = content.match(/icon_image_resource_name['"][\s\t]*?:[\s\t]*?['"]\w+['"]/g) || [];
    const coverResourceNames = content.match(/cover_image_resource_name['"][\s\t]*?:[\s\t]*?['"]\w+['"]/g) || [];
    const resourceNames = [].concat(iconResourceNames, coverResourceNames);
    if (resourceNames != null) {
      for (let i = 0; i < resourceNames.length; i++) {
        const resourceName = resourceNames[i].replace(/[\s\t'":]|icon_image_resource_name|cover_image_resource_name/g, '');
        if (resourceName.length > 0 && RSX[resourceName] != null) {
          resources.push(resourceName);
        } else {
          console.log(` [GP] [WARN] shop resource name ${resourceName} -> appears to be invalid!`);
        }
      }
    }

    addPkgResources('shop', resources);

    return Promise.resolve();
  };

  // begin generate packages
  console.log(' [GP] Packaging resources for STANDARD files...');

  // read all files and exit when complete
  Promise.all([
    helpers.readFile(`${dir}/../app/application.coffee`, mapResourcesForFile),
    helpers.recursivelyReadDirectoryAndFiles(`${dir}/../app/audio`, mapResourcesForFile),
    helpers.recursivelyReadDirectoryAndFiles(`${dir}/../app/ui`, mapResourcesForFile, /\.scss/),
    helpers.readFile(`${dir}/../dist/src/duelyst.css`, mapResourcesForFile),
    helpers.recursivelyReadDirectoryAndFiles(`${dir}/../app/view`, mapResourcesForFile, /battlemap/i),
    helpers.recursivelyReadDirectoryAndFiles(`${dir}/../app/sdk`, mapResourcesForSDKFile, /cardFactory|factory\/|factionFactory|cosmeticsFactory|modifierFactory|actionfactory|codex/i),
  ]).then(() => {
    console.log(' [GP] Resources packed for STANDARD files!');
    console.log(' [GP] Packaging resources for SPECIAL files...');
    return Promise.all([
      helpers.readFile(`${dir}/../app/sdk/cards/factionFactory.coffee`, parseFactionFactory),
      helpers.readFile(`${dir}/../app/sdk/codex/codex.coffee`, parseCodex),
      helpers.readFile(`${dir}/../app/view/layers/game/BattleMap.js`, parseBattleMap),
      helpers.recursivelyReadDirectoryAndFiles(`${dir}/../app/sdk/modifiers`, parseModifier, /modifierFactory|modifierContextObject/i),
      helpers.recursivelyReadDirectoryAndFiles(`${dir}/../app/sdk/playerModifiers`, parseModifier, /modifierFactory|modifierContextObject/i),
      helpers.recursivelyReadDirectoryAndFiles(`${dir}/../app/sdk/challenges`, parseChallenge, /challengeCategory|challengeFactory/i),
      helpers.recursivelyReadDirectoryAndFiles(`${dir}/../app/sdk/challenges`, parseChallengeSuperClass, /challengeCategory|challengeFactory/i),
      helpers.readFile(`${dir}/../app/data/shop.json`, parseShopData),
      helpers.readFile(`${dir}/../app/data/premium_shop.json`, parseShopData),
    ]);
  }).then(() => {
    console.log(' [GP] Resources packed for SPECIAL files!');
    console.log(' [GP] Packaging resources for CARD FACTORY...');
    // card factory is incredibly performance intensive to process
    // so instead of processing the entire file, read line by line
    // each card factory file must be read in sequence, otherwise we'll have data conflict
    // once all lines are read and data extracted, parse the extracted data
    return helpers.recursivelyReadDirectoryAndFilesByLine(`${dir}/../app/sdk/cards/factory`, parseCardFactoryLine);
  }).then(() => parseCardFactoryData())
    .then(() =>
    // parse cosmetic factory after card factory
    // that way all card resources have been gathered
    // and card skin packages can be correctly generated
      helpers.readFile(`${dir}/../app/sdk/cosmetics/cosmeticsFactory.coffee`, parseCosmeticsFactory))
    .then(() => {
      console.log(' [GP] Resources packed for CARD FACTORY!');
      console.log(' [GP] Wrapping packages...');

      // add some additional fx resources to the game package
      addPkgResources('game', walkFXDataForResources(DATA.FX.Actions));
      addPkgResources('game', walkFXDataForResources(DATA.FX.Game));

      // make all resources map unique
      const rsxKeys = Object.keys(RSX_MAP);
      for (var i = 0, il = rsxKeys.length; i < il; i++) {
        var key = rsxKeys[i];
        RSX_MAP[key] = _.uniq(RSX_MAP[key]);
        if (debug && RSX_MAP[key].length > WARN_WHEN_REQUIRES_MORE_RSX_THAN
          && !(/factory[\/]|battlemap|cosmeticsFactory|factionfactory/i.test(key))) {
          console.log(` [GP] [WARN] ${key} -> appears to require ~${RSX_MAP[key].length} resources!`);
        }
      }

      // check all predefined packages
      var pkgKeys = Object.keys(PKGS_DEF);
      for (var i = 0, il = pkgKeys.length; i < il; i++) {
        var key = pkgKeys[i];
        const pkg_def = PKGS_DEF[key];
        var pkg = PKGS[key];
        if (pkg == null) {
          pkg = PKGS[key] = [];
        }
        for (var j = 0; j < pkg_def.length; j++) {
          const resourceData = pkg_def[j];
          var resourceKey = RSX.getResourceKeyByResourceName(resourceData.name);
          pkg.push(`RSX.${resourceKey}`);
        }
      }

      // check all packages
      let pkg_all = PKGS.all || [];
      const pkgKeysToDelete = [];
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
      const cardGroupKeys = Object.keys(Cards);
      for (var i = 0, il = cardGroupKeys.length; i < il; i++) {
        const cardGroupKey = cardGroupKeys[i];
        const cardGroup = Cards[cardGroupKey];
        if (_.isObject(cardGroup)) {
          const cardKeys = Object.keys(cardGroup);
          for (var j = 0, jl = cardKeys.length; j < jl; j++) {
            const cardKey = cardKeys[j];
            // generic cards don't need packages
            if (!/clone|followup|prismatic|killtarget|modifiers|spelldamage|spawnentity|spawnneutralentity|^(dispel|repulsion|deploymechaz0r|mindcontrolbyattackvalue|doubleattackandhealth|wall)$/gi.test(cardKey)) {
              const cardId = cardGroup[cardKey];
              const cardInspectPkgKey = CARD_INSPECT_PKG_PREFIX + Cards.getNonPrismaticCardId(cardId);
              if (PKGS[cardInspectPkgKey] == null) {
                console.log(` [GP] [WARN] card ${cardKey} -> has no inspect package!`);
              }
              const cardGamePkgKey = CARD_GAME_PKG_PREFIX + Cards.getNonPrismaticCardId(cardId);
              if (PKGS[cardGamePkgKey] == null) {
                console.log(` [GP] [WARN] card ${cardKey} -> has no game package!`);
              }
            }
          }
        }
      }

      // add all non aliased resources to the "all" pkg
      pkg_all = _.union(pkg_all, RSX_NON_ALIASED);

      // add all resources to the "all" pkg if forcing all resources
      if (forceAllResources) {
        console.log(' [GP] FORCE UPLOAD ALL RESOURCES');
        const resourceKeys = Object.keys(RSX);
        for (var i = 0, il = resourceKeys.length; i < il; i++) {
          var resourceKey = resourceKeys[i];
          var resource = RSX[resourceKey];
          if (!_.isFunction(resource) && _.isObject(resource)) {
            pkg_all.push(`RSX.${resourceKey}`);
          }
        }
      }

      // add pseudo-resources for all non-16 bit images in the "all" pkg at each enabled resource scale
      // this ensures that all images at all enabled resource scales will be copied/loaded/cached
      const pseudoImagesSeen = {};
      for (var i = pkg_all.length - 1; i >= 0; i--) {
        var resource = pkg_all[i];

        // ignore all but actual resources
        if (_.isString(resource)) {
          resource = RSX[resource.replace('RSX.', '')];
          let imagePath = resource.img;
          if (imagePath != null
          && !resource.noScale && !resource.is16Bit
          && pseudoImagesSeen[imagePath] == null
          && !(/@\d/i.test(helpers.getFileName(imagePath)))) {
          // mark image as seen
            pseudoImagesSeen[imagePath] = true;

            // strip quotes
            const resourceName = resource.name.replace(/['"]/g, '');
            imagePath = imagePath.replace(/['"]/g, '');
            const indexOfExt = imagePath.lastIndexOf('.');
            for (var j = CONFIG.RESOURCE_SCALES.length - 1; j >= 0; j--) {
              const resourceScale = CONFIG.RESOURCE_SCALES[j];
              pkg_all.splice(i + 1, 0, {
                name: `"${resourceName}@${resourceScale}x` + '"',
                img: `"${imagePath.substring(0, indexOfExt)}@${resourceScale}x${imagePath.substring(indexOfExt)}"`,
              });
            }
          }
        }
      }

      // make "all" pkg unique
      pkg_all = _.uniq(pkg_all, (resource) => {
        if (_.isString(resource)) {
          resource = RSX[resource.replace('RSX.', '')];
        }
        return resource.name.replace(/['"]/g, '');
      });

      // check all package resource entries for invalid files or formats
      for (var i = 0, il = pkg_all.length; i < il; i++) {
        var resource = pkg_all[i];
        if (_.isString(resource)) {
          resource = RSX[resource.replace('RSX.', '')];
        }

        // audio should always be m4a or mp4
        const { audio } = resource;
        if (audio != null) {
          const audioExt = helpers.getContentAfterLastDot(audio);
          if (!(/m4a|mp4/i.test(audioExt))) {
            throw new Error(`${resource.name} uses an invalid audio format (${audioExt}), please use m4a or mp4 instead.`);
          }
        }
      }

      // store "all" pkg
      PKGS.all = pkg_all;

      // convert packages map to json
      let PKGS_JSON = j2j.output(PKGS);

      // preserve escaped quotes and strip all other quotes
      PKGS_JSON = PKGS_JSON.replace(/\\("|')/g, '$1');
      PKGS_JSON = PKGS_JSON.replace(/["'](?!["'])/g, '');

      // write packages map
      let PKGS_CONTENT = '';
      PKGS_CONTENT += 'var RSX = require("./resources");\n';
      PKGS_CONTENT += 'var Cards = require("./../sdk/cards/cardsLookupComplete");\n';
      PKGS_CONTENT += '\n';
      PKGS_CONTENT += '/**\n';
      PKGS_CONTENT += ' * packages.js - map of packages to resources.\n';
      PKGS_CONTENT += '*/\n';
      PKGS_CONTENT += '\n';
      PKGS_CONTENT += `var PKGS = ${PKGS_JSON};\n`;
      PKGS_CONTENT += '\n';
      PKGS_CONTENT += 'PKGS.getPkgForIdentifier = function (pkgIdentifier) { return PKGS[pkgIdentifier] || []; };\n';
      PKGS_CONTENT += 'PKGS.setPkgForIdentifier = function (pkgIdentifier, pkg) { PKGS[pkgIdentifier] = pkg || []; };\n';
      PKGS_CONTENT += 'PKGS.addToPkgForIdentifier = function (pkgIdentifier, pkgAdditions) { PKGS[pkgIdentifier] = (PKGS[pkgIdentifier] || []).concat(pkgAdditions || []); };\n';
      PKGS_CONTENT += `PKGS.getFactionGamePkgIdentifier = function (factionIdentifier) { return '${FACTION_GAME_PKG_PREFIX}' + factionIdentifier; };\n`;
      PKGS_CONTENT += `PKGS.getFactionInspectPkgIdentifier = function (factionIdentifier) { return '${FACTION_INSPECT_PKG_PREFIX}' + factionIdentifier; };\n`;
      PKGS_CONTENT += `PKGS.getCardGamePkgIdentifier = function (cardIdentifier) { return '${CARD_GAME_PKG_PREFIX}' + Cards.getNonPrismaticCardId(cardIdentifier); };\n`;
      PKGS_CONTENT += `PKGS.getCardInspectPkgIdentifier = function (cardIdentifier) { return '${CARD_INSPECT_PKG_PREFIX}' + Cards.getNonPrismaticCardId(cardIdentifier); };\n`;
      PKGS_CONTENT += `PKGS.getCardBackPkgIdentifier = function (cardBackIdentifier) { return '${CARD_BACK_PKG_PREFIX}' + parseInt(cardBackIdentifier); };\n`;
      PKGS_CONTENT += `PKGS.getBattleMapPkgIdentifier = function (battleMapIdentifier) { return '${BATTLE_MAP_PKG_PREFIX}' + battleMapIdentifier; };\n`;
      PKGS_CONTENT += `PKGS.getChapterPkgIdentifier = function (chapterIdentifier) { return '${CHAPTER_PKG_PREFIX}' + chapterIdentifier; };\n`;
      PKGS_CONTENT += `PKGS.getChallengePkgIdentifier = function (challengeIdentifier) { return '${CHALLENGE_PKG_PREFIX}' + challengeIdentifier; };\n`;
      PKGS_CONTENT += '\n';
      PKGS_CONTENT += 'module.exports = PKGS;\n';

      // write packages map
      return Promise.all([
        helpers.writeFile(`${dir}/../app/data/packages.js`, PKGS_CONTENT),
      ]);
    })
    .then(() => {
      console.log(' [GP] Packages wrapped!');
      process.exit(0);
    })
    .catch((error) => {
      console.log(` [GP] [ERR] Package generation failed -> ${error.stack}`);
    });
}());
