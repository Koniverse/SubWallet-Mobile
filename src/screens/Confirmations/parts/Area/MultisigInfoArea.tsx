import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { InfoIcon } from 'phosphor-react-native';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';
import { PendingMultisigTxRequest } from '@subwallet/extension-base/types/multisig';
import { Icon, SwModal, Typography } from 'components/design-system-ui';
import MetaInfo from 'components/MetaInfo';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import { decodeTransferAmount, decodeTransferRecipient } from 'utils/transaction/decode';
import i18n from 'utils/i18n/i18n';
import { toShort } from 'utils/index';

interface Props {
  transaction: SWTransactionResult;
}

/** Summary of a multisig approve / execute / cancel extrinsic on the confirmation screen. */
const MultisigInfoArea = ({ transaction }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const transactionData = transaction.data as PendingMultisigTxRequest;
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const [callDataModalVisible, setCallDataModalVisible] = useState(false);
  const onCloseCallDataModal = useCallback(() => setCallDataModalVisible(false), []);

  const descriptionContent = useMemo(() => {
    if (transaction.extrinsicType === ExtrinsicType.MULTISIG_EXECUTE_TX) {
      return i18n.multisig.executionDescription;
    }

    if (transaction.extrinsicType === ExtrinsicType.MULTISIG_CANCEL_TX) {
      return i18n.multisig.cancelDescription;
    }

    return null;
  }, [transaction.extrinsicType]);

  // Recipient/amount are only decodable for plain balance transfers.
  const recipientAddress = useMemo(
    () => decodeTransferRecipient(transactionData?.decodedCallData),
    [transactionData?.decodedCallData],
  );

  const transferAmount = useMemo(
    () => decodeTransferAmount(transactionData?.decodedCallData),
    [transactionData?.decodedCallData],
  );

  return (
    <View style={styles.container}>
      {!!recipientAddress && !!transferAmount && (
        <MetaInfo hasBackgroundWrapper>
          <MetaInfo.Account address={recipientAddress} label={i18n.multisig.recipient} />
          <MetaInfo.Number
            label={i18n.multisig.amount}
            value={transferAmount}
            decimals={decimals}
            suffix={symbol}
          />
        </MetaInfo>
      )}

      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.Account address={transaction.address} label={i18n.multisig.signatory} />

        {/* When wrapped, fee and call data belong to the wrapping extrinsic instead. */}
        {!transaction.wrappingStatus && (
          <>
            <MetaInfo.Number
              label={i18n.multisig.networkFee}
              value={transaction.estimateFee?.value || 0}
              decimals={decimals}
              suffix={symbol}
            />

            <MetaInfo.Default label={i18n.multisig.callData}>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.callDataValue}
                onPress={() => setCallDataModalVisible(true)}>
                <Typography.Text style={styles.callDataText}>{toShort(transactionData.call, 5, 5)}</Typography.Text>
                <Icon phosphorIcon={InfoIcon} customSize={18} iconColor={theme.colorTextLight4} />
              </TouchableOpacity>
            </MetaInfo.Default>
          </>
        )}
      </MetaInfo>

      {!transaction.wrappingStatus && !!descriptionContent && (
        <Typography.Text style={styles.description}>{descriptionContent}</Typography.Text>
      )}

      <SwModal
        modalVisible={callDataModalVisible}
        setVisible={setCallDataModalVisible}
        onChangeModalVisible={onCloseCallDataModal}
        onBackButtonPress={onCloseCallDataModal}
        modalTitle={i18n.multisig.transactionDetails}
        titleTextAlign={'center'}
        isUseForceHidden={false}>
        <ScrollView style={styles.callDataDetail} showsVerticalScrollIndicator={false}>
          <Typography.Text style={styles.callDataDetailText}>
            {JSON.stringify(transactionData.decodedCallData || '', null, 2)}
          </Typography.Text>
        </ScrollView>
      </SwModal>
    </View>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      gap: theme.sizeXS,
    },
    callDataValue: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXXS,
    },
    callDataText: {
      ...FontSemiBold,
      color: theme.colorTextLight1,
    },
    description: {
      ...FontMedium,
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      color: theme.colorTextLight4,
    },
    callDataDetail: {
      width: '100%',
      maxHeight: 264,
      borderRadius: theme.borderRadiusLG,
      backgroundColor: theme.colorBgSecondary,
      padding: theme.paddingSM,
      marginVertical: theme.margin,
    },
    callDataDetailText: {
      color: theme.colorTextTertiary,
      fontSize: theme.fontSizeLG - 1,
    },
  });
}

export default MultisigInfoArea;
