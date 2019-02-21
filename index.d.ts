export interface ApiModuleConfig {
  apiMetas: ApiMetaMap | { [namespace: string]: ApiMetaMap };
  module?: Boolean;
  console?: Boolean;
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

export interface Canceler {
  (message?: string): void;
}

export interface CancelToken {
  promise: Promise<Cancel>;
  reason?: any;
  throwIfRequested(): void;
}
export interface CancelTokenSource {
  token: CancelToken;
  cancel: Canceler;
}

export interface AxiosRequestConfig {
  url?: string;
  method?: string;
  baseURL?: string;
  headers?: any;
  params?: any;
  paramsSerializer?: (params: any) => string;
  data?: any;
  timeout?: number;
  withCredentials?: boolean;
  responseType?: string;
  xsrfCookieName?: string;
  xsrfHeaderName?: string;
  onUploadProgress?: (progressEvent: any) => void;
  onDownloadProgress?: (progressEvent: any) => void;
  maxRedirects?: number;
  cancelToken?: CancelToken;
}

type TransformedApi = (data?: TransformedApiData, opt?: AxiosRequestConfig) => Promise<any>;

export interface TransformedApiMap {
  $module?: ApiModule;
  [apiMetaName: string]: TransformedApi;
}

declare class ApiModule {
  constructor(config: ApiModuleConfig);

  static registerForeRequestMiddleWare(foreRequestHook: ForeRequestHook): void;
  static registerFallbackMiddleWare(fallbackHook: FallbackHook): void;

  registerForeRequestMiddleWare(foreRequestHook: ForeRequestHook): void;
  registerFallbackMiddleWare(fallbackHook: FallbackHook): void;

  /**
   * Get moduled/single module namespace api map
   */
  getInstance(): TransformedApiMap | { [namespace: string]: TransformedApiMap, $module?: ApiModule };
  getAxios(): any;
  generateCancellationSource(): CancelTokenSource;
}

export default ApiModule;
