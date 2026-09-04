import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { InfoIcon } from 'phosphor-react-native';
import { ExtrinsicDataTypeMap, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { DecodeCallDataResponse } from '@subwallet/extension-base/services/multisig-service/utils';
import { PendingMultisigTxRequest } from '@subwallet/extension-base/types/multisig';
import { Icon, SwModal, Typography } from 'components/design-system-ui';
import MetaInfo from 'components/MetaInfo';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';
import { TransactionHistoryDisplayItem } from 'types/history';
import i18n from 'utils/i18n/i18n';
import { toShort } from 'utils/index';
import { FontSemiBold } from 'styles/sharedStyles';
import { isTypeMultisig } from 'utils/transaction/detectType';

interface Props {
  data: TransactionHistoryDisplayItem;
}

const HistoryDetailCallData: React.FC<Props> = ({ data }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [callDataModalVisible, setCallDataModalVisible] = useState(false);
  const onOpenCallDataModal = useCallback(() => setCallDataModalVisible(true), []);
  const onCloseCallDataModal = useCallback(() => setCallDataModalVisible(false), []);

  const { callData, decodedCallData } = useMemo<{
    callData: string;
    decodedCallData: DecodeCallDataResponse | undefined;
  }>(() => {
    switch (data.type) {
      case ExtrinsicType.MULTISIG_INIT_TX: {
        return { ...(data.additionalInfo as ExtrinsicDataTypeMap[ExtrinsicType.MULTISIG_INIT_TX]) };
      }

      case ExtrinsicType.MULTISIG_APPROVE_TX:
      case ExtrinsicType.MULTISIG_EXECUTE_TX:
      case ExtrinsicType.MULTISIG_CANCEL_TX: {
        const additionalInfo = data.additionalInfo as PendingMultisigTxRequest;

        return {
          callData: additionalInfo.call,
          decodedCallData: additionalInfo.decodedCallData,
        };
      }

      default:
        return { callData: '', decodedCallData: undefined };
    }
  }, [data.additionalInfo, data.type]);

  if (!isTypeMultisig(data.type) || !decodedCallData || !callData) {
    return null;
  }

  return (
    <>
      <MetaInfo.Default label={i18n.multisig.callData}>
        <TouchableOpacity activeOpacity={1} style={styles.inlineValue} onPress={onOpenCallDataModal}>
          <Typography.Text style={styles.valueText}>{toShort(callData, 6, 6)}</Typography.Text>
          <Icon phosphorIcon={InfoIcon} customSize={18} iconColor={theme.colorTextLight4} />
        </TouchableOpacity>
      </MetaInfo.Default>

      <SwModal
        modalVisible={callDataModalVisible}
        setVisible={setCallDataModalVisible}
        onChangeModalVisible={onCloseCallDataModal}
        onBackButtonPress={onCloseCallDataModal}
        modalTitle={i18n.multisig.transactionDetails}
        titleTextAlign={'center'}
        isUseForceHidden={true}>
        <ScrollView style={styles.callDataDetail} showsVerticalScrollIndicator={false}>
          <Typography.Text style={styles.callDataDetailText}>
            {JSON.stringify(decodedCallData || '', null, 2)}
          </Typography.Text>
        </ScrollView>
      </SwModal>
    </>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    inlineValue: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXXS,
    },
    valueText: {
      ...FontSemiBold,
      color: theme.colorTextLight1,
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

export default HistoryDetailCallData;
