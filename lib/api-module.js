"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _axios = _interopRequireDefault(require("axios"));

/**
 * Api Module class
 * 
 * @member {Object} options
 * @member {Function} foreRequestHook
 * @member {Function} fallbackHook
 * 
 * @method registeForeRequestMiddleWare(hook)
 * @method registeFallbackMiddleWare(hook)
 * @method getAxios()
 * @method getInstance(hook)
 */
var ApiModule =
/*#__PURE__*/
function () {
  function ApiModule() {
    var _this = this;

    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck2.default)(this, ApiModule);
    (0, _defineProperty2.default)(this, "options", {});
    (0, _defineProperty2.default)(this, "foreRequestHook", function (_, __, next) {
      return next();
    });
    (0, _defineProperty2.default)(this, "fallbackHook", function (_, err, next) {
      return next(err);
    });
    var _config$apiMetas = config.apiMetas,
        apiMetas = _config$apiMetas === void 0 ? {} : _config$apiMetas;
    var API_ = {};
    Object.keys(apiMetas).forEach(function (apiName) {
      API_[apiName] = _this._Proxyable(apiMetas[apiName]);
    });
    this.options = {
      axios: _axios.default,
      apiMetas: apiMetas,
      apis: API_
    };
  }
  /**
   * Registe ForeRequest MiddleWare
   * @param {Function} foreRequestHook(apiMeta, data = {}, next)
   */


  (0, _createClass2.default)(ApiModule, [{
    key: "registeForeRequestMiddleWare",
    value: function registeForeRequestMiddleWare() {
      var foreRequestHook = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Function();
      this.foreRequestHook = foreRequestHook;
    }
    /**
     * Registe Fallback MiddleWare
     * @param {Function} fallbackHook(apiMeta, data = {}, next)
     */

  }, {
    key: "registeFallbackMiddleWare",
    value: function registeFallbackMiddleWare() {
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

      if (typeof this.foreRequestHook === 'function') {
        this.foreRequestHook(apiMeta, data, next);
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
      if (typeof this.fallbackHook === 'function') {
        this.fallbackHook(apiMeta, error, next);
      } else {
        next(error);
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
      var _this2 = this;

      if (!target[key]) throw new ReferenceError('API ' + key + ' not exist');
      var _target$key = target[key],
          method = _target$key.method,
          url = _target$key.url;
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

          _this2.foreRequestMiddleWare(target[key], data, function (err) {
            if (err) {
              _this2.fallbackMiddleWare(target[key], err, reject);
            } else {
              var config = Object.assign({
                method: method.toLowerCase(),
                url: parsedUrl,
                params: query,
                data: body
              }, opt);
              (0, _axios.default)(config).then(function (data) {
                return resolve(data);
              }).catch(function (err) {
                _this2.fallbackMiddleWare(target[key], err, reject);
              });
            }
          });
        });
      };
    }
  }]);
  return ApiModule;
}();

exports.default = ApiModule;