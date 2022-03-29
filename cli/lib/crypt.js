// this decrypt a file into memory
// assumes an encrypted file called file.txt.encrypted containing json

var crypto = require('crypto')
var fs = require('fs')
var Promise = require('bluebird')
var Readable = require('stream').Readable

var cryptor = {}

cryptor.decryptFileToData = function(fileName,passkey,onComplete) {

	// create a read stream and a decrypt stream
	var read = fs.createReadStream(fileName)
	var decrypt = crypto.createDecipher('aes-256-ctr', passkey)

	// on 'data' event, add the data to a buffer (because data arrives in chunks)
	var buffer = []
	decrypt.on('data', function(data) {
	  buffer.push(data)
	})
	// on 'end' event, concat the buffer into a single output and convert toString
	// the data is now a serialized JSON string (ie same thing as if you just fs.readFile JSON file)
	// JSON parse it
	decrypt.on('end', function() {
	  var output = Buffer.concat(buffer).toString()
	  onComplete(null,output)
	})

	// actually call the pipe here, ie start streaming
	read.pipe(decrypt)
}

cryptor.encryptDataToFile = function(data,fileName,passkey,onComplete) {

	var encrypt = crypto.createCipher('aes-256-ctr',passkey)
	var write = fs.createWriteStream(fileName)

	var read = new Readable();
	read.push(data)
	read.push(null) // indicates end-of-file basically - the end of the stream

	read.pipe(encrypt).pipe(write)

	write.on('end',function(){
		onComplete()
	})
}

module.exports = cryptor