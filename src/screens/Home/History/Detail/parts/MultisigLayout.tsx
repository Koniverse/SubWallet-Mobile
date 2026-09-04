import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useSelector } from 'react-redux';
import { CheckCircleIcon, CopyIcon, InfoIcon } from 'phosphor-react-native';
import { ExtrinsicStatus } from '@subwallet/extension-base/background/KoniTypes';
import { MultisigTxType, PendingMultisigTx } from '@subwallet/extension-base/services/multisig-service';
import { reformatAddress } from '@subwallet/extension-base/utils';
import { Icon, SwModal, Typography } from 'components/design-system-ui';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';
import MetaInfo from 'components/MetaInfo';
import { MULTISIG_TX_TYPE_NAME_MAP } from 'constants/multisig';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useToast } from 'react-native-toast-notifications';
import { HistoryStatusMap } from 'screens/Home/History/shared';
import { RootState } from 'stores/index';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import { formatHistoryDate } from 'utils/customFormatDate';
import i18n from 'utils/i18n/i18n';
import { toShort } from 'utils/index';
import HistoryMultisigHeader from 'screens/Home/History/Detail/parts/MultisigHeader';

import { hexAddPrefix, isHex } from '@polkadot/util';

interface Props {
  data: PendingMultisigTx;
}

