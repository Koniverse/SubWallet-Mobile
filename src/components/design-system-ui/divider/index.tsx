import React from 'react';
import { View, ViewStyle } from 'react-native';
import DividerStyles from './style';

interface Props {
  color?: string;
  dashed?: boolean;
  type?: 'horizontal' | 'vertical';
  style?: ViewStyle;
}

const Divider: React.FC<Props> = ({ color = '#212121', dashed, style }) => {
  const _styles = DividerStyles();
  const dividerStyle = [_styles.dividerStyle];

  return (
    <View style={[{ overflow: 'hidden', width: '100%' }, style]}>
      <View
        style={[
          dividerStyle,
          {
            borderStyle: dashed ? 'dashed' : 'solid',
            borderColor: color,
          },
        ]}
      />
    </View>
  );
};

export default Divider;
