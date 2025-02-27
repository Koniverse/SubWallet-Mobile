import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { deviceHeight, deviceWidth } from 'constants/index.ts';
import { Images } from 'assets/index.ts';
import { Button, Icon, Image, PageIcon, Typography } from 'components/design-system-ui';
import Text from 'components/Text.tsx';
import i18n from 'utils/i18n/i18n.ts';
import { Warning } from 'phosphor-react-native';
import { FontMedium, FontSemiBold, STATUS_BAR_HEIGHT } from 'styles/sharedStyles.ts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SWTheme } from 'styles/themes.ts';
import { ColorMap } from 'styles/color.ts';
import { VoidFunction } from 'types/index.ts';

interface Props {
  onPressBtn: VoidFunction;
  theme: SWTheme;
  buttonTitle: string;
  alertText: string;
  headerText: string;
}

export const AlertModal = ({ alertText, onPressBtn, theme, buttonTitle, headerText }: Props) => {
  const insets = useSafeAreaInsets();
  const styles = createStyleSheet(theme);
  return (
    <View style={styles.container}>
      <ImageBackground source={Images.backgroundImg} resizeMode={'contain'} style={styles.imageBackgroundStyle}>
        <View
          style={styles.logoContainer}>
          <Image src={Images.SubWalletLogoGradient} style={{ width: 66, height: 100 }} />
          <Text style={styles.logoTextStyle}>SubWallet</Text>
          <Text style={styles.logoSubTextStyle}>{i18n.title.slogan}</Text>
        </View>
        <View
          style={styles.alertContainer}>
          <View style={styles.alertWrapper}>
            <View style={styles.alertHeader} />
            <Typography.Title style={styles.alertTextHeader}>
              {headerText}
            </Typography.Title>
            <PageIcon
              customIcon={<Icon phosphorIcon={Warning} iconColor={theme.swThemes.colorWarning} customSize={64} />}
              color={theme.swThemes.colorWarning}
              backgroundColor={'rgba(217, 197, 0, 0.1)'}
            />
            <Typography.Text style={styles.alertTextStyle}>
              {alertText}
            </Typography.Text>
          </View>
          <Button onPress={onPressBtn} style={{ margin: 16 }}>
            {buttonTitle}
          </Button>
          <View style={{ paddingBottom: insets.bottom }} />
        </View>
      </ImageBackground>
    </View>
  );
};

function createStyleSheet(theme: SWTheme) {
  return StyleSheet.create({
    container: { width: deviceWidth, height: deviceHeight, justifyContent: 'flex-end' },
    logoContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingBottom: 40,
      alignItems: 'center',
      backgroundColor: theme.swThemes.colorBgSecondary,
      opacity: 0.3,
      marginBottom: -32,
    },
    alertContainer: {
      maxHeight: deviceHeight * 0.6,
      backgroundColor: theme.swThemes.colorBgDefault,
      borderTopLeftRadius: theme.swThemes.borderRadiusXXL,
      borderTopRightRadius: theme.swThemes.borderRadiusXXL,
    },
    imageBackgroundStyle: {
      justifyContent: 'flex-end',
      position: 'relative',
      width: deviceWidth,
      height: deviceHeight + STATUS_BAR_HEIGHT,
      backgroundColor: 'black',
    },
    logoTextStyle: {
      fontSize: 38,
      lineHeight: 46,
      ...FontSemiBold,
      color: ColorMap.light,
      paddingTop: 9,
    },
    logoSubTextStyle: {
      fontSize: 16,
      lineHeight: 24,
      ...FontMedium,
      color: 'rgba(255, 255, 255, 0.65)',
      paddingTop: 12,
    },
    alertWrapper: {
      paddingTop: theme.swThemes.paddingXS,
      paddingHorizontal: theme.swThemes.padding,
      alignItems: 'center',
    },
    alertHeader: {
      width: 70,
      height: 5,
      borderRadius: 100,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      marginBottom: 16,
    },
    alertTextHeader: {
      color: theme.swThemes.colorWhite,
      fontSize: theme.swThemes.fontSizeXL,
      lineHeight: theme.swThemes.fontSizeXL * theme.swThemes.lineHeightHeading4,
      paddingBottom: theme.swThemes.paddingXL,
    },
    alertTextStyle: {
      color: theme.swThemes.colorTextLight4,
      textAlign: 'center',
      paddingTop: theme.swThemes.paddingMD,
      ...FontMedium,
    },
  });
}
