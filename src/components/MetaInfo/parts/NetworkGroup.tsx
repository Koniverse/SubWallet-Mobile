import React from 'react';
import { View } from 'react-native';
import { Logo, Typography } from 'components/design-system-ui';

export interface NetworkGroupProps {
  chains: string[];
}

const NetworkGroup = ({ chains }: NetworkGroupProps) => {
  const countMore: number = chains.length - 3;

  return (
    <View>
      {chains.slice(0, 3).map((chain, index) => {
        return (
          <View key={index}>
            <Logo network={chain} size={16} shape={'circle'} />
          </View>
        );
      })}
      {countMore > 0 && <Typography.Text>{`+${countMore}`}</Typography.Text>}
    </View>
  );
};

export default NetworkGroup;
