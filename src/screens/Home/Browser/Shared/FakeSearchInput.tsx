import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import createStylesheet from './styles/FakeSearchInput';
import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Icon, Typography } from 'components/design-system-ui';
import { MagnifyingGlass } from 'phosphor-react-native';
import React from 'react';
import i18n from 'utils/i18n/i18n';

type Props = {
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

export const FakeSearchInput = ({ style, onPress }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);
  return (
    <TouchableOpacity style={[stylesheet.container, style]} onPress={onPress}>
      <View style={stylesheet.iconWrapper}>
        <Icon phosphorIcon={MagnifyingGlass} size={'md'} />
      </View>
      <Typography.Text style={stylesheet.text}>{i18n.placeholder.searchWebsite}</Typography.Text>
    </TouchableOpacity>
  );
};
