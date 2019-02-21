(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./api-module"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./api-module"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.apiModule);
    global.index = mod.exports;
  }
})(this, function (_exports, _apiModule) {
  "use strict";

  var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _apiModule = _interopRequireDefault(_apiModule);
  var _default = _apiModule.default;
  _exports.default = _default;
});