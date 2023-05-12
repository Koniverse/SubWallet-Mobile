import { UnlockModal } from 'components/common/Modal/UnlockModal';
import ConfirmationFooter from 'components/common/Confirmation/ConfirmationFooter';
import SignatureScanner from 'components/Scanner/SignatureScanner';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import React, { useCallback, useMemo, useState } from 'react';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { ExtrinsicPayload } from '@polkadot/types/interfaces';
import { approveSignPasswordV2, approveSignSignature, cancelSignRequest } from 'messaging/index';
import { useSelector } from 'react-redux';
import { DisplayPayloadModal, SubstrateQr } from 'screens/Confirmations/parts/Qr/DisplayPayload';
import { RootState } from 'stores/index';
import { AccountSignMode } from 'types/index';
import { SigData } from 'types/signer';
import { getSignMode } from 'utils/account';
import { isSubstrateMessage } from 'utils/confirmation/confirmation';
import { CheckCircle, IconProps, QrCode, Swatches, XCircle } from 'phosphor-react-native';
import { Button, Icon } from 'components/design-system-ui';
import i18n from 'utils/i18n/i18n';

interface Props {
  account: AccountJson;
  id: string;
  payload: ExtrinsicPayload | string;
}

const handleConfirm = async (id: string) => await approveSignPasswordV2({ id });

const handleCancel = async (id: string) => await cancelSignRequest(id);

const handleSignature = async (id: string, { signature }: SigData) => await approveSignSignature(id, signature);

const modeCanSignMessage: AccountSignMode[] = [AccountSignMode.QR, AccountSignMode.PASSWORD];

export const SubstrateSignArea = (props: Props) => {
  const { account, id, payload } = props;

  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);

  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isShowQr, setIsShowQr] = useState(false);

  const signMode = useMemo(() => getSignMode(account), [account]);
  const isMessage = isSubstrateMessage(payload);

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
    });
  }, [id]);

  const onApprovePassword = useCallback(() => {
    setTimeout(() => {
      handleConfirm(id)
        .catch(e => {
          console.log(e);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 1000);
  }, [id]);

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
    setIsScanning(false);
  }, []);

  const { onPress: onConfirmPassword, onPasswordComplete, visible, onHideModal } = useUnlockModal();

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

  const onSuccess = useCallback(
    (sig: SigData) => {
      setIsScanning(false);
      onApproveSignature && onApproveSignature(sig);
    },
    [onApproveSignature],
  );

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
        disabled={loading}
        block
        icon={<Icon phosphorIcon={XCircle} weight={'fill'} />}
        type={'secondary'}
        onPress={onCancel}>
        {i18n.common.cancel}
      </Button>
      <Button
        block
        disabled={(isMessage && !modeCanSignMessage.includes(signMode)) || loading}
        icon={<Icon phosphorIcon={approveIcon} weight={'fill'} />}
        loading={loading}
        onPress={onConfirm}>
        {i18n.common.approve}
      </Button>
      {signMode === AccountSignMode.QR && (
        <>
          <DisplayPayloadModal visible={isShowQr} onClose={hideScanning} onOpenScan={openScanning}>
            <SubstrateQr address={account.address} genesisHash={genesisHash} payload={payload || ''} />
          </DisplayPayloadModal>
          <SignatureScanner visible={isScanning} onHideModal={hideScanning} onSuccess={onSuccess} />
        </>
      )}
      <UnlockModal onPasswordComplete={onPasswordComplete} visible={visible} onHideModal={onHideModal} />
    </ConfirmationFooter>
  );
};
