# axios-api-module
一个专注于业务并基于 axios 的模块化封装模块。

尝试一下带有模块化文件分割的 webpack 工程化[例子](https://stackblitz.com/edit/test-axios-api-module)

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
- [快速上手](#快速上手)
    - [安装](#安装)
    - [典型用法](#典型用法)
    - [发送请求](#发送请求)
    - [设置中间件](#设置中间件)
        - [为每一个实例设置中间件](#为每一个实例设置中间件)
        - [全局中间件](#全局中间件)
    - [设置 axios 拦截器](#设置-axios-拦截器)
        - [导出 axios 实例](#导出-axios-实例)
        - [设置拦截器](#设置拦截器)
- [选项](#选项)
    - [baseConfig 选项](#baseConfig-选项)
    - [module 选项](#module-选项)
- [API 手册](#API-手册)
    - [类 `ApiModule`](#类-`ApiModule`)
        - [静态方法](#静态方法)
            - [globalBefore](#globalBefore)
            - [globalAfter](#globalAfter)
            - [globalCatch](#globalCatch)
        - [实例方法](#实例方法)
            - [#useBefore](#useBefore)
            - [#useAfter](#useAfter)
            - [#useCatch](#useCatch)
            - [#getInstance](#getInstance)
            - [#getAxios](#getAxios)
            - [generateCancellationSource](#generateCancellationSource)
    - [类 `Context`](#类-`Context`)
        - [只读成员](只读成员)
            - [metadata](metadata)
            - [method](method)
            - [url](url)
            - [parsedUrl](parsedUrl)
            - [data](data)
            - [response](response)
            - [responseError](responseError)
        - [实例方法](实例方法)
            - [setData](#setData)
            - [setResponse](#setResponse)
            - [setError](#setError)
            - [setAxiosOptions](#setAxiosOptions)
- [版本变更记录](#版本变更记录)
- [许可证](#许可证)

# 快速上手
### 安装
使用 npm 安装
> 需要注意：axios 库不包含其中，你需要单独安装 axios 依赖。

> 为什么？这样设计便可使用户自由选择适合的 axios 版本（请遵循 [semver](https://semver.org/) 版本规则，现在支持 0.x 版本） [![axios version](https://img.shields.io/npm/v/axios?label=axios)](https://www.npmjs.org/package/axios)
```bash
npm i axios @calvin_von/axios-api-module -S
```
or via yarn:
```bash
yarn add axios @calvin_von/axios-api-module
```

or via CDN
```html
<!-- 单独引入 axios -->
<script src="https://cdn.jsdelivr.net/npm/axios@0.19.2/dist/axios.min.js"></script>

<script src="https://cdn.jsdelivr.net/npm/@calvin_von/axios-api-module/dist/axios-api-module.min.js"></script>

```
### 典型用法

```js
import ApiModule from "@calvin_von/axios-api-module";
// 或者 CDN 导入
// var ApiModule = window['ApiModule'];

// 当前创建一个模块化命名空间的实例
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
                name: 'GetMainList' // 添加其他自定义字段
            }
        },
        user: {
            getInfo: {
                method: 'get'
                // 支持多种路径参数定义方式
                url: '/api/user/{uid}/info'
                // url: '/api/user/:uid/info'
            }
        }
    }
});

// 拿到转换之后的请求实例
const apiMapper = apiMod.getInstance();
apiMapper.$module === apiMod;    // true

// 发送请求
// 请求由传入的 metadatas 选项映射
apiMapper.main.getList({ query: { pageSize: 10, pageNum: 1 } });
apiMapper.user.getInfo({ params: { uid: 88 } });
```

### 发送请求
你需要这样像这样发送请求: **Request({ query: {...}, body: {...}, params: {...} }, opt?)**

- **query**: The URL parameters to be sent with the request, must be a plain object or an URLSearchParams object. [axios params 选项](https://github.com/axios/axios#request-config)

- **params**: Support dynamic url params(usage likes [vue-router dynamic matching](https://router.vuejs.org/guide/essentials/dynamic-matching.html))

- **body**: The data to be sent as the request body. [axios data 选项](https://github.com/axios/axios#request-config)

- **opt**: More original request configs available. [Request Config](https://github.com/axios/axios#request-config)

```js
// axios origin request options
const config = { /* Axios Request Config */ };
const request = apis.user.getInfo;

// get metadata
console.log(request.meta);

// send request
request(
    {
        params: {
            uid: this.uid
        },
        query: {
            ts: Date.now()
        }
    },
    config
).then(function() {

})
.catch(function(err) {

})

// is equal to
axios.get(`/api/user/${this.uid}/info`, {
    query: {
        ts: Date.now()
    }
});
```
### 设置 axios 拦截器
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

# 选项
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
## baseConfig 选项

Set base axios request config for single api module.

> More details about baseConfig, see [Axios Doc(#Request Config)](https://github.com/axios/axios#request-config)


## module 选项

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
    You can create multiple instance, typically when module 选项 set to `false`

  ```js
  Vue.prototype.$foregroundApi = foregroundApis;
  Vue.prototype.$backgroundApi = backgroundApis;
  ```

# API
## 静态方法
### globalBefore

- params:
    - `apiMeta`: `apiMetas` 选项 single meta info you passed in
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
    ApiModule.globalBefore((context, next) => {
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
    backendApi.useBefore((context, next) => {
        console.log(apiMeta)
        console.log(data)
        next();
    });
    ```

### globalAfter

- params:
    - `apiMeta`: `apiMetas` 选项 single meta info you passed in.
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

    ApiModule.globalAfter((apiMeta, { data, response }, next) => {
        const { preProcessor } = apiMeta;
        
        if (preProcessor) {
            next(preProcessor(response));
        }
        else {
            next(response);
        }
    });
    ```

### globalCatch
  
  > NOTE: If there's no fallback middleware registered, a **default error handler** will be replaced with.

- params:
    - `apiMeta`: `apiMetas` 选项 single meta info you passed in
    - `errorWrapper`
        - `data`: origin data passed in.
        - `error`: `Error` instance.
    - `next(error)` call `next` function to go next step

- description:

    Register fallback middle ware function.Called when error occurred. **Affect all instances**

    ```js
    import ApiModule from "@calvin_von/axios-api-module";

    // For all instances
    ApiModule.globalCatch((apiMeta, { error }, next) => {
        // an error must be passed in, or request would be seen as successful
        next(error);
    });


    const backendApi = new ApiModule({ /*...*/ });
    // Just for `backendApi`
    backendApi.useCatch((apiMeta, { data, error }, next) => {
        console.log(apiMeta)
        console.log(data)
        console.log(error)
        // pass in custom error
        next(new Error('Anther error'));
    });
    ```

## 实例方法
### #useBefore
- description: Same as static method.But **only affect single instance**.

### #useAfter
- description: Same as static method.But **only affect single instance**.

### `useCatch(fallbackHook: (context, next) => null)`
- description: Same as static method.But **only affect single instance**.

### #getInstance
- return: `TransformedApiMap | { [namespace: string]: TransformedApiMap, $module?: ApiModule };`
- description: Get transformed api map object.
  ```js
  const apiModule = new ApiModule({ /*...*/ });
  const api = apiModule.getInstance();

  // Send a request
  api.xxx({ /* `query`, `body`, `params` data here */ }, { /* Axios Request Config */ });
  ```

### #getAxios
- return: `AxiosInstance`
- description: Get axios instance.
  ```js
  const apiModule = new ApiModule({ /*...*/ });
  const axios = apiModule.getAxios();
  ```

### generateCancellationSource
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
# 版本变更记录
[版本变更记录](./CHANGELOG.md)

# 许可证
[MIT 许可证](./LICENSE)
