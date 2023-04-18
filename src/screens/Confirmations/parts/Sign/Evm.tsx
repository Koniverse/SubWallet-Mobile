import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Button, Icon } from 'components/design-system-ui';
import { CheckCircle, IconProps, QrCode, Swatches, XCircle } from 'phosphor-react-native';
import { EvmSignatureSupportType } from 'types/confirmation';
import { completeConfirmation } from 'messaging/index';
import { ConfirmationDefinitions, ConfirmationResult } from '@subwallet/extension-base/background/KoniTypes';
import { getSignMode } from 'utils/account';
import { AccountSignMode } from 'types/index';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';

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

export const EvmSignArea = (props: Props) => {
  const { id, payload, type } = props;
  const {
    payload: { account, canSign },
  } = payload;
  const signMode = useMemo(() => getSignMode(account), [account]);
  const [loading, setLoading] = useState(false);

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

  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 16, ...MarginBottomForSubmitButton }}>
      <Button
        style={{ marginRight: 6 }}
        disabled={loading}
        icon={<Icon phosphorIcon={XCircle} weight={'fill'} />}
        type={'secondary'}
        onPress={onCancel}>
        {'Cancel'}
      </Button>
      <Button
        style={{ marginLeft: 6 }}
        disabled={!canSign}
        icon={<Icon phosphorIcon={approveIcon} weight={'fill'} />}
        loading={loading}
        onPress={onApprovePassword}>
        {'Approve'}
      </Button>
    </View>
  );
};
