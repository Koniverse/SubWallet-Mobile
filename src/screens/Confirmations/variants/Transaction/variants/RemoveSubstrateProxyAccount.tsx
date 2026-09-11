import React, { useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { InfoIcon } from 'phosphor-react-native';
import { RequestRemoveSubstrateProxyAccount } from '@subwallet/extension-base/types';
import { ConfirmationContent } from 'components/common/Confirmation';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import { Icon, Typography } from 'components/design-system-ui';
import MetaInfo from 'components/MetaInfo';
import { SubstrateProxyAccountListModal } from 'components/Modal/SubstrateProxyAccount';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import i18n from 'utils/i18n/i18n';

import { BaseTransactionConfirmationProps } from './Base';

type Props = BaseTransactionConfirmationProps;

const RemoveSubstrateProxyAccountTransactionConfirmation: React.FC<Props> = ({ transaction }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const data = transaction.data as RequestRemoveSubstrateProxyAccount;
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const [listModalVisible, setListModalVisible] = useState(false);

  const substrateProxyAccounts = useMemo(
    () => data.selectedSubstrateProxyAccounts,
    [data.selectedSubstrateProxyAccounts],
  );

  return (
    <ConfirmationContent isTransaction transaction={transaction}>
      <CommonTransactionInfo address={transaction.address} network={transaction.chain} />

      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.Default label={i18n.substrateProxy.proxyList}>
          <TouchableOpacity activeOpacity={1} style={styles.countValue} onPress={() => setListModalVisible(true)}>
            <Typography.Text style={styles.countText}>
              {`${substrateProxyAccounts.length} ${
                substrateProxyAccounts.length === 1
                  ? i18n.substrateProxy.numberAccount
                  : i18n.substrateProxy.numberAccounts
              }`}
            </Typography.Text>
            <Icon phosphorIcon={InfoIcon} customSize={20} weight={'bold'} iconColor={theme.colorTextLight4} />
          </TouchableOpacity>
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

      <SubstrateProxyAccountListModal
        substrateProxyAccounts={substrateProxyAccounts}
        modalVisible={listModalVisible}
        setModalVisible={setListModalVisible}
        isUseForceHidden={false}
      />
    </ConfirmationContent>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    countValue: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXXS,
    },
    countText: {
      ...FontSemiBold,
      color: theme.colorTextLight1,
    },
  });
}

export default RemoveSubstrateProxyAccountTransactionConfirmation;
