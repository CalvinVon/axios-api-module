import axios from 'axios';
import Context from './context';

const defaultMiddleware = (context, next) => next(context.responseError);

/**
 * Api Module class
 * 
 * @static {Function} foreRequestHook
 * @static {Function} postRequestHook
 * @static {Function} fallbackHook
 * 
 * @member {Object} options
 * @member {Function} foreRequestHook
 * @member {Function} postRequestHook
 * @member {Function} fallbackHook
 * 
 * @method useBefore(hook)
 * @method useAfter(hook)
 * @method useCatch(hook)
 * @method getAxios()
 * @method getInstance()
 * @method generateCancellationSource() get axios cancellation source for cancel api
 */
export default class ApiModule {

    static foreRequestHook;
    static postRequestHook;
    static fallbackHook;

    options = {};
    apiMapper;
    foreRequestHook;
    postRequestHook;
    fallbackHook;


    constructor(config = {}) {
        const {
            metadatas = {},
            module: modularNsp,
            console: useConsole = true,
            baseConfig = {},
        } = config;

        this.options = {
            axios: axios.create(baseConfig),
            metadatas,
            module: modularNsp,
            console: useConsole,
            baseConfig
        };

        this.apiMapper = {};

        if (modularNsp) {
            // moduled namespace
            Object.keys(metadatas).forEach(apiName => {
                this.apiMapper[apiName] = this._proxyable(metadatas[apiName], apiName);
            });
        }
        else {
            // single module
            this.apiMapper = this._proxyable(metadatas);
        }

        Object.defineProperty(this.apiMapper, '$module', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: this
        });
    }


    /**
     * Register fore-request middleWare globally (for all instances)
     * @param {Function} foreRequestHook(context, next) 
     */
    static globalBefore(foreRequestHook = defaultMiddleware) {
        ApiModule.foreRequestHook = foreRequestHook;
    }

    /**
     * Register post-request middleware globally (for all instances)
     * @param {Function} foreRequestHook(apiMeta, data = {}, next) 
     */
    static globalAfter(postRequestHook = defaultMiddleware) {
        ApiModule.postRequestHook = postRequestHook;
    }

    /**
     * Register fallback MiddleWare Globally (For All Instance)
     * @param {Function} fallbackHook(apiMeta, data = {}, next) 
     */
    static globalCatch(fallbackHook = defaultMiddleware) {
        ApiModule.fallbackHook = fallbackHook;
    }

    /**
     * Registe Fore-Request MiddleWare
     * @param {Function} foreRequestHook(apiMeta, data = {}, next)
     */
    useBefore(foreRequestHook = defaultMiddleware) {
        this.foreRequestHook = foreRequestHook;
    }

    /**
     * Registe Post-Request MiddleWare
     * @param {Function} foreRequestHook(apiMeta, data = {}, next)
     */
    useAfter(postRequestHook = defaultMiddleware) {
        this.postRequestHook = postRequestHook;
    }

    /**
     * Registe Fallback MiddleWare
     * @param {Function} fallbackHook(apiMeta, data = {}, next)
     */
    useCatch(fallbackHook = defaultMiddleware) {
        this.fallbackHook = fallbackHook;
    }

    /**
     * get axios cancellation source for cancel api
     * @returns {CancelTokenSource}
     */
    generateCancellationSource() {
        return axios.CancelToken.source();
    }


    /**
     * @returns {Axios} get instance of Axios
     */
    getAxios() {
        return this.options.axios;
    }

    /**
     * @returns {Object} get instance of api metadata mapper
     */
    getInstance() {
        return this.apiMapper;
    }


    /**
     * fore-request middleware
     * @param {Context} context
     * @param {Function} next
     */
    foreRequestMiddleWare(context, next) {
        const hookFunction = this.foreRequestHook || ApiModule.foreRequestHook || defaultMiddleware;
        if (typeof hookFunction === 'function') {
            try {
                hookFunction.call(this, context, next);
            } catch (error) {
                console.error('[ApiModule] An error occurred in foreRequestMiddleWare: ', error);
                next();
            }
        }
        else {
            console.warn(`[ApiModule] foreRequestMiddleWare: ${hookFunction} is not a valid foreRequestHook function`);
            next();
        }
    }

    /**
     * post-request middleware
     * @param {Context} context
     * @param {Function} next
     */
    postRequestMiddleWare(context, next) {
        const hookFunction = this.postRequestHook || ApiModule.postRequestHook || defaultMiddleware;
        if (typeof hookFunction === 'function') {
            try {
                hookFunction.call(this, context, next);
            } catch (error) {
                console.error('[ApiModule] An error occurred in postRequestMiddleWare: ', error);
                next();
            }
        }
        else {
            console.warn(`[ApiModule] postRequestMiddleWare: ${hookFunction} is not a valid foreRequestHook function`);
            next();
        }
    }

    /**
     * fallback middleWare
     * @param {Context} context
     * @param {Function} next
     */
    fallbackMiddleWare(context, next) {
        const defaultErrorHandler = () => {
            if (this.options.console) {
                const {
                    method,
                    url
                } = context.metadata;
                const msg = `[ApiModule] [${method.toUpperCase()} ${url}] failed with ${error.message}`;
                console.error(new Error(msg));
            }

            next();
        };
        const error = context.responseError;
        const hookFunction = this.fallbackHook || ApiModule.fallbackHook || defaultErrorHandler;

        if (typeof hookFunction === 'function') {
            try {
                hookFunction.call(this, context, next);
            } catch (error) {
                console.error('[ApiModule] An error occurred in fallbackMiddleWare: ', error);
                next();
            }
        }
        else {
            console.warn(`[ApiModule] fallbackMiddleWare: ${hookFunction} is not a valid fallbackHook function`);
            defaultErrorHandler();
        }
    }

    // tranfer single module api meta info to request
    _proxyable(target, apiName) {
        const _target = {};
        for (const key in target) {
            if (target.hasOwnProperty(key)) {
                _target[key] = this._proxyApiMetadata(target, key, apiName);
            }
        }
        return _target;
    }

    // map api meta to to request
    _proxyApiMetadata(target, key, parentKey) {
        const metadata = target[key];
        if (Object.prototype.toString.call(metadata) !== '[object Object]') {
            throw new TypeError(`[ApiModule] api metadata [${key}] is not an object`);
        }

        const context = new Context(metadata, this.options);
        context._metadataKeys = [parentKey, key].filter(Boolean);

        if (!context.url || !context.method) {
            console.warn(`[ApiModule] check your api metadata for [${key}]: `, metadata);
            throw new Error(`[ApiModule] api metadata [${key}]: 'method' or 'url' value not found`);
        }

        /**
         * Collect errors and set errors uniformly. Returns if there is an error
         * @param {Error|any} err
         * @return {Boolean}
         */
        const handleResponseError = err => {
            const error = err || context.responseError;
            if (!error) return false;

            if (error instanceof Error) {
                context.setError(error);
            }
            else if (typeof error === 'string') {
                context.setError(new Error(error));
            }
            else {
                context.setError(error);
            }
            return true;
        };


        const request = (data, opt = {}) => {
            context
                .setError(null)
                .setResponse(null)
                .setAxiosOptions({})

                .setData(data)
                ._setRequestOptions(opt);

            return new Promise((resolve, reject) => {
                this.foreRequestMiddleWare(context, err => {
                    if (handleResponseError(err)) {
                        this.fallbackMiddleWare(context, () => {
                            reject(context.responseError);
                        });
                    }
                    else {
                        const {
                            query = {},
                            body = {}
                        } = context.data || {};

                        const config = Object.assign(
                            {},
                            {
                                method: context.method.toLowerCase(),
                                url: context.url,
                                params: query,
                                data: body,
                            },
                            context.axiosOptions
                        );

                        this.options.axios(config)
                            .then(res => {
                                context.setResponse(res);
                                this.postRequestMiddleWare(context, err => {
                                    if (handleResponseError(err)) {
                                        throw context.responseError;
                                    }
                                    resolve(context.response);
                                });
                            })
                            .catch(error => {
                                handleResponseError(error);
                                this.fallbackMiddleWare(context, err => {
                                    handleResponseError(err);
                                    reject(context.responseError);
                                });
                            });
                    }
                })
            })
        };

        request.context = context;
        return request;
    }
}