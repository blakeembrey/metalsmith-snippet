# Metalsmith Snippet

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

A [Metalsmith](http://metalsmith.io/) plugin for extracting snippets from files.

## Installation

```sh
npm install metalsmith-snippet --save
```

## Usage

**Metalsmith Snippets** adds a `snippet` property to the metadata of every HTML file, when it hasn't already been set.

### CLI

Install via npm and then add `metalsmith-snippet` to your `metalsmith.json`:

```json
{
  "plugins": {
    "metalsmith-snippet": {
      "maxLength": 300
    }
  }
}
```

### JavaScript

```js
var snippet = require('metalsmith-snippet')

metalsmith.use(snippet({
  stop: ['<span class="more">']
}))
```

### Templates

You can define a custom snippet in your file when you want to provide something more advanced than the auto-generated snippet.

```
---
title: Example Article
snippet: This is a snippet about my article.
---
```

### Options

* **maxLength** The number of characters to keep the snippet within (default: `Infinity`)
* **suffix** The suffix to append to the snippet when the content is trimmed (default: `…`)
* **stop** A string or array of strings to search for and trim between (default: `null`)
* **stripHtml** Remove all HTML elements from the snippet (default: `true`)
* **stripPre** Strip the `<pre>` element from snippet calculation (default: `true`)

## License

MIT

[npm-image]: https://img.shields.io/npm/v/metalsmith-snippet.svg?style=flat
[npm-url]: https://npmjs.org/package/metalsmith-snippet
[downloads-image]: https://img.shields.io/npm/dm/metalsmith-snippet.svg?style=flat
[downloads-url]: https://npmjs.org/package/metalsmith-snippet
[travis-image]: https://img.shields.io/travis/blakeembrey/metalsmith-snippet.svg?style=flat
[travis-url]: https://travis-ci.org/blakeembrey/metalsmith-snippet
[coveralls-image]: https://img.shields.io/coveralls/blakeembrey/metalsmith-snippet.svg?style=flat
[coveralls-url]: https://coveralls.io/r/blakeembrey/metalsmith-snippet?branch=master
[gittip-image]: https://img.shields.io/gittip/blakeembrey.svg?style=flat
[gittip-url]: https://www.gittip.com/blakeembrey
