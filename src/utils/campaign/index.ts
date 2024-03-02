import { Icon as _PhosphorIcon } from 'phosphor-react-native';
import * as Phosphor from 'phosphor-react-native';
export type PhosphorIcon = _PhosphorIcon;

export const getBannerButtonIcon = (icon: string | null): PhosphorIcon | undefined => {
  if (!icon) {
    return undefined;
  }

  if (!['Icon', 'IconProps', 'IconWeight', 'IconContext'].includes(icon) && icon in Phosphor) {
    // @ts-ignore
    return Phosphor[icon] as PhosphorIcon;
  }

  return undefined;
};
