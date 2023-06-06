import React, { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import StakingTabStyle from './style';
import { StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { DisabledStyle } from 'styles/sharedStyles';

interface Props {
  selectedType: StakingType;
  onSelectType: (type: StakingType) => void;
  from: string;
}

export const StakingTab = ({ selectedType, onSelectType, from }: Props) => {
  const currentAccount = useSelector((state: RootState) => state.accountState.currentAccount);
  const theme = useSubWalletTheme().swThemes;
  const _style = StakingTabStyle(theme);

  const _onSelectType = (value: StakingType) => {
    if (value !== selectedType) {
      onSelectType(value);
    }
  };

  const isDisabled = useMemo(
    () => isEthereumAddress(currentAccount?.address) && isEthereumAddress(from),
    [currentAccount?.address, from],
  );

  return (
    <View style={_style.container}>
      <TouchableOpacity
        disabled={isDisabled}
        activeOpacity={BUTTON_ACTIVE_OPACITY}
        style={[_style.item, selectedType === StakingType.POOLED && _style.selectedItem, isDisabled && DisabledStyle]}
        onPress={() => _onSelectType(StakingType.POOLED)}>
        <Text style={_style.itemText}>Pools</Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={BUTTON_ACTIVE_OPACITY}
        style={[_style.item, selectedType === StakingType.NOMINATED && _style.selectedItem]}
        onPress={() => _onSelectType(StakingType.NOMINATED)}>
        <Text style={_style.itemText}>Nominate</Text>
      </TouchableOpacity>
    </View>
  );
};
