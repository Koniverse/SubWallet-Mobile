import React, { useMemo } from 'react';
import { View } from 'react-native';
import { ProcessType } from '@subwallet/extension-base/types';
import { VoidFunction } from 'types/index';
import ProcessStepItem, { ProcessStepItemType } from 'components/ProcessStepItem';
import { Button, SwModal } from 'components/design-system-ui';

export interface TransactionStepsModalProps {
  type: ProcessType;
  items: ProcessStepItemType[];
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}

type Props = TransactionStepsModalProps & {
  onCancel: VoidFunction;
};

const TransactionStepsModal: React.FC<Props> = (props: Props) => {
  const { items, onCancel, type, modalVisible, setModalVisible } = props;

  const modalTitle = useMemo(() => {
    if (type === ProcessType.SWAP) {
      return 'Swap process';
    }

    if (type === ProcessType.EARNING) {
      return 'Stake process';
    }

    return 'Process';
  }, [type]);

  return (
    <SwModal
      modalVisible={modalVisible}
      setVisible={setModalVisible}
      modalTitle={modalTitle}
      titleTextAlign={'center'}
      onChangeModalVisible={onCancel}
      isUseForceHidden={false}>
      <View style={{ width: '100%', justifyContent: 'center' }}>
        {items.map(item => (
          <ProcessStepItem {...item} key={item.index} />
        ))}

        <View style={{ width: '100%', paddingTop: 16 }}>
          <Button onPress={onCancel}>{'Close'}</Button>
        </View>
      </View>
    </SwModal>
  );
};

export default TransactionStepsModal;
