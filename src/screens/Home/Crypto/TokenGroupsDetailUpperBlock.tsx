import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import ActionButton from 'components/ActionButton';
import i18n from 'utils/i18n/i18n';
import { ArrowFatLineDown, CaretLeft, PaperPlaneTilt, ShoppingCartSimple } from 'phosphor-react-native';
import { SwNumberProps } from 'components/design-system-ui/number';
import { BalancesVisibility } from 'components/BalancesVisibility';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontSemiBold } from 'styles/sharedStyles';
import { getAccountType } from 'utils/index';
import { PREDEFINED_TRANSAK_TOKEN } from '../../../predefined/transak';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { ThemeTypes } from 'styles/themes';

interface Props {
  balanceValue: SwNumberProps['value'];
  tokenGroupSlug: string;
  onClickBack: () => void;
  onOpenSendFund?: () => void;
  onOpenBuyTokens?: () => void;
  onOpenReceive?: () => void;
}

export const TokenGroupsDetailUpperBlock = ({
  onOpenBuyTokens,
  onOpenReceive,
  onOpenSendFund,
  onClickBack,
  balanceValue,
  tokenGroupSlug,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const accounts = useSelector((state: RootState) => state.accountState.accounts);
  const currentAccount = useSelector((state: RootState) => state.accountState.currentAccount);
  const isAllAccount = useSelector((state: RootState) => state.accountState.isAllAccount);
  const assetRegistryMap = useSelector((root: RootState) => root.assetRegistry.assetRegistry);
  const multiChainAssetMap = useSelector((state: RootState) => state.assetRegistry.multiChainAssetMap);
  const _style = createStyleSheet(theme);

  const symbol = useMemo<string>(() => {
    if (tokenGroupSlug) {
      if (multiChainAssetMap[tokenGroupSlug]) {
        return multiChainAssetMap[tokenGroupSlug].symbol;
      }

      if (assetRegistryMap[tokenGroupSlug]) {
        return assetRegistryMap[tokenGroupSlug].symbol;
      }
    }

    return '';
  }, [tokenGroupSlug, assetRegistryMap, multiChainAssetMap]);

  const isSupportBuyTokens = useMemo(() => {
    const transakInfoItems = Object.values(PREDEFINED_TRANSAK_TOKEN);

    for (const infoItem of transakInfoItems) {
      if (infoItem.symbol === symbol) {
        const supportType = infoItem.support;

        if (isAllAccount) {
          for (const account of accounts) {
            if (supportType === getAccountType(account.address)) {
              return true;
            }
          }
        } else {
          if (currentAccount?.address && supportType === getAccountType(currentAccount?.address)) {
            return true;
          }
        }
      }
    }

    return false;
  }, [accounts, currentAccount?.address, isAllAccount, symbol]);

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
            {`${i18n.title.token}: ${symbol}`}
          </Typography.Title>
        </View>
      </View>

      <BalancesVisibility value={balanceValue} startWithSymbol subFloatNumber />

      <View style={[_style.actionButtonWrapper]} pointerEvents="box-none">
        <ActionButton label={i18n.cryptoScreen.receive} icon={ArrowFatLineDown} onPress={onOpenReceive} />
        <ActionButton label={i18n.cryptoScreen.send} icon={PaperPlaneTilt} onPress={onOpenSendFund} />
        <ActionButton
          disabled={!isSupportBuyTokens}
          label={i18n.cryptoScreen.buy}
          icon={ShoppingCartSimple}
          onPress={onOpenBuyTokens}
        />
      </View>
    </View>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createStyleSheet(theme: ThemeTypes) {
  return StyleSheet.create({
    actionButtonWrapper: {
      paddingTop: 36,
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'center',
      paddingBottom: 25,
    },
    containerStyle: {
      height: 220,
      alignItems: 'center',
      marginTop: -2,
      paddingBottom: 2,
      marginBottom: -2,
    },
    topArea: {
      alignSelf: 'stretch',
      flexDirection: 'row',
      alignItems: 'center',
    },
    tokenDisplay: {
      flex: 1,
      flexDirection: 'row',
      marginRight: 40,
      justifyContent: 'center',
    },
  });
}
