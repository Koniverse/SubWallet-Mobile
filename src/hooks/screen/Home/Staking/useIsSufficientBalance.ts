import { APIItemState } from '@subwallet/extension-base/background/KoniTypes';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

const useIsSufficientBalance = (networkKey: string, minBond: number | undefined): boolean => {
  const balanceMap = useSelector((state: RootState) => state.balance.details);
  const network = useGetNetworkJson(networkKey);

  return useMemo((): boolean => {
    if (minBond === undefined) {
      return false;
    }

    let result = false;

    for (const [_networkKey, balanceObj] of Object.entries(balanceMap)) {
      if (_networkKey === networkKey) {
        if (balanceObj.state !== APIItemState.READY) {
          break;
        } else {
          const freeBalance =
            (parseFloat(balanceObj.free || '0') - parseFloat(balanceObj.miscFrozen || '0')) /
            10 ** (network.decimals as number);

          if (freeBalance > minBond) {
            result = true;
          }
        }

        break;
      }
    }

    return result;
  }, [balanceMap, minBond, network.decimals, networkKey]);
};

export default useIsSufficientBalance;
