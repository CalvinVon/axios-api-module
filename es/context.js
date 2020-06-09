import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _defineProperty from "@babel/runtime/helpers/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var Context = /*#__PURE__*/function () {
  // Private members
  function Context(apiMetadata, options) {
    _classCallCheck(this, Context);

    _defineProperty(this, "_options", void 0);

    _defineProperty(this, "_metadata", void 0);

    _defineProperty(this, "_metadataKeys", '');

    _defineProperty(this, "_data", null);

    _defineProperty(this, "_response", null);

    _defineProperty(this, "_responseError", null);

    _defineProperty(this, "_reqAxiosOpts", {});

    _defineProperty(this, "_metaAxiosOpts", {});

    this._metadata = apiMetadata;
    this._options = options;
  }
  /**
   * set request data
   * @param {any} data
   * @return {Context}
   */


  _createClass(Context, [{
    key: "setData",
    value: function setData(data) {
      this._data = data;
      return this;
    }
    /**
     * set response data
     * @param {any} response
     * @return {Context}
     */

  }, {
    key: "setResponse",
    value: function setResponse(response) {
      this._response = response;
      return this;
    }
    /**
     * set response error
     * @param {any} error
     * @return {Context}
     */

  }, {
    key: "setError",
    value: function setError(error) {
      this._responseError = error;
      return this;
    }
    /**
     * set single axios request options
     * @param {AxiosOptions} axiosOptions 
     * @private
     */

  }, {
    key: "_setRequestOptions",
    value: function _setRequestOptions(axiosOptions) {
      if (isObject(axiosOptions)) {
        this._reqAxiosOpts = axiosOptions;
      } else {
        console.error("[ApiModule] the request parameter, the parameter `".concat(axiosOptions, "` is not an object"));
      }

      return this;
    }
    /**
     * set axios options (Designed for invocation in middleware)
     * @param {*} axiosOptions 
     * @public
     */

  }, {
    key: "setAxiosOptions",
    value: function setAxiosOptions(axiosOptions) {
      if (isObject(axiosOptions)) {
        this._metaAxiosOpts = axiosOptions;
      } else {
        console.error("[ApiModule] configure axios options error, the parameter `".concat(axiosOptions, "` is not an object"));
      }
    }
  }, {
    key: "metadata",
    get: function get() {
      return _objectSpread({}, this._metadata);
    }
  }, {
    key: "metadataKeys",
    get: function get() {
      return this._metadataKeys;
    }
  }, {
    key: "method",
    get: function get() {
      return this._metadata.method;
    }
  }, {
    key: "baseURL",
    get: function get() {
      return this.axiosOptions.baseURL || '';
    }
  }, {
    key: "url",
    get: function get() {
      var url = this._metadata.url;

      var _ref = this.data || {},
          params = _ref.params;

      if (isObject(params)) {
        // handle api like /a/:id/b/{param}
        return this.baseURL + url.replace(/\B(?::(\w+)|{(\w+)})/g, function () {
          return params[(arguments.length <= 1 ? undefined : arguments[1]) || (arguments.length <= 2 ? undefined : arguments[2])];
        });
      } else {
        return this.baseURL + url;
      }
    }
  }, {
    key: "data",
    get: function get() {
      return this._data;
    }
  }, {
    key: "response",
    get: function get() {
      return this._response;
    }
  }, {
    key: "responseError",
    get: function get() {
      return this._responseError;
    }
  }, {
    key: "axiosOptions",
    get: function get() {
      // request axios options > metadata axios options
      var _reqAxiosOpts = this._reqAxiosOpts,
          _metaAxiosOpts = this._metaAxiosOpts;
      return Object.assign({}, _metaAxiosOpts, _reqAxiosOpts);
    }
  }]);

  return Context;
}();

export { Context as default };

function isObject(target) {
  return Object.prototype.toString.call(target) === '[object Object]';
}