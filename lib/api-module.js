(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "@babel/runtime/helpers/classCallCheck", "@babel/runtime/helpers/createClass", "@babel/runtime/helpers/defineProperty", "axios", "./context"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("@babel/runtime/helpers/classCallCheck"), require("@babel/runtime/helpers/createClass"), require("@babel/runtime/helpers/defineProperty"), require("axios"), require("./context"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.classCallCheck, global.createClass, global.defineProperty, global.axios, global.context);
    global.apiModule = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _classCallCheck2, _createClass2, _defineProperty2, _axios, _context) {
  "use strict";

  var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _classCallCheck2 = _interopRequireDefault(_classCallCheck2);
  _createClass2 = _interopRequireDefault(_createClass2);
  _defineProperty2 = _interopRequireDefault(_defineProperty2);
  _axios = _interopRequireDefault(_axios);
  _context = _interopRequireDefault(_context);

  var defaultMiddleware = function defaultMiddleware(context, next) {
    return next(context.responseError);
  };
  /**
   * Api Module class
   * 
   * @static {Function} foreRequestHook
   * @static {Function} postRequestHook
   * @static {Function} fallbackHook
   * 
   * @member {Object} options
   * @member {Function} foreRequestHook
   * @member {Function} postRequestHook
   * @member {Function} fallbackHook
   * 
   * @method useBefore(hook)
   * @method useAfter(hook)
   * @method useCatch(hook)
   * @method getAxios()
   * @method getInstance()
   * @method generateCancellationSource() get axios cancellation source for cancel api
   */


  var ApiModule = /*#__PURE__*/function () {
    function ApiModule() {
      var _this = this;

      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      (0, _classCallCheck2.default)(this, ApiModule);
      (0, _defineProperty2.default)(this, "options", {});
      (0, _defineProperty2.default)(this, "apiMapper", void 0);
      (0, _defineProperty2.default)(this, "foreRequestHook", void 0);
      (0, _defineProperty2.default)(this, "postRequestHook", void 0);
      (0, _defineProperty2.default)(this, "fallbackHook", void 0);
      var _config$metadatas = config.metadatas,
          metadatas = _config$metadatas === void 0 ? {} : _config$metadatas,
          modularNsp = config.module,
          _config$console = config.console,
          useConsole = _config$console === void 0 ? true : _config$console,
          _config$baseConfig = config.baseConfig,
          baseConfig = _config$baseConfig === void 0 ? {} : _config$baseConfig;
      this.options = {
        axios: _axios.default.create(baseConfig),
        metadatas: metadatas,
        module: modularNsp,
        console: useConsole,
        baseConfig: baseConfig
      };
      this.apiMapper = {};

      if (modularNsp) {
        // moduled namespace
        Object.keys(metadatas).forEach(function (apiName) {
          _this.apiMapper[apiName] = _this._proxyable(metadatas[apiName], apiName);
        });
      } else {
        // single module
        this.apiMapper = this._proxyable(metadatas);
      }

      Object.defineProperty(this.apiMapper, '$module', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: this
      });
    }
    /**
     * Register fore-request middleWare globally (for all instances)
     * @param {Function} foreRequestHook(context, next) 
     */


    (0, _createClass2.default)(ApiModule, [{
      key: "useBefore",

      /**
       * Registe Fore-Request MiddleWare
       * @param {Function} foreRequestHook(apiMeta, data = {}, next)
       */
      value: function useBefore() {
        var foreRequestHook = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultMiddleware;
        this.foreRequestHook = foreRequestHook;
      }
      /**
       * Registe Post-Request MiddleWare
       * @param {Function} foreRequestHook(apiMeta, data = {}, next)
       */

    }, {
      key: "useAfter",
      value: function useAfter() {
        var postRequestHook = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultMiddleware;
        this.postRequestHook = postRequestHook;
      }
      /**
       * Registe Fallback MiddleWare
       * @param {Function} fallbackHook(apiMeta, data = {}, next)
       */

    }, {
      key: "useCatch",
      value: function useCatch() {
        var fallbackHook = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultMiddleware;
        this.fallbackHook = fallbackHook;
      }
      /**
       * get axios cancellation source for cancel api
       * @returns {CancelTokenSource}
       */

    }, {
      key: "generateCancellationSource",
      value: function generateCancellationSource() {
        return _axios.default.CancelToken.source();
      }
      /**
       * @returns {Axios} get instance of Axios
       */

    }, {
      key: "getAxios",
      value: function getAxios() {
        return this.options.axios;
      }
      /**
       * @returns {Object} get instance of api metadata mapper
       */

    }, {
      key: "getInstance",
      value: function getInstance() {
        return this.apiMapper;
      }
      /**
       * fore-request middleware
       * @param {Context} context
       * @param {Function} next
       */

    }, {
      key: "foreRequestMiddleWare",
      value: function foreRequestMiddleWare(context, next) {
        var hookFunction = this.foreRequestHook || ApiModule.foreRequestHook || defaultMiddleware;

        if (typeof hookFunction === 'function') {
          hookFunction.call(this, context, next);
        } else {
          console.warn("[ApiModule] foreRequestMiddleWare: ".concat(hookFunction, " is not a valid foreRequestHook function"));
          next();
        }
      }
      /**
       * post-request middleware
       * @param {Context} context
       * @param {Function} next
       */

    }, {
      key: "postRequestMiddleWare",
      value: function postRequestMiddleWare(context, next) {
        var hookFunction = this.postRequestHook || ApiModule.postRequestHook || defaultMiddleware;

        if (typeof hookFunction === 'function') {
          hookFunction.call(this, context, next);
        } else {
          console.warn("[ApiModule] postRequestMiddleWare: ".concat(hookFunction, " is not a valid foreRequestHook function"));
          next();
        }
      }
      /**
       * fallback middleWare
       * @param {Context} context
       * @param {Function} next
       */

    }, {
      key: "fallbackMiddleWare",
      value: function fallbackMiddleWare(context, next) {
        var _this2 = this;

        var error = context.responseError;
        var hookFunction = this.fallbackHook || ApiModule.fallbackHook || defaultMiddleware;

        var defaultErrorHandler = function defaultErrorHandler() {
          if (_this2.options.console) {
            var _context$metadata = context.metadata,
                method = _context$metadata.method,
                url = _context$metadata.url;
            var msg = "[ApiModule] [".concat(method.toUpperCase(), " ").concat(url, "] failed with ").concat(error.message);
            console.error(new Error(msg));
          }

          next();
        };

        if (typeof hookFunction === 'function') {
          hookFunction.call(this, context, next);
        } else {
          console.warn("[ApiModule] fallbackMiddleWare: ".concat(hookFunction, " is not a valid fallbackHook function"));
          defaultErrorHandler();
        }
      } // tranfer single module api meta info to request

    }, {
      key: "_proxyable",
      value: function _proxyable(target, apiName) {
        var _target = {};

        for (var key in target) {
          if (target.hasOwnProperty(key)) {
            _target[key] = this._proxyApiMetadata(target, key, apiName);
          }
        }

        return _target;
      } // map api meta to to request

    }, {
      key: "_proxyApiMetadata",
      value: function _proxyApiMetadata(target, key, parentKey) {
        var _this3 = this;

        var metadata = target[key];

        if (Object.prototype.toString.call(metadata) !== '[object Object]') {
          throw new TypeError("[ApiModule] api metadata [".concat(key, "] is not an object"));
        }

        var context = new _context.default(metadata, this.options);
        context._metadataKeys = [parentKey, key].filter(Boolean);

        if (!context.url || !context.method) {
          console.warn("[ApiModule] check your api metadata for [".concat(key, "]: "), metadata);
          throw new Error("[ApiModule] api metadata [".concat(key, "]: 'method' or 'url' value not found"));
        }
        /**
         * Collect errors and set errors uniformly. Returns if there is an error
         * @param {Error|any} err
         * @return {Boolean}
         */


        var handleResponseError = function handleResponseError(err) {
          var error = err || context.responseError;
          if (!error) return false;

          if (error instanceof Error) {
            context.setError(error);
          } else if (typeof error === 'string') {
            context.setError(new Error(error));
          } else {
            context.setError(error);
          }

          return true;
        };

        var request = function request(data) {
          var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

          context.setData(data)._setRequestOptions(opt);

          return new Promise(function (resolve, reject) {
            _this3.foreRequestMiddleWare(context, function (err) {
              if (handleResponseError(err)) {
                _this3.fallbackMiddleWare(context, function () {
                  reject(context.responseError);
                });
              } else {
                var _ref = context.data || {},
                    _ref$query = _ref.query,
                    query = _ref$query === void 0 ? {} : _ref$query,
                    _ref$body = _ref.body,
                    body = _ref$body === void 0 ? {} : _ref$body;

                var config = Object.assign({}, {
                  method: context.method.toLowerCase(),
                  url: context.url,
                  params: query,
                  data: body
                }, context.axiosOptions);

                _this3.options.axios(config).then(function (res) {
                  context.setResponse(res);

                  _this3.postRequestMiddleWare(context, function (err) {
                    if (handleResponseError(err)) {
                      throw context.responseError;
                    }

                    resolve(context.response);
                  });
                }).catch(function (error) {
                  handleResponseError(error);

                  _this3.fallbackMiddleWare(context, function (err) {
                    handleResponseError(err);
                    reject(context.responseError);
                  });
                });
              }
            });
          });
        };

        request.context = context;
        return request;
      }
    }], [{
      key: "globalBefore",
      value: function globalBefore() {
        var foreRequestHook = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultMiddleware;
        ApiModule.foreRequestHook = foreRequestHook;
      }
      /**
       * Register post-request middleware globally (for all instances)
       * @param {Function} foreRequestHook(apiMeta, data = {}, next) 
       */

    }, {
      key: "globalAfter",
      value: function globalAfter() {
        var postRequestHook = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultMiddleware;
        ApiModule.postRequestHook = postRequestHook;
      }
      /**
       * Register fallback MiddleWare Globally (For All Instance)
       * @param {Function} fallbackHook(apiMeta, data = {}, next) 
       */

    }, {
      key: "globalCatch",
      value: function globalCatch() {
        var fallbackHook = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultMiddleware;
        ApiModule.fallbackHook = fallbackHook;
      }
    }]);
    return ApiModule;
  }();

  _exports.default = ApiModule;
  (0, _defineProperty2.default)(ApiModule, "foreRequestHook", void 0);
  (0, _defineProperty2.default)(ApiModule, "postRequestHook", void 0);
  (0, _defineProperty2.default)(ApiModule, "fallbackHook", void 0);
  module.exports = exports.default;
});