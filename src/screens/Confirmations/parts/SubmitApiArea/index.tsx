import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DeviceEventEmitter, Platform } from 'react-native';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { getSignMode } from 'utils/account';
import { PhosphorIcon } from 'utils/campaign';
import { AccountSignMode } from '@subwallet/extension-base/types';
import { CheckCircle, QrCode, XCircle } from 'phosphor-react-native';
import { SubmitApiType } from 'types/confirmation';
import {
  ConfirmationDefinitions,
  ConfirmationResult,
  ExtrinsicType,
} from '@subwallet/extension-base/background/KoniTypes';
import { approveSignSignature, completeConfirmation } from 'messaging/confirmation';
import { removeTransactionPersist } from 'utils/transaction';
import { useToast } from 'react-native-toast-notifications';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
import { OPEN_UNLOCK_FROM_MODAL } from 'components/common/Modal/UnlockModal';
import ConfirmationFooter from '../../../../components/common/Confirmation/ConfirmationFooter';
import { Button } from 'components/design-system-ui';
import { getButtonIcon } from 'utils/button';
import i18n from 'utils/i18n/i18n';
import SignatureScanner from 'components/Scanner/SignatureScanner';
import { SigData } from 'types/signer';

interface Props {
  id: string;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  type: SubmitApiType;
  payload: ConfirmationDefinitions[SubmitApiType][0];
  extrinsicType?: ExtrinsicType;
  txExpirationTime?: number;
}

const handleConfirm = async (type: SubmitApiType, id: string, payload: string) => {
  return await completeConfirmation(type, {
    id,
    isApproved: true,
    payload,
  } as ConfirmationResult<string>);
};

const handleCancel = async (type: SubmitApiType, id: string) => {
  return await completeConfirmation(type, {
    id,
    isApproved: false,
  } as ConfirmationResult<string>);
};

const handleSignature = async (id: string, { signature }: SigData) => await approveSignSignature(id, signature);

const SubmitApiArea: React.FC<Props> = (props: Props) => {
  const { extrinsicType, id, navigation, payload, txExpirationTime, type } = props;
  const {
    payload: { address },
  } = payload;
  const account = useGetAccountByAddress(address);
  const signMode = useMemo(() => getSignMode(account), [account]);
  const [showQuoteExpired, setShowQuoteExpired] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const { show, hideAll } = useToast();
  const [isScanning, setIsScanning] = useState(false);

  const approveIcon = useMemo((): PhosphorIcon => {
    switch (signMode) {
      case AccountSignMode.QR:
        return QrCode;
      default:
        return CheckCircle;
    }
  }, [signMode]);

  const onCancel = useCallback(() => {
    setLoading(true);
    handleCancel(type, id).finally(() => {
      setLoading(false);
    });
  }, [id, type]);

  const onApprovePassword = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      handleConfirm(type, id, '').finally(() => {
        setLoading(false);
      });
    }, 1000);
  }, [id, type]);

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
    setIsScanning(true);
  }, []);

  const { onPress: onConfirmPassword } = useUnlockModal(navigation, setLoading);

  const onConfirm = useCallback(() => {
    removeTransactionPersist(extrinsicType);

    if (txExpirationTime) {
      const currentTime = +Date.now();

      if (currentTime >= txExpirationTime) {
        hideAll();
        show('Transaction expired', { type: 'error' });
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
  }, [
    extrinsicType,
    txExpirationTime,
    signMode,
    hideAll,
    show,
    onCancel,
    onConfirmQr,
    onConfirmPassword,
    onApprovePassword,
  ]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

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
      <Button block disabled={showQuoteExpired} icon={getButtonIcon(approveIcon)} loading={loading} onPress={onConfirm}>
        {i18n.buttonTitles.approve}
      </Button>
      {signMode === AccountSignMode.QR && (
        <SignatureScanner visible={isScanning} onSuccess={onApproveSignature} setVisible={setIsScanning} />
      )}
    </ConfirmationFooter>
  );
};

export default SubmitApiArea;
