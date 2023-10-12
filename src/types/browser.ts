import { TagPropsType } from 'components/design-system-ui/tag/PropsType';

export type DAPPCategory = {
  slug: string;
  name: string;
  id: string;
  color: TagPropsType['color'];
};

export type DAppInfo = {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  description: string;
  categories: string[];
  chain: string[];
  is_featured: boolean;
  is_evm: boolean;
  is_substrate: boolean;
  icon: string;
  preview_image: string;
};

export type PredefinedDApps = {
  categories: () => DAPPCategory[];
  dapps: DAppInfo[];
};
