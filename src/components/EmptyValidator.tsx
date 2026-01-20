import { StyleSheet, View } from 'react-native';
import React from 'react';
import { IconProps } from 'phosphor-react-native';
import { centerStyle, FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { Button, PageIcon, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import i18n from 'utils/i18n/i18n';
import { ThemeTypes } from 'styles/themes';

interface Props {
  icon: React.ElementType<IconProps>;
  title: string;
  message?: string;
  isDataEmpty: boolean;
  validatorTitle: string;
  onClickReload: (val: boolean) => void;
}

export const EmptyValidator = ({ icon, title, message, isDataEmpty, validatorTitle, onClickReload }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyles(theme);

  const handleReload = () => {
    onClickReload(true);
  };

  return (
    <View style={[centerStyle, styles.centerStyle]}>
      <View style={styles.centerStyle}>
        <PageIcon icon={icon} color={theme.colorTextTertiary} backgroundColor={'rgba(77, 77, 77, 0.1)'} />
        <Typography.Text style={styles.titleStyle}>{title}</Typography.Text>
        {isDataEmpty ? (
          <>
            <Typography.Text style={[styles.messageStyle, { paddingTop: theme.paddingXS }]}>
              {i18n.formatString(i18n.message.unableToFetchInformation, validatorTitle)}
            </Typography.Text>
            <Button type={'ghost'} size={'sm'} onPress={handleReload}>
              <Typography.Text style={{ ...FontMedium, color: theme.colorPrimary }}>
                {i18n.buttonTitles.reload}
              </Typography.Text>
            </Button>
          </>
        ) : (
          <>{message && <Typography.Text style={styles.messageStyle}>{message}</Typography.Text>}</>
        )}
      </View>
    </View>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    centerStyle: { justifyContent: 'center', alignItems: 'center' },
    titleStyle: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      ...FontSemiBold,
      color: theme.colorTextLight2,
      paddingTop: theme.padding,
    },
    messageStyle: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      color: theme.colorTextLight4,
      ...FontMedium,
    },
  });
}
