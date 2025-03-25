import React from 'react';
import MetaInfo from 'components/MetaInfo';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import useGetChainPrefixBySlug from 'hooks/chain/useGetChainPrefixBySlug';
import i18n from 'utils/i18n/i18n';

interface Props {
  address: string;
  network: string;
  onlyReturnInnerContent?: boolean;
}

export const CommonTransactionInfo = ({ address, network, onlyReturnInnerContent }: Props) => {
  const account = useGetAccountByAddress(address);
  const networkPrefix = useGetChainPrefixBySlug(network);

  const innerContent = (
    <>
      <MetaInfo.Account
        address={account?.address || address}
        label={i18n.inputLabel.accountName}
        name={account?.name}
        networkPrefix={networkPrefix}
      />
      <MetaInfo.Chain chain={network} label={i18n.inputLabel.network} />
    </>
  );

  if (onlyReturnInnerContent) {
    return innerContent;
  }

  return (
    <>
      <MetaInfo hasBackgroundWrapper>{innerContent}</MetaInfo>
    </>
  );
};
