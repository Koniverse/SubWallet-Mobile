import Text from 'components/Text';
import { View } from 'react-native';
import React from 'react';
import { IconProps } from 'phosphor-react-native';
import { centerStyle, FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { PageIcon } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props {
  icon: React.ElementType<IconProps>;
  title: string;
  message?: string;
}

export const EmptyList = ({ icon, title, message }: Props) => {
  const theme = useSubWalletTheme().swThemes;
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
      </View>
    </View>
  );
};
