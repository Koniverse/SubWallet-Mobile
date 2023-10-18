import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
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
import { MAP_PREDEFINED_BUY_TOKEN } from 'constants/buy';
import { isAccountAll } from 'utils/accountAll';
import { BuyTokenInfo } from 'types/buy';
import { useShowBuyToken } from 'hooks/screen/Home/Crypto/useShowBuyToken';

interface Props {
  balanceValue: SwNumberProps['value'];
  groupSymbol: string;
  tokenGroupSlug: string;
  tokenGroupMap: Record<string, string[]>;
  onClickBack: () => void;
  onOpenSendFund?: () => void;
  onOpenReceive?: () => void;
}

export const TokenGroupsDetailUpperBlock = ({
  onOpenReceive,
  onOpenSendFund,
  onClickBack,
  balanceValue,
  groupSymbol,
  tokenGroupSlug,
  tokenGroupMap,
}: Props) => {
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const accounts = useSelector((state: RootState) => state.accountState.accounts);
  const currentAccount = useSelector((state: RootState) => state.accountState.currentAccount);
  const isShowBuyToken = useShowBuyToken();

  const _style = createStyleSheet(theme);

  const buyInfos = useMemo(() => {
    const groupSlug = tokenGroupSlug || '';
    const slugsMap = tokenGroupMap[groupSlug] ? tokenGroupMap[groupSlug] : [groupSlug];
    const result: BuyTokenInfo[] = [];

    for (const [slug, buyInfo] of Object.entries(MAP_PREDEFINED_BUY_TOKEN)) {
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
  }, [accounts, currentAccount?.address, tokenGroupMap, tokenGroupSlug]);

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

      <BalancesVisibility value={balanceValue} startWithSymbol subFloatNumber />

      <View style={[_style.actionButtonWrapper]} pointerEvents="box-none">
        <ActionButton
          icon={ButtonIcon.Receive}
          onPress={onOpenReceive}
          buttonWrapperStyle={{ paddingHorizontal: theme.paddingSM }}
        />
        <ActionButton
          icon={ButtonIcon.SendFund}
          onPress={onOpenSendFund}
          buttonWrapperStyle={{ paddingHorizontal: theme.paddingSM }}
        />
        {isShowBuyToken && (
          <ActionButton
            icon={ButtonIcon.Buy}
            onPress={onOpenBuyTokens}
            buttonWrapperStyle={{ paddingHorizontal: theme.paddingSM }}
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
