import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, Icon, Number } from 'components/design-system-ui';
import { FontMedium } from 'styles/sharedStyles';
import { CheckCircle, DotsThree, Medal } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import StakingValidatorItemStyle from './style';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { toShort } from 'utils/index';
import { getValidatorKey } from 'utils/transaction/stake';
import i18n from 'utils/i18n/i18n';
import { ValidatorDataType } from 'types/earning';
import { formatBalance } from 'utils/number';

interface Props {
  apy: string;
  validatorInfo: ValidatorDataType;
  onPress?: (changeVal: string) => void;
  onPressRightButton?: () => void;
  isSelected?: boolean;
  isNominated?: boolean;
  showUnSelectedIcon?: boolean;
  isShowRightBtn?: boolean;
}

export const StakingValidatorItem = ({
  apy,
  validatorInfo,
  onPress,
  onPressRightButton,
  isNominated,
  isSelected,
  showUnSelectedIcon = true,
  isShowRightBtn = true,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = StakingValidatorItemStyle(theme);
  const { address, identity, commission, isMissingInfo } = validatorInfo;
  const onPressItem = useCallback(() => {
    onPress && onPress(getValidatorKey(address, identity));
  }, [address, identity, onPress]);

  return (
    <TouchableOpacity style={_style.container} onPress={onPressItem}>
      <View style={_style.avatarWrapper}>
        <Avatar value={address} size={32} theme={isEthereumAddress(address) ? 'ethereum' : 'polkadot'} />
      </View>

      <View style={{ flex: 1 }}>
        <View style={_style.contentWrapper}>
          <Text numberOfLines={1} style={_style.validatorNameTextStyle}>
            {identity || toShort(address)}
          </Text>
          {isNominated && <Icon iconColor={theme.colorSuccess} phosphorIcon={Medal} size={'xs'} weight={'fill'} />}
        </View>

        <View style={_style.contentWrapper}>
          <Text style={_style.subTextStyle}>{`${i18n.formatString(
            i18n.message.commission,
            isMissingInfo ? 'N/A' : commission,
          )}`}</Text>

          {apy !== '0' && (
            <>
              <Text style={_style.subTextStyle}>{' - '}</Text>
              <Text style={[_style.subTextStyle, { color: theme.colorSecondary }]}>{i18n.message.apy}</Text>
              <Number
                decimal={0}
                suffix="%"
                size={12}
                value={formatBalance(apy, 0) || '0'}
                textStyle={{ ...FontMedium, color: theme.colorSecondary }}
                unitColor={theme.colorSecondary}
              />
            </>
          )}
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {(showUnSelectedIcon || isSelected) && (
          <Icon
            phosphorIcon={CheckCircle}
            size={'sm'}
            weight={'fill'}
            iconColor={isSelected ? theme.colorSuccess : theme.colorTextLight4}
          />
        )}
        {isShowRightBtn && (
          <Button
            style={{ marginLeft: 10 }}
            type={'ghost'}
            size={'xs'}
            icon={<Icon phosphorIcon={DotsThree} size={'sm'} iconColor={theme.colorTextLight4} />}
            onPress={onPressRightButton}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};
