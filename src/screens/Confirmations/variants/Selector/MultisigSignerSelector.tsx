import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { CaretDownIcon, InfoIcon } from 'phosphor-react-native';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
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
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
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
  const [isSignerItemsLoading, setIsSignerItemsLoading] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [wrapError, setWrapError] = useState<string | null>(null);
  const [multisigUiErrorType, setMultisigUiErrorType] = useState<MultisigSignerUiErrorType | null>(null);
  const [preparedInfo, setPreparedInfo] = useState<PrepareMultisigSignResponse | null>(null);
  const [selectorModalVisible, setSelectorModalVisible] = useState(false);

  const getWrappedTransactionSigners = useGetWrappedTransactionSigners();
  const signerAccount = useGetAccountByAddress(signerSelected?.address || '');
  const { chainInfoMap, chainStateMap } = useSelector((root: RootState) => root.chainStore);
  const chainInfo = chainInfoMap[chainSlug];

  useEffect(() => {
    let sync = true;

    if (!chainSlug || !targetAddress) {
      return;
    }

    setIsSignerItemsLoading(true);

    getWrappedTransactionSigners({
      chainSlug,
      extrinsicType: ExtrinsicType.MULTISIG_INIT_TX,
      targetAddress,
    })
      .then(result => {
        if (sync) {
          setSignerItems(result);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (sync) {
          setIsSignerItemsLoading(false);
        }
      });

    return () => {
      sync = false;
    };
  }, [chainSlug, getWrappedTransactionSigners, requestId, targetAddress]);

  // Only true signatories can initiate; proxy delegates are not offered here.
  const filteredSignerItems = useMemo<WrappedTransactionSigner[]>(
    () => (signerItems || []).filter(item => item.kind === 'signatory'),
    [signerItems],
  );

  const noSignerAvailable = !isSignerItemsLoading && !filteredSignerItems.length;
  const isChainActive = !!(chainSlug && chainStateMap[chainSlug]?.active);

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
          style={styles.placeholderContainer}
          onPress={() => setSelectorModalVisible(true)}>
          <View style={styles.placeholderLeft}>
            <AccountProxyAvatar size={24} value={''} />
            <Typography.Text style={styles.placeholderText}>{i18n.multisig.selectAccountToSign}</Typography.Text>
          </View>
          {isDisabled ? (
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
              <Icon phosphorIcon={CaretDownIcon} customSize={18} iconColor={theme.colorTextLight4} />
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
          <AlertBox type={'warning'} title={mappedMultisigError.title} description={mappedMultisigError.description} />
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
