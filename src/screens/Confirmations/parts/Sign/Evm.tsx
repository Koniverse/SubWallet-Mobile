import { UnlockModal } from 'components/common/Modal/UnlockModal';
import ConfirmationFooter from 'components/Confirmation/ConfirmationFooter';
import SignatureScanner from 'components/Scanner/SignatureScanner';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import React, { useCallback, useMemo, useState } from 'react';
import { Button, Icon } from 'components/design-system-ui';
import { CheckCircle, IconProps, QrCode, Swatches, XCircle } from 'phosphor-react-native';
import { DisplayPayloadModal, EvmQr } from 'screens/Confirmations/parts/Qr/DisplayPayload';
import { EvmSignatureSupportType } from 'types/confirmation';
import { completeConfirmation } from 'messaging/index';
import { ConfirmationDefinitions, ConfirmationResult } from '@subwallet/extension-base/background/KoniTypes';
import { SigData } from 'types/signer';
import { getSignMode } from 'utils/account';
import { AccountSignMode } from 'types/index';
import { isEvmMessage } from 'utils/confirmation/confirmation';
import i18n from 'utils/i18n/i18n';

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
      handleConfirm(type, id, '').finally(() => {
        setLoading(false);
      });
    }, 1000);
  }, [id, type]);

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
    setIsScanning(false);
  }, []);

  const onSuccess = useCallback(
    (sig: SigData) => {
      setIsScanning(false);
      onApproveSignature && onApproveSignature(sig);
    },
    [onApproveSignature],
  );

  const { onPress: onConfirmPassword, onPasswordComplete, visible, onHideModal } = useUnlockModal(onApprovePassword);

  const onConfirm = useCallback(() => {
    switch (signMode) {
      case AccountSignMode.QR:
        onConfirmQr();
        break;
      default:
        setLoading(true);
        onConfirmPassword().catch(() => {
          setLoading(false);
        });
    }
  }, [onConfirmPassword, onConfirmQr, signMode]);

  const openScanning = useCallback(() => {
    setIsShowQr(false);
    setIsScanning(true);
  }, []);

  const hideScanning = useCallback(() => {
    setIsShowQr(false);
    setIsScanning(false);
  }, []);

  return (
    <ConfirmationFooter>
      <Button
        block={true}
        disabled={loading}
        icon={<Icon phosphorIcon={XCircle} weight={'fill'} />}
        type={'secondary'}
        onPress={onCancel}>
        {i18n.common.cancel}
      </Button>
      <Button
        block={true}
        disabled={!canSign}
        icon={<Icon phosphorIcon={approveIcon} weight={'fill'} />}
        loading={loading}
        onPress={onConfirm}>
        {i18n.common.approve}
      </Button>
      {signMode === AccountSignMode.QR && (
        <>
          <DisplayPayloadModal visible={isShowQr} onClose={hideScanning} onOpenScan={openScanning}>
            <EvmQr address={account.address} hashPayload={hashPayload} isMessage={isEvmMessage(payload)} />
          </DisplayPayloadModal>
          <SignatureScanner visible={isScanning} onHideModal={hideScanning} onSuccess={onSuccess} />
        </>
      )}
      <UnlockModal onPasswordComplete={onPasswordComplete} visible={visible} onHideModal={onHideModal} />
    </ConfirmationFooter>
  );
};
