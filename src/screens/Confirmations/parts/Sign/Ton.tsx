import { useToast } from 'react-native-toast-notifications';
import { TonSignatureSupportType } from 'types/confirmation';
import {
  ConfirmationDefinitionsTon,
  ConfirmationResult,
  ExtrinsicType,
} from '@subwallet/extension-base/background/KoniTypes';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle, IconProps, XCircle } from 'phosphor-react-native';
import { ConfirmationFooter } from 'components/common/Confirmation';
import { Button } from 'components/design-system-ui';
import { getButtonIcon } from 'utils/button';
import i18n from 'utils/i18n/i18n';
import { completeConfirmationTon } from 'messaging/index';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
import { DeviceEventEmitter, Platform } from 'react-native';
import { OPEN_UNLOCK_FROM_MODAL } from 'components/common/Modal/UnlockModal';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  id: string;
  type: TonSignatureSupportType;
  payload: ConfirmationDefinitionsTon[TonSignatureSupportType][0];
  extrinsicType?: ExtrinsicType;
  txExpirationTime?: number;
}

const handleConfirm = async (type: TonSignatureSupportType, id: string, payload: string) => {
  return await completeConfirmationTon(type, {
    id,
    isApproved: true,
    payload,
  } as ConfirmationResult<string>);
};

const handleCancel = async (type: TonSignatureSupportType, id: string) => {
  return await completeConfirmationTon(type, {
    id,
    isApproved: false,
  } as ConfirmationResult<string>);
};

export const TonSignArea = (props: Props) => {
  const { id, txExpirationTime, type, navigation } = props;
  const { hideAll, show } = useToast();
  const [loading, setLoading] = useState(false);
  const [showQuoteExpired, setShowQuoteExpired] = useState<boolean>(false);

  const approveIcon = useMemo((): React.ElementType<IconProps> => {
    return CheckCircle;
  }, []);

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

  const { onPress: onConfirmPassword } = useUnlockModal(navigation, setLoading);

  const onConfirm = useCallback(() => {
    // removeTransactionPersist(extrinsicType);
    if (txExpirationTime) {
      const currentTime = +Date.now();

      if (currentTime >= txExpirationTime) {
        hideAll();
        show('Transaction expired', { type: 'danger' });
        onCancel();
      }
    }

    setLoading(true);
    Platform.OS === 'android' && setTimeout(() => DeviceEventEmitter.emit(OPEN_UNLOCK_FROM_MODAL), 250);
    onConfirmPassword(onApprovePassword)()?.catch(() => {
      setLoading(false);
    });
  }, [hideAll, onApprovePassword, onCancel, onConfirmPassword, show, txExpirationTime]);

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
        disabled={showQuoteExpired || loading}
        icon={getButtonIcon(approveIcon)}
        loading={loading}
        onPress={onConfirm}>
        {i18n.buttonTitles.approve}
      </Button>
    </ConfirmationFooter>
  );
};
