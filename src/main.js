import axios from 'axios';

/**
 * api 统一封装方法
 * @description api集合为元数据，可直接在页面使用 this.$api[module][api]某某方法
 * @example api.login.logout(queryOrBodyData, enableFilterEmpty)
 *
 * @param {Object} queryOrBodyData? 查询参数 或者 荷载数据
 * @param {Boolean} enableFilterEmpty? 是否开启过滤空字段，默认 false
 *
 * @return {Object<{ data }>}
 */

export default class ApiModule {

    options = {};
    foreRequestHook = (_, __, next) => next();
    fallbackHook = (_, err, next) => next(err);

    constructor(config = {}) {
        const {
            apiMetas = {}
        } = config;

        const API_ = {};
        Object.keys(apiMetas).forEach(apiName => {
            API_[apiName] = this._Proxyable(apiMetas[apiName]);
        });

        this.options = {
            axios,
            apiMetas,
            apis: API_,
        };
    }

    /**
     * Registe ForeRequest MiddleWare
     * @param {Function} foreRequestHook(apiMeta, data = {}, next)
     */
    registeForeRequestMiddleWare(foreRequestHook = new Function()) {
        this.foreRequestHook = foreRequestHook;
    }

    /**
     * Registe Fallback MiddleWare
     * @param {Function} fallbackHook(apiMeta, data = {}, next)
     */
    registeFallbackMiddleWare(fallbackHook = new Function()) {
        this.fallbackHook = fallbackHook;
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
        if (typeof this.foreRequestHook === 'function') {
            this.foreRequestHook(apiMeta, data, next);
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
        if (typeof this.fallbackHook === 'function') {
            this.fallbackHook(apiMeta, error, next);
        } else {
            next(error);
        }
    }

    // tranfer single module api meta info to request
    _Proxyable(target) {
        const target_ = {};
        for (const key in target) {
            if (target.hasOwnProperty(key)) {
                target_[key] = _ProxyApi(target, key);
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