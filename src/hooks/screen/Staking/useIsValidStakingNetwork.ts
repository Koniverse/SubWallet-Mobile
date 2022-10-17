import useShowedNetworks from 'hooks/screen/useShowedNetworks';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

const useIsValidStakingNetwork = (networkKey: string): boolean => {
  const currentAccountAddress = useSelector((state: RootState) => state.accounts.currentAccountAddress);
  const accounts = useSelector((state: RootState) => state.accounts.accounts);

  const showedNetwork = useShowedNetworks(currentAccountAddress, accounts);

  return useMemo((): boolean => showedNetwork.includes(networkKey), [networkKey, showedNetwork]);
};

export default useIsValidStakingNetwork;
