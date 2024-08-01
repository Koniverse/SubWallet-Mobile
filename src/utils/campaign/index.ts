import { Icon as _PhosphorIcon } from 'phosphor-react-native';
import * as Phosphor from 'phosphor-react-native';
import { Platform } from 'react-native';
import { getCountry } from 'react-native-localize';
import { AppBasicInfoData } from 'types/staticContent';
import BigN from 'bignumber.js';
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

export const filterCampaignDataFunc = (info: AppBasicInfoData, locations?: string[]) => {
  let isValid = info.platforms.includes('mobile');

  if (info.os) {
    isValid = isValid && info.os.toLowerCase() === Platform.OS;
  }

  if (locations && locations.length) {
    const countryId = getCountry();
    const locationIds = locations.map(item => item.split('_')[1]);
    isValid = isValid && locationIds.includes(countryId);
  }

  return isValid;
};

export const checkComparison = (comparison: string, value: string, comparisonValue: string) => {
  switch (comparison) {
    case 'eq':
      return new BigN(value).eq(comparisonValue);
    case 'gt':
      return new BigN(value).gt(comparisonValue);
    case 'gte':
      return new BigN(value).gte(comparisonValue);
    case 'lt':
      return new BigN(value).lt(comparisonValue);
    case 'lte':
      return new BigN(value).lte(comparisonValue);
    default:
      return true;
  }
};
