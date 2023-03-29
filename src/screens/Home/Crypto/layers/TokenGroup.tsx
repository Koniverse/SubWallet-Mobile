import { ScreenContainer } from 'components/ScreenContainer';
import React, { useState } from 'react';
import { Header } from 'components/Header';
import { SubHeader } from 'components/SubHeader';
import { ColorMap } from 'styles/color';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
import { isItemAllowedToShow, itemWrapperStyle } from 'screens/Home/Crypto/layers/shared';
import { TokensTab } from 'screens/Home/Crypto/tabs/TokensTab';
import { AccountType } from 'types/ui-types';
import { ListRenderItemInfo, StyleProp, View } from 'react-native';
import TabsContainerHeader from 'screens/Home/Crypto/TabsContainerHeader';
import { getTokenDisplayName } from 'utils/chainBalances';
import { useRefresh } from 'hooks/useRefresh';
import { restartSubscriptionServices, toggleBalancesVisibility } from '../../../../messaging';
import { Button, Icon, Typography } from 'components/design-system-ui';
import {EyeSlash, FadersHorizontal, Heart, MagnifyingGlass} from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontSemiBold } from 'styles/sharedStyles';
import { TokenBalanceItemType } from 'types/balance';
import { AccountBalanceHookType } from 'types/hook';
import { TokenGroupBalance } from 'components/common/TokenGroupBalanceItem';
import BackgroundIcon from "../../../../components/design-system-ui/background-icon";

interface Prop {
  tokenGroupBalances: TokenBalanceItemType[];
  totalBalanceInfo: AccountBalanceHookType['totalBalanceInfo'];
  isShowZeroBalance?: boolean;
  accountType: AccountType;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  onPressSearchButton: () => void;
  // accountInfoByNetworkMap: Record<string, AccountInfoByNetwork>;
  // onPressChainItem: (info: AccountInfoByNetwork, balanceInfo: BalanceInfo) => void;
  tokenGroupMap: Record<string, string[]>;
  // // tokenBalanceKeyPriceMap: Record<string, number>;
  // tokenBalanceMap: Record<string, TokenBalanceItemType>;
  // showedNetworks: string[];
  // networkBalanceMap: Record<string, BalanceInfo>;
  // handleChangeTokenItem: (tokenSymbol: string, tokenDisplayName: string, info?: AccountInfoByNetwork) => void;
  // totalBalanceValue: BigN;
}

function getTokenGroupDisplayName(tgKey: string) {
  const [symbol] = tgKey.split('|');
  return getTokenDisplayName(symbol.toUpperCase());
}

// function getBalanceValue(
//   isGroupDetail: boolean,
//   currentTgKey: string,
//   totalBalanceValue: BigN,
//   tokenGroupMap: Record<string, string[]>,
//   tokenBalanceMap: Record<string, TokenBalanceItemType>,
// ): BigN {
//   if (!isGroupDetail) {
//     return totalBalanceValue;
//   }
//
//   if (currentTgKey && tokenGroupMap[currentTgKey]) {
//     let result = new BigN(0);
//
//     tokenGroupMap[currentTgKey].forEach(tbKey => {
//       if (tokenBalanceMap[tbKey] && tokenBalanceMap[tbKey].isReady) {
//         result = result.plus(tokenBalanceMap[tbKey].convertedBalanceValue);
//       }
//     });
//
//     return result;
//   }
//
//   return BN_ZERO;
// }

function isEmptyList(
  list: TokenBalanceItemType[],
  accountType: AccountType,
  tokenGroupMap: Record<string, string[]>,
  isShowZeroBalance?: boolean,
) {
  if (!list.length) {
    return true;
  }
  const filteredList = list.filter(item => isItemAllowedToShow(item, accountType, tokenGroupMap, isShowZeroBalance));
  return !filteredList.length;
}

const renderActionsStyle: StyleProp<any> = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
};

