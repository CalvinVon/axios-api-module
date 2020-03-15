# axios-api-module
A business-focused modular encapsulate module based on axios.

Try this webpack project [example](https://stackblitz.com/edit/test-axios-api-module) with modular file splitting.

[![version](https://img.shields.io/npm/v/@calvin_von/axios-api-module.svg)](https://www.npmjs.com/package/@calvin_von/axios-api-module)
[![codecov](https://codecov.io/gh/CalvinVon/axios-api-module/branch/master/graph/badge.svg)](https://codecov.io/gh/CalvinVon/axios-api-module)
[![](https://img.shields.io/npm/dt/@calvin_von/axios-api-module.svg)](https://github.com/CalvinVon/axios-api-module)
[![](https://img.shields.io/github/size/CalvinVon/axios-api-module/dist/axios-api-module.min.js.svg?label=minified%20size)](https://github.com/CalvinVon/axios-api-module/blob/master/dist/axios-api-module.min.js)
[![Build Status](https://travis-ci.org/CalvinVon/axios-api-module.svg?branch=master)](https://travis-ci.org/CalvinVon/axios-api-module)
[![dependencies](https://img.shields.io/david/CalvinVon/axios-api-module.svg)](https://www.npmjs.com/package/@calvin_von/axios-api-module)

[English Doc](https://github.com/CalvinVon/axios-api-module/blob/master/README.md)
|
[中文文档](https://github.com/CalvinVon/axios-api-module/blob/master/README_CN.md)

# Table of contents
- [Getting Started](#Getting-Started)
    - [Install](#Install)
    - [Typical Usage](#Typical-Usage)
    - [Define request interface](#define-request-interface)
        - [Single Namespace](#Single-Namespace)
        - [Enable Modular Namespace](#Enable-Modular-Namespace)
    -[Set Middleware](#Set-Middleware)
        - [Middleware Definition](#Middleware-Definition)
        - [Set middleware for each instance](#Set-middleware-for-each-instance)
        - [Set global middleware](#Set-global-Middleware)
    - [Set axios interceptor](#Set-axios-Interceptor)
        - [Export axios instance](#Export-axios-Instance)
        - [Execution order](#execution-order)
        - [Set Interceptor](#Set-Interceptor)
- [Options](#Options)
    - [`baseConfig` option](#`baseConfig`-option)
    - [`module` option](#`module`-option)
- [Methods](#Methods)
    - [Static Method](#Static-Method)
        - [`globalBefore(foreRequestHook: (apiMeta, data, next) => null)`](#globalBeforeforerequesthook-apimeta-data-next--null)
        - [`globalPostRequestMiddleWare(postRequestHook: (apiMeta, resWrapper, next) => null)`](#globalpostrequestmiddlewarepostrequesthook-apimeta-resWrapper-next--null)
        - [`globalFallbackMiddleWare(fallbackHook: (apiMeta, errorWrapper, next) => null)`](#globalfallbackmiddlewarefallbackhook-apimeta-errorWrapper-next--null)
    - [Instance Method](#Instance-Method)
        - [`useBefore(foreRequestHook: (apiMeta, data, next) => null)`](#useBeforeforerequesthook-apimeta-data-next--null)
        - [`registerPostRequestMiddleWare(postRequestHook: (apiMeta, resWrapper, next) => null)`](#registerpostrequestmiddlewarepostrequesthook-apimeta-resWrapper-next--null)
        - [`registerFallbackMiddleWare(foreRequestHook: (apiMeta, errorWrapper, next) => null)`](#registerfallbackmiddlewarefallbackhook-apimeta-errorWrapper-next--null)
        - [`getInstance()`](#getInstance)
        - [`getAxios()`](#getAxios)
        - [`generateCancellationSource()`](#generateCancellationSource)
- [CHANGELOG](#CHANGELOG)
- [LICENSE](#LICENSE)

# Getting Started
### Install
You can install the library via npm.
> **Note**: the axios library is not included in the package, you need to install the axios dependency separately
```bash
npm i axios @calvin_von/axios-api-module -S
```
or via yarn:
```bash
yarn add axios @calvin_von/axios-api-module
```

or via CDN
```html
<!-- You need import axios separately. -->
<script src="https://cdn.jsdelivr.net/npm/axios@0.18.0/dist/axios.min.js"></script>

<script src="https://cdn.jsdelivr.net/npm/@calvin_von/axios-api-module/dist/axios-api-module.min.js"></script>
```
> Why? This design allows users to freely choose the appropriate axios version (please follow the [semver](https://semver.org/) version rule, and now we supports 0.x versions) [![Axios version](https://img.shields.io/npm/v/axios?label=axios)](https://www.npmjs.org/package/axios)

---

### Typical Usage

```js
// You should import axios at first
import axios from 'axios';

import ApiModule from "@calvin_von/axios-api-module";
// or CDN import
// var ApiModule = window['ApiModule'];

// create a modular namespace ApiModule instance
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
    metadatas: {
        main: {
            getList: {
                url: '/api/list/',
                method: 'get',
                // Add another custom fields
                name: 'GetMainList'
            }
        },
        user: {
            getInfo: {
                // support multiple params definitions
                // url: '/api/user/:uid/info',
                url: '/api/user/{uid}/info',
                method: 'get'
                name: 'getUserInfo',
            }
        }
    }
});


// get the converted request instance
const apiMapper = apiMod.getInstance();
apiMapper.$module === apiMod;    // true

// send request
// apiMapper is mapped by the passed metadatas option
apiMapper.main.getList({ query: { pageSize: 10, pageNum: 1 } });
apiMapper.user.getInfo({ params: { uid: 88 } });
```

---


## Define request interface
You need to organize the interface into an object (or objects from multiple namespaces) and pass it into the metadatas option.

- ### Single namespace
    When the number of interfaces is not large, or if you want to instantiate more than one, **set `module` to `false` or empty value**, `ApiModule` will adopt a single namespace
    ```js
    const apiModule = new ApiModule({
        module: false,
        metadatas: {
            requestA: { url: '/path/to/a', method: 'get' },
            requestB: { url: '/path/to/b', method: 'post' },
        }
        // other options...
    });
    ```
    Use the [`#getInstance`](#getInstance) method to get the request collection object after conversion

    ```js
    const apiMapper = apiModule.getInstance();
    apiMapper
        .requestA({ query: { a: 'b' } })
        .then(data => {...})
        .catch(error => {...})
    ```

- ### Enable Modular Namespace
    **When `module` is set to `true`**, `ApiModule` will enable multiple namespaces
    ```js
    const apiModule = new ApiModule({
        module: true,
        metadatas: {
            moduleA: {
                request: { url: '/module/a/request', method: 'get' },
            },
            moduleB: {
                request: { url: '/module/b/request', method: 'post' },
            }
        }
        // other options...
    });

    const apiMapper = apiModule.getInstance();
        apiMapper
            .moduleA
            .request({ query: { module: 'a' } })
            .then(data => {...})
            .catch(error => {...})

        apiMapper
            .moduleB
            .request({ body: { module: 'b' } })
            .then(data => {...})
            .catch(error => {...})
    ```

---


## Send Requests
To send request, you need to use the [ApiModule#getInstance](#getInstance) method to get the converted request collection object, then just like this:
```js
Request({ query: {...}, body: {...}, params: {...} }, opt?)
```

- **query**: The URL parameters to be sent with the request, must be a plain object or an URLSearchParams object. [axios params option](https://github.com/axios/axios#request-config)

- **params**: Support dynamic url params(usage likes [vue-router dynamic matching](https://router.vuejs.org/guide/essentials/dynamic-matching.html))

- **body**: The data to be sent as the request body. [axios data option](https://github.com/axios/axios#request-config)

- **opt**: More original request configs available. [Request Config](https://github.com/axios/axios#request-config)

```js
const request = apiMapper.user.getInfo;

// *configurable context parameter
console.log(request.context);

// axios origin request options
const config = { /* Axios Request Config */ };
const requestData = {
    params: {
        uid: this.uid
    },
    query: {
        ts: Date.now()
    }
};

// is equal to
axios.get(`/api/user/${this.uid}/info`, {
    query: {
        ts: Date.now()
    }
});
```

---


## Intercepter
Register axios intercepter for **only single instance**

> Execution order between `axios intercepter` and `axios-api-module middlewares`
> 1. fore-request middleware
> 2. axios request intercepter
> 3. axios response intercepter
> 4. post-request or fallback middleware

> We suggest that you'd better put *business code* in request middlewares.

```js
const axiosInstance = apiMod.getAxios();

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
    baseConfig: { /*...*/ },            // Object, axios request config
    module: true,                       // Boolean, whether modular namespace
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
## `baseConfig` option

Set base axios request config for single api module.

> More details about baseConfig, see [Axios Doc(#Request Config)](https://github.com/axios/axios#request-config)


## `module` option

Whether enable modular namespaces
- `true` (default) You can use modular namespace.
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
## Static Method
### `globalBefore(foreRequestHook: (apiMeta, data, next) => null)`

- params:
    - `apiMeta`: `apiMetas` option single meta info you passed in
    - `data`: parameters passed in api method
    - `next(error?)` call `next` function to go next step.If `error` passed in, the request would be rejected.
  
- description:

  Register fore-request middle ware function. **Affect all instances**.
  You can do every thing here, for example, validate data schema before every request.

  > The following code used a simple validate tool, [obeyman(Calvin/Obeyman)](https://github.com/CalvinVon/Obeyman), to validate data.

    ```js
    // e.g. import a simple data validator ()
    import Obeyman from 'obeyman';
    import ApiModule from "@calvin_von/axios-api-module";

    // For all instances
    ApiModule.globalBefore((apiMeta, data, next) => {
        const { name, method, url /* , or other custom fields */, schema } = apiMeta;
        
        if (schema) {
            Obeyman.validate(data, schema, (err, stack) => {
                if (err) {
                    console.warn(`Api [${name}] validate failed\n`, stack);
                }
            });
        }

        // `next` function must be called
        next();
    });


    const backendApi = new ApiModule({ /*...*/ });
    // Just for `backendApi`
    backendApi.useBefore((apiMeta, data, next) => {
        console.log(apiMeta)
        console.log(data)
        next();
    });
    ```

### `globalPostRequestMiddleWare(postRequestHook: (apiMeta, resWrapper, next) => null)`

- params:
    - `apiMeta`: `apiMetas` option single meta info you passed in.
    - `resWrapper`: an object includes `response` and `data` fields.
        - `response`: response data from server.
        - `data`: origin data passed in.
    - `next(res)` call `next` function to go next step. A `res` parameter should be passed in.
  
- description:

  Register post-request middle ware function. **Affect all instances**.
  > You can do something like a pre-process for data.

    ```js
    // user.api.js
    export default {
        list: {
            name: 'user list',
            method: 'get',
            preProcessor(users) {
                return users.map(user => {
                    user.age++;
                    return user;
                });
            }
        }
    }
    ```

    ```js
    import ApiModule from "@calvin_von/axios-api-module";

    ApiModule.globalPostRequestMiddleWare((apiMeta, { data, response }, next) => {
        const { preProcessor } = apiMeta;
        
        if (preProcessor) {
            next(preProcessor(response));
        }
        else {
            next(response);
        }
    });
    ```

### `globalFallbackMiddleWare(fallbackHook: (apiMeta, errorWrapper, next) => null)`
  
  > NOTE: If there's no fallback middleware registered, a **default error handler** will be replaced with.

- params:
    - `apiMeta`: `apiMetas` option single meta info you passed in
    - `errorWrapper`
        - `data`: origin data passed in.
        - `error`: `Error` instance.
    - `next(error)` call `next` function to go next step

- description:

    Register fallback middle ware function.Called when error occurred. **Affect all instances**

    ```js
    import ApiModule from "@calvin_von/axios-api-module";

    // For all instances
    ApiModule.globalFallbackMiddleWare((apiMeta, { error }, next) => {
        // an error must be passed in, or request would be seen as successful
        next(error);
    });


    const backendApi = new ApiModule({ /*...*/ });
    // Just for `backendApi`
    backendApi.registerFallbackMiddleWare((apiMeta, { data, error }, next) => {
        console.log(apiMeta)
        console.log(data)
        console.log(error)
        // pass in custom error
        next(new Error('Anther error'));
    });
    ```

## Instance Method
### `useBefore(foreRequestHook: (apiMeta, data, next) => null)`
- description: Same as static method.But **only affect single instance**.

### `registerPostRequestMiddleWare(postRequestHook: (apiMeta, resWrapper, next) => null)`
- description: Same as static method.But **only affect single instance**.

### `registerFallbackMiddleWare(fallbackHook: (apiMeta, errorWrapper, next) => null)`
- description: Same as static method.But **only affect single instance**.

### `getInstance()`
- return: `TransformedApiMap | { [namespace: string]: TransformedApiMap, $module?: ApiModule };`
- description: Get transformed api map object.
  ```js
  const apiModule = new ApiModule({ /*...*/ });
  const api = apiModule.getInstance();

  // Send a request
  api.xxx({ /* `query`, `body`, `params` data here */ }, { /* Axios Request Config */ });
  ```

### `getAxios()`
- return: `AxiosInstance`
- description: Get axios instance.
  ```js
  const apiModule = new ApiModule({ /*...*/ });
  const axios = apiModule.getAxios();
  ```

### `generateCancellationSource()`
- return: `CancelTokenSource`
- description: Generate axios `Cancellation` source.

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
# CHANGELOG
[CHANGELOG](./CHANGELOG.md)

# LICENSE
[MIT LICENSE](./LICENSE)
