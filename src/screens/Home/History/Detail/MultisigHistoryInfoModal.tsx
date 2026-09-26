import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { ArrowCircleUpRightIcon } from 'phosphor-react-native';
import { ExtrinsicStatus, ExtrinsicType, NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { MultisigTxType, PendingMultisigTx } from '@subwallet/extension-base/services/multisig-service';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { getExplorerLink } from '@subwallet/extension-base/services/transaction-service/utils';
import { AccountProxyType } from '@subwallet/extension-base/types';
import {
  ApprovePendingTxRequest,
  CancelPendingTxRequest,
  ExecutePendingTxRequest,
} from '@subwallet/extension-base/types/multisig';
import { reformatAddress } from '@subwallet/extension-base/utils';
import { Button, Icon, SwModal } from 'components/design-system-ui';
import { deviceHeight } from 'constants/index';
import { MULTISIG_TX_TITLE_MAP } from 'constants/multisig';
import { useGetBalance } from 'hooks/balance';
import usePreCheckAction from 'hooks/account/usePreCheckAction';
import useChainChecker from 'hooks/chain/useChainChecker';
import useGetAccountProxyById from 'hooks/account/useGetAccountProxyById';
import useAlertModal from 'hooks/modal/useAlertModal';
import useHandleSubmitTransaction from 'hooks/transaction/useHandleSubmitTransaction';
import { _ChainConnectionStatus } from '@subwallet/extension-base/services/chain-service/types';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { approvePendingTx, cancelPendingTx, executePendingTx } from 'messaging/transaction/multisig';
import HistoryMultisigLayout from 'screens/Home/History/Detail/parts/MultisigLayout';
import { RootState } from 'stores/index';
import { ThemeTypes } from 'styles/themes';
import { TransactionHistoryDisplayItem } from 'types/history';
import { findAccountByAddress } from 'utils/account/account';
import i18n from 'utils/i18n/i18n';
import { noop } from 'utils/function';

const POLKADOT_JS_APPS_URL = 'https://polkadot.js.org/apps/';

interface Props {
  data: PendingMultisigTx;
  historyList?: TransactionHistoryDisplayItem[];
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  onCancel: () => void;
}

export const MultisigHistoryInfoModal = ({
  data,
  historyList = [],
  modalVisible,
  onCancel,
  setModalVisible,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { closeAlert, openAlert } = useAlertModal();

  const { chainInfoMap, chainStatusMap } = useSelector((state: RootState) => state.chainStore);
  const accounts = useSelector((state: RootState) => state.accountState.accounts);

  const [loading, setLoading] = useState(false);

  const checkAction = usePreCheckAction(data?.currentSigner, true, undefined, data?.chain);
  // Submitting queues a signing confirmation, so nothing extra is needed on success.
  const { onError, onSuccess } = useHandleSubmitTransaction(noop, noop);
  const { error, isLoading: isBalanceLoading } = useGetBalance(data.chain, data.currentSigner);
  const { turnOnChain, checkChainConnected } = useChainChecker();

  const signerAccount = useMemo(() => findAccountByAddress(accounts, data.currentSigner), [accounts, data.currentSigner]);
  const signerAccountProxy = useGetAccountProxyById(signerAccount?.proxyId);
  const originChainInfo = chainInfoMap[data.chain];

  // Block a second submission while this signatory already has an in-flight action for
  // the same call hash.
  const isMultisigProcessing = useMemo(() => {
    if (!data || !historyList.length) {
      return false;
    }

    return historyList.some(tx => {
      const isProcessing =
        tx.status === ExtrinsicStatus.PROCESSING ||
        tx.status === ExtrinsicStatus.SUBMITTING ||
        tx.status === ExtrinsicStatus.QUEUED;

      if (!isProcessing) {
        return false;
      }

      const isMultisigAction =
        tx.type === ExtrinsicType.MULTISIG_APPROVE_TX ||
        tx.type === ExtrinsicType.MULTISIG_EXECUTE_TX ||
        tx.type === ExtrinsicType.MULTISIG_CANCEL_TX;

      if (!isMultisigAction) {
        return false;
      }

      const txCallHash = (tx.additionalInfo as { callHash?: string })?.callHash;

      return txCallHash === data.callHash && reformatAddress(tx.address) === reformatAddress(data.currentSigner);
    });
  }, [data, historyList]);

  const multisigMetadata = useMemo(
    () => ({
      multisigAddress: data.multisigAddress,
      threshold: data.threshold,
      signers: data?.signerAddresses || [],
    }),
    [data.multisigAddress, data.threshold, data?.signerAddresses],
  );

  const timepoint = useMemo(
    () => ({ height: data?.blockHeight, index: data?.extrinsicIndex }),
    [data?.blockHeight, data?.extrinsicIndex],
  );

  const onReject = useCallback(() => {
    const request: CancelPendingTxRequest = {
      address: data?.currentSigner,
      chain: data?.chain,
      multisigMetadata,
      timepoint,
      type: data?.multisigTxType,
      call: data?.callData || '',
      decodedCallData: data.decodedCallData,
      callHash: data?.callHash,
    };

    return cancelPendingTx(request);
  }, [data, multisigMetadata, timepoint]);

  const onApprove = useCallback(() => {
    const request: ApprovePendingTxRequest = {
      address: data?.currentSigner,
      chain: data?.chain,
      multisigMetadata,
      decodedCallData: data.decodedCallData,
      call: data?.callData || '',
      callHash: data?.callHash || '',
      timepoint,
      type: data?.multisigTxType,
    };

    return approvePendingTx(request);
  }, [data, multisigMetadata, timepoint]);

  const onExecute = useCallback(() => {
    const request: ExecutePendingTxRequest = {
      address: data?.currentSigner,
      chain: data?.chain,
      multisigMetadata,
      timepoint,
      decodedCallData: data.decodedCallData,
      callHash: data?.callHash || '',
      call: data?.callData || '',
      type: data?.multisigTxType,
    };

    return executePendingTx(request);
  }, [data, multisigMetadata, timepoint]);

  const handleAction = useCallback(
    async (action: () => Promise<SWTransactionResponse>) => {
      try {
        setLoading(true);

        const result = await action();

        if (result) {
          onSuccess(result);
          onCancel();
        }
      } catch (e) {
        onError(e as Error);
      } finally {
        setLoading(false);
      }
    },
    [onCancel, onError, onSuccess],
  );

  /**
   * A multisig account nested inside another multisig cannot be signed for in the app —
   * warn and point at Polkadot{.js} instead of failing later in the flow.
   */
  const validateSignerAndExecute = useCallback(
    (action: () => void) => () => {
      if (signerAccountProxy?.accountType === AccountProxyType.MULTISIG) {
        openAlert({
          type: NotificationType.ERROR,
          title: i18n.multisig.unableToSign,
          content: i18n.multisig.selectedSignatoryIsMultisigWarning,
          okButton: {
            text: i18n.multisig.goToPolkadotJs,
            onPress: () => {
              Linking.openURL(POLKADOT_JS_APPS_URL).catch(console.error);
              closeAlert();
              onCancel();
            },
          },
          cancelButton: {
            text: i18n.multisig.dismiss,
            onPress: () => {
              closeAlert();
              onCancel();
            },
          },
        });

        return;
      }

      action();
    },
    [closeAlert, onCancel, openAlert, signerAccountProxy?.accountType],
  );

  const _onReject = useCallback(() => {
    handleAction(onReject).catch(console.error);
  }, [handleAction, onReject]);
  const _onApprove = useCallback(() => {
    handleAction(onApprove).catch(console.error);
  }, [handleAction, onApprove]);
  const _onExecute = useCallback(() => {
    handleAction(onExecute).catch(console.error);
  }, [handleAction, onExecute]);

  const explorerLink = useMemo(() => {
    if (!data.extrinsicHash) {
      return '';
    }

    return getExplorerLink(originChainInfo, data.extrinsicHash, 'tx') || '';
  }, [data.extrinsicHash, originChainInfo]);

  const actionButtons = useMemo(() => {
    const currentSigner = reformatAddress(data?.currentSigner);
    const formattedApprovals = (data?.approvals || []).map(address => reformatAddress(address));
    const isInitiator = reformatAddress(data.depositor) === currentSigner;
    const isApproved = formattedApprovals.includes(currentSigner);
    const approvalCount = data.approvals.length;
    const thresholdReached = approvalCount >= data.threshold;
    // Approving as the last missing signatory both approves and executes in one call.
    const isLastSigner = approvalCount + 1 === data.threshold;
    const buttonLoading = loading || isBalanceLoading || isMultisigProcessing;
    const buttonDisabled = buttonLoading || !!error;

    if (isInitiator) {
      return (
        <>
          <Button
            block
            style={styles.actionButton}
            type={'danger'}
            disabled={buttonDisabled}
            loading={buttonLoading}
            onPress={validateSignerAndExecute(checkAction(_onReject, ExtrinsicType.MULTISIG_CANCEL_TX))}>
            {i18n.multisig.reject}
          </Button>
          {thresholdReached && (
            <Button
              block
              style={styles.actionButton}
              disabled={buttonDisabled}
              loading={buttonLoading}
              onPress={validateSignerAndExecute(checkAction(_onExecute, ExtrinsicType.MULTISIG_EXECUTE_TX))}>
              {i18n.multisig.execute}
            </Button>
          )}
        </>
      );
    }

    if (thresholdReached) {
      return (
        <Button
          block
          style={styles.actionButton}
          disabled={buttonDisabled}
          loading={buttonLoading}
          onPress={validateSignerAndExecute(checkAction(_onExecute, ExtrinsicType.MULTISIG_EXECUTE_TX))}>
          {i18n.multisig.execute}
        </Button>
      );
    }

    if (isApproved) {
      return (
        <Button block style={styles.actionButton} disabled>
          {i18n.multisig.approved}
        </Button>
      );
    }

    return (
      <Button
        block
        style={styles.actionButton}
        disabled={buttonDisabled}
        loading={buttonLoading}
        onPress={
          isLastSigner
            ? validateSignerAndExecute(checkAction(_onExecute, ExtrinsicType.MULTISIG_EXECUTE_TX))
            : validateSignerAndExecute(checkAction(_onApprove, ExtrinsicType.MULTISIG_APPROVE_TX))
        }>
        {isLastSigner ? i18n.multisig.approveAndExecute : i18n.multisig.approve}
      </Button>
    );
  }, [
    _onApprove,
    _onExecute,
    _onReject,
    checkAction,
    data.approvals,
    data.depositor,
    data?.currentSigner,
    data.threshold,
    error,
    isBalanceLoading,
    isMultisigProcessing,
    loading,
    styles.actionButton,
    validateSignerAndExecute,
  ]);

  useEffect(() => {
    if (data?.chain && !checkChainConnected(data.chain)) {
      turnOnChain(data.chain);
    }
  }, [checkChainConnected, data?.chain, turnOnChain]);

  // `error` disables every action button, but on its own it never reaches the user, so the
  // buttons just sit dead. The extension (MultisigHistoryInfoModal.tsx:340-354) raises it
  // through onError once the chain is actually connected - before that the message would
  // only describe the reconnect that is already in progress.
  useEffect(() => {
    if (!error || !data?.chain) {
      return;
    }

    if (chainStatusMap[data.chain]?.connectionStatus !== _ChainConnectionStatus.CONNECTED) {
      return;
    }

    onError(new Error(error));
  }, [chainStatusMap, data?.chain, error, onError]);

  return (
    // Portal sheet, not the native Modal: toasts (pre-check / submit errors) and the
    // level-5 alert modal ("Unable to sign") live in the portal host and would otherwise be
    // drawn behind a native Modal - the extension shows both on top of this sheet.
    <SwModal
      isUseModalV2
      modalVisible={modalVisible}
      setVisible={setModalVisible}
      onChangeModalVisible={onCancel}
      onBackButtonPress={onCancel}
      isAllowSwipeDown={Platform.OS === 'ios'}
      modalTitle={MULTISIG_TX_TITLE_MAP()[data?.multisigTxType || MultisigTxType.UNKNOWN]}
      titleTextAlign={'center'}
      isUseForceHidden={true}>
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <HistoryMultisigLayout data={data} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          size={'sm'}
          type={'ghost'}
          disabled={!explorerLink}
          icon={
            <Icon
              phosphorIcon={ArrowCircleUpRightIcon}
              customSize={22}
              iconColor={explorerLink ? theme.colorTextLight1 : theme['gray-4']}
            />
          }
          onPress={() => Linking.openURL(explorerLink).catch(console.error)}>
          {i18n.common.viewOnExplorer}
        </Button>

        <View style={styles.actionRow}>{actionButtons}</View>
      </View>
    </SwModal>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    // The extension lets this sheet grow to the window height minus 56px (SwModal content
    // `maxHeight: 600 - 56`) and scrolls the body inside. A fixed 420 left a much larger gap
    // above the sheet on a phone; 60% of the window for the body plus title and footer lands
    // at about the same proportion, and matches the other detail sheets in the app.
    body: {
      width: '100%',
      maxHeight: deviceHeight * 0.6,
    },
    footer: {
      width: '100%',
      paddingTop: theme.padding,
      gap: theme.sizeXS,
    },
    actionRow: {
      flexDirection: 'row',
      gap: theme.sizeXS,
    },
    actionButton: {
      flex: 1,
    },
  });
}

export default MultisigHistoryInfoModal;
