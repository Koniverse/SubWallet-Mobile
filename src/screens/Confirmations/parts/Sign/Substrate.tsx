import ConfirmationFooter from 'components/common/Confirmation/ConfirmationFooter';
import SignatureScanner from 'components/Scanner/SignatureScanner';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { ExtrinsicPayload } from '@polkadot/types/interfaces';
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
import { RootStackParamList } from 'routes/index';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DeviceEventEmitter, Platform } from 'react-native';
import { OPEN_UNLOCK_FROM_MODAL } from 'components/common/Modal/UnlockModal';
import { updateIsDeepLinkConnect } from 'stores/base/Settings';
import { useToast } from 'react-native-toast-notifications';

interface Props {
  account: AccountJson;
  id: string;
  payload: ExtrinsicPayload | string;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  txExpirationTime?: number;
}

const handleConfirm = async (id: string) => await approveSignPasswordV2({ id });

const handleCancel = async (id: string) => await cancelSignRequest(id);

const handleSignature = async (id: string, { signature }: SigData) => await approveSignSignature(id, signature);

const modeCanSignMessage: AccountSignMode[] = [AccountSignMode.QR, AccountSignMode.PASSWORD];

export const SubstrateSignArea = (props: Props) => {
  const { account, id, payload, navigation, txExpirationTime } = props;
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const { hideAll, show } = useToast();
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isShowQr, setIsShowQr] = useState(false);

  const [showQuoteExpired, setShowQuoteExpired] = useState<boolean>(false);
  const signMode = useMemo(() => getSignMode(account), [account]);
  const isMessage = isSubstrateMessage(payload);
  const dispatch = useDispatch();

  const approveIcon = useMemo((): React.ElementType<IconProps> => {
    switch (signMode) {
      case AccountSignMode.QR:
        return QrCode;
      case AccountSignMode.LEDGER:
        return Swatches;
      default:
        return CheckCircle;
    }
  }, [signMode]);

  const genesisHash = useMemo(() => {
    if (isSubstrateMessage(payload)) {
      return chainInfoMap.polkadot.substrateInfo?.genesisHash || '';
    } else {
      return payload.genesisHash.toHex();
    }
  }, [chainInfoMap.polkadot.substrateInfo?.genesisHash, payload]);

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
    <ConfirmationFooter>
      <Button disabled={loading} block icon={getButtonIcon(XCircle)} type={'secondary'} onPress={onCancel}>
        {i18n.common.cancel}
      </Button>
      <Button
        block
        disabled={showQuoteExpired || (isMessage && !modeCanSignMessage.includes(signMode)) || loading}
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
  );
};
