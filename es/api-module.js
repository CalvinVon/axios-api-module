import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _defineProperty from "@babel/runtime/helpers/defineProperty";
import axios from 'axios';

var defaultForeRequestHook = function defaultForeRequestHook() {
  return function (_, __, next) {
    return next();
  };
};

var defaultPostRequestHook = function defaultPostRequestHook() {
  return function (_, _ref, next) {
    var response = _ref.response;
    return next(response);
  };
};

var defaultFallbackHook = function defaultFallbackHook() {
  return function (_, _ref2, next) {
    var error = _ref2.error;
    return next(error);
  };
};
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
 * @method useBefore(hook)
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

    _classCallCheck(this, ApiModule);

    _defineProperty(this, "options", {});

    _defineProperty(this, "foreRequestHook", void 0);

    _defineProperty(this, "postRequestHook", void 0);

    _defineProperty(this, "fallbackHook", void 0);

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
      axios: axios.create(baseConfig),
      apiMetas: apiMetas,
      apis: API_,
      module: modularNsp,
      console: useConsole,
      baseConfig: baseConfig
    };
  }
  /**
   * Register Globally Fore-Request MiddleWare Globally (For All Instance)
   * @param {Function} foreRequestHook(apiMeta, data = {}, next) 
   */


  _createClass(ApiModule, [{
    key: "useBefore",

    /**
     * Registe Fore-Request MiddleWare
     * @param {Function} foreRequestHook(apiMeta, data = {}, next)
     */
    value: function useBefore() {
      var foreRequestHook = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultForeRequestHook();
      this.foreRequestHook = foreRequestHook;
    }
    /**
     * Registe Post-Request MiddleWare
     * @param {Function} foreRequestHook(apiMeta, data = {}, next)
     */

  }, {
    key: "registerPostRequestMiddleWare",
    value: function registerPostRequestMiddleWare() {
      var postRequestHook = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultPostRequestHook();
      this.postRequestHook = postRequestHook;
    }
    /**
     * Registe Fallback MiddleWare
     * @param {Function} fallbackHook(apiMeta, data = {}, next)
     */

  }, {
    key: "registerFallbackMiddleWare",
    value: function registerFallbackMiddleWare() {
      var fallbackHook = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultFallbackHook();
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
      return axios.CancelToken.source();
    }
    /**
     * @returns {Object} get instance of api mapper
     */

  }, {
    key: "getInstance",
    value: function getInstance() {
      return this.options.apis;
    }
    /**
     * fore-request middleware
     * @param {ApiMeta} apiMeta api metadata
     * @param {Object} data request data
     * @param {Query/Body} next(err) call for next step
     */

  }, {
    key: "foreRequestMiddleWare",
    value: function foreRequestMiddleWare(apiMeta, data, next) {
      var hookFunction = this.foreRequestHook || ApiModule.foreRequestHook || defaultForeRequestHook();

      if (typeof hookFunction === 'function') {
        hookFunction.call(this, apiMeta, data, next);
      } else {
        console.warn("[ApiModule] foreRequestMiddleWare: ".concat(hookFunction, " is not a valid foreRequestHook function"));
        next();
      }
    }
    /**
     * post-request middleware
     * @param {ApiMeta} apiMeta api metadata
     * @param {Object} resWrapper contains `response` data and `data` fields
     * @param {Query/Body} next(err) call for next step
     */

  }, {
    key: "postRequestMiddleWare",
    value: function postRequestMiddleWare(apiMeta, resWrapper, next) {
      var hookFunction = this.postRequestHook || ApiModule.postRequestHook || defaultPostRequestHook();

      if (typeof hookFunction === 'function') {
        hookFunction.call(this, apiMeta, resWrapper, next);
      } else {
        console.warn("[ApiModule] postRequestMiddleWare: ".concat(hookFunction, " is not a valid foreRequestHook function"));
        next(resWrapper.response);
      }
    }
    /**
     * fallback middleWare
     * @param {ApiMeta} apiMeta api metadata
     * @param {Object} errorWrapper contains `error` data and `data` fields
     * @param {Function} next(err) call for next step
     */

  }, {
    key: "fallbackMiddleWare",
    value: function fallbackMiddleWare(apiMeta, errorWrapper, next) {
      var _this2 = this;

      var error = errorWrapper.error;
      var hookFunction = this.fallbackHook || ApiModule.fallbackHook || defaultFallbackHook();

      var defaultErrorHandler = function defaultErrorHandler() {
        if (_this2.options.console) {
          var name = apiMeta.name,
              method = apiMeta.method,
              url = apiMeta.url;
          var msg = "[ApiModule] ".concat(name, " [").concat(method.toUpperCase(), "]: [").concat(url, "] failed with ").concat(error.message);
          console.error(new Error(msg));
        }

        next(error);
      };

      if (typeof hookFunction === 'function') {
        hookFunction.call(this, apiMeta, errorWrapper, next);
      } else {
        console.warn("[ApiModule] fallbackMiddleWare: ".concat(hookFunction, " is not a valid fallbackHook function"));
        defaultErrorHandler();
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

      var metaData = target[key];

      if (Object.prototype.toString.call(metaData) !== '[object Object]') {
        throw new TypeError("Api metadata [".concat(key, "] is not an object"));
      }

      var method = metaData.method,
          url = metaData.url;

      if (!method || !url) {
        console.log("[ApiModule] Check your api metadata for [".concat(key, "]: "), metaData);
        throw new Error("[ApiModule] Api metadata [".concat(key, "]: 'method' or 'url' value not found"));
      }

      var parsedUrl = url;

      var request = function request(data) {
        var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return new Promise(function (resolve, reject) {
          // fore request task
          _this3.foreRequestMiddleWare(metaData, data, function (err) {
            if (err) {
              _this3.fallbackMiddleWare(metaData, {
                data: data,
                error: err
              }, reject);
            } else {
              var _ref3 = data || {},
                  _ref3$query = _ref3.query,
                  query = _ref3$query === void 0 ? {} : _ref3$query,
                  _ref3$params = _ref3.params,
                  params = _ref3$params === void 0 ? {} : _ref3$params,
                  _ref3$body = _ref3.body,
                  body = _ref3$body === void 0 ? {} : _ref3$body; // parse url
              // handle api like /a/:id/b/{param}


              parsedUrl = url.replace(/\B(?::(\w+)|{(\w+)})/g, function () {
                return params[(arguments.length <= 1 ? undefined : arguments[1]) || (arguments.length <= 2 ? undefined : arguments[2])];
              });
              var config = Object.assign({}, {
                method: method.toLowerCase(),
                url: parsedUrl,
                params: query,
                data: body
              }, opt);

              _this3.options.axios(config).then(function (res) {
                _this3.postRequestMiddleWare(metaData, {
                  data: data,
                  response: res
                }, resolve);
              }).catch(function (err) {
                _this3.fallbackMiddleWare(metaData, {
                  data: data,
                  error: err
                }, reject);
              });
            }
          });
        });
      };

      request.meta = metaData;
      return request;
    }
  }], [{
    key: "globalBefore",
    value: function globalBefore() {
      var foreRequestHook = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultForeRequestHook();
      ApiModule.foreRequestHook = foreRequestHook;
    }
    /**
     * Register Globally Post-Request MiddleWare Globally (For All Instance)
     * @param {Function} foreRequestHook(apiMeta, data = {}, next) 
     */

  }, {
    key: "globalPostRequestMiddleWare",
    value: function globalPostRequestMiddleWare() {
      var postRequestHook = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultPostRequestHook();
      ApiModule.postRequestHook = postRequestHook;
    }
    /**
     * Register Globally ForeRequest MiddleWare Globally (For All Instance)
     * @param {Function} fallbackHook(apiMeta, data = {}, next) 
     */

  }, {
    key: "globalFallbackMiddleWare",
    value: function globalFallbackMiddleWare() {
      var fallbackHook = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultFallbackHook();
      ApiModule.fallbackHook = fallbackHook;
    }
  }]);

  return ApiModule;
}();

_defineProperty(ApiModule, "foreRequestHook", void 0);

_defineProperty(ApiModule, "postRequestHook", void 0);

_defineProperty(ApiModule, "fallbackHook", void 0);

export { ApiModule as default };