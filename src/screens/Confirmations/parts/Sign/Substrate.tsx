import ConfirmationFooter from 'components/common/Confirmation/ConfirmationFooter';
import SignatureScanner from 'components/Scanner/SignatureScanner';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AccountJson, RequestSign } from '@subwallet/extension-base/background/types';
import { approveSignPasswordV2, approveSignSignature, cancelSignRequest } from 'messaging/index';
import { useDispatch, useSelector } from 'react-redux';
import { DisplayPayloadModal, SubstrateQr } from 'screens/Confirmations/parts/Qr/DisplayPayload';
import { RootState } from 'stores/index';
import { AccountSignMode } from 'types/signer';
import { SigData } from 'types/signer';
import { getSignMode } from 'utils/account';
import { isSubstrateMessage } from 'utils/confirmation/confirmation';
import { CheckCircle, IconProps, QrCode, Swatches, XCircle } from 'phosphor-react-native';
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

interface Props {
  account: AccountJson;
  id: string;
  request: RequestSign;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  extrinsicType?: ExtrinsicType;
  txExpirationTime?: number;
  isInternal?: boolean;
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
  const { account, id, request, txExpirationTime, navigation } = props;
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);

  const genesisHash = useMemo(() => {
    const _payload = request.payload;

    return isRawPayload(_payload)
      ? account.originGenesisHash || chainInfoMap.polkadot.substrateInfo?.genesisHash || ''
      : _payload.genesisHash;
  }, [account.originGenesisHash, chainInfoMap.polkadot.substrateInfo?.genesisHash, request.payload]);
  const signMode = useMemo(() => getSignMode(account), [account]);
  const isLedger = useMemo(
    () => signMode === AccountSignMode.LEGACY_LEDGER || signMode === AccountSignMode.GENERIC_LEDGER,
    [signMode],
  );

  const { hideAll, show } = useToast();
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isShowQr, setIsShowQr] = useState(false);
  const { chain, loadingChain } = useMetadata(genesisHash);
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
  const networkName = useMemo(
    () => chainInfo?.name || chain?.name || toShort(genesisHash),
    [chainInfo, genesisHash, chain],
  );
  const isRuntimeUpdated = useMemo(() => {
    const _payload = request.payload;

    if (isRawPayload(_payload)) {
      return false;
    } else {
      return _isRuntimeUpdated(_payload.signedExtensions);
    }
  }, [request.payload]);
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

  const approveIcon = useMemo((): React.ElementType<IconProps> => {
    switch (signMode) {
      case AccountSignMode.QR:
        return QrCode;
      case AccountSignMode.GENERIC_LEDGER:
      case AccountSignMode.LEGACY_LEDGER:
        return Swatches;
      default:
        return CheckCircle;
    }
  }, [signMode]);

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

  const { onPress: onConfirmPassword } = useUnlockModal(navigation, setLoading);

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
        <Button disabled={loading} block icon={getButtonIcon(XCircle)} type={'secondary'} onPress={onCancel}>
          {i18n.common.cancel}
        </Button>
        <Button
          block
          disabled={
            showQuoteExpired ||
            loadingChain ||
            hashLoading ||
            (isMessage ? !modeCanSignMessage.includes(signMode) : alertData?.type === 'error')
          }
          icon={getButtonIcon(approveIcon)}
          loading={loading}
          onPress={onConfirm}>
          {i18n.buttonTitles.approve}
        </Button>
        {signMode === AccountSignMode.QR && (
          <>
            <DisplayPayloadModal visible={isShowQr} onOpenScan={openScanning} setVisible={setIsShowQr}>
              <>
                <SubstrateQr address={account.address} genesisHash={genesisHash} payload={payload || ''} />
                <SignatureScanner visible={isScanning} onSuccess={onSuccess} setVisible={setIsScanning} />
              </>
            </DisplayPayloadModal>
          </>
        )}
      </ConfirmationFooter>
    </>
  );
};
