import axios from 'axios';

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
    static fallbackHook;

    options = {};
    foreRequestHook;
    fallbackHook;

    constructor(config = {}) {
        const {
            apiMetas = {},
            module: moduledNsp = true,
            console = true
        } = config;

        let API_ = {};

        if (moduledNsp) {
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
            axios,
            apiMetas,
            apis: API_,
            module: moduledNsp,
            console
        };
    }

    /**
     * Registe ForeRequest MiddleWare Globally (For All Instance)
     * @param {Function} foreRequestHook(apiMeta, data = {}, next) 
     */
    static registerForeRequestMiddleWare(foreRequestHook = new Function()) {
        ApiModule.foreRequestHook = foreRequestHook;
    }

    /**
     * Registe ForeRequest MiddleWare Globally (For All Instance)
     * @param {Function} fallbackHook(apiMeta, data = {}, next) 
     */
    static registerFallbackMiddleWare(fallbackHook = new Function()) {
        ApiModule.fallbackHook = fallbackHook;
    }

    /**
     * Registe ForeRequest MiddleWare
     * @param {Function} foreRequestHook(apiMeta, data = {}, next)
     */
    registerForeRequestMiddleWare(foreRequestHook = new Function()) {
        this.foreRequestHook = foreRequestHook;
    }

    /**
     * Registe Fallback MiddleWare
     * @param {Function} fallbackHook(apiMeta, data = {}, next)
     */
    registerFallbackMiddleWare(fallbackHook = new Function()) {
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
     * @returns {Object} get instance of api set object
     */
    getInstance() {
        return this.options.apis;
    }

    /**
     * fore request middleware
     * @param {ApiMeta} apiMeta api meta data
     * @param {Object} data request data
     * @param {Query/Body} next(err) call for next step
     */
    foreRequestMiddleWare(apiMeta, data = {}, next) {
        const hookFunction = this.foreRequestHook || ApiModule.foreRequestHook;
        if (typeof hookFunction === 'function') {
            hookFunction(apiMeta, data, next);
        } else {
            next();
        }
    }

    /**
     * fallback middleWare
     * @param {ApiMeta} apiMeta api meta data
     * @param {Error} error
     * @param {Function} next(err) call for next step
     */
    fallbackMiddleWare(apiMeta, error, next) {
        const hookFunction = this.fallbackHook || ApiModule.fallbackHook;
        const defaultErrorHandler = () => {
            if (this.options.console) {
                const {
                    name,
                    method,
                    url
                } = apiMeta;
                const msg = `ApiModule - ${name} [${method.toUpperCase()}]: [${url}] failed with ${error.message}`;
                console.error(new Error(msg));
            }

            next(error);
        }

        if (typeof hookFunction === 'function') {
            hookFunction(apiMeta, error, defaultErrorHandler);
        } else {
            defaultErrorHandler(error);
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
        if (!target[key]) throw new ReferenceError('API ' + key + ' not exist');

        const {
            method,
            url,
        } = target[key];

        if (!method || !url) {
            console.error('[ApiModule error] invalid api meta found');
            console.dir(target[key])
            return;
        }

        let parsedUrl = url;

        return (data = {}, opt = {}) => {
            const {
                query = {},
                params = {},
                body = {}
            } = data;

            return new Promise((resolve, reject) => {

                // parse url
                // handle api like /a/:id/b/{param}
                parsedUrl = url
                    .replace(/\B(?::(\w+)|{(\w+)})/g, (...args) => {
                        return params[args[1] || args[2]];
                    })

                // fore request task
                this.foreRequestMiddleWare(target[key], data, err => {
                    if (err) {
                        this.fallbackMiddleWare(target[key], err, reject)
                    } else {

                        const config = Object.assign({
                            method: method.toLowerCase(),
                            url: parsedUrl,
                            params: query,
                            data: body,
                        }, opt);

                        axios(config)
                            .then(data => resolve(data))
                            .catch(err => {
                                this.fallbackMiddleWare(target[key], err, reject)
                            });
                    }
                })
            })
        };
    }
}