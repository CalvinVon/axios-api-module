import { AxiosRequestConfig, AxiosInstance, CancelTokenSource } from "axios";

export interface ApiModuleConfig {
    apiMetas: ApiMetaMapper | { [namespace: string]: ApiMetaMapper };
    module?: Boolean;
    console?: Boolean;
    baseConfig?: AxiosRequestConfig;
}

export type ForeRequestHook = (
    apiMeta: ApiMeta,
    data: Object | {},
    next: (error?: Error) => null
) => void;

export type PostRequestHook = (
    apiMeta: ApiMeta,
    res: Object | {},
    next: (res: Object) => null
) => void;

export type FallbackHook = (
    apiMeta: ApiMeta,
    data: { error: Error, data: Object },
    next: (error?: Error) => null
) => void;

export interface ApiMetaMapper {
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

export interface TransformedApiMapper {
    $module?: ApiModule;
    [apiMetaName: string]: TransformedApi;
}

export interface ApiModuleOptions {
    axios: AxiosInstance;
    apiMetas: ApiMetaMapper | { [namespace: string]: ApiMetaMapper };
    apis: Object;
    module: boolean;
    console: boolean;
    baseConfig: AxiosRequestConfig;
}

declare class ApiModule {
    constructor(config: ApiModuleConfig);

    options: ApiModuleOptions;
    static globalForeRequestMiddleWare(foreRequestHook: ForeRequestHook): void;
    static globalPostRequestMiddleWare(postRequestHook: PostRequestHook): void;
    static globalFallbackMiddleWare(fallbackHook: FallbackHook): void;

    registerForeRequestMiddleWare(foreRequestHook: ForeRequestHook): void;
    registerPostRequestMiddleWare(postRequestHook: PostRequestHook): void;
    registerFallbackMiddleWare(fallbackHook: FallbackHook): void;

    /**
     * Get moduled/single module namespace api map
     */
    getInstance():
        | TransformedApiMapper
        | {
            [namespace: string]: TransformedApiMapper;
            $module?: ApiModule
        };
    getAxios(): any;
    generateCancellationSource(): CancelTokenSource;
}

export default ApiModule;
