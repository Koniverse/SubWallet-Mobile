import React, { useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageIcon, Typography } from 'components/design-system-ui';
import { MagnifyingGlass } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { VoidFunction } from 'types/index';
import { FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';

interface Props {
  onPressReload: VoidFunction;
}

export const EmptySwapPairs = ({ onPressReload }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyles(theme);

  const handleReload = useCallback(() => {
    onPressReload();
  }, [onPressReload]);

  return (
    <SafeAreaView style={styles.container}>
      <PageIcon icon={MagnifyingGlass} color={theme['gray-4']} weight={'fill'} />

      <Typography.Text style={styles.title}>{'Unable to load data'}</Typography.Text>
      <Typography.Text style={styles.description}>
        <Typography.Text>{'Something went wrong while loading data for this screen.'}</Typography.Text>
        <Typography.Text style={styles.link} onPress={handleReload}>
          {'Reload now'}
        </Typography.Text>
        <Typography.Text>{' to get the new data'}</Typography.Text>
      </Typography.Text>
    </SafeAreaView>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: {
      paddingTop: theme.padding,
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      color: theme.colorTextHeading,
      ...FontSemiBold,
    },
    description: { color: theme.colorTextDescription, textAlign: 'center', paddingHorizontal: theme.paddingXL },
    link: { color: theme.colorPrimary, textDecorationLine: 'underline' },
  });
}