export const HistoryMultisigLayout = ({ data }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const toast = useToast();

  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const accountProxies = useSelector((state: RootState) => state.accountState.accountProxies);
  const language = useSelector((state: RootState) => state.settings.language);
  const [callDataModalVisible, setCallDataModalVisible] = useState(false);
  const onCloseCallDataModal = useCallback(() => setCallDataModalVisible(false), []);

  // Signatories are plain addresses; match them against every account this wallet holds
  // so known signatories can be shown by name and avatar.
  const getAccountInfo = useCallback(
    (address: string) => {
      const reformatted = reformatAddress(address);

      for (const proxy of accountProxies) {
        const found = proxy.accounts.find(acc => reformatAddress(acc.address) === reformatted);

        if (found) {
          return found;
        }
      }

      return undefined;
    },
    [accountProxies],
  );

  const chainInfo = chainInfoMap[data.chain];

  const extrinsicHash = useMemo(() => {
    if (!data?.extrinsicHash) {
      return '...';
    }

    return isHex(hexAddPrefix(data.extrinsicHash)) ? toShort(data.extrinsicHash, 8, 9) : '...';
  }, [data?.extrinsicHash]);

  const callData = useMemo(() => (data?.callData ? toShort(data.callData, 8, 9) : null), [data?.callData]);

  // Initiator first, then already-approved signatories, then the rest.
  const sortedSigners = useMemo(() => {
    if (!data?.signerAddresses) {
      return [];
    }

    return [...data.signerAddresses].sort((a, b) => {
      const isInitiatorA = a === data.depositor;
      const isInitiatorB = b === data.depositor;

      if (isInitiatorA !== isInitiatorB) {
        return isInitiatorA ? -1 : 1;
      }

      const isApprovedA = data.approvals.includes(a);
      const isApprovedB = data.approvals.includes(b);

      if (isApprovedA !== isApprovedB) {
        return isApprovedA ? -1 : 1;
      }

      return 0;
    });
  }, [data]);

  const onCopyExtrinsicHash = useCallback(() => {
    Clipboard.setString(data?.extrinsicHash || '');
    toast.show(i18n.substrateProxy.copiedToClipboard, { type: 'success' });
  }, [data?.extrinsicHash, toast]);

  const historyStatusMap = HistoryStatusMap();
  const processingStatus = historyStatusMap[ExtrinsicStatus.PROCESSING];

  return (
    <View style={styles.container}>
      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.DisplayType
          label={i18n.multisig.type}
          typeName={MULTISIG_TX_TYPE_NAME_MAP()[data?.multisigTxType || MultisigTxType.UNKNOWN]}
        />

        <HistoryMultisigHeader data={data} />

        <MetaInfo.Status
          label={i18n.multisig.status}
          statusIcon={processingStatus.icon}
          statusName={processingStatus.name}
          valueColorSchema={processingStatus.schema}
        />

        <MetaInfo.Default label={i18n.multisig.extrinsicHash}>
          <TouchableOpacity activeOpacity={1} style={styles.inlineValue} onPress={onCopyExtrinsicHash}>
            <Typography.Text style={styles.valueText}>{toShort(extrinsicHash || '', 5, 5)}</Typography.Text>
            <Icon phosphorIcon={CopyIcon} customSize={18} iconColor={theme.colorTextLight4} />
          </TouchableOpacity>
        </MetaInfo.Default>

        {!!data.callData && (
          <MetaInfo.Default label={i18n.multisig.callData}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.inlineValue}
              onPress={() => setCallDataModalVisible(true)}>
              <Typography.Text style={styles.valueText}>{toShort(callData || '', 5, 5)}</Typography.Text>
              <Icon phosphorIcon={InfoIcon} customSize={18} iconColor={theme.colorTextLight4} />
            </TouchableOpacity>
          </MetaInfo.Default>
        )}

        {!!data.timestamp && (
          <MetaInfo.Default label={i18n.multisig.submittedTime}>
            <Typography.Text style={styles.valueText}>
              {formatHistoryDate(data.timestamp, language, 'detail')}
            </Typography.Text>
          </MetaInfo.Default>
        )}

        {!!data.depositAmount && (
          <MetaInfo.Number
            label={i18n.multisig.multisigDeposit}
            value={data.depositAmount}
            decimals={chainInfo?.substrateInfo?.decimals || 0}
            suffix={chainInfo?.substrateInfo?.symbol || ''}
          />
        )}
      </MetaInfo>

      <View style={styles.signatoriesContainer}>
        <View style={styles.signatoriesLabelRow}>
          <Typography.Text style={styles.signatoriesLabel}>{i18n.multisig.signatoriesLabel}</Typography.Text>
          <Typography.Text style={styles.signatoriesThreshold}>
            {i18n.formatString(i18n.multisig.approvalThreshold, data.threshold, data.signerAddresses.length)}
          </Typography.Text>
        </View>

        <View style={styles.signatoryList}>
          {sortedSigners.map(signer => {
            const isCurrentSigner = data.currentSigner === signer;
            const isApproved = data.approvals.includes(signer);
            const isInitiator = signer === data.depositor;
            const accountInfo = getAccountInfo(signer);

            return (
              <View key={signer} style={styles.signatoryItem}>
                <View style={styles.signatoryLeft}>
                  <AccountProxyAvatar size={24} value={accountInfo?.proxyId || signer} />
                  <Typography.Text ellipsis style={styles.signatoryName}>
                    {accountInfo?.name || toShort(signer, 8, 9)}
                  </Typography.Text>
                  {isCurrentSigner && (
                    <Icon phosphorIcon={CheckCircleIcon} size={'sm'} weight={'fill'} iconColor={theme.colorSuccess} />
                  )}
                </View>

                <Typography.Text
                  style={[
                    styles.signerStatus,
                    isInitiator ? styles.initiatorTag : isApproved ? styles.approvedTag : styles.waitingTag,
                  ]}>
                  {isInitiator
                    ? i18n.multisig.initiator
                    : isApproved
                    ? i18n.multisig.approved
                    : i18n.multisig.waitingForApproval}
                </Typography.Text>
              </View>
            );
          })}
        </View>
      </View>

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
            {JSON.stringify(data.decodedCallData || '', null, 2)}
          </Typography.Text>
        </ScrollView>
      </SwModal>
    </View>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      gap: theme.size,
    },
    inlineValue: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXXS,
    },
    valueText: {
      ...FontSemiBold,
      color: theme.colorTextLight1,
    },
    signatoriesContainer: {
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      padding: theme.paddingSM,
      gap: theme.sizeXS,
    },
    signatoriesLabelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    signatoriesLabel: {
      ...FontSemiBold,
      color: theme.colorTextLight1,
    },
    signatoriesThreshold: {
      ...FontMedium,
      color: theme.colorTextTertiary,
      fontSize: theme.fontSizeSM,
    },
    signatoryList: {
      gap: theme.sizeXS,
    },
    signatoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.sizeXS,
    },
    signatoryLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXS,
      flexShrink: 1,
    },
    signatoryName: {
      ...FontMedium,
      color: theme.colorTextLight1,
      flexShrink: 1,
    },
    signerStatus: {
      ...FontMedium,
      fontSize: theme.fontSizeSM,
    },
    initiatorTag: {
      ...FontSemiBold,
      color: theme.colorSuccess,
    },
    approvedTag: {
      color: theme.colorSuccess,
    },
    waitingTag: {
      color: theme.colorWarning,
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

export default HistoryMultisigLayout;
