import React from 'react';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { TouchableOpacity, View } from 'react-native';
import { Avatar, Icon, Typography, Number } from 'components/design-system-ui';
import { UnstakingStatus } from '@subwallet/extension-base/background/KoniTypes';
import { CheckCircle, Spinner } from 'phosphor-react-native';
import { UnstakeItem } from 'components/Modal/common/CancelUnstakeSelector';
import { toShort } from 'utils/index';
import { isEthereumAddress } from '@polkadot/util-crypto';
import CancelUnstakeItemStyle from './style';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import { FontSemiBold } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';

interface Props {
  item: UnstakeItem;
  isSelected?: boolean;
  onPress?: () => void;
}

export const CancelUnstakeItem = ({ item, isSelected, onPress }: Props) => {
  const { validatorAddress, status, claimable, chain } = item;
  const theme = useSubWalletTheme().swThemes;
  const _style = CancelUnstakeItemStyle(theme);

  const { decimals, symbol } = useGetNativeTokenBasicInfo(chain);

  const subTextStyle = {
    ..._style.subTextStyle,
    color: status === UnstakingStatus.CLAIMABLE ? theme.colorSuccess : theme.colorWarning,
  };

  return (
    <TouchableOpacity style={_style.container} onPress={onPress}>
      {!!validatorAddress && (
        <Avatar
          value={validatorAddress}
          size={40}
          theme={isEthereumAddress(validatorAddress) ? 'ethereum' : 'polkadot'}
        />
      )}
      <View style={[{ flex: 1 }, !!validatorAddress && { paddingLeft: theme.paddingXS }]}>
        {validatorAddress && <Typography.Text style={_style.textStyle}>{toShort(validatorAddress)}</Typography.Text>}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon
            iconColor={status === UnstakingStatus.CLAIMABLE ? theme.colorSuccess : theme.colorWarning}
            phosphorIcon={status === UnstakingStatus.CLAIMABLE ? CheckCircle : Spinner}
            size="sm"
            weight="fill"
          />
          <Typography.Text style={subTextStyle}>
            {status === UnstakingStatus.CLAIMABLE ? i18n.inputLabel.withdrawalReady : i18n.inputLabel.waiting}
          </Typography.Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Number
          decimal={decimals}
          decimalOpacity={0.45}
          suffix={symbol}
          value={claimable}
          size={theme.fontSize}
          textStyle={{ ...FontSemiBold }}
        />
        {isSelected && <Icon phosphorIcon={CheckCircle} weight={'fill'} size={'sm'} iconColor={theme.colorSuccess} />}
      </View>
    </TouchableOpacity>
  );
};
