import { FieldBase, FieldBaseProps } from 'components/Field/Base';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { getNetworkLogo } from 'utils/index';
import { StyleSheet, View } from 'react-native';
import { FontMedium } from 'styles/sharedStyles';
import { CaretDown } from 'phosphor-react-native';
import { _getChainName } from '@subwallet/extension-base/services/chain-service/utils';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Typography } from 'components/design-system-ui';

interface Props extends FieldBaseProps {
  networkKey: string;
  disabled?: boolean;
  showIcon?: boolean;
  placeholder?: string;
}

export const NetworkField = ({ networkKey, disabled, label, showIcon, placeholder = '', ...fieldBase }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme, disabled), [disabled, theme]);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);

  return (
    <FieldBase {...fieldBase} label={label}>
      <View style={styles.blockContent}>
        {networkKey && <View style={styles.logoWrapper}>{getNetworkLogo(networkKey, label ? 20 : 24)}</View>}
        <Typography.Text ellipsis style={networkKey ? styles.text : styles.placeholderText}>
          {chainInfoMap[networkKey] ? _getChainName(chainInfoMap[networkKey]) : placeholder}
        </Typography.Text>
        {!!showIcon && (
          <View style={styles.iconWrapper}>
            <CaretDown size={20} color={theme.colorTextLight3} weight={'bold'} />
          </View>
        )}
      </View>
    </FieldBase>
  );
};

function createStyle(theme: ThemeTypes, disabled?: boolean) {
  return StyleSheet.create({
    text: {
      ...FontMedium,
      color: disabled ? theme.colorTextLight4 : theme.colorTextLight2,
      flex: 1,
    },
    placeholderText: {
      ...FontMedium,
      color: theme.colorTextLight4,
      flex: 1,
    },
    blockContent: { flexDirection: 'row', height: 48, alignItems: 'center', paddingLeft: theme.sizeSM },
    logoWrapper: {
      paddingRight: theme.sizeXS,
    },
    iconWrapper: {
      height: 40,
      width: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.sizeXXS,
    },
  });
}
