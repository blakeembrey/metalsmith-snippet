var extend   = require('extend');
var extname  = require('path').extname;
var entities = require('ent');

/**
 * Support creating excerpts from basic html.
 *
 * @param  {Object}   maxLength
 * @return {Function}
 */
module.exports = function (opts) {
  opts = extend({
    suffix: '…',
    maxLength: 300,
    stopAtSubstring: false,
    stops: ['<span class="more', '<h2', '<hr']
  }, opts);

  return function (files, metalsmith, done) {
    Object.keys(files).forEach(function (file) {
      var data = files[file];

      // Skip attaching a snippet if one has been defined already.
      if (data.snippet || !isHtml(file)) {
        return;
      }

      data.snippet = extractSnippet(data.contents.toString(), opts);
    });

    return done();
  };
};

/**
 * Extract a short snippet based on the file contents.
 *
 * @param  {String} contents
 * @param  {Object} opts
 * @return {String}
 */
function extractSnippet (contents, opts) {
  if (opts.stopAtSubstring) {
    return trimToSubstring(contents, opts);
  }
  else {
    return trimToLength(contents, opts);
  }
}

/**
 * Trims to a specified maxLength with optional suffix
 *
 * @param  {String} contents
 * @param  {Object} opts
 * @return {String}
 */
function trimToLength (contents, opts) {
  // Remove code sections, html tags and any additional whitespace.
  contents = entities.decode(contents)
    .replace(/<pre[^>]*>[\s\S]*?<\/pre>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/, ' ')
    .trim();

  // If the total contents length is already shorted, return.
  if (contents.length < opts.maxLength) {
    return entities.encode(contents);
  }

  // Find the last whitespace break before the maximum length.
  var nonWordIndex = contents.substr(0, opts.maxLength + 1).lastIndexOf(' ');

  // A non-word index could not be found within the `maxLength`, return nothing.
  if (nonWordIndex === -1) {
    return '';
  }

  // Extract the string using the maximum number of words within the length. We
  // also trim trailing punctuation characters.
  contents = contents.substr(0, nonWordIndex).replace(/[,\.!?;]+$/, '');

  return entities.encode(contents + opts.suffix);
}

/**
 * Trims to the content before a specified substring or array of substrings
 *
 * @param  {String} contents
 * @param  {Object} opts
 * @return {String}
 */
function trimToSubstring (contents, opts) {
    contents = contents.trim();

    // Make sure stops is an Array
    if (opts.stops.constructor !== Array) {
      opts.stops = [opts.stops];
    }

    var idx = Infinity;
    // Find the earliest stopping point
    opts.stops.forEach(function (stop) {
      var i = contents.indexOf(stop);
      if (i !== -1 && i < idx) {
        idx = i;
      }
    });

    // Don't add the suffix or trim trailing characters.
    // The content has already decided where it wants to stop.
    return idx !== Infinity ? contents.substr(0, idx) : contents;
}

/**
 * Check whether the file is html.
 *
 * @param  {String}  file
 * @return {Boolean}
 */
function isHtml (file) {
  return extname(file) === '.html';
}
