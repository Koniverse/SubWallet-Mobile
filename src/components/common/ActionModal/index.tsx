import React from 'react';
import { SelectItem, SwModal } from 'components/design-system-ui';
import { Alarm, ArrowCircleDown, ArrowClockwise, MinusCircle, PlusCircle, Wallet } from 'phosphor-react-native';
import { View } from 'react-native';
import { SelectItemProps } from 'components/design-system-ui/select-item';

interface Props {
  modalVisible: boolean;
  modalTitle: string;
}

export const ActionModal = ({ modalTitle, modalVisible }: Props) => {
  const actionList: SelectItemProps[] = [
    {
      icon: PlusCircle,
      iconColor: 'green-6',
      label: 'Stake more',
      onPress: () => {},
    },
    {
      icon: MinusCircle,
      iconColor: 'magenta-6',
      label: 'Unstake funds',
      onPress: () => {},
    },
    {
      icon: ArrowCircleDown,
      label: 'Withdraw',
      onPress: () => {},
    },
    {
      icon: Wallet,
      iconColor: 'green-7',
      label: 'Claim rewards',
      onPress: () => {},
    },
    {
      icon: Alarm,
      iconColor: 'blue-7',
      label: 'Compound',
      onPress: () => {},
    },
    {
      icon: ArrowClockwise,
      iconColor: 'purple-8',
      label: 'Return to stake',
      onPress: () => {},
    },
  ];
  return (
    <SwModal modalVisible={modalVisible} modalTitle={modalTitle}>
      <View>
        {actionList.map(item => (
          <SelectItem
            key={item.label}
            label={item.label}
            icon={item.icon}
            iconColor={item.iconColor}
            onPress={item.onPress}
          />
        ))}
      </View>
    </SwModal>
  );
};
