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
    baseConfig: {
        baseURL: 'http://api.yourdomain.com',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        withCredentials: true,
        timeout: 60000
    },
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
const axiosInstance = apiMod.getAxios();

apis.$module === apiMod;    // true

// request
const config = { /* Axios Request Config */ };

apis.user.getInfo({
    params: {
        uid: this.uid
    },
    query: {
        ts: Date.now()
    }
}, config);

...
```

### Intercepter
Register axios intercepter for **only single instance**

```js
axiosInstance.interceptors.request.use(
    function (config) {
        return config;
    }, 
    function (error) {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    function (response) {
        if (response.data.status === 200) {
            return response.data;
        }
        return Promise.reject(new Error(response.msg));
    },
    function (error) {
        return Promise.reject(error);
    }
);
```

# Options
```js
const apiMod = new ApiModule({
    module: true,                       // Boolean, whether moduled namespace
    console: true,                      // Boolean, switch log on off
    apiMetas: {
        main: {                         // namespace module
            getList: {
                name: 'get list',       // request name
                method: 'get',          // request method "get" | "post" | "patch" | "delete" | "put" | "head"
                url: '/api/user/list'
            }
        }
    }
});
```
---
`module` option

Whether enable modular namespaces
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
  const api = apiMod.getInstance();
  api.main.getList({ query: { sort: -1 } });
  ```
- `false` single namespace

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
  const api = apiMod.getInstance();
  api.getList({ query: { sort: -1 } });
  ```

  > Example in Vue.js:  
    You can create multiple instance, typically when `module` option set to `false`

  ```js
  Vue.prototype.$foregroundApi = foregroundApis;
  Vue.prototype.$backgroundApi = backgroundApis;
  ```

# Methods
### Static Method
- `registerForeRequestMiddleWare(foreRequestHook: (apiMeta, data, next) => null)`

  params:
    - `apiMeta`: `apiMetas` option single meta info you passed in
    - `data`: parameters passed in api method
    - `next(error?)` call `next` function to go next step.If `error` passed in, the request would be rejected.
  
  Register fore-request middle ware function. **Affect all instances**.
  You can do every thing here, for example, validate data schema before every request.

  > The following code used a simple validate tool, [obeyman(Calvin/Obeyman)](https://github.com/CalvinVon/Obeyman), to validate data.

    ```js
    // e.g. import a simple data validator ()
    import Obeyman from 'obeyman';
    import ApiModule from "@calvin_von/axios-api-module";

    // For all instances
    ApiModule.registerForeRequestMiddleWare((apiMeta, data, next) => {
        const { name, method, url /* , or other custom fields */ } = apiMeta;
        console.log(apiMeta.url);

        // `next` function must be called
        next();
    });


    const backendApi = new ApiModule({ /*...*/ });
    // Just for `backendApi`
    backendApi.registerForeRequestMiddleWare((apiMeta, data, next) => {
        console.log(apiMeta)
        console.log(data)
        next();
    });
    ```

- `registerFallbackMiddleWare(fallbackHook: (apiMeta, error, next) => null)`
  
  Register fallback middle ware function.Called when error occurred. **Affect all instances**

  params:
    - `apiMeta`: `apiMetas` option single meta info you passed in
    - `error`: error object
    - `next(error)` call `next` function to go next step

### Instance Method
- `registerForeRequestMiddleWare(foreRequestHook: (apiMeta, data, next) => null)`

  Same as static method.But **only affect single instance**.

- `registerFallbackMiddleWare(fallbackHook: (apiMeta, error, next) => null)`

  Same as static method.But **only affect single instance**.

- `getInstance(): TransformedApiMap | { [namespace: string]: TransformedApiMap, $module?: ApiModule };`
  Get transformed api map object.
  ```js
  const apiModule = new ApiModule({ /*...*/ });
  const api = apiModule.getInstance();

  // Send a request
  api.xxx({ /* `query`, `body`, `params` data here */ }, { /* Axios Request Config */ });
  ```

- `generateCancellationSource(): CancelTokenSource`
  
  Generate axios `Cancellation` source.

  You can use axios `cancellation`, ([docs about axios#cancellation](https://github.com/axios/axios#cancellation))
  ```js
  import axios from 'axios';

  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  ...
  ```

  or just use `#generateCancellationSource()`
  ```js
    ...
    
    const api = apiMod.getInstance();
    const cancelSourceA = api.$module.generateCancellationSource();
    const cancelSourceB = api.$module.generateCancellationSource();

    // send a request
    const requestA = api.test({
        query: {
            a: 123
        },
    }, {
        cancelToken: cancelSourceA.token
    });

    const requestB = api.test({
        query: {
            b: 321
        },
    }, {
        cancelToken: cancelSourceB.token
    });

    cancelSourceA.cancel('Canceled by the user');

    // requestA would be rejected by reason `Canceled by the user`
    // requestB ok!
  ```

# LICENSE
[MIT LICENSE](./LICENSE)
