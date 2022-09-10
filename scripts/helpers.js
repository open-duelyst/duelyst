(function () {
  const Promise = require('bluebird');
  const mkdirp = require('mkdirp');
  const fs = require('fs');
  const path = require('path');
  const lineReader = require('readline');

  const helpers = {};

  helpers.escapeStringForRegExp = function (str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  };

  helpers.getFileName = function (file) {
    const match = file.match(/([^\/\\]*)\.(\w+)$/i);
    return (match && match[1]) || file;
  };

  helpers.getContentBeforeLastDot = function (file) {
    return file.substr(0, (~-file.lastIndexOf('.') >>> 0) + 1);
  };

  helpers.getContentAfterLastDot = function (file) {
    return file.substr((~-file.lastIndexOf('.') >>> 0) + 2);
  };

  helpers.getIsFileReadable = function (file) {
    const ext = helpers.getContentAfterLastDot(file).toLowerCase();
    return ext === 'js' || ext === 'coffee' || ext === 'json' || ext === 'css' || ext === 'scss' || ext === 'hbs';
  };

  /**
   * Removes all comments from a file contents for both javascript and coffeescript.
   * @param {string} content
   * @returns {string}
   */
  helpers.stripComments = function (content) {
    return content.replace(/\/\/[\s\S]*?(\r|\n)/g, '$1').replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/###[\s\S]*?###/g, '')
      .replace(/[^#]{1}#[^#][\s\S]*?(\r|\n)/g, '$1');
  };

  /**
   * Writes contents to a file.
   * @param file
   * @param contents
   * @returns {Promise}
   */
  helpers.writeFile = function (file, contents) {
    return new Promise((resolve, reject) => {
      mkdirp(path.dirname(file), (err) => {
        if (err) throw err;
        fs.writeFile(file, contents, () => {
          if (err) throw err;
          resolve();
        });
      });
    });
  };

  /**
   * Async recursive search for all files starting from a directory. Returns a list of file paths.
   * @param dir
   * @returns {Promise}
   */
  helpers.recursivelyGetFilesStartingFrom = function (dir) {
    return new Promise((resolve, reject) => {
      let files = [];
      fs.readdir(dir, (err, list) => {
        if (err) throw err;

        const subDirectoryPromises = [];
        if (list == null || list.length === 0) {
          resolve(files);
        } else {
          list.forEach((file, index) => {
            file = path.resolve(dir, file);
            fs.stat(file, (err, stat) => {
              if (stat && stat.isDirectory()) {
                const subDirectoryPromise = helpers.recursivelyGetFilesStartingFrom(file);
                subDirectoryPromise.then((filesInSubDirectory) => {
                  files = files.concat(filesInSubDirectory);
                });
                subDirectoryPromises.push(subDirectoryPromise);
              } else {
                files.push(file);
              }

              if (index === list.length - 1) {
                Promise.all(subDirectoryPromises).then(() => {
                  resolve(files);
                });
              }
            });
          });
        }
      });
    });
  };

  /**
   * Async recursive read of all files starting from a directory, calling fileHandler on each file and returning when all processes are complete.
   * @see helpers.readFile
   * @param {String} dir
   * @param {Function} fileHandler
   * @param {RegExp} [fileNameFilter=null] regexp to filter files by name
   * @param {Number} [concurrency=100] max number of files to open at once
   * @returns {Promise}
   */
  helpers.recursivelyReadDirectoryAndFiles = function (dir, fileHandler, fileNameFilter, concurrency) {
    return new Promise((resolve, reject) => {
      if (concurrency == null) {
        concurrency = 100;
      }

      return helpers.recursivelyGetFilesStartingFrom(dir)
        .then((files) => Promise.map(files, (file) => {
          if (fileNameFilter == null || !fileNameFilter.test(file)) {
            // console.log("READ", file);
            return helpers.readFile(file, fileHandler);
          }
          return Promise.resolve();
        }, { concurrency }))
        .then(resolve);
    });
  };

  /**
   * Synchronous recursive read of all files starting from a directory, calling fileHandler on each file and returning when all processes are complete.
   * @see helpers.readFile
   * @param {String} dir
   * @param {Function} fileHandler
   * @param {RegExp} [fileNameFilter=null] regexp to filter files by name
   * @returns {Promise}
   */
  helpers.recursivelyReadDirectoryAndFilesSync = function (dir, fileHandler, fileNameFilter) {
    return new Promise((resolve, reject) => {
      fs.readdir(dir, (err, list) => {
        if (err) throw err;
        let i = 0;
        (function next() {
          if (i < list.length) {
            let file = list[i++];
            file = path.resolve(dir, file);
            fs.stat(file, (err, stat) => {
              if (stat && stat.isDirectory()) {
                helpers.recursivelyReadDirectoryAndFilesSync(file, fileHandler).then(next);
              } else if (fileNameFilter == null || !fileNameFilter.test(file)) {
                helpers.readFile(file, fileHandler).then(next);
              } else {
                next();
              }
            });
          } else {
            resolve();
          }
        }());
      });
    });
  };

  /**
   * Reads a file and calls fileHandler on it, passing file and contents as arguments.
   * NOTE: FileHandler must return a promise.
   * @param file
   * @param fileHandler
   * @returns {Promise}
   */
  helpers.readFile = function (file, fileHandler) {
    if (helpers.getIsFileReadable(file)) {
      return new Promise((resolve, reject) => {
        fs.readFile(file, 'utf-8', (err, content) => {
          if (err) throw err;
          fileHandler(file, content).then(resolve);
        });
      });
    }
    return Promise.resolve();
  };

  /**
   * Reads a file line by line and calls fileHandler on it, passing file and line as arguments. Promise resolves when all lines have been read.
   * NOTE: FileHandler must return a promise.
   * @param file
   * @param fileHandler
   * @returns {Promise}
   */
  helpers.readFileByLine = function (file, fileHandler) {
    if (helpers.getIsFileReadable(file)) {
      return new Promise((resolve, reject) => {
        const lr = lineReader.createInterface({
          input: fs.createReadStream(file),
          output: process.stdout,
          terminal: false,
        });
        lr.on('line', (line) => {
          fileHandler(file, line);
        });
        lr.on('close', () => {
          resolve();
        });
      });
    }
    return Promise.resolve();
  };

  /**
   * Synchronous recursive read of all files line by line starting from a directory, calling fileHandler on each file and returning when all processes are complete.
   * @see helpers.readFile
   * @param {String} dir
   * @param {Function} fileHandler
   * @param {RegExp} [fileNameFilter=null] regexp to filter files by name
   * @returns {Promise}
   */
  helpers.recursivelyReadDirectoryAndFilesByLine = function (dir, fileHandler, fileNameFilter) {
    return new Promise((resolve, reject) => {
      fs.readdir(dir, (err, list) => {
        if (err) throw err;
        let i = 0;
        (function next() {
          if (i < list.length) {
            let file = list[i++];
            file = path.resolve(dir, file);
            fs.stat(file, (err, stat) => {
              if (stat && stat.isDirectory()) {
                helpers.recursivelyReadDirectoryAndFilesByLine(file, fileHandler).then(next);
              } else if (fileNameFilter == null || !fileNameFilter.test(file)) {
                helpers.readFileByLine(file, fileHandler).then(next);
              } else {
                next();
              }
            });
          } else {
            resolve();
          }
        }());
      });
    });
  };

  module.exports = helpers;
}());
