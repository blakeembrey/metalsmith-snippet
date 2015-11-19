/* global describe, it */

var expect = require('chai').expect
var snippet = require('./')

describe('metalsmith snippet', function () {
  describe('extract all text when length is shorter than max', function () {
    var files = {
      'test.html': { contents: '<p>Hello, world!</p>' }
    }

    it('should extract the snippet', function (done) {
      return snippet({ maxLength: 500 })(files, {}, function (err) {
        expect(files['test.html'].snippet).to.equal('Hello, world!')

        return done(err)
      })
    })
  })

  describe('should not override existing snippets', function () {
    var files = {
      'test.html': {
        contents: 'Hello, world!',
        snippet: 'Existing snippet...'
      }
    }

    it('should skip extracting a snippet', function (done) {
      return snippet({ stop: ['<span'] })(files, {}, function (err) {
        expect(files['test.html'].snippet).to.equal(
          'Existing snippet...'
        )

        return done(err)
      })
    })
  })

  describe('no word breaks', function () {
    var files = {
      'test.html': {
        contents: 'Supercalifragilisticexpialidocious'
      }
    }

    it('should not set the snippet when it does not fit', function (done) {
      return snippet({ maxLength: 20 })(files, {}, function (err) {
        expect(files['test.html'].snippet).to.be.empty

        return done(err)
      })
    })
  })

  describe('break between words', function () {
    var files = {
      'test.html': {
        contents: 'This is some simple test content.'
      }
    }

    it('should break on whitespace before the max length', function (done) {
      return snippet({ maxLength: 20 })(files, {}, function (err) {
        expect(files['test.html'].snippet).to.equal(
          'This is some simple&#x2026;'
        )

        return done(err)
      })
    })
  })

  describe('ignore void elements', function () {
    var files = {
      'test.html': {
        contents: '<p>This is a <img src="foo.png"> test break.</p>'
      }
    }

    it('should break before max length', function (done) {
      return snippet({ maxLength: 15 })(files, {}, function (err) {
        expect(files['test.html'].snippet).to.equal(
          'This is a test&#x2026;'
        )

        return done(err)
      })
    })
  })

  describe('do not count html entities', function () {
    var files = {
      'test.html': {
        contents: 'Super simple&mdash;test script.'
      }
    }

    it('should break before max length', function (done) {
      return snippet({ maxLength: 20 })(files, {}, function (err) {
        expect(files['test.html'].snippet).to.equal(
          'Super simple&mdash;test&#x2026;'
        )

        return done(err)
      })
    })
  })

  describe('trim punctuation before break', function () {
    var files = {
      'test.html': {
        contents: 'God, damn, commas.'
      }
    }

    it('should trim the comma before appending the suffix', function (done) {
      return snippet({ maxLength: 10 })(files, {}, function (err) {
        expect(files['test.html'].snippet).to.equal('God, damn&#x2026;')

        return done(err)
      })
    })
  })

  describe('custom suffix', function () {
    var files = {
      'test.html': {
        contents: 'Hello, world!'
      }
    }

    it('should be able to pass in a custom suffix', function (done) {
      return snippet({
        maxLength: 8,
        suffix: '...'
      })(files, {}, function (err) {
        expect(files['test.html'].snippet).to.equal('Hello...')

        return done(err)
      })
    })
  })

  describe('stop', function () {
    var files = {
      'test.html': {
        contents: 'Hello,   world!<span class="more"></span> This stops before printing this.'
      }
    }

    it('should trim to before the span', function (done) {
      return snippet({ stop: '<span class="more"' })(files, {}, function (err) {
        expect(files['test.html'].snippet).to.equal('Hello, world&#x2026;')

        return done(err)
      })
    })
  })

  describe('multiple stops', function () {
    var files = {
      'test.html': {
        contents: 'Hello, <hr>world! <span class="more"></span>This stops after Hello, '
      }
    }

    it('should trim to first stop index', function (done) {
      return snippet({ stop: ['<span class="more"', '<hr'] })(files, {}, function (err) {
        expect(files['test.html'].snippet).to.equal('Hello&#x2026;')

        return done(err)
      })
    })
  })

  describe('append unclosed html tags', function () {
    var files = {
      'test.html': {
        contents: '<p>Hello, <hr>world!</p>'
      }
    }

    it('should trim to first stop index', function (done) {
      return snippet({
        stop: ['<hr'],
        stripHtml: false
      })(files, {}, function (err) {
        expect(files['test.html'].snippet).to.equal('<p>Hello&#x2026;</p>')

        return done(err)
      })
    })
  })

  describe('custom stop', function () {
    var files = {
      'test.html': {
        contents: 'Hello, world! <span class="more"></span>This will print some of this sentence.'
      }
    }

    it('should trim to custom stop index', function (done) {
      return snippet({ stop: 'some' })(files, {}, function (err) {
        expect(files['test.html'].snippet).to.equal(
          'Hello, world! This will print&#x2026;'
        )

        return done(err)
      })
    })
  })

  describe('skip not found stop token', function () {
    var files = {
      'test.html': {
        contents: 'This will print everything.'
      }
    }

    it('should trim to custom stop index', function (done) {
      return snippet({
        stop: 'foo'
      })(files, {}, function (err) {
        expect(files['test.html'].snippet).to.equal('This will print everything.')

        return done(err)
      })
    })
  })

  describe('should not strip html', function () {
    var files = {
      'test.html': {
        contents: 'Hello, world! <span class="more"></span>This will print some of this sentence.'
      }
    }

    it('should trim to custom stop index', function (done) {
      return snippet({
        stop: 'some',
        stripHtml: false
      })(files, {}, function (err) {
        expect(files['test.html'].snippet).to.equal(
          'Hello, world! <span class="more"></span>This will print&#x2026;'
        )

        return done(err)
      })
    })
  })
})
