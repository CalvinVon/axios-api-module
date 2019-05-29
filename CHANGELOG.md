# v1.4.0 [(2019-5-29)](https://github.com/CalvinVon/axios-api-module/compare/v1.3.2release...v1.4.0)

### BREAKING CHANGES
- **ApiModule#`globalForeRequestMiddleWare`:** method name changed from `registerForeRequestMiddleWare`
- **ApiModule#`globalFallbackMiddleWare`:** method name changed from `registerFallbackMiddleWare`
- **registerFallbackMiddleWare(fallbackHook):** change the second parameters to a object which contains `error` and `data` fields.
- **`axios` dependence:** you need to install `axios` dependence by `npm i axios -S` additional

### Bug fixes
- **`getAxios`:** now return an axios instance by `axios.create(config)`

### Features
- adding unit test and coverage test.
- better error tips when you pass invalid values to `apiMetas`.

## v1.3.2 [(2019-4-2)](https://github.com/CalvinVon/axios-api-module/compare/v1.3.0...v1.3.2release)
### Bug fixes
- fix default error handler still invoked when `fallbackMiddle` registered.

# v1.3.0 [(2019-3-19)](https://github.com/CalvinVon/axios-api-module/compare/v1.2.0...v1.3.0)
### Features
- **`baseConfig`:** add baseConfig for creating axios by default configuration.