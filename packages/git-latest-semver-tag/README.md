#  [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage Status][coveralls-image]][coveralls-url]

> Get the most recent git semver tag of your repository


## Install

```sh
$ npm install --save git-latest-semver-tag
```


## Usage

```js
var gitLatestSemverTag = require('git-latest-semver-tag');

gitLatestSemverTag(function(err, tag) {
  console.log(tag);
  //=> 'v1.0.0'
});
```

```sh
$ npm install --global git-latest-semver-tag
$ git-latest-semver-tag
v1.0.0
```


## License

MIT © [Steve Mao](https://github.com/stevemao)


[npm-image]: https://badge.fury.io/js/git-latest-semver-tag.svg
[npm-url]: https://npmjs.org/package/git-latest-semver-tag
[travis-image]: https://travis-ci.org/stevemao/git-latest-semver-tag.svg?branch=master
[travis-url]: https://travis-ci.org/stevemao/git-latest-semver-tag
[daviddm-image]: https://david-dm.org/stevemao/git-latest-semver-tag.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/stevemao/git-latest-semver-tag
[coveralls-image]: https://coveralls.io/repos/stevemao/git-latest-semver-tag/badge.svg
[coveralls-url]: https://coveralls.io/r/stevemao/git-latest-semver-tag
