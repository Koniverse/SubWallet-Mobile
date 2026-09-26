import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { RequestAddSubstrateProxyAccount } from '@subwallet/extension-base/types';
import { ConfirmationContent } from 'components/common/Confirmation';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import { Typography } from 'components/design-system-ui';
import MetaInfo from 'components/MetaInfo';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import i18n from 'utils/i18n/i18n';

import { BaseTransactionConfirmationProps } from './Base';

type Props = BaseTransactionConfirmationProps;

const AddSubstrateProxyAccountTransactionConfirmation: React.FC<Props> = ({ transaction }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const data = transaction.data as RequestAddSubstrateProxyAccount;
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);

  return (
    <ConfirmationContent isTransaction transaction={transaction}>
      <CommonTransactionInfo address={transaction.address} network={transaction.chain} />

      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.Account
          address={data.substrateProxyAddress}
          label={i18n.substrateProxy.proxyAccount}
        />

        <MetaInfo.Default label={i18n.substrateProxy.proxyType}>
          <Typography.Text style={styles.proxyType}>{data.substrateProxyType}</Typography.Text>
        </MetaInfo.Default>

        {/* When wrapped, the fee belongs to the wrapping extrinsic and is shown there instead. */}
        {!transaction.wrappingStatus && (
          <MetaInfo.Number
            label={i18n.substrateProxy.networkFee}
            value={transaction.estimateFee?.value || 0}
            decimals={decimals}
            suffix={symbol}
          />
        )}
      </MetaInfo>
    </ConfirmationContent>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    proxyType: {
      ...FontSemiBold,
      color: theme['magenta-6'],
    },
  });
}

export default AddSubstrateProxyAccountTransactionConfirmation;
