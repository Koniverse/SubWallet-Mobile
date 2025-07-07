import React, { useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { ProcessType } from '@subwallet/extension-base/types';
import { VoidFunction } from 'types/index';
import { Button, SwModal } from 'components/design-system-ui';
import { TransactionProcessStepItemType } from 'types/component';
import { TransactionProcessStepItem } from 'components/TransactionProcess/TransactionProcessStepItem';

export interface TransactionStepsModalProps {
  type: ProcessType;
  items: TransactionProcessStepItemType[];
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  variant?: 'standard' | 'simple';
}

type Props = TransactionStepsModalProps & {
  onCancel: VoidFunction;
};

const TransactionStepsModal: React.FC<Props> = (props: Props) => {
  const { items, onCancel, type, modalVisible, setModalVisible } = props;
  const [heights, setHeights] = useState<number[]>([]);
  const ItemComponent = TransactionProcessStepItem;

  const handleLayout = useCallback(
    (_index: number, event: LayoutChangeEvent) => {
      const newHeights = [...heights];
      newHeights[_index] = event.nativeEvent.layout.height;

      setHeights(newHeights);
    },
    [heights],
  );

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
          <ItemComponent {...item} key={item.index} handleLayout={handleLayout} heights={heights} />
        ))}

        <View style={{ width: '100%', paddingTop: 16 }}>
          <Button onPress={onCancel}>{'Close'}</Button>
        </View>
      </View>
    </SwModal>
  );
};

export default TransactionStepsModal;
