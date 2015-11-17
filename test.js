var expect  = require('chai').expect;
var snippet = require('./');

describe('metalsmith snippet', function () {
  describe('extract all text when length is shorter than max', function () {
    var files = {
      'test.html': { contents: 'Hello, world!' }
    };

    it('should extract the snippet', function (done) {
      return snippet()(files, {}, function (err) {
        expect(files['test.html'].snippet).to.equal('Hello, world!');

        return done(err);
      });
    });
  });

  describe('should not override existing snippets', function () {
    var files = {
      'test.html': {
        contents: 'Hello, world!',
        snippet: 'Look ma, I added my own snippet!'
      }
    };

    it('should skip extracting a snippet', function (done) {
      return snippet()(files, {}, function (err) {
        expect(files['test.html'].snippet).to.equal(
          'Look ma, I added my own snippet!'
        );

        return done(err);
      });
    });
  });

  describe('no word breaks', function () {
    var files = {
      'test.html': {
        contents: 'Supercalifragilisticexpialidocious'
      }
    };

    it('should not set the snippet when it does not fit', function (done) {
      return snippet({ maxLength: 20 })(files, {}, function (err) {
        expect(files['test.html'].snippet).to.be.empty;

        return done(err);
      })
    });
  });

  describe('break between words', function () {
    var files = {
      'test.html': {
        contents: 'This is some simple test content.'
      }
    };

    it('should break on whitespace before the max length', function (done) {
      return snippet({ maxLength: 20 })(files, {}, function (err) {
        expect(files['test.html'].snippet).to.equal(
          'This is some simple&#8230;'
        );

        return done(err);
      });
    });
  });

  describe('trim punctuation before break', function () {
    var files = {
      'test.html': {
        contents: 'God, damn, commas.'
      }
    };

    it('should trim the comma before appending the suffix', function (done) {
      return snippet({ maxLength: 10 })(files, {}, function (err) {
        expect(files['test.html'].snippet).to.equal('God, damn&#8230;');

        return done(err);
      });
    });
  });

  describe('custom suffix', function () {
    var files = {
      'test.html': {
        contents: 'Hello, world!'
      }
    };

    it('should be able to pass in a custom suffix', function (done) {
      return snippet({
        maxLength: 8,
        suffix: '...'
      })(files, {}, function (err) {
        expect(files['test.html'].snippet).to.equal('Hello...');

        return done(err);
      });
    });
  });

  describe('stop at substring default', function () {
    var files = {
      'test.html': {
        contents: 'Hello, world!<span class="more"></span> This stops before printing this.'
      }
    };

    it('should trim to before the span', function (done) {
      return snippet({ stopAtSubstring: true })(files, {}, function (err) {
        expect(files['test.html'].snippet).to.equal('Hello, world!');

        return done(err);
      });
    });
  });

  describe('stop at earliest substring', function () {
    var files = {
      'test.html': {
        contents: 'Hello, <hr>world! <span class="more"></span>This stops after Hello, '
      }
    };

    it('should trim to "Hello, "', function (done) {
      return snippet({ stopAtSubstring: true })(files, {}, function (err) {
        expect(files['test.html'].snippet).to.equal('Hello, ');

        return done(err);
      });
    });
  });

  describe('should allow custom stops', function () {
    var files = {
      'test.html': {
        contents: 'Hello, world! <span class="more"></span>This will print some of this sentence.'
      }
    };

    it('should trim to before the word "some"', function (done) {
      return snippet({ stopAtSubstring: true, stops: ['some']})(files, {}, function (err) {
        expect(files['test.html'].snippet).to.equal('Hello, world! <span class="more"></span>This will print ');

        return done(err);
      });
    });
  });
});
