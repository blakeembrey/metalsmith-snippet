var he = require('he')
var extend = require('xtend')
var arrify = require('arrify')
var voidElements = require('void-elements')
var extname = require('path').extname

/**
 * Expose snippet function.
 */
module.exports = metalsmithSnippet

/**
 * Default options.
 */
var DEFAULTS = {
  suffix: '…',
  maxLength: Infinity,
  stripHtml: true,
  stripPre: true
}

/**
 * Match trailing punctuation.
 */
var PUNCTUATION_REGEXP = /[\s,\.!?]/
var TRAILING_PUNCTUATION_REGEXP = /[\s,\.!?]+$/
var WHITESPACE_REGEXP = /\s/

/**
 * Support creating excerpts from basic html.
 *
 * @param  {Object}               opts
 * @param  {number}               [opts.maxLength]
 * @param  {string|Array<string>} [opts.stop]
 * @param  {boolean}              [opts.stripHtml]
 * @param  {boolean}              [opts.stripPre]
 * @return {Function}
 */
function metalsmithSnippet (opts) {
  // Always `arrify` the `stop` option.
  var options = extend(DEFAULTS, opts)

  // Sanitize data input.
  options.stop = arrify(options.stop)
  options.maxLength = +options.maxLength || Infinity

  // Verify the options are correctly set.
  if (options.maxLength === Infinity && options.stop.length === 0) {
    throw new TypeError('Metalsmith snippet needs `maxLength` or `stop` to be set to function properly')
  }

  return function (files, metalsmith, done) {
    Object.keys(files).forEach(function (file) {
      var data = files[file]

      // Skip attaching a snippet when one has been defined.
      if (data.snippet != null || !isHtml(file)) {
        return
      }

      data.snippet = extractSnippet(data.contents.toString(), options)
    })

    return done()
  }
}

/**
 * Extract a short snippet based on the file contents.
 *
 * @param  {String} contents
 * @param  {Object} options
 * @return {String}
 */
function extractSnippet (contents, options) {
  var hasMore = false
  var suffix = he.encode(options.suffix)

  // Replace `pre` sections when specified, avoids counting characters in code.
  if (options.trimPre) {
    contents = contents.replace(/<pre[^>]*>[\s\S]*?<\/pre>/g, '')
  }

  // If a stop occurs before `maxLength`, use that.
  for (var i = 0; i < options.stop.length; i++) {
    var stopIndex = contents.indexOf(options.stop[i])

    if (stopIndex > -1) {
      hasMore = true
      contents = contents.substr(0, stopIndex)
    }
  }

  // Stop HTML tags as I "parse" them.
  var tags = []
  var isInTag = false
  var length = 0
  var contentBreak = -1
  var whitespaceBreak = -1

  // Traverse the HTML, should be stable will well written HTML.
  for (var offset = 0; offset < contents.length; offset++) {
    var char = contents.charAt(offset)
    var nextChar = contents.charAt(offset + 1)

    if (char === '<') {
      var tagname = ''
      var isClosingTag = nextChar === '/'

      // Increment the parser after closing tag.
      if (isClosingTag) {
        offset++
      }

      // Set "isInTag" to `true`.
      isInTag = true

      while (offset++ < contents.length) {
        // Stop parsing tag name on first white space or closing tag.
        if (/\s|>/.test(contents[offset])) {
          isInTag = contents[offset] !== '>'

          if (tagname) {
            if (isClosingTag) {
              if (tags[tags.length - 1] === tagname) {
                tags.pop()
              }
            } else {
              if (!voidElements.hasOwnProperty(tagname)) {
                tags.push(tagname)
              }
            }
          }

          break
        }

        tagname += contents[offset]
      }
    } else if (char === '>') {
      isInTag = false
    } else if (char === '&') {
      for (var j = offset; j < contents.length; j++) {
        if (WHITESPACE_REGEXP.test(contents[j])) {
          break
        } else if (contents[j] === ';') {
          length++
          offset = j
          break
        }
      }
    } else if (!isInTag) {
      // Keep track of the HTML break.
      if (WHITESPACE_REGEXP.test(contents[offset])) {
        whitespaceBreak = offset

        // Ignore additional whitespace in length calculations.
        while (WHITESPACE_REGEXP.test(contents[offset + 1])) {
          offset++
        }
      }

      length++
    }

    if (length >= options.maxLength) {
      hasMore = true
      contentBreak = offset

      // Check the following character for punctuation.
      if (PUNCTUATION_REGEXP.test(contents[offset + 1])) {
        whitespaceBreak = offset + 1
      }

      break
    }
  }

  // Ignore snippets when a whitespace break was not found.
  if (whitespaceBreak === -1) {
    return ''
  }

  // Remove content past the `maxLength`.
  if (contentBreak > -1) {
    contents = contents.substr(0, whitespaceBreak)
  }

  // Strip or correct invalid HTML snippet.
  if (options.stripHtml) {
    contents = contents.replace(/<\S+?[^>]*>/g, '').replace(/\s+/g, ' ')
  }

  // Append suffix to contents.
  if (hasMore) {
    contents = contents.replace(TRAILING_PUNCTUATION_REGEXP, '') + suffix
  }

  if (!options.stripHtml) {
    // Pop off in reverse order to output valid HTML.
    while (tags.length) {
      contents += '</' + tags.pop() + '>'
    }
  }

  return contents
}

/**
 * Check whether the file is html.
 *
 * @param  {String}  file
 * @return {Boolean}
 */
function isHtml (file) {
  return extname(file) === '.html'
}