const TokenGroupLayer = ({
  tokenGroupBalances,
  totalBalanceInfo,
  navigation,
  onPressSearchButton,
  tokenGroupMap,
  accountType,
  isShowZeroBalance,
}: Prop) => {
  const theme = useSubWalletTheme().swThemes;
  const [isRefresh, refresh] = useRefresh();
  const [currentTgKey, setCurrentTgKey] = useState<string>('');
  const [isGroupDetail, setGroupDetail] = useState<boolean>(false);
  const [refreshTabId, setRefreshTabId] = useState<string>('');
  const isTotalBalanceDecrease = totalBalanceInfo.change.status === 'decrease';
  const onPressBack = () => {
    setCurrentTgKey('');
    setGroupDetail(false);
  };

  // const tokenBalanceItems = useTokenBalanceItems(
  //   isGroupDetail,
  //   currentTgKey,
  //   tokenGroupMap,
  //   tokenBalanceMap,
  //   tokenBalanceKeyPriceMap,
  // );

  // const onPressTokenItem = (item: TokenBalanceItemType, info?: AccountInfoByNetwork) => {
  //   if (isGroupDetail) {
  //     handleChangeTokenItem(item.symbol, item.displayedSymbol, info);
  //   } else {
  //     setCurrentTgKey(item.id);
  //     setGroupDetail(true);
  //   }
  // };

  const renderTokenTabItem = ({ item }: ListRenderItemInfo<TokenBalanceItemType>) => {
    // const info = accountInfoByNetworkMap[item.networkKey];

    if (!isItemAllowedToShow(item, accountType, tokenGroupMap, isShowZeroBalance)) {
      return null;
    }

    return (
      <View key={item.slug} style={[itemWrapperStyle, { backgroundColor: '#252525' }]}>
        <TokenGroupBalance onPress={() => {}} {...item} />
      </View>
    );
  };

  const renderTabContainerHeader = () => {
    return (
      <TabsContainerHeader
        balanceBlockProps={{
          totalChangePercent: totalBalanceInfo.change.percent,
          isPriceDecrease: isTotalBalanceDecrease,
          totalChangeValue: totalBalanceInfo.change.value,
          totalValue: totalBalanceInfo.convertedValue,
        }}
      />
    );
  };

  const _toggleBalances = async () => {
    await toggleBalancesVisibility(v => {
      console.log('Balances visible:', v.isShowBalance);
    });
  };

  const renderActions = () => {
    return (
      <View style={renderActionsStyle}>
        <Typography.Title level={4} style={{ color: theme.colorTextLight1, ...FontSemiBold }}>
          {i18n.settings.tokens}
        </Typography.Title>
        <View style={{ flexDirection: 'row', marginRight: -5 }}>
          <Button
            type="ghost"
            size="xs"
            icon={<Icon size="sm" phosphorIcon={EyeSlash} iconColor={theme.colorTextLight5} />}
            onPress={_toggleBalances}
          />
          <Button
            type="ghost"
            size="xs"
            icon={<Icon size="sm" phosphorIcon={MagnifyingGlass} iconColor={theme.colorTextLight5} />}
            onPress={onPressSearchButton}
          />
          <Button
            type="ghost"
            size="xs"
            icon={<Icon size="sm" phosphorIcon={FadersHorizontal} iconColor={theme.colorTextLight5} />}
          />
        </View>
      </View>
    );
  };

  const _onRefresh = (tabId: string) => {
    setRefreshTabId(tabId);
    refresh(restartSubscriptionServices(['balance']));
  };

  return (
    <ScreenContainer>
      <>
        {!isGroupDetail && <Header navigation={navigation} />}
        {isGroupDetail && (
          <SubHeader
            backgroundColor={ColorMap.dark2}
            onPressBack={onPressBack}
            title={getTokenGroupDisplayName(currentTgKey)}
          />
        )}

        <TokensTab
          renderTabContainerHeader={renderTabContainerHeader}
          items={tokenGroupBalances}
          renderItem={renderTokenTabItem}
          renderActions={renderActions}
          isRefresh={isRefresh}
          refresh={_onRefresh}
          refreshTabId={refreshTabId}
          isEmptyList={isEmptyList(tokenGroupBalances, accountType, tokenGroupMap, isShowZeroBalance)}
        />
      </>
    </ScreenContainer>
  );
};

export default TokenGroupLayer;
