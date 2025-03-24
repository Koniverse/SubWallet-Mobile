import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { YieldPoolType } from '@subwallet/extension-base/types';
import { CirclesThreePlus, Database, HandsClapping, Leaf, User, Users } from 'phosphor-react-native';
import { ThemeTypes } from 'styles/themes';
import { EarningTagType } from 'types/earning';
import { convertHexColorToRGBA } from 'utils/color';
import { ValidatorInfo } from '@subwallet/extension-base/types/yield/info/chain/target';
import { shuffle } from 'utils/common';

export const createEarningTypeTags = (theme: ThemeTypes, chain: string): Record<YieldPoolType, EarningTagType> => {
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
      label: _STAKING_CHAIN_GROUP.astar.includes(chain) ? 'dApp staking' : 'Direct nomination',
      icon: Database,
      bgColor: convertHexColorToRGBA(theme['gold-6'], 0.1),
      color: theme['gold-6'],
      weight: 'fill',
    },
    ['SUBNET_STAKING']: {
      label: 'Subnet staking',
      icon: CirclesThreePlus,
      color: 'blue',
      weight: 'fill',
    },
  };
};

export function isRelatedToAstar(slug: string) {
  return [
    'ASTR___native_staking___astar',
    'SDN___native_staking___shiden',
    'SBY___native_staking___shibuya',
    'SDN-Shiden',
    'ASTR-Astar',
    'shibuya-NATIVE-SBY',
  ].includes(slug);
}

export function autoSelectValidatorOptimally(
  validators: ValidatorInfo[],
  maxCount = 1,
  simple = false,
  preSelectValidators?: string,
): ValidatorInfo[] {
  if (!validators.length) {
    return [];
  }

  const preSelectValidatorAddresses = preSelectValidators ? preSelectValidators.split(',') : [];

  const result: ValidatorInfo[] = [];
  const notPreSelected: ValidatorInfo[] = [];

  for (const v of validators) {
    if (preSelectValidatorAddresses.includes(v.address)) {
      result.push(v);
    } else {
      notPreSelected.push(v);
    }
  }

  if (result.length >= maxCount) {
    shuffle<ValidatorInfo>(result);

    return result.slice(0, maxCount);
  }

  shuffle<ValidatorInfo>(notPreSelected);

  for (const v of notPreSelected) {
    if (result.length === maxCount) {
      break;
    }

    if (v.commission !== 100 && !v.blocked && (!simple ? v.identity && v.topQuartile : true)) {
      result.push(v);
    }
  }

  return result;
}

export const getEarningTimeText = (hours?: number) => {
  if (hours !== undefined) {
    const isDay = hours > 24;
    const isHour = hours >= 1 && !isDay;

    let time, unit;

    if (isDay) {
      time = Math.floor(hours / 24);
      unit = time > 1 ? 'days' : 'day';
    } else if (isHour) {
      time = hours;
      unit = time > 1 ? 'hours' : 'hour';
    } else {
      time = hours * 60;
      unit = time > 1 ? 'minutes' : 'minute';
    }

    return [time, unit].join(' ');
  } else {
    return 'unknown time';
  }
};
