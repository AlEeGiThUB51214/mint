(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  module.exports = {
    engines: {},
    engine: function(extension) {
      var _base;
      extension = extension.replace(/^\./, '');
      return (_base = this.engines)[extension] || (_base[extension] = (function() {
        switch (extension) {
          case "styl":
          case "stylus":
            return "stylus";
          case "jade":
            return "jade";
          case "haml":
            return "haml";
          case "ejs":
            return "ejs";
          case "coffee":
          case "coffeescript":
          case "coffee-script":
            return "coffee";
          case "less":
            return "less";
          case "mu":
          case "mustache":
            return "mustache";
          case "md":
          case "mkd":
          case "markdown":
          case "mdown":
            return "markdown";
        }
      })());
    },
    enginesFor: function(path) {
      var engine, engines, extension, extensions, _i, _len;
      engines = [];
      extensions = path.split("/");
      extensions = extensions[extensions.length - 1];
      extensions = extensions.split(".").slice(1);
      for (_i = 0, _len = extensions.length; _i < _len; _i++) {
        extension = extensions[_i];
        engine = this.engine(extension);
        if (engine) {
          engines.push(engine);
        }
      }
      return engines;
    },
    render: function(options, callback) {
      var engines, iterate, path, string;
      path = options.path;
      string = options.string || require('fs').readFileSync(path, 'utf-8');
      engines = options.engines || this.enginesFor(path);
      iterate = __bind(function(engine, next) {
        return this[engine](string, options, __bind(function(error, output) {
          if (error) {
            return next(error);
          } else {
            string = output;
            return next();
          }
        }, this));
      }, this);
      return this._async(engines, iterate, __bind(function(error) {
        return callback.call(this, error, string);
      }, this));
    },
    stylus: function(content, options, callback) {
      var engine, path, preprocessor, result;
      result = "";
      path = options.path;
      preprocessor = options.preprocessor || this.stylus.preprocessor;
      if (preprocessor) {
        content = preprocessor.call(this, content, options);
      }
      engine = require('stylus');
      engine.render(content, options, __bind(function(error, data) {
        result = data;
        if (error && path) {
          error.message = error.message.replace(/\n$/, ", " + path + "\n");
        }
        if (callback) {
          return callback.call(this, error, result);
        }
      }, this));
      return result;
    },
    jade: function(content, options, callback) {
      var path, preprocessor, result;
      result = "";
      path = options.path;
      preprocessor = options.preprocessor || this.jade.preprocessor;
      if (preprocessor) {
        content = preprocessor.call(this, content, options);
      }
      require("jade").render(content, options, __bind(function(error, data) {
        result = data;
        if (error && path) {
          error.message += ", " + path;
        }
        if (callback) {
          return callback.call(this, error, result);
        }
      }, this));
      return result;
    },
    haml: function(content, options, callback) {
      var result;
      result = require('hamljs').render(content, options || {});
      if (callback) {
        callback.call(this, null, result);
      }
      return result;
    },
    ejs: function(content, options, callback) {
      var error, result;
      result = "";
      error = null;
      try {
        result = require("ejs").render(content, options);
      } catch (e) {
        error = e;
        result = null;
      }
      if (callback) {
        callback.call(this, error, result);
      }
      return result;
    },
    eco: function(content, options, callback) {
      var result;
      result = require("eco").render(content, options.locals);
      if (callback) {
        callback.call(this, null, result);
      }
      return result;
    },
    coffee: function(content, options, callback) {
      var error, path, preprocessor, result;
      result = "";
      path = options.path;
      if (!options.hasOwnProperty("bare")) {
        options.bare = true;
      }
      preprocessor = options.preprocessor || this.coffee.preprocessor;
      if (preprocessor) {
        content = preprocessor.call(this, content, options);
      }
      try {
        result = require("coffee-script").compile(content, options);
      } catch (e) {
        result = null;
        error = e;
        if (path) {
          error.message += ", " + path;
        }
      }
      if (callback) {
        callback.call(this, error, result);
      }
      return result;
    },
    coffeekup: function(content, options, callback) {
      var result;
      result = require("coffeekup").render(content, options);
      if (callback) {
        callback.call(this, null, result);
      }
      return result;
    },
    less: function(content, options, callback) {
      var engine, parser, path, result;
      result = "";
      path = options.path;
      options.filename = path;
      options.paths || (options.paths = []);
      options.paths = ["."].concat(options.paths);
      engine = require("less");
      parser = new engine.Parser(options);
      try {
        parser.parse(content, __bind(function(error, tree) {
          if (error) {
            if (path) {
              error.message += ", " + path;
            }
          } else {
            try {
              result = tree.toCSS();
            } catch (e) {
              error = e;
            }
          }
          if (callback) {
            return callback.call(this, error, result);
          }
        }, this));
      } catch (error) {
        callback.call(this, error.message += ", " + path, "");
      }
      return result;
    },
    mustache: function(content, options, callback) {
      var error, path, preprocessor, result;
      path = options.path;
      error = null;
      preprocessor = options.preprocessor || this.constructor.preprocessor;
      if (preprocessor) {
        content = preprocessor.call(this, content, options);
      }
      try {
        result = require("mustache").to_html(content, options.locals);
      } catch (e) {
        error = e;
        result = null;
        if (path) {
          error.message += ", " + path;
        }
      }
      if (callback) {
        callback.call(this, error, result);
      }
      return result;
    },
    handlebars: function(content, options, callback) {},
    markdown: function(content, options, callback) {
      var error, preprocessor, result;
      error = null;
      preprocessor = options.preprocessor || this.constructor.preprocessor;
      if (preprocessor) {
        content = preprocessor.call(this, content, options);
      }
      try {
        result = require("markdown").parse(content);
      } catch (e) {
        error = e;
      }
      if (callback) {
        callback.call(this, error, result);
      }
      return result;
    },
    yui: function(content, options, callback) {
      var error, path, result;
      path = options.path;
      error = null;
      try {
        result = require("./vendor/cssmin").cssmin(content);
      } catch (e) {
        error = e;
        if (path) {
          error.message += ", " + path;
        }
      }
      if (callback) {
        callback.call(this, error, result);
      }
      return result;
    },
    uglifyjs: function(content, options, callback) {
      var ast, compressor, error, parser, path, result;
      path = options.path;
      error = null;
      parser = require("uglify-js").parser;
      compressor = require("uglify-js").uglify;
      try {
        ast = parser.parse(content);
        ast = compressor.ast_mangle(ast);
        ast = compressor.ast_squeeze(ast);
        result = compressor.gen_code(ast);
      } catch (e) {
        error = e;
        if (path) {
          error.message += ", " + path;
        }
      }
      if (callback) {
        callback.call(this, error, result);
      }
      return result;
    },
    _async: function(array, iterator, callback) {
      var completed, iterate;
      if (!array.length) {
        return callback();
      }
      completed = 0;
      iterate = function() {
        return iterator(array[completed], function(error) {
          if (error) {
            callback(error);
            return callback = function() {};
          } else {
            completed += 1;
            if (completed === array.length) {
              return callback();
            } else {
              return iterate();
            }
          }
        });
      };
      return iterate();
    }
  };
}).call(this);