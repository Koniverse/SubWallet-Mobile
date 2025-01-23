import React from 'react';
import { StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import { Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import createStyles from './styles';

interface Props {
  value: number;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const Badge = ({ value, containerStyle, textStyle }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyles(theme);

  return (
    <View style={[styles.container, containerStyle]}>
      <Typography.Text size={'sm'} style={[styles.textStyle, textStyle]}>
        {value}
      </Typography.Text>
    </View>
  );
};

export default Badge;
