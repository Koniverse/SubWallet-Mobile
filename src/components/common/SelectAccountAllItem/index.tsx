import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { VoidFunction } from 'types/index';
import {
  AccountProxyAvatarGroup,
  BasicAccountProxyInfo,
} from 'components/design-system-ui/avatar/account-proxy-avatar-group';
import { Icon, Typography } from 'components/design-system-ui';
import { CheckCircle } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';
import { FontSemiBold } from 'styles/sharedStyles';

interface Props {
  isSelected?: boolean;
  onPress?: VoidFunction;
  showUnSelectedIcon?: boolean;
  accountProxies?: BasicAccountProxyInfo[];
}

export const SelectAccountAllItem = ({ isSelected, accountProxies, showUnSelectedIcon, onPress }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyleSheet(theme);
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.itemLeftPart}>
        <AccountProxyAvatarGroup accountProxies={accountProxies} />
      </View>
      <Typography.Text style={{ color: theme.colorWhite, ...FontSemiBold }}>{'All accounts'}</Typography.Text>
      <View style={styles.itemRightPart}>
        {(showUnSelectedIcon || isSelected) && (
          <View style={styles.checkedIconWrapper}>
            <Icon
              phosphorIcon={CheckCircle}
              iconColor={isSelected ? theme.colorSuccess : theme.colorTextLight4}
              size={'sm'}
              weight={'fill'}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

function createStyleSheet(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.colorBgSecondary,
      paddingLeft: theme.paddingSM,
      paddingRight: theme.paddingXXS,
      paddingVertical: theme.padding - 2,
      marginHorizontal: theme.margin,
      borderRadius: theme.borderRadiusLG,
      justifyContent: 'center',
      gap: theme.sizeXS,
      marginBottom: theme.marginXS,
    },
    itemLeftPart: {},
    itemMiddlePart: {
      flex: 1,
    },
    itemRightPart: {
      flex: 1, // Adjust flex or width as per design
      alignItems: 'flex-end', // Align the icon to the right
    },
    checkedIconWrapper: {
      width: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}
