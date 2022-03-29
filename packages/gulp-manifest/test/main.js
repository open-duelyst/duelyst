var fs             = require('fs'),
    path           = require('path'),
    es             = require('event-stream'),
    should         = require('should'),
    gutil          = require('gulp-util'),
    mocha          = require('mocha'),
    manifestPlugin = require('../');

function createFakeFile(filename) {
  return new gutil.File({
    path: path.resolve('test/fixture/' + filename),
    cwd: path.resolve('test/'),
    base: path.resolve('test/fixture/'),
    contents: new Buffer('notimportant')
  });
}

describe('gulp-manifest', function() {
  var fileNames = ['file1.js', 'file2.js', 'file3.js', 'file4.js',
      'exclude/exclude1.js','exclude/exclude2.js',
      'exclude/children1/exclude3.js',
      'children2/include1.js','children2/exclude4.js',
      'children2/children3/include2.js','children2/children3/exclude5.js'
  ];
  var fakeFiles = fileNames.map(createFakeFile);

  it('Should generate a manifest file', function(done) {
    var stream = manifestPlugin({
      filename: 'cache.manifest',
      exclude: 'file2.js',
      hash: true,
      network: ['http://*', 'https://*', '*'],
      preferOnline: true
    });

    stream.on('data', function(data) {
      data.should.be.an.instanceOf(gutil.File);
      data.relative.should.eql('cache.manifest');

      var contents = data.contents.toString();
      contents.should.startWith('CACHE MANIFEST');
      contents.should.contain('CACHE:');
      contents.should.contain('file1.js');
      contents.should.not.contain('file2.js');
      contents.should.contain('file3.js');
      contents.should.contain('file4.js');
      contents.should.contain('# hash: ');
    });
    stream.once('end', done);

    fakeFiles.forEach(stream.write.bind(stream));
    stream.end();
  });

  it('should work with Windows OS file system', function(done) {
    var stream = manifestPlugin({
        hash: false
    });

    stream.on('data', function(data) {
      var contents = data.contents.toString();
      contents.should.contain('fixture/hello.js');
    });
    stream.once('end', done);

    stream.write(new gutil.File({
        path: path.resolve('test\\fixture\\hello.js'),
        cwd: path.resolve('test/'),
        base: path.resolve('test/'),
        contents: new Buffer('notimportant')
    }));

    stream.end();
  });

  it('Should exclude multiple files', function(done) {
    var stream = manifestPlugin({
      exclude: ['file2.js', 'file4.js'],
    });

    stream.on('data', function(data) {
      var contents = data.contents.toString();
      contents.should.contain('file1.js');
      contents.should.not.contain('file2.js');
      contents.should.contain('file3.js');
      contents.should.not.contain('file4.js');
    });
    stream.once('end', done);

    fakeFiles.forEach(stream.write.bind(stream));
    stream.end();
  });

  it('Should work with hash multiple times', function (done) {
    var pending = 2;
    function generateWithHash() {
      var stream = manifestPlugin({ hash: true });
      stream.on('data', function (data) {
        data.contents.toString().should.contain('# hash: ');
      });
      stream.once('end', function () {
        if (--pending <= 0) done();
      });
      fakeFiles.forEach(stream.write.bind(stream));
      stream.end();
    }
    generateWithHash();
    generateWithHash();
  });

  it('Should generate a valid fallback section', function(done) {
    var stream = manifestPlugin({
      filename: 'cache.manifest',
      fallback: ['/ /offline.html'],
      network: ['http://*', 'https://*', '*']
    });

    stream.on('data', function(data) {
      data.should.be.an.instanceOf(gutil.File);
      data.relative.should.eql('cache.manifest');

      var contents = data.contents.toString();
      contents.should.contain('FALLBACK:\n/ /offline.html');
    });
    stream.once('end', done);
    stream.end();
  });
  
  it('Should exclude special files', function(done) {
    var stream = manifestPlugin({
      filename: 'cache.manifest',
      exclude:  ['file2.js','exclude/**',"children2/**/exclude*.js"],
      hash: true,
      network: ['http://*', 'https://*', '*'],
      preferOnline: true
    });

    stream.on('data', function(data) {
      data.should.be.an.instanceOf(gutil.File);
      data.relative.should.eql('cache.manifest');

      var contents = data.contents.toString();
      contents.should.startWith('CACHE MANIFEST');
      contents.should.contain('CACHE:');
      contents.should.contain('file1.js');
      contents.should.not.contain('file2.js');
      contents.should.contain('file3.js');
      contents.should.contain('file4.js');
      contents.should.contain('# hash: ');

      contents.should.not.contain('exclude');
      contents.should.contain('include1.js');
      contents.should.contain('include2.js');
    });
    stream.once('end', done);

    fakeFiles.forEach(stream.write.bind(stream));
    stream.end();
  });
});
