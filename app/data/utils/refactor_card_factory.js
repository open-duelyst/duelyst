// this script reads cardFactory.coffee and replaces all animation resources that are strings with direct references to the RSX entries

(function () {
  const Promise = require('bluebird');
  const _ = require('underscore');
  const helpers = require('../../../scripts/helpers');
  const RSX = require('../resources');

  helpers.readFile('./../../sdk/cards/cardFactory.coffee', (file, contents) => {
    // replace soft returns
    contents = contents.replace('\r', '\n');

    contents = contents.replace(/card\.setBaseAnimResource\([\s\S]*?\)/g, (animResources) => {
      animResources = animResources.replace(/["'].*?["']/g, (animResource) => {
        const animAlias = animResource.replace(/["']/g, '');
        if (RSX[animAlias] == null) {
          console.log(animResource, ' > ', RSX[animAlias]);
        }
        return `RSX.${animAlias}.name`;
      });
      return animResources;
    });

    return helpers.writeFile('./../../sdk/cards/cardFactory.coffee', contents);
  }).then(() => {
    process.exit(0);
  });
}());

const mkdirp = require('mkdirp');
const fs = require('fs');
const getDirName = require('path').dirname;

function writeFile(path, contents, cb) {
  mkdirp(getDirName(path), (err) => {
    if (err) return cb(err);
    return fs.writeFile(path, contents, cb);
  });
}

const j2j = require('j2j');
const S = require('string');
const RSX = require('../resources');
const CONFIG = require('../../common/config');

// process cardFactory.coffee
let cardFactoryCoffee = fs.readFileSync('cardFactory.coffee', 'utf8');
cardFactoryCoffee = cardFactoryCoffee.replace('\r', '\n');
const cfcParts = cardFactoryCoffee.split(/if[\s]*\([\s]*identifier[\s]*==[\s]*/g);
const numCFCParts = cfcParts.length;
let newCFC = cfcParts[0];

for (let i = 1, il = numCFCParts; i < il; i++) {
  newCFC += parseCFCPart(cfcParts[i]);
}

// save final cardFactory.coffee
writeFile('../sdk/cards/cardFactory.coffee', newCFC);

function parseCFCPart(part) {
  const idEndIndex = part.indexOf(')');
  let id = part.slice(0, idEndIndex);
  id = id.replace(/\n|\r/g, '');
  const afterId = part.slice(idEndIndex + 1);
  let indent = afterId.slice(0, afterId.indexOf('card'));
  indent = indent.replace(/\n|\r/g, '');
  let faction = S(part).between('factionId = ', '\n').s;
  faction = faction.replace(/\n|\r/g, '');
  const partPrefix = 'if (identifier == ';
  const fxTemplate = [];

  // get faction fx
  if (faction !== 'Factions.Neutral') {
    fxTemplate.push('Factions.Neutral');
  }
  fxTemplate.push(faction);
  part = part.replace(/[\s]*card\.addFXTemplate\(FactionFactory\.factionForIdentifier\(card\.factionId\)\.fxTemplate\)/g, '');

  // get the copied fx
  const copiedFX = S(part).between('addFXTemplate(FXFactory.fxTemplateFromIdentifiers({', '}))').s;
  if (copiedFX) {
    let copiedId = S(S(copiedFX).between(': FX.').s).lines()[0];
    copiedId = copiedId.replace(/\n|\r/g, '');
    fxTemplate.push(copiedId);
  }
  part = part.replace(/[\s]*card\.addFXTemplate\(FXFactory\.fxTemplateFromIdentifiers\(\{[\s\S]*\}\)\)/g, '');

  // replace some old shit
  part = part.replace(/[\s]*card\.attackDamageZone[\s]*=[\s]*null/g, '');
  part = part.replace(/[\s]*card\.attackWeakDamageZone[\s]*=[\s]*null/g, '');

  // replace custom fx
  fxTemplate.push(id);
  const hasCustomFX = part.indexOf('addFXTemplate({') !== -1;
  if (hasCustomFX) {
    part = part.replace(/[\s]*card\.addFXTemplate\(\{[\s\S]*\]\}\)/g, '');
  } else if (part.indexOf('getFXTemplate()') !== -1) {
    part = part.replace(/[\s]*card\.getFXTemplate\(\)[\s\S]*(?=card\.)*/g, `\n${indent}\n${indent.replace(/\t/, '')}`);
  }

  // clean out any \r from fxTemplate
  for (let i = 0; i < fxTemplate.length; i++) {
    fxTemplate[i] = fxTemplate[i].replace(/\n|\r/g, '');
    fxTemplate[i] = `FX.${fxTemplate[i]}`;
  }

  // compose new part with fx template
  const endLineIndex = part.lastIndexOf('card._spriteResource');
  const beforeEndLines = part.slice(0, endLineIndex);
  const endLines = part.slice(endLineIndex);
  const endLineNewlineIndex = endLines.indexOf('\n');
  const endLine = endLines.slice(0, endLineNewlineIndex);
  const afterEndLine = endLines.slice(endLineNewlineIndex);
  let newPart = `${partPrefix + beforeEndLines + endLine}\n${indent}card._fxResource = ${JSON.stringify(fxTemplate)}${afterEndLine}`;

  // special case: replace TeleportSource with Teleport
  newPart = newPart.replace('Spell.TeleportSource', 'Spell.Teleport');

  return newPart;
}
