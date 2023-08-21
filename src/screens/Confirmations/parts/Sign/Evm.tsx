import ConfirmationFooter from 'components/common/Confirmation/ConfirmationFooter';
import SignatureScanner from 'components/Scanner/SignatureScanner';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import React, { useCallback, useMemo, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { updateIsDeepLinkConnect } from 'stores/base/Settings';
import { Minimizer } from '../../../../NativeModules';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';

interface Props {
  id: string;
  type: EvmSignatureSupportType;
  payload: ConfirmationDefinitions[EvmSignatureSupportType][0];
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
  const { id, payload, type } = props;
  const {
    payload: { account, canSign, hashPayload },
  } = payload;
  const signMode = useMemo(() => getSignMode(account), [account]);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isShowQr, setIsShowQr] = useState(false);
  const navigation = useNavigation<RootNavigationProps>();
  const { isDeepLinkConnect } = useSelector((state: RootState) => state.settings);
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

  const onCancel = useCallback(() => {
    setLoading(true);
    handleCancel(type, id).finally(() => {
      setLoading(false);
    });
  }, [id, type]);

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
    switch (signMode) {
      case AccountSignMode.QR:
        onConfirmQr();
        break;
      default:
        setLoading(true);
        onConfirmPassword(onApprovePassword)()?.catch(() => {
          setLoading(false);
        });
    }
  }, [onApprovePassword, onConfirmPassword, onConfirmQr, signMode]);

  const openScanning = useCallback(() => {
    setIsScanning(true);
  }, []);

  return (
    <ConfirmationFooter>
      <Button block={true} disabled={loading} icon={getButtonIcon(XCircle)} type={'secondary'} onPress={onCancel}>
        {i18n.common.cancel}
      </Button>
      <Button
        block={true}
        disabled={!canSign || loading}
        icon={getButtonIcon(approveIcon)}
        loading={loading}
        onPress={onConfirm}>
        {i18n.buttonTitles.approve}
      </Button>
      {signMode === AccountSignMode.QR && (
        <>
          <DisplayPayloadModal visible={isShowQr} setVisible={setIsShowQr} onOpenScan={openScanning}>
            <>
              <EvmQr address={account.address} hashPayload={hashPayload} isMessage={isEvmMessage(payload)} />
              <SignatureScanner visible={isScanning} setVisible={setIsScanning} onSuccess={onSuccess} />
            </>
          </DisplayPayloadModal>
        </>
      )}
    </ConfirmationFooter>
  );
};
