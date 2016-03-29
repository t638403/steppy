var fs = require('fs');

module.exports = filesystem;

function filesystem(application) {

	'use strict';

	var _;

	return {
		init:init,
		destroy:destroy,
		readdir:readdir,
		readFile:readFile,
		writeFile:writeFile,
		writeJsonFile:writeJsonFile,
		readJsonDir:readJsonDir,
		readJsonFile:readJsonFile,
		readJsons:readJsons
	}

	function init() {
		_ = application.getService('_');
	}

	function destroy() {
		_ = null;
	}

	/**
	 * Write an utf8 encoded file
	 *
	 * @param fileName {string} The path to the file
	 * @param contents {string} The contents of the file
	 */
	function writeFile(fileName, contents) {
		return new Promise(function(resolve, reject) {
			fs.writeFile(fileName, contents, {encoding:'utf8'}, function(err) {
				if(err) {return Promise.reject(err);}
				resolve();
			})
		})
	}

	/**
	 * Write an object to file.
	 *
	 * @param fileName {string} The path to the file
	 * @param contents {object} The object that will be stringified
	 */
	function writeJsonFile(fileName, contents) {
		return writeFile(fileName, JSON.stringify(contents));
	}

	/**
	 * Read a dir and get a file list. Promisified version of the native fs.readdir
	 *
	 * @param dir {string} The path to the dir
	 * @returns {Promise} Resolves to an array of file names
	 */
	function readdir(dir) {
		return new Promise(function(resolve, reject) {
			fs.readdir(dir, function(err, files) {
				if(err) return reject(err);
				resolve(files);
			});
		});
	}

	/**
	 * Get an array of object from the json files in a directory
	 *
	 * @param dir {string} The path to the dir
	 * @returns {Promise} A Promise resolving to an array of objects
	 */
	function readJsons(dir) {
		return readJsonDir(dir).then(function(files) {
			return Promise.all(files.map(readJsonFile))
		})
	}

	/**
	 * Read a dir and get a list of all the files that have .json extension
	 *
	 * @param dir {string} The path to the dir
	 * @returns {Promise} Resolves to an array of .json filenames
	 */
	function readJsonDir(dir) {
		return readdir(dir).then(function(files) {
			return _.filter(files, function(file){/'.json$/.test(file);});
		})
	}

	/**
	 * Read an utf8 encoded file. This is the promisified version of the native fs.readFile
	 *
	 * @param file {string} path tot the file
	 * @returns {Promise} Resolves to the file contents
	 */
	function readFile(file) {
		return new Promise(function(resolve, reject) {
			fs.readFile(file, {encoding:'utf8'}, function(err, contents) {
				if(err) return reject(err);
				resolve(contents);
			});
		});
	}

	/**
	 * Read a utf8 file and parse contents as json
	 *
	 * @param file {string} path tot the file
	 * @returns {Promise} Resolves to parsed json object or rejects if no valid json
	 */
	function readJsonFile(file) {
		return readFile(file).then(function(contents) {
			try {
				return JSON.parse(contents)
			} catch (e) {
				return Promise.reject(e);
			}
		});
	}

}