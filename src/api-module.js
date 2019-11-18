import axios from 'axios';

const defaultForeRequestHook = () => {
    return (_, __, next) => next();
};

const defaultPostRequestHook = () => {
    return (_, res, next) => next(res);
};

const defaultFallbackHook = () => {
    return (_, { error }, next) => next(error);
};

/**
 * Api Module class
 * 
 * @static {Function} foreRequestHook
 * @static {Function} fallbackHook
 * 
 * @member {Object} options
 * @member {Function} foreRequestHook
 * @member {Function} fallbackHook
 * 
 * @method registerForeRequestMiddleWare(hook)
 * @method registerFallbackMiddleWare(hook)
 * @method getAxios()
 * @method getInstance(hook)
 * @method generateCancellationSource() get axios cancellation source for cancel api
 */
export default class ApiModule {

    static foreRequestHook;
    static postRequestHook;
    static fallbackHook;

    options = {};
    foreRequestHook;
    postRequestHook;
    fallbackHook;


    constructor(config = {}) {
        const {
            apiMetas = {},
            module: modularNsp = true,
            console: useConsole = true,
            baseConfig = {},
        } = config;

        let API_ = {};

        if (modularNsp) {
            // moduled namespace
            Object.keys(apiMetas).forEach(apiName => {
                API_[apiName] = this._Proxyable(apiMetas[apiName]);
            });
        } else {
            // single module
            API_ = this._Proxyable(apiMetas);
        }

        Object.defineProperty(API_, '$module', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: this
        });

