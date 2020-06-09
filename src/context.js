export default class Context {

    // Private members
    _options;
    _metadata;
    _metadataKeys;
    _data = null;
    _response = null;
    _responseError = null;
    _reqAxiosOpts = {};
    _metaAxiosOpts = {};

    constructor(apiMetadata, options) {
        this._metadata = apiMetadata;
        this._options = options;
    }


    /**
     * set request data
     * @param {any} data
     * @return {Context}
     */
    setData(data) {
        this._data = data;
        return this;
    }

    /**
     * set response data
     * @param {any} response
     * @return {Context}
     */
    setResponse(response) {
        this._response = response;
        return this;
    }

    /**
     * set response error
     * @param {any} error
     * @return {Context}
     */
    setError(error) {
        this._responseError = error;
        return this;
    }

    /**
     * set single axios request options
     * @param {AxiosOptions} axiosOptions 
     * @private
     */
    _setRequestOptions(axiosOptions) {
        if (isObject(axiosOptions)) {
            this._reqAxiosOpts = axiosOptions;
        }
        else {
            console.error(`[ApiModule] the request parameter, the parameter \`${axiosOptions}\` is not an object`);
        }
        return this;
    }


    /**
     * set axios options (Designed for invocation in middleware)
     * @param {*} axiosOptions 
     * @public
     */
    setAxiosOptions(axiosOptions) {
        if (isObject(axiosOptions)) {
            this._metaAxiosOpts = axiosOptions;
        }
        else {
            console.error(`[ApiModule] configure axios options error, the parameter \`${axiosOptions}\` is not an object`);
        }
    }

    get metadata() {
        return { ...this._metadata };
    }

    get metadataKeys() {
        return this._metadataKeys;
    }

    get method() {
        return this._metadata.method;
    }

    get baseURL() {
        return this.axiosOptions.baseURL || '';
    }

    get url() {
        const { url } = this._metadata;
        const { params } = this.data || {};

        if (isObject(params)) {
            // handle api like /a/:id/b/{param}
            return this.baseURL + url
                .replace(/\B(?::(\w+)|{(\w+)})/g, (...args) => {
                    return params[args[1] || args[2]];
                });
        }
        else {
            return this.baseURL + url;
        }
    }

    get data() {
        return this._data;
    }

    get response() {
        return this._response;
    }

    get responseError() {
        return this._responseError;
    }

    get axiosOptions() {
        // request axios options > metadata axios options
        const { _reqAxiosOpts, _metaAxiosOpts } = this;
        return Object.assign({}, _metaAxiosOpts, _reqAxiosOpts);
    }
}


function isObject(target) {
    return Object.prototype.toString.call(target) === '[object Object]';
}