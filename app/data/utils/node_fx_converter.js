// this script converts the old cardFactory to fx.json and a new cardFactory without fx data
// this script needs cardFactory.coffee and a compiled version cardFactory.js in the same directory
// this script also requires the j2j and string npm modules

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
const RSX = require('../resources');
const CONFIG = require('../../common/config');
const S = require('../../../node_modules/string');

// read misc fx and initialize fx map
const miscFXString = fs.readFileSync('misc_fx.json', 'utf8');
const fxMap = JSON.parse(miscFXString);

// process cardFactory.js
const cardFactoryJS = fs.readFileSync('cardFactory.js', 'utf8');
// (?<=addFXTemplate\()(\{[\s\S]*?\})(?=\)\;)
let cfjParts = cardFactoryJS.split(/if[\s]*\([\s]*identifier[\s]*===[\s]*/g);
// first part is useless
cfjParts = cfjParts.slice(1);
const numCFJParts = cfjParts.length;
// trim last part
const lastCFJPart = cfjParts[numCFJParts - 1];
cfjParts[numCFJParts - 1] = lastCFJPart.slice(0, lastCFJPart.indexOf('if (card) {'));

for (let i = 0, il = numCFJParts; i < il; i++) {
  parseCFJPart(cfjParts[i]);
}

function parseCFJPart(part) {
  const id = part.slice(0, part.indexOf(')'));
  const idParts = id.split('.');
  const category = idParts[0];
  const subCategory = idParts[1];
  const name = idParts[2];
  let fxParts = part.split('addFXTemplate({');
  fxParts = fxParts.slice(1);
  // special case
  let altSplit;
  if (fxParts.length === 0) {
    altSplit = true;
    fxParts = part.split(/getFXTemplate\(\)\[FXType\./g);
    fxParts = fxParts.slice(1);
    if (fxParts.length > 0) {
      const firstBracketIndex = fxParts[0].indexOf(']');
      const secondBracketIndex = fxParts[0].indexOf('[');
      const fxType = fxParts[0].slice(0, firstBracketIndex);
      const fxOptions = fxParts[0].slice(secondBracketIndex);
      fxParts[0] = `"${fxType}":${fxOptions}`;
    }
  }
  if (fxParts.length > 0) {
    // add to fxMap
    if (!fxMap[category]) {
      fxMap[category] = {};
    }
    if (!fxMap[category][subCategory]) {
      fxMap[category][subCategory] = {};
    }
    fxMap[category][subCategory][name] = {};
    for (let j = 0; j < fxParts.length; j++) {
      const fxPart = fxParts[j];
      const fx = fxPart.slice(0, altSplit ? fxPart.lastIndexOf('];') + 1 : fxPart.indexOf('});'));
      /* eslint-disable no-eval */
      eval(`var fxObj={${fx}};`);
      /* eslint-disable guard-for-in */
      /* eslint-disable no-undef */
      for (const key in fxObj) {
        /* eslint-disable no-undef */
        fxMap[category][subCategory][name][key] = fxObj[key];
      }
    }
  }
}
// save final fx map as JSON
writeFile('../fx.json', j2j.output(fxMap));

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

  // replace some old stuff
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
