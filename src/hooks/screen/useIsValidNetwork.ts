import { useMemo } from 'react';
import { useGetChainSlugs } from 'hooks/screen/Home/useGetChainSlugs';

const useIsValidNetwork = (networkKey?: string): [boolean, string] => {
  const showedNetwork = useGetChainSlugs();

  return useMemo(
    (): [boolean, string] => [networkKey ? showedNetwork.includes(networkKey) : true, showedNetwork.join('___')],
    [networkKey, showedNetwork],
  );
};

export default useIsValidNetwork;
