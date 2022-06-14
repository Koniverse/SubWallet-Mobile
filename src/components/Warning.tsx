import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SVGImages } from 'assets/index';
import { sharedStyles } from 'styles/sharedStyles';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props {
  isDanger: boolean;
  isBelowInput?: boolean;
  warningMessage: string;
}

export const Warning = ({ warningMessage, isDanger, isBelowInput = false }: Props) => {
  const theme = useSubWalletTheme().colors;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        warningContainer: {
          backgroundColor: isDanger ? theme.dangerBackgroundColor : theme.warningBackgroundColor,
          borderRadius: 8,
          paddingHorizontal: 15,
          paddingVertical: 12,
          flexDirection: 'row',
        },
        warningMessage: {
          color: theme.textColor,
          paddingLeft: 10,
          ...sharedStyles.smallText,
        },
        warningImage: {
          paddingTop: 5,
        },
      }),
    [isDanger, theme],
  );

  return (
    <View style={styles.warningContainer}>
      <View style={styles.warningImage}>
        {isDanger ? (
          // @ts-ignore
          <SVGImages.DangerIcon width={32} height={32} />
        ) : (
          // @ts-ignore
          <SVGImages.WarningIcon width={32} height={32} />
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.warningMessage}>{warningMessage}</Text>
      </View>
    </View>
  );
};
