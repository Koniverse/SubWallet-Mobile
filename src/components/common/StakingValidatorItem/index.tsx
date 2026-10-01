import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, Icon, Number } from 'components/design-system-ui';
import { FontMedium } from 'styles/sharedStyles';
import { CheckCircleIcon, DotsThreeIcon, MedalIcon } from 'phosphor-react-native';
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
  onPressRightButton?: (validatorInfo: ValidatorDataType) => void;
  isSelected?: boolean;
  isNominated?: boolean;
  showUnSelectedIcon?: boolean;
  isShowRightBtn?: boolean;
}

const Component = ({
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

  const onPressRight = useCallback(() => {
    onPressRightButton?.(validatorInfo);
  }, [onPressRightButton, validatorInfo]);

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
          {isNominated && <Icon iconColor={theme.colorSuccess} phosphorIcon={MedalIcon} size={'xs'} weight={'fill'} />}
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
            phosphorIcon={CheckCircleIcon}
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
            icon={<Icon phosphorIcon={DotsThreeIcon} size={'sm'} iconColor={theme.colorTextLight4} />}
            onPress={onPressRight}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

/**
 * Memoised: the selector re-renders its whole list on every tap, and each row draws an identicon
 * generated from the address - cheap once, expensive times the number of rows on screen, which
 * grows as the lazy list pages in. With stable props a tap now re-renders only the rows whose
 * isSelected actually changed.
 */
export const StakingValidatorItem = React.memo(Component);
