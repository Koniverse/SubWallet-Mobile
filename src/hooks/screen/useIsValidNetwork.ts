import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useGetChainSlugs } from 'hooks/screen/Home/useGetChainSlugs';

const useIsValidNetwork = (networkKey?: string): [boolean, string] => {
  const currentAccount = useSelector((state: RootState) => state.accountState.currentAccount);

  const showedNetwork = useGetChainSlugs(currentAccount?.address);

  return useMemo(
    (): [boolean, string] => [networkKey ? showedNetwork.includes(networkKey) : true, showedNetwork.join('___')],
    [networkKey, showedNetwork],
  );
};

export default useIsValidNetwork;
