import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Avatar from 'react-native-boring-avatars';
import { Image } from 'components/design-system-ui';
import { ThemeTypes } from 'styles/themes';
import { Images } from 'assets/index';

interface Props {
  value?: string | null;
  size?: number;
}

export const AccountProxyAvatar = (props: Props) => {
  const { size = 40, value } = props;
  const themes = useSubWalletTheme().swThemes;
  const styles = createStyle(themes);

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, minWidth: size, borderWidth: size * 0.05, borderRadius: size },
      ]}>
      {value ? (
        <Avatar
          colors={['#004BFF', '#4CEAAC', '#0C0C0C', '#1A1A1A', '#FFFFFF']}
          name={value}
          size={size * 0.7}
          variant="bauhaus"
        />
      ) : (
        <Image style={{ width: size * 0.7, height: size * 0.7 }} src={Images.avatarPlaceholder} />
      )}
    </View>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      borderColor: theme.colorPrimary,
      borderStyle: 'solid',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
