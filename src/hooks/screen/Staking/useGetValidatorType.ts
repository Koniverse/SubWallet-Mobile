import { CHAIN_TYPE_MAP } from 'constants/stakingScreen';
import { useMemo } from 'react';
import { ValidatorType } from 'types/staking';

const useGetValidatorType = (networkKey: string): ValidatorType => {
  return useMemo((): ValidatorType => {
    if (CHAIN_TYPE_MAP.astar.includes(networkKey)) {
      return 'DApp';
    } else if (CHAIN_TYPE_MAP.para.includes(networkKey)) {
      return 'Collator';
    } else if (CHAIN_TYPE_MAP.relay.includes(networkKey)) {
      return 'Validator';
    } else {
      return 'Unknown';
    }
  }, [networkKey]);
};

export default useGetValidatorType;
