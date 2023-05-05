import React from 'react';
import { StyleProp, View, TouchableOpacity } from 'react-native';
import ActionButton from 'components/ActionButton';
import i18n from 'utils/i18n/i18n';
import { ArrowFatLinesDown, Eye, EyeSlash, PaperPlaneTilt, ShoppingCartSimple } from 'phosphor-react-native';
import { SwNumberProps } from 'components/design-system-ui/number';
import { BalancesVisibility } from 'components/BalancesVisibility';
import { Icon, Number, Tag, Typography } from 'components/design-system-ui';
import { FontBold, FontMedium } from 'styles/sharedStyles';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { toggleBalancesVisibility } from 'messaging/index';
import { updateUiSettings } from 'stores/utils';

interface Props {
  totalValue: SwNumberProps['value'];
  totalChangeValue: SwNumberProps['value'];
  totalChangePercent: SwNumberProps['value'];
  isPriceDecrease: boolean;
  onOpenSendFund?: () => void;
  onOpenBuyTokens?: () => void;
  onOpenReceive?: () => void;
}

const actionButtonWrapper: StyleProp<any> = {
  paddingTop: 24,
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'center',
  paddingBottom: 25,
};

const containerStyle: StyleProp<any> = {
  height: 238,
  paddingHorizontal: 16,
  paddingTop: 32,
  alignItems: 'center',
  marginTop: -2,
  paddingBottom: 2,
  marginBottom: -2,
};

export const TokenGroupsUpperBlock = ({
  isPriceDecrease,
  onOpenBuyTokens,
  onOpenReceive,
  onOpenSendFund,
  totalChangePercent,
  totalChangeValue,
  totalValue,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const isShowBalance = useSelector((state: RootState) => state.settings.isShowBalance);
  const _toggleBalances = () => {
    toggleBalancesVisibility(v => {
      updateUiSettings(v);
    });
  };

  return (
    <View style={containerStyle} pointerEvents="box-none">
      <TouchableOpacity style={{ alignItems: 'center' }} onPress={_toggleBalances}>
        <BalancesVisibility value={totalValue} startWithSymbol subFloatNumber />

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
          <View style={{ marginRight: 8 }}>
            <Icon size="md" phosphorIcon={isShowBalance ? Eye : EyeSlash} iconColor={theme.colorTextLight3} />
          </View>
          {isShowBalance && (
            <Number
              size={theme.fontSize}
              textStyle={{
                ...FontMedium,
                lineHeight: theme.fontSize * theme.lineHeight,
                paddingBottom: theme.paddingXXS / 2,
              }}
              decimal={0}
              value={totalChangeValue}
              prefix={isPriceDecrease ? '- $' : '+ $'}
            />
          )}

          {!isShowBalance && (
            <Typography.Text
              style={{
                fontSize: theme.fontSize,
                lineHeight: theme.fontSize * theme.lineHeight,
                ...FontMedium,
                color: theme.colorTextLight1,
              }}>
              {'******'}
            </Typography.Text>
          )}

          <Tag style={{ marginLeft: 8 }} color={isPriceDecrease ? 'error' : 'success'} shape={'round'} closable={false}>
            <>
              {isShowBalance && (
                <Number
                  textStyle={{ ...FontBold, lineHeight: 18 }}
                  size={10}
                  value={totalChangePercent}
                  decimal={0}
                  prefix={isPriceDecrease ? '- ' : '+ '}
                  suffix={'%'}
                />
              )}

              {!isShowBalance && (
                <Typography.Text
                  style={{
                    ...FontMedium,
                    lineHeight: 18,
                    fontSize: 10,
                    color: theme.colorTextLight1,
                  }}>
                  {'******'}
                </Typography.Text>
              )}
            </>
          </Tag>
        </View>
      </TouchableOpacity>

      <View style={[actionButtonWrapper]} pointerEvents="box-none">
        <ActionButton
          label={i18n.cryptoScreen.receive}
          icon={<Icon weight="duotone" phosphorIcon={ArrowFatLinesDown} />}
          onPress={onOpenReceive}
          buttonWrapperStyle={{ paddingHorizontal: theme.sizeSM }}
        />
        <ActionButton
          label={i18n.cryptoScreen.send}
          icon={<Icon weight="duotone" phosphorIcon={PaperPlaneTilt} />}
          onPress={onOpenSendFund}
          buttonWrapperStyle={{ paddingHorizontal: theme.sizeSM }}
        />
        <ActionButton
          label={i18n.cryptoScreen.buy}
          icon={<Icon weight="duotone" phosphorIcon={ShoppingCartSimple} />}
          onPress={onOpenBuyTokens}
          buttonWrapperStyle={{ paddingHorizontal: theme.sizeSM }}
        />
      </View>
    </View>
  );
};
