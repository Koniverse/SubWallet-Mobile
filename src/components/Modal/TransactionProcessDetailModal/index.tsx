import React, { useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ProcessTransactionData, ProcessType, ResponseSubscribeProcessById } from '@subwallet/extension-base/types';
import { cancelSubscription, subscribeProcess } from '../../../messaging';
import { Button, Divider, SwModal } from '../../design-system-ui';
import CurrentProcessStep from 'components/Modal/TransactionProcessDetailModal/parts/CurrentProcessStep';
import TransactionInfoBlock from 'components/Modal/TransactionProcessDetailModal/parts/TransactionInfoBlock';
import ProcessStepList from 'components/Modal/TransactionProcessDetailModal/parts/ProcessStepList';
import { deviceHeight } from 'constants/index';
interface Props {
  processId: string;
  onCancel: () => void;
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
}

const TransactionProcessDetailModal: React.FC<Props> = (props: Props) => {
  const { processId, onCancel, modalVisible, setModalVisible } = props;
  const theme = useSubWalletTheme().swThemes;

  const [processData, setProcessData] = useState<ProcessTransactionData | undefined>();

  const modalTitle = useMemo(() => {
    if (!processData) {
      return '';
    }

    if (processData.type === ProcessType.SWAP) {
      return 'Swap details';
    }

    if (processData.type === ProcessType.EARNING) {
      return 'Stake details';
    }

    return 'Transaction details';
  }, [processData]);

  useEffect(() => {
    let cancel = false;
    let id = '';

    const _onCancel = () => {
      if (id) {
        cancelSubscription(id).catch(console.error);
      }
    };

    if (!processId) {
      setModalVisible(false);
    } else {
      const updateProcess = (data: ResponseSubscribeProcessById) => {
        if (!cancel) {
          id = data.id;
          setProcessData(data.process);
        } else {
          _onCancel();
        }
      };

      subscribeProcess({ processId }, updateProcess)
        .then(updateProcess)
        .catch(e => console.log('e', e));
    }

    return () => {
      cancel = true;
      _onCancel();
    };
  }, [processId, setModalVisible]);

  const footer = useMemo(() => {
    return (
      <View style={{ paddingTop: theme.padding }}>
        <Button onPress={onCancel}>{'Close'}</Button>
      </View>
    );
  }, [onCancel, theme.padding]);

  if (!processData) {
    return null;
  }

  return (
    <SwModal
      modalVisible={modalVisible}
      setVisible={setModalVisible}
      modalTitle={modalTitle}
      isUseModalV2
      onChangeModalVisible={onCancel}
      isAllowSwipeDown={Platform.OS === 'ios'}
      titleTextAlign={'center'}
      footer={footer}>
      <ScrollView
        style={{ maxHeight: deviceHeight * 0.6 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: theme.size }}>
        <CurrentProcessStep processData={processData} />
        <TransactionInfoBlock processData={processData} />
        <Divider color={theme.colorBgInput} style={{ width: '100%' }} />
        <ProcessStepList processData={processData} />
      </ScrollView>
    </SwModal>
  );
};

export default TransactionProcessDetailModal;
