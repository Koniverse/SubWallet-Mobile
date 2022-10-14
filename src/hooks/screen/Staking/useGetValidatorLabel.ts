import useGetValidatorType from 'hooks/screen/Staking/useGetValidatorType';
import { useMemo } from 'react';
import i18n from 'utils/i18n/i18n';

const useGetValidatorLabel = (networkKey: string): string => {
  const validatorType = useGetValidatorType(networkKey);

  return useMemo((): string => {
    switch (validatorType) {
      case 'Collator':
        return i18n.common.collator;
      case 'DApp':
        return i18n.common.dApp;
      case 'Validator':
      case 'Unknown':
      default:
        return i18n.common.validator;
    }
  }, [validatorType]);
};

export default useGetValidatorLabel;
