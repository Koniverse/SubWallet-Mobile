import { TagPropsType } from 'components/design-system-ui/tag/PropsType';

export type DAPPCategory = {
  name: string;
  id: string;
  theme?: TagPropsType['color'];
};

export type DAppInfo = {
  name: string;
  id: string;
  url: string;
  icon: string;
  categories: string[];
  isSupportSubstrateAccount?: boolean;
  isSupportEthereumAccount?: boolean;
};

export type PredefinedDApps = {
  categories: () => DAPPCategory[];
  dapps: DAppInfo[];
};
