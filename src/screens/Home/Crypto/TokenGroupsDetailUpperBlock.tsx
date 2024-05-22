import React, { useCallback, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import ActionButton from 'components/ActionButton';
import i18n from 'utils/i18n/i18n';
import { CaretLeft } from 'phosphor-react-native';
import { SwNumberProps } from 'components/design-system-ui/number';
import { BalancesVisibility } from 'components/BalancesVisibility';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontSemiBold } from 'styles/sharedStyles';
import { getAccountType } from 'utils/index';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { ThemeTypes } from 'styles/themes';
import { ButtonIcon } from 'screens/Home/Crypto/shared/Button';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { isAccountAll } from 'utils/accountAll';
import { BuyTokenInfo } from 'types/buy';
import { useShowBuyToken } from 'hooks/static-content/useShowBuyToken';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { _isChainEvmCompatible } from '@subwallet/extension-base/services/chain-service/utils';

interface Props {
  balanceValue: SwNumberProps['value'];
  groupSymbol: string;
  tokenGroupSlug: string;
  tokenGroupMap: Record<string, string[]>;
  onClickBack: () => void;
  onOpenSendFund?: () => void;
  onOpenReceive?: () => void;
  onOpenSwap?: () => void;
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
}: Props) => {
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const accounts = useSelector((state: RootState) => state.accountState.accounts);
  const { currencyData } = useSelector((state: RootState) => state.price);
  const { currentAccount, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const { assetRegistry: assetRegistryMap } = useSelector((state: RootState) => state.assetRegistry);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const swapPairs = useSelector((state: RootState) => state.swap.swapPairs);
  const { isShowBuyToken } = useShowBuyToken();
  const { tokens } = useSelector((state: RootState) => state.buyService);
  const _style = createStyleSheet(theme);
  const swapTokenMap = useMemo<Record<string, string[]>>(() => {
    const result: Record<string, string[]> = {};

    swapPairs.forEach(pair => {
      if (!result[pair.from]) {
        result[pair.from] = [pair.to];
      } else {
        result[pair.from].push(pair.to);
      }
    });

    return result;
  }, [swapPairs]);

  const swapInfos = useMemo(() => {
    return Object.keys(swapTokenMap)
      .map(tokenSlug => assetRegistryMap[tokenSlug])
      .filter(item => {
        if (item.originChain === 'hydradx_main' && Platform.OS === 'android') {
          return false;
        }
        const chainInfo = chainInfoMap[item.originChain];
        if (isAllAccount) {
          const isAnyValidAccount = accounts.filter(
            _item =>
              !isAccountAll(_item.address) && isEthereumAddress(_item.address) === _isChainEvmCompatible(chainInfo),
          );
          return isAnyValidAccount.length && (item.slug === tokenGroupSlug || item.multiChainAsset === tokenGroupSlug);
        } else {
          return (
            currentAccount &&
            isEthereumAddress(currentAccount.address) === _isChainEvmCompatible(chainInfo) &&
            (item.slug === tokenGroupSlug || item.multiChainAsset === tokenGroupSlug)
          );
        }
      });
  }, [accounts, assetRegistryMap, chainInfoMap, currentAccount, isAllAccount, swapTokenMap, tokenGroupSlug]);

  const buyInfos = useMemo(() => {
    const groupSlug = tokenGroupSlug || '';
    const slugsMap = tokenGroupMap[groupSlug] ? tokenGroupMap[groupSlug] : [groupSlug];
    const result: BuyTokenInfo[] = [];

    for (const [slug, buyInfo] of Object.entries(tokens)) {
      if (slugsMap.includes(slug)) {
        const supportType = buyInfo.support;

        if (isAccountAll(currentAccount?.address || '')) {
          const support = accounts.some(account => supportType === getAccountType(account.address));

          if (support) {
            result.push(buyInfo);
          }
        } else {
          if (currentAccount?.address && supportType === getAccountType(currentAccount?.address)) {
            result.push(buyInfo);
          }
        }
      }
    }

    return result;
  }, [accounts, currentAccount?.address, tokenGroupMap, tokenGroupSlug, tokens]);

  const onOpenBuyTokens = useCallback(() => {
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

  return (
    <View style={_style.containerStyle} pointerEvents="box-none">
      <View style={_style.topArea}>
        <Button
          type="ghost"
          size="xs"
          icon={<Icon size="md" phosphorIcon={CaretLeft} iconColor={theme.colorTextLight1} />}
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
        <ActionButton
          icon={ButtonIcon.Receive}
          onPress={onOpenReceive}
          buttonWrapperStyle={{ paddingHorizontal: theme.paddingSM - 1 }}
        />
        <ActionButton
          icon={ButtonIcon.SendFund}
          onPress={onOpenSendFund}
          buttonWrapperStyle={{ paddingHorizontal: theme.paddingSM - 1 }}
        />
        {isShowBuyToken && (
          <ActionButton
            icon={ButtonIcon.Swap}
            onPress={onOpenSwap}
            buttonWrapperStyle={{ paddingHorizontal: theme.paddingSM - 1 }}
            disabled={!swapInfos.length}
          />
        )}
        {isShowBuyToken && (
          <ActionButton
            icon={ButtonIcon.Buy}
            onPress={onOpenBuyTokens}
            buttonWrapperStyle={{ paddingHorizontal: theme.paddingSM - 1 }}
            disabled={!buyInfos.length}
          />
        )}
      </View>
    </View>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createStyleSheet(theme: ThemeTypes) {
  return StyleSheet.create({
    actionButtonWrapper: {
      paddingTop: 24,
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
      paddingBottom: 16,
    },
    tokenDisplay: {
      flex: 1,
      flexDirection: 'row',
      marginRight: 40,
      justifyContent: 'center',
    },
  });
}
