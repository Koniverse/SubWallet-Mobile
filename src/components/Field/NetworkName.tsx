import { FieldBase, FieldBaseProps } from 'components/Field/Base';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { StyleProp, View, ViewStyle } from 'react-native';
import Text from '../../components/Text';
import { FontMedium, FontSize2 } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { Globe } from 'phosphor-react-native';
import { _getChainName } from '@subwallet/extension-base/services/chain-service/utils';
import { Icon } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props extends FieldBaseProps {
  chain: string;
  disabled?: boolean;
  customStyle?: ViewStyle;
}

const getTextStyle = (disabled: boolean): StyleProp<any> => {
  return {
    ...FontSize2,
    ...FontMedium,
    lineHeight: 25,
    paddingLeft: 8,
    paddingRight: 8,
    paddingBottom: 12,
    color: disabled ? ColorMap.disabled : ColorMap.light,
  };
};

const blockContentStyle: StyleProp<any> = {
  position: 'relative',
  paddingHorizontal: 12,
};

export const NetworkNameField = ({ chain, disabled, label, customStyle, ...fieldBase }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);

  return (
    <FieldBase label={label} {...fieldBase}>
      <View style={[blockContentStyle, customStyle, !label && { paddingTop: 12 }]}>
        <View style={{ flexDirection: 'row' }}>
          <Icon phosphorIcon={Globe} size={'md'} iconColor={theme.colorTextLight5} weight={'bold'} />
          <Text style={getTextStyle(!!disabled)}>{chainInfoMap[chain] ? _getChainName(chainInfoMap[chain]) : ''}</Text>
        </View>
      </View>
    </FieldBase>
  );
};
