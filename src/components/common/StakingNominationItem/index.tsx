import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Icon, Number } from 'components/design-system-ui';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { FontMedium } from 'styles/sharedStyles';
import { toShort } from 'utils/index';
import { NominationInfo } from '@subwallet/extension-base/background/KoniTypes';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import { CheckCircle } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import StakingNominationItemStyle from './style';
import i18n from 'utils/i18n/i18n';

interface Props {
  nominationInfo: NominationInfo;
  isSelected?: boolean;
  onSelectItem?: (value: string) => void;
}

export const StakingNominationItem = ({ nominationInfo, isSelected, onSelectItem }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = StakingNominationItemStyle(theme);
  const { activeStake, chain, validatorAddress, validatorIdentity } = nominationInfo;
  const { decimals, symbol } = useGetNativeTokenBasicInfo(chain);

  return (
    <TouchableOpacity
      style={_style.container}
      onPress={() => {
        onSelectItem && onSelectItem(validatorAddress);
      }}>
      <View style={_style.avatarWrapper}>
        <Avatar
          value={validatorAddress}
          size={40}
          theme={isEthereumAddress(validatorAddress) ? 'ethereum' : 'polkadot'}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={_style.nominationNameTextStyle}>
          {validatorIdentity || toShort(validatorAddress)}
        </Text>

        <View style={_style.contentWrapper}>
          <Text style={_style.bondedAmountLabelTextStyle}>{i18n.message.bonded}</Text>
          <Number
            decimal={decimals}
            suffix={symbol}
            size={12}
            value={activeStake}
            textStyle={{ ...FontMedium }}
            decimalOpacity={0.45}
            intOpacity={0.45}
            unitOpacity={0.45}
          />
        </View>
      </View>

      {isSelected && (
        <View style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
          <Icon phosphorIcon={CheckCircle} iconColor={theme.colorSuccess} size={'sm'} weight={'fill'} />
        </View>
      )}
    </TouchableOpacity>
  );
};
