import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useMemo } from 'react';
import { ScrollView } from 'react-native';
import createStyle from './styles';

type Props = {
  children: React.ReactNode | React.ReactNode[];
};

const ConfirmationContent: React.FC<Props> = (props: Props) => {
  const { children } = props;
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);

  return <ScrollView style={styles.container}>{children}</ScrollView>;
};

export default ConfirmationContent;
