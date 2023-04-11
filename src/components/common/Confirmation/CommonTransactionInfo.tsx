import React from 'react';
import MetaInfo from 'components/MetaInfo';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import useGetChainPrefixBySlug from 'hooks/chain/useGetChainPrefixBySlug';
import { toShort } from 'utils/index';

interface Props {
  address: string;
  network: string;
}

export const CommonTransactionInfo = ({ address, network }: Props) => {
  const account = useGetAccountByAddress(address);
  const networkPrefix = useGetChainPrefixBySlug(network);

  return (
    <>
      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.Account
          address={account?.address || address}
          label={'Wallet name'}
          name={account?.name}
          networkPrefix={networkPrefix}
        />
        <MetaInfo.Default label={'Address'} valueAlign={'right'}>
          {toShort(address)}
        </MetaInfo.Default>

        <MetaInfo.Chain chain={network} label={'Network'} />
      </MetaInfo>
    </>
  );
};
