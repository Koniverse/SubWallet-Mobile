import React from 'react';
import { Text, View } from 'react-native';
import { PageIcon } from 'components/design-system-ui';
import { ShieldStar } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import ApplyMasterPasswordStyle from './style';

export const Introduction = () => {
  const theme = useSubWalletTheme().swThemes;
  const _style = ApplyMasterPasswordStyle(theme);

  return (
    <View style={{ flex: 1, alignItems: 'center', paddingTop: 48 }}>
      <PageIcon icon={ShieldStar} color={theme.colorSuccess} />
      <Text style={_style.titleStyle}>{'Apply master password'}</Text>
      <Text style={_style.messageStyle}>
        {'Master password created successfully. Please apply the master password to your existing accounts'}
      </Text>
    </View>
  );
};
