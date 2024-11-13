import ConfirmationFooter from 'components/common/Confirmation/ConfirmationFooter';
import SignatureScanner from 'components/Scanner/SignatureScanner';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'components/design-system-ui';
import { CheckCircle, IconProps, QrCode, Swatches, XCircle } from 'phosphor-react-native';
import { DisplayPayloadModal, EvmQr } from 'screens/Confirmations/parts/Qr/DisplayPayload';
import { EvmSignatureSupportType } from 'types/confirmation';
import { completeConfirmation } from 'messaging/index';
import { ConfirmationDefinitions, ConfirmationResult } from '@subwallet/extension-base/background/KoniTypes';
import { SigData } from 'types/signer';
import { getSignMode } from 'utils/account';
import { AccountSignMode } from 'types/signer';
import { isEvmMessage } from 'utils/confirmation/confirmation';
import i18n from 'utils/i18n/i18n';
import { getButtonIcon } from 'utils/button';
import { RootStackParamList } from 'routes/index';
import { updateIsDeepLinkConnect } from 'stores/base/Settings';
import { Minimizer } from '../../../../NativeModules';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DeviceEventEmitter, Platform, View } from 'react-native';
import { OPEN_UNLOCK_FROM_MODAL } from 'components/common/Modal/UnlockModal';
import { useToast } from 'react-native-toast-notifications';
import { useHandleInternetConnectionForConfirmation } from 'hooks/useHandleInternetConnectionForConfirmation';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';

interface Props {
  id: string;
  type: EvmSignatureSupportType;
  payload: ConfirmationDefinitions[EvmSignatureSupportType][0];
  navigation: NativeStackNavigationProp<RootStackParamList>;
  txExpirationTime?: number;
}

const handleConfirm = async (type: EvmSignatureSupportType, id: string, payload: string) => {
  return await completeConfirmation(type, {
    id,
    isApproved: true,
    payload,
  } as ConfirmationResult<string>);
};

const handleCancel = async (type: EvmSignatureSupportType, id: string) => {
  return await completeConfirmation(type, {
    id,
    isApproved: false,
  } as ConfirmationResult<string>);
};

const handleSignature = async (type: EvmSignatureSupportType, id: string, signature: string) => {
  return await completeConfirmation(type, {
    id,
    isApproved: true,
    payload: signature,
  } as ConfirmationResult<string>);
};

export const EvmSignArea = (props: Props) => {
  const { id, payload, type, navigation, txExpirationTime } = props;
  const {
    payload: { address, canSign, hashPayload, errors },
  } = payload;
  const account = useGetAccountByAddress(address);
  const { hideAll, show } = useToast();
  const signMode = useMemo(() => getSignMode(account), [account]);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isShowQr, setIsShowQr] = useState(false);
  const [showQuoteExpired, setShowQuoteExpired] = useState<boolean>(false);
  const { isDeepLinkConnect } = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();
  const isErrorTransaction = useMemo(() => errors && errors.length > 0, [errors]);
  const theme = useSubWalletTheme().swThemes;
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
    handleCancel(type, id).finally(() => {
      dispatch(updateIsDeepLinkConnect(false));
      setLoading(false);
    });
  }, [dispatch, id, type]);

  const onApprovePassword = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      handleConfirm(type, id, '')
        .then(() => {
          isDeepLinkConnect && Minimizer.goBack();
        })
        .finally(() => {
          dispatch(updateIsDeepLinkConnect(false));
          setLoading(false);
        });
    }, 1000);
  }, [dispatch, id, isDeepLinkConnect, type]);

  const onApproveSignature = useCallback(
    (signature: SigData) => {
      setTimeout(() => {
        handleSignature(type, id, signature.signature)
          .catch(e => {
            console.log(e);
          })
          .finally(() => {
            setLoading(false);
          });
      }, 300);
    },
    [id, type],
  );

  const onConfirmQr = useCallback(() => {
    setIsShowQr(true);
  }, []);

  const onSuccess = useCallback(
    (sig: SigData) => {
      setIsShowQr(false);
      setIsScanning(false);
      onApproveSignature && onApproveSignature(sig);
    },
    [onApproveSignature],
  );

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

  const openScanning = useCallback(() => {
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
      {isErrorTransaction && errors && (
        <View style={{ paddingHorizontal: theme.padding, width: '100%', paddingTop: theme.padding }}>
          <AlertBox description={errors[0].message} title={errors[0].name} type={'error'} />
        </View>
      )}
      <ConfirmationFooter>
        <Button
          block={true}
          disabled={loading}
          icon={isErrorTransaction && getButtonIcon(XCircle)}
          type={'secondary'}
          onPress={onCancel}>
          {isErrorTransaction ? i18n.buttonTitles.iUnderstand : i18n.common.cancel}
        </Button>
        {!isErrorTransaction && (
          <Button
            block={true}
            disabled={showQuoteExpired || !canSign || loading}
            icon={getButtonIcon(approveIcon)}
            loading={loading}
            onPress={onConfirm}>
            {i18n.buttonTitles.approve}
          </Button>
        )}
        {!isErrorTransaction && signMode === AccountSignMode.QR && (
          <>
            <DisplayPayloadModal visible={isShowQr} setVisible={setIsShowQr} onOpenScan={openScanning}>
              <>
                <EvmQr
                  address={account?.address || address}
                  hashPayload={hashPayload}
                  isMessage={isEvmMessage(payload)}
                />
                <SignatureScanner visible={isScanning} setVisible={setIsScanning} onSuccess={onSuccess} />
              </>
            </DisplayPayloadModal>
          </>
        )}
      </ConfirmationFooter>
    </>
  );
};
