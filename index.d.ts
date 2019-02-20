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

export interface ApiModuleConfig {
  apiMetas: ApiMetaSet;
}

export interface ApiMetaSet {
  [apiMetaName: string]: ApiMeta;
}

export interface ApiMeta {
  method: "get" | "post" | "patch" | "delete" | "put";
  name?: string;
  url: string;
}

interface TransformedApiData {
  query?: Object;
  params?: Object;
  body?: Object;
}

type TransformedApi = (data?: TransformedApiData) => Promise<any>;

export interface TransformedApiMap {
  [apiMetaName: string]: TransformedApi;
}

declare class ApiModule {
  constructor(config: ApiModuleConfig);

  registeForeRequestMiddleWare(foreRequestHook: ForeRequestHook): void;
  registeFallbackMiddleWare(fallbackHook: FallbackHook): void;

  getInstance(): TransformedApiMap;
  getAxios(): any;
}

export default ApiModule;
