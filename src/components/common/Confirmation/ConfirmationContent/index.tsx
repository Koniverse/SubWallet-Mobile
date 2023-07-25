import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useMemo } from 'react';
import { ScrollView } from 'react-native';
import createStyle from './styles';

type Props = {
  children: React.ReactNode | React.ReactNode[];
  gap?: number;
  isFullHeight?: boolean;
};

const ConfirmationContent: React.FC<Props> = (props: Props) => {
  const { children, gap, isFullHeight } = props;
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme, gap), [theme, gap]);

  return (
    <ScrollView
      style={[styles.container, isFullHeight ? { height: '100%' } : { maxHeight: '70%' }]}
      contentContainerStyle={styles.content}>
      {children}
    </ScrollView>
  );
};

export default ConfirmationContent;
