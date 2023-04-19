import { ExtrinsicDataTypeMap, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { BaseTransactionConfirmationProps } from './Base';
import { RootState } from 'stores/index';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import useGetChainPrefixBySlug from 'hooks/chain/useGetChainPrefixBySlug';
import MetaInfo from 'components/MetaInfo';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { View } from 'react-native';

type Props = BaseTransactionConfirmationProps;

const TransferBlock = ({ transaction }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const data = transaction.data as ExtrinsicDataTypeMap[ExtrinsicType.TRANSFER_BALANCE];
  const xcmData = transaction.data as ExtrinsicDataTypeMap[ExtrinsicType.TRANSFER_XCM];
  const chainInfoMap = useSelector((root: RootState) => root.chainStore.chainInfoMap);
  const assetRegistryMap = useSelector((root: RootState) => root.assetRegistry.assetRegistry);
  const tokenInfo =
    assetRegistryMap[transaction.extrinsicType === ExtrinsicType.TRANSFER_XCM ? xcmData.tokenSlug : data.tokenSlug];

  const chainInfo = useMemo(() => chainInfoMap[transaction.chain], [chainInfoMap, transaction.chain]);

  const { decimals: chainDecimals, symbol: chainSymbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const senderPrefix = useGetChainPrefixBySlug(transaction.chain);

  return (
    <View style={{ paddingHorizontal: theme.size, paddingTop: theme.size }}>
      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.Account address={data.from} label={'Sender'} networkPrefix={senderPrefix} />

        {transaction.extrinsicType === ExtrinsicType.TRANSFER_XCM && chainInfo && (
          <MetaInfo.Chain chain={chainInfo.slug} label={'Sender Network'} />
        )}

        <MetaInfo.Account address={data.to} label={'Recipient'} />

        {transaction.extrinsicType === ExtrinsicType.TRANSFER_XCM && chainInfo && (
          <MetaInfo.Chain chain={xcmData.destinationNetworkKey} label={'Recipient Network'} />
        )}

        {transaction.extrinsicType !== ExtrinsicType.TRANSFER_XCM && chainInfo && (
          <MetaInfo.Chain chain={chainInfo.slug} label={'Network'} />
        )}
      </MetaInfo>

      <MetaInfo hasBackgroundWrapper style={{ marginTop: theme.sizeSM }}>
        <MetaInfo.Number
          decimals={tokenInfo.decimals || 0}
          label={'Amount'}
          suffix={tokenInfo.symbol}
          value={data.value || 0}
        />

        <MetaInfo.Number
          decimals={chainDecimals}
          label={'Estimated fee'}
          suffix={chainSymbol}
          value={transaction.estimateFee?.value || 0}
        />
      </MetaInfo>
    </View>
  );
};

export default TransferBlock;
