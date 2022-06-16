import React from 'react';
import { Text, View } from 'react-native';
import { CircleWavyCheck } from 'phosphor-react-native';
interface Props {
  isSelected: boolean;
  itemName: string;
}

export const NetworkAndTokenItemContent = ({ isSelected, itemName }: Props) => {
  return (
    <View>
      <Text>{itemName}</Text>

      {isSelected && <CircleWavyCheck size={20} color={'green'} />}
    </View>
  );
}
