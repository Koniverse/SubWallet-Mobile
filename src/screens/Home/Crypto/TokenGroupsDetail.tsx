import React, { useCallback, useContext, useMemo, useState } from 'react';
import { ListRenderItemInfo, View } from 'react-native';
import { CryptoNavigationProps, TokenGroupsDetailProps } from 'routes/home';
import { CryptoContext } from 'providers/screen/Home/CryptoContext';
import { SwNumberProps } from 'components/design-system-ui/number';
import { TokenBalanceItemType } from 'types/balance';
import { ScreenContainer } from 'components/ScreenContainer';
import { Header } from 'components/Header';
import { TokensLayout } from 'screens/Home/Crypto/shared/TokensLayout';
import { itemWrapperStyle } from 'screens/Home/Crypto/layers/shared';
import { TokenBalanceItem } from 'components/common/TokenBalanceItem';
import { TokenGroupsDetailUpperBlock } from 'screens/Home/Crypto/TokenGroupsDetailUpperBlock';
import { useNavigation } from '@react-navigation/native';
import { TokenDetailModal } from 'screens/Home/Crypto/TokenDetailModal';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

type CurrentSelectToken = {
  symbol: string;
  slug: string;
};

export const TokenGroupsDetail = ({
  route: {
    params: { slug: tokenGroupSlug },
  },
}: TokenGroupsDetailProps) => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<CryptoNavigationProps>();
  const [currentTokenInfo, setCurrentTokenInfo] = useState<CurrentSelectToken | undefined>(undefined);
  const [tokenDetailVisible, setTokenDetailVisible] = useState<boolean>(false);

  const {
    accountBalance: { tokenBalanceMap, tokenGroupBalanceMap },
    tokenGroupStructure: { tokenGroupMap },
  } = useContext(CryptoContext);

  const tokenBalanceValue = useMemo<SwNumberProps['value']>(() => {
    if (tokenGroupSlug) {
      if (tokenGroupBalanceMap[tokenGroupSlug]) {
        return tokenGroupBalanceMap[tokenGroupSlug].total.convertedValue;
      }

      if (tokenBalanceMap[tokenGroupSlug]) {
        return tokenBalanceMap[tokenGroupSlug].total.convertedValue;
      }
    }

    return '0';
  }, [tokenGroupSlug, tokenBalanceMap, tokenGroupBalanceMap]);

  const tokenBalanceItems = useMemo<TokenBalanceItemType[]>(() => {
    if (tokenGroupSlug) {
      if (tokenGroupMap[tokenGroupSlug]) {
        const items: TokenBalanceItemType[] = [];

        tokenGroupMap[tokenGroupSlug].forEach(tokenSlug => {
          if (tokenBalanceMap[tokenSlug]) {
            items.push(tokenBalanceMap[tokenSlug]);
          }
        });

        return items;
      }

      if (tokenBalanceMap[tokenGroupSlug]) {
        return [tokenBalanceMap[tokenGroupSlug]];
      }
    }

    return [] as TokenBalanceItemType[];
  }, [tokenGroupSlug, tokenGroupMap, tokenBalanceMap]);

  const onClickItem = useCallback((item: TokenBalanceItemType) => {
    return () => {
      setCurrentTokenInfo({
        slug: item.slug,
        symbol: item.symbol,
      });
      setTokenDetailVisible(true);
    };
  }, []);

  const onClickBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const listHeaderNode = useMemo(() => {
    return (
      <TokenGroupsDetailUpperBlock
        balanceValue={tokenBalanceValue}
        onClickBack={onClickBack}
        tokenGroupSlug={tokenGroupSlug}
      />
    );
  }, [onClickBack, tokenGroupSlug, tokenBalanceValue]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<TokenBalanceItemType>) => (
      <View key={item.slug} style={[itemWrapperStyle, { backgroundColor: theme.colorBgSecondary }]}>
        <TokenBalanceItem onPress={onClickItem(item)} {...item} />
      </View>
    ),
    [onClickItem, theme.colorBgSecondary],
  );

  const onCloseTokenDetailModal = useCallback(() => {
    setTokenDetailVisible(false);
    setCurrentTokenInfo(undefined);
  }, []);

  return (
    <ScreenContainer>
      <>
        <Header />

        <TokensLayout items={tokenBalanceItems} layoutHeader={listHeaderNode} renderItem={renderItem} />

        <TokenDetailModal
          currentTokenInfo={currentTokenInfo}
          tokenBalanceMap={tokenBalanceMap}
          modalVisible={tokenDetailVisible}
          onChangeModalVisible={onCloseTokenDetailModal}
        />
      </>
    </ScreenContainer>
  );
};
