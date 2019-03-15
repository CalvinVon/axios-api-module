(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "@babel/runtime/helpers/classCallCheck", "@babel/runtime/helpers/createClass", "@babel/runtime/helpers/defineProperty", "axios"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("@babel/runtime/helpers/classCallCheck"), require("@babel/runtime/helpers/createClass"), require("@babel/runtime/helpers/defineProperty"), require("axios"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.classCallCheck, global.createClass, global.defineProperty, global.axios);
    global.apiModule = mod.exports;
  }
})(this, function (_exports, _classCallCheck2, _createClass2, _defineProperty2, _axios) {
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

  /**
   * Api Module class
   * 
   * @static {Function} foreRequestHook
   * @static {Function} fallbackHook
   * 
   * @member {Object} options
   * @member {Function} foreRequestHook
   * @member {Function} fallbackHook
   * 
   * @method registerForeRequestMiddleWare(hook)
   * @method registerFallbackMiddleWare(hook)
   * @method getAxios()
   * @method getInstance(hook)
   * @method generateCancellationSource() get axios cancellation source for cancel api
   */
  var ApiModule =
  /*#__PURE__*/
  function () {
    function ApiModule() {
      var _this = this;

      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      (0, _classCallCheck2.default)(this, ApiModule);
      (0, _defineProperty2.default)(this, "options", {});
      (0, _defineProperty2.default)(this, "foreRequestHook", void 0);
      (0, _defineProperty2.default)(this, "fallbackHook", void 0);
      var _config$apiMetas = config.apiMetas,
          apiMetas = _config$apiMetas === void 0 ? {} : _config$apiMetas,
          _config$module = config.module,
          modularNsp = _config$module === void 0 ? true : _config$module,
          _config$console = config.console,
          useConsole = _config$console === void 0 ? true : _config$console,
          _config$baseConfig = config.baseConfig,
          baseConfig = _config$baseConfig === void 0 ? {} : _config$baseConfig;
      var API_ = {};

      if (modularNsp) {
        // moduled namespace
        Object.keys(apiMetas).forEach(function (apiName) {
          API_[apiName] = _this._Proxyable(apiMetas[apiName]);
        });
      } else {
        // single module
        API_ = this._Proxyable(apiMetas);
      }

      Object.defineProperty(API_, '$module', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: this
      });
      this.options = {
        axios: _axios.default,
        apiMetas: apiMetas,
        apis: API_,
        module: modularNsp,
        console: useConsole,
        baseConfig: baseConfig
      };
    }
    /**
     * Registe ForeRequest MiddleWare Globally (For All Instance)
     * @param {Function} foreRequestHook(apiMeta, data = {}, next) 
     */


    (0, _createClass2.default)(ApiModule, [{
      key: "registerForeRequestMiddleWare",

      /**
       * Registe ForeRequest MiddleWare
       * @param {Function} foreRequestHook(apiMeta, data = {}, next)
       */
      value: function registerForeRequestMiddleWare() {
        var foreRequestHook = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Function();
        this.foreRequestHook = foreRequestHook;
      }
      /**
       * Registe Fallback MiddleWare
       * @param {Function} fallbackHook(apiMeta, data = {}, next)
       */

    }, {
      key: "registerFallbackMiddleWare",
      value: function registerFallbackMiddleWare() {
        var fallbackHook = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Function();
        this.fallbackHook = fallbackHook;
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
       * get axios cancellation source for cancel api
       * @returns {CancelTokenSource}
       */

    }, {
      key: "generateCancellationSource",
      value: function generateCancellationSource() {
        return _axios.default.CancelToken.source();
      }
      /**
       * @returns {Object} get instance of api set object
       */

    }, {
      key: "getInstance",
      value: function getInstance() {
        return this.options.apis;
      }
      /**
       * fore request middleware
       * @param {ApiMeta} apiMeta api meta data
       * @param {Object} data request data
       * @param {Query/Body} next(err) call for next step
       */

    }, {
      key: "foreRequestMiddleWare",
      value: function foreRequestMiddleWare(apiMeta) {
        var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var next = arguments.length > 2 ? arguments[2] : undefined;
        var hookFunction = this.foreRequestHook || ApiModule.foreRequestHook;

        if (typeof hookFunction === 'function') {
          hookFunction(apiMeta, data, next);
        } else {
          next();
        }
      }
      /**
       * fallback middleWare
       * @param {ApiMeta} apiMeta api meta data
       * @param {Error} error
       * @param {Function} next(err) call for next step
       */

    }, {
      key: "fallbackMiddleWare",
      value: function fallbackMiddleWare(apiMeta, error, next) {
        var _this2 = this;

        var hookFunction = this.fallbackHook || ApiModule.fallbackHook;

        var defaultErrorHandler = function defaultErrorHandler() {
          if (_this2.options.console) {
            var name = apiMeta.name,
                method = apiMeta.method,
                url = apiMeta.url;
            var msg = "ApiModule - ".concat(name, " [").concat(method.toUpperCase(), "]: [").concat(url, "] failed with ").concat(error.message);
            console.error(new Error(msg));
          }

          next(error);
        };

        if (typeof hookFunction === 'function') {
          hookFunction(apiMeta, error, defaultErrorHandler);
        } else {
          defaultErrorHandler(error);
        }
      } // tranfer single module api meta info to request

    }, {
      key: "_Proxyable",
      value: function _Proxyable(target) {
        var target_ = {};

        for (var key in target) {
          if (target.hasOwnProperty(key)) {
            target_[key] = this._ProxyApi(target, key);
          }
        }

        return target_;
      } // map api meta to to request

    }, {
      key: "_ProxyApi",
      value: function _ProxyApi(target, key) {
        var _this3 = this;

        if (!target[key]) throw new ReferenceError('API ' + key + ' not exist');
        var _target$key = target[key],
            method = _target$key.method,
            url = _target$key.url;

        if (!method || !url) {
          console.error('[ApiModule error] invalid api meta found');
          console.dir(target[key]);
          return;
        }

        var parsedUrl = url;
        return function () {
          var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          var _data$query = data.query,
              query = _data$query === void 0 ? {} : _data$query,
              _data$params = data.params,
              params = _data$params === void 0 ? {} : _data$params,
              _data$body = data.body,
              body = _data$body === void 0 ? {} : _data$body;
          return new Promise(function (resolve, reject) {
            // parse url
            // handle api like /a/:id/b/{param}
            parsedUrl = url.replace(/\B(?::(\w+)|{(\w+)})/g, function () {
              return params[(arguments.length <= 1 ? undefined : arguments[1]) || (arguments.length <= 2 ? undefined : arguments[2])];
            }); // fore request task

            _this3.foreRequestMiddleWare(target[key], data, function (err) {
              if (err) {
                _this3.fallbackMiddleWare(target[key], err, reject);
              } else {
                var config = Object.assign({}, _this3.options.baseConfig, {
                  method: method.toLowerCase(),
                  url: parsedUrl,
                  params: query,
                  data: body
                }, opt);
                (0, _axios.default)(config).then(function (data) {
                  return resolve(data);
                }).catch(function (err) {
                  _this3.fallbackMiddleWare(target[key], err, reject);
                });
              }
            });
          });
        };
      }
    }], [{
      key: "registerForeRequestMiddleWare",
      value: function registerForeRequestMiddleWare() {
        var foreRequestHook = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Function();
        ApiModule.foreRequestHook = foreRequestHook;
      }
      /**
       * Registe ForeRequest MiddleWare Globally (For All Instance)
       * @param {Function} fallbackHook(apiMeta, data = {}, next) 
       */

    }, {
      key: "registerFallbackMiddleWare",
      value: function registerFallbackMiddleWare() {
        var fallbackHook = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Function();
        ApiModule.fallbackHook = fallbackHook;
      }
    }]);
    return ApiModule;
  }();

  _exports.default = ApiModule;
  (0, _defineProperty2.default)(ApiModule, "foreRequestHook", void 0);
  (0, _defineProperty2.default)(ApiModule, "fallbackHook", void 0);
  module.exports = exports.default;
});