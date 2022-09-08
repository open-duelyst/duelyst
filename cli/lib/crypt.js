// this decrypt a file into memory
// assumes an encrypted file called file.txt.encrypted containing json

const crypto = require('crypto');
const fs = require('fs');
const Promise = require('bluebird');
const { Readable } = require('stream');

const cryptor = {};

cryptor.decryptFileToData = function (fileName, passkey, onComplete) {
  // create a read stream and a decrypt stream
  const read = fs.createReadStream(fileName);
  const decrypt = crypto.createDecipher('aes-256-ctr', passkey);

  // on 'data' event, add the data to a buffer (because data arrives in chunks)
  const buffer = [];
  decrypt.on('data', (data) => {
    buffer.push(data);
  });
  // on 'end' event, concat the buffer into a single output and convert toString
  // the data is now a serialized JSON string (ie same thing as if you just fs.readFile JSON file)
  // JSON parse it
  decrypt.on('end', () => {
    const output = Buffer.concat(buffer).toString();
    onComplete(null, output);
  });

  // actually call the pipe here, ie start streaming
  read.pipe(decrypt);
};

cryptor.encryptDataToFile = function (data, fileName, passkey, onComplete) {
  const encrypt = crypto.createCipher('aes-256-ctr', passkey);
  const write = fs.createWriteStream(fileName);

  const read = new Readable();
  read.push(data);
  read.push(null); // indicates end-of-file basically - the end of the stream

  read.pipe(encrypt).pipe(write);

  write.on('end', () => {
    onComplete();
  });
};

module.exports = cryptor;
