export type DAPPCategory = {
  name: string;
  id: string;
};

export type DAppInfo = {
  name: string;
  url: string;
  icon: string;
  categories: string[];
  isSupportSubstrateAccount?: boolean;
  isSupportEthereumAccount?: boolean;
};

export type PredefinedDApps = {
  categories: DAPPCategory[];
  dapps: DAppInfo[];
};
