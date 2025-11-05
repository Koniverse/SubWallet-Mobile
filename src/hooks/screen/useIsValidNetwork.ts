import { useMemo } from 'react';
import useGetChainSlugsByCurrentAccountProxy from 'hooks/chain/useGetChainSlugsByCurrentAccountProxy';

const useIsValidNetwork = (networkKey?: string): [boolean, string] => {
  const showedNetwork = useGetChainSlugsByCurrentAccountProxy();

  return useMemo(
    (): [boolean, string] => [networkKey ? showedNetwork.includes(networkKey) : true, showedNetwork.join('___')],
    [networkKey, showedNetwork],
  );
};

export default useIsValidNetwork;
