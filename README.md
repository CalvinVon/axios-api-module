# axios-api-module
一个专注于业务并基于 [axios](https://github.com/axios/axios) 的模块化封装模块。

尝试一下带有模块化文件分割的 webpack 工程化[例子](https://stackblitz.com/edit/test-axios-api-module)

[![version](https://img.shields.io/npm/v/@calvin_von/axios-api-module.svg)](https://www.npmjs.com/package/@calvin_von/axios-api-module)
[![codecov](https://codecov.io/gh/CalvinVon/axios-api-module/branch/master/graph/badge.svg)](https://codecov.io/gh/CalvinVon/axios-api-module)
[![](https://img.shields.io/npm/dt/@calvin_von/axios-api-module.svg)](https://github.com/CalvinVon/axios-api-module)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/@calvin_von/axios-api-module)
[![Build Status](https://travis-ci.org/CalvinVon/axios-api-module.svg?branch=master)](https://travis-ci.org/CalvinVon/axios-api-module)
[![dependencies](https://img.shields.io/david/CalvinVon/axios-api-module.svg)](https://www.npmjs.com/package/@calvin_von/axios-api-module)

[中文文档](./README.md)
|
[English Doc](/README_EN.md)

# 目录
- [快速上手](#快速上手)
    - [安装](#安装)
    - [典型用法](#典型用法)
    - [定义请求接口](#定义请求接口)
        - [单个命名空间](#单个命名空间)
        - [启用模块化命名空间](#启用模块化命名空间)
    - [发送请求](#发送请求)
    - [设置中间件](#设置中间件)
        - [中间件定义](#中间件定义)
        - [为每一个实例设置中间件](#为每一个实例设置中间件)
        - [全局中间件](#全局中间件)
    - [设置 axios 拦截器](#设置-axios-拦截器)
        - [导出 axios 实例](#导出-axios-实例)
        - [执行顺序](#执行顺序)
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
            - [#generateCancellationSource](#generateCancellationSource)
    - [类 `Context`](#类-`Context`)
        - [只读成员](#只读成员)
            - [metadata](#metadata)
            - [method](#method)
            - [baseURL](#baseURL)
            - [url](#url)
            - [data](#data)
            - [response](#response)
            - [responseError](#responseError)
        - [实例方法](#实例方法)
            - [setData](#setData)
            - [setResponse](#setResponse)
            - [setError](#setError)
            - [setAxiosOptions](#setAxiosOptions)
- [版本变更记录](#版本变更记录)
- [许可证](#许可证)

# 快速上手
## 安装
使用 npm 安装
> **注意**：axios 库并不会包含在发布包中，你需要单独安装 axios 依赖

```bash
npm i axios @calvin_von/axios-api-module -S
```
或者使用 yarn 安装:
```bash
yarn add axios @calvin_von/axios-api-module
```

或者直接 CDN 方式引入：
```html
<!-- 单独引入 axios -->
<script src="https://cdn.jsdelivr.net/npm/axios@0.19.2/dist/axios.min.js"></script>

<script src="https://cdn.jsdelivr.net/npm/@calvin_von/axios-api-module/dist/axios-api-module.min.js"></script>
```

> 为什么？这样设计便可使用户自由选择适合的 axios 版本（请遵循 [semver](https://semver.org/) 版本规则，现在支持 0.x 版本） [![axios version](https://img.shields.io/npm/v/axios?label=axios)](https://www.npmjs.org/package/axios)

---

## 典型用法

```js
import ApiModule from "@calvin_von/axios-api-module";
// 或者 CDN 导入
// var ApiModule = window['ApiModule'];

// 创建一个模块化命名空间的实例
const apiMod = new ApiModule({
    baseConfig: {
        baseURL: 'http://api.yourdomain.com',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8'
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
                // 添加其他自定义字段
                name: 'GetMainList'
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
// apiMapper 由传入的 metadatas 选项映射
apiMapper.main.getList({ query: { pageSize: 10, pageNum: 1 } });
apiMapper.user.getInfo({ params: { uid: 88 } });
```

---

## 定义请求接口
你需要将接口组织成一个对象（或者由多个命名空间的对象）传入 `metadatas` 选项中

- ### 单个命名空间
    当接口数目不多，或者希望实例化多个时，**将 `module` 设置成 `false` 或空值**，`ApiModule` 会采用单个命名空间
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
    使用 [`#getInstance`](#getInstance) 方法来获得转换之后的请求集合对象
    ```js
    const apiMapper = apiModule.getInstance();
    apiMapper
        .requestA({ query: { a: 'b' } })
        .then(data => {...})
        .catch(error => {...})
    ```

- ### 启用模块化命名空间
    **将 `module` 设置为 `true` 时**， `ApiModule` 会启用多个命名空间
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

## 发送请求
使用 [ApiModule#getInstance](#getInstance) 方法来获得转换之后的请求集合对象，然后你需要像这样来发送一个请求: 
```js
Request({ query: {...}, body: {...}, params: {...} }, opt?)
```

- **query**:
    与请求一起发送的 URL 参数。必须是一个普通对象或 `URLSearchParams` 对象。在 axios 上 [查看  params 选项](https://github.com/axios/axios#request-config)

- **params**:
    支持动态 URL 参数 (用法类似于 vue-router 的 [动态匹配](https://router.vuejs.org/guide/essentials/dynamic-matching.html))

- **body**:
    要作为请求体正文发送的数据。在 axios 上 [查看 data 选项](https://github.com/axios/axios#request-config)

- **opt**:
    提供更多 axios 原始请求配置。在 axios 上 [查看 Request Config](https://github.com/axios/axios#request-config)

```js
const request = apiMapper.user.getInfo;

// *可以配置 context 参数
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

// 发送请求
request(requestData, config)
    .then(data => {...})
    .catch(error => {...})

// 与下列直接使用 axios 的代码执行效果一致
axios.get(`/api/user/${this.uid}/info`, {
    query: {
        ts: Date.now()
    }
});
```

额外的，每一个转换过后的请求上带有一个 `context` 参数，方便在中间件外设置请求的各种参数
```js
const context = Request.context;
context.setAxoisOptions({ ... });
```

---

## 设置中间件
`ApiModule` 拥有中间件机制，围绕请求的**请求前**、**请求后**和**请求失败**阶段设计了更细粒度的统一控制，以帮助开发者更好地组织代码

推荐的方式是，在定义接口的 *metadata* 中定义自定义字段，然后在对应的中间件内获取并执行一定操作。

下面是一个在发起请求前添加用户信息参数并在请求成功后预处理数据的例子：
```js
const userId = getUserIdSomehow();
const userToken = getUserTokenSomehow();

apiModule.useBefore((context, next) => {
    const { appendUserId, /** 其他自定义字段 */ } = context.metadata;

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

    next();     // next 函数必须要被调用
});

apiModule.useAfter((context, next) => {
    const responseData = context.response;
    const { preProcessor, /** 其他自定义字段 */ } = context.metadata;
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


> 事实上，`ApiModule` 的设计初衷，是避免编写重复臃肿的代码，从而分离出业务代码。

> 而且 `ApiModule` 将 `axios` 提供的**拦截器**视为封装浏览器请求的“底层”层面事务，抽离出中间件模式来处理**业务层面**的事务，你可以把每一个接口定义当做是数据源服务（就像是 Angular 里面的“Service”概念），你可以做一些与页面无关的操作，故称之为“*一个专注于业务的封装模块*”。


### 中间件定义
- 类型： `(context, next) => null`
- 参数：

    每个中间件均包含两个参数：
    - `context`

        - 类型：[Context](#类-`Context`) 
        - 描述：提供一系列方法来修改包括请求的参数、响应的数据、错误数据以及请求的 axios 选项，并提供一系列请求相关的只读参数。

    - `next`
        - 类型：`(error?: object|string|Error) => null`
        - 描述：
            - 每个中间件必须调用 `next` 函数来进入到下一步。
            - 传入错误参数将导致请求失败（在前置中间件将不会发送真实请求且直接导致请求 `rejected`）。
            - 使用 [Context#setError](#setError) 方法传入错误参数和在 `next` 函数传入的参数行为一致。


### 为每一个实例设置中间件
多个 `ApiModule` 实例之间不互相影响，**实例单独设置的中间件会覆盖全局设置的中间件**

- 设置请求前置中间件：[ApiModule#useBefore](#useBefore)
- 设置请求后置中间件：[ApiModule#useAfter](#useAfter)
- 设置请求失败中间件：[ApiModule#useCatch](#useCatch)


### 全局中间件
设置全局中间件，将会**影响之后所有**创建的 `ApiModule` 实例

- 设置请求前置中间件：[ApiModule.globalBefore](#globalBefore)
- 设置请求后置中间件：[ApiModule.globalAfter](#globalAfter)
- 设置请求失败中间件：[ApiModule.globalCatch](#globalCatch)


---

## 设置 axios 拦截器
你仍然可以设置 axios 的拦截器，使用 `ApiModule` 并不会影响到原来的拦截器用法

### 导出 axios 实例
你可以使用 [ApiModule#getAxios](#getAxios) 方法导出 axios 实例来设置拦截器


### 执行顺序
> 理清 `axios 拦截器` 和 `ApiModule 中间件` 之间的执行顺序
> 1. 请求前置中间件
> 2. axios 请求拦截器
> 3. axios 响应拦截器
> 4. 请求后置或者失败中间件

可以看出，对于我们的业务 `axios` 的执行更加的“底层”一些，所以我们建议**业务相关**的代码放在中间件中实现，而拦截器*仅仅来判断请求发送成功与否或者实现一些协议、框架相关的事务*。


### 设置拦截器
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
    baseConfig: { /*...*/ },            // Object, axios 请求的选项参数
    module: true,                       // Boolean, 是否启用模块化命名空间
    console: true,                      // Boolean, 是否启用请求失败日志
    metadatas: {
        main: {                         // 命名空间
            getList: {
                method: 'get',          // 请求方式 "get" | "post" | "patch" | "delete" | "put" | "head"
                url: '/api/user/list'   // 请求路径
            }
        }
    }
});
```
---

## baseConfig 选项

设置 axios 的请求选项参数。查看 [Axios 文档 (#Request Config)](https://github.com/axios/axios#request-config)


## module 选项

是否启用命名空间，[了解更多](#定义请求接口)。

  > 在使用 Vue.js 的一个例子：
    你可以创建多个 `ApiModule` 的实例， 尤其是当 `module` 选项置为 `false` 值时

  ```js
  Vue.prototype.$foregroundApi = foregroundApis;
  Vue.prototype.$backgroundApi = backgroundApis;
  ```

# API 手册
## 类 `ApiModule`
### 静态方法
### globalBefore
设置请求前置中间件，和 [#useBefore](#useBefore) 定义一致，但会被实例方法覆盖，且会影响生成的全部 `ApiModule` 实例

### globalAfter
设置请求后置中间件，和 [#useAfter](#useAfter) 定义一致，但会被实例方法覆盖，且会影响生成的全部 `ApiModule` 实例

### globalCatch
设置请求失败中间件，和 [#useCatch](#useCatch) 定义一致，但会被实例方法覆盖，且会影响生成的全部 `ApiModule` 实例

## 实例方法
### #useBefore
- 参数： `foreRequestHook: (context, next) => null)` 查看 [中间件定义](#中间件定义)
- 描述

    传入的**前置中间件**会**在每个请求前被调用**，可使用且有效的 `context` 方法如下：
    - [context#setData](#setData) 设置请求数据
    - [context#setError](#setError) 设置请求错误
    - [context#setAxiosOptions](#setAxiosOptions) 设置请求的 axios 选项

    若在此时设置错误参数，则会导致真实请求不会被发送，直接进入请求失败阶段

### #useAfter
- 参数： `postRequestHook: (context, next) => null)` 查看 [中间件定义](#中间件定义)
- 描述

    传入的**后置中间件**会**在每个请求成功后被调用**，可使用且有效的 `context` 方法如下：
    - [context#setResponse](#setData) 设置请求响应
    - [context#setError](#setError) 设置请求错误

    若在此时设置错误参数，即使请求成功，该请求也将进入请求失败阶段

### #useCatch
- 参数： `fallbackHook: (context, next) => null)` 查看 [中间件定义](#中间件定义)
- 描述

    传入的**失败中间件**会**在每个请求失败（或者设定错误）后被调用**，可使用且有效的 `context` 方法如下：
    - [context#setError](#setError) 设置请求错误

    若在此时设置错误参数，会覆盖原始的错误值

### #getInstance
- 返回：`TransformedRequestMapper | { [namespace: string]: TransformedRequestMapper, $module?: ApiModule };`
- 描述：获取到映射后的请求集合对象
  ```js
  const apiModule = new ApiModule({ /*...*/ });
  const apiMapper = apiModule.getInstance();

  apiMapper.xxx({ /* `query`, `body`, `params` data here */ }, { /* Axios Request Config */ });
  ```

### #getAxios
- 返回：`AxiosInstance`
- 描述： 获取设置完 `baseConfig` 过后的 axios 实例
  ```js
  const apiModule = new ApiModule({ /*...*/ });
  const axios = apiModule.getAxios();

  axios.get('/other/path', { /* Axios Request Config */ });
  ```

### #generateCancellationSource
- 返回：`CancelTokenSource`
- 描述：生成 axios `Cancellation` source.

  你可以直接使用 axios 的 `HTTP cancellation`, 查看（[axios#cancellation 的文档](https://github.com/axios/axios#cancellation)）
  ```js
  import axios from 'axios';

  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  ...
  ```

  或者调用 `ApiModule#generateCancellationSource()`
  ```js
    ...
    
    const api = apiMod.getInstance();
    const cancelSourceA = api.$module.generateCancellationSource();
    const cancelSourceB = api.$module.generateCancellationSource();

    // 发送请求
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

    cancelSourceA.cancel('用户主动取消');

    // requestA 将会是 rejected 状态，错误原因是 `用户主动取消`
    // requestB 正常发送!
  ```
---

## 类 `Context`

### 只读成员
### metadata
当前请求设置的 metadata 元数据（的拷贝），即修改该只读值并不会影响该接口定义的元数据

### method
当前请求的请求方法

### baseURL
当前请求的 baseURL

### url
当前请求的完整请求 url，为 baseURL 和 解析过的 metadata.url 的组合

### data
当前请求的请求参数，类型[查看详情](#发送请求)：
- data.query?: object 请求的 `URLSearchParams` 查询参数
- data.params?: object 请求的动态 URL 参数。支持 `/:id` 和 `/{id}` 定义法
- data.body?: object 请求的请求体数据
- 添加其他用户自定义字段，可在中间件中访问到

### response
当前请求的响应数据

### responseError
当前请求的响应错误数据，或者是手动设置的错误数据，存在该值**不代表请求一定失败**

### axiosOptions
当前请求即将使用的 `axios` 选项参数，将会由请求传入的第二个 `opt` 参数和 `context#setAxiosOptions` 合并得到

### 实例方法
### setData
设置请求传入的请求参数（[查看详情](#发送请求)），将覆盖传入数据以达到改写请求数据的目的

### setResponse
设置请求的响应数据，将覆盖原来的响应以达到改写请求成功数据的目的

### setError
设置请求失败数据，无论请求是否成功，均会返回失败

### setAxiosOptions
设置 `axios` 请求的选项，但会和请求方法中传入的 `axios` 选项**合并**，**且优先级没有请求方法中传入的参数高**

---

# 版本变更记录
[版本变更记录](./CHANGELOG.md)

# 许可证
[MIT 许可证](./LICENSE)
