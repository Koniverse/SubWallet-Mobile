import Text from 'components/Text';
import { View } from 'react-native';
import React from 'react';
import { IconProps } from 'phosphor-react-native';
import { centerStyle, FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { Button, PageIcon, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import i18n from 'utils/i18n/i18n';

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

  const handleReload = () => {
    onClickReload(true);
  };

  return (
    <View style={[centerStyle, { justifyContent: 'center', alignItems: 'center' }]}>
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <PageIcon icon={icon} color={theme.colorTextTertiary} backgroundColor={'rgba(77, 77, 77, 0.1)'} />
        <Text
          style={{
            fontSize: theme.fontSizeLG,
            lineHeight: theme.fontSizeLG * theme.lineHeightLG,
            ...FontSemiBold,
            color: theme.colorTextLight2,
            paddingTop: theme.padding,
          }}>
          {title}
        </Text>
        {isDataEmpty ? (
          <>
            <Text
              style={{
                fontSize: theme.fontSize,
                lineHeight: theme.fontSize * theme.lineHeight,
                color: theme.colorTextLight4,
                ...FontMedium,
                paddingTop: 8,
              }}>
              {i18n.formatString(i18n.message.unableToFetchInformation, validatorTitle)}
            </Text>
            <Button type={'ghost'} size={'sm'} onPress={handleReload}>
              <Typography.Text style={{ ...FontMedium, color: theme.colorPrimary }}>
                {i18n.buttonTitles.reload}
              </Typography.Text>
            </Button>
          </>
        ) : (
          <>
            {message && (
              <Text
                style={{
                  fontSize: theme.fontSize,
                  lineHeight: theme.fontSize * theme.lineHeight,
                  color: theme.colorTextLight4,
                  ...FontMedium,
                }}>
                {message}
              </Text>
            )}
          </>
        )}
      </View>
    </View>
  );
};
