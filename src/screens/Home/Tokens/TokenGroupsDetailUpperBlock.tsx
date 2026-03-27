import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import ActionButton from 'components/ActionButton';
import i18n from 'utils/i18n/i18n';
import { CaretLeftIcon } from 'phosphor-react-native';
import { SwNumberProps } from 'components/design-system-ui/number';
import { BalancesVisibility } from 'components/BalancesVisibility';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontSemiBold } from 'styles/sharedStyles';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { ThemeTypes } from 'styles/themes';
import { ButtonIcon } from 'screens/Home/Tokens/shared/Button';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { useShowBuyToken } from 'hooks/static-content/useShowBuyToken';
import { BuyTokenInfo } from '@subwallet/extension-base/types';
import { ActionBtn } from 'screens/Home/Tokens/TokenGroupsUpperBlock';
import useGetChainAndExcludedTokenByCurrentAccountProxy from 'hooks/chain/useGetChainAndExcludedTokenByCurrentAccountProxy';

interface Props {
  balanceValue: SwNumberProps['value'];
  groupSymbol: string;
  tokenGroupSlug: string;
  tokenGroupMap: Record<string, string[]>;
  onClickBack: () => void;
  onOpenSendFund?: () => void;
  onOpenReceive?: () => void;
  onOpenSwap?: () => void;
  isSwapSupported?: boolean;
  isSupportSendFund?: boolean;
}

export const TokenGroupsDetailUpperBlock = ({
  onOpenReceive,
  onOpenSendFund,
  onOpenSwap,
  onClickBack,
  balanceValue,
  groupSymbol,
  tokenGroupSlug,
  tokenGroupMap,
  isSwapSupported,
  isSupportSendFund,
}: Props) => {
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const { currencyData } = useSelector((state: RootState) => state.price);
  const { isShowBuyToken } = useShowBuyToken();
  const { tokens } = useSelector((state: RootState) => state.buyService);
  const _style = createStyleSheet(theme);
  const { allowedChains, excludedTokens } = useGetChainAndExcludedTokenByCurrentAccountProxy();

  const buyInfos = useMemo(() => {
    const slug = tokenGroupSlug || '';
    const slugs = tokenGroupMap[slug] ? tokenGroupMap[slug] : [slug];
    const result: BuyTokenInfo[] = [];

    Object.values(tokens).forEach(item => {
      if (!allowedChains.includes(item.network) || !slugs.includes(item.slug) || excludedTokens.includes(item.slug)) {
        return;
      }

      result.push(item);
    });

    return result;
  }, [allowedChains, excludedTokens, tokenGroupMap, tokenGroupSlug, tokens]);

  const openBuyTokens = useCallback(() => {
    let symbol = '';

    if (buyInfos.length) {
      if (buyInfos.length === 1) {
        symbol = buyInfos[0].slug;
      } else {
        symbol = buyInfos[0].symbol;
      }
    }

    navigation.navigate('Drawer', {
      screen: 'BuyToken',
      params: { symbol },
    });
  }, [buyInfos, navigation]);

  const actionBtnList = useMemo((): ActionBtn[] => {
    const result: ActionBtn[] = [
      {
        icon: ButtonIcon.Receive,
        onPress: onOpenReceive,
      },
      {
        icon: ButtonIcon.SendFund,
        onPress: onOpenSendFund,
        disabled: !isSupportSendFund,
      },
    ];

    if (isShowBuyToken) {
      result.push(
        {
          icon: ButtonIcon.Swap,
          onPress: onOpenSwap,
          disabled: !isSwapSupported,
        },
        {
          icon: ButtonIcon.Buy,
          onPress: openBuyTokens,
          disabled: !buyInfos.length,
        },
      );
    }

    return result;
  }, [
    buyInfos.length,
    isShowBuyToken,
    isSupportSendFund,
    isSwapSupported,
    onOpenReceive,
    onOpenSendFund,
    onOpenSwap,
    openBuyTokens,
  ]);

  return (
    <View style={_style.containerStyle} pointerEvents="box-none">
      <View style={_style.topArea}>
        <Button
          type="ghost"
          size="xs"
          icon={<Icon size="md" phosphorIcon={CaretLeftIcon} iconColor={theme.colorTextLight1} />}
          onPress={onClickBack}
        />
        <View style={_style.tokenDisplay}>
          <Typography.Title level={4} style={{ color: theme.colorTextLight1, ...FontSemiBold }}>
            {`${i18n.title.token}: ${groupSymbol}`}
          </Typography.Title>
        </View>
      </View>

      <BalancesVisibility value={balanceValue} symbol={currencyData.symbol} subFloatNumber />

      <View style={[_style.actionButtonWrapper]} pointerEvents="box-none">
        {actionBtnList.map(({ label, icon, onPress, disabled }) => (
          <ActionButton
            label={label}
            icon={icon}
            onPress={onPress}
            disabled={disabled}
            buttonWrapperStyle={_style.actionBtn}
          />
        ))}
      </View>
    </View>
  );
};

function createStyleSheet(theme: ThemeTypes) {
  return StyleSheet.create({
    actionButtonWrapper: {
      paddingTop: 16,
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'center',
    },
    containerStyle: {
      height: 214,
      alignItems: 'center',
      paddingBottom: 2,
      marginLeft: -8,
      marginRight: -8,
    },
    topArea: {
      alignSelf: 'stretch',
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 16,
      paddingBottom: 24,
    },
    tokenDisplay: {
      flex: 1,
      flexDirection: 'row',
      marginRight: 40,
      justifyContent: 'center',
    },
    actionBtn: { paddingHorizontal: theme.paddingSM - 1 },
  });
}
