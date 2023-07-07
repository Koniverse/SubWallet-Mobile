import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import React from 'react';
import { Icon, Squircle, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import createStylesheet from './styles/BrowserSearchItem';
import { GlobeHemisphereWest } from 'phosphor-react-native';

interface Props {
  title: string;
  style?: StyleProp<ViewStyle>;
  subtitle: string;
  onPress?: () => void;
}

export const BrowserSearchItem = ({ title, style, onPress, subtitle }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);

  return (
    <View style={[stylesheet.container, style]}>
      <TouchableOpacity onPress={onPress} style={stylesheet.contentWrapper}>
        <View style={stylesheet.logoWrapper}>
          <Squircle customSize={44} backgroundColor={theme.colorBgSecondary} containerStyle={stylesheet.squircleStyle}>
            <View style={stylesheet.logo}>
              <Icon phosphorIcon={GlobeHemisphereWest} weight={'fill'} iconColor={theme.colorTextLight3} size={'md'} />
            </View>
          </Squircle>
        </View>
        <View style={stylesheet.textContentWrapper}>
          <View style={stylesheet.textContentLine1}>
            <Typography.Text ellipsis style={stylesheet.title}>
              {title}
            </Typography.Text>
          </View>
          <View>
            <Typography.Text style={stylesheet.subtitle} ellipsis>
              {subtitle}
            </Typography.Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};
