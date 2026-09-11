import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { CaretDownIcon, InfoIcon } from 'phosphor-react-native';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { _ChainConnectionStatus } from '@subwallet/extension-base/services/chain-service/types';
import { PrepareMultisigSignResponse } from '@subwallet/extension-base/types/multisig';
import { ActivityIndicator, Icon, Typography } from 'components/design-system-ui';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';
import MetaInfo from 'components/MetaInfo';
import { WrappedTransactionSignerSelectorModal } from 'components/Modal/Selector/WrappedTransactionSignerSelectorModal';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { useGetWrappedTransactionSigners } from 'hooks/transaction/useGetWrappedTransactionSigners';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { prepareMultisigSignRequest } from 'messaging/transaction/multisig';
import { RootState } from 'stores/index';
import { DisabledStyle, FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import { WrappedTransactionSigner } from 'types/wrappedTransaction';
import i18n from 'utils/i18n/i18n';
import { toShort } from 'utils/index';

export interface MultisigSignerSelectorProps {
  requestId: string;
  targetAddress: string;
  chainSlug: string;
  decimals?: number;
  symbol?: string;
  initialCallData?: string | null;
  onDisableApprovalChange?: (value: boolean) => void;
  onOpenCallDataDetail?: () => void;
}

enum MultisigSignerUiErrorType {
  UNSUPPORTED_CHAIN = 'UNSUPPORTED_CHAIN',
  UNSTABLE_NETWORK = 'UNSTABLE_NETWORK',
  NO_SIGNATORIES = 'NO_SIGNATORIES',
}

// The signer lookup awaits `substrateApi.isReady` in the background, which never settles while
// the RPC cannot be reached. The connection watcher normally gives up first; this is the safety
// net for a chain that sits in CONNECTING for good.
const SIGNER_LOOKUP_TIMEOUT = 30_000;
// How long an active chain may report a broken connection before the lookup is treated as
// stalled. Covers the UI status map lagging behind the state map and the provider's own
// reconnect after a brief drop.
const BROKEN_CONNECTION_GRACE = 3_000;

/**
 * Signatory picker shown when a dApp asks a multisig account to sign. Choosing a
 * signatory prepares the wrapped extrinsic on the backend, which is what unlocks the
 * Approve button.
 */
export const MultisigSignerSelector = ({
  chainSlug,
  decimals,
  initialCallData,
  onDisableApprovalChange,
  onOpenCallDataDetail,
  requestId,
  symbol,
  targetAddress,
}: MultisigSignerSelectorProps) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [signerSelected, setSignerSelected] = useState<WrappedTransactionSigner | null>(null);
  const [signerItems, setSignerItems] = useState<WrappedTransactionSigner[] | null>(null);
  // Starts as loading, like react-query's isLoading in the extension. Starting at false made
  // the very first render look like "loaded, no signatories": the effect below latched
  // NO_SIGNATORIES before the lookup had even started, so the alert showed next to the
  // spinner and the picker stayed disabled even after signatories arrived.
  const [isSignerItemsLoading, setIsSignerItemsLoading] = useState(() => !!chainSlug && !!targetAddress);
  const [isPreparing, setIsPreparing] = useState(false);
  const [wrapError, setWrapError] = useState<string | null>(null);
  const [multisigUiErrorType, setMultisigUiErrorType] = useState<MultisigSignerUiErrorType | null>(null);
  const [preparedInfo, setPreparedInfo] = useState<PrepareMultisigSignResponse | null>(null);
  const [selectorModalVisible, setSelectorModalVisible] = useState(false);
  // Set when the lookup has given up waiting (RPC down / timed out) rather than answered; a
  // stalled lookup must not read as "no signatories". The pending call is still allowed to
  // deliver: if the chain recovers and it resolves, the result is taken and the error cleared.
  const [isLookupFailed, setIsLookupFailed] = useState(false);
  const [lookupRetryKey, setLookupRetryKey] = useState(0);
  // Identifies the in-flight lookup; bumping it makes a late result from a superseded
  // attempt a no-op.
  const lookupIdRef = useRef(0);
  const lookupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const brokenConnectionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Retry only after the connection actually cycled. A lookup that timed out while the chain
  // already reported CONNECTED would otherwise re-run itself every SIGNER_LOOKUP_TIMEOUT.
  const canRetryLookupRef = useRef(false);
  const connectionStatusRef = useRef<_ChainConnectionStatus | undefined>(undefined);

  const getWrappedTransactionSigners = useGetWrappedTransactionSigners();
  const signerAccount = useGetAccountByAddress(signerSelected?.address || '');
  const { chainInfoMap, chainStateMap, chainStatusMap } = useSelector((root: RootState) => root.chainStore);
  const chainInfo = chainInfoMap[chainSlug];
  const isChainActive = !!(chainSlug && chainStateMap[chainSlug]?.active);
  const connectionStatus = chainSlug ? chainStatusMap[chainSlug]?.connectionStatus : undefined;

  connectionStatusRef.current = connectionStatus;

  const clearLookupTimer = useCallback(() => {
    if (lookupTimerRef.current) {
      clearTimeout(lookupTimerRef.current);
      lookupTimerRef.current = null;
    }
  }, []);

  // Stop waiting on the current lookup without discarding it.
  const giveUpWaiting = useCallback(() => {
    clearLookupTimer();
    canRetryLookupRef.current = connectionStatusRef.current !== _ChainConnectionStatus.CONNECTED;
    setIsSignerItemsLoading(false);
    setIsLookupFailed(true);
    setMultisigUiErrorType(MultisigSignerUiErrorType.UNSTABLE_NETWORK);
  }, [clearLookupTimer]);

  useEffect(() => {
    if (!chainSlug || !targetAddress) {
      return;
    }

    const lookupId = ++lookupIdRef.current;
    const isCurrent = () => lookupIdRef.current === lookupId;

    setIsSignerItemsLoading(true);
    setIsLookupFailed(false);

    lookupTimerRef.current = setTimeout(() => {
      if (isCurrent()) {
        giveUpWaiting();
      }
    }, SIGNER_LOOKUP_TIMEOUT);

    getWrappedTransactionSigners({
      chainSlug,
      extrinsicType: ExtrinsicType.MULTISIG_INIT_TX,
      targetAddress,
    })
      .then(result => {
        if (!isCurrent()) {
          return;
        }

        setSignerItems(result);
        // A late answer after we stopped waiting means the chain is back after all.
        setIsLookupFailed(false);
        setMultisigUiErrorType(prev => (prev === MultisigSignerUiErrorType.UNSTABLE_NETWORK ? null : prev));
      })
      .catch(console.error)
      .finally(() => {
        if (isCurrent()) {
          clearLookupTimer();
          setIsSignerItemsLoading(false);
        }
      });

    return () => {
      lookupIdRef.current += 1;
      clearLookupTimer();
    };
  }, [
    chainSlug,
    clearLookupTimer,
    getWrappedTransactionSigners,
    giveUpWaiting,
    lookupRetryKey,
    requestId,
    targetAddress,
  ]);

  // An active chain reporting DISCONNECTED/UNSTABLE will not answer the lookup; say so instead
  // of spinning. Two things keep this from firing on a healthy chain: inactive chains are
  // skipped (their status is DISCONNECTED until the enable that SignConfirmation kicks off has
  // connected them), and the status has to stay broken for a grace period, because the UI's
  // status map lags the state map and the provider reconnects on its own after a drop.
  useEffect(() => {
    const isBroken =
      connectionStatus === _ChainConnectionStatus.DISCONNECTED || connectionStatus === _ChainConnectionStatus.UNSTABLE;

    if (!isSignerItemsLoading || !isChainActive || !isBroken) {
      return;
    }

    brokenConnectionTimerRef.current = setTimeout(giveUpWaiting, BROKEN_CONNECTION_GRACE);

    return () => {
      if (brokenConnectionTimerRef.current) {
        clearTimeout(brokenConnectionTimerRef.current);
        brokenConnectionTimerRef.current = null;
      }
    };
  }, [connectionStatus, giveUpWaiting, isChainActive, isSignerItemsLoading]);

  // Once the chain is back, run the lookup again and drop the network error it produced.
  useEffect(() => {
    if (!isLookupFailed) {
      return;
    }

    if (connectionStatus !== _ChainConnectionStatus.CONNECTED) {
      canRetryLookupRef.current = true;

      return;
    }

    if (!canRetryLookupRef.current) {
      return;
    }

    canRetryLookupRef.current = false;
    setIsLookupFailed(false);
    setMultisigUiErrorType(prev => (prev === MultisigSignerUiErrorType.UNSTABLE_NETWORK ? null : prev));
    setLookupRetryKey(key => key + 1);
  }, [connectionStatus, isLookupFailed]);

  // Only true signatories can initiate; proxy delegates are not offered here.
  const filteredSignerItems = useMemo<WrappedTransactionSigner[]>(
    () => (signerItems || []).filter(item => item.kind === 'signatory'),
    [signerItems],
  );

  const noSignerAvailable = !isSignerItemsLoading && !isLookupFailed && !filteredSignerItems.length;

  const displayMultisigErrorType = useMemo(() => {
    if (noSignerAvailable && isChainActive && chainInfo?.substrateInfo?.supportMultisig) {
      return MultisigSignerUiErrorType.NO_SIGNATORIES;
    }

    return multisigUiErrorType;
  }, [chainInfo?.substrateInfo?.supportMultisig, isChainActive, multisigUiErrorType, noSignerAvailable]);

  const multisigErrorMap = useMemo<Record<MultisigSignerUiErrorType, { description: string; title: string }>>(
    () => ({
      [MultisigSignerUiErrorType.UNSUPPORTED_CHAIN]: {
        title: i18n.multisig.unsupportedNetwork,
        description: i18n.multisig.unsupportedNetworkDescription,
      },
      [MultisigSignerUiErrorType.UNSTABLE_NETWORK]: {
        title: i18n.multisig.unstableNetwork,
        description: i18n.multisig.unstableNetworkDescription,
      },
      [MultisigSignerUiErrorType.NO_SIGNATORIES]: {
        title: i18n.multisig.noSignatories,
        description: i18n.multisig.noSignatoriesDescription,
      },
    }),
    [],
  );

  const mappedMultisigError = displayMultisigErrorType ? multisigErrorMap[displayMultisigErrorType] : null;

  const disableApproval = useMemo(() => {
    return (
      !signerSelected ||
      !preparedInfo ||
      isPreparing ||
      isSignerItemsLoading ||
      !!displayMultisigErrorType ||
      !!wrapError
    );
  }, [displayMultisigErrorType, isPreparing, isSignerItemsLoading, preparedInfo, signerSelected, wrapError]);

  const callData = preparedInfo?.callData || initialCallData || null;
  const isDisabled = isSignerItemsLoading || isPreparing || !!displayMultisigErrorType;

  // prepareMultisigSignRequest reads the queued payload and then overwrites it with the wrapped
  // one, so preparing twice wraps an already-wrapped call. Remember the call data of the original
  // request to detect that, and never re-prepare for a signatory that is already prepared.
  const originalCallDataRef = useRef<string | null>(initialCallData || null);

  const onSelectSigner = useCallback(
    (selected: WrappedTransactionSigner) => {
      setSelectorModalVisible(false);

      // Already prepared for this exact signatory — re-preparing would only wrap it again.
      // A failed attempt is still allowed to be retried.
      if (signerSelected?.address === selected.address && preparedInfo && !wrapError) {
        return;
      }

      setSignerSelected(selected);
      setIsPreparing(true);
      setWrapError(null);
      setMultisigUiErrorType(null);
      setPreparedInfo(null);

      prepareMultisigSignRequest({ id: requestId, signer: selected.address })
        .then((response: PrepareMultisigSignResponse) => {
          setPreparedInfo(response);

          if (!originalCallDataRef.current) {
            originalCallDataRef.current = response.callData || null;
          }

          if (response.errors.length > 0) {
            setWrapError(response.errors[0].message || null);
          } else if (originalCallDataRef.current && response.callData !== originalCallDataRef.current) {
            setWrapError(i18n.multisig.unableToPrepareTransaction);
          }
        })
        .catch((e: Error) => {
          console.error('Error preparing multisig sign request', e);
          setMultisigUiErrorType(MultisigSignerUiErrorType.UNSTABLE_NETWORK);
        })
        .finally(() => setIsPreparing(false));
    },
    [preparedInfo, requestId, signerSelected?.address, wrapError],
  );

  useEffect(() => {
    onDisableApprovalChange?.(disableApproval);
  }, [disableApproval, onDisableApprovalChange]);

  useEffect(() => {
    if (!chainInfo?.substrateInfo?.supportMultisig) {
      setMultisigUiErrorType(MultisigSignerUiErrorType.UNSUPPORTED_CHAIN);
    } else if (noSignerAvailable) {
      setMultisigUiErrorType(MultisigSignerUiErrorType.NO_SIGNATORIES);
    }
  }, [chainInfo?.substrateInfo?.supportMultisig, noSignerAvailable]);

  return (
    <View style={styles.container}>
      {!signerAccount ? (
        <TouchableOpacity
          activeOpacity={1}
          disabled={isDisabled}
          style={[styles.placeholderContainer, isDisabled && DisabledStyle]}
          onPress={() => setSelectorModalVisible(true)}>
          <View style={styles.placeholderLeft}>
            <AccountProxyAvatar size={24} value={''} />
            <Typography.Text style={styles.placeholderText}>{i18n.multisig.selectAccountToSign}</Typography.Text>
          </View>
          {/* Spin only while something is in flight; a blocked picker (unsupported network,
              no signatories) keeps the caret like the extension instead of looking stuck. */}
          {isSignerItemsLoading || isPreparing ? (
            <ActivityIndicator size={20} />
          ) : (
            <Icon phosphorIcon={CaretDownIcon} size={'sm'} iconColor={theme.colorTextLight4} />
          )}
        </TouchableOpacity>
      ) : (
        <MetaInfo hasBackgroundWrapper spaceSize={'xs'}>
          <MetaInfo.Default label={i18n.multisig.signWith}>
            <TouchableOpacity
              activeOpacity={1}
              disabled={isDisabled}
              style={styles.signerValue}
              onPress={() => setSelectorModalVisible(true)}>
              <AccountProxyAvatar size={24} value={signerAccount.proxyId} />
              <Typography.Text ellipsis style={styles.signerName}>
                {signerAccount.name}
              </Typography.Text>
              <View style={isDisabled && DisabledStyle}>
                <Icon phosphorIcon={CaretDownIcon} customSize={18} iconColor={theme.colorTextLight4} />
              </View>
            </TouchableOpacity>
          </MetaInfo.Default>

          {isPreparing && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size={32} />
            </View>
          )}

          {!isPreparing && !!preparedInfo && (
            <>
              {preparedInfo.depositAmount != null && (
                <MetaInfo.Number
                  label={i18n.multisig.depositLabel}
                  value={preparedInfo.depositAmount}
                  decimals={decimals || 0}
                  suffix={symbol}
                />
              )}

              <MetaInfo.Number
                label={i18n.multisig.networkFee}
                value={preparedInfo.networkFee || 0}
                decimals={decimals || 0}
                suffix={symbol}
              />

              {!!callData && (
                <MetaInfo.Default label={i18n.multisig.callData}>
                  {onOpenCallDataDetail ? (
                    <TouchableOpacity activeOpacity={1} style={styles.signerValue} onPress={onOpenCallDataDetail}>
                      <Typography.Text style={styles.signerName}>{toShort(callData, 5, 5)}</Typography.Text>
                      <Icon phosphorIcon={InfoIcon} customSize={18} iconColor={theme.colorTextLight4} />
                    </TouchableOpacity>
                  ) : (
                    <Typography.Text style={styles.signerName}>{toShort(callData, 5, 5)}</Typography.Text>
                  )}
                </MetaInfo.Default>
              )}
            </>
          )}
        </MetaInfo>
      )}

      {!!mappedMultisigError && (
        <View style={styles.alertWrapper}>
          <AlertBox type={'error'} title={mappedMultisigError.title} description={mappedMultisigError.description} />
        </View>
      )}

      {!!wrapError && !mappedMultisigError && (
        <View style={styles.alertWrapper}>
          <AlertBox type={'warning'} title={i18n.multisig.unableToSignTransaction} description={wrapError} />
        </View>
      )}

      {!!signerItems && (
        <WrappedTransactionSignerSelectorModal
          chainSlug={chainSlug}
          targetAddress={targetAddress}
          selectedSigner={signerSelected}
          signerItems={filteredSignerItems}
          onSelectSigner={onSelectSigner}
          modalVisible={selectorModalVisible}
          setModalVisible={setSelectorModalVisible}
        />
      )}
    </View>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      width: '100%',
      gap: theme.sizeXS,
    },
    placeholderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      paddingHorizontal: theme.paddingSM,
      height: 48,
    },
    placeholderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXS,
    },
    placeholderText: {
      ...FontMedium,
      color: theme.colorTextLight4,
    },
    signerValue: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXS,
    },
    signerName: {
      ...FontSemiBold,
      color: theme.colorTextLight1,
      maxWidth: 110,
    },
    loadingContainer: {
      alignItems: 'center',
      paddingVertical: theme.padding,
    },
    alertWrapper: {
      marginTop: theme.marginXS,
    },
  });
}

export default MultisigSignerSelector;
