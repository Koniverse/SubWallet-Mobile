import ConfirmationFooter from 'components/common/Confirmation/ConfirmationFooter';
import SignatureScanner from 'components/Scanner/SignatureScanner';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RequestSign } from '@subwallet/extension-base/background/types';
import { approveSignPasswordV2, approveSignSignature, cancelSignRequest } from 'messaging/index';
import { useDispatch, useSelector } from 'react-redux';
import { DisplayPayloadModal, SubstrateQr } from 'screens/Confirmations/parts/Qr/DisplayPayload';
import { RootState } from 'stores/index';
import { SigData } from 'types/signer';
import { getSignMode } from 'utils/account';
import { isSubstrateMessage } from 'utils/confirmation/confirmation';
import {
  ArrowCircleLeftIcon,
  CheckCircleIcon,
  IconProps,
  QrCodeIcon,
  SwatchesIcon,
  XCircleIcon,
} from 'phosphor-react-native';
import { MULTISIG_ACTIONS } from 'constants/multisig';
import { Button } from 'components/design-system-ui';
import i18n from 'utils/i18n/i18n';
import { getButtonIcon } from 'utils/button';
import { DeviceEventEmitter, Linking, Platform, Text, View } from 'react-native';
import { OPEN_UNLOCK_FROM_MODAL } from 'components/common/Modal/UnlockModal';
import { updateIsDeepLinkConnect } from 'stores/base/Settings';
import { useToast } from 'react-native-toast-notifications';
import useMetadata from 'hooks/transaction/confirmation/useMetadata';
import { isRawPayload } from 'utils/confirmation/request/substrate';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import useParseSubstrateRequestPayload from 'hooks/transaction/confirmation/useParseSubstrateRequestPayload';
import useGetChainInfoByGenesisHash from 'hooks/chain/useGetChainInfoByGenesisHash';
import { _isRuntimeUpdated } from '@subwallet/extension-base/utils';
import { toShort } from 'utils/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { NotNeedMigrationGens } from 'constants/ledger';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import { FontMedium } from 'styles/sharedStyles';
import { useHandleInternetConnectionForConfirmation } from 'hooks/useHandleInternetConnectionForConfirmation';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { AccountSignMode } from '@subwallet/extension-base/types';

interface Props {
  id: string;
  request: RequestSign;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  extrinsicType?: ExtrinsicType;
  txExpirationTime?: number;
  isInternal?: boolean;
  /** Blocks approval until a wrapped transaction has been prepared for the chosen signer. */
  disableApproval?: boolean;
  /** True when the sender is a proxied or multisig account and another account signs. */
  isWrapTransaction?: boolean;
}

interface AlertData {
  description: React.ReactNode;
  title: string;
  type: 'info' | 'warning' | 'error';
}

const handleConfirm = async (id: string) => await approveSignPasswordV2({ id });

const handleCancel = async (id: string) => await cancelSignRequest(id);

const handleSignature = async (id: string, { signature }: SigData) => await approveSignSignature(id, signature);

const metadataFAQUrl = 'https://docs.subwallet.app/main/extension-user-guide/faqs#how-do-i-update-network-metadata';
const genericFAQUrl =
  'https://docs.subwallet.app/main/extension-user-guide/faqs#how-do-i-re-attach-a-new-polkadot-account-on-ledger';
const migrationFAQUrl =
  'https://docs.subwallet.app/main/extension-user-guide/faqs#how-do-i-move-assets-from-a-substrate-network-to-the-new-polkadot-account-on-ledger';

const modeCanSignMessage: AccountSignMode[] = [AccountSignMode.QR, AccountSignMode.PASSWORD];

