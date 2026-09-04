import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { ArrowCircleUpRightIcon } from 'phosphor-react-native';
import { ExtrinsicStatus, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
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
import { MULTISIG_TX_TITLE_MAP } from 'constants/multisig';
import { useGetBalance } from 'hooks/balance';
import usePreCheckAction from 'hooks/account/usePreCheckAction';
import useChainChecker from 'hooks/chain/useChainChecker';
import useGetAccountProxyById from 'hooks/account/useGetAccountProxyById';
import useHandleSubmitTransaction from 'hooks/transaction/useHandleSubmitTransaction';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { approvePendingTx, cancelPendingTx, executePendingTx } from 'messaging/transaction/multisig';
import { AppModalContext } from 'providers/AppModalContext';
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
  const { confirmModal } = React.useContext(AppModalContext);

  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
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
        confirmModal.setConfirmModal({
          visible: true,
          title: i18n.multisig.unableToSign,
          message: i18n.multisig.selectedSignatoryIsMultisigWarning,
          completeBtnTitle: i18n.multisig.goToPolkadotJs,
          onCancelModal: () => {
            confirmModal.hideConfirmModal();
            onCancel();
          },
          onCompleteModal: () => {
            Linking.openURL(POLKADOT_JS_APPS_URL).catch(console.error);
            confirmModal.hideConfirmModal();
            onCancel();
          },
        });

        return;
      }

      action();
    },
    [confirmModal, onCancel, signerAccountProxy?.accountType],
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

  return (
    <SwModal
      modalVisible={modalVisible}
      setVisible={setModalVisible}
      onChangeModalVisible={onCancel}
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
    body: {
      width: '100%',
      maxHeight: 420,
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
