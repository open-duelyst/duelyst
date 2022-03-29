var Promise = require("bluebird");
var normalizedPath = require("path").join(__dirname, "./");
var files = require("fs").readdirSync(normalizedPath);
Promise.map(files, function (file) {
	var benchmarkPromise = require("./" + file);
	if (benchmarkPromise instanceof Promise) {
		benchmarkPromise.catch(function(errorMessage){
			console.log(errorMessage);
		});
	}
	return benchmarkPromise;
}.bind(this), { concurrency: 1 });
