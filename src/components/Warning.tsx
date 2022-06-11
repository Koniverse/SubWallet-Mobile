import React, {useMemo} from "react";
import {StyleSheet, Text, View} from "react-native";
import {SVGImages} from "assets/index";
import {sharedStyles} from "styles/sharedStyles";
import {useSubWalletTheme} from "hooks/useSubWalletTheme";


interface Props {
  isDanger: boolean,
  isBelowInput: boolean,
  warningMessage: string,
}

export const Warning = ({ warningMessage, isDanger, isBelowInput }: Props) => {
  const theme = useSubWalletTheme().colors;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        warningContainer: {
          display: 'flex',
          backgroundColor: isDanger ? theme.dangerBackgroundColor : theme.warningBackgroundColor,
          borderRadius: 8,
          paddingHorizontal: 15,
          paddingVertical: 12,
          flexDirection: 'row',
        },
        warningMessage: {
          display: 'flex',
          justifyContent: 'center',
          color: theme.textColor,
          marginLeft: 10,
          ...sharedStyles.mainText
        },
        warningImage: {
          paddingTop: 5
        }
      }),[isDanger]
  )


  return (
    <View style={styles.warningContainer}>
      <View style={styles.warningImage}>
        {isDanger
          ?
          (
            // @ts-ignore
            <SVGImages.DangerIcon width={32} height={32} />
          )
          : (
            // @ts-ignore
            <SVGImages.WarningIcon width={32} height={32} />
          )
        }
      </View>

      <Text style={styles.warningMessage}>{warningMessage}</Text>
    </View>
  );
}
