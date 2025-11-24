import {
  BitcoinSignatureRequest,
  BitcoinSignPsbtRequest,
  ConfirmationDefinitionsBitcoin,
  ConfirmationResult,
  ExtrinsicType,
} from '@subwallet/extension-base/background/KoniTypes';
import { AccountSignMode } from '@subwallet/extension-base/types';
import { RequestSubmitTransferWithId } from '@subwallet/extension-base/types/balance/transfer';
import { wait } from '@subwallet/extension-base/utils';
import React, { useCallback, useMemo, useState } from 'react';
import { CheckCircle, IconProps, QrCode, Swatches, Wallet, XCircle } from 'phosphor-react-native';
import { getSignMode } from 'utils/account';
import { removeTransactionPersist } from 'utils/transaction';
import { DisplayPayloadModal } from 'screens/Confirmations/parts';
import SignatureScanner from 'components/Scanner/SignatureScanner';
import { ConfirmationFooter } from 'components/common/Confirmation';
import { Button, Icon } from 'components/design-system-ui';
import { BitcoinSignatureSupportType } from 'types/confirmation';
import { SigData } from 'types/signer';
import {
  completeConfirmationBitcoin,
  makeBitcoinDappTransferConfirmation,
  makePSBTTransferAfterConfirmation,
} from 'messaging/index';
import { DeviceEventEmitter, Platform } from 'react-native';
import { OPEN_UNLOCK_FROM_MODAL } from 'components/common/Modal/UnlockModal';
import { useToast } from 'react-native-toast-notifications';
import { updateIsDeepLinkConnect } from 'stores/base/Settings';
import { useDispatch } from 'react-redux';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
import i18n from 'utils/i18n/i18n';

interface Props {
  id: string;
  type: BitcoinSignatureSupportType;
  payload: ConfirmationDefinitionsBitcoin[BitcoinSignatureSupportType][0];
  navigation: NativeStackNavigationProp<RootStackParamList>;
  extrinsicType?: ExtrinsicType;
  editedPayload?: RequestSubmitTransferWithId;
  canSign?: boolean;
}

const handleConfirm = async (type: BitcoinSignatureSupportType, id: string, payload: string) => {
  return await completeConfirmationBitcoin(type, {
    id,
    isApproved: true,
    payload,
  } as ConfirmationResult<string>);
};

const handleCancel = async (type: BitcoinSignatureSupportType, id: string) => {
  return await completeConfirmationBitcoin(type, {
    id,
    isApproved: false,
  } as ConfirmationResult<string>);
};

const handleSignature = async (type: BitcoinSignatureSupportType, id: string, signature: string) => {
  return await completeConfirmationBitcoin(type, {
    id,
    isApproved: true,
    payload: signature,
  } as ConfirmationResult<string>);
};

export const BitcoinSignArea: React.FC<Props> = (props: Props) => {
  const { canSign, editedPayload, extrinsicType, id, payload, type, navigation } = props;
  const [isScanning, setIsScanning] = useState(false);
  const [isShowQr, setIsShowQr] = useState(false);
  const { account } = payload.payload as BitcoinSignatureRequest;
  const { hideAll, show } = useToast();
  const dispatch = useDispatch();
  const signMode = useMemo(() => getSignMode(account), [account]);
  // TODO: [Review] type generic_ledger or legacy_ledger

  const [loading, setLoading] = useState(false);

  const approveIcon = useMemo((): React.ElementType<IconProps> => {
    switch (signMode) {
      case AccountSignMode.QR:
        return QrCode;
      case AccountSignMode.GENERIC_LEDGER:
        return Swatches;
      case AccountSignMode.INJECTED:
        return Wallet;
      default:
        return CheckCircle;
    }
  }, [signMode]);

  // Handle buttons actions
  const onCancel = useCallback(() => {
    setLoading(true);
    handleCancel(type, id).finally(() => {
      setLoading(false);
    });
  }, [id, type]);

  const onApprovePassword = useCallback(() => {
    setLoading(true);

    const promise = async () => {
      if (type === 'bitcoinSendTransactionRequestAfterConfirmation' && editedPayload) {
        await makeBitcoinDappTransferConfirmation(editedPayload);
      } else if (type === 'bitcoinSignPsbtRequest') {
        const {
          payload: { account: _account, broadcast, network, psbt, to, tokenSlug, txInput, txOutput, value },
        } = payload.payload as BitcoinSignPsbtRequest;

        if (broadcast) {
          await makePSBTTransferAfterConfirmation({
            id,
            chain: network,
            txOutput,
            txInput,
            tokenSlug,
            psbt,
            from: _account,
            to,
            value,
          });
        } else {
          await wait(1000);
        }
      } else {
        await wait(1000);
      }
    };

    promise()
      .then(() => {
        handleConfirm(type, id, '').finally(() => {
          setLoading(false);
        });
      })
      .catch(error => {
        console.error(error);
        hideAll();
        show((error as Error).message, { type: 'error' });
      })
      .finally(() => {
        dispatch(updateIsDeepLinkConnect(false));
        setLoading(false);
      });
  }, [dispatch, editedPayload, hideAll, id, payload.payload, show, type]);

  const openScanning = useCallback(() => {
    // setIsShowQr(false);
    setIsScanning(true);
  }, []);

  const onApproveSignature = useCallback(
    (signature: SigData) => {
      setLoading(true);

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

  const onConfirmInject = useCallback(() => {
    console.error('Not implemented yet');
  }, []);

  const { onPress: onConfirmPassword } = useUnlockModal(navigation, setLoading);

  const onConfirm = useCallback(() => {
    removeTransactionPersist(extrinsicType);

    switch (signMode) {
      case AccountSignMode.QR:
        onConfirmQr();
        break;
      case AccountSignMode.INJECTED:
        onConfirmInject();
        break;
      default:
        setLoading(true);
        Platform.OS === 'android' && setTimeout(() => DeviceEventEmitter.emit(OPEN_UNLOCK_FROM_MODAL), 250);
        onConfirmPassword(onApprovePassword)()?.catch(() => {
          setLoading(false);
        });
    }
  }, [extrinsicType, signMode, onConfirmQr, onConfirmInject, onConfirmPassword, onApprovePassword]);

  const onSuccess = useCallback(
    (sig: SigData) => {
      setIsShowQr(false);
      setIsScanning(false);
      onApproveSignature && onApproveSignature(sig);
    },
    [onApproveSignature],
  );

  return (
    <ConfirmationFooter>
      <Button
        disabled={loading}
        icon={<Icon phosphorIcon={XCircle} weight="fill" />}
        onPress={onCancel}
        type={'secondary'}>
        {i18n.common.cancel}
      </Button>
      <Button
        disabled={!(canSign === undefined ? payload.payload.canSign : canSign && payload.payload.canSign)}
        icon={<Icon phosphorIcon={approveIcon} weight="fill" />}
        loading={loading}
        onPress={onConfirm}>
        {i18n.buttonTitles.approve}
      </Button>
      {signMode === AccountSignMode.QR && (
        <>
          <DisplayPayloadModal visible={isShowQr} onOpenScan={openScanning} setVisible={setIsShowQr}>
            <>
              <SignatureScanner visible={isScanning} onSuccess={onSuccess} setVisible={setIsScanning} />
            </>
          </DisplayPayloadModal>
        </>
      )}
    </ConfirmationFooter>
  );
};
