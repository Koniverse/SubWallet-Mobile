import { useMemo } from 'react';
import { useGetChainSlugsByAccount } from 'hooks/useGetChainSlugsByAccount';

const useIsValidNetwork = (networkKey?: string): [boolean, string] => {
  const showedNetwork = useGetChainSlugsByAccount();

  return useMemo(
    (): [boolean, string] => [networkKey ? showedNetwork.includes(networkKey) : true, showedNetwork.join('___')],
    [networkKey, showedNetwork],
  );
};

export default useIsValidNetwork;
