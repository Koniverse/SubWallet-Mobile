import React, { useCallback, useState } from 'react';
import { Platform, StatusBar, TouchableOpacity, View } from 'react-native';
import { Icon, Number, Typography } from 'components/design-system-ui';
import BigN from 'bignumber.js';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontMedium } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import Tooltip from 'react-native-walkthrough-tooltip';
import { SlippageType } from '@subwallet/extension-base/types/swap';
import { PencilSimpleLine } from 'phosphor-react-native';
import { SlippageModal } from 'components/Modal/Swap/SlippageModal';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';

interface Props {
  label?: string;
  bondedBalance?: string | number | BigN;
  decimals: number;
  symbol: string;
  maxSlippage?: SlippageType;
  setMaxSlippage: (slippage: SlippageType) => void;
  isSlippageAcceptable?: boolean;
  isSubnetStaking?: boolean;
}

export const BondedBalance = ({
  label,
  bondedBalance,
  decimals,
  symbol,
  isSubnetStaking,
  maxSlippage,
  setMaxSlippage,
  isSlippageAcceptable,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [slippageModalVisible, setSlippageModalVisible] = useState(false);

  // For subnet staking
  const onSelectSlippage = useCallback(
    (slippage: SlippageType) => {
      setMaxSlippage(slippage);
    },
    [setMaxSlippage],
  );

  const onOpenSlippageModal = useCallback(() => {
    setSlippageModalVisible(true);
  }, []);

  const slippageValue = maxSlippage || { slippage: new BigN(0.005), isCustomType: true };
  // For subnet staking

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Number
          decimal={decimals}
          decimalColor={theme['gray-5']}
          intColor={theme['gray-5']}
          size={14}
          suffix={symbol}
          unitColor={theme['gray-5']}
          value={bondedBalance || 0}
          textStyle={{ ...FontMedium }}
        />
        <Typography.Text
          style={{
            fontSize: theme.fontSize,
            lineHeight: theme.fontSize * theme.lineHeight,
            ...FontMedium,
            color: theme['gray-5'],
            paddingLeft: theme.paddingXXS,
          }}>
          {label || i18n.stakingScreen.bonded}
        </Typography.Text>
      </View>

      {isSubnetStaking && (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.sizeXXS }}>
            <Tooltip
              isVisible={tooltipVisible}
              disableShadow={true}
              placement={'top'}
              displayInsets={{ right: 0, top: 0, bottom: 0, left: 0 }}
              showChildInTooltip={false}
              topAdjustment={Platform.OS === 'android' ? (StatusBar.currentHeight ? -StatusBar.currentHeight : 0) : 0}
              contentStyle={{ backgroundColor: theme.colorBgSpotlight, borderRadius: theme.borderRadiusLG }}
              closeOnBackgroundInteraction={true}
              onClose={() => setTooltipVisible(false)}
              content={
                <Typography.Text size={'sm'} style={{ color: theme.colorWhite, textAlign: 'center' }}>
                  {'Transaction will not be executed if the price changes more than this slippage'}
                </Typography.Text>
              }>
              <TouchableOpacity onPress={() => setTooltipVisible(true)} activeOpacity={BUTTON_ACTIVE_OPACITY}>
                <Typography.Text style={{ color: theme['gray-5'] }}>{'Slippage:'}</Typography.Text>
              </TouchableOpacity>
            </Tooltip>

            <TouchableOpacity
              activeOpacity={BUTTON_ACTIVE_OPACITY}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: theme.sizeXXS,
              }}
              onPress={onOpenSlippageModal}>
              <Number
                value={maxSlippage ? maxSlippage.slippage.toNumber() * 100 : 0}
                decimal={0}
                decimalColor={isSlippageAcceptable ? theme['gray-5'] : theme.colorError}
                intColor={isSlippageAcceptable ? theme['gray-5'] : theme.colorError}
                size={14}
                suffix={'%'}
                unitColor={isSlippageAcceptable ? theme['gray-5'] : theme.colorError}
              />

              <Icon phosphorIcon={PencilSimpleLine} iconColor={theme['gray-5']} size={'xs'} />
            </TouchableOpacity>
          </View>

          <SlippageModal
            slippageValue={slippageValue}
            setModalVisible={setSlippageModalVisible}
            modalVisible={slippageModalVisible}
            onApplySlippage={onSelectSlippage}
          />
        </>
      )}
    </View>
  );
};