        this.options = {
            axios: axios.create(baseConfig),
            apiMetas,
            apis: API_,
            module: modularNsp,
            console: useConsole,
            baseConfig
        };
    }



    /**
     * Register Globally Fore-Request MiddleWare Globally (For All Instance)
     * @param {Function} foreRequestHook(apiMeta, data = {}, next) 
     */
    static globalForeRequestMiddleWare(foreRequestHook = defaultForeRequestHook()) {
        ApiModule.foreRequestHook = foreRequestHook;
    }

    /**
     * Register Globally Post-Request MiddleWare Globally (For All Instance)
     * @param {Function} foreRequestHook(apiMeta, data = {}, next) 
     */
    static globalPostRequestMiddleWare(postRequestHook = defaultPostRequestHook()) {
        ApiModule.postRequestHook = postRequestHook;
    }

    /**
     * Register Globally ForeRequest MiddleWare Globally (For All Instance)
     * @param {Function} fallbackHook(apiMeta, data = {}, next) 
     */
    static globalFallbackMiddleWare(fallbackHook = defaultFallbackHook()) {
        ApiModule.fallbackHook = fallbackHook;
    }

    /**
     * Registe Fore-Request MiddleWare
     * @param {Function} foreRequestHook(apiMeta, data = {}, next)
     */
    registerForeRequestMiddleWare(foreRequestHook = defaultForeRequestHook()) {
        this.foreRequestHook = foreRequestHook;
    }

    /**
     * Registe Post-Request MiddleWare
     * @param {Function} foreRequestHook(apiMeta, data = {}, next)
     */
    registerPostRequestMiddleWare(postRequestHook = defaultPostRequestHook()) {
        this.postRequestHook = postRequestHook;
    }

    /**
     * Registe Fallback MiddleWare
     * @param {Function} fallbackHook(apiMeta, data = {}, next)
     */
    registerFallbackMiddleWare(fallbackHook = defaultFallbackHook()) {
        this.fallbackHook = fallbackHook;
    }

    /**
     * @returns {Axios} get instance of Axios
     */
    getAxios() {
        return this.options.axios;
    }

    /**
     * get axios cancellation source for cancel api
     * @returns {CancelTokenSource}
     */
    generateCancellationSource() {
        return axios.CancelToken.source();
    }

    /**
     * @returns {Object} get instance of api mapper
     */
    getInstance() {
        return this.options.apis;
    }

    /**
     * fore-request middleware
     * @param {ApiMeta} apiMeta api metadata
     * @param {Object} data request data
     * @param {Query/Body} next(err) call for next step
     */
    foreRequestMiddleWare(apiMeta, data, next) {
        const hookFunction = this.foreRequestHook || ApiModule.foreRequestHook || defaultForeRequestHook();
        if (typeof hookFunction === 'function') {
            hookFunction(apiMeta, data, next);
        } else {
            console.warn(`[ApiModule] foreRequestMiddleWare: ${hookFunction} is not a valid foreRequestHook function`);
            next();
        }
    }

    /**
     * post-request middleware
     * @param {ApiMeta} apiMeta api metadata
     * @param {Object} res response data
     * @param {Query/Body} next(err) call for next step
     */
    postRequestMiddleWare(apiMeta, res, next) {
        const hookFunction = this.postRequestHook || ApiModule.postRequestHook || defaultPostRequestHook();
        if (typeof hookFunction === 'function') {
            hookFunction(apiMeta, res, next);
        } else {
            console.warn(`[ApiModule] postRequestMiddleWare: ${hookFunction} is not a valid foreRequestHook function`);
            next(res);
        }
    }

    /**
     * fallback middleWare
     * @param {ApiMeta} apiMeta api metadata
     * @param {Error} error
     * @param {Function} next(err) call for next step
     */
    fallbackMiddleWare(apiMeta, data, next) {
        const error = data.error;
        const hookFunction = this.fallbackHook || ApiModule.fallbackHook || defaultFallbackHook();
        const defaultErrorHandler = () => {
            if (this.options.console) {
                const {
                    name,
                    method,
                    url
                } = apiMeta;
                const msg = `[ApiModule] ${name} [${method.toUpperCase()}]: [${url}] failed with ${error.message}`;
                console.error(new Error(msg));
            }

            next(error);
        }

        if (typeof hookFunction === 'function') {
            hookFunction(apiMeta, data, next);
        } else {
            console.warn(`[ApiModule] fallbackMiddleWare: ${hookFunction} is not a valid fallbackHook function`);
            defaultErrorHandler();
        }
    }

    // tranfer single module api meta info to request
    _Proxyable(target) {
        const target_ = {};
        for (const key in target) {
            if (target.hasOwnProperty(key)) {
                target_[key] = this._ProxyApi(target, key);
            }
        }
        return target_;
    }

    // map api meta to to request
    _ProxyApi(target, key) {
        const metaData = target[key];
        if (Object.prototype.toString.call(metaData) !== '[object Object]') {
            throw new TypeError(`Api metadata [${key}] is not an object`);
        }

        const {
            method,
            url,
        } = metaData;

        if (!method || !url) {
            console.log(`[ApiModule] Check your api metadata for [${key}]: `, metaData);
            throw new Error(`[ApiModule] Api metadata [${key}]: 'method' or 'url' value not found`);
        }

        let parsedUrl = url;

        const request = (data, opt = {}) => {
            return new Promise((resolve, reject) => {
                // fore request task
                this.foreRequestMiddleWare(metaData, data, err => {
                    if (err) {
                        this.fallbackMiddleWare(metaData, { data, error: err }, reject)
                    }
                    else {

                        const {
                            query = {},
                            params = {},
                            body = {}
                        } = data || {};

                        // parse url
                        // handle api like /a/:id/b/{param}
                        parsedUrl = url
                            .replace(/\B(?::(\w+)|{(\w+)})/g, (...args) => {
                                return params[args[1] || args[2]];
                            });

                        const config = Object.assign(
                            {},
                            {
                                method: method.toLowerCase(),
                                url: parsedUrl,
                                params: query,
                                data: body,
                            },
                            opt
                        );

                        this.options.axios(config)
                            .then(res => {
                                this.postRequestMiddleWare(metaData, { data, response: res }, resolve);
                            })
                            .catch(err => {
                                this.fallbackMiddleWare(metaData, { data, error: err }, reject)
                            });
                    }
                })
            })
        };

        request.meta = metaData;
        return request;
    }
}