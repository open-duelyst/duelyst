
// this script reads cardFactory.coffee and replaces all animation resources that are strings with direct references to the RSX entries

(function () {

	var Promise = require("bluebird");
	var _ = require("underscore");
	var helpers = require("./../../../scripts/helpers");
	var RSX = require("./../../data/resources.js");

	helpers.readFile("./../../sdk/cards/cardFactory.coffee", function (file, contents) {
		// replace soft returns
		contents = contents.replace("\r", "\n");

		contents = contents.replace(/card\.setBaseAnimResource\([\s\S]*?\)/g, function (animResources) {
			animResources = animResources.replace(/["'].*?["']/g, function (animResource) {
				var animAlias = animResource.replace(/["']/g, "");
				if (RSX[animAlias] == null) {
					console.log(animResource, " > ", RSX[animAlias]);
				}
				return "RSX." + animAlias + ".name";
			});
			return animResources;
		});

		return helpers.writeFile("./../../sdk/cards/cardFactory.coffee", contents);
	}).then(function () {
		process.exit(0);
	});

})();

return;

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
