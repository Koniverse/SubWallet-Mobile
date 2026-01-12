import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Icon, Number, Typography } from 'components/design-system-ui';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { FontMedium } from 'styles/sharedStyles';
import { toShort } from 'utils/index';
import { NominationInfo } from '@subwallet/extension-base/background/KoniTypes';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import { CheckCircle, CurrencyCircleDollar } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import StakingNominationItemStyle from './style';
import i18n from 'utils/i18n/i18n';
import { YieldPoolInfo } from '@subwallet/extension-base/types';
import { formatBalance } from 'utils/number';
import { ThemeTypes } from 'styles/themes';
import BigN from 'bignumber.js';

interface Props {
  nominationInfo: NominationInfo;
  isSelected?: boolean;
  isSelectable?: boolean;
  onSelectItem?: (value: string) => void;
  poolInfo: YieldPoolInfo;
  isChangeValidator?: boolean;
}

export const StakingNominationItem = ({
  nominationInfo,
  isSelected,
  onSelectItem,
  poolInfo,
  isSelectable = true,
  isChangeValidator,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyle(theme);
  const _style = StakingNominationItemStyle(theme);
  const { activeStake, chain, validatorAddress, validatorIdentity } = nominationInfo;
  const { decimals, symbol } = useGetNativeTokenBasicInfo(chain);
  const subnetSymbol = poolInfo.metadata.subnetData?.subnetSymbol;

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
        <Typography.Text ellipsis style={_style.nominationNameTextStyle}>
          {validatorIdentity || toShort(validatorAddress)}
        </Typography.Text>

        {isChangeValidator ? (
          <View style={[_style.contentWrapper, { paddingRight: theme.paddingXS }]}>
            <View style={_style.contentWrapper}>
              <Icon
                phosphorIcon={CurrencyCircleDollar}
                iconColor={theme.colorTextTertiary}
                size={'xs'}
                weight={'fill'}
              />
              <Typography.Text style={styles.subTextStyle}>{` : ${
                nominationInfo.commission !== undefined ? `${nominationInfo.commission}%` : 'N/A'
              } -`}</Typography.Text>
              <Typography.Text style={[styles.subTextStyle, { color: theme.colorSuccess }]}>{` APY: ${
                nominationInfo.expectedReturn ? formatBalance(nominationInfo.expectedReturn, 0) : '0'
              }%`}</Typography.Text>
            </View>
            {new BigN(nominationInfo.activeStake).gt(0) && (
              <>
                <Typography.Text style={styles.subTextStyle}>
                  {formatBalance(nominationInfo.activeStake, decimals)}
                </Typography.Text>
                <Typography.Text style={styles.subTextStyle}>{subnetSymbol || symbol}</Typography.Text>
              </>
            )}
          </View>
        ) : (
          <View style={_style.contentWrapper}>
            <Text style={_style.bondedAmountLabelTextStyle}>{i18n.message.bonded}</Text>
            <Number
              decimal={decimals}
              suffix={subnetSymbol || symbol}
              size={12}
              value={activeStake}
              textStyle={{ ...FontMedium }}
              decimalOpacity={0.45}
              intOpacity={0.45}
              unitOpacity={0.45}
            />
          </View>
        )}
      </View>

      {isSelectable && (
        <>
          {isSelected ? (
            <View style={styles.selectedIconWrapper}>
              <Icon phosphorIcon={CheckCircle} iconColor={theme.colorSuccess} size={'sm'} weight={'fill'} />
            </View>
          ) : (
            <View style={styles.selectedIconWrapper} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    subTextStyle: {
      fontSize: theme.fontSizeSM,
      lineHeight: theme.fontSizeSM * theme.lineHeightSM,
      color: theme.colorTextTertiary,
    },
    selectedIconWrapper: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  });
}
