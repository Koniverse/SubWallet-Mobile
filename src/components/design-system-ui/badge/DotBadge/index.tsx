import React from 'react';
import { View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import createStyles from './styles';

interface Props {
  children: React.ReactNode;
  dot: boolean;
}

const DotBadge = ({ children, dot }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyles(theme);

  return (
    <>
      <View style={dot && styles.dot} />
      {children}
    </>
  );
};

export default DotBadge;
