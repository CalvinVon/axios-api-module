# axios-api-module
A business-focused modular encapsulate module based on axios.

Try this webpack project [example](https://stackblitz.com/edit/test-axios-api-module) with modular file splitting.

[![version](https://img.shields.io/npm/v/@calvin_von/axios-api-module.svg)](https://www.npmjs.com/package/@calvin_von/axios-api-module)
[![codecov](https://codecov.io/gh/CalvinVon/axios-api-module/branch/master/graph/badge.svg)](https://codecov.io/gh/CalvinVon/axios-api-module)
[![](https://img.shields.io/npm/dt/@calvin_von/axios-api-module.svg)](https://github.com/CalvinVon/axios-api-module)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/@calvin_von/axios-api-module)
[![Build Status](https://travis-ci.org/CalvinVon/axios-api-module.svg?branch=master)](https://travis-ci.org/CalvinVon/axios-api-module)
[![dependencies](https://img.shields.io/david/CalvinVon/axios-api-module.svg)](https://www.npmjs.com/package/@calvin_von/axios-api-module)

[中文文档](./README.md)
|
[English Doc](/README_EN.md)

# Table of contents
- [Getting Started](#Getting-Started)
    - [Install](#Install)
    - [Typical Usage](#Typical-Usage)
    - [Define request interface](#define-request-interface)
        - [Single Namespace](#Single-Namespace)
        - [Enable Modular Namespace](#Enable-Modular-Namespace)
    - [Send Requests](#Send-Requests)
    - [Set Middlewares](#Set-Middlewares)
        - [Middleware Definition](#Middleware-Definition)
        - [Set middlewares for each instance](#Set-middlewares-for-each-instance)
        - [Set global middlewares](#Set-global-Middlewares)
    - [Set axios interceptor](#Set-axios-Interceptor)
        - [Export axios instance](#Export-axios-Instance)
        - [Execution order](#execution-order)
        - [Set Interceptor](#Set-Interceptor)
- [Options](#Options)
    - [`baseConfig` option](#`baseConfig`-option)
    - [`module` option](#`module`-option)
- [API Reference](#API-Reference)
    - [class `ApiModule`](#class-`ApiModule`)
        - [Static Method](#Static-Method)
            - [globalBefore](#globalBefore)
            - [globalAfter](#globalAfter)
            - [globalCatch](#globalCatch)
        - [Instance Method](#Instance-Method)
            - [#useBefore](#useBefore)
            - [#useAfter](#useAfter)
            - [#useCatch](#useCatch)
            - [#getInstance](#getInstance)
            - [#getAxios](#getAxios)
            - [#generateCancellationSource](#generateCancellationSource)
    - [class `Context`](#class-`Context`)
        - [Read-only Members](#Read-only-Members)
            - [metadata](#metadata)
            - [method](#method)
            - [baseURL](#baseURL)
            - [url](#url)
            - [data](#data)
            - [response](#response)
            - [responseError](#responseError)
        - [Instance Method](#Instance-Method)
            - [setData](#setData)
            - [setResponse](#setResponse)
            - [setError](#setError)
            - [setAxiosOptions](#setAxiosOptions)
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

In addition, each converted request has a `context` parameter, which is convenient for setting various parameters of the request outside the middleware
```js
const context = Request.context;
context.setAxoisOptions({ ... });
```

---


## Set Intercepters
`ApiModule` has a middleware mechanism, designed more fine-grained unified control around the requested **before request**, **post request**, and**request failed** stages to help developers better organize code

The recommended way is to define a custom field in the *metadata* that defines the interface, and then get and perform a certain operation in the corresponding middleware.

The following is an example of adding user information parameters before making a request and preprocessing the data after the request is successful:

```js
const userId = getUserIdSomehow();
const userToken = getUserTokenSomehow();

apiModule.useBefore((context, next) => {
    const { appendUserId, /** other custom fields */ } = context.metadata;

    if (appendUserId) {
        const data = context.data || {};
        if (data.query) {
            data.query.uid = userId;
        }
        context.setData(data);
        context.setAxiosOptions({
            headers: {
                'Authorization': token
            }
        });
    }

    next();     // next must be called
});

apiModule.useAfter((context, next) => {
    const responseData = context.response;
    const { preProcessor, /** other custom fields */ } = context.metadata;
    if (preProcessor) {
        try {
            context.setResponse(preProcessor(responseData));
        } catch (e) {
            console.error(e);
        }
    }

    next();
});
```

> In fact, `ApiModule` was originally designed to avoid writing bloated code repeatedly, thereby separating business code.

> Moreover, `ApiModule` regards the interceptor provided by the axios as the "low-level" level affairs that encapsulates the browser request, also, `ApiModule` designs the middleware pattern to handle the "**business level**" affairs. In fact, you can put each interface definition is treated as a data source service (something like the "Service" concept in Angular), and you can do some operations that are not related to the page, so it is called "*a business-focused packaging module*".

### Middleware definition
- Type: `(context, next) => null`
- Parameters:

    Each middleware contains two parameters:
    - `context`
        - Type: [Context](#class-Context)
        - Description: Provides a series of methods to modify request parameters, response data, error data, and request axios options, and provides a series of request-related read-only parameters.

    - `next`
        - Type: `(error?: object | string | Error) => null`
        - Description:
            - Each middleware must call the `next` function to proceed to the next step.
            - Passing the error parameters will cause the request to fail (the browser will not send a real request and will directly cause the request to be rejected in the fore-request middleware).
            - Passing the error parameters using the [Context#setError](#setError) method behaves the same as the parameters passed in the `next` function.

### Set middlewares for each instance
Multiple `ApiModule` instances do not affect each other. **Middleware set separately by the instance will override globally set middleware**

- Set the fore-request middleware: [ApiModule#useBefore](#useBefore)
- Set the post-request middleware: [ApiModule#useAfter](#useAfter)
- Set the request failed middleware: [ApiModule#useCatch](#useCatch)


### Global middlewares
Setting the global middlewares will affect all `ApiModule` instances created later

- Set the fore-request middleware: [ApiModule.globalBefore](#globalBefore)
- Set the post-request middleware: [ApiModule.globalAfter](#globalAfter)
- Set the request failed middleware: [ApiModule.globalCatch](#globalCatch)

---

## Setting up axios interceptor
You can still set axios interceptors. Using `ApiModule` will not affect the original interceptor usage.

### Export axios instance
You can use the [ApiModule#getAxios](#getAxios) method to export the `axios` instance to set the interceptor


### Execution order

> Execution order between `axios intercepters` and `ApiModule middlewares`
> 1. fore-request middleware
> 2. axios request intercepter
> 3. axios response intercepter
> 4. post-request or fallback middleware

It can be seen that the execution of our business `axios` is more "underlying", so we recommend that **business-related** code be implemented in the middleware, and the interceptor *is only to determine whether the request is sent successfully or implements some protocol and framework related affairs*.


### Set interceptor

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
    metadatas: {
        main: {                         // namespace module
            getList: {
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

Whether enable modular namespaces. [Learn more](#define-request-interface).

  > Example in Vue.js:  
    You can create multiple instance, typically when `module` option set to `false`

  ```js
  Vue.prototype.$foregroundApi = foregroundApis;
  Vue.prototype.$backgroundApi = backgroundApis;
  ```

---

# API Reference
## class `ApiModule`
## Static Method

### globalBefore
Set the **fore-request middleware**, which is consistent with the definition of [#useBefore](#useBefore), but will be overridden by the instance method and will affect all the `ApiModule` instances

### globalAfter
Set the **post-request middleware**, which is consistent with the definition of [#useAfter](#useAfter), but will be overridden by the instance method and will affect all the `ApiModule` instances

### globalCatch
Set the **request failed middleware**, which is consistent with the definition of [#useCatch](#useCatch), but will be overridden by the instance method and will affect all the `ApiModule` instances

## Instance Method
### #useBefore
- parameters: `foreRequestHook: (context, next) => null)`. Learn more about the [Middleware Definition](#Middleware-Definition)
- description:

    The passed **fore-request middleware** will be called before every request. The available and effective `context` methods are as follows:
    - [context#setData](#setData)
    - [context#setError](#setError)
    - [context#setAxiosOptions](#setAxiosOptions)

    If the wrong parameters are set at this time, the real request will not be sent, and the request will directly enter the failure stage.

### #useAfter
- parameters: `postRequestHook: (context, next) => null)`. Learn more about the [Middleware Definition](#Middleware-Definition)
- description:

    The passed **post-request middleware** will be called after every request is successful. The available and effective `context` methods are as follows:
    - [context#setResponse](#setData)
    - [context#setError](#setError)

    If error parameters are set at this time, even if the request is successful, the request will enter the request failure stage

### #useCatch
- parameters: `fallbackHook: (context, next) => null)`. Learn more about the [Middleware Definition](#Middleware-Definition)
- description:

    The passed **request failed middleware** will be called after each request fails (or is set incorrectly). The available and effective `context` methods are as follows:
    - [context#setError](#setError)

    If an error parameter is set at this time, the original error value will be overwritten

### #getInstance
- return: `TransformedRequestMapper | { [namespace: string]: TransformedRequestMapper, $module?: ApiModule };`
- description: Get the mapped request collection object
  ```js
  const apiModule = new ApiModule({ /*...*/ });
  const apiMapper = apiModule.getInstance();

  apiMapper.xxx({ /* `query`, `body`, `params` data here */ }, { /* Axios Request Config */ });
  ```

### #getAxios
- return: `AxiosInstance`
- description: Get the axios instance that after setted
  ```js
  const apiModule = new ApiModule({ /*...*/ });
  const axios = apiModule.getAxios();

  axios.get('/other/path', { /* Axios Request Config */ });
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

---
## class `Context`

### Read-only members
### metadata
The copy of the metadata set for the current request, that is, modifying the read-only value will not affect the original metadata

### method
Request method for the current request

### baseURL
The baseURL of the current request

### url
The full request url path of the current request, a combination of `baseURL` and parsed `metadata.url`

### data
Request parameters for the current request, [see details](#Send-Requests):
- data.query?: object. `URLSearchParams` query parameter for object request
- data.params?: object. The dynamic URL parameters for the object request. Supports `/:id` and `/{id}` definitions
- data.body?: object. request body data
- Add other user-custom fields, which can be accessed in middlewares

### response
Response data for the current request

### responseError
The current request's response error data, or manually set error data, the existence of this value **does not mean that the request must be failed**

### axiosOptions
The `axios` option parameter to be used in the current request will be obtained by combining the second `opt` parameter and `context#setAxiosOptions` passed in the request

### instance method
### setData
Set the request parameters of the incoming request ([View Details](#Send-Requests)), which will overwrite the incoming data to achieve the purpose of overwriting the requested data

### setResponse
Set the requested response data, which will overwrite the original response to achieve the purpose of overwriting the successful data of the request

### setError
Set the request failure data, whether the request is successful or not, it will return failure

### setAxiosOptions
Set options for the `axios` request, but will be **merged** with the `axios` option passed in the request method, and **the priority is not higher than the parameters passed in the request method**

---

# CHANGELOG
[CHANGELOG](./CHANGELOG.md)

# LICENSE
[MIT LICENSE](./LICENSE)
