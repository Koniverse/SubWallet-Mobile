import React from 'react';
import { View } from 'react-native';
import { BaseTransactionConfirmationProps } from 'screens/Confirmations/Transaction/variants/Base';
import { ExtrinsicDataTypeMap, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import MetaInfo from 'components/MetaInfo';
import useGetChainPrefixBySlug from 'hooks/chain/useGetChainPrefixBySlug';
import i18n from 'utils/i18n/i18n';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

type Props = BaseTransactionConfirmationProps;
//todo: i18n
const SendNftTransactionConfirmation = ({ transaction }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const data = transaction.data as ExtrinsicDataTypeMap[ExtrinsicType.SEND_NFT];
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const networkPrefix = useGetChainPrefixBySlug(transaction.chain);

  return (
    <View style={{ paddingHorizontal: theme.size, paddingTop: theme.size }}>
      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.Account address={data.senderAddress} label={i18n.common.sender} networkPrefix={networkPrefix} />

        <MetaInfo.Account address={data.recipientAddress} label={i18n.common.recipient} />

        <MetaInfo.Chain chain={transaction.chain} label={i18n.common.network} />
      </MetaInfo>

      <MetaInfo hasBackgroundWrapper style={{ marginTop: theme.sizeSM }}>
        {(data.nftItemName || data.nftItem) && (
          <MetaInfo.Default label={'NFT'}>
            {data.nftItemName || data.nftItem.name || `${data.nftItem.collectionId}_${data.nftItem.id}`}
          </MetaInfo.Default>
        )}
        <MetaInfo.Number
          decimals={decimals}
          label={'Estimated fee'}
          suffix={symbol}
          value={transaction.estimateFee?.value || 0}
        />
      </MetaInfo>
    </View>
  );
};

export default SendNftTransactionConfirmation;
