import React, { useCallback, useMemo, useState } from 'react';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { ExtrinsicPayload } from '@polkadot/types/interfaces';
import { approveSignPasswordV2, cancelSignRequest } from '../../../../messaging';
import { AccountSignMode } from 'types/index';
import { getSignMode } from 'utils/account';
import { isSubstrateMessage } from 'utils/confirmation/confirmation';
import { CheckCircle, IconProps, QrCode, Swatches, XCircle } from 'phosphor-react-native';
import { View } from 'react-native';
import { Button, Icon } from 'components/design-system-ui';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';

interface Props {
  account: AccountJson;
  id: string;
  payload: ExtrinsicPayload | string;
}

const handleConfirm = async (id: string) => await approveSignPasswordV2({ id });

const handleCancel = async (id: string) => await cancelSignRequest(id);

const modeCanSignMessage: AccountSignMode[] = [AccountSignMode.QR, AccountSignMode.PASSWORD];

export const SubstrateSignArea = (props: Props) => {
  const { account, id, payload } = props;

  const [loading, setLoading] = useState(false);

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

  const onCancel = useCallback(() => {
    setLoading(true);
    handleCancel(id).finally(() => {
      setLoading(false);
    });
  }, [id]);

  const onApprovePassword = useCallback(() => {
    setLoading(true);

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

  const onConfirmQr = useCallback(() => {}, []);

  const onConfirm = useCallback(() => {
    switch (signMode) {
      case AccountSignMode.QR:
        onConfirmQr();
        break;
      default:
        onApprovePassword();
    }
  }, [onApprovePassword, onConfirmQr, signMode]);

  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 16, ...MarginBottomForSubmitButton }}>
      <Button
        style={{ marginRight: 6 }}
        disabled={loading}
        block
        icon={<Icon phosphorIcon={XCircle} weight={'fill'} />}
        type={'secondary'}
        onPress={onCancel}>
        {'Cancel'}
      </Button>
      <Button
        style={{ marginLeft: 6 }}
        block
        disabled={isMessage && !modeCanSignMessage.includes(signMode)}
        icon={<Icon phosphorIcon={approveIcon} weight={'fill'} />}
        loading={loading}
        onPress={onConfirm}>
        {'Approve'}
      </Button>
    </View>
  );
};
