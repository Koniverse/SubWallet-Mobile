import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useMemo } from 'react';
import { ScrollView, ViewStyle } from 'react-native';
import createStyle from './styles';

type Props = {
  children: React.ReactNode | React.ReactNode[];
  gap?: number;
  isFullHeight?: boolean;
  containerStyle?: ViewStyle;
};

const ConfirmationContent: React.FC<Props> = (props: Props) => {
  const { children, gap, containerStyle } = props;
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme, gap), [theme, gap]);

  return (
    <ScrollView style={[styles.container, containerStyle]} contentContainerStyle={styles.content}>
      {children}
    </ScrollView>
  );
};

export default ConfirmationContent;
