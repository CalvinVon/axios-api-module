export type ForeRequestHook = (
  apiMeta: ApiMeta,
  data: Object | {},
  next: (error?: Error) => null
) => void;

export type ForeRequestHook = (
  apiMeta: ApiMeta,
  data: Object | {},
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

export interface TransformedApiSet {
  [apiMetaName: string]: TransformedApi;
}

declare class ApiModule {
  constructor(config: ApiModuleConfig);

  registeForeRequestMiddleWare(foreRequestHook: ForeRequestHook): void;
  registeFallbackMiddleWare(fallbackHook: ForeRequestHook): void;

  getInstance(): TransformedApiSet;
  getAxios(): any;
}

export default ApiModule;