export const SubstrateSignArea = (props: Props) => {
  const { disableApproval, extrinsicType, id, isWrapTransaction, request, txExpirationTime, navigation } = props;
  const { address } = request.payload;
  const account = useGetAccountByAddress(address);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const genesisHash = useMemo(() => {
    const _payload = request.payload;

    return isRawPayload(_payload)
      ? account?.genesisHash || chainInfoMap.polkadot.substrateInfo?.genesisHash || ''
      : _payload.genesisHash;
  }, [account?.genesisHash, chainInfoMap.polkadot.substrateInfo?.genesisHash, request.payload]);
  const signMode = useMemo(() => getSignMode(account), [account]);
  const isLedger = useMemo(
    () => signMode === AccountSignMode.LEGACY_LEDGER || signMode === AccountSignMode.GENERIC_LEDGER,
    [signMode],
  );
  const isRuntimeUpdated = useMemo(() => {
    const _payload = request.payload;

    if (isRawPayload(_payload)) {
      return false;
    } else {
      return _isRuntimeUpdated(_payload.signedExtensions);
    }
  }, [request.payload]);
  const requireSpecVersion = useMemo((): number | undefined => {
    const _payload = request.payload;

    if (isRawPayload(_payload)) {
      return undefined;
    } else {
      return Number(_payload.specVersion);
    }
  }, [request.payload]);

  const { hideAll, show } = useToast();
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isShowQr, setIsShowQr] = useState(false);
  const { chain, loadingChain } = useMetadata(genesisHash, requireSpecVersion);
  const chainInfo = useGetChainInfoByGenesisHash(genesisHash);
  const theme = useSubWalletTheme().swThemes;
  const { addExtraData, hashLoading, isMissingData, payload } = useParseSubstrateRequestPayload(
    chain,
    request,
    isLedger,
  );
  const [showQuoteExpired, setShowQuoteExpired] = useState<boolean>(false);
  const isMessage = isSubstrateMessage(payload);
  const dispatch = useDispatch();
  // Chain metadata is fetched then decoded into a type registry on the JS thread, which makes the
  // buttons unable to react. Show it as a loading state so it does not look like the app is stuck.
  const isPreparingPayload = loadingChain || hashLoading;
  const networkName = useMemo(
    () => chainInfo?.name || chain?.name || toShort(genesisHash),
    [chainInfo, genesisHash, chain],
  );
  // const requireMetadata = useMemo(
  //   () =>
  //     signMode === AccountSignMode.GENERIC_LEDGER || (signMode === AccountSignMode.LEGACY_LEDGER && isRuntimeUpdated),
  //   [isRuntimeUpdated, signMode],
  // );

  const isMetadataOutdated = useMemo(() => {
    const _payload = request.payload;

    if (isRawPayload(_payload)) {
      return false;
    } else {
      const payloadSpecVersion = parseInt(_payload.specVersion);
      const metadataSpecVersion = chain?.specVersion;

      return payloadSpecVersion !== metadataSpecVersion;
    }
  }, [request.payload, chain?.specVersion]);

  // const isOpenAlert =
  //   !isMessage &&
  //   !loadingChain &&
  //   !requireMetadata &&
  //   !isInternal &&
  //   (!chain || !chain.hasMetadata || isMetadataOutdated);

  const alertData = useMemo((): AlertData | undefined => {
    const _requireMetadata =
      signMode === AccountSignMode.GENERIC_LEDGER || (signMode === AccountSignMode.LEGACY_LEDGER && isRuntimeUpdated);

    if (!isMessage && !loadingChain) {
      if (!chain || !chain.hasMetadata || isMetadataOutdated) {
        if (_requireMetadata) {
          return {
            type: 'error',
            title: 'Error!',
            description: (
              <Text
                style={{
                  paddingHorizontal: theme.padding,
                  fontSize: theme.fontSize,
                  lineHeight: theme.fontSize * theme.lineHeight,
                  color: theme.colorTextDescription,
                  ...FontMedium,
                }}>
                <Text>{`${networkName} network's metadata is out of date, which may cause the transaction to fail. Update metadata using `}</Text>
                <Text
                  style={{ color: theme.colorLink, textDecorationLine: 'underline' }}
                  onPress={() => Linking.openURL(metadataFAQUrl)}>
                  {i18n.attachAccount.readThisInstructionForMoreDetailsP2}
                </Text>
                <Text>{' or approve transaction at your own risk'}</Text>
              </Text>
            ),
          };
        }
      } else {
        if (isRuntimeUpdated) {
          if (_requireMetadata && isMissingData && !addExtraData) {
            return {
              type: 'error',
              title: 'Error!',
              description: 'Unable to sign this transaction on Ledger because the dApp is out of date',
            };
          }

          if (signMode === AccountSignMode.LEGACY_LEDGER) {
            const gens = chain.genesisHash || '___';

            if (NotNeedMigrationGens.includes(gens)) {
              return {
                type: 'info',
                title: 'Helpful tip',
                description: (
                  <Text
                    style={{
                      paddingHorizontal: theme.padding,
                      fontSize: theme.fontSize,
                      lineHeight: theme.fontSize * theme.lineHeight,
                      color: theme.colorTextDescription,
                      ...FontMedium,
                    }}>
                    <Text>
                      {
                        'To sign this transaction, open “Polkadot” app on Ledger, hit Refresh and Approve again. For a better experience, re-attach your Polkadot new account using '
                      }
                    </Text>
                    <Text
                      style={{ color: theme.colorLink, textDecorationLine: 'underline' }}
                      onPress={() => Linking.openURL(genericFAQUrl)}>
                      {'this guide'}
                    </Text>
                  </Text>
                ),
              };
            } else {
              return {
                type: 'info',
                title: 'Helpful tip',
                description: (
                  <Text
                    style={{
                      paddingHorizontal: theme.padding,
                      fontSize: theme.fontSize,
                      lineHeight: theme.fontSize * theme.lineHeight,
                      color: theme.colorTextDescription,
                      ...FontMedium,
                    }}>
                    <Text>{`To sign this transaction, open “Polkadot Migration” app on Ledger, hit Refresh and Approve again. For a better experience, move your assets on ${networkName} network to the Polkadot new account using `}</Text>
                    <Text
                      style={{ color: theme.colorLink, textDecorationLine: 'underline' }}
                      onPress={() => Linking.openURL(migrationFAQUrl)}>
                      {'this guide'}
                    </Text>
                  </Text>
                ),
              };
            }
          }
        } else {
          if (signMode === AccountSignMode.GENERIC_LEDGER) {
            return {
              type: 'error',
              title: 'Error!',
              description: `Unable to sign this transaction on Ledger because the ${networkName} network is out of date`,
            };
          }
        }
      }
    }

    return undefined;
  }, [
    addExtraData,
    chain,
    isMessage,
    isMetadataOutdated,
    isMissingData,
    isRuntimeUpdated,
    loadingChain,
    networkName,
    signMode,
    theme.colorLink,
    theme.colorTextDescription,
    theme.fontSize,
    theme.lineHeight,
    theme.padding,
  ]);

  // Multisig approve/execute/cancel extrinsics and any wrapped (proxied) transaction are
  // signed by an account other than the sender, so the buttons read differently.
  const isMultisigOrSubstrateProxyTransaction = useMemo(() => {
    return (!!extrinsicType && MULTISIG_ACTIONS.includes(extrinsicType)) || !!isWrapTransaction;
  }, [extrinsicType, isWrapTransaction]);

  const isRejectPendingTransaction = extrinsicType === ExtrinsicType.MULTISIG_CANCEL_TX;

  const approveIcon = useMemo((): React.ElementType<IconProps> => {
    if (extrinsicType === ExtrinsicType.MULTISIG_CANCEL_TX) {
      return XCircleIcon;
    }

    switch (signMode) {
      case AccountSignMode.QR:
        return QrCodeIcon;
      case AccountSignMode.GENERIC_LEDGER:
      case AccountSignMode.LEGACY_LEDGER:
        return SwatchesIcon;
      default:
        return CheckCircleIcon;
    }
  }, [extrinsicType, signMode]);

  const approveLabel = useMemo(() => {
    switch (extrinsicType) {
      case ExtrinsicType.MULTISIG_CANCEL_TX:
        return i18n.multisig.reject;
      case ExtrinsicType.MULTISIG_EXECUTE_TX:
        return i18n.multisig.execute;
      default:
        return i18n.buttonTitles.approve;
    }
  }, [extrinsicType]);

  const cancelButtonContent = useMemo(() => {
    if (isMultisigOrSubstrateProxyTransaction) {
      return { icon: ArrowCircleLeftIcon, label: i18n.common.back };
    }

    return { icon: XCircleIcon, label: i18n.common.cancel };
  }, [isMultisigOrSubstrateProxyTransaction]);

  const onCancel = useCallback(() => {
    setLoading(true);
    handleCancel(id).finally(() => {
      setLoading(false);
      dispatch(updateIsDeepLinkConnect(false));
    });
  }, [dispatch, id]);

  const onApprovePassword = useCallback(() => {
    setTimeout(() => {
      handleConfirm(id)
        .catch(e => {
          console.log(e);
        })
        .finally(() => {
          dispatch(updateIsDeepLinkConnect(false));
          setLoading(false);
        });
    }, 1000);
  }, [dispatch, id]);

  const onApproveSignature = useCallback(
    (signature: SigData) => {
      setLoading(true);

      setTimeout(() => {
        handleSignature(id, signature)
          .catch(e => {
            console.log(e);
          })
          .finally(() => {
            setLoading(false);
          });
      }, 300);
    },
    [id],
  );

  const onConfirmQr = useCallback(() => {
    setIsShowQr(true);
  }, []);

  const { onPress: onConfirmPassword } = useUnlockModal(navigation, setLoading, false, true);

  const onConfirm = useCallback(() => {
    if (txExpirationTime) {
      const currentTime = +Date.now();

      if (currentTime >= txExpirationTime) {
        hideAll();
        show('Transaction expired', { type: 'danger' });
        onCancel();
      }
    }

    switch (signMode) {
      case AccountSignMode.QR:
        onConfirmQr();
        break;
      default:
        setLoading(true);
        Platform.OS === 'android' && setTimeout(() => DeviceEventEmitter.emit(OPEN_UNLOCK_FROM_MODAL), 250);
        onConfirmPassword(onApprovePassword)()?.catch(() => {
          setLoading(false);
        });
    }
  }, [hideAll, onApprovePassword, onCancel, onConfirmPassword, onConfirmQr, show, signMode, txExpirationTime]);

  const onSuccess = useCallback(
    (sig: SigData) => {
      setIsShowQr(false);
      setIsScanning(false);
      onApproveSignature && onApproveSignature(sig);
    },
    [onApproveSignature],
  );

  const openScanning = useCallback(() => {
    // setIsShowQr(false);
    setIsScanning(true);
  }, []);

  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined;

    if (txExpirationTime) {
      timer = setInterval(() => {
        if (Date.now() >= txExpirationTime) {
          setShowQuoteExpired(true);
          clearInterval(timer);
        }
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [txExpirationTime]);

  useHandleInternetConnectionForConfirmation(onCancel);

  return (
    <>
      {alertData && (
        <View style={{ paddingHorizontal: theme.padding, width: '100%' }}>
          <AlertBox description={alertData.description} title={alertData.title} type={alertData.type} />
        </View>
      )}

      {/*<SwModal*/}
      {/*  modalVisible={isShowWarningModal}*/}
      {/*  isUseForceHidden={false}*/}
      {/*  setVisible={setIsShowWarningModal}*/}
      {/*  titleTextAlign={'center'}*/}
      {/*  modalTitle={'Pay attention!'}>*/}
      {/*  <>*/}
      {/*    <View style={{ paddingTop: theme.paddingSM, paddingBottom: theme.paddingMD }}>*/}
      {/*      <PageIcon icon={Warning} color={theme.colorWarning} />*/}
      {/*    </View>*/}
      {/*    <Text*/}
      {/*      style={{*/}
      {/*        paddingHorizontal: theme.padding,*/}
      {/*        fontSize: theme.fontSize,*/}
      {/*        lineHeight: theme.fontSize * theme.lineHeight,*/}
      {/*        color: theme.colorTextDescription,*/}
      {/*        textAlign: 'center',*/}
      {/*        ...FontMedium,*/}
      {/*      }}>*/}
      {/*      <Text>{`${networkName} network's metadata is out of date, which may cause the transaction to fail. Update metadata using `}</Text>*/}
      {/*      <Text*/}
      {/*        style={{ color: theme.colorLink, textDecorationLine: 'underline' }}*/}
      {/*        onPress={() => Linking.openURL(metadataFAQUrl)}>*/}
      {/*        {i18n.attachAccount.readThisInstructionForMoreDetailsP2}*/}
      {/*      </Text>*/}
      {/*      <Text>{' or approve transaction at your own risk'}</Text>*/}
      {/*    </Text>*/}
      {/*    <View style={{ width: '100%', flexDirection: 'row', paddingTop: theme.padding }}>*/}
      {/*      <Button*/}
      {/*        style={{ flex: 1 }}*/}
      {/*        icon={<Icon phosphorIcon={CheckCircle} size={'lg'} weight={'fill'} />}*/}
      {/*        type="primary"*/}
      {/*        onPress={() => setIsShowWarningModal(false)}>*/}
      {/*        {'I understand'}*/}
      {/*      </Button>*/}
      {/*    </View>*/}
      {/*  </>*/}
      {/*</SwModal>*/}

      <ConfirmationFooter>
        <Button
          disabled={loading || isPreparingPayload}
          block
          icon={getButtonIcon(cancelButtonContent.icon)}
          type={'secondary'}
          onPress={onCancel}>
          {cancelButtonContent.label}
        </Button>
        <Button
          block
          disabled={
            showQuoteExpired ||
            isPreparingPayload ||
            loading ||
            disableApproval ||
            (isMessage ? !modeCanSignMessage.includes(signMode) : alertData?.type === 'error')
          }
          icon={getButtonIcon(approveIcon)}
          loading={loading || isPreparingPayload}
          type={isRejectPendingTransaction ? 'danger' : 'primary'}
          onPress={onConfirm}>
          {approveLabel}
        </Button>
        {signMode === AccountSignMode.QR && (
          <>
            <DisplayPayloadModal visible={isShowQr} onOpenScan={openScanning} setVisible={setIsShowQr}>
              <>
                <SubstrateQr address={account?.address || address} genesisHash={genesisHash} payload={payload || ''} />
                <SignatureScanner visible={isScanning} onSuccess={onSuccess} setVisible={setIsScanning} />
              </>
            </DisplayPayloadModal>
          </>
        )}
      </ConfirmationFooter>
    </>
  );
};
