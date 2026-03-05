import React, { useCallback, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import ActionButton from 'components/ActionButton';
import i18n from 'utils/i18n/i18n';
import { Eye, EyeSlash } from 'phosphor-react-native';
import { SwNumberProps } from 'components/design-system-ui/number';
import { BalancesVisibility } from 'components/BalancesVisibility';
import { Icon, Number, Tag, Typography } from 'components/design-system-ui';
import { FontBold, FontMedium } from 'styles/sharedStyles';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { toggleBalancesVisibility } from 'messaging/index';
import { ButtonIcon } from 'screens/Home/Crypto/shared/Button';
import { updateToggleBalance } from 'stores/base/Settings';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { useShowBuyToken } from 'hooks/static-content/useShowBuyToken';
import useGetChainSlugsByCurrentAccountProxy from 'hooks/chain/useGetChainSlugsByCurrentAccountProxy';
import { ThemeTypes } from 'styles/themes';
import { VoidFunction } from 'types/index';

interface Props {
  totalValue: SwNumberProps['value'];
  totalChangeValue: SwNumberProps['value'];
  totalChangePercent: SwNumberProps['value'];
  isPriceDecrease: boolean;
  onOpenSendFund?: () => void;
  onOpenReceive?: () => void;
  onOpenSwap?: () => void;
  isSwapSupported?: boolean;
}

export type ActionBtn = {
  label?: string;
  icon: (color: string) => React.JSX.Element;
  onPress?: VoidFunction;
  disabled?: boolean;
};

export const TokenGroupsUpperBlock = ({
  isPriceDecrease,
  onOpenReceive,
  onOpenSendFund,
  onOpenSwap,
  totalChangePercent,
  totalChangeValue,
  totalValue,
  isSwapSupported,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyles(theme);
  const navigation = useNavigation<RootNavigationProps>();
  const isShowBalance = useSelector((state: RootState) => state.settings.isShowBalance);
  const buyTokenInfos = useSelector((state: RootState) => state.buyService.tokens);
  const { currencyData } = useSelector((state: RootState) => state.price);
  const allowedChains = useGetChainSlugsByCurrentAccountProxy();
  const { isShowBuyToken } = useShowBuyToken();
  const _toggleBalances = () => {
    updateToggleBalance();
    toggleBalancesVisibility().catch(console.log);
  };

  const isSupportBuyTokens = useMemo(() => {
    return Object.values(buyTokenInfos).some(item => allowedChains.includes(item.network));
  }, [allowedChains, buyTokenInfos]);

  const openBuyTokens = useCallback(
    () => navigation.navigate('Drawer', { screen: 'BuyToken', params: {} }),
    [navigation],
  );

  const actionBtnList = useMemo((): ActionBtn[] => {
    const result: ActionBtn[] = [
      {
        label: i18n.cryptoScreen.address,
        icon: ButtonIcon.Receive,
        onPress: onOpenReceive,
      },
      {
        label: i18n.cryptoScreen.send,
        icon: ButtonIcon.SendFund,
        onPress: onOpenSendFund,
      },
    ];

    if (isShowBuyToken) {
      result.push(
        {
          label: i18n.cryptoScreen.swap,
          icon: ButtonIcon.Swap,
          onPress: onOpenSwap,
          disabled: !isSwapSupported,
        },
        {
          label: i18n.cryptoScreen.buy,
          icon: ButtonIcon.Buy,
          onPress: openBuyTokens,
          disabled: !isSupportBuyTokens,
        },
      );
    }

    return result;
  }, [isShowBuyToken, isSupportBuyTokens, isSwapSupported, onOpenReceive, onOpenSendFund, onOpenSwap, openBuyTokens]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity style={styles.balanceArea} onPress={_toggleBalances}>
        <BalancesVisibility value={totalValue} subFloatNumber symbol={currencyData.symbol} />

        <View style={styles.convertedBalanceArea}>
          <View style={{ marginRight: 8 }}>
            <Icon size="md" phosphorIcon={isShowBalance ? Eye : EyeSlash} iconColor={theme['gray-5']} weight={'bold'} />
          </View>
          {isShowBalance && (
            <Number
              size={theme.fontSize}
              textStyle={styles.totalChangeValueVisibleText}
              decimal={0}
              value={totalChangeValue}
              prefix={isPriceDecrease ? `- ${currencyData.symbol}` : `+ ${currencyData.symbol}`}
            />
          )}

          {!isShowBalance && (
            <Typography.Text style={styles.totalChangeValueNotVisibleText}>{'******'}</Typography.Text>
          )}

          <Tag style={styles.tagStyle} color={isPriceDecrease ? 'error' : 'success'} shape={'round'} closable={false}>
            <>
              {isShowBalance && (
                <Number
                  textStyle={styles.totalChangePercentVisibleText}
                  size={10}
                  value={totalChangePercent}
                  decimal={0}
                  prefix={isPriceDecrease ? '- ' : '+ '}
                  suffix={'%'}
                />
              )}

              {!isShowBalance && (
                <Typography.Text style={styles.totalChangePercentNotVisibleText}>{'******'}</Typography.Text>
              )}
            </>
          </Tag>
        </View>
      </TouchableOpacity>

      <View style={styles.actionButtonWrapper} pointerEvents="box-none">
        {actionBtnList.map(({ label, icon, onPress, disabled }) => (
          <ActionButton
            label={label}
            icon={icon}
            onPress={onPress}
            disabled={disabled}
            buttonWrapperStyle={styles.actionBtn}
          />
        ))}
      </View>
    </View>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      height: 238,
      paddingHorizontal: theme.padding,
      paddingTop: theme.paddingXL,
      alignItems: 'center',
      marginTop: -2,
      paddingBottom: 2,
      marginBottom: -2,
    },
    balanceArea: { alignItems: 'center', paddingTop: theme.paddingSM - 2 },
    convertedBalanceArea: { flexDirection: 'row', alignItems: 'center', height: 40 },
    eyeIconWrapper: { marginRight: theme.marginXS },
    tagStyle: { marginLeft: theme.marginXS, height: 22 },
    totalChangePercentVisibleText: { ...FontBold, lineHeight: 18 },
    totalChangePercentNotVisibleText: {
      ...FontMedium,
      lineHeight: 18,
      fontSize: 10,
      color: theme.colorTextLight1,
    },
    totalChangeValueVisibleText: {
      ...FontMedium,
      lineHeight: theme.fontSize * theme.lineHeight,
      paddingBottom: theme.paddingXXS / 2,
    },
    totalChangeValueNotVisibleText: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      ...FontMedium,
      color: theme.colorTextLight1,
    },
    actionButtonWrapper: {
      paddingTop: theme.padding,
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'center',
      paddingBottom: theme.paddingLG,
    },
    actionBtn: { paddingHorizontal: theme.paddingSM - 1 },
  });
}
