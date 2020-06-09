import { AxiosRequestConfig, AxiosInstance, CancelTokenSource } from "axios";

export interface ApiModuleConfig {
    metadatas: ApiMetadataMapper | { [namespace: string]: ApiMetadataMapper };
    module?: Boolean;
    console?: Boolean;
    baseConfig?: AxiosRequestConfig;
}

/**
 * Fore-request middleware
 */
export type ForeRequestHook = (
    context: Context,
    next: (error?: any) => null
) => void;

/**
 * Post-request middleware
 */
export type PostRequestHook = (
    context: Context,
    next: (error?: any) => null
) => void;

/**
 * fallback middleware
 */
export type FallbackHook = (
    context: Context,
    next: (error?: any) => null
) => void;

export interface ApiMetadataMapper {
    [metadataName: string]: ApiMetadata;
}

export interface ApiMetadata {
    method: "get" | "post" | "patch" | "delete" | "put" | "head";
    url: string;
    [field: string]: any
}

export interface TransformedRequestData {
    query?: Object;
    params?: Object;
    body?: Object;
}

export type TransformedRequest = (
    data?: TransformedRequestData,
    opt?: AxiosRequestConfig
) => Promise<any>;

export interface TransformedRequestMapper {
    [requestName: string]: TransformedRequest;
}

export interface ApiModuleOptions {
    axios: AxiosInstance;
    metadatas: ApiMetadataMapper | { [namespace: string]: ApiMetadataMapper };
    module: boolean;
    console: boolean;
    baseConfig: AxiosRequestConfig;
}

export declare class ApiModule {
    constructor(config: ApiModuleConfig);

    options: ApiModuleOptions;

    /**
     * Register fore-request middleWare globally (for all instances)
     */
    static globalBefore(foreRequestHook: ForeRequestHook): void;

    /**
     * Register post-request middleware globally (for all instances)
     */
    static globalAfter(postRequestHook: PostRequestHook): void;

    /**
     * Register fallback middleware globally (for all instances)
     */
    static globalCatch(fallbackHook: FallbackHook): void;


    /**
     * Registe fore-request middleware
     */
    useBefore(foreRequestHook: ForeRequestHook): void;

    /**
     * Registe post-request middleware
     */
    useAfter(postRequestHook: PostRequestHook): void;

    /**
     * Registe fallback-request middleware
     */
    useCatch(fallbackHook: FallbackHook): void;

    /**
     * Get the instance of api metadatas mapper
     */
    getInstance():
        {
            $module: ApiModule;
            [requestName: string]: TransformedRequest;
        }
        |
        {
            $module: ApiModule;
            [namespace: string]: TransformedRequestMapper
        };

    /**
     * Get the instance of Axios
     */
    getAxios(): AxiosInstance;

    /**
     * Get axios cancellation source
     */
    generateCancellationSource(): CancelTokenSource;
}

export declare class Context {
    /**
     * Set request data
     */
    setData(data: TransformedRequestData): Context;

    /**
     * Set response data
     */
    setResponse(response: any): Context;

    /**
     * Set request error or response error data
     */
    setError(error: string | Error): Context;

    /**
     * Set axios request config
     */
    setAxiosOptions(options: AxiosRequestConfig): Context;

    readonly metadata: ApiMetadata;
    readonly method: string;
    readonly baseURL: string;
    /**
     * Parsed url
     */
    readonly url: string;

    /**
     * Request data
     */
    readonly data: TransformedRequestData;

    /**
     * Response data
     */
    readonly response: any;

    /**
     * Response error
     */
    readonly responseError: any;
    readonly axiosOptions: AxiosRequestConfig | object;
}


export default ApiModule;
