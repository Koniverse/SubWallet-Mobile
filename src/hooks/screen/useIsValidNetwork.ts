import useShowedNetworks from 'hooks/screen/useShowedNetworks';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

const useIsValidNetwork = (networkKey?: string): [boolean, string] => {
  const currentAccountAddress = useSelector((state: RootState) => state.accountState.currentAccountAddress);
  const accounts = useSelector((state: RootState) => state.accountState.accounts);

  const showedNetwork = useShowedNetworks(currentAccountAddress, accounts);

  return useMemo(
    (): [boolean, string] => [networkKey ? showedNetwork.includes(networkKey) : true, showedNetwork.join('___')],
    [networkKey, showedNetwork],
  );
};

export default useIsValidNetwork;
