import { YieldPoolType } from '@subwallet/extension-base/types';
import { Database, HandsClapping, Leaf, User, Users } from 'phosphor-react-native';
import { ThemeTypes } from 'styles/themes';
import { EarningTagType } from 'types/earning';
import { convertHexColorToRGBA } from 'utils/color';

export const createEarningTypeTags = (theme: ThemeTypes): Record<YieldPoolType, EarningTagType> => {
  return {
    [YieldPoolType.LIQUID_STAKING]: {
      label: 'Liquid staking',
      icon: Leaf,
      bgColor: convertHexColorToRGBA(theme['magenta-6'], 0.1),
      color: theme['magenta-6'],
      weight: 'bold',
    },
    [YieldPoolType.LENDING]: {
      label: 'Lending',
      icon: HandsClapping,
      bgColor: convertHexColorToRGBA(theme['green-6'], 0.1),
      color: theme['green-6'],
      weight: 'bold',
    },
    [YieldPoolType.SINGLE_FARMING]: {
      label: 'Single farming',
      icon: User,
      bgColor: convertHexColorToRGBA(theme['green-6'], 0.1),
      color: theme['green-6'],
      weight: 'bold',
    },
    [YieldPoolType.NOMINATION_POOL]: {
      label: 'Nomination pool',
      icon: Users,
      bgColor: convertHexColorToRGBA(theme.colorSecondary, 0.1),
      color: theme.colorSecondary,
      weight: 'bold',
    },
    [YieldPoolType.PARACHAIN_STAKING]: {
      label: 'Parachain staking',
      icon: User,
      bgColor: convertHexColorToRGBA(theme['yellow-6'], 0.1),
      color: theme['yellow-6'],
      weight: 'bold',
    },
    [YieldPoolType.NATIVE_STAKING]: {
      label: 'Native staking',
      icon: Database,
      bgColor: convertHexColorToRGBA(theme['gold-6'], 0.1),
      color: theme['gold-6'],
      weight: 'fill',
    },
  };
};