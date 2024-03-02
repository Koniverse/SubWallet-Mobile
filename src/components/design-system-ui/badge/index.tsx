import React from 'react';
import { View } from 'react-native';
import { Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import createStyles from './styles';

interface Props {
  value: number;
}

const Badge = ({ value }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Typography.Text size={'sm'} style={styles.textStyle}>
        {value}
      </Typography.Text>
    </View>
  );
};

export default Badge;
