
// this script converts the old cardFactory to fx.json and a new cardFactory without fx data
// this script needs cardFactory.coffee and a compiled version cardFactory.js in the same directory
// this script also requires the j2j and string npm modules

var mkdirp = require("mkdirp");
var fs = require('fs');
var getDirName = require("path").dirname;
function writeFile (path, contents, cb) {
	mkdirp(getDirName(path), function (err) {
		if (err) return cb(err);
		fs.writeFile(path, contents, cb);
	})
}

var j2j = require("j2j");
var RSX = require('../../data/resources.js');
var CONFIG = require('../../common/config');
var S = require('../../../node_modules/string');

// read misc fx and initialize fx map
var miscFXString = fs.readFileSync("misc_fx.json", "utf8");
var fxMap = JSON.parse(miscFXString);

// process cardFactory.js
var cardFactoryJS = fs.readFileSync("cardFactory.js", "utf8");
// (?<=addFXTemplate\()(\{[\s\S]*?\})(?=\)\;)
var cfjParts = cardFactoryJS.split(/if[\s]*\([\s]*identifier[\s]*===[\s]*/g);
// first part is useless
cfjParts = cfjParts.slice(1);
var numCFJParts = cfjParts.length;
// trim last part
var lastCFJPart = cfjParts[numCFJParts - 1];
cfjParts[numCFJParts - 1] = lastCFJPart.slice(0, lastCFJPart.indexOf("if (card) {"));

for (var i = 0, il = numCFJParts; i < il; i++) {
	parseCFJPart(cfjParts[i]);
}

function parseCFJPart (part) {
	var id = part.slice(0, part.indexOf(")"));
	var idParts = id.split(".");
	var category = idParts[0];
	var subCategory = idParts[1];
	var name = idParts[2];
	var fxParts = part.split("addFXTemplate({");
	fxParts = fxParts.slice(1);
	// special case
	var altSplit;
	if (fxParts.length === 0) {
		altSplit = true;
		fxParts = part.split(/getFXTemplate\(\)\[FXType\./g);
		fxParts = fxParts.slice(1);
		if (fxParts.length > 0) {
			var firstBracketIndex = fxParts[0].indexOf("]");
			var secondBracketIndex = fxParts[0].indexOf("[");
			var fxType = fxParts[0].slice(0, firstBracketIndex);
			var fxOptions = fxParts[0].slice(secondBracketIndex);
			fxParts[0] = '"' + fxType + '":' + fxOptions;
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
		for (var j = 0; j < fxParts.length; j++) {
			var fxPart = fxParts[j];
			var fx = fxPart.slice(0, altSplit ? fxPart.lastIndexOf("];") + 1 : fxPart.indexOf("});"));
			eval('var fxObj={'+fx+'};');
			for (var key in fxObj) {
				fxMap[category][subCategory][name][key] = fxObj[key];
			}
		}
	}
}
// save final fx map as JSON
writeFile("../fx.json", j2j.output(fxMap));

// process cardFactory.coffee
var cardFactoryCoffee = fs.readFileSync("cardFactory.coffee", "utf8");
cardFactoryCoffee = cardFactoryCoffee.replace("\r", "\n");
var cfcParts = cardFactoryCoffee.split(/if[\s]*\([\s]*identifier[\s]*==[\s]*/g);
var numCFCParts = cfcParts.length;
var newCFC = cfcParts[0];

for (var i = 1, il = numCFCParts; i < il; i++) {
	newCFC += parseCFCPart(cfcParts[i]);
}

// save final cardFactory.coffee
writeFile("../sdk/cards/cardFactory.coffee", newCFC);

function parseCFCPart (part) {

	var idEndIndex = part.indexOf(")");
	var id = part.slice(0, idEndIndex);
	id = id.replace(/\n|\r/g, "");
	var afterId = part.slice(idEndIndex + 1);
	var indent = afterId.slice(0, afterId.indexOf("card"));
	indent = indent.replace(/\n|\r/g, "");
	var faction = S(part).between("factionId = ", "\n").s;
	faction = faction.replace(/\n|\r/g, "");
	var partPrefix = "if (identifier == ";
	var fxTemplate = [];

	// get faction fx
	if (faction !== "Factions.Neutral") {
		fxTemplate.push("Factions.Neutral");
	}
	fxTemplate.push(faction);
	part = part.replace(/[\s]*card\.addFXTemplate\(FactionFactory\.factionForIdentifier\(card\.factionId\)\.fxTemplate\)/g, "");

	// get the copied fx
	var copiedFX = S(part).between("addFXTemplate(FXFactory.fxTemplateFromIdentifiers({", "}))").s;
	if (copiedFX) {
		var copiedId = S(S(copiedFX).between(": FX.").s).lines()[0];
		copiedId = copiedId.replace(/\n|\r/g, "");
		fxTemplate.push(copiedId);
	}
	part = part.replace(/[\s]*card\.addFXTemplate\(FXFactory\.fxTemplateFromIdentifiers\(\{[\s\S]*\}\)\)/g, "");

	// replace some old shit
	part = part.replace(/[\s]*card\.attackDamageZone[\s]*=[\s]*null/g, "");
	part = part.replace(/[\s]*card\.attackWeakDamageZone[\s]*=[\s]*null/g, "");

	// replace custom fx
	fxTemplate.push(id);
	var hasCustomFX = part.indexOf("addFXTemplate({") !== -1;
	if (hasCustomFX) {
		part = part.replace(/[\s]*card\.addFXTemplate\(\{[\s\S]*\]\}\)/g, "");
	} else if (part.indexOf("getFXTemplate()") !== -1) {
		part = part.replace(/[\s]*card\.getFXTemplate\(\)[\s\S]*(?=card\.)*/g, "\n" + indent + "\n" + indent.replace(/\t/, ""));
	}

	// clean out any \r from fxTemplate
	for (var i = 0; i < fxTemplate.length; i++) {
		fxTemplate[i] = fxTemplate[i].replace(/\n|\r/g, "");
		fxTemplate[i] = "FX." + fxTemplate[i];
	}

	// compose new part with fx template
	var endLineIndex = part.lastIndexOf("card._spriteResource");
	var beforeEndLines = part.slice(0, endLineIndex);
	var endLines = part.slice(endLineIndex);
	var endLineNewlineIndex = endLines.indexOf("\n");
	var endLine = endLines.slice(0, endLineNewlineIndex);
	var afterEndLine = endLines.slice(endLineNewlineIndex);
	var newPart = partPrefix + beforeEndLines + endLine + "\n" + indent + "card._fxResource = " + JSON.stringify(fxTemplate) + afterEndLine;

	// special case: replace TeleportSource with Teleport
	newPart = newPart.replace("Spell.TeleportSource", "Spell.Teleport");

	return newPart;
}
