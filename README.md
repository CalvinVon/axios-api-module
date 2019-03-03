# axios-api-module
Encapsulated api module based on axios.

[![version](https://img.shields.io/npm/v/@calvin_von/axios-api-module.svg)](https://github.com/CalvinVon/axios-api-module)
[![](https://img.shields.io/npm/dt/@calvin_von/axios-api-module.svg)](https://github.com/CalvinVon/axios-api-module)
[![](https://img.shields.io/github/size/CalvinVon/axios-api-module/dist/axios-api-module.min.js.svg?label=minified%20size)](https://github.com/CalvinVon/axios-api-module/blob/master/dist/axios-api-module.min.js)
[![](https://data.jsdelivr.com/v1/package/npm/@calvin_von/axios-api-module/badge)](https://www.jsdelivr.com/package/npm/@calvin_von/axios-api-module)
![dependencies](https://img.shields.io/david/CalvinVon/axios-api-module.svg)

# Getting Started
### Install
You can install the library via npm.
```bash
npm i @calvin_von/axios-api-module -S
```
or via yarn:
```bash
yarn add @calvin_von/axios-api-module
```

or via CDN
```html
<!-- You need import axios separately. -->
<script src="https://cdn.jsdelivr.net/npm/axios@0.18.0/dist/axios.min.js"></script>

<!-- then import apiModule -->
<script src="https://cdn.jsdelivr.net/npm/@calvin_von/axios-api-module/dist/axios-api-module.min.js"></script>

```
### Typical Usage
```js
// You can import axios to set the interceptor
// NOTE: axios is already a part of the dependency, you don't need to install again.
import axios from 'axios';

import ApiModule from "@calvin_von/axios-api-module";
// or CDN import
// var ApiModule = window['ApiModule'];

// create a moduled namespace ApiModule instance
const apiMod = new ApiModule({
    module: true,
    apiMetas: {
        main: {
            getList: {
                name: 'GetMainList',
                url: '/api/list/',
                method: 'get'
            }
        },
        user: {
            getInfo: {
                name: 'getUserInfo',
                // support multiple params definitions
                // url: '/api/user/:uid/info',
                url: '/api/user/{uid}/info',
                method: 'get'
            }
        }
    }
});

// get transformed api map instance
const apis = apiMod.getInstance();

// Example: Mount to Vue prototype
// NOTE: You can create multiple instance, typically when `module` option set to `false`
Vue.prototype.$api = apis;
// Vue.prototype.$foregroundApi = foregroundApis;

// use
this.$api.user.getInfo({
    params: {
        uid: this.uid
    },
    query: {
        ts: Date.now()
    }
})
...
apis.$module === apiMod;    // true
```
# Options
```js
const apiMod = new ApiModule({
    module: true,           // Boolean, whether moduled namespace
    console: true,          // Boolean, switch log on off
    apiMetas: {
        main: {             // namespace module
            getList: {
                name: 'get list',   // request name
                method: 'get',      // request method "get" | "post" | "patch" | "delete" | "put" | "head"
                url: '/api/user/list'
            }
        }
    }
});
```
---
`module` option

Whether enable moduled namespace
- `true` (default) You can use moduled namespace.
  ```js
  const apiMod = new ApiModule({
    module: true,
    apiMetas: {
        main: {
            getList: {
                name: 'GetMainList',
                url: '/api/list/',
                method: 'get'
            }
        },
    }
  });

  // use
  apiMod.getInstance().main.getList({ query: { sort: -1 } });
  ```
- `false` single namespace.
  ```js
  const apiMod = new ApiModule({
    module: false,
    apiMetas: {
        getList: {
            name: 'GetMainList',
            url: '/api/list/',
            method: 'get'
        }
    }
  });

  // use
  apiMod.getInstance().getList({ query: { sort: -1 } });
  ```

# Methods
### Static Method
- `registerForeRequestMiddleWare(foreRequestHook: (apiMeta, data, next) => null)`
  
  Register fore-request middle ware function.**Affect all instance**

  params:
    - `apiMeta`: `apiMetas` option single meta info you passed in
    - `data`: parameters passed in api method
    - `next(error?)` call `next` function to go next step.If `error` passed in,

- `registerFallbackMiddleWare(fallbackHook: (apiMeta, error, next) => null)`
  
  Register fallback middle ware function.Called when error occurred.**Affect all instance**

  params:
    - `apiMeta`: `apiMetas` option single meta info you passed in
    - `error`: error object
    - `next(error)` call `next` function to go next step

### Instance Method
- `registerForeRequestMiddleWare(foreRequestHook: (apiMeta, data, next) => null)`

  Same as static method.But **only affect single instance**.

- `registerFallbackMiddleWare(fallbackHook: (apiMeta, error, next) => null)`

  Same as static method.But **only affect single instance**.

# LICENSE
[MIT LICENSE](./LICENSE)
