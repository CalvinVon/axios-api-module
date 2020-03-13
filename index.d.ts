import { AxiosRequestConfig, AxiosInstance, CancelTokenSource } from "axios";

export interface ApiModuleConfig {
    metadatas: ApiMetadataMapper | { [namespace: string]: ApiMetadataMapper };
    module?: Boolean;
    console?: Boolean;
    baseConfig?: AxiosRequestConfig;
}

export type ForeRequestHook = (
    context: Context,
    next: (error?: any) => null
) => void;

export type PostRequestHook = (
    context: Context,
    next: (error?: any) => null
) => void;

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
}

interface TransformedRequestData {
    query?: Object;
    params?: Object;
    body?: Object;
}

export type TransformedRequest = (
    data?: TransformedRequestData,
    opt?: AxiosRequestConfig
) => Promise<any>;

export interface TransformedRequestMapper {
    [metadataName: string]: TransformedRequest;
}

export interface ApiModuleOptions {
    axios: AxiosInstance;
    metadatas: ApiMetadataMapper | { [namespace: string]: ApiMetadataMapper };
    module: boolean;
    console: boolean;
    baseConfig: AxiosRequestConfig;
}

declare class ApiModule {
    constructor(config: ApiModuleConfig);

    options: ApiModuleOptions;
    static globalBefore(foreRequestHook: ForeRequestHook): void;
    static globalAfter(postRequestHook: PostRequestHook): void;
    static globalCatch(fallbackHook: FallbackHook): void;

    useBefore(foreRequestHook: ForeRequestHook): void;
    useAfter(postRequestHook: PostRequestHook): void;
    useCatch(fallbackHook: FallbackHook): void;

    /**
     * Get moduled/single module namespace api map
     */
    getInstance():
        TransformedRequestMapper
        | {
            $module?: ApiModule;
            [namespace: string]: TransformedRequestMapper
        };
    getAxios(): AxiosInstance;
    generateCancellationSource(): CancelTokenSource;
}

declare class Context {
    setData(data: any): Context;
    setResponse(response: any): Context;
    setError(error: any): Context;
    setAxiosOptions(options: AxiosRequestConfig): Context;

    metadata: ApiMetadata;
    method: string;
    url: string;
    parsedUrl: string;

    data: any;
    response: any;
    responseError: any;
}


export default ApiModule;
