import { AxiosRequestConfig, AxiosInstance, CancelTokenSource } from "axios";

export interface ApiModuleConfig {
    apiMetas: ApiMetaMap | { [namespace: string]: ApiMetaMap };
    module?: Boolean;
    console?: Boolean;
    baseConfig?: AxiosRequestConfig;
}

export type ForeRequestHook = (
    apiMeta: ApiMeta,
    data: Object | {},
    next: (error?: Error) => null
) => void;

export type FallbackHook = (
    apiMeta: ApiMeta,
    error: Error,
    next: (error?: Error) => null
) => void;

export interface ApiMetaMap {
    [apiMetaName: string]: ApiMeta;
}

export interface ApiMeta {
    method: "get" | "post" | "patch" | "delete" | "put" | "head";
    name?: string;
    url: string;
}

interface TransformedApiData {
    query?: Object;
    params?: Object;
    body?: Object;
}

export type TransformedApi = (
    data?: TransformedApiData,
    opt?: AxiosRequestConfig
) => Promise<any>;

export interface TransformedApiMap {
    $module?: ApiModule;
    [apiMetaName: string]: TransformedApi;
}

export interface ApiModuleOptions {
    axios: AxiosInstance;
    apiMetas: ApiMetaMap | { [namespace: string]: ApiMetaMap };
    apis: Object;
    module: boolean;
    console: boolean;
    baseConfig: AxiosRequestConfig;
}

declare class ApiModule {
    constructor(config: ApiModuleConfig);

    options: ApiModuleOptions;
    static registerForeRequestMiddleWare(foreRequestHook: ForeRequestHook): void;
    static registerFallbackMiddleWare(fallbackHook: FallbackHook): void;

    registerForeRequestMiddleWare(foreRequestHook: ForeRequestHook): void;
    registerFallbackMiddleWare(fallbackHook: FallbackHook): void;

    /**
     * Get moduled/single module namespace api map
     */
    getInstance():
        | TransformedApiMap
        | { [namespace: string]: TransformedApiMap; $module?: ApiModule };
    getAxios(): any;
    generateCancellationSource(): CancelTokenSource;
}

export default ApiModule;
